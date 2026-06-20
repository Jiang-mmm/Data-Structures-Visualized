import { useState, useCallback, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import InfoPanel from '../components/InfoPanel'
import EmptyState from '../components/EmptyState'
import { renderGraph, animateBFS, animateDFS, animateDijkstra, clearGraphSimulation } from '../visualizers/graphVisualizer'
import { useGraphState } from '../hooks/useGraphState'
import { useVisualizer } from '../hooks/useVisualizer'
import { useKeyboard } from '../hooks/useKeyboard'
import SpeedControl from '../components/SpeedControl'
import ExportImport from '../components/ExportImport'
import UndoPreviewButton from '../components/UndoPreviewButton'
import ShareButton from '../components/ShareButton'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { showToast } from '../components/toastStore'
import { handleAnimationError } from '../utils/errorHandler'
import { useLearningMode } from '../hooks/useLearningMode'
import { usePageTracker } from '../hooks/usePageTracker'
import OperationGroup from '../components/OperationGroup'
import { useSharedData } from '../hooks/useSharedData'

export default function GraphPage() {
  const { t } = useGlobalSettings()
  const {
    nodes, links, logs, isAnimating, setIsAnimating,
    viewMode, setViewMode,
    addNode, addEdge, deleteNode, deleteEdge,
    bfs, dfs, dijkstra, reset, loadData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
    getAdjacencyMatrix, getAdjacencyList,
  } = useGraphState()

  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()
  const [sourceInput, setSourceInput] = useState<string>('A')
  const [targetInput, setTargetInput] = useState<string>('B')
  const [weightInput, setWeightInput] = useState<string>('1')
  const [algorithmStart, setAlgorithmStart] = useState<string>('A')
  const [algorithmEnd, setAlgorithmEnd] = useState<string>('F')
  const learningMode = useLearningMode('graph')
  useSharedData({ dataType: 'graph', loadData, validator: (d): d is unknown => !!(d && typeof d === 'object' && 'nodes' in d && 'links' in d && Array.isArray((d as Record<string, unknown>).nodes) && Array.isArray((d as Record<string, unknown>).links)) })
  usePageTracker('graph')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

  useEffect(() => {
    return () => { clearGraphSimulation(svgRef.current) }
  }, [])

  const handleGraphRender = useCallback((svg: SVGSVGElement, _data: unknown, dims: { width: number; height: number }) => {
    if (viewMode === 'force' && svg) {
      renderGraph(svg, nodes, links, dims)
    }
  }, [nodes, links, viewMode])

  const handleAddNode = useCallback((): void => {
    if (isAnimating) return
    addNode()
  }, [isAnimating, addNode])
  const handleAddEdge = useCallback((): void => {
    if (isAnimating || !sourceInput || !targetInput) return
    addEdge(sourceInput.toUpperCase(), targetInput.toUpperCase(), parseInt(weightInput, 10) || 1)
  }, [isAnimating, sourceInput, targetInput, addEdge, weightInput])
  const handleDeleteNode = useCallback((): void => {
    if (isAnimating || !sourceInput) return
    deleteNode(sourceInput.toUpperCase())
    setSourceInput('')
  }, [isAnimating, sourceInput, deleteNode, setSourceInput])
  const handleDeleteEdge = useCallback((): void => {
    if (isAnimating || !sourceInput || !targetInput) return
    deleteEdge(sourceInput.toUpperCase(), targetInput.toUpperCase())
  }, [isAnimating, sourceInput, targetInput, deleteEdge])
  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleJumpToStep = useCallback((stepId: string): void => {
    const idx = learningMode.steps.findIndex(s => s.id === stepId)
    if (idx >= 0) {
      learningMode.goToStep(idx)
    }
  }, [learningMode.steps, learningMode.goToStep])

  const handleBFS = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    bfs(algorithmStart.toUpperCase())
    const anim = getAnimationContext()
    try {
      if (svgRef.current) {
        await animateBFS(svgRef.current, algorithmStart.toUpperCase(), nodes, links, dimensions, anim)
      }
    } catch (error) {
      handleAnimationError(error, 'BFS')
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, setIsAnimating, bfs, algorithmStart, getAnimationContext, svgRef, nodes, links, dimensions])
  const handleDFS = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    dfs(algorithmStart.toUpperCase())
    const anim = getAnimationContext()
    try {
      if (svgRef.current) {
        await animateDFS(svgRef.current, algorithmStart.toUpperCase(), nodes, links, dimensions, anim)
      }
    } catch (error) {
      handleAnimationError(error, 'DFS')
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, setIsAnimating, dfs, algorithmStart, getAnimationContext, svgRef, nodes, links, dimensions])
  const handleDijkstra = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    dijkstra(algorithmStart.toUpperCase(), algorithmEnd.toUpperCase())
    const anim = getAnimationContext()
    try {
      if (svgRef.current) {
        await animateDijkstra(svgRef.current, algorithmStart.toUpperCase(), algorithmEnd.toUpperCase(), nodes, links, dimensions, anim)
      }
    } catch (error) {
      handleAnimationError(error, 'Dijkstra')
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, setIsAnimating, dijkstra, algorithmStart, algorithmEnd, getAnimationContext, svgRef, nodes, links, dimensions])

  const handleReset = useCallback((): void => {
    clearGraphSimulation(svgRef.current)
    reset()
  }, [reset])

  const { ids, matrix } = getAdjacencyMatrix()
  const adjList = getAdjacencyList()

  return (
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader title={t('graph.title')} subtitle={t('graph.subtitle')}>
        <ExportImport dataType="graph" data={{ nodes, links }} disabled={isAnimating} onImport={({ data: imported }) => {
          if (imported && typeof imported === 'object' && 'nodes' in imported) {
            const g = imported as Record<string, unknown>
            if (Array.isArray(g.nodes) && g.nodes.every((n: unknown) =>
              n && typeof n === 'object' && 'id' in (n as object) && 'label' in (n as object)
            )) {
              loadData(imported as { nodes: typeof nodes })
            } else {
              showToast({ type: 'error', message: t('errors.importFailed') })
            }
          } else {
            showToast({ type: 'error', message: t('errors.importFailed') })
          }
        }} />
        <ShareButton data={{ nodes, links }} dataType="graph" disabled={isAnimating} />
        <OperationButton variant="secondary" onClick={handleReset}>{t('common.reset')}</OperationButton>
        <OperationButton variant="primary" onClick={handleAddNode} disabled={isAnimating} isBusy={isAnimating}>{t('graph.addNode')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput placeholder={t('graph.source')} value={sourceInput} onChange={setSourceInput} className="w-16" />
        <OperationInput placeholder={t('graph.target')} value={targetInput} onChange={setTargetInput} className="w-16" />
        <OperationInput type="number" placeholder={t('graph.weight')} value={weightInput} onChange={setWeightInput} className="w-14" />
        <OperationButton variant="primary" onClick={handleAddEdge} disabled={isAnimating} isBusy={isAnimating}>{t('graph.addEdge')}</OperationButton>
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="danger" onClick={handleDeleteEdge} disabled={isAnimating} isBusy={isAnimating}>{t('graph.removeEdge')}</OperationButton>
          <OperationButton variant="danger" onClick={handleDeleteNode} disabled={isAnimating} isBusy={isAnimating}>{t('graph.removeNode')}</OperationButton>
          <UndoPreviewButton
            variant="secondary"
            onClick={undo}
            disabled={isAnimating || !canUndo()}
            previewData={getUndoPreview()}
            previewLabel={t('shortcuts.undo')}
          >
            {t('common.undo')}
          </UndoPreviewButton>
          <UndoPreviewButton
            variant="secondary"
            onClick={redo}
            disabled={isAnimating || !canRedo()}
            previewData={getRedoPreview()}
            previewLabel={t('shortcuts.redo')}
          >
            {t('common.redo')}
          </UndoPreviewButton>
        </OperationGroup>
      </OperationBar>

      <OperationBar className="border-t-0">
        <OperationLabel>{t('page.algorithms')}</OperationLabel>
        <OperationInput placeholder={t('graph.source')} value={algorithmStart} onChange={setAlgorithmStart} className="w-16" />
        <OperationInput placeholder={t('graph.target')} value={algorithmEnd} onChange={setAlgorithmEnd} className="w-16" />
        <OperationButton variant="primary" onClick={handleBFS} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('graph.bfs')}</OperationButton>
        <OperationButton variant="primary" onClick={handleDFS} disabled={isAnimating} isBusy={isAnimating} popAnimation>{t('graph.dfs')}</OperationButton>
        <OperationButton variant="primary" onClick={handleDijkstra} disabled={isAnimating} isBusy={isAnimating}>{t('graph.dijkstra')}</OperationButton>
        {isAnimating && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
        <div className="flex items-center gap-1">
          {[{ k: 'force', l: t('graphView.force') }, { k: 'matrix', l: t('graphView.matrix') }, { k: 'list', l: t('graphView.list') }].map(({ k, l }) => (
            <button key={k} aria-pressed={viewMode === k} onClick={() => setViewMode(k)}
              className={`font-mono text-[10px] px-2 py-0.5 border-2 transition-all duration-200
                ${viewMode === k
                  ? 'border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-button dark:shadow-button-dark'
                  : 'border-ink/20 dark:border-dark-border text-ink-light dark:text-dark-ink-light hover:border-ink/40 dark:hover:border-dark-ink/40 hover:bg-ink/5 dark:hover:bg-dark-ink/5'
                }`}>{l}</button>
          ))}
        </div>
        <OperationInfo>
          <span className="font-mono text-xs text-ink-light">{viewMode === 'force' ? t('graphView.force') : viewMode === 'matrix' ? t('graphView.matrix') : t('graphView.list')}</span>
        </OperationInfo>
      </OperationBar>

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <div className="relative flex flex-col flex-1 min-h-0">
          {viewMode === 'force' ? (
        <>
          <Visualizer data={nodes} renderFn={handleGraphRender} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} isAnimating={isAnimating} ariaLabel={t("visualizer.graphLabel")} />
          {nodes.length === 0 && (
            <EmptyState icon="⬡" titleKey="emptyState.emptyGraph" descriptionKey="emptyState.emptyGraphDesc" onFill={reset} />
          )}
        </>
      ) : viewMode === 'matrix' ? (
        <div className="flex-1 overflow-auto p-6 border-b-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-sm text-ink dark:text-dark-ink">{t('graph.adjacencyMatrix')}</h3>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="border-2 border-ink dark:border-dark-border px-2 py-0.5 rounded-sm bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink font-bold">{nodes.length} {t('graph.nodes')}</span>
              <span className="border-2 border-ink dark:border-dark-border px-2 py-0.5 rounded-sm bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink font-bold">{links.length} {t('graph.edges')}</span>
              <span className="border-2 border-ink dark:border-dark-border px-2 py-0.5 rounded-sm bg-accent-blue/10 text-accent-blue font-bold">{nodes.length > 1 ? (links.length / (nodes.length * (nodes.length - 1))).toFixed(2) : '0.00'} {t('graph.density')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border-2 border-ink dark:border-dark-border bg-accent-blue/20"></span>
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light">{t('graph.legendEdge')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border-2 border-ink/20 dark:border-dark-border"></span>
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light">{t('graph.legendNoEdge')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border-2 border-ink dark:border-dark-border bg-accent-amber/20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, color-mix(in srgb, var(--color-accent-amber) 30%, transparent) 2px, color-mix(in srgb, var(--color-accent-amber) 30%, transparent) 4px)' }}></span>
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light">{t('graph.legendSelfLoop')}</span>
            </div>
          </div>
          <div className="overflow-x-auto border-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-paper p-1 shadow-card dark:shadow-card-dark">
          <table className="border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 border-2 border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper p-2 min-w-12"></th>
                {ids.map(id => <th key={id} className="sticky top-0 z-10 border-2 border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper p-2 font-bold min-w-10 text-center">{id}</th>)}
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => (
                <tr key={id}>
                  <td className="sticky left-0 z-10 border-2 border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper p-2 font-bold text-center">{id}</td>
                  {matrix[i].map((val, j) => (
                    <td key={j} className={`border-2 border-border dark:border-dark-border p-2 text-center min-w-10 transition-colors ${
                      i === j
                        ? 'bg-accent-amber/10 text-accent-amber font-bold'
                        : val > 0
                          ? 'bg-accent-blue/15 text-accent-blue font-bold hover:bg-accent-blue/25'
                          : 'text-ink-light/25 dark:text-dark-ink-light/25 hover:bg-ink/5 dark:hover:bg-dark-ink/5'
                    }`}>
                      {i === j ? (val > 0 ? val : '—') : (val || '·')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6 border-b-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 className="font-bold text-sm text-ink dark:text-dark-ink">{t('graph.adjacencyList')}</h3>
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="border-2 border-ink dark:border-dark-border px-2 py-0.5 rounded-sm bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink font-bold">{nodes.length} {t('graph.nodes')}</span>
              <span className="border-2 border-ink dark:border-dark-border px-2 py-0.5 rounded-sm bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink font-bold">{links.length} {t('graph.edges')}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border-2 border-ink dark:border-dark-border bg-accent-blue/20"></span>
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light">{t('graph.legendEdge')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm border-2 border-ink/20 dark:border-dark-border"></span>
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light">{t('graph.noNeighbors')}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(adjList).map(([node, neighbors]) => (
              <div key={node} className="border-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-paper p-3 shadow-card dark:shadow-card-dark">
                <div className="flex items-center justify-between mb-2 pb-2 border-b-2 border-ink dark:border-dark-border">
                  <span className="font-mono font-bold text-sm bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper px-2 py-0.5">{node}</span>
                  <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light border border-border dark:border-dark-border px-1.5 py-0.5">{neighbors.length} {t('graph.degree')}</span>
                </div>
                <div className="flex flex-wrap gap-1 min-h-6 items-center">
                  {neighbors.length > 0
                    ? neighbors.map((n, i) => (
                      <span key={i} className="font-mono text-xs border-2 border-ink dark:border-dark-border px-2 py-0.5 rounded-sm bg-accent-blue/15 text-accent-blue font-bold flex items-center gap-1">
                        {n.node}<span className="text-ink-light/60 dark:text-dark-ink-light/60 font-normal">:{n.weight}</span>
                      </span>
                    ))
                    : <span className="font-mono text-xs text-ink-light/30 dark:text-dark-ink-light/30">∅ {t('graph.noNeighbors')}</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
          onJumpToStep={handleJumpToStep}
        />
      </div>
    </div>
  )
}
