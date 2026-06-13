# 数据结构学习助手 - TODO 列表

> **版本:** v6.5 (已完成)
> **更新日期:** 2026-06-01
> **状态:** v6.5 全部完成（排序停止修复、对比abort机制、32项E2E测试）

---

## 已完成 (v3.9)

- [x] locales.js 扩展翻译键（visualizer/shortcuts/page/performanceChart/timeline/emptyState/logPanel/exportImport）
- [x] 4 个公共组件 i18n 集成：EmptyState、LogPanel、ExportImport、KeyboardHelp
- [x] Home.jsx 国际化：标题/描述/功能卡片全部 t() 调用
- [x] 11 个数据页面国际化：Array/Stack/Queue/LinkedList/Tree/Graph/Sort/Hash/Heap/Trie/SortCompare
- [x] PerformanceChart 组件：D3 柱状图对比排序算法性能（比较次数/交换次数/总步数）
- [x] Timeline 组件：操作历史时间线，自动图标匹配，水平滚动
- [x] SortComparePage 集成 PerformanceChart + Timeline
- [x] 回归验证（Lint 0 errors，Build 通过，215 tests 全部通过）
- [x] README.md 同步至 v3.9（版本/功能列表/技术栈/v3.2-v3.9 变更历史）
- [x] ARCHITECTURE.md 同步至 v3.9（模块依赖图/已知限制/约束）
- [x] CODE_WIKI.md 同步至 v3.9（模块职责/文件清单/API 说明）
- [x] D3 大数据量渲染优化（sortVisualizer >100 元素时跳过 transition 动画，直接更新 DOM）

## 已完成 (v3.7)

- [x] 国际化（i18n）核心架构 - 轻量级翻译系统，无第三方依赖
- [x] locales.js - 中文（zh）+ 英文（en）完整翻译
- [x] useI18n hook - 翻译函数 t(key)，localStorage 持久化语言
- [x] GlobalSettingsProvider - i18n 集成到全局上下文
- [x] Sidebar 国际化 - 数据结构名称动态翻译
- [x] SpeedControl 国际化 - 速度标签翻译

## 已完成 (v3.6)

- [x] 数据持久化（localStorage）- 11 种数据结构自动保存/恢复
- [x] useDataStructureState 增加 storageKey 选项，自动保存/加载
- [x] 页面刷新后自动恢复上次操作数据（toast 提示）
- [x] 重置操作自动清除持久化数据
- [x] 测试环境清除 localStorage 避免干扰

## 已完成 (v3.5)

- [x] 新增算法对比模式（Sort Compare Mode，多算法并行对比）
- [x] 算法选择面板（点击切换选择/取消，运行时锁定）
- [x] 并行排序执行（Promise.all 同时运行多个排序算法）
- [x] 实时进度追踪（比较次数、交换次数、进度条）
- [x] 排序算法可视化（每算法独立 SVG 渲染）
- [x] 路由注册 + 侧边栏导航入口

## 已完成 (v3.4)

- [x] 新增字典树数据结构（Trie / Prefix Tree，字符串高效检索）
- [x] 字典树可视化（树形层级布局，根节点紫色/结束节点绿色/中间节点蓝色）
- [x] 字典树操作（insert/delete/search/startsWith + 动画反馈）
- [x] 边标签可视化（每条边显示字符，帮助理解前缀构建）
- [x] 路由注册 + 侧边栏导航入口

## 已完成 (v3.3)

- [x] 新增堆数据结构（Max Heap，完全二叉树 · 最大堆 · 优先级队列）
- [x] 堆可视化（完全二叉树层级布局，根节点紫色/叶子绿色/违规红色）
- [x] 堆属性违规检测（子节点 > 父节点时红色虚线连接）
- [x] 堆操作（insert、extractMax、peek + 插入/提取动画）
- [x] 路由注册 + 侧边栏导航入口

## 已完成 (v3.2)

- [x] 新增哈希表数据结构（Hash Table，取模哈希 + 链地址法冲突处理）
- [x] 哈希表可视化（桶数组 + 链表冲突节点 + 箭头连接）
- [x] 哈希表操作（insert/delete/search + 桶高亮动画）
- [x] 路由注册 + 侧边栏导航入口

---

## P1 - 高优先级（核心功能完善）

