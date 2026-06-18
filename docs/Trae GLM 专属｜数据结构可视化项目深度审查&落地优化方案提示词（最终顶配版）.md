# Trae GLM 专属｜数据结构可视化项目深度审查&落地优化方案提示词（最终顶配版）

基于仓库真实源码（v8.0.0）全面校准，所有项目信息、技术栈描述、痛点分析均与实际代码一致。

## 🎯 专属执行前置强制规则（Trae+GLM 必须优先执行，不可跳过）

1. **源码优先原则**：完整拉取、通读解析仓库全量文件（目录结构、业务代码、配置文件、静态资源、README、打包配置），**所有分析、评分、问题、方案必须基于真实源码**，禁止空想、套用通用模板、虚构项目问题。

2. **项目专属适配**：全程贴合「React + D3.js 学生向算法可视化教学开源 Web 项目」定位，剔除企业级、后端、移动端无关分析，所有优化适配**单人/双人学生开源开发场景**。

3. **交付落地约束**：所有问题标注**具体文件路径+行号**，所有优化方案附带**可直接复制的整改代码片段**，所有任务明确工时、优先级、验收标准，输出内容可直接用于开发落地与项目排期。

4. **输出格式锁死**：严格遵循本文档分级结构，高频使用表格、代码块、Mermaid 图表，无冗余废话、无空泛理论，全程客观量化、可验证。

## 📋 精准项目背景（基于仓库真实源码 v8.0.0）

### 基础信息

- **项目名称**: ds-visualizer（数据结构学习助手）

- **版本**: v8.0.0

- **开源仓库**: https://github.com/Jiang-mmm/Data-Structures-Visualized.git

- **项目定位**: 轻量级前端开源教学工具，面向计算机学生，实现 10 种数据结构 + 12 种算法的**D3.js SVG 动态动画可视化、交互式手动演示、分步学习模式**

- **目标用户**: 计算机专业在校生、算法入门学习者、面试刷题备考人群

### 真实核心技术栈

- 核心框架：**React 19 + TypeScript 5.8（strict 模式）**，函数组件 + 自定义 Hooks 架构

- 构建工具：**Vite 8**，dev 端口 3000，生产构建含 bundle 预算检查（`scripts/check-bundle.js`）

- 可视化核心：**D3.js v7 SVG 渲染**，采用全清+全绘策略（非 D3 enter/update/exit），SVG 使用 viewBox 自适应

- 样式方案：**Tailwind CSS v4**（@tailwindcss/vite），Neo-Brutalist 设计风格（硬边框、硬阴影、高对比度），支持 light/dark/system 三模式 + 4 色彩主题

- 路由：**React Router v7**，BrowserRouter（basename `/Data-Structures-Visualized`），13 个页面全部 `React.lazy` 代码分割

- 状态管理：无 Redux/Zustand，每个数据结构独立 `use*State` Hook（共 11 个），内部统一使用 `useHistory`（useRef 实现的撤销/重做栈，最多 20 步）

- 动画引擎：`src/utils/animationEngine.ts` 集中管理，提供 `duration()`/`wait()`/`transition()` 全局速度倍率、性能模式、5 种动画预设、FPS 监控、可中止动画

- 国际化：自研轻量 i18n（中文+英文），`src/i18n/locales.ts` + `src/i18n/useI18n.ts`

- 数据持久化：所有 11 种数据结构通过 localStorage 自动保存/恢复

- 错误监控：**@sentry/react** 集成

- PWA：**vite-plugin-pwa** 已集成

- 测试：**Vitest**（1274 单元测试 / 87 文件）+ **Playwright**（E2E）+ **@axe-core/playwright**（无障碍）

- 代码规范：**ESLint**（flat config）+ TypeScript strict（strictNullChecks + noImplicitAny + noUnusedLocals/Parameters）

### 六层架构

```
Entry (main.tsx → App.tsx) → Pages (13) → Components (29) → Hooks (22) → Visualizers (10) → Algorithms/Utils
```

### 已实现核心功能（13 个页面）

| 类别 | 页面 | 数据结构/算法 |
|------|------|--------------|
| 线性结构 | ArrayPage, LinkedListPage, StackPage, QueuePage | 数组、链表、栈、队列 |
| 树形结构 | TreePage, HeapPage, TriePage | 二叉搜索树、堆、字典树 |
| 图结构 | GraphPage, GraphAlgorithmPage | 图（增删节点/边）、BFS/DFS/Dijkstra/拓扑排序 |
| 排序算法 | SortPage, SortComparePage | 冒泡/选择/插入/快排/归并/基数/桶排序（7 种） |
| 哈希 | HashPage | 哈希表 |

### 学习模式体系

- **22 个学习配置文件**（`src/configs/learning/`），覆盖 4 图算法 + 8 排序 + 10 数据结构
- 学习模式组件：`LearningModeToggle`、`LearningPath`、`StepExplainer`、`ProgressBar`
- 学习进度记忆：`useLearningProgress`、`useLearningMode`、`usePageTracker`
- 学习路径：`src/configs/learningPath.ts` 定义全局学习路径

