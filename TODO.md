# 数据结构学习助手 - TODO 列表

> **版本:** v11.0.1
> **更新日期:** 2026-06-19
> **状态:** v10/v11 视觉统一、交互优化、AVL 树新增、本地打开兼容修复已完成；后续功能扩展待开始
> **详细迭代计划:** docs/iteration-plan-v10.md（最新），v10/v11 迭代记录见 WORKLOG.md

---

## 已完成（v11.0.1+ - 首页配色统一与 AVL 遍历动画优化）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-PATCH-1 | 首页图/哈希卡片分组色主题统一 | P1 | ✅ | 更新 `--color-card-group-graph` token，四套主题颜色协调 |
| v11-PATCH-2 | AVL 遍历动画优化 | P1 | ✅ | 新增边流动点、节点脉冲，移除冗余 ripple，缩短尾等待 |
| v11-PATCH-3 | 文档同步 | P1 | ✅ | PROJECT_SUMMARY / WORKLOG / TODO / CHANGELOG / README / ARCHITECTURE / CODE_WIKI 同步 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-PATCH-Q1 | 单元测试 | P0 | ✅ | 3042 tests passed（188 文件） |
| v11-PATCH-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| v11-PATCH-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v11-PATCH-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（v11.0.1 - 最终验证、文档同步与 GitHub 部署）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-FINAL-1 | 本地打开兼容修复 | P0 | ✅ | file:// 使用 HashRouter，生产 base 改为 `./` |
| v11-FINAL-2 | 全站语义化颜色统一 | P1 | ✅ | 20+ 文件硬编码颜色替换为 token |
| v11-FINAL-3 | 首页三色分组配色 | P1 | ✅ | 线性/树/图与哈希按 blue/amber/rose 分组 |
| v11-FINAL-4 | A11y 对比度修复 | P1 | ✅ | Sidebar 激活态文字改为 text-ink，12/12 页面 0 violations |
| v11-FINAL-5 | 文档与版本号同步 | P1 | ✅ | PROJECT_SUMMARY/README/ARCHITECTURE/CODE_WIKI/TODO/CHANGELOG/package.json 同步到 v11.0.1 |
| v11-FINAL-6 | GitHub 部署 | P0 | ✅ | 提交并推送 origin/main，触发 CI/Deploy 工作流 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-FINAL-Q1 | 单元测试 | P0 | ✅ | 3042 tests passed（188 文件） |
| v11-FINAL-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| v11-FINAL-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v11-FINAL-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |
| v11-FINAL-Q5 | E2E 功能 | P0 | ✅ | 308/308 passed |
| v11-FINAL-Q6 | E2E A11y | P0 | ✅ | 12/12 页面 0 violations |

---

## 已完成（v11.0 - 全面视觉统一与交互优化）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-P1 | 全局色彩系统统一 | P1 | ✅ | Button info 变体改为 accent-blue，收敛页面级强调色为 blue/amber |
| v11-P2 | 排序界面序号标识 | P1 | ✅ | sortVisualizer 柱状图底部新增数组下标序号 |
| v11-P3 | 字典树动画重设计 | P1 | ✅ | trieVisualizer 新增光晕、路径高亮、leaf 完成态动画 |
| v11-P4 | 组件与交互细节修复 | P1 | ✅ | Card 渐变修复、animationEngine 补全 easeInOutCubic |
| v11-P5 | 全面视觉与交互体验 | P1 | ✅ | 统一页面排版、按钮 busy/disabled 状态、动画缓动优化 |
| v11-P6 | 类型修复与最终验证 | P1 | ✅ | 新增 Button outline / UndoPreviewButton secondary 变体；2996→3042 测试 |

---

## 已完成（v10.0 - UI 打磨与可视化定位修复）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v10-P0 | 可视化定位修复 | P0 | ✅ | arrayVisualizer/trieVisualizer 移除 getViewBoxSize，Visualizer 新增 isAnimating prop |
| v10-P1 | 首页与组件 UI 优化 | P1 | ✅ | Home 收敛配色为 2 色，Card 新增 gradient，LearningRecommendations 替换灯泡 emoji，ProgressOverview 目标设定反馈 |
| v10-P2 | 主题渐变色 Token | P2 | ✅ | themeColors 增加 gradientStart/gradientEnd，Home Logo/Hero 使用主题渐变 |
| v10-P3 | 最终验证与文档同步 | P1 | ✅ | 2978 tests / lint 0 / build 成功，PROJECT_SUMMARY/WORKLOG/CHANGELOG 更新 |

---

## 已完成（v9.0 - 全面迭代优化）

