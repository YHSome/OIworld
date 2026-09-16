import type { Difficulty, Problem, ProblemStatus, StageData } from '../types/problem';

const stage = (
  number: number,
  title: string,
  subtitle: string,
  summary: string,
  problems: Problem[],
): StageData => ({ stage: number, title, subtitle, summary, problems });

export const PYTHON_STAGES: StageData[] = [
  stage(1, '第一阶段：开口说话', '输出、变量与输入', '从 `print()` 开始，学会把数据读进来、算出来、输出去。', [
    {
      id: 'py-s1-p1', title: '你好，Python', difficulty: '入门', knowledge_point: 'print 输出',
      description: '## 任务\n输出一行文字：`Hello, Python!`。\n\n## 输出格式\n只输出这一行，不要多余文字。',
      starter_code: '# TODO: 在这里写一行 print\n', solution_code: 'print("Hello, Python!")\n',
      test_cases: [{ input: '', expected_output: 'Hello, Python!\n' }], hints: ['使用 `print("Hello, Python!")`。'],
    },
    {
      id: 'py-s1-p2', title: '两数相加', difficulty: '入门', knowledge_point: 'input 与 int',
      description: `## 题目背景：电脑不会“猜”你要算什么

这一关要让程序做最常见的数学题：读到两个数，然后把它们相加。假设标准输入里有一行：

\`\`\`text
3 5
\`\`\`

你在纸上会直接算出 \`3 + 5 = 8\`；程序也要做同样三步：**读入 → 计算 → 输出**。

> **标准输入**可以理解成“程序看得到的键盘输入”。做题时不是让你真的在代码里写 \`3\` 和 \`5\`，而是评测系统每次给不同的数字。你的代码必须能处理它们。

## 任务

输入两个整数 \`a\` 和 \`b\`（在同一行，中间用一个或多个空格隔开），输出它们的和。

## 输入格式

只有 **一行**，里面有两个整数。例如：\`3 5\`。

## 输出格式

只有 **一行**，输出一个整数。例如 \`8\`。不要输出“答案是：”或“请输入数字：”，评测只需要那个数字。

## 先把样例完整走一遍

输入是：

\`\`\`text
3 5
\`\`\`

程序读到左边的 \`3\`，把它叫做 \`a\`；读到右边的 \`5\`，把它叫做 \`b\`。

| 变量名 | 里面装的数 |
| --- | --- |
| \`a\` | \`3\` |
| \`b\` | \`5\` |
| \`a + b\` | \`8\` |

因此输出：

\`\`\`text
8
\`\`\`

## 逐段认识“读一行两个整数”

这一关可以用下面这一行读入两个数：

\`\`\`python
a, b = map(int, input().split())
\`\`\`

第一次看到它很长没有关系，从**最里面**向外看：

| 片段 | 大白话解释 | 对样例 \`3 5\` 做了什么 |
| --- | --- | --- |
| \`input()\` | 从标准输入读一整行，拿到的是文字。 | 得到文字 \`"3 5"\`。 |
| \`.split()\` | 按空格把一行文字切开。点号表示“让前面的东西使用一个工具”。 | 得到两段文字：\`"3"\` 和 \`"5"\`。 |
| \`int(...)\` | 把“长得像数字的文字”变成真正能计算的整数。 | \`"3"\` 变 \`3\`，\`"5"\` 变 \`5\`。 |
| \`map(int, ...)\` | 对切出来的每一段都做一次 \`int\`。 | 同时转换两个数字。 |
| \`a, b = ...\` | 把第一个结果放进 \`a\`，第二个结果放进 \`b\`。 | \`a = 3\`，\`b = 5\`。 |

你不必一次记住 \`map\` 这个名字。现在先把这一行当作“**读同一行两个整数的固定写法**”，后面每次用到都会再解释。

## 你真正要补的代码

编辑器已经准备好读入代码。你只需在 \`# TODO\` 那一行写：

\`\`\`python
print(a + b)
\`\`\`

再拆开看：

| 片段 | 作用 |
| --- | --- |
| \`print(...)\` | 把括号里的结果显示到输出区。 |
| \`a + b\` | 取出 a、b 盒子里的数相加。 |
| \`+\` | 数字之间表示加法。 |
| 不写分号 \`;\` | Python 每行一句，**行末不用分号**。 |

## 动手：按这四步做

1. 不改动读入用的那一行；它已经把两个数放进 \`a\`、\`b\`。
2. 在 \`# TODO\` 的位置输入 \`print(a + b)\`。
3. 点击“运行”，标准输入框默认已有一个样例；看输出是否为 \`8\`。
4. 点击“提交”。提交会用隐藏的其他数字再测一遍，全部通过才解锁下一题。

## 常见错误：先避开这几个坑

| 你可能写成 | 为什么不对 | 应该怎样写 |
| --- | --- | --- |
| \`print(a, b)\` | 这会输出两个数，不会相加。 | \`print(a + b)\` |
| \`print("a + b")\` | 引号里的内容是原样文字。 | 不给 \`a + b\` 加引号。 |
| \`print(a+b)\` | **这是正确的**；空格只是让人读起来舒服。 | \`print(a + b)\` 更清楚。 |
| \`a = input()\` 后直接相加 | \`input()\` 得到文字，\`"2" + "3"\` 会变成 \`"23"\`。 | 用题目给的 \`map(int, input().split())\`。 |
| 使用中文括号或中文引号 | Python 不认识全角标点。 | 切换英文输入法，使用 \`()\`、\`""\`。 |`,
      starter_code: '# TODO: 读入 a 和 b，输出它们的和\n', solution_code: 'a, b = map(int, input().split())\nprint(a + b)\n',
      test_cases: [{ input: '3 5\n', expected_output: '8\n' }, { input: '-7 10\n', expected_output: '3\n' }, { input: '0 0\n', expected_output: '0\n' }], hints: ['`input().split()` 按空格切开文字；`map(int, ...)` 把它们变成整数。'],
    },
    {
      id: 'py-s1-p3', title: '长方形面积', difficulty: '入门', knowledge_point: '变量与运算',
      description: '## 任务\n输入长方形的长和宽（均为整数），输出面积。\n\n## 输入格式\n一行两个整数 `length width`。\n\n## 输出格式\n一个整数。',
      starter_code: '# TODO: 读入长和宽，输出面积\n', solution_code: 'length, width = map(int, input().split())\nprint(length * width)\n',
      test_cases: [{ input: '4 6\n', expected_output: '24\n' }, { input: '1 99\n', expected_output: '99\n' }], hints: ['面积等于长乘宽，乘号是 `*`。'],
    },
  ]),
  stage(2, '第二阶段：让程序会思考', '判断与循环', '用 `if` 做选择，用 `for` 重复执行；注意 Python 用缩进表示代码块。', [
    {
      id: 'py-s2-p1', title: '判断奇偶', difficulty: '入门', knowledge_point: 'if 与取模',
      description: '## 任务\n输入一个整数。如果它是偶数，输出 `even`；否则输出 `odd`。\n\n## 输入格式\n一个整数。\n\n## 输出格式\n`even` 或 `odd`。',
      starter_code: 'n = int(input())\n# TODO: 用 if 判断 n 是奇数还是偶数\n', solution_code: 'n = int(input())\nif n % 2 == 0:\n    print("even")\nelse:\n    print("odd")\n',
      test_cases: [{ input: '8\n', expected_output: 'even\n' }, { input: '-3\n', expected_output: 'odd\n' }, { input: '0\n', expected_output: 'even\n' }], hints: ['`n % 2` 是除以 2 的余数；余数为 0 就是偶数。冒号后面的代码要缩进四格。'],
    },
    {
      id: 'py-s2-p2', title: '1 到 n 的和', difficulty: '简单', knowledge_point: 'for 与 range',
      description: '## 任务\n输入正整数 `n`，计算并输出 `1 + 2 + ... + n`。\n\n## 输入格式\n一个正整数。\n\n## 输出格式\n一个整数。',
      starter_code: 'n = int(input())\ntotal = 0\n# TODO: 用 for 循环累加 1 到 n\nprint(total)\n', solution_code: 'n = int(input())\ntotal = 0\nfor i in range(1, n + 1):\n    total += i\nprint(total)\n',
      test_cases: [{ input: '1\n', expected_output: '1\n' }, { input: '5\n', expected_output: '15\n' }, { input: '100\n', expected_output: '5050\n' }], hints: ['`range(1, n + 1)` 会产生 1 到 n；`+=` 是“在原来的基础上加”。'],
    },
    {
      id: 'py-s2-p3', title: '最大的数', difficulty: '简单', knowledge_point: '循环与比较',
      description: '## 任务\n第一行输入整数 `n`，第二行输入 `n` 个整数。输出其中最大的数。\n\n## 输入格式\n第一行一个整数 `n`；第二行 n 个整数。\n\n## 输出格式\n一个整数。',
      starter_code: 'n = int(input())\nnumbers = list(map(int, input().split()))\n# TODO: 输出 numbers 中的最大值\n', solution_code: 'n = int(input())\nnumbers = list(map(int, input().split()))\nprint(max(numbers))\n',
      test_cases: [{ input: '3\n1 9 4\n', expected_output: '9\n' }, { input: '4\n-2 -8 -1 -5\n', expected_output: '-1\n' }], hints: ['Python 自带 `max(numbers)`，可以直接找出列表最大值。'],
    },
  ]),
  stage(3, '第三阶段：整理与复用', '列表、字符串与函数', '把一组数据装进列表，用函数给重复步骤起名字。', [
    {
      id: 'py-s3-p1', title: '倒序输出', difficulty: '简单', knowledge_point: '列表切片',
      description: '## 任务\n输入一行由空格分隔的整数，把它们按相反顺序输出，数字之间用一个空格分隔。\n\n## 输入格式\n一行若干整数。\n\n## 输出格式\n倒序后的整数。',
      starter_code: 'numbers = input().split()\n# TODO: 倒序输出 numbers\n', solution_code: 'numbers = input().split()\nprint(" ".join(numbers[::-1]))\n',
      test_cases: [{ input: '1 2 3 4\n', expected_output: '4 3 2 1\n' }, { input: '42\n', expected_output: '42\n' }], hints: ['`numbers[::-1]` 得到倒序列表；`" ".join(...)` 用空格拼接文字。'],
    },
    {
      id: 'py-s3-p2', title: '元音字母计数', difficulty: '简单', knowledge_point: '字符串遍历',
      description: '## 任务\n输入一个只含英文小写字母的单词，统计其中 `a e i o u` 的数量。\n\n## 输入格式\n一行一个单词。\n\n## 输出格式\n一个整数。',
      starter_code: 'word = input()\ncount = 0\n# TODO: 遍历 word，统计元音字母\nprint(count)\n', solution_code: 'word = input()\ncount = 0\nfor char in word:\n    if char in "aeiou":\n        count += 1\nprint(count)\n',
      test_cases: [{ input: 'hello\n', expected_output: '2\n' }, { input: 'rhythm\n', expected_output: '0\n' }, { input: 'aeiou\n', expected_output: '5\n' }], hints: ['`for char in word` 会逐个取出字符；`in` 可以判断字符是否在一段文字中。'],
    },
    {
      id: 'py-s3-p3', title: '求绝对值', difficulty: '简单', knowledge_point: '函数',
      description: '## 任务\n定义一个函数 `absolute(n)`：当 n 小于 0 时返回它的相反数，否则返回 n。读取一个整数并输出函数结果。\n\n## 输入格式\n一个整数。\n\n## 输出格式\n一个整数。',
      starter_code: 'def absolute(n):\n    # TODO: 在这里返回 n 的绝对值\n    pass\n\nn = int(input())\nprint(absolute(n))\n', solution_code: 'def absolute(n):\n    if n < 0:\n        return -n\n    return n\n\nn = int(input())\nprint(absolute(n))\n',
      test_cases: [{ input: '-12\n', expected_output: '12\n' }, { input: '0\n', expected_output: '0\n' }, { input: '7\n', expected_output: '7\n' }], hints: ['函数内部用 `return` 把结果交回去；`pass` 只是占位符，要替换掉。'],
    },
  ]),
];

