import { useEffect } from 'react'
import { useLearningProgress } from './useLearningProgress'

export function usePageTracker(pageId: string) {
  const { markVisited } = useLearningProgress()

  useEffect(() => {
    markVisited(pageId)
  }, [pageId, markVisited])
}
