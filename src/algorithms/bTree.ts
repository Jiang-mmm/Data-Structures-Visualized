/**
 * B-Tree（B 树）算法实现
 *
 * 核心特性：
 * 1. 多路自平衡搜索树，每个节点可包含多个 key 和多个子节点
 * 2. 所有叶子节点位于同一层，保证 O(log n) 操作复杂度
 * 3. 插入时通过节点分裂（split）维持 B-Tree 性质
 *
 * 数据表示：递归对象（BTreeNode），keys 数组 + children 数组
 * 阶数（order）默认为 3（2-3 树）：
 * - 每个节点最多 order 个子节点，order-1 个 key
 * - 非根非叶节点最少 ⌈order/2⌉ 个子节点
 *
 * 不可变更新策略：插入时深拷贝副本，在副本上执行操作，返回新根节点
 */

/** B 树节点（递归对象表示） */
export interface BTreeNode {
  /** 节点存储的键值数组（有序） */
  keys: number[]
  /** 子节点数组（长度为 keys.length + 1，叶子节点为空数组） */
  children: BTreeNode[]
  /** 是否为叶子节点 */
  leaf: boolean
}

/** 扁平化节点（供可视化器使用） */
export interface BTreeFlattenedNode {
  /** 节点唯一标识（基于层序遍历顺序） */
  id: string
  /** 节点键值数组 */
  keys: number[]
  /** 子节点 id 数组 */
  childrenIds: string[]
  /** 父节点 id（根节点为空字符串） */
  parent: string
  /** 节点所在深度（根为 0） */
  depth: number
  /** 是否为叶子节点 */
  leaf: boolean
  /** x 坐标占位（由可视化器填充） */
  x: number
  /** y 坐标占位（由可视化器填充） */
  y: number
  /** 是否高亮（供动画使用） */
  highlighted: boolean
}

/** 扁平化边（供可视化器使用） */
export interface BTreeFlattenedEdge {
  /** 起点 id（父节点） */
  from: string
  /** 终点 id（子节点） */
  to: string
}

/** 扁平化 B 树结构（供可视化器使用） */
export interface BTreeFlattened {
  nodes: BTreeFlattenedNode[]
  edges: BTreeFlattenedEdge[]
}

/** 默认阶数（2-3 树） */
export const DEFAULT_ORDER = 3

/**
 * 深拷贝 B 树节点（递归拷贝 keys 和 children）
 */
export function cloneBTreeNode(node: BTreeNode): BTreeNode {
  return {
    keys: [...node.keys],
    children: node.children.map(cloneBTreeNode),
    leaf: node.leaf,
  }
}

/**
 * 创建新叶子节点
 */
export function createLeafNode(keys: number[] = []): BTreeNode {
  return { keys: [...keys], children: [], leaf: true }
}

/**
 * 创建新内部节点
 */
export function createInternalNode(keys: number[] = [], children: BTreeNode[] = []): BTreeNode {
  return { keys: [...keys], children: [...children], leaf: false }
}

/**
 * 分裂子节点
 *
 * 当 parent.children[index] 的 keys 数量超过 maxKeys 时，将其分裂为两个节点，
 * 中间 key 上移到 parent。
 *
 * @param parent 父节点（会被原地修改）
 * @param index 待分裂子节点在 parent.children 中的索引
 * @param _maxKeys 每个节点最多允许的 key 数量（保留用于文档说明，实际分裂逻辑基于 keys.length 计算）
 */
function splitChild(parent: BTreeNode, index: number, _maxKeys: number): void {
  const child = parent.children[index]
  // 中间 key 的索引（对于 order=3, maxKeys=2, 当 child 有 3 个 key 时 midIndex=1）
  const midIndex = Math.floor(child.keys.length / 2)
  const midKey = child.keys[midIndex]

  // 创建右节点（包含 midKey 之后的 keys 和对应 children）
  const rightNode: BTreeNode = {
    keys: child.keys.slice(midIndex + 1),
    children: child.leaf ? [] : child.children.slice(midIndex + 1),
    leaf: child.leaf,
  }

  // 截断左节点（child 变为左节点，只保留 midIndex 之前的 keys）
  child.keys = child.keys.slice(0, midIndex)
  if (!child.leaf) {
    child.children = child.children.slice(0, midIndex + 1)
  }

  // 将 midKey 和 rightNode 插入 parent
  parent.keys.splice(index, 0, midKey)
  parent.children.splice(index + 1, 0, rightNode)
}

