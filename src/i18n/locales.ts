export interface Locale {
  common: {
    delete: string
    search: string
    reset: string
    randomize: string
    run: string
    stop: string
    undo: string
    redo: string
    clear: string
    confirmClear: string
    more: string
    close: string
    running: string
    skipToContent: string
  }
  array: {
    title: string
    subtitle: string
    search: string
    searchAll: string
    binarySearch: string
    insert: string
    delete: string
    indexPlaceholder: string
    valuePlaceholder: string
  }
  stack: {
    title: string
    subtitle: string
    push: string
    pop: string
    peek: string
  }
  queue: {
    title: string
    subtitle: string
    enqueue: string
    dequeue: string
    peek: string
  }
  linkedlist: {
    title: string
    subtitle: string
    pushFront: string
    pushBack: string
    reverse: string
    find: string
    insertAt: string
    detectCycle: string
    headLabel: string
    nullLabel: string
    doublyTitle: string
    doublySubtitle: string
    switchToDoubly: string
    switchToSingle: string
  }
  tree: {
    title: string
    subtitle: string
    insert: string
    search: string
    preorder: string
    inorder: string
    postorder: string
    levelorder: string
    edgeStyle: string
    animationStarting: string
  }
  avlTree: {
    title: string
    subtitle: string
    insert: string
    search: string
    preorder: string
    inorder: string
    postorder: string
    levelorder: string
    nodeTitle: string
  }
  redBlackTree: {
    title: string
    subtitle: string
    insert: string
    search: string
    inorder: string
    inputPlaceholder: string
    nodeTitle: string
    colorRed: string
    colorBlack: string
  }
  bTree: {
    title: string
    subtitle: string
    insert: string
    search: string
    inorder: string
    nodeTitle: string
    leaf: string
    internal: string
  }
  segmentTree: {
    title: string
    subtitle: string
    build: string
    query: string
    update: string
    rangeStart: string
    rangeEnd: string
    index: string
    value: string
    buildPlaceholder: string
    buildEmpty: string
    buildInvalid: string
    queryInvalid: string
    queryOutOfRange: string
    updateInvalid: string
    updateOutOfRange: string
    nodeTitle: string
    leaf: string
    internal: string
    arrayLabel: string
  }
  graph: {
    title: string
    subtitle: string
    inputPlaceholder: string
    addNode: string
    removeNode: string
    addEdge: string
    removeEdge: string
    bfs: string
    dfs: string
    dijkstra: string
    source: string
    target: string
    weight: string
    adjacencyMatrix: string
    adjacencyList: string
    nodes: string
    edges: string
    degree: string
    density: string
    noNeighbors: string
    legendEdge: string
    legendNoEdge: string
    legendSelfLoop: string
  }
  hash: {
    title: string
    subtitle: string
    keyPlaceholder: string
    valuePlaceholder: string
    insert: string
    remove: string
    search: string
  }
  heap: {
    title: string
    subtitle: string
    inputPlaceholder: string
    insert: string
    extractMax: string
    peek: string
  }
  trie: {
    title: string
    subtitle: string
    inputPlaceholder: string
    insert: string
    delete: string
    search: string
    prefixSearch: string
    rootLabel: string
  }
  skipList: {
    title: string
    subtitle: string
    inputPlaceholder: string
    insert: string
    delete: string
    search: string
    headLabel: string
  }
  unionFind: {
    title: string
    subtitle: string
    inputPlaceholder: string
    inputPlaceholderB: string
    insert: string
    remove: string
    find: string
    union: string
    connected: string
  }
  sort: {
    title: string
    subtitle: string
    randomize: string
    stop: string
    compare: string
    swap: string
    steps: string
    legend: string
    selectAlgorithm: string
    bubble: string
    radix: string
    bucket: string
    quick: string
    merge: string
    heapSort: string
    selection: string
    insertion: string
    shell: string
    comb: string
    tim: string
    counting: string
    axisX: string
    axisY: string
  }
  compare: {
    title: string
    subtitle: string
    runAll: string
    stop: string
    randomize: string
    reset: string
    exportCSV: string
    exportJSON: string
    exportResults: string
  }
  graphAlgorithm: {
    title: string
    subtitle: string
    algorithm: string
    startNode: string
    complexityCompare: string
  }
  sidebar: {
    title: string
    themeTooltip: string
    themeModeTooltip: string
    langTooltip: string
    openMenu: string
    collapseMenu: string
    home: string
    array: string
    stack: string
    queue: string
    linkedlist: string
    tree: string
    avlTree: string
    redBlackTree: string
    bTree: string
    segmentTree: string
    graph: string
    sort: string
    hash: string
    heap: string
    trie: string
    skipList: string
    unionFind: string
    compare: string
    graphAlgorithm: string
    themeDefault: string
    themeForest: string
    themeWarm: string
    themeRoyal: string
  }
  home: {
    badge: string
    title: string
    heroDescription: string
    tagline: string
    selectStructure: string
    enterModule: string
    modules: string
  }
  settings: {
    animationSpeed: string
  }
  toast: {
    dismissLabel: string
    reset: string
    randomized: string
    undo: string
    redo: string
    dataImported: string
    persistenceCleared: string
  }
  emptyState: {
    emptyStackShort: string
    emptyQueueShort: string
    emptyLinkedListShort: string
    emptyTreeShort: string
    emptyAvlShort: string
    emptyRedBlackTreeShort: string
    emptyBTreeShort: string
    emptyGraphShort: string
    emptyHashShort: string
    emptyHeapShort: string
    emptyTrieShort: string
    emptySkipListShort: string
    emptyUnionFindShort: string
    nodeNotFound: string
    emptyArray: string
    emptyArrayDesc: string
    emptyStack: string
    emptyStackDesc: string
    emptyQueue: string
    emptyQueueDesc: string
    emptyLinkedList: string
    emptyLinkedListDesc: string
    emptyTree: string
    emptyTreeDesc: string
    emptyAvl: string
    emptyAvlDesc: string
    emptyRedBlackTree: string
    emptyRedBlackTreeDesc: string
    emptyBTree: string
    emptyBTreeDesc: string
    emptySegmentTree: string
    emptySegmentTreeShort: string
    emptySegmentTreeDesc: string
    emptyGraph: string
    emptyGraphDesc: string
    emptyHash: string
    emptyHashDesc: string
    emptyHeap: string
    emptyHeapDesc: string
    emptyTrie: string
    emptyTrieDesc: string
    emptySkipList: string
    emptySkipListDesc: string
    emptyUnionFind: string
    emptyUnionFindDesc: string
    emptySort: string
    emptySortDesc: string
    defaultTitle: string
    defaultDesc: string
    fill: string
  }
  logPanel: {
    title: string
    noLogs: string
    autoScroll: string
    freeze: string
    viewCode: string
    type: {
      oper: string
      info: string
      error: string
      code: string
    }
  }
  stepExplainer: {
    prev: string
    reset: string
    next: string
    selectAlgorithm: string
    step: string
    autoPlay: string
    pause: string
    speed: string
  }
  infoPanel: {
    tabLog: string
    tabLearning: string
    logEmpty: string
    logCount: string
    learningEmpty: string
    closeDrawer: string
    openDrawer: string
    recent: string
    tabs: string
    stepBadge: string
  }
  quiz: {
    title: string
    question: string
    of: string
    submit: string
    correct: string
    incorrect: string
    explanation: string
    next: string
    prev: string
    score: string
    correctCount: string
    reset: string
    complete: string
    noQuestions: string
    yourAnswer: string
    correctAnswer: string
  }
  errorBoundary: {
    title: string
    retry: string
    renderFailed: string
    stackDetails: string
  }
  share: {
    label: string
    generateFailed: string
    copied: string
    copyManually: string
    generateLink: string
    linkCopied: string
    decodeFailed: string
    invalidData: string
    loaded: string
  }
  network: {
    offline: string
    offlineMode: string
    reconnected: string
  }
  learning: {
    open: string
    close: string
    title: string
  }
  advancedLearning: {
    complexityAnalysis: {
      title: string
      timeComplexity: string
      spaceComplexity: string
      bigONotation: string
      bestCase: string
      worstCase: string
      averageCase: string
      amortizedAnalysis: string
    }
    advancedDataStructures: {
      title: string
      redBlackTree: string
      bTree: string
      skipList: string
      bloomFilter: string
      unionFind: string
    }
    realWorldApplications: {
      title: string
      browserHistory: string
      taskQueue: string
      fileSystem: string
      socialNetwork: string
      searchEngine: string
      cache: string
    }
  }
  learningPath: {
    title: string
    progress: string
    reset: string
    completed: string
    locked: string
    startLearning: string
    continueLearning: string
    allCompleted: string
    overviewTitle: string
    overallCompletionRate: string
    completedModules: string
    inProgressModules: string
    notStartedModules: string
    totalModules: string
    learningGoal: string
    targetSteps: string
    targetStepsHint: string
    targetDate: string
    setGoal: string
    clearGoal: string
    goalProgress: string
    goalSetSuccess: string
    goalSetFailed: string
    category: {
      linear: string
      tree: string
      hash: string
      graph: string
      sort: string
    }
    difficulty: {
      beginner: string
      intermediate: string
      advanced: string
    }
    desc: {
      array: string
      stack: string
      queue: string
      linkedlist: string
      tree: string
      avlTree: string
      heap: string
      trie: string
      hash: string
      graph: string
      sort: string
    }
    sync: {
      synced: string
      failed: string
    }
  }
  recommendations: {
    title: string
    recommendedModules: string
    reasonLabel: string
    personalizedAdvice: string
    difficulty: string
    startLearning: string
    continueLearning: string
    review: string
    noRecommendations: string
    reason: {
      startHere: string
      unlockedNotStarted: string
      continueLearning: string
      review: string
    }
    advice: {
      welcome: string
      allCompleted: string
      stalled: string
      justStarted: string
      fastPace: string
      slowPace: string
      normalPace: string
    }
  }
  undoPreview: {
    noData: string
    emptyArray: string
    emptyObject: string
    defaultLabel: string
  }
  exportImport: {
    export: string
    import: string
    importFailed: string
    invalidFile: string
    exportTooltip: string
    importTooltip: string
  }
  visualizer: {
    hideGrid: string
    showGrid: string
    footer: string
    queueFront: string
    queueRear: string
    stackTop: string
    stackBottom: string
    empty: string
    zoomIn: string
    zoomOut: string
    arrayLabel: string
    stackLabel: string
    queueLabel: string
    linkedlistLabel: string
    treeLabel: string
    avlTreeLabel: string
    redBlackTreeLabel: string
    bTreeLabel: string
    segmentTreeLabel: string
    graphLabel: string
    sortLabel: string
    hashLabel: string
    heapLabel: string
    trieLabel: string
    skipListLabel: string
    unionFindLabel: string
  }
  shortcuts: {
    title: string
    close: string
    undo: string
    redo: string
    reset: string
    pause: string
    toggleHelp: string
    searchPlaceholder: string
    searchNoResults: string
    allShortcuts: string
  }
  page: {
    operations: string
    expand: string
    collapse: string
    selected: string
    running: string
    done: string
    comparing: string
    compareDone: string
    algorithms: string
    stopped: string
    animating: string
    disabled: string
  }
  performanceChart: {
    title: string
    comparisons: string
    swaps: string
    steps: string
  }
  complexityChart: {
    title: string
    legend: string
    algorithm: string
    timeComplexity: string
    spaceComplexity: string
    description: string
    empty: string
  }
  performanceMonitor: {
    show: string
    toggle: string
    jsHeap: string
    total: string
    limit: string
    status: string
    smooth: string
    fair: string
    low: string
  }
  timeline: {
    title: string
    noHistory: string
  }
  errors: {
    invalidIndex: string
    indexOutOfRange: string
    animationError: string
    animationTimeout: string
    importFailed: string
    inputRequired: string
    stopped: string
    prefixMatch: string
    noPrefixMatch: string
    tooShortToReverse: string
    enterWord: string
    enterDeleteWord: string
    enterSearchWord: string
    enterPrefix: string
    graphRunError: string
    graphResetDone: string
    exitLearning: string
    learningMode: string
    compareStopped: string
    invalidRange: string
    trieLettersOnly: string
  }
  graphView: {
    force: string
    matrix: string
    list: string
  }
  sortLegend: {
    unsorted: string
    comparing: string
    swapping: string
    sorted: string
  }
  nodeLegend: {
    node: string
    root: string
    leaf: string
    active: string
    visited: string
    head: string
    tail: string
    top: string
    endOfWord: string
    redNode: string
    blackNode: string
  }
  hooks: {
    inputInvalid: string
    dataImported: string
    randomArray: string
    arrayFull: string
    arrayLogFull: string
    arrayLogInsertError: string
    arrayLogInsertSuccess: string
    arrayInsertSuccess: string
    arrayLogDeleteError: string
    arrayLogDeleteSuccess: string
    arrayDeleteSuccess: string
    arrayLogSearchFound: string
    arraySearchFound: string
    arrayLogSearchNotFound: string
    arraySearchNotFound: string
    arrayLogSearchAllFound: string
    arraySearchAllFound: string
    arrayLogSearchAllNotFound: string
    arraySearchAllNotFound: string
    arrayLogBinarySearchFound: string
    arrayBinarySearchFound: string
    arrayLogBinarySearchNotFound: string
    arrayBinarySearchNotFound: string
    arrayBinarySearchUnsorted: string
    arrayLogBinarySearchUnsorted: string
    arrayLogRandom: string
    stackFull: string
    stackLogPush: string
    stackPushSuccess: string
    stackEmpty: string
    stackLogPop: string
    stackPopSuccess: string
    stackLogPeek: string
    stackPeek: string
    stackLogClear: string
    stackCleared: string
    queueFull: string
    queueLogEnqueue: string
    queueEnqueueSuccess: string
    queueEmpty: string
    queueLogDequeue: string
    queueDequeueSuccess: string
    queueLogFront: string
    queueFront: string
    queueLogClear: string
    queueCleared: string
    llLogInsertHead: string
    llInsertHeadSuccess: string
    llLogInsertTail: string
    llInsertTailSuccess: string
    llLogDeleteError: string
    llLogDelete: string
    llDeleteSuccess: string
    llLogSearchFound: string
    llSearchFound: string
    llLogSearchNotFound: string
    llSearchNotFound: string
    llLogInsertAtError: string
    llLogInsertAt: string
    llInsertAtSuccess: string
    llLogReverseTooShort: string
    llLogReverseDone: string
    llReversed: string
    llLogCycleEmpty: string
    llLogCycleDetected: string
    llCycleDetected: string
    llLogNoCycle: string
    llNoCycle: string
    treeLogInsert: string
    treeInsertSuccess: string
    treeLogPreorder: string
    treeLogInorder: string
    treeLogPostorder: string
    treeLogLevelorder: string
    treeLogSearchFound: string
    treeLogSearchNotFound: string
    treeDeleteNotFound: string
    treeLogDeleteNotFound: string
    treeLogDeleteSuccess: string
    treeDeleteSuccess: string
    avlLogInsert: string
    avlInsertSuccess: string
    avlInsertDuplicate: string
    avlLogInsertDuplicate: string
    avlDeleteNotFound: string
    avlLogDeleteNotFound: string
    avlLogDeleteSuccess: string
    avlDeleteSuccess: string
    avlLogSearchFound: string
    avlLogSearchNotFound: string
    avlLogPreorder: string
    avlLogInorder: string
    avlLogPostorder: string
    avlLogLevelorder: string
    redBlackTreeLogInsert: string
    redBlackTreeInsertSuccess: string
    redBlackTreeInsertDuplicate: string
    redBlackTreeLogInsertDuplicate: string
    redBlackTreeLogSearchFound: string
    redBlackTreeLogSearchNotFound: string
    redBlackTreeLogInorder: string
    bTreeLogInsert: string
    bTreeInsertSuccess: string
    bTreeInsertDuplicate: string
    bTreeLogInsertDuplicate: string
    bTreeLogSearchFound: string
    bTreeLogSearchNotFound: string
    bTreeLogInorder: string
    segmentTreeBuildEmpty: string
    segmentTreeLogBuild: string
    segmentTreeBuildSuccess: string
    segmentTreeLogQuery: string
    segmentTreeQueryInvalid: string
    segmentTreeQuerySuccess: string
    segmentTreeUpdateOutOfRange: string
    segmentTreeLogUpdate: string
    segmentTreeUpdateSuccess: string
    graphLogAddNode: string
    graphNodeAdded: string
    graphSelfLoop: string
    graphEdgeExists: string
    graphLogAddEdge: string
    graphEdgeAdded: string
    graphNodeDeleted: string
    graphEdgeDeleted: string
    graphLogBfsStart: string
    graphLogDfsStart: string
    graphLogDijkstraStart: string
    hashKeyInvalid: string
    hashLogInsertUpdate: string
    hashKeyUpdated: string
    hashLogInsertSuccess: string
    hashInsertSuccess: string
    hashKeyNotFound: string
    hashLogDeleteNotFound: string
    hashLogDeleteSuccess: string
    hashDeleteSuccess: string
    hashLogSearchFound: string
    hashLogSearchNotFound: string
    heapLogInsert: string
    heapInsertSuccess: string
    heapEmpty: string
    heapLogExtractEmpty: string
    heapLogExtract: string
    heapExtractSuccess: string
    heapLogPeekEmpty: string
    sortRandomData: string
    sortUnknownAlgorithm: string
    sortLogStart: string
    sortLogStopped: string
    sortLogComplete: string
    sortComplete: string
    trieInputRequired: string
    trieLogInsertError: string
    trieLogInsert: string
    trieInsertSuccess: string
    trieDeleteNotFound: string
    trieLogDeleteNotFound: string
    trieLogDeleteSuccess: string
    trieDeleteSuccess: string
    trieLogSearchFound: string
    trieLogSearchNotFound: string
    trieLogPrefixFound: string
    trieLogPrefixNotFound: string
    skipListInputRequired: string
    skipListLogInsertError: string
    skipListLogInsert: string
    skipListInsertSuccess: string
    skipListInsertDuplicate: string
    skipListLogInsertDuplicate: string
    skipListDeleteNotFound: string
    skipListLogDeleteNotFound: string
    skipListLogDeleteSuccess: string
    skipListDeleteSuccess: string
    skipListLogSearchFound: string
    skipListLogSearchNotFound: string
    unionFindInputRequired: string
    unionFindLogInsertError: string
    unionFindLogInsert: string
    unionFindInsertSuccess: string
    unionFindInsertDuplicate: string
    unionFindLogInsertDuplicate: string
    unionFindDeleteNotFound: string
    unionFindLogDeleteNotFound: string
    unionFindLogDeleteSuccess: string
    unionFindDeleteSuccess: string
    unionFindLogFind: string
    unionFindLogFindNotFound: string
    unionFindNodeNotFound: string
    unionFindLogNodeNotFound: string
    unionFindAlreadyConnected: string
    unionFindLogAlreadyConnected: string
    unionFindUnionSuccess: string
    unionFindLogUnion: string
    unionFindLogConnected: string
    unionFindLogNotConnected: string
  }
  speedControl: {
    presetDefault: string
    presetGentle: string
    presetSnappy: string
    presetDramatic: string
    presetInstant: string
    animationError: string
    renderSlow: string
  }
  contentTier: {
    title: string
    beginner: string
    intermediate: string
    advanced: string
    conceptLabel: string
    featuresLabel: string
    complexityLabel: string
    applicationsLabel: string
    codeLabel: string
    variantsLabel: string
    comparisonLabel: string
    engineeringLabel: string
    expand: string
    collapse: string
    array: ContentTierStructure
    stack: ContentTierStructure
    queue: ContentTierStructure
    linkedlist: ContentTierStructure
    tree: ContentTierStructure
    avlTree: ContentTierStructure
  }
  globalSearch: {
    title: string
    placeholder: string
    inputAriaLabel: string
    shortcut: string
    noResults: string
    noHistory: string
    history: string
    clearHistory: string
    removeHistory: string
    complexity: string
    categoryPage: string
    categoryLearning: string
    categoryHistory: string
  }
  pwa: {
    updateAvailable: string
    reload: string
    close: string
  }
  performance: {
    mode: string
    hint: string
  }
}

