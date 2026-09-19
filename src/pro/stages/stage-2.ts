/**
 * 阶段二 · 链表与字符串进阶（6 道题）
 *
 * 阶段一里的栈和队列，本质上还是"数组 + 一个指针"。这一阶段开始真正用"指针"描述数据：
 *
 *   - 链表：每个节点自己记住下一个节点在哪（用 val[] + nxt[] 模拟，不碰 new/delete）
 *   - 反转链表 / 合并有序链表：改指针的两种经典操作
 *   - KMP：用前缀函数把字符串匹配从 O(nm) 降到 O(n+m)
 *   - 字符串哈希：把字符串看成进制数，O(1) 比较任意两个子串
 *   - 字典树 Trie：把字符串按字符拆成路径，插入与查询只花 O(长度)
 */

import type { StageData } from '../../types/problem';
import { cppMain, mistakesTable, pointsTable, proLesson } from '../lesson.ts';

/** 常用头文件组合：本题都用 string 读入 */
const IO = '#include <iostream>\n#include <string>\nusing namespace std;';
/** 不需要 string 的题目用这个 */
const IO_PLAIN = '#include <iostream>\nusing namespace std;';

export const STAGE_2: StageData = {
  stage: 2,
  title: '阶段二 · 链表与字符串进阶',
  subtitle: '链表、KMP、哈希与 Trie',
  summary:
    '阶段一学的栈与队列，说到底还是"数组 + 一个指针"。这一阶段开始真正用**指针**来描述数据之间的关系。\n\n' +
    '- **链表**：每个节点自己记住下一个节点在哪。竞赛与考试里几乎都用"数组模拟"来写：' +
    '`val[i]` 存值、`nxt[i]` 存下一个节点的编号，完全不用 `new` / `delete`。\n' +
    '- **字符串匹配（KMP）**：暴力做法每失配一次就要重新比一段，最坏 $O(nm)$；' +
    'KMP 用一张"前缀函数（next 数组）"表，让失配时只后退模式串指针，做到 $O(n+m)$。\n' +
    '- **字符串哈希**：把一个字符串看成一个 $B$ 进制数，预处理前缀哈希之后，' +
    '任意两个子串是否相等就能 $O(1)$ 判断。\n' +
    '- **字典树（Trie）**：把字符串按字符拆成一条条路径，插入和查询都只花 $O(长度)$，与已经存了多少个串无关。\n\n' +
    '这四件事背后的共同思路是：**别每次都比较全部内容，把已经算过的信息留下来。**\n\n' +
    '链表的题会给出完整的输入输出框架，你只需要补上"怎么建、怎么改指针、怎么遍历"这几步；' +
    '字符串的题则要自己把预处理写好，再回答询问。',
  problems: [
    proLesson({
      id: 'p2-1',
      title: '数组模拟单链表',
      difficulty: '中等',
      knowledge: '数组模拟链表',
      story:
        '用数组存一串数据，读起来很方便，但一遇到"在中间插一个数、删一个数"就很别扭：' +
        '把后面所有元素整体往后挪或往前挪，一次就是 $O(n)$。\n\n' +
        '链表换了个思路描述"顺序"：**每个节点自己记住下一个节点在哪里**。插和删就变成改几个数字，$O(1)$。\n\n' +
        '写链表本来要 `new` 出节点、用指针串起来，但那样又慢又容易内存泄漏。' +
        '所以实际做题时几乎都这么写：**用两个数组分别当"值域"和"指针域"**，节点编号就是"地址"。',
      task:
        '按顺序执行 `n` 条操作，模拟一个单链表（新元素都插在表头）：\n\n' +
        '- `push x`：把 `x` 插入到链表头部\n' +
        '- `erase x`：删除链表中**第一个**值为 `x` 的节点；如果不存在就什么都不做\n' +
        '- `print`：从表头到表尾输出所有节点的值，相邻两个用一个空格分隔；如果链表为空，输出 `EMPTY`',
      lesson: `**数组模拟链表长什么样**：

\`\`\`cpp
int val[1005];   // val[i]：编号为 i 的节点里存的值
int nxt[1005];   // nxt[i]：编号为 i 的节点的"下一个"是谁，0 表示没有下一个
int head = 0;    // 表头（第一个节点）的编号，0 表示空链表
int tot = 0;     // 已经用掉了几个节点
\`\`\`

这里的 \`nxt\` 就是**指针域**：真实链表里存的是内存地址，这里存的是数组下标。
为什么可以用 \`0\` 表示"没有下一个"？因为节点编号从 \`1\` 开始分配，\`0\` 永远不会是一个真实节点——它天然就是"空指针"。

**头插（$O(1)$）**：新节点永远放到表头。

\`\`\`cpp
void pushFront(int x) {
    val[++tot] = x;      // ① 申请一个新节点（编号 tot），把值放进去
    nxt[tot] = head;     // ② 新节点的"下一个"指向原来的表头
    head = tot;          // ③ 表头改成这个新节点
}
\`\`\`

这三步的顺序不能换。如果先写 \`head = tot;\`，那么原来的表头编号就丢了——整条链再也找不回来。

**删除（$O(链表长度)$）**：单链表只能从头往后走，改不了前面节点的 \`nxt\`，
所以想删掉节点 \`p\`，必须**停在 \`p\` 的前一个节点**上，然后让它直接指向 \`p\` 的下一个：

\`\`\`cpp
void eraseValue(int x) {
    if (head == 0) return;                              // 空链表，没什么可删
    if (val[head] == x) { head = nxt[head]; return; }    // 删表头：没有前驱，直接让 head 后移
    int pre = head;
    while (nxt[pre] != 0 && val[nxt[pre]] != x) pre = nxt[pre];   // pre 停在 p 的前一个
    if (nxt[pre] != 0) nxt[pre] = nxt[nxt[pre]];         // 绕过 p
}
\`\`\`

**遍历**只有一种写法：\`for (int p = head; p != 0; p = nxt[p])\`。
从表头出发，每次顺着 \`nxt\` 走一格，走到 \`0\` 就是链尾。
千万不要写成 \`p++\`——节点编号只代表"第几个被创建"，和它在链上的顺序毫无关系。

${pointsTable([
  ['0 号的作用', '当"空指针"。节点编号从 1 开始分配，所以 0 不会与真实节点冲突'],
  ['头插三步', '`val[++tot] = x;` → `nxt[tot] = head;` → `head = tot;`，顺序不能换'],
  ['删除为什么要找前驱', '单链表改不了前一个节点的 `nxt`，必须停在目标节点的前一个位置'],
  ['删除表头要特判', '表头没有前驱，只能直接 `head = nxt[head];`'],
  ['遍历方式', '`for (int p = head; p != 0; p = nxt[p])`，用 0 判断结束'],
  ['复杂度', '头插 $O(1)$；查找 / 删除 $O(链表长度)$；遍历 $O(链表长度)$；空间 $O(节点数)$'],
])}

**和数组比，快在哪？** 数组的"中间插入"要搬动后面所有元素，是 $O(n)$；
链表只要改两三个数字，是 $O(1)$。代价是"想访问第 $k$ 个元素"要一步一步走，退化成 $O(k)$——
**这就是"顺序存储"和"链式存储"的取舍**：频繁插入删除选链表，频繁随机访问选数组。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 1000`），表示操作条数。\n\n' +
        '接下来 `n` 行，每行一条操作：`push x`（`-1000 ≤ x ≤ 1000`）、`erase x` 或 `print`。',
      outputFormat:
        '对每条 `print` 操作输出一行：从表头到表尾的所有节点值，用一个空格分隔；' +
        '如果链表为空则输出 `EMPTY`（全大写）。`push` 与 `erase` 不输出任何内容。',
      mistakes: mistakesTable([
        ['先改 `head` 再接 `nxt`', '原来的表头编号被覆盖，剩下的链全部丢失', '先 `nxt[tot] = head;`，最后才 `head = tot;`'],
        ['删除时只找到节点 `p` 本身', '拿不到前驱，改不了 `nxt`，节点其实没被删掉', '循环停在 `p` 的前一个位置，再让 `nxt[pre] = nxt[p]`'],
        ['删除表头也去找前驱', '表头没有前驱，会读越界或把链表接错', '开头特判 `if (val[head] == x) { head = nxt[head]; return; }`'],
        ['遍历写成 `p++` 或 `i <= tot`', '节点编号不等于链上顺序，输出顺序会乱', '一律用 `p = nxt[p]`，`p == 0` 结束'],
        ['把某个真实节点编号写成 0', '该节点被当成"空指针"，链表提前断掉', '节点编号从 1 开始，`tot` 初值为 0'],
      ]),
      tips:
        '- 先想清楚"这一步之后，\`head\`、\`nxt[tot]\` 分别应该指向谁"，再动手写代码。\n' +
        '- 调试时可以把每次操作后的链表打印出来（用 \`print\` 操作本身就行），看看顺序对不对。\n' +
        '- 洛谷同类型题目：单链表（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            // TODO: 头插：val[++tot] = x; nxt[tot] = head; head = tot;
        } else if (op == "erase") {
            int x;
            cin >> x;
            // TODO: 删除第一个值为 x 的节点（先特判表头，其余情况要先找到前驱 pre）
        } else if (op == "print") {
            // TODO: 从 head 顺着 nxt 走一遍并输出；空链表输出 EMPTY
        }
    }`,
        {
          includes: IO,
          globals: 'int val[1005];\nint nxt[1005];\nint head = 0;\nint tot = 0;',
        },
      ),
      solution: cppMain(
        `    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            pushFront(x);
        } else if (op == "erase") {
            int x;
            cin >> x;
            eraseValue(x);
        } else if (op == "print") {
            printList();
        }
    }`,
        {
          includes: IO,
          globals: `int val[1005];