### 1. 添加缺失的排序算法
- [x] 快速排序（Quick Sort）
- [x] 归并排序（Merge Sort）
- [x] 堆排序（Heap Sort）
- **目标:** 覆盖主流排序算法，满足课程演示需求
- **影响范围:** `src/algorithms/sorting/` + `src/pages/SortPage.jsx`

### 2. 添加单元测试
- [x] 为 State Hooks 编写测试（useArrayState、useStackState、useQueueState、useSortState、useLinkedListState、useTreeState、useGraphState、useHashState、useHeapState、useTrieState）
- [x] 为工具函数编写测试（dataExport.ts、validate.ts、animationEngine.ts、useHistory、shareUtils、themeColors）
- [x] 为组件编写测试（StepExplainer、LogPanel、ComplexityChart、Timeline、PerformanceChart）
- [x] 配置 Vitest 测试框架
- **目标:** 核心逻辑测试覆盖率 > 70%（498 tests，29 个文件）
- **影响范围:** `src/hooks/`、`src/utils/`、`src/components/`

### 3. 二叉树操作增强
- [x] 添加删除节点功能（考虑子树重平衡）
- [x] 添加层序遍历（BFS 可视化）
- [x] 添加查找节点功能
- **目标:** 完善二叉树 CRUD 操作
- **影响范围:** `src/hooks/useTreeState.js` + `src/visualizers/treeVisualizer.js`

### 4. 链表操作增强
- [x] 添加按位置插入/删除
- [x] 添加链表反转可视化
- [x] 添加环检测可视化
- **目标:** 丰富链表操作演示
- **影响范围:** `src/hooks/useLinkedListState.js` + `src/visualizers/linkedListVisualizer.js`

---

## P2 - 中优先级（体验优化）

### 5. 性能优化
- [x] 图力导向模拟性能优化（alphaDecay + velocityDecay）
- [x] 减少不必要的重渲染（SpeedControl React.memo）
- [x] 排序 >100 元素时跳过动画，直接更新 DOM
- [x] D3 大数据量渲染优化（arrayVisualizer >50 元素跳过动画）
- [ ] D3 大数据量渲染优化（arrayVisualizer 虚拟化/分块渲染 - 长期优化）
  - 数组 > 50 元素时性能下降
- **目标:** 大数据量场景帧率 > 30fps

### 6. UI/UX 增强
- [x] 可视化区域网格线开关（on/off 切换）
- [x] PerformanceChart 组件（D3 柱状图）
- [x] Timeline 组件（操作历史时间线）
- [x] Timeline 全页面集成（9 个数据页面）
- [x] 优化移动端交互体验（双指缩放、滑动关闭、触摸目标规范）
- [x] 视觉与交互全面改版（字体系统、渐变填充、交互精致化、哈希表重设计、排序动画增强）
- [x] 添加操作撤销预览（显示撤销后的状态预览）
- **目标:** 提升用户操作体验

### 7. 错误处理完善
- [x] ErrorBoundary 错误边界增强（开发模式堆栈详情）
- [x] 动画异常恢复机制（safeAnimate 函数）
- [x] 添加网络离线检测
- **目标:** 提升系统稳定性

---

## P3 - 低优先级（功能扩展）

### 8. 新增数据结构
- [x] 哈希表（Hash Table）- 取模哈希 + 链地址法
- [x] 堆（Heap / Priority Queue）- 最大堆，完全二叉树层级布局
- [x] 字典树（Trie / Prefix Tree）- 字符串高效检索，前缀匹配
- **目标:** 扩展数据结构覆盖范围

### 9. 算法对比模式
- [x] 多算法并行对比执行（排序）- 6 算法并行可视化
- [x] 算法性能对比图表（PerformanceChart）
- [x] 算法性能对比导出（SortComparePage CSV/JSON + GraphAlgorithmPage CSV/JSON）
- **目标:** 帮助用户理解算法差异

### 10. 数据持久化
- [x] 用户操作历史自动保存到 localStorage
- [x] 自定义初始数据配置
- [x] 分享功能（Base64 编码数据到 URL，一键复制分享链接）
- **目标:** 提升用户粘性

### 11. 国际化支持
- [x] 中/英文切换
- [x] 提取文案到语言文件
- [x] 全页面 i18n 集成
- **目标:** 已完成

