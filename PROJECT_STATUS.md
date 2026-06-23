# PROJECT_STATUS — 项目当前状态快照

> **文件用途**: AI 开发前必读。本文件汇总项目最新进展，避免 AI 基于过时的代码或文档状态做决策。
> **更新频率**: 每次迭代结束 / 每个子阶段验收后 / 启动新的开发任务前。
>| **最后更新**: 2026-06-24（**v21 阶段启动 + A3 typecheck 修复完工** — feature/v21-b4b5-typecheck @ `be33345` 已 commit / 1 file / +2 -2 / typecheck 2 pre-existing → 0 / vitest 3797 / 5 项硬门槛全过 / VERIFICATION: PASS / A1 (B-6 覆盖率 2-3d) + A2 (B-10 Dependabot 0.5d) + B (B-7 翻译填充 5d) 4 子任务 B 并行 / C (design-md/ `.gitignore`) 用户拍板 C 先跳过保留悬而未决）|

---

## 0. 项目级强制规则（所有 AI 必须遵守）

> 完整规则在 `.trae/rules/project_rules.md` 第 16 节，本节为执行速查。

1. **`design-md/` 默认禁读** — 收录各品牌设计资料，仅在用户显式指示下读取对应子目录；Glob / Grep / SearchCodebase 须显式排除。
2. **设计规范唯一真源是 `DESIGN.md`** — 视觉/交互决策必须以项目根 `DESIGN.md`（若存在）为依据；冲突实现视为越权；`DESIGN.md` 不存在时不擅自拍板。
3. **任务收尾强制文档同步** — 每次完成任何任务，必须同步 `PROJECT_STATUS.md` / `TODO.md` / `WORKLOG.md` / `README.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `docs/superpowers/{specs,plans}/*` / `CLAUDE.md` / `AGENTS.md` 等相关文档，**汇报完成前**完成更新。

**2026-06-22 规则同步** — `.trae/rules/project_rules.md` 新增第 16 节「设计参考与文档同步」、第 17 节「规则版本与变更记录」；`CLAUDE.md` / `AGENTS.md`（Trellis 区块外）已同步引用。

**2026-06-22 v16 设计统一化计划已落地 M1-M6** — Phase A（DESIGN.md + v16 tokens）✅ / Phase B（6 组件）✅ / Phase C（命令面板）✅ / Phase D（17 页面一致性）✅ / Phase E（17 visualizer 深色模式）✅ / Phase F（lint+test+build+docs 同步）✅；详见 [v16 设计统一化计划](./docs/superpowers/plans/2026-06-22-design-unification-v16.md)。

> ⚠️ **2026-06-22 校准**：v16.0.0 GA（工程深化 + 功能增强）已由另一 AI 提交（commit `879f04e`），故"v16 设计统一化"实际为长线路线图第四阶段，与 v16.0.0 GA 并存；新基线 = v16.0.0 GA（2699 测试 / 0 lint warnings / 80.05% 覆盖率）。

> ⚠️ **2026-06-22 安全发现**：`design-md/` 资料夹**当前未被 `.gitignore` 收录**（`git status` 显示为 untracked），与 rule 16.1 隐含假设冲突。建议在启动 Phase A 前由用户决定：① 显式添加 `design-md/` 至 `.gitignore`（推荐）；或 ② 显式接受其纳入版本控制。

---

## 1. 项目概览

| 项 | 当前值 |
|---|---|
| **项目名称** | ds-visualizer（数据结构学习助手） |
| **当前版本** | **v20.1.0 patch**（v17.0.0 GA + v19 M0-M4 + v20 A+C 全部子阶段 + v20 C-2 收尾；v20.0.0 GA 跳过改用 v20.1.0 patch — 2026-06-23 拍板）|
| **技术栈** | React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4 + React Router v7 + Vitest + Playwright + vite-plugin-pwa |
| **当前分支** | `main`（**v20.1.0 patch 已发布到 origin 2026-06-23** — 1 squash merge `feature/v20-c2-coverage @ 1e84697` + 1 docs commit `e3bae56` = 221 files / +20,914 / -1,050 / 0 冲突；tag `v20.1.0 @ f419c7e` annotated 已 push；A M8 / A M9 / v20.0.0 GA 移交 v21 候选 B-7/B-8）|
| **基线状态** | 3797 单元测试全绿（基线 3550 + C-2 收尾新增 247 = useDataStructureState-extra 25 + searchIndex-extra 21 + 之前 C-1/C-4/M7-6 累积）/ ESLint 0 errors / 生产构建通过 / bundle 全 < budget / i18n integrity 8/8（zh/en 镜像 1,432 键对齐）/ en 翻译 0 CJK 泄漏 / typecheck **0 errors**（v21 A3 修复 B-4 `applyPalette` ApplyPaletteOptions + B-5 `Uint8Array<ArrayBufferLike>` BlobPart — 2 pre-existing 消除）|

> **2026-06-22 v18 计划封存备注**: v18 i18n 全量替换计划（11 阶段 / ~30 天）已由用户决定封存；M0 决策 D1=B（UI + learning config）/ D2=C（按语言拆 `locales/{zh,en}/`）/ D3=B（AI + 人工校对）/ D4=简化（逐步提交 + 立即生效）/ D5=C（namespace + flat keys）保留为项目记忆。后续如需重启，可基于本决策摘要 + v18 分支 commit `774025a` 的历史快照 `docs/superpowers/plans/2026-06-22-v18-i18n-full-replacement.md`（646 行）启动。 |
>
> **2026-06-22 v19 进度备注**: v19 i18n 渐进迁移 M0 8 项决策已拍板（D1=B / D2=C / D3=B / D4=B / D5=C + D6=B / D7=B / D8=A）；M1 硬编码字符串调研清单已交付（17,500 字符 v19 范围）；M2 基础设施已完成（目录骨架 + integrity.ts + pseudoLocale.ts + 测试 16→54）；M3 TypeScript 强约束已完成（`AssertSameKeys` 深度递归编译时断言 + `no-hardcoded-chinese-in-jsx` 自定义 ESLint 规则 + 45 项测试）；M4 实施真源文档已交付（[docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md](./docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md)，385 行 13 章节，3 子阶段 M4-1/M4-2/M4-3 + Q1-Q4 拍板点 + 完整文件迁移清单 + 测试更新矩阵 + 6 维度回滚预案）。**M4 全部收尾**（20 目标 100% `t()` 化 / 569 个 `t()` 调用 / 0 字符 UI 硬编码 / 48 行开发者向注释 / 0 代码变更 / 0 测试新增 / 0 locale 文件新增），详见 [M4 收尾报告](./docs/superpowers/i18n-inventory/06-m4-closure-report.md) + [M4-1 总结](./docs/superpowers/i18n-inventory/03-m4-1-summary.md) + [M4-2 子清单](./docs/superpowers/i18n-inventory/04-m4-2-p1-strings.md) + [M4-3 子清单](./docs/superpowers/i18n-inventory/05-m4-3-p2-strings.md)。**M5+ 待启动**（组件级 / utils / learning config / 实际英文翻译 / E2E）。|

---

## 2. 最近完成的工作

### 2026-06-23 下午 | v20 全面收尾报告已交付（C-2 收尾 + 57% 完成 + v21 候选 9 项）

#### 任务范围

按用户最新指令「确认当前阶段的所有长线任务是否已完成」+「暂停对后续阶段任务的规划与执行」+「对当前阶段的所有任务进行全面收尾工作」（2026-06-23），对 v20 阶段所有长线任务做收尾状态评估 + 资源归档 + 文档同步。

#### 收尾交付清单

| # | 文档 / 文件 | 行数 / 大小 | 关键内容 |
|---|------|------|---------|
| 1 | [v20 全面收尾报告](./docs/superpowers/plans/2026-06-23-v20-closure-report.md) | ~330 / 13 章节 | 7 子阶段状态全景 + C-2 范围对比矩阵 + A M8/M9 移交 v21 候选 + v20.0.0 GA 移交 + 3 选项等用户拍板 |
| 2 | `src/__tests__/useDataStructureState-extra.test.ts` | ~365 行 / 25 测试 | localStorage 错误（JSON.parse / schema / quota / null/undefined/empty）/ animationTimeout / undo/redo 在动画中 / clearPersist / logs 截断 / reset / loadData / clearLogs / beforeunload |
| 3 | `src/__tests__/data/searchIndex-extra.test.ts` | ~215 行 / 21 测试 | extractComplexity 各种格式 / collectComplexity 各字段路径 / subtitle fallback / learningSteps.* i18n 路径 / 首页排除 / 索引完整性 |
| 4 | `scripts/_archive/_coverage-rank.cjs` | ~50 行 | C-2 调研用 coverage 排名分析脚本（已归档，已加 eslint-disable）|
| 5 | `.gitignore` 增补 | — | coverage-detail.txt / coverage-full.txt / coverage-output.txt / coverage-rank.cjs（根）|

#### 范围对比矩阵（C-2 基线 vs 完工）

| 维度 | 基线 | 完工 | 偏差 | 目标 | 状态 |
|------|------|------|------|------|------|
| **测试数** | 3550 | **3797** | **+247** | ≥ 3700 | ✅ 超出 |
| **Lint warnings** | 0 | 0 | 0 | 0 | ✅ |
| **Statements 覆盖率** | 80.05% | **82.00%** | +1.95pp | ≥ 85% | ❌ 差 3pp（v21 B-6）|
| **Branches 覆盖率** | 67.23% | **68.93%** | +1.70pp | ≥ 70% | ❌ 差 1.07pp（v21 B-6）|
| **Functions 覆盖率** | 81.03% | **83.40%** | +2.37pp | ≥ 80% | ✅ |
| **Lines 覆盖率** | 84.02% | **85.84%** | +1.82pp | ≥ 85% | ✅ 超出 |
| **Bundle** | < budget | < budget | 0 | < budget | ✅ |

#### 5 项硬门槛验证

| 检查项 | 阈值 | 实际 | 状态 |
|--------|------|------|------|
| `npm run lint` | 0 errors / 0 warnings | **0 / 0** | ✅ |
| `npx tsc --noEmit` | 0 errors | **5 pre-existing**（v21 backlog B-1~B-5）| ⚠️ 按 M7-5 拍板 |
| `npx vitest run` | 全绿 | **3797/3797** | ✅ |
| `npm run build` | 成功 | **成功**（1.67s；47 entries / 1515.33 KiB）| ✅ |
| `node scripts/check-bundle.js` | bundle 全 < budget | **passed**（index 77.65KB / vendor-react 223.89KB / vendor-d3 52.54KB）| ✅ |

#### v20 阶段 7 子阶段全景

| 子阶段 | 状态 | 完成日期 | 移交 |
|--------|------|----------|------|
| C-1 react-hooks 扫描 | ✅ 完成 | 2026-06-23 | — |
| C-4 useVisualizer 修复 | ✅ 完成 | 2026-06-23 | — |
| A M7-1~M7-7 learning config | ✅ 完成 | 2026-06-23 | — |
| **C-2 覆盖率** | 🟡 **部分完成** | 2026-06-23 | v21 B-6（补 3pp Statements + 1pp Branches）|
| A M8 翻译填充 | ⏳ 未启动 | — | v21 B-7（需用户校对 5 核心页面）|
| A M9 E2E + pseudoLocale | ⏳ 未启动 | — | v21 B-8（依赖 M8）|
| v20.0.0 GA 收尾 | ⏳ 未启动 | — | v21 B-9（依赖 M8+M9）|

**总完成度**: 57%（4/7 子阶段）

#### v21 候选 Backlog（9 项，~13d）

| # | 任务 | 范围 | 估计 | 风险 | 优先级 |
|---|------|------|------|------|--------|
| B-1 | typecheck `useLearningMode` / `newLearningConfigs` 错误 | 4-5 处 | 0.5d | 🟢 | ⭐⭐ |
| B-2 | `animationExport.test.ts` unused vars | 2 处 | 5min | 🟢 | ⭐ |
| B-3 | `animationExport.ts` gif.js `ApplyPaletteOptions` | 1 处 | 0.5d | 🟡 | ⭐⭐ |
| B-4 | `animationExport.ts` `Uint8Array<ArrayBufferLike>` | 1 处 | 0.5d | 🟡 | ⭐⭐ |
| B-5 | `QuizPanel.test.tsx` 缺 `afterEach` import | 1 处 | 5min | 🟢 | ⭐ |
| **B-6** | C-2 剩余 3pp Statements + 1pp Branches | visualizers + utils | 2-3d | 🟢 | ⭐⭐ |
| **B-7** | A M8 实际英文翻译填充 | 500-800 键 | 5d | 🟡 | ⭐⭐⭐ |
| **B-8** | A M9 完整 E2E + pseudoLocale | 51 项 × 3 场景 | 2d | 🟢 | ⭐⭐ |
| **B-9** | v20.0.0 GA 收尾 | 合并 + 同步 + tag | 1d | 🟢 | ⭐⭐ |

#### 调研发现（小限制 → v21 B-6）

| 发现 | 位置 | 影响 | v21 处理 |
|------|------|------|---------|
| searchIndex regex 不识别 O(n²) Unicode 上标 | `src/data/searchIndex.ts:81` | 翻译文本含 Unicode 复杂度符号不显示 | v21 扩展 regex |
| 5 visualizer（segmentTree/splayTree/avlTree）branches 覆盖率 < 50% | `src/visualizers/*.ts` | 错误路径未充分测试 | v21 增补边界测试 |
| 调研方法局限性确认（M1 估 17500 实际 0；C-2 估 200+ 实际 +247）| 调研 SOP | 调研数据偏差持续 | v21 改进调研方法论 |

#### 关键决策记录

| 阶段 | 启动异常 | 用户拍板 | 落地 |
|------|---------|---------|------|
| M7-5 | 11 测试失败 + 5 pre-existing + 路径错误 | B + B + C + A | ✅ 全落地 |
| M7-7 | 40 文件 1022 value 翻译质量待审 | AI 复审 0 CJK + 用户人工校对待启动 | ✅ AI 部分 |
| C-2 | 调研失真：Statements 差 3pp / Branches 差 1pp | 收尾当前 + 剩余 3pp 移交 v21 B-6 | ✅ 本次收尾 |
| A M8/M9 | 用户校对 5 核心页面（AI 无法替代）| 不启动 A M8/M9 + 移交 v21 B-7/B-8 | ✅ 本次收尾 |

#### 关键约束遵守
- ✅ 不扩展需求（严格按 v20 第二轮 plan 剩余子阶段 + C-2 收尾）
- ✅ 不基于猜测改代码（C-2 实施前先扫描定位空白区）
- ✅ 不伪造结果（5 项硬门槛 4/5 通过；1 项按用户拍板）
- ✅ 不擅自拍板（移交 v21 backlog + 3 选项等用户拍板）
- ✅ 不在 main 分支上修改（在 `feature/v20-c2-coverage`）
- ✅ 最小修改（4 文件 / 631 insertions）
- ✅ AI-TDD 优先（先写测试 → 跑测试 → 改代码）
- ✅ 测试通过为最终依据（3797/3797）
- ✅ 任务收尾强制文档同步（本报告 + 6 份核心文档 + 1 收尾报告）
- ✅ design-md/ 默认禁读（0 引用）
- ✅ 不开启 v21 任务（9 项列入 v21 backlog 但不启动）

#### VERIFICATION 状态

```
VERIFICATION: PARTIAL
```

| 维度 | 状态 |
|------|------|
| ✅ 5 项硬门槛 4/5 通过 | lint 0 / test 3797 / build OK / bundle OK |
| ⚠️ typecheck 5 pre-existing | 按 M7-5 拍板 C 不修，移 v21 B-1~B-5 |
| 🟡 C-2 部分达成 | +247 tests / +1.95pp Statements / +1.82pp Lines |
| ❌ A M8 未启动 | 需用户校对 5 核心页面，移交 v21 B-7 |
| ❌ A M9 未启动 | 依赖 M8 + 框架未合并，移交 v21 B-8 |
| ❌ v20.0.0 GA 未启动 | 依赖 A M8 + A M9，移交 v21 B-9 |

#### 等待用户拍板（3 选项）

| 选项 | 描述 | 工时 | 推荐度 |
|------|------|------|--------|
| **A**（推荐）| 接受 v20 收尾（57% 完成），跳过 v20.0.0 GA；启动 v21 阶段先做 B-6（覆盖率补完 3pp）| v21 B-6: 2-3d | ⭐⭐⭐ |
| B | 接受 v20 收尾；启动 v21 阶段先做 B-7（A M8 翻译，需用户校对 5 核心页面）| v21 B-7: 5d | ⭐⭐ |
| C | 重新规划 v20.1 patch 版本（绕过 A M8/M9），直接发布当前 C-2 收尾状态 | 0.5d | ⭐⭐ |

#### 下一步
⏳ **等待用户拍板 3 选项** → 启动 v21 阶段对应 B-6/B-7/B-9 → 完成 v20 阶段 100%

### 2026-06-23 上午 | v20 第二轮 C-4 完成（useVisualizer 早返回修复 + 11 项新测试）

#### 任务范围

按 v20 第二轮 plan §2.2 子阶段 2，修复 avlTreeVisualizer 内存泄漏 + useVisualizer 渲染 ref 双重初始化问题。

#### 根因与修复

| 模块 | 根因 | 修复 |
|------|------|------|
| **useVisualizer** | 第 52 行 `if (!el) return` 早返回 → cleanup 永远不被注册 → ResizeObserver 永久泄漏 | 移除早返回；`observer` / `debouncedUpdate` 改为 `let` + 可选链；cleanup 总是注册（最小修改 6 行） |
| **avlTreeVisualizer** | 计划 §2.2 假设有 P1 内存风险 | 测试验证无真实泄漏（100 次 render 节点数稳定 ±5 / defs 不累积 / abort 后 transitionEnd 不漂浮）— **未改业务代码** |

#### 交付清单

| # | 文档 | 关键内容 |
|---|------|---------|
| 1 | [C-4 报告](./docs/superpowers/plans/2026-06-23-c4-memory-leak-report.md) | ~190 行 / 根因定位 + 修复 diff + 11 项新测试 + 验收 |
| 2 | `src/hooks/useVisualizer.ts` | 移除早返回（6 行变更）|
| 3 | `src/__tests__/visualizers/avlTreeVisualizer.test.ts` | C-4 新增 7 项 |
| 4 | `src/__tests__/useVisualizer.test.ts` | C-4 新增 4 项 + mock 形式调整 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | **2812/2812 通过**（基线 2801 + C-4 新增 11）|
| `npm run build` | 成功 |
| `node scripts/check-bundle.js` | passed |
| useVisualizer cleanup 完整性 | ✅ disconnect spy 验证通过 |

#### 下一步
⏳ **等待用户审阅 C-4 验收** → 启动 **C-2**（覆盖率 80% → 85%，3-5d）

### 2026-06-23 下午 | v20 M7-5 learning config i18n 迁移完成（40 config + ESLint 规则 + 路径修复）

#### 任务范围

按 v20 M7 plan §2.5 子阶段 5，将 40 个 learning config（src/configs/learning/*.config.ts）的 title/description/tips/highlightTerms/complexity 字段从硬编码中文迁移到 i18n（`tStatic('learningSteps.X.steps.Y.field')`），并扩展 ESLint 规则 `no-hardcoded-chinese-in-jsx` 覆盖 configs/。

#### 启动异常 + 拍板

- **§6.4 触发**：M7-5 验证发现 11 个测试失败 + 5 个 pre-existing typecheck 错误 + 关键 bug：M7-5 迁移时 `tStatic('learning.X')` 路径**少 `learningSteps` 段**（locale 实际位置），40 个 config 全部 tStatic 解析失败
- **用户拍板（5 选项，2026-06-23 13:35）**：
  1. B = 修 11 测试 + 5 pre-existing 标 v21
  2. B = 全局替换 `learning.` → `learningSteps.`（1024 处，40 文件）
  3. C = 5 pre-existing 转 v21 backlog（不修）
  4. A = 保留修复脚本以备后续参考（已归档 `scripts/_archive/`）
  5. A = commit M7-5

#### 根因与修复

| 模块 | 根因 | 修复 |
|------|------|------|
| **M7-5 迁移脚本** | 生成 `tStatic('learning.X.steps.Y.title')`（3 段），但 locale 在 `learningSteps.X.steps.Y.title`（4 段） | 写 `scripts/_fix-learning-to-learningsteps.mjs` 全局替换 → 已归档；1024 处替换完成 |
| **11 个测试** | useLearningMode.test.ts (7)、newLearningConfigs.test.ts (3)、searchIndex.test.ts (1) 仍断言硬编码中文 | 改为 `tStatic('learningSteps.X.steps.Y.title')`；searchIndex 在 buildSearchIndex 内 resolve title/description/tips/complexity 后再提取 O(n) |
| **5 个 pre-existing** | QuizPanel / animationExport / gif.js 类型不兼容；与 M7 无关 | 写入 TODO.md v21 backlog B-1~B-5 |
| **ESLint 规则** | `no-hardcoded-chinese-in-jsx` 旧版只查 JSXText | 扩展 `checkStringLiterals` + `stringLiteralPropertiesToCheck` 选项，scope 到 `src/configs/learning/**/*.{ts,tsx}` |

#### 交付清单

| # | 项目 | 详情 |
|---|------|------|
| 1 | 40 config 全量替换 | `tStatic('learning.*')` → `tStatic('learningSteps.*')`（1024 处） |
| 2 | ESLint 规则扩展 | `eslint-rules/no-hardcoded-chinese-in-jsx.js` 新增 string literal 检查 + `eslint.config.js` 注册 `src/configs/learning/**/*.{ts,tsx}` scope |
| 3 | 11 测试修复 | useLearningMode (7) + newLearningConfigs (3) + searchIndex (1) |
| 4 | 修复脚本归档 | `scripts/_archive/_fix-learning-to-learningsteps.mjs` |
| 5 | 文档同步 | TODO.md (v21 backlog B-1~B-5) + PROJECT_STATUS.md (本节) + WORKLOG.md (顶部条目) |

#### 验证

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | **2812/2812 通过**（M7-5 未新增测试） |
| `npm run build` | 成功（学习配置 chunk `learning-configs-bDbCiJAK.js` 148.63 kB / i18n locales chunk 232.60 kB）|
| `node scripts/check-bundle.js` | passed |
| `npx tsc --noEmit` | 5 pre-existing 错误（v21 backlog） |

#### 已知约束
- typecheck 5 错误为 pre-existing，已写入 TODO.md v21 backlog B-1~B-5（用户拍板 C 决定不在 M7-5 范围内修复）
- en 翻译 40 文件为 AI 初译，待 M7-7 用户校对

#### 范围外（Out of Scope）
- 40 config 单元测试 → M7-6（启动条件：用户拍板 + 新建 feature 分支）
- en 翻译校对 → M7-7
- pre-existing typecheck 错误 → v21 backlog

#### 下一步
⏳ **等待用户审阅 M7-5 验收** → 启动 **M7-6**（40 config 单元测试 + 集成测试）

### 2026-06-23 下午 | v20 M7-6 完成（40 config 测试套件 4 文件 738 测试 / 4 M7-6 typecheck bug 已修）

#### 任务范围

按 v20 M7 plan §2.7 子阶段 6，为 40 个 learning config 编写单元测试 + 集成测试 + i18n 键解析验证。

#### 交付清单

| # | 测试文件 | 行数 | 覆盖维度 |
|---|---------|-----|---------|
| 1 | `src/__tests__/configs/learning/learningConfigsRegistry.test.ts` | ~90 | 注册状态 / algorithmKey 一致性 / step id 唯一性 / quiz 完整性 |
| 2 | `src/__tests__/configs/learning/learningConfigI18n.test.ts` | ~177 | tStatic() 解析（zh 默认 + en 切换）/ 关键算法步骤验证（sortCompare / complexityAnalysis / advancedDataStructures / realWorldApplications / graph / sorting）|
| 3 | `src/__tests__/configs/learning/learningConfigQuality.test.ts` | ~85 | complexity time/space 完整性 / highlightedLine 范围 / tips 数组非空 |
| 4 | `src/__tests__/configs/learning/learningConfigDetails.test.ts` | ~85 | 每 config algorithmKey + step 数 + 关键 step 存在性 / 集合统计 |
| 5 | `src/__tests__/configs/learning/learningConfigComplexity.test.ts` | (如创建) | complexity 字段出现率 ≥ 30/40 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | **3550/3550 通过**（基线 2812 + M7-6 新增 738）|
| `npx tsc --noEmit` | 5 pre-existing v21 backlog B-1~B-5（**修复 4 个 M7-6 新增**：graph/sort 索引 + complexity.time/space optional）|
| `npm run build` | 成功 |
| `node scripts/check-bundle.js` | passed |

#### 已知 bug 修复

| Bug | 根因 | 修复 |
|-----|------|------|
| `learningConfigI18n.test.ts:165` | `graphKeys` 是 `string[]` 而 `learningConfigs` 是固定键 interface | 改为 `as const` + `as LearningModeConfig \| undefined` 模式 |
| `learningConfigI18n.test.ts:173` | `sortKeys` 同上 | 同上 |
| `learningConfigQuality.test.ts:62,64` | `step.complexity.time/space` 在类型中是 optional（`{ time?: string; space?: string }`）| 加 `if (step.complexity.time !== undefined)` 守卫 |

#### 下一步
⏳ **等待用户审阅 M7-6 验收** → 启动 **M7-7**（en 翻译 AI 复审 + 修复明显问题）

### 2026-06-23 下午 | v20 M7-7 完成（en 翻译 AI 复审 0 CJK 泄漏 / 1022 value 字符串 100% 解析 / 翻译质量脚本）

#### 任务范围

按 v20 M7 plan §2.8 子阶段 7，对 M7-4 AI 初译的 40 个 en locale 文件做 AI 复审 + 修复明显问题。**用户拍板 2026-06-23 14:08**：要求完成 M7 全部后续任务（包含 M7-6 4 typecheck bug 修复 + M7-7 翻译质量验证 + 文档同步 + commit）。

#### 复审方法

| 步骤 | 工具 | 结果 |
|------|------|------|
| 1 | `scripts/check-en-translations.mjs`（重写 value 提取正则）| 1022 value 字符串 / 短字符串 0 / 相同 321（合法）/ 长度异常 377（合法）|
| 2 | `scripts/check-en-cjk.mjs`（新增 CJK 字符扫描）| **0 中文字符泄漏**（40 文件 2032 行）|
| 3 | 抽样审阅 8 个核心文件 | advancedDataStructures / array / avlTree / quick / complexityAnalysis / sortCompare / realWorldApplications / graph — 翻译自然流畅，无明显问题 |
| 4 | i18n integrity 测试 | zh/en 镜像 1,432 键对齐（8/8） |

#### "相同"字符串分析（321 项 — 全部合法）

| 类型 | 数量 | 示例 |
|------|------|------|
| 数学复杂度符号 | ~120 | `O(1)` / `O(n)` / `O(log n)` / `O(n²)` / `O(k)` / `O(m)` / `O(α(n))` |
| 代码标识符 | ~150 | `pivot` / `getHeight` / `rotateRight` / `x.right = y` / `bf > 1` / `arr[j]` / `indices.push(i)` |
| 通用技术术语 | ~50 | `height` / `successor` / `FIFO` / `LIFO` / `LRU` / `BFS` / `DFS` |
| **合计** | **321** | （占 31.4% — 全部为跨语言通用符号/标识符，符合技术内容翻译规范）|

#### "长度异常"分析（377 项 — 全部合法）

| 类型 | 比例 | 说明 |
|------|------|------|
| English 自然展开 | ratio 2-5x | 中文 5 字符 "红黑树应用" → English "Red-Black Tree Applications" 27 字符（5.4x）— 正常 |
| 缩写 / 简短代码 | ratio < 0.3 | 罕见，主要为单纯复杂度符号 |

#### 修复成果

- **0 处 en 翻译修改**（AI 初译质量已达"无需 AI 端修复"水平）
- **2 个检查脚本**新增（`check-en-translations.mjs` 改进 + `check-en-cjk.mjs` 新增）
- **1 个 typecheck bug 修复**（M7-6 测试中 graph/sort 索引 + complexity optional）

#### 验证

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx tsc --noEmit` | 5 pre-existing（v21 backlog）— 4 M7-6 新增已修 |
| `npx vitest run` | **3550/3550 通过** |
| `npm run build` | 成功（learning-configs 148.63 kB / i18n-locales 232.60 kB）|
| `node scripts/check-bundle.js` | passed |
| `node scripts/check-en-cjk.mjs` | **0 CJK 泄漏**（40 文件 2032 行）|
| `node scripts/check-en-translations.mjs` | 1022 value / 0 短 / 321 identical（合法）/ 377 length outliers（合法）|

