# 数据结构学习助手 v11 深度优化实施计划

> **执行方式：** 按 Phase 顺序执行，每个 Phase 完成后验证再进入下一个。遵循项目规则：最小修改、不扩展需求、不猜测、不伪造结果。
>
> **核心原则：** `Correctness > Simplicity > Maintainability > Performance > Speed`

**目标：** 解决六大类问题——树/AVL 动画卡顿、Trie 视觉丑陋、排序界面拥挤、数组查找单一、学习内容缺失、代码展示机制缺失。

**技术栈：** React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + Vitest

---

## 一、问题诊断总结（基于代码审查）

### 1. 动画卡顿根因（树/AVL）
| 根因 | 文件:行 | 影响 |
|---|---|---|
| AVL 每次动画前全量重渲染 | `avlTreeVisualizer.ts:490,541,597` | 主线程阻塞，最严重 |
| 树/AVL 页面 1500ms 人为延迟 | `TreePage.tsx:75,98`、`AvlTreePage.tsx:82` | "动画开始"转圈数秒 |
| 每节点 2 次串行 await（图只有 1 次链式） | `treeVisualizer.ts:502-514`、`avlTreeVisualizer.ts:392-408` | 节点间微任务间隙卡顿 |
| 每节点 3 个 fire-and-forget 过渡累积 | `treeVisualizer.ts:518-521`、`avlTreeVisualizer.ts:516-518` | D3 过渡堆积 |
| 二叉树边匹配用正则 O(edges) | `treeVisualizer.ts:525-558` | 每节点额外开销 |
| `duration()` 从不传 dataLength，性能缩放失效 | 全部树可视化 | 大数据无法自动降速 |

### 2. Trie "丑球"根因
| 问题 | 文件:行 |
|---|---|
| 自定义径向渐变 + `lightenHex(color,40)` 高光 | `trieVisualizer.ts:199-211` |
| 每节点 drop shadow 滤镜 | `trieVisualizer.ts:215-229` |
| glow 光晕滤镜 | `trieVisualizer.ts:231-251` |
| 节点半径过大（26/30 vs 图的 20） | `trieVisualizer.ts:29-30` |
| 每节点最多 6 层装饰（环+光+圆+字+勾+前缀） | `trieVisualizer.ts:324-414` |
| 边标签用小圆圈包裹 | `trieVisualizer.ts:309-321` |

### 3. 排序界面问题
| 问题 | 文件:行 |
|---|---|
| SortPage 过滤器只显示 4 个算法（且引用不存在的 'counting'） | `SortPage.tsx:115` |
| 默认 15 个元素过多 | `useSortState.ts:8,40` |
| 缺少 counting sort 算法实现 | `algorithms/sorting/index.ts` |

### 4. 数组查找单一
- `useArrayState.ts:59` 用 `indexOf` 只返回首个匹配，O(n)
- 无 "查找全部" 功能
- 无二分查找（要求数组有序）

### 5. 学习内容缺失（链表为例）
| 钩子支持的操作 | 学习配置覆盖 |
|---|---|
| insertHead | ✓ |
| insertTail | ✓ |
| insertAt | ✗ 缺失 |
| deleteAt | ✗ 缺失（现有 delete 教的是按值删除，与钩子不符） |
| search | ✗ 缺失 |
| reverse | ✗ 缺失 |
| detectCycle | ✗ 缺失 |

其他结构同样缺失次要操作。无 "操作后查看代码" 机制。

---

## 二、实施阶段规划

### Phase 1: 动画性能优化（树/AVL）— 最高优先级

**目标：** 消除树/AVL 动画卡顿，达到与图可视化相当的流畅度。

**修改文件：**
- `src/visualizers/avlTreeVisualizer.ts`
- `src/visualizers/treeVisualizer.ts`
- `src/pages/TreePage.tsx`
- `src/pages/AvlTreePage.tsx`

**任务清单：**

#### 1.1 移除 AVL 动画前全量重渲染
- **位置：** `avlTreeVisualizer.ts:490`（animateInsertPath）、`:541`（animateSearchPath）、`:597`（animateTraversal）
- **修改：** 删除 `renderAvlTree(svg, data, {})` 调用，改为调用 `resetNodeAndEdgeColors`（与二叉树一致）
- **原因：** DOM 已由 Visualizer 组件渲染，动画应操作现有 DOM
- **验证：** AVL 插入/搜索/遍历动画立即开始，无卡顿

