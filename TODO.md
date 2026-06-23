# 数据结构学习助手 - TODO 列表

> **版本:** v20（v17.0.0 GA + v19 M0-M4 全部完成 + v20 A+C 本轮一次性交付完成 2026-06-22 + **v20 第二轮 C-4 完成 2026-06-23** + **v20 A M7 全部子阶段完成 2026-06-23**（M7-1 ~ M7-7）+ **v20 全面收尾报告 + C-2 收尾完成 2026-06-23**（247 新测试 + 5 个 C-2 AI 漂移 typecheck 错误修复 + 2 pre-existing 锁定 B-4/B-5））
> **更新日期:** 2026-06-23
> **状态:** v17.0.0 GA 已 merge main（commit `b991566`）→ v18 计划已封存 → v19 M0-M4 全部完成 → v20 A+C 本轮交付（A M5 扫描 0 命中 + A M6 4 文件 utils+components 迁移 + A M9 e2e 框架 + C-3 API.md + ARCHITECTURE.md v17+ 章节）/ 2801 tests / 0 lint / bundle 全 < budget → v20 第二轮 C-4 完成 2026-06-23（useVisualizer 早返回修复 + 11 项新测试）/ 2812 tests / 0 lint → **v20 A M7 全部子阶段完成 2026-06-23**（M7-6 测试 738 项 + M7-7 en 翻译 AI 复审 0 CJK 泄漏 + 4 M7-6 typecheck bug 修复）/ 3550 tests / 0 lint → **v20 C-2 收尾 + 全面收尾报告 2026-06-23**（247 新测试 + useDataStructureState-extra 25 + searchIndex-extra 21 + 之前累积 + 5 个 C-2 AI 漂移遗漏 typecheck 修复）/ **3797 tests** / 0 lint / 2 pre-existing（B-4/B-5 animationExport.ts — gif.js 类型不兼容）→ **v20 阶段收尾状态：4/7 子阶段完成（57%）+ 3 子阶段移交 v21 候选**（A M8 / A M9 / v20.0.0 GA）
> **v16.0.0 GA:** 已完成（2026-06-22，merge `b8d0b03`）— 设计统一化 + ENG-1 E2E 迁移 + ENG-2 覆盖率 >80% + ENG-3 lint 归零 + ENH-1 动画导出 + ENH-2 i18n 完善
> **v15 GA:** 已完成（2026-06-22）— 体验打磨（E1 PWA + E2 大数据 + E3 手势 + E4 模糊搜索 + U2 响应式 + U3 布局一致性 + U4 SVG 图标 + U5 禁用原因 + ISSUE-007 排序撤销阻塞）
> **v14 GA:** 已完成（2026-06-22）— 内容扩张（D1/G1/G2/G3/F2）
> **详细迭代计划:** v11 计划已归档至 [docs/archive/iteration-plan-v11.md](./docs/archive/iteration-plan-v11.md)；v12/v13/v14/v15 计划见 [docs/superpowers/plans/](./docs/superpowers/plans/)，v10/v11/v12 迭代记录见 WORKLOG.md
> **v13 体检报告:** [docs/audit-2026-06-20/audit-merged.md](./docs/audit-2026-06-20/audit-merged.md)
> **Path 3 实施真源文档:** [docs/superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md](./docs/superpowers/plans/2026-06-21-v13-phase-h-learning-enhancements.md)
> **长线路线图:** [docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) / [docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md](./docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md)

---

## v17 UI/UX 迭代（2026-06-22 完成，已 merge main）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ 完成（已 merge main，commit `b991566`） |
| **基线** | v16.0.0 GA（merge `b8d0b03`） |
| **执行分支** | `feature/v17-ui-ux-iterations` |
| **R1 首页精简** | 4 辅助区块折叠为「学习中心」可展开面板（默认收起） |
| **R2 LogPanel 深色模式** | 4 类型 dark: 变体（oper / info / error / code） |
| **R3 SortCompare 布局** | PerformanceChart 移入主内容列；onCompare/onSwap 写 code 日志 |
| **R4 GraphAlgorithm 布局** | ComplexityChart 移至右侧 InfoPanel 同级区（上下布局） |
| **R5 测验扩充** | 5 核心 config 扩充至 5-8 题；QuizPanel Fisher-Yates 随机 |
| **R6 树连接线** | 4 个 tree visualizer 改 `<line>` 直线（B 树 / AVL / 红黑树 / 线段树） |
| **R7 Sort 日志深度** | onCompare/onSwap callback 每步写 addLog('code', ...)，>50 元素按 5 步降频 |
| **验收** | 1440p 浏览器 + Playwright DOM 断言 7/7 PASS；lint 0 / 2699 测试全绿 / build OK / bundle OK |
| **实施真源** | [docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md](./docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md) |

---

## v20 第二轮执行计划（2026-06-22 计划已交付，C-2 收尾 + 全面收尾报告 2026-06-23）

| 维度 | 内容 |
|------|------|
| **状态** | 🟡 **v20 阶段 57% 完成 2026-06-23**（4/7 子阶段）— C-1 ✅ / C-4 ✅ / A M7 全部 ✅ / **C-2 收尾部分达成**（+247 tests / Lines 85.84% / Statements 82% / Branches 68.93%；差 3pp Statements + 1pp Branches）→ ⏳ A M8 / A M9 / v20.0.0 GA 移交 v21 候选 B-7/B-8/B-9（需用户校对翻译）|
| **计划文档** | [docs/superpowers/plans/2026-06-22-v20-round2-execution-plan.md](./docs/superpowers/plans/2026-06-22-v20-round2-execution-plan.md) / [docs/superpowers/plans/2026-06-23-v20-m7-implementation-plan.md](./docs/superpowers/plans/2026-06-23-v20-m7-implementation-plan.md) / [docs/superpowers/plans/2026-06-23-v20-round3-execution-plan.md](./docs/superpowers/plans/2026-06-23-v20-round3-execution-plan.md) |
| **C-4 报告** | [docs/superpowers/plans/2026-06-23-c4-memory-leak-report.md](./docs/superpowers/plans/2026-06-23-c4-memory-leak-report.md) — useVisualizer 早返回修复 + 11 项新测试 / 2812 tests / 0 lint |
| **C-2 收尾报告** | [docs/superpowers/plans/2026-06-23-v20-closure-report.md](./docs/superpowers/plans/2026-06-23-v20-closure-report.md) — 7 子阶段全景 + 范围对比矩阵 + 3 选项 + 13 章节 ~330 行 / 3797 tests / 0 lint / typecheck 2 pre-existing（B-4/B-5） |
| **C-1 扫描** | ✅ 完成（0 react-hooks 警告，扫描报告 v20-c1-react-hooks-scan.md）|
| **阶段 1 P1** | ✅ C-1 扫描完成 + ✅ C-4 修复完成（2026-06-23）|
| **阶段 2 P2** | 🟡 C-2 覆盖率部分达成 2026-06-23（+247 tests / +1.95pp Statements / +1.82pp Lines；差 3pp Statements / 1pp Branches → v21 B-6 补完）|
| **阶段 3 P3** | ✅ A M7 全部子阶段完成（2026-06-23）— 40 config i18n 迁移 + 测试套件 + en 翻译 AI 复审 |
| **阶段 4 P4** | ⏳ A M8 实际英文翻译填充（5d，需用户抽查 5 核心页面，依赖 M7）→ v21 B-7 |
| **阶段 5 P5** | ⏳ A M9 完整 E2E + pseudoLocale 集成（2d，依赖 M7+M8）→ v21 B-8 |
| **阶段 6** | ⏳ v20.0.0 GA + 6 份核心文档同步（1d，依赖 P4+P5）→ v21 B-9 |
| **总工时** | ~17d / 4 feature 分支 / B 方向不启动 |
| **资源** | AI 协作（100%）+ 用户（M7/M8 校对 3-5d）|
| **下一步** | ⏳ **等待用户拍板 v20 closure 3 选项**（A: 接受收尾 + 启动 v21 B-6 / B: 接受收尾 + 启动 v21 B-7 / C: v20.1 patch 直接发布）→ 启动 v21 阶段 |

