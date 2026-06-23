# v20 执行级计划 — A (i18n M5-M9) + C (技术债) 并行一次性交付

> **创建日期**: 2026-06-22
> **执行模式**: 一次性完成(类比 v19 M4-3 模式)
> **基线版本**: v17.0.0 GA（main HEAD `b991566`）
> **执行节奏**: A 与 C 在 2 个独立 feature 分支并行推进,每子阶段完成立即 git commit,最终 GA 时 merge
> **负责人**: 项目维护者(用户)+ AI 协作
> **关键约束**: 严格遵守 Agent 宪法;M7/M8(翻译+用户校对) 留待用户主导,本次只完成技术可达子阶段

---

## 0. 上游输入

| 文档 | 状态 |
|------|------|
| [v20 下一迭代计划](./2026-06-22-v20-next-iteration-plan.md) | ✅ 已交付 |
| [v19 M0-M4 实施真源](./2026-06-22-v19-i18n-progressive-migration.md) | 🟢 M0-M4 全部完成 |
| [v13 体检报告](../../audit-2026-06-20/audit-merged.md) | 56 条;已修 65% / 残留 15% / 复发 3% |
| [v19 M4 收尾报告](../i18n-inventory/06-m4-closure-report.md) | 569 `t()` 调用 / 0 字符 UI 硬编码 / AssertSameKeys 编译时镜像 |

---

## 1. 战略目标

| 维度 | 现状 | v20 目标 |
|------|------|----------|
| i18n 完整性 | M0-M4 完成(20 目标 100% `t()` 化) | M5-M9 完成(components / utils / learning config / en 翻译 / E2E) |
| 文档完整度 | 8 根目录 + 13 plans + 6 i18n-inventory + 3 specs | + CONTRIBUTING.md + API.md + ARCHITECTURE v17+ 章节 |
| 工程成熟度 | 0 lint / 80.05% 覆盖 / 2699 tests | + react-hooks warnings 归零 + CONTRIBUTING/API 文档 |
| Bundle | index < 110KB / vendor-react < 250KB / vendor-d3 < 60KB | 维持现状 |

---

## 2. 工作分解结构(WBS)

### 2.1 Option A — i18n 收尾(M5-M9)

| 子阶段 | 范围 | 字符 | 工时 | 风险 | 本轮执行 |
|--------|------|------|------|------|---------|
| **M5** | `src/components/*` 硬编码中文 props 默认值 | ~800 | 2d | 极低 | ⚠️ 部分(本轮) |
| **M6** | `src/utils/*` 错误消息 + 主题名 + 速度预设 | ~500 | 1d | 极低 | ✅ 完成(本轮) |
| **M7** | `src/configs/learning/*` 教学文案 | ~5000 | 3d | 中(需用户校对) | ❌ 推迟(用户校对) |
| **M8** | 实际英文翻译(en 命名空间填充) | 全部 | 5d | 中(翻译质量) | ❌ 推迟(用户校对) |
| **M9** | Playwright i18n E2E + pseudoLocale 烟雾测试 | — | 2d | 极低 | ⚠️ 部分(本轮)|

**A 小计**: 13d → 本轮 1.5d 等效(M5 部分 + M6 + M9 部分),M7/M8 推迟

### 2.2 Option C — 技术债 + 工程深化

| 子阶段 | 范围 | 工时 | 风险 | 本轮执行 |
|--------|------|------|------|---------|
| **C-1** | v13 体检残留清理(react-hooks 6+59 warnings) | 4d | 中 | ⚠️ 部分(本轮, 6 set-state-in-effect + 样本 deps) |
| **C-2** | 覆盖率 80% → 85% | 5d | 低 | ❌ 推迟(本轮不执行) |
| **C-3** | CONTRIBUTING.md + API.md + ARCHITECTURE v17+ | 2.5d | 极低 | ✅ 完成(本轮) |
| **C-4** | avlTreeVisualizer 内存泄漏 + useVisualizer 渲染 ref | 3d | 中 | ❌ 推迟(需要深度调试) |
| **C-5** | 缓冲 | 3.5d | — | — |

**C 小计**: 18d → 本轮 2.5d 等效(C-1 部分 + C-3),C-2/C-4 推迟

### 2.3 本轮总执行

| 类别 | 本轮完成 | 推迟到下轮 |
|------|---------|-----------|
| A | M5 扫描 + M6 完成 + M9 框架 | M5 实际迁移 / M7 / M8 / M9 完整 |
| C | C-1 react-hooks 修复 + C-3 docs | C-2 / C-4 |

---

## 3. 资源分配

### 3.1 人力

