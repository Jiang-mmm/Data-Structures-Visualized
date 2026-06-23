/**
 * v20 M7 — learning config 教学文案中文聚合层
 *
 * 自动从 src/i18n/locales/zh/learning/*.ts 聚合 40 个 config 的中文教学文案。
 * 由 src/i18n/locales.ts 导入并赋给 zh.learningSteps。
 *
 * 结构：learningSteps.{configKey}.steps.{stepId}.{title|description|tips|highlightTerms|complexityTime|complexitySpace}
 *
 * - tips / highlightTerms 用 `|` 分隔（运行时 .split('|') 还原为数组）
 * - complexityTime / complexitySpace 为可选键
 *
 * ⚠️ 本文件 40 个导入由 scripts/extract-zh-learning.mjs 自动维护；
 *   新增 / 删除 learning config 时，需同步更新本文件。
 */
import { advancedDataStructuresLearningSteps } from './advancedDataStructures'
import { arrayLearningSteps } from './array'
import { avlTreeLearningSteps } from './avlTree'
import { bTreeLearningSteps } from './bTree'
import { bellmanFordLearningSteps } from './bellmanFord'
import { bfsLearningSteps } from './bfs'
import { bubbleLearningSteps } from './bubble'
import { bucketLearningSteps } from './bucket'
import { combLearningSteps } from './comb'
import { complexityAnalysisLearningSteps } from './complexityAnalysis'
import { countingLearningSteps } from './counting'
import { dfsLearningSteps } from './dfs'
import { dijkstraLearningSteps } from './dijkstra'
import { doublyLinkedListLearningSteps } from './doublyLinkedList'
import { floydWarshallLearningSteps } from './floydWarshall'
import { graphLearningSteps } from './graph'
import { hashLearningSteps } from './hash'
import { heapLearningSteps } from './heap'
import { heapStructureLearningSteps } from './heapStructure'
import { insertionLearningSteps } from './insertion'
import { kruskalLearningSteps } from './kruskal'
import { linkedlistLearningSteps } from './linkedlist'
import { mergeLearningSteps } from './merge'
import { primLearningSteps } from './prim'
import { queueLearningSteps } from './queue'
import { quickLearningSteps } from './quick'
import { radixLearningSteps } from './radix'
import { realWorldApplicationsLearningSteps } from './realWorldApplications'
import { redBlackTreeLearningSteps } from './redBlackTree'
import { segmentTreeLearningSteps } from './segmentTree'
import { selectionLearningSteps } from './selection'
import { shellLearningSteps } from './shell'
import { skipListLearningSteps } from './skipList'
import { sortCompareLearningSteps } from './sortCompare'
import { stackLearningSteps } from './stack'
import { timLearningSteps } from './tim'
import { topoSortLearningSteps } from './topoSort'
import { treeLearningSteps } from './tree'
import { trieLearningSteps } from './trie'
import { unionFindLearningSteps } from './unionFind'

/**
 * 40 个 learning config 的中文教学文案聚合
 *
 * 类型对应 Locale['learningSteps']（见 src/i18n/locales.ts）
 */
export const learningSteps = {
  advancedDataStructures: advancedDataStructuresLearningSteps,
  array: arrayLearningSteps,
  avlTree: avlTreeLearningSteps,
  bTree: bTreeLearningSteps,
  bellmanFord: bellmanFordLearningSteps,
  bfs: bfsLearningSteps,
  bubble: bubbleLearningSteps,
  bucket: bucketLearningSteps,
  comb: combLearningSteps,
  complexityAnalysis: complexityAnalysisLearningSteps,
  counting: countingLearningSteps,
  dfs: dfsLearningSteps,
  dijkstra: dijkstraLearningSteps,
  doublyLinkedList: doublyLinkedListLearningSteps,
  floydWarshall: floydWarshallLearningSteps,
  graph: graphLearningSteps,
  hash: hashLearningSteps,
  heap: heapLearningSteps,
  heapStructure: heapStructureLearningSteps,
  insertion: insertionLearningSteps,
  kruskal: kruskalLearningSteps,
  linkedlist: linkedlistLearningSteps,
  merge: mergeLearningSteps,
  prim: primLearningSteps,
  queue: queueLearningSteps,
  quick: quickLearningSteps,
  radix: radixLearningSteps,
  realWorldApplications: realWorldApplicationsLearningSteps,
  redBlackTree: redBlackTreeLearningSteps,
  segmentTree: segmentTreeLearningSteps,
  selection: selectionLearningSteps,
  shell: shellLearningSteps,
  skipList: skipListLearningSteps,
  sortCompare: sortCompareLearningSteps,
  stack: stackLearningSteps,
  tim: timLearningSteps,
  topoSort: topoSortLearningSteps,
  tree: treeLearningSteps,
  trie: trieLearningSteps,
  unionFind: unionFindLearningSteps,
} as const