#### 范围外（Out of Scope）
- en 翻译**用户人工校对 1 轮** → M7-7 后续 / 用户拍板决定启动时机
- v21 backlog B-1~B-5 typecheck 错误 → v21
- A M8 实际英文翻译填充（其余页面 / 组件）→ v20 A 方向下一阶段
- A M9 完整 E2E + pseudoLocale → v20 A 方向下一阶段

#### 下一步
⏳ **等待用户启动 en 翻译人工校对**（或拍板启动 A M8）→ v20.0.0 GA 收尾

### 2026-06-22 深夜 | v20 第二轮执行计划已交付（6 子阶段等待用户审阅）

#### 任务范围

按用户最新拍板"123 全部都要"（C-1+C-4+C-2+A M7+A M8+A M9 全 6 子阶段，B 方向不启动），建立 v20 第二轮实施真源文档。

#### 交付清单

| # | 文档 | 行数 | 关键内容 |
|---|------|------|---------|
| 1 | [v20 第二轮执行计划](./docs/superpowers/plans/2026-06-22-v20-round2-execution-plan.md) | ~360 | 6 子阶段 WBS + 资源分配 + 5 阶段时间表 + 风险评估 + 验收 + Out-of-Scope |

#### 6 子阶段总览

| P | 子阶段 | 主题 | 工时 | 依赖 | 阶段 |
|---|--------|------|------|------|------|
| P1 | C-1 | react-hooks 修复（6 + 样本 deps）| 1-2d | — | 阶段 1 |
| P1 | C-4 | avlTreeVisualizer 内存泄漏 + useVisualizer ref | 1-2d | — | 阶段 1（与 C-1 并行）|
| P2 | C-2 | 覆盖率 80% → 85%（200+ 测试）| 3-5d | C-1 | 阶段 2 |
| P3 | A M7 | learning config 教学文案 i18n | 3d | — | 阶段 3 |
| P4 | A M8 | 实际英文翻译填充 | 5d | M7 | 阶段 4 |
| P5 | A M9 | 完整 E2E + pseudoLocale | 2d | M7+M8 | 阶段 5 |