/**
 * 向非满节点中插入 key（递归，自底向上分裂）
 *
 * @param node 当前节点（会被原地修改）
 * @param key 待插入的 key
 * @param maxKeys 每个节点最多允许的 key 数量
 * @returns 是否实际插入了（false 表示 key 已存在）
 */
function insertNonFull(node: BTreeNode, key: number, maxKeys: number): boolean {
  // 从右向左查找插入位置
  let i = node.keys.length - 1

  if (node.leaf) {
    // 叶子节点：直接插入
    // 跳过重复 key
    while (i >= 0 && key < node.keys[i]) {
      i--
    }
    if (i >= 0 && key === node.keys[i]) {
      return false // key 已存在
    }
    node.keys.splice(i + 1, 0, key)
    return true
  }

  // 内部节点：找到合适的子节点递归插入
  while (i >= 0 && key < node.keys[i]) {
    i--
  }
  // 检查重复
  if (i >= 0 && key === node.keys[i]) {
    return false // key 已存在
  }
  // i+1 是目标子节点索引
  const childIndex = i + 1
  insertNonFull(node.children[childIndex], key, maxKeys)

  // 检查子节点是否需要分裂
  if (node.children[childIndex].keys.length > maxKeys) {
    splitChild(node, childIndex, maxKeys)
  }
  return true
}

/**
 * 插入 key 到 B 树（不可变：返回新根节点）
 *
 * 采用"先插入后分裂"策略：先插入到根节点，若根节点溢出（keys 数量 > maxKeys），
 * 再创建新根并分裂。这与 insertNonFull 中对子节点的处理一致。
 *
 * @param root 当前根节点（不会被修改）
 * @param key 待插入的 key
 * @param order B 树阶数（默认 3）
 * @returns 新的根节点
 */
export function insertBTree(root: BTreeNode | null, key: number, order: number = DEFAULT_ORDER): BTreeNode {
  const maxKeys = order - 1

  // 空树：创建根节点
  if (!root) {
    return createLeafNode([key])
  }

  // 深拷贝根节点（不可变更新）
  const newRoot = cloneBTreeNode(root)

  // 先插入到根节点（insertNonFull 会处理子节点分裂）
  insertNonFull(newRoot, key, maxKeys)

  // 若根节点溢出（keys 数量超过 maxKeys），创建新根并分裂
  if (newRoot.keys.length > maxKeys) {
    const newRootNode = createInternalNode([], [newRoot])
    splitChild(newRootNode, 0, maxKeys)
    return newRootNode
  }

  return newRoot
}

/**
 * 在 B 树中查找 key
 *
 * @param root 根节点
 * @param key 待查找的 key
 * @returns 是否找到 + 访问路径（每层访问节点的 keys 数组）
 */
export function searchBTree(root: BTreeNode | null, key: number): { found: boolean; path: number[][] } {
  const path: number[][] = []
  let current = root

  while (current) {
    path.push([...current.keys])

    let i = 0
    while (i < current.keys.length && key > current.keys[i]) {
      i++
    }

    if (i < current.keys.length && key === current.keys[i]) {
      return { found: true, path }
    }

    if (current.leaf) {
      return { found: false, path }
    }

    current = current.children[i]
  }

  return { found: false, path }
}

/**
 * 中序遍历 B 树（所有 key 按升序输出）
 */
export function inorderBTree(root: BTreeNode | null): number[] {
  const result: number[] = []
  const traverse = (node: BTreeNode | null): void => {
    if (!node) return
    if (node.leaf) {
      result.push(...node.keys)
      return
    }
    for (let i = 0; i < node.keys.length; i++) {
      traverse(node.children[i])
      result.push(node.keys[i])
    }
    // 遍历最后一个子节点
    if (node.children.length > node.keys.length) {
      traverse(node.children[node.keys.length])
    }
  }
  traverse(root)
  return result
}

/**
 * 统计 B 树中的节点总数
 */
export function countBTreeNodes(root: BTreeNode | null): number {
  if (!root) return 0
  let count = 1
  for (const child of root.children) {
    count += countBTreeNodes(child)
  }
  return count
}

/**
 * 统计 B 树中的 key 总数
 */
export function countBTreeKeys(root: BTreeNode | null): number {
  if (!root) return 0
  let count = root.keys.length
  for (const child of root.children) {
    count += countBTreeKeys(child)
  }
  return count
}

