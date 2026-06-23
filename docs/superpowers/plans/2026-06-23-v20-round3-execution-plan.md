# v20 收官执行级计划 — A M8 + A M9 + C-2 + GA 串行一次性交付

> **创建日期**: 2026-06-23
> **执行模式**: 串行 3 子阶段 + 1 GA 收尾，每子阶段独立 feature 分支，完工后逐次 merge main
> **基线版本**: v20 第二轮 C-1 + C-4 + A M7 全部完成（commit `c0b8973`，基于 main HEAD `b991566`）
> **执行节奏**: 用户拍板顺序 → AI 启动子阶段 → 子阶段完工汇报 → 用户拍板下一子阶段
> **负责人**: AI 协作（技术实施 + 翻译生成 + E2E 编写）+ 用户（关键校对 + 拍板）
> **关键约束**: 严格遵守 Agent 宪法 v3.8 + 最小修改原则 + 不开启任何 v21 任务 + v20 阶段全部完工后才进入 v21
> **用户拍板（2026-06-23）**: 启动 v20 阶段所有未完成的任务（1=A 方向 M8+M9 / 2=C 方向 C-2 全部），集中资源一次性完成 v20 阶段全部工作

---

## 0. 上游输入与基线

| 文档 | 状态 |
|------|------|
| [v20 第二轮执行计划](./2026-06-22-v20-round2-execution-plan.md) | ✅ 已交付（C-1/C-4/M7 全部完成，剩余 C-2 + M8 + M9）|
| [v20 M7 实施真源文档](./2026-06-23-v20-m7-implementation-plan.md) | ✅ M7 全部完成（M7-1 到 M7-7）|
| [C-4 内存修复报告](./2026-06-23-c4-memory-leak-report.md) | ✅ C-4 完成 |
| C-1 扫描报告 | ✅ 完成（commit `3cd920a` / 0 react-hooks 警告）|

### 0.1 当前基线状态（2026-06-23 下午）

| 维度 | 状态 |
|------|------|
| **当前分支** | `feature/v20-m7-6-tests` |
| **HEAD commit** | `c0b8973 docs(v20): M7 收尾（5 未跟踪文件清理 + inventory 报告 + gitignore 同步）` |
| **工作树** | clean |
| **测试基线** | 3550 单元测试（2812 基线 + 738 M7-6 新增）|
| **Lint** | 0 errors / 0 warnings |
| **覆盖率** | 80.05%（v20 第二轮起算基线）|
| **i18n** | 1,432 键 zh/en 镜像 / 0 CJK 泄漏 / 8/8 integrity |
| **pre-existing typecheck** | 5 错误（v21 backlog B-1~B-5，按用户拍板不修）|
| **M9 e2e 框架** | 已在 `feature/v20-a-m5-m6-i18n` 分支 commit `d09cbef` 交付，**当前分支尚未合并** |

---

## 1. 战略目标

| 维度 | 现状（M7 完成后）| v20 收官目标 |
|------|----------------|-------------|
| **i18n 完整性** | M0-M7 完成（教学文案已迁移 + 1,432 键 zh/en 镜像 + 0 CJK 泄漏）| **M8 真实英文翻译填充**（高频 UI 字符串 + 算法术语 + 错误消息）+ **M9 完整 E2E + pseudoLocale 集成** |
| **测试覆盖** | 3550 tests / 80.05% statements | **80% → 85%**（新增 200+ 测试，statements +5pp）|
| **E2E 覆盖** | 7 spec 全绿（a11y / core / edge / v5-features / advanced / comprehensive / persistence / interactions / home）| **新增 i18n spec**（17 页 × 3 场景 = 51 项 zh/en/pseudo 用例）|
| **工程质量** | 0 lint / 0 CJK 泄漏 / typecheck 5 pre-existing | 维持 0 lint / 新增 pseudoLocale 烟雾测试 / 5 pre-existing 不动 |
| **文档完整度** | 8 根目录 + API.md + ARCHITECTURE v17+ 章节 + v20 第二轮 plan | **6 份核心文档同步**（v20.0.0 GA）|

---

## 2. 工作分解结构（WBS）— 4 子阶段

