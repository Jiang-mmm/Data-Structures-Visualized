# v13 全面代码体检 — Subagent A 报告（工程审计师视角）

**视角**: 工程审计师
**日期**: 2026-06-20
**审查范围**: d:\VibeCoding\数据结构学习助手3（v12.0.0，HEAD=5532edf）
**方法**: 6 维静态走读，**只读不改**

---

## 1. 架构（Architecture）

### P0 致命
- (无)

### P1 高
- **[A-01]** 文件: `src/hooks/useDataStructureState.ts:110-111` → 根因: 在函数体渲染阶段直接 `dataRef.current = data` 修改 ref（无 useEffect 包裹），React 19 严格模式双调用会导致 ref 在非提交阶段被赋值，下游 `useEffect` 读取到的是"上一帧"值并触发陈旧写入。 → 风险: 撤销/重做状态错位、localStorage 防抖写入读到陈旧值。 → 修复方向: 用 `useEffect(() => { dataRef.current = data }, [data])` 包裹或干脆移除该 ref（`saveToStorage` 已在 effect 中读取最新闭包）。
- **[A-02]** 文件: `src/algorithms/sorting/index.ts:42-54` vs `src/algorithms/graph/index.ts:1-29` → 根因: 排序算法采用模块加载期副作用注册（`registerSortAlgorithm`），图算法却用纯导出 + `graphAlgorithms` 数组声明式注册。同一项目两种"算法可插拔"模式，新人 onboarding 成本翻倍。 → 风险: 添加新图算法需在两处（导出 + 数组）同步；遗漏一边则静默失败。 → 修复方向: 收敛为同一种模式（推荐 sorting 当前的注册式，graph 改用同名 registry）。
- **[A-03]** 文件: `src/utils/d3Imports.ts:46-54` → 根因: 在文件头注释明说"to bypass strictFunctionTypes"，将所有 D3 选择器 cast 为 `any` 后再导出，d3Imports 是全项目 14 个可视化器与所有动画的唯一入口。 → 风险: 类型安全在数据可视化层整体失效，selection.attr(key, val) 的 val 类型为 any，传错类型运行时才报错。 → 修复方向: 用 d3 的 `Selection<BaseType, Datum, ...>` 泛型重写，或在 d3 之上自建窄类型包装，仅在不可避免处用 `unknown` + 守卫。

### P2 中
- **[A-04]** 文件: `eslint.config.js:34-36` → 根因: 全局关闭 `@typescript-eslint/no-explicit-any`；但 CLAUDE.md 又写"禁止 any"。规则与文档矛盾。 → 风险: 11 个 page 的 as any 滥用（CHANGELOG v6.4）就是利用了这个口子。 → 修复方向: 维持 'off'，但在 visualizer 等必需处加 `// eslint-disable-next-line` 注释而非一刀切。
- **[A-05]** 文件: `src/hooks/useDataStructureState.ts:14-38` → 根因: `isValidStoredData` 接受"任意 object/array"（"typeof item === 'object' && item !== null" 直接 return true），没有任何 schema 校验；但 `validate.ts` 的 `validateImportData` 却逐字段严格。 → 风险: 同一份数据从 import 走通不过校验、从 localStorage 恢复却能进状态，行为分裂；构造恶意 JSON 污染状态。 → 修复方向: 把 validate.ts 的 ImportValidationResult 抽成通用 schema，import 路径与 storage 路径共用同一校验函数。

### P3 低
- **[A-06]** 文件: `src/hooks/useHistory.ts:9-10` → 根因: `canUndoRef / canRedoRef` 用 ref 保存"是否可撤销"，但 React 渲染不感知 ref 变化。UndoRedoBar 必须在 click 时才取最新值（ref 闭包正确），但按钮的 disabled 态必须手动 forceUpdate 才能刷新。 → 风险: 按钮 disabled 态与实际状态偶发不同步。 → 修复方向: 用 useState 替代 ref，或在 setState 后调用 forceUpdate。

---

## 2. 安全（Security）

### P0 致命
- (无)

