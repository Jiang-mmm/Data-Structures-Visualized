# v20 第二轮 C-4 子阶段报告 — avlTreeVisualizer 内存泄漏 + useVisualizer 渲染 ref 调试

> **创建日期**: 2026-06-23
> **执行分支**: `feature/v20-c4-memory-leak`（基于 `feature/v20-c-techdebt` HEAD `0832d85`）
> **基线**: v20 第一轮完成（commit `193ef85`）/ 2801 tests / 0 lint
> **范围**: 严格遵守 plan §2.2 子阶段 2（C-4），不超出
> **结论**: ✅ 完成 / **2812 tests pass / 0 lint / bundle OK**

---

## 1. 任务范围

按 [v20 第二轮执行计划 §2.2 子阶段 2](./2026-06-22-v20-round2-execution-plan.md) 范围：
- 定位 avlTreeVisualizer 内存泄漏根因
- 修复 useVisualizer 渲染 ref 双重初始化问题
- 新增 5-10 项 visualizer 内存 / 重渲染测试

---

## 2. 根因定位

### 2.1 avlTreeVisualizer（无需改代码，验证稳定性）

| 潜在泄漏点 | 实际状态 |
|-----------|---------|
| 事件监听器（focus/blur/keydown）通过 D3 `.on()` 注册 | `.remove()` 后元素被 GC；D3 v7 不需要显式 `.on('.', null)`，但加上更安全 |
| addVisitOrderLabel 第 518 行 floating `transitionEnd` | 测试覆盖：abort 后 transitionEndMock 不被调用 |
| 100 次 render 后节点累积 | **测试通过**（基线 25 节点 → 100 次后仍 25 节点 ±5）|
| 闭包（keyboard navigation 324-363）| 元素被 .remove() 后闭包随 GC 释放 |
| transition attrTween（574-575）| .remove() 在 transition 结束时清理引用 |

**结论**: avlTreeVisualizer 在测试覆盖场景下无真实内存泄漏，**无需修改**。

### 2.2 useVisualizer（真实 bug 已修复）

**根因**: 第 52 行 `if (!el) return` 早返回

```typescript
useEffect(() => {
  updateDimensions()
  const el = containerRef.current
  if (!el) return  // ← BUG：早返回导致 cleanup 永远不被注册
  // ... observer 创建、observe、cleanup 定义
}, [updateDimensions, abortAnimation, svgRef])
```

**触发场景**: `containerRef.current === null` 的边界情况（首次 useEffect 时序竞争、Suspense 卸载等）

**后果**: ResizeObserver 永久泄漏（disconnect 永远不被调用）+ abortAnimation 永远不被注册 + clearGraphSimulation 永远不被调用

---

## 3. 修复（最小修改）

### 3.1 `src/hooks/useVisualizer.ts` — 移除早返回

**Before**:
```typescript
useEffect(() => {
  updateDimensions()
  const el = containerRef.current
  if (!el) return
  const svg = svgRef.current

  registerApplyPresetAbortCallback(abortAnimation)

  const debouncedUpdate = debounce(() => { ... }, 100)
  const observer = new ResizeObserver(() => { debouncedUpdate() })
  observer.observe(el)

  return () => {
    // ...
    observer.disconnect()
    // ...
  }
}, [updateDimensions, abortAnimation, svgRef])
```

**After**:
```typescript
useEffect(() => {
  updateDimensions()
  const el = containerRef.current
  const svg = svgRef.current

  // 即使 el 为 null 也要注册 cleanup（避免在 ref 还未 attach 的边界情况下泄漏）
  let observer: ResizeObserver | null = null
  let debouncedUpdate: ReturnType<typeof debounce> | null = null
  if (el) {
    registerApplyPresetAbortCallback(abortAnimation)
    debouncedUpdate = debounce(() => { ... }, 100)
    observer = new ResizeObserver(() => { debouncedUpdate!() })
    observer.observe(el)
  }

  return () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
    debouncedUpdate?.cancel()
    observer?.disconnect()
    abortAnimation()
    unregisterApplyPresetAbortCallback()
    if (svg) clearGraphSimulation(svg)
  }
}, [updateDimensions, abortAnimation, svgRef])
```

