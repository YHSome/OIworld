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
        '按顺序执行 n 条操作，对 `pop` / `top` / `size` 操作输出结果：\n\n' +
        '- `push x`：把 x 入栈\n- `pop`：弹出栈顶，输出被弹出的值；栈空时输出 `-1`\n' +
        '- `top`：输出栈顶元素；栈空时输出 `-1`\n- `size`：输出当前元素个数',
      lesson: `**栈的模型**：只有一个口，后进去的先出来（LIFO）。

用数组实现时，约定一个变量 \`top\`：

\`\`\`cpp
int st[1005];   // 存数据，开得比最大操作数大一点
int top = 0;    // 栈顶指针：0 表示栈里没有元素
                // 元素放在 st[1] .. st[top]
\`\`\`

${pointsTable([
  ['入栈 push x', '`st[++top] = x;` —— 先把 top 加 1，再放进去'],
  ['出栈 pop', '`int v = st[top]; top--;` —— 先取出来，再把 top 减 1'],
  ['取栈顶 top', '`st[top]` —— 只读，不改 top'],
  ['栈的大小 size', '正好等于 `top`'],
  ['栈空判断', '`top == 0`（这就是为什么下标从 1 开始：0 天然表示空）'],
])}

**为什么下标从 1 开始？** 如果从 0 开始存，空栈时 top 该是多少就没有自然的值了（0 既表示空又表示"第 0 个位置有元素"），从 1 开始能省掉一个特判。

复杂度：每个操作都是 $O(1)$，总复杂度 $O(n)$。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 1000`），表示操作条数。\n\n' +
        '接下来 `n` 行，每行一条操作：`push x`（`-1000 ≤ x ≤ 1000`）、`pop`、`top` 或 `size`。保证 `push` 不会超过数组容量。',
      outputFormat:
        '对每条 `pop` / `top` / `size` 操作输出一行整数（`pop` 与 `top` 在栈空时输出 `-1`）；`push` 不输出。',
      mistakes: mistakesTable([
        ['让 `top` 从 0 开始存数据', '空栈与"有一个元素"无法区分，边界判断容易错', '下标从 1 开始，`top == 0` 即空栈'],
        ['`push` 写成 `st[top++] = x;`', '第一个元素被放到 `st[0]`，之后所有位置都错位', '用 `st[++top] = x;`'],
        ['`pop` 时先 `top--` 再取值', '取到的是被丢弃位置的值，且空栈时越界', '先 `st[top]`，再 `top--`'],
        ['栈空时没有判断直接取 `st[top]`', '`st[0]` 是未初始化的值，输出错误', '所有取栈顶的地方都先判断 `top == 0`'],
        ['数组开得和 n 一样大', '入栈 n 次会越界', '开到 `n + 5` 以上'],
      ]),
      tips:
        '- 本题的输入输出框架已经写好了，你只需要把四个 `// TODO` 补上。\n' +
        '- 调试时可以先把 `size` 打印出来，确认每次 push/pop 之后元素个数符合预期。\n' +
        '- 洛谷同类型题目：栈的基本操作（可点击题目页下方的洛谷链接按关键词搜索）。',
      starter: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    // TODO: 定义数组 st（建议开 1005）与栈顶指针 top（初始 0）
    for (int i = 0; i < n; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            // TODO: 入栈
        } else if (op == "pop") {
            // TODO: 空栈输出 -1，否则弹出并输出被弹出的值
        } else if (op == "top") {
            // TODO: 空栈输出 -1，否则输出栈顶
        } else if (op == "size") {
            // TODO: 输出元素个数
        }
    }
    return 0;
}
`,
      solution: `#include <iostream>
#include <string>
using namespace std;

int st[1005];
int top = 0;