### P1 高
- **[S-01]** 文件: `src/hooks/useDataStructureState.ts:14-38` → 根因: `isValidStoredData` 对 `data` 是 object 时直接 `return true`（仅校验 key 是 string、value 是基本类型/对象/数组，不递归深度检查；对象内部的 `value === 'object'` 视为合法）。 → 风险: 攻击者通过控制台写入 `localStorage.setItem('ds-visualizer-data-X', '{"evil":"...circular"}')` 即可注入任意嵌套结构（原型链、循环引用、Function 字符串等）绕过校验，触发运行时报错甚至类型混淆。 → 修复方向: 引入 schema 校验（如 zod/valibot），或至少递归限制深度 + 显式白名单类型。
- **[S-02]** 文件: `vite.config.js:27-45` → 根因: `urlPattern: /^https:\/\/fonts\.loli\.net\/.*/i`、`urlPattern: /^https:\/\/gstatic\.loli\.net\/.*/i` 的注释却写"google fonts"。`loli.net` 是第三方反代域名（曾经被劫持过），项目是面向中国大学生的教学工具，不应信任非 Google 官方域。 → 风险: 字体被劫持/植入恶意 CSS/字体文件导致 XSS 或隐私泄露；用户访问离线 PWA 时仍会向该域发请求。 → 修复方向: 直接移除 fonts.googleapis.com 之外的字体 CDN 规则；或改用自托管字体（已用 @tailwindcss/vite，应无外部字体依赖）。
- **[S-03]** 文件: `package.json:38-54`（devDependencies 全段） → 根因: 多处版本号超出 2025-08 知识截止时点已发布的范围：`eslint ^10.3.0`（截止时 9.x）、`vite ^8.0.16`（截止时 5-6.x）、`vitest ^4.1.7`（截止时 1-2.x）、`tailwindcss ^4.3.0`（截止时 4.0-4.1）、`autoprefixer ^10.5.0`（截止时 10.4.x）、`jsdom ^29.1.1`（截止时 25.x）、`@types/node ^25.9.3`（截止时 22.x）、`@vitejs/plugin-react ^6.0.1`（截止时 4.x）、`@sentry/react ^10.57.0`（截止时 8-9.x）。 → 风险: 若这些是占位/未来版本，`npm install` 必然失败或拉到不可信镜像；若是手误则埋供应链炸弹（自动取最新 major）。 → 修复方向: 与 package-lock.json 交叉核对实际可解析版本；CI 加 `npm ci --dry-run` 防漂移。

### P2 中
- **[S-04]** 文件: `src/utils/validate.ts:6-11` → 根因: `sanitizeInput` 用 `replace(/[<>"'\`&;\\\\]/g, '')` 做 XSS 过滤，但 React 已经在渲染时 escape，重复过滤只会误伤用户合法输入；且 `&;` 中的 `;` 在 number 上不应被删。 → 风险: 用户输入含 `it's` / `200;300` 会被静默改写；并且作为"XSS 防线"让代码审查者误以为该正则就是防护（实际是 React 的 escaping 在保护）。 → 修复方向: 移除该函数或重命名为 `stripShellMeta`，注释明确"非 XSS 防御，React 已 escape"。
- **[S-05]** 文件: `src/hooks/useDataStructureState.ts:40-51` → 根因: `loadFromStorage` 使用 `JSON.parse(stored) as T` 直接断言，校验函数对 object 类型过松。 → 风险: 跨用户/跨设备共享 localStorage 状态（公共电脑场景）时数据可信度被错误假定为 100%。 → 修复方向: 解析后立即走 schema 校验，失败回退 initialData 并 clear storage。
- **[S-06]** 文件: `src/utils/dataExport.ts:14-39` → 根因: `exportState` 把 `data`（`unknown`）原样 JSON.stringify 后下载，文件名包含 dataType 与时间戳，但无任何内容签名/校验和。 → 风险: 导出的 JSON 被篡改后回 import 同样可绕过 validate.ts 的 schema（因为 validateImportData 只接受 number[]，但 `useDataStructureState` 的 isValidStoredData 接受任意 object——见 S-01）。 → 修复方向: 导出文件加 version + checksum（CRC32/xxhash），import 时比对。

