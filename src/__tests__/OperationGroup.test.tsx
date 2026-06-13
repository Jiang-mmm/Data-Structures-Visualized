import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OperationGroup from '../components/OperationGroup'
import { OperationButton } from '../components/OperationBar'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('OperationGroup', () => {
  const getToggleBtn = (name: RegExp = /common\.more/) =>
    screen.getByRole('button', { name })

  describe('基础渲染', () => {
    it('应渲染折叠按钮', () => {
      render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      expect(getToggleBtn()).toBeInTheDocument()
    })

    it('应支持自定义 label', () => {
      render(
        <OperationGroup label="高级操作">
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      expect(getToggleBtn(/高级操作/)).toBeInTheDocument()
    })

    it('应支持自定义 className', () => {
      const { container } = render(
        <OperationGroup className="custom-class">
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      const group = container.firstChild as HTMLElement
      expect(group.className).toContain('custom-class')
    })

    it('应渲染子元素', () => {
      render(
        <OperationGroup defaultOpen>
          <OperationButton>子按钮A</OperationButton>
          <OperationButton>子按钮B</OperationButton>
        </OperationGroup>
      )
      expect(screen.getByText('子按钮A')).toBeInTheDocument()
      expect(screen.getByText('子按钮B')).toBeInTheDocument()
    })
  })

  describe('展开/收起交互', () => {
    it('默认应为收起状态', () => {
      const { container } = render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      // When collapsed, children are not rendered in DOM
      const content = container.querySelector('[data-state]')
      expect(content).toBeNull()
      // But the toggle button should show collapsed indicator
      expect(getToggleBtn().textContent).toContain('▸')
    })

    it('点击按钮应展开', () => {
      const { container } = render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      fireEvent.click(getToggleBtn())
      const content = container.querySelector('[data-state]')
      expect(content?.getAttribute('data-state')).toBe('open')
    })

    it('再次点击应收起', () => {
      const { container } = render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      fireEvent.click(getToggleBtn())
      fireEvent.click(getToggleBtn())
      const content = container.querySelector('[data-state]')
      expect(content?.getAttribute('data-state')).toBe('closed')
    })

    it('defaultOpen=true 时应默认展开', () => {
      const { container } = render(
        <OperationGroup defaultOpen>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      const content = container.querySelector('[data-state]')
      expect(content?.getAttribute('data-state')).toBe('open')
    })

    it('展开时应显示 ▾ 指示器', () => {
      render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      fireEvent.click(getToggleBtn())
      const btn = getToggleBtn()
      expect(btn.textContent).toContain('▾')
    })

    it('收起时应显示 ▸ 指示器', () => {
      render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      const btn = screen.getByRole('button', { name: /common\.more/ })
      expect(btn.textContent).toContain('▸')
    })
  })

  describe('移动端行为', () => {
    it('折叠按钮应有触摸友好尺寸', () => {
      render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      const btn = screen.getByRole('button', { name: /common\.more/ })
      expect(btn.className).toContain('min-h-[44px]')
    })

    it('折叠按钮应有 touch-manipulation', () => {
      render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      const btn = screen.getByRole('button', { name: /common\.more/ })
      expect(btn.className).toContain('touch-manipulation')
    })

    it('折叠按钮应使用 monospace 字体', () => {
      render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      const btn = screen.getByRole('button', { name: /common\.more/ })
      expect(btn.className).toContain('font-mono')
    })
  })

  describe('子元素可见性', () => {
    it('收起时子元素不应在DOM中', () => {
      const { container } = render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      // When collapsed, children wrapper is removed from DOM
      const content = container.querySelector('[data-state="closed"]')
      expect(content).toBeNull()
    })

    it('展开时子元素容器应有 data-state=open', () => {
      const { container } = render(
        <OperationGroup>
          <OperationButton>子按钮</OperationButton>
        </OperationGroup>
      )
      fireEvent.click(getToggleBtn())
      const content = container.querySelector('[data-state="open"]') as HTMLElement
      expect(content).toBeTruthy()
      expect(content.getAttribute('data-state')).toBe('open')
    })
  })
})
