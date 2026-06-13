# 学习模式配置模块

本目录存放学习模式（Learning Mode）的算法教学步骤配置，将学习内容与业务逻辑分离，便于维护和扩展。

## 目录结构

```
configs/learning/
├── README.md           # 本文档
├── types.ts           # 类型重新导出（实际定义在 src/types/learning.d.ts）
├── index.ts           # 统一导出
├── bfs.config.ts      # 广度优先搜索
├── dfs.config.ts      # 深度优先搜索
├── dijkstra.config.ts # Dijkstra 最短路径
├── topoSort.config.ts # 拓扑排序
├── bubble.config.ts   # 冒泡排序
├── quick.config.ts    # 快速排序
├── merge.config.ts    # 归并排序
├── heap.config.ts     # 堆排序
├── linkedlist.config.ts # 链表操作
├── tree.config.ts     # 二叉树操作
└── hash.config.ts     # 哈希表
```

## 类型定义

类型声明文件位于 [`src/types/learning.d.ts`](../../types/learning.d.ts)，定义了以下核心接口：

### LearningStep

单个学习步骤的配置：

```typescript
interface LearningStep {
  id: string           // 步骤唯一标识，在同一算法内必须唯一，如 'init', 'compare'
  title: string        // 步骤标题，如 '初始化'
  description: string  // 步骤描述，说明该步骤在做什么
  codeSnippet: string  // 代码片段，展示相关代码
  highlightedLine: number  // 高亮行号（从 1 开始）
  highlightTerms: string[] // 高亮关键词，用于 UI 视觉强调
}
```

### LearningModeConfig

算法完整配置：

```typescript
interface LearningModeConfig {
  algorithmKey: string   // 算法标识，与 useLearningMode() 的参数对应
  steps: LearningStep[]  // 该算法的所有学习步骤
}
```

### 引用类型

**方式一：通过配置模块导入（推荐）**

```typescript
import type { LearningStep, LearningModeConfig } from '../configs/learning'
```

**方式二：通过类型声明文件导入**

```typescript
import type { LearningStep, LearningModeConfig } from '../types/learning'
```

两种方式是等价的。配置模块的 `types.ts` 实际是从 `src/types/learning.d.ts` 重新导出。

## 配置文件结构

每个算法的配置文件遵循统一结构：

```typescript
import type { LearningModeConfig } from './types'

export const xxxConfig: LearningModeConfig = {
  algorithmKey: 'xxx',
  steps: [
    {
      id: 'step-id',
      title: '步骤标题',
      description: '步骤详细说明',
      codeSnippet: `代码片段`,
      highlightedLine: 1,
      highlightTerms: ['关键词1', '关键词2'],
    },
    // ... 更多步骤
  ],
}
```

## 算法配置说明

### 图算法

| 文件 | algorithmKey | 学习内容 |
|------|-------------|----------|
| bfs.config.ts | `'bfs'` | 广度优先搜索：队列初始化、出队、访问节点、遍历邻居 |
| dfs.config.ts | `'dfs'` | 深度优先搜索：栈初始化、出栈、访问节点、遍历邻居 |
| dijkstra.config.ts | `'dijkstra'` | Dijkstra 算法：距离表初始化、选择最小距离节点、更新距离 |
| topoSort.config.ts | `'topoSort'` | 拓扑排序：入度计算、零入度队列、处理节点 |

### 排序算法

| 文件 | algorithmKey | 学习内容 |
|------|-------------|----------|
| bubble.config.ts | `'bubble'` | 冒泡排序：外层循环、比较相邻元素、交换元素、已排序区域 |
| quick.config.ts | `'quick'` | 快速排序：选择基准、分区操作、放置基准、递归排序 |
| merge.config.ts | `'merge'` | 归并排序：分割、递归调用、合并操作、复制剩余 |
| heap.config.ts | `'heap'` | 堆排序：建堆、堆化操作、提取堆顶、排序完成 |

### 数据结构

| 文件 | algorithmKey | 学习内容 |
|------|-------------|----------|
| linkedlist.config.ts | `'linkedlist'` | 链表结构、头插法、尾插法、删除节点 |
| tree.config.ts | `'tree'` | 二叉树结构、插入节点、遍历方式、查找节点 |
| hash.config.ts | `'hash'` | 哈希函数、插入键值对、冲突处理、查找操作 |

## 使用方式

### 在 Hook 中使用

```typescript
import { useLearningMode } from '../hooks/useLearningMode'

function MyComponent() {
  const { currentStep, nextStep, prevStep } = useLearningMode('bfs')
  // ...
}
```

### 导入所有配置

```typescript
import { learningConfigs } from '../configs/learning'

const bfsSteps = learningConfigs.bfs.steps
```

## 添加新算法

### 步骤 1：创建配置文件

在 `configs/learning/` 目录下新建 `xxx.config.ts`：

```typescript
import type { LearningModeConfig } from './types'

export const xxxConfig: LearningModeConfig = {
  algorithmKey: 'xxx',
  steps: [
    {
      id: 'step1',
      title: '第一步',
      description: '第一步的详细说明',
      codeSnippet: `function example() {
  // 代码
}`,
      highlightedLine: 1,
      highlightTerms: ['function', 'example'],
    },
  ],
}
```

**命名规范**：
- 文件名使用 camelCase，如 `bellmanFord.config.ts`
- 配置变量名使用 `xxxConfig` 格式，如 `bellmanFordConfig`
- `algorithmKey` 使用 camelCase，如 `'bellmanFord'`

### 步骤 2：注册到 index.ts

