# v13 Phase H — 学习体验增强实施真源文档

> **版本**: v13.0.0-rc2 → v13.0.0-rc3  
> **范围**: Path 3（学习体验增强），紧随 Path 1（v13 代码审计修复）完成后执行  
> **顺序**: H2 → H3 → H1（已确认）  
> **不做范围**: 不改动底层架构、不新增数据结构、不重构动画引擎、不修改 Path 1 已修复代码

---

## 总体目标

在不改变现有教学流程的前提下，提升搜索可达性、排序对比页的教学沉浸感，并引入可复用的测验反馈机制，使学生能更快定位知识点、理解算法差异、检验学习效果。

---

## H2 — 全局搜索增强

### 目标
让全局搜索从“精确前缀匹配”升级为“智能搜索入口”，支持模糊匹配、搜索历史、复杂度过滤、分类展示。

### 原子步骤

#### H2-1 搜索索引扩展
- **做什么**: 在 `SearchItem` 中新增 `complexity?: string` 与 `tags?: string[]` 字段；在 `searchIndex.ts` 中为学习步骤提取时间/空间复杂度（从 `step.description` 或配置元数据）。
- **验收标准**: `buildSearchIndex()` 返回的 `SearchItem` 包含有效 `complexity` 的项 ≥ 50%。
- **验证**: 运行 `searchIndex` 相关单元测试，确认字段存在。
- **不做**: 不改动 `learningConfigs` 的结构，只从现有 `description` 中解析。

#### H2-2 Fuzzy 匹配
- **做什么**: 在 `src/utils/fuzzySearch.ts` 实现 `fuzzyMatch(query, text)`：基于字符顺序的最长公共子序列（LCS）打分，支持拼音首字母/全拼（通过已有关键字列表间接支持）。
- **验收标准**: 输入 `bubb` 能匹配 `bubbleSort`/`冒泡排序`；输入 `erchashu` 能匹配 `tree`/`二叉树`；评分高的项排在前面。
- **验证**: 新增 `fuzzySearch.test.ts`，覆盖空串、完全匹配、部分匹配、顺序匹配、无匹配。
- **不做**: 不引入外部 fuzzy 库；不实现编辑距离（Levenshtein），保持 O(n) 级别简单打分。

#### H2-3 搜索历史
- **做什么**: `GlobalSearch` 增加 `searchHistory: string[]` 状态，持久化到 `localStorage`（key: `ds-visualizer:search-history`，上限 10 条，去重）。空查询时展示历史记录。
- **验收标准**: 关闭弹窗后再次打开，上次输入保留在历史中；历史条目可点击重新搜索；可单个/全部清除。
- **验证**: 新增/更新 `GlobalSearch.test.tsx` 覆盖历史写入、读取、去重、清除。
- **不做**: 不跨设备同步；不引入外部状态管理。

#### H2-4 复杂度过滤
- **做什么**: 在搜索结果顶部增加 `O(1) / O(log n) / O(n) / O(n log n) / O(n²)` 等复杂度筛选标签；点击后只显示匹配的 learning 项。
- **验收标准**: 选中 `O(n log n)` 时，结果仅显示包含该复杂度的学习步骤；清除筛选后恢复。
- **验证**: 单元测试覆盖筛选逻辑与 UI 状态。
- **不做**: 不修改页面路由；不影响 page 类型结果。

#### H2-5 分类展示
- **做什么**: 搜索结果按 `page` / `learning` / `history` 分组渲染，每组带可折叠标题与计数；保留键盘导航。
- **验收标准**: 视觉上能区分三类结果；空查询时显示“历史”与“页面”分组；有查询时显示“页面”与“学习步骤”分组。
- **验证**: 快照/单元测试确认分组 DOM 结构；a11y 测试通过。
- **不做**: 不引入虚拟列表（当前 MAX_RESULTS 仍 ≤ 20）。

#### H2-6 i18n 补充
- **做什么**: `locales.ts` 的 `globalSearch` 命名空间新增 `history`、`clearHistory`、`noHistory`、`complexity`、`categoryPage`、`categoryLearning`、`categoryHistory` 等键。
- **验收标准**: 中英文界面均正常显示，无 fallback key。
- **验证**: `locales.test.ts` 不报错；GlobalSearch 测试使用翻译 key。

### H2 验证清单
- [ ] `npm run test:run` 通过（含新增 fuzzy/history 测试）
- [ ] `npm run lint` 0 errors
- [ ] `npm run typecheck` 0 errors
- [ ] `npm run build` 通过
- [ ] `node e2e/test-a11y.js` 17 页通过

---

## H3 — SortComparePage 学习模式

### 目标
为排序对比页 `/compare` 添加学习模式，使用户能按步骤对比两种排序算法的执行过程。

### 原子步骤

#### H3-1 学习配置
- **做什么**: 新建 `src/configs/learning/sortCompare.config.ts`，导出 `sortCompareConfig`，包含 5~7 个步骤：选择算法、初始化数组、第一轮比较、关键差异、完成对比。
- **验收标准**: 配置能在 `learningConfigs` 中注册；`useLearningMode` 可正常加载。
- **不做**: 不改动现有排序算法实现。

#### H3-2 页面集成
- **做什么**: 在 `SortComparePage.tsx` 中接入 `useLearningMode(sortCompareConfig)`，右侧 `InfoPanel` 显示学习步骤。
- **验收标准**: 页面能正常进入学习模式、切换步骤、高亮当前对比点。
- **验证**: 新增 `SortComparePage.test.tsx` 基础用例。

---

## H1 — 测验系统

### 目标
引入可复用的测验面板 `QuizPanel`，在学习模式下提供步骤检测/选择题，并记录学习进度。

### 原子步骤

#### H1-1 测验配置
- **做什么**: 在 `src/configs/learning/` 下为 2~3 个核心算法（如 bubbleSort、binarySearch）增加 `quiz` 字段，每配置 3 道单选题。
- **验收标准**: 配置类型扩展后不影响现有 37 个学习配置。

#### H1-2 useQuizProgress Hook
- **做什么**: 新建 `src/hooks/useQuizProgress.ts`，记录每道题的答题状态、得分、完成时间，持久化到 `localStorage`。
- **验收标准**: Hook 返回 `progress`、`score`、`submitAnswer`、`reset`。

#### H1-3 QuizPanel 组件
- **做什么**: 新建 `src/components/QuizPanel.tsx`，在学习模式最后一页或单独 tab 中展示题目；答对/答错给出即时反馈。
- **验收标准**: 组件可通过单元测试；与 `InfoPanel` 集成后不影响 a11y。

---

## 阶段边界

- **H2 完成后必须汇报**，用户确认后再进入 H3。
- **H3 完成后必须汇报**，用户确认后再进入 H1。
- 任何临时想法（如增加收藏、分享搜索结果）必须先写入本文档并获确认，禁止直接改代码。
