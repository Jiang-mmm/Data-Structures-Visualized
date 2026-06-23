/**
 * 共享主题感知工具
 * 颜色系统 + 渐变定义 + 暗色模式检测 + 多主题
 */

import { tStatic } from '../i18n/useI18n'

const STORAGE_KEY = 'ds-visualizer-color-theme'

export interface ThemeColors {
  nodeDefault: string
  nodeRoot: string
  nodeLeaf: string
  nodeActive: string
  nodeVisited: string
  nodeError: string
  textPrimary: string
  textSecondary: string
  textWhite: string
  textMuted: string
  textLight: string
  edgeDefault: string
  edgeActive: string
  arrowStroke: string
  containerStroke: string
  nodeDefaultStroke: string
  nodeRootStroke: string
  nodeLeafStroke: string
  nodeActiveStroke: string
  nodeVisitedStroke: string
  nodeErrorStroke: string
  sortCompareStroke: string
  sortSwapStroke: string
  sortSortedStroke: string
  sortDefault: string
  sortDefaultStroke: string
  sortSorted: string
  bucketBg: string
  bucketStroke: string
  bucketText: string
  bucketHighlight: string
  bucketHighlightStroke: string
  bucketSuccess: string
  bucketSuccessStroke: string
  bucketError: string
  bucketErrorStroke: string
  countText: string
  entryFill: string
  entryValue: string
}

/**
 * 界面表面色 token（与 D3 用色 ThemeColors 分离）
 * 用于页面背景、卡片表面、边框、强调色等 UI 语义。
 */
export interface ThemeSurfaceTokens {
  paper: string
  ink: string
  surface: string
  surfaceStrong: string
  muted: string
  mutedForeground: string
  subtle: string
  info: string
  border: string
  borderSubtle: string
  borderStrong: string
  accent: string
  accentForeground: string
  gradientStart: string
  gradientEnd: string
}

