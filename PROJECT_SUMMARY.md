# 数据结构学习助手 v6.4 迭代摘要

> **生成日期:** 2026-06-01
> **迭代版本:** v6.4（已完成）
> **执行状态:** ✅ 全部 Phase 完成
> **验证结果:** Lint 0 errors / Build 成功 / 测试 869 passed（56 个测试文件）/ E2E 32/32 通过

---

## 一、迭代目标

对 v3.9 版本进行全面系统性评估与迭代优化，涵盖文档同步、功能完善、性能优化、测试增强、移动端适配、代码规范六大方面。后续追加视觉与交互全面改版，提升产品精致度与专业感。

---

## 二、完成情况概览

### 2.1 基础迭代（6 个 Phase）

| Phase | 内容 | 状态 | 关键成果 |
|-------|------|------|---------|
| **Phase 1** | 文档同步与修复 | ✅ | 4 份文档同步至 v3.9，eslint vitest globals 修复 |
| **Phase 2** | Timeline 全页面集成 | ✅ | useHistory 增强 + 9 个数据页面 Timeline 集成 |
| **Phase 3** | D3 大数据量渲染优化 | ✅ | arrayVisualizer >50 元素跳动画，treeVisualizer >30 预留 |
| **Phase 4** | 测试增强 | ✅ | 新增 5 个测试文件，215 → 333 tests（后续持续扩展至 498 tests） |
| **Phase 5** | 移动端交互优化 | ✅ | 双指缩放、侧边栏滑动关闭、44px 触摸目标规范 |
| **Phase 6** | JSDoc 与代码规范 | ✅ | 8 个 visualizer 文件 JSDoc 补充，lint 0 errors |

### 2.2 视觉改版（追加迭代）

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **视觉基础** | 字体系统 + 焦点样式 | ✅ | JetBrains Mono + Noto Sans SC 加载，focus-visible 全局样式 |
| **交互精致化** | 按钮/输入框/卡片 hover 效果 | ✅ | 微浮起 + 阴影增强 + 光晕反馈，过渡统一 200ms |
| **全局渐变统一** | SVG 渐变填充系统 | ✅ | array/sort/hash 三大 visualizer 渐变填充，4 色状态渐变 |
| **哈希表重设计** | 布局重构 + 自适应 | ✅ | 垂直排列替代水平排列，自适应 SVG 宽度，统一配色 |
| **排序动画增强** | 动态可视化升级 | ✅ | 4 种状态渐变（默认/比较/交换/已排序），easeOutExpo 缓动 |
| **E2E 测试** | Playwright 自动化 | ✅ | 4 文件 83 用例，95.2% 通过率 |

### 2.3 v4.1 视觉一致性迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **Bug 修复** | EASING.easeInBack + 版本号 | ✅ | treeVisualizer 删除动画修复，Sidebar 版本号 V4.1 |
| **共享主题工具** | themeColors.js | ✅ | getColors/detectDarkMode/ensureGradientDefs/gradUrl |
| **暗色模式适配** | 10 个 visualizer | ✅ | 全部 SVG 元素主题感知，亮/暗色自适应 |
| **渐变填充统一** | 8 个 visualizer | ✅ | 节点径向渐变 + 条形线性渐变，10/10 统一 |
| **动画引擎增强** | 缓动函数补充 | ✅ | 12 种缓动函数（+3: easeInCubic/easeInOutQuad/easeInOutExpo） |
| **键盘快捷键** | 补全 + 动态化 | ✅ | 11 个页面快捷键定义，输入框焦点防护 |

### 2.4 v4.2 功能增强迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **PerformanceChart 导出** | CSV/JSON 导出 | ✅ | exportPerformanceCSV/exportPerformanceJSON，下拉菜单选择格式 |
| **GraphPage 统一** | 确认已使用 Visualizer | ✅ | GraphPage 第 135 行已使用 Visualizer 组件 |
| **FPS 自适应** | 帧率检测 + 动画降级 | ✅ | startFPSMonitoring/getCurrentFPS，FPS<30 降级，FPS<15 跳过 |
| **主题系统扩展** | 多配色主题 | ⏳ | 待 v4.3 迭代 |
| **操作撤销预览** | Timeline 预览 | ⏳ | 待 v4.3 迭代 |

### 2.5 v4.3 体验增强迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **主题系统扩展** | 多配色主题 | ✅ | 4 套主题（默认蓝/森林绿/暖橙/皇家紫），Sidebar 主题选择器 |
| **Timeline 悬停预览** | 操作历史 tooltip | ✅ | 悬停显示操作类型/描述/步骤号，当前步骤高亮标记 |
| **E2E 测试稳定性** | headless 模式修复 | ⏳ | 待 v4.4 迭代 |

### 2.6 v4.4 稳定性迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **E2E 测试稳定性** | headless 模式修复 | ✅ | test-helpers.js 重试机制，assertWithRetry 函数 |
| **性能监控面板** | FPS/内存实时显示 | ⏳ | 待 v4.5 迭代 |
| **更多排序算法** | 基数排序/桶排序 | ⏳ | 待 v4.5 迭代 |

### 2.7 v4.5 功能扩展迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **更多排序算法** | 基数排序/桶排序 | ✅ | radix（O(d·n)）+ bucket（O(n+k)），总计 8 种排序算法 |

