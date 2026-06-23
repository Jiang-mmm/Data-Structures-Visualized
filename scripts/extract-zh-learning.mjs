// v20 M7-3 — 从 40 个 learning config 反向生成 40 个 zh locale 文件
//
// 用法: node scripts/extract-zh-learning.mjs
// 输入: src/configs/learning/*.config.ts (40 个)
// 输出: src/i18n/locales/zh/learning/{configKey}.ts (40 个)
//
// 解析策略:
// - 用单字符 state machine 跟踪 brace/bracket 深度
// - 跳过 template literals (backtick) 和单/双引号字符串内容
// - 跳过单行 (//) 和多行 (/* */) 注释
// - 在 step 对象内提取 id/title/description/tips/highlightTerms/complexity

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const CONFIG_DIR = join(PROJECT_ROOT, 'src/configs/learning')
const OUTPUT_DIR = join(PROJECT_ROOT, 'src/i18n/locales/zh/learning')

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

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
  let inString = null // ' " `
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
 * 解析单/双引号字符串
 * @param {string} source
 * @param {number} start - 起始引号位置
 * @returns {[string, number]} - [解析值, 结束位置]
 */
function parseQuotedString(source, start) {
  const quote = source[start]
  let i = start + 1
  let result = ''
  while (i < source.length && source[i] !== quote) {
    if (source[i] === '\\' && i + 1 < source.length) {
      const next = source[i + 1]
      // 只处理基本转义
      if (next === 'n') result += '\n'
      else if (next === 't') result += '\t'
      else if (next === 'r') result += '\r'
      else if (next === '\\') result += '\\'
      else if (next === "'") result += "'"
      else if (next === '"') result += '"'
      else if (next === '`') result += '`'
      else result += next
      i += 2
    } else {
      result += source[i]
      i++
    }
  }
  if (source[i] !== quote) {
    throw new Error(`Unterminated string at position ${start}`)
  }
  return [result, i + 1]
}

/**
 * 在 step 对象内查找字段（key: value,）
 * @param {string} stepSource - step 对象的源代码（含外层大括号）
 * @param {string} key - 字段名
 * @returns {string|null} - 字段值（去除两端空白）
 */
function findField(stepSource, key) {
  // 用 regex 找 key 后面跟冒号的值（处理换行情况）
  const re = new RegExp(`${key}\\s*:\\s*`, 'g')
  const match = re.exec(stepSource)
  if (!match) return null
  const valueStart = match.index + match[0].length
  // 判断值类型
  const ch = stepSource[valueStart]
  if (ch === "'" || ch === '"') {
    const [val] = parseQuotedString(stepSource, valueStart)
    return val
  } else if (ch === '[') {
    const closeIdx = findMatchingClose(stepSource, valueStart, '[', ']')
    return stepSource.substring(valueStart, closeIdx + 1)
  } else if (ch === '{') {
    const closeIdx = findMatchingClose(stepSource, valueStart, '{', '}')
    return stepSource.substring(valueStart, closeIdx + 1)
  } else {
    // 字面量（数字/布尔）
    const endMatch = /[,\n}]/.exec(stepSource.substring(valueStart))
    if (!endMatch) return null
    return stepSource.substring(valueStart, valueStart + endMatch.index).trim()
  }
}

/**
 * 解析字符串数组（['a', 'b', 'c']）→ ['a', 'b', 'c']
 */
function parseStringArray(arraySource) {
  const result = []
  let i = 0
  while (i < arraySource.length) {
    const ch = arraySource[i]
    if (ch === "'" || ch === '"') {
      const [val, endIdx] = parseQuotedString(arraySource, i)
      result.push(val)
      i = endIdx
    } else {
      i++
    }
  }
  return result
}

/**
 * 解析 complexity: { time: '...', space: '...' } → { time, space }
 */