## v20 下一迭代计划（2026-06-22 已交付，方向待用户拍板）

| 维度 | 内容 |
|------|------|
| **状态** | ⏳ **v20 启动待用户拍板**（3 方向：A / B / C / 组合）|
| **计划文档** | [docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md](./docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md) |
| **A 方向** | i18n 完整收尾 M5-M9（13d，⭐⭐⭐，极低风险）— components / utils / learning config / en 翻译 / E2E |
| **B 方向** | AI 智能学习伴侣（25-30d，⭐⭐⭐，中风险）— Provider 抽象 / 智能提示 / 错误诊断 / 学习路径 / AI Quiz / 隐私 + 限速 |
| **C 方向** | 技术债清理 + 工程深化（15-18d，⭐⭐，低风险）— v13 体检残留 / 覆盖率 80→85% / 文档完善 / 性能优化 |
| **默认推荐** | A + C 并行（独立 feature 分支）；B 视用户额外拍板 |
| **下一步** | 用户拍板 v20 方向 → 创建 `feature/v20-m5-components` 分支 → 启动 M5 |

## 6-12 月长线路线图（2026-06-22 已交付，v18→v24）

| 维度 | 内容 |
|------|------|
| **状态** | 🆕 **6-12 月长线路线图已交付**（3 大战略主题 + 4 版本路线 + 季度里程碑）|
| **计划文档** | [docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md](./docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md) |
| **战略主题 T1** | 国际化与全球触达（2026 H2 - 2027 Q2）— 英文版 / SEO / 教学视频 / Lighthouse 95+ / 多语言扩展 |
| **战略主题 T2** | AI 智能学习伴侣（2026 H2 - 2027 H1）— Provider 抽象 / 智能提示 / 错误诊断 / 学习路径 / AI Quiz / 离线降级 |
| **战略主题 T3** | 协作与教学集成（2027 H1 - H2）— 实时协作 / 教师后台 / LMS 集成 / 课堂演示模式 |
| **版本路线 v20-v23** | v20 2026 Q3 / v21 2026 Q4 / v22 2027 Q1 / v23 2027 Q2 |
| **总工时** | ~138d（6 个月 + 缓冲）|
| **资源** | 单人 + AI 协作 + 外部反馈（教师 ≥ 3 位 / 学生 ≥ 100） |
| **财务** | < $250/月（LLM API + Cloudflare DO + 域名）|

## v19 i18n 渐进迁移（2026-06-22 启动 → M0+M1+M2+M3 已完成）

| 维度 | 内容 |
|------|------|
| **状态** | 🟢 M0+M1+M2+M3+M4 全部完成（基线 v17.0.0 GA）；M5+ 待启动 |
| **M0 决策** | D1=B（UI + learning config）/ D2=C（按语言拆 `locales/{zh,en}/`）/ D3=B（AI + 人工校对）/ D4=B（立即生效 + 测试保底）/ D5=C（namespace + flat keys）/ D6=B（仅 UI 翻译）/ D7=B（高频 10 个 learning）/ D8=A（AI + 单次校对）|
| **M1 产出** | [`docs/superpowers/i18n-inventory/01-hardcoded-strings-inventory.md`](./docs/superpowers/i18n-inventory/01-hardcoded-strings-inventory.md) — 17 页面 + 16 组件 + 5 utils + 31 learning config；v19 范围 ~17,500 字符 |
| **M2 基础设施** | `src/i18n/locales/{zh,en}/` 目录骨架（5 子目录 × 2 语言 + 顶层 index.ts）+ `integrity.ts` 镜像校验工具（7 函数 + INTEGRITY_VERSION）+ `pseudoLocale.ts` 伪语言生成器（5 函数 + 2 常量）+ 46 项单元测试 |
| **M3 TypeScript 强约束** | `AssertSameKeys` 深度递归编译时断言（任意嵌套深度的 zh/en 键镜像检查）+ `no-hardcoded-chinese-in-jsx` 自定义 ESLint 规则（minLength/allowList 配置）+ 45 项单元测试（types 20 + eslint 21 + 与 M2 子目录合并 95 项）；ESLint 注册 local plugin（作用于 `src/{pages,components,visualizers,layouts}/**`，warn 级） |
| **M4 实施真源文档** | [docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md](./docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md)（385 行 13 章节 + §3.0/§4.0/§5.0 收尾状态段）。3 子阶段：M4-1 P0 4 页面（Home/SortPage/ArrayPage/GraphPage，~1550 字符，2d）/ M4-2 P1 13 页面（~2350 字符，2d）/ M4-3 P2 3 目标 + 聚合层接入 + 规则升级（~500 字符，1d）。 |
| **M4 全部收尾** | [docs/superpowers/i18n-inventory/06-m4-closure-report.md](./docs/superpowers/i18n-inventory/06-m4-closure-report.md) — **20 目标 100% `t()` 化**（M4-1 4 页面 202 个 `t()` + M4-2 13 页面 312 个 `t()` + M4-3 3 目标 55 个 `t()` = 合计 **569 个 `t()` 调用** / **0 字符 UI 硬编码** / **48 行开发者向注释** / **0 代码变更** / **0 测试新增** / **0 locale 文件新增**），v15.x ENH-2 + v17 UI/UX 迭代累积 `t()` 化完成；M1 估计 ~2,550+ 字符**严重失真**（差异 > 100%）。子清单：M4-1 [03-m4-1-summary.md](./docs/superpowers/i18n-inventory/03-m4-1-summary.md) / M4-2 [04-m4-2-p1-strings.md](./docs/superpowers/i18n-inventory/04-m4-2-p1-strings.md) / M4-3 [05-m4-3-p2-strings.md](./docs/superpowers/i18n-inventory/05-m4-3-p2-strings.md)。 |
| **测试结果** | 2786/2786 全量测试全绿（基线 2699 + M2 46 + M3 45 + 实际基线增量 0 = 实际 2790 接近）；i18n+eslint 子目录 95/95 |
| **Lint / TypeCheck** | 0 errors / 0 warnings；我引入 TS 错误 0；预存 7 个 v17 GA 错误按规则不跨模块修 |
| **Build** | 成功；i18n-locales 86.61KB / index 77.65KB / vendor-react 231.35KB / vendor-d3 52.54KB（均 < budget）|
| **实施真源** | [docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md](./docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) |
| **下一阶段** | **M5+ 待启动**（推荐顺序：M5 组件级 2d → M6 utils 1d → M7 learning config 3d → M8 实际英文翻译 5d → M9 E2E 2d；启动条件：用户拍板 + 新建 feature 分支）|

---

## v18 i18n 全量替换（2026-06-22 计划 → 已封存）

| 维度 | 内容 |
|------|------|
| **状态** | 📦 **已封存**（M0 决策保留为项目记忆；feature/v18-i18n-foundation 分支 + 10 份 M1 清单已清理） |
| **封存原因** | 用户重新评估后决定暂不启动；M2 启动条件未达 |
| **M0 决策摘要** | D1=B（UI + learning config）/ D2=C（按语言拆 `locales/{zh,en}/`）/ D3=B（AI + 人工校对）/ D4=简化（逐步提交 + 立即生效）/ D5=C（namespace + flat keys） |
| **历史快照** | v18 分支 commit `774025a` 包含完整计划（646 行）+ 5 份文档同步；分支删除前可按需 cherry-pick 还原 |
| **重启条件** | ① 用户明确指令重启；② 基于 M0 决策摘要重新编制实施真源；③ 独立 feature 分支（如 `feature/v18-i18n-foundation`） |

