import { useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribeTheme, getAvailableThemes } from '../utils/themeColors'

export function useColorTheme() {
  const theme = useSyncExternalStore(subscribeTheme, getTheme)
  return { theme, setTheme, themes: getAvailableThemes() }
}