#### 1.2 移除树/AVL 页面 1500ms 人为延迟
- **位置：** `TreePage.tsx:75,98`、`AvlTreePage.tsx:82`
- **修改：** 移除 `delayStart(1500, ...)` 包装，直接调用动画函数（与 GraphPage 一致）
- **原因：** 图页面证明遍历无需延迟即可流畅
- **影响：** `AnimationDelayIndicator` 在树页面不再显示（可保留组件供其他用途）
- **验证：** 点击遍历按钮立即开始动画，无 "动画开始" 转圈

#### 1.3 链式过渡替代串行 await
- **位置：** `treeVisualizer.ts:502-514`（animateTraversal）、`:621-633`（animateLevelOrder）、`:663-677`（animateSearch）；`avlTreeVisualizer.ts:392-408`（pulseNode）
- **修改：** 将两阶段过渡（350ms grow + 300ms settle）改为 `transition().duration(350)...transition().duration(300)...` 链式，单次 `await transitionEnd(t)`
- **参考：** `graphVisualizer.ts:373-382`
- **验证：** 节点访问无 "hiccup" 间隙

#### 1.4 清理 fire-and-forget 过渡
- **位置：** `treeVisualizer.ts:518-521`、`avlTreeVisualizer.ts:516-518`
- **修改：** 对 `addRippleEffect`、`highlightEntryEdge`、`addVisitOrderLabel` 选择性处理：
  - `addRippleEffect`：保留但确保在节点访问结束前完成（缩短至 400ms）或移除
  - `highlightEntryEdge`：await 它（与图一致）
  - `addVisitOrderLabel`：保留 fire-and-forget（轻量）
- **验证：** 长遍历（15+ 节点）无过渡堆积

#### 1.5 修复二叉树边匹配正则开销
- **位置：** `treeVisualizer.ts:525-558`
- **修改：** 仿照 AVL（`avlTreeVisualizer.ts:435-447`），在 `renderTree` 创建边时加 class `tree-edge-from-${parentId}-to-${nodeId}`，`highlightEntryEdge` 用 class 选择器 O(1) 匹配
- **验证：** 边高亮正确，性能提升

#### 1.6 启用 duration() 数据长度缩放
- **位置：** `treeVisualizer.ts`、`avlTreeVisualizer.ts` 所有 `duration(xxx)` 调用
- **修改：** 传入 `data.length`：`duration(350, data.length)`
- **原因：** 让 `getPerformanceFactor` 在 15+/25+/40+ 节点时自动加速
- **验证：** 大树动画略快但流畅

**Phase 1 验证：**
- 单元测试：`npm run test:run`（现有树/AVL 测试全过）
- 手动测试：树 30 节点、AVL 20 节点遍历流畅
- 对比：与图遍历流畅度相当

---

### Phase 2: Trie 可视化重设计（混合方案）

**目标：** 移除 "丑球" 视觉，采用图配色 + Trie 专属形状（end-of-word 用胶囊形，内部节点用圆形，扁平色，直边）。

**修改文件：**
- `src/visualizers/trieVisualizer.ts`

**任务清单：**

#### 2.1 替换自定义渐变/滤镜为扁平色
- **位置：** `trieVisualizer.ts:178-252`（createGradientDefs）
- **修改：** 删除自定义径向渐变 + drop shadow + glow 滤镜，改用 `ensureGradientDefs`（来自 `themeColors.ts`，两 stop 同色，扁平外观）
- **参考：** `graphVisualizer.ts` 使用 `ensureGradientDefs`
- **验证：** 节点无 3D 球体感

#### 2.2 节点形状区分（胶囊 vs 圆形）
- **位置：** `trieVisualizer.ts:324-414`（节点渲染）
- **修改：**
  - 内部节点：圆形，半径 20（与图一致）
  - end-of-word 节点：胶囊形（rect with rx），宽 44 高 36，扁平填充
  - 根节点：圆形，半径 22，加粗边框
- **原因：** 形状本身传达语义（是否单词结尾），无需装饰环+勾
- **验证：** 视觉清晰，形状区分明显

#### 2.3 简化边与标签
- **位置：** `trieVisualizer.ts:282-322`
- **修改：**
  - 边：保留贝塞尔曲线（树层级需要曲线），但移除 `vector-effect` 不必要的复杂度
  - 边标签：移除小圆圈包裹，改为纯文本（11px，与图一致），背景用 `paint-order: stroke` 描边法保证可读性
