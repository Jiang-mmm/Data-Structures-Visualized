import '@testing-library/jest-dom/vitest'
import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  localStorage.clear()
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock requestAnimationFrame for d3 transitions
globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16)
globalThis.cancelAnimationFrame = (id: number) => clearTimeout(id)

// Mock SVG transform for d3
const originalGetAttribute = SVGElement.prototype.getAttribute
SVGElement.prototype.getAttribute = function (name: string): string | null {
  if (name === 'transform') {
    const val = originalGetAttribute.call(this, name)
    return val || ''
  }
  return originalGetAttribute.call(this, name)
}

Object.defineProperty(SVGElement.prototype, 'transform', {
  configurable: true,
  value: {
    baseVal: {
      numberOfItems: 0,
      consolidate: () => ({
        matrix: {
          a: 1, b: 0, c: 0, d: 1, e: 0, f: 0,
        },
      }),
      getItem: () => ({
        type: 0,
        matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      }),
    },
  },
})
