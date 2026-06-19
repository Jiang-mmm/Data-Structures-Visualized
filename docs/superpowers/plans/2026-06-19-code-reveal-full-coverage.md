# 代码展示机制全结构覆盖实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将"查看代码"机制从 array/linkedlist/doublyLinkedList 扩展到全部 7 个剩余结构（stack/queue/tree/hash/heap/trie/graph），并补全各结构学习配置中缺失的操作步骤。

**Architecture:** 复用 Phase 5 三层架构：Hook 层 addLog 第三参数 codeStepId、配置层扩展缺失步骤、页面层 handleJumpToStep 回调。纯增量修改，向后兼容。

**Tech Stack:** React 19 + TypeScript 5.8 + Vitest

**设计文档:** `docs/superpowers/specs/2026-06-19-code-reveal-full-coverage-design.md`

---

## 文件结构

### Hook 层（7 个文件修改）
- `src/hooks/useStackState.ts` — push/pop/peek/clear 补 codeStepId
- `src/hooks/useQueueState.ts` — enqueue/dequeue/front/clear 补 codeStepId
- `src/hooks/useTreeState.ts` — 7 个操作补 codeStepId
- `src/hooks/useHashState.ts` — insert/remove/search 补 codeStepId
- `src/hooks/useHeapState.ts` — insert/extractMax/peek 补 codeStepId
- `src/hooks/useTrieState.ts` — insert/remove/search/searchPrefix 补 codeStepId
- `src/hooks/useGraphState.ts` — 7 个操作补 codeStepId

### 配置层（6 个文件修改）
- `src/configs/learning/stack.config.ts` — 新增 clear 步骤
- `src/configs/learning/queue.config.ts` — 新增 clear 步骤
- `src/configs/learning/tree.config.ts` — 拆分 traversal 为 4 步 + 新增 delete
- `src/configs/learning/hash.config.ts` — 新增 remove 步骤
- `src/configs/learning/trie.config.ts` — 新增 remove 步骤
- `src/configs/learning/graph.config.ts` — 拆分 traversal 为 3 步 + 新增 delete-node/delete-edge

### 页面层（7 个文件修改）
- `src/pages/StackPage.tsx` — handleJumpToStep + LogPanel onJumpToStep
- `src/pages/QueuePage.tsx` — 同上
- `src/pages/TreePage.tsx` — 同上
- `src/pages/HashPage.tsx` — 同上
- `src/pages/HeapPage.tsx` — 同上
- `src/pages/TriePage.tsx` — 同上
- `src/pages/GraphPage.tsx` — 同上

### 测试（1 个文件修改）
- `src/__tests__/useLearningMode.test.ts` — tree 步数 4→8、graph 步数 4→8

---

## Task 1: Stack — Hook + 配置 + 页面

**Files:**
- Modify: `src/hooks/useStackState.ts`
- Modify: `src/configs/learning/stack.config.ts`
- Modify: `src/pages/StackPage.tsx`

- [ ] **Step 1: useStackState.ts 补 codeStepId**

为 push/pop/peek/clear 的 `addLog('oper', ...)` 调用添加第三参数：
- push → `'push'`
- pop → `'pop'`
- peek → `'peek'`
- clear → `'clear'`

- [ ] **Step 2: stack.config.ts 新增 clear 步骤**

在 steps 数组末尾添加：
```ts
{
  id: 'clear',
  title: '清空栈 Clear',
  description: '将栈中所有元素移除，栈顶指针重置为 -1。时间复杂度 O(1) 或 O(n)（取决于实现）。',
  codeSnippet: `function clear(stack) {
  stack.top = -1;
  // 或 stack.data = [];
}`,
  highlightedLine: 2,
  highlightTerms: ['top', 'clear'],
  tips: ['清空后栈为空，再次 pop/peek 会报下溢错误', '实际实现中可复用数组只需重置指针'],
  complexity: 'O(1) 或 O(n)'
}
```

- [ ] **Step 3: StackPage.tsx 接 onJumpToStep**

添加 handleJumpToStep 回调（参考 ArrayPage 模式），传给 LogPanel。

- [ ] **Step 4: 验证**

运行 `npx vitest run src/__tests__/useStackState.test.ts src/__tests__/useLearningMode.test.ts`，确认通过。

---

## Task 2: Queue — Hook + 配置 + 页面

**Files:**
- Modify: `src/hooks/useQueueState.ts`
- Modify: `src/configs/learning/queue.config.ts`
- Modify: `src/pages/QueuePage.tsx`

