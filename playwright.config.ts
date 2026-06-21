/**
 * Playwright Test 配置文件
 *
 * 此配置用于从自定义 runner 迁移到 Playwright Test 框架。
 * 迁移完成后，将取代 e2e/run-all-tests.js。
 *
 * 使用方式:
 *   npx playwright test          # 运行所有测试
 *   npx playwright test --ui     # UI 模式（含测试探索器）
 *   npx playwright test --reporter=html  # HTML 报告
 *
 * 注意: 此文件为迁移起点，当前项目仍使用自定义 runner。
 * 迁移批准后，将逐步迁移 e2e/*.js 测试文件到 *.spec.ts 格式。
 */
import { defineConfig, devices } from 'playwright/test'

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/'

export default defineConfig({
  // 测试目录
  testDir: './e2e',

  // 测试文件匹配模式（迁移后使用 .spec.ts）
  testMatch: '*.spec.ts',

  // 并行执行
  fullyParallel: true,

  // 失败后不自动重试（CI 环境覆盖）
  retries: process.env.CI ? 2 : 0,

  // 并发 worker 数
  workers: process.env.CI ? 2 : undefined,

  // 报告器
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // 全局配置
  use: {
    // 基础 URL
    baseURL: BASE_URL,

    // 视口
    viewport: { width: 1280, height: 720 },

    // 等待策略
    navigationTimeout: 10000,
    actionTimeout: 5000,

    // 截图：仅在失败时
    screenshot: 'only-on-failure',

    // 视频：仅在失败时保留
    video: 'retain-on-failure',

    // 跟踪：首次重试时记录
    trace: 'on-first-retry',
  },

  // 浏览器配置
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // 本地开发服务器（自动启动）
  webServer: {
    command: 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
})
