/**
 * 编译器状态的 React 绑定。
 */

import { useEffect, useState } from 'react';
import { compilerService, type CompilerStatus } from '../compiler/client';
import type { ToolchainPhase } from '../compiler/protocol';

export function useCompilerStatus(): CompilerStatus {
  const [status, setStatus] = useState<CompilerStatus>(() =>
    compilerService.getStatus(),
  );
  useEffect(() => compilerService.subscribe(setStatus), []);
  return status;
}

/** 工具链是否已经可以编译（正在编译中同样算就绪） */
export function isToolchainReady(phase: ToolchainPhase): boolean {
  return phase === 'ready' || phase === 'compiling' || phase === 'linking';
}

/** 首次进入题目页时预热编译器（约 90MB，浏览器会缓存） */
export function warmUpCompiler(): Promise<void> {
  return compilerService.ensureReady();
}
