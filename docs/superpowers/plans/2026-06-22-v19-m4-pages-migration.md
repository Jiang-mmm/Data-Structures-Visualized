# v19 M4 页面级渐进迁移（Pages Migration）— 详细执行计划

> **目标**: 在 M0+M1+M2+M3 已交付基础上，按 P0→P1→P2 顺序将 17 个页面的硬编码中文字符串（~2500 字符）迁移到 `locales/{zh,en}/page/*` 命名空间下，并通过 `t()` 接入 i18n 系统。
> **基线**: v17.0.0 GA（main HEAD `37478cf`，已 merge `b991566`）+ v18 封存清理（merge `37478cf`）+ v19 M0-M3 已 commit（HEAD `a196116`）
> **生成时间**: 2026-06-22（深夜）
> **方法**: v19 计划 §八 M4 拆分 + M1 调研清单 + 三大设计文件（types.ts / integrity.ts / ESLint 规则）保底
> **执行人**: Senior Software Engineer (AI)
> **审核人**: 项目负责人（**用户**）

---

## 1. 起点状态

### 1.1 M0-M3 已交付资产（M4 可直接使用）

| 资产 | 位置 | 状态 |
|------|------|------|
| **类型工具** | `src/i18n/locales/types.ts` | ✅ AssertSameKeys / AssertSameKeysImpl / AssertSameKeysImplHelper / _JoinPath / _CheckLeaf / _IsPlainObject / _IsStringLiteral |
| **运行时校验** | `src/i18n/locales/integrity.ts` | ✅ checkIntegrity / assertIntegrity / collectLeafPaths / countLeaves / diffKeys / hasEmptyLeaf / formatIntegrityReport |
| **伪语言** | `src/i18n/locales/pseudoLocale.ts` | ✅ pseudoLocalize / pseudoLocalizeTree / createPseudoLocaleLoader / PSEUDO_LOCALE_CODE |
| **目录骨架** | `src/i18n/locales/{zh,en}/` | ✅ 5 子目录（algorithm/component/core/learning/page）+ 顶层 index.ts；page 子目录为占位 |
| **聚合层** | `src/i18n/locales/index.ts` | ✅ 导出 types / integrity / pseudoLocale；zh/en 聚合层待 M4-3 接入 |
| **ESLint 规则** | `eslint-rules/no-hardcoded-chinese-in-jsx.js` | ✅ 注册到 `eslint.config.js`，作用于 `src/{pages,components,visualizers}/**`，**warn 级** |
| **测试基线** | `src/__tests__/i18n/` + `src/__tests__/eslint/` | ✅ 95/95 通过（i18n 子目录 54 + eslint 21 + types 20）|
| **useI18n API** | `src/i18n/useI18n.ts` | ✅ `t('namespace.key.subKey')` 签名不变；新增 `useAlgorithmGlossary` Hook 兼容 |

### 1.2 待迁移范围

| 维度 | 数值 |
|------|------|
| **总页面数** | 18（含 Home） / 17（M1 调研按 17 算，Home 单列） |
| **总硬编码字符数** | ~2,500（按 v19 计划）/ M1 调研 ~2,800（含 18 pages）|
| **目标 namespace** | `locales/{zh,en}/page/*`（17 页面文件 + 1 Home） |
| **关键约束** | D1=B（仅 UI）/ D2=C（按语言拆分）/ D3=B（AI+人工校对）/ D4=B（立即生效）/ D5=C（namespace + flat keys）/ D6=B（仅 UI 文本）|

### 1.3 不在 M4 范围（OUT-OF-SCOPE）

- ❌ Components 硬编码（M5 范围）
- ❌ Utils 硬编码（M6 范围）
- ❌ Learning config 硬编码（M7 范围）
- ❌ 实际英文翻译工作（M8 范围；M4 仅占位 zh 完整 + en 占位）
- ❌ `locales.ts` 旧入口删除（保持向后兼容）
- ❌ 自定义 ESLint 规则升级为 `error` 级（M4-3 收尾时按需）

---

## 2. 子阶段拆解（M4-1 / M4-2 / M4-3）

### 2.1 总览

| 子阶段 | 范围 | 估时 | 依赖 | 状态 |
|--------|------|------|------|------|
| **M4-1** | P0 首批（4 pages / Home + SortPage + ArrayPage + GraphPage，~1550 字符）| 2d | M3 | ⏳ 待启动 |
| **M4-2** | P1 第二批（13 pages / Stack + Queue + LinkedList + Tree + AVLTree + BTree + SegmentTree + RedBlackTree + Hash + Heap + Trie + UnionFind + SkipList，~2350 字符）| 2d | M4-1 | ⏳ |
| **M4-3** | P2 第三批（3 pages / GraphAlgorithm + SortCompare + InfoPanel，~500 字符）+ 聚合层接入 + 规则升级 | 1d | M4-2 | ⏳ |

