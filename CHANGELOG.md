# 数据结构学习助手 - 变更日志

> 所有重要变更都将记录在此文件中。

---

## [v6.4.0] - 2026-06-01

### 重构
- **学习配置模块化:** `useLearningMode.ts` 从 ~650 行精简至 62 行，配置数据迁移至 `src/configs/learning/`
- **关注点分离:** 18 种算法学习步骤独立为 `*.config.ts` 文件，Hook 仅保留状态管理逻辑
- **类型独立:** 新增 `src/types/learning.d.ts`，`LearningStep` / `LearningModeConfig` 类型全局可引用

### 新增
- **双向链表学习模式:** `doublyLinkedList.config.ts` + LinkedListPage 单向/双向切换功能
- **配置模块文档:** `src/configs/learning/README.md` 含完整使用指南和示例
- **18 个算法配置文件:** bfs/dfs/dijkstra/topoSort/bubble/quick/merge/heap/linkedlist/doublyLinkedList/tree/hash/array/stack/queue/heapStructure/trie/graph

### 修改
- `src/hooks/useLearningMode.ts` — 移除 600 行硬编码，改为导入 `learningConfigs`
- `src/components/StepExplainer.tsx` — 类型引用路径更新
- `src/__tests__/StepExplainer.test.tsx` — 类型引用路径更新
- `src/pages/LinkedListPage.tsx` — 添加学习模式类型切换按钮
- `src/components/Sidebar.tsx` — 版本号更新至 V6.4

### 文档更新
- `ARCHITECTURE.md` — 新增配置层、更新学习模式数据流、补充扩展性设计
- `CODE_WIKI.md` — 更新 useLearningMode 文档、文件清单、测试统计
- `PROJECT_SUMMARY.md` — 添加 v6.4 迭代记录和成果总结

### 影响
- Lint 0 errors，build 通过，530+ tests 全部通过
- 新增算法学习步骤无需修改 Hook，只需创建配置文件并注册
- 代码可读性显著提升，useLearningMode.ts 职责单一

---

## [v3.9.0] - 2026-05-31

### 新增
- **国际化（i18n）页面集成:** 11 个数据页面 + Home + 4 个公共组件全部使用 `t()` 翻译
- **locales.js 扩展翻译键:** visualizer/shortcuts/page/performanceChart/timeline/emptyState/logPanel/exportImport 全覆盖
- **PerformanceChart 组件:** D3 柱状图对比排序算法性能（比较次数/交换次数/总步数三维度）
- **Timeline 组件:** 操作历史时间线，自动图标匹配（+−🔍↺↪⇄），水平滚动，点击跳转
- **SortComparePage 增强:** 集成 PerformanceChart（算法完成后自动显示）+ Timeline（日志可视化）

### 优化
- **EmptyState 组件:** 从硬编码 title/description 改为 titleKey/descriptionKey 属性
- **LogPanel 组件:** 国际化集成（title/autoScroll/freeze/noLogs）
- **ExportImport 组件:** 国际化集成（export/import/tooltip），i18n 替代硬编码
- **KeyboardHelp 组件:** 国际化集成（title/close/所有快捷键描述）
- **Home.jsx 国际化:** 标题/描述/功能卡片全部使用 t()
- **11 数据页面:** Array/Stack/Queue/LinkedList/Tree/Graph/Sort/Hash/Heap/Trie/SortCompare 全覆盖

### 影响
- 完整中英文切换体验，无硬编码残留
- 新组件 PerformanceChart 使用 D3 按需导入（d3Imports.js）
- Timeline 组件支持 Neo-Brutalism 设计风格
- Lint 0 errors，build 通过，215 tests 全部通过
- JS Bundle: 449.49 KB (gzip 132.48 KB), CSS: 62.73 KB (gzip 10.87 KB)

---

## [v3.8.0] - 2026-05-31

### 新增
- **useTrieState 单元测试:** 35 tests — 插入/删除/查找/前缀匹配/扁平化/撤销重做/loadData/边界条件
- **useHeapState 单元测试:** 25 tests — 插入/ExtractMax/Peek/边界/撤销重做/loadData/单元素堆
- **useHashState 单元测试:** 32 tests — 插入/删除/查找/冲突/hashFn/撤销重做/loadData