- **验证：** 边标签清晰可读

#### 2.4 移除冗余装饰
- **位置：** `trieVisualizer.ts:360-369`（虚线环）、`:401-407`（勾号）、`:409-413`（前缀标签）
- **修改：**
  - 移除虚线环（胶囊形已表示 end-of-word）
  - 移除勾号（冗余）
  - 前缀标签：保留但改为节点下方小字（10px，灰色），仅 hover 显示
- **验证：** 节点干净，无视觉杂乱

#### 2.5 调整布局间距
- **位置：** `trieVisualizer.ts:31-36`
- **修改：** `NODE_RADIUS=20`、`ROOT_RADIUS=22`、`LEVEL_HEIGHT=80`（原 90）、`MIN_NODE_SPACING=60`（原 72）
- **验证：** 紧凑但不拥挤

**Phase 2 验证：**
- 单元测试：`src/__tests__/visualizers/trieVisualizer.test.ts` 全过
- 快照测试：视觉一致性
- 手动测试：插入/搜索/前缀动画流畅，视觉与图模块协调

---

### Phase 3: 排序界面改进

**目标：** 显示全部 12 个算法，默认 8 个元素，添加 counting sort，优化布局。

**修改文件：**
- `src/pages/SortPage.tsx`
- `src/hooks/useSortState.ts`
- `src/algorithms/sorting/index.ts`
- `src/configs/learning/counting.config.ts`（新建）
- `src/configs/learning/index.ts`
- `src/visualizers/sortVisualizer.ts`
- `src/i18n/locales.ts`

**任务清单：**

#### 3.1 修复 SortPage 算法过滤器
- **位置：** `SortPage.tsx:115`
- **修改：** 移除 `['selection','insertion','counting','shell']` 过滤，显示全部注册算法
- **验证：** 12 个算法按钮全部可见

#### 3.2 添加 counting sort 算法
- **位置：** `src/algorithms/sorting/index.ts`
- **修改：** 实现 counting sort，注册为 `counting`
- **算法：** 找 max → 建 count 数组 → 累加 → 反向填充
- **复杂度：** O(n+k)，稳定排序
- **验证：** `newSortAlgorithms.test.ts` 加测试用例

#### 3.3 减少默认元素数量
- **位置：** `useSortState.ts:8`（INITIAL_DATA）、`:40`（randomize）
- **修改：** 默认 8 个元素：`[38, 27, 43, 3, 9, 82, 10, 55]`；randomize 用 `Array.from({ length: 8 }, ...)`
- **验证：** 初始显示 8 个柱子

#### 3.4 优化柱状图布局
- **位置：** `sortVisualizer.ts:23-33`（getLayout）
- **修改：**
  - `barWidth` 上限从 30 提到 48（元素少时柱子更大）
  - `BAR_GAP_RATIO` 从 0.35 调到 0.25（间距更紧凑）
  - 字体：8 元素时用 13px（原 11px）
- **验证：** 8 个柱子视觉清晰，不拥挤

#### 3.5 添加 counting sort 学习配置
- **位置：** 新建 `src/configs/learning/counting.config.ts`
- **修改：** 4 步：init（找 max）、count（计数）、accumulate（累加）、place（反向填充）
- **注册：** `src/configs/learning/index.ts` 加 import + 注册
- **验证：** `newLearningConfigs.test.ts` 全过

#### 3.6 添加 i18n 文案
- **位置：** `src/i18n/locales.ts`
- **修改：** 添加 counting sort 名称（中：计数排序，英：Counting Sort）及描述
- **验证：** UI 显示正确

**Phase 3 验证：**
- 单元测试：`sorting.test.ts`、`newSortAlgorithms.test.ts`、`newLearningConfigs.test.ts` 全过
- 手动测试：12 算法可切换，8 元素清晰

---

### Phase 4: 数组查找增强

**目标：** 添加 "查找全部" 和 "二分查找" 两个操作。

**修改文件：**
- `src/hooks/useArrayState.ts`
- `src/visualizers/arrayVisualizer.ts`
- `src/pages/ArrayPage.tsx`
- `src/i18n/locales.ts`
- `src/__tests__/useArrayState.test.ts`
- `src/__tests__/visualizers/arrayVisualizer.test.ts`

