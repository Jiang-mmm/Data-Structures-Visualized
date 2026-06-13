import { memo, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  children?: ReactNode
}

function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <header className="bg-white dark:bg-slate border-b-2 border-ink dark:border-dark-border px-3 sm:px-6 py-3 sm:py-5 page-header">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {icon && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-ink dark:border-dark-border bg-paper dark:bg-slate flex items-center justify-center shrink-0 shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]">
              <span className="text-xl sm:text-2xl">{icon}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-ink dark:text-dark-ink tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-ink-light dark:text-dark-ink-light mt-0.5 font-mono">
                {subtitle}
              </p>
            )}
          </div>
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
