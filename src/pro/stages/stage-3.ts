/**
 * 阶段三 · 树与堆（6 道题）
 *
 * 树是第一个"非线性"结构：链表的每个节点只连一个后继，树的一个节点可以连多个孩子。
 * 这一阶段从"树怎么存进数组"开始（不涉及 new 和指针），依次解决
 * 遍历、递归统计、二叉搜索树、小根堆、合并果子（哈夫曼）、并查集 6 个问题。
 */

import type { StageData } from '../../types/problem';
import { cppMain, mistakesTable, pointsTable, proLesson } from '../lesson.ts';

export const STAGE_3: StageData = {
  stage: 3,
  title: '阶段三 · 树与堆',
  subtitle: '二叉树、堆与并查集',
  summary:
    '树是最常用的**非线性**结构。这一阶段先解决一个很实际的问题：**树到底怎么存？**\n\n' +
    '- **完全二叉树**：直接用一个数组，节点 `i` 的左孩子是 `2i`、右孩子是 `2i + 1`——不用指针、不用 `new`，' +
    '"孩子存不存在"只是一个下标判断。堆就是靠这套下标工作的。\n' +
    '- **普通二叉树**：用 `left[i]` / `right[i]` 显式记孩子编号（0 表示没有孩子），一样是数组，一样好调错。\n' +
    '- **并查集**：一棵只关心"父亲是谁"的树，配上路径压缩和按秩合并，单次操作近似 $O(1)$。\n\n' +
    '这一阶段的 6 道题是：二叉树遍历 → 深度与叶子数 → 二叉搜索树 → 小根堆 → 合并果子（哈夫曼）→ 并查集。' +
    '每道题都会给出完整的输入输出框架，你只需要把"结构"和"递归/循环"补上。',
  problems: [
    proLesson({
      id: 'p3-1',
      title: '二叉树的三种遍历',
      difficulty: '简单',
      knowledge: '二叉树遍历',
      story:
        '树是第一个"非线性"结构：链表的每个节点只连一个后继，树的一个节点可以连好几个孩子。\n\n' +
        '树长什么样、怎么系统地"走一遍"所有节点，是后面平衡树、线段树、树形 DP 等一切树形结构的基础。\n\n' +
        '好消息是：**完全二叉树根本不需要指针**，一个一维数组就够了——节点 `i` 的左孩子是 `2i`、右孩子是 `2i + 1`。',
      task:
        '给定一棵有 `n` 个节点的完全二叉树（按层序给出每个节点的值），输出它的**前序**、**中序**、**后序**遍历序列，每种一行。',
      lesson: `**第一步：把树"装进"数组。**

完全二叉树可以直接用一维数组存，下标从 1 开始：

\`\`\`cpp
int a[1005];   // a[i] 是节点 i 的值
int n;         // 节点总数，节点编号是 1 .. n
\`\`\`

- 节点 \`i\` 的**左孩子**是 \`2 * i\`，**右孩子**是 \`2 * i + 1\`，**父亲**是 \`i / 2\`（整除）。
- 只要 \`i > n\`，说明这个位置**没有节点**。

本阶段所有树形结构都走这条路：**用数组下标代替指针**。原因很直接——不用 \`new\`、不用管内存释放、越界错误一眼能看出来，调试时还可以把整个数组打印出来对照。

比如 \`n = 6\`、值为 \`1 2 3 4 5 6\` 的树长这样（括号里是数组下标）：

\`\`\`
        1(1)
       /    \\
    2(2)    3(3)
   /    \\   /
 4(4) 5(5) 6(6)
\`\`\`

${pointsTable([
  ['数组存树', '左孩子 `2i`、右孩子 `2i + 1`、父亲 `i / 2`（小根堆用的也是同一套下标）'],
  ['判断孩子是否存在', '看下标是否 `<= n`，不需要额外的空节点标记'],
  ['为什么不用指针', '`new` 与指针要自己管内存、出错难查；数组写法能用 `u > n` 一次判完，还能直接打印数组调试'],
  ['三种遍历的差别', '前序：自己 → 左 → 右；中序：左 → 自己 → 右；后序：左 → 右 → 自己'],
  ['递归深度', '等于树高。完全二叉树高度约 $\\log_2 n + 1$，`n = 100` 时也只有 7 层'],
])}

**第二步：设计递归。**

三种遍历的代码几乎一样，只差"什么时候输出自己"：

\`\`\`cpp
void preorder(int u) {          // 前序：自己 → 左 → 右
    if (u > n) return;          // ① 终止条件：这个位置没有节点
    cout << a[u] << " ";        // ② 访问自己
    preorder(2 * u);            // ③ 递归左子树
    preorder(2 * u + 1);        // ④ 递归右子树
}

void inorder(int u) {           // 中序：左 → 自己 → 右
    if (u > n) return;
    inorder(2 * u);
    cout << a[u] << " ";
    inorder(2 * u + 1);
}

void postorder(int u) {         // 后序：左 → 右 → 自己
    if (u > n) return;
    postorder(2 * u);
    postorder(2 * u + 1);
    cout << a[u] << " ";
}
\`\`\`

写递归只需要回答两个问题：

1. **什么时候停下来？** 这里是 \`u > n\`（这个位置没有节点）。
2. **怎么把问题变小？** \`preorder(u)\` 只要向 \`preorder(2 * u)\` 和 \`preorder(2 * u + 1)\` 要"整棵左子树的结果"和"整棵右子树的结果"，拼起来就行。

写的时候**先相信**子树递归会正确完成它自己的工作，不要试图在脑子里展开全部递归。

**复杂度**：每个节点恰好被访问一次，三种遍历都是 $O(n)$ 时间；递归栈深度等于树高，完全二叉树的高度是 $\\log_2 n + 1$，所以额外空间是 $O(\\log n)$。`,
      inputFormat:
        '第一行一个整数 `n`（`1 <= n <= 100`），表示节点个数。\n\n' +
        '第二行 `n` 个整数 `a[1..n]`（`-1000 <= a[i] <= 1000`），按**层序**（从上到下、从左到右）给出每个节点的值。\n\n' +
        '节点 `i` 的左孩子是 `2i`、右孩子是 `2i + 1`，只有下标不超过 `n` 的孩子才存在。',
      outputFormat:
        '输出三行，每行 `n` 个整数，相邻两个数之间用一个空格分隔：\n\n' +
        '1. 第一行：前序遍历；\n2. 第二行：中序遍历；\n3. 第三行：后序遍历。',
      sample:
        '### 样例\n\n**输入**\n\n```\n6\n1 2 3 4 5 6\n```\n\n**输出**\n\n```\n1 2 4 5 3 6\n4 2 5 1 6 3\n4 5 2 6 3 1\n```\n\n' +
        '这棵树（括号里是下标）：\n\n```\n        1(1)\n       /    \\\n    2(2)    3(3)\n   /    \\   /\n 4(4) 5(5) 6(6)\n```\n\n' +
        '- **前序**：先访问根 1，再整棵左子树（2、4、5），最后右子树（3、6）\n' +
        '- **中序**：左子树中序（4、2、5）→ 根 1 → 右子树中序（6、3）\n' +
        '- **后序**：左子树后序（4、5、2）→ 右子树后序（6、3）→ 根 1',
      mistakes: mistakesTable([
        ['递归没有终止条件（或写成 `u >= n`）', '会一直往 `2u` 递归下去，访问到数组外面的位置', '三个函数的第一行都写 `if (u > n) return;`'],
        ['把左孩子写成 `2 * u + 1`、右孩子写成 `2 * u`', '整棵树左右颠倒，三种遍历全错', '左 `2 * u`、右 `2 * u + 1`'],
        ['数组下标从 0 开始存', '`2i` / `2i + 1` 的父子关系全部错位', '本节约定下标从 1 开始，`a[0]` 空着不用'],
        ['中序写成"自己 → 左 → 右"', '中序序列不再有序（对二叉搜索树来说这一点尤其致命）', '中序必须先左子树、再自己、再右子树'],
        ['输出时空格没控制好（行末多空格、或数字挤在一起）', '答案看着像对的，比对时却不通过', '用一个 `first` 标记：不是第一个数才先输出空格'],
      ]),
      tips:
        '- 先别写代码，拿样例那棵树在纸上写出三种序列，再对照程序输出，能很快发现"访问顺序放错位置"这类问题。\n' +
        '- 三种遍历的框架完全一样，只有输出 `a[u]` 那一行的位置不同——写代码时把三个函数并排放着对照。\n' +
        '- 洛谷同类型题目：二叉树的遍历（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];
    // TODO: 让 first = true，依次做前序、中序、后序遍历，每做完一种就换行
`,
        {
          globals: `int a[1005];   // a[i] 是节点 i 的值，下标从 1 开始
int n;          // 节点个数
bool first;     // 控制空格：第一个数前面不输出空格

// TODO: 在这里写 put / preorder / inorder / postorder 四个函数
// 1) put(x) 负责输出一个值：不是第一个数就先输出一个空格
// 2) 三个遍历都以 u 为根，u > n 时直接 return`,
        },
      ),
      solution: cppMain(
        `    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];
    first = true;
    preorder(1);
    cout << endl;
    first = true;
    inorder(1);
    cout << endl;
    first = true;
    postorder(1);
    cout << endl;
`,
        {
          globals: `int a[1005];   // a[i] 是节点 i 的值，下标从 1 开始
int n;          // 节点个数
bool first;     // 控制空格：第一个数前面不输出空格

void put(int value) {
    if (!first) cout << " ";
    cout << value;
    first = false;
}

void preorder(int u) {          // 前序：自己 → 左 → 右
    if (u > n) return;
    put(a[u]);
    preorder(2 * u);
    preorder(2 * u + 1);
}

void inorder(int u) {           // 中序：左 → 自己 → 右
    if (u > n) return;
    inorder(2 * u);
    put(a[u]);
    inorder(2 * u + 1);
}

void postorder(int u) {         // 后序：左 → 右 → 自己
    if (u > n) return;
    postorder(2 * u);
    postorder(2 * u + 1);
    put(a[u]);
}
`,
        },
      ),
      tests: [
        { input: '6\n1 2 3 4 5 6\n', expected: '1 2 4 5 3 6\n4 2 5 1 6 3\n4 5 2 6 3 1\n' },
        { input: '1\n42\n', expected: '42\n42\n42\n' },
        { input: '7\n5 3 8 1 4 7 9\n', expected: '5 3 1 4 8 7 9\n1 3 4 5 7 8 9\n1 4 3 7 9 8 5\n' },
        { input: '2\n7 7\n', expected: '7 7\n7 7\n7 7\n' },
        { input: '5\n10 20 30 40 50\n', expected: '10 20 40 50 30\n40 20 50 10 30\n40 50 20 30 10\n' },
      ],
      hints: [
        '先用一个数组把节点 1..n 的值存下来：`a[i]`、左孩子 `2 * i`、右孩子 `2 * i + 1`。',
        '三个函数结构完全一样，`if (u > n) return;` 这一句必须写在最前面。',
        '输出空格的小技巧：用一个全局 `bool first`，输出前判断"不是第一个数才打空格"。',
      ],
      luoguKeyword: '二叉树遍历',
      luoguCode: 'B3642',
    }),

    proLesson({
      id: 'p3-2',
      title: '二叉树的深度与叶子数',
      difficulty: '简单',
      knowledge: '递归统计',
      story:
        '树的很多信息都能"自底向上"算出来：想知道整棵树有多深，就先知道左子树、右子树有多深，取较大的那个再加 1。\n\n' +
        '这个套路叫**树形 DP**（把子树当作子问题求解），是后面所有树上算法（求直径、求重心、树形背包）的起点。\n\n' +
        '本题的树不一定是完全二叉树，所以要用 `left[i]` / `right[i]` 显式记录每个节点的孩子。',
      task:
        '给定一棵 `n` 个节点的二叉树（节点 `1` 是根，每个节点给出左右孩子的编号，`0` 表示没有孩子），输出这棵树的**深度**与**叶子数**。',
      lesson: `**怎么存一棵"不完整"的二叉树？**

上一题靠 \`2i\` / \`2i + 1\` 的隐含关系省掉了指针，本题的树可能缺左孩子、也可能只有一条链，所以要把孩子编号显式写出来：

\`\`\`cpp
int lc[1005], rc[1005];   // lc[u] / rc[u]：u 的左/右孩子编号，0 表示没有孩子
\`\`\`

节点编号是 \`1 .. n\`，\`1\` 号是根。这种"数组 + 孩子编号"的存法和指针写法功能一样，但不需要 \`new\`，每个节点的孩子就是一个整数，调试时可以直接把 \`lc\`、\`rc\` 打印出来看结构。

**递归统计的两个函数**

\`\`\`cpp
int depth(int u) {                  // 以 u 为根的子树深度
    if (u == 0) return 0;           // 空树深度是 0（关键：这样单节点树自然得到 1）
    int a = depth(lc[u]);           // 先问左子树有多深
    int b = depth(rc[u]);           // 再问右子树有多深
    return (a > b ? a : b) + 1;     // 取较深的那棵，再加上自己这一层
}

int leaves(int u) {                 // 以 u 为根的子树里有几片叶子
    if (u == 0) return 0;           // 空树没有叶子
    if (lc[u] == 0 && rc[u] == 0) return 1;   // 自己没孩子 → 自己就是一片叶子
    return leaves(lc[u]) + leaves(rc[u]);     // 否则答案是左右子树叶子数之和
}
\`\`\`

**两个设计要点**

1. **用 \`u == 0\` 当终止条件**，而不是去判断"孩子是不是叶子"。这样"空树"这个边界情况被统一处理掉了：单节点树得到 \`depth = 0 + 1 = 1\`、\`leaves = 1\`，不需要额外特判。
2. **叶子的定义是"没有孩子的节点"**。所以只有一个节点的树，那个根**也算一片叶子**（它的左孩子和右孩子都是 0）。

${pointsTable([
  ['树形 DP 的思想', '先递归求出左右子树的答案，再用它们拼出自己的答案——"自底向上"'],
  ['终止条件', '`u == 0` 表示空树，直接返回 0，不用每次判断孩子是否存在'],
  ['深度公式', '`depth(u) = max(depth(lc), depth(rc)) + 1`，自己那一层要算上'],
  ['叶子公式', '两个孩子都没有 → 1；否则是左右子树叶子数之和'],
  ['数组放哪里', '数组开在 `main` 外面（全局），递归函数里就能直接引用，不必当参数传来传去'],
  ['复杂度', '每个节点只被访问一次，$O(n)$ 时间；递归栈深度等于树高，链状树最坏是 $O(n)$ 空间'],
])}

**边界情况**：链状树（每个节点只有一个孩子）深度最大，等于 \`n\`；叶子只有最底下的那一个节点。当 \`n = 1000\` 时递归深度达到 1000，在本题范围内没问题，但数据更大时就要把递归改成显式栈（迭代）了。`,
      inputFormat:
        '第一行一个整数 `n`（`1 <= n <= 1000`），表示节点个数。\n\n' +
        '接下来 `n` 行，第 `i` 行两个整数 `l` 和 `r`（`0 <= l, r <= n`），表示节点 `i` 的左孩子与右孩子编号，`0` 表示没有孩子。\n\n' +
        '保证这是一棵合法的二叉树：节点 `1` 是根，所有节点都能从根走到，且不会出现环或重复引用同一个节点。',
      outputFormat: '输出一行两个整数，用空格分隔：第一个是树的深度，第二个是叶子数。',
      sample:
        '### 样例\n\n**输入**\n\n```\n7\n2 3\n4 5\n6 7\n0 0\n0 0\n0 0\n0 0\n```\n\n**输出**\n\n```\n3 4\n```\n\n' +
        '这棵树是满二叉树：根 1 的两个孩子是 2、3；2 的孩子是 4、5；3 的孩子是 6、7。\n\n' +
        '- 深度：从根到最远的叶子要经过 1 → 2 → 4，共 3 层\n' +
        '- 叶子：4、5、6、7 都没有孩子，共 4 片叶子（2、3 有孩子，不算叶子）',
      mistakes: mistakesTable([
        ['把"只有一个孩子的节点"也算成叶子', '叶子数偏大（例如链状树会输出 n 而不是 1）', '严格按定义：`lc[u] == 0 && rc[u] == 0` 才是叶子'],
        ['没处理单节点树', '根没有孩子时叶子数输出 0（正确是 1）', '先判 `u == 0` 返回 0，再判"自己没有孩子"返回 1'],
        ['深度公式忘了 `+ 1`', '整棵树的深度少 1（单节点树会输出 0）', '写成 `max(左, 右) + 1`'],
        ['把 `lc`、`rc` 定义成 `main` 里的局部数组', '递归函数访问不到，编译直接报错', '数组开在全局，或者当参数传进函数'],
        ['读入时把左右孩子读反了', '树的结构整体镜像，深度不变但叶子判断可能出错', '按题面顺序读：先左孩子 `l`、再右孩子 `r`'],
      ]),
      tips:
        '- 建议先把样例的树在纸上画出来，再对照 `lc` / `rc` 数组确认自己看懂了输入。\n' +
        '- 两个函数可以分别写、分别测试：先只输出深度，确认无误再加上叶子数。\n' +
        '- 洛谷同类型题目：二叉树的深度（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> lc[i] >> rc[i];
    // TODO: 调用 depth(1) 与 leaves(1)，用空格分隔输出这两个数
`,
        {
          globals: `int lc[1005], rc[1005];   // 左/右孩子编号，0 表示没有孩子

// TODO: 在这里写 depth(u) 与 leaves(u) 两个递归函数
// 提示：u == 0 表示空树，直接返回 0`,
        },
      ),
      solution: cppMain(
        `    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> lc[i] >> rc[i];
    cout << depth(1) << " " << leaves(1) << endl;
`,
        {
          globals: `int lc[1005], rc[1005];   // 左/右孩子编号，0 表示没有孩子

int depth(int u) {                  // 以 u 为根的子树深度
    if (u == 0) return 0;           // 空树深度为 0
    int a = depth(lc[u]);
    int b = depth(rc[u]);
    return (a > b ? a : b) + 1;     // 较深的子树再加上自己这一层
}

int leaves(int u) {                 // 以 u 为根的子树中的叶子数
    if (u == 0) return 0;           // 空树没有叶子
    if (lc[u] == 0 && rc[u] == 0) return 1;   // 自己没孩子 → 自己是一片叶子
    return leaves(lc[u]) + leaves(rc[u]);
}
`,
        },
      ),
      tests: [
        { input: '7\n2 3\n4 5\n6 7\n0 0\n0 0\n0 0\n0 0\n', expected: '3 4\n' },
        { input: '1\n0 0\n', expected: '1 1\n' },
        { input: '4\n2 0\n3 0\n4 0\n0 0\n', expected: '4 1\n' },
        { input: '6\n2 3\n4 5\n6 0\n0 0\n0 0\n0 0\n', expected: '3 3\n' },
        { input: '2\n2 0\n0 0\n', expected: '2 1\n' },
      ],
      hints: [
        '`depth(u)`：空节点返回 0，否则返回 `max(depth(左), depth(右)) + 1`。',
        '`leaves(u)`：空节点返回 0；自己没有孩子返回 1；否则返回左右子树叶子数之和。',
        '别忘了单个节点（只有根）的情况：深度 1、叶子数 1。',
      ],
      luoguKeyword: '二叉树的深度',
      luoguCode: 'P4913',
    }),

    proLesson({
      id: 'p3-3',
      title: '二叉搜索树',
      difficulty: '中等',
      knowledge: '二叉搜索树',
      story:
        '如果要在一堆数里反复查找，最直接的办法是排好序后二分——但数据是**边插入边查询**的，排序就不好使了。\n\n' +
        '二叉搜索树（BST）把"二分"这件事搬到了树上：**左子树的所有值都比根小，右子树的所有值都比根大**。' +
        '于是从根往下比较，每次都能丢掉一半的方向。',
      task:
        '维护一棵初始为空的二叉搜索树，按顺序执行 `q` 条操作：\n\n' +
        '- `insert x`：插入数值 `x`（已经存在过就不重复插入）；\n' +
        '- `query x`：查询 `x` 是否存在。\n\n' +
        '对每条 `query` 操作输出 `YES` 或 `NO`。',
      lesson: `**用数组模拟一棵 BST**

和上一题一样，不需要指针，只要三个数组加两个计数器：

\`\`\`cpp
int val[1005];              // 每个节点的值
int lc[1005], rc[1005];     // 左、右孩子编号
int cnt = 0;                // 已经用掉几个节点（新节点编号是 ++cnt）
int root = 0;               // 根节点编号；0 表示空树
\`\`\`

**插入：从根往下走，走到空位置就造一个新节点**

\`\`\`cpp
int u = root;
while (true) {
    if (x == val[u]) break;                 // 已经存在，不重复插入
    if (x < val[u]) {                       // 比当前节点小 → 往左走
        if (lc[u] == 0) {                   // 左边空着，就在这儿建新节点
            lc[u] = ++cnt;
            val[cnt] = x;
            break;
        }
        u = lc[u];                          // 否则继续往左
    } else {                                // 比当前节点大 → 往右走
        if (rc[u] == 0) {
            rc[u] = ++cnt;
            val[cnt] = x;
            break;
        }
        u = rc[u];
    }
}
\`\`\`

**查找：走同一条路，走空了就是没找到**

\`\`\`cpp
int u = root;
bool found = false;
while (u != 0) {
    if (x == val[u]) { found = true; break; }
    u = (x < val[u]) ? lc[u] : rc[u];       // 小往左、大往右
}
\`\`\`

**为什么插入和查找走同一条路径？** 因为 BST 的不变式（左小右大）在每次插入后都被保持住了，所以"某个值该待的位置"是唯一的——这正好像二分查找：每次比较之后，答案只可能在左半边或右半边。

${pointsTable([
  ['BST 的定义', '对任意节点，左子树所有值 < 它的值 < 右子树所有值（本题按严格小于/大于处理）'],
  ['节点是否存在', '只看编号是不是 0；`root == 0` 就是空树'],
  ['空树特判', '插入时如果 `root == 0`，直接 `root = ++cnt; val[root] = x;`'],
  ['重复值', '题目要求"已经存在的不重复插入"，比较到相等就结束'],
  ['查找的终止条件', '`u == 0` 说明走到了空位置，值不存在'],
  ['复杂度', '单次操作是 $O(h)$，$h$ 是树高。树比较平衡时是 $O(\\log n)$；最坏情况见下'],
])}

**关于"最坏情况"**：BST 的效率完全取决于树高。插入顺序不巧（例如本来就是有序的）时它会退化成一条链，单次操作变成 $O(n)$，\`q\` 次操作就是 $O(q \\cdot n)$。本题 \`q <= 1000\`，退化也能过；要真正保证 $O(\\log n)$ 就得用**平衡树**（AVL、红黑树、Treap）——那是更后面的内容。

本题总复杂度：$O(q \\cdot h)$，最坏 $O(q \\cdot n)$ 时间；空间 $O(n)$。`,
      inputFormat:
        '第一行一个整数 `q`（`1 <= q <= 1000`），表示操作条数。\n\n' +
        '接下来 `q` 行，每行形如 `insert x` 或 `query x`，其中 `-10^9 <= x <= 10^9`。\n\n' +
        '初始时树是空的；如果第一条操作就是 `query`，输出 `NO`。',
      outputFormat: '对每条 `query` 操作输出一行：`YES` 表示树中存在该值，`NO` 表示不存在（全大写）。`insert` 不输出。',
      mistakes: mistakesTable([
        ['插入时比较方向接反（比当前节点小却往右走）', '树不再是 BST，查找结果时对时错', '`x < val[u]` 往左、`x > val[u]` 往右，接孩子时写 `lc[u] = ++cnt`'],
        ['空树时直接访问 `val[root]`', '读到 `val[0]`，那里的值是未初始化的，结果不可预期', '插入前先判断 `root == 0`，直接建根节点'],
        ['新节点挂到错误的位置（例如挂到当前节点自己身上）', '形成自环或覆盖已有孩子，树结构被破坏', '只在 `lc[u] == 0` / `rc[u] == 0` 时才新建并挂上去'],
        ['重复值也新建节点', '同一棵树里出现两个相同的值，白白浪费节点', '比较到相等就 `break`，不再插入'],
        ['查找循环写成 `while (val[u] != x)`', '找不到时会走到 `u == 0` 还继续访问 `val[0]`', '循环条件写 `while (u != 0)`，在循环体里比较值'],
      ]),
      tips:
        '- 调试技巧：插入完成后把 `val`、`lc`、`rc` 三个数组打印出来，就能看清树长什么样。\n' +
        '- 建议先只写 `insert` 并测试（例如按 5、3、8 的顺序插入），确认结构对了再写 `query`。\n' +
        '- 想验证 BST 性质：**中序遍历一棵正确的 BST，得到的一定是递增序列**。\n' +
        '- 洛谷同类型题目：二叉搜索树（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string op;
        int x;
        cin >> op >> x;
        if (op == "insert") {
            // TODO: 空树时 root = ++cnt；否则从 root 往下比较，
            //       比 val[u] 小往左走、大往右走，遇到相等就结束，
            //       走到空孩子就用 ++cnt 新建节点挂上去
        } else {
            // TODO: 从 root 往下比较，找到输出 YES；走到 0 还没找到输出 NO
        }
    }
`,
        {
          includes: '#include <iostream>\n#include <string>\nusing namespace std;',
          globals: `int val[1005];              // 每个节点的值
int lc[1005], rc[1005];     // 左、右孩子编号，0 表示没有
int cnt = 0;                // 已用节点数：新节点编号是 ++cnt
int root = 0;               // 根节点编号，0 表示空树`,
        },
      ),
      solution: cppMain(
        `    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string op;
        int x;
        cin >> op >> x;
        if (op == "insert") {
            if (root == 0) {                // 空树：第一个节点就是根
                root = ++cnt;
                val[root] = x;
                continue;
            }
            int u = root;
            while (true) {
                if (x == val[u]) break;     // 已经存在，不重复插入
                if (x < val[u]) {
                    if (lc[u] == 0) {
                        lc[u] = ++cnt;
                        val[cnt] = x;
                        break;
                    }
                    u = lc[u];
                } else {
                    if (rc[u] == 0) {
                        rc[u] = ++cnt;
                        val[cnt] = x;
                        break;
                    }
                    u = rc[u];
                }
            }
        } else {
            int u = root;
            bool found = false;
            while (u != 0) {                // 走到 0 说明没有这个值
                if (x == val[u]) {
                    found = true;
                    break;
                }
                u = (x < val[u]) ? lc[u] : rc[u];
            }
            cout << (found ? "YES" : "NO") << endl;
        }
    }
`,
        {
          includes: '#include <iostream>\n#include <string>\nusing namespace std;',
          globals: `int val[1005];              // 每个节点的值
int lc[1005], rc[1005];     // 左、右孩子编号，0 表示没有
int cnt = 0;                // 已用节点数：新节点编号是 ++cnt
int root = 0;               // 根节点编号，0 表示空树`,
        },
      ),
      tests: [
        {
          input: '7\ninsert 5\ninsert 3\ninsert 8\nquery 3\nquery 7\ninsert 7\nquery 7\n',
          expected: 'YES\nNO\nYES\n',
        },
        { input: '3\ninsert 10\nquery 10\nquery 5\n', expected: 'YES\nNO\n' },
        { input: '6\ninsert 4\ninsert 4\ninsert 4\nquery 4\nquery 5\nquery 4\n', expected: 'YES\nNO\nYES\n' },
        { input: '6\ninsert 1\ninsert 2\ninsert 3\nquery 1\nquery 3\nquery 4\n', expected: 'YES\nYES\nNO\n' },
        {
          input:
            '7\ninsert -5\ninsert 0\ninsert 1000000000\n' +
            'query -5\nquery 0\nquery 1000000000\nquery -1000000000\n',
          expected: 'YES\nYES\nYES\nNO\n',
        },
      ],
      hints: [
        '插入就是"找位置"：从根开始，比当前节点小往左、大往右，撞到空孩子就在那里建新节点。',
        '空树要特判：`root == 0` 时做 `root = ++cnt; val[root] = x;` 就完事了。',
        '查找和插入走同一条路径，区别是查找走到 0 就输出 NO。',
        '重复值直接跳过，不要再建节点——否则树里会有两个相同的值。',
      ],
      luoguKeyword: '二叉搜索树',
      luoguCode: 'P5076',
    }),

    proLesson({
      id: 'p3-4',
      title: '小根堆的操作',
      difficulty: '中等',
      knowledge: '堆的实现',
      story:
        '很多时候我们并不需要"全部有序"，只需要**随时能拿到最小值**：任务调度取最早截止的、模拟里取最便宜的那条路、哈夫曼编码里合并最小的两堆……\n\n' +
        '**堆**（这里指二叉堆）就是干这个的：用一棵完全二叉树，保证"每个节点都不大于它的孩子"，于是根就是最小值。' +
        '它用数组实现，插入和删除最小值的代价都只有 $O(\\log n)$。',
      task:
        '维护一个初始为空的小根堆，按顺序执行 `m` 条操作，对 `pop` / `top` / `size` 输出结果：\n\n' +
        '- `push x`：把 `x` 插入堆\n- `pop`：删除并输出最小值（堆空输出 `-1`）\n' +
        '- `top`：输出最小值，不删除（堆空输出 `-1`）\n- `size`：输出堆里元素个数',
      lesson: `**堆的形状：完全二叉树 + 数组下标**

堆永远是一棵**完全二叉树**（除最后一层外都填满，最后一层从左往右填），所以可以直接用数组存：

\`\`\`cpp
int h[1005];   // 堆里的数据，下标 1 .. sz
int sz = 0;    // 元素个数
\`\`\`

- 节点 \`i\` 的**父亲**是 \`i / 2\`，**左孩子**是 \`2 * i\`，**右孩子**是 \`2 * i + 1\`。
- **下标从 1 开始**：这样 \`i / 2\` 才有意义（\`1 / 2 == 0\`，而 0 不是任何节点，正好当循环的终止条件）。

**小根堆的性质**：对每个节点 \`i\`，都有 \`h[i] <= h[2i]\` 且 \`h[i] <= h[2i+1]\`（孩子存在时）。注意它**不要求**左右孩子之间有序，所以堆不等于排序结果，它只保证"根最小"。

**插入：先放到末尾，再"上浮"**

\`\`\`cpp
h[++sz] = x;                     // 先放到最后一个位置（这样仍然是一棵完全二叉树）
int i = sz;
while (i > 1 && h[i] < h[i / 2]) {      // 比父亲小就往上换
    swap(h[i], h[i / 2]);
    i = i / 2;                          // 换了位置，继续和自己的新父亲比
}
\`\`\`

**删除最小值：把末尾元素搬到根上，再"下沉"**

\`\`\`cpp
int i = 1;
h[1] = h[sz];                    // 把最后一个元素搬到根，堆仍然"完全"
sz--;
while (true) {
    int best = i;                                   // best 指向 i、左孩子、右孩子中最小的
    if (2 * i <= sz && h[2 * i] < h[best]) best = 2 * i;
    if (2 * i + 1 <= sz && h[2 * i + 1] < h[best]) best = 2 * i + 1;
    if (best == i) break;                           // 自己已经不比孩子大，停下来
    swap(h[i], h[best]);
    i = best;                                       // 换下去之后继续下沉
}
\`\`\`

**上浮和下沉的方向别搞混**：

- **上浮**用在插入：新元素在**底部**，它只可能比祖先小，所以要**往上**走。
- **下沉**用在删除：末位元素被搬到**根部**，它只可能比后代大，所以要**往下**走。

${pointsTable([
  ['下标从 1 开始', '父亲 `i / 2`、左孩子 `2i`、右孩子 `2i + 1`；`i = 1` 是根，没有父亲'],
  ['插入流程', '`h[++sz] = x` → 反复和父亲比较并交换（上浮），交换后要 `i = i / 2` 继续走'],
  ['删除流程', '记下 `h[1]` → `h[1] = h[sz]` → `sz--` → 反复和"较小的孩子"比较并交换（下沉）'],
  ['下沉时先选孩子', '要在两个孩子里挑**较小**的那个来比较，否则换上去的节点可能仍比另一个孩子大'],
  ['越界检查', '访问 `h[2i]` / `h[2i+1]` 之前必须先判断下标是否 `<= sz`'],
  ['复杂度', '`push` / `pop` 都是 $O(\\log n)$（最多走树高这么多次），`top` 是 $O(1)$，空间 $O(n)$'],
])}

**为什么不用"每次排序后取最小"？** 因为数据是不断插入的，反复排序每次都要 $O(n \\log n)$，而堆每次操作只要 $O(\\log n)$——"只维护最值、不维护全序"正是堆的价值所在。C++ 标准库里的 \`priority_queue\` 就是堆，下一题就会用到它。`,
      inputFormat:
        '第一行一个整数 `m`（`1 <= m <= 1000`），表示操作条数。\n\n' +
        '接下来 `m` 行，每行一条操作：`push x`（`-1000 <= x <= 1000`）、`pop`、`top` 或 `size`。',
      outputFormat:
        '对每条 `pop` / `top` / `size` 输出一行整数：`pop` 输出被删除的最小值，`top` 输出当前最小值，' +
        '`size` 输出元素个数；堆为空时 `pop` 与 `top` 都输出 `-1`。`push` 不输出。',
      mistakes: mistakesTable([
        ['插入后只交换一次就停', '堆性质被破坏，之后 `top` 可能不是真正的最小值', '用 `while` 循环，交换后 `i = i / 2` 继续往上比'],
        ['下沉时只比较左孩子', '右孩子可能更小，换上去的节点仍然比它大', '先在两个孩子里选出较小的 `best`，再和 `h[i]` 比'],
        ['下标从 0 开始存', '`i / 2` 与 `2i` 的父子关系全部错位，根也不是 `h[1]`', '本节约定下标从 1 开始，`h[0]` 空着不用'],
        ['`2 * i` 越界了还去访问', '读到数组外面的位置，结果随机甚至崩溃', '访问孩子前先判断 `2 * i <= sz` 与 `2 * i + 1 <= sz`'],
        ['`pop` 时先 `sz--` 再搬元素，或者对空堆不做特判', '末尾元素被覆盖导致数据丢失；空堆时还会去读 `h[1]`，输出错误', '先判 `sz == 0`，再 `h[1] = h[sz]`，最后 `sz--`'],
      ]),
      tips:
        '- 建议写一个 `void dump()` 把 `h[1..sz]` 打印出来，每次操作后调用一次，能直观看到上浮/下沉的过程。\n' +
        '- 判断堆是否正确：对每个 `i` 检查 `h[i] <= h[2i]` 和 `h[i] <= h[2i+1]`（孩子存在时）。\n' +
        '- 洛谷同类型题目：堆（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int m;
    cin >> m;
    for (int i = 0; i < m; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            // TODO: 放到 h[++sz]，然后不断与父亲 h[i / 2] 比较并交换（上浮）
        } else if (op == "pop") {
            // TODO: 空堆输出 -1；否则输出 h[1]，把 h[sz] 搬到根上、sz--，再不断下沉
        } else if (op == "top") {
            // TODO: 空堆输出 -1，否则输出 h[1]
        } else {
            // TODO: 输出 sz
        }
    }
`,
        {
          includes: '#include <iostream>\n#include <string>\nusing namespace std;',
          globals: `int h[1005];   // 小根堆，下标 1 .. sz
int sz = 0;    // 堆中元素个数`,
        },
      ),
      solution: cppMain(
        `    int m;
    cin >> m;
    for (int i = 0; i < m; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            h[++sz] = x;                            // 先放到末尾
            int i2 = sz;
            while (i2 > 1 && h[i2] < h[i2 / 2]) {   // 上浮：比父亲小就往上换
                int t = h[i2];
                h[i2] = h[i2 / 2];
                h[i2 / 2] = t;
                i2 = i2 / 2;
            }
        } else if (op == "pop") {
            if (sz == 0) {
                cout << -1 << endl;                 // 空堆
                continue;
            }
            cout << h[1] << endl;                   // 堆顶就是最小值
            h[1] = h[sz];                           // 末尾元素搬到根上
            sz--;
            int i2 = 1;
            while (true) {                          // 下沉
                int best = i2;
                if (2 * i2 <= sz && h[2 * i2] < h[best]) best = 2 * i2;
                if (2 * i2 + 1 <= sz && h[2 * i2 + 1] < h[best]) best = 2 * i2 + 1;
                if (best == i2) break;              // 已经不比两个孩子大
                int t = h[i2];
                h[i2] = h[best];
                h[best] = t;
                i2 = best;
            }
        } else if (op == "top") {
            cout << (sz == 0 ? -1 : h[1]) << endl;
        } else {
            cout << sz << endl;
        }
    }
`,
        {
          includes: '#include <iostream>\n#include <string>\nusing namespace std;',
          globals: `int h[1005];   // 小根堆，下标 1 .. sz
int sz = 0;    // 堆中元素个数`,
        },
      ),
      tests: [
        { input: '8\npush 5\npush 3\npush 8\ntop\npop\ntop\nsize\npop\n', expected: '3\n3\n5\n2\n5\n' },
        { input: '3\npop\ntop\nsize\n', expected: '-1\n-1\n0\n' },
        { input: '3\npush 7\ntop\npop\n', expected: '7\n7\n' },
        { input: '6\npush 2\npush 2\npush 2\npop\npop\nsize\n', expected: '2\n2\n1\n' },
        { input: '7\npush -1\npush -5\npush 3\npush -5\npop\npop\npop\n', expected: '-5\n-5\n-1\n' },
      ],
      hints: [
        '插入：先 `h[++sz] = x`，再不断和父亲 `h[i / 2]` 比较，比父亲小就交换，然后 `i /= 2` 继续走。',
        '删除：先输出 `h[1]`，把 `h[sz]` 搬到 `h[1]`、`sz--`，然后每次找"两个孩子里较小的"交换。',
        '所有访问 `h[2 * i]` / `h[2 * i + 1]` 的地方都要先判断下标不超过 `sz`。',
        '空堆时 `pop` / `top` 输出 `-1`，别去读 `h[1]`。',
      ],
      luoguKeyword: '堆',
      luoguCode: 'P3378',
    }),

    proLesson({
      id: 'p3-5',
      title: '合并果子（哈夫曼）',
      difficulty: '中等',
      knowledge: '哈夫曼树',
      story:
        '有 `n` 堆果子，每次可以把**两堆**合并成一堆，代价是这两堆果子数之和（可以理解成搬运的体力）。\n\n' +
        '把所有果子合并成一堆，怎样合并总代价最小？答案是：**每次合并当前最小的两堆**。\n\n' +
        '这个贪心策略不只是"感觉对"，它正是构造**哈夫曼树**的过程——同一套思路还用来做哈夫曼编码（让出现次数多的字符编码更短）。',
      task:
        '给定 `n` 堆果子，每次合并两堆、代价为两堆果子数之和，求把所有果子合并成一堆所需的**最小总代价**。',
      lesson: `**贪心策略：每次取最小的两堆合并。**

直觉是这样：一堆果子在合并过程中会被反复搬运，**越早合并进去的果子被搬运的次数越多**。所以应该让"数量少的堆"多搬几次、"数量大的堆"少搬几次——也就是每次都挑最小的两堆先合并。

**正确性**（交换论证的草图）：假设最优方案里最小的那一堆 \`a\` 不是最先被合并的，那么把它和"当前最先被合并的那一堆"交换，总代价不会变大。所以"最小的一堆先合并"一定包含在某个最优方案里；把最小的两堆合并之后，问题就变成了规模小 1 的**同类问题**，于是可以一路贪心下去。

**实现：用堆（优先队列）**

做法就是上一题的小根堆：每次取出两个最小值，合并后放回去。

\`\`\`cpp
priority_queue<long long, vector<long long>, greater<long long>> pq;
for (int i = 0; i < n; i++) {
    long long x;
    cin >> x;
    pq.push(x);
}

long long ans = 0;
while (pq.size() > 1) {
    long long a = pq.top(); pq.pop();     // 最小的
    long long b = pq.top(); pq.pop();     // 次小的
    ans += a + b;                         // 累加这一次合并的代价
    pq.push(a + b);                       // 合并结果放回堆里
}
cout << ans << endl;
\`\`\`

${pointsTable([
  ['模板参数', '`priority_queue<long long, vector<long long>, greater<long long>>` 才是**小根堆**；默认的 `priority_queue<int>` 是**大根堆**'],
  ['`greater` 从哪来', '它在 `<functional>` 里（`<queue>` 一般也会带上），意思是"大的排后面"，于是堆顶就是最小值'],
  ['循环终止', '只剩 1 堆（`size() == 1`）时不用再合并；`n == 1` 时答案直接是 `0`'],
  ['为什么用 `long long`', '每次代价都可能很大，累加后会超过 `int` 的范围（约 $2.1 \\times 10^9$）'],
  ['复杂度', '共合并 $n - 1$ 次，每次堆操作 $O(\\log n)$，总计 $O(n \\log n)$ 时间；空间 $O(n)$'],
  ['也可以手写堆', '把上一题的上浮/下沉抄过来当小根堆用，效果完全一样'],
])}

**它和哈夫曼树的联系**：把每次合并看成"给两棵子树接上一个新父亲"，最后形成的二叉树就是哈夫曼树，其中每个叶子对应一堆果子，叶子的深度对应它被搬运的次数。总代价等于"每个叶子的值 × 它的深度"之和，而"每次合并最小的两个"恰好让大值落在浅层、小值落在深层——这就是**带权路径长度最小**的哈夫曼树，也是哈夫曼编码的原理。`,
      inputFormat:
        '第一行一个整数 `n`（`1 <= n <= 1000`），表示果子堆数。\n\n' +
        '第二行 `n` 个整数 `a[1..n]`（`1 <= a[i] <= 10^6`），表示每堆果子的数量，用空格分隔。',
      outputFormat: '输出一行一个整数：把所有果子合并成一堆的最小总代价。注意结果可能超过 `int` 的范围。',
      sample:
        '### 样例\n\n**输入**\n\n```\n3\n1 2 9\n```\n\n**输出**\n\n```\n15\n```\n\n' +
        '过程：先合并最小的两堆 `1 + 2 = 3`，代价 3（现在有 3 和 9 两堆）；再合并 `3 + 9 = 12`，代价 12。\n\n' +
        '总代价 `3 + 12 = 15`。\n\n' +
        '如果先合并 `1` 和 `9`（代价 10），再合并 `10` 和 `2`（代价 12），总代价就是 22，明显更差。',
      mistakes: mistakesTable([
        ['取完最小的两堆，忘了把合并结果放回堆里', '候选越来越少，答案偏小', '`ans += a + b; pq.push(a + b);` 这两步都不能少'],
        ['用了默认的 `priority_queue<int>`', '那是**大根堆**，每次取出的是最大值，完全不是贪心策略', '加上 `, vector<long long>, greater<long long>`'],
        ['用 `int` 累加答案', '大数据的答案溢出成负数', '答案与堆内元素都用 `long long`'],
        ['`n == 1` 时也进循环', '在空堆上调用 `pq.top()`，行为未定义', '循环条件写 `while (pq.size() > 1)`，天然处理 `n == 1`'],
        ['把"合并后的新堆"当成第三堆一起取最小值', '一次合并用掉了三堆，逻辑直接错乱', '严格按"取两个 → 累加 → 放回一个"的顺序写'],
      ]),
      tips:
        '- 先手算一遍小样例（比如 `1 2 3 4`），再用程序验证，能确认自己理解的是"每次取最小的两堆"。\n' +
        '- 想练手可以不写 `priority_queue`，把上一题的小根堆抄过来当工具——两种写法在这里完全等价。\n' +
        '- 洛谷同类型题目：合并果子 / 哈夫曼树（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n;
    cin >> n;
    // TODO: 定义小根堆 pq（元素类型 long long，比较器 greater<long long>），把 n 个数都读进去
    // TODO: 循环：只要堆里有 2 个以上元素，就取出最小的两个、累加代价、把和放回堆
    // TODO: 输出累加出来的总代价
`,
        {
          includes: '#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;',
        },
      ),
      solution: cppMain(
        `    int n;
    cin >> n;
    priority_queue<long long, vector<long long>, greater<long long>> pq;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        pq.push(x);
    }
    long long ans = 0;
    while (pq.size() > 1) {
        long long a = pq.top();
        pq.pop();
        long long b = pq.top();
        pq.pop();
        ans += a + b;
        pq.push(a + b);
    }
    cout << ans << endl;
`,
        {
          includes: '#include <iostream>\n#include <queue>\n#include <vector>\nusing namespace std;',
        },
      ),
      tests: [
        { input: '3\n1 2 9\n', expected: '15\n' },
        { input: '1\n5\n', expected: '0\n' },
        { input: '2\n1000000 1000000\n', expected: '2000000\n' },
        { input: '4\n1 1 1 1\n', expected: '8\n' },
        { input: '5\n5 4 3 2 1\n', expected: '33\n' },
      ],
      hints: [
        '贪心策略：每一轮都合并"当前最小的两堆"，合并结果再放回候选集合。',
        '候选集合要能快速取出最小值——这正是上一题的小根堆（`priority_queue`）擅长的。',
        '取出两个、累加代价、把新堆放回，循环到只剩一堆为止；`n == 1` 时答案是 0。',
      ],
      luoguKeyword: '哈夫曼树',
      luoguCode: 'P1090',
    }),

    proLesson({
      id: 'p3-6',
      title: '并查集',
      difficulty: '困难',
      knowledge: '并查集',
      story:
        '有一类问题反复问同一件事：**这两个元素在不在同一个集合里？** 同时还不断有新的元素被合并到一起。\n\n' +
        '每次合并后重新扫一遍数组太慢。**并查集（Disjoint Set Union, DSU）**用一棵"只关心父亲是谁"的树来表示每个集合：集合的根就是代表元，' +
        '两个元素同集合当且仅当它们的根相同。配上**路径压缩**和**按秩合并**，单次操作快到近似 $O(1)$。',
      task:
        '一开始有 `n` 个互不相连的元素（编号 `1..n`）。按顺序执行 `m` 条操作：\n\n' +
        '- `union a b`：把 `a` 和 `b` 所在的集合合并（已经在同一集合则什么都不做）；\n' +
        '- `query a b`：询问 `a` 和 `b` 是否在同一个集合。\n\n' +
        '对每条 `query` 输出 `YES` 或 `NO`；最后再输出一行**连通块个数**。',
      lesson: `**并查集的存储：一个父亲数组就够了**

\`\`\`cpp
int fa[1005];    // fa[x] 是 x 的父亲；根节点满足 fa[root] == root
int rnk[1005];   // 秩（树高的一个上界），用于按秩合并
\`\`\`

初始化：每个元素自成一个集合，**自己是自己的父亲**。

\`\`\`cpp
for (int i = 1; i <= n; i++) {
    fa[i] = i;
    rnk[i] = 0;
}
\`\`\`

**find：找根 + 路径压缩**

\`\`\`cpp
int findRoot(int x) {
    if (fa[x] == x) return x;               // 自己是根，找到了
    return fa[x] = findRoot(fa[x]);         // 递归找根，顺便把 x 直接挂到根上（路径压缩）
}
\`\`\`

关键就是 \`fa[x] = ...\` 这一句：**返回的时候顺手把路径上每个点的父亲都改成根**。于是"很长的一条链"在第一次查询后就被压平了，之后的查询几乎一步到位。

**union：按秩合并**

\`\`\`cpp
void unite(int a, int b) {
    int ra = findRoot(a);
    int rb = findRoot(b);
    if (ra == rb) return;                   // 本来就在同一集合，什么都不做
    if (rnk[ra] < rnk[rb]) {                // 让"秩大"的那个当新根
        int t = ra;
        ra = rb;
        rb = t;
    }
    fa[rb] = ra;                            // 注意方向：rb 认 ra 当父亲
    if (rnk[ra] == rnk[rb]) rnk[ra]++;      // 两棵树一样高时，新树高 +1
}
\`\`\`

**为什么要有合并策略？** 如果总是把大树接到小树上，树会退化成一条长链，\`find\` 退化成 $O(n)$。按秩（或按集合大小）合并能保证树高是 $O(\\log n)$；再加上路径压缩，实际跑起来几乎就是 $O(1)$。

**连通块计数**：所有操作结束后，\`fa[i] == i\` 的节点正好就是每个集合的根，数一数就是连通块个数。（根的定义就是"父亲是自己"，所以这一步不需要再调用 \`find\`。）

${pointsTable([
  ['fa 数组的含义', '`fa[x]` 是 x 的父亲；`fa[x] == x` 时 x 就是所在集合的根（代表元）'],
  ['find 的终止条件', '`fa[x] == x` 就返回 x；不要写成"深度到 0"，根的父亲是自己'],
  ['路径压缩', '`return fa[x] = findRoot(fa[x]);` —— 把递归结果写回 `fa[x]`，路径立刻变短'],
  ['按秩合并', '把秩小的树接到秩大的树上；两棵树秩相等时，新根的秩 +1。也常常改成按集合大小合并'],
  ['谁认谁当父亲', '`fa[rb] = ra` 表示"rb 认 ra 当父亲"；一定要和前面按秩交换的逻辑保持一致'],
  ['重复 union', '两个元素已经在同一集合时直接 `return`，否则会把根接到别的节点上，破坏结构'],
  ['复杂度', '只加路径压缩：均摊 $O(\\log n)$；路径压缩 + 按秩合并：均摊 $O(\\alpha(n))$。$\\alpha$ 是反阿克曼函数，$n$ 在宇宙量级内都有 $\\alpha(n) <= 4$，可以当成 $O(1)$'],
])}

**一句话记住它**：并查集不维护"集合里有哪些元素"，只维护"每个元素属于哪个集合"——每个点只记一个父亲，再配上两次优化，就换来近似常数的合并与查询。`,
      inputFormat:
        '第一行两个整数 `n` 和 `m`（`1 <= n <= 1000`，`1 <= m <= 1000`），表示元素个数与操作条数。\n\n' +
        '接下来 `m` 行，每行一条操作：`union a b` 或 `query a b`（`1 <= a, b <= n`）。',
      outputFormat:
        '对每条 `query` 输出一行 `YES` 或 `NO`（全大写）；\n\n' +
        '所有操作处理完后，最后再输出一行一个整数：当前连通块（集合）的个数。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 5\nunion 1 2\nquery 1 2\nquery 1 3\nunion 2 3\nquery 1 3\n```\n\n**输出**\n\n```\nYES\nNO\nYES\n3\n```\n\n' +
        '- `union 1 2` 之后 1 和 2 在同一个集合 → `YES`\n' +
        '- 3 还没有和谁合并过 → `NO`\n' +
        '- `union 2 3` 把 3 也并进来，于是 `query 1 3` → `YES`\n' +
        '- 最后的集合是 {1,2,3}、{4}、{5}，共 3 个连通块',
      mistakes: mistakesTable([
        ['忘记初始化 `fa[i] = i`', '所有节点的父亲都是 0，`find` 结果全错甚至死循环', '读入后先把 `fa[1..n]` 设成自己'],
        ['`find` 里不写路径压缩', '遇到链状合并时树越来越高，反复查询严重退化', '写成 `return fa[x] = findRoot(fa[x]);`'],
        ['`find` 的终止条件写成 `fa[x] == 0`', '根的父亲是自己而不是 0，循环永远不结束', '终止条件是 `fa[x] == x`'],
        ['合并时不判"是否已经在同一集合"、或把父子关系接反', '会把根节点的父亲改掉，或者大树接到小树上，树高失控', '开头写 `if (ra == rb) return;`，再按秩统一写 `fa[rb] = ra`'],
        ['连通块计数时统计"访问过的节点"', '同一个集合会被重复计数', '统计 `fa[i] == i` 的个数：每个集合恰好有一个根'],
      ]),
      tips:
        '- 调试时把 `fa[1..n]` 打印出来，就能看到路径压缩前后的差别：压缩后大部分点的父亲直接指向根。\n' +
        '- 比较之前记得也要先 `find` 一次（顺便压缩路径），比较的是两个**根**而不是两个节点本身。\n' +
        '- 洛谷同类型题目：并查集（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n, m;
    cin >> n >> m;
    // TODO: 初始化并查集：fa[i] = i、rnk[i] = 0
    for (int i = 0; i < m; i++) {
        string op;
        int a, b;
        cin >> op >> a >> b;
        if (op == "union") {
            // TODO: 合并 a、b 所在集合（同集合就跳过；按秩合并）
        } else {
            // TODO: 两个根相同输出 YES，否则输出 NO
        }
    }
    // TODO: 统计 fa[i] == i 的个数并输出（连通块个数）
`,
        {
          includes: '#include <iostream>\n#include <string>\nusing namespace std;',
          globals: `int fa[1005];    // fa[x]：x 的父亲；根满足 fa[root] == root
int rnk[1005];   // 秩：树高的上界，用于按秩合并

// TODO: 在这里写 findRoot(x) 与 unite(a, b) 两个函数
// findRoot：一路找到根，并在返回的路上把经过的节点直接挂到根上（路径压缩）`,
        },
      ),
      solution: cppMain(
        `    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        fa[i] = i;
        rnk[i] = 0;
    }
    for (int i = 0; i < m; i++) {
        string op;
        int a, b;
        cin >> op >> a >> b;
        if (op == "union") {
            unite(a, b);
        } else {
            cout << (findRoot(a) == findRoot(b) ? "YES" : "NO") << endl;
        }
    }
    int components = 0;
    for (int i = 1; i <= n; i++) {
        if (fa[i] == i) components++;    // 每个集合恰好有一个根
    }
    cout << components << endl;
`,
        {
          includes: '#include <iostream>\n#include <string>\nusing namespace std;',
          globals: `int fa[1005];    // fa[x]：x 的父亲；根满足 fa[root] == root
int rnk[1005];   // 秩：树高的上界，用于按秩合并

int findRoot(int x) {
    if (fa[x] == x) return x;           // 自己是根
    return fa[x] = findRoot(fa[x]);     // 递归找根 + 路径压缩
}

void unite(int a, int b) {
    int ra = findRoot(a);
    int rb = findRoot(b);
    if (ra == rb) return;               // 已经在同一个集合里
    if (rnk[ra] < rnk[rb]) {            // 让秩大的那个当新根
        int t = ra;
        ra = rb;
        rb = t;
    }
    fa[rb] = ra;                        // 秩小的接到秩大的下面
    if (rnk[ra] == rnk[rb]) rnk[ra]++;  // 两棵树一样高，新树高 +1
}
`,
        },
      ),
      tests: [
        {
          input: '5 5\nunion 1 2\nquery 1 2\nquery 1 3\nunion 2 3\nquery 1 3\n',
          expected: 'YES\nNO\nYES\n3\n',
        },
        { input: '1 2\nquery 1 1\nunion 1 1\n', expected: 'YES\n1\n' },
        {
          input: '3 5\nunion 1 2\nunion 2 3\nunion 1 3\nquery 1 3\nquery 2 2\n',
          expected: 'YES\nYES\n1\n',
        },
        { input: '4 3\nquery 1 2\nquery 3 3\nunion 1 1\n', expected: 'NO\nYES\n4\n' },
        {
          input: '7 6\nunion 1 2\nunion 2 3\nunion 3 4\nunion 4 5\nunion 5 6\nquery 1 6\n',
          expected: 'YES\n2\n',
        },
      ],
      hints: [
        '`fa[x]` 存父亲，初始化 `fa[i] = i`；根就是"父亲是自己"的那个节点。',
        '`findRoot` 递归到根之后，把沿途节点的父亲直接改成根（路径压缩），之后查找几乎一步到位。',
        '合并前先各找一次根：根相同就跳过；否则把秩小的那棵树接到秩大的树上。',
        '连通块个数 = 满足 `fa[i] == i` 的节点个数。',
      ],
      luoguKeyword: '并查集',
      luoguCode: 'P3367',
    }),
  ],
};
