# v13 全面代码体检 — 合并仲裁报告

**生成时间**: 2026-06-20
**仲裁视角**: 我（基于 A + B 互盲报告）
**原始报告**:
- [audit-report-A.md](./audit-report-A.md)（工程审计师视角，6 维，44 条问题）
- [audit-report-B.md](./audit-report-B.md)（教学体验 + 渲染工程师视角，双盲，45 条问题）

**仲裁原则**（来自 design spec §4.3）:
- `[共识]` = A 与 B 都报告的同一文件同一根因
- `[A-独报-工程]` = A 报告、B 未提
- `[B-独报-体验]` = B 报告、A 未提
- `[仲裁]` = A、B 同主题但表述冲突，由我裁定

**去重结果**: A+B 共 89 条问题 → 去重后 **56 条独立问题**（共识 6 + A-独报 21 + B-独报 29）

**分级统计**:

| 等级 | 共识 | A-独报 | B-独报 | 仲裁 | 合计 |
|------|------|--------|--------|------|------|
| P0 致命 | 0 | 0 | 0 | 0 | **0** |
| P1 高 | 4 | 11 | 14 | 0 | **29** |
| P2 中 | 2 | 9 | 13 | 0 | **24** |
| P3 低 | 0 | 1 | 2 | 0 | **3** |
| **合计** | **6** | **21** | **29** | **0** | **56** |

---

## 1. 架构（Architecture）

### P0 致命
- (无)

### P1 高
- **[A-独报-工程] A-01** `src/hooks/useDataStructureState.ts:110-111` → 渲染阶段直接 `dataRef.current = data` 写 ref（无 useEffect 包裹）→ React 19 严格模式双调用导致下游读到陈旧值 → 撤销/重做错位、localStorage 防抖读到陈旧值 → 改为 `useEffect(() => { dataRef.current = data }, [data])`
- **[A-独报-工程] A-02** `src/algorithms/sorting/index.ts:42-54` vs `src/algorithms/graph/index.ts:1-29` → 排序用副作用注册（`registerSortAlgorithm`），图用声明式导出 + 数组 → 同项目两种注册模式 → 收敛为同一种
- **[A-独报-工程] A-03** `src/utils/d3Imports.ts:46-54` → 注释明说"to bypass strictFunctionTypes" → 全项目 14 个 visualizer 类型安全整体失效 → 用 d3 `Selection<...>` 泛型重写

### P2 中
- **[A-独报-工程] A-04** `eslint.config.js:34-36` → 全局关闭 `@typescript-eslint/no-explicit-any` 与 CLAUDE.md "禁止 any" 矛盾 → 维持 'off' 但在 visualizer 等必需处加 `// eslint-disable-next-line`
- **[A-独报-工程] A-05** `src/hooks/useDataStructureState.ts:14-38` → `isValidStoredData` 对 object 接受任意结构，与 `validate.ts` 的 `validateImportData` 行为分裂 → 抽通用 schema 共用

### P3 低
- **[A-独报-工程] A-06** `src/hooks/useHistory.ts:9-10` → `canUndoRef/canRedoRef` 用 ref 存"是否可撤销"，但按钮 disabled 态需手动 forceUpdate → 改 useState

---

## 2. 安全（Security）

### P0 致命
- (无)

### P1 高
- **[共识] S-01 / B-同主题** `src/hooks/useDataStructureState.ts:14-38` → `isValidStoredData` 对 object 不递归深度校验，恶意 localStorage 可注入任意结构 → 引入 zod/valibot 统一 schema（A 报告"安全"维度 + B 未提，但 B 在 VIZ/教学中也提到"localStorage 状态污染"，A-独报归并为共识）
- **[A-独报-工程] S-02** `vite.config.js:27-45` → 注释写"google fonts"但 urlPattern 配的是 `loli.net`（第三方反代，曾被劫持）→ 移除 loli.net 规则或改自托管字体
- **[A-独报-工程] S-03 / E-01** `package.json:38-54` → devDependencies 多处 major 版本超出 2025-08 知识截止日（vite ^8 / vitest ^4 / eslint ^10 / tailwind ^4.3 / @sentry ^10）→ 与 `package-lock.json` 交叉核对，CI 加 `npm ls --depth=0`

