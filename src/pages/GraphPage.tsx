import { useState, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationInput, OperationButton, OperationLabel, OperationInfo } from '../components/OperationBar'
import Visualizer from '../components/Visualizer'
import LogPanel from '../components/LogPanel'
import EmptyState from '../components/EmptyState'
import Timeline from '../components/Timeline'
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
import StepExplainer from '../components/StepExplainer'
import { useLearningMode } from '../hooks/useLearningMode'
import OperationGroup from '../components/OperationGroup'

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

  const { containerRef, svgRef, dimensions, getAnimationContext } = useVisualizer()
  const [sourceInput, setSourceInput] = useState<string>('A')
  const [targetInput, setTargetInput] = useState<string>('B')
  const [weightInput, setWeightInput] = useState<string>('1')
  const [algorithmStart, setAlgorithmStart] = useState<string>('A')
  const [algorithmEnd, setAlgorithmEnd] = useState<string>('F')
  const [showLearning, setShowLearning] = useState(false)
  const learningMode = useLearningMode('graph')

  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)

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
  const handleBFS = useCallback(async (): Promise<void> => {
    if (isAnimating) return
    setIsAnimating(true)
    bfs(algorithmStart.toUpperCase())
    const anim = getAnimationContext()
    try {
      if (svgRef.current) {
        await animateBFS(svgRef.current, algorithmStart.toUpperCase(), nodes, links, dimensions, anim)
      }
    } catch (e) {
      handleAnimationError(e, 'BFS')
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
    } catch (e) {
      handleAnimationError(e, 'DFS')
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
    } catch (e) {
      handleAnimationError(e, 'Dijkstra')
    } finally {
      setIsAnimating(false)
    }
  }, [isAnimating, setIsAnimating, dijkstra, algorithmStart, algorithmEnd, getAnimationContext, svgRef, nodes, links, dimensions])

  const handleReset = (): void => {
    clearGraphSimulation(svgRef.current)
    reset()
  }

  const { ids, matrix } = getAdjacencyMatrix()
  const adjList = getAdjacencyList()

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title={t('graph.title')} subtitle={t('graph.subtitle')} icon="⬡">
        <ExportImport dataType="graph" data={{ nodes, links }} disabled={isAnimating} onImport={({ data: imported }) => {
          if (imported && typeof imported === 'object' && 'nodes' in imported) {
            loadData(imported as { nodes: typeof nodes })
          } else if (Array.isArray(imported)) {
            loadData(imported)
          }
        }} />
        <ShareButton data={{ nodes, links }} dataType="graph" disabled={isAnimating} />
        <OperationButton variant="outline" onClick={handleReset}>{t('common.reset')}</OperationButton>
        <OperationButton variant="primary" onClick={handleAddNode} disabled={isAnimating}>{t('graph.addNode')}</OperationButton>
      </PageHeader>

      <OperationBar>
        <SpeedControl />
        <OperationLabel>{t('page.operations')}</OperationLabel>
        <OperationInput placeholder={t('graph.source')} value={sourceInput} onChange={setSourceInput} className="w-16" />
        <OperationInput placeholder={t('graph.target')} value={targetInput} onChange={setTargetInput} className="w-16" />
        <OperationInput type="number" placeholder={t('graph.weight')} value={weightInput} onChange={setWeightInput} className="w-14" />
        <OperationButton variant="success" onClick={handleAddEdge} disabled={isAnimating}>{t('graph.addEdge')}</OperationButton>
        <OperationGroup label={t('common.more')}>
          <OperationButton variant="danger" onClick={handleDeleteEdge} disabled={isAnimating}>{t('graph.removeEdge')}</OperationButton>
          <OperationButton variant="outline" onClick={handleDeleteNode} disabled={isAnimating}>{t('graph.removeNode')}</OperationButton>
          <UndoPreviewButton
            variant="outline"
            onClick={undo}
            disabled={isAnimating || !canUndo()}
            previewData={getUndoPreview()}
            previewLabel={t('shortcuts.undo')}
          >
            {t('common.undo')}
          </UndoPreviewButton>
          <UndoPreviewButton
            variant="outline"
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
        <OperationButton variant="purple" onClick={handleBFS} disabled={isAnimating} popAnimation>{t('graph.bfs')}</OperationButton>
        <OperationButton variant="teal" onClick={handleDFS} disabled={isAnimating} popAnimation>{t('graph.dfs')}</OperationButton>
        <OperationButton variant="warning" onClick={handleDijkstra} disabled={isAnimating}>{t('graph.dijkstra')}</OperationButton>
        <div className="flex items-center gap-1">
          {[{ k: 'force', l: t('graphView.force') }, { k: 'matrix', l: t('graphView.matrix') }, { k: 'list', l: t('graphView.list') }].map(({ k, l }) => (
            <button key={k} onClick={() => setViewMode(k)}
              className={`font-mono text-[10px] px-2 py-0.5 border-2 transition-all duration-200
                ${viewMode === k
                  ? 'border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-[1px_1px_0px_#1a1a2e] dark:shadow-[1px_1px_0px_#334155]'
                  : 'border-ink/20 dark:border-dark-border text-ink-light dark:text-dark-ink-light hover:border-ink/40 dark:hover:border-dark-ink/40 hover:bg-ink/5 dark:hover:bg-dark-ink/5'
                }`}>{l}</button>
          ))}
        </div>
        <OperationInfo>
          <span className="font-mono text-xs text-ink-light">{viewMode === 'force' ? t('graphView.force') : viewMode === 'matrix' ? t('graphView.matrix') : t('graphView.list')}</span>
        </OperationInfo>
      </OperationBar>

      {viewMode === 'force' ? (
        <>
          <Visualizer data={nodes} renderFn={handleGraphRender} svgRef={svgRef} dimensions={dimensions} containerRef={containerRef} ariaLabel={t("visualizer.graphLabel")} />
          {nodes.length === 0 && (
            <EmptyState icon="⬡" titleKey="emptyState.emptyGraph" descriptionKey="emptyState.emptyGraphDesc" onFill={reset} />
          )}
        </>
      ) : viewMode === 'matrix' ? (
        <div className="flex-1 overflow-auto p-6 border-b-2 border-ink dark:border-dark-border bg-white dark:bg-slate">
          <h3 className="font-bold text-sm mb-4 text-ink dark:text-dark-ink">{t('graph.adjacencyMatrix')}</h3>
          <table className="border-collapse font-mono text-sm">
            <thead>
              <tr>
                <th className="border-2 border-ink dark:border-dark-border bg-paper dark:bg-slate p-2"></th>
                {ids.map(id => <th key={id} className="border-2 border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper p-2 font-bold">{id}</th>)}
              </tr>
            </thead>
            <tbody>
              {ids.map((id, i) => (
                <tr key={id}>
                  <td className="border-2 border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper p-2 font-bold">{id}</td>
                  {matrix[i].map((val, j) => (
                    <td key={j} className={`border-2 border-border dark:border-dark-border p-2 text-center ${i === j ? 'bg-paper dark:bg-slate text-ink-light/20 dark:text-dark-ink-light/20' : val > 0 ? 'bg-accent-blue/10 text-accent-blue font-bold' : 'text-ink-light/20 dark:text-dark-ink-light/20'}`}>
                      {val || '·'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-6 border-b-2 border-ink dark:border-dark-border bg-white dark:bg-slate">
          <h3 className="font-bold text-sm mb-4 text-ink dark:text-dark-ink">{t('graph.adjacencyList')}</h3>
          <div className="space-y-2">
            {Object.entries(adjList).map(([node, neighbors]) => (
              <div key={node} className="flex items-start gap-3">
                <span className="font-mono font-bold text-sm bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper px-3 py-1 w-12 text-center">{node}</span>
                <span className="text-ink-light dark:text-dark-ink-light font-mono text-sm py-1">→</span>
                <div className="flex flex-wrap gap-1">
                  {neighbors.length > 0
                    ? neighbors.map((n, i) => (
                      <span key={i} className="font-mono text-xs border-2 border-border dark:border-dark-border px-2 py-0.5 bg-paper dark:bg-slate text-ink dark:text-dark-ink">
                        {n.node}<span className="text-ink-light/40 dark:text-dark-ink-light/40 ml-1">({n.weight})</span>
                      </span>
                    ))
                    : <span className="font-mono text-xs text-ink-light/20 dark:text-dark-ink-light/20 py-1">NULL</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <Timeline
          history={logs.map(log => ({ type: log.type, description: log.message }))}
          currentIndex={logs.length - 1}
          onJump={undefined}
          maxHeight="h-24"
        />
      )}
      <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
        <button
          onClick={() => setShowLearning(!showLearning)}
          className={`px-3 py-1.5 text-sm font-bold border-2 transition-all duration-200
            shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]
            active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
            ${showLearning
              ? 'bg-accent-blue text-paper border-accent-blue'
              : 'border-ink dark:border-dark-border hover:bg-ink hover:text-paper dark:hover:bg-dark-ink dark:hover:text-dark-paper hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#1a1a2e] dark:hover:shadow-[3px_3px_0px_#334155]'
            }`}
        >
          {showLearning ? t('learning.close') : t('learning.open')}
        </button>
      </div>

      {showLearning && (
        <div className="px-3 sm:px-4 py-2 border-t border-ink/10 dark:border-dark-border/30">
          <StepExplainer
            step={learningMode.currentStep}
            currentStepIndex={learningMode.currentStepIndex}
            totalSteps={learningMode.totalSteps}
            progress={learningMode.progress}
            onNext={learningMode.nextStep}
            onPrev={learningMode.prevStep}
            onReset={learningMode.reset}
            isAnimating={isAnimating}
          />
        </div>
      )}
      <LogPanel logs={logs} />
    </div>
  )
}
