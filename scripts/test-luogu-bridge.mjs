#!/usr/bin/env node
/**
 * 洛谷桥接脚本测试
 *
 * 这个脚本把 public/oiworld-luogu.user.js 放进一个"假的油猴环境"里运行，
 * 然后像网页那样用 postMessage 驱动它。分两套：
 *
 *  1. live —— 真的去访问 www.luogu.com.cn（未登录状态）。
 *     验证：csrf-token 抓取、提交接口地址、401/403 错误翻译、记录接口鉴权、
 *           非法题号拦截、非本站 origin 不掉应答（安全边界）。
 *     未登录时无法验证"提交成功"，但能验证除登录外的整条链路是对的：
 *     如果接口地址写错会得到 NOT_FOUND；如果 csrf 抓取失败会得到 NO_CSRF。
 *
 *  2. mock —— 用假的洛谷响应模拟"已登录"。
 *     验证：提交成功拿到 rid、请求体/请求头完全符合洛谷前端行为
 *           （lang / enableO2 / X-CSRF-TOKEN / Referer）、评测结果解析、
 *           提交记录解析（数组与 {result:[]} 两种形态）、
 *           登录态解析（uid + 用户名）、绑定 Cookie 会带进请求头、
 *           以及 5 秒防连点冷却。
 *
 * 用法：node scripts/test-luogu-bridge.mjs [--offline]
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';
import https from 'node:https';

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT_PATH = resolve(here, '..', 'public', 'oiworld-luogu.user.js');
const OFFLINE = process.argv.includes('--offline');
const ORIGIN = 'https://yhsome.github.io';
const EVIL_ORIGIN = 'https://evil.example.com';

const results = [];
function check(name, condition, detail) {
  results.push({ name, ok: Boolean(condition), detail });
  const mark = condition ? '  ok  ' : ' FAIL ';
  console.log(`[${mark}] ${name}${detail && !condition ? `\n         → ${detail}` : ''}`);
}

/* ------------------------------------------------------------------ *
 * 假油猴环境
 * ------------------------------------------------------------------ */

/**
 * @param {(options:any)=>Promise<{status:number,body:string}>} transport
 */
function createBridge(transport) {
  const listeners = [];
  const replies = [];
  const requests = [];

  const win = {
    location: { origin: ORIGIN, href: `${ORIGIN}/OIworld/` },
    addEventListener(type, handler) {
      if (type === 'message') listeners.push(handler);
    },
    postMessage(message) {
      replies.push(message);
    },
  };

  const sandbox = {
    window: win,
    unsafeWindow: win,
    GM: undefined,
    GM_xmlhttpRequest(options) {
      requests.push(options);
      transport(options)
        .then((response) =>
          options.onload({
            status: response.status,
            responseText: response.body,
            finalUrl: options.url,
          }),
        )
        .catch(() => options.onerror && options.onerror({ status: 0 }));
    },
    setTimeout,
    clearTimeout,
    console,
  };

  vm.createContext(sandbox);
  vm.runInContext(readFileSync(SCRIPT_PATH, 'utf8'), sandbox, {
    filename: 'oiworld-luogu.user.js',
  });

  let nextId = 1;
  function call(action, payload, origin = ORIGIN) {
    const id = nextId++;
    const before = replies.length;
    for (const listener of listeners) {
      listener({ origin, data: { __OIWORLD_LUOGU_REQUEST__: true, id, action, payload } });
    }
    return new Promise((resolvePromise, rejectPromise) => {
      const started = Date.now();
      const timer = setInterval(() => {
        if (replies.length > before) {
          clearInterval(timer);
          const reply = replies[replies.length - 1];
          resolvePromise(reply);
        } else if (Date.now() - started > 30000) {
          clearInterval(timer);
          rejectPromise(new Error(`桥没有回应 action=${action}`));
        }
      }, 10);
    });
  }

  function replyCount() {
    return replies.length;
  }

  return { call, replyCount, requests, win };
}

/* ------------------------------------------------------------------ *
 * 真·洛谷传输层（node:https，可以自由设置 Cookie / Referer / Origin）
 * ------------------------------------------------------------------ */

