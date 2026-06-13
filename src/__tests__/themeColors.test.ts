import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getColors, getTheme, setTheme, getAvailableThemes, initTheme, gradUrl, ensureGradientDefs } from '../utils/themeColors'

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
  })),
})

describe('themeColors', () => {
  beforeEach(() => {
    setTheme('default')
    localStorage.clear()
  })

  describe('getColors', () => {
    it('should return an object with expected color keys', () => {
      const colors = getColors(false)
      expect(colors).toHaveProperty('nodeDefault')
      expect(colors).toHaveProperty('nodeRoot')
      expect(colors).toHaveProperty('nodeLeaf')
      expect(colors).toHaveProperty('nodeActive')
      expect(colors).toHaveProperty('nodeVisited')
      expect(colors).toHaveProperty('nodeError')
      expect(colors).toHaveProperty('textPrimary')
      expect(colors).toHaveProperty('textSecondary')
      expect(colors).toHaveProperty('edgeDefault')
      expect(colors).toHaveProperty('edgeActive')
    })

    it('should return light theme colors when isDark is false', () => {
      const colors = getColors(false)
      expect(colors.nodeDefault).toBe('#3b82f6')
      expect(colors.textPrimary).toBe('#1f2937')
    })

    it('should return dark theme colors when isDark is true', () => {
      const colors = getColors(true)
      expect(colors.nodeDefault).toBe('#60a5fa')
      expect(colors.textPrimary).toBe('#f1f5f9')
    })

    it('should return different nodeDefault colors for light and dark', () => {
      const lightColors = getColors(false)
      const darkColors = getColors(true)
      expect(lightColors.nodeDefault).not.toBe(darkColors.nodeDefault)
    })
  })

  describe('getTheme', () => {
    it('should return the current theme key', () => {
      expect(getTheme()).toBe('default')
    })
  })

  describe('setTheme', () => {
    it('should change the theme', () => {
      setTheme('forest')
      expect(getTheme()).toBe('forest')
    })

    it('should persist theme to localStorage', () => {
      setTheme('warm')
      expect(localStorage.getItem('ds-visualizer-color-theme')).toBe('warm')
    })

    it('should ignore invalid theme names', () => {
      setTheme('nonexistent')
      expect(getTheme()).toBe('default')
    })
  })

  describe('getAvailableThemes', () => {
    it('should return an array of theme objects', () => {
      const themes = getAvailableThemes()
      expect(Array.isArray(themes)).toBe(true)
      expect(themes.length).toBeGreaterThan(0)
    })

    it('should have name and icon properties on each theme', () => {
      const themes = getAvailableThemes()
      themes.forEach(theme => {
        expect(theme).toHaveProperty('key')
        expect(theme).toHaveProperty('name')
        expect(theme).toHaveProperty('icon')
        expect(typeof theme.name).toBe('string')
        expect(typeof theme.icon).toBe('string')
      })
    })
  })

  describe('initTheme', () => {
    it('should initialize without errors', () => {
      expect(() => initTheme()).not.toThrow()
    })

    it('should restore theme from localStorage', () => {
      localStorage.setItem('ds-visualizer-color-theme', 'royal')
      initTheme()
      expect(getTheme()).toBe('royal')
    })

    it('should keep default theme if localStorage has invalid value', () => {
      localStorage.setItem('ds-visualizer-color-theme', 'invalid')
      initTheme()
      expect(getTheme()).toBe('default')
    })
  })

  describe('gradUrl', () => {
    it('should return a string starting with url(', () => {
      const result = gradUrl('node-default')
      expect(result).toMatch(/^url\(/)
    })

    it('should contain the gradient id', () => {
      const result = gradUrl('node-default')
      expect(result).toBe('url(#grad-node-default)')
    })
  })

  describe('ensureGradientDefs', () => {
    it('should create SVG gradient elements', () => {
      const ns = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(ns, 'svg')

      ensureGradientDefs(svg, false)

      const defs = svg.querySelector('defs')
      expect(defs).not.toBeNull()

      const gradients = defs!.querySelectorAll('radialGradient, linearGradient')
      expect(gradients.length).toBeGreaterThan(0)
    })

    it('should create gradients with correct ids', () => {
      const ns = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(ns, 'svg')

      ensureGradientDefs(svg, false)

      const nodeDefaultGrad = svg.querySelector('#grad-node-default')
      expect(nodeDefaultGrad).not.toBeNull()
    })

    it('should create stop elements inside gradients', () => {
      const ns = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(ns, 'svg')

      ensureGradientDefs(svg, true)

      const nodeDefaultGrad = svg.querySelector('#grad-node-default')
      const stops = nodeDefaultGrad!.querySelectorAll('stop')
      expect(stops.length).toBeGreaterThan(0)
    })
  })
})
