# v21 阶段执行总计划（v20 阶段 100% 收尾 + i18n 完整化 + 质量补完）

> **创建日期**: 2026-06-24
> **拍板依据**: 用户「ABC 全选（并行）」2026-06-24 拍板
> **基线版本**: v20.1.0 patch（main @ edaaf95 / tag v20.1.0 @ e3bae56）
> **基线 commit**: `edaaf95`（v20.1.0 patch 文档同步最终化）
> **实施模式**: §7.2.1 **B 并行**（4 独立子任务 / 中低风险 / 可独立验证）
> **C 工作流（design-md/ `.gitignore` 决策）**: 用户拍板 C **先跳过**，保留悬而未决

---

## §0. 上游依赖

### 0.1 v20 阶段完成状态（基线）

| 子阶段 | 状态 | 移交 v21 |
|--------|------|----------|
| C-1 react-hooks 扫描 | ✅ 完成 | — |
| C-4 useVisualizer 早返回修复 | ✅ 完成 | — |
| A M7-1~M7-7 learning config i18n | ✅ 完成 | — |
| C-2 覆盖率（部分）| 🟡 +247 tests / Statements 82% / Branches 68.93% | v21 B-6 补 3pp+1pp |
| A M8 英文翻译填充 | ⏳ 未启动 | v21 B-7 |
| A M9 完整 E2E + pseudoLocale | ⏳ 未启动 | v21 B-8 |
| v20.0.0 GA 收尾 | ⏳ 替代为 v20.1.0 patch | v21 B-9（可选重规划）|

### 0.2 v21 候选 Backlog（9 项 → 4 子任务合并）

| Backlog | 任务 | 估时 | 风险 | 状态 |
|---------|------|------|------|------|
| B-1 | ~~QuizPanel afterEach import~~ | 5min | 🟢 | ✅ v20 C-2 已修 |
| B-2 | ~~animationExport.test.ts x unused~~ | 5min | 🟢 | ✅ v20 C-2 已修 |
| B-3 | ~~animationExport.test.ts y unused~~ | 5min | 🟢 | ✅ v20 C-2 已修 |
| **B-4** | `animationExport.ts` gif.js `ApplyPaletteOptions` | 0.5d | 🟡 | **A3 本轮开干** |
| **B-5** | `animationExport.ts` `Uint8Array<ArrayBufferLike>` | 0.5d | 🟡 | **A3 本轮开干** |
| **B-6** | C-2 剩余 3pp Statements + 1pp Branches | 2-3d | 🟢 | A1（待用户拍板）|
| **B-7** | A M8 实际英文翻译填充 | 5d | 🟡 | B（待用户校对 5 核心页面）|
| **B-8** | A M9 完整 E2E + pseudoLocale | 2d | 🟢 | 依赖 B-7 |
| **B-9** | v20.0.0 GA 重规划（如需要）| 1d | 🟢 | 依赖 B-7+B-8 |
| **B-10** | Dependabot 6 vulnerabilities 评估 + 升级 | 0.5d | 🟡 | A2（待用户拍板升级策略）|

**总工时**: ~13d（A1: 2-3d + A2: 0.5d + A3: 0.5d + B: 5d + 缓冲: 2-4d）

---

## §1. 目标

### 1.1 核心目标

**完成 v20 阶段 100% 收尾** + **i18n 完整化** + **质量补完**，释放 v21 阶段可启动的 4 个独立子任务（A1/A2/A3/B），按 §7.2.1 B 并行模式同步推进，4 子任务完工后统一 merge 到 main + git tag v21.0.0。

### 1.2 子任务总览

| # | 子任务 | 分支 | 工时 | 风险 | 启动条件 | 状态 |
|---|--------|------|------|------|----------|------|
| **A1** | C-2 剩余覆盖率补完 | `feature/v21-b6-coverage` | 2-3d | 🟢 | 用户拍板目标（如 85% Statements）| ⏳ 待拍板 |
| **A2** | Dependabot 6 vulnerabilities 升级 | `feature/v21-b10-deps` | 0.5d | 🟡 | 用户拍板升级策略（仅高危 / 全升 / 暂不处理）| ⏳ 待拍板 |
| **A3** | typecheck B-4 + B-5 修复 | `feature/v21-b4b5-typecheck` | 0.5d | 🟡 | 无（根因已清楚）| 🟢 **本轮开干** |
| **B** | A M8 实际英文翻译填充 | `feature/v21-b7-i18n-translation` | 5d | 🟡 | 用户校对 5 核心页面（Home / SortPage / ArrayPage / GraphPage / SortCompare）| ⏳ 待用户校对 |
| **C** | design-md/ `.gitignore` 决策 | `feature/v21-c-gitignore` | 5min | 🟢 | **用户拍板 C 先跳过** | ❌ **不启动** |

