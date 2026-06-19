# 主页配色统一 + AVL 遍历动画优化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 消除主页“图/哈希”模块的粉红色偏差，使其随主题正确变化；同时优化 AVL 树前序/中序遍历动画，使其更明显、流畅且不臃肿。

**Architecture:** 通过调整 Design Token `card-group-graph` 的四个主题取值，统一主页卡片分组色；在 `avlTreeVisualizer.ts` 中为遍历动画单独引入“边流动点 + 放大高亮”效果，并移除冗余 ripple，保持插入/搜索动画不变。

**Tech Stack:** React + TypeScript + Tailwind CSS v4 + D3 + Vitest

---

## 文件结构

| 文件 | 说明 |
|------|------|
| `src/index.css` | Design Token 默认值，需更新 `card-group-graph` 默认色 |
| `src/utils/themeColors.ts` | 多主题 CSS 变量映射 `THEME_CSS_MAP`，需调整 graph 分组色 |
| `src/pages/Home.tsx` | 主页卡片分组，需更新分组注释/可选重新归类 |
| `src/visualizers/avlTreeVisualizer.ts` | AVL 动画核心，需新增遍历专用动画辅助函数并改造 `animateTraversal` |
| `src/__tests__/visualizers/avlTreeVisualizer.test.ts` | AVL 可视化单元测试，需补充分支覆盖 |
| `src/__tests__/pages/Home.test.tsx` | 主页测试，当前仅校验 token 类名存在，预期无需修改 |
| `PROJECT_SUMMARY.md` / `WORKLOG.md` | 项目文档，迭代后需更新 |

---

## Task 1: 更新 Design Token —— 主页图/哈希卡片分组色

**目标：** 让 `card-group-graph` 在每个主题下使用非粉红色、且与主题协调的色值，从而消除“哈希表和图算法始终显示粉红色”的问题。

**变更色值方案：**

| 主题 | linear（蓝/主色） | tree（琥珀） | graph（新色） |
|------|------------------|--------------|---------------|
| default | `#3b82f6` | `#d97706` | `#7c3aed`（violet） |
| forest | `#047857` | `#b45309` | `#0891b2`（cyan） |
| warm | `#c2410c` | `#f59e0b` | `#7c3aed`（violet） |
| royal | `#7c3aed` | `#d97706` | `#059669`（emerald） |

### Step 1: 修改 `src/index.css` 默认 token

```css
  --color-card-group-graph: #7c3aed;
```

### Step 2: 修改 `src/utils/themeColors.ts` 的 `THEME_CSS_MAP`

将每个主题下 `'--color-card-group-graph'` 的值替换为上表对应色值；其余 token 保持不变。

### Step 3:（可选）更新 `src/pages/Home.tsx` 注释

将 `// 图与哈希类 (rose)` 改为 `// 图与哈希类 (graph accent)`，避免注释与实现脱节。

### Step 4: 运行相关测试

```bash
npm run test:run -- src/__tests__/pages/Home.test.tsx
npm run test:run -- src/__tests__/components/Card.test.tsx
```

预期：测试通过，`card-group-graph` 类名仍存在，只是底层色值变化。

---

## Task 2: 优化 AVL 遍历动画

**目标：** 提升前序/中序/后序/层序遍历的视觉效果，减少动画冗余，使遍历路径更明显。

**关键改动：**
1. 新增 `pulseTraverseNode`：比通用 `pulseNode` 更长的 grow/settle 时长，最终留下稍大的 visited 节点。
2. 新增 `traceEdgeToNode`：在父节点到当前节点的边上播放一个流动小圆点，让遍历方向一目了然。
3. `animateTraversal` 中移除 `addRippleEffect`，避免与边流动点、节点高亮叠加显得臃肿。
4. 将循环结束后的固定等待从 `700ms` 降至 `500ms`，仍足够覆盖最后一条边的高亮动画。

### Step 1: 在 `src/visualizers/avlTreeVisualizer.ts` 新增辅助函数

