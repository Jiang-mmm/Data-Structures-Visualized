# v13 路径一：Phase B/C/D 实施真源文档

> **版本:** v1.0  
> **日期:** 2026-06-21  
> **分支:** `feature/v13-code-audit`  
> **前置条件:** Phase A 已完成（commits `0a544a9` + `1cbf9dc`），H2 进度已 stash  
> **来源:** `docs/audit-2026-06-20/audit-merged.md`

---

## 1. 目标与边界

### 1.1 一句话目标
完成 v13 代码体检剩余修复：Phase B（体验 + 工程优化）、Phase C（文档完善）、Phase D（测试 + CI 升级），使项目达到 v13.0.0-rc2 可发布状态。

### 1.2 范围边界

| 做 | 不做 |
|---|---|
| 按 audit-merged.md 修复 P1/P2/P3 问题 | 不扩展 v14+ 架构演进 |
| 修复动画/渲染/a11y/工程化问题 | 不新增数据结构或算法 |
| 同步 6 份项目文档 | 不重构核心状态管理架构 |
| 新增/更新单元测试覆盖改动 | 不改学习模式核心逻辑 |
| CI 增强与 E2E 框架升级 | 不做后端服务 / 用户账号 |

---

## 2. 子阶段拆分

### Phase B：体验 + 工程优化（预计 3~5 天）

#### B1：动画引擎与 useVisualizer 上下文修复
**做什么:**
- 修复 `src/utils/animationEngine.ts`：
  - `currentFPS/speedMultiplier` 从模块单例改为由调用方传入或 context 管理
  - `wait()` 不再重写 `anim.abort`，内部加 `clearTimers()`
  - `applyPreset` 调用 `animRef.current?.abort()`
  - FPS 降级响应时间缩短（`> 100ms` 立即降级）
  - 渲染 > 50ms 时弹 toast
  - `transitionEnd` 在元素被 `remove()` 前调用 `transition.interrupt()`
- 修复 `src/hooks/useVisualizer.ts`：
  - `rafId` 提到 `useRef`
  - `animRef` 管理当前动画，undo/redo/applyPreset 先 abort
  - cleanup 时清理 graph simulation

**验收标准:**
- 切换页面后动画预设不残留
- undo/redo/applyPreset 立即打断当前动画
- 100+ 节点场景下 FPS 降级在 100ms 内触发

**验证:**
- `npm run test:run src/__tests__/hooks/useVisualizer.test.ts`
- `npm run test:run src/__tests__/utils/animationEngine.test.ts`
- 本地手动测试：大数据量排序 + 快速撤销

**不做:**
- 不引入 @react-spring/web 或 motion

---

#### B2：Visualizer 渲染一致性与 Bug 修复
**做什么:**
- `src/visualizers/treeVisualizer.ts`：`positionStore` 改为 `Map<svgElement, Map<dataIndex, pos>>`
- `src/visualizers/graphVisualizer.ts`：
  - `NODE_RADIUS` 改为引用 `DEFAULT_NODE_RADIUS`
  - drag 加 `touch-action: none`
  - cleanup 时停止 simulation
- `src/visualizers/unionFindVisualizer.ts`：
  - 修复 `Array.includes` 对象引用匹配死代码
  - `findRootId` 用 `Map<id, rootId>` 缓存
- `src/visualizers/avlTreeVisualizer.ts` / `trieVisualizer.ts` / `unionFindVisualizer.ts`：
  - `ensureGradientDefs` 去重，避免重复 prepend
- `src/visualizers/arrayVisualizer.ts`：`purgeSVG` 限定白名单，不误删 `__reactProps$xxx`
- 字号/基础时长收敛到 `visualizerConstants.ts` 或 `animationEngine.ts`

**验收标准:**
- Compare 页两棵树位置不互相污染
- 1000 次排序后 defs 数量不再增长
- 图 drag 在移动端可用

**验证:**
- `npm run test:run src/__tests__/visualizers/`
- 本地 dev server 验证 Compare 页、图、并查集

**不做:**
- 不新增 zoom/pan 手势

---

