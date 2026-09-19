/**
 * Pro 靶场验收（数据结构与进阶算法）。
 *
 * Pro 的判题在洛谷进行，所以这一套重点验证：
 *   1. 首页 7 个阶段 / 42 道题、顶栏四个靶场切换、文案说明"判题在洛谷"
 *   2. 阶段页 6 道题 + 「洛谷」列显示已核对的题号
 *   3. 题目页：左边题目/提示/题解，右边**只有编辑器 + 提交到洛谷面板**
 *      —— 没有本地「运行 / 提交」、没有测试用例面板、没有编译器状态条
 *   4. **完全不加载编译器**（断言没有任何 /toolchain/ 或 jsdelivr 请求）
 *   5. 用站点上真实的桥接脚本 + 假扩展层提交一次，洛谷返回 AC →
 *      本题标记通过、解锁下一题、进度页计入
 *   6. 未通过的题仍然按顺序锁住
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

/**
 * 强制一次真正的导航（而不是 hash 路由的同文档跳转）。
 * 需要页面重新加载（例如改了 localStorage 后要求应用重新读取）时用它。
 */
let navCounter = 0;
const hardGoto = async (routePath, query = '') => {
  navCounter += 1;
  const extra = query ? `${query}&e2e=${navCounter}` : `e2e=${navCounter}`;
  await page.goto(urlWithQuery(routePath, extra), { waitUntil: 'domcontentloaded' });
};

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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
const requestedUrls = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});
page.on('request', (request) => requestedUrls.push(request.url()));

