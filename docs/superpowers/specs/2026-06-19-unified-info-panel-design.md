# 统一信息面板设计

**日期**：2026-06-19
**状态**：已批准（方案 A）
**前置**：v11 Phase 5.5 已完成全结构 codeStepId 覆盖

## 1. 背景与目标

用户明确表示不喜欢当前 LogPanel 日志区的排版、配色、布局：
- 深色反色背景（`bg-ink`）与浅色页面割裂
- 无 Neo-Brutalist 硬阴影，失去项目标志性触感
- 全 mono 字体、无字号层级，像终端文字墙
- 扁平流式列表，无结构化分区

用户喜欢学习模式（StepExplainer）的风格：白色卡片、硬阴影、字体层级、结构化分区。

**目标**：移除底部 LogPanel，新建右侧常驻统一信息面板 `InfoPanel`，融合"操作日志 + 学习步骤 + 代码展示"，视觉风格完全采用 StepExplainer 设计语言。

## 2. 范围

### 2.1 新建组件
- `src/components/InfoPanel.tsx` — 统一信息面板（右侧常驻，含 tab 切换）

### 2.2 重构组件
- `src/components/LearningModeToggle.tsx` — 简化为 InfoPanel 的学习模式 tab 触发器（或移除，功能并入 InfoPanel）
- `src/components/LogPanel.tsx` — 重构为 InfoPanel 的操作日志 tab 内容（卡片化时间线）

### 2.3 修改页面（13 个标准页面）
移除底部 `<LogPanel />` 和 `<LearningModeToggle />`，改为右侧 `<InfoPanel />`：
- ArrayPage、LinkedListPage、StackPage、QueuePage、TreePage、AvlTreePage
- HeapPage、HashPage、TriePage、GraphPage、SortPage
- GraphAlgorithmPage（已是左右分栏，需适配）
- SortComparePage（特殊布局，需适配）

### 2.4 不在范围内
- 不修改 hooks（codeStepId 机制已就绪）
- 不修改 learning configs（Phase 5.5 已全结构覆盖）
- 不修改 StepExplainer 内部逻辑（直接复用）
- 不新增练习题功能（后续迭代）

## 3. InfoPanel 组件设计

### 3.1 布局

**桌面端（lg+）**：右侧常驻 `w-96`（384px）面板，与 Visualizer 左右分栏
**移动端**：底部可上滑抽屉（保留可折叠性），默认折叠为状态栏

### 3.2 分区结构

```
InfoPanel
├── Tab 切换栏（操作日志 | 学习模式）
├── Tab 内容区（flex-1 overflow-y-auto）
│   ├── 操作日志 tab
│   │   └── 时间线卡片列表
│   │       └── 每条日志一个卡片
│   │           ├── 时间戳徽章 + 类型徽章
│   │           ├── 消息内容
│   │           └── 可选代码预览（codeStepId 存在时）
│   └── 学习模式 tab
│       └── StepExplainer（直接嵌入）
└── （无底部栏，tab 内容区占满）
```

### 3.3 视觉规范（复用 StepExplainer 模式）

| 元素 | 样式 |
|---|---|
| 面板容器 | `bg-surface dark:bg-dark-surface border-l-2 border-ink dark:border-dark-border` |
| Tab 按钮 | `border-2 border-ink shadow-button hover:-translate-y-0.5 hover:shadow-button-hover active:translate-x-[1px] active:translate-y-[1px] active:shadow-none` |
| Tab 激活态 | `bg-accent-blue text-paper border-accent-blue` |
| Tab 未激活 | `bg-surface text-ink hover:bg-ink hover:text-paper` |
| 日志卡片 | `bg-surface border border-ink/10 p-3 mb-2` |
| 时间戳徽章 | `inline-flex px-2 py-0.5 text-[10px] font-mono bg-paper text-ink-light border border-ink/10` |
| 类型徽章 | `inline-flex px-2 py-0.5 text-[10px] font-mono font-bold bg-{color}/10 text-{color} border border-{color}/30` |
| 代码预览 | `bg-paper border border-ink/10 p-2 mt-2 font-mono text-xs` |
| 字体 | 标题 display 字体，代码/数字/时间戳 mono |

### 3.4 类型色映射（语义化，克制使用）

| 类型 | 颜色 | 语义 |
|---|---|---|
| oper | accent-blue | 操作 |
| info | accent-emerald | 信息 |
| error | accent-rose | 错误 |
| code | accent-amber | 代码 |

## 4. 操作后自动跳转机制

### 4.1 数据流

