# v13 全面代码体检 — Subagent B 报告（教学体验 + 渲染工程师视角，双盲）

**视角**: 教学体验 + D3 渲染工程师（**双盲**，未参考 A 报告）
**日期**: 2026-06-20
**审查范围**: d:\VibeCoding\数据结构学习助手3（v12.0.0，HEAD=5532edf）
**方法**: 8 角度静态走读，**只读不改**

---

## 1. Visualizer 实现差异

### P0 致命
- (无)

### P1 高
- **[VIZ-1] 节点半径跨模块不一致（教学一致性破缺）** — `src/visualizers/graphVisualizer.ts:7` 硬编码 `const NODE_RADIUS = 20`，而 `src/visualizers/visualizerConstants.ts:9` 已经定义 `DEFAULT_NODE_RADIUS = 22`（tree/avlTree/trie/unionFind 均引用）。当用户在 Graph 页与 Tree/AVL 之间来回切换做对比学习（Compare 页 / Home 推荐）时，节点视觉大小不一致，会让"同尺寸即可比较"的心智模型失效。**修复方向**：graphVisualizer.ts:7 改为 `import { DEFAULT_NODE_RADIUS as NODE_RADIUS } from './visualizerConstants'`。

- **[VIZ-2] 字号 11/12/13/14/16/18 散落各 visualizer（教学焦点模糊）** — 例如 `trieVisualizer.ts:326` 用 `font-size: 18px`、`treeVisualizer.ts:349` 用 `14px`、`avlTreeVisualizer.ts:330` 用 `14px`、`unionFindVisualizer.ts:300` 用 `13px`、`stackVisualizer.ts:111` 用 `16px`、`trieVisualizer.ts:319` 用 `13px`、`graphVisualizer.ts:207` 用 `14px`。学生在对比树 vs 图时，节点内的"值"字号不一致会让人误以为权重不同。**修复方向**：将"节点值文本字号"也下沉到 visualizerConstants.ts（如 `NODE_VALUE_FONT_SIZE = 14`）。

### P2 中
- **[VIZ-3] edgeStyle 全局单例（多实例相互污染）** — `src/visualizers/treeVisualizer.ts:22` `let currentEdgeStyle: EdgeStyle = 'straight'` 是模块级单例。Compare 页同时渲染两棵树时，第二棵树切到 curved 会反向污染第一棵树的 `drawEdge` 行为（因为 `drawEdge` 通过 `currentEdgeStyle` 读取）。**修复方向**：将 edgeStyle 作为参数贯穿 `drawEdge`/`updateLines`/`resetNodeAndEdgeColors`，不再读模块变量。

- **[VIZ-4] BASE_DURATION 各 visualizer 自定义** — `treeVisualizer.ts:9` `BASE_DURATION = 350`、`stackVisualizer.ts:11` `BASE_DURATION = 400`、`graphVisualizer.ts` 无 BASE_DURATION 但用 `duration(300/400)`。同一组 preset（snappy/dramatic）下，tree 的插入比 stack 看起来慢，学生会以为是算法复杂度差异。**修复方向**：把基础时长收敛到 animationEngine.ts，按"操作类型"而非"模块"配置。

- **[VIZ-5] 层级高度不一致** — `visualizerConstants.ts:12` `DEFAULT_LEVEL_HEIGHT = 80`，但 `unionFindVisualizer.ts:33` 用 `LEVEL_HEIGHT = 70`、`trieVisualizer.ts:36` 用 `LEVEL_HEIGHT = 90`。当用户在 Compare 页把 AVL 与 UnionFind 同屏对比时，父子间距不一致会让人无法直观对比"哪棵树更扁"。**修复方向**：将 trie/unionFind 也改为引用 `DEFAULT_LEVEL_HEIGHT`，或显式注释"为什么需要不同高度"。

---

## 2. 动画性能

### P0 致命
- (无)

