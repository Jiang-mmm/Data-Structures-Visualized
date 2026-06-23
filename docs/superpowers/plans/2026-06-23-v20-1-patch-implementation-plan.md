# v20.1.0 Patch 版本实施真源文档

> **创建日期**: 2026-06-23
> **拍板依据**: 用户最新指令「选择选项 C：重新规划 v20.1 patch 版本（绕过 A M8/M9），直接发布当前 C-2 收尾状态」（2026-06-23）
> **基线版本**: v20 全面收尾（4/7 子阶段完成，57% 完成度）
> **基线 commit**: `1e84697`（feature/v20-c2-coverage = v20 closure 最终化）
> **目标版本**: v20.1.0 patch（替代 v20.0.0 GA）
> **实施模式**: §7.2.1 一次性交付（单分支 / 配置变更 / 用户拍板 / 收尾性质）

---

## §0. 上游依赖

### 0.1 已完成子阶段（合并到 v20.1.0 patch）

| # | 子阶段 | 分支 | Commit | 范围 |
|---|--------|------|--------|------|
| 1 | **C-1** | `feature/v20-c1-react-hooks` | `3cd920a` | react-hooks 扫描 0 警告 |
| 2 | **C-4** | `feature/v20-c4-memory-leak` | `8b9f9a7` | useVisualizer 早返回修复 + 11 测试 |
| 3 | **A M7-1~M7-7** | `feature/v20-m7-6-tests` | `c0b8973` | 40 config i18n 迁移 + 738 测试 + en 翻译 AI 复审 |
| 4 | **C-2 收尾** | `feature/v20-c2-coverage` | `1e84697` | 247 新测试 + 14 typecheck 修复 + 6 文档同步 + 收尾报告 |

### 0.2 未启动子阶段（按选项 C 绕过）

| # | 子阶段 | 状态 | 移交 v21 候选 |
|---|--------|------|---------------|
| 5 | A M8 英文翻译填充 | ⏳ 未启动 | v21 B-7（需用户校对 5 核心页面）|
| 6 | A M9 完整 E2E + pseudoLocale | ⏳ 未启动 | v21 B-8（依赖 B-7）|
| 7 | v20.0.0 GA 收尾 | ⏳ 未启动 | **本方案替代为 v20.1.0 patch** |

### 0.3 git 状态基线

```
main HEAD: 37478cf（v18 计划封存清理 — 2026-06-22）
当前分支: feature/v20-c2-coverage @ 1e84697
git tags: 空（无 v20.x.x tag）
工作树: clean（v20 closure 最终化已 commit）
```

### 0.4 未合并 v20 相关分支（**需用户拍板**）

| 分支 | Commit | 内容 | 建议 |
|------|--------|------|------|
| `feature/v20-a-m7-m8` | `f048ffa` | M7-5 路径修复（1024 处全局替换）| **跳过**（已被 `c0b8973` 后续 commit 覆盖）|
| `feature/v20-c-techdebt` | `0832d85` | 第二轮执行计划交付 | **跳过**（已被 v20-closure-report.md 取代）|
| `feature/v20-a-m5-m6-i18n` | `d09cbef` | A M9 e2e 框架骨架 | **跳过**（独立保留供 v21 B-8 启动时 cherry-pick）|

---

## §1. 目标

### 1.1 核心目标

**发布 v20.1.0 patch 版本**，将 v20 阶段 4 个已完成子阶段（C-1 / C-4 / A M7 / C-2 收尾）正式合并到 main 分支，创建 git tag `v20.1.0`，同步 6 份核心文档反映 v20.1.0 patch 状态。

### 1.2 与 v20.0.0 GA 的差异

| 维度 | v20.0.0 GA（未启动）| v20.1.0 patch（本方案）|
|------|-------------------|---------------------|
| A M8 英文翻译填充 | 包含 | **不包含**（移交 v21 B-7）|
| A M9 完整 E2E | 包含 | **不包含**（移交 v21 B-8）|
| Statements 覆盖率 | ≥ 85% | **82%**（差 3pp，v21 B-6 补完）|
| Branches 覆盖率 | ≥ 70% | **68.93%**（差 1.07pp，v21 B-6 补完）|
| EN locale 完整度 | 100% | **部分**（40 config M7 完成；剩 500-800 键 = v21 B-7）|
| E2E i18n spec | 17 页 × 3 场景 = 51 项 | **0 项**（v21 B-8）|
| git tag | `v20.0.0` | **`v20.1.0`**（patch 版本号）|
| 风险 | 中（需用户校对 5d）| 🟢 低（不依赖用户校对）|

