import type { LearningModeConfig } from './types'

export const trieConfig: LearningModeConfig = {
  algorithmKey: 'trie',
  steps: [
    {
      id: 'structure',
      title: '字典树结构',
      description: 'Trie 是多叉树结构，每条边代表一个字符，从根到某节点的路径构成一个前缀',
      codeSnippet: `// Trie（前缀树）
//        root
//       / | \\
//      a  b  c
//     /   |   \\
//    p    y    a
//   /     |     \\
//  e*     e*     t*
//
// * 标记单词结束 (isEnd)
// 路径 "a→p→e" = 单词 "ape"`,
      highlightedLine: 2,
      highlightTerms: ['前缀', 'isEnd'],
    },
    {
      id: 'insert',
      title: '插入单词',
      description: '逐字符沿路径向下，不存在则创建新节点，最后一个字符节点标记为单词结束',
      codeSnippet: `function insert(root, word) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch])
      node.children[ch] = new TrieNode()
    node = node.children[ch]
  }
  node.isEnd = true  // 标记单词结束
}`,
      highlightedLine: 8,
      highlightTerms: ['isEnd', 'children[ch]'],
    },
    {
      id: 'search',
      title: '查找单词',
      description: '逐字符沿路径查找，若路径中断则不存在，到达末尾时检查 isEnd 标记',
      codeSnippet: `function search(root, word) {
  let node = root
  for (const ch of word) {
    if (!node.children[ch])
      return false  // 路径中断
    node = node.children[ch]
  }
  return node.isEnd  // 必须是完整单词
}`,
      highlightedLine: 4,
      highlightTerms: ['路径中断', 'isEnd'],
    },
    {
      id: 'prefix',
      title: '前缀匹配',
      description: '与查找类似，但不要求 isEnd 标记，只要路径存在即匹配成功，可用于自动补全',
      codeSnippet: `function startsWith(root, prefix) {
  let node = root
  for (const ch of prefix) {
    if (!node.children[ch])
      return false  // 前缀不存在
    node = node.children[ch]
  }
  return true  // 路径存在即匹配
  // 可继续遍历子树获取所有匹配词
}`,
      highlightedLine: 4,
      highlightTerms: ['前缀不存在', '自动补全'],
    },
  ],
}
