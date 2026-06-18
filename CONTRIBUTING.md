# 贡献指南

感谢你对数据结构学习助手项目的关注！本文档指导你如何参与项目开发。

## 开发环境搭建

```bash
# 1. 克隆仓库
git clone https://github.com/Jiang-mmm/Data-Structures-Visualized.git
cd Data-Structures-Visualized

# 2. 安装依赖
npm install

# 3. 启动开发服务器（端口 3000）
npm run dev
```

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（自动打开浏览器） |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run test` | 单元测试（watch 模式） |
| `npm run test:run` | 单元测试（单次运行） |
| `npm run test:coverage` | 单元测试 + 覆盖率 |
| `node e2e/run-all-tests.js` | E2E 测试（需先启动 dev server） |

## 项目架构

六层结构：`Entry → Pages → Components → Hooks → Visualizers → Algorithms/Utils`

详细架构说明见 [ARCHITECTURE.md](./ARCHITECTURE.md)。

## 编码规范

### TypeScript
- **strict 模式:** 全部启用（strictNullChecks + noImplicitAny + noUnusedLocals/Parameters）
- **禁止 `any`:** 使用具体类型或泛型
- **路径别名:** 使用 `@/*` 映射到 `src/*`

### React
- **函数组件:** 禁止 class 组件
- **Hooks:** 自定义 Hook 以 `use` 前缀命名
- **状态管理:** 使用 `useDataStructureState` + `useHistory`，不引入 Redux/Zustand

### D3.js 可视化
- **渲染策略:** 全清+全绘（`container.selectAll('*').remove()` 后重建）
- **SVG 坐标:** 使用 `viewBox` + CSS `w-full h-full`，禁止 `width`/`height` 属性
- **D3 导入:** 统一从 `src/utils/d3Imports.ts` 导入，禁止直接 `import 'd3'`
- **动画引擎:** 使用 `animationEngine.ts`，禁止原始 `setTimeout` 或 `d3.transition` duration

### 动画规范
- **职责分离:** 动画函数仅处理视觉高亮，不移动元素或创建持久 DOM
- **位置更新:** 通过全量重渲染完成
- **可中止:** 每步检查 `anim?.isAborted?.()`
- **大数据量:** 超过 `LARGE_DATA_THRESHOLD` 时跳过动画

## 添加新功能

### 新增数据结构（8 步）
1. 创建 State Hook（`src/hooks/use*State.ts`）
2. 创建 Visualizer（`src/visualizers/*Visualizer.ts`）
3. 创建 Page（`src/pages/*Page.tsx`）
4. 在 `App.tsx` 添加路由
5. 在 `Sidebar.tsx` 添加导航条目
6. 在 `Home.tsx` 添加卡片
7. 编写单元测试（`src/__tests__/`）
8. 更新文档

### 新增排序算法
1. 在 `src/algorithms/sorting/index.ts` 中使用 `registerSortAlgorithm` 注册
2. `useSortState` 和 `SortPage` 自动检测新算法
3. 创建学习配置（`src/configs/learning/`）
4. 在 `configs/learning/index.ts` 注册配置
5. 添加 i18n 翻译

### 新增图算法
1. 在 `src/algorithms/graph/` 创建算法文件
2. 在 `graph/index.ts` 导出并注册到 `graphAlgorithms` 数组
3. 在 `GraphAlgorithmPage.tsx` 添加 switch 分支
4. 创建学习配置并注册
5. 添加 i18n 翻译

## 提交规范

### Commit Message 格式
```
<type>(<scope>): <subject>

<body>
```

**type:** `feat` | `fix` | `docs` | `style` | `refactor` | `test` | `chore`
**scope:** 模块名（如 `sort`、`graph`、`ui`）
**subject:** 简短描述（中文）

示例：
```
feat(sort): 新增希尔排序算法
fix(graph): 修复 Dijkstra 路径回溯错误
docs(readme): 更新安装指南
```

### 提交前检查
```bash
npm run lint && npm run typecheck && npm run test:run
```

确保零 lint 错误、零类型错误、全部测试通过。

## 测试规范

### 单元测试
- 文件位置：`src/__tests__/`
- 命名：`*.test.ts`，与源文件对应
- 框架：Vitest + React Testing Library
- 覆盖率目标：核心逻辑 > 70%

### E2E 测试
- 文件位置：`e2e/`
- 框架：Playwright（自定义 runner）
- 浏览器：Chromium + Firefox
- 无障碍：@axe-core/playwright WCAG 2 AA

## 问题反馈

- **Bug 报告:** 请使用 GitHub Issues，附复现步骤和截图
- **功能建议:** 请先在 Issues 中讨论，获得维护者确认后再开发
- **安全漏洞:** 请私下联系维护者，勿公开 Issue

## 行为准则

请保持友善和尊重。我们欢迎所有水平的贡献者。
