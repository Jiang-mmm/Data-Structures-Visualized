import { memo, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate border-b-2 border-ink dark:border-dark-border px-4 sm:px-6 py-2 sm:py-3 page-header">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-ink dark:text-dark-ink tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-ink-light dark:text-dark-ink-light mt-1 font-mono tracking-wide">
              {subtitle}
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