interface ContentTierStructure {
  beginnerConcept: string
  beginnerFeatures: string
  intermediateComplexity: string
  intermediateApplications: string
  intermediateCode: string
  advancedVariants: string
  advancedComparison: string
  advancedEngineering: string
}

export const zh: Locale = {
  common: {
    delete: '删除',
    search: '查找',
    reset: '重置',
    randomize: '随机数据',
    run: '运行',
    stop: '停止',
    undo: '撤销',
    redo: '重做',
    clear: '清空',
    confirmClear: '确定要清空所有数据吗？',
    more: '更多',
    close: '关闭',
    running: '运行中',
    skipToContent: '跳转到内容',
  },
  array: {
    title: '数组',
    subtitle: '线性结构 · 连续内存 · 随机访问 O(1)',
    search: '查找',
    searchAll: '查找全部',
    binarySearch: '二分查找',
    insert: '按位插',
    delete: '删除',
    indexPlaceholder: '索引 (0~19)',
    valuePlaceholder: '值 (1~99)',
  },
  stack: {
    title: '栈',
    subtitle: '后进先出 · 函数调用 · 括号匹配',
    push: '入栈',
    pop: '出栈',
    peek: '查看',
  },
  queue: {
    title: '队列',
    subtitle: '先进先出 · 缓冲队列 · 广度优先搜索',
    enqueue: '入队',
    dequeue: '出队',
    peek: '查看',
  },
  linkedlist: {
    title: '链表',
    subtitle: '动态内存 · O(1) 插入 · 单向遍历',
    pushFront: '头插',
    pushBack: '尾插',
    reverse: '反转',
    find: '查找',
    insertAt: '按位插',
    detectCycle: '检测环',
    headLabel: '头节点',
    nullLabel: '空',
    doublyTitle: '双向链表',
    doublySubtitle: '双向指针 · O(1) 删除 · 正反向遍历',
    switchToDoubly: '切换双向链表',
    switchToSingle: '切换单链表',
  },
  tree: {
    title: '二叉树',
    subtitle: '层级结构 · 递归遍历 · 二分查找',
    insert: '插入',
    search: '查找',
    preorder: '前序',
    inorder: '中序',
    postorder: '后序',
    levelorder: '层序',
    edgeStyle: '连线样式',
    animationStarting: '动画即将开始',
  },
  avlTree: {
    title: 'AVL 树',
    subtitle: '自平衡 BST · 旋转操作 · O(log n) 保证',
    insert: '插入',
    search: '查找',
    preorder: '前序',
    inorder: '中序',
    postorder: '后序',
    levelorder: '层序',
    nodeTitle: '值: {value}\n高度: {height}\n平衡因子: {balanceFactor}',
  },
  redBlackTree: {
    title: '红黑树',
    subtitle: '自平衡 BST · 红黑性质 · O(log n) 保证',
    insert: '插入',
    search: '查找',
    inorder: '中序',
    inputPlaceholder: '输入 1-99',
    nodeTitle: '值: {value}, 颜色: {color}',
    colorRed: '红色',
    colorBlack: '黑色',
  },
  bTree: {
    title: 'B 树',
    subtitle: '多路搜索树 · 节点分裂 · O(log n) 保证',
    insert: '插入',
    search: '查找',
    inorder: '中序',
    nodeTitle: 'keys: {keys}\nkey 数量: {count}\n类型: {type}',
    leaf: '叶子节点',
    internal: '内部节点',
  },
  segmentTree: {
    title: '线段树',
    subtitle: '区间查询 · 单点更新 · O(log n)',
    build: '构建',
    query: '查询',
    update: '更新',
    rangeStart: '区间起点',
    rangeEnd: '区间终点',
    index: '下标',
    value: '值',
    buildPlaceholder: '数组 (如 1,2,3,4)',
    buildEmpty: '请输入数组',
    buildInvalid: '数组格式无效（1-50 个整数）',
    queryInvalid: '请输入有效的区间',
    queryOutOfRange: '区间超出范围',
    updateInvalid: '请输入有效的下标和值',
    updateOutOfRange: '下标超出范围',
    nodeTitle: '区间: {range}\n求和: {sum}\n类型: {type}',
    leaf: '叶子节点',
    internal: '内部节点',
    arrayLabel: '数组',
  },
  graph: {
    title: '图',
    subtitle: '网络结构 · BFS / DFS · 最短路径',
    inputPlaceholder: '节点名 (如 A)',
    addNode: '添加节点',
    removeNode: '删除节点',
    addEdge: '添加边',
    removeEdge: '删除边',
    bfs: 'BFS',
    dfs: 'DFS',
    dijkstra: 'Dijkstra',
    source: '起点',
    target: '终点',
    weight: '权重',
    adjacencyMatrix: '邻接矩阵',
    adjacencyList: '邻接表',
    nodes: '节点',
    edges: '边',
    degree: '度',
    density: '密度',
    noNeighbors: '无邻接',
    legendEdge: '有边',
    legendNoEdge: '无边',
    legendSelfLoop: '自环',
  },
  hash: {
    title: '哈希表',
    subtitle: '键值映射 · 冲突解决 · O(1)',
    keyPlaceholder: '键 (0~99)',
    valuePlaceholder: '值 (任意文本)',
    insert: '插入',
    remove: '删除',
    search: '查找',
  },
  heap: {
    title: '堆',
    subtitle: '完全二叉树 · 最大堆 · 优先队列',
    inputPlaceholder: '值 (1~99)',
    insert: '插入',
    extractMax: '提取最大值',
    peek: '查看堆顶',
  },
  trie: {
    title: '字典树',
    subtitle: '前缀树 · 字符串高效检索',
    inputPlaceholder: '输入英文单词',
    insert: '插入',
    delete: '删除',
    search: '查找',
    prefixSearch: '前缀匹配',
    rootLabel: '根',
  },
  skipList: {
    title: '跳表',
    subtitle: '概率平衡 · 多层链表 · O(log n) 查找',
    inputPlaceholder: '值 (1~99)',
    insert: '插入',
    delete: '删除',
    search: '查找',
    headLabel: 'H',
  },
  unionFind: {
    title: '并查集',
    subtitle: '路径压缩 · 按秩合并 · 近 O(1) 操作',
    inputPlaceholder: '值 A (1~99)',
    inputPlaceholderB: '值 B (1~99)',
    insert: '插入',
    remove: '删除',
    find: '查找根',
    union: '合并',
    connected: '连通性',
  },
  sort: {
    title: '排序',
    subtitle: '算法可视化 · 时间复杂度对比',
    randomize: '随机数据',
    stop: '停止',
    compare: '比较',
    swap: '交换',
    steps: '步数',
    legend: '图例',
    axisX: '数组下标',
    axisY: '数值',
    selectAlgorithm: '选择算法',
    bubble: '冒泡排序',
    radix: '基数排序',
    bucket: '桶排序',
    quick: '快速排序',
    merge: '归并排序',
    heapSort: '堆排序',
    selection: '选择排序',
    insertion: '插入排序',
    shell: '希尔排序',
    comb: '梳排序',
    tim: 'TimSort',
    counting: '计数排序',
  },
  compare: {
    title: '算法对比',
    subtitle: '并行执行 · 性能对比 · 可视化',
    runAll: '全部运行',
    stop: '停止',
    randomize: '随机数据',
    reset: '重置',
    exportCSV: '导出 CSV',
    exportJSON: '导出 JSON',
    exportResults: '导出结果',
  },
  graphAlgorithm: {
    title: '图算法可视化',
    subtitle: 'BFS / DFS / Dijkstra / 拓扑排序 / Bellman-Ford / Floyd-Warshall / Prim / Kruskal',
    algorithm: '算法',
    startNode: '起始节点',
    complexityCompare: '复杂度对比',
  },
  sidebar: {
    title: '数据结构学习助手',
    themeTooltip: '主题',
    themeModeTooltip: '明暗主题',
    langTooltip: '语言',
    openMenu: '打开导航菜单',
    collapseMenu: '收起导航菜单',
    home: '首页',
    array: '数组',
    stack: '栈',
    queue: '队列',
    linkedlist: '链表',
    tree: '二叉树',
    avlTree: 'AVL 树',
    redBlackTree: '红黑树',
    bTree: 'B 树',
    segmentTree: '线段树',
    graph: '图',
    sort: '排序',
    hash: '哈希表',
    heap: '堆',
    trie: '字典树',
    skipList: '跳表',
    compare: '算法对比',
    graphAlgorithm: '图算法',
    unionFind: '并查集',
    themeDefault: '默认',
    themeForest: '森林',
    themeWarm: '暖色',
    themeRoyal: '皇家',
  },
  home: {
    badge: '数据结构可视化',
    title: '数据结构学习助手',
    heroDescription: '通过交互式可视化动画，直观理解 12 种核心数据结构的原理与操作。硬边框风格 · 工程图纸质感 · 实时动画反馈。',
    tagline: '交互式数据结构可视化工具',
    selectStructure: '选择数据结构开始探索',
    enterModule: '进入模块',
    modules: '个模块',
  },
  settings: {
    animationSpeed: '动画速度',
  },
  toast: {
    dismissLabel: '关闭通知',
    reset: '已重置',
    randomized: '已生成新数据',
    undo: '已撤销',
    redo: '已重做',
    dataImported: '数据已导入',
    persistenceCleared: '持久化数据已清除',
  },
  emptyState: {
    emptyStackShort: '空栈',
    emptyQueueShort: '空队列',
    emptyLinkedListShort: '空链表',
    emptyTreeShort: '空二叉树',
    emptyAvlShort: '空 AVL 树 · 请插入节点',
    emptyRedBlackTreeShort: '空红黑树 · 请插入节点',
    emptyBTreeShort: '空 B 树 · 请插入节点',
    emptyGraphShort: '空图 · 请添加节点',
    emptyHashShort: '空哈希表 · 请插入键值对',
    emptyHeapShort: '空堆 · 请插入元素',
    emptyTrieShort: '空字典树 · 请插入单词',
    emptySkipListShort: '空跳表 · 请插入元素',
    emptyUnionFindShort: '空并查集 · 请插入元素',
    nodeNotFound: '未找到目标节点',
    emptyArray: '数组为空',
    emptyArrayDesc: '点击下方按钮生成随机数据或手动插入元素',
    emptyStack: '栈为空',
    emptyStackDesc: '点击 Push 按钮压入元素',
    emptyQueue: '队列为空',
    emptyQueueDesc: '点击 Enqueue 按钮入队元素',
    emptyLinkedList: '链表为空',
    emptyLinkedListDesc: '点击头部/尾部插入按钮添加节点',
    emptyTree: '二叉树为空',
    emptyTreeDesc: '点击插入按钮添加节点',
    emptyAvl: 'AVL 树为空',
    emptyAvlDesc: '点击插入按钮添加节点',
    emptyRedBlackTree: '红黑树为空',
    emptyRedBlackTreeDesc: '点击插入按钮添加节点',
    emptyBTree: 'B 树为空',
    emptyBTreeDesc: '点击插入按钮添加节点',
    emptySegmentTree: '线段树为空',
    emptySegmentTreeShort: '空线段树 · 请构建数组',
    emptySegmentTreeDesc: '输入数组并点击构建按钮创建线段树',
    emptyGraph: '图为空',
    emptyGraphDesc: '点击添加节点按钮创建图',
    emptyHash: '哈希表为空',
    emptyHashDesc: '点击插入按钮添加键值对',
    emptyHeap: '堆为空',
    emptyHeapDesc: '点击插入按钮添加元素',
    emptyTrie: '字典树为空',
    emptyTrieDesc: '点击插入按钮添加单词',
    emptySkipList: '跳表为空',
    emptySkipListDesc: '点击插入按钮添加元素',
    emptyUnionFind: '并查集为空',
    emptyUnionFindDesc: '点击插入按钮添加元素',
    emptySort: '排序数据为空',
    emptySortDesc: '点击随机生成按钮创建排序数据',
    defaultTitle: '暂无数据',
    defaultDesc: '点击下方按钮填充数据',
    fill: '填充数据',
  },
  exportImport: {
    export: '导出',
    import: '导入',
    importFailed: '导入失败',
    invalidFile: '无效文件',
    exportTooltip: '导出数据为 JSON 文件',
    importTooltip: '从 JSON 文件导入数据',
  },
  visualizer: {
    hideGrid: '隐藏网格',
    showGrid: '显示网格',
    footer: 'REACT + D3.JS + TAILWIND CSS · NEO-BRUTALIST DESIGN · 2026',
    queueFront: '↑ 队首 Front',
    queueRear: '↑ 队尾 Rear',
    stackTop: '栈顶 Top',
    stackBottom: '栈底 Bottom',
    empty: '数据结构可视化',
    zoomIn: '放大',
    zoomOut: '缩小',
    arrayLabel: '数组可视化',
    stackLabel: '栈可视化',
    queueLabel: '队列可视化',
    linkedlistLabel: '链表可视化',
    treeLabel: '二叉树可视化',
    avlTreeLabel: 'AVL 树可视化',
    redBlackTreeLabel: '红黑树可视化',
    bTreeLabel: 'B 树可视化',
    segmentTreeLabel: '线段树可视化',
    graphLabel: '图可视化',
    sortLabel: '排序可视化',
    hashLabel: '哈希表可视化',
    heapLabel: '堆可视化',
    trieLabel: '字典树可视化',
    skipListLabel: '跳表可视化',
    unionFindLabel: '并查集可视化',
  },
  shortcuts: {
    title: '键盘快捷键',
    close: '按 Esc 或点击外部关闭',
    undo: '撤销上一步操作',
    redo: '重做被撤销的操作',
    reset: '重置数据结构',
    pause: '暂停动画',
    toggleHelp: '显示/隐藏快捷键帮助',
    searchPlaceholder: '搜索快捷键...',
    searchNoResults: '无匹配结果',
    allShortcuts: '全部快捷键',
  },
  page: {
    operations: '操作',
    expand: '展开',
    collapse: '收起',
    selected: '个已选',
    running: '运行中...',
    done: '全部完成',
    comparing: '开始并行对比',
    compareDone: '对比完成',
    algorithms: '个算法',
    stopped: '已停止排序',
    animating: '动画进行中，请稍候',
    disabled: '已禁用',
  },
  performanceChart: {
    title: '性能对比',
    comparisons: '比较次数',
    swaps: '交换次数',
    steps: '总步数',
  },
  complexityChart: {
    title: '复杂度对比',
    legend: '图例',
    algorithm: '算法',
    timeComplexity: '时间复杂度',
    spaceComplexity: '空间复杂度',
    description: '说明',
    empty: '暂无算法数据',
  },
  performanceMonitor: {
    show: '显示性能监控',
    toggle: '切换性能详情',
    jsHeap: 'JS 堆内存',
    total: '总计',
    limit: '上限',
    status: '状态',
    smooth: '流畅',
    fair: '一般',
    low: '低',
  },
  timeline: {
    title: '操作历史',
    noHistory: '暂无操作历史',
  },
  logPanel: {
    title: '执行日志',
    noLogs: '暂无日志记录',
    autoScroll: 'AUTO↓',
    freeze: 'FREEZE',
    viewCode: '查看代码',
    type: {
      oper: '操作',
      info: '信息',
      error: '错误',
      code: '代码',
    },
  },
  stepExplainer: {
    prev: '上一步',
    reset: '重置',
    next: '下一步',
    selectAlgorithm: '选择算法并开始学习',
    step: '步骤',
    autoPlay: '自动播放',
    pause: '暂停',
    speed: '速度',
  },
  infoPanel: {
    tabLog: '操作日志',
    tabLearning: '学习模式',
    logEmpty: '暂无操作记录',
    logCount: '条',
    learningEmpty: '当前结构暂无学习内容',
    closeDrawer: '收起面板',
    openDrawer: '展开面板',
    recent: '最近',
    tabs: '信息面板标签',
    stepBadge: '对应学习步骤',
  },
  quiz: {
    title: '课后测验',
    question: '题目',
    of: '/',
    submit: '提交答案',
    correct: '回答正确',
    incorrect: '回答错误',
    explanation: '解析',
    next: '下一题',
    prev: '上一题',
    score: '得分',
    correctCount: '答对',
    reset: '重新开始',
    complete: '测验完成',
    noQuestions: '暂无测验题目',
    yourAnswer: '你的答案',
    correctAnswer: '正确答案',
  },
  errorBoundary: {
    title: '组件异常',
    retry: '重试',
    renderFailed: '可视化组件渲染失败',
    stackDetails: '堆栈详情（开发模式）',
  },
  share: {
    label: '分享',
    generateFailed: '生成链接失败',
    copied: '链接已复制到剪贴板',
    copyManually: '请手动复制链接',
    generateLink: '生成分享链接',
    linkCopied: '链接已复制',
    decodeFailed: '分享链接数据无效',
    invalidData: '分享数据格式不匹配',
    loaded: '已加载分享数据',
  },
  network: {
    offline: '网络已断开',
    offlineMode: '离线模式',
    reconnected: '网络已恢复',
  },
  learning: {
    open: '◇ 学习模式',
    close: '◇ 关闭学习模式',
    title: '学习模式',
  },
  advancedLearning: {
    complexityAnalysis: {
      title: '算法复杂度分析',
      timeComplexity: '时间复杂度',
      spaceComplexity: '空间复杂度',
      bigONotation: '大O表示法',
      bestCase: '最好情况',
      worstCase: '最坏情况',
      averageCase: '平均情况',
      amortizedAnalysis: '均摊分析',
    },
    advancedDataStructures: {
      title: '高级数据结构应用',
      redBlackTree: '红黑树',
      bTree: 'B树',
      skipList: '跳表',
      bloomFilter: '布隆过滤器',
      unionFind: '并查集',
    },
    realWorldApplications: {
      title: '实际应用场景',
      browserHistory: '浏览器历史记录',
      taskQueue: '任务队列',
      fileSystem: '文件系统',
      socialNetwork: '社交网络',
      searchEngine: '搜索引擎',
      cache: '缓存',
    },
  },
  learningPath: {
    title: '学习路径',
    progress: '学习进度',
    reset: '重置进度',
    completed: '已完成',
    locked: '未解锁',
    startLearning: '开始学习',
    continueLearning: '继续学习',
    allCompleted: '恭喜！全部学完',
    overviewTitle: '进度概览',
    overallCompletionRate: '总体完成率',
    completedModules: '已完成',
    inProgressModules: '进行中',
    notStartedModules: '未开始',
    totalModules: '总模块数',
    learningGoal: '学习目标',
    targetSteps: '目标步骤数',
    targetStepsHint: '请输入 1~{max} 的目标步数',
    targetDate: '目标日期',
    setGoal: '设定目标',
    clearGoal: '清除目标',
    goalProgress: '目标进度',
    goalSetSuccess: '目标已设定',
    goalSetFailed: '目标设定失败',
    category: {
      linear: '线性结构',
      tree: '树形结构',
      hash: '哈希结构',
      graph: '图结构',
      sort: '排序算法',
    },
    difficulty: {
      beginner: '入门',
      intermediate: '进阶',
      advanced: '高级',
    },
    desc: {
      array: '连续存储，O(1) 随机访问，所有数据结构的基础',
      stack: '后进先出，函数调用与表达式求值的核心',
      queue: '先进先出，BFS 遍历与任务调度的基础',
      linkedlist: '动态增删，理解指针与引用的第一步',
      tree: '层次结构，二叉搜索树是高效查找的基石',
      avlTree: '自平衡 BST，通过旋转保证 O(log n) 操作复杂度',
      heap: '优先队列，堆排序与 Top-K 问题的利器',
      trie: '前缀树，自动补全与字符串搜索的利器',
      hash: 'O(1) 查找，理解哈希函数与冲突处理',
      graph: '关系建模，最短路径与拓扑排序的核心',
      sort: '算法基石，理解时间与空间复杂度的必经之路',
    },
    sync: {
      synced: '进度已同步',
      failed: '进度同步失败',
    },
  },
  recommendations: {
    title: '学习推荐',
    recommendedModules: '推荐模块',
    reasonLabel: '推荐理由',
    personalizedAdvice: '个性化建议',
    difficulty: '难度',
    startLearning: '开始学习',
    continueLearning: '继续学习',
    review: '复习',
    noRecommendations: '暂无推荐，继续探索吧！',
    reason: {
      startHere: '从这里开始，适合入门',
      unlockedNotStarted: '已解锁，前置模块已完成',
      continueLearning: '继续学习，你已经开始',
      review: '复习巩固，重温已学内容',
    },
    advice: {
      welcome: '欢迎开始学习之旅！从基础模块开始，逐步深入。',
      allCompleted: '恭喜！你已完成所有模块，可以尝试更高级的算法挑战。',
      stalled: '已经 {days} 天没有完成新模块了，建议复习已学内容或从基础模块重新开始。',
      justStarted: '你已经开始了学习之旅，继续加油！完成第一个模块来解锁更多内容。',
      fastPace: '学习速度很快！{completed} 个模块用了 {days} 天，可以尝试挑战更高难度的内容。',
      slowPace: '学习节奏较慢，{completed} 个模块用了 {days} 天，建议放慢脚步，巩固基础。',
      normalPace: '学习节奏稳定，{completed} 个模块用了 {days} 天，继续保持！',
    },
  },
  undoPreview: {
    noData: '无数据',
    emptyArray: '空数组',
    emptyObject: '空对象',
    defaultLabel: '撤销后状态',
  },
  errors: {
    invalidIndex: '索引必须是有效数字',
    indexOutOfRange: '索引必须在 {range} 之间',
    animationError: '{action}动画出错',
    animationTimeout: '动画执行超时，已自动恢复',
    importFailed: '导入失败',
    inputRequired: '请输入{item}',
    stopped: '已停止',
    prefixMatch: '前缀匹配',
    noPrefixMatch: '无前缀匹配结果',
    tooShortToReverse: '链表长度不足，无需反转',
    enterWord: '请输入单词',
    enterDeleteWord: '请输入要删除的单词',
    enterSearchWord: '请输入要查找的单词',
    enterPrefix: '请输入前缀',
    graphRunError: '运行出错',
    graphResetDone: '已重置',
    exitLearning: '退出学习',
    learningMode: '学习模式',
    compareStopped: '已停止对比',
    invalidRange: '请输入 {min}~{max} 之间的整数',
    trieLettersOnly: '单词只能包含字母 (a-z)',
  },
  graphView: {
    force: '力导向',
    matrix: '矩阵',
    list: '邻接表',
  },
  sortLegend: {
    unsorted: '未排序',
    comparing: '比较中',
    swapping: '交换中',
    sorted: '已排序',
  },
  nodeLegend: {
    node: '节点',
    root: '根节点',
    leaf: '叶子节点',
    active: '活跃节点',
    visited: '已访问',
    head: '头节点',
    tail: '尾节点',
    top: '栈顶',
    endOfWord: '词尾标记',
    redNode: '红色节点',
    blackNode: '黑色节点',
  },
  hooks: {
    inputInvalid: '请输入 1~99 之间的整数',
    dataImported: '数据已导入',
    randomArray: '已生成随机数组',
    arrayFull: '数组元素不能超过 {max} 个',
    arrayLogFull: '数组已满',
    arrayLogInsertError: '无效输入: {value}',
    arrayLogInsertSuccess: 'insert({value}, {index}) 成功，长度: {length}',
    arrayInsertSuccess: '插入 {value} 到位置 {index}',
    arrayLogDeleteError: 'delete({index}) 索引越界',
    arrayLogDeleteSuccess: 'delete({index}) 删除值: {value}，长度: {length}',
    arrayDeleteSuccess: '删除位置 {index} 的元素 {value}',
    arrayLogSearchFound: 'search({value}) 找到，索引: {index}',
    arraySearchFound: '找到 {value} 在位置 {index}',
    arrayLogSearchNotFound: 'search({value}) 未找到',
    arraySearchNotFound: '未找到 {value}',
    arrayLogSearchAllFound: 'searchAll({value}) 找到 {count} 个，索引: {indices}',
    arraySearchAllFound: '找到 {count} 个 {value}，位置: {indices}',
    arrayLogSearchAllNotFound: 'searchAll({value}) 未找到',
    arraySearchAllNotFound: '未找到 {value}',
    arrayLogBinarySearchFound: 'binarySearch({value}) 找到，索引: {index}',
    arrayBinarySearchFound: '二分查找：{value} 在位置 {index}',
    arrayLogBinarySearchNotFound: 'binarySearch({value}) 未找到',
    arrayBinarySearchNotFound: '二分查找未找到 {value}',
    arrayBinarySearchUnsorted: '数组未排序，二分查找需要有序数组',
    arrayLogBinarySearchUnsorted: 'binarySearch 失败：数组未排序',
    arrayLogRandom: '随机生成数组: [{data}]',
    stackFull: '栈已满 (最大 {max})',
    stackLogPush: 'push({value}) → 栈顶: {top}, 大小: {size}',
    stackPushSuccess: '入栈 {value}',
    stackEmpty: '栈为空，无法出栈',
    stackLogPop: 'pop() → 返回值: {value}, 大小: {size}',
    stackPopSuccess: '出栈 {value}',
    stackLogPeek: 'peek() → 栈顶: {value}',
    stackPeek: '栈顶: {value}',
    stackLogClear: 'clear() → 栈已清空',
    stackCleared: '栈已清空',
    queueFull: '队列已满 (最大 {max})',
    queueLogEnqueue: 'enqueue({value}) → 队尾: {tail}, 大小: {size}',
    queueEnqueueSuccess: '入队 {value}',
    queueEmpty: '队列为空，无法出队',
    queueLogDequeue: 'dequeue() → 返回值: {value}, 大小: {size}',
    queueDequeueSuccess: '出队 {value}',
    queueLogFront: 'front() → 队首: {value}',
    queueFront: '队首: {value}',
    queueLogClear: 'clear() → 队列已清空',
    queueCleared: '队列已清空',
    llLogInsertHead: 'insertHead({value}) → 新头节点: {head}, 长度: {length}',
    llInsertHeadSuccess: '头部插入 {value}',
    llLogInsertTail: 'insertTail({value}) → 新尾节点: {tail}, 长度: {length}',
    llInsertTailSuccess: '尾部插入 {value}',
    llLogDeleteError: 'delete({index}) 索引越界',
    llLogDelete: 'delete({index}) → 删除值: {value}, 长度: {length}',
    llDeleteSuccess: '删除位置 {index} 的节点 {value}',
    llLogSearchFound: 'search({value}) → 找到，位置: {index}',
    llSearchFound: '找到 {value} 在位置 {index}',
    llLogSearchNotFound: 'search({value}) → 未找到',
    llSearchNotFound: '未找到 {value}',
    llLogInsertAtError: 'insertAt({index}, {value}) 索引越界',
    llLogInsertAt: 'insertAt({index}, {value}) → 成功，长度: {length}',
    llInsertAtSuccess: '在位置 {index} 插入 {value}',
    llLogReverseTooShort: 'reverse() → 链表长度 {length}，无需反转',
    llLogReverseDone: 'reverse() → 链表反转完成: [{data}]',
    llReversed: '链表已反转',
    llLogCycleEmpty: 'detectCycle() → 空链表，无环',
    llLogCycleDetected: 'detectCycle() → 检测到环！',
    llCycleDetected: '检测到环 (快慢指针相遇)',
    llLogNoCycle: 'detectCycle() → 无环',
    llNoCycle: '链表无环',
    treeLogInsert: 'insert({value}) → 插入成功，节点数: {count}',
    treeInsertSuccess: '插入节点 {value}',
    treeLogPreorder: '前序遍历: [{data}]',
    treeLogInorder: '中序遍历: [{data}]',
    treeLogPostorder: '后序遍历: [{data}]',
    treeLogLevelorder: '层序遍历: [{data}]',
    treeLogSearchFound: 'search({value}) → 找到，索引: {index}，深度: {depth}',
    treeLogSearchNotFound: 'search({value}) → 未找到',
    treeDeleteNotFound: '未找到节点 {value}',
    treeLogDeleteNotFound: 'delete({value}) → 未找到',
    treeLogDeleteSuccess: 'delete({value}) → 删除成功，节点数: {count}',
    treeDeleteSuccess: '删除节点 {value}',
    avlLogInsert: 'insert({value}) → 插入成功并重新平衡，节点数: {count}',
    avlInsertSuccess: '插入节点 {value}（已平衡）',
    avlInsertDuplicate: '节点 {value} 已存在，不重复插入',
    avlLogInsertDuplicate: 'insert({value}) → 值已存在，跳过',
    avlDeleteNotFound: '未找到节点 {value}',
    avlLogDeleteNotFound: 'delete({value}) → 未找到',
    avlLogDeleteSuccess: 'delete({value}) → 删除成功并重新平衡，节点数: {count}',
    avlDeleteSuccess: '删除节点 {value}（已平衡）',
    avlLogSearchFound: 'search({value}) → 找到，深度: {depth}',
    avlLogSearchNotFound: 'search({value}) → 未找到',
    avlLogPreorder: '前序遍历: [{data}]',
    avlLogInorder: '中序遍历（有序）: [{data}]',
    avlLogPostorder: '后序遍历: [{data}]',
    avlLogLevelorder: '层序遍历: [{data}]',
    redBlackTreeLogInsert: 'insert({value}) → 插入成功并修复红黑性质，节点数: {count}',
    redBlackTreeInsertSuccess: '插入节点 {value}（已平衡）',
    redBlackTreeInsertDuplicate: '节点 {value} 已存在，不重复插入',
    redBlackTreeLogInsertDuplicate: 'insert({value}) → 值已存在，跳过',
    redBlackTreeLogSearchFound: 'search({value}) → 找到，深度: {depth}',
    redBlackTreeLogSearchNotFound: 'search({value}) → 未找到',
    redBlackTreeLogInorder: '中序遍历（有序）: [{data}]',
    bTreeLogInsert: 'insert({value}) → 插入并按需分裂，节点数: {count}',
    bTreeInsertSuccess: '插入节点 {value}（已分裂平衡）',
    bTreeInsertDuplicate: '节点 {value} 已存在，不重复插入',
    bTreeLogInsertDuplicate: 'insert({value}) → 值已存在，跳过',
    bTreeLogSearchFound: 'search({value}) → 找到，深度: {depth}',
    bTreeLogSearchNotFound: 'search({value}) → 未找到',
    bTreeLogInorder: '中序遍历（有序）: [{data}]',
    segmentTreeBuildEmpty: '请先输入数组',
    segmentTreeLogBuild: 'build([{data}]) → 节点数: {count}',
    segmentTreeBuildSuccess: '构建线段树（{count} 个节点）',
    segmentTreeLogQuery: 'query({start}, {end}) → 区间和: {sum}',
    segmentTreeQueryInvalid: '请输入有效的区间',
    segmentTreeQuerySuccess: '区间 [{start}, {end}] 的和为 {sum}',
    segmentTreeUpdateOutOfRange: '下标超出范围',
    segmentTreeLogUpdate: 'update({index}, {value}) → 节点数: {count}',
    segmentTreeUpdateSuccess: '更新下标 {index} 为 {value}',
    graphLogAddNode: 'addNode("{id}") → 节点数: {count}',
    graphNodeAdded: '添加节点 {id}',
    graphSelfLoop: '不能连接自身',
    graphEdgeExists: '边已存在',
    graphLogAddEdge: 'addEdge({source}, {target}, {weight}) → 边数: {count}',
    graphEdgeAdded: '添加边 {source}↔{target}',
    graphNodeDeleted: '删除节点 {id}',
    graphEdgeDeleted: '删除边 {source}↔{target}',
    graphLogBfsStart: 'BFS 从节点 "{id}" 开始...',
    graphLogDfsStart: 'DFS 从节点 "{id}" 开始...',
    graphLogDijkstraStart: 'Dijkstra 最短路径: "{start}" → "{end}"',
    hashKeyInvalid: '键必须是 1~99 之间的整数',
    hashLogInsertUpdate: 'insert({key}, "{value}") → 更新，哈希: {hash}',
    hashKeyUpdated: '键 {key} 已更新',
    hashLogInsertSuccess: 'insert({key}, "{value}") → 成功，哈希: {hash}',
    hashInsertSuccess: '插入成功 (桶 {bucket})',
    hashKeyNotFound: '未找到键 {key}',
    hashLogDeleteNotFound: 'delete({key}) → 未找到',
    hashLogDeleteSuccess: 'delete({key}) → 成功，哈希: {hash}',
    hashDeleteSuccess: '已删除键 {key}',
    hashLogSearchFound: 'search({key}) → 找到 "{value}"，桶: {bucket}',
    hashLogSearchNotFound: 'search({key}) → 未找到',
    heapLogInsert: 'insert({value}) → 堆大小: {size}',
    heapInsertSuccess: '插入 {value}',
    heapEmpty: '堆为空',
    heapLogExtractEmpty: 'extractMax() → 堆为空',
    heapLogExtract: 'extractMax() → {value}，堆大小: {size}',
    heapExtractSuccess: '提取最大值: {value}',
    heapLogPeekEmpty: 'peek() → 堆为空',
    sortRandomData: '随机生成数据: [{data}]',
    sortUnknownAlgorithm: '未知算法: {key}',
    sortLogStart: '开始{name}...',
    sortLogStopped: '排序已停止',
    sortLogComplete: '{name}完成! 比较{comparisons}次 交换{swaps}次',
    sortComplete: '{name}完成 · 比较{comparisons}次 交换{swaps}次',
    trieInputRequired: '请输入有效的单词',
    trieLogInsertError: 'insert({word}) → 无效字符',
    trieLogInsert: 'insert("{word}") → 插入成功',
    trieInsertSuccess: '插入 "{word}"',
    trieDeleteNotFound: '未找到 "{word}"',
    trieLogDeleteNotFound: 'delete("{word}") → 未找到',
    trieLogDeleteSuccess: 'delete("{word}") → 删除成功',
    trieDeleteSuccess: '删除 "{word}"',
    trieLogSearchFound: 'search("{word}") → 找到 ✓',
    trieLogSearchNotFound: 'search("{word}") → 未找到',
    trieLogPrefixFound: 'startsWith("{prefix}") → 找到 {count} 个: [{words}]',
    trieLogPrefixNotFound: 'startsWith("{prefix}") → 无前缀匹配',
    skipListInputRequired: '请输入有效数值',
    skipListLogInsertError: '插入失败: {value}（无效或超出范围）',
    skipListLogInsert: 'insert({value}) → 随机层数，maxLevel={level}',
    skipListInsertSuccess: '已插入 {value}',
    skipListInsertDuplicate: '{value} 已存在，跳表不允许重复值',
    skipListLogInsertDuplicate: 'insert({value}) → 重复值，跳过',
    skipListDeleteNotFound: '未找到 {value}，无法删除',
    skipListLogDeleteNotFound: 'delete({value}) → 未找到',
    skipListLogDeleteSuccess: 'delete({value}) → 已删除',
    skipListDeleteSuccess: '已删除 {value}',
    skipListLogSearchFound: 'search({value}) → 找到 ✓',
    skipListLogSearchNotFound: 'search({value}) → 未找到',
    unionFindInputRequired: '请输入有效数值',
    unionFindLogInsertError: '插入失败: {value}（无效或超出范围）',
    unionFindLogInsert: 'insert({value}) → makeSet，parent=自身',
    unionFindInsertSuccess: '已插入 {value}',
    unionFindInsertDuplicate: '{value} 已存在，并查集不允许重复值',
    unionFindLogInsertDuplicate: 'insert({value}) → 重复值，跳过',
    unionFindDeleteNotFound: '未找到 {value}，无法删除',
    unionFindLogDeleteNotFound: 'delete({value}) → 未找到',
    unionFindLogDeleteSuccess: 'delete({value}) → 已删除',
    unionFindDeleteSuccess: '已删除 {value}',
    unionFindLogFind: 'find({value}) → root={root}（路径压缩）',
    unionFindLogFindNotFound: 'find({value}) → 未找到',
    unionFindNodeNotFound: '节点不存在',
    unionFindLogNodeNotFound: '操作失败: 节点不存在',
    unionFindAlreadyConnected: '{a} 与 {b} 已在同一集合',
    unionFindLogAlreadyConnected: 'union({a}, {b}) → 已连通，跳过',
    unionFindUnionSuccess: '已合并 {a} 与 {b}',
    unionFindLogUnion: 'union({a}, {b}) → 按秩合并',
    unionFindLogConnected: 'connected({a}, {b}) → 同集合 ✓',
    unionFindLogNotConnected: 'connected({a}, {b}) → 不同集合 ✗',
  },
  speedControl: {
    presetDefault: '标准',
    presetGentle: '柔和',
    presetSnappy: '快速',
    presetDramatic: '戏剧',
    presetInstant: '瞬时',
    animationError: '动画异常',
    renderSlow: '渲染较慢',
  },
  contentTier: {
    title: '知识分层',
    beginner: '初级',
    intermediate: '中级',
    advanced: '高级',
    conceptLabel: '基本概念',
    featuresLabel: '核心特点',
    complexityLabel: '复杂度分析',
    applicationsLabel: '应用场景',
    codeLabel: '代码示例',
    variantsLabel: '变体与优化',
    comparisonLabel: '对比分析',
    engineeringLabel: '工程实践',
    expand: '展开知识点',
    collapse: '收起知识点',
    array: {
      beginnerConcept: '数组是一种线性数据结构，在连续的内存空间中存储相同类型的元素。每个元素通过索引（下标）访问，索引从 0 开始。这是最基础也是最常用的数据结构。',
      beginnerFeatures: '随机访问 O(1)，通过索引直接定位；内存连续，缓存友好；静态数组长度固定，动态数组可变；支持正向和反向遍历。',
      intermediateComplexity: '访问 O(1)；头部插入/删除 O(n)（需移动元素）；尾部插入/删除均摊 O(1)；查找（无序）O(n)；查找（有序，二分查找）O(log n)。',
      intermediateApplications: '查找表与随机访问；缓冲区与数据缓存；动态规划的状态数组；哈希表开放寻址法的底层存储；矩阵运算。',
      intermediateCode: 'int arr[10]; arr[0] = 42;  // C 静态数组\nvector<int> v; v.push_back(1);  // C++ 动态数组\nint x = arr[i];  // O(1) 随机访问',
      advancedVariants: '动态数组（vector/ArrayList）自动扩容，通常 1.5x 或 2x 增长；环形数组实现循环队列；位图（Bitmap）用于高效集合操作；稀疏数组压缩存储。',
      advancedComparison: 'vs 链表：数组随机访问快 O(1) 但插入删除慢 O(n)，链表反之；数组内存连续缓存友好，链表指针跳跃缓存不友好；数组无额外指针开销，链表每个节点多一个指针。',
      advancedEngineering: '扩容策略影响性能，2x 增长均摊 O(1) 但可能浪费内存；vector 的 reserve() 预分配避免多次扩容；Java ArrayList 默认容量 10；Go slice 扩容策略在小数组时更激进。',
    },
    stack: {
      beginnerConcept: '栈是一种后进先出（LIFO）的线性数据结构。只能在一端（栈顶）进行插入（入栈 push）和删除（出栈 pop）操作，另一端（栈底）封闭。',
      beginnerFeatures: '后进先出 LIFO；只能在栈顶操作；入栈 push、出栈 pop、查看栈顶 peek 三大操作；是递归的天然模型。',
      intermediateComplexity: 'push/pop/peek 均为 O(1)；空间复杂度 O(n)；搜索需要逐个弹出，为 O(n)。',
      intermediateApplications: '函数调用栈管理；括号匹配检测；表达式求值（中缀转后缀）；浏览器后退按钮；编辑器撤销操作（Undo）；DFS 深度优先搜索。',
      intermediateCode: 'stack<int> s;\ns.push(1);       // 入栈\nint top = s.top(); // 查看栈顶\ns.pop();          // 出栈',
      advancedVariants: '链式栈（基于链表，无容量限制）；双栈实现队列（入队栈+出队栈，均摊 O(1)）；单调栈（维护单调性，解决"下一个更大元素"问题）；并行栈（无锁 CAS 实现）。',
      advancedComparison: 'vs 队列：栈 LIFO 适合回溯和递归，队列 FIFO 适合 BFS 和缓冲。vs 数组：栈是数组的受限版本，只暴露栈顶操作，更安全更抽象。',
      advancedEngineering: '函数调用栈溢出（Stack Overflow）需警惕递归深度；尾递归优化可避免栈增长；浏览器调用栈大小有限（Chrome 约 1 万-2 万帧）；协程使用堆模拟栈避免溢出。',
    },
    queue: {
      beginnerConcept: '队列是一种先进先出（FIFO）的线性数据结构。在一端（队尾 rear）插入元素（入队 enqueue），在另一端（队头 front）删除元素（出队 dequeue）。',
      beginnerFeatures: '先进先出 FIFO；队尾入队、队头出队；查看队头 front；体现公平性——先来的先服务。',
      intermediateComplexity: 'enqueue/dequeue/front 均为 O(1)；空间 O(n)；基于数组实现需循环利用空间避免假溢出。',
      intermediateApplications: 'BFS 广度优先搜索的核心结构；任务调度（先来先服务 FCFS）；消息队列与异步处理；打印队列；缓冲区管理。',
      intermediateCode: 'queue<int> q;\nq.push(1);         // 入队\nint front = q.front(); // 查看队头\nq.pop();            // 出队',
      advancedVariants: '循环队列（环形数组，避免假溢出）；双端队列 Deque（两端均可进出）；优先队列（堆实现，按优先级出队）；单调队列（滑动窗口最值）。',
      advancedComparison: 'vs 栈：队列 FIFO 适合 BFS，栈 LIFO 适合 DFS。循环队列 vs 链式队列：循环队列内存连续缓存友好但容量固定，链式队列无容量限制但有指针开销。',
      advancedEngineering: '生产者-消费者模型用阻塞队列实现解耦；消息中间件（Kafka/RabbitMQ）本质是分布式队列；循环队列需注意判空判满条件（用 size 字段区分 front==rear 的两种情况）。',
    },
    linkedlist: {
      beginnerConcept: '链表是一种线性数据结构，元素（节点 node）通过指针连接。每个节点包含数据域和指针域，指针指向下一个节点。内存不连续，动态分配。',
      beginnerFeatures: '动态大小，无需预分配容量；头插/尾插 O(1)；不支持随机访问，需从头遍历；每个节点有额外指针开销。',
      intermediateComplexity: '头插/尾插 O(1)；按索引访问 O(n)；按值查找 O(n)；删除已知节点 O(1)（双向链表）或 O(n)（单链表需找前驱）。',
      intermediateApplications: '实现栈和队列；哈希表的链地址法解决冲突；LRU 缓存（双向链表+哈希表）；多项式运算；内存管理空闲块链表。',
      intermediateCode: 'struct Node { int val; Node* next; };\nNode* head = new Node{1, nullptr};\nhead->next = new Node{2, nullptr};',
      advancedVariants: '单链表/双向链表/循环链表；跳表 SkipList（多层索引，O(log n) 查找）；惰性删除链表（标记删除，批量清理）；Unrolled 链表（每节点存多个元素，缓存友好）。',
      advancedComparison: 'vs 数组：链表插入删除快 O(1) 但访问慢 O(n)，数组反之；链表内存不连续缓存不友好，数组连续缓存友好；链表动态扩容无浪费，数组扩容有临时浪费。',
      advancedEngineering: 'LRU 缓存=双向链表+哈希表，Java LinkedHashMap 内置此实现；跳表是 Redis 有序集合的底层结构之一；Linux 内核大量使用链表（list_head 嵌入式结构）；链表反转是经典面试题。',
    },
    tree: {
      beginnerConcept: '树是一种层次结构的数据结构，由节点和边组成。有一个根节点（root），每个节点有零个或多个子节点。二叉树每个节点最多有两个子节点（左子树和右子树）。',
      beginnerFeatures: '层次结构，根节点唯一；无环连通图；二叉树有左右子树；四种遍历方式：前序、中序、后序（深度优先）和层序（广度优先）。',
      intermediateComplexity: '平衡 BST 查找/插入/删除 O(log n)；遍历 O(n)；最坏情况（退化为链表）O(n)；树的高度 h 决定操作效率。',
      intermediateApplications: '二叉搜索树 BST（高效查找与范围查询）；文件系统目录树；DOM 树；表达式树（编译器语法分析）；堆（优先队列的底层结构）。',
      intermediateCode: 'struct TreeNode {\n  int val;\n  TreeNode* left;\n  TreeNode* right;\n};\n// 前序遍历：根→左→右\nvoid preorder(TreeNode* n) {\n  if (!n) return;\n  visit(n);\n  preorder(n->left);\n  preorder(n->right);\n}',
      advancedVariants: 'AVL 树（严格平衡，高度差≤1）；红黑树（近似平衡，工程常用）；B 树/B+ 树（多路搜索，数据库索引）；Trie 字典树（字符串前缀检索）；线段树/树状数组（区间查询与更新）。',
      advancedComparison: 'BST vs 哈希表：BST 有序遍历 O(n) 且支持范围查询，哈希表查找 O(1) 但无序。AVL vs 红黑树：AVL 更严格平衡查找更快，红黑树插入删除旋转更少更适合写多场景。',
      advancedEngineering: '红黑树是 C++ std::map、Java TreeMap 的底层实现；B+ 树是 MySQL InnoDB 的索引结构；LSM Tree 是 LevelDB/RocksDB 的核心；递归是树操作的自然表达，但需注意栈深度。',
    },
    avlTree: {
      beginnerConcept: 'AVL 树是一种自平衡二叉搜索树，由 Adelson-Velsky 和 Landis 于 1962 年发明。它通过旋转操作保证任意节点的左右子树高度差不超过 1，从而确保查找、插入、删除操作始终为 O(log n)。',
      beginnerFeatures: '自平衡：插入/删除后自动旋转恢复平衡；平衡因子 BF = 左子树高度 - 右子树高度，取值 {-1, 0, 1}；四种旋转：LL 右旋、RR 左旋、LR 先左后右、RL 先右后左；节点存储 height 字段。',
      intermediateComplexity: '查找/插入/删除均为 O(log n)；树高度上界 h ≤ 1.44·log₂(n+2) - 0.328；插入最多 1 次旋转即可恢复平衡；删除最多 O(log n) 次旋转。',
      intermediateApplications: '数据库索引（读多写少场景）；内存中的有序映射；文件系统目录结构；游戏中的空间分区（AABB 树）；网络路由表。',
      intermediateCode: 'class AvlNode {\n  int val;\n  AvlNode *left, *right;\n  int height;\n};\n// 右旋（LL 型失衡）\nAvlNode* rotateRight(AvlNode *y) {\n  AvlNode *x = y->left;\n  y->left = x->right;\n  x->right = y;\n  updateHeight(y);\n  updateHeight(x);\n  return x;\n}',
      advancedVariants: '红黑树（近似平衡，旋转更少）；AA 树（只允许右子节点为红，实现更简单）；Splay 树（自调整，最近访问节点靠近根）；Treap（树+堆，随机化平衡）。',
      advancedComparison: 'AVL vs 红黑树：AVL 更严格平衡，查找更快（高度更小），但插入/删除旋转更多；红黑树旋转次数有上界（插入 2 次、删除 3 次），适合写多场景。AVL vs 普通 BST：AVL 保证 O(log n)，普通 BST 最坏退化为 O(n) 链表。',
      advancedEngineering: 'Linux 内核早期使用 AVL 树管理进程虚拟内存区域（后被红黑树替代）；C++ std::map 通常用红黑树而非 AVL（权衡旋转次数）；AVL 树适合查找密集型场景如只读数据库索引；实现时注意 height 字段的正确维护是平衡的关键。',
    },
  },
  globalSearch: {
    title: '全局搜索',
    placeholder: '搜索页面、算法、学习步骤...',
    inputAriaLabel: '搜索输入框',
    shortcut: 'Ctrl + K',
    noResults: '无搜索结果',
    noHistory: '无搜索历史',
    history: '搜索历史',
    clearHistory: '清空历史',
    removeHistory: '删除该历史记录',
    complexity: '复杂度',
    categoryPage: '页面',
    categoryLearning: '学习步骤',
    categoryHistory: '历史',
  },
  pwa: {
    updateAvailable: '有新版本可用',
    reload: '刷新',
    close: '关闭',
  },
  performance: {
    mode: '性能模式',
    hint: '大数据场景已跳过动画',
  },
}