int main() {
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            st[++top] = x;
        } else if (op == "pop") {
            if (top == 0) {
                cout << -1 << endl;
            } else {
                cout << st[top] << endl;
                top--;
            }
        } else if (op == "top") {
            if (top == 0) {
                cout << -1 << endl;
            } else {
                cout << st[top] << endl;
            }
        } else if (op == "size") {
            cout << top << endl;
        }
    }
    return 0;
}
`,
      tests: [
        { input: '7\npush 5\npush 3\ntop\nsize\npop\nsize\npop\n', expected: '3\n2\n3\n1\n5\n' },
        { input: '3\npop\ntop\nsize\n', expected: '-1\n-1\n0\n' },
        { input: '5\npush -7\ntop\npop\npop\nsize\n', expected: '-7\n-7\n-1\n0\n' },
        { input: '4\npush 1\npush 2\npush 3\nsize\n', expected: '3\n' },
      ],
      hints: [
        '用 `st[++top] = x` 入栈、`st[top--]` 出栈，`top` 同时就是元素个数。',
        '`push` 操作不输出任何东西，只有 `pop` / `top` / `size` 才输出一行。',
        '别忘了所有取值前都判断 `top == 0`（栈空返回 -1）。',
      ],
      luoguKeyword: '栈',
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
        '给定一个只由 `(` `)` `[` `]` `{` `}` 组成的字符串，判断括号是否**正确配对**：\n\n' +
        '- 每个右括号都必须与**最近的一个**未配对左括号类型相同；\n' +
        '- 全部字符处理完后，不能有剩余的未配对左括号。\n\n' +
        '配对了输出 `YES`，否则输出 `NO`。',
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
      inputFormat: '一行，一个只包含 `(` `)` `[` `]` `{` `}` 的字符串 `s`（长度 `1 ≤ |s| ≤ 1000`），不含空格。',
      outputFormat: '输出一行：`YES` 表示括号正确配对，`NO` 表示不配对（注意全大写）。',
      mistakes: mistakesTable([
        ['遇到右括号不判断栈是否为空', '空栈时读到 `st[0]`，结果错误甚至越界', '先判断 `top == 0` → 直接判定不匹配'],
        ['只检查数量不检查类型', '`([)]` 会被误判为 YES', '右括号必须与栈顶左括号**类型相同**'],
        ['忘了最后检查栈是否为空', '`"((("` 会被误判为 YES', '循环结束后判断 `top == 0`'],
        ['匹配后忘记弹出栈顶', '后续括号全都会对不上', '配对成功要 `top--`'],
        ['判断成功后又继续处理', '多余的逻辑可能把 ok 改回去', '发现不匹配就 `break` 或直接输出 NO'],
      ]),
      tips:
        '- 输入保证不含空格，用 `cin >> s` 直接读一行即可。\n' +
        '- 洛谷同类型题目：括号匹配（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    // TODO: 用栈模拟配对过程，最后输出 YES 或 NO
    return 0;
}
`,
      solution: `#include <iostream>
#include <string>
using namespace std;

char st[1005];

int main() {
    string s;
    cin >> s;
    int top = 0;
    bool ok = true;
    for (int i = 0; i < (int)s.size(); i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') {
            st[++top] = c;
        } else {
            if (top == 0) {
                ok = false;
                break;
            }
            char need;
            if (c == ')') need = '(';
            else if (c == ']') need = '[';
            else need = '{';
            if (st[top] != need) {
                ok = false;
                break;
            }
            top--;
        }
    }
    if (top != 0) ok = false;
    cout << (ok ? "YES" : "NO") << endl;
    return 0;
}
`,
      tests: [
        { input: '([]){}\n', expected: 'YES\n' },
        { input: '([)]\n', expected: 'NO\n' },
        { input: '(((\n', expected: 'NO\n' },
        { input: ')\n', expected: 'NO\n' },
        { input: '{[()()]}\n', expected: 'YES\n' },
      ],
      hints: [
        '遇到左括号就压栈；遇到右括号就检查栈顶是不是它对应的左括号。',
        '右括号来时如果栈是空的，说明没有可配对的左括号，直接判 NO。',
        '循环结束后别忘了检查栈是否为空——否则 `"((("` 会被误判。',
      ],
      luoguKeyword: '括号匹配 栈',
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
        '给定一个以空格分隔的后缀表达式（操作数是非负整数，运算符是 `+` `-` `*`），求它的值。',
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
        '一行后缀表达式，操作数与运算符之间**用一个空格分隔**。操作数是不超过 100 的非负整数，运算符只有 `+`、`-`、`*`。\n\n' +
        '保证表达式合法：不会出现除零、不会出现栈不够弹的情况。',
      outputFormat: '输出一个整数，表示表达式的值。',
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
        '- 用 `string token; cin >> token;` 逐个读 token 最省事：它天然按空白分隔，多位数字也能一次读完。\n' +
        '- 判断 token 是运算符还是数字：可以看 `token[0]` 是不是 `+` `-` `*`；由于操作数非负，不会有负数与减号混淆的问题。\n' +
        '- 洛谷同类型题目：后缀表达式（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <string>
