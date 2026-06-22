import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import AvlTreePage from '../../pages/AvlTreePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useAvlTreeState')
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

import { useAvlTreeState } from '../../hooks/useAvlTreeState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseAvlTreeState = vi.mocked(useAvlTreeState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockAvlState(overrides = {}) {
  const base = createMockHistory([50, 30, 70])
  return {
    ...base,
    insert: vi.fn(),
    deleteNode: vi.fn(),
    search: vi.fn().mockReturnValue({ found: true, path: [50, 30] }),
    preorder: vi.fn().mockReturnValue([50, 30, 70]),
    inorder: vi.fn().mockReturnValue([30, 50, 70]),
    postorder: vi.fn().mockReturnValue([30, 70, 50]),
    levelorder: vi.fn().mockReturnValue([50, 30, 70]),
    getFlattened: vi.fn().mockReturnValue({ nodes: [], edges: [] }),
    nodeCount: 3,
    ...overrides,
  }
}

describe('AvlTreePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and primary operation buttons', () => {
    mockedUseAvlTreeState.mockReturnValue(createMockAvlState() as any)
    renderWithRouter(<AvlTreePage />)

    expect(screen.getByText('avlTree.title')).toBeInTheDocument()
    expect(screen.getByText('avlTree.insert')).toBeInTheDocument()
    expect(screen.getByText('common.delete')).toBeInTheDocument()
    expect(screen.getByText('avlTree.search')).toBeInTheDocument()
    expect(screen.getByText('avlTree.preorder')).toBeInTheDocument()
    expect(screen.getByText('avlTree.inorder')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
  })

  it('expands OperationGroup to show postorder/levelorder/undo/redo', () => {
    mockedUseAvlTreeState.mockReturnValue(createMockAvlState() as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('avlTree.postorder')).toBeInTheDocument()
    expect(screen.getByText('avlTree.levelorder')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    const valueInput = screen.getAllByPlaceholderText('array.valuePlaceholder')[0]
    fireEvent.change(valueInput, { target: { value: '55' } })
    fireEvent.click(screen.getByText('avlTree.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(55)
    })
  })

  it('calls deleteNode with value when delete button clicked', async () => {
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    const valueInput = screen.getAllByPlaceholderText('array.valuePlaceholder')[0]
    fireEvent.change(valueInput, { target: { value: '70' } })
    fireEvent.click(screen.getByText('common.delete'))

    await waitFor(() => {
      expect(mockState.deleteNode).toHaveBeenCalledWith(70)
    })
  })

  it('calls search with value when search button clicked', () => {
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    const searchInput = screen.getAllByPlaceholderText('array.valuePlaceholder')[1]
    fireEvent.change(searchInput, { target: { value: '30' } })
    fireEvent.click(screen.getByText('avlTree.search'))

    expect(mockState.search).toHaveBeenCalledWith(30)
  })

  it('calls preorder when preorder button clicked', async () => {
    vi.useFakeTimers()
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText('avlTree.preorder'))
    await vi.advanceTimersByTimeAsync(1500)
    expect(mockState.preorder).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls inorder when inorder button clicked', async () => {
    vi.useFakeTimers()
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText('avlTree.inorder'))
    await vi.advanceTimersByTimeAsync(1500)
    expect(mockState.inorder).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls postorder when postorder button clicked', async () => {
    vi.useFakeTimers()
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('avlTree.postorder'))
    await vi.advanceTimersByTimeAsync(1500)
    expect(mockState.postorder).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls levelorder when levelorder button clicked', async () => {
    vi.useFakeTimers()
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('avlTree.levelorder'))
    await vi.advanceTimersByTimeAsync(1500)
    expect(mockState.levelorder).toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockAvlState()
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockAvlState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockAvlState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockAvlState({ isAnimating: true })
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    expect(screen.getByText('avlTree.insert')).toBeDisabled()
    expect(screen.getByText('common.delete')).toBeDisabled()
    expect(screen.getByText('avlTree.search')).toBeDisabled()
    expect(screen.getByText('avlTree.preorder')).toBeDisabled()
    expect(screen.getByText('avlTree.inorder')).toBeDisabled()
  })

  it('shows stop button while animating', () => {
    const mockState = createMockAvlState({ isAnimating: true })
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    expect(screen.getByText('common.stop')).toBeInTheDocument()
  })

  it('renders node count info', () => {
    const mockState = createMockAvlState({ nodeCount: 5 })
    mockedUseAvlTreeState.mockReturnValue(mockState as any)
    renderWithRouter(<AvlTreePage />)

    expect(screen.getByText(/NODES: 5/)).toBeInTheDocument()
  })
})
