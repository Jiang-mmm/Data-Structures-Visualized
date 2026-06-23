# v20 第二轮执行级计划 — A 收尾 (M7+M8+M9) + C 剩余 (C-1+C-2+C-4) 串行交付

> **创建日期**: 2026-06-22
> **执行模式**: 串行 6 子阶段（按 P1→P5 优先级），每子阶段独立 feature 分支，完工后逐次 merge main
> **基线版本**: v20 A+C 第一轮完成（feature/v20-c-techdebt commit `193ef85`，基于 main HEAD `b991566`）
> **执行节奏**: 用户拍板顺序 → AI 启动子阶段 → 子阶段完工汇报 → 用户拍板下一子阶段
> **负责人**: 项目维护者（用户，关键校对）+ AI 协作（技术实施）
> **关键约束**: 严格遵守 Agent 宪法；M7/M8（教学文案 + 英文翻译）必须由用户最终校对；C-1/C-2/C-4 严格按子阶段边界执行
> **用户拍板（2026-06-22 深夜）**: 123 全部都要（C-1+C-4+C-2+A M7+A M8+A M9 全 6 子阶段），B 方向（AI 智能学习伴侣）不启动

---

## 0. 上游输入

| 文档 | 状态 |
|------|------|
| [v20 下一迭代计划](./2026-06-22-v20-next-iteration-plan.md) | ✅ 已交付 |
| [v20 A+C 第一轮执行计划](./2026-06-22-v20-execution-plan-a-c.md) | ✅ 已完成（commit `193ef85`）|
| [v19 M0-M4 实施真源](./2026-06-22-v19-i18n-progressive-migration.md) | 🟢 M0-M4 全部完成 |
| [v13 体检报告](../../audit-2026-06-20/audit-merged.md) | 56 条;已修 65% / 残留 15% / 复发 3% |
| [v19 M4 收尾报告](../i18n-inventory/06-m4-closure-report.md) | 569 `t()` 调用 / 0 字符 UI 硬编码 / AssertSameKeys 编译时镜像 |
| [v20 A+C M5 扫描报告](../i18n-inventory/07-m5-components-scan.md) | 42 组件扫描 0 字符 UI 硬编码 |

---

## 1. 战略目标

| 维度 | 现状（v20 第一轮后） | v20 第二轮目标 |
|------|--------------------|---------------|
| i18n 完整性 | M0-M6 + M9 框架完成；learning config 教学文案 + 实际英文翻译未做 | **M7+M8+M9 完整收尾**（含完整 E2E + pseudoLocale 集成）|
| 文档完整度 | 8 根目录 + API.md + CONTRIBUTING.md + ARCHITECTURE v17+ 章节 | 维持现状 |
| 工程成熟度 | 0 lint / 80.05% 覆盖 / 2699 tests | **覆盖率 80% → 85%**（+200 测试）+ **react-hooks 0 警告**（C-1）+ **avlTreeVisualizer 内存修复**（C-4）|
| 测试覆盖 | components/utils 100% `t()` 化；en 翻译占位 | **en 真实翻译填充**（A M8）|

---

## 2. 工作分解结构（WBS）— 6 子阶段

### 2.1 总览（按 P 优先级 + 依赖关系）

| P 优先级 | 子阶段 | 主题 | 依赖 | 工时 | 风险 | 阶段 |
|---------|--------|------|------|------|------|------|
| **P1** | **C-1** | react-hooks set-state-in-effect 6 + exhaustive-deps 样本修复 | — | 1-2d | 低 | 阶段 1 |
| **P1** | **C-4** | avlTreeVisualizer 内存泄漏 + useVisualizer 渲染 ref 调试 | — | 1-2d | 中 | 阶段 1 |
| **P2** | **C-2** | 覆盖率 80% → 85%（200+ 测试）| 依赖 C-1（避免新代码引入新 hooks 问题）| 3-5d | 低 | 阶段 2 |
| **P3** | **A M7** | learning config 教学文案 i18n 迁移 | — | 3d | 中（需用户校对）| 阶段 3 |
| **P4** | **A M8** | 实际英文翻译填充（en 命名空间）| 依赖 A M7 | 5d | 中（翻译质量需校对）| 阶段 4 |
| **P5** | **A M9** | 完整 Playwright i18n E2E + pseudoLocale 集成 | 依赖 A M7 + A M8 | 2d | 极低 | 阶段 5 |

