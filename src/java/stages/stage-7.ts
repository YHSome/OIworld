/**
 * 阶段七 · 集合与哈希表：HashMap 与 TreeMap（6 道题）
 *
 * 这是 Java 靶场的最后一个阶段，对应 C++ 靶场的「键值映射（map / unordered_map）」：
 * 学会用 HashMap 数次数、查表、记录首次出现顺序，并知道"遍历顺序不确定"这件事该怎么绕。
 */

import type { StageData } from '../../types/problem';
import { lesson, mainOnly, mistakesTable, pointsTable } from '../lesson.ts';

export const STAGE_7: StageData = {
  stage: 7,
  title: '阶段七 · 集合与哈希表',
  subtitle: 'HashMap 与 TreeMap',
  summary:
    '最后一块拼图：**映射**。当程序需要"按某个东西找另一个东西"（数字 → 出现次数、姓名 → 成绩）时，' +
    '数组就不够用了，这时请出 `HashMap`——一本会自动整理的字典，报出一个**键**，立刻查到对应的**值**。\n\n' +
    '本阶段学会用 `map.put(k, map.getOrDefault(k, 0) + 1)` 数次数、用 `containsKey` / `get` 查表、' +
    '用 `for (Map.Entry<K, V> entry : map.entrySet())` 遍历；需要确定顺序时，用 `TreeMap`、' +
    '用 `ArrayList` + `Collections.sort(...)`，或者干脆按输入顺序把键记下来。\n\n' +
    '学完这 6 题，Java 靶场的 42 道题就全部走完了——计数、查表、找第一个唯一字符、两数之和、最高频元素，' +
    '这些正是哈希表最经典的用法。',
  problems: [
    lesson({
      id: 'j7-1',
      title: '数字出现次数',
      difficulty: '入门',
      knowledge: 'HashMap 计数',
      story:
        '前面我们用数组存数据，靠**下标**来点名：`a[0]`、`a[1]`……下标只能是 0、1、2 这样连续的小整数。\n\n' +
        '但本题要问的是"数字 3 出现了几次"、"数字 -10000 出现了几次"。数字可能是负数，也可能稀疏地散在很大的范围里，用下标根本对不上号。\n\n' +
        '这时候需要**映射**：用一个东西去对应另一个东西。最好懂的类比是**字典**——你报出一个**键**（查找用的名字），它立刻告诉你对应的**值**。Java 里最常用的字典叫 `HashMap`。',
      task: '读入 n 个整数，统计每个数字出现了多少次，然后**按数字从小到大的顺序**输出每个数字和它的次数。',
      lesson: `先认识"字典"这个东西。

前面几题我们靠**下标**找数据：\`a[0]\`、\`a[1]\`……下标只能是 0、1、2 这样连续的小整数。可本题要问的是"数字 \`-10000\` 出现了几次"——数字动辄成千上万，还可能全是负数，用下标根本对不上号。

这时该请出**映射**（mapping）：用一个东西去对应另一个东西。最好懂的类比是**字典**：你报出一个词（**键**，key），字典立刻告诉你它的意思（**值**，value）。字典里的一对"键 + 值"叫**键值对**。Java 里最常用的字典叫 \`HashMap\`。

**第一步：把字典建出来**

\`\`\`java
import java.util.HashMap;          // 用 HashMap 必须在文件最上方 import 它

HashMap<Integer, Integer> cnt = new HashMap<Integer, Integer>();
//      ↑ 键的类型   ↑ 值的类型
\`\`\`

逐个部分读一遍：

- 第一个 \`Integer\` 是**键**的类型：本题的键是"数字"；
- 第二个 \`Integer\` 是**值**的类型：本题的值是"出现次数"；
- 变量名 \`cnt\` 是 count 的缩写。你叫 \`numCount\`、\`times\` 都行。

注意：尖括号里**必须写包装类** \`Integer\`，写成 \`HashMap<int, int>\` 会报错 \`unexpected type\`。原因是 Java 的集合只能装"对象"，\`int\` 这种基本类型要先"装箱"成 \`Integer\`（\`char\` 对应 \`Character\`，而 \`String\` 本身就是对象，可以直接当键用）。

**第二步：计数——只要记住一句话**

\`\`\`java
cnt.put(x, cnt.getOrDefault(x, 0) + 1);
\`\`\`

从里往外读：

1. \`cnt.getOrDefault(x, 0)\`：**"查一下字典里 \`x\` 的次数；如果还没有 \`x\`，就当它是 0"**；
2. \`+ 1\`：加一；
3. \`cnt.put(x, 值)\`：把这个值存进字典——键 \`x\` 不在就新建，在就覆盖。

所以整句话读作：**"查出 \`x\` 现在的次数（没有就算 0），加一，再存回去。"**

**为什么不能写 \`cnt.get(x) + 1\`？** 因为 \`get\` 遇到**不存在的键会返回 \`null\`**（表示"没有"），而 \`null + 1\` 会在运行时抛 \`NullPointerException\`。第一次遇到某个数字时它必然不在字典里，程序立刻就崩了——这是本题的头号坑。\`getOrDefault\` 就是为这种情况准备的：查不到时给你一个"默认值"。

**第三步：怎么把结果按顺序倒出来**

统计完以后要按数字从小到大输出，这里有一条**必须记住的规矩**：

> \`HashMap\` 的遍历顺序是**不确定**的。它按"哈希值"摆放键，既不是从小到大，也不是插入顺序，同一份数据每次运行都可能不一样。

所以**绝对不能**直接写 \`for (Map.Entry<...> entry : cnt.entrySet())\` 来输出结果。要确定的顺序，有三条路：

| 办法 | 写法 | 适合 |
| --- | --- | --- |
| 把键抄进列表再排序 | \`ArrayList<Integer> keys = new ArrayList<Integer>(cnt.keySet()); Collections.sort(keys);\` | 任何顺序要求都能自己定 |
| 换成 \`TreeMap\` | \`TreeMap<Integer, Integer> sorted = new TreeMap<Integer, Integer>(cnt);\` | 只要"按键从小到大"，一句搞定 |
| 记下出现顺序 | 用 \`ArrayList<String> order\` 记住先来后到 | 题目要求"按第一次出现的顺序"（下一题） |

本题用第一条路：先把所有键抄成一个列表，再排序，最后按顺序取值输出。

\`\`\`java
ArrayList<Integer> keys = new ArrayList<Integer>(cnt.keySet());   // 把所有键抄成列表
Collections.sort(keys);                                           // 升序排序

for (int i = 0; i < keys.size(); i++) {
    int num = keys.get(i);
    System.out.println(num + " " + cnt.get(num));                 // 键 + 空格 + 值
}
\`\`\`

\`cnt.keySet()\` 是"**所有键的集合**"，交给 \`new ArrayList<Integer>(...)\` 就抄成了一份**可以排序的列表**；\`Collections.sort(keys)\` 把它按升序排好。工具类叫 \`Collections\`，**末尾有个 s**，别写成 \`Collection\`。

顺便认识遍历字典的标准写法（本阶段后面会用到；本题要配合 \`TreeMap\` 才是正确顺序）：

\`\`\`java
for (Map.Entry<Integer, Integer> entry : cnt.entrySet()) {   // entry 依次代表每一个键值对
    System.out.println(entry.getKey() + " " + entry.getValue());
}
\`\`\`

\`entry.getKey()\` 是键、\`entry.getValue()\` 是值；这种 for 叫 for-each，读作"对 \`cnt.entrySet()\` 里的每一个 \`entry\`"。**注意用这种写法，不要用 lambda 或 \`forEach\`。**

${pointsTable([
  ['`HashMap<K, V>`', '字典：`K` 是键的类型，`V` 是值的类型。本题是 `HashMap<Integer, Integer>`'],
  ['键必须写包装类', '尖括号里写 `Integer` / `Character` / `String`，不能写 `int` / `char`'],
  ['`map.put(k, v)`', '存一条"键 → 值"；键已存在时**覆盖**旧值'],
  ['`map.get(k)`', '按键取值；**键不存在时返回 `null`**'],
  ['`map.containsKey(k)`', '返回 `true` / `false`，问"有没有这个键"，**只看不改**'],
  ['`map.getOrDefault(k, 0)`', '按键取值；键不存在时返回默认值 `0`——计数的关键'],
  ['`map.size()`', '字典里一共有多少个键值对'],
  ['`map.keySet()`', '所有键的集合，可以抄进 `ArrayList` 再排序'],
  ['遍历顺序不确定', '`HashMap` 的顺序既不是大小序也不是插入序；要顺序输出必须自己排序或用 `TreeMap`'],
])}`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 20`），表示数字的个数。\n' +
        '第二行 `n` 个整数（`-10000 ≤ 数字 ≤ 10000`），用空格分隔。',
      outputFormat:
        '每个出现过的数字输出一行，格式为 `数字 次数`（中间一个空格），按数字**从小到大**排列；每个数字只输出一次。',
      mistakes: mistakesTable([
        ['`HashMap<int, int> cnt = ...;`', '报错 `unexpected type`', '尖括号里写包装类：`HashMap<Integer, Integer>`'],
        ['`cnt.put(x, cnt.get(x) + 1);`', '第一次遇到 x 时抛 `NullPointerException`（`get` 返回 `null`）', '`cnt.put(x, cnt.getOrDefault(x, 0) + 1);`'],
        ['忘了 `import java.util.HashMap;`', '报错 `cannot find symbol: class HashMap`', '文件最上方补上；用到 `ArrayList`、`Collections` 也要各自 import'],
        ['直接 `for (Map.Entry<Integer, Integer> e : cnt.entrySet())` 输出', '`HashMap` 遍历顺序不确定，输出顺序可能时对时错', '先把键抄进 `ArrayList` 再 `Collections.sort`，或改用 `TreeMap`'],
        ['把键和值写反：`cnt.put(1, x)`', '字典变成"次数 → 数字"，输出完全不对', '`put(键, 值)` 的第一个参数是数字，第二个是次数'],
      ]),
      tips:
        '- 计数只有一句话：`cnt.put(x, cnt.getOrDefault(x, 0) + 1);`——查出次数（没有就当 0）、加一、存回去。\n' +
        '- 想亲眼看看"顺序不确定"是怎么回事，可以把 `HashMap` 换成 `TreeMap` 再运行一次，输出就自动升序了。\n' +
        '- 输出格式是"数字 + 一个空格 + 次数"，别漏掉中间的空格。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<Integer, Integer> cnt = new HashMap<Integer, Integer>();
        for (int i = 0; i < n; i++) {
            int x = scanner.nextInt();
            // TODO: 把 x 的出现次数加 1
        }

        // TODO: 按数字从小到大输出每个数字和它的次数，格式为 "数字 次数"`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<Integer, Integer> cnt = new HashMap<Integer, Integer>();
        for (int i = 0; i < n; i++) {
            int x = scanner.nextInt();
            cnt.put(x, cnt.getOrDefault(x, 0) + 1);
        }

        ArrayList<Integer> keys = new ArrayList<Integer>(cnt.keySet());
        Collections.sort(keys);

        for (int i = 0; i < keys.size(); i++) {
            int num = keys.get(i);
            System.out.println(num + " " + cnt.get(num));
        }`,
        {
          imports:
            'import java.util.ArrayList;\nimport java.util.Collections;\nimport java.util.HashMap;\nimport java.util.Scanner;',
        },
      ),
      tests: [
        { input: '7\n3 1 3 2 3 1 5\n', expected: '1 2\n2 1\n3 3\n5 1\n' },
        { input: '1\n-5\n', expected: '-5 1\n' },
        { input: '4\n7 7 7 7\n', expected: '7 4\n' },
        { input: '5\n-2 0 -2 3 0\n', expected: '-2 2\n0 2\n3 1\n' },
      ],
      hints: [
        '先把每个数读进来，用 `cnt.put(x, cnt.getOrDefault(x, 0) + 1);` 计数。',
        '输出前要先排好序：`ArrayList<Integer> keys = new ArrayList<Integer>(cnt.keySet()); Collections.sort(keys);`。',
        '也可以改用 `TreeMap<Integer, Integer> sorted = new TreeMap<Integer, Integer>(cnt);`，它天然按键升序。',
      ],
    }),

    lesson({
      id: 'j7-2',
      title: '单词计数',
      difficulty: '简单',
      knowledge: '单词计数与顺序',
      story:
        '这一题和上一题几乎一样，只换了一样东西：**键的类型**。上一题的键是数字，本题的键是**单词**（`String`）。\n\n' +
        '不过题目还有个额外要求：按每个单词**第一次出现的顺序**输出。\n\n' +
        '麻烦在于 `HashMap` 的遍历顺序是不确定的——既不是字母序也不是插入序。所以"顺序"这件事，得我们自己另外记下来。',
      task: '读入 n 个单词，统计每个单词出现了多少次，然后按每个单词**第一次出现的顺序**输出单词和它的次数。',
      lesson: `**键换成单词，其余一模一样。**

上一题的键是 \`Integer\`，本题的键是 \`String\`：

\`\`\`java
import java.util.HashMap;

HashMap<String, Integer> cnt = new HashMap<String, Integer>();
//      ↑ 键：单词              ↑ 值：次数
\`\`\`

读单词用 \`scanner.next()\`（它会自动跳过一个或多个空格、换行，正好读到一个单词），计数还是那句话：

\`\`\`java
String word = scanner.next();
cnt.put(word, cnt.getOrDefault(word, 0) + 1);   // 有就加一，没有就从 0 加起
\`\`\`

**难的是"按第一次出现的顺序输出"。** 上一题说过：\`HashMap\` 的遍历顺序不确定，既不是字母序也不是插入顺序。而本题目要的恰恰是"先来后到"，所以顺序**必须自己记**。

办法很土但很稳：**另开一个列表当记事本，专门记下新单词的先后。**

\`\`\`java
ArrayList<String> order = new ArrayList<String>();   // 记事本：按先后记下每一个"新面孔"
\`\`\`

\`ArrayList\` 可以理解成"**能自己变长的数组**"：普通数组 \`int[] a = new int[105];\` 一开始就得定好大小，而 \`ArrayList\` 用 \`add\` 往末尾添加元素，元素多了它自己扩容。三个常用操作：

| 操作 | 意思 |
| --- | --- |
| \`order.add(word)\` | 往末尾添加一个元素 |
| \`order.size()\` | 一共有几个元素 |
| \`order.get(i)\` | 取第 i 个元素（下标**从 0 开始**） |

**循环体里的顺序很关键：先记顺序，后计数。**

\`\`\`java
for (int i = 0; i < n; i++) {
    String word = scanner.next();

    if (!cnt.containsKey(word)) {                    // 字典里还没有这个词 → 第一次见
        order.add(word);                             // 把它的名字记进记事本
    }

    cnt.put(word, cnt.getOrDefault(word, 0) + 1);    // 不管第几次见，次数都要加一
}
\`\`\`

\`containsKey(word)\` 是"**只看不改**"的问句：字典里有这个词返回 \`true\`，没有返回 \`false\`；\`!\` 是取反，所以 \`!cnt.containsKey(word)\` 读作"**字典里没有这个词**"。它绝不会像 \`put\` 那样把键建出来，所以特别适合用来判断"是不是第一次见"。

- 别用 \`cnt.get(word) == null\` 判断：能跑通但绕，而且很容易在别处引发 \`NullPointerException\`；
- 更别用 \`cnt.get(word) == 0\` 判断：万一某个计数恰好是 0 就全错了。

**输出时按记事本的顺序走：**

\`\`\`java
for (int i = 0; i < order.size(); i++) {
    String word = order.get(i);
    System.out.println(word + " " + cnt.get(word));   // 次数从字典里取出来
}
\`\`\`

也可以用 for-each 写得更短：

\`\`\`java
for (String word : order) {
    System.out.println(word + " " + cnt.get(word));
}
\`\`\`

如果题目要求的是"按**字母顺序**输出"，那就该把单词抄进 \`ArrayList\` 再 \`Collections.sort(order)\`（或者干脆用 \`TreeMap<String, Integer>\`）。请记住这条铁律：

> **只要题目对输出顺序有要求，就不要直接遍历 \`HashMap\`。**

${pointsTable([
  ['`HashMap<String, Integer>`', '键是单词（`String`），值是出现次数'],
  ['`scanner.next()`', '读入一个单词：遇到空格或换行就结束'],
  ['`cnt.containsKey(w)`', '返回 `true` / `false`，只看不改地问"字典里有没有 w"'],
  ['`ArrayList<String> order`', '能自动变长的列表，用来记住新单词出现的先后'],
  ['`order.add(w)` / `order.size()`', '往末尾添加一个元素 / 一共有几个元素'],
  ['`order.get(i)`', '取第 i 个元素，下标**从 0 开始**'],
  ['`for (String w : order)`', '按加入顺序依次取出每个元素（for-each）'],
  ['顺序铁律', '`HashMap` 顺序不确定；要"首次出现顺序"就用 `ArrayList` 记，要"字母序"就排序'],
])}`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 20`），表示单词的个数。\n' +
        '接下来 `n` 个单词（只含小写字母），单词之间用空格或换行分隔。',
      outputFormat:
        '按每个单词**第一次出现**的顺序，每行输出 `单词 次数`（中间一个空格）；每个单词只输出一次。',
      mistakes: mistakesTable([
        ['直接遍历 `HashMap` 来输出结果', '顺序不确定，可能时对时错（评测判错）', '把顺序记进 `ArrayList<String> order`，按 `order` 输出'],
        ['忘了 `import java.util.ArrayList;`，或把 `order.add` 写成 `order.push`', '报错 `cannot find symbol`', '用到什么就 import 什么；列表添加元素的方法叫 `add`'],
        ['先 `put` 再判断 `containsKey`', '第二个及以后的单词永远被判成"已存在"，`order` 里只剩第一个单词', '**先**判断 `if (!cnt.containsKey(word)) order.add(word);`，**再** `put` 计数'],
        ['用 `cnt.get(word) == 0` 判断"第一次出现"', '计数恰好为 0 时判断出错；`get` 对不存在的键返回 `null`，与 0 比较还会抛 `NullPointerException`', '用 `!cnt.containsKey(word)`'],
        ['用 `word1 == word2` 比较两个单词', '比较的是"是不是同一个对象"，结果常常是 `false`', '字符串比较必须用 `word1.equals(word2)`'],
      ]),
      tips:
        '- 输入里的单词可能分散在多行，`scanner.next()` 会自己跳过空格和换行，一个词一个词地读。\n' +
        '- 记住操作顺序：**先记顺序（`containsKey` + `add`），后计数（`put`）**。\n' +
        '- `ArrayList` 的下标也是从 0 开始的，`size()` 是元素个数，`get(i)` 取第 i 个。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<String, Integer> cnt = new HashMap<String, Integer>();
        ArrayList<String> order = new ArrayList<String>();

        for (int i = 0; i < n; i++) {
            String word = scanner.next();
            // TODO: 如果 word 是第一次出现，把它记进 order（用 containsKey 判断）
            // TODO: 把 word 的出现次数加 1
        }

        // TODO: 按 order 里的顺序输出每个单词和它的次数`,
        {
          imports:
            'import java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.Scanner;',
        },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<String, Integer> cnt = new HashMap<String, Integer>();
        ArrayList<String> order = new ArrayList<String>();

        for (int i = 0; i < n; i++) {
            String word = scanner.next();
            if (!cnt.containsKey(word)) {
                order.add(word);
            }
            cnt.put(word, cnt.getOrDefault(word, 0) + 1);
        }

        for (int i = 0; i < order.size(); i++) {
            String word = order.get(i);
            System.out.println(word + " " + cnt.get(word));
        }`,
        {
          imports:
            'import java.util.ArrayList;\nimport java.util.HashMap;\nimport java.util.Scanner;',
        },
      ),
      tests: [
        { input: '6\napple banana apple cherry banana apple\n', expected: 'apple 3\nbanana 2\ncherry 1\n' },
        { input: '1\nhello\n', expected: 'hello 1\n' },
        { input: '3\na a a\n', expected: 'a 3\n' },
        { input: '5\nx y z x y\n', expected: 'x 2\ny 2\nz 1\n' },
      ],
      hints: [
        '计数和上一题一样，只是键变成了 `String`：`cnt.put(word, cnt.getOrDefault(word, 0) + 1);`。',
        '第一次见到某个单词时，用 `order.add(word);` 把它的名字按先后记下来。',
        '判断"第一次见"用 `if (!cnt.containsKey(word))`，**先**记顺序、**后**计数。',
        '输出时按 `order` 的顺序走：`for (String w : order) System.out.println(w + " " + cnt.get(w));`。',
      ],
    }),

    lesson({
      id: 'j7-3',
      title: '第一个只出现一次的字符',
      difficulty: '简单',
      knowledge: '字符计数与查找',
      story:
        '字典的**键**不一定非得是数字或单词，也可以是一**个**字符。把键的类型写成 `Character`，就能统计每个字母出现了多少次。\n\n' +
        '要找出"第一个只出现一次的字符"，思路是**扫两遍**：第一遍数数，第二遍按字符串本来的顺序找答案。\n\n' +
        '第二遍为什么不能直接翻字典？因为题目要的是"在字符串里**最先**出现"的那个字符，而翻字典得到的顺序完全不是一回事。',
      task: '读入一个字符串，找出**第一个只出现一次的字符**；如果每个字符都至少出现了两次，输出 `none`。',
      lesson: `**字典的键不一定非得是数字。** 上一题的键是 \`String\`，这一题换成**单个字符**，用法一模一样：

\`\`\`java
import java.util.HashMap;

HashMap<Character, Integer> cnt = new HashMap<Character, Integer>();
//      ↑ 键：字符                ↑ 值：次数
\`\`\`

注意键写的是 \`Character\`（\`char\` 的包装类），**不能写 \`char\`**：\`HashMap<char, Integer>\` 会报错 \`unexpected type\`，理由和 \`Integer\` 一样——集合里只能放对象。

字符常量写在**单引号**里：\`'a'\` 是一个字符（\`char\`），\`"a"\` 是一串文字（\`String\`），两者类型不同，不能混着用。

**从字符串里取第 i 个字符：**

\`\`\`java
String s = scanner.next();
char c = s.charAt(i);      // 第 i 个字符，下标从 0 开始
int len = s.length();      // 长度：是"方法"，别忘了圆括号
\`\`\`

⚠️ 字符串的长度是 \`s.length()\`（**带圆括号**），数组的长度是 \`a.length\`（**不带圆括号**），这是新手最容易混的一对。

**这一题分两步走：扫两遍。**

**第一遍：纯粹数数。**

\`\`\`java
for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
    cnt.put(c, cnt.getOrDefault(c, 0) + 1);      // 还是那句计数
}
\`\`\`

**第二遍：按字符串本来的顺序找答案。**

\`\`\`java
boolean found = false;                    // 标记变量：记住"到底找到没有"

for (int i = 0; i < s.length(); i++) {
    char c = s.charAt(i);
    if (cnt.get(c) == 1) {                // 这个字符只出现过一次
        System.out.println(c);
        found = true;
        break;                            // 第一个就是答案，立刻跳出循环
    }
}

if (!found) {                             // 一个都没找到：每个字符都至少出现了两次
    System.out.println("none");
}
\`\`\`

**为什么第二遍必须按原串顺序走，而不是遍历字典？** 因为题目要的是"在字符串里**最先**出现"的那个字符，而遍历 \`HashMap\` 得到的是"哈希顺序里的第一个"，两者完全不是一回事。举个小例子：\`s = "ba"\`，\`'b'\` 和 \`'a'\` 都只出现一次，串里最靠前的是 \`'b'\`；要是靠遍历字典去碰运气，很可能先撞上 \`'a'\`，答案就错了。

\`boolean found\` 是标记变量（前面阶段学过）：找到时置成 \`true\`，最后 \`if (!found)\` 表示"没找到"（\`!\` 是取反）。\`break\` 是"立刻结束循环"——第一个答案已经拿到，后面不用再看了。

**关于 \`cnt.get(c) == 1\`：** 这里的 \`c\` 一定在字典里（第一遍把它存进去过），所以 \`get\` 不会返回 \`null\`，可以放心和 1 比较。

${pointsTable([
  ['`HashMap<Character, Integer>`', '键是**字符**，值是次数；键不能写成 `char`'],
  ['`s.charAt(i)`', '取字符串第 i 个字符（类型是 `char`），下标从 0 开始'],
  ['`s.length()`', '字符串长度，**带圆括号**；数组是 `a.length`，不带圆括号'],
  ['字符与字符串', '字符常量写单引号 \'a\'（`char`），字符串写双引号（`String`），混用会报 `incompatible types`'],
  ['`cnt.get(c) == 1`', '这个字符恰好只出现一次'],
  ['`break;`', '立刻跳出当前循环'],
  ['`boolean found`', '标记变量，记录"找到没有"，最后配合 `if (!found)` 使用'],
  ['两遍扫描', '第一遍统计，第二遍**按原串顺序**找答案；绝不能靠遍历字典找'],
])}`,
      inputFormat: '一行，一个只含小写字母的字符串 `s`（`1 ≤ 长度 ≤ 20`，不含空格）。',
      outputFormat:
        '输出第一个只出现一次的字符（一个字符 + 换行）；如果每个字符都至少出现了两次，输出 `none`。',
      mistakes: mistakesTable([
        ['`HashMap<char, Integer> cnt = ...;`', '报错 `unexpected type`', '写包装类：`HashMap<Character, Integer>`'],
        ['第二遍改成遍历 `HashMap` 找答案', '拿到的是"哈希顺序里第一个"，不是"串里最先出现"的；例如 `ba` 可能输出 `a`', '按原串顺序再扫一遍：`for (int i = 0; i < s.length(); i++)`'],
        ['写 `s.length` 忘了圆括号', '报错 `cannot find symbol: method length`', '字符串是 `s.length()`；只有数组才是 `a.length`'],
        ['把字符写成双引号 `"a"`', '类型对不上（`String` 不是 `char`），报错 `incompatible types`', "单个字符用单引号：'a'"],
        ['找到答案后忘了 `break;`', '会继续往后找，可能打印出好几个字符', '第一个就是答案，输出后立刻 `break;`'],
      ]),
      tips:
        '- 输出单个字符用 `System.out.println(c);`，`c` 是 `char` 类型，直接打印就是一个字符。\n' +
        '- 字符串长度 `s.length()` 带括号，数组长度 `a.length` 不带，写错会报 `cannot find symbol`。\n' +
        '- "第一个"＝ 在原字符串里最靠前，所以第二遍必须从头按原顺序走。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();

        HashMap<Character, Integer> cnt = new HashMap<Character, Integer>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            // TODO: 统计字符 c 出现的次数
        }

        // TODO: 按字符串原来的顺序再扫一遍，输出第一个只出现一次的字符
        // TODO: 如果一个都没找到，输出 none`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        String s = scanner.next();

        HashMap<Character, Integer> cnt = new HashMap<Character, Integer>();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            cnt.put(c, cnt.getOrDefault(c, 0) + 1);
        }

        boolean found = false;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (cnt.get(c) == 1) {
                System.out.println(c);
                found = true;
                break;
            }
        }

        if (!found) {
            System.out.println("none");
        }`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      tests: [
        { input: 'abacabad\n', expected: 'c\n' },
        { input: 'aabbcc\n', expected: 'none\n' },
        { input: 'a\n', expected: 'a\n' },
        { input: 'aabbc\n', expected: 'c\n' },
      ],
      hints: [
        '第一遍只统计：`cnt.put(s.charAt(i), cnt.getOrDefault(s.charAt(i), 0) + 1);`。',
        '第二遍按原串顺序检查 `if (cnt.get(c) == 1)`，找到就输出并 `break;`。',
        '用一个 `boolean found = false;` 记录有没有找到，循环结束后 `if (!found) System.out.println("none");`。',
        '别去遍历字典找答案——那样得到的是哈希顺序里的第一个，不是最先出现的字符。',
      ],
    }),

    lesson({
      id: 'j7-4',
      title: '成绩查找表',
      difficulty: '简单',
      knowledge: 'HashMap 查找表',
      story:
        '`HashMap` 最典型的用途就是当**查找表**：把姓名当**键**，成绩当**值**，之后拿着姓名一查就能拿到成绩。\n\n' +
        '这一题练习"存进去"和"查出来"两件事，还要分清一个重要的区别：**"真的考了 0 分"** 和 **"表里根本没有这个人"**。',
      task:
        '先读入 n 组「姓名 成绩」建立查找表，再回答 m 次查询：每次给出一个姓名，输出他的成绩；如果查找表里没有这个人，输出 `未找到`。',
      lesson: `这一题要把字典的两种用法分清楚：**建表（往里写）** 和 **查表（往外读）**。它们长得像，行为却不一样。

**第一步：建表**

本题的键是**姓名**（\`String\`），值是**成绩**（\`Integer\`）：

\`\`\`java
import java.util.HashMap;

HashMap<String, Integer> score = new HashMap<String, Integer>();
score.put("Alice", 95);      // 建立映射：Alice → 95
score.put("Bob", 88);        // 再写一条，字典自动多一个词条
\`\`\`

\`put(键, 值)\` 读作"**把值存到这个键下面**"：键原来不在字典里就新建，本来就有就**覆盖**旧值。读入 n 组数据就是一个普通循环：

\`\`\`java
int n = scanner.nextInt();
for (int i = 0; i < n; i++) {
    String name = scanner.next();
    int s = scanner.nextInt();      // 变量名别叫 score，会和字典重名
    score.put(name, s);             // 建表：姓名 → 成绩
}
\`\`\`

**第二步：查表——三种取法的区别**

| 写法 | 键存在时 | 键不存在时 |
| --- | --- | --- |
| \`score.get(name)\` | 返回成绩 | 返回 \`null\`（表示"没有"） |
| \`score.containsKey(name)\` | 返回 \`true\` | 返回 \`false\` |
| \`score.getOrDefault(name, -1)\` | 返回成绩 | 返回你给的默认值 \`-1\` |

**本题要用 \`containsKey\`**：题目要求"查不到就输出 \`未找到\`"，而"未找到"不是成绩，也没法用某个默认值来替代——所以必须**先问一句在不在**，再决定输出什么：

\`\`\`java
int m = scanner.nextInt();
for (int i = 0; i < m; i++) {
    String name = scanner.next();

    if (score.containsKey(name)) {          // 只看不改地问一句：有没有这个人
        System.out.println(score.get(name));
    } else {
        System.out.println("未找到");
    }
}
\`\`\`

**为什么不能用"取出来是不是 0"来判断有没有这个人？** 有两个原因：

1. **真的有人会考 0 分**——\`Zed\` 考了 0 分和"表里没有 Zed"，用 \`get\` 得到的都是 0，根本分不清；
2. \`get\` 对不存在的键返回 \`null\`，拿 \`null\` 去和数字比较会抛 \`NullPointerException\`。

所以判断"在不在"永远用 \`containsKey\`，它**只看不改**，也不会往字典里凭空加东西。

**字符串比较必须用 \`equals\`。** Java 里 \`name == "Alice"\` 比较的是"是不是同一个对象"，结果常常是 \`false\`；要比较内容得写 \`name.equals("Alice")\`。这一点和 C++ 的 \`string\` 可以直接用 \`==\` 不同，要格外小心。

最后认识一下遍历字典的标准写法（本题的顺序无所谓，所以用 \`HashMap\` 就够，但迟早用得上）：

\`\`\`java
import java.util.Map;

for (Map.Entry<String, Integer> entry : score.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());   // 键 -> 值
}
\`\`\`

\`entry.getKey()\` 是键、\`entry.getValue()\` 是值。**要写 for-each，不要用 lambda 或 \`forEach\`。**

${pointsTable([
  ['`score.put(name, s)`', '存一条"姓名 → 成绩"；同名再 `put` 会**覆盖**旧值'],
  ['`score.get(name)`', '按键取值；**键不存在时返回 `null`**'],
  ['`score.containsKey(name)`', '返回 `true` / `false`，只看不改；判断"在不在"就用它'],
  ['`score.getOrDefault(name, -1)`', '按键取值；键不存在时返回默认值 `-1`'],
  ['`score.size()`', '字典里一共有多少个键值对'],
  ['`equals` 比较字符串', '`name.equals("Alice")`；`==` 比较的是"是不是同一个对象"'],
  ['遍历字典', '`for (Map.Entry<String, Integer> entry : score.entrySet())`，配 `getKey()` / `getValue()`'],
  ['`put` 的参数顺序', '先键后值：`put(键, 值)`，写反了整张表都会错'],
])}`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 20`），表示人数。\n' +
        '接下来 `n` 行，每行一个姓名（不含空格）和一个整数成绩（`0 ≤ 成绩 ≤ 100`）。\n' +
        '接下来一个整数 `m`（`1 ≤ m ≤ 20`），表示查询次数。\n' +
        '接下来 `m` 行，每行一个要查询的姓名。',
      outputFormat:
        '每次查询输出一行：该姓名的成绩；如果查找表里没有这个人，输出 `未找到`。',
      mistakes: mistakesTable([
        ['用 `score.get(name) == 0` 判断"有没有这个人"', '真考 0 分的人会被误判成"未找到"；名字不存在时 `get` 返回 `null`，与 0 比较还会抛 `NullPointerException`', '用 `if (score.containsKey(name))`'],
        ['用 `name == "Alice"` 比较字符串', '比较的是对象地址，常常得到 `false`', '`name.equals("Alice")`'],
        ['`score.put(s, name)` 把键和值写反', '变成"成绩 → 姓名"，查询结果全错', '`put(键, 值)`：`score.put(name, s);`'],
        ['查询时直接 `System.out.println(score.get(name));` 不做判断', '查不到会打印 `null`，与期望的 `未找到` 不一致', '先 `if (score.containsKey(name))` 再决定输出什么'],
        ['遍历时写 `for (Map.Entry<String, Integer> entry : score)`', '报错 `incompatible types`', '要遍历 `score.entrySet()`；并记得 `import java.util.Map;`'],
      ]),
      tips:
        '- `containsKey` 是"只看不改"的问句，不会往表里凭空加东西，最适合用来判断存在与否。\n' +
        '- 注意 `put` 的参数顺序是**先键后值**，本题就是 `score.put(name, s);`。\n' +
        '- 本题不要求顺序，查到谁就输出谁，所以用 `HashMap` 就够了。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<String, Integer> score = new HashMap<String, Integer>();
        for (int i = 0; i < n; i++) {
            String name = scanner.next();
            int s = scanner.nextInt();
            // TODO: 把 name -> s 存进查找表
        }

        int m = scanner.nextInt();
        for (int i = 0; i < m; i++) {
            String name = scanner.next();
            // TODO: 表里有这个姓名就输出成绩，否则输出 未找到
        }`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<String, Integer> score = new HashMap<String, Integer>();
        for (int i = 0; i < n; i++) {
            String name = scanner.next();
            int s = scanner.nextInt();
            score.put(name, s);
        }

        int m = scanner.nextInt();
        for (int i = 0; i < m; i++) {
            String name = scanner.next();
            if (score.containsKey(name)) {
                System.out.println(score.get(name));
            } else {
                System.out.println("未找到");
            }
        }`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      tests: [
        {
          input: '3\nAlice 95\nBob 88\nCindy 72\n4\nBob\nAlice\nDavid\nCindy\n',
          expected: '88\n95\n未找到\n72\n',
        },
        { input: '1\nTom 60\n1\nTom\n', expected: '60\n' },
        { input: '1\nAmy 1\n2\nBen\nAmy\n', expected: '未找到\n1\n' },
        { input: '2\nZed 0\nAmy 100\n3\nZed\nAmy\nZed\n', expected: '0\n100\n0\n' },
      ],
      hints: [
        '建表：`score.put(name, s);`——键是姓名（`String`），值是成绩（`Integer`）。',
        '查询前先判断：`if (score.containsKey(name))`，成立才用 `score.get(name)` 取值。',
        '表里没有这个人时输出 `未找到`（中文字符串，直接写进 `System.out.println`）。',
        '有人可能考 0 分，所以不能用"取出来是不是 0"来判断存在与否，要用 `containsKey`。',
      ],
    }),

    lesson({
      id: 'j7-5',
      title: '两数之和',
      difficulty: '中等',
      knowledge: '边读边查两数之和',
      story:
        '最土的找法是"两两配对"：先挑一个数，再挑一个数，看它们的和是不是目标值。n 个数要比大约 n²/2 次，n 一大就慢得让人着急。\n\n' +
        '用 `HashMap` 可以**边读边查**：每读到一个数 `x`，就问一句"在我**之前**读到的数里，有没有 `target - x`？"——之前读过的数都记在字典里，所以这一问就是一次查表，非常快。\n\n' +
        '因为表里只装"已经读过的数"，查出来的位置一定在当前数字**前面**，天然满足 `i < j`，同一个位置也就不会被用两次。',
      task:
        '读入 n 个整数和一个目标值 `target`，判断是否存在两个数之和恰好等于 `target`；存在就输出这两个数的位置（从 1 开始，小的在前），否则输出 `NO`。',
      lesson: `**先说清"两两配对"为什么慢，以及怎么变快。**

朴素的做法是：每个数都去和后面每个数配一次，大约要 n²/2 次加法，n = 1000 就是 50 万次。换个思路：

> **从左往右读，每读到一个新数 \`x\`，只问一个问题："我之前读到过的数里，有没有 \`target - x\`？"**

把"之前读到过的数"提前记进字典，这一问就从"翻遍所有数"变成"查一次表"。这个套路叫**边读边查**。

**字典里存什么？** 键是**数字**，值是**它第一次出现的下标**（题目要输出位置，所以位置得跟着一起存）：

\`\`\`java
import java.util.HashMap;

HashMap<Integer, Integer> pos = new HashMap<Integer, Integer>();   // 数字 -> 第一次出现的位置
pos.put(7, 2);      // 表示：数字 7 最早出现在第 2 个位置
\`\`\`

本题只要查得快，最后也只输出两个下标，和遍历顺序无关，所以用 \`HashMap\` 就够了。

**循环体里最重要的规矩：先查、后存。**

\`\`\`java
boolean found = false;                 // 有没有找到答案
int ansI = 0;
int ansJ = 0;

for (int i = 1; i <= n; i++) {         // 位置从 1 开始，正好和题目要求一致
    int x = scanner.nextInt();

    if (!found) {                              // 已经找到就不再改动答案
        int need = target - x;                 // 还差多少才凑成 target
        if (pos.containsKey(need)) {           // 查表：need 之前出现过吗？（只看不改）
            found = true;
            ansI = pos.get(need);              // 前面那个数的位置 → i
            ansJ = i;                          // 现在这个数的位置 → j
        }
    }

    if (!pos.containsKey(x)) {                 // 只记"第一次出现的位置"
        pos.put(x, i);                         // 存进去，留给后面的数查
    }
}
\`\`\`

**为什么必须"先查后存"？** 假如先把 \`x\` 存进去再查，那么当 \`target = 2x\` 时（比如 \`target = 6\`，当前数也是 3），查到的就会是**刚刚存进去的自己**，同一个位置被用了两次——而题目要的是**两个不同的位置**。先查后存，查到的必然是"前面读过的数"，天然保证 \`i < j\`。

**为什么只记第一次出现的位置？** 题目给的规则是：多组答案并列时，先让 \`j\` 尽量小；\`j\` 相同，再让 \`i\` 尽量小。

- "从左往右边读边查，**第一次查到的**就是答案"→ 保证 \`j\` 最小；
- "每个数只记第一次出现的位置"→ 保证 \`i\` 最小。

所以 \`if (!found)\` 保住第一对答案、\`if (!pos.containsKey(x))\` 保住最早的位置，两条规则就都满足了。

**判断"在不在表里"要用 \`containsKey\`，不要拿 \`pos.get(need)\` 和 \`null\` 比较**：\`containsKey\` 只看不改，意思清楚，也不会像 \`get\` 那样返回 \`null\` 让你出错。（顺便记住：\`get\` 对不存在的键返回的是 \`null\`，不是 0。）

最后输出：

\`\`\`java
if (found) {
    System.out.println(ansI + " " + ansJ);     // 两个位置中间一个空格
} else {
    System.out.println("NO");
}
\`\`\`

${pointsTable([
  ['`HashMap<Integer, Integer> pos`', '键是数字，值是它**第一次出现**的下标'],
  ['`need = target - x`', '还差多少才凑成目标值'],
  ['`pos.containsKey(need)`', '只看不改地问"need 之前出现过吗"'],
  ['先查后存', '否则一个位置可能被用两次（比如 `target = 2x` 的情况）'],
  ['只记第一次的位置', '`if (!pos.containsKey(x)) { pos.put(x, i); }`'],
  ['`boolean found`', '找到第一对后就定下来，不再覆盖答案（保证 j 最小）'],
  ['下标从 1 开始', '循环写 `for (int i = 1; i <= n; i++)`，正好和题目一致'],
  ['输出', '找到就输出 `i j`，否则输出 `NO`'],
])}`,
      inputFormat:
        '第一行两个整数 `n` 和 `target`（`1 ≤ n ≤ 20`）。\n' +
        '第二行 `n` 个整数（`-100 ≤ 数字 ≤ 100`），用空格分隔。',
      outputFormat:
        '如果存在两个数之和等于 `target`，输出两个用空格分隔的位置 `i j`（`i < j`，都从 1 开始）；否则输出一行 `NO`。',
      mistakes: mistakesTable([
        ['先 `put` 再查', '同一个位置可能被用两次（如 `target = 2x`），输出错误的下标对', '**先查后存**：查完 `need` 再存 `x`'],
        ['每次都覆盖位置：`pos.put(x, i);` 不做判断', '并列答案里 i 会取到最后一个位置，与题目要求不符', '`if (!pos.containsKey(x)) { pos.put(x, i); }` 只记第一次'],
        ['找到答案后又用新的答案覆盖 `ansI` / `ansJ`', 'j 不再是"最小"的那个，输出与期望不符', '用 `if (!found)` 包住查找，第一次找到就定下来'],
        ['用 `if (pos.get(need) != null)` 判断', '能跑通但写法绕，容易和"值为 0"混淆', '用 `pos.containsKey(need)`'],
        ['下标从 0 开始数', '输出位置比期望小 1', '本题位置从 **1** 开始：`for (int i = 1; i <= n; i++)`'],
      ]),
      tips:
        '- "边读边查"的意思是：表里只放**已经读过**的数，每读一个新数只查一次表。\n' +
        '- 题目规则（先让 j 尽量小、再让 i 尽量小）正好等价于"从左往右第一次查到的那一对"。\n' +
        '- 本题的结果与字典的遍历顺序无关，所以用 `HashMap` 就够了，不需要 `TreeMap`。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int target = scanner.nextInt();

        HashMap<Integer, Integer> pos = new HashMap<Integer, Integer>();   // 数字 -> 第一次出现的位置
        boolean found = false;
        int ansI = 0;
        int ansJ = 0;

        for (int i = 1; i <= n; i++) {
            int x = scanner.nextInt();
            // TODO: 先算 need = target - x，如果 pos 里有 need，就记下答案（i 是新的 j）
            // TODO: 如果 pos 里还没有 x，就把 pos.put(x, i)（只记第一次出现的位置）
        }

        // TODO: 找到答案就输出 ansI 和 ansJ，否则输出 NO`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int target = scanner.nextInt();

        HashMap<Integer, Integer> pos = new HashMap<Integer, Integer>();   // 数字 -> 第一次出现的位置
        boolean found = false;
        int ansI = 0;
        int ansJ = 0;

        for (int i = 1; i <= n; i++) {
            int x = scanner.nextInt();

            if (!found) {
                int need = target - x;
                if (pos.containsKey(need)) {
                    found = true;
                    ansI = pos.get(need);
                    ansJ = i;
                }
            }

            if (!pos.containsKey(x)) {
                pos.put(x, i);
            }
        }

        if (found) {
            System.out.println(ansI + " " + ansJ);
        } else {
            System.out.println("NO");
        }`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      tests: [
        { input: '5 13\n2 7 11 15 6\n', expected: '1 3\n' },
        { input: '4 100\n1 2 3 4\n', expected: 'NO\n' },
        { input: '4 6\n3 3 4 4\n', expected: '1 2\n' },
        { input: '5 2\n-1 -2 3 4 3\n', expected: '1 3\n' },
      ],
      hints: [
        '字典的含义是"这个数第一次出现在第几个位置"，用 `pos.put(x, i);` 记录。',
        '每读入 `x` 先算 `int need = target - x;`，再用 `if (pos.containsKey(need))` 查表。',
        '顺序很关键：**先查后存**，才能保证同一个位置不会被用两次。',
        '用 `boolean found = false;` 记住是否已经找到；找到后不要再覆盖 `ansI` / `ansJ`，最后 `found` 为假就输出 `NO`。',
      ],
    }),

    lesson({
      id: 'j7-6',
      title: '出现最多的数字',
      difficulty: '中等',
      knowledge: '最高频元素统计',
      story:
        '这是 Java 阶段的最后一题，把学过的东西串起来用一遍：循环读入、`HashMap` 计数、遍历比较。\n\n' +
        '"谁出现得最多"这类问题，计数一遍扫描就够了；而"并列时取最小的数字"这个要求，只要**按数字从小到大**遍历、并列时**不换擂主**，就自然满足了。\n\n' +
        '难点只有一个：`HashMap` 的遍历顺序是不确定的，得换一个会自动排序的字典——`TreeMap`。',
      task:
        '读入 n 个整数，找出其中出现次数最多的数字；如果出现次数最多的数字有多个，输出其中**最小的**那个，并输出它的出现次数。',
      lesson: `这道题分两步：**先数数，再挑冠军。**

**第一步：数数**（和本阶段第一题一样）

\`\`\`java
HashMap<Integer, Integer> cnt = new HashMap<Integer, Integer>();
for (int i = 0; i < n; i++) {
    int x = scanner.nextInt();
    cnt.put(x, cnt.getOrDefault(x, 0) + 1);
}
\`\`\`

**第二步：打擂台找冠军。** 想象一场比赛：先立一个擂主，之后每位选手上台挑战，赢了就换擂主。这里有**两样东西**要一起记——擂主是谁（哪个数字）和他有多强（出现次数）。

问题是：**按什么顺序上台？** 题目要求"并列时取最小的数字"，而 \`HashMap\` 的遍历顺序不确定，顺序一乱，"先遇到的更小"就不成立了。所以要换一个会**自动按键排序**的字典：\`TreeMap\`。

\`\`\`java
import java.util.TreeMap;

TreeMap<Integer, Integer> sorted = new TreeMap<Integer, Integer>(cnt);
// 把 cnt 里的内容整体复制进 TreeMap，键会自动按从小到大排好
\`\`\`

\`TreeMap\` 和 \`HashMap\` 用法几乎一样（\`put\` / \`get\` / \`getOrDefault\` / \`containsKey\` 全都有），唯一的区别是它**始终保持键的有序**，所以遍历顺序是确定的。构造时把字典 \`cnt\` 传进去，就相当于"照抄一份并排好序"。

**打擂台**（用 for-each + \`Map.Entry\` 遍历）：

\`\`\`java
int bestNum = 0;        // 擂主：目前出现次数最多的那个数字
int bestCnt = 0;        // 擂主成绩：它的出现次数

for (Map.Entry<Integer, Integer> entry : sorted.entrySet()) {
    int num = entry.getKey();        // 键：数字
    int times = entry.getValue();    // 值：次数

    if (times > bestCnt) {           // 严格大于，才换擂主
        bestCnt = times;             // 先更新成绩
        bestNum = num;               // 再换上擂主
    }
}

System.out.println(bestNum + " " + bestCnt);   // 先数字，再次数
\`\`\`

**为什么必须是严格大于 \`>\`？** 因为 \`TreeMap\` 是按数字**从小到大**遍历的。走到后面的数字时，如果它的次数**相等**，\`>\` 不成立，于是**不换擂主**——擂主还是先前那个**更小**的数字。这正是题目要的"并列取最小"。反过来，如果把 \`>\` 写成 \`>=\`，遇到并列就会换成后面那个更大的数字，答案就错了。

**两个变量必须配套更新。** 换擂主时，成绩和数字要**一起**改；只改一个，就会出现"数字是甲、次数是乙"的错位。

**\`bestCnt\` 初值取 0 的理由**：字典里每个键都是真正出现过的数字，次数至少是 1；再加上题目保证 \`n ≥ 1\`，第一个上台的选手一定能打败 0 当上擂主，擂台不会一直空着。

**另一条路：** 不引入 \`TreeMap\` 也行——像第一题那样把键抄进 \`ArrayList\` 再 \`Collections.sort(keys)\`，然后按这个顺序打擂台，效果完全一样。

${pointsTable([
  ['`TreeMap<Integer, Integer>`', '按键**从小到大**自动排序的字典，用法和 `HashMap` 几乎一样'],
  ['`new TreeMap<Integer, Integer>(cnt)`', '把 `HashMap` 里的内容复制过来，并自动按键排序'],
  ['`for (Map.Entry<Integer, Integer> entry : sorted.entrySet())`', '逐个键值对遍历；需要 `import java.util.Map;`'],
  ['`entry.getKey()` / `entry.getValue()`', '键（数字）/ 值（次数）'],
  ['`times > bestCnt`', '**严格大于**才换擂主；写成 `>=` 并列时会选错'],
  ['`bestCnt = times; bestNum = num;`', '两个变量必须一起更新，否则数字和次数对不上'],
  ['并列自动取最小', '靠的是"升序遍历 + 并列不更新"，不需要额外写判断'],
  ['`bestCnt` 初值 0', '次数至少是 1，所以第一个选手必定当上擂主'],
])}`,
      inputFormat:
        '第一行一个整数 `n`（`1 ≤ n ≤ 20`）。\n' +
        '第二行 `n` 个整数（`-10000 ≤ 数字 ≤ 10000`），用空格分隔。',
      outputFormat:
        '输出一行：出现次数最多的数字和它的出现次数，中间一个空格。并列最多时输出**最小的**那个数字。',
      mistakes: mistakesTable([
        ['写成 `if (times >= bestCnt)`', '并列时会换成后面更大的数字，答案与期望不符', '必须用**严格大于** `>`'],
        ['只更新 `bestCnt` 忘了 `bestNum`（或反过来）', '输出的数字和次数对不上', '两个变量配套更新'],
        ['直接遍历 `HashMap` 打擂台', '遍历顺序不确定，并列时选中的数字可能每次都不同', '用 `TreeMap`（或先把键排序）保证从小到大遍历'],
        ['`new TreeMap<Integer, Integer>(cnt)` 漏写成 `new TreeMap<Integer, Integer>()`', '得到一本空字典，擂台没有选手，输出 `0 0`', '把 `cnt` 传进构造方法，或者干脆直接用一个 `TreeMap` 计数'],
        ['输出顺序写成"次数 数字"', '与期望输出不一致', '题目要求先数字、后次数'],
      ]),
      tips:
        '- `TreeMap` 的用法和 `HashMap` 几乎一样（`put` / `get` / `getOrDefault` / `containsKey`），区别是它**按键排序**，遍历顺序是确定的。\n' +
        '- "打擂台"是通用套路：一个变量记"目前最好的成绩"，遇到更好的就换人。\n' +
        '- 不想引入 `TreeMap` 也可以按第一题的办法把键抄进 `ArrayList` 再 `Collections.sort`。',
      starter: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<Integer, Integer> cnt = new HashMap<Integer, Integer>();
        for (int i = 0; i < n; i++) {
            int x = scanner.nextInt();
            // TODO: 统计 x 出现的次数
        }

        // TODO: 把 cnt 复制进 TreeMap，让键按从小到大排好序
        // TODO: 打擂台：找出出现次数最多的数字（并列时保留最小的那个）
        // TODO: 输出 "数字 次数"`,
        { imports: 'import java.util.HashMap;\nimport java.util.Scanner;' },
      ),
      solution: mainOnly(
        `        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();

        HashMap<Integer, Integer> cnt = new HashMap<Integer, Integer>();
        for (int i = 0; i < n; i++) {
            int x = scanner.nextInt();
            cnt.put(x, cnt.getOrDefault(x, 0) + 1);
        }

        TreeMap<Integer, Integer> sorted = new TreeMap<Integer, Integer>(cnt);

        int bestNum = 0;
        int bestCnt = 0;
        for (Map.Entry<Integer, Integer> entry : sorted.entrySet()) {
            int num = entry.getKey();
            int times = entry.getValue();
            if (times > bestCnt) {
                bestCnt = times;
                bestNum = num;
            }
        }

        System.out.println(bestNum + " " + bestCnt);`,
        {
          imports:
            'import java.util.HashMap;\nimport java.util.Map;\nimport java.util.Scanner;\nimport java.util.TreeMap;',
        },
      ),
      tests: [
        { input: '8\n3 1 3 2 3 1 5 1\n', expected: '1 3\n' },
        { input: '1\n42\n', expected: '42 1\n' },
        { input: '5\n-7 -7 -7 -7 -7\n', expected: '-7 5\n' },
        { input: '6\n-5 -5 -3 -3 -1 -1\n', expected: '-5 2\n' },
      ],
      hints: [
        '第一步先数数：`cnt.put(x, cnt.getOrDefault(x, 0) + 1);`。',
        '第二步要按数字从小到大看：`TreeMap<Integer, Integer> sorted = new TreeMap<Integer, Integer>(cnt);`，它自动按键升序。',
        '用 `if (times > bestCnt)`（严格大于）更新 `bestCnt` 和 `bestNum`；并列时不动，答案自然就是最小的数字。',
        '最后输出 `bestNum` 和 `bestCnt`，中间一个空格。',
      ],
    }),
  ],
};
