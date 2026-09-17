/**
 * 阶段五 · 方法：定义、调用、参数、返回值与递归（6 道题）
 *
 * 这一阶段有两处要特别讲透：
 *   1. Java 的方法必须写在 `public class Main` 里面、与 main 平级，而且必须是 static，
 *      所以本阶段的 starter / solution 不能只用 mainOnly()，而是用下面的 withMethods()
 *      把方法拼到 main 前面（外壳仍然由 mainOnly() 生成，风格与其他阶段一致）；
 *   2. Java 没有 C++ 那样的引用传参（没有 `&`）：方法收到的永远是**值的副本**，
 *      第 4 题（交换两个数）专门用"错误示范 + 正确示范"讲清这件事。
 *
 * 语法一律限定在 Java 8（浏览器里是 Doppio JVM），不用 var / lambda / Stream / 文本块。
 */

import type { StageData } from '../../types/problem';
import { lesson, mainOnly, mistakesTable, pointsTable } from '../lesson.ts';

/**
 * 生成「方法 + main」的完整外壳。
 *
 * 阶段五的题要在 main 外面定义方法，而 mainOnly() 只负责 main 里面的内容，
 * 所以这里先用 mainOnly() 拿到统一的类外壳，再把方法插到 main 之前。
 * `methods` 与 `mainBody` 都要自己缩进好（方法与 main 同为 4 空格，main 里的语句 8 空格）。
 */
function withMethods(
  methods: string,
  mainBody: string,
  imports = 'import java.util.Scanner;',
): string {
  const shell = mainOnly(mainBody, { imports });
  const marker = '    public static void main(String[] args) {';
  return shell.replace(marker, `${methods}\n\n${marker}`);
}

