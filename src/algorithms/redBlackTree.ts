/**
 * 红黑树（Red-Black Tree）算法实现
 *
 * 核心特性：
 * 1. 自平衡二叉搜索树，通过节点颜色（红/黑）与旋转保持近似平衡
 * 2. 任意节点到叶子路径的黑色节点数相同，保证 O(log n) 操作
 * 3. 插入采用「深拷贝副本 + 修改副本」策略：先 deepClone(root)，
 *    在副本上执行 BST 插入 + fixInsert 修复，返回副本
 *
 * 数据表示：递归对象（RedBlackNode），带 parent 指针
 * 原因：红黑树 fixup 需要访问叔节点，parent 指针让逻辑清晰可验证
 *
 * 红黑树五大性质：
 * 1. 每个节点是红色或黑色
 * 2. 根节点是黑色
 * 3. 每个叶子节点（NIL）是黑色
 * 4. 红色节点的子节点必须是黑色（不能有连续红节点）
 * 5. 从任一节点到其所有后代叶子的路径包含相同数量的黑色节点
 */

/** 节点颜色 */
export type Color = 'red' | 'black'

/** 红黑树节点（递归对象，带 parent 指针） */
export interface RedBlackNode {
  id: string
  value: number
  color: Color
  left: RedBlackNode | null
  right: RedBlackNode | null
  parent: RedBlackNode | null
}

/** 扁平化节点（用于渲染） */
export interface RedBlackFlattenedNode {
  id: string
  value: number
  color: Color
  parent: string
  depth: number
  isLeft: boolean
  isRight: boolean
}

/** 扁平化边（用于渲染） */
export interface RedBlackFlattenedEdge {
  from: string
  to: string
}

/** 扁平化红黑树（供可视化器使用） */
export interface RedBlackFlattened {
  nodes: RedBlackFlattenedNode[]
  edges: RedBlackFlattenedEdge[]
}

/** 全局 id 计数器（保证节点 id 唯一） */
let idCounter = 0

/** 生成唯一节点 id */
function nextId(): string {
  idCounter++
  return `rb-${idCounter}`
}

/**
 * 创建新节点
 * @param value 节点值
 * @param color 节点颜色（默认红色，符合红黑树插入约定）
 */
export function createNode(value: number, color: Color = 'red'): RedBlackNode {
  return {
    id: nextId(),
    value,
    color,
    left: null,
    right: null,
    parent: null,
  }
}

/**
 * 深拷贝红黑树（用于不可变更新）
 * 保留 parent 指针关系
 * @param node 根节点
 * @returns 深拷贝后的根节点
 */
export function deepClone(node: RedBlackNode | null): RedBlackNode | null {
  if (!node) return null

  // 第一遍：递归拷贝，parent 暂存 null
  const clone: RedBlackNode = {
    id: node.id,
    value: node.value,
    color: node.color,
    left: null,
    right: null,
    parent: null,
  }

  if (node.left) {
    clone.left = deepClone(node.left)
    if (clone.left) clone.left.parent = clone
  }
  if (node.right) {
    clone.right = deepClone(node.right)
    if (clone.right) clone.right.parent = clone
  }

  return clone
}

/**
 * 左旋
 *
 *     x                y
 *    / \              / \
 *   T1  y      →     x   T3
 *      / \          / \
 *    T2  T3        T1  T2
 *
 * @param root 树根（可能被替换）
 * @param x 待旋转节点
 * @returns 旋转后的树根
 */
export function rotateLeft(root: RedBlackNode, x: RedBlackNode): RedBlackNode {
  const y = x.right as RedBlackNode
  x.right = y.left
  if (y.left) y.left.parent = x
  y.parent = x.parent
  if (!x.parent) {
    // x 是根，y 成为新根
    y.left = x
    x.parent = y
    return updateRoot(root, x, y)
  }
  if (x === x.parent.left) {
    x.parent.left = y
  } else {
    x.parent.right = y
  }
  y.left = x
  x.parent = y
  return root
}

/**
 * 右旋
 *
 *       y                x
 *      / \              / \
 *     x   T3   →      T1   y
 *    / \                   / \
 *   T1  T2               T2  T3
 *
 * @param root 树根（可能被替换）
 * @param y 待旋转节点
 * @returns 旋转后的树根
 */
export function rotateRight(root: RedBlackNode, y: RedBlackNode): RedBlackNode {
  const x = y.left as RedBlackNode
  y.left = x.right
  if (x.right) x.right.parent = y
  x.parent = y.parent
  if (!y.parent) {
    // y 是根，x 成为新根
    x.right = y
    y.parent = x
    return updateRoot(root, y, x)
  }
  if (y === y.parent.left) {
    y.parent.left = x
  } else {
    y.parent.right = x
  }
  x.right = y
  y.parent = x
  return root
}

