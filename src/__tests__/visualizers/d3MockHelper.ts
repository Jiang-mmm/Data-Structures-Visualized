import { vi } from 'vitest'

// Creates a chainable D3 selection mock where every method is a vi.fn
// that records its arguments and returns the mock itself.
export function createD3SelectionMock() {
  const calls: Array<{ method: string | symbol; args: unknown[] }> = []

  const chainable: Record<string | symbol, unknown> = {}

  const getMethod = (prop: string | symbol) => {
    if (!(prop in chainable)) {
      chainable[prop] = vi.fn((...args: unknown[]) => {
        calls.push({ method: prop, args })
        return chainableProxy
      })
    }
    return chainable[prop]
  }

  const chainableProxy = new Proxy(chainable, {
    get(_target, prop: string | symbol) {
      if (prop === 'empty') return () => true
      if (prop === 'nodes') return (): unknown[] => []
      if (prop === 'node') return (): null => null
      if (prop === 'size') return () => 0
      if (prop === 'text') return getMethod('text')
      if (prop === 'attr') return getMethod('attr')
      if (prop === 'style') return getMethod('style')
      if (prop === 'on') return getMethod('on')
      if (prop === 'interrupt') return getMethod('interrupt')
      if (prop === Symbol.iterator) return undefined
      if (prop === '__calls') return calls

      return getMethod(prop)
    },
  })

  return chainableProxy
}

// Creates the vi.mock for d3Imports.
// All factory functions return chainable mocks so callers can assert on
// `select.mock.calls`, `forceSimulation.mock.calls`, etc.
export function mockD3Imports() {
  const chainable = createD3SelectionMock()

  // forceSimulation returns a self-referential object so that chained
  // `.force().force().on()` calls keep returning the same simulation.
  const simulation = {
    force: vi.fn(() => simulation),
    on: vi.fn(() => simulation),
    stop: vi.fn(() => simulation),
    alpha: vi.fn(() => ({ restart: vi.fn() })),
  }

  const forceLink = {
    id: vi.fn(() => forceLink),
    distance: vi.fn(() => forceLink),
  }

  const forceManyBody = {
    strength: vi.fn(() => forceManyBody),
  }

  const forceCenter = {
    x: vi.fn(() => forceCenter),
    y: vi.fn(() => forceCenter),
  }

  const forceCollide = {
    radius: vi.fn(() => forceCollide),
  }

  return {
    select: vi.fn(() => chainable),
    d3Drag: vi.fn(() => ({
      on: vi.fn(() => ({ on: vi.fn(() => ({ on: vi.fn() })) })),
    })),
    forceSimulation: vi.fn(() => simulation),
    forceLink: vi.fn(() => forceLink),
    forceManyBody: vi.fn(() => forceManyBody),
    forceCenter: vi.fn(() => forceCenter),
    forceCollide: vi.fn(() => forceCollide),
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
