# API Reference — 公共 API 文档

> **版本**: v20 (基于 v17.0.0 GA)
> **更新日期**: 2026-06-22
> **目标读者**: 二次开发工程师 / AI 协作 / Code Review
> **范围**: 项目内可被外部模块调用的 **公共 API**(non-internal exports)
> **生成方式**: 人工 + JSDoc 抽取(避免 typedoc 全量扫描的冗余)

---

## 0. 阅读指南

- **公共 API**: 指 `export` 修饰且**非 `_` 开头**的符号(函数 / Hook / 组件 / 类型 / 常量)
- **内部 API**: 文件内未导出的辅助函数 + `// @internal` 标记的导出
- **测试 API**: 仅 `*.test.ts` / `*.test.tsx` 引用,生产代码未使用
- **完整类型契约**: 见 `src/types/*.d.ts`(参考索引见 §7)

---

## 1. 状态管理层 — `src/hooks/*`

### 1.1 通用 Hook

#### `useHistory<T>(initialState: T): UseHistoryReturn`

基于 `useRef` 的撤销/重做历史栈,最多保留 **20 步**。

```ts
const { state, push, undo, redo, canUndo, canRedo, reset, setUndoBlock } = useHistory([1, 2, 3])
push([1, 2, 3, 4])   // 入栈新状态
undo()                // 回到 [1, 2, 3]
redo()                // 恢复 [1, 2, 3, 4]
setUndoBlock(true)    // 阻塞 undo/redo(动画期间)
```

| 返回字段 | 类型 | 用途 |
|---------|------|------|
| `state` | `T` | 当前状态 |
| `push(state)` | `(state: T) => void` | 入栈新状态 |
| `undo()` | `() => T \| null` | 撤销(返回新状态或 null) |
| `redo()` | `() => T \| null` | 重做 |
| `canUndo` | `boolean` | 能否撤销 |
| `canRedo` | `boolean` | 能否重做 |
| `reset(state)` | `(state: T) => void` | 重置历史栈 |
| `setUndoBlock(bool)` | `(blocked: boolean) => void` | 阻塞/解除撤销 |

**实现细节**: 历史栈存于 `useRef`(不触发重渲染),超出 20 步时 `shift()` 最早记录。`undoBlockedRef` 防止动画进行中的中间状态被破坏。

#### `useDataStructureState<T>(initial: T, options): UseDataStructureStateReturn`

数据结构的统一状态管理:历史栈 + localStorage 持久化 + 日志 + 重置。

```ts
const {
  data, logs, isAnimating,
  setIsAnimating, push, addLog, reset, loadData,
  undo, redo, canUndo, canRedo,
  getUndoPreview, getRedoPreview,
} = useDataStructureState<number[]>(INITIAL_DATA, {
  storageKey: 'array',
  abortAnimation: () => animationRef.current?.abort?.(),
})
```

| 返回字段 | 类型 | 用途 |
|---------|------|------|
| `data` | `T` | 当前数据(由 `useHistory` 提供) |
| `logs` | `LogEntry[]` | 操作日志(最多 100 条) |
| `isAnimating` | `boolean` | 是否正在执行动画 |
| `setIsAnimating(bool)` | `Dispatch<SetStateAction<boolean>>` | 设置动画状态 |
| `push(state)` | `(state: T) => void` | 推入新状态到历史栈 |
| `addLog(type, msg)` | `(type: string, msg: string) => void` | 添加日志 |
| `reset()` | `() => void` | 重置为 initial |
| `loadData(data)` | `(data: T) => void` | 加载数据(校验后入栈) |
| `undo()` / `redo()` | 同 `useHistory` | |
| `getUndoPreview()` / `getRedoPreview()` | `() => T \| null` | 预览上/下一步(不触发渲染) |

**Storage 契约**:
- key 格式: `ds-visualizer-data-{storageKey}`
- 写入节流: `STORAGE_WRITE_DEBOUNCE_MS = 150`
- 加载校验: 调用 `validateStoredData` 验证深度 ≤ `MAX_STORAGE_DEPTH = 10` 且只接受 JSON 原生类型