**总工时**: 15-20d  
**总阶段数**: 5（阶段 1 包含 C-1 + C-4 并行；阶段 2-5 串行）  
**总 feature 分支**: 4（`v20-c1-react-hooks` / `v20-c4-memory-leak` / `v20-c2-coverage` / `v20-a-m7-m8-m9-i18n`）

### 2.2 子阶段细节

#### 子阶段 1: C-1 react-hooks 修复（1-2d）

| 维度 | 详情 |
|------|------|
| **范围** | 6 处 `react-hooks/set-state-in-effect` 警告 + 样本 `exhaustive-deps` 修复 |
| **文件清单** | 通过 `npm run lint` 输出定位（具体待扫描）|
| **不变量** | 不改业务逻辑；只调 effect 依赖 / setState 时机 / 拆 effect |
| **验收** | `npm run lint` 0 warnings（包括 react-hooks 6+59 归零）|
| **测试** | 现有 2801 测试不回归；行为变化时新增测试 |
| **验证方式** | `npm run lint 2>&1 \| grep react-hooks` → 0 命中 |

#### 子阶段 2: C-4 avlTreeVisualizer 内存泄漏 + useVisualizer 渲染 ref（1-2d）

| 维度 | 详情 |
|------|------|
| **范围** | 定位 avlTreeVisualizer 内存泄漏根因 + 修复 useVisualizer 渲染 ref 双重初始化问题 |
| **P1 风险** | avlTreeVisualizer 在多次插入/删除后内存增长未释放 |
| **不变量** | 不改可视化 API；不破坏现有动画；不改 page/hook 层 |
| **验收** | 重复插入/删除 100 次后内存稳定；useVisualizer 渲染次数 ≤ 1 |
| **测试** | 新增 5-10 项 visualizer 内存/重渲染测试 |
| **验证方式** | `vitest run src/__tests__/visualizers/avlTreeVisualizer.test.ts` + 手动浏览器性能测试 |

#### 子阶段 3: C-2 覆盖率 80% → 85%（3-5d）

| 维度 | 详情 |
|------|------|
| **范围** | 200+ 新测试覆盖 15 data structure 边界 + visualizer 分支 + 工具函数分支 |
| **基线** | v16.0.0 GA 80.05% / v20 第一轮后 ~80% |
| **优先级** | ① visualizer 分支（80% 视觉逻辑）② hooks 边界（undo/redo 极限）③ utils 错误路径 |
| **不变量** | 不改产品代码；只新增测试文件 |
| **验收** | `npm run test:coverage` → statements ≥ 85% |
| **验证方式** | `npx vitest run --coverage` 输出 |

#### 子阶段 4: A M7 learning config 教学文案 i18n 迁移（3d）

| 维度 | 详情 |
|------|------|
| **范围** | `src/configs/learning/*` 31 个 config 的教学文案（步骤标题 / 描述 / 提示）|
| **新增 i18n 键** | `learningConfig.{algorithm}.step.{i}.{title,description,hint}` ~70-100 键 |
| **不变量** | 保留所有 step 内容；只把字符串移出 → 走 `tStatic()` |
| **验收** | AssertSameKeys 编译通过；no-hardcoded-chinese-in-jsx 0 警告；learning config 文件 0 硬编码中文 |
| **测试** | 新增 20-30 项 learning config i18n 完整性测试 |
| **用户校对** | ⏸ **必填**：迁移后用户审阅 31 个 config 内容；任何错别字/技术错误由用户拍板修改 |

#### 子阶段 5: A M8 实际英文翻译填充（5d）

| 维度 | 详情 |
|------|------|
| **范围** | 全部 en 命名空间：从机器翻译初稿 → AI 润色 → 用户校对定稿 |
| **翻译来源** | AI 翻译（GPT/Claude）+ 用户关键文案校对 |
| **流程** | ① AI 生成 en 翻译初稿（自动）；② AI 二次润色（专业术语校对）；③ 用户抽查核心页面校对 |
| **不变量** | zh 翻译不动；键结构不变；仅填充 en 值 |
| **验收** | en 翻译覆盖率 100%；pseudoLocale 与 en 实际渲染对比一致；用户抽查 5 个核心页面无明显翻译错误 |
| **测试** | 10-20 项 en 翻译完整性 + 5 项 pseudoLocale 对比测试 |
| **用户校对** | ⏸ **必填**：用户抽查首页/排序/图算法/二叉树/哈希 5 个核心页面 |

