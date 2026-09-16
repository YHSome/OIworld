# OIworld · C++ 基础语法学习靶场

一个**纯前端**的 C++ 零基础教学靶场：用户在网页里写 C++ 代码，点「运行」后由编译成
**WebAssembly 的真实 clang 编译器**在浏览器本地编译、在 WASI 沙箱里执行，实时看到输出或编译错误。

没有后端、没有容器、没有远程判题机——代码不会离开用户的浏览器。

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
├─ compiler/
│  ├─ client.ts          编译服务：调度 Worker、编排「编译一次 + 跑 N 个用例」
│  ├─ compile.worker.ts  编译器 Worker（clang + wasm-ld）
│  ├─ run.worker.ts      执行 Worker（WASI 沙箱，每用例一个）
│  ├─ toolchain.ts       工具链定位、预加载与下载进度
│  ├─ diagnostics.ts     clang 诊断解析（→ Monaco 标记）
│  ├─ judge.ts           输出比对（忽略行尾空格与末尾空行）
│  └─ protocol.ts        Worker 消息协议
├─ data/
│  ├─ index.ts           题目加载、搜索筛选、解锁规则、统计
│  └─ problems/stage-1..7.json   题库（阶段一 ~ 阶段七）
├─ store/useProgressStore.ts     进度 + 代码草稿 + 开发者模式（localStorage）
├─ pages/                首页 / 阶段页 / 题目页 / 进度页
├─ components/           编辑器、输出面板、测试用例面板、Markdown 等
├─ hooks/useCompiler.ts  编译器状态的 React 绑定
└─ editor/monaco.ts      Monaco 本地化配置（Worker 由 Vite 打包）

scripts/
├─ node-toolchain.mjs    在 Node 里跑同一套 clang-wasm 流程（校验题库用）
├─ validate-problems.mjs 题库校验：题解必须能编译并在每个用例上输出正确
├─ copy-toolchain.mjs    离线工具链安装（setup:toolchain）
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
| `node scripts/e2e-beginner.mjs <url>` | 零基础路径验收（指南 / 跳转 TODO / 中文标点提示） |
| `node scripts/e2e-devmode.mjs <url>` | 开发者模式验收（解锁 / 免通过看题解 / 快捷键 / 面板） |
| `node scripts/e2e-static.mjs <base>` | 静态部署验收（hash 路由 / 深链刷新 / base 子路径），本地与线上站点都能跑 |

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

---

## 已知限制

- 首次使用需下载约 90MB 编译器（之后走缓存）；`npm run setup:toolchain` 可改为同源加载。
- 每次编译约 2 秒（clang 实例化 + 标准库写入虚拟文件系统），这是 Wasm 运行真实编译器的固有成本。
- Monaco 与 Ant Design 体积较大，生产产物首屏 JS 约 4.4MB（gzip 约 1.2MB），
  适合局域网 / 教学场景；如需更小，可只引入 `editor.api` 与 C++ 语言包。
- 编译器未启用 C++ 异常，题库与用户代码不要依赖 `try / catch`。
- 阶段一「常见错误」放在「小贴士」之前，阶段二 ~ 七放在最后，属于两批作者的排版差异，不影响阅读。
