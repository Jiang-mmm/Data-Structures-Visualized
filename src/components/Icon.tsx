import { memo, type SVGProps } from 'react'

export type IconName =
  | 'keyboard'
  | 'close'
  | 'check'
  | 'search'
  | 'play'
  | 'chevronDown'
  | 'chevronRight'
  | 'chevronLeft'

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
  size?: number
  'aria-hidden'?: boolean
}

// 每个图标的 SVG path 数据（24x24 viewBox，stroke 风格，参考 Feather/Lucide）
const ICON_PATHS: Record<IconName, string> = {
  keyboard: 'M2 6h20v12H2z M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8',
  close: 'M6 6l12 12M6 18L18 6',
  check: 'M5 12l5 5L20 7',
  search: 'M11 4a7 7 0 100 14 7 7 0 000-14z M21 21l-6-6',
  play: 'M7 4l13 8-13 8V4z',
  chevronDown: 'M6 9l6 6 6-6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
}

/**
 * Lightweight SVG icon component.
 * Stroke-based icons (Feather/Lucide style) for consistent rendering across platforms.
 */
const Icon = memo(function Icon({ name, size = 16, 'aria-hidden': ariaHidden, ...rest }: IconProps) {
  const path = ICON_PATHS[name]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden ?? true}
      {...rest}
    >
      <path d={path} />
    </svg>
  )
})

export default Icon
