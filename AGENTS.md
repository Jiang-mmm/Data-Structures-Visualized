<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

## 项目级强制规则（适用于所有 AI 工具）

> 完整规则在 `.trae/rules/project_rules.md`（Agent 宪法），本节为执行速查。任何 AI 工具（Claude / Codex / Trellis / 其他）都必须遵守。

1. **`design-md/` 默认禁读** — 收录各品牌设计资料，**仅在用户显式指示**下才允许读取对应子目录；所有文件检索类工具调用前必须显式排除 `design-md/`。
2. **设计规范的唯一真源是 `DESIGN.md`** — 视觉/交互决策**必须**以项目根目录的 `DESIGN.md`（若存在）为依据；冲突实现视为越权；`DESIGN.md` 不存在时**不擅自拍板**，向用户确认。
3. **每次任务完成必须同步所有相关文档** — 含 `PROJECT_STATUS.md` / `TODO.md` / `WORKLOG.md` / `README.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `docs/superpowers/{specs,plans}/*` / `CLAUDE.md` / `AGENTS.md` 等；**汇报完成前**完成更新；用户明确豁免需标注 `DOCS: SKIPPED (user override)`。

## 当前活跃计划（2026-06-22）

- **v19 i18n 渐进迁移**：[`docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md`](docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) — 🟡 M0+M1+M2+M3 已完成（基于 v17.0.0 GA）。基线 v17.0.0 GA（merge `b991566`）；M0 8 项决策 D1=B / D2=C / D3=B / D4=B / D5=C / D6=B / D7=B / D8=A 已拍板；M1 硬编码字符串调研清单 17,500 字符已交付；M2 基础设施完成（locales/{zh,en}/ 目录骨架 + integrity.ts + pseudoLocale.ts + 46 项测试）；**M3 TypeScript 强约束完成**（`AssertSameKeys` 深度递归编译时断言 + `no-hardcoded-chinese-in-jsx` 自定义 ESLint 规则 + 45 项测试，i18n+eslint 子目录 95/95）；**M4-1 已收尾**（4 页面 0 字符硬编码，v15.x + v17 累积 `t()` 化完成；按用户拍板 A 跳过步骤 1.2-1.7），详见 [`docs/superpowers/i18n-inventory/03-m4-1-summary.md`](./../i18n-inventory/03-m4-1-summary.md)。M4-2/3 走向待拍板。
- **v18 i18n 全量替换**：（已封存，commit `774025a` 历史快照）— 📦 M0 决策保留为项目记忆；可基于 D1-D5 摘要 + v18 计划文档重启。
- **v17 UI/UX 迭代**：[`docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md`](docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md) — ✅ 已完成（merge `b991566`）。基线 v16.0.0 GA（merge `b8d0b03`）；7 项优化 R1-R7 全部通过浏览器验收（1440p 截图 + DOM 断言 + 7/7 PASS）。
- **v16 设计统一化**：[`docs/superpowers/plans/2026-06-22-design-unification-v16.md`](docs/superpowers/plans/2026-06-22-design-unification-v16.md) — ✅ 已完成（merge `b8d0b03`）。基线 = v16.0.0 GA（commit `879f04e`，2699 测试 / 0 lint / 80.05% 覆盖）。
- **v16+ 工程化（✅ 已完成 2026-06-22）**：ENG-1 E2E 迁移 + ENG-2 覆盖率 80% + ENG-3 lint 归零 + ENH-1 动画导出 + ENH-2 i18n 完善。详见 [长线路线图](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) 第四阶段。
- **v15.x ENH-2 i18n 完善**：[`docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md`](docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md) — ✅ 已完成（2026-06-22）：新增 `complexity` + `algorithms` 命名空间 + `useAlgorithmGlossary` Hook + `AlgorithmGlossaryCard` 组件 + Home 集成 + 20 项测试。

> ⚠️ **`design-md/` 追踪策略**（2026-06-22 发现）：该资料夹当前**未**被 `.gitignore` 收录（`git status` 显示 untracked），与 rule 16.1 隐含假设冲突。**禁止**在未拍板前 commit、stash、或引用其内容。
