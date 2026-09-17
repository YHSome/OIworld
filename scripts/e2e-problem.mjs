/**
 * 单题深度验收：检查题目页的每个区域都能正确渲染，
 * 并直接用题库里的参考题解提交，验证这道题在浏览器里真的能通过。
 *
 *   node scripts/e2e-problem.mjs http://localhost:4173 s7-p6
 *   node scripts/e2e-problem.mjs http://localhost:4173 s6-p4
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4173';
const problemId = process.argv[3] ?? 's1-p1';

const stageNumber = Number(problemId.match(/^s(\d+)-/)?.[1]);
if (!stageNumber) throw new Error(`题目 id 格式不对：${problemId}`);
const data = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'src', 'data', 'problems', `stage-${stageNumber}.json`),
    'utf8',
  ),
);
const problem = data.problems.find((item) => item.id === problemId);
if (!problem) throw new Error(`在 stage-${stageNumber}.json 里找不到题目 ${problemId}`);

const shotDir = path.join(process.cwd(), 'test-results');
fs.mkdirSync(shotDir, { recursive: true });

let failed = 0;
const check = (label, condition, extra = '') => {
  if (!condition) failed += 1;
  console.log(
    `  ${condition ? '[OK]' : '[FAIL]'} ${label}${extra ? ` — ${extra}` : ''}`,
  );
};

/** 等待 C++ 编译器就绪：题目页右侧的编译器提示条消失即表示已就绪 */
async function waitCompilerReady(page, timeout = 300_000) {
  await page.waitForFunction(
    () =>
      !Array.from(document.querySelectorAll('.problem-right .ant-alert-message')).some(
        (node) => /准备|加载|正在/.test(node.textContent ?? ''),
      ),
    undefined,
    { timeout },
  );
}
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

console.log(
  `\n[题目] ${problem.id} ${problem.title}（${problem.difficulty} / ${problem.knowledge_point}）\n`,
);

try {
  // 后面的题目默认是锁着的（闯关规则固定生效），这里打开开发者模式来直达本题
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    window.localStorage.setItem(
      'oiworld:progress',
      JSON.stringify({
        state: {
          completedProblems: [],
          attemptedProblems: [],
          lastVisitedProblemId: '',
          drafts: {},
          developerMode: true,
        },
        version: 1,
      }),
    );
  });

  await page.goto(`${base}/problem/${problemId}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  await page.waitForSelector('.monaco-editor', { timeout: 60_000 });

  // ---- 左侧题目描述 ----
  const descCard = await page.locator('.problem-desc-card').innerText();
  check('标题渲染', descCard.includes(problem.title));
  check('难度标签', descCard.includes(problem.difficulty));
  check('知识点标签', descCard.includes(problem.knowledge_point));
  for (const section of ['题目背景', '输入格式', '输出格式', '样例']) {
    check(`Markdown 章节「${section}」`, descCard.includes(section));
  }
  check('Markdown 代码块', (await page.locator('.problem-desc-card pre').count()) > 0);
  check(
    '提示区（默认折叠）',
    (await page.locator('.problem-desc-card .ant-collapse-item').count()) > 0,
  );
  check('上一题 / 下一题导航', descCard.includes('上一题') && descCard.includes('下一题'));
  // 本脚本用开发者模式直达后面的题目，所以题解入口从一开始就是可用的
  check('开发者模式下未通过也能查看参考题解', descCard.includes('查看参考题解'));
  check('出现了开发者面板', (await page.locator('.developer-panel').count()) > 0);

  // ---- 右侧编辑与工具栏 ----
  const rightText = await page.locator('.problem-right').innerText();
  check('语言标签 C++ 20', rightText.includes('C++ 20'));
  const runButton = page.locator('button').filter({ hasText: /^运行$/ });
  const submitButton = page.locator('button').filter({ hasText: /^提交$/ });
  const resetButton = page.locator('button').filter({ hasText: /^重置代码$/ });
  check(
    '工具栏：运行 / 提交 / 重置代码',
    (await runButton.count()) === 1 &&
      (await submitButton.count()) === 1 &&
      (await resetButton.count()) === 1,
  );

  // ---- 测试用例面板 ----
  const rows = await page.locator('.testcase-panel tbody tr').count();
  check(
    '测试用例全部列出',
    rows === problem.test_cases.length,
    `页面 ${rows} 行 / JSON ${problem.test_cases.length} 个`,
  );

  await waitCompilerReady(page);

  // ---- 用参考题解提交 ----
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(problem.solution_code);
  await page.waitForTimeout(300);

  const startedAt = Date.now();
  await submitButton.click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', {
    timeout: 180_000,
  });
  const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

  if ((await page.locator('.ant-modal-content').count()) > 0) {
    const modal = await page.locator('.ant-modal-content').first().innerText();
    check(`提交参考题解全部通过（${elapsed}s）`, modal.includes('恭喜通过'));
  } else {
    const errorText = await page.locator('.ant-alert-error').first().innerText();
    check('提交参考题解全部通过', false, errorText.slice(0, 300));
  }
  await page.keyboard.press('Escape');

  console.log('\n  测试用例逐条状态：');
  for (const row of await page.locator('.testcase-panel tbody tr').allInnerTexts()) {
    console.log(`    ${row.replace(/\s+/g, ' ').trim()}`);
  }

  // ---- 通过后题解按钮解锁 ----
  const descAfter = await page.locator('.problem-desc-card').innerText();
  check('通过后解锁「查看参考题解」', descAfter.includes('查看参考题解'));
  await page.locator('button').filter({ hasText: /^查看参考题解$/ }).click();
  await page.waitForSelector('.solution-pre', { timeout: 10_000 });
  const solution = await page.locator('.solution-pre').innerText();
  check('题解弹窗内容与 JSON 一致', solution.trim() === problem.solution_code.trim());
  await page.screenshot({
    path: path.join(shotDir, `problem-${problemId}.png`),
    fullPage: true,
  });

  check(
    '运行期间无控制台错误',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
} finally {
  console.log(
    failed === 0
      ? `\n=== ${problemId} 验收全部通过 ===\n`
      : `\n=== ${problemId} 有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