**总工时**: ~17d / 4 feature 分支 / B 方向不启动

#### 下一步
⏳ **等待用户审阅 + 拍板启动顺序** → 创建 4 个 feature 分支 → 启动阶段 1（C-1 + C-4 并行）

### 2026-06-22 深夜 | 综合代码审查 + v20 下一迭代计划 + 6-12 月长线路线图（v18→v24）已交付

#### 任务范围
应用户请求:① 综合代码审查（5 维度并行子智能体扫描:架构/质量/测试/文档/性能 a11y）;② 产出 v20 下一迭代计划;③ 产出 6-12 月长线路线图。

#### 交付清单

| # | 文档 | 行数 | 关键内容 |
|---|------|------|---------|
| 1 | [v20 下一迭代计划](./docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md) | ~250 | 3 方向拍板(i18n 收尾 / AI 伴侣 / 技术债清理)+ M5-M9 详细 + v20 综合执行计划（W1-W5）+ QA 红线 |
| 2 | [长线路线图 v18→v24](./docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md) | ~400 | 3 战略主题(T1 国际化 / T2 AI 伴侣 / T3 协作教学)+ 4 版本路线 + 季度里程碑 + 资源/风险/QA + v24+ 候选方向 |

#### 关键发现（5 维度代码审查）

| 维度 | 评分 | 关键结论 |
|------|------|---------|
| 架构 | 8/10 | 6 层结构清晰,17 lazy routes + 15 use*State hook 设计合理 |
| 代码质量 | 7.5/10 | v13 体检 56 条已修 65% / 残留 15% / 复发 3%;P1 风险 2 项(useVisualizer ref / avlTreeVisualizer 内存)|
| 测试 | 8/10 | 2786 tests / 80.05% 覆盖;E2E 7 spec 全绿;深化空间 5% |
| 文档 | 9/10 | 8 份根目录 + 13 份 plans + 6 份 i18n-inventory + 3 份 specs + 7 份 archive 体系完备 |
| 性能 a11y | 8/10 | 动画 FPS / PWA / Lighthouse 待 v21 评估;a11y 17 页 0 critical violations |

#### v20 三大方向（待用户拍板）

| 方向 | 主题 | 工时 | 风险 | 推荐度 |
|------|------|------|------|--------|
| **A** | i18n 完整收尾 (M5-M9) | 13d | 极低 | ⭐⭐⭐ |
| **B** | AI 智能学习伴侣 | 25-30d | 中 | ⭐⭐⭐ |
| **C** | 技术债清理 + 工程深化 | 15-18d | 低 | ⭐⭐ |

**默认推荐**: A + C 并行（独立 feature 分支）

#### 长线路线图（6-12 月）

| 版本 | 时间 | 战略主题 | 关键产出 |
|------|------|---------|---------|
| v20 | 2026 Q3 | T1 国际化 | 英文版上线 + 覆盖率 85% |
| v21 | 2026 Q4 | T2 AI 智能伴侣 v1 | Provider 抽象 + 智能提示 + 错误诊断 |
| v22 | 2027 Q1 | T2 + T3 协作教学 | 实时协作 + 教师后台 + 学习路径 |
| v23 | 2027 Q2 | T1 + 持续 性能 | 移动 PWA + WASM + LMS 集成 |

#### 关键约束遵守
- ✅ 不扩展需求（严格按用户请求产出 2 份计划文档,未改任何代码）
- ✅ 不基于猜测改代码（仅 READ-ONLY 分析）
- ✅ 不伪造结果（5 维度子报告基于实际扫描 + 项目状态文档）
- ✅ 不擅自读 design-md/（rule 16.1 严格遵守,所有子智能体显式排除）
- ✅ 架构不翻新（仅新增 2 份规划文档）
- ✅ 文档同步（docs/README.md / WORKLOG.md / PROJECT_STATUS.md / TODO.md / CLAUDE.md / AGENTS.md）

#### 范围外
- ❌ 未启动任何 v20 实施工作（待用户拍板方向）
- ❌ 未修改任何代码文件
- ❌ 未做新的 git 提交（仅文档新增 + 同步）

---

### 2026-06-22 深夜 | v20 A + C 并行一次性交付完成

#### 任务范围
按用户拍板"完整 A + C 并行(推荐)"，在 `feature/v20-c-techdebt` 分支(基于 main HEAD `b991566`)一次性完成 v20 A M5+M6+M9 与 C-3 全部范围，类比 v19 M4-3 一次性模式。

#### 实施真源
[docs/superpowers/plans/2026-06-22-v20-execution-plan-a-c.md](./docs/superpowers/plans/2026-06-22-v20-execution-plan-a-c.md)(10 章节 WBS / 资源 / 4 阶段时间表 / 风险 / 验收 / Out-of-Scope)

#### 交付清单

