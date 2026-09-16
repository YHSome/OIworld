import type { SubmissionResult, TestCaseResult } from '../compiler/client';
import { diffOutput, isAccepted } from '../compiler/judge';
import type { RunOutcome, RunStatus, TestCase } from '../types/problem';

export type PythonRuntimePhase = 'idle' | 'loading' | 'ready' | 'failed';
export interface PythonRuntimeStatus { phase: PythonRuntimePhase; message: string; }
type WorkerResult = { type: 'result'; id: number; kind: 'passed' | 'compile-error' | 'runtime-error'; stdout: string; stderr: string; diagnostics: string; durationMs: number };
type Listener = (status: PythonRuntimeStatus) => void;

class PythonCompiler {
  private worker: Worker | null = null;
  private init: Promise<void> | null = null;
  private nextId = 1;
  private pending = new Map<number, { resolve: (result: WorkerResult) => void }>();
  private queue: Promise<unknown> = Promise.resolve();
  private status: PythonRuntimeStatus = { phase: 'idle', message: 'Python 运行环境未加载' };
  private listeners = new Set<Listener>();

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.status);
    return () => { this.listeners.delete(listener); };
  }
  getStatus() { return this.status; }
  private setStatus(status: PythonRuntimeStatus) { this.status = status; this.listeners.forEach((listener) => listener(status)); }

  private ensureReady() {
    if (this.init) return this.init;
    this.setStatus({ phase: 'loading', message: '正在加载 Python 运行环境…' });
    this.worker = new Worker(new URL('./runtime.worker.ts', import.meta.url), { type: 'module', name: 'oiworld-python' });
    const worker = this.worker;
    this.init = new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => { cleanup(); reject(new Error('Python 运行环境加载超时')); }, 30000);
      const cleanup = () => { window.clearTimeout(timer); worker.removeEventListener('message', onMessage); worker.removeEventListener('error', onError); };
      const onError = (event: ErrorEvent) => { cleanup(); reject(new Error(event.message || 'Python Worker 启动失败')); };
      const onMessage = (event: MessageEvent) => {
        const data = event.data as { type?: string; message?: string };
        if (data.type === 'ready') { cleanup(); resolve(); }
        if (data.type === 'init-error') { cleanup(); reject(new Error(data.message || 'Python 运行环境加载失败')); }
      };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      const base = new URL(`${import.meta.env.BASE_URL}python-runtime/`, window.location.origin).href;
      worker.postMessage({ type: 'init', base });
    }).then(() => {
      this.setStatus({ phase: 'ready', message: 'Python 3.12 已就绪（浏览器本地运行）' });
      worker.addEventListener('message', this.handleResult);
    }).catch((error: unknown) => {
      this.worker?.terminate(); this.worker = null; this.init = null;
      this.setStatus({ phase: 'failed', message: `Python 加载失败：${error instanceof Error ? error.message : String(error)}` });
      throw error;
    });
    return this.init;
  }

  private handleResult = (event: MessageEvent<WorkerResult>) => {
    const data = event.data;
    if (data?.type !== 'result') return;
    const pending = this.pending.get(data.id);
    if (pending) { this.pending.delete(data.id); pending.resolve(data); }
  };

  private async execute(code: string, stdin: string): Promise<WorkerResult> {
    await this.ensureReady();
    const task = () => new Promise<WorkerResult>((resolve) => {
      const worker = this.worker;
      if (!worker) { resolve({ type: 'result', id: 0, kind: 'runtime-error', stdout: '', stderr: '', diagnostics: 'Python Worker 不可用。', durationMs: 0 }); return; }
      const id = this.nextId++;
      const timer = window.setTimeout(() => {
        this.pending.delete(id);
        this.worker?.terminate(); this.worker = null; this.init = null;
        this.setStatus({ phase: 'idle', message: 'Python 执行超时，运行环境将在下次执行时重启' });
        resolve({ type: 'result', id, kind: 'runtime-error', stdout: '', stderr: '', diagnostics: '', durationMs: 3000 });
      }, 3000);
      this.pending.set(id, { resolve: (result) => { window.clearTimeout(timer); resolve(result); } });
      worker.postMessage({ type: 'run', id, code, stdin, outputLimit: 65536 });
    });
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => undefined);
    return result;
  }

  async runOnce(code: string, stdin: string): Promise<RunOutcome> {
    const result = await this.execute(code, stdin);
    return { status: result.kind as RunStatus, diagnostics: result.diagnostics, stdout: result.stdout, stderr: result.stderr, exitCode: result.kind === 'passed' ? 0 : null, compileMs: 0, runMs: result.durationMs, message: result.kind === 'runtime-error' ? '程序没有正常结束。' : undefined };
  }

  async submit(code: string, testCases: TestCase[], onCase?: (result: TestCaseResult) => void): Promise<SubmissionResult> {
    const cases: TestCaseResult[] = [];
    for (let index = 0; index < testCases.length; index += 1) {
      const item = testCases[index];
      const run = await this.execute(code, item.input);
      if (run.kind === 'compile-error') {
        return { compileOk: false, diagnostics: run.diagnostics, passed: 0, total: testCases.length, compileMs: 0, cases: testCases.map((testCase, itemIndex) => ({ index: itemIndex, status: 'compile-error' as RunStatus, input: testCase.input, expected: testCase.expected_output, actual: '', stdout: '', stderr: '', diff: null, durationMs: 0 })) };
      }
      const accepted = run.kind === 'passed' && isAccepted(run.stdout, item.expected_output);
      const result: TestCaseResult = { index, status: accepted ? 'passed' : run.kind as RunStatus === 'passed' ? 'wrong-answer' : run.kind as RunStatus, input: item.input, expected: item.expected_output, actual: run.stdout, stdout: run.stdout, stderr: run.stderr, message: run.kind === 'runtime-error' ? run.diagnostics || '程序没有正常结束。' : undefined, diff: accepted ? null : diffOutput(run.stdout, item.expected_output), durationMs: run.durationMs };
      cases.push(result); onCase?.(result);
    }
    return { compileOk: true, diagnostics: '', passed: cases.filter((item) => item.status === 'passed').length, total: testCases.length, compileMs: 0, cases };
  }
}

export const pythonCompiler = new PythonCompiler();
