import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import HashPage from '../../pages/HashPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useHashState')
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

import { useHashState } from '../../hooks/useHashState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseHashState = vi.mocked(useHashState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockHashState(overrides = {}) {
  const base = createMockHistory([{ key: 12, value: 'Alice' }, { key: 25, value: 'Bob' }])
  return {
    ...base,
    data: base.data as { key: number; value: string }[],
    insert: vi.fn(),
    remove: vi.fn(),
    search: vi.fn(),
    loadData: vi.fn(),
    entryCount: 2,
    bucketCount: 7,
    hashFn: vi.fn((k: number) => k % 7),
    ...overrides,
  }
}

describe('HashPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseHashState.mockReturnValue(createMockHashState())
    renderWithRouter(<HashPage />)

    expect(screen.getByText('hash.title')).toBeInTheDocument()
    expect(screen.getByText('hash.insert')).toBeInTheDocument()
    expect(screen.getByText('hash.remove')).toBeInTheDocument()
    expect(screen.getByText('hash.search')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with key and value when insert button clicked', async () => {
    const mockState = createMockHashState()
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    const keyInput = screen.getByPlaceholderText('hash.keyPlaceholder')
    const valueInput = screen.getByPlaceholderText('hash.valuePlaceholder')

    fireEvent.change(keyInput, { target: { value: '42' } })
    fireEvent.change(valueInput, { target: { value: 'Charlie' } })
    fireEvent.click(screen.getByText('hash.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(42, 'Charlie')
    })
  })

  it('calls remove with key when delete button clicked', async () => {
    const mockState = createMockHashState()
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    const keyInput = screen.getByPlaceholderText('hash.keyPlaceholder')
    fireEvent.change(keyInput, { target: { value: '12' } })
    fireEvent.click(screen.getByText('hash.remove'))

    await waitFor(() => {
      expect(mockState.remove).toHaveBeenCalledWith(12)
    })
  })

  it('calls search with key when search button clicked', async () => {
    const mockState = createMockHashState()
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    const keyInput = screen.getByPlaceholderText('hash.keyPlaceholder')
    fireEvent.change(keyInput, { target: { value: '25' } })
    fireEvent.click(screen.getByText('hash.search'))

    await waitFor(() => {
      expect(mockState.search).toHaveBeenCalledWith(25)
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockHashState()
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockHashState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockHashState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockHashState({ isAnimating: true })
    mockedUseHashState.mockReturnValue(mockState)
    renderWithRouter(<HashPage />)

    expect(screen.getByText('hash.insert')).toBeDisabled()
    expect(screen.getByText('hash.remove')).toBeDisabled()
    expect(screen.getByText('hash.search')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
