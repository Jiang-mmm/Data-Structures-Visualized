import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import LinkedListPage from '../../pages/LinkedListPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useLinkedListState')
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

import { useLinkedListState } from '../../hooks/useLinkedListState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseLinkedListState = vi.mocked(useLinkedListState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockLinkedListState(overrides = {}) {
  const base = createMockHistory([10, 20, 30, 40])
  return {
    ...base,
    data: base.data as number[],
    insertHead: vi.fn(),
    insertTail: vi.fn(),
    insertAt: vi.fn().mockReturnValue(true),
    deleteAt: vi.fn().mockReturnValue(20),
    search: vi.fn().mockReturnValue(1),
    reverse: vi.fn().mockReturnValue([40, 30, 20, 10]),
    detectCycle: vi.fn().mockReturnValue({ hasCycle: false, steps: [] }),
    loadData: vi.fn(),
    length: 4,
    ...overrides,
  }
}

describe('LinkedListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseLinkedListState.mockReturnValue(createMockLinkedListState())
    renderWithRouter(<LinkedListPage />)

    expect(screen.getByText('linkedlist.title')).toBeInTheDocument()
    expect(screen.getByText('linkedlist.pushFront')).toBeInTheDocument()
    expect(screen.getByText('linkedlist.pushBack')).toBeInTheDocument()
    expect(screen.getByText('common.delete')).toBeInTheDocument()
    expect(screen.getByText('linkedlist.find')).toBeInTheDocument()
    // Buttons inside collapsed OperationGroup
    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('linkedlist.insertAt')).toBeInTheDocument()
    expect(screen.getByText('linkedlist.reverse')).toBeInTheDocument()
    expect(screen.getByText('linkedlist.detectCycle')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insertHead with value when pushFront button clicked', async () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(valueInput, { target: { value: '5' } })
    fireEvent.click(screen.getByText('linkedlist.pushFront'))

    await waitFor(() => {
      expect(mockState.insertHead).toHaveBeenCalledWith(5)
    })
  })

  it('calls insertTail with value when pushBack button clicked', async () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(valueInput, { target: { value: '50' } })
    fireEvent.click(screen.getByText('linkedlist.pushBack'))

    await waitFor(() => {
      expect(mockState.insertTail).toHaveBeenCalledWith(50)
    })
  })

  it('calls insertAt with index and value when insertAt button clicked', async () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    const indexInput = screen.getByPlaceholderText('array.indexPlaceholder')
    fireEvent.change(valueInput, { target: { value: '25' } })
    fireEvent.change(indexInput, { target: { value: '2' } })
    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('linkedlist.insertAt'))

    await waitFor(() => {
      expect(mockState.insertAt).toHaveBeenCalledWith(2, 25)
    })
  })

  it('calls deleteAt with index when delete button clicked', async () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    const indexInput = screen.getByPlaceholderText('array.indexPlaceholder')
    fireEvent.change(indexInput, { target: { value: '1' } })
    fireEvent.click(screen.getByText('common.delete'))

    await waitFor(() => {
      expect(mockState.deleteAt).toHaveBeenCalledWith(1)
    })
  })

  it('calls search with value when find button clicked', () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(valueInput, { target: { value: '20' } })
    fireEvent.click(screen.getByText('linkedlist.find'))

    expect(mockState.search).toHaveBeenCalledWith(20)
  })

  it('calls reverse when reverse button clicked', async () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('linkedlist.reverse'))
    await waitFor(() => {
      expect(mockState.reverse).toHaveBeenCalled()
    })
  })

  it('calls detectCycle when detectCycle button clicked', () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('linkedlist.detectCycle'))
    expect(mockState.detectCycle).toHaveBeenCalled()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockLinkedListState()
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockLinkedListState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockLinkedListState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockLinkedListState({ isAnimating: true })
    mockedUseLinkedListState.mockReturnValue(mockState)
    renderWithRouter(<LinkedListPage />)

    expect(screen.getByText('linkedlist.pushFront')).toBeDisabled()
    expect(screen.getByText('linkedlist.pushBack')).toBeDisabled()
    expect(screen.getByText('common.delete')).toBeDisabled()
    expect(screen.getByText('linkedlist.find')).toBeDisabled()
    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('linkedlist.insertAt')).toBeDisabled()
    expect(screen.getByText('linkedlist.reverse')).toBeDisabled()
    expect(screen.getByText('linkedlist.detectCycle')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
