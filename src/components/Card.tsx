import { type ReactNode } from 'react'

type CardVariant = 'default' | 'muted' | 'accent'

type CardShadow = 'none' | 'sm' | 'md' | 'lg' | 'hover'

type CardRadius = 'none' | 'sm' | 'md' | 'full'

type CardAccent = 'blue' | 'amber' | 'red'

interface CardProps {
  variant?: CardVariant
  shadow?: CardShadow
  radius?: CardRadius
  accent?: CardAccent
  gradient?: boolean
  children: ReactNode
  className?: string
}

const accentBorderClass: Record<CardAccent, string> = {
  blue: 'border-t-accent-blue',
  amber: 'border-t-accent-amber',
  red: 'border-t-accent-rose',
}

/**
 * 渐变类名映射：使用主题感知的 accent token，
 * 颜色随当前主题（default/forest/warm/royal）动态变化。
 */
const gradientClass: Record<CardAccent, string> = {
  blue: 'bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 dark:from-accent-blue/20 dark:to-accent-blue/10',
  amber: 'bg-gradient-to-br from-accent-amber/10 to-accent-amber/5 dark:from-accent-amber/20 dark:to-accent-amber/10',
  red: 'bg-gradient-to-br from-accent-rose/10 to-accent-rose/5 dark:from-accent-rose/20 dark:to-accent-rose/10',
}

const variantClass: Record<CardVariant, string> = {
  default: 'bg-surface dark:bg-dark-surface border-border dark:border-dark-border',
  muted: 'bg-muted dark:bg-dark-muted border-border-subtle dark:border-dark-border-subtle',
  accent: 'bg-surface dark:bg-dark-surface border-border dark:border-dark-border',
}

const shadowClass: Record<CardShadow, string> = {
  none: 'shadow-none',
  sm: 'shadow-hard-sm dark:shadow-button-dark hover:shadow-hard-sm-hover dark:hover:shadow-button-dark-hover',
  md: 'shadow-hard-md dark:shadow-card-dark hover:shadow-hard-md-hover dark:hover:shadow-card-dark-hover',
  lg: 'shadow-hard-lg dark:shadow-card-dark hover:shadow-hard-lg-hover dark:hover:shadow-card-dark-hover',
  hover: 'shadow-none hover:shadow-hard-md dark:hover:shadow-card-dark-hover',
}

const radiusClass: Record<CardRadius, string> = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
}

function Card({
  variant = 'default',
  shadow = 'md',
  radius = 'none',
  accent = 'blue',
  gradient = false,
  children,
  className = '',
}: CardProps) {
  const isAccent = variant === 'accent'
  const accentBorder = accentBorderClass[accent]
  const gradientBg = gradient ? gradientClass[accent] : ''

  return (
    <div
      className={`
        border-2 p-5
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        ${variantClass[variant]}
        ${shadowClass[shadow]}
        ${radiusClass[radius]}
        ${isAccent ? `border-t-4 ${accentBorder}` : ''}
        ${gradientBg}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export default Card
export type { CardProps, CardVariant, CardShadow, CardRadius, CardAccent }