### Phase 1：动画与交互修复

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P1-1 | 可视化主体定位修复 | P0 | ✅ | 修复数组/栈/队列/链表可视化主体定位异常 |
| v9-P1-2 | 公共居中工具 | P1 | ✅ | 新建 `src/utils/visualizerLayout.ts`，统一主体居中逻辑 |
| v9-P1-3 | 延迟启动指示器 | P1 | ✅ | 新建 `src/components/AnimationDelayIndicator.tsx` |
| v9-P1-4 | animationEngine delayStart API | P1 | ✅ | animationEngine.ts 新增 delayStart 延迟启动支持 |
| v9-P1-5 | 单元测试扩展 | P1 | ✅ | 单元测试从 2580 增长到 2866 |

### Phase 2：学习路径系统优化

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P2-1 | useLearningProgress 重构 | P0 | ✅ | CustomEvent 同步 + SyncStatus + 统计 API + 目标设定 |
| v9-P2-2 | ProgressOverview 组件 | P1 | ✅ | 新建进度环/统计卡片/目标设定组件 |
| v9-P2-3 | LearningRecommendations 组件 | P1 | ✅ | 新建推荐展示组件 |
| v9-P2-4 | learningRecommender 推荐算法 | P1 | ✅ | 新建 `src/utils/learningRecommender.ts` |
| v9-P2-5 | LearningPath 信息框重设计 | P2 | ✅ | LearningPath.tsx 信息框 UI 优化 |

### Phase 3：可视化界面优化

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P3-1 | trieVisualizer 美化 | P1 | ✅ | radialGradient + 贝塞尔曲线 + computeSubtreeWidth |
| v9-P3-2 | GraphPage 矩阵/邻接表 UI | P1 | ✅ | GraphPage.tsx 矩阵/邻接表 UI 重设计 |
| v9-P3-3 | ComplexityChart 重设计 | P1 | ✅ | 8 色调色板 + 表格视图 |
| v9-P3-4 | GraphAlgorithmPage 横线清理 | P2 | ✅ | 移除多余横线 |

### Phase 4：功能内容拓展

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P4-1 | 学习配置拓展 | P1 | ✅ | 新建 complexityAnalysis/advancedDataStructures/realWorldApplications 3 个配置 |
| v9-P4-2 | ContentTier 内容分层组件 | P1 | ✅ | 新建 `src/components/ContentTier.tsx`，基础/进阶/拓展三层 |
| v9-P4-3 | 核心页面集成 | P1 | ✅ | ContentTier 集成到 5 个核心数据结构页面 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-Q-1 | 单元测试 | P0 | ✅ | 2866 tests passed（182 文件） |
| v9-Q-2 | ESLint | P0 | ✅ | 0 错误 |
| v9-Q-3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v9-Q-4 | Build | P0 | ✅ | 808ms 成功 |
| v9-Q-5 | Bundle 预算 | P0 | ✅ | 符合（index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB） |

---

## 已完成（v8.1 - 动画挂起修复）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| FIX1 | transitionEnd 超时保护 | P0 | ✅ | animationEngine.ts 新增 3000ms 超时兜底 |
| FIX2 | Visualizer 重渲染修复 | P0 | ✅ | dimensionsRef 缓存，移除 dimensions 依赖 |
| FIX3 | Hash/Heap 链式过渡重构 | P0 | ✅ | 拆分为顺序 await，确保 end 事件捕获 |
| FIX4 | 动画/数据更新顺序修正 | P1 | ✅ | Hash/Heap/Trie 先 insert 再 animate |

---

## 已完成（UI 美化 Phase 1-3）