**总估时**: 5d（与 v19 计划 §八一致）

### 2.2 关键决策点（**启动 M4-1 前需用户拍板**）

| # | 决策点 | 推荐选项 | 备选 |
|---|--------|----------|------|
| **Q1** | locale 文件命名风格 | **A. 单词化（home / sortPage / graphPage）** 与 D5 命名空间对齐 | B. camelCase 短名（home / sort / graph） |
| **Q2** | en 翻译执行时机 | **A. M4 阶段只做 zh + en 占位（key 自身），M8 再统一翻译** | B. M4 同步翻译（M4 时间翻倍 ~10d） |
| **Q3** | 旧 i18n 入口处理 | **A. 保持 `locales.ts` 兼容，page.* 命名空间不与旧冲突时双轨** | B. M4-3 一刀切迁移到 `locales/{zh,en}/` 聚合层 |
| **Q4** | no-hardcoded-chinese-in-jsx 升级 | **A. M4-3 收尾时升级为 `error` 级（page 子目录白名单）** | B. 保持 warn 级（依赖 PR review） |

---

## 3. M4-1 详细计划（P0 首批 4 页面，2d）

### 3.1 范围

| 页面 | 文件 | 估计字符数 | 目标 namespace | 优先级 |
|------|------|------------|----------------|--------|
| **Home** | `src/pages/Home.tsx` | ~500 | `home` | P0 |
| **SortPage** | `src/pages/SortPage.tsx` | ~400 | `sortPage` | P0 |
| **ArrayPage** | `src/pages/ArrayPage.tsx` | ~350 | `arrayPage` | P0 |
| **GraphPage** | `src/pages/GraphPage.tsx` | ~300 | `graphPage` | P0 |

**总计**: 4 页面，~1550 字符

### 3.2 原子步骤（7 步，每步 ≤4h）

#### 步骤 1.1 | 扫描 + 提取硬编码字符串（~30min）

- **能执行**:
  1. 用 `Grep` 工具对 4 个目标页面执行 `[\x{4e00}-\x{9fff}]` 扫描（参考 v19 计划中的正则）
  2. 按 JSX 文本节点 / JSX 属性 / 模板字符串 / 注释 4 类分组
  3. 生成 M4-1 子清单（`docs/superpowers/i18n-inventory/02-m4-1-p0-strings.md`）
- **能验收**:
  - 4 个文件全部扫描，零遗漏
  - 子清单含：字符串原文 / 文件:行号 / 上下文 / 目标 namespace / 建议 key
  - 与 M1 总清单的字符数对账（差异 ≤10%）
- **有边界**:
  - **不做**: 不修改任何代码
  - **不做**: 不写测试
  - **不做**: 不创建 locale 文件

#### 步骤 1.2 | 创建 zh locale 文件（~45min）

- **能执行**:
  1. 创建 `src/i18n/locales/zh/page/home.ts`（导出 `home: { ... }` 对象）
  2. 创建 `src/i18n/locales/zh/page/sortPage.ts`
  3. 创建 `src/i18n/locales/zh/page/arrayPage.ts`
  4. 创建 `src/i18n/locales/zh/page/graphPage.ts`
  5. 命名规范：`namespace.flatKey.subKey.subKey`（D5）
- **能验收**:
  - 每个文件用 `export const xxxZh: PageZh = { ... }` 命名
  - 每个文件配套类型声明（`type PageZh` 用 AssertSameKeys 准备镜像检查位）
  - 通过 `npx tsc --noEmit src/i18n/locales/zh/page/` 无错误
- **有边界**:
  - **不做**: en 文件
  - **不做**: 修改 `locales/index.ts` 聚合层
  - **不做**: 改任何页面代码

#### 步骤 1.3 | 创建 en locale 文件（占位 + 完整键结构）（~45min）

- **能执行**:
  1. 创建 `src/i18n/locales/en/page/home.ts`（键结构镜像 zh，**值先用 zh 占位**）
  2. 同样创建 sortPage / arrayPage / graphPage 的 en 文件
  3. 占位策略：M4 阶段 en 值 = zh 值（保证 zh/en 镜像编译时通过）；M8 再统一翻译
- **能验收**:
  - zh/en 文件键集合完全一致（可通过 AssertSameKeys 验证）
  - en 文件可独立 `import` 不报错
