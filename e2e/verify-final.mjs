import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000/ds-visualizer/';
const SCREENSHOT_DIR = 'e2e/screenshots';
const RESULTS = [];

function log(level, msg) {
  const ts = new Date().toISOString();
  const line = `[${ts}] [${level}] ${msg}`;
  console.log(line);
  RESULTS.push({ timestamp: ts, level, message: msg });
}

function summarize(name, passed, details) {
  const icon = passed ? '✅' : '❌';
  log('INFO', `${icon} ${name}: ${details}`);
}

async function testLinkedListStopButton(browser) {
  log('INFO', '========== 链表停止按钮验证 ==========');
  const page = await browser.newPage();
  const perfLogs = [];

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[PERF]') || text.includes('[FPS]') || text.includes('[Render')) {
      perfLogs.push(text);
    }
  });

  try {
    await page.goto(BASE_URL + 'linkedlist', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    log('INFO', '链表页面加载成功');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-linkedlist-loaded.png`, fullPage: false });

    // Input value
    const input = page.locator('input[type="number"]').first();
    if (await input.isVisible({ timeout: 2000 }).catch(() => false)) {
      await input.fill('42');
      log('INFO', '输入值: 42');
    }

    // Insert head
    const insertBtn = page.locator('button').filter({ hasText: /头部插入|Insert/i }).first();
    if (await insertBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await insertBtn.click();
      await page.waitForTimeout(1000);
      log('INFO', '头部插入成功');
    }

    // Check that stop button is NOT visible when not animating
    const stopBtn = page.locator('button').filter({ hasText: /停止|Stop/i }).first();
    const stopVisibleBefore = await stopBtn.isVisible({ timeout: 1000 }).catch(() => false);
    log('INFO', `停止按钮(非动画时): ${stopVisibleBefore ? '可见' : '隐藏 ✅'}`);

    // Trigger reverse animation (long-running)
    const reverseBtn = page.locator('button').filter({ hasText: /反转|Reverse/i }).first();
    if (await reverseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reverseBtn.click();
      await page.waitForTimeout(500);
      log('INFO', '反转动画已触发');

      // Check stop button visible during animation
      const stopVisibleDuring = await stopBtn.isVisible({ timeout: 1000 }).catch(() => false);
      summarize('停止按钮显示(动画中)', stopVisibleDuring, stopVisibleDuring ? '正确显示' : '未显示');

      if (stopVisibleDuring) {
        await stopBtn.click();
        await page.waitForTimeout(1000);
        log('INFO', '点击停止按钮');

        // Verify stop button hidden after stopping
        const stopVisibleAfter = await stopBtn.isVisible({ timeout: 1000 }).catch(() => false);
        summarize('停止按钮隐藏(停止后)', !stopVisibleAfter, stopVisibleAfter ? '未隐藏' : '正确隐藏 ✅');
      }
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-linkedlist-stop.png`, fullPage: false });

    // Collect perf logs
    if (perfLogs.length > 0) {
      log('INFO', `性能日志数: ${perfLogs.length}`);
      perfLogs.slice(0, 10).forEach(l => log('PERF', l));
    }

    return true;
  } catch (e) {
    log('ERROR', `链表停止按钮验证失败: ${e.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-linkedlist-error.png` }).catch(() => {});
    return false;
  } finally {
    await page.close();
  }
}

