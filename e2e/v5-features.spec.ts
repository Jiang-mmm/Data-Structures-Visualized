/**
 * v5.0 功能测试（懒加载 + 撤销预览 + 分享）- Playwright Test 格式
 *
 * 从 e2e/test-v5-features.js 迁移。保留原有测试逻辑，仅替换为 Playwright Test API。
 */
import { test } from 'playwright/test'
import path from 'path'
import { sleep, SCREENSHOTS_DIR, verifyScreenshot } from './test-helpers.js'

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/'

// 本地版 assertWithRetry：在条件满足时 console.log，失败时抛错
async function assertWithRetry(
  conditionFn: () => Promise<boolean>,
  passMsg: string,
  failMsg: string,
  maxRetries = 3
) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await conditionFn()
      if (result) {
        console.log(passMsg)
        return
      }
    } catch {}
    if (i < maxRetries - 1) await sleep(300)
  }
  throw new Error(failMsg)
}

test('v5.0 功能测试（懒加载 + 撤销预览 + 分享）', async ({ page }) => {
  // ==================== 懒加载测试 ====================
  console.log('[LazyLoad] 页面懒加载...')
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(500)

  await assertWithRetry(
    async () => {
      const content = await page.content()
      return content.includes('array') || content.includes('Array')
    },
    'ArrayPage 懒加载成功',
    'ArrayPage 懒加载失败'
  )

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-lazyload-array.png'), fullPage: false })
  await verifyScreenshot(path.join(SCREENSHOTS_DIR, 'v5-lazyload-array.png'))

  // ==================== 撤销预览测试 ====================
  console.log('[UndoPreview] 撤销按钮悬停预览...')
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)

  const randomBtn = page.locator('button').filter({ hasText: /随机|Random/ }).first()
  if (await randomBtn.count() > 0) {
    await randomBtn.click()
    await sleep(500)
  }

  const undoBtn = page.locator('button').filter({ hasText: /撤销|Undo/ }).first()
  if (await undoBtn.count() > 0) {
    const isDisabled = await undoBtn.isDisabled()
    await assertWithRetry(
      async () => !isDisabled,
      '撤销按钮在有操作后可用',
      '撤销按钮状态异常'
    )

    await undoBtn.hover()
    await sleep(300)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-undo-preview.png'), fullPage: false })
  }

  // ==================== 分享按钮测试 ====================
  console.log('[ShareButton] 分享按钮...')
  const shareBtn = page.locator('button').filter({ hasText: /分享|Share/ }).first()
  await assertWithRetry(
    async () => (await shareBtn.count()) > 0,
    '分享按钮存在',
    '分享按钮缺失'
  )

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-share-button.png'), fullPage: false })

  // ==================== 多页面懒加载验证 ====================
  console.log('[LazyLoad] 多页面懒加载验证...')
  const pages = ['sort', 'tree', 'graph', 'hash', 'heap', 'trie']
  for (const p of pages) {
    await page.goto(BASE_URL + p, { waitUntil: 'domcontentloaded', timeout: 10000 })
    await sleep(500)
    await assertWithRetry(
      async () => {
        const content = await page.content()
        return content.length > 500
      },
      `${p} 页面懒加载成功`,
      `${p} 页面懒加载失败`
    )
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-lazyload-verified.png'), fullPage: false })

  // ==================== 暗色模式测试 ====================
  console.log('[DarkMode] 暗色模式切换...')
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(500)

  const darkBtn = page.locator('button').filter({ hasText: /🌙|暗/ }).first()
  if (await darkBtn.count() > 0) {
    await darkBtn.click()
    await sleep(500)
    const html = page.locator('html')
    const hasDark = await html.evaluate(el => el.classList.contains('dark'))
    await assertWithRetry(
      async () => hasDark,
      '暗色模式切换成功',
      '暗色模式切换失败'
    )
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'v5-dark-mode.png'), fullPage: false })
  }
})