### 2.1 总览（按依赖关系 + 风险等级）

| P 优先级 | 子阶段 | 主题 | 依赖 | 工时 | 风险 | 阶段 |
|---------|--------|------|------|------|------|------|
| **P1** | **C-2** | 覆盖率 80% → 85%（200+ 测试）| — | 3-5d | 低 | 阶段 1 |
| **P2** | **A M8** | 实际英文翻译填充（高频 UI 字符串 + 算法术语 + 错误消息）| 依赖 M7 | 5d | 中（需用户抽查 5 核心页面）| 阶段 2 |
| **P3** | **A M9** | 完整 E2E（17 页 × 3 场景）+ pseudoLocale 集成 | 依赖 M7 + M8 | 2d | 极低 | 阶段 3 |
| **P4** | **v20.0.0 GA** | 4 feature 分支 merge main + 6 文档同步 + 版本号升级 | 依赖 P1-P3 | 1d | 极低 | 阶段 4 |

**总工时**: ~11-13d（不含用户校对时间）
**总阶段数**: 4
**总 feature 分支**: 4（`v20-c2-coverage` / `v20-m8-en-translation` / `v20-m9-e2e-i18n` / GA 在 main 上收尾）

---

## 3. 子阶段细节

### 3.1 阶段 1: C-2 覆盖率 80% → 85%（3-5d）

| 维度 | 详情 |
|------|------|
| **范围** | 200+ 新测试覆盖 15+ 数据结构边界 + visualizer 分支 + 工具函数分支 + hooks 错误路径 |
| **基线** | 3550 tests / 80.05% statements / 67.23% branches / 81.03% functions / 84.02% lines |
| **目标** | statements ≥ 85% / branches ≥ 70% / 至少 3700 tests |
| **优先级** | ① visualizer 分支（80% 视觉逻辑 80% 分支）② hooks 边界（undo/redo 极限 / abort 链路）③ utils 错误路径 ④ 边界（空数据 / 超大输入）|
| **不变量** | 不改产品代码；只新增测试文件 |
| **验收** | `npx vitest run --coverage` → statements ≥ 85% / branches ≥ 70% |
| **风险** | 🟢 低（无产品代码变更）|
| **验证方式** | `npx vitest run --coverage` 输出 coverage summary |

#### C-2 子阶段分解

| 子阶段 | 范围 | 估时 | 目标覆盖增量 |
|--------|------|------|-------------|
| **C-2.1** | visualizer 分支覆盖（15 visualizer × 5-10 分支/项）| 1.5d | +30 cases / +2.0pp statements |
| **C-2.2** | hook 边界（useDataStructureState / useVisualizer / useHistory / useSortState 错误路径）| 1d | +50 cases / +1.5pp statements |
| **C-2.3** | utils 错误路径（animationEngine / dataExport / animationExport / searchIndex / fuzzySearch）| 1d | +50 cases / +1.0pp statements |
| **C-2.4** | 边界用例（空数据 / 超大输入 / localStorage 损坏）| 0.5d | +70 cases / +0.5pp statements |
| **总** | — | **4d** | **+200 cases / +5pp statements** |

---

### 3.2 阶段 2: A M8 实际英文翻译填充（5d）

| 维度 | 详情 |
|------|------|
| **范围** | 全部 en 命名空间：① 高频 UI 字符串（50+ namespace）② 算法术语（complexity / algorithms 命名空间 125 键）③ 错误消息（仅 UI 错误，开发者向错误保留 zh）|
| **翻译来源** | AI 翻译（已有 M7-4 + M7-7 AI 翻译基础）+ AI 二次润色 + 用户抽查 5 核心页面 |
| **不变量** | zh 翻译不动；键结构不变；仅填充 en 值；不替换 M7 已审核的 1,432 键 |
| **验收** | en 翻译覆盖率 100%（M7 已有 1,432 键 + 估约 500-800 键 M8 新增）；5 核心页面用户抽查无明显翻译错误；pseudoLocale 与 en 实际渲染对比一致 |
| **风险** | 🟡 中（en 翻译质量需用户校对，可能多轮迭代）|
| **用户校对** | ⏸ **必填**：5 个核心页面（Home / Sort / Graph / Tree / Hash）|

