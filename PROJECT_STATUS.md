# PROJECT_STATUS — 项目当前状态快照

> **文件用途**: AI 开发前必读。本文件汇总项目最新进展，避免 AI 基于过时的代码或文档状态做决策。
> **更新频率**: 每次迭代结束 / 每个子阶段验收后 / 启动新的开发任务前。
> **最后更新**: 2026-06-21

---

## 1. 项目概览

| 项 | 当前值 |
|---|---|
| **项目名称** | ds-visualizer（数据结构学习助手） |
| **当前版本** | v13.0.0-rc1-phase-a（Phase A 紧急修复已完成，待 Phase B） |
| **技术栈** | React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 |
| **当前分支** | `feature/v13-code-audit` |
| **基线状态** | 3480 单元测试全绿 / ESLint 0 errors / TypeScript strict 0 errors / 生产构建通过 |

---

## 2. 最近完成的工作

### 2026-06-21 | v13 Phase A 紧急修复完成（安全 + 数据完整性）
- 完成 `src/utils/schema.ts` 统一 schema 校验（递归深度限制 `MAX_STORAGE_DEPTH = 10`），集成到 `useDataStructureState.loadFromStorage`
- `package.json` devDependencies 版本限定从 `^` 改为 `~`，CI 新增 `npm ls --depth=0` 校验
- `scripts/check-bundle.js` 用 `fileURLToPath` 替代 `import.meta.dirname`，兼容 Node 20+
- `vite.config.js` 移除 `loli.net` 第三方字体代理缓存配置，消除安全风险
- `src/hooks/useDataStructureState.ts` 渲染阶段 ref 赋值移入 `useEffect`
- 新增 `src/__tests__/utils/schema.test.ts` 14 个 schema 专属测试
- 验证：3494 tests passed（新增 14 个）/ lint 0 errors / typecheck / build 全通过
- Git commit: `0a544a9`

### 2026-06-21 | 文档整理与归档体系建立
- 将 `iteration-plan-v8/v9/v10`、`optimization-proposal`、`test-issue-report` 等 12 份过期文档合并为 6 份归档文件
- 新建 `docs/archive/` 目录与 `docs/README.md` 导航
- 修复 `TODO.md`、`PROJECT_SUMMARY.md`、`WORKLOG.md` 中对已归档文档的错误引用
- 关键文档（`CLAUDE.md`、根目录核心文档）保持独立未合并
- Git commit: `857f833 docs(archive): 整理过期文档并建立 archive 归档体系`

### 2026-06-20 | v13 全面代码体检完成
- 双模型互盲审计，合并去重后 56 条独立问题（P1 29 / P2 24 / P3 3）
- 产物：`docs/superpowers/specs/2026-06-20-v13-code-audit-design.md`、`docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md`、`docs/audit-2026-06-20/audit-merged.md`
- Git commit: `f698291 docs: v13 全面代码体检报告与实施计划`

### 2026-06-20 | v12.0.0 完成
- 新增数据结构：跳表 SkipList、并查集 Union-Find、红黑树 Red-Black Tree
- 新增全局搜索 GlobalSearch（Ctrl/Cmd+K）
- 新增图算法：Bellman-Ford、Floyd-Warshall、Prim、Kruskal
- 新增排序算法：TimSort、ShellSort、CombSort、Counting
- 单元测试从 3089 增至 3480
- Git commit: `61bdc5f feat(v12): 跳表、并查集、红黑树与全局搜索`

---

## 3. 当前活跃任务 / 下一步方向

### v13 修复路线（按 Phase A→D 顺序执行）

| Phase | 主题 | 预计工时 | 状态 |
|-------|------|----------|------|
| **A** | 紧急修复（安全 + 数据完整性） | 1~2 天 | ✅ 已完成（commit `0a544a9`） |
| **B** | 体验 + 工程优化（性能 + 渲染 + a11y） | 3~5 天 | ⏳ 待启动 |
| **C** | 文档完善（一致性 + API 文档） | 1~2 天 | ⏳ 待启动 |
| **D** | 测试 + CI 升级（E2E 框架 + 覆盖率可视化） | 2~3 天 | ⏳ 待启动 |

### v13 Top10 优先问题（详见 `docs/audit-2026-06-20/audit-merged.md`）

1. devDependencies 版本越界（`package.json`）
2. `isValidStoredData` 不递归深度 + `loadFromStorage` 用 `JSON.parse as T`
3. useVisualizer rafId 闭包错乱 + animationEngine 模块单例 + wait() 闭包链
4. `treeVisualizer` `positionStore` 全局单例
5. `useDataStructureState` 渲染阶段写 ref
6. `react-hooks/set-state-in-effect` 永久降级 warn
7. `vite.config.js` 配 `loli.net` 注释写 google fonts
8. InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸
9. 树/图键盘 ↑↓ 行为错误 + AVL/UnionFind 节点不可 tab
10. undo/redo/applyPreset 不打断正在跑的动画

---

## 4. 已知约束与注意事项

- **禁止修改的文件**: `CLAUDE.md`、根目录核心文档（README/CHANGELOG/ARCHITECTURE/PROJECT_SUMMARY/CODE_WIKI/TODO/WORKLOG/CONTRIBUTING）作为独立文件保留，不合并。
- **必须遵循的工作流**: `UNDERSTAND → PLAN → EXECUTE → VERIFY`
- **当前代码基线**: 所有 v13 修复必须基于 `feature/v13-code-audit` 分支，不要直接在 `main` 修改。
- **验证红线**: 任何代码改动后必须运行 `npm run lint`、`npm run typecheck`、`npm run test:run`、`npm run build`。

---

## 5. 关键文档入口

| 文档 | 用途 |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | AI 协作规则与技术约束 |
| [TODO.md](./TODO.md) | 当前待办与 v13 修复路线 |
| [WORKLOG.md](./WORKLOG.md) | 每日工作记录 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更历史 |
| [docs/audit-2026-06-20/audit-merged.md](./docs/audit-2026-06-20/audit-merged.md) | v13 代码体检完整报告 |
| [docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md](./docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md) | v13 实施计划 |
| [docs/README.md](./docs/README.md) | docs/ 目录导航 |

---

> **AI 开发前必读提示**: 开始任何开发任务前，先读取本文件 + [TODO.md](./TODO.md) 顶部 3 段 + [WORKLOG.md](./WORKLOG.md) 前 60 行。若本文件与 WORKLOG/TODO 冲突，以本文件和 TODO.md 为准。
