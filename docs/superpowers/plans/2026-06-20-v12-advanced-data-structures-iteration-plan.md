# 数据结构学习助手 v12 迭代实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 v11.0.1 基础上补齐高级数据结构（AVL、跳表、并查集、红黑树）与全局搜索，形成 v12 核心功能增量，同时保持现有架构约定、Design Token 体系与测试基线不退化。

**Architecture:** 复用现有六层架构与 `useDataStructureState` 基座；新增结构采用递归对象/扁平化数据表示，复用 `treeVisualizer`/`graphVisualizer` 渲染思路；全局搜索作为独立组件接入 `Layout`，不引入第二套状态管理。

**Tech Stack:** React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + Vitest + Playwright

---

## 一、背景与当前状态

v11.0.1 已完成：
- 全面视觉统一、InfoPanel 统一信息面板、代码展示机制全结构覆盖
- 代码风格统一与架构优化 P1-P6
- 验证基线：3089 单元测试通过 / ESLint 0 errors / TypeScript strict 0 errors / Build 成功 / Bundle 预算符合

v12 目标：
- 补齐教学中高频出现的高级数据结构，提升产品对高年级学生与面试人群的吸引力
- 保持"每新增一个数据结构必须遵循 8 步流程"的约定
- 不改动现有 14 个页面的功能逻辑

---

## 二、范围与边界

### 2.1 本次迭代包含（第一阶段）

| # | 功能 | 优先级 | 说明 |
|---|------|--------|------|
| 1 | AVL 树 | P1 | 首个高级树结构，为红黑树/B 树建立模式 |
| 2 | 跳表 SkipList | P1 | 多层索引结构，可视化独特 |
| 3 | 并查集 Union-Find | P1 | 图论基础，可复用 graphVisualizer 节点渲染 |
| 4 | 红黑树 Red-Black Tree | P1 | 高价值 but 动画复杂，先静态渲染 + 基础插入动画 |
| 5 | 全局搜索 GlobalSearch | P1 | 快捷键 `Ctrl/Cmd+K`，搜索页面/算法/操作 |

### 2.2 本次迭代不包含（放入后续阶段）

- B 树、线段树、树状数组、稀疏表、布隆过滤器、LRU Cache
- 测验系统 Quiz、成就系统 Achievements、复习提醒 Review
- Web Worker 排序、动画录制回放、步骤单步执行
- 任何 UI 风格整体改造（保持 Neo-Brutalist）

### 2.3 硬性约束

- 禁止引入 Redux/Zustand 等第二套状态管理
- 禁止每个新功能独立 Context
- 所有新增代码 100% TypeScript
- 所有 UI 文案走 `t()`/`tStatic()`，中文必填、英文可后续补全
- 每个新增数据结构必须完成：Hook → Visualizer → Page → 路由 → 导航 → 首页卡片 → 测试 → 学习配置
- Bundle 预算：index < 80KB、vendor-react < 250KB、vendor-d3 < 60KB

---

## 三、文件结构总览

### 3.1 新增文件

```
src/
  algorithms/
    avlTree.ts          # AVL 旋转与插入/删除逻辑
    skipList.ts         # 跳表插入/搜索/删除逻辑
    unionFind.ts        # 并查集路径压缩/按秩合并逻辑
    redBlackTree.ts     # 红黑树插入/重染色逻辑
  types/
    avl.d.ts            # AvlNode / AvlEdge 类型
    skipList.d.ts       # SkipListNode / SkipListLevel 类型
    unionFind.d.ts      # UnionFindState 类型
    redBlackTree.d.ts   # RedBlackNode / Color 类型
  hooks/
    useAvlTreeState.ts
    useSkipListState.ts
    useUnionFindState.ts
    useRedBlackTreeState.ts
  visualizers/
    avlTreeVisualizer.ts
    skipListVisualizer.ts
    unionFindVisualizer.ts
    redBlackTreeVisualizer.ts
  pages/
    AvlTreePage.tsx
    SkipListPage.tsx
    UnionFindPage.tsx
    RedBlackTreePage.tsx
  configs/learning/
    avlTree.config.ts
    skipList.config.ts
    unionFind.config.ts
    redBlackTree.config.ts
  components/
    GlobalSearch.tsx    # 全局搜索弹窗
  data/
    searchIndex.ts      # 搜索索引生成
  __tests__/
    algorithms/avlTree.test.ts
    algorithms/skipList.test.ts
    algorithms/unionFind.test.ts
    algorithms/redBlackTree.test.ts
    hooks/useAvlTreeState.test.ts
    hooks/useSkipListState.test.ts
    hooks/useUnionFindState.test.ts
    hooks/useRedBlackTreeState.test.ts
    visualizers/avlTreeVisualizer.test.ts
    visualizers/skipListVisualizer.test.ts
    visualizers/unionFindVisualizer.test.ts
    visualizers/redBlackTreeVisualizer.test.ts
    components/GlobalSearch.test.tsx
```

### 3.2 修改文件

```
src/
  App.tsx                    # 4 条 lazy Route
  components/Sidebar.tsx     # STRUCTURE_KEYS + getIconSvg
  pages/Home.tsx             # structures 数组加 4 张卡片
  i18n/locales.ts            # 新增命名空间文案
  configs/learning/index.ts  # 注册 4 个学习配置
  hooks/useGlobalSettings.ts # GlobalSearch 快捷键监听（可选，不引入 Context）
  components/Layout.tsx      # 挂载 GlobalSearch
```

---

## 四、详细任务分解

### Task 1: AVL 树 — 算法与类型基础

**Files:**
- Create: `src/types/avl.d.ts`
- Create: `src/algorithms/avlTree.ts`
- Test: `src/__tests__/algorithms/avlTree.test.ts`

**说明:** AVL 树采用递归对象表示 `AvlNode { value, left, right, height }`，与 TrieNode 模式一致，避免数组索引表示下旋转逻辑易错的问题。

- [ ] **Step 1: 定义 AVL 树类型**

```typescript
// src/types/avl.d.ts
export interface AvlNode {
  id: string
  value: number
  left: AvlNode | null
  right: AvlNode | null
  height: number
}

export interface AvlEdge {
  source: string
  target: string
}

export interface AvlTreeData {
  root: AvlNode | null
  nodes: AvlNode[]
  edges: AvlEdge[]
}
```

- [ ] **Step 2: 实现 AVL 算法工具函数**

