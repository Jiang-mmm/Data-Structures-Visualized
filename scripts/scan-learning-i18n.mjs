// 一次性扫描脚本：统计 40 learning config 实际 i18n 键数
import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CONFIG_DIR = join(__dirname, '..', 'src/configs/learning')
const files = readdirSync(CONFIG_DIR).filter(f => f.endsWith('.config.ts'))

const stats = []
for (const f of files) {
  const content = readFileSync(join(CONFIG_DIR, f), 'utf-8')
  const key = f.replace('.config.ts', '')
  const titles = (content.match(/^\s*title\s*:\s*['"`][^'"`]*[\u4e00-\u9fff]/gm) || []).length
  const descs = (content.match(/^\s*description\s*:\s*['"`][^'"`]*[\u4e00-\u9fff]/gm) || []).length
  const tipsArrays = (content.match(/^\s*tips\s*:\s*\[/gm) || []).length
  const highlightArrays = (content.match(/^\s*highlightTerms\s*:/gm) || []).length
  const complexityObjects = (content.match(/^\s*complexity\s*:\s*\{/gm) || []).length
  const estTips = tipsArrays * 2
  const estHighlight = highlightArrays * 2
  const estComplexityKeys = complexityObjects * 2

  stats.push({
    file: f,
    key,
    titles,
    descs,
    tipsArrays,
    estTips,
    highlightArrays,
    estHighlight,
    complexityObjects,
    estComplexityKeys,
    total: titles + descs + estTips + estHighlight + estComplexityKeys,
  })
}

stats.sort((a, b) => b.total - a.total)
console.log('\n=== 40 Config i18n 键统计 ===\n')
console.log('file | title | desc | tips*2 | high*2 | comp*2 | total')
console.log('-----|-------|------|--------|--------|--------|------')
let grandTotal = 0
for (const s of stats) {
  console.log(`${s.key.padEnd(28)} | ${String(s.titles).padStart(5)} | ${String(s.descs).padStart(4)} | ${String(s.estTips).padStart(6)} | ${String(s.estHighlight).padStart(6)} | ${String(s.estComplexityKeys).padStart(6)} | ${String(s.total).padStart(5)}`)
  grandTotal += s.total
}
console.log('-----|-------|------|--------|--------|--------|------')
console.log('TOTAL:', grandTotal, 'i18n keys (excluding codeSnippet Chinese comments)')

let codeComments = 0
for (const f of files) {
  const content = readFileSync(join(CONFIG_DIR, f), 'utf-8')
  const codeSnippetMatches = content.match(/codeSnippet\s*:\s*`([\s\S]*?)`/g) || []
  for (const m of codeSnippetMatches) {
    const cnChars = (m.match(/[\u4e00-\u9fff]/g) || []).length
    codeComments += cnChars
  }
}
console.log('\ncodeSnippet 中文注释:', codeComments, '字符（保留原样）')
