# 文档目录（docs/）

> **整理日期:** 2026-06-22（v14.0.0 GA）
> **目的:** 提供项目所有文档的统一入口，明确活跃文档与归档文档的导航规则。
> **配套根目录文档:** README.md, CLAUDE.md, CHANGELOG.md, ARCHITECTURE.md, PROJECT_SUMMARY.md, CODE_WIKI.md, TODO.md, WORKLOG.md, CONTRIBUTING.md

---

## 目录结构

```
docs/
├── README.md                                          # 本文件 - 文档导航
├── PRD.md                                             # 活跃 - 产品需求文档
├── superpowers/                                       # 活跃 - 设计规范与实施计划
│   ├── specs/                                         # 设计规范
│   └── plans/                                         # 实施计划
├── audit-2026-06-20/                                  # 活跃 - v13 全面代码体检
│   ├── audit-merged.md
│   ├── audit-report-A.md
│   └── audit-report-B.md
└── archive/                                           # 归档 - 过期文档集中存放
    ├── README.md                                      # 归档说明与防误删机制
    ├── iteration-history.md                           # v8/v9/v10 迭代计划合并
    ├── optimization-history.md                        # 优化建议 + 实施计划合并
    ├── issue-and-ui-fixes.md                          # 问题报告 + UI 重构合并
    ├── referenced-planning.md                         # 借鉴计划 + 功能拓展 + 视觉审查合并
    ├── e2e-migration-plan.md                          # E2E 框架迁移评估
    └── trae-glm-prompts.md                            # Trae GLM 专属提示词
```

---

## 活跃文档

### 根目录核心文档（用户要求保持独立）

| 文档 | 版本 | 最后更新 | 用途 |
|------|------|----------|------|
| [README.md](../README.md) | v13.0.0-rc3 | 2026-06-21 | 项目说明与快速开始 |
| [CLAUDE.md](../CLAUDE.md) | v3.7 | 2026-06-20 | AI 协作规则（用户要求独立保留） |
| [CHANGELOG.md](../CHANGELOG.md) | v13.0.0-rc3 | 2026-06-21 | 完整变更日志 |
| [ARCHITECTURE.md](../ARCHITECTURE.md) | v13.0.0-rc3 | 2026-06-21 | 架构设计与技术决策 |
| [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) | v13.0.0-rc3 | 2026-06-21 | 项目总览与统计数据 |
| [CODE_WIKI.md](../CODE_WIKI.md) | v13.0.0-rc3 | 2026-06-21 | 代码导航与说明 |
| [TODO.md](../TODO.md) | v13.0.0-rc3 | 2026-06-21 | 待办任务清单 |
| [WORKLOG.md](../WORKLOG.md) | 持续更新 | 2026-06-21 | 工作日志 |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | 活跃 | 持续更新 | 贡献指南 |

### docs/ 活跃文档

| 文档 | 版本 | 最后更新 | 用途 |
|------|------|----------|------|
| [PRD.md](./PRD.md) | v12.0 | 2026-06-20 | 产品需求文档 |

### superpowers/ 设计规范与实施计划

#### 设计规范（specs/）

| 文档 | 日期 | 状态 |
|------|------|------|
| [2026-06-19-code-reveal-full-coverage-design.md](./superpowers/specs/2026-06-19-code-reveal-full-coverage-design.md) | 2026-06-19 | ✅ 已批准已实施 |
| [2026-06-19-unified-info-panel-design.md](./superpowers/specs/2026-06-19-unified-info-panel-design.md) | 2026-06-19 | ✅ 已批准已实施 |
| [2026-06-20-v13-code-audit-design.md](./superpowers/specs/2026-06-20-v13-code-audit-design.md) | 2026-06-20 | ✅ 已确认，启动修复 |

#### 实施计划（plans/）

| 文档 | 日期 | 状态 |
|------|------|------|
| [2026-06-19-code-reveal-full-coverage.md](./superpowers/plans/2026-06-19-code-reveal-full-coverage.md) | 2026-06-19 | ✅ 已完成 |
| [2026-06-19-home-color-unification-and-avl-traversal.md](./superpowers/plans/2026-06-19-home-color-unification-and-avl-traversal.md) | 2026-06-19 | ✅ 已完成 |
| [2026-06-19-unified-info-panel.md](./superpowers/plans/2026-06-19-unified-info-panel.md) | 2026-06-19 | ✅ 已完成 |
| [2026-06-20-v12-advanced-data-structures-iteration-plan.md](./superpowers/plans/2026-06-20-v12-advanced-data-structures-iteration-plan.md) | 2026-06-20 | ✅ 已完成 |
| [2026-06-20-v13-code-audit-plan.md](./superpowers/plans/2026-06-20-v13-code-audit-plan.md) | 2026-06-20 | ✅ 已完成（Phase A/B/C/D 全部结束） |
| [2026-06-21-v13-phase-h-learning-enhancements.md](./superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md) | 2026-06-21 | ⏳ H2 已完成，H3/H1 待启动 |

