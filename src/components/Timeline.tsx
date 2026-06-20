import { memo, useRef, useCallback, useState, useEffect } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

const ICONS: Record<string, string> = {
  insert: '+',
  delete: '−',
  push: '+',
  pop: '−',
  enqueue: '+',
  dequeue: '−',
  search: '◎',
  reset: '↺',
  randomize: '⟳',
  swap: '⇄',
  undo: '↩',
  redo: '↪',
  default: '•',
}

const TYPE_COLORS: Record<string, string> = {
  oper: 'border-accent-blue',
  info: 'border-accent-emerald',
  error: 'border-accent-rose',
  code: 'border-accent-violet',
  default: 'border-border',
}

function getOperationIcon(type: string): string {
  if (!type) return ICONS.default
  const lower = type.toLowerCase()
  for (const [key, icon] of Object.entries(ICONS)) {
    if (lower.includes(key)) return icon
  }
  return ICONS.default
}

function getTypeColor(type: string): string {
  if (!type) return TYPE_COLORS.default
  const lower = type.toLowerCase()
  for (const [key, color] of Object.entries(TYPE_COLORS)) {
    if (lower.includes(key)) return color
  }
  return TYPE_COLORS.default
}

interface TimelineEntry {
  type: string
  description: string
}

interface TimelineItemProps {
  entry: TimelineEntry
  index: number
  isCurrent: boolean
  onClick: () => void
  clickable?: boolean
}

function TimelineItem({ entry, index, isCurrent, onClick, clickable = true }: TimelineItemProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const icon = getOperationIcon(entry.type)
  const typeColor = getTypeColor(entry.type)
  const itemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isCurrent && itemRef.current && typeof itemRef.current.scrollIntoView === 'function') {
      itemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [isCurrent])

  return (
    <div className="relative" ref={itemRef}>
      <div
        onClick={clickable ? onClick : undefined}
        onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.() } } : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        className={`
          flex items-center gap-2 px-2 py-1.5 text-xs font-mono
          border-2 transition-all duration-200 w-full text-left
          ${clickable ? 'cursor-pointer' : 'cursor-default'}
          ${isCurrent
            ? 'border-ink dark:border-dark-border bg-accent-blue text-paper shadow-button dark:shadow-button-dark'
            : `${typeColor} bg-surface dark:bg-dark-surface text-ink-light ${clickable ? 'hover:bg-paper' : ''}`
          }
        `}
      >
        <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-sm font-bold">
          {icon}
        </span>
        <span className="truncate flex-1">{entry.description}</span>
        <span className="text-[10px] opacity-60 flex-shrink-0">{index}</span>
      </div>
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
          <div className="bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper px-3 py-2 border-2 border-ink dark:border-dark-border shadow-card dark:shadow-card-dark min-w-[160px] max-w-[240px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{icon}</span>
              <span className="font-bold text-xs">{entry.type}</span>
              <span className="text-[10px] opacity-60 ml-auto">#{index}</span>
            </div>
            <div className="text-[11px] opacity-80 leading-relaxed">{entry.description}</div>
            {isCurrent && (
              <div className="mt-1 pt-1 border-t border-paper/20 dark:border-dark-paper/20">
                <span className="text-[10px] text-accent-emerald font-bold">● CURRENT</span>
              </div>
            )}
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-ink dark:border-t-dark-ink" />
        </div>
      )}
    </div>
  )
}

interface TimelineProps {
  history: TimelineEntry[]
  currentIndex: number
  onJump?: (index: number) => void
  maxHeight?: string
}

function Timeline({ history, currentIndex, onJump, maxHeight = 'h-32' }: TimelineProps) {
  const clickable = !!onJump
  const { t } = useGlobalSettings()
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleJump = useCallback((index: number) => {
    onJump?.(index)
  }, [onJump])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!history || history.length === 0) return
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault()
      handleJump(currentIndex - 1)
    } else if (e.key === 'ArrowRight' && currentIndex < history.length - 1) {
      e.preventDefault()
      handleJump(currentIndex + 1)
    }
  }, [history, currentIndex, handleJump])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!history || history.length === 0) {
    return (
      <div className={`${maxHeight} bg-ink text-paper flex items-center justify-center px-4`}>
        <span className="font-mono text-xs text-paper/40 tracking-wide">
          {t('timeline.noHistory')}
        </span>
      </div>
    )
  }

  return (
    <div className={`${maxHeight} bg-ink text-paper flex flex-col`}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate border-b border-slate-light/30">
        <span className="font-mono text-xs font-bold tracking-widest uppercase opacity-80">
          {t('timeline.title')}
        </span>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-paper/40">
            {currentIndex + 1} / {history.length}
          </span>
          <div className="flex items-center gap-1 text-paper/30">
            <span className="text-[10px]">←→</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        className="flex-1 overflow-x-auto overflow-y-hidden px-3 py-2 space-x-2 scrollbar-thin outline-none focus:ring-1 focus:ring-accent-blue/30"
      >
        <div className="flex items-center gap-2 min-w-max">
          {history.map((entry, i) => (
            <TimelineItem
              key={i}
              entry={entry}
              index={i}
              isCurrent={i === currentIndex}
              onClick={() => handleJump(i)}
              clickable={clickable}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(Timeline)