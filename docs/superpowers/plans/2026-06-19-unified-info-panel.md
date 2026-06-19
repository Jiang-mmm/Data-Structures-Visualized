# 统一信息面板（InfoPanel）实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除底部 LogPanel 和浮动 LearningModeToggle，新建右侧常驻 InfoPanel 组件，融合"操作日志 + 学习模式"两个 tab，视觉风格采用 StepExplainer 设计语言（白色卡片 + Neo-Brutalist 硬阴影 + 字体层级）。

**Architecture:** InfoPanel 作为右侧 `w-96` 常驻面板（移动端底部抽屉），内部通过 tab 切换"操作日志"和"学习模式"。操作日志 tab 重构为卡片化时间线（替代深色反色 LogPanel）；学习模式 tab 直接嵌入 StepExplainer。新增自动跳转机制：当最新日志携带 codeStepId 时，自动切换到学习模式 tab 并 goToStep。

**Tech Stack:** React 19 + TypeScript 5.8 + Tailwind CSS v4（Neo-Brutalist 设计系统）+ Vitest + React Testing Library

**设计规范:** `docs/superpowers/specs/2026-06-19-unified-info-panel-design.md`

---

## 文件结构

### 新建文件
- `src/components/InfoPanel.tsx` — 统一信息面板主组件（含 tab 切换、自动跳转、响应式布局）
- `src/__tests__/InfoPanel.test.tsx` — InfoPanel 单元测试

### 修改文件
- `src/components/LogPanel.tsx` — 重构为卡片化时间线（保留导出，作为 InfoPanel 日志 tab 的渲染内容；移除深色反色背景，改用 StepExplainer 视觉语言）
- `src/i18n/locales.ts` — 新增 `infoPanel` 翻译命名空间（tab 标题、空状态等）
- `src/pages/ArrayPage.tsx`、`LinkedListPage.tsx`、`StackPage.tsx`、`QueuePage.tsx`、`TreePage.tsx`、`AvlTreePage.tsx`、`HeapPage.tsx`、`HashPage.tsx`、`TriePage.tsx`、`GraphPage.tsx`、`SortPage.tsx` — 11 个标准页面：移除 `<LogPanel />` + `<LearningModeToggle />`，改为 `<InfoPanel />`，布局从垂直堆叠改为左右分栏
- `src/pages/GraphAlgorithmPage.tsx` — 适配 InfoPanel 替代现有 LogPanel + StepExplainer 组合
- `src/pages/SortComparePage.tsx` — 适配 InfoPanel，网格布局调整
- `src/__tests__/LogPanel.test.tsx` — 更新测试以匹配新的卡片化 UI

### 不修改文件
- `src/components/StepExplainer.tsx` — 直接复用，不改内部逻辑
- `src/hooks/useLearningMode.ts` — 已就绪
- `src/hooks/use*State.ts`（12 个）— codeStepId 机制已就绪
- `src/configs/learning/*` — Phase 5.5 已全结构覆盖
- `src/types/learning.d.ts` — 本次不扩展（设计文档第 7 节的扩展留作后续迭代）

---

## Task 1: 添加 i18n 翻译键

**Files:**
- Modify: `src/i18n/locales.ts`（类型定义区 + zh + en 三处）

- [ ] **Step 1: 在类型定义区添加 infoPanel 命名空间**

在 `src/i18n/locales.ts` 第 283 行 `stepExplainer` 类型定义之后、`errorBoundary` 之前插入：

```ts
  infoPanel: {
    tabLog: string
    tabLearning: string
    logEmpty: string
    logCount: string
    learningEmpty: string
    closeDrawer: string
    openDrawer: string
    recent: string
  }
```

- [ ] **Step 2: 在 zh 区域（约第 1095 行 stepExplainer 之后）添加中文翻译**

```ts
  infoPanel: {
    tabLog: '操作日志',
    tabLearning: '学习模式',
    logEmpty: '暂无操作记录',
    logCount: '条',
    learningEmpty: '当前结构暂无学习内容',
    closeDrawer: '收起面板',
    openDrawer: '展开面板',
    recent: '最近',
  },
```

- [ ] **Step 3: 在 en 区域（约第 1874 行 stepExplainer 之后）添加英文翻译**

```ts
  infoPanel: {
    tabLog: 'Logs',
    tabLearning: 'Learn',
    logEmpty: 'No operations yet',
    logCount: 'logs',
    learningEmpty: 'No learning content for this structure',
    closeDrawer: 'Collapse panel',
    openDrawer: 'Expand panel',
    recent: 'Recent',
  },
```

- [ ] **Step 4: 验证 tsc 通过**

Run: `npx tsc --noEmit`
Expected: 无新增错误

- [ ] **Step 5: 提交**

```bash
git add src/i18n/locales.ts
git commit -m "feat(i18n): add infoPanel translation namespace"
```

---

## Task 2: 创建 InfoPanel 组件骨架

**Files:**
- Create: `src/components/InfoPanel.tsx`

