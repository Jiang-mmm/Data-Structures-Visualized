/**
 * v20 M7 — learning config "bTree" 中文 locale（自动从 src/configs/learning/bTree.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const bTreeLearningSteps = {
  steps: {
    "concept": {
      title: 'B 树概念',
      description: '多路自平衡搜索树，每个节点可存储多个 key，所有叶子位于同一层',
      tips: 'B 树由 Bayer 和 McCreight 于 1972 年提出|每个节点最多 order 个子节点，order-1 个 key|所有叶子节点位于同一层，保证平衡',
      highlightTerms: 'keys|children|leaf',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "node-structure": {
      title: '节点结构',
      description: '阶数为 order 的 B 树：每个节点最多 order-1 个 key，order 个子节点；非根节点最少 ⌈order/2⌉-1 个 key',
      tips: '阶数 order 决定每个节点的最大子节点数|2-3 树是最简单的 B 树（order=3）|B+ 树是 B 树的变体，常用于数据库索引',
      highlightTerms: 'order|2-3 树',
    },
    "insert": {
      title: '插入操作',
      description: '从根节点开始，找到合适的叶子节点插入 key。若节点已满则触发分裂',
      tips: '插入总是发生在叶子节点|插入前检查节点是否已满|满节点需要分裂才能继续插入',
      highlightTerms: 'insertNonFull|splitChild',
    },
    "split": {
      title: '分裂机制',
      description: '当节点 key 数量超过 maxKeys 时，将中间 key 上移到父节点，原节点分裂为左右两部分',
      tips: '分裂是 B 树保持平衡的核心操作|中间 key 上移到父节点|分裂可能向上传播，直到根节点',
      highlightTerms: 'midKey|slice|splice',
    },
    "search": {
      title: '搜索操作',
      description: '从根节点开始，在 keys 中找到合适的位置，递归或循环进入对应子节点',
      tips: '搜索时间复杂度为 O(log n)|每个节点的 keys 是有序的，可用二分查找加速|搜索路径从根到叶，长度等于树高',
      highlightTerms: 'key === node.keys[i]|node.children[i]',
    },
    "balance": {
      title: '平衡特性',
      description: 'B 树通过分裂机制保证所有叶子节点位于同一层，树高始终为 O(log n)',
      tips: 'B 树的平衡是天然的——分裂保证叶子同层|与 AVL/红黑树不同，B 树不需要旋转操作|更大的阶数意味着更矮的树，适合磁盘 I/O',
      highlightTerms: '同一层|log',
    },
    "applications": {
      title: '应用场景',
      description: 'B 树广泛应用于数据库索引和文件系统，其多路特性减少磁盘 I/O 次数',
      tips: 'B+ 树是数据库索引的首选结构|节点大小通常匹配磁盘块大小（4KB-16KB）|B 树 vs B+ 树：B+ 树叶子间有链表，范围查询更高效',
      highlightTerms: 'B+ 树|磁盘 I/O',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
  },
} as const
