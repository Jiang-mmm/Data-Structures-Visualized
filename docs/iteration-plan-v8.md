# ds-visualizer v8.0 迭代计划

> 基于 2026-06-17 全面审查结果制定，覆盖 E2E 加固、功能扩展、工程质量、体验优化、文档发布五大方向。
>
> **当前基线：** 1274 单元测试 / 87 文件 / Lint 零警告 / 构建 611ms / index 80KB / TypeScript 100% / axe-core 零 violations

---

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

**目标：** 提升移动端体验、离线支持、大数椐量性能。

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

## Phase F：文档与发布

**目标：** 文档准确、版本统一、仓库干净。

### F1. README.md 更新
- **现状：** README 可能未反映 v7.0 最新功能
- **修改：**
  - 更新功能列表（图算法、学习模式、a11y、PWA）
  - 更新测试数据（1274 单元测试、E2E 覆盖）
  - 更新截图（使用最新的 e2e/screenshots/）
  - 添加"快速开始"和"开发指南"章节
- **文件：** `README.md`

### F2. CHANGELOG.md 创建
- **内容：** 从 v4.0 到 v7.0 的主要变更历史
- **来源：** WORKLOG.md 中的迭代记录
- **文件：** `CHANGELOG.md`（新建）

### F3. 版本号同步
- **现状：** Sidebar 显示版本号，package.json 有 version 字段
- **修改：** 确保两者一致，更新到 v8.0
- **文件：** `package.json`、`src/components/Sidebar.tsx`

### F4. 截图目录瘦身
- **现状：** e2e/screenshots/ 有 200+ 张截图，很多是调试/审计用途
- **修改：** 删除非测试用途的截图（audit-*、debug-*、check-*、verify-*、layout-*、final-*、full-* 等），保留核心测试套件截图
- **验收：** 截图数量降至 50-80 张

### F5. GitHub Pages 部署验证
- **操作：** 推送代码后验证 deploy workflow 自动触发
- **验收：** https://arrry.github.io/Data-Structures-Visualized/ 可访问

### Phase F 交付物
- [ ] 更新后的 README.md
- [ ] 新建 CHANGELOG.md
- [ ] 版本号 v8.0
- [ ] 清理后的截图目录
- [ ] 部署验证通过

---

## 执行顺序与依赖关系

```
Phase A (E2E 加固)          ← 无依赖，立即开始
  ↓
Phase B (CI/CD 完善)        ← 依赖 A 完成（需要稳定的 E2E 测试）
  ↓
Phase C (TypeScript 严格化) ← 依赖 B（typecheck 脚本需先就位）
  ↓
Phase D (功能扩展)          ← 依赖 C（新代码需符合严格类型）
  ↓
Phase E (体验优化)          ← 可与 D 并行
  ↓
Phase F (文档发布)          ← 所有开发完成后
```

## 预估工作量

| Phase | 预估工时 | 优先级 | 风险 |
|-------|---------|--------|------|
| A. E2E 加固 | 2-3 小时 | P0 | 低 |
| B. CI/CD | 1-2 小时 | P1 | 低 |
| C. TypeScript 严格化 | 8-16 小时 | P1 | 中（改动量大） |
| D. 功能扩展 | 6-10 小时 | P2 | 中 |
| E. 体验优化 | 4-6 小时 | P2 | 低 |
| F. 文档发布 | 2-3 小时 | P3 | 低 |
| **总计** | **23-40 小时** | | |

---

## 验证清单（每个 Phase 完成后）

```bash
npm run typecheck           # TypeScript 类型检查（Phase B 后可用）
npm run lint                # ESLint 检查
npm run test:run            # 单元测试（1274+ 通过）
npm run build               # 生产构建 + bundle 预算检查
node e2e/run-all-tests.js   # E2E 全套（Chromium + Firefox）
```

---

> 本文档随迭代进展持续更新。每个 Phase 完成后更新对应章节的完成状态。
