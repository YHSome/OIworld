/**
 * 洛谷远程操作的高层封装：检测会话、提交代码、读取评测结果与提交记录。
 * 所有真正发往洛谷的请求都由用户安装的桥接脚本代发（见 bridge.ts 里的说明）。
 */

import { callLuoguBridge } from './bridge';
import { getCookieBindingForRequest } from './useLuoguStore';
import { isLuoguPending } from './verdict';
import type { LuoguCookieBinding, LuoguRecord, LuoguSession, LuoguSubmitResult } from './types';

/** 洛谷题号形如 P1001 / B2001 / CF1A / AT_abc001_a / UVA100 */
export function isValidLuoguPid(pid: string): boolean {
  return /^[A-Za-z]{1,4}[_-]?[A-Za-z0-9]{1,12}$/.test(pid.trim());
}

/** 从洛谷题号推出可点击的题目地址 */
export function luoguProblemUrl(pid: string): string {
  return `https://www.luogu.com.cn/problem/${encodeURIComponent(pid.trim())}`;
}

export function luoguRecordUrl(rid: number): string {
  return `https://www.luogu.com.cn/record/${rid}`;
}

export function luoguRecordListUrl(pid: string, uid?: string): string {
  const query = new URLSearchParams({ pid: pid.trim() });
  if (uid) query.set('user', uid);
  return `https://www.luogu.com.cn/record/list?${query.toString()}`;
}

/** 检测当前浏览器（或指定 Cookie）在洛谷的登录状态 */
export function checkLuoguSession(cookie?: LuoguCookieBinding): Promise<LuoguSession> {
  return callLuoguBridge<LuoguSession>(
    'session',
    cookie && cookie.clientId ? { cookie } : undefined,
    20000,
  );
}

/**
 * 提交代码到洛谷。
 * 返回洛谷的评测记录号 rid —— 后续用它轮询评测结果。
 */
export function submitToLuogu(input: {
  pid: string;
  code: string;
  lang: number;
  enableO2?: boolean;
}): Promise<LuoguSubmitResult> {
  return callLuoguBridge<LuoguSubmitResult>(
    'submit',
    {
      pid: input.pid.trim(),
      code: input.code,
      lang: input.lang,
      enableO2: Boolean(input.enableO2),
      cookie: getCookieBindingForRequest(),
    },
    60000,
  );
}

function pickNumber(source: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

/**
 * 把洛谷返回的记录对象整理成前端用的形状。
 * 洛谷不同接口（记录详情 / 记录列表）字段略有差异，这里统一做一次兜底。
 */
export function normalizeLuoguRecord(raw: unknown): LuoguRecord {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const problem = (source.problem ?? {}) as Record<string, unknown>;
  const user = (source.user ?? {}) as Record<string, unknown>;
  return {
    id: pickNumber(source, ['id', 'rid', 'recordId']) ?? 0,
    status: pickNumber(source, ['status']) ?? -1,
    score: pickNumber(source, ['score']),
    time: pickNumber(source, ['time']),
    memory: pickNumber(source, ['memory']),
    language: pickNumber(source, ['language']),
    enableO2: Boolean(source.enableO2),
    sourceCodeLength: pickNumber(source, ['sourceCodeLength']),
    submitTime: pickNumber(source, ['submitTime']),
    problem: {
      pid: typeof problem.pid === 'string' ? problem.pid : undefined,
      title: typeof problem.title === 'string' ? problem.title : undefined,
    },
    user: {
      uid: typeof user.uid === 'number' ? user.uid : undefined,
      name: typeof user.name === 'string' ? user.name : undefined,
    },
    compilationResult:
      typeof source.compilationResult === 'string' ? source.compilationResult : null,
    raw,
  };
}

/** 读一条评测记录（详情） */
export async function fetchLuoguRecord(rid: number): Promise<LuoguRecord> {
  const raw = await callLuoguBridge<unknown>('record', { rid }, 25000);
  return normalizeLuoguRecord(raw);
}

/** 读某题的提交记录列表；给了 uid 就只看这个账号的记录 */
export async function fetchLuoguRecords(
  pid: string,
  page = 1,
  uid?: string,
): Promise<LuoguRecord[]> {
  const raw = await callLuoguBridge<unknown[]>(
    'records',
    { pid: pid.trim(), page, uid: uid || undefined },
    30000,
  );
  const list = Array.isArray(raw) ? raw : [];
  return list.map(normalizeLuoguRecord);
}

/**
 * 轮询评测结果：洛谷把提交排进评测队列，状态从 Waiting / Judging 变成最终结果需要几秒。
 * 每次拿到新状态就回调一次，方便界面实时更新。
 */
export async function pollLuoguRecord(
  rid: number,
  options: {
    intervalMs?: number;
    timeoutMs?: number;
    onUpdate?: (record: LuoguRecord) => void;
  } = {},
): Promise<LuoguRecord | null> {
  const intervalMs = options.intervalMs ?? 2500;
  const timeoutMs = options.timeoutMs ?? 120000;
  const started = Date.now();
  let last: LuoguRecord | null = null;

  while (Date.now() - started < timeoutMs) {
    try {
      last = await fetchLuoguRecord(rid);
      options.onUpdate?.(last);
      if (!isLuoguPending(last.status)) return last;
    } catch {
      // 单次读取失败（网络抖动 / 洛谷限流）不终止轮询，继续等下一轮
    }
    await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
  }
  return last;
}

/** 诊断用：原样读取洛谷某个路径（只看状态码与响应片段） */
export function debugLuogu(path: string): Promise<{ url: string; status: number; body: string }> {
  return callLuoguBridge('debug', { path }, 25000);
}
