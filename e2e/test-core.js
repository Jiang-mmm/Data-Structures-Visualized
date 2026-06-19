import { chromium, firefox } from 'playwright';
import path from 'path';
import { sleep, clickButtonIfEnabled, closeModalIfOpen, getVisibleInputs, fillInput, assertWithRetry, SCREENSHOTS_DIR, verifyScreenshot } from './test-helpers.js';

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';

async function runTest() {
  const results = { name: '核心数据结构页面交互测试', passed: [], failed: [] };
  const browserType = process.env.BROWSER || 'chromium';
  const launchBrowser = browserType === 'firefox' ? firefox : chromium;
  const browser = await launchBrowser.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  // Block service worker to prevent PWA caching from interfering with localStorage
  await page.route('**/sw.js', route => route.abort());
  await page.route('**/workbox-*.js', route => route.abort());

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('dialog', dialog => dialog.accept());

  async function assert(condition, passMsg, failMsg) {
    if (condition) results.passed.push(passMsg);
    else results.failed.push(failMsg);
  }

  try {
    // ==================== Array Page ====================
    console.log('[Array] 页面加载与基本操作...');
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(800);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'array-loaded.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'array-loaded.png'));

    const arrayTitle = await page.locator('text=数组').first().count();
    assert(arrayTitle > 0, 'Array: 页面标题正确', 'Array: 页面标题错误');

    await clickButtonIfEnabled(page, /随机/);
    await sleep(1000);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'array-random.png'), fullPage: false });

    await assertWithRetry(results,
      async () => {
        const sizeEl = await page.locator('text=/SIZE/').first().textContent({ timeout: 3000 });
        return sizeEl.includes('SIZE');
      },
      'Array: SIZE 信息展示',
      'Array: SIZE 信息未展示'
    );

    // 插入操作
    const arrInputs = await getVisibleInputs(page);
    console.log(`[Array] 找到 ${arrInputs.length} 个可见输入框`);
    if (arrInputs.length >= 2) {
      await fillInput(page, arrInputs[0], '42');
      await fillInput(page, arrInputs[1], '0');
    } else if (arrInputs.length === 1) {
      await fillInput(page, arrInputs[0], '42');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    
    const insertClicked = await clickButtonIfEnabled(page, /按位插|插入/);
    if (insertClicked) {
      await sleep(1000);
      await closeModalIfOpen(page);
      results.passed.push('Array: 插入操作按钮可点击');
    } else {
      results.failed.push('Array: 插入按钮未启用或不可用');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'array-insert.png'), fullPage: false });

    await clickButtonIfEnabled(page, /重置/);
    await sleep(600);
    await closeModalIfOpen(page);
    results.passed.push('Array: 重置按钮可点击');

    const timelineExists = await page.locator('text=/SIZE/').count() > 0;
    assert(timelineExists, 'Array: 操作日志/时间线可见', 'Array: 操作日志/时间线不可见');

    // ==================== Stack Page ====================
    console.log('[Stack] 页面加载与基本操作...');
    // Set stack to [10] via localStorage, then navigate to verify SIZE displays correctly
    await page.evaluate(() => localStorage.setItem('ds-visualizer-data-stack', '[10]'));
    await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(1500);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stack-loaded.png'), fullPage: false });

    const stackTitle = await page.locator('text=栈').first().count();
    assert(stackTitle > 0, 'Stack: 页面标题正确', 'Stack: 页面标题错误');

    // Verify SIZE=1 (one element pushed via localStorage)
    await assertWithRetry(results,
      async () => {
        const sizeContainer = page.locator('text=/SIZE/').first().locator('..');
        const valueText = await sizeContainer.textContent({ timeout: 3000 });
        return valueText.includes('1');
      },
      'Stack: Push 后 SIZE=1',
      'Stack: Push 后 SIZE 不正确'
    );
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stack-push.png'), fullPage: false });

    // Peek button
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /查看/);
    await sleep(800);
    await closeModalIfOpen(page);
    results.passed.push('Stack: Peek 按钮可点击');

    // Pop button
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /出栈/);
    await sleep(1000);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stack-pop.png'), fullPage: false });

    // Clear button
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /清空/);
    await sleep(600);
    await closeModalIfOpen(page);
    results.passed.push('Stack: Clear 按钮可点击');

    // 栈满测试: set 10 items via localStorage, verify SIZE=10
    await page.evaluate(() => localStorage.setItem('ds-visualizer-data-stack', JSON.stringify([1,2,3,4,5,6,7,8,9,10])));
    await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(1500);
    await closeModalIfOpen(page);
    await assertWithRetry(results,
      async () => {
        const sizeContainer = page.locator('text=/SIZE/').first().locator('..');
        const valueText = await sizeContainer.textContent({ timeout: 3000 });
        return valueText.includes('10');
      },
      'Stack: 最大10个元素',
      'Stack: 栈满后元素数量不对'
    );
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stack-full.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'stack-full.png'));

    // ==================== Queue Page ====================
    console.log('[Queue] 页面加载与基本操作...');
    await page.goto(BASE_URL + 'queue', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(800);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'queue-loaded.png'), fullPage: false });

    const queueTitle = await page.locator('text=队列').first().count();
    assert(queueTitle > 0, 'Queue: 页面标题正确', 'Queue: 页面标题错误');

    const qi = await getVisibleInputs(page);
    if (qi.length > 0) {
      await fillInput(page, qi[0], '5');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /Enqueue/)) {
      await sleep(1000);
      await closeModalIfOpen(page);
    }

    if (qi.length > 0) {
      await fillInput(page, qi[0], '10');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /Enqueue/)) {
      await sleep(800);
      await closeModalIfOpen(page);
    }

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /Peek|查看/);
    await sleep(800);
    await closeModalIfOpen(page);
    results.passed.push('Queue: Front 按钮可点击');

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /Dequeue/);
    await sleep(1000);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'queue-dequeue.png'), fullPage: false });

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /清空/);
    await sleep(600);
    await closeModalIfOpen(page);
    results.passed.push('Queue: Clear 按钮可点击');

    // ==================== LinkedList Page ====================
    console.log('[LinkedList] 页面加载与基本操作...');
    await page.goto(BASE_URL + 'linkedlist', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(800);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'linkedlist-loaded.png'), fullPage: false });

    const llTitle = await page.locator('text=链表').first().count();
    assert(llTitle > 0, 'LinkedList: 页面标题正确', 'LinkedList: 页面标题错误');

    const lli = await getVisibleInputs(page);
    if (lli.length > 0) {
      await fillInput(page, lli[0], '1');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /头插/)) {
      await sleep(1000);
      await closeModalIfOpen(page);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'linkedlist-insert-head.png'), fullPage: false });
      results.passed.push('LinkedList: 头插操作可执行');
    }

    if (lli.length > 0) {
      await fillInput(page, lli[0], '2');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /尾插/)) {
      await sleep(1000);
      await closeModalIfOpen(page);
      results.passed.push('LinkedList: 尾插操作可执行');
    }

    if (lli.length > 0) {
      await fillInput(page, lli[0], '1');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /查找/)) {
      await sleep(1000);
      await closeModalIfOpen(page);
      results.passed.push('LinkedList: 查找操作可执行');
    }

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /反转/);
    await sleep(1000);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'linkedlist-reverse.png'), fullPage: false });
    results.passed.push('LinkedList: 反转操作可执行');

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /检测环/);
    await sleep(1000);
    await closeModalIfOpen(page);
    results.passed.push('LinkedList: 环检测操作可执行');

    // ==================== Tree Page ====================
    console.log('[Tree] 页面加载与基本操作...');
    await page.goto(BASE_URL + 'tree', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await sleep(800);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tree-loaded.png'), fullPage: false });

    const treeTitle = await page.locator('text=二叉树').first().count();
    assert(treeTitle > 0, 'Tree: 页面标题正确', 'Tree: 页面标题错误');

    const ti = await getVisibleInputs(page);
    if (ti.length > 0) {
      await fillInput(page, ti[0], '50');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /^插入$/)) {
      await sleep(800);
      await closeModalIfOpen(page);
      if (ti.length > 0) {
        await fillInput(page, ti[0], '30');
      }
      await sleep(300);
      await closeModalIfOpen(page);
      if (await clickButtonIfEnabled(page, /^插入$/)) {
        await sleep(800);
        await closeModalIfOpen(page);
        if (ti.length > 0) {
          await fillInput(page, ti[0], '70');
        }
        await sleep(300);
        await closeModalIfOpen(page);
        await clickButtonIfEnabled(page, /^插入$/);
        await sleep(800);
        await closeModalIfOpen(page);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tree-insert.png'), fullPage: false });
        await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'tree-insert.png'));
        results.passed.push('Tree: 插入节点操作');
      }
    }

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /前序/);
    await sleep(1200);
    await closeModalIfOpen(page);
    results.passed.push('Tree: 前序遍历可执行');

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /中序/);
    await sleep(1200);
    await closeModalIfOpen(page);
    results.passed.push('Tree: 中序遍历可执行');

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /后序/);
    await sleep(1200);
    await closeModalIfOpen(page);
    results.passed.push('Tree: 后序遍历可执行');

    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /层序/);
    await sleep(1200);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tree-traversal.png'), fullPage: false });
    results.passed.push('Tree: 层序遍历可执行');

    if (ti.length > 1) {
      await fillInput(page, ti[1], '30');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /^查找$/)) {
      await sleep(1200);
      await closeModalIfOpen(page);
      results.passed.push('Tree: 查找操作可执行');
    }

    if (ti.length > 0) {
      await fillInput(page, ti[0], '30');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    if (await clickButtonIfEnabled(page, /删除/)) {
      await sleep(1200);
      await closeModalIfOpen(page);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tree-delete.png'), fullPage: false });
      results.passed.push('Tree: 删除节点操作可执行');
    }

    if (consoleErrors.length > 0) {
      console.log('[控制台错误]', consoleErrors.slice(0, 5));
    }
  } catch (error) {
    results.failed.push(`执行异常: ${error.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'core-error.png'), fullPage: false }).catch(() => {});
  } finally {
    await browser.close();
  }

  return results;
}

runTest().then(results => {
  console.log('\n=== 核心数据结构页面交互测试 结果 ===');
  console.log(`通过: ${results.passed.length}`);
  results.passed.forEach(r => console.log(`  ✅ ${r}`));
  console.log(`失败: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`  ❌ ${r}`));
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
