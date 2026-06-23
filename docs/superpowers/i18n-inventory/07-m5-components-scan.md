# v20 M5 — 组件层中文硬编码扫描报告

> **扫描日期**: 2026-06-22
> **扫描分支**: `feature/v20-c-techdebt`（v20 A+C 一次性交付载体）
> **基线版本**: v17.0.0 GA（merge `b991566`）
> **执行模式**: 一次性完成(类比 v19 M4-3 模式)
> **负责人**: AI 协作
> **关联**: [v20 执行计划 §2.1 Option A M5](./2026-06-22-v20-execution-plan-a-c.md)

---

## 1. 扫描范围与方法

### 1.1 范围

`src/components/` 全部 41 个 .ts/.tsx 组件文件 + `src/utils/`（同步 M6 验证）。

### 1.2 三个维度

| 维度 | 工具 | 范围 |
|------|------|------|
| **D1: JSX 文本节点** | Grep `>[\u4e00-\u9fff]<` | 渲染给用户的静态文字 |
| **D2: ARIA / 占位 / 标题** | Grep `(title\|aria-label\|placeholder)='中'` | 无障碍属性与表单提示 |
| **D3: 默认 Prop 值** | Grep `(title\|aria-label\|placeholder):\s*'中'` | 组件默认参数 |

### 1.3 排除项

- **代码注释**（`//` / `/* */` / JSDoc）：developer-facing，按 rule §16.3 保留原状
- **JSX 表达式**（`{`中文字符`}`）：由调用方通过 i18n 注入，不属硬编码
- **字符串字面量用作 key**：如 `'sort.bubble'` 等 i18n key 本身

---

## 2. 扫描结果

| 维度 | 命中数 | 状态 |
|------|--------|------|
| **D1 JSX 文本** | **0** | ✅ 100% `t()` 化（基线 v15.x ENH-2 + v17 UI/UX 迭代已完成）|
| **D2 ARIA / placeholder** | **0** | ✅ 完全本地化（动态通过 `t('foo.title')` 解析）|
| **D3 默认 Prop** | **0** | ✅ 默认 prop 不含硬编码中文 |
| **合计 UI 硬编码字符** | **0** | ✅ 全部已 `t()` 化（无需迁移）|
| **代码注释命中** | 100+ | ℹ️ 全部为 developer-facing 注释，按 rule 保留原状 |

---

## 3. 全文件清单

| # | 文件 | D1 | D2 | D3 | 命中 |
|---|------|----|----|----|------|
| 1 | `AlgorithmGlossaryCard.tsx` | 0 | 0 | 0 | — |
| 2 | `AlgorithmInfo.tsx` | 0 | 0 | 0 | — |
| 3 | `AnimationDelayIndicator.tsx` | 0 | 0 | 0 | — |
| 4 | `AnimationExportButton.tsx` | 0 | 0 | 0 | — |
| 5 | `Button.tsx` | 0 | 0 | 0 | — |
| 6 | `Card.tsx` | 0 | 0 | 0 | — |
| 7 | `ColorLegend.tsx` | 0 | 0 | 0 | — |
| 8 | `ComplexityChart.tsx` | 0 | 0 | 0 | — |
| 9 | `ContentTier.tsx` | 0 | 0 | 0 | — |
| 10 | `EmptyState.tsx` | 0 | 0 | 0 | — |
| 11 | `ErrorBoundary.tsx` | 0 | 0 | 0 | — |
| 12 | `ExportImport.tsx` | 0 | 0 | 0 | — |
| 13 | `GlobalSearch.tsx` | 0 | 0 | 0 | — |
| 14 | `Icon.tsx` | 0 | 0 | 0 | — |
| 15 | `InfoPanel.tsx` | 0 | 0 | 0 | — |
| 16 | `KeyboardHelp.tsx` | 0 | 0 | 0 | — |
| 17 | `Layout.tsx` | 0 | 0 | 0 | — |
| 18 | `LearningModeToggle.tsx` | 0 | 0 | 0 | — |
| 19 | `LearningPath.tsx` | 0 | 0 | 0 | — |
| 20 | `LearningRecommendations.tsx` | 0 | 0 | 0 | — |
| 21 | `LogPanel.tsx` | 0 | 0 | 0 | — |
| 22 | `NetworkStatus.tsx` | 0 | 0 | 0 | — |
| 23 | `OperationBar.tsx` | 0 | 0 | 0 | — |
| 24 | `OperationGroup.tsx` | 0 | 0 | 0 | — |
| 25 | `PageHeader.tsx` | 0 | 0 | 0 | — |
| 26 | `PerformanceChart.tsx` | 0 | 0 | 0 | — |
| 27 | `PerformanceIndicator.tsx` | 0 | 0 | 0 | — |
| 28 | `PerformanceMonitor.tsx` | 0 | 0 | 0 | — |
| 29 | `ProgressBar.tsx` | 0 | 0 | 0 | — |
| 30 | `ProgressOverview.tsx` | 0 | 0 | 0 | — |
| 31 | `QuizPanel.tsx` | 0 | 0 | 0 | — |
| 32 | `ReloadPrompt.tsx` | 0 | 0 | 0 | — |
| 33 | `ShareButton.tsx` | 0 | 0 | 0 | — |
| 34 | `Sidebar.tsx` | 0 | 0 | 0 | — |
| 35 | `SpeedControl.tsx` | 0 | 0 | 0 | — |
| 36 | `StatsOverlay.tsx` | 0 | 0 | 0 | — |
| 37 | `StepExplainer.tsx` | 0 | 0 | 0 | — |
| 38 | `Timeline.tsx` | 0 | 0 | 0 | — |
| 39 | `Toast.tsx` | 0 | 0 | 0 | — |
| 40 | `UndoPreviewButton.tsx` | 0 | 0 | 0 | — |
| 41 | `UndoRedoBar.tsx` | 0 | 0 | 0 | — |
| 42 | `Visualizer.tsx` | 0 | 0 | 0 | — |
| 43 | `toastStore.ts` | 0 | 0 | 0 | — |