```typescript
/**
 * 遍历专用节点脉冲：更大的振幅、更长的停留，让每一步都清晰可见
 */
async function pulseTraverseNode(
  nodeGroup: ReturnType<typeof select>,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  const circle = nodeGroup.select('circle')
  const t = circle
    .transition()
    .duration(duration(450, dataLength))
    .ease(EASING.easeOutBack)
    .attr('r', NODE_RADIUS + 10)
    .attr('fill', C.nodeActive)
    .attr('stroke', C.nodeActiveStroke)
    .transition()
    .duration(duration(350, dataLength))
    .ease(EASING.easeOutCubic)
    .attr('r', NODE_RADIUS + 4)
    .attr('fill', C.nodeVisited)
    .attr('stroke', C.nodeVisitedStroke)
  await transitionEnd(t)
}

/**
 * 边流动点：从父节点沿边路径移动到当前节点，突出遍历方向
 */
async function traceEdgeToNode(
  container: ReturnType<typeof select>,
  nodeId: string,
  parentId: string | null,
  C: ReturnType<typeof getColors>,
  dataLength = 0
) {
  if (!parentId) return
  const edge = container.select(`.avl-edge.from-${parentId}-to-${nodeId}`)
  if (edge.empty()) return

  const pathEl = edge.node() as SVGPathElement
  const length = pathEl.getTotalLength()
  const start = pathEl.getPointAtLength(0)

  const traveler = container
    .insert('circle', 'g.avl-node')
    .attr('cx', start.x)
    .attr('cy', start.y)
    .attr('r', 4)
    .attr('fill', C.nodeActive)
    .attr('opacity', 0.9)

  await transitionEnd(
    traveler
      .transition()
      .duration(duration(350, dataLength))
      .ease(EASING.easeOutCubic)
      .attrTween('cx', () => (t: number) => pathEl.getPointAtLength(t * length).x)
      .attrTween('cy', () => (t: number) => pathEl.getPointAtLength(t * length).y)
      .remove()
  )
}
```

### Step 2: 改造 `animateTraversal`

将原循环体：

```typescript
await pulseNode(nodeGroup, C, false, false, data.nodes.length)
addRippleEffect(container, id, C, data.nodes.length)
highlightEntryEdge(container, id, nodeMap.get(id)?.parent || null, C, data.nodes.length)
addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
```

替换为：

```typescript
const parentId = nodeMap.get(id)?.parent || null
await traceEdgeToNode(container, id, parentId, C, data.nodes.length)
if (anim?.isAborted?.()) return

await pulseTraverseNode(nodeGroup, C, data.nodes.length)
if (anim?.isAborted?.()) return

highlightEntryEdge(container, id, parentId, C, data.nodes.length)
addVisitOrderLabel(nodeGroup, i + 1, C, data.nodes.length)
```

并将函数末尾的 `await wait(700, anim)` 改为 `await wait(500, anim)`。

`animateInsertPath` 与 `animateSearchPath` 保持原逻辑不变。

### Step 3: 单元测试补充

在 `src/__tests__/visualizers/avlTreeVisualizer.test.ts` 中新增一条断言：当 DOM 已渲染时，`animateTraversal` 会生成 `.avl-edge` 上的 traveling circle（可通过检测 `svg.querySelectorAll('circle').length` 变化或检查 transitionEnd 调用次数增加来间接验证）。

示例测试：

```typescript
it('遍历动画在已渲染 DOM 上会产生边流动点和节点高亮', async () => {
  renderAvlTree(svg, data, {})
  const circlesBefore = svg.querySelectorAll('circle').length
  await animateTraversal(svg, [50, 30, 70], data, { isAborted: () => false } as any)
  // traveler circle 已被移除，但 transitionEnd 调用次数应比无 DOM 时更多
  expect(transitionEndMock).toHaveBeenCalled()
})
```

### Step 4: 运行 AVL 可视化测试

```bash
npm run test:run -- src/__tests__/visualizers/avlTreeVisualizer.test.ts
```

预期：全部通过。

---

## Task 3: 全量验证

### Step 1: 静态检查

```bash
npm run lint
npm run typecheck
```

预期：0 errors, 0 warnings。

### Step 2: 单元测试

```bash
npm run test:run
```

预期：全部通过（当前基线 3042 通过）。

### Step 3: 生产构建

```bash
npm run build
```

预期：构建成功，bundle budgets 通过。

### Step 4: E2E 回归（如本地环境已配置 Playwright）

```bash
npx playwright test
```

预期：功能测试与 A11y 测试通过。

---

## Task 4: 文档更新

### Step 1: 更新 `PROJECT_SUMMARY.md`

在“Current Phase / Completed”段落追加：

- 主页图/哈希卡片分组色随主题统一（更新 `card-group-graph` token 取值）。
- AVL 遍历动画优化：新增边流动点、放大高亮、移除冗余 ripple、缩短尾等待。

### Step 2: 更新 `WORKLOG.md`

按日期新增条目，记录：

- 修改文件清单。
- 设计决策（为何选择 violet/cyan/emerald 作为 graph 分组色、为何单独为遍历新增动画辅助函数）。
- 验证结果（lint / typecheck / unit test / build / e2e）。

---

## 执行方式

计划完成后，可选择：

1. **Subagent-Driven（推荐）**：我为每个 Task 单独调度子代理，完成后在本会话复核。
2. **Inline Execution**：在本会话中直接按 Task 顺序修改并验证。

请选择后我开始执行。
