/**
 * Pro 靶场验收（数据结构与进阶算法）：
 *   1. 首页 7 个阶段卡片 / 42 道题、顶栏四个靶场切换
 *   2. 阶段页 6 道题
 *   3. 题目页：左侧题目 + 右侧 C++ 编辑器分栏、编译器状态、洛谷跳转区块
 *   4. 用开发者按钮「填入参考题解并评测」真实编译运行并提交通过
 *   5. 进度页、闯关锁定与开发者解锁
 *
 *   node scripts/e2e-pro.mjs http://localhost:4173
 *   node scripts/e2e-pro.mjs https://yhsome.github.io/OIworld hash
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
const hashRouter = process.argv[3] === 'hash';
const url = (routePath) => `${base}${hashRouter ? '/#' : ''}${routePath}`;
const urlWithQuery = (routePath, query) =>
  hashRouter ? `${base}/?${query}#${routePath}` : `${base}${routePath}?${query}`;

const shotDir = path.join(process.cwd(), 'test-results');
fs.mkdirSync(shotDir, { recursive: true });

let failed = 0;
const step = (text) => console.log(`\n[step] ${text}`);
const check = (label, condition, extra = '') => {
  if (!condition) failed += 1;
  console.log(`  ${condition ? '[OK]' : '[FAIL]'} ${label}${extra ? ` — ${extra}` : ''}`);
};
const buttonByText = (text) =>
  page.locator('button').filter({ hasText: new RegExp(`^${text}$`) });

/** 等待 C++ 编译器就绪：题目页右侧的编译器提示条消失即表示已就绪 */
async function waitCompilerReady(timeout = 300_000) {
  await page.waitForFunction(
    () =>
      !Array.from(document.querySelectorAll('.problem-right .ant-alert-message')).some(
        (node) => /准备|加载|正在/.test(node.textContent ?? ''),
      ),
    undefined,
    { timeout },
  );
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

try {
  step('Pro 首页 /pro');
  await page.goto(url('/pro'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.stage-card', { timeout: 60_000 });
  const cards = await page.locator('.stage-card').count();
  check('阶段卡片数量为 7', cards === 7, `实际 ${cards}`);
  const home = await page.locator('body').innerText();
  check('显示题目总数 42', /题目总数\s*42/.test(home), (home.match(/题目总数\s*\d+/) ?? [''])[0]);
  check('标题为 Pro 靶场', home.includes('Pro 靶场') && home.includes('数据结构与进阶算法'));
  check('说明由 clang 在浏览器本地编译', /clang/i.test(home));
  check('说明洛谷只提供跳转、不抓取题面', home.includes('洛谷') && /不抓取|只提供/.test(home));
  await page.screenshot({ path: path.join(shotDir, 'pro-1-home.png'), fullPage: true });

  step('顶栏四个靶场切换，Pro 处于选中态');
  const switchText = await page.locator('.language-switch').innerText();
  check(
    'C++ / Python / Java / Pro 四个按钮都在',
    ['C++ 靶场', 'Python 靶场', 'Java 靶场', 'Pro 靶场'].every((item) => switchText.includes(item)),
    switchText.replace(/\n/g, ' '),
  );
  check('Pro 按钮处于激活样式', (await page.locator('.pro-switch-active').count()) === 1);
  check('顶栏进度显示 Pro 进度', /0\/42/.test(await page.locator('.app-header-right').innerText()));

  step('阶段页 /pro/stage/1');
  await page.locator('.stage-card').first().click();
  await page.waitForSelector('table tbody tr', { timeout: 30_000 });
  const stageText = await page.locator('body').innerText();
  check('阶段页显示阶段标题', stageText.includes('阶段一'));
  check('阶段页列出 6 道题', (await page.locator('table tbody tr').count()) === 6);
  check('阶段页有上下阶段导航', stageText.includes('下一阶段'));
  check(
    '阶段页有「洛谷」列并显示已核实的题号',
    stageText.includes('洛谷') && /B3614|P1739|P1449|B3616|P5788|P1886/.test(stageText),
    (stageText.match(/[A-Z]{1,2}\d{3,5}/g) ?? []).slice(0, 6).join(' '),
  );
  await page.screenshot({ path: path.join(shotDir, 'pro-2-stage.png'), fullPage: true });

  step('题目页（阶段一第一题）');
  await page.locator('table tbody tr').first().click();
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  await page.waitForSelector('.monaco-editor', { timeout: 90_000 });
  const problemText = await page.locator('body').innerText();
  check(
    '左侧题目描述与右侧编辑器分栏',
    (await page.locator('.problem-left').count()) === 1 &&
      (await page.locator('.problem-right').count()) === 1,
  );
  check('显示「思路与知识点」小节', problemText.includes('思路与知识点'));
  check('显示「常见错误」小节', problemText.includes('常见错误'));
  check('有提示折叠区', problemText.includes('提示（想不出来再看）'));
  check('工具栏含 运行 / 提交 / 重置代码', (await buttonByText('运行').count()) === 1 && (await buttonByText('提交').count()) === 1 && (await buttonByText('重置代码').count()) === 1);
  check('标记为 C++ 20（火山色标签）', problemText.includes('C++ 20'));
  check('有测试用例面板', problemText.includes('测试用例'));

  step('洛谷跳转区块');
  const luoguLinks = page.locator('.pro-luogu-block a');
  check('存在洛谷链接', (await luoguLinks.count()) > 0);
  if ((await luoguLinks.count()) > 0) {
    const href = await luoguLinks.first().getAttribute('href');
    const target = await luoguLinks.first().getAttribute('target');
    check('链接指向 luogu.com.cn', (href ?? '').includes('luogu.com.cn'), href ?? '');
    check('新窗口打开', target === '_blank');
    check('文案说明不抓取题面', (await page.locator('.pro-luogu-block').innerText()).includes('不抓取'));
  }
  await page.screenshot({ path: path.join(shotDir, 'pro-3-problem.png'), fullPage: true });

  step('等待 C++ 编译器就绪并提交参考题解');
  // 「填入参考题解」是开发者模式下的按钮，所以用 ?dev=1 打开本题
  await page.goto(urlWithQuery('/pro/problem/p1-1', 'dev=1'), {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  await waitCompilerReady();
  const fill = page.locator('button').filter({ hasText: /填入参考题解/ });
  check('开发者按钮存在（填入参考题解）', (await fill.count()) > 0);
  await fill.first().click();
  await page.waitForTimeout(400);
  const submitAt = Date.now();
  await buttonByText('提交').click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', { timeout: 300_000 });
  const seconds = ((Date.now() - submitAt) / 1000).toFixed(1);
  if ((await page.locator('.ant-modal-content').count()) > 0) {
    const modal = await page.locator('.ant-modal-content').first().innerText();
    check(`提交通过（${seconds}s）`, modal.includes('恭喜通过'), modal.split('\n')[1] ?? '');
  } else {
    const output = await page.locator('.output-panel').innerText();
    check('提交通过', false, output.split('\n').slice(0, 4).join(' | ').slice(0, 300));
  }
  await page.keyboard.press('Escape');

  step('进度页 /pro/progress');
  await page.goto(url('/pro/progress'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.ant-statistic', { timeout: 30_000 });
  const progressText = await page.locator('body').innerText();
  check('显示 Pro 进度页', progressText.includes('进度'));
  check('已计入 1 题', /已通过\s*1/.test(progressText), '');
  check('说明进度存本地', progressText.includes('oiworld:pro-progress'));

  step('闯关锁定与开发者解锁');
  // 开发者模式会持久化到 localStorage，这里先关掉它，才能验证"按顺序解锁"
  await page.evaluate(() => {
    const raw = window.localStorage.getItem('oiworld:progress');
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 1 };
    parsed.state = { ...parsed.state, developerMode: false };
    window.localStorage.setItem('oiworld:progress', JSON.stringify(parsed));
  });
  await page.goto(url('/pro/problem/p1-3'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.ant-card', { timeout: 30_000 });
  check('未通过的题按顺序锁住', (await page.locator('body').innerText()).includes('这道题还没有解锁'));
  await page.goto(urlWithQuery('/pro/problem/p1-3', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  check('开发者模式可直达', (await page.locator('.problem-page').count()) === 1);

  check('全程无控制台错误', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'pro-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0 ? '\n=== Pro 靶场验收全部通过 ===\n' : `\n=== Pro 靶场有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
