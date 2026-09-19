// ==UserScript==
// @name         OIworld 洛谷远程提交桥
// @namespace    https://github.com/YHSome/OIworld
// @version      1.0.1
// @description  让 OIworld 靶场页面在你的浏览器里直接向洛谷提交代码、读取评测结果与提交记录。Cookie 只在你的浏览器与洛谷之间流转，不经过任何第三方服务器。
// @author       YHSome
// @updateURL    https://yhsome.github.io/OIworld/oiworld-luogu.user.js
// @downloadURL  https://yhsome.github.io/OIworld/oiworld-luogu.user.js
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

  /**
   * 解析一次洛谷接口的响应体。
   *
   * 关键点：**洛谷对 `?_contentOnly=1` 的请求并不总是返回纯 JSON**，
   * 很多时候返回的仍然是 HTML，真正的 JSON 内嵌在
   * `<script id="lentille-context" type="application/json">…</script>` 里
   * （老版本则是 `window._feInjection = JSON.parse(decodeURIComponent("…"))`）。
   * 只做 JSON.parse(body) 会直接解析失败 → 被当成"没有记录"。
   */
  function parsePayload(body) {
    var text = String(body || '').trim();
    if (!text) return null;

    var direct = parseJson(text);
    if (direct) return direct;

    var context = extractLentilleContext(text);
    if (context) return context;

    var injection = /window\._feInjection\s*=\s*JSON\.parse\(decodeURIComponent\("([\s\S]*?)"\)\)/.exec(text);
    if (injection) {
      try {
        return JSON.parse(decodeURIComponent(injection[1]));
      } catch (error) {
        /* 继续往下兜底 */
      }
    }

    // 最后再兜一次：从 HTML 里截出第一个看起来完整的 JSON 对象
    var start = text.indexOf('{"');
    if (start !== -1) {
      var depth = 0;
      for (var i = start; i < text.length; i += 1) {
        var ch = text[i];
        if (ch === '{') depth += 1;
        else if (ch === '}') {
          depth -= 1;
          if (depth === 0) {
            var candidate = parseJson(text.slice(start, i + 1));
            if (candidate) return candidate;
            break;
          }
        }
      }
    }
    return null;
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

  /** 洛谷页面数据里的 JSON（现代洛谷把数据放在 <script id="lentille-context"> 中） */
  function extractLentilleContext(html) {
    var match = /<script id="lentille-context" type="application\/json">([\s\S]*?)<\/script>/.exec(
      html || '',
    );
    if (!match) return null;
    try {
      return JSON.parse(match[1]);
    } catch (error) {
      return null;
    }
  }

  /**
   * 按"结构"找出评测记录数组，而不是猜包装字段名。
   *
   * 洛谷的 _contentOnly 返回结构变过几次（currentData.records / data.records /
   * records.result 都出现过），靠固定路径解析一旦洛谷改版就会拿到空列表 ——
   * 这正是"提交了但在本站看不到记录"的根因。这里改成广度优先搜索：
   * 找到第一个"元素看起来像评测记录（有 status，且有 id/rid）"的数组。
   */
  function findRecords(value) {
    var queue = [value];
    var guard = 0;
    while (queue.length && guard < 500) {
      guard += 1;
      var node = queue.shift();
      if (Array.isArray(node)) {
        if (
          node.length > 0 &&
          node.every(function (item) {
            return item && typeof item === 'object' && 'status' in item && ('id' in item || 'rid' in item);
          })
        ) {
          return node;
        }
        for (var i = 0; i < node.length && i < 20; i += 1) {
          if (node[i] && typeof node[i] === 'object') queue.push(node[i]);
        }
        continue;
      }
      if (node && typeof node === 'object') {
        var keys = Object.keys(node);
        // 常见的容器字段优先
        var preferred = ['records', 'result', 'list', 'items', 'data', 'currentData'];
        for (var p = 0; p < preferred.length; p += 1) {
          if (preferred[p] in node && node[preferred[p]] && typeof node[preferred[p]] === 'object') {
            queue.unshift(node[preferred[p]]);
          }
        }
        for (var k = 0; k < keys.length; k += 1) {
          var key = keys[k];
          if (preferred.indexOf(key) !== -1) continue;
          var child = node[key];
          if (child && typeof child === 'object') queue.push(child);
        }
      }
    }
    return null;
  }

  /** 按"结构"找一条评测记录对象 */
  function findRecord(value) {
    var queue = [value];
    var guard = 0;
    while (queue.length && guard < 500) {
      guard += 1;
      var node = queue.shift();
      if (Array.isArray(node)) {
        for (var i = 0; i < node.length && i < 10; i += 1) {
          if (node[i] && typeof node[i] === 'object') queue.push(node[i]);
        }
        continue;
      }
      if (node && typeof node === 'object') {
        if ('status' in node && ('id' in node || 'rid' in node || 'score' in node)) return node;
        var keys = Object.keys(node);
        var preferred = ['record', 'data', 'currentData'];
        for (var p = 0; p < preferred.length; p += 1) {
          if (preferred[p] in node && node[preferred[p]] && typeof node[preferred[p]] === 'object') {
            queue.unshift(node[preferred[p]]);
          }
        }
        for (var k = 0; k < keys.length; k += 1) {
          var child = node[keys[k]];
          if (child && typeof child === 'object' && preferred.indexOf(keys[k]) === -1) queue.push(child);
        }
      }
    }
    return null;
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
      // 优先读洛谷内嵌的 lentille-context JSON（结构最可靠），拿不到再退回正则
      var uid = null;
      var name = null;
      var context = extractLentilleContext(html);
      var user = context && context.user;
      if (user) {
        if (typeof user.uid === 'number') uid = user.uid;
        if (typeof user.name === 'string') name = user.name;
      }
      if (uid === null) {
        // 只认「user 对象里的 uid」，避免误抓到页面上其他人的 uid
        var uidMatch =
          /"user"\s*:\s*\{[^{}]*?"uid"\s*:\s*(\d+)/.exec(html) || /"uid"\s*:\s*(\d+)/.exec(html);
        uid = uidMatch ? Number(uidMatch[1]) : null;
      }
      if (name === null) {
        var nameMatch = /"user"\s*:\s*\{[^{}]*?"name"\s*:\s*"([^"]{1,32})"/.exec(html) ||
          /"name"\s*:\s*"([^"]{1,32})"/.exec(html);
        name = nameMatch ? nameMatch[1] : null;
      }
      return { loggedIn: true, status: 200, uid: uid, name: name };
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
        var json = parsePayload(response.body);
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
      var json = parsePayload(response.body);
      if (response.status !== 200) {
        var failure = describeFailure(response.status, json, response.body);
        throw Object.assign(new Error(failure.message), { code: failure.code });
      }
      var data = findRecord(json) || pick(json || {}, ['currentData.record', 'data.record', 'record']);
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
      var json = parsePayload(response.body);
      if (response.status !== 200) {
        var failure = describeFailure(response.status, json, response.body);
        throw Object.assign(new Error(failure.message), { code: failure.code });
      }
      var list = findRecords(json) || pick(json || {}, [
        'currentData.records.result',
        'currentData.records',
        'data.records.result',
        'data.records',
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
