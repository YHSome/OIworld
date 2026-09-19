# 洛谷远程提交：设计说明

> 目标：让 OIworld 靶场像 vjudge 一样支持"绑定远程账号 → 在站内直接提交 → 看到洛谷的评测结果与提交记录"，
> 同时**不引入任何服务器**，用户的代码与 Cookie 都不离开自己的浏览器。

本项目提供**两条互不冲突的路径**：

| 路径 | 是什么 | 安装成本 | 适用 |
| --- | --- | --- | --- |
| **A. 桥接脚本** | 一个油猴脚本（`public/oiworld-luogu.user.js`），由扩展用 `GM_xmlhttpRequest` 代网页发请求 | 装一次 Tampermonkey / Violentmonkey | 经常交题：在 OIworld 里点按钮即可提交、实时看结果、拉提交记录（评测结束会自动刷新记录列表） |
| **B. 书签提交** | 一个 `javascript:` 书签（`src/luogu/bookmarklet.ts`），在**洛谷自己的页面里**运行 | 拖一次书签栏，无扩展 | 偶尔交一次：不想装任何东西 |

两条路都只在你的浏览器与洛谷之间通信，本仓库没有任何服务端代码。

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

## 3.5 路径 B：书签提交（免安装）

书签的地址本身就是一段 `javascript:` 代码（源码见 `src/luogu/bookmarklet.ts`，约 5.6KB 纯文本）。
你在**洛谷的题目页**点它时，这段代码在洛谷页面的上下文里运行，于是：

- 它和洛谷**同源**，`fetch('/fe/api/problem/submit/{pid}')` 不会被同源策略拦；
- 浏览器会自动带上你自己在洛谷的登录 Cookie（不需要 JS 去伪造 `Cookie` 头）；
- csrf-token 直接从当前页面的 `<meta name="csrf-token">` 里读；
- 结果同样通过 `/record/{rid}?_contentOnly=1` 轮询，画面右上角浮层实时显示 AC / WA / …

代码从哪来？在 OIworld 题目页点「书签提交」时会：

1. 把 `{code, lang, enableO2}` 做 base64url 编码放进**剪贴板**；
2. 打开 `https://www.luogu.com.cn/problem/{pid}?oiworld=<同一份编码>`；
   如果编码太长（>3500 字符，地址栏装不下），就只带 `?oiworld-lang=…&oiworld-o2=…`，代码全靠剪贴板。

书签脚本的取值顺序：**地址栏参数 → 剪贴板 → 弹输入框让你粘贴**，三级兜底，任何一环失效都还能提交。
它在非题目页被点开时会明确提示"请先在洛谷打开一道题目的页面"，不会乱发请求。

安全边界：只在 `luogu.com.cn` 页面里运行；只读该页面的 csrf-token；除了洛谷自己的接口不请求任何域名；
不会读取或保存任何与提交无关的数据。它的源码就在仓库里，可以逐行读，也可以自己改。

已知限制：完全依赖洛谷页面的 DOM/接口结构，洛谷改版时可能失效（这时用路径 A）；
每次提交都要手动点一下书签。

---

## 4. 安全边界

| 边界 | 做法 |
| --- | --- |
| 谁能驱动桥 | 只接受 `origin` 为 `https://*.github.io` 或 `http://localhost(:port)` / `127.0.0.1(:port)` 的消息，其他来源**一律不回应**（`scripts/test-luogu-bridge.mjs` 有对应断言） |
| 书签会读什么 | 只读当前洛谷页面的 `<meta name="csrf-token">` 与地址栏/剪贴板里的代码载荷；不读表单、不读其他站点 |
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

# 2) 网页侧：注入站点上真实的桥接脚本（只替换 GM_xmlhttpRequest），验证 /luogu 页、
#    四个靶场的题目页面板、以及"书签提交"真的能提交（把地址伪装成洛谷题目页 + 假 fetch）
npm run preview                     # 另开一个终端
npm run test:luogu -- http://localhost:4173
npm run test:luogu -- https://yhsome.github.io/OIworld hash   # 对线上站点跑

# 3) 题库里的洛谷题号：逐个访问洛谷题目页核对
npm run validate:luogu
```

`test:bridge` 的 live 部分会真的请求 `www.luogu.com.cn`（未登录状态），因此能证明：
csrf-token 抓取正确、提交接口地址正确（写错会得到 `NOT_FOUND` 而不是 `NOT_LOGGED_IN`）、
错误翻译正确、非本站 origin 得不到任何回应。**只有"提交成功"这一条无法在未登录状态下验证**，
mock 部分用假的洛谷响应覆盖了它（包括请求头、请求体、`rid` 解析、冷却、记录解析）。

`test:luogu` 里的"书签提交"用例会在真实浏览器里跑**书签里的那段真实源码**：
先把地址 `pushState` 成 `/problem/P1001?oiworld=…`、注入 csrf meta、把 `fetch` 换成记录用的假实现，
然后断言它确实打到了提交接口、带上了 csrf-token、提交的是地址里那段代码与语言，
并在轮询两次后把 `AC R…` 显示在浮层上；另外还验证了在非题目页被点开时只给提示、不发请求。

---

## 7. 题库与洛谷题号的映射

四个靶场的题目都标注了洛谷题目，点题号即可跳转，题目页的提交面板也会**自动预填**这个题号：

| 靶场 | 标注情况 | 文案 | 含义 |
| --- | --- | --- | --- |
| Pro（`/pro`） | 41/42 | 「洛谷对应题目」 | 同一种算法的对应题目（p1-5 下一个更大元素 → `P5788【模板】单调栈`） |
| C++ / Python / Java | 122/126 | 「洛谷同类型练习」 | 同一种语法的同类练习（简易计算器 → `B2052 简单计算器`） |

- Pro 的题号直接写在 `src/pro/stages/stage-N.ts` 里（`luoguCode` 字段）；
- 三个基础靶场的映射统一放在 **`src/data/luogu-codes.ts`**：这三个靶场是按同一套知识点平行编排的，
  放一张表里能一眼看出"同一个知识点在三轨分别练哪道洛谷题"，改起来也不会漏改某一轨；
- 洛谷确实没有对应练习的题**留空**（「交换两个数」×3、「反转链表」×2），界面显示 `—`，
  不硬塞一道不相关的题。留空的题仍然可以让用户自己填题号，填过会按题目记住。

映射的核实方式是"先搜候选、再逐题访问洛谷页面核对标题"：

```bash
node scripts/luogu-lookup.mjs --all           # 按题库里的关键词列出候选题目（题号 / 难度 / 通过数 / 标题）
node scripts/luogu-lookup.mjs 单调栈           # 单个关键词
node scripts/luogu-lookup.mjs --check P5788    # 核对某个题号是否存在并打印标题
npm run validate:luogu                         # 门禁：四个靶场的每个题号都访问一次洛谷页面核对
node scripts/verify-luogu-codes.mjs --track=cpp --problem=s1-p1   # 只看某一道
```

`npm run validate:luogu` 是内容门禁的一部分：题号写错会让人把代码交到别的题上，
肉眼很难发现，所以交给脚本对真实洛谷校验（当前四个靶场合计 88 个不同题号，全部通过）。

## 8. 可以继续做的

1. 把 C++ / Python / Java 里那 4 道留空的题也找到合适的洛谷练习（现在洛谷确实没有对应题目）；
2. 把洛谷的评测详情（每个测试点、编译信息）做成更细的展示；
3. 在面板里直接显示洛谷那题的标题与难度（需要一次额外的只读请求，现在只显示题号）。