- [ ] **Step 1: useQueueState.ts 补 codeStepId**

为 enqueue/dequeue/front/clear 添加第三参数：`'enqueue'`/`'dequeue'`/`'front'`/`'clear'`

- [ ] **Step 2: queue.config.ts 新增 clear 步骤**

```ts
{
  id: 'clear',
  title: '清空队列 Clear',
  description: '移除队列中所有元素，front 和 rear 指针重置。时间复杂度 O(1) 或 O(n)。',
  codeSnippet: `function clear(queue) {
  queue.front = 0;
  queue.rear = 0;
  // 或 queue.data = [];
}`,
  highlightedLine: 3,
  highlightTerms: ['front', 'rear', 'clear'],
  tips: ['清空后队列为空', '循环队列实现中需重置 front=rear=0'],
  complexity: 'O(1) 或 O(n)'
}
```

- [ ] **Step 3: QueuePage.tsx 接 onJumpToStep**

- [ ] **Step 4: 验证** — 运行 queue 相关测试

---

## Task 3: Tree — Hook + 配置拆分 + 页面

**Files:**
- Modify: `src/hooks/useTreeState.ts`
- Modify: `src/configs/learning/tree.config.ts`
- Modify: `src/pages/TreePage.tsx`

- [ ] **Step 1: useTreeState.ts 补 codeStepId**

为 7 个操作的 `oper` 日志添加第三参数：
- insert → `'insert'`
- preorder → `'preorder'`
- inorder → `'inorder'`
- postorder → `'postorder'`
- levelorder → `'levelorder'`
- search（找到/未找到）→ `'search'`
- deleteNode（删除成功）→ `'delete'`

注意：`code` 类型日志不补 codeStepId。

- [ ] **Step 2: tree.config.ts 拆分 traversal + 新增 delete**

将现有 `traversal` 步骤替换为 4 个独立步骤（preorder/inorder/postorder/levelorder），并在末尾新增 `delete` 步骤。

最终步骤序列（8 步）：init, insert, preorder, inorder, postorder, levelorder, search, delete

各步骤代码示例：
- preorder: 递归 `preorder(node.left); visit(node); preorder(node.right)` — 根→左→右
- inorder: 递归 `inorder(node.left); visit(node); inorder(node.right)` — 左→根→右，BST 有序
- postorder: 递归 `postorder(node.left); postorder(node.right); visit(node)` — 左→右→根
- levelorder: 迭代 `queue.push(root); while(queue) { node = queue.shift(); visit(node); push children }` — BFS
- delete: 三种情况（叶子/单子/双子），双子用后继节点替换

- [ ] **Step 3: TreePage.tsx 接 onJumpToStep**

- [ ] **Step 4: 更新 useLearningMode.test.ts**

tree 步数断言 4 → 8

- [ ] **Step 5: 验证** — 运行 tree 相关测试

---

## Task 4: Hash — Hook + 配置 + 页面

**Files:**
- Modify: `src/hooks/useHashState.ts`
- Modify: `src/configs/learning/hash.config.ts`
- Modify: `src/pages/HashPage.tsx`

- [ ] **Step 1: useHashState.ts 补 codeStepId**

- insert（更新已存在/新增成功）→ `'insert'`
- remove（未找到/删除成功）→ `'remove'`
- search（找到/未找到）→ `'search'`

- [ ] **Step 2: hash.config.ts 新增 remove 步骤**

```ts
{
  id: 'remove',
  title: '删除键值对 Remove',
  description: '根据 key 计算哈希定位桶，在桶内查找并删除对应键值对。链地址法需处理链表节点删除。',
  codeSnippet: `function remove(hashTable, key) {
  const idx = hash(key);
  const bucket = hashTable[idx];
  const i = bucket.findIndex(e => e.key === key);
  if (i === -1) return false;
  bucket.splice(i, 1);
  return true;
}`,
  highlightedLine: 5,
  highlightTerms: ['hash', 'splice', 'remove'],
  tips: ['删除前需检查 key 是否存在', '链地址法删除链表节点需维护前驱指针'],
  complexity: '平均 O(1)，最坏 O(n)'
}
```

- [ ] **Step 3: HashPage.tsx 接 onJumpToStep**

- [ ] **Step 4: 验证** — 运行 hash 相关测试

---

## Task 5: Heap — Hook + 页面（配置无缺失）

