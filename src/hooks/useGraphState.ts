import { useState, useCallback, useRef } from 'react'
import { showToast } from '../components/toastStore'
import { useDataStructureState } from './useDataStructureState'
import { INITIAL_NODES, INITIAL_LINKS } from '../visualizers/graphVisualizer'
import { tStatic } from '../i18n/useI18n'

export interface GraphNode {
  id: string
  group?: number
  x?: number
  y?: number
}

export interface GraphLink {
  source: string
  target: string
  weight?: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

const INITIAL_DATA: GraphData = {
  nodes: INITIAL_NODES.map(n => ({ ...n })),
  links: INITIAL_LINKS.map(l => ({ ...l, source: String(l.source), target: String(l.target) })),
}

export function useGraphState() {
  const nodeCounterRef = useRef(0)

  function nextNodeId(existing: GraphNode[]): string {
    const ids = new Set(existing.map(n => n.id))
    const letters = 'GHIJKLMNOPQRSTUVWXYZ'
    for (const c of letters) { if (!ids.has(c)) return c }
    nodeCounterRef.current++
    return `N${nodeCounterRef.current}`
  }

  const {
    data: graphData, logs, isAnimating, setIsAnimating,
    push: pushGraph, addLog, reset: resetDataStructure, loadData: loadGraphData,
    undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview,
  } = useDataStructureState<GraphData>(INITIAL_DATA, { storageKey: 'graph' })

  const nodes = graphData.nodes
  const links = graphData.links

  const [viewMode, setViewMode] = useState<string>('force')

  const reset = useCallback(() => {
    resetDataStructure()
    nodeCounterRef.current = 0
    showToast({ type: 'info', message: tStatic('toast.reset') })
  }, [resetDataStructure])

  const addNode = useCallback(() => {
    const id = nextNodeId(nodes)
    const group = Math.floor(Math.random() * 3)
    const newNodes = [...nodes, { id, group }]
    pushGraph({ nodes: newNodes, links })
    addLog('oper', tStatic('hooks.graphLogAddNode').replace('{id}', id).replace('{count}', String(newNodes.length)))
    showToast({ type: 'success', message: tStatic('hooks.graphNodeAdded').replace('{id}', id) })
  }, [nodes, links, pushGraph, addLog])

  const addEdge = useCallback((sourceId: string, targetId: string, weight?: number): boolean => {
    if (sourceId === targetId) {
      showToast({ type: 'error', message: tStatic('hooks.graphSelfLoop') })
      return false
    }
    const exists = links.some(l => {
      const s = l.source; const t = l.target
      return (s === sourceId && t === targetId) || (s === targetId && t === sourceId)
    })
    if (exists) {
      showToast({ type: 'warning', message: tStatic('hooks.graphEdgeExists') })
      return false
    }
    const newLinks = [...links, { source: sourceId, target: targetId, weight: weight || 1 }]
    pushGraph({ nodes, links: newLinks })
    addLog('oper', tStatic('hooks.graphLogAddEdge').replace('{source}', sourceId).replace('{target}', targetId).replace('{weight}', String(weight || 1)).replace('{count}', String(newLinks.length)))
    showToast({ type: 'success', message: tStatic('hooks.graphEdgeAdded').replace('{source}', sourceId).replace('{target}', targetId) })
    return true
  }, [nodes, links, pushGraph, addLog])

  const deleteNode = useCallback((nodeId: string) => {
    const newNodes = nodes.filter(n => n.id !== nodeId)
    const newLinks = links.filter(l => {
      const s = l.source; const t = l.target
      return s !== nodeId && t !== nodeId
    })
    pushGraph({ nodes: newNodes, links: newLinks })
    addLog('oper', tStatic('hooks.graphNodeDeleted').replace('{id}', nodeId))
    showToast({ type: 'info', message: tStatic('hooks.graphNodeDeleted').replace('{id}', nodeId) })
  }, [nodes, links, pushGraph, addLog])

  const deleteEdge = useCallback((sourceId: string, targetId: string) => {
    const newLinks = links.filter(l => {
      const s = l.source; const t = l.target
      return !(s === sourceId && t === targetId) && !(s === targetId && t === sourceId)
    })
    pushGraph({ nodes, links: newLinks })
    addLog('oper', tStatic('hooks.graphEdgeDeleted').replace('{source}', sourceId).replace('{target}', targetId))
    showToast({ type: 'info', message: tStatic('hooks.graphEdgeDeleted').replace('{source}', sourceId).replace('{target}', targetId) })
  }, [nodes, links, pushGraph, addLog])

  const bfs = useCallback((startId: string) => {
    addLog('info', tStatic('hooks.graphLogBfsStart').replace('{id}', startId))
  }, [addLog])

  const dfs = useCallback((startId: string) => {
    addLog('info', tStatic('hooks.graphLogDfsStart').replace('{id}', startId))
  }, [addLog])

  const dijkstra = useCallback((startId: string, endId: string) => {
    addLog('info', tStatic('hooks.graphLogDijkstraStart').replace('{start}', startId).replace('{end}', endId))
  }, [addLog])

  const getAdjacencyMatrix = useCallback(() => {
    const ids = nodes.map(n => n.id)
    const matrix = ids.map(() => ids.map(() => 0))
    links.forEach(l => {
      const s = l.source; const t = l.target
      const si = ids.indexOf(s); const ti = ids.indexOf(t)
      if (si >= 0 && ti >= 0) { matrix[si][ti] = l.weight!; matrix[ti][si] = l.weight! }
    })
    return { ids, matrix }
  }, [nodes, links])

  const getAdjacencyList = useCallback(() => {
    const adj = new Map<string, { node: string; weight?: number }[]>()
    nodes.forEach(n => adj.set(n.id, []))
    links.forEach(l => {
      const s = l.source; const t = l.target
      adj.get(s)?.push({ node: t, weight: l.weight })
      adj.get(t)?.push({ node: s, weight: l.weight })
    })
    return Object.fromEntries(adj)
  }, [nodes, links])

  const loadData = useCallback((data: GraphNode[] | { nodes: GraphNode[]; links?: GraphLink[] }) => {
    if (Array.isArray(data)) {
      loadGraphData({ nodes: data, links: [] })
    } else {
      loadGraphData({ nodes: data.nodes, links: data.links || [] })
    }
  }, [loadGraphData])

  return {
    nodes, links, logs, isAnimating, setIsAnimating, viewMode, setViewMode,
    addNode, addEdge, deleteNode, deleteEdge,
    bfs, dfs, dijkstra, reset, loadData,
    undo,
    redo,
    canUndo,
    canRedo,
    getUndoPreview,
    getRedoPreview,
    getAdjacencyMatrix, getAdjacencyList,
  }
}