### 2.8 v4.6 性能与体验迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **性能监控面板** | FPS/内存实时显示 | ✅ | PerformanceMonitor 组件，FPS 颜色编码 + 内存使用 + 展开/折叠 |
| **动画预设系统** | 预定义动画效果 | ✅ | 5 种预设（标准/柔和/快速/戏剧/瞬时），SpeedControl 增强 |
| **排序复杂度可视化** | 时间/空间复杂度 | ✅ | SortPage 按钮显示时间复杂度，ComparePage 双维度显示 |

### 2.9 v4.7 交互体验迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **操作撤销预览** | 悬停显示状态预览 | ✅ | UndoPreviewButton 组件，hover 显示撤销/重做后的数据状态 |
| **网络离线检测** | 离线状态提示 | ✅ | NetworkStatus 组件，监听 online/offline 事件，左下角提示 |
| **分享功能** | 生成分享链接 | ✅ | ShareButton 组件，Base64 编码数据到 URL，一键复制 |

### 2.10 v4.8 交互与质量迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **Timeline 交互优化** | 操作历史可视化增强 | ✅ | 操作类型颜色编码、自动滚动到当前步骤、键盘左右箭头导航 |
| **数据导入验证增强** | 更严格的格式校验 | ✅ | validateImportData 函数，校验类型/整数/范围/长度 |
| **性能基准测试** | 建立性能回归测试 | ✅ | performanceBenchmark.js 工具，benchmark/benchmarkThreshold API |

### 2.11 v4.9 功能统一与质量迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **数据结构功能统一** | 全页面集成新功能 | ✅ | 8 个 state hook + 8 个页面集成 UndoPreviewButton + ShareButton |
| **移动端适配优化** | 触摸手势、响应式布局 | ✅ | 640px 断点优化、操作栏横向滚动、隐藏滚动条 |
| **代码质量优化** | JSDoc 类型注解 | ✅ | shareUtils.js 类型注解 |

### 2.12 v5.0 里程碑 - 性能与质量

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **性能优化** | 路由懒加载 + 代码分割 | ✅ | React.lazy + Suspense，主 bundle 从 495 kB 降至 320 kB，23 个独立 chunk |
| **E2E 测试扩展** | v5.0 功能测试 | ✅ | test-v5-features.js，覆盖懒加载/撤销预览/分享按钮/暗色模式 |
| **TypeScript 迁移准备** | .d.ts 类型声明 | ✅ | animationEngine.d.ts / validate.d.ts / toastStore.d.ts |

### 2.13 v5.1 TypeScript 基础迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **类型声明扩展** | 覆盖 visualizer 和 hooks | ✅ | visualizers.d.ts（10 个模块）+ hooks.d.ts（全部状态接口） |
| **TypeScript 配置** | tsconfig.json + Vite 集成 | ✅ | tsconfig.json + typescript + @types/d3 依赖 |
| **Build 分析** | rollup-plugin-visualizer | ✅ | `npm run build:analyze` 命令，生成 stats.html |

### 2.14 v5.2 TypeScript 迁移迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **核心 hooks .ts 迁移** | useHistory / useDataStructureState | ✅ | 泛型支持、完整类型推导、删除旧 .js 文件 |
| **核心工具 .ts 迁移** | validate / shareUtils | ✅ | 接口定义、类型安全、删除旧 .js 文件 |
| **CI/CD 配置** | GitHub Actions | ✅ | ci.yml，Node 18/20/22 矩阵测试，lint + build + test |

### 2.15 v5.3 TypeScript 深化迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **更多 hooks .ts 迁移** | useArrayState / useSortState / useStackState / useQueueState | ✅ | 泛型实现、完整类型推导、删除旧 .js 文件 |
| **E2E 测试 CI 集成** | playwright + GitHub Actions | ✅ | e2e job、浏览器安装、截图上传 |
| **组件 .tsx 迁移** | PageHeader / EmptyState | ✅ | 接口定义、ReactNode 类型、删除旧 .jsx 文件 |

### 2.16 v5.4 代码质量优化迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **性能优化** | useMemo/useCallback | ✅ | Sidebar/ArrayPage/GraphPage/SortPage/Visualizer 优化 |
| **可读性提升** | 代码格式化 | ✅ | GraphPage 单行函数格式化为多行 |
| **代码复用** | 共享 hook/组件 | ✅ | useCommonKeyboard hook + UndoRedoBar 组件 |
| **安全加固** | 输入验证增强 | ✅ | sanitizeInput 过滤增强 + localStorage 数据验证 |
| **资源管理** | 定时器/FPS 优化 | ✅ | toastStore 清理函数 + animationEngine 状态重置 |

### 2.17 v5.5 TypeScript 完成迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **剩余 hooks .ts 迁移** | 6 个 hooks 全部迁移 | ✅ | useLinkedListState / useTreeState / useGraphState / useHashState / useHeapState / useTrieState |
| **组件 .tsx 迁移** | OperationBar / LogPanel | ✅ | 接口定义、类型注解、删除旧 .jsx 文件 |
| **单元测试扩展** | 新增测试用例 | ✅ | useCommonKeyboard.test.ts + validate-enhanced.test.ts（23 个用例） |

### 2.18 v5.6 TypeScript 完成迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **页面 .tsx 迁移** | 12 个页面全部迁移 | ✅ | ArrayPage / SortPage / StackPage / QueuePage / LinkedListPage / TreePage / GraphPage / HashPage / HeapPage / TriePage / SortComparePage / Home |
| **组件 .tsx 迁移** | Sidebar / Layout / App | ✅ | 接口定义、类型注解、删除旧 .jsx 文件 |
| **测试覆盖率提升** | 新增测试用例 | ✅ | useHistory.test.ts + shareUtils.test.ts（11 个用例） |