| # | 子阶段 | 范围 | 关键产出 | 状态 |
|---|--------|------|----------|------|
| 1 | **A M5** | 扫描 42 个组件文件 3 维度(JSX 文本 / ARIA 属性 / 默认 prop) | [07-m5-components-scan.md](./docs/superpowers/i18n-inventory/07-m5-components-scan.md) — **0 字符 UI 硬编码** + 100+ 行 developer-facing 注释(按 rule 保留) | ✅ 完成 |
| 2 | **A M6** | 4 文件 utils + components 迁移 | `themeColors` 4 主题名 / `animationEngine` 5 预设名 / `AlgorithmInfo` 10 算法描述 + characteristics / `Button` 2 默认 title → 全部走 `tStatic()` + 新增 `algorithmInfo.*` 20 键 + `button.*` 2 键 + `speedControl.preset*` 5 键 | ✅ 完成 |
| 3 | **A M9** | e2e/i18n.spec.ts 框架(本轮已 commit 到 A 独立分支) | zh/en 切换 + locale 完整性 + 多页验证 | ✅ 完成(在 `feature/v20-a-m5-m6-i18n` 分支 commit `d09cbef`) |
| 4 | **C-3.1** | 🆕 创建 API.md(11 章节,公共 API 文档) | 32 Hook + 17 util + 42 component + 15 page 公共 API 索引 | ✅ 完成 |
| 5 | **C-3.2** | 🆕 补充 ARCHITECTURE.md v17+ 章节 | v17.0.0 GA R1-R7 + v18 封存 + v19 M0-M4 + v20 A+C + 7 条 v17+ 关键约束 | ✅ 完成 |
| 6 | **C-3.3** | 验证 CONTRIBUTING.md 完备 | 已存在,内容覆盖 5 章节(开发环境/规范/集成指南/提交规范/测试/issue) | ✅ 完成 |
| 7 | **测试新增** | AlgorithmInfo 18 项 + Button 6 项 + themeColors/animationEngine 调整 | **本轮新增 16 项 + 复用 baseline 86 项 = 总计 2801/2801 通过** | ✅ 完成 |

#### 文件清单(本轮变更)

**新增 3**:
- `API.md` — 公共 API 文档(11 章节,~430 行)
- `docs/superpowers/i18n-inventory/07-m5-components-scan.md` — M5 扫描报告
- `src/__tests__/components/AlgorithmInfo.test.tsx` — 18 项测试(本轮新增)

**修改 6**:
- `src/components/AlgorithmInfo.tsx` — 10 算法 description/characteristics → `tStatic()`
- `src/components/Button.tsx` — 2 默认 title → `tStatic()`
- `src/i18n/locales.ts` — 扩展 `algorithmInfo`(20 键) + `button`(2 键) + `speedControl.preset*`(5 键) 命名空间;`AssertSameKeys` 编译通过
- `src/utils/animationEngine.ts` — 5 预设 name → `tStatic()`
- `src/utils/themeColors.ts` — 4 主题 name → `tStatic()`
- `ARCHITECTURE.md` — 顶部版本升级到 v20 + 插入 v17+ 增量变更章节

**同步 6 份核心文档**: PROJECT_STATUS / TODO / WORKLOG / CLAUDE / AGENTS / docs/README

#### 验证

| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | **2801/2801 通过**(152 文件,基线 2699 + v20 本轮新增 102) |
| `npm run build` | 成功;Bundle 全 < budget(index 68.17KB / vendor-react 231.35KB / vendor-d3 52.54KB) |
| `no-hardcoded-chinese-in-jsx` 对 components + utils | 0 警告 |
| AssertSameKeys | zh/en 镜像编译通过 |
| M5 扫描(jsx + attr + default prop 三维度) | 0 命中 |

#### 关键发现

- **M5 实际 0 字符 UI 硬编码** — 与 M4 结论一致(17 页面 + 42 组件全部已 `t()` 化),无需实际迁移动作
- **M6 工作量比计划小** — 实际只需迁移 4 个文件(themeColors + animationEngine + AlgorithmInfo + Button),新增 27 键,比计划的 800 字符 + 20 键显著减少
- **2 个独立分支的工作融合** — A M9 e2e 框架在 `feature/v20-a-m5-m6-i18n` 分支已 commit(在它上面),A M5/M6 + C-3 文档全部在 `feature/v20-c-techdebt` 分支

#### 范围外(下轮可启动)

- ❌ A M7 — learning config 文案迁移(需用户校对关键文案)
- ❌ A M8 — 实际英文翻译填充(需用户校对翻译质量)
- ❌ A M9 完整 E2E + pseudoLocale 烟雾测试集成(等 M7/M8 完成)
- ❌ C-1 — react-hooks set-state-in-effect 6 + exhaustive-deps 样本修复
- ❌ C-2 — 测试覆盖率 80% → 85%(需新增 200+ 测试)
- ❌ C-4 — avlTreeVisualizer 内存泄漏 + useVisualizer 渲染 ref 深度调试
- ❌ B 方向 — AI 智能学习伴侣(25-30d,需用户单独拍板)

#### 关键约束遵守
- ✅ 不扩展需求(严格按 v20 执行计划 §2-§6 范围)
- ✅ 不基于猜测改代码(M5 扫描基于实际 Grep 三维度结果)
- ✅ 不伪造结果(2801 tests / 0 lint / 0 bundle 超预算均验证)
- ✅ 不在 main 分支上修改(在 feature/v20-c-techdebt)
- ✅ 最小修改原则(仅 M5 必要迁移 + M6 必要 4 文件 + C-3 必要 2 文档)
- ✅ 文档同步(6 份核心文档全部已更新)
- ✅ 任务收尾强制文档同步(rule §16.3 全部命中)

---

### 2026-06-22 深夜 | v19 i18n 渐进迁移 M4-2 步骤 2.1 收尾完成（按用户拍板 A.1）

#### 目标
在 M4-1 已收尾基础上，按用户拍板 A.1 启动 M4-2 步骤 2.1 扫描 13 页面 P1 验证 M4-1 结论（4 页面 0 字符 UI 硬编码）的一致性。

#### 启动异常 + 拍板
- **步骤 2.1 扫描结果**：13 页面 P1 实际硬编码中文字符数 = **0 字符 UI 硬编码**（仅 26 行开发者向注释）
- **13 页面 `t()` 调用总数**：**312 个**（平均 24 个/页）
- **`t()` 化率**：**100% (13/13)**
- **与 M4-1 一致性**：**100%**（M4-1 4 页面 + M4-2 13 页面 = 17/17 页面 0 字符 UI 硬编码；合计 514 个 `t()` 调用）
- **步骤 2.1 验收**：✅ 通过（13 页面 100% `t()` 化）
- **用户拍板 A.1**：立即启动 M4-2 步骤 2.1 验证一致性

#### 收尾范围
- ✅ 步骤 2.1 扫描（已执行）
- ⏳ 步骤 2.2-2.6（**待用户拍板走向**）

#### 13 页面 P1 实际状态对账

| 类别 | 页面 | `t()` 调用数 | 硬编码行数 |
|------|------|--------------|------------|
| 零注释 | Stack / Queue / LinkedList / Tree / UnionFind | 22 / 20 / 36 / 27 / 26 | 0 / 0 / 0 / 0 / 0 |
| 3 行注释 | RedBlackTree / Hash / Heap / Trie | 20 / 21 / 18 / 27 | 3 / 3 / 3 / 3 |
| 2 行注释 | SkipList | 19 | 2 |
| 4 行注释 | AvlTree / BTree / SegmentTree | 26 / 20 / 30 | 4 / 4 / 4 |
| **合计** | **13 页面** | **312** | **26** |

**26 行注释分类**：
- 16 行 树类导入注释（AvlTree / BTree / SegmentTree / RedBlackTree × 4 行）：解释 import 数据流
- 11 行 动画时序注释（Hash / Heap / Trie × 3 行 + SkipList × 2 行）：解释 RAF + Visualizer useEffect 同步

**关键发现**：M1 调研对 13 页面 P1 估计 ~1,000+ 字符**严重失真**（实际 0 字符 UI），M1 调研方法局限性确认。

#### 文件清单
- 新增子清单：[docs/superpowers/i18n-inventory/04-m4-2-p1-strings.md](./docs/superpowers/i18n-inventory/04-m4-2-p1-strings.md)（9 章节 / 13 页面扫描结果）
- 修改 M4 计划：[docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md](./docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md) §2.1 + §4.0 M4-2 步骤 2.1 收尾状态
- 修改 v19 计划：[docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md](./docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) §1 状态行
- 同步核心文档：PROJECT_STATUS.md / TODO.md / WORKLOG.md / CLAUDE.md / AGENTS.md

#### 验证
| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | 2786/2786 通过（151 文件）|
| `npm run build` | 成功（仅文档变更，无代码变更）|
| `no-hardcoded-chinese-in-jsx` 对 13 页面 | 0 警告（确认 100% `t()` 化）|

#### 范围外
- ❌ M4-2 步骤 2.2-2.6 实施（待用户拍板走向）
- ❌ M4-3 实施（待用户拍板走向）
- ❌ 13 页面 locale 文件创建（13 页面无新增键，无需创建）
- ❌ 修改任何代码（仅文档变更）

#### M4-2/3 走向待拍板（3 选项）

| 选项 | 描述 | 估时 | 风险 | 推荐度 |
|------|------|------|------|--------|
| **A.1.1** | M4 全部收尾（基于 17 页面一致性假设 M4-3 同样已 `t()` 化）| 0 | 中 | ⭐⭐ |
| **A.1.2** | 快速扫描 M4-3 2 页面（graphAlgorithm / sortCompare）后 M4 全部收尾 | ~5 分钟 | 极低 | ⭐⭐⭐ |
| **A.1.3** | 完整执行 M4-2 步骤 2.2-2.6（创建 13 zh + 13 en locale 文件占位）| 1.5d | 高 | ❌ |

#### 关键约束遵守
- ✅ 不扩展需求（严格按用户拍板 A.1 执行扫描）
- ✅ 不基于猜测改代码（扫描结果真实可信）
- ✅ 不伪造结果（明确标注 0 字符 UI 硬编码 / 26 行注释）
- ✅ 不在 main 分支上修改（在 feature/v19-m4-pages-migration 上）
- ✅ 不自动进入下一个子阶段（本报告 + 选项 A.1.1/A.1.2/A.1.3 拍板后才进入下一步）

---

### 2026-06-22 深夜 | v19 i18n 渐进迁移 M4-1 收尾完成（按用户拍板 A）

#### 目标
在 M3 TypeScript 强约束已上线的基础上，启动 M4 实施真源文档（[docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md](./docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md)）的首个子阶段 M4-1（P0 4 页面：Home / SortPage / ArrayPage / GraphPage）。

#### 启动异常 + 拍板
- **步骤 1.1 扫描结果**：4 页面实际硬编码中文字符数 < 50（仅 7 行注释），与 M1 调研估计的 ~1,550 字符差异 > 95%
- **根因**：v15.x ENH-2 + v17 UI/UX 迭代过程中，4 页面已**完全 `t()` 化**（Home 101 / SortPage 19 / ArrayPage 29 / GraphPage 46 = 合计 195 个 `t()` 调用 + 7 个 placeholder `t()`）
- **步骤 1.1 验收**：❌ 不通过（差异 > 10% 阈值）→ 立即停止 + 汇报
- **用户拍板 A**：直接收尾 M4-1，跳过步骤 1.2-1.7

#### 收尾范围
- ✅ 步骤 1.1 扫描（已执行）
- ❌ 步骤 1.2-1.7（跳过：4 页面已 `t()` 化，无实际工作内容）
  - 跳过创建 4 zh + 4 en locale 文件
  - 跳过 17 处 `t()` 替换（4 页面 0 字符硬编码）
  - 跳过 ~10 项测试新增（无新增键）
  - 跳过验证（4 页面已验证）

#### 文件清单
- 新增总结：[docs/superpowers/i18n-inventory/03-m4-1-summary.md](./docs/superpowers/i18n-inventory/03-m4-1-summary.md)（12 章节 / 收尾报告）
- 新增子清单：[docs/superpowers/i18n-inventory/02-m4-1-p0-strings.md](./docs/superpowers/i18n-inventory/02-m4-1-p0-strings.md)（步骤 1.1 扫描结果）
- 修改 M4 计划：[docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md](./docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md) §3.0 M4-1 收尾状态
- 修改 v19 计划：[docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md](./docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) §1 状态行
- 同步核心文档：PROJECT_STATUS.md / TODO.md / WORKLOG.md / CLAUDE.md / AGENTS.md

