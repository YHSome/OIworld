# OIworld · C++ 基础语法学习靶场

一个**纯前端**的 C++ 零基础教学靶场：用户在网页里写 C++ 代码，点「运行」后由编译成
**WebAssembly 的真实 clang 编译器**在浏览器本地编译、在 WASI 沙箱里执行，实时看到输出或编译错误。

没有后端、没有容器、没有远程判题机——代码不会离开用户的浏览器。

另有独立的 **Python 基础语法靶场**（`/python`）：包含 7 个学习阶段、42 道可运行与提交评测的练习题，覆盖输出、输入、变量、判断、循环、列表、字符串、函数与字典。每题均包含本关新知识、动手前思考、常见错误与提示。Python 由 Pyodide（WebAssembly）在浏览器本地运行，题目进度与 C++ 靶场分开保存；`/python/guide` 还提供零基础语法指南。

**Java 基础语法靶场**（`/java`）：同样 **7 个阶段、42 道题**，使用 Doppio JVM 与 Java 8 类库在浏览器本地编译、运行和评测 Java 代码——从类与 `main`、`System.out.println`、变量与 `Scanner` 输入，一路到判断、循环、数组与字符串、方法与递归、类与对象、`HashMap` 集合。

| 阶段 | 主题 | 知识点 |
| --- | --- | --- |
| 一 | 类与 main | `System.out.println`、变量、`Scanner` 输入、`double` |
| 二 | 运算符与判断 | 算术 / 关系 / 逻辑运算、`if / else`、`switch` |
| 三 | 循环 | `for`、`while`、嵌套循环、`break`、标志变量 |
| 四 | 数组与字符串 | 数组遍历与最值、`String.length()` / `charAt()`、回文判断 |
| 五 | 方法 | 定义与调用、`static`、数组参数、值传递、递归、重载 |
| 六 | 类与对象 | 定义类、字段、构造方法、对象数组、冒泡排序 |
| 七 | 集合与哈希表 | `ArrayList`、`HashMap` 计数与查找、按顺序输出 |

Java 靶场同样支持：顺序解锁与开发者模式、`写到哪？`（光标跳到 `// TODO`）、
javac 报错与中文标点的中文自查提示（`src/java/diagnostics.ts`）、每道题统一的
「题目背景 → 任务 → 本关新知识 → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士」讲解结构，
以及 `/java/guide` 入门指南。

> 浏览器里的 Java 运行时是纯 JavaScript 实现的 Doppio JVM，**第一次编译约需 1~2 分钟**（之后同一会话内更快）；
> 因此题库里的程序都刻意保持轻量：循环几千次以内、输出几十行以内。

**Pro 靶场**（`/pro`）：面向"已经会基础语法、开始学数据结构与算法"的读者，同样 **7 个阶段、42 道题**，
用 C++ 编写、复用 C++ 靶场的 clang-wasm 链路在浏览器本地编译运行。

| 阶段 | 主题 | 知识点 |
| --- | --- | --- |
| 一 | 栈与队列 | 数组实现栈/队列、括号匹配、后缀表达式、单调栈、单调队列 |
| 二 | 链表与字符串进阶 | 数组模拟链表、反转/合并链表、KMP、字符串哈希、Trie |
| 三 | 树与堆 | 二叉树遍历与统计、BST、堆的上浮下沉、哈夫曼、并查集 |
| 四 | 排序与二分 | 快排、归并求逆序对、二分查找、二分答案、前缀和、差分 |
| 五 | 图论基础 | 图存储、DFS/BFS、拓扑排序、Kruskal、Dijkstra |
| 六 | 动态规划入门 | 数字三角形、01 背包、完全背包、LIS、LCS、编辑距离 |
| 七 | 进阶技巧 | 快速幂、线性筛、扩展欧几里得、树状数组、线段树、贪心 |

Pro 题目的讲解结构是「题目背景 → 任务 → **思路与知识点** → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士」，
重点是**算法思路、复杂度分析与边界处理**（而不是基础语法）。每道题还会给出
**洛谷同类型题目的跳转链接**，并且可以直接**把代码远程提交到洛谷**（见下一节）。

### 洛谷远程提交（`/luogu`）

绑定一次洛谷账号后，题目页会出现「提交到洛谷」面板：填洛谷题号（例如 `P1001`，会记住）、
选洛谷评测语言（默认按靶场自动选：C++20 / Python 3 / Java 8 = 洛谷语言 27 / 7 / 8）、一键提交，
并**实时轮询洛谷的评测结果**（AC / WA / TLE / MLE / RE / CE……），还能拉取该题在洛谷的
**提交记录列表**——就是 vjudge 那种远程提交体验。**四个靶场的题目页都有这个面板**。

绑定页 `/luogu` 的交互与 vjudge 的「远程账号管理」一致（保护 / 账号 / 状态 / 更新时间 / 操作 表格，
下面是可以粘贴 `__client_id` 与 `_uid` 的绑定表单），也支持**一键使用浏览器里已登录的洛谷会话**。