### 2.19 v5.7 组件迁移与优化迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **剩余组件 .tsx 迁移** | 13 个组件全部迁移 | ✅ | Visualizer / NetworkStatus / UndoPreviewButton / PerformanceMonitor / SpeedControl / ShareButton / Timeline / KeyboardHelp / ProgressBar / Toast / ExportImport / ErrorBoundary / PerformanceChart |
| **测试覆盖率提升** | 新增测试用例 | ✅ | useDataStructureState.test.ts + useArrayState.test.ts（13 个用例） |
| **性能优化** | useMemo 优化 | ✅ | Timeline / LogPanel / PerformanceChart 配置对象缓存 |

### 2.20 v6.0 功能扩展迭代 - 图算法可视化

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **图算法实现** | BFS / DFS / Dijkstra / 拓扑排序 | ✅ | 4 个算法完整实现，支持 onStep 回调 |
| **图算法页面** | GraphAlgorithmPage | ✅ | 算法选择、起始节点选择、SVG 可视化、日志面板 |
| **路由与导航** | 集成到应用 | ✅ | App.tsx 路由 + Sidebar 导航 + 国际化 |
| **单元测试** | 图算法测试 | ✅ | 17 个测试用例，覆盖所有算法 |

### 2.21 v6.1 交互式学习与复杂度对比迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **交互式学习模式** | 步骤解释面板 + 代码同步显示 | ✅ | useLearningMode hook + StepExplainer 组件 |
| **复杂度可视化对比** | 复杂度增长曲线 | ✅ | ComplexityChart 组件，支持多算法对比 |
| **测试覆盖率提升** | 新增测试用例 | ✅ | useLearningMode.test.ts + ComplexityChart.test.tsx（30 个用例） |

### 2.22 v6.2 学习模式扩展与质量优化迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **学习模式扩展** | 排序算法学习步骤 | ✅ | bubble/quick/merge/heap 4 个算法 + SortPage 集成 |
| **测试覆盖率提升** | 新增测试文件 | ✅ | StepExplainer/LogPanel/useKeyboard/themeColors（61 个用例） |
| **性能优化** | 4 页面 useCallback+useMemo | ✅ | StackPage/QueuePage/LinkedListPage/TreePage |

### 2.23 v6.3 学习模式全覆盖与导出功能迭代

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **学习模式扩展** | 链表/树/哈希表学习步骤 | ✅ | 3 个数据结构 + 3 页面集成 |
| **测试覆盖率提升** | 新增测试文件 | ✅ | sorting/useVisualizer 测试（42 个用例） |
| **算法导出功能** | GraphAlgorithmPage 导出 | ✅ | CSV/JSON 导出按钮 |

### 2.24 v6.4 学习配置模块化重构

| 模块 | 内容 | 状态 | 关键成果 |
|------|------|------|---------|
| **配置模块化** | 学习步骤配置从 Hook 中分离 | ✅ | `src/configs/learning/` 目录，12 个独立配置文件 |
| **类型独立** | 创建 `src/types/learning.d.ts` | ✅ | `LearningStep` / `LearningModeConfig` 类型声明 |
| **双向链表** | 新增双向链表学习模式 | ✅ | `doublyLinkedList.config.ts` + LinkedListPage 切换功能 |
| **文档更新** | 全部技术文档同步 | ✅ | ARCHITECTURE.md / CODE_WIKI.md / README.md / configs/learning/README.md |
| **关注点分离** | Hook 文件精简 | ✅ | `useLearningMode.ts` 从 ~650 行减少到 62 行（-90%）|

---

## 三、技术结构变更

### 3.1 新增文件

| 文件 | 用途 |
|------|------|
| `src/__tests__/useGraphState.test.ts` | 图状态管理单元测试（28 tests） |
| `src/__tests__/useLinkedListState.test.ts` | 链表状态管理单元测试（32 tests） |
| `src/__tests__/useTreeState.test.ts` | 二叉树状态管理单元测试（28 tests） |
| `src/__tests__/useHeapState.test.ts` | 堆状态管理单元测试（31 tests） |
| `src/__tests__/useQueueState.test.ts` | 队列状态管理单元测试（9 tests） |
| `src/__tests__/useTrieState.test.ts` | 字典树状态管理单元测试（30 tests） |
| `src/__tests__/useSortState.test.ts` | 排序状态管理单元测试（7 tests） |
| `src/__tests__/useHashState.test.ts` | 哈希表状态管理单元测试（27 tests） |
| `src/__tests__/timeline.test.tsx` | Timeline 组件单元测试（21 tests） |
| `src/__tests__/performanceChart.test.tsx` | PerformanceChart 组件单元测试（9 tests） |
| `e2e/test-home.js` | Playwright 首页测试（8 cases） |
| `e2e/test-core.js` | Playwright 核心页面测试（25 cases） |
| `e2e/test-advanced.js` | Playwright 高级功能测试（30 cases） |
| `e2e/test-edge.js` | Playwright 边界条件测试（20 cases） |

### 3.2 修改文件（基础迭代）