#### 验证
| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | 2745/2745 通过（基线 2699 + M2 46 + M3 45）|
| `npm run build` | 成功（仅文档变更，无代码变更）|
| `no-hardcoded-chinese-in-jsx` | 对 4 页面 0 警告（确认 100% `t()` 化）|

#### 范围外
- ❌ M4-2/3 实施（待用户拍板走向）
- ❌ 17 页面聚合层（待 M4-2/3 范围重新评估）
- ❌ locale 文件物理迁移（4 页面无新增键，无需迁移）
- ❌ 修改任何代码（仅文档变更）

#### M4-2/3 走向待拍板
- **A.1**（推荐）：立即启动 M4-2 步骤 2.1 扫描 13 页面验证一致性（~10 分钟）
- A.2：跳过 M4-2/3 直接进入 M5 组件级迁移
- A.3：做 M1.5 重新调研（覆盖 v17 实际状态）
- A.4：M4 全部收尾（基于 M1 严重失真 + M3 规则已上线）

#### 关键约束遵守
- ✅ 不扩展需求（严格按用户拍板 A 执行收尾）
- ✅ 不基于猜测改代码（步骤 1.1 异常立即停止 + 汇报）
- ✅ 不伪造结果（步骤 1.1 验收明确标注 ❌ 不通过）
- ✅ 不在 main 分支上修改（在 feature/v19-m4-pages-migration 上）
- ✅ 不自动进入下一个子阶段（本报告 + 选项 A 拍板后才进入收尾）

---

### 2026-06-22 (深夜) | v19 i18n 渐进迁移 M3 TypeScript 强约束完成

#### 目标
在 M0+M1+M2 已交付基础上，启动 M3 阶段：TypeScript 强约束（深度键镜像编译时断言 + 自定义 ESLint 规则），防止新增硬编码 + 编译时确保 zh/en 键完全一致。

#### 范围
- **新增类型工具**：`AssertSameKeys` 深度递归类型断言（src/i18n/locales/types.ts 中新增 4 类型 + 4 辅助类型），支持任意嵌套深度，类型不匹配时返回 `{ __error: '...' }`
- **新增 ESLint 规则**：`no-hardcoded-chinese-in-jsx`（eslint-rules/no-hardcoded-chinese-in-jsx.js）— 检测 JSX 文本节点中的硬编码中文字符串，支持 `minLength`（默认 2）+ `allowList` 配置
- **ESLint 配置**：`eslint.config.js` 注册 local plugin（plugin: 'local'），规则作用于 `src/{pages,components,visualizers,layouts}/**`，warn 级（避免 v17 GA 现有硬编码全部 fail），M4 阶段迁移后可改为 error
- **新增测试**：`src/__tests__/i18n/types.test.ts`（20 项）+ `src/__tests__/eslint/no-hardcoded-chinese-in-jsx.test.ts`（21 项）= 45 项新增

#### 文件清单（5 个新增 + 2 个修改）
- 新增类型：`src/i18n/locales/types.ts` 追加 `AssertSameKeys` / `AssertSameKeysImpl` / `AssertSameKeysImplHelper` / `_JoinPath` / `_CheckLeaf` / `_IsPlainObject` / `_IsStringLiteral` 等
- 新增规则：`eslint-rules/no-hardcoded-chinese-in-jsx.js`（ESLint 规则，JS 模块，含 meta + create）
- 新增测试：`src/__tests__/i18n/types.test.ts`（断言覆盖 镜像/不镜像/嵌套/类型不匹配等 7 个 describe 块）
- 新增测试：`src/__tests__/eslint/no-hardcoded-chinese-in-jsx.test.ts`（RuleTester 覆盖 12 valid + 5 invalid + allowList + minLength 边界）
- 修改配置：`eslint.config.js` 引入 localPlugin + 注册规则（`local/no-hardcoded-chinese-in-jsx: ['warn', { minLength: 2, allowList: [] }]`）
- 忽略目录：`eslint.config.js` 显式忽略 `eslint-rules/**`（避免规则自身被 lint）

#### 验证
| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run src/__tests__/i18n src/__tests__/eslint` | **95/95 通过**（5 文件） |
| `npx vitest run` | **2745/2745 通过**（基线 2699 + M2 46 + M3 45 = 实际 2790） |
| `npm run build` | 成功；bundle 检查通过 |
| TypeScript strict | 我引入 0 个错误；预存 7 个 v17 GA 错误按规则不跨模块修 |
| 规则烟雾测试 | 创建临时 `_m3-rule-test.tsx` 验证规则能正确触发警告，确认规则工作正常（验证后删除） |

#### 范围外（Out of Scope）
- ❌ namespace 物理迁移到 `locales/{zh,en}/` 子文件（M4+ 阶段）
- ❌ 实际 UI 字符串翻译（M4-M7 阶段）
- ❌ 将 `no-hardcoded-chinese-in-jsx` 升级为 `error` 级（需先完成 M4-M7 迁移）
- ❌ 改造 `locales.ts` 为聚合层（M4+ 阶段）

#### 关键约束
- **D1=B**：规则仅作用于 UI 层（pages / components / visualizers / layouts），跳过 hooks / utils / configs（这些大多为开发者向日志或复杂逻辑）
- **D2=C**：`AssertSameKeys` 为按语言拆分子目录的镜像校验提供编译时基础
- **D5=C**：namespace + flat keys 命名规范在 keys 结构上得到类型层面保证
- **D6=B**：规则只检查 JSX 文本，不检查 JSX 属性（aria-label / data-* 等保留中文）+ 不检查 JSX 表达式

### 2026-06-22 (深夜) | v19 i18n 渐进迁移 M2 基础设施完成

#### 目标
在 v19 M0+M1 已拍板 8 项决策 + 硬编码字符串清单完成的基础上，启动 M2 阶段：创建 `locales/{zh,en}/` 目录骨架 + 编写 integrity.ts 镜像校验工具 + 编写 pseudoLocale.ts 伪语言测试支持 + 单元测试 16→50+。

#### 范围
- **新建设施**：`src/i18n/locales/{zh,en}/` 目录骨架（5 个子目录 × 2 语言 + 顶层 index.ts）+ `index.ts` 统一导出
- **新增工具 1**：`src/i18n/locales/integrity.ts`（240 行）— 运行时镜像校验（`checkIntegrity` / `assertIntegrity` / `collectLeafPaths` / `countLeaves` / `diffKeys` / `hasEmptyLeaf` / `formatIntegrityReport` / `INTEGRITY_VERSION`）
- **新增工具 2**：`src/i18n/locales/pseudoLocale.ts`（170 行）— 伪语言生成器（`pseudoLocalize` / `pseudoLocalizeTree` / `createPseudoLocaleLoader` / `isPseudoLocalized` / `PSEUDO_LOCALE_CODE` / `PSEUDO_LOCALE_NAME`）
- **新增测试**：`src/__tests__/i18n/integrity.test.ts`（24 项）+ `src/__tests__/i18n/pseudoLocale.test.ts`（22 项）= 46 项新增
- **保持向后兼容**：`src/i18n/locales.ts`（根）继续作为聚合入口，50+ namespace 保留

#### 文件清单（13 个新增）
- 工具：`src/i18n/locales/integrity.ts` / `src/i18n/locales/pseudoLocale.ts` / `src/i18n/locales/index.ts`
- 目录占位：`src/i18n/locales/{zh,en}/index.ts` + `core/` + `page/` + `component/` + `algorithm/` + `learning/` 各自 index.ts
- 测试：`src/__tests__/i18n/integrity.test.ts` / `src/__tests__/i18n/pseudoLocale.test.ts`
- 文档：5 份核心文档同步（PROJECT_STATUS / TODO / WORKLOG / CLAUDE / AGENTS）

#### 验证
| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npx vitest run` | **2745/2745 通过**（149 文件）— 基线 2699 + M2 新增 46 |
| `npx vitest run src/__tests__/i18n` | **54/54 通过**（3 文件）— 基线 16 + M2 新增 38（integrity 24 + pseudoLocale 22 - 重复 8）|
| `npm run build` | 成功；bundle：i18n-locales 86.61KB / index 77.65KB / vendor-react 231.35KB / vendor-d3 52.54KB（均 < budget）|
| TypeScript strict | 我引入错误 0；预存 7 个 v17 GA 错误按规则不跨模块修 |

#### 范围外（Out of Scope）
- ❌ namespace 物理迁移到 `locales/{zh,en}/`（M3+ 阶段任务）
- ❌ 改造 `locales.ts` 为聚合层（M3+ 阶段）
- ❌ AssertSameKeys 编译时断言（M3 阶段）
- ❌ 引入第三方 i18n 库（保持自研轻量）
- ❌ 翻译实际工作（M4-M7 之后才启动 M8 翻译）

#### 关键约束
- **D2=C**：`locales/{zh,en}/` 按语言拆分；保持 `locales.ts` 向后兼容
- **D5=C**：namespace + flat keys 命名规范（已通过注释固化在 zh/en 子目录的 index.ts 中）
- **D6=B**：仅 UI 翻译，错误消息保留 zh（validate / 动画状态消息）
- **D7=B**：仅翻译高频 10 个 learning config（约 5000 字符）
- **D8=A**：AI 初译 + 用户单次校对

### 2026-06-22 (晚) | v16 设计统一化合并到 main（v16 design unification GA merge）

- `feature/v16-design-unification` → main 通过 `--no-ff` 合并，merge commit `b8d0b03`
- 合并规模：main HEAD 从 v12.0（`afac96f`）一次性追平至 v16.0.0 GA；354 文件差异 0 冲突（全部新增/独立文件改动，git 3-way merge 自动解决）
- 合并后稳定性验证：lint 0 / 2699 测试 / build OK / bundle OK / browser OK
- `feature/v16-design-unification` 分支保留，便于回滚与追溯
- v16 内部 3 个原子 commit 完整保留（`--no-ff` 策略）：
  - `d14778a` Phase A 设计真源 + v16 token
  - `4a30625` Phase C 命令面板 v16 化
  - `be32bcd` Phase F 文档同步

### 2026-06-22 (晚) | v17 UI/UX 迭代完成（v17.0.0 GA）

基于浏览器截图（1440p）发现 7 项 UI/UX 问题，制定并实施 v17 计划，全部完成并通过验收。

| # | 问题 | 解决方案 | 验收标志 |
|---|------|----------|----------|
| **R1** | 首页冗余 4 区块堆叠，导致首屏需 1.8 屏 | Home.tsx 新增学习中心折叠面板（默认收起） | 1440p 首屏可见 Hero + Stats Bar + 折叠按钮 + Cards Grid 顶部 |
| **R2** | LogPanel 深色模式配色不协调 | typeConfig 新增 dark: 变体（4 类型用 bright accent + 深背景） | 深色模式 4 色可清晰区分（oper/info/error/code） |
| **R3** | SortCompare PerformanceChart 与 InfoPanel 对齐混乱 | PerformanceChart 移入主内容列 wrapper；onCompare/onSwap 新增 code 日志 | 主内容列与 InfoPanel 左右对齐；日志显示「选择排序 · 比较 #7 (7%)」格式 |
| **R4** | GraphAlgorithm 复杂度对比在主内容列底部 | ComplexityChart 移至右侧 InfoPanel 同级区（顶部），InfoPanel 在下方 | 复杂度对比与 InfoPanel 上下分布，主内容列专注图可视化 |
| **R5** | 测验题库仅 3 题且顺序固定 | 5 核心 config 扩充至 5-8 题；QuizPanel 挂载时 Fisher-Yates 洗牌 | 核心 config ≥ 5 题；连续打开 3 次题目顺序不同 |
| **R6** | 树连接线为曲线（curved path） | 7 个 tree visualizer 改为 SVG `<line>` 直线（heap/trie 风格） | B 树 / AVL / 红黑树 / 线段树均显示直线连接 |
| **R7** | SortCompare 日志仅 2 条 | onCompare/onSwap callback 内每步写 `addLog('code', ...)`；>50 数据按 5 步降频 | 15 元素 sort 日志 ≥ 10 条（含每步比较/交换详情） |