/** 处理根节点替换：当被旋转节点是根时，旋转后的新根需返回 */
function updateRoot(root: RedBlackNode, oldRoot: RedBlackNode, newRoot: RedBlackNode): RedBlackNode {
  if (root === oldRoot) {
    return newRoot
  }
  return root
}

/**
 * 修复插入后的红黑性质
 * 三种情况（z 的父节点是祖父的左孩子时）：
 * - 情况 1：叔节点是红色 → 重染色，z 上移两层
 * - 情况 2：叔节点是黑色，z 是右孩子 → 左旋 z.parent，转为情况 3
 * - 情况 3：叔节点是黑色，z 是左孩子 → 重染色 + 右旋祖父
 * 对称情况（z 的父节点是祖父的右孩子）同理
 *
 * @param root 树根
 * @param z 新插入的节点
 * @returns 修复后的树根
 */
export function fixInsert(root: RedBlackNode, z: RedBlackNode): RedBlackNode {
  let current = z
  // 当 z 的父节点存在且为红色时，违反性质 4，需修复
  while (current.parent && current.parent.color === 'red') {
    const parent = current.parent
    const grandparent = parent.parent
    // 祖父不存在说明 parent 是根，但根应为黑色，矛盾，退出
    if (!grandparent) break

    if (parent === grandparent.left) {
      // 父节点是祖父的左孩子
      const uncle = grandparent.right
      if (uncle && uncle.color === 'red') {
        // 情况 1：叔节点为红色，重染色
        parent.color = 'black'
        uncle.color = 'black'
        grandparent.color = 'red'
        current = grandparent
      } else {
        // 叔节点为黑色（或 NIL）
        if (current === parent.right) {
          // 情况 2：z 是右孩子，左旋 parent，转为情况 3
          current = parent
          root = rotateLeft(root, current)
        }
        // 情况 3：z 是左孩子，重染色 + 右旋祖父
        current.parent!.color = 'black'
        current.parent!.parent!.color = 'red'
        root = rotateRight(root, current.parent!.parent!)
      }
    } else {
      // 父节点是祖父的右孩子（对称情况）
      const uncle = grandparent.left
      if (uncle && uncle.color === 'red') {
        // 情况 1：叔节点为红色，重染色
        parent.color = 'black'
        uncle.color = 'black'
        grandparent.color = 'red'
        current = grandparent
      } else {
        // 叔节点为黑色（或 NIL）
        if (current === parent.left) {
          // 情况 2：z 是左孩子，右旋 parent，转为情况 3
          current = parent
          root = rotateRight(root, current)
        }
        // 情况 3：z 是右孩子，重染色 + 左旋祖父
        current.parent!.color = 'black'
        current.parent!.parent!.color = 'red'
        root = rotateLeft(root, current.parent!.parent!)
      }
    }
  }
  // 性质 2：根始终为黑色
  root.color = 'black'
  return root
}

/**
 * 插入节点（不可变：深拷贝后修改副本）
 * @param root 树根
 * @param value 待插入值
 * @returns 插入后的新树根（若值已存在则返回原 root）
 */
export function insertRedBlack(root: RedBlackNode | null, value: number): RedBlackNode | null {
  // 深拷贝，保证不可变更新
  const newRoot = deepClone(root)

  // 标准 BST 插入
  let parent: RedBlackNode | null = null
  let current: RedBlackNode | null = newRoot
  while (current) {
    parent = current
    if (value === current.value) {
      // 值已存在，不重复插入，返回原 root
      return root
    }
    current = value < current.value ? current.left : current.right
  }

  const newNode = createNode(value, 'red')
  newNode.parent = parent

  if (!parent) {
    // 空树，新节点为根
    newNode.color = 'black'
    return newNode
  }

  if (value < parent.value) {
    parent.left = newNode
  } else {
    parent.right = newNode
  }

  // 修复红黑性质（newRoot 在此一定非 null：若为 null，line 284-288 已提前 return）
  return fixInsert(newRoot as RedBlackNode, newNode)
}

/**
 * 查找节点
 * @param root 树根
 * @param value 目标值
 * @returns 路径（从根到目标节点的值序列）与是否找到
 */
export function searchRedBlack(root: RedBlackNode | null, value: number): { found: boolean; path: number[] } {
  const path: number[] = []
  let current = root
  while (current) {
    path.push(current.value)
    if (value === current.value) return { found: true, path }
    current = value < current.value ? current.left : current.right
  }
  return { found: false, path }
}

/** 中序遍历：左-根-右（BST 中序遍历结果有序） */
export function inorderRedBlack(root: RedBlackNode | null): number[] {
  const result: number[] = []
  const traverse = (n: RedBlackNode | null): void => {
    if (!n) return
    traverse(n.left)
    result.push(n.value)
    traverse(n.right)
  }
  traverse(root)
  return result
}

