import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  sleep,
  clickButtonIfEnabled,
  closeModalIfOpen,
  getVisibleInputs,
  fillInput,
  verifyScreenshot,
} from './test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots', 'final-verify');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function createResults(name) {
  return { name, passed: [], failed: [] };
}

function recordPass(results, msg) {
  results.passed.push(msg);
  console.log(`  ✅ ${msg}`);
}

function recordFail(results, msg) {
  results.failed.push(msg);
  console.log(`  ❌ ${msg}`);
}

async function assert(results, condition, passMsg, failMsg) {
  if (condition) recordPass(results, passMsg);
  else recordFail(results, failMsg);
}

async function waitForNextReady(page, textRegex, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const btn = page.locator('button').filter({ hasText: textRegex }).first();
    const count = await btn.count();
    if (count > 0) {
      const disabled = await btn.isDisabled().catch(() => true);
      if (!disabled) return true;
    }
    await sleep(200);
  }
  return false;
}

async function waitForAnimationComplete(page, timeout = 5000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const stopBtn = page.locator('button').filter({ hasText: /停止|Stop/ }).first();
    const hasStopBtn = (await stopBtn.count()) > 0;
    if (hasStopBtn) {
      const stopCount = await stopBtn.count();
      if (stopCount === 0) return true;
    } else {
      const primaryBtn = page.locator('button').filter({ hasText: /插入|入栈|Enqueue|Push|添加节点/ }).first();
      if (await primaryBtn.count() > 0) {
        const disabled = await primaryBtn.isDisabled().catch(() => true);
        if (!disabled) return true;
      }
    }
    await sleep(300);
  }
  return false;
}

async function doOperation(page, btnRegex, waitTime = 800) {
  await waitForAnimationComplete(page, 3000);
  const btnReady = await waitForNextReady(page, btnRegex, 3000);
  if (!btnReady) return false;
  const clicked = await clickButtonIfEnabled(page, btnRegex, 3000);
  if (clicked) {
    await sleep(waitTime);
    await closeModalIfOpen(page);
    await sleep(300);
    await closeModalIfOpen(page);
  }
  return clicked;
}

async function doOpAndWait(page, btnRegex, nextBtnRegex, waitTime = 800) {
  await waitForAnimationComplete(page, 3000);
  const btnReady = await waitForNextReady(page, btnRegex, 3000);
  if (!btnReady) return false;
  const clicked = await clickButtonIfEnabled(page, btnRegex, 3000);
  if (clicked) {
    await sleep(waitTime);
    await closeModalIfOpen(page);
    await waitForAnimationComplete(page, 5000);
    if (nextBtnRegex) await waitForNextReady(page, nextBtnRegex, 5000);
    await sleep(300);
    await closeModalIfOpen(page);
  }
  return clicked;
}

async function screenshot(page, name, results) {
  const p = path.join(SCREENSHOTS_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  const ok = verifyScreenshot(p);
  if (!ok) recordFail(results, `截图 ${name} 可能异常`);
  return p;
}

// ============================================================
// 1. 首页
// ============================================================
async function testHome(page, results) {
  console.log('\n=== 首页验证 ===');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1000);

  const title = await page.locator('h1').first().textContent().catch(() => '');
  await assert(results, title.includes('数据结构'), '首页: 页面标题包含“数据结构”', `首页: 页面标题不正确 (${title})`);

  const learnCard = page.locator('a[href*="/array"]').first();
  const hasLearnCard = (await learnCard.count()) > 0;
  await assert(results, hasLearnCard, '首页: 学习推荐/数据结构卡片存在', '首页: 数据结构卡片不存在');

  const goalBtn = page.locator('button').filter({ hasText: /设定目标/ }).first();
  const hasGoalBtn = (await goalBtn.count()) > 0;
  await assert(results, hasGoalBtn, '首页: ProgressOverview 目标设定按钮存在', '首页: 目标设定按钮不存在');
  if (hasGoalBtn) {
    const goalInputs = await getVisibleInputs(page);
    if (goalInputs.length > 0) {
      await fillInput(page, goalInputs[0], '3');
      await sleep(200);
    }
    await goalBtn.click();
    await sleep(300);
    await closeModalIfOpen(page);
    recordPass(results, '首页: 目标设定按钮可点击');
  }

  const themeBtn = page.locator('button[title*="主题"]').first();
  const hasThemeBtn = (await themeBtn.count()) > 0;
  await assert(results, hasThemeBtn, '首页: 主题切换按钮存在', '首页: 主题切换按钮不存在');
  if (hasThemeBtn) {
    await themeBtn.click();
    await sleep(300);
    recordPass(results, '首页: 主题切换按钮可点击');
  }

  await screenshot(page, 'home.png', results);
}