#### 子阶段 6: A M9 完整 E2E + pseudoLocale 集成（2d）

| 维度 | 详情 |
|------|------|
| **范围** | 补全 `e2e/i18n.spec.ts`（v20 第一轮已交付框架）：① 17 页面 zh/en 切换；② pseudoLocale 烟雾；③ locale 完整性 |
| **集成点** | pseudoLocale 触发器 + 17 页 E2E 覆盖 + 错误截图 |
| **不变量** | 不改生产代码；只扩 e2e 框架 |
| **验收** | `npx playwright test e2e/i18n.spec.ts` 全部通过；17 页全绿 |
| **测试** | 17 页 × 3 场景 = 51 项 i18n E2E 用例 |
| **验证方式** | Playwright 截图断言（zh/en/pseudo 三态对比）|

---

## 3. 资源分配

### 3.1 人力

| 角色 | 时间投入 | 主要职责 |
|------|---------|---------|
| **项目维护者（用户）** | ~3-5d（5 个子阶段中 4 个需校对）| A M7 教学文案校对 + A M8 英文翻译抽查 + 子阶段拍板 |
| **AI 协作** | 100% | 技术扫描 / 迁移 / 测试 / 文档 / 验证 |

### 3.2 计算资源

| 资源 | 用途 | 工时 |
|------|------|------|
| Local sandbox | 文件读写 / 类型检查 / 测试 / build | 同步 |
| Grep / Glob / Read | 代码扫描 | 0.5h（各子阶段）|
| Subagent（可选）| 大目录扫描 | 0.5h（C-1 / C-4）|

### 3.3 Feature 分支策略

| 分支 | 阶段 | 合并时机 |
|------|------|---------|
| `feature/v20-c1-react-hooks` | 阶段 1.1（C-1）| 子阶段完工后立即 merge main |
| `feature/v20-c4-memory-leak` | 阶段 1.2（C-4）| 子阶段完工后立即 merge main |
| `feature/v20-c2-coverage` | 阶段 2（C-2）| 子阶段完工后立即 merge main |
| `feature/v20-a-m7-m8-m9-i18n` | 阶段 3-5（A M7/M8/M9）| 阶段 5 完工后 merge main（也可分段 merge）|

> **规则**: 每个子阶段完工 → 自测通过 → commit → 推分支 → 用户拍板 merge → 合并到 main → 删除 feature 分支。

---

## 4. 详细时间表 + 里程碑

### 4.1 阶段 1: P1 风险修复（2-3d，并行 2 子阶段）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D1 上午** | 创建 `feature/v20-c1-react-hooks` + `feature/v20-c4-memory-leak` 分支；基线快照（lint + test）| 2 分支可见 + 2801 tests 通过 | M1.1 准备 |
| **D1 下午 - D2** | C-1 react-hooks 修复（6 处 + 样本 exhaustive-deps）| `npm run lint` 0 react-hooks 警告；测试 2801+ 不回归 | M1.2 C-1 完成 |
| **D1 下午 - D2** | C-4 avlTreeVisualizer 内存泄漏定位 + 修复 | 100 次插入/删除内存稳定 + 新增 5-10 项 visualizer 测试通过 | M1.3 C-4 完成 |
| **D3 上午** | 2 子阶段汇报 + 用户拍板 merge | 用户确认；C-1 + C-4 merge main | M1 阶段 1 收尾 |

### 4.2 阶段 2: C-2 覆盖率提升（3-5d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D3 下午** | 创建 `feature/v20-c2-coverage`；识别覆盖率空白区（statements < 85%）| v8 coverage report 缺口清单 | M2.1 准备 |
| **D4 - D7** | 200+ 新测试（visualizer 分支 / hooks 边界 / utils 错误路径）| `npx vitest run --coverage` statements ≥ 85% | M2.2 C-2 完成 |
| **D7 下午** | C-2 汇报 + 用户拍板 merge | 用户确认；C-2 merge main | M2 阶段 2 收尾 |

