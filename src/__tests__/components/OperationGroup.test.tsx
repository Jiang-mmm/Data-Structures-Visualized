import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OperationGroup from '../../components/OperationGroup'
import { mockUseGlobalSettings } from '../pages/testUtils'

vi.mock('../../hooks/useGlobalSettings')

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

describe('OperationGroup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
  })

  it('触发按钮不应使用 dashed 边框', () => {
    render(
      <OperationGroup label="更多">
        <button>操作</button>
      </OperationGroup>
    )

    const trigger = screen.getByText(/更多/)
    expect(trigger.className).not.toContain('border-dashed')
    expect(trigger.className).toContain('border-2')
  })

  it('点击触发按钮可展开并渲染子元素', () => {
    render(
      <OperationGroup label="更多">
        <button>操作一</button>
        <button>操作二</button>
      </OperationGroup>
    )

    const trigger = screen.getByText(/更多/)
    expect(screen.queryByText('操作一')).not.toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('操作一')).toBeInTheDocument()
    expect(screen.getByText('操作二')).toBeInTheDocument()
  })

  it('展开时触发按钮背景应发生变化', () => {
    render(
      <OperationGroup label="更多">
        <button>操作</button>
      </OperationGroup>
    )

    const trigger = screen.getByText(/更多/)
    const closedBg = trigger.className
    fireEvent.click(trigger)
    const openBg = trigger.className
    expect(openBg).not.toBe(closedBg)
  })
})
