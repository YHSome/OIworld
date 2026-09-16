/**
 * 编译 Worker：加载 clang / wasm-ld（WebAssembly 版），把用户 C++ 源码编译成 Wasm 模块字节码。
 *
 * 与 browsercc 自带 `compile()` 的差别：
 *  - 只做“编译”，不执行；产物字节码交给 run.worker 在独立线程里跑（便于超时强杀）；
 *  - 固定编译参数只解析一次 clang 驱动参数（-###），省掉每次编译的一次额外实例化；
 *  - 编译参数数组每次都复制一份（Emscripten 的 callMain 会污染入参数组）。
 *
 * 注意：clang/lld 的 Emscripten 实例在 callMain 之后不能复用
 * （运行时会退出，再次调用会抛 “null function or function signature mismatch”），
 * 所以每次编译都新建实例 —— 这一点与 browsercc 官方实现一致。
 */

import type {
  CompileWorkerRequest,
  CompileWorkerResponse,
  ToolchainPhase,
} from './protocol';

interface WorkerScope {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent) => void) | null;
}

const scope = self as unknown as WorkerScope;

interface EmscriptenFS {
  writeFile(path: string, data: string | Uint8Array): void;
  readFile(path: string, opts: { encoding: 'binary' }): Uint8Array;
  mkdirTree(path: string): void;
  analyzePath(path: string): { exists: boolean };
}

interface EmscriptenModule {
  FS: EmscriptenFS;
  callMain(args: string[]): number;
}

interface EmscriptenOptions {
  thisProgram?: string;
  print?: (text: string) => void;
  printErr?: (text: string) => void;
  locateFile?: (path: string) => string;
}

interface CompilerInvocation {
  compilerArgs: string[];
  compilerArtifact: string;
  linkerArgs: string[];
  linerArtifact: string;
}

interface BrowserccModule {
  Clang(options: EmscriptenOptions): Promise<EmscriptenModule>;
  LLD(options: EmscriptenOptions): Promise<EmscriptenModule>;
  setUpSysroot(
    module: EmscriptenModule,
    tar: ArrayBuffer | Uint8Array,
    extraFiles?: Record<string, string | ArrayBuffer>,
  ): void;
  getCompilerInvocation(
    inputName: string,
    inputFile: string,
    flags: string[],
  ): Promise<CompilerInvocation>;
}

/* ------------------------------------------------------------------ */
/* 状态                                                                */
/* ------------------------------------------------------------------ */

let toolchain: BrowserccModule | null = null;
let sysrootTar: ArrayBuffer | null = null;
let cachedInvocation: { key: string; value: CompilerInvocation } | null = null;
let cflags: string[] = [];
let ready = false;

/** 当前编译正在收集的诊断输出 */
let diagnostics = '';

const post = (message: CompileWorkerResponse, transfer?: Transferable[]) =>
  scope.postMessage(message, transfer);

const phase = (p: ToolchainPhase, message: string) =>
  post({ type: 'phase', phase: p, message });

const collect = (text: string) => {
  diagnostics += `${text}\n`;
};

/* ------------------------------------------------------------------ */
/* 工具链准备                                                          */
/* ------------------------------------------------------------------ */

async function loadToolchainModule(base: string): Promise<BrowserccModule> {
  if (toolchain) return toolchain;
  // 运行时动态导入：URL 由主线程决定（同源 /toolchain 或 CDN）
  const mod = (await import(
    /* @vite-ignore */ `${base}/index.js`
  )) as BrowserccModule;
  if (typeof mod.Clang !== 'function' || typeof mod.LLD !== 'function') {
    throw new Error(`工具链模块缺少 Clang/LLD 导出，请检查地址：${base}`);
  }
  toolchain = mod;
  return mod;
}

async function loadSysroot(base: string): Promise<ArrayBuffer> {
  if (sysrootTar) return sysrootTar;
  const res = await fetch(`${base}/sysroot.tar`);
  if (!res.ok) {
    throw new Error(`下载 C/C++ 标准库（sysroot.tar）失败：HTTP ${res.status}`);
  }
  sysrootTar = await res.arrayBuffer();
  return sysrootTar;
}

