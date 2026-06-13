# ds-visualizer 本地修改任务计划

> 项目当前状态：999 单元测试通过、93/93 E2E 通过、构建 467ms、Lint 无警告、9 commits

---

## 一、任务目标与范围

### 总体目标
在不推送代码的前提下，完成所有本地优化、测试加固和体验打磨，使项目达到可随时部署的"黄金状态"。

### 范围界定
- **包含**：测试稳定性修复、剩余 a11y 完善、Firefox 全覆盖、E2E 并行稳定性、文档更新
- **不包含**：新功能开发、新数据结构添加、UI 重设计、代码推送/部署

---

## 二、分阶段实施

### 阶段 1：测试稳定性加固（优先级 P0）

| # | 任务 | 描述 | 完成标准 | 预计工时 |
|---|------|------|----------|----------|
| 1.1 | 修复 test-comprehensive.js 9 个动画超时 | LinkedList reverse/detectCycle/redo、Tree postorder/levelorder/redo、Graph redo、Trie search/undo 在 headless 下超时 | 9 个测试全部通过，不再依赖 headless 速度 | 2h |
| 1.2 | E2E 并行执行稳定性 | 5 个测试文件并行运行时可能出现端口/状态冲突 | 并行运行 93/93 通过，无随机失败 | 1h |
| 1.3 | Firefox 全覆盖验证 | 当前仅测试了 home/core/edge 3 个套件 | Firefox 下 5 个套件全部通过（93/93） | 1.5h |
| 1.4 | 综合测试套件纳入主 runner | test-comprehensive.js、test-interactions.js、test-persistence.js 不在 run-all-tests.js 中 | 主 runner 包含全部 8 个测试文件 | 0.5h |

**阶段 1 验收标准**：`node e2e/run-all-tests.js` 在 Chromium 和 Firefox 下均 100% 通过

---

### 阶段 2：无障碍收尾（优先级 P1）

| # | 任务 | 描述 | 完成标准 | 预计工时 |
|---|------|------|----------|----------|
| 2.1 | Visualizer ariaLabel 使用 i18n | 当前 10 个页面使用硬编码中文字符串，应改为 `t()` 调用 | 所有 ariaLabel 通过 i18n 系统获取 | 0.5h |
| 2.2 | 键盘快捷键排除按钮焦点 | `useKeyboard.ts` 中按 'r' 在按钮聚焦时会触发 reset | 按钮聚焦时不触发字母快捷键 | 0.5h |
| 2.3 | SpeedControl 下拉箭头导航 | 下拉菜单打开后不支持上下箭头选择 | 支持 ArrowUp/ArrowDown 导航和 Enter 确认 | 1h |
| 2.4 | 全局 a11y 自动化检测 | 引入 `axe-core` 或类似工具做自动化扫描 | 零 critical/serious violations | 1h |

**阶段 2 验收标准**：WAVE 或 axe 浏览器扩展扫描全部页面零 critical 问题

---

### 阶段 3：工程品质提升（优先级 P2）

| # | 任务 | 描述 | 完成标准 | 预计工时 |
|---|------|------|----------|----------|
| 3.1 | 单元测试覆盖率提升 | 当前 v8 覆盖率未量化，部分工具函数缺测试 | 核心 utils 覆盖率 ≥ 90% | 2h |
| 3.2 | E2E 测试添加到 CI | `.github/workflows/ci.yml` 已有基础，需完善 dev server 启动和超时 | CI 推送时自动运行单元测试 + E2E | 1h |
| 3.3 | Bundle 预算告警 | 在 vite.config.js 中添加 bundle 大小检查 | index.js > 80KB 或 vendor-react > 250KB 时构建告警 | 0.5h |
| 3.4 | 消除 test-only 导出 | `sanitizeInput`、`handleOperationError`、`runWithTimeSlicing`、`decodeData` 仅测试使用 | 测试直接测内部实现或移至 __mocks__ | 1h |

**阶段 3 验收标准**：CI 流水线完整运行，覆盖率报告生成，bundle 大小可控

---

### 阶段 4：文档与清理（优先级 P3）

