// v20 M7-5 — 40 config 文件迁移脚本（4 字段 → tStatic 调用）
//
// 用法:
//   node scripts/migrate-configs-to-i18n.mjs --dry-run   # 仅输出计划，不改文件
//   node scripts/migrate-configs-to-i18n.mjs             # 实际执行迁移
//
// 迁移范围（src/configs/learning/*.config.ts 中每个 step 对象内）：
//   title: 'xxx'           → title: tStatic('learning.{key}.steps.{stepId}.title')
//   description: 'xxx'     → description: tStatic('learning.{key}.steps.{stepId}.description')
//   highlightTerms: [...]  → highlightTerms: tStatic('learning.{key}.steps.{stepId}.highlightTerms').split('|')
//   tips: [...]            → tips: tStatic('learning.{key}.steps.{stepId}.tips').split('|')
//   complexity: {time, space} → complexity: { time: tStatic('...complexityTime'), space: tStatic('...complexitySpace') }
//
// 保留字段（不迁移）：
//   id, codeSnippet（中文代码注释保留）, highlightedLine, quiz（M7 范围外）
//
// 策略：用单字符 state machine 定位每个 step 对象的精确范围（基于 id 字段锚定）
// 然后在该范围内做 5 个字段的就地字符串替换。不依赖正则，避免误改 codeSnippet。

import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const CONFIG_DIR = join(PROJECT_ROOT, 'src/configs/learning')

const DRY_RUN = process.argv.includes('--dry-run')
const SINGLE_FILE = process.argv.find(a => a.startsWith('--file='))?.substring('--file='.length)

/**
 * 在 source 中查找匹配的结束索引
 * @param {string} source
 * @param {number} start - 起始位置（指向开括号/开方括号）
 * @param {string} open - 开字符
 * @param {string} close - 闭字符
 * @returns {number} - 闭字符的索引（含）
 */
function findMatchingClose(source, start, open, close) {
  let depth = 0
  let i = start
  let inString = null
  let inLineComment = false
  let inBlockComment = false

  while (i < source.length) {
    const ch = source[i]
    const next = source[i + 1]

    if (inLineComment) {
      if (ch === '\n') inLineComment = false
      i++
      continue
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false
        i += 2
        continue
      }
      i++
      continue
    }
    if (inString) {
      if (ch === '\\' && i + 1 < source.length) {
        i += 2
        continue
      }
      if (ch === inString) {
        // 字符串/模板字符串的结束字符 → 直接返回当前位置
        // 注意：open 和 close 可能是同一字符（如字符串字面量的 '...'、"..."、`...`），
        // 不能依赖 depth 配对逻辑
        if (open === close) return i
        inString = null
      }
      i++
      continue
    }

    if (ch === '/' && next === '/') {
      inLineComment = true
      i += 2
      continue
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true
      i += 2
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch
      i++
      continue
    }

    if (ch === open) depth++
    else if (ch === close) {
      depth--
      if (depth === 0) return i
    }
    i++
  }
  throw new Error(`Unmatched ${open} at position ${start}`)
}

/**
 * 提取 algorithmKey 值
 * @param {string} source
 * @returns {string}
 */
function extractAlgorithmKey(source) {
  const m = /algorithmKey\s*:\s*['"]([^'"]+)['"]/.exec(source)
  if (!m) throw new Error('algorithmKey not found')
  return m[1]
}

/**
 * 定位所有 step 对象
 * 每个 step 对象以 `      id: 'xxx'` 开头（6 空格缩进），以 `    },` 结尾
 * 用 findMatchingClose 找精确范围
 * @param {string} source
 * @returns {Array<{stepId: string, start: number, end: number}>}
 */