export const en: Locale = {
  common: {
    delete: 'Delete',
    search: 'Search',
    reset: 'Reset',
    randomize: 'Randomize',
    run: 'Run',
    stop: 'Stop',
    undo: 'Undo',
    redo: 'Redo',
    clear: 'Clear',
    confirmClear: 'Are you sure you want to clear all data?',
    more: 'More',
    close: 'Close',
    running: 'Running',
    skipToContent: 'Skip to content',
  },
  array: {
    title: 'Array',
    subtitle: 'Linear Data Structure · Contiguous Memory · Random Access',
    search: 'Search',
    searchAll: 'Find All',
    binarySearch: 'Binary Search',
    insert: 'Insert',
    delete: 'Delete',
    indexPlaceholder: 'Index',
    valuePlaceholder: 'Value',
  },
  stack: {
    title: 'Stack',
    subtitle: 'Last In First Out (LIFO) · Function Calls · Parentheses Matching',
    push: 'Push',
    pop: 'Pop',
    peek: 'Peek',
  },
  queue: {
    title: 'Queue',
    subtitle: 'First In First Out (FIFO) · Buffer Queue · Breadth First',
    enqueue: 'Enqueue',
    dequeue: 'Dequeue',
    peek: 'Peek',
  },
  linkedlist: {
    title: 'Linked List',
    subtitle: 'Dynamic Memory · Efficient Insert · Sequential Traversal',
    pushFront: 'Push Front',
    pushBack: 'Push Back',
    reverse: 'Reverse',
    find: 'Find',
    insertAt: 'Insert At',
    detectCycle: 'Detect Cycle',
    headLabel: 'HEAD',
    nullLabel: 'NULL',
    doublyTitle: 'Doubly Linked List',
    doublySubtitle: 'Bidirectional Pointers · O(1) Delete · Forward/Backward Traversal',
    switchToDoubly: 'Switch to Doubly',
    switchToSingle: 'Switch to Single',
  },
  tree: {
    title: 'Binary Tree',
    subtitle: 'Hierarchical Structure · Recursive Traversal · Binary Search',
    insert: 'Insert',
    search: 'Search',
    preorder: 'Preorder',
    inorder: 'Inorder',
    postorder: 'Postorder',
    levelorder: 'Level Order',
    edgeStyle: 'Edge Style',
    animationStarting: 'Animation starting',
  },
  avlTree: {
    title: 'AVL Tree',
    subtitle: 'Self-balancing BST · Rotations · O(log n) Guaranteed',
    insert: 'Insert',
    search: 'Search',
    preorder: 'Preorder',
    inorder: 'Inorder',
    postorder: 'Postorder',
    levelorder: 'Level Order',
    nodeTitle: 'Value: {value}\nHeight: {height}\nBalance Factor: {balanceFactor}',
  },
  redBlackTree: {
    title: 'Red-Black Tree',
    subtitle: 'Self-balancing BST · Red-Black Properties · O(log n) Guaranteed',
    insert: 'Insert',
    search: 'Search',
    inorder: 'Inorder',
    inputPlaceholder: 'Enter 1-99',
    nodeTitle: 'Value: {value}, Color: {color}',
    colorRed: 'Red',
    colorBlack: 'Black',
  },
  bTree: {
    title: 'B-Tree',
    subtitle: 'Multi-way Search Tree · Node Splitting · O(log n) Guaranteed',
    insert: 'Insert',
    search: 'Search',
    inorder: 'Inorder',
    nodeTitle: 'keys: {keys}\nkey count: {count}\ntype: {type}',
    leaf: 'Leaf node',
    internal: 'Internal node',
  },
  segmentTree: {
    title: 'Segment Tree',
    subtitle: 'Range Query · Point Update · O(log n)',
    build: 'Build',
    query: 'Query',
    update: 'Update',
    rangeStart: 'Range Start',
    rangeEnd: 'Range End',
    index: 'Index',
    value: 'Value',
    buildPlaceholder: 'Array (e.g. 1,2,3,4)',
    buildEmpty: 'Please enter an array',
    buildInvalid: 'Invalid array format (1-50 integers)',
    queryInvalid: 'Please enter a valid range',
    queryOutOfRange: 'Range out of bounds',
    updateInvalid: 'Please enter a valid index and value',
    updateOutOfRange: 'Index out of bounds',
    nodeTitle: 'Range: {range}\nSum: {sum}\nType: {type}',
    leaf: 'Leaf node',
    internal: 'Internal node',
    arrayLabel: 'Array',
  },
  graph: {
    title: 'Graph',
    subtitle: 'Network Structure · Traversal Algorithms · Shortest Path',
    inputPlaceholder: 'Node Name',
    addNode: 'Add Node',
    removeNode: 'Remove Node',
    addEdge: 'Add Edge',
    removeEdge: 'Remove Edge',
    bfs: 'BFS',
    dfs: 'DFS',
    dijkstra: 'Dijkstra',
    source: 'Source',
    target: 'Target',
    weight: 'Weight',
    adjacencyMatrix: 'Adjacency Matrix',
    adjacencyList: 'Adjacency List',
    nodes: 'Nodes',
    edges: 'Edges',
    degree: 'Degree',
    density: 'Density',
    noNeighbors: 'No neighbors',
    legendEdge: 'Edge',
    legendNoEdge: 'No edge',
    legendSelfLoop: 'Self-loop',
  },
  hash: {
    title: 'Hash Table',
    subtitle: 'Key-Value Mapping · Collision Resolution · Average O(1)',
    keyPlaceholder: 'Key',
    valuePlaceholder: 'Value (1-99)',
    insert: 'Insert',
    remove: 'Remove',
    search: 'Search',
  },
  heap: {
    title: 'Heap',
    subtitle: 'Complete Binary Tree · Max Heap · Priority Queue',
    inputPlaceholder: 'Value (1-99)',
    insert: 'Insert',
    extractMax: 'Extract Max',
    peek: 'Peek',
  },
  trie: {
    title: 'Trie',
    subtitle: 'Prefix Tree · Efficient String Retrieval',
    inputPlaceholder: 'Word',
    insert: 'Insert',
    delete: 'Delete',
    search: 'Search',
    prefixSearch: 'Prefix Match',
    rootLabel: 'root',
  },
  skipList: {
    title: 'SkipList',
    subtitle: 'Probabilistic Balance · Multi-level List · O(log n) Search',
    inputPlaceholder: 'Value (1-99)',
    insert: 'Insert',
    delete: 'Delete',
    search: 'Search',
    headLabel: 'H',
  },
  unionFind: {
    title: 'Union-Find',
    subtitle: 'Path Compression · Union by Rank · Near O(1) Operations',
    inputPlaceholder: 'Value A (1-99)',
    inputPlaceholderB: 'Value B (1-99)',
    insert: 'Insert',
    remove: 'Delete',
    find: 'Find Root',
    union: 'Union',
    connected: 'Connected',
  },
  sort: {
    title: 'Sorting',
    subtitle: 'Algorithm Visualization · Time Complexity Comparison',
    randomize: 'Randomize',
    stop: 'Stop',
    compare: 'Compare',
    swap: 'Swap',
    steps: 'Steps',
    legend: 'Legend',
    axisX: 'Index',
    axisY: 'Value',
    selectAlgorithm: 'Select Algorithm',
    bubble: 'Bubble Sort',
    radix: 'Radix Sort',
    bucket: 'Bucket Sort',
    quick: 'Quick Sort',
    merge: 'Merge Sort',
    heapSort: 'Heap Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
    shell: 'Shell Sort',
    comb: 'Comb Sort',
    tim: 'TimSort',
    counting: 'Counting Sort',
  },
  compare: {
    title: 'Algorithm Compare',
    subtitle: 'Parallel Execution · Performance Comparison · Visualization',
    runAll: 'Run All',
    stop: 'Stop',
    randomize: 'Randomize',
    reset: 'Reset',
    exportCSV: 'Export CSV',
    exportJSON: 'Export JSON',
    exportResults: 'Export Results',
  },
  graphAlgorithm: {
    title: 'Graph Algorithm Visualization',
    subtitle: 'BFS / DFS / Dijkstra / Topological Sort / Bellman-Ford / Floyd-Warshall / Prim / Kruskal',
    algorithm: 'Algorithm',
    startNode: 'Start Node',
    complexityCompare: 'Complexity Comparison',
  },
  sidebar: {
    title: 'Data Structure Learner',
    themeTooltip: 'Theme',
    themeModeTooltip: 'Light/Dark Theme',
    langTooltip: 'Language',
    openMenu: 'Open navigation menu',
    collapseMenu: 'Collapse navigation menu',
    home: 'Home',
    array: 'Array',
    stack: 'Stack',
    queue: 'Queue',
    linkedlist: 'Linked List',
    tree: 'Binary Tree',
    avlTree: 'AVL Tree',
    redBlackTree: 'Red-Black Tree',
    bTree: 'B-Tree',
    segmentTree: 'Segment Tree',
    graph: 'Graph',
    sort: 'Sorting',
    hash: 'Hash Table',
    heap: 'Heap',
    trie: 'Trie',
    skipList: 'SkipList',
    compare: 'Compare',
    graphAlgorithm: 'Graph Algo',
    unionFind: 'Union-Find',
    themeDefault: 'Default',
    themeForest: 'Forest',
    themeWarm: 'Warm',
    themeRoyal: 'Royal',
  },
  home: {
    badge: 'Data Structures Visualized',
    title: 'Data Structure Learner',
    heroDescription: 'Learn 12 core data structures through interactive visualization animations. Neo-Brutalist style · Engineering blueprint feel · Real-time animation feedback.',
    tagline: 'Interactive Data Structure Visualizer',
    selectStructure: 'Select a data structure to explore',
    enterModule: 'Enter Module',
    modules: 'MODULES',
  },
  settings: {
    animationSpeed: 'Animation Speed',
  },
  toast: {
    dismissLabel: 'Dismiss notification',
    reset: 'Reset',
    randomized: 'New data generated',
    undo: 'Undone',
    redo: 'Redone',
    dataImported: 'Data imported',
    persistenceCleared: 'Persisted data cleared',
  },
  emptyState: {
    emptyStackShort: 'Empty Stack',
    emptyQueueShort: 'Empty Queue',
    emptyLinkedListShort: 'Empty Linked List',
    emptyTreeShort: 'Empty Tree',
    emptyAvlShort: 'Empty AVL Tree · Insert nodes',
    emptyRedBlackTreeShort: 'Empty Red-Black Tree · Insert nodes',
    emptyBTreeShort: 'Empty B-Tree · Insert nodes',
    emptyGraphShort: 'Empty Graph · Add nodes',
    emptyHashShort: 'Empty Hash · Insert key-value pairs',
    emptyHeapShort: 'Empty Heap · Insert elements',
    emptyTrieShort: 'Empty Trie · Insert words',
    emptySkipListShort: 'Empty SkipList · Insert elements',
    emptyUnionFindShort: 'Empty Union-Find · Insert elements',
    nodeNotFound: 'Target node not found',
    emptyArray: 'Array is empty',
    emptyArrayDesc: 'Click below to generate random data or insert elements manually',
    emptyStack: 'Stack is empty',
    emptyStackDesc: 'Click Push to add elements',
    emptyQueue: 'Queue is empty',
    emptyQueueDesc: 'Click Enqueue to add elements',
    emptyLinkedList: 'Linked list is empty',
    emptyLinkedListDesc: 'Click head/tail insert to add nodes',
    emptyTree: 'Binary tree is empty',
    emptyTreeDesc: 'Click insert to add nodes',
    emptyAvl: 'AVL tree is empty',
    emptyAvlDesc: 'Click insert to add nodes',
    emptyRedBlackTree: 'Red-Black tree is empty',
    emptyRedBlackTreeDesc: 'Click insert to add nodes',
    emptyBTree: 'B-Tree is empty',
    emptyBTreeDesc: 'Click insert to add nodes',
    emptySegmentTree: 'Segment Tree is empty',
    emptySegmentTreeShort: 'Empty Segment Tree · Please build',
    emptySegmentTreeDesc: 'Enter an array and click build to create the segment tree',
    emptyGraph: 'Graph is empty',
    emptyGraphDesc: 'Click add node to create the graph',
    emptyHash: 'Hash table is empty',
    emptyHashDesc: 'Click insert to add key-value pairs',
    emptyHeap: 'Heap is empty',
    emptyHeapDesc: 'Click insert to add elements',
    emptyTrie: 'Trie is empty',
    emptyTrieDesc: 'Click insert to add words',
    emptySkipList: 'SkipList is empty',
    emptySkipListDesc: 'Click insert to add elements',
    emptyUnionFind: 'Union-Find is empty',
    emptyUnionFindDesc: 'Click insert to add elements',
    emptySort: 'Sort data is empty',
    emptySortDesc: 'Click randomize to generate sort data',
    defaultTitle: 'No data',
    defaultDesc: 'Click below to fill data',
    fill: 'Fill data',
  },
  exportImport: {
    export: 'Export',
    import: 'Import',
    importFailed: 'Import failed',
    invalidFile: 'Invalid File',
    exportTooltip: 'Export data as JSON file',
    importTooltip: 'Import data from JSON file',
  },
  visualizer: {
    hideGrid: 'Hide grid',
    showGrid: 'Show grid',
    footer: 'REACT + D3.JS + TAILWIND CSS · NEO-BRUTALIST DESIGN · 2026',
    queueFront: '↑ Front',
    queueRear: '↑ Rear',
    stackTop: 'Top',
    stackBottom: 'Bottom',
    empty: 'Data structure visualization',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    arrayLabel: 'Array visualization',
    stackLabel: 'Stack visualization',
    queueLabel: 'Queue visualization',
    linkedlistLabel: 'Linked list visualization',
    treeLabel: 'Binary tree visualization',
    avlTreeLabel: 'AVL tree visualization',
    redBlackTreeLabel: 'Red-Black tree visualization',
    bTreeLabel: 'B-Tree visualization',
    segmentTreeLabel: 'Segment Tree visualization',
    graphLabel: 'Graph visualization',
    sortLabel: 'Sorting visualization',
    hashLabel: 'Hash table visualization',
    heapLabel: 'Heap visualization',
    trieLabel: 'Trie visualization',
    skipListLabel: 'SkipList visualization',
    unionFindLabel: 'Union-Find visualization',
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    close: 'Press Esc or click outside to close',
    undo: 'Undo last action',
    redo: 'Redo undone action',
    reset: 'Reset data structure',
    pause: 'Pause animation',
    toggleHelp: 'Show/hide shortcut help',
    searchPlaceholder: 'Search shortcuts...',
    searchNoResults: 'No matching shortcuts',
    allShortcuts: 'All shortcuts',
  },
  page: {
    operations: 'Operations',
    expand: 'Expand',
    collapse: 'Collapse',
    selected: 'selected',
    running: 'Running...',
    done: 'All Done',
    comparing: 'Starting parallel comparison',
    compareDone: 'Comparison complete',
    algorithms: 'algorithms',
    stopped: 'Sorting stopped',
    animating: 'Animation in progress, please wait',
    disabled: 'Disabled',
  },
  performanceChart: {
    title: 'Performance Comparison',
    comparisons: 'Comparisons',
    swaps: 'Swaps',
    steps: 'Steps',
  },
  complexityChart: {
    title: 'Complexity Comparison',
    legend: 'Legend',
    algorithm: 'Algorithm',
    timeComplexity: 'Time',
    spaceComplexity: 'Space',
    description: 'Description',
    empty: 'No algorithm data',
  },
  performanceMonitor: {
    show: 'Show performance monitor',
    toggle: 'Toggle performance details',
    jsHeap: 'JS Heap',
    total: 'Total',
    limit: 'Limit',
    status: 'Status',
    smooth: 'Smooth',
    fair: 'Fair',
    low: 'Low',
  },
  timeline: {
    title: 'Operation History',
    noHistory: 'No operation history',
  },
  logPanel: {
    title: 'Operation Log',
    noLogs: 'No logs yet',
    autoScroll: 'AUTO↓',
    freeze: 'FREEZE',
    viewCode: 'View Code',
    type: {
      oper: 'Oper',
      info: 'Info',
      error: 'Error',
      code: 'Code',
    },
  },
  stepExplainer: {
    prev: 'Prev',
    reset: 'Reset',
    next: 'Next',
    selectAlgorithm: 'Select an algorithm to start learning',
    step: 'Step',
    autoPlay: 'Auto Play',
    pause: 'Pause',
    speed: 'Speed',
  },
  infoPanel: {
    tabLog: 'Logs',
    tabLearning: 'Learn',
    logEmpty: 'No operations yet',
    logCount: 'logs',
    learningEmpty: 'No learning content for this structure',
    closeDrawer: 'Collapse panel',
    openDrawer: 'Expand panel',
    recent: 'Recent',
    tabs: 'Info panel tabs',
    stepBadge: 'Step matches',
  },
  quiz: {
    title: 'Quiz',
    question: 'Question',
    of: '/',
    submit: 'Submit',
    correct: 'Correct',
    incorrect: 'Incorrect',
    explanation: 'Explanation',
    next: 'Next',
    prev: 'Previous',
    score: 'Score',
    correctCount: 'Correct',
    reset: 'Restart',
    complete: 'Quiz Complete',
    noQuestions: 'No quiz questions',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
  },
  errorBoundary: {
    title: 'Component Error',
    retry: 'Retry',
    renderFailed: 'Visualizer component render failed',
    stackDetails: 'Stack Details (Dev Mode)',
  },
  share: {
    label: 'Share',
    generateFailed: 'Failed to generate link',
    copied: 'Link copied to clipboard',
    copyManually: 'Please copy the link manually',
    generateLink: 'Generate share link',
    linkCopied: 'Link copied',
    decodeFailed: 'Invalid share link data',
    invalidData: 'Share data format mismatch',
    loaded: 'Shared data loaded',
  },
  network: {
    offline: 'Network disconnected',
    offlineMode: 'Offline mode',
    reconnected: 'Network restored',
  },
  learning: {
    open: '◇ Learning Mode',
    close: '◇ Close Learning Mode',
    title: 'Learning Mode',
  },
  advancedLearning: {
    complexityAnalysis: {
      title: 'Algorithm Complexity Analysis',
      timeComplexity: 'Time Complexity',
      spaceComplexity: 'Space Complexity',
      bigONotation: 'Big O Notation',
      bestCase: 'Best Case',
      worstCase: 'Worst Case',
      averageCase: 'Average Case',
      amortizedAnalysis: 'Amortized Analysis',
    },
    advancedDataStructures: {
      title: 'Advanced Data Structure Applications',
      redBlackTree: 'Red-Black Tree',
      bTree: 'B-Tree',
      skipList: 'Skip List',
      bloomFilter: 'Bloom Filter',
      unionFind: 'Union-Find',
    },
    realWorldApplications: {
      title: 'Real-World Applications',
      browserHistory: 'Browser History',
      taskQueue: 'Task Queue',
      fileSystem: 'File System',
      socialNetwork: 'Social Network',
      searchEngine: 'Search Engine',
      cache: 'Cache',
    },
  },
  learningPath: {
    title: 'Learning Path',
    progress: 'Progress',
    reset: 'Reset Progress',
    completed: 'Completed',
    locked: 'Locked',
    startLearning: 'Start Learning',
    continueLearning: 'Continue Learning',
    allCompleted: 'Congratulations! All completed',
    overviewTitle: 'Progress Overview',
    overallCompletionRate: 'Overall Completion',
    completedModules: 'Completed',
    inProgressModules: 'In Progress',
    notStartedModules: 'Not Started',
    totalModules: 'Total Modules',
    learningGoal: 'Learning Goal',
    targetSteps: 'Target Steps',
    targetStepsHint: 'Please enter target steps between 1~{max}',
    targetDate: 'Target Date',
    setGoal: 'Set Goal',
    clearGoal: 'Clear Goal',
    goalProgress: 'Goal Progress',
    goalSetSuccess: 'Goal set successfully',
    goalSetFailed: 'Failed to set goal',
    category: {
      linear: 'Linear',
      tree: 'Tree',
      hash: 'Hash',
      graph: 'Graph',
      sort: 'Sorting',
    },
    difficulty: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
    },
    desc: {
      array: 'Contiguous storage, O(1) random access, foundation of all data structures',
      stack: 'LIFO, core of function calls and expression evaluation',
      queue: 'FIFO, foundation of BFS traversal and task scheduling',
      linkedlist: 'Dynamic insert/delete, first step to understanding pointers',
      tree: 'Hierarchical structure, BST is the cornerstone of efficient search',
      avlTree: 'Self-balancing BST, guarantees O(log n) operations via rotations',
      heap: 'Priority queue, essential for heap sort and Top-K problems',
      trie: 'Prefix tree, essential for autocomplete and string search',
      hash: 'O(1) lookup, understand hash functions and collision handling',
      graph: 'Relationship modeling, core of shortest path and topological sort',
      sort: 'Algorithm cornerstone, essential for understanding time/space complexity',
    },
    sync: {
      synced: 'Progress synced',
      failed: 'Progress sync failed',
    },
  },
  recommendations: {
    title: 'Learning Recommendations',
    recommendedModules: 'Recommended Modules',
    reasonLabel: 'Reason',
    personalizedAdvice: 'Personalized Advice',
    difficulty: 'Difficulty',
    startLearning: 'Start Learning',
    continueLearning: 'Continue',
    review: 'Review',
    noRecommendations: 'No recommendations yet, keep exploring!',
    reason: {
      startHere: 'Start here, beginner-friendly',
      unlockedNotStarted: 'Unlocked, prerequisites completed',
      continueLearning: 'Continue learning, already started',
      review: 'Review and reinforce',
    },
    advice: {
      welcome: 'Welcome! Start with the basics and progress step by step.',
      allCompleted: 'Congratulations! You have completed all modules. Try advanced challenges!',
      stalled: 'No new modules completed in {days} days. Consider reviewing or restarting from basics.',
      justStarted: 'You have started your learning journey, keep going! Complete your first module to unlock more.',
      fastPace: 'Fast pace! {completed} modules in {days} days. Try higher difficulty challenges.',
      slowPace: 'Slow pace, {completed} modules in {days} days. Take your time and consolidate fundamentals.',
      normalPace: 'Steady pace, {completed} modules in {days} days. Keep it up!',
    },
  },
  undoPreview: {
    noData: 'No data',
    emptyArray: 'Empty array',
    emptyObject: 'Empty object',
    defaultLabel: 'State after undo',
  },
  errors: {
    invalidIndex: 'Index must be a valid number',
    indexOutOfRange: 'Index must be between {range}',
    animationError: '{action} animation error',
    animationTimeout: 'Animation timed out, automatically recovered',
    importFailed: 'Import failed',
    inputRequired: 'Please enter {item}',
    stopped: 'Stopped',
    prefixMatch: 'Prefix match',
    noPrefixMatch: 'No prefix match results',
    tooShortToReverse: 'List too short, no need to reverse',
    enterWord: 'Please enter a word',
    enterDeleteWord: 'Please enter the word to delete',
    enterSearchWord: 'Please enter the word to search',
    enterPrefix: 'Please enter a prefix',
    graphRunError: 'Runtime error',
    graphResetDone: 'Reset done',
    exitLearning: 'Exit Learning',
    learningMode: 'Learning Mode',
    compareStopped: 'Comparison stopped',
    invalidRange: 'Please enter an integer between {min}~{max}',
    trieLettersOnly: 'Words can only contain letters (a-z)',
  },
  graphView: {
    force: 'Force',
    matrix: 'Matrix',
    list: 'Adj. List',
  },
  sortLegend: {
    unsorted: 'Unsorted',
    comparing: 'Comparing',
    swapping: 'Swapping',
    sorted: 'Sorted',
  },
  nodeLegend: {
    node: 'Node',
    root: 'Root',
    leaf: 'Leaf',
    active: 'Active',
    visited: 'Visited',
    head: 'Head',
    tail: 'Tail',
    top: 'Top',
    endOfWord: 'End of Word',
    redNode: 'Red Node',
    blackNode: 'Black Node',
  },
  hooks: {
    inputInvalid: 'Please enter an integer between 1-99',
    dataImported: 'Data imported',
    randomArray: 'Random array generated',
    arrayFull: 'Array cannot exceed {max} elements',
    arrayLogFull: 'Array full',
    arrayLogInsertError: 'Invalid input: {value}',
    arrayLogInsertSuccess: 'insert({value}, {index}) success, length: {length}',
    arrayInsertSuccess: 'Inserted {value} at position {index}',
    arrayLogDeleteError: 'delete({index}) index out of bounds',
    arrayLogDeleteSuccess: 'delete({index}) deleted value: {value}, length: {length}',
    arrayDeleteSuccess: 'Deleted element {value} at position {index}',
    arrayLogSearchFound: 'search({value}) found, index: {index}',
    arraySearchFound: 'Found {value} at position {index}',
    arrayLogSearchNotFound: 'search({value}) not found',
    arraySearchNotFound: '{value} not found',
    arrayLogSearchAllFound: 'searchAll({value}) found {count}, indices: {indices}',
    arraySearchAllFound: 'Found {count} of {value}, at positions: {indices}',
    arrayLogSearchAllNotFound: 'searchAll({value}) not found',
    arraySearchAllNotFound: '{value} not found',
    arrayLogBinarySearchFound: 'binarySearch({value}) found, index: {index}',
    arrayBinarySearchFound: 'Binary search: {value} at position {index}',
    arrayLogBinarySearchNotFound: 'binarySearch({value}) not found',
    arrayBinarySearchNotFound: 'Binary search: {value} not found',
    arrayBinarySearchUnsorted: 'Array is not sorted; binary search requires a sorted array',
    arrayLogBinarySearchUnsorted: 'binarySearch failed: array not sorted',
    arrayLogRandom: 'Random array: [{data}]',
    stackFull: 'Stack full (max {max})',
    stackLogPush: 'push({value}) → top: {top}, size: {size}',
    stackPushSuccess: 'Pushed {value}',
    stackEmpty: 'Stack is empty, cannot pop',
    stackLogPop: 'pop() → returned: {value}, size: {size}',
    stackPopSuccess: 'Popped {value}',
    stackLogPeek: 'peek() → top: {value}',
    stackPeek: 'Top: {value}',
    stackLogClear: 'clear() → stack cleared',
    stackCleared: 'Stack cleared',
    queueFull: 'Queue full (max {max})',
    queueLogEnqueue: 'enqueue({value}) → tail: {tail}, size: {size}',
    queueEnqueueSuccess: 'Enqueued {value}',
    queueEmpty: 'Queue is empty, cannot dequeue',
    queueLogDequeue: 'dequeue() → returned: {value}, size: {size}',
    queueDequeueSuccess: 'Dequeued {value}',
    queueLogFront: 'front() → front: {value}',
    queueFront: 'Front: {value}',
    queueLogClear: 'clear() → queue cleared',
    queueCleared: 'Queue cleared',
    llLogInsertHead: 'insertHead({value}) → new head: {head}, length: {length}',
    llInsertHeadSuccess: 'Inserted {value} at head',
    llLogInsertTail: 'insertTail({value}) → new tail: {tail}, length: {length}',
    llInsertTailSuccess: 'Inserted {value} at tail',
    llLogDeleteError: 'delete({index}) index out of bounds',
    llLogDelete: 'delete({index}) → deleted value: {value}, length: {length}',
    llDeleteSuccess: 'Deleted node {value} at position {index}',
    llLogSearchFound: 'search({value}) → found, position: {index}',
    llSearchFound: 'Found {value} at position {index}',
    llLogSearchNotFound: 'search({value}) → not found',
    llSearchNotFound: '{value} not found',
    llLogInsertAtError: 'insertAt({index}, {value}) index out of bounds',
    llLogInsertAt: 'insertAt({index}, {value}) → success, length: {length}',
    llInsertAtSuccess: 'Inserted {value} at position {index}',
    llLogReverseTooShort: 'reverse() → length {length}, too short to reverse',
    llLogReverseDone: 'reverse() → reversed: [{data}]',
    llReversed: 'Linked list reversed',
    llLogCycleEmpty: 'detectCycle() → empty list, no cycle',
    llLogCycleDetected: 'detectCycle() → cycle detected!',
    llCycleDetected: 'Cycle detected (slow & fast pointers met)',
    llLogNoCycle: 'detectCycle() → no cycle',
    llNoCycle: 'No cycle in linked list',
    treeLogInsert: 'insert({value}) → success, nodes: {count}',
    treeInsertSuccess: 'Inserted node {value}',
    treeLogPreorder: 'Preorder: [{data}]',
    treeLogInorder: 'Inorder: [{data}]',
    treeLogPostorder: 'Postorder: [{data}]',
    treeLogLevelorder: 'Level order: [{data}]',
    treeLogSearchFound: 'search({value}) → found, index: {index}, depth: {depth}',
    treeLogSearchNotFound: 'search({value}) → not found',
    treeDeleteNotFound: 'Node {value} not found',
    treeLogDeleteNotFound: 'delete({value}) → not found',
    treeLogDeleteSuccess: 'delete({value}) → deleted, nodes: {count}',
    treeDeleteSuccess: 'Deleted node {value}',
    avlLogInsert: 'insert({value}) → inserted and rebalanced, nodes: {count}',
    avlInsertSuccess: 'Inserted node {value} (balanced)',
    avlInsertDuplicate: 'Node {value} already exists, skipping',
    avlLogInsertDuplicate: 'insert({value}) → duplicate, skipped',
    avlDeleteNotFound: 'Node {value} not found',
    avlLogDeleteNotFound: 'delete({value}) → not found',
    avlLogDeleteSuccess: 'delete({value}) → deleted and rebalanced, nodes: {count}',
    avlDeleteSuccess: 'Deleted node {value} (balanced)',
    avlLogSearchFound: 'search({value}) → found, depth: {depth}',
    avlLogSearchNotFound: 'search({value}) → not found',
    avlLogPreorder: 'Preorder: [{data}]',
    avlLogInorder: 'Inorder (sorted): [{data}]',
    avlLogPostorder: 'Postorder: [{data}]',
    avlLogLevelorder: 'Level order: [{data}]',
    redBlackTreeLogInsert: 'insert({value}) → inserted and fixup applied, nodes: {count}',
    redBlackTreeInsertSuccess: 'Inserted node {value} (balanced)',
    redBlackTreeInsertDuplicate: 'Node {value} already exists, skipping',
    redBlackTreeLogInsertDuplicate: 'insert({value}) → duplicate, skipped',
    redBlackTreeLogSearchFound: 'search({value}) → found, depth: {depth}',
    redBlackTreeLogSearchNotFound: 'search({value}) → not found',
    redBlackTreeLogInorder: 'Inorder (sorted): [{data}]',
    bTreeLogInsert: 'insert({value}) → inserted and split if needed, nodes: {count}',
    bTreeInsertSuccess: 'Inserted node {value} (split balanced)',
    bTreeInsertDuplicate: 'Node {value} already exists, skipping',
    bTreeLogInsertDuplicate: 'insert({value}) → duplicate, skipped',
    bTreeLogSearchFound: 'search({value}) → found, depth: {depth}',
    bTreeLogSearchNotFound: 'search({value}) → not found',
    bTreeLogInorder: 'Inorder (sorted): [{data}]',
    segmentTreeBuildEmpty: 'Please enter an array first',
    segmentTreeLogBuild: 'build([{data}]) → nodes: {count}',
    segmentTreeBuildSuccess: 'Built segment tree ({count} nodes)',
    segmentTreeLogQuery: 'query({start}, {end}) → sum: {sum}',
    segmentTreeQueryInvalid: 'Please enter a valid range',
    segmentTreeQuerySuccess: 'Sum of range [{start}, {end}] is {sum}',
    segmentTreeUpdateOutOfRange: 'Index out of bounds',
    segmentTreeLogUpdate: 'update({index}, {value}) → nodes: {count}',
    segmentTreeUpdateSuccess: 'Updated index {index} to {value}',
    graphLogAddNode: 'addNode("{id}") → nodes: {count}',
    graphNodeAdded: 'Added node {id}',
    graphSelfLoop: 'Cannot connect to self',
    graphEdgeExists: 'Edge already exists',
    graphLogAddEdge: 'addEdge({source}, {target}, {weight}) → edges: {count}',
    graphEdgeAdded: 'Added edge {source}↔{target}',
    graphNodeDeleted: 'Deleted node {id}',
    graphEdgeDeleted: 'Deleted edge {source}↔{target}',
    graphLogBfsStart: 'BFS from node "{id}"...',
    graphLogDfsStart: 'DFS from node "{id}"...',
    graphLogDijkstraStart: 'Dijkstra shortest path: "{start}" → "{end}"',
    hashKeyInvalid: 'Key must be an integer between 1-99',
    hashLogInsertUpdate: 'insert({key}, "{value}") → updated, hash: {hash}',
    hashKeyUpdated: 'Key {key} updated',
    hashLogInsertSuccess: 'insert({key}, "{value}") → success, hash: {hash}',
    hashInsertSuccess: 'Inserted (bucket {bucket})',
    hashKeyNotFound: 'Key {key} not found',
    hashLogDeleteNotFound: 'delete({key}) → not found',
    hashLogDeleteSuccess: 'delete({key}) → deleted, hash: {hash}',
    hashDeleteSuccess: 'Deleted key {key}',
    hashLogSearchFound: 'search({key}) → found "{value}", bucket: {bucket}',
    hashLogSearchNotFound: 'search({key}) → not found',
    heapLogInsert: 'insert({value}) → heap size: {size}',
    heapInsertSuccess: 'Inserted {value}',
    heapEmpty: 'Heap is empty',
    heapLogExtractEmpty: 'extractMax() → heap empty',
    heapLogExtract: 'extractMax() → {value}, heap size: {size}',
    heapExtractSuccess: 'Extracted max: {value}',
    heapLogPeekEmpty: 'peek() → heap empty',
    sortRandomData: 'Random data: [{data}]',
    sortUnknownAlgorithm: 'Unknown algorithm: {key}',
    sortLogStart: 'Starting {name}...',
    sortLogStopped: 'Sorting stopped',
    sortLogComplete: '{name} done! {comparisons} comparisons, {swaps} swaps',
    sortComplete: '{name} done · {comparisons} comparisons, {swaps} swaps',
    trieInputRequired: 'Please enter a valid word',
    trieLogInsertError: 'insert({word}) → invalid characters',
    trieLogInsert: 'insert("{word}") → inserted',
    trieInsertSuccess: 'Inserted "{word}"',
    trieDeleteNotFound: '"{word}" not found',
    trieLogDeleteNotFound: 'delete("{word}") → not found',
    trieLogDeleteSuccess: 'delete("{word}") → deleted',
    trieDeleteSuccess: 'Deleted "{word}"',
    trieLogSearchFound: 'search("{word}") → found ✓',
    trieLogSearchNotFound: 'search("{word}") → not found',
    trieLogPrefixFound: 'startsWith("{prefix}") → found {count}: [{words}]',
    trieLogPrefixNotFound: 'startsWith("{prefix}") → no prefix match',
    skipListInputRequired: 'Please enter a valid number',
    skipListLogInsertError: 'Insert failed: {value} (invalid or out of range)',
    skipListLogInsert: 'insert({value}) → random level, maxLevel={level}',
    skipListInsertSuccess: 'Inserted {value}',
    skipListInsertDuplicate: '{value} already exists, SkipList does not allow duplicates',
    skipListLogInsertDuplicate: 'insert({value}) → duplicate, skipped',
    skipListDeleteNotFound: '{value} not found, cannot delete',
    skipListLogDeleteNotFound: 'delete({value}) → not found',
    skipListLogDeleteSuccess: 'delete({value}) → deleted',
    skipListDeleteSuccess: 'Deleted {value}',
    skipListLogSearchFound: 'search({value}) → found ✓',
    skipListLogSearchNotFound: 'search({value}) → not found',
    unionFindInputRequired: 'Please enter a valid number',
    unionFindLogInsertError: 'Insert failed: {value} (invalid or out of range)',
    unionFindLogInsert: 'insert({value}) → makeSet, parent=self',
    unionFindInsertSuccess: 'Inserted {value}',
    unionFindInsertDuplicate: '{value} already exists, Union-Find does not allow duplicates',
    unionFindLogInsertDuplicate: 'insert({value}) → duplicate, skipped',
    unionFindDeleteNotFound: '{value} not found, cannot delete',
    unionFindLogDeleteNotFound: 'delete({value}) → not found',
    unionFindLogDeleteSuccess: 'delete({value}) → deleted',
    unionFindDeleteSuccess: 'Deleted {value}',
    unionFindLogFind: 'find({value}) → root={root} (path compression)',
    unionFindLogFindNotFound: 'find({value}) → not found',
    unionFindNodeNotFound: 'Node not found',
    unionFindLogNodeNotFound: 'Operation failed: node not found',
    unionFindAlreadyConnected: '{a} and {b} are already in the same set',
    unionFindLogAlreadyConnected: 'union({a}, {b}) → already connected, skipped',
    unionFindUnionSuccess: 'Unioned {a} and {b}',
    unionFindLogUnion: 'union({a}, {b}) → union by rank',
    unionFindLogConnected: 'connected({a}, {b}) → same set ✓',
    unionFindLogNotConnected: 'connected({a}, {b}) → different sets ✗',
  },
  speedControl: {
    presetDefault: 'Default',
    presetGentle: 'Gentle',
    presetSnappy: 'Snappy',
    presetDramatic: 'Dramatic',
    presetInstant: 'Instant',
    animationError: 'Animation error',
    renderSlow: 'Slow render',
  },
  contentTier: {
    title: 'Knowledge Tiers',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    conceptLabel: 'Concept',
    featuresLabel: 'Key Features',
    complexityLabel: 'Complexity',
    applicationsLabel: 'Applications',
    codeLabel: 'Code Example',
    variantsLabel: 'Variants & Optimization',
    comparisonLabel: 'Comparison',
    engineeringLabel: 'Engineering Practice',
    expand: 'Show Knowledge',
    collapse: 'Hide Knowledge',
    array: {
      beginnerConcept: 'An array is a linear data structure that stores elements of the same type in contiguous memory. Each element is accessed by its index (subscript), starting from 0. It is the most fundamental and widely used data structure.',
      beginnerFeatures: 'Random access O(1) via index; contiguous memory, cache-friendly; fixed length (static) or resizable (dynamic); supports forward and backward traversal.',
      intermediateComplexity: 'Access O(1); head insert/delete O(n) (shift elements); tail insert/delete amortized O(1); search (unsorted) O(n); search (sorted, binary search) O(log n).',
      intermediateApplications: 'Lookup tables and random access; buffers and data caching; DP state arrays; hash table open-addressing storage; matrix operations.',
      intermediateCode: 'int arr[10]; arr[0] = 42;  // C static array\nvector<int> v; v.push_back(1);  // C++ dynamic array\nint x = arr[i];  // O(1) random access',
      advancedVariants: 'Dynamic arrays (vector/ArrayList) auto-resize, typically 1.5x or 2x growth; circular arrays for ring buffers; bitmaps for efficient set operations; sparse arrays for compressed storage.',
      advancedComparison: 'vs Linked List: arrays have fast random access O(1) but slow insert/delete O(n), linked lists vice versa; arrays are contiguous and cache-friendly, linked lists have pointer chasing; arrays have no pointer overhead.',
      advancedEngineering: 'Resize strategy affects performance — 2x growth gives amortized O(1) but may waste memory; vector reserve() pre-allocates to avoid repeated resizing; Java ArrayList default capacity 10; Go slice growth is more aggressive for small arrays.',
    },
    stack: {
      beginnerConcept: 'A stack is a Last-In-First-Out (LIFO) linear data structure. Elements can only be inserted (push) and removed (pop) from one end (the top), while the other end (the bottom) is closed.',
      beginnerFeatures: 'LIFO order; operations only at the top; three core operations: push, pop, peek; natural model for recursion.',
      intermediateComplexity: 'push/pop/peek all O(1); space O(n); searching requires popping elements one by one, O(n).',
      intermediateApplications: 'Function call stack management; parenthesis matching; expression evaluation (infix to postfix); browser back button; editor undo; DFS depth-first search.',
      intermediateCode: 'stack<int> s;\ns.push(1);       // push\nint top = s.top(); // peek\ns.pop();          // pop',
      advancedVariants: 'Linked-list stack (no capacity limit); two-stack queue (push stack + pop stack, amortized O(1)); monotonic stack (maintains monotonicity, solves "next greater element"); lock-free parallel stack (CAS).',
      advancedComparison: 'vs Queue: stack LIFO suits backtracking/recursion, queue FIFO suits BFS/buffering. vs Array: stack is a restricted array exposing only top operations — safer and more abstract.',
      advancedEngineering: 'Call stack overflow (Stack Overflow) requires watching recursion depth; tail-call optimization prevents stack growth; browser call stack is limited (Chrome ~10k-20k frames); coroutines use heap-simulated stacks to avoid overflow.',
    },
    queue: {
      beginnerConcept: 'A queue is a First-In-First-Out (FIFO) linear data structure. Elements are inserted at one end (rear, enqueue) and removed from the other end (front, dequeue).',
      beginnerFeatures: 'FIFO order; enqueue at rear, dequeue from front; peek at front; embodies fairness — first come, first served.',
      intermediateComplexity: 'enqueue/dequeue/front all O(1); space O(n); array-based implementation needs circular buffer to avoid false overflow.',
      intermediateApplications: 'Core structure for BFS; task scheduling (FCFS); message queues and async processing; print queues; buffer management.',
      intermediateCode: 'queue<int> q;\nq.push(1);         // enqueue\nint front = q.front(); // peek front\nq.pop();            // dequeue',
      advancedVariants: 'Circular queue (ring buffer, avoids false overflow); deque (both ends insert/delete); priority queue (heap-based, dequeues by priority); monotonic queue (sliding window extrema).',
      advancedComparison: 'vs Stack: queue FIFO suits BFS, stack LIFO suits DFS. Circular queue vs linked queue: circular is contiguous and cache-friendly but fixed capacity, linked has no capacity limit but pointer overhead.',
      advancedEngineering: 'Producer-consumer pattern uses blocking queues for decoupling; message brokers (Kafka/RabbitMQ) are essentially distributed queues; circular queues need careful empty/full detection (use a size field to disambiguate front==rear).',
    },
    linkedlist: {
      beginnerConcept: 'A linked list is a linear data structure where elements (nodes) are connected via pointers. Each node contains a data field and a pointer field pointing to the next node. Memory is non-contiguous and dynamically allocated.',
      beginnerFeatures: 'Dynamic size, no pre-allocation needed; head/tail insert O(1); no random access, must traverse from head; extra pointer overhead per node.',
      intermediateComplexity: 'Head/tail insert O(1); access by index O(n); search by value O(n); delete known node O(1) (doubly linked) or O(n) (singly linked, need predecessor).',
      intermediateApplications: 'Implementing stacks and queues; hash table chaining for collision resolution; LRU cache (doubly linked list + hash map); polynomial arithmetic; memory management free-block lists.',
      intermediateCode: 'struct Node { int val; Node* next; };\nNode* head = new Node{1, nullptr};\nhead->next = new Node{2, nullptr};',
      advancedVariants: 'Singly/doubly/circular linked lists; SkipList (multi-level indexes, O(log n) search); lazy-deletion lists (mark then batch-clean); unrolled linked list (multiple elements per node, cache-friendly).',
      advancedComparison: 'vs Array: linked list has fast insert/delete O(1) but slow access O(n), array vice versa; linked list is non-contiguous and cache-unfriendly, array is contiguous and cache-friendly; linked list has no resize waste.',
      advancedEngineering: 'LRU cache = doubly linked list + hash map, Java LinkedHashMap provides this built-in; SkipList is one of Redis sorted set underlying structures; Linux kernel uses linked lists extensively (list_head intrusive structure); list reversal is a classic interview problem.',
    },
    tree: {
      beginnerConcept: 'A tree is a hierarchical data structure composed of nodes and edges. There is one root node, and each node has zero or more children. A binary tree has at most two children per node (left subtree and right subtree).',
      beginnerFeatures: 'Hierarchical structure with a unique root; acyclic connected graph; binary trees have left and right subtrees; four traversals: preorder, inorder, postorder (DFS) and level-order (BFS).',
      intermediateComplexity: 'Balanced BST search/insert/delete O(log n); traversal O(n); worst case (degenerated to linked list) O(n); tree height h determines operation efficiency.',
      intermediateApplications: 'Binary Search Tree BST (efficient search and range queries); file system directory trees; DOM trees; expression trees (compiler syntax analysis); heaps (priority queue underlying structure).',
      intermediateCode: 'struct TreeNode {\n  int val;\n  TreeNode* left;\n  TreeNode* right;\n};\n// Preorder: root -> left -> right\nvoid preorder(TreeNode* n) {\n  if (!n) return;\n  visit(n);\n  preorder(n->left);\n  preorder(n->right);\n}',
      advancedVariants: 'AVL tree (strictly balanced, height diff <= 1); red-black tree (approximately balanced, widely used in engineering); B-tree/B+ tree (multi-way search, database indexes); Trie (string prefix retrieval); segment tree / BIT (range queries and updates).',
      advancedComparison: 'BST vs Hash Table: BST supports ordered traversal O(n) and range queries, hash table gives O(1) lookup but is unordered. AVL vs Red-Black: AVL is more strictly balanced with faster lookups, red-black has fewer rotations for insert/delete — better for write-heavy workloads.',
      advancedEngineering: 'Red-black tree underlies C++ std::map and Java TreeMap; B+ tree is the MySQL InnoDB index structure; LSM Tree is the core of LevelDB/RocksDB; recursion is the natural expression for tree operations, but watch stack depth.',
    },
    avlTree: {
      beginnerConcept: 'AVL tree is a self-balancing binary search tree invented by Adelson-Velsky and Landis in 1962. It uses rotations to ensure the height difference between left and right subtrees of any node is at most 1, guaranteeing O(log n) for search, insert, and delete operations.',
      beginnerFeatures: 'Self-balancing: automatic rotation after insert/delete; Balance Factor BF = left height - right height, valid range {-1, 0, 1}; Four rotations: LL right, RR left, LR left-then-right, RL right-then-left; Nodes store a height field.',
      intermediateComplexity: 'Search/insert/delete all O(log n); tree height upper bound h ≤ 1.44·log₂(n+2) - 0.328; insert needs at most 1 rotation to rebalance; delete needs at most O(log n) rotations.',
      intermediateApplications: 'Database indexes (read-heavy workloads); in-memory ordered maps; filesystem directory structures; game spatial partitioning (AABB trees); network routing tables.',
      intermediateCode: 'class AvlNode {\n  int val;\n  AvlNode *left, *right;\n  int height;\n};\n// Right rotation (LL imbalance)\nAvlNode* rotateRight(AvlNode *y) {\n  AvlNode *x = y->left;\n  y->left = x->right;\n  x->right = y;\n  updateHeight(y);\n  updateHeight(x);\n  return x;\n}',
      advancedVariants: 'Red-black tree (approximately balanced, fewer rotations); AA tree (only right children can be red, simpler implementation); Splay tree (self-adjusting, recently accessed nodes near root); Treap (tree + heap, randomized balancing).',
      advancedComparison: 'AVL vs Red-Black: AVL is more strictly balanced with faster lookups (smaller height) but more rotations for insert/delete; red-black has bounded rotations (insert 2, delete 3), better for write-heavy workloads. AVL vs plain BST: AVL guarantees O(log n), plain BST can degrade to O(n) linked list.',
      advancedEngineering: 'Linux kernel historically used AVL trees for process virtual memory areas (later replaced by red-black trees); C++ std::map typically uses red-black over AVL (trading rotation count); AVL trees suit lookup-intensive scenarios like read-only database indexes; correct height field maintenance is the key to balancing.',
    },
  },
  globalSearch: {
    title: 'Global Search',
    placeholder: 'Search pages, algorithms, learning steps...',
    inputAriaLabel: 'Search input',
    shortcut: 'Ctrl + K',
    noResults: 'No results found',
    noHistory: 'No search history',
    history: 'Search History',
    clearHistory: 'Clear history',
    removeHistory: 'Remove this history item',
    complexity: 'Complexity',
    categoryPage: 'Page',
    categoryLearning: 'Learning Step',
    categoryHistory: 'History',
  },
  pwa: {
    updateAvailable: 'Update available',
    reload: 'Reload',
    close: 'Close',
  },
  performance: {
    mode: 'Performance Mode',
    hint: 'Animations skipped for large data',
  },
}
