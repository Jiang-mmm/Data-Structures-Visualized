# v20 M7 实施真源文档 — learning config 教学文案 i18n 迁移

> **创建日期**: 2026-06-23
> **基线版本**: v20 第一轮已交付（A M5+M6+M9 + C-3）merge `193ef85` + v20 第二轮 C-4（merge `8b9f9a7`）
> **基线状态**: 2812 tests / 0 lint / 80.05% 覆盖 / 17 数据结构 / **40 学习配置**（1,432 i18n 键）/ 8 图算法 / 12 排序
> **执行原则**: UNDERSTAND → PLAN → EXECUTE → VERIFY；每子阶段验收后汇报；不自动进入下一阶段
> **负责人**: AI（开发）+ 用户（en 翻译校对）
> **关联文档**:
> - [v20 第二轮执行计划](./2026-06-22-v20-round2-execution-plan.md) §2.2
> - [v20 下一迭代计划 §2.2 M7](./2026-06-22-v20-next-iteration-plan.md)
> - [v19 M3 强约束完成报告](../i18n-inventory/)（`AssertSameKeys` + `no-hardcoded-chinese-in-jsx`）

---

## 0. M7 范围（用户拍板：A. 全量迁移）

| 维度 | plan 估计 | M7-1 实际扫描（2026-06-23）|
|------|----------|------------------------|
| 配置文件数 | 40 | 40 ✓ |
| title 字段数 | (含 70 字符串) | **204** |
| description 字段数 | (含 70 字符串) | **204** |
| tips 数组数 | (含 70 字符串) | **204** 数组（~408 字符串项）|
| highlightTerms 数组数 | (含 70 字符串) | **204** 数组（~408 字符串项）|
| complexity 对象数 | (含 70 字符串) | **104** 对象（time/space 共 ~208 键）|
| **总 i18n 键** | **70 字符串** | **~1,432 键**（×2 locales = 2,864 字符串）|
| 实际字符数 | ~5,000 | 17,296（含 codeSnippet 中文注释 ~2,945 字符，**保留**）|
| 计划工时 | 3d | **6-8d**（用户已拍板 A. 全量）|

---

## 1. 架构决策（已完成）

| 决策点 | 选项 | 选择 | 理由 |
|--------|------|------|------|
| **M7-D1** namespace 粒度 | A. 单 `learning` 大对象 / B. 40 子 namespace（每 config 一文件）| **A. 单 `learning` 大对象** | 与 M6 `algorithmInfo` 模式一致；便于 `AssertSameKeys` 整体校验；en 翻译上下文连贯 |
| **M7-D2** 数组字段（tips/highlightTerms）序列化 | A. 数组直接存（每元素独立键）/ B. `|` 分隔字符串 | **B. `|` 分隔字符串**（消费时 `.split('|')`）| 与 M6 `algorithmInfo.characteristics` 模式一致；类型推断更简单 |
| **M7-D3** complexity 字段拆分 | A. 完整 `complexity: { time, space }` 子对象 / B. 拆为 `complexityTime` + `complexitySpace` 独立键 | **B. 拆为独立键**（可选）| 与 M6 扁平键风格一致；避免深度嵌套（AssertSameKeys 在 TS 深度 10 限制下更安全）|
| **M7-D4** codeSnippet i18n 范围 | A. 全部 i18n（含代码注释）/ B. 仅 UI 字段，codeSnippet 保留中文 | **B. codeSnippet 保留中文** | codeSnippet 是代码，注释是开发面向；按 rule 业务逻辑注释用中文；UI 仅显示代码文本 |
| **M7-D5** 加载时序 | A. eager `tStatic()`（M5/M6 模式）/ B. lazy 动态 `t()` 调用 | **A. eager `tStatic()`** | config 在 module 加载时 import 求值；与现有架构兼容；语言切换需刷新（与 M5/M6 一致）|
| **M7-D6** ESLint 规则覆盖 | A. 启用 `no-hardcoded-chinese-in-jsx` 覆盖 configs/ / B. 不扩展规则，靠人工 + 测试 | **A. 扩展规则** | 防止回归；与 components + utils 覆盖一致；M7 验收后规则升级为 error |
| **M7-D7** en 翻译生成 | A. AI 初译 → 用户校对 1 轮 / B. 仅 AI 不校对 | **A. AI 初译 → 用户校对 1 轮** | 教学文案需准确；D3=B 翻译工作流 |
| **M7-D8** 测试范围 | A. 每 config 1 个测试文件 / B. 统一集成测试 | **A. 每 config 1 个测试文件** | 便于定位失败；与 components M6 模式一致 |

