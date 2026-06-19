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
        <div className="border-b-2 border-ink dark:border-dark-border px-3 py-2">
          <InfoPanelTabButtons
            activeTab={activeTab}
            onTabSwitch={handleTabSwitch}
            logCount={logs.length}
            hasLearningSteps={learningMode.hasSteps}
          />
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
