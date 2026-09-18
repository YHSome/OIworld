/**
 * 洛谷远程提交验收：
 *   1. /luogu「远程账号管理」页结构（绑定表格 / vjudge 式绑定表单 / 安装指引 / 诊断）
 *   2. 未安装桥接脚本时的状态与降级（提交按钮不可用、给出安装指引）
 *   3. 装桥后：桥状态就绪、会话检测、绑定浏览器会话、绑定 Cookie、解绑
 *   4. 题目页面板：提交 → 轮询评测结果 → 显示 AC，刷新提交记录出表格
 *
 * 桥接脚本本身在 scripts/test-luogu-bridge.mjs 里对着真实洛谷验证过；
 * 这里用 page.addInitScript 注入一个"假洛谷"，只验证网页侧的协议与界面。
 *
 *   node scripts/e2e-luogu.mjs http://localhost:4173
 *   node scripts/e2e-luogu.mjs https://yhsome.github.io/OIworld hash
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

/**
 * 注入假洛谷的"扩展层"：只替换 GM_xmlhttpRequest 与网络返回，
 * 桥接脚本本身用的是站点上真实的 public/oiworld-luogu.user.js。
 * 于是这一套验收同时覆盖了真实桥的 csrf 抓取、URL / 请求头 / 请求体构造、
 * 错误翻译、冷却与消息协议 —— 而不只是网页侧的界面。
 */
