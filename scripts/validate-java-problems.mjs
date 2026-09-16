import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { JAVA_PROBLEMS } from '../src/java/data.ts';

const normalize = (text) => text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '');
const root = await fs.mkdtemp(path.join(os.tmpdir(), 'oiworld-java-'));
const failures = [];
let caseCount = 0;

try {
  for (const problem of JAVA_PROBLEMS) {
    const dir = path.join(root, problem.id);
    await fs.mkdir(dir);
    const source = path.join(dir, 'Main.java');
    await fs.writeFile(source, problem.solution_code, 'utf8');
    const compiled = spawnSync('javac', [source], { encoding: 'utf8', timeout: 15000 });
    if (compiled.status !== 0) {
      failures.push({ id: problem.id, phase: 'compile', stderr: compiled.stderr });
      continue;
    }
    for (const [index, testCase] of problem.test_cases.entries()) {
      caseCount += 1;
      const run = spawnSync('java', ['-cp', dir, 'Main'], { input: testCase.input, encoding: 'utf8', timeout: 10000 });
      if (run.status !== 0 || normalize(run.stdout ?? '') !== normalize(testCase.expected_output)) {
        failures.push({ id: problem.id, case: index + 1, phase: 'run', expected: normalize(testCase.expected_output), actual: normalize(run.stdout ?? ''), stderr: run.stderr });
      }
    }
  }
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

if (failures.length) {
  console.error(JSON.stringify({ caseCount, failures }, null, 2));
  process.exit(1);
}
console.log(`Java 题库校验通过：${JAVA_PROBLEMS.length} 道题，${caseCount} 个测试点。`);