### P3 低
- (无)

---

## 3. 性能（Performance）

### P0 致命
- (无)

### P1 高
- **[P-01]** 文件: `src/hooks/useVisualizer.ts:40-66` → 根因: `let rafId: number` 声明在 useEffect 内部（第 45 行），但 `debouncedUpdate` 的回调（第 46-49 行）通过闭包访问 rafId——闭包在 effect 每次执行时新建，cleanup 时 `cancelAnimationFrame(rafId)` 拿到的是**上一次 effect 闭包里的 rafId**，而非当前 RAF 循环待执行的 id。 → 风险: 窗口 resize 高频触发时，旧的 rafId 已被新 effect 闭包覆盖，cleanup 实际无效；同时多次连续 resize 会调度多个 rAF，全部执行 `updateDimensions` 浪费 CPU。 → 修复方向: 把 rafId 提到 ref，或在 useEffect 内用一个 ref-managed latest-id 模式。
- **[P-02]** 文件: `src/visualizers/arrayVisualizer.ts:44-62`（`purgeSVG`）+ `src/visualizers/treeVisualizer.ts:247-248`（`container.selectAll('*').interrupt().remove()`）→ 根因: 全清+全绘策略在每次状态变化时调用 `selectAll('*').remove()` 删掉全部子节点（DOM 引用 + D3 内部 `__data__` 字段），再 forEach 重建所有 g/rect/circle/text/svg 元素。N 个元素 = 1 次全清 + 4N 次 createElementNS + 4N 次 setAttribute + N 次 insert。 → 风险: 数组 100 元素 = 400 次 createElementNS，每次操作触发；图/树更甚（树一次操作触发完整子树重建）。 → 修复方向: 改为 enter/update/exit 增量更新，或对静态视觉（fill/stroke/text）走 CSS class 切换，仅位置/计数变化时局部 setAttribute。
- **[P-03]** 文件: `src/utils/animationEngine.ts:272-294`（`duration` + `wait`）→ 根因: 排序算法中每次比较/交换都 `await wait(80, anim)` → 创建一个 setTimeout（不进入 `Animation._pendingTimers` 因为没传 anim），GC 与 microtask 队列压力。冒泡排序 100 元素 = O(n²) = ~10000 次 wait → 10000 个 setTimeout 排队。 → 风险: 大数据排序时 `setTimeout` 队列爆炸，主线程被 microtask 切换饿死；performanceConfig 跳过了 50+ 数组动画，但 sort 阈值是 30。 → 修复方向: `wait` 入参 anim 强制化；或合并多次 wait 为单个 rAF；或将所有 wait 写进 `Animation._pendingTimers` 统一管理。
- **[P-04]** 文件: `src/utils/performanceConfig.ts:13-24` → 根因: 阈值是 `>=`（见 `shouldSkipAnimation` 第 42 行），即 size=30 数组 sort 仍执行全动画；并且各 visualizer 重复在函数体写 `if (oldData.length > getLargeDataThreshold('array')) return`（`arrayVisualizer.ts:172`），但**关键路径**（如 `useArrayState.push` 触发的 re-render）依然调用 `renderArray`，**渲染**（DOM 重建）从未被跳——只跳了动画。 → 风险: 数据阈值对真实性能瓶颈（DOM 重建）完全无效，CLAUDE.md 的"数组 50+ 流畅"承诺不成立。 → 修复方向: 在 visualizer `renderX` 入口处也加 early return，或在 useState 层按阈值切到简化渲染分支。