基于 `docs/项目视觉设计审查报告.md` 的长期 UI 美化计划。

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| UI-P1-1 | 统一原子组件（Button / Card） | P0 | ✅ | 新建/完善 Button、Card，OperationButton 收敛为工具栏变体 |
| UI-P1-2 | 修复 WCAG 2 AA 对比度 | P0 | ✅ | placeholder / disabled / 副标题文字对比度达标 |
| UI-P2-1 | 修正视口单位 | P1 | ✅ | `h-screen` → `h-dvh` / `min-h-dvh` |
| UI-P2-2 | 统一移动端滚动策略 | P1 | ✅ | 侧边栏展开时锁定 `body` 滚动 |
| UI-P2-3 | 统一焦点环 | P1 | ✅ | 全局 `focus-ring` utility，输入框与小按钮统一 |
| UI-P2-4 | 加载/禁用状态 ARIA 语义 | P1 | ✅ | `aria-busy="true"` / `aria-disabled="true"` |
| UI-P3-1 | 语义化颜色 token | P1 | ✅ | paper / ink / surface / muted / accent 等 light/dark token |
| UI-P3-2 | 圆角与硬阴影 token | P1 | ✅ | `--radius-*` 与 `--shadow-hard-*`，移除 `shadow-soft` |
| UI-P3-3 | 主题完整调色板 | P1 | ✅ | default/forest/warm/royal 四套主题完整 surface 映射 |
| UI-P3-4 | 按钮语义变体收敛 | P1 | ✅ | primary/secondary/danger/success/warning/info/ghost |
| UI-P3-5 | 卡片与边框统一 | P1 | ✅ | 移除 `border-l-4` / `border-dashed`，Card 支持 variant/shadow/radius |
| UI-P3-6 | SVG 字体 token 化 | P1 | ✅ | arrayVisualizer / trieVisualizer 通过 CSS 变量注入字体 |
| UI-P3-7 | 验证与文档 | P1 | ✅ | 2929 tests / lint 0 / build 成功，PROJECT_SUMMARY/WORKLOG/TODO 更新 |

---

## 当前迭代（后续功能扩展 - 待开始）

### Phase U：UI 美化后续（基于审查报告中期项 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| U1 | 动画性能优化与大数据降级 | P1 | ✅ | 统一性能配置模块 performanceConfig；数组/图/树 transform/opacity 动画迁移；力导向 tick transform 优化；animationEngine FPS 自动降级；渲染耗时 measureRender 观测；全部测试通过 |
| U2 | 响应式操作面板重构 | P2 | ⬜ | 小屏下 OperationBar 改为纵向折叠或底部抽屉；增加滑动提示与手势引导 |
| U3 | 跨页面布局一致性 | P2 | ⬜ | 页面内容区 `max-w-7xl` / `max-w-[1440px]`；右侧边栏自适应宽度 |
| U4 | SVG 图标系统 | P2 | ⬜ | 替换 Unicode 图标为统一 SVG icon 库 |
| U5 | 条件禁用按钮原因说明 | P3 | ⬜ | 统一 `title` / `aria-describedby` 说明禁用原因 |

### Phase D：功能扩展（P1 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| D1 | 新增图算法 | P1 | ⬜ | Bellman-Ford、Floyd-Warshall、Prim、Kruskal + 学习配置 + 单元测试 |
| D2 | 新增排序算法 | P1 | ⬜ | TimSort、ShellSort、CombSort + 学习配置 |
| D3 | doublyLinkedList 页面 | P2 | ⬜ | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |
| D4 | SortComparePage 学习模式 | P3 | ⬜ | 对比页面集成学习步骤 |

### Phase E：体验与性能优化（P2 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| E1 | PWA 离线验证 | P2 | ⬜ | 验证 14 个页面离线可访问 |
| E2 | 大数据量可视化优化 | P2 | ⬜ | treeVisualizer >30 跳动画、graphVisualizer >20 跳动画、heapVisualizer >30 跳动画；注意与 U1 协同 |
| E3 | 移动端手势增强 | P3 | ⬜ | 左右滑动切换页面、操作栏底部固定；注意与 U2 协同 |
| E4 | 键盘快捷键搜索 | P3 | ⬜ | KeyboardHelp 支持模糊匹配 |
| E5 | 排序操作撤销支持 | P3 | ⬜ | ISSUE-007: 排序后保留撤销点 |

### Phase F：文档与发布（P3 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| F1 | README.md 更新 | P3 | ✅ | 功能列表、测试数据、快速开始章节已同步到 v11.0.1 |
| F2 | CHANGELOG.md 完善 | P3 | ⬜ | 补充 v4.0-v8.0 变更历史 |
| F3 | 版本号同步 | P3 | ✅ | package.json / package-lock.json 已更新到 11.0.1 |
| F5 | GitHub Pages 部署验证 | P3 | ✅ | 已推送 origin/main，CI/Deploy 工作流自动触发 |

---

## 持续改进

| 任务 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| E2E 框架升级 | P2 | ⬜ | 评估从自定义 runner 迁移到 Playwright Test 框架 |
| 测试覆盖率提升 | P3 | ⬜ | 目标 80%+ 覆盖率，页面组件测试 |
| 贡献指南 | P3 | ⬜ | CONTRIBUTING.md |
| 架构设计文档 | P3 | ⬜ | 补充架构设计文档、组件 API 文档、算法接入指南 |

---

## 技术债务

