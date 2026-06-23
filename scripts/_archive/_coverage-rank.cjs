/* eslint-disable @typescript-eslint/no-require-imports */
// 解析 coverage-summary.json 找出最差覆盖的 pages/visualizers/utils/i18n 文件
const fs = require('fs')
const path = require('path')

const json = JSON.parse(fs.readFileSync('coverage/coverage-summary.json', 'utf8'))
const targets = ['pages', 'visualizers', 'utils', 'hooks', 'components', 'i18n/locales', 'i18n']

const files = []
for (const [key, val] of Object.entries(json)) {
  if (key === 'total') continue
  if (val.statements.total === 0) continue
  if (!targets.some(t => key.includes(`src/${t}/`) || key.includes(`src\\${t}\\`))) continue
  const sPct = val.statements.pct
  const bPct = val.branches.pct
  const fPct = val.functions.pct
  const lPct = val.lines.pct
  const avg = (sPct + bPct + fPct + lPct) / 4
  const name = path.basename(key)
  const dir = key.match(/src[\\/]([^\\\/]+)/)?.[1] || 'unknown'
  files.push({ key, name, dir, sPct, bPct, fPct, lPct, avg, total: val.statements.total })
}

// 按平均覆盖率升序排序
files.sort((a, b) => a.avg - b.avg)

console.log(`\n=== TOP 30 最差覆盖文件 (Pages/Visualizers/Utils/Hooks/Components/i18n) ===\n`)
for (const f of files.slice(0, 30)) {
  const shortKey = f.key.replace(/^D:\\VibeCoding\\数据结构学习助手3\\/, '').replace(/\\/g, '/')
  console.log(`${f.avg.toFixed(1).padStart(5)}% | Stmt ${f.sPct.toString().padStart(3)}% | Br ${f.bPct.toString().padStart(3)}% | Fn ${f.fPct.toString().padStart(3)}% | Ln ${f.lPct.toString().padStart(3)}% | stmts=${String(f.total).padStart(4)} | ${shortKey}`)
}
