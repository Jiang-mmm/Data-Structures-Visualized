import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import SkipListPage from '../../pages/SkipListPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer } from './testUtils'

vi.mock('../../hooks/useSkipListState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../hooks/useLearningMode', () => ({
  useLearningMode: vi.fn(() => ({
    steps: [],
    currentStepIndex: 0,
    currentStep: null,
    isActive: false,
    isAnimating: false,
    goToStep: vi.fn(),
    nextStep: vi.fn(),
    prevStep: vi.fn(),
    toggleActive: vi.fn(),
    setIsAnimating: vi.fn(),
  })),
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

import { useSkipListState } from '../../hooks/useSkipListState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseSkipListState = vi.mocked(useSkipListState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockSkipListState(overrides = {}) {
  return {
    data: { nodes: [], edges: [], maxLevel: 1 } as any,
    loadData: vi.fn(),
    logs: [] as Array<{ type: string; message: string; time?: string }>,
    isAnimating: false,
    setIsAnimating: vi.fn(),
    insert: vi.fn(),
    remove: vi.fn(),
    search: vi.fn().mockReturnValue({ found: true, path: [] }),
    size: vi.fn().mockReturnValue(5),
    values: vi.fn().mockReturnValue([10, 20, 30, 40, 50]),
    reset: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn().mockReturnValue(false),
    canRedo: vi.fn().mockReturnValue(false),
    getUndoPreview: vi.fn().mockReturnValue(null),
    getRedoPreview: vi.fn().mockReturnValue(null),
    ...overrides,
  }
}

describe('SkipListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseSkipListState.mockReturnValue(createMockSkipListState() as any)
    renderWithRouter(<SkipListPage />)

    expect(screen.getByText('skipList.title')).toBeInTheDocument()
    expect(screen.getByText('skipList.insert')).toBeInTheDocument()
    expect(screen.getByText('skipList.delete')).toBeInTheDocument()
    expect(screen.getByText('skipList.search')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockSkipListState()
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    const input = screen.getByPlaceholderText('skipList.inputPlaceholder')
    fireEvent.change(input, { target: { value: '42' } })
    fireEvent.click(screen.getByText('skipList.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(42)
    })
  })

  it('calls remove with value when delete button clicked', async () => {
    const mockState = createMockSkipListState()
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    const input = screen.getByPlaceholderText('skipList.inputPlaceholder')
    fireEvent.change(input, { target: { value: '30' } })
    fireEvent.click(screen.getByText('skipList.delete'))

    await waitFor(() => {
      expect(mockState.remove).toHaveBeenCalledWith(30)
    })
  })

  it('calls search with value when search button clicked', async () => {
    const mockState = createMockSkipListState()
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    const input = screen.getByPlaceholderText('skipList.inputPlaceholder')
    fireEvent.change(input, { target: { value: '20' } })
    fireEvent.click(screen.getByText('skipList.search'))

    await waitFor(() => {
      expect(mockState.search).toHaveBeenCalledWith(20)
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockSkipListState()
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockSkipListState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockSkipListState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockSkipListState({ isAnimating: true })
    mockedUseSkipListState.mockReturnValue(mockState as any)
    renderWithRouter(<SkipListPage />)

    expect(screen.getByText('skipList.insert')).toBeDisabled()
    expect(screen.getByText('skipList.delete')).toBeDisabled()
    expect(screen.getByText('skipList.search')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })

  it('renders Visualizer component', () => {
    const mockState = createMockSkipListState()
    mockedUseSkipListState.mockReturnValue(mockState as any)
    expect(() => renderWithRouter(<SkipListPage />)).not.toThrow()
  })
})
