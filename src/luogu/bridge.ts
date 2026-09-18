/**
 * 与油猴桥接脚本（public/oiworld-luogu.user.js）通信的客户端。
 *
 * 通信方式：window.postMessage。
 *  网页 → 桥：{ __OIWORLD_LUOGU_REQUEST__: true, id, action, payload }
 *  桥 → 网页：{ __OIWORLD_LUOGU_REPLY__: true, id, ok, data | error }
 *
 * 为什么不让网页直接请求洛谷：
 *  1. 洛谷响应没有 Access-Control-Allow-Origin，跨域请求会被浏览器直接拦掉；
 *  2. `Cookie` 属于 fetch/XHR 的禁止请求头，网页 JS 带上不登录凭据。
 * 这两点是浏览器的硬性规则（不是没写对），所以需要"由扩展代发请求"这一个前提。
 */

import {
  LUOGU_REPLY_FLAG,
  LUOGU_REQUEST_FLAG,
  type LuoguAction,
  type LuoguBridgeInfo,
  type LuoguReplyMessage,
} from './types';

let counter = 0;
let listenerInstalled = false;

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (error: Error) => void;
  timer: number;
}

const pending = new Map<number, PendingCall>();

/** 桥返回的业务错误 */
export class LuoguBridgeError extends Error {
  code: string;

  detail?: unknown;

  constructor(shape: { code?: string; message?: string; detail?: unknown }) {
    super(shape.message || '洛谷桥接调用失败');
    this.name = 'LuoguBridgeError';
    this.code = shape.code || 'BRIDGE_ERROR';
    this.detail = shape.detail;
  }
}

/** 桥没装 / 没响应时抛出 */
export class LuoguBridgeMissingError extends Error {
  constructor(message = '没有检测到洛谷桥接脚本') {
    super(message);
    this.name = 'LuoguBridgeMissingError';
  }
}

function installListener() {
  if (listenerInstalled || typeof window === 'undefined') return;
  listenerInstalled = true;
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data as LuoguReplyMessage | undefined;
    if (!data || typeof data !== 'object' || data[LUOGU_REPLY_FLAG] !== true) return;
    const call = pending.get(data.id);
    if (!call) return;
    pending.delete(data.id);
    window.clearTimeout(call.timer);
    if (data.ok) {
      call.resolve(data.data);
    } else {
      call.reject(new LuoguBridgeError(data.error ?? {}));
    }
  });
}

/**
 * 调用桥。
 * @param timeoutMs 超时时间：提交类操作要给足（洛谷要抓 csrf + 建评测记录）
 */
export function callLuoguBridge<T>(
  action: LuoguAction,
  payload?: unknown,
  timeoutMs = 45000,
): Promise<T> {
  installListener();
  if (typeof window === 'undefined') {
    return Promise.reject(new LuoguBridgeMissingError('当前环境没有 window'));
  }
  counter += 1;
  const id = counter;
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      pending.delete(id);
      reject(
        new LuoguBridgeMissingError(
          '洛谷桥接脚本没有回应：请确认已安装并启用了 OIworld 洛谷桥接脚本（Tampermonkey / Violentmonkey）',
        ),
      );
    }, timeoutMs);
    pending.set(id, {
      resolve: resolve as (value: unknown) => void,
      reject,
      timer,
    });
    window.postMessage({ [LUOGU_REQUEST_FLAG]: true, id, action, payload }, window.location.origin);
  });
}

/** 探测桥是否存在（静默：探测失败不抛错，返回 null） */
export async function probeLuoguBridge(timeoutMs = 800): Promise<LuoguBridgeInfo | null> {
  try {
    const info = await callLuoguBridge<LuoguBridgeInfo>('ping', undefined, timeoutMs);
    return info && info.bridge ? info : null;
  } catch {
    return null;
  }
}

export function isLuoguBridgeError(error: unknown): error is LuoguBridgeError {
  return error instanceof LuoguBridgeError;
}

export function describeLuoguError(error: unknown): string {
  if (error instanceof LuoguBridgeError) return error.message;
  if (error instanceof LuoguBridgeMissingError) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}
