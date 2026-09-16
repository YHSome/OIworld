import { pythonBeginnerTips } from '../src/python/diagnostics.ts';

const quote = String.fromCharCode(39);
const checks = [
  { code: 'if True\n    print(1)', output: "SyntaxError: expected ':'\n  File \"<exec>\", line 1", text: '可能漏了英文冒号' },
  { code: '  print(1)', output: 'IndentationError: unexpected indent\n  File "<exec>", line 1', text: '缩进不一致' },
  { code: 'print(total)', output: `NameError: name ${quote}total${quote} is not defined\n  File "<exec>", line 1`, text: '不认识名字 total' },
  { code: 'print("年龄：" + 12)', output: 'TypeError: can only concatenate str (not "int") to str\n  File "<exec>", line 1', text: '文字和数字不能直接用 +' },
  { code: 'input()\ninput()', output: 'EOFError: EOF when reading a line\n  File "<exec>", line 2', text: '标准输入里的数据不够' },
];

const failures = checks.flatMap(({ code, output, text }) => {
  const titles = pythonBeginnerTips(code, output).map((tip) => tip.title).join('\n');
  return titles.includes(text) ? [] : [{ text, titles }];
});

if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exit(1);
}
console.log(`Python 报错提示校验通过：${checks.length} 类常见错误。`);