#### M8 子阶段分解

| 子阶段 | 范围 | 估时 | 验证 |
|--------|------|------|------|
| **M8-1** | 扫描 en 翻译空白（与 zh 对比缺哪些 namespace/键）| 0.5d | diffKeys 报告 |
| **M8-2** | AI 生成 en 翻译初稿（500-800 键 × 2 locales = 1000-1600 字符串）| 1d | en locale 文件 100% 覆盖 |
| **M8-3** | AI 二次润色（专业术语校对 / 一致性 / 长句拆分）| 1d | 翻译通顺度自评达标 |
| **M8-4** | i18n integrity 测试 + 编译时断言 | 0.5d | AssertSameKeys 通过 / 8/8 integrity |
| **M8-5** | 用户抽查 5 核心页面 + 反馈修改 | 1d | 用户拍板翻译质量 |
| **M8-6** | 新增 10-20 项 en 翻译完整性测试 + pseudoLocale 对比 | 1d | 3570+ tests 通过 |
| **总** | — | **5d** | — |

#### 优先级（高 → 低）

1. **M8-P1** 17 页面 namespace 全部 en 值（最高频 UI 字符串）
2. **M8-P2** 42 组件 namespace（AlgorithmInfo / Button / OperationBar / Icon / QuizPanel / ReloadPrompt 等）
3. **M8-P3** 17 util namespace（animationEngine / animationExport / dataExport / fuzzySearch / performanceConfig 等）
4. **M8-P4** 错误消息（仅 UI 错误 toast / 验证错误；开发者向错误保留 zh）
5. **M8-P5** 算法术语（complexity / algorithms 命名空间，已有 M7 ENH-2 基础）

---

### 3.3 阶段 3: A M9 完整 E2E + pseudoLocale 集成（2d）

| 维度 | 详情 |
|------|------|
| **范围** | ① 合并 `feature/v20-a-m5-m6-i18n` 的 e2e 框架到当前工作线（保留 M9 框架 commit `d09cbef`）；② 扩展 `e2e/i18n.spec.ts` 覆盖 17 页面 × 3 场景（zh / en / pseudo）= 51 项；③ pseudoLocale 触发器（开发模式可启用）；④ Playwright 错误截图归档 |
| **集成点** | pseudoLocale 触发器（URL query `?pseudo=1` 或 localStorage 标志）+ 17 页 E2E + 截图归档（`e2e/screenshots/i18n/{zh,en,pseudo}/`）|
| **不变量** | 不改生产代码；只扩 e2e 框架；pseudoLocale 仅 dev 模式启用 |
| **验收** | `npx playwright test e2e/i18n.spec.ts` 全部通过；17 页 × 3 场景 = 51 项 E2E 用例全绿 |
| **风险** | 🟢 极低（沿用 v20 第一轮已交付的 e2e 框架）|
| **验证方式** | Playwright 截图断言（zh/en/pseudo 三态对比）+ `playwright test --reporter=list` |

#### M9 子阶段分解

| 子阶段 | 范围 | 估时 | 验证 |
|--------|------|------|------|
| **M9-1** | 合并 `feature/v20-a-m5-m6-i18n` 框架到 `v20-m9-e2e-i18n` 分支 | 0.5d | e2e/i18n.spec.ts 基础就绪 |
| **M9-2** | 扩 17 页面 × 3 场景 = 51 项 E2E 用例 | 1d | 51 项用例编写完成 |
| **M9-3** | pseudoLocale 触发器（dev 模式 URL query + Playwright 集成）| 0.5d | pseudoLocale 在 E2E 中可启用 |

---

### 3.4 阶段 4: v20.0.0 GA 收尾（1d）

