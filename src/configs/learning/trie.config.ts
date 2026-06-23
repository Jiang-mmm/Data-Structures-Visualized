import type { LearningModeConfig } from './types'
import { tStatic } from '../../i18n/useI18n'


export const trieConfig: LearningModeConfig = {
  algorithmKey: 'trie',
  steps: [
    {
      id: 'structure',
      title: tStatic('learningSteps.trie.steps.structure.title'),
      description: tStatic('learningSteps.trie.steps.structure.description'),
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
      highlightTerms: tStatic('learningSteps.trie.steps.structure.highlightTerms').split('|'),
      tips: tStatic('learningSteps.trie.steps.structure.tips').split('|'),
      complexity: { time: tStatic('learningSteps.trie.steps.structure.complexityTime'), space: tStatic('learningSteps.trie.steps.structure.complexitySpace') },
    },
    {
      id: 'insert',
      title: tStatic('learningSteps.trie.steps.insert.title'),
      description: tStatic('learningSteps.trie.steps.insert.description'),
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
      highlightTerms: tStatic('learningSteps.trie.steps.insert.highlightTerms').split('|'),
      tips: tStatic('learningSteps.trie.steps.insert.tips').split('|'),
    },
    {
      id: 'search',
      title: tStatic('learningSteps.trie.steps.search.title'),
      description: tStatic('learningSteps.trie.steps.search.description'),
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
      highlightTerms: tStatic('learningSteps.trie.steps.search.highlightTerms').split('|'),
      tips: tStatic('learningSteps.trie.steps.search.tips').split('|'),
    },
    {
      id: 'prefix',
      title: tStatic('learningSteps.trie.steps.prefix.title'),
      description: tStatic('learningSteps.trie.steps.prefix.description'),
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
      highlightTerms: tStatic('learningSteps.trie.steps.prefix.highlightTerms').split('|'),
      tips: tStatic('learningSteps.trie.steps.prefix.tips').split('|'),
    },
    {
      id: 'remove',
      title: tStatic('learningSteps.trie.steps.remove.title'),
      description: tStatic('learningSteps.trie.steps.remove.description'),
      codeSnippet: `function remove(node, word, depth = 0) {
  if (depth === word.length) {
    node.isEnd = false
  } else {
    const child = node.children[word[depth]]
    if (!child) return
    remove(child, word, depth + 1)
    // 子节点无孩子且非单词结尾时删除
    if (Object.keys(child.children).length === 0 && !child.isEnd) {
      delete node.children[word[depth]]
    }
  }
}`,
      highlightedLine: 9,
      highlightTerms: tStatic('learningSteps.trie.steps.remove.highlightTerms').split('|'),
      tips: tStatic('learningSteps.trie.steps.remove.tips').split('|'),
      complexity: { time: tStatic('learningSteps.trie.steps.remove.complexityTime'), space: tStatic('learningSteps.trie.steps.remove.complexitySpace') },
    },
  ],
}