/**
 * 每道后续题都采用与 C++ 靶场一致的教学题面：先讲这关新增的一个概念，
 * 再给出明确的输入输出，再把最常踩的坑提前说出来。
 */
function lesson(
  id: string, title: string, knowledgePoint: string, task: string, input: string,
  output: string, starterCode: string, solutionCode: string, testCases: Problem['test_cases'],
  newKnowledge: string, commonMistake: string, hints: string[], difficulty: Difficulty = '简单',
): Problem {
  return {
    id, title, difficulty, knowledge_point: knowledgePoint,
    description: `## 题目背景\n${task}\n\n## 本关新知识\n${newKnowledge}\n\n> 这一关只要求学会**一个核心动作**。不要试图一次记住所有新写法：先照着下面的步骤运行成功，再回来看每一个符号。\n\n## 题目已经帮你准备了什么\n\n右侧编辑器不是空白的。它已经有一段“代码外壳”：\n\n\`\`\`python\n${starterCode.trim()}\n\`\`\`\n\n- 以 \`#\` 开头的是**注释**，只给人看，Python 不会执行它。\n- \`# TODO\` 的意思是“待完成”：通常只需要在它附近补代码。\n- 不要把题目中的样例数字直接写死在代码里；评测会换不同的数据来测试。\n\n## 任务\n\n请只在代码里的 \`# TODO\` 附近补全代码。除非题目要求，否则不要输出“请输入……”这类提示文字。\n\n## 输入格式\n${input}\n\n## 输出格式\n${output}\n\n## 写代码前，先按顺序想\n\n1. **读入：** 输入是文字还是数字？若需要计算，是否要用 \`int()\` 或 \`float()\`？\n2. **处理：** 这题是计算、判断、重复处理，还是把一批数据逐个查看？\n3. **输出：** 最后只要输出哪个结果？数字之间、文字前后有没有空格或标点？\n4. **缩进：** 如果写了 \`if\`、\`for\` 或 \`def\`，冒号下一行必须统一缩进四个空格。\n\n## 推荐的练习方法\n\n1. 先只用第一个样例点击“运行”，确认你看懂输入和输出。\n2. 遇到报错时先读**最后一行**：它会告诉你错误种类；再看提示中的行号。\n3. “运行”成功不表示完成；请点“提交”，让所有测试用例帮你检查边界情况。\n4. 通过后，不看题解重写一次，才能真正记住。\n\n## 常见错误\n${commonMistake}`,
    starter_code: starterCode, solution_code: solutionCode, test_cases: testCases, hints,
  };
}

