#!/usr/bin/env node
/**
 * 洛谷题号校验（题库内容门禁之一）。
 *
 * 题库里写的每个 luogu_code 都必须在洛谷上真实存在，且标题能取到。
 * 覆盖全部四个靶场：C++ / Python / Java（映射表 src/data/luogu-codes.ts）
 * 与 Pro（题号直接写在 stage 文件里）。
 * 这个脚本会真的访问 www.luogu.com.cn（只读，不提交任何东西）。
 *
 *   npm run validate:luogu
 *   node scripts/verify-luogu-codes.mjs --track=cpp
 *   node scripts/verify-luogu-codes.mjs --problem=p1-1
 *
 * 为什么要专门校验：题号一旦写错，用户点「提交到洛谷」就会交到别的题上，
 * 这是内容层面最容易犯、也最难靠肉眼发现的错误。
 */

import { readFileSync } from 'node:fs';
import { createLuoguClient, extractPageTitle, LUOGU_BASE } from './lib/luogu-http.mjs';
import { BEGINNER_LUOGU_CODES } from '../src/data/luogu-codes.ts';
import { PYTHON_PROBLEMS } from '../src/python/data.ts';
import { JAVA_PROBLEM_ENTRIES } from '../src/java/data.ts';
import { PRO_PROBLEM_ENTRIES } from '../src/pro/data.ts';

const client = createLuoguClient();
const onlyProblem = process.argv.find((arg) => arg.startsWith('--problem='))?.split('=')[1];
const onlyTrack = process.argv.find((arg) => arg.startsWith('--track='))?.split('=')[1];
const delayMs = Number(process.argv.find((arg) => arg.startsWith('--delay='))?.split('=')[1] ?? 300);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** C++ 题库在 JSON 里，题号来自映射表（与 src/data/index.ts 的处理一致） */
function loadCppProblems() {
  const problems = [];
  for (let stage = 1; stage <= 7; stage += 1) {
    const json = JSON.parse(
      readFileSync(new URL(`../src/data/problems/stage-${stage}.json`, import.meta.url), 'utf8'),
    );
    for (const problem of json.problems) {
      problems.push({
        ...problem,
        luogu_code: problem.luogu_code ?? BEGINNER_LUOGU_CODES[problem.id],
      });
    }
  }
  return problems;
}

const TRACKS = [
  { key: 'cpp', name: 'C++ 靶场', problems: loadCppProblems(), label: '洛谷同类型练习' },
  {
    key: 'python',
    name: 'Python 靶场',
    problems: PYTHON_PROBLEMS.map((entry) => entry.problem),
    label: '洛谷同类型练习',
  },
  {
    key: 'java',
    name: 'Java 靶场',
    problems: JAVA_PROBLEM_ENTRIES.map((entry) => entry.problem),
    label: '洛谷同类型练习',
  },
  {
    key: 'pro',
    name: 'Pro 靶场',
    problems: PRO_PROBLEM_ENTRIES.map((entry) => entry.problem),
    label: '洛谷对应题目',
  },
];

// 同一个题号只请求一次（三轨共用同一批洛谷题目）
const titleCache = new Map();

async function checkCode(code) {
  if (titleCache.has(code)) return titleCache.get(code);
  const response = await client.request({ url: `${LUOGU_BASE}/problem/${code}` });
  const pageTitle = extractPageTitle(response.body).replace(/\s*-\s*洛谷$/, '');
  const result = {
    code,
    status: response.status,
    title: pageTitle,
    exists: response.status === 200 && pageTitle.length > 0 && pageTitle.includes(code),
  };
  titleCache.set(code, result);
  await sleep(delayMs);
  return result;
}

console.log(`校验四个靶场的洛谷题号（真实访问 ${LUOGU_BASE}）\n`);

let failed = 0;
const failures = [];

for (const track of TRACKS) {
  if (onlyTrack && track.key !== onlyTrack) continue;
  const problems = track.problems.filter((problem) => !onlyProblem || problem.id === onlyProblem);
  if (!problems.length) continue;

  const withCode = problems.filter((problem) => problem.luogu_code);
  console.log(`===== ${track.name}：${withCode.length}/${problems.length} 道题标注了${track.label} =====`);

  for (const problem of problems) {
    const code = problem.luogu_code;
    if (!code) {
      console.log(`  ➖ [${problem.id}] ${problem.title}：洛谷没有同类练习，留空`);
      continue;
    }
    if (!/^[A-Za-z]{1,4}\d{1,6}$/.test(code)) {
      failed += 1;
      failures.push(`${problem.id} 题号格式不对：${code}`);
      console.log(`  ❌ [${problem.id}] ${problem.title}：题号格式不对 → ${code}`);
      continue;
    }
    const result = await checkCode(code);
    if (!result.exists) {
      failed += 1;
      failures.push(`${problem.id} → ${code} 在洛谷上不存在`);
    }
    console.log(
      `  ${result.exists ? '✅' : '❌'} [${problem.id}] ${problem.title} → ${result.code} ${result.title || `HTTP ${result.status}`}`,
    );
  }
  console.log('');
}

const uniqueCodes = titleCache.size;
const missingTitle = [...titleCache.values()].filter((item) => !item.exists).length;

console.log(
  `${failed === 0 ? '✅ 洛谷题号校验通过' : `❌ 有 ${failed} 道题的题号有问题`}：` +
    `共核对 ${uniqueCodes} 个不同的洛谷题号（${missingTitle} 个有问题），` +
    `失败明细：${failures.length ? failures.join('；') : '无'}`,
);

if (failed > 0) process.exitCode = 1;