const palettes: Record<string, { light: ThemeColors; dark: ThemeColors }> = {
  default: {
    light: {
      nodeDefault: '#3b82f6',
      nodeRoot: '#f59e0b',
      nodeLeaf: '#10b981',
      nodeActive: '#ef4444',
      nodeVisited: '#8b5cf6',
      nodeError: '#dc2626',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textWhite: '#ffffff',
      textMuted: '#4b5563',
      textLight: '#6b7280',
      edgeDefault: '#9ca3af',
      edgeActive: '#3b82f6',
      arrowStroke: '#4b5563',
      containerStroke: '#e5e7eb',
      nodeDefaultStroke: '#1d4ed8',
      nodeRootStroke: '#b45309',
      nodeLeafStroke: '#047857',
      nodeActiveStroke: '#b91c1c',
      nodeVisitedStroke: '#6d28d9',
      nodeErrorStroke: '#991b1b',
      sortCompareStroke: '#f97316',
      sortSwapStroke: '#a855f7',
      sortSortedStroke: '#10b981',
      sortDefault: '#3b82f6',
      sortDefaultStroke: '#2563eb',
      sortSorted: '#10b981',
      bucketBg: '#f3f4f6',
      bucketStroke: '#d1d5db',
      bucketText: '#374151',
      bucketHighlight: '#fef3c7',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#d1fae5',
      bucketSuccessStroke: '#10b981',
      bucketError: '#fee2e2',
      bucketErrorStroke: '#ef4444',
      countText: '#6b7280',
      entryFill: '#3b82f6',
      entryValue: '#6b7280',
    },
    dark: {
      nodeDefault: '#60a5fa',
      nodeRoot: '#fbbf24',
      nodeLeaf: '#34d399',
      nodeActive: '#f87171',
      nodeVisited: '#a78bfa',
      nodeError: '#ef4444',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textWhite: '#ffffff',
      textMuted: '#cbd5e1',
      textLight: '#94a3b8',
      edgeDefault: '#64748b',
      edgeActive: '#60a5fa',
      arrowStroke: '#94a3b8',
      containerStroke: '#334155',
      nodeDefaultStroke: '#2563eb',
      nodeRootStroke: '#d97706',
      nodeLeafStroke: '#059669',
      nodeActiveStroke: '#dc2626',
      nodeVisitedStroke: '#7c3aed',
      nodeErrorStroke: '#b91c1c',
      sortCompareStroke: '#fb923c',
      sortSwapStroke: '#c084fc',
      sortSortedStroke: '#34d399',
      sortDefault: '#60a5fa',
      sortDefaultStroke: '#3b82f6',
      sortSorted: '#34d399',
      bucketBg: '#1e293b',
      bucketStroke: '#475569',
      bucketText: '#e2e8f0',
      bucketHighlight: '#422006',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#064e3b',
      bucketSuccessStroke: '#10b981',
      bucketError: '#450a0a',
      bucketErrorStroke: '#ef4444',
      countText: '#94a3b8',
      entryFill: '#60a5fa',
      entryValue: '#94a3b8',
    },
  },
  forest: {
    light: {
      nodeDefault: '#059669',
      nodeRoot: '#d97706',
      nodeLeaf: '#10b981',
      nodeActive: '#ef4444',
      nodeVisited: '#8b5cf6',
      nodeError: '#dc2626',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textWhite: '#ffffff',
      textMuted: '#4b5563',
      textLight: '#6b7280',
      edgeDefault: '#9ca3af',
      edgeActive: '#059669',
      arrowStroke: '#4b5563',
      containerStroke: '#e5e7eb',
      nodeDefaultStroke: '#047857',
      nodeRootStroke: '#b45309',
      nodeLeafStroke: '#047857',
      nodeActiveStroke: '#b91c1c',
      nodeVisitedStroke: '#6d28d9',
      nodeErrorStroke: '#991b1b',
      sortCompareStroke: '#f97316',
      sortSwapStroke: '#a855f7',
      sortSortedStroke: '#10b981',
      sortDefault: '#059669',
      sortDefaultStroke: '#047857',
      sortSorted: '#10b981',
      bucketBg: '#f3f4f6',
      bucketStroke: '#d1d5db',
      bucketText: '#374151',
      bucketHighlight: '#fef3c7',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#d1fae5',
      bucketSuccessStroke: '#10b981',
      bucketError: '#fee2e2',
      bucketErrorStroke: '#ef4444',
      countText: '#6b7280',
      entryFill: '#059669',
      entryValue: '#6b7280',
    },
    dark: {
      nodeDefault: '#34d399',
      nodeRoot: '#fbbf24',
      nodeLeaf: '#6ee7b7',
      nodeActive: '#f87171',
      nodeVisited: '#a78bfa',
      nodeError: '#ef4444',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textWhite: '#ffffff',
      textMuted: '#cbd5e1',
      textLight: '#94a3b8',
      edgeDefault: '#64748b',
      edgeActive: '#34d399',
      arrowStroke: '#94a3b8',
      containerStroke: '#334155',
      nodeDefaultStroke: '#059669',
      nodeRootStroke: '#d97706',
      nodeLeafStroke: '#059669',
      nodeActiveStroke: '#dc2626',
      nodeVisitedStroke: '#7c3aed',
      nodeErrorStroke: '#b91c1c',
      sortCompareStroke: '#fb923c',
      sortSwapStroke: '#c084fc',
      sortSortedStroke: '#34d399',
      sortDefault: '#34d399',
      sortDefaultStroke: '#059669',
      sortSorted: '#34d399',
      bucketBg: '#1e293b',
      bucketStroke: '#475569',
      bucketText: '#e2e8f0',
      bucketHighlight: '#422006',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#064e3b',
      bucketSuccessStroke: '#10b981',
      bucketError: '#450a0a',
      bucketErrorStroke: '#ef4444',
      countText: '#94a3b8',
      entryFill: '#34d399',
      entryValue: '#94a3b8',
    },
  },
  warm: {
    light: {
      nodeDefault: '#ea580c',
      nodeRoot: '#d97706',
      nodeLeaf: '#10b981',
      nodeActive: '#ef4444',
      nodeVisited: '#8b5cf6',
      nodeError: '#dc2626',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textWhite: '#ffffff',
      textMuted: '#4b5563',
      textLight: '#6b7280',
      edgeDefault: '#9ca3af',
      edgeActive: '#ea580c',
      arrowStroke: '#4b5563',
      containerStroke: '#e5e7eb',
      nodeDefaultStroke: '#c2410c',
      nodeRootStroke: '#b45309',
      nodeLeafStroke: '#047857',
      nodeActiveStroke: '#b91c1c',
      nodeVisitedStroke: '#6d28d9',
      nodeErrorStroke: '#991b1b',
      sortCompareStroke: '#f97316',
      sortSwapStroke: '#a855f7',
      sortSortedStroke: '#10b981',
      sortDefault: '#ea580c',
      sortDefaultStroke: '#c2410c',
      sortSorted: '#10b981',
      bucketBg: '#f3f4f6',
      bucketStroke: '#d1d5db',
      bucketText: '#374151',
      bucketHighlight: '#fef3c7',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#d1fae5',
      bucketSuccessStroke: '#10b981',
      bucketError: '#fee2e2',
      bucketErrorStroke: '#ef4444',
      countText: '#6b7280',
      entryFill: '#ea580c',
      entryValue: '#6b7280',
    },
    dark: {
      nodeDefault: '#fb923c',
      nodeRoot: '#fbbf24',
      nodeLeaf: '#34d399',
      nodeActive: '#f87171',
      nodeVisited: '#a78bfa',
      nodeError: '#ef4444',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textWhite: '#ffffff',
      textMuted: '#cbd5e1',
      textLight: '#94a3b8',
      edgeDefault: '#64748b',
      edgeActive: '#fb923c',
      arrowStroke: '#94a3b8',
      containerStroke: '#334155',
      nodeDefaultStroke: '#ea580c',
      nodeRootStroke: '#d97706',
      nodeLeafStroke: '#059669',
      nodeActiveStroke: '#dc2626',
      nodeVisitedStroke: '#7c3aed',
      nodeErrorStroke: '#b91c1c',
      sortCompareStroke: '#fb923c',
      sortSwapStroke: '#c084fc',
      sortSortedStroke: '#34d399',
      sortDefault: '#fb923c',
      sortDefaultStroke: '#ea580c',
      sortSorted: '#34d399',
      bucketBg: '#1e293b',
      bucketStroke: '#475569',
      bucketText: '#e2e8f0',
      bucketHighlight: '#422006',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#064e3b',
      bucketSuccessStroke: '#10b981',
      bucketError: '#450a0a',
      bucketErrorStroke: '#ef4444',
      countText: '#94a3b8',
      entryFill: '#fb923c',
      entryValue: '#94a3b8',
    },
  },
  royal: {
    light: {
      nodeDefault: '#7c3aed',
      nodeRoot: '#d97706',
      nodeLeaf: '#10b981',
      nodeActive: '#ef4444',
      nodeVisited: '#8b5cf6',
      nodeError: '#dc2626',
      textPrimary: '#1f2937',
      textSecondary: '#4b5563',
      textWhite: '#ffffff',
      textMuted: '#4b5563',
      textLight: '#6b7280',
      edgeDefault: '#9ca3af',
      edgeActive: '#7c3aed',
      arrowStroke: '#4b5563',
      containerStroke: '#e5e7eb',
      nodeDefaultStroke: '#5b21b6',
      nodeRootStroke: '#b45309',
      nodeLeafStroke: '#047857',
      nodeActiveStroke: '#b91c1c',
      nodeVisitedStroke: '#6d28d9',
      nodeErrorStroke: '#991b1b',
      sortCompareStroke: '#f97316',
      sortSwapStroke: '#a855f7',
      sortSortedStroke: '#10b981',
      sortDefault: '#7c3aed',
      sortDefaultStroke: '#5b21b6',
      sortSorted: '#10b981',
      bucketBg: '#f3f4f6',
      bucketStroke: '#d1d5db',
      bucketText: '#374151',
      bucketHighlight: '#fef3c7',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#d1fae5',
      bucketSuccessStroke: '#10b981',
      bucketError: '#fee2e2',
      bucketErrorStroke: '#ef4444',
      countText: '#6b7280',
      entryFill: '#7c3aed',
      entryValue: '#6b7280',
    },
    dark: {
      nodeDefault: '#a78bfa',
      nodeRoot: '#fbbf24',
      nodeLeaf: '#34d399',
      nodeActive: '#f87171',
      nodeVisited: '#c4b5fd',
      nodeError: '#ef4444',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textWhite: '#ffffff',
      textMuted: '#cbd5e1',
      textLight: '#94a3b8',
      edgeDefault: '#64748b',
      edgeActive: '#a78bfa',
      arrowStroke: '#94a3b8',
      containerStroke: '#334155',
      nodeDefaultStroke: '#7c3aed',
      nodeRootStroke: '#d97706',
      nodeLeafStroke: '#059669',
      nodeActiveStroke: '#dc2626',
      nodeVisitedStroke: '#8b5cf6',
      nodeErrorStroke: '#b91c1c',
      sortCompareStroke: '#fb923c',
      sortSwapStroke: '#c084fc',
      sortSortedStroke: '#34d399',
      sortDefault: '#a78bfa',
      sortDefaultStroke: '#7c3aed',
      sortSorted: '#34d399',
      bucketBg: '#1e293b',
      bucketStroke: '#475569',
      bucketText: '#e2e8f0',
      bucketHighlight: '#422006',
      bucketHighlightStroke: '#f59e0b',
      bucketSuccess: '#064e3b',
      bucketSuccessStroke: '#10b981',
      bucketError: '#450a0a',
      bucketErrorStroke: '#ef4444',
      countText: '#94a3b8',
      entryFill: '#a78bfa',
      entryValue: '#94a3b8',
    },
  },
}

