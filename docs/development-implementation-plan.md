# 数据结构学习助手 - 开发实施计划

**版本**: v1.0
**日期**: 2026-06-17
**基于文档**:
- [test-issue-report.md](./test-issue-report.md) — 问题报告
- [optimization-proposal.md](./optimization-proposal.md) — 优化建议

---

## 一、实施目标

1. 修复 Hash / Heap / Trie 插入动画挂起问题（ISSUE-001/002/003，P0/P1）
2. 防止 Visualizer 在动画过程中重渲染导致 D3 过渡中断（ISSUE-005，P2）
3. 为 `transitionEnd` 增加超时保护，杜绝 Promise 永久挂起（ISSUE-006，P2）
4. 修正动画与数据更新的执行顺序（ISSUE-004，P1）
5. 恢复排序操作的撤销/重做能力（ISSUE-007，P3）

**成功标准**:
- 所有 11 个数据结构页面的插入/删除/查找动画均能正常完成
- 单次动画最长不超过 5 秒（含超时保护兜底）
- 单元测试 100% 通过，ESLint / TypeScript 零错误
- 生产构建成功，bundle 体积不超预算

---

## 二、技术方案

### 阶段 1: 核心修复（P0 + P1）

#### 2.1.1 修复 `transitionEnd` 超时保护

