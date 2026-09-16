/**
 * 题库校验脚本（开发用）：
 *
 *   1. 结构校验：字段是否齐全、类型是否正确、测试用例是否为空；
 *   2. 参考题解校验：solution_code 必须能编译通过，并在每个测试用例上
 *      产生与 expected_output 完全一致（忽略行尾空格与末尾换行）的输出；
 *   3. 初始代码校验：starter_code 必须能编译通过（允许输出不对）。
 *
 * 它使用与浏览器端完全相同的 clang-wasm 工具链，
 * 所以通过了这个脚本，就等于在浏览器里也能跑通。
 *
 * 用法：
 *   node scripts/validate-problems.mjs                 # 全部阶段
 *   node scripts/validate-problems.mjs --stage=3       # 只校验阶段三
 *   node scripts/validate-problems.mjs --problem=s3-p2 # 只校验某道题
 *   node scripts/validate-problems.mjs --skip-starter  # 跳过 starter_code 编译
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  compileCpp,
  runWasm,
  normalizeOutput,
  DEFAULT_FLAGS,
} from './node-toolchain.mjs';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const problemsDir = path.join(root, 'src', 'data', 'problems');

const args = process.argv.slice(2);
const stageFilter = Number(
  (args.find((a) => a.startsWith('--stage=')) ?? '').split('=')[1] || 0,
);
const problemFilter = (args.find((a) => a.startsWith('--problem=')) ?? '').split('=')[1];
const skipStarter = args.includes('--skip-starter');

const REQUIRED_FIELDS = [
  'id',
  'title',
  'difficulty',
  'knowledge_point',
  'description',
  'starter_code',
  'solution_code',
  'test_cases',
  'hints',
];
const DIFFICULTIES = new Set(['入门', '简单', '中等']);

const files = fs
  .readdirSync(problemsDir)
  .filter((f) => /^stage-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

const problems = [];
for (const file of files) {
  const data = JSON.parse(fs.readFileSync(path.join(problemsDir, file), 'utf8'));
  if (stageFilter && data.stage !== stageFilter) continue;
  for (const problem of data.problems) {
    if (problemFilter && problem.id !== problemFilter) continue;
    problems.push({ ...problem, __file: file, __stage: data.stage });
  }
}

let failures = 0;
let checked = 0;
const startedAt = Date.now();

console.log(`\n=== 题库校验：${problems.length} 道题（编译参数 ${DEFAULT_FLAGS.join(' ')}）===\n`);

for (const problem of problems) {
  checked += 1;
  const issues = [];

  // ---------- 1. 结构校验 ----------
  for (const field of REQUIRED_FIELDS) {
    if (problem[field] === undefined || problem[field] === null) {
      issues.push(`缺少字段 ${field}`);
    }
  }
  if (!DIFFICULTIES.has(problem.difficulty)) {
    issues.push(`难度取值非法：${problem.difficulty}`);
  }
  if (!Array.isArray(problem.test_cases) || problem.test_cases.length === 0) {
    issues.push('test_cases 为空');
  }
  if (!Array.isArray(problem.hints) || problem.hints.length === 0) {
    issues.push('hints 为空');
  }
  for (const [i, tc] of (problem.test_cases ?? []).entries()) {
    if (typeof tc.input !== 'string' || typeof tc.expected_output !== 'string') {
      issues.push(`第 ${i + 1} 个测试用例缺少 input / expected_output`);
    }
  }

  // ---------- 2. 参考题解校验 ----------
  let detail = '';
  if (issues.length === 0) {
    const compiled = await compileCpp(problem.solution_code, DEFAULT_FLAGS);
    if (!compiled.ok) {
      issues.push(`参考题解编译失败：\n${indent(compiled.diagnostics)}`);
    } else {
      for (const [i, tc] of problem.test_cases.entries()) {
        const ran = await runWasm(compiled.bytes, tc.input);
        const actual = normalizeOutput(ran.stdout);
        const expected = normalizeOutput(tc.expected_output);
        if (!ran.ok) {
          issues.push(`用例 ${i + 1} 运行失败：${ran.error ?? '未知错误'}`);
        } else if (actual !== expected) {
          issues.push(
            `用例 ${i + 1} 输出不一致：\n  输入    : ${JSON.stringify(tc.input)}\n  期望    : ${JSON.stringify(expected)}\n  题解实际: ${JSON.stringify(actual)}`,
          );
        }
      }
      if (compiled.diagnostics.trim()) {
        detail = `（题解编译有警告）${compiled.diagnostics.trim().split('\n')[0]}`;
      }
    }

    // ---------- 3. 初始代码校验 ----------
    if (issues.length === 0 && !skipStarter) {
      const starterCompiled = await compileCpp(problem.starter_code, DEFAULT_FLAGS);
      if (!starterCompiled.ok) {
        issues.push(
          `starter_code 无法编译（初始代码必须能通过编译）：\n${indent(starterCompiled.diagnostics)}`,
        );
      }
    }
  }

  const label = `[${problem.id}] ${problem.title}`;
  if (issues.length === 0) {
    console.log(`  ✅ ${label} ${detail}`);
    // stderr 里如果出现警告也提示一下
  } else {
    failures += 1;
    console.log(`  ❌ ${label}`);
    for (const issue of issues) console.log(`       - ${issue}`);
  }
}

console.log(
  `\n=== 完成：${checked - failures}/${checked} 通过，耗时 ${((Date.now() - startedAt) / 1000).toFixed(1)}s ===\n`,
);

if (failures > 0) {
  process.exitCode = 1;
}

function indent(text) {
  return String(text ?? '')
    .trim()
    .split('\n')
    .map((line) => `         ${line}`)
    .join('\n');
}
