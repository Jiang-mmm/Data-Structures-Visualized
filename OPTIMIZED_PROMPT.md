# 优化后的提示词 - 发给 MiMo Code 使用

---

## 任务概述

对数据结构学习助手项目（`D:\VibeCoding\数据结构学习助手3`）进行全面审查和修复，共 7 个问题。项目技术栈：React 19 + Vite + TypeScript + D3.js + Tailwind CSS，Neo-Brutalist 设计风格。

开始前请先通读 `CLAUDE.md` 了解项目架构和约定，然后按以下顺序逐一修复。

---

## 问题 1：主页左下角四个模式按钮点了没实际效果

**位置：** `src/components/Sidebar.tsx` 底部区域（约 210-229 行）

**现象：** 侧边栏底部有颜色主题切换按钮（4 个色块），点击后有视觉反馈（hover 效果），但主题颜色实际没有变化。

**排查方向：**
- 检查 `handleColorThemeChange` 函数（113-118 行）是否正确调用了 `setColorTheme(themeKey)`
- 检查 `src/utils/themeColors.ts` 中的 `setTheme` 函数是否正确写入 CSS 变量到 DOM
- 检查 `initTheme()` 是否在组件挂载时被正确调用
- 确认 theme 切换后，CSS 变量（如 `--color-ink`、`--color-paper` 等）是否实际更新到 `<html>` 或 `<body>` 元素上
- 同时检查侧边栏底部的另外两个按钮：语言切换（`setLanguage`）和明暗模式切换（`cycle`）是否也有类似问题

**修复要求：** 点击颜色主题按钮后，整个应用的配色方案应立即切换，无需刷新页面。

---

## 问题 2：二叉树的动画效果改为堆的风格

**位置：**
- 树可视化：`src/visualizers/treeVisualizer.ts`
- 堆可视化：`src/visualizers/heapVisualizer.ts`（作为参考）

**现象：** 二叉树的渲染和动画效果与堆的风格不一致。

**具体要求：**
- 参考 `heapVisualizer.ts` 的渲染风格（节点样式、颜色使用、边的绘制方式、标签布局等），统一二叉树的视觉风格
- 堆可视化中，节点下方显示了索引 `[0]`、`[1]` 等标签，树也可以考虑增加类似的信息标签
- 堆的边有堆违规检测（红色虚线），树也可以增加 BST 性质违规的视觉提示
- 动画风格上保持一致：节点高亮方式、缩放弹跳效果、涟漪效果等
- 保持树的拖拽功能和遍历动画不变，只统一视觉风格

---

## 问题 3：字典树（Trie）动画有问题

**位置：** `src/visualizers/trieVisualizer.ts`

**现象：** 字典树的动画显示异常，视觉效果很奇怪。

**排查方向：**
- 检查 `layout` 函数（28-77 行）的布局算法，特别是递归的 `layoutLevel` 函数的坐标计算是否正确
- 检查 `minX` 和 `maxX` 参数的传递：在递归调用时 `layoutLevel(childId, x, level + 1, minX + childWidth * i, minX + childWidth * (i + 1))` —— 这里的区间划分可能有重叠或计算错误
- 检查节点 ID 的生成方式（`root-${child.prefix}`）是否唯一且一致
- 检查 `buildPath` 函数（174-182 行）生成的路径 ID 是否与渲染时的节点 ID 匹配
- 检查动画函数 `animateInsertTrie`、`animateSearchTrie`、`animateDeleteTrie` 中 `getPathNodes` 的选择器是否正确匹配了 DOM 中的节点
- 注意：渲染时使用了 `gradUrl('node-root')`、`gradUrl('node-leaf')` 等渐变填充，确保 `themeColors.ts` 中的渐变定义存在

**修复要求：** 字典树应该正确显示为树状结构，每个节点显示对应字符，边上有字符标签，动画应该沿路径高亮传播。

---

## 问题 4：学习模式下内容看不到，无法滚动

**位置：** 所有使用学习模式的页面，例如：
- `src/pages/TreePage.tsx`（200-229 行）
- `src/pages/HeapPage.tsx`（145-175 行）
- `src/pages/TriePage.tsx`（188-218 行）

**现象：** 点击"学习模式"按钮后，StepExplainer 组件显示在页面底部，但内容可能被截断，且页面无法向下滚动查看完整内容。

**根本原因分析：**
- 这些页面使用了 `className="flex flex-col h-screen"` 作为根容器，限制了高度为视口高度
- 内部的 Visualizer 使用了 `flex-1` 和 `min-h-[200px]` 等，占据了大量空间
- 学习模式的内容（StepExplainer）被挤在底部，没有足够的空间显示
- `LogPanel` 在学习模式下方进一步压缩了空间

**修复方案建议：**
- 当学习模式展开时，Visualizer 区域应该缩小（比如改为 `max-h-[300px]` 或允许被压缩）
- 或者将学习模式内容放在一个可独立滚动的区域中
- 或者将页面根容器从 `h-screen` 改为 `min-h-screen`，允许页面整体滚动
- StepExplainer 组件本身（`src/components/StepExplainer.tsx`）已经有 `max-h-48 overflow-y-auto` 的代码区域，但整体容器没有滚动

**参考：** `GraphAlgorithmPage.tsx` 的学习模式布局（234-247 行）是将 StepExplainer 放在右侧栏中，这个设计比较好，可以作为参考。

---

## 问题 5：图算法页面多个问题

**位置：** `src/pages/GraphAlgorithmPage.tsx`

### 5a：运行后动画重置
**现象：** 点击"运行"按钮后，图的动画播放完毕，但图的布局会重置回初始状态。

