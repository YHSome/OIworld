# 洛谷远程提交桥：设计说明

> 目标：让 OIworld 靶场像 vjudge 一样支持"绑定远程账号 → 在站内直接提交 → 看到洛谷的评测结果与提交记录"，
> 同时**不引入任何服务器**，用户的代码与 Cookie 都不离开自己的浏览器。

---

## 1. 先说结论：为什么需要装一次脚本

在线评测站的跨域行为是可以用命令实测出来的，下面每一条都是对着线上站点跑出来的结果，不是推断：

| 实测项 | 结果 | 含义 |
| --- | --- | --- |
| `OPTIONS /fe/api/problem/submit/P1001`（带 `Origin: https://yhsome.github.io`） | `403`，响应里**没有任何 `Access-Control-Allow-*` 头** | 浏览器会直接拦下这个跨域请求，页面连错误详情都读不到 |
| `POST /fe/api/problem/submit/P1001`（未登录） | `403 {"errorType":"…UserNotLoggedInException"}` | 接口存在且正确，只是需要登录态 |
| `Set-Cookie: __client_id=…; secure; httponly; samesite=none` | 见响应头 | `__client_id` / `_uid` 都是 **HttpOnly**，网页 JS（哪怕在洛谷自己的页面上）也读不到 |
| `fetch(url, {headers:{Cookie:'…'}})` | 浏览器忽略该头 | `Cookie` 属于 fetch/XHR 的**禁止请求头**，网页 JS 设不了 |
| `GET /user/setting`、`GET /record/list`（未登录） | `401` | 这两个接口必须有登录态 |

也就是说：

- **读取**洛谷数据被同源策略挡住（没有 CORS 头）；
- **携带登录凭据**在网页 JS 里根本做不到（禁止请求头 + HttpOnly）。

那 vjudge 为什么能只让用户粘一次 Cookie 就完事？因为 vjudge 的绑定页**只是一个表单**：
它把 Cookie 存到**它自己的服务器**上，之后由服务器去请求洛谷。服务器之间发 HTTP 请求没有同源策略。

本项目不引入服务器（否则就是另一套隐私与运维模型），于是采用**浏览器扩展同款**的方案：
由一个可读、可审、可随时删除的油猴脚本（`public/oiworld-luogu.user.js`）通过
`GM_xmlhttpRequest` 代网页发请求 —— 扩展发起的请求不受页面同源策略限制，并且会自动带上
你自己浏览器里的洛谷登录 Cookie。等价于你在洛谷页面上亲手点了"提交"。

```
┌──────────────────────────────┐         ┌───────────────────────────────┐
│  OIworld 页面（github.io）    │         │  浏览器里的油猴脚本            │
│  src/luogu/*                 │         │  oiworld-luogu.user.js        │
│                              │  postMessage（同源、带白名单校验）        │
│  提交按钮 ──▶ callLuoguBridge ├────────▶│  ping / session / submit /    │
│                              │◀────────┤  record / records / debug     │
│  评测结果 ◀── 轮询 record     │         │            │                  │
└──────────────────────────────┘         └────────────┼──────────────────┘
                                                      │ GM_xmlhttpRequest
                                                      │ （自动带浏览器 Cookie）
                                                      ▼
                                        https://www.luogu.com.cn
```

---

## 2. 用到的洛谷接口（均已核实）

| 用途 | 请求 | 说明 |
| --- | --- | --- |
| 取 CSRF | `GET /problem/{pid}` | 从 HTML 的 `<meta name="csrf-token" content="…">` 读取；取不到时回退请求首页 |
| 提交 | `POST /fe/api/problem/submit/{pid}` | body：`{lang, code, enableO2}`；头：`X-CSRF-TOKEN`、`Referer: …/problem/{pid}`、`Origin`；成功返回 `{rid}` |
| 评测结果 | `GET /record/{rid}?_contentOnly=1` | 记录详情（`currentData.record`） |
| 提交记录 | `GET /record/list?pid={pid}&page=1&_contentOnly=1` | 记录列表（`currentData.records`） |
| 登录检测 | `GET /user/setting` | 未登录时洛谷返回 `401` |

核实方式（不是猜的）：

- `POST /fe/api/problem/submit/{pid}` —— 直接请求线上接口，未登录时返回
  `LuoguFramework\...\UserNotLoggedInException`，而随机路径返回 `404`，说明路径正确；
- 请求体与响应字段 —— 读洛谷自己的前端产物（`columba~f0cc77bd6cc24cf8.js`）：
  `{lang: l, code: t, enableO2: n ? 1 : 0}`，调用 `{name:"api.problem.submit", params:{pid}}`，
  成功分支写的是 `const {rid} = await Q(...)`；
- 语言编号 —— 取自 `GET /_lfe/config` 的 `CodeLanguage` 枚举
  （`C++20 = 27`、`C++17 = 12`、`C++14 = 11`、`C = 2`、`Python 3 = 7`、`Java 8 = 8`……）；
- 评测状态 —— 取自同一份配置的 `RecordStatus` 枚举
  （`12 = AC`、`6 = WA`、`5 = TLE`、`4 = MLE`、`3 = OLE`、`2 = CE`、`7 = RE`、`11 = UKE`、
  `14 = NAC`、`0 = Waiting`、`1 = Judging`）。

> 这些接口是洛谷前端自己在用的**非公开接口**，随时可能变化。所以桥的错误处理一律保留原始返回，
> 并在 `/luogu` 页提供「读取洛谷原始返回」的诊断按钮。

