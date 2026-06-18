import { LEARNING_PATH, type LearningPathNode } from '../configs/learningPath'

export interface LearningProgressData {
  visited: string[]
  completed: string[]
  startedAt: string
}

export interface Recommendation {
  node: LearningPathNode
  reasonKey: string
  action: 'start' | 'continue' | 'review'
  priority: number
}

export interface PersonalizedAdvice {
  key: string
  params?: Record<string, string | number>
}

const DAY_MS = 24 * 60 * 60 * 1000

function isUnlocked(node: LearningPathNode, completed: string[]): boolean {
  if (node.prerequisites.length === 0) return true
  return node.prerequisites.every(p => completed.includes(p))
}

function daysSince(dateStr: string): number {
  const start = new Date(dateStr).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - start) / DAY_MS))
}

export function getRecommendations(
  progress: LearningProgressData,
  config: LearningPathNode[] = LEARNING_PATH,
): Recommendation[] {
  const { visited, completed } = progress
  const recommendations: Recommendation[] = []

  for (const node of config) {
    if (completed.includes(node.id)) continue
    if (visited.includes(node.id)) continue
    if (!isUnlocked(node, completed)) continue

    recommendations.push({
      node,
      reasonKey: node.prerequisites.length === 0
        ? 'recommendations.reason.startHere'
        : 'recommendations.reason.unlockedNotStarted',
      action: 'start',
      priority: 1,
    })
  }

  for (const node of config) {
    if (completed.includes(node.id)) continue
    if (!visited.includes(node.id)) continue

    recommendations.push({
      node,
      reasonKey: 'recommendations.reason.continueLearning',
      action: 'continue',
      priority: 2,
    })
  }

  if (recommendations.length === 0 && completed.length > 0) {
    for (const node of config) {
      if (!completed.includes(node.id)) continue
      recommendations.push({
        node,
        reasonKey: 'recommendations.reason.review',
        action: 'review',
        priority: 3,
      })
    }
  }

  recommendations.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.node.difficulty - b.node.difficulty
  })

  return recommendations.slice(0, 3)
}

export function getPersonalizedAdvice(
  progress: LearningProgressData,
  config: LearningPathNode[] = LEARNING_PATH,
): PersonalizedAdvice {
  const { visited, completed, startedAt } = progress
  const totalModules = config.length
  const completedCount = completed.length

  if (completedCount === 0 && visited.length === 0) {
    return { key: 'recommendations.advice.welcome' }
  }

  if (completedCount === totalModules) {
    return { key: 'recommendations.advice.allCompleted' }
  }

  const days = daysSince(startedAt)

  if (completedCount === 0 && visited.length > 0) {
    if (days >= 7) {
      return { key: 'recommendations.advice.stalled', params: { days } }
    }
    return { key: 'recommendations.advice.justStarted' }
  }

  const velocity = days > 0 ? completedCount / days : completedCount

  if (velocity > 0.14) {
    return { key: 'recommendations.advice.fastPace', params: { completed: completedCount, days } }
  }

  if (velocity < 0.05) {
    return { key: 'recommendations.advice.slowPace', params: { completed: completedCount, days } }
  }

  return { key: 'recommendations.advice.normalPace', params: { completed: completedCount, days } }
}