```typescript
// src/algorithms/avlTree.ts
import type { AvlNode, AvlTreeData } from '../types/avl'

export function createNode(value: number): AvlNode {
  return { id: crypto.randomUUID(), value, left: null, right: null, height: 1 }
}

export function getHeight(node: AvlNode | null): number {
  return node?.height ?? 0
}

export function getBalance(node: AvlNode | null): number {
  if (!node) return 0
  return getHeight(node.left) - getHeight(node.right)
}

export function updateHeight(node: AvlNode): void {
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right))
}

export function rotateRight(y: AvlNode): AvlNode {
  const x = y.left!
  const t2 = x.right
  x.right = y
  y.left = t2
  updateHeight(y)
  updateHeight(x)
  return x
}

export function rotateLeft(x: AvlNode): AvlNode {
  const y = x.right!
  const t2 = y.left
  y.left = x
  x.right = t2
  updateHeight(x)
  updateHeight(y)
  return y
}

export function insertAvl(root: AvlNode | null, value: number): AvlNode {
  if (!root) return createNode(value)

  if (value < root.value) {
    root.left = insertAvl(root.left, value)
  } else if (value > root.value) {
    root.right = insertAvl(root.right, value)
  } else {
    return root
  }

  updateHeight(root)
  const balance = getBalance(root)

  if (balance > 1 && value < root.left!.value) {
    return rotateRight(root)
  }
  if (balance < -1 && value > root.right!.value) {
    return rotateLeft(root)
  }
  if (balance > 1 && value > root.left!.value) {
    root.left = rotateLeft(root.left!)
    return rotateRight(root)
  }
  if (balance < -1 && value < root.right!.value) {
    root.right = rotateRight(root.right!)
    return rotateLeft(root)
  }

  return root
}

export function flattenAvl(root: AvlNode | null): AvlTreeData {
  const nodes: AvlNode[] = []
  const edges: AvlEdge[] = []

  function traverse(node: AvlNode | null): void {
    if (!node) return
    nodes.push(node)
    if (node.left) {
      edges.push({ source: node.id, target: node.left.id })
      traverse(node.left)
    }
    if (node.right) {
      edges.push({ source: node.id, target: node.right.id })
      traverse(node.right)
    }
  }

  traverse(root)
  return { root, nodes, edges }
}
```

- [ ] **Step 3: 编写算法单元测试**

```typescript
// src/__tests__/algorithms/avlTree.test.ts
import { describe, it, expect } from 'vitest'
import { createNode, getBalance, insertAvl, flattenAvl } from '../../algorithms/avlTree'

describe('avlTree algorithms', () => {
  it('creates node with height 1', () => {
    const node = createNode(10)
    expect(node.value).toBe(10)
    expect(node.height).toBe(1)
  })

  it('performs LL rotation', () => {
    let root = createNode(30)
    root = insertAvl(root, 20)
    root = insertAvl(root, 10)
    expect(root.value).toBe(20)
    expect(root.left?.value).toBe(10)
    expect(root.right?.value).toBe(30)
  })

  it('performs RR rotation', () => {
    let root = createNode(10)
    root = insertAvl(root, 20)
    root = insertAvl(root, 30)
    expect(root.value).toBe(20)
    expect(root.left?.value).toBe(10)
    expect(root.right?.value).toBe(30)
  })

  it('performs LR rotation', () => {
    let root = createNode(30)
    root = insertAvl(root, 10)
    root = insertAvl(root, 20)
    expect(root.value).toBe(20)
  })

  it('performs RL rotation', () => {
    let root = createNode(10)
    root = insertAvl(root, 30)
    root = insertAvl(root, 20)
    expect(root.value).toBe(20)
  })

  it('keeps tree balanced after sequential inserts', () => {
    let root: ReturnType<typeof createNode> | null = null
    for (let i = 1; i <= 10; i++) {
      root = insertAvl(root, i)
    }
    expect(root).not.toBeNull()
    expect(Math.abs(getBalance(root!))).toBeLessThanOrEqual(1)
  })

  it('flattens tree to nodes and edges', () => {
    let root = createNode(20)
    root = insertAvl(root, 10)
    root = insertAvl(root, 30)
    const data = flattenAvl(root)
    expect(data.nodes).toHaveLength(3)
    expect(data.edges).toHaveLength(2)
  })
})
```

- [ ] **Step 4: 运行测试验证**

Run: `npx vitest run src/__tests__/algorithms/avlTree.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/types/avl.d.ts src/algorithms/avlTree.ts src/__tests__/algorithms/avlTree.test.ts
git commit -m "feat(avl): AVL 树算法与类型基础"
```

---

### Task 2: AVL 树 — Hook 状态管理

**Files:**
- Create: `src/hooks/useAvlTreeState.ts`
- Test: `src/__tests__/hooks/useAvlTreeState.test.ts`

- [ ] **Step 1: 实现 useAvlTreeState Hook**

```typescript
// src/hooks/useAvlTreeState.ts
import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { insertAvl, flattenAvl } from '../algorithms/avlTree'
import { createInitialAvlTree } from '../algorithms/avlTree'
import { tStatic } from '../i18n/useI18n'
import { showToast } from '../components/toastStore'
import type { AvlTreeData } from '../types/avl'

const INITIAL_AVL: AvlTreeData = createInitialAvlTree()

export function createInitialAvlTree(): AvlTreeData {
  let root = insertAvl(null, 30)
  root = insertAvl(root, 20)
  root = insertAvl(root, 40)
  return flattenAvl(root)
}

export function useAvlTreeState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<AvlTreeData>(INITIAL_AVL, { storageKey: 'avl-tree' })

  const insert = useCallback((value: number) => {
    const newRoot = insertAvl(data.root, value)
    const newData = flattenAvl(newRoot)
    push(newData)
    addLog('oper', tStatic('hooks.avlLogInsert').replace('{value}', String(value)))
    showToast({ type: 'success', message: tStatic('hooks.avlInsertSuccess') })
  }, [data.root, push, addLog])

  const clear = useCallback(() => {
    const empty = flattenAvl(null)
    push(empty)
    addLog('oper', tStatic('hooks.avlLogClear'))
  }, [push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    insert, clear, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  }
}
```

- [ ] **Step 2: 编写 Hook 测试**

```typescript
// src/__tests__/hooks/useAvlTreeState.test.ts
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAvlTreeState } from '../../hooks/useAvlTreeState'

describe('useAvlTreeState', () => {
  it('initializes with default tree', () => {
    const { result } = renderHook(() => useAvlTreeState())
    expect(result.current.data.nodes).toHaveLength(3)
  })

  it('inserts value and updates nodes', () => {
    const { result } = renderHook(() => useAvlTreeState())
    act(() => { result.current.insert(10) })
    expect(result.current.data.nodes.length).toBeGreaterThan(3)
    expect(result.current.canUndo).toBe(true)
  })

  it('clears tree', () => {
    const { result } = renderHook(() => useAvlTreeState())
    act(() => { result.current.clear() })
    expect(result.current.data.nodes).toHaveLength(0)
  })
})
```

- [ ] **Step 3: 运行测试验证**

Run: `npx vitest run src/__tests__/hooks/useAvlTreeState.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useAvlTreeState.ts src/__tests__/hooks/useAvlTreeState.test.ts
git commit -m "feat(avl): AVL 树状态 Hook"
```

