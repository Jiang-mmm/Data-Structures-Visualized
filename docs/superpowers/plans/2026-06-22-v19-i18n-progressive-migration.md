# v19 i18n 渐进迁移（i18n Progressive Migration）

> **目标**: 在不破坏现有 50+ 命名空间的前提下，将 `src/i18n/locales.ts`（单文件 6310 行）拆分为 `locales/{zh,en}/` 目录结构（**D2=C**），并按"模块级渐进"方式将所有 UI 硬编码中文字符串纳入 i18n 系统（**D1=B**）。
> **状态**: 🟢 M0 + M1 + M2 + M3 已完成（2026-06-22）；M4+ 待启动
> **M3 范围**：types.ts 追加 `AssertSameKeys` 深度递归类型断言（任意嵌套深度的 zh/en 镜像检查）+ 自定义 ESLint 规则 `no-hardcoded-chinese-in-jsx`（minLength/allowList 配置，作用于 `src/{pages,components,visualizers,layouts}/**` warn 级）+ 45 项测试（types 20 + eslint 21 + 与 M2 合并 95 项）。
> **基线**: v17.0.0 GA（merge `b991566`）+ v18 封存清理（merge `37478cf`，main HEAD）
> **关联**: 继承 v18 i18n 封存决策（D1=B / D2=C / D3=B / D4=B / D5=C）

---

## 〇、现状盘点（2026-06-22 实测）

### 0.1 现有 i18n 体系

| 维度 | 现状 |
|------|------|
| **实现位置** | `src/i18n/locales.ts`（6310 行，单文件）+ `src/i18n/useI18n.ts` |
| **语言** | zh（默认）+ en（无浏览器语言自动检测） |
| **持久化** | localStorage `ds-visualizer-lang` |
| **键查找** | `t('namespace.key.subKey')` 字符串路径 |
| **命名空间** | 50+：`common` / `array` / `stack` / `queue` / `linkedlist` / `tree` / `avlTree` / `bTree` / `segmentTree` / `redBlackTree` / `hash` / `heap` / `trie` / `graph` / `sortPage` / `graphAlgorithm` / `sortCompare` / `infoPanel` / `logPanel` / `complexity` / `algorithms` / `quiz` / `globalSearch` / `pwa` / `performance` / `exportAnimation` / `shortcuts` / `home` / `theme` / `keyboard` 等 |
| **测试** | `i18n-integrity.test.ts` 8 项（zh/en 键非空校验） |

### 0.2 硬编码中文分布（Grep `[\x{4e00}-\x{9fff}]` 实测）

| 类别 | 文件数 | 字符数 | UI 可见？ | v19 范围？ |
|------|--------|--------|-----------|-----------|
| **i18n 自身** | 1 | 6,310 | ✓（zh 正文） | — 保持 |
| **Learning config 教学文案** | 40 | ~10,000 | ✓ | ✅ M7 |
| **Visualizers（错误/状态消息）** | 10 | ~3,500 | ✓ | ✅ M4-M5 |
| **Pages（按钮/标题/提示）** | 17 | ~2,500 | ✓ | ✅ M4 |
| **Components（Toast/Log 等）** | 16+ | ~1,500 | ✓ | ✅ M5 |
| **Utils（validate 错误）** | 5 | ~500 | ✓ | ✅ M6 |
| **Hooks（日志/调试）** | 32 | ~1,000 | ✗（开发者向）| ❌ 保留 |
| **Tests（断言串）** | 50+ | ~8,000 | ✗ | ❌ 保留 |

**总硬编码中文字符数**：~28,271（100 文件）

---

## 一、M0 决策（5 项已拍板）

| 决策 | 方案 | 关键约束 |
|------|------|----------|
| **D1 范围** | B（UI + learning config） | 含 pages / components / utils / visualizers 错误 / learning config；不含 hooks 日志 / tests |
| **D2 文件结构** | C（`locales/{zh,en}/` 按语言拆分） | 拆为 `src/i18n/locales/{zh,en}/` 目录，**保持向后兼容** `src/i18n/locales.ts` 入口 |
| **D3 翻译工作流** | B（AI 辅助 + 人工校对） | AI 初译 → 人工核对关键术语 → 写入 en 文件 |
| **D4 渐进发布** | B（立即生效 + 测试保底） | 每个 namespace 迁移完成即生效；依赖 2699 单元测试 + 7 E2E 兜底 |
| **D5 命名规范** | C（namespace + flat keys） | 例：`t('arrayPage.title.insertButton')`，`arrayPage` 为 namespace，`.title.insertButton` 为 flat key |
| **D6 工具类翻译** | B（仅 UI 翻译，错误保留 zh） | validate 错误/动画状态消息保留中文；按钮/标签/页面标题全部翻译 |
| **D7 学习配置范围** | B（高频 10 个，~5000 字符 / ~3d） | 仅翻译数组/栈/队列/链表/树/AVL/哈希/堆/图/BFS；其余 21 个保留 zh |
| **D8 翻译协作** | A（AI + 单次校对） | AI 初译所有字符串 → 用户对 50+ namespace 逐个校对一次 |

