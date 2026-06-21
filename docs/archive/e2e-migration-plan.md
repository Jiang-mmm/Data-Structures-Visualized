# E2E 测试框架升级评估与迁移方案（归档）

> **整理日期:** 2026-06-21
> **原始文档:** `docs/e2e-migration-plan.md` (2026-06-17)
> **状态:** 评估完成，未触发迁移。E2E 测试已采用 Playwright API + 自定义 runner（`e2e/run-all-tests.js`），迁移至 @playwright/test 作为可选优化方案保留。

---

# E2E 测试框架升级评估与迁移方案

> **日期:** 2026-06-17
> **状态:** 评估完成，待审批
> **风险等级:** P4（架构变更，需用户确认后执行）

---

## 一、现状分析

### 当前架构
- **框架:** 自定义 Node.js runner（`e2e/run-all-tests.js`）+ Playwright API
- **测试文件:** 9 个 `.js` 文件，使用 `child_process.exec` 串行执行
- **浏览器:** Chromium + Firefox（通过 `BROWSER` 环境变量切换）
- **报告:** 控制台输出，无 HTML 报告
- **重试:** 无内置重试机制
- **并行:** 无并行执行

### 痛点
| 问题 | 影响 | 严重度 |
|------|------|--------|
| 无内置重试 | 偶发性失败需手动重跑 | P2 |
| 串行执行 | 9 个文件全跑约 5-8 分钟 | P2 |
| 无 HTML 报告 | CI 中难以查看失败详情 | P3 |
| 无 fixture 复用 | 每个测试文件重复浏览器启动代码 | P3 |
| 无 VS Code 集成 | 调试体验差 | P3 |

---

## 二、迁移方案

### 目标架构
- **框架:** @playwright/test（Playwright Test Runner）
- **配置:** `playwright.config.ts`
- **并行:** 自动并行执行测试文件
- **重试:** CI 环境自动重试 2 次
- **报告:** HTML 报告 + JUnit XML
- ** fixture:** 共享浏览器上下文

### 迁移步骤

#### 步骤 1: 安装依赖
```bash
npm install -D @playwright/test
```

#### 步骤 2: 创建配置文件（已提供 `e2e/playwright.config.ts`）

#### 步骤 3: 迁移测试文件（渐进式）
每个测试文件从自定义格式迁移到 Playwright Test 格式：
```typescript
// 旧格式
async function runTest() {
  const browser = await chromium.launch()
  // ...
}

// 新格式
import { test, expect } from '@playwright/test'
test('首页加载', async ({ page }) => {
  await page.goto(BASE_URL)
  // ...
})
```

#### 步骤 4: 更新 package.json 脚本
```json
{
  "scripts": {
    "e2e": "npx playwright test",
    "e2e:ui": "npx playwright test --ui",
    "e2e:report": "npx playwright show-report"
  }
}
```

#### 步骤 5: 更新 CI/CD
```yaml
- name: Run E2E tests
  run: npx playwright test
- name: Upload report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
```

---

## 三、收益与成本

### 收益
| 收益 | 说明 |
|------|------|
| 并行执行 | 测试时间从 5-8 分钟降至 1-2 分钟 |
| 自动重试 | CI 偶发性失败自动重试，减少误报 |
| HTML 报告 | 可视化测试结果，含截图和视频 |
| VS Code 集成 | 支持断点调试、测试探索器 |
| fixture 复用 | 减少重复代码约 30% |
| 社区支持 | Playwright Test 是主流框架，文档丰富 |

### 成本
| 成本 | 说明 |
|------|------|
| 迁移工时 | 9 个文件迁移，每个约 30-60 分钟 |
| 学习曲线 | 团队需熟悉 Playwright Test API |
| 过渡期 | 新旧框架并存期间维护成本 |

### 风险
| 风险 | 缓解措施 |
|------|---------|
| 迁移过程中测试遗漏 | 渐进式迁移，新旧并行运行 |
| CI 配置变更 | 先在分支测试，验证后合并 |
| 截图路径变更 | 保持 screenshots 目录不变 |

---

## 四、建议

1. **分阶段迁移:** 先迁移 1 个测试文件验证流程，再批量迁移
2. **保留旧 runner:** 迁移完成前保留 `run-all-tests.js` 作为回退
3. **CI 并行运行:** 迁移期间 CI 同时运行新旧测试，确保无回归

> **决策点:** 是否批准此迁移方案？批准后将按步骤执行。

---

## 附录：2026-06-21 整理备注

- **迁移决策:** 当前未执行迁移。E2E 框架自定义 runner 模式运行稳定（v8.0~v13 持续在用），迁移属于"体验增强"类。
- **触发条件:** 如未来出现以下情况之一，建议启动迁移：
  - 测试稳定性显著下降，需要自动重试
  - E2E 数量超过 20 个，串行执行耗时超过 10 分钟
  - 需要 HTML 报告支持（如：合规审计、问题排查）
  - 需要 VS Code Test Explorer 集成
- **当前替代方案:**
  - 通过 `run-all-tests.js` 串行运行
  - `test-a11y.js` 已独立运行
  - `test-persistence.js` 已优化至 < 5 分钟
  - 失败重试由 `e2e/helpers/retry.js` 提供
- **预计迁移工时:** 4-5 天（按现有 9 个文件计算）
- **风险评估:** 迁移属于 P4 级架构变更，需用户明确批准后方可执行
