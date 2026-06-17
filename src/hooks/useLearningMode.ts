import { useState, useCallback, useEffect } from 'react'
import { learningConfigs } from '../configs/learning'

const STORAGE_PREFIX = 'ds-learning-step-'

export function useLearningMode(algorithmKey: string) {
  const config = learningConfigs[algorithmKey as keyof typeof learningConfigs]
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    const stored = localStorage.getItem(STORAGE_PREFIX + algorithmKey)
    const idx = stored !== null ? parseInt(stored, 10) : 0
    return isNaN(idx) ? 0 : idx
  })
  const [isLearning, setIsLearning] = useState(false)

  const steps = config?.steps || []
  const totalSteps = steps.length

  // Clamp index if steps changed
  const clampedIndex = Math.min(currentStepIndex, Math.max(0, totalSteps - 1))
  const currentStep = steps[clampedIndex] || null
  const progress = totalSteps > 0 ? ((clampedIndex + 1) / totalSteps) * 100 : 0

  // Persist step index
  useEffect(() => {
    if (totalSteps > 0) {
      localStorage.setItem(STORAGE_PREFIX + algorithmKey, String(clampedIndex))
    }
  }, [algorithmKey, clampedIndex, totalSteps])

  const nextStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.min(prev + 1, totalSteps - 1))
  }, [totalSteps])

  const prevStep = useCallback(() => {
    setCurrentStepIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < totalSteps) {
      setCurrentStepIndex(index)
    }
  }, [totalSteps])

  const reset = useCallback(() => {
    setCurrentStepIndex(0)
  }, [])

  const startLearning = useCallback(() => {
    setIsLearning(true)
    setCurrentStepIndex(0)
  }, [])

  const stopLearning = useCallback(() => {
    setIsLearning(false)
    setCurrentStepIndex(0)
  }, [])

  return {
    currentStep,
    currentStepIndex: clampedIndex,
    totalSteps,
    progress,
    isLearning,
    steps,
    nextStep,
    prevStep,
    goToStep,
    reset,
    startLearning,
    stopLearning,
    hasSteps: totalSteps > 0,
  }
}
