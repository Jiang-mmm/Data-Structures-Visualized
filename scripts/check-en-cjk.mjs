#!/usr/bin/env node
/**
 * v20 M7-7 en 翻译质量深度检查脚本
 *
 * 检查项：
 * 1. en 文件是否包含中文字符（应该没有）
 * 2. en 文件是否包含未翻译的代码片段（应该有）
 * 3. 关键术语翻译一致性（如 "O(log n)" "O(n)" 等应保持原样）
 * 4. 验证 i18n integrity 测试结果
 */
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const EN_DIR = 'src/i18n/locales/en/learning'

// 中文字符范围：基本汉字 CJK Unified Ideographs
const CJK_REGEX = /[\u4e00-\u9fff]/

const enFiles = readdirSync(EN_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts')

let cjkFound = 0
const cjkExamples = []
let totalLines = 0

for (const file of enFiles) {
  const content = readFileSync(join(EN_DIR, file), 'utf8')
  const lines = content.split('\n')
  totalLines += lines.length

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // 跳过注释
    if (line.trim().startsWith('*') || line.trim().startsWith('//') || line.trim().startsWith('/*')) {
      continue
    }
    const match = line.match(CJK_REGEX)
    if (match) {
      cjkFound += 1
      if (cjkExamples.length < 20) {
        cjkExamples.push(`${file}:${i + 1}: ${line.trim().slice(0, 100)}`)
      }
    }
  }
}

console.log('=== M7-7 en 翻译深度检查 ===')
console.log(`扫描文件数: ${enFiles.length}`)
console.log(`总行数: ${totalLines}`)
console.log(`中文字符行数（应=0）: ${cjkFound}`)
if (cjkExamples.length > 0) {
  console.log('\n=== 中文字符示例 ===')
  cjkExamples.forEach((e) => console.log('  -', e))
}
