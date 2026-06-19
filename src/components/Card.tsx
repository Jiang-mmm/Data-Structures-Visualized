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

/**
 * 使用 !important 确保在 dark 模式下，分组强调色能压住
 * `dark:border-dark-border`（双类选择器，优先级更高）的全边框色。
 */
const accentBorderClass: Record<CardAccent, string> = {
  blue: '!border-t-card-group-linear',
  amber: '!border-t-card-group-tree',
  red: '!border-t-card-group-graph',
}

/**
 * 渐变类名映射：使用卡片分组语义 token，
 * 颜色随当前主题（default/forest/warm/royal）动态变化。
 */
const gradientClass: Record<CardAccent, string> = {
  blue: 'bg-gradient-to-br from-card-group-linear/10 to-card-group-linear/5 dark:from-card-group-linear/20 dark:to-card-group-linear/10',
  amber: 'bg-gradient-to-br from-card-group-tree/10 to-card-group-tree/5 dark:from-card-group-tree/20 dark:to-card-group-tree/10',
  red: 'bg-gradient-to-br from-card-group-graph/10 to-card-group-graph/5 dark:from-card-group-graph/20 dark:to-card-group-graph/10',
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