const existingLessonNotes: Record<string, { knowledge: string; mistake: string }> = {
  'print 输出': { knowledge: '`print(内容)` 会输出内容并自动换行。文字必须用英文引号包起来。', mistake: '漏掉引号会让 Python 把 Hello 当作变量名；不要使用中文的引号或括号。' },
  'input 与 int': { knowledge: '`input()` 得到的是文字；`int(...)` 才能把数字文字变成可计算的整数。', mistake: '直接把两个 `input()` 的结果相加会拼接文字，例如 "2" + "3" 会得到 "23"。' },
  '变量与运算': { knowledge: '等号 `=` 是“把右边结果存到左边名字里”；乘法用星号 `*`。', mistake: '变量名必须前后一致，`length` 和 `Length` 是两个不同的名字。' },
  'if 与取模': { knowledge: '`%` 是取余；`if 条件:` 后面的代码必须缩进四个空格。', mistake: '判断相等必须写 `==`，不是赋值用的 `=`；不要漏掉冒号 `:`。' },
  'for 与 range': { knowledge: '`range(开始, 结束)` 不包含结束值，所以 1 到 n 应写 `range(1, n + 1)`。', mistake: '循环体必须缩进；`range(n)` 从 0 开始而不是从 1 开始。' },
  '循环与比较': { knowledge: '列表可以交给 `max()`；也可以用循环逐个比较。', mistake: '读入的 n 只是数量，真正的数据在第二行列表中；不要输出 n 本身。' },
  '列表切片': { knowledge: '切片 `items[::-1]` 会得到倒序的新列表，`" ".join(...)` 可以用空格拼接文字。', mistake: '如果列表里是整数，先用 `map(str, numbers)` 转成文字才能 `join`。' },
  '字符串遍历': { knowledge: '`for char in word` 会把一个单词中的每个字符依次交给 `char`。', mistake: '计数变量要先设为 0，且每发现一个目标字符才加 1。' },
  '函数': { knowledge: '`def` 定义函数，`return` 把结果交给调用它的位置。', mistake: '`print` 只负责显示，不能代替 `return`；函数体也必须缩进。' },
};

// 第一阶段补足 6 题：输出 → 输入 → 数值计算 → 赋值。
PYTHON_STAGES[0].problems.push(
  lesson('py-s1-p4', '自我介绍', '字符串输入与拼接', '现在让程序认识一个人的名字和年龄：输入姓名与年龄，输出 `你好，小明！你今年 12 岁。` 这种完整句子。', '第一行一个姓名（不含空格）；第二行一个整数年龄。', '输出一行自我介绍，标点必须与样例一致。', 'name = input()\nage = int(input())\n# TODO: 输出一行自我介绍\n', 'name = input()\nage = int(input())\nprint("你好，" + name + "！你今年 " + str(age) + " 岁。")\n', [{ input: '小明\n12\n', expected_output: '你好，小明！你今年 12 岁。\n' }, { input: 'Alice\n8\n', expected_output: '你好，Alice！你今年 8 岁。\n' }], '文字和数字不能直接用 `+` 相加；先用 `str(age)` 把数字变成文字。', '不要漏掉 `str(age)`；题目要求的中文逗号、感叹号和空格都属于输出的一部分。', ['可以把固定文字、name 和 str(age) 用 `+` 连起来。'], '入门'),
  lesson('py-s1-p5', '温度换算', 'float 小数与表达式', '气象站给出摄氏温度 c，请换算为华氏温度：`f = c * 9 / 5 + 32`。', '一行一个整数或小数 c。', '输出换算后的华氏温度。Python 会把整数形式的小数显示为 `32.0`。', 'c = float(input())\n# TODO: 计算并输出 f\n', 'c = float(input())\nf = c * 9 / 5 + 32\nprint(f)\n', [{ input: '0\n', expected_output: '32.0\n' }, { input: '100\n', expected_output: '212.0\n' }, { input: '-40\n', expected_output: '-40.0\n' }], '`float()` 能读取带小数点的数据；Python 的 `/` 是小数除法。', '公式的乘除先算、加法后算；不要误写成 `9 / (5 + 32)`。', ['先把公式完整写在一行，Python 会按正确的运算优先级计算。'], '入门'),
  lesson('py-s1-p6', '交换两个数', '赋值与多重赋值', '盒子 a 里有一个数，盒子 b 里有另一个数。请交换它们，并按 `a b` 的顺序输出交换后的结果。', '一行两个整数 a、b。', '一行两个整数，中间一个空格。', 'a, b = map(int, input().split())\n# TODO: 交换 a 和 b\nprint(a, b)\n', 'a, b = map(int, input().split())\na, b = b, a\nprint(a, b)\n', [{ input: '3 5\n', expected_output: '5 3\n' }, { input: '-1 9\n', expected_output: '9 -1\n' }], 'Python 的 `a, b = b, a` 会同时完成交换，不需要临时变量。', '不要连续写 `a = b`、`b = a`，这样两个变量都会变成原来的 b。', ['把等号右边的 b、a 调换位置即可。'], '入门'),
);

