import { describe, it, expect } from 'vitest'
import {
  buildSegmentTree,
  querySegmentTree,
  querySegmentTreeWithPath,
  updateSegmentTree,
  updateSegmentTreeWithPath,
  countSegmentTreeNodes,
  getSegmentTreeHeight,
  segmentTreeToFlattened,
  validateSegmentTree,
  SegmentTree,
  DEFAULT_ARRAY,
  type SegmentTreeNode,
} from '../../algorithms/segmentTree'

describe('线段树（Segment Tree）算法', () => {
  describe('buildSegmentTree', () => {
    it('空数组应返回 null', () => {
      expect(buildSegmentTree([])).toBeNull()
    })

    it('单元素数组应构建只有根节点的树', () => {
      const root = buildSegmentTree([42])
      expect(root).not.toBeNull()
      expect(root!.start).toBe(0)
      expect(root!.end).toBe(0)
      expect(root!.sum).toBe(42)
      expect(root!.left).toBeNull()
      expect(root!.right).toBeNull()
    })

    it('应正确构建多元素线段树，根节点 sum 等于数组总和', () => {
      const arr = [1, 2, 3, 4]
      const root = buildSegmentTree(arr)
      expect(root!.sum).toBe(10)
      expect(root!.start).toBe(0)
      expect(root!.end).toBe(3)
    })

    it('应正确构建默认数组', () => {
      const root = buildSegmentTree(DEFAULT_ARRAY)
      const expectedSum = DEFAULT_ARRAY.reduce((a, b) => a + b, 0)
      expect(root!.sum).toBe(expectedSum)
      expect(root!.start).toBe(0)
      expect(root!.end).toBe(DEFAULT_ARRAY.length - 1)
    })

    it('奇数长度数组也应正确构建', () => {
      const arr = [1, 2, 3]
      const root = buildSegmentTree(arr)
      expect(root!.sum).toBe(6)
      expect(root!.start).toBe(0)
      expect(root!.end).toBe(2)
    })
  })

  describe('querySegmentTree', () => {
    it('null 根节点应返回 0', () => {
      expect(querySegmentTree(null, 0, 1)).toBe(0)
    })

    it('应正确查询整个区间', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      expect(querySegmentTree(root, 0, 3)).toBe(10)
    })

    it('应正确查询单个元素', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      expect(querySegmentTree(root, 2, 2)).toBe(3)
    })

    it('应正确查询子区间', () => {
      const root = buildSegmentTree([1, 2, 3, 4, 5, 6, 7, 8])
      expect(querySegmentTree(root, 2, 5)).toBe(3 + 4 + 5 + 6)
    })

    it('无交集查询应返回 0', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      expect(querySegmentTree(root, 5, 10)).toBe(0)
    })

    it('部分交集查询应正确返回', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      expect(querySegmentTree(root, 1, 5)).toBe(2 + 3 + 4)
    })
  })

  describe('querySegmentTreeWithPath', () => {
    it('应返回求和结果和访问路径', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const result = querySegmentTreeWithPath(root, 1, 2)
      expect(result.sum).toBe(5)
      expect(result.path.length).toBeGreaterThan(0)
      expect(result.path[0]).toEqual({ start: 0, end: 3, sum: 10 })
    })

    it('null 根节点应返回 sum=0 和空路径', () => {
      const result = querySegmentTreeWithPath(null, 0, 1)
      expect(result.sum).toBe(0)
      expect(result.path).toEqual([])
    })

    it('路径中每个节点应包含 start、end、sum 字段', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const result = querySegmentTreeWithPath(root, 0, 3)
      for (const step of result.path) {
        expect(step).toHaveProperty('start')
        expect(step).toHaveProperty('end')
        expect(step).toHaveProperty('sum')
      }
    })
  })

  describe('updateSegmentTree', () => {
    it('null 根节点应返回 null', () => {
      expect(updateSegmentTree(null, 0, 10)).toBeNull()
    })

    it('应正确更新叶子节点并保持不可变性', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const originalSum = root!.sum
      const newRoot = updateSegmentTree(root, 1, 20)
      // 原树不应被修改
      expect(root!.sum).toBe(originalSum)
      expect(root!.left!.right!.sum).toBe(2)
      // 新树应反映更新
      expect(newRoot!.sum).toBe(1 + 20 + 3 + 4)
      expect(querySegmentTree(newRoot, 1, 1)).toBe(20)
    })

    it('更新后所有相关父节点 sum 应正确重新计算', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const newRoot = updateSegmentTree(root, 0, 100)
      expect(newRoot!.sum).toBe(100 + 2 + 3 + 4)
      expect(querySegmentTree(newRoot, 0, 0)).toBe(100)
      expect(querySegmentTree(newRoot, 0, 3)).toBe(100 + 2 + 3 + 4)
    })

    it('更新右子树应正确传播', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const newRoot = updateSegmentTree(root, 3, 100)
      expect(newRoot!.sum).toBe(1 + 2 + 3 + 100)
      expect(querySegmentTree(newRoot, 3, 3)).toBe(100)
    })
  })

  describe('updateSegmentTreeWithPath', () => {
    it('应返回新根节点和访问路径', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const result = updateSegmentTreeWithPath(root, 1, 20)
      expect(result.root).not.toBeNull()
      expect(result.root!.sum).toBe(1 + 20 + 3 + 4)
      expect(result.path.length).toBeGreaterThan(0)
      expect(result.path[0]).toEqual({ start: 0, end: 3, sum: 10 })
    })

    it('null 根节点应返回 null 和空路径', () => {
      const result = updateSegmentTreeWithPath(null, 0, 10)
      expect(result.root).toBeNull()
      expect(result.path).toEqual([])
    })
  })

  describe('countSegmentTreeNodes', () => {
    it('null 根节点应返回 0', () => {
      expect(countSegmentTreeNodes(null)).toBe(0)
    })

    it('应正确统计节点数（n 个叶子，n-1 个内部节点，共 2n-1）', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      // 4 个叶子 + 3 个内部节点 = 7
      expect(countSegmentTreeNodes(root)).toBe(7)
    })

    it('单元素数组应有 1 个节点', () => {
      const root = buildSegmentTree([42])
      expect(countSegmentTreeNodes(root)).toBe(1)
    })

    it('8 元素数组应有 15 个节点', () => {
      const root = buildSegmentTree(DEFAULT_ARRAY)
      expect(countSegmentTreeNodes(root)).toBe(15)
    })
  })

  describe('getSegmentTreeHeight', () => {
    it('null 根节点应返回 0', () => {
      expect(getSegmentTreeHeight(null)).toBe(0)
    })

    it('单元素数组高度应为 1', () => {
      const root = buildSegmentTree([42])
      expect(getSegmentTreeHeight(root)).toBe(1)
    })

    it('4 元素数组高度应为 3', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      expect(getSegmentTreeHeight(root)).toBe(3)
    })

    it('8 元素数组高度应为 4', () => {
      const root = buildSegmentTree(DEFAULT_ARRAY)
      expect(getSegmentTreeHeight(root)).toBe(4)
    })
  })

  describe('segmentTreeToFlattened', () => {
    it('null 根节点应返回空节点和边', () => {
      const result = segmentTreeToFlattened(null, [])
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
      expect(result.originalArray).toEqual([])
    })

    it('应正确扁平化线段树（节点数 = 2n-1）', () => {
      const arr = [1, 2, 3, 4]
      const root = buildSegmentTree(arr)
      const flat = segmentTreeToFlattened(root, arr)
      expect(flat.nodes).toHaveLength(7)
      // 4 个叶子，3 个内部节点，边数 = 节点数 - 1 = 6
      expect(flat.edges).toHaveLength(6)
      expect(flat.originalArray).toEqual(arr)
    })

    it('根节点 id 应为 "0"，level 为 0，parent 为空', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const flat = segmentTreeToFlattened(root, [1, 2, 3, 4])
      const rootNode = flat.nodes[0]
      expect(rootNode.id).toBe('0')
      expect(rootNode.level).toBe(0)
      expect(rootNode.parent).toBe('')
      expect(rootNode.isLeaf).toBe(false)
    })

    it('叶子节点应标记 isLeaf=true', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const flat = segmentTreeToFlattened(root, [1, 2, 3, 4])
      const leaves = flat.nodes.filter((n) => n.isLeaf)
      expect(leaves).toHaveLength(4)
      for (const leaf of leaves) {
        expect(leaf.start).toBe(leaf.end)
      }
    })

    it('每个非根节点应有一条入边', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const flat = segmentTreeToFlattened(root, [1, 2, 3, 4])
      const nonRootNodes = flat.nodes.filter((n) => n.parent !== '')
      expect(flat.edges.length).toBe(nonRootNodes.length)
    })

    it('节点应包含 childrenIds 数组', () => {
      const root = buildSegmentTree([1, 2, 3, 4])
      const flat = segmentTreeToFlattened(root, [1, 2, 3, 4])
      const rootNode = flat.nodes[0]
      expect(rootNode.childrenIds).toHaveLength(2)
      const leaves = flat.nodes.filter((n) => n.isLeaf)
      for (const leaf of leaves) {
        expect(leaf.childrenIds).toEqual([])
      }
    })
  })

  describe('validateSegmentTree', () => {
    it('应验证正确构建的线段树', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8]
      const root = buildSegmentTree(arr)
      const result = validateSegmentTree(root, arr)
      expect(result.valid).toBe(true)
      expect(result.sumCorrect).toBe(true)
      expect(result.leafCorrect).toBe(true)
      expect(result.rangeContinuous).toBe(true)
      expect(result.rangeContained).toBe(true)
    })

    it('null 根节点应通过验证', () => {
      const result = validateSegmentTree(null, [])
      expect(result.valid).toBe(true)
    })

    it('应检测出错误的 sum（手动篡改）', () => {
      const arr = [1, 2, 3, 4]
      const root = buildSegmentTree(arr)
      // 篡改根节点 sum
      const badRoot: SegmentTreeNode = { ...root!, sum: 999 }
      const result = validateSegmentTree(badRoot, arr)
      expect(result.sumCorrect).toBe(false)
      expect(result.valid).toBe(false)
    })
  })

  describe('SegmentTree 类', () => {
    it('默认构造应使用 DEFAULT_ARRAY', () => {
      const tree = new SegmentTree()
      expect(tree.array).toEqual(DEFAULT_ARRAY)
      expect(tree.root).not.toBeNull()
      expect(tree.nodeCount).toBe(15)
    })

    it('应支持自定义数组构造', () => {
      const tree = new SegmentTree([1, 2, 3])
      expect(tree.array).toEqual([1, 2, 3])
      expect(tree.root!.sum).toBe(6)
    })

    it('build 方法应从新数组重建', () => {
      const tree = new SegmentTree([1, 2])
      tree.build([10, 20, 30, 40])
      expect(tree.array).toEqual([10, 20, 30, 40])
      expect(tree.root!.sum).toBe(100)
    })

    it('query 方法应返回区间和', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      expect(tree.query(0, 4)).toBe(15)
      expect(tree.query(1, 3)).toBe(9)
      expect(tree.query(2, 2)).toBe(3)
    })

    it('update 方法应更新值并同步 array', () => {
      const tree = new SegmentTree([1, 2, 3, 4])
      tree.update(1, 20)
      expect(tree.array[1]).toBe(20)
      expect(tree.query(0, 3)).toBe(1 + 20 + 3 + 4)
      expect(tree.query(1, 1)).toBe(20)
    })

    it('nodeCount 和 height getter 应正确返回', () => {
      const tree = new SegmentTree([1, 2, 3, 4])
      expect(tree.nodeCount).toBe(7)
      expect(tree.height).toBe(3)
    })

    it('flatten 方法应返回扁平化结构', () => {
      const tree = new SegmentTree([1, 2, 3, 4])
      const flat = tree.flatten()
      expect(flat.nodes).toHaveLength(7)
      expect(flat.edges).toHaveLength(6)
      expect(flat.originalArray).toEqual([1, 2, 3, 4])
    })

    it('validate 方法应通过验证', () => {
      const tree = new SegmentTree([1, 2, 3, 4, 5])
      const result = tree.validate()
      expect(result.valid).toBe(true)
    })
  })
})