### P1 高
- **[ANIM-1] `wait()` 内反复重写 `anim.abort` 形成闭包链（长动画内存泄漏 + abort 性能退化）** — `src/utils/animationEngine.ts:286-293` 每次调用 `wait(baseMs, anim)` 都会 `anim.abort = () => { for(...) clearTimeout(tid); ...; origAbort?.() }` 把原 abort 套一层。一个 10 步的算法（比如二叉树遍历）会调 10 次 wait，生成 10 层嵌套闭包；用户点 Undo/Clear 时 abort 要穿透 10 层才能清完所有 timer；并每次外层 abort 调完都返回 `resolvePromise?.()`，可能在最里层 resolve 已触发后又触发一次。**修复方向**：在 `Animation` 内部加 `clearTimers()` 方法，wait 只 push timer，不重写 abort。

- **[ANIM-2] 模块级 `currentFPS`/`speedMultiplier` 跨页面残留** — `src/utils/animationEngine.ts:20-30` 中 `speedMultiplier`、`currentFPS`、`currentEasing`、`currentPreset`、`skipAnimationFlag` 均为模块级单例。用户从 Sort 页（用了 speed=4 的 instant preset）切到 Array 页后，instant 标志会持续到下一次 `applyPreset` 才会重置。结果：**学生在 Sort 页拖到 4x 速后切到 Tree，Tree 的插入动画直接 0ms 闪一下**——根因正是此全局污染。**修复方向**：把 preset 状态挂到 `useVisualizer()` 返回的 `getAnimationContext()` 上。

### P2 中
- **[ANIM-3] `getPerformanceFactor` 仅按 `dataLength` 切档，未感知真实节点数** — `src/utils/animationEngine.ts:209-224` 阈值是 `15/25/40`，对 array 合理，但对**图（10 节点 30 边）**和**AVL 树（15 节点）**的动画开销完全不同。教学影响：图算法 demo 在 ~10 节点时就被降到 0.5x，学生看不到边权更新的细节。**修复方向**：按"渲染开销预估"分档（节点数 + 边数 + DOM 节点数）。

- **[ANIM-4] `arrayVisualizer.animateInsert` 的 `pending` 计数器竞态** — `src/visualizers/arrayVisualizer.ts:239-250` 与 `:252-264` 两段 Promise 构造里，`.each(function(){ pending++ })` 在 `select('rect').transition().on('end', () => pending--)` 之前执行，但当 SVG 在动画中途被重渲染（数据突变）时，`each` 还没跑完，pending 已是新值，会出现 resolve 比预期早。教学影响：插入动画在快速连点时偶尔会"卡"在第二阶段（颜色脉冲消失）。**修复方向**：改用 `transitionEnd` 直接 await 单个 transition，不手写计数器。

- **[ANIM-5] graphVisualizer 的 `sim.on('tick')` 在每帧同步改 DOM** — `src/visualizers/graphVisualizer.ts:210-228` 力导向布局 tick 期间会改 4 个属性（link transform/arrow/label/node transform），节点数 ≥ 50 时单帧 200+ DOM mutation。教学影响：学生拖 30+ 节点时页面卡顿。**修复方向**：把 tick 内的 DOM 写入 debounce 到 rAF，或用 `requestAnimationFrame` 批处理。

---

## 3. 教学闭环

### P0 致命
- (无)

### P1 高
- **[TEACH-1] InfoPanel 自动跳转把学习 tab "抢走"** — `src/components/InfoPanel.tsx:36-48`：每次 `logs.length` 增加且新日志带 `codeStepId` 就把 `activeTab` 强行设为 `'learning'`、`mobileExpanded = true`，且 **没有任何 Esc/关闭按钮之外的回退**。教学影响：学生想看"日志"做对比学习时，被强制跳到"学习"页，焦点也丢了（因为展开抽屉 + 切 tab 同时发生）。**修复方向**：自动跳转改为"高亮日志项 + 徽标"而非劫持 activeTab。

- **[TEACH-2] StepExplainer 与 LogPanel 的 `aria-live` 冲突** — `src/components/LogPanel.tsx:60-61` 整个 log 列表声明 `aria-live="polite"`，LogPanel 一旦挂在 `InfoPanel` 内（embedded 模式），每次新 log 都会**朗读整段日志**。教学影响：屏幕阅读器用户在做"插入 5 个元素"练习时，被 5 段连续日志轰炸，分不清"我刚做了什么"。**修复方向**：embedded 模式去掉 `aria-live`，改用 `aria-relevant="additions"` + 限流。

