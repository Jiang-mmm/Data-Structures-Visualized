# DESIGN.md — 数据结构学习助手 · 设计真源

> **版本**: v1.0.0（2026-06-22 v16 设计统一化首版）
> **状态**: 🟢 生效中（与 [v16 设计统一化计划](./docs/superpowers/plans/2026-06-22-design-unification-v16.md) 配套）
> **优先级**: 等同 [Agent 宪法 §16.2](./.trae/rules/project_rules.md)，所有视觉/交互决策必须以本文件为唯一真源。
> **设计参考**: [Linear](./design-md/linear.app/DESIGN.md)（主） · [Vercel](./design-md/vercel/DESIGN.md)（辅） · [Raycast](./design-md/raycast/DESIGN.md)（命令面板）

---

## 一、设计哲学

### 1.1 一句话定位

> **"工程师向的精致粗野主义教学工具"** — 保留 Neo-Brutalism 记忆点，向 Linear / Vercel 的现代开发者美学收敛。

### 1.2 五大原则（按优先级）

| # | 原则 | 说明 |
|---|------|------|
| 1 | **保留 Neo-Brutalism 记忆点** | 硬阴影 + 2px 粗边框作为差异化元素保留，但标准化为 2 级（`--shadow-hard-sm` / `--shadow-hard-md`） |
| 2 | **深色优先** | 深色模式作为默认主推；可视化在深色下高亮节点、边流动更明显 |
| 3 | **可读性 > 美观** | 教学工具首要价值是降低学习认知负荷；层级、对比度、留白优先于装饰 |
| 4 | **最小修改** | 不推翻现有 token / 组件架构，仅在必要时增量扩展 |
| 5 | **可执行 > 完美** | 每个原子改动必须有明确验收标准与回归测试 |

### 1.3 反对清单（Don'ts）

- ❌ 不引入新字体（保留 Noto Sans SC + JetBrains Mono，性能/许可）
- ❌ 不引入新主题（仅在现有 4 套主题中 token 化）
- ❌ 不引入新品牌色板（仅 4 个分类色：linear 蓝 / tree 橙 / graph 紫 / hash 中性）
- ❌ 不使用大段重写无关文件
- ❌ 不在深色模式下使用 `#000` 真黑（参照 Linear canvas `#010102` + Raycast canvas `#07080a`）
- ❌ 不在卡片上叠加多层 drop-shadow（参照 Vercel stacked-shadow + Linear hairline-ladder 实践）

---

## 二、色彩系统

### 2.1 双主题（深色优先）

| 角色 | 浅色（Light） | 深色（Dark） | Linear 参考 | 用途 |
|------|---------------|--------------|-------------|------|
| **canvas** | `--color-paper` `#faf8f5`（暖米） | `--color-dark-paper` `#0f172a`（深靛） | Linear `#010102` 近黑但保留蓝调 | 页面底色 |
| **surface-1** | `--color-surface` `#ffffff` | `--color-dark-surface` `#1e293b` | Linear `surface-1` `#0f1011` | 卡片 |
| **surface-2** | `--color-surface-strong` `#f5f3ef` | `--color-dark-surface-strong` `#334155` | Linear `surface-2` `#141516` | 高亮卡片 / hover 态 |
| **ink**（文本主） | `--color-ink` `#1a1a2e` | `--color-dark-ink` `#e2e8f0` | Linear ink `#f7f8f8` | 标题 / 正文 |
| **ink-light**（次） | `--color-ink-light` `#4a4a6a` | `--color-dark-ink-light` `#b4c0d4` | Linear ink-muted `#d0d6e0` | 副文本 |
| **muted-foreground** | `--color-muted-foreground` `#6b6b80` | `--color-dark-muted-foreground` `#94a3b8` | Linear ink-subtle `#8a8f98` | 提示 / 标签 |
| **border** | `--color-border` `#e5e0d8` | `--color-dark-border` `#334155` | Linear hairline `#23252a` | 1px 边框 |
| **border-strong** | `--color-border-strong` `#d4d2cc` | `--color-dark-border-strong` `#475569` | Linear hairline-strong `#34343a` | 强调边框 / focus 环 |
| **accent** | `--color-accent` `#2563eb` | `--color-dark-accent` `#60a5fa` | Linear primary `#5e6ad2` | 主行动 / 链接 / focus |

