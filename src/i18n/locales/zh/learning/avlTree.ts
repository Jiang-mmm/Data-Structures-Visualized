/**
 * v20 M7 — learning config "avlTree" 中文 locale（自动从 src/configs/learning/avlTree.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const avlTreeLearningSteps = {
  steps: {
    "concept": {
      title: 'AVL 树概念',
      description: '自平衡二叉搜索树，任意节点平衡因子绝对值不超过 1',
      tips: 'AVL 树由 Adelson-Velsky 和 Landis 于 1962 年发明|通过旋转操作保持平衡，确保查找/插入/删除始终 O(log n)',
      highlightTerms: 'height',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "height-balance": {
      title: '高度与平衡因子',
      description: '节点高度 = max(左子树高度, 右子树高度) + 1；平衡因子 = 左子树高度 - 右子树高度',
      tips: '叶子节点高度为 1，空节点高度为 0|平衡因子取值范围为 {-1, 0, 1}，超出则需旋转',
      highlightTerms: 'getHeight|getBalanceFactor',
    },
    "insert": {
      title: '插入节点',
      description: '先按 BST 规则插入，然后沿路径向上更新高度并检查平衡',
      tips: '插入后需要从插入点向上回溯到根节点|回溯过程中更新高度并检查平衡因子',
      highlightTerms: 'height|rebalance',
    },
    "rotations": {
      title: '旋转操作',
      description: '四种失衡情况：LL（右旋）、RR（左旋）、LR（先左旋再右旋）、RL（先右旋再左旋）',
      tips: 'LL 型：平衡因子 > 1 且新节点在左子树的左子树|LR 型：先对左子树左旋，再对根右旋|RR 和 RL 型是对称情况',
      highlightTerms: 'rotateRight|x.right = y',
    },
    "rebalance": {
      title: '重新平衡',
      description: '根据平衡因子判断失衡类型并执行对应旋转',
      tips: '判断失衡类型时需同时检查子节点的平衡因子|LR 和 RL 型需要两次旋转才能恢复平衡',
      highlightTerms: 'bf > 1|bf < -1|rotateRight|rotateLeft',
    },
    "delete": {
      title: '删除节点',
      description: '按 BST 规则删除，用中序后继替换有两个子节点的节点，然后重新平衡',
      tips: '删除后可能需要多次旋转才能恢复平衡|中序后继是右子树中最小的节点',
      highlightTerms: 'successor|findMin|rebalance',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(log n)',
    },
    "complexity": {
      title: '复杂度分析',
      description: 'AVL 树保证高度为 O(log n)，所有操作为 O(log n)',
      tips: 'AVL 树比红黑树更严格平衡，查找更快但插入/删除旋转更多|适合查找密集型场景，如数据库索引缓存',
      highlightTerms: 'log2|O(log n)',
    },
  },
} as const