// 第二阶段补足条件题；每题只增加一个判断层级。
PYTHON_STAGES[1].problems.push(
  lesson('py-s2-p4', '成绩等级', 'if / elif / else', '输入 0 到 100 的成绩：90 分及以上为 A，80 到 89 为 B，60 到 79 为 C，低于 60 为 D。', '一行一个整数成绩。', '输出一个大写字母等级。', 'score = int(input())\n# TODO: 按分数输出 A、B、C 或 D\n', 'score = int(input())\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelif score >= 60:\n    print("C")\nelse:\n    print("D")\n', [{ input: '100\n', expected_output: 'A\n' }, { input: '80\n', expected_output: 'B\n' }, { input: '59\n', expected_output: 'D\n' }], '`elif` 是“否则，如果”；条件从高到低写，满足一条后就不会继续判断。', '如果先判断 `score >= 60`，90 分也会立刻被分到 C；每个 `if/elif/else` 行末都要有冒号。', ['先判断最高等级，再逐步往下。']),
  lesson('py-s2-p5', '三位数各位之和', '整数除法与取余', '输入一个三位非负整数，例如 472。请取出百位、十位、个位并输出它们的和（4 + 7 + 2 = 13）。', '一行一个三位非负整数。', '输出各位数字之和。', 'n = int(input())\n# TODO: 拆出百位、十位、个位\n', 'n = int(input())\nhundreds = n // 100\ntens = n // 10 % 10\nones = n % 10\nprint(hundreds + tens + ones)\n', [{ input: '472\n', expected_output: '13\n' }, { input: '100\n', expected_output: '1\n' }], '`//` 是整除，`%` 是余数。个位是 `n % 10`，十位要先除以 10 再取余。', '普通 `/` 会得到小数，不能用来取数字位；十位不是 `n % 10`。', ['先写出个位，再思考“去掉个位后”的数。']),
  lesson('py-s2-p6', '简易计算器', '分支与运算符', '输入两个整数和一个运算符（`+`、`-`、`*`），输出计算结果。题目保证运算符只会是这三种。', '第一行两个整数 a、b；第二行一个运算符。', '输出运算结果。', 'a, b = map(int, input().split())\nop = input()\n# TODO: 根据 op 计算\n', 'a, b = map(int, input().split())\nop = input()\nif op == "+":\n    print(a + b)\nelif op == "-":\n    print(a - b)\nelse:\n    print(a * b)\n', [{ input: '3 4\n+\n', expected_output: '7\n' }, { input: '9 12\n-\n', expected_output: '-3\n' }, { input: '6 7\n*\n', expected_output: '42\n' }], '运算符也是文字，所以用 `op == "+"` 比较。', '不要写 `op = "+"`，这会修改 op 而不是比较；乘法符号是 `*`。', ['题目只有三种情况，前两种用 if/elif，剩下一种交给 else。']),
);

// 第三阶段补足循环闯关：累加 → 累乘 → 嵌套循环 → 提前结束。
PYTHON_STAGES[2].problems.push(
  lesson('py-s3-p4', 'n 的阶乘', 'for 循环与累乘', '输入正整数 n，输出 `1 × 2 × ... × n`。这个结果叫 n 的阶乘。', '一行一个正整数 n（不超过 12）。', '输出 n 的阶乘。', 'n = int(input())\nanswer = 1\n# TODO: 用循环不断乘上 1 到 n\nprint(answer)\n', 'n = int(input())\nanswer = 1\nfor i in range(1, n + 1):\n    answer *= i\nprint(answer)\n', [{ input: '1\n', expected_output: '1\n' }, { input: '5\n', expected_output: '120\n' }], '求和从 0 开始，求乘积必须从 1 开始；`*=` 表示“乘完再存回去”。', '把 answer 初始化为 0 会让最终结果永远是 0。', ['循环变量 i 从 1 走到 n，每次让 answer 乘 i。']),
  lesson('py-s3-p5', '打印直角三角形', '嵌套循环', '输入 n，打印 n 行星号。第 1 行 1 个，第 2 行 2 个，直到第 n 行 n 个。', '一行一个正整数 n（不超过 20）。', '输出 n 行直角三角形。', 'n = int(input())\n# TODO: 用两层循环打印图形\n', 'n = int(input())\nfor row in range(1, n + 1):\n    print("*" * row)\n', [{ input: '3\n', expected_output: '*\n**\n***\n' }, { input: '1\n', expected_output: '*\n' }], '字符串也能乘整数：`"*" * 3` 就是三个星号。每次 `print` 正好输出一行。', '不要在星号之间加空格；最后一行后自动换行没有关系。', ['本题可以不用两层循环，直接利用字符串乘法。']),
  lesson('py-s3-p6', '判断素数', '循环、break 与标志', '输入大于 1 的整数 n。若只能被 1 和自己整除，输出 `prime`，否则输出 `not prime`。', '一行一个整数 n（2 ≤ n ≤ 10000）。', '输出 `prime` 或 `not prime`。', 'n = int(input())\n# TODO: 判断 n 是否为素数\n', 'n = int(input())\nis_prime = True\nfor divisor in range(2, n):\n    if n % divisor == 0:\n        is_prime = False\n        break\nprint("prime" if is_prime else "not prime")\n', [{ input: '2\n', expected_output: 'prime\n' }, { input: '9\n', expected_output: 'not prime\n' }, { input: '97\n', expected_output: 'prime\n' }], '找到一个能整除 n 的数，就可以 `break` 结束循环；用布尔变量记住答案。', '循环要从 2 开始；把 n 自己放进检查范围会让所有数都被自己整除。', ['先假设它是素数，发现一个因数时再推翻这个假设。']),
);

