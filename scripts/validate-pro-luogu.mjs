#!/usr/bin/env node
/**
 * Pro 靶场「题面是否与洛谷原题一致」的门禁。
 *
 * 背景：Pro 每道题都标注了洛谷题号，用户在 OIworld 写代码、提交到洛谷判题。
 * 只要本站自撰的输入输出格式与洛谷原题不一样，**参考题解交上去就会 WA** ——
 * 这个脚本就是用来提前抓出这种情况的：
 *
 *   1. 从洛谷题目页取该题的样例输入/输出（公开题面，只读）；
 *   2. 用仓库里的 clang-wasm 编译本站这道题的参考题解；
 *   3. 拿洛谷样例输入喂进去，逐行比对输出。
 *
 *   npm run validate:pro-luogu              # 全部（只跑有洛谷题号的）
 *   node scripts/validate-pro-luogu.mjs --problem=p1-1
 *   node scripts/validate-pro-luogu.mjs --limit=6     # 只跑前 N 道（快速抽查）
 */

import { compileAndRun, normalizeOutput } from './node-toolchain.mjs';
import { createLuoguClient, extractLentilleContext, LUOGU_BASE } from './lib/luogu-http.mjs';
import { PRO_PROBLEM_ENTRIES } from '../src/pro/data.ts';

const client = createLuoguClient();
const only = process.argv.find((a) => a.startsWith('--problem='))?.split('=')[1];
const limit = Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] ?? 0);

const entries = PRO_PROBLEM_ENTRIES.filter(
  (entry) => entry.problem.luogu_code && (!only || entry.problem.id === only),
);
const targets = limit > 0 ? entries.slice(0, limit) : entries;

const sampleCache = new Map();
async function luoguSamples(pid) {
  if (sampleCache.has(pid)) return sampleCache.get(pid);
  const response = await client.request({ url: `${LUOGU_BASE}/problem/${pid}` });
  const problem = extractLentilleContext(response.body)?.data?.problem;
  const samples = (problem?.samples ?? []).map(([input, output]) => ({ input, output }));
  const result = { name: problem?.name ?? '', samples };
  sampleCache.set(pid, result);
  return result;
}

console.log(`对洛谷样例校验 ${targets.length} 道 Pro 题的参考题解\n`);

let pass = 0;
const failures = [];

for (const entry of targets) {
  const { id, title, luogu_code: code } = entry.problem;
  const { name, samples } = await luoguSamples(code);
  if (!samples.length) {
    console.log(`  ⚠️  [${id}] ${title} → ${code} ${name}：洛谷没给出样例，跳过`);
    continue;
  }
  let ok = true;
  const details = [];
  for (let index = 0; index < samples.length; index += 1) {
    const sample = samples[index];
    let result;
    try {
      result = await compileAndRun(entry.problem.solution_code, sample.input);
    } catch (error) {
      ok = false;
      details.push(`样例${index + 1} 运行失败：${error instanceof Error ? error.message : error}`);
      break;
    }
    const expected = normalizeOutput(sample.output);
    const actual = normalizeOutput(result.stdout);
    if (expected !== actual) {
      ok = false;
      details.push(
        `样例${index + 1} 输出不一致：期望 ${JSON.stringify(expected.slice(0, 60))} 实际 ${JSON.stringify(actual.slice(0, 60))}`,
      );
    }
  }
  if (ok) {
    pass += 1;
    console.log(`  ✅ [${id}] ${title} → ${code} ${name}`);
  } else {
    failures.push({ id, title, code, name, details });
    console.log(`  ❌ [${id}] ${title} → ${code} ${name}`);
    for (const detail of details.slice(0, 2)) console.log(`       ${detail}`);
  }
}

console.log(
  `\n${failures.length === 0 ? '✅ 全部通过' : `❌ ${failures.length} 道题的参考题解跑不过洛谷样例`}：通过 ${pass}/${targets.length}`,
);
if (failures.length) {
  console.log('\n需要对齐输入输出格式的题目：');
  for (const item of failures) console.log(`  - [${item.id}] ${item.title} → ${item.code} ${item.name}`);
  process.exitCode = 1;
}
