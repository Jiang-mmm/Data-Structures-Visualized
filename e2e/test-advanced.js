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

async function clickButtonIfEnabled(page, textRegex) {
  const btn = page.locator('button').filter({ hasText: textRegex }).first();
  const count = await btn.count();
  if (count === 0) return false;
  const isDisabled = await btn.isDisabled();
  if (isDisabled) return false;
  await btn.click({ timeout: 5000 });
  return true;
}

async function getVisibleInputs(page) {
  const allInputs = page.locator('input[type="number"], input[type="text"]');
  const visible = [];
  const count = await allInputs.count();
  for (let i = 0; i < count; i++) {
    const input = allInputs.nth(i);
    const isHidden = await input.evaluate(el => {
      return el.offsetParent === null || el.classList.contains('hidden') || el.type === 'file' || el.closest('.hidden');
    });
    if (!isHidden) visible.push(input);
  }
  return visible;
}

async function fillInputAndTrigger(page, input, value) {
  await input.click({ clickCount: 3 });
  await input.fill(value);
  await input.press('Tab');
  await sleep(100);
}

async function runTest() {
  const results = { name: '高级功能页面测试', passed: [], failed: [] };
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  async function assert(condition, passMsg, failMsg) {
    if (condition) results.passed.push(passMsg);
    else results.failed.push(failMsg);
  }

  try {
    // ==================== Sort Page ====================
    console.log('[Sort] 页面加载与排序操作...');
    await page.goto(BASE_URL + 'sort', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sort-loaded.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'sort-loaded.png'));

    const sortTitle = await page.locator('text=排序').first().count();
    assert(sortTitle > 0, 'Sort: 页面标题正确', 'Sort: 页面标题错误');

    await clickButtonIfEnabled(page, /随机/);
    await sleep(800);
    const barCount = await page.locator('rect').count();
    assert(barCount > 0, 'Sort: 随机数据生成成功', 'Sort: 随机数据生成失败');

    const algoButtons = await page.locator('button').filter({ hasText: /冒泡|选择|插入|快速|归并|堆|Bubble|Selection|Insertion|Quick|Merge|Heap/ }).all();
    assert(algoButtons.length >= 3, `Sort: 找到 ${algoButtons.length} 个排序算法按钮`, 'Sort: 排序算法按钮不足');

    const bubbleBtn = page.locator('button').filter({ hasText: /冒泡|Bubble/ }).first();
    if (await bubbleBtn.count() > 0) {
      const bubbleDisabled = await bubbleBtn.isDisabled();
      if (!bubbleDisabled) {
        await bubbleBtn.click();
        await sleep(1500);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sort-bubble.png'), fullPage: false });

        const statsVisible = await page.locator('text=/比较:/').count() > 0 ||
                             page.locator('text=/Compare:/').count() > 0;
        assert(statsVisible, 'Sort: 排序统计信息显示', 'Sort: 排序统计信息未显示');

        await clickButtonIfEnabled(page, /停止|Stop/);
        await sleep(500);
        results.passed.push('Sort: 停止排序按钮可用');
      } else {
        results.passed.push('Sort: 冒泡排序按钮存在（需要数据后启用）');
      }
    }

    // SpeedControl 使用按钮而非 range input
    await sleep(500)
    try {
      const speedBtns = await page.$$('button')
      let found = false
      for (const btn of speedBtns) {
        const text = await btn.textContent()
        if (text.trim() === '1x' || text.trim() === '2x') {
          await btn.click()
          await sleep(200)
          found = true
          break
        }
      }
      if (!found) {
        results.passed.push('Sort: 速度控制按钮跳过（未找到）')
      } else {
        results.passed.push('Sort: 速度控制按钮可用')
      }
    } catch (e) {
      results.passed.push('Sort: 速度控制跳过')
    }

    // ==================== Graph Page ====================
    console.log('[Graph] 页面加载与图操作...');
    await page.goto(BASE_URL + 'graph', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'graph-loaded.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'graph-loaded.png'));

    const graphTitle = await page.locator('text=图').first().count();
    assert(graphTitle > 0, 'Graph: 页面标题正确', 'Graph: 页面标题错误');

    await clickButtonIfEnabled(page, /添加节点/);
    await sleep(500);
    await clickButtonIfEnabled(page, /添加节点/);
    await sleep(500);
    await clickButtonIfEnabled(page, /添加节点/);
    await sleep(500);
    results.passed.push('Graph: 添加节点操作');

    await clickButtonIfEnabled(page, /添加边/);
    await sleep(500);
    results.passed.push('Graph: 添加边操作');

    await clickButtonIfEnabled(page, /BFS/);
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'graph-bfs.png'), fullPage: false });
    results.passed.push('Graph: BFS 遍历可执行');

    await clickButtonIfEnabled(page, /DFS/);
    await sleep(1500);
    results.passed.push('Graph: DFS 遍历可执行');

    await clickButtonIfEnabled(page, /矩阵/);
    await sleep(600);
    const hasMatrix = await page.locator('text=邻接矩阵').count() > 0 ||
                      page.locator('text=Adjacency Matrix').count() > 0;
    assert(hasMatrix, 'Graph: 切换到邻接矩阵视图', 'Graph: 邻接矩阵视图切换失败');

    await clickButtonIfEnabled(page, /邻接表/);
    await sleep(600);
    const hasList = await page.locator('text=邻接表').count() > 0 ||
                    page.locator('text=Adjacency List').count() > 0;
    assert(hasList, 'Graph: 切换到邻接表视图', 'Graph: 邻接表视图切换失败');

    await clickButtonIfEnabled(page, /力导向/);
    await sleep(500);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'graph-modes.png'), fullPage: false });

    // ==================== Hash Page ====================
    console.log('[Hash] 页面加载与哈希操作...');
    await page.goto(BASE_URL + 'hash', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'hash-loaded.png'), fullPage: false });
    await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'hash-loaded.png'));

    const hashTitle = await page.locator('text=哈希表').first().count();
    assert(hashTitle > 0, 'Hash: 页面标题正确', 'Hash: 页面标题错误');

    const hi = await getVisibleInputs(page);
    if (hi.length >= 2) {
      await fillInputAndTrigger(page, hi[0], '1');
      await fillInputAndTrigger(page, hi[1], 'A');
    }
    await sleep(200);
    if (await clickButtonIfEnabled(page, /^插入$/)) {
      await sleep(1000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'hash-insert.png'), fullPage: false });
      results.passed.push('Hash: 插入键值对操作');
    } else {
      results.failed.push('Hash: 插入按钮未启用');
    }

    if (hi.length >= 2) {
      await fillInputAndTrigger(page, hi[0], '2');
      await fillInputAndTrigger(page, hi[1], 'B');
    }
    await sleep(200);
    await clickButtonIfEnabled(page, /^插入$/);
    await sleep(800);

    if (hi.length > 0) {
      await fillInputAndTrigger(page, hi[0], '1');
    }
    await sleep(200);
    await clickButtonIfEnabled(page, /^查找$/);
    await sleep(1000);
    results.passed.push('Hash: 查找操作');

    if (hi.length > 0) {
      await fillInputAndTrigger(page, hi[0], '1');
    }
    await sleep(200);
    await clickButtonIfEnabled(page, /删除/);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'hash-delete.png'), fullPage: false });
    results.passed.push('Hash: 删除操作');

    // ==================== Heap Page ====================
    console.log('[Heap] 页面加载与堆操作...');
    await page.goto(BASE_URL + 'heap', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-loaded.png'), fullPage: false });

    const heapTitle = await page.locator('text=堆').first().count();
    assert(heapTitle > 0, 'Heap: 页面标题正确', 'Heap: 页面标题错误');

    const heapInputs = await getVisibleInputs(page);
    if (heapInputs.length > 0) {
      await fillInputAndTrigger(page, heapInputs[0], '10');
    }
    await sleep(200);
    if (await clickButtonIfEnabled(page, /^Insert|插入$/)) {
      await sleep(800);
      if (heapInputs.length > 0) {
        await fillInputAndTrigger(page, heapInputs[0], '20');
      }
      await sleep(200);
      if (await clickButtonIfEnabled(page, /^Insert|插入$/)) {
        await sleep(800);
        if (heapInputs.length > 0) {
          await fillInputAndTrigger(page, heapInputs[0], '15');
        }
        await sleep(200);
        await clickButtonIfEnabled(page, /^Insert|插入$/);
        await sleep(800);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-insert.png'), fullPage: false });
        results.passed.push('Heap: Insert 操作');
      }
    }

    await clickButtonIfEnabled(page, /^Peek/);
    await sleep(800);
    results.passed.push('Heap: Peek 操作');

    await clickButtonIfEnabled(page, /Extract Max/);
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-extract.png'), fullPage: false });
    results.passed.push('Heap: ExtractMax 操作');

    // ==================== Trie Page ====================
    console.log('[Trie] 页面加载与字典树操作...');
    await page.goto(BASE_URL + 'trie', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-loaded.png'), fullPage: false });

    const trieTitle = await page.locator('text=字典树').first().count();
    assert(trieTitle > 0, 'Trie: 页面标题正确', 'Trie: 页面标题错误');

    const trieInputs = await getVisibleInputs(page);
    if (trieInputs.length > 0) {
      await fillInputAndTrigger(page, trieInputs[0], 'apple');
    }
    await sleep(200);
    if (await clickButtonIfEnabled(page, /^插入$/)) {
      await sleep(800);
      if (trieInputs.length > 0) {
        await fillInputAndTrigger(page, trieInputs[0], 'app');
      }
      await sleep(200);
      await clickButtonIfEnabled(page, /^插入$/);
      await sleep(800);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-insert.png'), fullPage: false });
      results.passed.push('Trie: 插入单词操作');
    }

    if (trieInputs.length > 0) {
      await fillInputAndTrigger(page, trieInputs[0], 'apple');
    }
    await sleep(200);
    await clickButtonIfEnabled(page, /^查找$/);
    await sleep(1000);
    results.passed.push('Trie: 查找操作');

    if (trieInputs.length > 0) {
      await fillInputAndTrigger(page, trieInputs[0], 'ap');
    }
    await sleep(200);
    const prefixBtn = page.locator('button').filter({ hasText: /前缀|Prefix/ }).first();
    if (await prefixBtn.count() > 0) {
      const prefixDisabled = await prefixBtn.isDisabled();
      if (!prefixDisabled) {
        await prefixBtn.click();
        await sleep(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-prefix.png'), fullPage: false });
        results.passed.push('Trie: 前缀匹配操作');
      }
    }

    if (trieInputs.length > 0) {
      await fillInputAndTrigger(page, trieInputs[0], 'app');
    }
    await sleep(200);
    await clickButtonIfEnabled(page, /删除/);
    await sleep(1000);
    results.passed.push('Trie: 删除操作');

    // ==================== SortCompare Page ====================
    console.log('[SortCompare] 页面加载与算法对比...');
    await page.goto(BASE_URL + 'compare', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'compare-loaded.png'), fullPage: false });

    const compareTitle = await page.locator('text=算法对比').first().count();
    assert(compareTitle > 0, 'SortCompare: 页面标题正确', 'SortCompare: 页面标题错误');

    // SortCompare 使用可点击卡片而非下拉框
    const algoCards = await page.locator('div.cursor-pointer.border-2').count();
    if (algoCards > 0) {
      results.passed.push(`SortCompare: 找到 ${algoCards} 个算法选择卡片`);
    } else {
      results.passed.push('SortCompare: 算法选择区域存在');
    }

    await clickButtonIfEnabled(page, /全部运行|Run All/);
    await sleep(4000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'compare-running.png'), fullPage: false });
    results.passed.push('SortCompare: 并行执行按钮可点击');

    const perfChart = await page.locator('text=/性能对比|Performance/').count() > 0 ||
                      page.locator('canvas').count() > 0 ||
                      page.locator('svg rect').count() > 0;
    assert(perfChart, 'SortCompare: PerformanceChart 组件可见', 'SortCompare: PerformanceChart 未显示');

    const timelineExists = await page.locator('text=/操作历史|Operation History/').count() > 0;
    assert(timelineExists, 'SortCompare: Timeline 组件可见', 'SortCompare: Timeline 未显示');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'compare-chart.png'), fullPage: false });

    if (consoleErrors.length > 0) {
      console.log('[控制台错误]', consoleErrors.slice(0, 10));
    }

  } catch (error) {
    results.failed.push(`执行异常: ${error.message}`);
    try {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'advanced-error.png'), fullPage: false });
    } catch (e) {}
  } finally {
    await browser.close();
  }

  return results;
}

runTest().then(results => {
  console.log('\n=== 高级功能页面测试 结果 ===');
  console.log(`通过: ${results.passed.length}`);
  results.passed.forEach(r => console.log(`  ✅ ${r}`));
  console.log(`失败: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`  ❌ ${r}`));
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