const surfacePalettes: Record<string, { light: ThemeSurfaceTokens; dark: ThemeSurfaceTokens }> = {
  default: {
    light: {
      paper: '#faf8f5',
      ink: '#1a1a2e',
      surface: '#ffffff',
      surfaceStrong: '#f5f3ef',
      muted: '#f5f3ef',
      mutedForeground: '#6b6b80',
      subtle: '#fbfaf8',
      info: '#2563eb',
      border: '#e5e0d8',
      borderSubtle: '#efebe5',
      borderStrong: '#d4d2cc',
      accent: '#2563eb',
      accentForeground: '#ffffff',
      gradientStart: '#2563eb',
      gradientEnd: '#60a5fa',
    },
    dark: {
      paper: '#0f172a',
      ink: '#e2e8f0',
      surface: '#1e293b',
      surfaceStrong: '#334155',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      subtle: '#0f172a',
      info: '#60a5fa',
      border: '#334155',
      borderSubtle: '#1e293b',
      borderStrong: '#475569',
      accent: '#60a5fa',
      accentForeground: '#0f172a',
      gradientStart: '#60a5fa',
      gradientEnd: '#93c5fd',
    },
  },
  forest: {
    light: {
      paper: '#f4f9f4',
      ink: '#122b1e',
      surface: '#ffffff',
      surfaceStrong: '#e8f3ea',
      muted: '#e8f3ea',
      mutedForeground: '#4a6b55',
      subtle: '#f4f9f4',
      info: '#047857',
      border: '#cfe3d4',
      borderSubtle: '#e5f0e8',
      borderStrong: '#9fc6a8',
      accent: '#047857',
      accentForeground: '#ffffff',
      gradientStart: '#047857',
      gradientEnd: '#34d399',
    },
    dark: {
      paper: '#0b1f14',
      ink: '#e6f4ea',
      surface: '#142e1f',
      surfaceStrong: '#1e4530',
      muted: '#1e4530',
      mutedForeground: '#8ab89a',
      subtle: '#0b1f14',
      info: '#34d399',
      border: '#27533b',
      borderSubtle: '#142e1f',
      borderStrong: '#3a6b4d',
      accent: '#34d399',
      accentForeground: '#0b1f14',
      gradientStart: '#34d399',
      gradientEnd: '#86efac',
    },
  },
  warm: {
    light: {
      paper: '#faf6f0',
      ink: '#2a1f16',
      surface: '#ffffff',
      surfaceStrong: '#f5efe6',
      muted: '#f5efe6',
      mutedForeground: '#7c6550',
      subtle: '#faf6f0',
      info: '#c2410c',
      border: '#e8ddd0',
      borderSubtle: '#f2ebe1',
      borderStrong: '#d4c4b0',
      accent: '#c2410c',
      accentForeground: '#ffffff',
      gradientStart: '#c2410c',
      gradientEnd: '#fb923c',
    },
    dark: {
      paper: '#1f1812',
      ink: '#f5e9db',
      surface: '#332922',
      surfaceStrong: '#4a3b2f',
      muted: '#4a3b2f',
      mutedForeground: '#c4a98e',
      subtle: '#1f1812',
      info: '#fb923c',
      border: '#5c4a3d',
      borderSubtle: '#332922',
      borderStrong: '#7a6652',
      accent: '#fb923c',
      accentForeground: '#1f1812',
      gradientStart: '#fb923c',
      gradientEnd: '#fdba74',
    },
  },
  royal: {
    light: {
      paper: '#f6f4fa',
      ink: '#221a33',
      surface: '#ffffff',
      surfaceStrong: '#ede9f5',
      muted: '#ede9f5',
      mutedForeground: '#665a80',
      subtle: '#f6f4fa',
      info: '#7c3aed',
      border: '#ddd6eb',
      borderSubtle: '#eeeaf5',
      borderStrong: '#b8aed0',
      accent: '#7c3aed',
      accentForeground: '#ffffff',
      gradientStart: '#7c3aed',
      gradientEnd: '#a78bfa',
    },
    dark: {
      paper: '#17122b',
      ink: '#eae4f7',
      surface: '#251d40',
      surfaceStrong: '#352b5a',
      muted: '#352b5a',
      mutedForeground: '#a99bc9',
      subtle: '#17122b',
      info: '#a78bfa',
      border: '#453a6b',
      borderSubtle: '#251d40',
      borderStrong: '#63548a',
      accent: '#a78bfa',
      accentForeground: '#17122b',
      gradientStart: '#a78bfa',
      gradientEnd: '#c4b5fd',
    },
  },
}

