import { memo, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const subtitleParts = subtitle ? subtitle.split('·').map(s => s.trim()).filter(Boolean) : []

  return (
    <header className="bg-surface dark:bg-dark-surface border-b-2 border-ink dark:border-dark-border px-4 sm:px-6 py-2 sm:py-3 page-header">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink dark:text-dark-ink tracking-tight leading-tight">
            {title}
          </h1>
          {subtitleParts.length > 0 && (
            <p className="text-xs sm:text-sm text-ink-light dark:text-dark-ink-light mt-1.5 font-mono tracking-wide flex items-center gap-2">
              {subtitleParts.map((part, i) => (
                <span key={i} className="flex items-center gap-2">
                  {i > 0 && (
                    <span className="w-1 h-1 rounded-full bg-ink/25 dark:bg-dark-ink/25 flex-shrink-0" />
                  )}
                  <span>{part}</span>
                </span>
              ))}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 page-header-actions">
            {children}
          </div>
        )}
      </div>
    </header>
  )
}

export default memo(PageHeader)
