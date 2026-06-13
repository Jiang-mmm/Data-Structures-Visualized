# Tasks

## Task 1: 创建基础 Hooks（键盘 + 历史 + 主题）
- [ ] 创建 `useKeyboard.js`：全局键盘事件监听，快捷键映射表
- [ ] 创建 `useHistory.js`：Undo/Redo 栈管理，深度限制 20
- [ ] 创建 `useTheme.js`：light/dark/system 模式，localStorage 持久化，系统偏好检测

## Task 2: 创建 UI 组件（骨架屏 + 空状态 + 引导）
- [ ] 创建 `SkeletonLoader.jsx`：标题栏 + 操作栏 + 可视化区骨架占位
- [ ] 创建 `EmptyState.jsx`：插画图标 + 说明 + 快速填充按钮
- [ ] 创建 `OnboardingTooltip.jsx`：气泡引导，高亮目标元素，支持"不再提示"
- [ ] 创建 `KeyboardHelp.jsx`：快捷键帮助面板（`?` 触发）

## Task 3: 动画引擎性能优化
- [ ] 修改 `animationEngine.js`：`duration()` 根据数据量动态调整
- [ ] 添加 `skipAnimation` 标志和 `setSkipAnimation()` 导出
- [ ] 添加 `getPerformanceMode(dataLength)` 辅助函数

## Task 4: 深色模式完善
- [ ] 修改 `Sidebar.jsx`：添加主题切换按钮，适配 dark 样式
- [ ] 修改 `Layout.jsx`：根元素添加 dark class 切换
- [ ] 修改 `index.css`：补充缺失的 dark: 颜色变量
- [ ] 检查并修复所有页面的 dark: 样式缺失

## Task 5: 数组页面集成（作为试点）
- [ ] 修改 `useArrayState.js`：集成 `useHistory`，操作后自动 push 状态
- [ ] 修改 `ArrayPage.jsx`：集成 `useKeyboard`，绑定快捷键
- [ ] 修改 `ArrayPage.jsx`：添加 `EmptyState` 和 `OnboardingTooltip`
- [ ] 验证 Undo/Redo、快捷键、空状态功能正常

## Task 6: 推广到所有数据结构页面
- [ ] 修改 `useStackState.js` + `StackPage.jsx`
- [ ] 修改 `useQueueState.js` + `QueuePage.jsx`
- [ ] 修改 `useLinkedListState.js` + `LinkedListPage.jsx`
- [ ] 修改 `useTreeState.js` + `TreePage.jsx`
- [ ] 修改 `useGraphState.js` + `GraphPage.jsx`
- [ ] 修改 `useSortState.js` + `SortPage.jsx`

## Task 7: Visualizer 性能模式
- [ ] 修改 `Visualizer.jsx`：数据量超阈值时简化渲染
- [ ] 修改 `Visualizer.jsx`：移动端双指捏合缩放支持
- [ ] 修改 `graphVisualizer.js`：大数据量时限制力导向迭代、禁用拖拽

## Task 8: 构建验证与测试
- [ ] 运行 `npm run build` 确保无错误
- [ ] 测试键盘快捷键在各页面正常工作
- [ ] 测试 Undo/Redo 在数组/栈/队列页面正常工作
- [ ] 测试深色模式切换和系统偏好检测
- [ ] 测试大数据量（排序 50 元素）性能表现

# Task Dependencies
- Task 5 depends on Task 1, Task 2, Task 3
- Task 6 depends on Task 5
- Task 7 depends on Task 3
- Task 8 depends on Task 4, Task 6, Task 7