// ============================================================
// 2. Array 页
// ============================================================
async function testArray(page, results) {
  console.log('\n=== Array 页验证 ===');
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1200);
  await closeModalIfOpen(page);

  const title = await page.locator('h1').first().textContent().catch(() => '');
  await assert(results, title.includes('数组'), 'Array: 页面标题正确', `Array: 页面标题不正确 (${title})`);

  await assert(results, (await page.locator('svg').count()) > 0, 'Array: SVG 可视化区域存在', 'Array: SVG 区域不存在');

  await doOperation(page, /随机/);
  await sleep(800);
  const svgContent = await page.locator('svg').first().innerHTML().catch(() => '');
  await assert(results, svgContent.length > 0, 'Array: 随机后 SVG 已渲染内容', 'Array: 随机后 SVG 内容为空');

  const inputs = await getVisibleInputs(page);
  if (inputs.length >= 2) {
    await fillInput(page, inputs[0], '42');
    await fillInput(page, inputs[1], '0');
  } else if (inputs.length === 1) {
    await fillInput(page, inputs[0], '42');
  }
  await sleep(200);

  const sizeBefore = await page.locator('text=/SIZE/').first().locator('..').textContent({ timeout: 3000 }).catch(() => '');
  const insertClicked = await doOperation(page, /按位插|插入/);
  await assert(results, insertClicked, 'Array: 插入按钮可点击', 'Array: 插入按钮不可用');
  await waitForAnimationComplete(page, 5000);
  await sleep(500);

  const sizeAfter = await page.locator('text=/SIZE/').first().locator('..').textContent({ timeout: 3000 }).catch(() => '');
  await assert(results, sizeAfter !== sizeBefore, 'Array: 插入后 SIZE 更新', `Array: 插入后 SIZE 未更新 (${sizeBefore} -> ${sizeAfter})`);

  await screenshot(page, 'array.png', results);
}

// ============================================================
// 3. Graph 页
// ============================================================
async function testGraph(page, results) {
  console.log('\n=== Graph 页验证 ===');
  await page.goto(BASE_URL + 'graph', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1200);
  await closeModalIfOpen(page);

  const title = await page.locator('h1').first().textContent().catch(() => '');
  await assert(results, title.includes('图'), 'Graph: 页面标题正确', `Graph: 页面标题不正确 (${title})`);
  await assert(results, (await page.locator('svg').count()) > 0, 'Graph: SVG 可视化区域存在', 'Graph: SVG 区域不存在');

  for (let i = 0; i < 3; i++) {
    await doOperation(page, /添加节点/, 1000);
  }
  const nodeCount = await page.locator('svg circle').count();
  await assert(results, nodeCount >= 9, `Graph: 添加节点后渲染了 ${nodeCount} 个节点`, 'Graph: 添加节点后未正确渲染');

  const bfsClicked = await doOpAndWait(page, /BFS/, /DFS/, 2000);
  await assert(results, bfsClicked, 'Graph: BFS 按钮可点击', 'Graph: BFS 按钮不可用');

  const dfsClicked = await doOpAndWait(page, /DFS/, /Dijkstra/, 2000);
  await assert(results, dfsClicked, 'Graph: DFS 按钮可点击', 'Graph: DFS 按钮不可用');

  await screenshot(page, 'graph.png', results);
}

