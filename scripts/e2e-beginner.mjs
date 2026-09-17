/**
 * 零基础路径验收：验证"完全没写过代码的人"能不能顺利走通第一题。
 *
 * 覆盖：
 *   1. 新手指南页能打开，关键章节（逐行读懂 / 中文标点 / 报错对照表）都在
 *   2. 首页有"新手指南"入口
 *   3. 第一题页面会出现"第一次写代码"的引导卡片，且描述了「本关新知识」
 *   4. 「写到哪？」按钮能把光标定位到 TODO 行
 *   5. 故意用中文分号写错代码 → 运行 → 必须出现"检测到中文标点"的自查提示
 *   6. 改成正确代码 → 提交 → 通过
 *
 *   node scripts/e2e-beginner.mjs http://localhost:4173
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4173';
const shotDir = path.join(process.cwd(), 'test-results');
fs.mkdirSync(shotDir, { recursive: true });

let failed = 0;
const step = (text) => console.log(`\n[step] ${text}`);
const check = (label, condition, extra = '') => {
  if (!condition) failed += 1;
  console.log(
    `  ${condition ? '[OK]' : '[FAIL]'} ${label}${extra ? ` — ${extra}` : ''}`,
  );
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
const consoleErrors = [];
page.on('pageerror', (error) => consoleErrors.push(error.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

const buttonByText = (text, scope = page) =>
  scope.locator('button').filter({ hasText: new RegExp(`^${text}$`) });

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

try {
  step('打开新手指南 /guide');
  await page.goto(`${base}/guide`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.guide-page .markdown-body', { timeout: 30_000 });
  const guide = await page.locator('.guide-page .markdown-body').innerText();
  for (const section of [
    '从零开始',
    '程序、语言、编译器',
    '认识题目页',
    '逐行读懂你的第一段代码',
    '把一行输出语句拆开看',
    '动手：四步完成你的第一题',
    '新手最大的坑：中文标点',
    '报错不可怕',
    '小词典',
  ]) {
    check(`指南包含「${section}」`, guide.includes(section));
  }
  check('指南给出了逐行代码讲解', guide.includes('#include <iostream>'));
  check(
    '指南说明了运行与提交的区别',
    guide.includes('跑一次程序') && guide.includes('全部通过'),
  );
  const tocItems = await page.locator('.guide-side a').count();
  check('右侧目录生成成功', tocItems >= 9, `${tocItems} 项`);
  await page.screenshot({ path: path.join(shotDir, 'guide.png'), fullPage: true });

  step('首页有零基础入口');
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('.stage-card', { timeout: 30_000 });
  check(
    '首页出现「零基础？先看新手指南」按钮',
    (await buttonByText('零基础？先看新手指南（10 分钟）').count()) > 0,
  );
  check('顶部导航有「新手指南」', (await page.locator('.app-menu').innerText()).includes('新手指南'));

  step('进入第一题，检查新手引导');
  await page.goto(`${base}/problem/s1-p1`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  await page.waitForSelector('.monaco-editor', { timeout: 60_000 });
  const desc = await page.locator('.problem-desc-card').innerText();
  check('第一题有「本关新知识」教学节', desc.includes('本关新知识'));
  check('第一题逐行解释了初始代码', desc.includes('程序的入口') && desc.includes('偷懒声明'));
  check('第一题有「常见错误」表格', desc.includes('常见错误'));
  check('第一题提示了中文标点陷阱', desc.includes('中文标点') || desc.includes('英文双引号'));
  const callout = await page.locator('.problem-left .ant-alert').first().innerText();
  check(
    '出现「第一次写代码？先看新手指南」引导卡片',
    callout.includes('第一次写代码'),
  );
  check('引导卡片里有打开指南按钮', callout.includes('打开新手指南'));

  step('「写到哪？」按钮把光标定位到 TODO 行');
  await buttonByText('写到哪？').click();
  await page.waitForTimeout(400);
  const cursorLine = await page.evaluate(() => {
    // 从 Monaco 的 DOM 里读当前行号提示（状态栏不一定有，退而求其次读选中行的位置）
    const lineNumbers = document.querySelectorAll('.margin-view-overlays .line-numbers');
    for (const node of lineNumbers) {
      if (node.classList.contains('active-line-number')) {
        return node.textContent?.trim() ?? null;
      }
    }
    return null;
  });
  check('光标落在 TODO 那一行（第 5 行）', cursorLine === '5', `实际：${cursorLine}`);
  await page.screenshot({ path: path.join(shotDir, 'beginner-problem.png'), fullPage: true });

  step('等待编译器就绪');
  await waitCompilerReady(page);
  check('编译器就绪', true);

  step('先按一次「运行」但不写任何代码（新手最常见的第一反应）');
  await buttonByText('运行').click();
  await page.waitForSelector('.output-panel', { timeout: 120_000 });
  const emptyOutput = await page.locator('.output-panel').innerText();
  check(
    '没写代码直接运行时，提示「TODO 还没写」并给出按钮指引',
    emptyOutput.includes('TODO') && emptyOutput.includes('写到哪'),
  );

  step('故意用中文分号写错代码');
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  // 注意：最后的分号是中文全角「；」，这正是零基础学生最常犯的错
  await page.keyboard.insertText(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl；\n    return 0;\n}\n',
  );
  await page.waitForTimeout(300);
  await buttonByText('运行').click();
  await page.waitForSelector('.beginner-tips', { timeout: 120_000 });
  const tips = await page.locator('.beginner-tips').innerText();
  check('出现「零基础自查提示」面板', tips.includes('零基础自查提示'));
  check('检测到中文标点并说明怎么改', tips.includes('中文标点') && tips.includes('；'));
  check('提示里给出了对应的英文符号', tips.includes(';'));
  await page.screenshot({ path: path.join(shotDir, 'beginner-error-tip.png'), fullPage: true });

  step('改成正确代码后提交');
  await page.locator('.monaco-editor').click();
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Delete');
  await page.keyboard.insertText(
    '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n',
  );
  await page.waitForTimeout(300);
  await buttonByText('提交').click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', {
    timeout: 180_000,
  });
  const modal = await page.locator('.ant-modal-content').first().innerText();
  check('提交后弹出「恭喜通过」', modal.includes('恭喜通过'));

  check(
    '全程无控制台错误',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'beginner-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? '\n=== 零基础路径验收全部通过 ===\n'
      : `\n=== 零基础路径有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
