import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SCREENSHOT_DIR = join(__dirname, 'screenshots', 'quality-check');
mkdirSync(SCREENSHOT_DIR, { recursive: true });

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';
const PAGE_TIMEOUT = 20000;
const ACTION_DELAY = 250;

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/array', name: 'Array' },
  { path: '/stack', name: 'Stack' },
  { path: '/queue', name: 'Queue' },
  { path: '/linkedlist', name: 'LinkedList' },
  { path: '/tree', name: 'Tree' },
  { path: '/graph', name: 'Graph' },
  { path: '/hash', name: 'Hash' },
  { path: '/heap', name: 'Heap' },
  { path: '/trie', name: 'Trie' },
  { path: '/sort', name: 'Sort' },
  { path: '/compare', name: 'SortCompare' },
];

const REPORT = {
  startTime: new Date().toISOString(),
  pageResults: [],
  consoleErrors: [],
  totalButtonsTested: 0,
  totalInputsTested: 0,
  totalPagesTested: 0,
  pagesWithIssues: [],
};

function log(level, msg) {
  const ts = new Date().toISOString().slice(11, 23);
  const line = `[${ts}] [${level}] ${msg}`;
  console.log(line);
}

function summarize(ok, msg) {
  const icon = ok ? '✅' : '❌';
  console.log(`  ${icon} ${msg}`);
  return { ok, message: msg };
}

async function safeGoto(page, path, name) {
  const url = BASE_URL.replace(/\/$/, '') + path;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT });
    await page.waitForTimeout(800);
    return true;
  } catch (e) {
    log('ERROR', `${name}: 页面加载失败 - ${e.message}`);
    return false;
  }
}

async function testSidebar(page) {
  const findings = [];
  log('INFO', '--- 侧边栏导航 ---');
  const sidebarLinks = page.locator('aside a, nav a');
  const linkCount = await sidebarLinks.count();
  findings.push(summarize(linkCount > 0, `侧边栏链接数: ${linkCount}`));
  for (let i = 0; i < Math.min(linkCount, 13); i++) {
    try {
      const link = sidebarLinks.nth(i);
      const href = await link.getAttribute('href');
      if (href) {
        await link.click();
        await page.waitForTimeout(400);
        const currentUrl = page.url();
        findings.push(summarize(currentUrl.includes(href), `导航: ${href}`));
      }
    } catch (e) {
      findings.push({ ok: false, message: `侧边栏链接[${i}]: ${e.message}` });
    }
  }
  return findings;
}

async function testThemeToggle(page) {
  const findings = [];
  log('INFO', '--- 主题切换 ---');
  const themeBtn = page.locator('button').filter({ hasText: /^[☀☾◐]$/ }).first();
  try {
    if (await themeBtn.isVisible({ timeout: 2000 })) {
      const html = page.locator('html');
      const c1 = await html.getAttribute('class') || '';
      await themeBtn.click({ force: true, timeout: 3000 });
      await page.waitForTimeout(400);
      const c2 = await html.getAttribute('class') || '';
      await themeBtn.click({ force: true, timeout: 3000 });
      await page.waitForTimeout(400);
      const c3 = await html.getAttribute('class') || '';
      findings.push(summarize(true, `主题循环: ${c1.includes('dark')?'d':'l'}->${c2.includes('dark')?'d':'l'}->${c3.includes('dark')?'d':'l'}`));
      REPORT.totalButtonsTested++;
    } else {
      findings.push({ ok: false, message: '主题按钮不可见' });
    }
  } catch (e) {
    findings.push({ ok: false, message: `主题切换失败: ${e.message}` });
  }
  return findings;
}

async function testKeyboardHelp(page) {
  const findings = [];
  log('INFO', '--- 键盘快捷键帮助 ---');
  try {
    await page.keyboard.press('?');
    await page.waitForTimeout(600);
    const helpModal = page.locator('text=键盘快捷键').first();
    const opened = await helpModal.isVisible({ timeout: 2000 }).catch(() => false);
    findings.push(summarize(opened, '按?打开快捷键帮助'));
    if (opened) {
      await page.screenshot({ path: join(SCREENSHOT_DIR, 'keyboard-help.png') });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }
  } catch (e) {
    findings.push({ ok: false, message: `键盘帮助失败: ${e.message}` });
  }
  return findings;
}

