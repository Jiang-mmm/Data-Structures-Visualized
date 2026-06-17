import { describe, it, expect } from 'vitest'
import { zh, en } from '../i18n/locales'

function getKeys(obj: unknown, prefix = ''): string[] {
  const keys: string[] = []
  if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'string') {
        keys.push(fullKey)
      } else if (value && typeof value === 'object') {
        keys.push(...getKeys(value, fullKey))
      }
    }
  }
  return keys
}

const zhKeys = getKeys(zh).sort()
const enKeys = getKeys(en).sort()

describe('locales', () => {

  it('中文和英文应该有相同的键', () => {
    expect(zhKeys).toEqual(enKeys)
  })

  it('不应该有空的翻译值', () => {
    const emptyZh = zhKeys.filter(key => {
      const keys = key.split('.')
      let value: unknown = zh
      for (const k of keys) {
        value = (value as Record<string, unknown>)[k]
      }
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    expect(emptyZh).toEqual([])
  })

  it('英文不应该有空的翻译值', () => {
    const emptyEn = enKeys.filter(key => {
      const keys = key.split('.')
      let value: unknown = en
      for (const k of keys) {
        value = (value as Record<string, unknown>)[k]
      }
      return !value || (typeof value === 'string' && value.trim() === '')
    })
    expect(emptyEn).toEqual([])
  })

  it('应该包含所有数据结构的翻译', () => {
    const structures = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'graph', 'hash', 'heap', 'trie', 'sort']
    structures.forEach(s => {
      expect(zhKeys).toContain(`${s}.title`)
      expect(zhKeys).toContain(`${s}.subtitle`)
    })
  })

  it('应该包含所有通用操作的翻译', () => {
    const commonOps = ['common.delete', 'common.search', 'common.reset', 'common.undo', 'common.redo', 'common.clear']
    commonOps.forEach(key => {
      expect(zhKeys).toContain(key)
    })
  })

  it('应该包含所有错误消息的翻译', () => {
    const errorKeys = ['errors.invalidIndex', 'errors.indexOutOfRange', 'errors.animationError', 'errors.importFailed']
    errorKeys.forEach(key => {
      expect(zhKeys).toContain(key)
    })
  })

  it('logPanel.type 应该包含所有日志类型', () => {
    const typeKeys = ['logPanel.type.oper', 'logPanel.type.info', 'logPanel.type.error', 'logPanel.type.code']
    typeKeys.forEach(key => {
      expect(zhKeys).toContain(key)
    })
  })

  it('shortcuts 应该包含所有快捷键描述', () => {
    const shortcutKeys = ['shortcuts.undo', 'shortcuts.redo', 'shortcuts.reset', 'shortcuts.pause', 'shortcuts.toggleHelp']
    shortcutKeys.forEach(key => {
      expect(zhKeys).toContain(key)
    })
  })
})
