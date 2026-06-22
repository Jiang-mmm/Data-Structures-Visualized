# v17 UI/UX 迭代计划 — 实施真源文档（2026-06-22 浏览器截图精修版）

> **创建日期**: 2026-06-22
> **基线版本**: v16.0.0 GA（commit `b8d0b03`，合并后 main HEAD）
> **执行分支**: `feature/v17-ui-ux-iterations`（从 main HEAD `b8d0b03` 切出）
> **设计真源**: [DESIGN.md](../../../DESIGN.md)（v16 设计统一化定义）
> **执行约束**: 严格遵守 [.trae/rules/project_rules.md](../../../.trae/rules/project_rules.md) §2/7/8/12 节
> **精修日期**: 2026-06-22（基于代码结构 + 浏览器截图定位后细化）

---

## 〇、浏览器截图定位结论

通过浏览器访问 dev server 截图（`http://localhost:3000/Data-Structures-Visualized/`），定位以下问题：

| # | 截图所见 | 根因 |
|---|----------|------|
| **R1** | 首页（1440p）首屏仅看到 Hero + Stats Bar + 前 3 个 Cards；ProgressOverview / LearningRecommendations / LearningPath / AlgorithmGlossaryCard 共 4 个区块在 Cards Grid 上方堆叠，导致首屏需 1.8 屏才能看完 | `Home.tsx` 行 99-102 直接平铺 4 个组件 |
| **R2** | LogPanel 切到深色模式时，标签底色与卡片底色对比度低，info 绿色在深色背景下偏暗 | `LogPanel.tsx` 行 20-25 `typeConfig` 仅用 `text-accent-*` 无 `dark:` 适配 |
| **R3** | SortComparePage 选 3 个算法跑完后，PerformanceChart 出现在主区下方占满整宽，与 InfoPanel 右侧对位关系混乱 | `SortComparePage.tsx` 行 401-413 的 `<div className="mb-3 mt-4">` 游离在主区底部 |
| **R4** | GraphAlgorithmPage 跑完算法后，复杂度对比卡片出现在主内容列底部，挤压可视区，且与右侧 InfoPanel 缺乏视觉关联 | `GraphAlgorithmPage.tsx` 行 256-268 的 `<Card shadow="md">` 嵌在主内容列内 |
| **R5** | ArrayPage / SortPage / TreePage 学习模式测验只有 3 道题，连续打开两次题目顺序固定 | `array.config.ts` 等 3 个 config 仅有 3 题；`QuizPanel` 未实现 shuffle |
| **R6** | Tree / AVL / Heap 树连接线用 SVG `<path>` 画曲线（curved 风格），而非学术常见的直线 | `treeVisualizer.ts` 行 64-66 `curvedPath` 默认行为；`drawEdge` 在 `style === 'curved' \|\| 'orthogonal'` 时走曲线分支 |
| **R7** | SortComparePage 跑完算法后 LogPanel 只有 2 条日志（"comparing..." + "compareDone"），缺少每步比较/交换记录 | `SortComparePage.tsx` 行 200-212 的 `onCompare` / `onSwap` 仅更新 state，未调 `addLog` |

---

## 一、问题定与目标

### 1.1 用户反馈的 7 项优化需求