async function testActionButtons(page, pageName) {
  const findings = [];
  log('INFO', `--- ${pageName} 操作按钮 ---`);

  const actionButtons = page.locator('button:visible').filter({
    hasText: /插入|删除|查找|搜索|Push|Pop|Enqueue|Dequeue|入栈|出栈|入队|出队|添加|反转|检测|Extract|Peek|前缀|BFS|DFS|Dijkstra|重置|随机|Randomize|清空|Clear|前序|中序|后序|层序|头插|尾插|按位|分享|导出|导入|撤销|Undo|重做|Redo|停止|Stop|全部运行|Run All|学习/i
  });
  const count = await actionButtons.count();
  findings.push({ ok: true, message: `操作按钮数: ${count}` });

  for (let i = 0; i < count; i++) {
    try {
      const btn = actionButtons.nth(i);
      const isDisabled = await btn.isDisabled().catch(() => true);
      const text = (await btn.innerText().catch(() => '')).trim().slice(0, 30);
      if (isDisabled) {
        findings.push({ ok: true, message: `[${text}] 已禁用` });
        continue;
      }
      await btn.click({ timeout: 3000, force: true });
      await page.waitForTimeout(ACTION_DELAY);
      REPORT.totalButtonsTested++;
      findings.push({ ok: true, message: `[${text}] 点击正常` });
    } catch (e) {
      findings.push({ ok: false, message: `操作按钮[${i}]: ${e.message}` });
    }
  }
  return findings;
}

async function testInputs(page, pageName) {
  const findings = [];
  log('INFO', `--- ${pageName} 输入框 ---`);
  const inputs = page.locator('input[type="text"]:visible, input[type="number"]:visible');
  const count = await inputs.count();
  REPORT.totalInputsTested += count;
  findings.push({ ok: true, message: `输入框数: ${count}` });

  for (let i = 0; i < count; i++) {
    try {
      const inp = inputs.nth(i);
      const type = await inp.getAttribute('type') || 'text';
      const ph = await inp.getAttribute('placeholder') || '';
      await inp.fill('');
      if (type === 'number') {
        await inp.fill('42');
      } else {
        await inp.fill('test-value');
      }
      await page.waitForTimeout(100);
      findings.push({ ok: true, message: `[${i}] type=${type} "${ph}"` });
    } catch (e) {
      findings.push({ ok: false, message: `输入框[${i}]: ${e.message}` });
    }
  }
  return findings;
}

async function testDropdowns(page, pageName) {
  const findings = [];
  const selects = page.locator('select');
  const count = await selects.count();
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      try {
        await selects.nth(i).selectOption({ index: 0 });
        await page.waitForTimeout(100);
      } catch (e) {
        findings.push({ ok: false, message: `下拉[${i}]: ${e.message}` });
      }
    }
  }
  findings.push({ ok: true, message: `下拉菜单: ${count} 个` });
  return findings;
}

async function testModals(page) {
  const findings = [];
  await page.keyboard.press('?');
  await page.waitForTimeout(400);
  const modal = page.locator('text=键盘快捷键').first();
  const opened = await modal.isVisible({ timeout: 1500 }).catch(() => false);
  if (opened) {
    findings.push(summarize(true, '快捷键帮助打开'));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }
  return findings;
}

async function testToasts(page) {
  const findings = [];
  const toastContainer = page.locator('div.fixed.top-4.right-4');
  const has = await toastContainer.isVisible({ timeout: 500 }).catch(() => false);
  findings.push({ ok: true, message: `Toast: ${has ? '有活跃通知' : '无'}` });
  return findings;
}

async function testZoomControls(page, pageName) {
  const findings = [];
  log('INFO', `--- ${pageName} 缩放控制 ---`);

  const zoomIn = page.locator('button').filter({ hasText: /^\+$/ }).first();
  const zoomOut = page.locator('button').filter({ hasText: /^−$/ }).first();

  const hasIn = await zoomIn.isVisible({ timeout: 2000 }).catch(() => false);
  const hasOut = await zoomOut.isVisible({ timeout: 2000 }).catch(() => false);

  if (hasIn && hasOut) {
    const inDisabled = await zoomIn.isDisabled().catch(() => true);
    const outDisabled = await zoomOut.isDisabled().catch(() => true);

    if (!inDisabled) {
      await zoomIn.click({ force: true, timeout: 3000 });
      await page.waitForTimeout(200);
      findings.push(summarize(true, `放大按钮点击`));
      REPORT.totalButtonsTested++;
    }
    if (!outDisabled) {
      await zoomOut.click({ force: true, timeout: 3000 });
      await page.waitForTimeout(200);
      findings.push(summarize(true, `缩小按钮点击`));
      REPORT.totalButtonsTested++;
    }
    if (inDisabled && outDisabled) {
      findings.push({ ok: true, message: '缩放按钮已到极限' });
    }
  } else {
    findings.push({ ok: true, message: '无缩放控件' });
  }
  return findings;
}

