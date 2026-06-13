import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import GraphPage from '../../pages/GraphPage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useGraphState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))

import { useGraphState } from '../../hooks/useGraphState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGraphState = vi.mocked(useGraphState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockGraphState(overrides = {}) {
  const base = createMockHistory([])
  return {
    ...base,
    nodes: [
      { id: 'A' },
      { id: 'B' },
      { id: 'C' },
    ],
    links: [
      { source: 'A', target: 'B', weight: 1 },
      { source: 'B', target: 'C', weight: 2 },
    ],
    addNode: vi.fn(),
    addEdge: vi.fn().mockReturnValue(true),
    deleteNode: vi.fn(),
    deleteEdge: vi.fn(),
    bfs: vi.fn(),
    dfs: vi.fn(),
    dijkstra: vi.fn(),
    loadData: vi.fn(),
    viewMode: 'force',
    setViewMode: vi.fn(),
    getAdjacencyMatrix: vi.fn().mockReturnValue({
      ids: ['A', 'B', 'C'],
      matrix: [[0, 1, 0], [1, 0, 2], [0, 2, 0]],
    }),
    getAdjacencyList: vi.fn().mockReturnValue({
      A: [{ node: 'B', weight: 1 }],
      B: [{ node: 'A', weight: 1 }, { node: 'C', weight: 2 }],
      C: [{ node: 'B', weight: 2 }],
    }),
    ...overrides,
  }
}

describe('GraphPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseGraphState.mockReturnValue(createMockGraphState())
    renderWithRouter(<GraphPage />)

    expect(screen.getByText('graph.title')).toBeInTheDocument()
    expect(screen.getByText('graph.addNode')).toBeInTheDocument()
    expect(screen.getByText('graph.addEdge')).toBeInTheDocument()
    expect(screen.getByText('graph.bfs')).toBeInTheDocument()
    expect(screen.getByText('graph.dfs')).toBeInTheDocument()
    expect(screen.getByText('graph.dijkstra')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    // Buttons inside collapsed OperationGroup
    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('graph.removeEdge')).toBeInTheDocument()
    expect(screen.getByText('graph.removeNode')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls addNode when addNode button clicked', () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    fireEvent.click(screen.getByText('graph.addNode'))
    expect(mockState.addNode).toHaveBeenCalled()
  })

  it('calls addEdge with source, target and weight when addEdge button clicked', async () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    const sourceInput = screen.getAllByPlaceholderText('graph.source')[0]
    const targetInput = screen.getAllByPlaceholderText('graph.target')[0]
    const weightInput = screen.getByPlaceholderText('graph.weight')

    fireEvent.change(sourceInput, { target: { value: 'A' } })
    fireEvent.change(targetInput, { target: { value: 'C' } })
    fireEvent.change(weightInput, { target: { value: '5' } })
    fireEvent.click(screen.getByText('graph.addEdge'))

    await waitFor(() => {
      expect(mockState.addEdge).toHaveBeenCalledWith('A', 'C', 5)
    })
  })

  it('calls deleteEdge with source and target when removeEdge button clicked', async () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    const sourceInput = screen.getAllByPlaceholderText('graph.source')[0]
    const targetInput = screen.getAllByPlaceholderText('graph.target')[0]

    fireEvent.change(sourceInput, { target: { value: 'A' } })
    fireEvent.change(targetInput, { target: { value: 'B' } })
    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('graph.removeEdge'))

    await waitFor(() => {
      expect(mockState.deleteEdge).toHaveBeenCalledWith('A', 'B')
    })
  })

  it('calls deleteNode with source id when removeNode button clicked', async () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    const sourceInput = screen.getAllByPlaceholderText('graph.source')[0]
    fireEvent.change(sourceInput, { target: { value: 'B' } })
    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('graph.removeNode'))

    await waitFor(() => {
      expect(mockState.deleteNode).toHaveBeenCalledWith('B')
    })
  })

  it('calls bfs with start node when bfs button clicked', async () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    const startInput = screen.getAllByPlaceholderText('graph.source')[1]
    fireEvent.change(startInput, { target: { value: 'A' } })
    fireEvent.click(screen.getByText('graph.bfs'))

    await waitFor(() => {
      expect(mockState.bfs).toHaveBeenCalledWith('A')
    })
  })

  it('calls dfs with start node when dfs button clicked', async () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    const startInput = screen.getAllByPlaceholderText('graph.source')[1]
    fireEvent.change(startInput, { target: { value: 'B' } })
    fireEvent.click(screen.getByText('graph.dfs'))

    await waitFor(() => {
      expect(mockState.dfs).toHaveBeenCalledWith('B')
    })
  })

  it('calls dijkstra with start and end nodes when dijkstra button clicked', async () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    const startInput = screen.getAllByPlaceholderText('graph.source')[1]
    const endInput = screen.getAllByPlaceholderText('graph.target')[1]

    fireEvent.change(startInput, { target: { value: 'A' } })
    fireEvent.change(endInput, { target: { value: 'C' } })
    fireEvent.click(screen.getByText('graph.dijkstra'))

    await waitFor(() => {
      expect(mockState.dijkstra).toHaveBeenCalledWith('A', 'C')
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockGraphState()
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockGraphState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockGraphState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    fireEvent.click(screen.getByText(/common\.more/))
    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockGraphState({ isAnimating: true })
    mockedUseGraphState.mockReturnValue(mockState)
    renderWithRouter(<GraphPage />)

    expect(screen.getByText('graph.addNode')).toBeDisabled()
    expect(screen.getByText('graph.addEdge')).toBeDisabled()
    expect(screen.getByText('graph.bfs')).toBeDisabled()
    expect(screen.getByText('graph.dfs')).toBeDisabled()
    expect(screen.getByText('graph.dijkstra')).toBeDisabled()
    fireEvent.click(screen.getByText(/common\.more/))
    expect(screen.getByText('graph.removeEdge')).toBeDisabled()
    expect(screen.getByText('graph.removeNode')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