const availableThemes = [
  { key: 'default', name: tStatic('sidebar.themeDefault'), nameKey: 'sidebar.themeDefault', icon: '◉' },
  { key: 'forest', name: tStatic('sidebar.themeForest'), nameKey: 'sidebar.themeForest', icon: '◈' },
  { key: 'warm', name: tStatic('sidebar.themeWarm'), nameKey: 'sidebar.themeWarm', icon: '◎' },
  { key: 'royal', name: tStatic('sidebar.themeRoyal'), nameKey: 'sidebar.themeRoyal', icon: '◇' },
]

const THEME_CSS_MAP: Record<string, Record<string, string>> = {
  default: {
    '--color-accent-blue': '#3b82f6',
    '--color-accent-teal': '#0d9488',
    '--color-accent-rose': '#dc2626',
    '--color-accent-amber': '#d97706',
    '--color-accent-violet': '#7c3aed',
    '--color-accent-emerald': '#059669',
    '--color-accent-cyan': '#0891b2',
    '--color-card-group-linear': '#3b82f6',
    '--color-card-group-tree': '#d97706',
    '--color-card-group-graph': '#7c3aed',
    '--shadow-card-hover': '6px 6px 0px #3b82f6',
    '--shadow-card-dark-hover': '6px 6px 0px #60a5fa',
  },
  forest: {
    '--color-accent-blue': '#047857',
    '--color-accent-teal': '#0f766e',
    '--color-accent-rose': '#dc2626',
    '--color-accent-amber': '#b45309',
    '--color-accent-violet': '#6d28d9',
    '--color-accent-emerald': '#10b981',
    '--color-accent-cyan': '#0e7490',
    '--color-card-group-linear': '#047857',
    '--color-card-group-tree': '#b45309',
    '--color-card-group-graph': '#0891b2',
    '--shadow-card-hover': '6px 6px 0px #047857',
    '--shadow-card-dark-hover': '6px 6px 0px #34d399',
  },
  warm: {
    '--color-accent-blue': '#c2410c',
    '--color-accent-teal': '#0d9488',
    '--color-accent-rose': '#dc2626',
    '--color-accent-amber': '#f59e0b',
    '--color-accent-violet': '#7c3aed',
    '--color-accent-emerald': '#059669',
    '--color-accent-cyan': '#0891b2',
    '--color-card-group-linear': '#c2410c',
    '--color-card-group-tree': '#f59e0b',
    '--color-card-group-graph': '#7c3aed',
    '--shadow-card-hover': '6px 6px 0px #c2410c',
    '--shadow-card-dark-hover': '6px 6px 0px #fb923c',
  },
  royal: {
    '--color-accent-blue': '#7c3aed',
    '--color-accent-teal': '#0d9488',
    '--color-accent-rose': '#dc2626',
    '--color-accent-amber': '#d97706',
    '--color-accent-violet': '#8b5cf6',
    '--color-accent-emerald': '#059669',
    '--color-accent-cyan': '#0891b2',
    '--color-card-group-linear': '#7c3aed',
    '--color-card-group-tree': '#d97706',
    '--color-card-group-graph': '#059669',
    '--shadow-card-hover': '6px 6px 0px #7c3aed',
    '--shadow-card-dark-hover': '6px 6px 0px #a78bfa',
  },
}