### 优化
- **README.md 同步至 v3.7:** 版本/功能列表/技术栈/v3.2-v3.7 变更历史完整更新
- **D3 大数据量渲染优化:** sortVisualizer >100 元素时跳过 transition 动画，直接更新 DOM 属性
- **测试总数:** 从 123 tests 扩展到 215 tests（11 个测试文件，全部通过）

### 影响
- 新数据结构（Trie/Heap/Hash）的 State Hooks 核心逻辑获得完整测试覆盖
- 排序算法在大数据量（>100 元素）场景下渲染性能提升，避免不必要的过渡动画开销
- Lint 0 errors，build 通过，215 tests 全部通过
- JS Bundle: 438.98 KB (gzip 129.39 KB), CSS: 62.22 KB (gzip 10.79 KB)

---

## [v3.7.0] - 2026-05-30

### 新增
- **国际化（i18n）核心架构:** 轻量级翻译系统，无第三方依赖
- **locales.js:** 中文（zh）+ 英文（en）完整翻译（侧边栏、设置、操作、提示等）
- **useI18n hook:** `t(key)` 翻译函数，localStorage 持久化语言选择
- **GlobalSettingsProvider:** i18n 集成到全局上下文，所有组件可通过 `useGlobalSettings()` 访问
- **Sidebar 国际化:** 数据结构名称动态翻译（`t('sidebar.xxx')`）
- **SpeedControl 国际化:** 速度标签翻译（`t('settings.animationSpeed')`）
- **eslint.config.js:** 测试文件 globals 配置（beforeEach/vi/describe/it/expect）

### 影响
- 项目支持中英文切换，为后续多语言扩展奠定基础
- i18n 架构轻量无依赖，不增加 bundle 体积
- Lint 0 errors，build 通过，123 tests 全部通过

### P3 任务完成状态
- ✅ P3-任务9: 算法对比模式（v3.5）
- ✅ P3-任务10: 数据持久化（v3.6）
- ✅ P3-任务11: 国际化（v3.7）

---

## [v3.6.0] - 2026-05-30

### 新增
- **数据持久化（localStorage）:** 10 种数据结构数据自动保存/恢复
- **useDataStructureState.js:** 增加 `storageKey` 选项，传入后自动保存/加载数据
- **useDataStructureState.js:** 页面刷新后自动从 localStorage 恢复数据（toast 提示）
- **useDataStructureState.js:** 重置操作自动清除持久化数据
- **10 个 Hook 集成:** array/stack/queue/linkedlist/tree/graph/sort/hash/heap/trie 全部启用持久化
- **setup.js:** 测试环境 `beforeEach` 清除 localStorage 避免干扰

### 影响
- 所有数据结构页面刷新后保留上次操作数据
- 用户关闭/重新打开浏览器后数据不丢失
- Lint 0 errors，build 通过，123 tests 全部通过

---

## [v3.5.0] - 2026-05-30

### 新增
- **算法对比模式（Sort Compare）:** 新增排序算法并行对比页面
- **SortComparePage.jsx:** 多算法并行执行，Promise.all 同时运行
- **SortComparePage.jsx:** 算法选择面板（2x3 网格布局，点击切换选择，运行时锁定）
- **SortComparePage.jsx:** ComparePanel 组件 — 每个算法独立 SVG 可视化
- **SortComparePage.jsx:** 实时进度追踪（比较次数、交换次数、进度条）
- **SortComparePage.jsx:** 随机数据生成 + 重置功能
- **路由注册:** `/compare` 路由 + 侧边栏导航入口

### 影响
- 排序算法对比从单算法顺序执行升级为多算法并行执行
- 可直观对比不同算法在同一数据下的性能差异
- Lint 0 errors，build 通过，123 tests 全部通过

---

## [v3.4.0] - 2026-05-30

