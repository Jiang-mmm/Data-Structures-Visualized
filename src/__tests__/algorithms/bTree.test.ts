import { describe, it, expect } from 'vitest'
import {
  cloneBTreeNode,
  createLeafNode,
  createInternalNode,
  insertBTree,
  searchBTree,
  inorderBTree,
  countBTreeNodes,
  countBTreeKeys,
  bTreeToFlattened,
  validateBTree,
  BTree,
  DEFAULT_ORDER,
  type BTreeNode,
} from '../../algorithms/bTree'

describe('B 树（BTree）算法', () => {
  describe('createLeafNode / createInternalNode', () => {
    it('应创建空叶子节点', () => {
      const node = createLeafNode()
      expect(node.keys).toEqual([])
      expect(node.children).toEqual([])
      expect(node.leaf).toBe(true)
    })

    it('应创建带 keys 的叶子节点', () => {
      const node = createLeafNode([1, 2, 3])
      expect(node.keys).toEqual([1, 2, 3])
      expect(node.children).toEqual([])
      expect(node.leaf).toBe(true)
    })

    it('应创建空内部节点', () => {
      const node = createInternalNode()
      expect(node.keys).toEqual([])
      expect(node.children).toEqual([])
      expect(node.leaf).toBe(false)
    })

    it('应创建带 keys 和 children 的内部节点', () => {
      const left = createLeafNode([5])
      const right = createLeafNode([15])
      const node = createInternalNode([10], [left, right])
      expect(node.keys).toEqual([10])
      expect(node.children).toHaveLength(2)
      expect(node.leaf).toBe(false)
    })
  })

  describe('cloneBTreeNode', () => {
    it('应深拷贝叶子节点', () => {
      const original = createLeafNode([1, 2])
      const clone = cloneBTreeNode(original)
      expect(clone).not.toBe(original)
      expect(clone.keys).not.toBe(original.keys)
      expect(clone.keys).toEqual([1, 2])
      expect(clone.leaf).toBe(true)
    })

    it('应深拷贝内部节点及其子节点', () => {
      const left = createLeafNode([5])
      const right = createLeafNode([15])
      const original = createInternalNode([10], [left, right])
      const clone = cloneBTreeNode(original)
      expect(clone).not.toBe(original)
      expect(clone.children[0]).not.toBe(original.children[0])
      expect(clone.children[1]).not.toBe(original.children[1])
      expect(clone.children[0].keys).toEqual([5])
      expect(clone.children[1].keys).toEqual([15])
    })
  })

  describe('insertBTree', () => {
    it('应在空树中创建根节点', () => {
      const root = insertBTree(null, 10)
      expect(root).not.toBeNull()
      expect(root!.keys).toEqual([10])
      expect(root!.leaf).toBe(true)
      expect(root!.children).toEqual([])
    })

    it('应按序插入多个 key 到根节点', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      expect(root!.keys).toEqual([10, 20])
      expect(root!.leaf).toBe(true)
    })

    it('应处理逆序插入', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 20)
      root = insertBTree(root, 10)
      expect(root!.keys).toEqual([10, 20])
    })

    it('应在节点满时触发分裂（order=3）', () => {
      // order=3, maxKeys=2，插入 3 个 key 应触发分裂
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      root = insertBTree(root, 30)
      // 分裂后根应有 1 个 key，2 个子节点
      expect(root!.keys).toEqual([20])
      expect(root!.leaf).toBe(false)
      expect(root!.children).toHaveLength(2)
      expect(root!.children[0].keys).toEqual([10])
      expect(root!.children[1].keys).toEqual([30])
    })

    it('应跳过重复 key', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 10)
      expect(root!.keys).toEqual([10])
      expect(countBTreeKeys(root)).toBe(1)
    })

    it('应在多次插入后维持 B 树性质', () => {
      let root: BTreeNode | null = null
      const values = [10, 20, 5, 6, 12, 30, 7, 17]
      for (const v of values) {
        root = insertBTree(root, v)
      }
      const validation = validateBTree(root, DEFAULT_ORDER)
      expect(validation.valid).toBe(true)
      expect(validation.allLeavesSameDepth).toBe(true)
      expect(validation.keyCountValid).toBe(true)
      expect(validation.keysSorted).toBe(true)
      expect(validation.childrenCorrect).toBe(true)
    })

    it('应在插入后中序遍历结果有序', () => {
      let root: BTreeNode | null = null
      const values = [50, 20, 80, 10, 30, 60, 90, 5, 15, 25, 35]
      for (const v of values) {
        root = insertBTree(root, v)
      }
      const result = inorderBTree(root)
      expect(result).toEqual([...values].sort((a, b) => a - b))
    })

    it('应支持自定义 order', () => {
      // order=4, maxKeys=3
      let root: BTreeNode | null = null
      root = insertBTree(root, 10, 4)
      root = insertBTree(root, 20, 4)
      root = insertBTree(root, 30, 4)
      // 3 个 key 仍未满（maxKeys=3），不分裂
      expect(root!.keys).toEqual([10, 20, 30])
      expect(root!.leaf).toBe(true)
      // 插入第 4 个触发分裂
      root = insertBTree(root, 40, 4)
      expect(root!.leaf).toBe(false)
      expect(root!.keys).toEqual([30])
    })

    it('不应修改原始 root（不可变更新）', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      const originalKeys = [...root!.keys]
      const newRoot = insertBTree(root, 30)
      // 原始 root 不应被修改
      expect(root!.keys).toEqual(originalKeys)
      // 新根应已分裂
      expect(newRoot.keys).not.toEqual(originalKeys)
    })
  })

  describe('searchBTree', () => {
    it('应在空树中查找返回 false', () => {
      const result = searchBTree(null, 10)
      expect(result.found).toBe(false)
      expect(result.path).toEqual([])
    })

    it('应找到存在的 key', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      root = insertBTree(root, 30)
      const result = searchBTree(root, 30)
      expect(result.found).toBe(true)
      expect(result.path.length).toBeGreaterThan(0)
    })

    it('应返回未找到的 key', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      const result = searchBTree(root, 999)
      expect(result.found).toBe(false)
    })

    it('应返回访问路径', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      root = insertBTree(root, 30)
      // 分裂后根为 [20]，查找 30 应先访问根再访问右子节点
      const result = searchBTree(root, 30)
      expect(result.path.length).toBe(2)
      expect(result.path[0]).toEqual([20])
      expect(result.path[1]).toEqual([30])
    })

    it('应在分裂后的树中正确查找', () => {
      let root: BTreeNode | null = null
      const values = [10, 20, 5, 6, 12, 30, 7, 17]
      for (const v of values) {
        root = insertBTree(root, v)
      }
      // 查找所有插入的值
      for (const v of values) {
        expect(searchBTree(root, v).found).toBe(true)
      }
      // 查找不存在的值
      expect(searchBTree(root, 999).found).toBe(false)
      expect(searchBTree(root, 1).found).toBe(false)
    })
  })

  describe('inorderBTree', () => {
    it('应返回空数组的空树', () => {
      expect(inorderBTree(null)).toEqual([])
    })

    it('应返回单节点树', () => {
      const root = createLeafNode([10])
      expect(inorderBTree(root)).toEqual([10])
    })

    it('应返回有序结果', () => {
      let root: BTreeNode | null = null
      const values = [50, 20, 80, 10, 30, 60, 90, 5, 15, 25, 35]
      for (const v of values) {
        root = insertBTree(root, v)
      }
      const result = inorderBTree(root)
      expect(result).toEqual([5, 10, 15, 20, 25, 30, 35, 50, 60, 80, 90])
    })
  })

  describe('countBTreeNodes / countBTreeKeys', () => {
    it('应在空树中返回 0', () => {
      expect(countBTreeNodes(null)).toBe(0)
      expect(countBTreeKeys(null)).toBe(0)
    })

    it('应正确统计单节点树', () => {
      const root = createLeafNode([1, 2, 3])
      expect(countBTreeNodes(root)).toBe(1)
      expect(countBTreeKeys(root)).toBe(3)
    })

    it('应正确统计分裂后的树', () => {
      let root: BTreeNode | null = null
      const values = [10, 20, 5, 6, 12, 30, 7, 17]
      for (const v of values) {
        root = insertBTree(root, v)
      }
      expect(countBTreeKeys(root)).toBe(values.length)
      expect(countBTreeNodes(root)).toBeGreaterThan(1)
    })
  })

  describe('bTreeToFlattened', () => {
    it('应在空树中返回空结构', () => {
      const result = bTreeToFlattened(null)
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })

    it('应扁平化单节点树', () => {
      const root = createLeafNode([10])
      const result = bTreeToFlattened(root)
      expect(result.nodes).toHaveLength(1)
      expect(result.nodes[0].keys).toEqual([10])
      expect(result.nodes[0].id).toBe('0')
      expect(result.nodes[0].parent).toBe('')
      expect(result.nodes[0].depth).toBe(0)
      expect(result.nodes[0].leaf).toBe(true)
      expect(result.edges).toEqual([])
    })

    it('应扁平化分裂后的树', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      root = insertBTree(root, 30)
      const result = bTreeToFlattened(root)
      // 根 + 2 个子节点
      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(2)
      // 根节点 id='0'，子节点 id='1' 和 '2'
      const rootNode = result.nodes.find((n) => n.id === '0')
      expect(rootNode).toBeDefined()
      expect(rootNode!.keys).toEqual([20])
      expect(rootNode!.childrenIds).toHaveLength(2)
      // 边应从根指向子节点
      expect(result.edges).toContainEqual({ from: '0', to: '1' })
      expect(result.edges).toContainEqual({ from: '0', to: '2' })
    })

    it('应正确设置 depth 和 parent', () => {
      let root: BTreeNode | null = null
      root = insertBTree(root, 10)
      root = insertBTree(root, 20)
      root = insertBTree(root, 30)
      const result = bTreeToFlattened(root)
      const rootNode = result.nodes.find((n) => n.depth === 0)
      const leafNodes = result.nodes.filter((n) => n.depth === 1)
      expect(rootNode).toBeDefined()
      expect(leafNodes).toHaveLength(2)
      for (const leaf of leafNodes) {
        expect(leaf.parent).toBe('0')
        expect(leaf.leaf).toBe(true)
      }
    })
  })

  describe('validateBTree', () => {
    it('应验证空树为合法', () => {
      const result = validateBTree(null)
      expect(result.valid).toBe(true)
    })

    it('应验证单节点树为合法', () => {
      const root = createLeafNode([10])
      const result = validateBTree(root)
      expect(result.valid).toBe(true)
    })

    it('应验证分裂后的树为合法', () => {
      let root: BTreeNode | null = null
      const values = [10, 20, 5, 6, 12, 30, 7, 17]
      for (const v of values) {
        root = insertBTree(root, v)
      }
      const result = validateBTree(root)
      expect(result.valid).toBe(true)
      expect(result.allLeavesSameDepth).toBe(true)
      expect(result.keyCountValid).toBe(true)
      expect(result.keysSorted).toBe(true)
      expect(result.childrenCorrect).toBe(true)
    })

    it('应检测无序 keys', () => {
      const root = createLeafNode([3, 1, 2])
      const result = validateBTree(root)
      expect(result.keysSorted).toBe(false)
      expect(result.valid).toBe(false)
    })
  })

  describe('BTree 类', () => {
    it('应创建空 B 树', () => {
      const tree = new BTree()
      expect(tree.root).toBeNull()
      expect(tree.order).toBe(DEFAULT_ORDER)
      expect(tree.nodeCount).toBe(0)
      expect(tree.keyCount).toBe(0)
    })

    it('应支持自定义 order', () => {
      const tree = new BTree(4)
      expect(tree.order).toBe(4)
    })

    it('应支持 insert 和 search', () => {
      const tree = new BTree()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      expect(tree.search(20).found).toBe(true)
      expect(tree.search(999).found).toBe(false)
    })

    it('应支持 inorder', () => {
      const tree = new BTree()
      const values = [50, 20, 80, 10, 30]
      for (const v of values) tree.insert(v)
      expect(tree.inorder()).toEqual([10, 20, 30, 50, 80])
    })

    it('应支持 nodeCount 和 keyCount', () => {
      const tree = new BTree()
      const values = [10, 20, 5, 6, 12, 30, 7, 17]
      for (const v of values) tree.insert(v)
      expect(tree.keyCount).toBe(values.length)
      expect(tree.nodeCount).toBeGreaterThan(1)
    })

    it('应支持 flatten', () => {
      const tree = new BTree()
      tree.insert(10)
      tree.insert(20)
      tree.insert(30)
      const flat = tree.flatten()
      expect(flat.nodes.length).toBeGreaterThan(0)
      expect(flat.edges.length).toBeGreaterThan(0)
    })

    it('应支持 validate', () => {
      const tree = new BTree()
      const values = [10, 20, 5, 6, 12, 30, 7, 17]
      for (const v of values) tree.insert(v)
      const result = tree.validate()
      expect(result.valid).toBe(true)
    })
  })
})
