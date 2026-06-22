# 数据结构学习助手 - TODO 列表

> **版本:** v17.0.0 GA（待合并 main）
> **更新日期:** 2026-06-22
> **状态:** v17.0.0 GA 完成（UI/UX 7 项优化 R1-R7 + 浏览器验收 7/7 PASS）；下一步合并到 main 后规划 v18
> **v16.0.0 GA:** 已完成（2026-06-22，merge `b8d0b03`）— 设计统一化 + ENG-1 E2E 迁移 + ENG-2 覆盖率 >80% + ENG-3 lint 归零 + ENH-1 动画导出 + ENH-2 i18n 完善
> **v15 GA:** 已完成（2026-06-22）— 体验打磨（E1 PWA + E2 大数据 + E3 手势 + E4 模糊搜索 + U2 响应式 + U3 布局一致性 + U4 SVG 图标 + U5 禁用原因 + ISSUE-007 排序撤销阻塞）
> **v14 GA:** 已完成（2026-06-22）— 内容扩张（D1/G1/G2/G3/F2）
> **详细迭代计划:** v11 计划已归档至 [docs/archive/iteration-plan-v11.md](./docs/archive/iteration-plan-v11.md)；v12/v13/v14/v15 计划见 [docs/superpowers/plans/](./docs/superpowers/plans/)，v10/v11/v12 迭代记录见 WORKLOG.md
> **v13 体检报告:** [docs/audit-2026-06-20/audit-merged.md](./docs/audit-2026-06-20/audit-merged.md)
> **Path 3 实施真源文档:** [docs/superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md](./docs/superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md)
> **长线路线图:** [docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md)

---

## v17 UI/UX 迭代（2026-06-22 完成，待合并 main）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ 完成（待合并 main） |
| **基线** | v16.0.0 GA（merge `b8d0b03`） |
| **执行分支** | `feature/v17-ui-ux-iterations` |
| **R1 首页精简** | 4 辅助区块折叠为「学习中心」可展开面板（默认收起） |
| **R2 LogPanel 深色模式** | 4 类型 dark: 变体（oper / info / error / code） |
| **R3 SortCompare 布局** | PerformanceChart 移入主内容列；onCompare/onSwap 写 code 日志 |
| **R4 GraphAlgorithm 布局** | ComplexityChart 移至右侧 InfoPanel 同级区（上下布局） |
| **R5 测验扩充** | 5 核心 config 扩充至 5-8 题；QuizPanel Fisher-Yates 随机 |
| **R6 树连接线** | 4 个 tree visualizer 改 `<line>` 直线（B 树 / AVL / 红黑树 / 线段树） |
| **R7 Sort 日志深度** | onCompare/onSwap callback 每步写 addLog('code', ...)，>50 元素按 5 步降频 |
| **验收** | 1440p 浏览器 + Playwright DOM 断言 7/7 PASS；lint 0 / 2699 测试全绿 / build OK / bundle OK |
| **实施真源** | [docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md](./docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md) |

---

## 正在进行的规则同步（2026-06-22）

| 任务 | 状态 | 说明 |
|------|------|------|
| **`design-md/` 默认禁读** | ✅ 已落地 | `.trae/rules/project_rules.md` §16.1；`CLAUDE.md` / `AGENTS.md` / `PROJECT_STATUS.md` 已引用 |
| **`DESIGN.md` 设计真源约束** | ✅ 已落地 | `.trae/rules/project_rules.md` §16.2；冲突实现视为越权 |
| **任务收尾强制文档同步** | ✅ 已落地 | `.trae/rules/project_rules.md` §16.3；本 TODO.md 即按该规则同步更新 |

**后续执行要求**：每次任务完成前必须完成相关文档同步；用户豁免需标注 `DOCS: SKIPPED (user override)`。

---

## i18n 完善 / 算法术语表（2026-06-22 完成）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ 完成 |
| **新增 i18n 命名空间** | `complexity`（13 键）+ `algorithms`（16 数据结构 × 7 字段 = 112 键，type 定义 `AlgorithmGlossaryEntry`） |
| **新增 Hook** | `src/hooks/useAlgorithmGlossary.ts`（16 项术语条目） |
| **新增组件** | `src/components/AlgorithmGlossaryCard.tsx`（默认折叠避免 DOM 过大） |
| **集成页面** | Home（在 LearningPath 之后） |
| **测试** | 20 个（i18n 完整性 8 + hook 5 + component 6 + Home 集成 1） |
| **范围外** | 全项目 100+ 硬编码中文字符串（多为 `hooks.*` 内部日志 + `learningConfig.step.*` 教学文案，不属于用户可见 UI 字符串） |
| **验证** | lint 0/0 / 2699 测试全绿 / build 通过 / bundle check 通过 |
| **实施真源** | [docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md](./docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md) |

---

## 动画导出功能（2026-06-22 完成，SortPage 已集成）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ 完成（SortPage 试点） |
| **新增工具** | `src/utils/animationExport.ts`（WebM / GIF / ZIP 三种导出） |
| **新增组件** | `src/components/AnimationExportButton.tsx`（下拉式菜单） |
| **新增类型** | `src/types/gifenc.d.ts`（gifenc 1.0.3） |
| **新增依赖** | gifenc@1.0.3 + jszip@3.10.1（合计 < 35KB gzipped） |
| **i18n** | `exportAnimation` 命名空间（10 键，中英双文） |
| **测试** | 21 个（12 utils + 9 component） |
| **集成页面** | SortPage（其余 16 个页面可后续独立集成） |
| **验证** | lint 0/0 / 2679 测试全绿 / build 通过 / bundle check 通过 |

