# 数据结构学习助手 — Architecture 文档

> **版本:** v14.0.0 GA（D1 图算法测试 + G1 B-Tree + G2 Segment Tree + G3 双向链表 + F2 算法接入指南全部完成）
> **更新日期:** 2026-06-22
> **技术栈:** React 19 + Vite 8 + TypeScript 5.8（strict 模式） + D3.js v7 + Tailwind CSS v4 + React Router v7 + Vitest + Playwright

---

## 0. v13 体检方法论（2026-06-20）与 Phase A 进展

> **来源**: [docs/superpowers/specs/2026-06-20-v13-code-audit-design.md](./docs/superpowers/specs/2026-06-20-v13-code-audit-design.md) §4

v13 起，每个重大版本（v14+）都应采用 **双模型互盲 + 集中仲裁** 方法做全面代码体检。

### 三个角色

| 角色 | 职责 | 产出 |
|------|------|------|
| **Subagent A** | 工程审计师（架构/安全/性能/可测试性/文档/工程化 6 维） | 独立问题清单 A |
| **Subagent B** | 教学体验 + 渲染工程师（8 角度，**与 A 完全互盲**） | 独立问题清单 B |
| **仲裁者** | 主对话 agent（合并去重 + 分级 P0~P3） | 合并仲裁报告 + 修复路线 |

### 仲裁标签

- `[共识]` = A 与 B 都报告的同一文件同一根因（高置信度）
- `[A-独报-工程]` = A 报告、B 未提（工程性问题）
- `[B-独报-体验]` = B 报告、A 未提（教学/体验问题）
- `[仲裁]` = A、B 同主题但表述冲突

### 4 阶段修复路线（输出产物）

| Phase | 主题 | 工时 |
|-------|------|------|
| A | 紧急修复（安全+数据完整性） | 1~2 天 | ✅ 已完成 |
| B | 体验+工程优化 | 3~5 天 | ✅ 已完成 |
| C | 文档完善 | 1~2 天 | ✅ 已完成 |
| D | 测试+CI 升级 | 2~3 天 | ✅ 已完成 |

### 工作流约束

- 体检在独立 feature 分支（如 `feature/vN-code-audit`）
- 产物 1 个 commit，仅文档/审计产物，**不动业务代码**
- 修复留到 v(N+1) Phase A 启动时按用户确认执行

### Phase A 完成摘要（2026-06-21）

| 修复项 | 文件 | 说明 |
|--------|------|------|
| 统一 schema 校验 | `src/utils/schema.ts` | 递归深度限制 `MAX_STORAGE_DEPTH = 10`，供 localStorage/import 复用 |
| localStorage 数据清洗 | `src/hooks/useDataStructureState.ts` | 无效/过深数据自动清除并回退 `initialData` |
| 渲染阶段 ref 修复 | `src/hooks/useDataStructureState.ts` | `dataRef.current = data` 移入 `useEffect` |
| 依赖版本锁定 | `package.json` + `.github/workflows/ci.yml` | devDependencies 改 `~`，CI 加 `npm ls --depth=0` |
| Node 兼容修复 | `scripts/check-bundle.js` | 用 `fileURLToPath` 替代 `import.meta.dirname` |
| 第三方代理移除 | `vite.config.js` | 移除 `loli.net` 字体缓存规则 |

### Phase C/D 完成摘要（2026-06-21）