using namespace std;

long long st[1005];

int main() {
    string token;
    int top = 0;
    while (cin >> token) {
        // TODO: token 是运算符就弹出两个数计算后压回，否则转成数字压栈
    }
    // TODO: 输出栈顶（答案）
    return 0;
}
`,
      solution: `#include <iostream>
#include <string>
using namespace std;

long long st[1005];

int main() {
    string token;
    int top = 0;
    while (cin >> token) {
        if (token == "+" || token == "-" || token == "*") {
            long long b = st[top--];
            long long a = st[top--];
            if (token == "+") st[++top] = a + b;
            else if (token == "-") st[++top] = a - b;
            else st[++top] = a * b;
        } else {
            long long value = 0;
            for (int i = 0; i < (int)token.size(); i++) {
                value = value * 10 + (token[i] - '0');
            }
            st[++top] = value;
        }
    }
    cout << st[top] << endl;
    return 0;
}
`,
      tests: [
        { input: '3 4 + 5 *\n', expected: '35\n' },
        { input: '3 4 -\n', expected: '-1\n' },
        { input: '12 3 +\n', expected: '15\n' },
        { input: '100 100 *\n', expected: '10000\n' },
        { input: '1 2 + 3 4 + *\n', expected: '21\n' },
      ],
      hints: [
        '用 `while (cin >> token)` 逐个读，读到文件/输入结束为止（把整个输入读完即可）。',
        '运算符时先弹出右操作数 `b`，再弹左操作数 `a`，然后算 `a op b`。',
        '多位数字要自己拼接：`value = value * 10 + (token[i] - \'0\')`。',
      ],
      luoguKeyword: '后缀表达式',
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
        '按顺序执行 n 条操作，对 `pop` / `front` / `size` 操作输出结果：\n\n' +
        '- `push x`：把 x 放入队尾\n- `pop`：队头出队，输出该值；队列为空时输出 `-1`\n' +
        '- `front`：输出队头元素；空队列输出 `-1`\n- `size`：输出当前元素个数',
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
        '第一行一个整数 `n`（`1 ≤ n ≤ 1000`）。\n\n' +
        '接下来 `n` 行，每行一条操作：`push x`（`-1000 ≤ x ≤ 1000`）、`pop`、`front` 或 `size`。',
      outputFormat:
        '对每条 `pop` / `front` / `size` 输出一行整数（`pop` 与 `front` 在队列为空时输出 `-1`）；`push` 不输出。',
      mistakes: mistakesTable([
        ['用 `head` 当元素个数', '出队一次后 `size` 就错了', '元素个数是 `tail - head`'],
        ['`head` 和 `tail` 混用', '`push` 和 `pop` 互相覆盖，顺序全乱', '入队动 `tail`，出队动 `head`'],
        ['空队列判断写成 `head == 0`', '出队过就不成立，会取到过期数据', '空队列是 `head == tail`'],
        ['数组只开到 n', 'n 次入队时最后一次越界', '开到 `n + 5`'],
      ]),
      tips:
        '- 与上一题的栈对照着看：栈只有 `top` 一个指针，队列有 `head`/`tail` 两个。\n' +
        '- 洛谷同类型题目：队列基本操作（可在题目页按关键词搜索）。',
      starter: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n;
    cin >> n;
    // TODO: 定义数组 q 与 head、tail 两个指针
    for (int i = 0; i < n; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            // TODO: 放入队尾
        } else if (op == "pop") {
            // TODO: 空则 -1，否则输出队头并出队
        } else if (op == "front") {
            // TODO: 空则 -1，否则输出队头
        } else if (op == "size") {
            // TODO: 输出元素个数
        }
    }
    return 0;
}
`,
      solution: `#include <iostream>