**两种使用方式，都完全跑在你自己的浏览器里：**

| 方式 | 安装成本 | 体验 |
| --- | --- | --- |
| **桥接脚本**（推荐） | 装一次油猴脚本（Tampermonkey / Violentmonkey） | 在 OIworld 里点按钮就能提交、实时看结果、拉提交记录 |
| **书签提交**（免安装） | 把 `/luogu` 页的「📤 OIworld 提交」按钮拖到书签栏 | 点「书签提交」→ 自动复制代码并打开洛谷题目页 → 在洛谷页面点一下书签 → 右上角浮层显示评测结果 |

> **为什么至少需要其中之一？** 这是浏览器规则决定的，不是实现选择：
> 洛谷的响应里**没有 CORS 头**（本站页面读不到洛谷的任何返回），而 `Cookie` 是 fetch/XHR 的
> **禁止请求头**（网页 JS 无法携带登录凭据）。vjudge 能只让用户粘一次 Cookie，是因为它把 Cookie
> 存到**它自己的服务器**上、由服务器代发请求；本项目不引入服务器，于是用两种**不离开浏览器**的办法：
> 桥接脚本由扩展代发请求；书签脚本则干脆在**洛谷自己的页面里**运行（同源，天然能用登录态）。
> 代码与 Cookie 都不会离开你的机器：绑定信息只存 `localStorage`（键 `oiworld:luogu`），解绑即清空，
> 本站没有任何后端。
>
> 详情、实测证据、接口清单、消息协议与安全边界见 **[docs/luogu-bridge.md](docs/luogu-bridge.md)**。

**Pro 靶场的 42 道题已经对应到洛谷精确题号**（41 道有题号 + 1 道洛谷没有同类题目只给关键词搜索），
每个题号都用 `npm run validate:luogu` 对着洛谷真实页面核对过（例如 p1-5 下一个更大元素 → `P5788 【模板】单调栈`）。

本站仍然**不抓取、不缓存洛谷题面**：题目描述、测试用例与参考题解都是本站自撰，洛谷只作为"在线评测"使用。

四个靶场是**同一套页面结构**，用顶栏右上角的 `C++ / Python / Java / Pro 靶场` 按钮切换（各自的进度互相独立）：

```
首页（阶段卡片 + 进度统计 + 搜索筛选）
  └─ 阶段页（阶段简介 + 题目列表：状态 / 难度 / 知识点 / 测试点数）
       └─ 题目页（左侧题目描述 + 提示 + 题解 ｜ 右侧编辑器 + 标准输入 / 运行结果 + 测试用例）
            └─ 进度页（统计 + 各阶段完成情况）   ·   指南页（零基础语法速查）
```

Java 靶场同样支持：顺序解锁与开发者模式、`写到哪？`（光标跳到 `// TODO`）、
中文标点与 javac 报错的中文自查提示、每题的本关新知识与常见错误。
Pro 靶场因为用 C++ 链路，还多一个**开发者面板**（编译参数 / 工具链来源 / 耗时 / 原始诊断 / 复制题目 JSON）。

**在线试玩**：<https://yhsome.github.io/OIworld/>（GitHub Pages 自动部署，推送到 `main` 即发布）

```
首页（7 个阶段 / 42 道题） → 阶段题目列表 → 题目详情（左题目 · 右编辑器） → 运行 / 提交评测 → 进度存本地
```

---

## 快速开始

```bash
npm install          # 安装依赖（含 browsercc 提供的编译器 Wasm 工具链）
npm run dev          # 开发模式，默认 http://localhost:5173
npm run build        # 类型检查 + 生产构建
npm run preview      # 预览生产构建，默认 http://localhost:4173
```

首次打开题目页时，浏览器需要加载约 **90MB** 的编译器资源
（`clang.wasm` 40MB + `lld.wasm` 22MB + `sysroot.tar` 27MB），
页面顶部会显示下载进度；下载后由浏览器缓存，后续打开只需不到 1 秒。
之后每次编译约 **2 秒**（在本机实测：从点击「运行」到看到输出 2.4 秒）。

---

## 面向零基础的设计

这个靶场的默认读者是**完全没有写过代码**的人。除了题目本身，还有三层"手把手"设计：

1. **新手指南 · 第零课（`/guide`）** —— 一页完整的入门读物：
   这个网站怎么工作、程序 / 语言 / 编译器是什么、题目页每个按钮干什么、
   **逐行读懂第一段代码**、把 `cout << "..." << endl;` 拆成表格一个符号一个符号地解释、
   四步做完第一题、**中文标点这个大坑**、常见报错中英对照表、英文小词典。
   首页、顶栏都有入口，第一题页面上还有引导卡片。

2. **每道题都带「本关新知识」和「常见错误」** —— 题目描述不只有"要做什么"，还有"怎么写"：
   本关新知识用大白话 + 可运行代码 + 要点表格，讲清**这道题**需要的语法
   （`for` 的三个部分与执行顺序、`struct` 末尾的分号、`map` 的 `kv.first` / `kv.second`……）；
   常见错误表格列出新手在**这道题**上真实会踩的坑
   （`i < n` 还是 `i <= n`、值传递为什么改不动外面的变量、依赖 `unordered_map` 遍历顺序会出错……）。