---

## §2. WBS（工作分解结构）

### 2.1 4 子任务并行 + 1 子任务跳过

```
v21 阶段（v20 收尾 100% + i18n 完整化 + 质量补完）
├─ A1: C-2 覆盖率补完（B-6）[2-3d] 🟢
│  ├─ 调研 visualizers/utils 覆盖空白区（segmentTree/splayTree/avlTree branches < 50%）
│  ├─ 写边界测试（每 visualizer 5-10 项）
│  ├─ 验证 Statements ≥ 85% / Branches ≥ 70%
│  └─ 范围对比矩阵 + 文档同步
│
├─ A2: Dependabot 升级（B-10）[0.5d] 🟡
│  ├─ 评估 6 vulnerabilities 影响（npm audit --json）
│  ├─ 写依赖升级脚本（npm outdated + npm update）
│  ├─ 验证 5 项硬门槛
│  └─ 文档同步
│
├─ A3: typecheck B-4 + B-5 修复（[0.5d]）🟡 ← 本轮开干
│  ├─ B-4: animationExport.ts:234 字符串 → { format: 'rgb565' } [1 行]
│  ├─ B-5: animationExport.ts:242 [bytes] → [bytes as BlobPart] [1 行]
│  ├─ 验证 typecheck 0 errors / vitest 3797 / build OK / bundle OK / lint 0
│  └─ 文档同步（PROJECT_STATUS / TODO / WORKLOG / CLAUDE / AGENTS / v21 plan）
│
├─ B: A M8 翻译填充（B-7）[5d] 🟡
│  ├─ 扫描未翻译键（500-800 键 × 2 locales）
│  ├─ AI 初译（5 核心页面）
│  ├─ 用户校对 1 轮（Home / SortPage / ArrayPage / GraphPage / SortCompare）
│  ├─ 提交 + i18n integrity 8/8 验证
│  └─ 文档同步
│
└─ ❌ C: design-md/ .gitignore 决策 — 用户拍板 C 先跳过
```

### 2.2 关键依赖关系

| 上游 | 下游 | 阻塞项 |
|------|------|--------|
| A3 typecheck 修复 | A1 覆盖率 / A2 Dependabot / B 翻译 | 无（独立）|
| B 翻译（A M8）| A M9 E2E（B-8）| B-7 用户校对 |
| A1 + A2 + A3 + B 完工 | v21.0.0 GA 收尾 | merge 4 分支 + git tag |

### 2.3 4 分支并行交付模式（§7.2.1 B）

| 分支 | 工作流 | 验证独立性 | merge 策略 |
|------|--------|------------|-----------|
| `feature/v21-b4b5-typecheck` | 2 行修复 + typecheck 0 | typecheck 单项独立 | FF merge |
| `feature/v21-b6-coverage` | ~50-100 测试 + 覆盖率 | coverage 单项独立 | FF merge |
| `feature/v21-b10-deps` | package.json + package-lock + 5 项硬门槛 | deps 独立 | FF merge |
| `feature/v21-b7-i18n-translation` | 500-800 键 × 2 locales + 用户校对 | i18n integrity 独立 | FF merge |

**冲突风险**: 🟢 低（4 分支工作流独立，无文件交叉）
- A1/A2/A3 涉及 `src/utils/` + `src/visualizers/` + `package.json` 互不重叠
- B 涉及 `src/i18n/locales/{zh,en}/**` 独立

---

## §3. 资源分配

### 3.1 人力

| 角色 | 工时 | 任务 |
|------|------|------|
| **AI** | ~9d | A1 + A2 + A3 + B 全部实施 |
| **用户** | ~3-5d | B 用户校对 5 核心页面 + A1/A2 关键决策拍板 |
| **CI/自动化** | 持续 | lint / typecheck / vitest / build / bundle / npm audit |

### 3.2 工具

- **代码编辑**: Edit/Write 工具
- **版本控制**: git（4 feature 分支 + FF merge）
- **测试**: vitest（3797+ 基线 + 增量）
- **E2E**: playwright（待 A1/A2/B 完工触发）
- **i18n 校验**: scripts/check-en-cjk.mjs + check-en-translations.mjs + integrity.ts
- **依赖审计**: npm audit + Dependabot

---

## §4. 时间表 + 里程碑

