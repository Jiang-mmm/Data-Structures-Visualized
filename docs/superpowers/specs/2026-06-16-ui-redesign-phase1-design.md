# UI 重构 Phase 1：布局空间最大化

## 目标
压缩非核心 UI 区域，最大化可视化画布占比，减少视觉杂乱。

## 范围

### 1.1 PageHeader 精简
- 移除标题左侧冗余图标（与侧边栏重复）
- 压缩 padding：`py-3.5 sm:py-5` → `py-2 sm:py-3`
- 副标题字号保持 `text-xs`，但增加与标题的间距
- 标题区整体更紧凑

### 1.2 OperationBar padding 压缩
- `py-2.5 sm:py-3.5` → `py-1.5 sm:py-2.5`
- 保持操作按钮最小触摸目标 44px

### 1.3 侧边栏底部控件重构
- 移除版本号展示（V{version}）
- 主题色板改为弹出面板（点击按钮触发 popover），不再常驻展开
- 折叠态底部只保留语言+深色模式按钮
- 减少底部区域高度约 60px

### 1.4 网格线默认隐藏
- `showGrid` 默认值从 `true` 改为 `false`
- 用户可通过按钮手动开启，偏好持久化到 localStorage

### 1.5 已有 Grid Key 迁移
- localStorage key `ds-visualizer-show-grid` 已有值的用户不受影响（显式存储过值）
- 未存储过的用户默认变为隐藏网格

## 不在范围内
- 右侧学习面板（Phase 4）
- 色彩语义体系（Phase 2）
- 交互反馈（Phase 3）
- 模块专项优化（Phase 5）

## 测试策略
- 现有 1275 个测试不应破坏
- 需要更新的测试：PageHeader 测试（如果断言了图标存在）、Visualizer 测试（如果断言了网格默认开启）