### P2 中
- **[P-05]** 文件: `vite.config.js:76-101` vs `scripts/check-bundle.js:13-23` → 根因: `manualChunks` 只产出 vendor-react / vendor-d3 / i18n-locales / learning-configs 四个固定名字，check-bundle.js 的 BUDGETS 只校验 index / vendor-react / vendor-d3 三个名字（其余 25+ chunk 自由膨胀，CHANGELOG v3.5 提及"主 bundle 495KB→320KB"但未跟进其他 chunk）。 → 风险: 每个 page 的 lazy chunk 可以无限增长，直到触发 `chunkSizeWarningLimit: 250` 才警告。 → 修复方向: 遍历所有 js 统计总 size（目前 ~63KB index + 250KB vendor-react + 60KB vendor-d3 + 25 chunks ≈ 1.5MB+），加一条 `total < N MB` 预算。
- **[P-06]** 文件: `src/utils/animationEngine.ts:336-350`（`transitionEnd`）→ 根因: `transition.on('end', safeResolve).on('interrupt', safeResolve)` + 3000ms 兜底，但 **d3 transition end 事件** 不会在元素已经被 `selectAll('*').remove()` 删除时触发。配合 P-02 的全清策略，链式动画中前一个 transition 等待 end 时元素已被删除 → 3000ms 兜底被频繁触发。 → 风险: 真实 timeout 远小于 3s 但用户体验卡顿。 → 修复方向: 在 remove 前调用 `transition.interrupt()`，并在 selection.empty() 时 short-circuit resolve。

### P3 低
- **[P-07]** 文件: `src/visualizers/treeVisualizer.ts:39-51`（`positionStore: Map`）→ 根因: 模块级单例 Map 在不同 tree 页面共享（HeapPage / TreePage / AvlTreePage 全部 import treeVisualizer）；clearTreePositions 不会在页面切换时调用 → 上一个页面的节点位置会污染下一个页面。 → 风险: 视觉错位；用户以为"插入位置变了"实际是脏数据。 → 修复方向: 把 positionStore 收敛到 useTreeState 内部（ref + 序列化到 state）。

---

## 4. 可测试性（Testability）

### P0 致命
- (无)

### P1 高
- **[T-01]** 文件: `e2e/run-all-tests.js`（178 行整段）→ 根因: 自研 runner + `child_process.exec` 串/并行组合，没有 retry、没有 trace viewer、没有 HTML/JUnit 报告；`e2e/playwright.config.ts` 写得很完整（testDir / workers / reporter / webServer），但因为 testMatch 是 `*.spec.ts` 而当前所有 E2E 都是 `.js`，**配置文件 0 文件匹配，从未运行**。 → 风险: 迁移到 Playwright Test 框架是公开 TODO（PROJECT_SUMMARY "E2E 框架升级" P2），但工程上完全没有迁移验证；新同学看 config 会以为"已迁移"实际没动。 → 修复方向: 要么删除 playwright.config.ts（误导），要么把至少一个测试改成 *.spec.ts 跑通证明流程。
- **[T-02]** 文件: `e2e/test-a11y.js:6-19` → 根因: `PAGES` 数组只有 12 条路由，但项目有 17 个页面。新增的 `/skip-list`、`/union-find`、`/red-black-tree`、`/learning-path` 全部不在 a11y 扫描范围。 → 风险: 三个 v12 新增的可视化页面、含动画/键盘导航/ARIA 的复杂组件，无任何 a11y 覆盖。 → 修复方向: PAGES 改为从 `src/data/searchIndex.ts`（CLAUDE.md 第 41 行）动态生成。
- **[T-03]** 文件: `src/__tests__/visualizers/d3MockHelper.ts:4-29` → 根因: Proxy 的 get trap 在 `prop === 'empty'` 时固定返回 `() => true`，意味着 `sel.empty()` 永远为 true；`text/attr/style` 全部返回 `() => chainable`（不记录调用参数）。 → 风险: 14 个 visualizer 测试无法触发 `if (sel.empty()) return` 的非空分支；测试断言只能是"函数被调用过"（vi 计数），不能断言"setAttribute 收到什么值"。CLAUDE.md "visualizer 渲染" 的测试置信度被高估。 → 修复方向: 用 vi.fn + 显式 stub 替换 Proxy；empty/nodes/size 等返回值用 `vi.fn().mockReturnValue` 暴露为可配置。
- **[T-04]** 文件: `src/__tests__/visualizers/d3MockHelper.ts:36-53`（`mockD3Imports`）→ 根因: `forceSimulation/forceLink/...` 的链式调用被 mock 成 4 层嵌套（line 41 的 `force: vi.fn(() => ({ force: vi.fn(...) }))`），但实际代码可能调 5+ 层（forceX / forceY / iterations 等）。 → 风险: 任何超出 4 层的链式调用得到 `undefined.force(...)` TypeError，测试 fail 信息模糊（"Cannot read property of undefined"）。 → 修复方向: 用 `vi.fn().mockReturnThis()` 递归，或直接 mock `d3` 模块而非 d3Imports。