### 12. E2E 测试
- [x] Playwright E2E 测试框架
- [x] 首页导航测试（test-home.js，8 cases，100% 通过）
- [x] 核心页面操作测试（test-core.js，25 cases，88% 通过）
- [x] 高级功能测试（test-advanced.js，30 cases，100% 通过）
- [x] 边界条件测试（test-edge.js，20 cases，95% 通过）
- **目标:** 端到端回归验证（总体 95.2% 通过率）

---

## 技术债务

| 债务项 | 优先级 | 状态 | 影响 | 说明 |
|-------|-------|------|------|------|
| D3 大数据量渲染优化（arrayVisualizer） | P2-High | ✅ 已完成 | 性能瓶颈 | >50 元素跳过动画 |
| 统一动画引擎调用模式 | P2 | ✅ 已完成 | 提升代码一致性 | animationEngine.ts 统一封装 |
| 优化图页面自定义 SVG 渲染逻辑 | P2 | ⏳ 待处理 | 统一组件使用模式 | GraphPage 部分逻辑未使用 Visualizer 组件 |
| 完善 JSDoc 注释覆盖率 | P3 | ✅ 已完成 | 提升可维护性 | 8 个 visualizer 文件已补充 |
| 移动端交互优化 | P2 | ✅ 已完成 | 用户体验 | 双指缩放、侧边栏滑动、触摸目标规范 |
| E2E 测试框架引入 | P3 | ✅ 已完成 | 回归验证 | Playwright 4 文件 83 用例 |
| 测试文件 TypeScript 迁移 | P2 | ✅ 已完成 | 类型安全 | 29 个测试文件全部迁移至 .ts/.tsx |
| 控制台清理 | P3 | ✅ 已完成 | 代码质量 | 清理 39 处 console 调用 |
| 错误处理统一 | P2 | ✅ 已完成 | 可维护性 | errorHandler.ts 统一封装 |

---

## 里程碑计划

| 里程碑 | 目标版本 | 状态 | 关键交付物 |
|-------|---------|------|-----------|
| M1: 核心功能完善 | v2.4 | ✅ 已完成 | 排序算法扩展、单元测试框架 |
| M2: 体验优化 | v3.0 | ✅ 已完成 | 性能优化、UI/UX 增强 |
| M3: 数据结构扩展 | v3.4 | ✅ 已完成 | 哈希表、堆、字典树 |
| M4: 高级功能 | v3.9 | ✅ 已完成 | 算法对比、数据持久化、i18n |
| M5: 全页面 Timeline + 视觉改版 + 暗色模式适配 | v4.1 | ✅ 已完成 | Timeline 全页面集成、视觉改版、暗色模式适配、渐变填充统一、键盘快捷键补全 |
| M6: 功能增强迭代 | v4.2 | ✅ 已完成 | PerformanceChart 导出、GraphPage 统一确认、FPS 自适应动画 |
| M7: 主题扩展与交互深化 | v4.3 | ✅ 已完成 | 多配色主题系统（4 套主题）、Timeline 悬停预览、Sidebar 主题选择器 |
| M8: 性能与功能扩展 | v4.6 | ✅ 已完成 | 性能监控面板、动画预设系统、排序算法复杂度可视化 |
| M9: 交互体验增强 | v4.7 | ✅ 已完成 | 操作撤销预览、网络离线检测、分享功能 |
| M10: 交互与质量迭代 | v4.8 | ✅ 已完成 | Timeline 交互优化、数据导入验证增强、性能基准测试 |
| M11: 功能统一与质量迭代 | v4.9 | ✅ 已完成 | 全页面功能统一、移动端适配优化、代码质量优化 |
| M12: v5.0 里程碑 | v5.0 | ✅ 已完成 | 路由懒加载、E2E 测试扩展、TypeScript 迁移准备 |
| M13: TypeScript 基础 | v5.1 | ✅ 已完成 | 类型声明扩展、TypeScript 配置、Build 分析 |
| M14: TypeScript 迁移 | v5.2 | ✅ 已完成 | 核心 hooks/工具 .ts 迁移、CI/CD 配置 |
| M15: TypeScript 深化 | v5.3 | ✅ 已完成 | 更多 hooks/组件 .ts 迁移、E2E CI 集成 |
| M16: 代码质量优化 | v5.4 | ✅ 已完成 | 全面代码审查、性能优化、代码复用、安全加固、资源管理 |
| M17: TypeScript 完成 | v5.5 | ✅ 已完成 | 剩余 hooks/组件 .ts 迁移、单元测试扩展 |
| M18: TypeScript 100% | v5.6 | ✅ 已完成 | 页面/组件 .tsx 迁移、测试覆盖率提升 |
| M19: 组件迁移与优化 | v5.7 | ✅ 已完成 | 剩余组件 .tsx 迁移、测试覆盖率提升、性能优化 |
| M20: 图算法可视化 | v6.0 | ✅ 已完成 | BFS/DFS/Dijkstra/拓扑排序算法实现与可视化 |
| M21: 交互式学习与复杂度对比 | v6.1 | ✅ 已完成 | useLearningMode hook、StepExplainer 组件、ComplexityChart 组件 |
| M22: 学习模式扩展与质量优化 | v6.2 | ✅ 已完成 | 排序算法学习步骤、测试覆盖率提升、4 页面性能优化 |
| M23: 学习模式全覆盖与导出功能 | v6.3 | ✅ 已完成 | 链表/树/哈希表学习步骤、排序/可视化测试、GraphAlgorithmPage 导出 |