int nxt[1005];
int head = 0;
int tot = 0;

void pushFront(int x) {
    val[++tot] = x;
    nxt[tot] = head;
    head = tot;
}

void eraseValue(int x) {
    if (head == 0) return;
    if (val[head] == x) {
        head = nxt[head];
        return;
    }
    int pre = head;
    while (nxt[pre] != 0 && val[nxt[pre]] != x) pre = nxt[pre];
    if (nxt[pre] != 0) nxt[pre] = nxt[nxt[pre]];
}

void printList() {
    if (head == 0) {
        cout << "EMPTY" << endl;
        return;
    }
    bool first = true;
    for (int p = head; p != 0; p = nxt[p]) {
        if (!first) cout << " ";
        cout << val[p];
        first = false;
    }
    cout << endl;
}`,
        },
      ),
      tests: [
        {
          input: '7\npush 1\npush 2\npush 3\nprint\nerase 2\nprint\nerase 9\n',
          expected: '3 2 1\n3 1\n',
        },
        { input: '2\nprint\nerase 5\n', expected: 'EMPTY\n' },
        { input: '4\npush 1\npush 2\nerase 2\nprint\n', expected: '1\n' },
        { input: '5\npush 1\npush 2\npush 3\nerase 1\nprint\n', expected: '3 2\n' },
        {
          input: '7\npush 5\npush 5\npush 5\nerase 5\nprint\nerase 5\nprint\n',
          expected: '5 5\n5\n',
        },
      ],
      hints: [
        '头插固定是三步：`val[++tot] = x;`、`nxt[tot] = head;`、`head = tot;`——想想哪一步放最后。',
        '删除任意节点都要停在它的**前一个**节点上；但表头没有前驱，所以要单独特判一次。',
        '遍历只有一种写法：`for (int p = head; p != 0; p = nxt[p])`，`p` 是节点编号而不是位置。',
      ],
      luoguKeyword: '单链表',
      luoguCode: 'B3631',
    }),

    proLesson({
      id: 'p2-2',
      title: '反转链表',
      difficulty: '简单',
      knowledge: '链表反转',
      story:
        '反转链表是链表题的"第一道坎"，几乎每次面试都会问。\n\n' +
        '它不难，但**顺序错一步就会把整条链弄丢**：因为单链表只能往后走，一旦把某个节点的 \`nxt\` 改掉，' +
        '它原来的后续节点就再也找不到了。所以关键在于"先存下来，再改指针"。',
      task:
        '给定 `n` 个整数，先把它们按顺序建成一条单链表（节点 `i` 的 \`nxt\` 指向 `i + 1`，最后一个节点指向 `0`），\n\n' +
        '然后**就地反转整条链表**（不允许新建节点、不允许把值倒着输出），最后从头到尾输出反转后的序列。',
      lesson: `**"倒着输出"不等于"反转链表"**。用数组把值从后往前打印一遍确实能过眼前这道题，
但链表本身没有变化：如果后面还要在这条链上做删除、插入，它仍然是原来的顺序。

所以我们要真的改指针。**三指针迭代法**：