### P2 中
- **[T-05]** 文件: `e2e/run-all-tests.js:103-161` → 根因: chromium 与 firefox 串行执行（共 5 core + 4 comprehensive = 9 文件 × 2 浏览器 = 18 次 runTest，每次平均 2-5 分钟）。整套跑完 1-2 小时。CI 1 次跑 2 小时是阻塞合并的根因。 → 风险: 开发者本地跳过 E2E 直接合并。 → 修复方向: chromium 与 firefox 并行（每浏览器独立 worker），且 comprehensive 用 `--workers=2` 并行。
- **[T-06]** 文件: `src/__tests__/setup.js`（唯一遗留的 `.js`，CLAUDE.md "tech debt"）→ 根因: jsdom 环境 + jest-dom matchers + SVG mocks 都集中在 .js，无法享受 tsconfig 的路径别名（`@/`）。 → 风险: 测试代码如需 import `@/__tests__/testUtils` 必须写相对路径，且 TS 严格模式对 .js 文件不做检查。 → 修复方向: 迁移为 `setup.ts`，把 SVG mock 拆到独立文件。
- **[T-07]** 文件: `e2e/run-all-tests.js:42-51` → 根因: 只对 `test-comprehensive.js` 一个文件读取 JSON 结果文件，其余 8 个文件仍依赖 stdout 文本匹配 "通过:/失败:"，但中文冒号是全角（`：`）可能因环境 locale 渲染不同。 → 风险: 改文案/换 Node 版本即破坏结果解析。 → 修复方向: 所有 E2E 文件统一 JSON 输出协议。

### P3 低
- **[T-08]** 文件: `src/__tests__/visualizers/arrayVisualizer.test.ts` → 根因: 单元测试 mock 掉 d3Imports 后，无法对 `attr('fill', '...')` 的实际值做断言。CLAUDE.md "测试覆盖 80%+" 的覆盖率数字掩盖了 visualizer 渲染逻辑的 0% 真实覆盖。 → 风险: 视觉回归只能靠 E2E 截图发现，单元测试形同虚设。 → 修复方向: 对关键 visualizer（array/sort/tree）写 jsdom-based snapshot 测试。

---

## 5. 文档（Documentation）

### P0 致命
- (无)

