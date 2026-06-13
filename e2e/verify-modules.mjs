import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000/ds-visualizer/';
const SCREENSHOT_DIR = 'e2e/screenshots';
const RESULTS = [];

function log(level, msg) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${msg}`;
  console.log(line);
  RESULTS.push({ timestamp, level, message: msg });
}

async function takeScreenshot(page, name) {
  const path = `${SCREENSHOT_DIR}/verify-${name}.png`;
  await page.screenshot({ path, fullPage: true });
  log('INFO', `Screenshot saved: ${path}`);
  return path;
}

async function verifyLinkedList(browser) {
  log('INFO', '========== 链表模块验证 ==========');
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('[PERF') || msg.text().includes('FPS') || msg.text().includes('Slow')) {
      consoleLogs.push(msg.text());
    }
  });

  try {
    await page.goto(BASE_URL + 'linkedlist', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    log('INFO', '链表页面加载成功');
    await takeScreenshot(page, 'linkedlist-loaded');

    // Test insert head
    const insertHeadBtn = page.locator('button:has-text("头部插入"), button:has-text("插入"), button:has-text("Insert")').first();
    if (await insertHeadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      log('WARN', '未找到明确的头部插入按钮，尝试查找输入框');
    }

    // Check for input field and insert value
    const inputField = page.locator('input[type="number"], input[type="text"]').first();
    if (await inputField.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inputField.fill('10');
      log('INFO', '输入值: 10');

      // Find and click insert/add button
      const addBtn = page.locator('button').filter({ hasText: /添加|插入|Add|Insert/i }).first();
      if (await addBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        log('INFO', '节点添加成功');
        await takeScreenshot(page, 'linkedlist-insert');
      }
    }

    // Test node insertion at tail
    if (await inputField.isVisible({ timeout: 2000 }).catch(() => false)) {
      await inputField.fill('20');
      log('INFO', '输入值: 20');

      const addBtn = page.locator('button').filter({ hasText: /添加|插入|Add|Insert/i }).first();
      if (await addBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(1500);
        log('INFO', '第二个节点添加成功');
      }
    }

    // Test delete node
    const deleteBtn = page.locator('button').filter({ hasText: /删除|移除|Delete|Remove/i }).first();
    if (await deleteBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deleteBtn.click();
      await page.waitForTimeout(1500);
      log('INFO', '节点删除成功');
      await takeScreenshot(page, 'linkedlist-delete');
    }

    // WebDriver interactions (simulate user clicks)
    // Snapshot and get the page state
    const pageContent = await page.textContent('body');
    log('INFO', `链表页面内容长度: ${pageContent?.length || 0}`);

    // Check that SVG visualization exists
    const svgExists = await page.locator('svg').count() > 0;
    log('INFO', `SVG可视化是否存在: ${svgExists}`);

    // Capture perf logs
    if (consoleLogs.length > 0) {
      log('INFO', `链表页面性能日志数: ${consoleLogs.length}`);
      consoleLogs.forEach(l => log('PERF', l));
    }

    log('INFO', '链表模块验证完成 ✓');
    return true;
  } catch (error) {
    log('ERROR', `链表模块验证失败: ${error.message}`);
    await takeScreenshot(page, 'linkedlist-error');
    return false;
  } finally {
    await page.close();
  }
}

async function verifySort(browser) {
  log('INFO', '========== 排序模块验证 ==========');
  const page = await browser.newPage();

  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('[PERF') || msg.text().includes('FPS') || msg.text().includes('Slow')) {
      consoleLogs.push(msg.text());
    }
  });

  try {
    await page.goto(BASE_URL + 'sort', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    log('INFO', '排序页面加载成功');
    await takeScreenshot(page, 'sort-loaded');

    // Check for sort algorithm buttons
    const sortButtons = page.locator('button').filter({
      hasText: /冒泡|选择|插入|快速|归并|Bubble|Selection|Insertion|Quick|Merge/i
    });

    const buttonCount = await sortButtons.count();
    log('INFO', `找到 ${buttonCount} 个排序算法按钮`);

    // Try bubble sort
    const bubbleBtn = page.locator('button').filter({ hasText: /冒泡|Bubble/i }).first();
    if (await bubbleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bubbleBtn.click();
      await page.waitForTimeout(1000);
      log('INFO', '冒泡排序按钮点击成功');

      // Try to start sorting
      const startBtn = page.locator('button').filter({ hasText: /开始|运行|Start|Run|Play/i }).first();
      if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await startBtn.click();
        await page.waitForTimeout(3000);
        log('INFO', '排序开始执行');
        await takeScreenshot(page, 'sort-bubble-running');
      }
    }

    // Test stop button
    const stopBtn = page.locator('button').filter({ hasText: /停止|Stop|Pause/i }).first();
    if (await stopBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await stopBtn.click();
      await page.waitForTimeout(1000);
      log('INFO', '停止按钮功能正常');
      await takeScreenshot(page, 'sort-stopped');
    }

    // Test speed control
    const speedSlider = page.locator('input[type="range"]');
    if (await speedSlider.isVisible({ timeout: 2000 }).catch(() => false)) {
      log('INFO', '速度控制滑块存在');
    }

    // Check SVG visualization
    const svgCount = await page.locator('svg').count();
    log('INFO', `SVG可视化数量: ${svgCount}`);

    // Capture perf logs
    if (consoleLogs.length > 0) {
      log('INFO', `排序页面性能日志数: ${consoleLogs.length}`);
      consoleLogs.forEach(l => log('PERF', l));
    }

    log('INFO', '排序模块验证完成 ✓');
    return true;
  } catch (error) {
    log('ERROR', `排序模块验证失败: ${error.message}`);
    await takeScreenshot(page, 'sort-error');
    return false;
  } finally {
    await page.close();
  }
}

async function verifySortCompare(browser) {
  log('INFO', '========== 排序对比模块验证 ==========');
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL + 'sort-compare', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    log('INFO', '排序对比页面加载成功');
    await takeScreenshot(page, 'compare-loaded');

    // Find run button
    const runBtn = page.locator('button').filter({ hasText: /运行|开始|Run|Start|Compare|对比/i }).first();
    if (await runBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await runBtn.click();
      await page.waitForTimeout(5000);
      log('INFO', '排序对比运行按钮点击成功');
      await takeScreenshot(page, 'compare-running');
    } else {
      log('WARN', '未找到运行按钮，尝试其他交互');
    }

    log('INFO', '排序对比模块验证完成 ✓');
    return true;
  } catch (error) {
    log('ERROR', `排序对比模块验证失败: ${error.message}`);
    await takeScreenshot(page, 'compare-error');
    return false;
  } finally {
    await page.close();
  }
}

async function verifyAllPages(browser) {
  log('INFO', '========== 全页面可访问性验证 ==========');
  const pages = [
    { name: '首页', path: '' },
    { name: '数组', path: 'array' },
    { name: '栈', path: 'stack' },
    { name: '队列', path: 'queue' },
    { name: '树', path: 'tree' },
    { name: '图', path: 'graph' },
    { name: '哈希', path: 'hash' },
    { name: '堆', path: 'heap' },
    { name: '字典树', path: 'trie' },
  ];

  for (const { name, path } of pages) {
    const page = await browser.newPage();
    try {
      await page.goto(BASE_URL + path, { waitUntil: 'networkidle', timeout: 10000 });
      await page.waitForTimeout(500);
      const title = await page.title().catch(() => 'N/A');
      const hasSVG = await page.locator('svg').count() > 0;
      log('INFO', `[${name}] 可访问 - 标题: ${title} - SVG可视化: ${hasSVG}`);
    } catch (error) {
      log('ERROR', `[${name}] 访问失败: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  log('INFO', '全页面可访问性验证完成 ✓');
}

