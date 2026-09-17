/**
 * 阶段六 · 类与对象（6 道题）
 *
 * 对应 C++ 靶场的「结构体」阶段：Java 没有 struct，用的是**类**（class）——
 * 类里可以写字段（成员变量）、构造方法，还可以写方法。
 *
 * 这一阶段的读者已经学过：输出、变量、Scanner、分支、循环、数组、方法。
 *
 * 写作约定（与 stage-1 / stage-3 保持一致）：
 *   - 所有代码都是 Java 8 语法（浏览器里跑的是 Doppio JVM），
 *     不用 lambda、Stream、List.of、var、record；
 *   - 一个 Main.java 里只有 public class Main，其它类写成非 public 的顶层类；
 *   - 排序全部手写冒泡（教学价值高，且不依赖标准库的比较器）；
 *   - 只用 System.out.println 输出（避免依赖浏览器运行时里未经验证的格式化 API）；
 *   - 输出小数时顺着 Java 的习惯保留 `.0`（与阶段四一致），
 *     所以测试数据都选"除得尽"的平均分，保证输出稳定。
 */

import type { StageData } from '../../types/problem';
import { lesson, mistakesTable, pointsTable } from '../lesson.ts';

export const STAGE_6: StageData = {
  stage: 6,
  title: '阶段六 · 类与对象',
  subtitle: '类、字段、构造方法与对象数组',
  summary:
    '前面几阶段里，我们的数据都是"分散"的：一个 `String` 存姓名、一个 `int` 存成绩。\n\n' +
    '这一阶段来学 Java 最核心的概念：**类**（class）和**对象**（object）。类是**你自己设计的表格模板**，' +
    '对象就是照着这个模板**填好的一张表**。学会之后，一个 `Student` 对象就能把姓名和成绩装在一起，' +
    '一整班学生可以用 `Student[]` 数组来管理。\n\n' +
    '本阶段还会用到两个必须记牢的点：**对象数组的每个位置都要 `new` 一次**，' +
    '以及**字符串比较要用 `equals`，不能用 `==`**。',
  problems: [
    lesson({
      id: 'j6-1',
      title: '学生名片',
      difficulty: '入门',
      knowledge: '类、字段与对象',
      story:
        '到目前为止，我们学过的变量都是"单个格子"：一个 `int` 存一个年龄，一个 `String` 存一个名字。\n\n' +
        '可现实里的"一个学生"通常同时有好几项信息：姓名、成绩……要是给每个学生都定义一堆零散的变量，' +
        '很快就乱成一团了。\n\n' +
        'Java 的**类**（class）能把这些信息打包成一个**新类型**，就像一份自己设计的表格。',
      task:
        '读入一个学生的姓名和成绩，用一个 `Student` 对象把它们装起来，然后输出一张名片。',
      lesson: `**先记住这一对概念：类 = 表格模板，对象 = 照模板填好的一张表**

- **类**（class）是你自己设计的**表格模板**：模板上印好几栏——第一栏"姓名"、第二栏"成绩"，
  每一栏放什么类型由你规定。
- **对象**（object）是照着这个模板**填好的一张表**：模板只有一张，表可以填出很多张
  （一个班 40 个学生就是 40 张表）。

写类永远是三步：**先设计模板 → 再造一张表 → 最后用点号取出表格里的内容**。

\`\`\`java
class Student {                        // ① 设计模板：类名习惯首字母大写
    String name;                       // ② 第一栏"姓名"：这叫字段（成员变量）
    int score;                         //    第二栏"成绩"：也是字段

    Student(String name, int score) {   // ③ 构造方法：专门用来"填表"
        this.name = name;
        this.score = score;
    }
}
\`\`\`

**字段**（也叫成员变量）就是模板上的栏目：写在类的大括号里、方法的外面，写法和平时的变量一样。

**构造方法**是"填表机器"，四个要点一个都不能错：

${pointsTable([
  ['名字与类名完全相同', '类叫 `Student`，构造方法就必须叫 `Student`；写成 `student` 编译器就找不到它了'],
  ['**没有返回值类型**', '连 `void` 都不写：`Student(String name, int score) { ... }`。写了 `void` 它就变成普通方法了'],
  ['参数接收外面填进来的数据', '`new Student("Tom", 95)` 时，`"Tom"` 交给 `name`、`95` 交给 `score`'],
  ['`this.name = name;`', '`this.name` 是"这张表的姓名栏"，右边的 `name` 是参数。名字相同时必须用 `this.` 区分，否则就成了自己给自己赋值'],
])}

定义好之后，\`Student\` 就和 \`int\`、\`String\` 一样成了一个**类型**，可以用它创建对象：

\`\`\`java
Student s = new Student("Tom", 95);   // new 出一张新表，同时把两栏填好
System.out.println(s.name);           // 点号取值：这张表的姓名栏 → Tom
System.out.println(s.score);          // → 95
\`\`\`

把 \`new Student("Tom", 95)\` 读一遍就是：**"新建一张 Student 表，姓名栏填 Tom、成绩栏填 95。"**
\`new\` 负责"造表"，括号里的两个值按顺序送进构造方法的两个参数；造好的表交给左边的变量 \`s\` 保管，
以后用 \`s.name\`、\`s.score\` 就能取出里面的内容。

${pointsTable([
  ['`class Student { ... }`', '定义一个类。类名习惯用大驼峰：`Student`、`Rect`、`Person`'],
  ['`String name;` `int score;`', '**字段**（成员变量）：模板上的栏目，写在类里面、方法外面'],
  ['`Student(...) { }`', '**构造方法**：名字与类名相同、没有返回值类型，只在 `new` 的时候自动执行'],
  ['`new Student("Tom", 95)`', '照模板造出一个**对象**，括号里的值按顺序交给构造方法的参数'],
  ['`s.name` / `s.score`', '点号 `.` 访问字段，读作"对象 s 的姓名栏"。点号左边是对象，右边是字段名'],
  ['`this.name = name;`', '参数和字段同名时，用 `this.` 说明"要改的是这个对象的字段"'],
  ['同一个文件里可以写多个类', '一个 `Main.java` 里**只能有一个** `public class Main`；其它类直接写在它后面，**不加 `public`**'],
])}

**为什么别的类不写 \`public\`？** Java 规定"公开类的名字必须与文件名一致"，而本站的文件固定叫 \`Main.java\`，
所以只有 \`Main\` 能带 \`public\`。别的类写成 \`class Student { ... }\` 放在同一个文件里就行，用起来完全一样。`,
      inputFormat:
        '一行，一个姓名（不含空格）和一个整数成绩（`0 ≤ 成绩 ≤ 100`），中间用一个空格分隔。',
      outputFormat: '输出两行：\n\n```\n姓名：<姓名>\n成绩：<成绩>\n```',
      mistakes: mistakesTable([
        ['`Student s = Student("Tom", 95);`', '报错 `cannot find symbol: method Student`', '创建对象必须写 `new`：`new Student("Tom", 95)`'],
        ['构造方法写成 `void Student(String name, int score)`', '编译能过，但它已经是普通方法；`new Student(...)` 会报 `cannot find symbol: constructor Student`', '构造方法**不写返回值类型**，连 `void` 也不写'],
        ['构造方法里写 `name = name;`', '字段没被赋值，打印出来是 `null` 和 `0`', '左边写 `this.name`：`this.name = name;`'],
        ['用 `s.name()`、`s->name` 或 `s:name` 取字段', '报错 `cannot find symbol: method name()` 等', '字段用点号直接取：`s.name`（方法才要括号）'],
        ['字段末尾漏了分号：`String name`', "报错 `';' expected`", '每个字段声明都是一个完整语句：`String name;`'],
        ['\`System.out.println(s);\`', '打印出 \`Student@1b6d3586\` 这样的"哈希值"，不是你要的内容', '逐个字段输出：\`System.out.println(s.name);\`'],
      ]),
      tips:
        '- 类名、字段名都用英文，类名首字母大写（\`Student\`），字段名小写（\`name\`、\`score\`）——这是 Java 的约定，一眼就能分清哪个是类型、哪个是变量。\n' +
        '- 字段是有默认值的：\`String\` 默认 \`null\`（"什么都没有"）、\`int\` 默认 \`0\`。忘了在构造方法里赋值，打印出来就是它们。\n' +
        '- 想看对象里有什么，别直接打印对象本身（会得到 \`Student@1b6d3586\`），要一个字段一个字段地打印。',
      starter:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        // TODO: 用 this.name = name; 和 this.score = score; 把参数存进字段\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        String name = scanner.next();\n' +
        '        int score = scanner.nextInt();\n' +
        '        // TODO: 用 new Student(...) 造一个学生对象，交给一个 Student 变量保管\n' +
        '        // TODO: 输出第一行 姓名：<姓名>（用点号取对象的 name 字段）\n' +
        '        // TODO: 输出第二行 成绩：<成绩>（用点号取对象的 score 字段）\n' +
        '    }\n' +
        '}\n',
      solution:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        String name = scanner.next();\n' +
        '        int score = scanner.nextInt();\n' +
        '\n' +
        '        Student s = new Student(name, score);\n' +
        '\n' +
        '        System.out.println("姓名：" + s.name);\n' +
        '        System.out.println("成绩：" + s.score);\n' +
        '    }\n' +
        '}\n',
      tests: [
        { input: 'Tom 95\n', expected: '姓名：Tom\n成绩：95\n' },
        { input: 'Xiaoming 100\n', expected: '姓名：Xiaoming\n成绩：100\n' },
        { input: 'A 0\n', expected: '姓名：A\n成绩：0\n' },
        { input: 'Bob 60\n', expected: '姓名：Bob\n成绩：60\n' },
      ],
      hints: [
        '造对象的写法是 \`Student s = new Student(name, score);\`——\`new\` 后面跟类名和一对圆括号。',
        '构造方法里两个字段都要赋值：\`this.name = name;\` 和 \`this.score = score;\`（\`this.\` 不能省）。',
        '取字段用点号，不要加括号：\`s.name\` 是姓名，\`s.score\` 是成绩。',
        '格式是两行：\`姓名：\` 后面接姓名，\`成绩：\` 后面接成绩。',
      ],
    }),

    lesson({
      id: 'j6-2',
      title: '班级成绩单',
      difficulty: '简单',
      knowledge: '对象数组与循环',
      story:
        '一个 \`Student\` 对象只装一个学生，那一个班怎么办？\n\n' +
        '好消息：\`Student\` 既然是一个**类型**，就能像 \`int\` 一样拿来开数组。这种数组叫**对象数组**，' +
        '每个位置放的不是数字，而是**一整个学生对象**。',
      task:
        '读入 \`n\` 个学生的姓名和成绩，算出全班的**总分**和**平均分**。',
      lesson: `**对象数组：先造 n 个空位子，再逐格放进学生**

这里是新手最容易漏掉的一步，请慢慢看：

\`\`\`java
Student[] students = new Student[n];     // ① 只是造出 n 个"空位子"，位子上还没有人
students[0] = new Student("Tom", 95);    // ② 给 0 号位子真的造一个学生放进去
students[1] = new Student("Jerry", 80);  // ③ 1 号位子也一样
\`\`\`

**第 ① 步 \`new Student[n]\` 造的是"装学生的架子"，不是学生。** 架子上的每个格子现在都是
\`null\`（"什么都没有"）。想往里放东西，还得逐格 \`new\` 一个学生出来。如果漏了第 ② 步就直接写
\`students[0].score\`，程序运行时当场报 \`NullPointerException\`——意思是"你在一个空位子上取东西"。

所以读入一整班学生永远是"两层 new"：

\`\`\`java
int n = scanner.nextInt();                   // 先读人数
Student[] students = new Student[n];         // 外层 new：造 n 个空位子
for (int i = 0; i < n; i++) {
    String name = scanner.next();
    int score = scanner.nextInt();
    students[i] = new Student(name, score);  // 内层 new：把新学生放进第 i 个位子
}
\`\`\`

**取字段的顺序也要记牢：先写数组下标，再写点号和字段名。**

\`\`\`java
students[i].name      // 读作："第 i 位同学的姓名"
students[i].score     // 读作："第 i 位同学的成绩"
\`\`\`

从左往右读两遍：先看 \`students[i]\`——"拿出第 i 个位子上的人"；再看 \`.score\`——"取他的成绩栏"。
写成 \`students.score[i]\` 就完全不对了（那是在说"成绩表里的第 i 个"）。

${pointsTable([
  ['`Student[] students = new Student[n];`', '声明一个能装 `n` 个学生对象的数组，每个位置初值都是 `null`'],
  ['`students[i] = new Student(...)`', '**真正把对象放进第 i 个位置**。漏了这一步，取字段就报 `NullPointerException`'],
  ['下标从 0 开始', '第 1 位同学是 `students[0]`，第 n 位是 `students[n - 1]`'],
  ['先下标、后字段', '`students[i].score` 才对；`students.score[i]` 类型对不上'],
  ['数组长度写 `n`', '本题 `1 ≤ n ≤ 10`，写 `new Student[n]` 刚刚好；写死成 `new Student[5]` 在 n 更大时就越界了'],
  ['`students.length`', '数组的长度（本题就是 `n`）'],
])}

**求和、求平均和一个整数数组没什么两样**，只是累加的东西换成了"从对象里取出来的字段"：

\`\`\`java
int total = 0;
for (int i = 0; i < n; i++) {
    total += students[i].score;       // 把第 i 位同学的成绩加进去
}
System.out.println("总分：" + total);
System.out.println("平均分：" + 1.0 * total / n);
\`\`\`

两个提醒：

- \`1.0 * total / n\`：整数除法会丢掉小数部分（\`200 / 3\` 得到 66），乘上 \`1.0\` 就变成小数运算了。
- Java 打印小数时会**保留 \`.0\`**：平均分正好是 80 的时候，输出的是 \`80.0\` 而不是 \`80\`（这一点和 C++ 的
  \`cout\` 不一样）。本题的期望输出就按 Java 的习惯写。`,
      inputFormat:
        '- 第一行一个整数 `n`（`1 ≤ n ≤ 10`），表示学生人数。\n' +
        '- 接下来 `n` 行，每行一个姓名和一个整数成绩（`0 ≤ 成绩 ≤ 100`），中间用一个空格分隔。\n\n' +
        '姓名只由英文字母组成，不含空格。',
      outputFormat:
        '输出两行：\n\n```\n总分：<总分>\n平均分：<平均分>\n```\n\n' +
        '平均分按 Java 打印小数的默认样子输出（例如 `80.0`、`50.0`）。',
      mistakes: mistakesTable([
        ['只写了 `new Student[n]` 就去取 `students[0].name`', '运行时报 `NullPointerException`——数组里每个位置还是空的', '每个位置都要 `students[i] = new Student(...);` 放进对象后才能取字段'],
        ['`students[i] = Student(name, score);`', '报错 `cannot find symbol: method Student`', '造对象必须带 `new`：`students[i] = new Student(name, score);`'],
        ['写成 `students.name[i]` 或 `students.score[i]`', '报错，类型对不上（那是在从"姓名"里取下标的字符）', '先写下标，再写点号和字段：`students[i].name`'],
        ['循环条件写成 `i <= n`', '运行时报 `ArrayIndexOutOfBoundsException`（数组越界）', '下标只到 `n - 1`，条件写 `i < n`'],
        ['平均分写 `total / n`', '整数除法丢掉小数：`200 / 3` 得到 66，不是 66.66…', '写 `1.0 * total / n`，乘 `1.0` 把算式变成小数运算'],
        ['累加变量忘了初始化为 0', '编译报错 `variable total might not have been initialized`', '先写 `int total = 0;` 再在循环里 `+=`'],
      ]),
      tips:
        '- 把"造位子"和"放学生"想成两件事：`new Student[n]` 是买书架，`new Student(...)` 才是往格子里放书。\n' +
        '- 读入、累加可以分两个循环（先读完整班，再算总分），也可以边读边累加，两种都对。\n' +
        '- 打印 `students` 这种数组本身只会得到一串看不懂的符号，要打印的是 `students[i].name` 这样的字段。',
      starter:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Student[] students = new Student[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            int score = scanner.nextInt();\n' +
        '            // TODO: 把第 i 位同学放进 students[i]（别忘了 new）\n' +
        '        }\n' +
        '\n' +
        '        // TODO: 定义 int total = 0;，用循环把每位同学的成绩累加进去\n' +
        '        // TODO: 输出 总分：<总分>\n' +
        '        // TODO: 输出 平均分：<平均分>（用 1.0 * total / n）\n' +
        '    }\n' +
        '}\n',
      solution:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Student[] students = new Student[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            int score = scanner.nextInt();\n' +
        '            students[i] = new Student(name, score);\n' +
        '        }\n' +
        '\n' +
        '        int total = 0;\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            total += students[i].score;\n' +
        '        }\n' +
        '\n' +
        '        System.out.println("总分：" + total);\n' +
        '        System.out.println("平均分：" + 1.0 * total / n);\n' +
        '    }\n' +
        '}\n',
      tests: [
        { input: '3\nTom 90\nJerry 80\nLucy 70\n', expected: '总分：240\n平均分：80.0\n' },
        { input: '1\nSolo 95\n', expected: '总分：95\n平均分：95.0\n' },
        { input: '4\nA 10\nB 10\nC 10\nD 10\n', expected: '总分：40\n平均分：10.0\n' },
        { input: '3\nA 100\nB 0\nC 50\n', expected: '总分：150\n平均分：50.0\n' },
      ],
      hints: [
        '读入的循环里不要忘了 `students[i] = new Student(name, score);`——漏了这一步，后面取字段会报 `NullPointerException`。',
        '累加时先取对象再取字段：`total += students[i].score;`。',
        '平均分要写成小数：`1.0 * total / n`，直接写 `total / n` 会把小数部分丢掉。',
        '注意 Java 打印小数会保留 `.0`：总分 240、3 个人的平均分要输出 `80.0`。',
      ],
    }),

    lesson({
      id: 'j6-3',
      title: '长方形计算',
      difficulty: '简单',
      knowledge: '方法与对象传参',
      story:
        '类里除了数据（字段），还可以放"动作"（方法），而且方法可以把**整个对象**当参数收下、' +
        '再把**一整个对象**交回来。\n\n' +
        '这一题读入一个长方形的宽和高，让长方形对象"自己算"出面积和周长，把两样结果打包成一份交回来。',
      task:
        '读入长方形的宽 `w` 和高 `h`，用 `Rect` 类的方法算出**面积**和**周长**，再输出。\n\n' +
        '本题请补全给出的 `Rect`、`Result` 两个类和 `Main` 里的 `calc` 方法（成员名要与题目一致）。',
      lesson: `**类里除了字段，还可以写方法——对象自己会算**

字段是"数据"，方法是"动作"。把算式写进 \`Rect\` 类里，这个长方形对象就"自己会算面积"了：

\`\`\`java
class Rect {
    int w;
    int h;

    Rect(int w, int h) {
        this.w = w;
        this.h = h;
    }

    int area() {                 // 返回值类型写在最前面，然后是方法名和一对圆括号
        return w * h;            // 方法体里可以直接用字段名 w、h，它们属于"这个对象自己"
    }

    int perimeter() {
        return 2 * (w + h);      // 括号别丢：2 * w + h 的意思完全不同
    }
}
\`\`\`

和阶段五写的方法相比，只有一点不同：**类里的方法不写 \`static\`**，调用时要用**对象**来点：

\`\`\`java
Rect r = new Rect(3, 4);
System.out.println(r.area());        // → 12  读作"让 r 自己算一下面积"
System.out.println(r.perimeter());   // → 14
\`\`\`

${pointsTable([
  ['方法写在类的大括号里', '和字段平级，位置不分先后；习惯上字段写上面、方法写下面'],
  ['不写 `static`', '因为方法要用到"这个对象自己的字段"，所以必须由对象来调用：`r.area()`'],
  ['方法体里直接用字段名', '`w`、`h` 就是这个对象的字段；只有参数和字段同名时才需要写 `this.`'],
  ['方法名后面必须有括号', '`r.area()` 是调用方法；写成 `r.area` 编译器会以为你在找一个字段'],
  ['返回类型要配套', '`int area()` 里就要 `return w * h;` 交回一个整数；什么都不交回才写 `void`'],
])}

**把整个对象交给方法，也让方法交回一个对象**

既然 \`Rect\`、\`Result\` 都是**类型**，它们就能像 \`int\` 一样当**参数**和**返回值**。
好处是：一次就能把"面积 + 周长"两样结果打包交回来——一个 \`int\` 做不到这件事。

\`\`\`java
static Result calc(Rect r) {                        // 参数是"一整个长方形对象"
    return new Result(r.area(), r.perimeter());     // 返回值是"一整个结果对象"
}
\`\`\`

把 \`calc(r)\` 读一遍：**把 r 这个长方形整个递过去，拿回一个装着面积和周长的 \`Result\` 对象。**

\`\`\`java
Rect r = new Rect(3, 4);
Result out = calc(r);                // 用一个 Result 变量接住交回来的整份结果
System.out.println(out.area);        // 再照常用点号取出里面的字段
System.out.println(out.perimeter);
\`\`\`

${pointsTable([
  ['对象作参数', '参数写成 `Rect r`——"类型名 + 变量名"，和 `int w` 的写法一模一样'],
  ['对象作返回值', '返回类型写 `Result`，方法里 `return new Result(面积, 周长);` 交回去'],
  ['刚 new 出来的对象也能直接传', '`calc(new Rect(3, 4))` 也合法：先造对象，再整个递进去'],
  ['`static` 方法写在 `Main` 里', '`main` 也是 `static`，所以它能直接调用同一个类里的 `static` 方法 `calc(...)`'],
  ['接住返回值再取字段', '`Result out = calc(r);` 之后用 `out.area`；返回值不要"接到就扔"'],
])}

本题的字段和构造方法已经写好了。你要补三处：**\`Rect\` 里的 \`area()\` 与 \`perimeter()\` 两个方法**、
**\`Main\` 里的 \`calc\` 方法**（把结果打包交回去），最后在 \`main\` 里**接住返回值并输出**。
初始代码里那些 \`return 0;\`、\`return new Result(0, 0);\` 只是占位，写完就替换掉。`,
      inputFormat: '一行，两个整数 `w` 和 `h`（`1 ≤ w, h ≤ 10000`），表示长方形的宽和高，用空格分隔。',
      outputFormat: '输出两行：\n\n```\n面积：<面积>\n周长：<周长>\n```\n\n周长的算法是 `2 * (w + h)`。',
      mistakes: mistakesTable([
        ['方法里直接写 `return w * h;` 但方法签名写成 `static int area()`', '报错 `non-static variable w cannot be referenced from a static context`', '`w`、`h` 属于对象，方法不要写 `static`，用 `r.area()` 调用'],
        ['调用方法忘了括号：`r.area`', '报错 `cannot find symbol: variable area`', '方法调用一定要带圆括号：`r.area()`'],
        ['`calc` 写成 `static void calc(Rect r)`', '`Result out = calc(r);` 报错 `incompatible types`', '要交回一个结果对象，返回类型就写 `Result`'],
        ['`calc` 里忘了 `return`', '报错 `missing return statement`', '最后写 `return new Result(r.area(), r.perimeter());`'],
        ['周长写成 `2 * w + h`', '少了括号，结果不对（那是"两倍宽再加高"）', '周长 = `2 * (w + h)`，括号必须写'],
        ['`main` 里忘了接住返回值就输出', '输出的是占位的 0，或者编译不通过', '先 `Result out = calc(r);`，再输出 `out.area` 与 `out.perimeter`'],
      ]),
      tips:
        '- 方法里的 `w * h` 用的就是"调用这个方法的那个对象"的字段，所以同一个 `area()` 对每个长方形都能算出自己的面积。\n' +
        '- 类里的方法可以调用同类里的其它方法：`r.area()`、`r.perimeter()` 都能在别的类（比如 `Main`）里使用，只要对象是可见的。\n' +
        '- 面积最大是 10000 × 10000 = 100000000，`int`（上限约 21 亿）完全够用。',
      starter:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Rect {\n' +
        '    int w;\n' +
        '    int h;\n' +
        '\n' +
        '    Rect(int w, int h) {\n' +
        '        this.w = w;\n' +
        '        this.h = h;\n' +
        '    }\n' +
        '\n' +
        '    // TODO: 写一个方法 int area()，返回 w * h\n' +
        '    int area() {\n' +
        '        return 0;   // 占位：写完上面的 TODO 就把这一行改成正确的 return\n' +
        '    }\n' +
        '\n' +
        '    // TODO: 写一个方法 int perimeter()，返回 2 * (w + h)\n' +
        '    int perimeter() {\n' +
        '        return 0;   // 占位\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'class Result {\n' +
        '    int area;\n' +
        '    int perimeter;\n' +
        '\n' +
        '    Result(int area, int perimeter) {\n' +
        '        this.area = area;\n' +
        '        this.perimeter = perimeter;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    // TODO: 写一个方法 static Result calc(Rect r)：\n' +
        '    //       用 r.area() 和 r.perimeter() 拿到两个结果，\n' +
        '    //       再 new 一个 Result 对象 return 回去\n' +
        '    static Result calc(Rect r) {\n' +
        '        return new Result(0, 0);   // 占位\n' +
        '    }\n' +
        '\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int w = scanner.nextInt();\n' +
        '        int h = scanner.nextInt();\n' +
        '\n' +
        '        Rect r = new Rect(w, h);\n' +
        '\n' +
        '        // TODO: 调用 calc(r)，用一个 Result 变量接住返回值\n' +
        '        // TODO: 输出 面积：<面积>\n' +
        '        // TODO: 输出 周长：<周长>\n' +
        '    }\n' +
        '}\n',
      solution:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Rect {\n' +
        '    int w;\n' +
        '    int h;\n' +
        '\n' +
        '    Rect(int w, int h) {\n' +
        '        this.w = w;\n' +
        '        this.h = h;\n' +
        '    }\n' +
        '\n' +
        '    int area() {\n' +
        '        return w * h;\n' +
        '    }\n' +
        '\n' +
        '    int perimeter() {\n' +
        '        return 2 * (w + h);\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'class Result {\n' +
        '    int area;\n' +
        '    int perimeter;\n' +
        '\n' +
        '    Result(int area, int perimeter) {\n' +
        '        this.area = area;\n' +
        '        this.perimeter = perimeter;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    static Result calc(Rect r) {\n' +
        '        return new Result(r.area(), r.perimeter());\n' +
        '    }\n' +
        '\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int w = scanner.nextInt();\n' +
        '        int h = scanner.nextInt();\n' +
        '\n' +
        '        Rect r = new Rect(w, h);\n' +
        '        Result out = calc(r);\n' +
        '\n' +
        '        System.out.println("面积：" + out.area);\n' +
        '        System.out.println("周长：" + out.perimeter);\n' +
        '    }\n' +
        '}\n',
      tests: [
        { input: '3 4\n', expected: '面积：12\n周长：14\n' },
        { input: '1 1\n', expected: '面积：1\n周长：4\n' },
        { input: '5 5\n', expected: '面积：25\n周长：20\n' },
        { input: '10000 10000\n', expected: '面积：100000000\n周长：40000\n' },
      ],
      hints: [
        '`area()` 的方法体只有一行：`return w * h;`；`perimeter()` 是 `return 2 * (w + h);`。',
        '`calc` 的写法：`static Result calc(Rect r) { return new Result(r.area(), r.perimeter()); }`。',
        '`main` 里先 `Result out = calc(r);`，再输出 `out.area` 和 `out.perimeter`。',
        '两个方法都不要写 `static`：它们要用"这个对象自己的字段"，必须由对象来调用。',
      ],
    }),

    lesson({
      id: 'j6-4',
      title: '按成绩排名',
      difficulty: '中等',
      knowledge: '对象数组排序',
      story:
        '老师要按成绩从高到低念名字，这就是**排序**。\n\n' +
        '对象数组的排序和数字数组一样，只不过比较的不是数组元素本身，而是**对象里的某个字段**；' +
        '交换的时候，也要把整个对象一起搬走。',
      task:
        '读入 `n` 个学生的姓名和成绩，按成绩**从高到低**输出；成绩相同时，按**姓名字典序从小到大**输出。',
      lesson: `**为什么对象没法直接比大小？**

两个 \`Student\` 对象之间写 \`<\` 编译器会直接报错——它不知道你想按姓名还是按成绩比。
所以我们要**自己把比较规则写出来**。

**手写冒泡排序：把"比数字"换成"比成绩"**

冒泡排序的思路（阶段四排数组时见过）是：每一轮把相邻两位比一比，**顺序不对就交换**，
一轮下来该在最前面的那位就"冒"到了最前面。对象数组和数字数组只有两处不同：

\`\`\`java
for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - 1 - i; j++) {
        // ① 比较：比的不是 students[j] 和 students[j + 1]，而是它们的成绩
        boolean needSwap;
        if (students[j].score < students[j + 1].score) {
            needSwap = true;                       // 后面那位分数更高，该换到前面来
        } else if (students[j].score == students[j + 1].score
                && students[j].name.compareTo(students[j + 1].name) > 0) {
            needSwap = true;                       // 分数一样，但前面的名字字典序更大
        } else {
            needSwap = false;
        }

        // ② 交换：把整个学生对象一起搬，不能只搬成绩
        if (needSwap) {
            Student tmp = students[j];
            students[j] = students[j + 1];
            students[j + 1] = tmp;
        }
    }
}
\`\`\`

**第 ② 步"整体交换"是对象数组排序的关键。** \`Student tmp = students[j];\` 一句话就把这位同学的
姓名和成绩一起搬进了临时变量，然后三步换位，和交换两个整数一模一样，只是格子里装的东西从数字
变成了整个对象。要是只写 \`students[j].score = students[j + 1].score;\`，成绩换过去了、姓名还留在原地，
名单立刻乱掉。

**为什么要有第二个条件？** 题目要求"成绩相同时按姓名字典序从小到大"。分数相等时第一个 \`if\` 不成立，
就要继续比姓名：

${pointsTable([
  ['`x.compareTo(y)`', '比较两个字符串的**字典序**：负数表示 x 排在 y 前面，0 表示一样，正数表示 x 排在 y 后面。所以 `> 0` 读作"x 排在 y 后面"'],
  ['比较用严格不等式', '分数从高到低要用 `<`（前面比后面小就换）。写成 `<=` 会把分数相同的两位也换来换去，并列名次就乱了'],
  ['比较规则要"分得出先后"', '分数一样时必须再比姓名，任何两位都能定出先后，排序结果才唯一（判题才稳定）'],
  ['交换整个对象', '`Student tmp = students[j];` 三步换位，姓名和成绩永远待在一起'],
  ['内层写 `j < n - 1 - i`', '循环体里要用到 `students[j + 1]`，所以 j 最多只能到 `n - 2`'],
  ['外层写 `i < n - 1`', 'n 个人最多只需要 n - 1 轮；n = 1 时循环一次都不执行，也不用特判'],
])}

**另一种写法：\`Arrays.sort\` + 匿名内部类**

Java 标准库里也有现成的排序工具 \`Arrays.sort\`，它需要一个"裁判"来告诉它谁排前面。
裁判可以写成 \`Comparator\` 的**匿名内部类**：

\`\`\`java
import java.util.Arrays;
import java.util.Comparator;

Arrays.sort(students, new Comparator<Student>() {
    public int compare(Student x, Student y) {
        if (x.score != y.score) {
            return y.score - x.score;      // 结果是负数 → x 排前面。注意是"大的减小的"（从高到低）
        }
        return x.name.compareTo(y.name);   // 分数相同，姓名小的排前面
    }
});
\`\`\`

\`compare(x, y)\` 返回**负数**表示"x 应该排在 y 前面"，返回正数表示"x 排后面"，返回 0 表示一样。

> 提醒：这里**不能用 lambda 简写**（\`(x, y) -> ...\`）。浏览器里的 Java 8 运行时（Doppio）
> 不支持 lambda，写了会运行失败。**手写冒泡排序最稳、也最能看清排序的过程**，本题推荐用它。`,
      inputFormat:
        '- 第一行一个整数 `n`（`1 ≤ n ≤ 10`），表示学生人数。\n' +
        '- 接下来 `n` 行，每行一个姓名和一个整数成绩（`0 ≤ 成绩 ≤ 100`），中间用一个空格分隔。\n\n' +
        '姓名只由英文字母组成（首字母大写、其余小写），长度不超过 20。',
      outputFormat:
        '输出 `n` 行，每行是 `<姓名> <成绩>`（中间一个空格），按成绩从高到低排列；' +
        '成绩相同时姓名字典序小的在前。',
      mistakes: mistakesTable([
        ['想直接比对象：`if (students[j] < students[j + 1])`', "报错 `bad operand types for binary operator '<'`", '比字段：`students[j].score < students[j + 1].score`'],
        ['比较写成 `<=`', '分数相同的两位也被反复交换，并列名次的顺序乱掉，判题会不通过', '严格比较用 `<`；并列的情况另外用 `==` 判断姓名'],
        ['交换时只换成绩：`students[j].score = students[j + 1].score;`', '姓名和成绩错位，名单全乱（还会丢掉原来的数据）', '用临时变量整体交换：`Student tmp = students[j]; students[j] = students[j + 1]; students[j + 1] = tmp;`'],
        ['姓名用 `==` 比较', '比的是"是不是同一个字符串对象"，结果不可靠', '比内容用 `equals`，比字典序用 `compareTo`'],
        ['内层写 `j < n`', '`students[j + 1]` 越界：`ArrayIndexOutOfBoundsException`', '内层写 `j < n - 1 - i`'],
        ['并列时只比成绩、不比姓名', '成绩相同的同学谁在前由输入顺序决定，判题结果不稳定', '分数相同时再比姓名：`name.compareTo(...) > 0` 才交换'],
      ]),
      tips:
        '- 先想清楚"什么叫顺序不对"：**成绩更小的应该排在后面**，所以前面分数更小就要交换。\n' +
        '- 排完之后从头到尾打印一遍就行：`System.out.println(students[i].name + " " + students[i].score);`。\n' +
        '- 输出格式是"姓名 空格 成绩"，两个输出之间不要漏了那个空格。',
      starter:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Student[] students = new Student[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            int score = scanner.nextInt();\n' +
        '            students[i] = new Student(name, score);\n' +
        '        }\n' +
        '\n' +
        '        // TODO: 用冒泡排序把 students 按成绩从高到低排好\n' +
        '        //       成绩相同时，姓名字典序小的排前面（用 name.compareTo(...) 比）\n' +
        '        //       交换时要用临时变量把整个学生对象一起搬\n' +
        '\n' +
        '        // TODO: 按顺序输出 n 行，每行是 "姓名 成绩"\n' +
        '    }\n' +
        '}\n',
      solution:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Student[] students = new Student[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            int score = scanner.nextInt();\n' +
        '            students[i] = new Student(name, score);\n' +
        '        }\n' +
        '\n' +
        '        for (int i = 0; i < n - 1; i++) {\n' +
        '            for (int j = 0; j < n - 1 - i; j++) {\n' +
        '                boolean needSwap;\n' +
        '                if (students[j].score < students[j + 1].score) {\n' +
        '                    needSwap = true;\n' +
        '                } else if (students[j].score == students[j + 1].score\n' +
        '                        && students[j].name.compareTo(students[j + 1].name) > 0) {\n' +
        '                    needSwap = true;\n' +
        '                } else {\n' +
        '                    needSwap = false;\n' +
        '                }\n' +
        '\n' +
        '                if (needSwap) {\n' +
        '                    Student tmp = students[j];\n' +
        '                    students[j] = students[j + 1];\n' +
        '                    students[j + 1] = tmp;\n' +
        '                }\n' +
        '            }\n' +
        '        }\n' +
        '\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            System.out.println(students[i].name + " " + students[i].score);\n' +
        '        }\n' +
        '    }\n' +
        '}\n',
      tests: [
        {
          input: '5\nTom 90\nJerry 95\nLucy 88\nAmy 95\nBob 60\n',
          expected: 'Amy 95\nJerry 95\nTom 90\nLucy 88\nBob 60\n',
        },
        { input: '1\nSolo 77\n', expected: 'Solo 77\n' },
        {
          input: '4\nDavid 80\nAnna 80\nCindy 80\nBob 80\n',
          expected: 'Anna 80\nBob 80\nCindy 80\nDavid 80\n',
        },
        { input: '3\nZoe 0\nAnn 100\nMike 0\n', expected: 'Ann 100\nMike 0\nZoe 0\n' },
      ],
      hints: [
        '两层循环的框架和排数字数组一样：外层 `i < n - 1`，内层 `j < n - 1 - i`。',
        '判断要不要交换：先比成绩 `students[j].score < students[j + 1].score`；成绩相同再比姓名 `students[j].name.compareTo(students[j + 1].name) > 0`。',
        '交换时一定要用临时变量把整个对象搬走：`Student tmp = students[j];` 然后三步换位。',
        '输出用 `students[i].name + " " + students[i].score`，中间的引号里有一个空格。',
      ],
    }),

    lesson({
      id: 'j6-5',
      title: '通讯录查找',
      difficulty: '简单',
      knowledge: '对象数组查找',
      story:
        '手机通讯录里存着很多联系人，每个联系人有姓名和电话两项信息——这正好是一个类：\n\n' +
        '```java\nclass Person {\n    String name;   // 姓名\n    String phone;  // 电话\n}\n```\n\n' +
        '电话为什么用 `String` 而不是整数？因为号码开头的 `0` 是有意义的（比如 `007700`），' +
        '当成整数存，前面的 `0` 就丢了。',
      task:
        '读入 `n` 个人的姓名和电话，再读入一个要查找的姓名，输出这个人的信息；' +
        '如果通讯录里没有这个人，就输出 `Not Found`。',
      lesson: `**查找 = 拿着目标，一栏一栏地比对**

通讯录里存着一叠人，想找谁就从头一个一个对姓名。要比的是"文字"，所以这一关的主角是**字符串比较**：

\`\`\`java
String target = scanner.next();          // 要查找的姓名

int pos = -1;                            // -1 表示"还没找到"
for (int i = 0; i < n; i++) {
    if (people[i].name.equals(target)) { // 比内容，必须用 equals
        pos = i;                         // 记下是第几位
        break;                           // 找到了就提前收工
    }
}
\`\`\`

**字符串比较必须用 \`equals\`，不能用 \`==\`——这是本关最容易踩的坑。**

${pointsTable([
  ['`a.equals(b)`', '比较两个字符串的**内容**是不是一样，正是我们要的"这两个名字相同吗"'],
  ['`a == b`', '比较的是"是不是同一个字符串对象"。名字是从输入读进来的，内容相同的两个名字也是两个不同的对象，所以 `==` 永远得到 `false`'],
  ['`pos` 初值写 `-1`', '合法下标是 0 ~ n-1，`-1` 谁都不等于，正好表示"还没找到"'],
  ['找到就 `break;`', '提前跳出循环，保留**第一个**匹配的人；不 `break` 的话后面同名的人会覆盖 `pos`'],
  ['用 `pos` 取数据', '循环结束后只看 `pos`：还是 `-1` 就是没找到；否则用 `people[pos].name`、`people[pos].phone` 取那一条'],
  ['找不到时不能乱取元素', '`people[-1]` 会越界；`people[0]` 是第一个人的信息，都不是"没找到"'],
])}

循环结束后统一决定输出什么，结构最清楚：

\`\`\`java
if (pos == -1) {
    System.out.println("Not Found");
} else {
    System.out.println("姓名：" + people[pos].name);
    System.out.println("电话：" + people[pos].phone);
}
\`\`\`

**为什么电话要用 \`String\` 存？** 一是短号开头的 \`0\` 有意义（\`007700\` 存成整数就变成 \`7700\`），
二是手机号有 11 位，早就超出 \`int\` 的范围了。用 \`String\` 存，读进来是什么样，输出就是什么样。`,
      inputFormat:
        '- 第一行一个整数 `n`（`1 ≤ n ≤ 10`），表示通讯录里的人数。\n' +
        '- 接下来 `n` 行，每行一个姓名和一个电话，中间用一个空格分隔。两者都不含空格。\n' +
        '- 最后一行一个字符串，表示要查找的姓名。',
      outputFormat:
        '找到了就输出两行：\n\n```\n姓名：<姓名>\n电话：<电话>\n```\n\n' +
        '没找到则输出一行 `Not Found`。',
      mistakes: mistakesTable([
        ['`if (people[i].name == target)`', '编译能过，但比的是"是不是同一个字符串对象"，永远不相等，结果永远输出 `Not Found`', '比内容必须用 `people[i].name.equals(target)`'],
        ['`if (...);` 后面多写了一个分号', '`if` 变成空语句，不管找没找到都会执行下一句', '去掉 `if (...)` 后面那个多余的分号'],
        ['找到了忘了 `break;`', '继续往下找，如果后面还有同名的人，`pos` 会被后一个覆盖', '找到就 `break;`，保留第一个匹配的人'],
        ['`int pos;` 没有赋初值', '编译报错 `variable pos might not have been initialized`', '先写 `int pos = -1;`'],
        ['没找到也照样输出 `people[pos]`', '`pos` 是 `-1` 时越界：`ArrayIndexOutOfBoundsException`', '先判断 `pos == -1`，只在 `else` 分支里取 `people[pos]`'],
        ['电话用 `int` 存', '`007700` 输出成 `7700`，前导的 0 丢了', '电话用 `String phone` 存'],
      ]),
      tips:
        '- 姓名从 `scanner.next()` 读进来的是**字符串**，所以比较要用 `equals`。\n' +
        '- 也可以直接判断"找到了就输出并结束"，但用 `pos` 作标记、循环外统一输出，结构更容易看懂。\n' +
        '- `Not Found` 是英文、首字母大写、中间一个空格，要和题面完全一致。',
      starter:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Person {\n' +
        '    String name;\n' +
        '    String phone;\n' +
        '\n' +
        '    Person(String name, String phone) {\n' +
        '        this.name = name;\n' +
        '        this.phone = phone;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Person[] people = new Person[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            String phone = scanner.next();\n' +
        '            people[i] = new Person(name, phone);\n' +
        '        }\n' +
        '\n' +
        '        String target = scanner.next();\n' +
        '\n' +
        '        // TODO: 用 int pos = -1; 记下找到的位置，循环里用 people[i].name.equals(target) 比较\n' +
        '        // TODO: 找到了就输出 姓名：<姓名> 和 电话：<电话> 两行\n' +
        '        // TODO: pos 还是 -1 就输出 Not Found\n' +
        '    }\n' +
        '}\n',
      solution:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Person {\n' +
        '    String name;\n' +
        '    String phone;\n' +
        '\n' +
        '    Person(String name, String phone) {\n' +
        '        this.name = name;\n' +
        '        this.phone = phone;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Person[] people = new Person[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            String phone = scanner.next();\n' +
        '            people[i] = new Person(name, phone);\n' +
        '        }\n' +
        '\n' +
        '        String target = scanner.next();\n' +
        '\n' +
        '        int pos = -1;\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            if (people[i].name.equals(target)) {\n' +
        '                pos = i;\n' +
        '                break;\n' +
        '            }\n' +
        '        }\n' +
        '\n' +
        '        if (pos == -1) {\n' +
        '            System.out.println("Not Found");\n' +
        '        } else {\n' +
        '            System.out.println("姓名：" + people[pos].name);\n' +
        '            System.out.println("电话：" + people[pos].phone);\n' +
        '        }\n' +
        '    }\n' +
        '}\n',
      tests: [
        {
          input: '3\nTom 13800001111\nJerry 13900002222\nLucy 13700003333\nJerry\n',
          expected: '姓名：Jerry\n电话：13900002222\n',
        },
        { input: '1\nZoe 555\nZoe\n', expected: '姓名：Zoe\n电话：555\n' },
        { input: '2\nA 111\nB 222\nC\n', expected: 'Not Found\n' },
        { input: '2\nAnn 007700\nBen 10010\nAnn\n', expected: '姓名：Ann\n电话：007700\n' },
      ],
      hints: [
        '先写 `int pos = -1;`，循环里用 `people[i].name.equals(target)` 判断姓名是否相同。',
        '找到之后把下标存进 `pos` 并 `break;`，循环结束后再统一判断输出。',
        '输出用 `pos` 取那一条：`people[pos].name`、`people[pos].phone`。',
        '字符串比较用 `equals`，不能用 `==`；没找到时输出 `Not Found`。',
      ],
    }),

    lesson({
      id: 'j6-6',
      title: '成绩统计报告',
      difficulty: '中等',
      knowledge: '最值与平均分',
      story:
        '学期末老师要写一份成绩统计报告，里面要有三样东西：\n\n' +
        '- 最高分是多少，是谁考的；\n' +
        '- 最低分是多少，是谁考的；\n' +
        '- 全班平均分是多少。\n\n' +
        '分数和姓名必须对得上号——这就是这一题最需要注意的地方。',
      task:
        '读入 `n` 个学生的姓名和成绩，输出一份成绩统计报告。\n\n' +
        '并列规则：如果有多位同学并列最高分，输出姓名**字典序最小**的那位；最低分同理。',
      lesson: `**打擂台：赢的当擂主**

找最高分、最低分的思路在阶段四就学过了，叫**打擂台**：先让第 0 位同学当擂主，之后每来一位就比一比，
赢了就换擂主。这一题的关键是——**擂主用"下标"来记，而不是用分数来记**：

\`\`\`java
int mx = 0;                     // mx 记的是"目前最高分是哪一位"，是个下标，不是分数！
int mn = 0;
int total = 0;                  // 总分顺手在同一个循环里累加
for (int i = 0; i < n; i++) {
    total += students[i].score;

    if (students[i].score > students[mx].score ||
        (students[i].score == students[mx].score
            && students[i].name.compareTo(students[mx].name) < 0)) {
        mx = i;                 // 换擂主只是换个下标
    }
    if (students[i].score < students[mn].score ||
        (students[i].score == students[mn].score
            && students[i].name.compareTo(students[mn].name) < 0)) {
        mn = i;
    }
}
\`\`\`

**为什么擂主存下标？** 如果只记住"目前的最高分是 95"，最后你只知道分数，不知道是谁考的。
存下标就没有这个问题：\`students[mx].score\` 和 \`students[mx].name\` 永远是同一位同学的两栏，
分数和姓名绝不会错位。

**并列怎么办？** 题目规定：分数相同时取姓名**字典序最小**的那位。所以"换擂主"要把两种情况都写全：

${pointsTable([
  ['第一种可能：分数更高', '`students[i].score > students[mx].score`——用严格大于，比擂主高才换'],
  ['第二种可能：分数一样但姓名更小', '`students[i].score == students[mx].score && students[i].name.compareTo(students[mx].name) < 0`'],
  ['两种可能用 `||` 连起来', '读作"或者"。`||` 的两边各是一个完整的条件'],
  ['括号千万别丢', '`&&` 的优先级比 `||` 高，不加括号意思就变了：把"分数一样 **并且** 姓名更小"用小括号包成一个整体'],
  ['姓名要用 `compareTo` 比', '`x.compareTo(y) < 0` 表示 x 的字典序更小。字符串不能用 `<` 比，会报 `bad operand types`'],
  ['一趟循环干三件事', '累加总分、判最高、判最低可以写在同一个 `for` 里，不用跑三遍'],
])}

**平均分**照旧：\`1.0 * total / n\`（乘 \`1.0\` 把算式变成小数运算，否则整数除法会丢掉小数部分）。
Java 打印小数时会保留 \`.0\`，所以平均分正好是 77 时要输出 \`77.0\`。

**输出的顺序要仔细：** \`最高分：\` 后面是"**分数 + 一个空格 + 姓名**"，别把两者写反了。`,
      inputFormat:
        '- 第一行一个整数 `n`（`1 ≤ n ≤ 10`），表示学生人数。\n' +
        '- 接下来 `n` 行，每行一个姓名和一个整数成绩（`0 ≤ 成绩 ≤ 100`），中间用一个空格分隔。\n\n' +
        '姓名只由英文字母组成（首字母大写、其余小写），长度不超过 20。',
      outputFormat:
        '输出三行：\n\n```\n最高分：<分数> <姓名>\n最低分：<分数> <姓名>\n平均分：<平均分>\n```\n\n' +
        '最高分、最低分里分数在前、姓名在后，中间一个空格；平均分按 Java 打印小数的默认样子输出（例如 `85.6`、`77.0`）。',
      mistakes: mistakesTable([
        ['用分数当擂主：`int mx = 0;` 然后 `if (students[i].score > mx) mx = students[i].score;`', '最后只剩一个分数，报告里写不出"是谁考的"', '擂主存**下标**：`int mx = 0;`，后面用 `students[mx].score`、`students[mx].name`'],
        ['并列条件漏了括号', '`&&` 优先级比 `||` 高，判断结果完全不对', '把"分数相等 并且 姓名更小"用小括号括成一个整体'],
        ['用 `<` 比姓名：`students[i].name < students[mx].name`', "报错 `bad operand types for binary operator '<'`", '字符串比字典序要用 `compareTo`：`students[i].name.compareTo(students[mx].name) < 0`'],
        ['平均分写 `total / n`', '整数除法丢掉小数部分，`85.6` 会变成 `85`（整数）', '写 `1.0 * total / n`'],
        ['累加变量忘了初始化：`int total;`', '编译报错 `variable total might not have been initialized`', '先写 `int total = 0;`'],
        ['输出把姓名和分数写反了', '与期望输出不一致', '格式是 `最高分：` + 分数 + 空格 + 姓名'],
      ]),
      tips:
        '- 把 `mx`、`mn` 都设成 `0`（"目前最高/最低分的同学是第 0 位"），然后从 `i = 0` 开始逐个比较即可，不用特判 n = 1。\n' +
        '- 判"最低分"时并列条件同样是"姓名更小"：`< 0` 才换擂主，全题都取字典序最小的那位。\n' +
        '- 输出前先在心里对一遍：`students[mx]` 是同一位同学，分数和姓名不会错位。',
      starter:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Student[] students = new Student[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            int score = scanner.nextInt();\n' +
        '            students[i] = new Student(name, score);\n' +
        '        }\n' +
        '\n' +
        '        // TODO: 用下标当擂主：int mx = 0; int mn = 0; 在同一个循环里累加总分 total\n' +
        '        //       换擂主的条件是"分数更高（更低）"；分数相同时取姓名字典序更小的\n' +
        '        //       （用 compareTo 比姓名，并列条件记得加括号）\n' +
        '        // TODO: 输出 最高分：<分数> <姓名>\n' +
        '        // TODO: 输出 最低分：<分数> <姓名>\n' +
        '        // TODO: 输出 平均分：<平均分>（1.0 * total / n）\n' +
        '    }\n' +
        '}\n',
      solution:
        'import java.util.Scanner;\n' +
        '\n' +
        'class Student {\n' +
        '    String name;\n' +
        '    int score;\n' +
        '\n' +
        '    Student(String name, int score) {\n' +
        '        this.name = name;\n' +
        '        this.score = score;\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'public class Main {\n' +
        '    public static void main(String[] args) {\n' +
        '        Scanner scanner = new Scanner(System.in);\n' +
        '        int n = scanner.nextInt();\n' +
        '\n' +
        '        Student[] students = new Student[n];\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            String name = scanner.next();\n' +
        '            int score = scanner.nextInt();\n' +
        '            students[i] = new Student(name, score);\n' +
        '        }\n' +
        '\n' +
        '        int mx = 0;\n' +
        '        int mn = 0;\n' +
        '        int total = 0;\n' +
        '        for (int i = 0; i < n; i++) {\n' +
        '            total += students[i].score;\n' +
        '\n' +
        '            if (students[i].score > students[mx].score\n' +
        '                    || (students[i].score == students[mx].score\n' +
        '                        && students[i].name.compareTo(students[mx].name) < 0)) {\n' +
        '                mx = i;\n' +
        '            }\n' +
        '            if (students[i].score < students[mn].score\n' +
        '                    || (students[i].score == students[mn].score\n' +
        '                        && students[i].name.compareTo(students[mn].name) < 0)) {\n' +
        '                mn = i;\n' +
        '            }\n' +
        '        }\n' +
        '\n' +
        '        System.out.println("最高分：" + students[mx].score + " " + students[mx].name);\n' +
        '        System.out.println("最低分：" + students[mn].score + " " + students[mn].name);\n' +
        '        System.out.println("平均分：" + 1.0 * total / n);\n' +
        '    }\n' +
        '}\n',
      tests: [
        {
          input: '5\nTom 90\nJerry 95\nLucy 88\nAmy 95\nBob 60\n',
          expected: '最高分：95 Amy\n最低分：60 Bob\n平均分：85.6\n',
        },
        { input: '1\nSolo 77\n', expected: '最高分：77 Solo\n最低分：77 Solo\n平均分：77.0\n' },
        {
          input: '3\nA 50\nB 50\nC 50\n',
          expected: '最高分：50 A\n最低分：50 A\n平均分：50.0\n',
        },
        {
          input: '4\nZoe 100\nAnn 100\nMike 0\nBen 0\n',
          expected: '最高分：100 Ann\n最低分：0 Ben\n平均分：50.0\n',
        },
      ],
      hints: [
        '`mx`、`mn` 都从 `0` 开始，表示"目前最高/最低分的同学是第 0 位"，然后在同一趟循环里逐个比较。',
        '并列判定写全：先比分数，分数相同再比姓名，例如 `students[i].score > students[mx].score || (students[i].score == students[mx].score && students[i].name.compareTo(students[mx].name) < 0)`。',
        '擂主是下标，输出时先取下标再取字段：`students[mx].score` 和 `students[mx].name`。',
        '平均分写 `1.0 * total / n`；注意 Java 打印小数会保留 `.0`（平均分正好 77 要输出 `77.0`）。',
      ],
    }),
  ],
};
