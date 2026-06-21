# 数据结构学习助手 v13.0 项目摘要

> **更新日期:** 2026-06-22
> **当前版本:** v13.0.0 GA（Path 3 H2/H3/H1 全部完成，学习体验闭环）
> **项目状态:** v12 已部署；v13 路径一（Phase A/B/C/D）全部完成；路径三学习体验增强（H2 全局搜索 + H3 SortCompare 学习模式 + H1 测验系统）全部完成，达到 GA 可发布状态
> **验证基线:** Lint 0 errors / Build 成功 / 2280 单元测试通过（123 文件） / Bundle 预算符合 / Playwright 20 spec 全绿 / a11y 17 页 0 critical/serious / CI matrix Node 20 + 22 全绿

---

## v13 起点（2026-06-20 全面代码体检完成）

> **审计方法**: 双模型互盲 + 集中仲裁
> **产物**: [合并仲裁报告](./docs/audit-2026-06-20/audit-merged.md) / [设计 spec](./docs/superpowers/specs/2026-06-20-v13-code-audit-design.md) / [实施计划](./docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md)
> **问题数**: 56 条独立问题（P0: 0 / P1: 29 / P2: 24 / P3: 3）— 共识 6 + A-独报 21 + B-独报 29

### v13 路线（4 阶段，7~12 天单人）

| Phase | 主题 | 工时 | 状态 |
|-------|------|------|------|
| A | 紧急修复（安全+数据完整性） | 1~2 天 | ✅ 已完成（commit `0a544a9`） |
| B | 体验+工程优化（性能+渲染+a11y） | 3~5 天 | ✅ 已完成（lint 0 errors / build 通过） |
| C | 文档完善（一致性+API 文档） | 1~2 天 | ✅ 已完成（8 份文档同步） |
| D | 测试+CI 升级（E2E 框架+覆盖率可视化） | 2~3 天 | ✅ 已完成（Playwright 20 spec / a11y 17 页 / CI artifacts） |

### Phase A 完成详情（2026-06-21）

| 问题 | 文件 | 修复内容 |
|------|------|----------|
| S-03/E-01 | `package.json` | devDependencies 版本限定从 `^` 改为 `~` |
| E-01 | `.github/workflows/ci.yml` | 新增 `npm ls --depth=0` 依赖版本校验 |
| E-04 | `scripts/check-bundle.js` | 用 `fileURLToPath` 替代 `import.meta.dirname` |
| S-02 | `vite.config.js` | 移除 `loli.net` 第三方字体代理缓存配置 |
| A-01 | `src/hooks/useDataStructureState.ts` | 渲染阶段 ref 赋值移入 `useEffect` |
| S-01/A-05 | `src/utils/schema.ts` + `useDataStructureState.ts` | 统一 schema 校验（`MAX_STORAGE_DEPTH = 10`），无效 localStorage 自动清除 |

**新增测试**: `src/__tests__/utils/schema.test.ts`（14 tests）  
**验证**: 3494 tests / lint 0 errors / typecheck / build 全通过

### Phase B 完成详情（2026-06-21）

| 问题域 | 关键文件 | 修复内容 |
|--------|----------|----------|
| ANIM-1~5 / PERF-1~5 | `src/utils/animationEngine.ts` + `src/hooks/useVisualizer.ts` | FPS 降级（>100ms 帧阻塞立即触发）、动画 abort、wait 清理、applyPreset 中断当前动画、RAF ID 提 ref |
| VIZ-1~5 / BUG-1~7 | `src/visualizers/treeVisualizer.ts` / `graphVisualizer.ts` / `unionFindVisualizer.ts` / `avlTreeVisualizer.ts` / `trieVisualizer.ts` / `arrayVisualizer.ts` / `stackVisualizer.ts` | 树 positionStore 绑定 SVG、图 NODE_RADIUS 收敛常量、defs 去重、并查集 findRootId 缓存、栈宽度自适应 |
| A11Y-1~6 | `src/components/InfoPanel.tsx` / `LogPanel.tsx` / `SpeedControl.tsx` / `UndoRedoBar.tsx` + 4 个 visualizer | 日志高亮替代自动跳转、ARIA tablist/tab/aria-controls、树/图 ↑↓ 父/子导航、节点 tabindex/焦点环、边 aria-label、快捷键 aria-keyshortcuts |
| MOB-1~6 / FB-1~6 | `src/components/Sidebar.tsx` / `InfoPanel.tsx` / `src/hooks/useKeyboard.ts` / `src/utils/toastStore.ts` / `src/hooks/useHistory.ts` | 左缘右滑打开侧边栏、触控按钮 ≥44px、InfoPanel 移动端 flex-1 抽屉、输入框跳过 Ctrl+Z/Y、错误 toast 显示模块/操作、undo/redo 先 abort |

