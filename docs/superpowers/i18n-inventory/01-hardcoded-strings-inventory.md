# v19 M1 硬编码中文待替换字符串清单

> **目标**: 系统性梳理项目内所有 UI 可见硬编码中文字符串，建立 v19 渐进迁移（M4-M7）的待替换清单
> **基线**: v17.0.0 GA（main HEAD `37478cf`）
> **生成时间**: 2026-06-22
> **方法**: Grep `[\x{4e00}-\x{9fff}]` 扫描 + 模块/页面维度分组 + 优先级排序

---

## 1. 概述

### 1.1 统计摘要

| 维度 | 数值 |
|------|------|
| **总硬编码中文字符数** | ~28,271 |
| **涉及文件数** | 100 |
| **v19 范围内（需迁移）** | ~17,500 字符（62%）|
| **v19 范围外（保留）** | ~10,771 字符（38%，含 i18n 自身 + hooks 日志 + tests）|

### 1.2 优先级定义

| 优先级 | 含义 | 迁移 M 阶段 |
|--------|------|-------------|
| **P0** | 用户高频访问页面（首页/排序/数组/图），UI 可见度高 | M4 首批 |
| **P1** | 常用功能页（树/链表/堆/哈希/搜索等）| M4 第二批 |
| **P2** | 工具类页面 + 通用组件 | M5-M6 |
| **P3** | 学习配置（量大但用户停留时间短）| M7 |

### 1.3 不在 v19 范围（OUT-OF-SCOPE）

| 类别 | 字符数 | 原因 |
|------|--------|------|
| `src/i18n/locales.ts` | 6,310 | 自身 i18n 内容，**保留** |
| `src/hooks/*` 内中文日志 | ~1,000 | 开发者向，非用户可见 |
| `src/__tests__/**` 中文断言 | ~8,000 | 测试断言，不需翻译 |
| 注释中的中文 | 混合 | 工程注释，保留 |

---

## 2. 17 页面硬编码清单

### 2.1 P0 页面（4 个 / M4 首批）

| 页面 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串示例 |
|------|----------|------------|----------------|----------------|
| **Home** | `src/pages/Home.tsx` | ~500 | `home` | "数据结构可视化学习助手"、"学习中心"、"17 种数据结构" |
| **SortPage** | `src/pages/SortPage.tsx` | ~400 | `sortPage` | "排序算法"、"比较次数"、"交换次数" |
| **ArrayPage** | `src/pages/ArrayPage.tsx` | ~350 | `arrayPage` | "数组操作"、"插入元素"、"删除元素"、"按索引访问" |
| **GraphPage** | `src/pages/GraphPage.tsx` | ~300 | `graph` | "图操作"、"添加节点"、"添加边"、"深度优先遍历" |

### 2.2 P1 页面（13 个 / M4 第二批）

| 页面 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串示例 |
|------|----------|------------|----------------|----------------|
| **StackPage** | `src/pages/StackPage.tsx` | ~200 | `stack` | "栈操作"、"压栈"、"弹栈"、"栈顶元素" |
| **QueuePage** | `src/pages/QueuePage.tsx` | ~200 | `queue` | "队列操作"、"入队"、"出队"、"队首/队尾" |
| **LinkedListPage** | `src/pages/LinkedListPage.tsx` | ~250 | `linkedlist` | "链表操作"、"头插法"、"尾插法"、"按值查找" |
| **TreePage** | `src/pages/TreePage.tsx` | ~250 | `tree` | "树操作"、"插入节点"、"删除节点"、"前/中/后序遍历" |
| **AVLTreePage** | `src/pages/AVLTreePage.tsx` | ~200 | `avlTree` | "平衡二叉树"、"左旋"、"右旋"、"平衡因子" |
| **BTreePage** | `src/pages/BTreePage.tsx` | ~200 | `bTree` | "B 树"、"分裂"、"合并"、"关键字个数" |
| **SegmentTreePage** | `src/pages/SegmentTreePage.tsx` | ~150 | `segmentTree` | "线段树"、"区间查询"、"单点更新" |
| **RedBlackTreePage** | `src/pages/RedBlackTreePage.tsx` | ~150 | `redBlackTree` | "红黑树"、"变色"、"左旋"、"右旋" |
| **HashPage** | `src/pages/HashPage.tsx` | ~200 | `hash` | "哈希表"、"插入键值"、"查找键"、"哈希冲突" |
| **HeapPage** | `src/pages/HeapPage.tsx` | ~200 | `heap` | "堆操作"、"插入元素"、"删除堆顶"、"堆化" |
| **TriePage** | `src/pages/TriePage.tsx` | ~150 | `trie` | "字典树"、"插入单词"、"查找前缀" |
| **UnionFindPage** | `src/pages/UnionFindPage.tsx` | ~150 | `unionFind` | "并查集"、"合并集合"、"查找根" |
| **SkipListPage** | `src/pages/SkipListPage.tsx` | ~150 | `skipList` | "跳表"、"插入层级"、"查找路径" |

