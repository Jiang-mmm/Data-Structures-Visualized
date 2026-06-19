/**
 * AVL 树算法实现
 *
 * 核心特性：
 * 1. 自平衡二叉搜索树，任意节点平衡因子绝对值不超过 1
 * 2. 插入/删除后通过旋转操作重新平衡
 * 3. 所有操作采用不可变更新（返回新节点，不修改输入）
 *
 * 数据表示：递归对象（AvlNode），参考 TrieNode 模式
 * 原因：旋转操作在数组索引表示下极其复杂，递归对象让逻辑清晰可验证
 */

import type { AvlNode, AvlFlattened, AvlFlattenedNode, AvlFlattenedEdge } from '../types/hooks'

/** 空节点高度为 0，叶子节点高度为 1 */
export function getHeight(node: AvlNode | null): number {
  return node ? node.height : 0
}

/** 计算平衡因子：左子树高度 - 右子树高度 */
export function getBalanceFactor(node: AvlNode | null): number {
  if (!node) return 0
  return getHeight(node.left) - getHeight(node.right)
}

/** 更新节点高度（基于子节点高度） */
function updateHeight(node: AvlNode): AvlNode {
  return {
    ...node,
    height: 1 + Math.max(getHeight(node.left), getHeight(node.right)),
  }
}

/**
 * 右旋（LL 型失衡）
 *
 *       y                x
 *      / \              / \
 *     x   T3   →      T1   y
 *    / \                   / \
 *   T1  T2               T2  T3
 */
export function rotateRight(y: AvlNode): AvlNode {
  const x = y.left as AvlNode
  const t2 = x.right
  // 不可变更新：先更新下层（newY），再用更新后的 newY 创建上层（newX）
  const newY: AvlNode = updateHeight({ ...y, left: t2 })
  const newX: AvlNode = updateHeight({ ...x, right: newY })
  return newX
}

/**
 * 左旋（RR 型失衡）
 *
 *     x                  y
 *    / \                / \
 *   T1  y      →       x   T3
 *      / \            / \
 *    T2  T3          T1  T2
 */
export function rotateLeft(x: AvlNode): AvlNode {
  const y = x.right as AvlNode
  const t2 = y.left
  // 不可变更新：先更新下层（newX），再用更新后的 newX 创建上层（newY）
  const newX: AvlNode = updateHeight({ ...x, right: t2 })
  const newY: AvlNode = updateHeight({ ...y, left: newX })
  return newY
}

/**
 * 重新平衡节点
 * 根据平衡因子执行对应旋转：
 * - LL (BF > 1, value < node.left.value): 右旋
 * - LR (BF > 1, value > node.left.value): 左旋左子，再右旋
 * - RR (BF < -1, value > node.right.value): 左旋
 * - RL (BF < -1, value < node.right.value): 右旋右子，再左旋
 */
function rebalance(node: AvlNode): AvlNode {
  const balanced = updateHeight(node)
  const bf = getBalanceFactor(balanced)

  // LL 型
  if (bf > 1 && getBalanceFactor(balanced.left) >= 0) {
    return rotateRight(balanced)
  }
  // LR 型
  if (bf > 1 && getBalanceFactor(balanced.left) < 0) {
    const newLeft = rotateLeft(balanced.left as AvlNode)
    return rotateRight({ ...balanced, left: newLeft })
  }
  // RR 型
  if (bf < -1 && getBalanceFactor(balanced.right) <= 0) {
    return rotateLeft(balanced)
  }
  // RL 型
  if (bf < -1 && getBalanceFactor(balanced.right) > 0) {
    const newRight = rotateRight(balanced.right as AvlNode)
    return rotateLeft({ ...balanced, right: newRight })
  }
  return balanced
}

/** 创建新节点 */
export function createNode(value: number): AvlNode {
  return { value, left: null, right: null, height: 1 }
}

/**
 * 插入节点（不可变）
 * @returns 新的子树根节点
 */
export function insertAvl(node: AvlNode | null, value: number): AvlNode {
  // 标准 BST 插入
  if (!node) return createNode(value)

  if (value < node.value) {
    const newLeft = insertAvl(node.left, value)
    // 若子树未变化（值已存在则递归会原样返回），直接返回原节点
    if (newLeft === node.left) return node
    return rebalance({ ...node, left: newLeft })
  }
  if (value > node.value) {
    const newRight = insertAvl(node.right, value)
    if (newRight === node.right) return node
    return rebalance({ ...node, right: newRight })
  }
  // 值已存在，不重复插入
  return node
}

/** 找到子树中最小节点（用于删除时找后继） */
function findMin(node: AvlNode): AvlNode {
  let current = node
  while (current.left) current = current.left
  return current
}

/**
 * 删除节点（不可变）
 * @returns 新的子树根节点（可能为 null）
 */
