/**
 * 阶段七 · 进阶技巧与综合（6 道题）
 *
 * 这是 Pro 靶场的最后一阶段：前面几个阶段把"数据结构"和"算法思想"分别讲了一遍，
 * 这一阶段把它们收束成 4 类最常用的"进阶工具"，再配一道贪心综合题。
 *
 *   - 数论：快速幂（二进制拆分）、线性筛（最小质因子）、gcd 与扩展欧几里得
 *   - 数据结构：树状数组（lowbit）、线段树（递归区间划分）
 *   - 贪心综合：区间调度（按右端点排序 + 交换论证）
 *
 * 这一阶段的题目基本都在回答同一个问题：**怎么把 $O(n)$ 或 $O(n^2)$ 的暴力，
 * 优化到 $O(\\log n)$ 或 $O(n \\log n)$**。每一题都要求写清楚复杂度与边界。
 */

import type { StageData } from '../../types/problem';
import { mistakesTable, pointsTable, proLesson } from '../lesson.ts';

export const STAGE_7: StageData = {
  stage: 7,
  title: '阶段七 · 进阶技巧与综合',
  subtitle: '快速幂、线性筛、扩展欧几里得、树状数组、线段树与贪心',
  summary:
    '最后一阶段把前面学的东西收束成 4 类最常用的"进阶工具"，再加一道贪心综合题。\n\n' +
    '- **快速幂**：把指数拆成二进制，用 $O(\\log n)$ 次乘法算出 $a^b \\bmod p$。\n' +
    '- **线性筛**：每个合数只被它的最小质因子筛掉一次，$O(n)$ 求出所有素数。\n' +
    '- **扩展欧几里得**：在求 $\\gcd(a,b)$ 的同时解出 $ax + by = \\gcd(a,b)$。\n' +
    '- **树状数组**：用 `lowbit` 把前缀和与单点修改都做到 $O(\\log n)$。\n' +
    '- **线段树**：把区间递归地拆成节点，建树 $O(n)$、单点修改与区间查询 $O(\\log n)$。\n' +
    '- **区间调度**：按右端点排序的贪心，是"交换论证"最经典的例子。\n\n' +
    '这一阶段的核心问题是同一个：**怎么把 $O(n)$、$O(n^2)$ 的暴力优化到 $O(\\log n)$ 或 $O(n \\log n)$**。' +
    '每道题都请你顺手算一遍复杂度，并想清楚"边界"（$n = 0$、$n = 1$、答案为空时）会怎样。',
  problems: [
    proLesson({
      id: 'p7-1',
      title: '快速幂',
      difficulty: '中等',
      knowledge: '二进制拆分',
      story:
        '数论题里经常要算 $a^b$ 对某个大质数取模的结果。\n\n' +
        '如果老老实实连乘 $b$ 次，$b = 10^{18}$ 时一辈子也算不完——' +
        '但把指数 $b$ 写成二进制，只需要大约 60 次乘法就能算出来。这就是**快速幂**。',
      task:
        '给定整数 `a` 和非负整数 `b`，求 $a^b \\bmod (10^9+7)$。\n\n' +
        '模数是固定的 $10^9+7 = 1000000007$（质数，很多计数题都用它）。',
      lesson: `**暴力做法**：把 a 连乘 b 次，复杂度 $O(b)$。$b = 10^{18}$ 时不可能完成，
而且中间结果会迅速超过 long long 的范围，早就溢出成垃圾值了。

**二进制拆分**：任何正整数都能唯一地写成若干个 2 的幂之和——那就是它的二进制表示。例如

\`\`\`text
b = 13 = (1101)₂ = 8 + 4 + 1
所以  a^13 = a^8 × a^4 × a^1
\`\`\`

注意 a^1、a^2、a^4、a^8 …… 这一串数里**每一项都是前一项的平方**，
只要顺序算下去，$\\log b$ 个数就能全部得到。于是求 $a^b$ 变成了：
"看 b 的二进制里哪些位是 1，把对应那几项乘起来"。

\`\`\`cpp
long long power(long long a, long long b) {
    const long long MOD = 1000000007LL;
    long long ans = 1;
    a %= MOD;                              // 底数先压进 [0, MOD)
    while (b > 0) {
        if (b & 1) ans = ans * a % MOD;    // 最低位是 1：把当前的 a^(2^i) 乘进答案
        a = a * a % MOD;                   // 平方，得到 a^(2^(i+1))，给下一位用
        b >>= 1;                           // 右移一位，处理下一位
    }
    return ans;
}
\`\`\`

${pointsTable([
  ['答案初值 `ans = 1`', '1 是乘法单位元。写成 0 的话结果永远是 0'],
  ['`b & 1` 取最低位', '等价于 `b % 2 == 1`（本题 b ≥ 0，两种写法都对）'],
  ['`a = a * a % MOD` 的位置', '一定要放在 `if` **外面**：不管 b 这一位是不是 1，下一位的权重都是当前位的两倍，底数必须一直平方下去'],
  ['`b >>= 1`', '右移一位就是丢掉最低位，等价于 `b /= 2`；漏写这一句会死循环'],
  ['边乘边取模', '`ans * a` 最大约 $(10^9)^2 = 10^{18}$，long long 上限约 $9.2 \\times 10^{18}$，安全；但连乘两次不取模就爆了'],
  ['取模优先级', '`*` 和 `%` 同级、从左往右算，所以 `ans * a % MOD` 就是 `(ans * a) % MOD`，不用加括号也不会错'],
])}

**为什么是 $O(\\log b)$**：每轮 b 都右移一位，循环次数是 $\\lfloor \\log_2 b \\rfloor + 1$。
$b = 10^{18}$ 时约 60 轮——比 $O(b)$ 快了十几个数量级。空间只用几个变量，$O(1)$。

**取模为什么要防溢出**：取模前的乘积是两个 $< 10^9+7$ 的数相乘，最大约 $10^{18}$。
这个值放不进 32 位的 \`int\`（上限约 $2.1 \\times 10^9$），所以**底数、指数、答案都要用 \`long long\`**，
并且每一步乘法后立刻取模，保证参与下一次乘法的数始终小于 $10^9+7$。

**关于 $b = 0$**：此时 \`while\` 一次也不进，直接返回 \`ans = 1\`，正好是 $a^0 = 1$。
（本题保证 $a \\ge 1$，所以不会遇到 $0^0$ 这种有争议的情况。）`,
      inputFormat:
        '一行两个整数 `a` 和 `b`（`1 ≤ a ≤ 10^9`，`0 ≤ b ≤ 10^{18}`），用一个空格分隔。',
      outputFormat: '输出一行一个整数：$a^b \\bmod (10^9+7)$ 的结果，范围在 `0` 到 `10^9+6` 之间。',
      mistakes: mistakesTable([
        ['用 `int` 存底数和答案', '`ans * a` 约 $10^{18}$，int 装不下；只在中途取一次模也救不回来', '`a`、`b`、`ans` 全用 `long long`，每一次乘法后立刻 `% MOD`'],
        ['把平方写进 `if (b & 1)` 里面', '只有当前位是 1 时才平方，后面所有位都用错了底数', '平方无条件执行，放在 if 外面'],
        ['漏写 `b >>= 1`', 'b 一直不变，死循环（浏览器里会跑到超时）', '每轮循环末尾右移一位'],
        ['`ans` 初值写成 0', '0 乘任何数都是 0，输出恒为 0', '初值必须是 1'],
        ['读 `b` 时用 `int`', '`cin >> b` 读 $10^{18}$ 会失败，b 变成未定义/截断的值', '`long long b; cin >> b;`'],
      ]),
      tips:
        '- 手算验证：`a = 2, b = 13` 时，轮次依次处理 b 的二进制 `1101`，答案是 $2^8 \\times 2^4 \\times 2^1 = 8192$。\n' +
        '- 记住这个模板，它是后面很多数论题（逆元、矩阵快速幂、斐波那契取模）的地基。\n' +
        '- 洛谷同类型题目：快速幂（可在题目页下方的洛谷链接按关键词「快速幂」搜索）。',
      starter: `#include <iostream>
using namespace std;

const long long MOD = 1000000007LL;

int main() {
    long long a, b;
    cin >> a >> b;
    long long ans = 1;
    // TODO: 二进制拆分求 a^b mod MOD
    //       循环里做三件事：b & 1 时把当前底数乘进 ans；底数平方；b >>= 1
    //       注意每次乘法后立刻 % MOD，防止溢出
    cout << ans << endl;
    return 0;
}
`,
      solution: `#include <iostream>
using namespace std;

const long long MOD = 1000000007LL;

int main() {
    long long a, b;
    cin >> a >> b;
    long long ans = 1;
    a %= MOD;
    while (b > 0) {
        if (b & 1) ans = ans * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    cout << ans << endl;
    return 0;
}
`,
      tests: [
        { input: '2 10\n', expected: '1024\n' },
        { input: '5 0\n', expected: '1\n' },
        { input: '1000000000 1000000000\n', expected: '312556845\n' },
        { input: '2 1000000000000000000\n', expected: '719476260\n' },
        { input: '999999999 1000000000000\n', expected: '845958244\n' },
      ],
      hints: [
        '把 b 看成一串二进制位：从最低位开始，每一轮只处理一位。',
        '循环里维护一个"当前底数"，它每一轮都等于上一轮的平方；只有 b 的当前位是 1 时才把它乘进答案。',
        '`ans * a` 最大约 $10^{18}$，所以每一步都要取模，并且类型必须是 `long long`。',
        '`b = 0` 时循环一次都不进，答案就是 1——这正是 $a^0 = 1$。',
      ],
      luoguKeyword: '快速幂',
      luoguCode: 'P1226',
    }),

    proLesson({
      id: 'p7-2',
      title: '线性筛素数',
      difficulty: '困难',
      knowledge: '线性筛（欧拉筛）',
      story:
        '要一次求出 $1 \\sim n$ 里的所有素数，最朴素的办法是对每个数单独试除，但那太慢。\n\n' +
        '埃氏筛已经很快了，可它会对同一个合数重复标记。**线性筛**通过一条小小的 `break` 语句，' +
        '让每个合数只被它的"最小质因子"筛掉一次，把复杂度压到了严格的 $O(n)$。',
      task:
        '给定整数 `n`，求出所有不超过 `n` 的素数。\n\n' +
        '输出两行：第一行是素数个数，第二行是所有素数（从小到大、空格分隔）。',
      lesson: `**试除法**：对每个数从 2 试除到 $\\sqrt{x}$，总复杂度 $O(n \\sqrt{n})$。$n = 10^6$ 时约 $10^9$ 次运算，太慢。

**埃氏筛**：从 2 开始，把每个素数的所有倍数（2p、3p、4p……）都标记成合数。复杂度 $O(n \\log \\log n)$，已经接近线性。
但它有一个小缺点：**同一个合数会被不同的质数重复标记**。例如 $12 = 2 \\times 6 = 3 \\times 4$，会被 2 和 3 各标一次。

**线性筛（欧拉筛）**：让每个合数**只被它的最小质因子筛掉一次**。合数一共有 $n$ 个左右，每个只被标记一次，于是总操作数是 $O(n)$。

做法是：外层从小到大枚举 i，内层拿**已经找到的质数表** \`prime[]\` 去标记合数：

\`\`\`cpp
for (int i = 2; i <= n; i++) {
    if (!isComposite[i]) prime.push_back(i);      // 没被标记过 → i 是素数
    for (int j = 0; j < (int)prime.size(); j++) {
        long long v = 1LL * i * prime[j];
        if (v > n) break;                         // 超出范围，更大的 p 只会更大，直接退出
        isComposite[v] = true;                    // v 的最小质因子就是 prime[j]
        if (i % prime[j] == 0) break;             // ★ 关键：i 里已经含有因子 prime[j]
    }
}
\`\`\`

${pointsTable([
  ['外层 `i` 的含义', 'i 既可能是素数（自己进表），也充当"被筛的倍数"的一半'],
  ['`if (!isComposite[i])`', '一个数如果从没被标记过，就说明它没有比自己小的因子，是素数'],
  ['内层枚举 `prime[j]`', '从小到大枚举质数，保证第一次遇到整除时遇到的就是 i 的最小质因子'],
  ['`if (v > n) break;`', '越界判断要放在标记之前；写成 `continue` 也没关系，因为再往后只会更大，但 break 更省时间'],
  ['`if (i % prime[j] == 0) break;`', '这一句是线性的全部秘密：它保证每个合数只被最小质因子筛一次'],
  ['复杂度', '时间 $O(n)$，空间 $O(n)$（一个标记数组 + 一个质数表）'],
])}

**为什么 \`i % prime[j] == 0\` 就要 break？**

内层的质数是从小到大枚举的，所以当第一次出现 $p = prime[j]$ 能整除 $i$ 时，**p 一定是 i 的最小质因子**。

- 对**更大**的质数 $p' > p$：因为 $p \\mid i$，所以 $p \\mid i \\cdot p'$，而 $p < p'$，这说明 $i \\cdot p'$ 的最小质因子是 $p$ 而不是 $p'$。
  也就是说 $i \\cdot p'$ 这个合数**应该由 p 来筛**（在之后的某一轮里，取 $i' = i \\cdot p' / p$ 时会筛到它），现在用 $p'$ 筛就是"抢了别人的活"，会造成重复标记。所以立刻 break。
- 对**更小**的质数 $p < p_{\\min}(i)$：p 不能整除 i，于是 $i \\cdot p$ 的最小质因子就是 $p$，这一次标记"名正言顺"，继续做。

于是每个合数 v 恰好被它的最小质因子在唯一一轮里标记，总标记次数 = 合数个数，$O(n)$。

顺带一提：线性筛里每一个数被标记时用的质数就是它的最小质因子，所以只要把 \`isComposite[v] = true;\` 换成
\`spf[v] = prime[j];\`，就同时得到了"最小质因子表"，这对后面做质因数分解非常有用。`,
      inputFormat: '一行一个整数 `n`（`0 ≤ n ≤ 10^5`）。',
      outputFormat:
        '第一行输出一个整数，表示不超过 `n` 的素数个数。\n\n' +
        '第二行按从小到大的顺序输出这些素数，两两之间用一个空格分隔；如果没有素数（`n < 2`），这一行留空。',
      mistakes: mistakesTable([
        ['内层漏了 `if (i % prime[j] == 0) break;`', '同一个合数被多个质数反复标记，退化成埃氏筛，失去线性复杂度', '标记完 v 后立刻判断整除并 break'],
        ['`break` 写成 `continue`', '内层继续用更大的质数去筛，既重复标记又破坏了"最小质因子"性质', '必须是 `break`，直接结束内层循环'],
        ['`i * prime[j]` 用 int 相乘', '越界前乘积就可能溢出，得到负数下标或错误标记', '写 `1LL * i * prime[j]`，或用 `prime[j] > n / i` 先判断'],
        ['先判断整除、后标记', '本该被筛掉的合数漏标，输出里会混进合数', '顺序固定为：算 v → 越界 break → 标记 → 判断整除再 break'],
        ['输出时行末多一个空格，或忘了处理 `n < 2`', '评测可能不通过；`n = 1` 时第二行处理不好会输出多余字符', '用 `if (i > 0) cout << " ";` 控制分隔符，空表时只输出换行'],
      ]),
      tips:
        '- 内层循环写成 `for (int j = 0; j < (int)prime.size(); j++)`，注意 `prime.size()` 是 `size_t`，比较时加 `(int)` 转换可以避免 `-Wall` 的符号比较警告。\n' +
        '- 一定要把越界判断（`v > n`）写在标记之前，否则数组越界。\n' +
        '- 洛谷同类型题目：线性筛素数（可在题目页下方的洛谷链接按关键词「线性筛」搜索）。',
      starter: `#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 100005;
bool isComposite[MAXN];   // isComposite[i] = true 表示 i 是合数

int main() {
    int n;
    cin >> n;
    vector<int> prime;
    // TODO: 线性筛
    //       外层 i 从 2 到 n：没被标记过就 push 进 prime
    //       内层枚举 prime 里的质数 p，标记 i*p 为合数；注意溢出与越界
    //       标记之后如果 i % p == 0，立刻 break（这是线性的关键）
    // TODO: 第一行输出素数个数，第二行用空格分隔输出所有素数
    return 0;
}
`,
      solution: `#include <iostream>
#include <vector>
using namespace std;

const int MAXN = 100005;
bool isComposite[MAXN];

int main() {
    int n;
    cin >> n;
    vector<int> prime;
    for (int i = 2; i <= n; i++) {
        if (!isComposite[i]) prime.push_back(i);
        for (int j = 0; j < (int)prime.size(); j++) {
            long long v = 1LL * i * prime[j];
            if (v > n) break;
            isComposite[v] = true;
            if (i % prime[j] == 0) break;
        }
    }
    cout << prime.size() << endl;
    for (int i = 0; i < (int)prime.size(); i++) {
        if (i > 0) cout << " ";
        cout << prime[i];
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '10\n', expected: '4\n2 3 5 7\n' },
        { input: '0\n', expected: '0\n\n' },
        { input: '2\n', expected: '1\n2\n' },
        {
          input: '100\n',
          expected:
            '25\n2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97\n',
        },
        {
          input: '1000\n',
          expected:
            '168\n2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97 101 103 107 109 113 127 131 137 139 149 151 157 163 167 173 179 181 191 193 197 199 211 223 227 229 233 239 241 251 257 263 269 271 277 281 283 293 307 311 313 317 331 337 347 349 353 359 367 373 379 383 389 397 401 409 419 421 431 433 439 443 449 457 461 463 467 479 487 491 499 503 509 521 523 541 547 557 563 569 571 577 587 593 599 601 607 613 617 619 631 641 643 647 653 659 661 673 677 683 691 701 709 719 727 733 739 743 751 757 761 769 773 787 797 809 811 821 823 827 829 839 853 857 859 863 877 881 883 887 907 911 919 929 937 941 947 953 967 971 977 983 991 997\n',
        },
      ],
      hints: [
        '先想清楚"标记数组 + 质数表"这两个东西分别记录什么：标记数组说"这个数是不是合数"，质数表说"目前已知的素数有哪些"。',
        '内层用质数表去筛 `i * p`：只要 `i * p <= n` 就一直做，并且**标记完立刻检查 `i % p == 0`**。',
        '`i % p == 0` 说明 p 是 i 的最小质因子，此时后面更大的质数都没有资格筛 `i * p` 了，必须 break。',
        '`i * p` 可能超过 int 范围，写成 `1LL * i * prime[j]` 最省心。',
      ],
      luoguKeyword: '线性筛',
      luoguCode: 'P3383',
    }),

    proLesson({
      id: 'p7-3',
      title: '最大公约数与扩展欧几里得',
      difficulty: '困难',
      knowledge: 'exgcd',
      story:
        '求最大公约数的辗转相除法人人会写，但它其实藏着一个"副产品"：\n\n' +
        '在递归求 $\\gcd(a,b)$ 的同时，可以顺便解出方程 $ax + by = \\gcd(a,b)$ 的一组整数解。' +
        '这个算法叫**扩展欧几里得（exgcd）**，是求逆元、解同余方程、解不定方程的基础工具。',
      task:
        '给定两个正整数 `a`、`b`：\n\n' +
        '1. 求 $\\gcd(a,b)$；\n' +
        '2. 求一组整数解 $(x, y)$，满足 $ax + by = \\gcd(a,b)$，并且**要求 $0 ≤ x < b / \\gcd(a,b)$**（这样解唯一）。\n\n' +
        '输出三个数：`g x y`。',
      lesson: `**第一部分：gcd 的递归实现**，就是辗转相除法：

\`\`\`cpp
long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}
\`\`\`

道理是 $\\gcd(a,b) = \\gcd(b, a \\bmod b)$：任何同时整除 a、b 的数也整除 $a \\bmod b$，反之亦然，所以两边的公约数集合完全相同。
每两次递归至少让数字减半（斐波那契数列是最坏情况），复杂度 $O(\\log \\min(a,b))$。

**第二部分：exgcd 的推导。** 我们要求 $ax + by = \\gcd(a,b)$ 的一组解，思路是"递归求解子问题，再从子问题的解拼出当前的解"。

设子问题 $(b, a \\bmod b)$ 已经求出解 $(x_1, y_1)$，即

$$b \\cdot x_1 + (a \\bmod b) \\cdot y_1 = g$$

把 $a \\bmod b = a - \\lfloor a / b \\rfloor \\cdot b$ 代进去：

$$b x_1 + \\left(a - \\lfloor a/b \\rfloor b\\right) y_1 = g$$

按 a、b 重新整理：

$$a \\cdot y_1 + b \\cdot \\left(x_1 - \\lfloor a/b \\rfloor \\cdot y_1\\right) = g$$

跟 $ax + by = g$ 对照，就得到**递推公式**：

$$x = y_1, \\qquad y = x_1 - \\lfloor a/b \\rfloor \\cdot y_1$$

**边界**：当 $b = 0$ 时，$\\gcd(a,0) = a$，而 $a \\cdot 1 + 0 \\cdot 0 = a$，所以直接返回 $x = 1, y = 0$。

\`\`\`cpp
long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {          // 边界：a*1 + 0*0 = a
        x = 1; y = 0;
        return a;
    }
    long long g = exgcd(b, a % b, x, y);
    long long x1 = x, y1 = y;          // 先保存子问题的解
    x = y1;                            // 再按递推公式覆盖
    y = x1 - (a / b) * y1;
    return g;
}
\`\`\`

${pointsTable([
  ['子问题是谁', '`exgcd(b, a % b, ...)`——和 gcd 的递归方向完全一样，答案 g 也完全一样'],
  ['递推公式', '`x = y1;  y = x1 - (a / b) * y1;`'],
  ['为什么要先存 `x1, y1`', '`x`、`y` 是引用，递归返回时里面已经是子问题的解；如果直接 `x = y; y = x - ...` 就会用到已经被改掉的 x'],
  ['边界条件', '`b == 0` 时 `x = 1, y = 0`，返回 a。写错成 `a == 0` 或 `x = 0, y = 1` 都会在递归尽头出错'],
  ['复杂度', '递归深度与 gcd 相同，$O(\\log \\min(a,b))$'],
])}

**第三部分：把所有解归一到唯一的一个。** $ax + by = g$ 的解不是唯一的。如果 $(x_0, y_0)$ 是一组解，那么对任意整数 t，

$$x = x_0 + t \\cdot \\frac{b}{g}, \\qquad y = y_0 - t \\cdot \\frac{a}{g}$$

都还是解（$a \\cdot \\frac{b}{g} = b \\cdot \\frac{a}{g}$ 恰好抵消）。要让答案唯一，题目要求 $0 ≤ x < b/g$——
由于 x 的解构成公差为 $b/g$ 的等差数列，**这个区间里恰好有一个 x**，于是 (x, y) 也就唯一确定了。

归一的写法（\`m = b / g\`）：

\`\`\`cpp
long long m = b / g;
x = ((x % m) + m) % m;        // 把 x 搬到 [0, m) 里：先取模，再加 m 消掉负数
y = (g - a * x) / b;          // 由 ax + by = g 反解 y，这样最省事也最不容易错
\`\`\`

因为题目保证 $b \\ge 1$，所以 $m = b/g \\ge 1$，不会出现除以 0。`,
      inputFormat: '一行两个整数 `a` 和 `b`（`1 ≤ a, b ≤ 10^9`），用一个空格分隔。',
      outputFormat:
        '输出一行三个整数：`g x y`，其中 `g = gcd(a, b)`，且 $ax + by = g$、$0 ≤ x < b/g$。相邻两个数之间用一个空格分隔。',
      sample:
        '### 样例\n\n**输入**\n\n```\n3 5\n```\n\n**输出**\n\n```\n1 2 -1\n```\n\n' +
        '验证：$3 \\times 2 + 5 \\times (-1) = 1 = \\gcd(3,5)$；且 $0 ≤ 2 < 5/1 = 5$，满足要求。',
      mistakes: mistakesTable([
        ['exgcd 边界写成 `a == 0`', '递归永远到不了出口（或返回值不对），结果乱掉', '判 `b == 0`：返回 a，并令 `x = 1, y = 0`'],
        ['直接 `x = y; y = x - (a/b) * y;`', '`x` 已经被覆盖，第二个式子里用的是新值，结果错误', '先用 `x1`、`y1` 保存子问题的解，再计算'],
        ['递推公式记成 `y = y1 - (a/b) * x1`', '解不满足 $ax+by=g$，验证一下就露馅', '记住形式：`x = y1; y = x1 - (a/b) * y1;`，最后代入验证'],
        ['把 exgcd 返回的 x 直接当答案', 'x 可能是负数（例如 `a=5, b=3` 时是 -1），不满足 $0 ≤ x$；写成 `x %= m` 也救不了负数', '归一：`x = ((x % m) + m) % m;`，再用 `y = (g - a*x)/b` 反解 y'],
        ['用 `int` 存中间量', '`a * x` 可达 $10^{18}$，int 溢出；反过来 `y` 是负数也不能用无符号类型', '全程 `long long`（`y` 允许为负）'],
      ]),
      tips:
        '- 写完一定要拿样例验证一遍：把 g、x、y 代回 $ax + by$ 看是否等于 g。\n' +
        '- 输出里 `y` 允许是负数，这是正常的。\n' +
        '- `exgcd` 是后面求模逆元（$ax \\equiv 1 \\pmod p$）的必备工具：当 $\\gcd(a,p) = 1$ 时，exgcd 解出的 x 取模 p 就是逆元。\n' +
        '- 洛谷同类型题目：扩展欧几里得（可在题目页下方的洛谷链接按关键词「扩展欧几里得」搜索）。',
      starter: `#include <iostream>
using namespace std;

// TODO: 求 gcd
long long gcd(long long a, long long b) {
    // TODO: b == 0 时返回 a，否则递归 gcd(b, a % b)
    return 0;
}

// TODO: 扩展欧几里得：返回 gcd，并通过引用带出 x、y，使 a*x + b*y = gcd
long long exgcd(long long a, long long b, long long &x, long long &y) {
    // TODO: 边界 b == 0：x = 1, y = 0，返回 a
    // TODO: 递归求解 (b, a % b)，先保存子问题的 x1、y1
    // TODO: 按递推公式覆盖 x = y1; y = x1 - (a / b) * y1;
    return 0;
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long x = 0, y = 0;
    // TODO: 调用 exgcd 得到 g、x、y
    // TODO: 把 x 归一化到 [0, b / g)，再由 a*x + b*y = g 反解出 y
    // TODO: 按 "g x y" 的格式输出
    return 0;
}
`,
      solution: `#include <iostream>
using namespace std;

long long gcd(long long a, long long b) {
    return b == 0 ? a : gcd(b, a % b);
}

long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long g = exgcd(b, a % b, x, y);
    long long x1 = x;
    long long y1 = y;
    x = y1;
    y = x1 - (a / b) * y1;
    return g;
}

int main() {
    long long a, b;
    cin >> a >> b;
    long long x = 0, y = 0;
    long long g = exgcd(a, b, x, y);
    long long m = b / g;
    x = ((x % m) + m) % m;
    y = (g - a * x) / b;
    cout << g << " " << x << " " << y << endl;
    return 0;
}
`,
      tests: [
        { input: '3 5\n', expected: '1 2 -1\n' },
        { input: '12 18\n', expected: '6 2 -1\n' },
        { input: '1 1\n', expected: '1 0 1\n' },
        { input: '5 3\n', expected: '1 2 -3\n' },
        { input: '999999937 1000000000\n', expected: '1 873015873 -873015818\n' },
      ],
      hints: [
        '先写出普通的 `gcd`：`return b == 0 ? a : gcd(b, a % b);`，exgcd 的递归方向和它一模一样。',
        'exgcd 的递归返回后，引用参数里装的是**子问题**的解，务必先存到 `x1`、`y1` 再覆盖 `x`、`y`。',
        '递推公式是 `x = y1; y = x1 - (a / b) * y1;`，边界 `b == 0` 时 `x = 1, y = 0`。',
        '题目要求的 $0 ≤ x < b/g$ 是用来消除多解的：先 `m = b / g`，再 `x = ((x % m) + m) % m`，最后用 `(g - a*x)/b` 反解 y。',
      ],
      luoguKeyword: '扩展欧几里得',
      luoguCode: 'P1082',
    }),

    proLesson({
      id: 'p7-4',
      title: '树状数组',
      difficulty: '困难',
      knowledge: '树状数组',
      story:
        '数组有两种操作：改一个位置、求一段和。\n\n' +
        '朴素数组改是 $O(1)$、求和是 $O(n)$；前缀和数组正好反过来。' +
        '**树状数组（Fenwick 树）**用一个小巧的二进制技巧，让两边都变成 $O(\\log n)$——' +
        '代码只有十行左右，是性价比最高的数据结构之一。',
      task:
        '维护一个长度为 `n` 的数组 `a[1..n]`，支持 `q` 次操作：\n\n' +
        '- `1 i x`：把 `a[i]` 加上 `x`；\n' +
        '- `2 i`：查询前缀和 `a[1] + a[2] + ... + a[i]`，并输出。',
      lesson: `**先看看暴力有多差**：

| 做法 | 单点修改 | 前缀和查询 |
| --- | --- | --- |
| 普通数组 | $O(1)$ | $O(n)$ |
| 前缀和数组 | $O(n)$ | $O(1)$ |
| 树状数组 | $O(\\log n)$ | $O(\\log n)$ |

**核心：\`lowbit\`。** \`lowbit(x) = x & -x\`，它取出 x 的二进制里**最低位的那个 1 所代表的值**：

\`\`\`text
x = 6  = (110)₂   →  lowbit = 2   （最低位的 1 在 2¹ 这一位）
x = 8  = (1000)₂  →  lowbit = 8
x = 12 = (1100)₂  →  lowbit = 4
\`\`\`

为什么 \`x & -x\` 能做到？在补码里 \`-x = ~x + 1\`：取反会把最低位那个 1 变成 0、把它右边的 0 全变成 1，再加 1 就一路进位回到原来的位置。
于是 \`x\` 和 \`-x\` 只有"最低位那个 1"是公共的，按位与之后就只剩下它。

**树状数组的定义**：\`c[i]\` 存的是 \`a\` 中一段区间的和，长度正好是 \`lowbit(i)\`，右端点是 i：

\`\`\`text
c[i] = a[i - lowbit(i) + 1] + ... + a[i]
\`\`\`

例如 \`c[4] = a[1] + a[2] + a[3] + a[4]\`（lowbit(4) = 4），\`c[6] = a[5] + a[6]\`（lowbit(6) = 2）。

**单点修改：往上跳。** 位置 i 的改动会影响所有"管辖范围包含 i"的节点，它们恰好是
\`i, i + lowbit(i), i + lowbit(i + lowbit(i)), ...\`，所以更新时指针**变大**，一直跳到超过 n：

\`\`\`cpp
void update(int i, long long v) {          // a[i] += v
    for (; i <= n; i += lowbit(i)) c[i] += v;
}
\`\`\`

**前缀查询：往下跳。** 想求 \`a[1] + ... + a[i]\`，就不断把 \`c[i]\` 累加进答案，然后让 \`i -= lowbit(i)\`，
每次"剥掉一段"，直到 i 变成 0：

\`\`\`cpp
long long query(int i) {                    // a[1] + ... + a[i]
    long long sum = 0;
    for (; i > 0; i -= lowbit(i)) sum += c[i];
    return sum;
}
\`\`\`

${pointsTable([
  ['`lowbit(x)`', '`x & -x`，取二进制最低位的 1。注意**不是** `x & (x - 1)`（那个是"消掉最低位的 1"，用途完全不同）'],
  ['下标必须从 1 开始', '`lowbit(0) = 0`，若下标从 0 开始，\`i -= lowbit(i)\` 会永远停在 0 → 死循环'],
  ['更新方向', '向上：`i += lowbit(i)`。因为要通知所有"管辖 i"的祖先节点'],
  ['查询方向', '向下：`i -= lowbit(i)`。每次剥掉 c[i] 管辖的那一段，剩下的继续往前剥'],
  ['区间和', '`sum(l, r) = query(r) - query(l - 1)`，用两个前缀和相减'],
  ['数据范围', 'n 个 $10^9$ 级别的数相加可达 $10^{14}$，`c[]`、答案、`x` 都要用 `long long`'],
  ['复杂度', '每次更新/查询最多跳 $O(\\log n)$ 步（每步至少让最低位的 1 左移一位），时间 $O(\\log n)$，空间 $O(n)$'],
])}

**为什么查询是 $O(\\log n)$**：每一步 \`i -= lowbit(i)\` 都会把 i 的最低位的那个 1 消掉，
所以最多走"i 的二进制里有几个 1"步，最坏 $\\log_2 n + 1$ 步。

**为什么更新是 $O(\\log n)$**：每一步 \`i += lowbit(i)\` 都会让最低位的 1 至少往左挪一位（进位），
所以最多 $\\log_2 n + 1$ 步就越过 n。

**建树的小优化**：本题可以直接对每个位置调用一次 update，建树是 $O(n \\log n)$——$n = 10^5$ 时完全够用。
想更快可以 $O(n)$ 建树：先把 \`c[i] = a[i]\`，再对每个 i 做 \`j = i + lowbit(i); if (j <= n) c[j] += c[i];\`。`,
      inputFormat:
        '第一行两个整数 `n` 和 `q`（`1 ≤ n, q ≤ 10^5`）。\n\n' +
        '第二行 `n` 个整数 `a[1..n]`（`|a[i]| ≤ 10^9`），用空格分隔。\n\n' +
        '接下来 `q` 行，每行一条操作：\n\n' +
        '- `1 i x`：把 `a[i]` 加上 `x`（`1 ≤ i ≤ n`，`|x| ≤ 10^9`）；\n' +
        '- `2 i`：查询 `a[1] + a[2] + ... + a[i]`（`1 ≤ i ≤ n`）。',
      outputFormat: '对每条 `2 i` 操作，输出一行一个整数：前缀和。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 5\n1 3 2 4 5\n2 5\n1 2 10\n2 3\n2 1\n2 5\n```\n\n**输出**\n\n```\n15\n16\n1\n25\n```\n\n' +
        '初始数组是 `[1, 3, 2, 4, 5]`：前缀 5 项和是 15；把 `a[2]` 加 10 后变成 `[1, 13, 2, 4, 5]`，' +
        '前缀 3 项和是 16、前缀 1 项和是 1、前缀 5 项和是 25。',
      mistakes: mistakesTable([
        ['下标从 0 开始存', '`lowbit(0) = 0`，查询循环 `i -= 0` 永远出不来，程序卡死', '数组和树状数组全部从下标 1 开始用'],
        ['`lowbit` 写成 `x & (x - 1)`', '那是"消掉最低位的 1"，跳的方向完全反了，答案随机错', '`lowbit(x) = x & -x`'],
        ['更新和查询的跳跃方向搞反', '更新写成 `i -= lowbit(i)`、查询写成 `i += lowbit(i)`，更新漏掉祖先、查询求和越界', '更新往上 `i += lowbit(i)`，查询往下 `i -= lowbit(i)`'],
        ['更新循环条件写成 `i < n`', '最后一个位置 n 对应的节点没被更新', '条件是 `i <= n`'],
        ['建树时忘了把初始值加进去', '所有查询都少算了初始数组的值', '读入 a[i] 后立刻 `update(i, a[i])`，并且 `c[]`、`x` 都用 `long long`'],
      ]),
      tips:
        '- 调试技巧：先写一个暴力（真的用数组存 a，每次查询 for 循环求和），小数据下和树状数组对拍。\n' +
        '- 只需前缀和时，树状数组比线段树更短更快；需要区间修改、区间最值时才上线段树。\n' +
        '- 洛谷同类型题目：树状数组（可在题目页下方的洛谷链接按关键词「树状数组」搜索）。',
      starter: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long c[MAXN];          // 树状数组：c[i] 管理长度为 lowbit(i) 的一段区间
int n;

// TODO: int lowbit(int x) —— 取出 x 二进制里最低位的 1

// TODO: void update(int i, long long v) —— 单点加：从 i 开始往上跳，把经过的 c[] 都加上 v

// TODO: long long query(int i) —— 前缀和：从 i 开始往下跳，累加经过的 c[]

int main() {
    int q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        // TODO: 把初始值 x 加到位置 i 上
    }
    for (int t = 0; t < q; t++) {
        int op;
        cin >> op;
        if (op == 1) {
            int i;
            long long x;
            cin >> i >> x;
            // TODO: 单点加
        } else {
            int i;
            cin >> i;
            // TODO: 输出 a[1] + ... + a[i]
        }
    }
    return 0;
}
`,
      solution: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long c[MAXN];
int n;

int lowbit(int x) {
    return x & -x;
}

void update(int i, long long v) {
    for (; i <= n; i += lowbit(i)) c[i] += v;
}

long long query(int i) {
    long long sum = 0;
    for (; i > 0; i -= lowbit(i)) sum += c[i];
    return sum;
}

int main() {
    int q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        long long x;
        cin >> x;
        update(i, x);
    }
    for (int t = 0; t < q; t++) {
        int op;
        cin >> op;
        if (op == 1) {
            int i;
            long long x;
            cin >> i >> x;
            update(i, x);
        } else {
            int i;
            cin >> i;
            cout << query(i) << endl;
        }
    }
    return 0;
}
`,
      tests: [
        {
          input: '5 5\n1 3 2 4 5\n2 5\n1 2 10\n2 3\n2 1\n2 5\n',
          expected: '15\n16\n1\n25\n',
        },
        { input: '1 3\n7\n2 1\n1 1 -7\n2 1\n', expected: '7\n0\n' },
        { input: '3 2\n0 0 0\n2 3\n2 1\n', expected: '0\n0\n' },
        { input: '4 4\n-5 10 -3 8\n2 4\n1 1 -5\n2 2\n2 4\n', expected: '10\n0\n5\n' },
        {
          input: '8 6\n9 -4 7 0 12 -8 3 5\n2 8\n1 4 100\n2 4\n1 8 -5\n2 8\n2 1\n',
          expected: '24\n112\n119\n9\n',
        },
      ],
      hints: [
        '先只写 `lowbit`：`return x & -x;`，然后想清楚"往上跳"和"往下跳"分别对应哪个操作。',
        '单点修改影响的是所有管辖 i 的节点，它们的下标是 `i, i + lowbit(i), ...`，所以循环里 `i += lowbit(i)`。',
        '前缀和要把 c 里一段段"剥"下来：`sum += c[i]; i -= lowbit(i);`，直到 `i == 0`。',
        '注意下标从 1 开始——`lowbit(0) = 0` 会让循环永远跑不完。',
      ],
      luoguKeyword: '树状数组',
      luoguCode: 'P3374',
    }),

    proLesson({
      id: 'p7-5',
      title: '线段树',
      difficulty: '困难',
      knowledge: '线段树',
      story:
        '树状数组很好用，但它只能处理"可减的信息"（比如和）。\n\n' +
        '**线段树**把区间递归地一分为二，把每个区间的信息都存进一个节点，' +
        '于是区间求和、区间最值、区间赋值……都能在 $O(\\log n)$ 内完成。它是竞赛里最常用的数据结构，没有之一。',
      task:
        '维护一个长度为 `n` 的数组 `a[1..n]`，支持 `q` 次操作：\n\n' +
        '- `1 i x`：把 `a[i]` **改成** `x`（注意是赋值，不是加）；\n' +
        '- `2 l r`：查询区间和 `a[l] + a[l+1] + ... + a[r]`，并输出。',
      lesson: `**用一维数组存树。** 线段树的每个节点代表一段区间。根节点 1 代表 $[1, n]$；
设节点 p 代表 $[l, r]$，令 $mid = \\lfloor (l+r)/2 \\rfloor$，那么

- 左孩子 \`2p\` 代表 $[l, mid]$；
- 右孩子 \`2p + 1\` 代表 $[mid+1, r]$。

**数组要开多大？** 开 \`4 * n\`。因为编号不是连续的：以 $n = 6$ 为例，节点编号会用到 13，
而 $2n = 12$ 已经不够了——所以"开 2n"是不安全的，标准做法是 \`4 * n\`。

\`\`\`text
n = 6 时的编号分布（括号里是区间）
                        1 [1,6]
            2 [1,3]                 3 [4,6]
        4 [1,2]   5 [3,3]       6 [4,5]   7 [6,6]
      8[1,1] 9[2,2]           12[4,4] 13[5,5]     ← 最大编号 13 > 2n = 12
\`\`\`

**建树 build(p, l, r)**：递归到叶子就存单点值，回溯时把左右孩子的和加起来。

\`\`\`cpp
void build(int p, int l, int r) {
    if (l == r) { tree[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    tree[p] = tree[p * 2] + tree[p * 2 + 1];      // 回溯时合并信息
}
\`\`\`

**单点修改 update(p, l, r, pos, v)**：只走一条从根到叶子的路径，改完叶子后原路返回重新合并。

\`\`\`cpp
void update(int p, int l, int r, int pos, long long v) {
    if (l == r) { tree[p] = v; return; }
    int mid = (l + r) / 2;
    if (pos <= mid) update(p * 2, l, mid, pos, v);
    else update(p * 2 + 1, mid + 1, r, pos, v);
    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}
\`\`\`

**区间查询 query(p, l, r, ql, qr)**：如果当前节点管的区间被查询区间**完全覆盖**，就直接返回它的值（不用往下走）；
否则看查询区间与左右孩子有没有交集，有就递归下去，把结果加起来。

\`\`\`cpp
long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[p];        // 完全覆盖，直接用整段的信息
    int mid = (l + r) / 2;
    long long sum = 0;
    if (ql <= mid) sum += query(p * 2, l, mid, ql, qr);
    if (qr > mid)  sum += query(p * 2 + 1, mid + 1, r, ql, qr);
    return sum;
}
\`\`\`

${pointsTable([
  ['数组大小', '`tree[4 * n]`。开 `2n` 会越界——上面 n = 6 的例子编号就到 13'],
  ['%2 与 /2', '`p * 2`、`p * 2 + 1` 比 `p << 1`、`p << 1 | 1` 更好读，两者等价'],
  ['`mid` 的取法', '`(l + r) / 2`（向下取整）。左右区间是 $[l, mid]$ 和 $[mid+1, r]$，**不会重叠也不会漏**'],
  ['查询的"完全覆盖"判断', '`ql <= l && r <= qr` 时立刻返回，这是 $O(\\log n)$ 的关键：访问到的整段直接取用，不再细分'],
  ['查询的递归条件', '`ql <= mid` 才走左孩子，`qr > mid` 才走右孩子。两个 if 是独立的，可能两边都要走'],
  ['本题不涉及懒标记', '懒标记（lazy tag）是为"区间修改"准备的：整段加同一个数时，先把增量记在节点上、查询/再次修改时再下传（pushdown）。本题只做单点修改，用不上；但数组大小、递归划分完全一样'],
  ['数据范围', 'n 个 $10^9$ 的数相加约 $10^{14}$，`tree`、`a`、答案和读入都用 `long long`'],
  ['复杂度', '建树 $O(n)$；单点修改 $O(\\log n)$；区间查询 $O(\\log n)$；空间 $O(4n) = O(n)$'],
])}

**为什么区间查询是 $O(\\log n)$**：把查询区间 $[ql, qr]$ 拆成若干"整段节点"的和。
在树的每一层里，被选中的节点最多只有 2 个（一个贴着左边界、一个贴着右边界），而树高是 $\\log n$，
所以最多访问 $O(\\log n)$ 个节点。单点修改只走一条根到叶的路径，同样 $O(\\log n)$。`,
      inputFormat:
        '第一行两个整数 `n` 和 `q`（`1 ≤ n, q ≤ 10^5`）。\n\n' +
        '第二行 `n` 个整数 `a[1..n]`（`|a[i]| ≤ 10^9`），用空格分隔。\n\n' +
        '接下来 `q` 行，每行一条操作：\n\n' +
        '- `1 i x`：把 `a[i]` 改成 `x`（`1 ≤ i ≤ n`，`|x| ≤ 10^9`）；\n' +
        '- `2 l r`：查询 `a[l] + a[l+1] + ... + a[r]`（`1 ≤ l ≤ r ≤ n`）。',
      outputFormat: '对每条 `2 l r` 操作，输出一行一个整数：区间和。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n2 3 3\n```\n\n**输出**\n\n```\n15\n16\n10\n```\n\n' +
        '初始 `[1, 2, 3, 4, 5]`，整段和是 15；把 `a[3]` 改成 10 后数组是 `[1, 2, 10, 4, 5]`，' +
        '区间 `[2, 4]` 的和是 16，单点 `[3, 3]` 是 10。',
      mistakes: mistakesTable([
        ['树数组只开 `2 * n`', '某些 n 下节点编号会超过 `2n`（如 n = 6 时编号到 13），数组越界，结果随机错', '开到 `4 * n`'],
        ['单点修改写成"加上 x"', '本题是赋值语义，累加会让答案偏大', '看清楚题目：`tree[p] = v;` 而不是 `+= v`'],
        ['修改后忘了回溯合并', '祖先节点的和还是旧值，之后所有跨越该点的查询都会错', '递归返回后一定写 `tree[p] = tree[p*2] + tree[p*2+1];`'],
        ['查询的完全覆盖判断写成 `ql <= l || r <= qr`', '只要有一边对上就返回，答案偏小甚至乱掉', '必须是 `ql <= l && r <= qr`'],
        ['`mid` 写成 `(l + r + 1) / 2`', '左右区间划分变成 $[l, mid-1]$、$[mid, r]$，与 `build` 不一致，必然出错；`tree[]` 用 int 也会溢出', '统一用 `mid = (l + r) / 2`，`tree[]` 用 `long long`'],
      ]),
      tips:
        '- 写完后先自测 `l == r` 以及 `[1, n]` 这两种极端查询。\n' +
        '- 把每个节点的区间打印出来（`cout << p << " [" << l << "," << r << "]"`），能很直观地看出划分是否正确。\n' +
        '- 洛谷同类型题目：线段树（可在题目页下方的洛谷链接按关键词「线段树」搜索）。',
      starter: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long a[MAXN];
long long tree[4 * MAXN];    // 线段树：节点 p 管理一段区间，开 4n 才安全
int n;

// TODO: void build(int p, int l, int r)
//       叶子（l == r）时 tree[p] = a[l]；否则递归建左右孩子，再合并

// TODO: void update(int p, int l, int r, int pos, long long v)
//       单点赋值：走到叶子改掉 tree[p]，回溯时重新合并左右孩子

// TODO: long long query(int p, int l, int r, int ql, int qr)
//       区间求和：完全覆盖就返回 tree[p]；否则分别判断左右孩子是否有交集

int main() {
    int q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    // TODO: 建树 build(1, 1, n);
    for (int t = 0; t < q; t++) {
        int op;
        cin >> op;
        if (op == 1) {
            int i;
            long long x;
            cin >> i >> x;
            // TODO: 把 a[i] 改成 x
        } else {
            int l, r;
            cin >> l >> r;
            // TODO: 输出区间 [l, r] 的和
        }
    }
    return 0;
}
`,
      solution: `#include <iostream>
using namespace std;

const int MAXN = 100005;
long long a[MAXN];
long long tree[4 * MAXN];
int n;

void build(int p, int l, int r) {
    if (l == r) {
        tree[p] = a[l];
        return;
    }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}

void update(int p, int l, int r, int pos, long long v) {
    if (l == r) {
        tree[p] = v;
        return;
    }
    int mid = (l + r) / 2;
    if (pos <= mid) update(p * 2, l, mid, pos, v);
    else update(p * 2 + 1, mid + 1, r, pos, v);
    tree[p] = tree[p * 2] + tree[p * 2 + 1];
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[p];
    int mid = (l + r) / 2;
    long long sum = 0;
    if (ql <= mid) sum += query(p * 2, l, mid, ql, qr);
    if (qr > mid) sum += query(p * 2 + 1, mid + 1, r, ql, qr);
    return sum;
}

int main() {
    int q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    for (int t = 0; t < q; t++) {
        int op;
        cin >> op;
        if (op == 1) {
            int i;
            long long x;
            cin >> i >> x;
            update(1, 1, n, i, x);
        } else {
            int l, r;
            cin >> l >> r;
            cout << query(1, 1, n, l, r) << endl;
        }
    }
    return 0;
}
`,
      tests: [
        { input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 2 4\n2 3 3\n', expected: '15\n16\n10\n' },
        { input: '1 3\n7\n2 1 1\n1 1 -1000000000\n2 1 1\n', expected: '7\n-1000000000\n' },
        { input: '4 5\n5 5 5 5\n1 2 1\n2 1 4\n2 1 2\n1 4 0\n2 3 4\n', expected: '16\n6\n5\n' },
        {
          input: '6 4\n-1 2 -3 4 -5 6\n2 1 1\n2 6 6\n2 1 6\n1 1 100\n',
          expected: '-1\n6\n3\n',
        },
        {
          input:
            '8 5\n1000000000 1000000000 1000000000 1000000000 1000000000 1000000000 1000000000 1000000000\n2 1 8\n1 5 -1000000000\n2 1 8\n2 5 5\n2 8 8\n',
          expected: '8000000000\n6000000000\n-1000000000\n1000000000\n',
        },
      ],
      hints: [
        '先把三个函数的"参数含义"写清楚：`p` 是节点编号，`l`、`r` 是这个节点管的区间。',
        '建树和单点修改都是"递归到叶子改值，回来重新合并"，区别只在叶子处做的是赋值还是定位。',
        '区间查询的关键判断是"完全覆盖就返回"：`if (ql <= l && r <= qr) return tree[p];`，这样才不会退化成暴力。',
        '别忘了数组开 `4 * MAXN`，并把 `tree`、`a`、读入的 `x` 都用 `long long`。',
      ],
      luoguKeyword: '线段树',
      luoguCode: 'P3372',
    }),

    proLesson({
      id: 'p7-6',
      title: '综合：区间调度',
      difficulty: '中等',
      knowledge: '贪心（按右端点排序）',
      story:
        '一间会议室，一堆活动都要用它，每个活动有开始时间和结束时间。\n\n' +
        '怎样安排才能让**办成的活动数量最多**？答案出乎意料地简单：把所有活动按**结束时间**从小到大排序，' +
        '然后从前往后扫，只要能接上就选——这就是最经典的贪心。',
      task:
        '给定 `n` 个区间 `[l, r]`，从中选出尽可能多的区间，使得任意两个被选中的区间都不重叠。\n\n' +
        '规定：若 `r_a ≤ l_b`，则区间 a 与区间 b 不重叠（**端点相接是允许的**）。输出最多能选出的区间个数。',
      lesson: `**贪心策略**：把所有区间按**右端点从小到大**排序，然后从左到右扫一遍，
用一个变量 \`lastEnd\` 记住"上一个被选中的区间的右端点"；只要当前区间的左端点 $\\ge$ \`lastEnd\`，就选它，并更新 \`lastEnd\`。

\`\`\`cpp
sort(seg, seg + n, cmp);          // cmp: 按 r 从小到大
int cnt = 0;
long long lastEnd = -1;           // 上一个被选中区间的右端点（初值取一个比所有 l 都小的数）
for (int i = 0; i < n; i++) {
    if (seg[i].l >= lastEnd) {    // 接得上
        cnt++;
        lastEnd = seg[i].r;
    }
}
\`\`\`

**为什么按右端点排序是对的（交换论证）**：设所有最优方案中，第一个被选中的区间是 $X$。
贪心选的是**右端点最小的区间** $G$，所以 $G$ 的右端点 $\\le X$ 的右端点。

把最优方案里的 $X$ 换成 $G$：$G$ 比 $X$ 结束得更早，原来接在 $X$ 后面的那些区间当然也接得上 $G$
（它们要求的是"左端点不小于前一个的右端点"，$G$ 的右端点更小，条件只可能更容易满足）。
所以换完之后方案大小不变，仍然是最优的，而且它的第一个区间就是贪心选的 $G$。

对剩下的部分重复同样的论证（每次都只看"当前起点之后"的区间），可以一步步把任意一个最优解"改造"成贪心解，
而且每一步都不会让答案变小。于是贪心解一定也是最优解。∎

**为什么按左端点排序就不行？** 反例：

\`\`\`text
区间： (1, 100), (2, 3), (4, 5)
按左端点排序后先看 (1, 100)，选它之后 (2,3)、(4,5) 全部冲突，答案 = 1
正确答案是选 (2, 3) 和 (4, 5)，答案 = 2
\`\`\`

原因是"左端点小"完全不能保证"结束得早"，一个超长区间会把后面的机会全部堵死。
贪心要抓住的是**"尽早腾出资源"**——所以看的是右端点。

${pointsTable([
  ['排序关键字', '右端点 `r` 升序。`r` 相同时按 `l` 升序（其实 `r` 相同的区间谁在前都不影响答案）'],
  ['`lastEnd` 的含义', '上一个被选中区间的右端点；下一个区间必须满足 `l >= lastEnd`'],
  ['`lastEnd` 初值', '取 `-1` 这类比所有可能的 `l` 都小的值，保证第一个区间一定能被选中（`l ≥ 0`）'],
  ['端点相接', '题目规定 `l == lastEnd` 算作不重叠，所以判断用 `>=` 而不是 `>`'],
  ['为什么贪心正确', '早期结束的区间给后面留的余地最大，交换论证证明"换成最早结束的"不会让答案变小'],
  ['复杂度', '排序 $O(n \\log n)$，扫描 $O(n)$，总计 $O(n \\log n)$；空间 $O(n)$'],
])}

**一个有用的直觉**：每一步都做"当下看起来最不占地方"的选择——选结束最早的那个。
贪心题大多有这个味道：先用小数据找一个"局部最优的选择标准"，再用交换论证说明它不会让全局变差。`,
      inputFormat:
        '第一行一个整数 `n`（`0 ≤ n ≤ 10^5`），表示区间个数。\n\n' +
        '接下来 `n` 行，每行两个整数 `l` 和 `r`（`0 ≤ l ≤ r ≤ 10^9`），表示一个闭区间 `[l, r]`。\n\n' +
        '`n = 0` 时后面没有区间行也是合法的输入。',
      outputFormat: '输出一行一个整数：最多能选出的互不重叠的区间个数（`n = 0` 时输出 `0`）。',
      sample:
        '### 样例\n\n**输入**\n\n```\n3\n1 3\n2 4\n3 5\n```\n\n**输出**\n\n```\n2\n```\n\n' +
        '按右端点排序后依次是 `(1,3)`、`(2,4)`、`(3,5)`：先选 `(1,3)`；`(2,4)` 的左端点 2 < 3，冲突，跳过；' +
        '`(3,5)` 的左端点 3 ≥ 3，端点相接，可以选。所以答案是 2。',
      mistakes: mistakesTable([
        ['按左端点排序', '(1,100), (2,3), (4,5) 会先选走超长区间，答案算成 1（正确是 2）', '按右端点 `r` 升序排序'],
        ['判断写成 `seg[i].l > lastEnd`', '把端点相接的情况当成冲突，样例会输出 1 而不是 2', '题目规定相接允许，用 `>=`'],
        ['用双重循环去两两比较冲突', '复杂度 $O(n^2)$，$n = 10^5$ 时超时；而且"被跳过的区间要不要回头看"根本处理不清', '排序后一趟扫描：只维护 `lastEnd` 一个变量就够'],
        ['选了区间却忘了更新 `lastEnd`', '后面所有区间都被拿来和第一个区间比较，答案偏大', '选中后立刻 `lastEnd = seg[i].r;`'],
        ['比较函数写成 `return x.r <= y.r;`', '`<=` 不是严格弱序，`std::sort` 行为未定义，可能崩溃或排序错误', '写成 `return x.r < y.r;`（相等时再比较 l）'],
      ]),
      tips:
        '- 排序函数可以直接写 \`bool cmp(const Interval &x, const Interval &y) { return x.r < y.r; }\`，本题最简单的写法就够了。\n' +
        '- 记得处理 `n = 0`：此时循环一次都不进，输出 0 即可，不需要特判。\n' +
        '- 洛谷同类型题目：区间调度 / 活动选择（可在题目页下方的洛谷链接按关键词「区间调度 贪心」搜索）。',
      starter: `#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 100005;

struct Interval {
    long long l, r;
};

Interval seg[MAXN];

bool cmp(const Interval &x, const Interval &y) {
    // TODO: 按右端点从小到大排序（右端点相同时按左端点从小到大）
    return false;
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> seg[i].l >> seg[i].r;
    // TODO: 按 cmp 排序
    // TODO: 从左到右贪心：维护上一个被选中区间的右端点 lastEnd
    //       当前区间左端点 >= lastEnd 就选它，计数并更新 lastEnd
    // TODO: 输出选出的区间个数
    return 0;
}
`,
      solution: `#include <iostream>
#include <algorithm>
using namespace std;

const int MAXN = 100005;

struct Interval {
    long long l, r;
};

Interval seg[MAXN];

bool cmp(const Interval &x, const Interval &y) {
    if (x.r != y.r) return x.r < y.r;
    return x.l < y.l;
}

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) cin >> seg[i].l >> seg[i].r;
    sort(seg, seg + n, cmp);
    int cnt = 0;
    long long lastEnd = -1;
    for (int i = 0; i < n; i++) {
        if (seg[i].l >= lastEnd) {
            cnt++;
            lastEnd = seg[i].r;
        }
    }
    cout << cnt << endl;
    return 0;
}
`,
      tests: [
        { input: '3\n1 3\n2 4\n3 5\n', expected: '2\n' },
        { input: '1\n5 5\n', expected: '1\n' },
        { input: '4\n1 10\n2 9\n3 8\n4 7\n', expected: '1\n' },
        { input: '5\n1 2\n3 4\n5 6\n7 8\n9 10\n', expected: '5\n' },
        { input: '0\n', expected: '0\n' },
      ],
      hints: [
        '先想一个问题：如果两个区间冲突，舍弃哪一个更划算？——当然是舍弃"结束得更晚"的那个。',
        '把区间按右端点从小到大排好，接下来只需要一趟扫描，用一个变量记住"上一个选中区间什么时候结束"。',
        '判断条件用 `seg[i].l >= lastEnd`（题目允许端点相接），选中后别忘了更新 `lastEnd`。',
        '`lastEnd` 的初值要比任何合法的左端点都小，取 `-1` 最方便；这样 `n = 0` 时也能自然输出 0。',
      ],
      luoguKeyword: '区间调度 贪心',
      luoguCode: 'P1803',
    }),
  ],
};
