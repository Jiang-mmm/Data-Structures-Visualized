import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import PageHeader from '../components/PageHeader'
import Card from '../components/Card'
import OperationBar, { OperationButton } from '../components/OperationBar'
import SpeedControl from '../components/SpeedControl'
import InfoPanel from '../components/InfoPanel'
import Visualizer from '../components/Visualizer'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useKeyboard } from '../hooks/useKeyboard'
import { useLearningMode } from '../hooks/useLearningMode'
import { useVisualizer } from '../hooks/useVisualizer'
import { showToast } from '../components/toastStore'
import ComplexityChart from '../components/ComplexityChart'
import { bfs, dfs, dijkstra, topoSort, bellmanFord, floydWarshall, prim, kruskal, graphAlgorithms, type GraphAlgorithmKey } from '../algorithms/graph'
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
    const svg = svgRef.current
    return () => { if (svg) clearGraphSimulation(svg) }
  }, [svgRef])
  
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
        case 'bellmanFord':
          result = await bellmanFord(adjacencyList, startNode, onStep)
          if (svgRef.current) await animateBFS(svgRef.current, startNode, nodes, links, dimensions, anim)
          break
        case 'floydWarshall':
          result = await floydWarshall(adjacencyList, onStep)
          if (svgRef.current) await animateBFS(svgRef.current, startNode, nodes, links, dimensions, anim)
          break
        case 'prim':
          result = await prim(adjacencyList, startNode, onStep)
          if (svgRef.current) await animateBFS(svgRef.current, startNode, nodes, links, dimensions, anim)
          break
        case 'kruskal':
          result = await kruskal(adjacencyList, onStep)
          if (svgRef.current) await animateBFS(svgRef.current, startNode, nodes, links, dimensions, anim)
          break
      }

      hasRunRef.current = true
      addLog('info', `${selectedAlgorithm.toUpperCase()} ${t('page.done')} · ${result?.visited.length} nodes`)
      showToast({ type: 'success', message: `${selectedAlgorithm.toUpperCase()} ${t('page.done')}` })
    } catch (error) {
      handleAnimationError(error, selectedAlgorithm.toUpperCase())
      addLog('error', `${t('errors.graphRunError')}: ${error}`)
      showToast({ type: 'error', message: t('errors.graphRunError') })
    }

    setIsAnimating(false)
  }, [isAnimating, selectedAlgorithm, startNode, nodes, links, addLog, getAnimationContext, svgRef, dimensions, t])

  const reset = useCallback(() => {
    hasRunRef.current = false
    setLogs([])
    if (svgRef.current) renderGraph(svgRef.current, nodes, links, dimensions)
    showToast({ type: 'info', message: t('errors.graphResetDone') })
  }, [nodes, links, dimensions, svgRef, t])

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
    <div className="flex flex-col min-h-dvh bg-paper dark:bg-dark-paper grain">
      <PageHeader
        title={t('graphAlgorithm.title')}
        subtitle={t('graphAlgorithm.subtitle')}
      >
        <OperationButton variant="secondary" onClick={reset} disabled={isAnimating} isBusy={isAnimating}>
          {t('common.reset')}
        </OperationButton>
      </PageHeader>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
        <div className="flex-1 flex flex-col gap-4">
          <OperationBar label={t('graphAlgorithm.algorithm')}>
            {graphAlgorithms.map(algo => (
              <OperationButton
                key={algo.key}
                variant={selectedAlgorithm === algo.key ? 'primary' : 'outline'}
                onClick={() => setSelectedAlgorithm(algo.key)}
                disabled={isAnimating} isBusy={isAnimating}
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
                disabled={isAnimating} isBusy={isAnimating}
              >
                {node.id}
              </OperationButton>
            ))}
          </OperationBar>
          
          <OperationBar>
            <SpeedControl />
            <OperationButton variant="primary" onClick={handleRun} disabled={isAnimating} isBusy={isAnimating}>
              {isAnimating ? t('common.running') : t('common.run')}
            </OperationButton>
            {isAnimating && <OperationButton variant="secondary" onClick={handleStop}>{t('common.stop')}</OperationButton>}
            <OperationButton
              variant={learningMode.isLearning ? 'primary' : 'outline'}
              onClick={() => learningMode.isLearning ? learningMode.stopLearning() : learningMode.startLearning()}
              disabled={isAnimating} isBusy={isAnimating}
            >
              {learningMode.isLearning ? t('errors.exitLearning') : t('errors.learningMode')}
            </OperationButton>
            {logs.length > 0 && (
              <>
                <OperationButton variant="secondary" onClick={handleExportCSV} disabled={isAnimating} isBusy={isAnimating}>
                  ⇅ CSV
                </OperationButton>
                <OperationButton variant="secondary" onClick={handleExportJSON} disabled={isAnimating} isBusy={isAnimating}>
                  ⇅ JSON
                </OperationButton>
              </>
            )}
          </OperationBar>

          <div className="flex-1 flex flex-col relative min-h-0 bg-surface dark:bg-dark-surface border-2 border-ink dark:border-dark-border">
            <Visualizer
              data={nodes}
              renderFn={handleGraphRender}
              svgRef={svgRef}
              dimensions={dimensions}
              containerRef={containerRef}
              isAnimating={isAnimating}
              ariaLabel={t('visualizer.graphLabel')}
              className="!border-b-0"
            />
          </div>

          <Card shadow="md" radius="none">
            <h3 className="text-sm font-bold text-ink dark:text-dark-ink mb-3">{t('graphAlgorithm.complexityCompare')}</h3>
            <ComplexityChart
              algorithms={graphAlgorithms.map(algo => ({
                name: algo.name,
                complexity: algo.timeComplexity,
                timeComplexity: algo.timeComplexity,
                spaceComplexity: algo.spaceComplexity,
                description: algo.description,
              }))}
              showChart={false}
            />
          </Card>
        </div>

        <InfoPanel
          logs={logs}
          learningMode={learningMode}
          isAnimating={isAnimating}
        />
      </div>
    </div>
  )
}