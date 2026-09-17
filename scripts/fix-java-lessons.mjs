/**
 * Java 题库作者工具：修正 lesson 模板字符串里的反引号。
 *
 *   node scripts/fix-java-lessons.mjs --check     # 只报告有多少处需要处理
 *   node scripts/fix-java-lessons.mjs             # 就地修正 src/java/stages/*.ts
 *
 * 背景：lesson 的正文是用 TS 模板字符串写的，正文里的「行内代码」必须写成
 * \`code\`（反引号转义），否则模板字符串会提前结束、整个文件语法报错。
 * 而 pointsTable / mistakesTable 的数组参数是普通字符串，那里的反引号**不需要**转义。
 * 手工判断很容易漏，所以这里用一个小型词法扫描器自动处理：
 *   - 模板字符串里出现的、不是「合法结束位置」的裸反引号 → 转义
 *   - ${...} 表达式内部按代码处理（其中的字符串字面量不动）
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const stagesDir = path.join(root, 'src', 'java', 'stages');
const checkOnly = process.argv.includes('--check');

/**
 * 判断一个反引号是否是模板字符串的"合法结束"：
 * 同一行剩下的内容只有空白 + `,` / `;` / `)` / `]` / `}` 时才算结束。
 */
function endsTemplateLine(source, index) {
  const rest = source.slice(index + 1);
  const lineEnd = rest.indexOf('\n');
  const tail = lineEnd === -1 ? rest : rest.slice(0, lineEnd);
  return /^\s*[,;)\]}]*\s*$/.test(tail);
}

function processFile(file) {
  const source = fs.readFileSync(file, 'utf8');
  let out = '';
  let i = 0;
  let state = 'code'; // code | single | double | template
  const braceStack = []; // 用于 ${ ... } 嵌套
  let fixed = 0;

  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1];

    if (state === 'code') {
      if (c === '/' && n === '/') {
        const end = source.indexOf('\n', i);
        const stop = end === -1 ? source.length : end;
        out += source.slice(i, stop);
        i = stop;
        continue;
      }
      if (c === '/' && n === '*') {
        const end = source.indexOf('*/', i + 2);
        const stop = end === -1 ? source.length : end + 2;
        out += source.slice(i, stop);
        i = stop;
        continue;
      }
      if (c === "'") {
        // 单引号字符串：整体照抄（其中的反引号是合法的）
        let j = i + 1;
        while (j < source.length) {
          if (source[j] === '\\') j += 2;
          else if (source[j] === "'") {
            j += 1;
            break;
          } else j += 1;
        }
        out += source.slice(i, j);
        i = j;
        continue;
      }
      if (c === '"') {
        let j = i + 1;
        while (j < source.length) {
          if (source[j] === '\\') j += 2;
          else if (source[j] === '"') {
            j += 1;
            break;
          } else j += 1;
        }
        out += source.slice(i, j);
        i = j;
        continue;
      }
      if (c === '`') {
        state = 'template';
        out += c;
        i += 1;
        continue;
      }
      if (c === '{' && braceStack.length) braceStack[braceStack.length - 1] += 1;
      if (c === '}' && braceStack.length) {
        braceStack[braceStack.length - 1] -= 1;
        if (braceStack[braceStack.length - 1] === 0) {
          braceStack.pop();
          state = 'template';
        }
      }
      out += c;
      i += 1;
      continue;
    }

    if (state === 'template') {
      if (c === '\\') {
        out += source.slice(i, i + 2);
        i += 2;
        continue;
      }
      if (c === '$' && n === '{') {
        braceStack.push(1);
        state = 'code';
        out += '${';
        i += 2;
        continue;
      }
      if (c === '`') {
        if (endsTemplateLine(source, i)) {
          state = 'code';
          out += c;
        } else {
          // 正文里的裸反引号：转义
          out += '\\`';
          fixed += 1;
        }
        i += 1;
        continue;
      }
      out += c;
      i += 1;
      continue;
    }
  }

  if (!checkOnly && fixed > 0) fs.writeFileSync(file, out, 'utf8');
  return fixed;
}

const files = fs.existsSync(stagesDir)
  ? fs.readdirSync(stagesDir).filter((name) => name.endsWith('.ts')).map((name) => path.join(stagesDir, name))
  : [];

let total = 0;
for (const file of files) {
  const fixed = processFile(file);
  total += fixed;
  if (fixed > 0) {
    console.log(
      `${checkOnly ? '需要修正' : '已修正'} ${path.relative(root, file)}：${fixed} 处`,
    );
  }
}

console.log(
  total === 0
    ? '所有 stage 文件的反引号都没问题。'
    : checkOnly
      ? `共 ${total} 处需要修正，运行 node scripts/fix-java-lessons.mjs 自动修复。`
      : `共修正 ${total} 处。请再运行 npx tsc --noEmit 确认。`,
);