| 修复项 | 文件 | 说明 |
|--------|------|------|
| 文档一致性 | `README.md` / `PROJECT_SUMMARY.md` / `CHANGELOG.md` / `TODO.md` / `WORKLOG.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `PROJECT_STATUS.md` | 版本号与 Phase 状态同步 |
| 版本升级 | `package.json` | version 升级为 `v13.0.0-rc2` |
| Playwright a11y spec | `e2e/a11y.spec.ts` | 动态扫描 17 页 |
| Playwright home spec | `e2e/home.spec.ts` | 首页 3 用例 |
| a11y runner | `e2e/test-a11y.js` | 委托 Playwright Test |
| E2E JSON 报告 | `e2e/run-all-tests.js` | 输出 `e2e/test-results.json` |
| TypeScript setup | `src/__tests__/setup.ts` | 替代 `setup.js` |
| D3 mock 增强 | `src/__tests__/visualizers/d3MockHelper.ts` | 调用记录与链式 forceSimulation |
| Snapshot 测试 | `src/__tests__/visualizers/arrayVisualizer.snapshot.test.ts` | SVG 结构快照 |
| CI 增强 | `.github/workflows/ci.yml` | a11y、覆盖率/构建/E2E 报告 artifact |

### Path 3 H2 全局搜索增强（2026-06-21）

| 模块 | 文件 | 说明 |
|------|------|------|
| Fuzzy 匹配 | `src/utils/fuzzySearch.ts` | LCS 轻量模糊匹配（新建） |
| 搜索历史 | `src/hooks/useSearchHistory.ts` | localStorage 持久化 Hook（新建） |
| 搜索索引 | `src/data/searchIndex.ts` | `SearchItem` 扩展 `complexity` / `tags` |
| 组件 UI | `src/components/GlobalSearch.tsx` | 集成模糊匹配、历史、复杂度过滤、分类展示 |
| i18n | `src/i18n/locales.ts` | 新增搜索历史、复杂度、分类相关键 |

---

## 1. 架构概览

### 1.1 系统定位

本项目是一款面向大学生的 Web 端数据结构可视化教学工具，采用 **分层架构**，通过 **React 函数组件 + 自定义 Hooks** 管理状态，**D3.js** 驱动可视化渲染，**TypeScript** 提供类型安全。

### 1.2 分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        应用入口层 (Entry)                         │
│                    main.tsx → App.tsx (路由)                      │
├─────────────────────────────────────────────────────────────────┤
│                        页面层 (Pages)                             │
│  ArrayPage | StackPage | QueuePage | LinkedListPage | TreePage   │
│  AvlTreePage | GraphPage | SortPage | HashPage | HeapPage | TriePage │
│  SkipListPage | UnionFindPage | RedBlackTreePage                 │
│  SortComparePage | GraphAlgorithmPage | Home | LearningPath      │
├─────────────────────────────────────────────────────────────────┤
│                      公共组件层 (Components)                       │
│  Visualizer | OperationBar | PageHeader | LogPanel | Timeline    │
│  PerformanceChart | SpeedControl | ExportImport | Toast          │
│  StepExplainer | ComplexityChart | UndoPreviewButton | ShareBtn  │
│  KeyboardHelp | EmptyState | NetworkStatus | PerformanceMonitor │
│  UndoRedoBar | Sidebar | Layout | ErrorBoundary                  │
│  ProgressOverview | LearningRecommendations | ContentTier        │
│  AnimationDelayIndicator | InfoPanel | GlobalSearch              │
├─────────────────────────────────────────────────────────────────┤
│                       状态管理层 (Hooks)                          │
│  useArrayState | useStackState | useQueueState                   │
│  useLinkedListState | useTreeState | useAvlTreeState | useGraphState │
│  useSortState | useHashState | useHeapState | useTrieState       │
│  useSkipListState | useUnionFindState | useRedBlackTreeState     │
│  useHistory | useVisualizer | useKeyboard | useCommonKeyboard    │
│  useTheme | useI18n | useGlobalSettings | useLearningMode        │
│  useLearningProgress | usePageTracker                            │
├─────────────────────────────────────────────────────────────────┤
│                     可视化引擎层 (Visualizers)                     │
│  arrayVisualizer | stackVisualizer | queueVisualizer             │
│  linkedListVisualizer | treeVisualizer | avlTreeVisualizer        │
│  graphVisualizer | sortVisualizer | hashVisualizer               │
│  heapVisualizer | trieVisualizer                                 │
│  skipListVisualizer | unionFindVisualizer | redBlackTreeVisualizer │
├─────────────────────────────────────────────────────────────────┤
│                      算法层 (Algorithms)                          │
│  sorting: bubble | selection | insertion | quick | merge         │
│          heap | radix | bucket | shell | comb | tim | counting   │
│  graph: bfs | dfs | dijkstra | topoSort | bellmanFord |          │
│          floydWarshall | prim | kruskal                            │
│  skipList | unionFind | redBlackTree                             │
├─────────────────────────────────────────────────────────────────┤
│                       工具层 (Utils)                              │
│  animationEngine | validate | dataExport | debounce              │
│  timeslicing | themeColors | d3Imports | performanceBenchmark    │
│  shareUtils | visualizerLayout | learningRecommender             │
├─────────────────────────────────────────────────────────────────┤
│                      国际化层 (i18n)                              │
│  locales.ts (zh + en) | useI18n.ts                               │
├─────────────────────────────────────────────────────────────────┤
│                      配置层 (Configs)                             │
│  learning/ — 学习模式算法步骤配置（37 个配置，按算法分文件，含拓展主题）│
├─────────────────────────────────────────────────────────────────┤
│                      数据层 (Data)                                │
│  searchIndex.ts — 全局搜索索引（数据结构/算法/页面元数据）          │
├─────────────────────────────────────────────────────────────────┤
│                      类型层 (Types)                               │
│  animationEngine.d.ts | hooks.d.ts | toastStore.d.ts             │
│  validate.d.ts | visualizers.d.ts | learning.d.ts                │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 模块职责

| 层级 | 模块 | 职责 |
|------|------|------|
| **Entry** | `main.tsx` | React 应用挂载、StrictMode 包装 |
| | `App.tsx` | React Router 路由配置，React.lazy 懒加载 |
| **Pages** | `*Page.tsx` | 业务逻辑编排：组合组件、调用 hooks、处理用户交互 |
| | `LearningPath.tsx` | 学习路径页面，展示学习进度、推荐、信息框 |
| **Components** | `Visualizer.tsx` | D3 可视化容器，管理 SVG 生命周期、缩放、FPS 监控 |
| | `OperationBar.tsx` | 操作按钮区统一容器 |
| | `PageHeader.tsx` | 页面标题 + 描述 + 图标 |
| | `LogPanel.tsx` | 操作日志展示，支持过滤和自动滚动；`variant="embedded"` 卡片式时间线用于 InfoPanel |
| | `InfoPanel.tsx` | 统一信息面板：桌面端右侧 w-96 持久面板 + 移动端底部抽屉，双 Tab（操作日志/学习模式），含自动跳转机制 |
| | `Timeline.tsx` | 操作历史时间线，图标匹配 + 悬停 tooltip + 键盘导航 |
| | `PerformanceChart.tsx` | 排序算法性能对比 D3 柱状图 |
| | `ComplexityChart.tsx` | 算法复杂度增长曲线对比图表（8 色调色板 + 表格视图） |
| | `StepExplainer.tsx` | 学习模式步骤解释面板 + 代码同步 |
| | `SpeedControl.tsx` | 动画速度滑块 + 5 种动画预设选择 |
| | `ExportImport.tsx` | JSON/CSV 导入导出按钮组 |
| | `Toast.tsx` | 全局 Toast 通知系统（发布-订阅模式） |
| | `UndoPreviewButton.tsx` | 撤销/重做按钮，悬停显示状态预览 |
| | `ShareButton.tsx` | Base64 编码数据分享到 URL |
| | `KeyboardHelp.tsx` | 快捷键帮助弹窗（路由感知动态显示） |
| | `EmptyState.tsx` | 空状态引导覆盖层 |
| | `NetworkStatus.tsx` | 网络在线/离线状态提示 |
| | `PerformanceMonitor.tsx` | FPS/内存实时监控面板 |
| | `UndoRedoBar.tsx` | 撤销/重做 UI 封装 |
| | `ProgressOverview.tsx` | 学习进度概览：进度环 + 统计卡片 + 目标设定 |
| | `LearningRecommendations.tsx` | 学习推荐展示组件，基于 learningRecommender 算法 |
| | `ContentTier.tsx` | 内容分层组件，基础/进阶/拓展三层内容展示 |
| | `AnimationDelayIndicator.tsx` | 延迟启动动画的可视化反馈指示器 |
| | `GlobalSearch.tsx` | 全局搜索弹窗（Ctrl/Cmd+K 唤起），支持数据结构/算法/页面快速跳转，键盘上下导航 + Enter 选中 |
| | `Sidebar.tsx` | 左侧导航栏 + 主题切换 + 版本号；导出 `STRUCTURE_KEYS` 供 GlobalSearch 等模块复用 |
| | `Layout.tsx` | 页面整体布局框架；挂载 GlobalSearch 并监听 Ctrl/Cmd+K 全局快捷键 |
| | `ErrorBoundary.tsx` | 错误边界捕获 + 异常恢复 UI |
| **Hooks** | `use*State` | 各数据结构状态管理（14 个） |
| | `useHistory` | 通用历史栈（Undo/Redo，最大 20 步） |
| | `useVisualizer` | 可视化容器管理（尺寸、ResizeObserver、动画上下文） |
| | `useKeyboard` | 键盘快捷键监听（含输入框焦点防护） |
| | `useCommonKeyboard` | 通用快捷键封装（撤销/重做/重置） |
| | `useTheme` | light/dark/system 主题管理 |
| | `useI18n` | 中英文翻译 + 语言切换 |
| | `useGlobalSettings` | 全局设置上下文（i18n + theme + preset） |
| | `useLearningMode` | 交互式学习模式步骤管理 |
| | `useLearningProgress` | 学习进度管理（CustomEvent 同步 + SyncStatus + 统计 API + 目标设定） |
| | `usePageTracker` | 页面访问追踪 |
| **Visualizers** | `*Visualizer.ts` | D3.js SVG 渲染 + 动画（14 个），AVL 树遍历使用边流动点 + 节点脉冲高亮 |
| **Algorithms** | `sorting/*` | 12 种排序算法实现（插件注册模式） |
| | `graph/*` | 8 种图算法实现 |
| | `skipList.ts` | 跳表算法实现（多层链表 + 概率平衡 + 搜索/插入/删除） |
| | `unionFind.ts` | 并查集算法实现（路径压缩 + 按秩合并 + 连通性查询） |
| | `redBlackTree.ts` | 红黑树算法实现（插入 + fixup + 左右旋转 + 着色） |
| **Utils** | `animationEngine.ts` | 动画时序控制、性能模式、缓动函数、FPS 监控、动画预设、delayStart 延迟启动 |
| | `validate.ts` | 输入验证（XSS 净化、数值范围、导入数据校验） |
| | `dataExport.ts` | JSON/CSV 序列化、版本校验、文件下载 |
| | `debounce.ts` | 防抖工具 |
| | `timeslicing.ts` | 时间分片工具 |
| | `themeColors.ts` | 颜色系统 + 渐变定义 + 暗色检测 + 4 套主题 |
| | `d3Imports.ts` | D3 子模块按需导入 |
| | `performanceBenchmark.ts` | 性能基准测试工具 |
| | `shareUtils.ts` | 分享数据 Base64 编解码 |
| | `visualizerLayout.ts` | 可视化公共居中布局工具，统一数组/栈/队列/链表等主体定位 |
| | `learningRecommender.ts` | 学习推荐算法，基于学习进度智能推荐下一步学习内容 |
| **i18n** | `locales.ts` | 完整中英文翻译键值对（含 skipList / unionFind / redBlackTree / globalSearch 命名空间） |
| **Configs** | `learning/*.config.ts` | 学习模式算法步骤配置（37 个配置，含 3 个拓展主题：complexityAnalysis/advancedDataStructures/realWorldApplications） |
| **Data** | `searchIndex.ts` | 全局搜索索引数据源，聚合数据结构/算法/页面元数据供 GlobalSearch 检索 |
| **Types** | `*.d.ts` | TypeScript 类型声明文件 |

---

## 2. 核心设计决策

### 2.1 状态管理：自定义 Hook + useRef 历史栈

**决策:** 不使用 Redux/Zustand 等外部状态库，使用 React 内置 Hooks（useState + useRef + useCallback + useMemo）管理状态。

**理由:**
- 项目复杂度适中，全局状态有限
- 各数据结构页面状态独立，无需跨页面共享
- useRef 存储历史栈可避免不必要的重渲染
- 轻量，无额外依赖

**实现:**
```typescript
// useHistory.ts — 基于 useRef 的历史栈
const historyRef = useRef<T[]>([initialState])
const indexRef = useRef(0)

// 每个数据结构 Hook 内部使用 useHistory
const { state: data, push, undo, redo } = useHistory<number[]>(INITIAL_DATA)
```

**约束:**
- 历史栈最大长度 20，超出时移除最早记录
- 动画期间禁用 Undo/Redo
- 复杂状态变更（如排序后）添加禁止标识，避免误撤销

### 2.2 可视化渲染：D3 全量清除 + 全新渲染

**决策:** 不使用 D3 的 enter/update/exit 数据绑定模式，采用**全量清除 + 全新渲染**策略。主体居中布局由 `visualizerLayout.ts` 公共工具统一处理。

**理由:**
- 数据结构可视化中元素位置关系复杂（树、图、链表）
- 增量更新需要稳定的 key，但数据结构操作中元素位置变化频繁
- 全量渲染代码更直观，维护更简单
- 教学场景数据量不大（通常 < 50 元素），性能可接受
- 公共居中工具避免数组/栈/队列/链表等重复实现定位逻辑

**实现:**
```typescript
export function renderArray(svg: SVGSVGElement, data: number[], options: RenderOptions) {
  const container = d3.select(svg)
  container.selectAll('*').remove() // 全量清除

  // 重新创建所有元素
  data.forEach((value, index) => {
    const group = container.append('g')
    group.append('rect') // 矩形条
    group.append('text') // 数值
    group.append('text') // 索引标注
  })
}
```

**性能优化:**
- 大数据量（> 50 元素）跳过 transition 动画，直接更新 DOM
- 动画时长根据数据量自适应调整（normal/medium/high/critical 模式）
- FPS 监控，低帧率时自动降级动画

**约束:**
- 大数据量时 D3 全量清除重建性能下降（> 50 元素时 noticeable）
- 图力导向模拟在主线程执行，> 20 节点时帧率下降

### 2.3 动画引擎：集中式时序控制

**决策:** 将所有动画相关的时序控制集中到 `animationEngine.ts`，提供统一的 `duration()`、`wait()`、`transition()` 函数。

**理由:**
- 统一动画速度控制（全局 speedMultiplier）
- 统一性能模式适配（根据数据量自动调整时长）
- 统一缓动函数库（EASING 常量）
- 支持动画预设系统（5 种预设：standard/soft/fast/dramatic/instant）
- 支持 FPS 监控和自适应降级
- 支持 delayStart 延迟启动（配合 AnimationDelayIndicator 提供可视化反馈）

**实现:**
```typescript
// 动画时长计算
export function duration(baseMs: number, dataLength?: number): number {
  let adjusted = baseMs
  // 性能模式调整
  if (dataLength && dataLength > LARGE_DATA_THRESHOLD) {
    adjusted *= PERFORMANCE_MODE_MULTIPLIER
  }
  // FPS 自适应
  if (currentFPS < LOW_FPS_THRESHOLD) {
    adjusted *= FPS_ADJUSTMENT
  }
  return adjusted / speedMultiplier
}
```

**约束:**
- 全局 speedMultiplier 为模块级变量，非 React 状态
- 动画函数通过 `anim?.isAborted?.()` 支持中止
- delayStart 延迟启动期间通过 AnimationDelayIndicator 提供视觉反馈

### 2.4 SVG 渲染：viewBox 方案

**决策:** SVG 使用 `viewBox` 属性替代 `width`/`height` 属性。

**理由:**
- 避免 CSS `w-full h-full` 与 SVG 属性值冲突导致的**双重坐标系问题**
- 旧代码 `width={dimensions.width}` + `className="w-full h-full"` → SVG 有**两套独立的尺寸系统**（属性值视口 vs CSS 显示尺寸）
- 当两者不一致时浏览器缩放 SVG 内容，D3 坐标与实际渲染位置不匹配，导致亚像素渲染白点伪影和元素位置偏移
- 新代码 `viewBox="0 0 ${w} ${h}"` + `className="w-full h-full"` → 只有一套坐标系（viewBox），CSS 控制显示尺寸，viewBox 控制内容映射，始终一致

**实现:**
```tsx
<svg
  ref={svgRef}
  viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
  className="w-full h-full"
  preserveAspectRatio="xMidYMid meet"
>
```

### 2.5 TypeScript：渐进式迁移 → 100% 覆盖

**决策:** 从 JavaScript 渐进式迁移到 TypeScript，最终达到 100% .ts/.tsx 覆盖。

**理由:**
- 类型安全提升开发体验，减少运行时错误
- IDE 智能提示提升开发效率
- 渐进式迁移降低一次性重写风险

**过程:**
- v3.x: JavaScript 代码基
- v5.0-v5.6: 逐步迁移 hooks、components、pages 为 .ts/.tsx
- v5.7: 全部组件迁移完成
- v6.x: 工具函数逐步迁移，类型声明文件在 `types/` 目录

**约束:**
- `tsconfig.json` 配置 `allowJs: true` 支持渐进迁移
- `noUnusedLocals` 和 `noUnusedParameters` 开启，要求清理未使用变量

### 2.6 路由：React Router v7 + 懒加载

**决策:** 使用 React Router v7 管理路由，所有页面组件通过 `React.lazy` 懒加载。

**理由:**
- 首屏加载优化：主 bundle 从 495KB 降至 321KB
- 23 个独立 chunk，按需加载
- 配合 `Suspense` 显示加载状态

**实现:**
```tsx
const ArrayPage = lazy(() => import('./pages/ArrayPage'))
const StackPage = lazy(() => import('./pages/StackPage'))
// ...

<Route path="/array" element={<ArrayPage />} />
```

### 2.7 测试策略：Vitest + Testing Library + Playwright

**决策:** 单元测试使用 Vitest + React Testing Library，E2E 测试使用 Playwright。

**理由:**
- Vitest 与 Vite 深度集成，配置简单，HMR 支持
- React Testing Library 鼓励用户视角的测试（查询 DOM 而非内部状态）
- Playwright 提供真实的浏览器环境，测试更可靠

**覆盖策略:**
- 核心状态逻辑（hooks）— 高优先级
- 工具函数（utils）— 高优先级
- 组件交互（components）— 中优先级
- E2E 核心流程 — 中优先级

**当前状态:**
- 3506 个单元测试（204 个测试文件），100% 通过率，TypeScript strict 模式
- 9 个 E2E 测试文件，282 用例，98.2% 通过率（Chromium + Firefox）
- axe-core WCAG 2 AA 零 violations

---

## 3. 数据流

### 3.1 用户操作流程

```
用户输入/点击
    ↓
Page 组件事件处理函数
    ↓
State Hook 操作函数（如 insert, push, enqueue）
    ↓
输入验证（validate.ts）
    ↓
数据结构逻辑更新
    ↓
useHistory.push(新状态) — 记录历史
    ↓
添加操作日志
    ↓
触发 Toast 通知（成功/失败）
    ↓
自动保存到 localStorage（数据持久化）
    ↓
React 状态更新 → 组件重渲染
    ↓
Visualizer 组件接收新 data
    ↓
renderFn 调用（D3 全量渲染）
    ↓
SVG DOM 更新
    ↓
Timeline 更新（操作历史可视化）
```

### 3.2 动画流程

```
用户触发操作（如"插入"）
    ↓
State Hook 更新数据
    ↓
Page 组件调用 animate* 函数（可选）
    ↓
获取 AnimationContext（自动中止旧动画）
    ↓
执行 D3 transition 动画
    ↓
每步检查 anim.isAborted()
    ↓
动画完成 → 调用 renderFn 全量渲染最终状态
```

### 3.3 学习模式流程

```
用户点击"学习模式"按钮
    ↓
useLearningMode(algorithmKey)
    ↓
从 configs/learning/index.ts 查找 algorithmKey 对应配置
    ↓
加载 LearningModeConfig.steps 步骤序列（每算法 3-4 步）
    ↓
StepExplainer 显示当前步骤：标题 + 描述 + 代码片段 + 高亮
    ↓
用户点击"下一步"/"上一步"
    ↓
更新 currentStepIndex → 同步更新代码高亮行和关键词
    ↓
useLearningProgress 记录进度（CustomEvent 同步到 ProgressOverview）
    ↓
可选：触发对应数据结构操作演示
    ↓
用户点击"停止" → 退出学习模式
```

**配置数据流：**

```
configs/learning/*.config.ts  (独立配置模块，含拓展主题)
    ↓
configs/learning/index.ts     (统一导出 learningConfigs)
    ↓
useLearningMode.ts            (导入配置，管理状态)
    ↓
StepExplainer.tsx             (接收当前步骤数据，渲染 UI)
```

### 3.3.1 学习路径系统架构（v9.0 新增）

**核心组件协作：**

```
useLearningProgress (重构版)
  ├── CustomEvent 同步机制 → 跨组件进度实时同步
  ├── SyncStatus 状态 → 同步状态可视化
  ├── 统计 API → 学习时长/完成率/连续学习天数
  └── 目标设定 → 用户自定义学习目标
        ↓
ProgressOverview 组件
  ├── 进度环 → 整体学习进度可视化
  ├── 统计卡片 → 关键指标展示
  └── 目标设定 → 用户目标管理
        ↓
learningRecommender 推荐算法
  ├── 基于学习进度分析
  ├── 基于学习历史分析
  └── 推荐下一步学习内容
        ↓
LearningRecommendations 组件
  └── 展示推荐内容（卡片式 UI）
```

**内容分层架构：**

```
ContentTier 组件
  ├── 基础层 (basic) → 核心概念与基础操作
  ├── 进阶层 (advanced) → 进阶算法与优化技巧
  └── 拓展层 (extension) → 实际应用与拓展主题
        ↓
集成到 5 个核心数据结构页面
  ├── ArrayPage
  ├── LinkedListPage
  ├── TreePage
  ├── GraphPage
  └── SortPage
```

### 3.4 分享流程

```
用户点击"分享"按钮
    ↓
ShareButton 获取当前数据结构状态
    ↓
shareUtils.encodeShareData(data, dataType)
    ↓
JSON.stringify → Base64 URL-safe 编码
    ↓
生成 URL: ?share=<encoded>
    ↓
复制到剪贴板 + Toast 提示
    ↓
接收方访问 URL
    ↓
Page 组件解析 URL 参数
    ↓
shareUtils.decodeShareData(encoded)
    ↓
Base64 解码 → JSON.parse → 加载数据
```

### 3.5 国际化流程

```
应用启动
    ↓
useI18n 从 localStorage 读取语言设置（默认中文）
    ↓
加载 locales.ts 对应语言翻译表
    ↓
t(key) 函数根据当前语言返回翻译文本
    ↓
用户切换语言 → 更新 localStorage → 全应用重渲染
```

---

## 4. 模块依赖关系

### 4.1 核心依赖链

```
main.tsx
  └── App.tsx
        ├── Layout.tsx
        │     ├── Sidebar.tsx ──→ useTheme ──→ useI18n（导出 STRUCTURE_KEYS）
        │     ├── KeyboardHelp.tsx ──→ useGlobalSettings
        │     ├── GlobalSearch.tsx ──→ searchIndex ──→ Sidebar.STRUCTURE_KEYS
        │     └── PerformanceMonitor.tsx
        ├── Home.tsx ──→ useGlobalSettings
        ├── ArrayPage.tsx ──→ useArrayState ──→ useHistory
        │                     ├── useVisualizer
        │                     ├── arrayVisualizer ──→ animationEngine
        │                     └── useCommonKeyboard ──→ useKeyboard
        ├── StackPage.tsx ──→ useStackState ──→ useHistory
        ├── QueuePage.tsx ──→ useQueueState ──→ useHistory
        ├── LinkedListPage.tsx ──→ useLinkedListState ──→ useHistory
        │                          ├── useLearningMode
        │                          └── linkedListVisualizer
        ├── TreePage.tsx ──→ useTreeState ──→ useHistory
        │                    ├── useLearningMode
        │                    └── treeVisualizer
        ├── GraphPage.tsx ──→ useGraphState ──→ useHistory
        │                     └── graphVisualizer
        ├── SortPage.tsx ──→ useSortState ──→ useHistory
        │                    ├── algorithms/sorting/*
        │                    ├── useLearningMode
        │                    └── sortVisualizer
        ├── HashPage.tsx ──→ useHashState ──→ useHistory
        │                    ├── useLearningMode
        │                    └── hashVisualizer
        ├── HeapPage.tsx ──→ useHeapState ──→ useHistory
        ├── TriePage.tsx ──→ useTrieState ──→ useHistory
        ├── SkipListPage.tsx ──→ useSkipListState ──→ useHistory
        │                        ├── algorithms/skipList
        │                        ├── useLearningMode
        │                        └── skipListVisualizer
        ├── UnionFindPage.tsx ──→ useUnionFindState ──→ useHistory
        │                          ├── algorithms/unionFind
        │                          ├── useLearningMode
        │                          └── unionFindVisualizer
        ├── RedBlackTreePage.tsx ──→ useRedBlackTreeState ──→ useHistory
        │                             ├── algorithms/redBlackTree
        │                             ├── useLearningMode
        │                             └── redBlackTreeVisualizer
        ├── SortComparePage.tsx ──→ useSortState ──→ useHistory
        │                           ├── algorithms/sorting/*
        │                           ├── PerformanceChart ──→ d3Imports
        │                           └── Timeline
        └── GraphAlgorithmPage.tsx ──→ useGraphState ──→ useHistory
                                     ├── algorithms/graph/*
                                     ├── StepExplainer
                                     ├── ComplexityChart ──→ d3Imports
                                     └── graphVisualizer
        └── LearningPath.tsx ──→ useLearningProgress
                                 ├── ProgressOverview
                                 ├── LearningRecommendations ──→ learningRecommender
                                 └── ContentTier（5 个核心页面集成）
```

### 4.2 工具模块复用

| 工具模块 | 被依赖方 |
|---------|---------|
| `animationEngine.ts` | 所有 visualizers、PerformanceMonitor、AnimationDelayIndicator |
| `validate.ts` | 所有 use*State hooks |
| `themeColors.ts` | 所有 visualizers、components |
| `d3Imports.ts` | 所有 visualizers、PerformanceChart、ComplexityChart |
| `dataExport.ts` | ExportImport 组件、各 Page |
| `shareUtils.ts` | ShareButton 组件、各 Page |
| `useHistory.ts` | 所有 use*State hooks |
| `useVisualizer.ts` | 所有 Page |
| `useKeyboard.ts` | useCommonKeyboard、各 Page |
| `visualizerLayout.ts` | arrayVisualizer、stackVisualizer、queueVisualizer、linkedListVisualizer |
| `learningRecommender.ts` | LearningRecommendations 组件、LearningPath 页面 |
| `useLearningProgress.ts` | ProgressOverview、LearningRecommendations、LearningPath、各学习模式页面 |
| `searchIndex.ts` | GlobalSearch 组件 |

---

## 5. 关键约束

### 5.1 动画约束

| 约束 | 说明 | 影响 |
|------|------|------|
| 动画只做视觉引导 | 高亮、指示器、颜色变化，不改变数据结构 | 位置重排由 render 函数处理 |
| 动画不改变位置 | 元素位置变更由数据更新 + 全量渲染处理 | 避免动画与渲染冲突 |
| 动画不创建持久 DOM | 临时元素在动画结束时清理 | 防止 DOM 泄漏 |
| 动画必须支持中止 | 每步检查 `anim?.isAborted?.()` | 支持操作中断和快速切换 |
| 动画期间禁用操作 | 所有操作按钮在动画期间 disabled | 防止状态混乱 |
| 动画期间禁用 Undo | 历史栈操作在动画期间禁用 | 防止撤销到不一致状态 |

### 5.2 渲染约束

| 约束 | 说明 | 影响 |
|------|------|------|
| 全量渲染 | 每次数据变化清除全部 SVG 重新渲染 | 大数据量时性能下降 |
| viewBox 方案 | SVG 使用 viewBox 而非 width/height | 避免双重坐标系问题 |
| ResizeObserver | 监听容器尺寸变化 | 响应式布局支持 |
| 大数据量优化 | > 50 元素跳过 transition | 保持基本可用性 |
| FPS 自适应 | < 15 FPS 跳过动画 | 低性能设备降级 |

### 5.3 状态管理约束

| 约束 | 说明 | 影响 |
|------|------|------|
| 历史栈最大 20 步 | 超出时移除最早记录 | 内存控制 |
| Undo 不触发动画 | 撤销操作直接更新状态并渲染 | 快速回溯 |
| 复杂状态禁止标识 | 排序等复杂操作后添加 undoBlock | 防止误撤销到中间状态 |
| localStorage 自动保存 | 每次操作后异步保存 | 页面刷新数据不丢失 |
| 输入范围限制 | 数值 1~99，索引边界检查 | 防止非法输入 |

### 5.4 安全约束

| 约束 | 说明 | 影响 |
|------|------|------|
| XSS 净化 | `sanitizeInput()` 清理用户输入 | 防止脚本注入 |
| 导入数据校验 | `validateImportData()` 版本和结构校验 | 防止格式错误崩溃 |
| Base64 URL-safe | 分享数据使用 URL-safe Base64 | 避免 URL 编码问题 |

---

## 6. 已知限制

### 6.1 当前已知问题

| 编号 | 问题 | 严重度 | 状态 |
|------|------|--------|------|
| L-01 | jsdom 不支持 `scrollIntoView`，16 个测试失败 | 中 | 已知，待修复 mock |
| L-02 | E2E headless 模式 4 项失败（React 19 状态同步延迟） | 低 | 已知，有重试机制缓解 |
| L-03 | 树页面 SVG line 偶尔出现 NaN | 低 | 动画过渡时数值检查缺失 |
| L-04 | D3 全量清除重建在大数据量时性能下降 | 中 | 设计取舍，教学场景够用 |
| L-05 | 图力导向模拟在主线程执行，>20 节点卡顿 | 中 | 已知，可优化为 Web Worker |
| L-06 | 部分工具文件仍为 .js（未完全迁移到 .ts） | 低 | 待完成最终迁移 |

### 6.2 设计取舍

| 取舍 | 选择 | 理由 |
|------|------|------|
| 状态管理 | 自建 Hooks 而非 Redux | 复杂度适中，无需跨页面共享 |
| 渲染策略 | 全量清除而非 D3 增量更新 | 代码简单直观，教学场景数据量小 |
| 动画引擎 | 集中式模块而非分散 | 统一控制，支持全局调速和预设 |
| i18n | 自研轻量方案而非 react-intl | 仅中英双语，避免引入大型库 |
| 路由加载 | React.lazy 懒加载 | 首屏优化，代码分割 |
| TypeScript | 渐进式迁移 | 降低一次性重写风险 |

---

## 7. 扩展性设计

### 7.1 新增数据结构

遵循标准 8 步流程（详见 CODE_WIKI.md 7.5 节）：
1. 创建 State Hook (`hooks/use<Name>State.ts`)
2. 创建 Visualizer (`visualizers/<name>Visualizer.ts`)
3. 创建 Page (`pages/<Name>Page.tsx`)
4. 注册路由 (`App.tsx`)
5. 添加导航 (`Sidebar.tsx`)
6. 更新首页 (`Home.tsx`)
7. 添加测试 (`__tests__/use<Name>State.test.ts`)
8. 更新文档

### 7.2 新增排序算法

1. 在 `algorithms/sorting/` 实现算法函数
2. 在 `algorithms/sorting/index.ts` 注册算法
3. `useSortState` 自动识别新算法
4. `SortPage` 和 `SortComparePage` 自动支持

### 7.3 新增图算法

1. 在 `algorithms/graph/` 实现算法函数
2. 在 `algorithms/graph/index.ts` 导出
3. `GraphAlgorithmPage` 集成新算法步骤
4. 在 `configs/learning/` 创建学习步骤配置文件
5. 在 `configs/learning/index.ts` 注册配置

### 7.4 新增学习模式算法

1. 在 `configs/learning/` 创建 `<algorithm>.config.ts`
2. 定义 `algorithmKey` 和 `steps` 数组（每步包含 id/title/description/codeSnippet/highlightedLine/highlightTerms）
3. 在 `configs/learning/index.ts` 导入并注册到 `learningConfigs`
4. 在页面组件中调用 `useLearningMode('<algorithmKey>')`
5. 运行 `npm run lint && npm run build` 验证

**命名规范：**
- 文件名：`camelCase.config.ts`（如 `bellmanFord.config.ts`）
- 配置变量：`xxxConfig`（如 `bellmanFordConfig`）
- algorithmKey：`camelCase`（如 `'bellmanFord'`）

### 7.5 新增主题

1. 在 `themeColors.ts` 的 `THEMES` 对象中添加新主题配置
2. 所有 visualizers 和 components 自动适配

---

## 8. 代码风格规范

### 8.1 Import 风格

- **类型导入使用 `type` 前缀**：从模块导入类型时，使用 `import { type ReactNode } from 'react'` 或 `import { type Locale } from './locales'`，明确区分类型导入与值导入，便于 tree-shaking。
- **移除未使用的 `import React`**：React 19 + 自动 JSX runtime 下无需显式导入 React。
- **`memo` 后置包装**：使用 `const Component = memo(function Component() {...})` 而非内联 `memo(() => {...})`，便于调试栈追踪与组件命名。

### 8.2 解构风格

- **`useDataStructureState` 多行解构**：当解构字段数 ≥ 4 时使用多行格式（4-5 字段/行），提升可读性：

```typescript
const {
  data, setData, logs, addLog, isAnimating, setIsAnimating,
  undo, redo, canUndo, canRedo, reset, loadData,
} = useDataStructureState(...)
```

### 8.3 catch 参数约定

- **统一使用 `catch (error)`**：所有 catch 块的参数命名为 `error`，不使用 `e` / `err`。
- **不使用变量时用 `catch {}`**：当 catch 块不需要使用错误对象时，使用 optional catch binding（`catch {}`），避免未使用变量警告。

### 8.4 共享常量

- **`src/visualizers/visualizerConstants.ts`**：提取跨多个 visualizer 值相同且语义一致的常量。
  - `DEFAULT_NODE_RADIUS = 22`：tree / avlTree / trie / heap 共用
  - `DEFAULT_LEVEL_HEIGHT = 80`：tree / avlTree 共用
- **仅提取完全相同的常量**：值不同或语义不同的常量保留在各 visualizer 内（如 visualizer 的 `GraphNode` 有 `fx/fy` 字段用于 D3 force simulation，与 hook 的 `GraphNode` 类型差异有意义，不强行去重）。

### 8.5 泛型 Hook

- **`useSharedData<T>` 泛型化**：`loadData` 类型从 `(data: unknown) => void` 改为 `(data: T) => void`，TypeScript 从调用方传入的 `loadData` 函数自动推断类型 `T`，消除 `as any` 滥用：

```typescript
// 旧：as any 滥用
loadData: ((d: unknown) => loadData(d as any)) as any

// 新：直接传递，类型自动推断
loadData
```

### 8.6 注释语言

- **业务注释使用中文**：代码内的业务逻辑注释、TODO、说明性注释使用中文。
- **JSDoc 保留英文**：公共 API 的 JSDoc 文档注释保留英文，便于工具链解析。
- **技术术语不翻译**：localStorage、DOM、hover、LEVEL_HEIGHT、FPS 等技术术语保留原文。
- **不修改测试文件注释**：测试文件的注释保持原样，避免影响测试快照。

### 8.7 ESLint 配置

- **使用 `tseslint.config`**：`eslint.config.js` 从 `defineConfig` 改为 `tseslint.config`，支持 TS 文件检查。
- **覆盖 TS 文件**：通过 `...tseslint.configs.recommended` 规则集覆盖 `**/*.{ts,tsx}` 文件。
- **`@typescript-eslint/no-unused-vars`**：启用规则，`varsIgnorePattern: '^_'`（下划线前缀变量不报错）。
- **已有代码模式降级为 warn**：`react-hooks/set-state-in-effect` 和 `react-hooks/refs` 降级为 `warn`，避免破坏已有功能模式。
- **测试文件规则放宽**：`src/__tests__/**` 关闭 `@typescript-eslint/no-unsafe-function-type` 等规则，适配测试场景。

---

## 9. 技术债务

| 债务项 | 说明 | 优先级 | 计划 |
|--------|------|--------|------|
| 残留 .js 工具文件 | `animationEngine.js` 等 19 个文件待迁移为 .ts | 中 | Sprint 1 |
| console.error 清理 | 42 处生产环境 console 调用待清理 | 中 | Sprint 1 |
| jsdom 测试失败 | 16 个失败测试待修复 mock | 中 | Sprint 2 |
| E2E headless 失败 | 4 项失败待修复 | 低 | Sprint 2 |
| 覆盖率提升 | 目标 80%+，当前核心逻辑 ~70% | 中 | Sprint 3 |
| D3 增量更新评估 | 大数据量性能优化 | 低 | Sprint 4 |
| 图力导向 Web Worker | 主线程阻塞优化 | 低 | Sprint 4 |

---

> 本文档最后更新于 2026-06-20，与代码库版本 v12.0 同步维护。
