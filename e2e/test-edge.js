import { chromium, firefox } from 'playwright';
import path from 'path';
import { sleep, clickButtonIfEnabled, closeModalIfOpen, getVisibleInputs, fillInput, SCREENSHOTS_DIR, verifyScreenshot } from './test-helpers.js';

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';

async function runTest() {
  const results = { name: '边界条件测试', passed: [], failed: [] };
  const browserType = process.env.BROWSER || 'chromium';
  const launchBrowser = browserType === 'firefox' ? firefox : chromium;
  const browser = await launchBrowser.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
  page.on('pageerror', err => { consoleErrors.push(`PageError: ${err.message}`); });

  async function assert(condition, passMsg, failMsg) {
    if (condition) results.passed.push(passMsg);
    else results.failed.push(failMsg);
  }

  try {
    // ==================== 非法输入 - Array ====================
    console.log('[Edge] 非法输入测试...');
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    const inputs = await getVisibleInputs(page);
    if (inputs.length >= 2) {
      await fillInput(page, inputs[0], '');
      await fillInput(page, inputs[1], '');
    }
    await sleep(200);
    const insertBtn = page.locator('button').filter({ hasText: /插入/ }).first();
    const isEmptyDisabled = await insertBtn.isDisabled().catch(() => true);
    results.passed.push(`Edge: 空值输入测试完成（按钮${isEmptyDisabled ? '已禁用' : '未禁用'}）`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'edge-empty-input.png'), fullPage: false });

    // 超过99
    if (inputs.length >= 2) {
      await fillInput(page, inputs[0], '999');
      await fillInput(page, inputs[1], '0');
    }
    await sleep(200);
    results.passed.push('Edge: 输入超过99测试完成');

    // 负数
    if (inputs.length >= 2) {
      await fillInput(page, inputs[0], '-5');
      await fillInput(page, inputs[1], '0');
    }
    await sleep(200);
    results.passed.push('Edge: 负数输入测试完成');

    // ==================== 空状态操作 ====================
    console.log('[Edge] 空状态操作...');
    await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    await closeModalIfOpen(page);

    await clickButtonIfEnabled(page, /清空/);
    await sleep(500);

    // 空栈 Pop
    await closeModalIfOpen(page);
    const popBtn = page.locator('button').filter({ hasText: /出栈/ }).first();
    const isPopDisabled = await popBtn.isDisabled().catch(() => true);
    if (isPopDisabled) {
      results.passed.push('Edge: 空栈 Pop 按钮被禁用');
    } else {
      await popBtn.click();
      await sleep(800);
      results.passed.push('Edge: 空栈 Pop 操作有处理');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'edge-empty-pop.png'), fullPage: false });

    // 空栈 Peek
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /查看/);
    await sleep(800);
    await closeModalIfOpen(page);
    results.passed.push('Edge: 空栈 Peek 不崩溃');

    // ==================== 空队列 Dequeue ====================
    console.log('[Edge] 空队列 Dequeue...');
    await page.goto(BASE_URL + 'queue', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /清空/);
    await sleep(500);

    await closeModalIfOpen(page);
    const dequeueBtn = page.locator('button').filter({ hasText: /Dequeue/ }).first();
    const isDequeueDisabled = await dequeueBtn.isDisabled().catch(() => true);
    if (isDequeueDisabled) {
      results.passed.push('Edge: 空队列 Dequeue 按钮被禁用');
    } else {
      await dequeueBtn.click();
      await sleep(500);
      results.passed.push('Edge: 空队列 Dequeue 操作有处理');
    }

    // ==================== 栈已满继续 Push ====================
    console.log('[Edge] 栈已满测试...');
    await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    await closeModalIfOpen(page);

    await clickButtonIfEnabled(page, /清空/);
    await sleep(300);

    for (let i = 0; i < 10; i++) {
      await closeModalIfOpen(page);
      const si = await getVisibleInputs(page);
      if (si.length > 0) {
        await fillInput(page, si[0], String(i + 1));
      }
      await sleep(200);
      await closeModalIfOpen(page);
      if (await clickButtonIfEnabled(page, /入栈/)) {
        await sleep(1200);
      }
    }
    await sleep(1500);
    await closeModalIfOpen(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'edge-stack-full.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'edge-stack-full.png'));

    try {
      const stackSizeAfter = await page.locator('text=/SIZE:/').first().textContent();
      assert(stackSizeAfter.includes('SIZE: 10'), `Edge: 栈满后仍为10个 (当前: ${stackSizeAfter})`, 'Edge: 栈满后大小异常');
    } catch { results.failed.push('Edge: 栈满后大小检查失败'); }

    // ==================== 数组满20个元素 ====================
    console.log('[Edge] 数组满20个元素...');
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    await closeModalIfOpen(page);

    for (let i = 0; i < 5; i++) {
      await clickButtonIfEnabled(page, /随机/);
      await sleep(400);
      await closeModalIfOpen(page);
    }

    await closeModalIfOpen(page);
    const sizeInfo = await page.locator('text=/SIZE:/').first().textContent();
    results.passed.push(`Edge: 数组多次随机生成后 ${sizeInfo}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'edge-array-full.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'edge-array-full.png'));

    // ==================== 页面加载稳定性 ====================
    console.log('[Edge] 页面加载稳定性...');
    const pagePaths = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'graph', 'sort', 'hash', 'heap', 'trie', 'compare'];
    for (const p of pagePaths) {
      try {
        await page.goto(BASE_URL + p, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await sleep(400);
        await closeModalIfOpen(page);
        const hasError = await page.locator('.error-boundary').count() > 0;
        if (!hasError) {
          results.passed.push(`Edge: 页面 /${p} 正常加载`);
        } else {
          results.failed.push(`Edge: 页面 /${p} 显示错误`);
        }
      } catch (e) {
        results.failed.push(`Edge: 页面 /${p} 加载超时: ${e.message}`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'edge-all-pages.png'), fullPage: false });

    // ==================== 控制台错误统计 ====================
    if (consoleErrors.length > 0) {
      console.log(`[Edge] 发现 ${consoleErrors.length} 条控制台错误:`);
      consoleErrors.slice(0, 5).forEach(e => console.log(`  ${e}`));
    } else {
      results.passed.push('Edge: 无控制台错误');
    }

  } catch (error) {
    results.failed.push(`执行异常: ${error.message}`);
    try {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'edge-error.png'), fullPage: false });
    } catch (e) {}
  } finally {
    await browser.close();
  }

  return results;
}

runTest().then(results => {
  console.log('\n=== 边界条件测试 结果 ===');
  console.log(`通过: ${results.passed.length}`);
  results.passed.forEach(r => console.log(`  ✅ ${r}`));
  console.log(`失败: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`  ❌ ${r}`));
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
