# 数据结构学习助手 — 长线开发路线图（v13 → v16+）

> **创建日期**: 2026-06-21
> **当前版本**: v13.0.0-rc3
> **当前基线**: 2261 tests / 121 文件 / lint 0 errors / 15 数据结构 / 12 排序 / 8 图算法 / 37 学习配置
> **执行原则**: 不间断开发，每阶段完成后验证 + 文档同步 + 提交

---

## 第一阶段：学习体验闭环（v13 GA）

### H3 — SortComparePage 学习模式

| 步骤 | 任务 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| H3-1 | 新建学习配置 | `src/configs/learning/sortCompare.config.ts` | 5~7 个步骤（选择算法、初始化数组、第一轮比较、关键差异、完成对比） |
| H3-2 | 页面集成 | `src/pages/SortComparePage.tsx` | 接入 `useLearningMode`，右侧 InfoPanel 显示学习步骤 |
| H3-3 | 单元测试 | `src/__tests__/pages/SortComparePage.test.tsx` | 基础渲染 + 学习模式切换 |

### H1 — 测验系统

| 步骤 | 任务 | 涉及文件 | 验收标准 |
|------|------|----------|----------|
| H1-1 | 测验配置类型扩展 | `src/configs/learning/*.config.ts` | 为 bubbleSort/binarySearch/bst 增加 `quiz` 字段（各 3 道单选题） |
| H1-2 | useQuizProgress Hook | `src/hooks/useQuizProgress.ts` | 记录答题状态/得分/完成时间，持久化 localStorage |
| H1-3 | QuizPanel 组件 | `src/components/QuizPanel.tsx` | 展示题目、答对/答错即时反馈、进度显示 |
| H1-4 | InfoPanel 集成 | `src/components/InfoPanel.tsx` | 学习模式最后一页或单独 tab 展示 QuizPanel |
| H1-5 | 单元测试 | `src/__tests__/hooks/useQuizProgress.test.ts` + `src/__tests__/components/QuizPanel.test.tsx` | 覆盖答题/得分/重置 |

### v13 GA 发布

| 步骤 | 任务 | 说明 |
|------|------|------|
| v13-GA-1 | 全套 E2E 验证 | `node e2e/run-all-tests.js` + `node e2e/test-a11y.js` |
| v13-GA-2 | 文档同步 | 8 份文档更新到 v13.0.0 |
| v13-GA-3 | 发布 | merge → main，推送触发 CI/Deploy |

**里程碑**: v13.0.0 GA — 学习体验闭环完成

---

## 第二阶段：内容扩张（v14）

### Phase D — 图算法补齐（4 个）

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| D1-1 | Bellman-Ford 算法 | `src/algorithms/graph/bellmanFord.ts` | 负权边单源最短路径 |
| D1-2 | Bellman-Ford 学习配置 | `src/configs/learning/bellmanFord.config.ts` | 7 步 |
| D1-3 | Floyd-Warshall 算法 | `src/algorithms/graph/floydWarshall.ts` | 全源最短路径 |
| D1-4 | Floyd-Warshall 学习配置 | `src/configs/learning/floydWarshall.config.ts` | 7 步 |
| D1-5 | Prim 算法 | `src/algorithms/graph/prim.ts` | 最小生成树 |
| D1-6 | Prim 学习配置 | `src/configs/learning/prim.config.ts` | 7 步 |
| D1-7 | Kruskal 算法 | `src/algorithms/graph/kruskal.ts` | 最小生成树 |
| D1-8 | Kruskal 学习配置 | `src/configs/learning/kruskal.config.ts` | 7 步 |
| D1-9 | 注册 + 索引 | `src/configs/learning/index.ts` + `src/data/searchIndex.ts` | 注册 4 个新配置 |
| D1-10 | 单元测试 | `src/__tests__/algorithms/graph/*.test.ts` | 每个算法 10+ tests |

### Phase G — 高阶数据结构（2 个 + 1 补页）

#### G1 — B-Tree

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| G1-1 | B-Tree 算法 | `src/algorithms/bTree.ts` | 多路搜索树，插入 + 分裂 |
| G1-2 | useBTreeState Hook | `src/hooks/useBTreeState.ts` | 状态管理 + localStorage |
| G1-3 | bTreeVisualizer | `src/visualizers/bTreeVisualizer.ts` | 多叉节点可视化 |
| G1-4 | BTreePage | `src/pages/BTreePage.tsx` | 页面 + 操作面板 |
| G1-5 | 学习配置 | `src/configs/learning/bTree.config.ts` | 7 步 |
| G1-6 | 路由 + 侧边栏 + 首页 | `App.tsx` + `Sidebar.tsx` + `Home.tsx` | 集成 |
| G1-7 | 单元测试 | `src/__tests__/algorithms/bTree.test.ts` + hooks + visualizer + page | 50+ tests |

#### G2 — Segment Tree

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| G2-1 | Segment Tree 算法 | `src/algorithms/segmentTree.ts` | 区间查询 + 更新 |
| G2-2 | useSegmentTreeState Hook | `src/hooks/useSegmentTreeState.ts` | 状态管理 |
| G2-3 | segmentTreeVisualizer | `src/visualizers/segmentTreeVisualizer.ts` | 树形可视化 |
| G2-4 | SegmentTreePage | `src/pages/SegmentTreePage.tsx` | 页面 |
| G2-5 | 学习配置 | `src/configs/learning/segmentTree.config.ts` | 7 步 |
| G2-6 | 路由 + 侧边栏 + 首页 | `App.tsx` + `Sidebar.tsx` + `Home.tsx` | 集成 |
| G2-7 | 单元测试 | `src/__tests__/algorithms/segmentTree.test.ts` + hooks + visualizer + page | 50+ tests |

