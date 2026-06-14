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
  insert: (index: number, value: number) => void;
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
  push: (value: number) => void;
  pop: () => number | undefined;
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
  detectCycle: () => boolean;
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
  getUndoPreview: () => any | null;
  getRedoPreview: () => any | null;
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

export interface TrieState extends DataStructureState<any> {
  insert: (word: string) => void;
  remove: (word: string) => void;
  search: (word: string) => boolean;
  searchPrefix: (prefix: string) => string[];
  getFlattened: () => any;
  wordCount: number;
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