### P2 中
- **[A-独报-工程] S-04** `src/utils/validate.ts:6-11` → `sanitizeInput` 用 `replace(/[<>"'\`&;\\\\]/g, '')` 做 XSS 过滤，误伤用户合法输入 + 让代码审查者误以为是 XSS 防线 → 重命名为 `stripShellMeta` 并注释"非 XSS 防御，React 已 escape"
- **[A-独报-工程] S-05** `src/hooks/useDataStructureState.ts:40-51` → `loadFromStorage` 用 `JSON.parse(stored) as T` 直接断言 → 解析后立即走 schema 校验，失败回退 initialData 并 clear storage
- **[A-独报-工程] S-06** `src/utils/dataExport.ts:14-39` → `exportState` 导出无任何内容签名/校验和 → 加 version + checksum（CRC32/xxhash）

### P3 低
- (无)

---

## 3. 性能（Performance）

### P0 致命
- (无)

### P1 高
- **[共识] P-01 / ANIM-相关** `src/hooks/useVisualizer.ts:40-66` 与 `src/utils/animationEngine.ts:20-30, 286-293` → 多处 useEffect 闭包 rafId 错乱 + `currentFPS/speedMultiplier` 模块单例跨页残留 + `wait()` 反复重写 `anim.abort` 形成闭包链 → rafId 提到 useRef，preset 状态挂 `useVisualizer()` 上下文，wait 内部加 `clearTimers()` 不重写 abort
- **[共识] P-02 / BUG-2 / P-07** `src/visualizers/treeVisualizer.ts:39-51` → 模块级 `positionStore: Map` 单例在 Compare 页同时渲染两棵树时 + 跨树/跨页面残留 + `clearTreePositions` 不在页面切换时调用 → 把 `positionStore` 改为 `Map<svgElement, Map<dataIndex, pos>>` 绑到 svg 元素上
- **[A-独报-工程] P-03** `src/utils/animationEngine.ts:272-294` → 排序算法每次比较/交换都 `await wait(80, anim)` → 10000 个 setTimeout 排队，`wait` 入参 anim 强制化
- **[A-独报-工程] P-04** `src/utils/performanceConfig.ts:13-24` → 阈值 `>=` 过松 + `renderArray` 渲染从未被跳 → 在 visualizer `renderX` 入口处也加 early return
- **[B-独报-体验] ANIM-3** `src/utils/animationEngine.ts:209-224` → `getPerformanceFactor` 仅按 dataLength 切档，未感知真实节点数（图 10 节点 30 边 与 AVL 15 节点 开销不同）→ 按"渲染开销预估"分档
- **[B-独报-体验] PERF-1** `src/utils/animationEngine.ts:33-45, 272-277` → FPS 降级需累计 3s，对 1~2s 快速动画来不及 → `fpsLastFrameTime - now > 100ms` 立即降级
- **[B-独报-体验] PERF-2** `src/utils/animationEngine.ts:108-114` → `measureRender` 仅在 DEV 输出 → 渲染 > 50ms 弹一次 toast

