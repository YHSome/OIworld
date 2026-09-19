/**
 * 洛谷提交相关的本地设置。
 *
 * 只保存"与账号无关"的东西：每道题要交到洛谷哪一题、上次用的语言、是否开 O2。
 * **不保存任何登录凭据** —— 书签提交用的是浏览器自己的洛谷登录态。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LuoguState {
  /** 是否开启洛谷 O2 优化提交 */
  enableO2: boolean;
  /** 每个靶场上一次用的洛谷语言编号 */
  languageByTrack: Record<string, number>;
  /** 本站题目 id → 洛谷题号（例如 p1-1 → B3614） */
  problemIds: Record<string, string>;

  setEnableO2: (value: boolean) => void;
  setLanguage: (track: string, lang: number) => void;
  setProblemId: (problemId: string, pid: string) => void;
}

export const useLuoguStore = create<LuoguState>()(
  persist(
    (set) => ({
      enableO2: false,
      languageByTrack: {},
      problemIds: {},

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
