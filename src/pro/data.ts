/**
 * Pro 靶场题库：数据结构与进阶算法，7 个阶段 × 6 道题 = 42 题。
 *
 * 题目内容按阶段拆分在 ./stages/stage-N.ts，每道题用 ./lesson.ts 的 proLesson() 生成
 * 统一结构：题目背景 → 任务 → 思路与知识点 → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士
 *
 * 编译与运行复用 C++ 靶场的链路（clang wasm 在浏览器本地编译 + WASI 沙箱执行），
 * 所以这里只负责汇总、编号与查询辅助。
 */

import type { Difficulty, Problem, ProblemStatus, StageData } from '../types/problem';

import { STAGE_1 } from './stages/stage-1.ts';
import { STAGE_2 } from './stages/stage-2.ts';
import { STAGE_3 } from './stages/stage-3.ts';
import { STAGE_4 } from './stages/stage-4.ts';
import { STAGE_5 } from './stages/stage-5.ts';
import { STAGE_6 } from './stages/stage-6.ts';
import { STAGE_7 } from './stages/stage-7.ts';

export const PRO_STAGES: StageData[] = [
  STAGE_1,
  STAGE_2,
  STAGE_3,
  STAGE_4,
  STAGE_5,
  STAGE_6,
  STAGE_7,
];

export interface ProProblemEntry {
  problem: Problem;
  stage: StageData;
  indexInStage: number;
  globalIndex: number;
}

export const PRO_PROBLEM_ENTRIES: ProProblemEntry[] = PRO_STAGES.flatMap((stage) =>
  stage.problems.map((problem, indexInStage) => ({
    problem,
    stage,
    indexInStage,
    globalIndex: 0,
  })),
);
PRO_PROBLEM_ENTRIES.forEach((entry, index) => {
  entry.globalIndex = index;
});

const proById = new Map(PRO_PROBLEM_ENTRIES.map((entry) => [entry.problem.id, entry]));

export const PRO_DIFFICULTY_COLOR: Record<Difficulty, string> = {
  入门: 'green',
  简单: 'blue',
  中等: 'orange',
  困难: 'red',
};

export function getProProblemEntry(id?: string): ProProblemEntry | null {
  return id ? proById.get(id) ?? null : null;
}

export function getProStage(number: number): StageData | null {
  return PRO_STAGES.find((item) => item.stage === number) ?? null;
}

export function getProStageEntries(number: number): ProProblemEntry[] {
  return PRO_PROBLEM_ENTRIES.filter((entry) => entry.stage.stage === number);
}

export function getProNeighbours(id: string): {
  prev: ProProblemEntry | null;
  next: ProProblemEntry | null;
} {
  const entry = proById.get(id);
  if (!entry) return { prev: null, next: null };
  return {
    prev: PRO_PROBLEM_ENTRIES[entry.globalIndex - 1] ?? null,
    next: PRO_PROBLEM_ENTRIES[entry.globalIndex + 1] ?? null,
  };
}

/** 做题顺序固定为「通过上一题才解锁下一题」；开发者模式可解锁全部 */
export function isProProblemUnlocked(
  id: string,
  completed: string[],
  unlockAll = false,
): boolean {
  if (unlockAll) return true;
  const entry = proById.get(id);
  if (!entry) return false;
  if (entry.globalIndex === 0) return true;
  return completed.includes(PRO_PROBLEM_ENTRIES[entry.globalIndex - 1].problem.id);
}

export function getProProblemStatus(
  id: string,
  completed: string[],
  attempted: string[],
): ProblemStatus {
  if (completed.includes(id)) return 'passed';
  if (attempted.includes(id)) return 'failed';
  return 'todo';
}

export function getProStats(completed: string[], attempted: string[]) {
  const total = PRO_PROBLEM_ENTRIES.length;
  const passed = PRO_PROBLEM_ENTRIES.filter((entry) =>
    completed.includes(entry.problem.id),
  ).length;
  const failed = PRO_PROBLEM_ENTRIES.filter(
    (entry) =>
      !completed.includes(entry.problem.id) && attempted.includes(entry.problem.id),
  ).length;
  return {
    total,
    passed,
    failed,
    todo: total - passed - failed,
    percent: total === 0 ? 0 : Math.round((passed / total) * 100),
  };
}

/** 平铺题目数组：校验脚本（scripts/validate-pro-problems.mjs）按它逐题编译运行 */
export const PRO_PROBLEMS: Problem[] = PRO_PROBLEM_ENTRIES.map((entry) => entry.problem);
