/**
 * 阶段五 · 图论基础（6 道题）
 *
 * 前面的阶段都在处理"一维"的数据（数组、栈、队列），从这一阶段开始处理"关系"：
 * 点与点之间连成一张图，怎么把它存下来、怎么在上面走、怎么求距离、怎么排出先后顺序、
 * 怎么用最小的代价把所有点连起来。
 *
 * 六道题覆盖图论最基础的六块内容：
 *   1. 图的存储与度数统计（邻接矩阵 / 邻接表）
 *   2. DFS 遍历与连通块（递归 + visited）
 *   3. BFS 最短路（队列逐层扩展）
 *   4. 拓扑排序（入度表 + 队列，Kahn 算法）
 *   5. 最小生成树（Kruskal + 并查集）
 *   6. 单源最短路（Dijkstra，邻接矩阵 O(n^2) 版）
 *
 * 数据规模统一压得很小（n ≤ 200、m ≤ 1000），重点是把算法本身写对，
 * 而不是去对付大数据量的优化（堆优化 Dijkstra、链式前向星等留到以后）。
 */

import type { StageData } from '../../types/problem';
import { mistakesTable, pointsTable, proLesson } from '../lesson.ts';

export const STAGE_5: StageData = {
  stage: 5,
  title: '阶段五 · 图论基础',
  subtitle: '图的存储、DFS/BFS、拓扑排序、最短路与生成树',
  summary:
    '图（graph）用来描述"对象之间有关系"：路口与道路、人和朋友关系、课程与先修要求……\n\n' +
    '把关系画成图之后，问题就变成"在图上游走与计算"。这一阶段先解决最基础的六件事：\n\n' +
    '- **怎么存**：邻接矩阵 vs 邻接表，各自的复杂度。\n' +
    '- **怎么走**：DFS（一条路走到底再回头）与 BFS（一层一层往外扩）。\n' +
    '- **怎么排**：拓扑排序，把有向无环图排成"先修课在前"的线性顺序。\n' +
    '- **怎么连得便宜**：最小生成树（Kruskal + 并查集）。\n' +
    '- **怎么走得最近**：单源最短路（Dijkstra）。\n\n' +
    '这一阶段所有题目的数据都很小（点数 $n \\le 200$，边数 $m \\le 1000$），' +
    '所以不讲优化技巧，**只要求把算法的正确性写对**：visited 有没有标、队列/入度表有没有维护好、\n' +
    '连通性和无解情况有没有判、1-based 还是 0-based 有没有混用。',
  problems: [
    proLesson({
      id: 'p5-1',
      title: '图的存储与度数统计',
      difficulty: '简单',
      knowledge: '图的存储',
      story:
        '拿到一张图，第一件事永远是"怎么把它存进内存"。\n\n' +
        '存图有两大流派：**邻接矩阵**（开一个二维数组，\`g[u][v]\` 表示 u 与 v 之间有没有边）和' +
        '**邻接表**（\`g[u]\` 里存所有与 u 相邻的点）。这一题先让你把两种存法都写一遍，\n' +
        '再用它们统计每个点的**度数**——这是后面所有图算法的地基。',
      task:
        '读入一张 `n` 个点、`m` 条边的**无向图**，统计每个点的度数，并输出：\n\n' +
        '1. 点 `1` 到点 `n` 的度数；\n2. 最大的度数、以及**编号最小**的取到该度数的顶点；\n3. 度数为奇数的顶点个数。',
      lesson: `**一、两种存法**

\`\`\`cpp
// ① 邻接矩阵：g[u][v] 记录 u、v 之间有没有边（或边权）
int g[205][205];             // 空间 205 × 205
g[u][v] = g[v][u] = 1;       // 无向边必须写两次！

// ② 邻接表：g[u] 里存所有与 u 相邻的点
vector<vector<int>> g(n + 1);// 空间 O(n + m)
g[u].push_back(v);
g[v].push_back(u);           // 无向边同样要写两次！
\`\`\`

${pointsTable([
  ['邻接矩阵的空间', '$O(n^2)$。$n=200$ 时是 40000 个格子，完全放得下；$n=10^5$ 就炸了'],
  ['邻接矩阵查边', '$O(1)$：\`g[u][v]\` 直接判断两点是否相邻'],
  ['邻接矩阵遍历邻居', '$O(n)$：得把整行扫一遍才能找出所有邻居'],
  ['邻接表的空间', '$O(n + m)$：只存真实存在的边（重边各占一个位置）'],
  ['邻接表查边', '$O(deg(u))$：要在 \`g[u]\` 里找一遍'],
  ['邻接表遍历邻居', '$O(deg(u))$：只访问真正的邻居，图算法几乎都用它'],
])}

**二、无向图的度数**

无向图中点 $u$ 的度数 = 与 $u$ 相连的边的条数。用邻接表存图时，每条无向边都会往
\`g[u]\` 和 \`g[v]\` 里各塞一个元素，所以：

\`\`\`cpp
deg[u] = (int)g[u].size();   // 度数就是邻居个数
\`\`\`

**三、自环与重边的处理**

- **自环**（\`u == v\`）：\`g[u].push_back(u)\` 执行两次，\`g[u]\` 里多出两个 u，
  于是自环**给这个点贡献 2 度**——这正是图论中的标准约定（自环相当于一条边从 u 出发又回到 u）。
- **重边**：同一条边出现多次，就按条数分别计数，\`g[u]\` 里也会出现重复的邻居。

所以本题用邻接表统计度数**天然正确**，不需要任何特判。

**四、答案怎么求**

\`\`\`cpp
int best = 1;
for (int i = 1; i <= n; i++) {
    if (deg[i] > deg[best]) best = i;   // 严格大于才换，所以并列时保留编号更小的
}
\`\`\`

复杂度：读入 $O(m)$，统计度数 $O(n + m)$，求最大与奇数个数各 $O(n)$，总体 $O(n + m)$；
空间 $O(n + m)$（邻接矩阵写法则是 $O(n^2)$）。`,
      inputFormat:
        '第一行两个整数 `n` 和 `m`（`1 ≤ n ≤ 200`，`0 ≤ m ≤ 1000`），表示点数和边数，顶点编号从 **1 开始**（1 到 n）。\n\n' +
        '接下来 `m` 行，每行两个整数 `u v`（`1 ≤ u, v ≤ n`），表示一条连接 `u` 与 `v` 的**无向边**。\n\n' +
        '约定：图中**可能有重边**（同一条边出现多次，按条数分别计算），也**可能有自环**（`u == v`，自环给该点贡献 **2** 度）。',
      outputFormat:
        '输出三行：\n\n' +
        '1. 第一行 `n` 个整数：点 `1`、点 `2`……点 `n` 的度数，相邻两个数之间用**一个空格**分隔；\n' +
        '2. 第二行两个整数 `d` 和 `v`：最大的度数 `d`，以及**编号最小**的取到该度数的顶点编号 `v`（两者之间用一个空格分隔）；\n' +
        '3. 第三行一个整数：度数为**奇数**的顶点个数。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n```\n\n**输出**\n\n```\n2 2 2 2 2\n2 1\n0\n```\n\n' +
        '这张图是一个五边形（环），每个点都连着左右两个邻居，所以度数全是 2；\n' +
        '最大度数是 2、编号最小的最大度点是 1；没有度数为奇数的点，所以第三行是 0。',
      mistakes: mistakesTable([
        ['无向图只加一条边', '`g[u].push_back(v)` 之后忘了 `g[v].push_back(u)`，度数全错一半', '无向边两个方向都要加'],
        ['用邻接矩阵统计自环', '`g[u][u] = 1` 只记了一次，自环只贡献 1 度', '邻接矩阵下自环要 `g[u][u] += 2`；用邻接表则 `size()` 天然正确'],
        ['邻接表数组开小', '`vector<int> g[105]` 而 `n` 能到 200，越界写坏内存', '按最大点数开（本题 205 以上），或直接用 `vector<vector<int>> g(n + 1)`'],
        ['求最大值时用 `>=` 比较', '并列最大时取到了编号**较大**的点，与要求相反', '用严格大于 `>`，只在更大时更新'],
        ['点编号 1-based / 0-based 混用', '`for (int i = 0; i < n; i++)` 会漏掉点 n、多算点 0，输出整体错位', '本题顶点编号是 1 到 n，循环写成 `for (int i = 1; i <= n; i++)`'],
      ]),
      tips:
        '- 建议先用邻接表写一遍，再想想"如果必须用邻接矩阵，自环要怎么处理"。\n' +
        '- 输入保证合法，第一行就是 `n m`，读边时直接 `cin >> u >> v` 即可，不需要额外判断。\n' +
        '- 洛谷同类型题目：图的存储 / 图的度数（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);   // 邻接表：g[u] 里存与 u 相邻的所有点
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);          // 无向边两个方向都要加
    }
    // TODO: 点 i 的度数就是 g[i].size()，先把每个点的度数存进一个数组
    // TODO: 输出第一行（n 个度数，空格分隔）
    // TODO: 输出第二行（最大度数 d 与编号最小的最大度点 v）
    // TODO: 输出第三行（度数为奇数的顶点个数）
    return 0;
}
`,
      solution: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> deg(n + 1, 0);
    for (int i = 1; i <= n; i++) {
        deg[i] = (int)g[i].size();
    }
    for (int i = 1; i <= n; i++) {
        if (i > 1) cout << " ";
        cout << deg[i];
    }
    cout << endl;

    int best = 1;
    for (int i = 2; i <= n; i++) {
        if (deg[i] > deg[best]) best = i;
    }
    cout << deg[best] << " " << best << endl;

    int odd = 0;
    for (int i = 1; i <= n; i++) {
        if (deg[i] % 2 == 1) odd++;
    }
    cout << odd << endl;
    return 0;
}
`,
      tests: [
        {
          input: '5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n',
          expected: '2 2 2 2 2\n2 1\n0\n',
        },
        { input: '1 0\n', expected: '0\n0 1\n0\n' },
        {
          input: '3 4\n1 1\n1 2\n1 2\n3 2\n',
          expected: '4 3 1\n4 1\n2\n',
        },
        {
          input: '4 3\n2 3\n2 4\n2 1\n',
          expected: '1 3 1 1\n3 2\n4\n',
        },
        {
          input: '4 2\n1 2\n3 4\n',
          expected: '1 1 1 1\n1 1\n4\n',
        },
      ],
      hints: [
        '无向边要在邻接表里加**两次**（`g[u]` 加 `v`，`g[v]` 加 `u`），这是度数统计正确的前提。',
        '`g[i].size()` 就是点 `i` 的度数：重边会重复计数、自环会被加两次（正好是 2 度）。',
        '求最大度数时从 1 到 n 扫，只有 `deg[i] > deg[best]` 才更新，这样并列时留下的就是编号最小的点。',
      ],
      luoguKeyword: '图的存储',
      luoguCode: 'B3643',
    }),

    proLesson({
      id: 'p5-2',
      title: 'DFS 遍历与连通块',
      difficulty: '中等',
      knowledge: 'DFS 连通块',
      story:
        '**深度优先搜索（DFS）**的思路是"一条路走到黑，走不动了再回头"。\n\n' +
        '它在图上的第一个经典应用就是数**连通块**：从一个点出发能走到的所有点属于同一个连通块；' +
        '把所有点扫一遍，每遇到一个"还没被访问过"的点，就说明发现了一个新的连通块。',
      task:
        '读入一张 `n` 个点、`m` 条边的无向图，数出它有多少个**连通块**，并把每个连通块里的顶点按编号从小到大输出。',
      lesson: `**一、visited 数组是 DFS 的命根子**

图与树最大的区别是**图里可能有环**。如果没有 \`visited\`，在环上就会来回走、无限递归。
所以 DFS 的第一件事永远是"进到这个点，先把它标记成已访问"：

\`\`\`cpp
bool visited[205];

void dfs(int u) {
    visited[u] = true;        // ① 立刻标记（不要放在循环之后！）
    comp.push_back(u);        // ② 记录当前连通块的成员
    for (int v : g[u]) {      // ③ 遍历所有邻居
        if (!visited[v]) {    // ④ 只往没访问过的点走
            dfs(v);
        }
    }
}
\`\`\`

**为什么这样就能数出连通块？**

- 从任意点 $u$ 出发的 DFS 会访问到"所有与 $u$ 能互相到达的点"，一个不漏（因为路径上的每个点都会被递归走到），
  也一个不多（因为只沿着边、且只走没访问过的点）。
- 于是"从 $i$ 出发搜出来的集合"恰好就是 $i$ 所在的连通块。
- 外层只要 \`for (int i = 1; i <= n; i++)\`，遇到 \`!visited[i]\` 就说明点 $i$ 不属于之前任何一个连通块，
  新开一个块并从 $i$ 开始 DFS。**由于 $i$ 是从小到大扫的，第 $i$ 个被发现的块里最小编号正好就是 $i$**，
  所以连通块天然按"块内最小点"升序输出，不需要额外排序（块内成员要排序）。

\`\`\`cpp
int blocks = 0;
for (int i = 1; i <= n; i++) {
    if (!visited[i]) {            // 发现新的连通块
        comp.clear();
        dfs(i);
        blocks++;
        sort(comp.begin(), comp.end());   // 块内按编号升序
        all.push_back(comp);
    }
}
cout << blocks << endl;
\`\`\`

${pointsTable([
  ['visited 的作用', '防止在环里无限绕圈，同时保证每个点只被统计一次'],
  ['标记时机', '进入函数就立刻标记；如果放在遍历邻居之后标记，环上的点会被重复递归'],
  ['递归深度', 'DFS 的栈深度最多等于连通块大小，本题 $n \\le 200$，栈完全够用（$n$ 到 $10^5$ 才需要改成手写栈或用 BFS）'],
  ['自环与重边', '自环让 \`g[u]\` 里多出自己，但 \`visited[u]\` 已经是 true，不会重入；重边只会让同一个邻居被检查多次，不影响结果'],
  ['孤立点', '度数 0 的点自己就是一个连通块（DFS 进去只访问它自己）'],
  ['复杂度', '邻接表下每个点访问一次、每条边被两端各看一次，$O(n + m)$；空间 $O(n + m)$'],
])}`,
      inputFormat:
        '第一行两个整数 `n` 和 `m`（`1 ≤ n ≤ 200`，`0 ≤ m ≤ 1000`），顶点编号从 **1 开始**。\n\n' +
        '接下来 `m` 行，每行两个整数 `u v`（`1 ≤ u, v ≤ n`），表示一条**无向边**。\n\n' +
        '可能有重边，也可能有自环（`u == v`，自环不影响连通性）。',
      outputFormat:
        '第一行输出一个整数 `k`：连通块的个数。\n\n' +
        '接下来 `k` 行，每行描述一个连通块：把该块内所有顶点编号**从小到大**输出，相邻两个数之间用一个空格分隔。\n\n' +
        '连通块的顺序：按块内**最小编号**从小到大排列（即先输出含点 1 的块，再输出剩下的点里编号最小的那块，以此类推）。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 4\n1 2\n2 3\n3 1\n4 5\n```\n\n**输出**\n\n```\n2\n1 2 3\n4 5\n```\n\n' +
        '点 1、2、3 两两相连构成一个三角形（一个连通块）；点 4 与 5 相连构成另一个连通块。',
      mistakes: mistakesTable([
        ['`visited` 忘记标记', '在环上无限递归，程序栈溢出崩溃（或重复统计，连通块数偏大）', '进入 DFS 的第一行就 `visited[u] = true;`'],
        ['标记写在邻居循环之后', '环上的点会在标记前被再次递归进来，造成重复访问', '先标记，再遍历邻居'],
        ['无向图只加一条边', '连通性判断错误，本来连通的块被拆成两个', '`g[u].push_back(v); g[v].push_back(u);` 两句都要写'],
        ['点编号 1-based / 0-based 混用', '漏掉点 n 或多算点 0，`visited` 数组越界', '统一用 1 到 n，数组开 `n + 1`'],
        ['输出块内顶点时行末多一个空格', '部分评测机严格比对会判错（本站会忽略行尾空格，但真实 OJ 未必）', '用 `if (j > 0) cout << " ";` 控制分隔符'],
      ]),
      tips:
        '- 建议先写死一个"只有一条链"的小数据，手动跟一遍递归，确认每个点只被标记一次。\n' +
        '- 递归深度只有 200 左右，不需要担心栈溢出；等以后遇到 $n$ 很大的图，再考虑把 DFS 改成 BFS 或手写栈。\n' +
        '- 洛谷同类型题目：连通块 / 图的遍历（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int MAXN = 205;
vector<int> g[MAXN];    // 邻接表
bool visited[MAXN];     // 是否访问过
vector<int> comp;       // 当前正在搜索的连通块

void dfs(int u) {
    // TODO: 标记 u 已访问、把 u 加入 comp、对所有未访问的邻居递归调用 dfs
}

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    // TODO: 从 1 到 n 扫描，遇到未访问的点就 comp.clear() 后 dfs(i)，
    //       把块内成员排序后存起来，并统计连通块个数
    // TODO: 先输出连通块个数，再逐行输出每个块（升序、空格分隔）
    return 0;
}
`,
      solution: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int MAXN = 205;
vector<int> g[MAXN];
bool visited[MAXN];
vector<int> comp;

void dfs(int u) {
    visited[u] = true;
    comp.push_back(u);
    for (int v : g[u]) {
        if (!visited[v]) dfs(v);
    }
}

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<vector<int>> all;
    for (int i = 1; i <= n; i++) {
        if (!visited[i]) {
            comp.clear();
            dfs(i);
            sort(comp.begin(), comp.end());
            all.push_back(comp);
        }
    }
    cout << all.size() << endl;
    for (int i = 0; i < (int)all.size(); i++) {
        for (int j = 0; j < (int)all[i].size(); j++) {
            if (j > 0) cout << " ";
            cout << all[i][j];
        }
        cout << endl;
    }
    return 0;
}
`,
      tests: [
        { input: '5 4\n1 2\n2 3\n3 1\n4 5\n', expected: '2\n1 2 3\n4 5\n' },
        { input: '1 0\n', expected: '1\n1\n' },
        { input: '3 0\n', expected: '3\n1\n2\n3\n' },
        { input: '4 4\n1 1\n2 3\n3 2\n2 4\n', expected: '2\n1\n2 3 4\n' },
        {
          input: '7 5\n1 2\n2 3\n3 4\n4 5\n6 7\n',
          expected: '2\n1 2 3 4 5\n6 7\n',
        },
      ],
      hints: [
        '从点 `i` 出发 DFS 能走到的所有点，就构成一个连通块；标记数组防止在环上绕圈。',
        '外层循环 `for (int i = 1; i <= n; i++)` 时，`!visited[i]` 就意味着发现了一个新的连通块。',
        '因为 `i` 从小到大扫，第 `i` 次发现的块最小编号就是 `i`，所以块的输出顺序不用额外处理；但块**内部**要 `sort` 一下。',
      ],
      luoguKeyword: 'DFS 连通块',
      luoguCode: 'P1596',
    }),

    proLesson({
      id: 'p5-3',
      title: 'BFS 最短路',
      difficulty: '中等',
      knowledge: 'BFS 最短路',
      story:
        '**广度优先搜索（BFS）**从起点出发，先看距离 1 的所有点，再看距离 2 的所有点……\n' +
        '像往水里扔石头，波纹一圈一圈往外扩散。\n\n' +
        '正因为"一圈一圈"扩散，BFS 第一次到达某个点时走的边数一定是最少的——' +
        '这就是**无权图最短路**的标准做法。',
      task:
        '读入一张 `n` 个点、`m` 条边的无权无向图和起点 `s`，求 `s` 到每个点的最短距离（经过的边数）；不可达输出 `-1`。',
      lesson: `**一、BFS 的骨架：队列 + 距离数组**

\`\`\`cpp
vector<int> dist(n + 1, -1);   // -1 既表示"还没到达"，又正好是题目要求的不可达输出
queue<int> q;
dist[s] = 0;                   // 起点到自己是 0 步
q.push(s);

while (!q.empty()) {
    int u = q.front();
    q.pop();
    for (int v : g[u]) {
        if (dist[v] == -1) {          // v 第一次被到达
            dist[v] = dist[u] + 1;    // 距离 = 它的来路 + 1
            q.push(v);                // 入队，等它再来扩展别人
        }
    }
}
\`\`\`

**二、为什么第一次到达就是最短？**

这是 BFS 最关键的直觉，值得说清楚：

- 队列是先进先出，而且所有边权都是 1，所以**队列里点的距离值是不减的**（先出队的点距离不可能比后出队的大）。
- 也就是说，BFS 是按距离 $0, 1, 2, 3, \\dots$ 一层一层处理的。
- 当 BFS 第一次碰到点 $v$ 时，一定是沿着"当前距离 $d$ 的点 $u$"扩出来的，得到 $dist[v] = d + 1$。
- 如果存在更短的路径（长度 $d' < d + 1$），那么 $v$ 在距离 $d'$ 的那一层就早该被发现了——
  与"第一次到达"矛盾。所以第一次到达的距离就是最短路。

因为 \`dist[v] == -1\` 这个判断把每个点**只入队一次**，BFS 的复杂度是 $O(n + m)$（邻接表），
而不是像"每个点被反复入队"那样爆炸。

**三、用 dist 代替 visited**

这一题不需要单独的 \`visited\` 数组：\`dist[v] == -1\` 就表示"还没到过"。
一条边权都是 1 的无权图上，BFS 的 \`dist\` 数组同时承担了"访问标记"和"答案存储"两个角色。

${pointsTable([
  ['队列存什么', '存**点编号**（不是距离）。距离从 \`dist[u] + 1\` 推出来'],
  ['入队时机', '在 \`dist[v] == -1\` 成立时（发现即入队），保证每个点只入队一次'],
  ['起点', '\`dist[s] = 0\`，并把 s 入队；起点自己是 0 步'],
  ['自环', '自环让 \`g[u]\` 里出现 u 自己，但 \`dist[u]\` 已经不是 -1，会被直接跳过'],
  ['重边', '同一个邻居被检查多次，但只有第一次能通过 `== -1` 的判断，不影响结果'],
  ['不可达', 'BFS 结束后 \`dist[i]\` 仍是 -1 的点就是不可达，正好按题目要求输出 -1'],
  ['复杂度', '$O(n + m)$ 时间（每个点入队一次、每条边两端各看一次），$O(n)$ 空间'],
])}`,
      inputFormat:
        '第一行三个整数 `n`、`m`、`s`（`1 ≤ n ≤ 200`，`0 ≤ m ≤ 1000`，`1 ≤ s ≤ n`），分别表示**点数**、**边数**和**起点编号**，顶点编号从 **1 开始**。\n\n' +
        '接下来 `m` 行，每行两个整数 `u v`（`1 ≤ u, v ≤ n`），表示一条**无向边**；' +
        '可以把它看成边权都是 1（走一条边算 1 步）。允许重边与自环。',
      outputFormat:
        '输出一行 `n` 个整数：起点 `s` 到点 `1`、点 `2`……点 `n` 的最短距离（步数），相邻两个数之间用**一个空格**分隔。\n\n' +
        '约定：`s` 到自己的距离是 `0`；如果某个点从 `s` 出发**不可达**，该位置输出 `-1`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 5 1\n1 2\n2 3\n3 4\n4 5\n1 5\n```\n\n**输出**\n\n```\n0 1 2 2 1\n```\n\n' +
        '从 1 出发：点 1 自己距离 0；点 2、点 5 与 1 直接相连，距离都是 1；\n' +
        '点 3 走 `1→2→3` 是 2 步；点 4 走 `1→5→4` 只要 2 步（走 `1→2→3→4` 要 3 步，不是最短）。\n\n' +
        '注意点 4 的答案是 2 而不是 3——这正是 BFS 逐层扩展的价值：它找到的一定是最少边数的那条路。',
      mistakes: mistakesTable([
        ['忘记把起点入队（或忘了设 `dist[s] = 0`）', 'BFS 一步都不走，除起点外全是 -1', '先 `dist[s] = 0; q.push(s);` 再进 while'],
        ['把点重复入队', '同一个点被反复扩展，复杂度退化甚至死循环', '只在 `dist[v] == -1` 时入队（发现即入队）'],
        ['无向图只加一条边', '反向走不通，距离偏大甚至变成不可达', '`g[u].push_back(v); g[v].push_back(u);`'],
        ['输出时行末多一个空格', '严格比对的评测机可能判错（本站会忽略行尾空格）', '用 `if (i > 1) cout << " ";` 控制分隔符'],
        ['把 BFS 用在带权图上', '边权不为 1 时"层数"不再等于距离，答案会错', '带权图要用 Dijkstra（本阶段最后一题）'],
      ]),
      tips:
        '- 调试技巧：把 \`dist\` 数组每次出队后打印出来，能直观看到"一层一层扩散"的过程。\n' +
        '- 起点自己就是孤立点（没有任何边）时，只有 `dist[s] = 0`，其余全是 -1，别忘了这种边界。\n' +
        '- 洛谷同类型题目：BFS 最短路 / 迷宫最短路（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m, s;
    cin >> n >> m >> s;
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    // TODO: 定义 dist 数组（初值 -1），dist[s] = 0，把 s 入队
    // TODO: 用 queue 做 BFS：出队 u，对每个邻居 v，若 dist[v] == -1 则 dist[v] = dist[u] + 1 并让 v 入队
    // TODO: 按格式输出 dist[1..n]（相邻数字用一个空格分隔，不可达输出 -1）
    return 0;
}
`,
      solution: `#include <iostream>
#include <vector>
#include <queue>
using namespace std;

int main() {
    int n, m, s;
    cin >> n >> m >> s;
    vector<vector<int>> g(n + 1);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> dist(n + 1, -1);
    queue<int> q;
    dist[s] = 0;
    q.push(s);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
    }
    for (int i = 1; i <= n; i++) {
        if (i > 1) cout << " ";
        cout << dist[i];
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        {
          input: '5 5 1\n1 2\n2 3\n3 4\n4 5\n1 5\n',
          expected: '0 1 2 2 1\n',
        },
        { input: '4 1 2\n1 2\n', expected: '1 0 -1 -1\n' },
        { input: '1 0 1\n', expected: '0\n' },
        { input: '3 4 1\n1 1\n1 2\n1 2\n2 3\n', expected: '0 1 2\n' },
        { input: '4 2 3\n3 3\n1 2\n', expected: '-1 -1 0 -1\n' },
      ],
      hints: [
        '用一个 `dist` 数组就够了：`-1` 表示还没到达，第一次被扩展到时写入 `dist[u] + 1`。',
        '队列里存的是点编号；用 `queue<int>`，别忘了先 `dist[s] = 0; q.push(s);`。',
        '只有在 `dist[v] == -1` 时才入队，这样每个点只入队一次，复杂度才是 $O(n+m)$。',
      ],
      luoguKeyword: 'BFS 最短路',
      luoguCode: 'P1443',
    }),

    proLesson({
      id: 'p5-4',
      title: '拓扑排序',
      difficulty: '中等',
      knowledge: '拓扑排序',
      story:
        '选课系统里，课程之间有先修关系：学「数据结构」之前必须先学「程序设计」。\n\n' +
        '把课程看成点、先修关系看成有向边，就得到一张**有向图**；' +
        '把这些点排成一个线性顺序，使得每条边的起点都排在终点前面——这就是**拓扑排序**。\n' +
        '如果图里存在环（A 要求先学 B、B 又要求先学 A），那就无解。',
      task:
        '读入一张 `n` 个点、`m` 条**有向边**的图，输出它的拓扑序；如果无解（图中有环）输出 `-1`。\n\n' +
        '如果存在多个合法拓扑序，输出**字典序最小**的那一个，保证答案唯一。',
      lesson: `**一、Kahn 算法：不断摘掉"入度为 0"的点**

入度（in-degree）指有多少条边指向这个点。在选课场景里，入度为 0 表示"没有任何先修要求"，现在就能学。

\`\`\`cpp
// 建图时顺便统计入度
g[u].push_back(v);
indeg[v]++;

priority_queue<int, vector<int>, greater<int>> pq;   // 小根堆：保证字典序最小
for (int i = 1; i <= n; i++) {
    if (indeg[i] == 0) pq.push(i);
}

vector<int> order;
while (!pq.empty()) {
    int u = pq.top();     // 取出当前"可以学"的、编号最小的点
    pq.pop();
    order.push_back(u);   // 放进答案
    for (int v : g[u]) {
        indeg[v]--;                    // u 已经处理完，它对 v 的"要求"消失了
        if (indeg[v] == 0) pq.push(v); // v 的先修条件全部满足，可以学了
    }
}

if ((int)order.size() < n) cout << -1 << endl;   // 有环 → 无解
\`\`\`

**二、为什么是对的**

- 任何有向无环图（DAG）里一定存在入度为 0 的点（否则沿着入边一直往回走会绕成环）。
- 取出 $u$ 后，所有"以 $u$ 为起点"的边都不再构成约束，于是把这些边的终点入度减 1。
  这一步恰好等价于"把 $u$ 从图里删掉"。
- 每轮取出的点，其所有前驱都已经被取出过，所以顺序合法。

**三、怎么判断有环**

如果图里有环，环上的点永远等不到自己的入度变成 0（环内每个点都至少有一条来自环内的入边），
它们会一直留在图里。于是：

> 处理结束后，如果进入答案序列的点数 \`< n\`，就说明有环，输出 \`-1\`。

这就是"无解"判定，**千万别漏**。

**四、为什么用优先队列能拿到字典序最小**

每一轮我们把"当前所有入度为 0 的点"都放进容器，从中选编号最小的那个，就能让答案序列在每一位上尽量小
（字典序最小的贪心：能放小的就先放小的，不会影响后面还有没有解）。普通 \`queue\` 只保证合法，不保证字典序。

${pointsTable([
  ['入度表怎么建', '读入每条边 `u -> v` 时 `indeg[v]++`（同一对点重复出现就重复计数）'],
  ['入度为 0 的点', '没有任何先修要求，随时可以输出，全部丢进优先队列'],
  ['松弛（删点）', '处理完 u 后，对它每条出边的终点 `indeg[v]--`，减到 0 就入队'],
  ['有环判定', '最终 `order.size() < n` → 输出 -1'],
  ['重边的影响', '重边让 `indeg[v]` 多加几次，但 u 处理时也会对应地多减几次，结果仍然正确'],
  ['自环', '自环 `u -> u` 使 `indeg[u]` 至少为 1，u 永远进不了队列 → 被判为有环（也确实是环）'],
  ['复杂度', '每个点入队出队一次、每条边被检查一次，优先队列 $O((n+m)\\log n)$；空间 $O(n+m)$'],
])}`,
      inputFormat:
        '第一行两个整数 `n` 和 `m`（`1 ≤ n ≤ 200`，`0 ≤ m ≤ 1000`），顶点编号从 **1 开始**。\n\n' +
        '接下来 `m` 行，每行两个整数 `u v`（`1 ≤ u, v ≤ n`），表示一条**有向边** `u → v`，含义是"`u` 必须排在 `v` 前面"。\n\n' +
        '可能有多条完全相同的边，也可能出现自环（`u == v`）。',
      outputFormat:
        '如果这张有向图没有环：输出一行 `n` 个整数，表示**字典序最小**的拓扑序，相邻两个数之间用**一个空格**分隔。\n\n' +
        '如果图中有环（不存在任何合法拓扑序）：只输出一行 `-1`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n6 6\n1 2\n1 3\n2 4\n3 4\n4 5\n6 5\n```\n\n**输出**\n\n```\n1 2 3 4 6 5\n```\n\n' +
        '初始入度为 0 的点是 1 和 6（编号小的是 1），所以先输出 1；\n' +
        '之后 2、3 变成入度 0，先输出 2 再输出 3；接着 4 可以输出；\n' +
        '此时队列里只剩 6，于是先输出 6，最后输出 5。逐位取最小的结果就是 `1 2 3 4 6 5`。',
      mistakes: mistakesTable([
        ['忘了建入度表（或只统计没减）', '第一轮一个点都取不出来，答案为空', '读边时 `indeg[v]++`，处理 u 时对出边终点 `indeg[v]--`'],
        ['用普通 `queue` 却要求"字典序最小"', '输出合法但不是字典序最小，与答案不符', '换 `priority_queue<int, vector<int>, greater<int>>`（小根堆）'],
        ['漏掉"有环输出 -1"的判定', '有环时答案长度不足 n，输出的拓扑序不完整却被当成正确', '最后判断 `(int)order.size() < n` 就输出 -1'],
        ['把无向边当成有向边读（或反过来）', '入度统计全错，答案直接乱掉', '本题是**有向边** `u -> v`，只加 `g[u].push_back(v)`，不要加反向'],
        ['`indeg[v]--` 写成 `indeg[u]--`', '入度表被改错，有的点永远进不了队列，误判成有环', '减的是**出边终点**的入度'],
      ]),
      tips:
        '- 先用最朴素的队列把"能排出来 / 判环"写对，再换成小根堆满足字典序最小的要求。\n' +
        '- 边界情况值得都试一遍：`m = 0`（全部孤立，答案是 `1 2 ... n`）、只有一条链（答案就是链的顺序）、三角形环（输出 -1）。\n' +
        '- 洛谷同类型题目：拓扑排序 / 课程表（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <vector>
#include <queue>
#include <functional>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);      // 出边表
    vector<int> indeg(n + 1, 0);       // 入度表
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);             // 有向边 u -> v，只加一个方向
        indeg[v]++;                    // v 的入度加一
    }
    // TODO: 把所有入度为 0 的点放进优先队列（小根堆：priority_queue<int, vector<int>, greater<int>>）
    // TODO: 反复取出队首 u 加入答案，并对 u 的每个出边终点 v 执行 indeg[v]--，减到 0 就入队
    // TODO: 若答案长度不足 n 则输出 -1，否则按格式输出答案（空格分隔）
    return 0;
}
`,
      solution: `#include <iostream>
