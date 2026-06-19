import { useState, useCallback, useEffect, useRef } from 'react'
import { LEARNING_PATH } from '../configs/learningPath'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

const STORAGE_KEY = 'ds-visualizer-learning-progress'
const GOAL_STORAGE_KEY = 'ds-visualizer-learning-goal'
const SYNC_EVENT = 'ds-learning-progress-sync'

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'failed'

export interface LearningGoal {
  targetSteps: number
  targetDate: string
  createdAt: string
}

interface LearningProgress {
  visited: string[]
  completed: string[]
  startedAt: string
}

const VALID_IDS = new Set(LEARNING_PATH.map(n => n.id))

function loadProgress(): LearningProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as LearningProgress
      if (parsed && Array.isArray(parsed.visited) && Array.isArray(parsed.completed)) {
        return {
          visited: parsed.visited.filter(id => VALID_IDS.has(id)),
          completed: parsed.completed.filter(id => VALID_IDS.has(id)),
          startedAt: parsed.startedAt || new Date().toISOString(),
        }
      }
    }
  } catch { /* ignore */ }
  return { visited: [], completed: [], startedAt: new Date().toISOString() }
}

function saveProgress(progress: LearningProgress): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
    return true
  } catch { /* storage full */ }
  return false
}

function loadGoal(): LearningGoal | null {
  try {
    const stored = localStorage.getItem(GOAL_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as LearningGoal
      if (parsed && typeof parsed.targetSteps === 'number' && typeof parsed.targetDate === 'string') {
        return {
          targetSteps: parsed.targetSteps,
          targetDate: parsed.targetDate,
          createdAt: parsed.createdAt || new Date().toISOString(),
        }
      }
    }
  } catch { /* ignore */ }
  return null
}

function saveGoal(goal: LearningGoal | null): boolean {
  try {
    if (goal) {
      localStorage.setItem(GOAL_STORAGE_KEY, JSON.stringify(goal))
    } else {
      localStorage.removeItem(GOAL_STORAGE_KEY)
    }
    return true
  } catch { /* storage full */ }
  return false
}

function notifySync() {
  window.dispatchEvent(new CustomEvent(SYNC_EVENT))
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(loadProgress)
  const [goal, setGoalState] = useState<LearningGoal | null>(loadGoal)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const progressRef = useRef(progress)
  const goalRef = useRef(goal)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    goalRef.current = goal
  }, [goal])

  useEffect(() => {
    const handleSync = () => {
      const loaded = loadProgress()
      progressRef.current = loaded
      setProgress(loaded)
      const loadedGoal = loadGoal()
      goalRef.current = loadedGoal
      setGoalState(loadedGoal)
    }
    window.addEventListener(SYNC_EVENT, handleSync)
    return () => window.removeEventListener(SYNC_EVENT, handleSync)
  }, [])

  const markVisited = useCallback((id: string) => {
    const prev = progressRef.current
    if (prev.visited.includes(id)) return
    const next = { ...prev, visited: [...prev.visited, id] }
    progressRef.current = next
    setSyncStatus('syncing')
    const ok = saveProgress(next)
    setProgress(next)
    setSyncStatus(ok ? 'synced' : 'failed')
    notifySync()
  }, [])

  const markCompleted = useCallback((id: string) => {
    const prev = progressRef.current
    if (prev.completed.includes(id)) return
    const visited = prev.visited.includes(id) ? prev.visited : [...prev.visited, id]
    const next = { ...prev, visited, completed: [...prev.completed, id] }
    progressRef.current = next
    setSyncStatus('syncing')
    const ok = saveProgress(next)
    setProgress(next)
    setSyncStatus(ok ? 'synced' : 'failed')
    if (ok) {
      showToast({ type: 'success', message: tStatic('learningPath.sync.synced') })
    } else {
      showToast({ type: 'error', message: tStatic('learningPath.sync.failed') })
    }
    notifySync()
  }, [])

  const isVisited = useCallback((id: string) => progress.visited.includes(id), [progress.visited])
  const isCompleted = useCallback((id: string) => progress.completed.includes(id), [progress.completed])

  const isUnlocked = useCallback((id: string) => {
    const node = LEARNING_PATH.find(n => n.id === id)
    if (!node) return false
    if (node.prerequisites.length === 0) return true
    return node.prerequisites.every(p => progress.completed.includes(p))
  }, [progress.completed])

  const getProgress = useCallback(() => {
    const total = LEARNING_PATH.length
    const completed = progress.completed.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }, [progress.completed])

  const resetProgress = useCallback(() => {
    const fresh: LearningProgress = { visited: [], completed: [], startedAt: new Date().toISOString() }
    progressRef.current = fresh
    setSyncStatus('syncing')
    const ok = saveProgress(fresh)
    setProgress(fresh)
    setSyncStatus(ok ? 'synced' : 'failed')
    notifySync()
  }, [])

  const setGoal = useCallback((targetSteps: number, targetDate: string): boolean => {
    const next: LearningGoal = {
      targetSteps,
      targetDate,
      createdAt: new Date().toISOString(),
    }
    goalRef.current = next
    setSyncStatus('syncing')
    const ok = saveGoal(next)
    setGoalState(next)
    setSyncStatus(ok ? 'synced' : 'failed')
    notifySync()
    return ok
  }, [])

  const clearGoal = useCallback(() => {
    goalRef.current = null
    setSyncStatus('syncing')
    const ok = saveGoal(null)
    setGoalState(null)
    setSyncStatus(ok ? 'synced' : 'failed')
    notifySync()
  }, [])

  const totalModules = LEARNING_PATH.length
  const completedModules = progress.completed.length
  const inProgressModules = progress.visited.filter(id => !progress.completed.includes(id)).length
  const notStartedModules = totalModules - completedModules - inProgressModules
  const overallCompletionRate = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0

  const goalProgress = goal && goal.targetSteps > 0
    ? Math.min(100, Math.round((completedModules / goal.targetSteps) * 100))
    : 0

  return {
    markVisited,
    markCompleted,
    isVisited,
    isCompleted,
    isUnlocked,
    getProgress,
    resetProgress,
    syncStatus,
    totalModules,
    completedModules,
    inProgressModules,
    notStartedModules,
    overallCompletionRate,
    goal,
    setGoal,
    clearGoal,
    goalProgress,
  }
}