**文件**: [src/utils/animationEngine.ts](../src/utils/animationEngine.ts#L270-L274)

**方案**: 为 Promise 增加超时兜底，防止链式过渡被中断时永久挂起。

```typescript
export function transitionEnd(transition: any, timeoutMs = 3000): Promise<void> {
  return new Promise<void>((resolve) => {
    let resolved = false
    const safeResolve = () => {
      if (!resolved) { resolved = true; clearTimeout(timer); resolve() }
    }
    transition.on('end', safeResolve).on('interrupt', safeResolve)
    const timer = setTimeout(safeResolve, timeoutMs)
  })
}
```

**关键点**:
- 超时默认 3000ms（覆盖最长链式过渡 250+300=550ms 的 5 倍冗余）
- 使用 `resolved` 标志防止多次 resolve
- `clearTimeout` 避免定时器泄漏

#### 2.1.2 防止 Visualizer 动画期间重渲染

**文件**: [src/components/Visualizer.tsx](../src/components/Visualizer.tsx#L134-L149)

**方案**: 通过 `useRef` 缓存 `dimensions` 引用，在 useEffect 中使用 ref 读取最新值，避免 `dimensions` 作为依赖项触发重渲染。

```typescript
// 新增 ref 缓存
const dimensionsRef = useRef(dimensions)
dimensionsRef.current = dimensions

useEffect(() => {
  if (svgRef?.current && renderFn && data) {
    try {
      const d = data as Record<string, unknown>
      const dataSize = Array.isArray(data) ? data.length : (d?.nodes as unknown[])?.length || (d?.length as number) || 1
      const dims = dimensionsRef.current
      const label = `${renderFn.name || 'Visualizer'}:render (${dataSize} items, ${dims.width}x${dims.height})`
      measureRender(label, () => {
        renderFn(svgRef.current!, data, { ...dims, isDark: isDark as boolean | undefined, ...renderOptions })
      })
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Visualization render error:', error)
      }
    }
  }
}, [data, renderFn, svgRef, isDark, colorTheme, renderOptions])
// 注意: dimensions 从依赖数组中移除
```

**关键点**:
- `dimensionsRef` 在每次渲染时同步更新，保证读取最新值
- 从 useEffect 依赖数组中移除 `dimensions`，避免 ResizeObserver 触发的重渲染打断动画
- 保留 `data`、`renderFn`、`isDark`、`colorTheme`、`renderOptions` 依赖，确保数据/主题变化时正常重渲染

#### 2.1.3 重构 Hash/Heap/Trie 链式过渡

**文件**:
- [src/visualizers/hashVisualizer.ts](../src/visualizers/hashVisualizer.ts#L230-L271)
- [src/visualizers/heapVisualizer.ts](../src/visualizers/heapVisualizer.ts#L200-L231)
- [src/visualizers/trieVisualizer.ts](../src/visualizers/trieVisualizer.ts)

**方案**: 将链式 `.transition().transition()` 拆分为顺序 `await` 的两段过渡，确保每段过渡的 `end` 事件都能被 `transitionEnd` 正确捕获。

**示例（hashVisualizer.ts Phase 2）**:

```typescript
// 修改前
await transitionEnd(
  bucketGroup.select('rect')
    .transition().duration(duration(250)).ease(EASING.easeOutBack)
    .attr('fill', C.bucketHighlight).attr('stroke', C.bucketHighlightStroke)
    .transition().duration(duration(300)).ease(defaultEase)
    .attr('fill', C.bucketBg).attr('stroke', C.bucketStroke)
)

// 修改后
const bucketRect = bucketGroup.select('rect')
await transitionEnd(
  bucketRect
    .transition().duration(duration(250)).ease(EASING.easeOutBack)
    .attr('fill', C.bucketHighlight).attr('stroke', C.bucketHighlightStroke)
)
if (anim?.isAborted?.()) return
await transitionEnd(
  bucketRect
    .transition().duration(duration(300)).ease(defaultEase)
    .attr('fill', C.bucketBg).attr('stroke', C.bucketStroke)
)
```

**关键点**:
- 每段过渡独立 `await`，确保 `end` 事件触发
- 中间插入 `anim?.isAborted?.()` 检查，支持动画中止
- 保持视觉效果完全一致（同样的 duration 和 easing）

### 阶段 2: 架构改进（P1 + P2）

#### 2.2.1 修正动画与数据更新顺序

**文件**:
- [src/pages/HashPage.tsx](../src/pages/HashPage.tsx#L48-L69)
- [src/pages/HeapPage.tsx](../src/pages/HeapPage.tsx#L48-L65)
- [src/pages/TriePage.tsx](../src/pages/TriePage.tsx#L46-L64)

**当前问题**: 动画在旧数据上运行，但动画函数依赖新数据的 DOM 节点（如 `.hash-entry.key-${key}`），导致动画找不到目标元素。

**方案**: 先更新数据，让 Visualizer 重渲染出目标 DOM，再运行动画。但需避免数据更新触发 Visualizer 在动画期间二次重渲染。

**实现**: 由于阶段 1 已修复 Visualizer 重渲染问题（dimensions 不再触发），可以安全地先更新数据：

```typescript
const handleInsert = useCallback(async (): Promise<void> => {
  if (isAnimating) return
  // ... 校验 ...
  setIsAnimating(true)
  const anim = getAnimationContext()
  try {
    insert(key, value)  // 先更新数据，Visualizer 重渲染出目标 DOM
    // 等待一帧确保 DOM 更新完成
    await new Promise(r => requestAnimationFrame(() => r(undefined)))
    if (svgRef.current) await animateInsertHash(svgRef.current, key, value, { hashFn: hashFn as any }, anim)
  } catch (e) {
    handleAnimationError(e, t('hash.insert'))
  } finally {
    setIsAnimating(false)
  }
  setKeyValue('')
  setValueInput('')
}, [/* ... */])
```

**关键点**:
- `setIsAnimating(true)` 在数据更新前设置，防止用户重复操作
- `requestAnimationFrame` 等待 React commit + 浏览器 paint，确保 DOM 就绪
- 动画在最新 DOM 上运行，能正确找到目标元素

**注意**: 此修改需与阶段 1 的 Visualizer 修复配合，否则数据更新会触发 dimensions 变化导致重渲染中断动画。

### 阶段 3: 体验优化（P3）

#### 2.3.1 排序操作撤销支持

**文件**: [src/hooks/useSortState.ts](../src/hooks/useSortState.ts)

**方案**: 排序完成后保留撤销点，不设置 `undoBlock`，或在排序前保存快照。

**实现**: 见 optimization-proposal.md 第 3.1 节，本次实施暂不纳入核心修复范围，作为后续迭代。

---

## 三、资源分配

| 任务 | 负责模块 | 修改文件数 | 预计代码变更行数 |
|------|----------|-----------|-----------------|
| 阶段 1.1 transitionEnd 超时 | animationEngine | 1 | +10 |
| 阶段 1.2 Visualizer 重渲染 | Visualizer | 1 | +5 |
| 阶段 1.3 链式过渡重构 | hash/heap/trie visualizers | 3 | ~+40 |
| 阶段 2.1 数据更新顺序 | Hash/Heap/Trie pages | 3 | ~+15 |
| 单元测试补充 | __tests__ | 3 | ~+90 |
| 文档更新 | docs | 3 | ~+50 |
| **合计** | | **14** | **~+210** |

---

## 四、实施时间线

| 阶段 | 任务 | 依赖 |
|------|------|------|
| 1.1 | 修复 transitionEnd 超时保护 | 无 |
| 1.2 | 修复 Visualizer 重渲染 | 无 |
| 1.3 | 重构 hash visualizer 链式过渡 | 1.1 |
| 1.4 | 重构 heap visualizer 链式过渡 | 1.1 |
| 1.5 | 重构 trie visualizer 链式过渡 | 1.1 |
| 2.1 | 修正 HashPage 数据更新顺序 | 1.2, 1.3 |
| 2.2 | 修正 HeapPage 数据更新顺序 | 1.2, 1.4 |
| 2.3 | 修正 TriePage 数据更新顺序 | 1.2, 1.5 |
| 3.1 | 运行 lint + typecheck | 1-2 |
| 3.2 | 运行单元测试 | 3.1 |
| 3.3 | 生产构建验证 | 3.2 |
| 3.4 | 浏览器回归测试 | 3.3 |
| 4.1 | 更新 PROJECT_SUMMARY / WORKLOG / TODO | 3.4 |

---

## 五、质量保证标准

### 5.1 静态检查

- `npm run lint` 零错误零警告
- `npx tsc --noEmit` 零类型错误

### 5.2 单元测试

- `npm run test:run` 全部通过（基线 2580+ 测试）
- 新增/修改的动画函数需补充测试用例：
  - `transitionEnd` 超时保护测试
  - `animateInsertHash` / `animateInsertHeap` / `animateInsertTrie` 完成性测试

### 5.3 构建验证

- `npm run build` 成功
- `node scripts/check-bundle.js` 通过（index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB）

### 5.4 浏览器回归测试

使用 agent-browser 对以下页面进行插入/删除/查找动画回归：

| 页面 | 测试操作 | 预期结果 |
|------|----------|----------|
| Hash | 插入键值对 | 动画完成，数据更新，无挂起 |
| Heap | 插入元素 | 动画完成，数据更新，无挂起 |
| Trie | 插入单词 | 动画完成，数据更新，无挂起 |
| Tree | 前序/中序/后序遍历 | 动画完成，日志输出 |
| Sort | 执行排序 | 动画完成，数组有序 |
| Graph | BFS/DFS | 动画完成，路径高亮 |

### 5.5 性能验证

- 单次动画最长不超过 5 秒（含超时兜底）
- 连续 10 次插入操作无卡顿
- ResizeObserver 触发时不中断进行中的动画

---

## 六、风险评估

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| dimensions 从依赖移除后，窗口缩放不重渲染 | 中 | 中 | 保留 data 依赖，数据变化仍触发；缩放由 viewBox 处理 |
| 数据更新顺序调整引入新 bug | 低 | 中 | 增加 requestAnimationFrame 等待 DOM 就绪 |
| 超时时间过短导致动画提前结束 | 低 | 低 | 设为 3000ms，是最长过渡的 5 倍冗余 |
| 链式过渡拆分后视觉连贯性变化 | 低 | 低 | 保持相同 duration 和 easing，视觉无差异 |

---

## 七、回滚方案

若修复引入新问题，可按以下顺序回滚：

1. **回滚阶段 2.1**: 恢复 HashPage/HeapPage/TriePage 的"先动画后数据"顺序
2. **回滚阶段 1.2**: 恢复 Visualizer useEffect 的 dimensions 依赖
3. **回滚阶段 1.3**: 恢复链式过渡写法
4. **保留阶段 1.1**: transitionEnd 超时保护为纯增强，可安全保留

每个阶段修改前建议 git commit，便于精准回滚。
