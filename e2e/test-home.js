import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifyScreenshot } from './test-helpers.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'http://localhost:3000/ds-visualizer/';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runTest() {
  const results = { name: '首页导航测试', passed: [], failed: [] };
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    // 1. 首页加载验证
    console.log('[测试 1] 首页加载验证...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-loaded.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'home-loaded.png'));

    const hasTitle = await page.locator('h1').filter({ hasText: /数据结构/ }).count();
    if (hasTitle > 0) {
      results.passed.push('首页标题显示正确');
    } else {
      results.failed.push('首页标题未找到');
    }

    // 2. 检查数据结构卡片数量
    console.log('[测试 2] 检查数据结构卡片...');
    const cards = page.locator('a[href*="/"]');
    let cardCount = 0;
    for (const card of await cards.all()) {
      const text = await card.textContent();
      if (text && (text.includes('▦') || text.includes('☰') || text.includes('→') ||
                   text.includes('∞') || text.includes('❖') || text.includes('⬡') ||
                   text.includes('⇅') || text.includes('#') || text.includes('▲') || text.includes('🌳') ||
                   text.includes('Array') || text.includes('Stack') || text.includes('Queue') ||
                   text.includes('Linked') || text.includes('Binary') || text.includes('图') ||
                   text.includes('排序') || text.includes('哈希') || text.includes('堆') ||
                   text.includes('字典') || text.includes('对比'))) {
        cardCount++;
      }
    }
    if (cardCount >= 7) {
      results.passed.push(`找到 ${cardCount} 个数据结构卡片`);
    } else {
      results.failed.push(`仅找到 ${cardCount} 个数据结构卡片`);
    }

    // 3. 点击数据结构卡片跳转 - href 包含 basename
    console.log('[测试 3] 点击数据结构卡片跳转...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    const arrayCard = page.locator('a[href*="/array"]').first();
    if (await arrayCard.count() > 0) {
      await arrayCard.click();
      await sleep(800);
      const currentUrl = page.url();
      if (currentUrl.includes('array')) {
        results.passed.push('点击数组卡片跳转正确');
      } else {
        results.failed.push(`点击数组卡片后 URL 不正确: ${currentUrl}`);
      }
    } else {
      results.failed.push('未找到数组卡片');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-card-click.png'), fullPage: false });

    // 4. 侧边栏导航
    console.log('[测试 4] 侧边栏导航...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    const stackLink = page.locator('a[href*="/stack"]').first();
    if (await stackLink.count() > 0) {
      await stackLink.click();
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-stack.png'), fullPage: false });
      const currentUrl = page.url();
      if (currentUrl.includes('stack')) {
        results.passed.push('侧边栏点击栈链接跳转正确');
      } else {
        results.failed.push(`侧边栏点击栈链接后 URL 不正确: ${currentUrl}`);
      }
    } else {
      results.failed.push('侧边栏中未找到栈链接');
    }

    // 5. 侧边栏折叠/展开
    console.log('[测试 5] 侧边栏折叠/展开...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    const collapseBtn = page.locator('button').filter({ hasText: /◀/ }).first();
    if (await collapseBtn.count() > 0) {
      await collapseBtn.click();
      await sleep(400);
      results.passed.push('侧边栏折叠按钮可点击');
    } else {
      results.failed.push('未找到侧边栏折叠按钮');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-collapse.png'), fullPage: false });

    // 6. 主题切换
    console.log('[测试 6] 主题切换...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    const themeBtn = page.locator('button[title*="主题"]').first();
    if (await themeBtn.count() > 0) {
      await themeBtn.click();
      await sleep(300);
      results.passed.push('主题切换按钮可点击');
    } else {
      results.failed.push('未找到主题切换按钮');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-toggle.png'), fullPage: false });

    // 7. 键盘快捷键帮助
    console.log('[测试 7] 键盘快捷键帮助...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.keyboard.press('?');
    await sleep(600);
    const helpDialog = await page.locator('text=键盘快捷键').first().count();
    if (helpDialog > 0) {
      results.passed.push('按下 ? 键打开快捷键帮助');
    } else {
      results.failed.push('按下 ? 键未显示快捷键帮助');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'keyboard-help.png'), fullPage: false });
    await page.keyboard.press('Escape');
    await sleep(300);

    // 8. 国际化检查
    console.log('[测试 8] 国际化检查...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(500);
    const hasChinese = await page.locator('text=数据结构').first().count();
    if (hasChinese > 0) {
      results.passed.push('默认语言为中文');
    } else {
      results.failed.push('默认语言非中文');
    }
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-i18n.png'), fullPage: false });

    if (consoleErrors.length > 0) {
      console.log('[控制台错误]', consoleErrors.slice(0, 10));
    }
  } catch (error) {
    results.failed.push(`执行异常: ${error.message}`);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'home-error.png'), fullPage: false }).catch(() => {});
  } finally {
    await browser.close();
  }

  return results;
}

runTest().then(results => {
  console.log('\n=== 首页导航测试 结果 ===');
  console.log(`通过: ${results.passed.length}`);
  results.passed.forEach(r => console.log(`  ✅ ${r}`));
  console.log(`失败: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`  ❌ ${r}`));
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
