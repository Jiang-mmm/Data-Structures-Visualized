# 全面代码审查与迭代优化 Spec

## Why
经过 v4.6-v5.3 的快速迭代，项目积累了性能、可读性、可维护性等方面的技术债务。需要系统性地审查和优化代码质量，确保项目在功能扩展的同时保持高质量标准。

## What Changes
- **性能优化**: 添加 useMemo/useCallback 避免不必要的重渲染，优化 Sidebar/ArrayPage/GraphPage 等组件
- **可读性提升**: 格式化压缩的单行函数，提取长模板字符串为常量
- **可维护性增强**: 提取重复的键盘快捷键和撤销/重做逻辑为共享 hook/组件
- **安全加固**: 增强 sanitizeInput 过滤，添加 localStorage 数据验证
- **资源优化**: 修复 animationEngine 全局状态竞态，优化 FPS 监控管理

## Impact
- Affected components: Sidebar, Visualizer, OperationBar, ArrayPage, SortPage, GraphPage
- Affected hooks: useHistory, useDataStructureState, useKeyboard
- Affected utils: animationEngine, validate, toastStore

## ADDED Requirements

### Requirement: useMemo/useCallback 性能优化
The system SHALL 使用 React 性能优化钩子避免不必要的重渲染。

#### Scenario: Sidebar 组件优化
- **WHEN** Sidebar 组件渲染
- **THEN** structures 数组使用 useMemo 缓存
- **THEN** themes 列表使用 useMemo 缓存
- **THEN** 子组件不会因为父组件重渲染而不必要的重渲染

#### Scenario: 页面事件处理函数优化
- **WHEN** ArrayPage/GraphPage/SortPage 渲染
- **THEN** 所有事件处理函数使用 useCallback 包装
- **THEN** 传递给子组件的回调保持引用稳定

### Requirement: 代码可读性提升
The system SHALL 保持代码格式一致，提高可读性。

#### Scenario: GraphPage 函数格式化
- **WHEN** 查看 GraphPage.jsx 的事件处理函数
- **THEN** 每个函数体内的语句分行书写
- **THEN** 复杂逻辑有清晰的代码结构

#### Scenario: 长模板字符串提取
- **WHEN** 组件包含长 Tailwind 类名字符串
- **THEN** 提取为常量或使用 clsx/classnames 工具

### Requirement: 代码复用增强
The system SHALL 提取重复逻辑为共享 hook 或组件。

#### Scenario: 通用键盘快捷键 hook
- **WHEN** 页面需要绑定撤销/重做/重置快捷键
- **THEN** 使用 useCommonKeyboard hook 统一处理
- **THEN** 不再在每个页面重复相同的键盘配置代码

#### Scenario: 撤销/重做 UI 组件
- **WHEN** 页面需要显示撤销/重做按钮
- **THEN** 使用 UndoRedoBar 组件统一封装
- **THEN** 不再在每个页面重复相同的按钮代码

### Requirement: 安全加固
The system SHALL 增强输入验证和数据安全。

#### Scenario: sanitizeInput 增强
- **WHEN** 用户输入被处理
- **THEN** 过滤更多潜在危险字符
- **THEN** 考虑使用 DOMPurify 或类似库

#### Scenario: localStorage 数据验证
- **WHEN** 从 localStorage 加载数据
- **THEN** 验证数据结构是否符合预期
- **THEN** 无效数据被丢弃并使用默认值

### Requirement: 资源管理优化
The system SHALL 正确管理全局状态和定时器。

#### Scenario: animationEngine 状态管理
- **WHEN** 多个组件同时使用动画引擎
- **THEN** 不会产生竞态条件
- **THEN** 考虑使用 Context 或状态管理库

#### Scenario: toastStore 定时器管理
- **WHEN** Toast 被创建
- **THEN** 返回清理函数以便取消定时器
- **THEN** 组件卸载时可以正确清理

## MODIFIED Requirements

### Requirement: Visualizer 组件
**Modified**: 添加 viewBox 计算的 useMemo 优化。
- viewBox 字符串使用 useMemo 缓存
- 避免每次渲染时重新计算

### Requirement: Sidebar 组件
**Modified**: 添加性能优化和代码清理。
- structures 和 themes 使用 useMemo 缓存
- 长模板字符串提取为常量

## REMOVED Requirements
无移除需求。
