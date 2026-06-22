import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import BTreePage from '../../pages/BTreePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useBTreeState')
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

import { useBTreeState } from '../../hooks/useBTreeState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseBTreeState = vi.mocked(useBTreeState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockBTreeState(overrides = {}) {
  const base = createMockHistory([])
  return {
    ...base,
    data: base.data,
    insert: vi.fn(),
    search: vi.fn().mockReturnValue({ found: true, path: [[20], [10]] }),
    inorder: vi.fn().mockReturnValue([5, 6, 7, 10, 12, 17, 20, 30]),
    getFlattened: vi.fn().mockReturnValue({ nodes: [], edges: [] }),
    nodeCount: 8,
    keyCount: 8,
    ...overrides,
  }
}

describe('BTreePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseBTreeState.mockReturnValue(createMockBTreeState() as never)
    renderWithRouter(<BTreePage />)

    expect(screen.getByText('bTree.title')).toBeInTheDocument()
    expect(screen.getByText('bTree.insert')).toBeInTheDocument()
    expect(screen.getByText('bTree.search')).toBeInTheDocument()
    expect(screen.getByText('bTree.inorder')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockBTreeState()
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    const inputs = screen.getAllByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(inputs[0], { target: { value: '42' } })
    fireEvent.click(screen.getByText('bTree.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(42)
    })
  })

  it('calls search with value when search button clicked', async () => {
    const mockState = createMockBTreeState()
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    const inputs = screen.getAllByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(inputs[1], { target: { value: '30' } })
    fireEvent.click(screen.getByText('bTree.search'))

    await waitFor(() => {
      expect(mockState.search).toHaveBeenCalledWith(30)
    })
  })

  it('calls inorder when inorder button clicked', async () => {
    vi.useFakeTimers()
    const mockState = createMockBTreeState()
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    fireEvent.click(screen.getByText('bTree.inorder'))
    await vi.advanceTimersByTimeAsync(1500)
    expect(mockState.inorder).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockBTreeState()
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockBTreeState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockBTreeState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockBTreeState({ isAnimating: true })
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    expect(screen.getByText('bTree.insert')).toBeDisabled()
    expect(screen.getByText('bTree.search')).toBeDisabled()
    expect(screen.getByText('bTree.inorder')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })

  it('shows stop button while animating', () => {
    const mockState = createMockBTreeState({ isAnimating: true })
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    expect(screen.getByText('common.stop')).toBeInTheDocument()
  })

  it('renders node count info', () => {
    const mockState = createMockBTreeState({ nodeCount: 8, keyCount: 8 })
    mockedUseBTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<BTreePage />)

    expect(screen.getByText(/NODES: 8/)).toBeInTheDocument()
    expect(screen.getByText(/KEYS: 8/)).toBeInTheDocument()
  })
})