---

## v16 设计统一化（2026-06-22 完成）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ M1-M6 全部完成 |
| **Phase A 基础设施** | 新建 `DESIGN.md`（7 章设计真源：哲学/色彩/字体/间距阴影/动效/组件/可视化）；`src/index.css` 新增 v16 token 体系（surface ladder / keycap / command-palette / viz palette）；`.gitignore` 保护 `design-md/` |
| **Phase B 6 组件** | 已有 6 组件（Button/Card/Sidebar/Toast/GlobalSearch/KeyboardHelp）已 v16 对齐；Input/Modal 为 inline 模式无需独立组件 |
| **Phase C 命令面板** | `GlobalSearch` + `KeyboardHelp` 容器改用 `command-palette` class；3 个 `<kbd>` 元素改用 v16 `kbd` utility |
| **Phase D 17 页面** | 18 个 `*Page.tsx` 全部使用 `<PageHeader>`；layoutConsistency 测试覆盖（ArrayPage 已验证 min-h-dvh / flex / grain / page-header 完整结构） |
| **Phase E 17 visualizer** | 全部通过 `getColors()` 接入深色模式（`themeColors.ts` 已维护 light/dark 双调色板） |
| **Phase F 验收** | 测试 2699/2699 通过；ESLint 0 errors；`npm run build` 通过；Bundle check 通过；typecheck 4 个错误为 v16.0.0 GA 既有 `animationExport.ts` 问题（commit `8a81ff8`，与本次设计统一化正交） |
| **构建回归修复** | 修复 Phase A 引入的 `@theme` 块内嵌 `html.dark &` 选择器违反 Tailwind v4 约束 — 移出 `@theme` 块并改为顶层 `html.dark {}` |
| **影响范围** | 4 个核心文件（`index.css` / `GlobalSearch.tsx` / `KeyboardHelp.tsx` / `.gitignore`）+ 6 个文档同步；0 个组件被破坏性重写 |
| **实施真源** | [docs/superpowers/plans/2026-06-22-design-unification-v16.md](./docs/superpowers/plans/2026-06-22-design-unification-v16.md) |

---

## v15 体验打磨（已完成）

| 阶段 | 主题 | 状态 | 说明 |
|------|------|------|------|
| **E1** | PWA 离线 | ✅ 已完成 | ReloadPrompt + Google Fonts caching（commit `ba39cd7`） |
| **E2** | 大数据可视化 | ✅ 已完成 | PerformanceIndicator + 简化渲染（commit `d7952b7`） |
| **E3** | 移动端手势 | ✅ 已完成 | useGestures hook（5 种手势，commit `be4e59d`） |
| **E4** | KeyboardHelp 模糊搜索 | ✅ 已完成 | fuzzyMatchAny 跨页面搜索（commit `66d282c`） |
| **U2** | 响应式操作面板 | ✅ 已完成 | 移动端横向滚动 + collapsibleOnMobile（commit `594cd9f`） |
| **U3** | 跨页面布局一致性 | ✅ 已完成 | GraphAlgorithmPage 修复 + 布局测试（commit `11b298b`） |
| **U4** | SVG 图标系统 | ✅ 已完成 | Icon 组件 + 6 文件 emoji 替换（commit `6518050`） |
| **U5** | 条件禁用按钮原因 | ✅ 已完成 | disabledReason + aria-describedby（commit `1146d47`） |
| **ISSUE-007** | 排序撤销 | ✅ 已完成 | undoBlock 机制（commit `5355ea2`） |

### v15.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2590 passed（137 文件） |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |

---

## 下一阶段

v16 设计统一化（2026-06-22 完成 — M0-M6 全部达成；详见上文“v16 设计统一化”段）。  
下一步方向按需启动：v17 规划（待用户拍板），或基于 v16 基线做点状优化（按 v16.0.0 GA 收尾后的 issue triage 决定）。

> 按 `§16.1` 规则，`design-md/` 默认禁读；按 `§16.2` 规则，`DESIGN.md` 是设计真源（已存在，所有视觉决策必须以其为依据）。

---

## v16+ 工程化（已完成）

详见 [长线路图](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) 第四阶段。

| 阶段 | 主题 | 状态 | 关键产出 | Commit |
|------|------|------|----------|--------|
| **ENG-1** | Playwright 迁移 | ✅ 已完成 | 7 个 `test-*.js` → `*.spec.ts`；`scripts/run-e2e.mjs` | `23913a7` |
| **ENG-2** | 覆盖率 >80% | ✅ 已完成 | statements 77.92% → **80.05%**（+62 tests） | `7da029b` |
| **ENG-3** | lint 警告清理 | ✅ 已完成 | 67 → 0（react-hooks 补全 + 6 个 pre-existing 测试修复） | `6d32435` / `0fb5a2f` |
| **ENH-1** | 动画导出 | ✅ 已完成 | WebM/GIF/帧序列 ZIP；SortPage 集成；`gifenc` + `jszip` | `8a81ff8` |
| **ENH-2** | i18n 完善 | ✅ 已完成 | 125 键术语表；`AlgorithmGlossaryCard` | `99b5b0e` |

