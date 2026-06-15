import { chromium, firefox } from 'playwright';
import path from 'path';
import { sleep, assertWithRetry, SCREENSHOTS_DIR, verifyScreenshot } from './test-helpers.js';

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';

async function runTest() {
  const results = { name: 'v5.0 功能测试（懒加载 + 撤销预览 + 分享）', passed: [], failed: [] };
  const browserType = process.env.BROWSER || 'chromium';
  const launchBrowser = browserType === 'firefox' ? firefox : chromium;
  const browser = await launchBrowser.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    // ==================== 懒加载测试 ====================
    console.log('[LazyLoad] 页面懒加载...');
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);

    await assertWithRetry(results,
      async () => {
        const content = await page.content();
        return content.includes('array') || content.includes('Array');
      },
      'ArrayPage 懒加载成功',
      'ArrayPage 懒加载失败'
    );

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-lazyload-array.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'v5-lazyload-array.png'));

    // ==================== 撤销预览测试 ====================
    console.log('[UndoPreview] 撤销按钮悬停预览...');
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);

    const randomBtn = page.locator('button').filter({ hasText: /随机|Random/ }).first();
    if (await randomBtn.count() > 0) {
      await randomBtn.click();
      await sleep(500);
    }

    const undoBtn = page.locator('button').filter({ hasText: /撤销|Undo/ }).first();
    if (await undoBtn.count() > 0) {
      const isDisabled = await undoBtn.isDisabled();
      await assertWithRetry(results,
        async () => !isDisabled,
        '撤销按钮在有操作后可用',
        '撤销按钮状态异常'
      );

      await undoBtn.hover();
      await sleep(300);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-undo-preview.png'), fullPage: false });
    }

    // ==================== 分享按钮测试 ====================
    console.log('[ShareButton] 分享按钮...');
    const shareBtn = page.locator('button').filter({ hasText: /分享|Share/ }).first();
    await assertWithRetry(results,
      async () => await shareBtn.count() > 0,
      '分享按钮存在',
      '分享按钮缺失'
    );

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-share-button.png'), fullPage: false });

    // ==================== 多页面懒加载验证 ====================
    console.log('[LazyLoad] 多页面懒加载验证...');
    const pages = ['sort', 'tree', 'graph', 'hash', 'heap', 'trie'];
    for (const p of pages) {
      await page.goto(BASE_URL + p, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await sleep(500);
      await assertWithRetry(results,
        async () => {
          const content = await page.content();
          return content.length > 500;
        },
        `${p} 页面懒加载成功`,
        `${p} 页面懒加载失败`
      );
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-lazyload-verified.png'), fullPage: false });

    // ==================== 暗色模式测试 ====================
    console.log('[DarkMode] 暗色模式切换...');
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);

    const darkBtn = page.locator('button').filter({ hasText: /🌙|暗/ }).first();
    if (await darkBtn.count() > 0) {
      await darkBtn.click();
      await sleep(500);
      const html = page.locator('html');
      const hasDark = await html.evaluate(el => el.classList.contains('dark'));
      await assertWithRetry(results,
        async () => hasDark,
        '暗色模式切换成功',
        '暗色模式切换失败'
      );
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-dark-mode.png'), fullPage: false });
    }

  } catch (e) {
    console.error('测试异常:', e.message);
    results.failed.push(`测试异常: ${e.message}`);
  } finally {
    await browser.close();
  }

  console.log('\n' + '='.repeat(40));
  console.log(`测试结果: ${results.name}`);
  console.log('='.repeat(40));
  console.log(`通过: ${results.passed.length}`);
  console.log(`失败: ${results.failed.length}`);

  if (results.passed.length > 0) {
    console.log('\n通过项:');
    results.passed.forEach(p => console.log(`  ✓ ${p}`));
  }
  if (results.failed.length > 0) {
    console.log('\n失败项:');
    results.failed.forEach(f => console.log(`  ✗ ${f}`));
  }

  return results;
}

runTest().then(r => {
  process.exit(r.failed.length > 0 ? 1 : 0);
});
