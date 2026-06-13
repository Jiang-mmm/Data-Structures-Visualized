import { useState, useRef, useEffect, useMemo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface LogPanelProps {
  logs: Array<{ time: string; type: string; message: string }>
  maxHeight?: number
}

export default function LogPanel({ logs = [], maxHeight = 208 }: LogPanelProps) {
  const [filter, setFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { t } = useGlobalSettings()

  const typeConfig = useMemo(() => ({
    oper: { color: 'text-accent-blue', labelKey: 'logPanel.type.oper' },
    info: { color: 'text-accent-emerald', labelKey: 'logPanel.type.info' },
    error: { color: 'text-accent-rose', labelKey: 'logPanel.type.error' },
    code: { color: 'text-accent-amber', labelKey: 'logPanel.type.code' },
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

  return (
    <div className="bg-ink/95 dark:bg-dark-paper/95 backdrop-blur-sm text-paper flex flex-col log-panel" style={{ maxHeight }}>
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate/80 border-b border-slate-light/20">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-80">
            ▸ {t('logPanel.title')}
          </span>
          <div className="flex gap-0.5">
            {['all', 'oper', 'code', 'info', 'error'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                aria-pressed={filter === f}
                className={`
                  px-2.5 py-0.5 font-mono text-[10px] font-bold transition-all border
                  ${filter === f
                    ? 'border-paper/40 bg-paper/15 text-paper'
                    : 'border-transparent text-paper/50 hover:text-paper/80 hover:bg-paper/5'
                  }
                `}
              >
                {f === 'all' ? 'ALL' : t(typeConfig[f]?.labelKey || f)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-paper/40">
            {filteredLogs.length}
          </span>
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            aria-pressed={autoScroll}
            className={`
              font-mono text-[10px] font-bold px-2 py-0.5 border transition-colors
              ${autoScroll
                ? 'border-accent-blue/50 bg-accent-blue/20 text-accent-blue'
                : 'border-paper/20 text-paper/40 hover:border-paper/40'
              }
            `}
          >
            {autoScroll ? t('logPanel.autoScroll') : t('logPanel.freeze')}
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-label={t('logPanel.title')}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm space-y-0.5 scrollbar-thin"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-paper/25 text-center py-6 text-xs tracking-wide">
            ── {t('logPanel.noLogs')} ──
          </div>
        ) : (
          filteredLogs.map((log, i) => {
            const config = typeConfig[log.type] || typeConfig.info
            return (
              <div
                key={i}
                className={`
                  flex gap-2 sm:gap-3 py-1 px-2 animate-slide-up
                  border-l-2 border-transparent hover:border-paper/10
                `}
              >
                <span className="text-paper/25 w-20 shrink-0 text-xs hidden sm:block">
                  {log.time}
                </span>
                <span className="text-paper/25 w-20 shrink-0 text-xs sm:hidden">
                  {log.time.split(':').slice(1).join(':')}
                </span>
                <span className={`${config.color} shrink-0 font-bold text-xs`}>
                  <span className="sm:hidden">[{t(config.labelKey).charAt(0)}]</span>
                  <span className="hidden sm:inline">[{t(config.labelKey)}]</span>
                </span>
                <span className="text-paper/80 break-all text-xs leading-relaxed flex-1 min-w-0">
                  {log.message}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
