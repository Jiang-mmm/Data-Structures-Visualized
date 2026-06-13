import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

export interface TrieNode {
  children: Record<string, TrieNode>
  isEndOfWord: boolean
}

function createNode(): TrieNode {
  return { children: {}, isEndOfWord: false }
}

function insertWord(root: TrieNode, word: string): TrieNode {
  const node: TrieNode = { ...root, children: { ...root.children } }
  let current = node
  for (const ch of word) {
    if (!current.children[ch]) {
      current.children[ch] = createNode()
    } else {
      current.children[ch] = { ...current.children[ch], children: { ...current.children[ch].children } }
    }
    current = current.children[ch]
  }
  current.isEndOfWord = true
  return node
}

function deleteWord(root: TrieNode, word: string): TrieNode {
  const node: TrieNode = { ...root, children: { ...root.children } }
  let current = node
  const path: TrieNode[] = [current]
  for (const ch of word) {
    if (!current.children[ch]) return root
    current.children[ch] = { ...current.children[ch], children: { ...current.children[ch].children } }
    current = current.children[ch]
    path.push(current)
  }
  current.isEndOfWord = false
  for (let i = path.length - 1; i > 0; i--) {
    const parent = path[i - 1]
    const ch = word[i - 1]
    const child = parent.children[ch]
    if (child.isEndOfWord || Object.keys(child.children).length > 0) break
    delete parent.children[ch]
  }
  return node
}

function searchWord(root: TrieNode, word: string): { found: boolean; path: string[] } {
  let current = root
  for (const ch of word) {
    if (!current.children[ch]) return { found: false, path: [] }
    current = current.children[ch]
  }
  return { found: current.isEndOfWord, path: [] }
}

function startsWith(root: TrieNode, prefix: string): { found: boolean; words: string[]; path: string[] } {
  let current = root
  const path: string[] = []
  for (const ch of prefix) {
    if (!current.children[ch]) return { found: false, words: [], path }
    path.push(ch)
    current = current.children[ch]
  }
  const words: string[] = []
  const dfs = (node: TrieNode, currentPrefix: string) => {
    if (node.isEndOfWord) words.push(currentPrefix)
    for (const [ch, child] of Object.entries(node.children)) {
      dfs(child, currentPrefix + ch)
    }
  }
  dfs(current, prefix)
  return { found: true, words, path }
}

function flattenTrie(root: TrieNode): { nodes: { id: string; prefix: string; isEndOfWord: boolean; depth: number; childrenKeys: string[] }[]; edges: { from: string; to: string; char: string }[] } {
  const nodes: { id: string; prefix: string; isEndOfWord: boolean; depth: number; childrenKeys: string[] }[] = []
  const edges: { from: string; to: string; char: string }[] = []
  const queue: { node: TrieNode; id: string; depth: number; prefix: string }[] = [{ node: root, id: 'root', depth: 0, prefix: '' }]
  let nodeIdCounter = 1

  while (queue.length > 0) {
    const { node, id, depth, prefix } = queue.shift()!

    nodes.push({
      id,
      prefix,
      isEndOfWord: node.isEndOfWord,
      depth,
      childrenKeys: Object.keys(node.children),
    })

    for (const [ch, child] of Object.entries(node.children)) {
      const childId = `${nodeIdCounter++}`
      edges.push({ from: id, to: childId, char: ch })
      queue.push({ node: child, id: childId, depth: depth + 1, prefix: prefix + ch })
    }
  }

  return { nodes, edges }
}

const INITIAL_WORDS = ['cat', 'car', 'cart', 'dog', 'dot']

function buildInitialTrie(): TrieNode {
  let root = createNode()
  for (const word of INITIAL_WORDS) {
    root = insertWord(root, word)
  }
  return root
}

export function useTrieState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<TrieNode>(buildInitialTrie(), { storageKey: 'trie' })

  const insert = useCallback((word: string) => {
    if (!word || typeof word !== 'string' || word.trim().length === 0) {
      showToast({ type: 'error', message: tStatic('errors.enterWord') })
      addLog('error', tStatic('hooks.trieInputRequired'))
      return
    }
    const cleanWord = word.trim().toLowerCase().replace(/[^a-z]/g, '')
    if (cleanWord.length === 0) {
      showToast({ type: 'error', message: tStatic('errors.trieLettersOnly') })
      addLog('error', tStatic('hooks.trieLogInsertError').replace('{word}', word))
      return
    }
    const newData = insertWord(data, cleanWord)
    push(newData)
    addLog('oper', tStatic('hooks.trieLogInsert').replace('{word}', cleanWord))
    addLog('code', `for (ch in word) { if (!node.children[ch]) node.children[ch] = new TrieNode(); node = node.children[ch]; } node.isEndOfWord = true;`)
    showToast({ type: 'success', message: tStatic('hooks.trieInsertSuccess').replace('{word}', cleanWord) })
  }, [data, push, addLog])

  const remove = useCallback((word: string) => {
    if (!word || typeof word !== 'string') {
      showToast({ type: 'error', message: tStatic('errors.enterWord') })
      return
    }
    const cleanWord = word.trim().toLowerCase()
    const newData = deleteWord(data, cleanWord)
    if (newData === data) {
      showToast({ type: 'warning', message: tStatic('hooks.trieDeleteNotFound').replace('{word}', cleanWord) })
      addLog('oper', tStatic('hooks.trieLogDeleteNotFound').replace('{word}', cleanWord))
      return
    }
    push(newData)
    addLog('oper', tStatic('hooks.trieLogDeleteSuccess').replace('{word}', cleanWord))
    addLog('code', `node.isEndOfWord = false; removeEmptyNodes();`)
    showToast({ type: 'success', message: tStatic('hooks.trieDeleteSuccess').replace('{word}', cleanWord) })
  }, [data, push, addLog])

  const search = useCallback((word: string): { found: boolean; path: string[] } => {
    if (!word || typeof word !== 'string') return { found: false, path: [] }
    const cleanWord = word.trim().toLowerCase()
    const result = searchWord(data, cleanWord)
    if (result.found) {
      addLog('oper', tStatic('hooks.trieLogSearchFound').replace('{word}', cleanWord))
    } else {
      addLog('oper', tStatic('hooks.trieLogSearchNotFound').replace('{word}', cleanWord))
    }
    return result
  }, [data, addLog])

  const searchPrefix = useCallback((prefix: string): { found: boolean; words: string[]; path: string[] } => {
    if (!prefix || typeof prefix !== 'string') return { found: false, words: [], path: [] }
    const cleanPrefix = prefix.trim().toLowerCase()
    const result = startsWith(data, cleanPrefix)
    if (result.found && result.words.length > 0) {
      addLog('oper', tStatic('hooks.trieLogPrefixFound').replace('{prefix}', cleanPrefix).replace('{count}', String(result.words.length)).replace('{words}', result.words.join(', ')))
    } else {
      addLog('oper', tStatic('hooks.trieLogPrefixNotFound').replace('{prefix}', cleanPrefix))
    }
    return result
  }, [data, addLog])

  const getFlattened = useCallback(() => {
    return flattenTrie(data)
  }, [data])

  const wordCount = useCallback((): number => {
    let count = 0
    const dfs = (node: TrieNode) => {
      if (node.isEndOfWord) count++
      for (const child of Object.values(node.children)) {
        dfs(child)
      }
    }
    dfs(data)
    return count
  }, [data])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    insert,
    remove,
    search,
    searchPrefix,
    getFlattened,
    wordCount,
    reset,
    loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
  }
}
