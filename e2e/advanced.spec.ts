/**
 * 高级功能页面测试 - Playwright Test 格式
 *
 * 从 e2e/test-advanced.js 迁移。保留原有测试逻辑，仅替换为 Playwright Test API。
 */
import { test, expect } from 'playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import { verifyScreenshot, sleep, clickButtonIfEnabled, getVisibleInputs } from './test-helpers.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/'
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots')

// test-advanced.js 特有的输入填充函数（使用 fill 而非 pressSequentially）
async function fillInputAndTrigger(page: import('playwright/test').Page, input: import('playwright/test').Locator, value: string) {
  await input.click({ clickCount: 3 })
  await input.fill(value)
  await input.press('Tab')
  await sleep(100)
}

test('高级功能页面测试', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  // ==================== Sort Page ====================
  console.log('[Sort] 页面加载与排序操作...')
  await page.goto(BASE_URL + 'sort', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(1500)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sort-loaded.png'), fullPage: false })
  await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'sort-loaded.png'))

  // Use retry to handle Firefox lazy-load timing
  let sortTitle = 0
  for (let i = 0; i < 5; i++) {
    sortTitle = await page.locator('text=排序').first().count()
    if (sortTitle > 0) break
    await sleep(500)
  }
  expect(sortTitle > 0, 'Sort: 页面标题错误').toBeTruthy()

  await clickButtonIfEnabled(page, /随机/)
  await sleep(800)
  const barCount = await page.locator('rect').count()
  expect(barCount > 0, 'Sort: 随机数据生成失败').toBeTruthy()

  const algoButtons = await page.locator('button').filter({ hasText: /冒泡|选择|插入|快速|归并|堆|Bubble|Selection|Insertion|Quick|Merge|Heap/ }).all()
  expect(algoButtons.length >= 3, `Sort: 排序算法按钮不足 (实际 ${algoButtons.length} 个)`).toBeTruthy()

  const bubbleBtn = page.locator('button').filter({ hasText: /冒泡|Bubble/ }).first()
  if (await bubbleBtn.count() > 0) {
    const bubbleDisabled = await bubbleBtn.isDisabled()
    if (!bubbleDisabled) {
      await bubbleBtn.click()
      await sleep(1500)
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sort-bubble.png'), fullPage: false })

      const statsVisible = await page.locator('text=/比较:/').count() > 0 ||
                           page.locator('text=/Compare:/').count() > 0
      expect(statsVisible, 'Sort: 排序统计信息未显示').toBeTruthy()

      await clickButtonIfEnabled(page, /停止|Stop/)
      await sleep(500)
    }
  }

  // SpeedControl 使用按钮而非 range input
  await sleep(500)
  try {
    const speedBtns = await page.$$('button')
    let found = false
    for (const btn of speedBtns) {
      const text = await btn.textContent()
      if (text?.trim() === '1x' || text?.trim() === '2x') {
        await btn.click()
        await sleep(200)
        found = true
        break
      }
    }
    if (!found) {
      console.log('Sort: 速度控制按钮跳过（未找到）')
    } else {
      console.log('Sort: 速度控制按钮可用')
    }
  } catch {
    console.log('Sort: 速度控制跳过')
  }

  // ==================== Graph Page ====================
  console.log('[Graph] 页面加载与图操作...')
  await page.goto(BASE_URL + 'graph', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'graph-loaded.png'), fullPage: false })
  await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'graph-loaded.png'))

  const graphTitle = await page.locator('text=图').first().count()
  expect(graphTitle > 0, 'Graph: 页面标题错误').toBeTruthy()

  await clickButtonIfEnabled(page, /添加节点/)
  await sleep(500)
  await clickButtonIfEnabled(page, /添加节点/)
  await sleep(500)
  await clickButtonIfEnabled(page, /添加节点/)
  await sleep(500)

  await clickButtonIfEnabled(page, /添加边/)
  await sleep(500)

  await clickButtonIfEnabled(page, /BFS/)
  await sleep(1500)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'graph-bfs.png'), fullPage: false })

  await clickButtonIfEnabled(page, /DFS/)
  await sleep(1500)

  await clickButtonIfEnabled(page, /矩阵/)
  await sleep(1000)
  let hasMatrix = await page.locator('text=邻接矩阵').count() > 0 ||
                  page.locator('text=Adjacency Matrix').count() > 0
  if (!hasMatrix) {
    await sleep(1000)
    hasMatrix = await page.locator('text=邻接矩阵').count() > 0 ||
                page.locator('text=Adjacency Matrix').count() > 0
  }
  expect(hasMatrix, 'Graph: 邻接矩阵视图切换失败').toBeTruthy()

  await clickButtonIfEnabled(page, /邻接表/)
  await sleep(1000)
  let hasList = await page.locator('text=邻接表').count() > 0 ||
                page.locator('text=Adjacency List').count() > 0
  if (!hasList) {
    await sleep(1000)
    hasList = await page.locator('text=邻接表').count() > 0 ||
              page.locator('text=Adjacency List').count() > 0
  }
  expect(hasList, 'Graph: 邻接表视图切换失败').toBeTruthy()

  await clickButtonIfEnabled(page, /力导向/)
  await sleep(500)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'graph-modes.png'), fullPage: false })

  // ==================== Hash Page ====================
  console.log('[Hash] 页面加载与哈希操作...')
  await page.goto(BASE_URL + 'hash', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'hash-loaded.png'), fullPage: false })
  await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'hash-loaded.png'))

  const hashTitle = await page.locator('text=哈希表').first().count()
  expect(hashTitle > 0, 'Hash: 页面标题错误').toBeTruthy()

  const hi = await getVisibleInputs(page)
  if (hi.length >= 2) {
    await fillInputAndTrigger(page, hi[0], '1')
    await fillInputAndTrigger(page, hi[1], 'A')
  }
  await sleep(200)
  const hashInsertClicked = await clickButtonIfEnabled(page, /^插入$/)
  expect(hashInsertClicked, 'Hash: 插入按钮未启用').toBeTruthy()
  if (hashInsertClicked) {
    await sleep(1000)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'hash-insert.png'), fullPage: false })
  }

  if (hi.length >= 2) {
    await fillInputAndTrigger(page, hi[0], '2')
    await fillInputAndTrigger(page, hi[1], 'B')
  }
  await sleep(200)
  await clickButtonIfEnabled(page, /^插入$/)
  await sleep(800)

  if (hi.length > 0) {
    await fillInputAndTrigger(page, hi[0], '1')
  }
  await sleep(200)
  await clickButtonIfEnabled(page, /^查找$/)
  await sleep(1000)

  if (hi.length > 0) {
    await fillInputAndTrigger(page, hi[0], '1')
  }
  await sleep(200)
  await clickButtonIfEnabled(page, /删除/)
  await sleep(1000)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'hash-delete.png'), fullPage: false })

  // ==================== Heap Page ====================
  console.log('[Heap] 页面加载与堆操作...')
  await page.goto(BASE_URL + 'heap', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-loaded.png'), fullPage: false })

  const heapTitle = await page.locator('text=堆').first().count()
  expect(heapTitle > 0, 'Heap: 页面标题错误').toBeTruthy()

  const heapInputs = await getVisibleInputs(page)
  if (heapInputs.length > 0) {
    await fillInputAndTrigger(page, heapInputs[0], '10')
  }
  await sleep(200)
  if (await clickButtonIfEnabled(page, /^Insert|插入$/)) {
    await sleep(800)
    if (heapInputs.length > 0) {
      await fillInputAndTrigger(page, heapInputs[0], '20')
    }
    await sleep(200)
    if (await clickButtonIfEnabled(page, /^Insert|插入$/)) {
      await sleep(800)
      if (heapInputs.length > 0) {
        await fillInputAndTrigger(page, heapInputs[0], '15')
      }
      await sleep(200)
      await clickButtonIfEnabled(page, /^Insert|插入$/)
      await sleep(800)
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-insert.png'), fullPage: false })
    }
  }

  await clickButtonIfEnabled(page, /^Peek/)
  await sleep(800)

  await clickButtonIfEnabled(page, /Extract Max/)
  await sleep(1000)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'heap-extract.png'), fullPage: false })

  // ==================== Trie Page ====================
  console.log('[Trie] 页面加载与字典树操作...')
  await page.goto(BASE_URL + 'trie', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-loaded.png'), fullPage: false })

  const trieTitle = await page.locator('text=字典树').first().count()
  expect(trieTitle > 0, 'Trie: 页面标题错误').toBeTruthy()

  const trieInputs = await getVisibleInputs(page)
  if (trieInputs.length > 0) {
    await fillInputAndTrigger(page, trieInputs[0], 'apple')
  }
  await sleep(200)
  if (await clickButtonIfEnabled(page, /^插入$/)) {
    await sleep(800)
    if (trieInputs.length > 0) {
      await fillInputAndTrigger(page, trieInputs[0], 'app')
    }
    await sleep(200)
    await clickButtonIfEnabled(page, /^插入$/)
    await sleep(800)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-insert.png'), fullPage: false })
  }

  if (trieInputs.length > 0) {
    await fillInputAndTrigger(page, trieInputs[0], 'apple')
  }
  await sleep(200)
  await clickButtonIfEnabled(page, /^查找$/)
  await sleep(1000)

  if (trieInputs.length > 0) {
    await fillInputAndTrigger(page, trieInputs[0], 'ap')
  }
  await sleep(200)
  const prefixBtn = page.locator('button').filter({ hasText: /前缀|Prefix/ }).first()
  if (await prefixBtn.count() > 0) {
    const prefixDisabled = await prefixBtn.isDisabled()
    if (!prefixDisabled) {
      await prefixBtn.click()
      await sleep(1000)
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'trie-prefix.png'), fullPage: false })
    }
  }

  if (trieInputs.length > 0) {
    await fillInputAndTrigger(page, trieInputs[0], 'app')
  }
  await sleep(200)
  await clickButtonIfEnabled(page, /删除/)
  await sleep(1000)

  // ==================== SortCompare Page ====================
  console.log('[SortCompare] 页面加载与算法对比...')
  await page.goto(BASE_URL + 'compare', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'compare-loaded.png'), fullPage: false })

  const compareTitle = await page.locator('text=算法对比').first().count()
  expect(compareTitle > 0, 'SortCompare: 页面标题错误').toBeTruthy()

  // SortCompare 使用可点击卡片而非下拉框
  const algoCards = await page.locator('div.cursor-pointer.border-2').count()
  if (algoCards > 0) {
    console.log(`SortCompare: 找到 ${algoCards} 个算法选择卡片`)
  } else {
    console.log('SortCompare: 算法选择区域存在')
  }

  await clickButtonIfEnabled(page, /全部运行|Run All/)
  await sleep(4000)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'compare-running.png'), fullPage: false })

  const perfChart = await page.locator('text=/性能对比|Performance/').count() > 0 ||
                    page.locator('canvas').count() > 0 ||
                    page.locator('svg rect').count() > 0
  expect(perfChart, 'SortCompare: PerformanceChart 未显示').toBeTruthy()

  const timelineExists = await page.locator('text=/操作历史|Operation History/').count() > 0
  expect(timelineExists, 'SortCompare: Timeline 未显示').toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'compare-chart.png'), fullPage: false })

  if (consoleErrors.length > 0) {
    console.log('[控制台错误]', consoleErrors.slice(0, 10))
  }
})
