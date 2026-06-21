import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

/**
 * a11y 测试现在委托给 Playwright Test 的 e2e/a11y.spec.ts。
 * 页面列表从 src/components/Sidebar.tsx 的 STRUCTURE_KEYS 动态生成，
 * 覆盖全部 17 条路由（含首页）。
 */
console.log('[a11y] 启动 Playwright Test: e2e/a11y.spec.ts');

try {
  // CI 中只跑 chromium 项目，避免重复安装 firefox；本地可通过 npx playwright test 跑全量。
  const projectFlag = process.env.CI ? '--project=chromium' : '';
  execSync(`npx playwright test a11y.spec.ts --reporter=list ${projectFlag}`, {
    stdio: 'inherit',
    cwd: rootDir,
  });
  console.log('[a11y] 全部通过');
} catch {
  console.error('[a11y] 存在 critical/serious violations 或测试执行失败');
  process.exit(1);
}
