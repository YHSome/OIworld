/**
 * 学习进度（localStorage 持久化）。
 *
 * 使用 zustand + persist 中间件，刷新页面后进度不丢失，
 * 并且支持导出 / 导入 JSON 文件，方便换设备时迁移。
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressExport, UserProgress } from '../types/problem';
import { ALL_PROBLEMS } from '../data';

export const STORAGE_KEY = 'oiworld:progress';

interface ProgressState extends UserProgress {
  /** 各题的代码草稿：problemId -> code */
  drafts: Record<string, string>;
  /**
   * 开发者模式（给题库作者 / 前端开发者用）。
   *
   * 注意：做题顺序是**固定的闯关规则**（通过上一题才能解锁下一题），
   * 没有"关闭闯关"的开关；开发者模式是唯一的解锁途径。
   *
   *  - 解锁全部题目
   *  - 未通过也能查看参考题解，并可一键把题解填进编辑器
   *  - 题目页显示开发者面板：编译参数、工具链来源、耗时、原始诊断
   * 打开方式：URL 加 ?dev=1 / ?dev=0，或快捷键 Ctrl+Shift+D，或在「我的进度 → 设置」里切换。
   */
  developerMode: boolean;

  markCompleted: (problemId: string) => void;
  markAttempted: (problemId: string) => void;
  setLastVisited: (problemId: string) => void;
  setDraft: (problemId: string, code: string) => void;
  clearDraft: (problemId: string) => void;
  setDeveloperMode: (enabled: boolean) => void;
  resetProgress: () => void;
  buildExport: () => ProgressExport;
  importProgress: (raw: unknown) => { ok: boolean; message: string };
}

const ALL_IDS = new Set(ALL_PROBLEMS.map((entry) => entry.problem.id));

function sanitizeIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is string => typeof item === 'string' && ALL_IDS.has(item),
  );
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedProblems: [],
      attemptedProblems: [],
      lastVisitedProblemId: '',
      drafts: {},
      developerMode: false,

      markCompleted: (problemId) =>
        set((state) => ({
          completedProblems: state.completedProblems.includes(problemId)
            ? state.completedProblems
            : [...state.completedProblems, problemId],
          attemptedProblems: state.attemptedProblems.filter(
            (id) => id !== problemId,
          ),
          lastVisitedProblemId: problemId,
        })),

      markAttempted: (problemId) =>
        set((state) => ({
          attemptedProblems: state.attemptedProblems.includes(problemId)
            ? state.attemptedProblems
            : [...state.attemptedProblems, problemId],
          lastVisitedProblemId: problemId,
        })),

      setLastVisited: (problemId) => set({ lastVisitedProblemId: problemId }),

      setDraft: (problemId, code) =>
        set((state) => {
          if (state.drafts[problemId] === code) return state;
          return { drafts: { ...state.drafts, [problemId]: code } };
        }),

      clearDraft: (problemId) =>
        set((state) => {
          const drafts = { ...state.drafts };
          delete drafts[problemId];
          return { drafts };
        }),

      setDeveloperMode: (enabled) => set({ developerMode: enabled }),

      resetProgress: () =>
        set({
          completedProblems: [],
          attemptedProblems: [],
          lastVisitedProblemId: '',
          drafts: {},
        }),

      buildExport: () => {
        const state = get();
        return {
          app: 'oiworld',
          version: 1,
          exportedAt: new Date().toISOString(),
          progress: {
            completedProblems: state.completedProblems,
            attemptedProblems: state.attemptedProblems,
            lastVisitedProblemId: state.lastVisitedProblemId,
          },
          drafts: state.drafts,
        };
      },

      importProgress: (raw) => {
        if (!raw || typeof raw !== 'object') {
          return { ok: false, message: '文件内容不是合法 JSON 对象' };
        }
        const data = raw as Partial<ProgressExport> & {
          completedProblems?: unknown;
          attemptedProblems?: unknown;
        };
        // 兼容两种格式：完整导出文件 / 直接的 progress 对象
        const source =
          data.progress && typeof data.progress === 'object'
            ? data.progress
            : (data as unknown as Partial<UserProgress>);
        const completed = sanitizeIds(source?.completedProblems);
        const attempted = sanitizeIds(source?.attemptedProblems);
        if (completed.length === 0 && attempted.length === 0) {
          return { ok: false, message: '文件里没有可识别的题目进度数据' };
        }
        const drafts: Record<string, string> = {};
        if (data.drafts && typeof data.drafts === 'object') {
          for (const [key, value] of Object.entries(data.drafts)) {
            if (ALL_IDS.has(key) && typeof value === 'string') {
              drafts[key] = value;
            }
          }
        }
        set({
          completedProblems: completed,
          attemptedProblems: attempted.filter((id) => !completed.includes(id)),
          lastVisitedProblemId:
            typeof source?.lastVisitedProblemId === 'string' &&
            ALL_IDS.has(source.lastVisitedProblemId)
              ? source.lastVisitedProblemId
              : '',
          drafts: Object.keys(drafts).length > 0 ? drafts : get().drafts,
        });
        return {
          ok: true,
          message: `成功导入 ${completed.length} 道已通过题目`,
        };
      },
    }),
    {
      name: STORAGE_KEY,
      version: 1,
    },
  ),
);