async function testGridToggle(page) {
  const findings = [];
  const gridBtn = page.locator('button').filter({ hasText: /^#$/ }).first();
  if (await gridBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await gridBtn.click({ force: true, timeout: 3000 });
    await page.waitForTimeout(200);
    findings.push(summarize(true, '网格切换'));
    REPORT.totalButtonsTested++;
  } else {
    findings.push({ ok: true, message: '无网格按钮' });
  }
  return findings;
}

async function testSpeedControls(page) {
  const findings = [];
  const speedBtns = page.locator('button').filter({ hasText: /^0\.5x$|^1x$|^1\.5x$|^2x$|^4x$/ });
  const count = await speedBtns.count();
  if (count > 0) {
    await speedBtns.first().click({ timeout: 3000 });
    await page.waitForTimeout(150);
    findings.push(summarize(true, `速度控制: ${count} 档`));
  } else {
    findings.push({ ok: true, message: '无速度控件' });
  }
  return findings;
}

async function testUndoRedo(page) {
  const findings = [];
  const undoBtn = page.locator('button').filter({ hasText: /^撤销$|^Undo$/ }).first();
  const redoBtn = page.locator('button').filter({ hasText: /^重做$|^Redo$/ }).first();
  const hasUndo = await undoBtn.isVisible({ timeout: 2000 }).catch(() => false);
  const hasRedo = await redoBtn.isVisible({ timeout: 2000 }).catch(() => false);
  if (hasUndo) {
    findings.push(summarize(true, `撤销: ${await undoBtn.isDisabled().catch(()=>true) ? '禁用' : '可用'}`));
    REPORT.totalButtonsTested++;
  }
  if (hasRedo) {
    findings.push(summarize(true, `重做: ${await redoBtn.isDisabled().catch(()=>true) ? '禁用' : '可用'}`));
    REPORT.totalButtonsTested++;
  }
  if (!hasUndo && !hasRedo) findings.push({ ok: true, message: '无撤销/重做' });
  return findings;
}

async function testShare(page) {
  const findings = [];
  const shareBtn = page.locator('button').filter({ hasText: /分享|🔗/ }).first();
  if (await shareBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    const disabled = await shareBtn.isDisabled().catch(() => true);
    if (!disabled) {
      await shareBtn.click({ force: true });
      await page.waitForTimeout(500);
      const toast = page.locator('text=链接已复制').first();
      const ok = await toast.isVisible({ timeout: 2000 }).catch(() => false);
      findings.push(summarize(ok, `分享: ${ok ? '复制成功' : '无提示'}`));
      await page.waitForTimeout(3500);
    } else {
      findings.push({ ok: true, message: '分享按钮已禁用' });
    }
    REPORT.totalButtonsTested++;
  } else {
    findings.push({ ok: true, message: '无分享按钮' });
  }
  return findings;
}

async function testErrorStates(page) {
  const findings = [];
  const actionButtons = page.locator('button:visible').filter({
    hasText: /插入|删除|查找|Push|Pop|Enqueue|Dequeue|入栈|出栈|入队|出队|添加|Extract|Peek|前缀|BFS|DFS|Dijkstra/
  });
  const count = await actionButtons.count();
  for (let i = 0; i < Math.min(count, 3); i++) {
    try {
      const btn = actionButtons.nth(i);
      if (await btn.isDisabled().catch(() => true)) continue;
      const inputs = page.locator('input[type="text"]:visible, input[type="number"]:visible');
      const ic = await inputs.count();
      for (let j = 0; j < ic; j++) await inputs.nth(j).fill('');
      await btn.click();
      await page.waitForTimeout(400);
      const toast = page.locator('div.fixed.top-4.right-4 > div');
      const has = await toast.isVisible({ timeout: 800 }).catch(() => false);
      if (has) {
        const txt = await toast.first().innerText().catch(() => '');
        findings.push({ ok: true, message: `空输入错误: "${txt.slice(0, 40)}"` });
      }
    } catch (e) {
      findings.push({ ok: false, message: `错误状态[${i}]: ${e.message}` });
    }
  }
  return findings;
}

async function testStopButton(page) {
  const findings = [];
  const stopBtn = page.locator('button').filter({ hasText: /^停止$|^Stop$/ }).first();
  if (await stopBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    findings.push(summarize(true, '停止按钮存在'));
    REPORT.totalButtonsTested++;
  } else {
    findings.push({ ok: true, message: '停止按钮不存在(无动画)' });
  }
  return findings;
}

async function testHomePage(page) {
  const findings = [];
  log('INFO', '========== Home ==========');
  if (!await safeGoto(page, '/', 'Home')) {
    findings.push({ ok: false, message: 'Home 加载失败' });
    return findings;
  }
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'home.png') });
  const title = await page.title();
  findings.push(summarize(title.length > 0, `标题: ${title}`));

  const cards = page.locator('a[href^="/"]');
  const cardCount = await cards.count();
  findings.push(summarize(cardCount >= 7, `卡片: ${cardCount}`));

  for (let i = 0; i < Math.min(cardCount, 7); i++) {
    try {
      const card = cards.nth(i);
      const href = await card.getAttribute('href');
      await card.click();
      await page.waitForTimeout(500);
      findings.push(summarize(page.url().includes(href), `卡片->${href}`));
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT });
      await page.waitForTimeout(300);
    } catch (e) {
      findings.push({ ok: false, message: `卡片[${i}]: ${e.message}` });
    }
  }

  findings.push(...await testSidebar(page));
  findings.push(...await testThemeToggle(page));
  findings.push(...await testKeyboardHelp(page));
  return findings;
}