### 1.3 核心收益

- **明确版本边界**：v20.1.0 patch 是 v20 阶段的**收尾发布**，剩余 i18n 完整化移交 v21 候选
- **风险隔离**：避免 v20.0.0 GA 因 M8 用户校对拖延 1-2 周
- **主线解封**：main 分支 4 个 feature 分支全部 merge，后续 v21 阶段在 v20.1.0 基础上启动
- **回退路径清晰**：若 v20.1.0 出问题，可基于 v18 计划封存版本快速回退

---

## §2. WBS（工作分解结构）

### 2.1 大阶段 → 子阶段 → 原子步骤

```
v20.1.0 patch（v20 收尾发布）
├─ 子阶段 1：合并前准备（30min）
│  ├─ 原子步骤 1.1：创建 feature 分支 feature/v20-1-patch-ga
│  ├─ 原子步骤 1.2：基线快照（lint / test / build / bundle / coverage）
│  └─ 原子步骤 1.3：检查 4 分支无冲突（git merge-tree 预检）
│
├─ 子阶段 2：合并 4 个 feature 分支到 main（30min）
│  ├─ 原子步骤 2.1：切换到 main 分支（git checkout main）
│  ├─ 原子步骤 2.2：合并 C-1（feature/v20-c1-react-hooks @ 3cd920a）
│  ├─ 原子步骤 2.3：合并 C-4（feature/v20-c4-memory-leak @ 8b9f9a7）
│  ├─ 原子步骤 2.4：合并 A M7（feature/v20-m7-6-tests @ c0b8973）
│  ├─ 原子步骤 2.5：合并 C-2 收尾（feature/v20-c2-coverage @ 1e84697）
│  └─ 原子步骤 2.6：解决可能的冲突（如有）
│
├─ 子阶段 3：6 份核心文档同步 v20.1.0 patch 状态（30min）
│  ├─ 原子步骤 3.1：PROJECT_STATUS.md → 顶部活跃计划表 + 当前版本 v20.1.0
│  ├─ 原子步骤 3.2：TODO.md → v20 状态行 + v20.1.0 章节
│  ├─ 原子步骤 3.3：WORKLOG.md → 2026-06-23 收尾条目（v20.1.0 发布）
│  ├─ 原子步骤 3.4：CLAUDE.md → 主表 v20 计划指针更新
│  ├─ 原子步骤 3.5：AGENTS.md → 主表 v20 计划指针更新
│  └─ 原子步骤 3.6：package.json → version 字段更新为 20.1.0
│
├─ 子阶段 4：git tag v20.1.0 + push（10min）
│  ├─ 原子步骤 4.1：git tag -a v20.1.0 -m "v20.1.0 patch: C-1 + C-4 + A M7 + C-2 收尾（57% 子阶段完成）"
│  ├─ 原子步骤 4.2：git push origin main（**需用户拍板**）
│  ├─ 原子步骤 4.3：git push origin v20.1.0（**需用户拍板**）
│  └─ 原子步骤 4.4：GitHub Release（**需用户拍板**）
│
├─ 子阶段 5：合并后验证（30min）
│  ├─ 原子步骤 5.1：npm run lint（0 errors / 0 warnings）
│  ├─ 原子步骤 5.2：npx tsc --noEmit（2 pre-existing B-4/B-5 已知）
│  ├─ 原子步骤 5.3：npx vitest run（3797/3797 全绿）
│  ├─ 原子步骤 5.4：npm run build（成功）
│  └─ 原子步骤 5.5：node scripts/check-bundle.js（passed）
│
└─ 子阶段 6：v20.1.0 发布报告（10min）
   ├─ 原子步骤 6.1：写 v20.1.0 release report（docs/superpowers/plans/2026-06-23-v20-1-release-report.md）
   ├─ 原子步骤 6.2：PROJECT_STATUS.md / TODO.md / WORKLOG.md 同步最终状态
   └─ 原子步骤 6.3：呈报 VERIFICATION PASS + §7.7 自检 11 项
```