| 债务项 | 优先级 | 状态 | 影响 | 说明 |
|-------|-------|------|------|------|
| 可视化主体定位异常 | P0 | ✅ 已解决 | 数组/栈/队列/链表主体偏移 | v9.0 Phase 1 通过 visualizerLayout.ts 公共居中工具修复 |
| 学习进度同步机制缺失 | P1 | ✅ 已解决 | 跨组件进度不同步 | v9.0 Phase 2 通过 useLearningProgress 重构（CustomEvent）修复 |
| 学习进度可视化缺失 | P1 | ✅ 已解决 | 用户无法直观查看进度 | v9.0 Phase 2 通过 ProgressOverview 组件修复 |
| 学习推荐机制缺失 | P1 | ✅ 已解决 | 用户缺乏学习引导 | v9.0 Phase 2 通过 learningRecommender + LearningRecommendations 修复 |
| trieVisualizer 视觉效果不足 | P2 | ✅ 已解决 | 字典树可视化层次感弱 | v9.0 Phase 3 通过 radialGradient + 贝塞尔曲线修复 |
| GraphPage 矩阵/邻接表 UI 粗糙 | P2 | ✅ 已解决 | 图数据展示不清晰 | v9.0 Phase 3 通过 UI 重设计修复 |
| ComplexityChart 配色单一 | P2 | ✅ 已解决 | 复杂度对比不直观 | v9.0 Phase 3 通过 8 色调色板 + 表格视图修复 |
| 内容分层缺失 | P1 | ✅ 已解决 | 不同阶段用户学习路径不清 | v9.0 Phase 4 通过 ContentTier 组件修复 |
| E2E 自定义 runner | P2 | ⏳ 待处理 | 缺少重试/并行/报告 | 未使用 Playwright Test 框架 |
| doublyLinkedList 页面缺失 | P2 | ⏳ 待处理 | 学习模式缺口 | 配置存在但无对应页面 |
| 大数据量性能 | P2 | ✅ 已解决 | 100+ 节点帧率下降 | v10 U1 通过 performanceConfig + 跳动画 + transform/opacity 优化解决 |
| 本地打开异常 | P0 | ✅ 已解决 | file:// 下资源路径与路由失效 | v11.0.1 通过 HashRouter + 相对 base 路径修复 |
| 文档缺口 | P3 | ⏳ 部分解决 | onboarding 体验 | README/ARCHITECTURE/CODE_WIKI/TODO 已同步；仍缺 CONTRIBUTING.md、API 文档 |

---

## 已完成里程碑

| 里程碑 | 版本 | 关键交付物 |
|-------|------|-----------|
| M1-M4: 核心功能 + 体验 + 数据结构 + 高级功能 | v2.4-v3.9 | 排序算法、UI/UX、哈希/堆/字典树、算法对比、持久化、i18n |
| M5-M11: 视觉改版 + 功能增强 | v4.0-v4.9 | Timeline、渐变填充、暗色模式、主题系统、撤销预览、分享 |
| M12-M19: TypeScript 迁移 | v5.0-v5.7 | 100% TypeScript、CI/CD、代码质量优化 |
| M20-M23: 图算法 + 学习模式 | v6.0-v6.4 | BFS/DFS/Dijkstra/拓扑排序、学习模式全覆盖、配置模块化 |
| v6.5: 稳定性 | v6.5 | 排序停止修复、abort 机制、E2E 32 项 |
| v8.0: 严格化 + 加固 | v8.0.0 | TypeScript strict、E2E Firefox 支持、CI/CD 完善、2548 单元测试 |
| v8.1: 动画挂起修复 | v8.1.0 | transitionEnd 超时保护、Visualizer 重渲染修复、链式过渡重构、2580 单元测试 |
| v9.0: 全面迭代优化 | v9.0.0 | 动画与交互修复、学习路径系统优化、可视化界面优化、功能内容拓展、2866 单元测试 |
| v10.0: UI 打磨与可视化定位修复 | v10.0.0 | 数组/字典树可视化居中修复、首页配色统一、Card 渐变、主题渐变 token、2978 单元测试 |
| v11.0: 全面视觉统一与交互优化 | v11.0.0 | 全局色彩统一、排序序号、字典树动画重设计、Button/Undo 变体修复、2996→3042 单元测试 |
| v11.0.1: 最终验证与部署 | v11.0.1 | 本地打开兼容、全站配色统一、a11y 对比度修复、文档同步、GitHub 部署 |

> 详细变更历史见 CHANGELOG.md，工作日志见 WORKLOG.md。

---

> **说明:** 本文档为动态维护文件，随项目迭代持续更新。优先级可能根据实际需求调整。