// 后四阶段与 C++ 靶场一一对应：一批数据 → 函数 → 自定义信息 → 键值映射。
PYTHON_STAGES.push(
  stage(4, '第四阶段：一批数据的处理', '列表与字符串', '先把一批数据装进列表，再完成统计、查找、倒序与字符串处理。', [
    lesson('py-s4-p1', '成绩单统计', '列表与循环求和', '老师给出 n 名同学的成绩，请输出总分。', '第一行 n；第二行 n 个整数成绩。', '输出总分。', 'n = int(input())\nscores = list(map(int, input().split()))\ntotal = 0\n# TODO: 累加 scores\nprint(total)\n', 'n = int(input())\nscores = list(map(int, input().split()))\ntotal = 0\nfor score in scores:\n    total += score\nprint(total)\n', [{ input: '3\n80 90 70\n', expected_output: '240\n' }, { input: '1\n100\n', expected_output: '100\n' }], '列表能用 `for score in scores` 逐个遍历。', '不要把列表 scores 直接和整数相加；总分变量要从 0 开始。', ['逐个把 score 加到 total。']),
    lesson('py-s4-p2', '谁最高，谁最低', 'min / max', '输入 n 个整数，依次输出最大值和最小值。', '第一行 n；第二行 n 个整数。', '一行两个整数：最大值、最小值，中间空格。', 'n = int(input())\nnumbers = list(map(int, input().split()))\n# TODO: 输出最大值和最小值\n', 'n = int(input())\nnumbers = list(map(int, input().split()))\nprint(max(numbers), min(numbers))\n', [{ input: '5\n3 9 -2 9 4\n', expected_output: '9 -2\n' }, { input: '1\n7\n', expected_output: '7 7\n' }], '`max(列表)` 和 `min(列表)` 是 Python 内置工具。', '输出顺序是最大值在前；`print(a, b)` 会自动在中间加一个空格。', ['直接把 max(numbers)、min(numbers) 放进同一个 print。']),
    lesson('py-s4-p3', '点名统计', '列表计数', '输入 n 个座位上的号码和要查找的号码 x，输出 x 出现的次数。', '第一行 n；第二行 n 个整数；第三行一个整数 x。', '输出出现次数。', 'n = int(input())\nnumbers = list(map(int, input().split()))\nx = int(input())\n# TODO: 统计 x\n', 'n = int(input())\nnumbers = list(map(int, input().split()))\nx = int(input())\nprint(numbers.count(x))\n', [{ input: '5\n1 2 1 3 1\n1\n', expected_output: '3\n' }, { input: '3\n4 5 6\n7\n', expected_output: '0\n' }], '`列表.count(值)` 会统计一个值出现了几次。', 'x 要读第三行；没有出现时应输出 0，而不是报错。', ['可以使用 `numbers.count(x)`。']),
    lesson('py-s4-p4', '倒着报数', '列表倒序', '输入 n 个整数，按相反顺序输出，数字间一个空格。', '第一行 n；第二行 n 个整数。', '倒序输出的一行数字。', 'n = int(input())\nnumbers = input().split()\n# TODO: 倒序输出\n', 'n = int(input())\nnumbers = input().split()\nprint(" ".join(numbers[::-1]))\n', [{ input: '4\n1 2 3 4\n', expected_output: '4 3 2 1\n' }, { input: '2\n-1 8\n', expected_output: '8 -1\n' }], '`[::-1]` 表示从末尾向开头取；这里保留为文字即可。', '不要输出 Python 列表的方括号和引号。', ['把倒序后的列表交给空格的 join。']),
    lesson('py-s4-p5', '字符分类统计', '字符串与 isalpha / isdigit', '输入一行只含字母和数字的字符串，分别统计字母个数与数字个数。', '一行非空字符串。', '一行两个整数：字母数、数字数。', 'text = input()\nletters = 0\ndigits = 0\n# TODO: 遍历 text\nprint(letters, digits)\n', 'text = input()\nletters = 0\ndigits = 0\nfor char in text:\n    if char.isalpha():\n        letters += 1\n    elif char.isdigit():\n        digits += 1\nprint(letters, digits)\n', [{ input: 'ab12C\n', expected_output: '3 2\n' }, { input: '2026\n', expected_output: '0 4\n' }], '`char.isalpha()` 判断字母，`char.isdigit()` 判断数字。', '两种类别应分别计数；用 `elif` 避免同一字符重复计算。', ['每次循环只处理当前的 char。']),
    lesson('py-s4-p6', '回文串判断', '字符串切片与比较', '回文串正着读和倒着读相同，例如 `level`。输入一个小写单词，判断是否回文。', '一行一个小写英文单词。', '回文输出 `yes`，否则输出 `no`。', 'word = input()\n# TODO: 判断 word 是否回文\n', 'word = input()\nif word == word[::-1]:\n    print("yes")\nelse:\n    print("no")\n', [{ input: 'level\n', expected_output: 'yes\n' }, { input: 'python\n', expected_output: 'no\n' }], '倒序切片 `word[::-1]` 可直接与原字符串用 `==` 比较。', '比较要用两个等号；大小写不同会被视为不同字符。', ['先得到 word 的倒序，再和 word 比较。']),
  ]),
  stage(5, '第五阶段：化整为零', '函数', '把可复用的步骤封装为函数，逐渐习惯“输入—处理—返回结果”的思考方式。', [
    lesson('py-s5-p1', '两数最大值', '函数定义与 return', '补全函数 `bigger(a, b)`，让它返回两个整数中较大的那个数。主程序会读入并打印函数结果。', '一行两个整数。', '输出较大的整数。', 'def bigger(a, b):\n    # TODO: 返回较大值\n    pass\n\na, b = map(int, input().split())\nprint(bigger(a, b))\n', 'def bigger(a, b):\n    if a >= b:\n        return a\n    return b\n\na, b = map(int, input().split())\nprint(bigger(a, b))\n', [{ input: '3 9\n', expected_output: '9\n' }, { input: '5 5\n', expected_output: '5\n' }], '函数参数 a、b 像函数内部临时使用的变量；结果要 `return`。', '只 `print` 最大值会让函数返回 None；`return` 后不用再写 else 也可以。', ['先处理 a 大于等于 b 的情况。']),
    lesson('py-s5-p2', '函数判断素数', 'bool 返回值', '定义 `is_prime(n)`，如果 n 是素数就返回 True，否则返回 False。主程序据此输出 `yes` 或 `no`。', '一行一个整数 n（2 ≤ n ≤ 10000）。', '是素数输出 `yes`，否则输出 `no`。', 'def is_prime(n):\n    # TODO\n    pass\n\nn = int(input())\nprint("yes" if is_prime(n) else "no")\n', 'def is_prime(n):\n    for divisor in range(2, n):\n        if n % divisor == 0:\n            return False\n    return True\n\nn = int(input())\nprint("yes" if is_prime(n) else "no")\n', [{ input: '11\n', expected_output: 'yes\n' }, { input: '12\n', expected_output: 'no\n' }], '布尔值只有 True、False；函数一旦执行 `return` 就立刻结束。', '不要输出字符串 True/False，因为题目要的是 yes/no；2 的循环范围为空，但应返回 True。', ['发现一个因数就 return False；循环结束还没发现就 return True。']),
    lesson('py-s5-p3', '列表求和函数', '列表作为参数', '定义 `sum_list(numbers)`，返回列表所有数字的和。', '第一行 n；第二行 n 个整数。', '输出总和。', 'def sum_list(numbers):\n    # TODO\n    pass\n\nn = int(input())\nnumbers = list(map(int, input().split()))\nprint(sum_list(numbers))\n', 'def sum_list(numbers):\n    total = 0\n    for number in numbers:\n        total += number\n    return total\n\nn = int(input())\nnumbers = list(map(int, input().split()))\nprint(sum_list(numbers))\n', [{ input: '3\n2 4 6\n', expected_output: '12\n' }, { input: '1\n-5\n', expected_output: '-5\n' }], '参数 numbers 接收到的是完整列表，函数内部可用 for 遍历。', '不要在函数外使用函数内部的 total；它只在函数执行时存在。', ['把第四阶段的累加代码搬进函数，最后 return total。']),
    lesson('py-s5-p4', '递归求阶乘', '递归', '定义 `factorial(n)`，用函数调用自己计算 n 的阶乘。规定 `factorial(1)` 返回 1。', '一行一个正整数 n（n ≤ 10）。', '输出 n 的阶乘。', 'def factorial(n):\n    # TODO: 写出递归的终点和递归步骤\n    pass\n\nn = int(input())\nprint(factorial(n))\n', 'def factorial(n):\n    if n == 1:\n        return 1\n    return n * factorial(n - 1)\n\nn = int(input())\nprint(factorial(n))\n', [{ input: '1\n', expected_output: '1\n' }, { input: '5\n', expected_output: '120\n' }], '递归必须有“终点”（这里 n == 1），否则会无限调用自己。', '递归步骤应该让 n 变小；漏掉终点会触发 RecursionError。', ['先写 if n == 1: return 1，再写 n 乘上更小问题的答案。']),
    lesson('py-s5-p5', '平均分函数', '函数返回小数', '定义 `average(numbers)`，返回列表平均数。输入保证列表非空。', '第一行 n；第二行 n 个整数。', '输出平均数。', 'def average(numbers):\n    # TODO\n    pass\n\nn = int(input())\nnumbers = list(map(int, input().split()))\nprint(average(numbers))\n', 'def average(numbers):\n    return sum(numbers) / len(numbers)\n\nn = int(input())\nnumbers = list(map(int, input().split()))\nprint(average(numbers))\n', [{ input: '3\n60 70 80\n', expected_output: '70.0\n' }, { input: '2\n1 2\n', expected_output: '1.5\n' }], '`sum` 求和，`len` 求长度，`/` 得到小数。', '不要用 `//`，那会丢掉小数部分；题目保证 n 不为 0。', ['平均数就是总和除以数量。']),
    lesson('py-s5-p6', '首字母大写', '字符串方法与函数', '定义 `greet(name)`，返回 `Hello, Name!`，其中 name 的第一个字母要大写。', '一行一个英文小写名字。', '输出问候语。', 'def greet(name):\n    # TODO\n    pass\n\nname = input()\nprint(greet(name))\n', 'def greet(name):\n    return "Hello, " + name.capitalize() + "!"\n\nname = input()\nprint(greet(name))\n', [{ input: 'alice\n', expected_output: 'Hello, Alice!\n' }, { input: 'bob\n', expected_output: 'Hello, Bob!\n' }], '`capitalize()` 会把字符串首字母变大写。', '方法调用需要括号：`name.capitalize()`；固定文字的空格和感叹号也要保留。', ['先返回固定的 "Hello, "，再连接处理后的名字。']),
  ]),
  stage(6, '第六阶段：给数据贴标签', '字典 dict', '字典用“键 → 值”保存信息，是 Python 中对应 C++ map 的基础工具。', [
    lesson('py-s6-p1', '学生名片', 'dict 创建与读取', '输入学生姓名和年龄，存进字典后输出 `姓名：小明，年龄：12`。', '第一行姓名；第二行整数年龄。', '按题目指定格式输出一行。', 'name = input()\nage = int(input())\n# TODO: 创建 student 字典并输出\n', 'name = input()\nage = int(input())\nstudent = {"name": name, "age": age}\nprint("姓名：" + student["name"] + "，年龄：" + str(student["age"]))\n', [{ input: '小明\n12\n', expected_output: '姓名：小明，年龄：12\n' }, { input: 'Alice\n8\n', expected_output: '姓名：Alice，年龄：8\n' }], '字典写作 `{键: 值}`，用 `student["name"]` 按键取值。', '键 name 是文字，必须带引号；年龄是数字，拼接前要用 str 转文字。', ['先创建 `{"name": name, "age": age}`。']),
    lesson('py-s6-p2', '数字出现次数', 'dict 计数', '输入 n 个整数，输出其中数字 x 出现的次数。请用字典记录每个数字出现次数。', '第一行 n；第二行 n 个整数；第三行查询整数 x。', '输出 x 出现次数。', 'n = int(input())\nnumbers = list(map(int, input().split()))\nx = int(input())\ncounts = {}\n# TODO: 统计 counts\n', 'n = int(input())\nnumbers = list(map(int, input().split()))\nx = int(input())\ncounts = {}\nfor number in numbers:\n    counts[number] = counts.get(number, 0) + 1\nprint(counts.get(x, 0))\n', [{ input: '5\n1 2 1 3 1\n1\n', expected_output: '3\n' }, { input: '3\n4 5 6\n7\n', expected_output: '0\n' }], '`dict.get(key, 默认值)` 在键不存在时给默认值；这是安全计数的常用写法。', '第一次遇到数字时字典里还没有这个键，不能直接 `counts[number] + 1`。', ['每读到一个 number，就让它目前的次数加 1。']),
    lesson('py-s6-p3', '单词计数', '字符串与 dict', '输入一行由空格分开的英文单词，输出不同单词的数量。', '一行一个或多个英文单词，以单个空格分隔。', '输出不同单词的个数。', 'words = input().split()\n# TODO: 用字典或集合记录单词\n', 'words = input().split()\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nprint(len(counts))\n', [{ input: 'cat dog cat\n', expected_output: '2\n' }, { input: 'one\n', expected_output: '1\n' }], '字典的键不能重复，所以 `len(counts)` 就是不同单词数量。', '不要输出总单词数 `len(words)`，重复单词只能算一次。', ['即使只关心数量，也可以先给每个单词计数。']),
    lesson('py-s6-p4', '成绩查找表', '按键查找', '输入 n 名同学的“姓名 成绩”，再输入一个要查询的姓名。若存在输出成绩，不存在输出 `not found`。', '第一行 n；接着 n 行每行姓名与整数成绩；最后一行查询姓名。', '成绩或 `not found`。', 'n = int(input())\nscores = {}\n# TODO: 读入 n 条记录\nquery = input()\n# TODO: 查询并输出\n', 'n = int(input())\nscores = {}\nfor _ in range(n):\n    name, score = input().split()\n    scores[name] = int(score)\nquery = input()\nif query in scores:\n    print(scores[query])\nelse:\n    print("not found")\n', [{ input: '2\nAlice 90\nBob 80\nBob\n', expected_output: '80\n' }, { input: '1\nTom 100\nAmy\n', expected_output: 'not found\n' }], '`key in dictionary` 能判断键是否存在；`for _ in range(n)` 中下划线表示不需要循环编号。', '直接访问不存在的 `scores[query]` 会报 KeyError，先判断或使用 get。', ['每一行先 split 成 name 和 score，再把 score 转 int。']),
    lesson('py-s6-p5', '第一个只出现一次的字符', '计数后再遍历', '输入一个小写字符串，找第一个只出现一次的字符；若没有则输出 `none`。', '一行一个小写英文字符串。', '第一个只出现一次的字符或 `none`。', 'text = input()\n# TODO: 先统计，再按原顺序查找\n', 'text = input()\ncounts = {}\nfor char in text:\n    counts[char] = counts.get(char, 0) + 1\nfor char in text:\n    if counts[char] == 1:\n        print(char)\n        break\nelse:\n    print("none")\n', [{ input: 'aabbcddee\n', expected_output: 'c\n' }, { input: 'aabb\n', expected_output: 'none\n' }], '第一轮统计次数，第二轮保持原字符串顺序查找；`for ... else` 的 else 在没有 break 时运行。', '遍历字典本身不一定是“原字符串顺序”；必须第二次遍历 text。', ['计数字典写好后，用第二个 for 找 counts[char] == 1。']),
    lesson('py-s6-p6', '出现最多的数字', '字典计数与最值', '输入 n 个整数。输出出现次数最多的数字；若有多个，输出数值较小的那个。', '第一行 n；第二行 n 个整数。', '输出一个整数。', 'n = int(input())\nnumbers = list(map(int, input().split()))\n# TODO\n', 'n = int(input())\nnumbers = list(map(int, input().split()))\ncounts = {}\nfor number in numbers:\n    counts[number] = counts.get(number, 0) + 1\nbest = min(counts)\nfor number in counts:\n    if counts[number] > counts[best] or (counts[number] == counts[best] and number < best):\n        best = number\nprint(best)\n', [{ input: '5\n2 1 2 1 2\n', expected_output: '2\n' }, { input: '4\n5 3 5 3\n', expected_output: '3\n' }], '比较“更好”时，要同时考虑次数和并列时的数值大小。', '不要只在次数相等时随便保留第一个；题目明确要求较小数字。', ['先得到每个数的次数，再维护目前最佳的 best。']),
  ]),
  stage(7, '第七阶段：综合闯关', '排序、列表与字典综合', '把前面学过的输入、判断、循环、列表、函数和字典连起来解决小问题。', [
    lesson('py-s7-p1', '排序后的中位数', 'sort 与下标', '输入奇数个整数，排序后输出正中间的数。', '第一行奇数 n；第二行 n 个整数。', '输出中位数。', 'n = int(input())\nnumbers = list(map(int, input().split()))\n# TODO: 排序后输出中位数\n', 'n = int(input())\nnumbers = list(map(int, input().split()))\nnumbers.sort()\nprint(numbers[n // 2])\n', [{ input: '5\n9 1 5 3 7\n', expected_output: '5\n' }, { input: '3\n-1 -9 2\n', expected_output: '-1\n' }], '`list.sort()` 会原地从小到大排序；长度为 n 的中点下标是 `n // 2`。', '排序前的中间位置不一定是中位数；下标从 0 开始。', ['先 sort，再取 numbers[n // 2]。']),
    lesson('py-s7-p2', '两数之和', '边查边找', '输入 n 个整数和目标值 target。找到任意两个不同位置的数，使其和为 target，输出它们的两个下标（从 0 开始）；保证有唯一答案。', '第一行 n；第二行 n 个整数；第三行 target。', '输出两个下标，较早出现的下标在前。', 'n = int(input())\nnumbers = list(map(int, input().split()))\ntarget = int(input())\n# TODO\n', 'n = int(input())\nnumbers = list(map(int, input().split()))\ntarget = int(input())\nseen = {}\nfor index, number in enumerate(numbers):\n    need = target - number\n    if need in seen:\n        print(seen[need], index)\n        break\n    seen[number] = index\n', [{ input: '4\n2 7 11 15\n9\n', expected_output: '0 1\n' }, { input: '3\n3 2 4\n6\n', expected_output: '1 2\n' }], '`enumerate(numbers)` 同时给出下标和数值；字典 seen 记录已经看过的数。', '要先检查 need 是否已经出现，再把当前数放进 seen，避免同一个位置被使用两次。', ['当前 number 需要的伙伴是 target - number。']),
    lesson('py-s7-p3', '删除重复但保留顺序', '集合与顺序', '输入一行整数，删除后面重复出现的数，但保留它们第一次出现的顺序。', '一行一个或多个整数。', '输出去重后的数字，空格分隔。', 'numbers = list(map(int, input().split()))\n# TODO\n', 'numbers = list(map(int, input().split()))\nseen = set()\nanswer = []\nfor number in numbers:\n    if number not in seen:\n        seen.add(number)\n        answer.append(number)\nprint(*answer)\n', [{ input: '1 2 1 3 2\n', expected_output: '1 2 3\n' }, { input: '5 5 5\n', expected_output: '5\n' }], '`set` 擅长快速判断是否见过；`print(*answer)` 会把列表元素用空格输出。', '只用 `set(numbers)` 会丢掉首次出现顺序；要同时维护 answer 列表。', ['没见过才 add 到 seen，也 append 到 answer。']),
    lesson('py-s7-p4', '词频最高的单词', '字典综合统计', '输入一行英文单词，输出出现最多的单词；并列时输出字典序更小的单词。', '一行一个或多个小写英文单词。', '输出一个单词。', 'words = input().split()\n# TODO\n', 'words = input().split()\ncounts = {}\nfor word in words:\n    counts[word] = counts.get(word, 0) + 1\nbest = min(counts)\nfor word in counts:\n    if counts[word] > counts[best] or (counts[word] == counts[best] and word < best):\n        best = word\nprint(best)\n', [{ input: 'cat dog cat dog dog\n', expected_output: 'dog\n' }, { input: 'bee ant bee ant\n', expected_output: 'ant\n' }], '字符串可直接用 `<` 比较字典序；统计模式和“最高频数字”相同。', '并列规则不能忽略；字典序是按字母比较，不是单词长度。', ['先完成 counts，再复用“best”比较逻辑。']),
    lesson('py-s7-p5', '小型成绩报告', '综合统计', '输入 n 个成绩，输出三行：总分、最高分、平均分。平均分可直接输出 Python 的计算结果。', '第一行 n；第二行 n 个整数。', '依次输出总分、最高分、平均分，每项一行。', 'n = int(input())\nscores = list(map(int, input().split()))\n# TODO\n', 'n = int(input())\nscores = list(map(int, input().split()))\nprint(sum(scores))\nprint(max(scores))\nprint(sum(scores) / len(scores))\n', [{ input: '3\n60 70 80\n', expected_output: '210\n80\n70.0\n' }, { input: '2\n1 2\n', expected_output: '3\n2\n1.5\n' }], '同一份列表可以多次使用 `sum`、`max`、`len`；print 三次就是三行。', '不要把三项写在一个 print 里；输出格式要求每项单独一行。', ['先算总分；平均分可用总分除以 n。']),
    lesson('py-s7-p6', '闯关总结：密码检查', '函数、循环与条件综合', '输入一段密码。长度至少 8、同时含字母和数字时输出 `strong`，否则输出 `weak`。', '一行一个不含空格的密码。', '输出 `strong` 或 `weak`。', 'password = input()\n# TODO: 判断长度、字母和数字\n', 'password = input()\nhas_letter = False\nhas_digit = False\nfor char in password:\n    if char.isalpha():\n        has_letter = True\n    elif char.isdigit():\n        has_digit = True\nif len(password) >= 8 and has_letter and has_digit:\n    print("strong")\nelse:\n    print("weak")\n', [{ input: 'abc12345\n', expected_output: 'strong\n' }, { input: 'abcdefg\n', expected_output: 'weak\n' }, { input: '12345678\n', expected_output: 'weak\n' }], '`and` 需要左右条件都为真；布尔变量记录“是否曾经看到过”某类字符。', '长度够不代表合格，必须同时检查字母和数字；不要把 `and` 写成 `or`。', ['准备 has_letter 和 has_digit，遍历密码后再做一次总判断。']),
  ]),
);

