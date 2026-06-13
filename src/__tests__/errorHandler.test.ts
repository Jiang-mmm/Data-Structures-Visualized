import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleOperationError, handleAnimationError } from '../utils/errorHandler'
import { showToast } from '../components/toastStore'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

describe('errorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleOperationError', () => {
    it('应该显示错误 Toast', () => {
      handleOperationError(new Error('test'))
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })

    it('应该包含操作标签', () => {
      handleOperationError(new Error('test'), '插入')
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: '插入动画出错' })
      )
    })

    it('应该处理字符串错误', () => {
      handleOperationError('string error')
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })

    it('无标签时应显示默认消息', () => {
      handleOperationError(new Error('test'))
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: '动画出错' })
      )
    })

    it('应该处理 null 错误', () => {
      handleOperationError(null)
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })

    it('应该处理 undefined 错误', () => {
      handleOperationError(undefined)
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })

  describe('handleAnimationError', () => {
    it('应该显示动画错误 Toast', () => {
      handleAnimationError(new Error('anim error'))
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })

    it('应该包含动画标签', () => {
      handleAnimationError(new Error('anim error'), '排序动画')
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: '排序动画动画出错' })
      )
    })

    it('无标签时应显示默认消息', () => {
      handleAnimationError(new Error('anim error'))
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ message: '动画出错' })
      )
    })

    it('应该处理字符串错误', () => {
      handleAnimationError('string error')
      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })
})