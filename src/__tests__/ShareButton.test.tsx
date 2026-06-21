import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import ShareButton from '../components/ShareButton'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

vi.mock('../utils/shareUtils', () => ({
  encodeData: vi.fn(),
}))

import { showToast } from '../components/toastStore'
import { encodeData } from '../utils/shareUtils'

const mockEncodeData = encodeData as ReturnType<typeof vi.fn>
const mockShowToast = showToast as ReturnType<typeof vi.fn>

describe('ShareButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEncodeData.mockReturnValue('encoded_test_string')
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    })
  })

  describe('基础渲染', () => {
    it('应该渲染分享按钮', () => {
      render(<ShareButton data={[1, 2, 3]} dataType="array" />)
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('应该显示分享文字', () => {
      const { container } = render(<ShareButton data={[1, 2, 3]} dataType="array" />)
      expect(container.textContent).toContain('share.label')
    })
  })

  describe('禁用状态', () => {
    it('disabled 时按钮应该禁用', () => {
      render(<ShareButton data={[1, 2, 3]} dataType="array" disabled={true} />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('无数据时点击应该不执行操作', () => {
      render(<ShareButton data={null} dataType="array" />)
      fireEvent.click(screen.getByRole('button'))
      expect(mockEncodeData).not.toHaveBeenCalled()
    })
  })

  describe('分享功能', () => {
    it('点击应该调用 encodeData', async () => {
      render(<ShareButton data={[1, 2, 3]} dataType="array" />)
      await act(async () => {
        fireEvent.click(screen.getByRole('button'))
      })
      expect(mockEncodeData).toHaveBeenCalledWith([1, 2, 3])
    })

    it('encodeData 失败时显示错误 toast', async () => {
      mockEncodeData.mockReturnValue(null)
      render(<ShareButton data={[1, 2, 3]} dataType="array" />)
      await act(async () => {
        fireEvent.click(screen.getByRole('button'))
      })
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error', message: 'share.generateFailed' })
      )
    })

    it('成功复制时显示成功 toast', async () => {
      render(<ShareButton data={[1, 2, 3]} dataType="array" />)
      await act(async () => {
        fireEvent.click(screen.getByRole('button'))
      })
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'success', message: 'share.copied' })
        )
      })
    })

    it('复制失败时显示警告 toast', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
        writable: true,
        configurable: true,
      })
      render(<ShareButton data={[1, 2, 3]} dataType="array" />)
      await act(async () => {
        fireEvent.click(screen.getByRole('button'))
      })
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'warning', message: 'share.copyManually' })
        )
      })
    })
  })
})