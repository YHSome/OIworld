/**
 * 题目数据加载与查询。
 *
 * 题目以 JSON 文件存放在 src/data/problems/ 下（阶段一 ~ 阶段七），
 * 由 Vite 打包进前端产物，因此完全离线可用，不依赖后端接口。
 */

import type {
  Difficulty,
  Problem,
  ProblemStatus,
  StageData,
} from '../types/problem';

import stage1 from './problems/stage-1.json';
import stage2 from './problems/stage-2.json';
import stage3 from './problems/stage-3.json';
import stage4 from './problems/stage-4.json';
import stage5 from './problems/stage-5.json';
import stage6 from './problems/stage-6.json';
import stage7 from './problems/stage-7.json';
import { withLuoguCodes } from './luogu-codes';

export const STAGES: StageData[] = (
  [stage1, stage2, stage3, stage4, stage5, stage6, stage7] as unknown as StageData[]
)
  .slice()
  .sort((a, b) => a.stage - b.stage)
  // 每个阶段补上「洛谷同类型练习」的题号（表见 src/data/luogu-codes.ts）
  .map((stage) => withLuoguCodes(stage));

/** 题目 + 它所属阶段的信息 */
export interface ProblemEntry {
  problem: Problem;
  stage: StageData;
  /** 在阶段内的序号，从 0 开始 */
  indexInStage: number;
  /** 在全部题目中的序号，从 0 开始（用于“解锁下一题”） */
  globalIndex: number;
}

export const ALL_PROBLEMS: ProblemEntry[] = STAGES.flatMap((stage) =>
  stage.problems.map((problem, indexInStage) => ({
    problem,
    stage,
    indexInStage,
    globalIndex: 0,
  })),
);
ALL_PROBLEMS.forEach((entry, index) => {
  entry.globalIndex = index;
});

const PROBLEM_MAP = new Map<string, ProblemEntry>(
  ALL_PROBLEMS.map((entry) => [entry.problem.id, entry]),
);

export const DIFFICULTY_ORDER: Difficulty[] = ['入门', '简单', '中等', '困难'];

export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  入门: 'green',
  简单: 'blue',
  中等: 'orange',
  困难: 'red',
};

export function getProblemEntry(id: string | undefined): ProblemEntry | null {
  if (!id) return null;
  return PROBLEM_MAP.get(id) ?? null;
}

export function getStage(stageNumber: number): StageData | null {
  return STAGES.find((stage) => stage.stage === stageNumber) ?? null;
}

/** 某个阶段的全部题目（带全局序号，用于解锁判断） */
export function getStageEntries(stageNumber: number): ProblemEntry[] {
  return ALL_PROBLEMS.filter((entry) => entry.stage.stage === stageNumber);
}

/** 上一题 / 下一题（跨阶段连续） */
export function getNeighbours(id: string): {
  prev: ProblemEntry | null;
  next: ProblemEntry | null;
} {
  const entry = PROBLEM_MAP.get(id);
  if (!entry) return { prev: null, next: null };
  return {
    prev: ALL_PROBLEMS[entry.globalIndex - 1] ?? null,
    next: ALL_PROBLEMS[entry.globalIndex + 1] ?? null,
  };
}

/** 某道题的完成状态 */
export function getProblemStatus(
  problemId: string,
  completed: string[],
  attempted: string[],
): ProblemStatus {
  if (completed.includes(problemId)) return 'passed';
  if (attempted.includes(problemId)) return 'failed';
  return 'todo';
}

/**
 * 题目是否已解锁。**闯关模式是固定规则**：
 * 第一题默认解锁，之后每道题需要前一题已通过。
 *
 * 唯一的例外是开发者模式（`unlockAll = true`），
 * 方便题库作者 / 前端开发者直接抽查任意题目。
 */
export function isProblemUnlocked(
  problemId: string,
  completed: string[],
  unlockAll = false,
): boolean {
  if (unlockAll) return true;
  const entry = PROBLEM_MAP.get(problemId);
  if (!entry) return false;
  if (entry.globalIndex === 0) return true;
  const previous = ALL_PROBLEMS[entry.globalIndex - 1];
  return completed.includes(previous.problem.id);
}

/** 阶段统计信息 */
export interface StageStats {
  total: number;
  passed: number;
  failed: number;
  /** 0 ~ 100 */
  percent: number;
  difficulty: Difficulty;
}

export function getStageStats(
  stage: StageData,
  completed: string[],
  attempted: string[],
): StageStats {
  const total = stage.problems.length;
  const passed = stage.problems.filter((p) => completed.includes(p.id)).length;
  const failed = stage.problems.filter(
    (p) => !completed.includes(p.id) && attempted.includes(p.id),
  ).length;
  let difficulty: Difficulty = '入门';
  for (const problem of stage.problems) {
    if (DIFFICULTY_ORDER.indexOf(problem.difficulty) > DIFFICULTY_ORDER.indexOf(difficulty)) {
      difficulty = problem.difficulty;
    }
  }
  return {
    total,
    passed,
    failed,
    percent: total === 0 ? 0 : Math.round((passed / total) * 100),
    difficulty,
  };
}

export interface ProblemFilter {
  keyword?: string;
  difficulty?: Difficulty | 'all';
  status?: ProblemStatus | 'all';
}

/** 首页搜索 + 筛选 */
export function filterProblems(
  entries: ProblemEntry[],
  filter: ProblemFilter,
  completed: string[],
  attempted: string[],
): ProblemEntry[] {
  const keyword = (filter.keyword ?? '').trim().toLowerCase();
  return entries.filter((entry) => {
    const { problem, stage } = entry;
    if (keyword) {
      const haystack = `${problem.id} ${problem.title} ${problem.knowledge_point} ${stage.title}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    if (filter.difficulty && filter.difficulty !== 'all') {
      if (problem.difficulty !== filter.difficulty) return false;
    }
    if (filter.status && filter.status !== 'all') {
      if (getProblemStatus(problem.id, completed, attempted) !== filter.status) {
        return false;
      }
    }
    return true;
  });
}

/** 全局进度统计 */
export function getOverallStats(completed: string[], attempted: string[]) {
  const total = ALL_PROBLEMS.length;
  const passed = ALL_PROBLEMS.filter((e) =>
    completed.includes(e.problem.id),
  ).length;
  const failed = ALL_PROBLEMS.filter(
    (e) =>
      !completed.includes(e.problem.id) && attempted.includes(e.problem.id),
  ).length;
  return {
    total,
    passed,
    failed,
    todo: total - passed - failed,
    percent: total === 0 ? 0 : Math.round((passed / total) * 100),
  };
}
