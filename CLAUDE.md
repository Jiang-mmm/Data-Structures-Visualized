# CLAUDE.md

This file provides guidance to MiMo Code (claude.ai/code) when working with code in this repository.

## AI 协作前置步骤（开发前必读）

> 开始任何代码开发任务前，**必须**先读取项目当前状态，避免基于过时代码或已归档文档做决策。

1. **读取 `PROJECT_STATUS.md`** — 了解当前版本、分支、最近完成的工作、下一步方向、已知约束。
2. **读取 `TODO.md` 顶部 3 段** — 确认当前活跃任务与优先级。
3. **读取 `WORKLOG.md` 前 60 行** — 了解最近工作上下文。
4. 若状态文档与代码冲突，**以 `PROJECT_STATUS.md` 和 `TODO.md` 为准**。
5. 历史参考请访问 `docs/archive/`，**禁止**将归档文档作为当前开发决策依据。

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

**i18n:** Custom lightweight implementation (Chinese + English) — `src/i18n/locales.ts` + `src/i18n/useI18n.ts`. No external i18n library.

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

- **Unit tests:** Vitest + React Testing Library. 3480 tests across 203 files in `src/__tests__/`. Test files mirror source: `useArrayState.test.ts`, `arrayVisualizer.test.ts`, etc.
- **Known failures:** 0 unit test failures. All 3480 pass.
- **Test setup:** `src/__tests__/setup.js` (jsdom environment, jest-dom matchers, SVG mocks).
- **E2E:** Playwright in `e2e/` directory. Run with `node e2e/run-all-tests.js` (requires dev server at `http://localhost:3000/Data-Structures-Visualized/`). Uses `domcontentloaded` wait strategy.
- **Cross-browser:** E2E supports `BROWSER=firefox` env var. Run with `BROWSER=firefox node e2e/test-home.js`.
- **Comprehensive suites:** `test-comprehensive.js` (all 15 data structures), `test-interactions.js` (cross-module), `test-persistence.js` (localStorage + boundaries). Run after core E2E.
- **Screenshot assertions:** `verifyScreenshot()` helper in `test-helpers.js` checks file existence + 5KB minimum size.
- **A11y testing:** `test-a11y.js` uses `@axe-core/playwright` to scan all 17 pages for WCAG 2 AA violations. Run with `node e2e/test-a11y.js` (requires dev server).

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