---

## 已完成（v4.0 + v4.1 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| Phase 1: 文档同步与修复 | P0 | ✅ 完成 | 4 份文档同步至 v3.9 |
| Phase 2: Timeline 全页面集成 | P0-High | ✅ 完成 | 9 个数据页面 Timeline 集成 |
| Phase 3: D3 大数据量渲染优化 | P1-High | ✅ 完成 | arrayVisualizer >50 元素跳动画 |
| Phase 4: 测试增强 | P1-High | ✅ 完成 | 215 → 333 tests，+5 测试文件 |
| Phase 5: 移动端交互优化 | P2-Medium | ✅ 完成 | 双指缩放、滑动关闭、触摸目标规范 |
| Phase 6: JSDoc 与代码规范 | P2-Low | ✅ 完成 | 8 个 visualizer 文件 JSDoc 补充 |
| 视觉改版: 字体系统与可访问性 | P1 | ✅ 完成 | JetBrains Mono + Noto Sans SC，focus-visible |
| 视觉改版: 交互精致化 | P1 | ✅ 完成 | 按钮/输入框/卡片 hover 效果增强 |
| 视觉改版: 全局渐变统一 | P1 | ✅ 完成 | array/sort/hash 三大 visualizer 渐变填充 |
| 视觉改版: 哈希表重设计 | P1 | ✅ 完成 | 垂直排列布局，自适应宽度 |
| 视觉改版: 排序动画增强 | P1 | ✅ 完成 | 4 色状态渐变，easeOutExpo 缓动 |
| E2E 测试框架 | P2 | ✅ 完成 | 4 文件 83 用例，95.2% 通过率 |
| Bug 修复（EASING + 版本号） | P0 | ✅ 完成 | easeInBack 修复，版本号 V4.1 |
| 共享主题感知工具 | P1 | ✅ 完成 | themeColors.js（颜色+渐变+检测） |
| SVG 暗色模式适配 | P1 | ✅ 完成 | 10/10 visualizer 主题感知 |
| 渐变填充统一 | P1 | ✅ 完成 | 10/10 visualizer 渐变填充 |
| 动画引擎增强 | P2 | ✅ 完成 | 12 种缓动函数（+3） |
| 键盘快捷键补全 | P2 | ✅ 完成 | 11 页面定义 + 输入框防护 |
| KeyboardHelp 动态化 | P2 | ✅ 完成 | 路由感知 + 动态显示 |

## 已完成（v4.6 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 性能监控面板 | P2 | ✅ 完成 | PerformanceMonitor 组件，FPS 颜色编码 + 内存使用 + 展开/折叠 |
| 动画预设系统 | P3 | ✅ 完成 | 5 种预设（标准/柔和/快速/戏剧/瞬时），SpeedControl 增强 |
| 排序算法复杂度可视化 | P3 | ✅ 完成 | SortPage 时间复杂度，ComparePage 双维度显示 |

## 已完成（v4.7 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 操作撤销预览 | P2 | ✅ 完成 | UndoPreviewButton 组件，hover 显示撤销/重做后的数据状态 |
| 网络离线检测 | P3 | ✅ 完成 | NetworkStatus 组件，监听 online/offline 事件，左下角提示 |
| 分享功能 | P3 | ✅ 完成 | ShareButton 组件，Base64 编码数据到 URL，一键复制 |