---

## 二、目标定义

### 2.1 业务目标
- 用户可在 UI 切换 zh/en，所有页面即时反映
- 字符串改动走 git diff 而非全文替换（**D2=C 核心收益**）
- 新增字符串强制走 i18n，避免新增硬编码

### 2.2 工程目标
- i18n 模块按语言拆分（zh/en 目录结构）
- TypeScript 强约束：编译时确保 zh/en 键镜像
- 自动化测试：i18n 完整性测试从 8 → 50+ 项
- 增量迁移：每模块可独立 PR 验收

### 2.3 不做范围（OUT-OF-SCOPE）
- ❌ 引入 i18next / react-intl 等第三方库（**保持自研轻量**）
- ❌ 浏览器语言自动检测
- ❌ 阿拉伯语 / 日语 / 西班牙语等多语种扩展（保持 zh + en）
- ❌ hooks 内部日志翻译（开发者向，无需国际化）
- ❌ tests 断言串翻译
- ❌ SSR / RTL 切换

---

## 三、文件结构（D2=C）

```
src/i18n/
├── index.ts                  # 统一导出（保持向后兼容）
├── useI18n.ts                # 现有 hook（保持）
├── locales.ts                # 兼容入口（聚合 zh/en 目录，新代码不应直接引用）
└── locales/                  # 🆕 新增按语言拆分子目录
    ├── types.ts              # Locale / Translations / Namespace 联合类型
    ├── integrity.ts          # zh/en 镜像校验工具 + 启动时断言
    ├── pseudoLocale.ts       # 伪语言测试工具（en → 【èn】等）
    ├── en/                   # 英文翻译目录
    │   ├── index.ts          # 聚合所有 en 命名空间
    │   ├── common.ts         # 通用术语
    │   ├── core/             # 跨模块共用（错误/按钮/状态）
    │   │   ├── error.ts
    │   │   ├── button.ts
    │   │   └── status.ts
    │   ├── page/             # 页面级
    │   │   ├── home.ts
    │   │   ├── arrayPage.ts
    │   │   ├── sortPage.ts
    │   │   └── ...
    │   ├── component/        # 组件级
    │   │   ├── toast.ts
    │   │   ├── logPanel.ts
    │   │   └── ...
    │   ├── algorithm/        # 算法相关
    │   │   ├── complexity.ts
    │   │   └── algorithms.ts
    │   └── learning/         # 学习配置
    │       ├── arrayLearning.ts
    │       └── ...
    └── zh/                   # 中文翻译目录（与 en 镜像）
        ├── index.ts
        ├── common.ts
        ├── core/...
        ├── page/...
        ├── component/...
        ├── algorithm/...
        └── learning/...
```

**关键约束**：
- `locales.ts`（旧）改为聚合层，**不删除**保持向后兼容
- 新增命名空间必须放 `locales/{zh,en}/`，旧位置不再接受新键
- `useI18n()` hook 签名不变

---

## 四、命名规范（D5=C）

### 4.1 Key 形式
- `namespace.flatKey.subKey.subKey`
- 全部小写字母 + camelCase
- 例：
  - ✅ `t('arrayPage.title.insertButton')`
  - ✅ `t('common.error.empty')`
  - ✅ `t('quiz.option.correct')`
  - ❌ `t('ArrayPage.Title.InsertButton')`（驼峰 namespace）
  - ❌ `t('arrayPage.title.insert_button')`（snake_case key）

