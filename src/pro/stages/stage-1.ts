/**
 * 阶段一 · 线性结构：栈与队列（6 道题）
 *
 * 这是 Pro 靶场的第一阶段：读者已经会写基础 C++，这里开始学"数据结构"本身——
 * 先用数组把栈和队列造出来，再用它们解决括号匹配、表达式求值、
 * 下一个更大元素、滑动窗口最大值这些经典问题。
 */

import type { StageData } from '../../types/problem';
import { mistakesTable, pointsTable, proLesson } from '../lesson.ts';

export const STAGE_1: StageData = {
  stage: 1,
  title: '阶段一 · 栈与队列',
  subtitle: '线性结构、单调栈与单调队列',
  summary:
    '数据结构解决的是"数据怎么放、怎么取"的问题。这一阶段先把两种最基本的线性结构造出来：\n\n' +
    '- **栈（stack）**：后进先出（LIFO）——像一摞盘子，只能从顶上放、从顶上取。\n' +
    '- **队列（queue）**：先进先出（FIFO）——像排队买饭，从队尾进、从队头出。\n\n' +
    '然后用它们解决 4 个经典问题：括号匹配、后缀表达式求值、下一个更大元素（单调栈）、滑动窗口最大值（单调队列）。\n' +
    '这一阶段的题目都会给出完整的输入输出框架，你只需要把"容器"和"操作"补上。',
  problems: [
    proLesson({
      id: 'p1-1',
      title: '模拟栈',
      difficulty: '简单',
      knowledge: '栈的实现',
      story:
        '很多题目不会直接给你一个栈，而是让你**自己用数组实现一个栈**，然后按操作序列执行。\n\n' +
        '用数组实现栈只需要两样东西：一个数组存数据，一个变量记"栈顶在哪里"。',
      task:
        '洛谷 B3614【模板】栈：**同一个测试点里有多组数据**，按操作序列维护一个栈，并按要求输出结果。\n' +
        '\n' +
        '- `push x`：把 x 入栈（`0 ≤ x < 2^64`，注意用 `unsigned long long`）\n' +
        '- `pop`：弹出栈顶；**栈空时输出 `Empty`**（不弹出）\n' +
        '- `query`：输出栈顶；**栈空时输出 `Anguei!`**\n' +
        '- `size`：输出当前元素个数',
      lesson: `**栈的模型**：只有一个口，后进去的先出来（LIFO）。

用数组实现时，约定一个变量 \`top\`：

\`\`\`cpp
const int MAXN = 1000005;        // Σn ≤ 10^6，数组要开够
unsigned long long st[MAXN];     // 存数据；x < 2^64，所以用 unsigned long long
int top = 0;                     // 0 表示栈里没有元素；元素放在 st[1] .. st[top]
\`\`\`

${pointsTable([
  ['入栈 push x', '`st[++top] = x;` —— 先把 top 加 1，再放进去'],
  ['出栈 pop', '本题只要 `top--`；如果题目要求"输出被弹出的值"，就先取 `st[top]` 再 `top--`'],
  ['取栈顶 query', '`st[top]` —— 只读，不改 top'],
  ['栈的大小 size', '正好等于 `top`'],
  ['栈空判断', '`top == 0`（这就是为什么下标从 1 开始：0 天然表示空）'],
  ['多组数据', '每组开始时把 `top = 0` 重置，上一组的数据必须清干净'],
])}

**为什么下标从 1 开始？** 如果从 0 开始存，空栈时 top 该是多少就没有自然的值了（0 既表示空又表示"第 0 个位置有元素"），从 1 开始能省掉一个特判。

复杂度：每个操作都是 $O(1)$，总复杂度 $O(\\sum n)$。`,
      inputFormat:
        '第一行一个整数 `T`，表示数据组数。\n' +
        '\n' +
        '每组数据：第一行一个整数 `n`（操作条数），接下来 `n` 行每行一条操作 —— `push x`、`pop`、`query` 或 `size`（`push` 与 `x` 之间用空格隔开，其它操作本行没有别的字符）。\n' +
        '\n' +
        '数据范围：`1 ≤ T, n ≤ 10^6`，单个测试点内 `Σn ≤ 10^6`；`0 ≤ x < 2^64`。',
      outputFormat:
        '按操作顺序输出，每次输出占一行：`pop` 空栈输出 `Empty`；`query` 空栈输出 `Anguei!`、非空输出栈顶元素；`size` 输出元素个数。`push` 不输出任何内容。',
      mistakes: mistakesTable([
        ['让 `top` 从 0 开始存数据', '空栈与"有一个元素"无法区分，边界判断容易错', '下标从 1 开始，`top == 0` 即空栈'],
        ['`push` 写成 `st[top++] = x;`', '第一个元素被放到 `st[0]`，之后所有位置都错位', '用 `st[++top] = x;`'],
        ['`pop` 时先 `top--` 再取值', '取到的是被丢弃位置的值，且空栈时越界', '先 `st[top]`，再 `top--`'],
        ['栈空时没有判断直接取 `st[top]`', '`st[0]` 是未初始化的值，输出错误', '所有取栈顶的地方都先判断 `top == 0`'],
        ['数组开得和 n 一样大', '入栈 n 次会越界', '开到 `n + 5` 以上'],
      ]),
      tips:
        '- 本题的输入输出框架已经写好了，你只需要把四个 `// TODO` 补上。\n' +
        '- 提交前可以自己造一组数据：先 `push` 几个数，再用 `size` / `query` 检查栈的状态。\n' +
        '- 这道题的洛谷原题是 B3614【模板】栈，题号已经填在下面的提交面板里。',
      starter:
        '#include <iostream>\n' +
        '#include <string>\n' +
        'using namespace std;\n' +
        '\n' +
        '// Σn ≤ 10^6，数组开够；x < 2^64 所以用 unsigned long long\n' +
        'const int MAXN = 1000005;\n' +
        'unsigned long long st[MAXN];\n' +
        'int top = 0;   // 0 表示空栈\n' +
        '\n' +
        'int main() {\n' +
        '    ios::sync_with_stdio(false);   // 数据量到 1e6，关掉 cin/cout 同步会快很多\n' +
        '    cin.tie(nullptr);\n' +
        '\n' +
        '    int T;\n' +
        '    cin >> T;\n' +
        '    while (T--) {\n' +
        '        int n;\n' +
        '        cin >> n;\n' +
        '        top = 0;   // TODO: 每组数据都要清空栈（想一想为什么不能沿用上一组）\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            string op;\n' +
        '            cin >> op;\n' +
        '            if (op == "push") {\n' +
        '                unsigned long long x;\n' +
        '                cin >> x;\n' +
        '                // TODO: 入栈\n' +
        '            } else if (op == "pop") {\n' +
        '                // TODO: 栈空输出 Empty，否则弹出栈顶\n' +
        '            } else if (op == "query") {\n' +
        '                // TODO: 栈空输出 Anguei!，否则输出栈顶元素\n' +
        '            } else {\n' +
        '                // TODO: size —— 输出当前元素个数\n' +
        '            }\n' +
        '        }\n' +
        '    }\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      solution:
        '#include <iostream>\n' +
        '#include <string>\n' +
        'using namespace std;\n' +
        '\n' +
        'const int MAXN = 1000005;\n' +
        'unsigned long long st[MAXN];\n' +
        'int top = 0;\n' +
        '\n' +
        'int main() {\n' +
        '    ios::sync_with_stdio(false);\n' +
        '    cin.tie(nullptr);\n' +
        '\n' +
        '    int T;\n' +
        '    cin >> T;\n' +
        '    while (T--) {\n' +
        '        int n;\n' +
        '        cin >> n;\n' +
        '        top = 0;\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            string op;\n' +
        '            cin >> op;\n' +
        '            if (op == "push") {\n' +
        '                unsigned long long x;\n' +
        '                cin >> x;\n' +
        '                st[++top] = x;\n' +
        '            } else if (op == "pop") {\n' +
        '                if (top == 0) cout << "Empty" << \'\\n\';\n' +
        '                else top--;\n' +
        '            } else if (op == "query") {\n' +
        '                if (top == 0) cout << "Anguei!" << \'\\n\';\n' +
        '                else cout << st[top] << \'\\n\';\n' +
        '            } else {\n' +
        '                cout << top << \'\\n\';\n' +
        '            }\n' +
        '        }\n' +
        '    }\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      tests: [
        { input: '2\n5\npush 2\nquery\nsize\npop\nquery\n3\npop\nquery\nsize\n', expected: '2\n1\nAnguei!\nEmpty\nAnguei!\n0\n' },
        { input: '1\n4\npop\nquery\nsize\nquery\n', expected: 'Empty\nAnguei!\n0\nAnguei!\n' },
        { input: '1\n6\npush 18446744073709551615\nquery\nsize\npop\nquery\nsize\n', expected: '18446744073709551615\n1\nAnguei!\n0\n' },
        { input: '2\n3\npush 1\npush 2\nsize\n5\npush 7\nquery\npop\nquery\nsize\n', expected: '2\n7\nAnguei!\n0\n' },
      ],
      hints: [
        '用 `st[++top] = x` 入栈、`top--` 出栈，`top` 同时就是元素个数。',
        '空栈的两种提示不一样：`pop` 空栈输出 `Empty`，`query` 空栈输出 `Anguei!`（注意叹号）。',
        '多组数据别忘了每组开始时把 `top` 清 0，否则上一组的数据会串进来。',
        '`x` 可以到 `2^64 - 1`，用 `unsigned long long` 存，别用 `int`。',
      ],
      luoguKeyword: '栈',
      luoguCode: 'B3614',
      luoguAligned: true,
    }),

    proLesson({
      id: 'p1-2',
      title: '括号匹配',
      difficulty: '简单',
      knowledge: '栈的应用',
      story:
        '编译器检查你的代码时，第一件事就是看括号有没有配对。\n\n' +
        '这个问题用栈解决得极其漂亮：**遇到左括号就压进去，遇到右括号就看它跟栈顶的左括号是不是一对**。',
      task:
        '洛谷 P1739 表达式括号匹配：读入一个以 `@` 结尾的表达式，判断其中的**圆括号** `(` `)` 是否匹配 —— 匹配输出 `YES`，否则输出 `NO`。',
      lesson: `**核心思路**：栈顶永远是"最近一个还没被配对的左括号"。

\`\`\`cpp
for (char c : s) {
    if (c == '(' || c == '[' || c == '{') {
        st[++top] = c;                 // 左括号入栈
    } else {
        if (top == 0) { ok = false; break; }   // 没有可配对的左括号
        char need;                     // 这个右括号需要哪种左括号
        if (c == ')') need = '(';
        else if (c == ']') need = '[';
        else need = '{';
        if (st[top] != need) { ok = false; break; }  // 类型对不上
        top--;                         // 配对成功，弹出
    }
}
if (top != 0) ok = false;              // 还有没配对的左括号
\`\`\`

${pointsTable([
  ['为什么用栈', '括号配对是"最近优先"的关系，正好是后进先出'],
  ['左括号', '无条件入栈'],
  ['右括号', '先看栈是否为空，再比类型；都对得上才弹栈'],
  ['结束时', '栈必须为空，否则说明有左括号没被配对'],
  ['复杂度', '每个字符只处理一次，$O(n)$；栈最多存 $n$ 个字符，$O(n)$'],
])}`,
      inputFormat:
        '一行：一个以 `@` 结束的表达式。表达式里可能包含数字、小写字母、`+` `-` `*` `/` 和圆括号，长度小于 255，左括号少于 20 个。只需要关心圆括号。',
      outputFormat:
        '一行：`YES`（括号匹配）或 `NO`（不匹配）。',
      mistakes: mistakesTable([
        ['遇到右括号不判断栈是否为空', '空栈时读到 `st[0]`，结果错误甚至越界', '先判断 `top == 0` → 直接判定不匹配'],
        ['只检查数量不检查类型', '`([)]` 会被误判为 YES', '右括号必须与栈顶左括号**类型相同**'],
        ['忘了最后检查栈是否为空', '`"((("` 会被误判为 YES', '循环结束后判断 `top == 0`'],
        ['匹配后忘记弹出栈顶', '后续括号全都会对不上', '配对成功要 `top--`'],
        ['判断成功后又继续处理', '多余的逻辑可能把 ok 改回去', '发现不匹配就 `break` 或直接输出 NO'],
      ]),
      tips:
        '- 读入整行用 `getline(cin, s)`，比 `cin >> s` 稳（表达式中间可能有空格）。\n' +
        '- 别忘了遇到 `@` 就结束扫描，`@` 后面的字符不属于表达式。\n' +
        '- 这道题的洛谷原题是 P1739 表达式括号匹配，题号已经填在下面的提交面板里。',
      starter:
        '#include <iostream>\n' +
        '#include <string>\n' +
        'using namespace std;\n' +
        '\n' +
        'int main() {\n' +
        '    string s;\n' +
        '    getline(cin, s);   // 整行读入，表达式里可能有空格\n' +
        '\n' +
        '    int depth = 0;     // 当前有多少个"还没配对"的左括号\n' +
        '    for (int i = 0; i < (int)s.size(); i++) {\n' +
        '        char c = s[i];\n' +
        '        if (c == \'@\') break;      // 表达式结束\n' +
        '        // TODO: 遇到 \'(\' 让 depth 加 1\n' +
        '        // TODO: 遇到 \')\' 时，如果 depth 已经是 0 就直接输出 NO 并结束，否则 depth 减 1\n' +
        '    }\n' +
        '\n' +
        '    // TODO: 循环结束后，depth 为 0 输出 YES，否则输出 NO\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      solution:
        '#include <iostream>\n' +
        '#include <string>\n' +
        'using namespace std;\n' +
        '\n' +
        'int main() {\n' +
        '    string s;\n' +
        '    getline(cin, s);\n' +
        '\n' +
        '    int depth = 0;\n' +
        '    for (int i = 0; i < (int)s.size(); i++) {\n' +
        '        char c = s[i];\n' +
        '        if (c == \'@\') break;\n' +
        '        if (c == \'(\') {\n' +
        '            depth++;\n' +
        '        } else if (c == \')\') {\n' +
        '            if (depth == 0) {        // 右括号比左括号多了，一定不匹配\n' +
        '                cout << "NO" << \'\\n\';\n' +
        '                return 0;\n' +
        '            }\n' +
        '            depth--;\n' +
        '        }\n' +
        '    }\n' +
        '\n' +
        '    if (depth == 0) cout << "YES" << \'\\n\';\n' +
        '    else cout << "NO" << \'\\n\';\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      tests: [
        { input: '2*(x+y)/(1-x)@\n', expected: 'YES\n' },
        { input: '(25+x)*(a*(a+b+b)@\n', expected: 'NO\n' },
        { input: ')(@\n', expected: 'NO\n' },
        { input: '((()))@\n', expected: 'YES\n' },
        { input: '(a+b)@\n', expected: 'YES\n' },
      ],
      hints: [
        '用一个计数器 `depth` 表示"当前还有几个左括号没配对"：遇到 `(` 加 1，遇到 `)` 减 1。',
        '如果某一步要让 `depth` 减到负数（也就是遇到 `)` 时 `depth == 0`），说明右括号多了，直接输出 `NO`。',
        '扫描到 `@` 就停下；最后 `depth == 0` 才说明左右数量与顺序都匹配。',
      ],
      luoguKeyword: '括号匹配 栈',
      luoguCode: 'P1739',
      luoguAligned: true,
    }),

    proLesson({
      id: 'p1-3',
      title: '后缀表达式求值',
      difficulty: '中等',
      knowledge: '表达式求值',
      story:
        '我们习惯写 `3 + 4 * 5` 这种**中缀表达式**，但它需要处理优先级和括号。\n\n' +
        '把运算符写到操作数后面，变成 `3 4 5 * +` 这种**后缀表达式**（逆波兰表达式），求值就变得非常简单：' +
        '**从左往右扫，遇到数字就压栈，遇到运算符就弹出两个数算一下再压回去。**',
      task:
        '洛谷 P1449 后缀表达式：读入一个后缀表达式（数字以 `.` 结尾、`@` 表示结束），求出它的值。',
      lesson: `**为什么后缀表达式好算**：它已经把运算顺序"排好队"了，从左到右扫一遍即可。

\`\`\`cpp
for (每个 token) {
    if (token 是数字) {
        st[++top] = 数字;
    } else {
        int b = st[top--];      // 注意：先弹出来的是"右操作数"
        int a = st[top--];      // 后弹出来的是"左操作数"
        if (token == '+') st[++top] = a + b;
        else if (token == '-') st[++top] = a - b;
        else st[++top] = a * b;
    }
}
// 最后栈里剩下的唯一一个数就是答案
\`\`\`

${pointsTable([
  ['弹出顺序', '先弹出的是右操作数，后弹出的是左操作数。减法要写成 `a - b`，写成 `b - a` 就错了'],
  ['数字识别', '逐个字符读入时，要一直读到非数字或空格，把多位数字拼起来（本题输入以空格分隔，也可以用 `cin >> token`）'],
  ['结果范围', '中间结果可能超过 `int`，用 `long long` 更稳妥'],
  ['复杂度', '每个 token 只处理一次，$O(n)$'],
])}`,
      inputFormat:
        '一行：一个后缀表达式。例如 `3.5.2.-*7.+@` 表示 `3*(5-2)+7`。数字以 `.` 结尾（`3.` 就是数字 3），运算符只有 `+ - * /`，`@` 是结束符；保证除法除数不为 0，且 `/` 的结果向 0 取整（与 C++ 的 `/` 一致）。',
      outputFormat:
        '一行：表达式的值（整数）。',
      sample:
        '### 样例\n\n**输入**\n\n```\n3 4 + 5 *\n```\n\n**输出**\n\n```\n35\n```\n\n' +
        '过程：先算 `3 + 4 = 7`（此时栈里是 7），再算 `7 * 5 = 35`。',
      mistakes: mistakesTable([
        ['减法和乘法弹栈顺序搞反', '`3 4 -` 算成 `4 - 3 = 1`（正确是 `-1`）', '先弹 `b` 再弹 `a`，减法写 `a - b`'],
        ['用 `int` 存中间结果', '大数相乘溢出，答案变成负数', '栈和变量都用 `long long`'],
        ['把运算符当数字处理', '读到 `+` 时 `cin >> int` 失败，后续全乱', '先整行读入，再按空格切分并判断是否为运算符'],
        ['只支持一位数字', '`12 3 +` 被拆成 `1`、`2` 两个数', '要么用 `cin >>` 逐 token 读，要么手动拼多位数'],
        ['算完没检查栈内容', '表达式不合法时结果错误', '本题保证合法，但可以最后断言栈里恰好剩 1 个数'],
      ]),
      tips:
        '- 运算符只有 `+ - * /` 四种，可以用 `if / else if` 直接分派。\n' +
        '- 后弹出的那个数才是左操作数，写反了减法与除法就会出错。\n' +
        '- 这道题的洛谷原题是 P1449 后缀表达式，题号已经填在下面的提交面板里。',
      starter:
        '#include <iostream>\n' +
        '#include <string>\n' +
        'using namespace std;\n' +
        '\n' +
        'long long st[1005];   // 表达式长度有限，栈开够就行\n' +
        'int top = 0;\n' +
        '\n' +
        'int main() {\n' +
        '    string s;\n' +
        '    cin >> s;\n' +
        '\n' +
        '    for (int i = 0; i < (int)s.size(); i++) {\n' +
        '        char c = s[i];\n' +
        '        if (c == \'@\') break;\n' +
        '        if (c >= \'0\' && c <= \'9\') {\n' +
        '            // TODO: 把连续的数字拼成一个整数（读到 \'.\' 结束），再入栈\n' +
        '        } else {\n' +
        '            // TODO: 弹出栈顶两个数做运算，把结果压回栈里\n' +
        '            //       注意减法和除法是"先弹出的做右操作数"\n' +
        '        }\n' +
        '    }\n' +
        '\n' +
        '    // TODO: 输出栈顶元素（表达式的值）\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      solution:
        '#include <iostream>\n' +
        '#include <string>\n' +
        'using namespace std;\n' +
        '\n' +
        'long long st[1005];\n' +
        'int top = 0;\n' +
        '\n' +
        'int main() {\n' +
        '    string s;\n' +
        '    cin >> s;\n' +
        '\n' +
        '    for (int i = 0; i < (int)s.size(); i++) {\n' +
        '        char c = s[i];\n' +
        '        if (c == \'@\') break;\n' +
        '        if (c >= \'0\' && c <= \'9\') {\n' +
        '            long long value = 0;\n' +
        '            while (s[i] >= \'0\' && s[i] <= \'9\') {   // 拼出完整的多位数\n' +
        '                value = value * 10 + (s[i] - \'0\');\n' +
        '                i++;\n' +
        '            }\n' +
        '            // 此时 s[i] 正好是 \'.\'，for 的 i++ 会跳过它\n' +
        '            st[++top] = value;\n' +
        '        } else {\n' +
        '            long long b = st[top--];   // 先弹出的是右操作数\n' +
        '            long long a = st[top--];\n' +
        '            long long r = 0;\n' +
        '            if (c == \'+\') r = a + b;\n' +
        '            else if (c == \'-\') r = a - b;\n' +
        '            else if (c == \'*\') r = a * b;\n' +
        '            else r = a / b;\n' +
        '            st[++top] = r;\n' +
        '        }\n' +
        '    }\n' +
        '\n' +
        '    cout << st[top] << \'\\n\';\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      tests: [
        { input: '3.5.2.-*7.+@\n', expected: '16\n' },
        { input: '10.28.30./*7.-@\n', expected: '-7\n' },
        { input: '1.2.+@\n', expected: '3\n' },
        { input: '7.3.-@\n', expected: '4\n' },
        { input: '100.10./@\n', expected: '10\n' },
      ],
      hints: [
        '后缀表达式的求值规则：遇到数字就入栈，遇到运算符就弹出两个数计算、再把结果压回去。',
        '数字是多位的、以 `.` 结尾，所以要边读边算：`value = value * 10 + (c - \'0\')`，读到 `.` 才停。',
        '减法与除法有顺序：先弹出的是右操作数。设先弹出 `b`、后弹出 `a`，那么计算的是 `a - b` / `a / b`。',
        '表达式扫描完（遇到 `@`）时，栈里剩下的那个数就是答案。',
      ],
      luoguKeyword: '后缀表达式',
      luoguCode: 'P1449',
      luoguAligned: true,
    }),

    proLesson({
      id: 'p1-4',
      title: '模拟队列',
      difficulty: '简单',
      knowledge: '队列的实现',
      story:
        '队列与栈的唯一区别是"从哪出"：栈从顶上出，队列**从队头出**。\n\n' +
        '用数组实现队列需要一个技巧：头尾指针各自往前跑，跑到数组末尾就绕回开头（环形队列），' +
        '这样不会因为"前面空着却用不了"而浪费空间。',
      task:
        '洛谷 B3616【模板】队列：用数组实现一个队列，按操作序列执行并输出结果。\n' +
        '\n' +
        '- `1 x`：把 x 加入队列\n' +
        '- `2`：弹出队首；空队列时输出 `ERR_CANNOT_POP`\n' +
        '- `3`：输出队首；空队列时输出 `ERR_CANNOT_QUERY`\n' +
        '- `4`：输出队列内元素个数',
      lesson: `**用两个指针描述队列**：

\`\`\`cpp
int q[1005];
int head = 0;   // 队头：指向当前第一个元素
int tail = 0;   // 队尾：指向"下一个可以放元素的位置"
                // 元素个数 = tail - head
\`\`\`

${pointsTable([
  ['入队 push x', '`q[tail++] = x;` —— 放到 tail 位置，tail 后移'],
  ['出队 pop', '`int v = q[head++];` —— 取 head 位置，head 后移'],
  ['取队头 front', '`q[head]`（只读）'],
  ['元素个数', '`tail - head`'],
  ['空队列', '`head == tail`'],
])}

因为题目最多 n 次入队，开 \`n + 5\` 大小的数组就够了，**不需要真的绕回**（本阶段先不引入取模环形队列，等题目要求"反复入队出队很多次"时再考虑）。

复杂度：每个操作 $O(1)$，总体 $O(n)$；空间 $O(n)$。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 10000`），表示操作条数。\n' +
        '\n' +
        '接下来 `n` 行，每行一个操作：`1 x`（把 `x` 加入队列，`x` 是 `[1, 10^6]` 内的正整数）、`2`、`3` 或 `4`。',
      outputFormat:
        '按操作顺序输出，每条输出占一行：`2` 空队列输出 `ERR_CANNOT_POP`；`3` 空队列输出 `ERR_CANNOT_QUERY`、非空输出队首元素；`4` 输出元素个数。`1` 不输出任何内容。',
      mistakes: mistakesTable([
        ['用 `head` 当元素个数', '出队一次后 `size` 就错了', '元素个数是 `tail - head`'],
        ['`head` 和 `tail` 混用', '`push` 和 `pop` 互相覆盖，顺序全乱', '入队动 `tail`，出队动 `head`'],
        ['空队列判断写成 `head == 0`', '出队过就不成立，会取到过期数据', '空队列是 `head == tail`'],
        ['数组只开到 n', 'n 次入队时最后一次越界', '开到 `n + 5`'],
      ]),
      tips:
        '- 与栈相比，队列只在"弹出"的一头不同：栈弹 `tail`，队列弹 `head`。\n' +
        '- `head` 只会往后走，不会回头，所以数组开到 `n + 5` 就够。\n' +
        '- 这道题的洛谷原题是 B3616【模板】队列，题号已经填在下面的提交面板里。',
      starter:
        '#include <iostream>\n' +
        'using namespace std;\n' +
        '\n' +
        'int q[10005];\n' +
        'int head = 1, tail = 0;   // 队列里的元素是 q[head] .. q[tail]\n' +
        '\n' +
        'int main() {\n' +
        '    int n;\n' +
        '    cin >> n;\n' +
        '\n' +
        '    for (int i = 0; i < n; i++) {\n' +
        '        int op;\n' +
        '        cin >> op;\n' +
        '        if (op == 1) {\n' +
        '            int x;\n' +
        '            cin >> x;\n' +
        '            // TODO: 入队（tail 往后挪一格）\n' +
        '        } else if (op == 2) {\n' +
        '            // TODO: 空队列输出 ERR_CANNOT_POP，否则 head 往后挪一格\n' +
        '        } else if (op == 3) {\n' +
        '            // TODO: 空队列输出 ERR_CANNOT_QUERY，否则输出队首 q[head]\n' +
        '        } else {\n' +
        '            // TODO: 输出元素个数\n' +
        '        }\n' +
        '    }\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      solution:
        '#include <iostream>\n' +
        'using namespace std;\n' +
        '\n' +
        'int q[10005];\n' +
        'int head = 1, tail = 0;\n' +
        '\n' +
        'int main() {\n' +
        '    int n;\n' +
        '    cin >> n;\n' +
        '\n' +
        '    for (int i = 0; i < n; i++) {\n' +
        '        int op;\n' +
        '        cin >> op;\n' +
        '        if (op == 1) {\n' +
        '            int x;\n' +
        '            cin >> x;\n' +
        '            q[++tail] = x;\n' +
        '        } else if (op == 2) {\n' +
        '            if (head > tail) cout << "ERR_CANNOT_POP" << \'\\n\';\n' +
        '            else head++;\n' +
        '        } else if (op == 3) {\n' +
        '            if (head > tail) cout << "ERR_CANNOT_QUERY" << \'\\n\';\n' +
        '            else cout << q[head] << \'\\n\';\n' +
        '        } else {\n' +
        '            cout << tail - head + 1 << \'\\n\';\n' +
        '        }\n' +
        '    }\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      tests: [
        { input: '13\n1 2\n3\n4\n1 233\n3\n2\n3\n2\n4\n3\n2\n1 144\n3\n', expected: '2\n1\n2\n233\n0\nERR_CANNOT_QUERY\nERR_CANNOT_POP\n144\n' },
        { input: '4\n3\n2\n4\n1 5\n', expected: 'ERR_CANNOT_QUERY\nERR_CANNOT_POP\n0\n' },
        { input: '6\n1 1\n1 2\n3\n2\n3\n4\n', expected: '1\n2\n1\n' },
      ],
      hints: [
        '队列是"先进先出"，所以要用两个指针：`head` 指队首、`tail` 指队尾，区间 `[head, tail]` 就是队列里的元素。',
        '队列为空的条件是 `head > tail`（初始 `head = 1, tail = 0` 正好表示空）。',
        '元素个数是 `tail - head + 1`，不需要额外的计数器。',
        '两个错误提示要一模一样：`ERR_CANNOT_POP` 与 `ERR_CANNOT_QUERY`，别写反。',
      ],
      luoguKeyword: '队列',
      luoguCode: 'B3616',
      luoguAligned: true,
    }),

    proLesson({
      id: 'p1-5',
      title: '下一个更大元素',
      difficulty: '中等',
      knowledge: '单调栈',
      story:
        '对数组里的每个数，想知道"它右边第一个比它大的数是谁"。\n\n' +
        '从右往左扫，并维护一个**从栈底到栈顶递减**的栈（单调栈），就能一遍扫完得到所有答案——' +
        '这是"找最近的大于/小于关系"这一类问题的通用套路。',
      task:
        '洛谷 P5788【模板】单调栈：对数列中的每个数，求它**右边第一个比它大的数的下标**；如果不存在就输出 `0`。',
      lesson: `**暴力做法**是每个位置往右找，最坏 $O(n^2)$；单调栈能做到 $O(n)$。

**关键观察**：从右往左处理时，如果栈顶元素比当前数小，那么它对更左边的数来说**永远不可能成为答案**（因为当前数更大、位置更靠左），可以直接扔掉。

\`\`\`cpp
for (int i = n; i >= 1; i--) {
    while (top > 0 && st[top] <= a[i]) top--;   // 把不可能成为答案的都弹掉
    ans[i] = (top == 0) ? -1 : st[top];          // 剩下的栈顶就是右边第一个更大元素
    st[++top] = a[i];                            // 当前数入栈，供左边使用
}
\`\`\`

${pointsTable([
  ['扫描方向', '从右往左。这样"右边"的信息已经准备好了'],
  ['栈内顺序', '从栈底到栈顶**递减**（严格递减，因为相等也要弹掉）'],
  ['弹栈条件', '`st[top] <= a[i]` 就弹——等于也要弹，题目要的是"更大"'],
  ['答案来源', '弹完之后栈顶就是右边第一个更大的数；栈空则答案是 -1'],
  ['复杂度', '每个元素最多入栈一次、出栈一次，$O(n)$；空间 $O(n)$'],
])}`,
      inputFormat:
        '第一行一个正整数 `n`（`1 ≤ n ≤ 3×10^6`）。\n' +
        '\n' +
        '第二行 `n` 个正整数 `a_1 … a_n`（`1 ≤ a_i ≤ 10^9`）。',
      outputFormat:
        '一行 `n` 个整数 `f(1) f(2) … f(n)`，用空格隔开：`f(i)` 表示 `i` 右边第一个大于 `a_i` 的元素的下标，不存在则为 `0`。',
      mistakes: mistakesTable([
        ['从左往右扫描', '拿不到"右边"的信息，逻辑会反过来', '从右往左扫，让右边先处理完'],
        ['弹栈条件写成 `st[top] < a[i]`', '相等的元素没被弹掉，答案是相等值而不是更大值', '用 `<=`（题目要求严格更大）'],
        ['忘记把当前元素入栈', '左边元素的答案全部丢失', '处理完当前元素后 `st[++top] = a[i]`'],
        ['输出时行末多一个空格', '评测按行比对时可能不通过（本站会忽略行尾空格，但真实 OJ 未必）', '用 `if (i > 1) cout << " ";` 控制分隔符'],
        ['用 `int` 存 a[i]（本题范围内可以，但要注意更大范围）', '遇到 $10^{18}$ 级别的数据会溢出', '养成习惯：大范围数据用 `long long`'],
      ]),
      tips:
        '- 每个下标最多进栈一次、出栈一次，所以总复杂度是 O(n)，比两层循环的 O(n²) 快得多。\n' +
        '- 数组要开到 `3×10^6 + 5`，这是这道题最容易踩的坑。\n' +
        '- 这道题的洛谷原题是 P5788【模板】单调栈，题号已经填在下面的提交面板里。',
      starter:
        '#include <iostream>\n' +
        'using namespace std;\n' +
        '\n' +
        'const int MAXN = 3000005;   // n 最大 3e6\n' +
        'int a[MAXN];\n' +
        'int st[MAXN];    // 单调栈：里面存的是下标\n' +
        'int ans[MAXN];\n' +
        '\n' +
        'int main() {\n' +
        '    ios::sync_with_stdio(false);   // 3e6 的数据量，必须关掉 cin/cout 同步\n' +
        '    cin.tie(nullptr);\n' +
        '\n' +
        '    int n;\n' +
        '    cin >> n;\n' +
        '    for (int i = 1; i <= n; i++) cin >> a[i];\n' +
        '\n' +
        '    int top = 0;\n' +
        '    // TODO: 从右往左扫描，用单调栈求出每个位置的答案\n' +
        '    //       栈里存"还没被更大值"淘汰"的下标"，从栈顶到栈底对应的值递减\n' +
        '\n' +
        '    for (int i = 1; i <= n; i++) {\n' +
        '        if (i > 1) cout << \' \';\n' +
        '        cout << ans[i];\n' +
        '    }\n' +
        '    cout << \'\\n\';\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      solution:
        '#include <iostream>\n' +
        'using namespace std;\n' +
        '\n' +
        'const int MAXN = 3000005;\n' +
        'int a[MAXN];\n' +
        'int st[MAXN];\n' +
        'int ans[MAXN];\n' +
        '\n' +
        'int main() {\n' +
        '    ios::sync_with_stdio(false);\n' +
        '    cin.tie(nullptr);\n' +
        '\n' +
        '    int n;\n' +
        '    cin >> n;\n' +
        '    for (int i = 1; i <= n; i++) cin >> a[i];\n' +
        '\n' +
        '    int top = 0;\n' +
        '    for (int i = n; i >= 1; i--) {\n' +
        '        // 栈里所有"不比 a[i] 大"的下标都不可能成为答案，直接弹掉\n' +
        '        while (top > 0 && a[st[top]] <= a[i]) top--;\n' +
        '        ans[i] = (top > 0) ? st[top] : 0;\n' +
        '        st[++top] = i;\n' +
        '    }\n' +
        '\n' +
        '    for (int i = 1; i <= n; i++) {\n' +
        '        if (i > 1) cout << \' \';\n' +
        '        cout << ans[i];\n' +
        '    }\n' +
        '    cout << \'\\n\';\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      tests: [
        { input: '5\n1 4 2 3 5\n', expected: '2 5 4 5 0\n' },
        { input: '3\n1 2 3\n', expected: '2 3 0\n' },
        { input: '4\n4 3 2 1\n', expected: '0 0 0 0\n' },
        { input: '1\n1000000000\n', expected: '0\n' },
        { input: '6\n5 1 3 2 4 6\n', expected: '6 3 5 5 6 0\n' },
      ],
      hints: [
        '从右往左扫更容易想：处理 `i` 时，右边所有位置都已经处理过了。',
        '栈里始终保存"候选答案"：从栈顶到栈底，值越来越大（单调）。',
        '遇到 `a[i]` 时，把栈顶那些**小于等于** `a[i]` 的下标全弹掉（它们会被 `a[i]` 挡住），剩下的栈顶就是答案。',
        '`n` 最大 3e6，记得 `ios::sync_with_stdio(false)` 并且用 `\'\\n\'` 而不是 `endl`。',
      ],
      luoguKeyword: '单调栈',
      luoguCode: 'P5788',
      luoguAligned: true,
    }),

    proLesson({
      id: 'p1-6',
      title: '滑动窗口最大值',
      difficulty: '中等',
      knowledge: '单调队列',
      story:
        '一个长度为 k 的窗口在数组上从左往右滑动，每滑动一次要求出窗口内的最大值。\n\n' +
        '暴力做法每次重新扫 k 个数，是 $O(nk)$。把栈换成**单调队列**（队头最大、从队尾入队），就能做到 $O(n)$。',
      task:
        '洛谷 P1886 滑动窗口：窗口大小为 `k`，从序列最左端开始每次向右滑动一格，求**每个窗口里的最小值与最大值**。',
      lesson: `**单调队列的两个动作**：

1. **入队前从队尾弹**：如果队尾元素不比当前元素大（\`<=\`），那它在窗口里永远不可能成为最大值（因为当前元素更大且在它右边，会更晚滑出窗口），直接弹掉。
2. **入队后从队头弹**：如果队头元素已经滑出窗口（下标 \`≤ i - k\`），弹掉。

这样队头永远是当前窗口的最大值。

\`\`\`cpp
int head = 1, tail = 0;                    // 队列用 q[] 存"下标"
for (int i = 1; i <= n; i++) {
    while (tail >= head && a[q[tail]] <= a[i]) tail--;   // ① 队尾比它小的弹掉
    q[++tail] = i;                                        // 当前下标入队
    if (q[head] <= i - k) head++;                         // ② 队头滑出窗口
    if (i >= k) cout << a[q[head]] << " ";                 // 队头即窗口最大值
}
\`\`\`

${pointsTable([
  ['队列里存什么', '存**下标**而不是值——因为还要判断"是否滑出窗口"'],
  ['从队尾弹的条件', '`a[队尾] <= a[i]`，等于也弹（同样大小时保留更靠右的，能活得更久）'],
  ['从队头弹的条件', '`q[head] <= i - k`，说明这个下标已经不在窗口 `[i-k+1, i]` 内'],
  ['输出时机', '`i >= k` 时窗口才凑满 k 个元素'],
  ['单调性', '队列里的值从队头到队尾**递减**，所以队头就是最大值'],
  ['复杂度', '每个下标进出队各一次，$O(n)$；空间 $O(k)$'],
])}`,
      inputFormat:
        '第一行两个正整数 `n, k`（`1 ≤ k ≤ n ≤ 10^6`）。\n' +
        '\n' +
        '第二行 `n` 个整数 `a_1 … a_n`（`-2^31 ≤ a_i < 2^31`）。',
      outputFormat:
        '输出两行，每行 `n - k + 1` 个数，用空格隔开：第一行是每个窗口的最小值，第二行是每个窗口的最大值。',
      sample:
        '### 样例\n\n**输入**\n\n```\n8 3\n1 3 -1 -3 5 3 6 7\n```\n\n**输出**\n\n```\n3 3 5 5 6 7\n```\n\n' +
        '第 1 个窗口 `[1,3,-1]` 最大值 3；第 2 个窗口 `[3,-1,-3]` 最大值 3；以此类推。',
      mistakes: mistakesTable([
        ['队列里存值而不是下标', '无法判断队头是否滑出窗口', '队列存下标 `i`，比较时用 `a[q[tail]]`'],
        ['忘记从队头清理过期元素', '最大值可能是早就滑出窗口的老元素', '入队后检查 `q[head] <= i - k` 并 `head++`'],
        ['从队尾弹时用 `<` 而不是 `<=`', '相等元素都留着，判断反而更容易出错（不是最优写法）', '用 `<=` 弹掉，保证队列里下标递增且值递减'],
        ['在 `i < k` 时就输出', '窗口还没凑满，答案个数会多', '只在 `i >= k` 时输出'],
        ['用普通队列（只从队尾入、队头出）', '$O(nk)$，数据大时会超时', '关键是"从队尾弹掉没用的元素"这一步'],
      ]),
      tips:
        '- 每个下标最多进出队列一次，总复杂度 O(n)。\n' +
        '- 求最大值时弹掉的是"小于等于当前值"的队尾；求最小值时是"大于等于当前值"，别写反。\n' +
        '- 这道题的洛谷原题是 P1886【模板】单调队列 / 滑动窗口，题号已经填在下面的提交面板里。',
      starter:
        '#include <iostream>\n' +
        'using namespace std;\n' +
        '\n' +
        'const int MAXN = 1000005;\n' +
        'int a[MAXN];\n' +
        'int q[MAXN];    // 单调队列：里面存的是下标\n' +
        'int res[MAXN];\n' +
        '\n' +
        'int main() {\n' +
        '    ios::sync_with_stdio(false);\n' +
        '    cin.tie(nullptr);\n' +
        '\n' +
        '    int n, k;\n' +
        '    cin >> n >> k;\n' +
        '    for (int i = 1; i <= n; i++) cin >> a[i];\n' +
        '\n' +
        '    // TODO: 先用单调队列求出每个窗口的最小值（填进 res[]），按格式输出第一行\n' +
        '    // TODO: 再用同样的方法求最大值（把比较方向反过来），输出第二行\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      solution:
        '#include <iostream>\n' +
        'using namespace std;\n' +
        '\n' +
        'const int MAXN = 1000005;\n' +
        'int a[MAXN];\n' +
        'int q[MAXN];\n' +
        'int res[MAXN];\n' +
        '\n' +
        '/** 单调队列求窗口极值：maximum 为 true 时求最大值，否则求最小值 */\n' +
        'void solve(int n, int k, bool maximum) {\n' +
        '    int head = 1, tail = 0;\n' +
        '    for (int i = 1; i <= n; i++) {\n' +
        '        // 队尾那些"不如当前值"的下标永远不会再成为答案，弹掉\n' +
        '        while (head <= tail && (maximum ? a[q[tail]] <= a[i] : a[q[tail]] >= a[i])) tail--;\n' +
        '        q[++tail] = i;\n' +
        '        // 队首如果已经滑出窗口 [i-k+1, i] 就丢掉\n' +
        '        if (q[head] <= i - k) head++;\n' +
        '        if (i >= k) res[i - k + 1] = a[q[head]];\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'void output(int count) {\n' +
        '    for (int i = 1; i <= count; i++) {\n' +
        '        if (i > 1) cout << \' \';\n' +
        '        cout << res[i];\n' +
        '    }\n' +
        '    cout << \'\\n\';\n' +
        '}\n' +
        '\n' +
        'int main() {\n' +
        '    ios::sync_with_stdio(false);\n' +
        '    cin.tie(nullptr);\n' +
        '\n' +
        '    int n, k;\n' +
        '    cin >> n >> k;\n' +
        '    for (int i = 1; i <= n; i++) cin >> a[i];\n' +
        '\n' +
        '    solve(n, k, false);\n' +
        '    output(n - k + 1);\n' +
        '    solve(n, k, true);\n' +
        '    output(n - k + 1);\n' +
        '    return 0;\n' +
        '}\n' +
        '',
      tests: [
        { input: '8 3\n1 3 -1 -3 5 3 6 7\n', expected: '-1 -3 -3 -3 3 3\n3 3 5 5 6 7\n' },
        { input: '1 1\n42\n', expected: '42\n42\n' },
        { input: '5 5\n4 4 4 4 4\n', expected: '4\n4\n' },
        { input: '4 2\n-1 -2 -3 -4\n', expected: '-2 -3 -4\n-1 -2 -3\n' },
      ],
      hints: [
        '最小值与最大值是同一个套路，只是比较方向相反，可以写成一个带开关的函数。',
        '队列里存**下标**而不是值：这样既能比大小，又能判断队首有没有滑出窗口。',
        '每次移动后：先弹出队尾那些"不可能更好"的元素，再把新下标入队，然后判断队首是否过期，最后记录答案。',
        '第一个窗口在 `i == k` 时形成，一共 `n - k + 1` 个答案。',
      ],
      luoguKeyword: '单调队列 滑动窗口',
      luoguCode: 'P1886',
      luoguAligned: true,
    }),
  ],
};