/**
 * 真·洛谷传输层：用 node:https 手工实现"浏览器扩展的语义"——
 * 带 Cookie 罐、自动跟随重定向（GM_xmlhttpRequest 就是这样做的）。
 * 首次不带 __client_id 访问洛谷会得到 302 + Set-Cookie，扩展会自动重试，
 * 所以测试里也必须这么做，否则测的就不是桥的行为而是网络细节。
 */
function httpsTransport() {
  const jar = new Map();

  function cookieHeader() {
    return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  function absorb(res) {
    const raw = res.headers['set-cookie'] || [];
    for (const line of raw) {
      const [pair] = line.split(';');
      const index = pair.indexOf('=');
      if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
  }

  function once(options) {
    return new Promise((resolvePromise, rejectPromise) => {
      const url = new URL(options.url);
      const headers = Object.assign(
        {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          'Accept-Language': 'zh-CN,zh;q=0.9',
        },
        options.headers || {},
      );
      // 显式指定的 Cookie（手工绑定）优先，否则用会话罐里的
      if (!headers.Cookie && jar.size) headers.Cookie = cookieHeader();
      const req = https.request(
        {
          method: options.method || 'GET',
          hostname: url.hostname,
          path: url.pathname + url.search,
          headers,
          timeout: 30000,
        },
        (res) => {
          absorb(res);
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () =>
            resolvePromise({
              status: res.statusCode,
              body,
              location: res.headers.location,
            }),
          );
        },
      );
      req.on('error', rejectPromise);
      req.on('timeout', () => {
        req.destroy(new Error('timeout'));
      });
      if (options.data) req.write(options.data);
      req.end();
    });
  }

  return async function transport(options) {
    let current = options;
    for (let hop = 0; hop < 5; hop += 1) {
      const response = await once(current);
      if (response.status >= 300 && response.status < 400 && response.location) {
        const next = new URL(response.location, current.url).toString();
        const keepMethod = response.status === 307 || response.status === 308;
        current = {
          ...current,
          url: next,
          method: keepMethod ? current.method : 'GET',
          data: keepMethod ? current.data : undefined,
        };
        continue;
      }
      return { status: response.status, body: response.body };
    }
    return { status: 310, body: 'too many redirects' };
  };
}

/* ------------------------------------------------------------------ *
 * 第一套：真实洛谷（未登录）
 * ------------------------------------------------------------------ */

async function liveSuite() {
  console.log('\n=== live：真实访问 www.luogu.com.cn（未登录） ===');
  const bridge = createBridge(httpsTransport());

  const ping = await bridge.call('ping');
  check('ping 返回桥信息', ping.ok && ping.data.bridge === true, JSON.stringify(ping));
  check('桥版本号存在', typeof ping.data?.version === 'string', String(ping.data?.version));

  const session = await bridge.call('session');
  check(
    'session 正确识别"未登录"',
    session.ok && session.data.loggedIn === false && session.data.status === 401,
    JSON.stringify(session),
  );

  const badPid = await bridge.call('submit', { pid: '1001', code: 'int main(){}', lang: 27 });
  check(
    '非法题号被拦下',
    !badPid.ok && badPid.error.code === 'BAD_PID',
    JSON.stringify(badPid.error),
  );

  const emptyCode = await bridge.call('submit', { pid: 'P1001', code: '   ', lang: 27 });
  check(
    '空代码被拦下',
    !emptyCode.ok && emptyCode.error.code === 'EMPTY_CODE',
    JSON.stringify(emptyCode.error),
  );

  const submitted = await bridge.call('submit', {
    pid: 'P1001',
    code: '#include <cstdio>\nint main(){int a,b;scanf("%d%d",&a,&b);printf("%d",a+b);}',
    lang: 27,
  });
  check(
    '提交打到真实接口并被翻译成"未登录"（说明 csrf 抓取与接口地址都正确）',
    !submitted.ok && submitted.error.code === 'NOT_LOGGED_IN',
    JSON.stringify(submitted.error),
  );

  const records = await bridge.call('records', { pid: 'P1001' });
  check(
    '记录列表在未登录时被正确翻译成"未登录"',
    !records.ok && records.error.code === 'NOT_LOGGED_IN',
    JSON.stringify(records.error),
  );

  const debug = await bridge.call('debug', { path: '/problem/P1001' });
  check(
    'debug 能取到洛谷页面且包含 csrf-token',
    debug.ok && debug.data.status === 200 && /csrf-token/.test(debug.data.body),
    `status=${debug.data?.status}`,
  );

  const before = bridge.replyCount();
  // 不 await：来自第三方 origin 的请求本来就不该有任何应答
  bridge.call('ping', {}, EVIL_ORIGIN).catch(() => {});
  await new Promise((r) => setTimeout(r, 500));
  check('非本站 origin 不会得到任何应答', bridge.replyCount() === before);

  const unknown = await bridge.call('nonsense', {});
  check('未知指令返回明确错误', !unknown.ok && /未知的桥接指令/.test(unknown.error.message));
}

/* ------------------------------------------------------------------ *
 * 第二套：假洛谷（模拟已登录，覆盖登录后才能走的路径）
 * ------------------------------------------------------------------ */

const CSRF = '1789843791:oSihpqbI721y5U/hqVcZtPK0D/a3zOLNDtNKdwFldJg=';

function mockTransport(capture) {
  return async (options) => {
    capture.push({
      method: options.method || 'GET',
      url: options.url,
      headers: options.headers || {},
      data: options.data,
    });
    const url = new URL(options.url);
    const path = url.pathname + url.search;

    if (path.startsWith('/problem/')) {
      return {
        status: 200,
        body: `<html><head><meta name="csrf-token" content="${CSRF}"></head><body>ok</body></html>`,
      };
    }
    if (path === '/user/setting') {
      return {
        status: 200,
        body: '<html><script>window.user={"uid":66666,"name":"YHSome"};</script></html>',
      };
    }
    if (path.startsWith('/fe/api/problem/submit/')) {
      return { status: 200, body: JSON.stringify({ data: { rid: 98765432 } }) };
    }
    if (path.startsWith('/record/list')) {
      if (/pid=P99999/.test(path)) {
        return { status: 404, body: JSON.stringify({ errorMessage: '该页面未找到', status: 404 }) };
      }
      const asResult = url.searchParams.get('page') === '2';
      const item = {
        id: 98765432,
        status: 12,
        score: 100,
        time: 15,
        memory: 1024,
        language: 28,
        submitTime: 1789843800,
        sourceCodeLength: 87,
        problem: { pid: 'P1001', title: 'A+B Problem' },
        user: { uid: 66666, name: 'YHSome' },
      };
      return {
        status: 200,
        body: JSON.stringify({
          currentData: { records: asResult ? { result: [item], count: 1 } : [item] },
        }),
      };
    }
    if (path.startsWith('/record/')) {
      return {
        status: 200,
        body: JSON.stringify({
          currentData: {
            record: {
              id: 98765432,
              status: 12,
              score: 100,
              time: 15,
              memory: 1024,
              language: 28,
              enableO2: false,
              sourceCodeLength: 87,
              submitTime: 1789843800,
              problem: { pid: 'P1001', title: 'A+B Problem' },
              compilationResult: null,
            },
          },
        }),
      };
    }
    return { status: 404, body: JSON.stringify({ errorMessage: '该页面未找到', status: 404 }) };
  };
}

async function mockSuite() {
  console.log('\n=== mock：模拟已登录洛谷，覆盖登录后才有的路径 ===');
  const capture = [];
  const bridge = createBridge(mockTransport(capture));

  const session = await bridge.call('session');
  check(
    'session 解析出 uid 与用户名',
    session.ok && session.data.loggedIn === true && session.data.uid === 66666 && session.data.name === 'YHSome',
    JSON.stringify(session),
  );

  const submitted = await bridge.call('submit', {
    pid: 'P1001',
    code: '#include <iostream>\nint main(){std::cout<<"hi";}',
    lang: 27,
    enableO2: false,
  });
  check('提交成功并解析出 rid', submitted.ok && submitted.data.rid === 98765432, JSON.stringify(submitted));

  const submitRequest = capture.find((r) => r.method === 'POST');
  check(
    '提交请求地址与洛谷前端一致',
    submitRequest && submitRequest.url === 'https://www.luogu.com.cn/fe/api/problem/submit/P1001',
    submitRequest?.url,
  );
  check(
    '提交请求带 X-CSRF-TOKEN',
    submitRequest && submitRequest.headers['X-CSRF-TOKEN'] === CSRF,
    JSON.stringify(submitRequest?.headers),
  );
  check(
    '提交请求带 Referer / Origin（洛谷校验来源）',
    submitRequest &&
      submitRequest.headers.Referer === 'https://www.luogu.com.cn/problem/P1001' &&
      submitRequest.headers.Origin === 'https://www.luogu.com.cn',
    JSON.stringify(submitRequest?.headers),
  );
  const body = JSON.parse(submitRequest?.data || '{}');
  check(
    '提交请求体为 {lang, code, enableO2}',
    body.lang === 27 && typeof body.code === 'string' && body.enableO2 === 0,
    JSON.stringify(body),
  );

  const cooldown = await bridge.call('submit', { pid: 'P1001', code: 'int main(){}', lang: 27 });
  check(
    '5 秒防连点生效',
    !cooldown.ok && cooldown.error.code === 'COOLDOWN',
    JSON.stringify(cooldown.error),
  );

  const record = await bridge.call('record', { rid: 98765432 });
  check(
    '评测记录解析正确',
    record.ok && record.data.status === 12 && record.data.score === 100 && record.data.time === 15,
    JSON.stringify(record.data),
  );

  const list = await bridge.call('records', { pid: 'P1001', page: 1 });
  check(
    '记录列表解析（records 为数组）',
    list.ok && Array.isArray(list.data) && list.data.length === 1 && list.data[0].id === 98765432,
    JSON.stringify(list.data),
  );

  const list2 = await bridge.call('records', { pid: 'P1001', page: 2 });
  check(
    '记录列表解析（records 为 {result:[]}）',
    list2.ok && Array.isArray(list2.data) && list2.data.length === 1,
    JSON.stringify(list2.data),
  );

  const listRequest = capture.find((r) => r.url.includes('/record/list'));
  check(
    '记录列表请求带 pid / page / _contentOnly',
    listRequest &&
      listRequest.url.includes('pid=P1001') &&
      listRequest.url.includes('page=1') &&
      listRequest.url.includes('_contentOnly=1'),
    listRequest?.url,
  );

  // 绑定 Cookie：模拟"浏览器没登录，用粘贴的 Cookie 提交"
  const boundCapture = [];
  const boundBridge = createBridge(mockTransport(boundCapture));
  const boundSubmit = await boundBridge.call('submit', {
    pid: 'P1001',
    code: 'int main(){}',
    lang: 27,
    cookie: { clientId: '0123456789abcdef', uid: '66666' },
  });
  const boundRequest = boundCapture.find((r) => r.method === 'POST');
  check(
    '绑定的 Cookie 会作为 Cookie 头发出',
    boundSubmit.ok &&
      boundRequest?.headers.Cookie === '__client_id=0123456789abcdef; _uid=66666',
    JSON.stringify(boundRequest?.headers),
  );

  // 错误翻译：人机验证
  const captchaBridge = createBridge(async (options) => {
    const path = new URL(options.url).pathname;
    if (path.startsWith('/problem/')) {
      return { status: 200, body: `<meta name="csrf-token" content="${CSRF}">` };
    }
    return {
      status: 403,
      body: JSON.stringify({
        errorType: 'LuoguFramework\\HttpFoundation\\Controller\\Exception\\CaptchaRequiredException',
        errorMessage: '需要人机验证',
        status: 403,
      }),
    };
  });
  const captcha = await captchaBridge.call('submit', { pid: 'P1001', code: 'int main(){}', lang: 27 });
  check(
    '人机验证错误被翻译成可操作提示',
    !captcha.ok && captcha.error.code === 'CAPTCHA' && /手动提交一次/.test(captcha.error.message),
    JSON.stringify(captcha.error),
  );

  // 题号 404
  const notFound = await bridge.call('records', { pid: 'P99999' });
  check(
    '不存在的题号提示检查题号',
    !notFound.ok && notFound.error.code === 'NOT_FOUND',
    JSON.stringify(notFound.error),
  );
}

/* ------------------------------------------------------------------ */

(async () => {
  console.log(`桥接脚本：${SCRIPT_PATH}`);
  if (OFFLINE) {
    console.log('（--offline：跳过真实洛谷部分）');
  } else {
    await liveSuite();
  }
  await mockSuite();

  const failed = results.filter((r) => !r.ok);
  console.log(`\n通过 ${results.length - failed.length}/${results.length}`);
  if (failed.length) {
    console.log('失败项：');
    for (const item of failed) console.log(`  - ${item.name} → ${item.detail ?? ''}`);
    process.exitCode = 1;
  }
})();