#### G3 — doublyLinkedList 页面

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| G3-1 | DoublyLinkedListPage | `src/pages/DoublyLinkedListPage.tsx` | 复用 useLinkedListState |
| G3-2 | 路由 + 侧边栏 + 首页 | `App.tsx` + `Sidebar.tsx` + `Home.tsx` | 集成 |
| G3-3 | 单元测试 | `src/__tests__/pages/DoublyLinkedListPage.test.tsx` | 基础渲染 + 操作 |

### Phase F — 文档完善

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| F2-1 | CHANGELOG.md 完善 | `CHANGELOG.md` | 补充 v4.0-v8.0 变更历史 |
| F-CONTRIB | CONTRIBUTING.md | `CONTRIBUTING.md` | 贡献指南 |
| F-API | 算法接入指南 | `docs/ALGORITHM_INTEGRATION_GUIDE.md` | 新增算法的标准流程 |

### v14 发布

| 步骤 | 任务 | 说明 |
|------|------|------|
| v14-GA-1 | 全套测试 | `npm run test:run` + E2E + a11y |
| v14-GA-2 | 文档同步 | 8 份文档更新到 v14.0.0 |
| v14-GA-3 | 发布 | merge → main，推送 |

**里程碑**: v14.0.0 — 内容扩张完成，17 数据结构 + 12 排序 + 12 图算法

---

## 第三阶段：体验纵深（v15）

### Phase E — 移动端体验加固

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| E1-1 | PWA 离线验证 | `public/manifest.json` + `src/serviceWorkerRegistration.ts` | 验证 17 个页面离线可访问 |
| E2-1 | 大数据量可视化优化 | `src/visualizers/treeVisualizer.ts` + `graphVisualizer.ts` + `heapVisualizer.ts` | >30 节点跳动画 |
| E3-1 | 移动端手势增强 | `src/hooks/useTouchGestures.ts` + `src/components/Layout.tsx` | 左右滑动切页面 |
| E4-1 | KeyboardHelp 模糊搜索 | `src/components/KeyboardHelp.tsx` | 复用 fuzzySearch |

### Phase U — UI 细粒度打磨

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| U2-1 | 响应式操作面板重构 | `src/components/OperationBar.tsx` | 小屏折叠/底部抽屉 |
| U3-1 | 跨页面布局一致性 | `src/pages/*.tsx` | 统一 `max-w-7xl` |
| U4-1 | SVG 图标系统 | `src/components/icons/*.tsx` | 替换 Unicode 图标 |
| U5-1 | 条件禁用按钮原因说明 | 全局 | `title` / `aria-describedby` |

### Phase ISSUE — 遗留问题

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| ISSUE-007 | 排序操作撤销支持 | `src/hooks/useSortState.ts` + `src/pages/SortPage.tsx` | 排序后保留撤销点 |

### v15 发布

| 步骤 | 任务 | 说明 |
|------|------|------|
| v15-GA-1 | 全套测试 | `npm run test:run` + E2E + a11y |
| v15-GA-2 | 文档同步 | 8 份文档更新到 v15.0.0 |
| v15-GA-3 | 发布 | merge → main，推送 |

**里程碑**: v15.0.0 — 体验纵深完成，移动端友好

---

## 第四阶段：工程深化（v16+）

### Phase ENG — 工程化

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| ENG-1 | Playwright Test 框架迁移 | `e2e/*.ts` | 从自定义 runner 迁移到标准 Playwright Test |
| ENG-2 | 测试覆盖率 > 80% | `vitest.config.ts` + 补测试 | 重点补页面组件 |
| ENG-3 | lint warnings 归零 | 全局 | 65 个既有 warnings 清理 |

### Phase ENH — 功能增强

| 步骤 | 任务 | 涉及文件 | 说明 |
|------|------|----------|------|
| ENH-1 | 数据导入/导出增强 | `src/utils/dataExport.ts` | 支持导出为 GIF/MP4 动画回放 |
| ENH-2 | 国际化完善 | `src/i18n/locales.ts` | 补充算法术语英文对照表 |

### v16+ 发布

| 步骤 | 任务 | 说明 |
|------|------|------|
| v16-GA-1 | 全套测试 | `npm run test:run` + E2E + a11y |
| v16-GA-2 | 文档同步 | 8 份文档更新到 v16.0.0 |
| v16-GA-3 | 发布 | merge → main，推送 |

**里程碑**: v16.0.0 — 工程深化完成，生产级项目

---

## 执行顺序总结

```
当前: v13.0.0-rc3
  ↓
第一阶段 (v13 GA): H3 → H1 → v13-GA
  ↓
第二阶段 (v14): D1 → G1 → G2 → G3 → F2 → v14-GA
  ↓
第三阶段 (v15): E1 → E2 → E3 → E4 → U2 → U3 → U4 → U5 → ISSUE-007 → v15-GA
  ↓
第四阶段 (v16+): ENG-1 → ENG-2 → ENG-3 → ENH-1 → ENH-2 → v16-GA
```

---

## 不做范围（明确边界）

- ❌ 不做后端/API 服务器
- ❌ 不做用户账号系统
- ❌ 不做算法可视化之外的领域
- ❌ 不做底层架构翻新（技术栈不变）
- ❌ 不引入 Redux/Zustand 等外部状态管理

---

## 验证基线（每个阶段结束必须达到）

| 检查项 | 标准 |
|--------|------|
| ESLint | 0 errors |
| TypeScript | 0 errors (strict) |
| Vitest | 所有测试通过 |
| Build | 成功，bundle 预算通过 |
| E2E | 所有 spec 通过 |
| a11y | 0 critical/serious violations |