### 已有工程化能力

- ✅ TypeScript strict 模式（2026-06-17 启用）
- ✅ ESLint flat config 零警告
- ✅ Vitest 单元测试 1274 个（覆盖率支持）
- ✅ Playwright E2E 测试（Chromium + Firefox）
- ✅ axe-core 无障碍扫描（WCAG 2 AA 零违规）
- ✅ CI/CD（GitHub Actions：lint + build + test + deploy to Pages）
- ✅ PWA（vite-plugin-pwa）
- ✅ Bundle 预算检查（index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB）
- ✅ 撤销/重做（useHistory Hook，最多 20 步）
- ✅ 动画速度控制（SpeedControl 组件 + animationEngine 全局倍率）
- ✅ 中英文国际化
- ✅ 键盘快捷键（useKeyboard, useCommonKeyboard）
- ✅ 数据导入/导出（ExportImport 组件）
- ✅ 分享功能（ShareButton + shareUtils）
- ✅ 性能监控（PerformanceMonitor + performanceLogger）
- ✅ 错误边界（ErrorBoundary + Toast 通知）
- ✅ 响应式布局（Tailwind + viewBox SVG 自适应）

### 源码真实现存痛点（基于 v8.0.0 审查）

1. **测试覆盖不均**：部分模块（如 configs、utils）测试密度高，但某些 Hook 和 Visualizer 测试较薄，E2E 未使用 Playwright Test 框架而是自定义 runner

2. **E2E 框架原始**：使用自定义 Node.js runner + `child_process.exec`，未使用 Playwright Test 框架，缺乏内置重试、并行、报告能力

3. **学习模式缺口**：`doublyLinkedList` 配置存在但无对应页面（DoublyLinkedListPage.tsx 缺失），`SortComparePage` 未集成学习模式

4. **移动端体验**：虽然布局已响应式，但触控交互（手势缩放、拖拽）、移动端操作面板优化仍有提升空间

5. **性能边界**：大数据量（100+ 节点的树/图）场景下，全清+全绘策略可能导致性能下降

6. **文档缺口**：缺少完整的贡献指南、架构设计文档、API 文档

7. **无障碍深度**：axe-core 零违规，但键盘导航流程、屏幕阅读器体验的深度测试不足

## 🔍 完整审查维度 + 标准化输出规范

你将以**资深前端工程专家 + 数据结构可视化教学架构师**身份，完成全维度代码审计与落地规划，严格按照以下 5 大模块结构化输出，所有内容**100% 贴合本项目源码**。

# 第一部分：代码质量与架构深度评估

## 1. 项目结构与架构分层分析

- 分析六层架构（Entry → Pages → Components → Hooks → Visualizers → Algorithms/Utils）的**职责划分、依赖方向、代码复用逻辑**

- 评估 D3.js 渲染层（Visualizers）与 React 状态层（Hooks）的**解耦程度**，animationEngine 的集中管理效果

- 输出要求：表格形式呈现，包含「模块名称、文件路径、核心职责、依赖关系、耦合等级（高/中/低）、改进建议」

## 2. 编码规范与类型安全审查

- 检查 TypeScript strict 模式下的类型覆盖完整性：是否存在 `any` 残留、类型断言滥用、类型体操可简化处

- 排查潜在问题：Hook 依赖数组完整性、useEffect 清理函数、D3 transition 生命周期管理、动画中止逻辑健壮性

- 输出要求：缺陷清单表格，包含「问题等级（致命/警告/优化）、具体文件+行号、问题根因、风险影响、修复代码」

## 3. 测试质量与覆盖率评估

- 分析 1274 个单元测试的覆盖分布：哪些模块测试充分、哪些存在盲区

- 评估 E2E 测试架构：自定义 runner vs Playwright Test 框架的优劣、测试稳定性、CI 集成度

- 评估无障碍测试深度：axe-core 静态扫描 vs 键盘/屏幕阅读器动态测试的差距

- 输出要求：覆盖率热力图描述 + 测试改进优先级清单

# 第二部分：性能瓶颈与全场景体验优化

## 1. PWA 深度优化方案

- 现状诊断：vite-plugin-pwa 已集成，评估当前 Service Worker 策略、离线缓存覆盖范围、安装引导体验

- 优化方向：缓存策略精细化（静态资源 vs 动态内容）、离线学习模式、更新提示机制、桌面安装引导优化

- 输出要求：PWA 优化配置代码、离线功能验证方案

## 2. SVG 渲染性能专项优化

- 针对性分析：全清+全绘策略在大数据量（100+ 树节点、50+ 图节点、长数组排序）场景下的性能瓶颈

- 优化策略评估：
  - 虚拟化渲染（仅渲染可视区域）
  - D3 transition 批量合并
  - requestAnimationFrame 节流
  - Web Worker 卸载计算密集操作
  - 性能模式自动降级（animationEngine 已有基础）