---

## 3. 消息协议

网页 → 桥：

```js
window.postMessage(
  { __OIWORLD_LUOGU_REQUEST__: true, id, action, payload },
  window.location.origin,
);
```

桥 → 网页：

```js
window.postMessage(
  { __OIWORLD_LUOGU_REPLY__: true, id, ok, data | error },
  origin, // 只回给发起方
);
```

| action | payload | 返回 |
| --- | --- | --- |
| `ping` | — | `{bridge:true, version, origin}` |
| `session` | `{cookie?}` | `{loggedIn, status, uid?, name?}` |
| `submit` | `{pid, code, lang, enableO2, contestId?, cookie?}` | `{rid, status}` |
| `record` | `{rid}` | 记录对象（`status / score / time / memory / …`） |
| `records` | `{pid, page?, uid?, cookie?}` | 记录数组 |
| `debug` | `{path, method?}` | `{url, status, body}`（仅限洛谷域名，截断到 4000 字符） |

`cookie`（可选）就是绑定页里粘贴的 `{clientId, uid}`；不传则完全使用浏览器自身会话。
需要注意的是：**桥永远不会把 Cookie 回传给网页**，网页只在用户自己粘贴后把值存在自己的 localStorage 里。

错误统一成 `{code, message, detail?}`，`code` 取值：

`BAD_PID` / `EMPTY_CODE` / `COOLDOWN` / `NOT_LOGGED_IN` / `CAPTCHA` / `RATE_LIMIT` /
`NOT_FOUND` / `NO_CSRF` / `NO_RECORD` / `UNEXPECTED_HTML` / `UNKNOWN_ACTION` / `LUOGU_ERROR`。

---

## 4. 安全边界

| 边界 | 做法 |
| --- | --- |
| 谁能驱动桥 | 只接受 `origin` 为 `https://*.github.io` 或 `http://localhost(:port)` / `127.0.0.1(:port)` 的消息，其他来源**一律不回应**（`scripts/test-luogu-bridge.mjs` 有对应断言） |
| 凭据去哪了 | 桥不回传 Cookie；网页端只在你手动粘贴后存进自己的 localStorage（键 `oiworld:luogu`），解绑即清空 |
| 会不会偷偷提交 | 桥只在收到 `submit` 指令时发起提交，没有定时器、没有后台轮询；页面也必须由你点按钮才发指令 |
| 会不会刷洛谷 | 桥内置 5 秒提交冷却（失败会重置，允许立刻重试）；`debug` 只允许路径以 `/` 开头的洛谷地址 |
| 代码去哪了 | 只发往 `www.luogu.com.cn`（`@connect` 声明），没有第三方域名 |
| 能不能审计 | 脚本是仓库里的一个纯文本文件：`public/oiworld-luogu.user.js`，无压缩、无混淆 |

---

## 5. 已知限制与排查

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 提示"洛谷要求人机验证" | 洛谷对部分提交触发验证码 / Turnstile | 先在洛谷网站上手动交一次这道题，通过验证后再回本站提交 |
| 提示"洛谷认为当前浏览器没有登录" | 浏览器没有登录洛谷，或粘贴的 Cookie 已失效 | 去洛谷登录，或在 `/luogu` 重新绑定 |
| 点安装地址看到的是源码页 | GitHub Pages 对 `.user.js` 的 Content-Type 不固定，油猴有时不弹安装框 | 用 `/luogu` 页的「复制脚本内容」，在油猴面板新建脚本粘贴保存 |
| 桥一直显示未安装 | 脚本未启用 / 域名不匹配（脚本匹配 `*.github.io/OIworld/*` 与 localhost） | 在油猴面板确认脚本已启用；本地跑 `npm run dev` 时用 `http://localhost:5173` 访问 |
| 提交成功但一直"正在评测" | 洛谷评测队列拥堵 | 面板最多轮询 2 分钟，之后可用 `R{rid}` 链接去洛谷看结果 |
| 接口变化导致失败 | 洛谷改了非公开接口 | 用 `/luogu` 页的「读取洛谷原始返回」把返回贴给维护者 |

---

## 6. 怎么验证

```bash
# 1) 桥接脚本：假的油猴环境里跑，一半对着真实洛谷，一半用模拟已登录的响应
npm run test:bridge

# 2) 网页侧：注入一个"假洛谷桥"，验证 /luogu 页与题目页面板的全部交互
npm run preview                     # 另开一个终端
npm run test:luogu -- http://localhost:4173
```

`test:bridge` 的 live 部分会真的请求 `www.luogu.com.cn`（未登录状态），因此能证明：
csrf-token 抓取正确、提交接口地址正确（写错会得到 `NOT_FOUND` 而不是 `NOT_LOGGED_IN`）、
错误翻译正确、非本站 origin 得不到任何回应。**只有"提交成功"这一条无法在未登录状态下验证**，
mock 部分用假的洛谷响应覆盖了它（包括请求头、请求体、`rid` 解析、冷却、记录解析）。

---

## 7. 可以继续做的

1. **把 42 道 Pro 题目对应到精确的洛谷题号**（现在只有关键词搜索链接，题号可在题目页填写并记住）；
2. 提交成功后自动刷新提交记录（现在需要点一次「刷新提交记录」）；
3. 在 C++ / Python / Java 三个基础靶场也挂上这个面板（组件 `LuoguSubmitPanel` 已经是通用的，
   只要把题目与洛谷题号对应起来）；
4. 把洛谷的评测详情（每个测试点、编译信息）做成更细的展示。