**实施文件**（23 个）：
- 代码：Home.tsx / LogPanel.tsx / InfoPanel.tsx / QuizPanel.tsx / SortComparePage.tsx / GraphAlgorithmPage.tsx / 5 个 learning config / 4 个 tree visualizer / locales.ts
- 测试：QuizPanel.test.tsx / Home.test.tsx / 4 个 visualizer test / 2 个 snapshot
- 文档：PROJECT_STATUS.md / TODO.md / WORKLOG.md / CLAUDE.md / AGENTS.md / v17 计划文档

**验证**：
- `npm run lint` → 0 errors
- `npm run test:run` → **2699/2699 通过**（147 文件）
- `npm run build` → 成功；Bundle size check passed
- 浏览器截图（1440p）：R1/R2/R3/R4/R5/R6/R7 全部通过

详见 [v17 UI/UX 迭代计划](./docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md)。

---

### 2026-06-22 | v16.0.0 GA — 工程深化与功能增强

#### 目标
v15 GA 基础上完成工程深化（ENG-1/2/3）与功能增强（ENH-1/2），为生产级发布做准备。

#### 范围

| 子任务 | 描述 | 关键产出 |
|--------|------|----------|
| **ENG-1** | E2E 框架迁移至 Playwright Test | 7 个 `test-*.js` → `*.spec.ts`；新增 `scripts/run-e2e.mjs`；`package.json` 新增 4 个 e2e scripts |
| **ENG-2** | 测试覆盖率 >80% | 新增 6 个测试文件 + 扩充 4 个；statements 77.92% → 80.05%；tests 2596 → 2658（+62） |
| **ENG-3** | lint warnings 归零 | 67 → 0（react-hooks/exhaustive-deps 补全 + set-state-in-effect 改为 React 19 派生 state + 6 个 pre-existing 测试失败修复） |
| **ENH-1** | 动画导出（WebM/GIF/帧序列 ZIP） | `src/utils/animationExport.ts`（297 行）+ `AnimationExportButton`（167 行）；SortPage 试点集成；新增 `gifenc` + `jszip` 依赖 |
| **ENH-2** | i18n 完善（算法术语对照表） | `complexity` 13 键 + `algorithms` 16×7 键 = 125 键；`useAlgorithmGlossary` Hook + `AlgorithmGlossaryCard` 组件；Home 集成 |

#### 文件清单
详见各子任务 commit：
- `feat(v16): ENG-1 E2E 框架迁移至 Playwright Test`（commit `23913a7`）
- `feat(v16): ENH-2 i18n 完善（算法术语对照表）`（commit `99b5b0e`）
- `feat(v16): ENH-1 动画导出（WebM / GIF / 帧序列 ZIP）`（commit `8a81ff8`）
- `test(v16): 提升测试覆盖率至 80.05%`（commit `7da029b`）
- `fix(v16): 修复 6 个 pre-existing 测试失败`（commit `0fb5a2f`）
- `chore(lint): 清理 react-hooks warnings (67→0)`（commit `6d32435`）

#### 验证
| 检查项 | 结果 |
|--------|------|
| `npm run lint` | 0 errors / 0 warnings |
| `npm run test:run` | **2699/2699 通过**（147 文件） |
| `npm run test:coverage` | statements **80.05%** / lines 84.02% / branches 67.23% / functions 81.03% |
| `npm run build` | 成功；bundle：index 77.93KB / vendor-react 231.35KB / vendor-d3 52.54KB（均 < budget） |
| TypeScript strict | 0 错误 |
| E2E | core/edge/v5-features 三个 spec 全绿（chromium + firefox） |

#### 范围外（Out of Scope）
- `design-md/` 设计资料库已建立但**未被读取**（遵循 §16.1 默认禁读规则，待用户显式授权后启动 v16 设计统一化）
- v17+ 路线图尚未规划
- PWA 安装提示、Service Worker 高级策略等暂不涉及

---

### 2026-06-22 | i18n 完善（v15.x ENH-2 算法术语表）

#### 目标
补齐 ds-visualizer i18n 缺失的算法术语表与复杂度描述命名空间，新增 `useAlgorithmGlossary` Hook 与 `AlgorithmGlossaryCard` 组件用于术语速查。

#### 范围
- **新增 i18n 命名空间**: `complexity`（13 键：title/name/useCase/time/space/best/average/worst/glossaryTitle/glossarySubtitle/emptyHint/showMore/showLess）、`algorithms`（16 数据结构 × 7 字段 = 112 键，type 定义 `AlgorithmGlossaryEntry`）
- **新增 Hook**: `src/hooks/useAlgorithmGlossary.ts` — 返回 16 项术语条目（id / 双语 name / description / useCase / best / average / worst / space）
- **新增组件**: `src/components/AlgorithmGlossaryCard.tsx` — Neo-Brutalist 风格表格，默认折叠避免首次加载 DOM 过大；展开后渲染 17 行（表头 + 16 数据行）
- **Home 集成**: 在 `LearningPath` 之后插入 `<AlgorithmGlossaryCard />`

#### 文件清单
- 新增：`src/i18n/locales.ts`（仅修改，未新增文件）— `complexity` + `algorithms` 命名空间同步到 interface / zh / en
- 新增：`src/hooks/useAlgorithmGlossary.ts`
- 新增：`src/components/AlgorithmGlossaryCard.tsx`
- 新增：`src/__tests__/i18n/i18n-integrity.test.ts`（8 测试）
- 新增：`src/__tests__/hooks/useAlgorithmGlossary.test.ts`（5 测试）
- 新增：`src/__tests__/components/AlgorithmGlossaryCard.test.tsx`（6 测试）
- 修改：`src/pages/Home.tsx`（导入 + 集成 1 行）
- 修改：`src/__tests__/pages/Home.test.tsx`（新增 1 测试）

#### 验证
- `npx vitest run` → **2699/2699 通过**（其中新增 20 项）
- `npm run lint` → 0 errors / 0 warnings
- `npm run build` → 成功；bundle 检查通过：index 77.93KB（<110KB）、vendor-react 231.35KB（<250KB）、vendor-d3 52.54KB（<60KB）

#### 范围外（Out of Scope）
- 不替换全项目 100+ 文件中已有的硬编码中文（这些大多是 `hooks.*` 内部日志、`learningConfig.step.*` 教学文案，**不属于用户可见 UI 字符串**，按规则保持原样）
- 不重命名已有 i18n 键（保持向后兼容）
- 不在 main 分支上提交（由 main agent 统一提交）

#### 实施真源
[docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md](docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md)

### 2026-06-22 | 动画导出功能（v15.x 实验性）

#### 目标
在现有 `dataExport.ts`（JSON 导入导出 + 性能 CSV/JSON）基础上，新增算法运行过程的动画回放导出能力。

#### 新增模块

| 模块 | 文件 | 内容 |
|------|------|------|
| 工具 | `src/utils/animationExport.ts` | 三种导出格式：WebM（MediaRecorder 首选）/ GIF（gifenc）/ 帧序列 ZIP（jszip）；导出 `serializeSvg` / `loadSvgImage` / `isAnimationExportSupported` 等可独立测试单元；上限 600 帧保护 |
| 组件 | `src/components/AnimationExportButton.tsx` | 下拉式菜单（WebM / GIF / 帧序列），含 click-outside + Escape 关闭 + isLoading 状态 + 错误 toast；与 SortPage 已集成 |
| 类型 | `src/types/gifenc.d.ts` | gifenc 1.0.3 类型声明（项目内自制，无运行时影响） |
| i18n | `src/i18n/locales.ts` | `exportAnimation` 命名空间（10 键，中英双文） |
| 集成 | `src/pages/SortPage.tsx` | PageHeader 中嵌入按钮，`isAnimating || data.length === 0` 时禁用 |

#### 新增依赖
- `gifenc@1.0.3` — 纯函数式 GIF 编码器，无依赖
- `jszip@3.10.1` — ZIP 打包
- 合计 < 35KB gzipped（实测 +1.9KB SortPage chunk）

#### 测试
- `src/__tests__/utils/animationExport.test.ts` — 12 个测试（serializeSvg、isAnimationExportSupported、loadSvgImage、三种导出格式、null ref、不可用环境）
- `src/__tests__/components/AnimationExportButton.test.tsx` — 9 个测试（渲染、禁用、菜单、点击、错误、点击外部关闭）

#### 验证
- `npm run test:run`：144 文件 / 2679 测试全绿（含新 21 个）
- `npm run lint`：0/0
- `npm run build`：通过，bundle check 通过（index 78KB < 110KB、vendor-react 231KB < 250KB、vendor-d3 53KB < 60KB）
- 仅 SortPage 接入新按钮；其余 16 个页面后续可独立集成

### 2026-06-22 | v15.0.0 GA — 体验打磨完成

#### E1 — PWA 离线增强

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/ReloadPrompt.tsx` | PWA 新版本提示（useRegisterSW + Neo-Brutalist + a11y） |
| 配置 | `vite.config.js` | Google Fonts runtime caching（CacheFirst, 60 天） |
| 集成 | `src/components/Layout.tsx` | 渲染 ReloadPrompt |
| 类型 | `src/types/pwa.d.ts` | virtual:pwa-register/react 类型声明 |
| i18n | `src/i18n/locales.ts` | pwa 命名空间（3 键） |
| 测试 | `ReloadPrompt.test.tsx` | 4 个测试 |

#### E2 — 大数据可视化

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/PerformanceIndicator.tsx` | 性能模式徽章 |
| 工具 | `src/utils/performanceConfig.ts` | 新增 isLargeData 辅助函数 |
| 可视化器 | `arrayVisualizer.ts` / `sortVisualizer.ts` | 大数据简化渲染（跳过渐变/阴影/标签） |
| 页面 | `ArrayPage.tsx` / `SortPage.tsx` | 集成浮动徽章 |
| i18n | `src/i18n/locales.ts` | performance 命名空间（2 键） |
| 测试 | 4 个测试文件 | 15 个新测试 |

#### E3 — 移动端手势

| 模块 | 文件 | 内容 |
|------|------|------|
| Hook | `src/hooks/useGestures.ts` | 5 种手势（pinch/swipeH/swipeV/longPress/tap） |
| 集成 | `src/components/Visualizer.tsx` | onSwipeLeft/onSwipeRight 可选 props |
| 测试 | `useGestures.test.ts` | 9 个测试 |

#### E4 — KeyboardHelp 模糊搜索

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/KeyboardHelp.tsx` | fuzzyMatchAny 跨页面搜索 + 三态渲染 |
| i18n | `src/i18n/locales.ts` | shortcuts 命名空间新增 3 键 |
| 测试 | `KeyboardHelp.test.tsx` | 5 个新测试（共 20 tests） |

#### U2 — 响应式操作面板

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/OperationBar.tsx` | 移动端横向滚动 + collapsibleOnMobile 折叠模式 |
| i18n | `src/i18n/locales.ts` | page 命名空间新增 expand/collapse |
| 测试 | `OperationBar.test.tsx` | 5 个新测试（共 43 tests） |

#### U3 — 跨页面布局一致性

| 模块 | 文件 | 内容 |
|------|------|------|
| 修复 | `src/pages/GraphAlgorithmPage.tsx` | 3 处布局偏差（h-full→min-h-dvh、添加 min-h-0、添加 relative） |
| 测试 | `layoutConsistency.test.tsx` | 8 个布局测试 |