/**
 * 扁平化 B 树（供可视化器使用）
 * 使用层序遍历生成节点和边的列表
 */
export function bTreeToFlattened(root: BTreeNode | null): BTreeFlattened {
  const nodes: BTreeFlattenedNode[] = []
  const edges: BTreeFlattenedEdge[] = []

  if (!root) return { nodes, edges }

  let idCounter = 0
  const queue: { node: BTreeNode; id: string; parent: string; depth: number }[] = [
    { node: root, id: '0', parent: '', depth: 0 },
  ]
  idCounter = 1

  while (queue.length > 0) {
    const { node, id, parent, depth } = queue.shift() as {
      node: BTreeNode
      id: string
      parent: string
      depth: number
    }

    const childrenIds: string[] = []
    for (const child of node.children) {
      const childId = String(idCounter++)
      childrenIds.push(childId)
      queue.push({ node: child, id: childId, parent: id, depth: depth + 1 })
    }

    nodes.push({
      id,
      keys: [...node.keys],
      childrenIds,
      parent,
      depth,
      leaf: node.leaf,
      x: 0,
      y: 0,
      highlighted: false,
    })

    if (parent !== '') {
      edges.push({ from: parent, to: id })
    }
  }

  return { nodes, edges }
}

/**
 * 验证 B 树性质（用于测试）
 * 1. 所有叶子节点位于同一层
 * 2. 每个节点的 keys 数量在合法范围内
 * 3. keys 有序
 * 4. 子节点分隔值正确
 */
export function validateBTree(root: BTreeNode | null, order: number = DEFAULT_ORDER): {
  valid: boolean
  allLeavesSameDepth: boolean
  keyCountValid: boolean
  keysSorted: boolean
  childrenCorrect: boolean
} {
  let allLeavesSameDepth = true
  let keyCountValid = true
  let keysSorted = true
  let childrenCorrect = true

  const maxKeys = order - 1
  const minKeys = Math.ceil(order / 2) - 1

  let leafDepth = -1

  const check = (node: BTreeNode | null, depth: number, isRoot: boolean): void => {
    if (!node) return

    // 检查 key 数量
    if (!isRoot && node.keys.length < minKeys) {
      keyCountValid = false
    }
    if (node.keys.length > maxKeys) {
      keyCountValid = false
    }
    // 根节点至少 1 个 key（除非空树）
    if (isRoot && node.keys.length < 1) {
      keyCountValid = false
    }

    // 检查 keys 有序
    for (let i = 1; i < node.keys.length; i++) {
      if (node.keys[i] <= node.keys[i - 1]) {
        keysSorted = false
      }
    }

    // 检查子节点数量
    if (!node.leaf && node.children.length !== node.keys.length + 1) {
      childrenCorrect = false
    }

    // 检查叶子深度一致
    if (node.leaf) {
      if (leafDepth === -1) {
        leafDepth = depth
      } else if (leafDepth !== depth) {
        allLeavesSameDepth = false
      }
    }

    // 递归检查子节点
    for (const child of node.children) {
      check(child, depth + 1, false)
    }
  }

  check(root, 0, true)

  return {
    valid: allLeavesSameDepth && keyCountValid && keysSorted && childrenCorrect,
    allLeavesSameDepth,
    keyCountValid,
    keysSorted,
    childrenCorrect,
  }
}

/**
 * B 树类（封装常用操作，便于测试和使用）
 */
export class BTree {
  root: BTreeNode | null
  readonly order: number

  constructor(order: number = DEFAULT_ORDER) {
    this.root = null
    this.order = order
  }

  /** 插入 key */
  insert(key: number): void {
    this.root = insertBTree(this.root, key, this.order)
  }

  /** 查找 key */
  search(key: number): { found: boolean; path: number[][] } {
    return searchBTree(this.root, key)
  }

  /** 中序遍历 */
  inorder(): number[] {
    return inorderBTree(this.root)
  }

  /** 节点总数 */
  get nodeCount(): number {
    return countBTreeNodes(this.root)
  }

  /** key 总数 */
  get keyCount(): number {
    return countBTreeKeys(this.root)
  }

  /** 扁平化 */
  flatten(): BTreeFlattened {
    return bTreeToFlattened(this.root)
  }

  /** 验证 B 树性质 */
  validate(): ReturnType<typeof validateBTree> {
    return validateBTree(this.root, this.order)
  }
}
