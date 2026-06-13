import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '../components/ErrorBoundary'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

vi.mock('../i18n/useI18n', () => ({
  tStatic: (key: string) => key,
}))

function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('test error message')
  }
  return <div data-testid="normal">Normal Content</div>
}

function ThrowErrorWithoutMessage(): never {
  throw new Error()
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('正常渲染', () => {
    it('应该正常渲染子组件', () => {
      render(
        <ErrorBoundary>
          <div data-testid="child">Hello</div>
        </ErrorBoundary>
      )
      expect(screen.getByTestId('child')).toBeTruthy()
    })
  })

  describe('错误捕获', () => {
    it('应该捕获子组件抛出的错误并显示错误界面', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(container.textContent).toContain('test error message')
    })

    it('应该显示错误信息', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      const errorEl = container.querySelector('h3')
      expect(errorEl).toBeTruthy()
    })

    it('应该处理没有 message 的错误', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowErrorWithoutMessage />
        </ErrorBoundary>
      )
      expect(container.textContent).toContain('errorBoundary.renderFailed')
    })
  })

  describe('重置功能', () => {
    it('应该显示重试按钮', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      const button = screen.getByText('errorBoundary.retry')
      expect(button).toBeTruthy()
    })
  })

  describe('onReset 回调', () => {
    it('应该在重置时调用 onReset 回调', () => {
      const onReset = vi.fn()
      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      const button = screen.getByText('errorBoundary.retry')
      button.click()
      expect(onReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('i18n', () => {
    it('错误标题应使用翻译键', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      expect(container.textContent).toContain('errorBoundary.title')
    })

    it('堆栈详情应使用翻译键', () => {
      const { container } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      const summary = container.querySelector('summary')
      expect(summary?.textContent).toContain('errorBoundary.stackDetails')
    })
  })
})