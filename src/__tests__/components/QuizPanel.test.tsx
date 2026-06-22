import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import QuizPanel from '../../components/QuizPanel'
import type { QuizQuestion } from '../../types/learning'
import { renderWithRouter, mockUseGlobalSettings } from '../pages/testUtils'

vi.mock('../../hooks/useGlobalSettings')

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

const mockQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: '测试题 1',
    options: ['选项 A', '选项 B', '选项 C', '选项 D'],
    correctIndex: 1,
    explanation: '正确答案是 B',
  },
  {
    id: 'q2',
    question: '测试题 2',
    options: ['选项 A', '选项 B'],
    correctIndex: 0,
    explanation: '正确答案是 A',
  },
]

describe('QuizPanel', () => {
  let randomSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    localStorage.clear()
    // v17 R5：让 Fisher-Yates 洗牌保持原序（Math.random()≈1 时 j=i，等于不交换）
    randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.999999)
  })

  afterEach(() => {
    randomSpy.mockRestore()
  })

  it('渲染标题和题目编号', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    expect(screen.getByText('quiz.title')).toBeInTheDocument()
    expect(screen.getByText(/quiz.question/)).toBeInTheDocument()
  })

  it('渲染所有选项', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    expect(screen.getByText('选项 A')).toBeInTheDocument()
    expect(screen.getByText('选项 B')).toBeInTheDocument()
    expect(screen.getByText('选项 C')).toBeInTheDocument()
    expect(screen.getByText('选项 D')).toBeInTheDocument()
  })

  it('选择选项后提交：显示正确/错误反馈', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    // 选择正确答案 B
    fireEvent.click(screen.getByText('选项 B'))
    fireEvent.click(screen.getByText('quiz.submit'))

    expect(screen.getByText(/quiz.correct/)).toBeInTheDocument()
    expect(screen.getByText('正确答案是 B')).toBeInTheDocument()
  })

  it('提交错误答案：显示错误反馈和解析', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    fireEvent.click(screen.getByText('选项 A'))
    fireEvent.click(screen.getByText('quiz.submit'))

    expect(screen.getByText(/quiz.incorrect/)).toBeInTheDocument()
    expect(screen.getByText('正确答案是 B')).toBeInTheDocument()
  })

  it('提交后切换到下一题按钮', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    fireEvent.click(screen.getByText('选项 B'))
    fireEvent.click(screen.getByText('quiz.submit'))

    expect(screen.getByText('quiz.next')).toBeInTheDocument()
  })

  it('未选择选项时提交按钮禁用', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    const submitBtn = screen.getByText('quiz.submit')
    expect(submitBtn).toBeDisabled()
  })

  it('空题目列表：显示无题目提示', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={[]} />)

    expect(screen.getByText('quiz.noQuestions')).toBeInTheDocument()
  })

  it('重置按钮：清空答题记录', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    // 先答题
    fireEvent.click(screen.getByText('选项 B'))
    fireEvent.click(screen.getByText('quiz.submit'))

    // 点击重置（按钮 accessible name 为 quiz.reset aria-label）
    fireEvent.click(screen.getByLabelText('quiz.reset'))

    // 回到未答题状态
    expect(screen.getByText('quiz.submit')).toBeInTheDocument()
    expect(screen.queryByText(/quiz.correct/)).not.toBeInTheDocument()
  })

  it('得分显示正确', () => {
    renderWithRouter(<QuizPanel algorithmKey="test" questions={mockQuestions} />)

    // 初始得分 0%
    expect(screen.getByText(/0%/)).toBeInTheDocument()
  })
})