const SURFACE_TOKEN_KEYS: Array<{ lightProp: string; darkProp: string; token: keyof ThemeSurfaceTokens }> = [
  { lightProp: '--color-paper', darkProp: '--color-dark-paper', token: 'paper' },
  { lightProp: '--color-ink', darkProp: '--color-dark-ink', token: 'ink' },
  { lightProp: '--color-surface', darkProp: '--color-dark-surface', token: 'surface' },
  { lightProp: '--color-surface-strong', darkProp: '--color-dark-surface-strong', token: 'surfaceStrong' },
  { lightProp: '--color-muted', darkProp: '--color-dark-muted', token: 'muted' },
  { lightProp: '--color-muted-foreground', darkProp: '--color-dark-muted-foreground', token: 'mutedForeground' },
  { lightProp: '--color-subtle', darkProp: '--color-dark-subtle', token: 'subtle' },
  { lightProp: '--color-info', darkProp: '--color-dark-info', token: 'info' },
  { lightProp: '--color-border', darkProp: '--color-dark-border', token: 'border' },
  { lightProp: '--color-border-subtle', darkProp: '--color-dark-border-subtle', token: 'borderSubtle' },
  { lightProp: '--color-border-strong', darkProp: '--color-dark-border-strong', token: 'borderStrong' },
  { lightProp: '--color-accent', darkProp: '--color-dark-accent', token: 'accent' },
  { lightProp: '--color-accent-foreground', darkProp: '--color-dark-accent-foreground', token: 'accentForeground' },
  { lightProp: '--color-gradient-start', darkProp: '--color-dark-gradient-start', token: 'gradientStart' },
  { lightProp: '--color-gradient-end', darkProp: '--color-dark-gradient-end', token: 'gradientEnd' },
]

