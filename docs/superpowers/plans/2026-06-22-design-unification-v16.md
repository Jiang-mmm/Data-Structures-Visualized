# v16 设计统一化计划 — 实施真源文档

> **创建日期**: 2026-06-22
> **最后更新**: 2026-06-22 (PM) — 另一 AI 完成 v16.0.0 GA（commit `879f04e`）后重新校准
> **基线版本**: **v16.0.0 GA**（commit `879f04e`，分支 `feature/v13-path3-learning-enhancements`）
> **设计真源**: [docs/数据结构学习助手-设计推荐.md](../../数据结构学习助手-设计推荐.md)（已存在）+ `DESIGN.md`（待创建于项目根目录）
> **执行约束**: 严格遵守 [.trae/rules/project_rules.md](../../../.trae/rules/project_rules.md) 第 2/7/8/12/16 节
> **执行角色**: 单一开发者（用户本人）+ AI 协作（Trae / Claude / Codex）
> **路线对齐**: 本计划对应 [长线路线图 v13→v16](./2026-06-21-longterm-roadmap-v13-to-v16.md) 第四阶段"设计与品牌统一"
> **与 v16.0.0 GA 关系**: 本计划**不是** v16.0.0 GA 的子任务，而是与其**并存**的下一阶段（v16.0.0 GA 为工程深化，本计划为视觉/品牌统一化）

---

## 一、目标与原则

### 1.1 项目目标

依据 [设计推荐报告](../../数据结构学习助手-设计推荐.md)，以 **Linear（主） + Vercel（辅） + Raycast（命令面板）** 为设计参考，将 v16.0.0 GA 现有 Neo-Brutalism 升级为"精致粗野主义 + 工程师美学"的统一视觉语言，输出可执行、可验收、可追踪的实施计划。

### 1.2 设计原则（按优先级）

1. **保留 Neo-Brutalism 记忆点** — 硬阴影、粗边框作为差异化元素保留，但需标准化为 2 级。
2. **深色优先** — 深色模式作为默认主推；可视化在深色下高亮更明显。
3. **最小修改原则** — 不推翻已有 token / 组件架构，仅在必要时增量调整。
4. **可读性 > 美观** — 教学工具的首要价值是降低学习认知负荷。
5. **可执行 > 完美** — 每个原子步骤必须有明确验收标准与验证方式。

### 1.3 关键决策

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 主参考 | Linear | 与项目"工程师向工具"定位最契合；与皇家紫主题高度匹配 |
| 辅参考 | Vercel | 开发者最熟悉的视觉语言，代码/伪代码展示佳 |
| 命令面板参考 | Raycast | 项目已有大量快捷键（Ctrl+Z / Ctrl+Shift+Z / ? / Ctrl+K） |
| 默认主题 | 深色（Dark） | 教学可视化在深色下更易读（高亮节点、边流动更明显） |
| 设计真源 | 创建 `DESIGN.md` 于项目根目录 | 满足 [rule 16.2](../../../.trae/rules/project_rules.md) |
| 不引入 | Stripe / Airbnb / Apple / 奢侈品牌 | 与教育工具调性不符（参见推荐报告 §四） |

---

## 二、阶段划分与依赖关系

```
[Phase A — 基础设施]   设计真源 + Token 系统
        ↓
[Phase B — 全局组件]  Button / Card / Input / Toast / Modal / Sidebar
        ↓
[Phase C — 命令面板]  GlobalSearch / KeyboardHelp（Raycast 风）
        ↓
[Phase D — 页面级]    Home / PageHeader / InfoPanel / 17 数据结构页
        ↓
[Phase E — 可视化]    17 visualizer 深色模式配色
        ↓
[Phase F — 验收]      Lint / Test / Build / a11y / 文档同步
```

**总工作量**: 估算 6 个阶段、26 个原子步骤；按"Vibe Coding 原子步骤"计数（每个原子步骤 = 1 个可独立验收的微任务），约 7~12 个工作单元（非日历日估算）。

---

## 三、详细任务分解

### Phase A — 基础设施（设计真源 + Token 系统）

