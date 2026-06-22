# 借鉴计划与功能拓展归档

> **整理日期:** 2026-06-21
> **来源文档:**
> - `docs/借鉴计划-数据结构学习助手2.md` (v1.0, 2026-06-18)
> - `docs/功能拓展计划-修订版.md` (v2.0, 2026-06-19)
> - `docs/项目视觉设计审查报告.md` (v1.0, 2026-06-18)
> **状态:** 大部分 P1 借鉴目标已落地，AVL 树/全局搜索/红黑树/跳表/并查集 已实施

---

## 目录

1. [双项目现状对比（v1.0）](#双项目现状对比v10)
2. [可借鉴功能清单（v1.0）](#可借鉴功能清单v10)
3. [v2.0 修订版：判断、调整、舍弃](#v20-修订版判断调整舍弃)
4. [v1.0 计划修正说明](#v10-计划修正说明)
5. [项目视觉设计审查（v1.0）](#项目视觉设计审查v10)
6. [长期 UI 美化迭代计划](#长期-ui-美化迭代计划)
7. [实施状态总览（截至 v13.0.0-rc1）](#实施状态总览截至-v1300-rc1)

---

## 双项目现状对比（v1.0）

> **编制日期：** 2026-06-18

| 维度 | 数据结构学习助手3（当前） | 数据结构学习助手2（参考） |
|------|---------------------------|---------------------------|
| **技术栈** | React 19 + Vite 8 + TypeScript 5.8（strict）+ Tailwind CSS v4 + React Router v7 | React 18 + Vite 5 + JavaScript + Tailwind CSS v3 + React Router v6 |
| **核心架构** | 六层架构：`Entry → Pages → Components → Hooks → Visualizers → Algorithms/Utils` | `Page → Components → Hooks → Visualizers/Algorithms` 扁平化 |
| **状态管理** | 自定义 Hooks + `useHistory`（useRef 栈）+ `useDataStructureState`（持久化/日志/动画锁基座） | 自定义 Hooks + Context（Settings/Speed/Theme）+ `useUndoRedo` |
| **可视化策略** | D3 全清+全绘 + `viewBox` + `animationEngine` 集中时序控制 | D3 data join（enter/update/exit）+ `action` 驱动高亮 |
| **数据结构覆盖** | 11 种：数组、栈、队列、链表、二叉树、图、排序、哈希表、堆、字典树、算法对比 | 30+ 页面：含 AVL、B 树、红黑树、跳表、并查集、线段树、树状数组、稀疏表、布隆过滤器、LRU、斐波那契堆等 |
| **图算法覆盖** | BFS/DFS/Dijkstra/拓扑/Bellman-Ford/Floyd-Warshall/Prim/Kruskal（代码已存在） | Dijkstra/Bellman-Ford/Floyd/Prim/Kruskal/A*/拓扑/关键路径/并查集 |
| **教学辅助** | 学习模式 25 配置、学习路径、进度概览、智能推荐、内容分层 | 测验、成就、笔记/收藏、复习提醒、应用场景、代码面板、引导提示、学习路径力图 |
| **交互体验** | 撤销/重做、Timeline、键盘快捷键、导入导出、分享、主题/i18n | 全局搜索、设置面板、导出代码/截图/日志、底部导航、动画录制回放、步骤单步执行 |
| **性能优化** | 全清渲染大数据跳动画、FPS 自适应、时间分片、`vendor-react/d3` 分包 | Web Worker 排序、rafThrottle、虚拟滚动、批量渲染调度、sliceRender |
| **测试/工程** | 2866 单元测试 + Playwright E2E + CI/CD + Bundle 预算 + PWA + Sentry | Vitest 单元测试 + Playwright + ESLint/Prettier，代码分割较基础 |

**核心结论：** 当前项目工程化、类型安全、测试、文档和无障碍更成熟；参考项目在教学闭环、算法广度、交互丰富度、性能工具方面具备显著优势。借鉴方向应以"补能力、不破坏现有架构"为原则。

---

## 可借鉴功能清单（v1.0）

> 优先级规则：P1 = 高价值且可快速融入；P2 = 高价值但需较大改造；P3 = 体验增强/长期储备。

### 2.1 全局交互与教学辅助（P1）

| 特性 | 来源（项目2） | 当前缺口 | 借鉴价值 | 优先级 | 估算工时 |
|------|--------------|----------|----------|--------|----------|
| **全局搜索 GlobalSearch** | `src/components/GlobalSearch.jsx` + `src/data/searchIndex.js` | 侧边栏无搜索，13+ 页面靠手动滚动 | 快速跳转到任意数据结构与算法 | P1 | 1-2 天 |
| **设置面板 SettingsPanel** | `src/components/SettingsPanel.jsx` + `src/contexts/SettingsContext.jsx` | 仅有主题/语言/速度入口，无统一面板 | 统一字体、代码主题、动画预设、复杂度标签等 | P1 | 2-3 天 |
| **操作引导 GuideTooltip / GuidedTutorial** | `src/components/GuideTooltip.jsx` / `GuidedTutorial.jsx` | 无新手引导，首次使用靠摸索 | 首次进入页面高亮关键操作，降低流失率 | P1 | 2 天 |
| **统一导出菜单 ExportMenu** | `src/components/ExportMenu.jsx` + `src/utils/exportUtils.js` | 仅有数据 JSON/CSV 导入导出 | 导出 SVG 为 PNG、导出操作日志、导出当前代码片段 | P1 | 2-3 天 |
| **底部导航 BottomNav** | `src/components/BottomNav.jsx` | 移动端为侧边栏抽屉，无底部 Tab | 移动端单手操作更友好 | P2 | 1-2 天 |

### 2.2 学习闭环增强（P1-P2）

| 特性 | 优先级 | 估算工时 |
|------|--------|----------|
| **测验系统 Quiz** | P1 | 3-4 天 |
| **成就系统 Achievements** | P2 | 3 天 |
| **复习提醒 Review（SM-2）** | P2 | 4-5 天 |
| **笔记/收藏 Notes & Bookmark** | P2 | 2-3 天 |
| **应用场景 ApplicationScenarios** | P2 | 2 天 |
| **学习路径力图 LearningPathPage** | P2 | 3-4 天 |

### 2.3 可视化与动画能力（P2）

| 特性 | 优先级 | 估算工时 |
|------|--------|----------|
| **动画录制与回放 AnimationRecorder** | P2 | 4-5 天 |
| **步骤单步执行 StepAnimation** | P2 | 4 天 |
| **代码面板 CodePanel** | P2 | 2-3 天 |
| **rafThrottle / 批量渲染调度** | P2 | 2 天 |

### 2.4 算法与数据结构扩展（P1-P2）

| 类别 | 具体项 | 优先级 | 估算工时 |
|------|--------|--------|----------|
| **高级树结构** | AVL 树 | P1 | 4-5 天 |
| | 红黑树 | P1 | 5-6 天 |
| | B 树 | P2 | 5-7 天 |
| **高级线性/索引结构** | 跳表 SkipList | P1 | 3-4 天 |
| | 并查集 Union-Find | P1 | 3 天 |
| | 线段树 Segment Tree | P2 | 5-6 天 |
| | 树状数组 BIT | P2 | 4-5 天 |
| | 稀疏表 Sparse Table | P2 | 4 天 |
| | 布隆过滤器 Bloom Filter | P2 | 3-4 天 |
| **实用结构** | LRU Cache | P2 | 3-4 天 |
| | 斐波那契堆 | P3 | 5-7 天 |
| **字符串算法** | KMP / Manacher / Rabin-Karp | P2 | 4-5 天/项 |
| **图算法** | A* 寻路 / 关键路径法 CPM | P2 | 4-5 天/项 |

### 2.5 性能与工程能力（P2-P3）

| 特性 | 优先级 | 估算工时 |
|------|--------|----------|
| **Web Worker 排序** | P2 | 3-4 天 |
| **虚拟滚动 LogPanel / Timeline** | P2 | 2-3 天 |
| **页面骨架屏 PageSkeleton** | P3 | 1-2 天 |
| **生产环境 console 清理** | P3 | 0.5 天 |

---

## v2.0 修订版：判断、调整、舍弃

> **编制日期：** 2026-06-19
> **修订依据：** 基于对两个项目源码的逐文件审查，修正 v1.0 计划中与当前架构不符的判断
> **核心原则：** 只借鉴功能内容，不借鉴 UI 设计（当前 Neo-Brutalist 风格保持不变）

### 2.1 数据结构与算法扩展（核心功能借鉴）

| 功能 | 判断 | 优先级 | 估算工时 | 实际状态 |
|------|------|--------|----------|----------|
| **AVL 树** | 调整 | P1 | 4-5 天 | ✅ v11.0.1 已完成 |
| **红黑树** | 调整 | P1 | 5-6 天 | ✅ v12.0 已完成 |
| **跳表 SkipList** | 调整 | P1 | 3-4 天 | ✅ v12.0 已完成 |
| **并查集 Union-Find** | 调整 | P1 | 3 天 | ✅ v12.0 已完成 |
| **B 树** | 调整 | P2 | 5-7 天 | ⏳ 未开始 |
| **线段树** | 调整 | P2 | 5-6 天 | ⏳ 未开始 |
| **树状数组 BIT** | 调整 | P2 | 4-5 天 | ⏳ 未开始 |
| **稀疏表** | 调整 | P2 | 4 天 | ⏳ 未开始 |
| **布隆过滤器** | 调整 | P2 | 3-4 天 | ⏳ 未开始 |
| **LRU Cache** | 调整 | P2 | 3-4 天 | ⏳ 未开始 |
| **斐波那契堆** | 舍弃 | P3 | 5-7 天 | ❌ 舍弃（consolidate 动画过于复杂） |
| **KMP/Manacher/Rabin-Karp** | 调整 | P2 | 4-5 天/项 | ⏳ 未开始 |
| **A* 寻路** | 调整 | P2 | 4-5 天 | ⏳ 未开始 |
| **关键路径 CPM** | 调整 | P2 | 4-5 天 | ⏳ 未开始 |

### 2.2 全局交互与教学辅助

| 功能 | 判断 | 优先级 | 估算工时 | 实际状态 |
|------|------|--------|----------|----------|
| **全局搜索 GlobalSearch** | 保留 | P1 | 1-2 天 | ✅ v12.0 已完成 |
| **设置面板 SettingsPanel** | 调整 | P1 | 2-3 天 | ⏳ 未开始 |
| **新手引导 GuideTooltip** | 保留 | P1 | 2 天 | ⏳ 未开始 |
| **导出增强 ExportMenu** | 调整 | P1 | 2-3 天 | ⏳ 未开始 |
| **底部导航 BottomNav** | 舍弃 | - | - | ❌ 舍弃（与 Neo-Brutalist 风格冲突） |

### 2.3 学习闭环增强

| 功能 | 判断 | 优先级 | 估算工时 | 实际状态 |
|------|------|--------|----------|----------|
| **测验系统 Quiz** | 保留 | P1 | 3-4 天 | ⏳ 未开始 |
| **成就系统 Achievements** | 调整 | P2 | 3 天 | ⏳ 未开始 |
| **复习提醒 Review（SM-2）** | 调整 | P2 | 4-5 天 | ⏳ 未开始 |
| **笔记/收藏** | 保留 | P2 | 2-3 天 | ⏳ 未开始 |
| **应用场景 ApplicationScenarios** | 调整 | P2 | 2 天 | ⏳ 未开始 |
| **学习路径力图** | 调整 | P2 | 3-4 天 | ⏳ 未开始 |

### 2.4 可视化与动画能力

| 功能 | 判断 | 优先级 | 估算工时 | 实际状态 |
|------|------|--------|----------|----------|
| **动画录制回放** | 调整 | P2 | 4-5 天 | ⏳ 未开始 |
| **步骤单步执行** | 调整 | P2 | 4 天 | ⏳ 未开始 |
| **代码面板 CodePanel** | 调整 | P2 | 2-3 天 | ⏳ 未开始 |
| **rafThrottle** | 保留 | P2 | 2 天 | ⏳ 未开始 |

### 2.5 性能与工程能力

| 功能 | 判断 | 优先级 | 估算工时 | 实际状态 |
|------|------|--------|----------|----------|
| **Web Worker 排序** | 调整 | P2 | 3-4 天 | ⏳ 未开始 |
| **虚拟滚动** | 调整 | P2 | 2-3 天 | ⏳ 未开始 |
| **页面骨架屏** | 保留 | P3 | 1-2 天 | ⏳ 未开始 |
| **生产 console 清理** | 保留 | P3 | 0.5 天 | ⏳ 未开始 |

### v2.0 关键技术适配要点

#### 数据表示模式选择

| 数据结构类型 | 表示模式 | 参考文件 | 适用场景 |
|-------------|---------|---------|---------|
| 线性结构 | `number[]` | `useArrayState.ts` | 数组/栈/队列/堆/排序 |
| 完全二叉树 | `number[]`（索引 2i+1/2i+2） | `useTreeState.ts` | BST/线段树/树状数组 |
| 递归结构 | 对象引用 + 不可变更新 | `useTrieState.ts` | Trie/AVL/红黑树/B 树 |
| 图结构 | `{ nodes, links }` | `useGraphState.ts` | 图/并查集/A*/CPM |
| 扁平化结构 | `{ nodes, edges }` | Trie 的 `flattenTrie` 函数 | 跳表/稀疏表 |

**AVL/红黑树关键决策：** 必须采用递归对象表示（参考 TrieNode），因为旋转操作在数组索引表示下极其复杂且易错。

#### 状态基座接入规范

所有新增数据结构必须继承 `useDataStructureState`：

```typescript
// 标准接入模式（参考 useTrieState）
export function useAvlTreeState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<AvlNode>(buildInitialTree(), { storageKey: 'avl-tree' })

  const insert = useCallback((value: number) => {
    const newData = insertAvl(data, value)  // 不可变更新
    push(newData)
    addLog('oper', tStatic('hooks.avlLogInsert').replace('{value}', String(value)))
    showToast({ type: 'success', message: tStatic('hooks.avlInsertSuccess') })
  }, [data, push, addLog])

  return { data, logs, isAnimating, setIsAnimating, insert, /* ... */ }
}
```

**硬性约束：**
- 禁止引入第二套状态管理体系（禁止独立 Context）
- 禁止使用 `useUndoRedo`（参考项目的双历史栈会冲突）
- 所有操作必须不可变更新（`push` 新对象，不修改原对象）

#### 可视化器规范

新增可视化器必须遵循 `treeVisualizer.ts` 模式：

```typescript
// 必须导入
import { select } from '../utils/d3Imports'                    // 单一 D3 入口
import { duration, EASING, transitionEnd, measureRender, type Animation } from '../utils/animationEngine'
import { getColors, detectDarkMode, ensureGradientDefs, gradUrl } from '../utils/themeColors'
import { getLargeDataThreshold } from '../utils/performanceConfig'
import { tStatic } from '../i18n/useI18n'

// 渲染函数：全清 + 全绘
export function renderAvlTree(svg: SVGSVGElement, data: AvlNode, options: AvlTreeOptions) {
  return measureRender('renderAvlTree', () => {
    const container = select(svg)
    container.selectAll('*').interrupt()
    container.selectAll('*').remove()                          // 全清
    ensureGradientDefs(svg, isDark)
    // ... 全绘逻辑
  })
}

// 动画函数：检查 abort + 大数据跳过
export async function animateInsertAvl(svg, value, data, options, anim?: Animation) {
  if (nodeCount > getLargeDataThreshold('tree')) return        // 大数据跳过
  // ... 每步检查
  if (anim?.isAborted?.()) return
}
```

---

## v1.0 计划修正说明

| v1.0 判断 | 修正后判断 | 修正原因 |
|-----------|-----------|---------|
| 底部导航 BottomNav（P2） | 舍弃 | 与 Neo-Brutalist 风格冲突，当前移动端抽屉已足够 |
| 斐波那契堆（P3） | 舍弃 | consolidate 动画过于复杂，教学收益有限 |
| AVL 用数组索引表示 | 调整为递归对象表示 | 旋转操作在数组索引表示下极其复杂，参考 TrieNode 模式更清晰 |
| 应用场景新建组件 | 调整为扩展现有 ContentTier | 当前 ContentTier 已有 realWorldApplications 配置，无需新建 |
| 学习路径力图复用 graphVisualizer | 确认可行 | 已验证 graphVisualizer 支持力导向布局 |
| 设置面板新建 Context | 调整为扩展现有 useGlobalSettings | 硬性约束禁止第二套 Context |

---

## 项目视觉设计审查（v1.0）

> **审查日期：** 2026-06-18
> **审查维度：** 视觉一致性、响应式适配、色彩系统、字体层级、组件样式、布局合理性、交互反馈、视觉性能

### 执行摘要

本次审查针对 ds-visualizer 进行了全面的视觉设计与实现代码审查。项目整体采用 Neo-Brutalist（新粗野主义）风格，硬边框、硬阴影、高对比度的设计语言鲜明，组件库（OperationBar / OperationGroup / Visualizer / EmptyState 等）已经具备较完整的交互与暗色模式支持，动画引擎也实现了 FPS 监控、性能模式降级与 `prefers-reduced-motion` 适配，基础扎实。

但在细节层面仍存在 **29 项可改进问题**：视觉 token 体系尚未完全统一，圆角/阴影/边框存在多轨并行；响应式布局在移动端存在 100vh 与操作栏滚动提示不足的问题；色彩主题切换仅改变强调色而未改变整体氛围；部分文字对比度（尤其是 placeholder、disabled、半透明标签）未达到 WCAG AA 标准；缺少统一的 Button / Card 原子组件；可视化器采用"全量清空重绘"策略，大数据集下存在性能隐患；部分动画直接驱动 width/height/x/y 等布局属性，易触发重排。

建议优先完成基础组件抽象、对比度修复、视口单位修正与性能降级策略细化，再逐步推进 design token 体系、动画引擎重构与高级主题系统。

### 问题维度分类

#### 1.1 视觉一致性（4 项问题）
1. 圆角体系不统一
2. 硬阴影与软阴影双轨并行
3. 边框风格不一致
4. 按钮变体命名以颜色而非语义驱动

#### 1.2 响应式设计适配性（4 项问题）
5. 页面仍使用 h-screen 而非 100dvh
6. 移动端操作栏横向滚动提示不足
7. 小屏下可能出现双重滚动与层级冲突
8. Hero 大标题在小屏存在折行/溢出风险

#### 1.3 色彩系统应用（4 项问题）
9. Placeholder 文字对比度不足
10. Disabled 状态对比度偏低
11. 主题切换只改变强调色，整体氛围未变
12. 半透明文字在浅色背景上对比度不达标

#### 1.4 字体层级结构（3 项问题）
13. SVG 内部硬编码字体族
14. 正文行宽未受控
15. 标题 letter-spacing 过紧

#### 1.5 组件样式实现（4 项问题）
16. 缺少统一的 Button / Card 原子组件
17. 空状态使用 Unicode 符号作为图标
18. 输入框 focus 样式与全局焦点环不一致
19. 操作按钮缺少 loading / busy 状态样式

#### 1.6 布局合理性（3 项问题）
20. 右侧边栏在大屏显得空旷且固定宽度
21. 主内容区缺少全局最大宽度约束
22. 卡片网格布局通用感较强

#### 1.7 交互反馈效果（3 项问题）
23. 部分小按钮焦点状态不明显
24. 禁用元素未使用 aria-disabled / aria-busy
25. 动画触发与状态机边界不够清晰

#### 1.8 视觉性能优化（4 项问题）
26. 可视化器采用全量清空重绘策略
27. 数组动画直接驱动布局属性
28. 力导向图 tick 直接更新 line 属性
29. 复杂度图表在尺寸变化时重复计算

### 问题统计
- 第一部分共列出 **29 项**具体问题，覆盖全部 8 个审查维度。
- 其中 **P0 级改进项 3 项**（基础组件抽象、对比度修复、可视化性能降级），已在迭代计划中明确排期。

---

## 长期 UI 美化迭代计划

### 2.1 短期（1–2 周）

| 优先级 | 目标 | 具体优化方向 | 实际状态 |
|--------|------|--------------|----------|
| **P0** | 建立统一原子组件 | 新增 Button.tsx / Card.tsx，将 OperationButton 收敛为工具栏变体；统一按钮语义变体命名 | ⏳ 部分（Code Style P1-P6 阶段实施） |
| **P0** | 修复可访问性对比度 | 调整 placeholder / disabled / 半透明副文本的透明度或颜色 | ⏳ 进行中（v11 实施） |
| **P1** | 修正视口单位与滚动策略 | 将 h-screen 替换为 h-dvh / min-h-dvh；移动端侧边栏打开时锁定 body 滚动 | ✅ v9.0 已完成 |
| **P1** | 统一焦点与加载反馈 | 为所有可交互元素使用一致焦点环；为按钮增加 isLoading / aria-busy 状态 | ✅ v9.0/v10.0 已完成 |

### 2.2 中期（1–2 月）

| 优先级 | 目标 | 具体优化方向 | 实际状态 |
|--------|------|--------------|----------|
| **P0** | 可视化性能降级策略 | 对数组/树/图分别设定"大数据阈值"，超过后切静态渲染或 Canvas | ✅ v12.0 已完成（performanceConfig.ts） |
| **P1** | 构建完整 Design Token 体系 | 使用 OKLCH 或 HSL 定义 paper / ink / surface / accent / muted / border 等 token | ⏳ 进行中 |
| **P1** | 统一圆角/阴影/边框规范 | 移除 border-l-4 侧条与 border-dashed；定义 --radius-* 与 --shadow-* token | ⏳ 进行中 |
| **P2** | 响应式操作面板重构 | 小屏下将 OperationBar 改为纵向折叠或底部抽屉 | ⏳ 未开始（v13 候选 P2） |

### 2.3 长期（3–6 月）

| 优先级 | 目标 | 具体优化方向 | 实际状态 |
|--------|------|--------------|----------|
| **P1** | 动画引擎性能重构 | 将所有 D3 动画迁移至 transform / opacity；提供 prefers-reduced-motion 下的 crossfade 降级 | ⏳ 进行中（v9.0 引入 AnimationDelayIndicator） |
| **P2** | 引入 SVG 图标系统 | 替换所有 Unicode 图标为统一 SVG icon 库 | ⏳ 未开始 |
| **P2** | 跨页面布局一致性 | 为所有页面增加 max-w-7xl / max-w-[1440px] 内容区 | ⏳ 未开始 |
| **P3** | 高级视觉主题与高对比模式 | 增加高对比度（High Contrast）模式、色盲友好调色板 | ⏳ 未开始 |

---

## 实施状态总览（截至 v13.0.0-rc1）

### v1.0 借鉴计划 P1 项实施情况

| P1 项 | 状态 | 完成版本 | 提交 |
|-------|------|----------|------|
| AVL 树 | ✅ | v11.0.1 | 9b7100a 前置 |
| 红黑树 | ✅ | v12.0 | 61bdc5f |
| 跳表 SkipList | ✅ | v12.0 | 61bdc5f |
| 并查集 Union-Find | ✅ | v12.0 | 61bdc5f |
| 全局搜索 GlobalSearch | ✅ | v12.0 | 61bdc5f |
| Bellman-Ford / Floyd / Prim / Kruskal | ⏳ | 待定 | D1 TODO |
| TimSort / ShellSort / CombSort | ⏳ | 待定 | D2 TODO |
| 设置面板 SettingsPanel | ⏳ | 待定 | v13+ |
| 新手引导 GuideTooltip | ⏳ | 待定 | v13+ |
| 导出增强 ExportMenu | ⏳ | 待定 | v13+ |
| 测验系统 Quiz | ⏳ | 待定 | v13+ |

### v2.0 修订版舍弃项

- ❌ 底部导航 BottomNav
- ❌ 斐波那契堆

### v1.0 视觉审查 29 项问题整改进度

| 维度 | 数量 | 状态 |
|------|------|------|
| 1.1 视觉一致性 | 4 | ⏳ 1/4（圆角统一） |
| 1.2 响应式 | 4 | ✅ 3/4 |
| 1.3 色彩系统 | 4 | ⏳ 2/4 |
| 1.4 字体层级 | 3 | ⏳ 1/3 |
| 1.5 组件样式 | 4 | ✅ 2/4 |
| 1.6 布局合理性 | 3 | ⏳ 1/3 |
| 1.7 交互反馈 | 3 | ✅ 2/3 |
| 1.8 视觉性能 | 4 | ✅ 2/4 |
| **总计** | **29** | **13 已完成 / 12 进行中 / 4 未开始** |

---

> **保留理由：** 本文档完整保留 2026-06-18~19 三份规划/审查文档，作为项目历史参考。后续借鉴项目实施见 `docs/iteration-plan-v11.md` + `docs/superpowers/plans/` 目录。
