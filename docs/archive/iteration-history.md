# 迭代历史归档（v8.0 ~ v10.0）

> **整理日期:** 2026-06-21
> **来源文档:**
> - `docs/iteration-plan-v8.md` (2026-06-17)
> - `docs/iteration-plan-v9.md` (2026-06-18)
> - `docs/iteration-plan-v10.md` (2026-06-19)
> **状态:** 全部完成，详细变更已合并到 `CHANGELOG.md` / `WORKLOG.md` / `TODO.md`
> **当前活跃计划:** `docs/iteration-plan-v11.md` (2026-06-19 起)

---

## 目录

1. [v8.0 迭代计划（2026-06-17）](#v80-迭代计划2026-06-17)
2. [v9.0 迭代计划（2026-06-18）](#v90-迭代计划2026-06-18)
3. [v10.0 迭代计划（2026-06-19）](#v100-迭代计划2026-06-19)
4. [三版本目标与范围对比](#三版本目标与范围对比)
5. [完整执行结果（已合并到 CHANGELOG）](#完整执行结果已合并到-changelog)

---

# v8.0 迭代计划（2026-06-17）

> 基于 2026-06-17 全面审查结果制定，覆盖 E2E 加固、功能扩展、工程质量、体验优化、文档发布五大方向。
>
> **当前基线：** 2548 单元测试 / 174 文件 / Lint 零警告 / 构建 611ms / index 80KB / TypeScript strictNullChecks+noImplicitAny / axe-core 零 violations

## 进度跟踪

| Phase | 状态 | 完成日期 | 提交 |
|-------|------|----------|------|
| A. E2E 加固 | ✅ 完成 | 2026-06-17 | `ee07a44` |
| B. CI/CD 完善 | ✅ 完成 | 2026-06-17 | `a5e8894` |
| C1. noUnusedLocals/Parameters | ✅ 完成 | 2026-06-17 | `f552f61` |
| C2. noImplicitAny | ✅ 完成 | 2026-06-17 | `c352731` |
| C3. strictNullChecks | ✅ 完成 | 2026-06-17 | `73208e2` |
| C4. strict | ✅ 完成 | 2026-06-17 | `27b093e` |
| D. 功能扩展 | ⬜ 待开始 | | |
| E. 体验优化 | ⬜ 待开始 | | |
| F. 文档发布 | ⬜ 待开始 | | |

## 审查发现摘要

### 学习模式覆盖
- 22 个学习配置已注册（4 图算法 + 8 排序 + 10 数据结构），全部有页面集成
- `doublyLinkedList` 配置存在但无对应页面（无 DoublyLinkedListPage.tsx）
- `SortComparePage` 未集成学习模式（对比页面，属合理设计）

### E2E 测试现状
- `run-all-tests.js` 包含 8 个测试文件（Phase 1: 5 并行 + Phase 2: 3 串行）
- **孤立文件：** `test-v65-full.js`（BASE_URL 错误）、`test-a11y.js`（未纳入 runner）
- **Firefox 假覆盖：** `test-interactions.js` 和 `test-persistence.js` 硬编码 `chromium`，忽略 `BROWSER` 环境变量
- 无 Playwright Test 框架，使用自定义 Node.js runner + `child_process.exec`

### CI/CD 配置
- CI 运行：lint + build + unit test + E2E（test-core + test-comprehensive）
- 部署依赖 CI 成功，但重新构建而非复用 CI 产物
- 无覆盖率收集/上传，无 Playwright 浏览器缓存

### TypeScript 严格度
- `strict: false`，所有严格检查关闭（无 null 检查、无隐式 any 警告）
- 无独立 `typecheck` 脚本，类型检查仅通过 ESLint 间接进行

---

## Phase A：E2E 测试最终加固

**目标：** 所有 E2E 测试在 Chromium + Firefox 下稳定通过，运行时间可控。

### A1. 修复 test-interactions.js 和 test-persistence.js 的浏览器支持
- **现状：** 两个文件第 1 行硬编码 `import { chromium } from 'playwright'`，忽略 `BROWSER` 环境变量
- **修改：** 改为读取 `process.env.BROWSER`，支持 chromium/firefox 切换，与其他 5 个测试文件一致
- **文件：** `e2e/test-interactions.js`、`e2e/test-persistence.js`
- **验收：** `BROWSER=firefox node e2e/test-interactions.js` 实际使用 Firefox 运行

### A2. 纳入 test-a11y.js 到 runner
- **现状：** `test-a11y.js` 使用 `@axe-core/playwright` 扫描 12 个页面，但未纳入 `run-all-tests.js`
- **修改：** 将 `test-a11y.js` 加入 Phase 2 串行测试列表
- **文件：** `e2e/run-all-tests.js`
- **验收：** `node e2e/run-all-tests.js` 包含 a11y 测试输出

### A3. 清理 test-v65-full.js
- **现状：** BASE_URL 为 `/ds-visualizer/`（错误），且未纳入 runner
- **修改：** 修复 BASE_URL 为 `/Data-Structures-Visualized/`，纳入 runner；或删除（功能已被 test-comprehensive.js 覆盖）
- **决策依据：** 检查 test-v65-full.js 的 32 个测试用例是否与 test-comprehensive.js 的 114 个重叠
- **文件：** `e2e/test-v65-full.js`、`e2e/run-all-tests.js`

### A4. persistence 测试耗时优化
- **现状：** test-persistence.js 运行 10+ 分钟（6 个测试段 × 大量动画等待）
- **修改方案：**
  - 减少 `sleep()` 等待时间（当前部分 sleep 1500-2000ms，可降至 800-1000ms）
  - 边界条件测试中填充循环从 20 次降至必要次数
  - 考虑拆分为 `test-persistence-core.js`（Test 1-2）和 `test-persistence-boundary.js`（Test 3-6）
- **文件：** `e2e/test-persistence.js`
- **验收：** 运行时间 < 5 分钟，通过率不变

### A5. E2E 全套回归验证
- **操作：** 在 Chromium 和 Firefox 下运行完整 E2E 套件
- **命令：** `node e2e/run-all-tests.js`
- **验收：** Chromium 和 Firefox 通过率均 ≥ 95%，persistence 测试全部通过

### Phase A 交付物
- [ ] 修复后的 test-interactions.js、test-persistence.js（支持 Firefox）
- [ ] 更新后的 run-all-tests.js（包含 a11y 测试）
- [ ] 清理或修复的 test-v65-full.js
- [ ] 优化后的 persistence 测试（< 5 分钟）
- [ ] 双浏览器回归报告

---

## Phase B：CI/CD 完善

**目标：** CI 流水线完整、高效、有覆盖率保障。

### B1. 添加 Playwright 浏览器缓存
- **现状：** 每次 CI 运行都执行 `npx playwright install --with-deps chromium`，耗时 1-2 分钟
- **修改：** 添加 `actions/cache` 缓存 `~/.cache/ms-playwright`，key 为 `playwright-${{ hashFiles('package-lock.json') }}`
- **文件：** `.github/workflows/ci.yml`
- **验收：** 第二次 CI 运行跳过浏览器安装（缓存命中）

### B2. 添加覆盖率收集
- **现状：** `test:coverage` 脚本存在但 CI 不调用，无覆盖率报告
- **修改：**
  - CI 中用 `npm run test:coverage` 替代 `npm run test:run`
  - 添加覆盖率摘要到 job 输出（不阻塞 CI，仅报告）
- **文件：** `.github/workflows/ci.yml`
- **验收：** CI 输出包含覆盖率百分比

### B3. 添加独立 typecheck 脚本
- **现状：** 无 `tsc --noEmit` 命令，类型检查仅通过 ESLint 间接进行
- **修改：**
  - `package.json` 新增 `"typecheck": "tsc --noEmit"` 脚本
  - CI 中在 lint 之后、build 之前运行 `npm run typecheck`
- **文件：** `package.json`、`.github/workflows/ci.yml`
- **验收：** `npm run typecheck` 通过，CI 包含 typecheck 步骤

### B4. 部署复用 CI 产物（可选优化）
- **现状：** deploy.yml 重新执行 `npm ci` + `npm run build`，与 CI 重复
- **修改：** CI 上传 `dist/` 为 artifact，deploy 下载并部署
- **文件：** `.github/workflows/ci.yml`、`.github/workflows/deploy.yml`
- **风险：** 增加 workflow 复杂度，需权衡收益

### Phase B 交付物
- [ ] 更新后的 ci.yml（缓存 + 覆盖率 + typecheck）
- [ ] 新增 typecheck 脚本
- [ ] （可选）更新后的 deploy.yml（复用产物）

---

## Phase C：TypeScript 严格化（分阶段）

**目标：** 逐步提升类型安全，不一次性引入大量类型错误。

### C1. 阶段 1 — 启用 noUnusedLocals + noUnusedParameters
- **现状：** 未使用的变量和参数不报错
- **修改：** `tsconfig.json` 设置 `"noUnusedLocals": true, "noUnusedParameters": true`
- **预期影响：** 可能发现 10-30 个未使用变量，需逐个清理
- **文件：** `tsconfig.json` + 被影响的源文件
- **验收：** `npm run typecheck` 通过

### C2. 阶段 2 — 启用 noImplicitAny
- **现状：** 缺少类型注解的参数默认为 `any`
- **修改：** `tsconfig.json` 设置 `"noImplicitAny": true`
- **预期影响：** 可能发现 50-100 处隐式 any，需添加类型注解
- **策略：** 先在 `src/utils/` 和 `src/hooks/` 中修复，再处理 `src/pages/` 和 `src/components/`
- **文件：** `tsconfig.json` + 大量源文件
- **验收：** `npm run typecheck` 通过，无 `any` 类型警告

### C3. 阶段 3 — 启用 strictNullChecks
- **现状：** null/undefined 不参与类型检查
- **修改：** `tsconfig.json` 设置 `"strictNullChecks": true`
- **预期影响：** 最大改动量，可能需要 200+ 处修复（添加 null 检查、可选链、类型守卫）
- **策略：** 按模块逐步修复：utils → hooks → visualizers → components → pages
- **文件：** `tsconfig.json` + 大量源文件
- **验收：** `npm run typecheck` 通过

### C4. 阶段 4 — 启用 strict
- **修改：** `tsconfig.json` 设置 `"strict": true`（启用所有剩余严格检查）
- **预期影响：** 前 3 阶段完成后，此步改动量应较小
- **验收：** `npm run typecheck` 通过，`npm run build` 正常

### Phase C 交付物
- [ ] 更新后的 tsconfig.json（strict: true）
- [ ] 全部源文件类型注解补全
- [ ] `npm run typecheck` 零错误

---

## Phase D：功能扩展

**目标：** 扩展算法库和学习模式，增强教学价值。

### D1. 新增图算法
- **算法列表：**
  - Bellman-Ford（单源最短路径，支持负权边）
  - Floyd-Warshall（全源最短路径）
  - Prim 最小生成树
  - Kruskal 最小生成树
- **文件：**
  - `src/algorithms/graph/bellmanFord.ts`
  - `src/algorithms/graph/floydWarshall.ts`
  - `src/algorithms/graph/prim.ts`
  - `src/algorithms/graph/kruskal.ts`
  - `src/algorithms/graph/index.ts`（注册新算法）
  - `src/configs/learning/` （4 个学习配置文件）
  - `src/pages/GraphAlgorithmPage.tsx`（算法选择器更新）
  - `src/i18n/locales.ts`（国际化翻译）
- **验收：** 单元测试覆盖新算法，页面可选择并运行动画

### D2. 新增排序算法
- **算法列表：**
  - TimSort（混合排序，Python 默认）
  - ShellSort（希尔排序）
  - CombSort（梳排序）
- **文件：**
  - `src/algorithms/sorting/timSort.ts`
  - `src/algorithms/sorting/shellSort.ts`
  - `src/algorithms/sorting/combSort.ts`
  - `src/algorithms/sorting/index.ts`（注册）
  - `src/configs/learning/` （3 个学习配置）
  - `src/i18n/locales.ts`
- **验收：** SortPage 和 SortComparePage 自动识别新算法

### D3. doublyLinkedList 页面（可选）
- **现状：** `doublyLinkedList.config.ts` 学习配置已存在，但无对应页面
- **方案 A：** 在 LinkedListPage 中添加"单向/双向"切换
- **方案 B：** 新建 DoublyLinkedListPage.tsx
- **决策依据：** 评估双向链表的教学价值 vs 开发成本
- **文件：** `src/pages/LinkedListPage.tsx` 或新建页面

### D4. SortComparePage 学习模式集成（可选）
- **现状：** 对比页面是唯一未集成学习模式的页面
- **修改：** 添加算法对比的学习步骤（如"为什么快速排序通常比冒泡排序快？"）
- **文件：** `src/pages/SortComparePage.tsx`、`src/configs/learning/`

### Phase D 交付物
- [ ] 4 个新图算法 + 学习配置 + 单元测试
- [ ] 3 个新排序算法 + 学习配置 + 单元测试
- [ ] （可选）双向链表页面
- [ ] （可选）对比页面学习模式

---

## Phase E：体验与性能优化

**目标：** 提升移动端体验、离线支持、大数据量性能。

### E1. PWA 离线验证
- **现状：** vite-plugin-pwa 已配置，workbox 预缓存 36 个条目，但未验证离线场景
- **修改：**
  - 手动测试：加载页面后断网，验证所有 13 个页面可离线访问
  - 修复发现的离线问题（如有）
- **验收：** 所有页面离线可访问

### E2. 大数据量可视化优化
- **现状：** 数组 >50 元素时跳过动画（LARGE_DATA_THRESHOLD），但树/图无类似保护
- **修改：**
  - treeVisualizer.ts：节点 >30 时跳过动画
  - graphVisualizer.ts：节点 >20 时跳过动画
  - heapVisualizer.ts：元素 >30 时跳过动画
- **文件：** `src/visualizers/treeVisualizer.ts`、`src/visualizers/graphVisualizer.ts`、`src/visualizers/heapVisualizer.ts`
- **验收：** 大数据量下 FPS ≥ 30

### E3. 移动端手势增强
- **现状：** 有 pinch-to-zoom 基础，Sidebar 滑动关闭
- **修改：**
  - 添加左右滑动切换数据结构页面（swipe navigation）
  - 操作栏底部固定，避免被键盘遮挡
- **文件：** `src/components/Layout.tsx`、`src/index.css`
- **验收：** 移动端操作流畅，无遮挡问题

### E4. 键盘快捷键帮助优化
- **现状：** KeyboardHelp 是静态面板，显示当前页面的快捷键
- **修改：** 添加搜索功能，支持模糊匹配快捷键
- **文件：** `src/components/KeyboardHelp.tsx`
- **验收：** 输入 "undo" 可找到 Ctrl+Z 快捷键

### Phase E 交付物
- [ ] PWA 离线验证报告
- [ ] 大数据量优化代码 + 测试
- [ ] （可选）移动端滑动导航
- [ ] （可选）快捷键搜索功能

---

# v9.0 迭代计划（2026-06-18）

> **版本：** v9.0.0
> **更新日期：** 2026-06-18
> **状态：** 已完成
> **基线版本：** v8.1.0（2580 单元测试 / ESLint 零错误 / TypeScript strict 零错误 / Build 611ms）

## 概述

本次 v9.0 迭代围绕「动画与交互修复」「学习路径系统优化」「可视化界面美化」「功能内容拓展」四大方向展开，目标是修复 v8.x 遗留的可视化定位异常、完善学习路径跟踪与推荐机制、美化核心可视化界面、并拓展教学内容深度。

迭代完成后，单元测试从 2580 增长至 2866（新增 286 个），ESLint 与 TypeScript strict 检查均零错误，生产构建成功（808ms），bundle 预算符合规范。本次迭代未引入新的依赖，所有改动均基于现有技术栈（React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4）。

### 迭代范围

| 方向 | 优先级 | 核心目标 |
|------|--------|----------|
| 动画与交互修复 | P0 | 修复可视化主体定位异常、补齐遍历动画延迟启动 |
| 学习路径系统优化 | P1 | 修复数据同步、完善进度跟踪与路径推荐 |
| 可视化界面优化 | P1 | 美化字典树/图矩阵/复杂度对比区域 |
| 功能内容拓展 | P2 | 新增 3 个学习模块、内容分层 UI |

---

## 问题清单与优先级

| 编号 | 问题描述 | 优先级 | 所属 Phase | 状态 |
|------|----------|--------|-----------|------|
| P1-001 | 数组可视化主体定位异常（左上角问题） | P0 | Phase 1 | ✅ 已解决 |
| P1-002 | 栈可视化主体定位异常 | P0 | Phase 1 | ✅ 已解决 |
| P1-003 | 队列可视化主体定位异常 | P0 | Phase 1 | ✅ 已解决 |
| P1-004 | 链表可视化主体定位异常 | P0 | Phase 1 | ✅ 已解决 |
| P1-005 | 堆可视化主体定位异常 | P0 | Phase 1 | ✅ 已解决 |
| P1-006 | 二叉树遍历动画无延迟启动，用户难以感知动画开始 | P0 | Phase 1 | ✅ 已解决 |
| P1-007 | 缺少统一的可视化布局工具函数，各 visualizer 重复实现 | P0 | Phase 1 | ✅ 已解决 |
| P2-001 | 学习路径数据更新机制不健全，跨实例不同步 | P1 | Phase 2 | ✅ 已解决 |
| P2-002 | 缺少数据同步状态提示，用户无法感知同步过程 | P1 | Phase 2 | ✅ 已解决 |
| P2-003 | 悬停信息框信息层级混乱，可读性差 | P1 | Phase 2 | ✅ 已解决 |
| P2-004 | 缺少学习进度跟踪与可视化展示 | P1 | Phase 2 | ✅ 已解决 |
| P2-005 | 缺少路径推荐机制 | P1 | Phase 2 | ✅ 已解决 |
| P3-001 | 图算法区域存在多余横线，影响视觉一致性 | P1 | Phase 3 | ✅ 已解决 |
| P3-002 | 字典树可视化效果单调，缺乏视觉层次 | P1 | Phase 3 | ✅ 已解决 |
| P3-003 | 图矩阵与邻接表 UI 信息密度低、可读性差 | P1 | Phase 3 | ✅ 已解决 |
| P3-004 | 复杂度对比区域配色单一、缺少颜色图例 | P1 | Phase 3 | ✅ 已解决 |
| P4-001 | 学习模块内容深度不足，缺少复杂度分析模块 | P2 | Phase 4 | ✅ 已解决 |
| P4-002 | 缺少高级数据结构学习模块 | P2 | Phase 4 | ✅ 已解决 |
| P4-003 | 缺少实际应用场景学习模块 | P2 | Phase 4 | ✅ 已解决 |
| P4-004 | 学习内容缺少分层机制，初/中/高级用户难以区分 | P2 | Phase 4 | ✅ 已解决 |

---

## Phase 1：动画与交互修复（P0）

**目标：** 修复可视化主体定位异常问题，统一布局工具函数，补齐二叉树遍历动画延迟启动机制。

### 任务 1.1：创建公共居中工具函数
- **背景：** 各 visualizer 各自实现 viewBox 计算与居中逻辑，存在重复代码且部分实现存在定位偏差
- **实现：** 创建 `src/utils/visualizerLayout.ts`，提供三个核心函数
  - `getViewBoxSize()`：根据容器尺寸获取标准 viewBox
  - `calculateCenterStart()`：计算居中起始坐标
  - `clampNonNegative()`：保证坐标非负，避免 SVG 渲染异常
- **新增文件：** `src/utils/visualizerLayout.ts`

### 任务 1.2：应用居中工具到 visualizer
- **实现：** 将公共工具函数应用到 array/stack/queue/heap 四个 visualizer，替换原有重复实现
- **修改文件：**
  - `src/visualizers/arrayVisualizer.ts`
  - `src/visualizers/stackVisualizer.ts`
  - `src/visualizers/queueVisualizer.ts`
  - `src/visualizers/heapVisualizer.ts`

### 任务 1.3：二叉树遍历动画延迟启动
- **背景：** 用户点击遍历后动画立即执行，难以感知动画开始时刻
- **实现：**
  - 新增 1500ms 延迟启动机制
  - 创建加载指示器组件 `AnimationDelayIndicator`，在延迟期间显示
- **新增文件：** `src/components/AnimationDelayIndicator.tsx`
- **修改文件：** `src/pages/TreePage.tsx`、`src/visualizers/treeVisualizer.ts`

### 任务 1.4：补充单元测试
- **新增测试：**
  - `visualizerLayout.test.ts`：31 个测试覆盖三个工具函数
  - `AnimationDelayIndicator` 相关测试：12 个测试覆盖延迟启动逻辑
- **新增文件：** `src/__tests__/visualizerLayout.test.ts`

---

## Phase 2：学习路径系统优化（P1）

**目标：** 修复学习路径数据同步问题，完善进度跟踪与路径推荐机制，提升学习体验。

### 任务 2.1：修复学习路径数据更新机制
- **背景：** 多个 LearningPath 实例间数据不同步，导致进度更新滞后
- **实现：** 通过 CustomEvent 广播实现跨实例同步
- **修改文件：** `src/components/LearningPath.tsx`、`src/hooks/useLearningProgress.ts`

### 任务 2.2：添加数据同步状态提示
- **实现：**
  - 新增 SyncStatus 组件显示同步状态
  - 集成 Toast 通知同步结果
- **修改文件：** `src/components/LearningPath.tsx`、`src/components/Toast.tsx`

### 任务 2.3：重新设计悬停信息框
- **实现：** 三层信息层级设计
  - 标题层：14px，粗体
  - 描述层：12px，常规
  - 进度层：10px，次要色
- **修改文件：** `src/components/LearningPath.tsx`

### 任务 2.4：实现学习进度跟踪与可视化
- **实现：** 创建 `ProgressOverview` 组件，包含
  - 进度环展示总体完成度
  - 统计卡片展示已完成/进行中/未开始数量
  - 目标设定功能
- **新增文件：** `src/components/ProgressOverview.tsx`
- **新增测试：** `src/__tests__/ProgressOverview.test.tsx`

### 任务 2.5：实现路径推荐
- **实现：** 创建 `learningRecommender.ts`，提供
  - 三级优先级推荐（高/中/低）
  - 7 种个性化建议类型
- **新增文件：** `src/utils/learningRecommender.ts`
- **新增测试：** `src/__tests__/learningRecommender.test.ts`
- **修改文件：** `src/components/LearningRecommendations.tsx`

---

## Phase 3：可视化界面优化（P1）

**目标：** 美化核心可视化界面，提升信息密度与视觉层次。

### 任务 3.1：移除图算法区域多余横线
- **实现：** 通过 `Visualizer` 组件的 `className="!border-b-0"` 移除底部多余边框
- **修改文件：** `src/pages/GraphAlgorithmPage.tsx`

### 任务 3.2：美化字典树可视化
- **实现：**
  - 使用 `radialGradient` 实现 3D 球面节点效果
  - 添加节点阴影增强立体感
  - 使用贝塞尔曲线连接节点
  - 新增 `computeSubtreeWidth` 函数优化节点布局
- **修改文件：** `src/visualizers/trieVisualizer.ts`

### 任务 3.3：重新设计图矩阵与邻接表 UI
- **实现：**
  - 表头 sticky 定位，长列表可滚动浏览
  - 响应式网格布局适配不同屏幕
  - 颜色编码区分节点关系类型
- **修改文件：** `src/pages/GraphPage.tsx`

### 任务 3.4：重新设计复杂度对比区域
- **实现：**
  - 8 色调色板区分不同复杂度类别
  - 表格视图与图表视图切换
  - 颜色图例说明
- **修改文件：** `src/components/ComplexityChart.tsx`、`src/components/ColorLegend.tsx`、`src/pages/SortComparePage.tsx`

---

## Phase 4：功能内容拓展（P2）

**目标：** 拓展学习模块内容深度，提供内容分层机制满足不同水平用户。

### 任务 4.1：新增 3 个学习模块配置
- **实现：** 创建三个学习配置文件
  - 复杂度分析模块
  - 高级数据结构模块
  - 实际应用场景模块
- **新增文件：**
  - `src/configs/learning/complexityAnalysis.config.ts`
  - `src/configs/learning/advancedDataStructures.config.ts`
  - `src/configs/learning/realWorldApplications.config.ts`
- **修改文件：** `src/configs/learning/index.ts`（注册新配置）

### 任务 4.2：创建内容分层 UI 组件
- **实现：** 创建 `ContentTier` 组件，支持初/中/高级切换
- **新增文件：** `src/components/ContentTier.tsx`
- **新增测试：** `src/__tests__/ContentTier.test.tsx`

### 任务 4.3：集成内容分层到核心页面
- **实现：** 将 ContentTier 集成到 5 个核心数据结构页面
- **修改文件：**
  - `src/pages/ArrayPage.tsx`
  - `src/pages/StackPage.tsx`
  - `src/pages/QueuePage.tsx`
  - `src/pages/LinkedListPage.tsx`
  - `src/pages/TreePage.tsx`

---

## 预期成果与验收标准

### 功能验收标准

| 验收项 | 验收标准 | 状态 |
|--------|----------|------|
| 可视化定位 | 数组/栈/队列/链表/堆可视化主体居中显示，无左上角偏移 | ✅ 通过 |
| 遍历动画延迟 | 二叉树遍历动画延迟 1500ms 启动，期间显示加载指示器 | ✅ 通过 |
| 学习路径同步 | 多个 LearningPath 实例间数据实时同步 | ✅ 通过 |
| 同步状态提示 | 数据同步过程有 Toast 提示 | ✅ 通过 |
| 悬停信息框 | 三层信息层级清晰可读 | ✅ 通过 |
| 进度跟踪 | ProgressOverview 正确展示进度环与统计卡片 | ✅ 通过 |
| 路径推荐 | learningRecommender 输出三级优先级推荐 | ✅ 通过 |
| 图算法区域 | 无多余横线，视觉一致 | ✅ 通过 |
| 字典树美化 | 节点呈 3D 球面效果，曲线连接 | ✅ 通过 |
| 图矩阵 UI | sticky 表头 + 响应式网格 + 颜色编码 | ✅ 通过 |
| 复杂度对比 | 8 色调色板 + 表格视图 + 颜色图例 | ✅ 通过 |
| 学习模块 | 3 个新模块配置可访问 | ✅ 通过 |
| 内容分层 | ContentTier 初/中/高级切换正常 | ✅ 通过 |

### 质量验收标准

| 验收项 | 验收标准 | 实际结果 | 状态 |
|--------|----------|----------|------|
| 单元测试数量 | ≥ 2860 | 2866 | ✅ 通过 |
| 单元测试通过率 | 100% | 100% | ✅ 通过 |
| ESLint 错误数 | 0 | 0 | ✅ 通过 |
| TypeScript strict 错误 | 0 | 0 | ✅ 通过 |
| 新增测试覆盖 | ≥ 280 | 286 | ✅ 通过 |

### 性能验收标准

| 验收项 | 验收标准 | 实际结果 | 状态 |
|--------|----------|----------|------|
| 生产构建 | 构建成功 | 成功 | ✅ 通过 |
| 构建耗时 | < 1500ms | 808ms | ✅ 通过 |
| Bundle 预算 | index < 80KB / vendor-react < 250KB / vendor-d3 < 60KB | 符合 | ✅ 通过 |

---

## 新增文件清单（v9.0）

| 文件路径 | 用途 | 所属 Phase |
|----------|------|-----------|
| `src/utils/visualizerLayout.ts` | 公共可视化布局工具函数（getViewBoxSize/calculateCenterStart/clampNonNegative） | Phase 1 |
| `src/components/AnimationDelayIndicator.tsx` | 二叉树遍历动画延迟启动加载指示器 | Phase 1 |
| `src/__tests__/visualizerLayout.test.ts` | visualizerLayout 工具函数单元测试（31 个） | Phase 1 |
| `src/components/ProgressOverview.tsx` | 学习进度跟踪与可视化（进度环/统计卡片/目标设定） | Phase 2 |
| `src/__tests__/ProgressOverview.test.tsx` | ProgressOverview 组件单元测试 | Phase 2 |
| `src/utils/learningRecommender.ts` | 路径推荐引擎（三级优先级 + 7 种个性化建议） | Phase 2 |
| `src/__tests__/learningRecommender.test.ts` | learningRecommender 单元测试 | Phase 2 |
| `src/configs/learning/complexityAnalysis.config.ts` | 复杂度分析学习模块配置 | Phase 4 |
| `src/configs/learning/advancedDataStructures.config.ts` | 高级数据结构学习模块配置 | Phase 4 |
| `src/configs/learning/realWorldApplications.config.ts` | 实际应用场景学习模块配置 | Phase 4 |
| `src/components/ContentTier.tsx` | 内容分层 UI 组件（初/中/高级切换） | Phase 4 |
| `src/__tests__/ContentTier.test.tsx` | ContentTier 组件单元测试 | Phase 4 |

---

## 修改文件清单（v9.0）

| 文件路径 | 修改内容 | 所属 Phase |
|----------|----------|-----------|
| `src/visualizers/arrayVisualizer.ts` | 应用 visualizerLayout 公共工具函数修复定位 | Phase 1 |
| `src/visualizers/stackVisualizer.ts` | 应用 visualizerLayout 公共工具函数修复定位 | Phase 1 |
| `src/visualizers/queueVisualizer.ts` | 应用 visualizerLayout 公共工具函数修复定位 | Phase 1 |
| `src/visualizers/heapVisualizer.ts` | 应用 visualizerLayout 公共工具函数修复定位 | Phase 1 |
| `src/visualizers/treeVisualizer.ts` | 新增 1500ms 延迟启动机制 | Phase 1 |
| `src/pages/TreePage.tsx` | 集成 AnimationDelayIndicator 组件 | Phase 1 |
| `src/components/LearningPath.tsx` | CustomEvent 广播同步 + SyncStatus + 三层悬停信息框 | Phase 2 |
| `src/hooks/useLearningProgress.ts` | 数据同步机制优化 | Phase 2 |
| `src/components/Toast.tsx` | 集成同步状态通知 | Phase 2 |
| `src/components/LearningRecommendations.tsx` | 集成 learningRecommender 推荐结果 | Phase 2 |
| `src/pages/GraphAlgorithmPage.tsx` | Visualizer 添加 `!border-b-0` 移除多余横线 | Phase 3 |
| `src/visualizers/trieVisualizer.ts` | radialGradient 3D 球面 + 阴影 + 贝塞尔曲线 + computeSubtreeWidth | Phase 3 |
| `src/pages/GraphPage.tsx` | 图矩阵与邻接表 UI 重新设计（sticky + 响应式 + 颜色编码） | Phase 3 |
| `src/components/ComplexityChart.tsx` | 8 色调色板 + 表格视图 + 颜色图例 | Phase 3 |
| `src/components/ColorLegend.tsx` | 颜色图例组件适配 | Phase 3 |
| `src/pages/SortComparePage.tsx` | 集成新的复杂度对比 UI | Phase 3 |
| `src/configs/learning/index.ts` | 注册 3 个新学习模块配置 | Phase 4 |
| `src/pages/ArrayPage.tsx` | 集成 ContentTier 内容分层 | Phase 4 |
| `src/pages/StackPage.tsx` | 集成 ContentTier 内容分层 | Phase 4 |
| `src/pages/QueuePage.tsx` | 集成 ContentTier 内容分层 | Phase 4 |
| `src/pages/LinkedListPage.tsx` | 集成 ContentTier 内容分层 | Phase 4 |
| `src/pages/TreePage.tsx` | 集成 ContentTier 内容分层 | Phase 4 |

---

# v10.0 迭代计划（2026-06-19）

> **版本**: v10.0
> **日期**: 2026-06-19
> **目标**: 全面深度审查 + UI 升级统一 + 本地打开修复 + 全量测试覆盖 + GitHub 部署
> **执行原则**: 最小修改、不扩展需求、不猜测、不伪造结果

---

## 一、当前状态审查总结

### 1.1 项目概况
- **技术栈**: React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4
- **规模**: 13 个页面、11 个数据结构、11 个可视化器、87+ 测试文件、2978 单元测试
- **部署**: GitHub Pages，base path `/Data-Structures-Visualized/`
- **主题系统**: 4 套色主题（default/forest/warm/royal）× 明暗模式

### 1.2 审查发现的问题清单

#### A. 本地打开（file://）显示异常 — 严重度: 🔴 高

| 问题点 | 文件 | 原因 |
|--------|------|------|
| 资源路径绝对化 | `vite.config.js:68` | `base: '/Data-Structures-Visualized/'` 导致 file:// 下无法加载 JS/CSS |
| 路由不兼容 | `src/App.tsx:37` | `BrowserRouter basename="/Data-Structures-Visualized"` 在 file:// 下失效 |
| CSP 限制 | `index.html:8` | `default-src 'self'` 可能阻止 file:// 资源加载 |
| PWA SW 冲突 | `vite.config.js:23-66` | Service Worker 在 file:// 协议下不工作 |
| 404 重定向 | `public/404.html` | 依赖 HTTP 协议，file:// 下无效 |

#### B. 首页配色与主题不一致 — 严重度: 🟠 中高

| 问题点 | 文件 | 现状 |
|--------|------|------|
| 卡片颜色硬编码 | `src/pages/Home.tsx:9-12` | `ACCENT_COLORS` 只有 blue/amber，不随主题变化 |
| 卡片配色单一 | `src/pages/Home.tsx:18-31` | 13 个卡片中 10 个用 blue，3 个用 amber，缺乏层次 |
| Card 渐变硬编码 | `src/components/Card.tsx:31-35` | `from-blue-100 to-blue-50` 不随主题变化 |
| 侧边栏激活色硬编码 | `src/components/Sidebar.tsx:90` | `bg-accent-blue/12 text-blue-800` 不随主题变化 |
| 进度环颜色硬编码 | `src/components/ProgressOverview.tsx:93` | `text-accent-blue` 固定蓝色 |
| 暗色背景不统一 | 多处 | Layout 用 `bg-slate`，Home 用 `bg-dark-paper`，Sidebar 用 `bg-white` |

#### C. UI 风格一致性问题 — 严重度: 🟡 中

| 问题点 | 文件 | 现状 |
|--------|------|------|
| 背景色混用 | Layout/Sidebar/ProgressOverview | `bg-white`/`bg-slate`/`bg-surface` 混用，未统一语义化 |
| 文字色硬编码 | Sidebar.tsx:90 | `text-blue-800 dark:text-blue-300` 应为主题感知 |
| 卡片渐变未主题化 | Card.tsx | 渐变色用 Tailwind 原生色，不随 4 套主题变化 |
| 部分组件未用 token | ProgressOverview.tsx:52 | `bg-white dark:bg-slate` 应为 `bg-surface dark:bg-dark-surface` |

#### D. 功能与交互 — 严重度: 🟢 低（基本正常）
- 13 个页面路由完整，懒加载正常
- 11 个数据结构状态管理独立，undo/redo 完善
- 动画引擎集中管理，性能降级已实现
- localStorage 持久化正常
- i18n 中英双语完整

---

## 二、详细修复方案

### 2.1 修复本地打开（file://）问题

**方案**: 双模式路由 — 自动检测协议，file:// 下用 HashRouter，http(s):// 下保留 BrowserRouter

**修改文件**:
1. `src/App.tsx` — 增加协议检测，动态选择路由组件
2. `vite.config.js` — 构建配置保持不变（GitHub Pages 需要 base path）
3. `index.html` — 调整 CSP 允许 file:// 协议

**具体实现**:
```tsx
// src/App.tsx
import { lazy, Suspense, useMemo } from 'react'
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom'

function App() {
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:'
  const Router = isFileProtocol ? HashRouter : BrowserRouter
  const routerProps = isFileProtocol ? {} : { basename: '/Data-Structures-Visualized' }

  return (
    <GlobalSettingsProvider>
      <Router {...routerProps}>
        {/* ... */}
      </Router>
    </GlobalSettingsProvider>
  )
}
```

**影响分析**:
- ✅ GitHub Pages 部署不受影响（继续用 BrowserRouter）
- ✅ file:// 直接打开 dist/index.html 可正常工作（用 HashRouter）
- ✅ 现有测试不受影响（测试用 MemoryRouter）
- ⚠️ file:// 下 PWA 功能不可用（预期行为，无需修复）

### 2.2 修复首页配色与主题一致性

**方案**: 让首页卡片颜色随当前主题动态变化，使用主题感知的 CSS 变量

**修改文件**:
1. `src/pages/Home.tsx` — 重构 ACCENT_COLORS 为主题感知
2. `src/components/Card.tsx` — 渐变色改用 CSS 变量
3. `src/components/Sidebar.tsx` — 激活态改用主题感知色
4. `src/components/ProgressOverview.tsx` — 进度环改用主题感知色

**具体实现**:

1. **Home.tsx 卡片配色** — 按数据结构类别分配主题感知色：
```tsx
// 类别化配色，随主题变化
const CATEGORY_COLORS = [
  { accent: 'blue' as CardAccent, badge: 'bg-accent-blue/10 text-accent-blue', iconBg: 'bg-accent-blue/10' },
  { accent: 'amber' as CardAccent, badge: 'bg-accent-amber/10 text-accent-amber', iconBg: 'bg-accent-amber/10' },
  { accent: 'red' as CardAccent, badge: 'bg-accent-rose/10 text-accent-rose', iconBg: 'bg-accent-rose/10' },
]

// 按类别分组：线性结构/树结构/图结构/排序
const structures = [
  { ..., category: 0 },  // 线性: array/stack/queue/linkedlist
  { ..., category: 1 },  // 树: tree/avl/trie/heap
  { ..., category: 2 },  // 图/hash: graph/hash/graph-algorithm
  { ..., category: 0 },  // 排序归到线性类: sort/compare
]
```

2. **Card.tsx 渐变** — 改用 CSS 变量驱动：
```tsx
const gradientClass: Record<CardAccent, string> = {
  blue: 'bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 dark:from-accent-blue/20 dark:to-accent-blue/10',
  amber: 'bg-gradient-to-br from-accent-amber/10 to-accent-amber/5 dark:from-accent-amber/20 dark:to-accent-amber/10',
  red: 'bg-gradient-to-br from-accent-rose/10 to-accent-rose/5 dark:from-accent-rose/20 dark:to-accent-rose/10',
}
```

3. **Sidebar 激活态** — 改用主题感知：
```tsx
const NAV_ITEM_ACTIVE = 'bg-accent-blue/12 dark:bg-accent-blue/20 text-accent-blue dark:text-accent-blue font-semibold'
// 移除硬编码的 text-blue-800 dark:text-blue-300
```

4. **统一暗色背景** — 全部改为 `dark:bg-dark-paper`：
- Layout.tsx: `bg-paper dark:bg-slate` → `bg-paper dark:bg-dark-paper`
- Sidebar.tsx: `bg-white dark:bg-slate` → `bg-surface dark:bg-dark-surface`
- ProgressOverview.tsx: `bg-white dark:bg-slate` → `bg-surface dark:bg-dark-surface`

### 2.3 UI 风格统一与细节提升

**修改文件**: 多个组件

**具体细节**:
1. **统一背景语义**: 所有组件用 `bg-surface dark:bg-dark-surface` 替代 `bg-white dark:bg-slate`
2. **统一文字语义**: 用 `text-ink dark:text-dark-ink` 替代硬编码 `text-blue-800`
3. **卡片悬停效果**: 确保所有卡片有一致的 hover 反馈
4. **按钮反馈**: 确认 `active:translate-x-[1px] active:translate-y-[1px]` 一致
5. **焦点环**: 确认所有交互元素用 `focus-ring` 工具类
6. **间距统一**: 卡片网格 `gap-6`，内边距 `p-5` 保持一致

### 2.4 全量自动化测试覆盖

**测试策略**:
1. **单元测试**: 运行现有 2978 个测试，确保全部通过
2. **Lint 检查**: `npm run lint` 确保 0 错误 0 警告
3. **类型检查**: `npm run typecheck` 确保无类型错误
4. **构建验证**: `npm run build` 确保构建成功且 bundle 达标
5. **E2E 测试**: 启动 dev server，运行 Playwright E2E 测试覆盖所有页面
6. **手动验证**:
   - 明暗模式切换
   - 4 套主题切换
   - 13 个页面功能验证
   - file:// 直接打开验证
   - 移动端响应式

**测试命令**:
```bash
npm run test:run         # 单元测试
npm run lint             # ESLint
npm run typecheck        # TypeScript
npm run build            # 生产构建
node e2e/run-all-tests.js # E2E（需 dev server）
```

### 2.5 GitHub 部署

**部署流程**:
1. 本地验证全部通过
2. `git add` 相关文件
3. `git commit` 规范化提交信息
4. `git push origin main` 推送到 GitHub
5. GitHub Actions 自动触发 CI → 部署到 GitHub Pages
6. 验证线上访问正常

---

## 三、执行计划（分阶段）

### 阶段 1: 本地打开修复（优先级: 🔴 高）
- [ ] 修改 `src/App.tsx` 增加协议检测
- [ ] 调整 `index.html` CSP
- [ ] 构建验证 file:// 可正常打开
- [ ] 验证 GitHub Pages 部署不受影响

### 阶段 2: 配色与主题统一（优先级: 🟠 中高）
- [ ] 重构 `Home.tsx` 卡片配色为主题感知
- [ ] 修改 `Card.tsx` 渐变为主题感知
- [ ] 修改 `Sidebar.tsx` 激活态为主题感知
- [ ] 修改 `ProgressOverview.tsx` 颜色为主题感知
- [ ] 统一所有组件暗色背景为 `dark:bg-dark-paper`/`dark:bg-dark-surface`

### 阶段 3: UI 细节提升（优先级: 🟡 中）
- [ ] 统一语义化 token 使用
- [ ] 检查所有交互元素焦点环
- [ ] 验证卡片悬停效果一致性
- [ ] 检查移动端响应式

### 阶段 4: 全量测试验证（优先级: 🔴 高）
- [ ] 运行单元测试 `npm run test:run`
- [ ] 运行 ESLint `npm run lint`
- [ ] 运行类型检查 `npm run typecheck`
- [ ] 运行生产构建 `npm run build`
- [ ] 运行 E2E 测试 `node e2e/run-all-tests.js`

### 阶段 5: 部署交付（优先级: 🔴 高）
- [ ] 提交代码并推送到 GitHub
- [ ] 验证 CI 通过
- [ ] 验证部署成功
- [ ] 验证线上访问

---

## 四、影响分析（Blast Radius）

### 4.1 修改范围
- `src/App.tsx` - 路由协议检测
- `src/pages/Home.tsx` - 配色重构
- `src/components/Card.tsx` - 渐变主题感知
- `src/components/Sidebar.tsx` - 激活态主题感知
- `src/components/ProgressOverview.tsx` - 颜色主题感知
- `src/index.css` - 可能需要新增 CSS 变量

### 4.2 风险评估
- **协议检测路由**: 低风险，纯逻辑切换
- **配色主题化**: 中风险，涉及多个组件，需全面回归
- **暗色背景统一**: 低风险，仅 CSS 类名替换
- **测试覆盖**: 已通过现有 2978 测试，回归风险可控

### 4.3 回滚方案
- 每个阶段独立 commit，便于逐阶段回滚
- 关键修改可使用 `git revert` 回到上一稳定版本

---

## 五、验证标准

### 5.1 功能验证
- [ ] 13 个数据页面功能正常
- [ ] 11 个数据结构可视化正常
- [ ] 操作日志/撤销/重做正常
- [ ] 主题切换/语言切换正常

### 5.2 UI 验证
- [ ] 4 套主题下配色一致
- [ ] 暗色模式无颜色穿透
- [ ] 焦点环/悬停效果一致
- [ ] 移动端响应式正常

### 5.3 本地打开验证
- [ ] `npm run build` 后 `dist/index.html` 通过 file:// 可访问
- [ ] 路由跳转正常（HashRouter）
- [ ] 资源加载无 404

### 5.4 测试验证
- [ ] 2978 单元测试全部通过
- [ ] ESLint 0 错误
- [ ] TypeScript 0 错误
- [ ] Build 成功，bundle 预算符合

### 5.5 部署验证
- [ ] GitHub Actions CI 全部通过
- [ ] GitHub Pages 部署成功
- [ ] 线上访问 https://jiang-mmm.github.io/Data-Structures-Visualized/ 正常

---

## 六、预期成果

1. **本地兼容性**: file:// 下可正常使用全部功能
2. **视觉一致性**: 4 套主题 × 2 种模式下，UI 元素颜色统一协调
3. **代码质量**: 0 Lint 错误、0 TypeScript 错误、2978 测试通过
4. **部署成功**: GitHub Pages 正常访问

---

# 三版本目标与范围对比

| 维度 | v8.0 (2026-06-17) | v9.0 (2026-06-18) | v10.0 (2026-06-19) |
|------|-------------------|-------------------|---------------------|
| **核心主题** | 工程基础加固 | 体验与教学 | 主题统一 + 本地兼容 |
| **基线测试数** | 2548 | 2580 | 2866 |
| **完成测试数** | 2548 | 2866 | 2978 |
| **主要交付** | E2E 加固 / CI / TS strict | 可视化定位修复 / 学习路径 | file:// 修复 / 主题感知 |
| **关键文件** | tsconfig.json, ci.yml | visualizerLayout.ts | App.tsx (协议检测) |
| **状态** | ✅ 完成 | ✅ 完成 | ✅ 完成 |

---

# 完整执行结果（已合并到 CHANGELOG）

> 详细执行结果已合并到 `CHANGELOG.md` v8.0 / v9.0 / v10.0 条目，工作日志见 `WORKLOG.md` 对应日期。
> 当前版本演进：v8.0 → v9.0 → v10.0 → v11.0.1 → v12.0 → v13.0.0-rc1

---

> **保留理由**：本文档保留了 v8~v10 三个迭代周期的完整问题清单、修复方案、验收标准，作为项目历史参考。如需了解当前活跃迭代，请参阅 `docs/iteration-plan-v11.md` 和根目录 `CHANGELOG.md`。
