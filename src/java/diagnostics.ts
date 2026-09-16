import type { BeginnerTip } from '../compiler/diagnostics';
import { findFullwidthPunctuation } from '../compiler/diagnostics';

/** 从 javac / java 的报错里取出第一个行号 */
function lineOf(output: string): number | undefined {
  const match = /Main\.java:(\d+):/.exec(output);
  return match ? Number(match[1]) : undefined;
}

/**
 * 把 Java 编译器与运行时的常见报错，翻译成零基础也能照做的检查步骤。
 */
export function javaBeginnerTips(code: string, output: string): BeginnerTip[] {
  const tips: BeginnerTip[] = [];
  const line = lineOf(output);

  // 1) 中文标点：和 C++ 一样的头号坑（Java 同样只认英文半角符号）
  const fullwidth = findFullwidthPunctuation(code);
  if (fullwidth.length > 0) {
    const first = fullwidth[0];
    tips.push({
      title: `检测到 ${fullwidth.length} 处中文标点，Java 只认英文半角符号`,
      detail: fullwidth
        .slice(0, 3)
        .map((item) => `第 ${item.line} 行第 ${item.column} 列：${item.char} → ${item.suggestion}`)
        .join('\n'),
      line: first.line,
    });
  }

  // 2) 少分号 / 括号不配对
  if (/';' expected|expected '\)'|expected '\}'|illegal start of expression|reached end of file while parsing/.test(output)) {
    const braceProblem = /reached end of file while parsing|expected '\}'/.test(output);
    tips.push({
      title: braceProblem ? '大括号没有配对（少了一个 }）' : '这一行的标点写错了，通常是漏了英文分号 ;',
      detail: braceProblem
        ? '数一下 { 和 } 是否一样多：public class Main 和 main 方法各需要一对大括号。'
        : 'Java 每一条语句末尾都要有英文分号 ;（类声明、方法声明后面不用写）。重点检查报错行和它的上一行。',
      line,
    });
  }

  // 3) 不认识的名字：大小写、拼写、忘了 import
  const symbol = /cannot find symbol[\s\S]*?symbol:\s*(?:class|variable|method)\s+([A-Za-z_][A-Za-z0-9_]*)/.exec(output)?.[1];
  if (symbol) {
    if (symbol === 'Scanner') {
      tips.push({
        title: '用了 Scanner，但没有 import',
        detail: '文件最上面要写 import java.util.Scanner;（注意分号，以及 Scanner 的首字母大写）。',
        line,
      });
    } else if (symbol === 'println' || symbol === 'out' || symbol === 'System') {
      tips.push({
        title: `编译器不认识 ${symbol}`,
        detail: '输出必须是 System.out.println(...)：System 和 out 首字母小写，println 的 l 是字母 L，不是数字 1。',
        line,
      });
    } else {
      tips.push({
        title: `编译器不认识名字 ${symbol}`,
        detail: '常见原因：拼写错误、大小写不一致（Java 区分大小写，Score 和 score 是两个名字）、变量没有先声明就使用。',
        line,
      });
    }
  }

  // 4) 类型不匹配
  if (/incompatible types|cannot be converted/.test(output)) {
    tips.push({
      title: '类型对不上（例如把小数赋给整数变量）',
      detail: '整数用 int，小数用 double；文字用 String。需要转换时可以用 (int) 强制转换或 Integer.parseInt(...)。',
      line,
    });
  }

  // 5) 静态上下文里调用了非静态成员
  if (/non-static (variable|method)/.test(output)) {
    tips.push({
      title: '在 main 里直接用了非静态的变量或方法',
      detail: 'main 是 static 的，只能直接使用 static 的成员。初学阶段最简单的做法：把要用的变量和方法也加上 static。',
      line,
    });
  }

  // 6) 运行时异常
  if (/Exception in thread|at Main\.main/.test(output)) {
    if (/NumberFormatException/.test(output)) {
      tips.push({
        title: '把不能转换的文字当成数字了',
        detail: 'Integer.parseInt("abc") 会失败；确认读入的确实是数字。',
      });
    } else if (/NoSuchElementException|InputMismatchException/.test(output)) {
      tips.push({
        title: '输入数据不够，或者类型和 nextInt() 对不上',
        detail: '检查 scanner.nextInt() 调了几次；在“标准输入”框里按题目的输入格式补足数据。',
      });
    } else if (/ArrayIndexOutOfBounds/.test(output)) {
      tips.push({
        title: '数组下标越界',
        detail: 'Java 的数组下标从 0 开始，长度是 n 的数组，合法下标是 0 ~ n-1。',
      });
    } else {
      tips.push({
        title: '程序运行时抛出了异常',
        detail: '看报错里第一个 Main.java 的行号，那一行就是出问题的地方。',
      });
    }
  }

  return tips;
}