function applyThemeToCSS(theme: string) {
  const vars = THEME_CSS_MAP[theme] || THEME_CSS_MAP.default
  const root = document.documentElement
  for (const [prop, val] of Object.entries(vars)) {
    root.style.setProperty(prop, val)
  }

  const surface = getThemeSurfaceTokens(theme, false)
  const surfaceDark = getThemeSurfaceTokens(theme, true)
  for (const { lightProp, darkProp, token } of SURFACE_TOKEN_KEYS) {
    root.style.setProperty(lightProp, surface[token])
    root.style.setProperty(darkProp, surfaceDark[token])
  }
}

let currentTheme = 'default'
let themeListeners: Array<() => void> = []

export function getColors(isDark = false): ThemeColors {
  const palette = palettes[currentTheme] || palettes.default
  return isDark ? palette.dark : palette.light
}

export function getThemeSurfaceTokens(themeName: string, isDark = false): ThemeSurfaceTokens {
  const palette = surfacePalettes[themeName] || surfacePalettes.default
  return isDark ? palette.dark : palette.light
}

export function getTheme(): string {
  return currentTheme
}

export function setTheme(theme: string) {
  if (!palettes[theme]) return
  currentTheme = theme
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
  applyThemeToCSS(theme)
  for (const listener of themeListeners) listener()
}

