import { describe, it, expect } from 'vitest'
import {
  createNode,
  deepClone,
  insertRedBlack,
  fixInsert,
  rotateLeft,
  rotateRight,
  searchRedBlack,
  inorderRedBlack,
  countNodes,
  flattenRedBlack,
  buildInitialRedBlackTree,
  validateRedBlack,
  getBlackHeight,
  type RedBlackNode,
} from '../algorithms/redBlackTree'

describe('红黑树（RedBlackTree）算法', () => {
  describe('createNode', () => {
    it('应创建默认红色节点', () => {
      const node = createNode(42)
      expect(node.value).toBe(42)
      expect(node.color).toBe('red')
      expect(node.left).toBeNull()
      expect(node.right).toBeNull()
      expect(node.parent).toBeNull()
    })

    it('应创建指定颜色节点', () => {
      const node = createNode(42, 'black')
      expect(node.color).toBe('black')
    })

    it('应生成唯一 id', () => {
      const n1 = createNode(1)
      const n2 = createNode(2)
      expect(n1.id).not.toBe(n2.id)
    })
  })

  describe('deepClone', () => {
    it('应深拷贝空树', () => {
      expect(deepClone(null)).toBeNull()
    })

    it('应深拷贝单节点树', () => {
      const node = createNode(42, 'black')
      const clone = deepClone(node) as RedBlackNode
      expect(clone.value).toBe(42)
      expect(clone.color).toBe('black')
      expect(clone).not.toBe(node)
    })

    it('应保留 parent 指针关系', () => {
      const root = createNode(50, 'black')
      const left = createNode(30, 'red')
      root.left = left
      left.parent = root
      const clone = deepClone(root) as RedBlackNode
      expect(clone.left).not.toBe(left)
      expect(clone.left?.parent).toBe(clone)
    })

    it('应保留 id', () => {
      const node = createNode(42, 'black')
      const clone = deepClone(node) as RedBlackNode
      expect(clone.id).toBe(node.id)
    })
  })

  describe('rotateLeft / rotateRight', () => {
    it('左旋应正确调整结构', () => {
      // 构造：x(10) -> right: y(20)
      const x = createNode(10, 'black')
      const y = createNode(20, 'red')
      x.right = y
      y.parent = x
      const newRoot = rotateLeft(x, x)
      // 旋转后 y 应为根，x 为 y 的左孩子
      expect(newRoot).toBe(y)
      expect(y.left).toBe(x)
      expect(x.parent).toBe(y)
    })

    it('右旋应正确调整结构', () => {
      // 构造：y(20) -> left: x(10)
      const y = createNode(20, 'black')
      const x = createNode(10, 'red')
      y.left = x
      x.parent = y
      const newRoot = rotateRight(y, y)
      // 旋转后 x 应为根，y 为 x 的右孩子
      expect(newRoot).toBe(x)
      expect(x.right).toBe(y)
      expect(y.parent).toBe(x)
    })

    it('左旋应保留 BST 中序遍历', () => {
      const x = createNode(10, 'black')
      const y = createNode(20, 'red')
      x.right = y
      y.parent = x
      const newRoot = rotateLeft(x, x)
      const inorder = inorderRedBlack(newRoot)
      expect(inorder).toEqual([10, 20])
    })
  })

  describe('insertRedBlack', () => {
    it('插入到空树应返回黑色根节点', () => {
      const root = insertRedBlack(null, 42)
      expect(root).not.toBeNull()
      expect(root?.color).toBe('black')
      expect(root?.value).toBe(42)
    })

    it('插入新值应增加节点数', () => {
      let root: RedBlackNode | null = null
      root = insertRedBlack(root, 10)
      const before = countNodes(root)
      root = insertRedBlack(root, 20)
      expect(countNodes(root)).toBe(before + 1)
    })

    it('插入重复值应返回原对象（不变）', () => {
      let root: RedBlackNode | null = null
      root = insertRedBlack(root, 10)
      const newData = insertRedBlack(root, 10)
      expect(newData).toBe(root)
    })

    it('插入应保持不可变性（不修改原对象）', () => {
      let root: RedBlackNode | null = null
      root = insertRedBlack(root, 10)
      const originalCount = countNodes(root)
      insertRedBlack(root, 20)
      expect(countNodes(root)).toBe(originalCount)
    })

    it('插入后应保持 BST 中序有序', () => {
      let root: RedBlackNode | null = null
      const values = [50, 30, 70, 20, 40, 60, 80]
      for (const v of values) {
        root = insertRedBlack(root, v)
      }
      expect(inorderRedBlack(root)).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('插入后根节点应为黑色（性质 2）', () => {
      let root: RedBlackNode | null = null
      for (const v of [50, 30, 70, 20, 40, 60, 80]) {
        root = insertRedBlack(root, v)
      }
      expect(root?.color).toBe('black')
    })

    it('插入后不应有连续红色节点（性质 4）', () => {
      let root: RedBlackNode | null = null
      for (const v of [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]) {
        root = insertRedBlack(root, v)
      }
      const result = validateRedBlack(root)
      expect(result.noConsecutiveRed).toBe(true)
    })

    it('插入后所有路径黑色高度应一致（性质 5）', () => {
      let root: RedBlackNode | null = null
      for (const v of [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 45]) {
        root = insertRedBlack(root, v)
      }
      const result = validateRedBlack(root)
      expect(result.blackHeightConsistent).toBe(true)
    })

    it('插入后应是合法 BST（性质：中序有序）', () => {
      let root: RedBlackNode | null = null
      for (const v of [50, 30, 70, 20, 40, 60, 80]) {
        root = insertRedBlack(root, v)
      }
      const result = validateRedBlack(root)
      expect(result.isBst).toBe(true)
    })

    it('顺序插入 1~20 应保持红黑性质', () => {
      let root: RedBlackNode | null = null
      for (let i = 1; i <= 20; i++) {
        root = insertRedBlack(root, i)
      }
      const result = validateRedBlack(root)
      expect(result.rootIsBlack).toBe(true)
      expect(result.noConsecutiveRed).toBe(true)
      expect(result.blackHeightConsistent).toBe(true)
      expect(result.isBst).toBe(true)
    })

    it('逆序插入 20~1 应保持红黑性质', () => {
      let root: RedBlackNode | null = null
      for (let i = 20; i >= 1; i--) {
        root = insertRedBlack(root, i)
      }
      const result = validateRedBlack(root)
      expect(result.rootIsBlack).toBe(true)
      expect(result.noConsecutiveRed).toBe(true)
      expect(result.blackHeightConsistent).toBe(true)
    })

    it('随机顺序插入应保持红黑性质', () => {
      const values = [15, 7, 22, 3, 11, 18, 30, 1, 5, 9, 13, 16, 20, 25, 35]
      let root: RedBlackNode | null = null
      for (const v of values) {
        root = insertRedBlack(root, v)
      }
      const result = validateRedBlack(root)
      expect(result.rootIsBlack).toBe(true)
      expect(result.noConsecutiveRed).toBe(true)
      expect(result.blackHeightConsistent).toBe(true)
    })
  })

  describe('fixInsert', () => {
    it('应将根节点染为黑色', () => {
      // 构造一个根为红色的简单树
      const root = createNode(50, 'red')
      const fixed = fixInsert(root, root)
      expect(fixed.color).toBe('black')
    })
  })

  describe('searchRedBlack', () => {
    it('应找到存在的值', () => {
      const root = buildInitialRedBlackTree()
      const result = searchRedBlack(root, 30)
      expect(result.found).toBe(true)
      expect(result.path.length).toBeGreaterThan(0)
    })

    it('应返回未找到对于不存在的值', () => {
      const root = buildInitialRedBlackTree()
      const result = searchRedBlack(root, 999)
      expect(result.found).toBe(false)
    })

    it('搜索最小值应找到', () => {
      const root = buildInitialRedBlackTree()
      const result = searchRedBlack(root, 20)
      expect(result.found).toBe(true)
    })

    it('搜索最大值应找到', () => {
      const root = buildInitialRedBlackTree()
      const result = searchRedBlack(root, 80)
      expect(result.found).toBe(true)
    })

    it('空树搜索应返回未找到', () => {
      const result = searchRedBlack(null, 10)
      expect(result.found).toBe(false)
      expect(result.path).toEqual([])
    })

    it('搜索路径应包含从根开始的值', () => {
      const root = buildInitialRedBlackTree()
      const result = searchRedBlack(root, 30)
      expect(result.path[0]).toBe(50) // 根节点值
    })
  })

  describe('inorderRedBlack', () => {
    it('应返回升序数组', () => {
      const root = buildInitialRedBlackTree()
      const result = inorderRedBlack(root)
      expect(result).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('空树应返回空数组', () => {
      expect(inorderRedBlack(null)).toEqual([])
    })

    it('单节点树应返回单元素数组', () => {
      const root = insertRedBlack(null, 42)
      expect(inorderRedBlack(root)).toEqual([42])
    })
  })

  describe('countNodes', () => {
    it('空树应返回 0', () => {
      expect(countNodes(null)).toBe(0)
    })

    it('应正确统计节点数', () => {
      const root = buildInitialRedBlackTree()
      expect(countNodes(root)).toBe(7)
    })

    it('插入后节点数应增加', () => {
      let root: RedBlackNode | null = null
      root = insertRedBlack(root, 10)
      expect(countNodes(root)).toBe(1)
      root = insertRedBlack(root, 20)
      expect(countNodes(root)).toBe(2)
    })
  })

  describe('flattenRedBlack', () => {
    it('空树应返回空 nodes 和 edges', () => {
      const result = flattenRedBlack(null)
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })

    it('应返回所有节点', () => {
      const root = buildInitialRedBlackTree()
      const result = flattenRedBlack(root)
      expect(result.nodes.length).toBe(7)
    })

    it('应返回所有边（节点数 - 1）', () => {
      const root = buildInitialRedBlackTree()
      const result = flattenRedBlack(root)
      expect(result.edges.length).toBe(6)
    })

    it('根节点 parent 应为空字符串', () => {
      const root = buildInitialRedBlackTree()
      const result = flattenRedBlack(root)
      const rootNode = result.nodes.find(n => n.parent === '')
      expect(rootNode).toBeDefined()
    })

    it('每个节点应包含 color 字段', () => {
      const root = buildInitialRedBlackTree()
      const result = flattenRedBlack(root)
      for (const node of result.nodes) {
        expect(node.color === 'red' || node.color === 'black').toBe(true)
      }
    })

    it('扁平化后根节点应为黑色', () => {
      const root = buildInitialRedBlackTree()
      const result = flattenRedBlack(root)
      const rootNode = result.nodes.find(n => n.parent === '')
      expect(rootNode?.color).toBe('black')
    })

    it('每条边的 from 和 to 应为有效节点 id', () => {
      const root = buildInitialRedBlackTree()
      const result = flattenRedBlack(root)
      const nodeIds = new Set(result.nodes.map(n => n.id))
      for (const edge of result.edges) {
        expect(nodeIds.has(edge.from)).toBe(true)
        expect(nodeIds.has(edge.to)).toBe(true)
      }
    })
  })

  describe('buildInitialRedBlackTree', () => {
    it('应包含 7 个预设值', () => {
      const root = buildInitialRedBlackTree()
      expect(countNodes(root)).toBe(7)
    })

    it('中序遍历应为 [20, 30, 40, 50, 60, 70, 80]', () => {
      const root = buildInitialRedBlackTree()
      expect(inorderRedBlack(root)).toEqual([20, 30, 40, 50, 60, 70, 80])
    })

    it('根节点应为黑色', () => {
      const root = buildInitialRedBlackTree()
      expect(root?.color).toBe('black')
    })

    it('应满足红黑树所有性质', () => {
      const root = buildInitialRedBlackTree()
      const result = validateRedBlack(root)
      expect(result.rootIsBlack).toBe(true)
      expect(result.noConsecutiveRed).toBe(true)
      expect(result.blackHeightConsistent).toBe(true)
      expect(result.isBst).toBe(true)
    })
  })

  describe('validateRedBlack', () => {
    it('空树应通过所有验证', () => {
      const result = validateRedBlack(null)
      expect(result.rootIsBlack).toBe(true)
      expect(result.noConsecutiveRed).toBe(true)
      expect(result.blackHeightConsistent).toBe(true)
      expect(result.isBst).toBe(true)
    })

    it('应检测出根节点非黑色', () => {
      const root = createNode(50, 'red')
      const result = validateRedBlack(root)
      expect(result.rootIsBlack).toBe(false)
    })

    it('应检测出连续红色节点', () => {
      // 手动构造违反性质 4 的树
      const root = createNode(50, 'black')
      const left = createNode(30, 'red')
      const leftLeft = createNode(20, 'red') // 违反：红-红
      root.left = left
      left.parent = root
      left.left = leftLeft
      leftLeft.parent = left
      const result = validateRedBlack(root)
      expect(result.noConsecutiveRed).toBe(false)
    })
  })

  describe('getBlackHeight', () => {
    it('空树黑高为 0', () => {
      expect(getBlackHeight(null)).toBe(0)
    })

    it('单黑色节点黑高为 1', () => {
      const root = createNode(50, 'black')
      expect(getBlackHeight(root)).toBe(1)
    })

    it('初始树黑高应大于 0', () => {
      const root = buildInitialRedBlackTree()
      expect(getBlackHeight(root)).toBeGreaterThan(0)
    })
  })
})