| # | 任务 | 描述 | 完成标准 | 预计工时 |
|---|------|------|----------|----------|
| 4.1 | 更新 CLAUDE.md | 反映当前架构变更（chunk 分割、a11y 改进、E2E 套件） | CLAUDE.md 与实际代码一致 | 0.5h |
| 4.2 | 清理冗余文档 | ARCHITECTURE.md、AUDIT_REPORT.md、WORKLOG.md 等可能过时 | 删除或更新为最新状态 | 0.5h |
| 4.3 | .trae/ 目录清理 | 已在 .gitignore 中但文件仍在磁盘上 | 删除 .trae/ 目录 | 0.1h |
| 4.4 | 截图目录整理 | e2e/screenshots/ 中有 quality-check/ 子目录和冗余截图 | 仅保留主测试套件截图 | 0.5h |

**阶段 4 验收标准**：仓库干净，文档准确，无冗余文件

---

## 三、本地测试环境要求

### 必需环境
```
Node.js ≥ 18.x
npm ≥ 9.x
Playwright (chromium + firefox)
```

### 启动命令
```bash
npm install                  # 安装依赖
npm run dev                  # 启动开发服务器 (port 3000)
npm run test:run             # 单元测试
node e2e/run-all-tests.js    # E2E 测试 (需要 dev server 运行中)
npm run build                # 生产构建验证
npm run lint                 # 代码规范检查
```

### 验证清单
- [ ] `npm run test:run` → 999/999 通过
- [ ] `npm run lint` → 无错误无警告
- [ ] `npm run build` → 构建成功，index.js < 80KB
- [ ] `BROWSER=chromium node e2e/run-all-tests.js` → 93/93 通过
- [ ] `BROWSER=firefox node e2e/run-all-tests.js` → 93/93 通过
- [ ] `node e2e/test-comprehensive.js` → 117/117 通过（修复后）
- [ ] `node e2e/test-interactions.js` → 40/40 通过
- [ ] `node e2e/test-persistence.js` → 58/58 通过

---

## 四、风险评估

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| D3 动画在 headless 下不稳定 | E2E 随机失败 | 高 | 增加超时容忍度，用 `clickButtonIfEnabled` 替代固定 sleep |
| Firefox 行为差异 | 部分测试在 Firefox 下失败 | 中 | 逐个修复，记录 Firefox 特有的 workaround |
| 并行测试资源竞争 | 同一端口多页面同时操作 | 中 | 为每个测试分配独立 context，或改为串行 |
| a11y 自动化工具引入 | 新依赖增加 bundle 或 CI 时间 | 低 | axe-core 仅用于 dev/test，不进入生产 bundle |
| 文档更新遗漏 | CLAUDE.md 与实际代码不一致 | 低 | 每次代码变更后对照 CLAUDE.md 检查 |

---

## 五、进度跟踪机制

### 每个任务完成后
1. 运行验证清单中的相关命令
2. 更新本文档对应任务的状态标记（⬜ 待开始 → 🔄 进行中 → ✅ 完成）
3. 如发现问题，记录在"问题追踪"章节

### 状态汇报格式
```
## 进度汇报 - YYYY-MM-DD
- 阶段 X：Y/Z 任务完成
- 本日完成：[任务编号和描述]
- 遇到问题：[问题描述]
- 明日计划：[下一步任务]
```

---

## 六、最终交付物清单

| 交付物 | 验收标准 |
|--------|----------|
| 源代码 | Lint 无警告，TypeScript 无类型错误 |
| 单元测试 | 999+ 全部通过，覆盖率 ≥ 90% |
| E2E 测试 | Chromium + Firefox 双浏览器 93/93 + 综合测试 206/206 |
| 生产构建 | 构建时间 < 1s，index.js < 80KB，无 warning |
| a11y 报告 | axe-core 零 critical/serious violations |
| 文档 | CLAUDE.md、README.md 与代码一致 |
| Git 历史 | 提交信息清晰，无冗余文件 |

---

## 七、当前进度

| 阶段 | 状态 | 完成度 |
|------|------|--------|
| 阶段 1：测试稳定性 | 🔄 进行中 | 0/4 |
| 阶段 2：无障碍收尾 | ⬜ 待开始 | 0/4 |
| 阶段 3：工程品质 | 🔄 进行中 | 1/4（3.2 CI 已有基础） |
| 阶段 4：文档清理 | ⬜ 待开始 | 0/4 |
