import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import HeapPage from '../../pages/HeapPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useHeapState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))

import { useHeapState } from '../../hooks/useHeapState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseHeapState = vi.mocked(useHeapState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockHeapState(overrides = {}) {
  const base = createMockHistory([95, 80, 70, 60, 50])
  return {
    ...base,
    data: base.data as number[],
    insert: vi.fn(),
    extractMax: vi.fn().mockReturnValue(95),
    peek: vi.fn().mockReturnValue(95),
    loadData: vi.fn(),
    heapSize: 5,
    ...overrides,
  }
}

describe('HeapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseHeapState.mockReturnValue(createMockHeapState())
    renderWithRouter(<HeapPage />)

    expect(screen.getByText('heap.title')).toBeInTheDocument()
    expect(screen.getByText('heap.insert')).toBeInTheDocument()
    expect(screen.getByText('heap.extractMax')).toBeInTheDocument()
    expect(screen.getByText('heap.peek')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockHeapState()
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    const valueInput = screen.getByPlaceholderText('heap.inputPlaceholder')
    fireEvent.change(valueInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('heap.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(99)
    })
  })

  it('calls extractMax when extract button clicked', async () => {
    const mockState = createMockHeapState()
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    fireEvent.click(screen.getByText('heap.extractMax'))
    await waitFor(() => {
      expect(mockState.extractMax).toHaveBeenCalled()
    })
  })

  it('calls peek when peek button clicked', async () => {
    const mockState = createMockHeapState()
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    fireEvent.click(screen.getByText('heap.peek'))
    await waitFor(() => {
      expect(mockState.peek).toHaveBeenCalled()
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockHeapState()
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockHeapState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockHeapState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockHeapState({ isAnimating: true })
    mockedUseHeapState.mockReturnValue(mockState)
    renderWithRouter(<HeapPage />)

    expect(screen.getByText('heap.insert')).toBeDisabled()
    expect(screen.getByText('heap.extractMax')).toBeDisabled()
    expect(screen.getByText('heap.peek')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