// ============================================================
// 4. Tree 页
// ============================================================
async function testTree(page, results) {
  console.log('\n=== Tree 页验证 ===');
  await page.goto(BASE_URL + 'tree', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1200);
  await closeModalIfOpen(page);

  const title = await page.locator('h1').first().textContent().catch(() => '');
  await assert(results, title.includes('二叉树'), 'Tree: 页面标题正确', `Tree: 页面标题不正确 (${title})`);
  await assert(results, (await page.locator('svg').count()) > 0, 'Tree: SVG 可视化区域存在', 'Tree: SVG 区域不存在');

  for (const val of ['50', '30', '70']) {
    const inputs = await getVisibleInputs(page);
    if (inputs.length > 0) await fillInput(page, inputs[0], val);
    await sleep(200);
    await doOperation(page, /^插入$/, 2000);
  }
  const nodeCount = await page.locator('svg circle').count();
  await assert(results, nodeCount >= 3, `Tree: 插入 50/30/70 后渲染了 ${nodeCount} 个节点`, 'Tree: 插入节点后未渲染');

  const inorderClicked = await doOpAndWait(page, /中序/, /更多/, 5000);
  await assert(results, inorderClicked, 'Tree: 中序遍历按钮可点击', 'Tree: 中序遍历按钮不可用');

  // 重新触发中序遍历，验证延迟/动画期间插入按钮被禁用
  const inorderBtn = page.locator('button').filter({ hasText: /中序/ }).first();
  if ((await inorderBtn.count()) > 0) {
    await inorderBtn.click({ force: true });
    await sleep(200);
    const insertBtn = page.locator('button').filter({ hasText: /^插入$/ }).first();
    const insertDisabled = await insertBtn.isDisabled().catch(() => true);
    await assert(results, insertDisabled, 'Tree: 中序遍历期间插入按钮被禁用', 'Tree: 中序遍历期间插入按钮未被禁用');
    await waitForAnimationComplete(page, 5000);
  } else {
    recordFail(results, 'Tree: 未找到中序遍历按钮');
  }

  await screenshot(page, 'tree.png', results);
}

// ============================================================
// 5. Learning 推荐
// ============================================================
async function testLearning(page, results) {
  console.log('\n=== 学习推荐验证 ===');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(1000);

  const learnCard = page.locator('a[href*="/array"]').first();
  if ((await learnCard.count()) > 0) {
    await learnCard.click();
    await sleep(1000);
    const url = page.url();
    await assert(results, url.includes('/array'), `Learning: 点击学习推荐卡片后跳转到 ${url}`, `Learning: 跳转不正确 (${url})`);

    const content = await page.locator('h1').first().textContent({ timeout: 5000 }).catch(() => '');
    await assert(results, content.includes('数组'), 'Learning: 目标页面内容已加载', `Learning: 目标页面内容未加载 (${content})`);

    await screenshot(page, 'learning.png', results);
  } else {
    recordFail(results, 'Learning: 首页未找到学习推荐卡片');
  }
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  const results = createResults('最终人工确认验证');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.route('**/sw.js', route => route.abort());
  await page.route('**/workbox-*.js', route => route.abort());
  page.on('dialog', dialog => dialog.accept());

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  try {
    await testHome(page, results);
    await testArray(page, results);
    await testGraph(page, results);
    await testTree(page, results);
    await testLearning(page, results);
  } catch (error) {
    recordFail(results, `执行异常: ${error.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png'), fullPage: false }).catch(() => {});
  } finally {
    await browser.close();
  }

  // 报告
  console.log('\n' + '='.repeat(60));
  console.log('最终人工确认验证报告');
  console.log('='.repeat(60));
  console.log(`通过: ${results.passed.length}`);
  console.log(`失败: ${results.failed.length}`);
  results.passed.forEach(p => console.log(`  ✅ ${p}`));
  results.failed.forEach(f => console.log(`  ❌ ${f}`));

  const relevantErrors = consoleErrors.filter(e =>
    !e.includes('MaxListeners') &&
    !e.includes('Failed to load resource') &&
    !e.includes('favicon')
  );
  console.log(`\n控制台错误: ${relevantErrors.length} 条`);
  if (relevantErrors.length > 0) {
    relevantErrors.slice(0, 10).forEach(e => console.log(`  - ${e.substring(0, 150)}`));
  }

  console.log(`\n截图保存路径: ${SCREENSHOTS_DIR}`);

  const reportPath = path.join(SCREENSHOTS_DIR, 'report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    name: results.name,
    passed: results.passed.length,
    failed: results.failed.length,
    passMessages: results.passed,
    failMessages: results.failed,
    consoleErrors: relevantErrors,
    screenshotDir: SCREENSHOTS_DIR,
    timestamp: new Date().toISOString(),
  }, null, 2));

  process.exit(results.failed.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
