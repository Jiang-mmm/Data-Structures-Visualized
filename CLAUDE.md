# CLAUDE.md

This file provides guidance to MiMo Code (claude.ai/code) when working with code in this repository.

## AI 协作前置步骤（开发前必读）

> 开始任何代码开发任务前，**必须**先读取项目当前状态，避免基于过时代码或已归档文档做决策。

1. **读取 `PROJECT_STATUS.md`** — 了解当前版本、分支、最近完成的工作、下一步方向、已知约束。
2. **读取 `TODO.md` 顶部 3 段** — 确认当前活跃任务与优先级。
3. **读取 `WORKLOG.md` 前 60 行** — 了解最近工作上下文。
4. 若状态文档与代码冲突，**以 `PROJECT_STATUS.md` 和 `TODO.md` 为准**。
5. 历史参考请访问 `docs/archive/`，**禁止**将归档文档作为当前开发决策依据。

## 项目级强制规则（必须遵守）

> 完整规则在 `.trae/rules/project_rules.md`（Agent 宪法），本节为执行速查。

1. **`design-md/` 默认禁读** — 收录各品牌设计资料，**仅在用户显式指示**下才允许读取；Glob / Grep / SearchCodebase 调用前必须显式排除该目录。
2. **设计规范的唯一真源是 `DESIGN.md`** — 视觉/交互决策**必须**以项目根目录的 `DESIGN.md`（若存在）为依据；冲突实现视为越权；DESIGN.md 不存在时，**不擅自拍板**，向用户确认。
3. **每次任务完成必须同步所有相关文档** — 含 `PROJECT_STATUS.md` / `TODO.md` / `WORKLOG.md` / `README.md` / `ARCHITECTURE.md` / `CODE_WIKI.md` / `docs/superpowers/{specs,plans}/*` / `CLAUDE.md` / `AGENTS.md` 等；**汇报完成前**完成更新；用户明确豁免需标注 `DOCS: SKIPPED (user override)`。

## 当前活跃计划（2026-06-22）

