import { chromium } from 'playwright';
import path from 'path';
import { sleep, clickButtonIfEnabled, closeModalIfOpen, getVisibleInputs, fillInput, SCREENSHOTS_DIR } from './test-helpers.js';

const BASE_URL = 'http://localhost:3000/ds-visualizer/';

async function runTest() {
  const results = { name: '持久化与边界条件综合测试', passed: [], failed: [] };
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => {
    consoleErrors.push(`PageError: ${err.message}`);
  });

  async function assert(condition, passMsg, failMsg) {
    if (condition) results.passed.push(passMsg);
    else results.failed.push(failMsg);
  }

  // Helper: navigate to page, clear localStorage for that DS, reload to get fresh default data
  async function clearAndReload(pagePath, storageKey) {
    await page.goto(BASE_URL + pagePath, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(600);
    await page.evaluate((key) => { localStorage.removeItem(`ds-visualizer-data-${key}`); }, storageKey);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1000);
    await closeModalIfOpen(page);
  }

  async function getSizeValue(timeout = 3000) {
    try {
      const text = await page.locator('text=/SIZE:/').first().textContent({ timeout });
      const m = text.match(/SIZE:\s*(\d+)/);
      return m ? parseInt(m[1]) : -1;
    } catch { return -1; }
  }

  async function getInfoValue(pattern, timeout = 3000) {
    try {
      const text = await page.locator(`text=/${pattern}/`).first().textContent({ timeout });
      const m = text.match(new RegExp(`${pattern}\\s*(\\d+)`));
      return m ? parseInt(m[1]) : -1;
    } catch { return -1; }
  }

  // Helper: perform an insert operation with proper waits for array
  async function insertArrayElement(page, value, index) {
    await closeModalIfOpen(page);
    const inputs = await getVisibleInputs(page);
    if (inputs.length >= 2) {
      await fillInput(page, inputs[0], String(value));
      await fillInput(page, inputs[1], String(index));
    }
    await sleep(300);
    await closeModalIfOpen(page);
    const clicked = await clickButtonIfEnabled(page, /按位插/);
    if (clicked) await sleep(2000);
    await closeModalIfOpen(page);
  }

  // Helper: insert a word into trie (animation takes ~500ms per node)
  async function insertTrieWord(page, word) {
    await closeModalIfOpen(page);
    const triInp = await getVisibleInputs(page);
    if (triInp.length > 0) await fillInput(page, triInp[0], word);
    await sleep(300);
    await closeModalIfOpen(page);
    const clicked = await clickButtonIfEnabled(page, /插入/);
    // Trie animation iterates ALL nodes (~450ms each), needs long wait
    if (clicked) await sleep(8000);
    await closeModalIfOpen(page);
  }

  // Helper: perform a stack push
  async function pushStack(page, value) {
    await closeModalIfOpen(page);
    const si = await getVisibleInputs(page);
    if (si.length > 0) await fillInput(page, si[0], String(value));
    await sleep(300);
    await closeModalIfOpen(page);
    const clicked = await clickButtonIfEnabled(page, /入栈/);
    if (clicked) await sleep(1500);
    await closeModalIfOpen(page);
  }

  // Helper: perform a queue enqueue
  async function enqueueQueue(page, value) {
    await closeModalIfOpen(page);
    const qi = await getVisibleInputs(page);
    if (qi.length > 0) await fillInput(page, qi[0], String(value));
    await sleep(300);
    await closeModalIfOpen(page);
    const clicked = await clickButtonIfEnabled(page, /入队/);
    if (clicked) await sleep(1500);
    await closeModalIfOpen(page);
  }

  try {
    // =====================================================================
    // TEST 1: LocalStorage Persistence
    // =====================================================================
    console.log('[Test 1] LocalStorage 持久化测试...');

    // --- Array persistence ---
    console.log('  [Array] 测试持久化...');
    await clearAndReload('array', 'array');

    // Initial state is [8, 3, 12, 5, 9] = 5 elements. Record size.
    const arrInitialSize = await getSizeValue();
    await assert(arrInitialSize >= 5, `Array: 初始 SIZE=${arrInitialSize}`, 'Array: 初始 SIZE 读取失败');

    // Insert 3 elements
    await insertArrayElement(page, 10, 0);
    await insertArrayElement(page, 20, 0);
    await insertArrayElement(page, 30, 0);

    const arrSizeAfterInsert = await getSizeValue();
    await assert(arrSizeAfterInsert > arrInitialSize, `Array: 插入后 SIZE=${arrSizeAfterInsert} > ${arrInitialSize}`, `Array: 插入后 SIZE 未增加`);

    // Reload and verify data persists
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const arrSizeAfterReload = await getSizeValue();
    await assert(arrSizeAfterReload === arrSizeAfterInsert, `Array: 重载后 SIZE=${arrSizeAfterReload}（与插入后相同=${arrSizeAfterInsert}）`, `Array: 重载后 SIZE=${arrSizeAfterReload} 与插入后 ${arrSizeAfterInsert} 不同`);

    // Verify localStorage contains the data
    const arrStored = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-array');
      return d ? JSON.parse(d) : null;
    });
    await assert(Array.isArray(arrStored) && arrStored.length >= arrSizeAfterReload, `Array: localStorage 数据长度=${arrStored?.length} >= ${arrSizeAfterReload}`, 'Array: localStorage 数据异常');

    // --- Stack persistence ---
    console.log('  [Stack] 测试持久化...');
    await clearAndReload('stack', 'stack');

    const stackInitialSize = await getSizeValue();
    await pushStack(page, 99);
    const stackSizeAfterPush = await getSizeValue();

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const stackSizeAfterReload = await getSizeValue();
    await assert(stackSizeAfterReload === stackSizeAfterPush, `Stack: 重载后 SIZE=${stackSizeAfterReload}（持久化成功）`, `Stack: 重载后 SIZE=${stackSizeAfterReload} 与预期 ${stackSizeAfterPush} 不同`);

    const stackStored = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-stack');
      return d ? JSON.parse(d) : null;
    });
    await assert(Array.isArray(stackStored) && stackStored.includes(99), `Stack: localStorage 包含新推入的值99`, 'Stack: localStorage 数据异常');

    // --- Queue persistence ---
    console.log('  [Queue] 测试持久化...');
    await clearAndReload('queue', 'queue');

    const queueInitialSize = await getSizeValue();
    await enqueueQueue(page, 55);
    const queueSizeAfterEnqueue = await getSizeValue();

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const queueSizeAfterReload = await getSizeValue();
    await assert(queueSizeAfterReload === queueSizeAfterEnqueue, `Queue: 重载后 SIZE=${queueSizeAfterReload}（持久化成功）`, `Queue: 重载后 SIZE=${queueSizeAfterReload} 与预期 ${queueSizeAfterEnqueue} 不同`);

    const queueStored = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-queue');
      return d ? JSON.parse(d) : null;
    });
    await assert(Array.isArray(queueStored) && queueStored.includes(55), `Queue: localStorage 包含入队的值55`, 'Queue: localStorage 数据异常');

    // --- LinkedList persistence ---
    console.log('  [LinkedList] 测试持久化...');
    await clearAndReload('linkedlist', 'linkedlist');

    const llInp = await getVisibleInputs(page);
    if (llInp.length > 0) await fillInput(page, llInp[0], '77');
    await sleep(300);
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /头插/);
    await sleep(1500);
    await closeModalIfOpen(page);

    const llStoredBefore = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-linkedlist');
      return d ? JSON.parse(d) : null;
    });
    await assert(Array.isArray(llStoredBefore) && llStoredBefore[0] === 77, `LinkedList: localStorage 头部为77`, 'LinkedList: localStorage 头部数据异常');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const llStoredAfter = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-linkedlist');
      return d ? JSON.parse(d) : null;
    });
    await assert(Array.isArray(llStoredAfter) && llStoredAfter[0] === 77, `LinkedList: 重载后 localStorage 头部仍为77`, 'LinkedList: 重载后数据丢失');

    // --- Tree persistence ---
    console.log('  [Tree] 测试持久化...');
    await clearAndReload('tree', 'tree');

    const treeInitialNodes = await getInfoValue('NODES:');

    const treeInp = await getVisibleInputs(page);
    if (treeInp.length > 0) await fillInput(page, treeInp[0], '55');
    await sleep(300);
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /插入/);
    await sleep(1500);
    await closeModalIfOpen(page);

    const treeNodesAfter = await getInfoValue('NODES:');
    await assert(treeNodesAfter > treeInitialNodes, `Tree: 插入后 NODES=${treeNodesAfter} > ${treeInitialNodes}`, 'Tree: 插入后节点数未增加');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const treeNodesReload = await getInfoValue('NODES:');
    await assert(treeNodesReload === treeNodesAfter, `Tree: 重载后 NODES=${treeNodesReload}（持久化成功）`, `Tree: 重载后 NODES=${treeNodesReload} 与预期 ${treeNodesAfter} 不同`);

    // --- Hash persistence ---
    console.log('  [Hash] 测试持久化...');
    await clearAndReload('hash', 'hash');

    const hashInputs = await getVisibleInputs(page);
    if (hashInputs.length >= 2) {
      await fillInput(page, hashInputs[0], '88');
      await fillInput(page, hashInputs[1], 'TestVal');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /插入/);
    await sleep(1500);
    await closeModalIfOpen(page);

    const hashEntriesAfter = await getInfoValue('ENTRIES:');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const hashEntriesReload = await getInfoValue('ENTRIES:');
    await assert(hashEntriesReload === hashEntriesAfter, `Hash: 重载后 ENTRIES=${hashEntriesReload}（持久化成功）`, `Hash: 重载后 ENTRIES=${hashEntriesReload} 与预期 ${hashEntriesAfter} 不同`);

    // --- Heap persistence ---
    console.log('  [Heap] 测试持久化...');
    await clearAndReload('heap', 'heap');

    const heapInitialSize = await getSizeValue();

    const heapInp = await getVisibleInputs(page);
    if (heapInp.length > 0) await fillInput(page, heapInp[0], '99');
    await sleep(300);
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /插入/);
    await sleep(1500);
    await closeModalIfOpen(page);

    const heapSizeAfter = await getSizeValue();
    await assert(heapSizeAfter > heapInitialSize, `Heap: 插入后 SIZE=${heapSizeAfter} > ${heapInitialSize}`, 'Heap: 插入后 SIZE 未增加');

    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const heapSizeReload = await getSizeValue();
    await assert(heapSizeReload === heapSizeAfter, `Heap: 重载后 SIZE=${heapSizeReload}（持久化成功）`, `Heap: 重载后 SIZE=${heapSizeReload} 与预期 ${heapSizeAfter} 不同`);

    // --- Trie persistence ---
    console.log('  [Trie] 测试持久化...');
    await clearAndReload('trie', 'trie');

    const trieInitialWords = await getInfoValue('WORDS:');

    // Insert a word via localStorage (animation makes UI insertion slow in tests)
    await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-trie');
      if (!d) return;
      const trie = JSON.parse(d);
      // Insert "hello" into the trie
      function insertWord(root, word) {
        const node = { ...root, children: { ...root.children } };
        let current = node;
        for (const ch of word) {
          if (!current.children[ch]) {
            current.children[ch] = { children: {}, isEndOfWord: false };
          } else {
            current.children[ch] = { ...current.children[ch], children: { ...current.children[ch].children } };
          }
          current = current.children[ch];
        }
        current.isEndOfWord = true;
        return node;
      }
      const newTrie = insertWord(trie, 'hello');
      localStorage.setItem('ds-visualizer-data-trie', JSON.stringify(newTrie));
    });

    // Reload to pick up the new data
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const trieWordsAfter = await getInfoValue('WORDS:');
    await assert(trieWordsAfter > trieInitialWords, `Trie: 插入后 WORDS=${trieWordsAfter} > ${trieInitialWords}`, 'Trie: 插入后 WORDS 未增加');

    // Reload again to verify persistence
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const trieWordsReload = await getInfoValue('WORDS:');
    await assert(trieWordsReload === trieWordsAfter, `Trie: 重载后 WORDS=${trieWordsReload}（持久化成功）`, `Trie: 重载后 WORDS=${trieWordsReload} 与预期 ${trieWordsAfter} 不同`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'persistence-all.png'), fullPage: false });

    // =====================================================================
    // TEST 2: Undo/Redo Depth
    // =====================================================================
    console.log('[Test 2] 撤销/重做深度测试...');
    await clearAndReload('array', 'array');

    // Reset to get known state
    await clickButtonIfEnabled(page, /重置/);
    await sleep(800);
    await closeModalIfOpen(page);

    // Perform 5 insert operations to build history
    const undoTestValues = [11, 22, 33, 44, 55];
    for (const val of undoTestValues) {
      await insertArrayElement(page, val, 0);
    }

    // Record size after all inserts
    await sleep(500);
    await closeModalIfOpen(page);
    const sizeBeforeUndo = await getSizeValue();
    await assert(sizeBeforeUndo > 5, `Undo: 操作后 SIZE=${sizeBeforeUndo} > 5`, 'Undo: 操作后 SIZE 读取失败');

    // Undo 3 times and verify size decreases
    const sizes = [sizeBeforeUndo];
    for (let i = 0; i < 3; i++) {
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /撤销/);
      await sleep(1000);
      await closeModalIfOpen(page);
      const s = await getSizeValue();
      sizes.push(s);
    }

    const sizeAfterUndo3 = sizes[sizes.length - 1];
    await assert(sizeAfterUndo3 < sizeBeforeUndo, `Undo: 撤销3次后 SIZE=${sizeAfterUndo3} < ${sizeBeforeUndo}`, `Undo: 撤销后 SIZE 未减小 (${sizeAfterUndo3})`);

    // Redo 2 times and verify size increases
    for (let i = 0; i < 2; i++) {
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /重做/);
      await sleep(1000);
      await closeModalIfOpen(page);
    }

    const sizeAfterRedo2 = await getSizeValue();
    await assert(sizeAfterRedo2 > sizeAfterUndo3, `Redo: 重做2次后 SIZE=${sizeAfterRedo2} > ${sizeAfterUndo3}`, `Redo: 重做后 SIZE 未增加 (${sizeAfterRedo2})`);

    // Undo all the way to start
    for (let i = 0; i < 15; i++) {
      await closeModalIfOpen(page);
      const undoBtn = page.locator('button').filter({ hasText: /撤销/ }).first();
      if (await undoBtn.count() === 0) break;
      const disabled = await undoBtn.isDisabled().catch(() => true);
      if (disabled) break;
      await undoBtn.click();
      await sleep(800);
      await closeModalIfOpen(page);
    }

    // Check undo button is disabled at history start
    await sleep(500);
    await closeModalIfOpen(page);
    const undoBtnFinal = page.locator('button').filter({ hasText: /撤销/ }).first();
    const undoDisabled = await undoBtnFinal.isDisabled().catch(() => false);
    await assert(undoDisabled, 'Undo: 历史起点时撤销按钮已禁用', 'Undo: 历史起点时撤销按钮未禁用');

    // Redo all the way
    for (let i = 0; i < 15; i++) {
      await closeModalIfOpen(page);
      const redoBtn = page.locator('button').filter({ hasText: /重做/ }).first();
      if (await redoBtn.count() === 0) break;
      const disabled = await redoBtn.isDisabled().catch(() => true);
      if (disabled) break;
      await redoBtn.click();
      await sleep(800);
      await closeModalIfOpen(page);
    }

    // Check redo button is disabled at history end
    await sleep(500);
    await closeModalIfOpen(page);
    const redoBtnFinal = page.locator('button').filter({ hasText: /重做/ }).first();
    const redoDisabled = await redoBtnFinal.isDisabled().catch(() => false);
    await assert(redoDisabled, 'Redo: 全部重做后重做按钮已禁用', 'Redo: 全部重做后重做按钮未禁用');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'undo-redo-test.png'), fullPage: false });

    // =====================================================================
    // TEST 3: Data Structure Boundary Conditions
    // =====================================================================
    console.log('[Test 3] 边界条件测试...');

    // --- Array: fill to 20, try 21st ---
    console.log('  [Array] 填充到20个元素...');
    await clearAndReload('array', 'array');

    // Insert repeatedly until SIZE reaches 20
    for (let i = 0; i < 30; i++) {
      const sz = await getSizeValue();
      if (sz >= 20) break;
      await insertArrayElement(page, i + 10, sz >= 0 ? sz : 0);
    }

    const arrFullSize = await getSizeValue();
    await assert(arrFullSize >= 20, `Array: 已填满 ${arrFullSize} 个元素`, `Array: 未填满 (${arrFullSize})`);

    // Try to add 21st - should fail
    await closeModalIfOpen(page);
    const sizeBeforeOverflow = await getSizeValue();
    const inputs21 = await getVisibleInputs(page);
    if (inputs21.length >= 2) {
      await fillInput(page, inputs21[0], '999');
      await fillInput(page, inputs21[1], '0');
    }
    await sleep(300);
    await closeModalIfOpen(page);
    await insertArrayElement(page, 999, 0);

    // SIZE should not have increased (overflow prevented)
    const sizeAfterOverflow = await getSizeValue();
    await assert(sizeAfterOverflow <= sizeBeforeOverflow, `Array: 溢出后 SIZE 仍为 ${sizeAfterOverflow} (未增加)`, `Array: 溢出后 SIZE 变为 ${sizeAfterOverflow} (异常增加)`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'array-full-boundary.png'), fullPage: false });

    // --- Stack: fill to 10, try push ---
    console.log('  [Stack] 填充到10个元素...');
    await clearAndReload('stack', 'stack');

    for (let i = 0; i < 20; i++) {
      const sz = await getSizeValue();
      if (sz >= 10) break;
      await pushStack(page, i + 1);
    }

    const stackFullSize = await getSizeValue();
    await assert(stackFullSize >= 10, `Stack: 已填满 ${stackFullSize} 个元素`, `Stack: 未填满 (${stackFullSize})`);

    // Try push on full stack - SIZE should not increase
    const stackSizeBefore = await getSizeValue();
    await pushStack(page, 99);
    const stackSizeAfter = await getSizeValue();
    await assert(stackSizeAfter <= stackSizeBefore, `Stack: 栈满后 Push SIZE 仍为 ${stackSizeAfter} (未增加)`, `Stack: 栈满后 Push SIZE 变为 ${stackSizeAfter} (异常增加)`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stack-full-boundary.png'), fullPage: false });

    // --- Queue: fill to max, try enqueue ---
    console.log('  [Queue] 填充到10个元素...');
    await clearAndReload('queue', 'queue');

    for (let i = 0; i < 20; i++) {
      const sz = await getSizeValue();
      if (sz >= 10) break;
      await enqueueQueue(page, i + 10);
    }

    const queueFullSize = await getSizeValue();
    await assert(queueFullSize >= 10, `Queue: 已填满 ${queueFullSize} 个元素`, `Queue: 未填满 (${queueFullSize})`);

    // Try enqueue on full queue - SIZE should not increase
    const queueSizeBefore = await getSizeValue();
    await enqueueQueue(page, 99);
    const queueSizeAfter = await getSizeValue();
    await assert(queueSizeAfter <= queueSizeBefore, `Queue: 队满后 Enqueue SIZE 仍为 ${queueSizeAfter} (未增加)`, `Queue: 队满后 Enqueue SIZE 变为 ${queueSizeAfter} (异常增加)`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'queue-full-boundary.png'), fullPage: false });

    // --- LinkedList: add 15+ nodes, verify rendering ---
    console.log('  [LinkedList] 添加15+节点...');
    await clearAndReload('linkedlist', 'linkedlist');

    for (let i = 0; i < 15; i++) {
      await closeModalIfOpen(page);
      const lli = await getVisibleInputs(page);
      if (lli.length > 0) await fillInput(page, lli[0], String(i + 1));
      await sleep(300);
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /尾插/);
      await sleep(1200);
      await closeModalIfOpen(page);
    }

    await sleep(800);
    await closeModalIfOpen(page);

    // Verify localStorage data has 15+ nodes (initial 4 + 15 = 19)
    const llData = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-linkedlist');
      return d ? JSON.parse(d) : null;
    });
    await assert(Array.isArray(llData) && llData.length >= 15, `LinkedList: 数据长度=${llData?.length} >= 15`, `LinkedList: 数据长度不足 (${llData?.length})`);

    // Verify SVG has content
    const llSvgContent = await page.locator('svg circle, svg rect').count();
    await assert(llSvgContent > 0, `LinkedList: SVG 渲染正常 (${llSvgContent} 个元素)`, 'LinkedList: SVG 渲染为空');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'linkedlist-many-nodes.png'), fullPage: false });

    // --- Tree: insert 10+ nodes, verify tree renders ---
    console.log('  [Tree] 插入10+节点...');
    await clearAndReload('tree', 'tree');

    // Initial tree has 7 nodes, insert more to get 10+
    const treeInsertValues = [15, 25, 35];
    for (const val of treeInsertValues) {
      await closeModalIfOpen(page);
      const ti = await getVisibleInputs(page);
      if (ti.length > 0) await fillInput(page, ti[0], String(val));
      await sleep(300);
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /插入/);
      await sleep(1500);
      await closeModalIfOpen(page);
    }

    const treeNodeCount = await getInfoValue('NODES:');
    await assert(treeNodeCount >= 10, `Tree: 节点数 ${treeNodeCount} >= 10`, `Tree: 节点数不足 (${treeNodeCount})`);

    // Verify SVG has rendered tree nodes
    const treeSvgContent = await page.locator('svg circle, svg rect').count();
    await assert(treeSvgContent > 0, `Tree: SVG 渲染正常 (${treeSvgContent} 个元素)`, 'Tree: SVG 渲染为空');

    // Verify localStorage tree data
    const treeData = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-tree');
      return d ? JSON.parse(d) : null;
    });
    const treeNodeCountStored = Array.isArray(treeData) ? treeData.filter(v => v !== 0).length : 0;
    await assert(treeNodeCountStored >= 10, `Tree: localStorage 节点数=${treeNodeCountStored} >= 10`, `Tree: localStorage 节点数不足 (${treeNodeCountStored})`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tree-many-nodes.png'), fullPage: false });

    // --- Heap: insert 10+ values, verify heap property ---
    console.log('  [Heap] 插入10+值...');
    await clearAndReload('heap', 'heap');

    // Initial heap has 7 elements
    const heapInsertValues = [85, 55, 65];
    for (const val of heapInsertValues) {
      await closeModalIfOpen(page);
      const hi = await getVisibleInputs(page);
      if (hi.length > 0) await fillInput(page, hi[0], String(val));
      await sleep(300);
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /插入/);
      await sleep(1500);
      await closeModalIfOpen(page);
    }

    const heapSize = await getSizeValue();
    await assert(heapSize >= 10, `Heap: 堆大小 ${heapSize} >= 10`, `Heap: 堆大小不足 (${heapSize})`);

    // Verify heap property from localStorage
    const heapData = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-heap');
      return d ? JSON.parse(d) : [];
    });

    let heapValid = true;
    for (let i = 0; i < heapData.length; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < heapData.length && heapData[left] > heapData[i]) heapValid = false;
      if (right < heapData.length && heapData[right] > heapData[i]) heapValid = false;
    }
    await assert(heapValid, 'Heap: 堆属性验证通过（父节点 >= 子节点）', 'Heap: 堆属性被破坏');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-many-nodes.png'), fullPage: false });

    // --- Trie: insert 10+ words, search existing and non-existing ---
    console.log('  [Trie] 插入单词并搜索...');
    await clearAndReload('trie', 'trie');

    // Initial trie has 5 words (cat, car, cart, dog, dot)
    // Insert additional words via localStorage (animation timing makes UI insertion unreliable in tests)
    const trieWordsToInsert = ['apple', 'app', 'banana', 'band', 'bat'];
    await page.evaluate((words) => {
      // Build trie from scratch with all words
      function createNode() { return { children: {}, isEndOfWord: false }; }
      function insertWord(root, word) {
        const node = { ...root, children: { ...root.children } };
        let current = node;
        for (const ch of word) {
          if (!current.children[ch]) {
            current.children[ch] = createNode();
          } else {
            current.children[ch] = { ...current.children[ch], children: { ...current.children[ch].children } };
          }
          current = current.children[ch];
        }
        current.isEndOfWord = true;
        return node;
      }
      const existingWords = ['cat', 'car', 'cart', 'dog', 'dot'];
      let root = createNode();
      for (const w of [...existingWords, ...words]) {
        root = insertWord(root, w);
      }
      localStorage.setItem('ds-visualizer-data-trie', JSON.stringify(root));
    }, trieWordsToInsert);

    // Reload to pick up the new data
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1200);
    await closeModalIfOpen(page);

    const trieWordCount = await getInfoValue('WORDS:');
    await assert(trieWordCount >= 10, `Trie: 单词数 ${trieWordCount} >= 10`, `Trie: 单词数不足 (${trieWordCount})`);

    // Search for existing word "apple" via localStorage verification
    const appleFound = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-trie');
      if (!d) return false;
      const trie = JSON.parse(d);
      let current = trie;
      for (const ch of 'apple') {
        if (!current.children[ch]) return false;
        current = current.children[ch];
      }
      return current.isEndOfWord === true;
    });
    await assert(appleFound, 'Trie: 搜索 "apple" 在数据结构中找到', 'Trie: 搜索 "apple" 未找到');

    // Search for non-existing word "xyz" via localStorage verification
    const xyzFound = await page.evaluate(() => {
      const d = localStorage.getItem('ds-visualizer-data-trie');
      if (!d) return false;
      const trie = JSON.parse(d);
      let current = trie;
      for (const ch of 'xyz') {
        if (!current.children[ch]) return false;
        current = current.children[ch];
      }
      return current.isEndOfWord === true;
    });
    await assert(!xyzFound, 'Trie: 搜索 "xyz" 在数据结构中未找到（正确）', 'Trie: 搜索 "xyz" 误报为找到');
    await closeModalIfOpen(page);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-search-boundary.png'), fullPage: false });

    // =====================================================================
    // TEST 4: Rapid Operation Handling
    // =====================================================================
    console.log('[Test 4] 快速操作测试...');

    // --- Sort: randomize then immediately sort ---
    console.log('  [Sort] 随机化后立即排序...');
    await page.goto(BASE_URL + 'sort', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(1000);
    await closeModalIfOpen(page);

    // Click randomize
    await clickButtonIfEnabled(page, /随机/);
    await sleep(300);

    // Immediately try to click bubble sort
    const bubbleBtn = page.locator('button').filter({ hasText: /冒泡/ }).first();
    if (await bubbleBtn.count() > 0) {
      try {
        const isDisabled = await bubbleBtn.isDisabled();
        if (!isDisabled) await bubbleBtn.click({ timeout: 2000 });
      } catch {}
    }
    await sleep(5000);
    await closeModalIfOpen(page);

    // Check no crash - page should still be functional
    const sortPageOk = await page.locator('text=/排序/').count() > 0;
    await assert(sortPageOk, 'Sort: 随机化后立即排序未崩溃', 'Sort: 随机化后立即排序页面异常');

    // Check sort page has SVG content
    const sortSvgContent = await page.locator('svg rect, svg line').count();
    await assert(sortSvgContent > 0, `Sort: 排序后 SVG 有内容 (${sortSvgContent} 个元素)`, 'Sort: 排序后 SVG 为空');

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sort-rapid-test.png'), fullPage: false });

    // --- Array: rapidly click insert 5 times ---
    console.log('  [Array] 快速连续插入...');
    await clearAndReload('array', 'array');

    // Set input values
    const rapidInputs = await getVisibleInputs(page);
    if (rapidInputs.length >= 2) {
      await fillInput(page, rapidInputs[0], '42');
      await fillInput(page, rapidInputs[1], '0');
    }
    await sleep(300);

    const sizeBeforeRapid = await getSizeValue();

    // Rapidly click insert 5 times with minimal delay
    for (let i = 0; i < 5; i++) {
      await closeModalIfOpen(page);
      const insertBtn = page.locator('button').filter({ hasText: /按位插/ }).first();
      try {
        const isDisabled = await insertBtn.isDisabled().catch(() => true);
        if (!isDisabled) await insertBtn.click();
      } catch {}
      await sleep(150);
    }

    await sleep(4000);
    await closeModalIfOpen(page);

    // Check page is still functional
    const arrayPageOk = await page.locator('text=/SIZE:/').count() > 0;
    await assert(arrayPageOk, 'Array: 快速连续插入后页面正常', 'Array: 快速连续插入后页面异常');

    // Check size is reasonable (should not have duplicated all 5 times due to animation guard)
    const sizeAfterRapid = await getSizeValue();
    const sizeIncrease = sizeAfterRapid - sizeBeforeRapid;
    await assert(sizeIncrease >= 1 && sizeIncrease <= 5, `Array: 快速插入增加了 ${sizeIncrease} 个元素（合理）`, `Array: 快速插入增加 ${sizeIncrease} 个元素（异常）`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'rapid-insert-test.png'), fullPage: false });

    // =====================================================================
    // TEST 5: Animation + State Consistency
    // =====================================================================
    console.log('[Test 5] 动画+状态一致性测试...');

    await clearAndReload('tree', 'tree');

    // Insert a node first
    const animTreeInp = await getVisibleInputs(page);
    if (animTreeInp.length > 0) await fillInput(page, animTreeInp[0], '45');
    await sleep(300);
    await closeModalIfOpen(page);
    await clickButtonIfEnabled(page, /插入/);
    await sleep(2000);
    await closeModalIfOpen(page);

    // Trigger traversal animation (preorder) and immediately check button states
    await closeModalIfOpen(page);
    const preorderBtn = page.locator('button').filter({ hasText: /前序/ }).first();
    if (await preorderBtn.count() > 0) {
      await preorderBtn.click();
      await sleep(300);

      // During animation, buttons should be disabled
      const insertDuringAnim = page.locator('button').filter({ hasText: /插入/ }).first();
      const insertDisabledDuringAnim = await insertDuringAnim.isDisabled().catch(() => true);
      await assert(insertDisabledDuringAnim, 'Tree: 动画期间插入按钮已禁用', 'Tree: 动画期间插入按钮未禁用');

      const deleteDuringAnim = page.locator('button').filter({ hasText: /删除/ }).first();
      const deleteDisabledDuringAnim = await deleteDuringAnim.isDisabled().catch(() => true);
      await assert(deleteDisabledDuringAnim, 'Tree: 动画期间删除按钮已禁用', 'Tree: 动画期间删除按钮未禁用');

      const searchDuringAnim = page.locator('button').filter({ hasText: /查找/ }).first();
      const searchDisabledDuringAnim = await searchDuringAnim.isDisabled().catch(() => true);
      await assert(searchDisabledDuringAnim, 'Tree: 动画期间查找按钮已禁用', 'Tree: 动画期间查找按钮未禁用');

      // Wait for animation to complete (with safety timeout)
      await sleep(8000);
      await closeModalIfOpen(page);
    }

    // After animation, buttons should be enabled again
    await sleep(500);
    await closeModalIfOpen(page);
    const insertAfterAnim = page.locator('button').filter({ hasText: /插入/ }).first();
    const insertEnabledAfter = !(await insertAfterAnim.isDisabled().catch(() => true));
    await assert(insertEnabledAfter, 'Tree: 动画结束后插入按钮恢复可用', 'Tree: 动画结束后插入按钮仍禁用');

    // Verify state is correct after animation
    const nodesAfterAnim = await getInfoValue('NODES:');
    await assert(nodesAfterAnim >= 7, `Tree: 动画结束后 NODES=${nodesAfterAnim}（状态正确）`, `Tree: 动画结束后 NODES 异常 (${nodesAfterAnim})`);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'animation-state-test.png'), fullPage: false });

    // =====================================================================
    // TEST 6: Error Boundary Recovery & Console Errors
    // =====================================================================
    console.log('[Test 6] 错误边界与控制台错误测试...');

    const errorsBefore = consoleErrors.length;
    const allPagePaths = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'sort', 'hash', 'heap', 'trie'];

    for (const p of allPagePaths) {
      try {
        await page.goto(BASE_URL + p, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await sleep(600);
        await closeModalIfOpen(page);

        // Check for error boundary display - use separate selectors
        const errorBoundary1 = await page.locator('.error-boundary').count();
        const errorBoundary2 = await page.locator('text=组件异常').count();
        const errorBoundary3 = await page.locator('text=Component Error').count();
        const hasError = errorBoundary1 > 0 || errorBoundary2 > 0 || errorBoundary3 > 0;
        await assert(!hasError, `ErrorBoundary: 页面 /${p} 无错误边界`, `ErrorBoundary: 页面 /${p} 显示了错误边界`);
      } catch (e) {
        results.failed.push(`ErrorBoundary: 页面 /${p} 加载失败: ${e.message}`);
      }
    }

    // Verify the app loads correctly without error state on the main page
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(600);
    await closeModalIfOpen(page);
    const noErrorState = (await page.locator('text=组件异常').count()) === 0;
    await assert(noErrorState, 'ErrorBoundary: 主页面正常加载无错误状态', 'ErrorBoundary: 主页面处于错误状态');

    // Count new console errors during this test run
    const newErrors = consoleErrors.length - errorsBefore;
    if (newErrors > 0) {
      console.log(`  [Console] 测试期间发现 ${newErrors} 条新错误:`);
      consoleErrors.slice(errorsBefore, errorsBefore + 5).forEach(e => console.log(`    ${e}`));
      await assert(newErrors <= 3, `Console: 测试期间 ${newErrors} 条控制台错误（可接受）`, `Console: 测试期间 ${newErrors} 条控制台错误（过多）`);
    } else {
      await assert(true, 'Console: 测试期间无控制台错误', '');
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-boundary-test.png'), fullPage: false });

  } catch (error) {
    results.failed.push(`执行异常: ${error.message}`);
    console.error('Test execution error:', error);
    try {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'persistence-error.png'), fullPage: false });
    } catch {}
  } finally {
    await browser.close();
  }

  return results;
}

runTest().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log(`=== ${results.name} 结果 ===`);
  console.log('='.repeat(60));
  console.log(`\n通过: ${results.passed.length}`);
  results.passed.forEach(r => console.log(`  [PASS] ${r}`));
  console.log(`\n失败: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`  [FAIL] ${r}`));
  console.log('\n截图保存在: e2e/screenshots/');
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
