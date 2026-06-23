# A1 子任务 mini-plan：B-6 覆盖率补完（C-2 收尾 3pp Statements + 1pp Branches）

> **创建日期**: 2026-06-24
> **基线**: v20.1.0 patch @ `edaaf95`（origin/main；v21 A3 typecheck 修复 @ `be33345` 仍在独立分支 `feature/v21-b4b5-typecheck` 未 merge main，**严禁触碰** `src/utils/animationExport.ts` 避免 typecheck 错误）
> **分支**: `feature/v21-b6-coverage`（基于 main @ `edaaf95`）
> **依赖**: 用户对 Statements/Branches 目标 + 调研范围拍板
> **风险**: 🟢 低
> **工时**: 2-3d
> **实施模式**: §7.2.1 B 并行（独立子任务）

---

## §1. 目标

按 v20 closure report v20.1.0 release report §2.2 记录：

| 维度 | 基线（v20.1.0）| v20 目标 | v21 目标（待拍板）|
|------|---------|----------|----------|
| **Statements** | 82.00% | 85% | A 85% / B 88% / C 90% |
| **Branches** | 68.93% | 70% | A 70% / B 75% / C 80% |
| **Functions** | 83.40% | 80% | ✅ 已超出 |
| **Lines** | 85.84% | 85% | ✅ 已超出 |

**核心缺口**（3pp Statements + 1pp Branches）：

按 PROJECT_STATUS.md 行 35 + v20.1.0 release report 已知：

- **5 visualizer branches < 50%**：segmentTree / splayTree / avlTree / redBlackTree / skipList
- **utils 错误路径**：try/catch 分支覆盖空白
- **hooks 边界条件**：边界 case 测试

## §2. WBS

### 阶段 1：调研（0.5d）

1. 跑 `npx vitest run --coverage` 拉覆盖率详细报告
2. 解析 5 visualizer branches < 50% 区域（src/__tests__/visualizers/segmentTree.test.ts 等）
3. 列出未覆盖分支清单（行号 + 分支类型）
4. 给用户 3 选项：调研范围（5 visualizer / utils / hooks / 全部）

### 阶段 2：写测试（1-1.5d）

1. 按用户拍板范围写边界测试
2. 每 visualizer 5-10 项
3. utils 错误路径 10-20 项
4. hooks 边界 case 5-10 项
5. AI-TDD：先写测试 → 跑测试（预期红）→ 改代码（绿）→ 验证覆盖率提升

### 阶段 3：验证（0.5d）

1. 5 项硬门槛全过
2. 覆盖率实测对比
3. 范围对比矩阵更新
4. 文档同步

## §3. 关键决策点（等用户拍板）

| # | 决策点 | 选项 |
|---|--------|------|
| 1 | **Statements 目标** | A 85% / B 88% / C 90% |
| 2 | **Branches 目标** | A 70% / B 75% / C 80% |
| 3 | **调研范围** | A 5 visualizer / B 5 visualizer + utils 错误路径 / C 全覆盖 |
| 4 | **交付节奏** | A 单批（1 commit）/ B 分批（按 visualizer 多次）/ C 一次性 |

## §4. 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| 目标过高（A3 选项 C：90% Statements）| 🟡 中 | 调研后给用户调整建议 |
| 测试写不完 | 🟢 低 | 边界测试模板已就绪（v20 C-2 累积）|
| visualizer 边界不可达 | 🟡 中 | 调研阶段先确认可达性 |

## §5. 验收

| 维度 | 目标 | 验收方式 |
|------|------|----------|
| Statements | ≥ 用户拍板目标 | vitest --coverage |
| Branches | ≥ 用户拍板目标 | vitest --coverage |
| 5 项硬门槛 | 全过 | §10.1 |
| 测试数 | ≥ 3797 + 增量 | vitest run |

## §6. 不做范围

- ❌ 架构翻新（§11 地基红线 10 项）
- ❌ 新 visualizer / 新数据结构
- ❌ E2E 测试（v21 B-8 范围）
- ❌ i18n 完整性（v21 B 范围）
- ❌ 性能优化（v22+ 候选）

## §7. 启动指令

> "严格遵守 Agent 宪法和本 mini-plan §2 / §3 / §4 / §5，只实施 A1 子任务（B-6 覆盖率补完），不要超出范围。完成后停下来汇报，不要自动进入 A2/B。"