---

## v21 待办 Backlog（2026-06-23 — C-2 收尾后剩余 typecheck 错误）

> **状态**：原 M7-5 拍板 backlog 5 项 → **本次收尾已修 3 项**（B-1 afterEach / B-2 x / B-3 y）→ 剩 **2 项 pre-existing**（B-4 gif.js / B-5 Uint8Array — 需用户决策 gif.js 版本策略）。

| # | 错误 | 位置 | 根因 | 影响 | 状态 |
|---|------|------|------|------|------|
| ~~B-1~~ | ~~`Cannot find name 'afterEach'`~~ | `src/__tests__/components/QuizPanel.test.tsx:1` | ~~`import` 缺 `afterEach`~~ | ~~typecheck 失败~~ | ✅ **2026-06-23 修复**（C-2 收尾）|
| ~~B-2~~ | ~~`'x' is declared but its value is never read`~~ | `src/__tests__/utils/animationExport.test.ts:59` | ~~FakeCtx.getImageData `x` 未使用~~ | ~~lint warning~~ | ✅ **2026-06-23 修复**（`x` → `_x`）|
| ~~B-3~~ | ~~`'y' is declared but its value is never read`~~ | `src/__tests__/utils/animationExport.test.ts:59` | ~~FakeCtx.getImageData `y` 未使用~~ | ~~lint warning~~ | ✅ **2026-06-23 修复**（`y` → `_y`）|
| **B-4** | `Type '"rgb565"' has no properties in common with type 'ApplyPaletteOptions'` | `src/utils/animationExport.ts:234` | `gif.js` 类型定义与新版不兼容 | typecheck 失败 | ⏳ **pre-existing** |
| **B-5** | `Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'BlobPart'` | `src/utils/animationExport.ts:242` | TS 5.8+ 严格 ArrayBuffer 类型推断 | typecheck 失败 | ⏳ **pre-existing** |

**触发**：M7-5 验证发现（2026-06-23）— 是 pre-existing 技术债，与 C-2 无关。
**决策**（用户拍板 C，2026-06-23）：M7-5 范围内不修；标记转 v21 backlog。
**本次收尾额外修复**（C-2 AI 漂移遗漏，2026-06-23）：
- `src/__tests__/utils/sentry.test.ts` × 7：vi.stubEnv 'PROD' 字符串 → boolean
- `src/__tests__/utils/animationExport-extra.test.ts` × 2：x, y → _x, _y
- `src/__tests__/components/Visualizer.test.tsx` × 3：TouchEvent fallback to defineProperty
- `src/__tests__/performanceLogger.test.ts` × 1：'info' → 'function' (valid type)
- `src/__tests__/useColorTheme.test.ts` × 1：mock key/name + 测试用 key
合计 14 个 C-2 漂移错误已修。

**v21 启动条件**：① 用户指令启动 v21 阶段；② 独立 feature 分支；③ 评估 B-4/B-5 影响（gif.js 版本回退 vs 升级；BlobPart cast vs 类型守卫）。
**估计**：~0.5d（2 处小修 + 测试验证 + 文档同步）。

---

## v21 候选 Backlog（v20 阶段未完成项 + 预存技术债 + 质量补完）

> **来源**：v20 全面收尾报告 [docs/superpowers/plans/2026-06-23-v20-closure-report.md](./docs/superpowers/plans/2026-06-23-v20-closure-report.md) §4 v21 候选 Backlog + 本表 v21 B-1~B-5（已 3 修 2 剩）。

| # | 任务 | 范围 | 估计 | 风险 | 优先级 |
|---|------|------|------|------|--------|
| B-1 | ~~QuizPanel afterEach import~~ | 1 处 | 5min | 🟢 | ✅ 2026-06-23 修复 |
| B-2 | ~~animationExport.test.ts x unused~~ | 1 处 | 5min | 🟢 | ✅ 2026-06-23 修复 |
| B-3 | ~~animationExport.test.ts y unused~~ | 1 处 | 5min | 🟢 | ✅ 2026-06-23 修复 |
| **B-4** | `animationExport.ts` gif.js `ApplyPaletteOptions` 不兼容 | 1 处 | 0.5d | 🟡 | ⭐⭐ |
| **B-5** | `animationExport.ts` `Uint8Array<ArrayBufferLike>` 类型转换 | 1 处 | 0.5d | 🟡 | ⭐⭐ |
| **B-6** | C-2 剩余 3pp Statements + 1pp Branches 覆盖率 | visualizers 边界 + utils 错误路径 | 2-3d | 🟢 | ⭐⭐ |
| **B-7** | A M8 实际英文翻译填充（含 5 核心页面用户校对）| 500-800 键 × 2 locales | 5d | 🟡 | ⭐⭐⭐ |
| **B-8** | A M9 完整 E2E + pseudoLocale 集成（51 项 × 3 场景）| 17 页 E2E | 2d | 🟢 | ⭐⭐ |
| **B-9** | v20.0.0 GA 收尾（4 分支 merge + 6 文档 + git tag）| 合并 + 同步 + tag | 1d | 🟢 | ⭐⭐ |

---

## 正在进行的规则同步（2026-06-22）

| 任务 | 状态 | 说明 |
|------|------|------|
| **`design-md/` 默认禁读** | ✅ 已落地 | `.trae/rules/project_rules.md` §16.1；`CLAUDE.md` / `AGENTS.md` / `PROJECT_STATUS.md` 已引用 |
| **`DESIGN.md` 设计真源约束** | ✅ 已落地 | `.trae/rules/project_rules.md` §16.2；冲突实现视为越权 |
| **任务收尾强制文档同步** | ✅ 已落地 | `.trae/rules/project_rules.md` §16.3；本 TODO.md 即按该规则同步更新 |

**后续执行要求**：每次任务完成前必须完成相关文档同步；用户豁免需标注 `DOCS: SKIPPED (user override)`。

---

## i18n 完善 / 算法术语表（2026-06-22 完成）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ 完成 |
| **新增 i18n 命名空间** | `complexity`（13 键）+ `algorithms`（16 数据结构 × 7 字段 = 112 键，type 定义 `AlgorithmGlossaryEntry`） |
| **新增 Hook** | `src/hooks/useAlgorithmGlossary.ts`（16 项术语条目） |
| **新增组件** | `src/components/AlgorithmGlossaryCard.tsx`（默认折叠避免 DOM 过大） |
| **集成页面** | Home（在 LearningPath 之后） |
| **测试** | 20 个（i18n 完整性 8 + hook 5 + component 6 + Home 集成 1） |
| **范围外** | 全项目 100+ 硬编码中文字符串（多为 `hooks.*` 内部日志 + `learningConfig.step.*` 教学文案，不属于用户可见 UI 字符串） |
| **验证** | lint 0/0 / 2699 测试全绿 / build 通过 / bundle check 通过 |
| **实施真源** | [docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md](./docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md) |

---