### 2.2 4 个分类色（数据结构用）

| 分类 | Token | 浅色值 | 深色值 | 用途 |
|------|-------|--------|--------|------|
| 线性（Array / Stack / Queue / LinkedList） | `--color-card-group-linear` | `#3b82f6` | `#60a5fa` | 卡片左侧色条、分类徽章 |
| 树（Tree / BST / AVL / Heap / Trie / B-Tree / Segment / SkipList / RedBlack） | `--color-card-group-tree` | `#d97706` | `#fbbf24` | 同上 |
| 图（Graph / GraphAlgorithm） | `--color-card-group-graph` | `#7c3aed` | `#a78bfa` | 同上 |
| 哈希 / 其他（Hash / UnionFind） | `--color-accent-cyan` | `#0891b2` | `#22d3ee` | 同上 |

### 2.3 7 个辅助强调色（D3 可视化用，不入 chrome）

`--color-accent-teal / rose / amber / violet / emerald / cyan / pink` — **仅**在 D3 节点/边/标签使用，不在按钮/文本/边框使用。详见 §6。

---

## 三、字体系统

### 3.1 字体族

| 角色 | 字体 | 备选栈 |
|------|------|--------|
| **Display / Body** | `Noto Sans SC` | `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif` |
| **Mono / Code** | `JetBrains Mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, monospace` |

> ⚠️ **不引入新字体**：参照 Vercel/Linear 的 "Geist 替代为 Inter" 思路，保留 Noto Sans SC（已授权、跨平台、中文支持佳）。

### 3.2 Type Scale（13 级）

| Token | Size | Weight | Line-Height | Letter-Spacing | 用途 |
|-------|------|--------|-------------|----------------|------|
| `display-2xl` | 64px | 700 | 1.05 | -0.04em | Hero 标题（Home / 教学页） |
| `display-xl` | 48px | 700 | 1.10 | -0.03em | 大区块标题 |
| `display-lg` | 36px | 700 | 1.15 | -0.02em | 子区标题 |
| `display-md` | 30px | 600 | 1.20 | -0.01em | 页面 H1 |
| `display-sm` | 24px | 600 | 1.25 | -0.01em | 页面 H2 |
| `heading-lg` | 20px | 600 | 1.30 | 0 | 卡片标题 |
| `heading-md` | 18px | 600 | 1.35 | 0 | 小节标题 |
| `heading-sm` | 16px | 600 | 1.40 | 0 | 表头 / 强调 |
| `body-lg` | 16px | 400 | 1.60 | 0 | 默认正文 |
| `body-md` | 14px | 400 | 1.60 | 0 | 紧凑正文 |
| `body-sm` | 13px | 400 | 1.50 | 0 | 辅助文本 |
| `caption` | 12px | 500 | 1.40 | 0.02em | 标签 / 徽章 |
| `eyebrow` | 12px | 600 | 1.30 | 0.06em | 分类标签（uppercase 或首字大写） |

> 与 Vercel / Linear 的"display 600 为天花板"原则**略有不同**：本项目允许 700 用于 hero（保留品牌记忆点），但页面 H1/H2 收敛到 600。

### 3.3 Mono 字体特性

```css
code, .font-mono {
  font-family: var(--font-mono);
  font-feature-settings: "calt", "kern", "liga";
  font-variant-ligatures: contextual;
}
```

参照 Raycast 的 `font-feature-settings: "calt", "kern", "liga", "ss03"` 思路，但因为使用 JetBrains Mono，ss03 不适用。保留 calt / kern / liga 三项。

---

## 四、间距 / 边框 / 阴影

### 4.1 间距阶梯（4px base unit）