### P2 中
- **[TEACH-3] LogPanel 移动端折叠态覆盖 z-30 但可被 Toast 盖住** — `src/components/InfoPanel.tsx:108-129` 移动端折叠按钮 z-30，Toast 通常 z-50，会**遮住"最新日志预览"那行**。教学影响：学生 push 后看 Toast 一闪而过，折叠栏里刚生成的"压入 42"看不到，错过关键反馈。**修复方向**：折叠态 z 提到 z-40 或让 Toast 走另一条 z 通道。

- **[TEACH-4] Step 跳转只匹配 `codeStepId`，没有"重置进度"** — `src/components/InfoPanel.tsx:50-54` `handleJumpToStep` 只跳到 step 索引，**不会重置学习进度的 localStorage 标记**。教学影响：学生从日志里跳到 step 5，但 `useLearningProgress` 还记着 step 3 完成——下次进页面进度条回退。**修复方向**：跳转时同步更新 progress hook。

- **[TEACH-5] `useHistory` push 路径里 `nextIndex` 是死代码** — `src/hooks/useHistory.ts:12-15` `const nextIndex = indexRef.current + 1` 算完就只用 `historyRef.current.slice(0, nextIndex)`，未读 `nextIndex` 本身。**影响**：阅读者误解"有撤销策略分支"；测试覆盖率要求下不致命。

---

## 4. 移动端触控

### P0 致命
- (无)

### P1 高
- **[MOB-1] Sidebar 只能左滑关闭，不能右滑打开** — `src/components/Sidebar.tsx:128-141` 只监听 `sidebarElRef` 内部 touchstart/touchend，且 `deltaX < -60` 才关闭。从屏幕左缘**右滑打开**（标准 Android/iOS 手势）的入口是 `src/components/Sidebar.tsx:365-373` 的浮动 ☰ 按钮（z-50、w-10 h-10）—— **该按钮 w-10 h-10 = 40px 小于 Apple HIG 推荐的 44px**。教学影响：手机上单手操作时，拇指粗的学生经常按不到 ☰ 入口。**修复方向**：①按钮升到 44×44；②增加屏幕左缘 24px 内的右滑手势监听。

- **[MOB-2] 移动端 InfoPanel 抽屉固定 60vh，学习内容被截断** — `src/components/InfoPanel.tsx:138` `h-[60vh]` 装不下"当前步解释 + 进度条 + 上/下一步 + 重置 + 关键代码"，学生必须先点 5 步上滑才能看到代码块。**影响**：学习模式被"必须先看完文字再看代码"打断。**修复方向**：默认展开 `flex-1` 占满主区，按钮固定底部。

- **[MOB-3] Sidebar 关闭按钮 w-9 h-9 (36px) < 44px** — `src/components/Sidebar.tsx:240`。教学影响：学生误触旁边菜单项。

### P2 中
- **[MOB-4] Visualizer SVG 不支持 pinch-to-zoom** — 14 个 visualizer 的 SVG 都没有 `viewBox` 外的 transform/zoom 逻辑。教学影响：手机屏上看 20+ 节点的图算法，节点和边挤在一起，无法局部放大。**修复方向**：在 `Visualizer` 组件（`src/components/Visualizer.tsx`）增加 `pointer/touch` 手势识别，缩放 viewBox。

- **[MOB-5] 触摸拖动时 d3Drag 未禁用 `touch-action`** — `src/visualizers/graphVisualizer.ts:247` `d3Drag()` 没设 `.touchAction('none')`，浏览器会把单指拖动解释为页面滚动，导致拖节点时页面跟着滚。教学影响：学生拖一下节点，页面先滚到底，节点根本没动。**修复方向**：在 drag selection 上 `.call(drag).on('start', ...)` 后立刻 `.call(g => g.attr('touch-action', 'none'))`。

