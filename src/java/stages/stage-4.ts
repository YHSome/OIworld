/**
 * 阶段四 · 数组与字符串（6 道题）
 *
 * 读者已经会输出、变量、Scanner、if 分支与 for 循环。
 * 这一阶段第一次处理"一批数据"：先认识数组（一排编了号的储物柜，编号从 0 开始），
 * 再用「数组 + 循环」做求和、找最值、数次数、倒着输出，
 * 最后把 String 拆成一个个字符来观察，用"两头往中间比"判断回文。
 *
 * 全部代码都是 Java 8 语法（浏览器里跑的是 Doppio JVM），只用基本类型数组，
 * 不涉及自定义方法、类与对象、ArrayList / HashMap——那些留给后面三个阶段。
 */

import type { StageData } from '../../types/problem';
import { lesson, mainOnly, mistakesTable, pointsTable } from '../lesson.ts';

export const STAGE_4: StageData = {
  stage: 4,
  title: '阶段四 · 数组与字符串',
  subtitle: '数组、字符串与字符处理',
  summary:
    '数据从"一个"变成"一堆"的时候，就要请出**数组**了：把同类型的数据排成一排，用**下标**来点名。\n\n' +
    '这一阶段学会用「数组 + 循环」做四件事：求和、找最值、数次数、倒着输出；' +
    '再认识 `String` 的另一面——它是由一个个**字符**排成的，可以用 `s.charAt(i)` 把每个字符取出来观察。\n\n' +
    '**数组和字符串是一对长得很像、又容易记混的搭档**：它们都靠**从 0 开始的编号**取元素。' +
    '数组的编号写在方括号里、长度是 `a.length`（**没有圆括号**，它是属性）；' +
    '字符串的字符要用 `s.charAt(i)` 取、长度是 `s.length()`（**有圆括号**，它是方法）。这一阶段就把这对区别彻底记牢。',
  problems: [
    lesson({
      id: 'j4-1',
      title: '成绩单统计',
      difficulty: '入门',
      knowledge: '数组与循环求和',
      story:
        '如果要存 5 个同学的成绩，定义 5 个变量还勉强应付；那 100 个同学呢？\n\n' +
        'Java 提供了**数组**：把一堆**同类型**的数据排成一排，共用同一个名字，用**下标**（编号）来区分它们。\n\n' +
        '这一题先用数组把整张成绩单装起来，再用循环一口气算出总分和平均分。',
      task: '读入 `n` 个整数成绩，先把它们存进数组，再输出这些数的**总和**和**平均值**。',
      lesson: `**第一步：先认识"一排编了号的储物柜"**

游泳馆的更衣室里有一排**编了号的储物柜**：整排柜子共用同一个名字，你只要报出号码，就能打开对应的那一个。Java 里的**数组**就是这样的柜子排：

\`\`\`java
int[] a = new int[5];    // 一次造出 5 个整数柜子，编号 0、1、2、3、4
a[0] = 90;               // 0 号柜子（也就是第 1 个）放 90
a[1] = 85;               // 1 号柜子（也就是第 2 个）放 85
\`\`\`

方括号 \`[]\` 表示"这是一排东西"，\`new int[5]\` 表示"造 5 个整数位子"。这里有两个关键点：

1. **一次造一整排**：\`int[] a = new int[5];\` 不是"一个变量"，而是"5 个 int 位子排成一条线，共用名字 a"。
2. **编号从 0 开始**：第 1 个元素是 \`a[0]\`，第 2 个是 \`a[1]\`……第 n 个（也就是最后一个）是 \`a[n - 1]\`。所以 n 个数据能用的编号只有 **0 到 n - 1**。

${pointsTable([
  ['`int[] a = new int[n];`', '造一排 n 个整数位子，名字叫 `a`。**长度可以是一个变量**，因为要等读入 n 之后才知道要造几个位子'],
  ['`a[0]`', '第一个元素。**下标从 0 开始**，不是从 1 开始'],
  ['第 n 个元素', '写成 `a[n - 1]`，能用的下标最大只到 `n - 1`'],
  ['`a.length`', '数组的长度（一共有几个位子）。它是**属性**，后面**不加圆括号**：写 `a.length` 对，写 `a.length()` 编译就报错'],
  ['标准遍历', '`for (int i = 0; i < n; i++)`，正好走完 `a[0]` 到 `a[n - 1]`'],
  ['`sum += a[i];`', '累加，等价于 `sum = sum + a[i];`'],
  ['`1.0 * sum / n`', '两个整数相除会丢掉小数；乘上 `1.0` 之后整条算式就按小数算'],
])}

**第二步：先读 n，再造一排刚好的柜子**

Java 的数组要用 \`new\` 造出来，长度可以是一个**变量**，所以顺序很重要——先把 n 读进来，才知道要造几个位子：

\`\`\`java
int n = scanner.nextInt();       // 先知道一共有几个数
int[] a = new int[n];            // 再造一排刚好的柜子
for (int i = 0; i < n; i++) {
    a[i] = scanner.nextInt();    // 依次装进 a[0]、a[1]、…、a[n - 1]
}
\`\`\`

循环里的 \`i\` 从 0 一路长到 n - 1，正好就是每个柜子的编号，所以 \`a[i]\` 把每个位子都点了一遍。

**第三步：求和，再求平均**

\`\`\`java
int sum = 0;                     // 空盒子：一个数都还没往里加
for (int i = 0; i < n; i++) {
    sum += a[i];                 // 等价于 sum = sum + a[i];
}
System.out.println(sum);         // 第一行输出总分

double avg = 1.0 * sum / n;      // 乘上 1.0，除法就变成"小数除法"
System.out.println(avg);         // 第二行输出平均分
\`\`\`

为什么要写 \`1.0 * sum\`？因为 \`sum / n\` 是**两个整数相除**，Java 会把小数直接砍掉（\`5 / 2\` 得到 2，不是 2.5）。式子里只要出现一个小数（\`1.0\` 就算），结果就会按小数算。也可以换个办法：把 sum 直接声明成 \`double sum = 0;\`，那 \`sum / n\` 本来就是小数除法。

再提醒一件事：**Java 打印小数时会保留 \`.0\`**。平均分正好是 80 的时候，输出的是 \`80.0\`，而不是 \`80\`。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 100`）。\n\n' +
        '第二行 `n` 个整数（每个在 `-1000` 到 `1000` 之间），用空格分隔。',
      outputFormat:
        '输出两行：\n\n' +
        '1. 第一行是这些数的**总和**（整数）；\n' +
        '2. 第二行是**平均值**（小数）。\n\n' +
        '注意 Java 打印小数时会保留 `.0`：平均分正好是 80 时要输出 `80.0`。',
      mistakes: mistakesTable([
        ['`int[] a = new int[n];` 写在读入 n 之前', 'n 还是 0，数组长度为 0；后面 `a[i]` 立刻越界，报 `ArrayIndexOutOfBoundsException`', '先 `int n = scanner.nextInt();`，再 `new int[n]`'],
        ['循环条件写成 `i <= n`', '访问到不存在的 `a[n]`，报 `ArrayIndexOutOfBoundsException`', '写成 `i < n`，下标范围正好是 0 ~ n - 1'],
        ['`double avg = sum / n;`', '整数除法先砍掉小数：`sum = 15, n = 2` 得到 `7.0`，正确答案是 `7.5`', '写 `1.0 * sum / n`，或者把 `sum` 声明成 `double`'],
        ['`int sum;` 忘了写 `= 0`', '编译报错 `variable sum might not have been initialized`', '累加变量必须先归零：`int sum = 0;`'],
        ['`a.length()` 加了圆括号', '报错 `cannot find symbol: method length()`', '数组长度是属性：`a.length`，**不加圆括号**'],
      ]),
      tips:
        '- 记住"先读 n，再造数组"：`new int[n]` 里的 n 必须已经有值。\n' +
        '- 累加变量一定要先归零（`int sum = 0;`），否则编译不通过，或者算出来的数莫名其妙。\n' +
        '- n 个数存在 `a[0]` ~ `a[n - 1]` 里，**没有** `a[n]` 这个位子。想看数组长度就写 `a.length`（不加圆括号），它和字符串的 `s.length()` 不一样。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        // TODO: 定义 sum 并初始化为 0，用循环把 a[0] ~ a[n - 1] 累加到 sum 里
        // TODO: 输出总和（单独一行）
        // TODO: 输出平均值：double avg = 1.0 * sum / n;`,
        { imports: 'import java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }

        int sum = 0;
        for (int i = 0; i < n; i++) {
            sum += a[i];
        }
        System.out.println(sum);

        double avg = 1.0 * sum / n;
        System.out.println(avg);`,
        { imports: 'import java.util.Scanner;' },
      ),
      tests: [
        { input: '5\n80 90 75 60 95\n', expected: '400\n80.0\n' },
        { input: '2\n7 8\n', expected: '15\n7.5\n' },
        { input: '1\n7\n', expected: '7\n7.0\n' },
        { input: '4\n-5 -10 3 -8\n', expected: '-20\n-5.0\n' },
      ],
      hints: [
        '数组下标从 0 开始，第 n 个数是 `a[n - 1]`，遍历写 `for (int i = 0; i < n; i++)`。',
        '累加先准备 `int sum = 0;`，再在循环里写 `sum += a[i];`。',
        '平均值要用小数：写 `1.0 * sum / n`，否则整数除法会丢掉小数部分。',
        'Java 打印小数会保留 `.0`：平均分是 80 时输出就是 `80.0`。',
      ],
    }),

    lesson({
      id: 'j4-2',
      title: '谁最高，谁最低',
      difficulty: '简单',
      knowledge: '数组最值（擂台法）',
      story:
        '运动会上要找出跳得最高和最矮的同学。老师手里拿着一张成绩单，一个一个往下看，心里默默记着"目前最高"和"目前最低"。\n\n' +
        '这种思路叫做**打擂台**：先让第一个人当擂主，之后每来一个选手就比一比，赢了就换擂主。\n\n' +
        '在程序里，`mx`（maximum，最大）和 `mn`（minimum，最小）就是两个擂主。',
      task: '读入 `n` 个整数，找出其中的**最大值**和**最小值**并输出。',
      lesson: `选拔冠军最笨的办法是让每个人跟其他所有人各打一场；聪明的办法是**打擂台**：先请第一个人上台当**擂主**，之后每上来一个人就跟擂主比一次，赢了就换他站台上。所有人比完，还站在台上的就是冠军。

找最大值就是这么回事：

\`\`\`java
int mx = a[0];                  // 请 a[0] 上台当擂主（mx = maximum，最大）
int mn = a[0];                  // 找最小值也让 a[0] 先当擂主（mn = minimum，最小）
for (int i = 1; i < n; i++) {   // 从第 2 个数开始，一个一个上来挑战
    if (a[i] > mx) {
        mx = a[i];              // 挑战者更大 → 换擂主
    }
    if (a[i] < mn) {
        mn = a[i];              // 挑战者更小 → 换擂主
    }
}
System.out.println(mx + " " + mn);   // 中间那个空格是用字符串 " " 拼出来的
\`\`\`

其中 \`if (a[i] > mx) { mx = a[i]; }\` 读作："要是这个挑战者比现在的擂主还大，就把擂主换成它。"求最小值只要把 \`>\` 改成 \`<\`，其他地方一个字都不用动。

${pointsTable([
  ['打擂台三步', '① 第一个数先当擂主 ② 后面的数逐个上台挑战 ③ 赢了就换人'],
  ['`int mx = a[0];`', '初始擂主取**第一个元素**，它一定是数据里真实存在的数'],
  ['为什么不写 0', '0 可能比所有数据都大（或者都小），答案就错了'],
  ['循环从 `i = 1` 开始', '`a[0]` 已经当过擂主了，不用再和自己比一场'],
  ['求最小值', '把 `>` 换成 `<`，写法完全一样'],
  ['`n = 1` 时', '循环一次都不执行，`mx` 和 `mn` 都还是 `a[0]`，两个答案正好相同'],
  ['`mx + " " + mn`', '把"最大值、一个空格、最小值"拼成一串再输出'],
])}

**为什么擂主一开始必须选 \`a[0]\`，不能图省事写 \`int mx = 0;\`？**

因为 0 压根不是数据里的数，它可能比谁都不如。假如数据是 \`-3 -9 -1\`，全都在 0 下面，那"目前最大"就一直没人能打败 0，程序最后输出 0，可正确答案是 \`-1\`。让 \`a[0]\` 当初始擂主，就保证了擂主一定是数据里真实存在的数，怎么比都不会跑偏。

另外注意**循环从 \`i = 1\` 开始**：\`a[0]\` 已经站在台上了，没必要自己跟自己打一场。

**输出时中间那个空格是哪来的？** Java 的 \`System.out.println(...)\` 一次只能输出一样东西，中间的空格要自己用 \`+\` 拼进去：\`mx + " " + mn\` 里的 \`" "\` 就是一个只含一个空格的字符串。

**n = 1 的时候会怎样？** 循环一次都不执行，\`mx\` 和 \`mn\` 都还是 \`a[0]\`，输出两个相同的数——正好是正确答案。`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 100`）。\n\n' +
        '第二行 `n` 个整数（每个在 `-10000` 到 `10000` 之间），用空格分隔。',
      outputFormat:
        '输出一行，两个整数：先输出**最大值**，再输出**最小值**，中间用一个空格分隔。',
      mistakes: mistakesTable([
        ['`int mx = 0;`', '数据全是负数时（例如 `-3 -9 -1`）输出 0，正确答案是 `-1`', '用第一个元素当初始擂主：`int mx = a[0];`'],
        ['循环写成 `for (int i = 0; i < n; i++)`', '能算出答案，但第一轮是 `a[0]` 和自己比，白跑一趟', '从 `i = 1` 开始，写法更清楚'],
        ['循环条件写成 `i <= n`', '访问到不存在的 `a[n]`，报 `ArrayIndexOutOfBoundsException`', '条件是 `i < n`'],
        ['`if (a[i] > mx)` 后面忘了写 `mx = a[i];`', '比了却什么都没改，最后输出还是 `a[0]`', '大括号里要写 `mx = a[i];`'],
        ['`System.out.println(mx, mn);`', '报错（Java 的 println 一次只收一样东西）', '用 `+` 拼起来：`System.out.println(mx + " " + mn);`'],
      ]),
      tips:
        '- 动手前先想清楚两件事：**擂主是谁**（初始值取 `a[0]`）、**挑战者从第几个开始**（`i` 从 1 开始）。\n' +
        '- 找最小值不用另写一套循环，在同一个循环里再加一个 `if` 就行。\n' +
        '- 试着用 `n = 1` 和"所有数都相同"这两组数据在脑子里跑一遍，看看有没有漏掉的情况。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        // TODO: 让 mx 和 mn 都先等于 a[0]（两个擂主上台）
        // TODO: 从下标 1 开始循环，用两个 if 分别更新最大值和最小值
        // TODO: 输出 最大值 空格 最小值`,
        { imports: 'import java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }

        int mx = a[0];
        int mn = a[0];
        for (int i = 1; i < n; i++) {
            if (a[i] > mx) {
                mx = a[i];
            }
            if (a[i] < mn) {
                mn = a[i];
            }
        }

        System.out.println(mx + " " + mn);`,
        { imports: 'import java.util.Scanner;' },
      ),
      tests: [
        { input: '5\n3 7 2 9 5\n', expected: '9 2\n' },
        { input: '1\n-42\n', expected: '-42 -42\n' },
        { input: '4\n5 5 5 5\n', expected: '5 5\n' },
        { input: '6\n-3 -9 -1 -7 -5 -2\n', expected: '-1 -9\n' },
      ],
      hints: [
        '先把 `mx` 和 `mn` 都设成第一个元素 `a[0]`，再从 `a[1]` 开始比较。',
        '打擂台就是 `if (a[i] > mx) { mx = a[i]; }`，求最小值把 `>` 换成 `<`。',
        '`mx` 千万别初始化成 0：数据全是负数时 0 比谁都大，答案就错了。',
        '输出两个数要用 `+` 拼起来：`System.out.println(mx + " " + mn);`。',
      ],
    }),

    lesson({
      id: 'j4-3',
      title: '点名统计',
      difficulty: '简单',
      knowledge: '数组计数与查找',
      story:
        '老师想知道某个学号在名单里出现了几次（比如签到表上有人重复签到）。办法很简单：从第一个数据看到最后一个，看到一次就画一笔"正"字。\n\n' +
        '这就是**计数**：准备一个计数器，遇到目标就加一。',
      task: '读入 `n` 个整数和一个目标值 `x`，统计 `x` 在数组里出现了多少次。',
      lesson: `这道题属于**统计类**问题：不用记住数据之间的顺序，只要从头到尾走一遍，一边看一边记账。

**第一步：准备一个计数器。**

计数器就是一个普通的整数变量，用之前**必须先归零**——就像数人数之前要先把手指收回来，不然会从上次的数继续往下数：

\`\`\`java
int n = scanner.nextInt();
int[] a = new int[n];
for (int i = 0; i < n; i++) {
    a[i] = scanner.nextInt();
}
int x = scanner.nextInt();          // 要统计的目标值

int cnt = 0;                        // 计数器：目前一个目标都还没数到
for (int i = 0; i < n; i++) {
    if (a[i] == x) {
        cnt++;                      // 遇到一个等于 x 的元素，就加 1
    }
}
System.out.println(cnt);            // 一个都没遇到时，cnt 本来就是 0
\`\`\`

\`cnt++\` 的意思是"让 cnt 加 1"，和 \`cnt = cnt + 1;\` 完全一样。注意 \`==\` 是**两个等号**，表示"相等"；一个等号 \`=\` 是赋值（把右边的值塞进左边），写错了编译器往往不报错，结果却一定不对。

**第二步：想清楚"要不要 break"。**

\`break\` 的意思是"立刻跳出循环，后面不看了"。什么时候能用它，取决于题目要什么：

| 题目要什么 | 要不要走完整个数组 | 写法 |
| --- | --- | --- |
| 数**次数**（本题） | **必须走完**，漏看一个就少数一次 | 用 \`cnt\`，循环里不能写 \`break\` |
| 只判断**有没有出现过** | 找到就可以收工 | 用 \`boolean found = false;\`，找到时改成 \`true\` 再 \`break;\` |
| 找**第一个**出现的位置 | 找到就可以收工 | 记下下标 \`pos = i;\`，然后 \`break;\` |

判断"有没有出现过"的写法长这样（本题用不上，但值得记住区别）：

\`\`\`java
boolean found = false;              // 标记变量：先假设"没找到"
for (int i = 0; i < n; i++) {
    if (a[i] == x) {
        found = true;               // 记下"找到了"
        break;                      // 已经能下结论，后面的不用再看
    }
}
\`\`\`

一句话记住：**要计数就别提前 break，只问"有没有"才可以用 break。**

${pointsTable([
  ['`int cnt = 0;`', '计数器必须先归零，否则里面是上一次留下的值'],
  ['`cnt++`', '让 cnt 加 1，等价于 `cnt = cnt + 1;`'],
  ['`==`', '两个等号才是"相等"；一个等号 `=` 是赋值'],
  ['`i < n`', '下标范围还是 0 ~ n - 1，写成 `i <= n` 会越界'],
  ['计数不能 `break`', '同一个数可能出现很多次，得全部看完才敢下结论'],
  ['目标不存在', '`cnt` 一直是 0，直接输出 `0` 就对，不用额外判断'],
  ['读入顺序', '先读 n、再读数组、最后读 `x`；顺序反了数据就会错位'],
])}`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 100`）。\n\n' +
        '第二行 `n` 个整数（每个在 `-1000` 到 `1000` 之间），用空格分隔。\n\n' +
        '第三行一个整数 `x`，表示要统计的目标值。',
      outputFormat:
        '输出一行，一个整数，表示 `x` 出现的次数。一次都没出现过就输出 `0`。',
      mistakes: mistakesTable([
        ['`if (a[i] = x)`', '这是赋值不是比较，编译报错 `int cannot be converted to boolean`', '判断相等用两个等号：`if (a[i] == x)`'],
        ['`int cnt;` 忘了写 `= 0`', '编译报错 `variable cnt might not have been initialized`', '计数器先归零：`int cnt = 0;`'],
        ['数到第一个就写 `break;`', '只数出 1 次，可实际上可能有好几个', '数次数要看完整个数组，循环里不要 `break`'],
        ['循环条件写成 `i <= n`', '访问到不存在的 `a[n]`，报 `ArrayIndexOutOfBoundsException`', '条件是 `i < n`'],
        ['先读 `x` 再读数组', '`x` 把数组的第一个数吃掉了，后面读进来的全都错位', '按题面顺序读：先 n，再数组，最后 x'],
      ]),
      tips:
        '- 计数器的初始化在循环**外面**，循环里面只负责让它加一。\n' +
        '- `cnt++` 单独占一行时，末尾也要有分号。\n' +
        '- 想知道"出现了几次"和"有没有出现过"的区别，可以回头看看「本关新知识」里那张表。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        int x = scanner.nextInt();
        // TODO: 定义计数器 cnt 并初始化为 0
        // TODO: 遍历数组，遇到等于 x 的元素就让计数器加 1（不要 break）
        // TODO: 输出计数器的值`,
        { imports: 'import java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        int x = scanner.nextInt();

        int cnt = 0;
        for (int i = 0; i < n; i++) {
            if (a[i] == x) {
                cnt++;
            }
        }

        System.out.println(cnt);`,
        { imports: 'import java.util.Scanner;' },
      ),
      tests: [
        { input: '6\n3 1 3 2 3 4\n3\n', expected: '3\n' },
        { input: '5\n1 2 3 4 5\n9\n', expected: '0\n' },
        { input: '1\n7\n7\n', expected: '1\n' },
        { input: '8\n5 5 5 5 5 5 5 5\n5\n', expected: '8\n' },
      ],
      hints: [
        '先写 `int cnt = 0;`，循环里写 `if (a[i] == x) { cnt++; }`。',
        '判断相等用 `==`（两个等号）；`=` 是赋值，写错了一定得不到正确答案。',
        '循环条件写成 `i < n`，才能检查到最后一个元素 `a[n - 1]`。',
        '计数器不要写在循环里面，否则每一轮都会被重新归零。',
      ],
    }),

    lesson({
      id: 'j4-4',
      title: '倒着报数',
      difficulty: '简单',
      knowledge: '数组逆序输出',
      story:
        '体育课上排队报数。如果老师要求"从最后一排开始报"，你就要从排尾往排头念名字。\n\n' +
        '数组最大的好处是：**任何一个元素都能按下标随时取出来**。所以倒着输出根本不用把数据搬家，' +
        '只要让循环变量从大到小走一遍就行。',
      task: '读入 `n` 个整数，按**相反的顺序**输出它们，数字之间用一个空格分隔。',
      lesson: `平时我们写的循环是"从小往大"：

\`\`\`java
for (int i = 0; i < n; i++) { }      // i = 0, 1, 2, …, n-1
\`\`\`

想倒着走，只要把三样东西全反过来：

\`\`\`java
for (int i = n - 1; i >= 0; i--) {   // i = n-1, n-2, …, 1, 0
    // 这里的 i 依次指向最后一个元素、倒数第二个……直到第一个元素
}
\`\`\`

| 循环的三个部分 | 正着走 | 倒着走 |
| --- | --- | --- |
| 从哪里开始 | \`i = 0\` | \`i = n - 1\`（最后一个元素的下标） |
| 什么时候继续 | \`i < n\` | \`i >= 0\`（**等号不能省**） |
| 每轮怎么变 | \`i++\`（加 1） | \`i--\`（减 1） |

\`i\` 从 \`n - 1\` 开始，每轮减 1，走到 0 时还能再进一次循环（因为 \`0 >= 0\` 成立），减到 -1 时才停下来——正好把 n 个元素每个都点了一遍。

**再说末尾那个空格。** 如果每轮都写 \`System.out.print(a[i] + " ");\`，最后一个数后面会多跟一个空格。本题要求"末尾不要多输出空格"，那就换个顺序：先把最后一个元素单独输出，再让循环里每个数**前面**带一个空格：

\`\`\`java
System.out.print(a[n - 1]);              // 第一个打印的数，前面不放空格
for (int i = n - 2; i >= 0; i--) {       // 接着打印剩下的，还是倒着走
    System.out.print(" " + a[i]);        // 空格夹在两个数中间，末尾就不会多出来
}
System.out.println();                    // 最后换一行
\`\`\`

打印 5 个数时得到 \`5 4 3 2 1\`，空格不多不少。

这里用到了 \`print\` 和 \`println\` 的区别：\`print\` 打完不换行，下一句接着往同一行写；\`println\` 打完自动换行。最后那句 \`System.out.println();\` 括号里什么都没写，作用就是"只输出一个换行"。

**最后再提醒一次越界**：n 个元素能用的下标只有 0 ~ n - 1。\`a[n]\` 已经站到柜子排外面去了，程序会当场报 \`ArrayIndexOutOfBoundsException\`（数组下标越界异常）。

${pointsTable([
  ['倒着遍历', '`for (int i = n - 1; i >= 0; i--)`：起点 `n - 1`，终点 `0`'],
  ['`i--`', '每轮让 i 减 1，等价于 `i = i - 1;`'],
  ['`i >= 0`', '等号千万不能省，省了就丢掉了下标 0 那个元素'],
  ['最后一个元素', '是 `a[n - 1]`；写 `a[n]` 就越界'],
  ['逆序不必搬家', '数据还留在原处，只是"取它们的顺序"反了'],
  ['`print` 与 `println`', '`print` 不换行，`println` 自动换行；`System.out.println();` 只输出一个换行'],
])}`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 100`）。\n\n' +
        '第二行 `n` 个整数（每个在 `-1000` 到 `1000` 之间），用空格分隔。',
      outputFormat:
        '输出一行，`n` 个整数，用单个空格分隔，末尾**不要**多输出空格。',
      mistakes: mistakesTable([
        ['循环写成 `for (int i = n - 1; i > 0; i--)`', '漏掉下标 0 那个元素，只输出了 n - 1 个数', '条件是 `i >= 0`，等号不能省'],
        ['从 `i = n` 开始', '一开始就取 `a[n]`，立刻报 `ArrayIndexOutOfBoundsException`', '起点是 `n - 1`（最后一个元素的下标）'],
        ['每轮都输出 `a[i] + " "`', '行末多出一个空格（本站评测会忽略行末空格，别的判题系统不一定）', '先单独输出 `a[n - 1]`，循环里输出 `" " + a[i]`'],
        ['每个数都用 `println` 输出', '每个数占一行，与期望输出不一致', '中间用 `print`，最后再写一句 `System.out.println();` 换行'],
        ['步进写成了 `i++`', 'i 越来越大，很快就会越界报错', '倒着走要用 `i--`'],
      ]),
      tips:
        '- 只改循环的三段就行，循环体里还是照常写 `a[i]`——数组本身一点都没变。\n' +
        '- 担心越界时，先把 n 和能用的下标范围写在纸上：`0` 到 `n - 1`。\n' +
        '- `n = 1` 时，单独输出的那句 `a[n - 1]` 就是 `a[0]`，循环一次都不执行，输出正好是那个数。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }
        // TODO: 先用 System.out.print(a[n - 1]); 输出最后一个元素
        // TODO: 用 for (int i = n - 2; i >= 0; i--) 倒着输出剩下的，每个数字前面加一个空格
        // TODO: 最后用 System.out.println(); 换行`,
        { imports: 'import java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int[] a = new int[n];
        for (int i = 0; i < n; i++) {
            a[i] = scanner.nextInt();
        }

        System.out.print(a[n - 1]);
        for (int i = n - 2; i >= 0; i--) {
            System.out.print(" " + a[i]);
        }
        System.out.println();`,
        { imports: 'import java.util.Scanner;' },
      ),
      tests: [
        { input: '5\n1 2 3 4 5\n', expected: '5 4 3 2 1\n' },
        { input: '1\n8\n', expected: '8\n' },
        { input: '4\n-1 0 5 -9\n', expected: '-9 5 0 -1\n' },
        { input: '3\n7 7 7\n', expected: '7 7 7\n' },
      ],
      hints: [
        '倒着遍历只要写 `for (int i = n - 1; i >= 0; i--)`，循环体里照常访问 `a[i]`。',
        '想避免行末多空格：先单独 `System.out.print(a[n - 1]);`，循环里改成 `System.out.print(" " + a[i]);`。',
        '数组下标最大只到 `n - 1`，写 `a[n]` 会抛 `ArrayIndexOutOfBoundsException`。',
        '最后别忘了 `System.out.println();` 补一个换行。',
      ],
    }),

    lesson({
      id: 'j4-5',
      title: '字符分类统计',
      difficulty: '简单',
      knowledge: 'String 与字符判断',
      story:
        '前面我们用 `String` 存名字，其实它是由一个个小格子排成的，每个格子里放**一个字符**。\n\n' +
        '- `s.length()` 得到字符串的长度（一共有几个字符）；\n' +
        '- `s.charAt(i)` 取出第 i 个字符，下标同样**从 0 开始**，最后一个字符是 `s.charAt(s.length() - 1)`。',
      task: '读入一个只含字母和数字的字符串，统计其中数字字符、大写字母、小写字母各有多少个。',
      lesson: `把 \`String\` 想成一串**糖葫芦**：一个一个小格子串在一起，每个格子里放**一个字符**：

\`\`\`java
String s = "Abc";        // 三个格子，依次放着 'A'、'b'、'c'
// s.charAt(0) 是 'A'，s.charAt(1) 是 'b'，s.charAt(2) 是 'c'
\`\`\`

**怎么知道它有多长？用 \`s.length()\`。**

\`\`\`java
String s = scanner.next();      // 读入一个不含空格的字符串
int n = s.length();             // 长度：一共有几个字符
\`\`\`

\`s.length()\` 就像问一句"你有多长"。**后面的圆括号一定要写**——这一点和数组正好相反：数组的长度是**属性**，写 \`a.length\`（没有圆括号）；字符串的长度是**方法**，写 \`s.length()\`（有圆括号）。少写一对括号，编译器就不认识它了。

**怎么取出第 i 个字符？用 \`s.charAt(i)\`。**

\`\`\`java
for (int i = 0; i < n; i++) {
    char c = s.charAt(i);       // 取出第 i 个字符，装进 char 类型的变量 c
}
\`\`\`

注意 Java **不能**像 C++ 那样写 \`s[i]\`——字符串不是数组，必须调用 \`charAt\`。\`charAt\` 返回的是 **\`char\`（字符）类型**，所以要用 \`char c\` 来接住它。下标还是从 0 开始，最后一个字符是 \`s.charAt(n - 1)\`。

**怎么判断一个字符属于哪一类？** 字符在计算机里是按编码从小到大排好的：\`'0' < '1' < … < '9' < 'A' < … < 'Z' < 'a' < … < 'z'\`。所以"是不是小写字母"，只要看它有没有落在 \`'a'\` 到 \`'z'\` 这个区间里：

\`\`\`java
int digits = 0;
int upper = 0;
int lower = 0;
for (int i = 0; i < n; i++) {
    char c = s.charAt(i);
    if (c >= '0' && c <= '9') {           // 落在 '0' ~ '9' 之间
        digits++;
    } else if (c >= 'A' && c <= 'Z') {    // 大写字母
        upper++;
    } else if (c >= 'a' && c <= 'z') {    // 小写字母
        lower++;
    }
}

System.out.println("数字：" + digits);
System.out.println("大写字母：" + upper);
System.out.println("小写字母：" + lower);
\`\`\`

\`&&\` 读作"**并且**"，两边的条件必须同时成立。\`c >= '0' && c <= '9'\` 就是"这个字符既不小于 \`'0'\`，也不大于 \`'9'\`"。用 \`else if\` 串起来的好处是：一个字符只会被归进一类，不会被数两次。

**单引号和双引号是完全不同的两样东西：**

- \`'A'\` 用**单引号**，是一个 \`char\`（**字符**）——一个格子里的东西；
- \`"A"\` 用**双引号**，是一个 \`String\`（**字符串**）——哪怕只有一个字符，它也是"一串"。

所以 \`s.charAt(i)\` 取出来的字符要和 \`'0'\`、\`'a'\` 这种**单引号字符**比较，不能写成双引号。\`'0'\` 的编码是 48，而数字 \`0\` 就是 0，两者不是一回事。

顺带记住一件事：字符之间可以直接用 \`==\`、\`>=\` 比较（\`char\` 是基本类型），但两个**字符串**想比较内容必须用 \`s.equals("abc")\`，**不能**用 \`==\`——\`==\` 比的是"是不是同一个对象"，结论常常和你以为的不一样。

${pointsTable([
  ['`s.length()`', '字符串的长度，**有圆括号**。它和数组的 `a.length`（没有圆括号）不一样'],
  ['`s.charAt(i)`', '取出第 i 个字符，返回 `char` 类型；Java 不能写 `s[i]`'],
  ['下标从 0 开始', '第一个字符是 `s.charAt(0)`，最后一个是 `s.charAt(n - 1)`'],
  ["`char` 与 `String`", "`'A'` 是字符（单引号），`\"A\"` 是字符串（双引号），不能混用"],
  ['区间比较', "`c >= '0' && c <= '9'` 判断\"是不是数字字符\""],
  ['`&&`', '"并且"：两边的条件要同时成立'],
  ['`else if`', '一个字符只归进一类，不会被数两次'],
  ['`s.equals("abc")`', '比较两个字符串的**内容**；用 `==` 比的是对象，容易出错'],
])}`,
      inputFormat:
        '一行，一个只含字母和数字的字符串（长度 `1 ≤ n ≤ 100`，中间没有空格）。',
      outputFormat:
        '输出三行，依次是数字、大写字母、小写字母的个数：\n\n' +
        '```\n数字：<个数>\n大写字母：<个数>\n小写字母：<个数>\n```\n\n' +
        '（冒号是中文全角 `：`，建议直接从题面复制。）',
      mistakes: mistakesTable([
        ['用 `s[i]` 取字符', '报错 `array required, but String found`', '字符串不是数组，要用 `s.charAt(i)`'],
        ['`s.length` 忘了写圆括号', '报错 `cannot find symbol: method length`', '字符串长度是方法：`s.length()`（数组才是 `a.length`）'],
        ['`s.charAt(n)`', '最后一个字符是 `s.charAt(n - 1)`；写 `n` 会抛 `StringIndexOutOfBoundsException`', '下标范围是 0 ~ n - 1'],
        ['写 `c >= "0" && c <= "9"`（双引号）', '报错 `incompatible types: String cannot be converted to char`', "字符用单引号：`c >= '0' && c <= '9'`"],
        ['用 `s == "abc"` 比较字符串', '编译能过，但结论常常是错的', '用 `s.equals("abc")` 比较内容'],
      ]),
      tips:
        '- 字符串长度是 `s.length()`（**有**圆括号），数组长度是 `a.length`（**没有**圆括号），这两个最容易记混，多念两遍。\n' +
        '- 动手前先想清楚"要数几类东西"，每一类准备一个计数器，并且都要先归零。\n' +
        '- 输出里的冒号是全角中文冒号 `：`，标点和题面不一致也会评测不通过。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();
        // TODO: 取出长度：int n = s.length();
        // TODO: 定义三个计数器 digits / upper / lower，都初始化为 0
        // TODO: 遍历每个字符（char c = s.charAt(i);），用区间比较判断类别，让对应计数器加 1
        // TODO: 按 数字 / 大写字母 / 小写字母 的顺序输出三行`,
        { imports: 'import java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();
        int n = s.length();

        int digits = 0;
        int upper = 0;
        int lower = 0;
        for (int i = 0; i < n; i++) {
            char c = s.charAt(i);
            if (c >= '0' && c <= '9') {
                digits++;
            } else if (c >= 'A' && c <= 'Z') {
                upper++;
            } else if (c >= 'a' && c <= 'z') {
                lower++;
            }
        }

        System.out.println("数字：" + digits);
        System.out.println("大写字母：" + upper);
        System.out.println("小写字母：" + lower);`,
        { imports: 'import java.util.Scanner;' },
      ),
      tests: [
        { input: 'Abc123\n', expected: '数字：3\n大写字母：1\n小写字母：2\n' },
        { input: 'HelloWorld\n', expected: '数字：0\n大写字母：2\n小写字母：8\n' },
        { input: '20250101\n', expected: '数字：8\n大写字母：0\n小写字母：0\n' },
        { input: 'a\n', expected: '数字：0\n大写字母：0\n小写字母：1\n' },
      ],
      hints: [
        '长度用 `int n = s.length();`，取字符用 `char c = s.charAt(i);`（注意圆括号，也不能写成 `s[i]`）。',
        "判断字符类型要写区间比较，例如 `c >= '0' && c <= '9'`，两个条件之间用 `&&`。",
        "字符用单引号、字符串用双引号：`'A'` 是字符，`\"A\"` 是字符串。",
        '三个计数器定义在循环外面、初始化为 0，循环里根据判断结果让对应的那个加 1。',
      ],
    }),

    lesson({
      id: 'j4-6',
      title: '回文串判断',
      difficulty: '中等',
      knowledge: '字符串与回文判断',
      story:
        '"上海自来水来自海上"——这句话正着读和倒着读一模一样，这种句子叫**回文**。英文里也有：`level`、`noon`、`radar` 都是回文。\n\n' +
        '怎么让程序来判断呢？把字符串想象成一根对称的糖葫芦：**从两头往中间**成对比较。',
      task: '读入一个字符串，判断它是不是回文串：是就输出 `YES`，不是就输出 `NO`。',
      lesson: `判断回文有个特别顺手的办法：**两头往中间比**。想象你捏着糖葫芦的两端，左边一颗、右边一颗地成对检查，只要有一对不一样，它就不是回文。

\`\`\`
下标:   0   1   2   3   4
字符:   l   e   v   e   l
对称:   ↑               ↑      比较 s.charAt(0) 和 s.charAt(4)
            ↑       ↑          比较 s.charAt(1) 和 s.charAt(3)
                ↑              中间那个不用比
\`\`\`

\`\`\`java
int n = s.length();
boolean ok = true;                              // 先大胆假设"它是回文"
for (int i = 0; i < n / 2; i++) {               // 只比前面一半就够了
    if (s.charAt(i) != s.charAt(n - 1 - i)) {   // 比"第 i 个"和"倒数第 i 个"
        ok = false;                             // 有一对不同，立刻改口：它不是回文
    }
}

if (ok) {
    System.out.println("YES");
} else {
    System.out.println("NO");
}
\`\`\`

这段短短几行里有几个地方值得掰开说：

- \`boolean\` 是专门装"是还是不是"的类型，只有 \`true\`（是）和 \`false\`（不是）两个值。\`ok\` 这样的变量常被叫做**标记变量**：先假设成立，发现问题就翻脸不认。
- 对称的一对字符，左边是 \`s.charAt(i)\`，右边是 \`s.charAt(n - 1 - i)\`——从最右边往左数 i 个。长度 5 时：\`charAt(0)\` 配 \`charAt(4)\`，\`charAt(1)\` 配 \`charAt(3)\`，正中间的 \`charAt(2)\` 自己跟自己比没有意义。
- 所以只比 \`n / 2\` 次就够。整数除法在这里帮了大忙：长度 5 得 2（比 2 对），长度 6 得 3（正好 3 对，一对不剩）。
- 改值用一个等号：\`ok = false;\` 是赋值；写成 \`ok == false;\` 只是"比较一下"，什么都不会改。

如果你更习惯"把它倒过来，看看一不一样"，也可以这样写：

\`\`\`java
String t = "";                                  // 新盒子，用来装倒过来的结果
for (int i = n - 1; i >= 0; i--) {
    t = t + s.charAt(i);                        // 把字符一个一个接到 t 的末尾
}
if (t.equals(s)) {                              // 比较内容要用 equals，不能用 ==
    System.out.println("YES");
} else {
    System.out.println("NO");
}
\`\`\`

两种办法都对，不过**第一种更省事**（不用另外准备一个字符串），推荐用第一种。顺便记住：两个字符串想比较内容，要用 \`t.equals(s)\` 而不是 \`t == s\`——\`==\` 比的是"是不是同一个对象"，和你想的完全不是一回事。（字符之间可以直接用 \`==\`、\`!=\`，因为 \`char\` 是基本类型。）

最后按结论输出：\`ok\` 是 \`true\` 就输出 \`YES\`，否则输出 \`NO\`——题目要求**大写**，别写成 \`Yes\`。

${pointsTable([
  ['`boolean ok = true;`', '标记变量，只有 `true` / `false` 两个值'],
  ['对称的一对', '左边 `s.charAt(i)`，右边 `s.charAt(n - 1 - i)`'],
  ['`i < n / 2`', '只比前一半：长度 5 比 2 次，长度 6 比 3 次'],
  ['`!=`', '"不相等"；发现不相等就把 `ok` 改成 `false`'],
  ['改值用一个等号', '`ok = false;` 是赋值；`ok == false;` 只是比较，什么都不会改'],
  ['`t.equals(s)`', '比较两个字符串的**内容**；用 `==` 比的是对象，容易出错'],
  ['`n = 1` 时', '`n / 2` 是 0，循环一次都不执行，`ok` 保持 `true`，输出 `YES`'],
])}`,
      inputFormat:
        '一行，一个只含字母和数字的字符串（长度 `1 ≤ n ≤ 100`，中间没有空格）。',
      outputFormat: '输出一行：是回文串输出 `YES`，否则输出 `NO`（全部大写）。',
      mistakes: mistakesTable([
        ['循环写成 `for (int i = 0; i < n; i++)`', '比到后半段时又和已经比过的字符对上，判断可能出错', '只比一半：`i < n / 2`'],
        ['右边写成 `s.charAt(n - i)`', '下标偏了一位，长度 5 时会取到 `charAt(5)`，抛 `StringIndexOutOfBoundsException`', '右边是 `s.charAt(n - 1 - i)`'],
        ['写成 `ok == false;`', '只是"比较了一下"，`ok` 一点没变，最后永远输出 YES', '赋值用一个等号：`ok = false;`'],
        ['用 `if (t == s)` 比较字符串', '编译能过，但比的是"是不是同一个对象"，结果常常是 NO', '用 `if (t.equals(s))`'],
        ['输出写成 `Yes` 或 `yes`', '与期望输出不一致（大小写敏感）', '题面要求全大写：`YES` / `NO`'],
      ]),
      tips:
        '- 动手前先把"要比较哪一对"写在纸上：左边 `s.charAt(i)`，右边 `s.charAt(n - 1 - i)`。\n' +
        '- `boolean` 标记变量的套路是：先假设成立（`true`），发现反例就改成 `false`。\n' +
        '- 想检查自己的程序，可以拿这几个串试一试：`a`（YES）、`ab`（NO）、`a1b1a`（YES）。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();
        // TODO: 取出字符串长度 n
        // TODO: 定义 boolean ok = true; 表示"目前看来它是回文"
        // TODO: 用 for (int i = 0; i < n / 2; i++) 比较 s.charAt(i) 和 s.charAt(n - 1 - i)
        // TODO: 根据 ok 的值输出 YES 或 NO`,
        { imports: 'import java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();
        int n = s.length();

        boolean ok = true;
        for (int i = 0; i < n / 2; i++) {
            if (s.charAt(i) != s.charAt(n - 1 - i)) {
                ok = false;
            }
        }

        if (ok) {
            System.out.println("YES");
        } else {
            System.out.println("NO");
        }`,
        { imports: 'import java.util.Scanner;' },
      ),
      tests: [
        { input: 'level\n', expected: 'YES\n' },
        { input: 'hello\n', expected: 'NO\n' },
        { input: 'a\n', expected: 'YES\n' },
        { input: 'ab\n', expected: 'NO\n' },
      ],
      hints: [
        '对称的一对字符是 `s.charAt(i)` 和 `s.charAt(n - 1 - i)`，判断它们**不相等**用 `!=`。',
        '循环只走一半：`for (int i = 0; i < n / 2; i++)`。长度 5 比 2 次、长度 6 比 3 次，正好把该比的全比完。',
        '用一个 `boolean` 变量先假设"是回文"，一旦发现不相等就改成 `false`，最后按它输出 `YES` 或 `NO`。',
        '字符串长度是 `s.length()`（有圆括号），取字符是 `s.charAt(i)`；`s.charAt(n)` 会越界。',
      ],
    }),
  ],
};
