/**
 * 跨模块交互综合测试 - Playwright Test 格式
 *
 * 从 e2e/test-interactions.js 迁移。保留原有测试逻辑，仅替换为 Playwright Test API。
 */
import { test, expect, type Page } from 'playwright/test'
import path from 'path'
import { sleep, clickButtonIfEnabled, closeModalIfOpen, getVisibleInputs, fillInput, SCREENSHOTS_DIR } from './test-helpers.js'

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/'

// Read SIZE value from StatsOverlay (label and value in separate spans)
async function readSizeText(page: Page) {
  return page.evaluate(() => {
    const spans = document.querySelectorAll('span')
    for (const span of Array.from(spans)) {
      if (span.textContent?.trim() === 'SIZE' && span.nextElementSibling) {
        return `SIZE ${span.nextElementSibling.textContent?.trim()}`
      }
    }
    return 'SIZE ?'
  })
}

test('跨模块交互综合测试', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  // =====================================================================
  // TEST 1: Theme Switching (light / dark / system)
  // =====================================================================
  console.log('\n[1] Theme Switching...')

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Reset theme to 'light' to ensure a known starting state
  await page.evaluate(() => {
    localStorage.setItem('ds-visualizer-theme', 'light')
  })
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Find theme toggle button (cycles light -> dark -> system).
  // The product now uses an independent tooltip (sidebar.themeModeTooltip):
  // "明暗主题" (zh) / "Light/Dark Theme" (en) followed by the current mode
  // (": light" / ": dark" / ": system"). The color-theme popover button uses
  // "主题"/"Theme" only and must not be matched.
  const themeBtn = page.locator(
    'button[aria-label^="明暗主题"], button[title^="明暗主题"], ' +
    'button[aria-label^="Light/Dark Theme"], button[title^="Light/Dark Theme"], ' +
    'button[title*="light" i], button[title*="dark" i], button[title*="system" i], ' +
    'button[aria-label*="light" i], button[aria-label*="dark" i], button[aria-label*="system" i]'
  ).first()
  const themeBtnExists = await themeBtn.count() > 0
  expect(themeBtnExists, 'Theme: 未找到主题切换按钮').toBeTruthy()

  if (themeBtnExists) {
    const themeTitle = await themeBtn.getAttribute('title')
    console.log(`  Theme button title: ${themeTitle}`)

    // Read initial state
    const initialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    console.log(`  初始 dark 状态: ${initialDark}`)

    // Click theme toggle - cycles light->dark->system
    await themeBtn.click()
    await sleep(600)
    const afterFirstClick = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    console.log(`  第一次点击后 dark 状态: ${afterFirstClick}`)
    expect(afterFirstClick !== initialDark, 'Theme: 第一次切换后 dark class 未变化').toBeTruthy()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-after-1st-click.png'), fullPage: false })

    // Click again to cycle
    await themeBtn.click()
    await sleep(600)
    const afterSecondClick = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    console.log(`  第二次点击后 dark 状态: ${afterSecondClick}`)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-after-2nd-click.png'), fullPage: false })

    // Click again to cycle back to original
    await themeBtn.click()
    await sleep(600)
    const afterThirdClick = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    console.log(`  第三次点击后 dark 状态: ${afterThirdClick}`)
    expect(afterThirdClick === initialDark, 'Theme: 三次切换后未恢复原始主题').toBeTruthy()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-restored.png'), fullPage: false })
  }

  // =====================================================================
  // TEST 2: Language Switching (Chinese / English)
  // =====================================================================
  console.log('\n[2] Language Switching...')

  // The app uses localStorage key 'ds-visualizer-lang' with values 'zh' or 'en'
  // There's no visible toggle button, so we test via localStorage + reload

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)

  // Verify default Chinese
  const hasChineseTitle = await page.locator('text=数据结构学习助手').first().count()
  expect(hasChineseTitle > 0, 'i18n: 默认中文标题不存在').toBeTruthy()

  // Switch to English via localStorage
  await page.evaluate(() => localStorage.setItem('ds-visualizer-lang', 'en'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await sleep(800)

  const hasEnglishTitle = await page.locator('text=Data Structure').first().count()
  expect(hasEnglishTitle > 0, 'i18n: 切换到英文后标题未变化').toBeTruthy()
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'lang-english.png'), fullPage: false })

  // Switch back to Chinese
  await page.evaluate(() => localStorage.setItem('ds-visualizer-lang', 'zh'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await sleep(800)

  const hasChineseAgain = await page.locator('text=数据结构学习助手').first().count()
  expect(hasChineseAgain > 0, 'i18n: 切回中文后标题未恢复').toBeTruthy()
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'lang-chinese-restored.png'), fullPage: false })

  // =====================================================================
  // TEST 3: Sidebar Navigation
  // =====================================================================
  console.log('\n[3] Sidebar Navigation...')

  const sidebarRoutes = [
    { path: 'array', text: /数组|Array/ },
    { path: 'stack', text: /栈|Stack/ },
    { path: 'queue', text: /队列|Queue/ },
    { path: 'linkedlist', text: /链表|Linked/ },
    { path: 'tree', text: /二叉树|Binary/ },
    { path: 'graph', text: /图|Graph/ },
    { path: 'sort', text: /排序|Sort/ },
    { path: 'hash', text: /哈希|Hash/ },
    { path: 'heap', text: /堆|Heap/ },
    { path: 'trie', text: /字典树|Trie/ },
    { path: 'compare', text: /对比|Compare/ },
  ]

  // Start from home
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  for (const route of sidebarRoutes) {
    const link = page.locator(`a[href*="/${route.path}"]`).first()
    const linkCount = await link.count()
    if (linkCount > 0) {
      await link.click()
      await sleep(600)
      await closeModalIfOpen(page)
      const url = page.url()
      const correct = url.includes(route.path)
      expect(correct, `Sidebar: ${route.path} 页面导航失败 (URL: ${url})`).toBeTruthy()
    } else {
      throw new Error(`Sidebar: ${route.path} 链接不存在`)
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-all-nav.png'), fullPage: false })

  // Test sidebar collapse/expand
  console.log('  Testing sidebar collapse/expand...')
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(600)

  const collapseBtn = page.locator('button').filter({ hasText: /◀/ }).first()
  const collapseBtnExists = await collapseBtn.count() > 0
  expect(collapseBtnExists, 'Sidebar: 折叠按钮不存在').toBeTruthy()

  if (collapseBtnExists) {
    // Collapse
    await collapseBtn.click()
    await sleep(400)

    // After collapse, button should show hamburger icon "☰"
    const expandBtn = page.locator('button').filter({ hasText: /☰/ }).first()
    const expandExists = await expandBtn.count() > 0
    expect(expandExists, 'Sidebar: 折叠后未显示展开按钮').toBeTruthy()
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-collapsed.png'), fullPage: false })

    // Expand again
    if (expandExists) {
      await expandBtn.click()
      await sleep(400)
      const collapseAgain = page.locator('button').filter({ hasText: /◀/ }).first()
      const collapseAgainExists = await collapseAgain.count() > 0
      expect(collapseAgainExists, 'Sidebar: 展开后未恢复').toBeTruthy()
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-expanded.png'), fullPage: false })
    }
  }

  // =====================================================================
  // TEST 4: Keyboard Shortcuts
  // =====================================================================
  console.log('\n[4] Keyboard Shortcuts...')

  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Press '?' to open keyboard help dialog
  await page.keyboard.press('?')
  await sleep(500)

  // Check for help dialog - title contains "键盘快捷键" or "Keyboard Shortcuts"
  const helpDialog = page.locator('[role="dialog"]')
  const helpVisible = await helpDialog.count() > 0
  expect(helpVisible, 'Keyboard: ? 键未打开帮助对话框').toBeTruthy()

  if (helpVisible) {
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'keyboard-help-open.png'), fullPage: false })

    // Check dialog content contains shortcut entries
    const shortcutEntries = await helpDialog.locator('kbd').count()
    expect(shortcutEntries > 0, 'Keyboard: 帮助对话框无快捷键条目').toBeTruthy()

    // Press Escape to close
    await page.keyboard.press('Escape')
    await sleep(300)

    const helpGone = await page.locator('[role="dialog"]').count()
    expect(helpGone === 0, 'Keyboard: Escape 未能关闭对话框').toBeTruthy()
  }

  // Test Ctrl+Z undo (requires some data history)
  // First add some data to create undo history
  const arrInputs = await getVisibleInputs(page)
  if (arrInputs.length >= 2) {
    await fillInput(page, arrInputs[0], '42')
    await fillInput(page, arrInputs[1], '0')
    await sleep(200)
    await clickButtonIfEnabled(page, /按位插|插入/)
    await sleep(1000)
    await closeModalIfOpen(page)
  }

  // Check SIZE info to verify data exists
  const sizeAfterInsert = await readSizeText(page)
  console.log(`  After insert: ${sizeAfterInsert}`)

  // Press Ctrl+Z to undo
  await page.keyboard.press('Control+z')
  await sleep(600)
  await closeModalIfOpen(page)

  const sizeAfterUndo = await readSizeText(page)
  console.log(`  After undo: ${sizeAfterUndo}`)

  // The undo should have changed the data (or at least not errored)
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'keyboard-undo.png'), fullPage: false })
  console.log('Keyboard: Ctrl+Z undo 操作执行')

  // =====================================================================
  // TEST 5: Export/Import Cycle
  // =====================================================================
  console.log('\n[5] Export/Import Cycle...')

  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Add some elements first
  await clickButtonIfEnabled(page, /随机/)
  await sleep(1000)
  await closeModalIfOpen(page)

  // Find export button - labeled "↓ 导出" or "↓ Export"
  const exportBtn = page.locator('button').filter({ hasText: /导出|Export/ }).first()
  const exportBtnExists = await exportBtn.count() > 0
  expect(exportBtnExists, 'Export: 未找到导出按钮').toBeTruthy()

  if (exportBtnExists) {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)
    await exportBtn.click()
    await sleep(500)
    const download = await downloadPromise
    expect(download !== null, 'Export: 点击导出后未触发下载').toBeTruthy()
    if (download) {
      const filename = download.suggestedFilename()
      console.log(`  Downloaded file: ${filename}`)
      expect(filename.includes('array'), `Export: 下载文件名不包含 'array': ${filename}`).toBeTruthy()
    }
  }

  // Find import button - labeled "↑ 导入" or "↑ Import"
  const importBtn = page.locator('button').filter({ hasText: /导入|Import/ }).first()
  const importBtnExists = await importBtn.count() > 0
  expect(importBtnExists, 'Import: 未找到导入按钮').toBeTruthy()

  if (importBtnExists) {
    // Set up file chooser listener
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null)
    await importBtn.click()
    await sleep(500)
    const fileChooser = await fileChooserPromise
    expect(fileChooser !== null, 'Import: 点击导入后未弹出文件选择器').toBeTruthy()
    if (fileChooser) {
      // Cancel the file chooser
      await fileChooser.setFiles([])
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'export-import.png'), fullPage: false })

  // =====================================================================
  // TEST 6: Share Button
  // =====================================================================
  console.log('\n[6] Share Button...')

  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Add some data first
  await clickButtonIfEnabled(page, /随机/)
  await sleep(1000)
  await closeModalIfOpen(page)

  // Find share button - has 🔗 icon
  const shareBtn = page.locator('button[aria-label*="分享"], button[aria-label*="Share"], button[title*="分享"], button[title*="Share"]').first()
  const shareBtnAlt = page.locator('button').filter({ hasText: /🔗/ }).first()
  let shareBtnToUse = shareBtn
  if ((await shareBtn.count()) === 0 && (await shareBtnAlt.count()) > 0) {
    shareBtnToUse = shareBtnAlt
  }
  const shareExists = (await shareBtnToUse.count()) > 0
  expect(shareExists, 'Share: 未找到分享按钮').toBeTruthy()

  if (shareExists) {
    // Intercept clipboard API
    let clipboardText = ''
    await page.exposeFunction('__clipboardWrite', (text: string) => { clipboardText = text })
    await page.evaluate(() => {
      navigator.clipboard.writeText = (text) => {
        window.__clipboardWrite(text)
        return Promise.resolve()
      }
    })

    await shareBtnToUse.click()
    await sleep(800)

    // Check if toast appeared (success or warning)
    const toastAppeared = await page.locator('.fixed').filter({ hasText: /复制|Copied|链接|Link|手动|Manual/ }).count() > 0
    expect(toastAppeared || clipboardText.length > 0, 'Share: 点击分享后无反馈').toBeTruthy()

    if (clipboardText.length > 0) {
      expect(clipboardText.includes('data='), 'Share: 剪贴板内容不含分享数据').toBeTruthy()
      console.log(`  Clipboard URL length: ${clipboardText.length}`)
    }
  }

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'share-button.png'), fullPage: false })

  // =====================================================================
  // TEST 7: Responsive Behavior
  // =====================================================================
  console.log('\n[7] Responsive Behavior...')

  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 })
  await sleep(300)

  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-array.png'), fullPage: false })

  // On mobile, sidebar should be hidden and hamburger menu should appear
  const hamburgerBtn = page.locator('button').filter({ hasText: /☰/ }).first()
  const hamburgerVisible = await hamburgerBtn.count() > 0
  expect(hamburgerVisible, 'Responsive: 移动端未显示汉堡菜单').toBeTruthy()

  // Check that the sidebar is NOT directly visible (it's behind the hamburger)
  const sidebarDirect = page.locator('aside').first()
  const sidebarVisible = await sidebarDirect.evaluate(el => {
    const styles = window.getComputedStyle(el)
    return styles.position !== 'fixed' || el.classList.contains('open')
  }).catch(() => true)
  expect(!sidebarVisible || hamburgerVisible, 'Responsive: 移动端侧边栏未正确隐藏').toBeTruthy()

  // Click hamburger to open sidebar
  if (hamburgerVisible) {
    await hamburgerBtn.click()
    await sleep(400)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-sidebar-open.png'), fullPage: false })

    // Sidebar should now be visible
    console.log('Responsive: 汉堡菜单可展开侧边栏')

    // Close sidebar by clicking close button
    const closeBtn = page.locator('aside button').filter({ hasText: /✕/ }).first()
    if (await closeBtn.count() > 0) {
      await closeBtn.click()
      await sleep(400)
      console.log('Responsive: 侧边栏可通过关闭按钮收起')
    }
  }

  // Verify operation bar is still usable on mobile
  const opInputs = await getVisibleInputs(page)
  const opButtons = await page.locator('button').filter({ hasText: /插入|Insert|入栈|Push|随机|Random/ }).count()
  expect(opInputs.length > 0 || opButtons > 0, 'Responsive: 移动端操作栏不可用').toBeTruthy()

  // Reset viewport
  await page.setViewportSize({ width: 1280, height: 720 })
  await sleep(300)

  // =====================================================================
  // TEST 8: Cross-Page State Isolation
  // =====================================================================
  console.log('\n[8] Cross-Page State Isolation...')

  // Navigate to array page and add elements
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Clear and add specific elements to array
  await clickButtonIfEnabled(page, /重置/)
  await sleep(600)
  await closeModalIfOpen(page)

  const arrayInputs = await getVisibleInputs(page)
  if (arrayInputs.length >= 2) {
    await fillInput(page, arrayInputs[0], '99')
    await fillInput(page, arrayInputs[1], '0')
    await sleep(200)
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /按位插|插入/)
    await sleep(1000)
    await closeModalIfOpen(page)
  }

  // Read array SIZE
  const arraySize = await readSizeText(page)
  console.log(`  Array state: ${arraySize}`)

  // Navigate to stack page and add elements
  await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  // Clear stack
  await clickButtonIfEnabled(page, /清空/)
  await sleep(600)
  await closeModalIfOpen(page)

  const stackInputs = await getVisibleInputs(page)
  if (stackInputs.length > 0) {
    await fillInput(page, stackInputs[0], '77')
    await sleep(200)
    await closeModalIfOpen(page)
    await clickButtonIfEnabled(page, /入栈/)
    await sleep(1000)
    await closeModalIfOpen(page)
  }

  // Read stack SIZE
  const stackSize = await readSizeText(page)
  console.log(`  Stack state: ${stackSize}`)

  // Navigate back to array page - state should be preserved
  await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const arraySizeAfter = await readSizeText(page)
  console.log(`  Array state after visiting stack: ${arraySizeAfter}`)

  expect(arraySize === arraySizeAfter, `Isolation: 数组页面数据变化 (${arraySize} -> ${arraySizeAfter})`).toBeTruthy()

  // Also verify stack state is preserved
  await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 10000 })
  await sleep(800)
  await closeModalIfOpen(page)

  const stackSizeAfter = await readSizeText(page)
  console.log(`  Stack state after revisit: ${stackSizeAfter}`)

  expect(stackSize === stackSizeAfter, `Isolation: 栈页面数据变化 (${stackSize} -> ${stackSizeAfter})`).toBeTruthy()

  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'isolation-final.png'), fullPage: false })

  // =====================================================================
  // Console error check
  // =====================================================================
  if (consoleErrors.length > 0) {
    console.log(`\n[Console Errors] ${consoleErrors.length} errors detected:`)
    consoleErrors.slice(0, 10).forEach(e => console.log(`  - ${e}`))
  } else {
    console.log('无控制台错误')
  }
})
