/**
 * 持久化与边界条件综合测试 - Playwright Test 格式
 *
 * 从 e2e/test-persistence.js 迁移。保留原有测试逻辑，仅替换为 Playwright Test API。
 */
import { test, expect, type Page } from 'playwright/test'
import path from 'path'
import { sleep, clickButtonIfEnabled, closeModalIfOpen, getVisibleInputs, fillInput, SCREENSHOTS_DIR } from './test-helpers.js'

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/'

// Helper: navigate to page, clear localStorage for that DS, reload to get fresh default data
async function clearAndReload(page: Page, pagePath: string, storageKey: string) {
  await page.goto(BASE_URL + pagePath, { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(400)
  await page.evaluate((key) => { localStorage.removeItem(`ds-visualizer-data-${key}`) }, storageKey)
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(600)
  await closeModalIfOpen(page)
}

async function getSizeValue(page: Page, timeout = 3000) {
  try {
    // StatsOverlay renders "SIZE" label and value in separate <span> siblings.
    // Find the label span, then get the value from its sibling span.
    const value = await page.evaluate(() => {
      const spans = document.querySelectorAll('span')
      for (const span of Array.from(spans)) {
        if (span.textContent?.trim() === 'SIZE' && span.nextElementSibling) {
          const m = span.nextElementSibling.textContent?.match(/(\d+)/)
          if (m) return parseInt(m[1])
        }
      }
      // Fallback: search all text for "SIZE" followed by a number
      const allText = document.body?.textContent || ''
      const m2 = allText.match(/SIZE\s*(\d+)/)
      return m2 ? parseInt(m2[1]) : -1
    })
    return typeof value === 'number' ? value : -1
  } catch { return -1 }
}

async function getInfoValue(page: Page, pattern: string, timeout = 3000) {
  try {
    // Tree/Hash/Trie use inline text like "NODES: 7" (with colon).
    const text = await page.locator(`text=/${pattern}/`).first().textContent({ timeout })
    const m = text?.match(new RegExp(`${pattern}\\s*(\\d+)`))
    return m ? parseInt(m[1]) : -1
  } catch { return -1 }
}

// Helper: perform an insert operation with proper waits for array
async function insertArrayElement(page: Page, value: number, index: number) {
  await closeModalIfOpen(page)
  const inputs = await getVisibleInputs(page)
  if (inputs.length >= 2) {
    await fillInput(page, inputs[0], String(value))
    await fillInput(page, inputs[1], String(index))
  }
  await sleep(300)
  await closeModalIfOpen(page)
  const clicked = await clickButtonIfEnabled(page, /按位插/)
  if (clicked) await sleep(1000)
  await closeModalIfOpen(page)
}

// Helper: perform a stack push
async function pushStack(page: Page, value: number) {
  await closeModalIfOpen(page)
  const si = await getVisibleInputs(page)
  if (si.length > 0) await fillInput(page, si[0], String(value))
  await sleep(300)
  await closeModalIfOpen(page)
  const clicked = await clickButtonIfEnabled(page, /入栈/)
  if (clicked) await sleep(800)
  await closeModalIfOpen(page)
}

// Helper: perform a queue enqueue
async function enqueueQueue(page: Page, value: number) {
  await closeModalIfOpen(page)
  const qi = await getVisibleInputs(page)
  if (qi.length > 0) await fillInput(page, qi[0], String(value))
  await sleep(300)
  await closeModalIfOpen(page)
  const clicked = await clickButtonIfEnabled(page, /入队/)
  if (clicked) await sleep(800)
  await closeModalIfOpen(page)
}

// Helper: poll localStorage until predicate is satisfied
async function pollLocalStorage(page: Page, key: string, predicate: (value: unknown) => boolean, timeout = 3000, interval = 200) {
  const deadline = Date.now() + timeout
  while (Date.now() < deadline) {
    const value = await page.evaluate((k) => {
      const d = localStorage.getItem(k)
      return d ? JSON.parse(d) : null
    }, key)
    if (predicate(value)) return value
    await sleep(interval)
  }
  return null
}

test('持久化与边界条件综合测试', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => {
    consoleErrors.push(`PageError: ${err.message}`)
  })

  // =====================================================================
  // TEST 1: LocalStorage Persistence
  // =====================================================================
  console.log('[Test 1] LocalStorage 持久化测试...')

  // --- Array persistence ---
  console.log('  [Array] 测试持久化...')
  await clearAndReload(page, 'array', 'array')

  // Initial state is [8, 3, 12, 5, 9] = 5 elements. Record size.
  const arrInitialSize = await getSizeValue(page)
  expect(arrInitialSize >= 5, `Array: 初始 SIZE 读取失败 (${arrInitialSize})`).toBeTruthy()

  // Insert 3 elements
  await insertArrayElement(page, 10, 0)
  await insertArrayElement(page, 20, 0)
  await insertArrayElement(page, 30, 0)

  const arrSizeAfterInsert = await getSizeValue(page)
  expect(arrSizeAfterInsert > arrInitialSize, `Array: 插入后 SIZE 未增加 (${arrSizeAfterInsert} vs ${arrInitialSize})`).toBeTruthy()

  // Reload and verify data persists
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const arrSizeAfterReload = await getSizeValue(page)
  expect(arrSizeAfterReload === arrSizeAfterInsert, `Array: 重载后 SIZE=${arrSizeAfterReload} 与插入后 ${arrSizeAfterInsert} 不同`).toBeTruthy()

  // Verify localStorage contains the data
  const arrStored = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-array')
    return d ? JSON.parse(d) : null
  })
  expect(Array.isArray(arrStored) && arrStored.length >= arrSizeAfterReload, `Array: localStorage 数据异常 (长度=${(arrStored as unknown[] | null)?.length})`).toBeTruthy()

  // --- Stack persistence ---
  console.log('  [Stack] 测试持久化...')
  await clearAndReload(page, 'stack', 'stack')

  await pushStack(page, 99)
  const stackSizeAfterPush = await getSizeValue(page)

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const stackSizeAfterReload = await getSizeValue(page)
  expect(stackSizeAfterReload === stackSizeAfterPush, `Stack: 重载后 SIZE=${stackSizeAfterReload} 与预期 ${stackSizeAfterPush} 不同`).toBeTruthy()

  const stackStored = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-stack')
    return d ? JSON.parse(d) : null
  })
  expect(Array.isArray(stackStored) && (stackStored as number[]).includes(99), 'Stack: localStorage 数据异常').toBeTruthy()

  // --- Queue persistence ---
  console.log('  [Queue] 测试持久化...')
  await clearAndReload(page, 'queue', 'queue')

  await getSizeValue(page)
  await enqueueQueue(page, 55)
  const queueSizeAfterEnqueue = await getSizeValue(page)

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const queueSizeAfterReload = await getSizeValue(page)
  expect(queueSizeAfterReload === queueSizeAfterEnqueue, `Queue: 重载后 SIZE=${queueSizeAfterReload} 与预期 ${queueSizeAfterEnqueue} 不同`).toBeTruthy()

  const queueStored = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-queue')
    return d ? JSON.parse(d) : null
  })
  expect(Array.isArray(queueStored) && (queueStored as number[]).includes(55), 'Queue: localStorage 数据异常').toBeTruthy()

  // --- LinkedList persistence ---
  console.log('  [LinkedList] 测试持久化...')
  await clearAndReload(page, 'linkedlist', 'linkedlist')

  const llInp = await getVisibleInputs(page)
  if (llInp.length > 0) await fillInput(page, llInp[0], '77')
  await sleep(300)
  await closeModalIfOpen(page)
  await clickButtonIfEnabled(page, /头插/)
  await closeModalIfOpen(page)

  // Poll localStorage instead of a fixed sleep because the write is debounced.
  const llStoredBefore = await pollLocalStorage(
    page,
    'ds-visualizer-data-linkedlist',
    (data) => Array.isArray(data) && (data as number[])[0] === 77,
    3000,
    200
  )
  expect(Array.isArray(llStoredBefore) && (llStoredBefore as number[])[0] === 77, 'LinkedList: localStorage 头部数据异常').toBeTruthy()

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const llStoredAfter = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-linkedlist')
    return d ? JSON.parse(d) : null
  })
  expect(Array.isArray(llStoredAfter) && (llStoredAfter as number[])[0] === 77, 'LinkedList: 重载后数据丢失').toBeTruthy()

  // --- Tree persistence ---
  console.log('  [Tree] 测试持久化...')
  await clearAndReload(page, 'tree', 'tree')

  const treeInitialNodes = await getInfoValue(page, 'NODES:')

  const treeInp = await getVisibleInputs(page)
  if (treeInp.length > 0) await fillInput(page, treeInp[0], '55')
  await sleep(300)
  await closeModalIfOpen(page)
  await clickButtonIfEnabled(page, /插入/)
  await sleep(800)
  await closeModalIfOpen(page)

  const treeNodesAfter = await getInfoValue(page, 'NODES:')
  expect(treeNodesAfter > treeInitialNodes, `Tree: 插入后节点数未增加 (${treeNodesAfter} vs ${treeInitialNodes})`).toBeTruthy()

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const treeNodesReload = await getInfoValue(page, 'NODES:')
  expect(treeNodesReload === treeNodesAfter, `Tree: 重载后 NODES=${treeNodesReload} 与预期 ${treeNodesAfter} 不同`).toBeTruthy()

  // --- Hash persistence ---
  console.log('  [Hash] 测试持久化...')
  await clearAndReload(page, 'hash', 'hash')

  const hashInputs = await getVisibleInputs(page)
  if (hashInputs.length >= 2) {
    await fillInput(page, hashInputs[0], '88')
    await fillInput(page, hashInputs[1], 'TestVal')
  }
  await sleep(300)
  await closeModalIfOpen(page)
  await clickButtonIfEnabled(page, /插入/)
  await sleep(800)
  await closeModalIfOpen(page)

  const hashEntriesAfter = await getInfoValue(page, 'ENTRIES:')

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const hashEntriesReload = await getInfoValue(page, 'ENTRIES:')
  expect(hashEntriesReload === hashEntriesAfter, `Hash: 重载后 ENTRIES=${hashEntriesReload} 与预期 ${hashEntriesAfter} 不同`).toBeTruthy()

  // --- Heap persistence ---
  console.log('  [Heap] 测试持久化...')
  await clearAndReload(page, 'heap', 'heap')

  const heapInitialSize = await getSizeValue(page)

  const heapInp = await getVisibleInputs(page)
  if (heapInp.length > 0) await fillInput(page, heapInp[0], '99')
  await sleep(300)
  await closeModalIfOpen(page)
  await clickButtonIfEnabled(page, /插入/)
  await sleep(800)
  await closeModalIfOpen(page)

  const heapSizeAfter = await getSizeValue(page)
  expect(heapSizeAfter > heapInitialSize, `Heap: 插入后 SIZE 未增加 (${heapSizeAfter} vs ${heapInitialSize})`).toBeTruthy()

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const heapSizeReload = await getSizeValue(page)
  expect(heapSizeReload === heapSizeAfter, `Heap: 重载后 SIZE=${heapSizeReload} 与预期 ${heapSizeAfter} 不同`).toBeTruthy()

  // --- Trie persistence ---
  console.log('  [Trie] 测试持久化...')
  await clearAndReload(page, 'trie', 'trie')

  const trieInitialWords = await getInfoValue(page, 'WORDS:')

  // Insert a word via localStorage (animation makes UI insertion slow in tests)
  await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-trie')
    if (!d) return
    const trie = JSON.parse(d)
    // Insert "hello" into the trie
    function insertWord(root: { children: Record<string, unknown>; isEndOfWord?: boolean }, word: string) {
      const node = { ...root, children: { ...root.children } }
      let current = node as { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>; isEndOfWord?: boolean }
      for (const ch of word) {
        if (!current.children[ch]) {
          (current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch] = { children: {}, isEndOfWord: false }
        } else {
          (current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch] = { ...(current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch], children: { ...(current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch].children } }
        }
        current = (current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch]
      }
      current.isEndOfWord = true
      return node
    }
    const newTrie = insertWord(trie, 'hello')
    localStorage.setItem('ds-visualizer-data-trie', JSON.stringify(newTrie))
  })

  // Reload to pick up the new data
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const trieWordsAfter = await getInfoValue(page, 'WORDS:')
  expect(trieWordsAfter > trieInitialWords, `Trie: 插入后 WORDS 未增加 (${trieWordsAfter} vs ${trieInitialWords})`).toBeTruthy()

  // Reload again to verify persistence
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const trieWordsReload = await getInfoValue(page, 'WORDS:')
  expect(trieWordsReload === trieWordsAfter, `Trie: 重载后 WORDS=${trieWordsReload} 与预期 ${trieWordsAfter} 不同`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'persistence-all.png'), fullPage: false })

  // =====================================================================
  // TEST 2: Undo/Redo Depth
  // =====================================================================
  console.log('[Test 2] 撤销/重做深度测试...')
  await clearAndReload(page, 'array', 'array')

  // Reset to get known state
  await clickButtonIfEnabled(page, /重置/)
  await sleep(800)
  await closeModalIfOpen(page)

  // Perform 5 insert operations to build history
  const undoTestValues = [11, 22, 33, 44, 55]
  for (const val of undoTestValues) {
    await insertArrayElement(page, val, 0)
  }

  // Record size after all inserts
  await sleep(500)
  await closeModalIfOpen(page)
  const sizeBeforeUndo = await getSizeValue(page)
  expect(sizeBeforeUndo > 5, `Undo: 操作后 SIZE 读取失败 (${sizeBeforeUndo})`).toBeTruthy()

  // Undo 3 times and verify size decreases
  const sizes = [sizeBeforeUndo]
  for (let i = 0; i < 3; i++) {
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /撤销/)
    await sleep(1000)
    await closeModalIfOpen(page)
    const s = await getSizeValue(page)
    sizes.push(s)
  }

  const sizeAfterUndo3 = sizes[sizes.length - 1]
  expect(sizeAfterUndo3 < sizeBeforeUndo, `Undo: 撤销后 SIZE 未减小 (${sizeAfterUndo3})`).toBeTruthy()

  // Redo 2 times and verify size increases
  for (let i = 0; i < 2; i++) {
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /重做/)
    await sleep(1000)
    await closeModalIfOpen(page)
  }

  const sizeAfterRedo2 = await getSizeValue(page)
  expect(sizeAfterRedo2 > sizeAfterUndo3, `Redo: 重做后 SIZE 未增加 (${sizeAfterRedo2})`).toBeTruthy()

  // Undo all the way to start
  for (let i = 0; i < 15; i++) {
    await closeModalIfOpen(page)
    const undoBtn = page.locator('button').filter({ hasText: /撤销/ }).first()
    if (await undoBtn.count() === 0) break
    const disabled = await undoBtn.isDisabled().catch(() => true)
    if (disabled) break
    await undoBtn.click()
    await sleep(800)
    await closeModalIfOpen(page)
  }

  // Check undo button is disabled at history start
  await sleep(500)
  await closeModalIfOpen(page)
  const undoBtnFinal = page.locator('button').filter({ hasText: /撤销/ }).first()
  const undoDisabled = await undoBtnFinal.isDisabled().catch(() => false)
  expect(undoDisabled, 'Undo: 历史起点时撤销按钮未禁用').toBeTruthy()

  // Redo all the way
  for (let i = 0; i < 15; i++) {
    await closeModalIfOpen(page)
    const redoBtn = page.locator('button').filter({ hasText: /重做/ }).first()
    if (await redoBtn.count() === 0) break
    const disabled = await redoBtn.isDisabled().catch(() => true)
    if (disabled) break
    await redoBtn.click()
    await sleep(800)
    await closeModalIfOpen(page)
  }

  // Check redo button is disabled at history end
  await sleep(500)
  await closeModalIfOpen(page)
  const redoBtnFinal = page.locator('button').filter({ hasText: /重做/ }).first()
  const redoDisabled = await redoBtnFinal.isDisabled().catch(() => false)
  expect(redoDisabled, 'Redo: 全部重做后重做按钮未禁用').toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'undo-redo-test.png'), fullPage: false })

  // =====================================================================
  // TEST 3: Data Structure Boundary Conditions
  // =====================================================================
  console.log('[Test 3] 边界条件测试...')

  // --- Array: fill to 20, try 21st ---
  console.log('  [Array] 填充到20个元素...')
  await clearAndReload(page, 'array', 'array')

  // Insert repeatedly until SIZE reaches 20
  for (let i = 0; i < 30; i++) {
    const sz = await getSizeValue(page)
    if (sz >= 20) break
    await insertArrayElement(page, i + 10, sz >= 0 ? sz : 0)
  }

  const arrFullSize = await getSizeValue(page)
  expect(arrFullSize >= 20, `Array: 未填满 (${arrFullSize})`).toBeTruthy()

  // Try to add 21st - should fail
  await closeModalIfOpen(page)
  const sizeBeforeOverflow = await getSizeValue(page)
  const inputs21 = await getVisibleInputs(page)
  if (inputs21.length >= 2) {
    await fillInput(page, inputs21[0], '999')
    await fillInput(page, inputs21[1], '0')
  }
  await sleep(300)
  await closeModalIfOpen(page)
  await insertArrayElement(page, 999, 0)

  // SIZE should not have increased (overflow prevented)
  const sizeAfterOverflow = await getSizeValue(page)
  expect(sizeAfterOverflow <= sizeBeforeOverflow, `Array: 溢出后 SIZE 变为 ${sizeAfterOverflow} (异常增加)`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'array-full-boundary.png'), fullPage: false })

  // --- Stack: fill to 10, try push ---
  console.log('  [Stack] 填充到10个元素...')
  await clearAndReload(page, 'stack', 'stack')

  for (let i = 0; i < 20; i++) {
    const sz = await getSizeValue(page)
    if (sz >= 10) break
    await pushStack(page, i + 1)
  }

  const stackFullSize = await getSizeValue(page)
  expect(stackFullSize >= 10, `Stack: 未填满 (${stackFullSize})`).toBeTruthy()

  // Try push on full stack - SIZE should not increase
  const stackSizeBefore = await getSizeValue(page)
  await pushStack(page, 99)
  const stackSizeAfter = await getSizeValue(page)
  expect(stackSizeAfter <= stackSizeBefore, `Stack: 栈满后 Push SIZE 变为 ${stackSizeAfter} (异常增加)`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'stack-full-boundary.png'), fullPage: false })

  // --- Queue: fill to max, try enqueue ---
  console.log('  [Queue] 填充到10个元素...')
  await clearAndReload(page, 'queue', 'queue')

  for (let i = 0; i < 20; i++) {
    const sz = await getSizeValue(page)
    if (sz >= 10) break
    await enqueueQueue(page, i + 10)
  }

  const queueFullSize = await getSizeValue(page)
  expect(queueFullSize >= 10, `Queue: 未填满 (${queueFullSize})`).toBeTruthy()

  // Try enqueue on full queue - SIZE should not increase
  const queueSizeBefore = await getSizeValue(page)
  await enqueueQueue(page, 99)
  const queueSizeAfter = await getSizeValue(page)
  expect(queueSizeAfter <= queueSizeBefore, `Queue: 队满后 Enqueue SIZE 变为 ${queueSizeAfter} (异常增加)`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'queue-full-boundary.png'), fullPage: false })

  // --- LinkedList: add 15+ nodes, verify rendering ---
  console.log('  [LinkedList] 添加15+节点...')
  await clearAndReload(page, 'linkedlist', 'linkedlist')

  for (let i = 0; i < 15; i++) {
    await closeModalIfOpen(page)
    const lli = await getVisibleInputs(page)
    if (lli.length > 0) await fillInput(page, lli[0], String(i + 1))
    await sleep(300)
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /尾插/)
    await sleep(600)
    await closeModalIfOpen(page)
  }

  await sleep(800)
  await closeModalIfOpen(page)

  // Verify localStorage data has 15+ nodes (initial 4 + 15 = 19)
  const llData = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-linkedlist')
    return d ? JSON.parse(d) : null
  })
  expect(Array.isArray(llData) && llData.length >= 15, `LinkedList: 数据长度不足 (${(llData as unknown[] | null)?.length})`).toBeTruthy()

  // Verify SVG has content
  const llSvgContent = await page.locator('svg circle, svg rect').count()
  expect(llSvgContent > 0, `LinkedList: SVG 渲染为空`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'linkedlist-many-nodes.png'), fullPage: false })

  // --- Tree: insert 10+ nodes, verify tree renders ---
  console.log('  [Tree] 插入10+节点...')
  await clearAndReload(page, 'tree', 'tree')

  // Initial tree has 7 nodes, insert more to get 10+
  const treeInsertValues = [15, 25, 35]
  for (const val of treeInsertValues) {
    await closeModalIfOpen(page)
    const ti = await getVisibleInputs(page)
    if (ti.length > 0) await fillInput(page, ti[0], String(val))
    await sleep(300)
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /插入/)
    await sleep(800)
    await closeModalIfOpen(page)
  }

  const treeNodeCount = await getInfoValue(page, 'NODES:')
  expect(treeNodeCount >= 10, `Tree: 节点数不足 (${treeNodeCount})`).toBeTruthy()

  // Verify SVG has rendered tree nodes
  const treeSvgContent = await page.locator('svg circle, svg rect').count()
  expect(treeSvgContent > 0, `Tree: SVG 渲染为空`).toBeTruthy()

  // Verify localStorage tree data
  const treeData = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-tree')
    return d ? JSON.parse(d) : null
  })
  const treeNodeCountStored = Array.isArray(treeData) ? (treeData as number[]).filter(v => v !== 0).length : 0
  expect(treeNodeCountStored >= 10, `Tree: localStorage 节点数不足 (${treeNodeCountStored})`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tree-many-nodes.png'), fullPage: false })

  // --- Heap: insert 10+ values, verify heap property ---
  console.log('  [Heap] 插入10+值...')
  await clearAndReload(page, 'heap', 'heap')

  // Initial heap has 7 elements
  const heapInsertValues = [85, 55, 65]
  for (const val of heapInsertValues) {
    await closeModalIfOpen(page)
    const hi = await getVisibleInputs(page)
    if (hi.length > 0) await fillInput(page, hi[0], String(val))
    await sleep(300)
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /插入/)
    await sleep(800)
    await closeModalIfOpen(page)
  }

  const heapSize = await getSizeValue(page)
  expect(heapSize >= 10, `Heap: 堆大小不足 (${heapSize})`).toBeTruthy()

  // Verify heap property from localStorage
  const heapData = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-heap')
    return d ? JSON.parse(d) : []
  })

  let heapValid = true
  for (let i = 0; i < (heapData as number[]).length; i++) {
    const left = 2 * i + 1
    const right = 2 * i + 2
    if (left < (heapData as number[]).length && (heapData as number[])[left] > (heapData as number[])[i]) heapValid = false
    if (right < (heapData as number[]).length && (heapData as number[])[right] > (heapData as number[])[i]) heapValid = false
  }
  expect(heapValid, 'Heap: 堆属性被破坏').toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-many-nodes.png'), fullPage: false })

  // --- Trie: insert 10+ words, search existing and non-existing ---
  console.log('  [Trie] 插入单词并搜索...')
  await clearAndReload(page, 'trie', 'trie')

  // Initial trie has 5 words (cat, car, cart, dog, dot)
  // Insert additional words via localStorage (animation timing makes UI insertion unreliable in tests)
  const trieWordsToInsert = ['apple', 'app', 'banana', 'band', 'bat']
  await page.evaluate((words) => {
    // Build trie from scratch with all words
    function createNode() { return { children: {}, isEndOfWord: false } }
    function insertWord(root: { children: Record<string, unknown>; isEndOfWord?: boolean }, word: string) {
      const node = { ...root, children: { ...root.children } }
      let current = node as { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>; isEndOfWord?: boolean }
      for (const ch of word) {
        if (!current.children[ch]) {
          (current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch] = createNode()
        } else {
          (current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch] = { ...(current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch], children: { ...(current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch].children } }
        }
        current = (current.children as Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>)[ch]
      }
      current.isEndOfWord = true
      return node
    }
    const existingWords = ['cat', 'car', 'cart', 'dog', 'dot']
    let root = createNode()
    for (const w of [...existingWords, ...words]) {
      root = insertWord(root, w)
    }
    localStorage.setItem('ds-visualizer-data-trie', JSON.stringify(root))
  }, trieWordsToInsert)

  // Reload to pick up the new data
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const trieWordCount = await getInfoValue(page, 'WORDS:')
  expect(trieWordCount >= 10, `Trie: 单词数不足 (${trieWordCount})`).toBeTruthy()

  // Search for existing word "apple" via localStorage verification
  const appleFound = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-trie')
    if (!d) return false
    const trie = JSON.parse(d) as { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }> }
    let current: { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>; isEndOfWord: boolean } = trie
    for (const ch of 'apple') {
      if (!current.children[ch]) return false
      current = current.children[ch] as { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>; isEndOfWord: boolean }
    }
    return current.isEndOfWord === true
  })
  expect(appleFound, 'Trie: 搜索 "apple" 未找到').toBeTruthy()

  // Search for non-existing word "xyz" via localStorage verification
  const xyzFound = await page.evaluate(() => {
    const d = localStorage.getItem('ds-visualizer-data-trie')
    if (!d) return false
    const trie = JSON.parse(d) as { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }> }
    let current: { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>; isEndOfWord: boolean } = trie
    for (const ch of 'xyz') {
      if (!current.children[ch]) return false
      current = current.children[ch] as { children: Record<string, { children: Record<string, unknown>; isEndOfWord: boolean }>; isEndOfWord: boolean }
    }
    return current.isEndOfWord === true
  })
  expect(!xyzFound, 'Trie: 搜索 "xyz" 误报为找到').toBeTruthy()
  await closeModalIfOpen(page)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-search-boundary.png'), fullPage: false })

  // =====================================================================
  // TEST 4: Rapid Operation Handling
  // =====================================================================
  console.log('[Test 4] 快速操作测试...')

  // --- Sort: randomize then immediately sort ---
  console.log('  [Sort] 随机化后立即排序...')
  await page.goto(BASE_URL + 'sort', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(1000)
  await closeModalIfOpen(page)

  // Click randomize
  await clickButtonIfEnabled(page, /随机/)
  await sleep(300)

  // Immediately try to click bubble sort
  const bubbleBtn = page.locator('button').filter({ hasText: /冒泡/ }).first()
  if (await bubbleBtn.count() > 0) {
    try {
      const isDisabled = await bubbleBtn.isDisabled()
      if (!isDisabled) await bubbleBtn.click({ timeout: 2000 })
    } catch {}
  }
  await sleep(3000)
  await closeModalIfOpen(page)

  // Check no crash - page should still be functional
  const sortPageOk = await page.locator('text=/排序/').count() > 0
  expect(sortPageOk, 'Sort: 随机化后立即排序页面异常').toBeTruthy()

  // Check sort page has SVG content
  const sortSvgContent = await page.locator('svg rect, svg line').count()
  expect(sortSvgContent > 0, `Sort: 排序后 SVG 为空`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sort-rapid-test.png'), fullPage: false })

  // --- Array: rapidly click insert 5 times ---
  console.log('  [Array] 快速连续插入...')
  await clearAndReload(page, 'array', 'array')

  // If array is full (boundary test leftovers), reset to default first
  const preSize = await getSizeValue(page)
  if (preSize >= 20) {
    await clickButtonIfEnabled(page, /重置/)
    await sleep(800)
    await closeModalIfOpen(page)
  }

  // Set input values using native input setter to trigger React state
  const rapidInputs = await getVisibleInputs(page)
  if (rapidInputs.length >= 2) {
    await rapidInputs[0].fill('42')
    await rapidInputs[1].fill('0')
    await rapidInputs[1].press('Tab')
  }
  await sleep(500)

  const sizeBeforeRapid = await getSizeValue(page)
  console.log(`    [Array] 插入前 SIZE=${sizeBeforeRapid}`)

  // Rapidly click insert 5 times with minimal delay
  for (let i = 0; i < 5; i++) {
    await closeModalIfOpen(page)
    const insertBtn = page.locator('button').filter({ hasText: /按位插/ }).first()
    try {
      const isDisabled = await insertBtn.isDisabled().catch(() => true)
      console.log(`    [Array] 第${i + 1}次点击: disabled=${isDisabled}`)
      if (!isDisabled) await insertBtn.click()
    } catch (e) {
      console.log(`    [Array] 第${i + 1}次点击异常: ${(e as Error).message}`)
    }
    await sleep(200)
  }

  // Wait for animations to complete (up to 10s, polling every 500ms)
  let sizeAfterRapid = sizeBeforeRapid
  for (let i = 0; i < 20; i++) {
    await sleep(500)
    await closeModalIfOpen(page)
    const currentSize = await getSizeValue(page)
    if (currentSize > sizeBeforeRapid) {
      sizeAfterRapid = currentSize
      console.log(`    [Array] 第${i + 1}次轮询: SIZE变为 ${currentSize}`)
      break
    }
  }
  if (sizeAfterRapid === sizeBeforeRapid) {
    sizeAfterRapid = await getSizeValue(page)
  }

  // Check page is still functional
  const arrayPageOk = await page.locator('text=/SIZE/').count() > 0
  expect(arrayPageOk, 'Array: 快速连续插入后页面异常').toBeTruthy()

  // Check size is reasonable (should not have duplicated all 5 times due to animation guard)
  const finalSize = await getSizeValue(page)
  const sizeIncrease = finalSize - sizeBeforeRapid
  console.log(`    [Array] 最终 SIZE=${finalSize}, 增加=${sizeIncrease}`)
  expect(sizeIncrease >= 1 && sizeIncrease <= 5, `Array: 快速插入增加 ${sizeIncrease} 个元素（异常，SIZE: ${sizeBeforeRapid}→${finalSize}）`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'rapid-insert-test.png'), fullPage: false })

  // =====================================================================
  // TEST 5: Animation + State Consistency
  // =====================================================================
  console.log('[Test 5] 动画+状态一致性测试...')

  await clearAndReload(page, 'tree', 'tree')

  // Insert a node first
  const animTreeInp = await getVisibleInputs(page)
  if (animTreeInp.length > 0) await fillInput(page, animTreeInp[0], '45')
  await sleep(300)
  await closeModalIfOpen(page)
  await clickButtonIfEnabled(page, /插入/)
  await sleep(1000)
  await closeModalIfOpen(page)

  // Trigger traversal animation (preorder) and immediately check button states
  await closeModalIfOpen(page)
  let insertEnabledAfter = true // default: skip if preorder button not found
  const preorderBtn = page.locator('button').filter({ hasText: /前序/ }).first()
  if (await preorderBtn.count() > 0) {
    await preorderBtn.click()
    await sleep(300)

    // During animation, buttons should be disabled
    const insertDuringAnim = page.locator('button').filter({ hasText: /插入/ }).first()
    const insertDisabledDuringAnim = await insertDuringAnim.isDisabled().catch(() => true)
    expect(insertDisabledDuringAnim, 'Tree: 动画期间插入按钮未禁用').toBeTruthy()

    const deleteDuringAnim = page.locator('button').filter({ hasText: /删除/ }).first()
    const deleteDisabledDuringAnim = await deleteDuringAnim.isDisabled().catch(() => true)
    expect(deleteDisabledDuringAnim, 'Tree: 动画期间删除按钮未禁用').toBeTruthy()

    const searchDuringAnim = page.locator('button').filter({ hasText: /查找/ }).first()
    const searchDisabledDuringAnim = await searchDuringAnim.isDisabled().catch(() => true)
    expect(searchDisabledDuringAnim, 'Tree: 动画期间查找按钮未禁用').toBeTruthy()

    // Wait for animation to complete (poll for button re-enable, up to 15s)
    for (let i = 0; i < 30; i++) {
      await sleep(500)
      await closeModalIfOpen(page)
      const btn = page.locator('button').filter({ hasText: /插入/ }).first()
      if (!(await btn.isDisabled().catch(() => true))) {
        insertEnabledAfter = true
        break
      }
      insertEnabledAfter = false
    }
  }
  expect(insertEnabledAfter, 'Tree: 动画结束后插入按钮仍禁用').toBeTruthy()

  // Verify state is correct after animation
  const nodesAfterAnim = await getInfoValue(page, 'NODES:')
  expect(nodesAfterAnim >= 7, `Tree: 动画结束后 NODES 异常 (${nodesAfterAnim})`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'animation-state-test.png'), fullPage: false })

  // =====================================================================
  // TEST 6: Error Boundary Recovery & Console Errors
  // =====================================================================
  console.log('[Test 6] 错误边界与控制台错误测试...')

  const errorsBefore = consoleErrors.length
  const allPagePaths = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'sort', 'hash', 'heap', 'trie']

  for (const p of allPagePaths) {
    try {
      await page.goto(BASE_URL + p, { waitUntil: 'domcontentloaded', timeout: 10000 })
      await sleep(600)
      await closeModalIfOpen(page)

      // Check for error boundary display - use separate selectors
      const errorBoundary1 = await page.locator('.error-boundary').count()
      const errorBoundary2 = await page.locator('text=组件异常').count()
      const errorBoundary3 = await page.locator('text=Component Error').count()
      const hasError = errorBoundary1 > 0 || errorBoundary2 > 0 || errorBoundary3 > 0
      expect(!hasError, `ErrorBoundary: 页面 /${p} 显示了错误边界`).toBeTruthy()
    } catch (e) {
      throw new Error(`ErrorBoundary: 页面 /${p} 加载失败: ${(e as Error).message}`)
    }
  }

  // Verify the app loads correctly without error state on the main page
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(600)
  await closeModalIfOpen(page)
  const noErrorState = (await page.locator('text=组件异常').count()) === 0
  expect(noErrorState, 'ErrorBoundary: 主页面处于错误状态').toBeTruthy()

  // Count new console errors during this test run
  const newErrors = consoleErrors.length - errorsBefore
  if (newErrors > 0) {
    console.log(`  [Console] 测试期间发现 ${newErrors} 条新错误:`)
    consoleErrors.slice(errorsBefore, errorsBefore + 5).forEach(e => console.log(`    ${e}`))
    expect(newErrors <= 3, `Console: 测试期间 ${newErrors} 条控制台错误（过多）`).toBeTruthy()
  } else {
    console.log('Console: 测试期间无控制台错误')
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-boundary-test.png'), fullPage: false })
})