- **有边界**:
  - **不做**: 实际英文翻译（M8 范围）
  - **不做**: 写 M4 阶段 en 翻译
- **AI-TDD 关键**: 此步骤是 RED 阶段

#### 步骤 1.4 | 接入聚合层 + 类型断言（~30min）

- **能执行**:
  1. 修改 `src/i18n/locales/zh/page/index.ts`：从占位 `export {}` 改为
     ```ts
     import { home } from './home'
     import { sortPage } from './sortPage'
     import { arrayPage } from './arrayPage'
     import { graphPage } from './graphPage'
     export { home, sortPage, arrayPage, graphPage }
     ```
  2. 同理修改 `src/i18n/locales/en/page/index.ts`
  3. 在 `src/i18n/locales/index.ts` 暴露 zh/en 顶层聚合
  4. 在 zh/en 顶层加 `AssertSameKeys<Zh, En>` 编译时断言
- **能验收**:
  - `npx tsc --noEmit` 无错误
  - 编译时如键不镜像，立即报错（带具体 path）
- **有边界**:
  - **不做**: 修改 `locales.ts` 旧入口
  - **不做**: 修改 `useI18n.ts` API

#### 步骤 1.5 | 修改页面代码（字符串 → t() 调用）（~4h，分 4 子步）

- **能执行**:
  1. 步骤 1.5.1: Home.tsx（~500 字符）
  2. 步骤 1.5.2: SortPage.tsx（~400 字符）
  3. 步骤 1.5.3: ArrayPage.tsx（~350 字符）
  4. 步骤 1.5.4: GraphPage.tsx（~300 字符）
  - 每个子步：
    1. `import { useI18n } from '@/i18n/useI18n'`
    2. `const { t } = useI18n()`
    3. 将 JSX 文本节点中所有硬编码中文字符串替换为 `t('namespace.key')`
    4. JSX 属性中保留中文（如 `aria-label="插入元素"`）→ D6 决策保留
- **能验收**:
  - 浏览器手动测试：切换 zh/en，4 个页面 UI 文本正常切换
  - `npm run lint` 0 errors
  - `no-hardcoded-chinese-in-jsx` 规则对这 4 个页面**无警告**（除 allowList 内的）
- **有边界**:
  - **不做**: 替换 JSX 属性（aria-label / data-* 保留）
  - **不做**: 替换 JSX 表达式（`{variable}`）中的中文
  - **不做**: 替换注释中的中文

#### 步骤 1.6 | 测试用例更新（~1.5h）

- **能执行**:
  1. 单元测试更新：`src/__tests__/i18n/pageTranslations.test.ts` 新增 4 个 describe 块
     - `home` namespace 镜像测试
     - `sortPage` namespace 镜像测试
     - `arrayPage` namespace 镜像测试
     - `graphPage` namespace 镜像测试
  2. i18n integrity 测试更新：`src/__tests__/i18n/integrity.test.ts` 增加 4 个 namespace 校验
  3. 页面单元测试（如果存在）：用 `t('xxx')` 替换原硬编码断言
- **能验收**:
  - i18n+eslint 子目录测试 95 → 105（+10）
  - 4 个页面的页面级单元测试全绿
- **有边界**:
  - **不做**: 新增 E2E 测试（M9 范围）
  - **不做**: 重写已有测试（M4 阶段仅追加，不破坏）

#### 步骤 1.7 | 验证 + 文档同步（~30min）

- **能执行**:
  1. 跑 `npm run lint` → 0 errors
  2. 跑 `npx vitest run` → 全绿
  3. 跑 `npm run build` → 成功
  4. 更新 PROJECT_STATUS.md / TODO.md / WORKLOG.md
- **能验收**:
  - Lint 0 / test 全绿 / build OK
  - 3 份文档同步
  - 页面级 smoke test（手动）：4 页面在 zh/en 切换均无乱码/缺字
- **有边界**:
  - **不做**: 升级 ESLint 规则为 `error` 级（保留 warn，M4-3 收尾时再决定）
  - **不做**: 触发 GitHub Pages 部署

### 3.3 M4-1 总检查清单

- [ ] 4 页面硬编码全部 `t()` 化
- [ ] 4 个 zh locale 文件 + 4 个 en locale 文件（占位）
- [ ] zh/en 镜像编译时断言通过
- [ ] 单元测试 +10 项
- [ ] Lint 0 / 全量 test / build OK
- [ ] 3 份核心文档同步
- [ ] 1 个 micro-commit + push

---

## 4. M4-2 详细计划（P1 第二批 13 页面，2d）

### 4.1 范围