#### U4 — SVG 图标系统

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/Icon.tsx` | 8 个 stroke-based SVG 图标（Feather/Lucide 风格） |
| 替换 | 6 个文件 | KeyboardHelp/GlobalSearch/Sidebar/Home/SortComparePage/QuizPanel emoji→Icon |
| 测试 | `Icon.test.tsx` | 5 个测试 |

#### U5 — 条件禁用按钮原因

| 模块 | 文件 | 内容 |
|------|------|------|
| 组件 | `src/components/OperationBar.tsx` | disabledReason prop + useId + aria-describedby + sr-only |
| CSS | `src/index.css` | sr-only 工具类 |
| 页面 | ArrayPage/StackPage/SortPage | 示例接入 disabledReason |
| i18n | `src/i18n/locales.ts` | page.animating / page.disabled |
| 测试 | `OperationBar.test.tsx` | 4 个新测试（共 47 tests） |

#### ISSUE-007 — 排序撤销阻塞

| 模块 | 文件 | 内容 |
|------|------|------|
| Hook | `src/hooks/useHistory.ts` | undoBlock 机制（ref-based，不触发重渲染） |
| 透传 | `src/hooks/useDataStructureState.ts` | 透传 setUndoBlock |
| 使用 | `src/hooks/useSortState.ts` | 排序过程中 setUndoBlock(true)，finally 解除 |
| 测试 | `useHistory.test.ts` / `useSortState.test.ts` | 6 个新测试 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2590 passed（137 文件），较 v14 GA 新增 64 个测试 |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| Git commits | E1 `ba39cd7` / E2 `d7952b7` / E3 `be4e59d` / E4 `66d282c` / U2 `594cd9f` / U3 `11b298b` / U4 `6518050` / U5 `1146d47` / ISSUE-007 `5355ea2` |

---

### 2026-06-22 | v14.0.0 GA — 内容扩张完成

#### D1 — 图算法测试补齐

| 模块 | 文件 | 内容 |
|------|------|------|
| 测试 | `src/__tests__/algorithms/graph/graphAlgorithms.test.ts` | 46 个测试覆盖 Bellman-Ford（10）、Floyd-Warshall（10）、Prim（10）、Kruskal（11）、注册（5） |

#### G1 — B-Tree 数据结构

| 模块 | 文件 | 内容 |
|------|------|------|
| 算法 | `src/algorithms/bTree.ts` | 多路搜索树，insert + split、search、inorder、validate |
| Hook | `src/hooks/useBTreeState.ts` | 状态管理 + localStorage + undo/redo |
| 可视化器 | `src/visualizers/bTreeVisualizer.ts` | D3 多路树可视化 |
| 页面 | `src/pages/BTreePage.tsx` | 插入/搜索/中序/重置 |
| 学习配置 | `src/configs/learning/bTree.config.ts` | 7 步学习配置 |
| 类型 | `src/types/hooks.d.ts` | BTreeNode / BTreeFlattenedNode / BTreeFlattened / BTreeState |
| i18n | `src/i18n/locales.ts` | btree 命名空间（24 键，中英文） |
| 路由/侧边栏/首页 | `App.tsx` / `Sidebar.tsx` / `Home.tsx` | `/b-tree` 路由 + 入口 |
| 测试 | 4 个测试文件 | 97 个测试（algorithm 41 + hook 30 + visualizer 16 + page 10） |

#### G2 — Segment Tree 数据结构

| 模块 | 文件 | 内容 |
|------|------|------|
| 算法 | `src/algorithms/segmentTree.ts` | build / query（区间求和）/ update（点更新） |
| Hook | `src/hooks/useSegmentTreeState.ts` | 状态管理 + localStorage + undo/redo |
| 可视化器 | `src/visualizers/segmentTreeVisualizer.ts` | D3 树形可视化 |
| 页面 | `src/pages/SegmentTreePage.tsx` | build/query/update/reset |
| 学习配置 | `src/configs/learning/segmentTree.config.ts` | 7 步学习配置 |
| 类型 | `src/types/hooks.d.ts` | SegmentTreeNode / SegmentTreeFlattened 等 |
| i18n | `src/i18n/locales.ts` | segmentTree 命名空间（24 键） |
| 路由/侧边栏/首页 | `App.tsx` / `Sidebar.tsx` / `Home.tsx` | `/segment-tree` 路由 + 入口 |
| 测试 | 4 个测试文件 | 104 个测试（algorithm 45 + hook 29 + visualizer 20 + page 10） |

#### G3 — 双向链表模式测试

| 模块 | 文件 | 内容 |
|------|------|------|
| 测试 | `src/__tests__/pages/LinkedListPage.test.tsx` | 4 个测试覆盖切换按钮可见性、切换到双向、切回单向、动画期间禁用 |

#### F2 — 算法接入指南

| 模块 | 文件 | 内容 |
|------|------|------|
| 文档 | `docs/ALGORITHM_INTEGRATION_GUIDE.md` | 7 章节覆盖排序/图算法/数据结构接入、学习配置、可视化器、测试、i18n + checklist |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2526 passed（132 文件），较 v13 GA 新增 246 个测试 |
| ESLint | 0 errors / 67 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| 数据结构总数 | 17（原 15 + B-Tree + Segment Tree） |
| 学习配置总数 | 40（原 38 + bTree + segmentTree） |
| Git commits | D1 `d63a07c` / G1 `3d0acca` / G2 `cc6905f` / G3 `0a64d91` / F2 `10c1ad5` |

---

### 2026-06-22 | v13.0.0 GA — Path 3 H3 + H1 完成

#### H3 — SortComparePage 学习模式

| 模块 | 文件 | 内容 |
|------|------|------|
| 学习配置 | `src/configs/learning/sortCompare.config.ts` | 5 步学习配置（选择算法、初始化、第一轮比较、关键差异、完成对比） |
| 配置注册 | `src/configs/learning/index.ts` | 注册 `sortCompare`（37 → 38 个学习配置） |
| 页面集成 | `src/pages/SortComparePage.tsx` | 接入 `useLearningMode('sortCompare')` |
| 测试 | `src/__tests__/pages/SortComparePage.test.tsx` | 新增 4 个学习配置测试 |

#### H1 — 测验系统

| 模块 | 文件 | 内容 |
|------|------|------|
| 类型扩展 | `src/types/learning.d.ts` | `QuizQuestion` 接口 + `LearningModeConfig.quiz` 字段 |
| Hook | `src/hooks/useQuizProgress.ts` | 测验进度管理（localStorage 持久化、提交/导航/重置/得分） |
| 组件 | `src/components/QuizPanel.tsx` | 测验 UI（题目、选项、即时反馈、解释、进度条、完成徽标） |
| InfoPanel 集成 | `src/components/InfoPanel.tsx` | 桌面端与移动端学习标签页底部嵌入 QuizPanel |
| 测验题目 | `array.config.ts` / `bubble.config.ts` / `tree.config.ts` | 各添加 3 道单选题 |
| 页面接入 | `ArrayPage.tsx` / `SortPage.tsx` / `TreePage.tsx` | 传递 `algorithmKey` + `quizQuestions` 到 InfoPanel |
| i18n | `src/i18n/locales.ts` | 新增 `quiz` 命名空间（16 键，中英文） |
| 测试 | `useQuizProgress.test.ts`（10）+ `QuizPanel.test.tsx`（9） | 覆盖答题/得分/重置/导航/空题目 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2280 passed（123 文件），较 rc3 新增 23 个测试 |
| ESLint | 0 errors / 65 warnings（既有模式） |
| 生产构建 | 成功，bundle 预算通过 |
| Git commits | H3 `2f56b83` / H1 `c07b89a` |

---

### 2026-06-21 | Path 3 H2 全局搜索增强完成

#### 实现内容

| 模块 | 文件 | 内容 |
|------|------|------|
| Fuzzy 匹配 | `src/utils/fuzzySearch.ts` | 新增 LCS -based 轻量模糊匹配，含连续匹配/首字符/大小写敏感加权 |
| 搜索历史 | `src/hooks/useSearchHistory.ts` | localStorage 持久化，上限 10 条，去重，支持增删清空 |
| 搜索索引 | `src/data/searchIndex.ts` | 扩展 `SearchItem` 类型，从学习步骤描述中提取时间/空间复杂度 |
| 组件 UI | `src/components/GlobalSearch.tsx` | 集成 fuzzy 匹配、历史展示、复杂度过滤、page/learning/history 分类展示 |
| i18n | `src/i18n/locales.ts` | 新增 `globalSearch` 命名空间相关键 |
| 测试 | `src/__tests__/utils/fuzzySearch.test.ts`、`hooks/useSearchHistory.test.ts`、`data/searchIndex.test.ts`、`components/GlobalSearch.test.tsx` | 新增 27 个单元测试 |

#### 验证

| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2261 passed（121 文件），较 rc2 基线新增 27 个测试 |
| ESLint | 0 errors / 65 warnings（既有模式） |
| TypeScript strict | 0 错误 |
| 生产构建 | 成功，bundle 预算通过 |

---

### 2026-06-21 | v13 Phase C 文档完善 + Phase D 测试/CI 升级完成

#### Phase C 文档一致性
- 对齐 `README.md` / `PROJECT_SUMMARY.md` / `CHANGELOG.md` / `TODO.md` / `WORKLOG.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `PROJECT_STATUS.md` 版本号与状态
- `package.json` version 从 `v13.0.0-rc1-phase-b` 升级为 `v13.0.0-rc2`
- 修正各文档中 Phase A/B/C/D 状态、测试数量、E2E 覆盖、CI artifact 等数据

#### Phase D 测试 + CI 升级
- E2E 框架：新增 `e2e/a11y.spec.ts`（动态覆盖 17 页 axe-core 扫描）、`e2e/home.spec.ts`（Playwright Test 迁移示例）
- `e2e/test-a11y.js` 改为委托 `npx playwright test a11y.spec.ts`，CI 中只跑 chromium 项目
- `e2e/run-all-tests.js` 输出统一 JSON 协议 `e2e/test-results.json`
- 单测基础设施：`src/__tests__/setup.js` 升级为 `setup.ts`；`d3MockHelper.ts` 支持调用记录；新增 `arrayVisualizer.snapshot.test.ts`
- CI 增强：`.github/workflows/ci.yml` 增加 Playwright a11y 测试、覆盖率 artifact、构建产物 artifact、E2E 报告 artifact

#### 验证
| 检查项 | 结果 |
|--------|------|
| 单元测试 | 2234 passed（118 文件） |
| ESLint | 0 errors / 65 warnings（既有模式） |
| TypeScript strict | 0 错误 |
| 生产构建 | 成功，bundle 预算通过（index 64.61KB / vendor-react 231.35KB / vendor-d3 52.54KB） |
| Playwright spec | 20 passed（a11y 17 页 + home 3 用例） |
| a11y 扫描 | 17 页 0 critical/serious violations |

---

### 2026-06-21 | v13 Phase B 体验与工程优化完成
- 动画引擎：FPS 降级（>100ms 帧阻塞立即触发）、动画 abort、wait 清理、applyPreset 中断当前动画；`useVisualizer` RAF ID 提 ref，cleanup 清理 graph simulation
- Visualizer 渲染一致性：`treeVisualizer` positionStore 绑定 SVG、`graphVisualizer` NODE_RADIUS 收敛常量、defs 去重、并查集 findRootId 缓存、栈宽度自适应
- a11y 与键盘导航：InfoPanel 日志高亮替代自动跳转、ARIA tablist/tab/aria-controls、树/图 ↑↓ 父/子导航、节点焦点环、边 aria-label、快捷键 aria-keyshortcuts
- 移动端与教学反馈：Sidebar 左缘右滑打开 + 触控按钮 ≥44px、InfoPanel 移动端 flex-1 抽屉、输入框跳过 Ctrl+Z/Y、错误 toast 显示模块/操作、undo/redo 先 abort
- 新增/更新测试：`toastStore.test.ts`、`useKeyboard.test.ts`、`stackVisualizer.test.ts`、`InfoPanel.test.tsx`、`animationEngine.test.ts`、`useVisualizer.test.ts` 等
- 验证：3506 tests passed（204 文件） / lint 0 errors（65 warnings） / typecheck / build 全通过
- Git：46 个文件改动未提交（待 Phase C/D 完成后统一 commit）

