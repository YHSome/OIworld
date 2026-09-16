/**
 * 用本机 Python 执行全部参考题解，验证题解与测试用例没有漂移。
 * 输出比对规则与浏览器评测一致：统一换行、忽略行尾空白和末尾空行。
 */
import { spawnSync } from 'node:child_process';
import { PYTHON_PROBLEMS } from '../src/python/data.ts';

function normalize(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n+$/, '');
}

const failures = [];
let caseCount = 0;

for (const { problem } of PYTHON_PROBLEMS) {
  for (const [index, testCase] of problem.test_cases.entries()) {
    caseCount += 1;
    const result = spawnSync('python', ['-c', problem.solution_code], {
      input: testCase.input,
      encoding: 'utf8',
      timeout: 5000,
      // Windows 默认控制台编码可能不是 UTF-8；题库含中文输出，必须固定它。
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' },
    });
    const actual = normalize(result.stdout ?? '');
    const expected = normalize(testCase.expected_output);
    if (result.status !== 0 || actual !== expected) {
      failures.push({
        id: problem.id,
        case: index + 1,
        exitCode: result.status,
        expected,
        actual,
        stderr: result.stderr,
      });
    }
  }
}

if (failures.length > 0) {
  console.error(JSON.stringify({ caseCount, failures }, null, 2));
  process.exit(1);
}

console.log(`Python 题库校验通过：${PYTHON_PROBLEMS.length} 道题，${caseCount} 个测试点。`);