| 页面 | 文件 | 估计字符数 | 目标 namespace |
|------|------|------------|----------------|
| **StackPage** | `src/pages/StackPage.tsx` | ~200 | `stackPage` |
| **QueuePage** | `src/pages/QueuePage.tsx` | ~200 | `queuePage` |
| **LinkedListPage** | `src/pages/LinkedListPage.tsx` | ~250 | `linkedlistPage` |
| **TreePage** | `src/pages/TreePage.tsx` | ~250 | `treePage` |
| **AVLTreePage** | `src/pages/AVLTreePage.tsx` | ~200 | `avlTreePage` |
| **BTreePage** | `src/pages/BTreePage.tsx` | ~200 | `bTreePage` |
| **SegmentTreePage** | `src/pages/SegmentTreePage.tsx` | ~150 | `segmentTreePage` |
| **RedBlackTreePage** | `src/pages/RedBlackTreePage.tsx` | ~150 | `redBlackTreePage` |
| **HashPage** | `src/pages/HashPage.tsx` | ~200 | `hashPage` |
| **HeapPage** | `src/pages/HeapPage.tsx` | ~200 | `heapPage` |
| **TriePage** | `src/pages/TriePage.tsx` | ~150 | `triePage` |
| **UnionFindPage** | `src/pages/UnionFindPage.tsx` | ~150 | `unionFindPage` |
| **SkipListPage** | `src/pages/SkipListPage.tsx` | ~150 | `skipListPage` |

**总计**: 13 页面，~2350 字符

### 4.2 原子步骤（与 M4-1 同构，按批次规模放大）

| 步骤 | 名称 | 估时 | 与 M4-1 差异 |
|------|------|------|---------------|
| 2.1 | 扫描 + 提取硬编码字符串（13 页面） | 1h | 扫描范围扩大，模板复用 M4-1 的子清单格式 |
| 2.2 | 创建 13 个 zh locale 文件 | 1h | 文件数量多；可用并行生成（AI 辅助批量创建）|
| 2.3 | 创建 13 个 en locale 文件（占位） | 1h | 同上；en 值 = zh 值 |
| 2.4 | 接入聚合层 + 类型断言 | 30min | zh/en/page/index.ts 扩展到 17 页面 |
| 2.5 | 修改 13 页面代码（字符串 → t()） | 8h | 13 页面 = 13 子步，每步 ~30-45min；按字典序 batch 处理 |
| 2.6 | 测试用例更新 | 3h | 13 namespace × 2-3 项 = 26-39 项新增 |
| 2.7 | 验证 + 文档同步 | 1h | 同 M4-1 |

**总估时**: 2d（16h ≈ 8h × 2d）

### 4.3 关键风险 + 缓解

| 风险 | 等级 | 缓解 |
|------|------|------|
| **页面差异大**（每个 page 字符串布局各异） | 🟡 中 | 按 D5 命名规范统一（`namespace.section.element`）；不强制统一内部结构 |
| **字符串数量偏差**（M1 估计 vs 实际） | 🟡 中 | 步骤 2.1 扫描对账，差异 > 20% 立即报告用户 |
| **某些页面引用 `locales.ts` 旧 key（如 `array.title`）** | 🟠 中 | D5=C 决定保留 `locales.ts` 旧 key 不变；M4 仅做**新增**硬编码迁移，**不改**旧 key |
| **t() 性能开销**（多页面高频调用） | 🟢 低 | `useCallback` 包裹 + locale 在 useRef 缓存；M4 阶段忽略，M9 性能审计时再优化 |

---

## 5. M4-3 详细计划（P2 第三批 3 页面 + 聚合层收尾，1d）

### 5.1 范围

| 维度 | 内容 |
|------|------|
| **页面迁移** | GraphAlgorithmPage / SortComparePage / InfoPanel（3 页面，~500 字符）|
| **聚合层** | `locales/index.ts` 暴露完整 zh/en；`locales.ts` 旧入口**仅保留 re-export**（向后兼容）|
| **规则升级** | `no-hardcoded-chinese-in-jsx`: warn → error（仅对 M4 已迁移页面子目录）|
| **总览测试** | 启动时 `assertIntegrity(zh, en)` 校验全 50+ namespace 镜像 |
| **文档** | 3 份核心 + v19 计划 M4 验收段 + 5 份 i18n 清单（如未建）|

### 5.2 原子步骤（5 步）

#### 步骤 3.1 | 3 页面迁移（~2h）

- 复用 M4-2 的步骤 2.1-2.7 流程（但只 3 页面，时间压缩到 2h）

#### 步骤 3.2 | 聚合层完整接入（~1.5h）

