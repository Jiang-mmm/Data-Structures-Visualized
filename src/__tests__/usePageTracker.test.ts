import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePageTracker } from '../hooks/usePageTracker'

// Mock useLearningProgress
const mockMarkVisited = vi.fn()
vi.mock('../hooks/useLearningProgress', () => ({
  useLearningProgress: () => ({
    markVisited: mockMarkVisited,
  }),
}))

describe('usePageTracker', () => {
  beforeEach(() => {
    mockMarkVisited.mockClear()
  })

  it('应该在挂载时标记页面为已访问', () => {
    renderHook(() => usePageTracker('array'))
    expect(mockMarkVisited).toHaveBeenCalledWith('array')
  })

  it('应该调用一次markVisited', () => {
    renderHook(() => usePageTracker('stack'))
    expect(mockMarkVisited).toHaveBeenCalledTimes(1)
  })

  it('应该传递正确的pageId', () => {
    renderHook(() => usePageTracker('graph'))
    expect(mockMarkVisited).toHaveBeenCalledWith('graph')
  })
})