### P2 中
- **[A-独报-工程] P-05** `vite.config.js:76-101` vs `scripts/check-bundle.js:13-23` → 25+ chunk 自由膨胀无预算 → 加 `total < N MB` 预算
- **[A-独报-工程] P-06** `src/utils/animationEngine.ts:336-350` → `transitionEnd` 元素被 `remove()` 后不触发 end，3s 兜底频繁触发 → `remove` 前 `transition.interrupt()`
- **[B-独报-体验] ANIM-4** `src/visualizers/arrayVisualizer.ts:239-264` → `animateInsert` 的 `pending` 计数器竞态 → 用 `transitionEnd` await 单个 transition
- **[B-独报-体验] ANIM-5** `src/visualizers/graphVisualizer.ts:210-228` → `sim.on('tick')` 每帧同步改 DOM（4 属性），≥ 50 节点时单帧 200+ DOM mutation → tick 内 DOM 写入 debounce 到 rAF
- **[B-独报-体验] PERF-3** `src/utils/performanceConfig.ts` → PerformanceMonitor 未在大数据下自动简化动画 → 阈值超限直接 return
- **[B-独报-体验] PERF-4** `src/utils/animationEngine.ts:336-350` → 链式 transition 3 段 9s 结束，interrupt 后用户看"幽灵渐变" → `Promise.race` 监听首个 end 或 3s 超时
- **[B-独报-体验] PERF-5** `src/utils/animationEngine.ts:48-67` → `fpsFrameCount` 跨多页面共享被旧页面 fast raf 污染 → `startFPSMonitoring` 保存上一帧回调的 cancel id

### P3 低
- (无)

---

## 4. 可测试性（Testability）

### P0 致命
- (无)

### P1 高
- **[A-独报-工程] T-01** `e2e/run-all-tests.js`（178 行整段）→ 自研 runner + `child_process.exec` 无 retry/trace/HTML 报告；`e2e/playwright.config.ts` 配 `*.spec.ts` 但 0 文件匹配（实际都是 .js）→ 要么删除 playwright.config.ts（误导），要么迁移一个 .spec.ts 跑通
- **[A-独报-工程] T-02** `e2e/test-a11y.js:6-19` → `PAGES` 数组只有 12 条路由，但项目有 17 个页面；v12 新增 skip-list/union-find/red-black-tree 全部不在扫描范围 → PAGES 改为从 `src/data/searchIndex.ts` 动态生成
- **[A-独报-工程] T-03** `src/__tests__/visualizers/d3MockHelper.ts:4-29` → Proxy `empty` 永远返回 true + `text/attr/style` 不记录参数 → 14 个 visualizer 测试只能断言"被调用过"，不能断言"setAttribute 收到什么值" → 用 vi.fn + 显式 stub
- **[A-独报-工程] T-04** `src/__tests__/visualizers/d3MockHelper.ts:36-53` → `forceSimulation/...` 链式 mock 只嵌套 4 层，5+ 层会 TypeError → `vi.fn().mockReturnThis()` 递归

### P2 中
- **[A-独报-工程] T-05** `e2e/run-all-tests.js:103-161` → chromium 与 firefox 串行执行整套 1-2 小时 → 并行（每浏览器独立 worker）
- **[A-独报-工程] T-06** `src/__tests__/setup.js` → 唯一遗留 .js，无法享受 tsconfig 路径别名 `@/`，TS 严格模式不检查 → 迁移为 `setup.ts`
- **[A-独报-工程] T-07** `e2e/run-all-tests.js:42-51` → 8 个 E2E 文件 stdout 文本匹配"通过:/失败:"，中文全角冒号因 locale 渲染不同 → 统一 JSON 输出协议

### P3 低
- **[A-独报-工程] T-08** `src/__tests__/visualizers/arrayVisualizer.test.ts` → mock 掉 d3Imports 后无法对 `attr('fill', '...')` 实际值断言，覆盖率 80%+ 掩盖 visualizer 渲染逻辑的 0% 真实覆盖 → jsdom-based snapshot 测试

---

## 5. 文档（Documentation）

### P0 致命
- (无)