- **能执行**:
  1. `locales/index.ts` 暴露完整 zh/en 顶层聚合
  2. 添加 `assertIntegrity(zh, en)` 启动时调用（在 `useI18n.ts` 初始化处）
  3. `locales.ts` 旧入口改为 re-export 聚合层（向后兼容）
- **能验收**:
  - 旧代码 `import { zh } from '@/i18n/locales'` 仍工作
  - 启动时若键不镜像，控制台 warn
- **有边界**:
  - **不做**: 删除 `locales.ts` 旧入口
  - **不做**: 重构 useI18n API

#### 步骤 3.3 | ESLint 规则升级（~30min）

- **能执行**:
  1. `eslint.config.js` 规则级别：warn → error
  2. 受影响范围：仅 `src/pages/**/*.{ts,tsx}`（M4 已完成）
  3. `src/{components,visualizers,layouts}/**` 保持 warn（M5+ 阶段）
- **能验收**:
  - 任何新增硬编码中文字符串在 PR 阶段就被 lint 拦下
- **有边界**:
  - **不做**: 全局升级为 error
  - **不做**: 修改规则逻辑

#### 步骤 3.4 | 启动时完整性校验（~1h）

- **能执行**:
  1. 修改 `useI18n.ts` 初始化处：`import { assertIntegrity } from './locales/integrity'`
  2. 在 `getStoredLang()` 旁添加一次 `assertIntegrity(zh, en)` 调用
  3. 失败时 `console.warn` 但不抛错（避免阻塞页面）
- **能验收**:
  - 启动时 console 输出 integrity 报告
  - 镜像时输出 `OK: 50+ namespaces, 2500+ keys`
- **有边界**:
  - **不做**: 生产环境抛错（仅 dev 模式 warn）
  - **不做**: 影响性能（一次性调用）

#### 步骤 3.5 | 验证 + 文档同步（~30min）

- **能执行**:
  1. 全量 lint / test / build 验证
  2. 更新 PROJECT_STATUS.md / TODO.md / WORKLOG.md / v19 计划文档
  3. 更新 M1 清单为 M4 完成状态
  4. 触发 PR 合并 review（**非自动 merge**，需用户确认）
- **能验收**:
  - Lint 0 / 全量 test / build OK
  - 17 页面硬编码全部 0 警告（规则升级后）
  - 6 份核心文档 + 计划文档全部同步
  - v19 计划 M4 段从"⏳ 待启动"→"✅ 已完成"

---

## 6. 文件迁移清单（完整覆盖）

### 6.1 新增文件（17 + 17 = 34 个 + 0 个聚合层新增）

#### zh locale 文件（17 个）

```
src/i18n/locales/zh/page/
├── home.ts          (M4-1, ~500 字符)
├── sortPage.ts      (M4-1, ~400 字符)
├── arrayPage.ts     (M4-1, ~350 字符)
├── graphPage.ts     (M4-1, ~300 字符)
├── stackPage.ts     (M4-2, ~200 字符)
├── queuePage.ts     (M4-2, ~200 字符)
├── linkedlistPage.ts    (M4-2, ~250 字符)
├── treePage.ts      (M4-2, ~250 字符)
├── avlTreePage.ts   (M4-2, ~200 字符)
├── bTreePage.ts     (M4-2, ~200 字符)
├── segmentTreePage.ts   (M4-2, ~150 字符)
├── redBlackTreePage.ts  (M4-2, ~150 字符)
├── hashPage.ts      (M4-2, ~200 字符)
├── heapPage.ts      (M4-2, ~200 字符)
├── triePage.ts      (M4-2, ~150 字符)
├── unionFindPage.ts (M4-2, ~150 字符)
└── skipListPage.ts  (M4-2, ~150 字符)
```

#### en locale 文件（17 个，结构镜像）

```
src/i18n/locales/en/page/  (与 zh 同名 17 文件)
```

**M4-3 备注**：GraphAlgorithmPage / SortComparePage 已在 M4-3 范围，**但 M1 调研归到 P2**；为简化命名统一为 `graphAlgorithmPage.ts` / `sortComparePage.ts`（在 M4-3 步骤 3.1 创建）。

### 6.2 修改文件