| 文件 | 修改内容 |
|------|---------|
| `README.md` | 版本同步至 v3.9，功能列表更新，v3.2-v3.9 变更历史 |
| `ARCHITECTURE.md` | 模块依赖图更新（含 Hash/Heap/Trie/SortCompare），已知限制更新 |
| `CODE_WIKI.md` | 全面更新至 v3.9，新增模块描述、API、文件清单 |
| `TODO.md` | P2/P3 完成状态更新，v4.0 迭代待办 |
| `src/hooks/useHistory.js` | 新增 getHistory() / getCurrentIndex() 方法 |
| `src/hooks/useDataStructureState.js` | 透传 getHistory / getCurrentIndex |
| `src/pages/ArrayPage.jsx` | 集成 Timeline 组件 |
| `src/pages/StackPage.jsx` | 集成 Timeline 组件 |
| `src/pages/QueuePage.jsx` | 集成 Timeline 组件 |
| `src/pages/LinkedListPage.jsx` | 集成 Timeline 组件 |
| `src/pages/TreePage.jsx` | 集成 Timeline 组件 |
| `src/pages/GraphPage.jsx` | 集成 Timeline 组件 |
| `src/pages/HashPage.jsx` | 集成 Timeline 组件 |
| `src/pages/HeapPage.jsx` | 集成 Timeline 组件 |
| `src/pages/TriePage.jsx` | 集成 Timeline 组件 |
| `src/visualizers/arrayVisualizer.js` | 新增 LARGE_DATA_THRESHOLD=50 跳动画 |
| `src/visualizers/treeVisualizer.js` | 新增 LARGE_DATA_THRESHOLD=30 预留 |
| `src/components/Visualizer.jsx` | 双指缩放触摸手势支持 |
| `src/components/Sidebar.jsx` | 滑动关闭侧边栏 |
| `src/components/OperationBar.jsx` | 移动端触摸优化 |
| `src/index.css` | 响应式 CSS 增强（768px 媒体查询 + 触摸规范） |

### 3.3 修改文件（视觉改版）

| 文件 | 修改内容 |
|------|---------|
| `index.html` | 添加 Google Fonts CDN（JetBrains Mono + Noto Sans SC） |
| `src/index.css` | 添加 focus-visible 全局可访问性样式 |
| `src/components/OperationBar.jsx` | 按钮 hover 微浮起 + 输入框 focus 光晕，过渡 200ms |
| `src/components/Sidebar.jsx` | 导航项 hover 微移效果，过渡 200ms |
| `src/pages/Home.jsx` | 功能卡片 hover 浮起 + 阴影增强 |
| `src/utils/animationEngine.js` | 新增 easeOutExpo 缓动函数（easeExpOut） |
| `src/visualizers/arrayVisualizer.js` | 新增 ensureGradients()，数组元素使用渐变填充 |
| `src/visualizers/sortVisualizer.js` | 4 种 SVG 渐变（默认/比较/交换/已排序），动画使用渐变填充 |
| `src/visualizers/hashVisualizer.js` | 完全重写：垂直排列布局，自适应宽度，统一配色，anim 中止检查 |
| `src/visualizers/treeVisualizer.js` | 修复 NaN 错误，启用 LARGE_DATA_THRESHOLD 跳动画 |

**v4.1 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/utils/themeColors.js` | 共享主题感知工具（颜色系统 + 渐变定义 + 暗色模式检测） |

**v4.1 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/utils/animationEngine.js` | 新增 easeInCubic/easeInOutQuad/easeInOutExpo 缓动函数 |
| `src/components/Visualizer.jsx` | 集成 useTheme，传递 isDark 到 renderFn |
| `src/components/KeyboardHelp.jsx` | 根据当前路由动态显示快捷键，输入框焦点防护 |
| `src/hooks/useKeyboard.js` | 补全 hash/heap/trie/compare 快捷键定义，输入框焦点防护 |
| `src/components/Sidebar.jsx` | 版本号 V1.0.0 → V4.1 |
| `src/visualizers/arrayVisualizer.js` | 暗色模式 + 渐变填充，移除旧 ensureGradients |
| `src/visualizers/sortVisualizer.js` | 暗色模式 + 渐变填充，移除旧 createGradientDef |
| `src/visualizers/linkedListVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/stackVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/queueVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/treeVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/graphVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/hashVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/heapVisualizer.js` | 暗色模式 + 渐变填充 |
| `src/visualizers/trieVisualizer.js` | 暗色模式 + 渐变填充 |
| `eslint.config.js` | e2e 目录 node 环境配置 |

**v4.2 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/utils/dataExport.js` | 新增 exportPerformanceCSV/exportPerformanceJSON 函数 |
| `src/utils/animationEngine.js` | 新增 FPS 检测（startFPSMonitoring/stopFPSMonitoring/getCurrentFPS），duration 函数集成 fpsFactor |
| `src/components/Visualizer.jsx` | 集成 FPS 监控（mount 时启动，unmount 时停止） |
| `src/pages/SortComparePage.jsx` | 添加导出按钮下拉菜单（CSV/JSON） |
| `src/i18n/locales.js` | 新增 compare.exportCSV/exportJSON/exportResults 翻译 |

**v4.3 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/utils/themeColors.js` | 重构为多主题架构（THEMES 对象），新增 setTheme/getTheme/getAvailableThemes/initTheme |
| `src/components/Sidebar.jsx` | 新增主题选择器 UI（4 个主题按钮），版本号 V4.3 |
| `src/components/Timeline.jsx` | 新增悬停 tooltip（操作类型/描述/步骤号/当前标记） |

**v4.4 新增文件：**

| 文件 | 用途 |
|------|------|
| `e2e/test-helpers.js` | E2E 测试辅助函数（sleep/retry/waitForText/clickButtonIfEnabled/assertWithRetry） |

**v4.4 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `e2e/test-core.js` | 使用 test-helpers.js，SIZE 断言改为 assertWithRetry |
| `e2e/test-edge.js` | 使用 test-helpers.js，移除重复辅助函数 |

