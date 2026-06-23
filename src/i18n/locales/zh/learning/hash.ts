/**
 * v20 M7 — learning config "hash" 中文 locale（自动从 src/configs/learning/hash.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const hashLearningSteps = {
  steps: {
    "init": {
      title: '哈希函数',
      description: '将键通过哈希函数映射到数组索引，实现 O(1) 平均访问',
      tips: '好的哈希函数应均匀分布，减少冲突。常见的有乘法哈希、MurmurHash 等',
      highlightTerms: 'hash % size',
      complexityTime: '平均 O(1)，最坏 O(n)',
      complexitySpace: 'O(n)',
    },
    "insert": {
      title: '插入键值对',
      description: '计算哈希值确定桶位置，将键值对存入对应桶中',
      tips: '当负载因子（元素数/桶数）超过 0.75 时，通常需要扩容并重新哈希',
      highlightTerms: 'hash(key)|push',
    },
    "collision": {
      title: '冲突处理',
      description: '当多个键映射到同一索引时，使用链地址法在桶中存储多个元素',
      tips: '冲突处理的两种主要方式：链地址法（本例）和开放寻址法',
      highlightTerms: 'find|item.key',
    },
    "search": {
      title: '查找操作',
      description: '计算哈希值定位桶，遍历桶内链表找到匹配的键',
      tips: '哈希表是 JavaScript 对象/Map 的底层实现，是最重要的数据结构之一',
      highlightTerms: 'item.key === key',
    },
    "remove": {
      title: '删除键值对 Remove',
      description: '根据 key 计算哈希定位桶，在桶内查找并删除对应键值对。链地址法需处理链表节点删除。',
      tips: '删除前需检查 key 是否存在|链地址法删除链表节点需维护前驱指针|开放寻址法删除需标记"已删除"而非真正移除（避免中断探测链）',
      highlightTerms: 'splice|findIndex|remove',
      complexityTime: '平均 O(1)，最坏 O(n)',
      complexitySpace: 'O(1)',
    },
  },
} as const