| 维度 | 详情 |
|------|------|
| **范围** | 4 feature 分支全部 merge main + 删除分支 + 6 份核心文档同步 + CHANGELOG 版本号升级 + git tag `v20.0.0` |
| **合并策略** | 每个 feature 分支完工后立即 merge main（不集中合并，便于回滚）|
| **文档同步清单** | PROJECT_STATUS / TODO / WORKLOG / CHANGELOG / README / ARCHITECTURE / CLAUDE / AGENTS / docs/README |
| **验收** | git log 显示 4 commits + working tree clean + 6 份文档同步 + tag `v20.0.0` 推送 |
| **风险** | 🟢 极低（纯文档 + 合并）|
| **验证方式** | git tag 列表 + 6 文档版本号一致 + `npm run lint` / `npx vitest run` / `npm run build` / `npx playwright test` 全绿 |

---

## 4. 资源分配

### 4.1 人力

| 角色 | 时间投入 | 主要职责 |
|------|---------|---------|
| **项目维护者（用户）** | ~1-2d（M8 校对 + 4 次拍板）| A M8 5 核心页面翻译抽查 + 4 子阶段拍板 |
| **AI 协作** | 100% | C-2 测试编写 / M8 翻译生成 / M9 E2E 编写 / 文档同步 / 验证 |

### 4.2 Feature 分支策略

| 分支 | 阶段 | 合并时机 |
|------|------|---------|
| `feature/v20-c2-coverage` | 阶段 1（C-2）| 子阶段完工后立即 merge main |
| `feature/v20-m8-en-translation` | 阶段 2（M8）| 子阶段完工后立即 merge main |
| `feature/v20-m9-e2e-i18n` | 阶段 3（M9）| 子阶段完工后立即 merge main |
| GA 收尾 | 阶段 4 | 在 main 分支上收尾（4 分支已合）|

> **规则**: 每个子阶段完工 → 自测通过 → commit → 推分支 → 用户拍板 merge → 合并到 main → 删除 feature 分支。

### 4.3 串行执行（不并行）

**决策依据**：
1. 资源有限（单 AI agent + 1 终端）
2. C-2 与 M8/M9 无代码冲突，可并行但易混淆
3. 串行更稳：每个子阶段完工 → 验证 → 拍板 → merge main → 下一子阶段

**依赖关系**：
```
C-2 ─→ M8 ─→ M9 ─→ GA
(独立)   (依赖 M7)  (依赖 M8)  (依赖全部)
```

---

## 5. 详细时间表 + 里程碑

### 5.1 阶段 1: C-2 覆盖率提升（3-5d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D1 上午** | 创建 `feature/v20-c2-coverage` 分支；识别覆盖率空白区 | v8 coverage report 缺口清单 | M1.1 准备 |
| **D1 下午 - D2** | C-2.1 visualizer 分支（+30 cases / +2pp）| visualizer 分支 ≥ 70% | M1.2 C-2.1 完成 |
| **D2 下午 - D3** | C-2.2 hook 边界（+50 cases / +1.5pp）| hook 错误路径覆盖 | M1.3 C-2.2 完成 |
| **D3 下午 - D4** | C-2.3 utils 错误路径（+50 cases / +1pp）| utils 分支 ≥ 80% | M1.4 C-2.3 完成 |
| **D4 下午 - D5 上午** | C-2.4 边界用例（+70 cases / +0.5pp）| statements ≥ 85% | M1.5 C-2 完成 |
| **D5 下午** | C-2 汇报 + 用户拍板 merge | 用户确认；C-2 merge main | M1 阶段 1 收尾 |

### 5.2 阶段 2: A M8 实际英文翻译填充（5d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D6 上午** | 创建 `feature/v20-m8-en-translation`；M8-1 扫描 en 空白 | diffKeys 报告 | M2.1 准备 |
| **D6 下午 - D7** | M8-2 AI 初译（500-800 键）+ M8-3 二次润色 | en 翻译覆盖率 100% | M2.2 翻译完成 |
| **D7 下午 - D8 上午** | M8-4 integrity 测试 + 编译时断言 | AssertSameKeys 通过 / 8/8 integrity | M2.3 测试完成 |
| **D8 下午 - D9** | ⏸ **用户抽查**（必填）：5 核心页面 | 用户拍板翻译质量 | M2.4 校对完成 |
| **D9 下午 - D10** | M8-6 新增 10-20 项翻译测试 + pseudoLocale 对比 | 3570+ tests 通过 | M2.5 测试完成 |
| **D10 下午** | A M8 汇报 + 用户拍板 merge | 用户确认；M8 merge main | M2 阶段 2 收尾 |