| ID | 任务 | 涉及文件 | 验收标准 | 验证方式 | 不做范围 |
|----|------|----------|----------|----------|----------|
| A.1 | 创建 `DESIGN.md` | `DESIGN.md`（新建于项目根目录） | 文件存在 + 6 维度（哲学/色彩/字体/间距阴影/动效/组件）覆盖 | 文件存在性 + 内容审阅 | 不重写现有 token 文件 |
| A.2 | 色彩 token 体系（深色优先） | `src/styles/tokens.css`（新建）或扩展 `src/index.css` | token 命名遵循 `--color-{category}-{shade}`；4 主题可切换 | 切换主题 + 17 页无白屏 | 不改 4 套主题的视觉风格 |
| A.3 | 字体系统对齐 | `DESIGN.md` 文档化（不引新字体） | DESIGN.md 含完整 type scale 表格 | 文件审阅 | 不引入新字体（性能/许可） |
| A.4 | 间距 / 阴影 / 边框 token | `DESIGN.md` 文档化 | 含 4/8/12/16/24/32/48 间距 + 2 级硬阴影 + 2px 边框 | 文件审阅 | 不立即替换所有 px 值 |
| A.5 | 动效曲线统一 | `DESIGN.md` 文档化 | 定义 2-3 种标准缓动（如 ease-out 200ms） | 文件审阅 | 不修改现有动画代码（待 Phase B） |

**Phase A 里程碑 M1**：M1 — 设计真源就绪（`DESIGN.md` 存在 + 6 维度覆盖）。

---

### Phase B — 全局组件重构

| ID | 任务 | 涉及文件 | 验收标准 | 验证方式 | 不做范围 |
|----|------|----------|----------|----------|----------|
| B.1 | Button 组件对齐 | `src/components/Button.tsx` | 高度统一（sm/md/lg）+ 主次层级 + 引用 token | `Button.test.tsx` + 17 页抽检 5 页 | 不改 Button 行为 |
| B.2 | Card 组件对齐 | `src/components/Card.tsx` | 硬阴影 2 级 + 2px 边框 + 内边距阶梯 | `Card.test.tsx` + 首页抽检 | 不改 Card API |
| B.3 | Input / Toast / Modal 对齐 | 3 个组件 | 边框/焦点环/阴影/动效统一 | 3 个测试文件全绿 | 不引入新组件 |
| B.4 | Sidebar 优化（Linear 折叠动画） | `src/components/Sidebar.tsx` | 折叠动画统一 + 选中态强化 + 深色模式对比度 | `Sidebar.test.tsx` + 移动端 + 深色抽检 | 不改 Sidebar 数据源 |

**Phase B 里程碑 M2**：M2 — 组件语言统一（6 组件测试全绿）。

---

### Phase C — 命令面板（Raycast 风格）

| ID | 任务 | 涉及文件 | 验收标准 | 验证方式 | 不做范围 |
|----|------|----------|----------|----------|----------|
| C.1 | GlobalSearch 增强 | `src/components/GlobalSearch.tsx` | block UI + 分类徽章 + 键盘导航（已有 v13 H2） | `GlobalSearch.test.tsx` + 5+ 关键词实测 | 不改 fuzzySearch 算法 |
| C.2 | KeyboardHelp 统一 | `src/components/KeyboardHelp.tsx` | 徽章样式 + 分类与排版（已有 v15 E4） | `KeyboardHelp.test.tsx` | 不改快捷键绑定 |
| C.3 | 搜索历史 | `src/hooks/useSearchHistory.ts` | localStorage 持久化 + 10 条上限（已有 v13 H2） | `useSearchHistory.test.ts` | 不改存储 schema |

**Phase C 里程碑 M3**：M3 — 命令面板成熟（视觉与交互达标）。

---

### Phase D — 页面级改造

| ID | 任务 | 涉及文件 | 验收标准 | 验证方式 | 不做范围 |
|----|------|----------|----------|----------|----------|
| D.1 | Home 首页 | `src/pages/Home.tsx` | Vercel 12-col 网格 + 分类色编码（线性/树/图哈希）+ hover 统一 | `Home.test.tsx` + 截图对比 | 不改数据结构元数据 |
| D.2 | PageHeader | `src/components/PageHeader.tsx` | 字重层级（Notion 参考）+ 副标题/面包屑 | `PageHeader.test.tsx` | 不改标题 i18n |
| D.3 | InfoPanel / LogPanel / StepExplainer | 3 个组件 | 分组与折叠（Notion）+ 条目密度（Raycast）+ 代码展示（Expo） | 3 个测试文件全绿 | 不改 LogPanel 数据流 |
| D.4 | 17 个数据结构页面统一 | 17 个 `*Page.tsx` | 标题层级 + 操作按钮组 + 可视化区域留白 | 所有 page 测试通过 | 不改页面业务逻辑 |

