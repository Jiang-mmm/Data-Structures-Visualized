import { vi } from 'vitest'

// Creates a chainable D3 selection mock where every method returns the mock itself
export function createD3SelectionMock() {
  const mock: Record<string | symbol, unknown> = {}

  const chainable = new Proxy(mock, {
    get(target, prop: string | symbol) {
      if (prop === 'empty') return () => true
      if (prop === 'nodes') return (): unknown[] => []
      if (prop === 'node') return (): null => null
      if (prop === 'size') return () => 0
      if (prop === 'text') return () => chainable
      if (prop === 'attr') return () => chainable
      if (prop === 'style') return () => chainable
      if (prop === 'on') return chainable
      if (prop === 'interrupt') return () => chainable
      if (prop === Symbol.iterator) return undefined

      // All other methods return the chainable mock
      if (!(prop in target)) {
        target[prop] = vi.fn(() => chainable)
      }
      return target[prop]
    },
  })

  return chainable
}

// Creates the vi.mock for d3Imports
export function mockD3Imports() {
  const chainable = createD3SelectionMock()

  return {
    select: vi.fn(() => chainable),
    d3Drag: vi.fn(() => ({
      on: vi.fn(() => ({ on: vi.fn(() => ({ on: vi.fn() })) })),
    })),
    forceSimulation: vi.fn(() => ({
      force: vi.fn(() => ({ force: vi.fn(() => ({ force: vi.fn(() => ({})) })) })),
      on: vi.fn(),
      stop: vi.fn(),
      alpha: vi.fn(() => ({ restart: vi.fn() })),
    })),
    forceLink: vi.fn(() => ({
      id: vi.fn(() => ({})),
      distance: vi.fn(() => ({})),
    })),
    forceManyBody: vi.fn(() => ({ strength: vi.fn(() => ({})) })),
    forceCenter: vi.fn(() => ({ x: vi.fn(() => ({})), y: vi.fn(() => ({})) })),
    forceCollide: vi.fn(() => ({ radius: vi.fn(() => ({})) })),
  }
}

export function mockThemeColors() {
  return {
    getColors: () => ({
      nodeDefault: '#2563eb', nodeDefaultStroke: '#1e40af', nodeActive: '#f59e0b',
      nodeActiveStroke: '#d97706', nodeRoot: '#10b981', nodeRootStroke: '#059669',
      nodeLeaf: '#8b5cf6', nodeLeafStroke: '#7c3aed', nodeVisited: '#8b5cf6',
      nodeVisitedStroke: '#7c3aed', nodeError: '#ef4444', nodeErrorStroke: '#dc2626',
      textWhite: '#ffffff', textLight: '#6b7280', textSecondary: '#6b7280',
      containerStroke: '#d1d5db', edgeDefault: '#9ca3af', edgeActive: '#f59e0b',
    }),
    detectDarkMode: () => false,
    ensureGradientDefs: vi.fn(),
    gradUrl: (name: string) => `url(#grad-${name})`,
  }
}

export function mockAnimationEngine() {
  return {
    duration: (ms: number) => ms,
    EASING: {
      easeOutCubic: 'easeOutCubic', easeInCubic: 'easeInCubic',
      easeOutBack: 'easeOutBack', easeOutElastic: 'easeOutElastic',
    },
    transitionEnd: vi.fn(() => Promise.resolve()),
  }
}

export function mockI18n() {
  return { tStatic: (key: string) => key }
}