#include <vector>
#include <queue>
#include <functional>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    vector<int> indeg(n + 1, 0);
    for (int i = 0; i < m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        indeg[v]++;
    }
    priority_queue<int, vector<int>, greater<int>> pq;
    for (int i = 1; i <= n; i++) {
        if (indeg[i] == 0) pq.push(i);
    }
    vector<int> order;
    while (!pq.empty()) {
        int u = pq.top();
        pq.pop();
        order.push_back(u);
        for (int v : g[u]) {
            indeg[v]--;
            if (indeg[v] == 0) pq.push(v);
        }
    }
    if ((int)order.size() < n) {
        cout << -1 << endl;
    } else {
        for (int i = 0; i < (int)order.size(); i++) {
            if (i > 0) cout << " ";
            cout << order[i];
        }
        cout << endl;
    }
    return 0;
}
`,
      tests: [
        {
          input: '6 6\n1 2\n1 3\n2 4\n3 4\n4 5\n6 5\n',
          expected: '1 2 3 4 6 5\n',
        },
        { input: '4 4\n1 2\n1 2\n2 3\n3 4\n', expected: '1 2 3 4\n' },
        { input: '3 3\n1 2\n2 3\n3 1\n', expected: '-1\n' },
        { input: '3 0\n', expected: '1 2 3\n' },
        { input: '2 2\n1 2\n2 2\n', expected: '-1\n' },
      ],
      hints: [
        '入度为 0 的点表示"没有任何前置要求"，可以立刻放进答案；删掉它时，把它所有出边终点的入度减 1。',
        '要字典序最小，就把"当前可用的点"放进小根堆 `priority_queue<int, vector<int>, greater<int>>`，每次取编号最小的。',
        '处理完后如果进过答案的点不足 `n` 个，说明图里有环，输出 `-1`。',
      ],
      luoguKeyword: '拓扑排序',
      luoguCode: 'B3644',
    }),

    proLesson({
      id: 'p5-5',
      title: '最小生成树',
      difficulty: '困难',
      knowledge: '最小生成树',
      story:
        '要在 n 个城市之间修路，让任意两个城市都能互相到达，并且总造价最小。\n\n' +
        '把城市看成点、候选道路看成带权边，这就是**最小生成树（MST）**问题：' +
        '从所有边里挑出 $n-1$ 条，既把整张图连成一棵树，又让边权之和最小。',
      task:
        '读入一张 `n` 个点、`m` 条带权无向边，求最小生成树的边权之和；如果图不连通（不存在生成树）输出 `-1`。',
      lesson: `**一、Kruskal 的做法：按边权从小到大贪心**