### v16.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | **2699 passed**（147 文件） |
| ESLint | **0 errors / 0 warnings** |
| TypeScript strict | 0 错误 |
| 生产构建 | 成功；bundle 全部 < budget（index 77.93KB / vendor-react 231.35KB / vendor-d3 52.54KB） |
| 测试覆盖率 | statements **80.05%** / lines 84.02% / branches 67.23% / functions 81.03% |
| E2E | core/edge/v5-features 三组 spec 全绿（chromium + firefox） |

---

## v14 内容扩张（已完成）

| 阶段 | 主题 | 状态 | 说明 |
|------|------|------|------|
| **D1** | 图算法补齐（4 个） | ✅ 已完成 | Bellman-Ford / Floyd-Warshall / Prim / Kruskal 测试补齐（46 tests，commit `d63a07c`） |
| **G1** | B-Tree | ✅ 已完成 | 多路搜索树完整实现（97 tests，commit `3d0acca`） |
| **G2** | Segment Tree | ✅ 已完成 | 区间查询 + 更新完整实现（104 tests，commit `cc6905f`） |
| **G3** | doublyLinkedList 模式 | ✅ 已完成 | LinkedListPage 双向模式测试补齐（4 tests，commit `0a64d91`） |
| **F2** | 文档完善 | ✅ 已完成 | 算法接入指南（commit `10c1ad5`） |

### v14.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2526 passed（132 文件） |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| 数据结构总数 | 17（原 15 + B-Tree + Segment Tree） |
| 学习配置总数 | 40（原 38 + bTree + segmentTree） |

---

## 下一阶段：v15 体验打磨

详见 [长线路线图](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) 第三阶段。

| 阶段 | 主题 | 说明 |
|------|------|------|
| **E1** | PWA 离线 | Service Worker + Web App Manifest |
| **E2** | 大数据可视化 | 虚拟化 + 增量渲染 |
| **E3** | 移动端手势 | 滑动、双指缩放、长按 |
| **E4** | KeyboardHelp 模糊搜索 | 复用 fuzzySearch |
| **U2** | 响应式操作面板 | 移动端折叠 |
| **U3** | 跨页面布局一致性 | 统一 PageHeader 间距 |
| **U4** | SVG 图标系统 | 替换 emoji |
| **U5** | 条件禁用按钮原因 | aria-describedby + tooltip |
| **ISSUE-007** | 排序撤销 | undoBlock 优化 |

---

## Path 3 — 学习体验增强（v13.0.0-rc2 → GA，已完成）

| 阶段 | 主题 | 状态 | 说明 |
|------|------|------|------|
| **H2** | 全局搜索增强（fuzzy 匹配、搜索历史、复杂度过滤、分类展示） | ✅ 已完成 | fuzzySearch / useSearchHistory / searchIndex 扩展 / GlobalSearch UI 与测试 |
| **H3** | SortComparePage 学习模式 | ✅ 已完成 | sortCompare.config.ts / 页面集成 / 4 个测试（commit `2f56b83`） |
| **H1** | 测验系统 | ✅ 已完成 | QuizQuestion 类型 / useQuizProgress Hook / QuizPanel 组件 / InfoPanel 集成 / 19 个测试（commit `c07b89a`） |

### v13.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2280 passed（123 文件） |
| ESLint | 0 errors / 65 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |

---

## v13 修复路线（来自 audit-merged.md，2026-06-20 待启动）

| Phase | 主题 | 包含问题 | 预计工时 | 验证方式 |
|-------|------|----------|----------|----------|
| **A** | 紧急修复（安全+数据完整性） | S-01/S-02/S-03/E-01/E-04、A-01、A-05 | 1~2 天 | ✅ 已完成（commit 0a544a9）：3494 tests / lint 0 errors / typecheck / build 通过 |
| **B** | 体验+工程优化（性能+渲染+a11y） | P-01~P-04、ANIM-1~5、PERF-1~5、VIZ-1~5、BUG-1~7、A11Y-1~6、MOB-1~6、FB-1~6 | 3~5 天 | ✅ 已完成：lint 0 errors（65 warnings） / typecheck / build 通过 |
| **C** | 文档完善（一致性+API 文档） | D-01~D-07、E-02、E-07、E-09、E-10 | 1~2 天 | ✅ 已完成：8 份文档同步 / package.json version 升级 rc2 |
| **D** | 测试+CI 升级（e2e 框架+覆盖率可视化） | T-01~T-08、E-03、E-05、E-06、E-08 | 2~3 天 | ✅ 已完成：Playwright 20 spec / a11y 17 页 / CI artifacts / setup.ts / snapshot |

**总预计工时**: 7~12 天（单人）

### Top10 优先清单

