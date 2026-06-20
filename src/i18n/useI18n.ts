import { useState, useCallback, useEffect } from 'react'
import { zh, en, type Locale } from './locales'

const LANGUAGES: Record<string, Locale> = {
  zh,
  en,
}

const STORAGE_KEY = 'ds-visualizer-lang'

function getStoredLang(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && LANGUAGES[stored]) return stored
  } catch { /* ignore */ }
  return 'zh'
}

export function tStatic(key: string): string {
  const lang = getStoredLang()
  const locale = LANGUAGES[lang] || LANGUAGES.zh
  const keys = key.split('.')
  let value: unknown = locale
  for (const k of keys) {
    if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
      value = (value as Record<string, unknown>)[k]
    } else {
      return key
    }
  }
  return typeof value === 'string' ? value : key
}

function saveLang(lang: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch { /* ignore */ }
}

export function useI18n() {
  const [lang, setLang] = useState<string>(getStoredLang)

  useEffect(() => {
    saveLang(lang)
  }, [lang])

  const t = useCallback((key: string): string => {
    const locale = LANGUAGES[lang] || LANGUAGES.zh
    const keys = key.split('.')
    let value: unknown = locale
    for (const k of keys) {
      if (value && typeof value === 'object' && k in (value as Record<string, unknown>)) {
        value = (value as Record<string, unknown>)[k]
      } else {
        return key
      }
    }
    return typeof value === 'string' ? value : key
  }, [lang])

  const setLanguage = useCallback((newLang: string) => {
    if (LANGUAGES[newLang]) setLang(newLang)
  }, [])

  const supportedLanguages = Object.keys(LANGUAGES)

  return { t, lang, setLanguage, supportedLanguages }
}
