# v13 全面代码体检 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans 来按任务执行本计划。所有步骤使用 `- [ ]` checkbox 语法追踪。

**Goal:** 通过双模型互盲审查 + 集中仲裁，输出 v13 起点报告（6 维问题清单 + P0~P3 分级 + 实施路线图），并同步 6 份项目文档。

**Architecture:** 全程不动业务代码；6 步流程 = 派 subagent A → 派 subagent B → 合并仲裁 → 写 design spec（已完成）→ 写实施计划（本文件）→ 同步项目文档 + 1 个 commit。审查在 `feature/v13-code-audit` 新分支进行。

**Tech Stack:** Markdown 报告 + Task subagent + 现有 Git 工作流。

**前置依赖:**
- Design spec 已写：`docs/superpowers/specs/2026-06-20-v13-code-audit-design.md`
- 当前分支：`main`（HEAD = `5532edf`），与 `feature/v12-advanced-data-structures` 一致
- 项目根目录：`d:\VibeCoding\数据结构学习助手3`

---

## 文件结构

| 文件 | 状态 | 职责 |
|------|------|------|
| `docs/audit-2026-06-20/audit-report-A.md` | 待创建 | Subagent A 报告 |
| `docs/audit-2026-06-20/audit-report-B.md` | 待创建 | Subagent B 报告 |
| `docs/audit-2026-06-20/audit-merged.md` | 待创建 | 合并仲裁报告（核心交付） |
| `docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md` | 本文件 | 实施计划 |
| `docs/superpowers/specs/2026-06-20-v13-code-audit-design.md` | 已写 | Design spec |
| `README.md` | 待同步 | 加"v13 体检已完成" |
| `CHANGELOG.md` | 待同步 | 加 v13.0.0-rc1 条目 |
| `TODO.md` | 待同步 | 拆解 v13 Phase A/B/C/D |
| `WORKLOG.md` | 待同步 | 记录 2026-06-20 体检 |
| `PROJECT_SUMMARY.md` | 待同步 | 加一节"v13 起点" |
| `ARCHITECTURE.md` | 待同步 | 加一节"v13 体检方法论" |

---

## Task 1: 创建审计目录与新分支

**Files:**
- Create: `docs/audit-2026-06-20/` 目录
- Branch: `feature/v13-code-audit`（基于 main）

- [ ] **Step 1: 确认当前 git 状态干净**

```powershell
cd d:\VibeCoding\数据结构学习助手3
git status --short
```

预期：空输出（无 uncommitted / untracked）。

- [ ] **Step 2: 基于 main 创建新分支**

```powershell
git checkout main
git pull origin main
git checkout -b feature/v13-code-audit
```

预期：新分支基于 main，与 origin/main 同步。

- [ ] **Step 3: 创建审计报告目录**

```powershell
mkdir docs/audit-2026-06-20
```

预期：目录创建成功。

---

## Task 2: 派 Subagent A — 工程审计师视角

**Files:**
- Create: `docs/audit-2026-06-20/audit-report-A.md`

- [ ] **Step 1: 调用 Task 工具派 subagent A**

工具：`Task`，`subagent_type=general_purpose_task`，`description=工程审计师代码走读`

提示词模板：

```
你是资深前端工程审计师。请按以下要求对项目做 6 维静态走读，只读不改。

项目根目录：d:\VibeCoding\数据结构学习助手3
项目版本：v12.0.0
技术栈：React 19 + TypeScript 5.8 + D3.js 7 + Vite 8 + Tailwind 4

6 维审查范围：
1. 架构：六层架构（Entry → Pages → Components → Hooks → Visualizers → Algorithms/Utils）职责边界、依赖方向、Visualizer↔Hook 解耦、algorithm 注册模式一致性
2. 安全：localStorage 校验覆盖、validate.ts 完整性、XSS 防护、输入边界、依赖漏洞
3. 性能：全清+全绘策略在 100+ 树/50+ 图/50+ 排序下的瓶颈、动画时长/中断保护、ResizeObserver 节流、PWA 缓存策略
4. 可测试性：3480 测试覆盖分布、visualizer mock 合理性、e2e 框架（自定义 vs Playwright Test）、a11y 深度
5. 文档：README/CHANGELOG/ARCHITECTURE/CODE_WIKI/TODO/WORKLOG/PROJECT_SUMMARY 完整性
6. 工程化：CI/CD、ESLint、TypeScript strict、commit 规范、bundle 预算、文档维护纪律

输出要求（中文 markdown）：
- 每条问题 = 等级(P0~P3) + 文件:行号 + 根因 + 风险影响 + 修复方向（一句话）
- 至少输出 8 条独立问题
- 末尾加一节"Top5 优先"，按修复紧迫度排
- 不要写修复代码，只给方向
- 不要复述项目结构，直接进问题

输出到控制台（不要写文件），我会自己整理。
```

