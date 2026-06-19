import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import ArrayPage from '../../pages/ArrayPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useArrayState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: (): null => null,
}))

import { useArrayState } from '../../hooks/useArrayState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseArrayState = vi.mocked(useArrayState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockArrayState(overrides = {}) {
  const base = createMockHistory([8, 3, 12])
  return {
    ...base,
    data: base.data as number[],
    insert: vi.fn(),
    remove: vi.fn(),
    search: vi.fn().mockReturnValue(1),
    searchAll: vi.fn().mockReturnValue([1]),
    binarySearch: vi.fn().mockReturnValue(1),
    randomize: vi.fn(),
    loadData: vi.fn(),
    ...overrides,
  }
}

describe('ArrayPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseArrayState.mockReturnValue(createMockArrayState())
    renderWithRouter(<ArrayPage />)

    expect(screen.getByText('array.title')).toBeInTheDocument()
    expect(screen.getByText('array.insert')).toBeInTheDocument()
    expect(screen.getByText('common.delete')).toBeInTheDocument()
    expect(screen.getByText('common.search')).toBeInTheDocument()
    expect(screen.getByText('common.randomize')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value and index when insert button clicked', async () => {
    const mockState = createMockArrayState()
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    const indexInput = screen.getByPlaceholderText('array.indexPlaceholder')

    fireEvent.change(valueInput, { target: { value: '42' } })
    fireEvent.change(indexInput, { target: { value: '1' } })
    fireEvent.click(screen.getByText('array.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(42, 1)
    })
  })

  it('calls remove with index when delete button clicked', async () => {
    const mockState = createMockArrayState()
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    const indexInput = screen.getByPlaceholderText('array.indexPlaceholder')
    fireEvent.change(indexInput, { target: { value: '1' } })
    fireEvent.click(screen.getByText('common.delete'))

    await waitFor(() => {
      expect(mockState.remove).toHaveBeenCalledWith(1)
    })
  })

  it('calls search with value when search button clicked', () => {
    const mockState = createMockArrayState()
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    const valueInput = screen.getByPlaceholderText('array.valuePlaceholder')
    fireEvent.change(valueInput, { target: { value: '12' } })
    fireEvent.click(screen.getByText('common.search'))

    expect(mockState.search).toHaveBeenCalledWith(12)
  })

  it('calls randomize when randomize button clicked', () => {
    const mockState = createMockArrayState()
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    fireEvent.click(screen.getByText('common.randomize'))
    expect(mockState.randomize).toHaveBeenCalled()
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockArrayState()
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockArrayState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockArrayState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockArrayState({ isAnimating: true })
    mockedUseArrayState.mockReturnValue(mockState)
    renderWithRouter(<ArrayPage />)

    expect(screen.getByText('array.insert')).toBeDisabled()
    expect(screen.getByText('common.delete')).toBeDisabled()
    expect(screen.getByText('common.search')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
