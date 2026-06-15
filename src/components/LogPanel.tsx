import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface LogPanelProps {
  logs: Array<{ time: string; type: string; message: string }>
  maxHeight?: number
}

export default function LogPanel({ logs = [], maxHeight = 208 }: LogPanelProps) {
  const [filter, setFilter] = useState<string>('all')
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const [collapsed, setCollapsed] = useState<boolean>(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { t } = useGlobalSettings()

  const toggleCollapsed = useCallback(() => setCollapsed(c => !c), [])

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

  if (logs.length === 0 && collapsed) return null

  return (
    <div
      className="bg-slate-800 dark:bg-slate-900 text-paper flex flex-col log-panel transition-all duration-200"
      style={collapsed ? { maxHeight: 40 } : { maxHeight }}
    >
      <button
        onClick={toggleCollapsed}
        className="flex items-center justify-between px-4 py-2 bg-slate-700/80 dark:bg-slate-800/80 border-b border-slate-600/30 w-full text-left hover:bg-slate-700 transition-colors"
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
                      ? 'border-slate-400/40 bg-slate-600/50 text-paper'
                      : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
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
          <span className="font-mono text-[10px] text-slate-400">
            {filteredLogs.length}
          </span>
          {!collapsed && (
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              aria-pressed={autoScroll}
              className={`
                font-mono text-[10px] font-bold px-2 py-0.5 border transition-colors
                ${autoScroll
                  ? 'border-accent-blue/50 bg-accent-blue/20 text-accent-blue'
                  : 'border-slate-600/40 text-slate-500 hover:border-slate-500/60'
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
            <div className="text-slate-600 text-center py-6 text-xs tracking-wide">
              ── {t('logPanel.noLogs')} ──
            </div>
          ) : (
            filteredLogs.map((log, i) => {
              const config = typeConfig[log.type] || typeConfig.info
              return (
                <div
                  key={i}
                  className={`
                    flex gap-2 sm:gap-3 py-1.5 px-2 animate-slide-up
                    ${i % 2 === 0 ? 'bg-slate-800/0' : 'bg-slate-700/20'}
                    border-l-2 border-transparent hover:border-slate-500/40
                  `}
                >
                  <span className="text-slate-600 w-20 shrink-0 text-xs hidden sm:block">
                    {log.time}
                  </span>
                  <span className="text-slate-600 w-20 shrink-0 text-xs sm:hidden">
                    {log.time.split(':').slice(1).join(':')}
                  </span>
                  <span className={`${config.color} shrink-0 font-bold text-xs opacity-80`}>
                    <span className="sm:hidden">[{t(config.labelKey).charAt(0)}]</span>
                    <span className="hidden sm:inline">[{t(config.labelKey)}]</span>
                  </span>
                  <span className="text-slate-300 break-all text-xs leading-relaxed flex-1 min-w-0">
                    {log.message}
                  </span>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
