import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useQuizProgress } from '../../hooks/useQuizProgress'
import type { QuizQuestion } from '../../types/learning'

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '测试题 1',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 1,
    explanation: '解析 1',
  },
  {
    id: 'q2',
    question: '测试题 2',
    options: ['A', 'B', 'C'],
    correctIndex: 0,
    explanation: '解析 2',
  },
  {
    id: 'q3',
    question: '测试题 3',
    options: ['A', 'B'],
    correctIndex: 1,
    explanation: '解析 3',
  },
]

describe('useQuizProgress', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('初始状态：无答题记录，得分 0', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    expect(result.current.answers).toHaveLength(0)
    expect(result.current.answeredCount).toBe(0)
    expect(result.current.correctCount).toBe(0)
    expect(result.current.score).toBe(0)
    expect(result.current.isComplete).toBe(false)
    expect(result.current.currentIndex).toBe(0)
  })

  it('提交正确答案：answeredCount +1，correctCount +1', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => {
      result.current.submitAnswer('q1', 1, 1)
    })

    expect(result.current.answeredCount).toBe(1)
    expect(result.current.correctCount).toBe(1)
    expect(result.current.score).toBe(33)
  })

  it('提交错误答案：answeredCount +1，correctCount 不变', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => {
      result.current.submitAnswer('q1', 0, 1)
    })

    expect(result.current.answeredCount).toBe(1)
    expect(result.current.correctCount).toBe(0)
    expect(result.current.score).toBe(0)
  })

  it('重新提交同一题：覆盖旧答案，不重复计数', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => {
      result.current.submitAnswer('q1', 0, 1) // 错误
    })
    act(() => {
      result.current.submitAnswer('q1', 1, 1) // 正确
    })

    expect(result.current.answeredCount).toBe(1)
    expect(result.current.correctCount).toBe(1)
  })

  it('答完所有题：isComplete 为 true', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => { result.current.submitAnswer('q1', 1, 1) })
    act(() => { result.current.submitAnswer('q2', 0, 0) })
    act(() => { result.current.submitAnswer('q3', 1, 1) })

    expect(result.current.answeredCount).toBe(3)
    expect(result.current.correctCount).toBe(3)
    expect(result.current.score).toBe(100)
    expect(result.current.isComplete).toBe(true)
  })

  it('nextQuestion/prevQuestion/goToQuestion 导航', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => { result.current.nextQuestion() })
    expect(result.current.currentIndex).toBe(1)

    act(() => { result.current.nextQuestion() })
    expect(result.current.currentIndex).toBe(2)

    // 不超过最大索引
    act(() => { result.current.nextQuestion() })
    expect(result.current.currentIndex).toBe(2)

    act(() => { result.current.prevQuestion() })
    expect(result.current.currentIndex).toBe(1)

    act(() => { result.current.goToQuestion(0) })
    expect(result.current.currentIndex).toBe(0)

    // 不小于 0
    act(() => { result.current.prevQuestion() })
    expect(result.current.currentIndex).toBe(0)
  })

  it('reset：清空所有答题记录', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => { result.current.submitAnswer('q1', 1, 1) })
    act(() => { result.current.nextQuestion() })

    act(() => { result.current.reset() })

    expect(result.current.answers).toHaveLength(0)
    expect(result.current.answeredCount).toBe(0)
    expect(result.current.currentIndex).toBe(0)
  })

  it('getAnswer：获取指定题目的答题记录', () => {
    const { result } = renderHook(() => useQuizProgress('test', mockQuestions))

    act(() => { result.current.submitAnswer('q1', 1, 1) })

    const answer = result.current.getAnswer('q1')
    expect(answer).toBeDefined()
    expect(answer?.selectedIndex).toBe(1)
    expect(answer?.isCorrect).toBe(true)

    const noAnswer = result.current.getAnswer('q2')
    expect(noAnswer).toBeUndefined()
  })

  it('localStorage 持久化：重新加载后恢复答题记录', () => {
    const { result: first } = renderHook(() => useQuizProgress('persist-test', mockQuestions))

    act(() => { first.current.submitAnswer('q1', 1, 1) })

    // 模拟重新加载（重新渲染 Hook）
    const { result: second } = renderHook(() => useQuizProgress('persist-test', mockQuestions))

    expect(second.current.answeredCount).toBe(1)
    expect(second.current.correctCount).toBe(1)
  })

  it('空题目列表：score 为 0，isComplete 为 false', () => {
    const { result } = renderHook(() => useQuizProgress('empty', []))

    expect(result.current.score).toBe(0)
    expect(result.current.isComplete).toBe(false)
  })
})