### 5.3 阶段 3: A M9 完整 E2E + pseudoLocale 集成（2d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D11 上午** | 创建 `feature/v20-m9-e2e-i18n`；合并 `feature/v20-a-m5-m6-i18n` 框架 | e2e/i18n.spec.ts 基础就绪 | M3.1 准备 |
| **D11 下午 - D12** | M9-2 17 页面 × 3 场景 = 51 项 E2E | 51 项用例编写完成 | M3.2 E2E 扩写 |
| **D12 下午 - D13 上午** | M9-3 pseudoLocale 触发器集成 | pseudoLocale E2E 可启用 | M3.3 集成完成 |
| **D13 下午** | A M9 汇报 + 用户拍板 merge | 用户确认；M9 merge main | M3 阶段 3 收尾 |

### 5.4 阶段 4: v20.0.0 GA 收尾（1d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D14 上午** | 3 feature 分支（C-2 / M8 / M9）全部 merge main；删除分支 | git log 显示 3 commits / working tree clean | M4.1 GA 准备 |
| **D14 上午** | 6 份核心文档同步（PROJECT_STATUS / TODO / WORKLOG / CHANGELOG / README / ARCHITECTURE / CLAUDE / AGENTS）| 文档版本号统一为 v20.0.0 | M4.2 文档同步 |
| **D14 下午** | v20.0.0 GA 验证（lint 0 / test 3700+ / build / bundle / e2e 17 页）+ git tag `v20.0.0` | 全部通过 | M4.3 v20.0.0 GA |

**总时间**: ~14d（工作日） / ~3 周

---

## 6. 风险评估

| 风险 | 等级 | 影响 | 缓解策略 |
|------|------|------|----------|
| **A M8 翻译质量用户反复修改** | 🟡 中 | 阶段 2 拖延 | ① AI 二次润色提前消化质量问题；② 用户抽查限定 5 页；③ 接受小瑕疵，瑕疵列入 v21 backlog |
| **C-2 200+ 测试可能超出 5d** | 🟢 低 | 阶段 1 拖延 | ① 按优先级分层（visualizer 优先 / utils 其次）；② 允许覆盖率停在 83-84% 作为中间点 |
| **A M9 E2E 17 页 × 3 场景环境不稳定** | 🟢 低 | 阶段 3 拖延 | ① 沿用 v20 第一轮已交付的 e2e 框架；② 失败 case 单独记录 + 修复 |
| **4 feature 分支 merge 冲突** | 🟢 低 | 阶段 1-3 | 每个分支范围清晰无重叠（C-2 测试 / M8 翻译 / M9 E2E），冲突概率低 |
| **M8 用户校对延迟** | 🟡 中 | 阶段 2 时间不可控 | ① AI 提前生成初稿减少用户负担；② 允许用户分批校对；③ 关键文案用 checklist 列出 |
| **pseudoLocale 触发器与产品代码耦合** | 🟢 极低 | 阶段 3 | 仅 dev 模式启用（URL query + Playwright 集成），不污染生产 |
| **i18n integrity 在 M8 大规模 en 添加后失败** | 🟢 低 | 阶段 2 | M8-4 提前验证；AssertSameKeys 编译时断言 |

---

## 7. 验收标准

### 7.1 子阶段验收（强制）

| 子阶段 | 验收 | 验证方式 |
|--------|------|----------|
| **C-2** | statements ≥ 85% / branches ≥ 70% / 至少 3700 tests 通过 | `npx vitest run --coverage` |
| **A M8** | en 翻译覆盖率 100% / 5 核心页面用户抽查通过 / AssertSameKeys 编译通过 / 3570+ tests 通过 | `npx vitest run` + 用户抽查 |
| **A M9** | 51 项 E2E 用例全绿 / 17 页 zh/en/pseudo 三态截图归档 | `npx playwright test e2e/i18n.spec.ts` |

### 7.2 v20.0.0 GA 验收（最终）

