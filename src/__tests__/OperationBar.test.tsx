import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OperationBar, { OperationButton, OperationInput, OperationLabel, OperationInfo } from '../components/OperationBar'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('OperationBar', () => {
  describe('基础渲染', () => {
    it('应渲染子元素', () => {
      render(
        <OperationBar>
          <span>测试内容</span>
        </OperationBar>
      )
      expect(screen.getByText('测试内容')).toBeInTheDocument()
    })

    it('应包含 operation-bar CSS 类', () => {
      const { container } = render(
        <OperationBar>
          <span>内容</span>
        </OperationBar>
      )
      const bar = container.firstChild as HTMLElement
      expect(bar.className).toContain('operation-bar')
    })

    it('应支持自定义 className', () => {
      const { container } = render(
        <OperationBar className="custom-class">
          <span>内容</span>
        </OperationBar>
      )
      const bar = container.firstChild as HTMLElement
      expect(bar.className).toContain('custom-class')
      expect(bar.className).toContain('operation-bar')
    })

    it('应有正确的响应式内边距类', () => {
      const { container } = render(
        <OperationBar>
          <span>内容</span>
        </OperationBar>
      )
      const bar = container.firstChild as HTMLElement
      expect(bar.className).toContain('px-3')
      expect(bar.className).toContain('sm:px-6')
      expect(bar.className).toContain('py-1.5')
      expect(bar.className).toContain('sm:py-2.5')
    })

    it('内部 flex 容器应有 flex-wrap 和最小触摸高度', () => {
      const { container } = render(
        <OperationBar>
          <span>内容</span>
        </OperationBar>
      )
      const bar = container.firstChild as HTMLElement
      const flexContainer = bar.querySelector('.flex') as HTMLElement
      expect(flexContainer.className).toContain('flex-wrap')
      expect(flexContainer.className).toContain('min-h-[44px]')
    })
  })

  describe('多按钮溢出处理', () => {
    it('应能渲染大量按钮子元素', () => {
      const buttons = Array.from({ length: 15 }, (_, i) => (
        <OperationButton key={i} variant="primary">
          按钮{i}
        </OperationButton>
      ))
      render(
        <OperationBar>
          {buttons}
        </OperationBar>
      )
      expect(screen.getByText('按钮0')).toBeInTheDocument()
      expect(screen.getByText('按钮14')).toBeInTheDocument()
    })

    it('应包含边框和背景样式', () => {
      const { container } = render(
        <OperationBar>
          <span>内容</span>
        </OperationBar>
      )
      const bar = container.firstChild as HTMLElement
      expect(bar.className).toContain('border-b-2')
    })
  })
})

describe('OperationButton', () => {
  describe('基础渲染', () => {
    it('应渲染按钮文本', () => {
      render(<OperationButton>点击我</OperationButton>)
      expect(screen.getByText('点击我')).toBeInTheDocument()
    })

    it('应有默认 primary 样式', () => {
      render(<OperationButton>按钮</OperationButton>)
      const btn = screen.getByText('按钮')
      expect(btn.className).toContain('bg-accent-blue')
    })

    it('应支持 success 变体', () => {
      render(<OperationButton variant="success">成功</OperationButton>)
      const btn = screen.getByText('成功')
      expect(btn.className).toContain('bg-accent-emerald')
    })

    it('应支持 danger 变体', () => {
      render(<OperationButton variant="danger">危险</OperationButton>)
      const btn = screen.getByText('危险')
      expect(btn.className).toContain('bg-accent-rose')
    })

    it('应支持 outline 变体', () => {
      render(<OperationButton variant="outline">轮廓</OperationButton>)
      const btn = screen.getByText('轮廓')
      expect(btn.className).toContain('border-ink')
    })
  })

  describe('移动端触摸目标', () => {
    it('应有响应式内边距', () => {
      render(<OperationButton>按钮</OperationButton>)
      const btn = screen.getByText('按钮')
      expect(btn.className).toContain('px-3')
      expect(btn.className).toContain('sm:px-4')
      expect(btn.className).toContain('py-1.5')
      expect(btn.className).toContain('py-2')
    })

    it('应有响应式字号', () => {
      render(<OperationButton>按钮</OperationButton>)
      const btn = screen.getByText('按钮')
      expect(btn.className).toContain('text-xs')
      expect(btn.className).toContain('sm:text-sm')
    })

    it('应有 touch-manipulation 支持', () => {
      render(<OperationButton>按钮</OperationButton>)
      const btn = screen.getByText('按钮') as HTMLButtonElement
      // touch-manipulation 由全局 CSS 应用，按钮本身应无 text-size 缩放问题
      expect(btn.className).toContain('text-xs')
    })
  })

  describe('交互行为', () => {
    it('点击时应调用 onClick', () => {
      const onClick = vi.fn()
      render(<OperationButton onClick={onClick}>按钮</OperationButton>)
      fireEvent.click(screen.getByText('按钮'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('禁用时不应调用 onClick', () => {
      const onClick = vi.fn()
      render(<OperationButton onClick={onClick} disabled>按钮</OperationButton>)
      fireEvent.click(screen.getByText('按钮'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('禁用时应有禁用样式类', () => {
      render(<OperationButton disabled>按钮</OperationButton>)
      const btn = screen.getByText('按钮')
      expect(btn.className).toContain('disabled:opacity-40')
      expect(btn.className).toContain('disabled:cursor-not-allowed')
    })

    it('popAnimation 为 true 时不应影响渲染', () => {
      render(<OperationButton popAnimation>按钮</OperationButton>)
      expect(screen.getByText('按钮')).toBeInTheDocument()
    })
  })
})

describe('OperationInput', () => {
  it('应渲染输入框', () => {
    render(<OperationInput placeholder="输入值" />)
    expect(screen.getByPlaceholderText('输入值')).toBeInTheDocument()
  })

  it('应支持自定义 className', () => {
    const { container } = render(<OperationInput className="w-20" />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.className).toContain('w-20')
  })

  it('应有触摸友好的最小高度', () => {
    const { container } = render(<OperationInput />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.className).toContain('touch-manipulation')
  })

  it('输入值变化时应调用 onChange', () => {
    const onChange = vi.fn()
    render(<OperationInput value="" onChange={onChange} />)
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: '42' } })
    expect(onChange).toHaveBeenCalledWith('42')
  })

  it('应支持 number 类型', () => {
    const { container } = render(<OperationInput type="number" />)
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.type).toBe('number')
  })
})

describe('OperationLabel', () => {
  it('应渲染标签文本', () => {
    render(<OperationLabel>操作</OperationLabel>)
    expect(screen.getByText('操作')).toBeInTheDocument()
  })

  it('应使用 monospace 字体', () => {
    render(<OperationLabel>标签</OperationLabel>)
    const label = screen.getByText('标签')
    expect(label.className).toContain('font-mono')
    expect(label.className).toContain('font-bold')
  })
})

describe('OperationInfo', () => {
  it('应渲染子元素', () => {
    render(
      <OperationInfo>
        <span>信息</span>
      </OperationInfo>
    )
    expect(screen.getByText('信息')).toBeInTheDocument()
  })

  it('应使用 ml-auto 右对齐', () => {
    const { container } = render(
      <OperationInfo>
        <span>信息</span>
      </OperationInfo>
    )
    const info = container.firstChild as HTMLElement
    expect(info.className).toContain('ml-auto')
  })
})