| # | 用户需求 | 根因定位 | 影响范围 |
|---|----------|----------|----------|
| **R1** | 首页内容冗余，滚动过长 | `Home.tsx` 中 `<ProgressOverview>` + `<LearningRecommendations>` + `<LearningPath>` + `<AlgorithmGlossaryCard>` 4 个区块堆叠在 3-col grid 前，导致首页长度远超 1 屏 | Home |
| **R2** | 操作日志和学习模式颜色方案不协调 | `LogPanel.tsx` 的 `typeConfig` 使用硬编码浅色 accent（`text-accent-blue`/`text-accent-emerald` 等），在深色模式下无 `dark:` 变体，颜色和整体界面脱节 | LogPanel、InfoPanel |
| **R3** | 算法对比界面操作历史区域视觉不协调 | `SortComparePage` 的 `<PerformanceChart>` 在 DOM 上与主 grid 并列（flex-row），但不在同一 flex 容器内，导致与 InfoPanel 的对齐关系混乱 | SortComparePage |
| **R4** | GraphAlgorithm 复杂度对比模块在主内容区下方 | `GraphAlgorithmPage` 中 `<ComplexityChart>` 放在主内容列 `<div className="flex-1 flex flex-col gap-4">` 内，与 InfoPanel 左右并列后，ComplexityChart 被压在底部，与 InfoPanel 左右关系不符直觉 | GraphAlgorithmPage |
| **R5** | 学习模式测验题库容量不足 | 当前每个 learning config 仅含 2~3 道题，无随机出题机制（`QuizPanel` 本身支持 randomize，但 `useQuizProgress` 未调用） | QuizPanel、40 个 learning config |
| **R6** | 树结构节点连接线弯曲，期望二叉树风格直线 | `treeVisualizer.ts` 默认 `edgeStyle = 'straight'`，但 BST 违规时用 `isBSTViolation` 路径仍画线；整体树形视觉上以 `curvePath` 为主 | 7 个 tree visualizer（tree / bTree / avlTree / redBlackTree / heap / segmentTree / trie） |
| **R7** | 操作日志内容深度不足，sort 操作仅显示"sort" | `SortComparePage` 在 `handleRunAll` 中仅写 `addLog('info', ...)` 和结尾统计，缺少每步比较/交换的详细 code 级别日志 | SortComparePage、sort 算法 |

### 1.2 目标

在不破坏现有功能、不扩展范围的前提下，完成上述 7 项 UI/UX 优化，为用户交付更精炼的首页、统一的暗色日志配色、更合理的图算法布局、更丰富的测验和操作日志内容、以及标准二叉树连接线风格。

---

## 二、阶段划分与依赖关系

```
[R1 首页精简]  → [R2 日志配色] → [R3 SortCompare 布局]
                                                    ↓
[R4 GraphAlgo 布局]   ← (并行，无依赖)
                                                    ↓
[R5 测验随机出题] → [R7 Sort 日志深度] ← (并行，无依赖)
                                                    ↓
[R6 树连接线]    ← (独立)
```

---

## 三、详细任务分解

### R1 — 首页内容精简（P1，高优先级）

**问题**：`Home.tsx` 在 Cards Grid 之前堆叠 4 个区块（ProgressOverview / LearningRecommendations / LearningPath / AlgorithmGlossaryCard），导致首页超过 2 屏。

**方案**：将 4 个辅助区块从 `<header>` 与 Cards Grid 之间**折叠为可展开面板**，默认收起，用户点击"学习中心"入口才展开。保留 Hero + Stats Bar + Cards Grid 在首屏可见。

**涉及文件**：
- `src/pages/Home.tsx`
- `src/components/ProgressOverview.tsx`（仅改引用方式）
- `src/components/LearningRecommendations.tsx`
- `src/components/LearningPath.tsx`
- `src/components/AlgorithmGlossaryCard.tsx`

**验收标准**：
- 首页 Hero + Stats Bar + 首行 Cards 在 1440p 屏幕不需滚动即可见
- 4 个辅助区块默认折叠，点击可展开
- 折叠/展开有平滑动画（200ms ease-out）
- 折叠状态下首页长度 ≤ 1.5 屏

**验证方式**：
- `Home.test.tsx` 现有测试全绿
- 人工验证：1440p / 1024p / 375p 三分辨率截图

---

### R2 — 操作日志深色模式配色（P1，高优先级）

**问题**：`LogPanel.tsx` 的 `typeConfig` 使用硬编码浅色 accent，dark mode 下无适配。

**方案**：
- 在 `typeConfig` 中将 `color` / `bg` / `border` 改为 `dark:` 变体（参考 v16 DESIGN.md 色彩 token）
- `info` → 深色面板适合用 `--color-accent-emerald` → `--color-v16-ink` 降级
- `oper` → `--color-accent-blue`（深色下仍清晰）
- `error` → `--color-accent-rose`
- `code` → `--color-accent-amber`
- `text-*` 改 `dark:text-*`；`bg-*` 改 `dark:bg-*`；`border-*` 改 `dark:border-*`

**涉及文件**：
- `src/components/LogPanel.tsx`

**验收标准**：
- 深色模式下 LogPanel 4 种类型颜色对比度 ≥ 4.5:1（WCAG AA）
- 浅色模式外观不变
- `LogPanel.test.tsx` 全绿

