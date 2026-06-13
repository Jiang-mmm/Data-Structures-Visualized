import { createContext, useContext, useState, useCallback, createElement, type ReactNode } from 'react'
import { setAnimationSpeed, applyPreset, getAnimationSpeed } from '../utils/animationEngine'
import { useI18n } from '../i18n/useI18n'

interface GlobalSettingsValue {
  animationSpeed: number
  setAnimationSpeed: (value: number) => void
  cycleSpeed: () => void
  showIndices: boolean
  setShowIndices: (show: boolean) => void
  currentPreset: string
  applyPreset: (key: string) => void
  t: (key: string) => string
  lang: string
  setLanguage: (lang: string) => void
  supportedLanguages: string[]
}

const GlobalSettingsContext = createContext<GlobalSettingsValue | null>(null)

export function GlobalSettingsProvider({ children }: { children: ReactNode }) {
  const [animationSpeed, setSpeed] = useState<number>(1)
  const [showIndices, setShowIndices] = useState<boolean>(true)
  const [currentPreset, setCurrentPreset] = useState<string>('default')
  const { t, lang, setLanguage, supportedLanguages } = useI18n()

  const setAnimationSpeedValue = useCallback((value: number) => {
    setSpeed(value)
    setAnimationSpeed(value)
  }, [])

  const cycleSpeed = useCallback(() => {
    const speeds = [0.5, 1, 1.5, 2, 4]
    setSpeed(prev => {
      const idx = speeds.indexOf(prev)
      const next = speeds[(idx + 1) % speeds.length]
      setAnimationSpeed(next)
      return next
    })
  }, [])

  const applyAnimationPreset = useCallback((presetKey: string) => {
    applyPreset(presetKey)
    setCurrentPreset(presetKey)
    setSpeed(getAnimationSpeed())
  }, [])

  return createElement(GlobalSettingsContext.Provider, {
    value: {
      animationSpeed,
      setAnimationSpeed: setAnimationSpeedValue,
      cycleSpeed,
      showIndices,
      setShowIndices,
      currentPreset,
      applyPreset: applyAnimationPreset,
      t,
      lang,
      setLanguage,
      supportedLanguages,
    }
  }, children)
}

export function useGlobalSettings(): GlobalSettingsValue {
  const ctx = useContext(GlobalSettingsContext)
  if (!ctx) throw new Error('useGlobalSettings must be used within GlobalSettingsProvider')
  return ctx
}
