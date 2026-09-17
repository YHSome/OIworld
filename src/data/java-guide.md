# 从零开始：写出你的第一个 Java 程序

> 这一页假设你**完全没有写过代码**。读完之后，你就能独立完成 Java 靶场的第一题。
> 内容按本站 7 个阶段、42 道题组织，边看边做即可。

---

## 一、这个网站怎么跑 Java 代码

- 你在这里写的 Java 代码，是在**你自己的浏览器里**编译和运行的（用 Doppio JVM，一个用 JavaScript 实现的 Java 虚拟机）。
- 不需要安装 JDK、不需要联网判题，代码也不会被上传到任何服务器。
- 第一次打开题目页时需要加载约 100MB 的运行环境，页面顶部会有提示；下载后浏览器会缓存，之后就快了。
- **要有耐心**：整个 Java 虚拟机是跑在 JavaScript 里的，**第一次编译可能要等一到两分钟**。点完「运行」或「提交」后请等结果面板出内容，不要反复点击；同一个页面会话里再提交会快一些。

## 一点五、课程地图（学完之后你会什么）

| 阶段 | 主题 | 你会学到 |
| --- | --- | --- |
| 一 | 类与 main | 程序外壳、`System.out.println` 输出、变量、`Scanner` 输入 |
| 二 | 运算符与判断 | 算术 / 关系 / 逻辑运算、`if / else`、`switch` |
| 三 | 循环 | `for`、`while`、嵌套循环、`break` |
| 四 | 数组与字符串 | 数组遍历、最值、`String.length()` / `charAt()` |
| 五 | 方法 | 定义与调用、参数与返回值、递归、方法重载 |
| 六 | 类与对象 | 定义类、字段、构造方法、对象数组、排序 |
| 七 | 集合与哈希表 | `ArrayList`、`HashMap` 计数与查找、按顺序输出 |

每一题都按同一套结构讲解：**题目背景 → 任务 → 本关新知识 → 输入格式 → 输出格式 → 样例 → 常见错误 → 小贴士**。
卡住时先看「本关新知识」，再展开左边的「提示」，通过之后可以看参考题解。

## 二、Java 程序的固定外壳

Java 和别的语言最不一样的地方：**所有代码都必须写在类（class）里面**。本站所有题目的类名固定为 `Main`：

```java
public class Main {
    public static void main(String[] args) {
        // 你的代码写在这里
    }
}
```

| 写法 | 意思 |
| --- | --- |
| `public class Main` | 定义一个公开的类，名字叫 Main。文件名必须是 `Main.java`（本站已经替你准备好了）。 |
| `public static void main(String[] args)` | 程序的**入口**：电脑从 main 方法的第一行开始执行。这一行是固定写法，照抄即可。 |
| `{` 和 `}` | 一对大括号把它们中间的内容包起来：类的身体、方法的身體都靠大括号界定。 |
| `// 注释` | 两个斜杠开头是**注释**，写给人看，电脑完全无视。题目里的 `// TODO` 就是提示你"代码写在这里"。 |

**你要改的只有 `// TODO` 那一行**，外面的外壳不要动。

## 三、让程序说话：System.out.println

```java
System.out.println("Hello, Java!");
```

| 片段 | 意思 |
| --- | --- |
| `System.out` | 标准输出（屏幕）。`System` 首字母大小写必须准确。 |
| `println` | print line：打印一行，并且**自动换行**。 |
| `"Hello, Java!"` | 要原样输出的文字，必须放在**英文双引号**里。 |
| `;` | **每一条语句末尾都要有英文分号**。漏了就会报错。 |

只想打印不换行时用 `System.out.print(...)`。

## 四、变量：给数据起个名字

```java
int age = 18;          // 整数
double price = 9.9;    // 小数
String name = "小明";  // 文字
```

- 用之前要先写**类型**：`int`（整数）、`double`（小数）、`String`（文字，首字母大写）。
- `=` 不是"相等"，而是"**把右边的值装进左边的变量**"。
- 变量名自己起，但只能用字母、数字、下划线，且不能以数字开头。

常见运算：`+ - * / %`，其中 `%` 是取余数（`7 % 2` 等于 1）。

## 五、读入数据：Scanner

```java
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int a = scanner.nextInt();     // 读一个整数
        int b = scanner.nextInt();     // 再读一个整数
        System.out.println(a + b);
    }
}
```

| 要点 | 说明 |
| --- | --- |
| 第一行 `import java.util.Scanner;` | 使用 Scanner 必须先在文件最上面 import 它。 |
| `new Scanner(System.in)` | 准备一个"从键盘读数据"的工具，惯例起名叫 `scanner`。 |
| `scanner.nextInt()` | 读入下一个整数。读几个就写几次。 |
| 分隔符 | 输入里的空格、回车都会被自动跳过，`3 5` 与两行 `3`、`5` 效果一样。 |

