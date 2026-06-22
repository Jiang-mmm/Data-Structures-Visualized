import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatsOverlay from '../../components/StatsOverlay'

describe('StatsOverlay', () => {
  it('空数组时不渲染任何内容', () => {
    const { container } = render(<StatsOverlay stats={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('应该渲染统计项 label 与 value', () => {
    render(
      <StatsOverlay
        stats={[
          { label: 'FPS', value: 60 },
          { label: 'Nodes', value: 12 },
        ]}
      />
    )
    expect(screen.getByText('FPS')).toBeInTheDocument()
    expect(screen.getByText('60')).toBeInTheDocument()
    expect(screen.getByText('Nodes')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('应该应用自定义 className', () => {
    const { container } = render(
      <StatsOverlay stats={[{ label: 'A', value: 1 }]} className="custom-class" />
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('custom-class')
  })

  it('value 为字符串时也应正确显示', () => {
    render(<StatsOverlay stats={[{ label: 'Status', value: 'ready' }]} />)
    expect(screen.getByText('ready')).toBeInTheDocument()
  })

  it('应使用 accent-blue 字体颜色作为默认色', () => {
    render(
      <StatsOverlay stats={[{ label: 'A', value: 1 }]} />
    )
    const valueSpan = screen.getByText('1')
    expect(valueSpan.className).toContain('text-accent-blue')
  })

  it('提供 color 时应内联覆盖默认色', () => {
    render(
      <StatsOverlay
        stats={[{ label: 'A', value: 1, color: '#ff0000' }]}
      />
    )
    const valueSpan = screen.getByText('1')
    expect(valueSpan.style.color).toBe('rgb(255, 0, 0)')
  })
})