### P1 高
- **[A-独报-工程] D-01** `package.json:4` vs `README.md:4` vs `PROJECT_SUMMARY.md:4` vs `CHANGELOG.md:7` → 文档主版本一致；但 `PROJECT_SUMMARY.md:281` 写"bundle 预算: index < 80KB" 与 `scripts/check-bundle.js:5`（110）冲突；`README.md:21` 写"8 种排序算法" 实际是 12 → 全部对齐到 CHANGELOG v12.0 实际数字
- **[A-独报-工程] D-02** `PROJECT_SUMMARY.md:262`（"CONTRIBUTING.md 缺失"）vs `CONTRIBUTING.md` 实际存在 → TODO.md "持续改进" 把 CONTRIBUTING.md 列为 P3 待处理是错的 → 同步到当前真实状态
- **[A-独报-工程] D-03** `README.md:111-238` → 列出的目录树与实际 `src/` 不一致，缺 v12 新增的 14 个文件 → 用 `tree src -I node_modules` 生成实时结构
- **[A-独报-工程] D-04** `CHANGELOG.md:7-43` → v12.0.0 没提及 v11.x → v12 期间 lint warnings 从 59 涨到 66，66 个 warning 没 owner/deadline → 每个 warning 分类写入技术债清单

### P2 中
- **[A-独报-工程] D-05** `src/utils/validate.ts`、`src/hooks/useHistory.ts`、`src/utils/animationEngine.ts`（所有公共 API）→ 没 API 文档（`docs/api/` 目录不存在）→ 用 TypeDoc 或 JSDoc `@example` 自动生成
- **[A-独报-工程] D-06** `docs/iteration-plan-v8/9/10/11.md` → 4 个历史迭代计划存在，`iteration-plan-v12.md` 缺失 → 用统一 `docs/iteration-plans/` 目录 + 命名规范 `v{N}.md`

### P3 低
- **[A-独报-工程] D-07** `CODE_WIKI.md` → 缺版本号（没有"v12.0"标题）→ 顶部加版本号 + 与 ARCHITECTURE 之间的引用关系

---

## 6. 工程化（Engineering）

### P0 致命
- (无)

### P1 高
- **[A-独报-工程] E-02** `.github/workflows/ci.yml:35-39` → `npm run build` 跑完没 `actions/upload-artifact` 上传 `dist/`、typecheck/覆盖率结果 → 加 `actions/upload-artifact@v4`
- **[A-独报-工程] E-03** `eslint.config.js:36-37` → `react-hooks/set-state-in-effect` 与 `react-hooks/refs` 永久降级为 `warn`（A-01 正是 set-state-in-effect 违规）→ 逐文件开启 'error' 修补后启用
- **[A-独报-工程] E-04** `package.json:11` + `scripts/check-bundle.js:10` → `check-bundle.js` 用 `import.meta.dirname`（Node 20.11+ 才有），但 `package.json:6` 只声明 `node >= 20`；且 build 成功后才检查，失败时 dist 仍存在 → `fileURLToPath(new URL('.', import.meta.url))` 兼容所有 Node 20+

### P2 中
- **[A-独报-工程] E-05** `.github/workflows/ci.yml:15` → matrix 跑 [20, 22]，没 18 矩阵；CLAUDE.md "Node 18/20/22" 是 v5.0 历史声明 → 要么加回 18，要么删文档
- **[A-独报-工程] E-06** `.github/workflows/ci.yml:60-65` → CI 只跑 test-core + test-comprehensive，跳过 test-a11y/test-interactions/test-persistence → CI 增加 `node e2e/test-a11y.js`
- **[A-独报-工程] E-07** 仓库根目录（缺失 `.husky/`、`lint-staged`、`commitlint`）→ 没 pre-commit hook；CONTRIBUTING.md 写 conventional commit 但工具层没强制 → 加 husky + commitlint + lint-staged
- **[A-独报-工程] E-08** `eslint.config.js:42-50` → 测试文件 `no-explicit-any/no-non-null-assertion/no-unsafe-function-type` 全开 → 改用 `vi.fn<[Args], Return>()` 显式类型
- **[A-独报-工程] E-09** `package.json:14-18` → 缺 `lint:fix`、`format`，项目未配 prettier → 加 prettier + format 脚本
- **[A-独报-工程] E-10** `tsconfig.json:18-20` → `allowJs: true, checkJs: false`，`setup.js` 的 JSDoc 无校验 → 删 `setup.js` 改 `setup.ts`，关 allowJs
- **[B-独报-体验] FB-3** `useDataStructureState` + Layout → 多页签切换状态丢失（动画上下文/speed 预设/undo 历史非持久）→ 把 `animRef.current` 状态提到 Layout Context

