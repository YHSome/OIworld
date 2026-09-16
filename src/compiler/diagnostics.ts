/**
 * 把 clang 的诊断输出解析成结构化信息，便于：
 *  - 在 Monaco 编辑器里打红点（错误标记）；
 *  - 在结果面板里高亮行号。
 */

export type DiagnosticSeverity = 'error' | 'warning' | 'info';

export interface Diagnostic {
  file: string;
  line: number;
  column: number;
  severity: DiagnosticSeverity;
  message: string;
  /** 原始整行文本 */
  raw: string;
}

const DIAGNOSTIC_RE =
  /^(.*?):(\d+):(\d+):\s*(fatal error|error|warning|note):\s*(.*)$/;

const SEVERITY_MAP: Record<string, DiagnosticSeverity> = {
  error: 'error',
  'fatal error': 'error',
  warning: 'warning',
  note: 'info',
};

/** 解析 clang 诊断文本（stderr + lld 输出） */
export function parseDiagnostics(output: string): Diagnostic[] {
  if (!output) return [];
  const result: Diagnostic[] = [];
  for (const raw of output.split(/\r?\n/)) {
    const match = DIAGNOSTIC_RE.exec(raw.trim());
    if (!match) continue;
    const [, file, line, column, severity, message] = match;
    result.push({
      file: file.replace(/^\.\//, ''),
      line: Number(line),
      column: Number(column),
      severity: SEVERITY_MAP[severity] ?? 'info',
      message,
      raw: raw.trim(),
    });
  }
  return result;
}

/** 取第一条错误信息，用于简洁的顶部提示 */
export function firstErrorMessage(output: string): string | null {
  const diagnostics = parseDiagnostics(output);
  const error = diagnostics.find((d) => d.severity === 'error');
  if (error) {
    return `第 ${error.line} 行第 ${error.column} 列：${error.message}`;
  }
  const text = output.trim();
  if (!text) return null;
  return text.split(/\r?\n/)[0];
}

/** 规整编译器输出：去掉每行行尾空白与首尾空行（保留 clang 的源码片段与 ^ 指示） */
export function cleanCompilerOutput(output: string): string {
  return output
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '');
}

/* ------------------------------------------------------------------ */
/* 新手友好提示                                                        */
/* ------------------------------------------------------------------ */

export interface BeginnerTip {
  /** 一句话结论 */
  title: string;
  /** 具体怎么改 */
  detail: string;
  /** 相关行号（若已定位到） */
  line?: number;
}

/** 中文全角标点 → 对应的英文半角写法 */
const FULLWIDTH_PUNCTUATION: Record<string, string> = {
  '；': ';',
  '，': ',',
  '：': ':',
  '（': '(',
  '）': ')',
  '【': '[',
  '】': ']',
  '“': '"',
  '”': '"',
  '‘': "'",
  '’': "'",
  '。': '.',
  '？': '?',
  '！': '!',
  '《': '<',
  '》': '>',
};

/**
 * 去掉注释与字符串字面量，只留下"代码本身"。
 * 字符串里的中文标点是合法的（例如 cout << "你好，世界"），不能误报。
 */
function stripCommentsAndStrings(code: string): string {
  let result = '';
  let index = 0;
  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];

    if (char === '/' && next === '/') {
      while (index < code.length && code[index] !== '\n') index += 1;
      result += '\n';
      continue;
    }
    if (char === '/' && next === '*') {
      index += 2;
      while (
        index < code.length &&
        !(code[index] === '*' && code[index + 1] === '/')
      ) {
        result += code[index] === '\n' ? '\n' : ' ';
        index += 1;
      }
      index += 2;
      continue;
    }
    if (char === '"' || char === "'") {
      const quote = char;
      index += 1;
      while (index < code.length && code[index] !== quote) {
        if (code[index] === '\\') index += 1;
        index += 1;
      }
      index += 1;
      result += `${quote}${quote}`;
      continue;
    }
    result += char;
    index += 1;
  }
  return result;
}

/** 找出代码里被误用的中文标点（行号从 1 开始） */
export function findFullwidthPunctuation(code: string): {
  line: number;
  column: number;
  char: string;
  suggestion: string;
}[] {
  const stripped = stripCommentsAndStrings(code);
  const found: {
    line: number;
    column: number;
    char: string;
    suggestion: string;
  }[] = [];
  stripped.split('\n').forEach((text, lineIndex) => {
    for (let column = 0; column < text.length; column += 1) {
      const suggestion = FULLWIDTH_PUNCTUATION[text[column]];
      if (suggestion) {
        found.push({
          line: lineIndex + 1,
          column: column + 1,
          char: text[column],
          suggestion,
        });
      }
    }
  });
  return found;
}

