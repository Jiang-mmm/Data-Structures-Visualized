import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { tStatic } from '../i18n/useI18n'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info'
  | 'ghost'
  | 'outline'

type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  isBusy?: boolean
  children: ReactNode
}

const baseClasses = `
  inline-flex items-center justify-center gap-1.5
  border-2 font-bold whitespace-nowrap
  shadow-button dark:shadow-button-dark
  transition-all duration-200 ease-out
  focus-ring
  active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
  disabled:cursor-not-allowed disabled:shadow-none
  disabled:active:translate-x-0 disabled:active:translate-y-0
  touch-manipulation
`

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm min-h-[32px] sm:min-h-[36px]',
  md: 'px-4 py-2 text-sm min-h-[40px]',
  lg: 'px-6 py-3 text-base min-h-[48px]',
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent border-accent text-accent-foreground shadow-hard-sm hover:brightness-90 hover:-translate-y-0.5 hover:shadow-hard-sm-hover dark:bg-dark-accent dark:border-dark-accent dark:text-dark-accent-foreground dark:shadow-hard-sm dark:hover:shadow-hard-sm-hover',
  secondary:
    'bg-surface border-border text-ink hover:bg-muted hover:-translate-y-0.5 dark:bg-dark-surface dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-muted',
  danger:
    'bg-accent-rose border-accent-rose text-accent-foreground hover:brightness-90 hover:-translate-y-0.5',
  success:
    'bg-accent-emerald border-accent-emerald text-accent-foreground hover:brightness-90 hover:-translate-y-0.5',
  warning:
    'bg-accent-amber border-accent-amber text-accent-foreground hover:brightness-90 hover:-translate-y-0.5',
  info:
    'bg-accent-blue border-accent-blue text-accent-foreground hover:brightness-90 hover:-translate-y-0.5',
  ghost:
    'bg-transparent border-transparent text-ink hover:bg-muted dark:text-dark-ink dark:hover:bg-dark-muted hover:-translate-y-0.5',
  outline:
    'bg-paper border-border text-ink hover:bg-muted hover:-translate-y-0.5 dark:bg-dark-paper dark:border-dark-border dark:text-dark-ink dark:hover:bg-dark-muted',
}

const disabledClasses = `
  disabled:bg-bg-disabled disabled:border-border-disabled disabled:text-text-disabled
  dark:disabled:bg-bg-disabled-dark dark:disabled:border-border-disabled-dark dark:disabled:text-text-disabled-dark
  disabled:grayscale-[0.5] disabled:opacity-60
`

function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      data-testid="button-spinner"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    isBusy = false,
    children,
    className = '',
    disabled,
    title: titleProp,
    ...rest
  },
  ref
) {
  const isBusyOrLoading = isLoading || isBusy
  const title = titleProp || (isBusyOrLoading ? tStatic('button.loading') : disabled ? tStatic('button.unavailable') : undefined)

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isBusyOrLoading || undefined}
      title={title}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabledClasses}
        ${isBusyOrLoading ? 'animate-pulse' : ''}
        ${className}
      `}
      {...rest}
    >
      {isLoading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  )
})

export default Button
export type { ButtonProps, ButtonVariant, ButtonSize }