**新增/更新测试**: `toastStore.test.ts`、`useKeyboard.test.ts`、`stackVisualizer.test.ts`、`InfoPanel.test.tsx`、`animationEngine.test.ts`、`useVisualizer.test.ts` 等  
**验证**: lint 0 errors（65 warnings，既有模式） / typecheck 0 错误 / build 成功 / bundle 预算通过

### Phase C 完成详情（2026-06-21）

| 任务 | 内容 |
|------|------|
| 文档一致性 | 同步 `README.md` / `PROJECT_SUMMARY.md` / `CHANGELOG.md` / `TODO.md` / `WORKLOG.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `PROJECT_STATUS.md` 版本号与状态 |
| 版本升级 | `package.json` version 从 `v13.0.0-rc1-phase-b` 升级为 `v13.0.0-rc2` |
| 验证 | 人工核对 + lint/typecheck/build/test 全通过 |

### Phase D 完成详情（2026-06-21）

| 问题域 | 关键文件 | 修复内容 |
|--------|----------|----------|
| E2E Playwright spec | `e2e/a11y.spec.ts` + `e2e/home.spec.ts` | 动态 a11y 扫描 17 页、首页 3 个 Playwright Test 用例 |
| a11y runner | `e2e/test-a11y.js` | 委托 `npx playwright test a11y.spec.ts`；CI 中 `--project=chromium` |
| E2E JSON 报告 | `e2e/run-all-tests.js` | 输出 `e2e/test-results.json` 统一协议 |
| 单测基础设施 | `src/__tests__/setup.ts` + `d3MockHelper.ts` + `arrayVisualizer.snapshot.test.ts` | setup TypeScript 化、D3 mock 调用记录、数组可视化 snapshot |
| CI 增强 | `.github/workflows/ci.yml` | a11y 测试、覆盖率 artifact、构建产物 artifact、E2E 报告 artifact |

**新增/更新测试**: `arrayVisualizer.snapshot.test.ts` 等  
**验证**: 2234 tests（118 文件） / lint 0 errors（65 warnings） / typecheck 0 错误 / build 成功 / bundle 预算通过 / Playwright 20 spec 全绿 / a11y 17 页 0 critical/serious violations

### Path 3 H2 全局搜索增强完成详情（2026-06-21）

| 子任务 | 文件 | 内容 |
|--------|------|------|
| H2-1 搜索索引扩展 | `src/data/searchIndex.ts` | `SearchItem` 新增 `complexity` / `tags`，从学习步骤描述提取时间/空间复杂度 |
| H2-2 Fuzzy 匹配 | `src/utils/fuzzySearch.ts` | LCS 轻量模糊匹配，含连续匹配/首字符/大小写敏感加权 |
| H2-3 搜索历史 | `src/hooks/useSearchHistory.ts` | localStorage 持久化，上限 10 条，去重，支持单个/全部清除 |
| H2-4 复杂度过滤 | `src/components/GlobalSearch.tsx` | 顶部复杂度标签，仅过滤 learning 结果 |
| H2-5 分类展示 | `src/components/GlobalSearch.tsx` | history / page / learning 分组，sticky header，保留键盘导航 |
| H2-6 i18n | `src/i18n/locales.ts` | 新增历史、复杂度、分类相关键 |

**新增/更新测试**: `fuzzySearch.test.ts`、`useSearchHistory.test.ts`、`searchIndex.test.ts`、`GlobalSearch.test.tsx`  
**验证**: 2261 tests（121 文件） / lint 0 errors（65 warnings） / typecheck 0 错误 / build 成功 / bundle 预算通过

### Top10 优先（详见 audit-merged.md）

1. devDependencies 版本越界（A-独报 P1）
2. `isValidStoredData` 不递归深度（共识 P1）
3. useVisualizer rafId 闭包错乱 + animationEngine 模块单例 + wait() 闭包链（共识 P1）
4. `treeVisualizer positionStore` 全局单例（共识 P1）
5. `useDataStructureState` 渲染阶段写 ref（A-独报 P1）
6. `react-hooks/set-state-in-effect` 永久降级 warn（A-独报 P1）
7. vite.config.js 配 `loli.net` 注释写 google fonts（A-独报 P1）
8. InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸（B-独报 P1）
9. 树/图键盘 ↑↓ 跳"前/后节点"而非"父/子"（B-独报 P1）
10. undo/redo/applyPreset 不打断正在跑的动画（B-独报 P1）

### 后续 v13 Path 3 方向（H3/H1 待启动）

- **H3 SortComparePage 学习模式**: 排序对比页接入 `useLearningMode`，按步骤对比算法执行过程
- **H1 测验系统**: `QuizPanel` 组件 + `useQuizProgress` Hook + 学习步骤检测/选择题
- **实施真源文档**: [docs/superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md](./docs/superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md)

### 后续 v14+ 方向

- **架构演进**: 引入 Zustand/Jotai 替代 useRef/useState 混合；`animationEngine` 升级为声明式 API
- **算法扩展**: A*、KMP、Rabin-Karp、斐波那契堆、B 树/B+ 树
- **教学能力**: 成就系统、学习路径推荐、错题本
- **工程化**: Storybook + 视觉回归测试、Lighthouse CI
- **国际化**: 多语言扩展、术语表统一
- **可视化**: 3D 模式（WebGL）、实时多算法对比

---

## 一、项目定位

**ds-visualizer**（数据结构学习助手）是一款面向计算机专业在校生的轻量级前端开源教学工具，通过 D3.js SVG 动态动画实现 15 种数据结构 + 12 种算法的交互式可视化、分步学习模式。

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
| React Router | 7.15 | 路由（协议感知 Router，17 页 React.lazy 代码分割） |
| Vitest | 4.1 | 单元测试（2261 tests / 121 文件） |
| Playwright | 1.60 | E2E 测试（Chromium + Firefox） |
| @sentry/react | 10.57 | 错误监控 |
| vite-plugin-pwa | 1.3 | PWA 离线支持 |
| typescript-eslint | 8.61 | ESLint TS 文件支持（tseslint.config + recommended 规则集） |

---

## 三、六层架构

```
Entry (main.tsx → App.tsx) → Pages (17) → Components (37) → Hooks (27) → Visualizers (15) → Algorithms/Utils
```

- **状态管理:** 无 Redux/Zustand，每个数据结构独立 `use*State` Hook（15 个），内部统一使用 `useHistory`（useRef 实现的撤销/重做栈，最多 20 步）
- **可视化模式:** D3.js 全清+全绘策略（`container.selectAll('*').remove()` 后重建），SVG 使用 viewBox 自适应；公共居中布局由 `visualizerLayout.ts` 统一处理
- **动画引擎:** `src/utils/animationEngine.ts` 集中管理，提供全局速度倍率、性能模式、5 种动画预设、FPS 监控、可中止动画、delayStart 延迟启动 API
- **学习路径系统:** `useLearningProgress` 重构后支持 CustomEvent 同步、SyncStatus 状态、统计 API、目标设定；配合 `ProgressOverview`、`LearningRecommendations`、`learningRecommender` 实现进度可视化与智能推荐
- **内容分层:** `ContentTier` 组件支持基础/进阶/拓展三层内容展示，集成到 5 个核心数据结构页面
- **全局搜索:** `GlobalSearch` 组件（Ctrl/Cmd+K 唤起），基于 `src/data/searchIndex.ts` 索引，支持 fuzzy 模糊匹配、搜索历史（localStorage 持久化）、复杂度过滤、page/learning/history 分类展示
- **数据持久化:** 15 种数据结构通过 localStorage 自动保存/恢复
- **国际化:** 自研轻量 i18n（中文+英文）

---

## 四、已实现核心功能（17 个页面）

| 类别 | 页面 | 数据结构/算法 |
|------|------|--------------|
| 线性结构 | ArrayPage, LinkedListPage, StackPage, QueuePage | 数组、链表、栈、队列 |
| 树形结构 | TreePage, AvlTreePage, RedBlackTreePage, HeapPage, TriePage | 二叉搜索树、AVL 树、红黑树、堆、字典树 |
| 图结构 | GraphPage, GraphAlgorithmPage | 图（增删节点/边）、BFS/DFS/Dijkstra/拓扑排序 |
| 高级结构 | SkipListPage, UnionFindPage | 跳表（多层链表 + 概率平衡）、并查集（路径压缩 + 按秩合并） |
| 排序算法 | SortPage, SortComparePage | 冒泡/选择/插入/快排/归并/堆/基数/桶/希尔/梳排/Tim/计数（12 种） |
| 哈希 | HashPage | 哈希表 |

### v12 新增功能

- **跳表 SkipList**：扁平化数据表示，多层链表，概率平衡；多层水平布局可视化；7 步学习配置
- **并查集 Union-Find**：路径压缩 + 按秩合并，扁平化数据表示；森林布局可视化；7 步学习配置
- **红黑树 Red-Black Tree**：递归对象表示，插入 + fixup + 旋转，深拷贝不可变更新；树形布局可视化，红黑颜色区分；7 步学习配置
- **全局搜索 GlobalSearch**：Ctrl/Cmd+K 唤起，键盘导航；支持 fuzzy 模糊匹配、搜索历史、复杂度过滤、分类展示

### 学习模式体系
- **37 个学习配置文件**（`src/configs/learning/`），覆盖 4 图算法 + 8 排序 + 13 数据结构 + 3 拓展主题（complexityAnalysis/advancedDataStructures/realWorldApplications）+ 3 v12 新增（skipList/unionFind/redBlackTree）
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
| ESLint flat config | ✅ | tseslint.config 覆盖 JS + TS 文件，0 errors（65 warnings 全为既有代码模式） |
| 单元测试 | ✅ | 2261 tests / 121 文件（v13 Path 3 H2 基线） |
| E2E 测试 | ✅ | Playwright（Chromium + Firefox），317 测试 / 97.0% 通过 |
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

## 六、当前迭代状态（v12.0）

v12.0 数据结构扩展与全局搜索已完成，新增 3 个数据结构与全局搜索功能：

| Task | 内容 | 状态 |
|------|------|------|
| Task 5 | 跳表 SkipList：算法（扁平化数据表示，多层链表，概率平衡）+ Hook + 可视化器（多层水平布局）+ 页面（`/skip-list`）+ 学习配置（7 步）+ 108 个新测试 | ✅ 完成 |
| Task 6 | 并查集 Union-Find：算法（路径压缩 + 按秩合并）+ Hook + 可视化器（森林布局）+ 页面（`/union-find`）+ 学习配置（7 步）+ 132 个新测试 | ✅ 完成 |
| Task 7 | 红黑树 Red-Black Tree：算法（递归对象表示，插入 + fixup + 旋转，深拷贝不可变更新）+ Hook + 可视化器（树形布局，红黑颜色区分）+ 页面（`/red-black-tree`）+ 学习配置（7 步）+ 138 个新测试 | ✅ 完成 |
| Task 8 | 全局搜索 GlobalSearch：搜索索引（`src/data/searchIndex.ts`，从 STRUCTURE_KEYS + learningConfigs 生成）+ 组件（Ctrl/Cmd+K 唤起，键盘导航）+ Layout 集成 + 13 个新测试 | ✅ 完成 |
| 集成 | Sidebar 导出 STRUCTURE_KEYS + 3 个导航项和图标；Home 新增 3 张卡片；App 新增 3 条 lazy Route；i18n 新增 4 个命名空间；learning/index.ts 注册 3 个新配置（37 个总计） | ✅ 完成 |
| Bundle 优化 | vite.config.js 添加 learning-configs manualChunks 规则 | ✅ 完成 |
| 质量验证 | 3506 单元测试通过（204 文件，较 v12 增加 26 个测试）/ ESLint 0 errors（65 warnings 既有模式）/ TypeScript strict 0 错误 / Build 成功 / Bundle 预算符合（index < 110KB / vendor-react < 250KB / vendor-d3 < 60KB） | ✅ 完成 |

### 上一迭代状态（v11.0）

v11.0 全面视觉统一与交互优化已完成，在 v10.0 基础上分 6 个 Phase 推进：

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 0 | 审计与准备（色彩使用审计、测试/lint 基线） | ✅ 完成 |
| Phase 1 | 色彩系统统一（收敛强调色、补全语义 token、组件视觉收敛） | ✅ 完成 |
| Phase 2 | 排序界面改进（sortVisualizer 柱状图底部序号标签） | ✅ 完成 |
| Phase 3 | 字典树动画优化（节点光晕、路径高亮、insert/search/delete 动画重设计） | ✅ 完成 |
| Phase 4 | 全面视觉优化（页面布局/排版、图标统一、阴影层次） | ✅ 完成 |
| Phase 5 | 交互体验提升（按钮 busy/disabled 反馈、动画 easing 曲线优化） | ✅ 完成 |
| Phase 6 | 最终验证与文档同步（全量测试 / lint / build / 文档更新） | ✅ 完成 |
| 质量验证 | 2996 单元测试通过 / ESLint 0 错误 / TypeScript strict 0 错误 / Build 1.96s / Bundle 预算符合 | ✅ 完成 |

### v11.0.1 后续补丁

| 任务 | 内容 | 状态 |
|------|------|------|
| 首页配色统一 | 图/哈希卡片分组色随主题统一：更新 `--color-card-group-graph` token 取值，避免 default/forest/warm/royal 主题下出现不一致的粉红色 | ✅ 完成 |
| AVL 遍历动画优化 | `avlTreeVisualizer.ts` 新增边流动点 (`traceEdgeToNode`) 与遍历节点脉冲 (`pulseTraverseNode`)，移除冗余 ripple，缩短尾等待 700ms → 500ms | ✅ 完成 |
| 质量验证 | 3042 单元测试通过 / ESLint 0 错误 / TypeScript strict 0 错误 / Build 成功 / Bundle 预算符合 | ✅ 完成 |

### Phase 5.6 统一信息面板（InfoPanel）

| 任务 | 内容 | 状态 |
|------|------|------|
| InfoPanel 组件 | 新增 `src/components/InfoPanel.tsx`，桌面端右侧 w-96 持久面板 + 移动端底部抽屉，双 Tab（操作日志/学习模式） | ✅ 完成 |
| LogPanel 重构 | 新增 `variant="embedded"` 模式，卡片式时间线替代旧暗色反转背景 | ✅ 完成 |
| 13 页面布局改造 | 11 标准页面 + GraphAlgorithmPage + SortComparePage 改为左右分栏 + InfoPanel | ✅ 完成 |
| 自动跳转机制 | 最新日志含 codeStepId 时自动切换学习 Tab + goToStep | ✅ 完成 |
| 质量验证 | 3089 单元测试通过 / ESLint 0 错误 / TypeScript strict 0 错误 / Build 成功 / Bundle 预算符合 | ✅ 完成 |

### 代码风格统一与架构优化（P1-P6）

| 任务 | 内容 | 状态 |
|------|------|------|
| P1 Import 与导出风格统一 | 17 个 components/ 文件 + useI18n.ts：type 前缀导入、移除未使用 React、后置 memo | ✅ 完成 |
| P2 解构与函数签名统一 | useHeapState/useHashState 多行解构、useTrieState void 返回类型、catch (error) 统一 | ✅ 完成 |
| P3 类型去重与常量提取 | 新增 `src/visualizers/visualizerConstants.ts`，提取 DEFAULT_NODE_RADIUS / DEFAULT_LEVEL_HEIGHT | ✅ 完成 |
| P4 页面公共逻辑提取 | `useSharedData<T>` 泛型化，11 个页面消除 as any 滥用 | ✅ 完成 |
| P5 注释语言统一 | 7 个文件 24 处英文注释翻译为中文，保留技术术语与 JSDoc | ✅ 完成 |
| P6 ESLint 配置增强 | 安装 typescript-eslint@8.61.1，tseslint.config 覆盖 TS 文件，no-unused-vars 规则 | ✅ 完成 |
| 质量验证 | 3089 单元测试通过 / ESLint 0 errors（59 warnings 已有代码模式）/ TypeScript strict 0 错误 / Build 成功 / Bundle 预算符合 | ✅ 完成 |

### 上一迭代状态（v10.0）

v10.0 UI 打磨与可视化定位修复已完成，在 v9.0 基础上分 3 个 Phase 推进：

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 0 | 可视化定位修复（arrayVisualizer / trieVisualizer 移除 getViewBoxSize，Visualizer 响应式重渲染） | ✅ 完成 |
| Phase 1 | 首页与组件 UI 优化（Card 渐变模式、Home 配色统一、LearningRecommendations 图标替换、ProgressOverview 目标设定交互修复） | ✅ 完成 |
| Phase 2 | 主题渐变色 Token（themeColors 增加 gradientStart/gradientEnd，Home Logo/Hero 使用渐变） | ✅ 完成 |
| Phase 3 | 最终验证与文档同步（全量测试 / lint / build / 文档更新） | ✅ 完成 |
| 质量验证 | 2978 单元测试通过 / ESLint 0 错误 / TypeScript strict 0 错误 / Build 2.01s / Bundle 预算符合 | ✅ 完成 |

### 上一迭代状态（v9.0）

v9.0 全面迭代优化已完成，分 4 个 Phase 推进：

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 1 | 动画与交互修复（可视化主体定位、公共居中工具、延迟启动指示器、animationEngine delayStart API） | ✅ 完成 |
| Phase 2 | 学习路径系统优化（useLearningProgress 重构、ProgressOverview、LearningRecommendations、learningRecommender、LearningPath 信息框重设计） | ✅ 完成 |
| Phase 3 | 可视化界面优化（trieVisualizer 美化、GraphPage 矩阵/邻接表 UI、ComplexityChart 重设计、GraphAlgorithmPage 横线清理） | ✅ 完成 |
| Phase 4 | 功能内容拓展（3 个学习配置、ContentTier 内容分层、5 个核心页面集成） | ✅ 完成 |
| 质量验证 | 2866 单元测试通过 / ESLint 0 错误 / TypeScript strict 0 错误 / Build 808ms / Bundle 预算符合 | ✅ 完成 |
| Phase U1 | 动画性能优化与大数据降级（后续 UI 美化 P1） | ✅ 完成 |

---

## 七、UI 美化迭代状态

基于 [docs/archive/referenced-planning.md](./docs/archive/referenced-planning.md) 中归档的「项目视觉设计审查报告」的长期 UI 美化计划，已完成前三个阶段、Phase U1 及 v10 UI 打磨：

| Phase | 内容 | 状态 |
|-------|------|------|
| Phase 1 | 统一原子组件（Button / Card）、修复 WCAG 2 AA 对比度（placeholder / disabled / 副标题） | ✅ 完成 |
| Phase 2 | 修正视口单位（`h-screen` → `h-dvh` / `min-h-dvh`）、统一移动端滚动策略（body 滚动锁定）、统一 `focus-ring`、补充 `aria-busy` / `aria-disabled` | ✅ 完成 |
| Phase 3 | 构建完整 Design Token 体系：语义化颜色/圆角/阴影 token、主题完整调色板、按钮语义变体收敛、卡片统一、`border-l-4` 与 `border-dashed` 清理、SVG 字体 token 化 | ✅ 完成 |
| Phase U1 | 动画性能优化与大数据降级：统一 `performanceConfig` 阈值配置、数组/图/树动画迁移至 transform/opacity、力导向 tick 使用 transform 更新、animationEngine FPS 自动降级、`measureRender` 渲染耗时观测 | ✅ 完成 |
| v10 | UI 打磨与可视化定位修复：Home 配色统一、Card 渐变、LearningRecommendations 图标替换、ProgressOverview 目标设定交互修复、array/trie Visualizer 居中修复、Visualizer 响应式重渲染、themeColors 渐变 token | ✅ 完成 |
| v11.0.1+ | 首页图/哈希卡片分组色主题统一、AVL 遍历动画优化（边流动点、节点脉冲、移除冗余 ripple） | ✅ 完成 |

### Design Token 体系核心交付

- **语义 token**：`--color-paper / ink / surface / surface-strong / muted / muted-foreground / border / border-subtle / border-strong / accent / accent-foreground` 等，覆盖 light/dark。
- **圆角 token**：`--radius-none / --radius-sm / --radius-md / --radius-full`。
- **硬阴影 token**：`--shadow-hard-sm / --shadow-hard-md / --shadow-hard-lg` 及 hover 变体；已移除 `shadow-soft` / `shadow-soft-lg`。
- **主题扩展**：`default / forest / warm / royal` 四套主题均拥有完整的 `paper / ink / surface / muted / accent` 映射。
- **组件标准化**：`Button` 仅暴露 `primary / secondary / danger / success / warning / info / ghost` 语义变体；`Card` 支持 `variant / shadow / radius` token 化属性。
- **SVG 字体去硬编码**：`arrayVisualizer.ts`、`trieVisualizer.ts` 等通过 CSS 变量注入字体族。

### UI 美化验证基线

| 验证项 | 结果 |
|--------|------|
| 单元测试 | 2978 passed（187 文件） |
| ESLint | 0 错误 / 0 警告 |
| 生产构建 | 成功，bundle 预算符合 |
| light/dark 模式 | ✅ 手动验证通过 |
| default/forest/warm/royal 四套主题 | ✅ 手动验证通过 |

### Phase U1 验证基线

| 验证项 | 结果 |
|--------|------|
| 单元测试 | ✅ 2956 passed（186 文件） |
| ESLint | ✅ 0 错误 / 0 警告 |
| 生产构建 | ✅ 成功，873ms，bundle 预算符合 |
| 大数据操作流畅性 | ✅ 数组 50+ / 图 20+ / 树 30+ 节点手动验证流畅 |

---

## 八、核心设计决策

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

## 九、已知限制

| 限制 | 影响 | 缓解措施 | 优先级 |
|------|------|---------|--------|
| E2E 自定义 runner（非 Playwright Test 框架） | 缺少内置重试、并行、报告 | 后续迭代评估迁移 | P2 |
| doublyLinkedList 配置无对应页面 | 学习模式缺口 | 后续迭代创建页面 | P2 |
| 大数据量（100+ 节点）性能 | 全清+全绘策略帧率下降 | LARGE_DATA_THRESHOLD 跳动画 | P2 |
| 文档缺口 | 缺少贡献指南、组件 API 文档 | 后续迭代补充 | P3 |
| 条件禁用按钮原因说明 | 未统一通过 `title` / `aria-describedby` 说明禁用原因 | 已在 Phase 2 核心能力中覆盖 `aria-disabled`，原因说明可在后续迭代补齐 | P3 |

---

## 十、下一步建议

| 优先级 | 任务 | 说明 |
|--------|------|------|
| ✅ 已完成 | v12 数据结构扩展与全局搜索 | 跳表 / 并查集 / 红黑树 3 个新数据结构 + GlobalSearch 全局搜索（Ctrl/Cmd+K）+ 391 个新测试 |
| P1 | B 树 B-Tree | 多路搜索树，磁盘存储场景；算法 + Hook + 可视化器 + 页面 + 学习配置 + 测试 |
| P1 | 线段树 Segment Tree | 区间查询与更新；算法 + Hook + 可视化器 + 页面 + 学习配置 + 测试 |
| P2 | 测验系统 | 每个数据结构配套测验题，含选择题、填空题、代码题；进度统计与错题本 |
| P2 | 响应式操作面板重构 | 基于审查报告中期 P2 项：小屏下 OperationBar 改为纵向折叠或底部抽屉、增加滑动提示与手势引导 |
| P2 | 功能扩展 | 新增 Bellman-Ford/Floyd-Warshall/Prim/Kruskal 图算法 + TimSort/ShellSort/CombSort 排序算法 |
| P2 | doublyLinkedList 页面 | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |
| P3 | 文档发布 | README 更新 + 版本号同步 + 截图目录瘦身 + 贡献指南 |

---

> 本文档为 v9.0 项目摘要，后续迭代前必读。详细变更历史见 CHANGELOG.md，工作日志见 WORKLOG.md。
