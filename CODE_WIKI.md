# 数据结构学习助手 — Code Wiki

> **版本:** v13.0.0-rc2
> **日期:** 2026-06-21
> **技术栈:** React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + React Router v7 + Vitest + Playwright
> **部署:** GitHub Pages（base path `/Data-Structures-Visualized/`）

---

## 目录

1. [项目概述与背景](#1-项目概述与背景)
2. [整体架构设计](#2-整体架构设计)
3. [主要模块划分与核心职责](#3-主要模块划分与核心职责)
4. [关键类与核心函数详解](#4-关键类与核心函数详解)
5. [模块间与组件间依赖关系](#5-模块间与组件间依赖关系)
6. [项目环境配置要求](#6-项目环境配置要求)
7. [构建与运行步骤](#7-构建与运行步骤)
8. [测试策略与执行方法](#8-测试策略与执行方法)
9. [代码规范与最佳实践](#9-代码规范与最佳实践)
10. [常见问题与解决方案](#10-常见问题与解决方案)
11. [未来优化建议](#11-未来优化建议)
12. [附录：文件路径索引](#12-附录文件路径索引)

---

## 1. 项目概述与背景

### 1.1 项目定位

**数据结构学习助手（ds-visualizer）** 是一款面向大学生的中文 Web 端数据结构可视化教学工具。通过交互式 D3.js SVG 动画，帮助学习者直观理解核心数据结构的原理与操作过程。

### 1.2 核心功能矩阵

| 功能模块 | 支持操作 | 可视化特性 |
|---------|---------|-----------|
| **数组 Array** | 插入、删除、查找、随机生成、导入/导出 | 矩形条 + 索引标注，元素位移动画 |
| **栈 Stack** | Push、Pop、Peek、Clear | 垂直堆叠，栈顶/栈底标记 |
| **队列 Queue** | Enqueue、Dequeue、Front、Clear | 水平排列，队首/队尾标记 |
| **链表 LinkedList** | 头插、尾插、按位置插入、删除、查找、反转、环检测 | 圆形节点 + 带箭头连线 |
| **二叉树 BinaryTree** | 插入、前序/中序/后序/层序遍历、查找、删除 | 树状布局，节点生长动画 |
| **AVL 树 AVLTree** | 插入、删除、查找、自平衡旋转可视化、前序/中序/后序/层序遍历 | 树状布局，旋转动画与平衡因子展示；遍历使用边流动点 + 节点脉冲高亮 |
| **图 Graph** | 添加/删除节点和边、BFS、DFS、Dijkstra、邻接矩阵/邻接表 | 力导向布局、邻接矩阵/邻接表视图 |
| **排序 Sorting** | 冒泡、选择、插入、快速、归并、堆、基数、桶、希尔、梳排、Tim、计数排序 | 柱状图高度表示值，比较/交换动画 |
| **哈希表 Hash Table** | 插入、删除、查找（取模哈希 + 链地址法） | 桶数组 + 链表冲突节点 |
| **堆 Heap** | Insert、ExtractMax、Peek | 完全二叉树层级布局 + 违规检测 |
| **字典树 Trie** | 插入、删除、查找、前缀匹配 | 树形层级布局 + 边标签可视化 |
| **跳表 SkipList** | 插入、删除、搜索、多层索引遍历 | 扁平化多层链表布局 + 概率平衡可视化 |
| **并查集 UnionFind** | MakeSet、Find、Union（路径压缩 + 按秩合并）、连通性查询 | 集合森林布局 + 树高/秩展示 |
| **红黑树 RedBlackTree** | 插入、删除、查找、Fixup 着色 + 左右旋转 | 树状布局 + 红黑节点着色 + 旋转动画 |
| **算法对比 SortCompare** | 12 种排序算法并行对比 | 多算法并行可视化 + PerformanceChart |
| **图算法 GraphAlgorithm** | BFS、DFS、Dijkstra、拓扑排序、Bellman-Ford、Floyd-Warshall、Prim、Kruskal | SVG 可视化 + 学习模式 + 复杂度对比 |
| **全局搜索 GlobalSearch** | Ctrl/Cmd+K 唤起、数据结构/算法/页面快速跳转 | 键盘上下导航 + Enter 选中 + 模糊匹配 |

### 1.3 关键特性

- **Neo-Brutalism 设计风格** — 粗边框、硬阴影、高对比度配色
- **统一交互体验** — 所有数据结构页面遵循一致的布局与操作范式
- **实时动画反馈** — 基于 D3.js 的数据驱动动画，支持速度调节和 5 种动画预设
- **操作日志系统** — 时间戳 + 操作类型 + 详情的完整执行记录
- **Undo/Redo 支持** — 基于历史栈的状态回溯（最多 20 步，动画期间自动禁用）
- **学习模式** — 37 个算法的学习步骤配置，含代码片段、复杂度、提示
- **学习路径** — 15 个数据结构的学习顺序与依赖关系可视化
- **全局搜索** — Ctrl/Cmd+K 快捷键唤起，支持数据结构/算法/页面快速跳转，键盘上下导航 + Enter 选中
- **多语言支持** — 中文 + 英文，自研轻量 i18n 实现
- **多主题支持** — 明暗模式（light/dark/system）+ 4 套颜色主题
- **PWA 支持** — 离线缓存、可安装、自动更新
- **数据持久化** — 所有数据结构自动保存到 localStorage
- **数据分享** — URL 编码分享（限 4000 字符）+ JSON 文件导入/导出
- **性能自适应** — 根据数据量自动降级动画时长 + FPS 监控
- **无障碍支持** — SVG `role="img"` + `aria-label`，键盘导航
- **错误监控** — 生产环境 Sentry 集成

### 1.4 技术栈版本

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^19.2.6 | UI 框架（StrictMode + 自动 JSX runtime） |
| React DOM | ^19.2.6 | DOM 渲染 |
| React Router | ^7.15.1 | 路由（BrowserRouter + lazy） |
| D3.js | ^7.9.0 | SVG 数据可视化 |
| Vite | ^8.0.16 | 构建工具 + 开发服务器 |
| TypeScript | ^5.8.3 | 类型系统 |
| Tailwind CSS | ^4.3.0 | 样式（v4 @theme 块） |
| Vitest | ^4.1.7 | 单元测试 |
| Playwright | ^1.60.0 | E2E 测试 |
| ESLint | ^10.3.0 | 代码检查（flat config） |
| Sentry | ^10.57.0 | 生产环境错误监控 |

---

## 2. 整体架构设计

### 2.1 六层架构总览

```
┌─────────────────────────────────────────────────────────────────┐
│  第 1 层：Entry（入口层）                                        │
│  main.tsx → App.tsx（BrowserRouter + Suspense + ErrorBoundary） │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 2 层：Pages（页面层）— 17 个 React.lazy 代码分割页面          │
│  Home / ArrayPage / StackPage / ... / GraphAlgorithmPage         │
│  + SkipListPage / UnionFindPage / RedBlackTreePage               │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 3 层：Components（组件层）— 34 个可复用组件                   │
│  Visualizer / OperationBar / OperationGroup / Sidebar / ...     │
│  + InfoPanel / GlobalSearch                                      │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 4 层：Hooks（状态管理层）— 25 个自定义 hooks                  │
│  use*State（14 个）→ useDataStructureState → useHistory          │
│  + useGlobalSettings / useTheme / useI18n / useLearningMode ...  │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 5 层：Visualizers（可视化器层）— 14 个纯函数模块              │
│  arrayVisualizer / stackVisualizer / ... / sortVisualizer        │
│  + skipListVisualizer / unionFindVisualizer / redBlackTreeVisualizer │
│  统一模式：renderXxx（静态渲染）+ animateXxx（动画）              │
└──────────────────────────┬──────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│  第 6 层：Algorithms / Utils（算法与工具层）                      │
│  algorithms/sorting（注册表，8 种）+ algorithms/graph（4 种）     │
│  algorithms/skipList + algorithms/unionFind + algorithms/redBlackTree │
│  utils/animationEngine + d3Imports + validate + themeColors ...  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 架构设计原则

1. **依赖方向单向**：上层依赖下层，下层不感知上层。无循环依赖。
2. **状态管理分层**：`useHistory`（纯 undo/redo）→ `useDataStructureState`（+ 持久化 + 日志 + 动画锁）→ `useXxxState`（+ 业务操作）。
3. **动画与数据解耦**：动画只做视觉高亮（highlight/fade/move），不移动元素、不创建持久 DOM。位置变化通过全量重渲染实现。
4. **全清全渲染策略**：每次数据变化调用 `container.selectAll('*').remove()` 后重新创建所有元素，避免 D3 enter/update/exit 的状态管理复杂性。
5. **集中化动画引擎**：所有动画时长通过 `animationEngine.duration()` 计算，禁止散落的 magic number 或原始 `setTimeout`/`d3.transition` 时长。
6. **D3 统一导入**：所有 D3 导入必须通过 `src/utils/d3Imports.ts`，禁止直接 `import 'd3'`，避免 Vite 预打包导致的双实例问题。
7. **外部 Store 模式**：Toast 和颜色主题使用 `useSyncExternalStore` 而非 Context，避免 Provider 嵌套和全局重渲染。
8. **注册表模式**：排序算法用 `Map<string, SortAlgorithm>` 注册表，新增算法无需修改 `useSortState`，符合开闭原则。

### 2.3 应用入口流程

```
main.tsx
  ├─ createRoot + StrictMode
  ├─ 全局导入 'd3-transition'（注册 D3 过渡副作用）
  ├─ 生产环境异步加载 Sentry（./utils/sentry）
  ├─ initThemeColors()（初始化主题颜色）
  └─ 挂载 <App /> + <ToastContainer />

App.tsx
  └─ GlobalSettingsProvider（Context 全局设置）
     └─ BrowserRouter（basename="/Data-Structures-Visualized"）
        └─ Layout（侧边栏 + 主内容区 + 键盘帮助 + 性能监控 + 网络状态 + GlobalSearch）
           └─ ErrorBoundary
              └─ Suspense（fallback=PageLoader）
                 └─ Routes（17 条路由，全部 React.lazy）
```

### 2.4 路由映射表

| 路径 | 页面组件 | 文件 | 数据结构 |
|------|---------|------|---------|
| `/` | `Home` | `Home.tsx` | 首页/导航卡片 |
| `/array` | `ArrayPage` | `ArrayPage.tsx` | 数组 |
| `/stack` | `StackPage` | `StackPage.tsx` | 栈 |
| `/queue` | `QueuePage` | `QueuePage.tsx` | 队列 |
| `/linkedlist` | `LinkedListPage` | `LinkedListPage.tsx` | 链表 |
| `/tree` | `TreePage` | `TreePage.tsx` | 二叉树 |
| `/graph` | `GraphPage` | `GraphPage.tsx` | 图（交互编辑） |
| `/sort` | `SortPage` | `SortPage.tsx` | 排序算法 |
| `/hash` | `HashPage` | `HashPage.tsx` | 哈希表 |
| `/heap` | `HeapPage` | `HeapPage.tsx` | 堆 |
| `/trie` | `TriePage` | `TriePage.tsx` | 字典树 |
| `/skip-list` | `SkipListPage` | `SkipListPage.tsx` | 跳表 |
| `/union-find` | `UnionFindPage` | `UnionFindPage.tsx` | 并查集 |
| `/red-black-tree` | `RedBlackTreePage` | `RedBlackTreePage.tsx` | 红黑树 |
| `/compare` | `SortComparePage` | `SortComparePage.tsx` | 排序对比 |
| `/graph-algorithm` | `GraphAlgorithmPage` | `GraphAlgorithmPage.tsx` | 图算法演示 |
| `/learning-path` | `LearningPath` | `LearningPath.tsx` | 学习路径 |
| `*` | `Home` | - | 兜底路由 |

---

## 3. 主要模块划分与核心职责

### 3.1 目录结构

```
src/
├── __tests__/                 # 单元测试（118 个文件）
│   ├── __snapshots__/
│   ├── pages/                 # 17 个页面测试 + testUtils.tsx
│   ├── visualizers/           # 14 个可视化测试 + d3MockHelper.ts
│   └── *.test.ts(x)           # 组件/hooks/utils 测试
├── algorithms/
│   ├── graph/                 # 图算法（bfs/dfs/dijkstra/topoSort/bellmanFord/floydWarshall/prim/kruskal）
│   ├── sorting/               # 排序算法注册表（12 种）
│   ├── skipList.ts            # 跳表算法
│   ├── unionFind.ts           # 并查集算法
│   └── redBlackTree.ts        # 红黑树算法
├── assets/                    # 静态资源
├── components/                # 37 个 React 组件 + toastStore.ts
├── configs/
│   ├── learning/              # 37 个学习模式配置 + index.ts + types.ts
│   └── learningPath.ts        # 学习路径配置
├── data/
│   └── searchIndex.ts         # 全局搜索索引数据源
├── hooks/                     # 25 个自定义 hooks
├── i18n/                      # 国际化（locales.ts + useI18n.ts）
├── pages/                     # 17 个页面组件
├── types/                     # 类型声明（hooks.d.ts + learning.d.ts）
├── utils/                     # 11 个工具模块
├── visualizers/               # 14 个可视化器
├── App.tsx                    # 根组件
├── index.css                  # 全局样式 + Tailwind @theme
├── main.tsx                   # 入口
└── vite-env.d.ts              # Vite 环境变量声明
```

### 3.2 数据结构 → Hook / Visualizer / Page 完整映射表

| 数据结构 | State Hook | Visualizer 模块 | Page 组件 | 路由 | localStorage Key | 初始数据 |
|---------|-----------|----------------|----------|------|-----------------|---------|
| 数组 | `useArrayState` | `arrayVisualizer` | `ArrayPage` | `/array` | `ds-visualizer-data-array` | `[8,3,12,5,9]` |
| 栈 | `useStackState` | `stackVisualizer` | `StackPage` | `/stack` | `ds-visualizer-data-stack` | `[8,17,42]` |
| 队列 | `useQueueState` | `queueVisualizer` | `QueuePage` | `/queue` | `ds-visualizer-data-queue` | `[10,20,30]` |
| 链表 | `useLinkedListState` | `linkedListVisualizer` | `LinkedListPage` | `/linkedlist` | `ds-visualizer-data-linkedlist` | `[10,20,30,40]` |
| 二叉树 | `useTreeState` | `treeVisualizer` | `TreePage` | `/tree` | `ds-visualizer-data-tree` | `[50,30,70,20,40,60,80]` |
| 图 | `useGraphState` | `graphVisualizer` | `GraphPage` | `/graph` | `ds-visualizer-data-graph` | `INITIAL_NODES/LINKS` |
| 哈希表 | `useHashState` | `hashVisualizer` | `HashPage` | `/hash` | `ds-visualizer-data-hash` | `[{12,Alice},...]` |
| 堆 | `useHeapState` | `heapVisualizer` | `HeapPage` | `/heap` | `ds-visualizer-data-heap` | `[95,80,70,60,50,40,30]` |
| 字典树 | `useTrieState` | `trieVisualizer` | `TriePage` | `/trie` | `ds-visualizer-data-trie` | TrieNode 树 |
| 跳表 | `useSkipListState` | `skipListVisualizer` | `SkipListPage` | `/skip-list` | `ds-visualizer-data-skiplist` | 多层链表 |
| 并查集 | `useUnionFindState` | `unionFindVisualizer` | `UnionFindPage` | `/union-find` | `ds-visualizer-data-unionfind` | 集合森林 |
| 红黑树 | `useRedBlackTreeState` | `redBlackTreeVisualizer` | `RedBlackTreePage` | `/red-black-tree` | `ds-visualizer-data-redblacktree` | RBTree 节点树 |
| 排序 | `useSortState` | `sortVisualizer` | `SortPage` | `/sort` | `ds-visualizer-data-sort` | 15 元素数组 |
| 排序对比 | （复用 sort） | `sortVisualizer` | `SortComparePage` | `/compare` | - | - |
| 图算法 | （复用 graph） | `graphVisualizer` | `GraphAlgorithmPage` | `/graph-algorithm` | - | - |

### 3.3 组件层职责分组（34 个组件）

**布局与导航类**：
- `Layout.tsx`：整体布局骨架（Sidebar + main + 辅助组件 + GlobalSearch 挂载 + Ctrl/Cmd+K 监听）
- `Sidebar.tsx`：左侧导航栏，16 个结构入口 + 主题切换 + 语言切换；导出 `STRUCTURE_KEYS` 供 GlobalSearch 复用
- `PageHeader.tsx`：页面标题区
- `GlobalSearch.tsx`：全局搜索弹窗（Ctrl/Cmd+K 唤起），键盘上下导航 + Enter 选中，数据源来自 `src/data/searchIndex.ts`

**可视化容器类**：
- `Visualizer.tsx`：通用 SVG 容器，封装缩放/平移/网格/触摸捏合，接收 `renderFn` 渲染回调
- `EmptyState.tsx`：空状态占位（pointer-events 分层设计）
- `StatsOverlay.tsx`：统计信息浮层
- `ColorLegend.tsx`：颜色图例

**操作交互类**：
- `OperationBar.tsx`：操作工具栏（含 `OperationInput` / `OperationButton` / `OperationLabel` / `OperationInfo` 子组件）
- `OperationGroup.tsx`：可折叠操作组（折叠时不渲染子 DOM）
- `UndoRedoBar.tsx`：撤销/重做按钮
- `UndoPreviewButton.tsx`：撤销预览按钮
- `SpeedControl.tsx`：动画速度控制
- `ExportImport.tsx`：数据导出/导入
- `ShareButton.tsx`：分享按钮（URL 编码数据）

**学习与教学类**：
- `InfoPanel.tsx`：统一信息面板（桌面端右侧 w-96 + 移动端底部抽屉，双 Tab：操作日志/学习模式，含自动跳转机制）
- `LearningModeToggle.tsx`：学习模式开关（已被 InfoPanel 取代，保留向后兼容）
- `LearningPath.tsx`：学习路径展示
- `StepExplainer.tsx`：步骤解释器（嵌入 InfoPanel 学习 Tab）
- `AlgorithmInfo.tsx`：算法信息卡
- `ComplexityChart.tsx`：复杂度图表
- `ProgressBar.tsx`：进度条
- `Timeline.tsx`：时间轴

**日志与反馈类**：
- `LogPanel.tsx`：操作日志面板（`variant="embedded"` 卡片式时间线用于 InfoPanel，`variant="standalone"` 保留旧暗色反转背景）
- `Toast.tsx` + `toastStore.ts`：全局通知（基于 `useSyncExternalStore` 的外部 store 模式）

**监控与辅助类**：
- `PerformanceMonitor.tsx`：性能监控面板
- `PerformanceChart.tsx`：性能图表
- `NetworkStatus.tsx`：网络状态
- `KeyboardHelp.tsx`：键盘快捷键帮助
- `ErrorBoundary.tsx`：错误边界

### 3.4 Hooks 层职责（26 个 hooks）

**数据结构状态 hooks（14 个，均基于 `useDataStructureState`）**：
- `useArrayState`、`useStackState`、`useQueueState`、`useLinkedListState`
- `useTreeState`、`useGraphState`、`useHashState`、`useHeapState`、`useTrieState`
- `useSkipListState`（跳表，扁平化数据表示 + 多层链表 + 概率平衡）
- `useUnionFindState`（并查集，路径压缩 + 按秩合并）
- `useRedBlackTreeState`（红黑树，递归对象表示 + 插入 fixup + 旋转 + 深拷贝不可变更新）
- `useSortState`（排序，含统计与进度）
- `useDataStructureState`（通用基座）

**基础设施 hooks**：
- `useHistory`：底层 undo/redo 栈（max 20 步，基于 useRef）
- `useVisualizer`：SVG 容器尺寸观测 + 动画上下文管理
- `useGlobalSettings`：全局设置 Context（速度、预设、语言、翻译）
- `useTheme`：明暗主题（light/dark/system）
- `useColorTheme`：颜色主题（4 套调色板，基于 `useSyncExternalStore`）
- `useKeyboard` / `useCommonKeyboard`：键盘快捷键
- `useI18n`：国际化（语言切换 + 持久化）
- `useLearningMode`：学习模式步骤导航
- `useLearningProgress`：学习进度追踪
- `useSharedData`：URL 分享数据加载（泛型函数 `useSharedData<T>`，TypeScript 从 `loadData` 自动推断类型 `T`，消除 `as any` 滥用）
- `usePageTracker`：页面访问追踪

### 3.5 Visualizers 层职责（14 个可视化器）

全部为纯函数模块（非组件），统一遵循以下模式：
- 从 `../utils/d3Imports` 导入 D3（**禁止直接 import 'd3'**）
- 从 `../utils/animationEngine` 导入 `duration` / `EASING` / `transitionEnd` / `wait` / `Animation`
- 从 `../utils/themeColors` 导入 `getColors` / `detectDarkMode` / `ensureGradientDefs` / `gradUrl`
- 从 `./visualizerConstants` 导入跨 visualizer 共享的常量（`DEFAULT_NODE_RADIUS` / `DEFAULT_LEVEL_HEIGHT`）
- 导出 `renderXxx(svg, data, options)` 纯静态渲染函数
- 导出 `animateXxx(svg, ..., anim)` 动画函数
- 内部使用 `purgeSVG` 全清全渲染策略
- 定义 `LARGE_DATA_THRESHOLD` 大数据量阈值跳过动画

| 可视化器文件 | 对应数据结构 | 关键导出 |
|------------|------------|---------|
| `arrayVisualizer.ts` | 数组 | `renderArray`, `animateInsert`, `animateDelete`, `animateSearch` |
| `stackVisualizer.ts` | 栈 | `renderStack`, `animatePush`, `animatePop`, `animatePeek` |
| `queueVisualizer.ts` | 队列 | `renderQueue`, `animateEnqueue`, `animateDequeue`, `animatePeek` |
| `linkedListVisualizer.ts` | 链表 | `renderLinkedList`, `animateInsertHead/Tail/At`, `animateDelete`, `animateReverse`, `animateDetectCycle` |
| `treeVisualizer.ts` | 二叉树 | `renderTree`, `animateInsert/Delete/Search`, `animatePreorder/Inorder/Postorder/Levelorder` |
| `graphVisualizer.ts` | 图 | `renderGraph`（力导向）, `INITIAL_NODES`, `INITIAL_LINKS`, 拖拽支持 |
| `hashVisualizer.ts` | 哈希表 | `renderHash`, `animateInsert/Remove/Search` |
| `heapVisualizer.ts` | 堆 | `renderHeap`, `animateInsert`, `animateExtractMax` |
| `trieVisualizer.ts` | 字典树 | `renderTrie`, `animateInsert/Remove/Search` |
| `sortVisualizer.ts` | 排序 | `renderSortBars`, `animateCompare`, `animateSwap`, `animateSorted` |
| `skipListVisualizer.ts` | 跳表 | `renderSkipList`, `animateInsert`, `animateDelete`, `animateSearch` |
| `unionFindVisualizer.ts` | 并查集 | `renderUnionFind`, `animateUnion`, `animateFind`, `animateMakeSet` |
| `redBlackTreeVisualizer.ts` | 红黑树 | `renderRedBlackTree`, `animateInsert`, `animateDelete`, `animateSearch`, `animateRotation` |
| `visualizerConstants.ts` | 共享常量 | `DEFAULT_NODE_RADIUS`（tree/avlTree/trie/heap 共用）, `DEFAULT_LEVEL_HEIGHT`（tree/avlTree 共用） |

### 3.6 Algorithms 层职责

**排序算法 `sorting/index.ts`（注册制，8 种）**：
- `bubble`（冒泡）、`selection`（选择）、`insertion`（插入）、`quick`（快速）
- `merge`（归并）、`heap`（堆排序）、`radix`（基数）、`bucket`（桶排序）
- 通过 `registerSortAlgorithm(key, algo)` 注册到 `registry: Map`
- 通过 `getSortAlgorithm(key)` / `getAllSortAlgorithms()` 查询
- 每个算法实现 `SortAlgorithm` 接口：`execute(arr, animationFns, svgRef, dimensions, anim, callbacks)`
- 动画函数由调用方注入（`SortAnimationFns`），实现算法与可视化解耦

**图算法 `graph/`（4 种，直接导出）**：
- `bfs.ts`：广度优先搜索
- `dfs.ts`：深度优先搜索（递归实现）
- `dijkstra.ts`：最短路径（含 `distances` / `previousNodes`）
- `topoSort.ts`：拓扑排序（含 `isDAG` 判定）
- 统一返回 `GraphAlgorithmResult`：`{ visited, edges, steps }`
- 通过 `onStep` 回调实现步进式可视化

**高级数据结构算法（3 种，直接导出）**：
- `skipList.ts`：跳表算法（多层链表 + 概率平衡 + 搜索/插入/删除）
- `unionFind.ts`：并查集算法（路径压缩 + 按秩合并 + 连通性查询）
- `redBlackTree.ts`：红黑树算法（插入 + fixup + 左右旋转 + 着色，递归对象表示 + 深拷贝不可变更新）

### 3.7 Utils 层职责（11 个工具模块）

| 工具文件 | 职责 |
|---------|------|
| `animationEngine.ts` | **动画引擎核心**。全局速度倍率、5 种预设、性能模式、FPS 监控、`duration()`/`wait()`/`transition()`/`createAnimation()`/`sequence()`/`highlightElement()` 等。所有动画时长的唯一来源 |
| `d3Imports.ts` | **D3 统一导入**。解决 Vite 预打包导致 `d3-transition` 原型补丁失效的双实例问题。导出 select/selectAll/drag/force*/ease* |
| `validate.ts` | **输入验证**。`sanitizeInput`（XSS 过滤）、`validateNumericInput`、`getValidationError`、`validateImportData` |
| `themeColors.ts` | **主题颜色系统**。4 套调色板 × light/dark，`getColors()`/`detectDarkMode()`/`ensureGradientDefs()`/`gradUrl()`，基于外部 store + `useSyncExternalStore` |
| `dataExport.ts` | 数据导出/导入 JSON 文件 |
| `shareUtils.ts` | URL 数据编解码（`btoa(encodeURIComponent(json))`，限 4000 字符） |
| `debounce.ts` | 防抖工具（带 `cancel` 方法） |
| `timeslicing.ts` | 时间切片：`yieldToMain()`（rAF + setTimeout）、`runWithTimeSlicing()` |
| `errorHandler.ts` | 统一错误处理：`handleAnimationError` / `handleOperationError` |
| `performanceLogger.ts` | 性能日志：FPS 记录、函数耗时记录、内存记录 |
| `sentry.ts` | Sentry 错误监控初始化（仅生产环境） |

### 3.8 配置系统

**学习模式配置 `src/configs/learning/`（37 个配置文件）**：

| 类别 | 配置文件 |
|------|---------|
| 数据结构 | `array.config`、`stack.config`、`queue.config`、`linkedlist.config`、`doublyLinkedList.config`、`tree.config`、`hash.config`、`heapStructure.config`、`trie.config`、`graph.config`、`skipList.config`、`unionFind.config`、`redBlackTree.config` |
| 排序算法 | `bubble.config`、`selection.config`、`insertion.config`、`quick.config`、`merge.config`、`heap.config`、`radix.config`、`bucket.config` |
| 图算法 | `bfs.config`、`dfs.config`、`dijkstra.config`、`topoSort.config` |
| 树遍历 | `treePreorder.config`、`treeInorder.config`、`treePostorder.config`、`treeLevelorder.config` |
| 拓展主题 | `complexityAnalysis.config`、`advancedDataStructures.config`、`realWorldApplications.config` |

**学习路径配置 `src/configs/learningPath.ts`**：
- 定义 `LEARNING_PATH: LearningPathNode[]`，描述 15 个数据结构的学习顺序与依赖
- 字段：`id` / `nameKey` / `descriptionKey` / `path` / `category`（linear/tree/graph/hash/sort/advanced）/ `prerequisites` / `difficulty`（1-3）

**全局搜索索引 `src/data/searchIndex.ts`**：
- 聚合数据结构 / 算法 / 页面元数据供 `GlobalSearch` 组件检索
- 复用 `Sidebar.tsx` 导出的 `STRUCTURE_KEYS` 保持导航一致性

---

## 4. 关键类与核心函数详解

### 4.1 animationEngine 核心 API

文件路径：`src/utils/animationEngine.ts`

#### 4.1.1 核心动画函数

| 函数名 | 参数 | 返回值 | 用途 |
|--------|------|--------|------|
| `duration(baseMs, dataLength?)` | `baseMs: number`, `dataLength?: number` | `number` (毫秒) | 计算实际动画时长，综合考虑 skipAnimationFlag、性能模式、FPS 因子和速度倍率。公式：`(baseMs * perfFactor * fpsFactor) / speedMultiplier` |
| `wait(baseMs, anim?)` | `baseMs: number`, `anim?: Animation` | `Promise<void>` | 异步等待，受 speedMultiplier 影响；若传入 anim，则将 setTimeout id 注册到 `anim._pendingTimers`，abort 时清理所有计时器 |
| `transition(selectionFn, props, baseMs?, easing?)` | `selectionFn: () => Selection`, `props: TransitionProps`, `baseMs=300`, `easing=easeCubicOut` | `Promise<void>` | 创建 D3 transition Promise，同时监听 'end' 和 'interrupt' 事件，防止中断时 Promise 永不 resolve |
| `transitionEnd(transition)` | `transition: D3Transition` | `Promise<void>` | 包装 D3 过渡为 Promise，监听 end/interrupt 事件 |
| `sequence(steps)` | `steps: AnimationStep[]` | `Promise<void>` | 顺序执行多个动画步骤，每步可带 wait |
| `createAnimation()` | 无 | `Animation` | 创建可中止的动画控制对象 |
| `safeAnimate(animationFn, label?)` | `animationFn: () => Promise<void>`, `label?: string` | `Promise<void>` | 安全执行动画，捕获异常并通过 toast 提示 |

#### 4.1.2 辅助动画函数

| 函数名 | 参数 | 返回值 | 用途 |
|--------|------|--------|------|
| `highlightElement(container, selector, fillColor, strokeColor, baseMs?)` | container, selector, fillColor, strokeColor, baseMs=200 | `Promise<void>` | 高亮元素（fill + stroke 过渡） |
| `fadeOutElement(container, selector, transform?, baseMs?)` | container, selector, transform?, baseMs=300 | `Promise<void>` | 淡出元素 |
| `fadeInElement(container, selector, transform?, baseMs?)` | container, selector, transform?, baseMs=300 | `Promise<void>` | 淡入元素 |
| `moveElements(container, selector, transformFn, baseMs?, easing?)` | container, selector, transformFn, baseMs=300, easing? | `Promise<void>` | 使用 tween 移动多个元素 |

#### 4.1.3 速度与预设控制

| 函数名 | 参数 | 返回值 | 用途 |
|--------|------|--------|------|
| `setAnimationSpeed(speed)` | `speed: number` | `void` | 设置全局速度倍率 |
| `getAnimationSpeed()` | 无 | `number` | 获取当前速度倍率 |
| `setDefaultEasing(easing)` | `(t: number) => number` | `void` | 设置默认缓动函数 |
| `applyPreset(presetKey)` | `presetKey: string` | `void` | 应用预设（同时设置 speed、easing、skip） |
| `getCurrentPreset()` | 无 | `string` | 获取当前预设 key |
| `setSkipAnimation(skip)` / `getSkipAnimation()` | `boolean` / 无 | `void` / `boolean` | 控制"瞬时"模式 |

#### 4.1.4 性能模式

| 函数名 | 参数 | 返回值 | 用途 |
|--------|------|--------|------|
| `getPerformanceMode(dataLength?)` | `dataLength=0` | `'normal' \| 'medium' \| 'high' \| 'critical'` | 根据数据量分级：>40 critical, >25 high, >15 medium, 否则 normal |
| `getPerformanceFactor(dataLength?)` | `dataLength=0` | `number` | 返回性能因子：critical=0.25, high=0.5, medium=0.75, normal=1 |

#### 4.1.5 FPS 监控

| 函数名 | 参数 | 返回值 | 用途 |
|--------|------|--------|------|
| `startFPSMonitoring()` | 无 | `void` | 启动 requestAnimationFrame 循环测量 FPS |
| `stopFPSMonitoring()` | 无 | `void` | 停止监控并重置 currentFPS=60 |
| `getCurrentFPS()` | 无 | `number` | 获取当前 FPS（用于 duration() 中的 fpsFactor 计算） |
| `measureRender<T>(label, fn)` | `label: string`, `fn: () => T` | `T` | 测量同步/异步渲染函数耗时，>16ms 输出警告 |
| `withRenderPerf<T>(fn, label)` | `fn: T`, `label: string` | `T` | 同步渲染性能包装器 |

#### 4.1.6 关键常量与类型

- `ANIMATION_PRESETS`：5 个预设（default/gentle/snappy/dramatic/instant）
- `EASING`：12 种缓动函数映射
- `Animation` 接口：`{ promise, abort, isAborted, resolve, reject, _pendingTimers? }`
- `AnimationStep` 接口：`{ action, wait?, anim? }`
- `TransitionProps` 接口：`{ attr?, style?, tween? }`

#### 4.1.7 5 种动画预设

| 预设 | 速度 | 缓动 | 跳过 |
|------|------|------|------|
| `default` | 1× | easeCubicOut | 否 |
| `gentle` | 0.5× | easeQuadInOut | 否 |
| `snappy` | 2× | easeCubicOut | 否 |
| `dramatic` | 1× | easeElasticOut | 否 |
| `instant` | 4× | easeLinear | 是 |

#### 4.1.8 使用示例

```typescript
import { createAnimation, duration, wait, highlightElement } from '@/utils/animationEngine'

// 创建可中止动画
const anim = createAnimation()

try {
  // 高亮元素（时长受全局速度倍率影响）
  await highlightElement(container, '.target', '#ff0000', '#000', 300)
  
  // 等待（受速度倍率影响，可被 abort 中断）
  await wait(500, anim)
  
  // 每步检查中止
  if (anim.isAborted()) return
} catch (err) {
  // 错误处理
} finally {
  setIsAnimating(false)
}
```

### 4.2 validate 核心 API

文件路径：`src/utils/validate.ts`

| 函数名 | 参数 | 返回值 | 用途 |
|--------|------|--------|------|
| `sanitizeInput(value, maxLength?)` | `value: string \| number`, `maxLength=100` | `string` | XSS 清理：trim + 截断 + 正则移除 `<>"'\`&;\\` 字符 |
| `validateNumericInput(value, min?, max?)` | `value: string \| number`, `min=1`, `max=99` | `{ valid: boolean, value: number }` | 数值验证：NaN/Infinity 检测 + 范围检查 |
| `getValidationError(value, min?, max?)` | `value: string \| number`, `min=1`, `max=99` | `string \| null` | 返回国际化错误消息（null 表示通过） |
| `validateImportData(data, maxSize?, minValue?, maxValue?)` | `data: unknown`, `maxSize=200`, `minValue=-999`, `maxValue=999` | `ImportValidationResult` | 导入数据验证：非空数组 + 长度限制 + 元素为有限整数 + 值域检查 |

**使用示例**：

```typescript
import { getValidationError, validateImportData } from '@/utils/validate'

// 数值验证
const error = getValidationError(userInput, 1, 99)
if (error) {
  showToast(error, 'error')
  return
}

// 导入数据验证
const result = validateImportData(parsedJson, 200, -999, 999)
if (!result.valid) {
  showToast(result.error, 'error')
  return
}
```

### 4.2.1 schema 校验（localStorage / import 数据白名单）

文件路径：`src/utils/schema.ts`

| 函数/常量 | 说明 |
|-----------|------|
| `MAX_STORAGE_DEPTH` | 允许的最大嵌套深度，默认 `10` |
| `validateStoredData(data)` | 验证未知数据是否为合法的 JSON-like 结构；拒绝 `undefined`、非有限数字、函数、`Date`、`Symbol`、空对象/数组、超过深度限制的嵌套 |

**使用位置**：
- `src/hooks/useDataStructureState.ts` 的 `loadFromStorage`：读取 localStorage 后立即校验，失败则清除并回退 `initialData`
- 未来 import 恢复流程可复用同一 schema，避免 `validateImportData` 与存储校验行为分裂

**示例**：

```typescript
import { validateStoredData } from '@/utils/schema'

const result = validateStoredData(parsedJson)
if (!result.valid) {
  console.warn('Invalid stored data:', result.error)
  // 回退到默认值或提示用户
}
```

### 4.3 useHistory API 详解

文件路径：`src/hooks/useHistory.ts`

#### 4.3.1 设计特点

- **基于 useRef 而非 useState 存储历史栈**：避免历史变化触发不必要的重渲染
- **最大 20 步**：超过时 `shift()` 移除最旧记录
- **canUndo/canRedo 用 ref 缓存**：避免每次渲染重新计算

#### 4.3.2 API 表格

| 方法 | 签名 | 用途 |
|------|------|------|
| `state` | `T` | 当前状态（触发渲染） |
| `setState` | `(newState: T) => void` | 直接设置状态（不入历史栈） |
| `push` | `(newState: T) => void` | 推入新状态到历史栈，截断 redo 分支 |
| `undo` | `() => T \| null` | 撤销，返回上一状态；无可撤销时返回 null |
| `redo` | `() => T \| null` | 重做，返回下一状态 |
| `reset` | `(newInitial: T) => void` | 重置历史栈为单元素 [newInitial] |
| `canUndo` | `() => boolean` | 是否可撤销 |
| `canRedo` | `() => boolean` | 是否可重做 |
| `getHistory` | `() => T[]` | 获取完整历史数组 |
| `getCurrentIndex` | `() => number` | 当前索引 |
| `getUndoPreview` | `() => T \| null` | 预览撤销后的状态（不实际撤销） |
| `getRedoPreview` | `() => T \| null` | 预览重做后的状态 |

#### 4.3.3 使用示例

```typescript
const { state, push, undo, redo, canUndo, canRedo } = useHistory<number[]>([1, 2, 3])

push([1, 2, 3, 4])    // state = [1,2,3,4], history = [[1,2,3], [1,2,3,4]]
push([1, 2, 3, 4, 5]) // state = [1,2,3,4,5]
undo()                // 返回 [1,2,3,4], state = [1,2,3,4]
redo()                // 返回 [1,2,3,4,5], state = [1,2,3,4,5]
push([9])             // 截断 redo 分支, history = [..., [9]]
```

### 4.4 useDataStructureState API 详解

文件路径：`src/hooks/useDataStructureState.ts`

#### 4.4.1 职责

通用状态管理 hook，封装了 useHistory + localStorage 持久化 + 日志 + 动画锁 + toast 提示。是所有 12 个数据结构 hook 的基座。

#### 4.4.2 API 表格

| 返回字段 | 类型 | 用途 |
|---------|------|------|
| `data` | `T` | 当前数据状态 |
| `logs` | `LogEntry[]` | 操作日志（最多 100 条） |
| `isAnimating` | `boolean` | 是否正在动画中 |
| `setIsAnimating` | `(value: boolean) => void` | 设置动画状态（含 15s 超时自动解锁 + toast 警告） |
| `push` | `(newState: T) => void` | 推入历史栈 |
| `addLog` | `(type: string, message: string) => void` | 添加日志 |
| `reset` | `() => void` | 重置到 initialData，清空日志和 localStorage |
| `clearLogs` | `() => void` | 清空日志 |
| `loadData` | `(newData: T) => void` | 加载新数据（重置历史栈） |
| `clearPersist` | `() => void` | 清除 localStorage 持久化 |
| `undo` | `() => void` | 撤销（带动画锁检查 + toast） |
| `redo` | `() => void` | 重做（带动画锁检查 + toast） |
| `canUndo` / `canRedo` | `() => boolean` | 历史栈状态 |
| `getHistory` / `getCurrentIndex` / `getUndoPreview` / `getRedoPreview` | 各种 | 历史栈查询 |

#### 4.4.3 关键实现细节

1. **localStorage 防抖写入**（500ms）：避免高频操作时频繁 I/O
2. **beforeunload 刷新保护**：页面卸载前 flush 待写入数据
3. **动画超时保护**：`setIsAnimating(true)` 后启动 15s 计时器，超时自动解锁并 toast 警告
4. **isValidStoredData 校验**：加载时校验数据结构有效性
5. **undo/redo 动画锁**：`if (isAnimating || !canUndo()) return`

### 4.5 代表性 use*State hook 完整 API 文档

#### 4.5.1 useArrayState

文件路径：`src/hooks/useArrayState.ts`

**常量**：`INITIAL_DATA = [8, 3, 12, 5, 9]`, `MAX_SIZE = 20`

**返回值 API**：

| 字段 | 类型 | 用途 |
|------|------|------|
| `data` | `number[]` | 当前数组 |
| `logs` | `LogEntry[]` | 操作日志 |
| `isAnimating` | `boolean` | 动画状态 |
| `setIsAnimating` | `(v: boolean) => void` | 设置动画状态 |
| `insert(rawValue, index)` | `(string \| number, number) => boolean` | 在 index 处插入值，成功返回 true |
| `remove(index)` | `(number) => number \| null` | 删除 index 处元素，返回被删值 |
| `search(value)` | `(number) => number` | 搜索值，返回索引（-1 表示未找到） |
| `randomize()` | `() => void` | 生成 8 个随机数（1~99） |
| `reset` / `loadData` / `undo` / `redo` / `canUndo` / `canRedo` / `getUndoPreview` / `getRedoPreview` | 各种 | 继承自 useDataStructureState |

**使用示例**：

```typescript
function ArrayPage() {
  const { data, insert, remove, search, undo, redo, isAnimating } = useArrayState()
  
  const handleInsert = () => {
    if (isAnimating) return
    insert(42, 2)  // 在索引 2 处插入 42
  }
  
  return <div>{data.join(', ')}</div>
}
```

#### 4.5.2 useStackState

文件路径：`src/hooks/useStackState.ts`

**常量**：`INITIAL_DATA = [8, 17, 42]`, `MAX_SIZE = 10`

**返回值 API**：

| 字段 | 类型 | 用途 |
|------|------|------|
| `data` | `number[]` | 栈数据（数组末尾为栈顶） |
| `size` | `number` | `data.length` 的便捷别名 |
| `push(value)` | `(string \| number) => boolean` | 压栈，成功返回 true |
| `pop()` | `() => number \| null` | 弹栈，返回栈顶值；空栈返回 null |
| `peek()` | `() => number \| null` | 查看栈顶（不弹出） |
| `clear()` | `() => void` | 清空栈 |
| 其他继承字段 | - | 同 useArrayState |

**使用示例**：

```typescript
function StackPage() {
  const { data, push, pop, peek, size } = useStackState()
  
  push(99)           // 压入 99
  const top = pop()  // 弹出栈顶
  peek()             // 查看栈顶
}
```

### 4.6 代表性 visualizer 渲染函数文档

#### 4.6.1 arrayVisualizer

文件路径：`src/visualizers/arrayVisualizer.ts`

**常量**：`RECT_WIDTH=60`, `RECT_HEIGHT=50`, `INDEX_LABEL_HEIGHT=20`, `GAP=10`, `LARGE_DATA_THRESHOLD=50`

**核心函数签名**：

```typescript
// 纯静态渲染
export function renderArray(
  svg: SVGSVGElement,
  data: number[],
  options: ArrayVisualizerOptions = { width: 800, height: 400 }
): void

// 插入动画（4 阶段：指示器弹入 → 右侧元素让位 → 指示器消失 → 颜色脉冲恢复）
export async function animateInsert(
  svg: SVGSVGElement,
  index: number,
  _value: number,
  oldData: number[],
  options: ArrayVisualizerOptions,
  anim?: Animation
): Promise<void>

// 删除动画（3 阶段：变红脉冲 → 缩小滑出 → 右侧合拢）
export async function animateDelete(
  svg: SVGSVGElement,
  index: number,
  _data: number[],
  options: ArrayVisualizerOptions,
  anim?: Animation
): Promise<void>

// 搜索动画（逐个检查 + 缩放脉冲 + 找到时两阶段高亮）
export async function animateSearch(
  svg: SVGSVGElement,
  index: number,
  data: number[],
  options: ArrayVisualizerOptions,
  anim?: Animation
): Promise<void>
```

**实现模式亮点**：

1. **purgeSVG 彻底清理**：不仅 `selectAll('*').remove()`，还先 `interrupt()` 所有过渡 + 删除 D3 内部 `__` 前缀属性
2. **纯 DOM API 创建元素**：`renderArray` 使用 `document.createElementNS` 而非 D3 的 `append().attr()` 模式
3. **大数据量跳过动画**：`if (oldData.length > LARGE_DATA_THRESHOLD) return`
4. **无障碍支持**：每个 `g.array-item` 设置 `tabindex=0`、`role=group`、`aria-label`
5. **每步检查 abort**：`if (anim?.isAborted?.()) return`

#### 4.6.2 stackVisualizer

文件路径：`src/visualizers/stackVisualizer.ts`

**常量**：`RECT_WIDTH=80`, `RECT_HEIGHT=50`, `GAP=8`, `BASE_DURATION=400`, `LARGE_DATA_THRESHOLD=30`

**核心函数签名**：

```typescript
export function renderStack(
  svg: SVGSVGElement,
  data: number[],
  options: StackVisualizerOptions = { width: 800, height: 400 }
): void

export async function animatePush(
  svg: SVGSVGElement,
  value: number,
  data: number[],
  options: StackVisualizerOptions,
  anim?: Animation
): Promise<void>

export async function animatePop(
  svg: SVGSVGElement,
  data: number[],
  options?: StackVisualizerOptions,
  anim?: Animation
): Promise<void>

export async function animatePeek(
  svg: SVGSVGElement,
  data: number[],
  options?: StackVisualizerOptions,
  anim?: Animation
): Promise<void>
```

### 4.7 代表性算法实现说明

#### 4.7.1 冒泡排序（sorting/index.ts 内联注册）

**注册方式**：`registerSortAlgorithm('bubble', { ... })`

**算法签名**：

```typescript
execute: (
  arr: number[],
  animationFns: SortAnimationFns,  // { animateCompare, animateSwap, animateSorted, renderSortBars }
  svgRef: React.RefObject<SVGSVGElement | null>,
  dimensions: { width: number; height: number },
  anim: Animation | undefined,
  callbacks: SortCallbacks,         // { onStep?, onCompare?, onSwap? }
) => Promise<SortResult>            // { comparisons, swaps, steps, aborted? }
```

**实现要点**：

1. **标准双层循环**：外层 `i` 从 0 到 n-1，内层 `j` 从 0 到 n-i-1
2. **每步中止检查**：`if (anim?.isAborted?.()) return { ..., aborted: true }`
3. **动画与状态分离**：先 `await animateCompare(...)` 高亮比较，若需交换则 `await animateSwap(...)` 后**原地修改 arr** 并 `renderSortBars(...)` 重绘
4. **进度回调**：`callbacks.onCompare?.(comparisons, Math.round((comparisons / total) * 100))`

#### 4.7.2 BFS（graph/bfs.ts）

**函数签名**：

```typescript
export async function bfs(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<GraphAlgorithmResult>
```

**返回类型**：

```typescript
interface GraphAlgorithmResult {
  visited: string[]
  edges: Array<{ from: string; to: string }>
  steps: Array<{
    type: string  // 'init' | 'visit' | 'edge'
    node?: string
    edge?: { from: string; to: string }
    queue?: string[]
  }>
}
```

**与排序算法的架构差异**：

| 维度 | 排序算法 | 图算法 (BFS) |
|------|---------|-------------|
| 动画驱动 | 实时 await animateXxx | 步骤快照收集 + 后续回放 |
| 状态修改 | 原地修改 arr | 不修改输入 adjacencyList |
| 中止机制 | anim.isAborted 检查 | 无中止机制（BFS 本身很快） |
| 注册方式 | registerSortAlgorithm 注册表 | graph/index.ts 静态导出 |

### 4.8 关键组件 Props 文档

#### 4.8.1 Visualizer 组件

文件路径：`src/components/Visualizer.tsx`

```typescript
interface VisualizerProps {
  data: unknown                                    // 待渲染数据
  renderFn: (svg, data, dimensions) => void        // 渲染函数
  svgRef: React.RefObject<SVGSVGElement>           // SVG 元素 ref
  dimensions: { width: number; height: number }    // 画布尺寸
  containerRef: React.RefObject<HTMLDivElement>    // 容器 div ref
  className?: string                               // 额外样式
  ariaLabel?: string                               // 无障碍标签
  renderOptions?: Record<string, unknown>          // 透传给 renderFn 的额外选项
  overlay?: ReactNode                              // 覆盖层（如 EmptyState）
}
```

**职责**：渲染调度、缩放控制（0.5~2.0）、平移控制、网格切换、viewBox 计算、性能监控

#### 4.8.2 OperationGroup 组件

文件路径：`src/components/OperationGroup.tsx`

```typescript
interface OperationGroupProps {
  children: ReactNode        // 折叠内容
  label?: string             // 按钮文本（默认 t('common.more')）
  defaultOpen?: boolean      // 默认是否展开（默认 false）
  className?: string         // 额外样式
}
```

**折叠机制**：三态渲染控制（`isOpen` / `shouldRender` / `maxHeight`）。**折叠状态下 children 不渲染到 DOM**——测试时必须先展开才能找到内部按钮。

#### 4.8.3 EmptyState 组件

文件路径：`src/components/EmptyState.tsx`

```typescript
interface EmptyStateProps {
  icon?: string                  // 图标字符（默认 '∅'）
  titleKey?: string              // 标题 i18n key
  title?: string                 // 直接标题（覆盖 titleKey）
  descriptionKey?: string        // 描述 i18n key
  description?: string           // 直接描述
  onFill?: () => void            // 填充回调
  fillKey?: string               // 按钮文本 i18n key
}
```

**实现要点**：外层 `pointer-events-none`（不阻挡底层交互），内层内容 `pointer-events-auto`（按钮可点击）

#### 4.8.4 Sidebar 组件

文件路径：`src/components/Sidebar.tsx`

**导航结构**：16 个导航项（home/array/stack/queue/linkedlist/tree/graph/sort/hash/heap/trie/skip-list/union-find/red-black-tree/compare/graphAlgorithm）

**功能**：响应式（桌面 sticky + 移动抽屉）、主题控制（4 色 + 明暗 + 语言）、无障碍（`aria-current` / `aria-expanded`）、移动端手势（左滑关闭）、导出 `STRUCTURE_KEYS` 数组供 `GlobalSearch` 等模块复用

---

## 5. 模块间与组件间依赖关系

### 5.1 依赖关系图

```
┌─────────────────────────────────────────────────────────────────┐
│                        入口层                                    │
│  main.tsx → App.tsx (BrowserRouter, lazy 路由)                   │
│       ↓                                                          │
│  Pages (Home, ArrayPage, StackPage, ... 13 个)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐
│   组件层         │ │  Hooks 层    │ │  Visualizer 层    │
│                 │ │             │ │                  │
│ Visualizer.tsx  │ │ use*State   │ │ arrayVisualizer  │
│ OperationGroup  │ │ (11 个)     │ │ stackVisualizer  │
│ EmptyState      │ │   ↓         │ │ ... (10 个)      │
│ Sidebar         │ │ useDataStructureState │                  │
│ OperationBar    │ │   ↓         │ │                  │
│ toastStore      │ │ useHistory  │ │                  │
│ LearningPath    │ │             │ │                  │
└────────┬────────┘ └──────┬──────┘ └────────┬─────────┘
         │                 │                 │
         │                 │   ┌─────────────┤
         │                 ↓   ↓             ↓
         │          ┌────────────────────────────┐
         │          │       工具层 (utils)        │
         │          │                            │
         │          │ animationEngine.ts ←─ d3Imports.ts
         │          │       ↑                    │
         │          │ validate.ts                │
         │          │ themeColors.ts             │
         │          │ performanceLogger.ts       │
         │          └────────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│        算法层 (algorithms)       │
│                                 │
│ sorting/index.ts (注册表模式)    │
│   - bubble, quick, merge, ...   │
│                                 │
│ graph/ (静态导出)                │
│   - bfs.ts, dfs.ts              │
│   - dijkstra.ts, topoSort.ts    │
└─────────────────────────────────┘
```

### 5.2 关键依赖链

1. **渲染链**：`Page → use*State → useDataStructureState → useHistory`；`Page → Visualizer → renderFn (visualizer) → animationEngine → d3Imports`
2. **动画链**：`use*State.setIsAnimating → Page 调用 animateXxx → animationEngine.duration/wait/transition → D3 transition`
3. **持久化链**：`use*State 操作 → useDataStructureState.push → useHistory.push + useEffect 防抖 → localStorage`
4. **算法链**：`SortPage → useSortState → getSortAlgorithm(key).execute → animateCompare/Swap → renderSortBars`
5. **i18n 链**：`所有组件 → useGlobalSettings.t() / tStatic() → locales.ts`

### 5.3 循环依赖检查

未发现循环依赖。依赖方向单向清晰：
- `animationEngine` 依赖 `d3Imports` 和 `toastStore`/`i18n`
- `visualizer` 依赖 `animationEngine` 和 `d3Imports` 和 `themeColors`
- `hooks` 依赖 `useDataStructureState` 和 `validate`

---

## 6. 项目环境配置要求

### 6.1 Node 版本

- **CI 矩阵**：Node 20 + Node 22
- **Deploy**：Node 20
- **建议本地**：Node 20+（无 `.nvmrc` 强制约束）

### 6.2 环境变量

- **无 `.env` / `.env.example`**（项目无环境变量需求，配置全在代码中）
- **E2E 用的环境变量**：`BROWSER`（`chromium` 或 `firefox`，默认 chromium）

### 6.3 操作系统

跨平台支持（Windows / macOS / Linux）。PowerShell 兼容命令。

### 6.4 浏览器支持

现代浏览器（Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+）。不支持 IE。

### 6.5 外部服务依赖

- **字体源**：`fonts.loli.net` 和 `gstatic.loli.net`（JetBrains Mono + Noto Sans SC）
- **错误监控**：Sentry（仅生产环境，需配置 DSN）
- **部署平台**：GitHub Pages

---

## 7. 构建与运行步骤

### 7.1 完整命令清单

```bash
# 依赖安装
npm install

# 开发环境
npm run dev                              # Dev server @ localhost:3000/Data-Structures-Visualized/

# 生产构建
npm run build                            # 生产构建 + bundle 体积检查
npm run build:analyze                    # 构建 + 生成 dist/stats.html 可视化报告

# 预览
npm run preview                          # 预览生产构建

# 代码检查
npm run lint                             # ESLint

# 单元测试
npm run test                             # Vitest watch 模式
npm run test:run                         # Vitest 单次运行（CI 用）
npm run test:coverage                    # Vitest + v8 coverage

# E2E 测试（需先启动 dev server）
node e2e/run-all-tests.js                # 全量 E2E（chromium + firefox）
BROWSER=firefox node e2e/test-home.js    # 单文件 + 指定浏览器
node e2e/test-comprehensive.js           # 12 个数据结构综合测试
node e2e/test-interactions.js            # 跨模块交互
node e2e/test-persistence.js             # 持久化测试
```

### 7.2 开发环境步骤

1. **克隆仓库**：
   ```bash
   git clone <repo-url>
   cd 数据结构学习助手3
   ```

2. **安装依赖**：
   ```bash
   npm install
   ```

3. **启动开发服务器**：
   ```bash
   npm run dev
   ```
   - 自动打开浏览器
   - 访问地址：`http://localhost:3000/Data-Structures-Visualized/`
   - 支持 Hot Module Replacement (HMR)

4. **代码检查**（可选）：
   ```bash
   npm run lint
   ```

5. **运行单元测试**（可选）：
   ```bash
   npm run test          # watch 模式
   npm run test:run      # 单次运行
   ```

### 7.3 生产环境构建步骤

1. **构建**：
   ```bash
   npm run build
   ```
   - 输出到 `dist/` 目录
   - 自动执行 `scripts/check-bundle.js` 检查包体积
   - 超预算则构建失败

2. **构建产物结构**：
   ```
   dist/
   ├── index.html              # 入口 HTML
   ├── favicon.svg
   ├── manifest.json           # PWA manifest
   ├── icons.svg
   ├── 404.html                # GitHub Pages SPA fallback
   ├── sw.js                   # PWA service worker
   ├── workbox-*.js            # Workbox 运行时
   └── assets/
       ├── index-[hash].js     # 应用代码（预算 < 80KB）
       ├── vendor-react-[hash].js  # React 全家桶（预算 < 250KB）
       ├── vendor-d3-[hash].js     # D3 全家桶（预算 < 60KB）
       ├── index-[hash].css    # Tailwind 产物
       └── ...其他按需 chunk
   ```

3. **本地预览生产构建**：
   ```bash
   npm run preview
   ```

4. **Bundle 分析**：
   ```bash
   npm run build:analyze
   ```
   - 生成 `dist/stats.html`，自动打开浏览器查看

### 7.4 部署步骤（GitHub Pages）

项目已配置 GitHub Actions 自动部署（`.github/workflows/deploy.yml`）：

1. **触发条件**：push 到 main/master 分支
2. **流程**：
   - checkout 代码
   - setup Node 20
   - `npm ci`
   - `npm run build`
   - configure-pages
   - upload-pages-artifact（`./dist`）
   - deploy-pages
3. **访问地址**：`https://<username>.github.io/Data-Structures-Visualized/`

### 7.5 Bundle 优化策略

#### 7.5.1 manualChunks 分包

```javascript
manualChunks(id) {
  if (id.includes('node_modules/react') || 
      id.includes('node_modules/react-dom') || 
      id.includes('node_modules/react-router')) {
    return 'vendor-react';
  }
  if (id.includes('node_modules/d3-')) {
    return 'vendor-d3';
  }
}
```

#### 7.5.2 Size 预算机制

| Chunk | 预算 | 说明 |
|-------|------|------|
| `index` | 80 KB | 应用主代码 |
| `vendor-react` | 250 KB | React + ReactDOM + React Router |
| `vendor-d3` | 60 KB | D3 全家桶 |

#### 7.5.3 其他优化

- **代码分割**：App.tsx 用 `React.lazy` 懒加载 17 个页面
- **D3 预构建**：`optimizeDeps.include` 减少 dev 启动时间
- **PWA 缓存**：静态资源 + 字体 CacheFirst

---

## 8. 测试策略与执行方法

### 8.1 测试体系总览

项目采用**三层测试体系**：

| 层级 | 工具 | 文件数 | 说明 |
|------|------|--------|------|
| 单元测试 | Vitest + React Testing Library | 118 个 | 覆盖 hooks/components/utils/visualizers/pages |
| E2E 测试 | Playwright | 2 个 `.spec.ts` + 原有自定义 runner | 跨浏览器（chromium + firefox），a11y 动态覆盖 17 页 |
| 质量检查 | 自定义脚本 | 1 个 | `scripts/check-bundle.js` |

**当前测试基线**：2234 个单元测试，0 失败，全部通过；Playwright 20 个 spec 全绿。

### 8.2 单元测试

#### 8.2.1 测试环境配置

- **环境**：jsdom
- **Setup 文件**：`src/__tests__/setup.ts`
- **全局**：`globals: true`（`describe`/`it`/`expect`/`vi` 全局可用）
- **Mock 项**：`window.matchMedia`、`requestAnimationFrame`、`SVGElement.prototype.getAttribute`、`SVGElement.prototype.transform`
- **Coverage**：v8 provider，排除 `__tests__/`、`main.tsx`、`App.tsx`

#### 8.2.2 测试文件分布

| 类别 | 数量 | 说明 |
|------|------|------|
| 页面测试（`pages/`） | 17 个 + testUtils.tsx | 覆盖全部 17 个页面 |
| 可视化器测试（`visualizers/`） | 14 个 + d3MockHelper.ts | 覆盖 14 个 visualizer |
| Hooks 测试 | 22 个 | 覆盖核心 hook（含 useSkipListState / useUnionFindState / useRedBlackTreeState） |
| 组件测试 | 22 个 | Layout/Sidebar/Toast/OperationBar/GlobalSearch 等 |
| 工具/算法测试 | 16 个 | animationEngine/sorting/graph/validate/skipList/unionFind/redBlackTree 等 |

#### 8.2.3 三种典型测试模式

**模式 A：Hook 测试**

```typescript
import { renderHook, act } from '@testing-library/react'
vi.mock('../components/toastStore', () => ({ showToast: vi.fn() }))

const { result } = renderHook(() => useArrayState())
act(() => { result.current.insert(1, 0) })
expect(result.current.data[0]).toBe(1)
```

**模式 B：Visualizer 测试**

```typescript
// 用 Proxy 构造链式 D3 selection mock
function chainable() { /* Proxy 返回自身 */ }
vi.mock('../../utils/d3Imports', () => ({ select: vi.fn(() => chainable()) }))

const { renderArray } = await import('../../visualizers/arrayVisualizer')
expect(() => renderArray(svg, [], { width: 800, height: 400 })).not.toThrow()
```

**模式 C：页面/组件测试**

```typescript
vi.mock('../../hooks/useGlobalSettings')
import { useGlobalSettings } from '../../hooks/useGlobalSettings'
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

renderWithRouter(<Home />)  // 来自 testUtils.tsx，用 MemoryRouter
expect(screen.getByText('array.title')).toBeInTheDocument()
```

### 8.3 E2E 测试

#### 8.3.1 执行入口

```bash
# Playwright Test spec（推荐，自动启动 dev server）
npx playwright test

# 仅 a11y 扫描
node e2e/test-a11y.js

# 原有自定义 runner（需先启动 dev server）
npm run dev &
node e2e/run-all-tests.js

# 单浏览器
BROWSER=firefox node e2e/test-home.js
```

#### 8.3.2 执行策略

1. **Playwright Test spec**：
   - `e2e/a11y.spec.ts`：基于 `STRUCTURE_KEYS` 动态生成 17 页 axe-core 扫描
   - `e2e/home.spec.ts`：首页加载、卡片、控制台错误
   - 配置文件：`playwright.config.ts`，本地自动启动 dev server，CI 中只跑 chromium
2. **原有自定义 runner**：默认对 `chromium` 和 `firefox` 各跑一轮
   - Phase 1（核心测试，并行+错峰）：`test-home.js` / `test-core.js` / `test-advanced.js` / `test-edge.js` / `test-v5-features.js`
   - Phase 2（综合测试，串行）：`test-comprehensive.js` / `test-interactions.js` / `test-persistence.js`
3. **超时**：每个测试文件 300000ms（5 分钟）

#### 8.3.3 测试辅助函数（`e2e/test-helpers.js`）

| 函数 | 作用 |
|------|------|
| `sleep(ms)` | 等待 |
| `retry(fn, maxRetries=3, delay=300)` | 重试包装 |
| `waitForText(page, regex, timeout=5000)` | 轮询等待文本出现 |
| `clickButtonIfEnabled(page, regex, timeout=5000)` | 用 `force: true` 点击，绕过 OperationGroup 动画期间拦截 |
| `closeModalIfOpen(page)` | 按 Escape 关闭模态框 |
| `getVisibleInputs(page)` | 过滤隐藏 input |
| `fillInput(page, input, value)` | click → clear → pressSequentially → Tab |
| `verifyScreenshot(path, minSize=5000)` | 校验截图存在且 ≥5KB |

#### 8.3.4 E2E 测试覆盖维度

- **首页导航**：标题、卡片数量（≥7）、卡片跳转、侧边栏导航
- **核心交互**：Array/Stack/Queue/LinkedList/Tree/Graph/Hash/Heap/Trie/Sort 的插入/删除/查找/重置/随机
- **边界条件**：空值、超过 99、负数、空状态操作
- **v5 功能**：懒加载、撤销预览悬停、分享按钮
- **跨模块**：主题切换、i18n、键盘快捷键
- **持久化**：localStorage 跨刷新、各 DS 的 storage key、边界清除
- **无障碍**：axe-core 动态扫描全部 17 页，0 critical/serious violations

### 8.4 CI/CD 配置

#### 8.4.1 CI 流程（`.github/workflows/ci.yml`）

- **触发**：push/PR 到 main/master
- **矩阵**：Node 20 + Node 22
- **步骤**：checkout → setup-node（带 npm cache）→ `npm ci` → `npm ls --depth=0` → `npm run lint` → `npm run typecheck` → `npm run build` → `npm run test:coverage` → 启动 dev server → Playwright a11y 测试
- **Artifacts**：覆盖率报告、构建产物 `dist/`、E2E 报告（`playwright-report/`、`e2e/test-results.json`、`test-results/`）

#### 8.4.2 部署流程（`.github/workflows/deploy.yml`）

- **触发**：push 到 main/master + `workflow_dispatch`
- **权限**：`pages: write` + `id-token: write`
- **步骤**：checkout → setup-node 20 → `npm ci` → `npm run build` → configure-pages → upload-pages-artifact → deploy-pages

---

## 9. 代码规范与最佳实践

### 9.1 TypeScript 规范

- **路径别名**：`@/*` maps to `src/*`
- **类型声明**：`src/types/*.d.ts`
- **所有源文件为 TypeScript**（`.ts`/`.tsx`）
- **JSX runtime**：`react-jsx`（React 19 自动 runtime）
- **注意**：当前 `strict: true`（tsconfig 启用 `noImplicitAny` + `strictNullChecks` + `noUnusedLocals`）

### 9.2 React 规范

- **函数组件 only**（无 class 组件）
- **所有 hooks 自定义，前缀 `use`**
- **`React.lazy` 代码分割**所有页面
- **`memo` 包裹**纯展示组件
- **`useCallback`/`useMemo`**稳定 props 引用

### 9.3 D3 规范

- **统一从 `src/utils/d3Imports.ts` 导入**，禁止直接 `import 'd3'`
- **D3 selectors 用 `d3.select(svg)`**，禁止 `document.querySelector`
- **全清全渲染策略**：`container.selectAll('*').remove()` 后重新创建
- **SVG 用 `viewBox`**（非 width/height 属性）+ `className="w-full h-full"`

### 9.4 动画规范

- **`animationEngine.ts` 是动画时长的唯一来源**
- **禁止原始 `setTimeout` 或 `d3.transition` 时长**
- **动画只做视觉高亮**，不移动元素、不创建持久 DOM
- **每步检查 `anim?.isAborted?.()`**
- **`try/finally` 中 `setIsAnimating(false)`** 防止页面锁死

### 9.5 状态管理规范

- **无 Redux/Zustand**
- **每个数据结构有自己的 `use*State` hook**
- **所有 hooks 内部使用 `useHistory`**
- **历史存储在 refs，非 state**（避免不必要重渲染）
- **`undoBlock` flag**：不应单独撤销的操作（如整体排序）设置此标志

### 9.6 验证规范

- **`validate.ts` 处理所有输入验证**（XSS sanitization、range checks、import validation）
- **`parseInt` 必须指定 radix 10**
- **localStorage 值必须验证**（白名单校验）
- **数值范围 1-99**（默认）

### 9.7 错误处理规范

- **`showToast` 系统**代替 `alert`
- **`aria-live="assertive"`** 错误 toast
- **`errorHandler.ts`** 统一错误处理
- **Sentry** 生产环境错误监控

### 9.8 无障碍规范

- **SVG `role="img"` + `aria-label`**（via Visualizer 组件 `ariaLabel` prop）
- **所有交互元素 `aria-label` 或可见文本**
- **`t()` 用于所有用户可见字符串**
- **键盘导航**：Arrow 键焦点切换

### 9.9 命名规范

- **文件**：`camelCase.ts`（工具/hooks）、`PascalCase.tsx`（组件/页面）
- **组件**：PascalCase
- **函数**：camelCase
- **常量**：UPPER_SNAKE_CASE
- **i18n key**：点分路径（如 `array.title`）

### 9.10 提交规范

- **项目语言（UI text、comments、commit messages）主要为中文**
- **遵循 Conventional Commits**（建议）

### 9.11 Bundle 优化规范

- **Vendor chunks 分割**：`manualChunks`（vendor-react, vendor-d3）
- **`scripts/check-bundle.js` 强制 size budgets**
- **预算**：index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB

---

## 10. 常见问题与解决方案

### 10.1 开发环境问题

**Q1: 开发服务器启动后页面空白**

A: 检查访问路径是否为 `http://localhost:3000/Data-Structures-Visualized/`（含 base path），而非根路径。

**Q2: D3 动画不生效或元素位置错乱**

A: 确认所有 D3 导入来自 `src/utils/d3Imports.ts`，而非直接 `import 'd3'`。直接导入会导致双实例问题，`d3-transition` 原型补丁失效。

**Q3: ESLint 不检查 TypeScript 文件**

A: 已修复。`eslint.config.js` 已从 `defineConfig` 改为 `tseslint.config`，通过 `...tseslint.configs.recommended` 规则集覆盖 `**/*.{ts,tsx}` 文件，并启用 `@typescript-eslint/no-unused-vars` 规则（`varsIgnorePattern: '^_'`）。新增 `typescript-eslint@8.61.1` devDependency。

### 10.2 测试问题

**Q4: 单元测试中 D3 相关测试失败**

A: 使用 `src/__tests__/visualizers/d3MockHelper.ts` 提供的 mock 工具（`createD3SelectionMock`/`mockD3Imports`/`mockThemeColors`/`mockAnimationEngine`/`mockI18n`）。

**Q5: E2E 测试中 OperationGroup 内按钮点击失败**

A: OperationGroup 折叠时不渲染子 DOM。需先展开分组（点击展开按钮）再交互。`test-helpers.js` 的 `clickButtonIfEnabled` 用 `force: true` 绕过动画期间拦截。

**Q6: E2E 测试 localStorage 串扰**

A: `run-all-tests.js` 用 `STAGGER_DELAY_MS` 错峰启动核心测试。综合测试严格串行执行。`test-core.js` 中 `page.route('**/sw.js', route => route.abort())` 阻止 service worker 缓存干扰。

### 10.3 构建问题

**Q7: `npm run build` 失败提示 bundle 超预算**

A: 检查 `scripts/check-bundle.js` 输出的具体超预算 chunk。常见原因：
- 引入了新的大型依赖
- 未正确使用 `React.lazy` 代码分割
- D3 未通过 `d3Imports.ts` 统一导入导致 tree-shaking 失效

**Q8: 构建产生大量 chunk 大小警告**

A: `vite.config.js` 中 `chunkSizeWarningLimit: 80` 设置过严。可调高至 200 或与 `check-bundle.js` 预算解耦。

### 10.4 部署问题

**Q9: GitHub Pages 部署后路由 404**

A: 项目已配置 `public/404.html` + `index.html` 内联 SPA 重定向脚本处理此问题。确认 `BrowserRouter` basename 与 base path 一致（`/Data-Structures-Visualized`）。

**Q10: PWA 缓存导致更新不生效**

A: `registerType: 'autoUpdate'` 配置会自动检查更新。如需强制刷新，可清除浏览器缓存或 unregister service worker。

### 10.5 运行时问题

**Q11: 动画卡死导致页面锁定**

A: `useDataStructureState` 有 15 秒超时保护，超时自动解锁并 toast 警告。如持续发生，检查动画函数是否有未 await 的 Promise 或未处理的 rejection。

**Q12: localStorage 数据损坏导致应用崩溃**

A: `useDataStructureState` 的 `loadFromStorage` 使用 `validateStoredData`（`src/utils/schema.ts`）做统一 schema 校验：递归检查 JSON-like 类型、非有限数字、空对象/数组、嵌套深度（`MAX_STORAGE_DEPTH = 10`）。校验失败会自动清除对应 key 并回退到 `initialData`。各 hook 在消费数据时还有额外防御（如 `useGraphState` 的 `Array.isArray(graphData.nodes)` 检查）。如仍有问题，可手动清除 `ds-visualizer-data-*` 的 localStorage key。

---

## 11. 未来优化建议

### 11.1 高优先级

1. **ESLint 覆盖 TypeScript 文件** ✅ 已完成
   - `eslint.config.js` 已改为 `tseslint.config`，通过 `tseslint.configs.recommended` 覆盖 `**/*.{ts,tsx}` 文件
   - 已安装 `typescript-eslint@8.61.1` devDependency
   - 已启用 `@typescript-eslint/no-unused-vars` 规则（`varsIgnorePattern: '^_'`）

2. **启用 TypeScript 严格模式**
   - 当前 `strict: false`、`noUnusedLocals: false`、`noUnusedParameters: false`
   - 建议逐步收紧，提升类型安全

3. **统一 visualizer 清理策略**
   - `arrayVisualizer` 用 `purgeSVG`（更彻底），`stackVisualizer` 仅用 `selectAll('*').remove()`
   - 建议将 `purgeSVG` 提取到公共工具，所有 visualizer 统一使用

4. **修复 `e2e/quality-check.mjs` 的 BASE_URL 错误**
   - 当前为 `http://localhost:3000/ds-visualizer/`，应为 `/Data-Structures-Visualized/`

### 11.2 中优先级

5. **`deploy.yml` 依赖 CI 通过**
   - 当前 push 到 main 时 ci.yml 和 deploy.yml 并行触发
   - 建议 deploy.yml 加 `needs:` 或改为 `workflow_run` 触发

6. **`test-advanced.js` 复用 `test-helpers.js`**
   - 当前重复定义 `clickButtonIfEnabled`/`getVisibleInputs`/`fillInput`
   - 且 `test-advanced.js` 的 `clickButtonIfEnabled` 无 `force: true`，可能导致点击失败

7. **综合测试三件套支持 firefox**
   - `test-comprehensive.js`/`test-interactions.js`/`test-persistence.js` 硬编码 `chromium.launch()`

8. **`.gitignore` 排除测试产物**
   - `e2e/test-report.txt` 和 `quality-check-report.json` 应加入 .gitignore

9. **CI 增加覆盖率门槛**
   - 当前 `test:coverage` 未在 CI 中运行

10. **`chunkSizeWarningLimit` 调整**
    - 当前 80 过于激进，产生大量警告噪音

### 11.3 低优先级

11. **添加 `.nvmrc` / `package.json#engines`**
    - 固定 Node 版本，与 CI 矩阵对齐

12. **`package.json` 版本号管理**
    - 当前始终为 `0.0.0`，`__APP_VERSION__` 注入无意义

13. **Visualizer 单元测试增加 SVG DOM 断言**
    - 当前仅验证"不抛错"，可引入少量真实 D3 渲染测试

14. **Bundle 检查覆盖 CSS 和动态 chunk**
    - 当前仅检查 3 个固定 chunk 名的 JS

15. **E2E 自动启动/关闭 dev server**
    - 当前完全依赖用户手动启动

16. **细化 `validateImportData` 错误信息**
    - 当前所有失败情况返回相同消息，用户无法区分原因

17. **Sidebar 图标配置化**
    - 当前 `getIconSvg(index)` 用 switch-case 硬编码 13 个图标
    - 建议将图标配置合并到 `STRUCTURE_KEYS` 数组

---

## 12. 附录：文件路径索引

### 12.1 核心文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 入口 | `src/main.tsx` | React 挂载 + 全局副作用初始化 |
| 根组件 | `src/App.tsx` | Provider 组装 + 路由表 |
| 状态核心 | `src/hooks/useHistory.ts` | undo/redo 栈 |
| 通用状态 | `src/hooks/useDataStructureState.ts` | + 持久化 + 日志 + 动画锁 |
| 动画引擎 | `src/utils/animationEngine.ts` | 动画时长唯一来源 |
| D3 统一导入 | `src/utils/d3Imports.ts` | 解决双实例问题 |
| 全局设置 | `src/hooks/useGlobalSettings.ts` | Context 全局设置 |
| 国际化 | `src/i18n/useI18n.ts` | 语言切换 |
| 主题颜色 | `src/utils/themeColors.ts` | 4 套调色板 |
| 输入验证 | `src/utils/validate.ts` | XSS + 范围检查 |
| 学习配置注册 | `src/configs/learning/index.ts` | 37 个学习模式配置 |
| 排序算法注册 | `src/algorithms/sorting/index.ts` | 12 种排序算法 |
| 跳表算法 | `src/algorithms/skipList.ts` | 多层链表 + 概率平衡 |
| 并查集算法 | `src/algorithms/unionFind.ts` | 路径压缩 + 按秩合并 |
| 红黑树算法 | `src/algorithms/redBlackTree.ts` | 插入 fixup + 旋转 + 着色 |
| 全局搜索索引 | `src/data/searchIndex.ts` | 数据结构/算法/页面元数据 |
| 全局搜索组件 | `src/components/GlobalSearch.tsx` | Ctrl/Cmd+K 唤起 + 键盘导航 |
| 类型声明 | `src/types/hooks.d.ts` | 数据结构状态接口 |
| 学习类型 | `src/types/learning.d.ts` | 学习模式类型 |

### 12.2 配置文件

| 文件 | 路径 | 说明 |
|------|------|------|
| Vite 配置 | `vite.config.js` | 构建 + PWA + 别名 |
| TS 配置 | `tsconfig.json` | TypeScript 编译选项 |
| ESLint 配置 | `eslint.config.js` | flat config（tseslint.config，覆盖 JS + TS 文件） |
| Vitest 配置 | `vitest.config.js` | 测试环境 |
| Bundle 检查 | `scripts/check-bundle.js` | 包体积预算 |
| CI 配置 | `.github/workflows/ci.yml` | 持续集成 |
| 部署配置 | `.github/workflows/deploy.yml` | GitHub Pages 部署 |

### 12.3 测试文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 测试 Setup | `src/__tests__/setup.js` | jsdom + mock |
| 页面测试 utils | `src/__tests__/pages/testUtils.tsx` | renderWithRouter |
| Visualizer mock | `src/__tests__/visualizers/d3MockHelper.ts` | D3 mock 工具 |
| E2E 入口 | `e2e/run-all-tests.js` | 全量 E2E |
| E2E helpers | `e2e/test-helpers.js` | 测试辅助函数 |

### 12.4 文档文件

| 文件 | 路径 | 说明 |
|------|------|------|
| 项目摘要 | `PROJECT_SUMMARY.md` | 项目目标 + 技术栈 + 结构 |
| 架构文档 | `ARCHITECTURE.md` | 架构设计详解 |
| TODO | `TODO.md` | 任务管理 |
| 工作日志 | `WORKLOG.md` | 修改记录 |
| 变更日志 | `CHANGELOG.md` | 版本变更 |
| AI 指南 | `CLAUDE.md` | AI 助手工程指南 |
| Code Wiki | `CODE_WIKI.md` | 本文档 |

---

> **文档维护说明**：本文档基于 2026-06-20 的项目状态（v12.0）生成。如项目架构发生重大变更，请同步更新本文档。文档优先级参考 `PROJECT_SUMMARY.md` → `TODO.md` → `ARCHITECTURE.md` → `README.md` → 代码实现。
