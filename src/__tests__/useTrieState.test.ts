import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTrieState } from '../hooks/useTrieState'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useTrieState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该有初始数据结构（非空 root）', () => {
      const { result } = renderHook(() => useTrieState())
      expect(result.current.data).toBeDefined()
      expect(result.current.data.children).toBeDefined()
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useTrieState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useTrieState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('初始应该包含 5 个预设单词', () => {
      const { result } = renderHook(() => useTrieState())
      expect(result.current.wordCount()).toBe(5)
    })
  })

  describe('insert 操作', () => {
    it('应该插入新单词到 Trie', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('apple') })
      expect(result.current.wordCount()).toBe(6)
    })

    it('应该拒绝空字符串插入', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('') })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该拒绝非字符串插入', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert(123 as unknown as string) })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该拒绝 null/undefined 插入', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert(null as unknown as string) })
      expect(result.current.wordCount()).toBe(5)
      act(() => { result.current.insert(undefined as unknown as string) })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该过滤掉非字母字符', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('test123') })
      let searchResult: { found: boolean; path?: string[] }
      act(() => { searchResult = result.current.search('test') })
      expect(searchResult.found).toBe(true)
    })

    it('应该转换为小写存储', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('HELLO') })
      let searchResult: { found: boolean; path?: string[] }
      act(() => { searchResult = result.current.search('hello') })
      expect(searchResult.found).toBe(true)
    })

    it('应该支持插入共享前缀的单词', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('car') })
      act(() => { result.current.insert('card') })
      act(() => { result.current.insert('care') })
      expect(result.current.wordCount()).toBe(7)
    })
  })

  describe('remove 操作', () => {
    it('应该删除存在的单词', () => {
      const { result } = renderHook(() => useTrieState())
      expect(result.current.wordCount()).toBe(5)
      act(() => { result.current.remove('cat') })
      expect(result.current.wordCount()).toBe(4)
    })

    it('删除不存在的单词应该保持原样', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.remove('xyz') })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该删除共享前缀单词的其中一个', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('card') })
      expect(result.current.wordCount()).toBe(6)
      act(() => { result.current.remove('card') })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该拒绝空字符串删除', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.remove('') })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该拒绝非字符串删除', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.remove(123 as unknown as string) })
      expect(result.current.wordCount()).toBe(5)
    })
  })

  describe('search 操作', () => {
    it('应该找到存在的单词', () => {
      const { result } = renderHook(() => useTrieState())
      let searchResult: { found: boolean; path?: string[] }
      act(() => { searchResult = result.current.search('cat') })
      expect(searchResult.found).toBe(true)
    })

    it('应该返回未找到对于不存在的单词', () => {
      const { result } = renderHook(() => useTrieState())
      let searchResult: { found: boolean; path?: string[] }
      act(() => { searchResult = result.current.search('bird') })
      expect(searchResult.found).toBe(false)
    })

    it('应该区分完整单词和前缀', () => {
      const { result } = renderHook(() => useTrieState())
      let carResult: { found: boolean; path?: string[] }
      act(() => { carResult = result.current.search('car') })
      expect(carResult.found).toBe(true)
    })

    it('应该返回空路径对于无效输入', () => {
      const { result } = renderHook(() => useTrieState())
      const searchResult = result.current.search('')
      expect(searchResult.found).toBe(false)
      expect(searchResult.path).toEqual([])
    })

    it('应该返回空路径对于非字符串输入', () => {
      const { result } = renderHook(() => useTrieState())
      const searchResult = result.current.search(123 as unknown as string)
      expect(searchResult.found).toBe(false)
    })
  })

  describe('searchPrefix 操作', () => {
    it('应该找到前缀匹配的单词', () => {
      const { result } = renderHook(() => useTrieState())
      let prefixResult: { found: boolean; words: string[] }
      act(() => { prefixResult = result.current.searchPrefix('ca') })
      expect(prefixResult.found).toBe(true)
      expect(prefixResult.words).toContain('cat')
      expect(prefixResult.words).toContain('car')
      expect(prefixResult.words).toContain('cart')
    })

    it('应该返回所有匹配单词', () => {
      const { result } = renderHook(() => useTrieState())
      let prefixResult: { found: boolean; words: string[] }
      act(() => { prefixResult = result.current.searchPrefix('d') })
      expect(prefixResult.words).toContain('dog')
      expect(prefixResult.words).toContain('dot')
    })

    it('应该返回空数组对于无前缀匹配', () => {
      const { result } = renderHook(() => useTrieState())
      let prefixResult: { found: boolean; words: string[] }
      act(() => { prefixResult = result.current.searchPrefix('xyz') })
      expect(prefixResult.found).toBe(false)
      expect(prefixResult.words).toEqual([])
    })

    it('应该返回空数组对于无效输入', () => {
      const { result } = renderHook(() => useTrieState())
      const prefixResult = result.current.searchPrefix('')
      expect(prefixResult.words).toEqual([])
    })
  })

  describe('getFlattened 操作', () => {
    it('应该返回包含 nodes 和 edges 的扁平化结构', () => {
      const { result } = renderHook(() => useTrieState())
      const flattened = result.current.getFlattened()
      expect(flattened.nodes).toBeDefined()
      expect(flattened.edges).toBeDefined()
      expect(Array.isArray(flattened.nodes)).toBe(true)
      expect(Array.isArray(flattened.edges)).toBe(true)
    })

    it('应该包含根节点', () => {
      const { result } = renderHook(() => useTrieState())
      const flattened = result.current.getFlattened()
      const rootNode = flattened.nodes.find((n: { id: string }) => n.id === 'root')
      expect(rootNode).toBeDefined()
    })

    it('节点数应该大于初始单词数', () => {
      const { result } = renderHook(() => useTrieState())
      const flattened = result.current.getFlattened()
      expect(flattened.nodes.length).toBeGreaterThan(5)
    })
  })

  describe('reset 操作', () => {
    it('应该重置为初始状态', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('newword') })
      expect(result.current.wordCount()).toBe(6)
      act(() => { result.current.reset() })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('newword') })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销插入操作', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('newword') })
      expect(result.current.wordCount()).toBe(6)
      act(() => { result.current.undo() })
      expect(result.current.wordCount()).toBe(5)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('newword') })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.wordCount()).toBe(6)
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useTrieState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.insert('newword') })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })
  })

  describe('loadData 操作', () => {
    it('应该加载新 Trie 数据', () => {
      const { result } = renderHook(() => useTrieState())
      const newTrie = result.current.data
      act(() => { result.current.insert('testdata') })
      act(() => { result.current.loadData(newTrie) })
      expect(result.current.data).toEqual(newTrie)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useTrieState())
      act(() => { result.current.insert('newword') })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.loadData(result.current.data) })
      expect(result.current.logs).toEqual([])
    })
  })
})
