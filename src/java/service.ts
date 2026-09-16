import type { RunOutcome, TestCase } from '../types/problem';
import type { SubmissionResult, TestCaseResult } from '../compiler/client';
import { diffOutput, isAccepted } from '../compiler/judge';

declare global {
  interface Window { BrowserFS?: any; Doppio?: any; }
}

export type JavaStatus = 'idle' | 'loading' | 'ready' | 'failed';
export interface JavaRuntimeStatus { phase: JavaStatus; message: string; }
type Listener = (status: JavaRuntimeStatus) => void;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src; script.onload = () => resolve(); script.onerror = () => reject(new Error(`无法加载 ${src}`));
    document.head.append(script);
  });
}

class JavaService {
  private status: JavaRuntimeStatus = { phase: 'idle', message: 'Java 运行环境未加载' };
  private listeners = new Set<Listener>();
  private ready: Promise<void> | null = null;
  private fs: any;
  private process: any;
  private output = { stdout: '', stderr: '' };
  private queue: Promise<unknown> = Promise.resolve();

  subscribe(listener: Listener) { this.listeners.add(listener); listener(this.status); return () => { this.listeners.delete(listener); }; }
  getStatus() { return this.status; }
  private setStatus(status: JavaRuntimeStatus) { this.status = status; this.listeners.forEach((listener) => listener(status)); }
  private base() { return `${import.meta.env.BASE_URL}doppio-runtime`; }

  private async ensureReady() {
    if (this.ready) return this.ready;
    this.setStatus({ phase: 'loading', message: '正在加载 Java 8 编译器与运行库（首次约 100MB）…' });
    this.ready = (async () => {
      // Doppio 的旧版 Node 兼容层依赖 setImmediate；浏览器中用 0ms 定时器等价实现。
      if (typeof (window as any).setImmediate !== 'function') {
        (window as any).setImmediate = (callback: () => void) => window.setTimeout(callback, 0);
      }
      await loadScript(`${this.base()}/browserfs.min.js`);
      await loadScript(`${this.base()}/doppio.js`);
      const BrowserFS = window.BrowserFS;
      if (!BrowserFS || !window.Doppio) throw new Error('Java 运行库初始化失败');
      const mfs = new BrowserFS.FileSystem.MountableFileSystem();
      BrowserFS.initialize(mfs);
      mfs.mount('/tmp', new BrowserFS.FileSystem.InMemory());
      mfs.mount('/sys', new BrowserFS.FileSystem.XmlHttpRequest('listings.json', this.base()));
      this.fs = BrowserFS.BFSRequire('fs');
      this.process = BrowserFS.BFSRequire('process');
      this.process.initializeTTYs();
      this.process.stdout.on('data', (chunk: { toString(): string }) => { this.output.stdout += chunk.toString(); });
      this.process.stderr.on('data', (chunk: { toString(): string }) => { this.output.stderr += chunk.toString(); });
      this.setStatus({ phase: 'ready', message: 'Java 8 编译器已就绪（浏览器本地运行）' });
    })().catch((error: unknown) => {
      this.ready = null;
      this.setStatus({ phase: 'failed', message: `Java 运行环境加载失败：${error instanceof Error ? error.message : String(error)}` });
      throw error;
    });
    return this.ready;
  }

  private write(path: string, content: string) { return new Promise<void>((resolve, reject) => this.fs.writeFile(path, content, (error: Error | null) => error ? reject(error) : resolve())); }
  private cli(args: string[]) { return new Promise<number>((resolve) => window.Doppio.VM.CLI(args, { doppioHomePath: '/sys', tmpDir: '/tmp' }, resolve)); }
  private resetOutput() { this.output = { stdout: '', stderr: '' }; }
  private async compile(code: string) {
    const started = performance.now();
    await this.ensureReady(); this.resetOutput();
    await this.write('/tmp/Main.java', code);
    const exit = await this.cli(['-classpath', '/sys/vendor/java_home/lib/tools.jar', 'com.sun.tools.javac.Main', '-d', '/tmp', '/tmp/Main.java']);
    return { ok: exit === 0, diagnostics: `${this.output.stdout}${this.output.stderr}`, durationMs: performance.now() - started };
  }
  private async run(stdin: string) {
    const started = performance.now();
    this.resetOutput();
    if (stdin) this.process.stdin.write(stdin.endsWith('\n') ? stdin : `${stdin}\n`);
    const exit = await this.cli(['-classpath', '/tmp', 'Main']);
    return { ok: exit === 0, stdout: this.output.stdout, stderr: this.output.stderr, durationMs: performance.now() - started };
  }
  async runOnce(code: string, stdin: string): Promise<RunOutcome> {
    const task = async () => { const compiled = await this.compile(code); if (!compiled.ok) return { status: 'compile-error' as const, diagnostics: compiled.diagnostics, stdout: '', stderr: '', exitCode: null, compileMs: compiled.durationMs, runMs: 0 }; const run = await this.run(stdin); return { status: run.ok ? 'passed' as const : 'runtime-error' as const, diagnostics: '', stdout: run.stdout, stderr: run.stderr, exitCode: run.ok ? 0 : null, compileMs: compiled.durationMs, runMs: run.durationMs, message: run.ok ? undefined : 'Java 程序没有正常结束。' }; };
    const result = this.queue.then(task, task); this.queue = result.catch(() => undefined); return result;
  }
  async submit(code: string, tests: TestCase[], onCase?: (result: TestCaseResult) => void): Promise<SubmissionResult> {
    const task = async () => { const compiled = await this.compile(code); if (!compiled.ok) return { compileOk: false, diagnostics: compiled.diagnostics, passed: 0, total: tests.length, compileMs: compiled.durationMs, cases: tests.map((testCase, index) => ({ index, status: 'compile-error' as const, input: testCase.input, expected: testCase.expected_output, actual: '', stdout: '', stderr: '', diff: null, durationMs: 0 })) }; const cases: TestCaseResult[] = []; for (let index = 0; index < tests.length; index += 1) { const testCase = tests[index]; const run = await this.run(testCase.input); const accepted = run.ok && isAccepted(run.stdout, testCase.expected_output); const result: TestCaseResult = { index, status: accepted ? 'passed' : run.ok ? 'wrong-answer' : 'runtime-error', input: testCase.input, expected: testCase.expected_output, actual: run.stdout, stdout: run.stdout, stderr: run.stderr, diff: accepted ? null : diffOutput(run.stdout, testCase.expected_output), durationMs: run.durationMs }; cases.push(result); onCase?.(result); } return { compileOk: true, diagnostics: '', passed: cases.filter((item) => item.status === 'passed').length, total: tests.length, compileMs: compiled.durationMs, cases }; };
    const result = this.queue.then(task, task); this.queue = result.catch(() => undefined); return result;
  }
}
export const javaService = new JavaService();
