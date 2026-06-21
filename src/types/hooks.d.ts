declare const __APP_VERSION__: string

export interface HistoryState<T> {
  state: T;
  setState: (value: T) => void;
  push: (value: T) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistory: () => T[];
  getCurrentIndex: () => number;
  getUndoPreview: () => T | null;
  getRedoPreview: () => T | null;
}

export interface DataStructureState<T> extends Omit<HistoryState<T>, 'setState'> {
  data: T;
  logs: LogEntry[];
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  addLog: (type: string, message: string) => void;
  clearLogs: () => void;
  loadData: (data: T) => void;
  clearPersist: () => void;
}

export interface LogEntry {
  type: string;
  message: string;
  timestamp: number;
}

export interface ArrayState extends DataStructureState<number[]> {
  insert: (rawValue: string | number, index: number) => boolean;
  remove: (index: number) => void;
  search: (value: number) => number;
  randomize: () => void;
}

export interface SortState extends DataStructureState<number[]> {
  stats: { algorithm: string; comparisons: number; swaps: number; steps: number };
  progress: number;
  randomize: () => void;
  stop: () => void;
  runAlgorithm: (name: string, animateFns: unknown, svgRef: unknown, dimensions: unknown, anim?: unknown) => Promise<void>;
}

export interface StackState extends DataStructureState<number[]> {
  push: (value: string | number) => boolean;
  pop: () => number | null;
  peek: () => number | undefined;
  clear: () => void;
  size: number;
}

export interface QueueState extends DataStructureState<number[]> {
  enqueue: (value: number) => void;
  dequeue: () => number | undefined;
  front: () => number | undefined;
  clear: () => void;
  size: number;
}

export interface LinkedListState extends DataStructureState<number[]> {
  insertHead: (value: number) => void;
  insertTail: (value: number) => void;
  insertAt: (index: number, value: number) => void;
  deleteAt: (index: number) => void;
  search: (value: number) => number;
  reverse: () => void;
  detectCycle: () => { hasCycle: boolean; steps: { slow: number; fast: number }[] };
  length: number;
}

export interface TreeState extends DataStructureState<number[]> {
  insert: (value: number) => void;
  preorder: () => number[];
  inorder: () => number[];
  postorder: () => number[];
  levelorder: () => number[];
  search: (value: number) => { found: boolean; path: number[] };
  deleteNode: (value: number) => void;
  nodeCount: number;
}

export interface GraphNode {
  id: string;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  weight?: number;
}

export interface GraphState {
  nodes: GraphNode[];
  links: GraphLink[];
  logs: LogEntry[];
  isAnimating: boolean;
  setIsAnimating: (value: boolean) => void;
  viewMode: string;
  setViewMode: (mode: string) => void;
  addNode: () => void;
  addEdge: (source: string, target: string, weight?: number) => void;
  deleteNode: (id: string) => void;
  deleteEdge: (source: string, target: string) => void;
  bfs: (start: string) => { visited: string[]; path: string[] };
  dfs: (start: string) => { visited: string[]; path: string[] };
  dijkstra: (start: string, end: string) => { visited: string[]; path: string[] };
  reset: () => void;
  loadData: (data: { nodes: GraphNode[]; links: GraphLink[] }) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getUndoPreview: () => { nodes: GraphNode[]; links: GraphLink[] } | null;
  getRedoPreview: () => { nodes: GraphNode[]; links: GraphLink[] } | null;
  getAdjacencyMatrix: () => { ids: string[]; matrix: number[][] };
  getAdjacencyList: () => Record<string, { node: string; weight?: number }[]>;
}

export interface HashEntry {
  key: number;
  value: string;
}

export interface HashState extends DataStructureState<HashEntry[][]> {
  insert: (key: number, value: string) => void;
  remove: (key: number) => void;
  search: (key: number) => { found: boolean; value?: string };
  bucketCount: number;
  entryCount: number;
  hashFn: (key: number) => number;
}

export interface HeapState extends DataStructureState<number[]> {
  insert: (value: number) => void;
  extractMax: () => number | undefined;
  peek: () => number | undefined;
  heapSize: number;
}

export interface TrieFlattenedNode {
  id: string;
  prefix: string;
  parent: string;
  char: string;
  isEndOfWord: boolean;
  depth: number;
}