- [ ] **Step 2: 等 subagent A 完成，捕获输出**

预期：subagent 返回中文 markdown 报告，含 ≥ 8 条问题 + Top5。

- [ ] **Step 3: 把 A 报告写入文件**

文件路径：`docs/audit-2026-06-20/audit-report-A.md`

内容：subagent 原始输出 + 顶部加一行 `**Subagent A 视角：工程审计师**` + 末尾加 `**生成时间：2026-06-20**` + `**问题数：N 条**`。

- [ ] **Step 4: Commit（不必要，等最终统一 commit）**

跳过。本任务结尾不单独 commit。

---

## Task 3: 派 Subagent B — 教学体验 + 渲染工程师视角（双盲）

**Files:**
- Create: `docs/audit-2026-06-20/audit-report-B.md`

- [ ] **Step 1: 调用 Task 工具派 subagent B**

工具：`Task`，`subagent_type=general_purpose_task`，`description=教学体验+渲染工程师双盲审查`

提示词模板：

```
你是 D3 渲染 + 教学体验工程师。**不要参考任何已有审计报告**（独立审查）。

项目根目录：d:\VibeCoding\数据结构学习助手3
项目版本：v12.0.0
技术栈：React 19 + TypeScript 5.8 + D3.js v7 + Vite 8 + Tailwind 4

审查视角（教学体验 + 渲染）：
1. visualizer 实现差异：14 个 visualizer 之间的颜色/字号/动画时长不一致
2. 动画性能：D3 transition、wait、中断保护、Promise 挂起风险
3. 教学闭环：学习模式（34 个 configs）的断点、InfoPanel 集成、键盘可达性
4. 移动端触控：触控尺寸（< 44px）、手势、操作面板移动端重构
5. a11y 真实体验：屏幕阅读器、键盘导航、aria-label、focus-visible
6. visualizer 内部 bug：节点定位、坐标计算、SVG viewBox、ResizeObserver
7. 性能监控盲区：PerformanceMonitor 是否覆盖大数据场景
8. 教学反馈：动画太快/太慢、撤销重做、学习进度持久化

输出要求（中文 markdown）：
- 每条问题 = 等级(P0~P3) + 文件:行号 + 根因 + 教学影响 + 修复方向（一句话）
- 至少输出 8 条独立问题
- 末尾加一节"Top5 教学痛点"
- 不要写修复代码，只给方向
- **不要看其他审计报告，独立判断**

输出到控制台（不要写文件），我会自己整理。
```

- [ ] **Step 2: 等 subagent B 完成，捕获输出**

预期：subagent 返回中文 markdown 报告，含 ≥ 8 条问题 + Top5。

- [ ] **Step 3: 把 B 报告写入文件**

文件路径：`docs/audit-2026-06-20/audit-report-B.md`

内容：subagent 原始输出 + 顶部加一行 `**Subagent B 视角：教学体验 + 渲染工程师（双盲）**` + 末尾加 `**生成时间：2026-06-20**` + `**问题数：N 条**`。

---

## Task 4: 合并仲裁（我执行）

**Files:**
- Create: `docs/audit-2026-06-20/audit-merged.md`

- [ ] **Step 1: 读 A、B 报告**

```powershell
Get-Content docs/audit-2026-06-20/audit-report-A.md
Get-Content docs/audit-2026-06-20/audit-report-B.md
```

- [ ] **Step 2: 去重 + 仲裁**