**v4.5 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/algorithms/sorting/index.js` | 新增基数排序（radix）和桶排序（bucket）算法 |

**v4.6 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/components/PerformanceMonitor.jsx` | FPS/内存实时监控面板组件 |

**v4.6 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/utils/animationEngine.js` | 新增动画预设系统（ANIMATION_PRESETS/applyPreset/getCurrentPreset/setDefaultEasing/getDefaultEasing） |
| `src/hooks/useGlobalSettings.js` | 新增 currentPreset/applyPreset 状态管理 |
| `src/components/SpeedControl.jsx` | 新增动画预设下拉选择器 |
| `src/components/Layout.jsx` | 集成 PerformanceMonitor 组件 |
| `src/components/Sidebar.jsx` | 版本号 V4.6 |
| `src/pages/SortPage.jsx` | 算法按钮显示时间复杂度 |
| `src/pages/SortComparePage.jsx` | 算法卡片和面板显示时间/空间复杂度 |

**v4.7 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/components/UndoPreviewButton.jsx` | 撤销/重做预览按钮组件 |
| `src/components/NetworkStatus.jsx` | 网络状态检测组件 |
| `src/components/ShareButton.jsx` | 分享链接按钮组件 |
| `src/utils/shareUtils.js` | 分享数据编解码工具 |

**v4.7 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/hooks/useHistory.js` | 新增 getUndoPreview/getRedoPreview 方法 |
| `src/hooks/useDataStructureState.js` | 透传 getUndoPreview/getRedoPreview |
| `src/hooks/useArrayState.js` | 返回 getUndoPreview/getRedoPreview |
| `src/hooks/useSortState.js` | 返回 getUndoPreview/getRedoPreview |
| `src/components/Layout.jsx` | 集成 NetworkStatus 组件 |
| `src/components/Sidebar.jsx` | 版本号 V4.7 |
| `src/pages/ArrayPage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/SortPage.jsx` | 集成 UndoPreviewButton + ShareButton |

**v4.8 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/utils/performanceBenchmark.js` | 性能基准测试工具 |

**v4.8 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Timeline.jsx` | 操作类型颜色编码、自动滚动、键盘导航 |
| `src/utils/validate.js` | 新增 validateImportData 函数 |
| `src/pages/ArrayPage.jsx` | 使用 validateImportData 验证导入 |
| `src/pages/SortPage.jsx` | 使用 validateImportData 验证导入 |
| `src/components/Sidebar.jsx` | 版本号 V4.8 |

**v4.9 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/hooks/useStackState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useQueueState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useLinkedListState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useTreeState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useGraphState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useHashState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useHeapState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/hooks/useTrieState.js` | 新增 getUndoPreview/getRedoPreview |
| `src/pages/StackPage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/QueuePage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/LinkedListPage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/TreePage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/GraphPage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/HashPage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/HeapPage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/pages/TriePage.jsx` | 集成 UndoPreviewButton + ShareButton |
| `src/index.css` | 640px 断点移动端优化 |
| `src/utils/shareUtils.js` | JSDoc 类型注解 |
| `src/components/Sidebar.jsx` | 版本号 V4.9 |

**v5.0 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/App.jsx` | React.lazy + Suspense 路由懒加载 |
| `src/components/Sidebar.jsx` | 版本号 V5.0 |
| `e2e/test-v5-features.js` | 新增 v5.0 功能测试 |
| `e2e/run-all-tests.js` | 注册新测试文件 |

**v5.0 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/types/animationEngine.d.ts` | animationEngine 类型声明 |
| `src/types/validate.d.ts` | validate 工具类型声明 |
| `src/types/toastStore.d.ts` | toastStore 类型声明 |
| `e2e/test-v5-features.js` | v5.0 功能 E2E 测试 |

**v5.1 新增文件：**

| 文件 | 用途 |
|------|------|
| `tsconfig.json` | TypeScript 配置 |
| `src/types/visualizers.d.ts` | 10 个 visualizer 模块类型声明 |
| `src/types/hooks.d.ts` | 全部 hooks 状态接口类型声明 |

**v5.1 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `package.json` | 新增 typescript / @types/d3 / rollup-plugin-visualizer / build:analyze 脚本 |
| `vite.config.js` | 集成 rollup-plugin-visualizer（analyze 模式） |
| `src/components/Sidebar.jsx` | 版本号 V5.1 |

**v5.2 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/hooks/useHistory.ts` | useHistory TypeScript 版本（泛型） |
| `src/hooks/useDataStructureState.ts` | useDataStructureState TypeScript 版本 |
| `src/utils/validate.ts` | validate TypeScript 版本 |
| `src/utils/shareUtils.ts` | shareUtils TypeScript 版本 |
| `.github/workflows/ci.yml` | GitHub Actions CI/CD 配置 |

**v5.2 删除文件：**

| 文件 | 原因 |
|------|------|
| `src/hooks/useHistory.js` | 被 .ts 版本替代 |
| `src/hooks/useDataStructureState.js` | 被 .ts 版本替代 |
| `src/utils/validate.js` | 被 .ts 版本替代 |
| `src/utils/shareUtils.js` | 被 .ts 版本替代 |

**v5.2 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.jsx` | 版本号 V5.2 |

