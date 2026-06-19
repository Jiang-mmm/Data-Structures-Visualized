# 代码展示机制全结构覆盖设计

**日期**：2026-06-19
**状态**：已批准
**前置**：v11 Phase 5 已完成 array/linkedlist/doublyLinkedList 的代码展示机制

## 1. 背景与目标

v11 Phase 5 为 array、linkedlist、doublyLinkedList 三个结构实现了"查看代码"机制：操作日志携带 `codeStepId`，LogPanel 内联渲染按钮，点击跳转到学习面板对应步骤。

剩余 7 个结构（stack/queue/tree/hash/heap/trie/graph）尚未覆盖。本设计将此机制扩展到全部结构，并补全各结构学习配置中缺失的操作步骤，实现"用户操作任意结构都能查看代码"的目标。

## 2. 范围

### 2.1 Hook 层：补 codeStepId（7 个 hook，56 处 addLog）

| Hook | 操作函数 | codeStepId 值 |
|---|---|---|
| useStackState | push/pop/peek/clear | `push`/`pop`/`peek`/`clear` |
| useQueueState | enqueue/dequeue/front/clear | `enqueue`/`dequeue`/`front`/`clear` |
| useTreeState | insert/preorder/inorder/postorder/levelorder/search/deleteNode | `insert`/`preorder`/`inorder`/`postorder`/`levelorder`/`search`/`delete` |
| useHashState | insert/remove/search | `insert`/`remove`/`search` |
| useHeapState | insert/extractMax/peek | `insert`/`extract`/`peek` |
| useTrieState | insert/remove/search/searchPrefix | `insert`/`remove`/`search`/`prefix` |
| useGraphState | addNode/addEdge/deleteNode/deleteEdge/bfs/dfs/dijkstra | `add-node`/`add-edge`/`delete-node`/`delete-edge`/`bfs`/`dfs`/`dijkstra` |

**规则**：
- 仅 `oper` 和 `info` 类型日志补 codeStepId
- `error` 类型日志不补（错误无对应学习步骤）
- Tree/Hash/Heap/Trie 的 `code` 类型日志不补 codeStepId（`oper` 日志已携带，按钮渲染在 oper 行）

### 2.2 配置层：扩展缺失步骤（6 个配置）

| 配置 | 当前步数 | 新增步骤 | 目标步数 |
|---|---|---|---|
| stack.config | 4 | clear | 5 |
| queue.config | 4 | clear | 5 |
| tree.config | 4 | deleteNode、levelorder + 拆分 traversal 为 preorder/inorder/postorder/levelorder | 8 |
| hash.config | 4 | remove | 5 |
| heapStructure.config | 4 | 无缺失 | 4 |
| trie.config | 4 | remove | 5 |
| graph.config | 4 | deleteNode、deleteEdge、dijkstra + 拆分 traversal 为 bfs/dfs/dijkstra | 8 |

### 2.3 页面层：接 onJumpToStep 回调（7 个页面）

StackPage、QueuePage、TreePage、HashPage、HeapPage、TriePage、GraphPage 各添加 `handleJumpToStep` 回调并传给 LogPanel。

## 3. 树遍历拆分细节

当前 `tree.config.ts` 的 `traversal` 步骤（仅讲前/中/后序，遗漏层序）拆为 4 个独立步骤：

| step id | title | 描述要点 | 代码示例 |
|---|---|---|---|
| preorder | 前序遍历 | 根→左→右，先访问根节点 | 递归 `preorder(node.left); visit(node); preorder(node.right)` |
| inorder | 中序遍历 | 左→根→右，BST 中序遍历得到有序序列 | 递归 `inorder(node.left); visit(node); inorder(node.right)` |
| postorder | 后序遍历 | 左→右→根，先处理子树再访问根 | 递归 `postorder(node.left); postorder(node.right); visit(node)` |
| levelorder | 层序遍历 | 按层从上到下、从左到右，BFS + 队列辅助 | 迭代 `queue.push(root); while(queue) { node = queue.shift(); visit(node); push children }` |

tree.config 最终步骤序列：init, insert, preorder, inorder, postorder, levelorder, search, delete（共 8 步）

## 4. 图算法步骤设计

当前 `graph.config.ts` 的 `traversal` 步骤（合并提及 BFS/DFS）拆为 3 个独立步骤：

| step id | title | 描述要点 | 代码示例 |
|---|---|---|---|
| bfs | 广度优先搜索 | 队列辅助，逐层扩展，适合最短路径（无权图） | `queue.push(start); while(queue) { v = queue.shift(); visit(v); push unvisited neighbors }` |
| dfs | 深度优先搜索 | 栈/递归，深入到底再回溯，适合连通性判断 | `dfs(v) { visited.add(v); for(u of neighbors) if(!visited) dfs(u) }` |
| dijkstra | 最短路径 | 优先队列，贪心扩展，处理带权图最短路径 | `dist[start]=0; pq.push((0,start)); while(pq) { (d,v)=pq.pop(); relax edges }` |

graph.config 最终步骤序列：structure, add-node, add-edge, delete-node, delete-edge, bfs, dfs, dijkstra（共 8 步）

## 5. 数据流

```
用户操作 → hook.addLog('oper', msg, 'preorder')
         → LogEntry 携带 codeStepId
         → LogPanel 渲染"查看代码"按钮（当 codeStepId && onJumpToStep 均为真）
         → 用户点击 → onJumpToStep('preorder')
         → handleJumpToStep 查找 steps.findIndex(s => s.id === 'preorder')
         → setShowLearning(true) + learningMode.goToStep(idx)
         → StepExplainer 显示对应步骤的代码片段
```

## 6. 错误处理

- 错误日志（`addLog('error', ...)`）不传 codeStepId，按钮不渲染
- `codeStepId` 在配置中找不到匹配步骤时，`handleJumpToStep` 静默返回（idx < 0）
- Tree/Hash/Heap/Trie 的 `code` 类型日志不携带 codeStepId（按钮渲染在配对的 `oper` 行上）

## 7. 测试策略

- 更新 `useLearningMode.test.ts`：tree 步数 4→8、graph 步数 4→8
- 现有 hook 测试继续通过（addLog 第三参数可选，不影响断言）
- 新增步骤的 codeSnippet 格式验证（LearningStep 类型校验）
- 全量回归：3075+ 单元测试、ESLint、tsc、build

## 8. 影响分析

- **改了哪些模块**：7 个 hooks、6 个学习配置、7 个页面、1 个测试文件
- **是否影响 API/状态/数据流**：否，codeStepId 是可选参数，不影响数据结构状态或持久化
- **副作用**：无，纯增量修改，向后兼容

## 9. 不在范围内

- 不修改 StepExplainer 组件（已支持 goToStep）
- 不修改 LogPanel 组件（Phase 5 已实现 onJumpToStep）
- 不修改 useDataStructureState（LogEntry 已支持 codeStepId）
- 不新增独立 CodeRevealButton 组件（Phase 5 已决定内联渲染）
- 不扩展 heapStructure.config（已完整覆盖所有操作）
