/**
 * Java 题库的写作辅助。
 *
 * 42 道题的 description 都按同一套结构拼装，避免各写各的：
 *
 *   题目背景 → 任务 → 本关新知识 → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士
 *
 * 作者只需要按字段提供每一节的 Markdown，`lesson()` 负责标题、空行与 test_cases 的转换。
 * 同时提供 mistakesTable / pointsTable 两个小工具，减少手写表格时的格式错误。
 */

import type { Difficulty, Problem } from '../types/problem';

export interface LessonInput {
  /** 题目 id，格式 j<阶段>-<序号>，例如 j3-5 */
  id: string;
  title: string;
  difficulty: Difficulty;
  /** 知识点标签，8 字以内 */
  knowledge: string;
  /** 题目背景：1~3 句生活化的场景，说明这题要解决什么问题 */
  story: string;
  /** 任务：一句话说清要做什么 */
  task: string;
  /** 本关新知识：这道题需要的语法（大白话 + 可运行代码 + 要点表格） */
  lesson: string;
  inputFormat: string;
  outputFormat: string;
  /** 样例段落（Markdown）。不填时自动用第一个测试用例生成，保证题面与判题数据一致 */
  sample?: string;
  /** 常见错误：用 mistakesTable([...]) 生成 */
  mistakes: string;
  /** 小贴士（可选） */
  tips?: string;
  /** 初始代码：必须能编译通过，只能留 // TODO 引导 */
  starter: string;
  /** 参考题解：必须是 Java 8 语法，且通过 javac --release 8 */
  solution: string;
  /** 测试用例：每题 3~5 个，input / expected 末尾都要有 \n */
  tests: { input: string; expected: string }[];
  /** 提示：2~4 条，每条一句话 */
  hints: string[];
}

/** 「你可能写成 | 会发生什么 | 正确写法」三列表格 */
export function mistakesTable(rows: [string, string, string][]): string {
  return [
    '| 你可能写成 | 会发生什么 | 正确写法 |',
    '| --- | --- | --- |',
    ...rows.map(([wrong, result, right]) => `| ${wrong} | ${result} | ${right} |`),
  ].join('\n');
}

/** 「要点 | 说明」两列表格，用于「本关新知识」里的记忆要点 */
export function pointsTable(rows: [string, string][]): string {
  return [
    '| 要点 | 说明 |',
    '| --- | --- |',
    ...rows.map(([point, detail]) => `| ${point} | ${detail} |`),
  ].join('\n');
}

/** 用第一个测试用例自动生成样例段落 */
function sampleFromFirstTest(tests: LessonInput['tests']): string {
  const first = tests[0];
  const input = first.input.replace(/\n$/, '');
  const output = first.expected.replace(/\n$/, '');
  if (!input) {
    return ['### 样例', '', '**输出**', '', '```', output, '```'].join('\n');
  }
  return [
    '### 样例',
    '',
    '**输入**',
    '',
    '```',
    input,
    '```',
    '',
    '**输出**',
    '',
    '```',
    output,
    '```',
  ].join('\n');
}

export function lesson(input: LessonInput): Problem {
  const sections = [
    `### 题目背景\n\n${input.story}`,
    `### 任务\n\n${input.task}`,
    `### 本关新知识\n\n${input.lesson}`,
    `### 输入格式\n\n${input.inputFormat}`,
    `### 输出格式\n\n${input.outputFormat}`,
    input.sample ?? sampleFromFirstTest(input.tests),
    `### 常见错误\n\n${input.mistakes}`,
    input.tips ? `### 小贴士\n\n${input.tips}` : '',
  ].filter(Boolean);

  return {
    id: input.id,
    title: input.title,
    difficulty: input.difficulty,
    knowledge_point: input.knowledge,
    description: sections.join('\n\n'),
    starter_code: input.starter,
    solution_code: input.solution,
    test_cases: input.tests.map((test) => ({
      input: test.input,
      expected_output: test.expected,
    })),
    hints: input.hints,
  };
}

/** 生成 Java 程序外壳，让 starter / solution 只写 main 方法里的内容 */
export function mainOnly(
  body: string,
  options: { imports?: string } = {},
): string {
  const imports = options.imports ? `${options.imports}\n\n` : '';
  return `${imports}public class Main {
    public static void main(String[] args) {
${body}
    }
}
`;
}