\`\`\`cpp
struct Edge { int u, v, w; };
bool cmp(const Edge &a, const Edge &b) { return a.w < b.w; }

sort(e, e + m, cmp);              // ① 所有边按权值升序

for (int i = 0; i < m && cnt < n - 1; i++) {
    int ru = find(e[i].u), rv = find(e[i].v);
    if (ru == rv) continue;       // ② 两端已经连通 → 加这条边会成环，跳过
    fa[ru] = rv;                  // ③ 合并两个集合，这条边被选入
    total += e[i].w;
    cnt++;
}
if (cnt < n - 1) cout << -1;      // ④ 选不够 n-1 条边 → 图不连通
else cout << total;
\`\`\`

**二、贪心为什么是对的**

核心直觉（切分性质）：**把当前所有点分成两个非空集合，横跨这两个集合的边里权值最小的那条，一定属于某棵最小生成树。**

- Kruskal 每次拿到的"当前最小、且两端属于不同连通块"的边，正是某个切分里最便宜的横跨边，
  所以选它不会错过最优解；
- 反过来，如果一条边的两端已经连通还强行加入，就会形成一个环，
  而这个环上一定有一条权值不大于它的边（因为它已经是当前剩下的最小边），
  把它换掉只会更优，所以**跳过永远不会更差**。

**三、并查集：快速问"这两个点是否已经连通"**

\`\`\`cpp
int fa[205];
int find(int x) {
    if (fa[x] == x) return x;   // 自己是自己集合的代表
    fa[x] = find(fa[x]);        // 路径压缩：顺手把链拉平
    return fa[x];
}
// 初始化：for (int i = 1; i <= n; i++) fa[i] = i;
// 合并：fa[find(u)] = find(v);
\`\`\`

路径压缩之后，\`find\` 的均摊复杂度几乎是常数（反阿克曼级别），所以"判环"这一步非常便宜。

**四、几个细节**

- **选够 $n-1$ 条边就可以立刻停**：生成树只要 $n-1$ 条边，后面的边再小也没用了。
- **$n = 1$ 时答案为 0**：一个点不需要任何边，此时 $n - 1 = 0$，循环一次都不会进。
- **自环永远会被跳过**：自环两端是同一个点，\`find(u) == find(v)\` 必然成立，正好被"成环"判断挡掉。
- **重边只会多检查几次**：较小的那条先被选上，较大的那条之后会因为两端已连通而被跳过。

${pointsTable([
  ['第一步', '把 m 条边按权值 `w` 从小到大排序（$O(m\\log m)$）'],
  ['第二步', '依次考虑每条边，用并查集判断两端是否已经在同一个连通块'],
  ['不连通判定', '选到的边少于 `n - 1` 条，说明图不连通，输出 -1'],
  ['$n = 1$ 的特判', '不需要边，答案 0，不用单独写 `if` 也能自然得到 0'],
  ['复杂度', '排序 $O(m\\log m)$ + 并查集 $O(m\\,\\alpha(n))$，总体 $O(m\\log m)$；空间 $O(n+m)$'],
  ['对比 Prim', 'Prim 是"从一个点开始不断加最近的邻居"，稠密图用邻接矩阵 $O(n^2)$；Kruskal 更依赖边排序，稀疏图更常用'],
])}`,
      inputFormat:
        '第一行两个整数 `n` 和 `m`（`1 ≤ n ≤ 200`，`0 ≤ m ≤ 1000`），顶点编号从 **1 开始**。\n\n' +
        '接下来 `m` 行，每行三个整数 `u v w`（`1 ≤ u, v ≤ n`，`1 ≤ w ≤ 10000`），表示一条连接 `u` 与 `v` 的**无向边**，边权为 `w`。\n\n' +
        '可能有重边（同一条边出现多次，权值可能不同），也可能有自环（`u == v`）。',
      outputFormat:
        '输出一行一个整数：最小生成树的**边权之和**。\n\n' +
        '如果图**不连通**（选不出包含全部 n 个点的生成树），输出 `-1`。\n\n' +
        '特判约定：`n == 1` 时不需要任何边，答案为 `0`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 7\n1 2 1\n1 3 5\n2 3 2\n2 4 6\n3 4 3\n4 5 4\n3 5 9\n```\n\n**输出**\n\n```\n10\n```\n\n' +
        '边权从小到大是 1(1-2)、2(2-3)、3(3-4)、4(4-5)、5(1-3)、6(2-4)、9(3-5)。\n' +
        '前四条边把 5 个点全部连通（此时已经有 4 = n-1 条边），总权值 `1+2+3+4 = 10`，直接结束。',
      mistakes: mistakesTable([
        ['忘记按边权排序', '贪心顺序错乱，得到的不是最小生成树', '先 `sort(e, e + m, cmp)`（按 `w` 升序）再选边'],
        ['用普通数组记"已访问点"代替并查集', '无法判断"两个点是否已在同一棵树里"，会选出环', '用并查集 `find(u) == find(v)` 判环'],
        ['并查集忘记初始化', '`fa[i]` 全是 0，所有点被当成同一个集合，一条边都选不上', '`for (int i = 1; i <= n; i++) fa[i] = i;`'],
        ['合并时写成 `fa[u] = v`', '应该合并的是两个集合的**代表元**，直接改 `fa[u]` 会破坏树结构', '`fa[find(u)] = find(v);`'],
        ['不连通时忘了输出 -1', '直接输出部分边权和，或者输出 0，与答案不符', '最后判断 `cnt < n - 1` 就输出 -1'],
      ]),
      tips:
        '- 写完后用"三角形 + 一条很长的最小边"这类数据自查：看是否真的跳过了会成环的边。\n' +
        '- 边权都是正数，所以自环一定不会被选进 MST（加了只会让总和变大），程序里靠判环自动跳过。\n' +
        '- 洛谷同类型题目：最小生成树 / 并查集（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 205;