| 序 | 标签 | 等级 | 问题 | 文件 | 修复方向 |
|----|------|------|------|------|----------|
| 1 | A-独报 | P1 | devDependencies 版本越界（vite ^8 / vitest ^4 / eslint ^10 / tailwind ^4.3 / @sentry ^10） | `package.json:38-54` | `npm ci` 校验 + CI `npm ls --depth=0` |
| 2 | 共识 | P1 | `isValidStoredData` 不递归深度 + `loadFromStorage` `JSON.parse as T` | `useDataStructureState.ts:14-51` | zod/valibot 统一 schema |
| 3 | 共识 | P1 | useVisualizer rafId 闭包错乱 + animationEngine 模块单例 + wait() 闭包链 | `useVisualizer.ts:40-66` + `animationEngine.ts:20-30, 286-293` | rafId 提 ref；preset 挂 useVisualizer() 上下文；wait 加 clearTimers() |
| 4 | 共识 | P1 | `treeVisualizer positionStore` 全局单例 | `treeVisualizer.ts:39-51` | `Map<svgElement, Map<dataIndex, pos>>` 绑 svg |
| 5 | A-独报 | P1 | `useDataStructureState` 渲染阶段写 ref | `useDataStructureState.ts:110-111` | useEffect 包裹 |
| 6 | A-独报 | P1 | `react-hooks/set-state-in-effect` 永久降级 warn | `eslint.config.js:36-37` | 逐文件开启 error 修补后启用 |
| 7 | A-独报 | P1 | vite.config.js 配 `loli.net` 注释写 google fonts | `vite.config.js:27-45` | 移除 loli.net 规则 |
| 8 | B-独报 | P1 | InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸 | `InfoPanel.tsx:36-48` + `LogPanel.tsx:60-61` | 自动跳转改高亮+徽标；aria-relevant=additions |
| 9 | B-独报 | P1 | 树/图键盘 ↑↓ 跳"前/后节点"而非"父/子" + AVL/UnionFind 节点不可 tab | `treeVisualizer.ts:322-335` 等 4 文件 | parentMap + 补 tabindex/role/aria-label |
| 10 | B-独报 | P1 | undo/redo/applyPreset 不打断正在跑的动画 | `useHistory.ts:27-35` 等 3 文件 | 先 `animRef.current?.abort()` |

---

## 已完成（v12 - 跳表 / 并查集 / 红黑树 / 全局搜索）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v12-T5 | 跳表 SkipList | P1 | ✅ | 算法 + Hook + 可视化器（多层水平布局）+ 页面（`/skip-list`）+ 学习配置（7 步）+ 108 个新测试 |
| v12-T6 | 并查集 Union-Find | P1 | ✅ | 算法（路径压缩 + 按秩合并）+ Hook + 可视化器（森林布局）+ 页面（`/union-find`）+ 学习配置（7 步）+ 132 个新测试 |
| v12-T7 | 红黑树 Red-Black Tree | P1 | ✅ | 算法（递归对象表示，插入 + fixup + 旋转）+ Hook + 可视化器（红黑颜色区分）+ 页面（`/red-black-tree`）+ 学习配置（7 步）+ 138 个新测试 |
| v12-T8 | 全局搜索 GlobalSearch | P1 | ✅ | 搜索索引（searchIndex.ts）+ 组件（Ctrl/Cmd+K 唤起，键盘导航）+ Layout 集成 + 13 个新测试 |
| v12-T9 | Sidebar/Home/App 集成 | P1 | ✅ | Sidebar 导出 STRUCTURE_KEYS + 3 个导航项和图标；Home 新增 3 张卡片；App 新增 3 条 lazy Route |
| v12-T10 | i18n 与学习配置注册 | P1 | ✅ | locales.ts 新增 4 个命名空间；learning/index.ts 注册 3 个新配置（37 个总计） |
| v12-T11 | Bundle 优化 | P2 | ✅ | vite.config.js 添加 learning-configs manualChunks 规则 |
| v12-T12 | 新增图算法 D1 | P1 | ✅ | Bellman-Ford、Floyd-Warshall、Prim、Kruskal + 学习配置 + 单元测试，graph 算法扩展到 8 种 |
| v12-T13 | 新增排序算法 D2 | P1 | ✅ | TimSort、ShellSort、CombSort、Counting + 学习配置 + 单元测试，sorting 算法扩展到 12 种 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v12-Q1 | 单元测试 | P0 | ✅ | 3480 tests passed（203 文件），较 v11 增加 391 个新测试 |
| v12-Q2 | ESLint | P0 | ✅ | 0 errors / 66 warnings（全部既有模式，Phase B 后 65 warnings） |
| v12-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v12-Q4 | 生产构建 | P0 | ✅ | 成功，Bundle size check passed（index 63.40KB / vendor-react 231.35KB / vendor-d3 52.54KB） |

### 数据结构总数变化

- v11：12 个数据结构页面（14 条路由含 compare 和 graph-algorithm）
- v12：15 个数据结构页面（17 条路由），新增跳表、并查集、红黑树

### 学习配置总数变化

- v11：34 个学习配置
- v12：37 个学习配置（新增 skipList、unionFind、redBlackTree）

---

