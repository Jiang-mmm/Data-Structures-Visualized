import { useState, useCallback, useEffect } from 'react'
import type { QuizQuestion } from '../types/learning'

const STORAGE_PREFIX = 'ds-quiz-progress-'

/** 单题答题记录 */
export interface QuizAnswer {
  /** 题目 id */
  questionId: string
  /** 用户选择的索引 */
  selectedIndex: number
  /** 是否正确 */
  isCorrect: boolean
  /** 答题时间戳 */
  timestamp: number
}

/** useQuizProgress 返回值 */
export interface QuizProgress {
  /** 所有答题记录 */
  answers: QuizAnswer[]
  /** 当前题目索引 */
  currentIndex: number
  /** 已答题数 */
  answeredCount: number
  /** 正确数 */
  correctCount: number
  /** 得分（百分比） */
  score: number
  /** 是否全部答完 */
  isComplete: boolean
  /** 提交答案 */
  submitAnswer: (questionId: string, selectedIndex: number, correctIndex: number) => void
  /** 跳到下一题 */
  nextQuestion: () => void
  /** 跳到上一题 */
  prevQuestion: () => void
  /** 跳到指定题 */
  goToQuestion: (index: number) => void
  /** 重置进度 */
  reset: () => void
  /** 获取指定题目的答题记录 */
  getAnswer: (questionId: string) => QuizAnswer | undefined
}

/**
 * 测验进度管理 Hook
 *
 * 管理测验答题状态，持久化到 localStorage。
 * 每个算法的测验进度独立存储。
 */
export function useQuizProgress(algorithmKey: string, questions: QuizQuestion[]): QuizProgress {
  const storageKey = STORAGE_PREFIX + algorithmKey

  const [answers, setAnswers] = useState<QuizAnswer[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (!stored) return []
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []
      return parsed
    } catch {
      return []
    }
  })

  const [currentIndex, setCurrentIndex] = useState(0)

  // 持久化答题记录
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers))
    } catch {
      // localStorage 写入失败时静默忽略
    }
  }, [answers, storageKey])

  const submitAnswer = useCallback((questionId: string, selectedIndex: number, correctIndex: number) => {
    const isCorrect = selectedIndex === correctIndex
    setAnswers(prev => {
      // 移除该题目的旧答案，再添加新答案
      const filtered = prev.filter(a => a.questionId !== questionId)
      return [...filtered, {
        questionId,
        selectedIndex,
        isCorrect,
        timestamp: Date.now(),
      }]
    })
  }, [])

  const nextQuestion = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, questions.length - 1))
  }, [questions.length])

  const prevQuestion = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const goToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index)
    }
  }, [questions.length])

  const reset = useCallback(() => {
    setAnswers([])
    setCurrentIndex(0)
    try {
      localStorage.removeItem(storageKey)
    } catch {
      // 忽略
    }
  }, [storageKey])

  const getAnswer = useCallback((questionId: string): QuizAnswer | undefined => {
    return answers.find(a => a.questionId === questionId)
  }, [answers])

  const answeredCount = answers.length
  const correctCount = answers.filter(a => a.isCorrect).length
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0
  const isComplete = answeredCount === questions.length && questions.length > 0

  return {
    answers,
    currentIndex,
    answeredCount,
    correctCount,
    score,
    isComplete,
    submitAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    reset,
    getAnswer,
  }
}
