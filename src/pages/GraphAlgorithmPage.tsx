import { useState, useCallback, useRef } from 'react'
import PageHeader from '../components/PageHeader'
import OperationBar, { OperationButton } from '../components/OperationBar'
import LogPanel from '../components/LogPanel'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useKeyboard } from '../hooks/useKeyboard'
import { useLearningMode } from '../hooks/useLearningMode'
import { showToast } from '../components/toastStore'
import StepExplainer from '../components/StepExplainer'
import ComplexityChart from '../components/ComplexityChart'
import { bfs, dfs, dijkstra, topoSort, graphAlgorithms, type GraphAlgorithmKey } from '../algorithms/graph'
import { exportPerformanceCSV, exportPerformanceJSON } from '../utils/dataExport'

interface LogEntry {
  time: string
  type: string
  message: string
}

export default function GraphAlgorithmPage() {
  const { t } = useGlobalSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<GraphAlgorithmKey>('bfs')
  const [startNode, setStartNode] = useState('A')
  const learningMode = useLearningMode(selectedAlgorithm)
  
  const [nodes] = useState([
    { id: 'A', x: 100, y: 100 },
    { id: 'B', x: 250, y: 50 },
    { id: 'C', x: 400, y: 100 },
    { id: 'D', x: 100, y: 250 },
    { id: 'E', x: 250, y: 200 },
    { id: 'F', x: 400, y: 250 },
  ])
  
  const [links] = useState([
    { source: 'A', target: 'B', weight: 4 },
    { source: 'A', target: 'D', weight: 2 },
    { source: 'B', target: 'C', weight: 3 },
    { source: 'B', target: 'E', weight: 1 },
    { source: 'C', target: 'F', weight: 5 },
    { source: 'D', target: 'E', weight: 7 },
    { source: 'E', target: 'F', weight: 2 },
  ])
  
  const addLog = useCallback((type: string, message: string) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setLogs(prev => [...prev, { time, type, message }])
  }, [])
  
  const handleRun = useCallback(async () => {
    if (isAnimating) return
    setIsAnimating(true)
    addLog('info', `${t('common.run')} ${selectedAlgorithm.toUpperCase()}...`)
    
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
          break
        case 'dfs':
          result = await dfs(adjacencyList, startNode, onStep)
          break
        case 'dijkstra':
          result = await dijkstra(adjacencyList, startNode, onStep)
          break
        case 'topoSort':
          result = await topoSort(adjacencyList, onStep)
          break
      }
      
      addLog('info', `${selectedAlgorithm.toUpperCase()} ${t('page.done')} · ${result?.visited.length} nodes`)
      showToast({ type: 'success', message: `${selectedAlgorithm.toUpperCase()} ${t('page.done')}` })
    } catch (e) {
      addLog('error', `${t('errors.graphRunError')}: ${e}`)
      showToast({ type: 'error', message: t('errors.graphRunError') })
    }
    
    setIsAnimating(false)
  }, [isAnimating, selectedAlgorithm, startNode, nodes, links, addLog])
  
  const reset = useCallback(() => {
    setLogs([])
    showToast({ type: 'info', message: t('errors.graphResetDone') })
  }, [])

  const handleExportCSV = useCallback(() => {
    const algo = graphAlgorithms.find(a => a.key === selectedAlgorithm)
    if (!algo) return
    exportPerformanceCSV({
      [selectedAlgorithm]: {
        name: algo.name,
        timeComplexity: algo.timeComplexity,
        spaceComplexity: algo.spaceComplexity,
        comparisons: logs.filter(l => l.type === 'oper').length,
        steps: logs.length,
      }
    } as any)
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
    <div className="h-full flex flex-col">
      <PageHeader
        title={t('graphAlgorithm.title')}
        subtitle={t('graphAlgorithm.subtitle')}
        icon="🔀"
      >
        <OperationButton variant="outline" onClick={reset} disabled={isAnimating}>
          {t('common.reset')}
        </OperationButton>
      </PageHeader>
      
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
          
          <div className="flex gap-2">
            <OperationButton variant="primary" onClick={handleRun} disabled={isAnimating}>
              {isAnimating ? t('common.running') : t('common.run')}
            </OperationButton>
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
                  📊 CSV
                </OperationButton>
                <OperationButton variant="outline" onClick={handleExportJSON} disabled={isAnimating}>
                  📋 JSON
                </OperationButton>
              </>
            )}
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate border-2 border-ink dark:border-dark-border p-4">
            <div ref={containerRef} className="w-full h-full">
              <svg width="100%" height="100%" viewBox="0 0 500 350">
                {links.map((link, i) => {
                  const source = nodes.find(n => n.id === link.source)
                  const target = nodes.find(n => n.id === link.target)
                  if (!source || !target) return null
                  return (
                    <g key={i}>
                      <line
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-ink/20 dark:text-dark-ink/20"
                      />
                      <text
                        x={(source.x + target.x) / 2}
                        y={(source.y + target.y) / 2}
                        textAnchor="middle"
                        dy="-5"
                        className="text-xs fill-ink-light dark:fill-dark-ink-light"
                      >
                        {link.weight}
                      </text>
                    </g>
                  )
                })}
                
                {nodes.map(node => (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="20"
                      className="fill-white dark:fill-slate stroke-ink dark:stroke-dark-border"
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dy="5"
                      className="text-sm font-bold fill-ink dark:fill-dark-ink"
                    >
                      {node.id}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-80">
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