### 新增
- **字典树（Trie / Prefix Tree）:** 新增数据结构页面，字符串高效检索 + 前缀匹配
- **useTrieState.js:** `insert(word)`、`delete(word)`、`search(word)`、`searchPrefix(prefix)` 方法
- **useTrieState.js:** 不可变 Trie 实现，支持撤销/重做（深拷贝节点树）
- **useTrieState.js:** 空路径自动清理（删除单词后自动移除无用节点）
- **trieVisualizer.js:** 树形层级布局，根节点紫色/结束节点绿色（✓ 标记）/中间节点蓝色
- **trieVisualizer.js:** 边标签可视化（字符琥珀色圆圈），帮助理解前缀构建过程
- **trieVisualizer.js:** `animateInsertTrie`、`animateSearchTrie`、`animateDeleteTrie` 动画
- **TriePage.jsx:** 插入/删除/查找/前缀匹配操作，撤销/重做支持
- **路由注册:** `/trie` 路由 + 侧边栏导航入口

### 优化
- **TriePage.jsx:** 移除未使用的 data 变量
- **trieVisualizer.js:** 修复 animateInsertTrie 中未使用的 word 参数
- **trieVisualizer.js:** 修复 layout 返回中未使用的 nodes 变量

### 影响
- 数据结构从 9 个扩展到 10 个
- 字典树支持字符串前缀匹配，可视化展示字符路径
- 课程演示可展示 Trie 的插入、查找、前缀匹配算法
- Lint 0 errors，build 通过，123 tests 全部通过

---

## [v3.3.0] - 2026-05-30

### 新增
- **堆（Max Heap）:** 新增数据结构页面，完全二叉树 · 最大堆 · 优先级队列
- **useHeapState.js:** `insert(value)`、`extractMax()`、`peek()` 方法，堆属性自动维护
- **heapVisualizer.js:** 完全二叉树层级布局，根节点紫色/叶子节点绿色/违规红色
- **heapVisualizer.js:** 堆属性违规检测（子节点 > 父节点时红色虚线连接）
- **heapVisualizer.js:** `animateInsertHeap` 插入动画（琥珀色弹出 → 蓝色恢复）
- **heapVisualizer.js:** `animateExtractHeap` 提取动画（根节点绿色放大 → 紫色恢复）
- **heapVisualizer.js:** `animatePeekHeap` 查看动画（根节点轻微放大）
- **HeapPage.jsx:** Insert、Extract Max、Peek 按钮，撤销/重做支持
- **路由注册:** `/heap` 路由 + 侧边栏导航入口

### 优化
- **HeapPage.jsx:** 移除未使用的 getAnimationContext 和 anim 变量
- **heapVisualizer.js:** 修复 animateExtractHeap 和 animatePeekHeap 中未使用的 data 参数

### 影响
- 数据结构从 8 个扩展到 9 个
- 堆支持最大堆属性自动维护，违规实时可视化
- 完全二叉树层级布局算法支持任意节点数量
- Lint 0 errors，build 通过，123 tests 全部通过

---

## [v3.2.0] - 2026-06-06

### 新增
- **哈希表（Hash Table）:** 新增数据结构页面，取模哈希（key % 7），链地址法解决冲突
- **useHashState.js:** `insert(key, value)`、`remove(key)`、`search(key)` 方法
- **hashVisualizer.js:** 桶数组可视化（7 个桶），链表冲突节点 + 箭头连接
- **HashPage.jsx:** 插入/删除/查找操作，键+值双输入
- **路由注册:** `/hash` 路由 + 侧边栏导航入口

### 影响
- 数据结构从 7 个扩展到 8 个
- 哈希表支持键值对存储，冲突可视化展示
- 课程演示可展示取模哈希和链地址法

---

## [v3.1.0] - 2026-06-05

### 新增
- **animationEngine:** `safeAnimate()` 函数 — 统一动画错误捕获和 toast 提示
- **ErrorBoundary:** 开发模式堆栈详情展示（`<details>` 折叠面板）

### 优化
- **ErrorBoundary.jsx:** Neo-Brutalism 风格异常 UI，替代 EmptyState
- **ErrorBoundary.jsx:** 组件异常自动触发 `showToast` 错误提示
- **错误恢复:** 渲染异常时显示重试按钮，支持手动恢复

### 影响
- 动画执行失败时不再静默崩溃，用户获得明确反馈
- 开发模式下可直接查看组件堆栈，加速调试

---

## [v3.0.0] - 2026-06-05

### 新增
- **可视化网格开关:** Visualizer 右下角控制区增加 `#` 按钮，切换 dot-grid 背景显示

