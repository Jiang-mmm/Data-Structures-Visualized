# 数据结构学习助手 v9.0 项目摘要

> **更新日期:** 2026-06-18
> **当前版本:** v9.0.0
> **项目状态:** v9.0 迭代已完成（Phase 1-4 全面迭代优化 + 质量验证通过）
> **验证基线:** Lint 0 errors / Build 808ms / 2866 单元测试通过（182 文件） / TypeScript strict 模式 / Bundle 预算符合

---

## 一、项目定位

**ds-visualizer**（数据结构学习助手）是一款面向计算机专业在校生的轻量级前端开源教学工具，通过 D3.js SVG 动态动画实现 10 种数据结构 + 12 种算法的交互式可视化、分步学习模式。

- **开源仓库:** https://github.com/Jiang-mmm/Data-Structures-Visualized.git
- **在线演示:** https://jiang-mmm.github.io/Data-Structures-Visualized/
- **目标用户:** 计算机专业在校生、算法入门学习者、面试刷题备考人群

---

## 二、技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.2 | UI 框架（函数组件 + 自定义 Hooks） |
| TypeScript | 5.8 | 类型安全（strict 模式全启用） |
| Vite | 8.0 | 构建工具（dev 端口 3000，bundle 预算检查） |
| D3.js | 7.9 | SVG 可视化渲染（全清+全绘策略） |
| Tailwind CSS | 4.3 | 样式（Neo-Brutalist 设计，light/dark/system + 4 色彩主题） |
| React Router | 7.15 | 路由（BrowserRouter，13 页 React.lazy 代码分割） |
| Vitest | 4.1 | 单元测试（2866 tests / 182 文件） |
| Playwright | 1.60 | E2E 测试（Chromium + Firefox） |
| @sentry/react | 10.57 | 错误监控 |
| vite-plugin-pwa | 1.3 | PWA 离线支持 |

---

## 三、六层架构

```
Entry (main.tsx → App.tsx) → Pages (13) → Components (33) → Hooks (22) → Visualizers (10) → Algorithms/Utils
```

- **状态管理:** 无 Redux/Zustand，每个数据结构独立 `use*State` Hook（11 个），内部统一使用 `useHistory`（useRef 实现的撤销/重做栈，最多 20 步）
- **可视化模式:** D3.js 全清+全绘策略（`container.selectAll('*').remove()` 后重建），SVG 使用 viewBox 自适应；公共居中布局由 `visualizerLayout.ts` 统一处理
- **动画引擎:** `src/utils/animationEngine.ts` 集中管理，提供全局速度倍率、性能模式、5 种动画预设、FPS 监控、可中止动画、delayStart 延迟启动 API
- **学习路径系统:** `useLearningProgress` 重构后支持 CustomEvent 同步、SyncStatus 状态、统计 API、目标设定；配合 `ProgressOverview`、`LearningRecommendations`、`learningRecommender` 实现进度可视化与智能推荐
- **内容分层:** `ContentTier` 组件支持基础/进阶/拓展三层内容展示，集成到 5 个核心数据结构页面
- **数据持久化:** 11 种数据结构通过 localStorage 自动保存/恢复
- **国际化:** 自研轻量 i18n（中文+英文）

---

## 四、已实现核心功能（13 个页面）

| 类别 | 页面 | 数据结构/算法 |
|------|------|--------------|
| 线性结构 | ArrayPage, LinkedListPage, StackPage, QueuePage | 数组、链表、栈、队列 |
| 树形结构 | TreePage, HeapPage, TriePage | 二叉搜索树、堆、字典树 |
| 图结构 | GraphPage, GraphAlgorithmPage | 图（增删节点/边）、BFS/DFS/Dijkstra/拓扑排序 |
| 排序算法 | SortPage, SortComparePage | 冒泡/选择/插入/快排/归并/基数/桶排序（7 种） |
| 哈希 | HashPage | 哈希表 |

### 学习模式体系
- **25 个学习配置文件**（`src/configs/learning/`），覆盖 4 图算法 + 8 排序 + 10 数据结构 + 3 拓展主题（complexityAnalysis/advancedDataStructures/realWorldApplications）
- 学习模式组件：`LearningModeToggle`、`LearningPath`、`StepExplainer`、`ProgressBar`
- 学习进度记忆：`useLearningProgress`（重构版，CustomEvent 同步 + 统计 API + 目标设定）、`useLearningMode`、`usePageTracker`
- 进度可视化：`ProgressOverview`（进度环 + 统计卡片 + 目标设定）
- 智能推荐：`LearningRecommendations` + `learningRecommender` 推荐算法
- 内容分层：`ContentTier` 组件，基础/进阶/拓展三层，集成到 5 个核心数据结构页面

---

## 五、工程化能力