## 动画导出功能（2026-06-22 完成，SortPage 已集成）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ 完成（SortPage 试点） |
| **新增工具** | `src/utils/animationExport.ts`（WebM / GIF / ZIP 三种导出） |
| **新增组件** | `src/components/AnimationExportButton.tsx`（下拉式菜单） |
| **新增类型** | `src/types/gifenc.d.ts`（gifenc 1.0.3） |
| **新增依赖** | gifenc@1.0.3 + jszip@3.10.1（合计 < 35KB gzipped） |
| **i18n** | `exportAnimation` 命名空间（10 键，中英双文） |
| **测试** | 21 个（12 utils + 9 component） |
| **集成页面** | SortPage（其余 16 个页面可后续独立集成） |
| **验证** | lint 0/0 / 2679 测试全绿 / build 通过 / bundle check 通过 |

---

## v16 设计统一化（2026-06-22 完成）

| 维度 | 内容 |
|------|------|
| **状态** | ✅ M1-M6 全部完成 |
| **Phase A 基础设施** | 新建 `DESIGN.md`（7 章设计真源：哲学/色彩/字体/间距阴影/动效/组件/可视化）；`src/index.css` 新增 v16 token 体系（surface ladder / keycap / command-palette / viz palette）；`.gitignore` 保护 `design-md/` |
| **Phase B 6 组件** | 已有 6 组件（Button/Card/Sidebar/Toast/GlobalSearch/KeyboardHelp）已 v16 对齐；Input/Modal 为 inline 模式无需独立组件 |
| **Phase C 命令面板** | `GlobalSearch` + `KeyboardHelp` 容器改用 `command-palette` class；3 个 `<kbd>` 元素改用 v16 `kbd` utility |
| **Phase D 17 页面** | 18 个 `*Page.tsx` 全部使用 `<PageHeader>`；layoutConsistency 测试覆盖（ArrayPage 已验证 min-h-dvh / flex / grain / page-header 完整结构） |
| **Phase E 17 visualizer** | 全部通过 `getColors()` 接入深色模式（`themeColors.ts` 已维护 light/dark 双调色板） |
| **Phase F 验收** | 测试 2699/2699 通过；ESLint 0 errors；`npm run build` 通过；Bundle check 通过；typecheck 4 个错误为 v16.0.0 GA 既有 `animationExport.ts` 问题（commit `8a81ff8`，与本次设计统一化正交） |
| **构建回归修复** | 修复 Phase A 引入的 `@theme` 块内嵌 `html.dark &` 选择器违反 Tailwind v4 约束 — 移出 `@theme` 块并改为顶层 `html.dark {}` |
| **影响范围** | 4 个核心文件（`index.css` / `GlobalSearch.tsx` / `KeyboardHelp.tsx` / `.gitignore`）+ 6 个文档同步；0 个组件被破坏性重写 |
| **实施真源** | [docs/superpowers/plans/2026-06-22-design-unification-v16.md](./docs/superpowers/plans/2026-06-22-design-unification-v16.md) |

---

## v15 体验打磨（已完成）

| 阶段 | 主题 | 状态 | 说明 |
|------|------|------|------|
| **E1** | PWA 离线 | ✅ 已完成 | ReloadPrompt + Google Fonts caching（commit `ba39cd7`） |
| **E2** | 大数据可视化 | ✅ 已完成 | PerformanceIndicator + 简化渲染（commit `d7952b7`） |
| **E3** | 移动端手势 | ✅ 已完成 | useGestures hook（5 种手势，commit `be4e59d`） |
| **E4** | KeyboardHelp 模糊搜索 | ✅ 已完成 | fuzzyMatchAny 跨页面搜索（commit `66d282c`） |
| **U2** | 响应式操作面板 | ✅ 已完成 | 移动端横向滚动 + collapsibleOnMobile（commit `594cd9f`） |
| **U3** | 跨页面布局一致性 | ✅ 已完成 | GraphAlgorithmPage 修复 + 布局测试（commit `11b298b`） |
| **U4** | SVG 图标系统 | ✅ 已完成 | Icon 组件 + 6 文件 emoji 替换（commit `6518050`） |
| **U5** | 条件禁用按钮原因 | ✅ 已完成 | disabledReason + aria-describedby（commit `1146d47`） |
| **ISSUE-007** | 排序撤销 | ✅ 已完成 | undoBlock 机制（commit `5355ea2`） |

### v15.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2590 passed（137 文件） |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |

---

## 下一阶段

v16 设计统一化（2026-06-22 完成 — M0-M6 全部达成；详见上文“v16 设计统一化”段）。  
下一步方向按需启动：v17 规划（待用户拍板），或基于 v16 基线做点状优化（按 v16.0.0 GA 收尾后的 issue triage 决定）。

> 按 `§16.1` 规则，`design-md/` 默认禁读；按 `§16.2` 规则，`DESIGN.md` 是设计真源（已存在，所有视觉决策必须以其为依据）。

---

## v16+ 工程化（已完成）

详见 [长线路图](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) 第四阶段。

| 阶段 | 主题 | 状态 | 关键产出 | Commit |
|------|------|------|----------|--------|
| **ENG-1** | Playwright 迁移 | ✅ 已完成 | 7 个 `test-*.js` → `*.spec.ts`；`scripts/run-e2e.mjs` | `23913a7` |
| **ENG-2** | 覆盖率 >80% | ✅ 已完成 | statements 77.92% → **80.05%**（+62 tests） | `7da029b` |
| **ENG-3** | lint 警告清理 | ✅ 已完成 | 67 → 0（react-hooks 补全 + 6 个 pre-existing 测试修复） | `6d32435` / `0fb5a2f` |
| **ENH-1** | 动画导出 | ✅ 已完成 | WebM/GIF/帧序列 ZIP；SortPage 集成；`gifenc` + `jszip` | `8a81ff8` |
| **ENH-2** | i18n 完善 | ✅ 已完成 | 125 键术语表；`AlgorithmGlossaryCard` | `99b5b0e` |

### v16.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | **2699 passed**（147 文件） |
| ESLint | **0 errors / 0 warnings** |
| TypeScript strict | 0 错误 |
| 生产构建 | 成功；bundle 全部 < budget（index 77.93KB / vendor-react 231.35KB / vendor-d3 52.54KB） |
| 测试覆盖率 | statements **80.05%** / lines 84.02% / branches 67.23% / functions 81.03% |
| E2E | core/edge/v5-features 三组 spec 全绿（chromium + firefox） |

---

## v14 内容扩张（已完成）

| 阶段 | 主题 | 状态 | 说明 |
|------|------|------|------|
| **D1** | 图算法补齐（4 个） | ✅ 已完成 | Bellman-Ford / Floyd-Warshall / Prim / Kruskal 测试补齐（46 tests，commit `d63a07c`） |
| **G1** | B-Tree | ✅ 已完成 | 多路搜索树完整实现（97 tests，commit `3d0acca`） |
| **G2** | Segment Tree | ✅ 已完成 | 区间查询 + 更新完整实现（104 tests，commit `cc6905f`） |
| **G3** | doublyLinkedList 模式 | ✅ 已完成 | LinkedListPage 双向模式测试补齐（4 tests，commit `0a64d91`） |
| **F2** | 文档完善 | ✅ 已完成 | 算法接入指南（commit `10c1ad5`） |

### v14.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2526 passed（132 文件） |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| 数据结构总数 | 17（原 15 + B-Tree + Segment Tree） |
| 学习配置总数 | 40（原 38 + bTree + segmentTree） |

---

## 下一阶段：v15 体验打磨

详见 [长线路线图](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) 第三阶段。