### P1 高
- **[D-01]** 文件: `package.json:4`（version "12.0.0"） vs `README.md:4`（"v12.0"） vs `PROJECT_SUMMARY.md:4`（"v12.0"） vs `CHANGELOG.md:7`（"[v12.0.0]"）→ 根因: 文档主版本一致，但 `CHANGELOG.md:91` 写 "package.json：version 8.0.0 → 11.0.1"——这意味着 8→11→12 跳过了 9/10 之间的某次发布，但 8→11 中间所有 CHANGELOG 条目都齐全（v9.0.0, v10.0.0, v11.0.0, v11.0.1）。CHANGELOG 内部一致。但 `PROJECT_SUMMARY.md:281` 写"bundle 预算: index < 80KB" 与 `scripts/check-bundle.js:5`（110）冲突；`README.md:21` 写"8 种排序算法" 实际是 12。 → 风险: 用户和贡献者根据 README 提交"我新增了第 13 种排序"或"我的 PR 不需要管 chunk 预算"。 → 修复方向: README/PROJECT_SUMMARY 的"8 种/80KB"全部对齐到 CHANGELOG 的 v12.0 实际数字（12 算法 / 110KB 预算）。
- **[D-02]** 文件: `PROJECT_SUMMARY.md:262`（"文档缺口: ⏳ 待处理: CONTRIBUTING.md 缺失"）vs `CONTRIBUTING.md` 实际存在（135 行）→ 根因: TODO.md "持续改进" 表格把 CONTRIBUTING.md 列为 P3 待处理，但文件已存在且内容完整。 → 风险: 工程师按 TODO 接"补 CONTRIBUTING.md"任务，做重复工作。 → 修复方向: TODO.md / PROJECT_SUMMARY.md 的"待处理"清单同步到当前真实状态。
- **[D-03]** 文件: `README.md:111-238`（"项目结构"）→ 根因: 列出的目录树与实际 `src/` 结构不一致——缺少 `useAvlTreeState.ts`、`useRedBlackTreeState.ts`、`useSkipListState.ts`、`useUnionFindState.ts`、`avlTreeVisualizer.ts`、`redBlackTreeVisualizer.ts`、`skipListVisualizer.ts`、`unionFindVisualizer.ts`、`useSharedData.ts`、`useColorTheme.ts`、`useLearningProgress.ts`、`usePageTracker.ts`、`performanceLogger.ts`、`sentry.ts`、`configs/learning/` 子目录等。CLAUDE.md "26 Hooks" 与 README "25 Hooks" 不符。 → 风险: onboarding 路径断——新人按 README 找不到 v12 新增的关键文件。 → 修复方向: 用 `tree src -I node_modules` 生成实时结构，或在 CI 校验文档与文件系统一致。
- **[D-04]** 文件: `CHANGELOG.md:7-43`（v12.0.0 条目）→ 根因: v12.0.0 提到 391 个新测试（"3089 → 3480"），但 v6.4 写 530+ tests、v8.0 写 2548、v9.0 写 2866——CHANGELOG 整体测试数是连续的，但 **v12.0.0 没有提及 v11.x → v12 期间通过的 lint warnings 数从 59 涨到 66**（CHANGELOG v8.0 用了"59 warnings 已有代码模式" 措辞；PROJECT_SUMMARY "持续改进" 没说"消除 7 个新 warning"）。 → 风险: 66 个 warning 没有 owner 与 deadline。 → 修复方向: 每个 warning 分类（react-hooks/exhaustive-deps / no-explicit-any 误用 / 等），写入技术债清单。

### P2 中
- **[D-05]** 文件: `src/utils/validate.ts:1-75`、`src/hooks/useHistory.ts:1-85`、`src/utils/animationEngine.ts:1-447`（所有公共 API）→ 根因: 没有 API 文档（`docs/api/` 目录不存在）；CONTRIBUTING.md 只描述"如何添加"不描述"现有函数签名"。 → 风险: 新人需要逐文件 grep 函数签名。 → 修复方向: 用 TypeDoc 或 TypeScript 自带 JSDoc 自动生成；至少给每个 public 函数补 `@example`。
- **[D-06]** 文件: `docs/iteration-plan-v8.md` / `v9.md` / `v10.md` / `v11.md` → 根因: 4 个历史迭代计划都存在，但 `docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md` 是审计计划而非迭代计划。`iteration-plan-v12.md` 缺失（v12 的迭代计划不知道散落在哪个 .trae spec）。 → 风险: 追溯 v12 决策需要去 CHANGELOG + WORKLOG 拼接。 → 修复方向: 用统一的 `docs/iteration-plans/` 目录 + 命名规范 `v{N}.md`。

### P3 低
- **[D-07]** 文件: `CODE_WIKI.md`（CLAUDE.md 提到）→ 根因: 该文件存在但未在本轮审查中确认结构；与 PROJECT_SUMMARY.md 内容大量重叠（功能矩阵 / 架构图 / 数据流），但缺乏版本号（没有"v12.0"标题）。 → 风险: 多份文档对同一概念（"六层架构"）描述略有差异（CLAUDE.md 写"Entry → Pages → Components → Hooks → Visualizers → Algorithms/Utils" 与 ARCHITECTURE.md 一致；但 README.md:34 写"Entry → Pages → Components → Hooks → Visualizers → Algorithms/Utils" 是同一句）。目前一致是巧合。 → 修复方向: CODE_WIKI.md 顶部加版本号 + 与 ARCHITECTURE 之间的引用关系。

---

## 6. 工程化（Engineering）

### P0 致命
- (无)

