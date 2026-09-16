/**
 * 主线程 <-> 编译 Worker 的消息协议。
 */

/** 工具链准备阶段 */
export type ToolchainPhase =
  | 'idle'
  | 'downloading'
  | 'loading-module'
  | 'instantiating-clang'
  | 'instantiating-lld'
  | 'preparing-sysroot'
  | 'compiling'
  | 'linking'
  | 'ready'
  | 'failed';

export interface InitRequest {
  type: 'init';
  /** 工具链基地址，例如 "https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist" */
  base: string;
  /** 编译参数 */
  flags: string[];
}

export interface CompileRequest {
  type: 'compile';
  id: number;
  code: string;
  fileName: string;
}

export type CompileWorkerRequest = InitRequest | CompileRequest;

export interface PhaseMessage {
  type: 'phase';
  phase: ToolchainPhase;
  message: string;
}

export interface ReadyMessage {
  type: 'ready';
  /** 工具链真实来源，便于展示 */
  base: string;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
  /** 关联的编译请求 id（若有） */
  id?: number;
}

export interface CompileResultMessage {
  type: 'compile-result';
  id: number;
  ok: boolean;
  /** 编译产出的 Wasm 模块字节码（ok 为 true 时存在） */
  bytes?: Uint8Array;
  /** clang / wasm-ld 的诊断输出 */
  diagnostics: string;
  durationMs: number;
}

export type CompileWorkerResponse =
  | PhaseMessage
  | ReadyMessage
  | ErrorMessage
  | CompileResultMessage;