### 4.2 Namespace 划分
| Namespace 前缀 | 范围 | 文件 |
|----------------|------|------|
| `common.*` | 跨模块通用 | `locales/{zh,en}/common.ts` |
| `core.error.*` | 错误消息 | `locales/{zh,en}/core/error.ts` |
| `core.button.*` | 按钮文本 | `locales/{zh,en}/core/button.ts` |
| `core.status.*` | 状态消息 | `locales/{zh,en}/core/status.ts` |
| `home.*` | 首页 | `locales/{zh,en}/page/home.ts` |
| `arrayPage.*` | 数组页 | `locales/{zh,en}/page/arrayPage.ts` |
| `*Page.*` | 其他 16 页 | `locales/{zh,en}/page/*.ts` |
| `toast.*` | Toast 组件 | `locales/{zh,en}/component/toast.ts` |
| `logPanel.*` | LogPanel 组件 | `locales/{zh,en}/component/logPanel.ts` |
| `*Component.*` | 其他组件 | `locales/{zh,en}/component/*.ts` |
| `complexity.*` | 复杂度术语 | `locales/{zh,en}/algorithm/complexity.ts` |
| `algorithms.*` | 算法名称 | `locales/{zh,en}/algorithm/algorithms.ts` |
| `*Learning.*` | 学习配置 | `locales/{zh,en}/learning/*.ts` |

### 4.3 增量插入规则
- 新键必须选合适 namespace，**禁止**塞入 `common.*`（避免膨胀）
- 跨页面的术语统一从 `core.*` 引用

---

## 五、技术实现方案

### 5.1 类型系统
- `locales/types.ts` 定义：
  - `type Locale = 'zh' | 'en'`
  - `type Translations = Record<string, Record<string, string>>`（namespace → keys）
  - `type AssertSameKeys<Zh, En>`：编译时断言 zh/en 键一致
- TypeScript 编译时检查 zh/en 镜像

### 5.2 运行时保障
- `locales/integrity.ts`：
  - `assertIntegrity(zh, en)`：启动时检查 zh/en 键一致
  - 缺失键使用回退（zh → key 自身）
- 单元测试扩展至 50+ 项

### 5.3 伪语言测试（D3 衍生）
- `locales/pseudoLocale.ts`：
  - `pseudoLocalize(s)`：英文 `"Insert"` → `"【èn】Insert【/èn】"`
  - 用于 E2E 测试：未翻译的字符串会暴露在 UI 上
  - 不在生产环境启用

### 5.4 向后兼容
- `locales.ts` 改为聚合层：
  ```ts
  export { zh } from './locales/zh';
  export { en } from './locales/en';
  ```
- 旧代码 `import { zh } from '@/i18n/locales'` 继续工作
- 50+ 命名空间**保留**，只是物理位置变更

---

## 六、翻译工作流（D3=B）

### 6.1 三阶段流程
1. **AI 初译**：使用 Claude / GPT 翻译 zh → en
   - 输入：`locales/zh/` 变更文件
   - 输出：`locales/en/` 对应文件
2. **人工校对**：开发者检查关键术语（算法名 / 数据结构名 / 教学术语）
   - 重点：保持术语一致（"栈" → "Stack" 而非 "Stack" 多种写法）
3. **自动化校验**：跑 `i18n-integrity.test.ts` + 单元测试

### 6.2 术语表
- `locales/en/glossary.ts`：常用术语统一翻译
  - 数组 / Array
  - 栈 / Stack
  - 队列 / Queue
  - 链表 / Linked List
  - 树 / Tree
  - 二叉搜索树 / Binary Search Tree
  - 平衡二叉树 / AVL Tree
  - B 树 / B-Tree
  - 堆 / Heap
  - 哈希表 / Hash Table
  - 图 / Graph
  - 插入 / Insert
  - 删除 / Delete
  - 查找 / Search
  - 遍历 / Traverse
  - ...

---

## 七、渐进发布策略（D4=B）

### 7.1 立即生效机制
- 每个 namespace 迁移完成即在 UI 生效
- 切换语言时立即重新渲染（已支持）

### 7.2 测试保底
- **2699 单元测试**：每模块迁移前跑快照对比
- **7 E2E spec**：跑 zh/en 双语路径
- **i18n 完整性测试**：50+ 项
- **a11y**：双语切换后重新跑 axe-core

### 7.3 回滚机制
- 迁移 commit 独立成 PR，可逐个 revert
- 如发现严重翻译错误，单独 revert 单个 namespace

---

## 八、阶段计划（M0-M10）

