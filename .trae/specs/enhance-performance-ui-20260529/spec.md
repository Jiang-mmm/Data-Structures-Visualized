# 性能优化与 UI 精细化 Spec

## Why
当前数据结构可视化应用在大数据量场景（排序 50+ 元素、图 20+ 节点）下出现明显卡顿，且缺少键盘交互、操作回溯等提升演示效率的功能。同时深色模式适配不完整、空状态缺乏引导，影响整体用户体验。

## What Changes
- **性能优化**: 大数据量 D3 渲染节流、动画帧率控制、减少不必要的重渲染
- **键盘交互**: 全局快捷键支持（Space 暂停/继续、R 重置、Ctrl+Z 撤销）
- **操作历史**: 每种数据结构独立的 Undo/Redo 栈（内存实现，限制 20 步）
- **深色模式**: 完善所有页面的 dark: 前缀样式，添加系统偏好自动检测
- **加载与空状态**: 骨架屏加载、空状态插画引导、操作 Onboarding 提示
- **响应式优化**: 移动端基础适配（侧边栏折叠、操作按钮布局）

## Impact
- Affected pages: ArrayPage, StackPage, QueuePage, LinkedListPage, TreePage, GraphPage, SortPage
- Affected components: Visualizer, OperationBar, Sidebar, Layout
- Affected hooks: useArrayState, useStackState, useQueueState, useLinkedListState, useTreeState, useGraphState, useSortState
- New files: useHistory.js, useKeyboard.js, SkeletonLoader.jsx, EmptyState.jsx, OnboardingTooltip.jsx

## ADDED Requirements

### Requirement: 键盘快捷键系统
The system SHALL 提供全局键盘快捷键，提升演示操作效率。

#### Scenario: 排序页面快捷键
- **WHEN** 用户在排序页面按 `Space`
- **THEN** 暂停/继续当前排序动画
- **WHEN** 用户按 `R`
- **THEN** 重置当前数据结构
- **WHEN** 用户按 `Ctrl+Z`
- **THEN** 撤销上一步操作（非动画状态）
- **WHEN** 用户按 `Ctrl+Shift+Z`
- **THEN** 重做被撤销的操作
- **WHEN** 用户按 `?`
- **THEN** 显示快捷键帮助面板

### Requirement: 操作历史回溯
The system SHALL 为每种数据结构维护操作历史栈，支持 Undo/Redo。

#### Scenario: 数组操作撤销
- **GIVEN** 用户依次执行了 "插入 5 到位置 2"、"删除位置 1"
- **WHEN** 用户按 `Ctrl+Z`
- **THEN** 恢复删除前的数组状态（包含位置 1 的元素）
- **WHEN** 用户再按 `Ctrl+Z`
- **THEN** 恢复插入前的原始数组状态
- **WHEN** 用户按 `Ctrl+Shift+Z`
- **THEN** 重新执行 "插入 5 到位置 2"

#### Constraints:
- 历史栈最大深度 20 步
- 动画执行期间禁用 Undo/Redo
- 排序算法执行期间禁用 Undo/Redo
- 页面切换时清空历史栈

### Requirement: 大数据量性能优化
The system SHALL 在数据量超过阈值时自动启用性能优化模式。

#### Scenario: 排序大数据量
- **GIVEN** 排序数据量 > 30 个元素
- **THEN** 动画过渡时长自动缩短 50%
- **THEN** 禁用非必要的阴影/渐变效果
- **THEN** 使用 requestAnimationFrame 节流渲染

#### Scenario: 图结构大数据量
- **GIVEN** 图节点数 > 15 或边数 > 25
- **THEN** 力导向模拟迭代次数限制为 100
- **THEN** 禁用节点拖拽交互
- **THEN** 边线宽度减小以提升渲染性能

### Requirement: 深色模式完善
The system SHALL 完整适配深色模式，包括所有页面和组件。

#### Scenario: 系统偏好检测
- **WHEN** 用户系统设置为深色模式
- **THEN** 应用自动切换为深色主题
- **THEN** 侧边栏、操作栏、可视化区、日志面板全部适配

#### Scenario: 手动切换
- **WHEN** 用户点击侧边栏底部主题切换按钮
- **THEN** 在 light/dark/system 三种模式间循环切换
- **THEN** 切换偏好保存到 localStorage

### Requirement: 加载与空状态优化
The system SHALL 提供优雅的加载和空状态体验。

#### Scenario: 页面初始加载
- **WHEN** 页面首次加载
- **THEN** 显示骨架屏（标题栏 + 操作栏 + 可视化区占位）
- **THEN** 数据就绪后平滑过渡到真实内容

#### Scenario: 空数据结构
- **GIVEN** 数据结构为空（如空栈、空队列）
- **THEN** 显示插画式空状态（图标 + 说明文字 + 操作引导）
- **THEN** 提供快速填充示例数据的按钮

#### Scenario: 首次访问引导
- **WHEN** 用户首次访问某数据结构页面
- **THEN** 显示操作引导气泡（高亮关键按钮，说明功能）
- **THEN** 用户可点击"知道了"关闭或"不再提示"永久关闭

## MODIFIED Requirements

### Requirement: Visualizer 组件
**Modified**: 添加性能模式检测和响应式缩放适配。
- 数据量超过阈值时自动简化渲染
- 缩放操作在移动端通过双指捏合支持

### Requirement: 动画引擎
**Modified**: 添加大数据量自动降速逻辑。
- `duration()` 函数根据数据量动态调整基础时长
- 添加 `skipAnimation` 标志用于快速模式

## REMOVED Requirements
无移除需求。
