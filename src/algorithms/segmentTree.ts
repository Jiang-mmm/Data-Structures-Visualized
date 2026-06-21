/**
 * 线段树（Segment Tree）算法实现
 *
 * 核心特性：
 * 1. 二叉树结构，每个节点代表一个区间 [start, end] 及该区间的聚合值（求和）
 * 2. 支持区间查询（O(log n)）和单点更新（O(log n)）
 * 3. 构建时间为 O(n)，空间为 O(n)
 *
 * 数据表示：递归对象（SegmentTreeNode），每个节点存储区间边界、sum 值和左右子节点
 * 不可变更新策略：更新时返回新节点副本，不修改原树
 */

/** 线段树节点（递归对象表示） */
export interface SegmentTreeNode {
  /** 区间左端点（闭区间） */
  start: number
  /** 区间右端点（闭区间） */
  end: number
  /** 区间内元素之和 */
  sum: number
  /** 左子节点（叶子节点为 null） */
  left: SegmentTreeNode | null
  /** 右子节点（叶子节点为 null） */
  right: SegmentTreeNode | null
}

/** 扁平化节点（供可视化器使用） */
export interface SegmentTreeFlattenedNode {
  /** 节点唯一标识（基于层序遍历顺序） */
  id: string
  /** 区间左端点 */
  start: number
  /** 区间右端点 */
  end: number
  /** 区间求和值 */
  sum: number
  /** 子节点 id 数组 */
  childrenIds: string[]
  /** 父节点 id（根节点为空字符串） */
  parent: string
  /** 节点所在层级（根为 0） */
  level: number
  /** 是否为叶子节点 */
  isLeaf: boolean
  /** x 坐标占位（由可视化器填充） */
  x: number
  /** y 坐标占位（由可视化器填充） */
  y: number
  /** 是否高亮（供动画使用） */
  highlighted: boolean
}

/** 扁平化边（供可视化器使用） */
export interface SegmentTreeFlattenedEdge {
  /** 起点 id（父节点） */
  from: string
  /** 终点 id（子节点） */
  to: string
}

/** 扁平化线段树结构（供可视化器使用） */
export interface SegmentTreeFlattened {
  nodes: SegmentTreeFlattenedNode[]
  edges: SegmentTreeFlattenedEdge[]
  /** 原始数组（供可视化器展示底层数据） */
  originalArray: number[]
}

/** 默认初始数组 */
export const DEFAULT_ARRAY = [10, 20, 5, 6, 12, 30, 7, 17]

/**
 * 递归构建线段树
 *
 * @param arr 原始数组
 * @param start 当前区间左端点
 * @param end 当前区间右端点
 * @returns 线段树节点
 */
function buildRecursive(arr: number[], start: number, end: number): SegmentTreeNode {
  // 叶子节点：区间长度为 1
  if (start === end) {
    return { start, end, sum: arr[start], left: null, right: null }
  }
  const mid = Math.floor((start + end) / 2)
  const left = buildRecursive(arr, start, mid)
  const right = buildRecursive(arr, mid + 1, end)
  return { start, end, sum: left.sum + right.sum, left, right }
}

/**
 * 从数组构建线段树
 *
 * @param arr 原始数组
 * @returns 线段树根节点（空数组返回 null）
 */
export function buildSegmentTree(arr: number[]): SegmentTreeNode | null {
  if (arr.length === 0) return null
  return buildRecursive(arr, 0, arr.length - 1)
}

/**
 * 区间查询（求和）
 *
 * 三种情况：
 * 1. 无交集：返回 0
 * 2. 完全包含：返回当前节点 sum
 * 3. 部分交集：递归查询左右子树
 *
 * @param root 根节点
 * @param queryStart 查询区间左端点
 * @param queryEnd 查询区间右端点
 * @returns 区间求和结果
 */
export function querySegmentTree(root: SegmentTreeNode | null, queryStart: number, queryEnd: number): number {
  if (!root) return 0
  // 无交集
  if (queryEnd < root.start || queryStart > root.end) return 0
  // 完全包含
  if (queryStart <= root.start && root.end <= queryEnd) return root.sum
  // 部分交集：递归
  return querySegmentTree(root.left, queryStart, queryEnd) + querySegmentTree(root.right, queryStart, queryEnd)
}

/**
 * 带路径的区间查询（供动画使用）
 *
 * @param root 根节点
 * @param queryStart 查询区间左端点
 * @param queryEnd 查询区间右端点
 * @returns 求和结果 + 访问路径（每步包含节点区间和 sum）
 */