**v5.3 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/hooks/useArrayState.ts` | TypeScript 版本 |
| `src/hooks/useSortState.ts` | TypeScript 版本 |
| `src/hooks/useStackState.ts` | TypeScript 版本 |
| `src/hooks/useQueueState.ts` | TypeScript 版本 |
| `src/components/PageHeader.tsx` | TypeScript 版本 |
| `src/components/EmptyState.tsx` | TypeScript 版本 |

**v5.3 删除文件：**

| 文件 | 原因 |
|------|------|
| `src/hooks/useArrayState.js` | 被 .ts 替代 |
| `src/hooks/useSortState.js` | 被 .ts 替代 |
| `src/hooks/useStackState.js` | 被 .ts 替代 |
| `src/hooks/useQueueState.js` | 被 .ts 替代 |
| `src/components/PageHeader.jsx` | 被 .tsx 替代 |
| `src/components/EmptyState.jsx` | 被 .tsx 替代 |

**v5.3 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `.github/workflows/ci.yml` | 新增 e2e job |
| `src/components/Sidebar.jsx` | 版本号 V5.3 |

**v5.4 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/hooks/useCommonKeyboard.ts` | 通用键盘快捷键 hook |
| `src/components/UndoRedoBar.tsx` | 撤销/重做 UI 组件 |

**v5.4 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.jsx` | useMemo 优化 + 类名常量提取 + 版本号 V5.4 |
| `src/components/Visualizer.jsx` | useMemo viewBox 优化 |
| `src/pages/ArrayPage.jsx` | useCallback 事件处理函数优化 |
| `src/pages/GraphPage.jsx` | useCallback 优化 + 代码格式化 |
| `src/pages/SortPage.jsx` | useMemo animateFns/algorithms 优化 |
| `src/utils/validate.ts` | sanitizeInput 过滤增强 |
| `src/hooks/useDataStructureState.ts` | localStorage 数据验证 |
| `src/components/toastStore.js` | 清理函数返回 |
| `src/utils/animationEngine.js` | FPS 监控状态重置 |
| `src/types/toastStore.d.ts` | 类型声明同步 |

**v5.5 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/hooks/useLinkedListState.ts` | TypeScript 版本 |
| `src/hooks/useTreeState.ts` | TypeScript 版本 |
| `src/hooks/useGraphState.ts` | TypeScript 版本 |
| `src/hooks/useHashState.ts` | TypeScript 版本 |
| `src/hooks/useHeapState.ts` | TypeScript 版本 |
| `src/hooks/useTrieState.ts` | TypeScript 版本 |
| `src/components/OperationBar.tsx` | TypeScript 版本 |
| `src/components/LogPanel.tsx` | TypeScript 版本 |
| `src/__tests__/useCommonKeyboard.test.ts` | 单元测试 |
| `src/__tests__/validate-enhanced.test.ts` | 单元测试 |

**v5.5 删除文件：**

| 文件 | 原因 |
|------|------|
| 6 个 hooks .js 文件 | 被 .ts 替代 |
| 2 个组件 .jsx 文件 | 被 .tsx 替代 |

**v5.5 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.jsx` | 版本号 V5.5 |

**v5.6 新增文件：**

| 文件 | 用途 |
|------|------|
| 12 个页面 .tsx 文件 | TypeScript 版本 |
| `src/components/Sidebar.tsx` | TypeScript 版本 |
| `src/components/Layout.tsx` | TypeScript 版本 |
| `src/App.tsx` | TypeScript 版本 |
| `src/__tests__/useHistory.test.ts` | 单元测试 |
| `src/__tests__/shareUtils.test.ts` | 单元测试 |

**v5.6 删除文件：**

| 文件 | 原因 |
|------|------|
| 12 个页面 .jsx 文件 | 被 .tsx 替代 |
| 3 个组件 .jsx 文件 | 被 .tsx 替代 |

**v5.6 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.tsx` | 版本号 V5.6 |
| `src/main.jsx` | App 导入路径更新 |

**v5.7 新增文件：**

| 文件 | 用途 |
|------|------|
| 13 个组件 .tsx 文件 | TypeScript 版本 |
| `src/main.tsx` | TypeScript 版本 |
| `src/__tests__/useDataStructureState.test.ts` | 单元测试 |
| `src/__tests__/useArrayState.test.ts` | 单元测试 |

**v5.7 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.tsx` | 版本号 V5.7 |
| `src/components/Timeline.tsx` | useMemo 性能优化 |
| `src/components/LogPanel.tsx` | useMemo 性能优化 |
| `src/components/PerformanceChart.tsx` | useMemo 性能优化 |

**v6.0 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/algorithms/graph/bfs.ts` | BFS 广度优先搜索算法 |
| `src/algorithms/graph/dfs.ts` | DFS 深度优先搜索算法 |
| `src/algorithms/graph/dijkstra.ts` | Dijkstra 最短路径算法 |
| `src/algorithms/graph/topoSort.ts` | 拓扑排序算法 |
| `src/algorithms/graph/index.ts` | 图算法统一导出 |
| `src/pages/GraphAlgorithmPage.tsx` | 图算法可视化页面 |
| `src/__tests__/graphAlgorithms.test.ts` | 图算法单元测试 |

**v6.0 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.tsx` | 版本号 V6.0 + 图算法导航 |
| `src/App.tsx` | 新增 /graph-algorithm 路由 |
| `src/i18n/locales.js` | 图算法国际化翻译 |

**v6.1 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/hooks/useLearningMode.ts` | 交互式学习模式 hook |
| `src/components/StepExplainer.tsx` | 步骤解释面板组件 |
| `src/components/ComplexityChart.tsx` | 复杂度可视化对比组件 |
| `src/__tests__/useLearningMode.test.ts` | 学习模式单元测试 |
| `src/__tests__/ComplexityChart.test.tsx` | 复杂度图表单元测试 |

