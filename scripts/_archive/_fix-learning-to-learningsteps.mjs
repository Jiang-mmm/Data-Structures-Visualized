#!/usr/bin/env node
/**
 * v20 M7-5.6 修复脚本：全局替换 config 中的 tStatic('learning.X') → tStatic('learningSteps.X')
 *
 * 根因：M7-5 迁移时 key 路径少了 learningSteps 段（locale 实际位置）。
 * 修复：精确替换所有 `tStatic('learning.` 字符串字面量为 `tStatic('learningSteps.`。
 *
 * ⚠️ 范围限定：仅修改 src/configs/learning/ 下的 40 个 config.ts 文件
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs'
import { join } from 'path'

const CONFIGS_DIR = 'src/configs/learning'

function walkConfigs(dir) {
  const results = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...walkConfigs(full))
    } else if (name.endsWith('.config.ts') || name.endsWith('.config.tsx')) {
      results.push(full)
    }
  }
  return results
}

const files = walkConfigs(CONFIGS_DIR)
let totalReplaced = 0
let filesTouched = 0

for (const file of files) {
  const before = readFileSync(file, 'utf8')
  // 精确替换：tStatic('learning. → tStatic('learningSteps.
  // 同时处理 tStatic("learning. → tStatic("learningSteps.
  const after = before
    .replace(/tStatic\('learning\./g, "tStatic('learningSteps.")
    .replace(/tStatic\("learning\./g, 'tStatic("learningSteps.')

  if (before !== after) {
    const matches = (before.match(/tStatic\(['"]learning\./g) || []).length
    writeFileSync(file, after, 'utf8')
    totalReplaced += matches
    filesTouched += 1
    console.log(`  ✓ ${file}: ${matches} 处替换`)
  }
}

console.log(`\n总计：${filesTouched} 个文件，${totalReplaced} 处替换`)