#include <string>
using namespace std;

int q[1005];

int main() {
    int n;
    cin >> n;
    int head = 0;
    int tail = 0;
    for (int i = 0; i < n; i++) {
        string op;
        cin >> op;
        if (op == "push") {
            int x;
            cin >> x;
            q[tail++] = x;
        } else if (op == "pop") {
            if (head == tail) {
                cout << -1 << endl;
            } else {
                cout << q[head] << endl;
                head++;
            }
        } else if (op == "front") {
            if (head == tail) {
                cout << -1 << endl;
            } else {
                cout << q[head] << endl;
            }
        } else if (op == "size") {
            cout << tail - head << endl;
        }
    }
    return 0;
}
`,
      tests: [
        { input: '6\npush 1\npush 2\nfront\npop\nfront\nsize\n', expected: '1\n1\n2\n1\n' },
        { input: '3\npop\nfront\nsize\n', expected: '-1\n-1\n0\n' },
        { input: '5\npush -3\npush 9\npop\npop\npop\n', expected: '-3\n9\n-1\n' },
        { input: '4\npush 5\nsize\npop\nsize\n', expected: '1\n5\n0\n' },
      ],
      hints: [
        '`q[tail++] = x` 入队，`q[head++]` 出队，元素个数是 `tail - head`。',
        '队列为空即 `head == tail`。',
        '`front` 只看不动：输出 `q[head]` 但不改 `head`。',
      ],
      luoguKeyword: '队列',
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
        '给定 n 个整数，对每个位置 i 输出**右边第一个比 a[i] 大的数**；如果右边没有更大的数，输出 `-1`。\n\n' +
        '一共输出 n 个数，用空格分隔。',
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
        '第一行一个整数 `n`（`1 ≤ n ≤ 1000`）。\n\n第二行 `n` 个整数 `a[1..n]`（`-10^9 ≤ a[i] ≤ 10^9`），用空格分隔。',
      outputFormat: '输出一行 `n` 个整数：每个位置右边第一个更大元素的值，没有则输出 `-1`；相邻两个数之间用一个空格分隔。',
      mistakes: mistakesTable([
        ['从左往右扫描', '拿不到"右边"的信息，逻辑会反过来', '从右往左扫，让右边先处理完'],
        ['弹栈条件写成 `st[top] < a[i]`', '相等的元素没被弹掉，答案是相等值而不是更大值', '用 `<=`（题目要求严格更大）'],
        ['忘记把当前元素入栈', '左边元素的答案全部丢失', '处理完当前元素后 `st[++top] = a[i]`'],
        ['输出时行末多一个空格', '评测按行比对时可能不通过（本站会忽略行尾空格，但真实 OJ 未必）', '用 `if (i > 1) cout << " ";` 控制分隔符'],
        ['用 `int` 存 a[i]（本题范围内可以，但要注意更大范围）', '遇到 $10^{18}$ 级别的数据会溢出', '养成习惯：大范围数据用 `long long`'],
      ]),
      tips:
        '- 先写出暴力解法（每个位置往右扫）验证思路，再换成单调栈。\n' +
        '- 洛谷同类型题目：单调栈（下一个更大元素）。',
      starter: `#include <iostream>
using namespace std;

int a[1005];
int st[1005];   // 单调栈：存的是"候选答案"的值
int ans[1005];

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];
    int top = 0;
    // TODO: 从右往左扫描，用单调栈求每个位置的答案
    // TODO: 按格式输出 ans[1..n]
    return 0;
}
`,
      solution: `#include <iostream>