**Files:**
- Modify: `src/hooks/useHeapState.ts`
- Modify: `src/pages/HeapPage.tsx`

- [ ] **Step 1: useHeapState.ts 补 codeStepId**

- insert → `'insert'`
- extractMax → `'extract'`
- peek → `'peek'`

- [ ] **Step 2: HeapPage.tsx 接 onJumpToStep**

- [ ] **Step 3: 验证** — 运行 heap 相关测试

---

## Task 6: Trie — Hook + 配置 + 页面

**Files:**
- Modify: `src/hooks/useTrieState.ts`
- Modify: `src/configs/learning/trie.config.ts`
- Modify: `src/pages/TriePage.tsx`

- [ ] **Step 1: useTrieState.ts 补 codeStepId**

- insert → `'insert'`
- remove → `'remove'`
- search（找到/未找到）→ `'search'`
- searchPrefix（找到/未找到）→ `'prefix'`

- [ ] **Step 2: trie.config.ts 新增 remove 步骤**

```ts
{
  id: 'remove',
  title: '删除单词 Remove',
  description: '递归查找单词路径，从叶子向上回溯删除节点。仅删除不影响其他单词的节点，保留共享前缀。',
  codeSnippet: `function remove(node, word, depth = 0) {
  if (depth === word.length) {
    node.isEnd = false;
  } else {
    const child = node.children[word[depth]];
    if (!child) return;
    remove(child, word, depth + 1);
    if (Object.keys(child.children).length === 0 && !child.isEnd) {
      delete node.children[word[depth]];
    }
  }
}`,
  highlightedLine: 9,
  highlightTerms: ['isEnd', 'delete', 'remove'],
  tips: ['删除前需确认单词存在', '共享前缀节点不能删除', '仅将 isEnd 置 false 即可"软删除"'],
  complexity: 'O(L)，L 为单词长度'
}
```

- [ ] **Step 3: TriePage.tsx 接 onJumpToStep**

- [ ] **Step 4: 验证** — 运行 trie 相关测试

---

## Task 7: Graph — Hook + 配置拆分 + 页面

**Files:**
- Modify: `src/hooks/useGraphState.ts`
- Modify: `src/configs/learning/graph.config.ts`
- Modify: `src/pages/GraphPage.tsx`

- [ ] **Step 1: useGraphState.ts 补 codeStepId**

- addNode → `'add-node'`
- addEdge → `'add-edge'`
- deleteNode → `'delete-node'`
- deleteEdge → `'delete-edge'`
- bfs → `'bfs'`
- dfs → `'dfs'`
- dijkstra → `'dijkstra'`

- [ ] **Step 2: graph.config.ts 拆分 traversal + 新增 delete 步骤**

将现有 `traversal` 步骤替换为 3 个独立步骤（bfs/dfs/dijkstra），并新增 delete-node、delete-edge 步骤。

最终步骤序列（8 步）：structure, add-node, add-edge, delete-node, delete-edge, bfs, dfs, dijkstra

各步骤代码示例：
- delete-node: 删除节点及其所有关联边
- delete-edge: 删除指定边（无向图需删双向）
- bfs: 队列辅助，`queue.push(start); while(queue) { v = queue.shift(); visit(v); push unvisited neighbors }`
- dfs: 递归，`dfs(v) { visited.add(v); for(u of neighbors) if(!visited) dfs(u) }`
- dijkstra: 优先队列，`dist[start]=0; pq.push((0,start)); while(pq) { (d,v)=pq.pop(); relax edges }`

- [ ] **Step 3: GraphPage.tsx 接 onJumpToStep**

- [ ] **Step 4: 更新 useLearningMode.test.ts**

graph 步数断言 4 → 8

- [ ] **Step 5: 验证** — 运行 graph 相关测试

---

## Task 8: 全量验证 + 提交

- [ ] **Step 1: 全量单元测试**

运行 `npm run test:run`，确认 3075+ 测试全过。

- [ ] **Step 2: ESLint + TypeScript**

运行 `npm run lint` 和 `npx tsc --noEmit`，确认 0 errors。

- [ ] **Step 3: 生产构建**

运行 `npm run build`，确认成功。

- [ ] **Step 4: Git 提交**

```bash
git add src/ docs/
git commit -m "feat: 代码展示机制全结构覆盖 - 7 个结构补 codeStepId + 学习配置扩展"
```

- [ ] **Step 5: 更新项目文档**

更新 `docs/iteration-plan-v11.md` 和项目 memory。
