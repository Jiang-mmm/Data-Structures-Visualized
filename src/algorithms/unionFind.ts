/**
 * 并查集（Union-Find / Disjoint Set Union）算法实现
 *
 * 核心特性：
 * 1. 高效处理不相交集合的合并与查询
 * 2. 路径压缩 + 按秩合并，均摊 O(α(n)) ≈ O(1)
 * 3. 所有操作采用不可变更新（返回新对象，不修改输入）
 *
 * 数据表示：扁平化结构（UnionFindData），便于序列化和 D3 渲染
 * - nodes: 节点列表
 * - edges: parent 关系边（子→父，根节点不出现在 edges 中）
 * - parent: id -> parent id 映射（根节点的 parent 指向自己）
 * - rank: id -> rank 映射（按秩合并用）
 */

/** 并查集节点（扁平化表示） */
export interface UnionFindNode {
  id: string
  value: number
}

/** 并查集边（parent 关系：子→父） */
export interface UnionFindEdge {
  source: string  // 子节点 id
  target: string  // 父节点 id
}

/** 并查集完整数据（用于状态管理与可视化） */
export interface UnionFindData {
  nodes: UnionFindNode[]
  edges: UnionFindEdge[]
  parent: Record<string, string>
  rank: Record<string, number>
}

/** find 操作结果 */
export interface UnionFindFindResult {
  /** 应用路径压缩后的新数据（无变化时返回原对象） */
  data: UnionFindData
  /** 根节点 id */
  rootId: string
  /** 查找路径（从查询节点到根，不含根） */
  path: string[]
}

/** 默认初始值 */
const DEFAULT_VALUES = [1, 2, 3, 4, 5, 6, 7, 8]

/**
 * 根据 value 生成节点 id
 */
export function makeId(value: number): string {
  return `n${value}`
}

/**
 * 内部：根据 parent 映射重建 edges
 * 根节点（parent 指向自己）不出现在 edges 中
 */
function rebuildEdges(nodes: UnionFindNode[], parent: Record<string, string>): UnionFindEdge[] {
  const edges: UnionFindEdge[] = []
  for (const node of nodes) {
    const p = parent[node.id]
    if (p && p !== node.id) {
      edges.push({ source: node.id, target: p })
    }
  }
  return edges
}

/**
 * 内部：不带路径压缩的找根（用于 connected / getComponents 等只读操作）
 */
function findRoot(data: UnionFindData, id: string): string {
  let current = id
  const visited = new Set<string>()
  while (data.parent[current] !== current) {
    if (visited.has(current)) break  // 循环引用保护
    visited.add(current)
    current = data.parent[current]
  }
  return current
}

/**
 * Create a Union-Find data structure
 * @param values 初始值数组，默认 [1,2,3,4,5,6,7,8]
 */
export function createUnionFind(values: number[] = DEFAULT_VALUES): UnionFindData {
  const nodes: UnionFindNode[] = []
  const parent: Record<string, string> = {}
  const rank: Record<string, number> = {}
  for (const v of values) {
    const id = makeId(v)
    nodes.push({ id, value: v })
    parent[id] = id
    rank[id] = 0
  }
  return { nodes, edges: [], parent, rank }
}

/**
 * Build an initial Union-Find with example data
 * 预合并：{1,2,3}, {4,5}, {6,7,8}，共 3 个连通分量
 */
export function buildInitialUnionFind(): UnionFindData {
  let data = createUnionFind()
  data = union(data, makeId(1), makeId(2))
  data = union(data, makeId(1), makeId(3))
  data = union(data, makeId(4), makeId(5))
  data = union(data, makeId(6), makeId(7))
  data = union(data, makeId(6), makeId(8))
  return data
}

/**
 * Find the root of a node with path compression
 * 不可变更新：返回新的 UnionFindData（无变化时返回原对象）
 */
export function find(data: UnionFindData, id: string): UnionFindFindResult {
  // 节点不存在
  if (!(id in data.parent)) {
    return { data, rootId: id, path: [] }
  }

  // 遍历到根，收集路径
  const path: string[] = []
  let current = id
  const visited = new Set<string>()
  while (data.parent[current] !== current) {
    if (visited.has(current)) break  // 循环引用保护
    visited.add(current)
    path.push(current)
    current = data.parent[current]
  }
  const rootId = current

  // 路径长度 <= 1 表示无需压缩（节点本身就是根，或直接指向根）
  if (path.length <= 1) {
    return { data, rootId, path }
  }

  // 路径压缩：将路径上所有节点直接指向根
  const newParent = { ...data.parent }
  for (const nodeId of path) {
    newParent[nodeId] = rootId
  }

  const newData: UnionFindData = {
    ...data,
    parent: newParent,
    edges: rebuildEdges(data.nodes, newParent),
  }
  return { data: newData, rootId, path }
}

/**
 * Union two nodes' sets using union by rank
 * 不可变更新：返回新的 UnionFindData（已在同一集合时返回压缩后的数据）
 */
