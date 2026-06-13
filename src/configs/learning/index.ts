import { bfsConfig } from './bfs.config'
import { dfsConfig } from './dfs.config'
import { dijkstraConfig } from './dijkstra.config'
import { topoSortConfig } from './topoSort.config'
import { bubbleConfig } from './bubble.config'
import { quickConfig } from './quick.config'
import { mergeConfig } from './merge.config'
import { heapConfig } from './heap.config'
import { linkedlistConfig } from './linkedlist.config'
import { doublyLinkedListConfig } from './doublyLinkedList.config'
import { treeConfig } from './tree.config'
import { hashConfig } from './hash.config'
import { arrayConfig } from './array.config'
import { stackConfig } from './stack.config'
import { queueConfig } from './queue.config'
import { heapStructureConfig } from './heapStructure.config'
import { trieConfig } from './trie.config'
import { graphConfig } from './graph.config'

export const learningConfigs = {
  bfs: bfsConfig,
  dfs: dfsConfig,
  dijkstra: dijkstraConfig,
  topoSort: topoSortConfig,
  bubble: bubbleConfig,
  quick: quickConfig,
  merge: mergeConfig,
  heap: heapConfig,
  linkedlist: linkedlistConfig,
  doublyLinkedList: doublyLinkedListConfig,
  tree: treeConfig,
  hash: hashConfig,
  array: arrayConfig,
  stack: stackConfig,
  queue: queueConfig,
  heapStructure: heapStructureConfig,
  trie: trieConfig,
  graph: graphConfig,
}

export type LearningConfigKey = keyof typeof learningConfigs

export * from './types'