---

### Task 3: AVL 树 — Visualizer 渲染与动画

**Files:**
- Create: `src/visualizers/avlTreeVisualizer.ts`
- Test: `src/__tests__/visualizers/avlTreeVisualizer.test.ts`

- [ ] **Step 1: 实现 Visualizer**

```typescript
// src/visualizers/avlTreeVisualizer.ts
import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, measureRender, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import { tStatic } from '../i18n/useI18n'
import { DEFAULT_NODE_RADIUS, DEFAULT_LEVEL_HEIGHT } from './visualizerConstants'
import type { AvlTreeData, AvlNode } from '../types/avl'

const NODE_RADIUS = DEFAULT_NODE_RADIUS
const LEVEL_HEIGHT = DEFAULT_LEVEL_HEIGHT

export interface AvlTreeRenderOptions {
  isDark?: boolean
  theme?: string
}

export function renderAvlTree(svg: SVGSVGElement, data: AvlTreeData, options: AvlTreeRenderOptions = {}) {
  return measureRender('renderAvlTree', () => {
    const container = select(svg)
    container.selectAll('*').interrupt()
    container.selectAll('*').remove()

    const isDark = options.isDark ?? detectDarkMode()
    const colors = getColors(options.theme, isDark)
    ensureGradientDefs(svg, isDark)

    const width = svg.clientWidth || 800
    const height = svg.clientHeight || 400
    container.attr('viewBox', `0 0 ${width} ${height}`)

    if (!data.root) return

    const positions = computePositions(data.root, width / 2, 40, width / 2 - 40)

    // 绘制边
    data.edges.forEach(edge => {
      const from = positions.get(edge.source)
      const to = positions.get(edge.target)
      if (!from || !to) return
      container.append('line')
        .attr('x1', from.x).attr('y1', from.y)
        .attr('x2', to.x).attr('y2', to.y)
        .attr('stroke', colors.border)
        .attr('stroke-width', 2)
        .attr('class', `tree-edge-from-${edge.source}-to-${edge.target}`)
    })

    // 绘制节点
    data.nodes.forEach(node => {
      const pos = positions.get(node.id)
      if (!pos) return
      const group = container.append('g')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .attr('class', `avl-node-group node-${node.id}`)

      group.append('circle')
        .attr('r', NODE_RADIUS)
        .attr('fill', gradUrl('node', isDark))
        .attr('stroke', colors.border)
        .attr('stroke-width', 2)

      group.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', colors.ink)
        .attr('font-size', 14)
        .text(String(node.value))
    })
  })
}

function computePositions(
  root: AvlNode,
  rootX: number,
  rootY: number,
  availableWidth: number,
  positions = new Map<string, { x: number; y: number }>()
): Map<string, { x: number; y: number }> {
  function traverse(node: AvlNode | null, x: number, y: number, width: number) {
    if (!node) return
    positions.set(node.id, { x, y })
    const nextY = y + LEVEL_HEIGHT
    const half = width / 2
    if (node.left) traverse(node.left, x - half, nextY, half)
    if (node.right) traverse(node.right, x + half, nextY, half)
  }
  traverse(root, rootX, rootY, availableWidth)
  return positions
}

export async function animateInsertAvl(
  svg: SVGSVGElement,
  value: number,
  data: AvlTreeData,
  options: AvlTreeRenderOptions = {},
  anim?: Animation
) {
  if (data.nodes.length > getLargeDataThreshold('tree')) return
  if (anim?.isAborted?.()) return

  const container = select(svg)
  const targetNode = container.selectAll('.avl-node-group')
    .filter(function () {
      return select(this).select('text').text() === String(value)
    })
    .select('circle')

  if (targetNode.empty()) return

  await transitionEnd(
    targetNode
      .transition().duration(duration(350, data.nodes.length))
      .ease(EASING.easeOutBack)
      .attr('r', NODE_RADIUS * 1.4)
      .attr('stroke-width', 4)
      .transition().duration(duration(300, data.nodes.length))
      .ease(EASING.easeInOutCubic)
      .attr('r', NODE_RADIUS)
      .attr('stroke-width', 2),
    anim
  )
}
```

- [ ] **Step 2: 编写 Visualizer 测试**

```typescript
// src/__tests__/visualizers/avlTreeVisualizer.test.ts
import { describe, it, expect } from 'vitest'
import { renderAvlTree } from '../../visualizers/avlTreeVisualizer'
import { createInitialAvlTree } from '../../hooks/useAvlTreeState'

describe('avlTreeVisualizer', () => {
  it('renders nodes and edges', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '800')
    svg.setAttribute('height', '400')
    document.body.appendChild(svg)

    const data = createInitialAvlTree()
    renderAvlTree(svg, data)

    const circles = svg.querySelectorAll('circle')
    const lines = svg.querySelectorAll('line')
    expect(circles.length).toBe(data.nodes.length)
    expect(lines.length).toBe(data.edges.length)

    document.body.removeChild(svg)
  })
})
```

- [ ] **Step 3: 运行测试验证**

Run: `npx vitest run src/__tests__/visualizers/avlTreeVisualizer.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/visualizers/avlTreeVisualizer.ts src/__tests__/visualizers/avlTreeVisualizer.test.ts
git commit -m "feat(avl): AVL 树可视化器"
```

---

### Task 4: AVL 树 — Page / 路由 / 导航 / 首页 / i18n / 学习配置

**Files:**
- Create: `src/pages/AvlTreePage.tsx`
- Create: `src/configs/learning/avlTree.config.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/Sidebar.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/i18n/locales.ts`
- Modify: `src/configs/learning/index.ts`
- Test: `src/__tests__/AvlTreePage.test.tsx`

- [ ] **Step 1: 实现 AvlTreePage**

