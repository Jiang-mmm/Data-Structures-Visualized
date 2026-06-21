import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import SegmentTreePage from '../../pages/SegmentTreePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useSegmentTreeState')
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

import { useSegmentTreeState } from '../../hooks/useSegmentTreeState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseSegmentTreeState = vi.mocked(useSegmentTreeState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockSegmentTreeState(overrides = {}) {
  const base = createMockHistory([10, 20, 5, 6, 12, 30, 7, 17])
  return {
    ...base,
    data: base.data,
    build: vi.fn(),
    query: vi.fn().mockReturnValue({ sum: 30, path: [{ start: 0, end: 7, sum: 107 }] }),
    update: vi.fn(),
    getFlattened: vi.fn().mockReturnValue({ nodes: [], edges: [], originalArray: [] }),
    nodeCount: 15,
    ...overrides,
  }
}

describe('SegmentTreePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseSegmentTreeState.mockReturnValue(createMockSegmentTreeState() as never)
    renderWithRouter(<SegmentTreePage />)

    expect(screen.getByText('segmentTree.title')).toBeInTheDocument()
    expect(screen.getByText('segmentTree.build')).toBeInTheDocument()
    expect(screen.getByText('segmentTree.query')).toBeInTheDocument()
    expect(screen.getByText('segmentTree.update')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls build with parsed array when build button clicked', async () => {
    const mockState = createMockSegmentTreeState()
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    const input = screen.getByPlaceholderText('segmentTree.buildPlaceholder')
    fireEvent.change(input, { target: { value: '1,2,3,4' } })
    fireEvent.click(screen.getByText('segmentTree.build'))

    await waitFor(() => {
      expect(mockState.build).toHaveBeenCalledWith([1, 2, 3, 4])
    })
  })

  it('calls query with start and end when query button clicked', async () => {
    const mockState = createMockSegmentTreeState()
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    const startInput = screen.getByPlaceholderText('segmentTree.rangeStart')
    const endInput = screen.getByPlaceholderText('segmentTree.rangeEnd')
    fireEvent.change(startInput, { target: { value: '0' } })
    fireEvent.change(endInput, { target: { value: '3' } })
    fireEvent.click(screen.getByText('segmentTree.query'))

    await waitFor(() => {
      expect(mockState.query).toHaveBeenCalledWith(0, 3)
    })
  })

  it('calls update with index and value when update button clicked', async () => {
    const mockState = createMockSegmentTreeState()
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    const indexInput = screen.getByPlaceholderText('segmentTree.index')
    const valueInput = screen.getByPlaceholderText('segmentTree.value')
    fireEvent.change(indexInput, { target: { value: '1' } })
    fireEvent.change(valueInput, { target: { value: '50' } })
    fireEvent.click(screen.getByText('segmentTree.update'))

    await waitFor(() => {
      expect(mockState.update).toHaveBeenCalledWith(1, 50)
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockSegmentTreeState()
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockSegmentTreeState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockSegmentTreeState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockSegmentTreeState({ isAnimating: true })
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    expect(screen.getByText('segmentTree.build')).toBeDisabled()
    expect(screen.getByText('segmentTree.query')).toBeDisabled()
    expect(screen.getByText('segmentTree.update')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })

  it('shows stop button while animating', () => {
    const mockState = createMockSegmentTreeState({ isAnimating: true })
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    expect(screen.getByText('common.stop')).toBeInTheDocument()
  })

  it('renders node count and array length info', () => {
    const mockState = createMockSegmentTreeState({ nodeCount: 15 })
    mockedUseSegmentTreeState.mockReturnValue(mockState as never)
    renderWithRouter(<SegmentTreePage />)

    expect(screen.getByText(/NODES: 15/)).toBeInTheDocument()
    expect(screen.getByText(/ARR: 8/)).toBeInTheDocument()
  })
})
