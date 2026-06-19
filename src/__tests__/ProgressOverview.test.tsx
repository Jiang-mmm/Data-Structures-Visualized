import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProgressOverview from '../components/ProgressOverview'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({
    t: (key: string) => key,
    theme: 'light',
    setTheme: vi.fn(),
    lang: 'zh',
    setLang: vi.fn(),
    speed: 1,
    setSpeed: vi.fn(),
  }),
}))

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

import { showToast } from '../components/toastStore'

describe('ProgressOverview', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('应该渲染进度概览标题', () => {
    render(<ProgressOverview />)
    expect(screen.getByText('learningPath.overviewTitle')).toBeDefined()
  })

  it('应该渲染总体完成率标签', () => {
    render(<ProgressOverview />)
    expect(screen.getAllByText('learningPath.overallCompletionRate').length).toBeGreaterThan(0)
  })

  it('应该渲染进度环 SVG', () => {
    const { container } = render(<ProgressOverview />)
    const svg = container.querySelector('svg[role="img"]')
    expect(svg).not.toBeNull()
  })

  it('初始状态应该显示 0% 完成率', () => {
    render(<ProgressOverview />)
    expect(screen.getByText('0%')).toBeDefined()
  })

  it('应该渲染三个统计卡片标签', () => {
    render(<ProgressOverview />)
    expect(screen.getByText('learningPath.completedModules')).toBeDefined()
    expect(screen.getByText('learningPath.inProgressModules')).toBeDefined()
    expect(screen.getByText('learningPath.notStartedModules')).toBeDefined()
  })

  it('初始状态应该显示正确的统计数字', () => {
    render(<ProgressOverview />)
    expect(screen.getAllByText('0').length).toBeGreaterThan(0)
    expect(screen.getByText('11')).toBeDefined()
  })

  it('应该渲染学习目标标题', () => {
    render(<ProgressOverview />)
    expect(screen.getByText('learningPath.learningGoal')).toBeDefined()
  })

  it('无目标时应该显示目标设定表单', () => {
    render(<ProgressOverview />)
    expect(screen.getByText('learningPath.targetSteps')).toBeDefined()
    expect(screen.getByText('learningPath.targetDate')).toBeDefined()
    expect(screen.getByText('learningPath.setGoal')).toBeDefined()
  })

  it('应该有目标步骤数输入框', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11')
    expect(input).toBeDefined()
    expect(input.getAttribute('type')).toBe('number')
  })

  it('应该有目标日期输入框', () => {
    render(<ProgressOverview />)
    const dateInput = document.querySelector('input[type="date"]')
    expect(dateInput).not.toBeNull()
  })

  it('应该有设定目标按钮', () => {
    render(<ProgressOverview />)
    const button = screen.getByText('learningPath.setGoal')
    expect(button.tagName).toBe('BUTTON')
  })

  it('设定目标后应该显示目标进度', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 5,
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    expect(screen.getByText(/0 \/ 5/)).toBeDefined()
    expect(screen.getByText('2026-12-31')).toBeDefined()
    expect(screen.getByText(/learningPath.goalProgress/)).toBeDefined()
  })

  it('设定目标后应该显示清除按钮', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 5,
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    expect(screen.getByTitle('learningPath.clearGoal')).toBeDefined()
  })

  it('设定目标后不应该显示目标设定表单', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 5,
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    expect(screen.queryByText('learningPath.setGoal')).toBeNull()
  })

  it('无目标时不应该显示清除按钮', () => {
    render(<ProgressOverview />)
    expect(screen.queryByTitle('learningPath.clearGoal')).toBeNull()
  })

  it('有进度时应该显示正确的完成率', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'stack'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    expect(screen.getByText('9%')).toBeDefined()
  })

  it('有进度时应该正确显示统计数字', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'stack', 'queue'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    const stats = screen.getAllByText('1')
    expect(stats.length).toBeGreaterThan(0)
    const inProgress = screen.getAllByText('2')
    expect(inProgress.length).toBeGreaterThan(0)
    const notStarted = screen.getAllByText('8')
    expect(notStarted.length).toBeGreaterThan(0)
  })

  it('输入目标步骤数应该更新输入框', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: '5' } })
    expect(input.value).toBe('5')
  })

  it('输入目标日期应该更新输入框', () => {
    render(<ProgressOverview />)
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2026-12-31' } })
    expect(dateInput.value).toBe('2026-12-31')
  })

  it('点击设定目标按钮应该保存目标到 localStorage', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: '5' } })
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.change(dateInput, { target: { value: '2026-12-31' } })
    const button = screen.getByText('learningPath.setGoal')
    fireEvent.click(button)

    const stored = JSON.parse(localStorage.getItem('ds-visualizer-learning-goal')!)
    expect(stored.targetSteps).toBe(5)
    expect(stored.targetDate).toBe('2026-12-31')
  })

  it('点击清除目标按钮应该从 localStorage 删除目标', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 5,
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    const clearButton = screen.getByTitle('learningPath.clearGoal')
    fireEvent.click(clearButton)
    expect(localStorage.getItem('ds-visualizer-learning-goal')).toBeNull()
  })

  it('进度环应该有 aria-label', () => {
    const { container } = render(<ProgressOverview />)
    const svg = container.querySelector('svg[role="img"]')
    expect(svg?.getAttribute('aria-label')).toContain('learningPath.overallCompletionRate')
  })

  it('全部完成时应该显示 100%', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree', 'heap', 'trie', 'hash', 'graph', 'sort'],
      completed: ['array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree', 'heap', 'trie', 'hash', 'graph', 'sort'],
      startedAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    expect(screen.getByText('100%')).toBeDefined()
  })

  it('目标步骤为空时设定目标按钮应该禁用', () => {
    render(<ProgressOverview />)
    const button = screen.getByText('learningPath.setGoal')
    expect(button).toBeDisabled()
  })

  it('目标步骤非数字时设定目标按钮应该禁用', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'abc' } })
    const button = screen.getByText('learningPath.setGoal')
    expect(button).toBeDisabled()
  })

  it('目标步骤小于等于0时设定目标按钮应该禁用', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: '0' } })
    const button = screen.getByText('learningPath.setGoal')
    expect(button).toBeDisabled()
  })

  it('目标步骤超过总模块数时设定目标按钮应该禁用', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: '12' } })
    const button = screen.getByText('learningPath.setGoal')
    expect(button).toBeDisabled()
  })

  it('禁用的设定目标按钮应该显示提示文案', () => {
    render(<ProgressOverview />)
    const button = screen.getByText('learningPath.setGoal')
    expect(button).toHaveAttribute('title')
    expect(button.getAttribute('title')).toContain('learningPath.targetStepsHint')
  })

  it('设定目标成功后应该显示成功 Toast', () => {
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(screen.getByText('learningPath.setGoal'))
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success', message: 'learningPath.goalSetSuccess' })
    )
  })

  it('设定目标失败后应该显示错误 Toast', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage full')
    })
    render(<ProgressOverview />)
    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    fireEvent.change(input, { target: { value: '5' } })
    fireEvent.click(screen.getByText('learningPath.setGoal'))
    expect(showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'learningPath.goalSetFailed' })
    )
    setItem.mockRestore()
  })

  it('清除目标后应该恢复空的输入态', () => {
    localStorage.setItem('ds-visualizer-learning-goal', JSON.stringify({
      targetSteps: 5,
      targetDate: '2026-12-31',
      createdAt: new Date().toISOString(),
    }))

    render(<ProgressOverview />)
    const clearButton = screen.getByTitle('learningPath.clearGoal')
    fireEvent.click(clearButton)

    const input = screen.getByPlaceholderText('11') as HTMLInputElement
    const dateInput = document.querySelector('input[type="date"]') as HTMLInputElement
    expect(input.value).toBe('')
    expect(dateInput.value).toBe('')
  })
})
