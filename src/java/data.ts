/**
 * Java 靶场题库：7 个阶段 × 6 道题 = 42 题。
 *
 * 题目内容按阶段拆分在 ./stages/stage-N.ts 里，每道题用 ../java/lesson.ts 的 lesson()
 * 生成统一结构：题目背景 → 任务 → 本关新知识 → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士
 *
 * 本文件只负责汇总、编号与查询辅助（API 与 C++ / Python 靶场保持一致）。
 */

import type { Difficulty, Problem, ProblemStatus, StageData } from '../types/problem';
import { withLuoguCodes } from '../data/luogu-codes.ts';

import { STAGE_1 } from './stages/stage-1.ts';
import { STAGE_2 } from './stages/stage-2.ts';
import { STAGE_3 } from './stages/stage-3.ts';
import { STAGE_4 } from './stages/stage-4.ts';
import { STAGE_5 } from './stages/stage-5.ts';
import { STAGE_6 } from './stages/stage-6.ts';
import { STAGE_7 } from './stages/stage-7.ts';

export const JAVA_STAGES: StageData[] = [
  STAGE_1,
  STAGE_2,
  STAGE_3,
  STAGE_4,
  STAGE_5,
  STAGE_6,
  STAGE_7,
  // 每个阶段补上「洛谷同类型练习」的题号（表见 src/data/luogu-codes.ts）
].map((stage) => withLuoguCodes(stage));

export interface JavaProblemEntry {
  problem: Problem;
  stage: StageData;
  /** 在阶段内的序号，从 0 开始 */
  indexInStage: number;
  /** 在全部题目中的序号，从 0 开始（用于顺序解锁） */
  globalIndex: number;
}

export const JAVA_PROBLEM_ENTRIES: JavaProblemEntry[] = JAVA_STAGES.flatMap(
  (stage) =>
    stage.problems.map((problem, indexInStage) => ({
      problem,
      stage,
      indexInStage,
      globalIndex: 0,
    })),
);
JAVA_PROBLEM_ENTRIES.forEach((entry, index) => {
  entry.globalIndex = index;
});

const javaById = new Map(
  JAVA_PROBLEM_ENTRIES.map((entry) => [entry.problem.id, entry]),
);

export const JAVA_DIFFICULTY_COLOR: Record<Difficulty, string> = {
  入门: 'green',
  简单: 'blue',
  中等: 'orange',
  困难: 'red',
};

export function getJavaProblemEntry(id?: string): JavaProblemEntry | null {
  return id ? javaById.get(id) ?? null : null;
}

export function getJavaStage(number: number): StageData | null {
  return JAVA_STAGES.find((item) => item.stage === number) ?? null;
}

export function getJavaStageEntries(number: number): JavaProblemEntry[] {
  return JAVA_PROBLEM_ENTRIES.filter((entry) => entry.stage.stage === number);
}

export function getJavaNeighbours(id: string): {
  prev: JavaProblemEntry | null;
  next: JavaProblemEntry | null;
} {
  const entry = javaById.get(id);
  if (!entry) return { prev: null, next: null };
  return {
    prev: JAVA_PROBLEM_ENTRIES[entry.globalIndex - 1] ?? null,
    next: JAVA_PROBLEM_ENTRIES[entry.globalIndex + 1] ?? null,
  };
}

/** 做题顺序固定为「通过上一题才解锁下一题」；开发者模式可解锁全部 */
export function isJavaProblemUnlocked(
  id: string,
  completed: string[],
  unlockAll = false,
): boolean {
  if (unlockAll) return true;
  const entry = javaById.get(id);
  if (!entry) return false;
  if (entry.globalIndex === 0) return true;
  return completed.includes(
    JAVA_PROBLEM_ENTRIES[entry.globalIndex - 1].problem.id,
  );
}

export function getJavaProblemStatus(
  id: string,
  completed: string[],
  attempted: string[],
): ProblemStatus {
  if (completed.includes(id)) return 'passed';
  if (attempted.includes(id)) return 'failed';
  return 'todo';
}

export function getJavaStats(completed: string[], attempted: string[]) {
  const total = JAVA_PROBLEM_ENTRIES.length;
  const passed = JAVA_PROBLEM_ENTRIES.filter((entry) =>
    completed.includes(entry.problem.id),
  ).length;
  const failed = JAVA_PROBLEM_ENTRIES.filter(
    (entry) =>
      !completed.includes(entry.problem.id) &&
      attempted.includes(entry.problem.id),
  ).length;
  return {
    total,
    passed,
    failed,
    todo: total - passed - failed,
    percent: total === 0 ? 0 : Math.round((passed / total) * 100),
  };
}

/** 平铺题目数组：题库校验脚本（scripts/validate-java-problems.mjs）按它逐题编译运行 */
export const JAVA_PROBLEMS: Problem[] = JAVA_PROBLEM_ENTRIES.map(
  (entry) => entry.problem,
);