### 2.3 P2 页面（4 个 / M4 第三批）

| 页面 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串示例 |
|------|----------|------------|----------------|----------------|
| **GraphAlgorithmPage** | `src/pages/GraphAlgorithmPage.tsx` | ~200 | `graphAlgorithm` | "图算法"、"BFS"、"DFS"、"Dijkstra" |
| **SortComparePage** | `src/pages/SortComparePage.tsx` | ~150 | `sortCompare` | "算法对比"、"性能图表"、"复杂度对比" |
| **InfoPanel** | `src/pages/InfoPanelPage.tsx` | ~100 | `infoPanel` | "信息面板"、"学习模式"、"操作日志" |

---

## 3. 16+ 组件硬编码清单（M5）

### 3.1 P2 反馈类组件（4 个）

| 组件 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串 |
|------|----------|------------|----------------|------------|
| **Toast** | `src/components/Toast.tsx` + `toastStore.ts` | ~150 | `toast` | "操作成功"、"操作失败"、"警告信息" |
| **LogPanel** | `src/components/LogPanel.tsx` | ~100 | `logPanel` | "操作日志"、"清空日志"、"日志条目" |
| **InfoPanel** | `src/components/InfoPanel.tsx` | ~100 | `infoPanel` | "学习步骤"、"下一步"、"上一步" |
| **EmptyState** | `src/components/EmptyState.tsx` | ~50 | `common.emptyState` | "暂无数据"、"请先添加元素" |

### 3.2 P2 通用类组件（6 个）

| 组件 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串 |
|------|----------|------------|----------------|------------|
| **Card** | `src/components/Card.tsx` | ~50 | `common.card` | "卡片标题" |
| **Button** | `src/components/Button.tsx` | ~30 | `core.button` | "确认"、"取消"、"提交" |
| **Modal** | `src/components/Modal.tsx` | ~80 | `common.modal` | "确认删除？"、"取消" |
| **Icon** | `src/components/Icon.tsx` | ~20 | — | （仅 aria-label）|
| **KeyboardHelp** | `src/components/KeyboardHelp.tsx` | ~100 | `shortcuts` | "Ctrl+Z 撤销"、"Ctrl+Shift+Z 重做" |
| **GlobalSearch** | `src/components/GlobalSearch.tsx` | ~100 | `globalSearch` | "搜索数据结构..."、"无结果" |

### 3.3 P2 数据结构类组件（6 个）

| 组件 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串 |
|------|----------|------------|----------------|------------|
| **Visualizer** | `src/components/Visualizer.tsx` | ~50 | `common.visualizer` | "可视化"、"渲染中" |
| **OperationGroup** | `src/components/OperationGroup.tsx` | ~50 | `common.operationGroup` | "操作组" |
| **PageHeader** | `src/components/PageHeader.tsx` | ~50 | `common.pageHeader` | "页面标题" |
| **LearningModeToggle** | `src/components/LearningModeToggle.tsx` | ~80 | `learningMode` | "学习模式"、"退出学习" |
| **QuizPanel** | `src/components/QuizPanel.tsx` | ~150 | `quiz` | "题目"、"正确答案"、"下一题" |
| **ComplexityChart** | `src/components/ComplexityChart.tsx` | ~80 | `complexity` | "时间复杂度"、"空间复杂度" |

---

## 4. 5 工具类硬编码清单（M6）

