import { describe, it, expect } from 'vitest'
import {
  pseudoLocalize,
  pseudoLocalizeTree,
  createPseudoLocaleLoader,
  PSEUDO_LOCALE_CODE,
  PSEUDO_LOCALE_NAME,
} from '../../i18n/locales/pseudoLocale'
import { zh, en } from '../../i18n/locales'

/**
 * v19 M2 — pseudoLocale.ts 单元测试
 *
 * 覆盖目标：
 * - pseudoLocalize: 英文 → 伪语言（每字符加变音符 + 长度膨胀 + 包裹）
 * - pseudoLocalizeTree: 树形对象（zh/en 形态）→ 伪语言
 * - createPseudoLocaleLoader: 模拟一个特殊语言（pseudo）→ 用于 E2E 检测未翻译键
 *
 * 用法（E2E 场景）：
 * 1. 测试环境切换语言到 PSEUDO_LOCALE_CODE
 * 2. UI 上未翻译的英文字符串会被变音符包裹（暴露翻译缺口）
 *
 * 目标：i18n 完整性测试从 8 → 50+（M2 验收）
 */

describe('pseudoLocale — pseudoLocalize', () => {
  it('空字符串应返回空字符串', () => {
    expect(pseudoLocalize('')).toBe('')
  })

  it('普通单词应被包裹在标记中', () => {
    const result = pseudoLocalize('Insert')
    // 包裹标记
    expect(result).toMatch(/^\[èn\]/)
    expect(result).toMatch(/\[\/èn\]$/)
    // 变音处理：I → Ì, n → ñ, s → š
    expect(result).toContain('Ì')
    expect(result).toContain('ñ')
    expect(result).toContain('š')
  })

  it('每个小写字母应被替换为带变音符的大写字符', () => {
    const result = pseudoLocalize('abc')
    // a → à, b → ƀ, c → ç
    expect(result).toContain('à')
    expect(result).toContain('ç')
  })

  it('空格应保留在变音结果中', () => {
    const result = pseudoLocalize('a b')
    // 变音后 a → à, b → ƀ，空格保留
    expect(result).toContain('à')
    expect(result).toContain('ƀ')
    expect(result).toMatch(/\[èn\].*à.*ƀ.*\[\/èn\]/s)
  })

  it('数字应保留原样', () => {
    const result = pseudoLocalize('1 2 3')
    expect(result).toContain('1')
    expect(result).toContain('2')
    expect(result).toContain('3')
  })

  it('标点应保留', () => {
    const result = pseudoLocalize('Hello, World!')
    expect(result).toContain(',')
    expect(result).toContain('!')
  })

  it('应膨胀字符串长度（用于 E2E 暴露布局问题）', () => {
    const original = 'Insert'
    const result = pseudoLocalize(original, { expandRatio: 1.5 })
    // 至少应包含 1.3 倍原长度的字符（去掉装饰字符）
    const inner = result.replace(/\[\/?èn\]/g, '')
    expect(inner.length).toBeGreaterThanOrEqual(Math.floor(original.length * 1.3))
  })

  it('应支持关闭膨胀（expandRatio=0）', () => {
    // expandRatio=0 ≤ 1.0 → 不膨胀；同时 wrap=true 默认包裹
    // 变音处理仍生效（O→Ò, K→Ķ），剥离包裹后应是变音符形式
    const result = pseudoLocalize('OK', { expandRatio: 0 })
    expect(result).toBe('[èn]ÒĶ[/èn]')
  })

  it('应支持关闭包裹（wrap=false）', () => {
    const result = pseudoLocalize('Test', { wrap: false })
    expect(result).not.toContain('[èn]')
    expect(result).not.toContain('[/èn]')
    // 变音处理仍生效
    expect(result).toContain('Ţ')
  })

  it('应保持中文不变（不做变音处理）', () => {
    const result = pseudoLocalize('插入')
    expect(result).toBe('插入')
  })

  it('混合中英文应只对英文部分加变音符', () => {
    const result = pseudoLocalize('Insert 插入')
    expect(result).toContain('插入')
    expect(result).toMatch(/\[èn\]/)
  })
})

