/**
 * 跳表（SkipList）算法实现
 *
 * 核心特性：
 * 1. 概率性平衡数据结构，期望 O(log n) 的查找/插入/删除
 * 2. 多层链表，高层索引下层，通过随机层数维持平衡
 * 3. 所有操作采用不可变更新（返回新对象，不修改输入）
 *
 * 数据表示：扁平化结构（SkipListData），便于序列化和 D3 渲染
 * - nodes: 节点列表（含 head 哨兵与 value 节点）
 * - edges: 同层节点之间的连接（含 level 字段标识层级）
 * - maxLevel: 当前最大层数
 */

/** 跳表节点（扁平化表示，每个节点记录其出现的最高层级） */
export interface SkipListNode {
  id: string
  value: number
  /** 该节点出现的最高层级（1-based，head 节点为 maxLevel） */
  level: number
}

/** 跳表边（同层节点之间的连接） */
export interface SkipListEdge {
  source: string
  target: string
  /** 层级（0-based，0 为最底层） */
  level: number
}

/** 跳表完整数据（用于状态管理与可视化） */
export interface SkipListData {
  nodes: SkipListNode[]
  edges: SkipListEdge[]
  maxLevel: number
}

/** 搜索路径上的一个访问点 */
export interface SkipListSearchStep {
  nodeId: string
  level: number
}

/** 搜索结果 */
export interface SkipListSearchResult {
  found: boolean
  path: SkipListSearchStep[]
}

/** 最大层数上限 */
export const MAX_LEVEL = 8
/** 晋升概率（每层以 P 的概率提升一级） */
export const P = 0.5

/** head 哨兵节点 id */
export const HEAD_ID = 'head'
/** head 哨兵节点值（-Infinity 表示最小） */
export const HEAD_VALUE = -Infinity

/**
 * 随机决定节点层数
 * 每层以 P 的概率提升，最高不超过 MAX_LEVEL
 */
export function randomLevel(): number {
  let level = 1
  while (level < MAX_LEVEL && Math.random() < P) {
    level++
  }
  return level
}

/**
 * 创建空跳表
 */
export function createSkipList(): SkipListData {
  return {
    nodes: [{ id: HEAD_ID, value: HEAD_VALUE, level: 1 }],
    edges: [],
    maxLevel: 1,
  }
}

/**
 * 创建初始跳表（含示例值）
 */
export function buildInitialSkipList(): SkipListData {
  let data = createSkipList()
  const initialValues = [10, 20, 30, 40, 50]
  for (const v of initialValues) {
    data = insertSkipList(data, v)
  }
  return data
}

/**
 * 内部：构建跳表的层级链表结构
 * 返回 levels[i] = 第 i 层的节点 id 序列（从 head 开始）
 */
function buildLevels(data: SkipListData): string[][] {
  if (data.maxLevel <= 0) return []
  const levels: string[][] = Array.from({ length: data.maxLevel }, () => [])
  // 第 0 层（最底层）包含所有节点
  // 通过 edges 重建每层的链表顺序
  for (let lvl = 0; lvl < data.maxLevel; lvl++) {
    const edgesAtLevel = data.edges.filter(e => e.level === lvl)
    // 从 head 开始遍历
    const nextMap = new Map<string, string>()
    for (const e of edgesAtLevel) {
      nextMap.set(e.source, e.target)
    }
    const seq: string[] = [HEAD_ID]
    let cur: string | undefined = HEAD_ID
    const visited = new Set<string>([HEAD_ID])
    while (cur !== undefined) {
      const next = nextMap.get(cur)
      if (next === undefined) break
      if (visited.has(next)) break
      seq.push(next)
      visited.add(next)
      cur = next
    }
    levels[lvl] = seq
  }
  return levels
}

/**
 * 内部：根据节点 id 序列与 maxLevel 重建 SkipListData
 * 用于插入/删除后重新生成 edges
 */
function rebuildFromLevels(
  nodeLevels: Map<string, number>,
  maxLevel: number,
  nodeValues: Map<string, number>,
): SkipListData {
  const nodeIds = Array.from(nodeLevels.keys())
  const nodes: SkipListNode[] = nodeIds.map(id => ({
    id,
    value: nodeValues.get(id) as number,
    level: nodeLevels.get(id) as number,
  }))
  const edges: SkipListEdge[] = []

  // 第 0 层按插入顺序连接（head 在最前）
  // 节点顺序：head, 然后按 value 升序
  const sortedValueNodes = nodeIds
    .filter(id => id !== HEAD_ID)
    .sort((a, b) => (nodeValues.get(a) as number) - (nodeValues.get(b) as number))
  const level0Seq = [HEAD_ID, ...sortedValueNodes]
  for (let i = 0; i < level0Seq.length - 1; i++) {
    edges.push({ source: level0Seq[i], target: level0Seq[i + 1], level: 0 })
  }

  // 高层：只连接 level >= 该层的节点
  for (let lvl = 1; lvl < maxLevel; lvl++) {
    const seq = level0Seq.filter(id => {
      const nl = nodeLevels.get(id) as number
      return nl >= lvl + 1
    })
    for (let i = 0; i < seq.length - 1; i++) {
      edges.push({ source: seq[i], target: seq[i + 1], level: lvl })
    }
  }

  return { nodes, edges, maxLevel }
}