export const STAGE_5: StageData = {
  stage: 5,
  title: '阶段五 · 方法',
  subtitle: '方法、参数、返回值与递归',
  summary:
    '前面的程序，所有代码都挤在 `main` 里。程序一长，`main` 会堆成一大坨，同样的活还得一遍遍重抄。\n\n' +
    '这个阶段我们把一段功能**打包**成一个**方法**（method）：给它起个名字、喂给它参数，需要的时候喊一声就能用。' +
    '顺便认识 Java 和 C++ 最大的差别之一——**Java 没有引用传参（没有 `&`）**，方法收到的永远是**值的副本**，' +
    '想改外面的变量得换个思路；最后还有**递归**（方法自己调用自己）和**方法重载**（同名方法、不同参数列表）。\n\n' +
    '> 提醒：Java 里管这个叫**方法 method**，C++ 里叫**函数 function**，是同一件东西。本站 Java 靶场统一叫"方法"。',
  problems: [
    lesson({
      id: 'j5-1',
      title: '两数最大值（方法版）',
      difficulty: '入门',
      knowledge: '方法定义与调用',
      story:
        '程序写久了你会发现，有些事情总要反复做，比如"求两个数里较大的那个"。' +
        '与其每次都抄一遍代码，不如把它**打包**成一个**方法**：起个名字，以后喊一声名字，它就替你干活。',
      task:
        '请实现方法 `static int maxOf(int a, int b)`，它返回 `a` 和 `b` 中较大的那个数（两个数相同时返回哪个都算对）。\n\n' +
        '然后在 `main` 里读入两个整数，调用 `maxOf` 并输出结果。',
      lesson: `前面几道题，所有代码都挤在 \`main\` 里面。程序一长，\`main\` 就会堆成一大坨：想改一小段逻辑，得先在一大堆代码里把它找出来。

**方法（method）** 就是把一段代码打包、起个名字。打个比方：遥控器上印着"开机"的按钮，按一下，它替你做完一整套动作——**把一段代码打包起来、起个名字，以后喊名字就能用**，不必每次重抄一遍。

**① 造一个方法要写四部分**

\`\`\`java
static int maxOf(int a, int b) {
    if (a > b) {
        return a;      // 交出 a，方法立刻结束，后面的行不再执行
    }
    return b;          // 能走到这里说明 a 不比 b 大，那 b 就是答案
}
\`\`\`

${pointsTable([
  ['返回值类型 `int`', '开头的 `int` 表示这个方法最后会**交出一个整数**。`maxOf` 要给出"较大的数"，数就是整数，所以写 `int`'],
  ['方法名 `maxOf`', '你给它起的名字，以后靠这个名字喊它。习惯用小驼峰写法：`maxOf`、`sumOf`、`isPrime`'],
  ['参数列表 `(int a, int b)`', '它干活需要的"原料"。要两个整数，就写两个 `int` 加变量名，中间用逗号隔开'],
  ['方法体 `{ ... }`', '大括号里是它真正干的活，最后用 `return` 把结果交出去'],
])}

**② Java 的两条硬规矩（和 C++ 不一样，必须记住）**

第一条：**方法要写在 \`public class Main\` 的里面，并且和 \`main\` 平级**。

\`\`\`java
public class Main {
    static int maxOf(int a, int b) {          // ① 在类里面、main 的外面
        // ...
    }

    public static void main(String[] args) {  // ② 与 main 平级，谁也不在大括号里
        // ...
    }
}
\`\`\`

千万别把方法定义塞进 \`main\` 的大括号里面——编译器的报错会是一句很难懂的 \`illegal start of expression\`。

第二条：**方法头上必须写 \`static\`**。\`main\` 自己就是 \`static\` 的，而 \`static\` 方法只能直接喊 \`static\` 方法，所以本站每道题的方法都写成 \`static ...\`。忘了写就会看到这句报错：

\`\`\`
non-static method maxOf(int,int) cannot be referenced from a static context
\`\`\`

（\`static\` 到底是什么意思，等学到类与对象时自然会懂；现在**照抄**就行。）

好消息是：**Java 不挑顺序**——方法写在 \`main\` 上面或下面都行，编译器都认识（C++ 必须写在前面，或者提前写一行声明）。

**③ 写好了要有人"喊"它：调用**

\`\`\`java
int x = 3;
int y = 5;
int m = maxOf(x, y);               // 喊一声 maxOf，它交出 5，被 m 接住
System.out.println(maxOf(x, y));   // 也可以不接住，直接把结果打印出来
\`\`\`

注意**定义**和**调用**长得不一样：

${pointsTable([
  ['定义（造按钮）', '`static int maxOf(int a, int b)`：参数要写**类型 + 变量名**'],
  ['调用（按按钮）', '`maxOf(x, y)`：只写**值或变量**，绝不写类型'],
  ['`return a;`', '交出结果，同时**立刻结束方法**，写在它后面的语句永远不会被执行'],
  ['方法里的 `a`、`b`', '就是两个普通的局部变量，和 `main` 里的 `a`、`b` 互不干扰'],
  ['漏写 `return`', '报 `missing return statement`：方法体的每条出口都要能交出结果'],
])}

**④ 跟着 \`maxOf(3, 5)\` 走一遍**

1. 调用 \`maxOf(3, 5)\`：参数 \`a\` 拿到 3，\`b\` 拿到 5；
2. \`if (a > b)\` 就是 \`3 > 5\`，不成立，跳过这一块；
3. 执行到 \`return b;\`，把 5 交回调用处，方法结束；
4. 调用处 \`System.out.println(...)\` 把 5 打到屏幕上。

本题的完整程序骨架长这样，可以对照右边的初始代码：

\`\`\`java
import java.util.Scanner;

public class Main {
    static int maxOf(int a, int b) {
        // ... 方法体
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(maxOf(a, b));   // 调用并输出
    }
}
\`\`\``,
      inputFormat: '一行，两个整数 `a` 和 `b`（`-1000000 ≤ a, b ≤ 1000000`），用空格分隔。',
      outputFormat: '输出一个整数，表示 `a` 和 `b` 中较大的那个数（末尾换行）。',
      mistakes: mistakesTable([
        [
          '`static int maxOf(int a, int b) { if (a > b) { return a; } }`',
          '报 `missing return statement`：两个数相等时不满足 `a > b`，方法没东西可交',
          '每条路径都要能交出结果，最后补一句 `return b;`',
        ],
        [
          '方法头上忘了写 `static`',
          '报 `non-static method maxOf(int,int) cannot be referenced from a static context`',
          '写成 `static int maxOf(int a, int b)`',
        ],
        [
          '把方法定义写进了 `main` 的大括号里面',
          '报 `illegal start of expression`（方法套方法不合法）',
          '方法与 `main` 平级：写在 main 的 `}` 外面、类的 `}` 里面',
        ],
        [
          '调用时写成 `maxOf(int a, int b)`',
          '报 `<identifier> expected`',
          '调用只写值：`maxOf(a, b)`，类型只在**定义**时写',
        ],
        [
          '`System.out.println("maxOf(a, b)");`',
          '屏幕上原样打印 `maxOf(a, b)` 这几个字符，不是答案',
          '去掉引号：`System.out.println(maxOf(a, b));`',
        ],
      ]),
      tips:
        '- 方法写在 `main` 上面还是下面都可以，Java 按名字找方法，不看顺序。\n' +
        '- 大括号别数错：类一对、方法各一对，方法与 `main` 是**兄弟**关系。\n' +
        '- 两个数相等时（比如 `7 7`）就走 `return b;`，返回 7，正好也对。',
      starter: withMethods(
        `    static int maxOf(int a, int b) {
        // TODO: 用 if 比较 a 和 b，把较大的那个 return 出去
        return 0;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        // TODO: 调用 maxOf(a, b)，并输出它返回的结果`,
      ),
      solution: withMethods(
        `    static int maxOf(int a, int b) {
        if (a > b) {
            return a;
        }
        return b;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();
        System.out.println(maxOf(a, b));`,
      ),
      tests: [
        { input: '3 5\n', expected: '5\n' },
        { input: '7 7\n', expected: '7\n' },
        { input: '-3 -9\n', expected: '-3\n' },
        { input: '-1000000 1000000\n', expected: '1000000\n' },
      ],
      hints: [
        '方法头照抄题面：`static int maxOf(int a, int b) { ... }`，开头的 `static` 不能少。',
        '方法体里先写 `if (a > b) { return a; }`，最后再补一句 `return b;`，这样每条路都有结果交。',
        '`main` 里写 `System.out.println(maxOf(a, b));`——调用时不写类型，只写变量名。',
      ],
    }),

    lesson({
      id: 'j5-2',
      title: '判断素数（方法版）',
      difficulty: '简单',
      knowledge: '布尔返回值',
      story:
        '有些问题的答案天生只有两种：是 / 不是。这种"真假答案"在 Java 里用 `boolean` 装，' +
        '写成方法就是 `static boolean isPrime(int n)`——它交出来的结果天生就是个真假值，用起来特别顺手。\n\n' +
        '阶段三你已经写过"判断素数"，这一次把那段逻辑**搬进方法**，然后在 `main` 里喊它好几遍。',
      task:
        '请实现方法 `static boolean isPrime(int n)`：如果 `n` 是素数就返回 `true`，否则返回 `false`。\n\n' +
        '然后在 `main` 里先读入一个整数 `N`，再读入 `N` 个整数，对每个数**调用一次** `isPrime`：是素数输出 `Yes`，否则输出 `No`。',
      lesson: `**① \`boolean\`：只装"真 / 假"两个值的类型**

Java 给"是 / 不是"这种答案准备了一个类型叫 \`boolean\`（读作"布尔"），它的盒子只能装两个值：

\`\`\`java
boolean ok = true;      // true 读作"真"，表示"是"
boolean bad = false;    // false 读作"假"，表示"不是"
\`\`\`

\`true\` 和 \`false\` 是 Java 的关键字，**直接写、不加引号**；写成 \`"true"\` 就变成一串普通文字了。

（注意：C++ 里这个类型叫 \`bool\`，Java 里必须写成 **\`boolean\`**。）

**② 把 \`boolean\` 写在方法最前面，方法交出的就是真假值**

\`\`\`java
static boolean isPrime(int n) {   // 交回 true 表示"是素数"，false 表示"不是素数"
    if (n < 2) {
        return false;             // 0、1、负数都不是素数，立刻交答案
    }
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            return false;         // 找到一个能整除它的因子，说明不是素数
        }
    }
    return true;                  // 一个因子都没找到，才是素数
}
\`\`\`

这个方法是阶段三那题的"搬家版"：以前在 \`main\` 里用标志变量 + \`break\`，现在直接 \`return false;\`——**\`return\` 一句话同时干了两件事：翻牌子 + 跳出方法**。方法里有三个 \`return\` 很正常：**哪个先被执行到，方法就在哪里结束并交出答案**，后面的代码一律不看了。

试除的上限还是老规矩：写在 \`i * i <= n\`，等价于 \`i <= √n\`。

**③ 调用处：\`if (isPrime(x))\`**

\`boolean\` 方法最常待的地方就是 \`if\` 的括号里，因为那里要的正好是"真或假"：

\`\`\`java
if (isPrime(x)) {              // 读作"如果 x 是素数"，不用写 == true
    System.out.println("Yes");
} else {
    System.out.println("No");
}
\`\`\`

本题要判断 N 个数，所以调用写在循环里——这就是方法最大的好处：**定义一次，喊 N 次**：

\`\`\`java
int n = scanner.nextInt();
for (int i = 0; i < n; i++) {
    int x = scanner.nextInt();
    if (isPrime(x)) {
        System.out.println("Yes");
    } else {
        System.out.println("No");
    }
}
\`\`\`

${pointsTable([
  ['`boolean`', '只能装 `true` / `false`，不能装 3，也不能装 `"abc"`'],
  ['`return true;` / `return false;`', '直接写，不带引号'],
  ['一个方法可以有好几个 `return`', '一执行到就结束并交答案，写在前面的优先'],
  ['调用处 `if (isPrime(x))`', '括号里要的正好是真假值，不必写成 `== true`'],
  ['兜底那句 `return true;`', '循环走完还没返回，才说明"一个因子都没找到"；忘了它编译器会报 `missing return statement`'],
  ['谁负责打印', '方法只负责判断并 `return`，`Yes` / `No` 由 `main` 负责输出'],
  ['别忘了 `static`', '写 `static boolean isPrime(int n)`，漏了会报 `non-static method ... cannot be referenced from a static context`'],
])}`,
      inputFormat:
        '第一行，一个整数 `N`（`1 ≤ N ≤ 10`）。\n\n' +
        '第二行，`N` 个整数（`-100 ≤ 每个数 ≤ 100000`），用空格分隔。',
      outputFormat: '输出 `N` 行，每行一个 `Yes` 或 `No`：该数是素数输出 `Yes`，否则输出 `No`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n3\n2 4 17\n```\n\n**输出**\n\n```\nYes\nNo\nYes\n```\n\n' +
        '再比如：`N = 1`、要判断的数是 `1` 时输出 `No`（1 不是素数，方法应该走 `n < 2` 那一句）；' +
        '要判断的数是 `-7` 时输出 `No`（负数也不是素数）；要判断的数是 `9973` 时输出 `Yes`（一个因子都没找到）。',
      mistakes: mistakesTable([
        [
          '用 C++ 的写法 `static bool isPrime(int n)`',
          '报 `cannot find symbol: class bool`',
          'Java 里是 `static boolean isPrime(int n)`',
        ],
        [
          '方法最后忘了 `return true;`',
          '报 `missing return statement`：循环走完可能一条 `return` 都没执行',
          '循环外面补一句 `return true;`',
        ],
        [
          '忘了特判 `n < 2`',
          '输入 1 会被判成 `Yes`（循环一次都不执行，直接走到 `return true;`）',
          '方法开头先写 `if (n < 2) { return false; }`',
        ],
        [
          '试除条件写成 `i * i < n`',
          '9、25、49 这类平方数被误判成 `Yes`',
          '写成 `i * i <= n`（要取到 √n 本身）',
        ],
        [
          '`System.out.println(isPrime(x));`',
          '输出的是 `true` / `false`，不是题目要的 `Yes` / `No`',
          '用 `if (isPrime(x)) { System.out.println("Yes"); } else { System.out.println("No"); }`',
        ],
      ]),
      tips:
        '- `N` 个数要读 N 次 `scanner.nextInt()`，写在 `for (int i = 0; i < n; i++)` 循环里。\n' +
        '- `if (isPrime(x) == true)` 能跑，但属于废话：`if` 括号里本来就只要真假值。\n' +
        '- 方法只判断、`main` 负责输出，这样以后想换个输出格式（比如改成"是 / 不是"），只要改 `main` 一处。',
      starter: withMethods(
        `    static boolean isPrime(int n) {
        // TODO: 先处理 n < 2 的情况，再用循环从 2 试除到根号 n
        return false;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        for (int i = 0; i < n; i++) {
            int x = scanner.nextInt();
            // TODO: 调用 isPrime(x)，是素数输出 Yes，否则输出 No
        }`,
      ),
      solution: withMethods(
        `    static boolean isPrime(int n) {
        if (n < 2) {
            return false;
        }
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        for (int i = 0; i < n; i++) {
            int x = scanner.nextInt();
            if (isPrime(x)) {
                System.out.println("Yes");
            } else {
                System.out.println("No");
            }
        }`,
      ),
      tests: [
        { input: '3\n2 4 17\n', expected: 'Yes\nNo\nYes\n' },
        { input: '1\n1\n', expected: 'No\n' },
        { input: '4\n0 -7 2 3\n', expected: 'No\nNo\nYes\nYes\n' },
        { input: '3\n9973 10000 99991\n', expected: 'Yes\nNo\nYes\n' },
      ],
      hints: [
        '方法头写 `static boolean isPrime(int n)`，`return` 后面直接写 `true` 或 `false`，不加引号。',
        '第一句先解决小数字：`if (n < 2) { return false; }`；接着 `for (int i = 2; i * i <= n; i++)` 里发现 `n % i == 0` 就 `return false;`。',
        '循环外面记得 `return true;`——只有"一个因子都没找到"才说明它是素数。',
        '`main` 里用 `for` 循环读 N 个数，每个都 `if (isPrime(x))` 判断一次，分别输出 `Yes` / `No`。',
      ],
    }),

    lesson({
      id: 'j5-3',
      title: '数组求和（方法版）',
      difficulty: '简单',
      knowledge: '数组作为参数',
      story:
        '数组一次能装很多数据，但真正干活的时候，我们总想把整排数据交给方法去处理。\n\n' +
        '在 C++ 里，数组参数必须写成 `int a[], int n`——**长度得单独传一个参数**。Java 没有这个麻烦：' +
        '数组自己就知道有多长，用 `a.length` 就能拿到。',
      task:
        '请实现方法 `static int sumOf(int[] a)`，返回数组 `a` 中所有元素的总和。\n\n' +
        '然后在 `main` 里读入 `n` 和 `n` 个整数存进数组，调用 `sumOf` 并输出总和。',
      lesson: `**① 数组参数怎么写：方括号跟着类型走**

\`\`\`java
static int sumOf(int[] a) {        // 参数是"一整排整数柜子"
    int sum = 0;
    for (int i = 0; i < a.length; i++) {
        sum += a[i];               // a[i] 的用法和在 main 里完全一样
    }
    return sum;
}
\`\`\`

**② Java 的好消息：数组自带 \`a.length\`，不用再传一个 \`n\`**

C++ 的函数签名是 \`int sumOf(int a[], int n)\`——因为函数自己不知道那排柜子里装了多少东西，长度必须**额外传**进去。Java 完全没有这个麻烦：**数组自己知道有多长**。

\`\`\`java
for (int i = 0; i < a.length; i++) { ... }   // a.length 就是元素个数
\`\`\`

${pointsTable([
  ['`int[] a`', '数组参数的写法：方括号写在**类型**后面。C++ 写 `int a[]`，Java 习惯写 `int[] a`（写 `int a[]` 也能编译，但不推荐）'],
  ['调用', '只写数组名：`sumOf(a)`——不加方括号、不写类型、也不用传长度'],
  ['`a.length`', '**属性**，不是方法，所以**不带括号**；写成 `a.length()` 会报 `cannot find symbol`'],
  ['`a.length` 与 `String.length()`', '数组的 `.length` 不带括号，字符串的 `.length()` 带括号，这两个很容易搞混'],
  ['下标范围', '合法下标是 `0` 到 `a.length - 1`，越界会抛 `ArrayIndexOutOfBoundsException`'],
  ['传的是柜子本人', '数组参数不是"一整排复印件"：方法里写 `a[0] = 99;`，外面的数组真的会变（下一题就靠这个本事）'],
])}

**③ 那本题为什么还要读一个 \`n\`？**

\`a.length\` 只有**在你已经有一个数组**之后才能用；要造出数组，还得先知道它要多大：

\`\`\`java
int n = scanner.nextInt();
int[] a = new int[n];              // 造出 n 个格子的数组
for (int i = 0; i < n; i++) {
    a[i] = scanner.nextInt();      // 把 n 个数一个个装进去
}
System.out.println(sumOf(a));      // 把整排柜子交给方法去算
\`\`\`

**④ 方法里求和就三件事**

\`\`\`java
int sum = 0;                       // ① 累加器一定要先设初值 0
for (int i = 0; i < a.length; i++) {
    sum += a[i];                   // ② 一个一个加上去
}
return sum;                        // ③ 把总和交出去
\`\`\`

注意 \`sum\` 是方法里的**局部变量**，和 \`main\` 里可能存在的同名变量没有任何关系。`,
      inputFormat:
        '第一行，一个整数 `n`（`1 ≤ n ≤ 100`）。\n\n' +
        '第二行，`n` 个整数（`-10000 ≤ 每个数 ≤ 10000`），用空格分隔。',
      outputFormat: '输出一个整数，表示这 `n` 个数的总和（末尾换行）。',
      mistakes: mistakesTable([
        [
          '调用时写成 `sumOf(a, n)`',
          '报 `method sumOf in class Main cannot be applied to given types`',
          'Java 不需要传长度，只写 `sumOf(a)`',
        ],
        [
          '写成 `a.length()`',
          '报 `cannot find symbol: method length()`',
          '数组的 `length` 是属性，**不带括号**',
        ],
        [
          '`int sum;` 忘了写初值',
          '报 `variable sum might not have been initialized`',
          '累加器第一步就要 `int sum = 0;`',
        ],
        [
          '只写了 `sum += a[i];` 忘了最后的 `return sum;`',
          '报 `missing return statement`',
          '循环结束后补上 `return sum;`',
        ],
        [
          '循环写成 `i <= a.length`',
          '报 `ArrayIndexOutOfBoundsException`：下标越界',
          '写成 `i < a.length`（最后一个合法下标是 `a.length - 1`）',
        ],
      ]),
      tips:
        '- 方法签名里方括号紧挨类型：`static int sumOf(int[] a)`。\n' +
        '- 最大总和是 100 × 10000 = 1000000，`int` 装得下，不用换成 `long`。\n' +
        '- 方法里不需要任何"长度参数"，这正是 Java 比 C++ 省事的地方。',
      starter: withMethods(
        `    static int sumOf(int[] a) {
        // TODO: 用一个循环把 a[0] 到 a[a.length - 1] 累加起来，再 return 出去
        return 0;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        // TODO: 调用 sumOf(a) 并输出结果`,
      ),
      solution: withMethods(
        `    static int sumOf(int[] a) {
        int sum = 0;
        for (int i = 0; i < a.length; i++) {
            sum += a[i];
        }
        return sum;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        System.out.println(sumOf(a));`,
      ),
      tests: [
        { input: '5\n1 2 3 4 5\n', expected: '15\n' },
        { input: '1\n7\n', expected: '7\n' },
        { input: '3\n-1 -2 -3\n', expected: '-6\n' },
        { input: '5\n-10000 10000 0 5 -5\n', expected: '0\n' },
      ],
      hints: [
        '方法头写成 `static int sumOf(int[] a)`——方括号在类型后面，而且**不需要**再传长度。',
        '循环条件用 `a.length`：`for (int i = 0; i < a.length; i++)`。',
        '求和三步：`int sum = 0;` → 循环里 `sum += a[i];` → 最后 `return sum;`。',
        '调用只写数组名：`System.out.println(sumOf(a));`。',
      ],
    }),

    lesson({
      id: 'j5-4',
      title: '交换两个数（方法版）',
      difficulty: '中等',
      knowledge: '值传递与数组传参',
      story:
        '学方法时有一个"坑"，一定要亲自踩一次才记得住。\n\n' +
        '在 C++ 里，只要写成 `void swap2(int &a, int &b)`，函数就能真的把外面的两个变量对调。' +
        '**Java 里没有这个 `&`**：方法收到的永远是参数的**副本**，在方法里怎么改，外面的变量都一动不动。\n\n' +
        '这一题先用错误示范踩一次坑，再学正确的做法。',
      task:
        '请实现两个方法（名字必须与下面完全一致）：\n\n' +
        '- `static void swapWrong(int a, int b)`：**值传递**版本，把交换的三行代码写进去，用来观察"副本换了、外面的变量没换"。\n' +
        '- `static void swapInArray(int[] arr)`：**数组传参**版本，把 `arr[0]` 与 `arr[1]` 真正交换。\n\n' +
        '然后在 `main` 里读入两个整数 `a`、`b`，先调用 `swapWrong(a, b)` 并输出一行，再把它们装进数组、调用 `swapInArray` 并输出一行。',
      lesson: `**① 先看这个"看起来没问题"的方法**

\`\`\`java
static void swapWrong(int a, int b) {
    int t = a;
    a = b;
    b = t;          // 副本确实换过来了……
}
\`\`\`

可是在 \`main\` 里这样调用，结果会让人愣一下：

\`\`\`java
int a = 3;
int b = 7;
swapWrong(a, b);
System.out.println(a + " " + b);   // 打印出来还是 3 7！
\`\`\`

**外面的变量一点都没变。** 这不是 bug，而是 Java 的规矩：**值传递**。

**② 值传递：方法拿到的是"复印件"，不是原件**

打个比方：你手里有一份文件，方法说要帮你改。值传递就像你把文件**复印**一份递过去——他在复印件上怎么涂改，你手里的原件一个字都不会变。

调用 \`swapWrong(a, b)\` 时其实发生了三件事：

1. 把 \`a\` 的值**复制**进方法的参数 \`a\`，把 \`b\` 的值**复制**进方法的参数 \`b\`（名字一样也没关系，它们是两组完全不同的盒子）；
2. 方法里交换的是那两份副本；
3. 方法一结束，副本连同它们的改动一起消失；外面的 \`a\`、\`b\` 从头到尾没被碰过。

**③ Java 没有 \`&\`，C++ 的引用传参写不出来**

C++ 里那个 \`&\` 的意思是"参数不是副本，而是外面那两个变量本人"：

\`\`\`java
static void swap2(int &a, int &b) { }   // 错误示范：Java 完全不认这个写法
\`\`\`

Java 的语法里根本没有 \`int &a\` 这种东西，编译器会报 \`illegal start of type\`。**"让方法直接改外面的普通变量"这条路，在 Java 里走不通**，只能换个思路。

**④ 正确做法一（本题要求）：把两个数装进数组传进去**

数组参数和普通参数不一样：普通变量复制过去的是**值**，而数组变量装的是"那排柜子在哪里"，复制过去的只是这张"地址条"——**两边的名字指向同一排柜子**。所以在方法里改 \`arr[0]\`，外面看得见：

\`\`\`java
static void swapInArray(int[] arr) {   // 收到的 arr 和外面的数组是同一排柜子
    int t = arr[0];
    arr[0] = arr[1];
    arr[1] = t;                        // 这次改的是柜子里的东西，外面真的换了
}
\`\`\`

\`\`\`java
int[] arr = { a, b };                // 把两个数装进一排两格的柜子
swapInArray(arr);                    // 把柜子交给方法
System.out.println(arr[0] + " " + arr[1]);   // 这次真的交换了
\`\`\`

**⑤ 正确做法二：让方法把结果 \`return\` 回来**

如果方法只需要"算出一个结果"，最简单的办法就是**返回**它，而不是去改外面的变量。交换要交回两个值，而 Java 的方法**一次只能 \`return\` 一个值**，所以把两个数装进新数组再返回：

\`\`\`java
static int[] swapped(int a, int b) {
    return new int[] { b, a };       // 返回一个新数组，里面已经是换好顺序的两个数
}
\`\`\`

\`\`\`java
int[] result = swapped(a, b);        // 用变量接住方法交回来的数组
System.out.println(result[0] + " " + result[1]);
\`\`\`

**⑥ \`void\` 表示"这个方法不返回结果"**

\`\`\`java
swapWrong(a, b);                  // 正确：单独一行调用，别忘了分号
// int x = swapWrong(a, b);       // 错误：void 没有东西可以接
\`\`\`

${pointsTable([
  ['值传递（永远是它）', '参数是实参的**副本**，方法里改参数改不动外面的变量'],
  ['Java 没有 `&`', 'C++ 的 `int &a` 引用传参在 Java 里不存在，写不出等价的参数'],
  ['数组参数不一样', '数组变量复制的是"那排柜子在哪里"，所以方法里改 `arr[0]` 外面会变'],
  ['要改就改柜子里面', '把数据装进数组传进去，改 `arr[0]`、`arr[1]`，而不是改参数本身'],
  ['或者让它 return', '方法只能交回一个结果，要交回多个就装进数组一起返回'],
  ['`void` 方法', '不交答案，调用时单独一行，不能拿变量去接'],
])}

**一句话总结**：Java 的方法**改不了外面传进来的普通变量**；想把成果交出来，要么把数据装进数组传进去改，要么让它 \`return\` 回来。`,
      inputFormat: '一行，两个整数 `a` 和 `b`（`-1000000 ≤ a, b ≤ 1000000`），用空格分隔。',
      outputFormat:
        '输出两行：\n\n' +
        '- 第一行：`值传递: a b`——调用 `swapWrong` 之后的两个数，也就是**原样没变**；\n' +
        '- 第二行：`数组传参: a b`——调用 `swapInArray` 之后的两个数，已经**交换**。\n\n' +
        '两行的格式都是「中文说明 + 英文冒号 + 空格 + 两个整数（中间一个空格）」，例如 `值传递: 3 7`。',
      sample:
        '### 样例\n\n**输入**\n\n```\n3 7\n```\n\n**输出**\n\n```\n值传递: 3 7\n数组传参: 7 3\n```\n\n' +
        '第一行是"没变"的证据：`swapWrong` 里那三行交换只动了副本。' +
        '第二行才真的换了——因为数组传进去的是那排柜子本人。',
      mistakes: mistakesTable([
        [
          '照着 C++ 写 `static void swap2(int &a, int &b)`',
          '报 `illegal start of type`：Java 没有引用类型参数',
          '用 `static void swapInArray(int[] arr)`，或者让方法 `return` 一个新数组',
        ],
        [
          '`int x = swapWrong(a, b);`',
          '报 `incompatible types: void cannot be converted to int`',
          '`void` 方法单独一行调用：`swapWrong(a, b);`',
        ],
        [
          '调用数组版本时写成 `swapInArray(a, b)`',
          '报 `method swapInArray in class Main cannot be applied to given types`',
          '先把两个数装进数组：`int[] arr = { a, b }; swapInArray(arr);`',
        ],
        [
          '交换时不用临时变量：`arr[0] = arr[1]; arr[1] = arr[0];`',
          '两个格子最后都变成原来的 `arr[1]`，数据被覆盖',
          '用第三个变量：`int t = arr[0]; arr[0] = arr[1]; arr[1] = t;`',
        ],
        [
          '在 `swapWrong` 里用 `System.out.println` 打印，以为这样外面就变了',
          '打印出来的是副本换过的样子，`main` 里的 `a`、`b` 依旧没变',
          '输出统一放在 `main` 里，方法只管干活',
        ],
      ]),
      tips:
        '- 第一行的输出放在 `swapWrong` 调用**之后**，正好用来证明"外面的变量没变"。\n' +
        '- `int[] arr = { a, b };` 是 Java 造数组的简写，等价于 `new int[] { a, b }`。\n' +
        '- 记住这个比方：普通变量是"复印件"，数组是"柜子的地址条"。复印件的涂改没人看见，柜子里的改动谁都看得见。',
      starter: withMethods(
        `    // 值传递版本：参数是副本，交换副本不会影响外面的变量
    static void swapWrong(int a, int b) {
        // TODO: 用第三个变量交换 a 和 b，然后观察外面的值变了没有
    }

    // 数组版本：传进来的是那排柜子本人，改 arr[0] 外面看得见
    static void swapInArray(int[] arr) {
        // TODO: 用第三个变量交换 arr[0] 和 arr[1]
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();

        swapWrong(a, b);
        System.out.println("值传递: " + a + " " + b);

        int[] arr = { a, b };
        swapInArray(arr);
        // TODO: 从 arr 取回交换后的两个数，输出第二行：数组传参: a b`,
      ),
      solution: withMethods(
        `    // 值传递版本：参数是副本，交换副本不会影响外面的变量
    static void swapWrong(int a, int b) {
        int t = a;
        a = b;
        b = t;
    }

    // 数组版本：传进来的是那排柜子本人，改 arr[0] 外面看得见
    static void swapInArray(int[] arr) {
        int t = arr[0];
        arr[0] = arr[1];
        arr[1] = t;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();
        int b = scanner.nextInt();

        swapWrong(a, b);
        System.out.println("值传递: " + a + " " + b);

        int[] arr = { a, b };
        swapInArray(arr);
        a = arr[0];
        b = arr[1];
        System.out.println("数组传参: " + a + " " + b);`,
      ),
      tests: [
        { input: '3 7\n', expected: '值传递: 3 7\n数组传参: 7 3\n' },
        { input: '1 1\n', expected: '值传递: 1 1\n数组传参: 1 1\n' },
        { input: '-5 10\n', expected: '值传递: -5 10\n数组传参: 10 -5\n' },
        {
          input: '1000000 -1000000\n',
          expected: '值传递: 1000000 -1000000\n数组传参: -1000000 1000000\n',
        },
      ],
      hints: [
        '`swapWrong` 里照常写交换三步 `int t = a; a = b; b = t;`，但调用完你会发现外面的 `a`、`b` 一点没变——这就是 Java 的值传递。',
        'Java 里没有 `&`，要真正交换只能靠数组：`int[] arr = { a, b };` 然后 `swapInArray(arr);`，方法里改 `arr[0]`、`arr[1]`。',
        '别忘临时变量：`int t = arr[0]; arr[0] = arr[1]; arr[1] = t;`——两句直接互相赋值会把其中一个数覆盖掉。',
        '第一行输出的是"没变"的 `a`、`b`，第二行要先从 `arr[0]`、`arr[1]` 把交换后的值取回来再输出。',
      ],
    }),

    lesson({
      id: 'j5-5',
      title: '递归求阶乘',
      difficulty: '中等',
      knowledge: '递归与终止条件',
      story:
        '**递归**就是方法在方法体里调用它自己。听起来像"套娃"，但它特别适合处理那种' +
        '"大问题可以拆成同样形状的小问题"的场合。\n\n' +
        '以阶乘为例：`5! = 5 × 4 × 3 × 2 × 1`，仔细看会发现 `5! = 5 × 4!`——' +
        '求"5 的阶乘"可以变成"先求 4 的阶乘，再乘 5"，而"求 4 的阶乘"又是**一模一样的问题**，只是数字小了一号。',
      task:
        '请实现方法 `static long factorial(int n)`，**用递归**计算并返回 `n!`。\n\n' +
        '然后在 `main` 里读入 `n`，输出 `factorial(n)` 的结果。',
      lesson: `**① 递归方法长这样**

\`\`\`java
static long factorial(int n) {
    if (n <= 1) {
        return 1;                     // ① 出口：最小的情形直接给答案
    }
    return n * factorial(n - 1);      // ② 递推：喊自己算小一号的问题
}
\`\`\`

**② 这两句缺一不可**

- **终止条件（出口）**：\`if (n <= 1) { return 1; }\`。最小的情形不能再往下拆了，必须直接给出答案。**没有它，方法会永远喊自己，一层层堆下去直到内存用光，程序崩溃**——报错是 \`StackOverflowError\`（栈溢出）。
- **递推**：\`return n * factorial(n - 1);\`。把大问题换成"小一号的问题 + 一点收尾工作"。注意参数一定要**向出口靠近**（这里 \`n - 1\` 越来越小）；写成 \`factorial(n)\` 或 \`factorial(n + 1)\` 就永远走不到出口。

数学上规定 \`0! = 1\`（一个数都不乘，结果是 1），而 \`1! = 1\`，所以出口写成 \`n <= 1\` 一句话就把两种情形都管住了。

**③ 拿 \`factorial(3)\` 手推一遍**

\`\`\`
factorial(3) = 3 * factorial(2)
             = 3 * (2 * factorial(1))
             = 3 * (2 * 1)      ← factorial(1) 撞到出口，直接交出 1
             = 3 * 2
             = 6
\`\`\`

往下喊的时候数字一路变小（3 → 2 → 1），撞到出口之后开始往回返（1 → 2 → 6），每一层都把自己那个 \`n\` 乘上去。

**④ 为什么返回类型是 \`long\`**

\`13!\` = 6227020800 已经超过 \`int\` 能表示的范围（约 21 亿），用 \`int\` 会悄悄溢出成一个负数，而且**编译器不会报错**，非常难查。所以返回类型写 \`long\`（长整型）。本题 \`n\` 最大 20，\`20!\` = 2432902008176640000，\`long\` 装得下。

**⑤ 调用和普通方法完全一样**

\`\`\`java
int n = scanner.nextInt();
System.out.println(factorial(n));   // 传 5 进来，交出 120
\`\`\`

${pointsTable([
  ['递归', '方法体里调用自己，例如 `factorial(n - 1)`'],
  ['终止条件（出口）', '必须有，写在方法最前面，例如 `if (n <= 1) { return 1; }`'],
  ['参数要变小', '每次调用传 `n - 1`，才会一步步靠近出口'],
  ['先写出口再写递推', '顺序写反很容易写出永远停不下来的方法'],
  ['出口的返回值是 `1`', '`0!` 和 `1!` 都等于 1；写成 `return 0;` 会让所有结果都变成 0'],
  ['返回类型用 `long`', '`13!` 就超过 `int` 上限了，写 `int` 会得到莫名其妙的负数'],
  ['别忘了 `static`', '`static long factorial(int n)`，漏了会报 `non-static method ... cannot be referenced from a static context`'],
  ['调用', '`System.out.println(factorial(n));`，和普通方法没区别'],
])}`,
      inputFormat: '一行，一个整数 `n`（`0 ≤ n ≤ 20`）。',
      outputFormat: '输出一个整数，表示 `n!`（末尾换行）。',
      sample:
        '### 样例\n\n**输入**\n\n```\n5\n```\n\n**输出**\n\n```\n120\n```\n\n' +
        '再比如：输入 `0` 输出 `1`（数学规定 `0! = 1`，方法应该直接撞到出口）；' +
        '输入 `13` 输出 `6227020800`（已经超过 `int` 的范围，所以要用 `long`）。',
      mistakes: mistakesTable([
        [
          '忘了写终止条件',
          '运行时报 `StackOverflowError`：方法永远喊自己，把内存用光',
          '方法第一句先写出口：`if (n <= 1) { return 1; }`',
        ],
        [
          '递推写成 `return n * factorial(n);`',
          '参数没变小，永远到不了出口 → `StackOverflowError`',
          '参数要靠近出口：`factorial(n - 1)`',
        ],
        [
          '出口写成 `return 0;`',
          '所有结果都乘上 0，最后输出 0',
          '出口要交回 1：`0!` 和 `1!` 都等于 1',
        ],
        [
          '返回类型写成 `int`',
          '输入 13 得到一个负数（悄悄溢出，不报错，很难查）',
          '返回类型写 `long`，必要时用 `long` 变量接住结果',
        ],
        [
          '方法头上忘了写 `static`',
          '报 `non-static method factorial(int) cannot be referenced from a static context`',
          '写成 `static long factorial(int n)`',
        ],
      ]),
      tips:
        '- 写完先在心里跑一遍 `factorial(3)`：应该得到 6，能跑通说明出口和递推都写对了。\n' +
        '- 递归和阶段三的循环版是"同一件事的两种写法"：循环从 1 乘到 n，递归从 n 一路拆到 1。递归更贴近数学定义，写出来更短，但**一定要有出口**。\n' +
        '- `StackOverflowError` 出现时，几乎都是两个原因之一：没写出口，或者参数没有靠近出口。',
      starter: withMethods(
        `    static long factorial(int n) {
        // TODO: 先写终止条件（n 为 0 或 1 时返回 1）
        // TODO: 再写递推：return n * factorial(n - 1);
        return 1;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        // TODO: 调用 factorial(n) 并输出结果`,
      ),
      solution: withMethods(
        `    static long factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        System.out.println(factorial(n));`,
      ),
      tests: [
        { input: '5\n', expected: '120\n' },
        { input: '0\n', expected: '1\n' },
        { input: '13\n', expected: '6227020800\n' },
        { input: '20\n', expected: '2432902008176640000\n' },
      ],
      hints: [
        '递归方法的第一句永远是出口：`if (n <= 1) { return 1; }`，0 和 1 都直接交出 1。',
        '出口写完之后，下一句就是递推：`return n * factorial(n - 1);`。',
        '返回类型必须写 `long`，用 `int` 的话输入 13 就会得到一个莫名其妙的负数。',
        '`main` 里只需要 `System.out.println(factorial(n));`，调用方式和普通方法没有区别。',
      ],
    }),

    lesson({
      id: 'j5-6',
      title: '方法重载：算面积',
      difficulty: '中等',
      knowledge: '方法重载',
      story:
        'Java 允许**好几个方法用同一个名字**，只要它们的**参数列表不一样**（参数个数不同，或者类型不同）。' +
        '这个本事叫做**方法重载**（overload）。\n\n' +
        '比如可以同时写 `area(int r)` 算圆的面积、`area(double w, double h)` 算长方形的面积；' +
        '调用的时候，编译器会根据你给的参数**自动挑**合适的那一个。',
      task:
        '请实现两个重载方法：\n\n' +
        '- `static double area(int r)`：返回半径为 `r` 的圆的面积，公式是 `π × r × r`（π 取 `3.1415926535`）。\n' +
        '- `static double area(double w, double h)`：返回长 `w`、宽 `h` 的长方形面积，公式是 `w × h`。\n\n' +
        '然后在 `main` 里读入一个整数 `n`（只可能是 `1` 或 `2`）：`n = 1` 时再读一个整数 `r`，输出圆的面积；' +
        '`n = 2` 时再读两个数 `w`、`h`，输出长方形面积。结果都**保留两位小数**。',
      lesson: `**① 重载：同名的方法，靠"参数列表"区分**

生活中的类比：家里有人喊一声"开灯"，客厅里的你按客厅的开关，卧室里的你按卧室的开关——**同一句话，因为"场合（参数）"不同，做的是不同的事**。

\`\`\`java
static double area(int r) {                  // 版本一：给 1 个整数 → 算圆
    return 3.1415926535 * r * r;
}

static double area(double w, double h) {     // 版本二：给 2 个小数 → 算长方形
    return w * h;
}
\`\`\`

**② 谁来挑版本？编译器按实参自动挑**

\`\`\`java
System.out.println(area(3));          // 只给 1 个整数 → 选中"圆"那一版
System.out.println(area(2.5, 4.0));   // 给 2 个小数 → 选中"长方形"那一版
\`\`\`

你完全不用管，也不用起 \`area1\`、\`area2\` 这种名字。

**③ 一条必须记牢的规矩：只看参数，不看返回值**

如果两个方法同名、**参数列表也完全相同**，只是返回值类型不同，编译器会直接报 \`method area(int) is already defined\`——因为它没法知道 \`area(3)\` 该交回哪一种结果。**返回值类型不同，不算重载。**

同理，**参数名不同也不算不同**：\`area(int a)\` 和 \`area(int r)\` 是同一个方法，同样会报 \`already defined\`。

${pointsTable([
  ['重载的条件', '同名 + **参数列表不同**（个数不同，或类型不同）'],
  ['不看返回值', '只有返回值不同 → 报 `method ... is already defined`，不算重载'],
  ['参数名不算数', '`area(int a)` 与 `area(int r)` 参数列表相同，属于同一个方法，不能共存'],
  ['谁来挑版本', '编译器按实参的**个数和类型**自动匹配，你不用手写 `area1` / `area2`'],
  ['`area(3)`', '`3` 是 `int`，匹配 `area(int r)`'],
  ['`area(w, h)`', '`w`、`h` 必须都是 `double`（所以才用 `scanner.nextDouble()` 读），才匹配两个参数的版本'],
  ['保留两位小数', '`System.out.printf("%.2f\\n", 值);`——`%.2f` 表示"小数、保留 2 位"，`\\n` 表示换行'],
  ['别忘了 `static`', '两个方法头都要写 `static`，否则 `main` 里喊不动它们'],
])}

**④ 怎么输出"保留两位小数"**

Java 直接打印 \`double\` 会把所有小数位都吐出来（\`area(1)\` 会打印 \`3.1415926535\`）。想固定位数就用 \`printf\`：

\`\`\`java
System.out.printf("%.2f\\n", area(r));   // 3.14
\`\`\`

- \`%f\` 是"这里放一个小数"的占位符；
- \`.2\` 表示保留两位（会四舍五入）；
- \`\\n\` 表示换行，和字符串里的换行符是同一个东西。

**⑤ 本题的 \`main\` 长这样**

\`\`\`java
int n = scanner.nextInt();
if (n == 1) {
    int r = scanner.nextInt();               // r 是 int，正好匹配 area(int r)
    System.out.printf("%.2f\\n", area(r));
} else {
    double w = scanner.nextDouble();         // w、h 是 double，匹配两个参数的版本
    double h = scanner.nextDouble();
    System.out.printf("%.2f\\n", area(w, h));
}
\`\`\``,
      inputFormat:
        '第一行，一个整数 `n`，只可能是 `1` 或 `2`。\n\n' +
        '- `n = 1` 时：第二行是一个整数 `r`（`0 ≤ r ≤ 100`），表示圆的半径；\n' +
        '- `n = 2` 时：第二行是两个数 `w`、`h`（`0 < w, h ≤ 100`，可能是小数），用空格分隔，表示长方形的长与宽。',
      outputFormat: '输出一行，表示算出的面积，**保留两位小数**（末尾换行）。',
      sample:
        '### 样例\n\n**输入**\n\n```\n1\n1\n```\n\n**输出**\n\n```\n3.14\n```\n\n' +
        '再比如：输入 `2` 与 `3 4`，输出 `12.00`（长方形面积，两位小数不能省）；' +
        '输入 `1` 与 `2`，输出 `12.57`（`3.1415926535 × 2 × 2 = 12.566…`，四舍五入到两位）。',
      mistakes: mistakesTable([
        [
          '只有返回值不同：`int area(int r)` 和 `double area(int r)`',
          '报 `method area(int) is already defined`',
          '参数列表必须不同：把其中一个改成 `area(double w, double h)`',
        ],
        [
          '只改了参数名：`area(int a)` 与 `area(int r)`',
          '同样报 `already defined`：参数列表算下来是一样的',
          '改参数的**个数或类型**，光换名字不算重载',
        ],
        [
          '调用时写了类型：`area(int r)`',
          '报 `<identifier> expected` 之类的语法错误',
          '调用只写值：`area(r)`、`area(w, h)`',
        ],
        [
          '`System.out.println(area(r));`',
          '输出 `3.1415926535` 这样一长串，与 `3.14` 不一致',
          '用 `System.out.printf("%.2f\\n", area(r));`',
        ],
        [
          '忘了写 `static`',
          '报 `non-static method area(int) cannot be referenced from a static context`',
          '两个方法头都加上 `static`',
        ],
      ]),
      tips:
        '- π 直接在方法里写 `3.1415926535` 就行，本题不需要更精确的值。\n' +
        '- `n = 2` 时一定要用 `scanner.nextDouble()` 读长和宽：参数是 `double`，才会匹配到两个参数的版本。\n' +
        '- 写 `printf` 时格式串里的 `%.2f` 和 `\\n` 都不能少：少了 `\\n`，下一行输出会贴在同一行后面。',
      starter: withMethods(
        `    static double area(int r) {
        // TODO: 返回圆的面积：3.1415926535 * r * r
        return 0;
    }

    static double area(double w, double h) {
        // TODO: 返回长方形的面积：w * h
        return 0;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        if (n == 1) {
            int r = scanner.nextInt();
            // TODO: 输出 area(r)，保留两位小数
        } else {
            double w = scanner.nextDouble();
            double h = scanner.nextDouble();
            // TODO: 输出 area(w, h)，保留两位小数
        }`,
      ),
      solution: withMethods(
        `    static double area(int r) {
        return 3.1415926535 * r * r;
    }

    static double area(double w, double h) {
        return w * h;
    }`,
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        if (n == 1) {
            int r = scanner.nextInt();
            System.out.printf("%.2f\\n", area(r));
        } else {
            double w = scanner.nextDouble();
            double h = scanner.nextDouble();
            System.out.printf("%.2f\\n", area(w, h));
        }`,
      ),
      tests: [
        { input: '1\n1\n', expected: '3.14\n' },
        { input: '2\n3 4\n', expected: '12.00\n' },
        { input: '1\n0\n', expected: '0.00\n' },
        { input: '2\n2.5 4\n', expected: '10.00\n' },
      ],
      hints: [
        '两个方法同名、参数不同：`static double area(int r)` 和 `static double area(double w, double h)`。',
        '圆面积写 `return 3.1415926535 * r * r;`，长方形面积写 `return w * h;`。',
        '保留两位小数用 `System.out.printf("%.2f\\n", area(...));`。',
        '`n = 2` 时用 `scanner.nextDouble()` 读 `w`、`h`（`double`），这样 `area(w, h)` 才会选中两个参数的版本。',
      ],
    }),
  ],
};