const int MAXM = 1005;

struct Edge {
    int u, v, w;
};

Edge e[MAXM];
int fa[MAXN];

bool cmp(const Edge &a, const Edge &b) {
    return a.w < b.w;
}

int find(int x) {
    // TODO: 并查集查找 + 路径压缩：fa[x] == x 时返回 x，否则递归查找并把 fa[x] 更新成结果
    return x;
}

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        cin >> e[i].u >> e[i].v >> e[i].w;
    }
    // TODO: 初始化并查集 fa[i] = i
    // TODO: 把边按权值升序排序
    // TODO: 依次考虑每条边：两端不在同一集合就合并并累加边权，直到选够 n - 1 条边
    // TODO: 输出最小生成树总权值；若选不够 n - 1 条边则输出 -1
    return 0;
}
`,
      solution: `#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 205;
const int MAXM = 1005;

struct Edge {
    int u, v, w;
};

Edge e[MAXM];
int fa[MAXN];

bool cmp(const Edge &a, const Edge &b) {
    return a.w < b.w;
}

int find(int x) {
    if (fa[x] == x) return x;
    fa[x] = find(fa[x]);
    return fa[x];
}

int main() {
    int n, m;
    cin >> n >> m;
    for (int i = 0; i < m; i++) {
        cin >> e[i].u >> e[i].v >> e[i].w;
    }
    for (int i = 1; i <= n; i++) fa[i] = i;
    sort(e, e + m, cmp);
    int total = 0;
    int cnt = 0;
    for (int i = 0; i < m && cnt < n - 1; i++) {
        int ru = find(e[i].u);
        int rv = find(e[i].v);
        if (ru == rv) continue;
        fa[ru] = rv;
        total += e[i].w;
        cnt++;
    }
    if (cnt < n - 1) cout << -1 << endl;
    else cout << total << endl;
    return 0;
}
`,
      tests: [
        {
          input: '5 7\n1 2 1\n1 3 5\n2 3 2\n2 4 6\n3 4 3\n4 5 4\n3 5 9\n',
          expected: '10\n',
        },
        {
          input: '4 5\n1 2 1\n2 3 2\n3 4 3\n1 4 10\n2 4 4\n',
          expected: '6\n',
        },
        { input: '4 2\n1 2 1\n3 4 5\n', expected: '-1\n' },
        { input: '1 0\n', expected: '0\n' },
        {
          input: '3 4\n1 2 5\n1 2 1\n2 2 3\n2 3 2\n',
          expected: '3\n',
        },
      ],
      hints: [
        'Kruskal 的两步：先把所有边按权值排序，再依次判断"这条边的两端是否已经连通"。',
        '判断连通用并查集：`find(u) == find(v)` 说明加这条边会成环，直接跳过；否则合并两个集合并累加边权。',
        '选够 `n - 1` 条边就能连通全部 n 个点；如果扫完所有边还不到 `n - 1` 条，说明图不连通，输出 `-1`。',
      ],
      luoguKeyword: '最小生成树 Kruskal',
      luoguCode: 'P3366',
    }),

    proLesson({
      id: 'p5-6',
      title: '单源最短路',
      difficulty: '困难',
      knowledge: 'Dijkstra',
      story:
        '这一题的图**带边权**：走不同的路代价不同（距离、时间、花费……），求从一个源点出发到所有点的最小代价。\n\n' +
        'BFS 只能处理边权都是 1 的图，带权图要用 **Dijkstra**：每次都从"还没最终确定的点"里挑出当前距离最小的那个，' +
        '锁定它的最短路，再用它去更新别人。',
      task:
        '读入一张 `n` 个点、`m` 条**有向带权边**的图和源点 `s`，求 `s` 到每个点的最短距离；不可达输出 `-1`。',
      lesson: `**一、Dijkstra 的骨架（邻接矩阵，$O(n^2)$）**