/** 固定参数下的 clang 驱动参数只解析一次 */
async function ensureInvocation(
  mod: BrowserccModule,
  fileName: string,
  flags: string[],
): Promise<CompilerInvocation> {
  const key = `${fileName}|${flags.join(' ')}`;
  if (cachedInvocation && cachedInvocation.key === key) {
    return cachedInvocation.value;
  }
  const value = await mod.getCompilerInvocation(
    fileName,
    'int main() { return 0; }\n',
    flags,
  );
  cachedInvocation = { key, value };
  return value;
}

/** 调用 Emscripten 模块的 main，把 exit() 抛出的异常转成退出码 */
function callMain(module: EmscriptenModule, args: string[]): number {
  try {
    // 必须复制：Emscripten 的 callMain 会在数组头部 unshift(thisProgram)
    return module.callMain(args.slice());
  } catch (err) {
    const status = (err as { status?: unknown })?.status;
    if (typeof status === 'number') return status;
    throw err;
  }
}

async function initialize(base: string, flags: string[]): Promise<void> {
  cflags = flags;
  ready = false;

  phase('loading-module', '正在加载编译器模块…');
  const mod = await loadToolchainModule(base);

  phase('downloading', '正在读取 C/C++ 标准库…');
  await loadSysroot(base);

  phase('preparing-sysroot', '正在解析编译参数…');
  await ensureInvocation(mod, 'main.cpp', flags);

  ready = true;
  phase('ready', '编译器就绪');
  post({ type: 'ready', base });
}

/* ------------------------------------------------------------------ */
/* 编译                                                                */
/* ------------------------------------------------------------------ */

async function compile(id: number, code: string, fileName: string) {
  const started = performance.now();
  diagnostics = '';

  if (!ready || !toolchain || !sysrootTar) {
    post({
      type: 'compile-result',
      id,
      ok: false,
      diagnostics: '编译器尚未就绪，请稍后重试。',
      durationMs: 0,
    });
    return;
  }

  const mod = toolchain;
  const tar = sysrootTar;

  const fail = (message: string) => {
    post({
      type: 'compile-result',
      id,
      ok: false,
      diagnostics: diagnostics || message,
      durationMs: performance.now() - started,
    });
  };

  try {
    const invocation = await ensureInvocation(mod, fileName, cflags);

    phase('compiling', '正在编译…');
    // 每次编译都新建实例（Emscripten 运行时执行一次 main 后即不可复用）
    const [clang, lld] = await Promise.all([
      mod.Clang({ thisProgram: 'clang++', print: collect, printErr: collect }),
      mod.LLD({ thisProgram: 'wasm-ld', print: collect, printErr: collect }),
    ]);
    mod.setUpSysroot(clang, tar);
    mod.setUpSysroot(lld, tar);

    // 1) 编译：C++ -> wasm 目标文件
    clang.FS.writeFile(fileName, code);
    const compileCode = callMain(clang, invocation.compilerArgs);
    if (compileCode !== 0) {
      fail(`clang 返回退出码 ${compileCode}`);
      return;
    }
    const object = clang.FS.readFile(invocation.compilerArtifact, {
      encoding: 'binary',
    });

    // 2) 链接：wasm 目标文件 -> 可执行 wasm 模块
    phase('linking', '正在链接…');
    lld.FS.writeFile(invocation.compilerArtifact, object);
    const linkCode = callMain(lld, invocation.linkerArgs);
    if (linkCode !== 0) {
      fail(`wasm-ld 返回退出码 ${linkCode}`);
      return;
    }
    const binary = lld.FS.readFile(invocation.linerArtifact, {
      encoding: 'binary',
    });
    const payload = binary.slice();
    post(
      {
        type: 'compile-result',
        id,
        ok: true,
        bytes: payload,
        diagnostics,
        durationMs: performance.now() - started,
      },
      [payload.buffer],
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    fail(`编译器内部错误：${message}`);
  }
}

/* ------------------------------------------------------------------ */
/* 消息入口                                                            */
/* ------------------------------------------------------------------ */

scope.onmessage = (event: MessageEvent) => {
  const data = event.data as CompileWorkerRequest;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'init') {
    initialize(data.base, data.flags).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      phase('failed', `编译器初始化失败：${message}`);
      post({ type: 'error', message });
    });
    return;
  }

  if (data.type === 'compile') {
    void compile(data.id, data.code, data.fileName);
  }
};
