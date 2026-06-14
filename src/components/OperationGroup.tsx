import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface OperationGroupProps {
  children: ReactNode
  label?: string
  defaultOpen?: boolean
  className?: string
}

function OperationGroup({
  children,
  label,
  defaultOpen = false,
  className = '',
}: OperationGroupProps) {
  const { t } = useGlobalSettings()
  const resolvedLabel = label ?? t('common.more')
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>(0)
  const [maxHeight, setMaxHeight] = useState(defaultOpen ? 'none' : '0px')
  const [shouldRender, setShouldRender] = useState(defaultOpen)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!contentRef.current) return
    if (isOpen) {
      // Only animate open if not already fully open ('none')
      if (maxHeight !== 'none') {
        setMaxHeight(`${contentRef.current.scrollHeight}px`)
        const timer = setTimeout(() => setMaxHeight('none'), 200)
        return () => clearTimeout(timer)
      }
    } else {
      if (maxHeight === 'none') {
        setMaxHeight(`${contentRef.current.scrollHeight}px`)
        rafRef.current = requestAnimationFrame(() => {
          setMaxHeight('0px')
        })
      } else if (maxHeight !== '0px') {
        setMaxHeight('0px')
        const timer = setTimeout(() => setShouldRender(false), 200)
        return () => clearTimeout(timer)
      }
    }
    return () => cancelAnimationFrame(rafRef.current)
  }, [isOpen, maxHeight, shouldRender])

  const toggle = useCallback(() => setIsOpen(prev => !prev), [])

  return (
    <div className={`inline-flex flex-wrap items-center gap-2 sm:gap-3 ${className}`}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className={`
          font-mono text-[11px] font-bold px-2 py-1 min-h-[44px]
          touch-manipulation select-none
          border-2 border-ink dark:border-dark-border
          shadow-button dark:shadow-button-dark
          hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
          hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
          active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
          transition-all duration-200
        `}
      >
        {resolvedLabel} {isOpen ? '▾' : '▸'}
      </button>

      {shouldRender && (
        <div
          ref={contentRef}
          data-state={isOpen ? 'open' : 'closed'}
          style={{
            maxHeight,
            overflow: 'hidden',
            transition: 'max-height 200ms ease-in-out',
          }}
          className="contents-wrapper inline-flex flex-wrap items-center gap-2 sm:gap-3"
        >
          {children}
        </div>
      )}
    </div>
  )
}

export default OperationGroup
