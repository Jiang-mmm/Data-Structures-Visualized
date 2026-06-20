import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import UnionFindPage from '../../pages/UnionFindPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer } from './testUtils'

vi.mock('../../hooks/useUnionFindState')
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

import { useUnionFindState } from '../../hooks/useUnionFindState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseUnionFindState = vi.mocked(useUnionFindState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockUnionFindState(overrides = {}) {
  return {
    data: { nodes: [], edges: [], parent: {}, rank: {} } as any,
    loadData: vi.fn(),
    logs: [] as Array<{ type: string; message: string; time?: string }>,
    isAnimating: false,
    setIsAnimating: vi.fn(),
    insert: vi.fn(),
    remove: vi.fn(),
    find: vi.fn().mockReturnValue({ data: {}, rootId: 'n1', path: [] }),
    union: vi.fn(),
    checkConnected: vi.fn().mockReturnValue(false),
    size: vi.fn().mockReturnValue(8),
    values: vi.fn().mockReturnValue([1, 2, 3, 4, 5, 6, 7, 8]),
    components: vi.fn().mockReturnValue(3),
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

describe('UnionFindPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseUnionFindState.mockReturnValue(createMockUnionFindState() as any)
    renderWithRouter(<UnionFindPage />)

    expect(screen.getByText('unionFind.title')).toBeInTheDocument()
    expect(screen.getByText('unionFind.insert')).toBeInTheDocument()
    expect(screen.getByText('unionFind.remove')).toBeInTheDocument()
    expect(screen.getByText('unionFind.find')).toBeInTheDocument()
    expect(screen.getByText('unionFind.union')).toBeInTheDocument()
    expect(screen.getByText('unionFind.connected')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with value when insert button clicked', async () => {
    const mockState = createMockUnionFindState()
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    const inputs = screen.getAllByPlaceholderText('unionFind.inputPlaceholder')
    fireEvent.change(inputs[0], { target: { value: '42' } })
    fireEvent.click(screen.getByText('unionFind.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith(42)
    })
  })

  it('calls remove with value when delete button clicked', async () => {
    const mockState = createMockUnionFindState()
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    const inputs = screen.getAllByPlaceholderText('unionFind.inputPlaceholder')
    fireEvent.change(inputs[0], { target: { value: '3' } })
    fireEvent.click(screen.getByText('unionFind.remove'))

    await waitFor(() => {
      expect(mockState.remove).toHaveBeenCalledWith(3)
    })
  })

  it('calls find with value when find button clicked', async () => {
    const mockState = createMockUnionFindState()
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    const inputs = screen.getAllByPlaceholderText('unionFind.inputPlaceholder')
    fireEvent.change(inputs[0], { target: { value: '5' } })
    fireEvent.click(screen.getByText('unionFind.find'))

    await waitFor(() => {
      expect(mockState.find).toHaveBeenCalledWith(5)
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockUnionFindState()
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockUnionFindState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockUnionFindState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockUnionFindState({ isAnimating: true })
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    const insertButton = screen.getByText('unionFind.insert').closest('button')
    expect(insertButton).toBeDisabled()
  })

  it('shows stop button while animating', () => {
    const mockState = createMockUnionFindState({ isAnimating: true })
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    expect(screen.getByText('common.stop')).toBeInTheDocument()
  })

  it('renders two input fields for A and B values', () => {
    const mockState = createMockUnionFindState()
    mockedUseUnionFindState.mockReturnValue(mockState as any)
    renderWithRouter(<UnionFindPage />)

    const inputsA = screen.getAllByPlaceholderText('unionFind.inputPlaceholder')
    const inputsB = screen.getAllByPlaceholderText('unionFind.inputPlaceholderB')
    expect(inputsA.length).toBeGreaterThanOrEqual(1)
    expect(inputsB.length).toBeGreaterThanOrEqual(1)
  })
})