## 已完成（v4.8 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| Timeline 交互优化 | P2 | ✅ 完成 | 操作类型颜色编码、自动滚动、键盘左右箭头导航 |
| 数据导入验证增强 | P3 | ✅ 完成 | validateImportData 函数，校验类型/整数/范围/长度 |
| 性能基准测试 | P3 | ✅ 完成 | performanceBenchmark.js 工具，benchmark/benchmarkThreshold API |

## 已完成（v4.9 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 数据结构功能统一 | P2 | ✅ 完成 | 8 个 state hook + 8 个页面集成 UndoPreviewButton + ShareButton |
| 移动端适配优化 | P3 | ✅ 完成 | 640px 断点优化、操作栏横向滚动、隐藏滚动条 |
| 代码质量优化 | P3 | ✅ 完成 | JSDoc 类型注解 |

## 已完成（v5.0 里程碑）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 路由懒加载 + 代码分割 | P2 | ✅ 完成 | React.lazy + Suspense，主 bundle 从 495 kB 降至 320 kB |
| E2E 测试扩展 | P3 | ✅ 完成 | test-v5-features.js，覆盖懒加载/撤销预览/分享按钮/暗色模式 |
| TypeScript 迁移准备 | P3 | ✅ 完成 | animationEngine.d.ts / validate.d.ts / toastStore.d.ts |

## 已完成（v5.1 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 类型声明扩展 | P2 | ✅ 完成 | visualizers.d.ts（10 个模块）+ hooks.d.ts（全部状态接口） |
| TypeScript 配置 | P3 | ✅ 完成 | tsconfig.json + typescript + @types/d3 依赖 |
| Build 分析 | P3 | ✅ 完成 | rollup-plugin-visualizer，`npm run build:analyze` 命令 |

## 已完成（v5.2 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 核心 hooks .ts 迁移 | P2 | ✅ 完成 | useHistory / useDataStructureState 泛型 TypeScript 实现 |
| 核心工具 .ts 迁移 | P3 | ✅ 完成 | validate / shareUtils TypeScript 版本 |
| CI/CD 配置 | P3 | ✅ 完成 | GitHub Actions ci.yml，Node 18/20/22 矩阵测试 |

## 已完成（v5.3 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 更多 hooks .ts 迁移 | P2 | ✅ 完成 | useArrayState / useSortState / useStackState / useQueueState TypeScript 版本 |
| E2E 测试 CI 集成 | P3 | ✅ 完成 | ci.yml 新增 e2e job、浏览器安装、截图上传 |
| 组件 .tsx 迁移 | P3 | ✅ 完成 | PageHeader / EmptyState TypeScript 版本 |

## 已完成（v5.4 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 性能优化 | P2 | ✅ 完成 | useMemo/useCallback 优化 Sidebar/ArrayPage/GraphPage/SortPage/Visualizer |
| 可读性提升 | P3 | ✅ 完成 | GraphPage 单行函数格式化为多行 |
| 代码复用 | P3 | ✅ 完成 | useCommonKeyboard hook + UndoRedoBar 组件 |
| 安全加固 | P3 | ✅ 完成 | sanitizeInput 过滤增强 + localStorage 数据验证 |
| 资源管理 | P3 | ✅ 完成 | toastStore 清理函数 + animationEngine 状态重置 |

## 已完成（v5.5 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 剩余 hooks .ts 迁移 | P2 | ✅ 完成 | useLinkedListState / useTreeState / useGraphState / useHashState / useHeapState / useTrieState |
| 组件 .tsx 迁移 | P3 | ✅ 完成 | OperationBar / LogPanel TypeScript 版本 |
| 单元测试扩展 | P3 | ✅ 完成 | useCommonKeyboard.test.ts + validate-enhanced.test.ts（23 个用例） |

## 已完成（v5.6 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 页面 .tsx 迁移 | P2 | ✅ 完成 | 12 个页面全部迁移为 TypeScript |
| 组件 .tsx 迁移 | P3 | ✅ 完成 | Sidebar / Layout / App TypeScript 版本 |
| 测试覆盖率提升 | P3 | ✅ 完成 | useHistory.test.ts + shareUtils.test.ts（11 个用例） |

