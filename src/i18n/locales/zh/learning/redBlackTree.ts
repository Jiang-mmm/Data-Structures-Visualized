/**
 * v20 M7 — learning config "redBlackTree" 中文 locale（自动从 src/configs/learning/redBlackTree.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const redBlackTreeLearningSteps = {
  steps: {
    "intro": {
      title: '红黑树简介',
      description: '红黑树是自平衡二叉搜索树，通过节点颜色（红/黑）与旋转保持近似平衡，保证 O(log n) 操作',
      tips: '红黑树由 Rudolf Bayer 于 1972 年发明，称为「对称二叉 B 树」|Linux 内核的 CFS 调度器、Java TreeMap、C++ std::map 底层均使用红黑树|相比 AVL 树，红黑树旋转次数更少，适合写多读少场景',
      highlightTerms: 'color|red|parent',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(n)',
    },
    "properties": {
      title: '红黑树五大性质',
      description: '红黑树通过五条性质维持平衡：根黑、叶黑、红节点子必黑、等黑高',
      tips: '性质 4 保证没有连续两个红色节点|性质 5 保证最长路径不超过最短路径的 2 倍|NIL 叶子指空节点（null），隐式为黑色',
      highlightTerms: '根节点|叶子节点|红色节点|黑色节点',
    },
    "insert": {
      title: '插入节点',
      description: '新节点默认为红色（避免破坏性质 5），按 BST 规则插入后通过 fixInsert 修复红黑性质',
      tips: '新节点为红色，可能违反性质 4（父红子红）|若父节点为黑色，无需修复，直接完成|若父节点为红色，需进入 fixInsert 修复',
      highlightTerms: 'newNode|parent|fixInsert',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(1)',
    },
    "fixup": {
      title: '插入修复（重染色 + 旋转）',
      description: '当父节点为红色时，根据叔节点颜色分三种情况修复：叔红重染色、叔黑旋转',
      tips: '情况 1（叔红）：重染色后 z 上移两层，可能继续修复|情况 2（叔黑，z 内侧）：旋转父节点，转为情况 3|情况 3（叔黑，z 外侧）：重染色 + 旋转祖父，修复结束',
      highlightTerms: 'uncle|color|black|red',
      complexityTime: 'O(log n)',
      complexitySpace: 'O(1)',
    },
    "rotation": {
      title: '旋转操作',
      description: '左旋与右旋保持 BST 性质，用于调整树形结构，是红黑树平衡的核心',
      tips: '旋转是局部操作，仅改变 3 个节点的指针关系|左旋与右旋互为逆操作|旋转后 BST 中序遍历结果不变',
      highlightTerms: 'rotateLeft|y|parent',
    },
    "complexity": {
      title: '复杂度分析',
      description: '红黑树高度最多 2log(n+1)，所有操作 O(log n)，旋转次数少于 AVL 树',
      tips: '红黑树插入最多 2 次旋转，AVL 树可能更多|红黑树查找略慢于 AVL（树更高），但插入/删除更快|实际工程中红黑树应用更广（如 STL map/set）',
      highlightTerms: 'O(log n)|2 * log2|旋转',
    },
  },
} as const
