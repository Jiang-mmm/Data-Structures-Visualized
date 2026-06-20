import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import RedBlackTreePage from '../../pages/RedBlackTreePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useRedBlackTreeState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../hooks/useLearningMode', () => ({
  useLearningMode: vi.fn().mockReturnValue({
    steps: [],
    currentStep: null,
    currentStepIndex: 0,
    totalSteps: 0,
    progress: 0,
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    reset: vi.fn(),
    goToStep: vi.fn(),
  }),
}))
vi.mock('../../hooks/useSharedData', () => ({
  useSharedData: vi.fn(),
}))
vi.mock('../../hooks/usePageTracker', () => ({
  usePageTracker: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: (): null => null,
}))

import { useRedBlackTreeState } from '../../hooks/useRedBlackTreeState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseRedBlackTreeState = vi.mocked(useRedBlackTreeState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockRedBlackTreeState(overrides = {}) {
  const base = createMockHistory([50, 30, 70, 20, 40, 60, 80])
  return {
    ...base,
    data: base.data,
    insert: vi.fn(),
    search: vi.fn().mockReturnValue({ found: true, path: [50, 30] }),
    inorder: vi.fn().mockReturnValue([20, 30, 40, 50, 60, 70, 80]),
    getFlattened: vi.fn().mockReturnValue({ nodes: [], edges: [] }),
    nodeCount: 7,
    ...overrides,
  }
}

describe('RedBlackTreePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseRedBlackTreeState.mockReturnValue(createMockRedBlackTreeState() as any)
    renderWithRouter(<RedBlackTreePage />)

    expect(screen.getByText('redBlackTree.title')).toBeInTheDocument()
    expect(screen.getByText('redBlackTree.insert')).toBeInTheDocument()
    expect(screen.getByText('redBlackTree.search')).toBeInTheDocument()
    expect(screen.getByText('redBlackTree.inorder')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockRedBlackTreeState()
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    const inputs = screen.getAllByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(inputs[0], { target: { value: '42' } })
    fireEvent.click(screen.getByText('redBlackTree.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(42)
    })
  })

  it('calls search with value when search button clicked', async () => {
    const mockState = createMockRedBlackTreeState()
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    const inputs = screen.getAllByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(inputs[1], { target: { value: '30' } })
    fireEvent.click(screen.getByText('redBlackTree.search'))

    await waitFor(() => {
      expect(mockState.search).toHaveBeenCalledWith(30)
    })
  })

  it('calls inorder when inorder button clicked', async () => {
    vi.useFakeTimers()
    const mockState = createMockRedBlackTreeState()
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    fireEvent.click(screen.getByText('redBlackTree.inorder'))
    await vi.advanceTimersByTimeAsync(1500)
    expect(mockState.inorder).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockRedBlackTreeState()
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockRedBlackTreeState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockRedBlackTreeState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockRedBlackTreeState({ isAnimating: true })
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    expect(screen.getByText('redBlackTree.insert')).toBeDisabled()
    expect(screen.getByText('redBlackTree.search')).toBeDisabled()
    expect(screen.getByText('redBlackTree.inorder')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })

  it('shows stop button while animating', () => {
    const mockState = createMockRedBlackTreeState({ isAnimating: true })
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    expect(screen.getByText('common.stop')).toBeInTheDocument()
  })

  it('renders color legend with red and black node labels', () => {
    const mockState = createMockRedBlackTreeState()
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    expect(screen.getByText('nodeLegend.redNode')).toBeInTheDocument()
    expect(screen.getByText('nodeLegend.blackNode')).toBeInTheDocument()
  })

  it('renders node count info', () => {
    const mockState = createMockRedBlackTreeState({ nodeCount: 7 })
    mockedUseRedBlackTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<RedBlackTreePage />)

    expect(screen.getByText(/NODES: 7/)).toBeInTheDocument()
  })
})
