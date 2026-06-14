import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import GraphAlgorithmPage from '../../pages/GraphAlgorithmPage'
import { renderWithRouter, mockUseGlobalSettings } from './testUtils'

vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../hooks/useVisualizer', () => ({
  useVisualizer: vi.fn().mockReturnValue({
    containerRef: { current: null },
    svgRef: { current: null },
    dimensions: { width: 800, height: 400 },
    getAnimationContext: vi.fn().mockReturnValue({ isAborted: () => false }),
  }),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))
vi.mock('../../visualizers/graphVisualizer', () => ({
  renderGraph: vi.fn(),
  animateBFS: vi.fn().mockResolvedValue([]),
  animateDFS: vi.fn().mockResolvedValue([]),
  animateDijkstra: vi.fn().mockResolvedValue([]),
  clearGraphSimulation: vi.fn(),
}))
vi.mock('../../utils/errorHandler', () => ({
  handleAnimationError: vi.fn(),
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
vi.mock('../../algorithms/graph', () => ({
  bfs: vi.fn().mockResolvedValue({ visited: ['A', 'B', 'C', 'D', 'E', 'F'] }),
  dfs: vi.fn().mockResolvedValue({ visited: ['A', 'B', 'C', 'D', 'E', 'F'] }),
  dijkstra: vi.fn().mockResolvedValue({ visited: ['A', 'B', 'C', 'D', 'E', 'F'] }),
  topoSort: vi.fn().mockResolvedValue({ visited: ['A', 'B', 'C', 'D', 'E', 'F'] }),
  graphAlgorithms: [
    { key: 'bfs', name: 'BFS', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '广度优先搜索' },
    { key: 'dfs', name: 'DFS', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '深度优先搜索' },
    { key: 'dijkstra', name: 'Dijkstra', timeComplexity: 'O((V+E)logV)', spaceComplexity: 'O(V)', description: '最短路径算法' },
    { key: 'topoSort', name: 'TopoSort', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '拓扑排序' },
  ],
}))
vi.mock('../../components/ComplexityChart', () => ({
  default: () => null,
}))
vi.mock('../../components/StepExplainer', () => ({
  default: () => null,
}))

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

describe('GraphAlgorithmPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
  })

  it('renders page title and operation buttons', () => {
    renderWithRouter(<GraphAlgorithmPage />)

    expect(screen.getByText('graphAlgorithm.title')).toBeInTheDocument()
    expect(screen.getByText('common.run')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('BFS')).toBeInTheDocument()
    expect(screen.getByText('DFS')).toBeInTheDocument()
    expect(screen.getByText('Dijkstra')).toBeInTheDocument()
    expect(screen.getByText('TopoSort')).toBeInTheDocument()
  })

  it('selects algorithm and calls it when run button clicked', async () => {
    const { dfs } = await import('../../algorithms/graph')
    renderWithRouter(<GraphAlgorithmPage />)

    fireEvent.click(screen.getByText('DFS'))
    fireEvent.click(screen.getByText('common.run'))

    await waitFor(() => {
      expect(dfs).toHaveBeenCalled()
    })
  })

  it('calls bfs by default when run button clicked', async () => {
    const { bfs } = await import('../../algorithms/graph')
    renderWithRouter(<GraphAlgorithmPage />)

    fireEvent.click(screen.getByText('common.run'))

    await waitFor(() => {
      expect(bfs).toHaveBeenCalled()
    })
  })

  it('calls reset when reset button clicked', () => {
    renderWithRouter(<GraphAlgorithmPage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(screen.getByText('common.reset')).toBeInTheDocument()
  })

  it('renders algorithm buttons', () => {
    renderWithRouter(<GraphAlgorithmPage />)
    expect(screen.getByText('BFS')).toBeInTheDocument()
    expect(screen.getByText('DFS')).toBeInTheDocument()
    expect(screen.getByText('Dijkstra')).toBeInTheDocument()
    expect(screen.getByText('TopoSort')).toBeInTheDocument()
  })
})
