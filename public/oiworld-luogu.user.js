// ==UserScript==
// @name         OIworld 洛谷远程提交桥
// @namespace    https://github.com/YHSome/OIworld
// @version      1.0.0
// @description  让 OIworld 靶场页面在你的浏览器里直接向洛谷提交代码、读取评测结果与提交记录。Cookie 只在你的浏览器与洛谷之间流转，不经过任何第三方服务器。
// @author       YHSome
// @match        https://*.github.io/OIworld/*
// @match        http://localhost/*
// @match        http://localhost:*/*
// @match        http://127.0.0.1/*
// @match        http://127.0.0.1:*/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      luogu.com.cn
// @connect      www.luogu.com.cn
// @run-at       document-start
// @noframes
// ==/UserScript==

/**
 * ============================================================================
 * 这个脚本做了什么（你可以逐行读，不接受任何"黑盒"）
 * ============================================================================
 * 浏览器的同源策略不允许 https://yhsome.github.io 直接访问 luogu.com.cn
 * （洛谷的响应没有 Access-Control-Allow-Origin，跨域请求会被浏览器拦下），
 * 而且 `Cookie` 属于 fetch/XHR 的禁止请求头，网页 JS 无论如何都带不上。
 *
 * 所以本脚本只做一件事：把"替你去访问洛谷"这件事交给油猴扩展的
 * GM_xmlhttpRequest —— 它由扩展发出请求，不受页面同源策略限制，
 * 并且会自动带上你自己浏览器的洛谷登录 Cookie（等价于你在洛谷页面上的操作）。
 *
 * 用到的洛谷接口（均为洛谷前端自己在用的接口）：
 *   1. GET  https://www.luogu.com.cn/problem/{pid}
 *        只为了拿 <meta name="csrf-token">，提交时必须带在 X-CSRF-TOKEN 头里。
 *   2. POST https://www.luogu.com.cn/fe/api/problem/submit/{pid}
 *        body: { lang, code, enableO2 }；成功返回 { rid }（评测记录号）。
 *   3. GET  https://www.luogu.com.cn/record/{rid}?_contentOnly=1
 *        读取这条评测的状态 / 分数 / 时间 / 内存 / 编译信息。
 *   4. GET  https://www.luogu.com.cn/record/list?pid={pid}&page=1&_contentOnly=1
 *        读取该题的提交记录列表。
 *   5. GET  https://www.luogu.com.cn/user/setting
 *        用来判断"当前浏览器是否已登录洛谷"（未登录时洛谷返回 401）。
 *
 * 脚本不会：上传你的代码到第三方、上传/回传 Cookie 的值、后台自动提交。
 * 每次提交都由你在页面上点按钮触发，且两次提交之间至少有 5 秒间隔。
 */

