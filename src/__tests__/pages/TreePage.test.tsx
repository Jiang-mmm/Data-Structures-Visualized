import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import TreePage from '../../pages/TreePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useTreeState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../hooks/useLearningMode', () => ({
  useLearningMode: vi.fn().mockReturnValue({
    currentStep: null,
    currentStepIndex: 0,
    totalSteps: 0,
    progress: 0,
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    reset: vi.fn(),
  }),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))

import { useTreeState } from '../../hooks/useTreeState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseTreeState = vi.mocked(useTreeState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockTreeState(overrides = {}) {
  const base = createMockHistory([50, 30, 70, 20, 40, 60, 80])
  return {
    ...base,
    data: base.data as number[],
    insert: vi.fn(),
    search: vi.fn().mockReturnValue({ found: 2, path: [0, 2] }),
    deleteNode: vi.fn().mockReturnValue(2),
    preorder: vi.fn().mockReturnValue([0, 1, 3, 4, 2, 5, 6]),
    inorder: vi.fn().mockReturnValue([3, 1, 4, 0, 5, 2, 6]),
    postorder: vi.fn().mockReturnValue([3, 4, 1, 5, 6, 2, 0]),
    levelorder: vi.fn().mockReturnValue([0, 1, 2, 3, 4, 5, 6]),
    loadData: vi.fn(),
    nodeCount: 7,
    ...overrides,
  }
}

describe('TreePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseTreeState.mockReturnValue(createMockTreeState())
    renderWithRouter(<TreePage />)

    expect(screen.getByText('tree.title')).toBeInTheDocument()
    expect(screen.getByText('tree.insert')).toBeInTheDocument()
    expect(screen.getByText('common.delete')).toBeInTheDocument()
    expect(screen.getByText('tree.search')).toBeInTheDocument()
    expect(screen.getByText('tree.preorder')).toBeInTheDocument()
    expect(screen.getByText('tree.inorder')).toBeInTheDocument()
    // Buttons inside collapsed OperationGroup
    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('tree.postorder')).toBeInTheDocument()
    expect(screen.getByText('tree.levelorder')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    const valueInput = screen.getAllByPlaceholderText('array.valuePlaceholder')[0]
    fireEvent.change(valueInput, { target: { value: '55' } })
    fireEvent.click(screen.getByText('tree.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(55)
    })
  })

  it('calls deleteNode with value when delete button clicked', async () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    const valueInput = screen.getAllByPlaceholderText('array.valuePlaceholder')[0]
    fireEvent.change(valueInput, { target: { value: '70' } })
    fireEvent.click(screen.getByText('common.delete'))

    await waitFor(() => {
      expect(mockState.deleteNode).toHaveBeenCalledWith(70)
    })
  })

  it('calls search with value when search button clicked', () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    const searchInput = screen.getAllByPlaceholderText('array.valuePlaceholder')[1]
    fireEvent.change(searchInput, { target: { value: '30' } })
    fireEvent.click(screen.getByText('tree.search'))

    expect(mockState.search).toHaveBeenCalledWith(30)
  })

  it('calls preorder when preorder button clicked', () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText('tree.preorder'))
    expect(mockState.preorder).toHaveBeenCalled()
  })

  it('calls inorder when inorder button clicked', () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText('tree.inorder'))
    expect(mockState.inorder).toHaveBeenCalled()
  })

  it('calls postorder when postorder button clicked', () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('tree.postorder'))
    expect(mockState.postorder).toHaveBeenCalled()
  })

  it('calls levelorder when levelorder button clicked', () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('tree.levelorder'))
    expect(mockState.levelorder).toHaveBeenCalled()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockTreeState()
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockTreeState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockTreeState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockTreeState({ isAnimating: true })
    mockedUseTreeState.mockReturnValue(mockState)
    renderWithRouter(<TreePage />)

    expect(screen.getByText('tree.insert')).toBeDisabled()
    expect(screen.getByText('common.delete')).toBeDisabled()
    expect(screen.getByText('tree.search')).toBeDisabled()
    expect(screen.getByText('tree.preorder')).toBeDisabled()
    expect(screen.getByText('tree.inorder')).toBeDisabled()
    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('tree.postorder')).toBeDisabled()
    expect(screen.getByText('tree.levelorder')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
