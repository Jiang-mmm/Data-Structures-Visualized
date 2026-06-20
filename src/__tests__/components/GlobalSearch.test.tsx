import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GlobalSearch } from '../../components/GlobalSearch'

// jsdom 环境没有 scrollIntoView，需要 mock
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn()
}

const mockNavigate = vi.fn()
const mockOnClose = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: vi.fn().mockReturnValue({
    t: (key: string) => key,
    lang: 'zh',
    animationSpeed: 1,
    setAnimationSpeed: vi.fn(),
    showIndices: true,
    setShowIndices: vi.fn(),
    cycleSpeed: 1,
    currentPreset: 'default',
    applyPreset: vi.fn(),
    setLanguage: vi.fn(),
  }),
}))

function renderSearch(isOpen = true) {
  return render(
    <MemoryRouter>
      <GlobalSearch isOpen={isOpen} onClose={mockOnClose} />
    </MemoryRouter>
  )
}

describe('GlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('isOpen=false 时不渲染', () => {
    const { container } = renderSearch(false)
    expect(container.querySelector('[role="dialog"]')).toBeNull()
  })

  it('isOpen=true 时渲染输入框', () => {
    renderSearch()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText('globalSearch.inputAriaLabel')).toBeInTheDocument()
  })

  it('空查询时显示前 10 项', () => {
    renderSearch()
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(10)
  })

  it('输入查询后过滤结果', () => {
    renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel')
    // 输入一个不存在的查询，应该无结果
    fireEvent.change(input, { target: { value: 'zzzznotexist' } })
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('globalSearch.noResults')).toBeInTheDocument()
  })

  it('ArrowDown 移动选中项到下一项', () => {
    renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel')
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(options[1]).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowUp 移动选中项到上一项', () => {
    renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel')
    const options = screen.getAllByRole('option')

    // 先移到第二项
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(options[1]).toHaveAttribute('aria-selected', 'true')

    // 再移回第一项
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('ArrowUp 在第一项时不超出上界', () => {
    renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel')
    const options = screen.getAllByRole('option')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('Enter 选中并跳转', () => {
    renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('Escape 关闭弹窗', () => {
    renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('点击结果项跳转', () => {
    renderSearch()
    const options = screen.getAllByRole('option')
    fireEvent.click(options[0])
    expect(mockNavigate).toHaveBeenCalledTimes(1)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('点击遮罩关闭弹窗', () => {
    const { container } = renderSearch()
    const overlay = container.querySelector('[role="dialog"]') as HTMLElement
    // 点击遮罩本身（非内部元素）
    fireEvent.click(overlay)
    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('无障碍属性正确', () => {
    renderSearch()
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', 'globalSearch.title')

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-label', 'globalSearch.title')

    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('打开时自动清空查询', () => {
    const { rerender } = renderSearch()
    const input = screen.getByLabelText('globalSearch.inputAriaLabel') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'test' } })
    expect(input.value).toBe('test')

    // 关闭后重新打开
    rerender(
      <MemoryRouter>
        <GlobalSearch isOpen={false} onClose={mockOnClose} />
      </MemoryRouter>
    )
    rerender(
      <MemoryRouter>
        <GlobalSearch isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    )

    const newInput = screen.getByLabelText('globalSearch.inputAriaLabel') as HTMLInputElement
    expect(newInput.value).toBe('')
  })
})