### 4.1 4 阶段时间表

| 阶段 | 时间 | 工作流 | 同步点 |
|------|------|--------|--------|
| **阶段 1**（本轮 2026-06-24）| Day 1 | A3 typecheck 修复（2 行）| 完工汇报 |
| **阶段 2** | Day 2-3 | A1 覆盖率补完 + A2 Dependabot 升级 | 各完工汇报 |
| **阶段 3** | Day 4-8 | B 翻译填充（5d，需用户校对）| 校对完成点 |
| **阶段 4** | Day 9-10 | 4 分支 merge + 文档同步 + git tag v21.0.0 | v21.0.0 GA 发布 |

### 4.2 关键里程碑

| 里程碑 | 验收 | 风险 |
|--------|------|------|
| **M1**（A3 完工）| typecheck 0 errors / vitest 3797 / lint 0 | 🟢 低（1 commit）|
| **M2**（A1 完工）| Statements ≥ 85% / Branches ≥ 70% | 🟢 低（~50-100 测试）|
| **M3**（A2 完工）| npm audit 0 vulnerabilities / 5 项硬门槛 | 🟡 中（升级可能破坏）|
| **M4**（B 完工）| i18n integrity 8/8 / 100% 翻译 | 🟡 中（翻译质量依赖用户）|
| **M5**（v21.0.0 GA）| 4 分支 merge + 6 文档 + git tag | 🟢 低（一次性收尾）|

---

## §5. 风险评估

| 风险 | 等级 | 触发条件 | 缓解 |
|------|------|----------|------|
| A1 覆盖率目标拍板延迟 | 🟢 | 用户不确认 85% / 88% / 90% | 默认 85%（v20 plan 目标）|
| A2 Dependabot 升级破坏兼容 | 🟡 | 6 vulnerabilities 升级后 typecheck/lint/test 失败 | 回滚 + 重新评估（按 §7.2 防灾）|
| A3 typecheck 修复破坏 GIF 功能 | 🟢 | `applyPalette` 字符串 → 对象 后行为差异 | 验证现有 22 测试全绿 |
| B 翻译用户校对延迟 | 🟡 | 用户 5-7 天未校对 | 启动前先与用户约定时间表 |
| B 翻译质量不过关 | 🟡 | AI 初译后用户大面积推翻 | 预留 1-2d 重新 AI 翻译 + 校对 |
| 4 分支合并冲突 | 🟢 | 文件交叉（实际无）| 4 分支工作流独立 |
| 调研偏差 > 20% | 🟢 | v21 范围明确 | 按 §6.4 SOP 立即停止 + 汇报 |

---

## §6. 验收

### 6.1 v21 阶段整体验收

| 维度 | 目标 | 验收方式 |
|------|------|----------|
| **v20 阶段 100% 收尾** | A M8 + A M9 + v20.0.0 GA（移交后已 v20.1.0 patch）| B 完工 + merge |
| **i18n 完整化** | 100% zh/en 翻译 | i18n integrity 8/8 |
| **覆盖率** | Statements ≥ 85% / Branches ≥ 70% | vitest --coverage |
| **TypeCheck** | 0 errors（含 B-4/B-5 修复）| tsc --noEmit |
| **Lint** | 0 errors / 0 warnings | npm run lint |
| **测试** | ≥ 3797（基线）| npx vitest run |
| **Bundle** | 全 < budget | scripts/check-bundle.js |
| **5 项硬门槛** | 全过 | §10.1 5 项 |

### 6.2 5 项硬门槛（每子任务完工时验证）

1. `npm run lint` → 0 errors / 0 warnings
2. `npm run typecheck` → 0 errors（含 B-4/B-5 修复）
3. `npx vitest run` → 全绿
4. `npm run build` → 成功
5. `node scripts/check-bundle.js` → passed

---

## §7. 不做范围（Out of Scope）

- ❌ **C 工作流** design-md/ `.gitignore` 决策（用户拍板 C 先跳过，保留悬而未决）
- ❌ A M9 完整 E2E + pseudoLocale 集成（v21 B-8，依赖 B-7；不在本轮 v21 范围）
- ❌ v20.0.0 GA 重规划（B-9，可选；v20.1.0 patch 已发布，v21.0.0 GA 替代）
- ❌ A1 中调研发现的新架构问题（如 segmentTree 边界 + 性能 → 移 v22 候选）
- ❌ A2 中 Dependabot 提示的**非高危**漏洞（如 devDependencies 中低危 → 留作技术债）
- ❌ 架构翻新（§11 地基红线 10 项不动）
- ❌ Redux/Zustand 引入（§11 红线 3）
- ❌ design-md/ 读取（§16.1 默认禁读，**未拍板前不引用**）