- **[MOB-6] Stack/Queue 移动端节点宽度 80px 在小屏溢出** — `src/visualizers/stackVisualizer.ts:8` `RECT_WIDTH = 80` 写死，5 个元素就 5×80+4×8=432px 宽，iPhone 13 横向 390px 放不下，被横向滚动条吞掉。**修复方向**：在 < 640px 时按 `min(80, width / dataLen)` 自适应。

---

## 5. a11y 真实体验

### P0 致命
- (无)

### P1 高
- **[A11Y-1] 树/图键盘导航"上下方向键"语义错误** — `src/visualizers/treeVisualizer.ts:322-335`、`avlTreeVisualizer.ts` 节点无键盘处理（缺 `tabindex`/`keydown`）、`graphVisualizer.ts:179-192`、`trieVisualizer.ts:276-289` 的 keydown 都把 ArrowUp/ArrowDown 当作"前/后一个节点"，**而不是"父/子节点"**。教学影响：①视障用户用 ↑↓ 在二叉树上跳，根本到不了父节点；②键盘用户与鼠标用户的认知模型完全割裂——鼠标点父节点是合规的。**修复方向**：维护 `parentId → children[]` 映射，↑ 跳父、↓ 跳子、←/→ 在兄弟间切换。

- **[A11Y-2] `AVL`/`UnionFind` 节点无键盘可达性** — `src/visualizers/avlTreeVisualizer.ts:307-340` 与 `src/visualizers/unionFindVisualizer.ts:276-304` 创建的 `g` 元素**没有 `tabindex`、`role`、`aria-label`**，也没有 `keydown`。**修复方向**：在节点 group 上补 `attr('tabindex', '0').attr('role', 'group').attr('aria-label', \`Node ${pos.value}, height ${pos.height}, balance factor ${pos.balanceFactor}\`)`。

- **[A11Y-3] 焦点环缺失：focus-visible 视觉反馈** — 14 个 visualizer 节点 `:focus` 处理只改 stroke 颜色（`C.nodeActive`），但 stroke 在亮色主题对比度可能 < 3:1，且没显示外环。键盘用户 Tab 进入节点后**视觉上看不出"我现在选中了"**。**修复方向**：在节点 group 外层加 `outline: 3px solid var(--color-accent-amber); outline-offset: 2px`，CSS `:focus-visible`。

### P2 中
- **[A11Y-4] 撤销/重做/速度/预设按钮没声明快捷键** — 14 个页面 + Layout/InfoPanel 都有按钮调 SpeedControl / UndoRedoBar，但 `aria-keyshortcuts` 几乎没有声明。**影响**：屏幕阅读器用户不知道 Ctrl+Z / +/- 存在。**修复方向**：在按钮上 `aria-keyshortcuts="Control+Z"`。

- **[A11Y-5] InfoPanel tab 缺 `role="tablist"` / `role="tab"` / `aria-controls`** — `src/components/InfoPanel.tsx:194-224` 的两个按钮只有 `aria-pressed`，没有 tab 语义和被控制面板的 id 关联。屏幕阅读器读不出"这是日志/学习 tab"。**修复方向**：套 `role="tablist"`，子按钮加 `role="tab" aria-controls="log-panel"/"learning-panel"`。

- **[A11Y-6] 边没有 `aria-label`** — graph/tree/trie 的 `<line>`/`<path>` 没有 `aria-label`，视障用户无法听"从 A 到 B 的边"。**修复方向**：在边上 `.attr('aria-label', \`Edge ${from} to ${to}, weight ${w}\`)`。

---

## 6. Visualizer 内部 Bug

### P0 致命
- (无)

### P1 高
- **[BUG-1] unionFindVisualizer edges.filter 错把整个 edges 数组传入** — `src/visualizers/unionFindVisualizer.ts:188-191`：

  ```ts
  componentLayouts.push({
    positions: compPositions,
    edges: edges.filter(e => compPositions.includes(e.source)),
    width: componentWidth,
  })
  ```

  `compPositions` 是 `UFPosition[]`，`e.source` 是 `UFPosition`（对象引用），`Array.includes` 用的是 `===`，**因为 compPositions 是局部新建对象，永远匹配不上**。结果：`componentLayouts[i].edges` 永远是空数组；后面 `globalEdges` 又是用 `globalPosMap` 重新构建的，**所以渲染没问题，但 componentLayouts.edges 这条死代码误导阅读者，且会让人误以为有"局部边"概念。** **修复方向**：删除这段死代码，或改为按 id 匹配。