### P1 高
- **[E-01]** 文件: `package.json:38-54`（devDependencies）→ 根因: 见 S-03。版本号越界（vite ^8 / vitest ^4 / eslint ^10 / tailwindcss ^4.3 / @sentry ^10）如果 `package-lock.json` 缺失或被 `npm install` 重新生成，会拉取尚未发布的版本。 → 风险: 供应链投毒 / 装包失败 / `npm ci` 在其他开发者机器上不可重现。 → 修复方向: 用 `npm ci` 而不是 `npm install`；把 `package-lock.json` 提交并校验 hash；CI 加 `npm ls --depth=0` 对比预期。
- **[E-02]** 文件: `.github/workflows/ci.yml:35-39` → 根因: `npm run build` 跑完后没有 `actions/upload-artifact` 上传 `dist/`；typecheck/覆盖率结果也没有 artifact。 → 风险: CI fail 时无法下载产物复现；e2e 截图与 bundle analyzer 报告无法追溯。 → 修复方向: 加 `actions/upload-artifact@v4` 上传 dist + coverage + e2e/screenshots。
- **[E-03]** 文件: `eslint.config.js:36-37` → 根因: `react-hooks/set-state-in-effect` 与 `react-hooks/refs` 永久降级为 `warn`。CLAUDE.md 说"既有代码模式"——但 `useDataStructureState.ts:110-111`（见 A-01）正是 set-state-in-effect 模式的典型违规。 → 风险: 规则降级导致 A-01 类 bug 在 code review 时不会被 ESLint 拦截。 → 修复方向: 把降级规则数减少到 0——逐文件开启 'error' 修补后启用，作为 v13 迭代的明确技术债。
- **[E-04]** 文件: `package.json:11`（`"build": "vite build && node scripts/check-bundle.js"`）→ 根因: bundle 预算检查是 build 的硬 gate，pass 才 OK，但 `check-bundle.js` 用 `import.meta.dirname` 读取 dist 路径——`import.meta.dirname` 是 Node 20.11+ 特性，CLAUDE.md 写 "Node >= 20" 但未指定 minor。 → 风险: Node 20.0~20.10 跑 build 报 "import.meta.dirname is not defined"；且 build 成功（dist 已写入）后才检查 → 检查失败退出码 1，但 dist 仍存在，会让用户以为"build 通过但 dist 不可信"。 → 修复方向: 用 `fileURLToPath(new URL('.', import.meta.url))` 兼容所有 Node 20+；或加 pre-build hook 提前失败。

### P2 中
- **[E-05]** 文件: `.github/workflows/ci.yml:15`（`node-version: [20, 22]`）→ 根因: matrix 跑两个 Node 版本，但 `package.json:6` 只声明 `"node": ">=20"`——没有 18 矩阵。CLAUDE.md "CI 矩阵测试 (Node 18/20/22)" 是 v5.0 历史声明，CHANGELOG 没声明何时移除 18。 → 风险: 表面看是"广覆盖"，实际只有 20+22 两个点。 → 修复方向: 要么加回 18 矩阵，要么从 README/PROJECT_SUMMARY 删除"Node 18" 描述。
- **[E-06]** 文件: `.github/workflows/ci.yml:60-65`（E2E 步骤）→ 根因: CI 只跑 `test-core.js` + `test-comprehensive.js`，跳过了 `test-a11y.js` / `test-interactions.js` / `test-persistence.js`（在 run-all-tests.js 的 comprehensive 阶段）。 → 风险: a11y 回归在 CI 不被捕获，pwa/persistence 也不在 CI 跑——CLAUDE.md "axe-core 零 violations" 在 CI 实际不被验证。 → 修复方向: CI 增加 `node e2e/test-a11y.js` 步骤（test-a11y.js 支持独立运行）。
- **[E-07]** 文件: 仓库根目录（缺失 `.husky/`、`lint-staged`、`commitlint`）→ 根因: 没有 pre-commit hook 也没有 commit-msg 校验；CONTRIBUTING.md "提交规范" 描述 conventional commit 但工具层没有强制。 → 风险: CHANGELOG.md 写"feat(sort): 新增希尔排序"是规则示例，但实际 git log 中混有 "fix: ..." / "update" / "patch" 等不规则 message。 → 修复方向: 加 husky + commitlint + lint-staged，pre-commit 跑 lint + typecheck。
- **[E-08]** 文件: `eslint.config.js:42-50`（测试文件规则块）→ 根因: 测试文件 `@typescript-eslint/no-explicit-any: 'off'`、`@typescript-eslint/no-non-null-assertion: 'off'`、 `@typescript-eslint/no-unsafe-function-type: 'off'`——3 个安全相关规则全开。 → 风险: 203 个测试文件用 `as any` 绕过类型检查（与 A-04 同根）。 → 修复方向: 改用 `vi.fn<[Args], Return>()` 等显式类型；只在 mock 工具文件（如 d3MockHelper.ts）保留 `any`。

