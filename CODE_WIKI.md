# 数据结构学习助手 — Code Wiki

> **版本:** v6.4
> **日期:** 2026-06-01
> **技术栈:** React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + React Router v7 + Vitest

---

## 目录

1. [项目概述](#1-项目概述)
2. [整体架构](#2-整体架构)
3. [模块职责](#3-模块职责)
4. [关键类和函数](#4-关键类和函数)
5. [依赖关系](#5-依赖关系)
6. [项目搭建与运行](#6-项目搭建与运行)
7. [开发规范](#7-开发规范)

---

## 1. 项目概述

### 1.1 项目定位

**数据结构学习助手** 是一款面向大学生的 Web 端数据结构可视化教学工具。通过交互式动画演示，帮助学习者直观理解核心数据结构的原理与操作过程。

### 1.2 核心功能

| 功能模块 | 支持操作 | 可视化特性 |
|---------|---------|-----------|
| **数组 Array** | 插入、删除、查找、随机生成、导入/导出 | 矩形条 + 索引标注，元素位移动画 |
| **栈 Stack** | Push、Pop、Peek、Clear | 垂直堆叠，栈顶/栈底标记 |
| **队列 Queue** | Enqueue、Dequeue、Front、Clear | 水平排列，队首/队尾标记 |
| **链表 LinkedList** | 头插、尾插、按位置插入、删除、查找、反转、环检测 | 圆形节点 + 带箭头连线 |
| **二叉树 BinaryTree** | 插入、前序/中序/后序/层序遍历、查找、删除节点 | 树状布局，节点生长动画 |
| **图 Graph** | 添加/删除节点和边、BFS、DFS、Dijkstra、邻接矩阵/表 | 力导向布局、邻接矩阵/邻接表视图 |
| **排序 Sorting** | 冒泡、选择、插入、快速、归并、堆、基数、桶排序 | 柱状图高度表示值，比较/交换动画 |
| **哈希表 Hash Table** | 插入、删除、查找（取模哈希 + 链地址法） | 桶数组 + 链表冲突节点 + 箭头连接 |
| **堆 Heap** | Insert、ExtractMax、Peek | 完全二叉树层级布局 + 违规检测 |
| **字典树 Trie** | 插入、删除、查找、前缀匹配 | 树形层级布局 + 边标签可视化 |
| **算法对比 SortCompare** | 8 种排序算法并行对比 | 多算法并行可视化 + PerformanceChart |
| **图算法 GraphAlgorithm** | BFS、DFS、Dijkstra、拓扑排序 | SVG 可视化 + 学习模式 + 复杂度对比 |

### 1.3 关键特性

- **Neo-Brutalism 设计风格** — 粗边框、硬阴影、高对比度配色
- **统一交互体验** — 所有数据结构页面遵循一致的布局与操作范式
- **实时动画反馈** — 基于 D3.js 的数据驱动动画，支持速度调节和 5 种动画预设
- **操作日志系统** — 时间戳 + 操作类型 + 详情的完整执行记录
- **Undo/Redo 支持** — 基于历史栈的状态回溯（动画期间自动禁用）
- **撤销预览** — 悬停显示撤销/重做后的数据状态预览
- **键盘快捷键** — Ctrl+Z 撤销、Ctrl+Shift+Z 重做、R 重置、? 帮助、左右箭头导航 Timeline
- **数据持久化** — 11 种数据结构自动保存/恢复，页面刷新后数据不丢失（localStorage）
- **国际化（i18n）** — 中英文切换，轻量级翻译系统，无第三方依赖
- **算法对比模式** — 8 种排序算法并行对比，实时进度追踪
- **性能对比图表** — D3 柱状图对比排序算法性能（比较次数/交换次数/总步数三维度）
- **复杂度可视化** — 时间/空间复杂度增长曲线对比（ComplexityChart）
- **交互式学习模式** — 步骤解释面板 + 代码同步显示（StepExplainer）
- **操作历史时间线** — 可视化操作历史，点击可 undo/redo，悬停显示详情
- **导入/导出** — 数据持久化，支持 JSON/CSV 格式导入导出，含版本校验
- **分享功能** — Base64 编码数据到 URL，一键复制分享链接
- **输入验证** — 数值范围 1~99，索引边界检查，非法输入 Toast 提示
- **视图缩放** — 0.5x ~ 2x 缩放范围，支持鼠标滚轮、按钮控制和双指缩放
- **可视化网格开关** — 可视化区域 dot-grid 背景显示切换
- **空状态提示** — 数据为空时显示引导界面，一键填充示例数据
- **深色/浅色/系统主题** — 支持 light/dark/system 三种主题切换
- **多配色主题** — 4 套主题（默认蓝/森林绿/暖橙/皇家紫）
- **响应式布局** — 适配不同屏幕尺寸，侧边栏可折叠，移动端触控优化
- **性能监控面板** — FPS/内存实时显示，帧率自适应动画降级
- **网络离线检测** — 离线状态实时提示
- **单元测试覆盖** — 498 tests（29 个测试文件），核心逻辑覆盖率 > 70%
- **E2E 测试覆盖** — 4 文件 100+ 用例，95.2% 通过率
- **错误边界恢复** — ErrorBoundary 异常 UI + safeAnimate 统一错误恢复
- **路由懒加载** — React.lazy + Suspense，主 bundle 321 KB，23 个独立 chunk
- **TypeScript 全栈** — 100% TypeScript 覆盖（.ts/.tsx）

### 1.4 目标受众

- 大学计算机专业学生（课程作业辅助）
- 数据结构初学者
- 需要快速演示数据结构操作的教师

---

## 2. 整体架构

### 2.1 架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              用户界面层 (UI Layer)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Sidebar   │  │  PageHeader │  │ OperationBar│  │     Visualizer      │ │
│  │   导航栏     │  │   页面标题   │  │   操作按钮区 │  │    D3 可视化容器     │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  LogPanel   │  │  EmptyState │  │ExportImport │  │   KeyboardHelp      │ │
│  │   日志面板   │  │   空状态提示 │  │  导入导出    │  │   快捷键帮助         │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Timeline   │  │ Performance│  │  ShareBtn   │  │  UndoPreviewBtn     │ │
│  │  时间线      │  │  Chart      │  │  分享按钮    │  │  撤销预览按钮        │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────────────┐  │
│  │StepExplainer│  │Complexity   │  │   ToastContainer / NetworkStatus    │  │
│  │ 步骤解释     │  │  Chart      │  │   全局通知 / 网络状态                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                              页面层 (Page Layer)                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌──────┐ ┌────────┐     │
│  │Array │ │Stack │ │Queue │ │LinkedList│ │Tree  │ │Graph │ │Sort    │     │
│  │Hash  │ │Heap  │ │Trie  │ │SortCompare│ │Home  │ │GraphAlgo│           │
│  └──────┘ └──────┘ └──────┘ └──────────┘ └──────┘ └──────┘ └────────┘     │
├─────────────────────────────────────────────────────────────────────────────┤
│                            状态管理层 (State Layer)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────────────┐  │
│  │useArrayState │ │useStackState │ │useQueueState │ │useLinkedListState  │  │
│  │useTreeState  │ │useGraphState │ │useSortState  │ │useHashState        │  │
│  │useHeapState  │ │useTrieState  │ │useHistory    │ │useVisualizer       │  │
│  │useI18n       │ │useTheme      │ │useKeyboard   │ │useGlobalSettings   │  │
│  │useCommonKb   │ │useLearning   │ │              │ │                     │  │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────┤
│                           可视化引擎层 (Visualizer Layer)                       │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐               │
│  │arrayVisualizer  │ │stackVisualizer  │ │queueVisualizer  │               │
│  │linkedListVis.   │ │treeVisualizer   │ │graphVisualizer  │               │
│  │sortVisualizer   │ │hashVisualizer   │ │heapVisualizer   │               │
│  │trieVisualizer   │ │useVisualizer    │ │                 │               │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘               │
├─────────────────────────────────────────────────────────────────────────────┤
│                              算法层 (Algorithm Layer)                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  algorithms/sorting/ — 8 种排序算法（插件注册模式）                    │   │
│  │  algorithms/graph/   — 4 种图算法（BFS/DFS/Dijkstra/拓扑排序）         │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                            工具层 (Utility Layer)                             │
│  ┌───────────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────┐ │
│  │ animationEngine   │ │  validate     │ │  dataExport   │ │  debounce    │ │
│  │ d3Imports         │ │  timeslicing  │ │  themeColors  │ │  shareUtils  │ │
│  │ performanceBench  │ │               │ │               │ │              │ │
│  └───────────────────┘ └───────────────┘ └───────────────┘ └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                           国际化层 (i18n Layer)                                │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  locales.ts — 中文（zh）+ 英文（en）完整翻译                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                           类型层 (Type Layer)                                  │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  types/ — animationEngine / hooks / toastStore / validate / visualizers│   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户操作 → Page 组件 → State Hook → 数据更新
                              ↓
                         useHistory (状态快照)
                              ↓
                         localStorage (自动保存)
                              ↓
                    Visualizer 组件接收新数据
                              ↓
                    renderFn (D3 渲染函数) → SVG DOM 更新
                              ↓
                    动画函数 (可选) → 过渡动画效果
                              ↓
                    LogPanel + Toast 反馈
                              ↓
                    Timeline (操作历史可视化)
                              ↓
                    StepExplainer (学习模式步骤)
                              ↓
                    ComplexityChart (复杂度对比)
```

### 2.3 核心设计模式

| 模式 | 应用位置 | 说明 |
|------|---------|------|
| **自定义 Hook 模式** | `hooks/*` | 将数据结构状态逻辑抽离为可复用 Hook |
| **渲染 Props 模式** | `Visualizer.tsx` | 通过 `renderFn` 注入 D3 渲染逻辑 |
| **发布-订阅模式** | `Toast.tsx` / `toastStore.ts` | 全局 Toast 通知系统 |
| **命令模式** | `useHistory.ts` | Undo/Redo 通过历史栈实现 |
| **策略模式** | `visualizers/*` | 不同数据结构使用不同的渲染策略 |
| **插件注册模式** | `algorithms/sorting/index.ts` | 排序算法可插拔注册 |
| **Context Provider** | `useGlobalSettings.ts` | 全局设置共享（i18n/theme/preset） |

---

## 3. 模块职责

### 3.1 模块总览

```
src/
├── algorithms/          # 算法实现（排序 + 图算法）
│   ├── sorting/         # 8 种排序算法（插件注册模式）
│   └── graph/           # 4 种图算法
├── components/          # 公共 UI 组件（纯展示，无业务逻辑）
├── pages/               # 页面组件（业务逻辑编排）
├── hooks/               # 自定义 React Hooks（状态管理）
├── visualizers/         # D3.js 可视化渲染逻辑
├── utils/               # 工具函数和通用引擎
├── types/               # TypeScript 类型声明文件
├── i18n/                # 国际化翻译文件
├── __tests__/           # 单元测试（Vitest + Testing Library）
├── App.tsx              # 路由配置根组件
├── main.tsx             # 应用入口
└── index.css            # 全局样式 + Tailwind 主题配置
```

### 3.2 各模块详细职责

#### `components/` — 公共 UI 组件

| 组件 | 职责 | 关键 Props |
|-----|------|-----------|
| **Layout.tsx** | 页面整体布局框架，包含 Sidebar + Main 区域 + PerformanceMonitor | `children` |
| **Sidebar.tsx** | 左侧导航栏，支持折叠、主题切换、路由导航、版本号显示 | 无 |
| **PageHeader.tsx** | 页面标题栏，显示结构名称、描述、操作按钮 | `title`, `subtitle`, `icon`, `children` |
| **OperationBar.tsx** | 操作按钮区容器，提供统一的操作按钮样式 | `children` |
| **Visualizer.tsx** | D3 可视化容器，管理 SVG 尺寸、缩放、渲染调度、FPS 监控 | `data`, `renderFn`, `svgRef`, `dimensions`, `containerRef` |
| **LogPanel.tsx** | 执行日志面板，支持过滤、自动滚动 | `logs`, `maxHeight` |
| **EmptyState.tsx** | 空状态提示覆盖层 | `icon`, `title`, `description`, `onFill` |
| **Toast.tsx** | 全局 Toast 通知系统（发布-订阅模式） | 无（全局使用） |
| **ExportImport.tsx** | 数据导入导出按钮组，支持 JSON/CSV 文件读写 | `dataType`, `data`, `onImport`, `disabled` |
| **KeyboardHelp.tsx** | 键盘快捷键帮助弹窗（路由感知动态显示） | 无 |
| **Timeline.tsx** | 操作历史时间线，自动图标匹配，悬停 tooltip，键盘导航 | `historyState`, `onJump`, `t` |
| **PerformanceChart.tsx** | 性能对比图表，D3 柱状图，支持导出 | `performanceData`, `dimension`, `t` |
| **SpeedControl.tsx** | 动画速度控制 + 动画预设选择 | `speed`, `onSpeedChange`, `onPresetChange` |
| **StepExplainer.tsx** | 交互式学习模式步骤解释面板 + 代码同步显示 | `steps`, `currentStep`, `isActive` |
| **ComplexityChart.tsx** | 算法复杂度增长曲线对比图表 | `algorithms`, `dataSize` |
| **PerformanceMonitor.tsx** | FPS/内存实时监控面板（可折叠） | 无 |
| **NetworkStatus.tsx** | 网络在线/离线状态提示 | 无 |
| **ShareButton.tsx** | 生成分享链接并复制 | `data`, `dataType` |
| **UndoPreviewButton.tsx** | 撤销/重做预览按钮，hover 显示状态预览 | `getUndoPreview`, `getRedoPreview`, `onUndo`, `onRedo` |
| **UndoRedoBar.tsx** | 撤销/重做 UI 组件封装 | `canUndo`, `canRedo`, `onUndo`, `onRedo` |
| **ProgressBar.tsx** | 操作进度条 | `progress`, `label` |

#### `pages/` — 页面组件

| 页面 | 职责 | 对应 State Hook | 对应 Visualizer |
|-----|------|----------------|----------------|
| **Home.tsx** | 首页，展示 12 个数据结构卡片网格 | `useGlobalSettings` | 无 |
| **ArrayPage.tsx** | 数组操作页面 | `useArrayState` | `arrayVisualizer` |
| **StackPage.tsx** | 栈操作页面 | `useStackState` | `stackVisualizer` |
| **QueuePage.tsx** | 队列操作页面 | `useQueueState` | `queueVisualizer` |
| **LinkedListPage.tsx** | 链表操作页面 | `useLinkedListState` | `linkedListVisualizer` |
| **TreePage.tsx** | 二叉树操作页面 | `useTreeState` | `treeVisualizer` |
| **GraphPage.tsx** | 图操作页面（含三种视图模式） | `useGraphState` | `graphVisualizer` |
| **SortPage.tsx** | 排序算法演示页面（含学习模式） | `useSortState` | `sortVisualizer` |
| **HashPage.tsx** | 哈希表操作页面 | `useHashState` | `hashVisualizer` |
| **HeapPage.tsx** | 堆操作页面 | `useHeapState` | `heapVisualizer` |
| **TriePage.tsx** | 字典树操作页面 | `useTrieState` | `trieVisualizer` |
| **SortComparePage.tsx** | 算法对比页面，8 算法并行 | `useSortState` + 多实例 | `sortVisualizer` + `PerformanceChart` + `Timeline` |
| **GraphAlgorithmPage.tsx** | 图算法可视化页面（含学习模式） | `useGraphState` | `graphVisualizer` + `StepExplainer` + `ComplexityChart` |

#### `hooks/` — 自定义 Hooks

| Hook | 职责 | 返回值关键字段 |
|-----|------|--------------|
| **useArrayState** | 数组状态管理：插入、删除、查找、随机生成、导入/导出 | `data`, `insert`, `remove`, `search`, `randomize`, `loadData`, `logs`, `undo`, `redo` |
| **useStackState** | 栈状态管理：Push、Pop、Peek、Clear，支持最大容量限制 | `data`, `push`, `pop`, `peek`, `clear`, `size` |
| **useQueueState** | 队列状态管理：Enqueue、Dequeue、Front、Clear | `data`, `enqueue`, `dequeue`, `front`, `clear`, `size` |
| **useLinkedListState** | 链表状态管理：头插、尾插、按位置插入、删除、查找、反转、环检测 | `data`, `insertHead`, `insertTail`, `insertAt`, `deleteAt`, `search`, `reverse`, `detectCycle`, `length` |
| **useTreeState** | 二叉树状态管理：插入、前序/中序/后序/层序遍历、查找、删除节点 | `data`, `insert`, `deleteNode`, `preorder`, `inorder`, `postorder`, `levelorder`, `search`, `nodeCount` |
| **useGraphState** | 图状态管理：节点/边增删、BFS/DFS/Dijkstra/拓扑排序、邻接矩阵/表 | `nodes`, `links`, `addNode`, `addEdge`, `bfs`, `dfs`, `dijkstra`, `topoSort`, `viewMode` |
| **useSortState** | 排序状态管理：8 种排序算法，统计信息 | `data`, `bubbleSort`, `selectionSort`, `insertionSort`, `quickSort`, `mergeSort`, `heapSort`, `radixSort`, `bucketSort`, `stats` |
| **useHashState** | 哈希表状态管理：插入、删除、查找（取模哈希 + 链地址法） | `buckets`, `insert`, `remove`, `search`, `size` |
| **useHeapState** | 堆状态管理：Insert、ExtractMax、Peek | `data`, `insert`, `extractMax`, `peek`, `size` |
| **useTrieState** | 字典树状态管理：插入、删除、查找、前缀匹配 | `root`, `insert`, `delete`, `search`, `searchPrefix`, `size` |
| **useHistory** | 通用历史栈管理，支持 Undo/Redo（最大 20 步），撤销预览 | `state`, `push`, `undo`, `redo`, `canUndo`, `canRedo`, `getHistory`, `getCurrentIndex`, `getUndoPreview`, `getRedoPreview` |
| **useVisualizer** | 可视化容器管理：SVG 尺寸、ResizeObserver、动画上下文 | `containerRef`, `svgRef`, `dimensions`, `getAnimationContext`, `abortAnimation` |
| **useKeyboard** | 键盘快捷键监听与分发（含输入框焦点防护） | 无（副作用 Hook） |
| **useCommonKeyboard** | 通用键盘快捷键封装（撤销/重做/重置） | 无（副作用 Hook） |
| **useTheme** | 主题管理：light/dark/system，localStorage 持久化 | `mode`, `resolved`, `cycle`, `set` |
| **useI18n** | 国际化管理：翻译函数、语言切换 | `t`, `language`, `setLanguage` |
| **useGlobalSettings** | 全局设置管理：i18n/theme/preset 统一上下文 | `i18n`, `theme`, `settings`, `currentPreset`, `applyPreset` |
| **useLearningMode** | 交互式学习模式：算法步骤定义与导航 | `steps`, `currentStep`, `isActive`, `start`, `next`, `prev`, `stop` |

#### `visualizers/` — D3 可视化引擎

| 文件 | 职责 | 导出函数 |
|-----|------|---------|
| **arrayVisualizer.ts** | 数组可视化：矩形条渲染、插入/删除/搜索动画 | `renderArray`, `animateInsert`, `animateDelete`, `animateSearch` |
| **stackVisualizer.ts** | 栈可视化：垂直堆叠渲染、Push/Pop 动画 | `renderStack`, `animatePush`, `animatePop` |
| **queueVisualizer.ts** | 队列可视化：水平排列渲染、Enqueue/Dequeue 动画 | `renderQueue`, `animateEnqueue`, `animateDequeue` |
| **linkedListVisualizer.ts** | 链表可视化：圆形节点 + 箭头连线，插入/删除/反转/环检测动画 | `renderLinkedList`, `animateInsert`, `animateDelete`, `animateReverse`, `animateCycleDetection` |
| **treeVisualizer.ts** | 二叉树可视化：树状布局、节点生长动画、遍历动画、删除节点动画 | `renderTree`, `animateInsert`, `animateTraversal`, `animateLevelOrder`, `animateSearch`, `animateDeleteNode` |
| **graphVisualizer.ts** | 图可视化：力导向布局、BFS/DFS/Dijkstra/拓扑排序动画 | `renderGraph`, `animateBFS`, `animateDFS`, `animateDijkstra`, `animateTopoSort` |
| **sortVisualizer.ts** | 排序可视化：柱状图、比较/交换/完成动画 | `renderSortBars`, `animateCompare`, `animateSwap`, `animateSorted` |
| **hashVisualizer.ts** | 哈希表可视化：桶数组 + 链表冲突节点 | `renderHash`, `animateInsert`, `animateRemove`, `animateSearch` |
| **heapVisualizer.ts** | 堆可视化：完全二叉树层级布局、违规检测 | `renderHeap`, `animateInsert`, `animateExtractMax` |
| **trieVisualizer.ts** | 字典树可视化：树形层级布局、边标签可视化 | `renderTrie`, `animateInsert`, `animateDelete`, `animateSearch` |

#### `utils/` — 工具层

| 文件 | 职责 | 导出内容 |
|-----|------|---------|
| **animationEngine.ts** | 动画引擎：速度控制、性能模式、缓动函数、过渡工具、FPS 监控、动画预设 | `duration`, `wait`, `transition`, `sequence`, `EASING`, `createAnimation`, `safeAnimate`, `ANIMATION_PRESETS`, `applyPreset`, `startFPSMonitoring`, `getCurrentFPS` |
| **validate.ts** | 输入验证工具：XSS 净化、数值范围校验、导入数据验证 | `sanitizeInput`, `validateNumericInput`, `getValidationError`, `validateImportData` |
| **dataExport.ts** | 数据导入导出：JSON/CSV 序列化、版本校验、文件下载 | `exportState`, `importState`, `exportPerformanceCSV`, `exportPerformanceJSON` |
| **d3Imports.ts** | D3 按需导入子模块 | `d3Selection`, `d3Transition`, `d3Force`, `d3Ease`, `d3Scale`, `d3Shape`, `d3Array` |
| **debounce.ts** | 防抖工具函数 | `debounce` |
| **timeslicing.ts** | 时间分片工具 | `timeSlice` |
| **themeColors.ts** | 共享主题感知工具（颜色系统 + 渐变定义 + 暗色模式检测 + 多主题） | `getColors`, `detectDarkMode`, `ensureGradientDefs`, `gradUrl`, `THEMES`, `setTheme`, `getTheme` |
| **shareUtils.ts** | 分享数据编解码工具 | `encodeShareData`, `decodeShareData` |
| **performanceBenchmark.ts** | 性能基准测试工具 | `benchmark`, `benchmarkThreshold`, `formatBenchmarkReport` |

#### `algorithms/` — 算法插件

| 文件 | 职责 |
|-----|------|
| **sorting/bubbleSort.ts** | 冒泡排序实现 |
| **sorting/selectionSort.ts** | 选择排序实现 |
| **sorting/insertionSort.ts** | 插入排序实现 |
| **sorting/quickSort.ts** | 快速排序实现 |
| **sorting/mergeSort.ts** | 归并排序实现 |
| **sorting/heapSort.ts** | 堆排序实现 |
| **sorting/radixSort.ts** | 基数排序实现 |
| **sorting/bucketSort.ts** | 桶排序实现 |
| **sorting/index.ts** | 算法注册表（插件模式） |
| **graph/bfs.ts** | BFS 广度优先搜索 |
| **graph/dfs.ts** | DFS 深度优先搜索 |
| **graph/dijkstra.ts** | Dijkstra 最短路径 |
| **graph/topoSort.ts** | 拓扑排序 |
| **graph/index.ts** | 图算法统一导出 |

#### `types/` — TypeScript 类型声明

| 文件 | 职责 |
|-----|------|
| **animationEngine.d.ts** | 动画引擎类型声明 |
| **hooks.d.ts** | 全部 hooks 状态接口类型声明 |
| **toastStore.d.ts** | Toast 类型声明 |
| **validate.d.ts** | 验证工具类型声明 |
| **visualizers.d.ts** | 10 个 visualizer 模块类型声明 |

#### `i18n/` — 国际化

| 文件 | 职责 |
|-----|------|
| **locales.ts** | 中文（zh）+ 英文（en）完整翻译，覆盖所有翻译键 |
| **useI18n.ts** | 翻译函数 `t(key)`、语言切换、localStorage 持久化 |

#### `__tests__/` — 单元测试

| 文件 | 测试内容 | 测试数 |
|-----|---------|-------|
| **validate.test.ts** | 输入验证功能 | 8 |
| **useHistory.test.ts** | 历史栈 Undo/Redo | 9 |
| **animationEngine.test.ts** | 动画引擎功能 | 19 |
| **dataExport.test.ts** | 导入/导出功能 | 13 |
| **useArrayState.test.ts** | 数组状态管理 | 29 |
| **useStackState.test.ts** | 栈状态管理 | 13 |
| **useQueueState.test.ts** | 队列状态管理 | 13 |
| **useSortState.test.ts** | 排序状态管理 | 13 |
| **useHashState.test.ts** | 哈希表状态管理 | 32 |
| **useHeapState.test.ts** | 堆状态管理 | 25 |
| **useTrieState.test.ts** | 字典树状态管理 | 35 |
| **useGraphState.test.ts** | 图状态管理 | 28 |
| **useLinkedListState.test.ts** | 链表状态管理 | 32 |
| **useTreeState.test.ts** | 二叉树状态管理 | 28 |
| **timeline.test.tsx** | Timeline 组件 | 21 |
| **performanceChart.test.tsx** | PerformanceChart 组件 | 9 |
| **useLearningMode.test.ts** | 学习模式 | 20 |
| **ComplexityChart.test.tsx** | 复杂度图表组件 | 20 |
| **StepExplainer.test.tsx** | 步骤解释组件 | 23 |
| **LogPanel.test.tsx** | 日志面板组件 | 13 |
| **useKeyboard.test.ts** | 键盘快捷键 | 10 |
| **themeColors.test.ts** | 主题颜色工具 | 18 |
| **useCommonKeyboard.test.ts** | 通用键盘快捷键 | 1 |
| **validate-enhanced.test.ts** | 增强验证功能 | 22 |
| **useDataStructureState.test.ts** | 数据结构基类 Hook | 7 |
| **graphAlgorithms.test.ts** | 图算法 | 17 |
| **sorting.test.ts** | 排序算法 | 26 |
| **useVisualizer.test.ts** | 可视化 Hook | 7 |
| **shareUtils.test.ts** | 分享工具 | 5 |

**总计: 869 tests（56 个测试文件）**

---

## 4. 关键类和函数

### 4.1 状态管理核心

#### `useHistory<T>(initialState)` — 通用历史栈 Hook

**位置:** `src/hooks/useHistory.ts`

**职责:** 为任意数据结构提供 Undo/Redo 能力，基于引用（useRef）实现高性能历史栈，最大支持 20 步历史记录。

**参数:**
| 参数 | 类型 | 说明 |
|-----|------|------|
| `initialState` | `T` | 初始状态值 |

**返回值:**
| 字段 | 类型 | 说明 |
|-----|------|------|
| `state` | `T` | 当前状态 |
| `push(newState)` | `function` | 压入新状态，自动截断 redo 分支 |
| `undo()` | `function` | 撤销一步，返回上一个状态 |
| `redo()` | `function` | 重做一步，返回下一个状态 |
| `reset(newInitial)` | `function` | 重置历史栈 |
| `canUndo()` | `function` | 返回布尔值，是否可以撤销 |
| `canRedo()` | `function` | 返回布尔值，是否可以重做 |
| `getHistory()` | `function` | 返回完整历史数组 |
| `getCurrentIndex()` | `function` | 返回当前历史索引 |
| `getUndoPreview()` | `function` | 返回撤销后的状态预览 |
| `getRedoPreview()` | `function` | 返回重做后的状态预览 |

**实现要点:**
- 使用 `useRef` 存储历史数组和索引，避免不必要的重渲染
- 最大历史长度 `MAX_HISTORY = 20`，超出时移除最早记录
- `push` 操作会自动清除当前索引之后的 redo 历史

**使用示例:**
```typescript
const { state: data, push, undo, redo, canUndo, canRedo } = useHistory<number[]>([1, 2, 3])

// 修改状态
push([...data, 4])  // data = [1, 2, 3, 4]

// 撤销
undo()  // data = [1, 2, 3]

// 重做
redo()  // data = [1, 2, 3, 4]
```

---

#### `useArrayState()` — 数组状态 Hook

**位置:** `src/hooks/useArrayState.ts`

**职责:** 管理数组数据结构的状态和操作，集成历史记录、日志、Toast 通知、撤销预览、分享功能。

**返回值:**
| 字段 | 类型 | 说明 |
|-----|------|------|
| `data` | `number[]` | 当前数组数据 |
| `logs` | `LogEntry[]` | 操作日志 |
| `isAnimating` | `boolean` | 是否正在执行动画 |
| `setIsAnimating` | `function` | 设置动画状态 |
| `insert(value, index)` | `function` | 在指定索引插入值，返回是否成功 |
| `remove(index)` | `function` | 删除指定索引元素，返回被删除值 |
| `search(value)` | `function` | 查找值，返回索引（-1 表示未找到） |
| `randomize()` | `function` | 生成 8 个随机数 |
| `reset()` | `function` | 重置为初始数据 |
| `undo` / `redo` | `function` | 撤销/重做（动画期间禁用） |
| `canUndo` / `canRedo` | `function` | 是否可以撤销/重做 |
| `getUndoPreview` / `getRedoPreview` | `function` | 撤销/重做状态预览 |

**常量:**
| 常量 | 值 | 说明 |
|-----|------|------|
| `INITIAL_DATA` | `[8, 3, 12, 5, 9]` | 数组初始数据 |
| `MAX_SIZE` | `20` | 数组最大元素个数 |

**错误处理:**
- 索引越界时显示红色 Toast 错误提示并记录日志
- 非法输入（非 1~99 整数）时显示 Toast 错误提示
- 数组已满（≥20 个元素）时拒绝插入并提示

---

#### `useGraphState()` — 图状态 Hook

**位置:** `src/hooks/useGraphState.ts`

**职责:** 管理图数据结构，支持节点/边的增删、三种视图模式、4 种算法执行。

**特殊说明:**
- 节点 ID 生成策略：优先使用 G-Z 字母，耗尽后使用 N1, N2... 格式
- 边去重：不允许自环，不允许重复边
- 视图模式：`force`（力导向图）、`matrix`（邻接矩阵）、`list`（邻接表）

**返回值关键字段:**
| 字段 | 说明 |
|-----|------|
| `nodes` / `links` | 节点和边数据 |
| `viewMode` / `setViewMode` | 当前视图模式 |
| `addNode()` / `addEdge(s, t, w)` | 添加节点/边 |
| `deleteNode(id)` / `deleteEdge(s, t)` | 删除节点/边 |
| `bfs(start)` / `dfs(start)` / `dijkstra(start, end)` / `topoSort()` | 算法执行 |
| `getAdjacencyMatrix()` | 返回 `{ ids, matrix }` |
| `getAdjacencyList()` | 返回邻接表对象 |

---

#### `useLearningMode()` — 学习模式 Hook

**位置:** `src/hooks/useLearningMode.ts`

**职责:** 为算法和数据结构提供引导式学习体验，定义步骤序列并管理当前步骤导航。

**返回值:**
| 字段 | 类型 | 说明 |
|-----|------|------|
| `steps` | `LearningStep[]` | 学习步骤数组 |
| `currentStep` | `number` | 当前步骤索引 |
| `isActive` | `boolean` | 学习模式是否激活 |
| `start(algorithm)` | `function` | 启动指定算法的学习模式 |
| `next()` | `function` | 下一步 |
| `prev()` | `function` | 上一步 |
| `stop()` | `function` | 停止学习模式 |
| `getCurrentStepData()` | `function` | 获取当前步骤数据 |

**支持的算法/数据结构 (18 种):**
- 排序：bubble / quick / merge / heap
- 图算法：bfs / dfs / dijkstra / topoSort
- 数据结构：linkedlist / doublyLinkedList / tree / hash

**配置来源:**
学习步骤配置已从 Hook 内部硬编码迁移到独立的 `src/configs/learning/` 模块：
- `configs/learning/*.config.ts` — 各算法独立配置文件
- `configs/learning/index.ts` — 统一导出 `learningConfigs` 对象
- `configs/learning/types.ts` — 类型定义（重新导出自 `src/types/learning.d.ts`）

**使用示例:**
```typescript
import { useLearningMode } from '../hooks/useLearningMode'

// 使用单向链表学习配置
const learningMode = useLearningMode('linkedlist')

// 使用双向链表学习配置
const learningMode = useLearningMode('doublyLinkedList')
```

---

### 4.2 可视化引擎核心

#### `Visualizer` 组件

**位置:** `src/components/Visualizer.tsx`

**关键修复:** SVG 使用 `viewBox` 属性替代 `width`/`height` 属性，避免 CSS `w-full h-full` 与 SVG 属性值冲突导致的**双重坐标系问题**。

**问题原理:**
- 旧代码：`width={dimensions.width}` + `className="w-full h-full"` → SVG 有**两套独立的尺寸系统**：属性值（视口）和 CSS 值（显示尺寸）。当两者不一致时浏览器缩放 SVG 内容，D3 坐标与实际渲染位置不匹配，导致亚像素渲染白点伪影和元素位置偏移。
- 新代码：`viewBox="0 0 ${w} ${h}"` + `className="w-full h-full"` → 只有一套坐标系（viewBox），CSS 控制显示尺寸，viewBox 控制内容映射，始终一致。

**渲染调度:** data 变化 → 立即调用 renderFn 全量渲染。动画函数在 state 变更前 await 完成，不会冲突。

**关键 Props:**
| Prop | 类型 | 说明 |
|-----|------|------|
| `data` | `any` | 可视化数据 |
| `renderFn` | `function` | D3 渲染函数 |
| `svgRef` | `RefObject<SVGSVGElement>` | SVG 元素引用 |
| `dimensions` | `{ width, height }` | 容器尺寸 |
| `containerRef` | `RefObject<HTMLDivElement>` | 容器元素引用 |
| `isDark` | `boolean` | 是否暗色模式 |

#### `useVisualizer()` — 可视化容器 Hook

**位置:** `src/hooks/useVisualizer.ts`

**职责:** 管理 D3 可视化容器的生命周期：尺寸计算、ResizeObserver、动画上下文创建与清理。

**返回值:**
| 字段 | 类型 | 说明 |
|-----|------|------|
| `containerRef` | `RefObject` | 容器 div 的 ref |
| `svgRef` | `RefObject` | SVG 元素的 ref |
| `dimensions` | `{ width, height }` | 容器尺寸（响应式更新） |
| `getAnimationContext()` | `function` | 创建新的动画上下文（自动中止旧动画） |
| `abortAnimation()` | `function` | 手动中止当前动画 |

**实现要点:**
- 使用 `ResizeObserver` 监听容器尺寸变化
- 组件卸载时自动断开 Observer 并中止动画
- 每次 `getAnimationContext()` 会自动中止之前的动画，防止冲突

---

#### `animationEngine.ts` — 动画引擎

**位置:** `src/utils/animationEngine.ts`

**职责:** 提供统一的动画时序控制、性能优化、缓动函数、过渡工具、FPS 监控和动画预设系统。

**全局状态:**
```typescript
let speedMultiplier = 1        // 动画速度倍率
let skipAnimationFlag = false  // 是否跳过动画
let performanceMode = 'normal' // 性能模式
let fpsMonitoring = false      // FPS 监控状态
let currentFPS = 60            // 当前 FPS
```

**核心函数:**

| 函数 | 签名 | 说明 |
|-----|------|------|
| `setAnimationSpeed(speed)` | `(number) => void` | 设置全局动画速度倍率 |
| `duration(baseMs, dataLength?)` | `(number, number?) => number` | 根据性能模式和 FPS 计算实际动画时长 |
| `wait(baseMs, anim?)` | `(number, Animation?) => Promise` | 异步等待指定时长，支持动画中止 |
| `transition(selectionFn, props, baseMs, easing)` | `(...) => Promise` | D3 过渡动画封装 |
| `sequence(steps)` | `(Step[]) => Promise` | 顺序执行动画步骤 |
| `createAnimation()` | `() => Animation` | 创建可中止的动画上下文 |
| `safeAnimate(animFn, label?)` | `(...) => Promise` | 统一动画错误捕获和 toast 提示 |
| `startFPSMonitoring()` | `() => void` | 启动 FPS 监控 |
| `stopFPSMonitoring()` | `() => void` | 停止 FPS 监控 |
| `getCurrentFPS()` | `() => number` | 获取当前 FPS |
| `applyPreset(preset)` | `(string) => void` | 应用动画预设 |
| `getCurrentPreset()` | `() => string` | 获取当前预设 |

**性能模式规则:**
| 数据量 | 模式 | 时长系数 |
|-------|------|---------|
| ≤ 15 | normal | 1.0 |
| 16-25 | medium | 0.75 |
| 26-40 | high | 0.5 |
| > 40 | critical | 0.25 |

**FPS 自适应规则:**
| FPS | 自适应行为 |
|-----|-----------|
| > 30 | 正常动画 |
| 15-30 | 动画时长减半 |
| < 15 | 跳过动画 |

**动画预设:**
| 预设 | 特点 |
|-----|------|
| `standard` | 标准动画（默认） |
| `soft` | 柔和动画（时长增加 50%） |
| `fast` | 快速动画（时长减半） |
| `dramatic` | 戏剧效果（时长增加 100%，使用 easeOutExpo） |
| `instant` | 瞬时（无动画） |

**缓动函数表 (`EASING`):**
| 名称 | D3 对应函数 | 适用场景 |
|-----|-----------|---------|
| `easeOutQuad` | `d3.easeQuadOut` | 一般过渡 |
| `easeOutCubic` | `d3.easeCubicOut` | 颜色变化 |
| `easeOutBack` | `d3.easeBackOut` | 弹性出现 |
| `easeOutElastic` | `d3.easeElasticOut` | 强调效果 |
| `easeInOut` | `d3.easeCubicInOut` | 位移动画 |
| `easeBounce` | `d3.easeBounceOut` | 掉落效果 |
| `linear` | `d3.easeLinear` | 匀速动画 |
| `easeOutExpo` | `d3.easeExpOut` | 快速启动缓慢收尾 |
| `easeInCubic` | `d3.easeCubicIn` | 入场动画 |
| `easeInOutQuad` | `d3.easeQuadInOut` | 对称过渡 |
| `easeInOutExpo` | `d3.easeExpInOut` | 强调对称过渡 |
| `easeInBack` | `d3.easeBackIn` | 弹性收缩 |

---

### 4.3 数组可视化

#### `renderArray(svg, data, options)`

**位置:** `src/visualizers/arrayVisualizer.ts`

**职责:** 将数组数据渲染为 D3 SVG 可视化：矩形条 + 数值文本 + 索引标注。

**渲染策略:** 采用**全量清除 + 全新渲染**模式（对齐 stackVisualizer/queueVisualizer），每次调用 `container.selectAll('*').remove()` 清除全部SVG内容后重新创建所有元素。不使用 D3 enter/update/exit 增量更新，避免 key 错位和动画残留。

**参数:**
| 参数 | 类型 | 说明 |
|-----|------|------|
| `svg` | `SVGSVGElement` | 目标 SVG 元素 |
| `data` | `number[]` | 数组数据 |
| `options` | `{ width, height, isDark? }` | 容器尺寸和主题 |

**布局常量:**
```typescript
const RECT_WIDTH = 60   // 矩形宽度
const RECT_HEIGHT = 50  // 矩形高度
const GAP = 10          // 元素间距
```

**大数据量优化:** 当 `data.length > LARGE_DATA_THRESHOLD(50)` 时，跳过 transition 动画，直接更新 DOM 属性。

#### `animateInsert(svg, index, value, oldData, options, anim)`

**职责:** 只做视觉引导（高亮 + 指示器），不改变元素位置、不创建新元素。元素位置变更和数据更新统一由 `insert()` + `renderArray()` 处理。

#### `animateDelete(svg, index, data, options, anim)`

**职责:** 只做目标元素删除动画（变红 + 下落淡出 + DOM移除），**不重新定位剩余元素**。位置重排由 `remove()` + `renderArray()` 的全量渲染处理。

---

### 4.4 主题管理

#### `useTheme()`

**位置:** `src/hooks/useTheme.ts`

**职责:** 管理应用主题状态，支持 light/dark/system 三种模式，自动持久化到 localStorage。

**返回值:**
| 字段 | 类型 | 说明 |
|-----|------|------|
| `mode` | `'light' \| 'dark' \| 'system'` | 当前设置的模式 |
| `resolved` | `'light' \| 'dark'` | 实际解析后的模式 |
| `cycle()` | `function` | 循环切换模式：light → dark → system → light |
| `set(mode)` | `function` | 直接设置模式 |

---

### 4.5 键盘快捷键

#### `useKeyboard(shortcuts, enabled)`

**位置:** `src/hooks/useKeyboard.ts`

**职责:** 监听键盘事件，根据快捷键配置分发操作。

**参数:**
| 参数 | 类型 | 说明 |
|-----|------|------|
| `shortcuts` | `Record<string, function>` | 快捷键映射，格式：`"ctrl+z": () => {}` |
| `enabled` | `boolean` | 是否启用监听 |

**支持的修饰键:**
- `ctrl` / `cmd` — Ctrl 或 Command 键
- `shift` — Shift 键

**输入框焦点防护:** 当焦点在输入框中时，仅允许 Ctrl 组合键，单字母快捷键被屏蔽。

**使用示例:**
```typescript
useKeyboard({
  'ctrl+z': undo,
  'ctrl+shift+z': redo,
  'r': reset,
}, !isAnimating)
```

#### `useCommonKeyboard()`

**位置:** `src/hooks/useCommonKeyboard.ts`

**职责:** 通用键盘快捷键封装，自动绑定撤销/重做/重置快捷键。

**参数:**
| 参数 | 类型 | 说明 |
|-----|------|------|
| `undo` | `function` | 撤销函数 |
| `redo` | `function` | 重做函数 |
| `reset` | `function` | 重置函数 |
| `enabled` | `boolean` | 是否启用 |

---

### 4.6 国际化管理

#### `useI18n()`

**位置:** `src/i18n/useI18n.ts`

**职责:** 提供翻译函数 `t(key)`，语言切换，localStorage 持久化。

**返回值:**
| 字段 | 类型 | 说明 |
|-----|------|------|
| `t(key)` | `function` | 翻译函数，传入翻译键返回对应语言文本 |
| `language` | `'zh' \| 'en'` | 当前语言 |
| `setLanguage(lang)` | `function` | 切换语言 |

---

### 4.7 分享功能

#### `encodeShareData(data, dataType)` / `decodeShareData(encoded)`

**位置:** `src/utils/shareUtils.ts`

**职责:** 将数据结构状态编码为 Base64 URL 安全的字符串，支持通过 URL 分享。

**参数:**
| 参数 | 类型 | 说明 |
|-----|------|------|
| `data` | `any` | 数据结构状态 |
| `dataType` | `string` | 数据类型标识 |
| `encoded` | `string` | Base64 编码字符串 |

---

## 5. 依赖关系

### 5.1 模块依赖图

```
App.tsx
├── Layout.tsx
│   ├── Sidebar.tsx → useTheme.ts → useI18n.ts
│   ├── KeyboardHelp.tsx → useGlobalSettings.ts
│   └── PerformanceMonitor.tsx
├── Home.tsx → useGlobalSettings.ts
├── ArrayPage.tsx → useArrayState + useVisualizer + arrayVisualizer + useCommonKeyboard
├── StackPage.tsx → useStackState + useVisualizer + stackVisualizer + useCommonKeyboard
├── QueuePage.tsx → useQueueState + useVisualizer + queueVisualizer + useCommonKeyboard
├── LinkedListPage.tsx → useLinkedListState + useVisualizer + linkedListVisualizer + useLearningMode
├── TreePage.tsx → useTreeState + useVisualizer + treeVisualizer + useLearningMode
├── GraphPage.tsx → useGraphState + useVisualizer + graphVisualizer + useCommonKeyboard
├── SortPage.tsx → useSortState + useVisualizer + sortVisualizer + algorithms/sorting + useLearningMode
├── HashPage.tsx → useHashState + useVisualizer + hashVisualizer + useLearningMode
├── HeapPage.tsx → useHeapState + useVisualizer + heapVisualizer + useCommonKeyboard
├── TriePage.tsx → useTrieState + useVisualizer + trieVisualizer + useCommonKeyboard
├── SortComparePage.tsx → useSortState + useVisualizer + sortVisualizer + PerformanceChart + Timeline
└── GraphAlgorithmPage.tsx → useGraphState + useVisualizer + graphVisualizer + algorithms/graph + StepExplainer + ComplexityChart
```

### 5.2 外部依赖

| 包名 | 版本 | 用途 |
|-----|------|------|
| `react` | ^19.2.6 | UI 框架 |
| `react-dom` | ^19.2.6 | React DOM 渲染 |
| `react-router-dom` | ^7.15.1 | 单页应用路由 |
| `d3` | ^7.9.0 | 数据可视化与动画 |
| `tailwindcss` | ^4.3.0 | 原子化 CSS 框架 |
| `vite` | ^8.0.12 | 构建工具 |
| `eslint` | ^10.3.0 | 代码质量检查 |
| `vitest` | ^4.0.0 | 单元测试框架 |
| `typescript` | ^5.8.3 | 类型系统 |
| `@types/d3` | ^7.4.3 | D3 类型声明 |
| `@types/react` | ^19.2.14 | React 类型声明 |
| `playwright` | ^1.60.0 | E2E 测试框架 |

### 5.3 关键依赖说明

**React 19:**
- 使用 `StrictMode` 进行开发时双重渲染检测
- 函数组件 + Hooks 架构
- 无类组件

**TypeScript 5.8:**
- 渐进式迁移成功，100% .ts/.tsx 覆盖
- 类型声明文件在 `types/` 目录
- `tsconfig.json` 配置 `allowJs: true` 支持渐进迁移

**D3.js v7:**
- 仅使用 `d3-selection`、`d3-transition`、`d3-force`、`d3-ease` 等子模块
- 不依赖 D3 的数据绑定更新模式（仅使用其动画和布局能力）
- 手动管理 SVG DOM 的 enter/update/exit
- 按需导入通过 `d3Imports.ts` 统一管理

**Tailwind CSS v4:**
- 使用 `@theme` 定义自定义设计令牌
- 使用 `@utility` 定义自定义工具类
- 深色模式通过 `dark:` 前缀和 `.dark` 类实现

---

## 6. 项目搭建与运行

### 6.1 环境要求

| 工具 | 最低版本 | 说明 |
|-----|---------|------|
| Node.js | 18.x | 运行时环境 |
| npm | 9.x | 包管理器 |
| Git | 2.x | 版本控制 |

### 6.2 安装步骤

```bash
# 1. 克隆仓库
git clone <repository-url>
cd ds-visualizer

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev
```

### 6.3 可用命令

| 命令 | 说明 | 输出 |
|-----|------|------|
| `npm run dev` | 启动开发服务器 | `http://localhost:3000/ds-visualizer/` |
| `npm run build` | 生产构建 | `dist/` 目录 |
| `npm run preview` | 预览生产构建 | `http://localhost:4173/` |
| `npm run lint` | 运行 ESLint 检查 | 控制台报告 |
| `npm run test` | 运行单元测试（watch 模式） | 控制台报告 |
| `npm run test:run` | 运行单元测试（单次） | 控制台报告 |
| `npm run test:coverage` | 生成测试覆盖率 | 覆盖率报告 |
| `npm run build:analyze` | 构建并分析 bundle | `stats.html` |

### 6.4 配置文件

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/ds-visualizer/',  // GitHub Pages 部署路径
  server: {
    port: 3000,
    open: true,
  },
})
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 7. 开发规范

### 7.1 代码风格

**命名规范:**
| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件文件 | PascalCase | `ArrayPage.tsx` |
| 工具文件 | camelCase | `arrayVisualizer.ts` |
| Hook 文件 | camelCase，前缀 `use` | `useArrayState.ts` |
| 组件名 | PascalCase | `function ArrayPage()` |
| 函数名 | camelCase | `function handleInsert()` |
| 常量 | UPPER_SNAKE_CASE | `const MAX_HISTORY = 20` |
| CSS 类 | kebab-case | `array-item` |
| 类型/接口 | PascalCase | `interface ArrayStateOptions` |

**文件组织:**
- 每个组件/Hook 单独文件
- 相关文件就近放置（visualizer 与 page 对应）
- 公共组件放入 `components/`
- 类型声明放入 `types/`

### 7.2 组件开发规范

**函数组件模板:**
```typescript
import { useState, useCallback, useMemo } from 'react'

interface ComponentNameProps {
  prop1: string
  prop2?: number
}

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  const [state, setState] = useState(initialValue)

  const handleAction = useCallback(() => {
    // 逻辑
  }, [deps])

  const computedValue = useMemo(() => {
    // 计算
    return result
  }, [deps])

  return (
    <div className="...">
      {/* JSX */}
    </div>
  )
}
```

### 7.3 动画开发规范

**动画函数模板:**
```typescript
export async function animateOperation(
  svg: SVGSVGElement,
  data: any,
  options: RenderOptions,
  anim?: AnimationContext
): Promise<void> {
  const container = d3.select(svg)

  // 1. 检查是否已中止
  if (anim?.isAborted?.()) return

  // 2. 执行 D3 过渡
  await new Promise<void>((resolve) => {
    container.select('...')
      .transition()
      .duration(duration(300))
      .ease(EASING.easeOutCubic)
      .attr('...', '...')
      .on('end', resolve)
  })

  // 3. 每步检查后中止状态
  if (anim?.isAborted?.()) return
}
```

**约束:**
| 约束 | 说明 |
|-----|------|
| 动画只做视觉引导 | 高亮、指示器、颜色变化 |
| 动画不改变位置 | 位置重排由 render 函数处理 |
| 动画不创建持久 DOM | 临时元素在动画结束时清理 |
| 动画必须支持中止 | 检查 `anim?.isAborted?.()` |

### 7.4 Git 提交规范

**提交信息格式:**
```
<type>(<scope>): <subject>

<body>
```

**类型说明:**
| 类型 | 用途 |
|-----|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建/工具相关 |
| `types` | 类型定义更新 |

### 7.5 新增数据结构流程

如需添加新的数据结构可视化，按以下步骤进行：

1. **创建 State Hook:** `src/hooks/use<Name>State.ts`
   - 使用 `useHistory` 集成 Undo/Redo
   - 实现数据结构操作逻辑
   - 添加日志和 Toast 通知
   - 添加撤销预览支持

2. **创建 Visualizer:** `src/visualizers/<name>Visualizer.ts`
   - 实现 `render<Name>` 渲染函数
   - 实现动画函数（可选）
   - 使用 `animationEngine.ts` 工具
   - 支持暗色模式和主题色

3. **创建 Page:** `src/pages/<Name>Page.tsx`
   - 使用 `use<Name>State` 和 `useVisualizer`
   - 集成 `useCommonKeyboard` 快捷键
   - 组合公共组件（UndoPreviewButton、ShareButton 等）
   - 可选集成 `useLearningMode`

4. **注册路由:** `src/App.tsx`
   - 添加 `<Route>` 配置（使用 React.lazy）

5. **添加导航:** `src/components/Sidebar.tsx`
   - 在 `structures` 数组中添加条目

6. **更新首页:** `src/pages/Home.tsx`
   - 在 `structures` 数组中添加卡片数据

7. **添加测试:** `src/__tests__/use<Name>State.test.ts`
   - 为核心 Hook 编写单元测试

8. **更新文档:**
   - 更新 `README.md`、`CODE_WIKI.md`、`ARCHITECTURE.md`

---

## 附录

### A. 项目文件清单

```
📦 ds-visualizer
├── 📁 .github/workflows/
│   ├── ci.yml                  # GitHub Actions CI/CD（Node 矩阵测试）
│   └── deploy.yml              # GitHub Pages 自动部署
├── 📁 public/
│   ├── favicon.svg
│   └── icons.svg
├── 📁 src/
│   ├── 📁 algorithms/          # 算法实现
│   │   ├── 📁 sorting/         # 8 种排序算法
│   │   │   ├── bubbleSort.ts
│   │   │   ├── selectionSort.ts
│   │   │   ├── insertionSort.ts
│   │   │   ├── quickSort.ts
│   │   │   ├── mergeSort.ts
│   │   │   ├── heapSort.ts
│   │   │   ├── radixSort.ts
│   │   │   ├── bucketSort.ts
│   │   │   └── index.ts
│   │   └── 📁 graph/           # 4 种图算法
│   │       ├── bfs.ts
│   │       ├── dfs.ts
│   │       ├── dijkstra.ts
│   │       ├── topoSort.ts
│   │       └── index.ts
│   ├── 📁 assets/              # 静态资源
│   ├── 📁 components/          # 公共 UI 组件（20+ 个）
│   │   ├── ComplexityChart.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── ExportImport.tsx
│   │   ├── KeyboardHelp.tsx
│   │   ├── Layout.tsx
│   │   ├── LogPanel.tsx
│   │   ├── NetworkStatus.tsx
│   │   ├── OperationBar.tsx
│   │   ├── PageHeader.tsx
│   │   ├── PerformanceChart.tsx
│   │   ├── PerformanceMonitor.tsx
│   │   ├── ShareButton.tsx
│   │   ├── Sidebar.tsx
│   │   ├── SpeedControl.tsx
│   │   ├── StepExplainer.tsx
│   │   ├── Timeline.tsx
│   │   ├── Toast.tsx
│   │   ├── UndoPreviewButton.tsx
│   │   ├── UndoRedoBar.tsx
│   │   ├── Visualizer.tsx
│   │   └── toastStore.ts
│   ├── 📁 hooks/               # 自定义 Hooks（17+ 个）
│   │   ├── useArrayState.ts
│   │   ├── useCommonKeyboard.ts
│   │   ├── useDataStructureState.ts
│   │   ├── useGlobalSettings.ts
│   │   ├── useGraphState.ts
│   │   ├── useHashState.ts
│   │   ├── useHeapState.ts
│   │   ├── useHistory.ts
│   │   ├── useI18n.ts
│   │   ├── useKeyboard.ts
│   │   ├── useLearningMode.ts
│   │   ├── useLinkedListState.ts
│   │   ├── useQueueState.ts
│   │   ├── useSortState.ts
│   │   ├── useStackState.ts
│   │   ├── useTheme.ts
│   │   ├── useTreeState.ts
│   │   ├── useTrieState.ts
│   │   └── useVisualizer.ts
│   ├── 📁 i18n/                # 国际化
│   │   ├── locales.ts
│   │   └── useI18n.ts
│   ├── 📁 pages/               # 页面组件（13 个）
│   │   ├── ArrayPage.tsx
│   │   ├── GraphAlgorithmPage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── HashPage.tsx
│   │   ├── HeapPage.tsx
│   │   ├── Home.tsx
│   │   ├── LinkedListPage.tsx
│   │   ├── QueuePage.tsx
│   │   ├── SortComparePage.tsx
│   │   ├── SortPage.tsx
│   │   ├── StackPage.tsx
│   │   ├── TreePage.tsx
│   │   └── TriePage.tsx
│   ├── 📁 configs/             # 配置模块
│   │   └── 📁 learning/        # 学习模式算法步骤配置
│   │       ├── types.ts        # 类型重新导出
│   │       ├── index.ts        # 统一导出 18 种算法配置
│   │       ├── bfs.config.ts
│   │       ├── dfs.config.ts
│   │       ├── dijkstra.config.ts
│   │       ├── topoSort.config.ts
│   │       ├── bubble.config.ts
│   │       ├── quick.config.ts
│   │       ├── merge.config.ts
│   │       ├── heap.config.ts
│   │       ├── linkedlist.config.ts
│   │       ├── doublyLinkedList.config.ts
│   │       ├── tree.config.ts
│   │       └── hash.config.ts
│   ├── 📁 types/               # TypeScript 类型声明
│   │   ├── animationEngine.d.ts
│   │   ├── hooks.d.ts
│   │   ├── toastStore.d.ts
│   │   ├── validate.d.ts
│   │   ├── visualizers.d.ts
│   │   └── learning.d.ts       # 学习模式类型声明
│   ├── 📁 utils/               # 工具函数
│   │   ├── animationEngine.ts
│   │   ├── d3Imports.ts
│   │   ├── dataExport.ts
│   │   ├── debounce.ts
│   │   ├── performanceBenchmark.ts
│   │   ├── shareUtils.ts
│   │   ├── themeColors.ts
│   │   ├── timeslicing.ts
│   │   └── validate.ts
│   ├── 📁 visualizers/         # D3 可视化引擎
│   │   ├── arrayVisualizer.ts
│   │   ├── graphVisualizer.ts
│   │   ├── hashVisualizer.ts
│   │   ├── heapVisualizer.ts
│   │   ├── linkedListVisualizer.ts
│   │   ├── queueVisualizer.ts
│   │   ├── sortVisualizer.ts
│   │   ├── stackVisualizer.ts
│   │   ├── treeVisualizer.ts
│   │   └── trieVisualizer.ts
│   ├── 📁 __tests__/           # 单元测试
│   │   ├── animationEngine.test.ts
│   │   ├── ComplexityChart.test.tsx
│   │   ├── dataExport.test.ts
│   │   ├── graphAlgorithms.test.ts
│   │   ├── LogPanel.test.tsx
│   │   ├── performanceChart.test.tsx
│   │   ├── shareUtils.test.ts
│   │   ├── sorting.test.ts
│   │   ├── StepExplainer.test.tsx
│   │   ├── themeColors.test.ts
│   │   ├── timeline.test.tsx
│   │   ├── useArrayState.test.ts
│   │   ├── useCommonKeyboard.test.ts
│   │   ├── useDataStructureState.test.ts
│   │   ├── useGraphState.test.ts
│   │   ├── useHashState.test.ts
│   │   ├── useHeapState.test.ts
│   │   ├── useHistory.test.ts
│   │   ├── useKeyboard.test.ts
│   │   ├── useLearningMode.test.ts
│   │   ├── useLinkedListState.test.ts
│   │   ├── useQueueState.test.ts
│   │   ├── useSortState.test.ts
│   │   ├── useStackState.test.ts
│   │   ├── useTreeState.test.ts
│   │   ├── useTrieState.test.ts
│   │   ├── useVisualizer.test.ts
│   │   └── validate-enhanced.test.ts
│   ├── App.tsx                 # 路由配置
│   ├── main.tsx                # 应用入口
│   ├── App.css                 # 组件样式
│   └── index.css               # 全局样式 + Tailwind 配置
├── 📁 docs/                    # 文档
│   ├── 📁 superpowers/plans/   # 实施计划
│   ├── PRD.md                  # 产品需求文档
│   ├── Phase1-优化实施计划.md
│   ├── 优化实施计划.md
│   ├── 优化建议报告.md
│   ├── 实施计划.md
│   └── 项目分析与改进计划.md
├── 📁 e2e/                     # E2E 测试
│   ├── test-advanced.js
│   ├── test-core.js
│   ├── test-edge.js
│   ├── test-helpers.js
│   ├── test-home.js
│   ├── test-v5-features.js
│   └── run-all-tests.js
├── CODE_WIKI.md               # 本文件
├── README.md                  # 项目说明
├── ARCHITECTURE.md            # 架构文档
├── TODO.md                    # 待办列表
├── CHANGELOG.md               # 变更日志
├── PROJECT_SUMMARY.md         # 项目摘要
├── WORKLOG.md                 # 工作日志
├── index.html                 # HTML 模板
├── package.json               # 依赖配置
├── tsconfig.json              # TypeScript 配置
├── vite.config.ts             # Vite 配置
├── vitest.config.ts           # Vitest 配置
└── eslint.config.js           # ESLint 配置
```

### B. 颜色令牌

| 名称 | 浅色值 | 深色值 | Tailwind 类 |
|-----|-------|-------|------------|
| 背景 | `#faf8f5` | `#0f172a` | `bg-paper` / `dark:bg-dark-paper` |
| 主文字 | `#1a1a2e` | `#e2e8f0` | `text-ink` / `dark:text-dark-ink` |
| 次文字 | `#4a4a6a` | `#94a3b8` | `text-ink-light` / `dark:text-dark-ink-light` |
| 边框 | `#1a1a2e` | `#334155` | `border-ink` / `dark:border-dark-border` |
| 主色 | `#2563eb` | - | `bg-accent-blue` |
| 成功 | `#059669` | - | `bg-accent-emerald` |
| 警告 | `#d97706` | - | `bg-accent-amber` |
| 错误 | `#e11d48` | - | `bg-accent-rose` |

### C. 快捷键汇总

| 快捷键 | 功能 | 适用页面 |
|-------|------|---------|
| `Ctrl + Z` | 撤销 | 所有操作页面 |
| `Ctrl + Shift + Z` | 重做 | 所有操作页面 |
| `R` | 重置 | 所有操作页面 |
| `Space` | 暂停/继续排序 | SortPage |
| `?` | 显示快捷键帮助 | 全局 |
| `Esc` | 关闭弹窗 | 全局 |
| `Ctrl + 滚轮` | 缩放可视化区域 | 所有操作页面 |
| `← / →` | Timeline 步骤导航 | 所有操作页面 |

---

> 本文档最后更新于 2026-06-01，与代码库版本 v6.4 同步维护。