## 已完成（代码风格统一与架构优化 P1-P6）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P1 | Import 与导出风格统一 | P1 | ✅ | 17 个 components/ 文件 + useI18n.ts：type 前缀导入、移除未使用 React、后置 memo |
| P2 | 解构与函数签名统一 | P1 | ✅ | useHeapState/useHashState 多行解构、useTrieState void 返回类型、catch (error) 统一 |
| P3 | 类型去重与常量提取 | P1 | ✅ | 新增 visualizerConstants.ts，提取 DEFAULT_NODE_RADIUS / DEFAULT_LEVEL_HEIGHT |
| P4 | 页面公共逻辑提取 | P1 | ✅ | useSharedData<T> 泛型化，11 个页面消除 as any 滥用 |
| P5 | 注释语言统一 | P2 | ✅ | 7 个文件 24 处英文注释翻译为中文，保留技术术语与 JSDoc |
| P6 | ESLint 配置增强 | P1 | ✅ | 安装 typescript-eslint@8.61.1，tseslint.config 覆盖 TS 文件，no-unused-vars 规则 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P1-P6-Q1 | 单元测试 | P0 | ✅ | 3089 tests passed（190 文件） |
| P1-P6-Q2 | ESLint | P0 | ✅ | 0 errors / 59 warnings（全是 react-hooks/exhaustive-deps，已有代码模式） |
| P1-P6-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| P1-P6-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（Phase 5.6 - 统一信息面板 InfoPanel）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P5.6-1 | InfoPanel 组件 | P1 | ✅ | 新增 `src/components/InfoPanel.tsx`，桌面端右侧 w-96 持久面板 + 移动端底部抽屉，双 Tab（操作日志/学习模式） |
| P5.6-2 | LogPanel 重构 | P1 | ✅ | 新增 `variant="embedded"` 模式，卡片式时间线替代旧暗色反转背景 |
| P5.6-3 | 13 页面布局改造 | P1 | ✅ | 11 标准页面 + GraphAlgorithmPage + SortComparePage 改为左右分栏 + InfoPanel |
| P5.6-4 | i18n 国际化 | P1 | ✅ | 新增 `infoPanel` 命名空间 8 个键（中英文） |
| P5.6-5 | 自动跳转机制 | P1 | ✅ | 最新日志含 codeStepId 时自动切换学习 Tab + goToStep |
| P5.6-6 | 测试覆盖 | P1 | ✅ | InfoPanel 9 个测试 + LogPanel embedded 5 个测试 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P5.6-Q1 | 单元测试 | P0 | ✅ | 3089 tests passed |
| P5.6-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| P5.6-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| P5.6-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（v11.0.1+ - 首页配色统一与 AVL 遍历动画优化）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-PATCH-1 | 首页图/哈希卡片分组色主题统一 | P1 | ✅ | 更新 `--color-card-group-graph` token，四套主题颜色协调 |
| v11-PATCH-2 | AVL 遍历动画优化 | P1 | ✅ | 新增边流动点、节点脉冲，移除冗余 ripple，缩短尾等待 |
| v11-PATCH-3 | 文档同步 | P1 | ✅ | PROJECT_SUMMARY / WORKLOG / TODO / CHANGELOG / README / ARCHITECTURE / CODE_WIKI 同步 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-PATCH-Q1 | 单元测试 | P0 | ✅ | 3042 tests passed（188 文件） |
| v11-PATCH-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| v11-PATCH-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v11-PATCH-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（v11.0.1 - 最终验证、文档同步与 GitHub 部署）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-FINAL-1 | 本地打开兼容修复 | P0 | ✅ | file:// 使用 HashRouter，生产 base 改为 `./` |
| v11-FINAL-2 | 全站语义化颜色统一 | P1 | ✅ | 20+ 文件硬编码颜色替换为 token |
| v11-FINAL-3 | 首页三色分组配色 | P1 | ✅ | 线性/树/图与哈希按 blue/amber/rose 分组 |
| v11-FINAL-4 | A11y 对比度修复 | P1 | ✅ | Sidebar 激活态文字改为 text-ink，12/12 页面 0 violations |
| v11-FINAL-5 | 文档与版本号同步 | P1 | ✅ | PROJECT_SUMMARY/README/ARCHITECTURE/CODE_WIKI/TODO/CHANGELOG/package.json 同步到 v11.0.1 |
| v11-FINAL-6 | GitHub 部署 | P0 | ✅ | 提交并推送 origin/main，触发 CI/Deploy 工作流 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-FINAL-Q1 | 单元测试 | P0 | ✅ | 3042 tests passed（188 文件） |
| v11-FINAL-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| v11-FINAL-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v11-FINAL-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |
| v11-FINAL-Q5 | E2E 功能 | P0 | ✅ | 308/308 passed |
| v11-FINAL-Q6 | E2E A11y | P0 | ✅ | 12/12 页面 0 violations |

---

## 已完成（v11.0 - 全面视觉统一与交互优化）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-P1 | 全局色彩系统统一 | P1 | ✅ | Button info 变体改为 accent-blue，收敛页面级强调色为 blue/amber |
| v11-P2 | 排序界面序号标识 | P1 | ✅ | sortVisualizer 柱状图底部新增数组下标序号 |
| v11-P3 | 字典树动画重设计 | P1 | ✅ | trieVisualizer 新增光晕、路径高亮、leaf 完成态动画 |
| v11-P4 | 组件与交互细节修复 | P1 | ✅ | Card 渐变修复、animationEngine 补全 easeInOutCubic |
| v11-P5 | 全面视觉与交互体验 | P1 | ✅ | 统一页面排版、按钮 busy/disabled 状态、动画缓动优化 |
| v11-P6 | 类型修复与最终验证 | P1 | ✅ | 新增 Button outline / UndoPreviewButton secondary 变体；2996→3042 测试 |

---