**任务清单：**

#### 4.1 添加 searchAll 操作
- **位置：** `useArrayState.ts`（search 函数后）
- **修改：** 新增 `searchAll(value: number): number[]`，用循环收集所有匹配索引
- **日志：** "找到 N 个匹配：[i1, i2, ...]"
- **验证：** 单元测试覆盖重复值场景

#### 4.2 添加 binarySearch 操作
- **位置：** `useArrayState.ts`
- **修改：** 新增 `binarySearch(value: number): number`
- **前置：** 检查数组是否有序，无序则提示 "请先排序"
- **算法：** 标准 O(log n) 二分
- **验证：** 单元测试覆盖有序/无序场景

#### 4.3 可视化器动画
- **位置：** `arrayVisualizer.ts`
- **修改：**
  - `animateSearchAll(svg, indices, data, ...)`：依次高亮所有匹配，不同颜色
  - `animateBinarySearch(svg, index, data, ...)`：显示 left/right/mid 指针，逐步收缩
- **验证：** 动画清晰展示算法过程

#### 4.4 页面 UI 集成
- **位置：** `ArrayPage.tsx`
- **修改：** 添加 "查找全部" 和 "二分查找" 按钮
- **验证：** 按钮可用，动画正确

#### 4.5 i18n 文案
- **位置：** `locales.ts`
- **修改：** 添加相关文案
- **验证：** 中英文显示正确

**Phase 4 验证：**
- 单元测试：新增测试全过
- 手动测试：查找全部高亮所有匹配，二分查找显示指针

---

### Phase 5: 学习内容扩展 + 代码展示机制

**目标：** 补全所有数据结构的学习步骤；添加 "操作后查看代码" 内联按钮。

**修改文件：**
- `src/configs/learning/linkedlist.config.ts`
- `src/configs/learning/doublyLinkedList.config.ts`
- `src/configs/learning/tree.config.ts`
- `src/configs/learning/trie.config.ts`
- `src/configs/learning/hash.config.ts`
- `src/configs/learning/heapStructure.config.ts`
- `src/configs/learning/array.config.ts`
- `src/configs/learning/stack.config.ts`
- `src/configs/learning/queue.config.ts`
- `src/configs/learning/graph.config.ts`
- 新建 `src/components/CodeRevealButton.tsx`
- 各页面集成按钮

**任务清单：**

#### 5.1 链表学习配置补全
- **位置：** `linkedlist.config.ts`
- **修改：** 新增 5 步：search、insertAt、deleteAt（替换现有按值 delete）、reverse、detectCycle（Floyd 龟兔）
- **每步包含：** id、title、description、codeSnippet、highlightedLine、highlightTerms、tips、complexity
- **验证：** `useLearningMode.test.ts` 全过

#### 5.2 双向链表学习配置补全
- **位置：** `doublyLinkedList.config.ts`
- **修改：** 同 5.1，代码示例体现双向指针操作
- **验证：** 测试全过

#### 5.3 其他结构补全（按缺失矩阵）
| 结构 | 缺失操作 |
|---|---|
| tree | delete、min/max、level-order、height |
| trie | delete、autocomplete |
| hash | delete、resize/rehash |
| heapStructure | delete-arbitrary、build-heap |
| array | update、traverse、binary search |
| stack | isEmpty、size、clear |
| queue | isEmpty、size、circular-queue |
| graph | remove node/edge、weight edit |

- **每步：** 遵循 `LearningStep` 类型，含完整代码示例
- **验证：** 所有学习配置测试全过

#### 5.4 新建 CodeRevealButton 组件
- **位置：** `src/components/CodeRevealButton.tsx`
- **功能：**
  - 接收 `operationKey` 和 `algorithmKey` props
  - 渲染 "查看代码" 按钮（小尺寸，图标 + 文字）
  - 点击后调用回调，打开 StepExplainer 面板并跳转到对应步骤
- **样式：** Neo-Brutalist 风格，与现有按钮一致
- **验证：** 组件单元测试

#### 5.5 页面集成 CodeRevealButton
- **位置：** 各数据结构页面（ArrayPage、LinkedListPage 等）
- **修改：** 在操作日志区域，每次操作完成后显示 "查看代码" 按钮
- **交互：** 点击 → 打开 LearningModeToggle 面板 → goToStep 到对应操作
- **验证：** E2E 测试覆盖