| 计划 | 路径 | 状态 | 启动条件 |
|------|------|------|----------|
| **v20 下一迭代计划** | [docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md](docs/superpowers/plans/2026-06-22-v20-next-iteration-plan.md) | ⏳ **启动待用户拍板** | 3 方向：A i18n M5-M9 13d（极低风险）/ B AI 智能伴侣 25-30d（中风险）/ C 技术债清理 15-18d（低风险）；默认推荐 A + C 并行（独立 feature 分支）|
| **6-12 月长线路线图 v18→v24** | [docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md](docs/superpowers/plans/2026-06-22-longterm-roadmap-v18-to-v24.md) | 🆕 **已交付** | 3 战略主题：T1 国际化 / T2 AI 智能伴侣 / T3 协作教学；4 版本路线 v20-v23（2026 Q3 - 2027 Q2）；总工时 ~138d；资源 < $250/月 |
| **v19 i18n 渐进迁移** | [docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md](docs/superpowers/plans/2026-06-22-v19-i18n-progressive-migration.md) | 🟢 **M0+M1+M2+M3+M4 全部完成 2026-06-22**（基于 v17.0.0 GA）| 基线 v17.0.0 GA（merge `b991566`）；M0 8 项决策 D1=B / D2=C / D3=B / D4=B / D5=C / D6=B / D7=B / D8=A 已拍板；M1 调研清单 17,500 字符已交付；M2 基础设施完成（locales/{zh,en}/ 目录骨架 + integrity.ts + pseudoLocale.ts + 46 项测试）；**M3 TypeScript 强约束完成**（`AssertSameKeys` 深度递归编译时断言 + `no-hardcoded-chinese-in-jsx` 自定义 ESLint 规则 + 45 项测试，i18n+eslint 子目录 95/95）；**M4 全部收尾**（20 目标 100% `t()` 化 / 569 个 `t()` 调用 / 0 字符 UI 硬编码 / 48 行开发者向注释 / 0 代码变更 / 0 测试新增 / 0 locale 文件新增；M4-1 按用户拍板 A / M4-2 按用户拍板 A.1 / M4-3 按用户最新指令"一次性全部完成"），详见 [docs/superpowers/i18n-inventory/06-m4-closure-report.md](./../i18n-inventory/06-m4-closure-report.md) + [03-m4-1-summary.md](./../i18n-inventory/03-m4-1-summary.md) + [04-m4-2-p1-strings.md](./../i18n-inventory/04-m4-2-p1-strings.md) + [05-m4-3-p2-strings.md](./../i18n-inventory/05-m4-3-p2-strings.md)。**M5+ 待启动**（v20 方向 A）|
| **v18 i18n 全量替换** | （已封存，commit `774025a` 历史快照）| 📦 封存 | M0 决策保留为项目记忆；可基于 D1-D5 摘要 + v18 计划文档重启 |
| **v17 UI/UX 迭代** | [docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md](docs/superpowers/plans/2026-06-22-v17-ui-ux-iterations.md) | ✅ 已完成（merge `b991566`） | 基线 v16.0.0 GA（merge `b8d0b03`）；R1-R7 全部通过浏览器验收（1440p 截图 + DOM 断言）|
| **v16 设计统一化** | [docs/superpowers/plans/2026-06-22-design-unification-v16.md](docs/superpowers/plans/2026-06-22-design-unification-v16.md) | ✅ 已完成 | M0-M6 全部完成（merge `b8d0b03`） |
| **v15.x ENH-2 i18n 完善** | [docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md](docs/superpowers/plans/2026-06-22-i18n-glossary-v15-enh2.md) | ✅ 已完成 | 新增 `complexity` + `algorithms` 命名空间 + `useAlgorithmGlossary` + `AlgorithmGlossaryCard`（Home 集成）|

> ⚠️ **`design-md/` 追踪策略**（2026-06-22 发现）：该资料夹当前**未**被 `.gitignore` 收录（`git status` 显示 untracked），与 rule 16.1 隐含假设冲突。**禁止**在未拍板前 commit、stash、或引用其内容。

## Project Overview

**ds-visualizer** (数据结构学习助手) — a Chinese-language educational web app for university students to learn data structures through interactive D3.js SVG animations. React 19 + Vite 8 + TypeScript 5.8 + D3.js v7 + Tailwind CSS v4. Deployed to GitHub Pages at base path `/Data-Structures-Visualized/`.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Dev server on port 3000 (auto-opens browser)
npm run build            # Production build
npm run build:analyze    # Bundle analysis (outputs dist/stats.html)
npm run lint             # ESLint (flat config)
npm run test             # Vitest in watch mode
npm run test:run         # Vitest single run
npm run test:coverage    # Vitest with v8 coverage
npm run preview          # Preview production build
```

E2E tests: `node e2e/run-all-tests.js` (requires dev server running at `http://localhost:3000/Data-Structures-Visualized/`).

## Architecture

Six-layer structure: **Entry (main.tsx → App.tsx) → Pages → Components → Hooks → Visualizers → Algorithms/Utils**.

**Routing:** React Router v7 with protocol-aware router: `BrowserRouter` for http(s):// (basename `/Data-Structures-Visualized`) and `HashRouter` for file://. All 17 pages are `React.lazy` code-split via `Suspense`.

**State management:** No Redux/Zustand. Each data structure has its own `use*State` hook (15 total) built on `useState` + `useCallback`. All hooks internally use `useHistory` — a `useRef`-based undo/redo stack (max 20 steps). History is stored in refs, not state, to avoid unnecessary re-renders.

**Visualization pattern:** D3.js drives SVG with a **full-clear + full-render** strategy (not D3 enter/update/exit). Every data change calls `container.selectAll('*').remove()` then re-creates all elements. SVGs use `viewBox` (not width/height attributes) with `className="w-full h-full"` to avoid dual-coordinate-system issues.

