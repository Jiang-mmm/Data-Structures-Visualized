# 数据结构学习助手 - TODO 列表

> **版本:** v9.0.0
> **更新日期:** 2026-06-18
> **状态:** v9.0 全面迭代优化已完成，后续功能扩展待开始
> **详细迭代计划:** docs/iteration-plan-v8.md（历史），v9.0 迭代记录见 WORKLOG.md

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

## 当前迭代（后续功能扩展 - 待开始）

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
| E1 | PWA 离线验证 | P2 | ⬜ | 验证 13 个页面离线可访问 |
| E2 | 大数据量可视化优化 | P2 | ⬜ | treeVisualizer >30 跳动画、graphVisualizer >20 跳动画、heapVisualizer >30 跳动画 |
| E3 | 移动端手势增强 | P3 | ⬜ | 左右滑动切换页面、操作栏底部固定 |
| E4 | 键盘快捷键搜索 | P3 | ⬜ | KeyboardHelp 支持模糊匹配 |
| E5 | 排序操作撤销支持 | P3 | ⬜ | ISSUE-007: 排序后保留撤销点 |

### Phase F：文档与发布（P3 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| F1 | README.md 更新 | P3 | ⬜ | 功能列表、测试数据、截图、快速开始章节 |
| F2 | CHANGELOG.md 完善 | P3 | ⬜ | 补充 v4.0-v8.0 变更历史 |
| F3 | 版本号同步 | P3 | ⬜ | package.json 与 Sidebar 版本号一致 |
| F5 | GitHub Pages 部署验证 | P3 | ⬜ | 验证 deploy workflow 自动触发 |

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
| 大数据量性能 | P2 | ⏳ 待处理 | 100+ 节点帧率下降 | tree/graph/heap 需跳动画阈值 |
| 文档缺口 | P3 | ⏳ 待处理 | onboarding 体验 | 缺少贡献指南、API 文档 |

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

> 详细变更历史见 CHANGELOG.md，工作日志见 WORKLOG.md。

---

> **说明:** 本文档为动态维护文件，随项目迭代持续更新。优先级可能根据实际需求调整。