| Token | 值 | 用途 |
|-------|-----|------|
| `space-0` | 0 | — |
| `space-1` | 4px | 极小内边距 / 图标与文本 |
| `space-2` | 8px | 紧凑堆叠 |
| `space-3` | 12px | 列表项 |
| `space-4` | 16px | 默认内边距 / 段落间距 |
| `space-6` | 24px | 卡片内边距（小型） |
| `space-8` | 32px | 卡片内边距（标准） |
| `space-12` | 48px | 区段间距 |
| `space-16` | 64px | 大区段间距 |
| `space-24` | 96px | 页面级间距（hero 上下） |

### 4.2 圆角阶梯（与 Linear / Vercel / Raycast 收敛到 6 档）

| Token | 值 | 用途 |
|-------|-----|------|
| `radius-none` | 0px | 全屏 hero / 段带 |
| `radius-sm` | 2px | 现状保留（neobrutal 标签） |
| `radius-md` | 4px | 现状保留（按钮） |
| `radius-lg` | 8px | 卡片 / 输入框（**新增**标准） |
| `radius-xl` | 12px | 大卡片（**新增**） |
| `radius-2xl` | 16px | hero / modal（**新增**） |
| `radius-full` | 9999px | 胶囊徽章 / 头像 |

> ⚠️ **保留 `radius-sm` / `radius-md`**：现状 Neobrutal 已用 2-4px 圆角，与粗边框匹配。**新增 `radius-lg/xl/2xl`** 用于命令面板 / modal / 段间卡片（与 Linear/Vercel 收敛）。

### 4.3 阴影（**仅 2 级硬阴影**，与 Vercel "stacked shadow" 收敛）

| Token | 值 | 用途 |
|-------|-----|------|
| `shadow-hard-sm` | `2px 2px 0px var(--shadow-color)` | 按钮 / 标签 |
| `shadow-hard-sm-hover` | `3px 3px 0px var(--shadow-color)` | 按钮 hover |
| `shadow-hard-md` | `3px 3px 0px var(--shadow-color)` | 卡片（标准） |
| `shadow-hard-md-hover` | `5px 5px 0px var(--color-accent)` | 卡片 hover（蓝色偏移，差异化） |
| `shadow-hard-lg` | `5px 5px 0px var(--shadow-color)` | Modal / 浮层 |
| `shadow-soft-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 极弱浮层（**新增**，与 Vercel 收敛） |

其中 `--shadow-color` 在浅色为 `--color-ink`（#1a1a2e），深色为 `--color-dark-ink`（#e2e8f0）。

### 4.4 边框

| Token | 值 | 用途 |
|-------|-----|------|
| `border-thin` | `1px solid var(--color-border)` | 表格 / 列表分割线（**新增**） |
| `border-base` | `2px solid var(--color-ink)` | Neobrutal 卡片 / 按钮（**保留**） |
| `border-strong` | `2px solid var(--color-accent)` | hover 边框（差异化） |

> 2px 粗边框是 Neobrutal 记忆点，**不收缩**；1px hairline 仅用于 Linear/Vercel 风格的纯数据列表。

---

## 五、动效曲线

### 5.1 标准缓动（5 种，与 Vercel / Linear / Raycast 收敛）

| Token | 值 | 用途 |
|-------|-----|------|
| `--ease-linear` | `linear` | 连续动画（背景流动） |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认缓入缓出 |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 元素离场 |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 元素入场 |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 按钮 pop（**保留** Neobrutal 弹性） |

### 5.2 标准时长（5 档）

| Token | 值 | 用途 |
|-------|-----|------|
| `--duration-fast` | 100ms | 焦点环 / 颜色切换 |
| `--duration-normal` | 200ms | hover / 状态切换 |
| `--duration-slow` | 300ms | 折叠 / 展开 |
| `--duration-slower` | 400ms | Modal / 大区段 |
| `--duration-slowest` | 600ms | 页面切换 / 视觉化布局重排 |

> 参照 Vercel 200ms / Linear 150-300ms / Raycast 100-200ms，**收敛到 100/200/300/400/600ms 5 档**。

### 5.3 D3 动效

- 使用项目已有 `animationEngine.ts` 的 5 个 preset（**不修改**）
- 视觉化节点/边仅做"高亮/颜色切换"（**不修改**位置 — 由 full re-render 处理）

---

## 六、可视化配色（**新增** 17 visualizer 统一色板）

### 6.1 状态色

| 状态 | 浅色 | 深色 | 用途 |
|------|------|------|------|
| `--viz-default` | `#64748b` | `#94a3b8` | 默认节点 / 边 |
| `--viz-compare` | `#3b82f6` | `#60a5fa` | 比较中 |
| `--viz-swap` | `#dc2626` | `#f87171` | 交换中 |
| `--viz-sorted` | `#059669` | `#34d399` | 已排序 |
| `--viz-active` | `#d97706` | `#fbbf24` | 当前访问 |
| `--viz-found` | `#7c3aed` | `#a78bfa` | 命中（搜索） |
| `--viz-path` | `#0891b2` | `#22d3ee` | 最短路径 |
| `--viz-visited` | `#a78bfa` | `#c4b5fd` | 已访问 |