export function union(data: UnionFindData, a: string, b: string): UnionFindData {
  // 节点不存在
  if (!(a in data.parent) || !(b in data.parent)) {
    return data
  }

  // 查找根（带路径压缩）
  const findA = find(data, a)
  const findB = find(findA.data, b)
  const rootA = findA.rootId
  const rootB = findB.rootId
  const compressed = findB.data

  // 已在同一集合
  if (rootA === rootB) {
    return compressed
  }

  // 按秩合并
  const newParent = { ...compressed.parent }
  const newRank = { ...compressed.rank }

  const rankA = newRank[rootA] || 0
  const rankB = newRank[rootB] || 0

  if (rankA < rankB) {
    newParent[rootA] = rootB
  } else if (rankA > rankB) {
    newParent[rootB] = rootA
  } else {
    // 秩相等，挂 B 下，A 的秩 +1
    newParent[rootB] = rootA
    newRank[rootA] = rankA + 1
  }

  return {
    ...compressed,
    parent: newParent,
    rank: newRank,
    edges: rebuildEdges(compressed.nodes, newParent),
  }
}

/**
 * Check if two nodes are in the same set (read-only, no compression)
 */
export function connected(data: UnionFindData, a: string, b: string): boolean {
  if (!(a in data.parent) || !(b in data.parent)) {
    return false
  }
  const rootA = findRoot(data, a)
  const rootB = findRoot(data, b)
  return rootA === rootB
}

/**
 * Get the number of connected components
 */
export function getComponents(data: UnionFindData): number {
  const roots = new Set<string>()
  for (const node of data.nodes) {
    roots.add(findRoot(data, node.id))
  }
  return roots.size
}

/**
 * Add a new node as a singleton set
 * 不可变更新：返回新的 UnionFindData（值已存在时返回原对象）
 */
export function addNode(data: UnionFindData, value: number): UnionFindData {
  if (data.nodes.some(n => n.value === value)) {
    return data
  }
  const id = makeId(value)
  const newNode: UnionFindNode = { id, value }
  const newParent = { ...data.parent, [id]: id }
  const newRank = { ...data.rank, [id]: 0 }
  return {
    ...data,
    nodes: [...data.nodes, newNode],
    parent: newParent,
    rank: newRank,
    edges: data.edges,  // 新节点是根，无新边
  }
}

/**
 * Remove a node from the Union-Find
 * 子节点重新挂到被删节点的父节点上；若被删节点是根，则提升第一个子节点为新根
 * 不可变更新：返回新的 UnionFindData（值不存在时返回原对象）
 */
export function removeNode(data: UnionFindData, value: number): UnionFindData {
  const target = data.nodes.find(n => n.value === value)
  if (!target) return data
  const targetId = target.id

  const targetParent = data.parent[targetId]
  const isRoot = targetParent === targetId
  const children = data.nodes
    .filter(n => data.parent[n.id] === targetId && n.id !== targetId)
    .map(n => n.id)

  const newParent = { ...data.parent }
  const newRank = { ...data.rank }

  if (isRoot) {
    if (children.length > 0) {
      // 选第一个子节点作为新根
      const newRoot = children[0]
      newParent[newRoot] = newRoot
      // 其他子节点挂到新根下
      for (let i = 1; i < children.length; i++) {
        newParent[children[i]] = newRoot
      }
      // 新根继承 target 的秩
      newRank[newRoot] = data.rank[targetId]
    }
  } else {
    // target 不是根，将子节点挂到 target 的父节点上
    for (const childId of children) {
      newParent[childId] = targetParent
    }
  }

  delete newParent[targetId]
  delete newRank[targetId]
  const newNodes = data.nodes.filter(n => n.id !== targetId)

  return {
    ...data,
    nodes: newNodes,
    parent: newParent,
    rank: newRank,
    edges: rebuildEdges(newNodes, newParent),
  }
}

/**
 * Get all node values sorted ascending
 */
export function getValues(data: UnionFindData): number[] {
  return data.nodes.map(n => n.value).sort((a, b) => a - b)
}

/**
 * Get node count
 */
export function countNodes(data: UnionFindData): number {
  return data.nodes.length
}

/**
 * Find node id by value
 */
export function findIdByValue(data: UnionFindData, value: number): string | undefined {
  return data.nodes.find(n => n.value === value)?.id
}

/**
 * Get children of a node (nodes whose parent is the given id, excluding self)
 */
export function getChildren(data: UnionFindData, id: string): string[] {
  return data.nodes
    .filter(n => data.parent[n.id] === id && n.id !== id)
    .map(n => n.id)
}

/**
 * Get all members in the same component as the given root (including root)
 */
export function getComponentMembers(data: UnionFindData, rootId: string): string[] {
  const members: string[] = [rootId]
  for (const node of data.nodes) {
    if (node.id === rootId) continue
    if (findRoot(data, node.id) === rootId) {
      members.push(node.id)
    }
  }
  return members
}
