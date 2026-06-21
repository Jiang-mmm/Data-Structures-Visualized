import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import PerformanceIndicator from '../../components/PerformanceIndicator'
import { renderWithRouter, mockUseGlobalSettings } from '../pages/testUtils'

vi.mock('../../hooks/useGlobalSettings')

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

describe('PerformanceIndicator', () => {
  beforeEach(() => {
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
  })

  it('数据量低于阈值时返回 null', () => {
    const { container } = renderWithRouter(<PerformanceIndicator visualizerKey="array" dataLength={10} />)
    expect(container.firstChild).toBeNull()
  })

  it('数据量超过阈值时渲染徽章', () => {
    const { container } = renderWithRouter(<PerformanceIndicator visualizerKey="array" dataLength={60} />)
    expect(container.firstChild).not.toBeNull()
    expect(screen.getByText('performance.mode')).toBeInTheDocument()
  })

  it('应显示 i18n 文本', () => {
    renderWithRouter(<PerformanceIndicator visualizerKey="sort" dataLength={50} />)
    const badge = screen.getByText('performance.mode')
    expect(badge).toBeInTheDocument()
    expect(badge.getAttribute('title')).toBe('performance.hint')
  })

  it('应具有 role=status 和 aria-live=polite', () => {
    renderWithRouter(<PerformanceIndicator visualizerKey="array" dataLength={60} />)
    const badge = screen.getByRole('status')
    expect(badge).toHaveAttribute('aria-live', 'polite')
  })

  it('sort 阈值（30）边界测试', () => {
    // 低于阈值：不渲染
    const { container: belowContainer } = renderWithRouter(<PerformanceIndicator visualizerKey="sort" dataLength={29} />)
    expect(belowContainer.firstChild).toBeNull()

    // 等于阈值：渲染
    const { container: atContainer } = renderWithRouter(<PerformanceIndicator visualizerKey="sort" dataLength={30} />)
    expect(atContainer.firstChild).not.toBeNull()
  })
})