| 阶段 | 主题 | 说明 |
|------|------|------|
| **E1** | PWA 离线 | Service Worker + Web App Manifest |
| **E2** | 大数据可视化 | 虚拟化 + 增量渲染 |
| **E3** | 移动端手势 | 滑动、双指缩放、长按 |
| **E4** | KeyboardHelp 模糊搜索 | 复用 fuzzySearch |
| **U2** | 响应式操作面板 | 移动端折叠 |
| **U3** | 跨页面布局一致性 | 统一 PageHeader 间距 |
| **U4** | SVG 图标系统 | 替换 emoji |
| **U5** | 条件禁用按钮原因 | aria-describedby + tooltip |
| **ISSUE-007** | 排序撤销 | undoBlock 优化 |

---

## Path 3 — 学习体验增强（v13.0.0-rc2 → GA，已完成）

| 阶段 | 主题 | 状态 | 说明 |
|------|------|------|------|
| **H2** | 全局搜索增强（fuzzy 匹配、搜索历史、复杂度过滤、分类展示） | ✅ 已完成 | fuzzySearch / useSearchHistory / searchIndex 扩展 / GlobalSearch UI 与测试 |
| **H3** | SortComparePage 学习模式 | ✅ 已完成 | sortCompare.config.ts / 页面集成 / 4 个测试（commit `2f56b83`） |
| **H1** | 测验系统 | ✅ 已完成 | QuizQuestion 类型 / useQuizProgress Hook / QuizPanel 组件 / InfoPanel 集成 / 19 个测试（commit `c07b89a`） |

### v13.0.0 GA 验证结果

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2280 passed（123 文件） |
| ESLint | 0 errors / 65 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |

---

## v13 修复路线（来自 audit-merged.md，2026-06-20 待启动）

| Phase | 主题 | 包含问题 | 预计工时 | 验证方式 |
|-------|------|----------|----------|----------|
| **A** | 紧急修复（安全+数据完整性） | S-01/S-02/S-03/E-01/E-04、A-01、A-05 | 1~2 天 | ✅ 已完成（commit 0a544a9）：3494 tests / lint 0 errors / typecheck / build 通过 |
| **B** | 体验+工程优化（性能+渲染+a11y） | P-01~P-04、ANIM-1~5、PERF-1~5、VIZ-1~5、BUG-1~7、A11Y-1~6、MOB-1~6、FB-1~6 | 3~5 天 | ✅ 已完成：lint 0 errors（65 warnings） / typecheck / build 通过 |
| **C** | 文档完善（一致性+API 文档） | D-01~D-07、E-02、E-07、E-09、E-10 | 1~2 天 | ✅ 已完成：8 份文档同步 / package.json version 升级 rc2 |
| **D** | 测试+CI 升级（e2e 框架+覆盖率可视化） | T-01~T-08、E-03、E-05、E-06、E-08 | 2~3 天 | ✅ 已完成：Playwright 20 spec / a11y 17 页 / CI artifacts / setup.ts / snapshot |

**总预计工时**: 7~12 天（单人）

### Top10 优先清单

| 序 | 标签 | 等级 | 问题 | 文件 | 修复方向 |
|----|------|------|------|------|----------|
| 1 | A-独报 | P1 | devDependencies 版本越界（vite ^8 / vitest ^4 / eslint ^10 / tailwind ^4.3 / @sentry ^10） | `package.json:38-54` | `npm ci` 校验 + CI `npm ls --depth=0` |
| 2 | 共识 | P1 | `isValidStoredData` 不递归深度 + `loadFromStorage` `JSON.parse as T` | `useDataStructureState.ts:14-51` | zod/valibot 统一 schema |
| 3 | 共识 | P1 | useVisualizer rafId 闭包错乱 + animationEngine 模块单例 + wait() 闭包链 | `useVisualizer.ts:40-66` + `animationEngine.ts:20-30, 286-293` | rafId 提 ref；preset 挂 useVisualizer() 上下文；wait 加 clearTimers() |
| 4 | 共识 | P1 | `treeVisualizer positionStore` 全局单例 | `treeVisualizer.ts:39-51` | `Map<svgElement, Map<dataIndex, pos>>` 绑 svg |
| 5 | A-独报 | P1 | `useDataStructureState` 渲染阶段写 ref | `useDataStructureState.ts:110-111` | useEffect 包裹 |
| 6 | A-独报 | P1 | `react-hooks/set-state-in-effect` 永久降级 warn | `eslint.config.js:36-37` | 逐文件开启 error 修补后启用 |
| 7 | A-独报 | P1 | vite.config.js 配 `loli.net` 注释写 google fonts | `vite.config.js:27-45` | 移除 loli.net 规则 |
| 8 | B-独报 | P1 | InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸 | `InfoPanel.tsx:36-48` + `LogPanel.tsx:60-61` | 自动跳转改高亮+徽标；aria-relevant=additions |
| 9 | B-独报 | P1 | 树/图键盘 ↑↓ 跳"前/后节点"而非"父/子" + AVL/UnionFind 节点不可 tab | `treeVisualizer.ts:322-335` 等 4 文件 | parentMap + 补 tabindex/role/aria-label |
| 10 | B-独报 | P1 | undo/redo/applyPreset 不打断正在跑的动画 | `useHistory.ts:27-35` 等 3 文件 | 先 `animRef.current?.abort()` |

---

## 已完成（v12 - 跳表 / 并查集 / 红黑树 / 全局搜索）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v12-T5 | 跳表 SkipList | P1 | ✅ | 算法 + Hook + 可视化器（多层水平布局）+ 页面（`/skip-list`）+ 学习配置（7 步）+ 108 个新测试 |
| v12-T6 | 并查集 Union-Find | P1 | ✅ | 算法（路径压缩 + 按秩合并）+ Hook + 可视化器（森林布局）+ 页面（`/union-find`）+ 学习配置（7 步）+ 132 个新测试 |
| v12-T7 | 红黑树 Red-Black Tree | P1 | ✅ | 算法（递归对象表示，插入 + fixup + 旋转）+ Hook + 可视化器（红黑颜色区分）+ 页面（`/red-black-tree`）+ 学习配置（7 步）+ 138 个新测试 |
| v12-T8 | 全局搜索 GlobalSearch | P1 | ✅ | 搜索索引（searchIndex.ts）+ 组件（Ctrl/Cmd+K 唤起，键盘导航）+ Layout 集成 + 13 个新测试 |
| v12-T9 | Sidebar/Home/App 集成 | P1 | ✅ | Sidebar 导出 STRUCTURE_KEYS + 3 个导航项和图标；Home 新增 3 张卡片；App 新增 3 条 lazy Route |
| v12-T10 | i18n 与学习配置注册 | P1 | ✅ | locales.ts 新增 4 个命名空间；learning/index.ts 注册 3 个新配置（37 个总计） |
| v12-T11 | Bundle 优化 | P2 | ✅ | vite.config.js 添加 learning-configs manualChunks 规则 |
| v12-T12 | 新增图算法 D1 | P1 | ✅ | Bellman-Ford、Floyd-Warshall、Prim、Kruskal + 学习配置 + 单元测试，graph 算法扩展到 8 种 |
| v12-T13 | 新增排序算法 D2 | P1 | ✅ | TimSort、ShellSort、CombSort、Counting + 学习配置 + 单元测试，sorting 算法扩展到 12 种 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v12-Q1 | 单元测试 | P0 | ✅ | 3480 tests passed（203 文件），较 v11 增加 391 个新测试 |
| v12-Q2 | ESLint | P0 | ✅ | 0 errors / 66 warnings（全部既有模式，Phase B 后 65 warnings） |
| v12-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v12-Q4 | 生产构建 | P0 | ✅ | 成功，Bundle size check passed（index 63.40KB / vendor-react 231.35KB / vendor-d3 52.54KB） |

### 数据结构总数变化

- v11：12 个数据结构页面（14 条路由含 compare 和 graph-algorithm）
- v12：15 个数据结构页面（17 条路由），新增跳表、并查集、红黑树