### P3 低
- **[E-09]** 文件: `package.json:14-18`（脚本）→ 根因: 缺少 `lint:fix`、`test:watch:coverage`、`format`（项目未配 prettier）。CLAUDE.md "代码规范工具" 章节要求 0 errors，但没有强制格式。 → 风险: 团队成员编辑器差异产生无意义 diff。 → 修复方向: 加 prettier + format 脚本。
- **[E-10]** 文件: `tsconfig.json:18-20`（`allowJs: true, checkJs: false`）→ 根因: 允许 .js 但不检查——`src/__tests__/setup.js`（见 T-06）中的 JSDoc 类型注释无人校验。 → 风险: 隐性类型错误。 → 修复方向: 删 `setup.js` 改为 `setup.ts`，关 allowJs。

---

## Top5 优先（跨维度，按修复紧迫度排）

| 序 | 维度 | 等级 | 问题 | 文件:行号 | 一句话修复方向 |
|----|------|------|------|-----------|----------------|
| 1 | 安全 | P1 | [S-03/E-01] devDependencies 多处 major 版本超出 2025-08 知识截止日（vite ^8 / vitest ^4 / eslint ^10 / tailwind ^4.3 / @sentry ^10），package-lock.json 提交是唯一安全网 | package.json:38-54 | 立即用 `npm ci` 校验 lockfile 与 spec 的一致性，CI 加 `npm ls --depth=0` 防漂移 |
| 2 | 安全 | P1 | [S-01] `isValidStoredData` 对 object 类型只校验 value 是 basic/object/array，不递归深度，恶意 localStorage 可注入任意结构 | useDataStructureState.ts:14-38 | 引入 zod/valibot 统一 schema，import 与 localStorage 共用同一校验 |
| 3 | 性能 | P1 | [P-01] `useVisualizer` 的 rafId 在 useEffect 闭包内声明、cleanup 拿到的是陈旧 id，resize 时 cancelAnimationFrame 实际无效，调度多个 rAF 浪费 CPU | useVisualizer.ts:40-66 | 把 rafId 提到 useRef，cleanup 取消"最新"那个 rAF |
| 4 | 架构 | P1 | [A-01] `useDataStructureState` 在渲染阶段 `dataRef.current = data` 写 ref（无 useEffect 包裹），React 19 严格模式双调用导致下游读到陈旧值 | useDataStructureState.ts:110-111 | 改为 `useEffect(() => { dataRef.current = data }, [data])` 或移除该 ref |
| 5 | 工程化 | P1 | [E-04] `check-bundle.js` 用 `import.meta.dirname`（Node 20.11+ 才支持），但 package.json 只声明 `node >= 20`，CI 在 Node 20.0~20.10 会失败；且 build 已成功写入 dist 后才检查，失败时 dist 仍存在误导用户 | scripts/check-bundle.js:10 | 用 `fileURLToPath(new URL('.', import.meta.url))` 替代 `import.meta.dirname` |

---

**问题总数**: 35 条（P0: 0 / P1: 13 / P2: 15 / P3: 7）
**生成时间**: 2026-06-20
**视角盲区声明**: 仅 6 维工程视角，未覆盖教学体验、渲染一致性、移动端触控、a11y 真实体验（这些由 Subagent B 独立审查）

<<<END_OF_AUDIT_A>>>
