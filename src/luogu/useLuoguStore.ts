/**
 * 洛谷账号绑定状态。
 *
 * 与 vjudge 的「远程账号管理」保持一致的语义：绑定信息只保存在**你自己的浏览器**里
 * （localStorage），本站没有服务器，也没有任何一处会把 Cookie 发到第三方。
 *
 * 两种绑定方式：
 *  - session（默认）：直接用浏览器里已经登录的洛谷会话，不需要粘贴任何东西；
 *  - cookie：像 vjudge 那样粘贴 __client_id 与 _uid，用于"浏览器没登录 / 想用另一个账号"。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LuoguBindingMode, LuoguCookieBinding } from './types';

interface LuoguState {
  mode: LuoguBindingMode;
  /** 洛谷 Cookie: __client_id */
  clientId: string;
  /** 洛谷 Cookie: _uid */
  uid: string;
  /** 绑定时探测到的账号名（可能为空，洛谷不总是给出） */
  accountName: string;
  /** 绑定时间（毫秒时间戳） */
  boundAt: number | null;
  /** 是否开启洛谷 O2 优化提交 */
  enableO2: boolean;
  /** 上次提交使用的语言（针对每个靶场） */
  languageByTrack: Record<string, number>;
  /** 本站题目 id → 洛谷题号（例如 p1-1 → P1001） */
  problemIds: Record<string, string>;

  bindCookie: (input: LuoguCookieBinding & { name?: string | null }) => void;
  markSessionBound: (input: { name?: string | null; uid?: number | null }) => void;
  unbind: () => void;
  setEnableO2: (value: boolean) => void;
  setLanguage: (track: string, lang: number) => void;
  setProblemId: (problemId: string, pid: string) => void;
}

/** 判断是否已经"绑定"：session 模式看账号名/uid，cookie 模式看 clientId */
export function isLuoguBound(state: Pick<LuoguState, 'mode' | 'clientId' | 'boundAt'>): boolean {
  if (!state.boundAt) return false;
  if (state.mode === 'cookie') return Boolean(state.clientId);
  return true;
}

export const useLuoguStore = create<LuoguState>()(
  persist(
    (set) => ({
      mode: 'session',
      clientId: '',
      uid: '',
      accountName: '',
      boundAt: null,
      enableO2: false,
      languageByTrack: {},
      problemIds: {},

      bindCookie: (input) =>
        set((state) => ({
          mode: 'cookie',
          clientId: input.clientId.trim(),
          uid: input.uid.trim(),
          accountName: input.name || state.accountName,
          boundAt: Date.now(),
        })),

      markSessionBound: ({ name, uid }) =>
        set((state) => ({
          mode: 'session',
          accountName: name || state.accountName,
          uid: uid ? String(uid) : state.uid,
          boundAt: Date.now(),
        })),

      unbind: () =>
        set({ clientId: '', uid: '', accountName: '', boundAt: null, mode: 'session' }),

      setEnableO2: (value) => set({ enableO2: value }),

      setLanguage: (track, lang) =>
        set((state) => ({ languageByTrack: { ...state.languageByTrack, [track]: lang } })),

      setProblemId: (problemId, pid) =>
        set((state) => ({
          problemIds: { ...state.problemIds, [problemId]: pid.trim().toUpperCase() },
        })),
    }),
    { name: 'oiworld:luogu' },
  ),
);

/** 只在 cookie 模式下取出要交给桥的凭据 */
export function getCookieBindingForRequest(): LuoguCookieBinding | undefined {
  const state = useLuoguStore.getState();
  if (state.mode !== 'cookie' || !state.clientId.trim()) return undefined;
  return { clientId: state.clientId.trim(), uid: state.uid.trim() };
}

/** 展示用的 Cookie 掩码，避免在界面上完整回显凭据 */
export function maskClientId(clientId: string): string {
  if (!clientId) return '';
  if (clientId.length <= 8) return `${clientId.slice(0, 2)}****`;
  return `${clientId.slice(0, 4)}****${clientId.slice(-4)}`;
}
