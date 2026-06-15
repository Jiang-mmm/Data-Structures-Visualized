# 数据结构学习助手

> **版本:** v6.5
> **更新日期:** 2026-06-15
> **技术栈:** React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + React Router v7 + Vitest
> **在线体验:** https://jiang-mmm.github.io/Data-Structures-Visualized/

一款面向大学生的 Web 端数据结构可视化教学工具，通过交互式动画演示，帮助学习者直观理解核心数据结构的原理与操作过程。

## 核心功能

| 数据结构 | 支持操作 |
|---------|---------|
| **数组 Array** | 插入、删除、查找、随机生成、导入/导出 |
| **栈 Stack** | Push、Pop、Peek、Clear |
| **队列 Queue** | Enqueue、Dequeue、Front、Clear |
| **链表 LinkedList** | 头插、尾插、按位置插入、删除、查找、反转、环检测 |
| **二叉树 BinaryTree** | 插入、前序/中序/后序/层序遍历、查找、删除节点 |
| **图 Graph** | 添加/删除节点和边、BFS、DFS、Dijkstra、邻接矩阵/表视图 |
| **排序 Sorting** | 冒泡、选择、插入、快速、归并、堆、基数、桶排序（8 种算法） |
| **哈希表 Hash Table** | 插入、删除、查找（取模哈希 + 链地址法） |
| **堆 Heap** | Insert、ExtractMax、Peek（最大堆 + 违规检测） |
| **字典树 Trie** | 插入、删除、查找、前缀匹配（边标签可视化） |
| **算法对比 SortCompare** | 8 种排序算法并行对比，实时进度追踪，性能图表 |
| **图算法 GraphAlgorithm** | BFS、DFS、Dijkstra、拓扑排序可视化 + 学习模式 |

## 关键特性

- **Neo-Brutalism 设计风格** — 粗边框、硬阴影、高对比度配色
- **实时动画反馈** — 基于 D3.js 的数据驱动动画，支持速度调节和动画预设
- **操作日志系统** — 时间戳 + 操作类型 + 详情的完整执行记录
- **Undo/Redo 支持** — 基于历史栈的状态回溯（动画期间自动禁用）
- **撤销预览** — 悬停显示撤销/重做后的数据状态预览
- **键盘快捷键** — Ctrl+Z 撤销、Ctrl+Shift+Z 重做、R 重置、? 帮助、左右箭头导航 Timeline
- **输入验证** — 数值范围 1~99，索引边界检查，非法输入 Toast 提示
- **导入/导出** — 数据持久化，支持 JSON/CSV 格式导入导出，含版本校验
- **数据持久化** — 11 种数据结构自动保存/恢复，页面刷新后数据不丢失（localStorage）
- **分享功能** — Base64 编码数据到 URL，一键复制分享链接
- **国际化（i18n）** — 中英文切换，轻量级翻译系统，无第三方依赖
- **算法对比模式** — 8 种排序算法并行对比，实时进度追踪
- **性能对比图表** — D3 柱状图对比排序算法性能（比较次数/交换次数/总步数三维度）
- **复杂度可视化** — 时间/空间复杂度增长曲线对比（ComplexityChart）
- **交互式学习模式** — 步骤解释面板 + 代码同步显示（StepExplainer）
- **操作历史时间线** — 可视化操作历史，点击可 undo/redo，悬停显示详情
- **视图缩放** — 0.5x ~ 2x 缩放范围，支持鼠标滚轮、按钮控制和双指缩放
- **可视化网格开关** — 可视化区域 dot-grid 背景显示切换
- **空状态提示** — 数据为空时显示引导界面，一键填充示例数据
- **深色/浅色/系统主题** — 支持 light/dark/system 三种主题切换
- **多配色主题** — 4 套主题（默认蓝/森林绿/暖橙/皇家紫）
- **响应式布局** — 适配不同屏幕尺寸，侧边栏可折叠，移动端触控优化
- **性能监控面板** — FPS/内存实时显示，帧率自适应动画降级
- **网络离线检测** — 离线状态实时提示
- **单元测试覆盖** — 1234 tests（83 个测试文件），核心逻辑覆盖率 > 70%
- **E2E 测试覆盖** — 8 文件 100+ 用例，Playwright 自动化测试
- **错误边界恢复** — ErrorBoundary 异常 UI + safeAnimate 统一错误恢复
- **路由懒加载** — React.lazy + Suspense，主 bundle 321 KB，23 个独立 chunk
- **TypeScript 全栈** — 100% TypeScript 覆盖（.ts/.tsx）