---

## §8. 关键约束

### 8.1 §2 三条铁律
- **不扩展需求**（严格按 v20 closure 9 项 backlog + 用户拍板范围）
- **不基于猜测**（A3 根因已扫描；A1/A2/B 需调研先于实施）
- **不伪造结果**（5 项硬门槛实测；覆盖率实测）

### 8.2 §7 工程化
- §7.1 AI-TDD：先写测试 → 跑测试 → 改代码（新增功能严格；typecheck 修复可豁免）
- §7.2 4 个 feature 分支，**不在 main 直接改**
- §7.2.1 **B 并行**（4 独立子任务 / 中低风险 / 可独立验证）
- §7.5 0 errors / 0 warnings；`any` 默认禁止（例外需注释 + PR 评审）
- §7.7 11 项规则自检（每次汇报必含）
- §10.1 5 项硬门槛（每子任务完工时验证）
- §10.3 VERIFICATION 4 状态（PASS / PARTIAL / INCOMPLETE / FAILED）
- §16.3 任务收尾文档同步（PROJECT_STATUS / TODO / WORKLOG / CLAUDE / AGENTS / plan）

### 8.3 §11 地基红线
- 不动技术栈 / 目录结构 / 状态管理 / 路由 / 可视化 / 动画引擎 / 持久化 / i18n / 样式 / 依赖版本约束
- B-10 升级若涉及架构变更 → 暂停 + 评估 + 讨论 + 更新文档 + **用户确认后**动工

### 8.4 §16 设计参考
- §16.1 `design-md/` **默认禁读**；C 工作流未拍板前不 commit/stash/引用
- §16.2 视觉决策以 `DESIGN.md` 为依据；冲突实现视为越权

---

## §9. 启动指令

### 9.1 本轮（A3）启动指令

> "严格遵守 Agent 宪法和 v21 总 plan §2.3 / §6.1 / §8.1-8.4，只实施 A3 子任务（B-4 + B-5 typecheck 修复），不要超出范围。完成后停下来汇报，不要自动进入 A1/A2/B。"

### 9.2 A3 开工前检查清单

- [x] 已读 PROJECT_STATUS.md（v20.1.0 patch @ e3bae56）
- [x] 已读 WORKLOG.md 前 80 行
- [x] 已读 TODO.md v21 候选 backlog
- [x] 已读 v21 总 plan（本文件）
- [x] 已读 `animationExport.ts:220-250` 根因分析
- [x] 已读 `gifenc.d.ts` 类型声明
- [x] 已读 `package.json` v20.1.0
- [x] git 状态：main @ edaaf95 / clean
- [ ] 创建 `feature/v21-b4b5-typecheck` 分支
- [ ] 验证基线：5 项硬门槛（v20.1.0 patch 已通过）
- [ ] 应用 2 行修复（B-4 + B-5）
- [ ] 验证：5 项硬门槛 + typecheck 0 errors
- [ ] 1 commit
- [ ] 同步 6 份核心文档
- [ ] 汇报

### 9.3 A1/A2/B 启动前置条件

| 子任务 | 前置条件 | 阻塞项 |
|--------|----------|--------|
| A1 | 用户拍板 Statements 目标（85% / 88% / 90%）+ Branches 目标（70% / 75%）| 用户拍板 |
| A2 | 用户拍板 Dependabot 升级策略（仅高危 / 全升 minor / 暂不处理）| 用户拍板 + npm audit 报告 |
| B | 用户校对 5 核心页面（Home / SortPage / ArrayPage / GraphPage / SortCompare）| 用户时间投入 |

---

## §10. 后续阶段（v22+ 候选）

按 6-12 月长线路线图（[2026-06-22-longterm-roadmap-v18-to-v24.md](./2026-06-22-longterm-roadmap-v18-to-v24.md)）：

- **v22** (2027 Q1): T2 AI 智能伴侣 v1 + T3 协作教学（实时协作 + 教师后台 + 学习路径）
- **v23** (2027 Q2): T1 持续国际化 + 性能优化（移动 PWA + WASM + LMS 集成）
- **v24** (2027 Q3+): 候选方向（用户社区 / Marketplace / 商业化）

---

> **本 plan 由用户「ABC 全选（并行）」2026-06-24 拍板建立**。本轮（A3）开干；A1/A2/B 待用户对各 plan 关键决策点拍板后启动。  
> **最后更新**: 2026-06-24