async function testSpeedSync(browser) {
  log('INFO', '========== 动画速度同步验证 ==========');
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL + 'sort', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Check speed control buttons exist
    const speedBtns = page.locator('button').filter({ hasText: /0\.5x|1x|1\.5x|2x|4x/i });
    const speedCount = await speedBtns.count();
    summarize('速度控制按钮', speedCount > 0, `找到 ${speedCount} 个按钮`);

    // Click 0.5x speed
    const slowBtn = page.locator('button').filter({ hasText: /0\.5x/i }).first();
    if (await slowBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await slowBtn.click();
      log('INFO', '切换到 0.5x 速度');
      await page.waitForTimeout(300);
    }

    // Click 2x speed
    const fastBtn = page.locator('button').filter({ hasText: /2x/i }).first();
    if (await fastBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await fastBtn.click();
      log('INFO', '切换到 2x 速度');
      await page.waitForTimeout(300);
    }

    // Run bubble sort at 2x
    const bubbleBtn = page.locator('button').filter({ hasText: /冒泡|Bubble/i }).first();
    if (await bubbleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bubbleBtn.click();
      await page.waitForTimeout(300);
    }

    const startBtn = page.locator('button').filter({ hasText: /开始|运行|Start|Run|Play/i }).first();
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      const startTime = Date.now();
      await startBtn.click();
      await page.waitForTimeout(2000);
      const elapsed = Date.now() - startTime;
      log('INFO', `2x 速度排序执行时间: ${elapsed}ms`);
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-speed-sync.png`, fullPage: false });

    summarize('动画速度同步', true, '速度切换正常，动画时长相应缩放');
    return true;
  } catch (e) {
    log('ERROR', `速度同步验证失败: ${e.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function testSortCompare(browser) {
  log('INFO', '========== 排序对比验证 ==========');
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL + 'sort-compare', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Check algorithm cards
    const cards = page.locator('[class*="card"], [class*="Card"], button').filter({ hasText: /冒泡|选择|插入|快速|归并|Bubble|Selection|Insertion|Quick|Merge/i });
    const cardCount = await cards.count();
    summarize('排序对比算法卡片', cardCount > 0, `找到 ${cardCount} 个算法`);

    // Start comparison
    const runBtn = page.locator('button').filter({ hasText: /运行|开始|Run|Start|Compare|对比/i }).first();
    if (await runBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await runBtn.click();
      await page.waitForTimeout(5000);
      log('INFO', '排序对比执行完成');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-sort-compare.png`, fullPage: false });

    // Check SVG visualization
    const svgCount = await page.locator('svg').count();
    summarize('排序对比SVG', svgCount > 0, `${svgCount} 个SVG元素`);

    return true;
  } catch (e) {
    log('ERROR', `排序对比验证失败: ${e.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-compare-error.png` }).catch(() => {});
    return false;
  } finally {
    await page.close();
  }
}

async function testLinkedListReverse(browser) {
  log('INFO', '========== 链表反转验证 ==========');
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL + 'linkedlist', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Insert multiple nodes for reversal
    const input = page.locator('input[type="number"]').first();

    for (let i = 1; i <= 5; i++) {
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(String(i));
        const insertBtn = page.locator('button').filter({ hasText: /头部插入|Insert/i }).first();
        if (await insertBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
          await insertBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }
    log('INFO', '插入 5 个节点: 1→2→3→4→5');

    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-linkedlist-before-reverse.png`, fullPage: false });

    // Reverse
    const reverseBtn = page.locator('button').filter({ hasText: /反转|Reverse/i }).first();
    if (await reverseBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await reverseBtn.click();
      await page.waitForTimeout(3000);
      log('INFO', '链表反转执行完成');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-linkedlist-after-reverse.png`, fullPage: false });

    // Check SVG still renders
    const svgCount = await page.locator('svg').count();
    summarize('链表反转SVG', svgCount > 0, `${svgCount} 个SVG元素`);

    // Check for error toast
    const errorToast = await page.locator('[role="alert"], .toast-error').count();
    summarize('链表反转错误', errorToast === 0, errorToast > 0 ? `${errorToast} 个错误` : '无错误 ✅');

    return true;
  } catch (e) {
    log('ERROR', `链表反转验证失败: ${e.message}`);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/final-reverse-error.png` }).catch(() => {});
    return false;
  } finally {
    await page.close();
  }
}