// 早期 9 题也补齐“新知识 / 动手前 / 常见错误”区，让题面阅读体验保持一致。
for (const stageData of PYTHON_STAGES.slice(0, 3)) {
  for (const problem of stageData.problems) {
    const note = existingLessonNotes[problem.knowledge_point];
    if (!note) continue;
    problem.description += `\n\n## 本关新知识\n${note.knowledge}\n\n## 零基础写题步骤\n\n1. 先在右侧找到 \`# TODO\`：以 \`#\` 开头的注释不用删，它只是给你指路。\n2. 先用第一个样例点击“运行”。标准输入框里的数字不是代码的一部分，而是程序运行时收到的数据。\n3. 输出区只应出现题目要求的结果；不要额外输出“答案”“结果”等中文提示。\n4. 确认样例正确后再点击“提交”。提交会换其他数据测试，所以不要把样例数字写进代码。\n\n## 动手前先想一想\n- 输入得到的是文字还是整数？需要 \`int()\` 吗？\n- 变量名是否前后一致？Python 区分大小写，\`Age\` 和 \`age\` 不是同一个名字。\n- 如果写了 \`if\`、\`for\` 或 \`def\`，冒号后面的代码是否统一缩进四个空格？\n- 题目要求的空格、大小写和换行是否完全一致？\n\n## 常见错误\n${note.mistake}`;
  }
}