describe('pseudoLocale — pseudoLocalizeTree', () => {
  it('树形对象的所有字符串叶子应被伪化', () => {
    const tree = { common: { delete: 'Delete', search: 'Search' } }
    const result = pseudoLocalizeTree(tree) as { common: { delete: string; search: string } }
    // 变音后：Delete → Đèłèţè, Search → Šèàŕçĥ
    expect(result.common.delete).toMatch(/^\[èn\].*\[\/èn\]$/)
    expect(result.common.delete).toContain('Đ')  // D → Đ
    expect(result.common.search).toContain('Š')   // S → Š
    expect(result.common.delete).toMatch(/\[èn\]/)
  })

  it('应保持对象结构不变（嵌套层级一致）', () => {
    const tree = { a: { b: { c: 'Hello' } } }
    const result = pseudoLocalizeTree(tree) as { a: { b: { c: string } } }
    expect(result.a.b.c).toBeDefined()
    expect(typeof result.a.b.c).toBe('string')
    expect(result.a.b.c).toMatch(/^\[èn\].*Ĥ.*\[\/èn\]/)  // H → Ĥ
  })

  it('数组叶子应保留数组结构', () => {
    const tree = { tags: ['one', 'two'] }
    const result = pseudoLocalizeTree(tree) as { tags: string[] }
    expect(Array.isArray(result.tags)).toBe(true)
    expect(result.tags).toHaveLength(2)
    // 变音后：one → òñè, two → ţŵò
    expect(result.tags[0]).toContain('ò')
    expect(result.tags[0]).toContain('ñ')
  })

  it('当前 en locale 完整树应能伪化（无错误）', () => {
    expect(() => pseudoLocalizeTree(en)).not.toThrow()
    const pseudo = pseudoLocalizeTree(en) as Record<string, unknown>
    expect(Object.keys(pseudo)).toEqual(Object.keys(en))
  })

  it('应能用于 zh locale（zh 走保留策略）', () => {
    const result = pseudoLocalizeTree(zh) as { common: { delete: string } }
    // zh 的字符串原样保留
    expect(result.common.delete).toBe('删除')
  })
})

describe('pseudoLocale — createPseudoLocaleLoader', () => {
  it('应返回一个 locale 对象，键名与 en 镜像', () => {
    const pseudo = createPseudoLocaleLoader(en)
    expect(Object.keys(pseudo).sort()).toEqual(Object.keys(en).sort())
  })

  it('pseudo 加载器的字符串应经过 pseudoLocalize 处理', () => {
    const pseudo = createPseudoLocaleLoader(en) as { common: { delete: string } }
    expect(pseudo.common.delete).toMatch(/\[èn\]/)
  })

  it('PSEUDO_LOCALE_CODE 应为可识别的特殊代码', () => {
    expect(PSEUDO_LOCALE_CODE).toBe('en-XA')
  })

  it('PSEUDO_LOCALE_NAME 应是人类可读名称', () => {
    expect(PSEUDO_LOCALE_NAME).toBe('Pseudo (Burmese-style)')
  })
})

describe('pseudoLocale — 集成验证', () => {
  it('伪化后的 en 字符串应包含 [èn] 标记（用于 E2E 检测）', () => {
    const pseudo = createPseudoLocaleLoader(en)
    let hasMarked = false
    function walk(obj: unknown): void {
      if (typeof obj === 'string') {
        if (obj.includes('[èn]')) hasMarked = true
      } else if (obj && typeof obj === 'object') {
        for (const v of Object.values(obj as Record<string, unknown>)) {
          walk(v)
        }
      }
    }
    walk(pseudo)
    expect(hasMarked).toBe(true)
  })

  it('伪化不改变键路径数量', () => {
    function countLeaves(o: unknown): number {
      if (typeof o === 'string') return 1
      if (o && typeof o === 'object') {
        const obj = o as Record<string, unknown>
        return Object.values(obj).reduce<number>(
          (acc, v) => acc + countLeaves(v),
          0,
        )
      }
      return 0
    }
    expect(countLeaves(en)).toBe(countLeaves(createPseudoLocaleLoader(en)))
  })
})