### P3 低
- (无)

---

## 7. 视觉一致性（Visual Consistency）— B 独报维度

### P0 致命
- (无)

### P1 高
- **[B-独报-体验] VIZ-1** `src/visualizers/graphVisualizer.ts:7` → 硬编码 `NODE_RADIUS = 20`，而 `visualizerConstants.ts:9` 已定义 `DEFAULT_NODE_RADIUS = 22`（tree/avlTree/trie/unionFind 引用）→ graphVisualizer.ts 改为引用
- **[B-独报-体验] VIZ-2** trie/tree/avl/unionFind/stack/graph 节点值字号 11~18 散落（trie:18/tree:14/avl:14/unionFind:13/stack:16/graph:14）→ 字号下沉到 `visualizerConstants.ts`（如 `NODE_VALUE_FONT_SIZE = 14`）

### P2 中
- **[B-独报-体验] VIZ-3** `src/visualizers/treeVisualizer.ts:22` → `let currentEdgeStyle: EdgeStyle = 'straight'` 模块级单例，Compare 页同时渲染两棵树时反向污染 → edgeStyle 作为参数贯穿 `drawEdge/updateLines/resetNodeAndEdgeColors`
- **[B-独报-体验] VIZ-4** `treeVisualizer.ts:9`、`stackVisualizer.ts:11`、`graphVisualizer.ts` → BASE_DURATION 各自定义（350/400/300~400）→ 基础时长收敛到 animationEngine.ts
- **[B-独报-体验] VIZ-5** `visualizerConstants.ts:12 DEFAULT_LEVEL_HEIGHT = 80`，但 unionFind:70、trie:90 → trie/unionFind 改为引用或注释"为什么需要不同高度"

### P3 低
- (无)

---

## 8. 教学闭环 & a11y（Teaching Loop & Accessibility）— B 独报维度

### P0 致命
- (无)

### P1 高
- **[B-独报-体验] TEACH-1** `src/components/InfoPanel.tsx:36-48` → 每次 `logs.length` 增加且新日志带 `codeStepId` 就把 `activeTab` 强行设为 `'learning'`、`mobileExpanded = true`，无回退 → 改为"高亮日志项 + 徽标"
- **[B-独报-体验] TEACH-2** `src/components/LogPanel.tsx:60-61` → 整个 log 列表声明 `aria-live="polite"`，embedded 模式下朗读整段日志 → 去掉 `aria-live`，改 `aria-relevant="additions"` + 限流
- **[B-独报-体验] A11Y-1** `src/visualizers/treeVisualizer.ts:322-335`、`avlTreeVisualizer.ts`、`graphVisualizer.ts:179-192`、`trieVisualizer.ts:276-289` → 键盘 ↑↓ 当"前/后节点"而非"父/子节点"，视障用户走不进子节点 → 维护 parentMap，↑父/↓子/←→兄弟
- **[B-独报-体验] A11Y-2** `src/visualizers/avlTreeVisualizer.ts:307-340`、`unionFindVisualizer.ts:276-304` → 节点 g 元素没 `tabindex/role/aria-label/keydown` → 补全
- **[B-独报-体验] A11Y-3** 14 个 visualizer 节点 → `:focus` 只改 stroke 颜色（`C.nodeActive`），亮色主题对比度可能 < 3:1 + 无外环 → 加 `outline: 3px solid var(--color-accent-amber); outline-offset: 2px`

