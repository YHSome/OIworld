#!/usr/bin/env node
/**
 * 洛谷题号查询（给题库做映射时用，人工核对后再写进题目数据）。
 *
 *   node scripts/luogu-lookup.mjs 单调栈            # 搜一个关键词，列出候选题目
 *   node scripts/luogu-lookup.mjs --all             # 遍历 Pro 题库里所有 luoguKeyword
 *   node scripts/luogu-lookup.mjs --check P5788 P3375   # 核对题号真实存在并打印标题
 *
 * 它只做只读的搜索/查看，不会提交任何东西。
 */

import { createLuoguClient, extractLentilleContext, LUOGU_BASE, LUOGU_DIFFICULTY } from './lib/luogu-http.mjs';
import { PRO_PROBLEM_ENTRIES } from '../src/pro/data.ts';

const client = createLuoguClient();

/** 搜索题目：返回候选列表（洛谷自己的排序） */
async function searchProblems(keyword, limit = 8) {
  const url = `${LUOGU_BASE}/problem/list?keyword=${encodeURIComponent(keyword)}&_contentOnly=1`;
  const response = await client.request({ url, headers: { 'x-luogu-type': 'content-only' } });
  const context = extractLentilleContext(response.body);
  // 洛谷的页面数据在 lentille-context 里，题目列表位于 data.problems.result
  const result = context?.data?.problems?.result ?? context?.currentData?.problems?.result ?? [];
  return result.slice(0, limit).map((item) => ({
    pid: item.pid,
    name: item.name,
    difficulty: LUOGU_DIFFICULTY[item.difficulty] ?? String(item.difficulty),
    accepted: item.totalAccepted,
    submit: item.totalSubmit,
  }));
}

/** 核对题号：题目页存在则返回标题 */
async function checkCode(pid) {
  const response = await client.request({ url: `${LUOGU_BASE}/problem/${encodeURIComponent(pid)}` });
  const title = /<title>([\s\S]*?)<\/title>/.exec(response.body)?.[1]?.trim() ?? '';
  const exists = response.status === 200 && title && !/页面未找到|错误/.test(title);
  return { pid, status: response.status, title, exists };
}

function printCandidates(keyword, candidates) {
  console.log(`\n### ${keyword}`);
  if (!candidates.length) {
    console.log('  （没有搜到结果）');
    return;
  }
  for (const item of candidates) {
    console.log(
      `  ${item.pid.padEnd(9)} ${String(item.difficulty).padEnd(12)} 通过 ${String(item.accepted).padStart(7)}  ${item.name}`,
    );
  }
}

const args = process.argv.slice(2);

if (args[0] === '--all') {
  const entries = PRO_PROBLEM_ENTRIES.filter((entry) => entry.problem.luogu_keyword);
  console.log(`Pro 题库里有 ${entries.length} 道题带洛谷关键词，逐个查候选：`);
  for (const entry of entries) {
    const keyword = entry.problem.luogu_keyword;
    const candidates = await searchProblems(keyword);
    printCandidates(`${entry.problem.id} 《${entry.problem.title}》 → ${keyword}`, candidates);
  }
} else if (args[0] === '--check') {
  const codes = args.slice(1);
  if (!codes.length) {
    console.error('用法：node scripts/luogu-lookup.mjs --check P5788 P3375 ...');
    process.exit(1);
  }
  let missing = 0;
  for (const code of codes) {
    const result = await checkCode(code);
    if (!result.exists) missing += 1;
    console.log(
      `${result.exists ? '✅' : '❌'} ${result.pid.padEnd(9)} HTTP ${result.status}  ${result.title}`,
    );
  }
  if (missing) process.exitCode = 1;
} else if (args.length) {
  for (const keyword of args) {
    const candidates = await searchProblems(keyword);
    printCandidates(keyword, candidates);
  }
} else {
  console.log(`用法：
  node scripts/luogu-lookup.mjs <关键词> [...]    搜索候选题目
  node scripts/luogu-lookup.mjs --all             遍历 Pro 题库的所有洛谷关键词
  node scripts/luogu-lookup.mjs --check <题号>... 核对题号是否存在`);
  process.exit(1);
}