按 design spec §4.3 仲裁原则分类：

| 标签 | 含义 |
|------|------|
| `[共识]` | A、B 都报告的问题 |
| `[A-独报-工程]` | 只有 A 报告（工程性） |
| `[B-独报-体验]` | 只有 B 报告（体验性） |
| `[仲裁]` | A、B 冲突，由我裁定 |

- [ ] **Step 3: 按维度分组输出**

输出结构：

```markdown
# v13 全面代码体检 — 合并仲裁报告

**生成时间:** 2026-06-20
**仲裁视角:** 我（基于 A + B 互盲报告）
**原始报告:** audit-report-A.md, audit-report-B.md

---

## 1. 架构（Architecture）

### P0 致命
- [共识] ...

### P1 高
- [A-独报-工程] ...
- [B-独报-体验] ...

### P2 中
...

---

## 2. 安全 ...

---

## Top10 优先清单

| 优先级 | 标签 | 问题 | 文件:行号 | 修复方向 |
|--------|------|------|-----------|----------|
| P0 | [共识] | xxx | src/... | ... |

---

## 后续迭代路线

| Phase | 主题 | 包含问题 | 预计工时 |
|-------|------|----------|----------|
| A | 紧急修复 | P0 全部 | 1~2 天 |
| B | 体验+工程优化 | P1 全部 | 3~5 天 |
| C | 文档完善 | P2 全部 + 文档 | 1~2 天 |
| D | 测试+CI 升级 | P3 全部 | 2~3 天 |
```

- [ ] **Step 4: 把合并报告写入文件**

文件路径：`docs/audit-2026-06-20/audit-merged.md`

---

## Task 5: 同步项目文档

**Files:**
- Modify: `README.md`（加 v13 体检条目）
- Modify: `CHANGELOG.md`（加 v13.0.0-rc1 元数据）
- Modify: `TODO.md`（拆解 v13 Phase A/B/C/D）
- Modify: `WORKLOG.md`（记录 2026-06-20）
- Modify: `PROJECT_SUMMARY.md`（加 v13 起点节）
- Modify: `ARCHITECTURE.md`（加 v13 体检方法论节）

- [ ] **Step 1: 同步 README.md**

顶部"最新状态"区加：

```markdown
- **2026-06-20**: v13 全面代码体检已完成（6 维 + 双模型互盲）。详见 [`docs/audit-2026-06-20/audit-merged.md`](./docs/audit-2026-06-20/audit-merged.md)
```

- [ ] **Step 2: 同步 CHANGELOG.md**

加 v13.0.0-rc1 条目（**仅元数据，不描述新功能**）：

```markdown
## [13.0.0-rc1] - 2026-06-20

### Meta
- 完成 v13 全面代码体检（6 维 + 双模型互盲 + 集中仲裁）
- 输出 [合并报告](./docs/audit-2026-06-20/audit-merged.md)、[设计 spec](./docs/superpowers/specs/2026-06-20-v13-code-audit-design.md)、[实施计划](./docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md)
```

- [ ] **Step 3: 同步 TODO.md**

在文件顶部加：

```markdown
## v13 起点（来自 audit-merged.md）

- [ ] Phase A：紧急修复（按 audit-merged.md Top10 P0 顺序）
- [ ] Phase B：体验+工程优化（按 audit-merged.md P1 顺序）
- [ ] Phase C：文档完善（按 audit-merged.md P2 顺序）
- [ ] Phase D：测试+CI 升级（按 audit-merged.md P3 顺序）
```

- [ ] **Step 4: 同步 WORKLOG.md**

加一条 2026-06-20 工作日志：

```markdown
## 2026-06-20

- 完成 v13 全面代码体检（双模型互盲 + 集中仲裁）
- 产物：audit-report-A/B.md、audit-merged.md、design spec、实施计划
- 共发现 N 条问题（共识 M 条，A-独报 X 条，B-独报 Y 条，仲裁 Z 条）
- v13 Phase A/B/C/D 路线已就位，待 v13 启动时按顺序执行
```

- [ ] **Step 5: 同步 PROJECT_SUMMARY.md**