| 角色 | 时间投入 | 主要职责 |
|------|---------|---------|
| 项目维护者(用户) | 0 工时(本轮) | M7/M8 用户校对(推迟) |
| AI 协作 | 100% 本轮 | 扫描 / 迁移 / 测试 / 文档 / 验证 |

### 3.2 计算资源

| 资源 | 用途 | 工时 |
|------|------|------|
| Local sandbox | 文件读写 / 类型检查 / 测试 | 同步 |
| Grep / Glob / Read | 代码扫描 | 0.5h |
| Subagent(可选) | 大目录扫描 | 0.5h |

---

## 4. 详细时间表 + 里程碑

### 4.1 阶段 1:准备工作(0.5h)

| 步骤 | 任务 | 验收 |
|------|------|------|
| 1.1 | 创建 `feature/v20-m5-components` 分支 | git branch -a 可见 |
| 1.2 | 创建 `feature/v20-c1-techdebt` 分支 | git branch -a 可见 |
| 1.3 | 基线快照: lint 0 / test 全绿 | npx vitest run 通过 |

### 4.2 阶段 2:A 路径实施(并行,~2.5h 等效)

| 步骤 | 任务 | 验收 |
|------|------|------|
| 2.1 | A M6:扫描 `src/utils/*` 中文 user-facing 字符串 | 列表 |
| 2.2 | A M6:主题名 / 速度预设迁移到 i18n | 规则 0 警告 |
| 2.3 | A M6:扩展 locales.ts 命名空间 | AssertSameKeys 编译通过 |
| 2.4 | A M6:单元测试(20+)| vitest 全绿 |
| 2.5 | A M5:扫描 `src/components/*` 中文 props | 列表(本轮只扫描,留待下轮迁移) |
| 2.6 | A M9:e2e/i18n.spec.ts 框架(本轮只搭骨架)| 文件存在 |

### 4.3 阶段 3:C 路径实施(并行,~2.5h 等效)

| 步骤 | 任务 | 验收 |
|------|------|------|
| 3.1 | C-1.1:扫描 react-hooks set-state-in-effect 6 instances | 列表 |
| 3.2 | C-1.1:逐文件修复(用 useEffect / setStateInEvent 模式) | 0 警告 |
| 3.3 | C-1.2:exhaustive-deps 警告样本修复(5 个) | 0 警告 |
| 3.4 | C-3:创建 CONTRIBUTING.md | 30+ 行 |
| 3.5 | C-3:创建 API.md(基于 typedoc 输出) | 公共 API 100% 覆盖 |
| 3.6 | C-3:补充 ARCHITECTURE.md v17+ 章节 | +1 章节 |

### 4.4 阶段 4:验证 + 合并(1h)

| 步骤 | 任务 | 验收 |
|------|------|------|
| 4.1 | `npm run lint` | 0 errors / 0 warnings |
| 4.2 | `npx vitest run` | 全绿 + 新增 20+ |
| 4.3 | `npm run build` | 成功 |
| 4.4 | `node scripts/check-bundle.js` | 全部 < budget |
| 4.5 | git commit / push 2 分支 | log 可见 |
| 4.6 | 同步 6 份核心文档 | 引用闭环 |

### 4.5 关键里程碑

| 里程碑 | 时间 | 验收 |
|--------|------|------|
| **M1** 准备完成 | T+0.5h | 2 分支已建 / 基线绿 |
| **M2** A 路径完成(M5 扫描 + M6 完成) | T+3h | locales.ts 扩展 + 20+ tests |
| **M3** C 路径完成(C-1 部分 + C-3) | T+3h | react-hooks 6 修复 + CONTRIBUTING/API |
| **M4** v20-GA-A 验证 | T+3.5h | lint / test / build / bundle 全绿 |
| **M5** 文档同步 + 汇报 | T+4h | 6 份核心文档已同步 |

---

## 5. 风险评估

### 5.1 战略风险

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| v20 范围过大(本轮) | 高 | 中 | 明确推迟 M5/M7/M8/M9 实际迁移 + C-2/C-4,本轮只做可执行项 |
| C-1 react-hooks 修复引入新 bug | 中 | 高 | 逐个修复 + 单元测试 + 立即 git commit |
| bundle 超预算(无影响,本轮不改 vendor) | 极低 | 低 | 本轮不触碰 vendor 拆分 |
| 用户校对未到位 | 已知 | 高 | M7/M8 推迟,本轮不涉及 |

### 5.2 项目风险

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| 中文 props 扫描遗漏 | 中 | 中 | Grep 全量 + 人工抽查 |
| 性能回归 | 低 | 中 | 性能监控(log 验证) |
| 命名空间冲突 | 低 | 中 | 命名空间名加 `utils.*` / `components.*` 前缀 |
| AssertSameKeys 失败 | 低 | 中 | zh/en 镜像保证 |