#### B3：a11y 与键盘导航修复
**做什么:**
- `src/components/InfoPanel.tsx`：
  - 自动跳转改为高亮日志项 + 徽标
  - Tab 按钮补全 `role="tablist"/"tab"/"aria-controls"`
  - 移动端折叠按钮 z-index 提升到 z-40
- `src/components/LogPanel.tsx`：
  - embedded 模式去掉 `aria-live`，改 `aria-relevant="additions"`
- `src/visualizers/treeVisualizer.ts` / `avlTreeVisualizer.ts` / `graphVisualizer.ts` / `trieVisualizer.ts`：
  - 维护 parentMap，↑父/↓子/←→兄弟
  - 节点补 `tabindex/role/aria-label/keydown`
  - 焦点环加 `outline: 3px solid var(--color-accent-amber)`
- 边加 `aria-label="Edge ${from} to ${to}, weight ${w}"`
- SpeedControl/UndoRedoBar 加 `aria-keyshortcuts`

**验收标准:**
- axe-core 扫描 17 页 0 violations
- 树/图键盘 ↑↓ 按父/子导航
- InfoPanel 不再强制抢焦点

**验证:**
- `node e2e/test-a11y.js`（需 dev server）
- 键盘手动测试

**不做:**
- 不重构屏幕阅读器完整朗读流

---

#### B4：移动端触控与教学反馈修复
**做什么:**
- `src/components/Sidebar.tsx`：关闭按钮/☰ 按钮升到 44×44；屏幕左缘 24px 内右滑打开
- `src/components/InfoPanel.tsx`：移动端抽屉默认 `flex-1` 占满主区，按钮固定底部
- `src/visualizers/stackVisualizer.ts`：`RECT_WIDTH` 在小屏下自适应
- `src/hooks/useHistory.ts`：undo/redo 先 `abortAnimation()`
- `src/utils/animationEngine.ts`：applyPreset 打断当前动画
- 全局 `Ctrl+Z` 监听跳过 input 聚焦场景
- 错误 toast 显示 `module + operation`

**验收标准:**
- Sidebar 触控按钮 ≥ 44px
- 移动端 InfoPanel 可装下学习内容
- 撤销/预设切换不打断动画问题消失

**验证:**
- 浏览器 DevTools 移动端模拟
- `npm run test:run src/__tests__/hooks/useHistory.test.ts`

**不做:**
- 不新增复杂手势系统

---

### Phase C：文档完善（预计 1~2 天）

#### C1：项目文档一致性修复
**做什么:**
- 对齐 `README.md` / `PROJECT_SUMMARY.md` / `CHANGELOG.md` / `package.json` 版本号与数据（排序算法数量、bundle 预算等）
- 修正 `README.md` 目录树，包含 v12 新增文件
- `CHANGELOG.md` 补充 v4.0-v8.0 历史
- 处理 66 个 lint warnings，分类写入技术债清单

**验收标准:**
- 文档间数字一致
- 无过期引用

**验证:**
- 人工核对 + 文档自检脚本

---

#### C2：API 文档与工程化
**做什么:**
- 为 `validate.ts`、`useHistory.ts`、`animationEngine.ts` 公共 API 补 JSDoc `@example`
- 整理 `docs/iteration-plans/` 目录，归档 v8/v9/v10/v11 计划
- `CODE_WIKI.md` 顶部加版本号
- 加 `.husky/` + `lint-staged` + `commitlint`（可选，如时间紧则延后）
- 加 prettier + `format` 脚本（可选）

**验收标准:**
- 公共 API 有 JSDoc
- 迭代计划目录统一

**验证:**
- `npm run lint`
- 人工检查

**不做:**
- 不生成完整 TypeDoc 站点

---

### Phase D：测试 + CI 升级（预计 2~3 天）

#### D1：E2E 框架升级
**做什么:**
- 新增/迁移至少一个 `.spec.ts` 跑通 Playwright Test
- `e2e/test-a11y.js` PAGES 从 `src/data/searchIndex.ts` 动态生成（覆盖 17 页）
- `e2e/run-all-tests.js` 输出统一 JSON 协议
- Chromium/Firefox 并行执行
- CI 上传 dist/、typecheck、覆盖率结果 artifact