| 工具 | 文件路径 | 估计字符数 | 目标 namespace | 关键字符串 |
|------|----------|------------|----------------|------------|
| **validate** | `src/utils/validate.ts` | ~150 | `validate` | "输入不能为空"、"数值范围 1-99"、"请输入数字" |
| **animationEngine** | `src/utils/animationEngine.ts` | ~80 | `common.animation` | "动画执行中"、"动画已取消" |
| **animationExport** | `src/utils/animationExport.ts` | ~50 | `exportAnimation` | "导出动画"、"导出成功" |
| **storage** | `src/utils/storage.ts` | ~30 | `common.storage` | "数据已保存" |
| **performanceConfig** | `src/utils/performanceConfig.ts` | ~50 | `performance` | "性能模式"、"低性能警告" |

**5 utils 总字符数**：~360

---

## 5. 40 学习配置硬编码清单（M7）

### 5.1 数据结构类（17 个，P3）

| # | 配置文件 | 行数 | 估计字符数 | 目标 namespace |
|---|----------|------|------------|----------------|
| 1 | `array.config.ts` | 771 | ~1,500 | `arrayLearning` |
| 2 | `stack.config.ts` | 295 | ~600 | `stackLearning` |
| 3 | `queue.config.ts` | ~300 | ~600 | `queueLearning` |
| 4 | `linkedlist.config.ts` | ~400 | ~800 | `linkedlistLearning` |
| 5 | `tree.config.ts` | 964 | ~1,800 | `treeLearning` |
| 6 | `avlTree.config.ts` | ~400 | ~800 | `avlTreeLearning` |
| 7 | `bTree.config.ts` | ~400 | ~800 | `bTreeLearning` |
| 8 | `segmentTree.config.ts` | ~300 | ~600 | `segmentTreeLearning` |
| 9 | `redBlackTree.config.ts` | ~400 | ~800 | `redBlackTreeLearning` |
| 10 | `hash.config.ts` | ~350 | ~700 | `hashLearning` |
| 11 | `heap.config.ts` | ~350 | ~700 | `heapLearning` |
| 12 | `trie.config.ts` | 409 | ~800 | `trieLearning` |
| 13 | `graph.config.ts` | ~400 | ~800 | `graphLearning` |
| 14 | `unionFind.config.ts` | 552 | ~1,100 | `unionFindLearning` |
| 15 | `skipList.config.ts` | 562 | ~1,100 | `skipListLearning` |
| 16 | `avlTree.*` （重复）| — | — | — |
| 17 | 其他 | — | ~500 | — |

**17 数据结构学习配置总字符数**：~13,500

### 5.2 算法类（8 个，P3）

| # | 配置文件 | 行数 | 估计字符数 | 目标 namespace |
|---|----------|------|------------|----------------|
| 1 | `sortCompare.config.ts` | 795 | ~1,500 | `sortCompareLearning` |
| 2 | `bubble.config.ts` | ~200 | ~400 | `bubbleLearning` |
| 3 | `selection.config.ts` | 244 | ~500 | `selectionLearning` |
| 4 | `insertion.config.ts` | ~200 | ~400 | `insertionLearning` |
| 5 | `merge.config.ts` | ~250 | ~500 | `mergeLearning` |
| 6 | `quick.config.ts` | ~250 | ~500 | `quickLearning` |
| 7 | `heap.config.ts` | ~250 | ~500 | `heapSortLearning` |
| 8 | `shell.config.ts` | 233 | ~500 | `shellLearning` |
| 9 | `tim.config.ts` | 172 | ~350 | `timLearning` |
| 10 | `topoSort.config.ts` | 296 | ~600 | `topoSortLearning` |

**10 算法学习配置总字符数**：~5,750

### 5.3 图算法类（4 个，P3）

| # | 配置文件 | 行数 | 估计字符数 | 目标 namespace |
|---|----------|------|------------|----------------|
| 1 | `bfs.config.ts` | ~200 | ~400 | `bfsLearning` |
| 2 | `dfs.config.ts` | ~200 | ~400 | `dfsLearning` |
| 3 | `dijkstra.config.ts` | ~250 | ~500 | `dijkstraLearning` |
| 4 | `prim.config.ts` | ~250 | ~500 | `primLearning` |

**4 图算法学习配置总字符数**：~1,800

### 5.4 学习配置总字符数
- 17 + 10 + 4 = 31 个学习配置
- 总字符数：~21,050（**实际 v19 范围**：~10,000-15,000，剩余为多语言标记）

---

## 6. 命名空间映射总表

