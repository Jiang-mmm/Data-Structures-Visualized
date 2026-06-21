# 文档归档目录（archive）

> **整理日期:** 2026-06-21
> **目的:** 集中存放 2026-06-21 文档整理前已过期/已完成的文档，保留所有历史内容供查阅。

---

## 归档原则

本目录下的所有文档均符合以下任一条件：

1. **已被新版本取代**：对应的功能/迭代已在更新的文档中记录（如 `iteration-plan-v8` → `v9` → `v10` → `v11` → `v12`，最新内容已合并到根目录的 `CHANGELOG.md` / `WORKLOG.md`）。
2. **Issue 已全部修复**：报告中的问题已通过后续迭代解决（如 `test-issue-report.md` 中的 ISSUE-001~007 已在 v8.1/v9.0 中修复）。
3. **早期方案被新方案取代**：规划方向已被实施并落地（如早期优化建议 → v9/v10/v11/v12 实施）。
4. **历史参考价值**：作为项目发展历程的参考。

---

## 归档内容索引

| 文件 | 来源 | 原内容主题 | 当前状态 |
|------|------|------------|----------|
| [iteration-history.md](./iteration-history.md) | `iteration-plan-v8/v9/v10.md` | v8.0~v10.0 三个版本的迭代计划 | 全部完成，详细变更已合并到 `CHANGELOG.md` |
| [optimization-history.md](./optimization-history.md) | `optimization-proposal.md` + `development-implementation-plan.md` | 优化建议与开发实施计划 | 建议已落地实施 |
| [issue-and-ui-fixes.md](./issue-and-ui-fixes.md) | `test-issue-report.md` + `ui-redesign-phase1-design.md` | 测试问题报告与 UI 重构设计 | 问题已全部修复 |
| [referenced-planning.md](./referenced-planning.md) | `借鉴计划-数据结构学习助手2.md` + `功能拓展计划-修订版.md` + `项目视觉设计审查报告.md` | 借鉴对比、功能拓展规划、视觉设计审查 | 已整合到 v9-v12 实施 |
| [e2e-migration-plan.md](./e2e-migration-plan.md) | `e2e-migration-plan.md` | E2E 测试框架迁移评估 | 评估完成，状态保留 |
| [trae-glm-prompts.md](./trae-glm-prompts.md) | `Trae GLM 专属｜数据结构可视化项目深度审查&落地优化方案提示词（最终顶配版）.md` | Trae GLM 专属提示词 | 历史提示词归档 |

---

## 防止误删机制

### 1. 命名规则
- 所有归档文档保持原始主题词（如 `iteration-history.md`、`optimization-history.md`），避免使用 `_old` / `_deprecated` 等模糊后缀。
- 每个文件开头明确标注"来源"和"整理日期"，确保可追溯。

### 2. 内容完整性保证
- **不删除内容**：所有过期文档的内容完整保留在新合并文件中，**无信息丢失**。
- **保留关键链接**：合并文件中保留对原文档的引用路径，便于查阅。
- **不破坏 git 历史**：合并前先用 git 备份原文件（如已纳入版本控制）。

### 3. 访问入口保留
- `docs/README.md` 提供完整的活跃/归档文档导航。
- 根目录的 `CLAUDE.md` 不引用本目录（避免误改路径），但根目录的 `WORKLOG.md` / `CHANGELOG.md` 仍可作为完整变更历史的入口。

### 4. 升级保护
- 任何对归档目录的修改需要明确标注"档案修订"动机，不得"顺手删除"。
- 删除归档文件前需先确认其内容已 100% 整合到 `CHANGELOG.md` / `WORKLOG.md` / 其他活跃文档。

---

## 与活跃文档的对应关系

| 归档主题 | 对应活跃文档 |
|----------|--------------|
| v8.0~v10.0 迭代历史 | `CHANGELOG.md` (v8.0~v10.0 条目) + `WORKLOG.md` (2026-06-17~19 工作日志) |
| 优化建议落地 | `ARCHITECTURE.md` (核心设计决策) + `CHANGELOG.md` (v9.0/v10.0/v11.0 优化记录) |
| 测试问题修复 | `CHANGELOG.md` (v8.1 动画挂起修复) + `CLAUDE.md` (动画约束章节) |
| 视觉设计审查 | `CLAUDE.md` (Conventions 章节) + `ARCHITECTURE.md` (代码风格规范) |
| 功能拓展规划 | `TODO.md` (待办任务表) + `iteration-plan-v11.md` (v11 实施计划) |
| v13 修复路线 | `TODO.md` (v13 阶段表) + `docs/audit-2026-06-20/audit-merged.md` |

---

> **维护原则**：本目录为只读归档区，新增内容应放在 `docs/` 活跃区，不要向本目录追加新文档。