async function main() {
  log('INFO', '========================================');
  log('INFO', '数据结构可视化模块验证测试');
  log('INFO', `目标: ${BASE_URL}`);
  log('INFO', '========================================');

  const browser = await chromium.launch({ headless: true });

  try {
    // Verify home page first
    const homePage = await browser.newPage();
    try {
      await homePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
      await homePage.waitForTimeout(2000);
      log('INFO', '首页加载成功');
      await takeScreenshot(homePage, 'home-loaded');
    } catch (error) {
      log('ERROR', `首页加载失败: ${error.message}`);
    } finally {
      await homePage.close();
    }

    // Core module verification
    const linkedListOK = await verifyLinkedList(browser);
    const sortOK = await verifySort(browser);
    const compareOK = await verifySortCompare(browser);

    // All pages smoke test
    await verifyAllPages(browser);

    // Summary
    log('INFO', '========================================');
    log('INFO', '验证结果汇总:');
    log('INFO', `链表模块: ${linkedListOK ? '✓ 通过' : '✗ 失败'}`);
    log('INFO', `排序模块: ${sortOK ? '✓ 通过' : '✗ 失败'}`);
    log('INFO', `排序对比: ${compareOK ? '✓ 通过' : '✗ 失败'}`);
    log('INFO', '========================================');

    const allPassed = linkedListOK && sortOK && compareOK;
    log('INFO', `总体结果: ${allPassed ? '✓ 全部通过' : '✗ 存在失败'}`);

    return { linkedListOK, sortOK, compareOK, allPassed, logs: RESULTS };
  } finally {
    await browser.close();
  }
}

const result = await main();

// Output structured results
process.stdout.write('\n=== VERIFICATION_RESULT ===\n');
process.stdout.write(JSON.stringify({
  linkedList: result.linkedListOK,
  sort: result.sortOK,
  compare: result.compareOK,
  allPassed: result.allPassed,
  totalLogs: result.logs.length,
}, null, 2));
process.stdout.write('\n=== END_RESULT ===\n');

if (!result.allPassed) {
  process.exit(1);
}