#!/usr/bin/env node
/**
 * v20 M7-7 en 翻译质量检查脚本（改进版）
 *
 * 扫描 src/i18n/locales/en/learning/ 下 40 个文件，统计：
 * - 总字符串数（仅 value 字符串，不含 key）
 * - 短字符串 (< 3 字符)
 * - 与中文相同的字符串（可能是未翻译）
 * - 长度差异过大的字符串（en / zh 长度比 < 0.3 或 > 3.0）
 */
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

const EN_DIR = 'src/i18n/locales/en/learning'
const ZH_DIR = 'src/i18n/locales/zh/learning'

/**
 * 提取 value 字符串：形如 `key: '...'` 或 `key: "..."` 的右侧部分
 * 避免匹到 key 名、字段名、标点
 */
function extractValues(content) {
  const results = []
  // 匹配 `: '...'` `: "..."` `: \`...\`` 形式（值在冒号右侧）
  const re = /:\s*['"`]([^'"`\n]{2,})['"`]/g
  let m
  while ((m = re.exec(content)) !== null) {
    results.push(m[1])
  }
  return results
}

const enFiles = readdirSync(EN_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts')

let totalStrings = 0
let shortStrings = 0
let identicalCount = 0
let lengthOutlierCount = 0
const identicalExamples = []
const lengthOutlierExamples = []

for (const file of enFiles) {
  const enContent = readFileSync(join(EN_DIR, file), 'utf8')
  const zhContent = readFileSync(join(ZH_DIR, file), 'utf8')
  const enStrings = extractValues(enContent)
  const zhStrings = extractValues(zhContent)

  for (let i = 0; i < enStrings.length; i++) {
    if (zhStrings[i]) {
      totalStrings += 1
      if (enStrings[i].length < 3) shortStrings += 1
      if (enStrings[i] === zhStrings[i]) {
        identicalCount += 1
        if (identicalExamples.length < 20) {
          identicalExamples.push(`${file} [#${i}]: ${enStrings[i].slice(0, 100)}`)
        }
      } else {
        // 长度差异过大（en 远短或远长于 zh）
        const zhLen = zhStrings[i].length
        const enLen = enStrings[i].length
        if (zhLen > 0) {
          const ratio = enLen / zhLen
          if (ratio < 0.3 || ratio > 3.0) {
            lengthOutlierCount += 1
            if (lengthOutlierExamples.length < 15) {
              lengthOutlierExamples.push(
                `${file} [#${i}] (ratio=${ratio.toFixed(2)}): zh="${zhStrings[i].slice(0, 40)}" → en="${enStrings[i].slice(0, 40)}"`,
              )
            }
          }
        }
      }
    }
  }
}

console.log('=== M7-7 en 翻译质量统计（改进版）===')
console.log(`扫描文件数: ${enFiles.length}`)
console.log(`总 value 字符串数: ${totalStrings}`)
console.log(`短字符串 (< 3 字符): ${shortStrings}`)
console.log(`zh/en 完全相同 (可能未翻译): ${identicalCount}`)
console.log(`长度异常 (en/zh 比例 < 0.3 或 > 3.0): ${lengthOutlierCount}`)
if (identicalExamples.length > 0) {
  console.log('\n=== 未翻译示例 ===')
  identicalExamples.forEach((e) => console.log('  -', e))
}
if (lengthOutlierExamples.length > 0) {
  console.log('\n=== 长度异常示例 ===')
  lengthOutlierExamples.forEach((e) => console.log('  -', e))
}
