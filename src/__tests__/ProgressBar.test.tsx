import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProgressBar from '../components/ProgressBar'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('ProgressBar', () => {
  it('应该渲染 progressbar 角色', () => {
    render(<ProgressBar progress={50} />)
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('应该设置正确的 aria 属性', () => {
    render(<ProgressBar progress={75} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '75')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('应该限制进度在 0-100 范围内', () => {
    render(<ProgressBar progress={150} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('应该限制负数进度为 0', () => {
    render(<ProgressBar progress={-10} />)
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('应该使用自定义 label', () => {
    render(<ProgressBar progress={50} label="50%" />)
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('应该使用自定义高度', () => {
    const { container } = render(<ProgressBar progress={50} height="h-4" />)
    const bar = container.querySelector('.h-4')
    expect(bar).toBeInTheDocument()
  })

  it('应该使用默认高度 h-2', () => {
    const { container } = render(<ProgressBar progress={50} />)
    const bar = container.querySelector('.h-2')
    expect(bar).toBeInTheDocument()
  })
})