function luoguTransportStub() {
  return () => {
    const CSRF = '1789843791:oSihpqbI721y5U/hqVcZtPK0D/a3zOLNDtNKdwFldJg=';
    const state = { requests: [], submits: 0, recordPolls: 0 };
    window.__FAKE_LUOGU_STATE__ = state;

    const RECORDS = [
      {
        id: 123456,
        status: 12,
        score: 100,
        time: 15,
        memory: 1024,
        language: 27,
        submitTime: 1789843800,
        sourceCodeLength: 120,
      },
      {
        id: 123455,
        status: 6,
        score: 30,
        time: 21,
        memory: 980,
        language: 27,
        submitTime: 1789843700,
        sourceCodeLength: 118,
      },
      {
        id: 123454,
        status: 2,
        score: 0,
        time: 0,
        memory: 0,
        language: 27,
        submitTime: 1789843600,
        sourceCodeLength: 116,
      },
    ];

    window.GM_xmlhttpRequest = (options) => {
      const url = new URL(options.url);
      const path = url.pathname + url.search;
      state.requests.push({
        method: options.method || 'GET',
        url: options.url,
        headers: options.headers || {},
        data: options.data ?? null,
      });

      const reply = (status, body) => {
        window.setTimeout(() => {
          if (options.onload) {
            options.onload({ status, responseText: body, finalUrl: options.url });
          }
        }, 50);
      };

      if (path.startsWith('/problem/')) {
        reply(200, `<html><head><meta name="csrf-token" content="${CSRF}"></head></html>`);
        return;
      }
      if (path === '/user/setting') {
        if (window.__FAKE_LUOGU_LOGGED_OUT__) {
          reply(401, '<html>login required</html>');
          return;
        }
        reply(200, '<html><script>window.user={"uid":66666,"name":"YHSome"};</script></html>');
        return;
      }
      if (path.startsWith('/fe/api/problem/submit/')) {
        state.submits += 1;
        reply(200, JSON.stringify({ data: { rid: 987654 + state.submits } }));
        return;
      }
      if (path.startsWith('/record/list')) {
        reply(200, JSON.stringify({ currentData: { records: { result: RECORDS } } }));
        return;
      }
      if (path.startsWith('/record/')) {
        state.recordPolls += 1;
        // 前两次返回"正在评测"，之后返回 AC —— 用来验证轮询确实在跑
        const settled = state.recordPolls >= 3;
        reply(
          200,
          JSON.stringify({
            currentData: {
              record: {
                id: 987654,
                status: settled ? 12 : 1,
                score: settled ? 100 : 0,
                time: 15,
                memory: 1024,
                language: 27,
                submitTime: 1789843800,
                compilationResult: null,
              },
            },
          }),
        );
        return;
      }
      reply(404, JSON.stringify({ errorMessage: '该页面未找到', status: 404 }));
    };
  };
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

try {
  /* ---------------- 1. 没有装桥时 ---------------- */
  step('未安装桥接脚本时的 /luogu 页');
  await page.goto(url('/luogu'), { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.luogu-hero-card', { timeout: 60_000 });
  // 桥状态是异步探测的，等它从「检测中」落到「未安装」
  await page.waitForFunction(() => document.body.innerText.includes('未安装'), undefined, {
    timeout: 30_000,
  });
  const coldText = await page.locator('body').innerText();
  check('页面标题为「洛谷账号 · 远程提交」', coldText.includes('洛谷账号') && coldText.includes('远程提交'));
  check('桥状态显示未安装', coldText.includes('未安装'), '');
  check('给出"必须装脚本"的原因说明', coldText.includes('Access-Control-Allow-Origin') && coldText.includes('禁止请求头'));
  check('说明 vjudge 为什么不用装', coldText.includes('vjudge'));
  check('有远程账号管理卡片', coldText.includes('远程账号管理'));
  check('绑定表格为空提示', coldText.includes('还没有绑定任何远程账号'));
  check('绑定表单含 __client_id 与 _uid', coldText.includes('__client_id') && coldText.includes('_uid'));

  step('绑定表格的列与 vjudge 一致');
  const headers = await page.locator('.ant-table-thead th').allInnerTexts();
  check(
    '表头为 保护 / 账号 / 状态 / 更新时间 / 操作',
    ['保护', '账号', '状态', '更新时间', '操作'].every((item) => headers.includes(item)),
    headers.join(' | '),
  );

  check('顶栏有「洛谷账号」入口', (await page.locator('.app-menu').innerText()).includes('洛谷账号'));
  await page.screenshot({ path: path.join(shotDir, 'luogu-1-nobridge.png'), fullPage: true });

  /* ---------------- 2. 装桥之后 ---------------- */
  step('安装桥接脚本后（用站点上真实的桥接脚本 + 假扩展层）');
  const scriptSource = await fetch(`${base}/oiworld-luogu.user.js`).then((response) => {
    if (!response.ok) throw new Error(`取不到桥接脚本：HTTP ${response.status}`);
    return response.text();
  });
  check(
    '站点提供了可安装的桥接脚本',
    scriptSource.includes('OIworld 洛谷远程提交桥') && scriptSource.includes('GM_xmlhttpRequest'),
    `${scriptSource.length} 字节`,
  );
  // 先铺好 GM_xmlhttpRequest，再按 Tampermonkey 的方式在 document-start 注入真实脚本
  await page.addInitScript(luoguTransportStub());
  await page.addInitScript({ content: scriptSource });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-hero-card', { timeout: 60_000 });
  await page.waitForFunction(
    () => document.body.innerText.includes('已就绪'),
    undefined,
    { timeout: 30_000 },
  );
  const warmText = await page.locator('body').innerText();
  check('桥状态变为已就绪', warmText.includes('已就绪'));
  check('显示桥版本号', /已就绪[\s\S]{0,80}1\.0\.0/.test(warmText) || warmText.includes('1.0.0'));
  // 会话检测要真的过一次 GM_xmlhttpRequest（假扩展层有 50ms 延迟），等它落地
  await page.waitForFunction(() => document.body.innerText.includes('YHSome'), undefined, {
    timeout: 30_000,
  });
  const sessionText = await page.locator('body').innerText();
  check(
    '自动检测到洛谷会话已登录',
    sessionText.includes('已登录') && sessionText.includes('YHSome'),
    sessionText.includes('已登录') ? '有登录标记' : '没有登录标记',
  );
  const sessionRequests = await page.evaluate(() =>
    window.__FAKE_LUOGU_STATE__.requests
      .filter((item) => item.url.endsWith('/user/setting'))
      .map((item) => item.url),
  );
  check('会话检测真的请求了洛谷 /user/setting', sessionRequests.length > 0, sessionRequests.join(','));

  step('绑定浏览器会话');
  await page.locator('button').filter({ hasText: /一键用浏览器会话/ }).click();
  await page.waitForFunction(
    () => document.body.innerText.includes('洛谷 · YHSome'),
    undefined,
    { timeout: 20_000 },
  );
  const boundText = await page.locator('body').innerText();
  check('账号行出现，显示洛谷账号名', boundText.includes('洛谷 · YHSome'));
  check('状态列显示正常', boundText.includes('正常'));
  const storedAfterSession = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:luogu') ?? '{}'),
  );
  check(
    '绑定信息写入 localStorage（oiworld:luogu）',
    Boolean(storedAfterSession?.state?.boundAt) && storedAfterSession.state.accountName === 'YHSome',
    JSON.stringify(storedAfterSession?.state ?? null).slice(0, 160),
  );

  step('解绑');
  await page.locator('button').filter({ hasText: /^解绑$/ }).first().click();
  await page.locator('.ant-popconfirm button').filter({ hasText: /^确认解绑$/ }).click();
  await page.waitForTimeout(600);
  const unboundText = await page.locator('body').innerText();
  check('解绑后回到空状态', unboundText.includes('还没有绑定任何远程账号'));

  step('用粘贴的 Cookie 绑定');
  await page.locator('input[placeholder*="40 位"]').fill('0123456789abcdefghijklmnopqrstuvwxyz0123');
  await page.locator('input[placeholder*="uid"]').fill('66666');
  await page.locator('button').filter({ hasText: /^绑定$/ }).first().click();
  await page.waitForFunction(
    () => JSON.parse(window.localStorage.getItem('oiworld:luogu') ?? '{}')?.state?.mode === 'cookie',
    undefined,
    { timeout: 20_000 },
  );
  const cookieText = await page.locator('body').innerText();
  check('绑定成功并显示对应账号', cookieText.includes('洛谷 · YHSome'));
  check(
    '表格里回显的是掩码后的 __client_id',
    /__client_id=0123\*{4}0123/.test(cookieText),
    (cookieText.match(/__client_id=\S+/) ?? [''])[0],
  );
  const storedAfterCookie = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('oiworld:luogu') ?? '{}'),
  );
  check(
    'Cookie 绑定写入 localStorage（含 __client_id 与 _uid）',
    storedAfterCookie?.state?.mode === 'cookie' &&
      storedAfterCookie.state.clientId.startsWith('0123456789') &&
      storedAfterCookie.state.uid === '66666',
    JSON.stringify({
      mode: storedAfterCookie?.state?.mode,
      uid: storedAfterCookie?.state?.uid,
      len: storedAfterCookie?.state?.clientId?.length,
    }),
  );
  await page.screenshot({ path: path.join(shotDir, 'luogu-2-bound.png'), fullPage: true });

  /* ---------------- 3. 题目页提交 ---------------- */
  step('题目页的提交面板');
  await page.goto(urlWithQuery('/pro/problem/p1-1', 'dev=1'), { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-panel', { timeout: 60_000 });
  const panelText = await page.locator('.luogu-panel').innerText();
  check('面板标题为「提交到洛谷」', panelText.includes('提交到洛谷'));
  check('桥已连接标记', panelText.includes('桥已连接'));
  check('显示已绑定账号', panelText.includes('已绑定账号'));
  check('可填洛谷题号', (await page.locator('.luogu-panel input[placeholder*="P1001"]').count()) === 1);
  check('可选评测语言', panelText.includes('C++20'));

  await page.locator('.luogu-panel input[placeholder*="P1001"]').fill('P1001');
  await page.locator('.luogu-panel input[placeholder*="P1001"]').blur();
  await page.waitForTimeout(400);
  const savedPid = await page.evaluate(
    () => JSON.parse(window.localStorage.getItem('oiworld:luogu') ?? '{}')?.state?.problemIds?.['p1-1'],
  );
  check('题号被记住（p1-1 → P1001）', savedPid === 'P1001', String(savedPid));

  step('点「提交到洛谷」并等待评测结果');
  await page.locator('.luogu-panel button').filter({ hasText: /提交到洛谷/ }).click();
  await page.waitForFunction(
    () => document.body.innerText.includes('洛谷评测结果'),
    undefined,
    { timeout: 60_000 },
  );
  const finalState = await page.evaluate(() => window.__FAKE_LUOGU_STATE__);
  check('桥收到了提交请求', finalState.submits === 1, `submits=${finalState.submits}`);

  const postRequest = finalState.requests.find((item) => item.method === 'POST');
  check(
    '提交真的打到洛谷的提交接口',
    postRequest?.url === 'https://www.luogu.com.cn/fe/api/problem/submit/P1001',
    String(postRequest?.url),
  );
  let requestBody = {};
  try {
    requestBody = JSON.parse(postRequest?.data ?? '{}');
  } catch {
    requestBody = {};
  }
  check(
    '提交体是当前编辑器里的代码',
    typeof requestBody.code === 'string' && requestBody.code.length > 20,
    `len=${requestBody.code?.length}`,
  );
  check('提交语言为 C++20（lang=27）', requestBody.lang === 27, String(requestBody.lang));
  check('提交带 O2 开关（默认关）', requestBody.enableO2 === 0, String(requestBody.enableO2));
  check(
    '提交带 X-CSRF-TOKEN（桥从洛谷页面 meta 里抓的）',
    typeof postRequest?.headers?.['X-CSRF-TOKEN'] === 'string' &&
      postRequest.headers['X-CSRF-TOKEN'].length > 20,
    String(postRequest?.headers?.['X-CSRF-TOKEN']).slice(0, 24),
  );
  check(
    '提交带 Referer 与 Origin（洛谷校验来源）',
    postRequest?.headers?.Referer === 'https://www.luogu.com.cn/problem/P1001' &&
      postRequest?.headers?.Origin === 'https://www.luogu.com.cn',
    JSON.stringify({ Referer: postRequest?.headers?.Referer, Origin: postRequest?.headers?.Origin }),
  );
  check(
    '带着绑定的 Cookie 一起提交',
    /^__client_id=0123456789abcdefghijklmnopqrstuvwxyz0123; _uid=66666$/.test(
      String(postRequest?.headers?.Cookie),
    ),
    String(postRequest?.headers?.Cookie),
  );
  check('轮询了多次才拿到最终结果', finalState.recordPolls >= 2, `polls=${finalState.recordPolls}`);
  const resultText = await page.locator('.luogu-panel').innerText();
  check('面板显示 AC', resultText.includes('AC'), resultText.split('\n').slice(0, 6).join(' | '));
  check('显示评测耗时与内存', /ms/.test(resultText) && /MB/.test(resultText));
  check('给出洛谷记录链接', resultText.includes('查看洛谷记录'));

  step('刷新提交记录');
  await page.locator('.luogu-panel button').filter({ hasText: /刷新提交记录/ }).click();
  await page.waitForSelector('.luogu-panel .ant-table-tbody tr.ant-table-row', { timeout: 30_000 });
  const rows = await page.locator('.luogu-panel .ant-table-tbody tr.ant-table-row').count();
  check('提交记录表格出现 3 行', rows === 3, `rows=${rows}`);
  const recordText = await page.locator('.luogu-panel .ant-table-tbody').innerText();
  check('记录了 AC / WA / CE 三种状态', ['AC', 'WA', 'CE'].every((item) => recordText.includes(item)));
  check('记录了语言 C++20', recordText.includes('C++20'));
  await page.screenshot({ path: path.join(shotDir, 'luogu-3-submit.png'), fullPage: true });

  /* ---------------- 4. 未登录的降级 ---------------- */
  step('洛谷未登录时的提示');
  await page.addInitScript(() => {
    window.__FAKE_LUOGU_LOGGED_OUT__ = true;
  });
  // hash 路由下换到 #/luogu 只是同文档跳转，不会重新执行 init script，所以要显式刷新一次
  await page.goto(url('/luogu'), { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.luogu-hero-card', { timeout: 60_000 });
  await page.locator('button').filter({ hasText: /检测登录/ }).click();
  await page.waitForFunction(() => document.body.innerText.includes('未登录'), undefined, {
    timeout: 20_000,
  });
  check('显示未登录状态', (await page.locator('body').innerText()).includes('未登录'));

  check('全程无控制台错误', consoleErrors.length === 0, consoleErrors.slice(0, 2).join(' | '));
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'luogu-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? '\n=== 洛谷远程提交验收全部通过 ===\n'
      : `\n=== 洛谷远程提交有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