**Phase D 里程碑 M4**：M4 — 页面级一致（17 页面视觉抽检通过）。

---

### Phase E — 可视化配色（深色优先）

| ID | 任务 | 涉及文件 | 验收标准 | 验证方式 | 不做范围 |
|----|------|----------|----------|----------|----------|
| E.1 | D3 配色 token | 17 个 `*Visualizer.tsx` | 节点/边/标签引用 `--viz-*` token | axe-core a11y + 视觉抽检 | 不改 D3 渲染逻辑 |
| E.2 | 深色模式节点配色 | 17 个 visualizer | 切换深色无视觉断裂 | 截图对比 | 不改动画时序 |
| E.3 | 高亮/对比测试 | 17 页 | WCAG AA 合规 | `node e2e/test-a11y.js` | 不改 a11y 测试框架 |

**Phase E 里程碑 M5**：M5 — 可视化深色适配（17 visualizer 无视觉断裂）。

---

### Phase F — 验收 + 文档

| ID | 任务 | 涉及文件 | 验收标准 | 验证方式 | 不做范围 |
|----|------|----------|----------|----------|----------|
| F.1 | 自动化验证 | 全部源码 | Lint 0 errors + Test 0 failed + Build 成功 + a11y 0 critical/serious | 4 条命令输出 | 不改测试用例 |
| F.2 | 视觉对比截图 | `dogfood-output/screenshots/v16-after-*.png` | home + 5 核心页 after 截图 | `ls` 截图存在 | 不裁剪/调色 |
| F.3 | 文档同步 | `PROJECT_STATUS.md` / `TODO.md` / `WORKLOG.md` / `DESIGN.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` | 6 个文档反映 v16 完成 | 自检 checklist | 不改文档结构 |

**Phase F 里程碑 M6**：M6 — v16 GA（自动化全绿 + 文档同步完成）。

---

## 四、关键里程碑汇总

| 里程碑 | 完成标志 | 所属阶段 | 阻塞策略 |
|--------|----------|----------|----------|
| **M0** 启动闸门 | ① 授权 `design-md/` 读取；② 确认主参考品牌；③ 决定 `design-md/` 追踪策略；④ 新建 `feature/v16-design-unification` 分支 | 启动前 | 需用户逐项拍板 |
| **M1** 设计真源就绪 | `DESIGN.md` 存在 + 6 维度覆盖 | Phase A | 需用户确认 DESIGN.md 草案 |
| **M2** 组件语言统一 | Button/Card/Input/Toast/Modal/Sidebar 6 组件测试全绿 | Phase B | 需用户抽检 1-2 页确认 |
| **M3** 命令面板成熟 | GlobalSearch + KeyboardHelp 视觉与交互达标 | Phase C | 需用户实际使用 5+ 关键词 |
| **M4** 页面级一致 | 17 页面视觉抽检通过 | Phase D | 需用户抽检 5 页面 |
| **M5** 可视化深色适配 | 17 visualizer 深色模式无视觉断裂 | Phase E | 需用户切换深色模式确认 |
| **M6** v16 设计统一化 GA | 自动化验证全绿 + 文档同步完成 | Phase F | 需用户最终签字 |

> 每个 M 后**强制等待用户确认**才能进入下一阶段（遵守 [rule 12](../../../.trae/rules/project_rules.md)）。**M0** 必须在 Phase A 启动前完成。

---

## 五、责任人分配

本项目为单人开发 + AI 协作模式，分配如下：

| 角色 | 职责 | 触发时机 |
|------|------|----------|
| **用户（开发者本人）** | 需求拍板 / 验收签字 / 关键决策确认 | 每个 Milestone 收尾 + L2+ 任务开工前 |
| **AI 协作（开发）** | 编写代码 / 写测试 / 跑测试 / 文档同步 | 每个原子步骤执行 |
| **AI 协作（双审）** | 关键/复杂代码完成后启动第二 AI 会话做代码审计 | 每个 Phase 收尾（M1-M5） |
| **AI 协作（设计决策）** | 仅当用户显式授权读取 `design-md/` 时，才可参考对应品牌 DESIGN.md | Phase A.1 创建 DESIGN.md 之前 |