\`\`\`cpp
const int INF = 1000000000;      // 10^9：足够大，加上边权也不会溢出 int
int w[205][205];                 // 邻接矩阵存边权
int d[205];                      // 源点到各点的当前最短距离
bool used[205];                  // 是否已经"锁定"

d[s] = 0;
for (int iter = 1; iter <= n; iter++) {
    // ① 在未锁定的点里取 d 最小的
    int u = -1;
    for (int i = 1; i <= n; i++) {
        if (!used[i] && (u == -1 || d[i] < d[u])) u = i;
    }
    if (u == -1 || d[u] == INF) break;   // 剩下的点全部不可达，提前结束
    used[u] = true;                      // ② 锁定 u 的最短路
    for (int v = 1; v <= n; v++) {       // ③ 用 u 松弛所有邻居
        if (w[u][v] < INF && d[u] + w[u][v] < d[v]) {
            d[v] = d[u] + w[u][v];
        }
    }
}
\`\`\`

**二、为什么"取最小的未访问点"就能锁定它**

设当前未锁定的点里 $d$ 最小的是 $u$，值为 $d[u]$。假设真实最短路更短，那它一定经过某个还没锁定的点 $x$，
而任何一条经过 $x$ 的路径长度都至少是 $d[x] \\ge d[u]$（这就是"$u$ 最小"的含义），
再加上后面的边权（**本题边权都为正**，$\\ge 1$），只会更长，矛盾。所以 $d[u]$ 已经是最终答案，可以放心锁定。

**三、为什么不能处理负权边**

上面的推理有一个致命的依赖：**路径延长不会让代价变小**。
如果存在负权边，"经过 $x$ 的路径"可能比 $d[x]$ 还短，锁定 $u$ 就不再安全，
Dijkstra 会给出错误答案（负权图要用 Bellman-Ford / SPFA）。

**四、本题的实现细节**

- 矩阵初始化成全 \`INF\`，再令 \`w[i][i] = 0\`；每读一条边做 \`w[u][v] = min(w[u][v], c)\`，**重边自动只留最小的一条**。
- 自环 \`u == v\` 因为 \`w[u][u] = 0\` 而永远不会让距离变小，等于自动忽略。
- 松弛前判断 \`w[u][v] < INF\`：不加这个判断，\`INF + w\` 虽然不会溢出（用 $10^9$ 做 INF 很安全），
  但会让"不可达"的点被错误地写上一个大数，最后输出时要靠 \`d[i] == INF\` 判断就很别扭。
- 输出时把 \`d[i] == INF\` 的位置输出成 \`-1\`。

${pointsTable([
  ['为什么外层循环 n 次', '每次锁定一个点，最多锁定 n 个；也可以写成 `while (true)` 配合"没有可用点就 break"'],
  ['取最小点', '在 `!used[i]` 的点里线性扫描，$O(n)$；这一步是 $O(n^2)$ 版本的全部代价来源'],
  ['松弛条件', '`d[u] + w[u][v] < d[v]`；严格小于（相等不用更新）'],
  ['used 数组不能省', '不记录锁定状态，同一轮可能反复取到已经被确定的点，导致重复松弛甚至错误'],
  ['重边', '邻接矩阵里用 `min` 覆盖，只保留最小权值'],
  ['自环', '`w[u][u] = 0` 使自环永远不会改进距离，天然被忽略'],
  ['复杂度', '$O(n^2)$ 时间（$n=200$ 时约 4 万次操作），$O(n^2)$ 空间；边数多大都不影响这一步'],
])}`,
      inputFormat:
        '第一行三个整数 `n`、`m`、`s`（`1 ≤ n ≤ 200`，`0 ≤ m ≤ 1000`，`1 ≤ s ≤ n`），分别表示**点数**、**边数**和**源点编号**，顶点编号从 **1 开始**。\n\n' +
        '接下来 `m` 行，每行三个整数 `u v w`（`1 ≤ u, v ≤ n`，`1 ≤ w ≤ 10000`），表示一条**有向边** `u → v`，边权为 `w`（从 u 走到 v 的代价）。\n\n' +
        '注意：两点之间**可能有多条边**，请只保留**权值最小**的那一条；也可能出现自环（`u == v`），自环不影响最短路。',
      outputFormat:
        '输出一行 `n` 个整数：源点 `s` 到点 `1`、点 `2`……点 `n` 的最短距离，相邻两个数之间用**一个空格**分隔。\n\n' +
        '约定：`s` 到自己的距离为 `0`；如果某个点从 `s` 出发**不可达**，该位置输出 `-1`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 8 1\n1 2 10\n1 5 5\n2 3 1\n2 5 2\n3 4 4\n4 1 7\n5 3 3\n5 4 9\n```\n\n**输出**\n\n```\n0 10 8 12 5\n```\n\n' +
        '最短路径分别是：到 2 走 `1→2`（10）；到 5 走 `1→5`（5）；\n' +
        '到 3 走 `1→5→3`（5+3=8，比 `1→2→3` 的 11 更短）；到 4 走 `1→5→3→4`（5+3+4=12，比 `1→5→4` 的 14 更短）。',
      mistakes: mistakesTable([
        ['忘记 `used` 数组（或忘了标记）', '同一个点被反复取出更新，答案可能错，复杂度也会退化', '取出最小点后立刻 `used[u] = true;`，选点时只考虑 `!used[i]`'],
        ['矩阵初始化时忘了 `w[i][i] = 0`', '起点到自己的距离不是 0，后面的松弛全部偏大', '初始化后显式写 `for (i) w[i][i] = 0;`'],
        ['重边直接覆盖而不是取最小', '先读到大边、后读到小边就对了，反过来就错了（取决于输入顺序）', '写成 `if (c < w[u][v]) w[u][v] = c;`'],
        ['漏判不可达就输出 INF', '输出一堆 1000000000，与题面要求的 -1 不符', '输出时 `cout << (d[i] == INF ? -1 : d[i]);`'],
        ['用 Dijkstra 处理负权边', '贪心前提被破坏，答案错误（甚至死循环）', '本题边权全为正；负权图要用 Bellman-Ford / SPFA'],
      ]),
      tips:
        '- 建议先在纸上手算一遍样例，把每次"选中的点"和更新后的 `d` 数组记下来，再对照程序的中间输出。\n' +
        '- 本题的 $O(n^2)$ 版本已经足够（$n \\le 200$）；等数据到 $10^5$ 级别，再学用堆优化的 $O(m\\log n)$ 写法。\n' +
        '- 洛谷同类型题目：单源最短路 / Dijkstra（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 205;