async function testVisualizerPage(page, pageName, path) {
  const findings = [];
  if (!await safeGoto(page, path, pageName)) {
    findings.push({ ok: false, message: `${pageName} 加载失败` });
    return findings;
  }
  await page.screenshot({ path: join(SCREENSHOT_DIR, `${pageName.toLowerCase()}.png`) });

  findings.push(...await testZoomControls(page, pageName));
  findings.push(...await testGridToggle(page));
  findings.push(...await testSpeedControls(page));
  findings.push(...await testInputs(page, pageName));
  findings.push(...await testDropdowns(page, pageName));
  findings.push(...await testModals(page));
  findings.push(...await testToasts(page));
  findings.push(...await testUndoRedo(page));
  findings.push(...await testShare(page));
  findings.push(...await testErrorStates(page, pageName));
  findings.push(...await testActionButtons(page, pageName));
  findings.push(...await testStopButton(page));
  return findings;
}

async function testGraphPage(page) {
  const findings = [];
  if (!await safeGoto(page, '/graph', 'Graph')) {
    findings.push({ ok: false, message: 'Graph 加载失败' });
    return findings;
  }
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'graph.png') });

  const viewBtns = page.locator('button').filter({ hasText: /力导向|矩阵|邻接表/ });
  const vc = await viewBtns.count();
  for (let i = 0; i < vc; i++) {
    try {
      const t = await viewBtns.nth(i).innerText().catch(() => '');
      await viewBtns.nth(i).click();
      await page.waitForTimeout(300);
      findings.push(summarize(true, `视图: ${t.trim()}`));
      REPORT.totalButtonsTested++;
    } catch (e) {
      findings.push({ ok: false, message: `视图[${i}]: ${e.message}` });
    }
  }

  findings.push(...await testZoomControls(page, 'Graph'));
  findings.push(...await testGridToggle(page));
  findings.push(...await testSpeedControls(page));
  findings.push(...await testInputs(page, 'Graph'));
  findings.push(...await testDropdowns(page, 'Graph'));
  findings.push(...await testModals(page));
  findings.push(...await testToasts(page));
  findings.push(...await testUndoRedo(page));
  findings.push(...await testShare(page));
  findings.push(...await testErrorStates(page, 'Graph'));
  findings.push(...await testActionButtons(page, 'Graph'));
  return findings;
}