打开 `configs/learning/index.ts`，在 **两个位置** 添加代码：

**位置 A：import 区域**（第 1-11 行之间）

```typescript
import { xxxConfig } from './xxx.config'
```

**位置 B：learningConfigs 对象**（第 13-25 行之间）

```typescript
export const learningConfigs = {
  // ... 现有配置
  xxx: xxxConfig,
}
```

**注意**：`LearningConfigKey` 类型会自动从 `learningConfigs` 对象推导，无需手动修改。

### 步骤 3：在使用处调用

```typescript
const { currentStep } = useLearningMode('xxx')
```

**参数必须与 `algorithmKey` 完全一致**，否则配置查找会失败。

### 步骤 4：验证

1. 运行 `npm run lint` 确保代码风格正确
2. 运行 `npm run build` 确保 TypeScript 编译通过
3. 在对应页面中测试学习模式是否正常显示

---

## 完整示例：双向链表学习配置

以下是一个完整的双向链表（Doubly Linked List）学习配置示例，展示了如何从零开始配置一个新的算法学习模块。

### 1. 创建配置文件 `doublyLinkedList.config.ts`

```typescript
import type { LearningModeConfig } from './types'

export const doublyLinkedListConfig: LearningModeConfig = {
  algorithmKey: 'doublyLinkedList',
  steps: [
    {
      id: 'structure',
      title: '双向链表结构',
      description: '每个节点包含数据、指向前驱的 prev 指针和指向后继的 next 指针',
      codeSnippet: `class DoublyNode {
  constructor(value) {
    this.value = value
    this.prev = null   // 指向前一个节点
    this.next = null   // 指向后一个节点
  }
}`,
      highlightedLine: 4,
      highlightTerms: ['prev', 'next'],
    },
    {
      id: 'insert-head',
      title: '头插法',
      description: '新节点的 next 指向原头节点，原头节点的 prev 指向新节点，然后更新头指针',
      codeSnippet: `function insertHead(value) {
  const node = new DoublyNode(value)
  node.next = this.head
  if (this.head) {
    this.head.prev = node
  }
  this.head = node
}`,
      highlightedLine: 4,
      highlightTerms: ['this.head.prev', 'node'],
    },
    {
      id: 'insert-tail',
      title: '尾插法',
      description: '遍历到链表末尾，将新节点连接到尾部，并建立双向指针关系',
      codeSnippet: `function insertTail(value) {
  const node = new DoublyNode(value)
  let curr = this.head
  while (curr.next) {
    curr = curr.next
  }
  curr.next = node
  node.prev = curr
}`,
      highlightedLine: 6,
      highlightTerms: ['node.prev', 'curr'],
    },
    {
      id: 'delete',
      title: '删除节点',
      description: '找到目标节点，将其前驱的 next 指向后继，后继的 prev 指向前驱',
      codeSnippet: `function deleteNode(value) {
  let curr = this.head
  while (curr && curr.value !== value) {
    curr = curr.next
  }
  if (!curr) return
  if (curr.prev) curr.prev.next = curr.next
  if (curr.next) curr.next.prev = curr.prev
  if (curr === this.head) this.head = curr.next
}`,
      highlightedLine: 6,
      highlightTerms: ['curr.prev.next', 'curr.next.prev'],
    },
  ],
}
```

### 2. 注册到 index.ts

```typescript
// 在 import 区域添加
import { doublyLinkedListConfig } from './doublyLinkedList.config'

// 在 learningConfigs 对象中添加
export const learningConfigs = {
  // ... 现有配置
  doublyLinkedList: doublyLinkedListConfig,
}
```

### 3. 在页面中使用

```typescript
import { useLearningMode } from '../hooks/useLearningMode'

function DoublyLinkedListPage() {
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    nextStep,
    prevStep,
    reset,
  } = useLearningMode('doublyLinkedList')

  return (
    <div>
      <StepExplainer
        step={currentStep}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        progress={progress}
        onNext={nextStep}
        onPrev={prevStep}
        onReset={reset}
        isAnimating={false}
      />
    </div>
  )
}
```

### 预期效果

当用户进入双向链表页面并启动学习模式时：

1. **步骤 1**：显示 `DoublyNode` 类的定义，第 4 行（`this.prev = null`）高亮，关键词 `prev` 和 `next` 被强调
2. **步骤 2**：显示头插法代码，第 4 行（`this.head.prev = node`）高亮，展示如何建立前驱指针
3. **步骤 3**：显示尾插法代码，第 6 行（`node.prev = curr`）高亮，展示如何在尾部插入并维护双向链接
4. **步骤 4**：显示删除节点代码，第 6 行（`curr.prev.next = curr.next`）高亮，展示如何跳过目标节点并修复断裂的链接

用户可以通过"上一步"/"下一步"按钮逐步浏览每个步骤，进度条实时更新。

---

## 设计原则

1. **单一职责**：每个配置文件只包含一种算法的学习步骤
2. **类型安全**：使用 TypeScript 类型定义确保配置结构正确
3. **可维护性**：配置文件与业务逻辑分离，修改配置不影响 Hook 逻辑
4. **一致性**：所有配置文件遵循统一的结构和命名规范

## 注意事项

- `highlightedLine` 从 1 开始计数
- `highlightTerms` 用于 UI 高亮，不需要与代码完全匹配
- 代码片段使用模板字符串，注意转义反引号
- 确保每个步骤的 `id` 在同一算法内唯一
- `algorithmKey` 必须与 `useLearningMode()` 的调用参数完全一致
