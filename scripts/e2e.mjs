/**
 * 端到端冒烟测试：在真实浏览器里验证「浏览器本地编译运行」这条主链路。
 *
 * 覆盖：
 *   1. 首页渲染 7 个阶段 / 42 道题
 *   2. 进入题目页，Monaco 编辑器加载
 *   3. 等待 clang（WebAssembly 版）就绪
 *   4. 写一段 Hello World，点「运行」，断言标准输出
 *   5. 点「提交」，断言全部测试用例通过并弹出「恭喜通过」
 *   6. 断言进度写入 localStorage
 *   7. 写一段有编译错误的代码，断言错误提示与编辑器红点
 *   8. 刷新页面，断言进度仍在
 *
 * 用法：
 *   npx playwright install chromium      # 首次需要下载浏览器
 *   npm run preview &                    # 或 npm run dev
 *   node scripts/e2e.mjs http://localhost:4173
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4173';
const shotDir = path.join(process.cwd(), 'test-results');
fs.mkdirSync(shotDir, { recursive: true });

let failed = 0;
const step = (text) => console.log(`\n[step] ${text}`);
const ok = (text) => console.log(`  [OK] ${text}`);
const bad = (text) => {
  failed += 1;
  console.log(`  [FAIL] ${text}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

/** antd 按钮文字里带 JSX 缩进空白，用规范化后的正则匹配 */
/** 等待 C++ 编译器就绪：题目页右侧的编译器提示条消失即表示已就绪 */
async function waitCompilerReady(page, timeout = 300_000) {
  await page.waitForFunction(
    () =>
      !Array.from(document.querySelectorAll('.problem-right .ant-alert-message')).some(
        (node) => /准备|加载|正在/.test(node.textContent ?? ''),
      ),
    undefined,
    { timeout },
  );
}
const buttonByText = (text) =>
  page.locator('button').filter({ hasText: new RegExp(`^${text}$`) });

try {
  step(`打开首页 ${base}`);
  await page.goto(base, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForSelector('.stage-card', { timeout: 30_000 });

  const cards = await page.locator('.stage-card').count();
  if (cards === 7) ok(`渲染了 ${cards} 个阶段卡片`);
  else bad(`阶段卡片数量异常：${cards}`);

  const homeText = await page.locator('body').innerText();
  const total = Number(homeText.match(/题目总数\s*(\d+)/)?.[1] ?? 0);
  if (total > 0) ok(`题目总数：${total} 道`);
  else bad(`题目总数统计异常：${total}`);
  await page.screenshot({ path: path.join(shotDir, '1-home.png'), fullPage: true });

  step('进入阶段一第一题');
  await page.locator('.stage-card').first().click();
  await page.waitForSelector('table tbody tr', { timeout: 20_000 });
  await page.locator('table tbody tr').first().click();
  await page.waitForSelector('.problem-page', { timeout: 20_000 });
  await page.waitForSelector('.monaco-editor', { timeout: 60_000 });
  ok('题目页与 Monaco 编辑器已加载');

  step('等待编译器就绪（首次需加载 clang / wasm-ld / C++ 标准库）');
  const readyAt = Date.now();
  await waitCompilerReady(page);
  ok(`编译器就绪，耗时 ${((Date.now() - readyAt) / 1000).toFixed(1)}s`);

  step('写一段 Hello World 并运行');
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  // 用 insertText 而不是 type()，避免 Monaco 的括号自动补全干扰
  await page.keyboard.insertText(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  );
  await page.waitForTimeout(300);

  const runAt = Date.now();
  await buttonByText('运行').click();
  await page.waitForSelector('.output-panel', { timeout: 180_000 });
  const stdout = await page.locator('.output-pre').first().innerText();
  if (stdout.includes('Hello, World!')) {
    ok(
      `运行输出正确：${JSON.stringify(stdout.trim())}（${(
        (Date.now() - runAt) / 1000
      ).toFixed(1)}s）`,
    );
  } else {
    bad(`运行输出不符合预期：${JSON.stringify(stdout)}`);
  }
  await page.screenshot({ path: path.join(shotDir, '2-run.png'), fullPage: true });

  step('提交并评测全部测试用例');
  await buttonByText('提交').click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', {
    timeout: 180_000,
  });
  const modal = await page.locator('.ant-modal-content').first().innerText();
  if (modal.includes('恭喜通过')) ok('弹出「恭喜通过」提示');
  else bad(`提交结果异常：${JSON.stringify(modal.slice(0, 120))}`);
  await page.screenshot({ path: path.join(shotDir, '3-submit.png'), fullPage: true });
  await page.keyboard.press('Escape');

  step('检查进度持久化');
  const stored = await page.evaluate(() =>
    window.localStorage.getItem('oiworld:progress'),
  );
  if (stored && stored.includes('completedProblems')) ok('进度已写入 localStorage');
  else bad(`localStorage 中没有进度数据：${stored}`);

  step('检查编译错误提示');
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << x << endl;\n    return 0;\n}\n',
  );
  await page.waitForTimeout(300);
  await buttonByText('运行').click();
  await page.waitForSelector('.ant-alert-error', { timeout: 120_000 });
  const errorText = await page.locator('.ant-alert-error').first().innerText();
  if (errorText.includes('编译失败')) ok('编译错误被正确展示');
  else bad(`编译错误提示异常：${JSON.stringify(errorText.slice(0, 120))}`);
  const markers = await page.locator('.monaco-editor .squiggly-error').count();
  if (markers > 0) ok(`编辑器里标出了 ${markers} 处错误`);
  else bad('编辑器里没有出现错误标记');
  await page.screenshot({
    path: path.join(shotDir, '4-compile-error.png'),
    fullPage: true,
  });

  step('刷新页面后进度仍在');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  const header = await page.locator('.app-header').innerText();
  if (/1\/\d+/.test(header)) ok('刷新后顶部仍显示已完成 1 题');
  else bad(`刷新后进度异常：${JSON.stringify(header)}`);

  if (consoleErrors.length === 0) {
    ok('运行过程中浏览器控制台没有报错');
  } else {
    bad(`控制台出现 ${consoleErrors.length} 条错误：${consoleErrors.slice(0, 2).join(' | ')}`);
  }
} catch (error) {
  bad(`脚本异常：${error instanceof Error ? error.message : String(error)}`);
  await page
    .screenshot({ path: path.join(shotDir, 'failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? '\n=== 冒烟测试全部通过 ===\n'
      : `\n=== 冒烟测试有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
