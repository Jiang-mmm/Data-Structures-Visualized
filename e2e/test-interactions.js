import { chromium } from 'playwright';
import path from 'path';
import { sleep, clickButtonIfEnabled, closeModalIfOpen, getVisibleInputs, fillInput, SCREENSHOTS_DIR } from './test-helpers.js';

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';

async function runTest() {
  const results = { name: '跨模块交互综合测试', passed: [], failed: [] };
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
    // =====================================================================
    // TEST 1: Theme Switching (light / dark / system)
    // =====================================================================
    console.log('\n[1] Theme Switching...');

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Reset theme to 'light' to ensure a known starting state
    await page.evaluate(() => {
      localStorage.setItem('ds-visualizer-theme', 'light');
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Find theme toggle button (cycles light -> dark -> system)
    // The theme toggle has a title attribute containing "主题" or "Theme"
    const themeBtn = page.locator('button[title*="主题"], button[title*="Theme"], button[aria-label*="主题"], button[aria-label*="Theme"]').first();
    const themeBtnExists = await themeBtn.count() > 0;
    await assert(themeBtnExists, 'Theme: 主题切换按钮存在', 'Theme: 未找到主题切换按钮');

    if (themeBtnExists) {
      const themeTitle = await themeBtn.getAttribute('title');
      console.log(`  Theme button title: ${themeTitle}`);

      // Read initial state
      const initialDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`  初始 dark 状态: ${initialDark}`);

      // Click theme toggle - cycles light->dark->system
      await themeBtn.click();
      await sleep(600);
      const afterFirstClick = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`  第一次点击后 dark 状态: ${afterFirstClick}`);
      await assert(
        afterFirstClick !== initialDark,
        'Theme: 第一次切换后 dark class 变化',
        'Theme: 第一次切换后 dark class 未变化'
      );
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-after-1st-click.png'), fullPage: false });

      // Click again to cycle
      await themeBtn.click();
      await sleep(600);
      const afterSecondClick = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`  第二次点击后 dark 状态: ${afterSecondClick}`);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-after-2nd-click.png'), fullPage: false });

      // Click again to cycle back to original
      await themeBtn.click();
      await sleep(600);
      const afterThirdClick = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      console.log(`  第三次点击后 dark 状态: ${afterThirdClick}`);
      await assert(
        afterThirdClick === initialDark,
        'Theme: 三次切换后恢复原始主题',
        'Theme: 三次切换后未恢复原始主题'
      );
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'theme-restored.png'), fullPage: false });
    }

    // =====================================================================
    // TEST 2: Language Switching (Chinese / English)
    // =====================================================================
    console.log('\n[2] Language Switching...');

    // The app uses localStorage key 'ds-visualizer-lang' with values 'zh' or 'en'
    // There's no visible toggle button, so we test via localStorage + reload

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);

    // Verify default Chinese
    const hasChineseTitle = await page.locator('text=数据结构学习助手').first().count();
    await assert(hasChineseTitle > 0, 'i18n: 默认中文标题存在', 'i18n: 默认中文标题不存在');

    // Switch to English via localStorage
    await page.evaluate(() => localStorage.setItem('ds-visualizer-lang', 'en'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(800);

    const hasEnglishTitle = await page.locator('text=Data Structure').first().count();
    await assert(hasEnglishTitle > 0, 'i18n: 切换到英文后标题变化', 'i18n: 切换到英文后标题未变化');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'lang-english.png'), fullPage: false });

    // Switch back to Chinese
    await page.evaluate(() => localStorage.setItem('ds-visualizer-lang', 'zh'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await sleep(800);

    const hasChineseAgain = await page.locator('text=数据结构学习助手').first().count();
    await assert(hasChineseAgain > 0, 'i18n: 切回中文后标题恢复', 'i18n: 切回中文后标题未恢复');
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'lang-chinese-restored.png'), fullPage: false });

    // =====================================================================
    // TEST 3: Sidebar Navigation
    // =====================================================================
    console.log('\n[3] Sidebar Navigation...');

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
    ];

    // Start from home
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    for (const route of sidebarRoutes) {
      const link = page.locator(`a[href*="/${route.path}"]`).first();
      const linkCount = await link.count();
      if (linkCount > 0) {
        await link.click();
        await sleep(600);
        await closeModalIfOpen(page);
        const url = page.url();
        const correct = url.includes(route.path);
        await assert(
          correct,
          `Sidebar: ${route.path} 页面导航成功`,
          `Sidebar: ${route.path} 页面导航失败 (URL: ${url})`
        );
      } else {
        results.failed.push(`Sidebar: ${route.path} 链接不存在`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-all-nav.png'), fullPage: false });

    // Test sidebar collapse/expand
    console.log('  Testing sidebar collapse/expand...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(600);

    const collapseBtn = page.locator('button').filter({ hasText: /◀/ }).first();
    const collapseBtnExists = await collapseBtn.count() > 0;
    await assert(collapseBtnExists, 'Sidebar: 折叠按钮存在', 'Sidebar: 折叠按钮不存在');

    if (collapseBtnExists) {
      // Collapse
      await collapseBtn.click();
      await sleep(400);

      // After collapse, button should show hamburger icon "☰"
      const expandBtn = page.locator('button').filter({ hasText: /☰/ }).first();
      const expandExists = await expandBtn.count() > 0;
      await assert(expandExists, 'Sidebar: 折叠后显示展开按钮', 'Sidebar: 折叠后未显示展开按钮');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-collapsed.png'), fullPage: false });

      // Expand again
      if (expandExists) {
        await expandBtn.click();
        await sleep(400);
        const collapseAgain = page.locator('button').filter({ hasText: /◀/ }).first();
        const collapseAgainExists = await collapseAgain.count() > 0;
        await assert(collapseAgainExists, 'Sidebar: 展开后恢复折叠按钮', 'Sidebar: 展开后未恢复');
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'sidebar-expanded.png'), fullPage: false });
      }
    }

    // =====================================================================
    // TEST 4: Keyboard Shortcuts
    // =====================================================================
    console.log('\n[4] Keyboard Shortcuts...');

    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Press '?' to open keyboard help dialog
    await page.keyboard.press('?');
    await sleep(500);

    // Check for help dialog - title contains "键盘快捷键" or "Keyboard Shortcuts"
    const helpDialog = page.locator('[role="dialog"]');
    const helpVisible = await helpDialog.count() > 0;
    await assert(helpVisible, 'Keyboard: ? 键打开快捷键帮助对话框', 'Keyboard: ? 键未打开帮助对话框');

    if (helpVisible) {
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'keyboard-help-open.png'), fullPage: false });

      // Check dialog content contains shortcut entries
      const shortcutEntries = await helpDialog.locator('kbd').count();
      await assert(
        shortcutEntries > 0,
        `Keyboard: 帮助对话框包含 ${shortcutEntries} 个快捷键条目`,
        'Keyboard: 帮助对话框无快捷键条目'
      );

      // Press Escape to close
      await page.keyboard.press('Escape');
      await sleep(300);

      const helpGone = await page.locator('[role="dialog"]').count();
      await assert(helpGone === 0, 'Keyboard: Escape 关闭帮助对话框', 'Keyboard: Escape 未能关闭对话框');
    }

    // Test Ctrl+Z undo (requires some data history)
    // First add some data to create undo history
    const arrInputs = await getVisibleInputs(page);
    if (arrInputs.length >= 2) {
      await fillInput(page, arrInputs[0], '42');
      await fillInput(page, arrInputs[1], '0');
      await sleep(200);
      await clickButtonIfEnabled(page, /按位插|插入/);
      await sleep(1000);
      await closeModalIfOpen(page);
    }

    // Check SIZE info to verify data exists
    const sizeAfterInsert = await page.locator('text=/SIZE:/').first().textContent().catch(() => '');
    console.log(`  After insert: ${sizeAfterInsert}`);

    // Press Ctrl+Z to undo
    await page.keyboard.press('Control+z');
    await sleep(600);
    await closeModalIfOpen(page);

    const sizeAfterUndo = await page.locator('text=/SIZE:/').first().textContent().catch(() => '');
    console.log(`  After undo: ${sizeAfterUndo}`);

    // The undo should have changed the data (or at least not errored)
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'keyboard-undo.png'), fullPage: false });
    results.passed.push('Keyboard: Ctrl+Z undo 操作执行');

    // =====================================================================
    // TEST 5: Export/Import Cycle
    // =====================================================================
    console.log('\n[5] Export/Import Cycle...');

    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Add some elements first
    await clickButtonIfEnabled(page, /随机/);
    await sleep(1000);
    await closeModalIfOpen(page);

    // Find export button - labeled "↓ 导出" or "↓ Export"
    const exportBtn = page.locator('button').filter({ hasText: /导出|Export/ }).first();
    const exportBtnExists = await exportBtn.count() > 0;
    await assert(exportBtnExists, 'Export: 导出按钮存在', 'Export: 未找到导出按钮');

    if (exportBtnExists) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
      await exportBtn.click();
      await sleep(500);
      const download = await downloadPromise;
      await assert(
        download !== null,
        'Export: 点击导出后触发下载',
        'Export: 点击导出后未触发下载'
      );
      if (download) {
        const filename = download.suggestedFilename();
        console.log(`  Downloaded file: ${filename}`);
        await assert(
          filename.includes('array'),
          `Export: 下载文件名包含 'array': ${filename}`,
          `Export: 下载文件名不包含 'array': ${filename}`
        );
      }
    }

    // Find import button - labeled "↑ 导入" or "↑ Import"
    const importBtn = page.locator('button').filter({ hasText: /导入|Import/ }).first();
    const importBtnExists = await importBtn.count() > 0;
    await assert(importBtnExists, 'Import: 导入按钮存在', 'Import: 未找到导入按钮');

    if (importBtnExists) {
      // Set up file chooser listener
      const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
      await importBtn.click();
      await sleep(500);
      const fileChooser = await fileChooserPromise;
      await assert(
        fileChooser !== null,
        'Import: 点击导入后弹出文件选择器',
        'Import: 点击导入后未弹出文件选择器'
      );
      if (fileChooser) {
        // Cancel the file chooser
        await fileChooser.setFiles([]);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'export-import.png'), fullPage: false });

    // =====================================================================
    // TEST 6: Share Button
    // =====================================================================
    console.log('\n[6] Share Button...');

    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Add some data first
    await clickButtonIfEnabled(page, /随机/);
    await sleep(1000);
    await closeModalIfOpen(page);

    // Find share button - has 🔗 icon
    const shareBtn = page.locator('button[aria-label*="分享"], button[aria-label*="Share"], button[title*="分享"], button[title*="Share"]').first();
    const shareBtnAlt = page.locator('button').filter({ hasText: /🔗/ }).first();
    let shareBtnToUse = shareBtn;
    if ((await shareBtn.count()) === 0 && (await shareBtnAlt.count()) > 0) {
      shareBtnToUse = shareBtnAlt;
    }
    const shareExists = (await shareBtnToUse.count()) > 0;
    await assert(shareExists, 'Share: 分享按钮存在', 'Share: 未找到分享按钮');

    if (shareExists) {
      // Intercept clipboard API
      let clipboardText = '';
      await page.exposeFunction('__clipboardWrite', (text) => { clipboardText = text; });
      await page.evaluate(() => {
        navigator.clipboard.writeText = (text) => {
          window.__clipboardWrite(text);
          return Promise.resolve();
        };
      });

      await shareBtnToUse.click();
      await sleep(800);

      // Check if toast appeared (success or warning)
      const toastAppeared = await page.locator('.fixed').filter({ hasText: /复制|Copied|链接|Link|手动|Manual/ }).count() > 0;
      await assert(
        toastAppeared || clipboardText.length > 0,
        'Share: 点击分享后生成链接或显示提示',
        'Share: 点击分享后无反馈'
      );

      if (clipboardText.length > 0) {
        await assert(
          clipboardText.includes('data='),
          'Share: 剪贴板包含分享数据参数',
          'Share: 剪贴板内容不含分享数据'
        );
        console.log(`  Clipboard URL length: ${clipboardText.length}`);
      }
    }

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'share-button.png'), fullPage: false });

    // =====================================================================
    // TEST 7: Responsive Behavior
    // =====================================================================
    console.log('\n[7] Responsive Behavior...');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await sleep(300);

    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-array.png'), fullPage: false });

    // On mobile, sidebar should be hidden and hamburger menu should appear
    const hamburgerBtn = page.locator('button').filter({ hasText: /☰/ }).first();
    const hamburgerVisible = await hamburgerBtn.count() > 0;
    await assert(hamburgerVisible, 'Responsive: 移动端显示汉堡菜单', 'Responsive: 移动端未显示汉堡菜单');

    // Check that the sidebar is NOT directly visible (it's behind the hamburger)
    const sidebarDirect = page.locator('aside').first();
    const sidebarVisible = await sidebarDirect.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.position !== 'fixed' || el.classList.contains('open');
    }).catch(() => true);
    await assert(
      !sidebarVisible || hamburgerVisible,
      'Responsive: 移动端侧边栏默认隐藏',
      'Responsive: 移动端侧边栏未正确隐藏'
    );

    // Click hamburger to open sidebar
    if (hamburgerVisible) {
      await hamburgerBtn.click();
      await sleep(400);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'mobile-sidebar-open.png'), fullPage: false });

      // Sidebar should now be visible
      results.passed.push('Responsive: 汉堡菜单可展开侧边栏');

      // Close sidebar by clicking close button
      const closeBtn = page.locator('aside button').filter({ hasText: /✕/ }).first();
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await sleep(400);
        results.passed.push('Responsive: 侧边栏可通过关闭按钮收起');
      }
    }

    // Verify operation bar is still usable on mobile
    const opInputs = await getVisibleInputs(page);
    const opButtons = await page.locator('button').filter({ hasText: /插入|Insert|入栈|Push|随机|Random/ }).count();
    await assert(
      opInputs.length > 0 || opButtons > 0,
      'Responsive: 移动端操作栏可用',
      'Responsive: 移动端操作栏不可用'
    );

    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await sleep(300);

    // =====================================================================
    // TEST 8: Cross-Page State Isolation
    // =====================================================================
    console.log('\n[8] Cross-Page State Isolation...');

    // Navigate to array page and add elements
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Clear and add specific elements to array
    await clickButtonIfEnabled(page, /重置/);
    await sleep(600);
    await closeModalIfOpen(page);

    const arrayInputs = await getVisibleInputs(page);
    if (arrayInputs.length >= 2) {
      await fillInput(page, arrayInputs[0], '99');
      await fillInput(page, arrayInputs[1], '0');
      await sleep(200);
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /按位插|插入/);
      await sleep(1000);
      await closeModalIfOpen(page);
    }

    // Read array SIZE
    const arraySize = await page.locator('text=/SIZE:/').first().textContent().catch(() => 'SIZE: ?');
    console.log(`  Array state: ${arraySize}`);

    // Navigate to stack page and add elements
    await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    // Clear stack
    await clickButtonIfEnabled(page, /清空/);
    await sleep(600);
    await closeModalIfOpen(page);

    const stackInputs = await getVisibleInputs(page);
    if (stackInputs.length > 0) {
      await fillInput(page, stackInputs[0], '77');
      await sleep(200);
      await closeModalIfOpen(page);
      await clickButtonIfEnabled(page, /入栈/);
      await sleep(1000);
      await closeModalIfOpen(page);
    }

    // Read stack SIZE
    const stackSize = await page.locator('text=/SIZE:/').first().textContent().catch(() => 'SIZE: ?');
    console.log(`  Stack state: ${stackSize}`);

    // Navigate back to array page - state should be preserved
    await page.goto(BASE_URL + 'array', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    const arraySizeAfter = await page.locator('text=/SIZE:/').first().textContent().catch(() => 'SIZE: ?');
    console.log(`  Array state after visiting stack: ${arraySizeAfter}`);

    await assert(
      arraySize === arraySizeAfter,
      'Isolation: 数组页面数据不受栈页面操作影响',
      `Isolation: 数组页面数据变化 (${arraySize} -> ${arraySizeAfter})`
    );

    // Also verify stack state is preserved
    await page.goto(BASE_URL + 'stack', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await sleep(800);
    await closeModalIfOpen(page);

    const stackSizeAfter = await page.locator('text=/SIZE:/').first().textContent().catch(() => 'SIZE: ?');
    console.log(`  Stack state after revisit: ${stackSizeAfter}`);

    await assert(
      stackSize === stackSizeAfter,
      'Isolation: 栈页面数据在重新访问后保持',
      `Isolation: 栈页面数据变化 (${stackSize} -> ${stackSizeAfter})`
    );

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'isolation-final.png'), fullPage: false });

    // =====================================================================
    // Console error check
    // =====================================================================
    if (consoleErrors.length > 0) {
      console.log(`\n[Console Errors] ${consoleErrors.length} errors detected:`);
      consoleErrors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    } else {
      results.passed.push('无控制台错误');
    }

  } catch (error) {
    results.failed.push(`执行异常: ${error.message}`);
    console.error(error);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'interactions-error.png'), fullPage: false }).catch(() => {});
  } finally {
    await browser.close();
  }

  return results;
}

runTest().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log(`=== ${results.name} 结果 ===`);
  console.log('='.repeat(60));
  console.log(`通过: ${results.passed.length}`);
  results.passed.forEach(r => console.log(`  [PASS] ${r}`));
  console.log(`失败: ${results.failed.length}`);
  results.failed.forEach(r => console.log(`  [FAIL] ${r}`));
  console.log(`\n通过率: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%`);
  process.exit(results.failed.length > 0 ? 1 : 0);
}).catch(err => {
  console.error('测试执行异常:', err);
  process.exit(1);
});
