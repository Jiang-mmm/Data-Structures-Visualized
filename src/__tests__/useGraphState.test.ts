import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGraphState } from '../hooks/useGraphState'
import { INITIAL_NODES, INITIAL_LINKS } from '../visualizers/graphVisualizer'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('useGraphState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始化状态', () => {
    it('应该使用初始节点数据', () => {
      const { result } = renderHook(() => useGraphState())
      expect(result.current.nodes.length).toBe(INITIAL_NODES.length)
      expect(result.current.nodes[0].id).toBe(INITIAL_NODES[0].id)
    })

    it('应该使用初始边数据', () => {
      const { result } = renderHook(() => useGraphState())
      expect(result.current.links.length).toBe(INITIAL_LINKS.length)
    })

    it('应该有初始空日志', () => {
      const { result } = renderHook(() => useGraphState())
      expect(result.current.logs).toEqual([])
    })

    it('isAnimating 应该初始为 false', () => {
      const { result } = renderHook(() => useGraphState())
      expect(result.current.isAnimating).toBe(false)
    })

    it('viewMode 应该初始为 force', () => {
      const { result } = renderHook(() => useGraphState())
      expect(result.current.viewMode).toBe('force')
    })
  })

  describe('addNode 操作', () => {
    it('应该添加新节点', () => {
      const { result } = renderHook(() => useGraphState())
      const initialCount = result.current.nodes.length
      act(() => { result.current.addNode() })
      expect(result.current.nodes.length).toBe(initialCount + 1)
    })

    it('应该为新节点生成唯一 id', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addNode() })
      const newId = result.current.nodes[result.current.nodes.length - 1].id
      expect(newId).toBeDefined()
    })

    it('应该为新节点分配 group', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addNode() })
      const newNode = result.current.nodes[result.current.nodes.length - 1]
      expect(newNode.group).toBeDefined()
      expect(newNode.group).toBeGreaterThanOrEqual(0)
      expect(newNode.group).toBeLessThan(3)
    })
  })

  describe('addEdge 操作', () => {
    it('应该添加新边', () => {
      const { result } = renderHook(() => useGraphState())
      const initialCount = result.current.links.length
      let success = false as boolean
      act(() => { success = result.current.addEdge('A', 'D') })
      expect(success).toBe(true)
      expect(result.current.links.length).toBe(initialCount + 1)
    })

    it('应该拒绝连接自身', () => {
      const { result } = renderHook(() => useGraphState())
      let success = false as boolean
      act(() => { success = result.current.addEdge('A', 'A') })
      expect(success).toBe(false)
    })

    it('应该拒绝已存在的边', () => {
      const { result } = renderHook(() => useGraphState())
      let success = false as boolean
      act(() => { success = result.current.addEdge('A', 'B') })
      expect(success).toBe(false)
    })

    it('应该设置默认权重为 1', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addEdge('A', 'D') })
      const newEdge = result.current.links[result.current.links.length - 1]
      expect(newEdge.weight).toBe(1)
    })

    it('应该使用自定义权重', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addEdge('A', 'D', 10) })
      const newEdge = result.current.links[result.current.links.length - 1]
      expect(newEdge.weight).toBe(10)
    })
  })

  describe('deleteNode 操作', () => {
    it('应该删除指定节点', () => {
      const { result } = renderHook(() => useGraphState())
      const nodeIds = result.current.nodes.map(n => n.id)
      act(() => { result.current.deleteNode(nodeIds[0]) })
      expect(result.current.nodes.find(n => n.id === nodeIds[0])).toBeUndefined()
    })

    it('应该删除与节点相关的所有边', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.deleteNode('A') })
      const relatedEdges = result.current.links.filter(l => {
        const s = (l.source as { id?: string })?.id || l.source as string
        const t = (l.target as { id?: string })?.id || l.target as string
        return s === 'A' || t === 'A'
      })
      expect(relatedEdges.length).toBe(0)
    })
  })

  describe('deleteEdge 操作', () => {
    it('应该删除指定边', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.deleteEdge('A', 'B') })
      const edge = result.current.links.find(l => {
        const s = (l.source as { id?: string })?.id || l.source as string
        const t = (l.target as { id?: string })?.id || l.target as string
        return (s === 'A' && t === 'B') || (s === 'B' && t === 'A')
      })
      expect(edge).toBeUndefined()
    })
  })

  describe('bfs 操作', () => {
    it('应该添加 BFS 日志', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.bfs('A') })
      expect(result.current.logs.length).toBeGreaterThan(0)
      expect(result.current.logs[0].message).toContain('BFS')
    })
  })

  describe('dfs 操作', () => {
    it('应该添加 DFS 日志', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.dfs('A') })
      expect(result.current.logs.length).toBeGreaterThan(0)
      expect(result.current.logs[0].message).toContain('DFS')
    })
  })

  describe('dijkstra 操作', () => {
    it('应该添加 Dijkstra 日志', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.dijkstra('A', 'D') })
      expect(result.current.logs.length).toBeGreaterThan(0)
      expect(result.current.logs[0].message).toContain('Dijkstra')
    })
  })

  describe('reset 操作', () => {
    it('应该重置节点为初始状态', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addNode() })
      expect(result.current.nodes.length).toBe(INITIAL_NODES.length + 1)
      act(() => { result.current.reset() })
      expect(result.current.nodes.length).toBe(INITIAL_NODES.length)
    })

    it('应该重置边为初始状态', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addEdge('A', 'D') })
      act(() => { result.current.reset() })
      expect(result.current.links.length).toBe(INITIAL_LINKS.length)
    })

    it('应该清空日志', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addNode() })
      expect(result.current.logs.length).toBeGreaterThan(0)
      act(() => { result.current.reset() })
      expect(result.current.logs).toEqual([])
    })
  })

  describe('撤销/重做', () => {
    it('应该支持撤销节点添加操作', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addNode() })
      const countAfterAdd = result.current.nodes.length
      act(() => { result.current.undo() })
      expect(result.current.nodes.length).toBe(countAfterAdd - 1)
    })

    it('应该支持重做操作', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.addNode() })
      act(() => { result.current.undo() })
      act(() => { result.current.redo() })
      expect(result.current.nodes.length).toBe(INITIAL_NODES.length + 1)
    })

    it('应该正确报告 canUndo/canRedo', () => {
      const { result } = renderHook(() => useGraphState())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.addNode() })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => { result.current.undo() })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })
  })

  describe('getAdjacencyMatrix', () => {
    it('应该返回正确的邻接矩阵', () => {
      const { result } = renderHook(() => useGraphState())
      const { ids, matrix } = result.current.getAdjacencyMatrix()
      expect(ids.length).toBe(INITIAL_NODES.length)
      expect(matrix.length).toBe(INITIAL_NODES.length)
      expect(matrix[0].length).toBe(INITIAL_NODES.length)
    })
  })

  describe('getAdjacencyList', () => {
    it('应该返回正确的邻接表', () => {
      const { result } = renderHook(() => useGraphState())
      const adj = result.current.getAdjacencyList()
      expect(Object.keys(adj).length).toBe(INITIAL_NODES.length)
    })
  })

  describe('setViewMode', () => {
    it('应该更新 viewMode', () => {
      const { result } = renderHook(() => useGraphState())
      act(() => { result.current.setViewMode('matrix') })
      expect(result.current.viewMode).toBe('matrix')
    })
  })
})