- [ ] **Step 1: 创建 InfoPanel 组件（含 tab 切换 + 响应式布局 + 自动跳转）**

写入 `src/components/InfoPanel.tsx`：

```tsx
import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import LogPanel from './LogPanel'
import StepExplainer from './StepExplainer'

interface InfoPanelLearningMode {
  currentStep: any
  currentStepIndex: number
  totalSteps: number
  progress: number
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  reset: () => void
  steps: any[]
  hasSteps: boolean
}

interface InfoPanelProps {
  logs: Array<{ time: string; type: string; message: string; codeStepId?: string }>
  learningMode: InfoPanelLearningMode
  isAnimating: boolean
  onJumpToStep?: (stepId: string) => void
}

type TabKey = 'log' | 'learning'

function InfoPanel({ logs, learningMode, isAnimating, onJumpToStep }: InfoPanelProps) {
  const { t } = useGlobalSettings()
  const [activeTab, setActiveTab] = useState<TabKey>('log')
  const [mobileExpanded, setMobileExpanded] = useState(false)
  const lastLogLengthRef = useRef(logs.length)

  // 自动跳转：最新日志携带 codeStepId 时切换到学习模式 tab
  useEffect(() => {
    if (logs.length === 0 || logs.length === lastLogLengthRef.current) return
    lastLogLengthRef.current = logs.length
    const latestLog = logs[logs.length - 1]
    if (latestLog?.codeStepId && onJumpToStep) {
      const idx = learningMode.steps.findIndex(s => s.id === latestLog.codeStepId)
      if (idx >= 0) {
        setActiveTab('learning')
        learningMode.goToStep(idx)
        setMobileExpanded(true)
      }
    }
  }, [logs, learningMode.steps, learningMode.goToStep, onJumpToStep])

  const handleJumpToStep = useCallback((stepId: string): void => {
    if (onJumpToStep) onJumpToStep(stepId)
    setActiveTab('learning')
    setMobileExpanded(true)
  }, [onJumpToStep])

  const handleTabSwitch = useCallback((tab: TabKey): void => {
    setActiveTab(tab)
    setMobileExpanded(true)
  }, [])

  const recentLog = logs.length > 0 ? logs[logs.length - 1] : null

  return (
    <>
      {/* 桌面端：右侧常驻面板 */}
      <aside
        className="hidden lg:flex flex-col w-96 shrink-0 bg-surface dark:bg-dark-surface border-l-2 border-ink dark:border-dark-border"
        aria-label={t('infoPanel.tabLog')}
      >
        <InfoPanelHeader
          activeTab={activeTab}
          onTabSwitch={handleTabSwitch}
          logCount={logs.length}
          hasLearningSteps={learningMode.hasSteps}
        />
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {activeTab === 'log' ? (
            <LogPanel logs={logs} variant="embedded" onJumpToStep={handleJumpToStep} />
          ) : (
            <div className="p-3">
              {learningMode.hasSteps ? (
                <StepExplainer
                  step={learningMode.currentStep}
                  currentStepIndex={learningMode.currentStepIndex}
                  totalSteps={learningMode.totalSteps}
                  progress={learningMode.progress}
                  onNext={learningMode.nextStep}
                  onPrev={learningMode.prevStep}
                  onGoToStep={learningMode.goToStep}
                  onReset={learningMode.reset}
                  isAnimating={isAnimating}
                />
              ) : (
                <div className="text-center text-ink-light dark:text-dark-ink-light text-sm py-8">
                  {t('infoPanel.learningEmpty')}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* 移动端：底部抽屉 */}
      <div className="lg:hidden">
        {/* 折叠态：状态栏 */}
        {!mobileExpanded && (
          <button
            onClick={() => setMobileExpanded(true)}
            className="fixed bottom-0 left-0 right-0 z-30 bg-surface dark:bg-dark-surface border-t-2 border-ink dark:border-dark-border px-4 py-2 flex items-center justify-between shadow-button dark:shadow-button-dark"
            aria-label={t('infoPanel.openDrawer')}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs text-ink dark:text-dark-ink shrink-0">
                {activeTab === 'log' ? t('infoPanel.tabLog') : t('infoPanel.tabLearning')}
              </span>
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light shrink-0">
                {logs.length} {t('infoPanel.logCount')}
              </span>
              {recentLog && (
                <span className="text-xs text-ink-light dark:text-dark-ink-light truncate">
                  · {recentLog.message}
                </span>
              )}
            </div>
            <span className="text-ink dark:text-dark-ink shrink-0">▲</span>
          </button>
        )}

        {/* 展开态：抽屉 */}
        {mobileExpanded && (
          <>
            <div
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setMobileExpanded(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 z-50 h-[60vh] bg-surface dark:bg-dark-surface border-t-2 border-ink dark:border-dark-border flex flex-col shadow-2xl animate-slide-up">
              <div className="flex items-center justify-between border-b-2 border-ink dark:border-dark-border px-3 py-2">
                <InfoPanelTabButtons
                  activeTab={activeTab}
                  onTabSwitch={handleTabSwitch}
                  logCount={logs.length}
                  hasLearningSteps={learningMode.hasSteps}
                />
                <button
                  onClick={() => setMobileExpanded(false)}
                  className="w-8 h-8 flex items-center justify-center border-2 border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper transition-colors font-bold shrink-0"
                  aria-label={t('infoPanel.closeDrawer')}
                >
                  ▼
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-thin">
                {activeTab === 'log' ? (
                  <LogPanel logs={logs} variant="embedded" onJumpToStep={handleJumpToStep} />
                ) : (
                  <div className="p-3">
                    {learningMode.hasSteps ? (
                      <StepExplainer
                        step={learningMode.currentStep}
                        currentStepIndex={learningMode.currentStepIndex}
                        totalSteps={learningMode.totalSteps}
                        progress={learningMode.progress}
                        onNext={learningMode.nextStep}
                        onPrev={learningMode.prevStep}
                        onGoToStep={learningMode.goToStep}
                        onReset={learningMode.reset}
                        isAnimating={isAnimating}
                      />
                    ) : (
                      <div className="text-center text-ink-light dark:text-dark-ink-light text-sm py-8">
                        {t('infoPanel.learningEmpty')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

interface InfoPanelHeaderProps {
  activeTab: TabKey
  onTabSwitch: (tab: TabKey) => void
  logCount: number
  hasLearningSteps: boolean
}

function InfoPanelHeader({ activeTab, onTabSwitch, logCount, hasLearningSteps }: InfoPanelHeaderProps) {
  return (
    <div className="border-b-2 border-ink dark:border-dark-border px-3 py-2">
      <InfoPanelTabButtons
        activeTab={activeTab}
        onTabSwitch={onTabSwitch}
        logCount={logCount}
        hasLearningSteps={hasLearningSteps}
      />
    </div>
  )
}

interface InfoPanelTabButtonsProps {
  activeTab: TabKey
  onTabSwitch: (tab: TabKey) => void
  logCount: number
  hasLearningSteps: boolean
}

function InfoPanelTabButtons({ activeTab, onTabSwitch, logCount, hasLearningSteps }: InfoPanelTabButtonsProps) {
  const { t } = useGlobalSettings()
  return (
    <div className="flex gap-1">
      <button
        onClick={() => onTabSwitch('log')}
        aria-pressed={activeTab === 'log'}
        className={`px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border transition-all duration-200
          ${activeTab === 'log'
            ? 'bg-accent-blue text-paper border-accent-blue shadow-button dark:shadow-button-dark'
            : 'bg-surface text-ink dark:bg-dark-surface dark:text-dark-ink hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper'
          }`}
      >
        {t('infoPanel.tabLog')}
        <span className="ml-1.5 font-mono text-[10px] opacity-70">{logCount}</span>
      </button>
      {hasLearningSteps && (
        <button
          onClick={() => onTabSwitch('learning')}
          aria-pressed={activeTab === 'learning'}
          className={`px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border transition-all duration-200
            ${activeTab === 'learning'
              ? 'bg-accent-blue text-paper border-accent-blue shadow-button dark:shadow-button-dark'
              : 'bg-surface text-ink dark:bg-dark-surface dark:text-dark-ink hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper'
            }`}
        >
          {t('infoPanel.tabLearning')}
        </button>
      )}
    </div>
  )
}

export default memo(InfoPanel)
```

