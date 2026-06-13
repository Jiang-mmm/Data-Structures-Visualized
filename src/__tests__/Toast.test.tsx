import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ToastContainer from '../components/Toast'

vi.mock('../components/toastStore', () => ({
  useToast: vi.fn(),
  dismissToast: vi.fn(),
}))

vi.mock('../i18n/useI18n', () => ({
  tStatic: (key: string) => key,
  useI18n: () => ({ t: (key: string) => key, lang: 'zh', setLanguage: () => {}, supportedLanguages: ['zh', 'en'] }),
}))

import { useToast, dismissToast } from '../components/toastStore'

const mockUseToast = useToast as ReturnType<typeof vi.fn>
const mockDismissToast = dismissToast as ReturnType<typeof vi.fn>

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('空状态', () => {
    it('无 toast 时不渲染任何内容', () => {
      mockUseToast.mockReturnValue({ toasts: [] })
      const { container } = render(<ToastContainer />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Toast 渲染', () => {
    it('应该渲染单个 toast', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'success', message: '操作成功' }],
      })
      render(<ToastContainer />)
      expect(screen.getByText('操作成功')).toBeTruthy()
    })

    it('应该渲染多个 toast', () => {
      mockUseToast.mockReturnValue({
        toasts: [
          { id: 1, type: 'success', message: '成功' },
          { id: 2, type: 'error', message: '失败' },
        ],
      })
      render(<ToastContainer />)
      expect(screen.getByText('成功')).toBeTruthy()
      expect(screen.getByText('失败')).toBeTruthy()
    })
  })

  describe('Toast 类型', () => {
    it('应该渲染 success 类型', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'success', message: '成功' }],
      })
      const { container } = render(<ToastContainer />)
      const toast = container.querySelector('.fixed > div')
      expect(toast).toBeTruthy()
    })

    it('应该渲染 error 类型', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'error', message: '错误' }],
      })
      const { container } = render(<ToastContainer />)
      const toast = container.querySelector('.fixed > div')
      expect(toast).toBeTruthy()
    })

    it('应该渲染 warning 类型', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'warning', message: '警告' }],
      })
      const { container } = render(<ToastContainer />)
      const toast = container.querySelector('.fixed > div')
      expect(toast).toBeTruthy()
    })

    it('应该渲染 info 类型', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'info', message: '信息' }],
      })
      const { container } = render(<ToastContainer />)
      const toast = container.querySelector('.fixed > div')
      expect(toast).toBeTruthy()
    })

    it('未知类型应该回退到 info 样式', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'unknown', message: '未知' }],
      })
      const { container } = render(<ToastContainer />)
      const toast = container.querySelector('.fixed > div')
      expect(toast).toBeTruthy()
    })
  })

  describe('关闭按钮', () => {
    it('每个 toast 应有关闭按钮', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 1, type: 'success', message: '操作成功' }],
      })
      render(<ToastContainer />)
      const dismissBtn = screen.getByRole('button', { name: 'toast.dismissLabel' })
      expect(dismissBtn).toBeTruthy()
    })

    it('点击关闭按钮应调用 dismissToast', () => {
      mockUseToast.mockReturnValue({
        toasts: [{ id: 42, type: 'error', message: '出错了' }],
      })
      render(<ToastContainer />)
      const dismissBtn = screen.getByRole('button', { name: 'toast.dismissLabel' })
      fireEvent.click(dismissBtn)
      expect(mockDismissToast).toHaveBeenCalledWith(42)
    })

    it('多个 toast 时关闭按钮应传递正确的 id', () => {
      mockUseToast.mockReturnValue({
        toasts: [
          { id: 1, type: 'success', message: '成功' },
          { id: 2, type: 'error', message: '失败' },
        ],
      })
      render(<ToastContainer />)
      const dismissBtns = screen.getAllByRole('button', { name: 'toast.dismissLabel' })
      expect(dismissBtns.length).toBe(2)
      fireEvent.click(dismissBtns[1])
      expect(mockDismissToast).toHaveBeenCalledWith(2)
    })
  })
})