## 已完成（v10.0 - UI 打磨与可视化定位修复）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v10-P0 | 可视化定位修复 | P0 | ✅ | arrayVisualizer/trieVisualizer 移除 getViewBoxSize，Visualizer 新增 isAnimating prop |
| v10-P1 | 首页与组件 UI 优化 | P1 | ✅ | Home 收敛配色为 2 色，Card 新增 gradient，LearningRecommendations 替换灯泡 emoji，ProgressOverview 目标设定反馈 |
| v10-P2 | 主题渐变色 Token | P2 | ✅ | themeColors 增加 gradientStart/gradientEnd，Home Logo/Hero 使用主题渐变 |
| v10-P3 | 最终验证与文档同步 | P1 | ✅ | 2978 tests / lint 0 / build 成功，PROJECT_SUMMARY/WORKLOG/CHANGELOG 更新 |

---

## 已完成（v9.0 - 全面迭代优化）

### Phase 1：动画与交互修复

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P1-1 | 可视化主体定位修复 | P0 | ✅ | 修复数组/栈/队列/链表可视化主体定位异常 |
| v9-P1-2 | 公共居中工具 | P1 | ✅ | 新建 `src/utils/visualizerLayout.ts`，统一主体居中逻辑 |
| v9-P1-3 | 延迟启动指示器 | P1 | ✅ | 新建 `src/components/AnimationDelayIndicator.tsx` |
| v9-P1-4 | animationEngine delayStart API | P1 | ✅ | animationEngine.ts 新增 delayStart 延迟启动支持 |
| v9-P1-5 | 单元测试扩展 | P1 | ✅ | 单元测试从 2580 增长到 2866 |

### Phase 2：学习路径系统优化

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P2-1 | useLearningProgress 重构 | P0 | ✅ | CustomEvent 同步 + SyncStatus + 统计 API + 目标设定 |
| v9-P2-2 | ProgressOverview 组件 | P1 | ✅ | 新建进度环/统计卡片/目标设定组件 |
| v9-P2-3 | LearningRecommendations 组件 | P1 | ✅ | 新建推荐展示组件 |
| v9-P2-4 | learningRecommender 推荐算法 | P1 | ✅ | 新建 `src/utils/learningRecommender.ts` |
| v9-P2-5 | LearningPath 信息框重设计 | P2 | ✅ | LearningPath.tsx 信息框 UI 优化 |

### Phase 3：可视化界面优化

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P3-1 | trieVisualizer 美化 | P1 | ✅ | radialGradient + 贝塞尔曲线 + computeSubtreeWidth |
| v9-P3-2 | GraphPage 矩阵/邻接表 UI | P1 | ✅ | GraphPage.tsx 矩阵/邻接表 UI 重设计 |
| v9-P3-3 | ComplexityChart 重设计 | P1 | ✅ | 8 色调色板 + 表格视图 |
| v9-P3-4 | GraphAlgorithmPage 横线清理 | P2 | ✅ | 移除多余横线 |

### Phase 4：功能内容拓展

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P4-1 | 学习配置拓展 | P1 | ✅ | 新建 complexityAnalysis/advancedDataStructures/realWorldApplications 3 个配置 |
| v9-P4-2 | ContentTier 内容分层组件 | P1 | ✅ | 新建 `src/components/ContentTier.tsx`，基础/进阶/拓展三层 |
| v9-P4-3 | 核心页面集成 | P1 | ✅ | ContentTier 集成到 5 个核心数据结构页面 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-Q-1 | 单元测试 | P0 | ✅ | 2866 tests passed（182 文件） |
| v9-Q-2 | ESLint | P0 | ✅ | 0 错误 |
| v9-Q-3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v9-Q-4 | Build | P0 | ✅ | 808ms 成功 |
| v9-Q-5 | Bundle 预算 | P0 | ✅ | 符合（index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB） |

---

## 已完成（v8.1 - 动画挂起修复）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| FIX1 | transitionEnd 超时保护 | P0 | ✅ | animationEngine.ts 新增 3000ms 超时兜底 |
| FIX2 | Visualizer 重渲染修复 | P0 | ✅ | dimensionsRef 缓存，移除 dimensions 依赖 |
| FIX3 | Hash/Heap 链式过渡重构 | P0 | ✅ | 拆分为顺序 await，确保 end 事件捕获 |
| FIX4 | 动画/数据更新顺序修正 | P1 | ✅ | Hash/Heap/Trie 先 insert 再 animate |

---

## 已完成（UI 美化 Phase 1-3）

基于 [docs/archive/referenced-planning.md](./docs/archive/referenced-planning.md) 中归档的「项目视觉设计审查报告」的长期 UI 美化计划。

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| UI-P1-1 | 统一原子组件（Button / Card） | P0 | ✅ | 新建/完善 Button、Card，OperationButton 收敛为工具栏变体 |
| UI-P1-2 | 修复 WCAG 2 AA 对比度 | P0 | ✅ | placeholder / disabled / 副标题文字对比度达标 |
| UI-P2-1 | 修正视口单位 | P1 | ✅ | `h-screen` → `h-dvh` / `min-h-dvh` |
| UI-P2-2 | 统一移动端滚动策略 | P1 | ✅ | 侧边栏展开时锁定 `body` 滚动 |
| UI-P2-3 | 统一焦点环 | P1 | ✅ | 全局 `focus-ring` utility，输入框与小按钮统一 |
| UI-P2-4 | 加载/禁用状态 ARIA 语义 | P1 | ✅ | `aria-busy="true"` / `aria-disabled="true"` |
| UI-P3-1 | 语义化颜色 token | P1 | ✅ | paper / ink / surface / muted / accent 等 light/dark token |
| UI-P3-2 | 圆角与硬阴影 token | P1 | ✅ | `--radius-*` 与 `--shadow-hard-*`，移除 `shadow-soft` |
| UI-P3-3 | 主题完整调色板 | P1 | ✅ | default/forest/warm/royal 四套主题完整 surface 映射 |
| UI-P3-4 | 按钮语义变体收敛 | P1 | ✅ | primary/secondary/danger/success/warning/info/ghost |
| UI-P3-5 | 卡片与边框统一 | P1 | ✅ | 移除 `border-l-4` / `border-dashed`，Card 支持 variant/shadow/radius |
| UI-P3-6 | SVG 字体 token 化 | P1 | ✅ | arrayVisualizer / trieVisualizer 通过 CSS 变量注入字体 |
| UI-P3-7 | 验证与文档 | P1 | ✅ | 2929 tests / lint 0 / build 成功，PROJECT_SUMMARY/WORKLOG/TODO 更新 |

