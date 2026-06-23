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

- **v20 第二轮执行计划**：[`docs/superpowers/plans/2026-06-22-v20-round2-execution-plan.md`](docs/superpowers/plans/2026-06-22-v20-round2-execution-plan.md) — ⏳ **等待用户审阅**（按用户拍板"123 全部都要"，6 子阶段：C-1 react-hooks + C-4 avlTreeVisualizer 内存 + C-2 覆盖率 80→85% + A M7 learning config + A M8 英文翻译 + A M9 完整 E2E；~17d / 4 feature 分支 / B 方向不启动）。
- **v20 A + C 并行一次性交付**：[`docs/superpowers/plans/2026-06-22-v20-execution-plan-a-c.md`](docs/superpowers/plans/2026-06-22-v20-execution-plan-a-c.md) — ✅ **本轮交付完成 2026-06-22**（按用户拍板"完整 A + C 并行(推荐)"，在 `feature/v20-c-techdebt` 分支一次性完成 A M5+M6+M9 与 C-3）。A M5 = 42 组件扫描 0 字符 UI 硬编码 / A M6 = 4 文件 utils+components 迁移（themeColors + animationEngine + AlgorithmInfo + Button）+ 27 新 i18n 键 / A M9 = e2e 框架（在 `feature/v20-a-m5-m6-i18n` 分支 commit `d09cbef`）/ C-3 = API.md 公共 API 文档 + ARCHITECTURE.md v17+ 章节 + CONTRIBUTING.md 验证 / **测试 2801/2801 通过 / lint 0 / build OK / bundle OK**。详见 [WORKLOG.md](./../WORKLOG.md) 顶部条目。
- **v20 下一迭代计划**：[`docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md`](docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md) — ⏳ **3 方向文档已交付**（A i18n M5-M9 13d / B AI 智能伴侣 25-30d / C 技术债清理 15-18d）；A + C 本轮已交付，B 视用户额外拍板。
- **6-12 月长线路线图 v18→v24**：[`docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md`](docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md) — 🆕 **已交付**（3 战略主题：T1 国际化 / T2 AI 智能伴侣 / T3 协作教学；4 版本路线 v20-v23；总工时 ~138d；资源 < $250/月；季度里程碑 W1-W8）。
- **v19 i18n 渐进迁移**：[`docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md`](docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) — 🟢 **M0+M1+M2+M3+M4 全部完成 2026-06-22**（基于 v17.0.0 GA）。基线 v17.0.0 GA（merge `b991566`）；M0 8 项决策 D1=B / D2=C / D3=B / D4=B / D5=C / D6=B / D7=B / D8=A 已拍板；M1 硬编码字符串调研清单 17,500 字符已交付；M2 基础设施完成（locales/{zh,en}/ 目录骨架 + integrity.ts + pseudoLocale.ts + 46 项测试）；**M3 TypeScript 强约束完成**（`AssertSameKeys` 深度递归编译时断言 + `no-hardcoded-chinese-in-jsx` 自定义 ESLint 规则 + 45 项测试，i18n+eslint 子目录 95/95）；**M4 全部收尾**（20 目标 100% `t()` 化 / 569 个 `t()` 调用 / 0 字符 UI 硬编码 / 48 行开发者向注释 / 0 代码变更 / 0 测试新增 / 0 locale 文件新增；M4-1 按用户拍板 A / M4-2 按用户拍板 A.1 / M4-3 按用户最新指令"一次性全部完成"），详见 [`docs/superpowers/i18n-inventory/06-m4-closure-report.md`](./../i18n-inventory/06-m4-closure-report.md) + [03-m4-1-summary.md](./../i18n-inventory/03-m4-1-summary.md) + [04-m4-2-p1-strings.md](./../i18n-inventory/04-m4-2-p1-strings.md) + [05-m4-3-p2-strings.md](./../i18n-inventory/05-m4-3-p2-strings.md)。**M5+ 待启动**（v20 方向 A）。
- **v18 i18n 全量替换**：（已封存，commit `774025a` 历史快照）— 📦 M0 决策保留为项目记忆；可基于 D1-D5 摘要 + v18 计划文档重启。
- **v17 UI/UX 迭代**：[`docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md`](docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md) — ✅ 已完成（merge `b991566`）。基线 v16.0.0 GA（merge `b8d0b03`）；7 项优化 R1-R7 全部通过浏览器验收（1440p 截图 + DOM 断言 + 7/7 PASS）。
- **v16 设计统一化**：[`docs/superpowers/plans/2026-06-22-design-unification-v16.md`](docs/superpowers/plans/2026-06-22-design-unification-v16.md) — ✅ 已完成（merge `b8d0b03`）。基线 = v16.0.0 GA（commit `879f04e`，2699 测试 / 0 lint / 80.05% 覆盖）。
- **v16+ 工程化（✅ 已完成 2026-06-22）**：ENG-1 E2E 迁移 + ENG-2 覆盖率 80% + ENG-3 lint 归零 + ENH-1 动画导出 + ENH-2 i18n 完善。详见 [长线路线图](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) 第四阶段。
- **v15.x ENH-2 i18n 完善**：[`docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md`](docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md) — ✅ 已完成（2026-06-22）：新增 `complexity` + `algorithms` 命名空间 + `useAlgorithmGlossary` Hook + `AlgorithmGlossaryCard` 组件 + Home 集成 + 20 项测试。

> ⚠️ **`design-md/` 追踪策略**（2026-06-22 发现）：该资料夹当前**未**被 `.gitignore` 收录（`git status` 显示 untracked），与 rule 16.1 隐含假设冲突。**禁止**在未拍板前 commit、stash、或引用其内容。
