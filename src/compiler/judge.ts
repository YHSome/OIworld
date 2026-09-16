/**
 * 评测逻辑：标准输出比对。
 *
 * 比对规则（同主流 OJ 的宽松比对）：
 *  - 忽略每行行尾多余的空格 / 制表符；
 *  - 忽略行尾多余的换行；
 *  - 统一 CRLF / LF；
 *  - 行内空格差异、大小写差异仍然算错。
 */

export interface OutputDiff {
  /** 第一处不同的行号（从 1 开始）；行数不同时给出较短输出之后的那一行 */
  line: number;
  expected: string;
  actual: string;
  /** 是否只是行数不同 */
  lineMissing: boolean;
}

/** 归一化输出，用于比对 */
export function normalizeOutput(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

/** 判断实际输出是否与期望输出一致 */
export function isAccepted(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

/** 找出第一处差异，用于给用户展示“期望 / 实际”对比 */
export function diffOutput(actual: string, expected: string): OutputDiff | null {
  const a = normalizeOutput(actual).split('\n');
  const b = normalizeOutput(expected).split('\n');
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    const left = a[i];
    const right = b[i];
    if (left === right) continue;
    return {
      line: i + 1,
      expected: right ?? '',
      actual: left ?? '',
      lineMissing: left === undefined || right === undefined,
    };
  }
  return null;
}