### 学习配置总数变化

- v11：34 个学习配置
- v12：37 个学习配置（新增 skipList、unionFind、redBlackTree）

---

## 已完成（代码风格统一与架构优化 P1-P6）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P1 | Import 与导出风格统一 | P1 | ✅ | 17 个 components/ 文件 + useI18n.ts：type 前缀导入、移除未使用 React、后置 memo |
| P2 | 解构与函数签名统一 | P1 | ✅ | useHeapState/useHashState 多行解构、useTrieState void 返回类型、catch (error) 统一 |
| P3 | 类型去重与常量提取 | P1 | ✅ | 新增 visualizerConstants.ts，提取 DEFAULT_NODE_RADIUS / DEFAULT_LEVEL_HEIGHT |
| P4 | 页面公共逻辑提取 | P1 | ✅ | useSharedData<T> 泛型化，11 个页面消除 as any 滥用 |
| P5 | 注释语言统一 | P2 | ✅ | 7 个文件 24 处英文注释翻译为中文，保留技术术语与 JSDoc |
| P6 | ESLint 配置增强 | P1 | ✅ | 安装 typescript-eslint@8.61.1，tseslint.config 覆盖 TS 文件，no-unused-vars 规则 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P1-P6-Q1 | 单元测试 | P0 | ✅ | 3089 tests passed（190 文件） |
| P1-P6-Q2 | ESLint | P0 | ✅ | 0 errors / 59 warnings（全是 react-hooks/exhaustive-deps，已有代码模式） |
| P1-P6-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| P1-P6-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（Phase 5.6 - 统一信息面板 InfoPanel）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P5.6-1 | InfoPanel 组件 | P1 | ✅ | 新增 `src/components/InfoPanel.tsx`，桌面端右侧 w-96 持久面板 + 移动端底部抽屉，双 Tab（操作日志/学习模式） |
| P5.6-2 | LogPanel 重构 | P1 | ✅ | 新增 `variant="embedded"` 模式，卡片式时间线替代旧暗色反转背景 |
| P5.6-3 | 13 页面布局改造 | P1 | ✅ | 11 标准页面 + GraphAlgorithmPage + SortComparePage 改为左右分栏 + InfoPanel |
| P5.6-4 | i18n 国际化 | P1 | ✅ | 新增 `infoPanel` 命名空间 8 个键（中英文） |
| P5.6-5 | 自动跳转机制 | P1 | ✅ | 最新日志含 codeStepId 时自动切换学习 Tab + goToStep |
| P5.6-6 | 测试覆盖 | P1 | ✅ | InfoPanel 9 个测试 + LogPanel embedded 5 个测试 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| P5.6-Q1 | 单元测试 | P0 | ✅ | 3089 tests passed |
| P5.6-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| P5.6-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| P5.6-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（v11.0.1+ - 首页配色统一与 AVL 遍历动画优化）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-PATCH-1 | 首页图/哈希卡片分组色主题统一 | P1 | ✅ | 更新 `--color-card-group-graph` token，四套主题颜色协调 |
| v11-PATCH-2 | AVL 遍历动画优化 | P1 | ✅ | 新增边流动点、节点脉冲，移除冗余 ripple，缩短尾等待 |
| v11-PATCH-3 | 文档同步 | P1 | ✅ | PROJECT_SUMMARY / WORKLOG / TODO / CHANGELOG / README / ARCHITECTURE / CODE_WIKI 同步 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-PATCH-Q1 | 单元测试 | P0 | ✅ | 3042 tests passed（188 文件） |
| v11-PATCH-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| v11-PATCH-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v11-PATCH-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |

---

## 已完成（v11.0.1 - 最终验证、文档同步与 GitHub 部署）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-FINAL-1 | 本地打开兼容修复 | P0 | ✅ | file:// 使用 HashRouter，生产 base 改为 `./` |
| v11-FINAL-2 | 全站语义化颜色统一 | P1 | ✅ | 20+ 文件硬编码颜色替换为 token |
| v11-FINAL-3 | 首页三色分组配色 | P1 | ✅ | 线性/树/图与哈希按 blue/amber/rose 分组 |
| v11-FINAL-4 | A11y 对比度修复 | P1 | ✅ | Sidebar 激活态文字改为 text-ink，12/12 页面 0 violations |
| v11-FINAL-5 | 文档与版本号同步 | P1 | ✅ | PROJECT_SUMMARY/README/ARCHITECTURE/CODE_WIKI/TODO/CHANGELOG/package.json 同步到 v11.0.1 |
| v11-FINAL-6 | GitHub 部署 | P0 | ✅ | 提交并推送 origin/main，触发 CI/Deploy 工作流 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-FINAL-Q1 | 单元测试 | P0 | ✅ | 3042 tests passed（188 文件） |
| v11-FINAL-Q2 | ESLint | P0 | ✅ | 0 错误 / 0 警告 |
| v11-FINAL-Q3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v11-FINAL-Q4 | 生产构建 | P0 | ✅ | 成功，bundle 预算通过 |
| v11-FINAL-Q5 | E2E 功能 | P0 | ✅ | 308/308 passed |
| v11-FINAL-Q6 | E2E A11y | P0 | ✅ | 12/12 页面 0 violations |

---

## 已完成（v11.0 - 全面视觉统一与交互优化）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v11-P1 | 全局色彩系统统一 | P1 | ✅ | Button info 变体改为 accent-blue，收敛页面级强调色为 blue/amber |
| v11-P2 | 排序界面序号标识 | P1 | ✅ | sortVisualizer 柱状图底部新增数组下标序号 |
| v11-P3 | 字典树动画重设计 | P1 | ✅ | trieVisualizer 新增光晕、路径高亮、leaf 完成态动画 |
| v11-P4 | 组件与交互细节修复 | P1 | ✅ | Card 渐变修复、animationEngine 补全 easeInOutCubic |
| v11-P5 | 全面视觉与交互体验 | P1 | ✅ | 统一页面排版、按钮 busy/disabled 状态、动画缓动优化 |
| v11-P6 | 类型修复与最终验证 | P1 | ✅ | 新增 Button outline / UndoPreviewButton secondary 变体；2996→3042 测试 |

---

## 已完成（v10.0 - UI 打磨与可视化定位修复）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v10-P0 | 可视化定位修复 | P0 | ✅ | arrayVisualizer/trieVisualizer 移除 getViewBoxSize，Visualizer 新增 isAnimating prop |
| v10-P1 | 首页与组件 UI 优化 | P1 | ✅ | Home 收敛配色为 2 色，Card 新增 gradient，LearningRecommendations 替换灯泡 emoji，ProgressOverview 目标设定反馈 |
| v10-P2 | 主题渐变色 Token | P2 | ✅ | themeColors 增加 gradientStart/gradientEnd，Home Logo/Hero 使用主题渐变 |
| v10-P3 | 最终验证与文档同步 | P1 | ✅ | 2978 tests / lint 0 / build 成功，PROJECT_SUMMARY/WORKLOG/CHANGELOG 更新 |

---

## 已完成（v9.0 - 全面迭代优化）

### Phase 1：动画与交互修复

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P1-1 | 可视化主体定位修复 | P0 | ✅ | 修复数组/栈/队列/链表可视化主体定位异常 |
| v9-P1-2 | 公共居中工具 | P1 | ✅ | 新建 `src/utils/visualizerLayout.ts`，统一主体居中逻辑 |
| v9-P1-3 | 延迟启动指示器 | P1 | ✅ | 新建 `src/components/AnimationDelayIndicator.tsx` |
| v9-P1-4 | animationEngine delayStart API | P1 | ✅ | animationEngine.ts 新增 delayStart 延迟启动支持 |
| v9-P1-5 | 单元测试扩展 | P1 | ✅ | 单元测试从 2580 增长到 2866 |