export interface TrieFlattened {
  nodes: TrieFlattenedNode[];
  edges: { from: string; to: string; char: string }[];
}

export interface TrieState extends DataStructureState<TrieNode> {
  insert: (word: string) => void;
  remove: (word: string) => void;
  search: (word: string) => boolean;
  searchPrefix: (prefix: string) => string[];
  getFlattened: () => TrieFlattened;
  wordCount: number;
}

export interface TrieNode {
  children: Record<string, TrieNode>;
  isEndOfWord: boolean;
}

/**
 * AVL 树类型定义
 *
 * 数据表示决策：采用递归对象表示（参考 TrieNode 模式），
 * 而非数组索引表示（如 TreeState 的 2i+1/2i+2）。
 * 原因：AVL 的旋转操作在数组索引表示下极其复杂且易错，
 * 递归对象表示可让旋转逻辑清晰、可验证。
 */

/** AVL 树节点（递归对象表示） */
export interface AvlNode {
  /** 节点值 */
  value: number;
  /** 左子树 */
  left: AvlNode | null;
  /** 右子树 */
  right: AvlNode | null;
  /** 节点高度（叶子节点高度为 1） */
  height: number;
}

/** 扁平化节点（供可视化器使用） */
export interface AvlFlattenedNode {
  /** 节点唯一标识（基于遍历顺序） */
  id: string;
  /** 节点值 */
  value: number;
  /** 父节点 id（根节点为空字符串） */
  parent: string;
  /** 节点所在深度（根为 0） */
  depth: number;
  /** 平衡因子（左子树高度 - 右子树高度） */
  balanceFactor: number;
  /** 节点高度 */
  height: number;
  /** 是否为左子节点 */
  isLeft: boolean;
  /** 是否为右子节点 */
  isRight: boolean;
}

/** 扁平化边（供可视化器使用） */
export interface AvlFlattenedEdge {
  /** 起点 id（父节点） */
  from: string;
  /** 终点 id（子节点） */
  to: string;
}

/** 扁平化 AVL 树结构（供可视化器使用） */
export interface AvlFlattened {
  nodes: AvlFlattenedNode[];
  edges: AvlFlattenedEdge[];
}

/** AVL 树状态接口（继承数据结构状态基座） */
export interface AvlTreeState extends DataStructureState<AvlNode | null> {
  /** 插入节点 */
  insert: (value: number) => void;
  /** 删除节点 */
  deleteNode: (value: number) => void;
  /** 查找节点，返回路径与是否找到 */
  search: (value: number) => { found: boolean; path: number[] };
  /** 前序遍历 */
  preorder: () => number[];
  /** 中序遍历 */
  inorder: () => number[];
  /** 后序遍历 */
  postorder: () => number[];
  /** 层序遍历 */
  levelorder: () => number[];
  /** 获取扁平化结构（供可视化器） */
  getFlattened: () => AvlFlattened;
  /** 节点总数 */
  nodeCount: number;
}

/**
 * B 树类型定义
 *
 * 数据表示：递归对象（BTreeNode），keys 数组 + children 数组
 * 阶数（order）默认为 3（2-3 树）：
 * - 每个节点最多 order 个子节点，order-1 个 key
 * - 非根非叶节点最少 ⌈order/2⌉ 个子节点
 */

/** B 树节点（递归对象表示） */
export interface BTreeNode {
  /** 节点存储的键值数组（有序） */
  keys: number[];
  /** 子节点数组（长度为 keys.length + 1，叶子节点为空数组） */
  children: BTreeNode[];
  /** 是否为叶子节点 */
  leaf: boolean;
}

/** 扁平化节点（供可视化器使用） */
export interface BTreeFlattenedNode {
  /** 节点唯一标识（基于层序遍历顺序） */
  id: string;
  /** 节点键值数组 */
  keys: number[];
  /** 子节点 id 数组 */
  childrenIds: string[];
  /** 父节点 id（根节点为空字符串） */
  parent: string;
  /** 节点所在深度（根为 0） */
  depth: number;
  /** 是否为叶子节点 */
  leaf: boolean;
  /** x 坐标占位（由可视化器填充） */
  x: number;
  /** y 坐标占位（由可视化器填充） */
  y: number;
  /** 是否高亮（供动画使用） */
  highlighted: boolean;
}

