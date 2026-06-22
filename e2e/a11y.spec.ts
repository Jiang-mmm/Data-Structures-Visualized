import { test, expect } from 'playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { STRUCTURE_KEYS } from '../src/components/Sidebar'

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

for (const { path, key } of STRUCTURE_KEYS) {
  const relativePath = path === '/' ? '' : path.slice(1)

  test(`a11y scan: ${key}`, async ({ page }) => {
    await page.goto(relativePath, { waitUntil: 'domcontentloaded', timeout: 15000 })
    await page.waitForTimeout(1500)

    const results = await new AxeBuilder({ page })
      .withTags(TAGS)
      .analyze()

    const criticalOrSerious = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalOrSerious, `页面 ${key} 存在 ${criticalOrSerious.length} 个 critical/serious a11y 问题`).toEqual([])
  })
}