export function querySegmentTreeWithPath(
  root: SegmentTreeNode | null,
  queryStart: number,
  queryEnd: number
): { sum: number; path: { start: number; end: number; sum: number }[] } {
  const path: { start: number; end: number; sum: number }[] = []

  const query = (node: SegmentTreeNode | null): number => {
    if (!node) return 0
    // 记录访问路径
    path.push({ start: node.start, end: node.end, sum: node.sum })
    // 无交集
    if (queryEnd < node.start || queryStart > node.end) return 0
    // 完全包含
    if (queryStart <= node.start && node.end <= queryEnd) return node.sum
    // 部分交集：递归
    return query(node.left) + query(node.right)
  }

  const sum = query(root)
  return { sum, path }
}

/**
 * 单点更新（不可变：返回新树）
 *
 * 从根节点递归到目标叶子节点，更新值后自底向上重新计算 sum。
 *
 * @param root 根节点（不会被修改）
 * @param index 待更新的数组下标
 * @param value 新值
 * @returns 新的根节点
 */
export function updateSegmentTree(root: SegmentTreeNode | null, index: number, value: number): SegmentTreeNode | null {
  if (!root) return null

  // 叶子节点：直接更新 sum
  if (root.start === root.end) {
    return { ...root, sum: value }
  }

  const mid = Math.floor((root.start + root.end) / 2)
  if (index <= mid) {
    // 更新左子树
    const newLeft = updateSegmentTree(root.left, index, value)
    return {
      ...root,
      left: newLeft,
      sum: (newLeft?.sum ?? 0) + (root.right?.sum ?? 0),
    }
  } else {
    // 更新右子树
    const newRight = updateSegmentTree(root.right, index, value)
    return {
      ...root,
      right: newRight,
      sum: (root.left?.sum ?? 0) + (newRight?.sum ?? 0),
    }
  }
}

/**
 * 带路径的单点更新（供动画使用）
 *
 * @param root 根节点（不会被修改）
 * @param index 待更新的数组下标
 * @param value 新值
 * @returns 新的根节点 + 访问路径
 */
export function updateSegmentTreeWithPath(
  root: SegmentTreeNode | null,
  index: number,
  value: number
): { root: SegmentTreeNode | null; path: { start: number; end: number; sum: number }[] } {
  const path: { start: number; end: number; sum: number }[] = []

  const update = (node: SegmentTreeNode | null): SegmentTreeNode | null => {
    if (!node) return null
    // 记录访问路径
    path.push({ start: node.start, end: node.end, sum: node.sum })

    // 叶子节点
    if (node.start === node.end) {
      return { ...node, sum: value }
    }

    const mid = Math.floor((node.start + node.end) / 2)
    if (index <= mid) {
      const newLeft = update(node.left)
      return {
        ...node,
        left: newLeft,
        sum: (newLeft?.sum ?? 0) + (node.right?.sum ?? 0),
      }
    } else {
      const newRight = update(node.right)
      return {
        ...node,
        right: newRight,
        sum: (node.left?.sum ?? 0) + (newRight?.sum ?? 0),
      }
    }
  }

  const newRoot = update(root)
  return { root: newRoot, path }
}

/**
 * 统计线段树中的节点总数
 */
export function countSegmentTreeNodes(root: SegmentTreeNode | null): number {
  if (!root) return 0
  return 1 + countSegmentTreeNodes(root.left) + countSegmentTreeNodes(root.right)
}

/**
 * 获取线段树的高度（叶子节点高度为 1）
 */
export function getSegmentTreeHeight(root: SegmentTreeNode | null): number {
  if (!root) return 0
  if (!root.left && !root.right) return 1
  return 1 + Math.max(getSegmentTreeHeight(root.left), getSegmentTreeHeight(root.right))
}

/**
 * 扁平化线段树（供可视化器使用）
 * 使用层序遍历生成节点和边的列表
 *
 * @param root 根节点
 * @param originalArray 原始数组
 * @returns 扁平化结构
 */
