# 算法接入指南

> 本文档详细说明如何向数据结构学习助手项目添加新的算法和数据结构。

---

## 目录

1. [排序算法接入](#1-排序算法接入)
2. [图算法接入](#2-图算法接入)
3. [数据结构接入](#3-数据结构接入)
4. [学习配置编写](#4-学习配置编写)
5. [可视化器编写](#5-可视化器编写)
6. [测试编写](#6-测试编写)
7. [i18n 国际化](#7-i18n-国际化)

---

## 1. 排序算法接入

### 1.1 创建算法文件

在 `src/algorithms/sorting/` 下创建新文件，例如 `cocktailSort.ts`：

```typescript
import type { SortAlgorithm, SortCallbacks } from './types'

export const cocktailSort: SortAlgorithm = {
  key: 'cocktail',
  name: 'Cocktail Sort',
  timeComplexity: 'O(n²)',
  spaceComplexity: 'O(1)',
  stable: true,
  async execute(arr, animFns, svgRef, dimensions, anim, callbacks) {
    // 算法实现
    // 使用 animFns.animateCompare / animFns.animateSwap / animFns.animateSorted
    // 每步检查 anim?.isAborted?.()
  }
}
```

### 1.2 注册算法

在 `src/algorithms/sorting/index.ts` 中注册：

```typescript
import { cocktailSort } from './cocktailSort'
registerSortAlgorithm(cocktailSort)
```

### 1.3 自动集成

`useSortState` 和 `SortPage` 会自动检测新注册的算法，无需额外修改。

### 1.4 创建学习配置

在 `src/configs/learning/` 下创建 `cocktailSort.config.ts`，参考 `bubble.config.ts`。

### 1.5 注册学习配置

在 `src/configs/learning/index.ts` 中添加 import 和注册。

### 1.6 添加 i18n

在 `src/i18n/locales.ts` 中添加算法名称的中文和英文翻译。

---

## 2. 图算法接入

### 2.1 创建算法文件

在 `src/algorithms/graph/` 下创建新文件，例如 `aStar.ts`：

```typescript
import type { GraphAlgorithmResult } from './bfs'

export interface AStarResult extends GraphAlgorithmResult {
  distances: Map<string, number>
  previousNodes: Map<string, string | null>
}

export async function aStar(
  adjacencyList: Map<string, Array<{ node: string; weight?: number }>>,
  startNode: string,
  endNode: string,
  heuristic?: (a: string, b: string) => number,
  onStep?: (step: GraphAlgorithmResult['steps'][0]) => void
): Promise<AStarResult> {
  // 算法实现
}
```

### 2.2 注册算法

在 `src/algorithms/graph/index.ts` 中：

```typescript
export { aStar, type AStarResult } from './aStar'

export type GraphAlgorithmKey = 'bfs' | 'dfs' | ... | 'aStar'

export const graphAlgorithms: GraphAlgorithm[] = [
  // ...existing
  { key: 'aStar', name: 'A*', timeComplexity: 'O(E log V)', spaceComplexity: 'O(V)', description: '启发式最短路径' },
]
```

### 2.3 创建学习配置

在 `src/configs/learning/` 下创建 `aStar.config.ts`。

### 2.4 注册学习配置

在 `src/configs/learning/index.ts` 中添加。

### 2.5 添加搜索索引

在 `src/data/searchIndex.ts` 中添加算法条目。

### 2.6 添加 i18n

在 `src/i18n/locales.ts` 中添加翻译。

---

## 3. 数据结构接入

### 3.1 完整步骤（8 步）

| 步骤 | 文件 | 说明 |
|------|------|------|
| 1 | `src/algorithms/<name>.ts` | 算法实现 + 扁平化函数 |
| 2 | `src/hooks/use<Name>State.ts` | 状态管理 Hook |
| 3 | `src/visualizers/<name>Visualizer.ts` | D3 可视化器 |
| 4 | `src/pages/<Name>Page.tsx` | 页面组件 |
| 5 | `src/App.tsx` | 添加 lazy import + Route |
| 6 | `src/components/Sidebar.tsx` | 添加侧边栏条目 |
| 7 | `src/pages/Home.tsx` | 添加首页卡片 |
| 8 | `src/__tests__/` | 编写测试 |

### 3.2 算法实现要点

- 导出节点接口和主类/函数
- 导出 `toFlattened` 函数，返回可视化所需的扁平结构
- 扁平结构包含：节点 id、值/键、坐标占位、是否高亮、children ids、边信息

### 3.3 Hook 实现要点

- 使用 `useDataStructureState` 进行状态管理 + localStorage 持久化
- 暴露：数据（扁平结构）、操作方法、reset、undo/redo、logs
- 操作方法维护数据结构不变量

### 3.4 可视化器实现要点

- 从 `src/utils/d3Imports.ts` 导入 D3（禁止直接 `import 'd3'`）
- 使用 full-clear + full-render 策略
- SVG 使用 viewBox 属性
- 使用 `src/visualizers/visualizerConstants.ts` 中的共享常量
- 导出 `render<Name>` 函数和可选的 `animate<Name>` 函数

### 3.5 页面实现要点

- 使用 `PageHeader`、`OperationBar`、`Visualizer`、`InfoPanel`、`EmptyState` 组件
- 使用 `useVisualizer`、`useKeyboard`、`useLearningMode` 等 Hook
- 操作按钮使用 `OperationButton`，设置 `isBusy` 属性
- 动画模式：先动画再改状态，用 `try/finally` 设置 `setIsAnimating(false)`
- 传递 `algorithmKey` 到 `InfoPanel`（用于测验系统）

### 3.6 类型定义

在 `src/types/hooks.d.ts` 中添加数据结构的类型定义：
- 节点接口
- 扁平化节点/边接口
- 扁平化结构接口
- 状态接口

### 3.7 注册清单

| 文件 | 注册内容 |
|------|----------|
| `src/App.tsx` | `lazy(() => import(...))` + `<Route>` |
| `src/components/Sidebar.tsx` | `{ path, key }` 条目 |
| `src/pages/Home.tsx` | 首页卡片对象 |
| `src/configs/learning/index.ts` | 学习配置 import + 注册 |
| `src/data/searchIndex.ts` | 搜索索引条目 |
| `src/i18n/locales.ts` | i18n 键（中英文） |

---

## 4. 学习配置编写

### 4.1 配置格式

```typescript
import type { LearningModeConfig } from './types'

export const myAlgorithmConfig: LearningModeConfig = {
  algorithmKey: 'myAlgorithm',
  steps: [
    {
      id: 'concept',
      title: '算法概念',
      description: '算法的基本概念和用途',
      code: '// 示例代码\nfunction example() {\n  return true\n}',
      complexity: { time: 'O(n)', space: 'O(1)' }
    },
    // ...更多步骤
  ],
  // 可选：测验题目
  quiz: [
    {
      id: 'q1',
      question: '问题文本',
      options: ['选项A', '选项B', '选项C', '选项D'],
      correctIndex: 0,
      explanation: '正确答案的解释'
    }
  ]
}
```

### 4.2 步骤设计原则

- 每个配置 5~7 个步骤
- 步骤 id 使用 camelCase
- 步骤顺序：概念 → 结构 → 操作 → 复杂度 → 应用
- 代码示例使用实际可运行的代码
- 复杂度标注时间 + 空间

### 4.3 测验题目设计

- 每个算法 3~5 道单选题
- 覆盖：复杂度、稳定性、边界条件、核心机制
- 解释要清晰，帮助学习者理解

---

## 5. 可视化器编写

### 5.1 基本结构

```typescript
import { select } from '../utils/d3Imports'
import { DEFAULT_NODE_RADIUS } from './visualizerConstants'

export function renderMyStructure(
  svg: SVGSVGElement,
  data: MyFlattened,
  dimensions: { width: number; height: number; isDark?: boolean }
): void {
  const container = select(svg)
  container.selectAll('*').remove()  // 全清

  // 计算坐标
  // 创建节点、边、标签
  // 应用样式
}

export async function animateMyOperation(
  svg: SVGSVGElement,
  // ...参数
  anim: AnimationContext
): Promise<void> {
  // 每步检查 anim?.isAborted?.()
  // 仅处理视觉高亮，不移动元素
}
```

### 5.2 关键约束

- **全清全绘**: `container.selectAll('*').remove()` 后重建所有元素
- **viewBox**: SVG 使用 viewBox 属性，不用 width/height
- **D3 导入**: 从 `src/utils/d3Imports.ts` 导入
- **动画职责**: 仅处理视觉高亮，不移动元素或创建持久 DOM
- **可中止**: 每步检查 `anim?.isAborted?.()`
- **大数据量**: 超过 `LARGE_DATA_THRESHOLD` 时跳过动画

---

## 6. 测试编写

### 6.1 测试文件结构

```
src/__tests__/
├── algorithms/
│   └── <name>.test.ts          # 算法逻辑测试
├── hooks/
│   └── use<Name>State.test.ts  # Hook 测试
├── visualizers/
│   └── <name>Visualizer.test.ts # 可视化器测试
└── pages/
    └── <Name>Page.test.tsx      # 页面测试
```

### 6.2 测试导入

测试文件使用相对路径导入（不用 `@/` 别名）：

```typescript
import { myAlgorithm } from '../../algorithms/myAlgorithm'
import { useMyState } from '../../hooks/useMyState'
```

### 6.3 测试工具

```typescript
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'
```

### 6.4 测试覆盖

| 类型 | 最少测试数 | 覆盖内容 |
|------|-----------|----------|
| 算法 | 20+ | 构建、查询、更新、属性、边界、错误 |
| Hook | 10+ | 初始状态、操作、undo/redo、持久化 |
| 可视化器 | 10+ | 渲染节点、边、高亮、空状态 |
| 页面 | 5+ | 渲染、操作、动画状态、禁用状态 |

---

## 7. i18n 国际化

### 7.1 添加键

在 `src/i18n/locales.ts` 中同时更新三处：
1. 类型定义（`interface LocaleKeys`）
2. 中文翻译（`zh` 对象）
3. 英文翻译（`en` 对象）

### 7.2 命名空间

每个数据结构/算法有自己的命名空间：

```typescript
// 类型定义
myStructure: {
  title: string
  subtitle: string
  insert: string
  // ...
}

// 中文
myStructure: {
  title: '我的结构',
  subtitle: '结构副标题',
  insert: '插入',
}

// 英文
myStructure: {
  title: 'My Structure',
  subtitle: 'Structure subtitle',
  insert: 'Insert',
}
```

### 7.3 共享命名空间

以下命名空间需要为每个新结构添加键：
- `sidebar`: 侧边栏名称
- `emptyState`: 空状态文案
- `visualizer`: 可视化器 aria-label
- `hooks`: 操作日志文案

---

## 检查清单

完成新算法/数据结构接入后，确认以下所有项：

- [ ] 算法实现正确，维护数据结构不变量
- [ ] Hook 使用 `useDataStructureState`，支持 localStorage 持久化
- [ ] 可视化器使用全清全绘策略，D3 从 `d3Imports.ts` 导入
- [ ] 页面使用标准组件，动画模式正确（先动画再改状态）
- [ ] 路由、侧边栏、首页卡片已添加
- [ ] 学习配置已创建并注册
- [ ] 搜索索引已添加
- [ ] i18n 中英文键已添加
- [ ] 类型定义已添加
- [ ] 测试已编写且全部通过
- [ ] `npm run lint` — 0 errors
- [ ] `npm run test:run` — 所有测试通过
- [ ] `npm run build` — 构建成功
