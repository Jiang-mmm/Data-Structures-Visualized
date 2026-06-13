import { useState, useEffect, useCallback } from 'react'

type ThemeMode = 'light' | 'dark' | 'system'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'ds-visualizer-theme'
const VALID_THEMES: ThemeMode[] = ['light', 'dark', 'system']

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && VALID_THEMES.includes(stored as ThemeMode) ? (stored as ThemeMode) : null
  } catch {
    return null
  }
}

function storeTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch { /* ignore storage errors */ }
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return getStoredTheme() || 'system'
  })

  const [resolved, setResolved] = useState<ResolvedTheme>(() => {
    const stored = getStoredTheme()
    if (stored === 'dark' || stored === 'light') return stored
    return getSystemTheme()
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        setResolved(e.matches ? 'dark' : 'light')
      }
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  useEffect(() => {
    const root = document.documentElement
    if (resolved === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [resolved])

  const cycle = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'
      storeTheme(next)
      if (next === 'system') {
        setResolved(getSystemTheme())
      } else {
        setResolved(next)
      }
      return next
    })
  }, [])

  const set = useCallback((next: ThemeMode) => {
    storeTheme(next)
    setMode(next)
    if (next === 'system') {
      setResolved(getSystemTheme())
    } else {
      setResolved(next)
    }
  }, [])

  return { mode, resolved, cycle, set }
}
