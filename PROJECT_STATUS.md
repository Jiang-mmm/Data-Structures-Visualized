# PROJECT_STATUS — 项目当前状态快照

> **文件用途**: AI 开发前必读。本文件汇总项目最新进展，避免 AI 基于过时的代码或文档状态做决策。
> **更新频率**: 每次迭代结束 / 每个子阶段验收后 / 启动新的开发任务前。
> **最后更新**: 2026-06-22 (v18 i18n 计划阶段产物封存清理 / v17.0.0 GA 已 merge main)

---

## 0. 项目级强制规则（所有 AI 必须遵守）

> 完整规则在 `.trae/rules/project_rules.md` 第 16 节，本节为执行速查。

1. **`design-md/` 默认禁读** — 收录各品牌设计资料，仅在用户显式指示下读取对应子目录；Glob / Grep / SearchCodebase 须显式排除。
2. **设计规范唯一真源是 `DESIGN.md`** — 视觉/交互决策必须以项目根 `DESIGN.md`（若存在）为依据；冲突实现视为越权；`DESIGN.md` 不存在时不擅自拍板。
3. **任务收尾强制文档同步** — 每次完成任何任务，必须同步 `PROJECT_STATUS.md` / `TODO.md` / `WORKLOG.md` / `README.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `docs/superpowers/{specs,plans}/*` / `CLAUDE.md` / `AGENTS.md` 等相关文档，**汇报完成前**完成更新。

**2026-06-22 规则同步** — `.trae/rules/project_rules.md` 新增第 16 节「设计参考与文档同步」、第 17 节「规则版本与变更记录」；`CLAUDE.md` / `AGENTS.md`（Trellis 区块外）已同步引用。

**2026-06-22 v16 设计统一化计划已落地 M1-M6** — Phase A（DESIGN.md + v16 tokens）✅ / Phase B（6 组件）✅ / Phase C（命令面板）✅ / Phase D（17 页面一致性）✅ / Phase E（17 visualizer 深色模式）✅ / Phase F（lint+test+build+docs 同步）✅；详见 [v16 设计统一化计划](./docs/superpowers/plans/2026-06-22-design-unification-v16.md)。

> ⚠️ **2026-06-22 校准**：v16.0.0 GA（工程深化 + 功能增强）已由另一 AI 提交（commit `879f04e`），故"v16 设计统一化"实际为长线路线图第四阶段，与 v16.0.0 GA 并存；新基线 = v16.0.0 GA（2699 测试 / 0 lint warnings / 80.05% 覆盖率）。

> ⚠️ **2026-06-22 安全发现**：`design-md/` 资料夹**当前未被 `.gitignore` 收录**（`git status` 显示为 untracked），与 rule 16.1 隐含假设冲突。建议在启动 Phase A 前由用户决定：① 显式添加 `design-md/` 至 `.gitignore`（推荐）；或 ② 显式接受其纳入版本控制。

---

## 1. 项目概览

| 项 | 当前值 |
|---|---|
| **项目名称** | ds-visualizer（数据结构学习助手） |
| **当前版本** | v17.0.0 GA（UI/UX 迭代 R1-R7：Home 折叠 / LogPanel 深色 / SortCompare 对齐 / GraphAlgorithm 重构 / Quiz 扩充 / 树直线 / Sort 日志密度） |
| **技术栈** | React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + React Router v7 + Vitest + Playwright + vite-plugin-pwa |
| **当前分支** | `main`（v17.0.0 GA 已 merge `b991566`；v18 i18n 计划阶段产物已封存清理） |
| **基线状态** | 2699 单元测试全绿 / ESLint 0 errors / 生产构建通过 / bundle < budget / 测试覆盖率 80.05% / 17 种数据结构 / 40 个学习配置 / E2E 7+2 spec 迁移至 Playwright Test / GitHub Pages 部署已触发（v17 push origin main） |

> **2026-06-22 v18 计划封存备注**: v18 i18n 全量替换计划（11 阶段 / ~30 天）已由用户决定封存；M0 决策 D1=B（UI + learning config）/ D2=C（按语言拆 `locales/{zh,en}/`）/ D3=B（AI + 人工校对）/ D4=简化（逐步提交 + 立即生效）/ D5=C（namespace + flat keys）保留为项目记忆。后续如需重启，可基于本决策摘要 + v18 分支 commit `774025a` 的历史快照 `docs/superpowers/plans/2026-06-22-v18-i18n-full-replacement.md`（646 行）启动。 |

---

## 2. 最近完成的工作

### 2026-06-22 (晚) | v16 设计统一化合并到 main（v16 design unification GA merge）

- `feature/v16-design-unification` → main 通过 `--no-ff` 合并，merge commit `b8d0b03`
- 合并规模：main HEAD 从 v12.0（`afac96f`）一次性追平至 v16.0.0 GA；354 文件差异 0 冲突（全部新增/独立文件改动，git 3-way merge 自动解决）
- 合并后稳定性验证：lint 0 / 2699 测试 / build OK / bundle OK / browser OK
- `feature/v16-design-unification` 分支保留，便于回滚与追溯
- v16 内部 3 个原子 commit 完整保留（`--no-ff` 策略）：
  - `d14778a` Phase A 设计真源 + v16 token
  - `4a30625` Phase C 命令面板 v16 化
  - `be32bcd` Phase F 文档同步

### 2026-06-22 (晚) | v17 UI/UX 迭代完成（v17.0.0 GA）

基于浏览器截图（1440p）发现 7 项 UI/UX 问题，制定并实施 v17 计划，全部完成并通过验收。

| # | 问题 | 解决方案 | 验收标志 |
|---|------|----------|----------|
| **R1** | 首页冗余 4 区块堆叠，导致首屏需 1.8 屏 | Home.tsx 新增学习中心折叠面板（默认收起） | 1440p 首屏可见 Hero + Stats Bar + 折叠按钮 + Cards Grid 顶部 |
| **R2** | LogPanel 深色模式配色不协调 | typeConfig 新增 dark: 变体（4 类型用 bright accent + 深背景） | 深色模式 4 色可清晰区分（oper/info/error/code） |
| **R3** | SortCompare PerformanceChart 与 InfoPanel 对齐混乱 | PerformanceChart 移入主内容列 wrapper；onCompare/onSwap 新增 code 日志 | 主内容列与 InfoPanel 左右对齐；日志显示「选择排序 · 比较 #7 (7%)」格式 |
| **R4** | GraphAlgorithm 复杂度对比在主内容列底部 | ComplexityChart 移至右侧 InfoPanel 同级区（顶部），InfoPanel 在下方 | 复杂度对比与 InfoPanel 上下分布，主内容列专注图可视化 |
| **R5** | 测验题库仅 3 题且顺序固定 | 5 核心 config 扩充至 5-8 题；QuizPanel 挂载时 Fisher-Yates 洗牌 | 核心 config ≥ 5 题；连续打开 3 次题目顺序不同 |
| **R6** | 树连接线为曲线（curved path） | 7 个 tree visualizer 改为 SVG `<line>` 直线（heap/trie 风格） | B 树 / AVL / 红黑树 / 线段树均显示直线连接 |
| **R7** | SortCompare 日志仅 2 条 | onCompare/onSwap callback 内每步写 `addLog('code', ...)`；>50 数据按 5 步降频 | 15 元素 sort 日志 ≥ 10 条（含每步比较/交换详情） |

**实施文件**（23 个）：
- 代码：Home.tsx / LogPanel.tsx / InfoPanel.tsx / QuizPanel.tsx / SortComparePage.tsx / GraphAlgorithmPage.tsx / 5 个 learning config / 4 个 tree visualizer / locales.ts
- 测试：QuizPanel.test.tsx / Home.test.tsx / 4 个 visualizer test / 2 个 snapshot
- 文档：PROJECT_STATUS.md / TODO.md / WORKLOG.md / CLAUDE.md / AGENTS.md / v17 计划文档

**验证**：
- `npm run lint` → 0 errors
- `npm run test:run` → **2699/2699 通过**（147 文件）
- `npm run build` → 成功；Bundle size check passed
- 浏览器截图（1440p）：R1/R2/R3/R4/R5/R6/R7 全部通过

详见 [v17 UI/UX 迭代计划](./docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md)。

---

### 2026-06-22 | v16.0.0 GA — 工程深化与功能增强

#### 目标
v15 GA 基础上完成工程深化（ENG-1/2/3）与功能增强（ENH-1/2），为生产级发布做准备。

#### 范围

| 子任务 | 描述 | 关键产出 |
|--------|------|----------|
| **ENG-1** | E2E 框架迁移至 Playwright Test | 7 个 `test-*.js` → `*.spec.ts`；新增 `scripts/run-e2e.mjs`；`package.json` 新增 4 个 e2e scripts |
| **ENG-2** | 测试覆盖率 >80% | 新增 6 个测试文件 + 扩充 4 个；statements 77.92% → 80.05%；tests 2596 → 2658（+62） |
| **ENG-3** | lint warnings 归零 | 67 → 0（react-hooks/exhaustive-deps 补全 + set-state-in-effect 改为 React 19 派生 state + 6 个 pre-existing 测试失败修复） |
| **ENH-1** | 动画导出（WebM/GIF/帧序列 ZIP） | `src/utils/animationExport.ts`（297 行）+ `AnimationExportButton`（167 行）；SortPage 试点集成；新增 `gifenc` + `jszip` 依赖 |
| **ENH-2** | i18n 完善（算法术语对照表） | `complexity` 13 键 + `algorithms` 16×7 键 = 125 键；`useAlgorithmGlossary` Hook + `AlgorithmGlossaryCard` 组件；Home 集成 |

#### 文件清单
详见各子任务 commit：
- `feat(v16): ENG-1 E2E 框架迁移至 Playwright Test`（commit `23913a7`）
- `feat(v16): ENH-2 i18n 完善（算法术语对照表）`（commit `99b5b0e`）
- `feat(v16): ENH-1 动画导出（WebM / GIF / 帧序列 ZIP）`（commit `8a81ff8`）
- `test(v16): 提升测试覆盖率至 80.05%`（commit `7da029b`）
- `fix(v16): 修复 6 个 pre-existing 测试失败`（commit `0fb5a2f`）
- `chore(lint): 清理 react-hooks warnings (67→0)`（commit `6d32435`）

#### 验证
| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npm run test:run` | **2699/2699 通过**（147 文件） |
| `npm run test:coverage` | statements **80.05%** / lines 84.02% / branches 67.23% / functions 81.03% |
| `npm run build` | 成功；bundle：index 77.93KB / vendor-react 231.35KB / vendor-d3 52.54KB（均 < budget） |
| TypeScript strict | 0 错误 |
| E2E | core/edge/v5-features 三个 spec 全绿（chromium + firefox） |

#### 范围外（Out of Scope）
- `design-md/` 设计资料库已建立但**未被读取**（遵循 §16.1 默认禁读规则，待用户显式授权后启动 v16 设计统一化）
- v17+ 路线图尚未规划
- PWA 安装提示、Service Worker 高级策略等暂不涉及

---

### 2026-06-22 | i18n 完善（v15.x ENH-2 算法术语表）

#### 目标
补齐 ds-visualizer i18n 缺失的算法术语表与复杂度描述命名空间，新增 `useAlgorithmGlossary` Hook 与 `AlgorithmGlossaryCard` 组件用于术语速查。

#### 范围
- **新增 i18n 命名空间**: `complexity`（13 键：title/name/useCase/time/space/best/average/worst/glossaryTitle/glossarySubtitle/emptyHint/showMore/showLess）、`algorithms`（16 数据结构 × 7 字段 = 112 键，type 定义 `AlgorithmGlossaryEntry`）
- **新增 Hook**: `src/hooks/useAlgorithmGlossary.ts` — 返回 16 项术语条目（id / 双语 name / description / useCase / best / average / worst / space）
- **新增组件**: `src/components/AlgorithmGlossaryCard.tsx` — Neo-Brutalist 风格表格，默认折叠避免首次加载 DOM 过大；展开后渲染 17 行（表头 + 16 数据行）
- **Home 集成**: 在 `LearningPath` 之后插入 `<AlgorithmGlossaryCard />`

#### 文件清单
- 新增：`src/i18n/locales.ts`（仅修改，未新增文件）— `complexity` + `algorithms` 命名空间同步到 interface / zh / en
- 新增：`src/hooks/useAlgorithmGlossary.ts`
- 新增：`src/components/AlgorithmGlossaryCard.tsx`
- 新增：`src/__tests__/i18n/i18n-integrity.test.ts`（8 测试）
- 新增：`src/__tests__/hooks/useAlgorithmGlossary.test.ts`（5 测试）
- 新增：`src/__tests__/components/AlgorithmGlossaryCard.test.tsx`（6 测试）
- 修改：`src/pages/Home.tsx`（导入 + 集成 1 行）
- 修改：`src/__tests__/pages/Home.test.tsx`（新增 1 测试）

#### 验证
- `npx vitest run` → **2699/2699 通过**（其中新增 20 项）
- `npm run lint` → 0 errors / 0 warnings
- `npm run build` → 成功；bundle 检查通过：index 77.93KB（<110KB）、vendor-react 231.35KB（<250KB）、vendor-d3 52.54KB（<60KB）

#### 范围外（Out of Scope）
- 不替换全项目 100+ 文件中已有的硬编码中文（这些大多是 `hooks.*` 内部日志、`learningConfig.step.*` 教学文案，**不属于用户可见 UI 字符串**，按规则保持原样）
- 不重命名已有 i18n 键（保持向后兼容）
- 不在 main 分支上提交（由 main agent 统一提交）

#### 实施真源
[docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md](docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md)

### 2026-06-22 | 动画导出功能（v15.x 实验性）

#### 目标
在现有 `dataExport.ts`（JSON 导入导出 + 性能 CSV/JSON）基础上，新增算法运行过程的动画回放导出能力。

#### 新增模块

| 模块 | 文件 | 内容 |
|------|------|------|
| 工具 | `src/utils/animationExport.ts` | 三种导出格式：WebM（MediaRecorder 首选）/ GIF（gifenc）/ 帧序列 ZIP（jszip）；导出 `serializeSvg` / `loadSvgImage` / `isAnimationExportSupported` 等可独立测试单元；上限 600 帧保护 |
| 组件 | `src/components/AnimationExportButton.tsx` | 下拉式菜单（WebM / GIF / 帧序列），含 click-outside + Escape 关闭 + isLoading 状态 + 错误 toast；与 SortPage 已集成 |
| 类型 | `src/types/gifenc.d.ts` | gifenc 1.0.3 类型声明（项目内自制，无运行时影响） |
| i18n | `src/i18n/locales.ts` | `exportAnimation` 命名空间（10 键，中英双文） |
| 集成 | `src/pages/SortPage.tsx` | PageHeader 中嵌入按钮，`isAnimating || data.length === 0` 时禁用 |

#### 新增依赖
- `gifenc@1.0.3` — 纯函数式 GIF 编码器，无依赖
- `jszip@3.10.1` — ZIP 打包
- 合计 < 35KB gzipped（实测 +1.9KB SortPage chunk）

#### 测试
- `src/__tests__/utils/animationExport.test.ts` — 12 个测试（serializeSvg、isAnimationExportSupported、loadSvgImage、三种导出格式、null ref、不可用环境）
- `src/__tests__/components/AnimationExportButton.test.tsx` — 9 个测试（渲染、禁用、菜单、点击、错误、点击外部关闭）

#### 验证
- `npm run test:run`：144 文件 / 2679 测试全绿（含新 21 个）
- `npm run lint`：0/0
- `npm run build`：通过，bundle check 通过（index 78KB < 110KB、vendor-react 231KB < 250KB、vendor-d3 53KB < 60KB）
- 仅 SortPage 接入新按钮；其余 16 个页面后续可独立集成

### 2026-06-22 | v15.0.0 GA — 体验打磨完成

#### E1 — PWA 离线增强

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/ReloadPrompt.tsx` | PWA 新版本提示（useRegisterSW + Neo-Brutalist + a11y） |
| 配置 | `vite.config.js` | Google Fonts runtime caching（CacheFirst, 60 天） |
| 集成 | `src/components/Layout.tsx` | 渲染 ReloadPrompt |
| 类型 | `src/types/pwa.d.ts` | virtual:pwa-register/react 类型声明 |
| i18n | `src/i18n/locales.ts` | pwa 命名空间（3 键） |
| 测试 | `ReloadPrompt.test.tsx` | 4 个测试 |

#### E2 — 大数据可视化

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/PerformanceIndicator.tsx` | 性能模式徽章 |
| 工具 | `src/utils/performanceConfig.ts` | 新增 isLargeData 辅助函数 |
| 可视化器 | `arrayVisualizer.ts` / `sortVisualizer.ts` | 大数据简化渲染（跳过渐变/阴影/标签） |
| 页面 | `ArrayPage.tsx` / `SortPage.tsx` | 集成浮动徽章 |
| i18n | `src/i18n/locales.ts` | performance 命名空间（2 键） |
| 测试 | 4 个测试文件 | 15 个新测试 |

#### E3 — 移动端手势

| 模块 | 文件 | 内容 |
|------|------|------|
| Hook | `src/hooks/useGestures.ts` | 5 种手势（pinch/swipeH/swipeV/longPress/tap） |
| 集成 | `src/components/Visualizer.tsx` | onSwipeLeft/onSwipeRight 可选 props |
| 测试 | `useGestures.test.ts` | 9 个测试 |

#### E4 — KeyboardHelp 模糊搜索

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/KeyboardHelp.tsx` | fuzzyMatchAny 跨页面搜索 + 三态渲染 |
| i18n | `src/i18n/locales.ts` | shortcuts 命名空间新增 3 键 |
| 测试 | `KeyboardHelp.test.tsx` | 5 个新测试（共 20 tests） |

#### U2 — 响应式操作面板

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/OperationBar.tsx` | 移动端横向滚动 + collapsibleOnMobile 折叠模式 |
| i18n | `src/i18n/locales.ts` | page 命名空间新增 expand/collapse |
| 测试 | `OperationBar.test.tsx` | 5 个新测试（共 43 tests） |

#### U3 — 跨页面布局一致性

| 模块 | 文件 | 内容 |
|------|------|------|
| 修复 | `src/pages/GraphAlgorithmPage.tsx` | 3 处布局偏差（h-full→min-h-dvh、添加 min-h-0、添加 relative） |
| 测试 | `layoutConsistency.test.tsx` | 8 个布局测试 |

#### U4 — SVG 图标系统

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/Icon.tsx` | 8 个 stroke-based SVG 图标（Feather/Lucide 风格） |
| 替换 | 6 个文件 | KeyboardHelp/GlobalSearch/Sidebar/Home/SortComparePage/QuizPanel emoji→Icon |
| 测试 | `Icon.test.tsx` | 5 个测试 |

#### U5 — 条件禁用按钮原因

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/OperationBar.tsx` | disabledReason prop + useId + aria-describedby + sr-only |
| CSS | `src/index.css` | sr-only 工具类 |
| 页面 | ArrayPage/StackPage/SortPage | 示例接入 disabledReason |
| i18n | `src/i18n/locales.ts` | page.animating / page.disabled |
| 测试 | `OperationBar.test.tsx` | 4 个新测试（共 47 tests） |

#### ISSUE-007 — 排序撤销阻塞

| 模块 | 文件 | 内容 |
|------|------|------|
| Hook | `src/hooks/useHistory.ts` | undoBlock 机制（ref-based，不触发重渲染） |
| 透传 | `src/hooks/useDataStructureState.ts` | 透传 setUndoBlock |
| 使用 | `src/hooks/useSortState.ts` | 排序过程中 setUndoBlock(true)，finally 解除 |
| 测试 | `useHistory.test.ts` / `useSortState.test.ts` | 6 个新测试 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2590 passed（137 文件），较 v14 GA 新增 64 个测试 |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| Git commits | E1 `ba39cd7` / E2 `d7952b7` / E3 `be4e59d` / E4 `66d282c` / U2 `594cd9f` / U3 `11b298b` / U4 `6518050` / U5 `1146d47` / ISSUE-007 `5355ea2` |

---

### 2026-06-22 | v14.0.0 GA — 内容扩张完成

#### D1 — 图算法测试补齐

| 模块 | 文件 | 内容 |
|------|------|------|
| 测试 | `src/__tests__/algorithms/graph/graphAlgorithms.test.ts` | 46 个测试覆盖 Bellman-Ford（10）、Floyd-Warshall（10）、Prim（10）、Kruskal（11）、注册（5） |

#### G1 — B-Tree 数据结构

| 模块 | 文件 | 内容 |
|------|------|------|
| 算法 | `src/algorithms/bTree.ts` | 多路搜索树，insert + split、search、inorder、validate |
| Hook | `src/hooks/useBTreeState.ts` | 状态管理 + localStorage + undo/redo |
| 可视化器 | `src/visualizers/bTreeVisualizer.ts` | D3 多路树可视化 |
| 页面 | `src/pages/BTreePage.tsx` | 插入/搜索/中序/重置 |
| 学习配置 | `src/configs/learning/bTree.config.ts` | 7 步学习配置 |
| 类型 | `src/types/hooks.d.ts` | BTreeNode / BTreeFlattenedNode / BTreeFlattened / BTreeState |
| i18n | `src/i18n/locales.ts` | btree 命名空间（24 键，中英文） |
| 路由/侧边栏/首页 | `App.tsx` / `Sidebar.tsx` / `Home.tsx` | `/b-tree` 路由 + 入口 |
| 测试 | 4 个测试文件 | 97 个测试（algorithm 41 + hook 30 + visualizer 16 + page 10） |

#### G2 — Segment Tree 数据结构

| 模块 | 文件 | 内容 |
|------|------|------|
| 算法 | `src/algorithms/segmentTree.ts` | build / query（区间求和）/ update（点更新） |
| Hook | `src/hooks/useSegmentTreeState.ts` | 状态管理 + localStorage + undo/redo |
| 可视化器 | `src/visualizers/segmentTreeVisualizer.ts` | D3 树形可视化 |
| 页面 | `src/pages/SegmentTreePage.tsx` | build/query/update/reset |
| 学习配置 | `src/configs/learning/segmentTree.config.ts` | 7 步学习配置 |
| 类型 | `src/types/hooks.d.ts` | SegmentTreeNode / SegmentTreeFlattened 等 |
| i18n | `src/i18n/locales.ts` | segmentTree 命名空间（24 键） |
| 路由/侧边栏/首页 | `App.tsx` / `Sidebar.tsx` / `Home.tsx` | `/segment-tree` 路由 + 入口 |
| 测试 | 4 个测试文件 | 104 个测试（algorithm 45 + hook 29 + visualizer 20 + page 10） |

#### G3 — 双向链表模式测试

| 模块 | 文件 | 内容 |
|------|------|------|
| 测试 | `src/__tests__/pages/LinkedListPage.test.tsx` | 4 个测试覆盖切换按钮可见性、切换到双向、切回单向、动画期间禁用 |

#### F2 — 算法接入指南

| 模块 | 文件 | 内容 |
|------|------|------|
| 文档 | `docs/ALGORITHM_INTEGRATION_GUIDE.md` | 7 章节覆盖排序/图算法/数据结构接入、学习配置、可视化器、测试、i18n + checklist |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2526 passed（132 文件），较 v13 GA 新增 246 个测试 |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| 数据结构总数 | 17（原 15 + B-Tree + Segment Tree） |
| 学习配置总数 | 40（原 38 + bTree + segmentTree） |
| Git commits | D1 `d63a07c` / G1 `3d0acca` / G2 `cc6905f` / G3 `0a64d91` / F2 `10c1ad5` |

---

### 2026-06-22 | v13.0.0 GA — Path 3 H3 + H1 完成

#### H3 — SortComparePage 学习模式

| 模块 | 文件 | 内容 |
|------|------|------|
| 学习配置 | `src/configs/learning/sortCompare.config.ts` | 5 步学习配置（选择算法、初始化、第一轮比较、关键差异、完成对比） |
| 配置注册 | `src/configs/learning/index.ts` | 注册 `sortCompare`（37 → 38 个学习配置） |
| 页面集成 | `src/pages/SortComparePage.tsx` | 接入 `useLearningMode('sortCompare')` |
| 测试 | `src/__tests__/pages/SortComparePage.test.tsx` | 新增 4 个学习配置测试 |

#### H1 — 测验系统

| 模块 | 文件 | 内容 |
|------|------|------|
| 类型扩展 | `src/types/learning.d.ts` | `QuizQuestion` 接口 + `LearningModeConfig.quiz` 字段 |
| Hook | `src/hooks/useQuizProgress.ts` | 测验进度管理（localStorage 持久化、提交/导航/重置/得分） |
| 组件 | `src/components/QuizPanel.tsx` | 测验 UI（题目、选项、即时反馈、解释、进度条、完成徽标） |
| InfoPanel 集成 | `src/components/InfoPanel.tsx` | 桌面端与移动端学习标签页底部嵌入 QuizPanel |
| 测验题目 | `array.config.ts` / `bubble.config.ts` / `tree.config.ts` | 各添加 3 道单选题 |
| 页面接入 | `ArrayPage.tsx` / `SortPage.tsx` / `TreePage.tsx` | 传递 `algorithmKey` + `quizQuestions` 到 InfoPanel |
| i18n | `src/i18n/locales.ts` | 新增 `quiz` 命名空间（16 键，中英文） |
| 测试 | `useQuizProgress.test.ts`（10）+ `QuizPanel.test.tsx`（9） | 覆盖答题/得分/重置/导航/空题目 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2280 passed（123 文件），较 rc3 新增 23 个测试 |
| ESLint | 0 errors / 65 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| Git commits | H3 `2f56b83` / H1 `c07b89a` |

---

### 2026-06-21 | Path 3 H2 全局搜索增强完成

#### 实现内容

| 模块 | 文件 | 内容 |
|------|------|------|
| Fuzzy 匹配 | `src/utils/fuzzySearch.ts` | 新增 LCS -based 轻量模糊匹配，含连续匹配/首字符/大小写敏感加权 |
| 搜索历史 | `src/hooks/useSearchHistory.ts` | localStorage 持久化，上限 10 条，去重，支持增删清空 |
| 搜索索引 | `src/data/searchIndex.ts` | 扩展 `SearchItem` 类型，从学习步骤描述中提取时间/空间复杂度 |
| 组件 UI | `src/components/GlobalSearch.tsx` | 集成 fuzzy 匹配、历史展示、复杂度过滤、page/learning/history 分类展示 |
| i18n | `src/i18n/locales.ts` | 新增 `globalSearch` 命名空间相关键 |
| 测试 | `src/__tests__/utils/fuzzySearch.test.ts`、`hooks/useSearchHistory.test.ts`、`data/searchIndex.test.ts`、`components/GlobalSearch.test.tsx` | 新增 27 个单元测试 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2261 passed（121 文件），较 rc2 基线新增 27 个测试 |
| ESLint | 0 errors / 65 warnings（既有模式） |
| TypeScript strict | 0 错误 |
| 生产构建 | 成功，bundle 预算通过 |

---

### 2026-06-21 | v13 Phase C 文档完善 + Phase D 测试/CI 升级完成

#### Phase C 文档一致性
- 对齐 `README.md` / `PROJECT_SUMMARY.md` / `CHANGELOG.md` / `TODO.md` / `WORKLOG.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `PROJECT_STATUS.md` 版本号与状态
- `package.json` version 从 `v13.0.0-rc1-phase-b` 升级为 `v13.0.0-rc2`
- 修正各文档中 Phase A/B/C/D 状态、测试数量、E2E 覆盖、CI artifact 等数据

#### Phase D 测试 + CI 升级
- E2E 框架：新增 `e2e/a11y.spec.ts`（动态覆盖 17 页 axe-core 扫描）、`e2e/home.spec.ts`（Playwright Test 迁移示例）
- `e2e/test-a11y.js` 改为委托 `npx playwright test a11y.spec.ts`，CI 中只跑 chromium 项目
- `e2e/run-all-tests.js` 输出统一 JSON 协议 `e2e/test-results.json`
- 单测基础设施：`src/__tests__/setup.js` 升级为 `setup.ts`；`d3MockHelper.ts` 支持调用记录；新增 `arrayVisualizer.snapshot.test.ts`
- CI 增强：`.github/workflows/ci.yml` 增加 Playwright a11y 测试、覆盖率 artifact、构建产物 artifact、E2E 报告 artifact

#### 验证
| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2234 passed（118 文件） |
| ESLint | 0 errors / 65 warnings（既有模式） |
| TypeScript strict | 0 错误 |
| 生产构建 | 成功，bundle 预算通过（index 64.61KB / vendor-react 231.35KB / vendor-d3 52.54KB） |
| Playwright spec | 20 passed（a11y 17 页 + home 3 用例） |
| a11y 扫描 | 17 页 0 critical/serious violations |

---

### 2026-06-21 | v13 Phase B 体验与工程优化完成
- 动画引擎：FPS 降级（>100ms 帧阻塞立即触发）、动画 abort、wait 清理、applyPreset 中断当前动画；`useVisualizer` RAF ID 提 ref，cleanup 清理 graph simulation
- Visualizer 渲染一致性：`treeVisualizer` positionStore 绑定 SVG、`graphVisualizer` NODE_RADIUS 收敛常量、defs 去重、并查集 findRootId 缓存、栈宽度自适应
- a11y 与键盘导航：InfoPanel 日志高亮替代自动跳转、ARIA tablist/tab/aria-controls、树/图 ↑↓ 父/子导航、节点焦点环、边 aria-label、快捷键 aria-keyshortcuts
- 移动端与教学反馈：Sidebar 左缘右滑打开 + 触控按钮 ≥44px、InfoPanel 移动端 flex-1 抽屉、输入框跳过 Ctrl+Z/Y、错误 toast 显示模块/操作、undo/redo 先 abort
- 新增/更新测试：`toastStore.test.ts`、`useKeyboard.test.ts`、`stackVisualizer.test.ts`、`InfoPanel.test.tsx`、`animationEngine.test.ts`、`useVisualizer.test.ts` 等
- 验证：3506 tests passed（204 文件） / lint 0 errors（65 warnings） / typecheck / build 全通过
- Git：46 个文件改动未提交（待 Phase C/D 完成后统一 commit）

### 2026-06-21 | v13 Phase A 紧急修复完成（安全 + 数据完整性）
- 完成 `src/utils/schema.ts` 统一 schema 校验（递归深度限制 `MAX_STORAGE_DEPTH = 10`），集成到 `useDataStructureState.loadFromStorage`
- `package.json` devDependencies 版本限定从 `^` 改为 `~`，CI 新增 `npm ls --depth=0` 校验
- `scripts/check-bundle.js` 用 `fileURLToPath` 替代 `import.meta.dirname`，兼容 Node 20+
- `vite.config.js` 移除 `loli.net` 第三方字体代理缓存配置，消除安全风险
- `src/hooks/useDataStructureState.ts` 渲染阶段 ref 赋值移入 `useEffect`
- 新增 `src/__tests__/utils/schema.test.ts` 14 个 schema 专属测试
- 验证：3494 tests passed（新增 14 个）/ lint 0 errors / typecheck / build 全通过
- Git commit: `0a544a9`

### 2026-06-21 | 文档整理与归档体系建立
- 将 `iteration-plan-v8/v9/v10`、`optimization-proposal`、`test-issue-report` 等 12 份过期文档合并为 6 份归档文件
- 新建 `docs/archive/` 目录与 `docs/README.md` 导航
- 修复 `TODO.md`、`PROJECT_SUMMARY.md`、`WORKLOG.md` 中对已归档文档的错误引用
- 关键文档（`CLAUDE.md`、根目录核心文档）保持独立未合并
- Git commit: `857f833 docs(archive): 整理过期文档并建立 archive 归档体系`

### 2026-06-20 | v13 全面代码体检完成
- 双模型互盲审计，合并去重后 56 条独立问题（P1 29 / P2 24 / P3 3）
- 产物：`docs/superpowers/specs/2026-06-20-v13-code-audit-design.md`、`docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md`、`docs/audit-2026-06-20/audit-merged.md`
- Git commit: `f698291 docs: v13 全面代码体检报告与实施计划`

### 2026-06-20 | v12.0.0 完成
- 新增数据结构：跳表 SkipList、并查集 Union-Find、红黑树 Red-Black Tree
- 新增全局搜索 GlobalSearch（Ctrl/Cmd+K）
- 新增图算法：Bellman-Ford、Floyd-Warshall、Prim、Kruskal
- 新增排序算法：TimSort、ShellSort、CombSort、Counting
- 单元测试从 3089 增至 3480
- Git commit: `61bdc5f feat(v12): 跳表、并查集、红黑树与全局搜索`

---

## 3. 当前活跃任务 / 下一步方向

### v16 设计统一化（⏳ 待启动 — 长线路线图第四阶段）

| 维度 | 内容 |
|------|------|
| **计划文档** | [docs/superpowers/plans/2026-06-22-design-unification-v16.md](docs/superpowers/plans/2026-06-22-design-unification-v16.md) |
| **设计推荐** | [docs/数据结构学习助手-设计推荐.md](docs/数据结构学习助手-设计推荐.md) |
| **基线** | v16.0.0 GA（commit `879f04e`） |
| **路线对齐** | 长线路线图 v13→v16 第四阶段"设计与品牌统一" |
| **主参考** | Linear + Vercel + Raycast（命令面板） |
| **核心产出** | 项目根 `DESIGN.md`（设计真源） |
| **状态** | ⏳ Phase A 待启动 |
| **前置条件** | ① 用户授权读取 `design-md/`（rule 16.1）；② 用户确认主参考品牌；③ 用户决定 `design-md/` 是否纳入 `.gitignore` |

---

### v16.0.0 GA — 工程深化与功能增强（✅ 已完成 2026-06-22，commit `879f04e`）

| 子任务 | 主题 | 状态 | 关键产出 |
|--------|------|------|----------|
| **ENG-1** | Playwright 迁移 | ✅ | 7 个 `test-*.js` → `*.spec.ts`；`scripts/run-e2e.mjs`（commit `23913a7`） |
| **ENG-2** | 覆盖率 >80% | ✅ | statements 77.92% → **80.05%**（+62 tests，commit `7da029b`） |
| **ENG-3** | lint 归零 | ✅ | 67 → 0（react-hooks 补全 + 6 个 pre-existing 修复，commit `6d32435` / `0fb5a2f`） |
| **ENH-1** | 动画导出 | ✅ | WebM/GIF/帧序列 ZIP；SortPage 集成（commit `8a81ff8`） |
| **ENH-2** | i18n 完善 | ✅ | 125 键术语表；`AlgorithmGlossaryCard`（commit `99b5b0e`） |

**基线指标**：2699 单元测试 / 0 ESLint / 80.05% 覆盖 / bundle 全 < budget / E2E 3 spec 全绿（chromium + firefox）

---

### v13 / v14 / v15 路线（✅ 全部完成，已结案归档）

| 阶段 | 主题 | 状态 |
|------|------|------|
| **v13 Phase A-D** | 紧急修复 + 体验 + 文档 + 测试 CI 升级 | ✅ 已完成（commit `0a544a9` + 后续 7 commits） |
| **v14** | 内容扩张（D1/G1/G2/G3/F2） | ✅ 已完成 |
| **v15 E1-E4 / U2-U5 / ISSUE-007** | 体验打磨 | ✅ 已完成（9 commits） |

### v13 Top10 优先问题（结案 — 详见 `docs/audit-2026-06-20/audit-merged.md`）

1. devDependencies 版本越界（`package.json`）— ✅ ENG-3 修
2. `isValidStoredData` 不递归深度 + `loadFromStorage` 用 `JSON.parse as T` — ✅ Phase A 修
3. useVisualizer rafId 闭包错乱 + animationEngine 模块单例 + wait() 闭包链 — ✅ Phase B 修
4. `treeVisualizer` `positionStore` 全局单例 — ✅ Phase B 修
5. `useDataStructureState` 渲染阶段写 ref — ✅ Phase A 修
6. `react-hooks/set-state-in-effect` 永久降级 warn — ✅ ENG-3 修（67→0）
7. `vite.config.js` 配 `loli.net` 注释写 google fonts — ✅ Phase A 修
8. InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸 — ✅ Phase B 修
9. 树/图键盘 ↑↓ 行为错误 + AVL/UnionFind 节点不可 tab — ✅ Phase B 修
10. undo/redo/applyPreset 不打断正在跑的动画 — ✅ Phase B 修

---

## 4. 已知约束与注意事项

- **禁止修改的文件**: `CLAUDE.md`、根目录核心文档（README/CHANGELOG/ARCHITECTURE/PROJECT_SUMMARY/CODE_WIKI/TODO/WORKLOG/CONTRIBUTING）作为独立文件保留，不合并。
- **必须遵循的工作流**: `UNDERSTAND → PLAN → EXECUTE → VERIFY`
- **当前代码基线**: v16.0.0 GA（commit `879f04e`，分支 `feature/v13-path3-learning-enhancements`）；任何 v16 设计统一化工作**必须**新建独立 feature 分支（如 `feature/v16-design-unification`），不要直接在 main 或当前分支修改。
- **验证红线**: 任何代码改动后必须运行 `npm run lint`、`npm run typecheck`、`npm run test:run`、`npm run build`。
- **`design-md/` 追踪策略**（2026-06-22 发现）：当前未纳入 `.gitignore`，`git status` 显示 untracked。在启动 v16 设计统一化 Phase A 前**必须**先决定：① 添加至 `.gitignore`（推荐，rule 16.1 隐含要求）；或 ② 显式接受其纳入版本控制。

---

## 5. 关键文档入口

| 文档 | 用途 |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | AI 协作规则与技术约束 |
| [TODO.md](./TODO.md) | 当前待办与 v16 设计统一化计划 |
| [WORKLOG.md](./WORKLOG.md) | 每日工作记录 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更历史 |
| [docs/数据结构学习助手-设计推荐.md](./docs/数据结构学习助手-设计推荐.md) | 设计推荐报告（v16 设计统一化输入） |
| [docs/superpowers/plans/2026-06-22-design-unification-v16.md](./docs/superpowers/plans/2026-06-22-design-unification-v16.md) | v16 设计统一化实施真源 |
| [docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) | 长线路线图 |
| [docs/audit-2026-06-20/audit-merged.md](./docs/audit-2026-06-20/audit-merged.md) | v13 代码体检完整报告（已结案） |
| [docs/README.md](./docs/README.md) | docs/ 目录导航 |

---

> **AI 开发前必读提示**: 开始任何开发任务前，先读取本文件 + [TODO.md](./TODO.md) 顶部 3 段 + [WORKLOG.md](./WORKLOG.md) 前 60 行。若本文件与 WORKLOG/TODO 冲突，以本文件和 TODO.md 为准。