**Animation engine:** Centralized in `src/utils/animationEngine.ts`. Provides `duration()`, `wait()`, `transition()` with global speed multiplier, performance modes (auto-adjusts for data size), 5 animation presets, and FPS monitoring. Animations are abortable via `anim?.isAborted?.()` checks at each step. Animations do NOT move elements or create persistent DOM — they only do visual highlighting. Position changes happen through the full re-render.

**Styling:** Tailwind CSS v4 via `@tailwindcss/vite`. Neo-Brutalist design (hard borders, hard shadows, high contrast). Custom CSS utilities in `index.css` (`neo-border`, `dot-grid`, `grain`). Supports light/dark/system themes and 4 color themes.

**Data persistence:** All 15 data structures auto-save/restore via localStorage.

**i18n:** Custom lightweight implementation (Chinese + English) — `src/i18n/locales.ts` + `src/i18n/useI18n.ts`. No external i18n library. Namespaces include `complexity` (13 keys for best/avg/worst/space/title) and `algorithms` (16 data structures × 7 fields via `AlgorithmGlossaryEntry` type) for the algorithm glossary; `useAlgorithmGlossary()` hook + `AlgorithmGlossaryCard` component available.

**Global search:** `src/components/GlobalSearch.tsx` mounted in `Layout.tsx`, triggered by Ctrl/Cmd+K. Data source is `src/data/searchIndex.ts`, which aggregates data structure/algorithm/page metadata. Reuses `STRUCTURE_KEYS` exported from `Sidebar.tsx` for navigation consistency.

## Key Patterns to Follow

- **Adding a new data structure** requires 8 steps: State Hook, Visualizer, Page, route in App.tsx, sidebar entry in Sidebar.tsx, Home.tsx card, tests, docs.
- **Adding a sorting algorithm:** implement in `src/algorithms/sorting/`, register in its `index.ts` — `useSortState` and pages auto-detect.
- **Adding a graph algorithm:** implement in `src/algorithms/graph/`, create a learning config in `src/configs/learning/`, register in `src/configs/learning/index.ts`.
- **Learning mode configs** are per-algorithm files in `src/configs/learning/`. Naming: `camelCase.config.ts`, export `xxxConfig` with `algorithmKey` + `steps[]`.
- **TypeScript path alias:** `@/*` maps to `src/*`.
- **Type declarations** live in `src/types/*.d.ts`.
- **All source files are TypeScript** (`.ts`/`.tsx`). Only `src/__tests__/setup.js` remains as `.js` (test infrastructure).

## Testing

- **Unit tests:** Vitest + React Testing Library. 2699 tests across 147 files in `src/__tests__/`. Test files mirror source: `useArrayState.test.ts`, `arrayVisualizer.test.ts`, etc.
- **Known failures:** 0 unit test failures. All 2699 pass.
- **Test setup:** `src/__tests__/setup.js` (jsdom environment, jest-dom matchers, SVG mocks).
- **E2E:** Playwright in `e2e/` directory. Run with `node scripts/run-e2e.mjs` (requires dev server at `http://localhost:3000/Data-Structures-Visualized/`). Uses `domcontentloaded` wait strategy. 7 migrated spec files + 2 pre-existing (`home.spec.ts` / `a11y.spec.ts`).
- **E2E scripts:** `npm run test:e2e` (orchestrator), `npm run test:e2e:run` (raw), `npm run test:e2e:list` (list), `npm run test:e2e:firefox` (firefox).
- **Cross-browser:** E2E supports `BROWSER=firefox` env var.
- **Comprehensive suite:** `comprehensive.spec.ts` covers 11 data structures (timeout 600s).
- **Screenshot assertions:** Each spec generates screenshots under `e2e/screenshots/`.
- **A11y testing:** `a11y.spec.ts` uses `@axe-core/playwright` to scan all 17 pages for WCAG 2 AA violations. Run with `npx playwright test e2e/a11y.spec.ts` (requires dev server).

