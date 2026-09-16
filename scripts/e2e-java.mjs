/**
 * Java 靶场验收：确认它已经和 C++ / Python 靶场一样是多页结构
 * （首页 → 阶段页 → 题目页 → 进度页 → 指南页），并且能真的跑通一道题。
 *
 *   node scripts/e2e-java.mjs http://localhost:4173
 */

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.argv[2] ?? 'http://localhost:4173').replace(/\/$/, '');
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

const buttonByText = (text) =>
  page.locator('button').filter({ hasText: new RegExp(`^${text}$`) });

try {
  step('Java 首页 /java');
  await page.goto(`${base}/java`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('.stage-card', { timeout: 60_000 });
  const stageCards = await page.locator('.stage-card').count();
  check(`阶段卡片数量为 2（阶段一/阶段二）`, stageCards === 2, `实际 ${stageCards}`);
  const home = await page.locator('body').innerText();
  check('首页显示题目总数 5', /题目总数\s*5/.test(home), '');
  check('首页显示 Java 靶场标题', home.includes('Java 基础语法靶场'));
  check('首页有 Java 指南入口', home.includes('Java 指南') || home.includes('先看 Java 指南'));
  check('首页有搜索与筛选', home.includes('搜索题目名称') || home.includes('全部难度'));
  await page.screenshot({ path: path.join(shotDir, 'java-1-home.png'), fullPage: true });

  step('顶栏语言切换包含三个靶场，且 Java 处于选中态');
  const switchText = await page.locator('.language-switch').innerText();
  check(
    'C++ / Python / Java 三个切换按钮都在',
    ['C++ 靶场', 'Python 靶场', 'Java 靶场'].every((item) => switchText.includes(item)),
    switchText.replace(/\n/g, ' '),
  );
  check('Java 按钮处于激活样式', (await page.locator('.java-switch-active').count()) === 1);
  check(
    '顶栏进度显示 Java 靶场的进度',
    /0\/5/.test(await page.locator('.app-header-right').innerText()),
  );

  step('阶段页 /java/stage/1');
  await page.locator('.stage-card').first().click();
  await page.waitForSelector('table tbody tr', { timeout: 30_000 });
  const stagePage = await page.locator('body').innerText();
  check('阶段页显示阶段标题', stagePage.includes('阶段一'));
  check('阶段页列出 3 道题', (await page.locator('table tbody tr').count()) === 3);
  check('阶段页有上一/下一阶段导航', stagePage.includes('下一阶段'));
  await page.screenshot({ path: path.join(shotDir, 'java-2-stage.png'), fullPage: true });

  step('题目页 /java/problem/java-1');
  await page.locator('table tbody tr').first().click();
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  await page.waitForSelector('.monaco-editor', { timeout: 90_000 });
  const problemPage = await page.locator('body').innerText();
  check('左侧题目描述与右侧编辑器分栏', (await page.locator('.problem-left').count()) === 1 && (await page.locator('.problem-right').count()) === 1);
  check('显示题目标题', problemPage.includes('你好，Java'));
  check('显示难度与知识点标签', problemPage.includes('入门') && problemPage.includes('main'));
  check('有提示折叠区', problemPage.includes('提示（想不出来再看）'));
  check('有「写到哪？」按钮', (await buttonByText('写到哪？').count()) === 1);
  check('工具栏含 运行 / 提交 / 重置代码', (await buttonByText('运行').count()) === 1 && (await buttonByText('提交').count()) === 1 && (await buttonByText('重置代码').count()) === 1);
  check('有标准输入 / 运行结果 切换', problemPage.includes('标准输入 (stdin)') && problemPage.includes('运行结果'));
  check('有测试用例面板', problemPage.includes('测试用例'));
  check('Java 语言已生效（编辑器出现 Java 关键字高亮容器）', (await page.locator('.monaco-editor').count()) > 0);
  await page.screenshot({ path: path.join(shotDir, 'java-3-problem.png'), fullPage: true });

  step('等待 Java 运行环境就绪（Doppio，约 100MB）');
  const readyAt = Date.now();
  await page.waitForFunction(
    () => {
      const nodes = Array.from(document.querySelectorAll('.ant-alert-message'));
      return nodes.some((node) => (node.textContent ?? '').includes('已就绪'));
    },
    undefined,
    { timeout: 600_000 },
  );
  check(`运行环境就绪（${((Date.now() - readyAt) / 1000).toFixed(1)}s）`, true);

  step('像真实学生那样：把 // TODO 那一行改成输出语句');
  // 注意：不能用「全选 + insertText 整段替换」——Monaco 对整段插入会触发
  // 自动补全括号与自动缩进，把代码插成多余大括号的样子。
  // 真实操作是：点中 TODO 那一行，替换成一行代码。
  const TODO_LINE = 'System.out.println("Hello, Java!");';
  const todoLine = page.locator('.view-line', { hasText: 'TODO' }).first();
  await todoLine.click();
  await page.keyboard.press('Home');
  await page.keyboard.press('Shift+End');
  await page.keyboard.type(TODO_LINE, { delay: 8 });
  await page.waitForTimeout(400);

  const editorText = (await page.locator('.monaco-editor .view-lines').innerText())
    // Monaco 把行首缩进渲染成不间断空格，比较前统一成普通空格
    .replace(/\u00a0/g, ' ');
  const braceCount = (editorText.match(/\{/g) ?? []).length;
  const closeBraceCount = (editorText.match(/\}/g) ?? []).length;
  check(
    '编辑器内容干净（TODO 已替换，大括号配平）',
    editorText.includes('TODO') === false &&
      braceCount === 2 &&
      braceCount === closeBraceCount,
    `{ ×${braceCount} / } ×${closeBraceCount}：${editorText.replace(/\n/g, ' ⏎ ').slice(0, 100)}`,
  );

  await buttonByText('提交').click();
  await page.waitForSelector('.ant-modal-content, .ant-alert-error', {
    timeout: 600_000,
  });
  if ((await page.locator('.ant-modal-content').count()) > 0) {
    const modal = await page.locator('.ant-modal-content').first().innerText();
    check('提交后弹出「恭喜通过」', modal.includes('恭喜通过'), modal.split('\n').slice(0, 2).join(' / '));
  } else {
    const error = await page.locator('.ant-alert-error').first().innerText();
    const raw = await page.locator('.output-panel').innerText();
    check('提交后弹出「恭喜通过」', false, `${error.slice(0, 120)} :: ${raw.slice(0, 200)}`);
  }
  await page.screenshot({ path: path.join(shotDir, 'java-4-submit.png'), fullPage: true });
  await page.keyboard.press('Escape');

  step('进度页 /java/progress');
  await page.goto(`${base}/java/progress`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.ant-statistic', { timeout: 30_000 });
  const progress = await page.locator('body').innerText();
  check('进度页显示 Java 学习进度', progress.includes('我的 Java 学习进度'));
  check('进度页按阶段列出完成情况', progress.includes('各阶段完成情况'));
  check('刚通过的 java-1 已计入进度', /已通过\s*1/.test(progress), '');
  await page.screenshot({ path: path.join(shotDir, 'java-5-progress.png'), fullPage: true });

  step('指南页 /java/guide');
  await page.goto(`${base}/java/guide`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.guide-page', { timeout: 30_000 });
  const guide = await page.locator('.guide-page').innerText();
  check('指南页包含类与 main 方法', guide.includes('main'));
  check('指南页包含 System.out.println', guide.includes('System.out.println'));
  check('指南页包含 Scanner 与报错对照表', guide.includes('Scanner') && guide.includes('报错对照表'));
  check('指南右侧目录可用', (await page.locator('.guide-side a').count()) > 5);

  step('闯关与解锁：直接访问第 3 题应被拦截，开发者模式可解锁');
  await page.goto(`${base}/java/problem/java-3`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.ant-card', { timeout: 30_000 });
  const locked = await page.locator('body').innerText();
  check('未通过的题按顺序锁住', locked.includes('这道题还没有解锁'));
  await page.goto(`${base}/java/problem/java-3?dev=1`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.problem-page', { timeout: 30_000 });
  check('开发者模式可直达', (await page.locator('.problem-page').count()) === 1);

  check(
    '全程无控制台错误',
    consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(' | '),
  );
} catch (error) {
  check('脚本执行', false, error instanceof Error ? error.message : String(error));
  await page
    .screenshot({ path: path.join(shotDir, 'java-failure.png'), fullPage: true })
    .catch(() => undefined);
} finally {
  console.log(
    failed === 0
      ? '\n=== Java 靶场验收全部通过 ===\n'
      : `\n=== Java 靶场有 ${failed} 项失败 ===\n`,
  );
  if (failed > 0) process.exitCode = 1;
  await browser.close();
}
