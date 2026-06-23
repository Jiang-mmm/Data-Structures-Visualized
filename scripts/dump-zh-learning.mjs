// v20 M7-4.1 — 将 40 个 zh learning locale 文件转为紧凑 JSON
// 供 AI 翻译时输入使用（节省 token）。
//
// 用法: node scripts/dump-zh-learning.mjs > /tmp/zh-learning.json
// 输入: src/i18n/locales/zh/learning/{configKey}.ts (40 个)
// 输出: { configKey: { stepId: { title, description, tips: [...], highlightTerms: [...], complexityTime?, complexitySpace? } } }
//
// 解析策略: 从 zh locale 文件的 `steps: { "stepId": { ... }, ... }` 中提取。

import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = join(__dirname, '..')
const INPUT_DIR = join(PROJECT_ROOT, 'src/i18n/locales/zh/learning')

if (!existsSync(INPUT_DIR)) {
  console.error(`Input dir not found: ${INPUT_DIR}`)
  process.exit(1)
}

/**
 * 在 source 中查找匹配的结束索引（含字符串和注释跳过）
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
 */
function parseQuotedString(source, start) {
  const quote = source[start]
  let i = start + 1
  let result = ''
  while (i < source.length && source[i] !== quote) {
    if (source[i] === '\\' && i + 1 < source.length) {
      const next = source[i + 1]
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
 * 在对象源码中查找字段（key 必须是 "key" 或 'key'，不能有引号变化）
 */
function findField(objSource, key) {
  const re = new RegExp(`\\b${key}\\s*:\\s*`, 'g')
  const match = re.exec(objSource)
  if (!match) return null
  const valueStart = match.index + match[0].length
  const ch = objSource[valueStart]
  if (ch === "'" || ch === '"') {
    const [val] = parseQuotedString(objSource, valueStart)
    return val
  } else if (ch === '[') {
    const closeIdx = findMatchingClose(objSource, valueStart, '[', ']')
    return objSource.substring(valueStart, closeIdx + 1)
  } else if (ch === '{') {
    const closeIdx = findMatchingClose(objSource, valueStart, '{', '}')
    return objSource.substring(valueStart, closeIdx + 1)
  }
  return null
}

/**
 * 解析 complexity 对象
 */
function parseComplexity(compSource) {
  const result = {}
  const timeMatch = /time\s*:\s*['"]/.exec(compSource)
  if (timeMatch) {
    const valStart = timeMatch.index + timeMatch[0].length - 1
    const [val] = parseQuotedString(compSource, valStart)
    result.time = val
  }
  const spaceMatch = /space\s*:\s*['"]/.exec(compSource)
  if (spaceMatch) {
    const valStart = spaceMatch.index + spaceMatch[0].length - 1
    const [val] = parseQuotedString(compSource, valStart)
    result.space = val
  }
  return result
}

/**
 * 解析单个 zh locale 文件
 * 关键：从 steps 对象内提取 key → stepId
 */
function parseZhLocale(configKey, source) {
  // 找 steps: { ... }
  const stepsMatch = /steps\s*:\s*\{/.exec(source)
  if (!stepsMatch) {
    throw new Error(`No steps object in file`)
  }
  const stepsObjStart = stepsMatch.index + stepsMatch[0].length - 1
  const stepsObjEnd = findMatchingClose(source, stepsObjStart, '{', '}')
  const stepsContent = source.substring(stepsObjStart + 1, stepsObjEnd)

  // 遍历 steps 对象内的 key-value 对
  const result = {}
  let i = 0
  while (i < stepsContent.length) {
    // 跳过空白
    while (i < stepsContent.length && /\s/.test(stepsContent[i])) i++
    if (i >= stepsContent.length) break

    // 必须是引号开头（stepId 一定是字符串 key）
    if (stepsContent[i] !== '"' && stepsContent[i] !== "'") {
      // 可能是 trailing comma 等
      i++
      continue
    }

    // 解析 stepId
    const [stepId, afterId] = parseQuotedString(stepsContent, i)
    i = afterId

    // 跳过空白和冒号
    while (i < stepsContent.length && /[\s:]/.test(stepsContent[i])) i++

    // 必须是 { 开头
    if (stepsContent[i] !== '{') {
      throw new Error(`Expected '{' after stepId "${stepId}"`)
    }
    const stepEnd = findMatchingClose(stepsContent, i, '{', '}')
    const stepSource = stepsContent.substring(i, stepEnd + 1)

    const step = {
      title: findField(stepSource, 'title') || '',
      description: findField(stepSource, 'description') || '',
      tips: [],
      highlightTerms: [],
    }

    const tipsSource = findField(stepSource, 'tips')
    if (tipsSource) {
      step.tips = tipsSource.split('|').filter(Boolean)
    }
    const highlightSource = findField(stepSource, 'highlightTerms')
    if (highlightSource) {
      step.highlightTerms = highlightSource.split('|').filter(Boolean)
    }
    const complexitySource = findField(stepSource, 'complexity')
    if (complexitySource) {
      const comp = parseComplexity(complexitySource)
      if (comp.time) step.complexityTime = comp.time
      if (comp.space) step.complexitySpace = comp.space
    }
    result[stepId] = step
    i = stepEnd + 1
  }

  return result
}

// === 主流程 ===
const files = readdirSync(INPUT_DIR).filter(f => f.endsWith('.ts') && f !== 'index.ts').sort()
const allData = {}
let totalSteps = 0
let totalKeys = 0

for (const f of files) {
  const configKey = f.replace(/\.ts$/, '')
  const source = readFileSync(join(INPUT_DIR, f), 'utf-8')
  try {
    const steps = parseZhLocale(configKey, source)
    allData[configKey] = steps
    const stepCount = Object.keys(steps).length
    const keyCount = Object.values(steps).reduce((acc, s) => {
      let n = 2
      n += s.tips.length
      n += s.highlightTerms.length
      if (s.complexityTime) n++
      if (s.complexitySpace) n++
      return acc + n
    }, 0)
    totalSteps += stepCount
    totalKeys += keyCount
    process.stderr.write(`✓ ${configKey.padEnd(28)}: ${stepCount} steps, ${keyCount} keys\n`)
  } catch (err) {
    process.stderr.write(`✗ ${f}: ${err.message}\n`)
    process.exit(1)
  }
}

process.stderr.write(`\nTotal: ${Object.keys(allData).length} configs, ${totalSteps} steps, ${totalKeys} keys\n`)

// === 输出到指定文件（默认 stdout，方便重定向）===
const outFile = process.argv[2] || process.stdout
const jsonOutput = JSON.stringify(allData, null, 2) + '\n'
if (typeof outFile === 'string') {
  const { writeFileSync } = await import('fs')
  writeFileSync(outFile, jsonOutput, 'utf-8')
  process.stderr.write(`Written: ${outFile}\n`)
} else {
  outFile.write(jsonOutput)
}
