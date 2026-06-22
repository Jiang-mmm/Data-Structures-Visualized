#!/usr/bin/env node
/**
 * E2E 测试编排器 - Playwright Test 包装脚本
 *
 * 取代旧版 e2e/run-all-tests.js。功能：
 * 1. 启动 dev server（如未运行）
 * 2. 根据 BROWSER 环境变量选择 chromium / firefox
 * 3. 调用 `playwright test` 跑所有 e2e/*.spec.ts
 */
import { spawn } from 'node:child_process'
import { setTimeout as sleep } from 'node:timers/promises'
import process from 'node:process'

const BASE_URL = 'http://localhost:3000/Data-Structures-Visualized/'
const SPEC_DIR = 'e2e'

const browser = process.env.BROWSER || 'chromium'

console.log('========================================')
console.log(' E2E 测试编排器 (Playwright Test)')
console.log('========================================')
console.log(`浏览器: ${browser}`)
console.log(`基础URL: ${BASE_URL}`)
console.log('')

// 1. 检查 dev server 是否已经在运行
async function isServerUp() {
  try {
    const res = await fetch(BASE_URL)
    return res.ok
  } catch {
    return false
  }
}

const serverRunning = await isServerUp()
if (!serverRunning) {
  console.log('⚠️  Dev server 未运行。请在另一个终端执行: npm run dev')
  console.log('   此脚本不会自动启动 dev server。')
  process.exit(1)
}
console.log('✅ Dev server 已在运行')

// 2. 构建 playwright test 命令
const projectFlag = browser === 'firefox' ? '--project=firefox' : '--project=chromium'
const args = [
  'playwright',
  'test',
  SPEC_DIR,
  projectFlag,
  '--reporter=line',
]

console.log(`▶️  执行: npx ${args.join(' ')}\n`)

const child = spawn('npx', args, {
  stdio: 'inherit',
  shell: true,
})

child.on('exit', async (code) => {
  // 等待一下再 exit，避免一些输出被截断
  await sleep(100)
  if (code === 0) {
    console.log('\n✅ E2E 测试全部通过')
  } else {
    console.log(`\n❌ E2E 测试失败 (exit code: ${code})`)
  }
  process.exit(code ?? 1)
})
