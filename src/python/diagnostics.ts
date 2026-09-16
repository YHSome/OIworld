import type { BeginnerTip } from '../compiler/diagnostics';

function lineOf(output: string): number | undefined {
  const match = /line (\d+)/.exec(output);
  return match ? Number(match[1]) : undefined;
}

/** 把 Python 解释器常见报错译成零基础可执行的检查步骤。 */
export function pythonBeginnerTips(code: string, output: string): BeginnerTip[] {
  const tips: BeginnerTip[] = [];
  const line = lineOf(output);
  if (/IndentationError|TabError/.test(output)) {
    tips.push({ title: '缩进不一致：Python 用缩进决定代码归属', detail: 'if、for、def 后面的一组代码要统一向右缩进四个空格。不要把 Tab 和手打空格混在同一段代码里。重点检查报错行和它前一行。', line });
  }
  if (/SyntaxError/.test(output)) {
    const colonHint = /expected ':'|invalid syntax/.test(output) && /^(\s*)(if|elif|else|for|while|def)\b/m.test(code);
    tips.push({ title: colonHint ? '可能漏了英文冒号 :' : '这一行的写法不符合 Python 语法', detail: colonHint ? 'if、elif、else、for、while、def 这些行的末尾都必须有英文冒号 :。再检查括号和英文引号是否成对。' : '检查报错行附近是否漏了英文括号、引号或冒号；中文标点看起来相似，但 Python 不认识。', line });
  }
  const name = /NameError: name ['"]([^'"]+)['"] is not defined/.exec(output)?.[1];
  if (name) tips.push({ title: `Python 不认识名字 ${name}`, detail: '先检查是否拼错、大小写是否一致；变量必须在使用前先赋值。Python 区分大小写，Score 和 score 是两个不同的名字。', line });
  if (/TypeError: can only concatenate str/.test(output)) {
    tips.push({ title: '文字和数字不能直接用 + 拼接', detail: '要把数字放进一句文字时，先用 str(数字) 转成文字；要计算输入的数字时，先用 int(input()) 转成整数。', line });
  }
  if (/EOFError/.test(output)) {
    tips.push({ title: '程序想读输入，但标准输入里的数据不够', detail: '检查 input() 写了几次；在“标准输入”框按题目输入格式补足每一行数据。提交时题库会自动提供输入。', line });
  }
  return tips;
}
