# Tasks

## Task 1: Sidebar 性能优化
- [x] 使用 useMemo 缓存 structures 数组，依赖 [t]
- [x] 使用 useMemo 缓存 themes 列表
- [x] 提取长 Tailwind 类名字符串为常量

## Task 2: 页面事件处理函数优化
- [x] ArrayPage: 使用 useCallback 包装 handleInsert, handleDelete, handleSearch
- [x] GraphPage: 使用 useCallback 包装 handleBFS, handleDFS, handleDijkstra, handleAddNode, handleAddEdge, handleDeleteNode, handleDeleteEdge
- [x] SortPage: 使用 useMemo 缓存 animateFns 和 algorithms

## Task 3: Visualizer 性能优化
- [x] 使用 useMemo 缓存 viewBox 字符串计算
- [x] 优化 dimensions 相关的派生计算

## Task 4: GraphPage 可读性提升
- [x] 格式化 handleBFS, handleDFS, handleDijkstra 等单行函数为多行
- [x] 提取重复的错误处理逻辑

## Task 5: 创建 useCommonKeyboard hook
- [x] 创建 src/hooks/useCommonKeyboard.ts
- [x] 封装 ctrl+z, ctrl+shift+z, r 快捷键逻辑
- [ ] 在 ArrayPage, SortPage, GraphPage 等页面使用

## Task 6: 创建 UndoRedoBar 组件
- [x] 创建 src/components/UndoRedoBar.tsx
- [x] 封装撤销/重做按钮和 UndoPreviewButton 逻辑
- [ ] 在所有数据结构页面使用

## Task 7: 安全加固
- [x] 增强 sanitizeInput 过滤更多危险字符
- [x] 添加 localStorage 数据结构验证函数
- [x] 在 useDataStructureState 中使用验证函数

## Task 8: 资源管理优化
- [x] 优化 toastStore 返回清理函数
- [x] 检查 animationEngine 全局状态安全性
- [x] 优化 FPS 监控的启停逻辑

## Task 9: 构建验证
- [x] 运行 npm run lint 确保零错误
- [x] 运行 npm run build 确保构建成功
- [x] 运行 npm run test:run 确保测试通过（317 passed, 16 failed - jsdom scrollIntoView 已知问题）
- [x] 验证所有优化不影响现有功能

## Task 10: 文档更新
- [ ] 更新 PROJECT_SUMMARY.md
- [ ] 更新 WORKLOG.md
- [ ] 更新 TODO.md

# Task Dependencies
- Task 2 depends on Task 1 (统一优化模式)
- Task 4 depends on Task 2 (先优化再格式化)
- Task 5 depends on Task 1 (需要了解现有快捷键模式)
- Task 6 depends on Task 1 (需要了解现有撤销/重做模式)
- Task 9 depends on Task 1-8 (验证所有优化)
- Task 10 depends on Task 9 (文档记录)