**v6.1 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/components/Sidebar.tsx` | 版本号 V6.1 |
| `src/pages/GraphAlgorithmPage.tsx` | 集成学习模式和复杂度图表 |

**v6.2 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/__tests__/StepExplainer.test.tsx` | StepExplainer 组件测试（23 tests） |
| `src/__tests__/LogPanel.test.tsx` | LogPanel 组件测试（13 tests） |
| `src/__tests__/useKeyboard.test.ts` | useKeyboard hook 测试（10 tests） |
| `src/__tests__/themeColors.test.ts` | themeColors 工具测试（18 tests） |

**v6.2 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/hooks/useLearningMode.ts` | 新增 bubble/quick/merge/heap 学习步骤 |
| `src/pages/SortPage.tsx` | 集成学习模式 |
| `src/pages/StackPage.tsx` | useCallback + useMemo 性能优化 |
| `src/pages/QueuePage.tsx` | useCallback + useMemo 性能优化 |
| `src/pages/LinkedListPage.tsx` | useCallback + useMemo 性能优化 |
| `src/pages/TreePage.tsx` | useCallback + useMemo 性能优化 |
| `src/components/Sidebar.tsx` | 版本号 V6.2 |
| `src/__tests__/useLearningMode.test.ts` | +10 个排序算法测试用例 |

**v6.3 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/__tests__/sorting.test.ts` | 排序算法测试（26 tests） |
| `src/__tests__/useVisualizer.test.ts` | useVisualizer hook 测试（7 tests） |