### 4.3 阶段 3: A M7 learning config i18n 迁移（3d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D8 上午** | 创建 `feature/v20-a-m7-m8-m9-i18n` 分支；扫描 `src/configs/learning/*` 硬编码 | 31 config × N 步骤 = N 字符清单 | M3.1 准备 |
| **D8 下午 - D9** | learning config 字符串迁移（`tStatic()` + `|` 分隔）；新增 ~70-100 i18n 键 | AssertSameKeys 通过；no-hardcoded-chinese 0 警告 | M3.2 迁移完成 |
| **D10 上午** | 新增 20-30 项 learning config i18n 测试 | 2820+ tests 通过 | M3.3 测试完成 |
| **D10 下午** | ⏸ **用户校对**（必填）：31 config 教学文案；用户拍板 merge | 用户确认；A M7 merge main（或暂存等待 M8/M9 一起 merge）| M3 阶段 3 收尾 |

### 4.4 阶段 4: A M8 实际英文翻译填充（5d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D11 上午** | 启动翻译流水线：AI 翻译 en 初稿 | en 翻译覆盖率 100% | M4.1 初稿完成 |
| **D11 下午 - D12** | AI 二次润色（专业术语 / 一致性 / 长句拆分） | 翻译通顺度自评达标 | M4.2 润色完成 |
| **D13 上午** | ⏸ **用户抽查**（必填）：5 个核心页面（Home / Sort / Graph / Tree / Hash）| 用户拍板翻译质量 | M4.3 校对完成 |
| **D13 下午 - D14** | 用户反馈修改 + 新增 10-20 项翻译完整性测试 + pseudoLocale 对比 | 2850+ tests 通过 | M4 阶段 4 收尾 |

### 4.5 阶段 5: A M9 完整 E2E + pseudoLocale 集成（2d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D15 上午** | 扩 `e2e/i18n.spec.ts`：17 页面 × 3 场景（zh / en / pseudo）| 51 项 E2E 用例 | M5.1 E2E 扩写 |
| **D15 下午 - D16** | pseudoLocale 触发器 + 错误截图 + Playwright 集成 | E2E 全部通过 + 截图归档 | M5.2 集成完成 |
| **D16 下午** | A M7+M8+M9 汇报 + 用户拍板 merge main | 用户确认；A 路径全部 merge main | M5 阶段 5 收尾 |

### 4.6 阶段 6: v20 第二轮 GA（1d）

| 时间 | 任务 | 验收 | 里程碑 |
|------|------|------|--------|
| **D17 上午** | 4 feature 分支全部 merge main；删除分支；同步 6 份核心文档 | git log 显示 4 commits；working tree clean | M6.1 GA 准备 |
| **D17 下午** | v20.0.0 GA 验证（lint 0 / test 2850+ / build / bundle / e2e 17 页）+ PROJECT_STATUS / TODO / WORKLOG / CHANGELOG 同步 | 全部通过 | M6.2 v20.0.0 GA |

**总时间**: 17d（工作日）/ ~3.5 周

---

## 5. 风险评估

| 风险 | 等级 | 影响 | 缓解策略 |
|------|------|------|----------|
| **A M7/M8 需用户校对，可能延迟** | 🟡 中 | 阶段 3-4 时间不可控 | ① AI 提前生成初稿减少用户负担；② 允许用户分批校对；③ 关键文案用 checklist 列出 |
| **C-4 avlTreeVisualizer 内存根因复杂** | 🟡 中 | 阶段 1 拖延 | ① 限定 2d 内交付（按 rule §7.2 "3 次失败即回滚"）；② 复杂 case 改 P2 推迟 |
| **C-2 200+ 测试可能超出 5d** | 🟢 低 | 阶段 2 拖延 | ① 按优先级分层（visualizer 优先 / utils 其次）；② 允许覆盖率停在 83-84% 作为中间点 |
| **en 翻译质量用户反复修改** | 🟡 中 | 阶段 4 拖延 | ① AI 二次润色提前消化质量问题；② 用户抽查限定 5 页 |
| **A M9 E2E 17 页环境不稳定** | 🟢 低 | 阶段 5 拖延 | ① 沿用 v20 第一轮已交付的 e2e 框架；② 失败 case 单独记录 + 修复 |
| **子阶段并行分支 merge 冲突** | 🟢 低 | 阶段 1 | C-1 + C-4 范围无重叠，冲突概率低 |

---

## 6. 验收标准

### 6.1 子阶段验收（强制）

