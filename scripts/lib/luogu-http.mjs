/**
 * 访问洛谷的 HTTP 客户端（Node 侧）。
 *
 * 与浏览器里的桥接脚本做同一件事：带 Cookie 罐、自动跟随重定向。
 * 洛谷对没有 __client_id 的首次请求会返回 302 + Set-Cookie，必须像扩展那样重试。
 *
 * 用途：
 *  - scripts/test-luogu-bridge.mjs  对着真实洛谷验证桥接脚本
 *  - scripts/luogu-lookup.mjs       查洛谷题号（人工核对题库映射用）
 *  - scripts/verify-luogu-codes.mjs 校验题库里写的洛谷题号真实存在
 */

import https from 'node:https';

export const LUOGU_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

export const LUOGU_BASE = 'https://www.luogu.com.cn';

/**
 * 创建一个带会话 Cookie 罐的客户端。
 * @param {{ cookie?: { clientId?: string, uid?: string } }} [options]
 */
export function createLuoguClient(options = {}) {
  const jar = new Map();
  if (options.cookie?.clientId) {
    jar.set('__client_id', options.cookie.clientId);
    jar.set('_uid', options.cookie.uid || '0');
  }

  function cookieHeader() {
    return [...jar.entries()].map(([key, value]) => `${key}=${value}`).join('; ');
  }

  function absorb(response) {
    const raw = response.headers['set-cookie'] || [];
    for (const line of raw) {
      const [pair] = line.split(';');
      const index = pair.indexOf('=');
      if (index > 0) jar.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim());
    }
  }

  function once(options) {
    return new Promise((resolvePromise, rejectPromise) => {
      const target = new URL(options.url);
      const headers = Object.assign(
        { 'User-Agent': LUOGU_UA, 'Accept-Language': 'zh-CN,zh;q=0.9' },
        options.headers || {},
      );
      // 调用方显式指定的 Cookie（手工绑定）优先，否则用会话罐
      if (!headers.Cookie && jar.size) headers.Cookie = cookieHeader();
      const req = https.request(
        {
          method: options.method || 'GET',
          hostname: target.hostname,
          path: target.pathname + target.search,
          headers,
          timeout: options.timeout ?? 30000,
        },
        (res) => {
          absorb(res);
          let body = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () =>
            resolvePromise({ status: res.statusCode, body, location: res.headers.location }),
          );
        },
      );
      req.on('error', rejectPromise);
      req.on('timeout', () => {
        req.destroy(new Error('timeout'));
      });
      if (options.body) req.write(options.body);
      req.end();
    });
  }

  /** 自动跟随重定向（GM_xmlhttpRequest 的默认行为） */
  async function request(options, maxHops = 5) {
    let current = options;
    for (let hop = 0; hop < maxHops; hop += 1) {
      const response = await once(current);
      if (response.status >= 300 && response.status < 400 && response.location) {
        const next = new URL(response.location, current.url).toString();
        const keepMethod = response.status === 307 || response.status === 308;
        current = {
          ...current,
          url: next,
          method: keepMethod ? current.method : 'GET',
          body: keepMethod ? current.body : undefined,
        };
        continue;
      }
      return { status: response.status, body: response.body };
    }
    return { status: 310, body: 'too many redirects' };
  }

  return { request, cookieHeader, jar };
}

/**
 * 从洛谷页面里取内嵌 JSON。
 * 现代洛谷把页面数据放在 <script id="lentille-context" type="application/json"> 里。
 */
export function extractLentilleContext(html) {
  const match = /<script id="lentille-context" type="application\/json">([\s\S]*?)<\/script>/.exec(
    html || '',
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/** 取题目页标题（<title>P1001 A+B Problem - 洛谷</title>） */
export function extractPageTitle(html) {
  const match = /<title>([\s\S]*?)<\/title>/.exec(html || '');
  return match ? match[1].trim() : '';
}

/** 洛谷难度 1~7 的中文名 */
export const LUOGU_DIFFICULTY = {
  0: '暂无评定',
  1: '入门',
  2: '普及-',
  3: '普及/提高-',
  4: '普及+/提高',
  5: '提高+/省选-',
  6: '省选/NOI-',
  7: 'NOI/NOI+/CTSC',
};