| 能力 | 状态 | 说明 |
|------|------|------|
| TypeScript strict 模式 | ✅ | strictNullChecks + noImplicitAny + noUnusedLocals/Parameters |
| ESLint flat config | ✅ | 零警告 |
| 单元测试 | ✅ | 2866 tests / 182 文件（v9.0 coverage） |
| E2E 测试 | ✅ | Playwright（Chromium + Firefox），282 测试 / 98.2% 通过 |
| 无障碍 | ✅ | axe-core WCAG 2 AA 零 violations |
| CI/CD | ✅ | GitHub Actions：lint + typecheck + build + test + deploy |
| PWA | ✅ | vite-plugin-pwa，workbox 预缓存 |
| Bundle 预算 | ✅ | index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB |
| 撤销/重做 | ✅ | useHistory Hook，最多 20 步 |
| 动画速度控制 | ✅ | SpeedControl + animationEngine 全局倍率 |
| 国际化 | ✅ | 中英文 |
| 键盘快捷键 | ✅ | useKeyboard, useCommonKeyboard |
| 数据导入/导出 | ✅ | ExportImport 组件 |
| 分享功能 | ✅ | ShareButton + shareUtils |
| 性能监控 | ✅ | PerformanceMonitor + performanceLogger |
| 错误边界 | ✅ | ErrorBoundary + Toast 通知 |
| 响应式布局 | ✅ | Tailwind + viewBox SVG 自适应 |

---

## 六、当前迭代状态（v9.0）

v9.0 全面迭代优化已完成，分 4 个 Phase 推进：

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 1 | 动画与交互修复（可视化主体定位、公共居中工具、延迟启动指示器、animationEngine delayStart API） | ✅ 完成 |
| Phase 2 | 学习路径系统优化（useLearningProgress 重构、ProgressOverview、LearningRecommendations、learningRecommender、LearningPath 信息框重设计） | ✅ 完成 |
| Phase 3 | 可视化界面优化（trieVisualizer 美化、GraphPage 矩阵/邻接表 UI、ComplexityChart 重设计、GraphAlgorithmPage 横线清理） | ✅ 完成 |
| Phase 4 | 功能内容拓展（3 个学习配置、ContentTier 内容分层、5 个核心页面集成） | ✅ 完成 |
| 质量验证 | 2866 单元测试通过 / ESLint 0 错误 / TypeScript strict 0 错误 / Build 808ms / Bundle 预算符合 | ✅ 完成 |

---

## 七、核心设计决策

| 决策 | 方案 | 理由 |
|------|------|------|
| D3 渲染策略 | 全清+全绘（非 enter/update/exit） | 避免 DOM 操作与数据绑定错位，教学场景数据量小 |
| SVG 坐标系统 | viewBox + CSS w-full/h-full | 避免双坐标系冲突，统一内部坐标与视觉显示 |
| 可视化居中布局 | visualizerLayout.ts 公共工具 | 统一数组/栈/队列/链表等主体定位逻辑，避免重复实现 |
| 状态管理 | 自定义 Hooks + useHistory | 无需 Redux 复杂度，撤销/重做栈存 ref 避免重渲染 |
| 动画引擎集中化 | animationEngine.ts 单一来源 | 禁止原始 setTimeout/d3.transition duration |
| 动画职责 | 仅视觉高亮，不移动元素 | 位置变更通过全量重渲染完成 |
| 动画延迟启动 | delayStart API + AnimationDelayIndicator | 支持延迟启动动画的可视化反馈 |
| 学习进度同步 | CustomEvent + SyncStatus | 跨组件进度同步，避免 prop drilling |
| 学习推荐 | learningRecommender 推荐算法 | 基于学习进度智能推荐下一步学习内容 |
| 内容分层 | ContentTier 基础/进阶/拓展三层 | 适配不同学习阶段用户，渐进式学习 |
| 配置模块化 | configs/learning/ 独立配置文件 | 关注点分离，useLearningMode 从 650 行精简至 62 行 |
| D3 导入 | 统一从 d3Imports.ts 导入 | 避免双实例 transition prototype 冲突 |

---

## 八、已知限制

| 限制 | 影响 | 缓解措施 | 优先级 |
|------|------|---------|--------|
| E2E 自定义 runner（非 Playwright Test 框架） | 缺少内置重试、并行、报告 | 后续迭代评估迁移 | P2 |
| doublyLinkedList 配置无对应页面 | 学习模式缺口 | 后续迭代创建页面 | P2 |
| 大数据量（100+ 节点）性能 | 全清+全绘策略帧率下降 | LARGE_DATA_THRESHOLD 跳动画 | P2 |
| 文档缺口 | 缺少贡献指南、组件 API 文档 | 后续迭代补充 | P3 |

---

## 九、下一步建议

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P1 | 功能扩展 | 新增 Bellman-Ford/Floyd-Warshall/Prim/Kruskal 图算法 + TimSort/ShellSort/CombSort 排序算法 |
| P2 | 体验优化 | PWA 离线验证 + tree/graph/heap 大数据量优化 + 移动端手势增强 |
| P2 | doublyLinkedList 页面 | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |
| P3 | 文档发布 | README 更新 + 版本号同步 + 截图目录瘦身 + 贡献指南 |

---

> 本文档为 v9.0 项目摘要，后续迭代前必读。详细变更历史见 CHANGELOG.md，工作日志见 WORKLOG.md。