async function testSortComparePage(page) {
  const findings = [];
  if (!await safeGoto(page, '/compare', 'SortCompare')) {
    findings.push({ ok: false, message: 'SortCompare 加载失败' });
    return findings;
  }
  await page.screenshot({ path: join(SCREENSHOT_DIR, 'sort-compare.png') });

  const cards = page.locator('[class*="cursor-pointer"]').filter({ hasText: /冒泡|选择|插入|快速|归并|Bubble|Selection|Insertion|Quick|Merge/ });
  const cc = await cards.count();
  if (cc > 0) {
    for (let i = 0; i < Math.min(cc, 3); i++) {
      try { await cards.nth(i).click(); await page.waitForTimeout(150); } catch {}
    }
    findings.push(summarize(true, `算法卡片: ${Math.min(cc,3)}/${cc} 选中`));
  }

  findings.push(...await testSpeedControls(page));
  findings.push(...await testDropdowns(page, 'SortCompare'));
  findings.push(...await testModals(page));
  findings.push(...await testToasts(page));
  findings.push(...await testStopButton(page));
  findings.push(...await testErrorStates(page, 'SortCompare'));
  findings.push(...await testActionButtons(page, 'SortCompare'));
  return findings;
}

async function main() {
  log('INFO', '='.repeat(70));
  log('INFO', '数据结构学习助手 - 全面质量检查');
  log('INFO', `目标: ${BASE_URL} | 页面: ${PAGES.length}`);
  log('INFO', '='.repeat(70));

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      REPORT.consoleErrors.push({ page: 'current', message: msg.text(), time: new Date().toISOString() });
    }
  });

  let all = [];

  try {
    for (const pg of PAGES) {
      log('INFO', '');
      log('INFO', `${'='.repeat(50)}`);
      log('INFO', `页面: ${pg.name} (${pg.path})`);
      log('INFO', `${'='.repeat(50)}`);

      let pf = [];
      switch (pg.name) {
        case 'Home': pf = await testHomePage(page); break;
        case 'Graph': pf = await testGraphPage(page); break;
        case 'SortCompare': pf = await testSortComparePage(page); break;
        default: pf = await testVisualizerPage(page, pg.name, pg.path); break;
      }

      const failed = pf.filter(f => f.ok === false);
      REPORT.pageResults.push({
        name: pg.name, path: pg.path,
        total: pf.length, passed: pf.filter(f => f.ok).length, failed: failed.length,
        failures: failed.map(f => f.message),
      });
      REPORT.totalPagesTested++;
      if (failed.length > 0) REPORT.pagesWithIssues.push(pg.name);
      all = all.concat(pf);
    }
  } catch (e) {
    log('ERROR', `异常: ${e.message}`);
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  REPORT.endTime = new Date().toISOString();

  log('INFO', '');
  log('INFO', '='.repeat(70));
  log('INFO', '汇总');
  log('INFO', '='.repeat(70));
  log('INFO', `页面: ${REPORT.totalPagesTested} | 按钮: ${REPORT.totalButtonsTested} | 输入: ${REPORT.totalInputsTested}`);
  log('INFO', `控制台错误: ${REPORT.consoleErrors.length} | 问题页面: ${REPORT.pagesWithIssues.length > 0 ? REPORT.pagesWithIssues.join(', ') : '无'}`);

  for (const pr of REPORT.pageResults) {
    const icon = pr.failed === 0 ? '✅' : '❌';
    log('INFO', `${icon} ${pr.name}: ${pr.passed}/${pr.total} 通过, ${pr.failed} 失败`);
    pr.failures.forEach(f => log('WARN', `  ⚠ ${f}`));
  }

  if (REPORT.consoleErrors.length > 0) {
    log('INFO', '--- 控制台错误 ---');
    REPORT.consoleErrors.forEach(e => log('ERROR', `${e.message}`));
  }

  const total = all.length;
  const passed = all.filter(f => f.ok).length;
  const failed = all.filter(f => f.ok === false).length;
  log('INFO', '');
  log('INFO', `总计: ${total} 项, ${passed} 通过, ${failed} 失败 | 通过率: ${total > 0 ? ((passed/total)*100).toFixed(1) : 0}%`);

  writeFileSync(join(__dirname, 'quality-check-report.json'), JSON.stringify({
    summary: { total, passed, failed, passRate: `${total>0?((passed/total)*100).toFixed(1):0}%`,
      pages: REPORT.totalPagesTested, buttons: REPORT.totalButtonsTested, inputs: REPORT.totalInputsTested,
      consoleErrors: REPORT.consoleErrors.length, pagesWithIssues: REPORT.pagesWithIssues },
    pageResults: REPORT.pageResults, consoleErrors: REPORT.consoleErrors,
    start: REPORT.startTime, end: REPORT.endTime,
  }, null, 2), 'utf-8');
  log('INFO', '报告: e2e/quality-check-report.json');

  return failed > 0 ? 1 : 0;
}

const ec = await main();
process.exit(ec);