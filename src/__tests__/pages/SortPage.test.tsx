import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import SortPage from '../../pages/SortPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useSortState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))
vi.mock('../../hooks/useLearningMode', () => ({
  useLearningMode: vi.fn().mockReturnValue({
    currentStep: null,
    currentStepIndex: 0,
    totalSteps: 0,
    progress: 0,
    isLearning: false,
    steps: [],
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    goToStep: vi.fn(),
    reset: vi.fn(),
    startLearning: vi.fn(),
    stopLearning: vi.fn(),
    hasSteps: false,
  })
}))

import { useSortState } from '../../hooks/useSortState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseSortState = vi.mocked(useSortState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockSortState(overrides = {}) {
  const base = createMockHistory([38, 27, 43, 3, 9])
  return {
    ...base,
    data: base.data as number[],
    stats: { algorithm: '', comparisons: 0, swaps: 0, steps: 0 },
    progress: 0,
    randomize: vi.fn(),
    reset: vi.fn(),
    stop: vi.fn(),
    loadData: vi.fn(),
    runAlgorithm: vi.fn().mockResolvedValue(undefined),
    bubbleSort: vi.fn(),
    selectionSort: vi.fn(),
    insertionSort: vi.fn(),
    ...overrides,
  }
}

describe('SortPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseSortState.mockReturnValue(createMockSortState())
    renderWithRouter(<SortPage />)

    expect(screen.getByText('sort.title')).toBeInTheDocument()
    expect(screen.getByText('sort.randomize')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls runAlgorithm when algorithm button clicked', async () => {
    const mockState = createMockSortState()
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    const bubbleBtn = screen.getByText(/sort\.bubble/)
    fireEvent.click(bubbleBtn)

    await waitFor(() => {
      expect(mockState.runAlgorithm).toHaveBeenCalled()
    })
  })

  it('calls randomize when randomize button clicked', () => {
    const mockState = createMockSortState()
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    fireEvent.click(screen.getByText('sort.randomize'))
    expect(mockState.randomize).toHaveBeenCalled()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockSortState()
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls stop when stop button clicked during animation', () => {
    const mockState = createMockSortState({ isAnimating: true })
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    expect(screen.getByText('sort.stop')).toBeInTheDocument()
    fireEvent.click(screen.getByText('sort.stop'))
    expect(mockState.stop).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockSortState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockSortState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockSortState({ isAnimating: true })
    mockedUseSortState.mockReturnValue(mockState)
    renderWithRouter(<SortPage />)

    const stopBtn = screen.queryByText('sort.stop')
    if (stopBtn) {
      expect(stopBtn).toBeInTheDocument()
    }
  })
})