| 子阶段 | 验收 | 验证方式 |
|--------|------|----------|
| **C-1** | `npm run lint` 0 react-hooks 警告；现有 2801+ tests 通过 | `npm run lint` + `npx vitest run` |
| **C-4** | avlTreeVisualizer 100 次操作内存稳定；useVisualizer 渲染次数 ≤ 1；新增 5-10 项测试通过 | `npx vitest run src/__tests__/visualizers/avlTreeVisualizer.test.ts` + 手动 perf |
| **C-2** | statements ≥ 85%；branches ≥ 70%；不引入新 warning | `npx vitest run --coverage` |
| **A M7** | AssertSameKeys 通过；no-hardcoded-chinese 0 警告；新增 20-30 项测试通过；用户校对确认 | `npm run lint` + `npx vitest run` + 用户 review |
| **A M8** | en 翻译覆盖率 100%；5 个核心页面用户抽查通过；新增 10-20 项翻译测试通过 | `npx vitest run` + 用户抽查 |
| **A M9** | 51 项 E2E 用例全绿；17 页 zh/en/pseudo 三态截图归档 | `npx playwright test e2e/i18n.spec.ts` |

### 6.2 v20.0.0 GA 验收（最终）

| 检查项 | 目标 | 验证 |
|--------|------|------|
| `npm run lint` | 0 errors / 0 warnings | CI 必跑 |
| `npx vitest run` | ≥ 2850 tests 通过 | CI 必跑 |
| `npx vitest run --coverage` | statements ≥ 85% | 阶段性里程碑 |
| `npm run build` | 成功；bundle 全 < budget | `npm run build` + bundle check |
| `npx playwright test` | 17 页 E2E 全绿 | E2E 必跑 |
| 6 份核心文档同步 | PROJECT_STATUS / TODO / WORKLOG / CHANGELOG / CLAUDE / AGENTS | 强制同步 |

---

## 7. 范围外（Out-of-Scope）

| 项目 | 原因 | 重启条件 |
|------|------|----------|
| **B 方向 AI 智能学习伴侣**（25-30d）| 用户未拍板 | 用户明确指令启动 |
| **C-5 性能优化**（FPS / Lighthouse 95+ / PWA）| v21+ 范围 | v21 启动时按需启动 |
| **v22+ 协作教学** | 长线路线图 v22 范围 | 2027 Q1 启动 |
| **C-3 文档完善**（本轮 C-3 已完成）| 已在 v20 第一轮交付 | — |
| **架构重构** | rule §11 地基红线 | 仅用户明确指令 |

---

## 8. 关键约束遵守（rule §2 三条铁律 + §11 地基红线）

- ✅ **不扩展需求**（严格按用户拍板 123 全要 + B 不启动）
- ✅ **不基于猜测改代码**（C-1/C-2/C-4 实施前先扫描定位）
- ✅ **不伪造结果**（所有子阶段必须测试通过 + 真实截图）
- ✅ **不擅自拍板**（每个子阶段完工后必须用户确认才 merge）
- ✅ **不在 main 分支上修改**（所有工作在 feature 分支）
- ✅ **最小修改原则**（不"顺手优化"无关代码）
- ✅ **AI-TDD 优先**（C-1/C-4 先写测试 → 跑测试 → 改代码）
- ✅ **测试通过为最终依据**（不能仅"看起来正常"）
- ✅ **任务收尾强制文档同步**（rule §16.3）
- ✅ **设计真源**（DESIGN.md 不存在时**不擅自拍板**视觉决策）
- ✅ **design-md/ 默认禁读**（rule §16.1）

---

## 9. 下一步

按用户拍板的"123 全部都要"，建议按以下顺序启动（基于 P 优先级 + 依赖）：

1. **阶段 1（并行）**: C-1（react-hooks）+ C-4（avlTreeVisualizer 内存）— 2-3d
2. **阶段 2**: C-2（覆盖率 80→85%）— 3-5d
3. **阶段 3**: A M7（learning config 教学文案）— 3d
4. **阶段 4**: A M8（实际英文翻译）— 5d
5. **阶段 5**: A M9（完整 E2E + pseudoLocale）— 2d
6. **阶段 6**: v20.0.0 GA + 文档同步 — 1d

> **等待用户拍板**: 是否按上述顺序启动？或调整优先级 / 合并 / 拆分？

---

> **创建时间**: 2026-06-22 深夜
> **最后更新**: 2026-06-22 深夜
> **状态**: ⏳ **等待用户审阅 + 拍板启动顺序**