| 文件 | 修改内容 | 子阶段 |
|------|----------|--------|
| `src/i18n/locales/{zh,en}/page/index.ts` | 从 `export {}` 改为聚合 17 page 文件 | M4-1（4 项）/ M4-2（13 项）|
| `src/i18n/locales/index.ts` | 暴露完整 zh/en 顶层聚合 | M4-3 |
| `src/i18n/locales/locales.ts`（旧入口）| 改为 re-export 聚合层 | M4-3 |
| `src/i18n/useI18n.ts` | 启动时 `assertIntegrity(zh, en)` | M4-3 |
| `eslint.config.js` | 规则级别 warn → error | M4-3 |
| 17 个 `src/pages/*.tsx` | 硬编码中文 → `t('namespace.key')` | M4-1（4）/ M4-2（13）/ M4-3（3，含 GraphAlgorithm / SortCompare）|
| `src/__tests__/i18n/integrity.test.ts` | 新增 17 namespace 校验 | M4-1+2+3 |
| `src/__tests__/i18n/pageTranslations.test.ts`（新建）| 17 namespace 镜像 + key 抽样 | M4-1+2+3 |

### 6.3 文档同步

| 文档 | 触发条件 | 内容 |
|------|----------|------|
| `PROJECT_STATUS.md` | M4-1/2/3 每个子阶段 | §2 新增段；当前分支 / 测试数 / 进度更新 |
| `TODO.md` | M4-1/2/3 推进 | 顶部状态 + v19 段 |
| `WORKLOG.md` | M4-1/2/3 每个子阶段 | 追加 3 段日志 |
| `CLAUDE.md` / `AGENTS.md` | M4-3 完成后 | "当前活跃计划"表 |
| `docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md` | M4-3 完成后 | M4 段 ⏳ → ✅ |
| `docs/superpowers/i18n-inventory/02-m4-1-p0-strings.md` | M4-1 步骤 1.1 | M4-1 子清单 |
| `docs/superpowers/i18n-inventory/03-m4-2-p1-strings.md` | M4-2 步骤 2.1 | M4-2 子清单 |
| `docs/superpowers/i18n-inventory/04-m4-3-p2-strings.md` | M4-3 步骤 3.1 | M4-3 子清单 |

---

## 7. 测试更新矩阵

### 7.1 单元测试

| 测试文件 | M4-1 新增 | M4-2 新增 | M4-3 新增 | 累计 |
|----------|-----------|-----------|-----------|------|
| `src/__tests__/i18n/pageTranslations.test.ts`（新建）| 4 ns × 2-3 项 = 8-12 | 13 ns × 2-3 项 = 26-39 | 3 ns × 2-3 项 = 6-9 | **40-60** |
| `src/__tests__/i18n/integrity.test.ts` | 4 ns × 1 项 = 4 | 13 ns × 1 项 = 13 | 3 ns × 1 项 = 3 | **20** |
| `src/__tests__/i18n/pseudoLocale.test.ts` | 0 | 0 | 0 | 0（E2E 阶段使用）|
| `src/__tests__/eslint/no-hardcoded-chinese-in-jsx.test.ts` | 0 | 0 | 1（升级为 error 后的回归）| 1 |
| 各页面单元测试（如果存在）| ~5-10 | ~15-25 | ~5-10 | ~25-45 |
| **小计** | **~17-26** | **~54-77** | **~15-23** | **~86-126** |

**M4 完成后**: i18n+eslint 子目录测试 95 → **~180-220**；全量 2745 → **~2830-2870**

### 7.2 AI-TDD 流程（每个子阶段强制）

1. **RED**: 先写 `pageTranslations.test.ts` 中的 namespace 镜像测试 → 跑测试预期失败
2. **GREEN**: 实现 zh/en 文件 → 修复测试直到全绿
3. **REFACTOR**: 调整 locale 文件结构（如提取 `common.*`）→ 保持测试全绿
4. **VERIFY**: 全量 lint / test / build + 浏览器手动 smoke test

### 7.3 烟雾测试（每个子阶段验收）

- **zh 模式**: 打开 4/13/3 页面，UI 文本与原版完全一致
- **en 模式**: 切换语言，UI 显示 zh 占位文本（与原版相同；M8 后才显示英文）
- **缺字检测**: `pseudoLocalize` 加载 → 任何未翻译的字符串会暴露为 `【èn】xxx【/èn】`

### 7.4 E2E 测试（**不在 M4 范围，M9 范围**）

- 7 spec 文件 + a11y 全部跑 zh/en 双语路径
- M4 仅保证 E2E 不被破坏（`npm run test:e2e:run` 全绿）

---

## 8. 回滚预案

### 8.1 per-substage 单独回滚

| 子阶段 | commit hash（预期） | revert 命令 |
|--------|---------------------|-------------|
| M4-1 | `bXXXXX1` | `git revert bXXXXX1` |
| M4-2 | `bXXXXX2` | `git revert bXXXXX2` |
| M4-3 | `bXXXXX3` | `git revert bXXXXX3` |

**关键点**: 每个子阶段独立 commit，独立 PR 候选，可单独 revert 而不影响其他子阶段。