## 快速开始

### 环境要求

- Node.js 18.x+
- npm 9.x+

### 安装与运行

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 运行代码检查
npm run lint

# 运行单元测试
npm run test:run

# 运行测试覆盖率
npm run test:coverage

# 构建分析
npm run build:analyze
```

## 项目结构

```
src/
├── algorithms/          # 算法实现
│   ├── sorting/         # 8 种排序算法（插件注册模式）
│   │   ├── bubbleSort.ts
│   │   ├── selectionSort.ts
│   │   ├── insertionSort.ts
│   │   ├── quickSort.ts
│   │   ├── mergeSort.ts
│   │   ├── heapSort.ts
│   │   ├── radixSort.ts
│   │   ├── bucketSort.ts
│   │   └── index.ts
│   └── graph/           # 4 种图算法
│       ├── bfs.ts
│       ├── dfs.ts
│       ├── dijkstra.ts
│       ├── topoSort.ts
│       └── index.ts
├── components/          # 公共 UI 组件（20+ 个）
│   ├── ComplexityChart.tsx
│   ├── EmptyState.tsx
│   ├── ErrorBoundary.tsx
│   ├── ExportImport.tsx
│   ├── KeyboardHelp.tsx
│   ├── Layout.tsx
│   ├── LogPanel.tsx
│   ├── NetworkStatus.tsx
│   ├── OperationBar.tsx
│   ├── PageHeader.tsx
│   ├── PerformanceChart.tsx
│   ├── PerformanceMonitor.tsx
│   ├── ShareButton.tsx
│   ├── Sidebar.tsx
│   ├── SpeedControl.tsx
│   ├── StepExplainer.tsx
│   ├── Timeline.tsx
│   ├── Toast.tsx
│   ├── UndoPreviewButton.tsx
│   ├── UndoRedoBar.tsx
│   ├── Visualizer.tsx
│   └── toastStore.ts
├── hooks/               # 自定义 Hooks（17+ 个）
│   ├── useArrayState.ts
│   ├── useCommonKeyboard.ts
│   ├── useDataStructureState.ts
│   ├── useGlobalSettings.ts
│   ├── useGraphState.ts
│   ├── useHashState.ts
│   ├── useHeapState.ts
│   ├── useHistory.ts
│   ├── useI18n.ts
│   ├── useKeyboard.ts
│   ├── useLearningMode.ts
│   ├── useLinkedListState.ts
│   ├── useQueueState.ts
│   ├── useSortState.ts
│   ├── useStackState.ts
│   ├── useTheme.ts
│   ├── useTreeState.ts
│   ├── useTrieState.ts
│   └── useVisualizer.ts
├── i18n/                # 国际化
│   ├── locales.ts
│   └── useI18n.ts
├── pages/               # 页面组件（13 个）
│   ├── ArrayPage.tsx
│   ├── GraphAlgorithmPage.tsx
│   ├── GraphPage.tsx
│   ├── HashPage.tsx
│   ├── HeapPage.tsx
│   ├── Home.tsx
│   ├── LinkedListPage.tsx
│   ├── QueuePage.tsx
│   ├── SortComparePage.tsx
│   ├── SortPage.tsx
│   ├── StackPage.tsx
│   ├── TreePage.tsx
│   └── TriePage.tsx
├── types/               # TypeScript 类型声明
│   ├── animationEngine.d.ts
│   ├── hooks.d.ts
│   ├── toastStore.d.ts
│   ├── validate.d.ts
│   └── visualizers.d.ts
├── utils/               # 工具函数
│   ├── animationEngine.ts
│   ├── d3Imports.ts
│   ├── dataExport.ts
│   ├── debounce.ts
│   ├── performanceBenchmark.ts
│   ├── shareUtils.ts
│   ├── themeColors.ts
│   ├── timeslicing.ts
│   └── validate.ts
├── visualizers/         # 10 个 D3.js 可视化渲染模块
│   ├── arrayVisualizer.ts
│   ├── graphVisualizer.ts
│   ├── hashVisualizer.ts
│   ├── heapVisualizer.ts
│   ├── linkedListVisualizer.ts
│   ├── queueVisualizer.ts
│   ├── sortVisualizer.ts
│   ├── stackVisualizer.ts
│   ├── treeVisualizer.ts
│   └── trieVisualizer.ts
├── __tests__/           # 单元测试（Vitest + Testing Library）
├── App.tsx              # 路由配置根组件
├── main.tsx             # 应用入口
└── index.css            # 全局样式 + Tailwind 主题配置
```

## 技术文档

详见 [ARCHITECTURE.md](./ARCHITECTURE.md)，包含：
- 分层架构设计
- 核心设计决策（状态管理/可视化渲染/D3 模式/SVG 坐标系）
- 架构约束（动画/渲染/状态管理）

详见 [CODE_WIKI.md](./CODE_WIKI.md)，包含：
- 整体架构与数据流
- 模块职责与依赖关系
- 关键类和函数 API 说明
- 开发规范与新增数据结构流程

## 修复记录

### v6.5 (2026-06-15)

- **UI/代码审计** — P0-P2 全面质量改进，1234 测试全部通过
- **主题系统优化** — CSS 变量桥接、暗色模式对比度修复
- **动画引擎统一** — 全部可视化组件使用 animationEngine，支持中断和 reduced-motion
- **SVG 键盘导航** — 所有 9 个可视化组件支持 Tab 聚焦、方向键导航、焦点高亮
- **React.memo 优化** — Visualizer 组件 memo 化减少不必要的重渲染
- **Neo-Brutalist 一致性** — 统一阴影 token、圆角规范、颜色系统
- **类型安全** — D3 any 类型修复、hooks.d.ts 补全
- **i18n 完善** — 全部用户可见字符串走 t() 翻译函数

### v6.3 (2026-06-01)

- **学习模式扩展** — 链表/树/哈希表学习步骤（每个 4 步）+ 3 页面集成
- **测试覆盖率提升** — 新增 sorting.test.ts（26 tests）、useVisualizer.test.ts（7 tests）
- **算法导出功能** — GraphAlgorithmPage 支持 CSV/JSON 导出
- **测试总数** — 527 tests（全项目），16 failed（jsdom scrollIntoView 已知问题）

### v6.2 (2026-06-01)

- **学习模式扩展** — 排序算法学习步骤（bubble/quick/merge/heap）+ SortPage 集成
- **测试覆盖率提升** — 新增 StepExplainer/LogPanel/useKeyboard/themeColors 测试（61 个用例）
- **性能优化** — StackPage/QueuePage/LinkedListPage/TreePage useCallback + useMemo
- **测试总数** — 485 tests

### v6.1 (2026-05-31)

- **交互式学习模式** — useLearningMode hook + StepExplainer 组件 + 代码同步显示
- **复杂度可视化对比** — ComplexityChart 组件，支持多算法复杂度增长曲线
- **测试覆盖率提升** — useLearningMode.test.ts + ComplexityChart.test.tsx（30 个用例）

### v6.0 (2026-05-31)

- **图算法可视化** — BFS/DFS/Dijkstra/拓扑排序完整实现 + GraphAlgorithmPage
- **单元测试** — graphAlgorithms.test.ts（17 个用例）

### v5.7 (2026-05-31)

- **TypeScript 100% 完成** — 全部组件迁移为 .tsx
- **测试覆盖率提升** — useDataStructureState + useArrayState 测试（13 个用例）

### v5.0-v5.6 (2026-05-31)

- **路由懒加载** — React.lazy + Suspense，主 bundle 495KB → 320KB
- **TypeScript 迁移** — 全部 hooks/pages/components 迁移为 .ts/.tsx
- **CI/CD** — GitHub Actions 矩阵测试（Node 18/20/22）

### v4.0-v4.9 (2026-05-31)

- **视觉全面改版** — 字体系统、渐变填充、交互精致化、暗色模式适配
- **主题系统** — 4 套配色主题
- **功能增强** — 性能监控面板、动画预设、撤销预览、网络检测、分享功能
- **Timeline 全页面集成** — 9 个数据结构页面
- **E2E 测试** — Playwright 4 文件 83 用例

### v3.9 (2026-05-31)

- **PerformanceChart 组件** — D3 柱状图对比排序算法性能
- **Timeline 组件** — 操作历史时间线
- **i18n 页面集成全覆盖** — 11 个数据页面 + Home + 公共组件全部翻译
- **数据持久化** — 11 种数据结构 localStorage 自动保存/恢复

## 浏览器支持

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 许可证

MIT