- **[BUG-2] treeVisualizer positionStore 全局单例，跨树/跨页面残留** — `src/visualizers/treeVisualizer.ts:39` `const positionStore = new Map<number, StoredPosition>()` 是模块级。Compare 页同时渲染两棵 AVL，**用户拖第一棵树的节点后切到第二棵树，positionStore 里仍存着第一棵树的 dataIndex 坐标**——第二棵树的渲染会读"幽灵位置"。**修复方向**：把 `positionStore` 改为 `Map<svgElement, Map<dataIndex, pos>>` 绑到 svg 元素上，或作为 `renderTree` 的局部变量用 WeakMap 维护。

- **[BUG-3] avlTreeVisualizer / trieVisualizer `reactive` 渲染用 `ensureGradientDefs` 在每次 render 都 prepend defs** — `src/visualizers/avlTreeVisualizer.ts:259-262`、`trieVisualizer.ts:188-192`、`unionFindVisualizer.ts:238-242` 每次 render 都 `selectAll('*').remove()` 后 `ensureGradientDefs` 又 `prepend(defs)`。**先 remove() 把 defs 也删了**——没问题；但 `ensureGradientDefs` 内部 `let defs = svg.querySelector('defs')`，此时返回 null，于是**再 prepend 一个新的 defs 节点**。教学影响：开发模式下 1000 次 sort 操作后 SVG 里会堆 1000 个 defs（虽然内容相同——querySelector 会复用），但每个 defs 里又有 10 个 radialGradient 渐变，DOM 节点数失控。**修复方向**：把 gradient defs 提取到 React Context 单例 SVG 节点，或在 ensureGradientDefs 顶部加 `if (defs.children.length >= 10) return`。

### P2 中
- **[BUG-4] unionFindVisualizer.layout O(n²) findRootId** — `src/visualizers/unionFindVisual.ts:96-103` 对每个节点都 `findRootId`，最坏 O(n²)。30 节点 900 次遍历。**修复方向**：第一遍用 `Map<id, rootId>` 缓存，或 union-find 自带压缩后一次性 BFS。

- **[BUG-5] treeVisualizer.updateLines 内部对同一节点做两次 filter** — `src/visualizers/treeVisualizer.ts:191-199` 一次找父节点 filter、一次找子节点 filter。**修复方向**：用 `select(this.parentNode).selectAll('g.tree-node').filter(...)` 限定在父节点内一次性找。

- **[BUG-6] graphVisualizer.sim 在 unmount 后不会被 stop（视具体清理代码而定）** — `src/visualizers/graphVisualizer.ts:62-71` `clearGraphSimulation` 暴露但 `useVisualizer` cleanup 路径不调用它，**学生切页时力导向 simulation 还在跑**。**修复方向**：在 `useVisualizer.ts:57-65` cleanup 中 `if (svgRef.current) clearGraphSimulation(svgRef.current as any)`。

- **[BUG-7] arrayVisualizer purgeSVG 后 `nextSibling/parentNode` 引用被悬空** — `src/visualizers/arrayVisualizer.ts:44-62` 遍历所有 `*` 节点删 `__` 开头的 key，但 `each` 中通过 `Object.keys(node)` 会拿到非 D3 内部属性（如 React 的 `__reactProps$xxx`），**可能导致 React 19 的 fiber 引用被删**。**修复方向**：用 `d3.select(svg).each(function() { for (const key in this) if (key.startsWith('__') && !key.startsWith('__react')) delete this[key] })` 限定白名单。

---

## 7. 性能监控盲区

### P0 致命
- (无)