/** 扁平化边（供可视化器使用） */
export interface BTreeFlattenedEdge {
  /** 起点 id（父节点） */
  from: string;
  /** 终点 id（子节点） */
  to: string;
}

/** 扁平化 B 树结构（供可视化器使用） */
export interface BTreeFlattened {
  nodes: BTreeFlattenedNode[];
  edges: BTreeFlattenedEdge[];
}

/** B 树状态接口（继承数据结构状态基座） */
export interface BTreeState extends DataStructureState<BTreeNode | null> {
  /** 插入节点（按需分裂） */
  insert: (value: string | number) => void;
  /** 查找节点，返回路径与是否找到 */
  search: (value: number) => { found: boolean; path: number[][] };
  /** 中序遍历 */
  inorder: () => number[];
  /** 获取扁平化结构（供可视化器） */
  getFlattened: () => BTreeFlattened;
  /** 节点总数 */
  nodeCount: number;
  /** 键值总数 */
  keyCount: number;
}

/**
 * 线段树类型定义
 *
 * 数据表示：递归对象（SegmentTreeNode），每个节点存储区间边界、sum 值和左右子节点
 * 状态层存储原始数组（number[]），线段树从数组派生
 */

/** 线段树节点（递归对象表示） */
export interface SegmentTreeNode {
  /** 区间左端点（闭区间） */
  start: number;
  /** 区间右端点（闭区间） */
  end: number;
  /** 区间内元素之和 */
  sum: number;
  /** 左子节点（叶子节点为 null） */
  left: SegmentTreeNode | null;
  /** 右子节点（叶子节点为 null） */
  right: SegmentTreeNode | null;
}

/** 扁平化节点（供可视化器使用） */
export interface SegmentTreeFlattenedNode {
  /** 节点唯一标识（基于层序遍历顺序） */
  id: string;
  /** 区间左端点 */
  start: number;
  /** 区间右端点 */
  end: number;
  /** 区间求和值 */
  sum: number;
  /** 子节点 id 数组 */
  childrenIds: string[];
  /** 父节点 id（根节点为空字符串） */
  parent: string;
  /** 节点所在层级（根为 0） */
  level: number;
  /** 是否为叶子节点 */
  isLeaf: boolean;
  /** x 坐标占位（由可视化器填充） */
  x: number;
  /** y 坐标占位（由可视化器填充） */
  y: number;
  /** 是否高亮（供动画使用） */
  highlighted: boolean;
}

/** 扁平化边（供可视化器使用） */
export interface SegmentTreeFlattenedEdge {
  /** 起点 id（父节点） */
  from: string;
  /** 终点 id（子节点） */
  to: string;
}

/** 扁平化线段树结构（供可视化器使用） */
export interface SegmentTreeFlattened {
  nodes: SegmentTreeFlattenedNode[];
  edges: SegmentTreeFlattenedEdge[];
  /** 原始数组（供可视化器展示底层数据） */
  originalArray: number[];
}

/** 线段树状态接口（继承数据结构状态基座） */
export interface SegmentTreeState extends DataStructureState<number[]> {
  /** 从数组构建线段树 */
  build: (arr: number[]) => void;
  /** 区间查询，返回求和结果与访问路径 */
  query: (start: number, end: number) => { sum: number; path: { start: number; end: number; sum: number }[] };
  /** 单点更新 */
  update: (index: number, value: number) => void;
  /** 获取扁平化结构（供可视化器） */
  getFlattened: () => SegmentTreeFlattened;
  /** 节点总数 */
  nodeCount: number;
}

export interface VisualizerReturn {
  containerRef: React.RefObject<HTMLDivElement>;
  svgRef: React.RefObject<SVGSVGElement>;
  dimensions: { width: number; height: number };
  getAnimationContext: () => import('../utils/animationEngine').Animation;
  abortAnimation: () => void;
}

export interface GlobalSettings {
  animationSpeed: number;
  setAnimationSpeed: (value: number) => void;
  cycleSpeed: () => void;
  showIndices: boolean;
  setShowIndices: (show: boolean) => void;
  currentPreset: string;
  applyPreset: (key: string) => void;
  t: (key: string) => string;
  lang: string;
  setLanguage: (lang: string) => void;
  supportedLanguages: string[];
}
