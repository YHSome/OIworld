/**
 * Java 题库校验（作者 / CI 用）：
 *
 *   1. 结构检查：每阶段 6 道题、7 个讲解小节齐全、提示与测试用例数量达标、讲解长度达标
 *   2. 编译检查：solution_code 与 starter_code 都必须能编译，
 *      并且统一用 `javac --release 8` —— 浏览器里跑的是 Java 8 的 Doppio JVM，
 *      这样任何 Java 9+ 的写法（var、List.of、文本块……）都会在这里被拦下来
 *   3. 运行检查：用本机 JDK 依次跑每个测试用例，逐行比对 expected_output
 *
 * 用法：
 *   node scripts/validate-java-problems.mjs                # 全部题目
 *   node scripts/validate-java-problems.mjs --stage=3      # 只校验阶段三
 *   node scripts/validate-java-problems.mjs --problem=j3-2 # 只校验一道题
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { JAVA_STAGES } from '../src/java/data.ts';

const args = process.argv.slice(2);
const stageFilter = Number(
  (args.find((a) => a.startsWith('--stage=')) ?? '').split('=')[1] || 0,
);
const problemFilter = (args.find((a) => a.startsWith('--problem=')) ?? '').split('=')[1];

const normalize = (text) =>
  text.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/\n+$/, '');

/** 每道题必须包含的讲解小节（顺序也是固定的，见 src/java/lesson.ts） */
const REQUIRED_SECTIONS = [
  '### 题目背景',
  '### 任务',
  '### 本关新知识',
  '### 输入格式',
  '### 输出格式',
  '### 样例',
  '### 常见错误',
];

const failures = [];
let checked = 0;
let caseCount = 0;
const startedAt = Date.now();

const root = await fs.mkdtemp(path.join(os.tmpdir(), 'oiworld-java-'));

console.log('\n=== Java 题库校验（javac --release 8，对应浏览器里的 Java 8 运行时）===\n');

try {
  for (const stage of JAVA_STAGES) {
    if (stageFilter && stage.stage !== stageFilter) continue;

    // ---------- 阶段结构：每阶段 6 道题 ----------
    if (!stageFilter && stage.problems.length !== 6) {
      failures.push({
        id: `阶段${stage.stage}`,
        phase: 'structure',
        detail: `每阶段应有 6 道题，实际 ${stage.problems.length} 道`,
      });
    }

    for (const problem of stage.problems) {
      if (problemFilter && problem.id !== problemFilter) continue;
      checked += 1;
      const issues = [];

      for (const section of REQUIRED_SECTIONS) {
        if (!problem.description.includes(section)) issues.push(`讲解缺少小节 ${section}`);
      }
      if (problem.description.length < 900) {
        issues.push(`讲解过短（${problem.description.length} 字符，要求 ≥ 900）`);
      }
      if (problem.hints.length < 2) {
        issues.push(`提示只有 ${problem.hints.length} 条（要求 ≥ 2）`);
      }
      // 没有输入的题目（例如"输出一行文字"）只可能有一个测试用例
      const hasInput = problem.test_cases.some((test) => test.input.trim().length > 0);
      const minTests = hasInput ? 3 : 1;
      if (problem.test_cases.length < minTests) {
        issues.push(
          `测试用例只有 ${problem.test_cases.length} 个（本题${hasInput ? '有' : '没有'}输入，要求 ≥ ${minTests}）`,
        );
      }
      for (const [index, testCase] of problem.test_cases.entries()) {
        if (!testCase.expected_output.endsWith('\n')) {
          issues.push(`第 ${index + 1} 个测试用例的 expected_output 末尾缺少换行`);
        }
      }
      if (!/^j\d-\d$/.test(problem.id)) {
        issues.push(`题目 id 格式应为 j<阶段>-<序号>，实际 ${problem.id}`);
      }
      if (!problem.starter_code.includes('TODO')) {
        issues.push('初始代码里没有 // TODO 引导');
      }

      if (issues.length) {
        failures.push({ id: problem.id, phase: '结构', detail: issues.join('；') });
        continue;
      }

      // ---------- 编译 + 运行 ----------
      const dir = path.join(root, problem.id);
      const starterDir = path.join(dir, 'starter');
      await fs.mkdir(starterDir, { recursive: true });

      const javac = (target, source) =>
        spawnSync(
          'javac',
          ['--release', '8', '-Xlint:-options', '-d', target, source],
          { encoding: 'utf8', timeout: 30000 },
        );

      // 1) 参考题解
      const solutionFile = path.join(dir, 'Main.java');
      await fs.writeFile(solutionFile, problem.solution_code, 'utf8');
      const solutionCompile = javac(dir, solutionFile);
      if (solutionCompile.status !== 0) {
        failures.push({
          id: problem.id,
          phase: '题解编译失败',
          detail: (solutionCompile.stderr || solutionCompile.stdout || '').trim().slice(0, 800),
        });
        continue;
      }

      // 2) 初始代码也必须能编译（学生一打开题目就应该能点「运行」）
      const starterFile = path.join(starterDir, 'Main.java');
      await fs.writeFile(starterFile, problem.starter_code, 'utf8');
      const starterCompile = javac(starterDir, starterFile);
      if (starterCompile.status !== 0) {
        failures.push({
          id: problem.id,
          phase: '初始代码编译失败',
          detail: (starterCompile.stderr || starterCompile.stdout || '').trim().slice(0, 800),
        });
        continue;
      }

      // 3) 逐个测试用例运行比对
      for (const [index, testCase] of problem.test_cases.entries()) {
        caseCount += 1;
        const run = spawnSync(
          'java',
          [
            // Windows 上 JDK 默认按 GBK 输出，会与题库里的 UTF-8 期望值对不上；
            // 浏览器里的 Doppio JVM 用的是 UTF-8，所以这里也强制 UTF-8。
            '-Dstdout.encoding=UTF-8',
            '-Dstderr.encoding=UTF-8',
            '-Dfile.encoding=UTF-8',
            '-cp',
            dir,
            'Main',
          ],
          {
            input: testCase.input,
            encoding: 'utf8',
            timeout: 15000,
          },
        );
        const actual = normalize(run.stdout ?? '');
        const expected = normalize(testCase.expected_output);
        if (run.status !== 0 || actual !== expected) {
          failures.push({
            id: problem.id,
            phase: `用例 ${index + 1}`,
            detail:
              `\n    输入 : ${JSON.stringify(testCase.input)}` +
              `\n    期望 : ${JSON.stringify(expected)}` +
              `\n    实际 : ${JSON.stringify(actual)}` +
              (run.stderr ? `\n    stderr: ${run.stderr.trim().slice(0, 200)}` : ''),
          });
        }
      }
    }
  }
} finally {
  await fs.rm(root, { recursive: true, force: true });
}

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

if (failures.length) {
  console.error('❌ 校验未通过：\n');
  for (const failure of failures) {
    console.error(`  [${failure.id}] ${failure.phase}：${failure.detail}`);
  }
  console.error(`\n=== ${checked - failures.length}/${checked} 道题通过，耗时 ${elapsed}s ===\n`);
  process.exit(1);
}

console.log(
  `✅ Java 题库校验通过：${checked} 道题，${caseCount} 个测试点，耗时 ${elapsed}s\n`,
);
