import { bfsConfig } from './bfs.config'
import { dfsConfig } from './dfs.config'
import { dijkstraConfig } from './dijkstra.config'
import { topoSortConfig } from './topoSort.config'
import { bellmanFordConfig } from './bellmanFord.config'
import { floydWarshallConfig } from './floydWarshall.config'
import { primConfig } from './prim.config'
import { kruskalConfig } from './kruskal.config'
import { bubbleConfig } from './bubble.config'
import { quickConfig } from './quick.config'
import { mergeConfig } from './merge.config'
import { heapConfig } from './heap.config'
import { selectionConfig } from './selection.config'
import { insertionConfig } from './insertion.config'
import { radixConfig } from './radix.config'
import { bucketConfig } from './bucket.config'
import { shellConfig } from './shell.config'
import { combConfig } from './comb.config'
import { timConfig } from './tim.config'
import { countingConfig } from './counting.config'
import { linkedlistConfig } from './linkedlist.config'
import { doublyLinkedListConfig } from './doublyLinkedList.config'
import { treeConfig } from './tree.config'
import { avlTreeConfig } from './avlTree.config'
import { redBlackTreeConfig } from './redBlackTree.config'
import { bTreeConfig } from './bTree.config'
import { hashConfig } from './hash.config'
import { arrayConfig } from './array.config'
import { stackConfig } from './stack.config'
import { queueConfig } from './queue.config'
import { heapStructureConfig } from './heapStructure.config'
import { trieConfig } from './trie.config'
import { skipListConfig } from './skipList.config'
import { unionFindConfig } from './unionFind.config'
import { graphConfig } from './graph.config'
import { complexityAnalysisConfig } from './complexityAnalysis.config'
import { advancedDataStructuresConfig } from './advancedDataStructures.config'
import { realWorldApplicationsConfig } from './realWorldApplications.config'
import { sortCompareConfig } from './sortCompare.config'

export const learningConfigs = {
  bfs: bfsConfig,
  dfs: dfsConfig,
  dijkstra: dijkstraConfig,
  topoSort: topoSortConfig,
  bellmanFord: bellmanFordConfig,
  floydWarshall: floydWarshallConfig,
  prim: primConfig,
  kruskal: kruskalConfig,
  bubble: bubbleConfig,
  quick: quickConfig,
  merge: mergeConfig,
  heap: heapConfig,
  selection: selectionConfig,
  insertion: insertionConfig,
  radix: radixConfig,
  bucket: bucketConfig,
  shell: shellConfig,
  comb: combConfig,
  tim: timConfig,
  counting: countingConfig,
  linkedlist: linkedlistConfig,
  doublyLinkedList: doublyLinkedListConfig,
  tree: treeConfig,
  avlTree: avlTreeConfig,
  redBlackTree: redBlackTreeConfig,
  bTree: bTreeConfig,
  hash: hashConfig,
  array: arrayConfig,
  stack: stackConfig,
  queue: queueConfig,
  heapStructure: heapStructureConfig,
  trie: trieConfig,
  skipList: skipListConfig,
  unionFind: unionFindConfig,
  graph: graphConfig,
  complexityAnalysis: complexityAnalysisConfig,
  advancedDataStructures: advancedDataStructuresConfig,
  realWorldApplications: realWorldApplicationsConfig,
  sortCompare: sortCompareConfig,
}

export type LearningConfigKey = keyof typeof learningConfigs

export * from './types'