## Conventions

- React function components only (no class components). All hooks are custom, prefixed with `use`.
- D3 selectors use `d3.select(svg)` on the SVG ref, never document.querySelector.
- `validate.ts` handles all input validation (XSS sanitization, range checks, import validation).
- `animationEngine.ts` is the single source for animation timing — never write raw `setTimeout` or `d3.transition` durations.
- Operations that shouldn't be individually undone (e.g., sorting an entire array) set an `undoBlock` flag.
- The project language (UI text, comments, commit messages) is primarily Chinese.
- **OperationGroup** (`src/components/OperationGroup.tsx`): Collapsed children are NOT rendered in DOM (conditional rendering with `shouldRender` state). Buttons inside collapsed groups won't be found by testing queries. Open the group first before interacting with children.
- **EmptyState** (`src/components/EmptyState.tsx`): Uses `pointer-events: none` on overlay, `pointer-events: auto` on content. Doesn't block interaction with underlying UI.
- **Page animation pattern**: Always animate FIRST, then mutate state. Use try/finally for `setIsAnimating(false)` to prevent page lockup on errors.
- **D3 imports**: Always import from `src/utils/d3Imports.ts`, never directly from `'d3'`. Direct imports cause dual-instance issues with transition prototype patching.
- **Heap/Tree inserts**: Must maintain data structure invariants (siftUp for heap, BST position for tree). Don't just append to array.
- **Graph state**: `nodeCounter` is a useRef inside the hook (not module-level). Both `nodes` and `links` are stored as a single `GraphData` object in `useDataStructureState`, so both are persisted to localStorage and included in undo/redo.
- **Accessibility**: SVG visualizations must have `role="img"` and `aria-label` (via `Visualizer` component's `ariaLabel` prop). All interactive elements need `aria-label` or visible text. Use `t()` for all user-facing strings. Error toasts use `aria-live="assertive"`.
- **Bundle optimization**: Vendor chunks are split via `manualChunks` in `vite.config.js` (vendor-react, vendor-d3). `scripts/check-bundle.js` enforces size budgets (index < 110KB, vendor-react < 250KB, vendor-d3 < 60KB).
- **Type imports**: Use `type` prefix for type-only imports (e.g., `import { type ReactNode } from 'react'`). Remove unused `import React` (React 19 automatic JSX runtime). Use post-declaration `memo` (`const X = memo(function X() {...})`) for debuggable component names.
- **Destructuring format**: `useDataStructureState` destructuring uses multi-line format (4-5 fields per line) when field count ≥ 4.
- **catch parameters**: All catch blocks use `catch (error)` (not `e`/`err`). When the error variable is unused, use optional catch binding `catch {}`.
- **Visualizer shared constants**: Cross-visualizer identical constants live in `src/visualizers/visualizerConstants.ts` (`DEFAULT_NODE_RADIUS`, `DEFAULT_LEVEL_HEIGHT`). Only extract truly identical constants; visualizer-specific values stay local.
- **useSharedData is generic**: `useSharedData<T>` infers `T` from the `loadData` function. Never wrap with `as any` — pass `loadData` directly.
- **Comment language**: Business logic comments in Chinese. JSDoc on public APIs stays in English. Technical terms (localStorage, DOM, hover, FPS) are not translated. Test file comments are not modified.
- **ESLint config**: `eslint.config.js` uses `tseslint.config` (not `defineConfig`), covering both JS and TS files via `tseslint.configs.recommended`. `@typescript-eslint/no-unused-vars` is enabled with `varsIgnorePattern: '^_'`. `react-hooks/set-state-in-effect` and `react-hooks/refs` are downgraded to `warn` (existing code patterns).