#### 5.6 扩展 useLearningMode 支持操作跳转
- **位置：** `src/hooks/useLearningMode.ts`
- **修改：** 新增 `goToOperationStep(operationId: string)` 方法，按 step.id 查找并跳转
- **验证：** 单元测试

**Phase 5 验证：**
- 单元测试：所有学习配置 + CodeRevealButton 测试全过
- 手动测试：操作后点 "查看代码" 跳转到对应步骤

---

### Phase 6: 全量测试与验证

**任务清单：**

#### 6.1 单元测试
- 运行 `npm run test:run`
- 修复任何因修改导致的失败
- 新增测试覆盖：searchAll、binarySearch、counting sort、CodeRevealButton、新学习步骤

#### 6.2 ESLint + TypeScript
- `npm run lint`
- `npx tsc --noEmit`
- 0 errors, 0 warnings

#### 6.3 生产构建
- `npm run build`
- `node scripts/check-bundle.js`（预算检查）

#### 6.4 E2E 测试
- 启动 dev server：`npm run dev`
- `node e2e/run-all-tests.js`
- `node e2e/test-a11y.js`
- 全部通过

#### 6.5 手动验证
- 树/AVL 动画流畅度对比图模块
- Trie 视觉与图模块协调
- 排序 12 算法切换、8 元素清晰
- 数组查找全部 + 二分查找
- 各结构操作后 "查看代码" 可用

---

### Phase 7: 文档更新与部署

**任务清单：**

#### 7.1 更新文档
- `PROJECT_SUMMARY.md`：新增 v11 优化内容
- `WORKLOG.md`：记录本次工作日志
- `README.md`：更新功能列表（新增 counting sort、查找全部、二分查找）
- `ARCHITECTURE.md`：更新动画性能优化说明、CodeRevealButton 组件
- `CODE_WIKI.md`：新增组件/函数条目
- `TODO.md`：标记完成项，更新下一步候选
- `docs/iteration-plan-v11.md`：本计划文档（标记完成状态）

#### 7.2 Git 提交
- 分阶段提交（每 Phase 一个 commit）或整体提交
- 遵循 conventional commit 规范
- **仅在全部验证通过后提交**

#### 7.3 部署
- 推送到 `origin/main`
- 触发 GitHub Actions CI/Deploy 工作流
- 验证 GitHub Pages 部署成功

---

## 三、影响分析（Blast Radius）

| Phase | 影响模块 | 副作用风险 |
|---|---|---|
| 1 | 树/AVL 可视化器、页面 | 低：仅改动画时序，不改数据流 |
| 2 | Trie 可视化器 | 低：仅改渲染，不改逻辑 |
| 3 | 排序页面、钩子、算法、学习配置 | 中：新增算法需确保注册正确 |
| 4 | 数组钩子、可视化器、页面 | 低：新增操作，不改现有 |
| 5 | 学习配置、新组件、各页面 | 中：涉及多页面集成 |
| 6 | 无（仅测试） | 无 |
| 7 | 文档 | 无 |

---

## 四、资源分配与优先级

| Phase | 优先级 | 预估工作量 | 依赖 |
|---|---|---|---|
| 1 动画性能 | P0 最高 | 中 | 无 |
| 2 Trie 重设计 | P1 高 | 中 | 无 |
| 3 排序改进 | P1 高 | 中 | 无 |
| 4 数组查找 | P2 中 | 低 | 无 |
| 5 学习内容 | P1 高 | 高 | 无（可与 1-4 并行规划） |
| 6 测试验证 | P0 必须 | 中 | 依赖 1-5 完成 |
| 7 文档部署 | P0 必须 | 低 | 依赖 6 通过 |

---

## 五、风险与缓解

| 风险 | 缓解措施 |
|---|---|
| AVL 移除重渲染后动画错位 | 保留 `resetNodeAndEdgeColors`，确保 DOM 已存在 |
| Trie 形状改变影响测试 | 更新快照测试，调整测试选择器 |
| counting sort 边界（负数、大数） | 限制输入范围 0-99，与现有验证一致 |
| 学习内容工作量大 | 按结构优先级分批，链表/树/trie 优先 |
| CodeRevealButton 多页面集成 | 先在一个页面验证模式，再推广 |

---

## 六、验证标准（Definition of Done）