using namespace std;

int a[1005];
int st[1005];
int ans[1005];

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) cin >> a[i];
    int top = 0;
    for (int i = n; i >= 1; i--) {
        while (top > 0 && st[top] <= a[i]) top--;
        ans[i] = (top == 0) ? -1 : st[top];
        st[++top] = a[i];
    }
    for (int i = 1; i <= n; i++) {
        if (i > 1) cout << " ";
        cout << ans[i];
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '4\n2 1 3 2\n', expected: '3 3 -1 -1\n' },
        { input: '1\n5\n', expected: '-1\n' },
        { input: '5\n1 2 3 4 5\n', expected: '2 3 4 5 -1\n' },
        { input: '5\n5 4 3 2 1\n', expected: '-1 -1 -1 -1 -1\n' },
        { input: '3\n3 3 3\n', expected: '-1 -1 -1\n' },
      ],
      hints: [
        '从右往左处理：处理到位置 i 时，栈里保存的都是 i 右边的"有用"元素。',
        '把栈里比 `a[i]` 小或相等的元素弹掉，剩下的栈顶就是答案。',
        '输出时相邻数字用空格分隔，注意不要多输出行末空格。',
      ],
      luoguKeyword: '单调栈',
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
        '给定 n 个整数和一个窗口长度 k，输出窗口从左到右滑动时**每个位置窗口内的最大值**（共 `n - k + 1` 个）。',
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
        '第一行两个整数 `n` 和 `k`（`1 ≤ k ≤ n ≤ 1000`）。\n\n' +
        '第二行 `n` 个整数 `a[1..n]`（`-10^9 ≤ a[i] ≤ 10^9`），用空格分隔。',
      outputFormat: '输出一行 `n - k + 1` 个整数：每个窗口内的最大值，用空格分隔。',
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
        '- 建议先用暴力解法对拍：小数据下手写暴力，与单调队列结果比对，确认一致再提交。\n' +
        '- 洛谷同类型题目：滑动窗口 / 单调队列。',
      starter: `#include <iostream>
using namespace std;

long long a[1005];
int q[1005];   // 单调队列：里面存的是下标

int main() {
    int n, k;
    cin >> n >> k;
    for (int i = 1; i <= n; i++) cin >> a[i];
    // TODO: 用单调队列求每个长度为 k 的窗口的最大值，并用空格分隔输出
    return 0;
}
`,
      solution: `#include <iostream>
using namespace std;

long long a[1005];
int q[1005];

int main() {
    int n, k;
    cin >> n >> k;
    for (int i = 1; i <= n; i++) cin >> a[i];
    int head = 1;
    int tail = 0;
    bool first = true;
    for (int i = 1; i <= n; i++) {
        while (tail >= head && a[q[tail]] <= a[i]) tail--;
        q[++tail] = i;
        if (q[head] <= i - k) head++;
        if (i >= k) {
            if (!first) cout << " ";
            cout << a[q[head]];
            first = false;
        }
    }
    cout << endl;
    return 0;
}
`,
      tests: [
        { input: '8 3\n1 3 -1 -3 5 3 6 7\n', expected: '3 3 5 5 6 7\n' },
        { input: '1 1\n42\n', expected: '42\n' },
        { input: '5 5\n1 2 3 4 5\n', expected: '5\n' },
        { input: '6 2\n-1 -2 -3 -4 -5 -6\n', expected: '-1 -2 -3 -4 -5\n' },
        { input: '4 3\n5 5 5 5\n', expected: '5 5\n' },
      ],
      hints: [
        '队列里存**下标**：既能取值 `a[q[head]]`，又能判断是否滑出窗口。',
        '入队前从队尾把"不比当前元素大"的都弹掉；入队后从队头把过期下标弹掉。',
        '队头始终是当前窗口的最大值，`i >= k` 时就可以输出它。',
      ],
      luoguKeyword: '单调队列 滑动窗口',
    }),
  ],
};