| 检查项 | 目标 | 验证 |
|--------|------|------|
| `npm run lint` | 0 errors / 0 warnings | CI 必跑 |
| `npx vitest run` | ≥ 3700 tests 通过 | CI 必跑 |
| `npx vitest run --coverage` | statements ≥ 85% / branches ≥ 70% | 阶段性里程碑 |
| `npm run build` | 成功；bundle 全 < budget | `npm run build` + bundle check |
| `npx playwright test` | 17 页 E2E 全绿（zh/en/pseudo 三态）| E2E 必跑 |
| 6 份核心文档同步 | PROJECT_STATUS / TODO / WORKLOG / CHANGELOG / README / ARCHITECTURE / CLAUDE / AGENTS | 强制同步 |
| git tag `v20.0.0` | 创建并推送 | `git tag -l` |

---

## 8. 范围外（Out-of-Scope）

| 项目 | 原因 | 重启条件 |
|------|------|----------|
| **B 方向 AI 智能学习伴侣**（25-30d）| 用户未拍板 | 用户明确指令启动 |
| **v21 backlog B-1~B-5 typecheck**（5 pre-existing 错误）| 按用户拍板不修 | v21 启动时按需启动 |
| **v21 性能优化**（FPS / Lighthouse 95+ / PWA）| v21 范围 | v21 启动时按需启动 |
| **v22+ 协作教学** | 长线路线图 v22 范围 | 2027 Q1 启动 |
| **架构重构** | rule §11 地基红线 | 仅用户明确指令 |
| **quiz 字段 i18n** | quiz 字段不在 v20 计划范围 | v21+ 评估 |
| **codeSnippet 翻译** | 代码注释是开发者向（rule 业务逻辑注释）| 永久不做 |

---

## 9. 关键约束遵守（rule §2 三条铁律 + §11 地基红线）

- ✅ **不扩展需求**（严格按 v20 第二轮 plan 剩余 3 子阶段 + GA）
- ✅ **不基于猜测改代码**（C-2 实施前先扫描定位空白区）
- ✅ **不伪造结果**（所有子阶段必须测试通过 + 真实截图）
- ✅ **不擅自拍板**（每个子阶段完工后必须用户确认才 merge）
- ✅ **不在 main 分支上修改**（所有工作在 feature 分支，GA 收尾在 main）
- ✅ **最小修改原则**（不"顺手优化"无关代码）
- ✅ **AI-TDD 优先**（C-2 先写测试 → 跑测试 → 改代码）
- ✅ **测试通过为最终依据**（不能仅"看起来正常"）
- ✅ **任务收尾强制文档同步**（rule §16.3）
- ✅ **设计真源**（DESIGN.md 不存在时**不擅自拍板**视觉决策）
- ✅ **design-md/ 默认禁读**（rule §16.1）
- ✅ **不开启 v21 任务**（用户明确指令；5 pre-existing typecheck 列入 v21 backlog 但不修）

---

## 10. 启动指令

> 用户已拍板启动 v20 阶段所有未完成的任务（C-2 + M8 + M9 + GA）。**等待用户对执行计划 + 关键拍板点确认后**，按以下顺序串行执行：
>
> 1. **阶段 1** (C-2)：创建 `feature/v20-c2-coverage` → 200+ 测试 → 覆盖率 80% → 85% → 拍板 → merge main
> 2. **阶段 2** (M8)：创建 `feature/v20-m8-en-translation` → 500-800 键 en 翻译 → 用户抽查 5 页 → 拍板 → merge main
> 3. **阶段 3** (M9)：创建 `feature/v20-m9-e2e-i18n` → 合并 e2e 框架 → 51 项 E2E + pseudoLocale → 拍板 → merge main
> 4. **阶段 4** (GA)：3 分支已合 main → 6 份核心文档同步 → git tag `v20.0.0` → v20.0.0 GA 收尾
>
> **每子阶段开工前严格遵守本实施真源文档；子阶段完工立即停下来汇报，禁止自动进入下一阶段。**

---

> **创建时间**: 2026-06-23 下午
> **最后更新**: 2026-06-23 下午
> **状态**: ⏳ **等待用户对执行计划 + 关键拍板点确认**