export function initThemeColors() {
  const stored = (() => {
    try { return localStorage.getItem(STORAGE_KEY) } catch { return null }
  })()
  const theme = stored && palettes[stored] ? stored : 'default'
  currentTheme = theme
  applyThemeToCSS(theme)
}

export function subscribeTheme(listener: () => void): () => void {
  themeListeners.push(listener)
  return () => { themeListeners = themeListeners.filter(l => l !== listener) }
}

export function getAvailableThemes() {
  return availableThemes
}

let _darkModeCache: { value: boolean; time: number } | null = null
const DARK_MODE_CACHE_MS = 1000

export function detectDarkMode(): boolean {
  const now = Date.now()
  if (_darkModeCache && now - _darkModeCache.time < DARK_MODE_CACHE_MS) {
    return _darkModeCache.value
  }
  const value = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  _darkModeCache = { value, time: now }
  return value
}

/** @deprecated Use initThemeColors() instead — it also applies CSS variables */
export function initTheme() {
  initThemeColors()
}

export function gradUrl(id: string): string {
  return `url(#grad-${id})`
}

export function ensureGradientDefs(svg: SVGSVGElement, isDark = false) {
  let defs = svg.querySelector('defs')
  if (!defs) {
    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    svg.prepend(defs)
  }

  const colors = getColors(isDark)

  const gradients = [
    { id: 'grad-node-default', stops: [colors.nodeDefault, colors.nodeDefault] },
    { id: 'grad-node-root', stops: [colors.nodeRoot, colors.nodeRoot] },
    { id: 'grad-node-leaf', stops: [colors.nodeLeaf, colors.nodeLeaf] },
    { id: 'grad-node-active', stops: [colors.nodeActive, colors.nodeActive] },
    { id: 'grad-node-error', stops: [colors.nodeError, colors.nodeError] },
    { id: 'grad-bar-default', stops: [colors.nodeDefault, colors.nodeDefault] },
    { id: 'grad-bar-active', stops: [colors.nodeActive, colors.nodeActive] },
    { id: 'grad-bar-compare', stops: [colors.nodeActive, colors.nodeActive] },
    { id: 'grad-bar-swap', stops: [colors.nodeVisited, colors.nodeVisited] },
    { id: 'grad-bar-sorted', stops: [colors.nodeLeaf, colors.nodeLeaf] },
  ]

  gradients.forEach(({ id, stops }) => {
    let grad = defs!.querySelector(`#${id}`)
    if (!grad) {
      grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
      grad.setAttribute('id', id)
      stops.forEach((color, i) => {
        const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
        stop.setAttribute('offset', `${(i / (stops.length - 1)) * 100}%`)
        stop.setAttribute('stop-color', color)
        grad!.appendChild(stop)
      })
      defs!.appendChild(grad)
    } else {
      const stopEls = grad.querySelectorAll('stop')
      stops.forEach((color, i) => {
        if (stopEls[i]) stopEls[i].setAttribute('stop-color', color)
      })
    }
  })
}
