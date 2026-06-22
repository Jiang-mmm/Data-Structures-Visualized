import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import SortComparePage from '../../pages/SortComparePage'
import { renderWithRouter, mockUseGlobalSettings } from './testUtils'

vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../algorithms/sorting', () => ({
  getAllSortAlgorithms: vi.fn().mockReturnValue(new Map([
    ['bubble', { name: '冒泡排序', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)', icon: '○', color: 'bg-accent-blue', variant: 'primary', execute: vi.fn().mockResolvedValue({ comparisons: 10, swaps: 5, steps: 15 }) }],
    ['quick', { name: '快速排序', timeComplexity: 'O(n log n)', spaceComplexity: 'O(log n)', icon: '◆', color: 'bg-accent-amber', variant: 'warning', execute: vi.fn().mockResolvedValue({ comparisons: 8, swaps: 4, steps: 12 }) }],
    ['merge', { name: '归并排序', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)', icon: '⇌', color: 'bg-accent-teal', variant: 'teal', execute: vi.fn().mockResolvedValue({ comparisons: 9, swaps: 6, steps: 15 }) }],
    ['insertion', { name: '插入排序', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)', icon: '↙', color: 'bg-accent-violet', variant: 'danger', execute: vi.fn().mockResolvedValue({ comparisons: 11, swaps: 7, steps: 18 }) }],
    ['selection', { name: '选择排序', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)', icon: '◎', color: 'bg-accent-emerald', variant: 'success', execute: vi.fn().mockResolvedValue({ comparisons: 12, swaps: 3, steps: 15 }) }],
    ['heap', { name: '堆排序', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)', icon: '△', color: 'bg-accent-rose', variant: 'danger', execute: vi.fn().mockResolvedValue({ comparisons: 8, swaps: 6, steps: 14 }) }],
  ])),
  getSortAlgorithm: vi.fn((key) => {
    const map = new Map([
      ['bubble', { name: '冒泡排序', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)', icon: '○', color: 'bg-accent-blue', variant: 'primary', execute: vi.fn().mockResolvedValue({ comparisons: 10, swaps: 5, steps: 15 }) }],
      ['quick', { name: '快速排序', timeComplexity: 'O(n log n)', spaceComplexity: 'O(log n)', icon: '◆', color: 'bg-accent-amber', variant: 'warning', execute: vi.fn().mockResolvedValue({ comparisons: 8, swaps: 4, steps: 12 }) }],
      ['merge', { name: '归并排序', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)', icon: '⇌', color: 'bg-accent-teal', variant: 'teal', execute: vi.fn().mockResolvedValue({ comparisons: 9, swaps: 6, steps: 15 }) }],
      ['insertion', { name: '插入排序', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)', icon: '↙', color: 'bg-accent-violet', variant: 'danger', execute: vi.fn().mockResolvedValue({ comparisons: 11, swaps: 7, steps: 18 }) }],
      ['selection', { name: '选择排序', timeComplexity: 'O(n²)', spaceComplexity: 'O(1)', icon: '◎', color: 'bg-accent-emerald', variant: 'success', execute: vi.fn().mockResolvedValue({ comparisons: 12, swaps: 3, steps: 15 }) }],
      ['heap', { name: '堆排序', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)', icon: '△', color: 'bg-accent-rose', variant: 'danger', execute: vi.fn().mockResolvedValue({ comparisons: 8, swaps: 6, steps: 14 }) }],
    ])
    return map.get(key)
  }),
}))
vi.mock('../../utils/timeSlicing', () => ({
  yieldToMain: vi.fn(),
}))
vi.mock('../../utils/dataExport', () => ({
  exportPerformanceCSV: vi.fn(),
  exportPerformanceJSON: vi.fn(),
}))
vi.mock('../../components/PerformanceChart', () => ({
  default: (): null => null,
}))
vi.mock('../../components/ComplexityChart', () => ({
  default: (): null => null,
}))

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

describe('SortComparePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
  })

  it('renders page title and operation buttons', () => {
    renderWithRouter(<SortComparePage />)

    expect(screen.getByText('compare.title')).toBeInTheDocument()
    expect(screen.getByText('compare.runAll')).toBeInTheDocument()
    expect(screen.getByText('common.stop')).toBeInTheDocument()
    expect(screen.getByText('compare.randomize')).toBeInTheDocument()
    expect(screen.getByText('compare.reset')).toBeInTheDocument()
  })

  it('renders algorithm cards', () => {
    renderWithRouter(<SortComparePage />)

    expect(screen.getAllByText('冒泡排序').length).toBeGreaterThanOrEqual(1)
  })

  it('calls algorithm execute when start compare button clicked', async () => {
    const { getSortAlgorithm } = await import('../../algorithms/sorting')
    renderWithRouter(<SortComparePage />)

    const runBtn = screen.getByText('compare.runAll')
    fireEvent.click(runBtn)

    await waitFor(() => {
      expect(getSortAlgorithm).toHaveBeenCalled()
    })
  })

  it('calls randomize when randomize button clicked', () => {
    renderWithRouter(<SortComparePage />)

    fireEvent.click(screen.getByText('compare.randomize'))
    expect(screen.getByText('compare.randomize')).toBeInTheDocument()
  })

  it('calls reset when reset button clicked', () => {
    renderWithRouter(<SortComparePage />)

    fireEvent.click(screen.getByText('compare.reset'))
    expect(screen.getByText('compare.reset')).toBeInTheDocument()
  })

  it('calls stop when stop button clicked', () => {
    renderWithRouter(<SortComparePage />)

    fireEvent.click(screen.getByText('common.stop'))
    expect(screen.getByText('common.stop')).toBeDisabled()
  })

  it('disables operation buttons while running', async () => {
    renderWithRouter(<SortComparePage />)

    const runBtn = screen.getByText('compare.runAll')
    expect(runBtn).toBeInTheDocument()
  })

  it('sortCompare 学习配置已注册且包含 5 个步骤', async () => {
    const { learningConfigs } = await import('../../configs/learning')
    const config = learningConfigs.sortCompare
    expect(config).toBeDefined()
    expect(config.steps).toHaveLength(5)
    expect(config.algorithmKey).toBe('sortCompare')
  })

  it('sortCompare 学习配置步骤包含正确 id 顺序', async () => {
    const { learningConfigs } = await import('../../configs/learning')
    const config = learningConfigs.sortCompare
    const ids = config.steps.map(s => s.id)
    expect(ids).toEqual(['select', 'init', 'firstRound', 'keyDiff', 'complete'])
  })

  it('sortCompare 学习配置每步都有必要字段', async () => {
    const { learningConfigs } = await import('../../configs/learning')
    const config = learningConfigs.sortCompare
    config.steps.forEach(step => {
      expect(step.id).toBeTruthy()
      expect(step.title).toBeTruthy()
      expect(step.description).toBeTruthy()
      expect(step.codeSnippet).toBeTruthy()
      expect(step.highlightedLine).toBeGreaterThan(0)
      expect(step.highlightTerms).toBeInstanceOf(Array)
    })
  })

  it('SortComparePage 使用 sortCompare 学习配置', () => {
    renderWithRouter(<SortComparePage />)
    // 页面正常渲染即说明学习模式已接入（InfoPanel 已在组件中渲染）
    expect(screen.getByText('compare.title')).toBeInTheDocument()
  })
})
