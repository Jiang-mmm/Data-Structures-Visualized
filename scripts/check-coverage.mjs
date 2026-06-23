import { readFileSync } from 'fs'

const c = JSON.parse(readFileSync('./coverage/coverage-final.json', 'utf-8'))
const arr = []
for (const [f, d] of Object.entries(c)) {
  const key = f.split(/[\\/]src[\\/]/).pop() || f
  if (key.includes('__tests__')) continue
  const s = d.statementMap ? Object.keys(d.statementMap).length : 0
  const sCovered = d.s ? Object.values(d.s).filter(v => v > 0).length : 0
  const b = d.branchMap ? Object.keys(d.branchMap).length : 0
  const bCovered = d.b ? Object.values(d.b).map(arr => arr.filter(v => v > 0).length).reduce((a, b) => a + b, 0) : 0
  if (s === 0) continue
  arr.push({ key, sPct: (sCovered / s) * 100, bPct: b > 0 ? (bCovered / b) * 100 : 100, s, b })
}
arr.sort((a, b) => a.sPct - b.sPct)
console.log('Top 30 LOW coverage files:')
arr.slice(0, 30).forEach(x => {
  console.log(x.key.padEnd(55), 'S:' + x.sPct.toFixed(1).padStart(5) + '%', 'B:' + x.bPct.toFixed(1).padStart(5) + '%', '[' + x.s + ' stmts]')
})
console.log('\nTop 30 LOW BRANCH coverage (s >= 80%):')
arr.filter(x => x.sPct >= 80 && x.b > 0).sort((a, b) => a.bPct - b.bPct).slice(0, 30).forEach(x => {
  console.log(x.key.padEnd(55), 'B:' + x.bPct.toFixed(1).padStart(5) + '%', '[' + x.b + ' branches]')
})