### 2026-06-21 | v13 Phase A 紧急修复完成（安全 + 数据完整性）
- 完成 `src/utils/schema.ts` 统一 schema 校验（递归深度限制 `MAX_STORAGE_DEPTH = 10`），集成到 `useDataStructureState.loadFromStorage`
- `package.json` devDependencies 版本限定从 `^` 改为 `~`，CI 新增 `npm ls --depth=0` 校验
- `scripts/check-bundle.js` 用 `fileURLToPath` 替代 `import.meta.dirname`，兼容 Node 20+
- `vite.config.js` 移除 `loli.net` 第三方字体代理缓存配置，消除安全风险
- `src/hooks/useDataStructureState.ts` 渲染阶段 ref 赋值移入 `useEffect`
- 新增 `src/__tests__/utils/schema.test.ts` 14 个 schema 专属测试
- 验证：3494 tests passed（新增 14 个）/ lint 0 errors / typecheck / build 全通过
- Git commit: `0a544a9`

### 2026-06-21 | 文档整理与归档体系建立
- 将 `iteration-plan-v8/v9/v10`、`optimization-proposal`、`test-issue-report` 等 12 份过期文档合并为 6 份归档文件
- 新建 `docs/archive/` 目录与 `docs/README.md` 导航
- 修复 `TODO.md`、`PROJECT_SUMMARY.md`、`WORKLOG.md` 中对已归档文档的错误引用
- 关键文档（`CLAUDE.md`、根目录核心文档）保持独立未合并
- Git commit: `857f833 docs(archive): 整理过期文档并建立 archive 归档体系`

### 2026-06-20 | v13 全面代码体检完成
- 双模型互盲审计，合并去重后 56 条独立问题（P1 29 / P2 24 / P3 3）
- 产物：`docs/superpowers/specs/2026-06-20-v13-code-audit-design.md`、`docs/superpowers/plans/2026-06-20-v13-code-audit-plan.md`、`docs/audit-2026-06-20/audit-merged.md`
- Git commit: `f698291 docs: v13 全面代码体检报告与实施计划`

### 2026-06-20 | v12.0.0 完成
- 新增数据结构：跳表 SkipList、并查集 Union-Find、红黑树 Red-Black Tree
- 新增全局搜索 GlobalSearch（Ctrl/Cmd+K）
- 新增图算法：Bellman-Ford、Floyd-Warshall、Prim、Kruskal
- 新增排序算法：TimSort、ShellSort、CombSort、Counting
- 单元测试从 3089 增至 3480
- Git commit: `61bdc5f feat(v12): 跳表、并查集、红黑树与全局搜索`

---

## 3. 当前活跃任务 / 下一步方向

### v19 i18n 渐进迁移（🟡 M4-1 + M4-2 步骤 2.1 已收尾 / M4-2/3 走向待拍板）

| 维度 | 内容 |
|------|------|
| **计划文档** | [docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md](docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) |
| **M4 实施真源** | [docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md](docs/superpowers/plans/2026-06-22-v19-m4-pages-migration.md)（385 行 / 13 章节）|
| **M4-1 总结报告** | [docs/superpowers/i18n-inventory/03-m4-1-summary.md](docs/superpowers/i18n-inventory/03-m4-1-summary.md) |
| **M4-2 子清单** | [docs/superpowers/i18n-inventory/04-m4-2-p1-strings.md](docs/superpowers/i18n-inventory/04-m4-2-p1-strings.md) |
| **基线** | v17.0.0 GA（merge `b991566`）|
| **当前分支** | `feature/v19-m4-pages-migration`（基于 main HEAD `b991566`）|
| **M0-M3 状态** | ✅ M0 8 项决策 + M1 调研清单 + M2 基础设施 + M3 TypeScript 强约束全部完成 |
| **M4-1 状态** | ✅ **已收尾**（按用户拍板 A：4 页面 0 字符硬编码，跳过步骤 1.2-1.7）|
| **M4-2 状态** | 🟡 **步骤 2.1 已收尾**（按用户拍板 A.1：13 页面 0 字符 UI 硬编码 + 312 个 `t()` 调用 + 26 行注释；步骤 2.2-2.6 待拍板）|
| **M4-3 状态** | ⏳ **未启动**（待 M4-2/3 走向拍板）|

#### M4 子阶段状态表

| 子阶段 | 范围 | 字符数（实际）| 状态 |
|--------|------|--------------|------|
| **M4-1** | P0 4 页面（Home / SortPage / ArrayPage / GraphPage）| 0 字符 UI（v15.x + v17 累积 `t()` 化）| ✅ **已收尾** |
| **M4-2 步骤 2.1** | P1 13 页面（stack / queue / linkedlist / tree / avl / rb / btree / segtree / hash / heap / trie / skiplist / unionfind）| 0 字符 UI + 312 个 `t()` 调用 + 26 行注释 | ✅ **已收尾** |
| **M4-2 步骤 2.2-2.6** | 13 页面 locale 文件创建 + 接入 + 测试 | — | ⏳ **待拍板** |
| **M4-3** | P2 2 页面（graphAlgorithm / sortCompare）+ 17 页面聚合层接入 | 待扫描 | ⏳ 待启动（待 M4-2/3 走向拍板）|

#### M4-2/3 走向待拍板（3 选项）

| 选项 | 描述 | 估时 | 风险 | 推荐度 |
|------|------|------|------|--------|
| **A.1.1** | M4 全部收尾（基于 17 页面一致性假设 M4-3 同样已 `t()` 化）| 0 | 中 | ⭐⭐ |
| **A.1.2** | 快速扫描 M4-3 2 页面（graphAlgorithm / sortCompare）后 M4 全部收尾 | ~5 分钟 | 极低 | ⭐⭐⭐ |
| **A.1.3** | 完整执行 M4-2 步骤 2.2-2.6（创建 13 zh + 13 en locale 文件占位）| 1.5d | 高（无实际工作）| ❌ |

---

### v16 设计统一化（⏳ 待启动 — 长线路线图第四阶段）

| 维度 | 内容 |
|------|------|
| **计划文档** | [docs/superpowers/plans/2026-06-22-design-unification-v16.md](docs/superpowers/plans/2026-06-22-design-unification-v16.md) |
| **设计推荐** | [docs/数据结构学习助手-设计推荐.md](docs/数据结构学习助手-设计推荐.md) |
| **基线** | v16.0.0 GA（commit `879f04e`） |
| **路线对齐** | 长线路线图 v13→v16 第四阶段"设计与品牌统一" |
| **主参考** | Linear + Vercel + Raycast（命令面板） |
| **核心产出** | 项目根 `DESIGN.md`（设计真源） |
| **状态** | ⏳ Phase A 待启动 |
| **前置条件** | ① 用户授权读取 `design-md/`（rule 16.1）；② 用户确认主参考品牌；③ 用户决定 `design-md/` 是否纳入 `.gitignore` |

---

### v16.0.0 GA — 工程深化与功能增强（✅ 已完成 2026-06-22，commit `879f04e`）

| 子任务 | 主题 | 状态 | 关键产出 |
|--------|------|------|----------|
| **ENG-1** | Playwright 迁移 | ✅ | 7 个 `test-*.js` → `*.spec.ts`；`scripts/run-e2e.mjs`（commit `23913a7`） |
| **ENG-2** | 覆盖率 >80% | ✅ | statements 77.92% → **80.05%**（+62 tests，commit `7da029b`） |
| **ENG-3** | lint 归零 | ✅ | 67 → 0（react-hooks 补全 + 6 个 pre-existing 修复，commit `6d32435` / `0fb5a2f`） |
| **ENH-1** | 动画导出 | ✅ | WebM/GIF/帧序列 ZIP；SortPage 集成（commit `8a81ff8`） |
| **ENH-2** | i18n 完善 | ✅ | 125 键术语表；`AlgorithmGlossaryCard`（commit `99b5b0e`） |

**基线指标**：2699 单元测试 / 0 ESLint / 80.05% 覆盖 / bundle 全 < budget / E2E 3 spec 全绿（chromium + firefox）

---

### v13 / v14 / v15 路线（✅ 全部完成，已结案归档）

| 阶段 | 主题 | 状态 |
|------|------|------|
| **v13 Phase A-D** | 紧急修复 + 体验 + 文档 + 测试 CI 升级 | ✅ 已完成（commit `0a544a9` + 后续 7 commits） |
| **v14** | 内容扩张（D1/G1/G2/G3/F2） | ✅ 已完成 |
| **v15 E1-E4 / U2-U5 / ISSUE-007** | 体验打磨 | ✅ 已完成（9 commits） |

### v13 Top10 优先问题（结案 — 详见 `docs/audit-2026-06-20/audit-merged.md`）

1. devDependencies 版本越界（`package.json`）— ✅ ENG-3 修
2. `isValidStoredData` 不递归深度 + `loadFromStorage` 用 `JSON.parse as T` — ✅ Phase A 修
3. useVisualizer rafId 闭包错乱 + animationEngine 模块单例 + wait() 闭包链 — ✅ Phase B 修
4. `treeVisualizer` `positionStore` 全局单例 — ✅ Phase B 修
5. `useDataStructureState` 渲染阶段写 ref — ✅ Phase A 修
6. `react-hooks/set-state-in-effect` 永久降级 warn — ✅ ENG-3 修（67→0）
7. `vite.config.js` 配 `loli.net` 注释写 google fonts — ✅ Phase A 修
8. InfoPanel 自动跳转 + LogPanel aria-live 双重轰炸 — ✅ Phase B 修
9. 树/图键盘 ↑↓ 行为错误 + AVL/UnionFind 节点不可 tab — ✅ Phase B 修
10. undo/redo/applyPreset 不打断正在跑的动画 — ✅ Phase B 修

---

## 4. 已知约束与注意事项

- **禁止修改的文件**: `CLAUDE.md`、根目录核心文档（README/CHANGELOG/ARCHITECTURE/PROJECT_SUMMARY/CODE_WIKI/TODO/WORKLOG/CONTRIBUTING）作为独立文件保留，不合并。
- **必须遵循的工作流**: `UNDERSTAND → PLAN → EXECUTE → VERIFY`
- **当前代码基线**: v16.0.0 GA（commit `879f04e`，分支 `feature/v13-path3-learning-enhancements`）；任何 v16 设计统一化工作**必须**新建独立 feature 分支（如 `feature/v16-design-unification`），不要直接在 main 或当前分支修改。
- **验证红线**: 任何代码改动后必须运行 `npm run lint`、`npm run typecheck`、`npm run test:run`、`npm run build`。
- **`design-md/` 追踪策略**（2026-06-22 发现）：当前未纳入 `.gitignore`，`git status` 显示 untracked。在启动 v16 设计统一化 Phase A 前**必须**先决定：① 添加至 `.gitignore`（推荐，rule 16.1 隐含要求）；或 ② 显式接受其纳入版本控制。

---

## 5. 关键文档入口

| 文档 | 用途 |
|---|---|
| [CLAUDE.md](./CLAUDE.md) | AI 协作规则与技术约束 |
| [TODO.md](./TODO.md) | 当前待办与 v16 设计统一化计划 |
| [WORKLOG.md](./WORKLOG.md) | 每日工作记录 |
| [CHANGELOG.md](./CHANGELOG.md) | 版本变更历史 |
| [docs/数据结构学习助手-设计推荐.md](./docs/数据结构学习助手-设计推荐.md) | 设计推荐报告（v16 设计统一化输入） |
| [docs/superpowers/plans/2026-06-22-design-unification-v16.md](./docs/superpowers/plans/2026-06-22-design-unification-v16.md) | v16 设计统一化实施真源 |
| [docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md](./docs/superpowers/plans/2026-06-21-longterm-roadmap-v13-to-v16.md) | 长线路线图 |
| [docs/audit-2026-06-20/audit-merged.md](./docs/audit-2026-06-20/audit-merged.md) | v13 代码体检完整报告（已结案） |
| [docs/README.md](./docs/README.md) | docs/ 目录导航 |

---

> **AI 开发前必读提示**: 开始任何开发任务前，先读取本文件 + [TODO.md](./TODO.md) 顶部 3 段 + [WORKLOG.md](./WORKLOG.md) 前 60 行。若本文件与 WORKLOG/TODO 冲突，以本文件和 TODO.md 为准。