try {
  step('Pro 首页 /pro');
  await page.goto(url('/pro'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.stage-card', { timeout: 60_000 });
  const cards = await page.locator('.stage-card').count();
  check('阶段卡片数量为 7', cards === 7, `实际 ${cards}`);
  const home = await page.locator('body').innerText();
  check('显示题目总数 42', /题目总数\s*42/.test(home), (home.match(/题目总数\s*\d+/) ?? [''])[0]);
  check('标题为 Pro 靶场', home.includes('Pro 靶场') && home.includes('数据结构与进阶算法'));
  check('说明判题在洛谷进行', /判题在洛谷/.test(home));
  check('不再宣称浏览器本地编译', !/浏览器里由 clang/.test(home));
  check('说明标注了洛谷对应题目', home.includes('洛谷对应题目'));
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
  check('阶段页列出 6 道题', (await page.locator('table tbody tr.ant-table-row').count()) === 6);
  check('阶段页有上下阶段导航', stageText.includes('下一阶段'));
  const stageHeaders = await page.locator('.ant-table-thead th').allInnerTexts();
  check('阶段页有「洛谷」列', stageHeaders.includes('洛谷'), stageHeaders.join(' | '));
  check(
    '显示已核对的洛谷题号',
    /B3614|P1739|P1449|B3616|P5788|P1886/.test(stageText),
    (stageText.match(/[A-Z]{1,2}\d{3,5}/g) ?? []).slice(0, 6).join(' '),
  );
  check('不再显示本地「测试点」列', !stageHeaders.includes('测试点'), stageHeaders.join(' | '));
  await page.screenshot({ path: path.join(shotDir, 'pro-2-stage.png'), fullPage: true });

  step('题目页（阶段一第一题）：只有编辑器 + 提交到洛谷');
  await page.locator('table tbody tr.ant-table-row').first().click();
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
  check('标记为 C++ 20', problemText.includes('C++ 20'));
  check(
    '工具栏只有「写到哪？」与「重置代码」',
    (await buttonByText('写到哪？').count()) === 1 &&
      (await buttonByText('重置代码').count()) === 1,
  );
  check('没有本地「运行」按钮', (await buttonByText('运行').count()) === 0);
  check('没有本地「提交」按钮', (await buttonByText('提交').count()) === 0);
  check('没有测试用例面板', !problemText.includes('运行全部测试'));
  check(
    '没有编译器状态提示条',
    (await page.locator('.problem-right .ant-alert-message').allInnerTexts()).every(
      (text) => !/编译器|clang|加载/.test(text),
    ),
  );
  check('说明为什么不在浏览器里判题', problemText.includes('为什么这题不在浏览器里判'));
  check('有洛谷跳转区块', (await page.locator('.pro-luogu-block').count()) === 1);
  const prefilledPid = await page
    .locator('.luogu-panel input[placeholder*="P1001"]')
    .inputValue();
  check('已对齐洛谷格式的题会预填题号（p1-1 → B3614）', prefilledPid === 'B3614', prefilledPid);
  check(
    '已对齐的题标注为「洛谷对应题目」',
    problemText.includes('洛谷对应题目') && !problemText.includes('与洛谷那道题'),
  );
  await page.screenshot({ path: path.join(shotDir, 'pro-3-problem.png'), fullPage: true });

  step('尚未对齐洛谷格式的题：不预填题号，并明确提示格式可能不同');
  await page.goto(urlWithQuery('/pro/problem/p2-1', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  const unalignedPid = await page
    .locator('.luogu-panel input[placeholder*="P1001"]')
    .inputValue();
  check('未对齐的题不预填题号', unalignedPid === '', `实际 "${unalignedPid}"`);
  const unalignedText = await page.locator('.problem-left').innerText();
  check('提示了输入输出格式不一定相同', unalignedText.includes('不一定相同'), '');
  check('标注为「洛谷同类题目」', unalignedText.includes('洛谷同类题目'));

  step('开发者模式：填入参考题解（不再本地评测）');
  await page.goto(urlWithQuery('/pro/problem/p1-1', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  check(
    '开发者按钮存在（填入参考题解）',
    (await page.locator('button').filter({ hasText: /填入参考题解/ }).count()) > 0,
  );
  await page.locator('button').filter({ hasText: /填入参考题解/ }).first().click();
  await page.waitForTimeout(500);
  const editorText = await page.locator('.monaco-editor').first().innerText();
  check('参考题解被填进编辑器', editorText.length > 20, `${editorText.length} 字符`);
  check(
    '开发者模式还有「复制题目 JSON」',
    (await page.locator('button').filter({ hasText: /复制题目 JSON/ }).count()) > 0,
  );

  step('书签提交：复制载荷并打开洛谷对应题目页');
  await page.addInitScript(() => {
    window.open = (target) => {
      window.__lastOpenedUrl = String(target);
      return { closed: false, close() {}, focus() {}, blur() {} };
    };
  });
  await hardGoto('/pro/problem/p1-1');
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  check(
    '面板里是「书签提交」，不再有桥接/绑定状态',
    (await page.locator('.luogu-panel').innerText()).includes('书签提交') &&
      !(await page.locator('.luogu-panel').innerText()).includes('桥已连接'),
  );
  await page.locator('.luogu-panel button').filter({ hasText: /^书签提交$/ }).click();
  await page.waitForFunction(() => Boolean(window.__lastOpenedUrl), undefined, { timeout: 15_000 });
  const openedUrl = await page.evaluate(() => window.__lastOpenedUrl ?? '');
  check(
    '打开了洛谷对应题目页（带代码载荷）',
    openedUrl.startsWith('https://www.luogu.com.cn/problem/B3614?oiworld='),
    openedUrl.slice(0, 80),
  );
  const progressAfterSubmit = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:pro-progress') ?? '{}'),
  );
  check(
    '本题被记为"已提交"',
    (progressAfterSubmit?.state?.attemptedProblems ?? []).includes('p1-1'),
    JSON.stringify(progressAfterSubmit?.state?.attemptedProblems ?? null),
  );
  await page.screenshot({ path: path.join(shotDir, 'pro-4-submit.png'), fullPage: true });

  step('在洛谷拿到 AC 后手动标记通过');
  await page.locator('button').filter({ hasText: /标记本题通过/ }).click();
  await page.locator('.ant-popconfirm button').filter({ hasText: /^标记为通过$/ }).click();
  await page.waitForSelector('.ant-modal-content', { timeout: 20_000 });
  const modalText = await page.locator('.ant-modal-content').first().innerText();
  check('弹出「本题已标记为通过」', /已标记为通过/.test(modalText), modalText.replace(/\n/g, ' ').slice(0, 80));
  const progressAfterPass = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:pro-progress') ?? '{}'),
  );
  check(
    '本题已计入通过（oiworld:pro-progress）',
    (progressAfterPass?.state?.completedProblems ?? []).includes('p1-1'),
    JSON.stringify(progressAfterPass?.state?.completedProblems ?? null),
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  step('通过之后解锁下一题');
  // 前面用过 ?dev=1，开发者模式会持久化并解锁全部题目，这里先关掉才能验证"按顺序解锁"
  await page.evaluate(() => {
    const raw = window.localStorage.getItem('oiworld:progress');
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 1 };
    parsed.state = { ...parsed.state, developerMode: false };
    window.localStorage.setItem('oiworld:progress', JSON.stringify(parsed));
  });
  // 关掉开发者模式后要重新加载页面，应用才会读到新的进度状态
  await hardGoto('/pro/problem/p1-2');
  const secondUnlocked = await page
    .waitForSelector('.problem-page', { timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  check('第二题已解锁（因为第一题标记为通过了）', secondUnlocked);
  await hardGoto('/pro/problem/p1-3');
  const thirdLocked = await page
    .waitForFunction(() => document.body.innerText.includes('这道题还没有解锁'), undefined, {
      timeout: 20_000,
    })
    .then(() => true)
    .catch(() => false);
  check('第三题仍然锁着（要先过第二题）', thirdLocked);

  step('进度页 /pro/progress');
  await page.goto(url('/pro/progress'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.ant-statistic', { timeout: 30_000 });
  const progressText = await page.locator('body').innerText();
  check('显示 Pro 进度页', progressText.includes('进度'));
  check('已计入 1 题', /已通过\s*1/.test(progressText));
  check('说明进度存本地', progressText.includes('oiworld:pro-progress'));

  step('Pro 页面完全没有加载编译器');
  const toolchainRequests = requestedUrls.filter(
    (item) =>
      item.includes('/toolchain/') || item.includes('jsdelivr') || item.includes('clang.wasm'),
  );
  check(
    '没有任何工具链 / CDN 请求',
    toolchainRequests.length === 0,
    toolchainRequests.slice(0, 2).join(' | '),
  );

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