/** 统计节点数 */
export function countNodes(root: RedBlackNode | null): number {
  if (!root) return 0
  return 1 + countNodes(root.left) + countNodes(root.right)
}

/**
 * 扁平化红黑树（供可视化器使用）
 * 使用层序遍历生成节点和边的列表
 */
export function flattenRedBlack(root: RedBlackNode | null): RedBlackFlattened {
  const nodes: RedBlackFlattenedNode[] = []
  const edges: RedBlackFlattenedEdge[] = []

  if (!root) return { nodes, edges }

  // 使用层序遍历
  const queue: { node: RedBlackNode; id: string; parent: string; depth: number; isLeft: boolean; isRight: boolean }[] = [
    { node: root, id: root.id, parent: '', depth: 0, isLeft: false, isRight: false },
  ]

  while (queue.length > 0) {
    const { node, id, parent, depth, isLeft, isRight } = queue.shift() as {
      node: RedBlackNode
      id: string
      parent: string
      depth: number
      isLeft: boolean
      isRight: boolean
    }

    nodes.push({
      id,
      value: node.value,
      color: node.color,
      parent,
      depth,
      isLeft,
      isRight,
    })

    if (parent !== '') {
      edges.push({ from: parent, to: id })
    }

    if (node.left) {
      queue.push({ node: node.left, id: node.left.id, parent: id, depth: depth + 1, isLeft: true, isRight: false })
    }
    if (node.right) {
      queue.push({ node: node.right, id: node.right.id, parent: id, depth: depth + 1, isLeft: false, isRight: true })
    }
  }

  return { nodes, edges }
}

/**
 * 创建初始红黑树（含示例数据）
 * 插入 [50, 30, 70, 20, 40, 60, 80] 构建初始红黑树
 */
export function buildInitialRedBlackTree(): RedBlackNode | null {
  const values = [50, 30, 70, 20, 40, 60, 80]
  let root: RedBlackNode | null = null
  for (const v of values) {
    root = insertRedBlack(root, v)
  }
  return root
}

/**
 * 验证红黑树性质（用于测试）
 * 检查五大性质：
 * 1. 每个节点是红色或黑色
 * 2. 根节点是黑色
 * 3. 叶子节点（NIL）是黑色（隐式，null 视为黑色）
 * 4. 红色节点的子节点必须是黑色
 * 5. 从任一节点到叶子路径的黑色节点数相同
 *
 * @returns 各性质是否满足
 */
export function validateRedBlack(root: RedBlackNode | null): {
  validColors: boolean
  rootIsBlack: boolean
  noConsecutiveRed: boolean
  blackHeightConsistent: boolean
  isBst: boolean
} {
  let validColors = true
  let rootIsBlack = true
  let noConsecutiveRed = true
  let blackHeightConsistent = true
  let isBst = true

  if (!root) {
    return { validColors: true, rootIsBlack: true, noConsecutiveRed: true, blackHeightConsistent: true, isBst: true }
  }

  // 性质 2：根节点是黑色
  if (root.color !== 'black') {
    rootIsBlack = false
  }

  // 递归检查
  // 返回该节点到叶子的黑色节点数（不含自身），-1 表示不一致
  const check = (node: RedBlackNode | null, min: number, max: number): number => {
    if (!node) return 0

    // 性质 1：颜色必须是 red 或 black
    if (node.color !== 'red' && node.color !== 'black') {
      validColors = false
    }

    // BST 性质检查
    if (node.value <= min || node.value >= max) {
      isBst = false
    }

    // 性质 4：红色节点的子节点必须是黑色
    if (node.color === 'red') {
      if (node.left && node.left.color === 'red') {
        noConsecutiveRed = false
      }
      if (node.right && node.right.color === 'red') {
        noConsecutiveRed = false
      }
    }

    const leftBlackHeight = check(node.left, min, node.value)
    const rightBlackHeight = check(node.right, node.value, max)

    // 性质 5：左右子树黑色高度一致
    if (leftBlackHeight !== rightBlackHeight) {
      blackHeightConsistent = false
    }

    // 当前节点为黑色时，黑色高度 +1
    const currentContribution = node.color === 'black' ? 1 : 0
    return leftBlackHeight + currentContribution
  }

  check(root, -Infinity, Infinity)

  return {
    validColors,
    rootIsBlack,
    noConsecutiveRed,
    blackHeightConsistent,
    isBst,
  }
}

/**
 * 获取从根到某值节点的黑色节点数（用于测试）
 */
export function getBlackHeight(root: RedBlackNode | null): number {
  if (!root) return 0
  let count = 0
  let current: RedBlackNode | null = root
  while (current) {
    if (current.color === 'black') count++
    current = current.left
  }
  return count
}