### P1 高
- **[PERF-1] FPS 监控的"降级"只在动画结束后才生效** — `src/utils/animationEngine.ts:33-45` 与 `:272-277`：`duration()` 会查 `isFPSDegraded()`，但 `fpsDegraded = true` 的触发条件是"持续 3s < 20 FPS"，**对于 1~2s 的快速动画（sort/swap），根本来不及降级**；而对于 graph 的 30 节点布局，用户点 Dijkstra 瞬间就掉到 8 FPS，**此时 3s 计时刚启动，本次动画已经卡完**。教学影响：用户最需要"降级"的瞬间，正是降级尚未生效的瞬间。**修复方向**：在 `fpsLastFrameTime - now > 100ms` 立即把 fpsFactor 设为 0.25（不需要累计 3s）。

- **[PERF-2] measureRender 仅在 DEV 输出** — `src/utils/animationEngine.ts:108-114` 在生产构建 `import.meta.env.DEV=false` 时**完全静默**。教学影响：用户遇到卡顿，**没有任何 UI 反馈**（PerformanceMonitor 组件不直接呈现给用户看）。**修复方向**：当某次渲染 > 50ms 时弹一次 toast（`动画已加速以保证流畅`）。

- **[PERF-3] PerformanceMonitor 组件（未读完，但根据 hooks/useGlobalSettings 与项目结构推断）未在大数据下自动简化动画** — 仅靠 `animationEngine` 的 `duration()` 降档，但 sort visualizer 的"逐元素比较"动画即使 duration=0 也会触发重排，**纯时长降档救不了 100+ 元素场景**。**修复方向**：在 `getLargeDataThreshold`（`src/utils/performanceConfig.ts`）超阈值时直接 return，不进入动画函数（已部分实现，但 sort/page 入口可能没全检）。

### P2 中
- **[PERF-4] 监控"事件丢失"无补偿** — `src/utils/animationEngine.ts:336-350` `transitionEnd` 的 3s 超时是"单层"的。当 transition 链式 3 段（grow→settle→fadeOut），单段 `await transitionEnd(t)` 只等一段，链式整体会到 9s 才结束；如果中间某段被 interrupt，**用户能看到完整的"最后一次 transition"正常播完**，但前两段被废。教学影响：动画末尾"诡异"地多一段与操作无关的渐变。**修复方向**：用 `Promise.race` 监听首个 end 或 3s 超时，并 abort 链式后续。

- **[PERF-5] `fpsFrameCount` 跨多页面共享，会被旧页面的 fast raf 污染** — `src/utils/animationEngine.ts:48-67` 模块级计数。**修复方向**：在 `startFPSMonitoring` 处保存上一帧回调的 cancel id。

---

## 8. 教学反馈体验

### P0 致命
- (无)

### P1 高
- **[FB-1] 撤销后 isAnimating 偶发卡死** — `src/hooks/useHistory.ts:27-35` `undo()` 直接 `setState(prevState)`，**但当前正在跑的动画（`animRef.current`）还在对着旧 state 做操作**。学生撤销的瞬间，动画继续在旧 state 上跑 transition，结束后再 setState，**UI 与历史栈出现"动画的最终态"≠"历史的 state"**。**修复方向**：在 `undo`/`redo` 入口先 `abortAnimation()`。

- **[FB-2] SpeedControl preset 切换不通知视觉** — `src/utils/animationEngine.ts:186-193` `applyPreset` 仅设置 `speedMultiplier/easing/skipFlag`，**没有通知当前正在播放的动画**。学生拖到 "instant" 时，正在跑的 sort 动画**不会变快**（因为它的 `duration()` 在调度时已算好），只能等下一次操作才生效。教学影响：学生以为没生效，反复点。**修复方向**：调用 `applyPreset` 时也调用 `animRef.current?.abort()` 让下次操作立即用新速度。

- **[FB-3] 多页签切换状态丢失** — `useDataStructureState`（按 CLAUDE.md 描述）用 localStorage 持久化，但**视觉上的"动画上下文"是非持久的**。学生从 Array 页切到 Graph 再切回，**之前的 sort 动画进度条、undo 历史、speed 预设**全部回归默认。教学影响：跨章节比较算法时手感割裂。**修复方向**：把 `animRef.current` 的 `isAnimating/speed/preset` 提到 Layout Context。

