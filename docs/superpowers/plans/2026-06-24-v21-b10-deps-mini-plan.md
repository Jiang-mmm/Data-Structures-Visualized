# A2 子任务 mini-plan：B-10 Dependabot 6 vulnerabilities 升级

> **创建日期**: 2026-06-24
> **基线**: v20.1.0 patch @ `edaaf95`（origin/main；v21 A3 typecheck 修复 @ `be33345` 仍在独立分支 `feature/v21-b4b5-typecheck` 未 merge main，**严禁触碰** `src/utils/animationExport.ts` 避免 typecheck 错误）
> **分支**: `feature/v21-b10-deps`（基于 main @ `edaaf95`）
> **依赖**: 用户对升级策略 + 详细清单拍板
> **风险**: 🟡 中
> **工时**: 0.5d
> **实施模式**: §7.2.1 B 并行（独立子任务）

---

## §1. 目标

按 git push 时 GitHub Dependabot 提示：

> GitHub found 6 vulnerabilities on Jiang-mmm/Data-Structures-Visualized's default branch (2 high, 2 moderate, 2 low).

**修复 6 vulnerabilities** + 验证 5 项硬门槛 + 文档同步。

## §2. WBS

### 阶段 1：调研（0.1d）

1. 跑 `npm audit --json` 拉详细清单
2. 列出 6 vulnerabilities（包名 + CVE + 严重程度 + 修复版本）
3. 评估 devDependencies vs dependencies 占比
4. 给用户 3 选项：升级策略（仅高危 / 全升 / 暂不处理）

### 阶段 2：应用升级（0.2d）

1. 按用户拍板策略升级（npm update / npm install @version）
2. 验证 package.json + package-lock.json 同步
3. 跑 5 项硬门槛
4. 若失败 → 按 §7.2 防灾回滚（git reset --hard）→ 重新调整策略

### 阶段 3：验证 + 文档（0.2d）

1. npm audit 0 vulnerabilities
2. 5 项硬门槛全过
3. 范围对比矩阵更新
4. 文档同步（PROJECT_STATUS / TODO / WORKLOG / v21 plan）

## §3. 关键决策点（等用户拍板）

| # | 决策点 | 选项 |
|---|--------|------|
| 1 | **升级策略** | A 仅高危 CVE ≥ 7（推荐，最小爆炸半径）/ B 全部升级到最新 minor / C 暂不处理 |
| 2 | **devDependencies** | A 同步升级 / B 暂不升级 / C 仅安全相关 |
| 3 | **验证深度** | A 5 项硬门槛（标准）/ B + E2E 烟测 / C + 手动浏览器测试 |
| 4 | **失败回滚** | A 立即回滚（按 §7.2 防灾）/ B 调 Prompt 重试 / C 暂停等用户 |

## §4. 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| 升级破坏兼容（typecheck / lint / test 失败）| 🟡 中 | 阶段 2 逐步升级（一次 1-2 个包）|
| 升级引入新 bug | 🟡 中 | 5 项硬门槛实测 + 范围对比矩阵 |
| 触发 §11 地基红线（devDependencies ~ 限定）| 🟡 中 | 评估后给用户 3 选项（保留 ~ / 移除 ~ / 升 major）|
| Dependabot 报告滞后 | 🟢 低 | 调研后实测 npm audit |

## §5. 验收

| 维度 | 目标 | 验收方式 |
|------|------|----------|
| npm audit vulnerabilities | 0 | npm audit |
| 5 项硬门槛 | 全过 | §10.1 |
| package-lock.json 同步 | ✅ | git diff |
| devDependencies ~ 限定 | 保持 | 除非用户拍板移除 |

## §6. 不做范围

- ❌ 主动升级所有依赖（仅修复漏洞）
- ❌ 引入新依赖
- ❌ major 版本升级（除非用户拍板）
- ❌ 架构翻新（§11 地基红线）

## §7. 启动指令

> "严格遵守 Agent 宪法和本 mini-plan §2 / §3 / §4 / §5，只实施 A2 子任务（B-10 Dependabot 升级），不要超出范围。完成后停下来汇报，不要自动进入 A1/B。"