---

## 2. 类型设计

### 2.1 Locale 新增 `learning` namespace

```ts
// 在 src/i18n/locales.ts 末尾追加
export interface Locale {
  // ... 50+ 现有命名空间 ...
  learning: {
    [configKey: string]: {
      steps: {
        [stepId: string]: {
          title: string
          description: string
          /** tips joined with '|' for serialization (consumed as tips.split('|')) */
          tips: string
          /** highlightTerms joined with '|' */
          highlightTerms: string
          complexityTime?: string
          complexitySpace?: string
        }
      }
    }
  }
}
```

### 2.2 Locale 文件物理布局

```
src/i18n/locales/
  zh/
    learning/
      index.ts            # 聚合 40 config
      array.ts            # arrayConfig 的 zh 值
      stack.ts
      queue.ts
      linkedlist.ts
      doublyLinkedList.ts
      tree.ts
      avlTree.ts
      redBlackTree.ts
      bTree.ts
      segmentTree.ts
      hash.ts
      heapStructure.ts
      trie.ts
      skipList.ts
      unionFind.ts
      graph.ts
      bfs.ts
      dfs.ts
      dijkstra.ts
      bellmanFord.ts
      floydWarshall.ts
      prim.ts
      kruskal.ts
      topoSort.ts
      complexityAnalysis.ts
      advancedDataStructures.ts
      realWorldApplications.ts
      sortCompare.ts
      bubble.ts
      selection.ts
      insertion.ts
      shell.ts
      comb.ts
      tim.ts
      merge.ts
      quick.ts
      heap.ts
      radix.ts
      bucket.ts
      counting.ts
  en/
    learning/             # 同上结构
```

### 2.3 Config 文件迁移模式

**Before**:
```ts
{
  id: 'structure',
  title: '数组结构',
  description: '数组在内存中连续存储...',
  codeSnippet: '...',
  highlightTerms: ['索引', '连续'],
  tips: ['数组的连续存储...'],
  complexity: { time: '随机访问 O(1)', space: 'O(n)' },
}
```

**After**:
```ts
{
  id: 'structure',
  title: tStatic('learning.array.steps.structure.title'),
  description: tStatic('learning.array.steps.structure.description'),
  codeSnippet: '...',  // 保留中文代码注释
  highlightTerms: tStatic('learning.array.steps.structure.highlightTerms').split('|'),
  tips: tStatic('learning.array.steps.structure.tips').split('|'),
  complexity: {
    time: tStatic('learning.array.steps.structure.complexityTime'),
    space: tStatic('learning.array.steps.structure.complexitySpace'),
  },
}
```

---

## 3. 实施步骤（7 子阶段）

| 子阶段 | 范围 | 验证 | 工时 |
|--------|------|------|------|
| **M7-1** | 扫描 40 configs 实际 i18n 键数 | ✅ 已交付（本扫描报告 1,432 键）| 0.5d |
| **M7-2** | Locale 类型扩展 + namespace 骨架 + 聚合层 | `AssertSameKeys` 编译通过（占位）| 0.5d |
| **M7-3** | **zh 值自动提取**（从 40 config 反向生成 zh locale）| zh locale 文件 40 个全生成 + integrity 通过 | 1d |
| **M7-4** | **en 值 AI 翻译生成**（1,432 键 × 2 locales = 2,864 字符串）| en locale 文件 40 个全生成 + AssertSameKeys 通过 | 2d |
| **M7-5** | **40 config 迁移**（写入 `tStatic()` 调用）| `no-hardcoded-chinese-in-jsx` 0 警告（configs 目录）| 1.5d |
| **M7-6** | **40 config 测试 + 集成测试** | 新增 40+ 测试文件，全绿 | 1d |
| **M7-7** | **用户校对 en 翻译 1 轮 + 修复** | 用户签收 + Lint + Tests + Build | 0.5d |
| **总计** | — | — | **7d** |

**关键依赖**:
```
M7-1 ✅ → M7-2 → M7-3 → M7-4 → M7-5 → M7-6 → M7-7
```