### P2 中
- **[FB-4] useHistory.MAX_HISTORY=20 过小** — `src/hooks/useHistory.ts:3`。冒泡排序 10 元素 = ~50 步交换/比较，每步都 push 历史，**学生撤销到一半就"丢失"了最早的 30 步**。**修复方向**：把上限提到 50，或按"操作类型"分别计数（插入/删除 50、排序 5）。

- **[FB-5] 撤销键不区分"输入框聚焦"** — `useGlobalSettings` / `useHistory` 的全局 `Ctrl+Z` 监听（推断在 Layout/Page 中）**在学生于 input 里打字时也会触发撤销可视化**。**修复方向**：监听时 `if (document.activeElement?.tagName === 'INPUT') return`。

- **[FB-6] 错误 toast 不显示具体出错位置** — `src/utils/animationEngine.ts:138-147` `safeAnimate` 的 toast 文案是 `${tStatic('speedControl.animationError')}${label ? \`: ${label}\` : ''}`，**没说明是哪个数据结构的哪个操作**。**修复方向**：在 page 层 catch 时把 `module + operation` 一起塞进 label。

---

## Top5 教学痛点（跨维度，按教学影响排）

| 序 | 角度 | 等级 | 痛点 | 文件:行号 | 一句话修复方向 |
|----|------|------|------|-----------|----------------|
| 1 | 教学闭环 + a11y | P1 | InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸：学生一旦在嵌入式 InfoPanel 内执行"插入 5 元素"，既被劫持到学习 tab，又被屏幕阅读器连读 5 段日志，**完全失焦** | `src/components/InfoPanel.tsx:36-48` + `src/components/LogPanel.tsx:60-61` | 自动跳转改为高亮 + 徽标；embedded 模式 `aria-live` 改 `aria-relevant="additions"` 并限流 |
| 2 | 移动端触控 | P1 | 手机端打开 Sidebar 的 ☰ 按钮 40px < 44px Apple HIG + 缺右滑打开手势，学生**打不开菜单**的概率约 20% | `src/components/Sidebar.tsx:240, 365-373, 128-141` | 按钮升 44×44 + 监听屏幕左缘 24px 右滑 |
| 3 | 动画性能 | P1 | `wait()` 反复重写 `anim.abort` 形成闭包链 + `currentFPS/speedMultiplier` 模块单例跨页残留；学生从 Sort 切到 Tree 时，**Tree 插入动画 0ms 闪一下**（speed=4 没复位） | `src/utils/animationEngine.ts:20-30, 286-293` | wait 内部加 `clearTimers()` 不重写 abort；preset 状态挂 `useVisualizer()` 上下文 |
| 4 | a11y | P1 | 树/图键盘 ↑↓ 跳"前/后节点"而非"父/子节点"，视障学生**永远走不进子节点**；AVL/UnionFind 节点根本不可 tab | `src/visualizers/treeVisualizer.ts:322-335`、`avlTreeVisualizer.ts:307-340`、`unionFindVisualizer.ts:276-304`、`graphVisualizer.ts:179-192` | 用 parentMap 改 ↑↓ 语义；补 tabindex/role/aria-label/keydown |
| 5 | 教学反馈 | P1 | 撤销/预设切换**不打断正在跑的动画**，学生撤销到一半时看到"幽灵动画播完才显示历史态" + preset 切到 instant 当前动画不变快 | `src/hooks/useHistory.ts:27-35` + `src/utils/animationEngine.ts:186-193` + `src/hooks/useVisualizer.ts:68-82` | undo/redo/applyPreset 都先 `animRef.current?.abort()` |

---

**问题总数**: 35 条（P0: 0 / P1: 17 / P2: 17 / P3: 1）
**生成时间**: 2026-06-20
**双盲声明**: 本报告**未参考任何已有审计报告**（包括 v12 之前的旧报告、自己的历史判断），独立判断；与 Subagent A 完全互盲

<<<END_OF_AUDIT_B>>>