加一节"v13 起点"：

```markdown
## v13 起点

2026-06-20 完成 v13 全面代码体检，详见：
- 合并报告：[docs/audit-2026-06-20/audit-merged.md](./docs/audit-2026-06-20/audit-merged.md)
- 设计 spec：[docs/superpowers/specs/2026-06-20-v13-code-audit-design.md](./docs/superpowers/specs/2026-06-20-v13-code-audit-design.md)
- 实施计划：[docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md](./docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md)
```

- [ ] **Step 6: 同步 ARCHITECTURE.md**

加一节"v13 体检方法论"：

```markdown
## v13 体检方法论

2026-06-20 采用"双模型互盲 + 集中仲裁"做全面代码体检：
- Subagent A：工程审计师视角（架构/安全/性能/可测试性/文档/工程化 6 维）
- Subagent B：教学体验 + 渲染工程师视角（互盲）
- 仲裁：我合并去重，按 [共识]/[A-独报]/[B-独报]/[仲裁] 分类分级

后续每次重大版本（v14+）都应采用此方法体检，详见 [design spec](../docs/superpowers/specs/2026-06-20-v13-code-audit-design.md)。
```

---

## Task 6: 1 个 commit 收尾

**Files:**
- Commit: 11 份文件（11 份新文件 + 6 份同步文档）

- [ ] **Step 1: 验证所有文件就位**

```powershell
git status --short
```

预期：11 份文件（含 docs/audit-2026-06-20/ 3 份、docs/superpowers/plans/ 1 份已存在、6 份项目文档修改）。

- [ ] **Step 2: Stage 所有变更**

```powershell
git add docs/audit-2026-06-20/ docs/superpowers/plans/ README.md CHANGELOG.md TODO.md WORKLOG.md PROJECT_SUMMARY.md ARCHITECTURE.md
```

- [ ] **Step 3: 1 个 commit**

```powershell
git commit -m "docs: v13 全面代码体检报告与实施计划

- 双模型互盲：subagent A 工程审计 + subagent B 教学体验+渲染
- 合并仲裁：共识/独报/仲裁三类标签分级 P0~P3
- 产物 3 份：audit-report-A.md, audit-report-B.md, audit-merged.md
- design spec + 实施计划已就位
- v13 起点：Phase A/B/C/D 路线图，待 v13 启动时按顺序执行

参见：docs/superpowers/specs/2026-06-20-v13-code-audit-design.md
参见：docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md"
```

预期：1 个 commit 在 `feature/v13-code-audit` 分支上。

- [ ] **Step 4: 不 push（边界）**

跳过。`feature/v13-code-audit` 不主动 push，等用户决定是否合并回 main / push 到远端。

---

## 自审（writing-plans skill checklist）

| 检查项 | 状态 |
|--------|------|
| Spec 覆盖 | ✅ 6 维审查、合并仲裁、文档同步、commit 全部映射到任务 |
| 占位符 | ✅ 无 "TBD/TODO/实现 later/类似 Task N" |
| 类型一致 | ✅ 全程使用 `audit-report-A.md`/`audit-report-B.md`/`audit-merged.md` 文件名 |
| 步骤粒度 | ✅ 每步 2-5 分钟（创建目录、派 subagent、合并、commit） |
| 工程纪律 | ✅ 明确"不动业务代码"边界、明确"1 个 commit" |

---

## 验收标准（与 spec §7 对齐）

| 维度 | 标准 |
|------|------|
| 报告完整性 | audit-merged.md 覆盖 6 维 + Top10 + P0/P1/P2/P3 分级，每条带文件:行号 |
| 互盲验证 | subagent A 与 B 各 ≥ 5 条独立问题（去重前） |
| 仲裁质量 | [共识]/[A-独报]/[B-独报]/[仲裁] 标签清晰 |
| 文件交付 | design spec + 实施计划都通过自审 |
| 文档同步 | 6 份项目文档同步更新，commit 描述清楚 |
| 工程纪律 | 全程在 `feature/v13-code-audit` 新分支；1 个 commit |
| Token 经济 | subagent A + B 总产出 ≤ 50KB markdown |
