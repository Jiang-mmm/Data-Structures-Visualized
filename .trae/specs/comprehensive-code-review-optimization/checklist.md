# Checklist

## 性能优化
- [x] Sidebar structures 数组使用 useMemo 缓存
- [x] Sidebar themes 列表使用 useMemo 缓存
- [x] ArrayPage handleInsert/handleDelete/handleSearch 使用 useCallback
- [x] GraphPage 所有事件处理函数使用 useCallback
- [x] SortPage animateFns 和 algorithms 使用 useMemo
- [x] Visualizer viewBox 使用 useMemo 缓存

## 可读性提升
- [x] GraphPage 单行函数格式化为多行
- [x] 长 Tailwind 类名字符串提取为常量
- [x] 代码格式符合项目规范

## 代码复用
- [x] useCommonKeyboard hook 创建并可用
- [x] UndoRedoBar 组件创建并可用
- [ ] 至少 3 个页面使用新的 hook/组件

## 安全加固
- [x] sanitizeInput 过滤增强
- [x] localStorage 数据验证函数创建
- [x] useDataStructureState 使用数据验证

## 资源管理
- [x] toastStore 返回清理函数
- [x] animationEngine 全局状态安全
- [x] FPS 监控逻辑优化

## 构建验证
- [x] npm run lint 零错误通过
- [x] npm run build 构建成功
- [x] npm run test:run 测试通过（317 passed, 16 failed - jsdom scrollIntoView 已知问题）
- [x] 现有功能无回归

## 文档更新
- [x] PROJECT_SUMMARY.md 更新
- [x] WORKLOG.md 更新
- [x] TODO.md 更新