## 已完成（v5.7 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 剩余组件 .tsx 迁移 | P2 | ✅ 完成 | 13 个组件全部迁移为 TypeScript |
| 测试覆盖率提升 | P3 | ✅ 完成 | useDataStructureState.test.ts + useArrayState.test.ts（13 个用例） |
| 性能优化 | P3 | ✅ 完成 | Timeline / LogPanel / PerformanceChart useMemo 优化 |

## 已完成（v6.0 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 图算法实现 | P1 | ✅ 完成 | BFS / DFS / Dijkstra / 拓扑排序算法 |
| 图算法页面 | P1 | ✅ 完成 | GraphAlgorithmPage 可视化页面 |
| 路由与导航 | P1 | ✅ 完成 | App.tsx + Sidebar + 国际化 |
| 图算法测试 | P1 | ✅ 完成 | 17 个测试用例 |

## 已完成（v6.1 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 交互式学习模式 | P2 | ✅ 完成 | useLearningMode hook + StepExplainer 组件 |
| 复杂度可视化对比 | P3 | ✅ 完成 | ComplexityChart 组件，支持多算法对比 |
| 测试覆盖率提升 | P3 | ✅ 完成 | useLearningMode.test.ts + ComplexityChart.test.tsx（30 个用例） |

## 已完成（v6.2 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 学习模式扩展 | P2 | ✅ 完成 | 排序算法学习步骤（bubble/quick/merge/heap）+ SortPage 集成 |
| 测试覆盖率提升 | P3 | ✅ 完成 | StepExplainer/LogPanel/useKeyboard/themeColors 测试（61 个用例） |
| 性能优化 | P3 | ✅ 完成 | StackPage/QueuePage/LinkedListPage/TreePage useCallback+useMemo |

## 已完成（v6.3 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 学习模式扩展 | P2 | ✅ 完成 | 链表/树/哈希表学习步骤 + 3 页面集成 |
| 测试覆盖率提升 | P3 | ✅ 完成 | useLearningMode/sorting/useVisualizer 测试（42 个用例） |
| 算法性能对比导出 | P3 | ✅ 完成 | GraphAlgorithmPage CSV/JSON 导出功能 |

## 已完成（v6.4 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 主题色系统修复 | P0 | ✅ 完成 | 补全 11 个缺失颜色属性，4 主题 × 2 模式 |
| 排序对比面板空白修复 | P0 | ✅ 完成 | useEffect 尺寸测量 + 初始渲染 |
| 链表可视化修复 | P0 | ✅ 完成 | 渐变统一 + 反转动画镜像位移修复 |
| 堆/字典树颜色统一 | P1 | ✅ 完成 | 5 个动画函数改用渐变填充 |
| 性能监控集成 | P2 | ✅ 完成 | measureRender 泛型函数 + Visualizer 集成 |
| 可视化集成测试 | P2 | ✅ 完成 | 18 个 DOM 级别测试（链表 10 + 排序 8） |
| 浏览器 E2E 验证 | P1 | ✅ 完成 | 12/12 通过，0 errors，渲染 < 4ms |

## 已完成（v6.5 迭代）

| 任务 | 优先级 | 状态 | 关键成果 |
|------|--------|------|---------|
| 排序停止功能修复 | P0 | ✅ 完成 | stop() 调用 abort() 真正停止动画 |
| 对比页面 abort 机制 | P0 | ✅ 完成 | animationRefs + isAborted/abort + 速度同步 |
| 全面 E2E 功能测试 | P0 | ✅ 完成 | 32 项测试覆盖 6 大页面 + 控制台监控 |
| 测试脚本建设 | P1 | ✅ 完成 | e2e/test-v65-full.js 自动化 E2E 测试脚本 |
| 回归验证 | P0 | ✅ 完成 | lint 0 errors / build 成功 / 627 tests / E2E 32/32 |

## 待办（v6.5 及后续）

| 任务 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| 测试覆盖率提升 | P3 | ⏳ 待开始 | 目标 80%+ 覆盖率 |
| 页面组件测试 | P3 | ⏳ 待开始 | ArrayPage/SortPage/StackPage 等页面测试 |
| 移动端适配优化 | P3 | ⏳ 待开始 | 响应式布局和触控交互优化 |

---

> **说明:** 本文档为动态维护文件，随项目迭代持续更新。优先级可能根据实际需求调整。
