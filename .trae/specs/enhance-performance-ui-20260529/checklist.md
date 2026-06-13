# Checklist

## 基础 Hooks
- [ ] `useKeyboard.js` 实现全局键盘监听和快捷键映射
- [ ] `useHistory.js` 实现 Undo/Redo 栈，深度限制 20，动画期间禁用
- [ ] `useTheme.js` 实现 light/dark/system 三模式，localStorage 持久化

## UI 组件
- [ ] `SkeletonLoader.jsx` 骨架屏在页面加载时正确显示
- [ ] `EmptyState.jsx` 空状态在数据为空时显示，包含快速填充按钮
- [ ] `OnboardingTooltip.jsx` 首次访问时显示引导气泡，支持关闭和永久禁用
- [ ] `KeyboardHelp.jsx` 按 `?` 键弹出快捷键帮助面板

## 动画引擎
- [ ] `duration()` 根据数据量动态调整（>30 元素缩短 50%）
- [ ] `skipAnimation` 标志可控制是否跳过动画
- [ ] `getPerformanceMode()` 正确返回性能模式状态

## 深色模式
- [ ] 侧边栏主题切换按钮正常工作
- [ ] 系统偏好自动检测并应用
- [ ] 所有页面组件在深色模式下样式正确
- [ ] 主题偏好保存到 localStorage 并在刷新后恢复

## 数组页面试点
- [ ] Ctrl+Z 撤销上一步数组操作
- [ ] Ctrl+Shift+Z 重做被撤销的操作
- [ ] R 键重置数组
- [ ] 空数组显示 EmptyState 组件
- [ ] 首次访问显示 OnboardingTooltip

## 全页面推广
- [ ] 栈、队列、链表、二叉树、图、排序页面均支持 Undo/Redo
- [ ] 所有页面均支持键盘快捷键
- [ ] 所有页面均支持空状态显示

## Visualizer 性能
- [ ] 大数据量时自动简化渲染
- [ ] 图结构大数据量时禁用拖拽、限制迭代
- [ ] 移动端双指捏合缩放正常工作

## 构建与测试
- [ ] `npm run build` 零错误通过
- [ ] 快捷键在各页面测试通过
- [ ] Undo/Redo 在数组/栈/队列测试通过
- [ ] 深色模式切换和系统偏好检测测试通过
- [ ] 排序 50 元素动画流畅无卡顿
