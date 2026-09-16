import type { Difficulty, Problem, ProblemStatus, StageData } from '../types/problem';

/**
 * Java 题库原始数据（题目内容本身）。
 *
 * 与 C++ / Python 靶场保持一致：数据只在这里维护，
 * 阶段划分与查询辅助函数放在文件末尾（JAVA_STAGES / JAVA_PROBLEM_ENTRIES 等）。
 */
const JAVA_PROBLEMS_DATA: Problem[] = [
  { id: 'java-1', title: '你好，Java', difficulty: '入门', knowledge_point: '类、main 与输出', description: '## 任务\n输出 `Hello, Java!`。\n\n## 本关新知识\nJava 代码必须放在类里；题目要求类名固定为 `Main`。程序从 `public static void main(String[] args)` 开始执行。`System.out.println(...)` 会输出一行文字；每句末尾必须写英文分号 `;`。\n\n## 你该改哪里\n只把 `// TODO` 那一行替换为输出语句，保留类名、main 方法和大括号。\n\n## 常见错误\n- `System.out.println` 区分大小写。\n- 文字必须使用英文双引号。\n- 不要删除分号或右大括号。', starter_code: 'public class Main {\n    public static void main(String[] args) {\n        // TODO: 输出 Hello, Java!\n    }\n}\n', solution_code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Java!");\n    }\n}\n', test_cases: [{ input: '', expected_output: 'Hello, Java!\n' }], hints: ['使用 System.out.println("Hello, Java!");'] },
  { id: 'java-2', title: '两数相加', difficulty: '入门', knowledge_point: 'Scanner 与整数', description: '## 任务\n读入两个整数，输出它们的和。\n\n## 本关新知识\n`Scanner scanner = new Scanner(System.in);` 准备输入工具。每次 `scanner.nextInt()` 读一个整数。输入 `3 5` 后，a 是 3，b 是 5，输出 a + b 就是 8。\n\n## 常见错误\n- `System.out.println("a + b")` 只会输出文字；表达式不能加引号。\n- 变量 a、b 已经读好，只需计算并输出。', starter_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        // TODO: 输出 a 和 b 的和\n    }\n}\n', solution_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int a = scanner.nextInt();\n        int b = scanner.nextInt();\n        System.out.println(a + b);\n    }\n}\n', test_cases: [{ input: '3 5\n', expected_output: '8\n' }], hints: ['写 System.out.println(a + b);'] },
  { id: 'java-3', title: '长方形面积', difficulty: '入门', knowledge_point: '变量与乘法', description: '## 任务\n读入长方形的长和宽，输出面积。\n\n## 本关新知识\n变量名不一定只能叫 a、b。`length` 和 `width` 分别表示长与宽，名字清楚时更容易读懂程序。Java 中乘法使用星号 `*`，面积等于 `length * width`。\n\n输入 `4 6` 后：length 是 4，width 是 6，因此输出 24。\n\n## 常见错误\n- 键盘上输入 `*`，不要使用数学乘号 `×`。\n- `System.out.println("length * width")` 只会输出文字；表达式不能放在引号中。\n- Scanner 已经读好两个数，只需使用它们。', starter_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int length = scanner.nextInt();\n        int width = scanner.nextInt();\n        // TODO: 输出面积\n    }\n}\n', solution_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int length = scanner.nextInt();\n        int width = scanner.nextInt();\n        System.out.println(length * width);\n    }\n}\n', test_cases: [{ input: '4 6\n', expected_output: '24\n' }], hints: ['写 System.out.println(length * width);'] },
  { id: 'java-4', title: '判断奇偶', difficulty: '入门', knowledge_point: 'if、else 与取余', description: '## 任务\n读入一个整数；偶数输出 `even`，奇数输出 `odd`。\n\n## 本关新知识\n`n % 2` 是 n 除以 2 的余数。余数为 0 就是偶数。Java 的判断写作 `if (条件) { ... } else { ... }`；圆括号包住条件，大括号包住对应代码。\n\n## 样例推演\n输入 7 时，`7 % 2` 是 1，所以条件 `n % 2 == 0` 不成立，程序走到 else，输出 odd。\n\n## 常见错误\n- 判断相等使用两个等号 `==`，单个 `=` 是赋值。\n- Java 的 if 条件必须放在圆括号里。\n- if 和 else 的大括号要成对。', starter_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        // TODO: 判断 n 是奇数还是偶数\n    }\n}\n', solution_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        if (n % 2 == 0) {\n            System.out.println("even");\n        } else {\n            System.out.println("odd");\n        }\n    }\n}\n', test_cases: [{ input: '7\n', expected_output: 'odd\n' }], hints: ['先写 if (n % 2 == 0)，再分别输出 even 和 odd。'] },
  { id: 'java-5', title: '1 到 n 的和', difficulty: '简单', knowledge_point: 'for 循环与累加', description: '## 任务\n读入正整数 n，输出 `1 + 2 + ... + n`。\n\n## 本关新知识\n`for (int i = 1; i <= n; i++)` 表示：i 从 1 开始；只要 i 不大于 n 就继续；每轮结束后 i 加 1。`sum += i` 是 `sum = sum + i` 的简写。\n\n## 样例推演\n输入 3 时，sum 先是 0；依次加 1、2、3，最终变为 6。\n\n## 常见错误\n- 累加变量必须从 0 开始。\n- 条件要写 `i <= n`，否则会漏掉 n。\n- Java 的 for 循环三个部分之间用英文分号隔开。', starter_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int sum = 0;\n        // TODO: 用 for 循环累加 1 到 n\n        System.out.println(sum);\n    }\n}\n', solution_code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int n = scanner.nextInt();\n        int sum = 0;\n        for (int i = 1; i <= n; i++) {\n            sum += i;\n        }\n        System.out.println(sum);\n    }\n}\n', test_cases: [{ input: '5\n', expected_output: '15\n' }], hints: ['循环从 1 开始，每轮 sum += i。'] },
];

/* ------------------------------------------------------------------ */
/* 阶段划分与查询辅助（与 C++ / Python 靶场的结构保持一致）             */
/* ------------------------------------------------------------------ */

/** 按 id 取题目；找不到直接抛错，避免题库被改坏后静默出错 */
function javaProblemOf(id: string): Problem {
  const found = JAVA_PROBLEMS_DATA.find((item) => item.id === id);
  if (!found) throw new Error(`Java 题库里找不到题目：${id}`);
  return found;
}

export const JAVA_STAGES: StageData[] = [
  {
    stage: 1,
    title: '阶段一 · 类与变量',
    subtitle: 'main 方法、输出与输入',
    summary:
      'Java 的程序必须写在类里面，入口是固定的 `public static void main(String[] args)`。这一阶段先认识这个固定外壳，再学会用 `System.out.println` 输出、用 `Scanner` 读入整数、用变量保存并计算数据。',
    problems: [
      javaProblemOf('java-1'),
      javaProblemOf('java-2'),
      javaProblemOf('java-3'),
    ],
  },
  {
    stage: 2,
    title: '阶段二 · 判断与循环',
    subtitle: 'if / else 与 for',
    summary:
      '有了变量之后，程序要学会"看情况办事"和"重复做事"：`if (条件) { ... } else { ... }` 让程序分岔，`for (int i = 1; i <= n; i++)` 让程序把同一段代码跑很多遍。',
    problems: [javaProblemOf('java-4'), javaProblemOf('java-5')],
  },
];

export interface JavaProblemEntry {
  problem: Problem;
  stage: StageData;
  /** 在阶段内的序号，从 0 开始 */
  indexInStage: number;
  /** 在全部题目中的序号，从 0 开始（用于顺序解锁） */
  globalIndex: number;
}

export const JAVA_PROBLEM_ENTRIES: JavaProblemEntry[] = JAVA_STAGES.flatMap(
  (stage) =>
    stage.problems.map((problem, indexInStage) => ({
      problem,
      stage,
      indexInStage,
      globalIndex: 0,
    })),
);
JAVA_PROBLEM_ENTRIES.forEach((entry, index) => {
  entry.globalIndex = index;
});

const javaById = new Map(
  JAVA_PROBLEM_ENTRIES.map((entry) => [entry.problem.id, entry]),
);

export const JAVA_DIFFICULTY_COLOR: Record<Difficulty, string> = {
  入门: 'green',
  简单: 'blue',
  中等: 'orange',
};

export function getJavaProblemEntry(id?: string): JavaProblemEntry | null {
  return id ? javaById.get(id) ?? null : null;
}

export function getJavaStage(number: number): StageData | null {
  return JAVA_STAGES.find((item) => item.stage === number) ?? null;
}

export function getJavaStageEntries(number: number): JavaProblemEntry[] {
  return JAVA_PROBLEM_ENTRIES.filter((entry) => entry.stage.stage === number);
}

export function getJavaNeighbours(id: string): {
  prev: JavaProblemEntry | null;
  next: JavaProblemEntry | null;
} {
  const entry = javaById.get(id);
  if (!entry) return { prev: null, next: null };
  return {
    prev: JAVA_PROBLEM_ENTRIES[entry.globalIndex - 1] ?? null,
    next: JAVA_PROBLEM_ENTRIES[entry.globalIndex + 1] ?? null,
  };
}

/** 做题顺序固定为「通过上一题才解锁下一题」；开发者模式可解锁全部 */
export function isJavaProblemUnlocked(
  id: string,
  completed: string[],
  unlockAll = false,
): boolean {
  if (unlockAll) return true;
  const entry = javaById.get(id);
  if (!entry) return false;
  if (entry.globalIndex === 0) return true;
  return completed.includes(JAVA_PROBLEM_ENTRIES[entry.globalIndex - 1].problem.id);
}

export function getJavaProblemStatus(
  id: string,
  completed: string[],
  attempted: string[],
): ProblemStatus {
  if (completed.includes(id)) return 'passed';
  if (attempted.includes(id)) return 'failed';
  return 'todo';
}

export function getJavaStats(completed: string[], attempted: string[]) {
  const total = JAVA_PROBLEM_ENTRIES.length;
  const passed = JAVA_PROBLEM_ENTRIES.filter((entry) =>
    completed.includes(entry.problem.id),
  ).length;
  const failed = JAVA_PROBLEM_ENTRIES.filter(
    (entry) =>
      !completed.includes(entry.problem.id) &&
      attempted.includes(entry.problem.id),
  ).length;
  return {
    total,
    passed,
    failed,
    todo: total - passed - failed,
    percent: total === 0 ? 0 : Math.round((passed / total) * 100),
  };
}

/**
 * 兼容旧用法：题库校验脚本（scripts/validate-java-problems.mjs）
 * 直接遍历这份题目数组。
 */
export const JAVA_PROBLEMS: Problem[] = JAVA_PROBLEMS_DATA;
