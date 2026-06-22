# i18n 完善（v15.x ENH-2）

> **目标**: 补齐 ds-visualizer i18n 缺失的算法术语表与复杂度描述命名空间，新增 `useAlgorithmGlossary` Hook 与 `AlgorithmGlossaryCard` 组件用于术语速查。
> **状态**: 🚧 进行中（Phase A 原子步骤 1-4）
> **关联路线图**: v15+ ENH-2（i18n 完善）

---

## 一、范围

### 1.1 不做什么（Out of Scope）

- **不替换** 全项目 100+ 文件中已有的硬编码中文（这些大多是 `hooks.*` 内部日志、`learningConfig.step.*` 教学文案，**不属于用户可见 UI 字符串**，按规则保持原样）。
- **不重命名** 已有 i18n 键（保持向后兼容）。
- **不动** 数据库表、状态管理、路由等底层架构。
- **不在 main 分支** 上提交。
- **不 commit**（由 main agent 统一提交）。

### 1.2 做什么（In Scope）

| # | 类别 | 范围 |
|---|------|------|
| 1 | i18n 键 | 新增 `complexity` 命名空间（10 键：best/average/worst/space/title/time/space/empty 等） |
| 2 | i18n 键 | 新增 `algorithms` 命名空间（16 数据结构 × 8 字段 = 128 键） |
| 3 | Hook | 新增 `useAlgorithmGlossary()` 返回术语表条目数组 |
| 4 | 组件 | 新增 `AlgorithmGlossaryCard` 组件（表格 + 复杂度四列） |
| 5 | Home | 集成 AlgorithmGlossaryCard（在 LearningPath 之后） |
| 6 | 测试 | i18n 键完整性测试（zh + en 双语不空）+ hook 测试 + 组件测试 |

---

## 二、验收标准

| 维度 | 标准 |
|------|------|
| **i18n 完整性** | `complexity` 命名空间 zh/en 各 10 键均非空；`algorithms` 命名空间 zh/en 各 16 × 8 键均非空 |
| **Hook** | `useAlgorithmGlossary()` 返回 16 个条目；每条含 `id`, `nameKey`, `descriptionKey`, `useCaseKey`, `complexity.best/avg/worst/space` |
| **组件** | `AlgorithmGlossaryCard` 渲染表格 + 表头 + 至少 16 行；空数据时显示占位 |
| **Home** | Home.tsx 中能看到 `AlgorithmGlossaryCard` 渲染 |
| **测试** | 新增 ≥ 6 个测试全部通过；`npm run test:run` 全绿 |
| **Lint** | `npm run lint` 0 errors / 0 warnings |
| **Build** | `npm run build` 成功，bundle < budget |
| **类型** | TypeScript strict 0 错误 |

---

## 三、原子步骤

| # | 步骤 | 状态 | 验证 |
|---|------|------|------|
| 1 | 在 `locales.ts` interface + zh + en 新增 `complexity` 命名空间 | ⏳ | 类型检查 + 键存在性测试 |
| 2 | 在 `locales.ts` interface + zh + en 新增 `algorithms` 命名空间（16 数据结构） | ⏳ | 类型检查 + 键存在性测试 |
| 3 | 写测试：`i18n.test.ts`（键完整性） | ⏳ | vitest 跑过 |
| 4 | 写测试：`useAlgorithmGlossary.test.ts` | ⏳ | vitest 跑过 |
| 5 | 写测试：`AlgorithmGlossaryCard.test.tsx` | ⏳ | vitest 跑过 |
| 6 | 实现：`useAlgorithmGlossary.ts` Hook | ⏳ | hook 测试通过 |
| 7 | 实现：`AlgorithmGlossaryCard.tsx` 组件 | ⏳ | 组件测试通过 |
| 8 | 集成到 `Home.tsx` | ⏳ | 主页测试通过 |
| 9 | 运行 `npm run test:run` / `lint` / `build` | ⏳ | 全绿 |
| 10 | 同步文档（PROJECT_STATUS / TODO / WORKLOG / AGENTS / CLAUDE） | ⏳ | grep 验证 |

---

## 四、命名规范

- 命名空间前缀 camelCase（`complexity.*` / `algorithms.*`）
- 字段：`name` / `description` / `useCase` / `best` / `average` / `worst` / `space`（保持统一）
- 16 个数据结构 key 与 STRUCTURE_KEYS 保持一致：`array`, `stack`, `queue`, `linkedlist`, `tree`, `avlTree`, `redBlackTree`, `bTree`, `segmentTree`, `heap`, `trie`, `hash`, `graph`, `skipList`, `unionFind`, `sort`（16 个）