const int INF = 1000000000;   // 取 10^9：远大于最大可能距离，且加上边权不会溢出 int

int w[MAXN][MAXN];   // 邻接矩阵：w[u][v] 表示 u -> v 的最小边权
int d[MAXN];         // 源点到各点的当前最短距离
bool used[MAXN];     // 该点的最短路是否已经确定

int main() {
    int n, m, s;
    cin >> n >> m >> s;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) w[i][j] = INF;
        w[i][i] = 0;               // 自己到自己代价为 0
    }
    for (int i = 0; i < m; i++) {
        int u, v, c;
        cin >> u >> v >> c;
        if (c < w[u][v]) w[u][v] = c;   // 重边只保留最小的
    }
    // TODO: 初始化 d[] 为 INF，并令 d[s] = 0
    // TODO: 重复 n 次：在未使用（!used）的点里挑出 d 最小的点 u（没有可用点就提前结束），
    //       标记 used[u] = true，再对所有 v 用 d[u] + w[u][v] 尝试更新 d[v]
    // TODO: 按格式输出 d[1..n]（不可达输出 -1，相邻数字用一个空格分隔）
    return 0;
}
`,
      solution: `#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 205;
const int INF = 1000000000;

int w[MAXN][MAXN];
int d[MAXN];
bool used[MAXN];