### 2.2 总工时估算

- **AI 自动化执行**: ~2h（合并 + 文档同步 + 验证）
- **用户拍板环节**: 4 个关键决策点（合并策略 / 3 未合并分支 / push / GitHub Release）
- **不依赖用户校对**: 0 个（核心收益）

---

## §3. 资源

### 3.1 工具与脚本

| 工具 | 路径 | 用途 |
|------|------|------|
| `git` | 系统命令 | 合并 / tag / push |
| `npm` | 系统命令 | 5 项硬门槛验证 |
| `npx vitest run` | 已配置 | 单元测试 |
| `npx tsc --noEmit` | 已配置 | typecheck |
| `node scripts/check-bundle.js` | 项目内 | bundle 大小检查 |
| 现有 4 个 feature 分支 | git refs | 合并源 |

### 3.2 文档资源

- [v20 全面收尾报告](./2026-06-23-v20-closure-report.md) — v20 阶段 13 章节全面状态
- [v20 C-2 报告](./2026-06-23-c2-coverage-report.md)（如存在）— C-2 收尾详情
- [v20 C-4 报告](./2026-06-23-c4-memory-leak-report.md) — C-4 修复详情
- [v20 M7 报告](./../i18n-inventory/08-m7-learning-config-migration.md) — M7 完成详情

### 3.3 人力资源

- **AI**: 执行合并 / 文档同步 / 验证
- **用户**: 拍板 4 个关键决策点（rule §18.4）

---

## §4. 时间表 + 里程碑

### 4.1 时间表

| 阶段 | 开始 | 结束 | 时长 | 关键节点 |
|------|------|------|------|----------|
| 用户拍板 4 决策点 | T+0 | T+0 | 即时 | AskUserQuestion 收集 |
| 子阶段 1：合并前准备 | T+0 | T+30min | 30min | 创建 feature 分支 + 基线快照 |
| 子阶段 2：合并 4 分支 | T+30min | T+1h | 30min | git merge × 4 |
| 子阶段 3：6 文档同步 | T+1h | T+1.5h | 30min | PROJECT_STATUS + TODO + WORKLOG + CLAUDE + AGENTS + package.json |
| 子阶段 4：tag + push | T+1.5h | T+1.7h | 10min | git tag + push |
| 子阶段 5：合并后验证 | T+1.7h | T+2.2h | 30min | 5 项硬门槛 |
| 子阶段 6：发布报告 | T+2.2h | T+2.4h | 10min | release report + 文档同步 |

**总时长**: ~2.5h（一次性交付）

### 4.2 里程碑

- **M1**（T+30min）：合并前准备完成，4 分支无冲突
- **M2**（T+1h）：4 分支全部合并到 main
- **M3**（T+1.5h）：6 份核心文档全部同步 v20.1.0 状态
- **M4**（T+1.7h）：git tag v20.1.0 创建 + push（**待用户拍板**）
- **M5**（T+2.2h）：5 项硬门槛 4/5 通过（typecheck 2 pre-existing 已知）
- **M6**（T+2.4h）：v20.1.0 release report 交付 + VERIFICATION PASS

---

## §5. 风险

### 5.1 已知风险

| # | 风险 | 等级 | 缓解 |
|---|------|------|------|
| 1 | 4 分支合并冲突（main 落后 v20 全部分支 81+ commit）| 🟡 中 | 预检 `git merge-tree` / 冲突则 AI 协助解决 / 严重则中止 + 汇报 |
| 2 | typecheck 2 pre-existing（B-4 + B-5 gif.js 不兼容）| 🟢 低 | M7-5 拍板 C 不修；v21 B-4/B-5 处理 |
| 3 | push 到 origin 触发 CI 失败 | 🟡 中 | push 前重跑 5 项硬门槛 + 提前合并 PR 准备 |
| 4 | GitHub Release Notes 内容偏差 | 🟢 低 | 严格按 release report 内容；不夸大 |
| 5 | v20.1.0 tag 后 main 仍受 v18 封存影响 | 🟢 低 | v18 封存已 commit 到 main（37478cf），无副作用 |

### 5.2 不可接受风险（**禁止**）