## 六、让程序分岔：if / else

```java
if (n % 2 == 0) {
    System.out.println("even");
} else {
    System.out.println("odd");
}
```

- 条件必须放在**圆括号**里，代码块必须放在**大括号**里。
- 判断相等用**两个等号** `==`；一个等号 `=` 是赋值，写错会出问题。
- 比较运算符：`>` `<` `>=` `<=` `==` `!=`；连接条件用 `&&`（并且）、`||`（或者）、`!`（取反）。

## 七、让程序重复：for 循环

```java
int sum = 0;
for (int i = 1; i <= n; i++) {
    sum += i;      // 等价于 sum = sum + i;
}
System.out.println(sum);
```

`for` 的圆括号里有三段，用**英文分号**隔开：

| 段 | 例子 | 作用 |
| --- | --- | --- |
| ① 初始化 | `int i = 1` | 循环开始时执行一次：i 从 1 开始。 |
| ② 条件 | `i <= n` | 每轮开始前检查；不成立就结束循环。 |
| ③ 步进 | `i++` | 每轮结束后执行：i 加 1。 |

执行顺序：① → ② → 循环体 → ③ → ② → 循环体 → ③ …… 直到 ② 不成立。
**累加变量一定要先设初值**（`int sum = 0;`），否则结果不对。

## 八、Java 与 C++ 的写法对照

如果你之前看过本站的 C++ 靶场，这张表能帮你快速切换：

| 想做的事 | C++ | Java |
| --- | --- | --- |
| 输出一行 | `cout << "hi" << endl;` | `System.out.println("hi");` |
| 读入整数 | `cin >> n;` | `Scanner s = new Scanner(System.in); int n = s.nextInt();` |
| 文字类型 | `string` | `String`（首字母大写） |
| 程序外壳 | `int main() { ... }` | `public class Main { public static void main(String[] args) { ... } }` |

## 九、新手最大的坑

1. **中文标点**：Java 只认英文半角符号。中文的 `；`、`，`、`（`、`“ ”` 看起来像，但编译器不认识。
   写代码时把输入法切到英文（Shift 或 Ctrl+空格）。
2. **大小写**：Java 严格区分大小写。`System`、`String`、`Scanner`、`Main` 的首字母都必须大写；
   `println` 里的 `l` 是字母 L，不是数字 1。
3. **分号**：每条语句末尾都要有 `;`；但 `public class Main {` 和 `if (...) {` 这种以 `{` 结尾的行**不加**分号。
4. **大括号成对**：类一对、main 方法一对、if / for 各一对。报错 `reached end of file while parsing` 通常就是少了一个 `}`。

## 十、报错对照表

编译失败时，右侧结果面板会先给出**中文自查提示**，再看编译器的原文。常见几类：

| 报错（英文） | 中文含义 | 怎么办 |
| --- | --- | --- |
| `';' expected` | 缺分号 | 报错行的**上一行**末尾补英文分号 |
| `cannot find symbol ... class Scanner` | 不认识 Scanner | 文件最上面写 `import java.util.Scanner;` |
| `cannot find symbol ... variable x` | 不认识变量 x | 拼写错误、大小写不一致，或者没有先声明 |
| `reached end of file while parsing` | 少了一个 `}` | 数一数 `{` 和 `}` 是否一样多 |
| `incompatible types` | 类型对不上 | 小数用 `double`、整数用 `int`，不要混用 |
| `Exception in thread "main" ...` | 运行时异常 | 看第一个 `Main.java:行号`，那一行就是出问题的地方 |
| `InputMismatchException` | 输入数据与 `nextInt()` 对不上 | 检查"标准输入"框里的数据是不是数字、够不够用 |

**经验**：从第一条错误开始改，改一次就重新运行；后面的报错常常只是第一条引起的连锁反应。

## 十一、小词典

| 单词 | 含义 |
| --- | --- |
| `class` | 类：Java 代码的容器，本站固定叫 `Main` |
| `main` | 主方法，程序的入口，固定写法 |
| `static` | 静态：不用创建对象就能使用（现在照抄即可） |
| `void` | 表示"不返回任何值" |
| `String` | 文字类型（首字母大写） |
| `int` / `double` | 整数 / 小数 |
| `System.out.println` | 打印一行 |
| `Scanner` | 读取键盘输入的工具 |
| `import` | 引入别人写好的类（比如 `java.util.Scanner`） |
| `error` / `warning` | 错误（必须改）/ 警告（可以先不管） |

---

准备好了吗？回到 [Java 靶场](/java)，从第一题「你好，Java」开始。