| 阶段 | 任务 | 估时 | 依赖 | 状态 |
|------|------|------|------|------|
| **M0** | 5 项决策拍板 | - | - | ✅ 已完成 |
| **M1** | 硬编码中文清单 + 5 份管理清单 | 0.5d | M0 | ✅ 已完成 2026-06-22 |
| **M2** | i18n 基础设施（`locales/{zh,en}/` 目录 + integrity.ts + 测试 8→50+） | 2d | M1 | ✅ 已完成 2026-06-22 |
| **M3** | TypeScript 强约束（types.ts + AssertSameKeys 编译检查 + ESLint 规则） | 1.5d | M2 | ✅ 已完成 2026-06-22 |
| **M4** | 页面级渐进迁移（17 pages，~2500 字符串） | 5d | M3 | ⏳ |
| **M5** | 组件级渐进迁移（16+ components，~1500 字符串） | 3d | M3 | ⏳ |
| **M6** | 工具类迁移（5 utils，~500 字符串） | 1d | M3 | ⏳ |
| **M7** | 学习配置迁移（40 configs，~10000 字符串） | 7d | M3 | ⏳ |
| **M8** | 翻译工作（AI 辅助 + 人工校对） | 5d | M4-M7 | ⏳ |
| **M9** | E2E + 文档同步 + 验收 | 2d | M8 | ⏳ |
| **M10** | v19.0.0 GA | - | M9 | ⏳ |

**总估时**：~27d（v18 计划 ~30d，v19 优化后略短）

---

## 九、验收标准

### 9.1 阶段验收
- M1 验收：5 份清单文件 + PROJECT_STATUS.md / TODO.md / WORKLOG.md 同步
- M2 验收：`locales/{zh,en}/` 目录 + integrity.ts + 测试 8→50+ 全绿
- M3 验收：types.ts + AssertSameKeys + ESLint 规则
- M4-M7 验收：每模块迁移后跑 2699 单元测试 + ESLint
- M8 验收：en 翻译覆盖率 ≥ 95%
- M9 验收：7 E2E spec + axe-core a11y 全绿
- M10 验收：v19.0.0 GA merge main + 触发 GitHub Pages 部署

### 9.2 整体验收
- ✅ 用户切换 zh/en，所有 17 页面正常显示
- ✅ ESLint 0 errors，2699 单元测试全绿
- ✅ i18n 完整性测试 50+ 项全绿
- ✅ E2E 7 spec + a11y 全绿
- ✅ Bundle 大小符合 budget
- ✅ 文档同步：5 份核心文档 + 实施真源 + i18n 清单

---

## 十、风险与异常处理

### 10.1 已知风险
| 风险 | 等级 | 缓解 |
|------|------|------|
| zh/en 键不同步 | 🟡 中 | integrity.ts 启动断言 + 编译时 AssertSameKeys |
| 翻译术语不一致 | 🟡 中 | glossary.ts + 人工校对 |
| 大量 PR 难管理 | 🟡 中 | 按 module 拆分，单 PR ≤ 500 行 |
| 切换语言 UI 闪烁 | 🟢 低 | 已 useState 控制，切换不重 mount |
| 学习配置量大 | 🟡 中 | 分批迁移（M7 拆 4 个子阶段） |
| 命名空间归类争议 | 🟡 中 | M1 调研时定稿 namespace 划分 |

### 10.2 异常处理
- 翻译严重错误：revert 单个 PR，不影响主分支
- 测试大规模失败：暂停 M8，回退 M4-M7 改动
- TypeScript 编译失败：暂停 M4，先修复 M3 类型

### 10.3 回滚
- `git revert <commit>` 单独回滚
- 不需要回滚整个 v19（按模块独立 PR）

---

## 十一、关键决策依据

- **不引入 i18next**：现有自研实现已够用，引入第三方会破坏"零依赖"原则
- **不强制 100% 翻译**：AI + 人工校对可达 95% 覆盖，剩余 5% 保留 zh 回退
- **渐进迁移 vs 一次性**：v18 教训，渐进更安全（每模块可独立验收）
- **按语言拆 vs 按模块拆**：D2=C 按语言拆符合 Git diff 友好 + 翻译协作友好
- **namespace + flat**：避免 JSON 嵌套的类型推导问题，IDE 跳转友好

---

## 十二、关联文档

- **v18 计划**（已封存）：commit `774025a:docs/superpowers/plans/2026-06-22-v18-i18n-full-replacement.md`（646 行历史快照）
- **M1 硬编码清单**：`docs/superpowers/i18n-inventory/01-hardcoded-strings-inventory.md`
- **CLAUDE.md** / **AGENTS.md** / **PROJECT_STATUS.md** / **TODO.md** / **WORKLOG.md**（项目状态同步）

---

**当前进度**：M0 已完成，M1 调研启动中（v19 分支 `feature/v19-i18n-progressive-migration`，M1 产出 = 本文档 + 第一份硬编码清单）。