(function () {
  'use strict';

  var VERSION = '1.0.0';
  var REQUEST_FLAG = '__OIWORLD_LUOGU_REQUEST__';
  var REPLY_FLAG = '__OIWORLD_LUOGU_REPLY__';
  var LUOGU = 'https://www.luogu.com.cn';
  /** 两次提交之间的最小间隔（毫秒），避免误触连点给洛谷造成压力 */
  var SUBMIT_COOLDOWN = 5000;
  /** csrf-token 缓存时间（毫秒），洛谷的 token 随页面下发，短时间复用即可 */
  var CSRF_TTL = 5 * 60 * 1000;
  var NOT_LOGGED_IN_MESSAGE =
    '洛谷认为当前浏览器没有登录。请先在浏览器里打开 luogu.com.cn 登录，或在本站「洛谷账号」页粘贴 __client_id / _uid 后再试。';

  var W = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  var xhr =
    typeof GM_xmlhttpRequest === 'function'
      ? GM_xmlhttpRequest
      : typeof GM !== 'undefined' && GM && typeof GM.xmlHttpRequest === 'function'
        ? GM.xmlHttpRequest.bind(GM)
        : null;

  var csrfCache = { token: '', at: 0 };
  var lastSubmitAt = 0;

  /* ------------------------------------------------------------------ *
   * 基础工具
   * ------------------------------------------------------------------ */

  function post(message, origin) {
    try {
      W.postMessage(message, origin || W.location.origin);
    } catch (error) {
      /* 忽略：页面已经关掉了 */
    }
  }

  /** 只回应本站页面，避免任何第三方页面借这个桥去碰你的洛谷账号 */
  function isTrustedOrigin(origin) {
    if (!origin) return false;
    if (/^https:\/\/[a-z0-9-]+\.github\.io$/i.test(origin)) return true;
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true;
    return false;
  }

  /** GM_xmlhttpRequest 的 Promise 封装：无论成功失败都拿到 { status, body } */
  function request(options) {
    return new Promise(function (resolve, reject) {
      if (!xhr) {
        reject(new Error('GM_xmlhttpRequest 不可用：请确认脚本运行在 Tampermonkey / Violentmonkey 中'));
        return;
      }
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error('请求洛谷超时（30 秒），请检查网络或代理'));
      }, 30000);

      xhr({
        method: options.method || 'GET',
        url: options.url,
        headers: options.headers || {},
        data: options.data,
        timeout: 30000,
        // 关键：带上浏览器自己的洛谷登录 Cookie（等价于你在洛谷页面的操作）
        anonymous: false,
        onload: function (response) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          resolve({
            status: response.status,
            body: response.responseText || '',
            finalUrl: response.finalUrl || options.url,
          });
        },
        onerror: function () {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(new Error('无法连接洛谷（网络不可达或被代理拦截）'));
        },
        ontimeout: function () {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          reject(new Error('请求洛谷超时'));
        },
      });
    });
  }

  function parseJson(body) {
    try {
      return JSON.parse(body);
    } catch (error) {
      return null;
    }
  }

  /** 从嵌套对象里按候选路径取第一个存在的值 */
  function pick(source, paths) {
    for (var i = 0; i < paths.length; i += 1) {
      var node = source;
      var parts = paths[i].split('.');
      var ok = true;
      for (var j = 0; j < parts.length; j += 1) {
        if (node && typeof node === 'object' && parts[j] in node) {
          node = node[parts[j]];
        } else {
          ok = false;
          break;
        }
      }
      if (ok && node !== undefined && node !== null) return node;
    }
    return undefined;
  }

  /** 把洛谷的错误响应翻译成一句人话 */
  function describeFailure(status, json, body) {
    var type = json ? String(json.errorType || '') : '';
    var message = json ? String(json.errorMessage || json.data || '') : '';
    // 人机验证必须排在"未登录"前面判断：洛谷对验证失败也返回 403
    if (/captcha|verify|turnstile/i.test(type) || /验证码|人机/.test(message)) {
      return {
        code: 'CAPTCHA',
        message:
          '洛谷要求人机验证：请先在洛谷网站上手动提交一次这道题（通过验证后），再回到本站提交。',
      };
    }
    if (/UserNotLoggedIn/i.test(type) || /未登录|请先登录|尚未登录/.test(message)) {
      return { code: 'NOT_LOGGED_IN', message: NOT_LOGGED_IN_MESSAGE };
    }
    if (status === 401 || status === 403) {
      return { code: 'NOT_LOGGED_IN', message: NOT_LOGGED_IN_MESSAGE };
    }
    if (status === 429) {
      return { code: 'RATE_LIMIT', message: '提交过于频繁，被洛谷限流，请等一会儿再试。' };
    }
    if (status === 404) {
      return { code: 'NOT_FOUND', message: '洛谷上没有这个题目编号，请检查题号（例如 P1001）。' };
    }
    if (status === 302 || status === 301) {
      return {
        code: 'NOT_LOGGED_IN',
        message: '洛谷把请求重定向到了登录页：请先在浏览器里登录洛谷，或在本站「洛谷账号」页绑定 Cookie。',
      };
    }
    if (!json && body && /<html/i.test(body)) {
      return {
        code: 'UNEXPECTED_HTML',
        message: '洛谷返回了网页而不是数据（' + status + '），通常是没有登录或需要人机验证。',
      };
    }
    return {
      code: 'LUOGU_ERROR',
      message: message || ('洛谷返回了错误状态 ' + status),
      detail: { status: status, errorType: type },
    };
  }

  /* ------------------------------------------------------------------ *
   * 洛谷接口
   * ------------------------------------------------------------------ */

  function extractCsrf(html) {
    var match = /<meta\s+name="csrf-token"\s+content="([^"]+)"/i.exec(html || '');
    return match ? match[1] : '';
  }

  /**
   * 取 csrf-token：洛谷把它放在任意页面的 <meta name="csrf-token"> 里。
   * 先取题目页，取不到就退回头页；两处都取不到时，如果最终地址落在登录页，
   * 就明确告诉用户"没登录"，而不是含糊地说"读不到 token"。
   */
  function fetchCsrf(pid) {
    var now = Date.now();
    if (csrfCache.token && now - csrfCache.at < CSRF_TTL) {
      return Promise.resolve(csrfCache.token);
    }
    var pageHeaders = { Accept: 'text/html,application/xhtml+xml' };
    return request({ method: 'GET', url: LUOGU + '/problem/' + encodeURIComponent(pid), headers: pageHeaders })
      .then(function (response) {
        var token = extractCsrf(response.body);
        if (token) return token;
        return request({ method: 'GET', url: LUOGU + '/', headers: pageHeaders }).then(function (home) {
          var homeToken = extractCsrf(home.body);
          if (homeToken) return homeToken;
          if (/login|auth/i.test(String(home.finalUrl || ''))) {
            throw Object.assign(new Error('洛谷要求先登录'), { code: 'NOT_LOGGED_IN' });
          }
          throw Object.assign(new Error('无法从洛谷页面读取 csrf-token（页面结构可能已变化）'), {
            code: 'NO_CSRF',
          });
        });
      })
      .then(function (token) {
        csrfCache = { token: token, at: Date.now() };
        return token;
      });
  }

  /**
   * 手工绑定 Cookie 时，把凭据显式写进请求头。
   * 不传则完全交给浏览器自己的会话（GM_xmlhttpRequest 会自动带上）。
   */
  function withCookie(headers, cookie) {
    if (cookie && cookie.clientId) {
      headers.Cookie = '__client_id=' + cookie.clientId + '; _uid=' + (cookie.uid || '0');
    }
    return headers;
  }

  /** 当前浏览器（或指定 Cookie）在洛谷的登录状态 */
  function session(payload) {
    payload = payload || {};
    return request({
      method: 'GET',
      url: LUOGU + '/user/setting',
      headers: withCookie({ Accept: 'text/html,application/xhtml+xml' }, payload.cookie),
    }).then(function (response) {
      if (response.status === 401 || response.status === 403) {
        return { loggedIn: false, status: response.status };
      }
      if (response.status !== 200) {
        return { loggedIn: false, status: response.status, unknown: true };
      }
      var html = response.body || '';
      var uidMatch = /"uid"\s*:\s*(\d+)/.exec(html) || /\/user\/(\d+)/.exec(html);
      var nameMatch = /"name"\s*:\s*"([^"]{1,32})"/.exec(html);
      return {
        loggedIn: true,
        status: 200,
        uid: uidMatch ? Number(uidMatch[1]) : null,
        name: nameMatch ? nameMatch[1] : null,
      };
    });
  }

  /**
   * 提交代码。
   * payload: { pid, code, lang, enableO2, contestId, cookie }
   * cookie（可选）: { clientId, uid } —— 来自本站「洛谷账号」页手工粘贴的绑定 Cookie，
   * 用于"浏览器没登录，但想用某个账号提交"的场景；不填则完全使用浏览器自己的会话。
   */
  function submit(payload) {
    var pid = String(payload.pid || '').trim();
    if (!/^[A-Za-z]{1,3}\d{1,6}$/.test(pid)) {
      return Promise.reject(Object.assign(new Error('题号格式不对，应形如 P1001'), { code: 'BAD_PID' }));
    }
    if (typeof payload.code !== 'string' || !payload.code.trim()) {
      return Promise.reject(Object.assign(new Error('代码是空的'), { code: 'EMPTY_CODE' }));
    }
    var now = Date.now();
    if (now - lastSubmitAt < SUBMIT_COOLDOWN) {
      return Promise.reject(
        Object.assign(new Error('提交太快了，请等 ' + Math.ceil((SUBMIT_COOLDOWN - (now - lastSubmitAt)) / 1000) + ' 秒'), {
          code: 'COOLDOWN',
        }),
      );
    }

    var url = LUOGU + '/fe/api/problem/submit/' + encodeURIComponent(pid);
    if (payload.contestId) url += '?contestId=' + encodeURIComponent(payload.contestId);

    var headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-luogu-type': 'content-only',
      Referer: LUOGU + '/problem/' + pid,
      Origin: LUOGU,
    };
    withCookie(headers, payload.cookie);

    var body = JSON.stringify({
      code: payload.code,
      lang: Number(payload.lang) || 0,
      enableO2: payload.enableO2 ? 1 : 0,
    });

    lastSubmitAt = now;

    return fetchCsrf(pid)
      .then(function (token) {
        headers['X-CSRF-TOKEN'] = token;
        return request({ method: 'POST', url: url, headers: headers, data: body });
      })
      .then(function (response) {
        var json = parseJson(response.body);
        var rid = pick(json || {}, ['rid', 'data.rid', 'currentData.rid', 'data.data.rid']);
        if (response.status >= 200 && response.status < 300 && rid) {
          return { rid: Number(rid), status: response.status, raw: json };
        }
        var failure = describeFailure(response.status, json, response.body);
        throw Object.assign(new Error(failure.message), {
          code: failure.code,
          detail: failure.detail || { status: response.status, raw: json },
        });
      })
      .catch(function (error) {
        // 提交失败时不要占用冷却时间，允许用户立刻重试
        lastSubmitAt = 0;
        throw error;
      });
  }

  /** 读一条评测记录 */
  function record(rid) {
    if (!rid) {
      return Promise.reject(Object.assign(new Error('缺少记录号 rid'), { code: 'BAD_RID' }));
    }
    return request({
      method: 'GET',
      url: LUOGU + '/record/' + encodeURIComponent(rid) + '?_contentOnly=1',
      headers: { Accept: 'application/json', 'x-luogu-type': 'content-only' },
    }).then(function (response) {
      var json = parseJson(response.body);
      if (response.status !== 200) {
        var failure = describeFailure(response.status, json, response.body);
        throw Object.assign(new Error(failure.message), { code: failure.code });
      }
      var data = pick(json || {}, ['currentData.record', 'data.record', 'record']);
      if (!data) {
        throw Object.assign(new Error('洛谷没有返回这条评测记录'), { code: 'NO_RECORD' });
      }
      return data;
    });
  }

  /** 读某题的提交记录列表 */
  function records(payload) {
    var pid = String(payload.pid || '').trim();
    var page = Number(payload.page) || 1;
    var uid = payload.uid ? String(payload.uid) : '';
    var url =
      LUOGU +
      '/record/list?pid=' +
      encodeURIComponent(pid) +
      (uid ? '&user=' + encodeURIComponent(uid) : '') +
      '&page=' +
      page +
      '&_contentOnly=1';
    return request({
      method: 'GET',
      url: url,
      headers: withCookie({ Accept: 'application/json', 'x-luogu-type': 'content-only' }, payload.cookie),
    }).then(function (response) {
      var json = parseJson(response.body);
      if (response.status !== 200) {
        var failure = describeFailure(response.status, json, response.body);
        throw Object.assign(new Error(failure.message), { code: failure.code });
      }
      var list = pick(json || {}, [
        'currentData.records.result',
        'currentData.records',
        'data.records.result',
        'data.records',
        'records.result',
        'records',
      ]);
      if (Array.isArray(list)) return list;
      if (list && Array.isArray(list.result)) return list.result;
      return [];
    });
  }

  /** 诊断用：原样返回洛谷某个接口的状态码与响应片段（只允许洛谷域名） */
  function debug(payload) {
    var path = String(payload.path || '/');
    if (path.charAt(0) !== '/') path = '/' + path;
    return request({
      method: payload.method || 'GET',
      url: LUOGU + path,
      headers: { Accept: 'application/json, text/html', 'x-luogu-type': 'content-only' },
    }).then(function (response) {
      return {
        url: LUOGU + path,
        status: response.status,
        body: String(response.body || '').slice(0, 4000),
      };
    });
  }

  /* ------------------------------------------------------------------ *
   * 与页面通信
   * ------------------------------------------------------------------ */

  var HANDLERS = {
    ping: function () {
      return Promise.resolve({ bridge: true, version: VERSION, origin: W.location.origin });
    },
    session: session,
    submit: submit,
    record: function (payload) {
      return record(payload.rid);
    },
    records: records,
    debug: debug,
  };

  function handle(message) {
    var handler = HANDLERS[message.action];
    return Promise.resolve()
      .then(function () {
        if (!handler) {
          throw Object.assign(new Error('未知的桥接指令：' + message.action), {
            code: 'UNKNOWN_ACTION',
          });
        }
        return handler(message.payload || {});
      })
      .then(function (data) {
        return { ok: true, data: data };
      })
      .catch(function (error) {
        return {
          ok: false,
          error: {
            code: (error && error.code) || 'BRIDGE_ERROR',
            message: (error && error.message) || String(error),
            detail: error && error.detail ? error.detail : null,
          },
        };
      });
  }

  W.addEventListener(
    'message',
    function (event) {
      // 不使用 event.source 做判断：Firefox 的 Xray 包装会让恒等比较失败。
      // 真正的安全边界是下面的 origin 白名单 —— 只有本站页面能驱动这个桥。
      var data = event.data;
      if (!data || typeof data !== 'object' || data[REQUEST_FLAG] !== true) return;
      if (!isTrustedOrigin(event.origin)) return;
      var origin = event.origin;
      handle(data).then(function (result) {
        var reply = { __oiworldLuoguReply: true };
        reply[REPLY_FLAG] = true;
        reply.id = data.id;
        reply.ok = result.ok;
        if (result.ok) reply.data = result.data;
        else reply.error = result.error;
        post(reply, origin);
      });
    },
    false,
  );

  // 让页面能主动知道桥在不在（部分场景下 postMessage 的首次应答可能早于页面监听）
  try {
    W.__OIWORLD_LUOGU_BRIDGE__ = { version: VERSION, action: true };
  } catch (error) {
    /* 忽略 */
  }
})();