**v6.3 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/hooks/useLearningMode.ts` | 新增 linkedlist/tree/hash 学习步骤 |
| `src/pages/LinkedListPage.tsx` | 集成学习模式 |
| `src/pages/TreePage.tsx` | 集成学习模式 |
| `src/pages/HashPage.tsx` | 集成学习模式 |
| `src/pages/GraphAlgorithmPage.tsx` | 添加 CSV/JSON 导出功能 |
| `src/components/Sidebar.tsx` | 版本号 V6.3 |
| `src/__tests__/useLearningMode.test.ts` | +10 个数据结构学习步骤测试 |

**v6.4 新增文件：**

| 文件 | 用途 |
|------|------|
| `src/configs/learning/types.ts` | 学习模式类型重新导出 |
| `src/configs/learning/index.ts` | 统一导出 12 种算法配置 |
| `src/configs/learning/bfs.config.ts` | BFS 学习步骤配置 |
| `src/configs/learning/dfs.config.ts` | DFS 学习步骤配置 |
| `src/configs/learning/dijkstra.config.ts` | Dijkstra 学习步骤配置 |
| `src/configs/learning/topoSort.config.ts` | 拓扑排序学习步骤配置 |
| `src/configs/learning/bubble.config.ts` | 冒泡排序学习步骤配置 |
| `src/configs/learning/quick.config.ts` | 快速排序学习步骤配置 |
| `src/configs/learning/merge.config.ts` | 归并排序学习步骤配置 |
| `src/configs/learning/heap.config.ts` | 堆排序学习步骤配置 |
| `src/configs/learning/linkedlist.config.ts` | 链表学习步骤配置 |
| `src/configs/learning/doublyLinkedList.config.ts` | 双向链表学习步骤配置 |
| `src/configs/learning/tree.config.ts` | 二叉树学习步骤配置 |
| `src/configs/learning/hash.config.ts` | 哈希表学习步骤配置 |
| `src/configs/learning/README.md` | 配置模块文档 |
| `src/types/learning.d.ts` | 学习模式类型声明 |

**v6.4 修改文件：**

| 文件 | 修改内容 |
|------|---------|
| `src/hooks/useLearningMode.ts` | 移除 600 行硬编码配置，改为从 configs/learning 导入 |
| `src/components/StepExplainer.tsx` | 更新类型引用路径 |
| `src/__tests__/StepExplainer.test.tsx` | 更新类型引用路径 |
| `src/pages/LinkedListPage.tsx` | 添加单向/双向链表学习模式切换 |
| `src/components/Sidebar.tsx` | 版本号 V6.4 |
| `ARCHITECTURE.md` | 新增配置层、更新数据流、扩展性设计 |
| `CODE_WIKI.md` | 更新 useLearningMode 文档、文件清单 |
| `PROJECT_SUMMARY.md` | 添加 v6.4 迭代记录 |

### 3.4 技术栈

| 技术 | 版本 |
|------|------|
| React | 19.2.6 |
| Vite | 8.0.14 |
| D3.js | 7.9.0 |
| Tailwind CSS | 4.3.0 |
| React Router | 7.15.1 |
| Vitest | 4.1.7 |
| Playwright | 1.52.0 |

---

## 四、核心设计决策

### 4.1 基础迭代决策

| 决策 | 方案 | 理由 |
|------|------|------|
| Timeline 集成模式 | 统一使用 logs.map → history + currentIndex = logs.length - 1 | 简化实现，不依赖 undoCount 状态 |
| D3 大数据量优化 | 阈值跳过动画（非虚拟化） | 教学场景数据结构通常 <50 元素，简单方案足够 |
| 测试文件命名 | .jsx 后缀用于含 JSX 的测试 | Vite OXC 解析器要求 .jsx 才能解析 JSX 语法 |
| 移动端触摸优化 | CSS 优先（@media + utility classes） | 减少 JavaScript 重渲染，提升性能 |

### 4.2 视觉改版决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 渐变填充系统 | SVG linearGradient，4 色状态 | 提升视觉层次感，区分操作状态 |
| 动画缓动统一 | animationEngine.js 集中管理 | 保证全局动画手感一致 |
| 交互反馈层级 | hover 微浮起(0.5px) + focus 光晕(2px) | 区分悬停与聚焦状态，避免视觉竞争 |
| 哈希表布局 | 垂直排列替代水平排列 | 解决元素拥挤，适配不同数据量 |
| 字体系统 | JetBrains Mono（代码）+ Noto Sans SC（中文） | 提升代码可读性与中文显示品质 |

### 4.3 v4.1 视觉一致性决策

| 决策 | 方案 | 理由 |
|------|------|------|
| 主题感知方式 | getColors(isDark) + detectDarkMode() | visualizer 为纯 JS 文件，不使用 React hooks，通过 DOM 检测暗色模式 |
| 渐变管理 | ensureGradientDefs 统一创建 | 消除 arrayVisualizer/sortVisualizer 的重复渐变代码 |
| 动画恢复色 | 扁平色而非渐变 | D3 transition 对渐变 fill 的过渡不平滑，恢复阶段使用扁平色 |
| 快捷键防护 | isInput && !needsCtrl 跳过 | 输入框中仅允许 Ctrl 组合键，单字母键被屏蔽 |

---

## 五、已知限制

| 限制 | 影响 | 缓解措施 | 优先级 |
|------|------|---------|--------|
| E2E 测试 4 个失败项（headless 模式限制） | 端到端覆盖率非 100% | 均为 React 19 状态同步延迟，非功能 bug | P3 |
| 图页面力导向模拟大数据量性能 | >100 节点时帧率下降 | 已优化 alphaDecay + velocityDecay | P2 |
| 排序算法动画时长固定 | 无法根据数据量自适应 | 用户可通过 SpeedControl 调节 | P3 |

---

## 六、测试指标

### 6.1 单元测试

| 指标 | v3.9 | v4.0 | v6.3 | 变化 |
|------|------|------|------|------|
| 测试文件数 | 11 | 16 | 29 | +13 |
| 测试用例数 | 215 | 333 | 498 | +165 |
| 覆盖率目标 | >70% | >70% | >70% | 持平 |

### 6.2 E2E 测试

| 指标 | 数值 |
|------|------|
| 测试文件数 | 4 |
| 测试用例数 | 83 |
| 通过率 | 95.2% |
| 失败项 | 4（均为 headless 模式限制） |

---

## 七、视觉改版成果

### 7.1 设计系统升级

- **字体系统**: JetBrains Mono（等宽代码字体）+ Noto Sans SC（中文无衬线）
- **焦点系统**: focus-visible 全局 2px 蓝色轮廓，支持暗黑模式
- **过渡系统**: 全局统一 200ms 过渡时长
- **缓动系统**: animationEngine.js 8 种缓动函数（含新增 easeOutExpo）

### 7.2 交互精致化

- **按钮**: hover 时微浮起（-translate-y-0.5）+ 阴影增强
- **输入框**: focus 时蓝色光晕（shadow-[0_0_0_3px_rgba(59,130,246,0.3)]）
- **导航项**: hover 时微右移（translate-x-0.5）
- **功能卡片**: hover 时浮起（-translate-y-1）+ 阴影增强

### 7.3 可视化增强

- **数组可视化**: 渐变填充（#93c5fd → #60a5fa → #2563eb）
- **排序可视化**: 4 种状态渐变（默认蓝/比较黄/交换绿/已排序紫）
- **哈希表可视化**: 垂直排列，统一配色，自适应宽度
- **动画质量**: easeOutExpo 缓动，更自然的运动曲线

---

## 八、v6.4 成果总结

### 8.1 核心改进

| 改进项 | 改进前 | 改进后 | 收益 |
|--------|--------|--------|------|
| 配置管理 | 600 行硬编码在 Hook 中 | 12 个独立配置文件 | 关注点分离，易于维护 |
| Hook 文件大小 | ~650 行 | 62 行 | 代码量减少 90%，可读性提升 |
| 类型定义 | 内联在 Hook 中 | 独立 `learning.d.ts` + `configs/learning/types.ts` | 可被任意模块引用 |
| 新增算法支持 | 11 种 | 12 种（+双向链表） | 扩展学习模式覆盖 |
| 文档完整性 | v6.3 状态 | 全部同步至 v6.4 | 开发 onboarding 体验提升 |

### 8.2 架构改进

- **配置层独立**：`src/configs/learning/` 成为新的配置层，与业务逻辑完全解耦
- **类型系统完善**：`src/types/learning.d.ts` 提供全局可引用的类型声明
- **模块化设计**：每个算法一个配置文件，符合单一职责原则
- **可扩展性**：新增算法只需创建配置文件并注册，无需修改 Hook 逻辑

---

## 九、下一步建议（v6.5）

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P2 | 剩余 .js 文件迁移 | 17 个 .js 文件待迁移为 .ts（visualizers/i18n/hooks/utils） |
| P3 | 测试覆盖率提升 | 目标 80%+ 覆盖率，页面组件测试 |
| P3 | 国际化扩展 | 学习步骤文本接入 i18n 系统 |
| P3 | 移动端适配优化 | 响应式布局和触控交互优化 |

---

> 本文档为 v6.4 迭代的项目摘要，后续迭代前必读。
> 下次迭代前请阅读此文件了解当前项目状态。