\`\`\`cpp
int pre = 0;                 // pre：已经反转好的那一段的表头（一开始是空表）
int cur = head;              // cur：还没处理的那一段的表头
while (cur != 0) {
    int nxtNode = nxt[cur];  // ① 先记住"下一个"，否则改完 nxt 就丢了
    nxt[cur] = pre;          // ② 让当前节点反过来指向已反转的部分
    pre = cur;               // ③ pre 前进一步
    cur = nxtNode;           // ④ cur 前进一步
}
head = pre;                  // 循环结束时 pre 就是新表头
\`\`\`

**为什么这样是对的**：每一轮开始时都成立一个"循环不变量"——
\`pre\` 是已经反转好的那一段的表头，\`cur\` 是还没处理的那一段的表头，
两段之间已经断开、并且接好了方向。第 ② 步把 \`cur\` 接到 \`pre\` 前面，
第 ③④ 步让两个指针各前进一步，不变量继续成立。当 \`cur\` 走到 \`0\`（未处理部分为空），
\`pre\` 自然就是整条链的新表头。

${pointsTable([
  ['先存后改', '第 ① 步必须在第 ② 步之前——改完 `nxt[cur]` 就找不到原来的后续节点了'],
  ['循环不变量', '`pre` = 已反转部分的表头，`cur` = 未处理部分的表头'],
  ['pre 初值为什么是 0', '0 就是空指针，正好表示"反转好的部分一开始是空的"'],
  ['循环结束时', '`cur == 0`，未处理部分为空，`pre` 就是新表头（别忘记 `head = pre;`）'],
  ['复杂度', '每个节点只处理一次，时间 $O(n)$；只用了 3 个额外变量，空间 $O(1)$'],
])}

**边界情况**：空链表（\`head == 0\`）时循环一次都不执行，\`head\` 仍然是 \`0\`，还是空链表；
只有一个节点时，走一轮之后 \`nxt[1]\` 被改成 \`0\`，\`head\` 还是 \`1\`——两种情况都不需要特判。
这正是三指针写法比递归写法省心的地方。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 1000`）。\n\n第二行 `n` 个整数 `a[1..n]`（`-1000 ≤ a[i] ≤ 1000`），用空格分隔，表示链表中从头到尾的节点值。',
      outputFormat: '输出一行 `n` 个整数：反转后的链表从表头到表尾的值，相邻两个用一个空格分隔。',
      mistakes: mistakesTable([
        ['先写 `nxt[cur] = pre;` 再取下一个节点', '原来的后续节点编号被覆盖，链表从中间断掉', '先 `int nxtNode = nxt[cur];`，再改 `nxt[cur] = pre;`'],
        ['循环结束后忘记 `head = pre;`', '表头还指向原来的第一个节点（现在的尾节点），输出只剩一个元素', '循环后写 `head = pre;`'],
        ['把 `pre` 初值写成 `head`', '第一步就把自己绕成环，输出会死循环', '`pre` 从空指针 `0` 开始'],
        ['三个指针的更新顺序写乱', '例如先动 `cur` 再动 `pre`，会跳过节点或来回打转', '固定顺序：存 next → 改 nxt → `pre = cur` → `cur = nxtNode`'],
        ['输出时直接倒序打印原数组', '题目要的是链表被反转，后续再操作这条链时顺序是错的', '老老实实改 `nxt`，再顺着新表头遍历输出'],
      ]),
      tips:
        '- 建议在纸上把 3 个节点画出来，手动走两轮循环，把每一步的 `pre` / `cur` / `nxtNode` 写下来。\n' +
        '- 写好之后用 `n = 1` 和 `n = 2` 各测一遍，这两个是最容易翻车的规模。\n' +
        '- 洛谷同类型题目：反转链表（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> val[i];

    // 建表：节点 i 的下一个是 i + 1，最后一个节点的下一个是 0
    for (int i = 1; i <= n; i++) {
        nxt[i] = (i == n) ? 0 : i + 1;
    }
    int head = 1;

    // TODO: 用 pre / cur 两个指针迭代反转整条链表
    // TODO: 反转后把 head 指向新表头

    bool first = true;
    for (int p = head; p != 0; p = nxt[p]) {
        if (!first) cout << " ";
        cout << val[p];
        first = false;
    }
    cout << endl;`,
        {
          includes: IO_PLAIN,
          globals: 'int val[1005];\nint nxt[1005];',
        },
      ),
      solution: cppMain(
        `    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> val[i];

    for (int i = 1; i <= n; i++) {
        nxt[i] = (i == n) ? 0 : i + 1;
    }
    int head = 1;

    int pre = 0;
    int cur = head;
    while (cur != 0) {
        int nxtNode = nxt[cur];   // ① 先记住下一个
        nxt[cur] = pre;           // ② 当前节点反过来指向已反转的部分
        pre = cur;                // ③ pre 前进
        cur = nxtNode;            // ④ cur 前进
    }
    head = pre;

    bool first = true;
    for (int p = head; p != 0; p = nxt[p]) {
        if (!first) cout << " ";
        cout << val[p];
        first = false;
    }
    cout << endl;`,
        {
          includes: IO_PLAIN,
          globals: 'int val[1005];\nint nxt[1005];',
        },
      ),
      tests: [
        { input: '5\n1 2 3 4 5\n', expected: '5 4 3 2 1\n' },
        { input: '1\n7\n', expected: '7\n' },
        { input: '2\n-3 8\n', expected: '8 -3\n' },
        { input: '4\n5 5 5 5\n', expected: '5 5 5 5\n' },
        { input: '3\n10 -1 0\n', expected: '0 -1 10\n' },
      ],
      hints: [
        '用两个指针就够：`pre` 表示已经反转好的那一段的表头，`cur` 表示还没处理的那一段的表头。',
        '每一轮里，先取出 `cur` 的下一个节点存到临时变量里，再改 `nxt[cur] = pre`，否则后续节点就丢了。',
        '循环结束的条件是 `cur == 0`；这时新表头是 `pre`，别忘记更新 `head`。',
      ],
      luoguKeyword: '反转链表',
    }),

    proLesson({
      id: 'p2-3',
      title: '合并两个有序链表',
      difficulty: '中等',
      knowledge: '链表归并',
      story:
        '归并排序里最重要的零件就是"把两条有序序列合成一条有序序列"，这一步叫做**归并（merge）**。\n\n' +
        '如果两条序列存在数组里，归并要额外开一个数组来装结果；' +
        '但如果它们本来就是**链表**，我们可以直接改指针把节点串起来，**一个节点都不用复制**。',
      task:
        '给定两条**非递减**的单链表 A（长度 `n`）和 B（长度 `m`），把它们合并成一条仍然非递减的链表 C，' +
        '并按要求输出 C 中所有节点的值。\n\n' +
        '要求**通过改 `nxt` 指针把原来的节点串起来**（不新建节点、不重新排序）。',
      lesson: `**朴素做法**：把两串数字读进数组，拼在一起再 \`sort\` 一遍，复杂度 $O((n+m)\\log(n+m))$。
这能过题，但它完全没有用到"两条链已经有序"这个条件。

**归并做法**：两条链都已经有序，所以每次只需要比较**两条链当前的第一个节点**，
谁小就先把谁摘下来接到结果链尾。剩下的那一整段一定比已经摘下来的都大，可以**整段一次挂上**，
这一步是 $O(1)$ 的——归并之所以能到 $O(n+m)$，关键就在这里。

**虚拟头节点（dummy）**：结果链表的第一个节点从哪来？不处理的话每次都要特判"结果是不是空的"。
常见技巧是拿一个不存数据、只借 \`nxt\` 用的 \`0\` 号节点当"假表头"：

\`\`\`cpp
int dummy = 0;                    // 虚拟头节点：不存数据，只用它的 nxt
int tail = dummy;                 // 结果链表的尾指针
int a = headA, b = headB;
while (a != 0 && b != 0) {
    if (val[a] <= val[b]) {
        nxt[tail] = a;            // 把 a 接到结果链尾
        tail = a;
        a = nxt[a];               // a 前进（此时 nxt[a] 还没被改过）
    } else {
        nxt[tail] = b;
        tail = b;
        b = nxt[b];
    }
}
nxt[tail] = (a != 0) ? a : b;     // 剩下的一整段直接挂上，O(1)
int headC = nxt[dummy];           // 真正的表头是虚拟头节点的下一个
\`\`\`

${pointsTable([
  ['虚拟头节点', '`0` 号节点不存数据，让"往结果链尾追加"这个动作对第一个节点也成立，省掉空链表特判'],
  ['尾指针 tail', '有它每次追加都是 $O(1)$；没有它就得每次从头走到尾，整体退化成 $O((n+m)^2)$'],
  ['相等时取哪边', '`val[a] <= val[b]` 先取 A。取哪边都不影响结果是否有序，但必须固定下来，否则调试时很难对拍'],
  ['最后一步', '`nxt[tail] = a ? a : b;` 把没走完的那条链整段接上，这是归并 $O(n+m)$ 的关键'],
  ['为什么不能重新排序', '题目考的是"改指针"，在数组模拟下就是改 `nxt`；把两条链的值排序输出等于没做这道题'],
  ['复杂度', '时间 $O(n+m)$（每个节点只看一次）；空间 $O(n+m)$（节点池本身），额外空间 $O(1)$'],
])}

**注意**：合并的整个过程里，\`nxt\` 被改写的都只是"已经摘下来"的节点，
被摘下来的节点的 \`nxt\` 要么指向新的后继，要么保持原样（因为它是当前链的头部，还没被改过）。
这就是为什么 \`a = nxt[a];\` 写在 \`nxt[tail] = a;\` 之后仍然安全。`,
      inputFormat:
        '第一行两个整数 `n` 和 `m`（`0 ≤ n, m ≤ 500`），分别表示两条链表的长度。\n\n' +
        '第二行 `n` 个整数，表示链表 A 从头到尾的值（非递减）；若 `n = 0` 则这一行为空。\n\n' +
        '第三行 `m` 个整数，表示链表 B 从头到尾的值（非递减）；若 `m = 0` 则这一行为空。\n\n' +
        '所有整数的绝对值不超过 1000。',
      outputFormat:
        '输出一行：合并后的链表 C 从头到尾的值，相邻两个用一个空格分隔；' +
        '如果 C 为空（即 `n = m = 0`），输出 `EMPTY`。',
      mistakes: mistakesTable([
        ['不用尾指针，每次都从头遍历到链尾', '每次追加 $O(长度)$，整体退化成 $O((n+m)^2)$', '维护 `tail`，追加时只改 `nxt[tail]`'],
        ['不处理"结果链为空"的情况', '第一个节点没地方挂，或写出了越界访问', '用 `dummy` 虚拟头节点，统一处理'],
        ['最后忘记接上剩余的一段', '结果会缺掉一整段（某条链剩下的所有节点）', '循环后写 `nxt[tail] = (a != 0) ? a : b;`'],
        ['摘节点时先把 `a` 移走再改 `nxt[tail]`', '顺序虽不致命但容易写成 `nxt[a]` 被覆盖的形式，导致链断裂', '固定顺序：挂上去 → `tail` 前进 → `a` 前进'],
        ['把两条链的值读进数组排序后输出', '结果虽然有序，但完全没有练习"改指针"', '按归并的方式改 `nxt`，最后顺着 `nxt[dummy]` 遍历输出'],
      ]),
      tips:
        '- 先把"两条链各自怎么建"写出来：A 用节点 `1..n`，B 用节点 `n+1..n+m`，两条链的尾节点 `nxt` 都是 `0`。\n' +
        '- 当 `n = 0` 或 `m = 0` 时，输入里对应的那一行是空的，用 `cin >>` 循环读会自动跳过空白，不用特殊处理。\n' +
        '- 洛谷同类型题目：合并两个有序链表（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n, m;
    cin >> n >> m;

    // 建链表 A：占用节点 1 .. n
    for (int i = 1; i <= n; i++) {
        cin >> val[i];
        nxt[i] = 0;
        if (i > 1) nxt[i - 1] = i;
    }
    // 建链表 B：占用节点 n+1 .. n+m
    for (int i = n + 1; i <= n + m; i++) {
        cin >> val[i];
        nxt[i] = 0;
        if (i > n + 1) nxt[i - 1] = i;
    }
    int headA = (n == 0) ? 0 : 1;
    int headB = (m == 0) ? 0 : n + 1;

    // TODO: 用虚拟头节点 dummy = 0 与尾指针 tail 做归并，把两段节点串成一条链
    // TODO: 循环结束后把没走完的那一整段挂到 tail 后面

    int headC = nxt[0];
    // TODO: 从 headC 顺着 nxt 输出结果；若为空输出 EMPTY
    (void)headA;
    (void)headB;`,
        {
          includes: IO_PLAIN,
          globals: 'int val[1005];\nint nxt[1005];',
        },
      ),
      solution: cppMain(
        `    int n, m;
    cin >> n >> m;

    for (int i = 1; i <= n; i++) {
        cin >> val[i];
        nxt[i] = 0;
        if (i > 1) nxt[i - 1] = i;
    }
    for (int i = n + 1; i <= n + m; i++) {
        cin >> val[i];
        nxt[i] = 0;
        if (i > n + 1) nxt[i - 1] = i;
    }
    int headA = (n == 0) ? 0 : 1;
    int headB = (m == 0) ? 0 : n + 1;

    int dummy = 0;
    int tail = dummy;
    int a = headA;
    int b = headB;
    while (a != 0 && b != 0) {
        if (val[a] <= val[b]) {
            nxt[tail] = a;
            tail = a;
            a = nxt[a];
        } else {
            nxt[tail] = b;
            tail = b;
            b = nxt[b];
        }
    }
    nxt[tail] = (a != 0) ? a : b;

    int headC = nxt[dummy];
    if (headC == 0) {
        cout << "EMPTY" << endl;
    } else {
        bool first = true;
        for (int p = headC; p != 0; p = nxt[p]) {
            if (!first) cout << " ";
            cout << val[p];
            first = false;
        }
        cout << endl;
    }`,
        {
          includes: IO_PLAIN,
          globals: 'int val[1005];\nint nxt[1005];',
        },
      ),
      tests: [
        { input: '3 3\n1 3 5\n2 4 6\n', expected: '1 2 3 4 5 6\n' },
        { input: '0 3\n1 2 3\n', expected: '1 2 3\n' },
        { input: '0 0\n', expected: 'EMPTY\n' },
        { input: '2 1\n2 2\n2\n', expected: '2 2 2\n' },
        { input: '1 1\n9\n1\n', expected: '1 9\n' },
      ],
      hints: [
        '两条链已经有序，所以每一步只要比较"两条链当前的头节点"谁更小。',
        '用一个 `0` 号虚拟头节点 + 尾指针 `tail`，就能把"往结果链尾挂节点"写成一个统一动作。',
        '当其中一条链走空了，把另一条链剩下的一整段直接挂到 `tail` 后面即可，不需要一个节点一个节点地接。',
      ],
      luoguKeyword: '合并有序链表',
      luoguCode: 'P1366',
    }),

    proLesson({
      id: 'p2-4',
      title: 'KMP 字符串匹配',
      difficulty: '困难',
      knowledge: 'KMP 匹配',
      story:
        '在一段长文本里找一个短模式串，这就是"字符串匹配"。\n\n' +
        '朴素做法是枚举每个起点逐个字符比，最坏情况（比如文本是 `aaaa...a`、模式是 `aaaab`）' +
        '会退化到 $O(nm)$。\n\n' +
        'KMP 的创始人发现：**失配时，之前已经匹配上的那一段字符里藏着信息**——' +
        '不必从头再来，只要把模式串往后"挪"到某个位置继续比就行。这张"挪多少"的表，就是前缀函数（很多书上叫 next 数组）。',
      task:
        '给定文本串 `s` 和模式串 `t`，找出 `t` 在 `s` 中**所有**出现位置的起始下标（下标从 1 开始计数）。\n\n' +
        '输出两行：第一行是出现次数；如果次数大于 0，第二行按从小到大的顺序输出所有起始下标。',
      lesson: `**朴素做法与其复杂度**：枚举文本串的每个起点 $i$，从 $t[0]$ 开始逐个字符比较，