**验收标准:**
- `npx playwright test` 至少 1 个 spec 通过
- a11y 扫描覆盖 17 页
- CI artifacts 可下载

**验证:**
- `npx playwright test`
- 本地 `node e2e/test-a11y.js`

---

#### D2：单测基础设施升级
**做什么:**
- `src/__tests__/setup.js` 迁移为 `setup.ts`，关闭 `allowJs`
- `d3MockHelper.ts` 改进：
  - `vi.fn` 记录参数
  - forceSimulation mock 递归返回 this
- 为 visualizer 添加 jsdom snapshot 测试

**验收标准:**
- `setup.ts` 编译通过
- d3 mock 可断言具体参数

**验证:**
- `npm run test:run`
- `npm run typecheck`

---

#### D3：CI 增强
**做什么:**
- `.github/workflows/ci.yml` 增加 `node e2e/test-a11y.js`
- 跑 `npm ls --depth=0`（Phase A 已加）
- 增加 coverage 可视化 artifact

**验收标准:**
- CI 全绿
- E2E 时间 < 30 分钟

**验证:**
- 本地模拟 CI 步骤

---

## 3. 验收总表

| 维度 | 标准 | 验证命令 |
|---|---|---|
| 单元测试 | 新增 ≥ 50 个测试，全部通过 | `npm run test:run` |
| Lint | 0 errors，warnings 不新增 | `npm run lint` |
| TypeScript | 0 错误 | `npm run typecheck` |
| 构建 | 成功且 bundle 预算通过 | `npm run build` |
| E2E a11y | 17 页 0 violations | `node e2e/test-a11y.js` |
| E2E 核心 | 308/308 passed | `node e2e/run-all-tests.js` |
| 文档 | 6 份核心文档同步 | 人工核对 |

---

## 4. 影响分析

| 模块 | 影响 | 副作用 |
|---|---|---|
| `src/utils/animationEngine.ts` | 动画中断、FPS 降级、wait 清理 | 需全量动画测试 |
| `src/hooks/useVisualizer.ts` | rafId/animRef 管理 | 影响所有可视化页面 |
| `src/hooks/useHistory.ts` | undo/redo 先 abort | 历史操作行为更稳定 |
| `src/visualizers/*` | 位置存储、defs 去重、键盘导航 | 14 个 visualizer 需逐个验证 |
| `src/components/InfoPanel.tsx` | 自动跳转改高亮 | 学习模式交互变化 |
| `src/components/LogPanel.tsx` | aria-live 调整 | 屏幕阅读器行为变化 |
| `src/components/Sidebar.tsx` | 触控尺寸、右滑打开 | 移动端交互变化 |
| `e2e/*` | runner/配置升级 | CI 时间可能变化 |
| 项目文档 | 一致性修复 | 无运行时影响 |

---

## 5. 文档同步清单（路径一全部完成后执行）

- [ ] PROJECT_STATUS.md
- [ ] TODO.md
- [ ] WORKLOG.md
- [ ] PROJECT_SUMMARY.md
- [ ] CHANGELOG.md
- [ ] README.md
- [ ] ARCHITECTURE.md（如体检方法论需更新）
- [ ] CODE_WIKI.md

---

## 6. Git 策略

- 每个子阶段（B1/B2/B3/B4/C1/C2/D1/D2/D3）独立 commit
- commit 信息遵循 conventional commits
- 不 push，等用户确认后统一处理
- 若同一 Bug 连续 3 次修复失败，回滚到上一干净 commit 重新调整方案

---

## 7. 风险与降级

| 风险 | 降级方案 |
|---|---|
| Phase B 范围过大 | B3/B4 部分 P2 问题可移至 Phase C 之后 |
| Playwright Test 迁移阻塞 | 先跑通 1 个 spec，其余维持原 runner |
| a11y 修复引发视觉回归 | 保留 CSS focus 环方案，不改动默认样式 |
| lint warnings 全清影响大 | 仅处理新增 warning，已有 66 个分类记录 |
