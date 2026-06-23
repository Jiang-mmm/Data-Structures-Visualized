/**
 * v20 M7 — learning config "skipList" 中文 locale（自动从 src/configs/learning/skipList.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const skipListLearningSteps = {
  steps: {
    "intro": {
      title: '跳表简介',
      description: '跳表是概率性平衡数据结构，通过多层链表实现 O(log n) 查找，是平衡树的简洁替代方案',
      tips: '跳表由 William Pugh 于 1989 年发明|Redis 的有序集合（ZSET）底层使用跳表实现|相比红黑树，跳表实现更简单且支持范围查询',
      highlightTerms: 'head|level|MAX_LEVEL',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "structure": {
      title: '多层链表结构',
      description: '跳表由多层链表组成，第 0 层包含所有节点，高层是低层的"快速通道"，节点出现在哪些层由随机决定',
      tips: '每个节点出现在第 0 层，以概率 P 出现在更高层|高层节点稀疏，起到索引作用|层数期望为 O(log n)，保证查找效率',
      highlightTerms: '第 0 层|第 1 层|第 2 层',
    },
    "randomLevel": {
      title: '随机层数生成',
      description: '插入新节点时，通过抛硬币（概率 P=0.5）决定节点层数，避免手动平衡的复杂性',
      tips: 'P 通常取 0.5，即每层有 50% 概率提升|MAX_LEVEL 限制最大层数，通常取 16 或 32|随机化保证整体平衡，无需旋转操作',
      highlightTerms: 'randomLevel|Math.random|P',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(1)',
    },
    "search": {
      title: '搜索路径',
      description: '从最高层开始，向右走到下一个节点值大于目标前停止，然后下降一层，直到第 0 层',
      tips: '从最高层开始可以快速跳过大量节点|下降到第 0 层时即定位到目标或确认不存在|期望查找路径长度为 O(log n)',
      highlightTerms: 'forward[i]|level - 1|current',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(1)',
    },
    "insert": {
      title: '插入与连接',
      description: '搜索插入位置时记录每层的前驱节点，然后用 randomLevel 决定新节点层数，逐层插入连接',
      tips: 'update 数组记录每层的前驱节点|新节点层数可能超过当前 level，需更新 level|插入操作期望 O(log n)',
      highlightTerms: 'update|randomLevel|forward',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(log n)',
    },
    "delete": {
      title: '删除节点',
      description: '类似插入，记录每层前驱节点，然后逐层解除连接，最后更新 level',
      tips: '删除时需更新所有包含该节点的层|删除后可能需要降低 level|删除操作期望 O(log n)',
      highlightTerms: 'update|forward|target',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(log n)',
    },
    "complexity": {
      title: '复杂度分析',
      description: '跳表所有操作期望 O(log n)，最坏 O(n) 但概率极低，空间复杂度 O(n)',
      tips: '跳表与红黑树性能相当，但实现更简单|跳表支持高效的范围查询，红黑树需要中序遍历|并发场景下跳表更易实现无锁版本',
      highlightTerms: 'O(log n)|O(n)',
    },
  },
} as const
