import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'

export const realWorldApplicationsConfig: LearningModeConfig = {
  algorithmKey: 'realWorldApplications',
  steps: [
    {
      id: 'browserHistory',
      title: tStatic('learningSteps.realWorldApplications.steps.browserHistory.title'),
      description: tStatic('learningSteps.realWorldApplications.steps.browserHistory.description'),
      codeSnippet: `// 浏览器历史记录：双栈模型
class BrowserHistory {
  constructor(homepage) {
    this.back = [homepage]   // 后退栈（栈顶为当前页）
    this.forward = []        // 前进栈
  }
  visit(url) {
    this.back.push(url)      // 访问新页面
    this.forward = []        // 清空前进栈（新分支）
  }
  back(n) {
    while (n-- > 0 && this.back.length > 1) {
      this.forward.push(this.back.pop())  // 当前页→前进栈
    }
    return this.back[this.back.length - 1]
  }
  forward(n) {
    while (n-- > 0 && this.forward.length > 0) {
      this.back.push(this.forward.pop())  // 前进栈→当前页
    }
    return this.back[this.back.length - 1]
  }
}
// 栈的 LIFO 特性天然匹配"最近访问优先回退"的语义`,
      highlightedLine: 8,
      highlightTerms: tStatic('learningSteps.realWorldApplications.steps.browserHistory.highlightTerms').split('|'),
      tips: tStatic('learningSteps.realWorldApplications.steps.browserHistory.tips').split('|'),
      complexity: { time: tStatic('learningSteps.realWorldApplications.steps.browserHistory.complexityTime'), space: tStatic('learningSteps.realWorldApplications.steps.browserHistory.complexitySpace') },
    },
    {
      id: 'taskQueue',
      title: tStatic('learningSteps.realWorldApplications.steps.taskQueue.title'),
      description: tStatic('learningSteps.realWorldApplications.steps.taskQueue.description'),
      codeSnippet: `// 任务队列：FIFO 保证公平调度
class TaskQueue {
  constructor() { this.queue = [] }
  enqueue(task) { this.queue.push(task) }      // 入队
  dequeue() { return this.queue.shift() }      // 出队（队首）
  peek() { return this.queue[0] }              // 查看队首
  get size() { return this.queue.length }
}

// JavaScript 事件循环模型
// ┌─────────────────────────────┐
// │  宏任务队列（setTimeout 等）  │ ← FIFO
// └─────────────────────────────┘
//         ↓ 取出执行
// ┌─────────────────────────────┐
// │  微任务队列（Promise.then）  │ ← FIFO，优先于宏任务
// └─────────────────────────────┘
// 应用场景：
// - 消息队列：生产者-消费者解耦
// - 进程调度：FCFS 公平调度
// - 打印机：先到先打印
// - BFS：层序遍历天然用队列`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.realWorldApplications.steps.taskQueue.highlightTerms').split('|'),
      tips: tStatic('learningSteps.realWorldApplications.steps.taskQueue.tips').split('|'),
      complexity: { time: tStatic('learningSteps.realWorldApplications.steps.taskQueue.complexityTime'), space: tStatic('learningSteps.realWorldApplications.steps.taskQueue.complexitySpace') },
    },
    {
      id: 'fileSystem',
      title: tStatic('learningSteps.realWorldApplications.steps.fileSystem.title'),
      description: tStatic('learningSteps.realWorldApplications.steps.fileSystem.description'),
      codeSnippet: `// 文件系统：多叉树结构
//        / (root)
//       / | \\
//     home usr bin
//    / |     |
//  user1 user2  python
//   |
//  docs
class FileNode {
  constructor(name, type = 'dir') {
    this.name = name
    this.type = type        // 'dir' | 'file'
    this.children = {}      // 目录的子节点
    this.content = null     // 文件的内容
  }
}

// 路径查找：从根遍历
function resolve(root, path) {
  const parts = path.split('/').filter(Boolean)
  let node = root
  for (const part of parts) {
    if (!node.children[part]) return null  // 路径不存在
    node = node.children[part]
  }
  return node
}
// 应用：目录树、DOM 树、AST、XML/JSON 解析、组织架构`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.realWorldApplications.steps.fileSystem.highlightTerms').split('|'),
      tips: tStatic('learningSteps.realWorldApplications.steps.fileSystem.tips').split('|'),
      complexity: { time: tStatic('learningSteps.realWorldApplications.steps.fileSystem.complexityTime'), space: tStatic('learningSteps.realWorldApplications.steps.fileSystem.complexitySpace') },
    },
    {
      id: 'socialNetwork',
      title: tStatic('learningSteps.realWorldApplications.steps.socialNetwork.title'),
      description: tStatic('learningSteps.realWorldApplications.steps.socialNetwork.description'),
      codeSnippet: `// 社交网络：图建模
// 用户 = 节点，关系 = 边
// 微信好友：无向图（互为好友）
// 微博关注：有向图（单向关注）
const socialGraph = {
  Alice: ['Bob', 'Carol'],
  Bob: ['Alice', 'David', 'Eve'],
  Carol: ['Alice', 'Eve'],
  David: ['Bob'],
  Eve: ['Bob', 'Carol'],
}

// 好友推荐：共同好友数（二度人脉）
function recommendFriends(graph, user) {
  const direct = new Set(graph[user])
  const count = {}
  for (const friend of graph[user]) {
    for (const f2 of graph[friend]) {
      if (f2 !== user && !direct.has(f2))
        count[f2] = (count[f2] || 0) + 1
    }
  }
  return Object.entries(count).sort((a,b) => b[1]-a[1])
}

// 最短关系链：BFS（六度分隔理论）
// 社群发现：连通分量 / 模块度算法`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.realWorldApplications.steps.socialNetwork.highlightTerms').split('|'),
      tips: tStatic('learningSteps.realWorldApplications.steps.socialNetwork.tips').split('|'),
      complexity: { time: tStatic('learningSteps.realWorldApplications.steps.socialNetwork.complexityTime'), space: tStatic('learningSteps.realWorldApplications.steps.socialNetwork.complexitySpace') },
    },
    {
      id: 'searchEngine',
      title: tStatic('learningSteps.realWorldApplications.steps.searchEngine.title'),
      description: tStatic('learningSteps.realWorldApplications.steps.searchEngine.description'),
      codeSnippet: `// 搜索引擎自动补全：Trie + 优先队列
class TrieNode {
  constructor() {
    this.children = {}
    this.isEnd = false
    this.freq = 0  // 搜索频次（用于排序）
  }
}

// 插入搜索词
function insert(root, word, freq = 1) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch]) node.children[ch] = new TrieNode()
    node = node.children[ch]
  }
  node.isEnd = true
  node.freq += freq
}

// 自动补全：前缀匹配 + 按频次排序
function autocomplete(root, prefix, k = 5) {
  let node = root
  for (const ch of prefix) {
    if (!node.children[ch]) return []
    node = node.children[ch]
  }
  // DFS 收集所有以 prefix 开头的单词
  const results = []
  const dfs = (n, path) => {
    if (n.isEnd) results.push([path, n.freq])
    for (const ch in n.children) dfs(n.children[ch], path + ch)
  }
  dfs(node, prefix)
  return results.sort((a,b) => b[1]-a[1]).slice(0, k).map(x => x[0])
}
// 应用：Google 搜索建议、IDE 代码补全、输入法联想`,
      highlightedLine: 4,
      highlightTerms: tStatic('learningSteps.realWorldApplications.steps.searchEngine.highlightTerms').split('|'),
      tips: tStatic('learningSteps.realWorldApplications.steps.searchEngine.tips').split('|'),
      complexity: { time: tStatic('learningSteps.realWorldApplications.steps.searchEngine.complexityTime'), space: tStatic('learningSteps.realWorldApplications.steps.searchEngine.complexitySpace') },
    },
    {
      id: 'cache',
      title: tStatic('learningSteps.realWorldApplications.steps.cache.title'),
      description: tStatic('learningSteps.realWorldApplications.steps.cache.description'),
      codeSnippet: `// LRU 缓存：哈希表 + 双向链表
class LRUCache {
  constructor(capacity) {
    this.cap = capacity
    this.map = new Map()       // key → node
    // 双向链表哨兵（head 最近使用，tail 最久未使用）
    this.head = { next: null }
    this.tail = { prev: null }
    this.head.next = this.tail
    this.tail.prev = this.head
  }
  get(key) {
    if (!this.map.has(key)) return -1
    const node = this.map.get(key)
    this.moveToFront(node)     // 访问即提升到队首
    return node.value
  }
  put(key, value) {
    if (this.map.has(key)) {
      const node = this.map.get(key)
      node.value = value
      this.moveToFront(node)
    } else {
      if (this.map.size >= this.cap) this.evict()  // 淘汰队尾
      const node = { key, value }
      this.map.set(key, node)
      this.addToFront(node)
    }
  }
}
// 哈希表：O(1) 查找 key
// 双向链表：O(1) 调整顺序
// 应用：Redis、浏览器缓存、CPU Cache、数据库缓冲池`,
      highlightedLine: 5,
      highlightTerms: tStatic('learningSteps.realWorldApplications.steps.cache.highlightTerms').split('|'),
      tips: tStatic('learningSteps.realWorldApplications.steps.cache.tips').split('|'),
      complexity: { time: tStatic('learningSteps.realWorldApplications.steps.cache.complexityTime'), space: tStatic('learningSteps.realWorldApplications.steps.cache.complexitySpace') },
    },
  ],
}