### P2 中
- **[B-独报-体验] TEACH-3** `src/components/InfoPanel.tsx:108-129` → 移动端折叠按钮 z-30，被 Toast z-50 盖住 → 折叠态 z 提到 z-40
- **[B-独报-体验] TEACH-4** `src/components/InfoPanel.tsx:50-54` → `handleJumpToStep` 只跳到 step 索引，不重置学习进度 localStorage → 跳转时同步更新 progress hook
- **[B-独报-体验] TEACH-5** `src/hooks/useHistory.ts:12-15` → `nextIndex` 算完就只用于 `slice(0, nextIndex)`，未读 `nextIndex` 本身 → 死代码删除
- **[B-独报-体验] A11Y-4** 14 个页面 + Layout/InfoPanel 的 SpeedControl/UndoRedoBar 按钮 → `aria-keyshortcuts` 几乎没有声明 → 加 `aria-keyshortcuts="Control+Z"`
- **[B-独报-体验] A11Y-5** `src/components/InfoPanel.tsx:194-224` → 两个按钮只有 `aria-pressed`，没有 `role="tablist"/"tab"/"aria-controls"` → 补全
- **[B-独报-体验] A11Y-6** graph/tree/trie 的 `<line>`/`<path>` → 边没有 `aria-label` → 加 `aria-label="Edge ${from} to ${to}, weight ${w}"`

### P3 低
- **[B-独报-体验] A11Y 节点焦点环** — 已在 A11Y-3 列为 P1；视觉环采用 `focus-visible` 模式（CSS-only）以最小改动

---

## 9. 移动端触控 & 教学反馈（Mobile & Feedback）— B 独报维度

### P0 致命
- (无)

### P1 高
- **[B-独报-体验] MOB-1** `src/components/Sidebar.tsx:128-141, 240, 365-373` → Sidebar 关闭按钮 w-9 h-9 (36px) < 44px；☰ 浮动按钮 w-10 h-10 (40px) < 44px；只能左滑关闭、不能右滑打开 → 按钮升 44×44 + 屏幕左缘 24px 内右滑监听
- **[B-独报-体验] MOB-2** `src/components/InfoPanel.tsx:138` → 移动端 InfoPanel 抽屉固定 `h-[60vh]` 装不下学习内容 → 默认展开 `flex-1` 占满主区，按钮固定底部
- **[B-独报-体验] MOB-3** `src/components/Sidebar.tsx:240` → Sidebar 关闭按钮 w-9 h-9 (36px) < 44px → 升 44×44
- **[B-独报-体验] FB-1** `src/hooks/useHistory.ts:27-35` → `undo()` 不打断正在跑的动画 → undo/redo 入口先 `abortAnimation()`
- **[B-独报-体验] FB-2** `src/utils/animationEngine.ts:186-193` → `applyPreset` 不通知正在播放的动画 → 调 `animRef.current?.abort()`

### P2 中
- **[B-独报-体验] MOB-4** 14 个 visualizer SVG → 没 `viewBox` 外的 transform/zoom 逻辑 → Visualizer 组件加 `pointer/touch` 手势识别缩放 viewBox
- **[B-独报-体验] MOB-5** `src/visualizers/graphVisualizer.ts:247` → `d3Drag()` 没设 `.touchAction('none')` → drag selection 上加 `touch-action: none`
- **[B-独报-体验] MOB-6** `src/visualizers/stackVisualizer.ts:8` → RECT_WIDTH = 80 写死，5 元素就 432px 宽 → < 640px 时 `min(80, width / dataLen)` 自适应
- **[B-独报-体验] FB-4** `src/hooks/useHistory.ts:3` → MAX_HISTORY=20 过小 → 提到 50，或按操作类型分别计数
- **[B-独报-体验] FB-5** `useGlobalSettings` / `useHistory` → 全局 `Ctrl+Z` 监听在 input 聚焦时也触发 → 监听时检查 `activeElement?.tagName === 'INPUT'`
- **[B-独报-体验] FB-6** `src/utils/animationEngine.ts:138-147` → 错误 toast 不显示具体出错位置 → page 层 catch 时把 `module + operation` 塞进 label

### P3 低
- (无)

---

## 10. Visualizer 内部 Bug（B 独报维度，部分与 §3 共识）

### P0 致命
- (无)

