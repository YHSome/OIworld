/**
 * 编译器工具链（clang / wasm-ld / wasi-sysroot）的定位与预加载。
 *
 * 三种来源，按优先级：
 *  1. 构建期环境变量 VITE_TOOLCHAIN_BASE
 *  2. 同源静态目录 /toolchain（执行 `npm run setup:toolchain` 后存在，可完全离线）
 *  3. jsDelivr CDN 上的 browsercc npm 包
 */

export const CDN_TOOLCHAIN_BASE =
  'https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist';

export const LOCAL_TOOLCHAIN_BASE = '/toolchain';

/** 需要下载的静态资源（用于展示下载进度） */
export const TOOLCHAIN_FILES = [
  { name: 'index.js', size: 6_000 },
  { name: 'clang.js', size: 70_000 },
  { name: 'clang.wasm', size: 43_000_000 },
  { name: 'lld.js', size: 70_000 },
  { name: 'lld.wasm', size: 23_000_000 },
  { name: 'sysroot.tar', size: 29_000_000 },
] as const;

export const TOOLCHAIN_TOTAL_BYTES = TOOLCHAIN_FILES.reduce(
  (sum, f) => sum + f.size,
  0,
);

interface ToolchainManifest {
  name: string;
  version?: string;
  files?: string[];
}

async function fetchManifest(base: string): Promise<ToolchainManifest | null> {
  try {
    const res = await fetch(`${base}/manifest.json`, { cache: 'no-store' });
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('json')) return null;
    const data = (await res.json()) as ToolchainManifest;
    if (data && data.name === 'browsercc') return data;
    return null;
  } catch {
    return null;
  }
}

/** 解析最终使用的工具链基地址 */
export async function resolveToolchainBase(): Promise<{
  base: string;
  source: 'env' | 'local' | 'cdn';
  version?: string;
}> {
  const fromEnv = import.meta.env.VITE_TOOLCHAIN_BASE as string | undefined;
  if (fromEnv) {
    return { base: fromEnv.replace(/\/$/, ''), source: 'env' };
  }
  const local = await fetchManifest(LOCAL_TOOLCHAIN_BASE);
  if (local) {
    return {
      base: LOCAL_TOOLCHAIN_BASE,
      source: 'local',
      version: local.version,
    };
  }
  return { base: CDN_TOOLCHAIN_BASE, source: 'cdn', version: '0.1.1' };
}

export interface DownloadProgress {
  /** 已下载字节数（按文件粒度估算） */
  loaded: number;
  total: number;
  /** 当前文件 */
  currentFile: string;
  /** 0 ~ 100 */
  percent: number;
}

/**
 * 预加载工具链静态资源。
 *
 * 目的有两个：
 *  - 给用户一个真实的下载进度（否则首次编译要傻等十几秒）；
 *  - 把 clang.wasm / sysroot.tar 等大文件灌进浏览器 HTTP 缓存，
 *    之后 browsercc 内部的 fetch 会直接命中缓存。
 */
export async function preloadToolchain(
  base: string,
  onProgress: (p: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<void> {
  let loaded = 0;
  const total = TOOLCHAIN_TOTAL_BYTES;

  for (const file of TOOLCHAIN_FILES) {
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    const url = `${base}/${file.name}`;
    onProgress({
      loaded,
      total,
      currentFile: file.name,
      percent: Math.floor((loaded / total) * 100),
    });

    let res: Response;
    try {
      res = await fetch(url, { signal });
    } catch (err) {
      if (signal?.aborted) throw err;
      // 单个文件失败时继续，让真正的编译流程给出错误信息
      loaded += file.size;
      continue;
    }
    if (!res.ok) {
      loaded += file.size;
      continue;
    }

    const contentLength = Number(res.headers.get('content-length') ?? 0);
    if (!res.body || !contentLength) {
      await res.arrayBuffer();
      loaded += contentLength || file.size;
    } else {
      const reader = res.body.getReader();
      let received = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.byteLength;
        onProgress({
          loaded: loaded + received,
          total,
          currentFile: file.name,
          percent: Math.floor(((loaded + received) / total) * 100),
        });
      }
      loaded += received;
    }
    onProgress({
      loaded,
      total,
      currentFile: file.name,
      percent: Math.floor((loaded / total) * 100),
    });
  }
}
