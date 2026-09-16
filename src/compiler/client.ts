/**
 * 编译器服务（主线程侧）：调度编译 Worker 与运行 Worker，并提供评测编排。
 */

import type {
  CompileWorkerRequest,
  CompileWorkerResponse,
  ToolchainPhase,
} from './protocol';
import {
  preloadToolchain,
  resolveToolchainBase,
  type DownloadProgress,
} from './toolchain';
import { diffOutput, isAccepted, type OutputDiff } from './judge';
import type { RunOutcome, RunStatus, TestCase } from '../types/problem';
import type { RunRequest, RunResponse } from './run.worker';

/**
 * 固定的编译参数。
 *
 * `-fno-exceptions` 是必须的：browsercc 提供的 wasi-sysroot 中 libc++ 是
 * 关闭异常编译的，不加该参数链接时会报
 * `undefined symbol: __cxa_throw / __cxa_allocate_exception`。
 */
export const COMPILE_FLAGS = [
  '-std=c++20',
  '-O0',
  '-Wall',
  '-fno-exceptions',
];
export const SOURCE_FILE_NAME = 'main.cpp';
/** 单次运行的时间上限（毫秒） */
export const RUN_TIMEOUT_MS = 3000;
/** 编译的时间上限（毫秒），仅用于给出提示，不会强杀编译器进程 */
export const COMPILE_TIMEOUT_MS = 120_000;
/** 单个输出流的最大字符数 */
export const OUTPUT_LIMIT = 64_000;

export interface RunOptions {
  timeoutMs?: number;
  outputLimit?: number;
}

export interface CompilerStatus {
  phase: ToolchainPhase;
  message: string;
  /** 工具链基地址 */
  base: string;
  source: 'env' | 'local' | 'cdn' | 'unknown';
  version?: string;
  download: DownloadProgress | null;
}

export interface CompileResult {
  ok: boolean;
  bytes: Uint8Array | null;
  diagnostics: string;
  durationMs: number;
}

export interface TestCaseResult {
  index: number;
  status: RunStatus;
  input: string;
  expected: string;
  actual: string;
  stdout: string;
  stderr: string;
  message?: string;
  diff: OutputDiff | null;
  durationMs: number;
}

export interface SubmissionResult {
  compileOk: boolean;
  diagnostics: string;
  passed: number;
  total: number;
  cases: TestCaseResult[];
  compileMs: number;
}

type StatusListener = (status: CompilerStatus) => void;

function toRunStatus(res: RunResponse): RunStatus {
  switch (res.kind) {
    case 'ok':
      return 'passed';
    case 'runtime-error':
      return 'runtime-error';
    case 'link-error':
      return 'crashed';
    case 'output-limit':
      return 'output-limit';
    default:
      return 'runtime-error';
  }
}

export class CompilerService {
  private worker: Worker | null = null;
  private nextId = 1;
  private pending = new Map<
    number,
    { resolve: (value: CompileResult) => void }
  >();
  private queue: Promise<unknown> = Promise.resolve();
  private listeners = new Set<StatusListener>();
  private readyPromise: Promise<void> | null = null;
  private status: CompilerStatus = {
    phase: 'idle',
    message: '编译器未加载',
    base: '',
    source: 'unknown',
    download: null,
  };

  /* ---------------- 状态订阅 ---------------- */

  getStatus(): CompilerStatus {
    return this.status;
  }

  subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    listener(this.status);
    return () => this.listeners.delete(listener);
  }

  private setStatus(patch: Partial<CompilerStatus>): void {
    this.status = { ...this.status, ...patch };
    for (const listener of this.listeners) listener(this.status);
  }

  /* ---------------- 初始化 ---------------- */

  /** 预加载工具链（展示下载进度）并初始化 Worker 内的 clang / wasm-ld */
  ensureReady(): Promise<void> {
    if (this.readyPromise) return this.readyPromise;
    this.readyPromise = this.doEnsureReady().catch((err: unknown) => {
      this.readyPromise = null;
      const message = err instanceof Error ? err.message : String(err);
      this.setStatus({ phase: 'failed', message: `编译器加载失败：${message}` });
      throw err;
    });
    return this.readyPromise;
  }

  private async doEnsureReady(): Promise<void> {
    if (this.status.phase === 'ready') return;

    this.setStatus({ phase: 'downloading', message: '正在定位编译器资源…' });
    const { base, source, version } = await resolveToolchainBase();
    this.setStatus({ base, source, version });

    await preloadToolchain(base, (download) => {
      this.setStatus({
        phase: 'downloading',
        download,
        message: `正在下载编译器（${download.percent}%）：${download.currentFile}`,
      });
    });

    await this.spawnWorker();
    const worker = this.worker;
    if (!worker) throw new Error('无法创建编译线程');

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        cleanup();
        reject(new Error('编译器初始化超时'));
      }, COMPILE_TIMEOUT_MS);

      const onMessage = (event: MessageEvent) => {
        const data = event.data as CompileWorkerResponse;
        if (!data || typeof data !== 'object') return;
        if (data.type === 'phase') {
          this.setStatus({ phase: data.phase, message: data.message });
        } else if (data.type === 'ready') {
          cleanup();
          resolve();
        } else if (data.type === 'error') {
          cleanup();
          reject(new Error(data.message));
        }
      };
      const onError = (event: ErrorEvent) => {
        cleanup();
        reject(new Error(event.message || '编译线程异常退出'));
      };
      const cleanup = () => {
        window.clearTimeout(timer);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
      };
      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      const request: CompileWorkerRequest = {
        type: 'init',
        base,
        flags: COMPILE_FLAGS,
      };
      worker.postMessage(request);
    });

    this.setStatus({ phase: 'ready', message: '编译器就绪' });
  }

  private async spawnWorker(): Promise<void> {
    if (this.worker) return;
    const worker = new Worker(new URL('./compile.worker.ts', import.meta.url), {
      type: 'module',
      name: 'oiworld-compiler',
    });
    worker.addEventListener('message', (event: MessageEvent) => {
      const data = event.data as CompileWorkerResponse;
      if (data && data.type === 'compile-result') {
        const entry = this.pending.get(data.id);
        if (entry) {
          this.pending.delete(data.id);
          entry.resolve({
            ok: data.ok,
            bytes: data.bytes ?? null,
            diagnostics: data.diagnostics,
            durationMs: data.durationMs,
          });
        }
      } else if (data && data.type === 'error') {
        for (const [, entry] of this.pending) {
          entry.resolve({
            ok: false,
            bytes: null,
            diagnostics: data.message,
            durationMs: 0,
          });
        }
        this.pending.clear();
        this.setStatus({ phase: 'failed', message: data.message });
      }
    });
    worker.addEventListener('error', (event: ErrorEvent) => {
      for (const [, entry] of this.pending) {
        entry.resolve({
          ok: false,
          bytes: null,
          diagnostics: `编译线程崩溃：${event.message}`,
          durationMs: 0,
        });
      }
      this.pending.clear();
      this.worker?.terminate();
      this.worker = null;
      this.readyPromise = null;
      this.setStatus({
        phase: 'failed',
        message: `编译线程崩溃：${event.message}`,
      });
    });
    this.worker = worker;
  }

  /* ---------------- 编译 ---------------- */

  compile(code: string): Promise<CompileResult> {
    const run = async (): Promise<CompileResult> => {
      await this.ensureReady();
      const worker = this.worker;
      if (!worker) {
        return {
          ok: false,
          bytes: null,
          diagnostics: '编译线程不可用',
          durationMs: 0,
        };
      }
      const id = this.nextId;
      this.nextId += 1;
      return new Promise<CompileResult>((resolve) => {
        this.pending.set(id, { resolve });
        const request: CompileWorkerRequest = {
          type: 'compile',
          id,
          code,
          fileName: SOURCE_FILE_NAME,
        };
        worker.postMessage(request);
      });
    };

    // 串行化：编译 Worker 内部是单线程的 clang 实例
    const task = this.queue.then(run, run);
    this.queue = task.catch(() => undefined);
    return task;
  }

  /* ---------------- 运行 ---------------- */

  /** 在全新 Worker（全新 Wasm 沙箱）中运行编译产物，超时直接强杀 */
  run(
    bytes: Uint8Array,
    stdin: string,
    options: RunOptions = {},
  ): Promise<RunResponse> {
    const timeoutMs = options.timeoutMs ?? RUN_TIMEOUT_MS;
    const outputLimit = options.outputLimit ?? OUTPUT_LIMIT;
    return new Promise<RunResponse>((resolve) => {
      const worker = new Worker(new URL('./run.worker.ts', import.meta.url), {
        type: 'module',
        name: 'oiworld-run',
      });
      let settled = false;
      const started = performance.now();

      const finish = (response: RunResponse) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        worker.terminate();
        resolve(response);
      };

      const timer = window.setTimeout(() => {
        finish({
          id: 0,
          kind: 'runtime-error',
          exitCode: null,
          stdout: '',
          stderr: '',
          durationMs: performance.now() - started,
          truncated: false,
          message: `程序运行超时（超过 ${timeoutMs} 毫秒），可能存在死循环。`,
        });
      }, timeoutMs);

      worker.addEventListener('message', (event: MessageEvent) => {
        const data = event.data as RunResponse;
        if (data && typeof data.id === 'number') finish(data);
      });
      worker.addEventListener('error', (event: ErrorEvent) => {
        finish({
          id: 0,
          kind: 'runtime-error',
          exitCode: null,
          stdout: '',
          stderr: '',
          durationMs: performance.now() - started,
          truncated: false,
          message: `运行环境异常：${event.message}`,
        });
      });

      const payload = bytes.slice();
      const request: RunRequest = {
        id: 1,
        bytes: payload,
        stdin,
        outputLimit,
      };
      worker.postMessage(request, [payload.buffer]);
    });
  }

  /* ---------------- 编排 ---------------- */

  /** 运行一次：编译 + 单次执行（“运行”按钮） */
  async runOnce(
    code: string,
    stdin: string,
    options: RunOptions = {},
  ): Promise<RunOutcome> {
    const compiled = await this.compile(code);
    if (!compiled.ok || !compiled.bytes) {
      return {
        status: 'compile-error',
        diagnostics: compiled.diagnostics,
        stdout: '',
        stderr: '',
        exitCode: null,
        compileMs: compiled.durationMs,
        runMs: 0,
      };
    }

    const res = await this.run(compiled.bytes, stdin, options);
    const status = toRunStatus(res);
    // 输出正确性由调用方判断，这里先按运行结果给出状态
    return {
      status,
      diagnostics: compiled.diagnostics,
      stdout: res.stdout,
      stderr: res.stderr,
      exitCode: res.exitCode,
      compileMs: compiled.durationMs,
      runMs: res.durationMs,
      message: res.message,
    };
  }

  /** 批量评测：编译一次，用每个测试用例的 input 依次运行并比对输出（“提交”按钮） */
  async submit(
    code: string,
    testCases: TestCase[],
    options: RunOptions = {},
    onCase?: (result: TestCaseResult, index: number) => void,
  ): Promise<SubmissionResult> {
    const compiled = await this.compile(code);
    if (!compiled.ok || !compiled.bytes) {
      return {
        compileOk: false,
        diagnostics: compiled.diagnostics,
        passed: 0,
        total: testCases.length,
        compileMs: compiled.durationMs,
        cases: testCases.map((testCase, index) => ({
          index,
          status: 'compile-error' as RunStatus,
          input: testCase.input,
          expected: testCase.expected_output,
          actual: '',
          stdout: '',
          stderr: '',
          diff: null,
          durationMs: 0,
        })),
      };
    }

    const cases: TestCaseResult[] = [];
    for (let index = 0; index < testCases.length; index += 1) {
      const testCase = testCases[index];
      const res = await this.run(compiled.bytes, testCase.input, options);
      const runtimeStatus = toRunStatus(res);
      const accepted =
        runtimeStatus === 'passed' &&
        isAccepted(res.stdout, testCase.expected_output);
      const result: TestCaseResult = {
        index,
        status: accepted ? 'passed' : runtimeStatus === 'passed' ? 'wrong-answer' : runtimeStatus,
        input: testCase.input,
        expected: testCase.expected_output,
        actual: res.stdout,
        stdout: res.stdout,
        stderr: res.stderr,
        message: res.message,
        diff: accepted ? null : diffOutput(res.stdout, testCase.expected_output),
        durationMs: res.durationMs,
      };
      cases.push(result);
      onCase?.(result, index);
    }

    return {
      compileOk: true,
      diagnostics: compiled.diagnostics,
      passed: cases.filter((c) => c.status === 'passed').length,
      total: cases.length,
      compileMs: compiled.durationMs,
      cases,
    };
  }
}

export const compilerService = new CompilerService();
