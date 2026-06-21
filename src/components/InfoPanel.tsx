import { useState, useEffect, useRef, memo, useCallback } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import LogPanel from './LogPanel'
import StepExplainer from './StepExplainer'
import type { LearningStep } from '../configs/learning'

interface InfoPanelLearningMode {
  currentStep: LearningStep | null
  currentStepIndex: number
  totalSteps: number
  progress: number
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  reset: () => void
  steps: LearningStep[]
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
  const [highlightedLogId, setHighlightedLogId] = useState<string | null>(null)
  const lastLogLengthRef = useRef(logs.length)

  // 自动高亮：最新日志携带 codeStepId 时高亮对应日志项并显示徽标，不再强制跳转
  useEffect(() => {
    if (logs.length === 0 || logs.length === lastLogLengthRef.current) return
    lastLogLengthRef.current = logs.length
    const latestLog = logs[logs.length - 1]
    if (latestLog?.codeStepId) {
      setHighlightedLogId(`${logs.length - 1}-${latestLog.codeStepId}`)
      const timer = setTimeout(() => setHighlightedLogId(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [logs])

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
        <div className="border-b-2 border-ink dark:border-dark-border px-3 py-2">
          <InfoPanelTabButtons
            activeTab={activeTab}
            onTabSwitch={handleTabSwitch}
            logCount={logs.length}
            hasLearningSteps={learningMode.hasSteps}
            logPanelId="info-panel-log"
            learningPanelId="info-panel-learning"
          />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div
            id="info-panel-log"
            role="tabpanel"
            aria-labelledby="info-panel-log-tab"
            hidden={activeTab !== 'log'}
          >
            <LogPanel
              logs={logs}
              variant="embedded"
              onJumpToStep={handleJumpToStep}
              highlightedLogId={highlightedLogId}
            />
          </div>
          {learningMode.hasSteps && (
            <div
              id="info-panel-learning"
              role="tabpanel"
              aria-labelledby="info-panel-learning-tab"
              hidden={activeTab !== 'learning'}
              className="p-3"
            >
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
            </div>
          )}
        </div>
      </aside>

      {/* 移动端：作为 flex 子项占满主区 */}
      <div className={`lg:hidden flex flex-col ${mobileExpanded ? 'flex-1 min-h-0' : ''}`}>
        {/* 折叠态：状态栏 */}
        {!mobileExpanded && (
          <button
            onClick={() => setMobileExpanded(true)}
            className="w-full bg-surface dark:bg-dark-surface border-t-2 border-ink dark:border-dark-border px-4 py-2 flex items-center justify-between shadow-button dark:shadow-button-dark"
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

        {/* 展开态：flex-1 占满主区，底部按钮固定 */}
        {mobileExpanded && (
          <div className="flex-1 flex flex-col min-h-0 bg-surface dark:bg-dark-surface border-t-2 border-ink dark:border-dark-border animate-slide-up">
            <div className="flex items-center justify-between border-b-2 border-ink dark:border-dark-border px-3 py-2">
              <InfoPanelTabButtons
                activeTab={activeTab}
                onTabSwitch={handleTabSwitch}
                logCount={logs.length}
                hasLearningSteps={learningMode.hasSteps}
                logPanelId="info-panel-log-mobile"
                learningPanelId="info-panel-learning-mobile"
              />
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div
                id="info-panel-log-mobile"
                role="tabpanel"
                aria-labelledby="info-panel-log-mobile-tab"
                hidden={activeTab !== 'log'}
              >
                <LogPanel
                  logs={logs}
                  variant="embedded"
                  onJumpToStep={handleJumpToStep}
                  highlightedLogId={highlightedLogId}
                />
              </div>
              {learningMode.hasSteps && (
                <div
                  id="info-panel-learning-mobile"
                  role="tabpanel"
                  aria-labelledby="info-panel-learning-mobile-tab"
                  hidden={activeTab !== 'learning'}
                  className="p-3"
                >
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
                </div>
              )}
            </div>
            <div className="border-t-2 border-ink dark:border-dark-border p-2 flex justify-end bg-surface dark:bg-dark-surface">
              <button
                onClick={() => setMobileExpanded(false)}
                className="px-3 py-2 flex items-center gap-1.5 border-2 border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper transition-colors text-xs font-bold"
                aria-label={t('infoPanel.closeDrawer')}
              >
                <span>▼</span>
                <span>{t('common.close')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

interface InfoPanelTabButtonsProps {
  activeTab: TabKey
  onTabSwitch: (tab: TabKey) => void
  logCount: number
  hasLearningSteps: boolean
  logPanelId: string
  learningPanelId: string
}

function InfoPanelTabButtons({
  activeTab,
  onTabSwitch,
  logCount,
  hasLearningSteps,
  logPanelId,
  learningPanelId,
}: InfoPanelTabButtonsProps) {
  const { t } = useGlobalSettings()
  return (
    <div role="tablist" aria-label={t('infoPanel.tabs')} className="flex gap-1">
      <button
        role="tab"
        aria-selected={activeTab === 'log'}
        aria-controls={logPanelId}
        id={`${logPanelId}-tab`}
        onClick={() => onTabSwitch('log')}
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
          role="tab"
          aria-selected={activeTab === 'learning'}
          aria-controls={learningPanelId}
          id={`${learningPanelId}-tab`}
          onClick={() => onTabSwitch('learning')}
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
