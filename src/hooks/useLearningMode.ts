import { useState, useCallback } from 'react'
import { learningConfigs } from '../configs/learning'
import type { LearningStep, LearningModeConfig } from '../configs/learning'

export function useLearningMode(algorithmKey: string) {
  const config = learningConfigs[algorithmKey as keyof typeof learningConfigs]
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isLearning, setIsLearning] = useState(false)

  const steps = config?.steps || []
  const currentStep = steps[currentStepIndex] || null
  const totalSteps = steps.length
  const progress = totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0

  const nextStep = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1)
    }
  }, [currentStepIndex, totalSteps])

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
    }
  }, [currentStepIndex])

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
    currentStepIndex,
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
