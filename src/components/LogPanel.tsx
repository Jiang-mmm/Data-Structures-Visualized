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
}

export default function LogPanel({ logs = [], maxHeight = 208, onJumpToStep }: LogPanelProps) {
  const [filter, setFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { t } = useGlobalSettings()

  const toggleCollapsed = useCallback(() => setCollapsed(c => !c), [])

  const typeConfig: Record<string, { color: string; bg: string; border: string; labelKey: string }> = useMemo(() => ({
    oper: { color: 'text-accent-blue', bg: 'bg-accent-blue/10', border: 'border-accent-blue/30', labelKey: 'logPanel.type.oper' },
    info: { color: 'text-accent-emerald', bg: 'bg-accent-emerald/10', border: 'border-accent-emerald/30', labelKey: 'logPanel.type.info' },
    error: { color: 'text-accent-rose', bg: 'bg-accent-rose/10', border: 'border-accent-rose/30', labelKey: 'logPanel.type.error' },
    code: { color: 'text-accent-amber', bg: 'bg-accent-amber/10', border: 'border-accent-amber/30', labelKey: 'logPanel.type.code' },
  }), [])

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter(log => log.type === filter)

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
      style={collapsed ? { maxHeight: 40 } : { maxHeight }}
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
                  className={`
                    px-2.5 py-0.5 font-mono text-[10px] font-bold transition-all border
                    ${filter === f
                      ? 'border-paper/50 bg-paper/20 text-paper'
                      : 'border-transparent text-paper/50 hover:text-paper/80 hover:bg-paper/10'
                    }
                  `}
                >
                  {f === 'all' ? 'ALL' : t(typeConfig[f]?.labelKey || f)}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <span className="font-mono text-xs text-paper/60">
            {filteredLogs.length}
          </span>
          {!collapsed && (
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              aria-pressed={autoScroll}
              className={`
                font-mono text-[10px] font-bold px-2 py-0.5 border transition-colors
                ${autoScroll
                  ? 'border-paper/50 bg-paper/20 text-paper'
                  : 'border-paper/20 text-paper/40 hover:border-paper/40'
                }
              `}
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
              const config = typeConfig[log.type] || typeConfig.info
              return (
                <div
                  key={i}
                  className={`
                    flex gap-2 sm:gap-3 py-1.5 px-2 animate-slide-up rounded-sm
                    ${i % 2 === 0 ? 'bg-transparent' : 'bg-paper/5'}
                    border-l-2 ${config.border} hover:bg-paper/10 transition-colors
                  `}
                >
                  <span className="text-paper/40 w-20 shrink-0 text-xs hidden sm:block tabular-nums">
                    {log.time}
                  </span>
                  <span className="text-paper/40 w-20 shrink-0 text-xs sm:hidden tabular-nums">
                    {log.time.split(':').slice(1).join(':')}
                  </span>
                  <span className={`${config.color} shrink-0 font-bold text-xs`}>
                    <span className={`sm:hidden ${config.bg} px-1 rounded`}>{t(config.labelKey).charAt(0)}</span>
                    <span className={`hidden sm:inline ${config.bg} px-1.5 py-0.5 rounded text-[11px]`}>{t(config.labelKey)}</span>
                  </span>
                  <span className="text-paper/90 break-all text-xs leading-relaxed flex-1 min-w-0">
                    {log.message}
                  </span>
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
