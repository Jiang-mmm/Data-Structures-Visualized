import { describe, it, expect } from 'vitest'
import {
  insertAvl,
  deleteAvl,
  searchAvl,
  preorderAvl,
  inorderAvl,
  postorderAvl,
  levelorderAvl,
  countNodes,
  flattenAvl,
  validateAvl,
  getHeight,
  getBalanceFactor,
  rotateRight,
  rotateLeft,
  createNode,
} from '../algorithms/avlTree'
import type { AvlNode } from '../types/hooks'

describe('AVL 树算法', () => {
  describe('基础工具函数', () => {
    it('getHeight 应返回节点高度，空节点为 0', () => {
      expect(getHeight(null)).toBe(0)
      expect(getHeight(createNode(10))).toBe(1)
    })

    it('getBalanceFactor 应返回平衡因子', () => {
      const node: AvlNode = {
        value: 10,
        left: { value: 5, left: null, right: null, height: 1 },
        right: null,
        height: 2,
      }
      expect(getBalanceFactor(node)).toBe(1)
      expect(getBalanceFactor(null)).toBe(0)
    })

    it('createNode 应创建高度为 1 的叶子节点', () => {
      const node = createNode(42)
      expect(node.value).toBe(42)
      expect(node.left).toBeNull()
      expect(node.right).toBeNull()
      expect(node.height).toBe(1)
    })
  })

  describe('旋转操作', () => {
    it('rotateRight 应正确执行右旋（LL 型）', () => {
      // 构造 LL 型失衡树
      //       30
      //      /
      //     20
      //    /
      //   10
      const root: AvlNode = {
        value: 30,
        left: {
          value: 20,
          left: { value: 10, left: null, right: null, height: 1 },
          right: null,
          height: 2,
        },
        right: null,
        height: 3,
      }

      const newRoot = rotateRight(root)
      // 旋转后：
      //     20
      //    /  \
      //   10  30
      expect(newRoot.value).toBe(20)
      expect(newRoot.left?.value).toBe(10)
      expect(newRoot.right?.value).toBe(30)
    })

    it('rotateLeft 应正确执行左旋（RR 型）', () => {
      // 构造 RR 型失衡树
      //   10
      //     \
      //      20
      //       \
      //        30
      const root: AvlNode = {
        value: 10,
        left: null,
        right: {
          value: 20,
          left: null,
          right: { value: 30, left: null, right: null, height: 1 },
          height: 2,
        },
        height: 3,
      }

      const newRoot = rotateLeft(root)
      // 旋转后：
      //     20
      //    /  \
      //   10  30
      expect(newRoot.value).toBe(20)
      expect(newRoot.left?.value).toBe(10)
      expect(newRoot.right?.value).toBe(30)
    })
  })

  describe('insertAvl 插入操作', () => {
    it('应插入到空树', () => {
      const root = insertAvl(null, 10)
      expect(root).not.toBeNull()
      expect(root!.value).toBe(10)
      expect(root!.height).toBe(1)
    })

    it('应保持 BST 性质', () => {
      let root: AvlNode | null = null
      const values = [50, 30, 70, 20, 40, 60, 80]
      for (const v of values) {
        root = insertAvl(root, v)
      }
      const { isBst } = validateAvl(root)
      expect(isBst).toBe(true)
    })

    it('应保持平衡性质（|BF| <= 1）', () => {
      let root: AvlNode | null = null
      const values = [50, 30, 70, 20, 40, 60, 80, 10, 25]
      for (const v of values) {
        root = insertAvl(root, v)
      }
      const { isBalanced } = validateAvl(root)
      expect(isBalanced).toBe(true)
    })

    it('应正确处理 LL 型失衡', () => {
      // 依次插入 30, 20, 10 应触发 LL 旋转
      let root: AvlNode | null = null
      root = insertAvl(root, 30)
      root = insertAvl(root, 20)
      root = insertAvl(root, 10)
      // 旋转后 20 应为根
      expect(root!.value).toBe(20)
      expect(root!.left?.value).toBe(10)
      expect(root!.right?.value).toBe(30)
    })

    it('应正确处理 RR 型失衡', () => {
      // 依次插入 10, 20, 30 应触发 RR 旋转
      let root: AvlNode | null = null
      root = insertAvl(root, 10)
      root = insertAvl(root, 20)
      root = insertAvl(root, 30)
      // 旋转后 20 应为根
      expect(root!.value).toBe(20)
      expect(root!.left?.value).toBe(10)
      expect(root!.right?.value).toBe(30)
    })

    it('应正确处理 LR 型失衡', () => {
      // 依次插入 30, 10, 20 应触发 LR 旋转
      let root: AvlNode | null = null
      root = insertAvl(root, 30)
      root = insertAvl(root, 10)
      root = insertAvl(root, 20)
      // 旋转后 20 应为根
      expect(root!.value).toBe(20)
      expect(root!.left?.value).toBe(10)
      expect(root!.right?.value).toBe(30)
    })

    it('应正确处理 RL 型失衡', () => {
      // 依次插入 10, 30, 20 应触发 RL 旋转
      let root: AvlNode | null = null
      root = insertAvl(root, 10)
      root = insertAvl(root, 30)
      root = insertAvl(root, 20)
      // 旋转后 20 应为根
      expect(root!.value).toBe(20)
      expect(root!.left?.value).toBe(10)
      expect(root!.right?.value).toBe(30)
    })

    it('应拒绝重复值插入', () => {
      let root: AvlNode | null = null
      root = insertAvl(root, 10)
      const original = root
      root = insertAvl(root, 10)
      // 应返回原节点（引用相同）
      expect(root).toBe(original)
    })

    it('应正确更新节点高度', () => {
      let root: AvlNode | null = null
      const values = [50, 30, 70, 20, 40]
      for (const v of values) {
        root = insertAvl(root, v)
      }
      const { heightCorrect } = validateAvl(root)
      expect(heightCorrect).toBe(true)
    })

    it('应使用不可变更新（不修改原节点）', () => {
      const original: AvlNode = {
        value: 10,
        left: null,
        right: null,
        height: 1,
      }
      const originalCopy = JSON.parse(JSON.stringify(original))
      insertAvl(original, 20)
      // 原节点不应被修改
      expect(original).toEqual(originalCopy)
    })
  })

  describe('deleteAvl 删除操作', () => {
    function buildTree(values: number[]): AvlNode | null {
      let root: AvlNode | null = null
      for (const v of values) {
        root = insertAvl(root, v)
      }
      return root
    }

    it('应删除叶子节点', () => {
      let root = buildTree([50, 30, 70])
      root = deleteAvl(root, 30)
      expect(searchAvl(root, 30).found).toBe(false)
      expect(searchAvl(root, 50).found).toBe(true)
      expect(searchAvl(root, 70).found).toBe(true)
    })

    it('应删除只有一个子节点的节点', () => {
      let root = buildTree([50, 30, 70, 20])
      root = deleteAvl(root, 30)
      expect(searchAvl(root, 30).found).toBe(false)
      expect(searchAvl(root, 20).found).toBe(true)
    })

    it('应删除有两个子节点的节点（用中序后继替换）', () => {
      let root = buildTree([50, 30, 70, 20, 40, 60, 80])
      root = deleteAvl(root, 50)
      expect(searchAvl(root, 50).found).toBe(false)
      // 其他节点应仍在
      expect(searchAvl(root, 30).found).toBe(true)
      expect(searchAvl(root, 70).found).toBe(true)
      expect(searchAvl(root, 80).found).toBe(true)
    })

    it('删除后应保持 BST 性质', () => {
      let root = buildTree([50, 30, 70, 20, 40, 60, 80, 10, 25])
      root = deleteAvl(root, 30)
      const { isBst } = validateAvl(root)
      expect(isBst).toBe(true)
    })

    it('删除后应保持平衡性质', () => {
      let root = buildTree([50, 30, 70, 20, 40, 60, 80, 10, 25])
      root = deleteAvl(root, 40)
      const { isBalanced } = validateAvl(root)
      expect(isBalanced).toBe(true)
    })

    it('删除不存在的值应返回原树', () => {
      const root = buildTree([50, 30, 70])
      const result = deleteAvl(root, 999)
      // 应保持原有节点
      expect(searchAvl(result, 50).found).toBe(true)
      expect(searchAvl(result, 30).found).toBe(true)
      expect(searchAvl(result, 70).found).toBe(true)
    })

    it('删除根节点应正确处理', () => {
      let root = buildTree([50, 30, 70])
      root = deleteAvl(root, 50)
      expect(searchAvl(root, 50).found).toBe(false)
      expect(countNodes(root)).toBe(2)
    })

    it('删除后应正确更新高度', () => {
      let root = buildTree([50, 30, 70, 20, 40])
      root = deleteAvl(root, 20)
      const { heightCorrect } = validateAvl(root)
      expect(heightCorrect).toBe(true)
    })
  })

  describe('searchAvl 查找操作', () => {
    function buildTree(values: number[]): AvlNode | null {
      let root: AvlNode | null = null
      for (const v of values) {
        root = insertAvl(root, v)
      }
      return root
    }

    it('应找到存在的节点', () => {
      const root = buildTree([50, 30, 70, 20, 40])
      const result = searchAvl(root, 40)
      expect(result.found).toBe(true)
      expect(result.path).toContain(40)
    })

    it('应返回正确的查找路径', () => {
      const root = buildTree([50, 30, 70, 20, 40])
      const result = searchAvl(root, 20)
      expect(result.found).toBe(true)
      // 路径应从根开始：50 -> 30 -> 20
      expect(result.path).toEqual([50, 30, 20])
    })

    it('未找到应返回 found: false', () => {
      const root = buildTree([50, 30, 70])
      const result = searchAvl(root, 999)
      expect(result.found).toBe(false)
    })

    it('空树查找应返回 found: false', () => {
      const result = searchAvl(null, 10)
      expect(result.found).toBe(false)
      expect(result.path).toEqual([])
    })
  })

  describe('遍历操作', () => {
    function buildTree(values: number[]): AvlNode | null {
      let root: AvlNode | null = null
      for (const v of values) {
        root = insertAvl(root, v)
      }
      return root
    }

    it('preorderAvl 应返回前序遍历结果', () => {
      const root = buildTree([50, 30, 70, 20, 40, 60, 80])
      const result = preorderAvl(root)
      expect(result[0]).toBe(50) // 根节点在前
      expect(result.length).toBe(7)
    })

    it('inorderAvl 应返回有序结果', () => {
      const root = buildTree([50, 30, 70, 20, 40, 60, 80])
      const result = inorderAvl(root)
      // 中序遍历应是有序的
      const sorted = [...result].sort((a, b) => a - b)
      expect(result).toEqual(sorted)
    })

    it('postorderAvl 应返回后序遍历结果', () => {
      const root = buildTree([50, 30, 70, 20, 40, 60, 80])
      const result = postorderAvl(root)
      expect(result[result.length - 1]).toBe(50) // 根节点在后
      expect(result.length).toBe(7)
    })

    it('levelorderAvl 应返回层序遍历结果', () => {
      const root = buildTree([50, 30, 70, 20, 40, 60, 80])
      const result = levelorderAvl(root)
      expect(result[0]).toBe(50) // 根节点在前
      expect(result.length).toBe(7)
    })

    it('空树遍历应返回空数组', () => {
      expect(preorderAvl(null)).toEqual([])
      expect(inorderAvl(null)).toEqual([])
      expect(postorderAvl(null)).toEqual([])
      expect(levelorderAvl(null)).toEqual([])
    })
  })

  describe('countNodes 节点计数', () => {
    it('应正确计数节点数', () => {
      let root: AvlNode | null = null
      root = insertAvl(root, 50)
      root = insertAvl(root, 30)
      root = insertAvl(root, 70)
      expect(countNodes(root)).toBe(3)
    })

    it('空树节点数为 0', () => {
      expect(countNodes(null)).toBe(0)
    })
  })

  describe('flattenAvl 扁平化', () => {
    it('应正确扁平化非空树', () => {
      let root: AvlNode | null = null
      root = insertAvl(root, 50)
      root = insertAvl(root, 30)
      root = insertAvl(root, 70)

      const flattened = flattenAvl(root)
      expect(flattened.nodes.length).toBe(3)
      expect(flattened.edges.length).toBe(2) // 两条边：根到左、根到右
    })

    it('根节点 parent 应为空字符串', () => {
      let root: AvlNode | null = null
      root = insertAvl(root, 50)
      const flattened = flattenAvl(root)
      expect(flattened.nodes[0].parent).toBe('')
    })

    it('应包含平衡因子信息', () => {
      let root: AvlNode | null = null
      root = insertAvl(root, 50)
      root = insertAvl(root, 30)
      root = insertAvl(root, 70)
      const flattened = flattenAvl(root)
      // 平衡因子应在 [-1, 0, 1] 范围内
      for (const node of flattened.nodes) {
        expect(Math.abs(node.balanceFactor)).toBeLessThanOrEqual(1)
      }
    })

    it('空树扁平化应返回空数组', () => {
      const flattened = flattenAvl(null)
      expect(flattened.nodes).toEqual([])
      expect(flattened.edges).toEqual([])
    })
  })

  describe('validateAvl 验证函数', () => {
    it('应验证合法 AVL 树', () => {
      let root: AvlNode | null = null
      const values = [50, 30, 70, 20, 40, 60, 80]
      for (const v of values) {
        root = insertAvl(root, v)
      }
      const result = validateAvl(root)
      expect(result.isBst).toBe(true)
      expect(result.isBalanced).toBe(true)
      expect(result.heightCorrect).toBe(true)
    })

    it('应检测不合法的 BST', () => {
      // 手动构造不合法 BST：左子节点值大于根
      const badTree: AvlNode = {
        value: 10,
        left: { value: 20, left: null, right: null, height: 1 },
        right: null,
        height: 2,
      }
      const result = validateAvl(badTree)
      expect(result.isBst).toBe(false)
    })

    it('应检测不平衡的树', () => {
      // 手动构造不平衡树
      const unbalanced: AvlNode = {
        value: 10,
        left: {
          value: 5,
          left: { value: 1, left: null, right: null, height: 1 },
          right: null,
          height: 2,
        },
        right: null,
        height: 3,
      }
      const result = validateAvl(unbalanced)
      expect(result.isBalanced).toBe(false)
    })

    it('空树应通过验证', () => {
      const result = validateAvl(null)
      expect(result.isBst).toBe(true)
      expect(result.isBalanced).toBe(true)
      expect(result.heightCorrect).toBe(true)
    })
  })

  describe('综合压力测试', () => {
    it('顺序插入 50 个数后应保持 AVL 性质', () => {
      let root: AvlNode | null = null
      for (let i = 1; i <= 50; i++) {
        root = insertAvl(root, i)
      }
      const result = validateAvl(root)
      expect(result.isBst).toBe(true)
      expect(result.isBalanced).toBe(true)
      expect(result.heightCorrect).toBe(true)
      expect(countNodes(root)).toBe(50)
    })

    it('逆序插入 50 个数后应保持 AVL 性质', () => {
      let root: AvlNode | null = null
      for (let i = 50; i >= 1; i--) {
        root = insertAvl(root, i)
      }
      const result = validateAvl(root)
      expect(result.isBst).toBe(true)
      expect(result.isBalanced).toBe(true)
      expect(result.heightCorrect).toBe(true)
    })

    it('随机插入删除后应保持 AVL 性质', () => {
      let root: AvlNode | null = null
      const inserted = new Set<number>()
      // 插入 30 个数
      for (let i = 0; i < 30; i++) {
        const v = Math.floor(Math.random() * 99) + 1
        if (!inserted.has(v)) {
          root = insertAvl(root, v)
          inserted.add(v)
        }
      }
      // 删除一半
      const toDelete = Array.from(inserted).slice(0, Math.floor(inserted.size / 2))
      for (const v of toDelete) {
        root = deleteAvl(root, v)
        inserted.delete(v)
      }
      const result = validateAvl(root)
      expect(result.isBst).toBe(true)
      expect(result.isBalanced).toBe(true)
      expect(result.heightCorrect).toBe(true)
      expect(countNodes(root)).toBe(inserted.size)
    })

    it('AVL 树高度应接近 log2(n)', () => {
      let root: AvlNode | null = null
      const n = 100
      for (let i = 1; i <= n; i++) {
        root = insertAvl(root, i)
      }
      const height = getHeight(root)
      // AVL 树高度上界约为 1.44 * log2(n+2)
      const upperBound = 1.44 * Math.log2(n + 2)
      expect(height).toBeLessThan(upperBound)
      // 高度应大于等于 log2(n)
      expect(height).toBeGreaterThanOrEqual(Math.floor(Math.log2(n)))
    })
  })
})