```tsx
// src/pages/AvlTreePage.tsx
import { memo, useCallback, useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { Visualizer } from '../components/Visualizer'
import { OperationBar } from '../components/OperationBar'
import { OperationGroup } from '../components/OperationGroup'
import { OperationButton } from '../components/OperationButton'
import { InfoPanel } from '../components/InfoPanel'
import { useAvlTreeState } from '../hooks/useAvlTreeState'
import { useLearningMode } from '../hooks/useLearningMode'
import { useSharedData } from '../hooks/useSharedData'
import { useKeyboard } from '../hooks/useKeyboard'
import { useCommonKeyboard } from '../hooks/useCommonKeyboard'
import { useToast } from '../components/toastStore'
import { useI18n } from '../i18n/useI18n'
import { renderAvlTree, animateInsertAvl } from '../visualizers/avlTreeVisualizer'
import { avlTreeConfig } from '../configs/learning/avlTree.config'
import { getValidationError } from '../utils/validate'

const AvlTreePage = memo(function AvlTreePage() {
  const { t } = useI18n()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [inputValue, setInputValue] = useState('')
  const {
    data, logs, isAnimating, setIsAnimating, insert, clear, reset,
    undo, redo, canUndo, canRedo,
  } = useAvlTreeState()

  const {
    isLearningMode, currentStep, goToStep, toggleLearningMode,
    learningConfig, canGoNext, canGoPrev, goNext, goPrev,
  } = useLearningMode({ config: avlTreeConfig })

  useSharedData({ dataType: 'avl-tree', loadData: reset })
  useCommonKeyboard({ undo, redo, canUndo, canRedo })

  const handleRender = useCallback((svg: SVGSVGElement) => {
    renderAvlTree(svg, data)
  }, [data])

  const handleInsert = useCallback(async () => {
    const error = getValidationError(inputValue, { min: 1, max: 99 })
    if (error) { useToast.getState().showToast({ type: 'error', message: error }); return }
    const value = parseInt(inputValue, 10)
    setIsAnimating(true)
    try {
      insert(value)
      if (svgRef.current) await animateInsertAvl(svgRef.current, value, data)
    } finally {
      setIsAnimating(false)
      setInputValue('')
    }
  }, [inputValue, insert, data, setIsAnimating])

  const handleClear = useCallback(() => {
    clear()
  }, [clear])

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-4">
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        <PageHeader title={t('avlTree.title')} description={t('avlTree.description')} />
        <Visualizer
          svgRef={svgRef}
          onRender={handleRender}
          ariaLabel={t('avlTree.visualizerAriaLabel')}
          isAnimating={isAnimating}
        />
        <OperationBar>
          <OperationGroup title={t('avlTree.operations')}>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="neo-input w-24"
                aria-label={t('avlTree.inputAriaLabel')}
              />
              <OperationButton onClick={handleInsert} isBusy={isAnimating} aria-label={t('avlTree.insert')}>
                {t('avlTree.insert')}
              </OperationButton>
              <OperationButton onClick={handleClear} disabled={data.nodes.length === 0} aria-label={t('avlTree.clear')}>
                {t('avlTree.clear')}
              </OperationButton>
            </div>
          </OperationGroup>
        </OperationBar>
      </div>
      <InfoPanel
        logs={logs}
        learningConfig={learningConfig}
        currentStep={currentStep}
        isLearningMode={isLearningMode}
        onToggleLearningMode={toggleLearningMode}
        onGoToStep={goToStep}
        onNext={goNext}
        onPrev={goPrev}
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
      />
    </div>
  )
})

export default AvlTreePage
```

- [ ] **Step 2: 实现学习配置**

```typescript
// src/configs/learning/avlTree.config.ts
import type { LearningModeConfig } from '../../types/learning'

export const avlTreeConfig: LearningModeConfig = {
  algorithmKey: 'avlTree',
  title: 'AVL 树',
  description: '自平衡二叉搜索树，通过旋转保持左右子树高度差不超过 1。',
  steps: [
    {
      id: 'intro',
      title: 'AVL 树简介',
      description: 'AVL 树是一颗自平衡二叉搜索树，任何节点的左右子树高度差不超过 1。',
      codeSnippet: `class AvlNode {
  value: number
  left: AvlNode | null
  right: AvlNode | null
  height: number
}`,
      highlightedLine: 1,
      highlightTerms: ['AvlNode', 'height'],
      tips: ['平衡因子 = 左子树高度 - 右子树高度'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'insert',
      title: '插入节点',
      description: '按 BST 规则插入后，从插入点向上更新高度并检查平衡因子。',
      codeSnippet: `function insertAvl(root, value) {
  if (!root) return createNode(value)
  if (value < root.value) root.left = insertAvl(root.left, value)
  else root.right = insertAvl(root.right, value)
  updateHeight(root)
  return balance(root, value)
}`,
      highlightedLine: 5,
      highlightTerms: ['updateHeight', 'balance'],
      tips: ['插入后需要重新平衡'],
      complexity: { time: 'O(log n)', space: 'O(log n)' },
    },
    {
      id: 'rotate',
      title: '旋转平衡',
      description: '根据平衡因子和插入位置选择左旋、右旋、左右旋或右左旋。',
      codeSnippet: `if (balance > 1 && value < root.left.value) return rotateRight(root)
if (balance < -1 && value > root.right.value) return rotateLeft(root)`,
      highlightedLine: 1,
      highlightTerms: ['rotateRight', 'rotateLeft'],
      tips: ['LL 和 RR 只需单次旋转，LR 和 RL 需要双旋'],
      complexity: { time: 'O(1)', space: 'O(1)' },
    },
  ],
}
```

- [ ] **Step 3: 修改 App.tsx 添加路由**

```tsx
// 在 App.tsx 的 lazy imports 区域添加
const AvlTreePage = lazy(() => import('./pages/AvlTreePage'))

// 在 Routes 中添加
<Route path="/avl-tree" element={<AvlTreePage />} />
```

- [ ] **Step 4: 修改 Sidebar.tsx 添加导航**

```typescript
// 在 STRUCTURE_KEYS 数组中添加
{ key: 'avl-tree', labelKey: 'sidebar.avlTree', category: 'tree' }

// 在 getIconSvg 中添加 case
const iconMap: Record<string, () => string> = {
  // ...existing icons
  'avl-tree': () => `<svg>...</svg>`,
}
```

- [ ] **Step 5: 修改 Home.tsx 添加卡片**

```typescript
// 在 structures 数组的树形结构分组中添加
{
  key: 'avl-tree',
  titleKey: 'home.avlTreeTitle',
  descKey: 'home.avlTreeDesc',
  icon: 'avl-tree',
  color: 'tree',
}
```

- [ ] **Step 6: 修改 i18n/locales.ts 添加文案**

```typescript
// zh 命名空间
avlTree: {
  title: 'AVL 树',
  description: '自平衡二叉搜索树可视化',
  visualizerAriaLabel: 'AVL 树可视化',
  inputAriaLabel: '输入要插入的值',
  insert: '插入',
  clear: '清空',
  operations: '操作',
}

// en 命名空间
avlTree: {
  title: 'AVL Tree',
  description: 'Self-balancing binary search tree visualization',
  // ...
}
```

- [ ] **Step 7: 注册学习配置**

```typescript
// src/configs/learning/index.ts
import { avlTreeConfig } from './avlTree.config'

export const learningConfigs = [
  // ...existing configs
  avlTreeConfig,
]
```

- [ ] **Step 8: 编写页面测试**