export interface PythonProblemEntry { problem: Problem; stage: StageData; indexInStage: number; globalIndex: number }
export const PYTHON_PROBLEMS: PythonProblemEntry[] = PYTHON_STAGES.flatMap((item) => item.problems.map((problem, indexInStage) => ({ problem, stage: item, indexInStage, globalIndex: 0 })));
PYTHON_PROBLEMS.forEach((entry, globalIndex) => { entry.globalIndex = globalIndex; });
const byId = new Map(PYTHON_PROBLEMS.map((entry) => [entry.problem.id, entry]));

export const PYTHON_DIFFICULTY_COLOR: Record<Difficulty, string> = { 入门: 'green', 简单: 'blue', 中等: 'orange' };
export function getPythonProblemEntry(id?: string) { return id ? byId.get(id) ?? null : null; }
export function getPythonStage(number: number) { return PYTHON_STAGES.find((item) => item.stage === number) ?? null; }
export function getPythonNeighbours(id: string) { const entry = byId.get(id); return { prev: entry ? PYTHON_PROBLEMS[entry.globalIndex - 1] ?? null : null, next: entry ? PYTHON_PROBLEMS[entry.globalIndex + 1] ?? null : null }; }
export function isPythonProblemUnlocked(id: string, completed: string[], unlockAll = false) { const entry = byId.get(id); return Boolean(unlockAll || (entry && (entry.globalIndex === 0 || completed.includes(PYTHON_PROBLEMS[entry.globalIndex - 1].problem.id)))); }
export function getPythonProblemStatus(id: string, completed: string[], attempted: string[]): ProblemStatus { return completed.includes(id) ? 'passed' : attempted.includes(id) ? 'failed' : 'todo'; }
export function getPythonStats(completed: string[], attempted: string[]) { const passed = PYTHON_PROBLEMS.filter((entry) => completed.includes(entry.problem.id)).length; const failed = PYTHON_PROBLEMS.filter((entry) => !completed.includes(entry.problem.id) && attempted.includes(entry.problem.id)).length; const total = PYTHON_PROBLEMS.length; return { total, passed, failed, percent: total ? Math.round(passed / total * 100) : 0 }; }
