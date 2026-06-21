/**
 * 首页导航测试 - Playwright Test 格式
 *
 * 此文件是从 e2e/test-home.js 迁移到 Playwright Test 框架的示例。
 * 迁移批准后，所有 e2e/*.js 文件将按此模式迁移。
 */
import { test, expect } from 'playwright/test'

test.describe('首页导航', () => {
  test('页面应正确加载并显示标题', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    const title = page.locator('h1').filter({ hasText: /数据结构|Data Structure/ })
    await expect(title).toBeVisible()
  })

  test('应显示数据结构卡片', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    const cards = page.locator('a[href]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(5)
  })

  test('应无控制台错误', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    expect(errors).toEqual([])
  })
})
