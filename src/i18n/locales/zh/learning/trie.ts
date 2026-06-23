/**
 * v20 M7 — learning config "trie" 中文 locale（自动从 src/configs/learning/trie.config.ts 提取）
 *
 * ⚠️ 本文件由 scripts/extract-zh-learning.mjs 自动生成，请勿手动编辑。
 * 修改源 config 后，重新运行本脚本同步。
 *
 * 结构：
 *   title/description/complexityTime/complexitySpace: string
 *   tips/highlightTerms: string (用 | 分隔，运行时 .split('|') 还原)
 */
export const trieLearningSteps = {
  steps: {
    "structure": {
      title: '字典树结构',
      description: 'Trie 是多叉树结构，每条边代表一个字符，从根到某节点的路径构成一个前缀',
      tips: 'Trie 的空间换时间：用 O(总字符数) 空间换取 O(单词长度) 的查找时间',
      highlightTerms: '前缀|isEnd',
      complexityTime: 'O(m)，m 为单词长度',
      complexitySpace: 'O(总字符数)',
    },
    "insert": {
      title: '插入单词',
      description: '逐字符沿路径向下，不存在则创建新节点，最后一个字符节点标记为单词结束',
      tips: '共享前缀的单词会共用路径节点，这是 Trie 节省空间的关键',
      highlightTerms: 'isEnd|children[ch]',
    },
    "search": {
      title: '查找单词',
      description: '逐字符沿路径查找，若路径中断则不存在，到达末尾时检查 isEnd 标记',
      tips: '注意区分"查找单词"和"查找前缀"：前者需要检查 isEnd，后者不需要',
      highlightTerms: '路径中断|isEnd',
    },
    "prefix": {
      title: '前缀匹配',
      description: '与查找类似，但不要求 isEnd 标记，只要路径存在即匹配成功，可用于自动补全',
      tips: 'Trie 的典型应用：搜索引擎自动补全、拼写检查、IP 路由表、词频统计',
      highlightTerms: '前缀不存在|自动补全',
    },
    "remove": {
      title: '删除单词 Remove',
      description: '递归查找单词路径，从叶子向上回溯删除节点。仅删除不影响其他单词的节点，保留共享前缀。',
      tips: '删除前需确认单词存在|共享前缀节点不能删除（其他单词仍在用）|仅将 isEnd 置 false 即可"软删除"',
      highlightTerms: 'isEnd|delete|remove',
      complexityTime: 'O(m)，m 为单词长度',
      complexitySpace: 'O(m) 递归栈',
    },
  },
} as const
