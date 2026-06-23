/**
 * v20 M7 — learning config "tree" 中文 locale（自动从 src/configs/learning/tree.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const treeLearningSteps = {
  steps: {
    "init": {
      title: '二叉树结构',
      description: '每个节点最多有两个子节点：左子节点和右子节点',
      tips: '二叉搜索树（BST）的性质：左子树所有值 < 根 < 右子树所有值',
      highlightTerms: 'left|right',
      complexityTime: '平均 O(log n)，最坏 O(n)',
      complexitySpace: 'O(n)',
    },
    "insert": {
      title: '插入节点',
      description: '比较值大小，小于当前节点向左走，大于向右走，找到空位插入',
      tips: '插入操作的效率取决于树的高度，平衡树 O(log n)，退化链表 O(n)',
      highlightTerms: 'value < node.value|left',
    },
    "traversal": {
      title: '遍历方式',
      description: '前序遍历（根-左-右）、中序遍历（左-根-右）、后序遍历（左-右-根）',
      tips: 'BST 的中序遍历结果是有序的，这是一个重要的性质',
      highlightTerms: 'visit|inorder',
    },
    "preorder": {
      title: '前序遍历 Preorder',
      description: '访问顺序：根节点 → 左子树 → 右子树。常用于复制树、序列化树结构。',
      tips: '前序遍历的第一个节点是根节点|可用于树的序列化与反序列化',
      highlightTerms: 'visit|preorder',
      complexityTime: 'O(n)',
      complexitySpace: 'O(h)，h 为树高',
    },
    "inorder": {
      title: '中序遍历 Inorder',
      description: '访问顺序：左子树 → 根节点 → 右子树。BST 中序遍历得到有序序列。',
      tips: 'BST 中序遍历结果严格递增|中序遍历可用来验证 BST 性质',
      highlightTerms: 'inorder|visit',
      complexityTime: 'O(n)',
      complexitySpace: 'O(h)',
    },
    "postorder": {
      title: '后序遍历 Postorder',
      description: '访问顺序：左子树 → 右子树 → 根节点。常用于删除树、计算目录大小。',
      tips: '后序遍历的最后一个节点是根节点|适合先处理子树再处理根的场景（如释放内存）',
      highlightTerms: 'postorder|visit',
      complexityTime: 'O(n)',
      complexitySpace: 'O(h)',
    },
    "levelorder": {
      title: '层序遍历 Levelorder',
      description: '按层从上到下、从左到右访问节点。使用队列辅助实现 BFS。',
      tips: '层序遍历即广度优先搜索（BFS）|常用于求树的最小高度、按层打印树',
      highlightTerms: 'queue|shift|push',
      complexityTime: 'O(n)',
      complexitySpace: 'O(w)，w 为最大宽度',
    },
    "search": {
      title: '查找节点',
      description: '利用 BST 性质，比较目标值与当前节点值，决定向左或向右搜索',
      tips: 'AVL 树和红黑树通过旋转保持平衡，确保查找始终 O(log n)',
      highlightTerms: 'value < node.value|search',
    },
    "delete": {
      title: '删除节点 Delete',
      description: '删除节点需处理三种情况：叶子节点（直接删）、单子节点（用子节点替换）、双子节点（用中序后继替换）。',
      tips: '双子节点情况也可用中序前驱替换|删除后可能破坏平衡，AVL/红黑树需旋转恢复',
      highlightTerms: 'findMin|deleteNode|中序后继',
      complexityTime: '平均 O(log n)，最坏 O(n)',
      complexitySpace: 'O(h)',
    },
  },
} as const
