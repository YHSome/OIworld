/**
 * Pro 靶场题库校验（作者用）：
 *
 *   1. 结构检查：每阶段 6 道题、8 个讲解小节齐全、讲解长度、提示与用例数量、id 格式、初始代码含 TODO
 *   2. 编译检查：用与浏览器完全相同的 clang-wasm 工具链编译 solution_code 与 starter_code
 *   3. 运行检查：用 WASI 沙箱跑每个测试用例，逐行比对 expected_output
 *
 * 用法：
 *   node scripts/validate-pro-problems.mjs                # 全部
 *   node scripts/validate-pro-problems.mjs --stage=3      # 只校验阶段三
 *   node scripts/validate-pro-problems.mjs --problem=p3-2 # 只校验一道题
 */

import { PRO_STAGES } from '../src/pro/data.ts';
import {
  compileCpp,
  runWasm,
  normalizeOutput,
  DEFAULT_FLAGS,
} from './node-toolchain.mjs';

const args = process.argv.slice(2);
const stageFilter = Number(
  (args.find((a) => a.startsWith('--stage=')) ?? '').split('=')[1] || 0,
);
const problemFilter = (args.find((a) => a.startsWith('--problem=')) ?? '').split('=')[1];

const REQUIRED_SECTIONS = [
  '### 题目背景',
  '### 任务',
  '### 思路与知识点',
  '### 输入格式',
  '### 输出格式',
  '### 样例',
  '### 常见错误',
];

const failures = [];
let checked = 0;
let caseCount = 0;
const startedAt = Date.now();

console.log(`\n=== Pro 题库校验（clang-wasm，参数 ${DEFAULT_FLAGS.join(' ')}）===\n`);

for (const stage of PRO_STAGES) {
  if (stageFilter && stage.stage !== stageFilter) continue;

  if (!stageFilter && stage.problems.length !== 6) {
    failures.push({
      id: `阶段${stage.stage}`,
      phase: '结构',
      detail: `每阶段应有 6 道题，实际 ${stage.problems.length} 道`,
    });
  }

  for (const problem of stage.problems) {
    if (problemFilter && problem.id !== problemFilter) continue;
    checked += 1;
    const label = `[${problem.id}] ${problem.title}`;
    const issues = [];

    for (const section of REQUIRED_SECTIONS) {
      if (!problem.description.includes(section)) issues.push(`缺少小节 ${section}`);
    }
    if (problem.description.length < 800) {
      issues.push(`讲解过短（${problem.description.length} 字符，要求 ≥ 800）`);
    }
    if (problem.hints.length < 2) issues.push(`提示只有 ${problem.hints.length} 条（要求 ≥ 2）`);
    const hasInput = problem.test_cases.some((test) => test.input.trim().length > 0);
    const minTests = hasInput ? 3 : 1;
    if (problem.test_cases.length < minTests) {
      issues.push(`测试用例只有 ${problem.test_cases.length} 个（要求 ≥ ${minTests}）`);
    }
    for (const [index, testCase] of problem.test_cases.entries()) {
      if (!testCase.expected_output.endsWith('\n')) {
        issues.push(`第 ${index + 1} 个用例的 expected_output 末尾缺少换行`);
      }
    }
    if (!/^p\d-\d$/.test(problem.id)) {
      issues.push(`题目 id 格式应为 p<阶段>-<序号>，实际 ${problem.id}`);
    }
    if (!problem.starter_code.includes('TODO')) issues.push('初始代码里没有 // TODO 引导');

    if (issues.length) {
      failures.push({ id: problem.id, phase: '结构', detail: issues.join('；') });
      continue;
    }

    // 参考题解
    const compiled = await compileCpp(problem.solution_code);
    if (!compiled.ok) {
      failures.push({
        id: problem.id,
        phase: '题解编译失败',
        detail: compiled.diagnostics.trim().slice(0, 600),
      });
      continue;
    }

    let caseFailed = false;
    for (const [index, testCase] of problem.test_cases.entries()) {
      caseCount += 1;
      const ran = await runWasm(compiled.bytes, testCase.input);
      const actual = normalizeOutput(ran.stdout);
      const expected = normalizeOutput(testCase.expected_output);
      if (!ran.ok || actual !== expected) {
        caseFailed = true;
        failures.push({
          id: problem.id,
          phase: `用例 ${index + 1}`,
          detail:
            `\n    输入 : ${JSON.stringify(testCase.input)}` +
            `\n    期望 : ${JSON.stringify(expected)}` +
            `\n    实际 : ${JSON.stringify(actual)}` +
            (ran.error ? `\n    错误 : ${ran.error}` : ''),
        });
      }
    }
    if (caseFailed) continue;

    // 初始代码也必须能编译
    const starterCompiled = await compileCpp(problem.starter_code);
    if (!starterCompiled.ok) {
      failures.push({
        id: problem.id,
        phase: '初始代码编译失败',
        detail: starterCompiled.diagnostics.trim().slice(0, 600),
      });
      continue;
    }

    console.log(`  ✅ ${label}`);
  }
}

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

if (failures.length) {
  console.error('\n❌ 校验未通过：\n');
  for (const failure of failures) {
    console.error(`  [${failure.id}] ${failure.phase}：${failure.detail}`);
  }
  console.error(`\n=== ${checked - failures.length}/${checked} 道题通过，耗时 ${elapsed}s ===\n`);
  process.exit(1);
}

console.log(
  `\n✅ Pro 题库校验通过：${checked} 道题，${caseCount} 个测试点，耗时 ${elapsed}s\n`,
);