3. **编译器会说人话** —— 编译失败时，结果面板先给「零基础自查提示」：
   自动扫描代码里的**中文标点**（会先剔除注释与字符串，避免误报 `cout << "你好，世界"`），
   指出第几行第几列、该换成哪个英文符号；并把 `expected ';'`、
   `use of undeclared identifier 'cout'`、`no matching function` 等常见报错翻译成中文的建议。
   工具栏的「写到哪？」按钮会把光标直接定位到 `// TODO` 那一行。

---

## 开发者模式

题库作者 / 前端开发者想抽查被锁住的题目时用它 —— 因为**做题顺序是固定的「按顺序解锁」规则，
页面上没有关闭它的开关**，开发者模式是唯一的解锁途径。

**三种打开方式**（都会持久化，刷新后仍有效）：

| 方式 | 用法 |
| --- | --- |
| URL | `http://localhost:4173/?dev=1` 打开、`?dev=0` 关闭（参数会自动从地址栏清掉，不会反复提示） |
| 快捷键 | `Ctrl + Shift + D` 随时切换（不用离开当前题目页） |
| 设置页 | 「我的进度 → 设置与数据 → 开发者模式」开关 |

打开后：

- **所有题目解锁**，不再受「按顺序解锁」的限制，可以直接打开任意一题
  （顶栏出现紫色 `DEV` 标记）；
- **未通过也能查看参考题解**，还能一键「把参考题解填进编辑器」，顺手点「提交」就能验证这道题的判题数据；
- 题目页底部多出**开发者面板**：题目元信息（ID / 阶段 / 难度 / 知识点 / 用例数 / 代码行数）、
  实际编译参数（`-std=c++20 -O0 -Wall -fno-exceptions`）、工具链来源与版本、
  上次编译与运行耗时、**编译器原始 stderr**，以及「复制题目 JSON」「下载 `sX-pY.json`」按钮（方便直接改题库）。

> 日常练习保持关闭即可。它只是一个纯前端开关，只影响你自己的浏览器。

---

## 部署到 GitHub Pages

仓库自带 `.github/workflows/deploy-pages.yml`：**推送到 `main` 就自动构建并发布**（也可在 Actions 里手动触发）。
线上地址：<https://yhsome.github.io/OIworld/>

部署形态与本地开发有三点差异，工作流里已经处理好：

| 差异 | 本地开发 | GitHub Pages |
| --- | --- | --- |
| base 路径 | `/` | `/<仓库名>/` —— 项目站点不在域名根下，资源与 Worker 都必须带前缀 |
| 路由 | `BrowserRouter`（干净 URL） | `HashRouter`（`#/problem/s1-p1`）—— 刷新深链不会 404 |
| 编译器工具链 | `<base>/toolchain`（dev 中间件映射 `node_modules`） | jsDelivr CDN（Pages 上没有 `/toolchain`，`fetchManifest` 失败后自动回退） |

`public/404.html` 会把「本地开发的干净链接」（如 `/OIworld/problem/s1-p1`）重定向成对应的 hash 路由，
所以老书签也不会失效。

**想改成同源加载编译器（完全不依赖外部 CDN）：**

```bash
npm run setup:toolchain     # 生成 public/toolchain（约 90MB）
# 然后把 .gitignore 里的 public/toolchain 一行去掉，一起提交
```

代价：仓库体积涨到约 95MB（`clang.wasm` 单文件 43MB，未超 GitHub 的 100MB 限制每文件），
且 GitHub Pages 每月 100GB 的软带宽上限大约只够 1000 个首次访问者。

**本地验证部署形态：**

```bash
npm run build -- --base=/OIworld/     # 配合环境变量 VITE_HASH_ROUTER=1
npx vite preview --base=/OIworld/
node scripts/e2e-static.mjs http://localhost:4173/OIworld/
```

> 本站在 Pages 上不需要任何自定义响应头（没有使用 SharedArrayBuffer 与线程），
> 所以"Pages 不能设置 header"这条限制对我们没有影响。

---

## 技术栈