int main() {
    int n, m, s;
    cin >> n >> m >> s;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) w[i][j] = INF;
        w[i][i] = 0;
    }
    for (int i = 0; i < m; i++) {
        int u, v, c;
        cin >> u >> v >> c;
        if (c < w[u][v]) w[u][v] = c;
    }
    for (int i = 1; i <= n; i++) d[i] = INF;
    d[s] = 0;
    for (int iter = 1; iter <= n; iter++) {
        int u = -1;
        for (int i = 1; i <= n; i++) {
            if (!used[i] && (u == -1 || d[i] < d[u])) u = i;
        }
        if (u == -1 || d[u] == INF) break;
        used[u] = true;
        for (int v = 1; v <= n; v++) {
            if (w[u][v] < INF && d[u] + w[u][v] < d[v]) {
                d[v] = d[u] + w[u][v];
            }
        }
    }
    for (int i = 1; i <= n; i++) {
        if (i > 1) cout << " ";
        if (d[i] == INF) cout << -1;
        else cout << d[i];
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        {
          input:
            '5 8 1\n1 2 10\n1 5 5\n2 3 1\n2 5 2\n3 4 4\n4 1 7\n5 3 3\n5 4 9\n',
          expected: '0 10 8 12 5\n',
        },
        { input: '3 1 1\n1 2 4\n', expected: '0 4 -1\n' },
        { input: '1 0 1\n', expected: '0\n' },
        {
          input: '4 5 1\n1 2 10\n1 2 3\n2 2 1\n2 3 5\n1 3 20\n',
          expected: '0 3 8 -1\n',
        },
        { input: '3 2 2\n1 3 5\n3 1 2\n', expected: '-1 0 -1\n' },
      ],
      hints: [
        '用一个 `used` 数组记录"哪些点的最短路已经确定"：每次在 `!used` 的点里挑 `d` 最小的锁定它。',
        '锁定 `u` 之后，用 `d[u] + w[u][v]` 去尝试更新所有 `v` 的距离——这一步叫"松弛"。',
        '如果某一轮找不到 `!used` 且 `d != INF` 的点，说明剩下的点都不可达，可以提前跳出；输出时把 `INF` 打印成 `-1`。',
      ],
      luoguKeyword: 'Dijkstra',
      luoguCode: 'P4779',
    }),
  ],
};
