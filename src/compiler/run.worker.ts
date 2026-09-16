/**
 * 运行 Worker：在独立的 WebAssembly + WASI 沙箱里执行“用户程序”。
 *
 * 每个测试点都会新建一个 Worker（由主线程负责），这样：
 *  - 死循环 / 段错误不会互相影响；
 *  - 主线程可以直接 `terminate()` 实现硬超时；
 *  - 不需要为了重置状态而重新加载 90MB 的编译器。
 */

import {
  WASI,
  File,
  OpenFile,
  ConsoleStdout,
} from '@bjorn3/browser_wasi_shim';

interface WorkerScope {
  postMessage(message: unknown, transfer?: Transferable[]): void;
  onmessage: ((event: MessageEvent) => void) | null;
  close(): void;
}

const scope = self as unknown as WorkerScope;

export interface RunRequest {
  id: number;
  bytes: Uint8Array | ArrayBuffer;
  stdin: string;
  /** 单个流的字符上限 */
  outputLimit: number;
}

export type RunKind = 'ok' | 'runtime-error' | 'link-error' | 'output-limit';

export interface RunResponse {
  id: number;
  kind: RunKind;
  exitCode: number | null;
  stdout: string;
  stderr: string;
  durationMs: number;
  truncated: boolean;
  message?: string;
}

/** 按流累积输出，带 UTF-8 流式解码与长度上限 */
class OutputSink {
  text = '';
  truncated = false;
  private readonly decoder = new TextDecoder('utf-8');

  constructor(private readonly limit: number) {}

  write(data: Uint8Array): void {
    if (this.truncated) return;
    this.text += this.decoder.decode(data, { stream: true });
    if (this.text.length > this.limit) {
      this.text = this.text.slice(0, this.limit);
      this.truncated = true;
    }
  }

  flush(): void {
    this.text += this.decoder.decode();
  }
}

scope.onmessage = (event: MessageEvent) => {
  const req = event.data as RunRequest;
  if (!req || typeof req !== 'object') return;
  void runProgram(req);
};

async function runProgram(req: RunRequest): Promise<void> {
  const started = performance.now();
  const limit = req.outputLimit || 64_000;
  const out = new OutputSink(limit);
  const err = new OutputSink(limit);

  const finish = (
    kind: RunKind,
    exitCode: number | null,
    message?: string,
  ): void => {
    out.flush();
    err.flush();
    const response: RunResponse = {
      id: req.id,
      kind,
      exitCode,
      stdout: out.text,
      stderr: err.text,
      durationMs: performance.now() - started,
      truncated: out.truncated || err.truncated,
      message,
    };
    try {
      scope.postMessage(response);
    } catch {
      /* ignore */
    }
  };

  // 输出爆炸时先通知主线程（让它 terminate 掉我们），再继续吞掉后续输出
  const onOverflow = () => {
    finish('output-limit', null, '程序输出内容过多，已中止运行。');
  };

  const stdinBytes = new TextEncoder().encode(req.stdin ?? '');
  const fds = [
    new OpenFile(new File(stdinBytes)),
    new ConsoleStdout((data: Uint8Array) => {
      const wasTruncated = out.truncated;
      out.write(data);
      if (!wasTruncated && out.truncated) onOverflow();
    }),
    new ConsoleStdout((data: Uint8Array) => {
      const wasTruncated = err.truncated;
      err.write(data);
      if (!wasTruncated && err.truncated) onOverflow();
    }),
  ];

  let instance: WebAssembly.Instance;
  let module: WebAssembly.Module;
  const bytes = req.bytes instanceof Uint8Array ? req.bytes : new Uint8Array(req.bytes);
  try {
    module = await WebAssembly.compile(bytes as unknown as BufferSource);
  } catch (e) {
    finish(
      'link-error',
      null,
      `无法加载编译产物：${e instanceof Error ? e.message : String(e)}`,
    );
    return;
  }

  try {
    const wasi = new WASI([], [], fds);
    instance = await WebAssembly.instantiate(module, {
      wasi_snapshot_preview1: wasi.wasiImport,
    });

    let exitCode: number;
    try {
      // WASI shim 的类型定义要求 exports 里有 memory / _start
      exitCode = wasi.start(
        instance as unknown as {
          exports: { memory: WebAssembly.Memory; _start: () => unknown };
        },
      );
    } catch (e) {
      finish(
        'runtime-error',
        null,
        explainTrap(e),
      );
      return;
    }

    if (exitCode !== 0) {
      finish('runtime-error', exitCode, `程序以非零退出码 ${exitCode} 结束。`);
      return;
    }
    finish('ok', exitCode);
  } catch (e) {
    const imports = WebAssembly.Module.imports(module)
      .map((i) => `${i.module}.${i.name}`)
      .join(', ');
    finish(
      'link-error',
      null,
      `实例化失败：${e instanceof Error ? e.message : String(e)}${
        imports ? `（模块依赖：${imports}）` : ''
      }`,
    );
  }
}

function explainTrap(e: unknown): string {
  const message = e instanceof Error ? e.message : String(e);
  if (e instanceof WebAssembly.RuntimeError) {
    if (/unreachable/i.test(message)) {
      return '程序触发了非法操作并强制中止（常见原因：数组越界、除以 0、空指针解引用）。';
    }
    if (/out of bounds/i.test(message)) {
      return '程序访问了越界的内存（常见原因：数组下标超出范围）。';
    }
    if (/stack/i.test(message)) {
      return '调用栈溢出（常见原因：递归没有正确的终止条件）。';
    }
    return `程序运行时崩溃：${message}`;
  }
  return `运行时错误：${message}`;
}