| 方向 | 选型 |
| --- | --- |
| 框架 | React 18 + TypeScript 5 | 
| 构建 | Vite 6 |
| 代码编辑器 | Monaco Editor（VS Code 同款，本地打包，不走 CDN）+ `@monaco-editor/react` |
| C++ 编译器 | clang / wasm-ld 的 WebAssembly 构建，来自 [`browsercc`](https://github.com/BertalanD/browsercc) |
| 运行沙箱 | WASI（[`@bjorn3/browser_wasi_shim`](https://www.npmjs.com/package/@bjorn3/browser_wasi_shim)） |
| 状态管理 | Zustand（+ `persist` 中间件写 localStorage） |
| UI | Ant Design 5 |
| 路由 | React Router 6 |
| 题目数据 | `src/data/problems/stage-*.json`（JSON 文件，打包进产物，离线可用） |

---

## 编译 / 执行链路

```
       主线程                      compile.worker                run.worker
┌────────────────────┐      ┌────────────────────────┐    ┌──────────────────────┐
│ Monaco 编辑器       │      │ clang.wasm（cc1）       │    │ WebAssembly 实例化     │
│ 代码 + 标准输入      │─────▶│   ↓ 目标文件             │    │  + WASI shim         │
│ compilerService     │      │ lld.wasm（wasm-ld）     │    │  stdin → fd0         │
│  ├ 编译一次          │◀─────│   ↓ 可执行 wasm 字节码   │───▶│  stdout/stderr 捕获   │
│  └ 跑 N 个测试用例   │      └────────────────────────┘    └──────────────────────┘
│ 超时 → terminate()  │                                       每用例一个全新沙箱
└────────────────────┘
```

设计要点：

1. **编译与执行分成两个 Worker。** 编译器（`clang`）只编译不执行，产物是一段 wasm 字节码；
   执行放在另一个 Worker 里，这样**一次提交只需要编译一次**，N 个测试用例复用同一份产物。
2. **硬超时靠 `worker.terminate()`。** 死循环的用户代码是无法从内部中断的，
   所以主线程计时超时后直接杀掉执行 Worker（默认 3 秒），再新建一个继续下一个用例。
   编译器 Worker 是常驻的，不受影响。
3. **编译器实例不可复用。** Emscripten 构建的 clang 在 `callMain` 之后运行时即退出，
   再次调用会崩；因此每次编译都新建 clang / wasm-ld 实例（与 browsercc 官方实现一致），
   但**编译参数（`-###` 解析结果）只计算一次**，省掉每次编译的额外开销。
4. **`callMain` 会污染入参数组**（Emscripten 内部 `args.unshift(thisProgram)`），
   所以传入前必须复制一份，否则第二次编译会报 `unknown argument: '-cc1'`。
5. **输出防护。** 单流输出超过 64KB 立即中止并提示；stdout / stderr 分别捕获。
6. **错误可视化。** clang 的 `文件:行:列: error: …` 会被解析成结构化诊断，
   既显示在结果面板（可点击），也转成 Monaco 的红点标记。

### 编译参数（固定）

```
-std=c++20 -O0 -Wall -fno-exceptions
```

`-fno-exceptions` **是必须的**：本工具链的 wasi-sysroot 中 libc++ 是关闭异常编译的，
不加这个参数链接时会报 `undefined symbol: __cxa_throw`。
因此**题库中不能使用 `try / catch / throw`，也不要用会抛异常的 `.at()`**。

---

## 编译器工具链从哪里来

`src/compiler/toolchain.ts` 按以下优先级解析：

1. 环境变量 `VITE_TOOLCHAIN_BASE`
2. 同源静态目录 `/toolchain`（执行过 `npm run setup:toolchain` 时存在）
3. jsDelivr CDN：`https://cdn.jsdelivr.net/npm/browsercc@0.1.1/dist`

开发服务器（`vite.config.ts` 里的 `oiworld-toolchain-dev-server` 插件）会把 `/toolchain/*`
映射到 `node_modules/browsercc/dist/*`，所以 **`npm run dev` 开箱即用、无需任何额外步骤**，
也不会把 90MB 文件复制进仓库。

需要**完全离线**（或部署到内网）时：

```bash
npm run setup:toolchain     # 把工具链复制到 public/toolchain/（约 90MB，已在 .gitignore 中）
npm run build               # dist 产物会自带编译器，运行时不再访问外网
```

部署提示：`/toolchain/*.wasm` 需要以 `application/wasm` 提供；
本站不需要 COOP/COEP 头（没有使用 SharedArrayBuffer / 线程）。

---

## 目录结构

```
src/
├─ compiler/            C++ 编译与运行链路：client.ts（编译服务）、compile.worker.ts（clang）、
│                      run.worker.ts（WASI 沙箱）、toolchain.ts（工具链定位与预加载）、
│                      diagnostics.ts（clang 诊断 + 中文标点检测）、judge.ts（输出比对）
├─ python/              Python 靶场：data.ts（阶段与题库）、compiler.ts（Pyodide）、
│                      diagnostics.ts（报错自查提示）、usePythonProgressStore.ts
├─ java/                Java 靶场：data.ts（阶段与题库）、service.ts（Doppio JVM）、
│                      diagnostics.ts（javac 报错自查提示）、useJavaProgressStore.ts、
│                      runtimeInfo.ts（运行时文案）
├─ pro/                 Pro 靶场：data.ts（阶段与题库）、lesson.ts（题面模板）、stages/stage-1..7.ts、
│                      useProProgressStore.ts
├─ luogu/               洛谷远程提交：bridge.ts（postMessage 客户端）、service.ts（提交 / 轮询 / 记录）、
│                      verdict.ts（洛谷评测状态表）、languages.ts（洛谷语言编号）、
│                      bookmarklet.ts（免安装的「书签提交」脚本）、
│                      useLuoguStore.ts（账号绑定，localStorage）、useLuoguBridge.ts（桥检测）
├─ data/
│  ├─ index.ts           题库加载、搜索筛选、解锁规则、统计
│  ├─ guide.md           C++ 新手指南（第零课）
│  ├─ java-guide.md      Java 入门指南
│  └─ problems/stage-1..7.json   题库（阶段一 ~ 阶段七）
├─ store/useProgressStore.ts     进度 + 代码草稿 + 开发者模式（localStorage）
├─ pages/                三个靶场各一套页面（Home / Stage / Problem / Progress / Guide）
├─ components/           编辑器、输出面板、测试用例面板、Markdown、题目表格、洛谷提交面板等
├─ hooks/                useCompiler（C++ 编译器状态）、useDeveloperMode（开发者模式）
└─ editor/monaco.ts      Monaco 本地化配置（Worker 由 Vite 打包）

public/
└─ oiworld-luogu.user.js 洛谷桥接脚本（油猴脚本，纯文本可审计；由 /luogu 页引导安装）

docs/
└─ luogu-bridge.md       洛谷远程提交桥的设计说明：实测证据、接口清单、消息协议、安全边界、排查

scripts/
├─ node-toolchain.mjs    在 Node 里跑同一套 clang-wasm 流程（校验题库用）
├─ validate-problems.mjs 题库校验：题解必须能编译并在每个用例上输出正确
├─ copy-toolchain.mjs    离线工具链安装（setup:toolchain）
├─ lib/luogu-http.mjs    访问洛谷的 Node HTTP 客户端（Cookie 罐 + 跟随重定向）
├─ luogu-lookup.mjs      洛谷题号查询（候选搜索 / 核对题号）
├─ verify-luogu-codes.mjs 洛谷题号校验（真实访问洛谷题目页）
├─ test-luogu-bridge.mjs 洛谷桥接脚本测试（真实请求 + 模拟已登录两套）
├─ e2e-luogu.mjs         洛谷远程提交验收（真实桥接脚本 + 假扩展层 + 书签提交）
├─ e2e.mjs               浏览器端到端冒烟测试（Playwright）
├─ e2e-problem.mjs       单题深度验收：渲染 + 用参考题解提交
├─ e2e-beginner.mjs      零基础路径验收：新手指南 / 跳转 TODO / 中文标点提示
└─ problem-sources/      题库的“源文件”：用 JS 模板字符串写题面，
                         node gen-stage-N.mjs 生成本阶段的 JSON
```

> 为什么不直接手写 JSON？题目描述是长 Markdown，直接写 JSON 要到处转义 `\n` 和引号，
> 很容易出错。`scripts/problem-sources/gen-stage-N.mjs` 用模板字符串书写题面，
> 再 `JSON.stringify(..., null, 2)` 输出，既能保证 JSON 合法，改题面也不用和转义符搏斗。
> 生成结果是幂等的：重新生成后 `src/data/problems/*.json` 内容完全一致。

---

## 题库与数据结构

```ts
interface Problem {
  id: string;                 // s1-p1 … s7-p6
  title: string;
  difficulty: '入门' | '简单' | '中等';
  knowledge_point: string;
  description: string;        // Markdown，见下面的章节结构
  starter_code: string;       // 初始代码，必须能编译通过
  solution_code: string;      // 参考题解
  test_cases: { input: string; expected_output: string }[];
  hints: string[];
}
```

`description` 的章节结构（面向零基础，逐段递进）：

```
### 题目背景          生活化的场景，说明这题要解决什么
### 任务              一句话说清要做什么
### 本关新知识        这道题需要的语法：大白话 + 可运行代码 + 要点表格
### 输入格式 / 输出格式
### 样例              输入输出代码块
### 说明 / 小贴士     可选
### 常见错误          新手在这道题上真实会踩的坑（表格：错误写法 / 后果 / 正确写法）
```

### 课程阶段

| 阶段 | 主题 | 知识点 |
| --- | --- | --- |
| 一 | 让程序开口说话 | `cout`、变量、类型、`cin` |
| 二 | 让程序学会判断 | 运算符、`if / else`、`switch` |
| 三 | 让程序学会重复 | `for` / `while`、嵌套循环、`break` |
| 四 | 一批数据的处理 | 数组、遍历、最值、`string` |
| 五 | 化整为零 | 函数、引用传参、重载、递归 |
| 六 | 自定义数据类型 | `struct`、结构体数组、排序 |
| 七 | 键值映射 | `map` / `unordered_map`、`vector`、综合应用 |

共 **42 道题**，全部通过校验脚本验证（见下）。

### 评测规则

- 忽略每行的**行尾空格 / 制表符**、忽略输出**末尾多余的空行**、统一 CRLF/LF；
- 行内空格、大小写、行数差异**算错**；
- 「运行」只用标准输入框里的数据跑一次；「提交」跑完全部测试用例并逐个比对；
- 全部通过 → 标记完成、解锁下一题（**做题顺序固定为「按顺序解锁」**，没有开关可关；只有开发者模式能临时解锁全部）；否则记录为「未通过」并展示第一个失败用例的期望/实际对比。

### 新增题目

1. 在对应的 `src/data/problems/stage-N.json` 里追加一道题（字段见上）；
2. 运行校验脚本，它会用**真实 clang-wasm** 编译题解并把每个用例跑一遍：

```bash
npm run validate:problems              # 全部阶段
node scripts/validate-problems.mjs --stage=6        # 只校验阶段六
node scripts/validate-problems.mjs --problem=s6-p4  # 只校验一道题
```

校验内容：字段完整性 → `solution_code` 能编译 → 每个 `test_cases` 输出与
`expected_output` 逐行一致 → `starter_code` 也能编译（初始代码必须能跑，只是答案不对）。

3. 在浏览器里深度验收这道题（渲染 + 提交）：

```bash
npx playwright install chromium        # 首次
npm run preview
node scripts/e2e-problem.mjs http://localhost:4173 s6-p4
```

---

## 沙箱限制（题库写作约束）

浏览器 WebAssembly 沙箱里**没有**文件系统、网络、进程与系统调用，所以：

- ✅ 只有标准输入 `cin` / 标准输出 `cout`（`printf` 也可用）
- ❌ 文件读写、网络请求、`system()`、线程
- ❌ C++ 异常（`try / catch / throw`）——编译参数里关闭了异常
- ❌ 依赖运行环境的功能（时间、随机数种子、环境变量）：题目输出必须**确定性**

---

## 功能清单

**新手指南（`/guide`）**：面向零基础的"第零课"，带右侧目录；含环境说明、题目页导览、
逐行代码讲解、运行/提交的区别、中文标点对照表、常见报错中英对照表、英文小词典。

**首页**：阶段卡片（题目数、难度标签、完成进度）、总体进度统计、搜索（标题/知识点/题号）、
按难度与完成状态筛选、继续上次练习、零基础入口。

**题目页**：左栏题目描述（Markdown + 表格 + 代码块 + 本关新知识 + 常见错误）、可折叠提示、
上一题/下一题、通过后可查看参考题解；右栏工具栏（语言、**写到哪？**、重置代码、运行、提交）、
Monaco 编辑器（clang 错误红点）、标准输入框（一键填入样例）、
输出面板（通过 / 编译错误 + 零基础自查提示 / 运行错误 / 超时 / 输出过多）、
测试用例面板（逐条状态 + 展开看输入输出对比 + 运行全部测试）。

**进度**：`localStorage` 持久化已通过 / 未通过 / 最后访问 / 每题代码草稿；
进度页支持导出 / 导入 JSON、清空进度，以及开发者模式开关（做题顺序固定为按顺序解锁，不提供关闭开关）。

**洛谷远程提交（`/luogu` + 四个靶场的题目页面板）**：桥接脚本状态检测与一键安装指引、
**免安装的「书签提交」**、vjudge 式远程账号管理（保护 / 账号 / 状态 / 更新时间 / 操作 +
`__client_id` / `_uid` 绑定表单）、浏览器会话一键绑定、绑定前真实校验 Cookie 是否有效、解绑；
题目页可记住洛谷题号、按靶场自动选语言与 O2 开关、一键提交、**实时轮询评测结果**（含编译错误原文）、
拉取该题提交记录列表、以及两种降级路径（书签提交 / 复制代码手动粘贴）。
绑定凭据只存本机，桥接脚本带 origin 白名单与 5 秒提交冷却。

**开发者模式**：一键解锁全部题目、免通过查看并填入参考题解、题目页调试面板
（编译参数 / 工具链 / 耗时 / 原始 stderr / 复制下载题目 JSON）。`?dev=1`、`Ctrl+Shift+D` 或设置页开关。

---

## 开发脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器（自带 `/toolchain` 中间件） |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run typecheck` | 仅类型检查 |
| `npm run validate:problems` | 用真实 clang-wasm 校验全部题库 |
| `npm run setup:toolchain` | 把编译器复制到 `public/toolchain`（离线部署） |
| `npm run test:e2e` | 端到端冒烟测试（需先启动 preview/dev） |
| `npm run test:problem -- <url> <id>` | 单题深度验收 |
| `npm run test:bridge` | 洛谷桥接脚本测试：一半**真的请求 luogu.com.cn**（未登录状态验证接口地址 / csrf / 错误翻译 / origin 白名单），一半用模拟已登录的响应验证提交成功路径（请求头、请求体、`rid`、冷却、记录解析） |
| `npm run test:luogu -- <url>` | 洛谷远程提交验收（注入站点上真实的桥接脚本 + 假扩展层，验证 `/luogu` 绑定页、题目页面板、书签提交、四个靶场，`-- hash` 可对线上站点跑） |
| `npm run validate:luogu` | 校验题库里的洛谷题号：逐个访问洛谷题目页，确认存在且标题能取到（**真实网络请求**，只读） |
| `node scripts/luogu-lookup.mjs <关键词>` | 查洛谷题号：列出关键词对应的候选题目（题号 / 难度 / 通过数 / 标题），题库映射时用 |
| `node scripts/luogu-lookup.mjs --check P5788 ...` | 直接核对若干题号是否存在并打印标题 |
| `node scripts/e2e-beginner.mjs <url>` | 零基础路径验收（指南 / 跳转 TODO / 中文标点提示） |
| `node scripts/e2e-devmode.mjs <url>` | 开发者模式验收（解锁 / 免通过看题解 / 快捷键 / 面板） |
| `node scripts/e2e-static.mjs <base>` | 静态部署验收（hash 路由 / 深链刷新 / base 子路径），本地与线上站点都能跑 |
| `node scripts/e2e-java.mjs <url> [hash]` | Java 靶场验收（首页 / 阶段 / 题目 / 进度 / 指南 / 闯关解锁，并真实编译运行提交一道题） |
| `node scripts/e2e-java-problem.mjs <url> <id> [hash]` | Java 单题抽查：开发者模式下「填入参考题解 → 提交」，用真实 Doppio JVM 验证某道题 |
| `npm run validate:java` | 用本机 JDK 校验 Java 题库：结构 + `javac --release 8` 编译题解与初始代码 + 逐用例运行比对（42 题 / 161 个测试点） |
| `npm run fix:java-lessons` | 修正 Java 题面模板字符串里忘记转义的反引号（写题时的一个常见坑） |

---

## 已验证结果（本机实测）

- 题库：`npm run validate:problems` → **42/42 通过**（题解编译 + 每个用例输出一致 + 初始代码可编译）
- 端到端（生产构建 + 无头 Chromium）：首页 7 阶段 42 题 → 进入题目 → 编译器就绪 0.9s →
  运行输出 `Hello, World!`（2.4s）→ 提交全部通过并弹出「恭喜通过」→ 进度写入 localStorage →
  编译错误正确展示且编辑器标红 → 刷新后进度仍在，**控制台无任何报错**
- 零基础路径验收：新手指南 10 个章节齐全、首页与顶栏入口可达、第一题出现引导卡片、
  「写到哪？」把光标定位到第 5 行 `// TODO`、故意用中文分号写错后**自动提示"检测到中文标点"**、
  改成正确代码后提交通过，全程无控制台报错
- 单题深度验收：阶段七 `s7-p6`（map 统计）19/19 项通过；阶段六 `s6-p4`（结构体排序）
  用参考题解提交，5 个用例全部通过
- 开发者模式验收：默认状态确认被锁 → `?dev=1` 一键解锁并出现 DEV 标记与调试面板 →
  免通过查看题解 → 一键填入题解提交全部通过 → `Ctrl+Shift+D` 双向切换 → `?dev=0` 关闭，
  全程无控制台报错
- 静态部署验收（GitHub Pages 线上站点 https://yhsome.github.io/OIworld/ ）：
  首屏 2.9s → 7 阶段 42 题正常渲染 → 点进题目 → 工具链从 jsDelivr 下载 45.7s 后就绪 →
  浏览器本地编译并运行成功 40.4s → 提交通过 → **刷新深链仍在题目页（hash 路由）** →
  `#/guide` 与 `?dev=1` 深链均可用，**控制台零报错、零 404 请求**
- Java 靶场验收（本地与**线上**各跑一遍，`scripts/e2e-java.mjs`）：首页 7 个阶段卡片 / 42 道题 →
  顶栏三个靶场切换按钮且 Java 高亮 → 阶段页 6 道题 → 题目页左右分栏、工具栏与测试用例齐全 →
  运行环境就绪 → 把 `// TODO` 改成输出语句 → **提交通过并弹出「恭喜通过」** →
  进度页计入 → 指南页可读 → 未通过时按顺序锁定、`?dev=1` 可直达，控制台零报错
- Java 题库：`npm run validate:java` → **42 道题 / 161 个测试点通过**
  （结构检查 + `javac --release 8` 编译题解与初始代码 + 逐用例运行比对，
  用 `--release 8` 是为了和浏览器里的 Java 8 运行时对齐，任何 Java 9+ 写法都会被拦下）
- Java 浏览器抽查（`scripts/e2e-java-problem.mjs`，真实 Doppio JVM 里逐题「填入参考题解 → 提交」）：
  **9/9 通过**，覆盖 `println` 打印小数（`32.0`）、`switch` + `char`、嵌套循环打印、`String.charAt`、
  递归（`long` 阶乘）、`printf("%.2f")`、类 + 手写冒泡排序 + `compareTo`、`HashMap` 计数 +
  `Collections.sort`、`TreeMap` 有序输出
- Java 性能实测（同一浏览器会话）：**首次编译约 2 分钟，每个测试用例约 1 分钟**，
  一道题提交（4 个用例）约 5.5 分钟——这是 Doppio JVM 跑在 JavaScript 里的固有代价。
  题库因此刻意保持轻量（循环几千次以内、输出几十行以内），UI 在等待时也会提示预计耗时
- 洛谷接口实测（`scripts/test-luogu-bridge.mjs`，**真的请求 luogu.com.cn**）：
  `POST /fe/api/problem/submit/P1001` 存在且未登录时返回
  `UserNotLoggedInException`（对照：随机路径返回 404），csrf-token 能从题目页 meta 抓到，
  带 `Origin: https://yhsome.github.io` 的预检请求返回 **403 且没有任何 `Access-Control-Allow-*` 头**
  （这就是"纯前端读不到洛谷"的硬证据）；`__client_id` / `_uid` 是
  `HttpOnly; Secure; SameSite=None`
- 洛谷桥接脚本测试：**24/24 通过**（live 10 项 + mock 14 项）。
  mock 部分验证了提交请求的地址、`X-CSRF-TOKEN`、`Referer`/`Origin`、请求体 `{lang,code,enableO2}`、
  `rid` 解析、5 秒冷却、评测记录与提交记录解析（含 `records` 为数组或 `{result:[]}` 两种形态）、
  绑定 Cookie 会作为 `Cookie` 头发出、人机验证错误被翻译成可操作提示
- 洛谷远程提交验收（`scripts/e2e-luogu.mjs`，**本地与线上各跑一遍**；注入时用的是站点上
  **真实的桥接脚本**，只把 `GM_xmlhttpRequest` 换成假扩展层，所以同时验证了真实脚本的
  csrf 抓取、URL / 请求头 / 请求体构造与消息协议）——63 项检查：
  未装脚本时的状态与安装引导 → 装桥后状态就绪/版本号/自动检测登录 →
  绑定浏览器会话与绑定粘贴的 Cookie（**绑定前会真的验证 Cookie 有效性**）→ 解绑 →
  题目页提交（请求打到 `POST https://www.luogu.com.cn/fe/api/problem/submit/P1001`、
  `lang=27`、带 `X-CSRF-TOKEN` 与 `Referer`/`Origin`、带上绑定的 `Cookie` 头）→
  轮询 3 次拿到 AC → 刷新提交记录出 3 行（AC / WA / CE）→
  **书签提交**（把地址伪装成洛谷题目页跑真实的书签脚本：确实打到了提交接口、带上页面 csrf-token、
  提交地址里的代码与语言、轮询 2 次后浮层显示 `AC R424242`；不在题目页时给出引导）→
  **C++ / Python / Java 三个靶场的题目页都有面板且默认语言正确**（C++20 / Python 3 / Java 8），
  全程零控制台报错（已排除测试为提速主动中断资源下载产生的那段噪声）
- 洛谷题号：`npm run validate:luogu` → **41/41 存在且标题核对一致**（逐题访问洛谷题目页；
  剩下 1 道是「反转链表」，洛谷确实没有对应题目，只保留关键词搜索）
- 顺带修掉一个 Pro 靶场引入的串台 bug：顶栏用 `pathname.startsWith('/pro')` 判断靶场，
  而 C++ 题目页 `/problem/s1-p1` 也以 `/pro` 开头，导致 C++ 题目页显示 Pro 的标语、
  进度与高亮。现在按路径段比较（线上已验证：C++ 题目页显示 C++ 标语与 C++ 进度）

---

## 已知限制

- 首次使用需下载约 90MB 编译器（之后走缓存）；`npm run setup:toolchain` 可改为同源加载。
- 每次编译约 2 秒（clang 实例化 + 标准库写入虚拟文件系统），这是 Wasm 运行真实编译器的固有成本。
- **Java 靶场较慢**：Doppio JVM 是一个用 JavaScript 实现的 Java 虚拟机，首次编译约 2 分钟、
  每个测试用例约 1 分钟（一道题提交约 5.5 分钟）。题库已按这个约束写得非常轻量，
  等待期间结果面板会提示预计耗时；后续若要提速，可以考虑换用仓库里已有的
  `public/java-runtime`（B-JVM + 编译成 Wasm 的 TeaVM 编译器）。
- Monaco 与 Ant Design 体积较大，生产产物首屏 JS 约 4.4MB（gzip 约 1.2MB），
  适合局域网 / 教学场景；如需更小，可只引入 `editor.api` 与 C++ 语言包。
- 编译器未启用 C++ 异常，题库与用户代码不要依赖 `try / catch`。
- **洛谷远程提交需要在下面三种方式里选一种**（浏览器同源策略与 `Cookie` 禁止请求头决定的，
  见 [docs/luogu-bridge.md](docs/luogu-bridge.md)）：装一次油猴桥接脚本、拖一个书签，
  或者手动复制代码到洛谷粘贴；洛谷的非公开接口可能变化，遇到时可用 `/luogu` 页的诊断按钮取出原始返回。
- 洛谷侧还可能触发人机验证或提交频率限制：先在洛谷手动交一次、并别拿它刷提交。
- Pro 题库里 41/42 道题标注了洛谷精确题号，只有「反转链表」因为洛谷没有对应题目而只给关键词搜索。
- 阶段一「常见错误」放在「小贴士」之前，阶段二 ~ 七放在最后，属于两批作者的排版差异，不影响阅读。