### 8.2 整体回退（如 M4 整体失败）

```bash
# 方案 1: 整批 revert（保留后续 M5+ 空间）
git revert --no-commit HEAD~3..HEAD  # 撤销最近 3 个 M4 commit
git commit -m "revert: 整体回退 v19 M4 页面级迁移"

# 方案 2: reset 到 M3 完成点（更激进）
git reset --hard a196116  # M3 完成点
```

**关键约束**（按 7.2 工程化硬核守护 §7.2）:
- 同一 Bug 连续 3 次修复失败 → 立即回滚到上一个干净 commit（M3 完成点 `a196116`），不继续修补
- 切回主分支前：`git checkout main && git branch -D feature/v19-m4-pages-migration`

### 8.3 关键边界回退

| 场景 | 触发条件 | 回退动作 |
|------|----------|----------|
| **`no-hardcoded-chinese-in-jsx` 误报** | 升级为 error 后某页面被误判 | 临时在该文件加 `/* eslint-disable-next-line local/no-hardcoded-chinese-in-jsx */` 注释 |
| **AssertSameKeys 编译错误** | zh/en 镜像失败 | 检查 `locales/{zh,en}/page/*.ts` 键集合（`npm run lint` 通常附带错误位置）|
| **页面单元测试失败** | 旧测试断言硬编码中文，新代码用 `t()` | 在测试中 import `useI18n` 替换断言；或回退到该页面的旧代码（**仅单页回退**）|
| **`locales.ts` 旧入口破坏** | M4-3 改为 re-export 后某旧代码 `import { zh } from '@/i18n/locales'` 报错 | 临时在 `locales.ts` 添加 `export { zh, en } from './locales'`；不删除旧入口 |
| **useI18n 性能下降** | 启动时 `assertIntegrity` 拖慢首屏 | 在生产环境用 `if (import.meta.env.DEV)` 包裹 `assertIntegrity` 调用 |
| **规则升级导致 PR review noise** | M4-3 升级为 error 后大量历史硬编码 | 回退到 warn 级；M5+ 迁移完成后再升级 |

### 8.4 回滚检查清单（每次回退后必跑）

- [ ] `npm run lint` → 0 errors
- [ ] `npx vitest run` → 全绿
- [ ] `npm run build` → 成功
- [ ] 浏览器手动 smoke test：4/13/3 页面正常
- [ ] 6 份核心文档 + 计划文档同步回退状态
- [ ] 在 WORKLOG.md 追加回退原因

---

## 9. 风险与异常处理

### 9.1 已知风险

| 风险 | 等级 | 缓解 |
|------|------|------|
| **字符串遗漏** | 🟠 中 | 步骤 1.1/2.1/3.1 严格扫描 + 步骤 1.5/2.5/3.1 浏览器手动 smoke test |
| **命名空间冲突**（如 `arrayPage` vs 旧 `array`） | 🟡 中 | 严格按 D5 命名规范 `arrayPage`（带 Page 后缀），与旧 `array` 不冲突 |
| **`locales.ts` 旧 key 不变但新代码用新 key** | 🟡 中 | M4 仅做**新增**迁移，旧 key（如 `array.title`）保留；M5+ 阶段再统一重构 |
| **页面 props 传递翻译**（父组件传硬编码到子组件） | 🟡 中 | 扫描时同时检查组件 props；M4 仅迁移页面级硬编码，组件级留给 M5 |
| **D3 SVG 内 `text` 元素硬编码** | 🟢 低 | 同步识别（如 "插入元素" 文字标签），作为 JSX 文本处理 |
| **`useI18n` Hook 嵌套深度** | 🟢 低 | useI18n 在 Layout 已提供；page 内 `const { t } = useI18n()` 即可 |

### 9.2 异常处理

| 异常 | 触发条件 | 处理 |
|------|----------|------|
| **字符串数量偏差 > 20%** | M4-1 步骤 1.1 扫描结果与 M1 估计差异大 | 立即向用户报告，调整 M4-2/3 估时 |
| **ESLint 规则大量误报** | M4-3 升级为 error 后某页面被误判 | 临时回退到 warn；定位误报后修规则或加 allowList |
| **测试大规模失败** | M4 任一子阶段红 > 50% 测试 | 暂停 M4，回退该子阶段 commit；按 7.2 防灾策略 |
| **TypeScript 编译失败** | zh/en 键不镜像或其他类型错误 | 暂停 M4，先修复类型问题；参考 §8.3 关键边界回退 |
| **性能显著下降** | M4-3 启动时 assertIntegrity 拖慢首屏 > 200ms | 用 `import.meta.env.DEV` 包裹，仅 dev 模式校验 |

