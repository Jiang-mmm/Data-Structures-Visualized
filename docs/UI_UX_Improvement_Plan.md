# UI/UX 视觉改进计划

> **项目：** 数据结构学习助手（ds-visualizer）  
> **版本：** v1.0  
> **日期：** 2026-06-16  
> **状态：** 待审批  

---

## 目录

1. [文档概述](#1-文档概述)
2. [改进目标与原则](#2-改进目标与原则)
3. [P0 关键改进项](#3-p0-关键改进项)
4. [P1 重要改进项](#4-p1-重要改进项)
5. [P2 一般改进项](#5-p2-一般改进项)
6. [P3 优化改进项](#6-p3-优化改进项)
7. [改动影响范围矩阵](#7-改动影响范围矩阵)
8. [验收标准](#8-验收标准)
9. [风险说明](#9-风险说明)

---

## 1. 文档概述

### 1.1 背景

基于对全部 13 个页面的系统性 UI/UX 视觉审查（Desktop 1920×1080 / Mobile 375×812 / Dark Mode），发现 15 项视觉与体验问题。本文档将问题按优先级分级，提供具体可操作的修改方案。

### 1.2 审查范围

| 页面 | 路由 | 截图覆盖 |
|------|------|----------|
| 首页 | `/` | Desktop / Mobile / Dark |
| 数组 | `/array` | Desktop / Mobile |
| 栈 | `/stack` | Desktop / Mobile |
| 队列 | `/queue` | Desktop / Mobile |
| 链表 | `/linkedlist` | Desktop / Mobile |
| 二叉树 | `/tree` | Desktop / Mobile |
| 图 | `/graph` | Desktop / Mobile |
| 排序 | `/sort` | Desktop / Mobile |
| 哈希表 | `/hash` | Desktop / Mobile |
| 堆 | `/heap` | Desktop / Mobile |
| 字典树 | `/trie` | Desktop / Mobile |
| 排序对比 | `/compare` | Desktop / Mobile |
| 图算法可视化 | `/graph-algorithm` | Desktop / Mobile |

### 1.3 问题汇总

| 优先级 | 数量 | 说明 |
|--------|------|------|
| P0 关键 | 2 | 影响核心体验，需立即修复 |
| P1 重要 | 4 | 影响特定场景体验，建议本轮修复 |
| P2 一般 | 6 | 体验优化，可安排后续迭代 |
| P3 优化 | 3 | 锦上添花，视资源情况决定 |
| **合计** | **15** | |

---

## 2. 改进目标与原则

### 2.1 改进目标

1. **空间效率** — 消除可视化区域的无效空白，提升信息密度
2. **风格统一** — 确保所有组件严格遵循 Neo-Brutalism 设计语言
3. **移动端体验** — 解决操作栏拥挤问题，提升小屏可用性
4. **视觉层次** — 强化页面区域间的视觉区分度
5. **可读性** — 修正过小字号与对比度不足问题

### 2.2 设计原则约束

- 保持 Neo-Brutalism 核心特征：硬边框（2px）、硬阴影、高对比度
- 不引入新的设计体系或第三方 UI 库
- 所有改动在现有 Tailwind CSS v4 + 自定义 utility 体系内完成
- 不改变现有数据结构逻辑、动画引擎、状态管理
- 暗色模式与亮色模式同步调整

---

## 3. P0 关键改进项

### 3.1 改进项 #1：可视化区域空间浪费

**问题编号：** UI-001  
**优先级：** P0  
**影响页面：** 所有 12 个数据结构子页面  
**涉及文件：** `src/components/Visualizer.tsx`

#### 问题描述

可视化区域使用固定 `min-h-[400px]`（lg 断点），当数据量少时元素居中显示在大片空白中，视觉重心下沉，空间利用率低。

#### 修改方案

**方案 A（推荐）：动态最小高度**

修改 `Visualizer.tsx` 第 167 行的 className，根据数据量动态调整最小高度：

```tsx
// 当前代码（第 167 行）
className={`
  flex-1 relative min-h-[200px] sm:min-h-[300px] lg:min-h-[400px] overflow-hidden bg-clip-padding
  ...
`}

// 修改为
const minH = dataLength <= 5
  ? 'min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]'
  : dataLength <= 15
    ? 'min-h-[250px] sm:min-h-[350px] lg:min-h-[400px]'
    : 'min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]'

className={`
  flex-1 relative ${minH} overflow-hidden bg-clip-padding
  ...
`}
```

其中 `dataLength` 通过 props 传入或在组件内计算：

```tsx
const dataLength = useMemo(() => {
  if (Array.isArray(data)) return data.length
  const d = data as Record<string, unknown>
  return (d?.nodes as unknown[])?.length || (d?.length as number) || 1
}, [data])
```

**方案 B（备选）：内容自适应居中**

在 `Visualizer.tsx` 的 SVG 容器外层添加 flex 居中：

```tsx
<div className="flex-1 relative overflow-hidden bg-clip-padding ...">
  <div className="absolute inset-0 flex items-center justify-center">
    <svg ... />
  </div>
  ...
</div>
```

> 注意：方案 B 可能影响现有的平移/缩放交互逻辑，需额外测试。优先推荐方案 A。

#### 验收标准

- [ ] 数组页 5 个元素时，可视化区域高度不超过 350px
- [ ] 数组页 20 个元素时，可视化区域高度不低于 400px
- [ ] 树/图页面节点少时不出现大面积空白
- [ ] 缩放、平移功能不受影响

---

### 3.2 改进项 #2：LogPanel 风格与 Neo-Brutalism 不一致

**问题编号：** UI-002  
**优先级：** P0  
**影响页面：** 所有 12 个数据结构子页面  
**涉及文件：** `src/components/LogPanel.tsx`

#### 问题描述

LogPanel 使用 `bg-gradient-to-b from-slate-800 to-slate-850` 深色渐变背景，是项目中唯一使用渐变的组件，与 Neo-Brutalism 硬边纯色风格不一致。

#### 修改方案

**第 46 行 — 容器背景：**

```tsx
// 当前
className="bg-gradient-to-b from-slate-800 to-slate-850 dark:from-slate-900 dark:to-slate-950 text-paper ..."

// 修改为
className="bg-ink dark:bg-slate text-paper dark:text-dark-ink ..."
```

**第 51 行 — 头部栏背景：**

```tsx
// 当前
className="... bg-slate-700/80 dark:bg-slate-800/80 border-b border-slate-600/30 ..."

// 修改为
className="... bg-ink/90 dark:bg-slate-light border-b-2 border-ink/30 dark:border-dark-border/30 ..."
```

**第 67-75 行 — 筛选按钮：**

```tsx
// 当前选中态
'border-slate-400/40 bg-slate-600/50 text-paper'
// 修改为
'border-paper/50 bg-paper/20 text-paper'

// 当前未选中态
'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
// 修改为
'border-transparent text-paper/50 hover:text-paper/80 hover:bg-paper/10'
```

**第 81 行 — 日志计数文字：**

```tsx
// 当前
className="font-mono text-[10px] text-slate-400"
// 修改为
className="font-mono text-xs text-paper/60"
```

**第 89-93 行 — 自动滚动按钮：**

```tsx
// 当前选中态
'border-accent-blue/50 bg-accent-blue/20 text-accent-blue'
// 修改为（暗色背景上蓝色不够醒目，改用白色）
'border-paper/50 bg-paper/20 text-paper'

// 当前未选中态
'border-slate-600/40 text-slate-500 hover:border-slate-500/60'
// 修改为
'border-paper/20 text-paper/40 hover:border-paper/40'
```

**第 112 行 — 无日志提示：**

```tsx
// 当前
className="text-slate-600 text-center py-6 text-xs tracking-wide"
// 修改为
className="text-paper/40 text-center py-6 text-xs tracking-wide"
```

**第 123 行 — 日志行斑马纹：**

```tsx
// 当前
`${i % 2 === 0 ? 'bg-slate-800/0' : 'bg-slate-700/15'}`
// 修改为
`${i % 2 === 0 ? 'bg-transparent' : 'bg-paper/5'}`
```

**第 127 行 — 时间戳文字：**

```tsx
// 当前
className="text-slate-500 w-20 shrink-0 text-xs ..."
// 修改为
className="text-paper/40 w-20 shrink-0 text-xs ..."
```

**第 137 行 — 日志消息文字：**

```tsx
// 当前
className="text-slate-300 break-all text-xs ..."
// 修改为
className="text-paper/90 break-all text-xs ..."
```

#### 验收标准

- [ ] LogPanel 背景为纯色，无渐变效果
- [ ] 边框使用 2px 硬边，与项目其他组件一致
- [ ] 亮色/暗色模式下文字均清晰可读
- [ ] 筛选按钮、自动滚动按钮交互状态可辨识
- [ ] 日志内容文字对比度 ≥ 4.5:1

---

## 4. P1 重要改进项

### 4.1 改进项 #3：移动端操作栏拥挤

**问题编号：** UI-003  
**优先级：** P1  
**影响页面：** 所有 12 个数据结构子页面（移动端）  
**涉及文件：** `src/components/OperationBar.tsx`、`src/components/Visualizer.tsx`、各 Page 组件

#### 问题描述

OperationBar 在 375px 宽度下包含 SpeedControl + 输入框 + 多个操作按钮 + ColorLegend + Undo/Redo，需要横向滚动且提示不明显。

#### 修改方案

**步骤 1：将 SpeedControl 移至 PageHeader**

修改所有 Page 组件（`ArrayPage.tsx`、`TreePage.tsx` 等），将 `<SpeedControl />` 从 `<OperationBar>` 移至 `<PageHeader>` 的 children 中：

```tsx
// 以 ArrayPage.tsx 为例
<PageHeader title={t('array.title')} subtitle={t('array.subtitle')}>
  <SpeedControl />  {/* 新增 */}
  <ExportImport ... />
  <ShareButton ... />
  <OperationButton variant="outline" onClick={reset}>...</OperationButton>
  <OperationButton variant="primary" onClick={randomize}>...</OperationButton>
</PageHeader>

<OperationBar>
  {/* 移除 <SpeedControl /> */}
  <OperationLabel>...</OperationLabel>
  ...
</OperationBar>
```

**步骤 2：将 ColorLegend 移至 Visualizer 左下角**

修改 `Visualizer.tsx`，在 Zoom Controls 旁添加 ColorLegend 展示区域。通过新增 prop 接收图例数据：

```tsx
// VisualizerProps 新增
interface VisualizerProps {
  ...
  legendItems?: Array<{ color: string; labelKey: string }>
}

// 在 Zoom Controls 的 div 中追加图例
{legendItems && legendItems.length > 0 && (
  <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-ink/20 dark:border-dark-border/30">
    {legendItems.map(item => (
      <div key={item.labelKey} className="flex items-center gap-1">
        <div className="w-2.5 h-2.5 rounded-sm border border-black/20 dark:border-white/20"
          style={{ backgroundColor: item.color }} />
        <span className="text-ink-light/60 dark:text-dark-ink-light/60 text-[10px] whitespace-nowrap">
          {t(item.labelKey)}
        </span>
      </div>
    ))}
  </div>
)}
```

各 Page 组件传入图例数据：

```tsx
<Visualizer
  ...
  legendItems={[
    { color: getColors().nodeDefault, labelKey: 'nodeLegend.node' },
    { color: getColors().nodeActive, labelKey: 'nodeLegend.active' },
  ]}
/>
```

**步骤 3：优化移动端 OperationBar 滚动提示**

修改 `src/index.css` 中 `.operation-bar-scroll-hint::after` 的渐变宽度，从 24px 增大到 40px，使滚动提示更明显：

```css
.operation-bar-scroll-hint::after {
  width: 40px;  /* 原 24px */
  background: linear-gradient(to right, transparent, var(--color-paper) 100%);
}
```

#### 验收标准

- [ ] 移动端 OperationBar 不再需要横向滚动（或滚动需求降低 50%）
- [ ] SpeedControl 在 PageHeader 中正常显示与交互
- [ ] ColorLegend 在桌面端可视化区域左下角可见
- [ ] 移动端滚动提示宽度 ≥ 40px，视觉可辨识

---

### 4.2 改进项 #4：首页卡片色彩过多

**问题编号：** UI-004  
**优先级：** P1  
**影响页面：** 首页  
**涉及文件：** `src/pages/Home.tsx`

#### 问题描述

12 张卡片使用 7 种不同强调色，视觉过于花哨，削弱 Neo-Brutalism 的简洁力量感。

#### 修改方案

**方案：按类别归并为 4 色**

修改 `Home.tsx` 中 `structures` 数组的 `colorIdx` 字段，将 12 个数据结构按 4 个类别分组：

```tsx
const structures = useMemo(() => [
  // 线性结构 — 蓝色系 (colorIdx: 0)
  { path: '/array', ..., colorIdx: 0 },
  { path: '/stack', ..., colorIdx: 0 },
  { path: '/queue', ..., colorIdx: 0 },
  { path: '/linkedlist', ..., colorIdx: 0 },

  // 树形结构 — 紫色系 (colorIdx: 1)
  { path: '/tree', ..., colorIdx: 1 },
  { path: '/heap', ..., colorIdx: 1 },
  { path: '/trie', ..., colorIdx: 1 },

  // 图结构 — 青色系 (colorIdx: 2)
  { path: '/graph', ..., colorIdx: 2 },
  { path: '/hash', ..., colorIdx: 2 },
  { path: '/graph-algorithm', ..., colorIdx: 2 },

  // 算法 — 琥珀色系 (colorIdx: 3)
  { path: '/sort', ..., colorIdx: 3 },
  { path: '/compare', ..., colorIdx: 3 },
], [t])
```

同时精简 `ACCENT_COLORS` 数组，仅保留 4 种：

```tsx
const ACCENT_COLORS = [
  { bg: 'bg-accent-blue/5', border: 'border-l-accent-blue', badge: 'bg-accent-blue/10 text-accent-blue', iconBg: 'bg-accent-blue/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]' },
  { bg: 'bg-accent-violet/5', border: 'border-l-accent-violet', badge: 'bg-accent-violet/10 text-accent-violet', iconBg: 'bg-accent-violet/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]' },
  { bg: 'bg-accent-teal/5', border: 'border-l-accent-teal', badge: 'bg-accent-teal/10 text-accent-teal', iconBg: 'bg-accent-teal/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(13,148,136,0.15)]' },
  { bg: 'bg-accent-amber/5', border: 'border-l-accent-amber', badge: 'bg-accent-amber/10 text-accent-amber', iconBg: 'bg-accent-amber/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(217,119,6,0.15)]' },
]
```

#### 验收标准

- [ ] 首页卡片仅使用 4 种强调色
- [ ] 同类数据结构卡片颜色一致
- [ ] 视觉整体感提升，色彩噪音降低
- [ ] 暗色模式下色彩协调性不受影响

---

### 4.3 改进项 #5：EmptyState 风格不一致

**问题编号：** UI-005  
**优先级：** P1  
**影响页面：** 所有 12 个数据结构子页面（空数据状态）  
**涉及文件：** `src/components/EmptyState.tsx`

#### 问题描述

EmptyState 使用 `backdrop-blur-md`、`border-dashed`、`rounded-full blur-sm` 等柔和效果，与 Neo-Brutalism 硬边风格不符。

#### 修改方案

**第 22 行 — 容器背景：**

```tsx
// 当前
className="absolute inset-0 flex items-center justify-center bg-paper/70 dark:bg-dark-paper/70 backdrop-blur-md z-10 pointer-events-none animate-fade-in"

// 修改为
className="absolute inset-0 flex items-center justify-center bg-paper/90 dark:bg-dark-paper/90 z-10 pointer-events-none animate-fade-in"
```

**第 25 行 — 图标容器边框：**

```tsx
// 当前
className="w-20 h-20 border-2 border-dashed border-ink/15 dark:border-dark-ink/15 ..."

// 修改为
className="w-20 h-20 border-2 border-ink/20 dark:border-dark-border/30 ..."
```

**第 27 行 — 中心加号装饰：**

```tsx
// 当前
className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border border-ink/10 dark:border-dark-ink/10 ..."

// 修改为
className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-2 border-ink/20 dark:border-dark-border/30 ..."
```

**第 29 行 — 底部阴影装饰（移除模糊）：**

```tsx
// 当前
className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-ink/10 dark:bg-dark-ink/10 rounded-full blur-sm"

// 修改为（硬边阴影）
className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-1 bg-ink/20 dark:bg-dark-border/40"
```

#### 验收标准

- [ ] EmptyState 无 backdrop-blur 效果
- [ ] 边框为实线（非虚线），2px 硬边
- [ ] 无 rounded-full blur 等柔和效果
- [ ] 整体风格与 Neo-Brutalism 一致

---

### 4.4 改进项 #6：PageHeader 与 OperationBar 视觉层次不清

**问题编号：** UI-006  
**优先级：** P1  
**影响页面：** 所有 12 个数据结构子页面  
**涉及文件：** `src/components/OperationBar.tsx`

#### 问题描述

PageHeader 和 OperationBar 均使用 `border-b-2 border-ink`，视觉权重接近，用户难以区分"页面信息区"和"操作区"。

#### 修改方案

修改 `OperationBar.tsx` 第 42 行的边框样式，降低操作栏的视觉权重：

```tsx
// 当前
className={`
  bg-paper-warm dark:bg-slate-light border-b-2 border-ink dark:border-dark-border
  px-3 sm:px-6 py-1.5 sm:py-2.5
  ...
`}

// 修改为
className={`
  bg-paper-warm dark:bg-slate-light border-b border-ink/30 dark:border-dark-border/40
  px-3 sm:px-6 py-1.5 sm:py-2.5
  ...
`}
```

关键变化：`border-b-2 border-ink` → `border-b border-ink/30`（1px + 30% 透明度）

#### 验收标准

- [ ] PageHeader 底部边框（2px 实线）明显重于 OperationBar 底部边框（1px 淡线）
- [ ] 两个区域在视觉上有清晰的层级区分
- [ ] 暗色模式下区分度同样明显

---

## 5. P2 一般改进项

### 5.1 改进项 #7：Sort 页面 SpeedControl 重复

**问题编号：** UI-007  
**优先级：** P2  
**影响页面：** 排序页  
**涉及文件：** `src/pages/SortPage.tsx`

#### 修改方案

删除第 151 行的 `<SpeedControl />`（位于 Stats Bar 中），仅保留 OperationBar 中的 SpeedControl：

```tsx
// 删除以下代码块（第 151 行）
<SpeedControl />

// 删除其后的分隔线（第 153 行）
<div className="hidden sm:block w-px h-5 bg-ink/20" />
```

#### 验收标准

- [ ] 排序页仅有一个 SpeedControl，位于 OperationBar 中
- [ ] Stats Bar 中不再显示速度控制

---

### 5.2 改进项 #8：Disabled 状态对比度不足

**问题编号：** UI-008  
**优先级：** P2  
**影响范围：** 全局所有按钮  
**涉及文件：** `src/components/OperationBar.tsx`

#### 修改方案

修改 `OperationButton` 的 disabled 样式（第 125 行）：

```tsx
// 当前
'disabled:opacity-40 disabled:cursor-not-allowed ...'

// 修改为
'disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed ...'
```

#### 验收标准

- [ ] 禁用按钮透明度 ≥ 50%
- [ ] 禁用按钮呈现灰度效果
- [ ] 在浅色和深色背景下均可辨识

---

### 5.3 改进项 #9：部分字号过小

**问题编号：** UI-009  
**优先级：** P2  
**影响范围：** 全局  
**涉及文件：** `src/components/Sidebar.tsx`、`src/components/OperationBar.tsx`、各 Page 组件

#### 修改方案

| 位置 | 文件 | 当前 | 修改为 |
|------|------|------|--------|
| Sidebar 模块计数标签 | `Sidebar.tsx:242` | `text-[10px]` | `text-xs` |
| Sidebar 主题弹出框标签 | `Sidebar.tsx:285` | `text-[9px]` | `text-[10px]` |
| Stats Bar 统计数字 | 各 Page | `text-[10px]` | `text-xs` |

具体修改：

**Sidebar.tsx 第 242 行：**
```tsx
// 当前
className="px-3 pt-3 pb-2 font-mono text-[10px] text-ink-light ..."
// 修改为
className="px-3 pt-3 pb-2 font-mono text-xs text-ink-light ..."
```

**Sidebar.tsx 第 285 行：**
```tsx
// 当前
className="font-mono text-[9px] text-ink-light ..."
// 修改为
className="font-mono text-[10px] text-ink-light ..."
```

#### 验收标准

- [ ] 全局无 `text-[9px]` 字号
- [ ] Sidebar 标签文字在移动端清晰可读
- [ ] 不影响布局（文字不会溢出容器）

---

### 5.4 改进项 #10：PageHeader 副标题 Mono 字体不协调

**问题编号：** UI-010  
**优先级：** P2  
**影响页面：** 所有 12 个数据结构子页面  
**涉及文件：** `src/components/PageHeader.tsx`

#### 修改方案

修改第 20 行，移除 `font-mono`，改用默认字体 + 字间距：

```tsx
// 当前
className="text-xs sm:text-sm text-ink-light/70 dark:text-dark-ink-light/70 mt-1.5 font-mono tracking-wide ..."

// 修改为
className="text-xs sm:text-sm text-ink-light/70 dark:text-dark-ink-light/70 mt-1.5 tracking-wider ..."
```

#### 验收标准

- [ ] 副标题使用 Noto Sans SC 字体渲染
- [ ] 中文字符间距适中，不拥挤也不过宽
- [ ] 分隔符 `·` 仍然清晰可见

---

### 5.5 改进项 #11：Zoom Controls 位置优化

**问题编号：** UI-011  
**优先级：** P2  
**影响页面：** 所有 12 个数据结构子页面  
**涉及文件：** `src/components/Visualizer.tsx`

#### 修改方案

将 Zoom Controls 从左下角移至右下角，避免与 LogPanel 展开按钮视觉冲突：

```tsx
// 第 184 行，修改定位类名
// 当前
className="absolute bottom-3 left-3 flex items-center gap-1.5 ..."

// 修改为
className="absolute bottom-3 right-3 flex items-center gap-1.5 ..."
```

同时统一按钮尺寸为 `w-9 h-9`（满足 44px 触摸目标）：

```tsx
// 第 214 行 — 缩小按钮
// 当前
className="w-9 h-9 sm:w-6 sm:h-6 ..."
// 修改为
className="w-9 h-9 ..."

// 第 225 行 — 放大按钮
// 当前
className="w-9 h-9 sm:w-6 sm:h-6 ..."
// 修改为
className="w-9 h-9 ..."
```

#### 验收标准

- [ ] Zoom Controls 位于可视化区域右下角
- [ ] 所有按钮尺寸 ≥ 36px（桌面端）/ 44px（移动端）
- [ ] 不与 LogPanel 展开按钮重叠

---

### 5.6 改进项 #12：OperationGroup 折叠状态缺乏视觉反馈

**问题编号：** UI-012  
**优先级：** P2  
**影响页面：** 使用 OperationGroup 的页面（Tree/Sort/Graph 等）  
**涉及文件：** `src/components/OperationGroup.tsx`

#### 修改方案

为折叠状态的 OperationGroup 添加视觉区分：

```tsx
// 在 OperationGroup 的触发按钮上添加样式
// 折叠状态：
className="... border-2 border-dashed border-ink/20 dark:border-dark-border/30 bg-paper-warm/50 dark:bg-slate-light/50 ..."

// 展开状态：
className="... border-2 border-ink/30 dark:border-dark-border/40 bg-paper-warm dark:bg-slate-light ..."
```

在"更多"文字旁添加箭头指示：

```tsx
<span>{isOpen ? '▾' : '▸'} {label} ({count})</span>
```

#### 验收标准

- [ ] 折叠状态有虚线边框或背景色区分
- [ ] 箭头方向正确指示展开/折叠状态
- [ ] 用户可直观识别"此处有更多操作"

---

## 6. P3 优化改进项

### 6.1 改进项 #13：首页英文比例提升

**问题编号：** UI-013  
**优先级：** P3  
**影响页面：** 首页  
**涉及文件：** `src/pages/Home.tsx`、`src/i18n/locales.ts`

#### 修改方案

在 Hero 区域添加英文副标题，在卡片描述中增加英文技术术语：

```tsx
// Home.tsx Hero 区域，在主标题后添加
<p className="text-sm font-mono text-ink-light/50 dark:text-dark-ink-light/50 tracking-widest uppercase mt-3">
  Interactive Data Structure Visualizer
</p>
```

在 `locales.ts` 中更新卡片描述，将关键技术术语改为英文：

```
// 数组
"线性数据结构 · 连续内存 · 随机访问" → "线性数据结构 · Contiguous Memory · 随机访问 O(1)"

// 栈
"后进先出 (LIFO) · 函数调用 · 括号匹配" → "后进先出 LIFO · Function Call · 括号匹配"

// 队列
"先进先出 (FIFO) · 缓冲队列 · 广度优先" → "先进先出 FIFO · Buffer Queue · BFS"
```

#### 验收标准

- [ ] 首页 Hero 区域英文占比达到 20-35%
- [ ] 卡片描述中技术术语统一使用英文
- [ ] 英文内容与中文混排协调，不显突兀

---

### 6.2 改进项 #14：Dark Mode 对比度优化

**问题编号：** UI-014  
**优先级：** P3  
**影响范围：** Dark Mode 全局  
**涉及文件：** `src/components/Sidebar.tsx`、`src/index.css`

#### 修改方案

**Sidebar 未选中项文字提亮：**

```tsx
// Sidebar.tsx 第 88 行 NAV_ITEM_INACTIVE
// 当前
'text-ink-light dark:text-dark-ink-light ...'
// 修改为
'text-ink-light dark:text-dark-ink-light/80 ...'
```

**Stats Bar 分隔线提亮：**

在各 Page 组件的 Stats Bar 分隔线处：

```tsx
// 当前
className="hidden sm:block w-px h-5 bg-ink/20"
// 修改为
className="hidden sm:block w-px h-5 bg-ink/20 dark:bg-dark-border/40"
```

#### 验收标准

- [ ] Dark Mode 下 Sidebar 未选中文字对比度 ≥ 4.5:1
- [ ] Stats Bar 分隔线在暗色背景下可见
- [ ] 不影响亮色模式显示效果

---

### 6.3 改进项 #15：整体风格向"温柔质感风"调整评估

**问题编号：** UI-015  
**优先级：** P3  
**影响范围：** 全局  
**涉及文件：** `src/index.css`、`src/utils/themeColors.ts`

#### 说明

当前 Neo-Brutalism 风格（硬边、硬阴影、高对比）与用户偏好的"温柔质感风"（柔和、粉/奶白/灰色调）存在差异。此项为**评估性改进**，需用户确认是否执行。

#### 如确认调整，修改方向

**index.css — 阴影系统：**

```css
/* 当前硬阴影 */
--shadow-card: 4px 4px 0px #1a1a2e;
--shadow-button: 2px 2px 0px #1a1a2e;

/* 修改为柔和阴影 */
--shadow-card: 0 4px 12px rgba(0,0,0,0.08);
--shadow-button: 0 2px 6px rgba(0,0,0,0.06);
--shadow-card-hover: 0 8px 24px rgba(0,0,0,0.12);
--shadow-button-hover: 0 4px 12px rgba(0,0,0,0.1);
```

**index.css — 边框系统：**

```css
/* 当前 2px 硬边 */
@utility neo-border {
  border: 2px solid var(--color-ink);
  box-shadow: var(--shadow-card);
}

/* 修改为 1px 柔和边框 */
@utility neo-border {
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: var(--shadow-card);
  border-radius: 8px;
}
```

**themeColors.ts — 色彩调整：**

| 角色 | 当前色值 | 建议色值 |
|------|----------|----------|
| Ink（主色） | `#1a1a2e` | `#4a4540`（暖灰） |
| Paper（背景） | `#faf8f5` | `#fdf9f3`（更暖） |
| 新增辅助色 | — | `#e8b4b8`（柔粉） |

> **注意：** 此项改动影响全局，需全面回归测试。建议作为独立版本迭代。

#### 验收标准（如执行）

- [ ] 所有硬阴影替换为柔和阴影
- [ ] 边框从 2px 硬边改为 1px 柔和边框
- [ ] 色彩系统引入暖灰 + 柔粉调
- [ ] 全部 13 个页面视觉风格统一
- [ ] Dark Mode 同步调整

---

## 7. 改动影响范围矩阵

| 改进项 | 涉及文件 | 改动类型 | 影响页面数 | 回归测试范围 |
|--------|----------|----------|-----------|-------------|
| #1 可视化空间 | `Visualizer.tsx` | 样式调整 | 12 | 所有子页面可视化区域 |
| #2 LogPanel 风格 | `LogPanel.tsx` | 样式重写 | 12 | 所有子页面日志面板 |
| #3 移动端操作栏 | `OperationBar.tsx` + 12 Page + `Visualizer.tsx` + `index.css` | 结构调整 | 12 | 移动端全页面 |
| #4 首页卡片色彩 | `Home.tsx` | 数据调整 | 1 | 首页 |
| #5 EmptyState 风格 | `EmptyState.tsx` | 样式调整 | 12 | 所有子页面空状态 |
| #6 视觉层次 | `OperationBar.tsx` | 样式调整 | 12 | 所有子页面顶部区域 |
| #7 SpeedControl 重复 | `SortPage.tsx` | 代码删除 | 1 | 排序页 |
| #8 Disabled 对比度 | `OperationBar.tsx` | 样式调整 | 12 | 全局按钮禁用态 |
| #9 字号过小 | `Sidebar.tsx` + 各 Page | 样式调整 | 13 | 全局文字可读性 |
| #10 副标题字体 | `PageHeader.tsx` | 样式调整 | 12 | 所有子页面标题区 |
| #11 Zoom Controls | `Visualizer.tsx` | 位置 + 尺寸 | 12 | 所有子页面缩放功能 |
| #12 OperationGroup | `OperationGroup.tsx` | 样式调整 | 3-4 | 使用折叠组的页面 |
| #13 英文比例 | `Home.tsx` + `locales.ts` | 内容调整 | 1 | 首页 |
| #14 Dark Mode 对比度 | `Sidebar.tsx` + 各 Page | 样式调整 | 13 | Dark Mode 全局 |
| #15 风格调整 | `index.css` + `themeColors.ts` | 系统级调整 | 13 | 全局（需全面回归） |

---

## 8. 验收标准

### 8.1 通用验收标准

- [ ] 所有改动在 `npm run build` 后无编译错误
- [ ] 所有改动在 `npm run lint` 后无 lint 警告
- [ ] 所有改动在 `npm run test:run` 后测试全部通过（1133 tests）
- [ ] 亮色模式与暗色模式均正常显示
- [ ] Desktop（1920×1080）与 Mobile（375×812）均正常显示
- [ ] 不引入新的 TypeScript 类型错误

### 8.2 功能验收标准

- [ ] 可视化区域的缩放、平移功能不受影响
- [ ] 所有操作按钮的点击、禁用、hover 状态正常
- [ ] 动画播放/停止功能不受影响
- [ ] localStorage 数据持久化不受影响
- [ ] 键盘快捷键功能不受影响
- [ ] 导出/导入/分享功能不受影响

### 8.3 视觉验收标准

- [ ] Neo-Brutalism 风格特征保持一致（P0-P2 改动）
- [ ] 所有组件边框、阴影、圆角风格统一
- [ ] 文字最小字号 ≥ 10px，正文 ≥ 12px
- [ ] 禁用状态对比度 ≥ 3:1（WCAG 2.1 AA）
- [ ] 普通文字对比度 ≥ 4.5:1（WCAG 2.1 AA）

---

## 9. 风险说明

### 9.1 低风险改动

| 改进项 | 风险等级 | 说明 |
|--------|----------|------|
| #4 首页卡片色彩 | 低 | 仅修改颜色索引映射，不影响功能 |
| #7 SpeedControl 重复 | 低 | 仅删除重复组件，不影响功能 |
| #8 Disabled 对比度 | 低 | 仅调整透明度数值 |
| #9 字号调整 | 低 | 仅调整字号 class，不影响布局 |
| #10 副标题字体 | 低 | 仅移除 font-mono class |
| #13 英文比例 | 低 | 仅修改文案内容 |
| #14 Dark Mode 对比度 | 低 | 仅调整透明度数值 |

### 9.2 中风险改动

| 改进项 | 风险等级 | 风险说明 | 缓解措施 |
|--------|----------|----------|----------|
| #1 可视化空间 | 中 | 动态高度可能影响某些数据结构的渲染位置 | 分数据量档位测试 |
| #2 LogPanel 风格 | 中 | 大量样式修改，可能遗漏某些状态 | 逐项对照截图验证 |
| #5 EmptyState 风格 | 中 | 移除 backdrop-blur 可能在某些浏览器表现不同 | 跨浏览器测试 |
| #6 视觉层次 | 中 | 边框减弱可能在某些屏幕上不明显 | 多分辨率测试 |
| #11 Zoom Controls | 中 | 位置变更可能影响用户习惯 | 保留功能完整性 |
| #12 OperationGroup | 中 | 新增视觉元素可能影响布局 | 测试折叠/展开状态 |

### 9.3 高风险改动

| 改进项 | 风险等级 | 风险说明 | 缓解措施 |
|--------|----------|----------|----------|
| #3 移动端操作栏 | 高 | 涉及 12 个 Page 组件的结构调整 | 逐页面修改 + 逐个验证 |
| #15 风格调整 | 高 | 系统级改动，影响全局视觉 | 作为独立版本迭代，全面回归测试 |

### 9.4 依赖关系

```
#3 移动端操作栏
  ├── 依赖 #1 可视化空间（ColorLegend 移至 Visualizer）
  └── 依赖 #11 Zoom Controls（位置调整需协调）

#6 视觉层次
  └── 与 #2 LogPanel 风格 协同（整体视觉统一）

#15 风格调整
  └── 独立迭代，建议在其他改动完成后再执行
```

---

> **文档结束**  
> 下一步：审批后按 P0 → P1 → P2 → P3 顺序执行改进
