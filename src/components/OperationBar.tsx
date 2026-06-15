import { memo, ReactNode, ButtonHTMLAttributes } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface OperationBarProps {
  label?: string
  children: ReactNode
  className?: string
}

interface OperationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'danger' | 'success' | 'warning' | 'purple' | 'teal' | 'accent' | 'blue'
  popAnimation?: boolean
  children: ReactNode
  className?: string
}

interface OperationInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  'aria-label'?: string
}

interface OperationLabelProps {
  children: ReactNode
}

interface OperationInfoProps {
  children: ReactNode
}

function OperationBar({ children, className = '' }: OperationBarProps) {
  const { t } = useGlobalSettings()
  return (
    <div
      role="toolbar"
      aria-label={t('page.operations')}
      className={`
        bg-white dark:bg-slate border-b-2 border-ink dark:border-dark-border
        px-3 sm:px-6 py-2.5 sm:py-3.5
        operation-bar operation-bar-scroll-hint
        ${className}
      `}
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-h-[44px]">
        {children}
      </div>
    </div>
  )
}

export const OperationDivider = memo(() => (
  <div className="w-px h-6 bg-ink/10 dark:bg-dark-ink/10 mx-0.5 shrink-0" />
))

export default memo(OperationBar)

export const OperationInput = memo(({ value, onChange, placeholder, type = 'text', className = '', 'aria-label': ariaLabel }: OperationInputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label={ariaLabel || placeholder}
      className={`
        w-20 sm:w-24 px-2.5 py-1.5 text-sm font-mono whitespace-nowrap shrink-0
        border-2 border-ink/80 dark:border-dark-border bg-paper dark:bg-slate
        outline-none rounded-none
        text-ink dark:text-dark-ink
        placeholder:text-ink-light/30 dark:placeholder:text-dark-ink-light/30
        focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(37,99,235,0.12)]
        hover:border-ink dark:hover:border-dark-ink
        transition-all duration-200
        touch-manipulation
        ${className}
      `}
    />
  )
})

export const OperationButton = memo(({ onClick, disabled, variant = 'primary', popAnimation = false, children, className = '', ...rest }: OperationButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick && !disabled) {
      const btn = e.currentTarget
      if (popAnimation) {
        btn.classList.add('animate-[button-pop_0.35s_ease-out]')
        btn.addEventListener('animationend', () => {
          btn.classList.remove('animate-[button-pop_0.35s_ease-out]')
        }, { once: true })
      }
      onClick(e)
    }
  }

  const variants: Record<string, string> = {
    primary: 'bg-accent-blue border-accent-blue text-paper hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
    success: 'bg-accent-emerald border-accent-emerald text-paper hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
    danger: 'bg-accent-rose border-accent-rose text-paper hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
    warning: 'bg-accent-amber border-accent-amber text-paper hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
    purple: 'bg-accent-violet border-accent-violet text-paper hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
    teal: 'bg-accent-teal border-accent-teal text-paper hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
    outline: 'bg-white dark:bg-slate border-ink/60 dark:border-dark-border text-ink dark:text-dark-ink hover:bg-paper-warm dark:hover:bg-slate-light hover:border-ink dark:hover:border-dark-ink hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover',
  }

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0
        border-2
        shadow-button dark:shadow-button-dark
        transition-all duration-200 ease-out
        active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-button dark:disabled:active:shadow-button-dark
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {children}
    </button>
  )
})

export const OperationLabel = memo(({ children }: OperationLabelProps) => (
  <span className="text-xs font-mono font-bold text-ink-light dark:text-dark-ink-light uppercase tracking-wide whitespace-nowrap shrink-0">
    {children}
  </span>
))

export const OperationInfo = memo(({ children }: OperationInfoProps) => (
  <div className="ml-auto flex items-center gap-2">
    {children}
  </div>
))

export type {
  OperationBarProps,
  OperationButtonProps,
  OperationInputProps,
  OperationLabelProps,
  OperationInfoProps
}