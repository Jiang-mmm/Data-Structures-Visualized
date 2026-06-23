# B 子任务 mini-plan：B-7 A M8 实际英文翻译填充

> **创建日期**: 2026-06-24
> **基线**: v20.1.0 patch @ `edaaf95`（origin/main；v21 A3 typecheck 修复 @ `be33345` 仍在独立分支 `feature/v21-b4b5-typecheck` 未 merge main，**严禁触碰** `src/utils/animationExport.ts` 避免 typecheck 错误）
> **分支**: `feature/v21-b7-i18n-translation`（基于 main @ `edaaf95`）
> **依赖**: 用户对 5 核心页面校对（Home / SortPage / ArrayPage / GraphPage / SortCompare）
> **风险**: 🟡 中
> **工时**: 5d（其中 4d AI 初译 + 1d 用户校对）
> **实施模式**: §7.2.1 B 并行（独立子任务）

---

## §1. 目标

完成 v20 A M8 子阶段：**实际英文翻译填充**（500-800 键 × 2 locales）。

按 v20.1.0 release report §5 移交 v21 候选：A M8 英文翻译填充 = B-7。

## §2. WBS

### 阶段 1：扫描未翻译键（0.5d）

1. 扫描 `src/i18n/locales/{zh,en}/` 目录所有文件
2. 对比 zh vs en 键对齐（i18n integrity 8/8 验证）
3. 列出未翻译/未对齐键清单
4. 按 5 核心页面分组：Home / SortPage / ArrayPage / GraphPage / SortCompare
5. 给用户 3 选项：校对范围（5 核心 / 全 17 页 / 仅 Home + SortPage）

### 阶段 2：AI 初译（2d）

1. 按用户拍板范围 AI 翻译（500-800 键）
2. 保持术语一致性（参考 v20 M7-6 738 处翻译 + 现有 en 翻译风格）
3. 翻译后立即跑 i18n 完整性 + check-en-cjk + check-en-translations 3 项验证
4. 0 CJK 泄漏 / 100% 键对齐

### 阶段 3：用户校对（1-2d）

1. 用户校对 5 核心页面（人工审校语义 + 地道性）
2. AI 根据校对意见调整
3. 用户签字确认

### 阶段 4：验证 + 文档（0.5d）

1. i18n integrity 8/8
2. check-en-cjk.mjs 0 命中
3. check-en-translations.mjs 0 outliers（合法情况除外）
4. 5 项硬门槛全过
5. 文档同步

## §3. 关键决策点（等用户拍板）

| # | 决策点 | 选项 |
|---|--------|------|
| 1 | **校对范围** | A 5 核心页面（推荐）/ B 全 17 页 / C 仅 Home + SortPage |
| 2 | **翻译质量** | A 语义准确（AI 初译 + 1 轮校对）/ B 地道自然（深度校对）/ C 字面对齐 |
| 3 | **工具支持** | A i18n integrity + check-en-cjk + check-en-translations（标准）/ B + pseudoLocale 烟测 / C + 人工抽检 |
| 4 | **术语一致性** | A 严格遵循 M7-6 738 处翻译 / B 自由发挥 / C 用户拍板术语表 |

## §4. 风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| 用户校对延迟（5 核心页面 × 1d 投入）| 🟡 中 | 提前与用户约定时间表 |
| 翻译质量不过关（AI 初译后大面积推翻）| 🟡 中 | 预留 1-2d 重新 AI 翻译 |
| 术语不一致 | 🟢 低 | 严格遵循 M7-6 翻译风格 |
| CJK 泄漏 | 🟢 低 | check-en-cjk 强制验证 |
| 引入翻译文件冲突 | 🟢 低 | 4 个文件独立，无交叉 |

## §5. 验收

| 维度 | 目标 | 验收方式 |
|------|------|----------|
| i18n integrity | 8/8 | scripts/check-en-translations.mjs |
| CJK 泄漏 | 0 | scripts/check-en-cjk.mjs |
| 翻译完整度 | 100%（按用户拍板范围）| zh vs en 键对比 |
| 5 项硬门槛 | 全过 | §10.1 |
| 用户签字 | ✅ | 用户校对确认 |

## §6. 不做范围

- ❌ 添加新 i18n 键（仅翻译现有键）
- ❌ 重构 i18n 系统（v22+ 候选）
- ❌ 添加新语言（仅 zh + en）
- ❌ pseudoLocale 集成（v21 B-8 范围）
- ❌ E2E 国际化测试（v21 B-8 范围）

## §7. 启动指令

> "严格遵守 Agent 宪法和本 mini-plan §2 / §3 / §4 / §5，只实施 B 子任务（B-7 翻译填充），不要超出范围。完成后停下来汇报，不要自动进入 A1/A2。"
