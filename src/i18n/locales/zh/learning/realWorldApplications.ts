/**
 * v20 M7 — learning config "realWorldApplications" 中文 locale（自动从 src/configs/learning/realWorldApplications.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const realWorldApplicationsLearningSteps = {
  steps: {
    "browserHistory": {
      title: '浏览器历史记录（栈）',
      description: '浏览器"后退/前进"功能由两个栈实现：访问新页面时把当前页压入后退栈，后退时弹出并压入前进栈，前进时反向操作',
      tips: '访问新页面时清空前进栈是关键：一旦进入新分支，旧的前进历史就失效了，这是栈应用的经典案例',
      highlightTerms: '后退栈|前进栈|LIFO',
      complexityTime: 'O(1) 单次操作',
      complexitySpace: 'O(n)',
    },
    "taskQueue": {
      title: '任务队列（队列）',
      description: '消息队列（RabbitMQ/Kafka）、操作系统进程调度、打印机任务、JS 事件循环均基于队列的 FIFO 特性，保证任务公平有序处理',
      tips: '队列是"公平性"的代名词：先到先服务；优先队列则打破公平性，按优先级调度（如操作系统调度）',
      highlightTerms: 'FIFO|入队|出队|事件循环',
      complexityTime: 'O(1) 单次操作',
      complexitySpace: 'O(n)',
    },
    "fileSystem": {
      title: '文件系统（树）',
      description: '文件系统是典型的多叉树：目录是内部节点，文件是叶子节点。路径查找、权限继承、磁盘块分配都依赖树形结构',
      tips: '树是"层次关系"的最佳表达：文件系统、DOM、AST、数据库索引、组织架构都是树；递归是处理树的天然工具',
      highlightTerms: '多叉树|根节点|叶子节点|路径查找',
      complexityTime: 'O(h) 路径查找',
      complexitySpace: 'O(n)',
    },
    "socialNetwork": {
      title: '社交网络（图）',
      description: '社交网络用图建模：用户是节点，关注/好友关系是有向/无向边。推荐好友（共同好友）、最短关系链（BFS）、社群发现都依赖图算法',
      tips: '"六度分隔理论"指任意两人最多通过 6 个中间人建立联系，本质是社交图的 BFS 直径约为 6',
      highlightTerms: '无向图|有向图|共同好友|六度分隔',
      complexityTime: 'O(V+E) BFS',
      complexitySpace: 'O(V)',
    },
    "searchEngine": {
      title: '搜索引擎（字典树）',
      description: '搜索引擎自动补全、拼写检查、关键词联想基于字典树（Trie）实现。共享前缀压缩存储，前缀匹配 O(单词长度)，是字符串检索的核心结构',
      tips: 'Trie 的变体 Radix Tree（基数树）更节省空间，Linux 内核路由表、HTTP/2 头部压缩都用它',
      highlightTerms: '字典树|前缀匹配|自动补全|频次',
      complexityTime: 'O(m + k log k)',
      complexitySpace: 'O(总字符数)',
    },
    "cache": {
      title: '缓存（哈希表）',
      description: 'LRU 缓存用哈希表 + 双向链表实现 O(1) 读写。哈希表定位 key，双向链表维护访问顺序。Redis、Memcached、浏览器缓存、CPU 缓存均基于此思想',
      tips: 'LRU（最近最少使用）是最经典缓存策略；变种有 LFU（最不经常使用）、ARC、FIFO 等，Redis 4.0+ 支持配置 LFU',
      highlightTerms: '哈希表|双向链表|LRU|O(1)',
      complexityTime: 'O(1) get/put',
      complexitySpace: 'O(capacity)',
    },
  },
} as const