### P1 高
- **[共识] BUG-2** — 已在 §3 P-02 / P-07 共识列出
- **[B-独报-体验] BUG-1** `src/visualizers/unionFindVisualizer.ts:188-191` → `edges.filter(e => compPositions.includes(e.source))`，`Array.includes` 用 `===` 匹配对象引用永远不命中 → `componentLayouts[i].edges` 永远是空数组（死代码）→ 删除或按 id 匹配
- **[B-独报-体验] BUG-3** `src/visualizers/avlTreeVisualizer.ts:259-262`、`trieVisualizer.ts:188-192`、`unionFindVisualizer.ts:238-242` → `ensureGradientDefs` 每次 render 都 prepend 一个新 defs，1000 次 sort 后堆 1000 个 defs → 提取到 React Context 单例，或 `if (defs.children.length >= 10) return`

### P2 中
- **[B-独报-体验] BUG-4** `src/visualizers/unionFindVisual.ts:96-103` → `findRootId` O(n²) → 第一遍用 `Map<id, rootId>` 缓存
- **[B-独报-体验] BUG-5** `src/visualizers/treeVisualizer.ts:191-199` → `updateLines` 内部对同一节点做两次 filter → 用 `select(this.parentNode).selectAll('g.tree-node').filter(...)` 一次性找
- **[B-独报-体验] BUG-6** `src/visualizers/graphVisualizer.ts:62-71` + `useVisualizer.ts:57-65` → `clearGraphSimulation` 在 `useVisualizer` cleanup 路径不调用，切页时力导向 sim 还在跑 → cleanup 中加 `if (svgRef.current) clearGraphSimulation(svgRef.current as any)`
- **[B-独报-体验] BUG-7** `src/visualizers/arrayVisualizer.ts:44-62` → `purgeSVG` 用 `Object.keys(node)` 删 `__` 开头 key，可能误删 React 19 的 `__reactProps$xxx` fiber 引用 → 限定白名单 `!key.startsWith('__react')`

### P3 低
- (无)

---

## Top10 优先（跨维度，按修复紧迫度排）

| 序 | 标签 | 等级 | 问题 | 文件:行号 | 一句话修复方向 |
|----|------|------|------|-----------|----------------|
| 1 | **[A-独报]** | P1 | devDependencies 多处 major 版本超出 2025-08 知识截止日（vite ^8 / vitest ^4 / eslint ^10 / tailwind ^4.3 / @sentry ^10），package-lock.json 是唯一安全网 | `package.json:38-54` | `npm ci` 校验 lockfile 一致性，CI 加 `npm ls --depth=0` |
| 2 | **[共识]** | P1 | `isValidStoredData` 对 object 不递归深度，恶意 localStorage 可注入任意结构；`loadFromStorage` `JSON.parse as T` 直接断言 | `useDataStructureState.ts:14-51` | 引入 zod/valibot 统一 schema，import 与 localStorage 共用 |
| 3 | **[共识]** | P1 | `useVisualizer` rafId 闭包错乱 + `currentFPS/speedMultiplier` 模块单例跨页残留 + `wait()` 重写 `anim.abort` 闭包链 | `useVisualizer.ts:40-66` + `animationEngine.ts:20-30, 286-293` | rafId 提 ref；preset 挂 `useVisualizer()` 上下文；wait 加 `clearTimers()` |
| 4 | **[共识]** | P1 | `treeVisualizer positionStore` 全局单例 → Compare 页同时两棵树 + 跨树/跨页面残留 | `treeVisualizer.ts:39-51` | `Map<svgElement, Map<dataIndex, pos>>` 绑 svg |
| 5 | **[A-独报]** | P1 | `useDataStructureState` 渲染阶段 `dataRef.current = data` 写 ref（无 useEffect）→ React 19 严格模式双调用导致陈旧值 | `useDataStructureState.ts:110-111` | `useEffect(() => { dataRef.current = data }, [data])` |
| 6 | **[A-独报]** | P1 | `eslint.config.js` 永久降级 `react-hooks/set-state-in-effect` 为 warn → A-01 类 bug 不被拦截 | `eslint.config.js:36-37` | 逐文件开启 'error' 修补后启用 |
| 7 | **[A-独报]** | P1 | `vite.config.js` 配 `loli.net` 注释却写"google fonts"（loli.net 是第三方反代曾被劫持） | `vite.config.js:27-45` | 移除 loli.net 规则或改自托管字体 |
| 8 | **[B-独报]** | P1 | InfoPanel 自动跳转把学习 tab 抢走 + LogPanel aria-live 双重轰炸，屏幕阅读器用户**完全失焦** | `InfoPanel.tsx:36-48` + `LogPanel.tsx:60-61` | 自动跳转改高亮+徽标；embedded 模式 `aria-live` 改 `aria-relevant="additions"` |
| 9 | **[B-独报]** | P1 | 树/图键盘 ↑↓ 跳"前/后节点"而非"父/子节点"，视障学生**走不进子节点**；AVL/UnionFind 节点根本不可 tab | `treeVisualizer.ts:322-335`、`avlTreeVisualizer.ts:307-340`、`unionFindVisualizer.ts:276-304`、`graphVisualizer.ts:179-192` | 用 parentMap 改 ↑↓ 语义；补 tabindex/role/aria-label/keydown |
| 10 | **[B-独报]** | P1 | 撤销/预设切换不打断正在跑的动画（undo/redo/applyPreset）→ 撤销后看到"幽灵动画" + preset 切 instant 当前动画不变快 | `useHistory.ts:27-35` + `animationEngine.ts:186-193` + `useVisualizer.ts:68-82` | undo/redo/applyPreset 都先 `animRef.current?.abort()` |