export function segmentTreeToFlattened(root: SegmentTreeNode | null, originalArray: number[]): SegmentTreeFlattened {
  const nodes: SegmentTreeFlattenedNode[] = []
  const edges: SegmentTreeFlattenedEdge[] = []

  if (!root) return { nodes, edges, originalArray }

  let idCounter = 0
  const queue: { node: SegmentTreeNode; id: string; parent: string; level: number }[] = [
    { node: root, id: '0', parent: '', level: 0 },
  ]
  idCounter = 1

  while (queue.length > 0) {
    const { node, id, parent, level } = queue.shift() as {
      node: SegmentTreeNode
      id: string
      parent: string
      level: number
    }

    const childrenIds: string[] = []
    const isLeaf = node.left === null && node.right === null

    if (node.left) {
      const childId = String(idCounter++)
      childrenIds.push(childId)
      queue.push({ node: node.left, id: childId, parent: id, level: level + 1 })
    }
    if (node.right) {
      const childId = String(idCounter++)
      childrenIds.push(childId)
      queue.push({ node: node.right, id: childId, parent: id, level: level + 1 })
    }

    nodes.push({
      id,
      start: node.start,
      end: node.end,
      sum: node.sum,
      childrenIds,
      parent,
      level,
      isLeaf,
      x: 0,
      y: 0,
      highlighted: false,
    })

    if (parent !== '') {
      edges.push({ from: parent, to: id })
    }
  }

  return { nodes, edges, originalArray }
}

/**
 * 验证线段树性质（用于测试）
 * 1. 每个节点的 sum 等于左右子节点 sum 之和（非叶子节点）
 * 2. 叶子节点的区间长度为 1
 * 3. 节点区间连续（左子节点 end + 1 == 右子节点 start）
 * 4. 节点区间包含子节点区间
 */
export function validateSegmentTree(root: SegmentTreeNode | null, arr: number[]): {
  valid: boolean
  sumCorrect: boolean
  leafCorrect: boolean
  rangeContinuous: boolean
  rangeContained: boolean
} {
  let sumCorrect = true
  let leafCorrect = true
  let rangeContinuous = true
  let rangeContained = true

  const check = (node: SegmentTreeNode | null): void => {
    if (!node) return

    if (!node.left && !node.right) {
      // 叶子节点：区间长度应为 1
      if (node.start !== node.end) {
        leafCorrect = false
      }
      // 叶子节点 sum 应等于原数组对应元素
      if (node.start >= 0 && node.start < arr.length && node.sum !== arr[node.start]) {
        sumCorrect = false
      }
      return
    }

    // 非叶子节点：应有左右子节点
    if (!node.left || !node.right) {
      sumCorrect = false
      return
    }

    // sum 应等于左右子节点之和
    if (node.sum !== node.left.sum + node.right.sum) {
      sumCorrect = false
    }

    // 区间连续：左子 end + 1 == 右子 start
    if (node.left.end + 1 !== node.right.start) {
      rangeContinuous = false
    }

    // 区间包含：子节点区间应在父节点区间内
    if (node.left.start < node.start || node.left.end > node.end ||
        node.right.start < node.start || node.right.end > node.end) {
      rangeContained = false
    }

    // 中点应正确
    const mid = Math.floor((node.start + node.end) / 2)
    if (node.left.end !== mid || node.right.start !== mid + 1) {
      rangeContinuous = false
    }

    check(node.left)
    check(node.right)
  }

  check(root)

  return {
    valid: sumCorrect && leafCorrect && rangeContinuous && rangeContained,
    sumCorrect,
    leafCorrect,
    rangeContinuous,
    rangeContained,
  }
}

/**
 * 线段树类（封装常用操作，便于测试和使用）
 */
export class SegmentTree {
  root: SegmentTreeNode | null
  /** 原始数组 */
  array: number[]

  constructor(arr: number[] = DEFAULT_ARRAY) {
    this.array = [...arr]
    this.root = buildSegmentTree(this.array)
  }

  /** 从新数组重建线段树 */
  build(arr: number[]): void {
    this.array = [...arr]
    this.root = buildSegmentTree(this.array)
  }

  /** 区间查询 */
  query(queryStart: number, queryEnd: number): number {
    return querySegmentTree(this.root, queryStart, queryEnd)
  }

  /** 单点更新 */
  update(index: number, value: number): void {
    this.array[index] = value
    this.root = updateSegmentTree(this.root, index, value)
  }

  /** 节点总数 */
  get nodeCount(): number {
    return countSegmentTreeNodes(this.root)
  }

  /** 树高度 */
  get height(): number {
    return getSegmentTreeHeight(this.root)
  }

  /** 扁平化 */
  flatten(): SegmentTreeFlattened {
    return segmentTreeToFlattened(this.root, this.array)
  }

  /** 验证线段树性质 */
  validate(): ReturnType<typeof validateSegmentTree> {
    return validateSegmentTree(this.root, this.array)
  }
}
