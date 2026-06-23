#!/usr/bin/env node
/**
 * v21 B-7 zh/en locale 对比脚本
 *
 * 扫描 src/i18n/locales.ts 中的 zh 和 en 对象，
 * 找出 en === zh 的键（疑似未翻译），
 * 按 5 核心页面（Home / SortPage / ArrayPage / GraphPage / SortCompare）分组。
 */
import { readFileSync } from 'fs'
import { join } from 'path'

const FILE = 'src/i18n/locales.ts'
const EN_START = 2270 // 行号（1-indexed），en 对象开始行
const ZH_START = 1061

// 5 核心页面映射
const CORE_PAGES = {
  home: { ns: ['home'], label: 'Home' },
  sort: { ns: ['sort'], label: 'SortPage' },
  array: { ns: ['array'], label: 'ArrayPage' },
  graph: { ns: ['graph', 'graphAlgorithm'], label: 'GraphPage' },
  compare: { ns: ['compare'], label: 'SortCompare' },
}

function findMatchingBrace(s, openIdx) {
  let depth = 0
  for (let i = openIdx; i < s.length; i++) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return -1
}

function walkObject(body, basePath = '') {
  const out = []
  let i = 0

  while (i < body.length) {
    // Skip whitespace
    while (i < body.length && /\s/.test(body[i])) i++
    if (i >= body.length) break

    // Skip line comment
    if (body[i] === '/' && body[i + 1] === '/') {
      while (i < body.length && body[i] !== '\n') i++
      continue
    }
    // Skip block comment
    if (body[i] === '/' && body[i + 1] === '*') {
      i += 2
      while (i < body.length && !(body[i] === '*' && body[i + 1] === '/')) i++
      i += 2
      continue
    }
    if (body[i] === ',') {
      i++
      continue
    }
    if (body[i] === '}') break

    // Read key (identifier or quoted string)
    let key
    if (body[i] === "'" || body[i] === '"') {
      const quote = body[i]
      i++
      let k = ''
      while (i < body.length && body[i] !== quote) {
        if (body[i] === '\\' && i + 1 < body.length) {
          k += body[i + 1]
          i += 2
          continue
        }
        k += body[i++]
      }
      i++ // closing quote
      key = k
    } else if (/[a-zA-Z_$]/.test(body[i])) {
      let k = ''
      while (i < body.length && /[a-zA-Z0-9_$]/.test(body[i])) k += body[i++]
      key = k
    } else {
      // unexpected char, skip
      i++
      continue
    }

    // Skip whitespace
    while (i < body.length && /\s/.test(body[i])) i++

    // Expect colon
    if (body[i] !== ':') {
      continue
    }
    i++

    // Skip whitespace
    while (i < body.length && /\s/.test(body[i])) i++

    const fullPath = basePath ? `${basePath}.${key}` : key

    // Read value: string, template, or object
    if (body[i] === "'" || body[i] === '"') {
      const quote = body[i]
      i++
      let v = ''
      while (i < body.length && body[i] !== quote) {
        if (body[i] === '\\' && i + 1 < body.length) {
          v += body[i] + body[i + 1]
          i += 2
          continue
        }
        v += body[i++]
      }
      i++ // closing quote
      out.push({ path: fullPath, value: v, type: 'string' })
    } else if (body[i] === '`') {
      // template literal
      const quote = body[i]
      i++
      let v = ''
      while (i < body.length && body[i] !== quote) {
        if (body[i] === '\\' && i + 1 < body.length) {
          v += body[i] + body[i + 1]
          i += 2
          continue
        }
        v += body[i++]
      }
      i++ // closing backtick
      out.push({ path: fullPath, value: v, type: 'template' })
    } else if (body[i] === '{') {
      const close = findMatchingBrace(body, i)
      if (close < 0) break
      const innerBody = body.slice(i + 1, close)
      const children = walkObject(innerBody, fullPath)
      out.push(...children)
      i = close + 1
    } else {
      // skip unknown
      i++
    }
  }
  return out
}

function extractLocale(content, startLine) {
  const lines = content.split('\n')
  const startIdx = startLine - 1
  // Find "export const en: Locale = {" or similar
  let blockStart = -1
  for (let i = startIdx; i < lines.length; i++) {
    if (lines[i].match(/^export const \w+: Locale = \{/)) {
      blockStart = i
      break
    }
  }
  if (blockStart === -1) throw new Error('Block not found')

  // Slice from blockStart line onwards and parse the { ... } body
  const blockText = lines.slice(blockStart).join('\n')
  const openIdx = blockText.indexOf('{')
  if (openIdx === -1) throw new Error('No opening brace')
  const closeIdx = findMatchingBrace(blockText, openIdx)
  if (closeIdx === -1) throw new Error('No matching closing brace')
  const body = blockText.slice(openIdx + 1, closeIdx)
  return walkObject(body)
}

function main() {
  const content = readFileSync(join(process.cwd(), FILE), 'utf8')
  const zhEntries = extractLocale(content, ZH_START)
  const enEntries = extractLocale(content, EN_START)

  console.log(`zh 总 key-value 数: ${zhEntries.length}`)
  console.log(`en 总 key-value 数: ${enEntries.length}`)

  // Build maps
  const zhMap = new Map()
  for (const e of zhEntries) zhMap.set(e.path, e.value)
  const enMap = new Map()
  for (const e of enEntries) enMap.set(e.path, e.value)

  // Find identical (en === zh)
  const identical = []
  for (const [path, zhVal] of zhMap) {
    const enVal = enMap.get(path)
    if (enVal === undefined) continue
    if (enVal === zhVal) {
      identical.push({ path, value: zhVal })
    }
  }

  console.log(`\n=== zh === en 完全相同（疑似未翻译）: ${identical.length} ===\n`)

  // Group by namespace
  const byNs = {}
  for (const { path, value } of identical) {
    const ns = path.split('.')[0]
    if (!byNs[ns]) byNs[ns] = []
    byNs[ns].push({ path, value })
  }

  for (const [ns, items] of Object.entries(byNs).sort()) {
    console.log(`\n[${ns}] (${items.length})`)
    for (const { path, value } of items.slice(0, 50)) {
      const shortVal = value.length > 60 ? value.slice(0, 60) + '...' : value
      console.log(`  ${path}: "${shortVal}"`)
    }
    if (items.length > 50) console.log(`  ... (${items.length - 50} more)`)
  }

  // Group by 5 core pages
  console.log('\n\n=== 5 核心页面分组 ===\n')
  for (const [, { ns: namespaces, label }] of Object.entries(CORE_PAGES)) {
    const all = []
    for (const ns of namespaces) {
      if (byNs[ns]) all.push(...byNs[ns])
    }
    console.log(`\n[${label}] (${all.length} 个未翻译键)`)
    for (const { path, value } of all) {
      const shortVal = value.length > 80 ? value.slice(0, 80) + '...' : value
      console.log(`  ${path}: "${shortVal}"`)
    }
  }
}

main()