```tsx
// src/__tests__/AvlTreePage.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import AvlTreePage from '../pages/AvlTreePage'

describe('AvlTreePage', () => {
  it('renders page header and visualizer', () => {
    render(
      <BrowserRouter>
        <AvlTreePage />
      </BrowserRouter>
    )
    expect(screen.getByText('AVL 树')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /AVL 树可视化/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 9: 运行测试与构建验证**

Run: `npm run test:run`
Expected: 新增测试通过，原有测试不失败

Run: `npm run build`
Expected: 成功，bundle 预算通过

- [ ] **Step 10: Commit**

```bash
git add src/pages/AvlTreePage.tsx src/configs/learning/avlTree.config.ts \
  src/App.tsx src/components/Sidebar.tsx src/pages/Home.tsx \
  src/i18n/locales.ts src/configs/learning/index.ts \
  src/__tests__/AvlTreePage.test.tsx
git commit -m "feat(avl): AVL 树页面、路由、导航与学习配置"
```

---

### Task 5: 跳表 SkipList

**Files:**
- Create: `src/types/skipList.d.ts`
- Create: `src/algorithms/skipList.ts`
- Create: `src/hooks/useSkipListState.ts`
- Create: `src/visualizers/skipListVisualizer.ts`
- Create: `src/pages/SkipListPage.tsx`
- Create: `src/configs/learning/skipList.config.ts`
- Create: `src/__tests__/algorithms/skipList.test.ts`
- Create: `src/__tests__/hooks/useSkipListState.test.ts`
- Create: `src/__tests__/visualizers/skipListVisualizer.test.ts`
- Create: `src/__tests__/SkipListPage.test.tsx`
- Modify: `src/App.tsx`, `src/components/Sidebar.tsx`, `src/pages/Home.tsx`, `src/i18n/locales.ts`, `src/configs/learning/index.ts`

**说明:** 跳表数据表示采用扁平化 `{ nodes: {value, level}[], edges: {from, to, level}[] }`。核心逻辑：
- `insert(value)`：随机决定层数，从顶层向下查找前驱并插入
- `search(value)`：从顶层开始向右/向下查找
- `delete(value)`：找到所有层的前驱并移除

- [ ] **Step 1: 实现跳表算法**

```typescript
// src/algorithms/skipList.ts
import type { SkipListNode, SkipListEdge, SkipListData } from '../types/skipList'

const MAX_LEVEL = 8
const P = 0.5

export function randomLevel(): number {
  let level = 1
  while (Math.random() < P && level < MAX_LEVEL) level++
  return level
}

export function createSkipList(): SkipListData {
  const head: SkipListNode = { id: 'head', value: -Infinity, level: MAX_LEVEL, next: {} }
  return { head, nodes: [head], edges: [] }
}

export function insertSkipList(data: SkipListData, value: number): SkipListData {
  const level = randomLevel()
  const newNode: SkipListNode = { id: crypto.randomUUID(), value, level, next: {} }
  const update: SkipListNode[] = []

  let current = data.head
  for (let i = MAX_LEVEL - 1; i >= 0; i--) {
    while (current.next[i] && current.next[i]!.value < value) {
      current = current.next[i]!
    }
    update[i] = current
  }

  for (let i = 0; i < level; i++) {
    newNode.next[i] = update[i].next[i]
    update[i].next[i] = newNode
  }

  return flattenSkipList(data.head)
}

export function flattenSkipList(head: SkipListNode): SkipListData {
  const nodes: SkipListNode[] = []
  const edges: SkipListEdge[] = []
  const seen = new Set<string>()

  for (let level = MAX_LEVEL - 1; level >= 0; level--) {
    let current = head.next[level]
    while (current) {
      if (!seen.has(current.id)) {
        nodes.push(current)
        seen.add(current.id)
      }
      if (current.next[level]) {
        edges.push({ source: current.id, target: current.next[level]!.id, level })
      }
      current = current.next[level]
    }
  }

  return { head, nodes, edges }
}
```

- [ ] **Step 2: 实现 useSkipListState**

```typescript
// src/hooks/useSkipListState.ts
import { useCallback } from 'react'
import { useDataStructureState } from './useDataStructureState'
import { createSkipList, insertSkipList } from '../algorithms/skipList'
import { tStatic } from '../i18n/useI18n'
import { showToast } from '../components/toastStore'
import type { SkipListData } from '../types/skipList'

const INITIAL_SKIPLIST = createSkipList()