### 优化
- **Visualizer.jsx:** showGrid 状态控制网格渲染
- **用户体验:** 可根据演示需要关闭网格，获得干净背景

---

## [v2.9.0] - 2026-06-05

### 优化
- **图力导向模拟:** 增加 alphaDecay(0.02) + velocityDecay(0.4)，减少不必要的 tick 计算
- **SpeedControl:** 使用 React.memo 减少父组件重渲染时的无用更新
- **性能:** 图页面节点 > 20 时模拟收敛更快，主线程占用降低

---

## [v2.8.0] - 2026-06-04

### 新增
- **链表按位置插入:** insertAt(index, value)，指定索引插入节点
- **链表反转可视化:** 逐步节点变色（橙色）→ 位置移动 → 恢复蓝色
- **链表环检测可视化:** 快慢指针算法，慢指针黄色、快指针红色逐步高亮
- **linkedListVisualizer.js:** `animateInsertAt` - 按位置插入动画
- **linkedListVisualizer.js:** `animateReverse` - 反转动画
- **linkedListVisualizer.js:** `animateCycleDetection` - 环检测动画

### 优化
- **useLinkedListState.js:** 新增 `insertAt(index, value)`、`reverse()`、`detectCycle()` 方法
- **LinkedListPage.jsx:** 添加位置插入、反转、环检测按钮

### 影响
- 链表操作从 4 种扩展到 7 种（头插、尾插、位置插入、删除、查找、反转、环检测）
- 环检测使用快慢指针算法（Floyd 算法）可视化

---

## [v2.7.0] - 2026-06-03

### 新增
- **二叉树层序遍历:** BFS 算法，队列式遍历，逐层高亮动画
- **二叉树查找:** BST 查找算法，查找路径逐步高亮，找到时显示 ✓ 标记
- **二叉树删除节点:** 三种情况处理（叶子节点、单子树节点、双子树节点用后继值替代）
- **treeVisualizer.js:** `animateLevelOrder` - 层序遍历动画
- **treeVisualizer.js:** `animateSearch` - 查找路径高亮动画
- **treeVisualizer.js:** `animateDeleteNode` - 删除节点收缩动画

### 优化
- **useTreeState.js:** 新增 `levelorder()`、`search(value)`、`deleteNode(value)` 方法
- **TreePage.jsx:** 添加删除按钮、查找输入框、层序遍历按钮

### 影响
- 二叉树操作从 4 种（插入+3 种遍历）扩展到 7 种（插入+4 种遍历+查找+删除）
- 删除节点自动处理三种边界情况
- 查找路径可视化帮助理解 BST 查找算法

---

## [v2.6.0] - 2026-06-02

### 新增
- **单元测试:** `useArrayState.test.js` (29 tests) - 数组操作全覆盖（insert/remove/search/randomize/reset/loadData/undo/redo）
- **单元测试:** `useStackState.test.js` (13 tests) - 栈操作全覆盖（push/pop/peek/clear/边界条件）
- **单元测试:** `useQueueState.test.js` (13 tests) - 队列操作全覆盖（enqueue/dequeue/front/clear/边界条件）
- **单元测试:** `useSortState.test.js` (13 tests) - 排序状态全覆盖（randomize/reset/runAlgorithm/进度追踪）
- **单元测试:** `dataExport.test.js` (13 tests) - 导入导出全覆盖（格式验证/字段验证/错误处理）

### 优化
- **测试总数:** 从 42 tests 扩展到 123 tests（8 个测试文件，全部通过）
- **核心覆盖:** State Hooks 核心逻辑测试覆盖率达到 > 70%
- **测试质量:** 边界条件、异常场景、边界值测试全覆盖

### 影响
- 核心状态管理逻辑测试覆盖完整，回归风险大幅降低
- 所有新增算法（Quick Sort、Merge Sort、Heap Sort）通过 runAlgorithm 间接测试
- ESLint 0 errors，build 通过

---

## [v2.4.0] - 2026-06-01

### 新增
- **测试框架:** 配置 Vitest + @testing-library/react，支持 `npm run test`
- **单元测试:** `validate.test.js` (14 tests) - 输入验证全覆盖
- **单元测试:** `useHistory.test.js` (9 tests) - 撤销/重做逻辑全覆盖
- **单元测试:** `animationEngine.test.js` (19 tests) - 动画引擎全覆盖
- **新脚本:** `npm run test:run`, `npm run test:coverage`