export function deleteAvl(node: AvlNode | null, value: number): AvlNode | null {
  if (!node) return null

  // 标准 BST 删除
  if (value < node.value) {
    const newLeft = deleteAvl(node.left, value)
    if (newLeft === node.left) return node
    return rebalance({ ...node, left: newLeft })
  }
  if (value > node.value) {
    const newRight = deleteAvl(node.right, value)
    if (newRight === node.right) return node
    return rebalance({ ...node, right: newRight })
  }

  // 找到目标节点
  // 情况 1：无子节点或只有一个子节点
  if (!node.left) return node.right
  if (!node.right) return node.left

  // 情况 2：有两个子节点，用中序后继替换
  const successor = findMin(node.right)
  const newRight = deleteAvl(node.right, successor.value)
  return rebalance({
    ...node,
    value: successor.value,
    right: newRight,
  })
}

/**
 * 查找节点
 * @returns 路径（从根到目标节点的值序列）与是否找到
 */
export function searchAvl(node: AvlNode | null, value: number): { found: boolean; path: number[] } {
  const path: number[] = []
  let current = node
  while (current) {
    path.push(current.value)
    if (value === current.value) return { found: true, path }
    current = value < current.value ? current.left : current.right
  }
  return { found: false, path }
}

/** 前序遍历：根-左-右 */
export function preorderAvl(node: AvlNode | null): number[] {
  const result: number[] = []
  const traverse = (n: AvlNode | null): void => {
    if (!n) return
    result.push(n.value)
    traverse(n.left)
    traverse(n.right)
  }
  traverse(node)
  return result
}

/** 中序遍历：左-根-右（BST 中序遍历结果有序） */
export function inorderAvl(node: AvlNode | null): number[] {
  const result: number[] = []
  const traverse = (n: AvlNode | null): void => {
    if (!n) return
    traverse(n.left)
    result.push(n.value)
    traverse(n.right)
  }
  traverse(node)
  return result
}

/** 后序遍历：左-右-根 */
export function postorderAvl(node: AvlNode | null): number[] {
  const result: number[] = []
  const traverse = (n: AvlNode | null): void => {
    if (!n) return
    traverse(n.left)
    traverse(n.right)
    result.push(n.value)
  }
  traverse(node)
  return result
}

/** 层序遍历：按深度从上到下、从左到右 */
export function levelorderAvl(node: AvlNode | null): number[] {
  if (!node) return []
  const result: number[] = []
  const queue: AvlNode[] = [node]
  while (queue.length > 0) {
    const current = queue.shift() as AvlNode
    result.push(current.value)
    if (current.left) queue.push(current.left)
    if (current.right) queue.push(current.right)
  }
  return result
}

/** 统计节点数 */
export function countNodes(node: AvlNode | null): number {
  if (!node) return 0
  return 1 + countNodes(node.left) + countNodes(node.right)
}

/**
 * 扁平化 AVL 树（供可视化器使用）
 * 使用层序遍历生成节点和边的列表
 */
export function flattenAvl(root: AvlNode | null): AvlFlattened {
  const nodes: AvlFlattenedNode[] = []
  const edges: AvlFlattenedEdge[] = []

  if (!root) return { nodes, edges }

  // 使用层序遍历，为每个节点分配唯一 id
  let idCounter = 0
  const queue: { node: AvlNode; id: string; parent: string; depth: number; isLeft: boolean; isRight: boolean }[] = [
    { node: root, id: '0', parent: '', depth: 0, isLeft: false, isRight: false },
  ]
  idCounter = 1

  while (queue.length > 0) {
    const { node, id, parent, depth, isLeft, isRight } = queue.shift() as {
      node: AvlNode
      id: string
      parent: string
      depth: number
      isLeft: boolean
      isRight: boolean
    }

    nodes.push({
      id,
      value: node.value,
      parent,
      depth,
      balanceFactor: getBalanceFactor(node),
      height: node.height,
      isLeft,
      isRight,
    })

    if (parent !== '') {
      edges.push({ from: parent, to: id })
    }

    if (node.left) {
      const leftId = String(idCounter++)
      queue.push({ node: node.left, id: leftId, parent: id, depth: depth + 1, isLeft: true, isRight: false })
    }
    if (node.right) {
      const rightId = String(idCounter++)
      queue.push({ node: node.right, id: rightId, parent: id, depth: depth + 1, isLeft: false, isRight: true })
    }
  }

  return { nodes, edges }
}

/**
 * 验证 AVL 树性质（用于测试）
 * 1. 是合法 BST
 * 2. 任意节点平衡因子绝对值 <= 1
 * 3. 节点高度正确
 */
export function validateAvl(node: AvlNode | null): { isBst: boolean; isBalanced: boolean; heightCorrect: boolean } {
  let isBst = true
  let isBalanced = true
  let heightCorrect = true

  const check = (n: AvlNode | null, min: number, max: number): number => {
    if (!n) return 0
    // BST 性质检查
    if (n.value <= min || n.value >= max) {
      isBst = false
    }
    // 平衡因子检查
    const bf = getBalanceFactor(n)
    if (Math.abs(bf) > 1) {
      isBalanced = false
    }
    const leftHeight = check(n.left, min, n.value)
    const rightHeight = check(n.right, n.value, max)
    // 高度正确性检查
    const expectedHeight = 1 + Math.max(leftHeight, rightHeight)
    if (n.height !== expectedHeight) {
      heightCorrect = false
    }
    return expectedHeight
  }

  check(node, -Infinity, Infinity)
  return { isBst, isBalanced, heightCorrect }
}
