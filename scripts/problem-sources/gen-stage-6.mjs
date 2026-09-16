/**
 * 生成 src/data/problems/stage-6.json
 * 阶段六 · 结构体（struct）
 *
 * 用脚本生成 JSON 而不是手写，避免 Markdown 里的换行 / 反引号 / 引号转义出错。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'data', 'problems');

const stage = {
  stage: 6,
  title: '阶段六 · 自定义数据类型',
  subtitle: '结构体 struct',
  summary:
    '现实世界里的"一个学生"往往同时有姓名、成绩好几项信息。`struct` 可以把不同种类的数据打包成**一个新类型**，再用"结构体数组"管理一整班学生，还能把结构体交给函数、按成员排序与查找。',
  problems: [
    {
      id: 's6-p1',
      title: '学生名片',
      difficulty: '入门',
      knowledge_point: 'struct 定义与成员访问',
      description: `### 题目背景

到目前为止，我们学过的变量都是"单个格子"：一个 \`int\` 存一个年龄，一个 \`string\` 存一个名字。

可现实里的"一个学生"通常同时有好几项信息：姓名、成绩……

要是给每个学生都定义一堆零散的变量，很快就乱成一团了。C++ 提供了**结构体**（\`struct\`，structure 的缩写），它能把**若干个不同类型**的变量打包成一个**新类型**，就像把几样东西装进一个贴着标签的文件袋：

\`\`\`cpp
struct Student {
    string name;    // 成员变量：姓名
    int score;      // 成员变量：成绩
};                  // ← 这个分号千万别漏掉！
\`\`\`

花括号里的每一行叫做**成员变量**（简称成员）。有两点要特别注意：

1. 每个成员声明后面都要有分号；
2. 整个 \`struct\` 结束时的大括号后面也**必须**有分号。

定义好之后，\`Student\` 就和 \`int\`、\`string\` 一样，成了一个可以拿来声明变量的类型：

\`\`\`cpp
Student s;                  // 声明一个学生
s.name = "Tom";             // 用点号 . 访问成员
s.score = 95;

Student t{"Jerry", 80};     // 花括号初始化：按顺序一次把成员都填好
\`\`\`

### 任务

读入一个学生的姓名和成绩，把它们存进一个 \`struct Student\` 变量，然后输出一张名片。

### 本关新知识：怎么定义 \`struct\`，怎么取成员

**结构体像一个"自定义的表格模板"**：模板上印着好几栏，每一栏叫一个**成员**，每栏放什么类型由你规定。照着这个模板印出来的每一份表格，就是该结构体类型的一个**变量**。

写结构体永远是两步：**先定模板，再开变量**。

\`\`\`cpp
#include <iostream>             // 用 cin / cout
#include <string>               // 用 string
using namespace std;

struct Student {            // ① 定模板：Student 是新类型的名字（首字母习惯大写）
    string name;            // 模板第一栏：姓名，类型是 string
    int score;              // 模板第二栏：成绩，类型是 int
};                          // ② 整个定义结尾的这个分号必须有！

int main() {
    Student s;              // ③ 用新类型开一个变量，写法和 int x; 一模一样
    cin >> s.name >> s.score;   // ④ 用点号 . 把数据读进对应的成员
    cout << s.name << " " << s.score << endl;
    return 0;
}
\`\`\`

取成员用**点号** \`.\`，读作"某个变量的某个成员"：\`s.name\` 是"学生 s 的姓名"，\`s.score\` 是"学生 s 的成绩"。点号左边写变量名，右边写成员名，顺序别反。

开变量时还可以用**花括号**按定义顺序一次把所有成员填好：

\`\`\`cpp
Student a{"Tom", 95};      // name = "Tom"，score = 95（顺序必须和定义一致）
cout << a.name << endl;    // 输出 Tom
cout << a.score << endl;   // 输出 95
\`\`\`

| 要记住的点 | 说明 |
| --- | --- |
| 定义末尾的分号 | \`};\` 里这个分号丢了，从这一行开始后面会跟着报一串错 |
| 定义写在 \`main\` 外面 | 结构体定义要放在所有函数前面，\`main\` 里才认识 \`Student\` 这个名字 |
| 每个成员自带分号 | 一行一个成员，写成 \`成员类型 成员名;\`，最不容易乱 |
| 取成员用 \`.\` | 例如 \`s.name\`；\`->\` 是给指针用的写法，初学用不到 |
| 花括号按顺序填 | \`Student a{"Tom", 95}\` 对应定义里成员的书写顺序，写反了类型对不上会报错 |

### 输入格式

一行，一个姓名和一个整数成绩，中间用一个空格分隔。

- 姓名只由英文字母组成，不含空格，长度不超过 20；
- 成绩是 \`0\` 到 \`100\` 之间的整数。

### 输出格式

输出两行：

\`\`\`
姓名：<姓名>
成绩：<成绩>
\`\`\`

（冒号是中文全角冒号，直接从题目里复制即可。）

### 样例

**输入**

\`\`\`
Tom 95
\`\`\`

**输出**

\`\`\`
姓名：Tom
成绩：95
\`\`\`

### 说明

- 成绩可能是 \`0\`（考砸了），也可能是 \`100\`（满分），两种都要正确输出。
- 姓名长度不固定，一个字母或者一长串字母都要正常输出。

### 小贴士

- \`cin >> s.name >> s.score;\` 可以直接把数据读进结构体的成员里。
- 访问成员用点号：\`s.name\` 就是"学生 s 的姓名"。
- 结构体的定义要写在 \`main\` 函数**外面（上面）**，这样 \`main\` 里才认识 \`Student\` 这个类型。

### 常见错误

| 你可能写成 | 会发生什么 | 正确写法 |
| --- | --- | --- |
| \`struct Student { ... }\` 结尾漏了分号 | 报 \`expected ';' after struct\`，而且后面几行会跟着一起报错 | 结尾写成 \`};\` |
| 把 \`struct Student { ... };\` 写在 \`main\` 里面 | 报错（C++ 不允许在函数里定义新类型） | 整段挪到 \`main\` 上面 |
| 取成员写成 \`s->name\` | 报 \`member reference type 'Student' is not a pointer\` | 初学一律用点号：\`s.name\` |
| 成员名大小写写错，例如 \`s.Score\` | 报 \`no member named 'Score'\` | 成员名必须和定义里逐字相同 |
| 花括号顺序写反：\`Student s{95, "Tom"}\` | 类型对不上，编译报错 | 按定义顺序：先 \`name\` 后 \`score\` |
| 忘了 \`#include <string>\` | 报 \`unknown type name 'string'\` | 顶部加上 \`#include <string>\` |`,
      starter_code: `#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    Student s;
    cin >> s.name >> s.score;
    // TODO: 用 cout 输出两行：姓名：<姓名> 和 成绩：<成绩>
    return 0;
}
`,
      solution_code: `#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    Student s;
    cin >> s.name >> s.score;
    cout << "姓名：" << s.name << endl;
    cout << "成绩：" << s.score << endl;
    return 0;
}
`,
      test_cases: [
        { input: 'Tom 95\n', expected_output: '姓名：Tom\n成绩：95\n' },
        { input: 'Xiaoming 100\n', expected_output: '姓名：Xiaoming\n成绩：100\n' },
        { input: 'A 0\n', expected_output: '姓名：A\n成绩：0\n' },
        { input: 'Bob 60\n', expected_output: '姓名：Bob\n成绩：60\n' },
      ],
      hints: [
        '先把数据读进结构体：`Student s; cin >> s.name >> s.score;`',
        '取成员用点号：`s.name` 是姓名，`s.score` 是成绩。',
        '也可以写 `Student s{"Tom", 95};`，按定义顺序一次填好所有成员。',
      ],
    },
    {
      id: 's6-p2',
      title: '班级成绩单',
      difficulty: '简单',
      knowledge_point: '结构体数组、循环累加',
      description: `### 题目背景

一个 \`Student\` 只装一个学生，那一个班怎么办？

好消息：结构体既然是一个**类型**，就能像 \`int\` 一样拿来开数组。这种数组叫做**结构体数组**，每个元素都是一个完整的学生：

\`\`\`cpp
Student a[105];             // 105 个学生的位子，下标 0 ~ 104

cin >> a[0].name >> a[0].score;   // 第 1 个学生
a[1].name = "Jerry";              // 第 2 个学生的姓名
a[1].score = 80;
\`\`\`

注意成员访问的写法：**先写下标，再写点号和成员名**，也就是 \`a[i].name\`。

配合循环，就能一口气读入一整班学生：

\`\`\`cpp
for (int i = 0; i < n; i++) {
    cin >> a[i].name >> a[i].score;
}
\`\`\`

### 任务

读入 \`n\` 个学生的姓名和成绩，算出全班的**总分**和**平均分**。

### 本关新知识：结构体数组怎么用

**结构体数组 = 一叠一模一样的表格。** \`int b[105];\` 是 105 个整数格子；\`Student a[105];\` 就是 **105 份学生表格**，每份表格里都自带 \`name\` 和 \`score\` 两栏。题目说 \`n ≤ 100\`，那就开 \`105\` 个位子：多开几个没坏处，开少了会出事。

\`\`\`cpp
Student a[105];                 // 105 个学生的位子，下标 0 ~ 104

cin >> a[0].name >> a[0].score; // 第 1 位同学（下标从 0 开始！）
cin >> a[1].name >> a[1].score; // 第 2 位同学
\`\`\`

\`a[i].name\` 要从左往右读两遍：先看 \`a[i]\`——"拿出第 i 份表格"；再看 \`.name\`——"取这份表格里的姓名栏"。所以 \`a[i].name\` 就是"第 i 位同学的姓名"，\`a[i].score\` 就是"第 i 位同学的成绩"。**下标永远写在点号前面**。

人数 \`n\` 是不固定的，所以读入要用 \`for\` 循环，一次读一份：

\`\`\`cpp
int main() {
    int n;
    cin >> n;                            // 先读人数
    Student a[105];
    for (int i = 0; i < n; i++) {        // i = 0,1,...,n-1，正好 n 个人
        cin >> a[i].name >> a[i].score;
    }
    return 0;
}
\`\`\`

| 要记住的点 | 说明 |
| --- | --- |
| 下标从 \`0\` 开始 | 第 1 个人是 \`a[0]\`，第 \`n\` 个人是 \`a[n - 1]\` |
| 循环条件写 \`i < n\` | 写成 \`i <= n\` 会多读一位不存在的人，下标越界 |
| 先下标再点号 | \`a[i].name\` 才对；\`a.name[i]\` 是在取"姓名的第 i 个字母"，类型对不上 |
| 数组要开得够大 | 题目给 \`n ≤ 100\`，开 \`105\` 稳妥；开小了可能直接崩溃 |
| 数组元素就是普通变量 | 能读也能改，还能参与运算：\`total += a[i].score;\` |

### 输入格式

- 第一行一个整数 \`n\`（\`1 ≤ n ≤ 100\`），表示学生人数。
- 接下来 \`n\` 行，每行一个姓名和一个整数成绩（\`0 ≤ 成绩 ≤ 100\`），中间用一个空格分隔。姓名只由英文字母组成，不含空格。

### 输出格式

输出两行：

\`\`\`
总分：<总分>
平均分：<平均分>
\`\`\`

平均分要**保留 2 位小数**。

### 样例

**输入**

\`\`\`
3
Tom 90
Jerry 80
Lucy 70
\`\`\`

**输出**

\`\`\`
总分：240
平均分：80.00
\`\`\`

### 说明

- 平均分就是"总分 ÷ 人数"：样例里 \`240 ÷ 3 = 80\`，写成两位小数是 \`80.00\`。
- \`n\` 至少是 1，不用担心除以 0。

### 小贴士

- 累加先准备一个空盒子：\`int total = 0;\`，再在循环里写 \`total += a[i].score;\`。
- 保留 2 位小数要 \`#include <iomanip>\`，然后写 \`cout << fixed << setprecision(2) << 平均值;\`。
- 算平均分时别写 \`total / n\`：两个整数相除会**丢掉小数**。写成 \`1.0 * total / n\` 就会变成小数除法。

### 常见错误

| 你可能写成 | 会发生什么 | 正确写法 |
| --- | --- | --- |
| 只开 \`Student a[100];\` 而 \`n\` 正好等于 100 | \`a[100]\` 越界，可能崩溃或者答案乱掉 | 开大一点：\`Student a[105];\` |
| 循环写成 \`for (int i = 0; i <= n; i++)\` | 多读一位不存在的学生，下标越界 | 条件写 \`i < n\` |
| 成员访问写成 \`a.name[i]\` | 意思变成"姓名的第 i 个字母"，编译报错 | 先下标再点号：\`a[i].name\` |
| 平均分写 \`total / n\` | 整数除法丢掉小数，\`428 / 5\` 得到 \`85\` 而不是 \`85.6\` | 写 \`1.0 * total / n\` |
| \`int total;\` 忘了初始化 | \`total\` 是随机垃圾值，答案完全不对 | 先写 \`int total = 0;\` |
| 忘了 \`#include <iomanip>\` | 报 \`setprecision\` 未定义 | 顶部加上 \`#include <iomanip>\` |`,
      starter_code: `#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    int n;
    cin >> n;
    Student a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].score;
    }
    // TODO: 定义 total 并初始化为 0，用循环把每位同学的成绩累加到 total 里
    // TODO: 输出 总分：<总分>
    // TODO: 输出 平均分：<平均分>，保留 2 位小数（fixed << setprecision(2)）
    return 0;
}
`,
      solution_code: `#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    int n;
    cin >> n;
    Student a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].score;
    }

    int total = 0;
    for (int i = 0; i < n; i++) {
        total += a[i].score;
    }

    cout << "总分：" << total << endl;
    cout << "平均分：" << fixed << setprecision(2) << 1.0 * total / n << endl;
    return 0;
}
`,
      test_cases: [
        {
          input: '3\nTom 90\nJerry 80\nLucy 70\n',
          expected_output: '总分：240\n平均分：80.00\n',
        },
        { input: '1\nXiaoming 95\n', expected_output: '总分：95\n平均分：95.00\n' },
        {
          input: '4\nA 10\nB 10\nC 10\nD 10\n',
          expected_output: '总分：40\n平均分：10.00\n',
        },
        {
          input: '3\nA 100\nB 0\nC 100\n',
          expected_output: '总分：200\n平均分：66.67\n',
        },
        { input: '2\nA 1\nB 2\n', expected_output: '总分：3\n平均分：1.50\n' },
      ],
      hints: [
        '读入时就把数据存进结构体数组：`cin >> a[i].name >> a[i].score;`。',
        '成员访问要先写下标：`a[i].score` 是第 i 位同学的成绩。',
        '平均值写 `1.0 * total / n`，输出前加 `fixed << setprecision(2)` 才是固定两位小数。',
      ],
    },
    {
      id: 's6-p3',
      title: '长方形计算',
      difficulty: '简单',
      knowledge_point: '结构体作参数与返回值',
      description: `### 题目背景

前面我们用结构体打包数据，这一题换个玩法：让结构体**走进函数**。

结构体既然是一个类型，就可以像 \`int\` 那样当函数的**参数**，也可以当函数的**返回值**。一个函数因此能一次交回好几样结果——这是过去的 \`int\` 做不到的。

先把两种结构体定义好：

\`\`\`cpp
struct Rect {          // 一个长方形
    int w;             // 宽
    int h;             // 高
};

struct Result {        // 计算结果
    int area;          // 面积
    int perimeter;     // 周长
};
\`\`\`

再写函数：参数收一个 \`Rect\`，返回值交出一个 \`Result\`：

\`\`\`cpp
Result calc(Rect r) {
    Result res;
    res.area = r.w * r.h;
    res.perimeter = 2 * (r.w + r.h);
    return res;        // 把整个结构体一起交回去
}
\`\`\`

在 \`main\` 里这样用：

\`\`\`cpp
Rect r;
cin >> r.w >> r.h;
Result out = calc(r);      // 用一个 Result 变量接住返回值
cout << out.area;          // 用点号取出里面的成员
\`\`\`

### 任务

读入长方形的宽 \`w\` 和高 \`h\`，写一个函数算出它的**面积**和**周长**，然后输出。

本题请使用上面给出的 \`struct Rect\` 和 \`struct Result\`（成员名要和题目一致）。

### 本关新知识：结构体当参数、当返回值

**把结构体交给函数，就像把整份填好的表格递过去**；反过来，函数也能**交回一整份表格**。这是 \`int\` 做不到的事：一个 \`int\` 一次只能交回一个数，想让函数同时给出面积和周长，就得把这两项打包进一个结构体一起交回来。

写函数的"四件套"和以前完全一样，只是类型换成了结构体：

\`\`\`cpp
Result calc(Rect r) {                  // 返回类型 Result、函数名 calc、参数表 (Rect r)
    Result res;                        // 先准备一个 Result 变量装答案
    res.area = r.w * r.h;              // 用参数 r 的成员算面积
    res.perimeter = 2 * (r.w + r.h);   // 再算周长，括号别丢
    return res;                        // 把整个结构体一起交回去
}
\`\`\`

- \`Rect r\` 是**参数**：调用时把外面的长方形复制一份进来，在函数里改 \`r\` 不会影响 \`main\` 里的那个变量；
- \`return res;\` 交回的是**一整个结构体**，里面的 \`area\`、\`perimeter\` 两个成员都跟着回来了；
- 函数要写在 \`main\` **前面**（写在后面的话，\`main\` 里还不认识 \`calc\`）。

\`main\` 里接住它，接收变量的类型必须写成 \`Result\`，然后照常用点号取成员：

\`\`\`cpp
int main() {
    Rect r;
    cin >> r.w >> r.h;             // 先读进长方形的宽和高
    Result out = calc(r);          // 用一个 Result 变量接住整份结果
    cout << "面积：" << out.area << endl;
    cout << "周长：" << out.perimeter << endl;
    return 0;
}
\`\`\`

| 要记住的点 | 说明 |
| --- | --- |
| 参数写 \`Rect r\` | 结构体作参数直接写"类型名 + 变量名"，不用再写 \`struct\` 前缀 |
| 返回值类型写 \`Result\` | 必须和 \`return\` 出去的东西类型一致 |
| 接收变量类型要配套 | \`Result out = calc(r);\`；写成 \`int out = calc(r);\` 会报错 |
| 成员名照题目定义 | 输入用 \`r.w\`、\`r.h\`；结果存在 \`out.area\`、\`out.perimeter\` |
| 函数里别忘 \`return\` | 声明了要返回 \`Result\` 却没有 \`return\`，会报 \`non-void function does not return a value\` |

### 输入格式

一行，两个整数 \`w\` 和 \`h\`（\`1 ≤ w, h ≤ 10000\`），表示长方形的宽和高，中间用一个空格分隔。

### 输出格式

输出两行：

\`\`\`
面积：<面积>
周长：<周长>
\`\`\`

### 样例

**输入**

\`\`\`
3 4
\`\`\`

**输出**

\`\`\`
面积：12
周长：14
\`\`\`

### 说明

- 面积 = 宽 × 高，周长 = \`2 × (宽 + 高)\`。样例中 \`3 × 4 = 12\`，\`2 × (3 + 4) = 14\`。
- 边长都是整数，结果也是整数，不用考虑小数精度。
- 边长最大是 10000，面积最大是 \`10000 × 10000 = 100000000\`，\`int\` 装得下。
- 当 \`w\` 和 \`h\` 相等时就是正方形，公式照用，不用特判。

### 小贴士

- 结构体参数写成 \`Rect r\` 就行：函数里改 \`r\` 不会影响 \`main\` 里的那个变量。
- \`return res;\` 会把 \`res\` 的全部成员一起交回去，接收的变量类型也必须写成 \`Result\`。
- 函数要写在 \`main\` 的**前面**（或者在前面先声明一下），否则 \`main\` 里调用它会报"未定义"。

### 常见错误

| 你可能写成 | 会发生什么 | 正确写法 |
| --- | --- | --- |
| 函数里忘了 \`return res;\` | 报 \`non-void function does not return a value\` | 算完把 \`res\` 返回 |
| 想把面积、周长用两个 \`int\` 变量分别带回来 | 一次 \`return\` 只能带回一样东西，拿不到两项 | 定义一个 \`Result\` 结构体打包返回 |
| 返回值类型写成 \`void\` | \`Result out = calc(r);\` 报错 | 写成 \`Result calc(Rect r)\` |
| \`calc\` 写在 \`main\` 后面 | 报 \`use of undeclared identifier 'calc'\` | 移到 \`main\` 前面 |
| 在 \`main\` 里写 \`r.area\` | 报 \`no member named 'area' in 'Rect'\` | \`Rect\` 只有 \`w\`、\`h\`；面积在返回的 \`Result\` 里，写 \`out.area\` |
| 周长写成 \`r.w + r.h * 2\` | 优先级不对，结果算错（\`3 4\` 会得到 11 而不是 14） | 加括号：\`2 * (r.w + r.h)\` |`,
      starter_code: `#include <iostream>
using namespace std;

struct Rect {
    int w;
    int h;
};

struct Result {
    int area;
    int perimeter;
};

// TODO: 在这里写函数 Result calc(Rect r)：
//       把 r.w * r.h 存进结果结构体的 area，
//       把 2 * (r.w + r.h) 存进 perimeter，
//       最后别忘了 return 回去。

int main() {
    Rect r;
    cin >> r.w >> r.h;
    // TODO: 调用 calc，用 Result 变量接住返回值
    // TODO: 按格式输出 面积：<面积> 和 周长：<周长>
    return 0;
}
`,
      solution_code: `#include <iostream>
using namespace std;

struct Rect {
    int w;
    int h;
};

struct Result {
    int area;
    int perimeter;
};

Result calc(Rect r) {
    Result res;
    res.area = r.w * r.h;
    res.perimeter = 2 * (r.w + r.h);
    return res;
}

int main() {
    Rect r;
    cin >> r.w >> r.h;

    Result out = calc(r);

    cout << "面积：" << out.area << endl;
    cout << "周长：" << out.perimeter << endl;
    return 0;
}
`,
      test_cases: [
        { input: '3 4\n', expected_output: '面积：12\n周长：14\n' },
        { input: '1 1\n', expected_output: '面积：1\n周长：4\n' },
        { input: '5 5\n', expected_output: '面积：25\n周长：20\n' },
        { input: '1 10000\n', expected_output: '面积：10000\n周长：20002\n' },
        {
          input: '10000 10000\n',
          expected_output: '面积：100000000\n周长：40000\n',
        },
      ],
      hints: [
        '函数里先定义 `Result res;`，再给 `res.area` 和 `res.perimeter` 分别赋值。',
        '`return res;` 返回的是整个结构体；在 `main` 里用 `Result out = calc(r);` 接住它。',
        '取返回值里的成员还是用点号：`out.area`、`out.perimeter`。',
      ],
    },
    {
      id: 's6-p4',
      title: '按成绩排名',
      difficulty: '中等',
      knowledge_point: '结构体排序、比较函数',
      description: `### 题目背景

老师要按成绩从高到低念名字，这就是**排序**。

结构体数组的排序和普通数组一样，只不过比较的不是数字本身，而是结构体的**某个成员**。常用的办法有两种。

**办法一：手写冒泡排序**，把"比较大小"换成"比较成绩"，交换时整个结构体一起搬：

\`\`\`cpp
for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - 1 - i; j++) {
        if (a[j].score < a[j + 1].score) {   // 前面的分数更小，就该换到后面去
            Student tmp = a[j];
            a[j] = a[j + 1];
            a[j + 1] = tmp;
        }
    }
}
\`\`\`

**办法二：用标准库现成的排序工具 \`sort\`**（需要 \`#include <algorithm>\`）。

\`sort\` 会把一段区间排好序，默认从小到大。想按自己的规则排，就再写一个**比较函数**告诉它谁该排在前面：

\`\`\`cpp
bool cmp(const Student &x, const Student &y) {
    if (x.score != y.score) {
        return x.score > y.score;   // 成绩高的排前面
    }
    return x.name < y.name;         // 成绩相同，姓名小的排前面
}

sort(a, a + n, cmp);   // 把 a[0] ~ a[n-1] 按 cmp 的规则排序
\`\`\`

\`cmp(x, y)\` 返回 \`true\` 的意思是"x 应该排在 y 前面"。两种办法本题都可以用。

### 任务

读入 \`n\` 个学生的姓名和成绩，按成绩**从高到低**输出；成绩相同时，按**姓名字典序从小到大**输出。

### 本关新知识：\`sort\` 与自定义比较函数

**排序**就是把一叠表格按规则重新排好。结构体没法直接比大小——编译器不知道你想按姓名还是按成绩比——所以要我们自己写一个**裁判函数**，把规则讲给它听。

标准库的 \`sort\` 用三个参数说明"排哪一段 + 按什么规则"：

| 参数 | 写什么 | 含义 |
| --- | --- | --- |
| 第 1 个 | \`a\` | 从下标 \`0\` 开始排 |
| 第 2 个 | \`a + n\` | 排到下标 \`n - 1\` 为止。区间右端写的是"**最后一个位置的下一个**"，所以是 \`a + n\`，不是 \`a + n - 1\` |
| 第 3 个 | \`cmp\` | 比较函数的函数名；不写就默认从小到大 |

比较函数返回类型必须是 \`bool\`，两个参数用 \`const Student &\` 接收（\`&\` 表示"只借用不复制"，又快又安全）：

\`\`\`cpp
bool cmp(const Student &x, const Student &y) {
    if (x.score != y.score) {
        return x.score > y.score;   // 返回 true 表示：x 应该排在 y 前面
    }
    return x.name < y.name;         // 分数一样时，姓名小的排前面（字典序）
}
\`\`\`

一句话记住：**\`cmp(x, y)\` 返回 \`true\`，就是"x 排在 y 前面"**。所以"成绩从高到低"要写 \`x.score > y.score\`——分数大的那个返回 \`true\`、排到前面去。

两个 \`string\` 直接用 \`<\` 比较得到的就是**字典序**（翻字典的顺序）：先比第一个字母，字母靠前的更小；前面几个字母完全一样时，短的更小，所以 \`An\` < \`Ann\` < \`Anna\`。

不想用 \`sort\` 也可以手写冒泡排序，把"比较大小"换成"比较成绩"，**交换时整个结构体一起搬**：

\`\`\`cpp
if (a[j].score < a[j + 1].score) {   // 前面分数更小 → 顺序不对，要换
    Student tmp = a[j];              // 结构体可以整体赋值，不用一个成员一个成员地换
    a[j] = a[j + 1];
    a[j + 1] = tmp;
}
\`\`\`

### 输入格式

- 第一行一个整数 \`n\`（\`1 ≤ n ≤ 100\`）。
- 接下来 \`n\` 行，每行一个姓名和一个整数成绩（\`0 ≤ 成绩 ≤ 100\`），中间用一个空格分隔。

姓名只由英文字母组成，首字母大写、其余小写，长度不超过 20，彼此**互不相同**。

### 输出格式

输出 \`n\` 行，每行一个姓名和一个成绩，中间用一个空格分隔，按题目要求的顺序排列。

### 样例

**输入**

\`\`\`
5
Tom 90
Jerry 95
Lucy 88
Amy 95
Bob 60
\`\`\`

**输出**

\`\`\`
Amy 95
Jerry 95
Tom 90
Lucy 88
Bob 60
\`\`\`

### 说明

- 样例中 Jerry 和 Amy 都是 95 分，按姓名字典序，\`Amy\` 排在 \`Jerry\` 前面。
- **字典序**就是翻字典的顺序：先比第一个字母，字母靠前的排前面；前面几个字母完全一样时，短的排前面（比如 \`Ann\` 在 \`Anna\` 前面）。C++ 里两个 \`string\` 直接用 \`<\` 比较，得到的就是字典序。
- 因为姓名互不相同，所以排序结果**唯一确定**，不会有模棱两可的情况。

### 小贴士

- 交换结构体不需要一个一个成员地换，整体搬就行：\`Student tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;\`。
- 用 \`sort\` 时别忘了 \`#include <algorithm>\`；比较函数要写在 \`main\` 前面，而且返回类型是 \`bool\`。
- 比较函数里要先判断成绩是否相等：只写 \`return x.score > y.score;\` 的话，并列时的先后顺序就说不准了。

### 常见错误

| 你可能写成 | 会发生什么 | 正确写法 |
| --- | --- | --- |
| 比较函数里写 \`return x.score >= y.score;\` | 违反了"严格弱序"规则，\`sort\` 内部可能越界，程序崩溃或者结果乱掉 | 严格用 \`>\`（要降序）或 \`<\`（要升序） |
| 忘了 \`#include <algorithm>\` | 报 \`use of undeclared identifier 'sort'\` | 顶部加上 \`#include <algorithm>\` |
| 只写 \`return x.score > y.score;\` | 并列时先后顺序不确定，姓名顺序的用例会挂 | 先判 \`!=\`，相等再返回 \`x.name < y.name\` |
| 写 \`sort(a, a + n - 1, cmp);\` | 最后一个学生没参加排序 | 右端点写 \`a + n\` |
| 比较函数忘写 \`bool\` 或忘写 \`const &\` | 返回类型不对会报错；用值传递要多复制一遍结构体，效率低 | \`bool cmp(const Student &x, const Student &y)\` |
| 把比较函数写在 \`main\` 里面 | 报错（C++ 不允许在函数里定义函数） | 挪到 \`main\` 上面 |
| 交换时只换成绩不换姓名 | 分数和姓名错位，变成了"甲的分数配乙的名字" | 借助 \`Student tmp\` 把整个结构体换过去 |`,
      starter_code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

// TODO: 在这里写比较函数 bool cmp(const Student &x, const Student &y)：
//       成绩不同时，成绩高的排在前面；
//       成绩相同时，姓名小的排在前面。

int main() {
    int n;
    cin >> n;
    Student a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].score;
    }
    // TODO: 调用 sort(a, a + n, cmp); 排序（或者自己手写冒泡排序）
    // TODO: 按顺序输出 n 行，每行是 "姓名 成绩"
    return 0;
}
`,
      solution_code: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

struct Student {
    string name;
    int score;
};

bool cmp(const Student &x, const Student &y) {
    if (x.score != y.score) {
        return x.score > y.score;
    }
    return x.name < y.name;
}

int main() {
    int n;
    cin >> n;
    Student a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].score;
    }

    sort(a, a + n, cmp);

    for (int i = 0; i < n; i++) {
        cout << a[i].name << " " << a[i].score << endl;
    }
    return 0;
}
`,
      test_cases: [
        {
          input: '5\nTom 90\nJerry 95\nLucy 88\nAmy 95\nBob 60\n',
          expected_output: 'Amy 95\nJerry 95\nTom 90\nLucy 88\nBob 60\n',
        },
        { input: '1\nSolo 77\n', expected_output: 'Solo 77\n' },
        {
          input: '4\nDavid 80\nAnna 80\nCindy 80\nBob 80\n',
          expected_output: 'Anna 80\nBob 80\nCindy 80\nDavid 80\n',
        },
        {
          input: '3\nZoe 0\nAnn 100\nMike 0\n',
          expected_output: 'Ann 100\nMike 0\nZoe 0\n',
        },
        {
          input: '3\nAnn 90\nAnna 90\nAn 90\n',
          expected_output: 'An 90\nAnn 90\nAnna 90\n',
        },
      ],
      hints: [
        '比较函数返回 `true` 表示"第一个参数应该排在前面"，所以成绩高的要返回 `true`。',
        '先比较成绩：`if (x.score != y.score) return x.score > y.score;`，剩下的情况再返回 `x.name < y.name`。',
        '`sort(a, a + n, cmp);` 排的是下标 `0` 到 `n - 1` 这一整段，区间右端是 `a + n` 而不是 `a + n - 1`。',
      ],
    },
    {
      id: 's6-p5',
      title: '通讯录查找',
      difficulty: '简单',
      knowledge_point: '结构体数组遍历查找',
      description: `### 题目背景

手机通讯录里存着很多联系人，每个联系人有姓名和电话两项信息——这正好是一个结构体：

\`\`\`cpp
struct Person {
    string name;    // 姓名
    string phone;   // 电话
};
\`\`\`

注意这里的电话用的是 \`string\` 而不是整数。原因有两个：电话号码可能很长，而且**开头的 0 是有意义的**（比如 \`007700\`），要是当成整数存，前面的 0 就丢了。

查找的办法很朴素：从第一个人开始，一个一个往下比，姓名对上了就记住这个位置：

\`\`\`cpp
int pos = -1;                    // -1 表示"还没找到"
for (int i = 0; i < n; i++) {
    if (a[i].name == target) {
        pos = i;
        break;                   // 找到了就不用再往下看
    }
}
\`\`\`

循环结束后看 \`pos\`：还是 \`-1\` 就说明通讯录里没有这个人。

### 任务

读入 \`n\` 个人的姓名和电话，再读入一个要查找的姓名，输出这个人的信息；如果通讯录里没有这个人，就输出 \`Not Found\`。

本题请使用上面给出的 \`struct Person\`（成员名要和题目一致）。

### 本关新知识：遍历查找与"命中标记"

**查找**就是拿着目标一栏一栏地比对。比的路上"到底找到没有"这个状态，要用一个单独的变量记下来，这个变量叫做**标记**（也可以叫"哨兵值"）。本题正好用"下标"当标记：

- 初值 \`int pos = -1;\`：\`-1\` 不是任何合法下标，正好表示"**还没找到**"；
- 循环里比到姓名相同，就 \`pos = i;\` 把位置存下来，然后 \`break;\` 提前收工；
- 循环结束后只看 \`pos\`：还是 \`-1\`，就说明通讯录里没这个人。

\`\`\`cpp
string target;
cin >> target;                  // 先读要查找的姓名

int pos = -1;                   // -1 表示"还没找到"
for (int i = 0; i < n; i++) {
    if (a[i].name == target) {  // string 之间比内容，直接用 ==
        pos = i;                // 记住是第几位
        break;                  // 找到了就不用再往下看
    }
}
\`\`\`

循环结束后，只看标记 \`pos\` 就能决定输出什么：

\`\`\`cpp
if (pos == -1) {                // 没被改过 → 通讯录里没有这个人
    cout << "Not Found" << endl;
} else {                        // 找到了，用 pos 取出那一份信息
    cout << "姓名：" << a[pos].name << endl;
    cout << "电话：" << a[pos].phone << endl;
}
\`\`\`

电话为什么用 \`string\` 存？因为**开头的 0 是有意义的**：\`007700\` 当成整数存就变成了 \`7700\`，而且 11 位的手机号也超出 \`int\` 的范围。用 \`string\` 存，读进来什么样，输出就什么样。

| 要记住的点 | 说明 |
| --- | --- |
| 字符串比较用 \`==\` | \`a[i].name == target\` 比的是内容；写成 \`=\` 会把通讯录改坏 |
| 标记初值用 \`-1\` | 合法下标都不等于 \`-1\`，所以"没被改过"就等于"没找到" |
| 找到就 \`break;\` | 提前跳出，最后统一判断输出，结构最清楚 |
| 用 \`pos\` 取数据 | 确认找到之后才写 \`a[pos].name\`、\`a[pos].phone\` |
| 找不到时不能乱取元素 | \`a[-1]\` 越界；\`a[0]\` 是第一个人的信息，都不是"没找到" |

### 输入格式

- 第一行一个整数 \`n\`（\`1 ≤ n ≤ 100\`）。
- 接下来 \`n\` 行，每行一个姓名和一个电话，中间用一个空格分隔。姓名只由英文字母组成，电话只由数字组成、可能以 \`0\` 开头，两者长度都不超过 20，都不含空格。姓名彼此**互不相同**。
- 最后一行一个姓名，表示要查找的人。

### 输出格式

如果找到了，输出两行：

\`\`\`
姓名：<姓名>
电话：<电话>
\`\`\`

如果没找到，只输出一行 \`Not Found\`。

### 样例

**输入**

\`\`\`
3
Tom 13800001111
Jerry 13900002222
Lucy 13700003333
Jerry
\`\`\`

**输出**

\`\`\`
姓名：Jerry
电话：13900002222
\`\`\`

### 说明

- 通讯录里的姓名互不相同，所以最多只有一个人被找到。
- \`Not Found\` 是两个单词，中间一个空格，\`N\` 和 \`F\` 都是大写。
- 电话号码可能以 \`0\` 开头，用 \`string\` 存就能原样输出，前导的 \`0\` 不会丢。

### 小贴士

- 判断姓名是否相同用 \`==\` 就好：\`a[i].name == target\`。
- 用一个整数记录找到的下标，初值设成 \`-1\`；循环结束还是 \`-1\` 就输出 \`Not Found\`。
- 找不到任何人时，绝对不能去访问 \`a[0]\` 之类的元素——那样输出的是第一个人的信息，不是"没找到"。

### 常见错误

| 你可能写成 | 会发生什么 | 正确写法 |
| --- | --- | --- |
| \`if (a[i].name = target)\` | 这是赋值，只要 \`target\` 不是空串就永远成立，结果永远是第一个人 | 判断相等要用 \`==\` |
| \`pos\` 初值写 \`0\` | 没找到时会输出第一位联系人的信息，而不是 \`Not Found\` | 初值写 \`-1\` |
| 没找到还输出 \`a[0].phone\` | 输出了别人的电话，答案错 | 先判 \`if (pos == -1) cout << "Not Found" << endl;\` |
| \`Not Found\` 写成 \`Not found\` / \`not found\` | 大小写不一致，评测不通过 | 照抄 \`Not Found\` |
| 电话定义成 \`int phone;\` | \`007700\` 变成 \`7700\`，11 位号码还可能溢出 | 用 \`string phone;\` |
| 忘了读最后一行要查找的姓名 | \`target\` 是空的，永远输出 \`Not Found\` | \`cin >> target;\` 要写在读入数组的循环之后 |`,
      starter_code: `#include <iostream>
#include <string>
using namespace std;

struct Person {
    string name;
    string phone;
};

int main() {
    int n;
    cin >> n;
    Person a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].phone;
    }
    string target;
    cin >> target;
    // TODO: 遍历数组，找出第一个 name 等于 target 的人，把下标记下来（找不到就是 -1）
    // TODO: 找到了就输出 姓名：<姓名> 和 电话：<电话> 两行
    // TODO: 一个人都没找到就输出 Not Found
    return 0;
}
`,
      solution_code: `#include <iostream>
#include <string>
using namespace std;

struct Person {
    string name;
    string phone;
};

int main() {
    int n;
    cin >> n;
    Person a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].phone;
    }

    string target;
    cin >> target;

    int pos = -1;
    for (int i = 0; i < n; i++) {
        if (a[i].name == target) {
            pos = i;
            break;
        }
    }

    if (pos == -1) {
        cout << "Not Found" << endl;
    } else {
        cout << "姓名：" << a[pos].name << endl;
        cout << "电话：" << a[pos].phone << endl;
    }
    return 0;
}
`,
      test_cases: [
        {
          input: '3\nTom 13800001111\nJerry 13900002222\nLucy 13700003333\nJerry\n',
          expected_output: '姓名：Jerry\n电话：13900002222\n',
        },
        { input: '1\nZoe 555\nZoe\n', expected_output: '姓名：Zoe\n电话：555\n' },
        { input: '2\nA 111\nB 222\nC\n', expected_output: 'Not Found\n' },
        { input: '2\nAnn 007700\nBen 10010\nAnn\n', expected_output: '姓名：Ann\n电话：007700\n' },
        {
          input: '4\nAlexander 10086\nBo 10010\nCindy 12345\nDan 99999\nAmy\n',
          expected_output: 'Not Found\n',
        },
      ],
      hints: [
        '先写 `int pos = -1;`，循环里用 `if (a[i].name == target)` 判断姓名是否相同。',
        '找到之后把下标存进 `pos` 并 `break;`，循环结束后再统一判断输出。',
        '电话用 `string` 存，前导的 `0` 才能原样保留。',
      ],
    },
    {
      id: 's6-p6',
      title: '成绩统计报告',
      difficulty: '中等',
      knowledge_point: '综合统计、最值与平均分',
      description: `### 题目背景

学期末老师要写一份成绩统计报告，里面的内容是：

- 最高分是多少，是谁考的；
- 最低分是多少，是谁考的；
- 全班平均分是多少。

找最值的思路在阶段四就学过了，叫做**打擂台**：先让第一个选手当擂主，之后每来一个就比一比。区别是——这次擂主身上带着**姓名**，所以换擂主时要把整个结构体一起换掉：

\`\`\`cpp
int mx = 0;                       // mx 记住"目前最高分"同学的下标
for (int i = 1; i < n; i++) {
    if (a[i].score > a[mx].score) {
        mx = i;                   // 换擂主，只是换个下标
    }
}
// 报告里就能同时拿到 a[mx].score 和 a[mx].name
\`\`\`

**用下标当擂主**是这一题的小窍门：分数和姓名永远保持配套，不会出现"分数是甲的、姓名是乙的"这种错位。

### 任务

读入 \`n\` 个学生的姓名和成绩，输出一份成绩统计报告。

并列规则：如果有多位同学并列最高分，输出姓名**字典序最小**的那位；最低分同理。

### 本关新知识：用下标"打擂台"，并列时再比姓名

**打擂台**：先让第 0 位同学当擂主，之后每来一位就比一比，赢了就换擂主。这一题的关键是**擂主用"下标"记，而不是用分数记**：

\`\`\`cpp
int mx = 0;                     // mx 记的是"目前最高分是哪一位"，是下标不是分数！
int mn = 0;
int sum = 0;                    // 总分顺手在同一个循环里累加
for (int i = 0; i < n; i++) {
    sum += a[i].score;
    if (a[i].score > a[mx].score) mx = i;   // 严格更高，换擂主
    if (a[i].score < a[mn].score) mn = i;   // 严格更低，也换擂主
}
\`\`\`

擂主是下标，所以报告里的分数和姓名永远配套：\`a[mx].score\` 和 \`a[mx].name\` 就是同一位同学的两栏。

**并列怎么办？** 题目已经约定：分数并列时，取姓名**字典序最小**的那位。所以"换擂主"的条件要把两种情况写全：

\`\`\`cpp
if (a[i].score > a[mx].score ||                              // 情况一：分数更高
    (a[i].score == a[mx].score && a[i].name < a[mx].name)) {  // 情况二：分数一样但姓名更小
    mx = i;
}
\`\`\`

\`||\` 读作"或者"，\`&&\` 读作"并且"。**括号千万别丢**：\`&&\` 的优先级比 \`||\` 高，不加括号意思就变了。

平均分照旧：写 \`1.0 * sum / n\`（乘 \`1.0\` 把整数变成小数，否则整除会丢掉小数部分），输出前加 \`fixed << setprecision(2)\`。

| 要记住的点 | 说明 |
| --- | --- |
| 擂主存下标 | \`int mx = 0;\` 之后用 \`a[mx].score\` 和 \`a[mx].name\`，分数和姓名不会错位 |
| 先比"严格"大小 | 条件里用 \`>\` 或 \`<\`；并列的情况交给追加的条件处理 |
| 并列条件要加括号 | 把"分数相等 **并且** 姓名更小"用小括号括成一个整体，再用"或者"接到前面 |
| 输出顺序是"分数 空格 姓名" | \`a[mx].score\` 在前，\`a[mx].name\` 在后，中间一个空格 |
| 一趟循环做三件事 | 累加总分、判最高、判最低可以写在同一个 \`for\` 里 |

### 输入格式

- 第一行一个整数 \`n\`（\`1 ≤ n ≤ 100\`）。
- 接下来 \`n\` 行，每行一个姓名和一个整数成绩（\`0 ≤ 成绩 ≤ 100\`），中间用一个空格分隔。

姓名只由英文字母组成，首字母大写、其余小写，长度不超过 20。

### 输出格式

输出三行：

\`\`\`
最高分：<分数> <姓名>
最低分：<分数> <姓名>
平均分：<平均分>
\`\`\`

注意前两行是"分数 空格 姓名"的顺序；平均分**保留 2 位小数**。

### 样例

**输入**

\`\`\`
5
Tom 90
Jerry 95
Lucy 88
Amy 95
Bob 60
\`\`\`

**输出**

\`\`\`
最高分：95 Amy
最低分：60 Bob
平均分：85.60
\`\`\`

### 说明

- 样例中最高分 95 有两个人（Jerry 和 Amy），按字典序 \`Amy\` 更小，所以报告里写 \`Amy\`。
- 全班总分 \`90 + 95 + 88 + 95 + 60 = 428\`，平均分 \`428 ÷ 5 = 85.6\`，写成两位小数是 \`85.60\`。
- \`n = 1\` 时，最高分和最低分是同一个人，两行内容一样，这是正常的。
- 平均分按"总分 ÷ 人数"计算，用 \`fixed << setprecision(2)\` 输出即可。

### 小贴士

- 用两个下标变量分别记住最高分和最低分的同学，例如 \`int mx = 0, mn = 0;\`，再从 \`i = 1\` 开始循环。
- 判断并列时要加上姓名比较，例如 \`a[i].score > a[mx].score || (a[i].score == a[mx].score && a[i].name < a[mx].name)\`。
- 总分可以顺手在同一个循环里累加；算平均分别忘了写 \`1.0 * sum / n\`，还要 \`#include <iomanip>\`。

### 常见错误

| 你可能写成 | 会发生什么 | 正确写法 |
| --- | --- | --- |
| 用分数当擂主：\`int mx = a[0].score;\` | 换擂主后只有分数变了，姓名还是老样子，出现"分数是甲的、姓名是乙的" | 用下标记：\`int mx = 0;\`，比较时写 \`a[mx].score\` |
| 并列判据只写 \`a[i].score > a[mx].score\` | 分数并列时姓名顺序不定，会输出字典序较大的那位 | 补上"分数相同并且姓名更小"的条件 |
| 并列条件忘加括号 | \`&&\` 的优先级比"或者"高，判断的意思整个变了，答案错 | 把 \`a[i].score == a[mx].score && a[i].name < a[mx].name\` 整体用小括号括起来 |
| 输出写成"姓名 分数" | 顺序和要求相反，评测不通过 | 先分数后姓名：\`a[mx].score << " " << a[mx].name\` |
| 平均分写 \`sum / n\` | 整数除法丢小数，\`428 / 5\` 得到 \`85\` 而不是 \`85.60\` | 写 \`1.0 * sum / n\` 并配 \`fixed << setprecision(2)\` |
| \`mx\`、\`mn\` 或 \`sum\` 忘了初始化 | 拿到随机垃圾值，结果完全不对 | 都从 \`0\` 开始：\`int mx = 0, mn = 0, sum = 0;\` |`,
      starter_code: `#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    int n;
    cin >> n;
    Student a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].score;
    }
    // TODO: 用打擂台找出最高分的同学，用下标记住它（并列时取姓名字典序最小的）
    // TODO: 同样找出最低分的同学
    // TODO: 顺便把总分累加起来
    // TODO: 依次输出 最高分：<分数> <姓名> / 最低分：<分数> <姓名> / 平均分：<保留 2 位小数>
    return 0;
}
`,
      solution_code: `#include <iostream>
#include <string>
#include <iomanip>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    int n;
    cin >> n;
    Student a[105];
    for (int i = 0; i < n; i++) {
        cin >> a[i].name >> a[i].score;
    }

    int mx = 0;
    int mn = 0;
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i].score;

        if (a[i].score > a[mx].score ||
            (a[i].score == a[mx].score && a[i].name < a[mx].name)) {
            mx = i;
        }
        if (a[i].score < a[mn].score ||
            (a[i].score == a[mn].score && a[i].name < a[mn].name)) {
            mn = i;
        }
    }

    cout << "最高分：" << a[mx].score << " " << a[mx].name << endl;
    cout << "最低分：" << a[mn].score << " " << a[mn].name << endl;
    cout << "平均分：" << fixed << setprecision(2) << 1.0 * sum / n << endl;
    return 0;
}
`,
      test_cases: [
        {
          input: '5\nTom 90\nJerry 95\nLucy 88\nAmy 95\nBob 60\n',
          expected_output: '最高分：95 Amy\n最低分：60 Bob\n平均分：85.60\n',
        },
        {
          input: '1\nSolo 77\n',
          expected_output: '最高分：77 Solo\n最低分：77 Solo\n平均分：77.00\n',
        },
        {
          input: '3\nA 50\nB 50\nC 50\n',
          expected_output: '最高分：50 A\n最低分：50 A\n平均分：50.00\n',
        },
        {
          input: '4\nZoe 100\nAnn 100\nMike 0\nBen 0\n',
          expected_output: '最高分：100 Ann\n最低分：0 Ben\n平均分：50.00\n',
        },
        {
          input: '3\nA 100\nB 0\nC 100\n',
          expected_output: '最高分：100 A\n最低分：0 B\n平均分：66.67\n',
        },
      ],
      hints: [
        '让 `mx` 和 `mn` 都从 `0` 开始，表示"目前最高/最低分的同学是第 0 个"，再从 `i = 1` 或 `i = 0` 往后比较。',
        '并列判定写全：先比分数，分数相同再比姓名，例如 `a[i].score > a[mx].score || (a[i].score == a[mx].score && a[i].name < a[mx].name)`。',
        '输出时先取下标再取成员：`a[mx].score` 和 `a[mx].name`；平均分要写 `1.0 * sum / n` 并配合 `fixed << setprecision(2)`。',
      ],
    },
  ],
};

fs.mkdirSync(outDir, { recursive: true });
const target = path.join(outDir, 'stage-6.json');
fs.writeFileSync(target, `${JSON.stringify(stage, null, 2)}\n`, 'utf8');
console.log('written:', target, `${stage.problems.length} problems`);
