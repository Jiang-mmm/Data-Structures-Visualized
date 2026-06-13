import { vi } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactElement } from 'react'

export function renderWithRouter(ui: ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  )
}

export function mockUseGlobalSettings(lang = 'zh') {
  return {
    t: (key: string) => key,
    lang,
    animationSpeed: 1,
    setAnimationSpeed: vi.fn(),
    showIndices: true,
    setShowIndices: vi.fn(),
    cycleSpeed: 1,
    currentPreset: 'default',
    applyPreset: vi.fn(),
    setLanguage: vi.fn(),
  } as any
}

export function mockUseVisualizer() {
  return {
    containerRef: { current: null as SVGSVGElement | null },
    svgRef: { current: null as SVGSVGElement | null },
    dimensions: { width: 800, height: 400 },
    getAnimationContext: vi.fn().mockReturnValue({
      svgRef: { current: null },
      dimensions: { width: 800, height: 400 },
      duration: vi.fn().mockReturnValue(300),
      isAborted: vi.fn().mockReturnValue(false),
      abort: vi.fn(),
    }),
    abortAnimation: vi.fn(),
  } as any
}

export function createMockHistory(initialData: unknown[] = []) {
  return {
    data: initialData,
    logs: [] as any[],
    isAnimating: false,
    setIsAnimating: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn().mockReturnValue(false),
    canRedo: vi.fn().mockReturnValue(false),
    reset: vi.fn(),
    loadData: vi.fn(),
    getUndoPreview: vi.fn().mockReturnValue(null),
    getRedoPreview: vi.fn().mockReturnValue(null),
  }
}

// ResizeObserver mock
const g = globalThis as Record<string, unknown>
if (typeof g.ResizeObserver === 'undefined') {
  g.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
}