- [ ] **Step 2: 验证 tsc 通过**

Run: `npx tsc --noEmit`
Expected: 无新增错误（LogPanel 的 `variant` prop 将在 Task 3 添加，此处可能报错，先跳过）

- [ ] **Step 3: 暂不提交，等 Task 3 LogPanel 重构完成后一起提交**

---

## Task 3: 重构 LogPanel 为卡片化时间线（InfoPanel 嵌入模式）

**Files:**
- Modify: `src/components/LogPanel.tsx`

- [ ] **Step 1: 重构 LogPanel 支持 variant="embedded" 卡片化模式**

将 `src/components/LogPanel.tsx` 完整替换为以下内容（保留原有 props，新增 `variant` prop；embedded 模式下渲染卡片化时间线，standalone 模式保留旧逻辑供向后兼容——但本次所有页面都将切换为 embedded）：

```tsx
import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface LogEntryLike {
  time: string
  type: string
  message: string
  codeStepId?: string
}

interface LogPanelProps {
  logs: LogEntryLike[]
  maxHeight?: number
  onJumpToStep?: (stepId: string) => void
  variant?: 'standalone' | 'embedded'
}

const typeConfig = {
  oper: { color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', labelKey: 'logPanel.type.oper' },
  info: { color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', border: 'border-accent-emerald/30', labelKey: 'logPanel.type.info' },
  error: { color: 'text-accent-rose', bg: 'bg-accent-rose/10', border: 'border-accent-rose/30', labelKey: 'logPanel.type.error' },
  code: { color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30', labelKey: 'logPanel.type.code' },
} as const

export default function LogPanel({ logs = [], onJumpToStep, variant = 'standalone' }: LogPanelProps) {
  const { t } = useGlobalSettings()

  if (variant === 'embedded') {
    return <EmbeddedLogList logs={logs} onJumpToStep={onJumpToStep} t={t} />
  }

  return <StandaloneLogPanel logs={logs} onJumpToStep={onJumpToStep} t={t} />
}

// ====== Embedded 模式：卡片化时间线（InfoPanel 内使用）======
function EmbeddedLogList({ logs, onJumpToStep, t }: {
  logs: LogEntryLike[]
  onJumpToStep?: (stepId: string) => void
  t: (key: string) => string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs.length])

  if (logs.length === 0) {
    return (
      <div className="text-center text-ink-light dark:text-dark-ink-light text-xs py-8">
        ── {t('infoPanel.logEmpty')} ──
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-live="polite"
      aria-label={t('infoPanel.tabLog')}
      className="p-3 space-y-2 scrollbar-thin"
    >
      {logs.map((log, i) => {
        const config = typeConfig[log.type as keyof typeof typeConfig] || typeConfig.info
        return (
          <div
            key={i}
            className={`bg-paper dark:bg-dark-paper border border-ink/10 dark:border-dark-border p-2.5 animate-slide-up`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex px-1.5 py-0.5 text-[10px] font-mono bg-paper text-ink-light dark:text-dark-ink-light border border-ink/10 dark:border-dark-border tabular-nums">
                {log.time.split(':').slice(1).join(':')}
              </span>
              <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-mono font-bold ${config.bg} ${config.color} ${config.border} border`}>
                {t(config.labelKey)}
              </span>
            </div>
            <div className="text-xs text-ink dark:text-dark-ink break-all leading-relaxed">
              {log.message}
            </div>
            {log.codeStepId && onJumpToStep && (
              <button
                onClick={() => onJumpToStep(log.codeStepId!)}
                className="mt-2 px-2 py-0.5 text-[10px] font-bold font-mono border-2 border-accent-amber/40 text-accent-amber bg-accent-amber/10 hover:bg-accent-amber/20 hover:border-accent-amber/60 transition-colors shadow-button dark:shadow-button-dark active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                aria-label={t('logPanel.viewCode')}
              >
                {t('logPanel.viewCode')}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ====== Standalone 模式：保留旧逻辑（向后兼容，本次重构后无页面使用）======
function StandaloneLogPanel({ logs, onJumpToStep, t }: {
  logs: LogEntryLike[]
  onJumpToStep?: (stepId: string) => void
  t: (key: string) => string
}) {
  const [filter, setFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const toggleCollapsed = useCallback(() => setCollapsed(c => !c), [])

  const filteredLogs = filter === 'all' ? logs : logs.filter(log => log.type === filter)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredLogs, autoScroll])

  const handleScroll = (): void => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      setAutoScroll(scrollHeight - scrollTop - clientHeight < 50)
    }
  }

  if (logs.length === 0 && collapsed) return null

  return (
    <div
      className="bg-ink dark:bg-slate text-paper dark:text-dark-ink flex flex-col log-panel transition-all duration-200"
      style={collapsed ? { maxHeight: 40 } : { maxHeight: 208 }}
    >
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-between px-4 py-2 bg-ink/90 dark:bg-dark-muted border-b-2 border-ink/30 dark:border-dark-border/30 w-full text-left hover:bg-ink/80 dark:hover:bg-dark-muted/80 transition-colors"
        aria-expanded={!collapsed}
        aria-label={t('logPanel.title')}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-70">
            {collapsed ? '▸' : '▾'} {t('logPanel.title')}
          </span>
          {!collapsed && (
            <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
              {['all', 'oper', 'code', 'info', 'error'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter === f}
                  className={`px-2.5 py-0.5 font-mono text-[10px] font-bold transition-all border
                    ${filter === f
                      ? 'border-paper/50 bg-paper/20 text-paper'
                      : 'border-transparent text-paper/50 hover:text-paper/80 hover:bg-paper/10'
                    }`}
                >
                  {f === 'all' ? 'ALL' : t(typeConfig[f as keyof typeof typeConfig]?.labelKey || f)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="font-mono text-xs text-paper/60">{filteredLogs.length}</span>
          {!collapsed && (
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              aria-pressed={autoScroll}
              className={`font-mono text-[10px] font-bold px-2 py-0.5 border transition-colors
                ${autoScroll ? 'border-paper/50 bg-paper/20 text-paper' : 'border-paper/20 text-paper/40 hover:border-paper/40'}`}
            >
              {autoScroll ? t('logPanel.autoScroll') : t('logPanel.freeze')}
            </button>
          )}
        </div>
      </button>
      {!collapsed && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-label={t('logPanel.title')}
          className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-0 scrollbar-thin"
        >
          {filteredLogs.length === 0 ? (
            <div className="text-paper/40 text-center py-6 text-xs tracking-wide">
              ── {t('logPanel.noLogs')} ──
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const config = typeConfig[log.type as keyof typeof typeConfig] || typeConfig.info
              return (
                <div
                  key={i}
                  className={`flex gap-2 sm:gap-3 py-1.5 px-2 animate-slide-up rounded-sm
                    ${i % 2 === 0 ? 'bg-transparent' : 'bg-paper/5'}
                    border-l-2 ${config.border} hover:bg-paper/10 transition-colors`}
                >
                  <span className="text-paper/40 w-20 shrink-0 text-xs hidden sm:block tabular-nums">{log.time}</span>
                  <span className="text-paper/40 w-20 shrink-0 text-xs sm:hidden tabular-nums">
                    {log.time.split(':').slice(1).join(':')}
                  </span>
                  <span className={`${config.color} shrink-0 font-bold text-xs`}>
                    <span className={`sm:hidden ${config.bg} px-1 rounded`}>{t(config.labelKey).charAt(0)}</span>
                    <span className={`hidden sm:inline ${config.bg} px-1.5 py-0.5 rounded text-[11px]`}>{t(config.labelKey)}</span>
                  </span>
                  <span className="text-paper/90 break-all text-xs leading-relaxed flex-1 min-w-0">{log.message}</span>
                  {log.codeStepId && onJumpToStep && (
                    <button
                      onClick={() => onJumpToStep(log.codeStepId!)}
                      className="shrink-0 ml-1 px-2 py-0.5 text-[10px] font-bold font-mono border border-accent-amber/40 text-accent-amber bg-accent-amber/10 hover:bg-accent-amber/20 hover:border-accent-amber/60 transition-colors rounded-sm whitespace-nowrap"
                      aria-label={t('logPanel.viewCode')}
                    >
                      {t('logPanel.viewCode')}
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: 验证 tsc 通过**

Run: `npx tsc --noEmit`
Expected: 无新增错误

- [ ] **Step 3: 提交 Task 2 + Task 3**

```bash
git add src/components/InfoPanel.tsx src/components/LogPanel.tsx
git commit -m "feat(InfoPanel): add unified info panel with embedded log cards"
```

---

## Task 4: 修改 11 个标准页面布局

**Files:**
- Modify: `src/pages/ArrayPage.tsx`、`LinkedListPage.tsx`、`StackPage.tsx`、`QueuePage.tsx`、`TreePage.tsx`、`AvlTreePage.tsx`、`HeapPage.tsx`、`HashPage.tsx`、`TriePage.tsx`、`GraphPage.tsx`、`SortPage.tsx`

每个页面的修改模式相同，以 ArrayPage 为例：

- [ ] **Step 1: 修改 ArrayPage.tsx**

修改点：
1. 替换 import：`LogPanel` → `InfoPanel`，移除 `LearningModeToggle` import
2. 移除 `showLearning` state（InfoPanel 内部管理 tab）
3. 简化 `handleJumpToStep`（InfoPanel 内部处理 tab 切换，页面只需提供 goToStep 逻辑）
4. 修改 JSX：将 `<Visualizer />` 和 `<InfoPanel />` 包裹在 `<div className="flex-1 flex flex-col lg:flex-row min-h-0">` 中
5. 移除底部的 `<LearningModeToggle />` 和 `<LogPanel />`

具体修改 ArrayPage.tsx：

**import 修改**（第 8、22 行）：
```tsx
// 移除：import LogPanel from '../components/LogPanel'
// 移除：import LearningModeToggle from '../components/LearningModeToggle'
// 新增：
import InfoPanel from '../components/InfoPanel'
```

**state 修改**（第 34 行）：
```tsx
// 移除：const [showLearning, setShowLearning] = useState(false)
```

**handleJumpToStep 修改**（第 73-79 行）：
```tsx
const handleJumpToStep = useCallback((stepId: string): void => {
  const idx = learningMode.steps.findIndex(s => s.id === stepId)
  if (idx >= 0) {
    learningMode.goToStep(idx)
  }
}, [learningMode.steps, learningMode.goToStep])
```

**JSX 修改**（第 233-245 行）：

将：
```tsx
      <div className="relative flex flex-col flex-1 min-h-0">
        <Visualizer ... />
        {data.length === 0 && (
          <EmptyState ... />
        )}
      </div>
      <LearningModeToggle
        showLearning={showLearning}
        setShowLearning={setShowLearning}
        learningMode={learningMode}
        isAnimating={isAnimating}
      />
      <LogPanel logs={logs} onJumpToStep={handleJumpToStep} />
```

改为：
```tsx
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          <Visualizer ... />
          {data.length === 0 && (
            <EmptyState ... />
          )}
        </div>
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
          onJumpToStep={handleJumpToStep}
        />
      </div>
```

注意：`<Visualizer />` 和 `<EmptyState />` 的 props 保持不变，只是外层包裹结构改变。

- [ ] **Step 2: 对其余 10 个标准页面重复 Step 1 的修改模式**

对以下页面执行相同修改（每个页面都遵循相同的 5 个修改点）：
- `LinkedListPage.tsx`
- `StackPage.tsx`
- `QueuePage.tsx`
- `TreePage.tsx`
- `AvlTreePage.tsx`
- `HeapPage.tsx`
- `HashPage.tsx`
- `TriePage.tsx`
- `GraphPage.tsx`
- `SortPage.tsx`

每个页面的关键差异：
- import 路径相同
- `learningMode` hook 参数不同（如 `useLearningMode('stack')`）
- `handleJumpToStep` 逻辑相同
- Visualizer 的 props 各自不同，但外层包裹结构一致

- [ ] **Step 3: 验证 tsc 通过**

Run: `npx tsc --noEmit`
Expected: 无新增错误

- [ ] **Step 4: 提交**

```bash
git add src/pages/ArrayPage.tsx src/pages/LinkedListPage.tsx src/pages/StackPage.tsx src/pages/QueuePage.tsx src/pages/TreePage.tsx src/pages/AvlTreePage.tsx src/pages/HeapPage.tsx src/pages/HashPage.tsx src/pages/TriePage.tsx src/pages/GraphPage.tsx src/pages/SortPage.tsx
git commit -m "refactor(pages): replace LogPanel+LearningModeToggle with InfoPanel in 11 standard pages"
```

---

## Task 5: 修改 GraphAlgorithmPage 和 SortComparePage

**Files:**
- Modify: `src/pages/GraphAlgorithmPage.tsx`
- Modify: `src/pages/SortComparePage.tsx`

- [ ] **Step 1: 修改 GraphAlgorithmPage.tsx**

GraphAlgorithmPage 已是左右分栏布局（`flex-1 flex flex-col lg:flex-row`），右侧 `w-96` 区域已有 LogPanel + StepExplainer。修改为使用 InfoPanel 替代该组合。

修改点：
1. import：移除 `LogPanel`、`StepExplainer`，新增 `InfoPanel`
2. 移除右侧 `<div className="w-full lg:w-96 ...">` 内的 `<LogPanel />` 和 `<StepExplainer />` 块
3. 替换为单个 `<InfoPanel />`

将第 257-273 行：
```tsx
        <div className="w-full lg:w-96 shrink-0 overflow-y-auto">
          <LogPanel logs={logs} />

          {learningMode.isLearning && (
            <div className="mt-4">
              <StepExplainer
                step={learningMode.currentStep}
                currentStepIndex={learningMode.currentStepIndex}
                totalSteps={learningMode.totalSteps}
                progress={learningMode.progress}
                onNext={learningMode.nextStep}
                onPrev={learningMode.prevStep}
                onReset={learningMode.reset}
                isAnimating={isAnimating}
              />
            </div>
          )}
```

改为：
```tsx
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
        />
```

注意：GraphAlgorithmPage 的 ComplexityChart 区域保留在 InfoPanel 下方（第 275 行起），需要调整布局。实际上 ComplexityChart 应该放在左侧主区域或独立区域。经检查，ComplexityChart 是图算法对比图表，应保留在右侧 InfoPanel 下方。但由于 InfoPanel 是自包含的 aside，需要将 ComplexityChart 移到左侧主区域。

**调整方案**：将 ComplexityChart 移到左侧 `<div className="flex-1 flex flex-col gap-4">` 内的 Visualizer 下方。

具体：将第 275-300 行的 ComplexityChart 块从右侧移到左侧 Visualizer 之后。

- [ ] **Step 2: 修改 SortComparePage.tsx**

SortComparePage 是网格布局，底部有 `<Timeline />` 和 `<LogPanel />`。修改为：
1. import：`LogPanel` → `InfoPanel`
2. 将底部 `<LogPanel logs={logs} />` 替换为右侧 `<InfoPanel />`
3. 布局调整：主网格区域和 InfoPanel 左右分栏

将第 343-413 行的 `<div className="flex-1 p-2 overflow-auto">` 和第 412-413 行的 `<Timeline />` + `<LogPanel />` 重组为：

```tsx
      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="flex-1 p-2 overflow-auto bg-paper dark:bg-dark-paper">
          {/* 原有的网格内容、PerformanceChart 等 */}
        </div>
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
        />
      </div>
      <Timeline history={timelineHistory} currentIndex={Math.max(0, timelineHistory.length - 1)} />
```

注意：SortComparePage 需要确认是否有 `learningMode` hook。如果没有，需要添加 `const learningMode = useLearningMode('bubble')` 或使用一个默认空的学习模式。经检查，SortComparePage 是排序对比页，可能没有单独的 learningMode。需要添加一个空的 learningMode 或让 InfoPanel 的 `hasSteps` 为 false 时隐藏学习 tab。

**处理方式**：如果 SortComparePage 没有 learningMode，添加：
```tsx
import { useLearningMode } from '../hooks/useLearningMode'
// ...
const learningMode = useLearningMode('bubble')  // 复用 bubble 作为默认学习内容
```

- [ ] **Step 3: 验证 tsc 通过**

Run: `npx tsc --noEmit`
Expected: 无新增错误

- [ ] **Step 4: 提交**

```bash
git add src/pages/GraphAlgorithmPage.tsx src/pages/SortComparePage.tsx
git commit -m "refactor(pages): integrate InfoPanel into GraphAlgorithmPage and SortComparePage"
```

---

## Task 6: 新建 InfoPanel 测试 + 更新 LogPanel 测试

**Files:**
- Create: `src/__tests__/InfoPanel.test.tsx`
- Modify: `src/__tests__/LogPanel.test.tsx`

- [ ] **Step 1: 新建 InfoPanel.test.tsx**

写入 `src/__tests__/InfoPanel.test.tsx`：

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InfoPanel from '../components/InfoPanel'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const sampleLogs = [
  { time: '10:00:01', type: 'oper', message: '操作日志1' },
  { time: '10:00:02', type: 'info', message: '信息日志1' },
  { time: '10:00:03', type: 'error', message: '错误日志1' },
  { time: '10:00:04', type: 'code', message: '代码日志1', codeStepId: 'insert' },
]

const mockLearningMode = {
  currentStep: null,
  currentStepIndex: 0,
  totalSteps: 3,
  progress: 33,
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  goToStep: vi.fn(),
  reset: vi.fn(),
  steps: [
    { id: 'init', title: 'Init', description: 'Init desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
    { id: 'insert', title: 'Insert', description: 'Insert desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
    { id: 'delete', title: 'Delete', description: 'Delete desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
  ],
  hasSteps: true,
}

function renderInfoPanel(props: Partial<Parameters<typeof InfoPanel>[0]> = {}) {
  return render(
    <InfoPanel
      logs={sampleLogs}
      learningMode={mockLearningMode as any}
      isAnimating={false}
      onJumpToStep={vi.fn()}
      {...props}
    />
  )
}

describe('InfoPanel', () => {
  describe('Tab 切换', () => {
    it('桌面端应渲染两个 tab 按钮', () => {
      renderInfoPanel()
      expect(screen.getByText('infoPanel.tabLog')).toBeInTheDocument()
      expect(screen.getByText('infoPanel.tabLearning')).toBeInTheDocument()
    })

    it('默认应激活日志 tab', () => {
      renderInfoPanel()
      const logTab = screen.getByText('infoPanel.tabLog').closest('button')
      expect(logTab).toHaveAttribute('aria-pressed', 'true')
    })

    it('点击学习模式 tab 应切换', () => {
      renderInfoPanel()
      fireEvent.click(screen.getByText('infoPanel.tabLearning'))
      const learningTab = screen.getByText('infoPanel.tabLearning').closest('button')
      expect(learningTab).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('日志 tab 内容', () => {
    it('应渲染所有日志消息', () => {
      renderInfoPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.getByText('代码日志1')).toBeInTheDocument()
    })

    it('应渲染日志数量徽章', () => {
      renderInfoPanel()
      const logTab = screen.getByText('infoPanel.tabLog').closest('button')
      expect(logTab?.textContent).toContain('4')
    })

    it('codeStepId 存在时应显示查看代码按钮', () => {
      renderInfoPanel()
      expect(screen.getByText('logPanel.viewCode')).toBeInTheDocument()
    })
  })

  describe('学习模式 tab', () => {
    it('切换到学习模式应渲染 StepExplainer', () => {
      renderInfoPanel()
      fireEvent.click(screen.getByText('infoPanel.tabLearning'))
      // StepExplainer 渲染 step title
      expect(screen.getByText('Init')).toBeInTheDocument()
    })

    it('hasSteps 为 false 时不应显示学习模式 tab', () => {
      renderInfoPanel({ learningMode: { ...mockLearningMode, hasSteps: false, steps: [] } as any })
      expect(screen.queryByText('infoPanel.tabLearning')).not.toBeInTheDocument()
    })
  })

  describe('空状态', () => {
    it('日志为空时应显示空状态提示', () => {
      renderInfoPanel({ logs: [] })
      expect(screen.getByText(/infoPanel\.logEmpty/)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 2: 更新 LogPanel.test.tsx**

LogPanel 现在支持 `variant="embedded"` 模式。原有测试针对 standalone 模式（默认），应继续通过。新增 embedded 模式测试。

在 `src/__tests__/LogPanel.test.tsx` 末尾添加：

```tsx
  describe('embedded 模式（InfoPanel 内使用）', () => {
    it('应渲染卡片化日志条目', () => {
      render(<LogPanel logs={sampleLogs} variant="embedded" />)
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
    })

    it('应渲染时间戳（截断小时）', () => {
      render(<LogPanel logs={sampleLogs} variant="embedded" />)
      expect(screen.getByText('00:01')).toBeInTheDocument()
      expect(screen.getByText('00:02')).toBeInTheDocument()
    })

    it('应渲染类型徽章', () => {
      render(<LogPanel logs={sampleLogs} variant="embedded" />)
      expect(screen.getAllByText('logPanel.type.oper').length).toBeGreaterThanOrEqual(1)
    })

    it('日志为空时应显示空状态', () => {
      render(<LogPanel logs={[]} variant="embedded" />)
      expect(screen.getByText(/infoPanel\.logEmpty/)).toBeInTheDocument()
    })

    it('codeStepId 存在且提供 onJumpToStep 时应显示查看代码按钮', () => {
      const onJump = vi.fn()
      const logs = [{ time: '10:00:01', type: 'code', message: '代码日志', codeStepId: 'insert' }]
      render(<LogPanel logs={logs} variant="embedded" onJumpToStep={onJump} />)
      const btn = screen.getByText('logPanel.viewCode')
      fireEvent.click(btn)
      expect(onJump).toHaveBeenCalledWith('insert')
    })
  })
```

注意：需要在文件顶部添加 `import { vi } from 'vitest'`（如果尚未导入）。

- [ ] **Step 3: 运行测试**

Run: `npx vitest run src/__tests__/InfoPanel.test.tsx src/__tests__/LogPanel.test.tsx`
Expected: 所有测试通过

- [ ] **Step 4: 提交**

```bash
git add src/__tests__/InfoPanel.test.tsx src/__tests__/LogPanel.test.tsx
git commit -m "test(InfoPanel): add InfoPanel tests and embedded LogPanel mode tests"
```

---

## Task 7: 全量回归测试

**Files:** 无修改，仅验证

- [ ] **Step 1: 运行 ESLint**

Run: `npm run lint`
Expected: 无错误

- [ ] **Step 2: 运行 TypeScript 类型检查**

Run: `npx tsc --noEmit`
Expected: 无错误

- [ ] **Step 3: 运行全量单元测试**

Run: `npm run test:run`
Expected: 所有测试通过（原有 3075+ 测试 + 新增 InfoPanel 测试）

如果有测试失败，根据失败原因修复：
- 页面测试中查询 LogPanel 的断言需要更新为查询 InfoPanel
- 查询 `logPanel.title` 的断言可能需要改为 `infoPanel.tabLog`

- [ ] **Step 4: 运行生产构建**

Run: `npm run build`
Expected: 构建成功，无错误

- [ ] **Step 5: 检查 bundle 大小**

Run: `node scripts/check-bundle.js`
Expected: 符合预算（index < 110KB, vendor-react < 250KB, vendor-d3 < 60KB）

- [ ] **Step 6: 如有测试失败，修复后重新提交**

```bash
git add -A
git commit -m "test: fix regressions from InfoPanel refactor"
```

---

## Task 8: 提交 + 部署 + 文档更新

**Files:**
- Modify: `docs/iteration-plan-v11.md`
- Modify: `c:\Users\Administrator\.trae-cn\memory\projects\-d-VibeCoding---------3\project_memory.md`

- [ ] **Step 1: 更新 iteration-plan-v11.md**

在 iteration-plan-v11.md 中添加 Phase 5.6（统一信息面板）完成记录：
- 日期：2026-06-19
- 内容：移除 LogPanel + LearningModeToggle，新建 InfoPanel 统一信息面板
- 影响范围：13 个页面布局重构
- 测试结果：全量通过

- [ ] **Step 2: 更新 project_memory.md**

在 project_memory.md 的 Known Gap 或 Engineering Conventions 中添加：
- InfoPanel 取代 LogPanel + LearningModeToggle 成为统一的右侧信息面板
- LogPanel 保留 standalone 模式用于向后兼容，但所有页面已切换为 embedded 模式
- 自动跳转机制：最新日志携带 codeStepId 时自动切换到学习模式 tab

- [ ] **Step 3: 提交文档更新**

```bash
git add docs/iteration-plan-v11.md
git commit -m "docs: update iteration plan with Phase 5.6 InfoPanel completion"
```

- [ ] **Step 4: 部署到 GitHub Pages**

Run: `npm run build && npm run deploy`
Expected: 部署成功

（如果项目使用 gh-pages 部署脚本；否则手动 push dist 到 gh-pages 分支）

- [ ] **Step 5: 验证部署**

访问 `https://username.github.io/Data-Structures-Visualized/`，验证：
- 右侧 InfoPanel 常驻显示
- 操作日志 tab 显示卡片化日志
- 学习模式 tab 显示 StepExplainer
- 操作后自动跳转到学习模式 tab
- 移动端底部抽屉正常工作

---

## 自检清单

完成所有任务后，确认：

- [ ] InfoPanel 组件创建完成，含 tab 切换、自动跳转、响应式布局
- [ ] LogPanel 支持 embedded 模式（卡片化时间线）
- [ ] 11 个标准页面布局改为左右分栏
- [ ] GraphAlgorithmPage 和 SortComparePage 适配完成
- [ ] InfoPanel 测试通过
- [ ] LogPanel embedded 模式测试通过
- [ ] 全量单元测试通过（3075+）
- [ ] ESLint 无错误
- [ ] TypeScript 类型检查无错误
- [ ] 生产构建成功
- [ ] Bundle 大小符合预算
- [ ] 文档更新完成
- [ ] 部署成功