> **引入时机**：在 Phase E 统一替换 17 visualizer 中的硬编码 hex（保留单值模式，仅改为 token 引用）。Phase A 不立即替换 — 后续 Phase E 渐进迁移。

### 6.2 树/图结构专用色

- **树节点填充**: `--color-card-group-tree`（橙系）
- **图节点填充**: `--color-card-group-graph`（紫系）
- **指针/边**: `--viz-default`
- **高亮当前**: `--viz-active`

---

## 七、组件约定

### 7.1 Button（4 变体 × 3 尺寸）

| 变体 | 浅色 | 深色 | 用途 |
|------|------|------|------|
| **primary** | `--color-accent` 背景 + 白文 | `--color-dark-accent` 背景 + 暗文 | 主行动 |
| **secondary** | 白底 + `--color-ink` 文 + 2px 黑边 + `--shadow-hard-sm` | 暗底 + `--color-dark-ink` 文 + 2px 浅边 + `--shadow-hard-sm` | 次行动 |
| **tertiary** | 透明 + `--color-accent` 文 | 透明 + `--color-dark-accent` 文 | 弱化行动 |
| **danger** | `#dc2626` 背景 + 白文 | `#f87171` 背景 + 暗文 | 危险行动（删除/重置） |

尺寸：`sm` 32px / `md` 40px / `lg` 48px（**不引入** 56/64 巨形按钮）。

### 7.2 Card（3 变体）

| 变体 | 用途 |
|------|------|
| `default` | `--shadow-hard-md` + 2px 边 + `radius-md` |
| `interactive` | `default` + hover 阴影偏移 + 蓝色边 |
| `elevated` | `--shadow-hard-lg` + 2px 边 + `radius-lg`（modal / 浮层） |

### 7.3 Input（1 形态 + 3 状态）

- **默认**: `--color-surface` 底 + 2px `--color-ink` 边 + `radius-md`
- **focus**: 同表面 + 2px `--color-accent` 边 + 外加 1px focus ring
- **disabled**: `--color-muted` 底 + 灰文 + cursor not-allowed
- **error**: 表面 + 2px `#dc2626` 边 + 错误文案

### 7.4 Toast（4 类型）

| 类型 | 底色 | 文色 | 边框 |
|------|------|------|------|
| info | `--color-accent` | 白 | — |
| success | `#059669` | 白 | — |
| warning | `#d97706` | 白 | — |
| error | `#dc2626` | 白 | — |

圆角 `radius-md` + `--shadow-hard-sm`，4 秒自动消失（**保留** 现状）。

### 7.5 Modal / Dialog

- 背景遮罩 `rgba(0, 0, 0, 0.5)`
- 卡片 `--shadow-hard-lg` + 2px 边 + `radius-2xl`（**新增 16px 圆角**）
- 内边距 `space-8`（32px）

### 7.6 Sidebar

- 浅色：`--color-surface` 底 + 1px 右边框
- 深色：`--color-dark-surface` 底 + 1px 右边框
- 选中项：左侧 3px 蓝条 + `--color-accent-soft` 背景
- 折叠/展开动画：200ms `--ease-default`