### Phase 2：学习路径系统优化

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P2-1 | useLearningProgress 重构 | P0 | ✅ | CustomEvent 同步 + SyncStatus + 统计 API + 目标设定 |
| v9-P2-2 | ProgressOverview 组件 | P1 | ✅ | 新建进度环/统计卡片/目标设定组件 |
| v9-P2-3 | LearningRecommendations 组件 | P1 | ✅ | 新建推荐展示组件 |
| v9-P2-4 | learningRecommender 推荐算法 | P1 | ✅ | 新建 `src/utils/learningRecommender.ts` |
| v9-P2-5 | LearningPath 信息框重设计 | P2 | ✅ | LearningPath.tsx 信息框 UI 优化 |

### Phase 3：可视化界面优化

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P3-1 | trieVisualizer 美化 | P1 | ✅ | radialGradient + 贝塞尔曲线 + computeSubtreeWidth |
| v9-P3-2 | GraphPage 矩阵/邻接表 UI | P1 | ✅ | GraphPage.tsx 矩阵/邻接表 UI 重设计 |
| v9-P3-3 | ComplexityChart 重设计 | P1 | ✅ | 8 色调色板 + 表格视图 |
| v9-P3-4 | GraphAlgorithmPage 横线清理 | P2 | ✅ | 移除多余横线 |

### Phase 4：功能内容拓展

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-P4-1 | 学习配置拓展 | P1 | ✅ | 新建 complexityAnalysis/advancedDataStructures/realWorldApplications 3 个配置 |
| v9-P4-2 | ContentTier 内容分层组件 | P1 | ✅ | 新建 `src/components/ContentTier.tsx`，基础/进阶/拓展三层 |
| v9-P4-3 | 核心页面集成 | P1 | ✅ | ContentTier 集成到 5 个核心数据结构页面 |

### 质量验证

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| v9-Q-1 | 单元测试 | P0 | ✅ | 2866 tests passed（182 文件） |
| v9-Q-2 | ESLint | P0 | ✅ | 0 错误 |
| v9-Q-3 | TypeScript strict | P0 | ✅ | 0 错误 |
| v9-Q-4 | Build | P0 | ✅ | 808ms 成功 |
| v9-Q-5 | Bundle 预算 | P0 | ✅ | 符合（index < 80KB, vendor-react < 250KB, vendor-d3 < 60KB） |

---

## 已完成（v8.1 - 动画挂起修复）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| FIX1 | transitionEnd 超时保护 | P0 | ✅ | animationEngine.ts 新增 3000ms 超时兜底 |
| FIX2 | Visualizer 重渲染修复 | P0 | ✅ | dimensionsRef 缓存，移除 dimensions 依赖 |
| FIX3 | Hash/Heap 链式过渡重构 | P0 | ✅ | 拆分为顺序 await，确保 end 事件捕获 |
| FIX4 | 动画/数据更新顺序修正 | P1 | ✅ | Hash/Heap/Trie 先 insert 再 animate |

---

## 已完成（UI 美化 Phase 1-3）

基于 [docs/archive/referenced-planning.md](./docs/archive/referenced-planning.md) 中归档的「项目视觉设计审查报告」的长期 UI 美化计划。

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| UI-P1-1 | 统一原子组件（Button / Card） | P0 | ✅ | 新建/完善 Button、Card，OperationButton 收敛为工具栏变体 |
| UI-P1-2 | 修复 WCAG 2 AA 对比度 | P0 | ✅ | placeholder / disabled / 副标题文字对比度达标 |
| UI-P2-1 | 修正视口单位 | P1 | ✅ | `h-screen` → `h-dvh` / `min-h-dvh` |
| UI-P2-2 | 统一移动端滚动策略 | P1 | ✅ | 侧边栏展开时锁定 `body` 滚动 |
| UI-P2-3 | 统一焦点环 | P1 | ✅ | 全局 `focus-ring` utility，输入框与小按钮统一 |
| UI-P2-4 | 加载/禁用状态 ARIA 语义 | P1 | ✅ | `aria-busy="true"` / `aria-disabled="true"` |
| UI-P3-1 | 语义化颜色 token | P1 | ✅ | paper / ink / surface / muted / accent 等 light/dark token |
| UI-P3-2 | 圆角与硬阴影 token | P1 | ✅ | `--radius-*` 与 `--shadow-hard-*`，移除 `shadow-soft` |
| UI-P3-3 | 主题完整调色板 | P1 | ✅ | default/forest/warm/royal 四套主题完整 surface 映射 |
| UI-P3-4 | 按钮语义变体收敛 | P1 | ✅ | primary/secondary/danger/success/warning/info/ghost |
| UI-P3-5 | 卡片与边框统一 | P1 | ✅ | 移除 `border-l-4` / `border-dashed`，Card 支持 variant/shadow/radius |
| UI-P3-6 | SVG 字体 token 化 | P1 | ✅ | arrayVisualizer / trieVisualizer 通过 CSS 变量注入字体 |
| UI-P3-7 | 验证与文档 | P1 | ✅ | 2929 tests / lint 0 / build 成功，PROJECT_SUMMARY/WORKLOG/TODO 更新 |

---

## 当前迭代（v12.x 后续阶段 - 待开始）

### Phase G：数据结构扩展（P1 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| G1 | B 树 B-Tree | P1 | ⬜ | 多路搜索树，磁盘存储场景；算法 + Hook + 可视化器 + 页面 + 学习配置 + 测试 |
| G2 | 线段树 Segment Tree | P1 | ⬜ | 区间查询与更新；算法 + Hook + 可视化器 + 页面 + 学习配置 + 测试 |
| G3 | doublyLinkedList 页面 | P2 | ⬜ | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |

### Phase H：学习体验增强（P2 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| H1 | 测验系统 | P2 | ⬜ | 每个数据结构配套测验题，含选择题、填空题、代码题；进度统计与错题本 |
| H2 | 全局搜索增强 | P3 | ⬜ | GlobalSearch 支持模糊匹配、搜索历史、算法复杂度搜索 |
| H3 | SortComparePage 学习模式 | P3 | ⬜ | 对比页面集成学习步骤 |

### Phase U：UI 美化后续（基于审查报告中期项 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| U1 | 动画性能优化与大数据降级 | P1 | ✅ | 统一性能配置模块 performanceConfig；数组/图/树 transform/opacity 动画迁移；力导向 tick transform 优化；animationEngine FPS 自动降级；渲染耗时 measureRender 观测；全部测试通过 |
| U2 | 响应式操作面板重构 | P2 | ⬜ | 小屏下 OperationBar 改为纵向折叠或底部抽屉；增加滑动提示与手势引导 |
| U3 | 跨页面布局一致性 | P2 | ⬜ | 页面内容区 `max-w-7xl` / `max-w-[1440px]`；右侧边栏自适应宽度 |
| U4 | SVG 图标系统 | P2 | ⬜ | 替换 Unicode 图标为统一 SVG icon 库 |
| U5 | 条件禁用按钮原因说明 | P3 | ⬜ | 统一 `title` / `aria-describedby` 说明禁用原因 |

### Phase D：功能扩展（P1 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| D1 | 新增图算法 | P1 | ⬜ | Bellman-Ford、Floyd-Warshall、Prim、Kruskal + 学习配置 + 单元测试 |
| D2 | 新增排序算法 | P1 | ⬜ | TimSort、ShellSort、CombSort + 学习配置 |
| D3 | doublyLinkedList 页面 | P2 | ⬜ | 双向链表配置已存在，需创建对应页面或 LinkedListPage 切换 |
| D4 | SortComparePage 学习模式 | P3 | ⬜ | 对比页面集成学习步骤 |