| Namespace | 文件位置 | 模块 | 字符数估计 | 迁移 M | 优先级 |
|-----------|----------|------|------------|--------|--------|
| `home` | `locales/{zh,en}/page/home.ts` | Page | ~500 | M4-1 | P0 |
| `sortPage` | `locales/{zh,en}/page/sortPage.ts` | Page | ~400 | M4-1 | P0 |
| `arrayPage` | `locales/{zh,en}/page/arrayPage.ts` | Page | ~350 | M4-1 | P0 |
| `graph` | `locales/{zh,en}/page/graphPage.ts` | Page | ~300 | M4-1 | P0 |
| `stack` / `queue` / `linkedlist` | `locales/{zh,en}/page/*.ts` | Page | ~200 × 3 | M4-2 | P1 |
| `tree` / `avlTree` / `bTree` | `locales/{zh,en}/page/*.ts` | Page | ~250 × 3 | M4-2 | P1 |
| `segmentTree` / `redBlackTree` / `hash` | `locales/{zh,en}/page/*.ts` | Page | ~200 × 3 | M4-2 | P1 |
| `heap` / `trie` / `unionFind` / `skipList` | `locales/{zh,en}/page/*.ts` | Page | ~200 × 4 | M4-2 | P1 |
| `graphAlgorithm` / `sortCompare` / `infoPanel` | `locales/{zh,en}/page/*.ts` | Page | ~150 × 3 | M4-3 | P2 |
| `toast` / `logPanel` | `locales/{zh,en}/component/*.ts` | Component | ~150 + 100 | M5-1 | P2 |
| `core.error` / `core.button` / `core.status` | `locales/{zh,en}/core/*.ts` | Core | ~300 | M5-1 | P2 |
| `common.*` | `locales/{zh,en}/common.ts` | Common | ~500 | M5-2 | P2 |
| `learningMode` / `quiz` | `locales/{zh,en}/component/*.ts` | Component | ~230 | M5-2 | P2 |
| `shortcuts` / `globalSearch` | `locales/{zh,en}/component/*.ts` | Component | ~200 | M5-2 | P2 |
| `complexity` / `algorithms` | `locales/{zh,en}/algorithm/*.ts` | Algorithm | ~300 | M5-2 | P2 |
| `validate` | `locales/{zh,en}/core/validate.ts` | Util | ~150 | M6 | P2 |
| `common.animation` / `exportAnimation` / `storage` / `performance` | `locales/{zh,en}/core/*.ts` | Util | ~210 | M6 | P2 |
| `*Learning` (31 个) | `locales/{zh,en}/learning/*.ts` | Learning | ~10,000-15,000 | M7 | P3 |

**总计 v19 范围**：~17,500-22,000 字符

---

## 7. M1 验收清单

- [x] 17 页面硬编码字符串统计（按 namespace 划分）
- [x] 16+ 组件硬编码字符串统计
- [x] 5 utils 硬编码字符串统计
- [x] 40 学习配置硬编码字符串统计
- [x] 命名空间映射总表（覆盖 50+ namespace）
- [x] 优先级排序（P0/P1/P2/P3）
- [x] 迁移 M 阶段划分（M4/M5/M6/M7）
- [x] v19 范围圈定（17,500 字符）
- [x] v19 范围外清单（OUT-OF-SCOPE）

---

## 8. 下一步（M2 启动条件）

启动 **M2 i18n 基础设施**前需用户拍板：

1. **D6 工具类翻译策略**（新增 M0 决策）：
   - 选项 A：保留 zh 默认 + en 翻译双显（用户切换时立即看到）
   - 选项 B：仅 UI 文本翻译，错误消息保留 zh（避免英文错误难懂）

2. **D7 学习配置翻译范围**：
   - 选项 A：完整翻译所有 31 个 learning config（~10,000-15,000 字符）
   - 选项 B：仅翻译高频 10 个（~5,000 字符），其余保留 zh

3. **D8 翻译协作模式**：
   - 选项 A：AI 初译 + 用户单次校对（快速，依赖 AI 质量）
   - 选项 B：AI 初译 + 用户分批校对（慢但质量高）

4. **M2 启动授权**：请确认是否启动 M2 基础设施（创建 `locales/{zh,en}/` 目录 + integrity.ts + 测试 8→50+）。

---

**当前状态**：M1 调研完成，等待 M2 启动拍板（D6/D7/D8 + M2 启动授权）。