一旦失配就换下一个起点重来。文本串长度 $n$、模式串长度 $m$ 时最坏要做 $n \\times m$ 次比较，即 $O(nm)$。
$n = m = 10^5$ 时这就是 $10^{10}$ 次操作，必然超时。

**一条关键观察**：失配时，我们其实已经知道了 $s$ 中当前位置往前 $j$ 个字符长什么样——
它们和 $t$ 的前 $j$ 个字符完全一样。所以"把模式串往后挪几位"这件事，只和**模式串自己**有关，
和文本串无关。于是可以预处理出一张表：**\`pi[i]\` = 子串 \`t[0..i]\` 的最长"相等真前后缀"长度**。

"相等真前后缀"意思是：既是这一段的前缀、又是它的后缀，而且不能是它自己。
例如 \`t = "ababd"\`：

| i | t[0..i] | 最长相等真前后缀 | pi[i] |
| --- | --- | --- | --- |
| 0 | a | 无 | 0 |
| 1 | ab | 无 | 0 |
| 2 | aba | \`a\` | 1 |
| 3 | abab | \`ab\` | 2 |
| 4 | ababd | 无 | 0 |

**前缀函数怎么递推求**（$O(m)$）：

\`\`\`cpp
pi[0] = 0;
for (int i = 1; i < m; i++) {
    int j = pi[i - 1];                        // 先假设答案最多是上一个位置的值 + 1
    while (j > 0 && t[i] != t[j]) j = pi[j - 1];  // 不行就退到"次长"的候选
    if (t[i] == t[j]) j++;                    // 对上了，长度加一
    pi[i] = j;
}
\`\`\`

**用它来匹配**（$O(n)$）：文本串指针 \`i\` **只往前走，从不后退**——这是 KMP 能做到线性的根本原因。

\`\`\`cpp
int j = 0;                                    // j：当前已经匹配上的长度
for (int i = 0; i < n; i++) {
    while (j > 0 && s[i] != t[j]) j = pi[j - 1];   // 失配：模式串指针后退，文本串指针不动
    if (s[i] == t[j]) j++;
    if (j == m) {                             // 整串匹配成功
        // 起始位置（0 基）是 i - m + 1
        j = pi[j - 1];                        // 回退，继续找下一个（允许重叠）
    }
}
\`\`\`

${pointsTable([
  ['pi 数组的定义', '`pi[i]` = `t[0..i]` 中最长的、既是前缀又是后缀的**真**子串长度（不含自身）'],
  ['为什么能省时间', '失配时已匹配的长度 $j$ 告诉我们该怎么对齐；只要回退模式串指针，文本串指针永远不回退'],
  ['回退的写法', '`while (j > 0 && ...) j = pi[j - 1];`——必须先判断 `j > 0`，否则 `pi[-1]` 会越界'],
  ['匹配成功之后', '写成 `j = pi[j - 1]` 而不是 `j = 0`，这样才能找出**重叠**的出现位置（例如 s = `aaaa`、t = `aa`）'],
  ['别读越界', '`t[j]` 只在 `j < m` 时才是合法下标；一旦 `j == m` 要立刻回退'],
  ['复杂度', '预处理 $O(m)$，匹配 $O(n)$，总计 $O(n+m)$；空间 $O(m)$（存 pi 数组）'],
])}

**为什么是"线性"的**：文本串指针 \`i\` 每轮只加一；模式串指针 \`j\` 每次失配都会变小，
而它总共只能增加 $n$ 次，所以它总共也只会减少 $n$ 次。两个指针的总移动次数是 $O(n)$。`,
      inputFormat:
        '第一行一个字符串 `s`，第二行一个字符串 `t`（都只含小写字母，不含空格，`1 ≤ |s| ≤ 1000`、`1 ≤ |t| ≤ 1000`）。\n\n' +
        '注意两点：\n\n' +
        '- `t` 在 `s` 中出现的次数按**允许重叠**计算，例如 `s = aaaa`、`t = aa` 时有 3 个位置；\n' +
        '- `|t|` **可能大于** `|s|`，此时答案显然是 `0`。',
      outputFormat:
        '第一行输出一个整数，表示 `t` 在 `s` 中出现的次数 `k`。\n\n' +
        '如果 `k > 0`，第二行输出 `k` 个整数：每次出现的起始下标（从 1 开始计数），按从小到大排列，用一个空格分隔。\n\n' +
        '如果 `k = 0`，则只输出第一行。',
      sample:
        '### 样例\n\n**输入**\n\n```\nababcabcabababd\nababd\n```\n\n**输出**\n\n```\n1\n11\n```\n\n' +
        '模式串 `ababd` 的前缀函数是 `0 0 1 2 0`。匹配过程中，' +
        '文本串前 10 个字符 `ababcabcab` 里始终凑不出完整的 `ababd`，' +
        '直到第 11 个字符开始的 `ababd` 才对上，所以答案是 1 个位置：11。',
      mistakes: mistakesTable([
        ['回退时写成 `j = pi[j];`', '回退的步长不对，会漏掉匹配或死循环', '规范写法是 `j = pi[j - 1];`'],
        ['`while` 里不判断 `j > 0`', '`j` 减到 0 后继续访问 `pi[-1]`，数组越界、结果随机', '条件写成 `while (j > 0 && s[i] != t[j])`'],
        ['匹配成功后 `j` 直接清 0', '重叠的出现位置被漏掉（`s = aaaa`、`t = aa` 只会找到 1 次）', '写 `j = pi[j - 1];`，回退到"最长相等前后缀"处继续'],
        ['`pi[0]` 没有显式初始化为 0', '递推的第一步就读到未初始化的值', '循环开始前写 `pi[0] = 0;`'],
        ['输出位置时忘记 +1', '题目要求从 1 开始计数，会整体差 1，全部答案错误', '0 基起点 `i - m + 1` 输出时写成 `i - m + 2`'],
        ['把 KMP 写成暴力双重循环', '$O(nm)$，数据一大就超时，白学了 KMP', '文本串指针永不回退，失配只后退模式串指针'],
      ]),
      tips:
        '- 先不写匹配，只把 \`pi\` 数组打印出来，和上面那张表对照，确认前缀函数求对了再往下做。\n' +
        '- 特别测两组数据：\`s = aaaa, t = aa\`（考重叠）和 \`s = abc, t = abcd\`（考模式串比文本还长）。\n' +
        '- 洛谷同类型题目：KMP 字符串匹配（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    string s, t;
    cin >> s >> t;
    int n = (int)s.size();
    int m = (int)t.size();

    // TODO: 求出模式串的前缀函数 pi[0..m-1]（pi[i] = t[0..i] 的最长相等真前后缀长度）

    int cnt = 0;   // 匹配到的次数
    int j = 0;     // 当前已经匹配上的长度

    // TODO: 扫描文本串：失配时用 pi 回退 j；j 达到 m 时记录起点并回退，允许重叠

    cout << cnt << endl;
    if (cnt > 0) {
        // TODO: 输出所有起点（从 1 开始计数），用空格分隔
    }`,
        {
          includes: IO,
          globals: 'int pi[1005];\nint pos[1005];',
        },
      ),
      solution: cppMain(
        `    string s, t;
    cin >> s >> t;
    int n = (int)s.size();
    int m = (int)t.size();

    pi[0] = 0;
    for (int i = 1; i < m; i++) {
        int j = pi[i - 1];
        while (j > 0 && t[i] != t[j]) j = pi[j - 1];
        if (t[i] == t[j]) j++;
        pi[i] = j;
    }

    int cnt = 0;
    int j = 0;
    for (int i = 0; i < n; i++) {
        while (j > 0 && s[i] != t[j]) j = pi[j - 1];
        if (s[i] == t[j]) j++;
        if (j == m) {
            pos[cnt++] = i - m + 1;   // 0 基起点
            j = pi[j - 1];            // 回退，继续找（允许重叠）
        }
    }

    cout << cnt << endl;
    if (cnt > 0) {
        for (int i = 0; i < cnt; i++) {
            if (i > 0) cout << " ";
            cout << pos[i] + 1;       // 转成从 1 开始计数
        }
        cout << endl;
    }`,
        {
          includes: IO,
          globals: 'int pi[1005];\nint pos[1005];',
        },
      ),
      tests: [
        { input: 'ababcabcabababd\nababd\n', expected: '1\n11\n' },
        { input: 'aaaa\naa\n', expected: '3\n1 2 3\n' },
        { input: 'abc\nd\n', expected: '0\n' },
        { input: 'a\na\n', expected: '1\n1\n' },
        { input: 'ab\nabc\n', expected: '0\n' },
      ],
      hints: [
        '先只做预处理：`pi[i]` 表示 `t[0..i]` 中最长的、既是前缀又是后缀的真子串长度。',
        '求 `pi` 时可以借助上一个位置的结果：先从 `j = pi[i-1]` 出发，对不上就退到 `pi[j-1]` 再试。',
        '匹配时文本串的下标只往前走，失配时只把模式串的下标 `j` 退到 `pi[j-1]`。',
        '匹配成功后记得把 `j` 退到 `pi[m-1]`（不是 0），否则重叠的出现位置会漏掉。',
      ],
      luoguKeyword: 'KMP',
      luoguCode: 'P3375',
    }),

    proLesson({
      id: 'p2-5',
      title: '字符串哈希',
      difficulty: '中等',
      knowledge: '字符串哈希',
      story:
        '要判断两个子串是否相同，最直接的办法是把它们逐字符比一遍。\n\n' +
        '可如果有很多次询问，每次都从头比就很浪费。哈希的思路很妙：' +
        '**把一个字符串看成一个 $B$ 进制数**，比较两个串就变成了比较两个数——一次乘法、一次减法就能搞定。',
      task:
        '给定一个字符串 `s`（下标从 1 开始）和 `q` 次询问，每次询问给出两段区间 `[l1, r1]` 与 `[l2, r2]`，' +
        '判断这两个子串是否**完全相同**：相同输出 `YES`，不同输出 `NO`。',
      lesson: `**朴素做法**：每次询问把两个子串取出来逐字符比较，单次 $O(长度)$。
