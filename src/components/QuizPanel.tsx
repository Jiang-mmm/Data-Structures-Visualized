import { useState, useCallback, memo, useEffect, useRef } from 'react'
import type { QuizQuestion } from '../types/learning'
import { useQuizProgress } from '../hooks/useQuizProgress'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import Icon from './Icon'

interface QuizPanelProps {
  /** 算法标识，用于 localStorage 持久化 */
  algorithmKey: string
  /** 测验题目列表 */
  questions: QuizQuestion[]
}

/**
 * Fisher-Yates 洗牌算法（原地）。返回新数组，原数组不变。
 * 用于在 QuizPanel 挂载时打乱题目顺序，避免连续打开两次看到相同顺序。
 */
function shuffleQuestions<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 测验面板组件
 *
 * 在学习模式完成后展示选择题，提供即时反馈和解析。
 * 答题进度持久化到 localStorage，下次打开可继续。
 * 题目顺序在挂载时随机打乱（Fisher-Yates），重置时再次洗牌。
 */
function QuizPanelBase({ algorithmKey, questions }: QuizPanelProps) {
  const { t } = useGlobalSettings()
  const progress = useQuizProgress(algorithmKey, questions)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  // 题目顺序在挂载时打乱；按 algorithmKey 变化或显式 shuffle() 重新洗牌
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>(() => shuffleQuestions(questions))
  // 记录 algorithmKey，effect 中检测变化触发重新洗牌（避免 render 中直接访问 ref）
  const lastAlgoKeyRef = useRef(algorithmKey)
  useEffect(() => {
    if (lastAlgoKeyRef.current !== algorithmKey) {
      lastAlgoKeyRef.current = algorithmKey
      setShuffledQuestions(shuffleQuestions(questions))
    }
  }, [algorithmKey, questions])

  // currentQuestion 始终使用洗牌后的列表
  const currentQuestion = shuffledQuestions[progress.currentIndex]
  const existingAnswer = currentQuestion ? progress.getAnswer(currentQuestion.id) : undefined
  const hasAnswered = existingAnswer !== undefined

  // 同步本地选中状态与已答题目的答案
  const displaySelected = selectedOption ?? existingAnswer?.selectedIndex ?? null

  const handleSubmit = useCallback(() => {
    if (!currentQuestion || displaySelected === null) return
    progress.submitAnswer(currentQuestion.id, displaySelected, currentQuestion.correctIndex)
  }, [displaySelected, currentQuestion, progress])

  const handleSelect = useCallback((index: number) => {
    if (hasAnswered) return // 已答题不允许修改
    setSelectedOption(index)
  }, [hasAnswered])

  // 显式重新洗牌（重置按钮触发）
  const handleReshuffle = useCallback(() => {
    progress.reset()
    setShuffledQuestions(shuffleQuestions(questions))
    setSelectedOption(null)
  }, [progress, questions])

  // 派生：题目数取洗牌后列表长度（与原列表一致）
  const questionCount = shuffledQuestions.length

  // 无题目时显示空状态
  if (questionCount === 0) {
    return (
      <div className="p-4 text-center text-sm text-ink-light dark:text-dark-ink-light">
        {t('quiz.noQuestions')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-3" role="region" aria-label={t('quiz.title')}>
      {/* 标题 + 得分 */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-ink dark:text-dark-ink">{t('quiz.title')}</h3>
        <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">
          {t('quiz.score')}: {progress.score}% ({progress.correctCount}/{questionCount})
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-1 bg-border dark:bg-dark-border overflow-hidden">
        <div
          className="h-full bg-accent-blue transition-all duration-300"
          style={{ width: `${(progress.answeredCount / questionCount) * 100}%` }}
        />
      </div>

      {/* 题目区域 */}
      <div className="border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs text-accent-blue">
            {t('quiz.question')} {progress.currentIndex + 1}{t('quiz.of')}{questionCount}
          </span>
          {hasAnswered && (
            <span className={`text-xs font-bold flex items-center gap-1 ${existingAnswer.isCorrect ? 'text-accent-emerald' : 'text-accent-rose'}`}>
              {existingAnswer.isCorrect ? <><Icon name="check" size={14} /> {t('quiz.correct')}</> : `✗ ${t('quiz.incorrect')}`}
            </span>
          )}
        </div>

        <p className="text-sm text-ink dark:text-dark-ink mb-3">{currentQuestion.question}</p>

        {/* 选项列表 */}
        <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={currentQuestion.question}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = displaySelected === index
            const isCorrect = index === currentQuestion.correctIndex
            const showResult = hasAnswered

            let optionClass = 'border-border dark:border-dark-border bg-muted dark:bg-dark-muted'
            if (isSelected && !showResult) {
              optionClass = 'border-ink dark:border-dark-border bg-surface dark:bg-dark-surface'
            } else if (showResult && isCorrect) {
              optionClass = 'border-accent-emerald bg-accent-emerald/10'
            } else if (showResult && isSelected && !isCorrect) {
              optionClass = 'border-accent-rose bg-accent-rose/10'
            }

            return (
              <button
                key={index}
                role="radio"
                aria-checked={isSelected}
                disabled={hasAnswered}
                onClick={() => handleSelect(index)}
                className={`text-left px-3 py-2 border-2 text-sm transition-all ${optionClass} ${!hasAnswered ? 'cursor-pointer hover:border-ink dark:hover:border-dark-border' : 'cursor-default'}`}
              >
                <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-ink dark:text-dark-ink">{option}</span>
                {showResult && isCorrect && <span className="text-accent-emerald ml-2 inline-flex"><Icon name="check" size={14} /></span>}
                {showResult && isSelected && !isCorrect && <span className="text-accent-rose ml-2">✗</span>}
              </button>
            )
          })}
        </div>

        {/* 解析 */}
        {hasAnswered && (
          <div className="mt-3 p-2 border-l-4 border-accent-blue bg-muted dark:bg-dark-muted">
            <div className="font-bold text-xs text-accent-blue mb-1">{t('quiz.explanation')}</div>
            <p className="text-xs text-ink dark:text-dark-ink">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        <button
          onClick={progress.prevQuestion}
          disabled={progress.currentIndex === 0}
          className="px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted dark:hover:bg-dark-muted transition-colors"
        >
          {t('quiz.prev')}
        </button>

        {!hasAnswered ? (
          <button
            onClick={handleSubmit}
            disabled={displaySelected === null}
            className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border bg-accent-blue text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            {t('quiz.submit')}
          </button>
        ) : (
          <button
            onClick={progress.nextQuestion}
            disabled={progress.currentIndex === questionCount - 1}
            className="flex-1 px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border bg-accent-blue text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            {t('quiz.next')}
          </button>
        )}

        <button
          onClick={handleReshuffle}
          className="px-3 py-1.5 text-xs font-bold border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface text-ink dark:text-dark-ink hover:bg-muted dark:hover:bg-dark-muted transition-colors"
          title={t('quiz.reset')}
          aria-label={t('quiz.reset')}
        >
          ↻
        </button>
      </div>

      {/* 完成提示 */}
      {progress.isComplete && (
        <div className="p-2 border-2 border-accent-emerald bg-accent-emerald/10 text-center">
          <span className="text-sm font-bold text-accent-emerald">
            {t('quiz.complete')} — {t('quiz.score')}: {progress.score}%
          </span>
        </div>
      )}
    </div>
  )
}

const QuizPanel = memo(QuizPanelBase)
export default QuizPanel
