import { memo, useState, useId, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import Button, { type ButtonVariant } from './Button'

interface OperationBarProps {
  label?: string
  children: ReactNode
  className?: string
  collapsibleOnMobile?: boolean
}

interface OperationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  popAnimation?: boolean
  isLoading?: boolean
  isBusy?: boolean
  icon?: ReactNode
  children: ReactNode
  className?: string
  disabledReason?: string
}

interface OperationInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  type?: string
  className?: string
  'aria-label'?: string
  error?: boolean
}

interface OperationLabelProps {
  children: ReactNode
}

interface OperationInfoProps {
  children: ReactNode
}

function OperationBar({ children, className = '', collapsibleOnMobile = false }: OperationBarProps) {
  const { t } = useGlobalSettings()
  // 移动端默认收起，节省垂直空间
  const [isCollapsed, setIsCollapsed] = useState(true)
  const contentId = 'operation-bar-content'
  const isContentHidden = collapsibleOnMobile && isCollapsed

  return (
    <div
      role="toolbar"
      aria-label={t('page.operations')}
      className={`
        bg-muted dark:bg-dark-muted border-b border-ink/30 dark:border-dark-border/40
        px-3 sm:px-6 py-1.5 sm:py-2.5
        operation-bar
        ${className}
      `}
    >
      {collapsibleOnMobile && (
        <button
          type="button"
          onClick={() => setIsCollapsed(prev => !prev)}
          aria-expanded={!isCollapsed}
          aria-controls={contentId}
          title={isCollapsed ? t('page.expand') : t('page.collapse')}
          className={`
            sm:hidden mb-1.5
            font-mono text-xs font-bold px-2 py-1 min-h-[44px]
            touch-manipulation select-none
            border-2 border-ink/30 dark:border-dark-border/40
            shadow-button dark:shadow-button-dark
            bg-transparent
            hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper
            hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            transition-all duration-200
            inline-flex items-center gap-1
          `}
        >
          <span aria-hidden="true">{isCollapsed ? '▸' : '▾'}</span>
          <span>{t('page.operations')}</span>
        </button>
      )}
      <div
        id={collapsibleOnMobile ? contentId : undefined}
        className={`
          items-center gap-1.5 min-h-[44px]
          overflow-x-auto scrollbar-thin flex-nowrap
          sm:flex-wrap sm:overflow-x-visible sm:gap-2
          operation-bar-scroll-hint
          ${isContentHidden ? 'hidden sm:flex' : 'flex'}
        `}
      >
        {children}
      </div>
    </div>
  )
}

export const OperationDivider = memo(() => (
  <div className="w-px h-6 bg-ink/10 dark:bg-dark-ink/10 mx-0.5 shrink-0" />
))

export default memo(OperationBar)

export const OperationInput = memo(({ value, onChange, placeholder, type = 'text', className = '', 'aria-label': ariaLabel, error }: OperationInputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label={ariaLabel || placeholder}
      aria-invalid={error || undefined}
      className={`
        w-20 sm:w-24 px-2.5 py-1.5 text-sm font-mono whitespace-nowrap shrink-0
        border-2 bg-paper dark:bg-dark-paper
        outline-none rounded-none
        text-ink dark:text-dark-ink
        placeholder:text-text-placeholder dark:placeholder:text-text-placeholder-dark
        hover:border-ink dark:hover:border-dark-ink
        transition-all duration-200
        touch-manipulation
        ${error
          ? 'border-accent-rose dark:border-accent-rose focus:border-accent-rose focus-ring'
          : 'border-ink/80 dark:border-dark-border focus:border-accent-blue focus-ring'
        }
        ${className}
      `}
    />
  )
})


export const OperationButton = memo(({
  onClick,
  disabled,
  variant = 'primary',
  popAnimation = false,
  isLoading = false,
  isBusy,
  icon,
  children,
  className = '',
  disabledReason,
  'aria-busy': ariaBusyProp,
  'aria-disabled': ariaDisabledProp,
  'aria-describedby': ariaDescribedbyProp,
  title: titleProp,
  ...rest
}: OperationButtonProps) => {
  const { t } = useGlobalSettings()
  const reasonId = useId()
  // 禁用原因文本：优先使用自定义原因，其次回退到动画进行中的国际化文案
  const reasonText = disabledReason || (isBusy ? t('page.animating') : undefined)
  const showReason = (disabled || isBusy) && reasonText

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (popAnimation && !disabled && !isLoading) {
      const btn = e.currentTarget
      btn.classList.add('animate-[button-pop_0.35s_ease-out]')
      btn.addEventListener('animationend', () => {
        btn.classList.remove('animate-[button-pop_0.35s_ease-out]')
      }, { once: true })
    }
    onClick?.(e)
  }

  const ariaBusy = isBusy || ariaBusyProp || isLoading || undefined
  const ariaDisabled = ariaDisabledProp || (disabled ? true : undefined)
  const title = titleProp || (showReason ? reasonText : undefined)

  return (
    <>
      <Button
        variant={variant}
        size="sm"
        isLoading={isLoading}
        isBusy={isBusy}
        disabled={disabled}
        onClick={handleClick}
        className={className}
        aria-busy={ariaBusy}
        aria-disabled={ariaDisabled}
        aria-describedby={ariaDescribedbyProp || (showReason ? reasonId : undefined)}
        title={title}
        {...rest}
      >
        {icon && <span className="inline-flex items-center justify-center">{icon}</span>}
        {children}
      </Button>
      {showReason && (
        <span id={reasonId} className="sr-only">
          {reasonText}
        </span>
      )}
    </>
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