#### `useVisualizer(options?): UseVisualizerReturn`

D3 SVG 渲染管理(基于 ResizeObserver + RAF)。

```ts
const { svgRef, dimensions, isReady, reRender } = useVisualizer({
  debounceMs: 100,    // 默认 100ms 防抖
  minWidth: 100,
  minHeight: 100,
})
```

| 返回字段 | 类型 | 用途 |
|---------|------|------|
| `svgRef` | `RefObject<SVGSVGElement>` | D3 容器 ref |
| `dimensions` | `{ width: number, height: number }` | 当前视口尺寸 |
| `isReady` | `boolean` | 容器初始化完成(可安全调用 `d3.select(svgRef.current)`) |
| `reRender()` | `() => void` | 强制重新触发 render effect |

**关键设计**: RAF id 提为 ref 避免闭包错乱;cleanup 时取消未完成的 forceSimulation。

---

### 1.2 数据结构专用 Hook(15 个)

所有数据结构 Hook 内部基于 `useDataStructureState<T>`,返回 `data + 业务方法`:

| Hook | 数据类型 | 关键方法 | Storage Key |
|------|----------|----------|-------------|
| `useArrayState(abort?)` | `number[]` | `insert(v, i)` / `remove(i)` / `find(v)` / `randomize()` | `array` |
| `useStackState(abort?)` | `number[]` | `push(v)` / `pop()` / `peek()` | `stack` |
| `useQueueState(abort?)` | `number[]` | `enqueue(v)` / `dequeue()` / `peek()` | `queue` |
| `useLinkedListState(abort?)` | `LinkedListNode \| null` | `pushFront(v)` / `pushBack(v)` / `insertAt(v, i)` / `find(v)` / `reverse()` / `detectCycle()` / `switchDoubly()` | `linkedlist` |
| `useTreeState(abort?)` | `BinaryTreeNode \| null` | `insert(v)` / `search(v)` / `preorder()` / `inorder()` / `postorder()` / `levelorder()` / `setEdgeStyle()` | `tree` |
| `useAvlTreeState(abort?)` | `AvlNode \| null` | `insert(v)` / `search(v)` / `preorder()` / `inorder()` / `postorder()` / `levelorder()` | `avlTree` |
| `useRedBlackTreeState(abort?)` | `RBNode \| null` | `insert(v)` / `search(v)` / `inorder()` | `redBlackTree` |
| `useBTreeState(abort?)` | `BTreeNode \| null` | `insert(v)` / `search(v)` / `inorder()` | `bTree` |
| `useSegmentTreeState(abort?)` | `SegmentTreeNode \| null` | `build(arr)` / `query(l, r)` / `update(i, v)` | `segmentTree` |
| `useGraphState(abort?)` | `{ nodes, links }` | `addNode(v)` / `removeNode(id)` / `addEdge(from, to, w?)` / `removeEdge(from, to)` | `graph` |
| `useHashState(abort?)` | `HashTable` | `insert(k, v)` / `remove(k)` / `search(k)` | `hash` |
| `useHeapState(abort?)` | `number[]` | `insert(v)` / `extractMax()` / `peek()` | `heap` |
| `useTrieState(abort?)` | `TrieNode \| null` | `insert(word)` / `remove(word)` / `search(word)` / `prefixSearch(prefix)` | `trie` |
| `useSkipListState(abort?)` | `SkipListNode \| null` | `insert(v)` / `remove(v)` / `search(v)` | `skipList` |
| `useUnionFindState(abort?)` | `Map<number, number>` | `makeSet(x)` / `find(x)` / `union(a, b)` / `connected(a, b)` | `unionFind` |
| `useSortState(abort?)` | `number[]` | `run(algo, options)` / `stop()` / `randomize()` / `setAlgorithm()` | `sort` |

