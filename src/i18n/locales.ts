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
    more: string
    close: string
    running: string
    skipToContent: string
  }
  array: {
    title: string
    subtitle: string
    search: string
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
    langTooltip: string
    openMenu: string
    collapseMenu: string
    home: string
    array: string
    stack: string
    queue: string
    linkedlist: string
    tree: string
    graph: string
    sort: string
    hash: string
    heap: string
    trie: string
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
    emptyGraphShort: string
    emptyHashShort: string
    emptyHeapShort: string
    emptyTrieShort: string
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
    emptyGraph: string
    emptyGraphDesc: string
    emptyHash: string
    emptyHashDesc: string
    emptyHeap: string
    emptyHeapDesc: string
    emptyTrie: string
    emptyTrieDesc: string
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
  learningPath: {
    title: string
    progress: string
    reset: string
    completed: string
    locked: string
    startLearning: string
    continueLearning: string
    allCompleted: string
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
      heap: string
      trie: string
      hash: string
      graph: string
      sort: string
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
    graphLabel: string
    sortLabel: string
    hashLabel: string
    heapLabel: string
    trieLabel: string
  }
  shortcuts: {
    title: string
    close: string
    undo: string
    redo: string
    reset: string
    pause: string
    toggleHelp: string
  }
  page: {
    operations: string
    selected: string
    running: string
    done: string
    comparing: string
    compareDone: string
    algorithms: string
    stopped: string
  }
  performanceChart: {
    title: string
    comparisons: string
    swaps: string
    steps: string
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
  }
  speedControl: {
    presetDefault: string
    presetGentle: string
    presetSnappy: string
    presetDramatic: string
    presetInstant: string
    animationError: string
  }
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
    more: '更多',
    close: '关闭',
    running: '运行中',
    skipToContent: '跳转到内容',
  },
  array: {
    title: '数组',
    subtitle: '线性数据结构 · 连续内存 · 随机访问',
    search: '查找',
    insert: '按位插',
    delete: '删除',
    indexPlaceholder: '索引 (0~19)',
    valuePlaceholder: '值 (1~99)',
  },
  stack: {
    title: '栈',
    subtitle: '后进先出 (LIFO) · 函数调用 · 括号匹配',
    push: '入栈',
    pop: '出栈',
    peek: '查看',
  },
  queue: {
    title: '队列',
    subtitle: '先进先出 (FIFO) · 缓冲队列 · 广度优先',
    enqueue: '入队',
    dequeue: '出队',
    peek: '查看',
  },
  linkedlist: {
    title: '链表',
    subtitle: '动态内存 · 插入高效 · 单向遍历',
    pushFront: '头插',
    pushBack: '尾插',
    reverse: '反转',
    find: '查找',
    insertAt: '按位插',
    detectCycle: '检测环',
    headLabel: '头节点',
    nullLabel: '空',
  },
  tree: {
    title: '二叉树',
    subtitle: '层次结构 · 递归遍历 · 二分查找',
    insert: '插入',
    search: '查找',
    preorder: '前序',
    inorder: '中序',
    postorder: '后序',
    levelorder: '层序',
    edgeStyle: '连线样式',
  },
  graph: {
    title: '图',
    subtitle: '网状结构 · 遍历算法 · 最短路径',
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
  },
  hash: {
    title: '哈希表',
    subtitle: '键值映射 · 冲突解决 · 平均 O(1)',
    keyPlaceholder: '键 (0~99)',
    valuePlaceholder: '值 (任意文本)',
    insert: '插入',
    remove: '删除',
    search: '查找',
  },
  heap: {
    title: '堆',
    subtitle: '完全二叉树 · 最大堆 · 优先级队列',
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
  sort: {
    title: '排序',
    subtitle: '算法可视化 · 时间复杂度对比',
    randomize: '随机数据',
    stop: '停止',
    compare: '比较',
    swap: '交换',
    steps: '步数',
    legend: '图例',
    selectAlgorithm: '选择算法',
    bubble: '冒泡排序',
    radix: '基数排序',
    bucket: '桶排序',
    quick: '快速排序',
    merge: '归并排序',
    heapSort: '堆排序',
    selection: '选择排序',
    insertion: '插入排序',
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
    subtitle: 'BFS / DFS / Dijkstra / 拓扑排序',
    algorithm: '算法',
    startNode: '起始节点',
    complexityCompare: '复杂度对比',
  },
  sidebar: {
    title: '数据结构学习助手',
    themeTooltip: '主题',
    langTooltip: '语言',
    openMenu: '打开导航菜单',
    collapseMenu: '收起导航菜单',
    home: '首页',
    array: '数组',
    stack: '栈',
    queue: '队列',
    linkedlist: '链表',
    tree: '二叉树',
    graph: '图',
    sort: '排序',
    hash: '哈希表',
    heap: '堆',
    trie: '字典树',
    compare: '算法对比',
    graphAlgorithm: '图算法',
    themeDefault: '默认',
    themeForest: '森林',
    themeWarm: '暖色',
    themeRoyal: '皇家',
  },
  home: {
    badge: 'Data Structures Visualized',
    title: '数据结构学习助手',
    heroDescription: '通过交互式可视化动画，直观理解12种核心数据结构的原理与操作。Neo-Brutalism 风格 · 工程图纸质感 · 实时动画反馈。',
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
    emptyGraphShort: '空图 · 请添加节点',
    emptyHashShort: '空哈希表 · 请插入键值对',
    emptyHeapShort: '空堆 · 请插入元素',
    emptyTrieShort: '空字典树 · 请插入单词',
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
    emptyGraph: '图为空',
    emptyGraphDesc: '点击添加节点按钮创建图',
    emptyHash: '哈希表为空',
    emptyHashDesc: '点击插入按钮添加键值对',
    emptyHeap: '堆为空',
    emptyHeapDesc: '点击插入按钮添加元素',
    emptyTrie: '字典树为空',
    emptyTrieDesc: '点击插入按钮添加单词',
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
    stackTop: '← 栈顶 Top',
    stackBottom: '← 栈底 Bottom',
    empty: '数据结构可视化',
    zoomIn: '放大',
    zoomOut: '缩小',
    arrayLabel: '数组可视化',
    stackLabel: '栈可视化',
    queueLabel: '队列可视化',
    linkedlistLabel: '链表可视化',
    treeLabel: '二叉树可视化',
    graphLabel: '图可视化',
    sortLabel: '排序可视化',
    hashLabel: '哈希表可视化',
    heapLabel: '堆可视化',
    trieLabel: '字典树可视化',
  },
  shortcuts: {
    title: '键盘快捷键',
    close: '按 Esc 或点击外部关闭',
    undo: '撤销上一步操作',
    redo: '重做被撤销的操作',
    reset: '重置数据结构',
    pause: '暂停动画',
    toggleHelp: '显示/隐藏快捷键帮助',
  },
  page: {
    operations: '操作',
    selected: '个已选',
    running: '运行中...',
    done: '全部完成',
    comparing: '开始并行对比',
    compareDone: '对比完成',
    algorithms: '个算法',
    stopped: '已停止排序',
  },
  performanceChart: {
    title: '性能对比',
    comparisons: '比较次数',
    swaps: '交换次数',
    steps: '总步数',
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
  learningPath: {
    title: '学习路径',
    progress: '学习进度',
    reset: '重置进度',
    completed: '已完成',
    locked: '未解锁',
    startLearning: '开始学习',
    continueLearning: '继续学习',
    allCompleted: '恭喜！全部学完',
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
      heap: '优先队列，堆排序与 Top-K 问题的利器',
      trie: '前缀树，自动补全与字符串搜索的利器',
      hash: 'O(1) 查找，理解哈希函数与冲突处理',
      graph: '关系建模，最短路径与拓扑排序的核心',
      sort: '算法基石，理解时间与空间复杂度的必经之路',
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
  },
  speedControl: {
    presetDefault: '标准',
    presetGentle: '柔和',
    presetSnappy: '快速',
    presetDramatic: '戏剧',
    presetInstant: '瞬时',
    animationError: '动画异常',
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
    more: 'More',
    close: 'Close',
    running: 'Running',
    skipToContent: 'Skip to content',
  },
  array: {
    title: 'Array',
    subtitle: 'Linear Data Structure · Contiguous Memory · Random Access',
    search: 'Search',
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
  sort: {
    title: 'Sorting',
    subtitle: 'Algorithm Visualization · Time Complexity Comparison',
    randomize: 'Randomize',
    stop: 'Stop',
    compare: 'Compare',
    swap: 'Swap',
    steps: 'Steps',
    legend: 'Legend',
    selectAlgorithm: 'Select Algorithm',
    bubble: 'Bubble Sort',
    radix: 'Radix Sort',
    bucket: 'Bucket Sort',
    quick: 'Quick Sort',
    merge: 'Merge Sort',
    heapSort: 'Heap Sort',
    selection: 'Selection Sort',
    insertion: 'Insertion Sort',
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
    subtitle: 'BFS / DFS / Dijkstra / Topological Sort',
    algorithm: 'Algorithm',
    startNode: 'Start Node',
    complexityCompare: 'Complexity Comparison',
  },
  sidebar: {
    title: 'Data Structure Learner',
    themeTooltip: 'Theme',
    langTooltip: 'Language',
    openMenu: 'Open navigation menu',
    collapseMenu: 'Collapse navigation menu',
    home: 'Home',
    array: 'Array',
    stack: 'Stack',
    queue: 'Queue',
    linkedlist: 'Linked List',
    tree: 'Binary Tree',
    graph: 'Graph',
    sort: 'Sorting',
    hash: 'Hash Table',
    heap: 'Heap',
    trie: 'Trie',
    compare: 'Compare',
    graphAlgorithm: 'Graph Algo',
    themeDefault: 'Default',
    themeForest: 'Forest',
    themeWarm: 'Warm',
    themeRoyal: 'Royal',
  },
  home: {
    badge: 'Data Structures Visualized',
    title: 'Data Structure Learner',
    heroDescription: 'Learn 12 core data structures through interactive visualization animations. Neo-Brutalist style · Engineering blueprint feel · Real-time animation feedback.',
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
    emptyGraphShort: 'Empty Graph · Add nodes',
    emptyHashShort: 'Empty Hash · Insert key-value pairs',
    emptyHeapShort: 'Empty Heap · Insert elements',
    emptyTrieShort: 'Empty Trie · Insert words',
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
    emptyGraph: 'Graph is empty',
    emptyGraphDesc: 'Click add node to create the graph',
    emptyHash: 'Hash table is empty',
    emptyHashDesc: 'Click insert to add key-value pairs',
    emptyHeap: 'Heap is empty',
    emptyHeapDesc: 'Click insert to add elements',
    emptyTrie: 'Trie is empty',
    emptyTrieDesc: 'Click insert to add words',
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
    stackTop: '← Top',
    stackBottom: '← Bottom',
    empty: 'Data structure visualization',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    arrayLabel: 'Array visualization',
    stackLabel: 'Stack visualization',
    queueLabel: 'Queue visualization',
    linkedlistLabel: 'Linked list visualization',
    treeLabel: 'Binary tree visualization',
    graphLabel: 'Graph visualization',
    sortLabel: 'Sorting visualization',
    hashLabel: 'Hash table visualization',
    heapLabel: 'Heap visualization',
    trieLabel: 'Trie visualization',
  },
  shortcuts: {
    title: 'Keyboard Shortcuts',
    close: 'Press Esc or click outside to close',
    undo: 'Undo last action',
    redo: 'Redo undone action',
    reset: 'Reset data structure',
    pause: 'Pause animation',
    toggleHelp: 'Show/hide shortcut help',
  },
  page: {
    operations: 'Operations',
    selected: 'selected',
    running: 'Running...',
    done: 'All Done',
    comparing: 'Starting parallel comparison',
    compareDone: 'Comparison complete',
    algorithms: 'algorithms',
    stopped: 'Sorting stopped',
  },
  performanceChart: {
    title: 'Performance Comparison',
    comparisons: 'Comparisons',
    swaps: 'Swaps',
    steps: 'Steps',
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
  learningPath: {
    title: 'Learning Path',
    progress: 'Progress',
    reset: 'Reset Progress',
    completed: 'Completed',
    locked: 'Locked',
    startLearning: 'Start Learning',
    continueLearning: 'Continue Learning',
    allCompleted: 'Congratulations! All completed',
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
      heap: 'Priority queue, essential for heap sort and Top-K problems',
      trie: 'Prefix tree, essential for autocomplete and string search',
      hash: 'O(1) lookup, understand hash functions and collision handling',
      graph: 'Relationship modeling, core of shortest path and topological sort',
      sort: 'Algorithm cornerstone, essential for understanding time/space complexity',
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
  },
  speedControl: {
    presetDefault: 'Default',
    presetGentle: 'Gentle',
    presetSnappy: 'Snappy',
    presetDramatic: 'Dramatic',
    presetInstant: 'Instant',
    animationError: 'Animation error',
  },
}
