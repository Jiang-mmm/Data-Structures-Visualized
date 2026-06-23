// 临时修复：补全 12 个 CRLF config 文件的 tStatic import + 修正所有 40 文件的 import 路径
// 仅在 M7-5 迁移后运行一次，不属于永久脚本
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const CONFIG_DIR = 'src/configs/learning'
const WRONG_PATH = "from '../i18n/useI18n'"
const CORRECT_PATH = "from '../../i18n/useI18n'"
const CORRECT_IMPORT = `import { tStatic } from ${CORRECT_PATH}`

const files = readdirSync(CONFIG_DIR).filter(f => f.endsWith('.config.ts'))
let pathFixed = 0
let importAdded = 0
for (const file of files) {
  const filePath = join(CONFIG_DIR, file)
  const source = readFileSync(filePath, 'utf8')
  let newSource = source

  // 1. 修正已有错误 import 路径（../ → ../../）
  if (newSource.includes(WRONG_PATH)) {
    newSource = newSource.split(WRONG_PATH).join(CORRECT_PATH)
    pathFixed++
  }

  // 2. 补全缺失 import（仅针对 CRLF 文件）
  if (newSource.includes('tStatic(') && !newSource.includes('import { tStatic }')) {
    const eol = newSource.includes('\r\n') ? '\r\n' : '\n'
    const importTypeRegex = /^(import type \{ LearningModeConfig \} from '\.\/types')/m
    newSource = newSource.replace(importTypeRegex, `$1${eol}${CORRECT_IMPORT}${eol}`)
    importAdded++
  }

  if (newSource !== source) {
    writeFileSync(filePath, newSource, 'utf8')
  }
}
console.log('Path fixed:', pathFixed)
console.log('Import added:', importAdded)