---

## 当前迭代（v12.x 后续阶段 - 待开始）

### Phase G：数据结构扩展（P1 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| G1 | B 树 B-Tree | P1 | ⬜ | 多路搜索树，磁盘存储场景；算法 + Hook + 可视化器 + 页面 + 学习配置 + 测试 |
| G2 | 线段树 Segment Tree | P1 | ⬜ | 区间查询与更新；算法 + Hook + 可视化器 + 页面 + 学习配置 + 测试 |
| G3 | doublyLinkedList 页面 | P2 | ⬜ | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |

### Phase H：学习体验增强（P2 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| H1 | 测验系统 | P2 | ⬜ | 每个数据结构配套测验题，含选择题、填空题、代码题；进度统计与错题本 |
| H2 | 全局搜索增强 | P3 | ⬜ | GlobalSearch 支持模糊匹配、搜索历史、算法复杂度搜索 |
| H3 | SortComparePage 学习模式 | P3 | ⬜ | 对比页面集成学习步骤 |

### Phase U：UI 美化后续（基于审查报告中期项 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| U1 | 动画性能优化与大数据降级 | P1 | ✅ | 统一性能配置模块 performanceConfig；数组/图/树 transform/opacity 动画迁移；力导向 tick transform 优化；animationEngine FPS 自动降级；渲染耗时 measureRender 观测；全部测试通过 |
| U2 | 响应式操作面板重构 | P2 | ⬜ | 小屏下 OperationBar 改为纵向折叠或底部抽屉；增加滑动提示与手势引导 |
| U3 | 跨页面布局一致性 | P2 | ⬜ | 页面内容区 `max-w-7xl` / `max-w-[1440px]`；右侧边栏自适应宽度 |
| U4 | SVG 图标系统 | P2 | ⬜ | 替换 Unicode 图标为统一 SVG icon 库 |
| U5 | 条件禁用按钮原因说明 | P3 | ⬜ | 统一 `title` / `aria-describedby` 说明禁用原因 |

### Phase D：功能扩展（P1 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| D1 | 新增图算法 | P1 | ⬜ | Bellman-Ford、Floyd-Warshall、Prim、Kruskal + 学习配置 + 单元测试 |
| D2 | 新增排序算法 | P1 | ⬜ | TimSort、ShellSort、CombSort + 学习配置 |
| D3 | doublyLinkedList 页面 | P2 | ⬜ | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |
| D4 | SortComparePage 学习模式 | P3 | ⬜ | 对比页面集成学习步骤 |

### Phase E：体验与性能优化（P2 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| E1 | PWA 离线验证 | P2 | ⬜ | 验证 14 个页面离线可访问 |
| E2 | 大数据量可视化优化 | P2 | ⬜ | treeVisualizer >30 跳动画、graphVisualizer >20 跳动画、heapVisualizer >30 跳动画；注意与 U1 协同 |
| E3 | 移动端手势增强 | P3 | ⬜ | 左右滑动切换页面、操作栏底部固定；注意与 U2 协同 |
| E4 | 键盘快捷键搜索 | P3 | ⬜ | KeyboardHelp 支持模糊匹配 |
| E5 | 排序操作撤销支持 | P3 | ⬜ | ISSUE-007: 排序后保留撤销点 |

### Phase F：文档与发布（P3 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| F1 | README.md 更新 | P3 | ✅ | 功能列表、测试数据、快速开始章节已同步到 v11.0.1 |
| F2 | CHANGELOG.md 完善 | P3 | ⬜ | 补充 v4.0-v8.0 变更历史 |
| F3 | 版本号同步 | P3 | ✅ | package.json / package-lock.json 已更新到 11.0.1 |
| F5 | GitHub Pages 部署验证 | P3 | ✅ | 已推送 origin/main，CI/Deploy 工作流自动触发 |

---

## 持续改进

| 任务 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| E2E 框架升级 | P2 | ⬜ | 评估从自定义 runner 迁移到 Playwright Test 框架 |
| 测试覆盖率提升 | P3 | ⬜ | 目标 80%+ 覆盖率，页面组件测试 |
| 贡献指南 | P3 | ⬜ | CONTRIBUTING.md |
| 架构设计文档 | P3 | ⬜ | 补充架构设计文档、组件 API 文档、算法接入指南 |

---

## 技术债务