- 强行 push 失败 build → 触发 §6.4 启动异常 SOP
- 合并冲突严重（> 50 文件）→ 触发 §6.4 启动异常 SOP
- 用户未拍板 4 决策点 → AI 拒绝执行（rule §18.4）

---

## §6. 验收

### 6.1 硬门槛（5 项 — 与 §10.1 一致）

| # | 检查 | 阈值 | 实际 | 状态 |
|---|------|------|------|------|
| 1 | `npm run lint` | 0 errors / 0 warnings | **0 / 0** | ✅ |
| 2 | `npx tsc --noEmit` | 0 errors | **2 pre-existing**（B-4 + B-5 — M7-5 拍板 C 不修）| ⚠️ 已知 |
| 3 | `npx vitest run` | 全绿 | **3797/3797** | ✅ |
| 4 | `npm run build` | 成功 | **成功** | ✅ |
| 5 | `node scripts/check-bundle.js` | bundle 全 < budget | **passed** | ✅ |

### 6.2 软验收

| 维度 | 验收标准 | 实际 |
|------|---------|------|
| 4 分支全部 merge main | git log 显示所有 4 commit | ⏳ |
| 6 份核心文档同步 v20.1.0 状态 | grep 关键字 v20.1.0 在 6 份文档中均出现 | ⏳ |
| git tag v20.1.0 创建 | git tag -l 包含 v20.1.0 | ⏳ |
| package.json version = 20.1.0 | cat package.json | ⏳ |
| v20.1.0 release report 交付 | docs/superpowers/plans/2026-06-23-v20-1-release-report.md | ⏳ |

### 6.3 移交 v21 候选（v20.1.0 不做范围）

| 任务 | 移交 v21 | 备注 |
|------|---------|------|
| B-6 覆盖率补完（3pp Statements + 1pp Branches）| v21 启动 B-6 | 2-3d |
| B-7 A M8 英文翻译填充 | v21 启动 B-7 | 5d + 用户校对 5 核心页面 |
| B-8 A M9 完整 E2E | v21 启动 B-8 | 2d（依赖 B-7）|
| B-9 v20.0.0 GA 重规划 | v21 启动 B-9 | 1d（如需 v20.x GA）|

---

## §7. 不做范围（严格遵守 rule §2 三条铁律）

### 7.1 明确不做

- ❌ 启动 A M8 英文翻译（需用户校对，rule §18.4）
- ❌ 启动 A M9 E2E（依赖 M8）
- ❌ 写 v20.0.0 GA（被 v20.1.0 patch 替代）
- ❌ 合并 3 个未合并分支（M7-5 路径修复 / C-techdebt / A M9 框架）— **已过时 / 已被覆盖 / 独立保留供 v21**
- ❌ 修改 typecheck 2 pre-existing（B-4 + B-5 — M7-5 拍板 C）
- ❌ 改进 coverage（v20.1.0 接受 82% Statements / 68.93% Branches，差值 v21 B-6 处理）
- ❌ 修 v18/v19 历史遗留（rule §11 地基红线）
- ❌ 自动启动 v21 阶段任何子任务（rule §12 禁止行为）

### 7.2 严格遵守的规则

- rule §2 三条铁律（不扩展需求 / 不猜测 / 不伪造结果）
- rule §6.2 严格按 v20.1.0 patch 范围执行
- rule §7.2 永远不在 main 直接改（创建 feature 分支）
- rule §7.2.1 一次性交付模式（单分支 / 收尾性质）
- rule §7.5 `any` 默认禁止 / 0 架构变更
- rule §10.1 5 项硬门槛（合并前 + 合并后各 1 次）
- rule §16.3 任务收尾强制文档同步（6 份核心 + 1 份 release report）
- rule §18.4 AI 角色边界（不替用户拍板 4 决策点）

---

## §8. 关键约束

### 8.1 4 个用户必拍板决策点（rule §18.4）

| # | 决策点 | 选项 | 推荐 |
|---|--------|------|------|
| 1 | **合并策略** | A merge commit / B squash merge / C rebase + merge | **B squash**（patch 收尾版本，简化历史）|
| 2 | **3 个未合并分支** | X 全部跳过 / Y 选择性合并 / Z 全部合并 | **X 全部跳过**（详见 §0.4）|
| 3 | **push 策略** | X 仅本地 tag / Y push main + tag / Z 不 push | **Y push main + tag**（发布版本）|
| 4 | **GitHub Release** | X 不创建 / Y 创建 Release Notes / Z 创建 + 自动发布 | **Y 创建 Release Notes**（不自动发布）|