**关键检查点**:
- M7-2 后：`AssertSameKeys<typeof zh, typeof en>` 占位空对象编译通过
- M7-3 后：zh locale 1,432 键全到位，integrity 校验 zh 通过
- M7-4 后：en locale 1,432 键全到位，AssertSameKeys zh/en 双向通过
- M7-5 后：`no-hardcoded-chinese-in-jsx` 对 configs 目录 0 警告
- M7-6 后：2812 + 40×N 测试 全绿
- M7-7 后：用户校对完成，2812 + 40×N 测试仍全绿，文档同步

---

## 4. 不做范围（Out of Scope）

| 项目 | 原因 | 后续阶段 |
|------|------|---------|
| codeSnippet 翻译 | 代码注释是开发者向，保留中文（rule 业务逻辑注释）| 永久不做 |
| `quiz.question/explanation` 翻译 | quiz 字段不在 v20 计划范围 | v21+ 评估 |
| 算法 glossary 二次翻译 | 已有 v15.x `useAlgorithmGlossary` | 不做 |
| 学习 config 拆分重构 | M8+ 可选 | v21+ 评估 |

---

## 5. 风险与缓解

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| en 翻译 AI 初译质量 | 高 | 中 | M7-7 用户校对 1 轮 + 接受部分 fallback（如算法名 `O(n)`）|
| AssertSameKeys TS 深度限制 | 中 | 高 | M7-D3 扁平化拆 time/space 已规避；M7-2 验证编译 |
| eager 模式语言切换需刷新 | 中 | 中 | 与 M5/M6 保持一致；用户接受；v21+ 评估 lazy 模式 |
| 40 config 同时迁移冲突 | 低 | 中 | M7-5 按 algorithmKey 字母顺序迁移，每 config 自洽 |
| 用户校对延迟 | 中 | 中 | M7-7 前预留 1d 校对窗口；en 初译先 commit（M7-4）让用户并行 review |

---

## 6. 质量保证（QA 强制项，每子阶段验收）

| 维度 | 工具 | 阈值 |
|------|------|------|
| 静态分析 | `npm run lint` | 0 errors / 0 warnings |
| 类型检查 | `npm run typecheck` | 0 errors |
| 单元测试 | `npx vitest run` | 全绿；本轮新增 40+ 测试文件 |
| 覆盖率 | `npx vitest run --coverage` | statements ≥ 80%（M7 不主动提升覆盖率；等 C-2 一起提升）|
| 构建 | `npm run build` | 成功；bundle 全部 < budget |
| i18n 规则 | `no-hardcoded-chinese-in-jsx` 对 configs/ | M7-5 后 0 警告（升级 error）|
| 键镜像 | `AssertSameKeys` 编译时断言 | M7-4 后编译通过 |
| 完整性 | `integrity.checkIntegrity` 运行时 | zh/en 镜像无 missingInEn/missingInZh |
| 浏览器 | 1440p 截图 | 中英文切换所有 17 页面无破图 |

---

## 7. 文档同步清单（M7 完成后）

| 文档 | 同步内容 |
|------|---------|
| `PROJECT_STATUS.md` | v20 M7 状态 + 当前分支 + 下一步 |
| `TODO.md` | v20 M7 段 + 验收 |
| `WORKLOG.md` | 追加 7 子阶段日志 |
| `AGENTS.md` / `CLAUDE.md` | 当前活跃计划表 |
| `docs/superpowers/i18n-inventory/08-m7-learning-config-migration.md` | M7 完成报告（仿 06-m4 模板）|
| `API.md` | 不需要（M7 仅改 configs，不改 API）|
| `ARCHITECTURE.md` | 追加 v20 M7 章节（learning namespace 引入）|
| `src/i18n/README.md`（如存在）| learning namespace 说明 |
| `src/configs/learning/README.md` | 追加迁移说明 |

---

## 8. 启动指令（每次开工）

> "严格遵守 Agent 宪法 + 本实施真源文档，仅实施当前子阶段 M7-X（X 为当前步骤）。
> 完成后立即停下来汇报，禁止自动进入下一子阶段。
> 当前基线：branch=`feature/v20-a-m7-m8`，基线 commit=`8b9f9a7`（C-4 收尾）。"

---

> **本计划文档遵循最小修改原则**（rule 8），任何范围变更必须先更新本文件再写代码。