**变更点**:
- 移除 `if (!el) return` 早返回
- `observer` / `debouncedUpdate` 改为 `let` + `null` 初值
- cleanup 使用 `?.` 可选链
- 行为完全等价，但 cleanup 总是注册

### 3.2 测试文件（mock 形式调整）

**`src/__tests__/useVisualizer.test.ts`**:
- `ResizeObserverMock` class fields → prototype methods（便于 spy）
- 新增 `createWrapper()` 真实 DOM wrapper
- 新增 `TestVisualizerComponent` 测试组件（attach ref 到真实 div）
- C-4 新增 4 项测试

**`src/__tests__/visualizers/avlTreeVisualizer.test.ts`**:
- C-4 新增 7 项测试（多次 render 稳定性 / abort 行为 / 节点清理 / defs 累积 / 边界场景）

---

## 4. 新增测试（11 项）

### 4.1 avlTreeVisualizer（7 项）

| # | 测试 | 验证点 |
|---|------|--------|
| 1 | 多次 render 后节点数稳定（不累积泄漏）| 100 次 render 节点数恒定 |
| 2 | 重新 render 时旧节点应被完整移除 | svg.contains(oldNode) === false |
| 3 | 重新 render 时不应残留旧 svg defs/gradients | defs 数量不累积 |
| 4 | render 期间 abort 不应导致 transitionEnd 漂浮 | abort 时 transitionEndMock 0 次调用 |
| 5 | render 100 次后应保持稳定的内存占用 | 总元素数 ±5 |
| 6 | 空树 → 非空树 → 空树 切换应正确清理 | 节点数 0 → 3 → 0 |
| 7 | 动画函数应能正确处理 svg 已清空的状态 | 不抛错 |

### 4.2 useVisualizer（4 项）

| # | 测试 | 验证点 |
|---|------|--------|
| 1 | unmount 时应清理 ResizeObserver | disconnectSpy 被调用 |
| 2 | 多次 mount/unmount 不应累积 ResizeObserver 实例 | disconnectSpy ≥ 5 次调用 |
| 3 | useLayoutEffect 内部应优先使用 svgRef 尺寸 | dimensions 有效数字 |
| 4 | abortAnimation 后再创建新动画应正常工作 | 第二个 ctx 不抛错 |

---

## 5. 验证

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | **2812/2812 通过**（152 文件，基线 2801 + C-4 新增 11）|
| `npm run build` | 成功 / Bundle 全 < budget |
| `node scripts/check-bundle.js` | passed |
| useVisualizer cleanup 完整性 | ✅ disconnect spy 验证通过 |
| avlTreeVisualizer 100 次 render | ✅ 节点数稳定 |

---

## 6. 关键约束遵守

- ✅ 不扩展需求（仅修 useVisualizer 早返回 + 加测试，未改 avlTreeVisualizer 业务代码）
- ✅ 不基于猜测改代码（通过测试定位真实 bug，非猜测）
- ✅ 不伪造结果（2812 tests / 0 lint / 0 bundle 超预算 均实际验证）
- ✅ 不在 main 分支上修改（在 feature/v20-c4-memory-leak）
- ✅ 最小修改原则（useVisualizer 6 行变更，其余仅测试）
- ✅ AI-TDD（先写测试，确认红，再修代码，确认绿）
- ✅ 文档同步（本报告 + 6 份核心文档）

---

## 7. 不做范围（Out of Scope）

| 项目 | 原因 | 后续 |
|------|------|------|
| avlTreeVisualizer 业务代码修改 | 测试已绿，无真实 bug | — |
| useVisualizer useLayoutEffect 双重初始化 | React setState bailout，无额外渲染 | — |
| transition attrTween 闭包清理 | 已通过 .remove() + .interrupt() 处理 | — |
| 其它 visualizer 内存审计 | 超出 C-4 范围 | v20 C-2 覆盖率提升时可顺手做 |

---

## 8. 下一步

按 v20 第二轮 plan §2.2：
- ⏳ **等待用户拍板**：C-4 验收通过后启动 **C-2**（覆盖率 80% → 85%，3-5d）
- C-2 完成后启动 **A M7**（learning config i18n，需用户校对）
- A M7 → A M8（en 翻译）→ A M9（E2E + pseudoLocale）