function locateStepObjects(source) {
  const steps = []
  // 定位 steps 数组的范围（用状态机找 `steps: [` 到匹配的 `]`）
  const stepsMarker = /steps\s*:\s*\[/g
  const stepsMarkerMatch = stepsMarker.exec(source)
  if (!stepsMarkerMatch) return steps
  const stepsArrStart = stepsMarkerMatch.index + stepsMarkerMatch[0].length - 1 // 指向 `[`
  const stepsArrEnd = findMatchingClose(source, stepsArrStart, '[', ']')

  // 匹配 "      id: 'xxx'," 或 "      id: 'xxx'\n" 模式
  const idRegex = /^(\s{6})id:\s*['"]([^'"]+)['"]/gm
  let match
  while ((match = idRegex.exec(source)) !== null) {
    // 只处理在 steps 数组范围内的 id（跳过 quiz 等其他对象的 id）
    if (match.index <= stepsArrStart || match.index >= stepsArrEnd) {
      continue
    }
    const stepId = match[2]
    // 向上找最近的 { （step 对象的开始）
    const idStart = match.index
    // 从 id 关键字所在行的行首向上找最近的 `{`
    let searchPos = idStart
    while (searchPos >= 0 && source[searchPos] !== '\n') searchPos--
    // searchPos 现在指向 id 所在行之前的换行符
    // 从 searchPos 向上找最近的 `{`
    let braceStart = searchPos
    while (braceStart >= 0 && source[braceStart] !== '{') braceStart--
    if (braceStart < 0) {
      console.warn(`[WARN] No '{' found before id '${stepId}' at pos ${idStart}`)
      continue
    }

    // 向下找匹配的 }
    const braceEnd = findMatchingClose(source, braceStart, '{', '}')
    steps.push({ stepId, start: braceStart, end: braceEnd })
  }
  return steps
}

/**
 * 在 step 对象字符串中查找字段值的精确范围
 * 模式：`fieldName:` 后跟值（字符串字面量 / 数组字面量 / 对象字面量）
 * @param {string} stepSource
 * @param {string} fieldName
 * @returns {{valueStart: number, valueEnd: number, kind: 'string'|'array'|'object'}|null}
 */
function locateField(stepSource, fieldName) {
  // 转义正则特殊字符
  const escaped = fieldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // 匹配字段名（前面是空白/换行/字符串开头/标点 `,` `{` `[` `(`）
  // 使用 lookbehind 确保字段名是完整单词，不会误匹配 `comptime` 中的 `time`
  const fieldRegex = new RegExp(`(?<=[\\s\\n\\,\\{\\[\\(])${escaped}\\s*:\\s*`, 'g')
  const m = fieldRegex.exec(stepSource)
  if (!m) return null

  const valueStart = m.index + m[0].length
  const firstChar = stepSource[valueStart]

  if (firstChar === "'" || firstChar === '"' || firstChar === '`') {
    // 字符串字面量：找到匹配的引号
    const stringEnd = findMatchingClose(stepSource, valueStart, firstChar, firstChar)
    return { valueStart, valueEnd: stringEnd + 1, kind: 'string' }
  }
  if (firstChar === '[') {
    const arrEnd = findMatchingClose(stepSource, valueStart, '[', ']')
    return { valueStart, valueEnd: arrEnd + 1, kind: 'array' }
  }
  if (firstChar === '{') {
    const objEnd = findMatchingClose(stepSource, valueStart, '{', '}')
    return { valueStart, valueEnd: objEnd + 1, kind: 'object' }
  }
  return null
}

/**
 * 转义字符串字面量内容（保留单引号字符串原样，但需要处理嵌入的单引号）
 * @param {string} value
 * @returns {string}
 */
function quoteString(value) {
  // 使用单引号包裹；如果内容含单引号但不含双引号，用双引号；否则转义
  if (!value.includes("'")) return `'${value}'`
  if (!value.includes('"')) return `"${value}"`
  // 都含：使用单引号 + 转义
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

/**
 * 迁移单个 step 对象的字符串内容
 * @param {string} stepSource - step 对象的完整字符串（含外层 {}）
 * @param {string} algorithmKey
 * @param {string} stepId
 * @returns {{result: string, changes: string[]}}
 */
function migrateStep(stepSource, algorithmKey, stepId) {
  const changes = []
  // 从后向前替换，避免索引错位
  const replacements = []

  if (DRY_RUN) {
    console.log(`    [STEP] '${stepId}': stepSource.length=${stepSource.length}`)
  }

  // 1. title: 'xxx' → tStatic('...title')
  const titleLoc = locateField(stepSource, 'title')
  if (titleLoc && titleLoc.kind === 'string') {
    const nsKey = `learning.${algorithmKey}.steps.${stepId}.title`
    replacements.push({
      ...titleLoc,
      newValue: `tStatic(${quoteString(nsKey)})`,
      field: 'title',
    })
    changes.push(`title → tStatic('${nsKey}')`)
  }

  // 2. description: 'xxx' → tStatic('...description')
  const descLoc = locateField(stepSource, 'description')
  if (descLoc && descLoc.kind === 'string') {
    const nsKey = `learning.${algorithmKey}.steps.${stepId}.description`
    replacements.push({
      ...descLoc,
      newValue: `tStatic(${quoteString(nsKey)})`,
      field: 'description',
    })
    changes.push(`description → tStatic('${nsKey}')`)
  }

  // 3. highlightTerms: [...] → tStatic('...highlightTerms').split('|')
  const htLoc = locateField(stepSource, 'highlightTerms')
  if (htLoc && htLoc.kind === 'array') {
    const nsKey = `learning.${algorithmKey}.steps.${stepId}.highlightTerms`
    replacements.push({
      ...htLoc,
      newValue: `tStatic(${quoteString(nsKey)}).split('|')`,
      field: 'highlightTerms',
    })
    changes.push(`highlightTerms → tStatic('${nsKey}').split('|')`)
  }

  // 4. tips: [...] → tStatic('...tips').split('|')
  const tipsLoc = locateField(stepSource, 'tips')
  if (tipsLoc && tipsLoc.kind === 'array') {
    const nsKey = `learning.${algorithmKey}.steps.${stepId}.tips`
    replacements.push({
      ...tipsLoc,
      newValue: `tStatic(${quoteString(nsKey)}).split('|')`,
      field: 'tips',
    })
    changes.push(`tips → tStatic('${nsKey}').split('|')`)
  }

  // 5. complexity: { time: 'xxx', space: 'yyy' } → { time: tStatic('...complexityTime'), space: tStatic('...complexitySpace') }
  const compLoc = locateField(stepSource, 'complexity')
  if (compLoc && compLoc.kind === 'object') {
    const compSource = stepSource.substring(compLoc.valueStart, compLoc.valueEnd)
    // 在 complexity 对象内定位 time 和 space 字段
    let newComp = compSource
    const timeLoc = locateField(compSource, 'time')
    const spaceLoc = locateField(compSource, 'space')

    // 从后向前替换
    const compReplacements = []
    if (timeLoc && timeLoc.kind === 'string') {
      const nsKey = `learning.${algorithmKey}.steps.${stepId}.complexityTime`
      compReplacements.push({
        ...timeLoc,
        newValue: `tStatic(${quoteString(nsKey)})`,
      })
      changes.push(`complexity.time → tStatic('${nsKey}')`)
    }
    if (spaceLoc && spaceLoc.kind === 'string') {
      const nsKey = `learning.${algorithmKey}.steps.${stepId}.complexitySpace`
      compReplacements.push({
        ...spaceLoc,
        newValue: `tStatic(${quoteString(nsKey)})`,
      })
      changes.push(`complexity.space → tStatic('${nsKey}')`)
    }
    // 排序后从后向前替换
    compReplacements.sort((a, b) => b.valueStart - a.valueStart)
    for (const r of compReplacements) {
      newComp = newComp.substring(0, r.valueStart) + r.newValue + newComp.substring(r.valueEnd)
    }
    if (compReplacements.length > 0) {
      replacements.push({
        ...compLoc,
        newValue: newComp,
        field: 'complexity',
      })
    }
  }

  // 主替换：排序后从后向前替换
  replacements.sort((a, b) => b.valueStart - a.valueStart)
  let result = stepSource
  for (const r of replacements) {
    result = result.substring(0, r.valueStart) + r.newValue + result.substring(r.valueEnd)
  }

  return { result, changes }
}

/**
 * 处理单个 config 文件
 * @param {string} filePath
 * @returns {{filePath: string, algorithmKey: string, stepsProcessed: number, totalChanges: number}}
 */
function migrateFile(filePath) {
  const source = readFileSync(filePath, 'utf8')
  const algorithmKey = extractAlgorithmKey(source)
  const steps = locateStepObjects(source)

  // 从后向前替换每个 step 对象的字符串内容
  const stepReplacements = []
  let totalChanges = 0
  for (const step of steps) {
    const stepSource = source.substring(step.start, step.end + 1)
    const { result, changes } = migrateStep(stepSource, algorithmKey, step.stepId)
    if (changes.length > 0) {
      stepReplacements.push({ start: step.start, end: step.end + 1, newValue: result })
      totalChanges += changes.length
    }
  }
  stepReplacements.sort((a, b) => b.start - a.start)

  let newSource = source
  for (const r of stepReplacements) {
    newSource = newSource.substring(0, r.start) + r.newValue + newSource.substring(r.end)
  }

  // 检查是否需要添加 tStatic import（路径：configs/learning → ../../i18n/useI18n）
  let finalSource = newSource
  if (totalChanges > 0 && !newSource.includes("from '../../i18n/useI18n'") && !newSource.includes("from '../i18n/useI18n'")) {
    // 在 import type 语句后插入（兼容 CRLF 行尾）
    const importMatch = /import type \{ LearningModeConfig \} from '\.\/types'(?:\r\n|\n)/.exec(newSource)
    if (importMatch) {
      const insertPos = importMatch.index + importMatch[0].length
      finalSource = newSource.substring(0, insertPos) + "import { tStatic } from '../../i18n/useI18n'\n" + newSource.substring(insertPos)
    }
  }

  return {
    filePath,
    algorithmKey,
    stepsProcessed: steps.length,
    totalChanges,
    finalSource,
  }
}

function main() {
  const files = readdirSync(CONFIG_DIR).filter(f => f.endsWith('.config.ts'))
  console.log(`Found ${files.length} config files`)

  let totalSteps = 0
  let totalChanges = 0

  for (const file of files) {
    const filePath = join(CONFIG_DIR, file)
    try {
      const result = migrateFile(filePath)
      console.log(`[${DRY_RUN ? 'DRY' : 'WRITE'}] ${file}: algorithmKey=${result.algorithmKey}, steps=${result.stepsProcessed}, changes=${result.totalChanges}`)
      totalSteps += result.stepsProcessed
      totalChanges += result.totalChanges
      if (!DRY_RUN && result.totalChanges > 0) {
        writeFileSync(filePath, result.finalSource, 'utf8')
      }
      // 单文件模式：详细输出每个 step 的迁移内容
      if (SINGLE_FILE && !DRY_RUN) {
        console.log(result.finalSource)
        return
      }
    } catch (err) {
      console.error(`[ERROR] ${file}: ${err.message}`)
      process.exit(1)
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`Files: ${files.length}`)
  console.log(`Total steps: ${totalSteps}`)
  console.log(`Total field changes: ${totalChanges}`)
  if (DRY_RUN) {
    console.log(`\n(Dry-run mode: no files modified. Re-run without --dry-run to apply.)`)
  }
}

main()