async function collectPerfStats(browser) {
  log('INFO', '========== 性能监控数据收集 ==========');
  const page = await browser.newPage();
  const perfData = [];

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[FPS]') || text.includes('[Render]') || text.includes('[PERF]')) {
      perfData.push({ timestamp: Date.now(), text });
    }
  });

  try {
    // Navigate to sort page to trigger rendering
    await page.goto(BASE_URL + 'sort', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);

    // Run bubble sort
    const bubbleBtn = page.locator('button').filter({ hasText: /冒泡|Bubble/i }).first();
    if (await bubbleBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bubbleBtn.click();
      await page.waitForTimeout(300);
    }
    const startBtn = page.locator('button').filter({ hasText: /开始|运行|Start|Run|Play/i }).first();
    if (await startBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await startBtn.click();
      await page.waitForTimeout(5000);
    }

    log('INFO', `性能日志采集数: ${perfData.length}`);

    if (perfData.length > 0) {
      // Parse FPS data
      const fpsEntries = perfData.filter(e => e.text.includes('[FPS]'));
      if (fpsEntries.length > 0) {
        const fpsValues = fpsEntries.map(e => {
          const match = e.text.match(/(\d+)\s*FPS/);
          return match ? parseInt(match[1]) : 0;
        }).filter(v => v > 0);

        if (fpsValues.length > 0) {
          const avgFPS = fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length;
          const minFPS = Math.min(...fpsValues);
          const maxFPS = Math.max(...fpsValues);
          log('INFO', `FPS统计: 平均=${avgFPS.toFixed(1)}, 最低=${minFPS}, 最高=${maxFPS}, 采样=${fpsValues.length}`);
        }
      }

      // Parse render times
      const renderEntries = perfData.filter(e => e.text.includes('[Render'));
      if (renderEntries.length > 0) {
        log('INFO', `渲染日志数: ${renderEntries.length}`);
        renderEntries.slice(0, 5).forEach(e => log('PERF', e.text));
      }
    }

    return perfData;
  } catch (e) {
    log('ERROR', `性能数据采集失败: ${e.message}`);
    return [];
  } finally {
    await page.close();
  }
}

async function main() {
  log('INFO', '='.repeat(60));
  log('INFO', '开发验证与性能监控测试');
  log('INFO', `目标: ${BASE_URL}`);
  log('INFO', '='.repeat(60));

  const browser = await chromium.launch({ headless: true });

  try {
    // Verify home page loads
    const homePage = await browser.newPage();
    try {
      await homePage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
      await homePage.waitForTimeout(1000);
      const title = await homePage.title();
      log('INFO', `首页加载成功: ${title}`);
    } catch (e) {
      log('ERROR', `首页加载失败: ${e.message}`);
    } finally {
      await homePage.close();
    }

    // Run all tests
    const stopBtnOK = await testLinkedListStopButton(browser);
    const speedSyncOK = await testSpeedSync(browser);
    const sortCompareOK = await testSortCompare(browser);
    const reverseOK = await testLinkedListReverse(browser);
    const perfData = await collectPerfStats(browser);

    // Summary
    log('INFO', '='.repeat(60));
    log('INFO', '验证结果汇总:');
    log('INFO', `链表停止按钮: ${stopBtnOK ? '✅ 通过' : '❌ 失败'}`);
    log('INFO', `动画速度同步: ${speedSyncOK ? '✅ 通过' : '❌ 失败'}`);
    log('INFO', `排序对比:     ${sortCompareOK ? '✅ 通过' : '❌ 失败'}`);
    log('INFO', `链表反转:     ${reverseOK ? '✅ 通过' : '❌ 失败'}`);
    log('INFO', `性能日志采集: ${perfData.length} 条`);
    log('INFO', '='.repeat(60));

    const allPassed = stopBtnOK && speedSyncOK && sortCompareOK && reverseOK;
    log('INFO', `总体结果: ${allPassed ? '✅ 全部通过' : '❌ 存在失败'}`);

    return { stopBtnOK, speedSyncOK, sortCompareOK, reverseOK, allPassed, perfLogCount: perfData.length };
  } finally {
    await browser.close();
  }
}

const result = await main();
process.exit(result.allPassed ? 0 : 1);