import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import OperationBar, { OperationButton, OperationDivider } from '../components/OperationBar'
import SpeedControl from '../components/SpeedControl'
import LogPanel from '../components/LogPanel'
import Visualizer from '../components/Visualizer'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useKeyboard } from '../hooks/useKeyboard'
import { useLearningMode } from '../hooks/useLearningMode'
import { useVisualizer } from '../hooks/useVisualizer'
import { showToast } from '../components/toastStore'
import StepExplainer from '../components/StepExplainer'
import ComplexityChart from '../components/ComplexityChart'
import { bfs, dfs, dijkstra, topoSort, graphAlgorithms, type GraphAlgorithmKey } from '../algorithms/graph'
import { exportPerformanceCSV, exportPerformanceJSON } from '../utils/dataExport'
import { renderGraph, animateBFS, animateDFS, animateDijkstra, animateTopoSort, clearGraphSimulation } from '../visualizers/graphVisualizer'
import { handleAnimationError } from '../utils/errorHandler'

interface LogEntry {
  time: string
  type: string
  message: string
}

export default function GraphAlgorithmPage() {
  const { t } = useGlobalSettings()
  const [isAnimating, setIsAnimating] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<GraphAlgorithmKey>('bfs')
  const [startNode, setStartNode] = useState('A')
  const learningMode = useLearningMode(selectedAlgorithm)
  const { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation } = useVisualizer()

  const nodes = useMemo(() => [
    { id: 'A', group: 0 },
    { id: 'B', group: 1 },
    { id: 'C', group: 1 },
    { id: 'D', group: 2 },
    { id: 'E', group: 0 },
    { id: 'F', group: 2 },
  ], [])

  const links = useMemo(() => [
    { source: 'A', target: 'B', weight: 4 },
    { source: 'A', target: 'D', weight: 2 },
    { source: 'B', target: 'C', weight: 3 },
    { source: 'B', target: 'E', weight: 1 },
    { source: 'C', target: 'F', weight: 5 },
    { source: 'D', target: 'E', weight: 7 },
    { source: 'E', target: 'F', weight: 2 },
  ], [])

  const hasRunRef = useRef(false)

  useEffect(() => {
    return () => { clearGraphSimulation(svgRef.current) }
  }, [])
  
  const addLog = useCallback((type: string, message: string) => {
    const time = new Date().toLocaleTimeString(undefined, { hour12: false })
    setLogs(prev => [...prev, { time, type, message }])
  }, [])

  const handleGraphRender = useCallback((svg: SVGSVGElement, _data: unknown, dims: { width: number; height: number }) => {
    if (svg && !hasRunRef.current) {
      renderGraph(svg, nodes, links, dims)
    }
  }, [nodes, links])
  
  const handleStop = useCallback((): void => {
    abortAnimation()
    setIsAnimating(false)
  }, [abortAnimation, setIsAnimating])

  const handleRun = useCallback(async () => {
    if (isAnimating) return
    setIsAnimating(true)
    addLog('info', `${t('common.run')} ${selectedAlgorithm.toUpperCase()}...`)
    const anim = getAnimationContext()

    try {
      const adjacencyList = new Map<string, Array<{ node: string; weight?: number }>>()
      for (const node of nodes) {
        adjacencyList.set(node.id, [])
      }
      for (const link of links) {
        adjacencyList.get(link.source)?.push({ node: link.target, weight: link.weight })
      }

      let result
      const onStep = (step: any) => {
        addLog('oper', `${step.type}: ${step.node || JSON.stringify(step.edge || step.queue)}`)
      }

      switch (selectedAlgorithm) {
        case 'bfs':
          result = await bfs(adjacencyList, startNode, onStep)
          if (svgRef.current) await animateBFS(svgRef.current, startNode, nodes, links, dimensions, anim)
          break
        case 'dfs':
          result = await dfs(adjacencyList, startNode, onStep)
          if (svgRef.current) await animateDFS(svgRef.current, startNode, nodes, links, dimensions, anim)
          break
        case 'dijkstra':
          result = await dijkstra(adjacencyList, startNode, onStep)
          if (svgRef.current) await animateDijkstra(svgRef.current, startNode, 'F', nodes, links, dimensions, anim)
          break
        case 'topoSort':
          result = await topoSort(adjacencyList, onStep)
          if (svgRef.current && result) await animateTopoSort(svgRef.current, result.visited, anim)
          break
      }

      hasRunRef.current = true
      addLog('info', `${selectedAlgorithm.toUpperCase()} ${t('page.done')} · ${result?.visited.length} nodes`)
      showToast({ type: 'success', message: `${selectedAlgorithm.toUpperCase()} ${t('page.done')}` })
    } catch (e) {
      handleAnimationError(e, selectedAlgorithm.toUpperCase())
      addLog('error', `${t('errors.graphRunError')}: ${e}`)
      showToast({ type: 'error', message: t('errors.graphRunError') })
    }

    setIsAnimating(false)
  }, [isAnimating, selectedAlgorithm, startNode, nodes, links, addLog, getAnimationContext, svgRef, dimensions])
  
  const reset = useCallback(() => {
    hasRunRef.current = false
    setLogs([])
    if (svgRef.current) renderGraph(svgRef.current, nodes, links, dimensions)
    showToast({ type: 'info', message: t('errors.graphResetDone') })
  }, [nodes, links, dimensions, svgRef])

  const handleExportCSV = useCallback(() => {
    const algo = graphAlgorithms.find(a => a.key === selectedAlgorithm)
    if (!algo) return
    exportPerformanceCSV([{
      algorithm: algo.name,
      comparisons: logs.filter(l => l.type === 'oper').length,
      swaps: 0,
      steps: logs.length,
    }])
  }, [selectedAlgorithm, logs])

  const handleExportJSON = useCallback(() => {
    const algo = graphAlgorithms.find(a => a.key === selectedAlgorithm)
    if (!algo) return
    exportPerformanceJSON({
      [selectedAlgorithm]: {
        name: algo.name,
        timeComplexity: algo.timeComplexity,
        spaceComplexity: algo.spaceComplexity,
        comparisons: logs.filter(l => l.type === 'oper').length,
        steps: logs.length,
      }
    } as any)
  }, [selectedAlgorithm, logs])
  
  useKeyboard({
    'r': reset,
  }, !isAnimating)
  
  return (
    <div className="h-full flex flex-col bg-paper dark:bg-dark-paper grain">
      <OperationBar>
        <span className="font-black text-sm text-ink dark:text-dark-ink whitespace-nowrap">{t('graphAlgorithm.title')}</span>
        <OperationDivider />
        <OperationButton variant="danger" onClick={reset} disabled={isAnimating}>{t('common.reset')}</OperationButton>
      </OperationBar>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 flex flex-col gap-4">
          <OperationBar label={t('graphAlgorithm.algorithm')}>
            {graphAlgorithms.map(algo => (
              <OperationButton
                key={algo.key}
                variant={selectedAlgorithm === algo.key ? 'primary' : 'outline'}
                onClick={() => setSelectedAlgorithm(algo.key)}
                disabled={isAnimating}
              >
                {algo.name}
              </OperationButton>
            ))}
          </OperationBar>
          
          <OperationBar label={t('graphAlgorithm.startNode')}>
            {nodes.map(node => (
              <OperationButton
                key={node.id}
                variant={startNode === node.id ? 'primary' : 'outline'}
                onClick={() => setStartNode(node.id)}
                disabled={isAnimating}
              >
                {node.id}
              </OperationButton>
            ))}
          </OperationBar>
          
          <OperationBar>
            <SpeedControl />
            <OperationButton variant="primary" onClick={handleRun} disabled={isAnimating}>
              {isAnimating ? t('common.running') : t('common.run')}
            </OperationButton>
            {isAnimating && <OperationButton variant="outline" onClick={handleStop}>{t('common.stop')}</OperationButton>}
            <OperationButton
              variant={learningMode.isLearning ? 'primary' : 'outline'}
              onClick={() => learningMode.isLearning ? learningMode.stopLearning() : learningMode.startLearning()}
              disabled={isAnimating}
            >
              {learningMode.isLearning ? t('errors.exitLearning') : t('errors.learningMode')}
            </OperationButton>
            {logs.length > 0 && (
              <>
                <OperationButton variant="outline" onClick={handleExportCSV} disabled={isAnimating}>
                  ⇅ CSV
                </OperationButton>
                <OperationButton variant="outline" onClick={handleExportJSON} disabled={isAnimating}>
                  ⇅ JSON
                </OperationButton>
              </>
            )}
          </OperationBar>

          <div className="flex-1 bg-white dark:bg-slate border-2 border-ink dark:border-dark-border">
            <Visualizer
              data={nodes}
              renderFn={handleGraphRender}
              svgRef={svgRef}
              dimensions={dimensions}
              containerRef={containerRef}
              ariaLabel={t('visualizer.graphLabel')}
            />
          </div>
        </div>
        
        <div className="w-full lg:w-96 shrink-0 overflow-y-auto">
          <LogPanel logs={logs} />

          {learningMode.isLearning && (
            <div className="mt-4">
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

          <div className="mt-4">
            <div className="bg-white dark:bg-slate border-2 border-ink dark:border-dark-border p-4">
              <h3 className="text-sm font-bold text-ink dark:text-dark-ink mb-2">{t('graphAlgorithm.complexityCompare')}</h3>
              <div className="h-48">
                <ComplexityChart
                  algorithms={graphAlgorithms.map(algo => ({
                    name: algo.name,
                    complexity: algo.timeComplexity,
                  }))}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}