- [ ] 树/AVL 动画无卡顿，与图模块流畅度相当
- [ ] Trie 视觉扁平干净，形状区分语义
- [ ] 排序显示 12 算法，默认 8 元素，布局清晰
- [ ] 数组支持查找全部 + 二分查找
- [ ] 所有数据结构学习配置覆盖全部操作
- [ ] 操作后可点 "查看代码" 跳转学习步骤
- [ ] 单元测试全过（3042+ 新增）
- [ ] ESLint 0 errors
- [ ] 生产构建成功
- [ ] E2E + A11y 测试全过
- [ ] 文档更新
- [ ] Git 提交并部署

---

**计划状态：Phase 1-5 已完成，Phase 6 验证通过，Phase 7 进行中**

## 完成情况汇总

### Phase 1-4（前序会话已完成）
- Phase 1: 树/AVL 动画性能优化 — 完成
- Phase 2: Trie 可视化重设计（混合方案）— 完成
- Phase 3: 排序界面改进（12 算法 + counting sort + 默认 8 元素）— 完成
- Phase 4: 数组查找增强（searchAll + binarySearch）— 完成

### Phase 5: 学习内容扩展 + 代码展示机制（已完成）
**实际实现方案（优化调整）：**
- 未新建独立 `CodeRevealButton` 组件，改为在 `LogPanel` 内联渲染 "查看代码" 按钮（更简洁，复用现有日志流）
- `LogEntry` 类型扩展 `codeStepId?: string` 字段，`addLog` 支持第三参数
- `useArrayState` / `useLinkedListState` 所有操作日志携带 `codeStepId`
- `ArrayPage` / `LinkedListPage` 通过 `onJumpToStep` 回调打开学习面板并跳转对应步骤
- 链表学习配置从 4 步扩展到 8 步（新增 insert-at、search、reverse、detect-cycle）
- 双向链表学习配置从 4 步扩展到 8 步（同上，代码示例适配双向指针）

### Phase 5.5: 代码展示机制全结构覆盖（已完成）
**扩展到剩余 7 个结构：**
- Hook 层：stack/queue/tree/hash/heap/trie/graph 共 56 处 addLog 补 codeStepId
- 配置层扩展：
  - stack +clear（5 步）
  - queue +clear（5 步）
  - tree 拆分 traversal 为 preorder/inorder/postorder/levelorder 4 步 + 新增 delete（9 步）
  - hash +remove（5 步）
  - trie +remove（5 步）
  - graph 拆分 traversal 为 bfs/dfs/dijkstra 3 步 + 新增 delete-node/delete-edge（8 步）
- 页面层：7 个页面接 handleJumpToStep 回调
- **全结构覆盖完成**：用户操作任意数据结构都能"查看代码"

### Phase 5.6: 统一信息面板 InfoPanel（已完成）
**移除 LogPanel + LearningModeToggle，新建统一 InfoPanel：**
- 新建 `src/components/InfoPanel.tsx`：右侧常驻面板（桌面端 w-96，移动端底部抽屉）
- 含两个 tab：操作日志 | 学习模式，视觉风格采用 StepExplainer 设计语言（白色卡片 + Neo-Brutalist 硬阴影）
- 重构 `LogPanel.tsx` 支持 `variant="embedded"` 模式：卡片化时间线替代深色反色背景
- 自动跳转机制：最新日志携带 codeStepId 时自动切换到学习模式 tab 并 goToStep
- 13 个页面布局重构：垂直堆叠改为左右分栏（`flex-col lg:flex-row`）
- GraphAlgorithmPage：ComplexityChart 移至左侧，右侧 InfoPanel
- SortComparePage：添加 learningMode，InfoPanel 替代底部 LogPanel
- 新增 i18n `infoPanel` 翻译命名空间（中英文）
- 新增 InfoPanel 测试（9 个）+ LogPanel embedded 模式测试（5 个）
- **验证**：3089 测试通过、ESLint 0 errors、tsc 0 errors、build 成功、bundle 预算通过

### Phase 6: 全量验证（已通过）
- 单元测试：3089/3089 通过
- ESLint：0 errors, 0 warnings
- TypeScript：0 errors
- 生产构建：成功（bundle 预算通过）

### Phase 7: 文档与部署（进行中）

---

请审阅本计划。如有调整意见请指出；如批准，我将按 Phase 1 → 7 顺序执行，每个 Phase 完成后汇报验证结果。
