import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

import { showToast } from '../components/toastStore'
import { useLearningProgress } from '../hooks/useLearningProgress'

describe('useLearningProgress', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('应该返回初始空进度', () => {
    const { result } = renderHook(() => useLearningProgress())
    const { total, completed, percentage } = result.current.getProgress()
    expect(total).toBe(11)
    expect(completed).toBe(0)
    expect(percentage).toBe(0)
  })

  it('应该标记节点为已访问', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markVisited('array'))
    expect(result.current.isVisited('array')).toBe(true)
    expect(result.current.isVisited('stack')).toBe(false)
  })

  it('应该标记节点为已完成', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))
    expect(result.current.isCompleted('array')).toBe(true)
    expect(result.current.isVisited('array')).toBe(true) // completed implies visited
  })

  it('应该正确计算进度百分比', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))
    const { completed, percentage } = result.current.getProgress()
    expect(completed).toBe(1)
    expect(percentage).toBe(9)
  })

  it('array无前置条件应该默认解锁', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isUnlocked('array')).toBe(true)
  })

  it('stack需要完成array才能解锁', () => {
    const { result } = renderHook(() => useLearningProgress())

    expect(result.current.isUnlocked('stack')).toBe(false)

    act(() => result.current.markCompleted('array'))
    expect(result.current.isUnlocked('stack')).toBe(true)
  })

  it('graph需要完成linkedlist和queue才能解锁', () => {
    const { result } = renderHook(() => useLearningProgress())

    expect(result.current.isUnlocked('graph')).toBe(false)

    act(() => result.current.markCompleted('array'))
    expect(result.current.isUnlocked('graph')).toBe(false)

    act(() => result.current.markCompleted('linkedlist'))
    expect(result.current.isUnlocked('graph')).toBe(false)

    act(() => result.current.markCompleted('queue'))
    expect(result.current.isUnlocked('graph')).toBe(true)
  })

  it('应该重置进度', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))
    act(() => result.current.markVisited('stack'))
    expect(result.current.getProgress().completed).toBe(1)

    act(() => result.current.resetProgress())
    expect(result.current.getProgress().completed).toBe(0)
    expect(result.current.isVisited('array')).toBe(false)
    expect(result.current.isUnlocked('array')).toBe(true) // array has no prerequisites
  })

  it('不应该重复标记已访问的节点', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markVisited('array'))
    act(() => result.current.markVisited('array'))
    // Should still only have 1 visited
    expect(result.current.isVisited('array')).toBe(true)
  })

  it('应该将进度持久化到localStorage', () => {
    const { result } = renderHook(() => useLearningProgress())

    act(() => result.current.markCompleted('array'))

    const stored = JSON.parse(localStorage.getItem('ds-visualizer-learning-progress')!)
    expect(stored.completed).toContain('array')
  })

  it('应该从localStorage恢复进度', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'stack'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isVisited('array')).toBe(true)
    expect(result.current.isVisited('stack')).toBe(true)
    expect(result.current.isCompleted('array')).toBe(true)
    expect(result.current.isCompleted('stack')).toBe(false)
  })

  it('应该处理无效的localStorage数据', () => {
    localStorage.setItem('ds-visualizer-learning-progress', 'invalid-json!!')
    const { result } = renderHook(() => useLearningProgress())
    const { completed } = result.current.getProgress()
    expect(completed).toBe(0)
  })

  it('应该处理未知节点ID', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isUnlocked('nonexistent')).toBe(false)
    expect(result.current.isVisited('nonexistent')).toBe(false)
  })

  // ============================================================
  // 实时同步测试
  // ============================================================

  it('多个hook实例应该实时同步已访问状态', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    expect(r2.current.isVisited('array')).toBe(false)

    act(() => r1.current.markVisited('array'))
    expect(r2.current.isVisited('array')).toBe(true)
  })

  it('多个hook实例应该实时同步已完成状态', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    expect(r2.current.isCompleted('array')).toBe(false)
    expect(r2.current.isUnlocked('stack')).toBe(false)

    act(() => r1.current.markCompleted('array'))
    expect(r2.current.isCompleted('array')).toBe(true)
    expect(r2.current.isUnlocked('stack')).toBe(true)
    expect(r2.current.getProgress().completed).toBe(1)
  })

  it('多个hook实例应该实时同步进度百分比', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    act(() => r1.current.markCompleted('array'))
    act(() => r1.current.markCompleted('stack'))

    expect(r2.current.getProgress().completed).toBe(2)
    expect(r2.current.getProgress().percentage).toBe(18)
  })

  it('resetProgress应该跨实例同步', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    act(() => r1.current.markCompleted('array'))
    expect(r2.current.isCompleted('array')).toBe(true)

    act(() => r1.current.resetProgress())
    expect(r2.current.isCompleted('array')).toBe(false)
    expect(r2.current.getProgress().completed).toBe(0)
  })

  // ============================================================
  // 同步状态测试
  // ============================================================

  it('初始syncStatus应该为idle', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.syncStatus).toBe('idle')
  })

  it('markVisited后syncStatus应该变为synced', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markVisited('array'))
    expect(result.current.syncStatus).toBe('synced')
  })

  it('markCompleted后syncStatus应该变为synced', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    expect(result.current.syncStatus).toBe('synced')
  })

  it('resetProgress后syncStatus应该变为synced', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    act(() => result.current.resetProgress())
    expect(result.current.syncStatus).toBe('synced')
  })

  it('markCompleted应该显示同步成功Toast', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' })
    )
  })

  it('重复markCompleted不应该再次显示Toast', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    vi.clearAllMocks()
    act(() => result.current.markCompleted('array'))
    expect(showToast).not.toHaveBeenCalled()
  })

  // ============================================================
  // 配置同步测试
  // ============================================================

  it('应该过滤掉不在学习路径配置中的无效ID', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'nonexistent'],
      completed: ['array', 'stale_id'],
      startedAt: new Date().toISOString(),
    }))

    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isVisited('array')).toBe(true)
    expect(result.current.isVisited('nonexistent')).toBe(false)
    expect(result.current.isCompleted('array')).toBe(true)
    expect(result.current.isCompleted('stale_id')).toBe(false)
    expect(result.current.getProgress().completed).toBe(1)
  })

  it('应该保留缺失的startedAt字段', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
    }))

    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.isCompleted('array')).toBe(true)
    expect(result.current.isVisited('array')).toBe(true)
  })

  // ============================================================
  // 页面刷新恢复测试
  // ============================================================

  it('页面刷新后应该从localStorage恢复完整进度', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    act(() => result.current.markCompleted('stack'))
    act(() => result.current.markVisited('queue'))

    const { result: refreshed } = renderHook(() => useLearningProgress())
    expect(refreshed.current.isCompleted('array')).toBe(true)
    expect(refreshed.current.isCompleted('stack')).toBe(true)
    expect(refreshed.current.isVisited('queue')).toBe(true)
    expect(refreshed.current.getProgress().completed).toBe(2)
    expect(refreshed.current.getProgress().percentage).toBe(18)
  })

  it('页面刷新后解锁状态应该正确恢复', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    act(() => result.current.markCompleted('linkedlist'))
    act(() => result.current.markCompleted('queue'))

    const { result: refreshed } = renderHook(() => useLearningProgress())
    expect(refreshed.current.isUnlocked('stack')).toBe(true)
    expect(refreshed.current.isUnlocked('tree')).toBe(true)
    expect(refreshed.current.isUnlocked('graph')).toBe(true)
  })

  // ============================================================
  // 总体统计 API 测试
  // ============================================================

  it('totalModules 应该返回学习路径总模块数', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.totalModules).toBe(11)
  })

  it('初始状态 completedModules 应该为 0', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.completedModules).toBe(0)
  })

  it('初始状态 inProgressModules 应该为 0', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.inProgressModules).toBe(0)
  })

  it('初始状态 notStartedModules 应该等于总模块数', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.notStartedModules).toBe(11)
  })

  it('初始状态 overallCompletionRate 应该为 0', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.overallCompletionRate).toBe(0)
  })

  it('markVisited 后 inProgressModules 应该增加', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markVisited('array'))
    expect(result.current.inProgressModules).toBe(1)
    expect(result.current.completedModules).toBe(0)
    expect(result.current.notStartedModules).toBe(10)
  })

  it('markCompleted 后 completedModules 应该增加且 inProgressModules 不变', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markVisited('stack'))
    act(() => result.current.markCompleted('array'))
    expect(result.current.completedModules).toBe(1)
    expect(result.current.inProgressModules).toBe(1)
    expect(result.current.notStartedModules).toBe(9)
  })

  it('overallCompletionRate 应该正确计算百分比', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    expect(result.current.overallCompletionRate).toBe(9)
    act(() => result.current.markCompleted('stack'))
    expect(result.current.overallCompletionRate).toBe(18)
  })

  it('已完成模块同时计入 visited 时不应重复计算 inProgressModules', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markVisited('array'))
    act(() => result.current.markCompleted('array'))
    expect(result.current.completedModules).toBe(1)
    expect(result.current.inProgressModules).toBe(0)
    expect(result.current.notStartedModules).toBe(10)
  })

  it('resetProgress 后统计应该归零', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    act(() => result.current.markVisited('stack'))
    act(() => result.current.resetProgress())
    expect(result.current.completedModules).toBe(0)
    expect(result.current.inProgressModules).toBe(0)
    expect(result.current.notStartedModules).toBe(11)
    expect(result.current.overallCompletionRate).toBe(0)
  })

  it('统计应该跨实例实时同步', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    act(() => r1.current.markCompleted('array'))
    act(() => r1.current.markVisited('stack'))
    expect(r2.current.completedModules).toBe(1)
    expect(r2.current.inProgressModules).toBe(1)
    expect(r2.current.notStartedModules).toBe(9)
    expect(r2.current.overallCompletionRate).toBe(9)
  })

  // ============================================================
  // 学习目标 API 测试
  // ============================================================

  it('初始状态 goal 应该为 null', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.goal).toBeNull()
  })

  it('初始状态 goalProgress 应该为 0', () => {
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.goalProgress).toBe(0)
  })

  it('setGoal 应该设定学习目标', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    expect(result.current.goal).not.toBeNull()
    expect(result.current.goal?.targetSteps).toBe(5)
    expect(result.current.goal?.targetDate).toBe('2026-12-31')
    expect(result.current.goal?.createdAt).toBeDefined()
  })

  it('setGoal 后 syncStatus 应该变为 synced', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    expect(result.current.syncStatus).toBe('synced')
  })

  it('setGoal 应该返回 true 当保存成功', () => {
    const { result } = renderHook(() => useLearningProgress())
    let ok = false
    act(() => { ok = result.current.setGoal(5, '2026-12-31') })
    expect(ok).toBe(true)
  })

  it('setGoal 应该返回 false 当保存失败', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })
    const { result } = renderHook(() => useLearningProgress())
    let ok = true
    act(() => { ok = result.current.setGoal(5, '2026-12-31') })
    expect(ok).toBe(false)
    setItem.mockRestore()
  })

  it('goalProgress 应该根据已完成模块数计算', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    act(() => result.current.markCompleted('array'))
    expect(result.current.goalProgress).toBe(20)
    act(() => result.current.markCompleted('stack'))
    expect(result.current.goalProgress).toBe(40)
  })

  it('goalProgress 不应该超过 100', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(2, '2026-12-31'))
    act(() => result.current.markCompleted('array'))
    act(() => result.current.markCompleted('stack'))
    act(() => result.current.markCompleted('queue'))
    expect(result.current.goalProgress).toBe(100)
  })

  it('goalProgress 在无目标时应该为 0', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.markCompleted('array'))
    expect(result.current.goalProgress).toBe(0)
  })

  it('setGoal 应该持久化到 localStorage', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    const stored = JSON.parse(localStorage.getItem('ds-visualizer-learning-goal')!)
    expect(stored.targetSteps).toBe(5)
    expect(stored.targetDate).toBe('2026-12-31')
  })

  it('应该从 localStorage 恢复目标', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 7,
      targetDate: '2026-06-30',
      createdAt: new Date().toISOString(),
    }))
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.goal).not.toBeNull()
    expect(result.current.goal?.targetSteps).toBe(7)
    expect(result.current.goal?.targetDate).toBe('2026-06-30')
  })

  it('应该处理无效的目标 localStorage 数据', () => {
    localStorage.setItem('ds-visualizer-learning-goal', 'invalid-json!!')
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.goal).toBeNull()
  })

  it('应该处理目标字段缺失的情况', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 5,
    }))
    const { result } = renderHook(() => useLearningProgress())
    expect(result.current.goal).toBeNull()
  })

  it('clearGoal 应该清除学习目标', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    expect(result.current.goal).not.toBeNull()
    act(() => result.current.clearGoal())
    expect(result.current.goal).toBeNull()
    expect(result.current.goalProgress).toBe(0)
    expect(localStorage.getItem('ds-visualizer-learning-goal')).toBeNull()
  })

  it('clearGoal 后 syncStatus 应该变为 synced', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    act(() => result.current.clearGoal())
    expect(result.current.syncStatus).toBe('synced')
  })

  it('resetProgress 不应该清除学习目标', () => {
    const { result } = renderHook(() => useLearningProgress())
    act(() => result.current.setGoal(5, '2026-12-31'))
    act(() => result.current.markCompleted('array'))
    act(() => result.current.resetProgress())
    expect(result.current.goal).not.toBeNull()
    expect(result.current.goal?.targetSteps).toBe(5)
  })

  it('目标应该跨实例实时同步', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    expect(r2.current.goal).toBeNull()
    act(() => r1.current.setGoal(5, '2026-12-31'))
    expect(r2.current.goal).not.toBeNull()
    expect(r2.current.goal?.targetSteps).toBe(5)
  })

  it('clearGoal 应该跨实例同步', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    act(() => r1.current.setGoal(5, '2026-12-31'))
    expect(r2.current.goal).not.toBeNull()
    act(() => r1.current.clearGoal())
    expect(r2.current.goal).toBeNull()
  })

  it('目标进度应该跨实例实时同步', () => {
    const { result: r1 } = renderHook(() => useLearningProgress())
    const { result: r2 } = renderHook(() => useLearningProgress())

    act(() => r1.current.setGoal(5, '2026-12-31'))
    act(() => r1.current.markCompleted('array'))
    expect(r2.current.goalProgress).toBe(20)
  })
})