### 优化
- **D3 按需导入:** 所有 visualizer 改用 `src/utils/d3Imports.js` 按需导入子模块
- **图页面重构:** GraphPage force 视图改用 `Visualizer` 组件，支持缩放功能
- **React.memo:** `PageHeader`, `OperationBar` 及子组件添加 memo 减少重渲染
- **文档完善:** 更新 `项目分析与改进计划.md` 标记已完成项，新增 v2.4 成果总结

### 影响
- 自动化测试 42 个全部通过，核心逻辑 100% 覆盖
- 组件模式统一（图页面不再使用自定义 SVG）
- 纯展示组件减少不必要重渲染
- 项目总体评分 7.2 → 8.1

---

## [v2.3.0] - 2026-05-31

### 修复
- **treeVisualizer.js:** 添加 `resetNodeAndEdgeColors` 函数，遍历前自动重置颜色
- **treeVisualizer.js:** `renderTree` 添加 `.interrupt()` 中断 D3 过渡
- **graphVisualizer.js:** `renderGraph` 添加清除旧 simulation 逻辑
- **graphVisualizer.js:** 导出 `clearGraphSimulation` 函数
- **useGraphState.js:** 重写 `reset` 函数，同时重置 nodes 和 links
- **GraphPage.jsx:** 使用 `viewBox` 替代 `width/height` 属性
- **sortVisualizer.js:** `renderSortBars` update 分支重置 fill/stroke
- **sortVisualizer.js:** 清除排序完成时的 "SORTED" 标签

### 影响
- 二叉树遍历后颜色正确重置
- 图重置功能恢复正常
- 排序重置后柱子颜色正确恢复

---

## [v2.2.0] - 2026-05-30

### 修复
- **useVisualizer.js:** 添加 `useLayoutEffect` 首次渲染前计算真实尺寸
- **ArrayPage.jsx:** 添加 `flex flex-col` 正确约束子元素高度
- **arrayVisualizer.js:** `layout` 函数 `startY` 使用 `Math.floor` 避免亚像素偏移
- **arrayVisualizer.js:** 采用全量清除 + 全新渲染模式
- **index.css:** dot-grid 背景从 radial-gradient 改为 linear-gradient

### 新增
- **sorting/algorithms:** 排序算法插件注册模式
- **algorithms/sorting/index.js:** 排序算法注册表

### 影响
- 数组可视化元素不再下沉
- 数组可视化不再闪烁
- SVG 坐标系统一，消除双坐标系问题
- 排序算法支持插件化扩展

---

## [v2.1.0] - 2026-05-30

### 修复
- **validate.js:** 统一输入验证逻辑，导出 `getValidationError`
- **所有 Page 组件:** 使用 `getValidationError` 替代内联验证
- **arrayVisualizer.js:** 空数组时正确清除所有 SVG 元素
- **ExportImport.jsx:** 错误提示从 `alert()` 改为 `showToast()`
- **所有 Page 组件:** `parseInt()` 添加 radix 参数（10）
- **所有 Page 组件:** 动画错误通过 `showToast` 反馈

### 优化
- **useArrayState.js:** 提取 `MAX_SIZE` 常量
- **useArrayState.js:** 参数命名更清晰（`rawValue` 替代 `value`）

### 影响
- 输入验证统一化，行为一致
- 错误提示统一使用 Toast 系统
- 代码可维护性提升

---

## [v2.0.0] - 2026-05-29

### 新增
- 完整的 7 个数据结构可视化模块
- Neo-Brutalism 设计风格
- Undo/Redo 支持
- 键盘快捷键
- 操作日志系统
- 深色/浅色模式
- 导入/导出功能
- 视图缩放功能
- 响应式布局

### 技术栈
- React 19
- Vite 8
- D3.js 7
- Tailwind CSS 4
- React Router 7

---

## 版本格式说明

- **主版本号 (X.0.0):** 重大架构变更或不兼容更新
- **次版本号 (0.X.0):** 新功能或重大修复
- **修订版本号 (0.0.X):** 小修复和优化

> 本文档遵循 [语义化版本 2.0.0](https://semver.org/lang/zh-CN/)