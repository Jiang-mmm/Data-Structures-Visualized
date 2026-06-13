import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import StackPage from '../../pages/StackPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useStackState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))

import { useStackState } from '../../hooks/useStackState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseStackState = vi.mocked(useStackState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockStackState(overrides = {}) {
  const base = createMockHistory([8, 17, 42])
  return {
    ...base,
    data: base.data as number[],
    push: vi.fn(),
    pop: vi.fn().mockReturnValue(42),
    peek: vi.fn().mockReturnValue(42),
    clear: vi.fn(),
    loadData: vi.fn(),
    size: 3,
    ...overrides,
  }
}

describe('StackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseStackState.mockReturnValue(createMockStackState())
    renderWithRouter(<StackPage />)

    expect(screen.getByText('stack.title')).toBeInTheDocument()
    expect(screen.getByText('+ stack.push')).toBeInTheDocument()
    expect(screen.getByText('- stack.pop')).toBeInTheDocument()
    expect(screen.getByText('stack.peek')).toBeInTheDocument()
    expect(screen.getByText('common.clear')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls push with value when push button clicked', async () => {
    const mockState = createMockStackState()
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(valueInput, { target: { value: '99' } })
    fireEvent.click(screen.getByText('+ stack.push'))

    await waitFor(() => {
      expect(mockState.push).toHaveBeenCalledWith(99)
    })
  })

  it('calls pop when pop button clicked', async () => {
    const mockState = createMockStackState()
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    fireEvent.click(screen.getByText('- stack.pop'))
    await waitFor(() => {
      expect(mockState.pop).toHaveBeenCalled()
    })
  })

  it('calls peek when peek button clicked', async () => {
    const mockState = createMockStackState()
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    fireEvent.click(screen.getByText('stack.peek'))
    await waitFor(() => {
      expect(mockState.peek).toHaveBeenCalled()
    })
  })

  it('calls clear when clear button clicked', () => {
    const mockState = createMockStackState()
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    fireEvent.click(screen.getByText('common.clear'))
    expect(mockState.clear).toHaveBeenCalled()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockStackState()
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockStackState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockStackState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockStackState({ isAnimating: true })
    mockedUseStackState.mockReturnValue(mockState)
    renderWithRouter(<StackPage />)

    expect(screen.getByText('+ stack.push')).toBeDisabled()
    expect(screen.getByText('- stack.pop')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