### 7.7 GlobalSearch / 命令面板（Raycast 风）

- 容器：`--color-dark-surface` 底（**深色优先**）+ 1px `--color-dark-border` + `radius-xl`
- 输入框：透明底 + 无边框 + 14px 占位符
- 列表项：6px 内边距 + 6px 圆角 + hover 切换到 `--color-dark-surface-strong`
- 快捷键提示：keycap 样式（见 §7.8）
- 分类徽章：12px `--caption` + `--color-accent-soft` 底 + 4px 圆角

### 7.8 Keycap（**新增** Raycast 风格）

```css
.kbd-key {
  display: inline-flex;
  align-items: center;
  height: 20px;
  min-width: 20px;
  padding: 0 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--color-ink-light);
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-strong) 100%);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  box-shadow: 0 1px 0 var(--color-border);
}
```

深色模式反色。

---

## 八、布局与栅格

### 8.1 断点（与 Vercel 收敛）

| 名称 | 宽度 | 关键变化 |
|------|------|----------|
| `mobile` | < 640px | 单列；hero 标题 64 → 36px；侧边栏抽屉 |
| `tablet` | 640-1023px | 2 列网格；命令面板占满 |
| `desktop` | 1024-1439px | 3 列网格；侧边栏 240px 固定 |
| `wide` | ≥ 1440px | 4 列网格；最大内容宽度 1280px 居中 |

### 8.2 内容容器

- 最大宽度 1280px（Vercel 同款 `--ds-page-width`）
- 桌面 24px gutter；移动 16px gutter

### 8.3 Hero 段带（首页）

- 上下间距 `space-24`（96px）
- 左对齐 + 大字标题 + 副标题 + 双 CTA（primary + secondary）
- 背景：浅色 `--color-paper`；深色 `--color-dark-paper`

---

## 九、Logo 与品牌

- **产品名**: "数据结构学习助手"（中文主） / "ds-visualizer"（英文副）
- **Logo**: 文字 + 1 个符号（暂用 2 个堆叠矩形暗示数据结构节点）
- **Logo 颜色**: `--color-accent`（浅色）/ `--color-dark-accent`（深色）
- **应用图标**: Neo-Brutal 2px 边框 + 2-3 色配色（与品牌记忆点一致）

---

## 十、迁移路线

| 阶段 | 任务 | 状态 |
|------|------|------|
| Phase A | DESIGN.md 落地（**当前**） | ✅ |
| Phase B | 6 组件（Button/Card/Input/Toast/Modal/Sidebar）迁入新 token | ⏳ |
| Phase C | GlobalSearch + KeyboardHelp 升级 Raycast 风格 | ⏳ |
| Phase D | 17 页面级一致性抽检与微调 | ⏳ |
| Phase E | 17 visualizer 颜色引用 `--viz-*` token | ⏳ |
| Phase F | 验收（lint/test/build/a11y）+ 文档同步 + 微提交 | ⏳ |

---

## 十一、违规检测

每次 PR / 提交前，自检以下规则：

- [ ] 没有引入新字体或新品牌色
- [ ] 没有使用 `#000` 真黑或 `#fff` 真白作 canvas
- [ ] 没有在视觉化节点/边直接用 hex，应使用 `--viz-*` token
- [ ] 没有写死 px 圆角（除 `radius-sm/md` 现状保留）
- [ ] 没有引入新阴影变体（仅 `shadow-hard-{sm,md,lg}` + `shadow-soft-sm` 5 档）
- [ ] ESLint 0 errors + Test 0 failed + Build OK
- [ ] DESIGN.md 更新（如有 token / 组件调整）

---

## 十二、版本与变更

| 版本 | 日期 | 变更摘要 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2026-06-22 | 初版：基于 Linear / Vercel / Raycast 三方参考整合；定义色彩 / 字体 / 间距 / 阴影 / 动效 / 组件 / 可视化 7 大体系 | AI（v16 设计统一化 Phase A） |

---

> **本文件为视觉/交互决策的唯一真源**。任何与本文件冲突的代码、PR、文档均视为越权，需先回写到本文件再讨论实施。