- 输出要求：优化策略对比表（场景、实现难度、预期提升、代码示例）

## 3. 移动端触控体验增强

- 诊断现有响应式布局在小屏设备上的可用性问题

- 触控交互增强：手势缩放（pinch-to-zoom）、拖拽排序、滑动操作、长按菜单

- 操作面板移动端重构：底部抽屉、浮动操作按钮、触控友好的控件尺寸

- 输出要求：移动端交互增强方案 + 关键组件改造代码

# 第三部分：核心功能拓展与算法体系升级

## 1. 新增算法可视化规划

- 结合教学刚需，筛选适配学生场景的缺失算法：
  - 图算法：A* 寻路、Prim/Kruskal 最小生成树、Bellman-Ford、Floyd-Warshall
  - 高级数据结构：红黑树、AVL 树、B 树/B+ 树、跳表
  - 字符串算法：KMP、Rabin-Karp

- 设计各算法**可视化核心步骤、状态高亮、路径演示、分步学习配置**

- 输出要求：新增算法清单、学习配置设计、接入现有架构的实现方案

## 2. 排序对比功能强化

- SortComparePage 已存在，评估当前对比功能的完整度

- 强化方向：多算法同步动画、量化统计（比较/交换/递归深度）、时间复杂度实时曲线

- 输出要求：功能增强方案 + 交互流程设计

## 3. 学习模式体系完善

- 补齐学习模式缺口：doublyLinkedList 配置对应页面创建、SortComparePage 学习模式集成

- 增强学习体验：知识点弹窗（AlgorithmInfo 组件已有基础）、错题复盘、学习路径推荐、成就系统

- 输出要求：学习模式完善方案 + 最小可行开发计划

# 第四部分：工程化与文档体系完善

## 1. E2E 测试框架升级

- 评估从自定义 runner 迁移到 Playwright Test 框架的收益与成本

- 升级方向：内置重试机制、并行执行、HTML 报告、VS Code 集成、fixture 复用

- 输出要求：迁移方案 + 新旧对比 + 关键测试用例改造示例

## 2. CI/CD 增强

- 评估当前 GitHub Actions 流程的优化空间：覆盖率上传、构建缓存、Playwright 浏览器缓存、部署优化

- 输出要求：CI/CD 优化配置文件

## 3. 文档体系建设

- 补充：贡献指南（CONTRIBUTING.md）、架构设计文档、组件 API 文档、算法接入指南

- 完善 README：项目截图/GIF、功能清单、在线演示链接、开发环境搭建

- 输出要求：文档大纲 + 核心内容模板

# 第五部分：量化评估 & 分级落地实施路线图

## 1. 项目四维量化评分（固定权重）

- 评分权重：代码质量 30% + 渲染性能 25% + 用户体验 25% + 功能完整性 20%

- 评分规则：1-10 分量化打分，**每一分扣分项均对应源码真实问题**，附带详细依据

- 输出要求：标准化评分总表、分项得分、加权总分、项目整体评级

## 2. 短板与架构局限分级清单

1. 功能完整性缺口：对标主流同类可视化项目（VisuAlgo、Algorithm Visualizer），列出缺失功能

2. 工程化深度：E2E 框架原始、覆盖率可视化缺失、Playwright Test 未采用等

3. 全局问题汇总：所有缺陷按 P0 致命、P1 高优、P2 中优、P3 低优分级

- 输出要求：三列表格汇总，明确影响范围、修复优先级

## 3. 分阶段可落地实施总计划（适配学生开源项目）

基于 v8.0 迭代计划（Phase A-C3 已完成），规划后续阶段：

- **阶段一（Phase D）**：功能扩展 — 新增算法可视化 + 学习模式补齐（扩产品能力）

- **阶段二（Phase E）**：体验优化 — 移动端增强 + PWA 深度优化 + SVG 性能优化（提核心体验）

- **阶段三（Phase F）**：文档发布 — 贡献指南 + 架构文档 + README 完善（做项目收尾）

- **持续改进**：E2E 框架升级 + CI/CD 增强 + 测试覆盖率提升

输出硬性要求：

1. 任务总表表格：阶段、任务名称、优先级、预估工时、依赖任务、交付成果、验收标准

2. 风险评估：各阶段改造风险（渲染兼容、功能冲突、改动报错）+ 具体应对方案

3. 所有任务适配单人开发、工时贴合学生开发节奏

4. 最终输出可直接复制用于开发排期、迭代落地、开源迭代更新

## ⚙️ 最终输出强制规范

1. 语言：简体中文，专业技术术语保留英文，表述简洁精准、无废话

2. 格式：层级清晰，一级/二级标题统一，大量使用表格、代码块、Mermaid 图表

3. 落地性：所有方案满足「可直接看懂、可直接复制、可直接开发、有明确成果」

4. 唯一性：完全适配本仓库 React + D3.js + TypeScript 项目，不套用原生 JS、Vue、Angular 项目方案

5. 总结收尾：文末输出**Top10 最高优先级整改清单**，方便快速启动开发