/** 某个名字在诊断里第一次出现的行号 */
function lineOfName(parsed: Diagnostic[], name: string): number | undefined {
  return parsed.find((item) => item.message.includes(`'${name}'`))?.line;
}

/**
 * 把 clang 的报错翻译成零基础也能看懂的"自查提示"，
 * 展示在编译错误面板里（原始报错仍然保留，方便对照）。
 */
export function beginnerTips(code: string, diagnostics: string): BeginnerTip[] {
  const tips: BeginnerTip[] = [];
  const parsed = parseDiagnostics(diagnostics);
  const messages = parsed.map((item) => item.message).join('\n');

  // 1) 中文标点：新手第一大坑，直接扫代码比看报错更可靠
  const fullwidth = findFullwidthPunctuation(code);
  if (fullwidth.length > 0) {
    const list = fullwidth
      .slice(0, 3)
      .map(
        (item) =>
          `第 ${item.line} 行第 ${item.column} 列：${item.char} → 应写成 ${item.suggestion}`,
      )
      .join('\n');
    tips.push({
      title: `检测到 ${fullwidth.length} 处中文标点符号，而 C++ 只认英文半角符号`,
      detail: `${list}\n把输入法切到英文（Shift 或 Ctrl+空格）后重新输入这些符号。`,
      line: fullwidth[0].line,
    });
  }

  // 2) 标点/括号问题
  if (/expected ';'|expected '\)'|expected '\}'/.test(messages)) {
    tips.push({
      title: '大概率是标点漏了或括号不配对',
      detail:
        'C++ 每一句结尾都要有英文分号 ;，大括号 { } 与圆括号 ( ) 必须成对。\n' +
        '重点检查报错的那一行，以及它的上一行。',
      line: parsed.find((item) => /expected/.test(item.message))?.line,
    });
  }

  // 3) 不认识 cout / cin / endl 等标准库名字
  const undeclared = /undeclared identifier '([^']+)'/.exec(messages)?.[1];
  if (undeclared && /^(cout|cin|endl)$/.test(undeclared)) {
    tips.push({
      title: `编译器不认识 ${undeclared}`,
      detail:
        `① 第一行是不是少了 #include <iostream>？\n` +
        '② 是不是少了 using namespace std;（或者写成 std::cout）？\n' +
        `③ 是不是拼错了？注意大小写：${undeclared} 不能写成 ${undeclared.toUpperCase()}。`,
      line: lineOfName(parsed, undeclared),
    });
  } else if (/undeclared identifier '(string|vector|map|sort|setprecision|pair)'/.test(messages)) {
    const name = /undeclared identifier '([^']+)'/.exec(messages)?.[1] ?? '';
    const headerMap: Record<string, string> = {
      string: '#include <string>',
      vector: '#include <vector>',
      map: '#include <map>',
      sort: '#include <algorithm>',
      pair: '#include <utility>',
      setprecision: '#include <iomanip>',
    };
    tips.push({
      title: `编译器不认识 ${name}`,
      detail: `需要先引入对应的头文件：${headerMap[name] ?? ''}。`,
      line: lineOfName(parsed, name),
    });
  }

  // 4) 其他"不认识的名字"：变量拼错或没定义
  if (undeclared && !/^(cout|cin|endl|string|vector|map|sort|setprecision|pair)$/.test(undeclared)) {
    tips.push({
      title: `名字 ${undeclared} 没有被定义过`,
      detail:
        '常见原因：拼写错误、大小写不一致（C++ 区分大小写，Score 和 score 是两个不同的名字）、\n' +
        '或者忘了先写类型再写名字（例如 int sum = 0;）。',
      line: lineOfName(parsed, undeclared),
    });
  }

  // 5) 大括号多了
  if (/extraneous closing brace/.test(messages)) {
    tips.push({
      title: '多了一个右大括号 }',
      detail: '每一对 { } 都要成双成对，删掉多余的那个 }。',
      line: parsed.find((item) => /extraneous/.test(item.message))?.line,
    });
  }

  // 6) 函数调用参数不匹配
  if (/no matching function/.test(messages)) {
    tips.push({
      title: '函数调用的参数个数或类型对不上',
      detail:
        '检查括号里传了几个参数、类型对不对。\n' +
        '例如函数定义是 maxOf(int a, int b)，调用时就要传两个整数。',
      line: parsed.find((item) => /no matching function/.test(item.message))?.line,
    });
  }

  // 7) 链接阶段：有函数没实现
  if (/undefined symbol|undefined reference/.test(messages)) {
    tips.push({
      title: '用到了没有实现的函数（链接失败）',
      detail:
        '常见原因：函数只写了声明没写函数体，或者函数名/参数写得不一致。\n' +
        '另外提醒：本站编译器关闭了 C++ 异常，不能使用 try / catch / throw。',
    });
  }

  return tips;
}
