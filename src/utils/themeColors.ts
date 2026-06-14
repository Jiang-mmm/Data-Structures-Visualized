/**
 * 共享主题感知工具
 * 颜色系统 + 渐变定义 + 暗色模式检测 + 多主题
 */

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
      textSecondary: '#6b7280',
      textWhite: '#ffffff',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
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
      textMuted: '#94a3b8',
      textLight: '#64748b',
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
      textSecondary: '#6b7280',
      textWhite: '#ffffff',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
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
      nodeDefault: '#34d399',
      nodeRoot: '#fbbf24',
      nodeLeaf: '#6ee7b7',
      nodeActive: '#f87171',
      nodeVisited: '#a78bfa',
      nodeError: '#ef4444',
      textPrimary: '#f1f5f9',
      textSecondary: '#94a3b8',
      textWhite: '#ffffff',
      textMuted: '#94a3b8',
      textLight: '#64748b',
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
      textSecondary: '#6b7280',
      textWhite: '#ffffff',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
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
      textMuted: '#94a3b8',
      textLight: '#64748b',
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
      textSecondary: '#6b7280',
      textWhite: '#ffffff',
      textMuted: '#6b7280',
      textLight: '#9ca3af',
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
      textMuted: '#94a3b8',
      textLight: '#64748b',
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
      entryFill: '#a78bfa',
      entryValue: '#94a3b8',
    },
  },
}

const availableThemes = [
  { key: 'default', name: '默认', nameKey: 'sidebar.themeDefault', icon: '◉' },
  { key: 'forest', name: '森林', nameKey: 'sidebar.themeForest', icon: '◈' },
  { key: 'warm', name: '暖色', nameKey: 'sidebar.themeWarm', icon: '◎' },
  { key: 'royal', name: '皇家', nameKey: 'sidebar.themeRoyal', icon: '◇' },
]

let currentTheme = 'default'

export function getColors(isDark = false): ThemeColors {
  const palette = palettes[currentTheme] || palettes.default
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

export function initTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && palettes[saved]) {
      currentTheme = saved
    }
  } catch {}
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
