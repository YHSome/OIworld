/**
 * Java 单题抽查：在真实浏览器里用 Doppio JVM 跑一道题的参考题解。
 *
 * 用途：Java 运行时（Doppio）的编译要一两分钟，全量验收太慢；
 * 这个脚本可以在开发者模式下直接「填入参考题解 → 提交」，
 * 用来抽查后期阶段的题目（递归、类、HashMap 等）在浏览器里真的能过。
 *
 *   node scripts/e2e-java-problem.mjs http://localhost:4173 j1-1
 *   node scripts/e2e-java-problem.mjs https://yhsome.github.io/OIworld j7-1 hash
 */

import { chromium } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
const problemId = process.argv[3] ?? 'j1-1';
const hashRouter = process.argv[4] === 'hash';
const problemUrl = hashRouter
  ? `${base}/?dev=1#/java/problem/${problemId}`
  : `${base}/java/problem/${problemId}?dev=1`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

const started = Date.now();
let failed = 0;
const check = (label, condition, extra = '') => {
  if (!condition) failed += 1;
  console.log(`  ${condition ? '[OK]' : '[FAIL]'} ${label}${extra ? ` — ${extra}` : ''}`);
};

console.log(`\n[目标] ${problemUrl}`);

try {
  await page.goto(problemUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.problem-page', { timeout: 60_000 });
  await page.waitForSelector('.monaco-editor .view-lines', { timeout: 120_000 });
  check('题目页打开（开发者模式已解锁）', (await page.locator('.problem-page').count()) === 1);

  const title = (await page.locator('.problem-desc-card h3').first().innerText()).trim();
  console.log(`  题目：${title}`);

  console.log('  等待 Java 运行环境就绪…');
  await page.waitForFunction(
    () => {
      const nodes = Array.from(document.querySelectorAll('.ant-alert-message'));
      return nodes.some((node) => /已就绪|失败/.test(node.textContent ?? ''));
    },
    undefined,
    { timeout: 900_000 },
  );

  const fill = page.locator('button').filter({ hasText: /^填入参考题解并评测（开发者）$/ });
  check('开发者按钮存在（填入参考题解）', (await fill.count()) === 1);
  await fill.click();
  await page.waitForTimeout(500);

  const editorText = await page.locator('.monaco-editor .view-lines').innerText();
  check('参考题解已进入编辑器', /class Main/.test(editorText.replace(/\u00a0/g, ' ')));

  console.log('  提交评测（Doppio 编译较慢，请稍候）…');
  const submitAt = Date.now();
  await page.locator('button').filter({ hasText: /^提交$/ }).click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', { timeout: 900_000 });

  const submitSeconds = ((Date.now() - submitAt) / 1000).toFixed(1);
  if ((await page.locator('.ant-modal-content').count()) > 0) {
    const modal = await page.locator('.ant-modal-content').first().innerText();
    check(`提交通过（耗时 ${submitSeconds}s）`, modal.includes('恭喜通过'));
    console.log(`  ${modal.split('\n').filter(Boolean).slice(0, 2).join(' / ')}`);
  } else {
    const output = await page.locator('.output-panel').innerText();
    check('提交通过', false, output.split('\n').slice(0, 6).join(' | ').slice(0, 400));
  }

  const metrics = await page.locator('.output-panel').innerText().catch(() => '');
  const timing = metrics.match(/编译\s*(\d+)\s*ms\s*·\s*运行\s*(\d+)\s*ms/);
  if (timing) {
    console.log(
      `  应用内计时：编译 ${(Number(timing[1]) / 1000).toFixed(1)}s，运行 ${(Number(timing[2]) / 1000).toFixed(1)}s`,
    );
  }

  check('无控制台错误', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: `test-results/java-problem-${problemId}-failure.png`, fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? `\n=== ${problemId} 在浏览器（Doppio）里通过，总耗时 ${((Date.now() - started) / 1000).toFixed(1)}s ===\n`
      : `\n=== ${problemId} 有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
