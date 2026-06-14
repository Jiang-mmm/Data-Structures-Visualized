import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EmptyState from '../components/EmptyState'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('EmptyState', () => {
  it('应该渲染标题和描述', () => {
    render(<EmptyState title="测试标题" description="测试描述" />)
    expect(screen.getByText('测试标题')).toBeInTheDocument()
    expect(screen.getByText('测试描述')).toBeInTheDocument()
  })

  it('应该使用 titleKey 翻译标题', () => {
    render(<EmptyState titleKey="emptyState.emptyStackShort" />)
    expect(screen.getByText('emptyState.emptyStackShort')).toBeInTheDocument()
  })

  it('应该使用 descriptionKey 翻译描述', () => {
    render(<EmptyState descriptionKey="emptyState.emptyStackDesc" />)
    expect(screen.getByText('emptyState.emptyStackDesc')).toBeInTheDocument()
  })

  it('应该渲染图标', () => {
    const { container } = render(<EmptyState icon="▦" title="测试" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('应该在提供 onFill 时渲染按钮', () => {
    const onFill = vi.fn()
    render(<EmptyState title="测试" onFill={onFill} />)
    expect(screen.getByText('emptyState.fill')).toBeInTheDocument()
  })

  it('应该在未提供 onFill 时不渲染按钮', () => {
    render(<EmptyState title="测试" />)
    expect(screen.queryByText('emptyState.fill')).not.toBeInTheDocument()
  })

  it('点击 onFill 按钮应该调用回调', () => {
    const onFill = vi.fn()
    render(<EmptyState title="测试" onFill={onFill} />)
    fireEvent.click(screen.getByText('emptyState.fill'))
    expect(onFill).toHaveBeenCalledTimes(1)
  })

  it('应该使用自定义 fillKey', () => {
    const onFill = vi.fn()
    render(<EmptyState title="测试" onFill={onFill} fillKey="common.reset" />)
    expect(screen.getByText('common.reset')).toBeInTheDocument()
  })
})