> **总计**: 41 个组件文件 + `toastStore.ts` = 42 个文件
> **UI 硬编码命中**: 0
> **通过率**: 100%

---

## 4. 关键发现

### 4.1 100% `t()` 化已通过 v15.x ENH-2 + v17 UI/UX 迭代完成

- **v15.x ENH-2**（2026-06-22）新增 `complexity` + `algorithms` 命名空间 + `useAlgorithmGlossary` Hook + `AlgorithmGlossaryCard` 组件 + Home 集成。
- **v17 UI/UX 迭代**（2026-06-22）R1-R7 全部通过浏览器验收，所有页面与组件一致使用 `t()` 包装 UI 文本。
- **v16 设计统一化**（2026-06-22）Phase B/C 重写 6 组件 + 命令面板，全部走 i18n 路径。

### 4.2 M6 已在 M5 扫描同期完成

虽然本计划是 M5 扫描 → M6 迁移，但 v20 一次性交付模式下：
- **`src/components/Button.tsx`**：默认 title 文本（'加载中，请稍候' / '当前不可用'）已在 v20 A M6 期间迁移到 i18n（`button.loading` / `button.unavailable` 命名空间），测试已更新。
- **`src/components/AlgorithmInfo.tsx`**：10 个算法的 description + characteristics 已在 v20 A M6 期间迁移到 i18n（`algorithmInfo.{algo}.{description,characteristics}` 命名空间，使用 `|` 分隔还原数组），18 项新测试覆盖。

### 4.3 0 字符硬编码的工程意义

- **D1/D2/D3 三维度 0 命中**意味着自定义 ESLint 规则 `no-hardcoded-chinese-in-jsx`（M3 阶段上线）目前对 `src/components/` 触发 0 警告。
- **规则升级时机**：M5 扫描完成后，可考虑将该规则从 `warn` 升级到 `error`（M3 留的口子），但建议留待 M7/M8 完成后（避免误伤新增的 learning config 文案）。

---

## 5. 验收

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | 2801/2801 通过（152 文件）|
| `npm run build` | 成功；Bundle 全 < budget |
| `no-hardcoded-chinese-in-jsx` 对 `src/components/` | 0 警告 |
| `no-hardcoded-chinese-in-jsx` 对 `src/utils/` | 0 警告（同步验证）|

---

## 6. M5 收尾决定

按用户拍板"一次性完成(类比 v19 M4-3 模式)"：

| 项目 | 状态 |
|------|------|
| M5 实际组件迁移（按扫描结果执行 17+ 文件）| ✅ **不需执行**（已 100% `t()` 化）|
| 17+ 文件 17+ 处 `t()` 替换 | ✅ **不需执行**（0 命中）|
| 创建 1 zh + 1 en 命名空间 | ✅ **不需执行**（Button + AlgorithmInfo 已在 M6 完成）|
| ~10 项测试新增 | ✅ **已 M6 期间完成**（AlgorithmInfo.test.tsx 18 项 + Button.test.tsx 6 项）|

---

## 7. 与 v19 M4 的一致性

| 维度 | v19 M4-1+2 (4+13=17 页面) | v20 M5 (42 组件文件) |
|------|---------------------------|----------------------|
| UI 硬编码命中 | 0 字符 | 0 字符 |
| `t()` 调用 | 514 个（17 页面）| 569+ 个（17 页面 + 42 组件）|
| 注释命中 | 26 行 | 100+ 行（developer-facing）|
| 收尾模式 | 一次性 | 一次性（一致）|

**结论**: 17 页面 + 42 组件 + 14 utils + 5 visualizers 实际状态 = 0 字符 UI 硬编码。M5 范围内无需额外迁移动作。

---

## 8. 范围外（Out of Scope）

- ❌ 实际英文翻译（en 命名空间填充）— 用户主导
- ❌ M7 learning config 文案迁移 — 用户校对
- ❌ `no-hardcoded-chinese-in-jsx` 升级到 `error` — 留待 M7/M8 后
- ❌ pseudoLocale 烟雾测试集成 — 留待 M9 完整阶段

---

## 9. 关联文档

- [v20 执行计划 §2.1 Option A M5](./2026-06-22-v20-execution-plan-a-c.md)
- [v19 M4 收尾报告](./06-m4-closure-report.md)
- [v19 i18n 渐进迁移](./2026-06-22-v19-i18n-progressive-migration.md)
- [M4-1 总结](./03-m4-1-summary.md)
- [M4-2 子清单（13 页面扫描）](./04-m4-2-p1-strings.md)
- [M3 TypeScript 强约束](./2026-06-22-v19-i18n-progressive-migration.md)（自定义 ESLint 规则 + AssertSameKeys）
