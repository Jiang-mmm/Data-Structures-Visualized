import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getColors, getTheme, setTheme, getAvailableThemes, initTheme, gradUrl, ensureGradientDefs, getThemeSurfaceTokens } from '../utils/themeColors'
import type { ThemeSurfaceTokens } from '../utils/themeColors'

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

  describe('getThemeSurfaceTokens', () => {
    it('should return surface tokens for all available themes', () => {
      const themes = getAvailableThemes()
      themes.forEach(theme => {
        const light = getThemeSurfaceTokens(theme.key, false)
        const dark = getThemeSurfaceTokens(theme.key, true)
        expect(light).toBeDefined()
        expect(dark).toBeDefined()

        const expectedKeys: Array<keyof ThemeSurfaceTokens> = [
          'paper', 'ink', 'surface', 'surfaceStrong', 'muted',
          'mutedForeground', 'subtle', 'info', 'border', 'borderSubtle', 'borderStrong',
          'accent', 'accentForeground', 'gradientStart', 'gradientEnd',
        ]
        expectedKeys.forEach(key => {
          expect(light[key]).toMatch(/^#[0-9a-fA-F]{6}$/)
          expect(dark[key]).toMatch(/^#[0-9a-fA-F]{6}$/)
        })
      })
    })

    it('should fall back to default theme for unknown theme names', () => {
      const fallback = getThemeSurfaceTokens('unknown-theme', false)
      expect(fallback.paper).toBe('#faf8f5')
    })
  })

  describe('surface token contrast (WCAG 2 AA)', () => {
    function hexToRgb(hex: string): { r: number; g: number; b: number } {
      const clean = hex.replace('#', '')
      const bigint = parseInt(clean, 16)
      return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
      }
    }

    function relativeLuminance({ r, g, b }: { r: number; g: number; b: number }): number {
      const channel = (c: number) => {
        const s = c / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
      }
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
    }

    function contrastRatio(a: string, b: string): number {
      const l1 = relativeLuminance(hexToRgb(a))
      const l2 = relativeLuminance(hexToRgb(b))
      const lighter = Math.max(l1, l2)
      const darker = Math.min(l1, l2)
      return (lighter + 0.05) / (darker + 0.05)
    }

    const themes = getAvailableThemes()
    const pairs: Array<[keyof ThemeSurfaceTokens, keyof ThemeSurfaceTokens]> = [
      ['ink', 'paper'],
      ['ink', 'surface'],
      ['ink', 'surfaceStrong'],
      ['mutedForeground', 'paper'],
      ['mutedForeground', 'surface'],
      ['accentForeground', 'accent'],
    ]

    themes.forEach(theme => {
      it(`should meet normal-text contrast for ${theme.key} light`, () => {
        const tokens = getThemeSurfaceTokens(theme.key, false)
        pairs.forEach(([fg, bg]) => {
          const ratio = contrastRatio(tokens[fg], tokens[bg])
          expect(ratio).toBeGreaterThanOrEqual(4.5)
        })
      })

      it(`should meet normal-text contrast for ${theme.key} dark`, () => {
        const tokens = getThemeSurfaceTokens(theme.key, true)
        pairs.forEach(([fg, bg]) => {
          const ratio = contrastRatio(tokens[fg], tokens[bg])
          expect(ratio).toBeGreaterThanOrEqual(4.5)
        })
      })
    })
  })

  describe('theme CSS variable application', () => {
    function getCssVar(name: string): string {
      return document.documentElement.style.getPropertyValue(name)
    }

    beforeEach(() => {
      document.documentElement.style.cssText = ''
    })

    it('should set light surface CSS variables when setTheme is called', () => {
      setTheme('forest')
      expect(getCssVar('--color-paper')).toBe('#f4f9f4')
      expect(getCssVar('--color-ink')).toBe('#122b1e')
      expect(getCssVar('--color-accent')).toBe('#047857')
      expect(getCssVar('--color-subtle')).toBe('#f4f9f4')
      expect(getCssVar('--color-info')).toBe('#047857')
    })

    it('should set dark surface CSS variables when setTheme is called', () => {
      setTheme('warm')
      expect(getCssVar('--color-dark-paper')).toBe('#1f1812')
      expect(getCssVar('--color-dark-ink')).toBe('#f5e9db')
      expect(getCssVar('--color-dark-accent')).toBe('#fb923c')
      expect(getCssVar('--color-dark-subtle')).toBe('#1f1812')
      expect(getCssVar('--color-dark-info')).toBe('#fb923c')
    })

    it('should update CSS variables when switching between themes', () => {
      setTheme('royal')
      expect(getCssVar('--color-paper')).toBe('#f6f4fa')
      expect(getCssVar('--color-dark-accent')).toBe('#a78bfa')

      setTheme('default')
      expect(getCssVar('--color-paper')).toBe('#faf8f5')
      expect(getCssVar('--color-dark-paper')).toBe('#0f172a')
    })

    it('should keep default CSS variables for invalid theme names', () => {
      setTheme('default')
      const paperBefore = getCssVar('--color-paper')
      setTheme('invalid-theme')
      expect(getCssVar('--color-paper')).toBe(paperBefore)
    })
  })
})