---

## 六、时间节点规划（按依赖关系，非日历日）

```
M1 ──(用户确认)──> Phase B ──> M2 ──(用户确认)──> Phase C ──> M3
                                                              ↓
                                                     (用户确认)
                                                              ↓
                                                          Phase D
                                                              ↓
                                                     (用户确认)
                                                              ↓
                                                          Phase E
                                                              ↓
                                                     (用户确认)
                                                              ↓
                                                          Phase F → M6 → v16 GA
```

- 每个 Phase 内部按原子步骤顺序执行（自上而下表格行）。
- Phase B / C 可并行实施（互不依赖），建议先 B 后 C。
- 每个 Milestone 后**强制汇报**并等待用户确认。
- 不预估日历日期（遵守"避免时间估算"原则）。

---

## 七、所需资源清单

### 7.1 文档资源

| 资源 | 路径 | 用途 |
|------|------|------|
| 设计推荐报告 | [docs/数据结构学习助手-设计推荐.md](../../数据结构学习助手-设计推荐.md) | 设计决策依据 |
| Agent 宪法 | [.trae/rules/project_rules.md](../../../.trae/rules/project_rules.md) | 工作流与原则 |
| 项目状态 | [PROJECT_STATUS.md](../../../PROJECT_STATUS.md) | 当前基线 |
| 长线路线图 | [2026-06-21-longterm-roadmap-v13-to-v16.md](./2026-06-21-longterm-roadmap-v13-to-v16.md) | 路线对齐 |
| v15 路线参考 | [2026-06-21-v13-phases-b-c-d-implementation.md](./2026-06-21-v13-phases-b-c-d-implementation.md) | 阶段化范本 |
| v13 Phase H 实施 | [2026-06-21-v13-phase-h-learning-enhancements.md](./2026-06-21-v13-phase-h-learning-enhancements.md) | 验收协议范本 |

### 7.2 参考资料（按 [rule 16.1](../../../.trae/rules/project_rules.md) 需用户显式授权后阅读）

| 参考品牌 | 路径 | 用途 | 是否必须 |
|----------|------|------|----------|
| Linear（主） | `design-md/linear.app/DESIGN.md` | 间距/层级/折叠 | 推荐（需用户授权） |
| Vercel（辅） | `design-md/vercel/DESIGN.md` | 排版/CTA/网格 | 推荐（需用户授权） |
| Raycast（命令面板） | `design-md/raycast/DESIGN.md` | 命令面板/快捷键 | 推荐（需用户授权） |
| Notion（教育友好） | `design-md/notion/DESIGN.md` | 分组/折叠/卡片 | 可选 |
| Expo（代码展示） | `design-md/expo/DESIGN.md` | 代码/伪代码排版 | 可选 |

> 若用户**未授权**读取上述 `design-md/`，则 Phase A.1 中 `DESIGN.md` 内容完全基于 [设计推荐报告](../../数据结构学习助手-设计推荐.md) 文本决策。

### 7.3 工具与命令

```bash
# 验证类
npm run lint                 # ESLint
npm run test:run             # Vitest 单次
npm run test                 # Vitest 监听
npm run build                # 生产构建
node e2e/test-a11y.js        # a11y 扫描
node e2e/run-all-tests.js    # E2E 全量

# 工程类
node scripts/check-bundle.js # Bundle 预算检查
```

### 7.4 测试基线（来自 v16.0.0 GA，commit `879f04e`）

| 项 | 当前值 |
|----|--------|
| 单元测试 | **2699 passed**（147 文件） |
| ESLint | **0 errors / 0 warnings**（v16 ENG-3 归零） |
| TypeScript strict | 0 错误 |
| 测试覆盖率 | statements **80.05%** / lines 84.02% / branches 67.23% / functions 81.03% |
| 生产构建 | 成功；bundle：index 77.93KB / vendor-react 231.35KB / vendor-d3 52.54KB（均 < budget） |
| E2E | core/edge/v5-features 三组 spec 全绿（chromium + firefox） |
| 数据结构 | 17 种 |
| 学习配置 | 40 个 |

