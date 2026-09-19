/**
 * 洛谷「书签提交」验收。
 *
 * 现在只有一条路径：书签提交（不装任何浏览器扩展）。这一套验证：
 *   1. /luogu 页：书签可拖拽安装、说明清楚、有复制书签地址的兜底
 *   2. 题目页面板：题号预填规则（已对齐才预填）、语言 / O2、书签提交按钮
 *   3. 点「书签提交」→ 会复制载荷并打开洛谷对应题目页（用 route 拦截新窗口来断言 URL）
 *   4. 书签脚本本身：把地址伪装成洛谷题目页 + 假 fetch，跑真实书签源码，
 *      断言它打到提交接口、带上页面 csrf-token、提交地址里的代码与语言、浮层显示 AC；
 *      不在题目页时只提示不发请求
 *   5. Pro 题目页：书签提交后标记"已提交"，手动标记通过后解锁下一题
 *   6. 四个靶场的题目页都有这个面板，默认语言正确
 *
 *   node scripts/e2e-luogu.mjs http://localhost:4173
 *   node scripts/e2e-luogu.mjs https://yhsome.github.io/OIworld hash
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import {
  BOOKMARKLET_CODE_SOURCE,
  BOOKMARKLET_HREF,
  decodeLuoguResult,
  encodeLuoguPayload,
  encodeLuoguResult,
} from '../src/luogu/bookmarklet.ts';
import { BEGINNER_LUOGU_CODES } from '../src/data/luogu-codes.ts';

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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

try {
  /* ---------------- 1. /luogu 页 ---------------- */
  step('/luogu：书签安装页');
  await page.goto(url('/luogu'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.luogu-bookmarklet', { timeout: 60_000 });
  const pageText = await page.locator('body').innerText();
  check('标题是「洛谷提交 · 书签版」', pageText.includes('洛谷提交') && pageText.includes('书签'));
  const bookmarkletHref = await page.locator('.luogu-bookmarklet').getAttribute('href');
  check('书签是可拖拽的 javascript: 链接', (bookmarkletHref ?? '').startsWith('javascript:'));
  check('书签内容就是站点导出的那段脚本', bookmarkletHref === BOOKMARKLET_HREF, `len=${bookmarkletHref?.length}`);
  check('写清了三步用法', pageText.includes('第 1 步') && pageText.includes('第 3 步'));
  check('解释了为什么不能用粘贴 Cookie 的方式', pageText.includes('禁止请求头'));
  check('说明了本站读不到洛谷的评测结果', pageText.includes('看不到洛谷的评测结果'));
  check('有复制书签地址的兜底', pageText.includes('复制书签地址'));
  check('不再要求安装油猴脚本', !pageText.includes('Tampermonkey') && !pageText.includes('油猴'));
  check('顶栏有「洛谷账号」入口', (await page.locator('.app-menu').innerText()).includes('洛谷账号'));
  await page.screenshot({ path: path.join(shotDir, 'luogu-1-install.png'), fullPage: true });

  /* ---------------- 2. 题目页面板 ---------------- */
  step('Pro 题目页：面板按对齐状态预填题号');
  await page.goto(urlWithQuery('/pro/problem/p1-1', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  const alignedPid = await page.locator('.luogu-panel input[placeholder*="P1001"]').inputValue();
  check('已对齐的题预填题号（p1-1 → B3614）', alignedPid === 'B3614', alignedPid);
  const panelText = await page.locator('.luogu-panel').innerText();
  check('面板标题是「提交到洛谷（书签提交）」', panelText.includes('提交到洛谷') && panelText.includes('书签提交'));
  check('有语言下拉与 O2 开关', panelText.includes('C++20') && panelText.includes('O2'));
  check('不再显示桥接/绑定状态', !panelText.includes('桥已连接') && !panelText.includes('已绑定账号'));
  check('提示了题面已与洛谷对齐', panelText.includes('题面已与洛谷对齐'));

  await page.goto(urlWithQuery('/pro/problem/p2-1', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  const unalignedPid = await page.locator('.luogu-panel input[placeholder*="P1001"]').inputValue();
  check('未对齐的题不预填题号', unalignedPid === '', `实际 "${unalignedPid}"`);
  check(
    '未对齐时提示格式可能不同',
    (await page.locator('.problem-left').innerText()).includes('不一定相同'),
  );

  /* ---------------- 3. 点书签提交：复制载荷并打开洛谷 ---------------- */
  step('点「书签提交」：复制载荷 + 打开洛谷对应题目页');
  await page.goto(urlWithQuery('/pro/problem/p1-1', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  // 拦截新窗口：把要打开的地址记在页面里，避免测试真的去访问洛谷
  await page.addInitScript(() => {
    const originalOpen = window.open;
    window.open = (target, name, features) => {
      window.__lastOpenedUrl = String(target);
      return { closed: false, close() {}, focus() {}, blur() {} } || originalOpen.call(window, 'about:blank', name, features);
    };
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  await page.locator('.luogu-panel button').filter({ hasText: /^书签提交$/ }).click();
  await page.waitForFunction(() => Boolean(window.__lastOpenedUrl), undefined, { timeout: 15_000 });
  const openedUrl = await page.evaluate(() => window.__lastOpenedUrl ?? '');
  check(
    '打开了洛谷对应题目页并带上了载荷',
    openedUrl.startsWith('https://www.luogu.com.cn/problem/B3614?oiworld='),
    openedUrl.slice(0, 80),
  );
  const payloadInUrl = decodeURIComponent(new URL(openedUrl).searchParams.get('oiworld') ?? '');
  const decoded = JSON.parse(
    Buffer.from(payloadInUrl.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'),
  );
  check('载荷里带上了编辑器里的代码', typeof decoded.code === 'string' && decoded.code.length > 20, `len=${decoded.code?.length}`);
  check('载荷里带上了洛谷语言编号 27（C++20）', decoded.lang === 27, String(decoded.lang));
  check('点完之后自动展开了使用步骤', (await page.locator('.luogu-panel').innerText()).includes('三步把代码交到洛谷'));
  const progressAfterOpen = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:pro-progress') ?? '{}'),
  );
  check(
    '本题被记为"已提交"（attempted）',
    (progressAfterOpen?.state?.attemptedProblems ?? []).includes('p1-1'),
    JSON.stringify(progressAfterOpen?.state?.attemptedProblems ?? null),
  );
  await page.screenshot({ path: path.join(shotDir, 'luogu-2-panel.png'), fullPage: true });

  /* ---------------- 4. 书签脚本本身 ---------------- */
  step('书签脚本：在"洛谷题目页"里真跑一遍（假 fetch）');
  const payload = encodeLuoguPayload({
    code: '#include <bits>\nint main(){ return 0; }',
    lang: 27,
    back: {
      origin: `${base}${hashRouter ? '' : ''}`,
      route: '/pro/problem/p1-1',
      hash: hashRouter,
      problemId: 'p1-1',
    },
  });
  await page.evaluate(
    ({ code, payloadValue }) => {
      history.pushState({}, '', `/problem/P1001?oiworld=${payloadValue}`);
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'csrf-token');
      meta.setAttribute('content', 'TEST-CSRF-TOKEN');
      document.head.appendChild(meta);
      const state = { requests: [], recordPolls: 0 };
      window.__BOOKMARKLET_TEST__ = state;
      window.fetch = (input, init = {}) => {
        const target = String(input);
        state.requests.push({
          url: target,
          method: init.method ?? 'GET',
          headers: init.headers ?? {},
          body: init.body ?? null,
        });
        const json = (data) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });
        if (target.includes('/fe/api/problem/submit/')) return json({ data: { rid: 424242 } });
        if (target.includes('/record/')) {
          state.recordPolls += 1;
          if (state.recordPolls < 2) return json({ currentData: { record: { status: 1 } } });
          return json({ currentData: { record: { status: 12, score: 100, time: 12, memory: 2048 } } });
        }
        return Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve({}) });
      };
      new Function(code)();
    },
    { code: BOOKMARKLET_CODE_SOURCE, payloadValue: payload },
  );
  await page.waitForSelector('[data-oiworld-bookmarklet]', { timeout: 15_000 });
  await page.waitForFunction(
    () => /AC/.test(document.querySelector('[data-oiworld-bookmarklet]')?.textContent ?? ''),
    undefined,
    { timeout: 20_000 },
  );
  const bookmarkletState = await page.evaluate(() => window.__BOOKMARKLET_TEST__);
  const post = bookmarkletState.requests.find((item) => item.method === 'POST');
  check('书签把提交打到了洛谷提交接口', post?.url === '/fe/api/problem/submit/P1001', String(post?.url));
  check(
    '书签带上了洛谷页面的 csrf-token',
    post?.headers?.['X-CSRF-TOKEN'] === 'TEST-CSRF-TOKEN',
    JSON.stringify(post?.headers ?? {}),
  );
  let bookmarkletBody = {};
  try {
    bookmarkletBody = JSON.parse(post?.body ?? '{}');
  } catch {
    bookmarkletBody = {};
  }
  check(
    '书签提交的是地址里带的代码与语言',
    bookmarkletBody.lang === 27 && /#include/.test(String(bookmarkletBody.code)),
    JSON.stringify({ lang: bookmarkletBody.lang, len: bookmarkletBody.code?.length }),
  );
  check('书签会轮询评测结果', bookmarkletState.recordPolls >= 2, `polls=${bookmarkletState.recordPolls}`);
  const boxText = await page.locator('[data-oiworld-bookmarklet]').innerText();
  check('书签浮层显示 AC 与记录号', boxText.includes('AC') && boxText.includes('424242'), boxText.replace(/\n/g, ' '));
  const backLink = await page
    .locator('[data-oiworld-bookmarklet] a')
    .filter({ hasText: /记回 OIworld/ })
    .getAttribute('href');
  check(
    '书签给出了「把结果记回 OIworld」的链接',
    (backLink ?? '').includes('/pro/problem/p1-1?luoguResult='),
    (backLink ?? '').slice(0, 70),
  );
  check(
    '回传链接里带着题目 id 与 AC 状态',
    (() => {
      const encoded = new URL(backLink ?? 'https://x/').searchParams.get('luoguResult');
      const decoded = decodeLuoguResult(encoded);
      return decoded?.status === 12 && decoded?.problemId === 'p1-1';
    })(),
    String(backLink).slice(-40),
  );
  await page.screenshot({ path: path.join(shotDir, 'luogu-3-bookmarklet.png'), fullPage: true });

  step('书签脚本：不在题目页时给出提示');
  await page.evaluate(
    ({ code }) => {
      history.pushState({}, '', '/');
      document.querySelector('[data-oiworld-bookmarklet]')?.remove();
      new Function(code)();
    },
    { code: BOOKMARKLET_CODE_SOURCE },
  );
  const guard = await page.locator('[data-oiworld-bookmarklet]').innerText();
  check('提示先去洛谷题目页', /先在洛谷打开一道题目/.test(guard), guard.replace(/\n/g, ' '));

  /* ---------------- 5. 结果回传 + 手动标记 ---------------- */
  step('书签回传结果：访问带 ?luoguResult 的题目页 → 自动标记通过');
  const passResult = encodeLuoguResult({
    rid: 298504808,
    status: 12,
    score: 100,
    time: 40,
    memory: 820,
    historyScore: 100,
    problemId: 'p1-1',
  });
  await page.goto(
    hashRouter
      ? `${base}/#/pro/problem/p1-1?luoguResult=${passResult}`
      : `${base}/pro/problem/p1-1?luoguResult=${passResult}`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForSelector('.ant-modal-content', { timeout: 60_000 });
  const passModal = await page.locator('.ant-modal-content').first().innerText();
  check('弹出「洛谷评测通过」', /洛谷评测通过/.test(passModal), passModal.replace(/\n/g, ' ').slice(0, 80));
  check('弹窗里带上了洛谷的分数与用时', /100 分/.test(passModal) && /40 ms/.test(passModal));
  const progressFromCallback = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:pro-progress') ?? '{}'),
  );
  check(
    '本题由回传结果自动计入通过',
    (progressFromCallback?.state?.completedProblems ?? []).includes('p1-1'),
    JSON.stringify(progressFromCallback?.state?.completedProblems ?? null),
  );
  check(
    '处理完把 luoguResult 参数从地址栏清掉（避免刷新重复触发）',
    !(await page.evaluate(() => window.location.href)).includes('luoguResult'),
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  step('没通过的结果只记为"未通过"');
  await page.evaluate(() => window.localStorage.removeItem('oiworld:pro-progress'));
  const failResult = encodeLuoguResult({
    rid: 298504809,
    status: 6,
    score: 30,
    problemId: 'p1-1',
  });
  await page.goto(
    hashRouter
      ? `${base}/#/pro/problem/p1-1?luoguResult=${failResult}`
      : `${base}/pro/problem/p1-1?luoguResult=${failResult}`,
    { waitUntil: 'domcontentloaded' },
  );
  await page.waitForFunction(
    () => /洛谷评测结果/.test(document.body.innerText) && /WA/.test(document.body.innerText),
    undefined,
    { timeout: 30_000 },
  );
  check('面板显示回传的 WA 结果', (await page.locator('.luogu-panel').innerText()).includes('WA'));
  const progressAfterFail = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:pro-progress') ?? '{}'),
  );
  check(
    '未通过时不计入通过、记为已提交',
    !(progressAfterFail?.state?.completedProblems ?? []).includes('p1-1') &&
      (progressAfterFail?.state?.attemptedProblems ?? []).includes('p1-1'),
    JSON.stringify(progressAfterFail?.state ?? null).slice(0, 120),
  );

  step('Pro 题目页：手动标记通过并解锁下一题');
  await page.goto(url('/pro/problem/p1-1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.problem-page', { timeout: 60_000 });
  const markButton = page.locator('button').filter({ hasText: /标记本题通过/ });
  check('有「我已在洛谷 AC · 标记本题通过」按钮', (await markButton.count()) === 1);
  await markButton.click();
  await page.locator('.ant-popconfirm button').filter({ hasText: /^标记为通过$/ }).click();
  await page.waitForSelector('.ant-modal-content', { timeout: 15_000 });
  check('弹出通过提示', /已标记为通过/.test(await page.locator('.ant-modal-content').first().innerText()));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const progressAfterPass = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:pro-progress') ?? '{}'),
  );
  check(
    '本题计入通过（oiworld:pro-progress）',
    (progressAfterPass?.state?.completedProblems ?? []).includes('p1-1'),
    JSON.stringify(progressAfterPass?.state?.completedProblems ?? null),
  );
  // 关掉开发者模式（前面用过 ?dev=1，会持久化），再验证按顺序解锁
  await page.evaluate(() => {
    const raw = window.localStorage.getItem('oiworld:progress');
    const parsed = raw ? JSON.parse(raw) : { state: {}, version: 1 };
    parsed.state = { ...parsed.state, developerMode: false };
    window.localStorage.setItem('oiworld:progress', JSON.stringify(parsed));
  });
  await page.goto(url('/pro/problem/p1-2'), { waitUntil: 'domcontentloaded' });
  const secondUnlocked = await page
    .waitForSelector('.problem-page', { timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  check('第二题已解锁', secondUnlocked);
  await page.goto(url('/pro/problem/p1-3'), { waitUntil: 'domcontentloaded' });
  const thirdLocked = await page
    .waitForFunction(() => document.body.innerText.includes('这道题还没有解锁'), undefined, {
      timeout: 20_000,
    })
    .then(() => true)
    .catch(() => false);
  check('第三题仍然锁着（要先过第二题）', thirdLocked);

  /* ---------------- 6. 四个靶场 ---------------- */
  step('C++ / Python / Java / Pro 题目页都有这个面板');
  await page.route('**/python-runtime/**', (route) => route.abort());
  await page.route('**/doppio-runtime/**', (route) => route.abort());
  await page.route('**/toolchain/**', (route) => route.abort());
  const errorsBeforeAborts = consoleErrors.length;

  const tracks = [
    { name: 'C++', route: urlWithQuery('/problem/s1-p1', 'dev=1'), language: 'C++20', problemId: 's1-p1' },
    { name: 'Python', route: urlWithQuery('/python/problem/py-s1-p1', 'dev=1'), language: 'Python 3', problemId: 'py-s1-p1' },
    { name: 'Java', route: urlWithQuery('/java/problem/j1-1', 'dev=1'), language: 'Java 8', problemId: 'j1-1' },
  ];
  for (const track of tracks) {
    await page.goto(track.route, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
    const text = await page.locator('.luogu-panel').innerText();
    check(`${track.name} 题目页有「提交到洛谷」面板`, text.includes('提交到洛谷'));
    check(`${track.name} 面板默认语言为 ${track.language}`, text.includes(track.language), text.replace(/\n/g, ' ').slice(0, 110));
    const expected = BEGINNER_LUOGU_CODES[track.problemId];
    const actual = await page.locator('.luogu-panel input[placeholder*="P1001"]').inputValue();
    check(`${track.name} 面板预填 ${expected}（${track.problemId}）`, actual === expected, actual);
    check(`${track.name} 标注为「洛谷同类型练习」`, text.includes('洛谷同类型练习'));
  }

  await page.unroute('**/python-runtime/**');
  await page.unroute('**/doppio-runtime/**');
  await page.unroute('**/toolchain/**');
  await page.waitForTimeout(1500);
  const errorsAfterTrackPhase = consoleErrors.length;
  check('中断资源之前没有任何控制台错误', errorsBeforeAborts === 0);

  const unexpectedErrors = consoleErrors.slice(errorsAfterTrackPhase);
  check(
    '除主动中断资源的那一段外，全程无控制台错误',
    unexpectedErrors.length === 0,
    unexpectedErrors.slice(0, 2).join(' | '),
  );
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'luogu-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(failed === 0 ? '\n=== 洛谷书签提交验收全部通过 ===\n' : `\n=== 洛谷书签提交有 ${failed} 项失败 ===\n`);
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