**验证方式**：
- `npm run test:run -- LogPanel` 全绿
- 切换深色模式截图验证 4 色可区分

---

### R3 — SortCompare 操作历史区布局（P2）

**问题**：`<PerformanceChart>` 在 DOM 上游离于 grid wrapper 之外，与 InfoPanel 左右对齐关系混乱。

**方案**：
- 将 `<PerformanceChart>` 移入主内容列 wrapper `<div className="flex-1 p-2 overflow-auto bg-paper dark:bg-dark-paper">`
- 统一主内容区 `<div className="flex-1 flex flex-col lg:flex-row min-h-0">` 的子元素：
  - 左列：`grid (sort bars) + PerformanceChart`（上下排列）
  - 右列：`InfoPanel`

**涉及文件**：
- `src/pages/SortComparePage.tsx`

**验收标准**：
- PerformanceChart 在 InfoPanel 右侧（lg 断点以上）
- 6 个 sort bar panel 宽度 ≤ 3 列时不溢出
- 整体布局与 GraphAlgorithmPage / ArrayPage 对齐

**验证方式**：
- `SortComparePage` 截图（lg / md / sm 三断点）
- `SortComparePage.test.tsx` 全绿

---

### R4 — GraphAlgorithm 右侧区域重构（P2）

**问题**：`ComplexityChart` 压在主内容列底部，与 InfoPanel 左右关系不符直觉（用户期望复杂度信息与 InfoPanel 同级）。

**方案**：
- 将 `<ComplexityChart>` 从主内容列 `<div className="flex-1 flex flex-col gap-4">` 移到与 InfoPanel 同级的右侧区域
- InfoPanel 接收 `showComplexity` prop（或内部判断 `graphs` 路径）
- 右侧改为上下布局：上方 ComplexityChart（折叠展开），下方 InfoPanel
- 兼容其他 16 个页面的 InfoPanel（不变）

**涉及文件**：
- `src/pages/GraphAlgorithmPage.tsx`
- `src/components/InfoPanel.tsx`（新增 `rightTopSlot` 或 `topContent` slot）
- `src/components/ComplexityChart.tsx`（调整适配右侧折叠）

**验收标准**：
- 复杂度对比随页面打开可见（默认展开）
- InfoPanel 仍包含 Log + LearningModeToggle + QuizPanel
- 16 个其他页面 InfoPanel 行为不变

**验证方式**：
- `GraphAlgorithmPage` 截图（lg / md）
- 人工操作：算法切换 / 学习模式 / 测验 全流程正常

---

### R5 — 测验题库扩充 + 随机出题（P2）

**问题**：每个 learning config 仅 2~3 题，`QuizPanel` 虽支持 shuffle 但未被使用。

**方案**：
- 为 5 个核心数据结构（array / tree / sort / graph / hash）的 config 各**扩充至 5~8 题**
- 在 `useQuizProgress` 中新增 `shuffleQuestions` 函数（或在 `QuizPanel` 中 shuffle 题目顺序）
- `QuizPanel` 挂载时调用 Fisher-Yates shuffle，避免每次打开题目顺序固定
- 新增题目录入 `src/i18n/locales.ts`（`quiz` 命名空间）

**涉及文件**：
- `src/components/QuizPanel.tsx`（新增 shuffle）
- `src/hooks/useQuizProgress.ts`（`shuffleQuestions` 可选）
- 5 个核心 learning config：`array.config.ts` / `tree.config.ts` / `bubble.config.ts` / `graph.config.ts` / `hash.config.ts`
- `src/i18n/locales.ts`（新增题目 i18n key）

**验收标准**：
- 每个核心 config ≥ 5 题
- 每次打开同一页面，题目顺序随机（连续打开 3 次，顺序不同）
- 原有 40 个 config 的 0 题场景不变

**验证方式**：
- `QuizPanel.test.tsx` 全绿
- 人工：SortPage 学习模式 → 测验 → 重置 → 再进入，验证顺序变化

---

### R6 — 树连接线统一为直线（P3，中优先级）

**问题**：二叉树结构用曲线连接不够标准学术感。