$q$ 次询问最坏是 $O(qn)$。本题范围内还能过，但当 $n$ 到 $10^5$、$q$ 到 $10^5$ 时就是 $10^{10}$，必然超时。

**优化思路**：把字符串当成一个 $B$ 进制整数。例如把所有小写字母映射成 $1..26$，
字符串 \`"abc"\` 就看成 $a \\cdot B^2 + b \\cdot B + c$。这样"两个串相等"就变成"两个数相等"。

问题在于这个数会非常大（长度 1000 时是个 1000 位的 $B$ 进制数）。
解决办法是**取模**：模 $2^{64}$ 最省事——只要用 \`unsigned long long\`，让它自然溢出即可，
**不需要手写取模运算**（无符号整数溢出在 C++ 里是定义好的行为，等价于模 $2^{64}$）。

**预处理前缀哈希**：\`h[i]\` 表示前 \`i\` 个字符的哈希值。

\`\`\`cpp
typedef unsigned long long ull;
const ull B = 131;                 // 进制，一般取大于字符集的质数
ull h[1005];                       // h[i]：s[1..i] 的哈希
ull pw[1005];                      // pw[i]：B 的 i 次方

pw[0] = 1;
h[0] = 0;
for (int i = 1; i <= n; i++) {
    pw[i] = pw[i - 1] * B;
    h[i] = h[i - 1] * B + (ull)s[i - 1];   // 注意：字符串下标从 0 开始，所以用 s[i-1]
}
\`\`\`

**取任意子串的哈希**（$O(1)$）：先把 \`h[l-1]\` 乘上 \`pw[r-l+1]\`"对齐"到同一长度，再相减。

\`\`\`cpp
ull subHash(int l, int r) {
    return h[r] - h[l - 1] * pw[r - l + 1];
}
\`\`\`

于是每次询问只要判断 \`subHash(l1, r1) == subHash(l2, r2)\`，$O(1)$。

${pointsTable([
  ['为什么用 unsigned long long', '它的溢出等价于自动模 $2^{64}$，不用手写取模；而 `int` / `long long` 溢出是未定义行为'],
  ['进制 B 怎么选', '取比字符集大的质数，常用 131、13331；太小容易冲突，太大没必要'],
  ['子串哈希公式', '`h[r] - h[l-1] * pw[r-l+1]`：先对齐长度再相减，减完就是这一段的值'],
  ['一定要先比长度', '长度不同的子串直接判 NO。不判就套公式，两边乘的 `pw` 次数都不一样，值没有可比性'],
  ['哈希冲突', '两个不同的串理论上仍可能哈希相同（概率极小）。想更稳可以再换一个模数做双哈希，或相等时再逐字符核对'],
  ['复杂度', '预处理 $O(n)$，每次询问 $O(1)$；空间 $O(n)$（两个数组 h 与 pw）'],
])}

**和 KMP 的关系**：KMP 回答的是"模式串出现在哪些位置"，哈希回答的是"两段文本是不是一样"。
哈希的适用范围更广，写法也更短，很多字符串题都是先写一个哈希再往上叠功能。`,
      inputFormat:
        '第一行一个字符串 `s`（只含小写字母，不含空格，`1 ≤ |s| ≤ 1000`），下标从 1 开始。\n\n' +
        '第二行一个整数 `q`（`1 ≤ q ≤ 1000`），表示询问次数。\n\n' +
        '接下来 `q` 行，每行四个整数 `l1 r1 l2 r2`，保证 `1 ≤ l1 ≤ r1 ≤ |s|`、`1 ≤ l2 ≤ r2 ≤ |s|`。',
      outputFormat: '对每次询问输出一行：两个子串完全相同输出 `YES`，否则输出 `NO`（全大写）。',
      sample:
        '### 样例\n\n**输入**\n\n```\nabacaba\n3\n1 3 5 7\n1 1 3 3\n1 2 2 4\n```\n\n**输出**\n\n```\nYES\nYES\nNO\n```\n\n' +
        '`s = abacaba`，下标 1..7。第一次询问比较 `s[1..3] = "aba"` 与 `s[5..7] = "aba"`，相同；' +
        '第二次比较两个单独的 `a`，相同；' +
        '第三次比较 `s[1..2] = "ab"` 与 `s[2..4] = "bac"`，长度不同，直接判 `NO`。',
      mistakes: mistakesTable([
        ['用 `int` 或 `long long` 存哈希', '有符号整数溢出是未定义行为，结果可能被优化成任意值', '哈希一律用 `unsigned long long`'],
        ['忘记先比较两个区间的长度', '公式算出的值含义不同（乘的 `pw` 次数不一样），会把"长度不同"误判为相同', '先写 `if (r1 - l1 != r2 - l2) { NO }`'],
        ['子串哈希写成 `h[r] - h[l-1] * pw[l]`', '对齐用的幂次写错，算出来的根本不是这一段的值', '`h[r] - h[l - 1] * pw[r - l + 1]`'],
        ['前缀哈希的下标没有对齐', '`s` 下标从 0 开始，写 `h[i] = h[i-1] * B + s[i]` 会整体错位一位', '循环写成 `for (i = 1; i <= n; i++)`，取字符用 `s[i - 1]`'],
        ['以为哈希相等就一定相等', '存在极小概率的哈希冲突，极端数据（构造出来的卡哈希数据）会被卡掉', '追求稳妥时用双哈希，或比较结果相等时再逐字符核对一次'],
      ]),
      tips:
        '- 先把 \`h\` 数组和 \`pw\` 数组打印出来看看（小数据时手算一下 \`"abc"\` 的哈希），确认公式没写反。\n' +
        '- 询问里 \`l1\` 可能等于 \`r1\`（单个字符），也可能两个区间完全相同，这些都要能正确输出 \`YES\`。\n' +
        '- 洛谷同类型题目：字符串哈希（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    string s;
    cin >> s;
    int n = (int)s.size();
    int q;
    cin >> q;

    const unsigned long long B = 131;
    unsigned long long h[1005];
    unsigned long long pw[1005];

    pw[0] = 1;
    h[0] = 0;
    for (int i = 1; i <= n; i++) {
        pw[i] = pw[i - 1] * B;
        // TODO: 求出前缀哈希 h[i]（注意字符串下标从 0 开始）
    }

    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;
        // TODO: 先比较长度；长度相同再比较两段的哈希值，输出 YES 或 NO
    }`,
        { includes: IO },
      ),
      solution: cppMain(
        `    string s;
    cin >> s;
    int n = (int)s.size();
    int q;
    cin >> q;

    const unsigned long long B = 131;
    unsigned long long h[1005];
    unsigned long long pw[1005];

    pw[0] = 1;
    h[0] = 0;
    for (int i = 1; i <= n; i++) {
        pw[i] = pw[i - 1] * B;
        h[i] = h[i - 1] * B + (unsigned long long)s[i - 1];
    }

    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;
        bool same;
        if (r1 - l1 != r2 - l2) {
            same = false;                                  // 长度不同，一定不相同
        } else {
            unsigned long long x = h[r1] - h[l1 - 1] * pw[r1 - l1 + 1];
            unsigned long long y = h[r2] - h[l2 - 1] * pw[r2 - l2 + 1];
            same = (x == y);
        }
        cout << (same ? "YES" : "NO") << endl;
    }`,
        { includes: IO },
      ),
      tests: [
        { input: 'abacaba\n3\n1 3 5 7\n1 1 3 3\n1 2 2 4\n', expected: 'YES\nYES\nNO\n' },
        { input: 'abc\n1\n1 1 2 3\n', expected: 'NO\n' },
        { input: 'aaaaa\n2\n1 2 4 5\n1 1 5 5\n', expected: 'YES\nYES\n' },
        { input: 'xyz\n1\n2 2 2 2\n', expected: 'YES\n' },
        { input: 'ab\n1\n1 1 2 2\n', expected: 'NO\n' },
      ],
      hints: [
        '把字符串看成一个 $B$ 进制数，用 `unsigned long long` 让它在溢出时自动模 $2^{64}$。',
        '预处理出前缀哈希 `h[i]` 和 $B$ 的幂 `pw[i]`，之后任意子串的哈希都能 $O(1)$ 算出来。',
        '取子串 `[l, r]` 的哈希是 `h[r] - h[l-1] * pw[r-l+1]`：先把前面那段"抬高"到同样位数再相减。',
        '两个区间长度不同就直接判 `NO`，不要再去比哈希值。',
      ],
      luoguKeyword: '字符串哈希',
      luoguCode: 'P3370',
    }),

    proLesson({
      id: 'p2-6',
      title: '字典树 Trie',
      difficulty: '中等',
      knowledge: '字典树 Trie',
      story:
        '在一堆字符串里反复查询"某个串出现过几次"，你有几种选择：\n\n' +
        '- 每次把 n 个串都比一遍：$O(n \\cdot L)$；\n' +
        '- 用 \`map<string, int>\`：每次 $O(L \\log n)$；\n' +
        '- **字典树（Trie）**：每次 $O(L)$，而且和"已经存了多少个串"完全无关。\n\n' +
        '字典树的形状就像一本真的字典：从根出发，每条边是一个字符，' +
        '**从根走到某个节点所经过的字符，正好拼成一个前缀**。',
      task:
        '先读入 `n` 个字符串并插入字典树（**允许重复**，重复插入要分别计数），\n\n' +
        '然后回答 `q` 次询问：每次给出一个字符串，输出它在之前插入的字符串中**出现的次数**（没出现过输出 `0`）。',
      lesson: `**朴素做法与其复杂度**：每次询问都把 \`n\` 个字符串从头到尾比一遍，单次 $O(n \\cdot L)$。
换 \`map<string, int>\` 后每次 $O(L \\log n)$（比较字符串本身还要 $O(L)$）。
Trie 的做法是：插入与查询都只沿着字符串的字符走一条链，$O(L)$，**与 $n$ 无关**。

**结构**：\`ch[p][c]\` 表示"从节点 p 出发、走字符 c 之后到达哪个节点"，\`0\` 表示这条边不存在。

\`\`\`cpp
int ch[8005][26];   // 转移表：ch[p][c] = 0 表示节点 p 没有 c 这条边
int cnt[8005];      // cnt[p]：有多少个插入的字符串在节点 p 结束
int tot = 1;        // 已分配的节点个数；0 号是根，子节点编号从 1 开始
\`\`\`

**为什么 0 号节点可以同时当"根"和"空"？** 因为节点编号从 \`1\` 开始分配，
所以 \`ch[p][c] == 0\` 绝不会指向一个真实节点——它天然表示"没有这条边"。

**插入**：顺着字符走，没边就新建节点；走完整个串后，在**结尾节点**上计数。

\`\`\`cpp
void insertWord(const string &s) {
    int p = 0;                                  // 从根出发
    for (int i = 0; i < (int)s.size(); i++) {
        int c = s[i] - 'a';
        if (ch[p][c] == 0) ch[p][c] = tot++;    // 没有这条边就新建一个节点
        p = ch[p][c];
    }
    cnt[p]++;                                   // 在结尾节点 +1（重复插入会累加）
}
\`\`\`

**查询**：同样顺着走，中途断掉就说明没出现过（直接返回 \`0\`）；走完返回结尾节点的计数。

\`\`\`cpp
int queryWord(const string &s) {
    int p = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        int c = s[i] - 'a';
        if (ch[p][c] == 0) return 0;            // 这条路走不通，一定没出现过
        p = ch[p][c];
    }
    return cnt[p];
}
\`\`\`

${pointsTable([
  ['根节点编号', '固定为 0；新建节点从 1 开始编号，所以 `ch[p][c] == 0` 天然表示"没有这条边"'],
  ['插入', '沿着字符走，缺边就新建节点；走完整个串后在结尾节点 `cnt[p]++`'],
  ['查询', '沿着字符走，中途缺边立刻返回 0；平安走完返回 `cnt[p]`'],
  ['前缀不是单词', '插入 `abc` 之后查询 `ab` 必须得到 0——所以标记只打在"结尾节点"上'],
  ['为什么要 cnt 而不是 bool', '题目要统计次数；重复插入同一个串时 `cnt` 会累加，而 `bool` 只能表示"存在"'],
  ['复杂度', '插入 $O(L)$、查询 $O(L)$；空间 $O(总字符数 \\times 26)$ 个 int'],
])}

**容易忽略的一点**：节点总数最多是"所有字符串长度之和 + 1"（+1 是根节点）。
本题 \`n ≤ 500\`、每个串长度 ≤ 15，所以最多约 7501 个节点——开 \`8005\` 就够，注意数组开小了会越界。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 500`），表示要插入的字符串个数。\n\n' +
        '接下来 `n` 行，每行一个只含小写字母的非空字符串，长度不超过 15（可能有重复）。\n\n' +
        '然后一行一个整数 `q`（`1 ≤ q ≤ 500`），表示询问次数。\n\n' +
        '接下来 `q` 行，每行一个只含小写字母的非空字符串，长度不超过 15。',
      outputFormat:
        '对每次询问输出一行一个整数：被询问的字符串在插入过的字符串中出现的次数（没出现过输出 `0`）。',
      mistakes: mistakesTable([
        ['忘记初始化 `ch` 数组', '未初始化的转移表里全是随机值，查询会跑到奇怪的下标上、甚至越界', '把 `ch`、`cnt` 定义成全局数组（自动清零），或手动全部置 0'],
        ['在路径的每个节点上计数', '查询前缀（如插入 `abc` 后查 `ab`）会错误地返回非 0', '只在走完整串之后对结尾节点 `cnt[p]++`'],
        ['新建节点时忘记 `tot++`', '所有新边都指向同一个节点，树被压扁成一个链表，答案全错', '写 `if (ch[p][c] == 0) ch[p][c] = tot++;`'],
        ['节点编号从 0 开始分配', '新节点编号和"没有这条边"的标志 0 冲突', '根节点固定为 0，`tot` 初值给 1，新节点从 1 开始'],
        ['数组开得太小', '节点数超过上限时越界写坏内存，结果随机', '按"所有串长度之和 + 1"估算，例如 `[8005][26]`'],
      ]),
      tips:
        '- 先只写插入，把 \`tot\` 打印出来，看看插入若干串之后一共用掉了多少个节点，验证你的估算。\n' +
        '- 特别测这两种情况：插入 `abc` 后查询 `ab`（前缀，应为 0）、同一个串插入三次后查询它（应为 3）。\n' +
        '- 洛谷同类型题目：字典树 Trie（可在题目页按关键词搜索）。',
      starter: cppMain(
        `    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        // TODO: 把 s 插入字典树，在结尾节点上计数
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string s;
        cin >> s;
        // TODO: 查询 s 出现的次数并输出（没出现过输出 0）
    }`,
        {
          includes: IO,
          globals: `int ch[8005][26];
int cnt[8005];
int tot = 1;`,
        },
      ),
      solution: cppMain(
        `    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        insertWord(s);
    }
    int q;
    cin >> q;
    for (int i = 0; i < q; i++) {
        string s;
        cin >> s;
        cout << queryWord(s) << endl;
    }`,
        {
          includes: IO,
          globals: `int ch[8005][26];
int cnt[8005];
int tot = 1;

void insertWord(const string &s) {
    int p = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        int c = s[i] - 'a';
        if (ch[p][c] == 0) ch[p][c] = tot++;
        p = ch[p][c];
    }
    cnt[p]++;
}

int queryWord(const string &s) {
    int p = 0;
    for (int i = 0; i < (int)s.size(); i++) {
        int c = s[i] - 'a';
        if (ch[p][c] == 0) return 0;
        p = ch[p][c];
    }
    return cnt[p];
}`,
        },
      ),
      tests: [
        { input: '3\napple\napp\napple\n3\napple\napp\nap\n', expected: '2\n1\n0\n' },
        { input: '1\na\n3\na\nb\naa\n', expected: '1\n0\n0\n' },
        { input: '3\nab\nab\nab\n1\nab\n', expected: '3\n' },
        { input: '1\nabc\n2\nabcd\nabc\n', expected: '0\n1\n' },
        { input: '2\nzzz\na\n2\nzzz\na\n', expected: '1\n1\n' },
      ],
      hints: [
        '用一个二维数组 `ch[p][c]` 表示"从节点 p 走字符 c 会到哪个节点"，0 表示这条边不存在。',
        '插入时缺边就新建节点；只有在走完整个字符串之后，才在**结尾节点**上把计数加一。',
        '查询时中途遇到缺失的边可以直接返回 0；能走完就返回结尾节点的计数。',
      ],
      luoguKeyword: '字典树',
      luoguCode: 'P8306',
    }),
  ],
};