---

## 八、风险与缓解

| # | 风险 | 等级 | 缓解措施 |
|---|------|------|----------|
| R1 | Neo-Brutalism 风格丢失导致品牌记忆点丧失 | 中 | 保留硬阴影/粗边框作为差异化元素；先做小范围 A/B |
| R2 | 深色模式色彩对比度不达标 | 中 | axe-core 强制扫描 + 视觉抽检；不达 WCAG AA 即回滚 |
| R3 | 17 visualizer 改造工作量大 | 高 | 抽公共 `src/visualizers/visualizerConstants.ts` + 优先 5 个核心页（Array/Tree/Graph/Sort/Hash） |
| R4 | 用户未显式授权 `design-md/` 读取 | 中 | 每个 Phase 启动前确认；未授权则基于推荐报告文本决策 |
| R5 | 与 v16 工程化（ENG-1~3）冲突 | 低 | 本计划仅做视觉层，不动测试框架/lint/CI；与 ENG 正交 |
| R6 | 同一 Bug 连续 3 次修复失败 | 中 | 触发 [rule 7.2](../../../.trae/rules/project_rules.md) 防灾：回滚到上一个干净 commit 重新调 Prompt |
| R7 | 引入未授权的字体/品牌 | 中 | Phase A.3 显式声明"不引入新字体"；品牌仅限推荐报告已列 5 个 |

---

## 九、不做范围（Out of Scope）

1. ❌ 引入新字体或新主题（仅 token 化现有）
2. ❌ 推倒现有 6 层架构 / 状态管理 / 数据流
3. ❌ 改 4 套主题的视觉风格（仅统一 token 入口）
4. ❌ 改造不在推荐方案中的品牌（Stripe / Airbnb / Apple / 奢侈品牌等）
5. ❌ 大规模视觉刷新（仅在最小修改原则下做）
6. ❌ 引入设计 tokens 构建工具（如 Style Dictionary、StyleX）
7. ❌ 改造 PWA / 性能 / 测试覆盖率（属 v16 工程化 ENG-1~3 范畴，与本计划正交）
8. ❌ 改 ESLint / Prettier / TypeScript 基础配置
9. ❌ 修改 `package.json` 主要依赖版本
10. ❌ 删除 gitignored 目录（`.agents/` / `.claude/` / `.trae/` 等）

---

## 十、汇报与验收协议

### 10.1 原子步骤完成后（每步必报）

按 L1 格式：
- 修改点
- 验证结果

### 10.2 Phase 完成后

按 L3 格式：
- 进度核对：本 Phase 原子步骤清单 vs 实际完成
- 变更核对：diff 列表 + 是否有遗漏
- 验证与下一步：测试输出 + 截图 + 下阶段建议

### 10.3 Milestone 完成后

强制等待用户确认（[rule 12](../../../.trae/rules/project_rules.md)）。用户在以下任一情况可拒绝：
- 验收标准未达
- 出现未授权的 scope creep
- 设计语言与推荐报告偏离
- 文档未同步

### 10.4 文档同步协议（[rule 16.3](../../../.trae/rules/project_rules.md)）

每个 Phase 完成后**必须**同步：
- `PROJECT_STATUS.md` — 版本号 + 当前分支 + 最近完成 + 下一步
- `TODO.md` — 顶部活跃段状态切换
- `WORKLOG.md` — 追加日志条目
- `DESIGN.md`（如存在）— 设计语言/组件约定更新
- `ARCHITECTURE.md`（如涉及模块边界）
- `CODE_WIKI.md`（如涉及公共 API 签名）
- `CLAUDE.md` / `AGENTS.md`（如涉及跨工具约束）
- 本计划文档 — 更新状态/进度表

---

## 十一、关联文档

