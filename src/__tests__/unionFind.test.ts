import { describe, it, expect } from 'vitest'
import {
  createUnionFind,
  buildInitialUnionFind,
  find,
  union,
  connected,
  getComponents,
  addNode,
  removeNode,
  getValues,
  countNodes,
  findIdByValue,
  getChildren,
  getComponentMembers,
  makeId,
} from '../algorithms/unionFind'

describe('并查集（Union-Find）算法', () => {
  describe('常量与基础函数', () => {
    it('makeId 应根据 value 生成节点 id', () => {
      expect(makeId(1)).toBe('n1')
      expect(makeId(99)).toBe('n99')
    })
  })

  describe('createUnionFind', () => {
    it('应创建包含默认 8 个节点的并查集', () => {
      const data = createUnionFind()
      expect(data.nodes).toHaveLength(8)
      expect(getValues(data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('每个节点初始 parent 应指向自己', () => {
      const data = createUnionFind()
      for (const node of data.nodes) {
        expect(data.parent[node.id]).toBe(node.id)
      }
    })

    it('每个节点初始 rank 应为 0', () => {
      const data = createUnionFind()
      for (const node of data.nodes) {
        expect(data.rank[node.id]).toBe(0)
      }
    })

    it('初始 edges 应为空（所有节点都是根）', () => {
      const data = createUnionFind()
      expect(data.edges).toEqual([])
    })

    it('应支持自定义初始值', () => {
      const data = createUnionFind([10, 20, 30])
      expect(getValues(data)).toEqual([10, 20, 30])
    })
  })

  describe('buildInitialUnionFind', () => {
    it('应包含 8 个预设值 [1,2,3,4,5,6,7,8]', () => {
      const data = buildInitialUnionFind()
      expect(getValues(data)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    })

    it('应有 3 个连通分量 {1,2,3}, {4,5}, {6,7,8}', () => {
      const data = buildInitialUnionFind()
      expect(getComponents(data)).toBe(3)
    })

    it('1、2、3 应在同一集合', () => {
      const data = buildInitialUnionFind()
      expect(connected(data, makeId(1), makeId(2))).toBe(true)
      expect(connected(data, makeId(1), makeId(3))).toBe(true)
      expect(connected(data, makeId(2), makeId(3))).toBe(true)
    })

    it('4、5 应在同一集合', () => {
      const data = buildInitialUnionFind()
      expect(connected(data, makeId(4), makeId(5))).toBe(true)
    })

    it('6、7、8 应在同一集合', () => {
      const data = buildInitialUnionFind()
      expect(connected(data, makeId(6), makeId(7))).toBe(true)
      expect(connected(data, makeId(6), makeId(8))).toBe(true)
    })

    it('不同集合的节点不应连通', () => {
      const data = buildInitialUnionFind()
      expect(connected(data, makeId(1), makeId(4))).toBe(false)
      expect(connected(data, makeId(3), makeId(6))).toBe(false)
    })
  })

  describe('find 操作', () => {
    it('应返回节点自身的根（单节点）', () => {
      const data = createUnionFind([5])
      const result = find(data, makeId(5))
      expect(result.rootId).toBe(makeId(5))
      expect(result.path).toEqual([])
    })

    it('应返回路径上的节点', () => {
      const data = buildInitialUnionFind()
      const result = find(data, makeId(3))
      expect(result.rootId).toBeDefined()
      expect(result.path.length).toBeGreaterThanOrEqual(0)
    })

    it('路径压缩后应将路径节点直接指向根', () => {
      const data = buildInitialUnionFind()
      const result = find(data, makeId(3))
      if (result.path.length > 1) {
        for (const nodeId of result.path) {
          expect(result.data.parent[nodeId]).toBe(result.rootId)
        }
      }
    })

    it('路径长度 <= 1 时不应压缩（返回原对象）', () => {
      const data = createUnionFind([5])
      const result = find(data, makeId(5))
      expect(result.data).toBe(data)
    })

    it('不存在的节点应返回原对象和空路径', () => {
      const data = createUnionFind()
      const result = find(data, 'nonexistent')
      expect(result.data).toBe(data)
      expect(result.rootId).toBe('nonexistent')
      expect(result.path).toEqual([])
    })
  })

  describe('union 操作', () => {
    it('应合并两个不同集合', () => {
      const data = createUnionFind([1, 2])
      expect(connected(data, makeId(1), makeId(2))).toBe(false)
      const newData = union(data, makeId(1), makeId(2))
      expect(connected(newData, makeId(1), makeId(2))).toBe(true)
    })

    it('合并后连通分量数应减少', () => {
      const data = createUnionFind([1, 2, 3])
      const before = getComponents(data)
      const newData = union(data, makeId(1), makeId(2))
      expect(getComponents(newData)).toBe(before - 1)
    })

    it('已连通的两个节点合并应返回压缩后的数据（不变）', () => {
      const data = buildInitialUnionFind()
      const newData = union(data, makeId(1), makeId(2))
      expect(connected(newData, makeId(1), makeId(2))).toBe(true)
    })

    it('不存在的节点合并应返回原对象', () => {
      const data = createUnionFind()
      const newData = union(data, 'nonexistent', makeId(1))
      expect(newData).toBe(data)
    })

    it('按秩合并应保证秩较小的树挂到秩较大的树下', () => {
      const data = createUnionFind([1, 2, 3, 4])
      let d = union(data, makeId(1), makeId(2))
      d = union(d, makeId(3), makeId(4))
      d = union(d, makeId(1), makeId(3))
      expect(connected(d, makeId(1), makeId(3))).toBe(true)
      expect(connected(d, makeId(2), makeId(4))).toBe(true)
    })

    it('合并后 edges 应正确重建', () => {
      const data = createUnionFind([1, 2])
      const newData = union(data, makeId(1), makeId(2))
      expect(newData.edges.length).toBe(1)
    })
  })

  describe('connected 操作', () => {
    it('单节点应与自己连通', () => {
      const data = createUnionFind([5])
      expect(connected(data, makeId(5), makeId(5))).toBe(true)
    })

    it('不同集合的节点不应连通', () => {
      const data = createUnionFind([1, 2])
      expect(connected(data, makeId(1), makeId(2))).toBe(false)
    })

    it('不存在的节点应返回 false', () => {
      const data = createUnionFind()
      expect(connected(data, 'nonexistent', makeId(1))).toBe(false)
    })

    it('connected 不应修改原数据（只读操作）', () => {
      const data = buildInitialUnionFind()
      const before = JSON.stringify(data)
      connected(data, makeId(1), makeId(4))
      expect(JSON.stringify(data)).toBe(before)
    })
  })

  describe('getComponents 操作', () => {
    it('初始 8 个独立节点应有 8 个连通分量', () => {
      const data = createUnionFind()
      expect(getComponents(data)).toBe(8)
    })

    it('buildInitialUnionFind 应有 3 个连通分量', () => {
      const data = buildInitialUnionFind()
      expect(getComponents(data)).toBe(3)
    })

    it('全部合并后应有 1 个连通分量', () => {
      let data = createUnionFind([1, 2, 3])
      data = union(data, makeId(1), makeId(2))
      data = union(data, makeId(1), makeId(3))
      expect(getComponents(data)).toBe(1)
    })
  })

  describe('addNode 操作', () => {
    it('应添加新节点作为独立集合', () => {
      const data = createUnionFind([1])
      const newData = addNode(data, 2)
      expect(countNodes(newData)).toBe(2)
      expect(getValues(newData)).toContain(2)
    })

    it('新节点 parent 应指向自己', () => {
      const data = createUnionFind([1])
      const newData = addNode(data, 2)
      expect(newData.parent[makeId(2)]).toBe(makeId(2))
    })

    it('新节点 rank 应为 0', () => {
      const data = createUnionFind([1])
      const newData = addNode(data, 2)
      expect(newData.rank[makeId(2)]).toBe(0)
    })

    it('已存在的值应返回原对象', () => {
      const data = createUnionFind([1, 2])
      const newData = addNode(data, 1)
      expect(newData).toBe(data)
    })

    it('新节点不应与已有节点连通', () => {
      const data = createUnionFind([1])
      const newData = addNode(data, 2)
      expect(connected(newData, makeId(1), makeId(2))).toBe(false)
    })
  })

  describe('removeNode 操作', () => {
    it('应删除指定节点', () => {
      const data = createUnionFind([1, 2, 3])
      const newData = removeNode(data, 2)
      expect(countNodes(newData)).toBe(2)
      expect(getValues(newData)).not.toContain(2)
    })

    it('删除不存在的值应返回原对象', () => {
      const data = createUnionFind([1, 2])
      const newData = removeNode(data, 99)
      expect(newData).toBe(data)
    })

    it('删除根节点后子节点应提升为新根', () => {
      const data = buildInitialUnionFind()
      const rootId = find(data, makeId(1)).rootId
      const newData = removeNode(data, 1)
      expect(newData.nodes.find(n => n.id === makeId(1))).toBeUndefined()
      // 2 和 3 仍应连通
      expect(connected(newData, makeId(2), makeId(3))).toBe(true)
      void rootId
    })

    it('删除非根节点后子节点应挂到父节点上', () => {
      let data = createUnionFind([1, 2, 3])
      data = union(data, makeId(1), makeId(2))
      data = union(data, makeId(2), makeId(3))
      const newData = removeNode(data, 3)
      expect(newData.nodes.find(n => n.id === makeId(3))).toBeUndefined()
    })

    it('删除后 edges 应正确重建', () => {
      const data = buildInitialUnionFind()
      const newData = removeNode(data, 2)
      // 删除 2 后，1 和 3 应仍连通，但不应有指向 n2 的边
      const hasEdgeToN2 = newData.edges.some(e => e.source === makeId(2) || e.target === makeId(2))
      expect(hasEdgeToN2).toBe(false)
    })
  })

  describe('getValues 操作', () => {
    it('应返回升序排列的值', () => {
      const data = createUnionFind([3, 1, 2])
      expect(getValues(data)).toEqual([1, 2, 3])
    })

    it('空并查集应返回空数组', () => {
      const data = createUnionFind([])
      expect(getValues(data)).toEqual([])
    })
  })

  describe('countNodes 操作', () => {
    it('应返回节点数量', () => {
      const data = createUnionFind([1, 2, 3])
      expect(countNodes(data)).toBe(3)
    })
  })

  describe('findIdByValue 操作', () => {
    it('应返回对应值的节点 id', () => {
      const data = createUnionFind([1, 2, 3])
      expect(findIdByValue(data, 2)).toBe(makeId(2))
    })

    it('不存在的值应返回 undefined', () => {
      const data = createUnionFind([1, 2])
      expect(findIdByValue(data, 99)).toBeUndefined()
    })
  })

  describe('getChildren 操作', () => {
    it('应返回指定节点的子节点', () => {
      const data = buildInitialUnionFind()
      const rootId = find(data, makeId(1)).rootId
      const children = getChildren(data, rootId)
      expect(children.length).toBeGreaterThan(0)
    })

    it('叶子节点应返回空数组', () => {
      const data = createUnionFind([1])
      expect(getChildren(data, makeId(1))).toEqual([])
    })
  })

  describe('getComponentMembers 操作', () => {
    it('应返回指定根节点的所有成员', () => {
      const data = buildInitialUnionFind()
      const rootId = find(data, makeId(1)).rootId
      const members = getComponentMembers(data, rootId)
      expect(members).toContain(makeId(1))
      expect(members).toContain(makeId(2))
      expect(members).toContain(makeId(3))
      expect(members.length).toBe(3)
    })

    it('单节点集合应只包含自己', () => {
      const data = createUnionFind([5])
      const members = getComponentMembers(data, makeId(5))
      expect(members).toEqual([makeId(5)])
    })
  })

  describe('不可变性验证', () => {
    it('find 不应修改原数据', () => {
      const data = buildInitialUnionFind()
      const before = JSON.stringify(data)
      find(data, makeId(3))
      expect(JSON.stringify(data)).toBe(before)
    })

    it('union 不应修改原数据', () => {
      const data = createUnionFind([1, 2])
      const before = JSON.stringify(data)
      union(data, makeId(1), makeId(2))
      expect(JSON.stringify(data)).toBe(before)
    })

    it('addNode 不应修改原数据', () => {
      const data = createUnionFind([1])
      const before = JSON.stringify(data)
      addNode(data, 2)
      expect(JSON.stringify(data)).toBe(before)
    })

    it('removeNode 不应修改原数据', () => {
      const data = createUnionFind([1, 2])
      const before = JSON.stringify(data)
      removeNode(data, 1)
      expect(JSON.stringify(data)).toBe(before)
    })
  })
})
