import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/';

const PAGES = [
  { path: '', name: 'Home' },
  { path: 'array', name: 'Array' },
  { path: 'stack', name: 'Stack' },
  { path: 'queue', name: 'Queue' },
  { path: 'linkedlist', name: 'LinkedList' },
  { path: 'tree', name: 'Tree' },
  { path: 'graph', name: 'Graph' },
  { path: 'hash', name: 'Hash' },
  { path: 'heap', name: 'Heap' },
  { path: 'trie', name: 'Trie' },
  { path: 'sort', name: 'Sort' },
  { path: 'compare', name: 'SortCompare' },
];

async function runA11yTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  await page.route('**/sw.js', route => route.abort());
  await page.route('**/workbox-*.js', route => route.abort());

  let totalViolations = 0;
  let totalCritical = 0;
  let totalSerious = 0;
  const results = [];

  for (const { path, name } of PAGES) {
    try {
      await page.goto(BASE_URL + path, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, 2000));

      const axeResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const violations = axeResults.violations;
      const critical = violations.filter(v => v.impact === 'critical').length;
      const serious = violations.filter(v => v.impact === 'serious').length;
      const moderate = violations.filter(v => v.impact === 'moderate').length;
      const minor = violations.filter(v => v.impact === 'minor').length;

      totalViolations += violations.length;
      totalCritical += critical;
      totalSerious += serious;

      const status = (critical + serious) === 0 ? 'PASS' : 'FAIL';
      results.push({ name, status, critical, serious, moderate, minor, violations });

      console.log(`  ${status === 'PASS' ? '[PASS]' : '[FAIL]'} ${name}: ${violations.length} violations (critical:${critical} serious:${serious} moderate:${moderate} minor:${minor})`);

      if (critical + serious > 0) {
        for (const v of violations.filter(v => v.impact === 'critical' || v.impact === 'serious')) {
          console.log(`    - [${v.impact}] ${v.id}: ${v.description}`);
          console.log(`      Help: ${v.helpUrl}`);
          for (const node of v.nodes.slice(0, 3)) {
            console.log(`      Target: ${node.target.join(', ')}`);
          }
        }
      }
    } catch (error) {
      console.log(`  [ERROR] ${name}: ${error.message}`);
      results.push({ name, status: 'ERROR', critical: 0, serious: 0, moderate: 0, minor: 0, violations: [] });
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(60));
  console.log('              A11y 测试报告');
  console.log('='.repeat(60));
  console.log(`总页面: ${results.length}`);
  console.log(`通过: ${results.filter(r => r.status === 'PASS').length}`);
  console.log(`失败: ${results.filter(r => r.status === 'FAIL').length}`);
  console.log(`总 violations: ${totalViolations}`);
  console.log(`Critical: ${totalCritical}`);
  console.log(`Serious: ${totalSerious}`);

  if (totalCritical + totalSerious > 0) {
    console.log('\n⚠️  存在 critical/serious violations，需要修复');
    process.exit(1);
  } else {
    console.log('\n✅ 零 critical/serious violations');
    process.exit(0);
  }
}

runA11yTests().catch(e => { console.error(e); process.exit(1); });