---

## 10. 启动条件 + 验收标准

### 10.1 M4-1 启动条件

- [x] M0-M3 已 commit（`a196116`）
- [x] v19 计划文档已发布
- [x] 实施真源文档已生成（本文件）
- [x] **Q1-Q4 决策点已由用户拍板**（4 项全 A，2026-06-22 深夜）
- [ ] feature 分支已创建：`git checkout -b feature/v19-m4-pages-migration`（**待 M4-1 启动指令**）

### 10.2 M4 整体验收

#### 子阶段验收
- M4-1 验收：4 页面 zh/en 镜像 / Lint 0 / Test 全绿 / Build OK / 文档同步 / 1 commit + push
- M4-2 验收：13 页面同上 / 总测试 +54-77
- M4-3 验收：3 页面 + 聚合层 + 规则升级 / 总测试 +86-126 / 6 份文档 + 计划文档同步

#### 整体验收（v19 §九 9.2）
- ✅ 用户切换 zh/en，所有 17 页面正常显示
- ✅ ESLint 0 errors（规则升级后无新增硬编码）
- ✅ 2699 基线 + ~86-126 新测试 = **~2785-2825 测试全绿**
- ✅ i18n 完整性测试 95 → ~180-220
- ✅ Bundle 大小符合 budget
- ✅ 文档同步：6 份核心 + v19 计划 + 5 份 i18n 清单
- ✅ 1 个 PR 待用户 review（M4-3 完成后触发，**不自动 merge**）

### 10.3 后续阶段大方向（M5+）

> **避坑**（按 v19 计划 §六.1 末尾）：不要一次性把后续阶段拆得过细。

| 阶段 | 范围 | 估时 | 备注 |
|------|------|------|------|
| M5 | 16+ 组件级迁移 | 3d | 流程同 M4，组件独立性强 |
| M6 | 5 utils 迁移 | 1d | 需谨慎处理 hooks 内部状态（如 `useDataStructureState`）|
| M7 | 40 learning config 迁移 | 7d | 量最大；可分 4 batch（数据结构 17 + 算法 10 + 图算法 4 + sortCompare 1）|
| M8 | 翻译工作（en 值实际翻译）| 5d | AI + 人工校对（D3=B）|
| M9 | E2E + a11y 双语 | 2d | 7 E2E spec + axe-core |
| M10 | v19.0.0 GA | - | merge main + GitHub Pages 部署 |

---

## 11. 与 v19 主计划的对应关系

| v19 计划章节 | 本文档对应章节 | 状态 |
|--------------|----------------|------|
| §四 命名规范（D5=C）| §6 文件命名 + D5 约束 | 一致 |
| §五.1 类型系统 | §3.2 / §4.2 / §5.2 步骤 1.4 | 一致（用 AssertSameKeys）|
| §五.2 运行时保障 | §5.2 步骤 3.4（assertIntegrity 启动调用）| 一致 |
| §五.3 伪语言测试 | §7.3 烟雾测试（D3 衍生）| 一致 |
| §五.4 向后兼容 | §6.2 + §8.3（locales.ts 旧入口保留）| 一致 |
| §六 翻译工作流 | §7.2 AI-TDD + §10 M8 留待 | 一致 |
| §七 渐进发布 | §3-§5 三子阶段拆分 + §8 回滚 | 一致 |
| §八 阶段计划 M4 | §2 + §3-§5 全部 | 一致 |
| §九 验收标准 M4 | §10 | 一致 |
| §十 风险与回滚 | §8 + §9 | 一致 |

---

## 12. 元数据

- **创建者**: Senior Software Engineer (AI)
- **创建时间**: 2026-06-22（深夜）
- **审核状态**: ⏳ 待用户审阅 + 拍板 Q1-Q4
- **基线 commit**: `a196116`（M3 完成点）
- **下一 commit 预期**: `feature/v19-m4-pages-migration` 分支首 commit
- **关联文档**:
  - v19 主计划: `docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md`
  - M1 调研清单: `docs/superpowers/i18n-inventory/01-hardcoded-strings-inventory.md`
  - M2 基础设施: `src/i18n/locales/{index,integrity,pseudoLocale,types}.ts`
  - M3 强约束: `eslint-rules/no-hardcoded-chinese-in-jsx.js` + `eslint.config.js`

---

**本文件是 v19 M4 阶段的实施真源文档（Single Source of Truth）。** 任何 M4 实施细节的变更必须先回写本文件，再动手改代码。未经用户拍板 Q1-Q4，禁止启动 M4-1。
