/**
 * Pro 靶场（数据结构与进阶算法）的写作辅助。
 *
 * 42 道题的 description 按同一套结构拼装：
 *   题目背景 → 任务 → 思路与知识点 → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士
 *
 * 与 C++ / Python / Java 靶场的差别：这里的读者已经会写基础语法，
 * 所以「思路与知识点」重点是**算法本身**（数据结构怎么建、复杂度是多少、边界怎么处理），
 * 而不是逐个语法点解释。
 */

import type { Difficulty, Problem } from '../types/problem';

export interface ProLessonInput {
  /** 题目 id，格式 p<阶段>-<序号>，例如 p3-5 */
  id: string;
  title: string;
  difficulty: Difficulty;
  /** 知识点标签，8 字以内，例如「单调栈」「并查集」 */
  knowledge: string;
  /** 题目背景：一两句话说明这题在什么场景下出现 */
  story: string;
  /** 任务：一句话说清要做什么 */
  task: string;
  /** 思路与知识点：算法讲解（含复杂度分析、关键代码片段、要点表格） */
  lesson: string;
  inputFormat: string;
  outputFormat: string;
  /** 样例段落；不填时用第一个测试用例自动生成，保证题面与判题数据一致 */
  sample?: string;
  /** 常见错误：用 mistakesTable([...]) 生成 */
  mistakes: string;
  /** 小贴士：数据范围、复杂度取舍、实现建议 */
  tips?: string;
  /** 初始代码：必须能编译通过，只留 // TODO 引导 */
  starter: string;
  /** 参考题解：必须能在本题所有测试用例上通过 */
  solution: string;
  /** 测试用例：3~5 个，input / expected 末尾都要有 \n */
  tests: { input: string; expected: string }[];
  /** 提示：2~4 条，每条一句话，优先给"从哪下手"而不是直接给答案 */
  hints: string[];
  /**
   * 洛谷同类型题目的搜索关键词（可选）。
   * 注意：本站不抓取洛谷题面，只提供跳转到洛谷题目列表搜索的链接；
   * 如果以后能核验精确题号，可以另外填 luoguCode。
   */
  luoguKeyword?: string;
  /** 洛谷题号（可选，例如 P3367）。只在人工核对过之后才填 */
  luoguCode?: string;
}

/** 「你可能写成 | 会发生什么 | 正确写法」三列表格 */
export function mistakesTable(rows: [string, string, string][]): string {
  return [
    '| 常见写法 | 会发生什么 | 正确写法 |',
    '| --- | --- | --- |',
    ...rows.map(([wrong, result, right]) => `| ${wrong} | ${result} | ${right} |`),
  ].join('\n');
}

/** 「要点 | 说明」两列表格 */
export function pointsTable(rows: [string, string][]): string {
  return [
    '| 要点 | 说明 |',
    '| --- | --- |',
    ...rows.map(([point, detail]) => `| ${point} | ${detail} |`),
  ].join('\n');
}

function sampleFromFirstTest(tests: ProLessonInput['tests']): string {
  const first = tests[0];
  const input = first.input.replace(/\n$/, '');
  const output = first.expected.replace(/\n$/, '');
  if (!input) return ['### 样例', '', '**输出**', '', '```', output, '```'].join('\n');
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

export function proLesson(input: ProLessonInput): Problem {
  const sections = [
    `### 题目背景\n\n${input.story}`,
    `### 任务\n\n${input.task}`,
    `### 思路与知识点\n\n${input.lesson}`,
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
    luogu_keyword: input.luoguKeyword,
    luogu_code: input.luoguCode,
  };
}

/** 生成 C++ 程序外壳：starter / solution 只写 main 里的内容 */
export function cppMain(
  body: string,
  options: { includes?: string; globals?: string } = {},
): string {
  const includes = options.includes ?? '#include <iostream>\nusing namespace std;';
  const globals = options.globals ? `\n${options.globals}\n` : '';
  return `${includes}
${globals}
int main() {
${body}
    return 0;
}
`;
}
