import { memo, ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: string
  children?: ReactNode
}

function PageHeader({ title, subtitle, icon, children }: PageHeaderProps) {
  return (
    <header className="bg-white/95 dark:bg-slate/95 backdrop-blur-sm border-b-2 border-ink dark:border-dark-border px-4 sm:px-6 py-3.5 sm:py-5 page-header">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          {icon && (
            <div className="w-11 h-11 sm:w-13 sm:h-13 border-2 border-ink dark:border-dark-border bg-gradient-to-br from-paper to-paper-warm dark:from-slate dark:to-slate-light flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#1a1a2e] dark:shadow-[3px_3px_0px_#334155] transition-transform duration-200 hover:scale-105">
              <span className="text-xl sm:text-2xl">{icon}</span>
            </div>
          )}
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