export function useSkipListState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<SkipListData>(INITIAL_SKIPLIST, { storageKey: 'skip-list' })

  const insert = useCallback((value: number) => {
    const newData = insertSkipList(data, value)
    push(newData)
    addLog('oper', tStatic('hooks.skipListLogInsert').replace('{value}', String(value)))
    showToast({ type: 'success', message: tStatic('hooks.skipListInsertSuccess') })
  }, [data, push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    insert, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  }
}
```

- [ ] **Step 3: 实现 skipListVisualizer**

```typescript
// src/visualizers/skipListVisualizer.ts
import { select } from '../utils/d3Imports'
import { duration, EASING, transitionEnd, measureRender, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import type { SkipListData } from '../types/skipList'

const NODE_WIDTH = 44
const NODE_HEIGHT = 28
const LEVEL_GAP = 40
const NODE_GAP = 16

export interface SkipListRenderOptions {
  isDark?: boolean
  theme?: string
}

export function renderSkipList(svg: SVGSVGElement, data: SkipListData, options: SkipListRenderOptions = {}) {
  return measureRender('renderSkipList', () => {
    const container = select(svg)
    container.selectAll('*').interrupt()
    container.selectAll('*').remove()

    const isDark = options.isDark ?? detectDarkMode()
    const colors = getColors(options.theme, isDark)
    ensureGradientDefs(svg, isDark)

    const width = svg.clientWidth || 800
    const height = svg.clientHeight || 400
    container.attr('viewBox', `0 0 ${width} ${height}`)

    // 按层分组节点
    const levelNodes = new Map<number, string[]>()
    for (let i = 7; i >= 0; i--) {
      levelNodes.set(i, [])
      let current = data.head.next[i]
      while (current) {
        levelNodes.get(i)!.push(current.id)
        current = current.next[i]
      }
    }

    const yForLevel = (level: number) => height / 2 - (level * LEVEL_GAP) + 120

    // 计算节点 x 坐标（以最高层为基准，向右排列）
    const xMap = new Map<string, number>()
    const topLevel = 7
    const topIds = levelNodes.get(topLevel)!
    const startX = (width - (topIds.length * (NODE_WIDTH + NODE_GAP))) / 2
    topIds.forEach((id, idx) => xMap.set(id, startX + idx * (NODE_WIDTH + NODE_GAP)))

    // 低层节点 x 坐标取同一节点最高层位置
    data.nodes.forEach(node => {
      if (!xMap.has(node.id)) {
        for (let i = node.level - 1; i >= 0; i--) {
          const idx = levelNodes.get(i)!.indexOf(node.id)
          if (idx >= 0) {
            xMap.set(node.id, startX + idx * (NODE_WIDTH + NODE_GAP))
            break
          }
        }
      }
    })

    // 绘制边
    data.edges.forEach(edge => {
      const node = data.nodes.find(n => n.id === edge.source)
      if (!node) return
      const x1 = xMap.get(edge.source)! + NODE_WIDTH
      const x2 = xMap.get(edge.target)!
      const y = yForLevel(edge.level) + NODE_HEIGHT / 2
      container.append('line')
        .attr('x1', x1).attr('y1', y)
        .attr('x2', x2).attr('y2', y)
        .attr('stroke', colors.border)
        .attr('stroke-width', 1.5)
    })

    // 绘制节点（去重，每个节点只绘制一次，用最高层 y）
    const drawn = new Set<string>()
    data.nodes.forEach(node => {
      if (drawn.has(node.id)) return
      drawn.add(node.id)
      const x = xMap.get(node.id) ?? 0
      const y = yForLevel(node.level - 1)
      const group = container.append('g')
        .attr('transform', `translate(${x}, ${y})`)
        .attr('class', `skip-node-${node.id}`)

      group.append('rect')
        .attr('width', NODE_WIDTH)
        .attr('height', NODE_HEIGHT)
        .attr('rx', 6)
        .attr('fill', gradUrl('node', isDark))
        .attr('stroke', colors.border)
        .attr('stroke-width', 2)

      group.append('text')
        .attr('x', NODE_WIDTH / 2)
        .attr('y', NODE_HEIGHT / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'middle')
        .attr('fill', colors.ink)
        .attr('font-size', 12)
        .text(node.value === -Infinity ? 'H' : String(node.value))
    })
  })
}
```

- [ ] **Step 4: 实现 SkipListPage 与注册**

参照 Task 4 中 AvlTreePage 模式，创建 `src/pages/SkipListPage.tsx`、学习配置 `skipList.config.ts`，并在 `App.tsx`、`Sidebar.tsx`、`Home.tsx`、`locales.ts`、`configs/learning/index.ts` 中注册。

- [ ] **Step 5: 编写测试**

- `src/__tests__/algorithms/skipList.test.ts`：验证插入后层级结构
- `src/__tests__/hooks/useSkipListState.test.ts`：验证状态更新
- `src/__tests__/visualizers/skipListVisualizer.test.ts`：验证 SVG 渲染
- `src/__tests__/SkipListPage.test.tsx`：验证页面渲染

- [ ] **Step 6: 运行验证**

Run: `npm run test:run`
Run: `npm run build`
Expected: 全部通过

- [ ] **Step 7: Commit**

```bash
git add src/types/skipList.d.ts src/algorithms/skipList.ts src/hooks/useSkipListState.ts \
  src/visualizers/skipListVisualizer.ts src/pages/SkipListPage.tsx \
  src/configs/learning/skipList.config.ts src/__tests__/algorithms/skipList.test.ts \
  src/__tests__/hooks/useSkipListState.test.ts src/__tests__/visualizers/skipListVisualizer.test.ts \
  src/__tests__/SkipListPage.test.tsx src/App.tsx src/components/Sidebar.tsx src/pages/Home.tsx \
  src/i18n/locales.ts src/configs/learning/index.ts
git commit -m "feat(skip-list): 跳表数据结构全流程"
```

---

### Task 6: 并查集 Union-Find

**Files:**
- Create: `src/types/unionFind.d.ts`
- Create: `src/algorithms/unionFind.ts`
- Create: `src/hooks/useUnionFindState.ts`
- Create: `src/visualizers/unionFindVisualizer.ts`
- Create: `src/pages/UnionFindPage.tsx`
- Create: `src/configs/learning/unionFind.config.ts`
- Create: 对应测试文件
- Modify: `src/App.tsx`, `src/components/Sidebar.tsx`, `src/pages/Home.tsx`, `src/i18n/locales.ts`, `src/configs/learning/index.ts`

**说明:** 数据表示 `{ parent: Record<string, string>, rank: Record<string, number>, nodes: UnionFindNode[] }`，复用 `graphVisualizer` 的节点渲染思路，边表示 parent 关系。

- [ ] **Step 1: 实现并查集算法**

```typescript
// src/algorithms/unionFind.ts
import type { UnionFindData, UnionFindNode } from '../types/unionFind'

export function createUnionFind(values: number[] = [1, 2, 3, 4, 5, 6, 7, 8]): UnionFindData {
  const parent: Record<string, string> = {}
  const rank: Record<string, number> = {}
  const nodes: UnionFindNode[] = values.map(v => {
    const id = `n${v}`
    parent[id] = id
    rank[id] = 0
    return { id, value: v, x: 0, y: 0 }
  })
  return { parent, rank, nodes, edges: [] }
}

export function find(data: UnionFindData, id: string): string {
  if (data.parent[id] !== id) {
    data.parent[id] = find(data, data.parent[id]) // 路径压缩
  }
  return data.parent[id]
}

export function union(data: UnionFindData, a: number, b: number): UnionFindData {
  const idA = `n${a}`
  const idB = `n${b}`
  const rootA = find(data, idA)
  const rootB = find(data, idB)

  if (rootA === rootB) return data

  // 按秩合并
  if (data.rank[rootA] < data.rank[rootB]) {
    data.parent[rootA] = rootB
  } else if (data.rank[rootA] > data.rank[rootB]) {
    data.parent[rootB] = rootA
  } else {
    data.parent[rootB] = rootA
    data.rank[rootA] += 1
  }

  return rebuildEdges(data)
}

function rebuildEdges(data: UnionFindData): UnionFindData {
  data.edges = data.nodes
    .filter(n => data.parent[n.id] !== n.id)
    .map(n => ({ source: n.id, target: data.parent[n.id] }))
  return data
}
```

- [ ] **Step 2: 实现 Hook、Visualizer、Page 与注册**

参照 Task 4/5 模式。

- [ ] **Step 3: 编写测试并验证**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(union-find): 并查集数据结构全流程"
```

---

### Task 7: 红黑树 Red-Black Tree

**Files:**
- Create: `src/types/redBlackTree.d.ts`
- Create: `src/algorithms/redBlackTree.ts`
- Create: `src/hooks/useRedBlackTreeState.ts`
- Create: `src/visualizers/redBlackTreeVisualizer.ts`
- Create: `src/pages/RedBlackTreePage.tsx`
- Create: `src/configs/learning/redBlackTree.config.ts`
- Create: 对应测试文件
- Modify: `src/App.tsx`, `src/components/Sidebar.tsx`, `src/pages/Home.tsx`, `src/i18n/locales.ts`, `src/configs/learning/index.ts`

**说明:** 红黑树是 v12 最复杂的结构。本迭代采用"静态渲染 + 基础插入动画"策略，重染色动画作为后续增强。数据表示采用递归对象 `RedBlackNode { value, color, left, right, parent }`。

- [ ] **Step 1: 实现红黑树算法（简化版，仅插入与重染色）**

```typescript
// src/algorithms/redBlackTree.ts
import type { RedBlackNode, RedBlackTreeData } from '../types/redBlackTree'

export type Color = 'red' | 'black'

export function createNode(value: number, color: Color = 'red'): RedBlackNode {
  return {
    id: crypto.randomUUID(),
    value,
    color,
    left: null,
    right: null,
    parent: null,
  }
}

export function insertRedBlack(root: RedBlackNode | null, value: number): RedBlackNode {
  let newNode = createNode(value)
  if (!root) {
    newNode.color = 'black'
    return newNode
  }

  // BST 插入
  let parent: RedBlackNode | null = null
  let current: RedBlackNode | null = root
  while (current) {
    parent = current
    if (value < current.value) current = current.left
    else if (value > current.value) current = current.right
    else return root // 重复值
  }

  newNode.parent = parent
  if (value < parent!.value) parent!.left = newNode
  else parent!.right = newNode

  // 修复红黑性质
  root = fixInsert(root, newNode)
  return root
}

function fixInsert(root: RedBlackNode, node: RedBlackNode): RedBlackNode {
  while (node.parent && node.parent.color === 'red') {
    const grandparent = node.parent.parent
    if (!grandparent) break

    if (node.parent === grandparent.left) {
      const uncle = grandparent.right
      if (uncle && uncle.color === 'red') {
        node.parent.color = 'black'
        uncle.color = 'black'
        grandparent.color = 'red'
        node = grandparent
      } else {
        if (node === node.parent.right) {
          node = node.parent
          root = rotateLeft(root, node)
        }
        node.parent!.color = 'black'
        grandparent.color = 'red'
        root = rotateRight(root, grandparent)
      }
    } else {
      const uncle = grandparent.left
      if (uncle && uncle.color === 'red') {
        node.parent.color = 'black'
        uncle.color = 'black'
        grandparent.color = 'red'
        node = grandparent
      } else {
        if (node === node.parent.left) {
          node = node.parent
          root = rotateRight(root, node)
        }
        node.parent!.color = 'black'
        grandparent.color = 'red'
        root = rotateLeft(root, grandparent)
      }
    }
  }
  root.color = 'black'
  return root
}

function rotateLeft(root: RedBlackNode, x: RedBlackNode): RedBlackNode {
  const y = x.right!
  x.right = y.left
  if (y.left) y.left.parent = x
  y.parent = x.parent
  if (!x.parent) root = y
  else if (x === x.parent.left) x.parent.left = y
  else x.parent.right = y
  y.left = x
  x.parent = y
  return root
}

function rotateRight(root: RedBlackNode, y: RedBlackNode): RedBlackNode {
  const x = y.left!
  y.left = x.right
  if (x.right) x.right.parent = y
  x.parent = y.parent
  if (!y.parent) root = x
  else if (y === y.parent.right) y.parent.right = x
  else y.parent.left = x
  x.right = y
  y.parent = x
  return root
}

export function flattenRedBlack(root: RedBlackNode | null): RedBlackTreeData {
  const nodes: RedBlackNode[] = []
  const edges: { source: string; target: string }[] = []
  function traverse(node: RedBlackNode | null) {
    if (!node) return
    nodes.push(node)
    if (node.left) {
      edges.push({ source: node.id, target: node.left.id })
      traverse(node.left)
    }
    if (node.right) {
      edges.push({ source: node.id, target: node.right.id })
      traverse(node.right)
    }
  }
  traverse(root)
  return { root, nodes, edges }
}
```

- [ ] **Step 2: 实现 Hook、Visualizer（颜色区分红黑节点）、Page 与注册**

Visualizer 中：
- 黑色节点：深色填充 + 白色文字
- 红色节点：红色填充 + 白色文字
- 叶子空位用 NIL 小方块表示（可选，先不做）

- [ ] **Step 3: 编写测试并验证**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(red-black-tree): 红黑树数据结构全流程（静态渲染 + 基础插入动画）"
```

---

### Task 8: 全局搜索 GlobalSearch

**Files:**
- Create: `src/data/searchIndex.ts`
- Create: `src/components/GlobalSearch.tsx`
- Create: `src/__tests__/components/GlobalSearch.test.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/hooks/useGlobalSettings.ts`（添加搜索快捷键监听，不引入 Context）

**说明:** 全局搜索索引从 `Sidebar.tsx` 的 `STRUCTURE_KEYS` 和学习配置生成，避免维护两套列表。

- [ ] **Step 1: 生成搜索索引**

```typescript
// src/data/searchIndex.ts
import { STRUCTURE_KEYS } from '../components/Sidebar'
import { learningConfigs } from '../configs/learning'
import { tStatic } from '../i18n/useI18n'

export interface SearchItem {
  id: string
  title: string
  subtitle?: string
  path: string
  keywords: string[]
}

export function buildSearchIndex(): SearchItem[] {
  const items: SearchItem[] = []

  STRUCTURE_KEYS.forEach(item => {
    items.push({
      id: `page-${item.key}`,
      title: tStatic(item.labelKey),
      path: `/${item.key}`,
      keywords: [item.key, item.category, tStatic(item.labelKey)],
    })
  })

  learningConfigs.forEach(config => {
    config.steps.forEach((step, idx) => {
      items.push({
        id: `learning-${config.algorithmKey}-${step.id}`,
        title: step.title,
        subtitle: tStatic(`learning.${config.algorithmKey}.title`),
        path: `/${config.algorithmKey}`,
        keywords: [step.title, config.algorithmKey, step.description?.slice(0, 20) || ''],
      })
    })
  })

  return items
}
```

- [ ] **Step 2: 实现 GlobalSearch 组件**

```tsx
// src/components/GlobalSearch.tsx
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import { buildSearchIndex, type SearchItem } from '../data/searchIndex'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export const GlobalSearch = memo(function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const items = useMemo(() => buildSearchIndex(), [t])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items.slice(0, 10)
    return items.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.keywords.some(k => k.toLowerCase().includes(q))
    )
  }, [items, query])

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSelect = useCallback((item: SearchItem) => {
    navigate(item.path)
    onClose()
  }, [navigate, onClose])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => (i + 1) % filtered.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => (i - 1 + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) handleSelect(filtered[selectedIndex])
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [filtered, selectedIndex, handleSelect, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[15vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t('globalSearch.title')}
    >
      <div
        className="w-full max-w-2xl bg-paper neo-border shadow-hard-lg rounded-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('globalSearch.placeholder')}
            className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground"
            aria-label={t('globalSearch.inputAriaLabel')}
          />
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {filtered.map((item, idx) => (
            <li
              key={item.id}
              role="option"
              aria-selected={idx === selectedIndex}
              className={`px-4 py-3 cursor-pointer rounded-md ${
                idx === selectedIndex ? 'bg-surface-strong' : 'hover:bg-surface'
              }`}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="font-medium text-ink">{item.title}</div>
              {item.subtitle && (
                <div className="text-sm text-muted-foreground">{item.subtitle}</div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
})
```

- [ ] **Step 3: 在 Layout.tsx 中挂载**

```tsx
// src/components/Layout.tsx
import { GlobalSearch } from './GlobalSearch'

function Layout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(open => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {/* ...existing layout */}
    </>
  )
}
```

- [ ] **Step 4: 添加 i18n 文案**

```typescript
globalSearch: {
  title: '全局搜索',
  placeholder: '搜索页面、算法、操作...',
  inputAriaLabel: '搜索输入框',
  shortcut: 'Ctrl + K',
}
```

- [ ] **Step 5: 编写组件测试**

```tsx
// src/__tests__/components/GlobalSearch.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { GlobalSearch } from '../../components/GlobalSearch'

describe('GlobalSearch', () => {
  it('filters items by query', () => {
    render(
      <BrowserRouter>
        <GlobalSearch isOpen={true} onClose={vi.fn()} />
      </BrowserRouter>
    )
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'array' } })
    expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 6: 运行验证**

Run: `npm run test:run`
Run: `npm run build`
Expected: 全部通过

- [ ] **Step 7: Commit**

```bash
git add src/data/searchIndex.ts src/components/GlobalSearch.tsx \
  src/__tests__/components/GlobalSearch.test.tsx src/components/Layout.tsx \
  src/i18n/locales.ts
git commit -m "feat(global-search): Ctrl/Cmd+K 全局搜索"
```

---

## 五、后续阶段概要（v12.x 及以后）

### Phase 2: 学习闭环增强（v12.1）

| 功能 | 优先级 | 文件 |
|------|--------|------|
| 测验系统 Quiz | P1 | `src/data/quizData.ts`, `src/hooks/useQuiz.ts`, `src/components/QuizPanel.tsx` |
| 设置面板 SettingsPanel | P1 | `src/components/SettingsPanel.tsx`（扩展 useGlobalSettings） |
| 新手引导 GuideTooltip | P1 | `src/components/GuideTooltip.tsx` |
| 导出增强 ExportMenu | P2 | `src/components/ExportMenu.tsx`（SVG→PNG / 日志 / 代码片段） |

### Phase 3: 高级结构与算法补充（v12.2）

| 功能 | 优先级 |
|------|--------|
| B 树 | P2 |
| 线段树 | P2 |
| 树状数组 BIT | P2 |
| 稀疏表 | P2 |
| 布隆过滤器 | P2 |
| KMP / A* / CPM | P2 |

### Phase 4: 性能与工程加固（v12.3）

| 功能 | 优先级 |
|------|--------|
| Web Worker 排序 | P2 |
| 虚拟滚动 LogPanel/Timeline | P2 |
| rafThrottle 接入 ResizeObserver | P2 |
| 生产 console 清理 | P3 |

---

## 六、影响分析（Blast Radius）

| 模块 | 影响 | 副作用风险 |
|------|------|-----------|
| App.tsx | 新增 4 条 lazy Route | 低，代码分割不会增加首屏包 |
| Sidebar.tsx | 新增 4 个导航项 + 图标 | 低 |
| Home.tsx | 新增 4 张卡片 | 低 |
| i18n/locales.ts | 新增 4 个命名空间 | 低 |
| configs/learning/index.ts | 新增 4 个配置 | 低 |
| Layout.tsx | 挂载 GlobalSearch | 低，不引入 Context |
| 测试 | 新增约 16 个测试文件 | 中，需保证基线不退化 |
| Bundle | 新增 4 个页面 chunk | 低，lazy 加载不增加 index chunk |

---

## 七、验证标准（Definition of Done）

### 7.1 单元测试

- [ ] `npm run test:run` 全部通过（基线 3089 + 新增测试）
- [ ] 新增算法测试覆盖 LL/RR/LR/RL 旋转、跳表多层、并查集路径压缩、红黑树重染色
- [ ] 新增 Hook 测试覆盖 insert/undo/redo/clear
- [ ] 新增 Visualizer 测试覆盖 SVG 渲染
- [ ] 新增 Page 测试覆盖渲染与交互
- [ ] GlobalSearch 测试覆盖过滤与键盘导航

### 7.2 静态检查

- [ ] `npm run lint` 0 errors
- [ ] `npx tsc --noEmit` 0 errors

### 7.3 构建与 Bundle

- [ ] `npm run build` 成功
- [ ] `node scripts/check-bundle.js` 通过（index < 80KB、vendor-react < 250KB、vendor-d3 < 60KB）

### 7.4 E2E 与 A11y

- [ ] 启动 dev server：`npm run dev`
- [ ] `node e2e/run-all-tests.js` 通过
- [ ] `node e2e/test-a11y.js` 0 violations（新增 4 页面 + GlobalSearch）

### 7.5 手动验证

- [ ] AVL 树插入后自动旋转并保持平衡
- [ ] 跳表多层连线清晰，插入/搜索动画正确
- [ ] 并查集 union 后 parent 关系与 rank 正确更新
- [ ] 红黑树节点颜色正确，插入后保持性质
- [ ] GlobalSearch `Ctrl+K` 打开，输入可过滤，Enter 跳转

### 7.6 文档

- [ ] `PROJECT_SUMMARY.md` 更新 v12 功能列表
- [ ] `WORKLOG.md` 记录本次工作日志
- [ ] `README.md` 更新功能列表
- [ ] `ARCHITECTURE.md` 更新组件/页面/算法层
- [ ] `CODE_WIKI.md` 新增组件/函数条目
- [ ] `TODO.md` 标记完成项，更新下一步候选
- [ ] `docs/iteration-plan-v12.md` 标记完成状态

---

## 八、Git 提交策略

建议按 Task 分别提交，最终合并为一个 feature 分支：

```bash
feat(avl): AVL 树算法、Hook、Visualizer、页面与学习配置
feat(skip-list): 跳表数据结构全流程
feat(union-find): 并查集数据结构全流程
feat(red-black-tree): 红黑树数据结构全流程（静态渲染 + 基础插入动画）
feat(global-search): Ctrl/Cmd+K 全局搜索
docs: v12 迭代文档同步
```

---

## 九、资源分配建议

| Task | 预估工时 | 依赖 |
|------|---------|------|
| Task 1-4 AVL 树 | 4-5 天 | 无 |
| Task 5 跳表 | 3-4 天 | 无 |
| Task 6 并查集 | 2-3 天 | 无 |
| Task 7 红黑树 | 4-5 天 | AVL 树完成后参考其模式 |
| Task 8 全局搜索 | 1-2 天 | 无 |
| 文档与最终验证 | 1 天 | 依赖 1-8 |

**总计：约 15-20 个工作日**

---

**计划状态：** 待审阅

请审阅本计划。如批准，建议按 Task 1 → 8 顺序执行，每个 Task 完成后汇报验证结果。