/**
 * 插入值到跳表
 * 不可变更新：返回新的 SkipListData
 */
export function insertSkipList(data: SkipListData, value: number): SkipListData {
  // 检查重复（跳表不允许重复值，与 AVL 保持一致）
  const exists = data.nodes.some(n => n.value === value)
  if (exists) return data

  const newLevel = randomLevel()
  const newMaxLevel = Math.max(data.maxLevel, newLevel)
  const newId = `n-${value}`

  // 复制节点层级映射
  const nodeLevels = new Map<string, number>()
  const nodeValues = new Map<string, number>()
  for (const n of data.nodes) {
    nodeLevels.set(n.id, n.level)
    nodeValues.set(n.id, n.value)
  }
  // head 节点的 level 始终等于 maxLevel
  nodeLevels.set(HEAD_ID, newMaxLevel)
  nodeValues.set(HEAD_ID, HEAD_VALUE)
  // 新节点
  nodeLevels.set(newId, newLevel)
  nodeValues.set(newId, value)

  return rebuildFromLevels(nodeLevels, newMaxLevel, nodeValues)
}

/**
 * 搜索值在跳表中的路径
 * 从最高层开始，向右走直到下一个节点值 > 目标，然后下降一层
 */
export function searchSkipList(data: SkipListData, value: number): SkipListSearchResult {
  const path: SkipListSearchStep[] = []
  if (data.nodes.length === 0) return { found: false, path }

  const levels = buildLevels(data)
  if (levels.length === 0) return { found: false, path }

  // 从最高层开始
  let currentId = HEAD_ID
  for (let lvl = data.maxLevel - 1; lvl >= 0; lvl--) {
    const seq = levels[lvl]
    if (!seq) continue
    const idx = seq.indexOf(currentId)
    if (idx < 0) continue
    // 向右走直到下一个节点值 >= 目标
    let i = idx
    while (i + 1 < seq.length) {
      const nextId = seq[i + 1]
      const nextNode = data.nodes.find(n => n.id === nextId)
      if (!nextNode) break
      if (nextNode.value >= value) break
      i++
      currentId = nextId
      path.push({ nodeId: currentId, level: lvl })
    }
    // 检查下一个节点是否等于目标
    if (i + 1 < seq.length) {
      const nextId = seq[i + 1]
      const nextNode = data.nodes.find(n => n.id === nextId)
      if (nextNode && nextNode.value === value) {
        path.push({ nodeId: nextId, level: lvl })
        return { found: true, path }
      }
    }
    // 下降一层（currentId 保持不变）
  }
  return { found: false, path }
}

/**
 * 从跳表中删除值
 * 不可变更新：返回新的 SkipListData
 */
export function deleteSkipList(data: SkipListData, value: number): SkipListData {
  const target = data.nodes.find(n => n.value === value)
  if (!target) return data

  const nodeLevels = new Map<string, number>()
  const nodeValues = new Map<string, number>()
  for (const n of data.nodes) {
    if (n.id === target.id) continue
    nodeLevels.set(n.id, n.level)
    nodeValues.set(n.id, n.value)
  }

  // 重新计算 maxLevel（head 的 level 跟随 maxLevel）
  let newMaxLevel = 1
  for (const lvl of nodeLevels.values()) {
    if (lvl > newMaxLevel) newMaxLevel = lvl
  }
  nodeLevels.set(HEAD_ID, newMaxLevel)
  nodeValues.set(HEAD_ID, HEAD_VALUE)

  return rebuildFromLevels(nodeLevels, newMaxLevel, nodeValues)
}

/**
 * 获取跳表中所有值的升序列表
 */
export function getValues(data: SkipListData): number[] {
  return data.nodes
    .filter(n => n.id !== HEAD_ID)
    .map(n => n.value)
    .sort((a, b) => a - b)
}

/**
 * 获取跳表节点数（不含 head 哨兵）
 */
export function countNodes(data: SkipListData): number {
  return data.nodes.filter(n => n.id !== HEAD_ID).length
}