### 8.2 合并冲突预案

- **预检**: `git merge-tree` 4 分支 vs main
- **小冲突**（< 10 文件）: AI 协助解决（保留功能代码，删除过时）
- **大冲突**（≥ 10 文件）: **立即停止 + L4 汇报 + 等用户拍板**

### 8.3 回退路径

- v20.1.0 tag 是回退锚点
- main 回退: `git reset --hard v20.1.0`（**需用户拍板**）
- 紧急回退: `git revert -m 1 <merge-commit>`（保留历史）

---

## §9. 启动指令

### 9.1 严格遵守的开工指令（rule §6.2）

> "严格遵守 Agent 宪法 v3.8.1 和本实施真源文档，只实施 v20.1.0 patch 范围（合并 4 分支 + 6 文档同步 + git tag + 验证），不要超出范围。完成后停下来汇报，不要自动进入 v21 阶段。"

### 9.2 执行前必做（rule §5.1）

1. ✅ 读 PROJECT_STATUS.md / WORKLOG.md / TODO.md
2. ✅ 读本实施真源文档
3. ⏳ **等待用户拍板 4 决策点**（AskUserQuestion 收集中）
4. ⏳ 创建 feature 分支 `feature/v20-1-patch-ga`
5. ⏳ 基线快照（5 项硬门槛）
6. ⏳ 预检合并冲突（git merge-tree）

### 9.3 执行后必做（rule §16.3）

1. 6 份核心文档同步 v20.1.0 patch 状态
2. 写 v20.1.0 release report
3. 呈报 VERIFICATION 状态 + §7.7 自检 11 项
4. 移交 v21 候选 backlog（B-6 / B-7 / B-8 / B-9）

---

## §10. 附录

### 10.1 v20.1.0 release notes 草稿

> **v20.1.0 patch**（2026-06-23）
>
> **核心变更**：
> - C-1 react-hooks 扫描 0 警告
> - C-4 useVisualizer 早返回修复（11 内存测试）
> - A M7 learning config i18n 迁移（40 config / 738 测试 / 1024 键 i18n）
> - C-2 覆盖率提升 80% → 85.84% Lines（+247 测试）
>
> **质量指标**：
> - 测试 3797/3797 全绿
> - Lint 0 errors / 0 warnings
> - Lines 覆盖率 85.84%（超出 85% 目标）
> - Statements 覆盖率 82.00%（差 3pp，v21 B-6 补完）
> - Branches 覆盖率 68.93%（差 1.07pp，v21 B-6 补完）
> - i18n zh/en 镜像 100%（1,432 键）
> - Bundle 全 < budget
>
> **已知遗留**（移交 v21）：
> - A M8 英文翻译 500-800 键填充（需用户校对 5 核心页面）
> - A M9 完整 E2E 17 页 × 3 场景（51 项）
> - typecheck 2 pre-existing（gif.js 不兼容 — v21 B-4/B-5）
>
> **风险等级**: 🟢 低（不依赖用户校对，主线解封）

### 10.2 相关文档

- [v20 closure report](./2026-06-23-v20-closure-report.md) — v20 阶段 13 章节全面状态
- [v20 第二轮 plan](./2026-06-22-v20-round2-execution-plan.md) — 6 子阶段 WBS
- [v20 第三轮 plan](./2026-06-23-v20-round3-execution-plan.md) — 4 子阶段 WBS
- [v20 C-4 报告](./2026-06-23-c4-memory-leak-report.md) — C-4 修复详情
- [v20 M7 inventory 报告](./../i18n-inventory/08-m7-learning-config-migration.md) — M7 完成详情
- [6-12 月长线路线图](./2026-06-22-longterm-roadmap-v18-to-v24.md) — v20 → v24 战略规划

---

> **创建时间**: 2026-06-23
> **拍板依据**: 用户「选择选项 C」（2026-06-23）
> **状态**: ⏳ **等待用户拍板 4 决策点**（合并策略 / 3 未合并分支 / push / GitHub Release）