### Phase E：体验与性能优化（P2 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| E1 | PWA 离线验证 | P2 | ⬜ | 验证 14 个页面离线可访问 |
| E2 | 大数据量可视化优化 | P2 | ⬜ | treeVisualizer >30 跳动画、graphVisualizer >20 跳动画、heapVisualizer >30 跳动画；注意与 U1 协同 |
| E3 | 移动端手势增强 | P3 | ⬜ | 左右滑动切换页面、操作栏底部固定；注意与 U2 协同 |
| E4 | 键盘快捷键搜索 | P3 | ⬜ | KeyboardHelp 支持模糊匹配 |
| E5 | 排序操作撤销支持 | P3 | ⬜ | ISSUE-007: 排序后保留撤销点 |

### Phase F：文档与发布（P3 - 待开始）

| # | 任务 | 优先级 | 状态 | 说明 |
|---|------|--------|------|------|
| F1 | README.md 更新 | P3 | ✅ | 功能列表、测试数据、快速开始章节已同步到 v11.0.1 |
| F2 | CHANGELOG.md 完善 | P3 | ⬜ | 补充 v4.0-v8.0 变更历史 |
| F3 | 版本号同步 | P3 | ✅ | package.json / package-lock.json 已更新到 11.0.1 |
| F5 | GitHub Pages 部署验证 | P3 | ✅ | 已推送 origin/main，CI/Deploy 工作流自动触发 |

---

## 持续改进

| 任务 | 优先级 | 状态 | 说明 |
|------|--------|------|------|
| E2E 框架升级 | P2 | ⬜ | 评估从自定义 runner 迁移到 Playwright Test 框架 |
| 测试覆盖率提升 | P3 | ⬜ | 目标 80%+ 覆盖率，页面组件测试 |
| 贡献指南 | P3 | ⬜ | CONTRIBUTING.md |
| 架构设计文档 | P3 | ⬜ | 补充架构设计文档、组件 API 文档、算法接入指南 |

---

## 技术债务

| 债务项 | 优先级 | 状态 | 影响 | 说明 |
|-------|-------|------|------|------|
| 可视化主体定位异常 | P0 | ✅ 已解决 | 数组/栈/队列/链表主体偏移 | v9.0 Phase 1 通过 visualizerLayout.ts 公共居中工具修复 |
| 学习进度同步机制缺失 | P1 | ✅ 已解决 | 跨组件进度不同步 | v9.0 Phase 2 通过 useLearningProgress 重构（CustomEvent）修复 |
| 学习进度可视化缺失 | P1 | ✅ 已解决 | 用户无法直观查看进度 | v9.0 Phase 2 通过 ProgressOverview 组件修复 |
| 学习推荐机制缺失 | P1 | ✅ 已解决 | 用户缺乏学习引导 | v9.0 Phase 2 通过 learningRecommender + LearningRecommendations 修复 |
| trieVisualizer 视觉效果不足 | P2 | ✅ 已解决 | 字典树可视化层次感弱 | v9.0 Phase 3 通过 radialGradient + 贝塞尔曲线修复 |
| GraphPage 矩阵/邻接表 UI 粗糙 | P2 | ✅ 已解决 | 图数据展示不清晰 | v9.0 Phase 3 通过 UI 重设计修复 |
| ComplexityChart 配色单一 | P2 | ✅ 已解决 | 复杂度对比不直观 | v9.0 Phase 3 通过 8 色调色板 + 表格视图修复 |
| 内容分层缺失 | P1 | ✅ 已解决 | 不同阶段用户学习路径不清 | v9.0 Phase 4 通过 ContentTier 组件修复 |
| E2E 自定义 runner | P2 | ⏳ 待处理 | 缺少重试/并行/报告 | 未使用 Playwright Test 框架 |
| doublyLinkedList 页面缺失 | P2 | ⏳ 待处理 | 学习模式缺口 | 配置存在但无对应页面 |
| 大数据量性能 | P2 | ✅ 已解决 | 100+ 节点帧率下降 | v10 U1 通过 performanceConfig + 跳动画 + transform/opacity 优化解决 |
| 本地打开异常 | P0 | ✅ 已解决 | file:// 下资源路径与路由失效 | v11.0.1 通过 HashRouter + 相对 base 路径修复 |
| 文档缺口 | P3 | ⏳ 部分解决 | onboarding 体验 | README/ARCHITECTURE/CODE_WIKI/TODO 已同步；仍缺 CONTRIBUTING.md、API 文档 |
| lint warnings 清理 | P3 | ⏳ 待处理 | 代码规范 | v13 Phase B 后剩余 65 个 warnings：react-hooks/set-state-in-effect 6 处（InfoPanel/NetworkStatus/OperationGroup/Sidebar/SpeedControl/StepExplainer，已降级为 warn 的既有模式）；react-hooks/exhaustive-deps 59 处（页面 useCallback 缺 `t`/`learningMode` 依赖、Visualizer/useVisualizer/svgRef 依赖等）。修复需重构依赖数组或拆分 effect，风险高于收益，移至后续阶段 |

---

## 已完成里程碑

| 里程碑 | 版本 | 关键交付物 |
|-------|------|-----------|
| M1-M4: 核心功能 + 体验 + 数据结构 + 高级功能 | v2.4-v3.9 | 排序算法、UI/UX、哈希/堆/字典树、算法对比、持久化、i18n |
| M5-M11: 视觉改版 + 功能增强 | v4.0-v4.9 | Timeline、渐变填充、暗色模式、主题系统、撤销预览、分享 |
| M12-M19: TypeScript 迁移 | v5.0-v5.7 | 100% TypeScript、CI/CD、代码质量优化 |
| M20-M23: 图算法 + 学习模式 | v6.0-v6.4 | BFS/DFS/Dijkstra/拓扑排序、学习模式全覆盖、配置模块化 |
| v6.5: 稳定性 | v6.5 | 排序停止修复、abort 机制、E2E 32 项 |
| v8.0: 严格化 + 加固 | v8.0.0 | TypeScript strict、E2E Firefox 支持、CI/CD 完善、2548 单元测试 |
| v8.1: 动画挂起修复 | v8.1.0 | transitionEnd 超时保护、Visualizer 重渲染修复、链式过渡重构、2580 单元测试 |
| v9.0: 全面迭代优化 | v9.0.0 | 动画与交互修复、学习路径系统优化、可视化界面优化、功能内容拓展、2866 单元测试 |
| v10.0: UI 打磨与可视化定位修复 | v10.0.0 | 数组/字典树可视化居中修复、首页配色统一、Card 渐变、主题渐变 token、2978 单元测试 |
| v11.0: 全面视觉统一与交互优化 | v11.0.0 | 全局色彩统一、排序序号、字典树动画重设计、Button/Undo 变体修复、2996→3042 单元测试 |
| v11.0.1: 最终验证与部署 | v11.0.1 | 本地打开兼容、全站配色统一、a11y 对比度修复、文档同步、GitHub 部署 |
| v12.0: 数据结构扩展与全局搜索 | v12.0 | 跳表 / 并查集 / 红黑树 3 个新数据结构、GlobalSearch 全局搜索（Ctrl/Cmd+K）、391 个新测试、3480 单元测试 |

> 详细变更历史见 CHANGELOG.md，工作日志见 WORKLOG.md。

---

> **说明:** 本文档为动态维护文件，随项目迭代持续更新。优先级可能根据实际需求调整。
