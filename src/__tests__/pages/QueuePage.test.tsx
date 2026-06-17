import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import QueuePage from '../../pages/QueuePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useQueueState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: (): null => null,
}))

import { useQueueState } from '../../hooks/useQueueState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseQueueState = vi.mocked(useQueueState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockQueueState(overrides = {}) {
  const base = createMockHistory([10, 20, 30])
  return {
    ...base,
    data: base.data as number[],
    enqueue: vi.fn(),
    dequeue: vi.fn().mockReturnValue(10),
    front: vi.fn().mockReturnValue(10),
    clear: vi.fn(),
    loadData: vi.fn(),
    size: 3,
    ...overrides,
  }
}

describe('QueuePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseQueueState.mockReturnValue(createMockQueueState())
    renderWithRouter(<QueuePage />)

    expect(screen.getByText('queue.title')).toBeInTheDocument()
    expect(screen.getByText('+ queue.enqueue')).toBeInTheDocument()
    expect(screen.getByText('- queue.dequeue')).toBeInTheDocument()
    expect(screen.getByText('queue.peek')).toBeInTheDocument()
    expect(screen.getByText('common.clear')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls enqueue with value when enqueue button clicked', async () => {
    const mockState = createMockQueueState()
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(valueInput, { target: { value: '55' } })
    fireEvent.click(screen.getByText('+ queue.enqueue'))

    await waitFor(() => {
      expect(mockState.enqueue).toHaveBeenCalledWith(55)
    })
  })

  it('calls dequeue when dequeue button clicked', async () => {
    const mockState = createMockQueueState()
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    fireEvent.click(screen.getByText('- queue.dequeue'))
    await waitFor(() => {
      expect(mockState.dequeue).toHaveBeenCalled()
    })
  })

  it('calls front when peek button clicked', async () => {
    const mockState = createMockQueueState()
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    fireEvent.click(screen.getByText('queue.peek'))
    await waitFor(() => {
      expect(mockState.front).toHaveBeenCalled()
    })
  })

  it('calls clear when clear button clicked', () => {
    const mockState = createMockQueueState()
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(screen.getByText('common.clear'))
    expect(mockState.clear).toHaveBeenCalled()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockQueueState()
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockQueueState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockQueueState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockQueueState({ isAnimating: true })
    mockedUseQueueState.mockReturnValue(mockState)
    renderWithRouter(<QueuePage />)

    expect(screen.getByText('+ queue.enqueue')).toBeDisabled()
    expect(screen.getByText('- queue.dequeue')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
