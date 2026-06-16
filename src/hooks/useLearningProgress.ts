import { useState, useCallback, useEffect } from 'react'
import { LEARNING_PATH } from '../configs/learningPath'

const STORAGE_KEY = 'ds-visualizer-learning-progress'

interface LearningProgress {
  visited: string[]
  completed: string[]
  startedAt: string
}

function loadProgress(): LearningProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as LearningProgress
      if (parsed && Array.isArray(parsed.visited) && Array.isArray(parsed.completed)) {
        return parsed
      }
    }
  } catch { /* ignore */ }
  return { visited: [], completed: [], startedAt: new Date().toISOString() }
}

function saveProgress(progress: LearningProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch { /* storage full */ }
}

export function useLearningProgress() {
  const [progress, setProgress] = useState<LearningProgress>(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const markVisited = useCallback((id: string) => {
    setProgress(prev => {
      if (prev.visited.includes(id)) return prev
      return { ...prev, visited: [...prev.visited, id] }
    })
  }, [])

  const markCompleted = useCallback((id: string) => {
    setProgress(prev => {
      if (prev.completed.includes(id)) return prev
      const visited = prev.visited.includes(id) ? prev.visited : [...prev.visited, id]
      return { ...prev, visited, completed: [...prev.completed, id] }
    })
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
    setProgress(fresh)
    saveProgress(fresh)
  }, [])

  return {
    markVisited,
    markCompleted,
    isVisited,
    isCompleted,
    isUnlocked,
    getProgress,
    resetProgress,
  }
}
