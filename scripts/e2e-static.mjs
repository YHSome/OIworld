/**
 * 静态部署验收：用于验证 GitHub Pages 之类的纯静态托管。
 *
 * 与 e2e.mjs 的区别：
 *  - 不假设路由形式：全部通过界面点击导航（hash 路由下 URL 形如 <base>#/problem/s1-p1）
 *  - 只依赖一个 base URL 参数，可以在本地 preview 上跑，也可以直接跑线上站点
 *  - 会额外验证「刷新后深链仍在」与「直接打开 <base>#/guide」
 *
 *   node scripts/e2e-static.mjs http://localhost:4173/OIworld/
 *   node scripts/e2e-static.mjs https://yhsome.github.io/OIworld/
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

/** 传入的地址可能没有尾部斜杠，统一补上 */
const base = (process.argv[2] ?? 'http://localhost:4173/OIworld/').replace(/\/?$/, '/');
const isRemote = !/localhost|127\.0\.0\.1/.test(base);
const shotDir = path.join(process.cwd(), 'test-results');
fs.mkdirSync(shotDir, { recursive: true });

let failed = 0;
const step = (text) => console.log(`\n[step] ${text}`);
const check = (label, condition, extra = '') => {
  if (!condition) failed += 1;
  console.log(
    `  ${condition ? '[OK]' : '[FAIL]'} ${label}${extra ? ` — ${extra}` : ''}`,
  );
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

const buttonByText = (text) =>
  page.locator('button').filter({ hasText: new RegExp(`^${text}$`) });

console.log(`\n[目标] ${base}${isRemote ? '（线上站点）' : '（本地）'}`);

try {
  step('打开站点首页');
  const startedAt = Date.now();
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.stage-card', { timeout: 90_000 });
  const cards = await page.locator('.stage-card').count();
  check(`首屏渲染出 ${cards} 个阶段卡片`, cards === 7);
  const body = await page.locator('body').innerText();
  const total = Number(body.match(/题目总数\s*(\d+)/)?.[1] ?? 0);
  check('题目总数 42 道', total === 42, `实际 ${total}`);
  check('静态资源加载成功（没有白屏）', (await page.locator('#boot').count()) === 0);
  console.log(`  （首屏耗时 ${((Date.now() - startedAt) / 1000).toFixed(1)}s）`);
  await page.screenshot({ path: path.join(shotDir, 'static-home.png'), fullPage: true });

  step('通过界面点击进入第一题');
  await page.locator('.stage-card').first().click();
  await page.waitForSelector('table tbody tr', { timeout: 30_000 });
  await page.locator('table tbody tr').first().click();
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  await page.waitForSelector('.monaco-editor', { timeout: 90_000 });
  check('题目页与 Monaco 编辑器加载成功', true);
  check('URL 带上了题目路由', /problem\/s1-p1/.test(page.url()), page.url());

  step('等待编译器就绪（静态托管下从 CDN 下载工具链）');
  const readyAt = Date.now();
  await page.waitForSelector('.ant-tag:has-text("编译器就绪")', {
    timeout: 600_000,
  });
  const readySeconds = ((Date.now() - readyAt) / 1000).toFixed(1);
  check(`编译器就绪（${readySeconds}s）`, true);
  const headerText = await page.locator('.app-header').innerText();
  check('顶栏显示编译器来源', headerText.includes('编译器就绪'), headerText.replace(/\n/g, ' '));

  step('编写并运行 Hello World');
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "来自 GitHub Pages 的 Hello!" << endl;\n    return 0;\n}\n',
  );
  await page.waitForTimeout(300);
  const runAt = Date.now();
  await buttonByText('运行').click();
  await page.waitForSelector('.output-panel', { timeout: 300_000 });
  const stdout = await page.locator('.output-pre').first().innerText();
  check(
    `浏览器本地编译并运行成功（${((Date.now() - runAt) / 1000).toFixed(1)}s）`,
    stdout.includes('来自 GitHub Pages 的 Hello!'),
    JSON.stringify(stdout.trim().slice(0, 60)),
  );

  step('提交并评测测试用例');
  // 上面输出的是自定义文字，判题必然不通过；这里改回本题要求的输出再提交
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  );
  await page.waitForTimeout(300);
  await buttonByText('提交').click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', {
    timeout: 300_000,
  });
  const modal = await page.locator('.ant-modal-content').first().innerText();
  check('提交后弹出「恭喜通过」', modal.includes('恭喜通过'));
  await page.keyboard.press('Escape');
  await page.screenshot({ path: path.join(shotDir, 'static-run.png'), fullPage: true });

  step('刷新页面：hash 路由下深链应当仍然可用');
  const urlBeforeReload = page.url();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.problem-page, .stage-card', { timeout: 60_000 });
  const afterReload = await page.locator('body').innerText();
  check(
    '刷新后仍停留在题目页（没有 404）',
    afterReload.includes('你好，世界') || afterReload.includes('提交'),
    urlBeforeReload.split('/').slice(-1)[0],
  );

  step('直接打开新手指南路由');
  await page.goto(`${base}#/guide`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.guide-page', { timeout: 60_000 });
  const guide = await page.locator('.guide-page').innerText();
  check('新手指南可直接访问（深链可用）', guide.includes('从零开始'));

  step('打开开发者模式深链（?dev=1）');
  await page.goto(`${base}?dev=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.stage-card', { timeout: 60_000 });
  await page.waitForTimeout(600);
  check(
    '顶栏出现 DEV 标记',
    (await page.locator('.ant-tag:has-text("DEV")').count()) > 0,
  );

  check(
    '全程无控制台错误',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'static-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? `\n=== 静态部署验收通过：${base} ===\n`
      : `\n=== 静态部署验收有 ${failed} 项失败：${base} ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
