import { STRUCTURE_KEYS } from '../components/Sidebar'
import { learningConfigs } from '../configs/learning'
import { tStatic } from '../i18n/useI18n'

/**
 * 搜索项类型
 */
export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  path: string
  keywords: string[]
  category: 'page' | 'learning'
}

/**
 * algorithmKey 到路由 path 的映射
 * 大部分 algorithmKey 直接对应 STRUCTURE_KEYS 的 key，但有些不同
 */
const ALGORITHM_KEY_TO_PATH: Record<string, string> = {
  // 数据结构页面
  linkedlist: '/linkedlist',
  doublyLinkedList: '/linkedlist',
  heapStructure: '/heap',
  avlTree: '/avl-tree',
  redBlackTree: '/red-black-tree',
  skipList: '/skip-list',
  unionFind: '/union-find',
  graph: '/graph',
  tree: '/tree',
  trie: '/trie',
  array: '/array',
  stack: '/stack',
  queue: '/queue',
  hash: '/hash',
  heap: '/heap',
  // 排序算法
  bubble: '/sort',
  quick: '/sort',
  merge: '/sort',
  selection: '/sort',
  insertion: '/sort',
  radix: '/sort',
  bucket: '/sort',
  shell: '/sort',
  comb: '/sort',
  tim: '/sort',
  counting: '/sort',
  // 图算法
  bfs: '/graph-algorithm',
  dfs: '/graph-algorithm',
  dijkstra: '/graph-algorithm',
  topoSort: '/graph-algorithm',
  bellmanFord: '/graph-algorithm',
  floydWarshall: '/graph-algorithm',
  prim: '/graph-algorithm',
  kruskal: '/graph-algorithm',
  // 通用学习配置（首页）
  complexityAnalysis: '/',
  advancedDataStructures: '/',
  realWorldApplications: '/',
}

/**
 * 根据 algorithmKey 获取对应的路由 path
 */
function getPathByAlgorithmKey(algorithmKey: string): string {
  return ALGORITHM_KEY_TO_PATH[algorithmKey] || '/'
}

/**
 * 构建全局搜索索引
 * 数据源：Sidebar 的 STRUCTURE_KEYS + learningConfigs
 */
export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = []

  // 数据源 1：STRUCTURE_KEYS（页面）
  for (const entry of STRUCTURE_KEYS) {
    // 跳过首页
    if (entry.key === 'home') continue

    const title = tStatic(`${entry.key}.title`)
    items.push({
      id: `page-${entry.key}`,
      title,
      path: entry.path,
      keywords: [entry.key, title, entry.path],
      category: 'page',
    })
  }

  // 数据源 2：learningConfigs（学习步骤）
  for (const [algorithmKey, config] of Object.entries(learningConfigs)) {
    const learningTitle = tStatic(`learning.${algorithmKey}.title`)
    // 如果 tStatic 返回 key 本身，说明翻译不存在，回退到 algorithmKey
    const subtitle = learningTitle === `learning.${algorithmKey}.title`
      ? algorithmKey
      : learningTitle
    const path = getPathByAlgorithmKey(algorithmKey)

    for (const step of config.steps) {
      items.push({
        id: `learning-${algorithmKey}-${step.id}`,
        title: step.title,
        subtitle,
        path,
        keywords: [
          step.title,
          algorithmKey,
          step.description.slice(0, 30),
        ],
        category: 'learning',
      })
    }
  }

  return items
}
