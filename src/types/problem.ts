/**
 * OIworld 数据模型定义
 * 与题目 JSON 文件（src/data/problems/*.json）严格对应。
 */

/** 题目难度 */
export type Difficulty = '入门' | '简单' | '中等';

/** 单个测试用例 */
export interface TestCase {
  /** 标准输入 */
  input: string;
  /** 期望的标准输出 */
  expected_output: string;
}

/** 题目 */
export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  /** 知识点标签，例如 "cout 输出" */
  knowledge_point: string;
  /** Markdown 格式的题目描述 */
  description: string;
  /** 初始代码（编辑器首次打开时展示） */
  starter_code: string;
  /** 参考题解代码 */
  solution_code: string;
  test_cases: TestCase[];
  hints: string[];
}

/** 一个阶段（阶段一到阶段七）的所有题目 */
export interface StageData {
  /** 阶段序号，1 开始 */
  stage: number;
  title: string;
  subtitle: string;
  /** 阶段知识范围简介（Markdown） */
  summary: string;
  problems: Problem[];
}

/** 题目在当前用户下的完成状态 */
export type ProblemStatus = 'todo' | 'passed' | 'failed';

/** 用户进度（持久化到 localStorage） */
export interface UserProgress {
  /** 已通过的题目 ID 列表 */
  completedProblems: string[];
  /** 已尝试但未通过的题目 ID 列表（用于展示“未通过”状态） */
  attemptedProblems: string[];
  /** 最后访问的题目 ID */
  lastVisitedProblemId: string;
}

/** 导出/导入进度的文件结构 */
export interface ProgressExport {
  app: 'oiworld';
  version: 1;
  exportedAt: string;
  progress: UserProgress;
  /** 用户在各题中的代码草稿 */
  drafts?: Record<string, string>;
}

/** 运行结果状态 */
export type RunStatus =
  | 'passed'
  | 'wrong-answer'
  | 'compile-error'
  | 'runtime-error'
  | 'timeout'
  | 'output-limit'
  | 'crashed';

/** 单次运行（一次编译 + 一次执行）的完整结果 */
export interface RunOutcome {
  status: RunStatus;
  /** 编译诊断信息（stderr） */
  diagnostics: string;
  /** 程序标准输出 */
  stdout: string;
  /** 程序标准错误输出 */
  stderr: string;
  /** 退出码，null 表示未正常结束 */
  exitCode: number | null;
  /** 编译耗时（毫秒） */
  compileMs: number;
  /** 运行耗时（毫秒） */
  runMs: number;
  /** 人类可读的补充说明（超时、崩溃等） */
  message?: string;
}