### audit-2026-06-20/ v13 全面代码体检

| 文档 | 日期 | 状态 |
|------|------|------|
| [audit-merged.md](./audit-2026-06-20/audit-merged.md) | 2026-06-20 | ✅ 仲裁报告 |
| [audit-report-A.md](./audit-2026-06-20/audit-report-A.md) | 2026-06-20 | Subagent A 报告 |
| [audit-report-B.md](./audit-2026-06-20/audit-report-B.md) | 2026-06-20 | Subagent B 报告 |

---

## 归档文档

> **注意：** 本目录下的所有文档均已过期/已被取代，仅作为项目历史参考保留。**禁止在新增任务中引用此目录作为决策依据。**

详见 [archive/README.md](./archive/README.md)

| 文档 | 原始内容 | 状态 |
|------|----------|------|
| [iteration-history.md](./archive/iteration-history.md) | v8/v9/v10 三个版本迭代计划 | ✅ 全部完成 |
| [optimization-history.md](./archive/optimization-history.md) | 优化建议 + 开发实施计划 | ✅ 已落地 |
| [issue-and-ui-fixes.md](./archive/issue-and-ui-fixes.md) | 测试问题报告 + UI 重构设计 | ✅ 问题全部修复 |
| [referenced-planning.md](./archive/referenced-planning.md) | 借鉴计划 + 功能拓展 + 视觉审查 | ✅ P1 项已实施 |
| [iteration-plan-v11.md](./archive/iteration-plan-v11.md) | v11.0.1 深度优化实施计划 | ✅ 已完成，内容已合并到 CHANGELOG/WORKLOG |
| [e2e-migration-plan.md](./archive/e2e-migration-plan.md) | E2E 框架迁移评估 | ⏳ 评估完成，未执行 |
| [trae-glm-prompts.md](./archive/trae-glm-prompts.md) | Trae GLM 专属提示词 | ✅ 已完成历史使命 |

---

## 文档使用规则

### 新增文档
1. **活跃内容** → 放在 `docs/` 根目录或 `docs/superpowers/` 对应子目录
2. **迭代计划** → 放在 `docs/` 根目录，命名 `iteration-plan-v{version}.md`
3. **设计规范/实施计划** → 放在 `docs/superpowers/{specs|plans}/`，命名 `YYYY-MM-DD-{topic}.md`
4. **审计报告** → 放在 `docs/audit-YYYY-MM-DD/`

### 更新文档
- **根目录核心文档**（README/CLAUDE/CHANGELOG/...）→ 直接覆盖更新
- **迭代计划** → 新建 `iteration-plan-v{next}.md`，旧版移入 `archive/`
- **历史归档** → 禁止直接修改归档文件内容（如需修订，标注"档案修订"动机）

### 引用规则
- 引用活跃文档时使用相对路径（如 `[README.md](../README.md)`）
- 引用归档文档时在文本中明确标注"（归档）"
- 禁止将归档文档作为决策依据

---

## 文档版本追踪

### 当前版本状态
| 文档 | 当前版本 | 上一版本 | 升级日期 |
|------|----------|----------|----------|
| 项目整体 | v13.0.0-rc3 | v12.0.0 | 2026-06-20 |
| iteration-plan | v11.0.1 | v10.0.0 | 2026-06-19 |
| PRD | v12.0 | - | 2026-06-20 |

### 版本规则
- **主版本**（v{major}.0.0）：架构级变更、底层重构
- **次版本**（v{}.{minor}.0）：新功能、新数据结构、新页面
- **补丁版本**（v{}.{}.{patch}）：Bug 修复、文档更新

### 文档日期双校验
为避免误判版本新旧，每个文档保留两个判断依据：
1. **文档日期**（如 2026-06-20）
2. **版本号**（如 v12.0.0）

**判断优先级：** 版本号 > 文档日期（因为版本号是明确的语义标识）

---

## 防止误删机制

详见 [archive/README.md](./archive/README.md#防止误删机制)

核心要点：
1. **归档文件不删除**（除非法案评审委员会批准）
2. **归档修改需明确动机**（标注"档案修订"）
3. **根目录核心文档（CLAUDE.md 等）禁止合并**（用户要求）
4. **活跃路径必须经过审核**

---

> 最后更新: 2026-06-21
