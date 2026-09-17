/**
 * 阶段一 · 类与 main：输出、变量与输入（6 道题）
 *
 * 这是 Java 靶场的第一阶段，读者完全没有写过代码：
 * 先把固定外壳讲清楚，再学输出、变量、Scanner 输入与小数。
 */

import type { StageData } from '../../types/problem';
import { lesson, mainOnly, mistakesTable, pointsTable } from '../lesson.ts';

export const STAGE_1: StageData = {
  stage: 1,
  title: '阶段一 · 类与 main',
  subtitle: '输出、变量与输入',
  summary:
    'Java 的程序必须写在类里面，入口是固定的 `public static void main(String[] args)`。\n\n' +
    '这一阶段先认识这个永远不会变的外壳，然后学会三件事：用 `System.out.println` 把结果打到屏幕上、' +
    '用变量把数据存起来、用 `Scanner` 把键盘（标准输入）里的数据读进来。\n\n' +
    '**完全没有写过代码？** 建议先读一遍 [Java 入门指南](/java/guide)，它会逐行解释下面这些代码，' +
    '并告诉你报错该怎么看。',
  problems: [
    lesson({
      id: 'j1-1',
      title: '你好，Java',
      difficulty: '入门',
      knowledge: '类、main 与输出',
      story:
        'Java 的第一行代码不是"写一句话"，而是先搭好一个"外壳"：所有的 Java 代码都必须写在类里面。\n\n' +
        '好消息是这个外壳是**固定写法**，本站所有题目的类名都叫 `Main`，你可以把它当成一张印好的表格，' +
        '只需要往里面填内容。',
      task: '让程序在屏幕上输出一行 `Hello, Java!`。',
      lesson: `先逐行读懂右边那段初始代码——它是给你准备好的外壳：

\`\`\`java
public class Main {                                  // ① 定义一个类，名字必须是 Main
    public static void main(String[] args) {          // ② 程序的入口，固定写法
        // TODO: 输出 Hello, Java!                      // ③ 注释：写给人看，电脑完全无视
    }
}                                                    // ④ 与 ① 的 { 配对
\`\`\`

${pointsTable([
  ['`public class Main`', '定义一个公开的类。Java 规定：公开类的名字必须与文件名一致，本站文件名固定是 `Main.java`，所以类名只能是 `Main`'],
  ['`public static void main(String[] args)`', '程序的**入口方法**。电脑从这里的第一行开始执行；这一行是固定写法，照抄即可'],
  ['`{` 和 `}`', '一对大括号把"属于它的内容"包起来：类的身体一对、main 方法的身体一对，必须成对出现'],
  ['`// 注释`', '两个斜杠开头是注释，写给人看的，电脑完全无视。题目里的 `// TODO` 就是提示"代码写在这里"'],
])}

**你要写的那一行长这样：**

\`\`\`java
System.out.println("Hello, Java!");
\`\`\`

一个部分一个部分地拆开看：

${pointsTable([
  ['`System`', '系统类，首字母必须大写。写成 `system` 编译器就不认识了'],
  ['`.out`', '标准输出（屏幕）。`out` 是小写'],
  ['`.println`', 'print line：打印一行，并且**自动换行**。注意 `l` 是字母 L，不是数字 1'],
  ['`( )`', '圆括号里放要输出的内容，这一对括号不能少'],
  ['`"Hello, Java!"`', '要输出的文字，必须放在**英文双引号**里，叫"字符串"'],
  ['`;`', '**每一条语句末尾都要有英文分号**，这是新手最常漏的东西'],
])}

连起来读就是：**"把 Hello, Java! 这行字打到屏幕上，然后换行。"**

只想输出不换行时用 \`System.out.print(...)\`（少个 ln）。`,
      inputFormat: '本题**没有输入**。右侧"标准输入"框留空即可。',
      outputFormat: '输出一行 `Hello, Java!`，末尾要有换行。',
      mistakes: mistakesTable([
        ['`system.out.println("Hello, Java!");`', '报错 `cannot find symbol: class system`', '`System` 首字母大写：`System.out.println(...)`'],
        ['`System.out.Println("Hello, Java!");`', '报错 `cannot find symbol: method Println`', '`println` 全小写，只有 `System`、`String` 这类类名首字母大写'],
        ['`System.out.println(Hello, Java!);`', '报错 `cannot find symbol: variable Hello`', '要输出的文字必须放在英文双引号里'],
        ['`System.out.println("Hello, Java!")`', "报错 `';' expected`", '语句末尾补上英文分号 `;`'],
        ['把 `;` 打成中文 `；`', '报错（编译器不认识全角符号）', '使用英文半角分号；编译失败时结果面板会帮你检测中文标点'],
        ['删掉了类名后面的 `{` 或 main 后面的 `}`', '报错 `reached end of file while parsing`', '大括号必须成对，不要删除外壳里的任何大括号'],
      ]),
      tips:
        '- 每道题的初始代码都可以**直接运行**，只是结果不对；点「运行」先熟悉一下流程。\n' +
        '- 不知道该改哪里？点工具栏的「**写到哪？**」，光标会自动跳到 `// TODO` 那一行。\n' +
        '- 写完先点「运行」看输出，确认没错再点「提交」评测全部测试用例。',
      starter: mainOnly('        // TODO: 用 System.out.println 输出 Hello, Java!'),
      solution: mainOnly('        System.out.println("Hello, Java!");'),
      tests: [{ input: '', expected: 'Hello, Java!\n' }],
      hints: [
        '输出格式是 `System.out.println("要输出的文字");`，文字在英文双引号里。',
        '注意三处：`System` 首字母大写、`println` 全小写、末尾英文分号。',
        '只想输出不换行时用 `System.out.print(...)`（本题要换行，用 println）。',
      ],
    }),

    lesson({
      id: 'j1-2',
      title: '打印小旗子',
      difficulty: '入门',
      knowledge: '多行输出',
      story:
        '程序经常要输出好几行内容，比如打印一张成绩单或者一个小图案。\n\n' +
        '输出多行有两种思路：写多条输出语句，或者把换行符 `\\n` 写在字符串里面。',
      task: '输出下面这个由星号组成的小旗子（共 3 行）：\n\n```\n*******\n* C++ *\n*******\n```',
      lesson: `**写法一：每条语句输出一行**

\`\`\`java
System.out.println("*******");
System.out.println("* C++ *");
System.out.println("*******");
\`\`\`

**写法二：用 \\n 表示换行，一条语句输出多行**

\`\`\`java
System.out.println("*******\\n* C++ *\\n*******");
\`\`\`

两种写法结果完全一样。\`\\n\` 是"换行符"，它写在字符串里面，表示"从这里换到下一行"。

${pointsTable([
  ['`println` vs `print`', '`println` 会在末尾自动换行；`print` 不换行，下一句会紧接着输出'],
  ['`\\n` 的位置', '写在字符串中间表示换行，写在中括号外的 `\\n` 会报错'],
  ['空格也是内容', '`"* C++ *"` 中间的空格会原样输出，不能省'],
  ['语句按顺序执行', '电脑从上往下一句一句执行，顺序不能乱'],
])}

注意：Java 里输出文字时还可以用字符串拼接 \`+\`，例如 \`System.out.println("* " + "C++" + " *");\`，结果同样是 \`* C++ *\`。`,
      inputFormat: '本题**没有输入**。',
      outputFormat: '按顺序输出 3 行内容，每一行末尾都要换行。',
      mistakes: mistakesTable([
        ['三行内容只写了一条 `print`', '三行挤在同一行输出', '用 `println`（自带换行），或在字符串里写 `\\n`'],
        ['`"* C++ *"` 写成 `"*C++*"`', '空格没了，评测不通过', '题面里的空格要一模一样地照抄'],
        ['在字符串外写了 `\\n`', '报错 `illegal start of expression`', '`\\n` 必须写在双引号里面'],
        ['星号个数数错', '输出与期望不一致', '第一行和第三行各 7 个星号，可以数一遍'],
      ]),
      tips:
        '- 想验证自己数得对不对，可以点「运行」看输出，再和题目里的样例逐行比。\n' +
        '- `\\n` 在 Java 源码里要写成两个字符：反斜杠 + n。',
      starter: mainOnly(
        '        // TODO: 输出 3 行星号图案\n' +
          '        // 第 1 行：*******\n' +
          '        // 第 2 行：* C++ *\n' +
          '        // 第 3 行：*******',
      ),
      solution: mainOnly(
        '        System.out.println("*******");\n' +
          '        System.out.println("* C++ *");\n' +
          '        System.out.println("*******");',
      ),
      tests: [{ input: '', expected: '*******\n* C++ *\n*******\n' }],
      hints: [
        '最简单的方式是写三条 `System.out.println` 语句，每条负责一行。',
        '也可以只用一条语句：把三行内容用 `\\n` 连起来写在字符串里。',
        '注意第二行的空格：`"* C++ *"`。',
      ],
    }),

    lesson({
      id: 'j1-3',
      title: '自我介绍',
      difficulty: '入门',
      knowledge: 'String、变量与输入',
      story:
        '程序要能"开口说话"，也要能"听懂人话"。前面几题都是程序自己说自己想说的，' +
        '这一题开始，程序要先**读入**你给的数据，再根据数据作出回答。\n\n' +
        '在 Java 里读键盘输入要用 `Scanner` 这个工具。',
      task: '读入一个人的姓名和年龄，然后输出一句自我介绍：`我叫<姓名>，今年<年龄>岁。`',
      lesson: `**第一步：把 Scanner 工具请进来**

\`\`\`java
import java.util.Scanner;      // 这一行写在文件最上面，类的外面
\`\`\`

**第二步：准备读入工具，并把数据读进变量**

\`\`\`java
Scanner scanner = new Scanner(System.in);   // 固定写法，变量名习惯叫 scanner
String name = scanner.next();               // 读入一个"单词"（遇到空格或换行结束）
int age = scanner.nextInt();                // 读入一个整数
\`\`\`

**第三步：把变量和文字拼起来输出**

\`\`\`java
System.out.println("我叫" + name + "，今年" + age + "岁。");
\`\`\`

${pointsTable([
  ['`import java.util.Scanner;`', '使用 Scanner 必须先在文件最上方 import 它，否则报错 `cannot find symbol: class Scanner`'],
  ['`String`', '文字类型，首字母大写（注意：不像 C++ 的 `string` 是小写）'],
  ['`int`', '整数类型，全小写'],
  ['`scanner.next()`', '读入下一个"单词"（以空格/回车分隔），返回 `String`'],
  ['`scanner.nextInt()`', '读入下一个整数，返回 `int`；读几个就写几次'],
  ['`+` 拼接', '字符串与变量之间用 `+` 连接，数字会被自动转成文字拼上去'],
  ['`new Scanner(System.in)`', '`System.in` 就是标准输入，"标准输入"框里的内容会从这里进来'],
])}`,
      inputFormat: '一行，包含一个姓名（不含空格）和一个整数年龄，中间用空格分隔。',
      outputFormat: '输出一行：`我叫<姓名>，今年<年龄>岁。`',
      mistakes: mistakesTable([
        ['忘了 `import java.util.Scanner;`', '报错 `cannot find symbol: class Scanner`', '文件最上方加上这一行（注意末尾分号）'],
        ['`String` 写成 `string`', '报错 `cannot find symbol: class string`', 'Java 的 String 首字母必须大写'],
        ['用 `scanner.nextInt()` 读姓名', '报错 `InputMismatchException`', '姓名是文字，用 `scanner.next()`'],
        ['中文标点写成英文 `,` `.`', '输出与期望不一致', '直接复制题面里的中文标点 `，` 和 `。`'],
        ['拼接时漏了某个 `+`', '报错或输出奇怪内容', '写成 `"我叫" + name + "，今年" + age + "岁。"`，每一处都要有 `+`'],
      ]),
      tips:
        '- `scanner.next()` 遇到空格或回车就停，所以姓名里不能有空格。\n' +
        '- 点「运行」之前，记得在"标准输入"框里填上测试数据（例如 `Xiaoming 18`），否则程序会一直等输入。\n' +
        '- 中文标点是全角字符，建议从题面复制。',
      starter:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        String name = scanner.next();\n' +
        '        int age = scanner.nextInt();\n' +
        '        // TODO: 按格式输出：我叫<姓名>，今年<年龄>岁。\n' +
        '    }\n}\n',
      solution:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        String name = scanner.next();\n' +
        '        int age = scanner.nextInt();\n' +
        '        System.out.println("我叫" + name + "，今年" + age + "岁。");\n' +
        '    }\n}\n',
      tests: [
        { input: 'Xiaoming 18\n', expected: '我叫Xiaoming，今年18岁。\n' },
        { input: 'Alice 7\n', expected: '我叫Alice，今年7岁。\n' },
        { input: 'Bob 100\n', expected: '我叫Bob，今年100岁。\n' },
      ],
      hints: [
        '文字拼接用 `+`：`"我叫" + name + "，今年" + age + "岁。"`。',
        '`scanner.next()` 读文字，`scanner.nextInt()` 读整数，两个都要调用一次。',
        '逗号和句号是中文全角字符，建议从题面复制，不要用输入法打。',
      ],
    }),

    lesson({
      id: 'j1-4',
      title: '两数之和',
      difficulty: '入门',
      knowledge: 'Scanner 与整数运算',
      story:
        '计算机最擅长的就是算数。这一题让你第一次用程序"算出一个结果"：' +
        '把数据读进来、算一下、再输出出去，这是几乎所有程序的骨架。',
      task: '读入两个整数，输出它们的和。',
      lesson: `读入两个整数只要调用两次 \`scanner.nextInt()\`：

\`\`\`java
Scanner scanner = new Scanner(System.in);
int a = scanner.nextInt();     // 第一个整数装进 a
int b = scanner.nextInt();     // 第二个整数装进 b
System.out.println(a + b);     // 输出它们的和
\`\`\`

Java 的运算符和数学课上差不多：

${pointsTable([
  ['`+` 加', '`a + b`，可以用 `System.out.println(a + b);` 直接输出结果'],
  ['`-` 减', '`a - b`'],
  ['`*` 乘', '`a * b`，注意键盘上打的是星号，不是数学乘号 `×`'],
  ['`/` 整除', '两个整数相除会**丢掉小数部分**：`7 / 2` 的结果是 3'],
  ['`%` 取余', '`7 % 2` 的结果是 1（余数）'],
  ['优先级', '先算 `* / %`，再算 `+ -`，有括号先算括号'],
])}

**关键区别**：\`System.out.println("a + b");\` 会把 \`a + b\` 当文字原样打印；去掉引号才是计算。`,
      inputFormat: '一行，两个整数 `a` 和 `b`（`-10000 ≤ a, b ≤ 10000`），用空格分隔。',
      outputFormat: '输出一个整数，表示 `a + b`。',
      mistakes: mistakesTable([
        ['`System.out.println("a + b");`', '屏幕上原样打印 `a + b` 这五个字符', '去掉引号：`System.out.println(a + b);`'],
        ['只调用了一次 `nextInt()`', '`b` 没被赋值，编译直接报错', '两个整数就要调用两次 `nextInt()`'],
        ['用了 `scanner.nextInt` 忘了圆括号', '报错 `cannot find symbol: method nextInt`', '方法调用必须带 `()`'],
        ['把 `int` 写成 `Int`', '报错 `cannot find symbol: class Int`', '基本类型全小写：`int`'],
        ['输出时加了多余文字', '与期望输出不一致', '本题只输出数字本身'],
      ]),
      tips:
        '- 读入顺序很重要：`3 5` 会先给 `a` 赋 3，再给 `b` 赋 5。\n' +
        '- 记得测试负数：\n  `-7 + 2` 应该输出 `-5`。',
      starter:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int a = scanner.nextInt();\n' +
        '        int b = scanner.nextInt();\n' +
        '        // TODO: 输出 a 与 b 的和\n' +
        '    }\n}\n',
      solution:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int a = scanner.nextInt();\n' +
        '        int b = scanner.nextInt();\n' +
        '        System.out.println(a + b);\n' +
        '    }\n}\n',
      tests: [
        { input: '3 5\n', expected: '8\n' },
        { input: '0 0\n', expected: '0\n' },
        { input: '-7 2\n', expected: '-5\n' },
        { input: '10000 10000\n', expected: '20000\n' },
      ],
      hints: [
        '两个数用两次 `scanner.nextInt()` 读进来即可。',
        '直接输出表达式：`System.out.println(a + b);`——表达式不能加引号。',
        '也可以先存起来：`int sum = a + b; System.out.println(sum);`。',
      ],
    }),

    lesson({
      id: 'j1-5',
      title: '长方形面积',
      difficulty: '入门',
      knowledge: '变量命名与乘法',
      story:
        '变量名不一定只能叫 `a`、`b`。给变量起一个**看得懂的名字**，程序会好读很多——' +
        '这也是专业程序员最看重的习惯之一。',
      task: '读入长方形的长和宽，输出它的面积。',
      lesson: `对比两段代码，它们做的是同一件事，但第二段一眼就能看懂：

\`\`\`java
int a = scanner.nextInt();      // 这是长还是宽？要看完后面的代码才知道
int b = scanner.nextInt();

int length = scanner.nextInt();  // 名字本身就是注释
int width = scanner.nextInt();
System.out.println(length * width);
\`\`\`

${pointsTable([
  ['变量名规则', '由字母、数字、下划线组成，不能以数字开头，不能是 Java 关键字（如 class、int）'],
  ['命名习惯', '小驼峰写法：`length`、`totalScore`、`maxValue`；见名知意'],
  ['乘法符号', 'Java 用星号 `*`，不是数学乘号 `×`，也不是字母 x'],
  ['面积公式', '长方形面积 = 长 × 宽 = `length * width`'],
])}

输入 \`4 6\` 时：\`length\` 是 4、\`width\` 是 6，输出 \`24\`。`,
      inputFormat: '一行，两个整数 `length` 和 `width`（`1 ≤ length, width ≤ 1000`），表示长与宽，用空格分隔。',
      outputFormat: '输出一个整数，表示长方形的面积。',
      mistakes: mistakesTable([
        ['用了 `×`（数学乘号）', '报错 `illegal character`', 'Java 的乘法是 `*`'],
        ['`System.out.println("length * width");`', '原样打印文字，不是计算结果', '去掉引号：`System.out.println(length * width);`'],
        ['变量名写成 `Length` 又用 `length` 取值', '报错 `cannot find symbol: variable length`', 'Java 区分大小写，声明与使用必须完全一致'],
        ['只读了一个数', '编译报错或结果不对', '两个变量都要 `scanner.nextInt()` 读一次'],
      ]),
      tips:
        '- 面积用 `int` 就够了：题目保证结果不超过 1000 × 1000。\n' +
        '- 起名字的时候可以想："如果明天再看这段代码，我还看得懂吗？"',
      starter:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int length = scanner.nextInt();\n' +
        '        int width = scanner.nextInt();\n' +
        '        // TODO: 输出面积（长 × 宽）\n' +
        '    }\n}\n',
      solution:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int length = scanner.nextInt();\n' +
        '        int width = scanner.nextInt();\n' +
        '        System.out.println(length * width);\n' +
        '    }\n}\n',
      tests: [
        { input: '4 6\n', expected: '24\n' },
        { input: '1 1\n', expected: '1\n' },
        { input: '1000 1000\n', expected: '1000000\n' },
        { input: '7 3\n', expected: '21\n' },
      ],
      hints: [
        '面积 = 长 × 宽，也就是 `length * width`。',
        '乘法用星号 `*`，不要用数学乘号。',
        '直接输出表达式：`System.out.println(length * width);`。',
      ],
    }),

    lesson({
      id: 'j1-6',
      title: '温度换算',
      difficulty: '简单',
      knowledge: 'double 小数与表达式',
      story:
        '温度经常带小数（36.5℃、98.6℉），用整数存不下。' +
        '这一题认识 Java 里表示小数的类型：`double`。',
      task: '读入一个摄氏温度 C，按公式 `F = C × 1.8 + 32` 输出对应的华氏温度。',
      lesson: `**整数与小数是两种不同的类型**

\`\`\`java
int n = 7;
System.out.println(n / 2);        // 输出 3：整数除法会丢掉小数部分！

double c = 36.5;
System.out.println(c * 1.8 + 32); // 输出 97.7：小数运算保留小数
\`\`\`

${pointsTable([
  ['`int`', '整数类型：`int n = 7;`'],
  ['`double`', '小数类型：`double c = 36.5;`（双精度浮点数）'],
  ['读入小数', '`double c = scanner.nextDouble();`——注意是 `nextDouble()` 不是 `nextInt()`'],
  ['整数除法的坑', '`7 / 2` 是 3；想得到 3.5 就要写成 `7.0 / 2` 或 `7 / 2.0`'],
  ['1.8 的作用', '算式中只要出现小数，整个算式就按小数计算'],
  ['打印小数的样子', 'Java 打印 `double` 时会**保留 `.0`**：`32.0` 打印出来就是 `32.0`（这点和 C++ 的 `cout` 不同，C++ 会省略 `.0`）'],
])}

因为结果始终是小数，本题直接 \`System.out.println(结果)\` 输出即可。
想固定小数位数（例如保留两位）时可以用 \`System.out.printf("%.2f", 结果);\`。`,
      inputFormat: '一行，一个数 `C`（`-100 ≤ C ≤ 100`，可能是小数），表示摄氏温度。',
      outputFormat:
        '输出换算后的华氏温度。注意 Java 打印小数时会保留 `.0`：输入 `0` 要输出 `32.0`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n36.5\n```\n\n**输出**\n\n```\n97.7\n```\n\n' +
        '再比如输入 `0` 输出 `32.0`；输入 `100` 输出 `212.0`；输入 `-40` 输出 `-40.0`（两个温标恰好相等的点）。',
      mistakes: mistakesTable([
        ['用 `int c = scanner.nextInt();` 读入', '输入 36.5 时读入失败或只读到 36', '小数要用 `double c = scanner.nextDouble();`'],
        ['写成 `c * 9 / 5 + 32` 但 `c` 是 `int`', '整数除法丢精度，结果偏小', '用 `1.8`，或把 `c` 声明成 `double`'],
        ['以为 `32.0` 会打印成 `32`', '与期望输出不一致（少了个 `.0`）', 'Java 打印 `double` 保留 `.0`；本题期望就是 `32.0`'],
        ['输出时加了文字（如 `97.7F`）', '与期望输出不一致', '本题只输出数字'],
        ['把 `nextDouble()` 写成 `nextdouble()`', '报错 `cannot find symbol`', 'Java 区分大小写：`nextDouble`'],
      ]),
      tips:
        '- 公式直接写进输出语句：`System.out.println(c * 1.8 + 32);`。\n' +
        '- -40 度时摄氏与华氏相等，可以用它检查公式有没有写错。\n' +
        '- 想固定小数位数（例如保留两位）可以用 `System.out.printf("%.2f", 数值);`，本题不需要。',
      starter:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        double c = scanner.nextDouble();\n' +
        '        // TODO: 按公式 F = C * 1.8 + 32 计算并输出\n' +
        '    }\n}\n',
      solution:
        'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        double c = scanner.nextDouble();\n' +
        '        System.out.println(c * 1.8 + 32);\n' +
        '    }\n}\n',
      tests: [
        { input: '36.5\n', expected: '97.7\n' },
        { input: '0\n', expected: '32.0\n' },
        { input: '100\n', expected: '212.0\n' },
        { input: '-40\n', expected: '-40.0\n' },
      ],
      hints: [
        '读入小数用 `double c = scanner.nextDouble();`。',
        '把公式直接写进输出语句：`System.out.println(c * 1.8 + 32);`。',
        '-40 度时两个温标相等，可以用它检查公式有没有写错。',
      ],
    }),
  ],
};