function parseComplexity(compSource) {
  const result = {}
  const timeMatch = /time\s*:\s*['"]/.exec(compSource)
  if (timeMatch) {
    const [val] = parseQuotedString(compSource, timeMatch.index + timeMatch[0].length - 1)
    result.time = val
  }
  const spaceMatch = /space\s*:\s*['"]/.exec(compSource)
  if (spaceMatch) {
    const [val] = parseQuotedString(compSource, spaceMatch.index + spaceMatch[0].length - 1)
    result.space = val
  }
  return result
}

/**
 * 字符串转义为 TS 单引号字符串字面量
 */
function tsString(s) {
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + "'"
}

/**
 * 处理单个 config 文件
 */
function processConfig(filename) {
  const filepath = join(CONFIG_DIR, filename)
  const source = readFileSync(filepath, 'utf-8')

  // 提取 algorithmKey
  const keyMatch = /algorithmKey\s*:\s*['"](\w+)['"]/.exec(source)
  if (!keyMatch) {
    throw new Error(`No algorithmKey in ${filename}`)
  }
  const configKey = keyMatch[1]

  // 找 steps: [ 的位置
  const stepsStartMatch = /steps\s*:\s*\[/.exec(source)
  if (!stepsStartMatch) {
    throw new Error(`No steps array in ${filename}`)
  }
  const stepsArrStart = stepsStartMatch.index + stepsStartMatch[0].length - 1 // 指向 '['
  const stepsArrEnd = findMatchingClose(source, stepsArrStart, '[', ']')
  const stepsContent = source.substring(stepsArrStart + 1, stepsArrEnd)

  // 遍历每个 step 对象
  const steps = []
  let i = 0
  while (i < stepsContent.length) {
    // 跳过空白
    while (i < stepsContent.length && /\s/.test(stepsContent[i])) i++
    if (i >= stepsContent.length) break
    if (stepsContent[i] !== '{') {
      i++
      continue
    }
    const objEnd = findMatchingClose(stepsContent, i, '{', '}')
    const stepSource = stepsContent.substring(i, objEnd + 1)
    const idVal = findField(stepSource, 'id')
    if (!idVal) {
      i = objEnd + 1
      continue
    }

    const step = {
      id: idVal,
      title: findField(stepSource, 'title') || '',
      description: findField(stepSource, 'description') || '',
      tips: [],
      highlightTerms: [],
    }

    const tipsSource = findField(stepSource, 'tips')
    if (tipsSource) {
      step.tips = parseStringArray(tipsSource)
    }
    const highlightSource = findField(stepSource, 'highlightTerms')
    if (highlightSource) {
      step.highlightTerms = parseStringArray(highlightSource)
    }
    const complexitySource = findField(stepSource, 'complexity')
    if (complexitySource) {
      const comp = parseComplexity(complexitySource)
      if (comp.time) step.complexityTime = comp.time
      if (comp.space) step.complexitySpace = comp.space
    }
    steps.push(step)
    i = objEnd + 1
  }

  return { configKey, steps }
}

/**
 * 生成 TS 模块内容
 */
function generateModule(configKey, steps) {
  const lines = []
  lines.push('/**')
  lines.push(` * v20 M7 — learning config "${configKey}" 中文 locale（自动从 src/configs/learning/${configKey}.config.ts 提取）`)
  lines.push(' *')
  lines.push(' * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。')
  lines.push(' * 修改源 config 后，重新运行本脚本同步。')
  lines.push(' *')
  lines.push(' * 结构：')
  lines.push(' *   title/description/complexityTime/complexitySpace: string')
  lines.push(' *   tips/highlightTerms: string (用 | 分隔，运行时 .split(\'|\') 还原)')
  lines.push(' */')
  lines.push(`export const ${configKey}LearningSteps = {`)
  lines.push('  steps: {')
  for (const step of steps) {
    lines.push(`    ${JSON.stringify(step.id)}: {`)
    lines.push(`      title: ${tsString(step.title)},`)
    lines.push(`      description: ${tsString(step.description)},`)
    lines.push(`      tips: ${tsString(step.tips.join('|'))},`)
    lines.push(`      highlightTerms: ${tsString(step.highlightTerms.join('|'))},`)
    if (step.complexityTime !== undefined) {
      lines.push(`      complexityTime: ${tsString(step.complexityTime)},`)
    }
    if (step.complexitySpace !== undefined) {
      lines.push(`      complexitySpace: ${tsString(step.complexitySpace)},`)
    }
    lines.push('    },')
  }
  lines.push('  },')
  lines.push('} as const')
  lines.push('')
  return lines.join('\n')
}

// === 主流程 ===
const configFiles = readdirSync(CONFIG_DIR).filter(f => f.endsWith('.config.ts')).sort()
const results = []
const errors = []

for (const f of configFiles) {
  try {
    const result = processConfig(f)
    const moduleContent = generateModule(result.configKey, result.steps)
    const outFile = join(OUTPUT_DIR, `${result.configKey}.ts`)
    writeFileSync(outFile, moduleContent, 'utf-8')
    const stepCount = result.steps.length
    const keyCount = stepCount * 4 + result.steps.filter(s => s.complexityTime || s.complexitySpace).length * 2
    results.push({ configKey: result.configKey, stepCount, keyCount })
    console.log(`✓ ${result.configKey.padEnd(28)}: ${stepCount} steps, ~${keyCount} keys`)
  } catch (err) {
    errors.push({ file: f, error: err.message })
    console.error(`✗ ${f}: ${err.message}`)
  }
}

console.log(`\n=== Summary ===`)
console.log(`Processed: ${results.length} / ${configFiles.length}`)
console.log(`Total steps: ${results.reduce((a, b) => a + b.stepCount, 0)}`)
console.log(`Total keys (est): ${results.reduce((a, b) => a + b.keyCount, 0)}`)
if (errors.length > 0) {
  console.error(`\n${errors.length} errors:`)
  for (const e of errors) {
    console.error(`  ${e.file}: ${e.error}`)
  }
  process.exit(1)
}
