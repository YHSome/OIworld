/**
 * Node 版工具链（仅用于开发期校验，不参与浏览器运行）。
 *
 * 与浏览器端 compile.worker.ts 使用完全相同的编译流程：
 *   clang(wasm) 编译 -> wasm-ld(wasm) 链接 -> WASI shim 执行产物。
 * 用途：批量校验题库里的 solution_code / expected_output 是否真的正确。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  Clang,
  LLD,
  setUpSysroot,
  getCompilerInvocation,
} from 'browsercc';
import {
  WASI,
  File,
  OpenFile,
  ConsoleStdout,
} from '@bjorn3/browser_wasi_shim';

const distDir = path.dirname(fileURLToPath(import.meta.resolve('browsercc')));

/**
 * 本站固定的编译参数：
 *  - std=c++20：现代 C++ 语法
 *  - O0：编译更快，便于零基础用户快速看到结果
 *  - -fno-exceptions：这份 wasi-sysroot 里的 libc++ 是关闭异常编译的，
 *    不加该参数会出现 __cxa_throw / __cxa_allocate_exception 未定义符号
 */
export const DEFAULT_FLAGS = ['-std=c++20', '-O0', '-Wall', '-fno-exceptions'];

let sysrootTar = null;
let stderrBuffer = '';

const capture = (text) => {
  stderrBuffer += `${text}\n`;
};

/**
 * Emscripten 的 clang/lld 实例在 callMain 结束后无法再次调用
 * （运行时已退出，再调用会抛 "null function or function signature mismatch"），
 * 因此每次编译都新建实例 —— 与 browsercc 官方实现保持一致。
 */
async function newClang() {
  return Clang({
    thisProgram: 'clang++',
    print: capture,
    printErr: capture,
  });
}

async function newLld() {
  return LLD({
    thisProgram: 'wasm-ld',
    print: capture,
    printErr: capture,
  });
}

async function loadSysroot() {
  if (!sysrootTar) {
    sysrootTar = new Uint8Array(
      fs.readFileSync(path.join(distDir, 'sysroot.tar')),
    );
  }
  return sysrootTar;
}

/**
 * 调用 Emscripten 模块的 main。
 * 注意：Emscripten 的 callMain 会直接在传入数组上 `unshift(thisProgram)`，
 * 因此这里必须先复制一份，否则缓存的参数数组会被污染（第二次编译报
 * "clang++: error: unknown argument: '-cc1'"）。
 */
function callMain(module, args) {
  try {
    return module.callMain(args.slice());
  } catch (err) {
    if (err && typeof err.status === 'number') return err.status;
    throw err;
  }
}

const invocationCache = new Map();

async function ensureInvocation(flags, fileName) {
  const key = `${fileName}|${flags.join(' ')}`;
  if (invocationCache.has(key)) return invocationCache.get(key);
  const value = await getCompilerInvocation(fileName, 'int main() { return 0; }\n', flags);
  invocationCache.set(key, value);
  return value;
}

/** 编译 C++ 源码，返回 { ok, bytes, diagnostics, durationMs } */
export async function compileCpp(
  source,
  flags = DEFAULT_FLAGS,
  fileName = 'main.cpp',
) {
  const t0 = performance.now();
  const invocation = await ensureInvocation(flags, fileName);
  const tar = await loadSysroot();
  stderrBuffer = '';

  // 1) 编译：C++ -> wasm 目标文件（每次新建 clang 实例）
  const clangInstance = await newClang();
  setUpSysroot(clangInstance, tar);
  clangInstance.FS.writeFile(fileName, source);
  const compileCode = callMain(clangInstance, invocation.compilerArgs);
  if (compileCode !== 0) {
    return {
      ok: false,
      bytes: null,
      diagnostics: stderrBuffer,
      durationMs: performance.now() - t0,
    };
  }
  const object = clangInstance.FS.readFile(invocation.compilerArtifact, {
    encoding: 'binary',
  });

  // 2) 链接：wasm 目标文件 -> 可执行 wasm 模块（每次新建 wasm-ld 实例）
  const lldInstance = await newLld();
  setUpSysroot(lldInstance, tar);
  lldInstance.FS.writeFile(invocation.compilerArtifact, object);
  const linkCode = callMain(lldInstance, invocation.linkerArgs);
  if (linkCode !== 0) {
    return {
      ok: false,
      bytes: null,
      diagnostics: stderrBuffer,
      durationMs: performance.now() - t0,
    };
  }
  const binary = lldInstance.FS.readFile(invocation.linerArtifact, {
    encoding: 'binary',
  });
  return {
    ok: true,
    bytes: binary.slice(),
    diagnostics: stderrBuffer,
    durationMs: performance.now() - t0,
  };
}

class Sink {
  constructor() {
    this.text = '';
    this.decoder = new TextDecoder('utf-8');
  }
  write(data) {
    this.text += this.decoder.decode(data, { stream: true });
  }
  flush() {
    this.text += this.decoder.decode();
    return this.text;
  }
}

/** 用 WASI shim 运行编译产物 */
export async function runWasm(bytes, stdin = '', timeoutMs = 5000) {
  const out = new Sink();
  const err = new Sink();
  const fds = [
    new OpenFile(new File(new TextEncoder().encode(stdin))),
    new ConsoleStdout((d) => out.write(d)),
    new ConsoleStdout((d) => err.write(d)),
  ];
  const wasi = new WASI([], [], fds);
  const module = await WebAssembly.compile(bytes);
  const instance = await WebAssembly.instantiate(module, {
    wasi_snapshot_preview1: wasi.wasiImport,
  });

  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('运行超时')), timeoutMs);
  });
  try {
    // wasi.start 是同步调用，Node 里跑死循环只能用超时兜底（此处仅用于校验，不会遇到死循环）
    const code = await Promise.race([
      Promise.resolve().then(() => wasi.start(instance)),
      timeout,
    ]);
    return { ok: true, exitCode: code, stdout: out.flush(), stderr: err.flush() };
  } catch (error) {
    return {
      ok: false,
      exitCode: null,
      stdout: out.flush(),
      stderr: err.flush(),
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** 编译并运行一次 */
export async function compileAndRun(source, stdin = '', flags) {
  const compiled = await compileCpp(source, flags);
  if (!compiled.ok) {
    return { ok: false, stage: 'compile', diagnostics: compiled.diagnostics };
  }
  const ran = await runWasm(compiled.bytes, stdin);
  return { ...ran, stage: 'run', diagnostics: compiled.diagnostics, compileMs: compiled.durationMs };
}

/** 与评测一致的输出比对 */
export function normalizeOutput(text) {
  return String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}
