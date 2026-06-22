import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AnimationDelayIndicator from '../../components/AnimationDelayIndicator'

vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('AnimationDelayIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染默认 message（来自 i18n）', () => {
    render(<AnimationDelayIndicator />)
    expect(screen.getByText('tree.animationStarting')).toBeInTheDocument()
  })

  it('应该使用自定义 message 覆盖默认文案', () => {
    render(<AnimationDelayIndicator message="自定义提示" />)
    expect(screen.getByText('自定义提示')).toBeInTheDocument()
  })

  it('应具有 status role 与 polite aria-live', () => {
    render(<AnimationDelayIndicator />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
  })

  it('外层容器应使用 pointer-events-none 以避免拦截点击', () => {
    const { container } = render(<AnimationDelayIndicator />)
    const outer = container.firstChild as HTMLElement
    expect(outer.className).toContain('pointer-events-none')
  })
})
