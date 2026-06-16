export interface LearningPathNode {
  id: string
  nameKey: string
  descriptionKey: string
  path: string
  category: 'linear' | 'tree' | 'graph' | 'hash' | 'sort'
  prerequisites: string[]
  difficulty: 1 | 2 | 3
}

export const LEARNING_PATH: LearningPathNode[] = [
  // 基础线性结构
  {
    id: 'array',
    nameKey: 'sidebar.array',
    descriptionKey: 'learningPath.desc.array',
    path: '/array',
    category: 'linear',
    prerequisites: [],
    difficulty: 1,
  },
  {
    id: 'stack',
    nameKey: 'sidebar.stack',
    descriptionKey: 'learningPath.desc.stack',
    path: '/stack',
    category: 'linear',
    prerequisites: ['array'],
    difficulty: 1,
  },
  {
    id: 'queue',
    nameKey: 'sidebar.queue',
    descriptionKey: 'learningPath.desc.queue',
    path: '/queue',
    category: 'linear',
    prerequisites: ['array'],
    difficulty: 1,
  },
  {
    id: 'linkedlist',
    nameKey: 'sidebar.linkedlist',
    descriptionKey: 'learningPath.desc.linkedlist',
    path: '/linkedlist',
    category: 'linear',
    prerequisites: ['array'],
    difficulty: 2,
  },

  // 树结构
  {
    id: 'tree',
    nameKey: 'sidebar.tree',
    descriptionKey: 'learningPath.desc.tree',
    path: '/tree',
    category: 'tree',
    prerequisites: ['linkedlist'],
    difficulty: 2,
  },
  {
    id: 'heap',
    nameKey: 'sidebar.heap',
    descriptionKey: 'learningPath.desc.heap',
    path: '/heap',
    category: 'tree',
    prerequisites: ['tree'],
    difficulty: 2,
  },
  {
    id: 'trie',
    nameKey: 'sidebar.trie',
    descriptionKey: 'learningPath.desc.trie',
    path: '/trie',
    category: 'tree',
    prerequisites: ['tree'],
    difficulty: 3,
  },

  // 哈希
  {
    id: 'hash',
    nameKey: 'sidebar.hash',
    descriptionKey: 'learningPath.desc.hash',
    path: '/hash',
    category: 'hash',
    prerequisites: ['array'],
    difficulty: 2,
  },

  // 图
  {
    id: 'graph',
    nameKey: 'sidebar.graph',
    descriptionKey: 'learningPath.desc.graph',
    path: '/graph',
    category: 'graph',
    prerequisites: ['linkedlist', 'queue'],
    difficulty: 3,
  },

  // 排序
  {
    id: 'sort',
    nameKey: 'sidebar.sort',
    descriptionKey: 'learningPath.desc.sort',
    path: '/sort',
    category: 'sort',
    prerequisites: ['array'],
    difficulty: 2,
  },
]

export const CATEGORY_COLORS: Record<string, string> = {
  linear: '#2563eb',
  tree: '#059669',
  hash: '#ea580c',
  graph: '#7c3aed',
  sort: '#dc2626',
}

export const CATEGORY_LABELS: Record<string, string> = {
  linear: 'learningPath.category.linear',
  tree: 'learningPath.category.tree',
  hash: 'learningPath.category.hash',
  graph: 'learningPath.category.graph',
  sort: 'learningPath.category.sort',
}

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'learningPath.difficulty.beginner',
  2: 'learningPath.difficulty.intermediate',
  3: 'learningPath.difficulty.advanced',
}
