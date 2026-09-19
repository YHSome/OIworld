#!/usr/bin/env node
/**
 * 洛谷题号校验（题库内容门禁之一）。
 *
 * 题库里写的每个 luogu_code 都必须在洛谷上真实存在，且标题能取到。
 * 这个脚本会真的访问 www.luogu.com.cn（只读，不提交任何东西）。
 *
 *   npm run validate:luogu
 *   node scripts/verify-luogu-codes.mjs --problem=p1-1
 *
 * 为什么要专门校验：题号一旦写错，用户点「提交到洛谷」就会交到别的题上，
 * 这是内容层面最容易犯、也最难靠肉眼发现的错误。
 */

import { createLuoguClient, extractPageTitle, LUOGU_DIFFICULTY, LUOGU_BASE } from './lib/luogu-http.mjs';
import { PRO_PROBLEM_ENTRIES } from '../src/pro/data.ts';

const client = createLuoguClient();
const onlyProblem = process.argv.find((arg) => arg.startsWith('--problem='))?.split('=')[1];
const delayMs = Number(process.argv.find((arg) => arg.startsWith('--delay='))?.split('=')[1] ?? 400);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const entries = PRO_PROBLEM_ENTRIES.filter(
  (entry) => !onlyProblem || entry.problem.id === onlyProblem,
);

console.log(`校验 ${entries.length} 道 Pro 题目的洛谷题号（真实访问 ${LUOGU_BASE}）\n`);

let failed = 0;
let withCode = 0;
let withoutCode = 0;

for (const entry of entries) {
  const { id, title, luogu_code: code, luogu_keyword: keyword } = entry.problem;
  if (!code) {
    withoutCode += 1;
    console.log(`  ➖ [${id}] ${title}：只给关键词「${keyword ?? '（无）'}」，未标注题号`);
    continue;
  }
  withCode += 1;
  if (!/^[A-Za-z]{1,4}\d{1,6}$/.test(code)) {
    failed += 1;
    console.log(`  ❌ [${id}] ${title}：题号格式不对 → ${code}`);
    continue;
  }
  const response = await client.request({ url: `${LUOGU_BASE}/problem/${code}` });
  const pageTitle = extractPageTitle(response.body);
  const ok = response.status === 200 && pageTitle.length > 0 && pageTitle.includes(code);
  if (!ok) failed += 1;
  const clean = pageTitle.replace(/\s*-\s*洛谷$/, '');
  console.log(`  ${ok ? '✅' : '❌'} [${id}] ${title} → ${clean || `HTTP ${response.status}`}`);
  await sleep(delayMs);
}

console.log(
  `\n${failed === 0 ? '✅ 洛谷题号校验通过' : `❌ 有 ${failed} 个题号有问题`}` +
    `：${withCode} 个题号已核实，${withoutCode} 道题只有关键词（洛谷没有完全对应的题目）`,
);

if (failed > 0) process.exitCode = 1;

// 顺带提一句难度分布，方便回看题目是否配得上难度标注
void LUOGU_DIFFICULTY;
