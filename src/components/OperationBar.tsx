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
        px-3 sm:px-6 py-2 sm:py-3
        operation-bar operation-bar-scroll-hint
        ${className}
      `}
    >
      <div className="flex flex-wrap sm:flex-wrap items-center gap-2 sm:gap-3 min-h-[44px]">
        {children}
      </div>
    </div>
  )
}

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
        w-24 sm:w-24 px-2 sm:px-3 py-2 sm:py-2 text-sm font-mono
        border-2 border-ink dark:border-dark-border bg-paper dark:bg-slate
        outline-none
        text-ink dark:text-dark-ink
        placeholder:text-ink-light/40 dark:placeholder:text-dark-ink-light/40
        focus:border-accent-blue focus:shadow-[0_0_0_2px_rgba(37,99,235,0.15)]
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
    primary: 'bg-accent-blue border-accent-blue text-paper hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    success: 'bg-accent-emerald border-accent-emerald text-paper hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    danger: 'bg-accent-rose border-accent-rose text-paper hover:bg-rose-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    warning: 'bg-accent-amber border-accent-amber text-paper hover:bg-amber-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    purple: 'bg-accent-violet border-accent-violet text-paper hover:bg-violet-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    teal: 'bg-accent-teal border-accent-teal text-paper hover:bg-teal-700 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
    outline: 'bg-white dark:bg-slate border-ink dark:border-dark-border text-ink dark:text-dark-ink hover:bg-paper-warm dark:hover:bg-slate-light hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]',
  }

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold
        border-2
        shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
        transition-all duration-200
        active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[2px_2px_0px_#1a1a2e] dark:disabled:active:shadow-[2px_2px_0px_#334155]
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {children}
    </button>
  )
})

export const OperationLabel = memo(({ children }: OperationLabelProps) => (
  <span className="text-xs font-mono font-bold text-ink-light dark:text-dark-ink-light uppercase tracking-wide">
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