**方案**：
- `EdgeStyle` 默认保持 `straight`（已正确）
- 检查 7 个 tree visualizer 的 `renderTree` 调用：传入 `edgeStyle: 'straight'`
- BST 违规线（`isBSTViolation`）从 `dashed curve` 改为 `dashed straight`
- 可选：在 TreePage 操作栏增加 `Edge Style` 切换（straight / curved），类似 HeapPage 的 edge control

**涉及文件**：
- `src/visualizers/treeVisualizer.ts`
- `src/visualizers/bTreeVisualizer.ts`
- `src/visualizers/avlTreeVisualizer.ts`
- `src/visualizers/redBlackTreeVisualizer.ts`
- `src/visualizers/heapVisualizer.ts`
- `src/visualizers/segmentTreeVisualizer.ts`
- `src/visualizers/trieVisualizer.ts`
- `src/pages/TreePage.tsx`（若加 edge style toggle）
- `src/pages/HeapPage.tsx`（若复用 HeapPage 的 edge toggle）

**验收标准**：
- 7 个 tree visualizer 默认用直线连接
- BST 违规线为红色虚线直线
- 不影响现有 drag / animation / traversal 行为

**验证方式**：
- 截图对比（Tree / BTree / AVL / Heap / SegmentTree）
- 相关 visualizer test 全绿

---

### R7 — Sort 操作日志深度增强（P3，低优先级）

**问题**：sort 比较/交换仅显示最终统计，缺少每步 code 级别日志。

**方案**：
- 在 `handleRunAll` 中新增每步日志：在 `onCompare` / `onSwap` callback 中写 `addLog('code', ...)`
- code 日志格式：`[C] i vs j: a[i]=X < a[j]=Y` / `[S] swap a[i], a[j]`
- `LogPanel` 的 embedded 模式已有 `code` 类型（amber 色），直接复用

**涉及文件**：
- `src/pages/SortComparePage.tsx`

**验收标准**：
- sort 运行期间，日志实时显示比较/交换步骤
- code 日志在 embedded LogPanel 中用 amber 色高亮
- 大量数据时（>50 元素）自动降频日志写入（每 5 步写一次）

**验证方式**：
- SortComparePage 运行 15 元素 sort，日志记录 ≥ 10 条
- `SortComparePage.test.tsx` 全绿

---

## 四、验收总览

| 优化项 | 优先级 | 预估规模 | 阻塞关系 | 验收标志 |
|--------|--------|----------|----------|----------|
| R1 首页精简 | P1 | 中（涉及 Home + 4 组件引用） | 无 | 首屏 ≤ 1.5 屏，4 区块折叠 |
| R2 日志深色配色 | P1 | 小（仅 LogPanel typeConfig） | 无 | 深色模式 4 色可区分 |
| R3 SortCompare 布局 | P2 | 中（SortComparePage 结构重组） | R2 之后 | PerformanceChart 与 InfoPanel 左右对齐 |
| R4 GraphAlgo 右侧重构 | P2 | 中（GraphAlgorithmPage + InfoPanel slot） | 无 | ComplexityChart 移至 InfoPanel 同级区 |
| R5 测验扩充 | P2 | 中（5 config + QuizPanel shuffle） | 无 | 核心 config ≥ 5 题，随机顺序 |
| R6 树直线 | P3 | 小（7 visualizer 参数统一） | 无 | 截图 7 种树均为直线连接 |
| R7 Sort 日志深度 | P3 | 小（SortComparePage 新增 callback） | 无 | 日志实时记录比较/交换步骤 |

---

## 五、关键里程碑

| 里程碑 | 完成标志 |
|--------|----------|
| **M-A** 核心 UI 修复（R1 + R2） | 首页 ≤ 1.5 屏 + 深色日志 4 色全绿 |
| **M-B** 布局对齐（R3 + R4） | SortCompare + GraphAlgo 布局截图通过 |
| **M-C** 内容增强（R5 + R6 + R7） | 5 config ≥ 5 题 + 7 树直线 + sort 日志 ≥ 10 条 |
| **M-v17 GA** | lint 0 + test 全绿 + build OK + docs 同步 |

---

## 六、Out of Scope

- 不改 6 层架构 / 状态管理模式
- 不改测试基础设施（E2E / a11y / coverage 配置）
- 不改 API 契约 / 数据持久化 schema
- 不改 bundle 预算（现有 token 复用，不引新依赖）
- 不改 `design-md/`（rule §16.1 约束）