```
用户操作 → hook.addLog('oper', msg, 'preorder')
         → logs 数组更新（最新日志在末尾）
         → InfoPanel 监听 logs[logs.length-1].codeStepId
         → 有 codeStepId 时：
           1. 自动切换到"学习模式" tab
           2. learningMode.goToStep(idx)（idx 通过 steps.findIndex 查找）
         → 无 codeStepId 时：停留在"操作日志" tab
```

### 4.2 实现要点

- InfoPanel 接收 `logs`、`learningMode`、`onJumpToStep` 作为 props
- 使用 `useEffect` 监听 `logs.length` 变化，检查最新日志的 `codeStepId`
- 仅当 `codeStepId` 存在且能找到对应步骤时才自动跳转
- 自动跳转后切换到"学习模式" tab
- 用户手动切换到"操作日志" tab 后不会被强制切回（除非新操作触发）

## 5. 页面布局变化

### 5.1 标准页面（11 个）

**当前**：
```
<div className="flex flex-col min-h-dvh">
  <PageHeader />
  <OperationBar />
  <ContentTier />
  <Visualizer />  ← flex-1
  <LearningModeToggle />  ← fixed 浮动
  <LogPanel />  ← 底部
</div>
```

**新设计**：
```
<div className="flex flex-col min-h-dvh">
  <PageHeader />
  <OperationBar />
  <ContentTier />
  <div className="flex-1 flex flex-col lg:flex-row min-h-0">
    <Visualizer />  ← flex-1（主区域）
    <InfoPanel />  ← w-96（右侧常驻，移动端底部抽屉）
  </div>
</div>
```

### 5.2 GraphAlgorithmPage（已是左右分栏）

适配为使用 InfoPanel 替代现有的 LogPanel + StepExplainer 组合。

### 5.3 SortComparePage（网格布局）

InfoPanel 作为右侧常驻面板，网格布局调整为 `lg:grid-cols-2`（为面板腾出空间）。

## 6. 移动端适配

- **桌面端（lg+）**：InfoPanel 右侧常驻 `w-96`
- **移动端**：InfoPanel 改为底部可上滑抽屉
  - 折叠态：仅显示状态栏（最近一条操作 + 日志计数）
  - 展开态：上滑抽屉，高度 60vh
  - 通过 `lg:` 前缀实现响应式切换

## 7. 学习系统深度扩展设计（为后续迭代预留）

### 7.1 LearningStep 类型扩展

```ts
interface LearningStep {
  id: string;
  title: string;
  description: string;
  codeSnippet: string;
  highlightedLine: number;
  highlightTerms: string[];
  tips?: string[];
  complexity?: { time?: string; space?: string };
  // 新增字段（后续迭代填充）
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: 'concept' | 'operation' | 'algorithm' | 'application';
  prerequisites?: string[];
  relatedSteps?: string[];
}
```

### 7.2 知识分层联动

ContentTier 组件已有初/中/高级分层，InfoPanel 的学习模式 tab 将与之联动：
- 选择"初级"→ 只显示 difficulty='beginner' 步骤
- 选择"中级"→ 显示 beginner + intermediate
- 选择"高级"→ 显示全部

**本次迭代不实现联动**，仅预留类型字段，后续迭代填充 difficulty 并实现过滤。

## 8. 测试策略

- 新建 `src/__tests__/components/InfoPanel.test.tsx` — 测试 tab 切换、日志渲染、自动跳转
- 更新现有页面测试 — 移除 LogPanel 相关断言，添加 InfoPanel 相关断言
- 全量回归：3075+ 单元测试、ESLint、tsc、build
- E2E 手动验证：操作后自动跳转、tab 切换、移动端抽屉

## 9. 影响分析

- **改了哪些模块**：新建 InfoPanel，重构 LearningModeToggle 和 LogPanel，修改 13 个页面布局
- **是否影响 API/状态/数据流**：否，hooks 和 learning configs 不变
- **副作用**：页面布局从垂直堆叠变为左右分栏，Visualizer 在窄屏下需确保可用

## 10. 后续迭代计划（本次不实现）

1. **知识分层联动**：填充 LearningStep.difficulty 字段，实现 ContentTier 联动过滤
2. **练习题系统**：新增 Exercise 类型，每个步骤可附带练习题
3. **学习进度追踪**：记录用户完成的步骤，跨会话持久化
4. **知识图谱**：基于 prerequisites/relatedSteps 构建可视化知识图谱
5. **深度内容扩展**：为每个操作添加"原理深入"、"复杂度分析"、"常见误区"等子章节