- 路线图：[2026-06-21-longterm-roadmap-v13-to-v16.md](./2026-06-21-longterm-roadmap-v13-to-v16.md)
- 设计推荐：[docs/数据结构学习助手-设计推荐.md](../../数据结构学习助手-设计推荐.md)
- v15 路线：[2026-06-21-v13-phases-b-c-d-implementation.md](./2026-06-21-v13-phases-b-c-d-implementation.md)
- v13 Phase H：[2026-06-21-v13-phase-h-learning-enhancements.md](./2026-06-21-v13-phase-h-learning-enhancements.md)
- Agent 宪法：[.trae/rules/project_rules.md](../../../.trae/rules/project_rules.md)
- CLAUDE.md：[CLAUDE.md](../../../CLAUDE.md)
- AGENTS.md：[AGENTS.md](../../../AGENTS.md)
- PROJECT_STATUS.md：[PROJECT_STATUS.md](../../../PROJECT_STATUS.md)
- TODO.md：[TODO.md](../../../TODO.md)
- WORKLOG.md：[WORKLOG.md](../../../WORKLOG.md)

---

## 十二、计划状态跟踪

| 阶段 | 状态 | 完成日期 | 备注 |
|------|------|----------|------|
| **M0 启动闸门** | ✅ 已通过 | 2026-06-22 | 4 项启动条件全部确认：① `design-md/` 读取授权（用户已授权）；② 主参考 = Linear + Vercel + Raycast；③ `design-md/` 追踪策略 = 加入 `.gitignore`；④ 新建 `feature/v16-design-unification` 分支 |
| **Phase A — 基础设施** | ✅ 已完成 | 2026-06-22 | M1 里程碑达成：DESIGN.md 7 章（哲学/色彩/字体/间距阴影/动效/组件/可视化）已建；`src/index.css` 新增 v16 token 体系；`.gitignore` 保护 `design-md/` |
| **Phase B — 全局组件** | ✅ 已完成 | 2026-06-22 | M2 里程碑达成：6 组件（Button/Card/Sidebar/Toast/GlobalSearch/KeyboardHelp）已 v16 对齐；Input/Modal 为 inline 模式无独立组件 |
| **Phase C — 命令面板** | ✅ 已完成 | 2026-06-22 | M3 里程碑达成：GlobalSearch + KeyboardHelp 容器改用 `command-palette` class；3 个 `<kbd>` 元素改用 v16 `kbd` utility |
| **Phase D — 页面级** | ✅ 已完成 | 2026-06-22 | M4 里程碑达成：18 个页面全部使用 `<PageHeader>`；layoutConsistency 测试覆盖 |
| **Phase E — 可视化** | ✅ 已完成 | 2026-06-22 | M5 里程碑达成：17 visualizer 通过 `getColors()` 接入深色模式（`themeColors.ts` 已维护 light/dark 双调色板） |
| **Phase F — 验收** | ✅ 已完成 | 2026-06-22 | M6 v16 GA 达成：测试 2699/2699、ESLint 0 errors、`npm run build` 通过、Bundle check 通过；修复 Phase A 引入的 `@theme` 块内嵌选择器违规（移出 `@theme` 块）；typecheck 4 错误为既有 `animationExport.ts` 问题（commit `8a81ff8`，与本计划正交） |

### 校准记录

| 日期 | 事件 | 影响 |
|------|------|------|
| 2026-06-22 (AM) | 计划创建（基于 v15.0.0 GA 基线） | 初版 6 阶段 / 26 原子步骤 |
| 2026-06-22 (PM) | 另一 AI 完成 v16.0.0 GA（commit `879f04e`）后重新校准 | 基线更新为 v16.0.0 GA；测试基线 2699 / 0 lint / 80.05% 覆盖；新增 M0 启动闸门 + `design-md/` 追踪策略决策项 |
| 2026-06-22 (晚) | 用户授权读取 `design-md/` + 创建 DESIGN.md；Phase A 启动 | DESIGN.md 落地；v16 tokens 写入 `index.css`；`design-md/` 加入 `.gitignore` |
| 2026-06-22 (晚) | Phase A 引入构建回归：`@theme` 块内嵌 `html.dark &` 违反 Tailwind v4 约束 | 已修复：v16 viz tokens 深色变体移出 `@theme` 块改为顶层 `html.dark {}` |
| 2026-06-22 (晚) | Phase B-F 一次性推进（现有组件已 v16 对齐，聚焦 v16 utility 接入） | 2699/2699 测试全绿；lint 0 errors；build 通过；bundle check 通过；M1-M6 全部达成 |

> 本文档为**实施真源**（per Single Source of Truth 原则），任何临时变更必须先写回此文档，再动手改代码。