| 债务项 | 优先级 | 状态 | 影响 | 说明 |
|-------|-------|------|------|------|
| 可视化主体定位异常 | P0 | ✅ 已解决 | 数组/栈/队列/链表主体偏移 | v9.0 Phase 1 通过 visualizerLayout.ts 公共居中工具修复 |
| 学习进度同步机制缺失 | P1 | ✅ 已解决 | 跨组件进度不同步 | v9.0 Phase 2 通过 useLearningProgress 重构（CustomEvent）修复 |
| 学习进度可视化缺失 | P1 | ✅ 已解决 | 用户无法直观查看进度 | v9.0 Phase 2 通过 ProgressOverview 组件修复 |
| 学习推荐机制缺失 | P1 | ✅ 已解决 | 用户缺乏学习引导 | v9.0 Phase 2 通过 learningRecommender + LearningRecommendations 修复 |
| trieVisualizer 视觉效果不足 | P2 | ✅ 已解决 | 字典树可视化层次感弱 | v9.0 Phase 3 通过 radialGradient + 贝塞尔曲线修复 |
| GraphPage 矩阵/邻接表 UI 粗糙 | P2 | ✅ 已解决 | 图数据展示不清晰 | v9.0 Phase 3 通过 UI 重设计修复 |
| ComplexityChart 配色单一 | P2 | ✅ 已解决 | 复杂度对比不直观 | v9.0 Phase 3 通过 8 色调色板 + 表格视图修复 |
| 内容分层缺失 | P1 | ✅ 已解决 | 不同阶段用户学习路径不清 | v9.0 Phase 4 通过 ContentTier 组件修复 |
| E2E 自定义 runner | P2 | ⏳ 待处理 | 缺少重试/并行/报告 | 未使用 Playwright Test 框架 |
| doublyLinkedList 页面缺失 | P2 | ⏳ 待处理 | 学习模式缺口 | 配置存在但无对应页面 |
| 大数据量性能 | P2 | ✅ 已解决 | 100+ 节点帧率下降 | v10 U1 通过 performanceConfig + 跳动画 + transform/opacity 优化解决 |
| 本地打开异常 | P0 | ✅ 已解决 | file:// 下资源路径与路由失效 | v11.0.1 通过 HashRouter + 相对 base 路径修复 |
| 文档缺口 | P3 | ⏳ 部分解决 | onboarding 体验 | README/ARCHITECTURE/CODE_WIKI/TODO 已同步；仍缺 CONTRIBUTING.md、API 文档 |
| lint warnings 清理 | P3 | ⏳ 待处理 | 代码规范 | v13 Phase B 后剩余 65 个 warnings：react-hooks/set-state-in-effect 6 处（InfoPanel/NetworkStatus/OperationGroup/Sidebar/SpeedControl/StepExplainer，已降级为 warn 的既有模式）；react-hooks/exhaustive-deps 59 处（页面 useCallback 缺 `t`/`learningMode` 依赖、Visualizer/useVisualizer/svgRef 依赖等）。修复需重构依赖数组或拆分 effect，风险高于收益，移至后续阶段 |

---

## 已完成里程碑

| 里程碑 | 版本 | 关键交付物 |
|-------|------|-----------|
| M1-M4: 核心功能 + 体验 + 数据结构 + 高级功能 | v2.4-v3.9 | 排序算法、UI/UX、哈希/堆/字典树、算法对比、持久化、i18n |
| M5-M11: 视觉改版 + 功能增强 | v4.0-v4.9 | Timeline、渐变填充、暗色模式、主题系统、撤销预览、分享 |
| M12-M19: TypeScript 迁移 | v5.0-v5.7 | 100% TypeScript、CI/CD、代码质量优化 |
| M20-M23: 图算法 + 学习模式 | v6.0-v6.4 | BFS/DFS/Dijkstra/拓扑排序、学习模式全覆盖、配置模块化 |
| v6.5: 稳定性 | v6.5 | 排序停止修复、abort 机制、E2E 32 项 |
| v8.0: 严格化 + 加固 | v8.0.0 | TypeScript strict、E2E Firefox 支持、CI/CD 完善、2548 单元测试 |
| v8.1: 动画挂起修复 | v8.1.0 | transitionEnd 超时保护、Visualizer 重渲染修复、链式过渡重构、2580 单元测试 |
| v9.0: 全面迭代优化 | v9.0.0 | 动画与交互修复、学习路径系统优化、可视化界面优化、功能内容拓展、2866 单元测试 |
| v10.0: UI 打磨与可视化定位修复 | v10.0.0 | 数组/字典树可视化居中修复、首页配色统一、Card 渐变、主题渐变 token、2978 单元测试 |
| v11.0: 全面视觉统一与交互优化 | v11.0.0 | 全局色彩统一、排序序号、字典树动画重设计、Button/Undo 变体修复、2996→3042 单元测试 |
| v11.0.1: 最终验证与部署 | v11.0.1 | 本地打开兼容、全站配色统一、a11y 对比度修复、文档同步、GitHub 部署 |
| v12.0: 数据结构扩展与全局搜索 | v12.0 | 跳表 / 并查集 / 红黑树 3 个新数据结构、GlobalSearch 全局搜索（Ctrl/Cmd+K）、391 个新测试、3480 单元测试 |

> 详细变更历史见 CHANGELOG.md，工作日志见 WORKLOG.md。

---

> **说明:** 本文档为动态维护文件，随项目迭代持续更新。优先级可能根据实际需求调整。