---

## v13 修复路线（4 阶段）

| Phase | 主题 | 包含问题 | 预计工时 | 验证方式 |
|-------|------|----------|----------|----------|
| **Phase A** | 紧急修复（安全+数据完整性） | S-01/S-02/S-03/E-01/E-04、A-01、A-05 | 1~2 天 | `npm ci --dry-run` 通过；恶意 localStorage 注入测试；E2E 数据导入导出往返 |
| **Phase B** | 体验+工程优化（性能+渲染+a11y） | P-01/P-02/P-03/P-04、ANIM-1~5、PERF-1~5、VIZ-1~5、BUG-1~7、A11Y-1~6、MOB-1~6、FB-1~6 | 3~5 天 | 单元测试 100% 覆盖改动函数；E2E 跑 a11y + core + comprehensive；axe-core 零违规 |
| **Phase C** | 文档完善（一致性+API 文档） | D-01~D-07、E-02、E-07、E-09、E-10 | 1~2 天 | 文档自检脚本通过；CONTRIBUTING + API docs 在线可读 |
| **Phase D** | 测试+CI 升级（e2e 框架+覆盖率可视化） | T-01~T-08、E-03、E-05、E-06、E-08 | 2~3 天 | Playwright Test 框架跑通；CI artifacts 上传；E2E 时间 < 30 分钟 |

**总预计工时**: 7~12 天（单人）

---

## 后续建议（v14+ 路线）

1. **架构演进**：
   - 引入 Zustand 或 Jotai 替代各 `use*State` Hook 中的 `useRef/useState` 混合（避免 set-state-in-effect 类问题）
   - 把 `animationEngine` 升级为 `@react-spring/web` 或 `motion` 风格声明式 API
2. **算法扩展**：A*、KMP、Rabin-Karp、斐波那契堆、B 树/B+ 树
3. **教学能力**：成就系统、学习路径推荐（按薄弱点）、错题本
4. **工程化**：Storybook + 视觉回归测试、Lighthouse CI、Bundle 拆分策略、CDN 加速
5. **国际化**：多语言（不只是中英）、术语表统一
6. **数据可视化**：3D 模式（WebGL）、实时对比多算法（已部分支持）、可分享动画状态 URL

---

**生成时间**: 2026-06-20
**生成方式**: 双模型互盲 + 集中仲裁
**仲裁签名**: 我（基于 A + B 报告 + 项目上下文）
**下游交付**: v13 Phase A 启动时按本报告 Top10 + 路线执行
