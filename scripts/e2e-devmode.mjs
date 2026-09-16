/**
 * 开发者模式验收：
 *   1. 默认情况下后面的题目是锁着的（做题顺序是固定的闯关规则，没有开关可关）
 *   2. ?dev=1 能一键解锁全部题目，并在顶栏显示 DEV 标记
 *   3. 开发者模式下未通过也能查看参考题解，并出现开发者面板
 *   4. 开发者面板能一键把参考题解填进编辑器
 *   5. Ctrl+Shift+D 能切换开发者模式
 *   6. ?dev=0 能关闭
 *
 *   node scripts/e2e-devmode.mjs http://localhost:4173
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4173';
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

/** 清掉进度，回到"什么都没做"的初始状态（闯关规则固定生效 → 后面的题都锁着） */
const resetProgress = (page) =>
  page.evaluate(() => {
    window.localStorage.setItem(
      'oiworld:progress',
      JSON.stringify({
        state: {
          completedProblems: [],
          attemptedProblems: [],
          lastVisitedProblemId: '',
          drafts: {},
          developerMode: false,
        },
        version: 1,
      }),
    );
  });

const readDevMode = (page) =>
  page.evaluate(() => {
    const raw = window.localStorage.getItem('oiworld:progress');
    return raw ? JSON.parse(raw).state.developerMode === true : false;
  });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

try {
  step('先确认默认状态下后面的题目是锁着的');
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage-card', { timeout: 30_000 });
  await resetProgress(page);
  await page.goto(`${base}/problem/s7-p1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ant-card', { timeout: 30_000 });
  const lockedText = await page.locator('body').innerText();
  check(
    '未开启开发者模式时，阶段七第 1 题被锁住',
    lockedText.includes('这道题还没有解锁'),
  );
  check(
    '锁住时引导去做上一题',
    lockedText.includes('去做上一题') && lockedText.includes('通过上一题，才能解锁本题'),
  );
  check('顶栏不再有「闯关」开关', !lockedText.includes('闯关'));

  step('用 ?dev=1 打开开发者模式');
  await page.goto(`${base}/?dev=1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage-card', { timeout: 30_000 });
  await page.waitForTimeout(500);
  check('顶栏出现 DEV 标记', (await page.locator('.ant-tag:has-text("DEV")').count()) > 0);
  check('开发者模式已写入 localStorage', await readDevMode(page));
  const url = page.url();
  check('地址栏里的 ?dev=1 已被清理（避免刷新重复提示）', !url.includes('dev='), url);

  step('开发者模式下直接打开被锁的题目');
  await page.goto(`${base}/problem/s7-p1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  const opened = await page.locator('body').innerText();
  check('锁被解除，题目直接打开', !opened.includes('这道题还没有解锁'));
  check('出现开发者面板', opened.includes('开发者面板'));

  step('检查开发者面板内容');
  const panel = await page.locator('.developer-panel').innerText();
  check('显示编译参数', panel.includes('-std=c++20') && panel.includes('-fno-exceptions'));
  check('显示工具链来源', panel.includes('/toolchain') || panel.includes('CDN'));
  check('显示测试用例数量', panel.includes('测试用例'));
  check('提供"把参考题解填进编辑器"', panel.includes('把参考题解填进编辑器'));
  check('提供"复制题目 JSON"', panel.includes('复制题目 JSON'));

  step('未通过也能看题解');
  const solutionButton = page.locator('button').filter({ hasText: /^查看参考题解$/ });
  check('参考题解按钮可用', (await solutionButton.count()) === 1);

  step('一键填入参考题解并提交');
  await page.locator('button').filter({ hasText: /^把参考题解填进编辑器$/ }).click();
  await page.waitForTimeout(400);
  await page.waitForSelector('.ant-tag:has-text("编译器就绪")', { timeout: 300_000 });
  await page.locator('button').filter({ hasText: /^提交$/ }).click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', { timeout: 180_000 });
  const modal = await page.locator('.ant-modal-content').first().innerText();
  check('填入的参考题解提交后全部通过', modal.includes('恭喜通过'));

  step('检查耗时信息是否出现在开发者面板');
  const panelAfter = await page.locator('.developer-panel').innerText();
  check('面板显示编译耗时与用例统计', panelAfter.includes('编译') && panelAfter.includes('通过'));
  await page.screenshot({ path: path.join(shotDir, 'devmode-panel.png'), fullPage: true });
  await page.keyboard.press('Escape');

  step('Ctrl+Shift+D 切换开发者模式');
  await page.keyboard.press('Control+Shift+D');
  await page.waitForTimeout(500);
  check('快捷键关闭了开发者模式', (await readDevMode(page)) === false);
  check(
    '面板随之消失',
    (await page.locator('.developer-panel').count()) === 0,
  );
  await page.keyboard.press('Control+Shift+D');
  await page.waitForTimeout(500);
  check('再按一次重新开启', (await readDevMode(page)) === true);

  step('?dev=0 关闭开发者模式');
  await page.goto(`${base}/?dev=0`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage-card', { timeout: 30_000 });
  await page.waitForTimeout(400);
  check('开发者模式已关闭', (await readDevMode(page)) === false);
  check('DEV 标记消失', (await page.locator('.ant-tag:has-text("DEV")').count()) === 0);

  step('设置页里有开发者模式开关');
  await page.goto(`${base}/progress`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.ant-switch', { timeout: 30_000 });
  const settings = await page.locator('body').innerText();
  check(
    '设置页说明开发者模式的作用',
    settings.includes('开发者模式') &&
      /(解锁全部题目|全部题目解锁)/.test(settings),
  );
  check('提示了 ?dev=1 与快捷键', settings.includes('?dev=1') && settings.includes('Ctrl + Shift + D'));
  check(
    '设置页里只剩一个开关（开发者模式），闯关开关已移除',
    (await page.locator('.ant-switch').count()) === 1,
    `实际 ${await page.locator('.ant-switch').count()} 个`,
  );

  check(
    '全程无控制台错误',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'devmode-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? '\n=== 开发者模式验收全部通过 ===\n'
      : `\n=== 开发者模式有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