### 5.3 风险缓解流程

- **3 次失败**: 立即回滚到上一个干净 commit,重新调整范围
- **类型错误 > 5 处**: 暂停,向用户汇报
- **测试失败 > 10 处**: 暂停,向用户汇报

---

## 6. 成功标准(Acceptance Criteria)

### 6.1 Option A 部分

| 检查项 | 标准 | 验证 |
|--------|------|------|
| `src/utils/*` user-facing 中文 | 0 字符遗漏 | Grep 扫描 |
| `AssertSameKeys` | zh/en 键完全镜像 | 编译通过 |
| 单元测试新增 | 20+ | vitest 输出 |
| `no-hardcoded-chinese-in-jsx` 规则 | utils 0 警告 | ESLint 输出 |
| M5 扫描产物 | 完整列表(下轮执行) | docs/superpowers/i18n-inventory/07-m5-components-scan.md |
| M9 E2E 框架 | 文件存在 | 文件检查 |

### 6.2 Option C 部分

| 检查项 | 标准 | 验证 |
|--------|------|------|
| `react-hooks/set-state-in-effect` 6 instances | 0 警告 | ESLint 输出 |
| `react-hooks/exhaustive-deps` 样本 5 | 0 警告 | ESLint 输出 |
| `CONTRIBUTING.md` | 30+ 行 + 5 章节 | 文件存在 |
| `API.md` | 公共 API 100% 覆盖 | 文件存在 |
| `ARCHITECTURE.md` v17+ 章节 | +1 章节 | 文件存在 |
| `npm run lint` | 0 errors / 0 warnings | CLI |
| `npx vitest run` | 全绿 | CLI |
| `npm run build` | 成功 | CLI |

### 6.3 项目级

| 检查项 | 标准 |
|--------|------|
| 文档同步 | PROJECT_STATUS / TODO / WORKLOG / CLAUDE / AGENTS / docs/README 6 份 |
| git commit | 每个子阶段 1 个 commit,信息遵循规范 |
| 分支独立 | A 路径与 C 路径分 2 分支,无冲突 |

---

## 7. 不做范围(Out of Scope)

| 项目 | 原因 | 后续 |
|------|------|------|
| M5 实际组件迁移(全量) | 工作量超本轮 1 turn 容量 | 下轮:基于本轮扫描列表 |
| M7 learning config 迁移 | 需用户校对关键文案 | 用户主导 |
| M8 实际英文翻译 | 需用户校对翻译质量 | 用户主导 |
| M9 完整 E2E + pseudoLocale 烟雾 | 依赖 M7/M8 完成 | 下轮 |
| C-2 覆盖率 80→85% | 工时超 5d | 下轮 |
| C-4 性能优化(avlTreeVisualizer / useVisualizer)| 需深度调试 | 下轮 |
| v18 计划重启 | 用户已封存 | — |
| 后端 / 新数据结构 | 不在 v20 范围 | — |

---

## 8. 文档同步清单(本轮结束后)

| 文档 | 同步内容 |
|------|---------|
| `PROJECT_STATUS.md` | v20 部分完成 + 新分支 + 下一步 |
| `TODO.md` | v20 段更新 + 下轮 todo |
| `WORKLOG.md` | 追加"v20 A+C 本轮执行"日志 |
| `CLAUDE.md` | 当前活跃计划表更新 |
| `AGENTS.md` | 当前活跃计划段更新 |
| `docs/README.md` | 新增 M5 扫描报告导航 |

---

## 9. 执行责任人

| 阶段 | 责任人 | 验收人 |
|------|--------|--------|
| 阶段 1 准备 | AI | 用户(分支可见) |
| 阶段 2 A 路径 | AI | 用户(测试全绿) |
| 阶段 3 C 路径 | AI | 用户(测试全绿) |
| 阶段 4 验证 | AI | 用户(GA 拍板) |
| 文档同步 | AI | 用户(6 份同步) |
| merge + push | 用户(merge 决策) | — |

---

## 10. 立即开始

按以下顺序执行(不偏离本计划):

1. ✅ 创建 2 个 feature 分支
2. ✅ A 路径: M6 utils 迁移 → M5 扫描 → M9 框架
3. ✅ C 路径: C-1 react-hooks 修复 → C-3 docs
4. ✅ 验证 + git commit + 文档同步
5. ✅ 汇报(不自动进入下一轮)

> **本计划文档遵循最小修改原则**(rule 8),任何范围变更必须先更新本文件再写代码。