**统一错误反馈**: 所有 Hook 通过 `showToast({ type: 'error', ... })` 反馈,符合 [project_rules §9.4](#9-工程化硬核守护)。

---

### 1.3 通用 UI Hook

#### `useI18n(): { t, lang, setLanguage, supportedLanguages }`

国际化 Hook(响应式,语言切换触发重渲染)。

```ts
const { t, lang, setLanguage } = useI18n()
t('array.title')                    // '数组'
setLanguage('en')                   // 切换到英文
```

#### `tStatic(key: string): string`

**静态** i18n 解析(不触发重渲染,适合模块顶层常量/工具函数)。

```ts
import { tStatic } from '@/i18n/useI18n'
const THEME_NAME = tStatic('sidebar.themeDefault')  // '默认主题'
```

**重要约束**: `tStatic` 内部读取 `localStorage`,只能在浏览器环境调用;SSR/测试需要 mock。

#### `useGlobalSettings(): { theme, colorTheme, setColorTheme, lang, setLang, ... }`

全局用户偏好(明暗模式 + 颜色主题 + 语言),持久化到 localStorage。

#### `useTheme()` / `useColorTheme()`

主题相关的细分 Hook(明暗模式 / 4 套颜色主题)。

#### `useKeyboard(shortcuts): void` / `useCommonKeyboard(): void`

全局键盘快捷键 Hook(自定义 / 通用预设)。

#### `useLearningMode(algorithmKey, options?): { currentStep, goToStep, next, prev, isAnimating, ... }`

学习模式 Hook(驱动 `StepExplainer` + 教学步骤)。

#### `useLearningProgress(): { completedModules, ... }`

学习进度管理(15 个数据结构 + 完成度)。

#### `usePageTracker(): void`

页面访问追踪(用于"最近访问"功能)。

#### `useQuizProgress(algorithmKey): { ... }`

测验进度管理(答题、得分、重置、持久化)。

#### `useSearchHistory(): { history, addQuery, removeQuery, clear }`

全局搜索历史(最多 10 条,localStorage 持久化)。

#### `useAlgorithmGlossary(): AlgorithmGlossaryEntry[]`

16 项算法术语(双语 name / description / useCase / 时间空间复杂度)。

#### `useGestures(options): { onSwipeLeft, onSwipeRight, ... }`

5 种移动端手势(pinch / swipeH / swipeV / longPress / tap)。

#### `useSharedData<T>(options): { data, setData, ... }`

跨页面共享数据(基于 React Context)。

---

## 2. 工具层 — `src/utils/*`

### 2.1 动画与可视化

#### `animationEngine`

```ts
import { duration, wait, transition, setSpeedMultiplier, getSpeedMultiplier,
         startFPSMonitor, stopFPSMonitor, isFPSDegraded,
         ANIMATION_PRESETS, applyPreset, easeCubicOut } from '@/utils/animationEngine'

duration(500)                    // 500ms * 当前速度倍率
wait(500)                        // 等待 500ms(可中断)
setSpeedMultiplier(2)            // 2x 速度
applyPreset('snappy')            // 应用 snappy 预设(2x + easeCubicOut)
```

| 导出 | 类型 | 用途 |
|------|------|------|
| `duration(ms)` | `(ms: number) => number` | 速度调整后的时长(基线 60fps) |
| `wait(ms)` | `(ms: number) => Promise<void>` | 可中断等待(返回 abortable promise) |
| `transition(sel, opts)` | `D3Transition` | D3 transition + 速度倍率 |
| `setSpeedMultiplier(n)` / `getSpeedMultiplier()` | 速度倍率控制 |
| `startFPSMonitor()` / `stopFPSMonitor()` | FPS 监控(自动降级) |
| `isFPSDegraded()` | `boolean` | 是否已降级(>3s < 20fps 或 > 100ms 帧阻塞) |
| `ANIMATION_PRESETS` | `Record<string, AnimationPreset>` | 5 种预设(default/gentle/snappy/dramatic/instant) |
| `applyPreset(key)` | `(key: string) => void` | 应用预设(中断当前动画) |
| `LARGE_DATA_THRESHOLD` | `number = 100` | 大数据阈值(>100 元素跳过动画) |

**约束**: 动画函数**仅处理视觉反馈**(颜色/高亮/掉落),不移动元素或创建持久 DOM(位置由 visualizer 全渲染负责)。

#### `animationExport`

```ts
import { isAnimationExportSupported, exportWebM, exportGIF, exportFramesZip, loadSvgImage } from '@/utils/animationExport'
```

- `isAnimationExportSupported()` — 特征检测(MediaRecorder API)
- `exportWebM(svgRef, durationMs, fps)` — WebM 视频导出
- `exportGIF(svgRef, frames, fps)` — GIF 导出(基于 gifenc)
- `exportFramesZip(svgRef, frames)` — 帧序列 ZIP(基于 jszip)
- 上限 600 帧保护

#### `visualizerLayout`

跨 visualizer 共享的居中布局工具。

```ts
import { computeCenteredLayout, getResponsiveDimensions } from '@/utils/visualizerLayout'
```

#### `d3Imports`

D3 子模块按需导入(避免 bundle 膨胀)。

```ts
import { select, scaleLinear, easeCubicOut } from '@/utils/d3Imports'
```

#### `themeColors`

```ts
import { getColors, getTheme, setTheme, getAvailableThemes, initTheme,
         gradUrl, ensureGradientDefs, getThemeSurfaceTokens } from '@/utils/themeColors'
```

- 4 套颜色主题(default / forest / warm / royal)
- WCAG 2 AA 对比度保证(详见 §4.5)
- 渐变定义 + 暗色检测

#### `performanceConfig`

```ts
import { isLargeData, PERFORMANCE_THRESHOLDS } from '@/utils/performanceConfig'
```

`isLargeData(count)` — 判断是否进入性能模式(>100 元素)。

#### `timeslicing`

基于 `requestIdleCallback` 的时间分片工具(避免长任务阻塞主线程)。

```ts
import { runInIdle } from '@/utils/timeslicing'
await runInIdle(() => heavyComputation(), { timeout: 200 })
```

---

### 2.2 数据与校验

#### `validate`

```ts
import { validateNumericInput, getValidationError, sanitizeInput, validateImportData } from '@/utils/validate'
```

| 函数 | 签名 | 用途 |
|------|------|------|
| `validateNumericInput(v, min=1, max=99)` | `(string\|number, number, number) => { valid, value }` | 数值范围校验 |
| `getValidationError(v, min=1, max=99)` | 返回 i18n 错误消息或 `null` | 校验 + 返回本地化错误 |
| `sanitizeInput(v, maxLen=100)` | XSS 净化(`<>"'`&\;` 移除) |
| `validateImportData(raw)` | JSON 导入数据校验(Schema 兼容) |

**约束**: 所有用户输入**必须**经 `getValidationError` 校验(详见 [project_rules §11](#11-地基红线))。

#### `schema`

```ts
import { validateStoredData, MAX_STORAGE_DEPTH, type SchemaValidationResult } from '@/utils/schema'
```

- `validateStoredData(data)` — 递归深度校验(JSON 原生类型 + depth ≤ 10)
- `MAX_STORAGE_DEPTH` = 10
- 用于 `useDataStructureState.loadFromStorage` + `validateImportData`

#### `dataExport`

```ts
import { exportData, importData, exportToCSV, exportToJSON } from '@/utils/dataExport'
```

JSON 导入/导出 + 性能测试 CSV/JSON。

#### `shareUtils`

```ts
import { encodeShareData, decodeShareData } from '@/utils/shareUtils'
```

Base64 URL 分享(限 4000 字符)。

#### `fuzzySearch`

```ts
import { fuzzyMatch, fuzzyMatchAny } from '@/utils/fuzzySearch'
```

LCS-based 轻量模糊匹配(全局搜索用)。

#### `learningRecommender`

```ts
import { getRecommendedModules, getPersonalizedAdvice } from '@/utils/learningRecommender'
```

基于学习进度的下一步推荐。

---

### 2.3 工程与可观测

#### `errorHandler`

```ts
import { handleError, setupGlobalErrorHandler } from '@/utils/errorHandler'
```

全局错误捕获(未捕获 promise rejection / runtime error → Sentry)。

#### `sentry`

Sentry 集成封装(生产环境启用)。

#### `performanceLogger`

```ts
import { perfLogger } from '@/utils/performanceLogger'
perfLogger.log('fps', 'message', { context })
```

FPS / 动画 / 操作时延日志。

#### `debounce`

```ts
import { debounce } from '@/utils/debounce'
const fn = debounce((x: number) => console.log(x), 100)
```

通用防抖(100ms 默认)。

---

## 3. 国际化层 — `src/i18n/*`

### 3.1 类型与数据

- `src/i18n/locales.ts` — 顶层聚合入口(向后兼容,50+ 命名空间)
- `src/i18n/locales/types.ts` — `AssertSameKeys` 深度递归编译时断言
- `src/i18n/locales/integrity.ts` — 运行时镜像校验工具
- `src/i18n/locales/pseudoLocale.ts` — 伪语言生成器(测试)
- `src/i18n/locales/{zh,en}/{core,page,component,algorithm,learning}/` — 按语言 + 类别分目录(目录骨架已就位)

### 3.2 Hook 与工具

```ts
import { useI18n, tStatic } from '@/i18n/useI18n'
import { checkIntegrity, assertIntegrity, diffKeys } from '@/i18n/locales/integrity'
import { pseudoLocalize, isPseudoLocalized, PSEUDO_LOCALE_CODE } from '@/i18n/locales/pseudoLocale'
```

详见 [v19 i18n 渐进迁移](./docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) + [M3 TypeScript 强约束](./docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md)。

---

## 4. 公共组件 — `src/components/*`

### 4.1 核心可视化

#### `Visualizer`

```tsx
<Visualizer
  data={arrayData}
  ariaLabel="数组可视化"
  onRender={(svg) => arrayVisualizer.render(svg, data)}
  onSwipeLeft={() => prevStep()}
  onSwipeRight={() => nextStep()}
/>
```

D3 SVG 容器,管理尺寸、FPS、手势。`role="img"` + `aria-label` 由 `ariaLabel` prop 注入。

#### `PageHeader`

```tsx
<PageHeader
  title={t('array.title')}
  subtitle={t('array.subtitle')}
  icon={<Icon name="array" />}
/>
```

统一页面头部(标题 + 副标题 + 图标 + 导出按钮位)。

### 4.2 信息与日志

#### `InfoPanel`

```tsx
<InfoPanel
  algorithmKey="bubble"
  quizQuestions={bubbleQuizQuestions}
  logs={logs}
  addLog={addLog}
/>
```

统一信息面板:桌面端右侧 w-96 持久面板 + 移动端底部抽屉,双 Tab(操作日志 / 学习模式),含自动跳转机制(最新日志带 `codeStepId` 时切换到学习 tab)。

#### `LogPanel`

```tsx
<LogPanel logs={logs} variant="embedded" />  // InfoPanel 内嵌
<LogPanel logs={logs} variant="standalone" /> // 独立面板(向后兼容)
```

支持 4 种日志类型(oper / info / error / code),深色模式 4 色 accent 区分。

#### `Timeline`

操作历史时间线(图标匹配 + 悬停 tooltip + 键盘导航)。

### 4.3 学习与教学

- `StepExplainer` — 学习模式步骤解释(代码同步 + 上一步/下一步)
- `LearningModeToggle` — 学习模式开关
- `LearningPath` — 学习路径总览(15 个数据结构 + 依赖图)
- `LearningRecommendations` — 个性化推荐
- `AlgorithmGlossaryCard` — 16 项算法术语表
- `QuizPanel` — 测验面板(题目、选项、即时反馈、解释、进度)
- `ComplexityChart` — 复杂度增长曲线对比(8 色调色板)

### 4.4 操作与按钮

- `OperationBar` — 操作按钮区(移动端折叠 + 横向滚动)
- `OperationGroup` — 按钮分组(折叠/展开 + 嵌套渲染)
- `OperationButton` — 操作按钮(`isBusy` 状态 + 动画期间禁用)
- `Button` — 基础按钮(7 种变体 + 3 种尺寸 + 加载态 + busy 态)
- `Icon` — 8 个 stroke-based SVG 图标
- `PageHeader` — 页面标题组件

### 4.5 性能与监控

- `SpeedControl` — 动画速度滑块 + 5 种预设
- `PerformanceChart` — 排序算法性能对比柱状图
- `PerformanceIndicator` — 性能模式徽章
- `PerformanceMonitor` — 实时 FPS 监控
- `AnimationDelayIndicator` — 动画延迟提示
- `AnimationExportButton` — 动画导出菜单(WebM/GIF/ZIP)

### 4.6 通知与错误

- `Toast` + `showToast` — 全局 toast 通知
- `ErrorBoundary` — React 错误边界
- `NetworkStatus` — 在线/离线状态

### 4.7 全局导航

- `Layout` — 整体布局(Header + Sidebar + Main + InfoPanel)
- `Sidebar` — 数据结构导航(桌面端 + 移动端抽屉)
- `GlobalSearch` — Ctrl/Cmd+K 全局搜索(fuzzy + 历史 + 复杂度过滤)
- `KeyboardHelp` — `?` 键唤出快捷键帮助
- `ShareButton` — 分享数据到 URL
- `ExportImport` — JSON/CSV 导入导出按钮组
- `UndoRedoBar` / `UndoPreviewButton` — 撤销/重做工具栏
- `EmptyState` — 空状态引导
- `ReloadPrompt` — PWA 新版本提示
- `ProgressBar` / `ProgressOverview` — 进度展示
- `StatsOverlay` — 统计信息浮层
- `ColorLegend` — 图例

---

## 5. 算法与配置 — `src/algorithms/*` + `src/configs/learning/*`

### 5.1 算法注册模式

排序与图算法通过**插件注册**模式实现:

```ts
// src/algorithms/sorting/index.ts
import { bubbleSort } from './bubble'
import { quickSort } from './quick'
// ...注册
export const SORTING_ALGORITHMS = { bubble: bubbleSort, quick: quickSort, ... }
```

`useSortState` 与排序页面**自动检测**已注册算法,无需手动接入。

### 5.2 学习配置

每个算法对应一个 `src/configs/learning/{algo}.config.ts`:

```ts
// src/configs/learning/bubble.config.ts
export const bubbleConfig: LearningModeConfig = {
  algorithmKey: 'bubble',
  steps: [
    { id: 1, title: '...', description: '...', code: ['...'] },
    // ...
  ],
}
```

注册入口:`src/configs/learning/index.ts`(当前 40 个配置)。

详见 [docs/ALGORITHM_INTEGRATION_GUIDE.md](./docs/ALGORITHM_INTEGRATION_GUIDE.md)。

---

## 6. 类型声明 — `src/types/*.d.ts`

| 文件 | 内容 |
|------|------|
| `hooks.d.ts` | 所有 `use*State` Hook 的 state 类型(ArrayState / StackState / ...) |
| `visualizers.d.ts` | Visualizer 共享类型(Position / Node / Edge) |
| `animationEngine.d.ts` | AnimationPreset / TransitionOptions |
| `learning.d.ts` | LearningStep / QuizQuestion / LearningModeConfig |
| `toastStore.d.ts` | Toast / ToastOptions |
| `validate.d.ts` | ValidationResult |
| `pwa.d.ts` | virtual:pwa-register 类型 |
| `gifenc.d.ts` | gifenc 包类型声明 |

---

## 7. 错误与日志契约

### 7.1 错误反馈

**所有用户输入错误** → `showToast({ type: 'error', message, module, operation })` + `addLog('error', msg)`。

```ts
showToast({
  type: 'error',
  message: tStatic('errors.indexOutOfRange').replace('{range}', `0~${data.length}`),
  module: tStatic('array.title'),
  operation: tStatic('array.insert'),
})
addLog('error', `insert(${v}, ${i}) - index out of range`)
```

**禁止**使用 `alert()` / `console.error()`(详见 [project_rules §9.4](#9-工程化硬核守护))。

### 7.2 日志条目

```ts
interface LogEntry {
  time: string           // ISO 字符串
  type: 'oper' | 'info' | 'error' | 'code'
  message: string
  codeStepId?: number    // 关联学习步骤
}
```

---

## 8. 持久化契约

### 8.1 localStorage 键

| 键 | 内容 | 校验 |
|---|------|------|
| `ds-visualizer-data-{storageKey}` | 数据结构状态(各页 `{data, ...}`) | `validateStoredData` |
| `ds-visualizer-lang` | `zh` / `en` | enum |
| `ds-visualizer-color-theme` | `default` / `forest` / `warm` / `royal` | enum |
| `ds-visualizer-search-history` | 搜索历史(最多 10 条) | 字符串数组 |
| `ds-visualizer-quiz-{algorithmKey}` | 测验进度 | JSON |
| `ds-visualizer-learning-progress` | 学习进度 | JSON |
| `ds-visualizer-animation-speed` | 动画速度倍率 | 数字 |

**所有读取必须先校验**,无效值自动清除并回退默认值。

### 8.2 URL 分享

- 编码: `encodeShareData(data, pageKey)` → Base64
- 解码: `decodeShareData(encoded)` → `{ pageKey, data } | null`
- 长度限制: 4000 字符

---

## 9. 测试 API

### 9.1 测试工具

- `src/__tests__/setup.ts` — Vitest + jsdom + jest-dom matchers
- `src/__tests__/visualizers/d3MockHelper.ts` — D3 mock 工具
- `src/__tests__/pages/testUtils.tsx` — 页面测试工具(Layout / Router wrapper)

### 9.2 E2E

- `e2e/*.spec.ts` — Playwright spec(8 个文件,17 页覆盖)
- `e2e/test-helpers.js` — E2E 辅助函数
- `scripts/run-e2e.mjs` — E2E 编排脚本

详见 [CLAUDE.md §Testing](./CLAUDE.md#testing)。

---

## 10. 文档导航

| 文档 | 用途 |
|------|------|
| [CLAUDE.md](./CLAUDE.md) | AI 协作前置步骤 + 强制规则 |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 架构总览(分层 / 模块职责) |
| [CODE_WIKI.md](./CODE_WIKI.md) | 核心函数详解 + 文件路径索引 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 贡献指南(开发环境 / 规范) |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | 项目当前状态快照 |
| [TODO.md](./TODO.md) | 当前待办与活跃计划 |
| [WORKLOG.md](./WORKLOG.md) | 每日工作记录 |
| [docs/ALGORITHM_INTEGRATION_GUIDE.md](./docs/ALGORITHM_INTEGRATION_GUIDE.md) | 算法接入指南 |
| [docs/数据结构学习助手-设计推荐.md](./docs/数据结构学习助手-设计推荐.md) | 设计推荐 |
| [docs/superpowers/plans/](./docs/superpowers/plans/) | 各版本实施真源 |

---

## 11. 版本与变更

| 版本 | 日期 | 关键变更 |
|------|------|---------|
| v20 | 2026-06-22 | 🆕 **新建 API.md**(本文件);基线 v17.0.0 GA;收录 32 Hook + 17 util + 42 component + 15 page 公共 API |
| v17.0.0 | 2026-06-22 | UI/UX 迭代 R1-R7;InfoPanel 统一右栏 |
| v16.0.0 | 2026-06-22 | ENG-1/2/3 + ENH-1/2;v16 设计统一化 |

> **本文件遵循最小修改原则**(rule 8),新增 API 必须在 JSDoc 中标注后同步更新本文件。
