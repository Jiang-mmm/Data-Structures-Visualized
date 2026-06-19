import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLearningMode } from '../hooks/useLearningMode'

describe('useLearningMode', () => {
  it('应该初始化学习模式', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))
    expect(result.current.isLearning).toBe(false)
    expect(result.current.hasSteps).toBe(true)
  })

  it('应该开始学习模式', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))

    act(() => {
      result.current.startLearning()
    })
    expect(result.current.isLearning).toBe(true)
    expect(result.current.currentStepIndex).toBe(0)
  })

  it('应该停止学习模式', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.stopLearning()
    })
    expect(result.current.isLearning).toBe(false)
  })

  it('应该支持下一步', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(1)
  })

  it('应该支持上一步', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })

    act(() => {
      result.current.prevStep()
    })
    expect(result.current.currentStepIndex).toBe(0)
  })

  it('应该支持重置', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })

    act(() => {
      result.current.reset()
    })
    expect(result.current.currentStepIndex).toBe(0)
  })

  it('应该返回正确的进度', () => {
    const { result } = renderHook(() => useLearningMode('bfs'))

    act(() => {
      result.current.startLearning()
    })
    expect(result.current.progress).toBe(25)
  })

  it('应该支持 DFS 算法', () => {
    const { result } = renderHook(() => useLearningMode('dfs'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持 Dijkstra 算法', () => {
    const { result } = renderHook(() => useLearningMode('dijkstra'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(5)
  })

  it('应该支持拓扑排序算法', () => {
    const { result } = renderHook(() => useLearningMode('topoSort'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(5)
  })

  it('应该支持冒泡排序算法', () => {
    const { result } = renderHook(() => useLearningMode('bubble'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持快速排序算法', () => {
    const { result } = renderHook(() => useLearningMode('quick'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持归并排序算法', () => {
    const { result } = renderHook(() => useLearningMode('merge'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持堆排序算法', () => {
    const { result } = renderHook(() => useLearningMode('heap'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持选择排序算法', () => {
    const { result } = renderHook(() => useLearningMode('selection'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持插入排序算法', () => {
    const { result } = renderHook(() => useLearningMode('insertion'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持基数排序算法', () => {
    const { result } = renderHook(() => useLearningMode('radix'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('应该支持桶排序算法', () => {
    const { result } = renderHook(() => useLearningMode('bucket'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(4)
  })

  it('冒泡排序学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('bubble'))
    expect(result.current.steps[0].title).toBe('初始化')
  })

  it('快速排序学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('quick'))
    expect(result.current.steps[0].title).toBe('选择基准')
  })

  it('归并排序学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('merge'))
    expect(result.current.steps[0].title).toBe('初始化')
  })

  it('堆排序学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('heap'))
    expect(result.current.steps[0].title).toBe('建堆')
  })

  it('未知算法返回无步骤', () => {
    const { result } = renderHook(() => useLearningMode('unknown'))
    expect(result.current.hasSteps).toBe(false)
    expect(result.current.totalSteps).toBe(0)
  })

  it('排序算法步骤支持导航', () => {
    const { result } = renderHook(() => useLearningMode('bubble'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(1)

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(2)
  })

  it('应该支持链表数据结构', () => {
    const { result } = renderHook(() => useLearningMode('linkedlist'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(8)
  })

  it('应该支持树数据结构', () => {
    const { result } = renderHook(() => useLearningMode('tree'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(9)
  })

  it('应该支持哈希表数据结构', () => {
    const { result } = renderHook(() => useLearningMode('hash'))
    expect(result.current.hasSteps).toBe(true)
    expect(result.current.totalSteps).toBe(5)
  })

  it('链表学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('linkedlist'))
    expect(result.current.steps[0].title).toBe('链表结构')
  })

  it('树学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('tree'))
    expect(result.current.steps[0].title).toBe('二叉树结构')
  })

  it('哈希表学习步骤包含正确的标题', () => {
    const { result } = renderHook(() => useLearningMode('hash'))
    expect(result.current.steps[0].title).toBe('哈希函数')
  })

  it('链表步骤支持导航', () => {
    const { result } = renderHook(() => useLearningMode('linkedlist'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(1)

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(2)
  })

  it('树步骤支持导航', () => {
    const { result } = renderHook(() => useLearningMode('tree'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(1)
  })

  it('哈希表步骤支持导航', () => {
    const { result } = renderHook(() => useLearningMode('hash'))

    act(() => {
      result.current.startLearning()
    })

    act(() => {
      result.current.nextStep()
    })
    expect(result.current.currentStepIndex).toBe(1)
  })

  it('所有算法都支持学习模式', () => {
    const allKeys = ['bfs', 'dfs', 'dijkstra', 'topoSort', 'bubble', 'quick', 'merge', 'heap', 'linkedlist', 'tree', 'hash']
    for (const key of allKeys) {
      const { result } = renderHook(() => useLearningMode(key))
      expect(result.current.hasSteps).toBe(true)
    }
  })
})