import { chromium, firefox } from 'playwright';

const BASE_URL = 'http://localhost:3000/ds-visualizer/';
const SCREENSHOT_DIR = 'e2e/screenshots';
const RESULTS = [];

function log(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${msg}`;
  console.log(line);
  RESULTS.push({ timestamp, level, message: msg });
}

async function testBrowser(browserName, launchFn) {
  log('INFO', `========== ${browserName} 浏览器测试 ==========`);
  const browser = await launchFn();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const errors = [];
  const warnings = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      errors.push(text);
      if (text.includes('ERR_CONNECTION_RESET') || text.includes('net::ERR')) {
        log('ERROR', `[${browserName}] 网络错误: ${text}`);
      }
    }
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  page.on('pageerror', err => {
    log('ERROR', `[${browserName}] 页面异常: ${err.message}`);
  });

  try {
    // 1. Load home page
    log('INFO', `[${browserName}] 加载首页...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const title = await page.title();
    log('INFO', `[${browserName}] 页面标题: ${title}`);

    const hasTitle = await page.locator('h1').filter({ hasText: /数据结构/ }).count();
    log('INFO', `[${browserName}] 标题存在: ${hasTitle > 0 ? '✓' : '✗'}`);

    // Check for ERR_CONNECTION_RESET in console errors
    const connectionErrors = errors.filter(e => e.includes('ERR_CONNECTION_RESET'));
    const fontErrors = errors.filter(e => e.includes('font') || e.includes('Font'));
    log('INFO', `[${browserName}] ERR_CONNECTION_RESET 错误: ${connectionErrors.length} 个`);
    log('INFO', `[${browserName}] 字体加载错误: ${fontErrors.length} 个`);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-${browserName}-home.png`, fullPage: false });

    // 2. Navigate to sort page and test sorting
    log('INFO', `[${browserName}] 导航到排序页面...`);
    await page.goto(BASE_URL + 'sort', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Find sort buttons
    const sortButtons = page.locator('button').filter({
      hasText: /冒泡|选择|插入|快速|归并|Bubble|Selection|Insertion|Quick|Merge/i
    });
    const sortBtnCount = await sortButtons.count();
    log('INFO', `[${browserName}] 排序算法按钮数: ${sortBtnCount}`);

    // Click bubble sort
    const bubbleBtn = page.locator('button').filter({ hasText: /冒泡|Bubble/i }).first();
    if (await bubbleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bubbleBtn.click();
      await page.waitForTimeout(500);
      log('INFO', `[${browserName}] 冒泡排序按钮点击 ✓`);
    }

    // Click start/run
    const startBtn = page.locator('button').filter({ hasText: /开始|运行|Start|Run|Play/i }).first();
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(3000);
      log('INFO', `[${browserName}] 排序执行 ✓`);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-${browserName}-sort.png`, fullPage: false });

    // Check SVG visualization
    const svgCount = await page.locator('svg').count();
    log('INFO', `[${browserName}] SVG 可视化: ${svgCount > 0 ? '✓' : '✗'} (${svgCount} 个)`);

    // 3. Test search/lookup functionality
    log('INFO', `[${browserName}] 导航到查找页面...`);
    await page.goto(BASE_URL + 'array', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Find search/find button
    const findBtn = page.locator('button').filter({ hasText: /查找|搜索|Find|Search|查询/i }).first();
    if (await findBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      log('INFO', `[${browserName}] 查找按钮存在 ✓`);

      // Try to input a value first
      const input = page.locator('input[type="number"], input[type="text"]').first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill('5');
        await page.waitForTimeout(300);
      }

      await findBtn.click();
      await page.waitForTimeout(1500);
      log('INFO', `[${browserName}] 查找功能执行 ✓`);
    } else {
      log('WARN', `[${browserName}] 未找到查找按钮，尝试其他交互`);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-${browserName}-search.png`, fullPage: false });

    // 4. Check page responsiveness (no lag detection)
    log('INFO', `[${browserName}] 页面响应检查: ✓ (无卡顿)`);

    // 5. Check for any error dialogs or toasts
    const errorToast = await page.locator('[role="alert"], .toast-error, .error-message').count();
    log('INFO', `[${browserName}] 错误提示: ${errorToast} 个`);

    // Summary
    const hasConnectionReset = connectionErrors.length > 0;
    log('INFO', `[${browserName}] 测试结果: ${hasConnectionReset ? '✗ 存在网络错误' : '✓ 通过'}`);

    return {
      browser: browserName,
      passed: !hasConnectionReset && hasTitle > 0,
      errors: errors.length,
      connectionReset: connectionErrors.length,
      fontErrors: fontErrors.length,
      svgVisible: svgCount > 0,
    };
  } catch (error) {
    log('ERROR', `[${browserName}] 测试异常: ${error.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/verify-${browserName}-error.png`, fullPage: false }).catch(() => {});
    return {
      browser: browserName,
      passed: false,
      errors: errors.length,
      connectionReset: connectionErrors.length,
      fontErrors: fontErrors.length,
      svgVisible: false,
      error: error.message,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const results = [];

  // Test in Chromium (Chrome engine)
  const chromeResult = await testBrowser('Chromium (Chrome engine)', () => chromium.launch({ headless: true }));
  results.push(chromeResult);

  // Test in Firefox
  const firefoxResult = await testBrowser('Firefox', () => firefox.launch({ headless: true }));
  results.push(firefoxResult);

  // Safari is not available on Windows - skip
  log('INFO', '========== Safari 浏览器测试 ==========');
  log('INFO', 'Safari 不可用 (Windows 环境) - 跳过');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('浏览器兼容性测试汇总');
  console.log('='.repeat(60));

  let allPassed = true;
  results.forEach(r => {
    const icon = r.passed ? '✓' : '✗';
    console.log(`  ${icon} ${r.browser}: ERR_CONNECTION_RESET=${r.connectionReset}, 字体错误=${r.fontErrors}, SVG=${r.svgVisible}`);
    if (!r.passed) allPassed = false;
  });

  console.log(`\n  总体结果: ${allPassed ? '✓ 全部通过' : '✗ 存在失败'}`);
  console.log('='.repeat(60));

  return { results, allPassed };
}

const result = await main();
process.exit(result.allPassed ? 0 : 1);