**原因：** `handleGraphRender` 函数（61-65 行）在每次渲染时都会重新创建力导向图。当 `Visualizer` 组件检测到 `data` 或 `isDark` 变化时会重新调用 `renderFn`，导致图被重新布局。

**修复方向：**
- 动画完成后，保持图的当前布局状态，不要重新渲染
- 可以在动画完成后设置一个标志位，阻止 Visualizer 重新渲染
- 或者将 `renderGraph` 的调用与动画分离，只在初始化时调用一次

### 5b：ABCDEF 按钮功能
**现象：** 页面上有 A-F 六个节点选择按钮，用于选择起始节点。需要确认这些按钮是否正常工作，并且视觉上与整体设计一致。

### 5c：运行按钮无动态可视化效果
**现象：** 点击"运行"按钮后，没有看到动画效果。

**排查方向：**
- 检查 `handleRun` 函数（72-119 行）中 `animateBFS`、`animateDFS`、`animateDijkstra` 的调用是否正确
- 注意：代码中先执行了算法（`bfs(adjacencyList, startNode, onStep)`），然后才调用动画函数（`animateBFS`）。算法执行是同步的，动画是异步的。需要确认算法执行完成后，图的 DOM 状态是否正确
- 检查 `graphVisualizer.ts` 中 `animateTraversalOrder` 函数（303-347 行）是否能正确选择到节点元素
- 关键问题：`renderGraph` 使用力导向模拟（force simulation），节点位置是动态的。动画函数中通过 `d.id` 过滤节点，但如果模拟尚未稳定，节点位置可能不正确

### 5d：学习模式设计优化
**好评：** 图算法页面的学习模式设计很好（小巧且内容饱满），请将这种设计风格推广到其他子页面的学习模式中。

---

## 问题 6：算法对比界面图标重新设计

**位置：** `src/pages/SortComparePage.tsx`（344-377 行）以及排序算法定义文件

**现象：** 算法对比界面中的排序算法图标（emoji）看起来太 AI 生成感，需要重新设计。

**排查方向：**
- 找到排序算法的定义文件（`src/algorithms/sorting/index.ts`），查看每个算法的 `icon` 属性
- 当前使用的是 emoji 图标（如 🔀、📊 等），需要改为更精致的图标方案
- 同时检查 `SortComparePage.tsx` 中算法选择网格的样式（344-377 行），确保图标与 Neo-Brutalist 设计风格一致

**设计建议：**
- 使用简单的 Unicode 符号或 CSS 绘制的几何图标，而非 emoji
- 保持与首页卡片图标风格一致（首页使用的是 ▦、☰、→、∞ 等简洁符号）
- 每个算法可以用与其特性相关的简单符号，如：冒泡排序用 ○↑、选择排序用 ☐→、插入排序用 ↙ 等
- 也可以考虑用 SVG 小图标或 CSS 绘制的迷你柱状图

**同时修复：** 检查项目中所有其他使用 emoji 的图标位置（如 SortPage、GraphPage 等），统一替换为更精致的图标方案。

---

## 问题 7：所有界面统一首页的设计风格

**位置：** 所有页面

**现象：** 首页（`src/pages/Home.tsx`）有非常好的 Neo-Brutalist 设计，但其他子页面的视觉风格不一致。

**首页的设计特征（需要推广到所有页面）：**
1. **背景：** `bg-paper dark:bg-dark-paper grain` 带纹理的纸张背景
2. **卡片风格：** `border-2 border-ink` 硬边框 + `shadow-[3px_3px_0px_#1a1a2e]` 硬阴影
3. **颜色系统：** 使用 `accent-blue`、`accent-violet`、`accent-teal` 等主题色
4. **字体层级：** 标题用 `font-black tracking-tight`，正文用 `font-mono text-xs`
5. **交互反馈：** `hover:-translate-y-1.5` 浮起效果 + `active:translate-x-[1px] active:translate-y-[1px] active:shadow-none` 按下效果
6. **装饰元素：** 彩色圆点、渐变图标背景、角标等
7. **间距节奏：** 大量留白，`px-6 py-16` 的宽松间距

**需要统一的页面：**
- `ArrayPage.tsx`、`StackPage.tsx`、`QueuePage.tsx`、`LinkedListPage.tsx`（基础数据结构）
- `TreePage.tsx`、`GraphPage.tsx`、`HashPage.tsx`、`HeapPage.tsx`、`TriePage.tsx`（高级数据结构）
- `SortPage.tsx`、`SortComparePage.tsx`（排序）
- `GraphAlgorithmPage.tsx`（图算法）

**具体统一内容：**
- PageHeader 的图标样式统一（目前已有渐变背景，确认所有页面一致）
- OperationBar 的按钮风格统一（已有，确认无遗漏）
- Visualizer 区域的边框和阴影统一
- 学习模式的按钮和面板风格统一
- LogPanel 和 Timeline 的风格统一
- 空状态（EmptyState）的风格统一
- 底部信息栏的风格统一

---

## 执行注意事项

1. **先读后改：** 修改任何文件前，先完整阅读该文件，理解现有逻辑
2. **保持测试通过：** 项目有 1133 个测试，修改后运行 `npm run test:run` 确认无回归
3. **不要引入新依赖：** 所有修复应基于现有技术栈完成
4. **保持 i18n：** 所有用户可见文本必须使用 `t()` 函数，不能硬编码中文
5. **遵循项目约定：** 参考 `CLAUDE.md` 中的开发约定
6. **动画引擎：** 所有动画必须通过 `src/utils/animationEngine.ts` 的 `duration()` 函数控制时长，不能写死时间
7. **渐进修复：** 每修复一个问题，确认该问题解决后再进入下一个
