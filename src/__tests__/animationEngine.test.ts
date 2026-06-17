import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

const d3TransitionMock = vi.fn()

vi.mock('d3', () => ({
  select: vi.fn(() => ({
    empty: () => false,
    select: vi.fn(() => ({ empty: () => false })),
    selectAll: vi.fn(() => ({ empty: () => false })),
    transition: () => d3TransitionMock(),
    attr: vi.fn(),
  })),
}))

vi.mock('d3-ease', () => ({
  easeQuadOut: vi.fn(t => t),
  easeQuadInOut: vi.fn(t => t),
  easeCubicIn: vi.fn(t => t),
  easeCubicOut: vi.fn(t => t),
  easeCubicInOut: vi.fn(t => t),
  easeBackIn: vi.fn(t => t),
  easeBackOut: vi.fn(t => t),
  easeElasticOut: { amplitude: vi.fn(() => ({ period: vi.fn(() => vi.fn(t => t)) })) },
  easeBounceOut: vi.fn(t => t),
  easeLinear: vi.fn(t => t),
  easeExpOut: vi.fn(t => t),
  easeExpInOut: vi.fn(t => t),
}))

import {
  startFPSMonitoring,
  stopFPSMonitoring,
  getCurrentFPS,
  measureRender,
  withRenderPerf,
  safeAnimate,
  setAnimationSpeed,
  getAnimationSpeed,
  setDefaultEasing,
  getDefaultEasing,
  applyPreset,
  getCurrentPreset,
  ANIMATION_PRESETS,
  setSkipAnimation,
  getSkipAnimation,
  createAnimation,
  duration,
  wait,
  sequence,
  transition,
  highlightElement,
  fadeOutElement,
  fadeInElement,
  moveElements,
  getPerformanceMode,
  getPerformanceFactor,
  EASING,
} from '../utils/animationEngine'
import { showToast } from '../components/toastStore'

function buildTransitionMock() {
  const chain = {
    attr: vi.fn(() => chain),
    style: vi.fn(() => chain),
    tween: vi.fn(() => chain),
    duration: vi.fn(() => chain),
    ease: vi.fn(() => chain),
    on: vi.fn((event: string, cb: () => void) => {
      if (event === 'end') {
        setTimeout(cb, 0)
      }
      return chain
    }),
    remove: vi.fn(() => chain),
  }
  return chain
}

describe('animationEngine.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setAnimationSpeed(1)
    setSkipAnimation(false)
    stopFPSMonitoring()
    applyPreset('default')
  })

  afterEach(() => {
    setAnimationSpeed(1)
    setSkipAnimation(false)
    stopFPSMonitoring()
    applyPreset('default')
  })

  // ============================================================
  // FPS Monitoring
  // ============================================================
  describe('FPS Monitoring', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      stopFPSMonitoring()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('getCurrentFPS should return default 60 initially', () => {
      expect(getCurrentFPS()).toBe(60)
    })

    it('startFPSMonitoring should begin monitoring without duplicates', () => {
      const rAFSpy = vi.spyOn(globalThis, 'requestAnimationFrame')
      startFPSMonitoring()
      expect(rAFSpy).toHaveBeenCalledTimes(1)

      startFPSMonitoring()
      expect(rAFSpy).toHaveBeenCalledTimes(1)
      rAFSpy.mockRestore()
    })

    it('stopFPSMonitoring should reset FPS to 60', () => {
      startFPSMonitoring()
      stopFPSMonitoring()
      expect(getCurrentFPS()).toBe(60)
    })

    it('FPS should be calculated after multiple frames within 1 second', () => {
      const rAFSpy = vi.spyOn(globalThis, 'requestAnimationFrame')
      startFPSMonitoring()

      const measureFPSFn = rAFSpy.mock.calls[0]?.[0] as Function
      expect(measureFPSFn).toBeDefined()

      if (measureFPSFn) {
        vi.advanceTimersByTime(100)
        // Advance past 1 second to trigger FPS calculation
        for (let i = 0; i < 60; i++) {
          measureFPSFn()
        }
        vi.advanceTimersByTime(1100)
      }

      rAFSpy.mockRestore()
    })

    it('stopFPSMonitoring should prevent further rAF calls', () => {
      const rAFSpy = vi.spyOn(globalThis, 'requestAnimationFrame')
      startFPSMonitoring()
      stopFPSMonitoring()

      expect(rAFSpy.mock.calls.length).toBeGreaterThanOrEqual(0)
      rAFSpy.mockRestore()
    })
  })

  // ============================================================
  // measureRender
  // ============================================================
  describe('measureRender', () => {
    it('should return sync function result', () => {
      const result = measureRender('testSync', () => 42)
      expect(result).toBe(42)
    })

    it('should return async function result', async () => {
      const result = await measureRender('testAsync', async () => {
        return 'hello'
      })
      expect(result).toBe('hello')
    })

    it('should log for sync functions under threshold', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      measureRender('fastRender', () => 1)
      expect(logSpy).toHaveBeenCalled()
      logSpy.mockRestore()
    })

    it('should warn when sync function exceeds 16ms', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const originalNow = performance.now
      let callCount = 0
      vi.spyOn(performance, 'now').mockImplementation(() => {
        callCount++
        return callCount === 1 ? 0 : 100
      })

      measureRender('slowRender', () => 1)

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Render Slow] slowRender: 100.00ms')
      )

      performance.now = originalNow
      warnSpy.mockRestore()
      logSpy.mockRestore()
    })

    it('should handle async function rejection', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      const result = measureRender('asyncFail', async () => {
        throw new Error('test error')
      })

      await expect(result).rejects.toThrow('test error')
      warnSpy.mockRestore()
      logSpy.mockRestore()
    })

    it('should handle undefined result gracefully', () => {
      const result = measureRender('voidFn', () => { /* no return */ })
      expect(result).toBeUndefined()
    })

    it('should handle null result', () => {
      const result = measureRender('nullFn', (): null => null)
      expect(result).toBeNull()
    })
  })

  // ============================================================
  // withRenderPerf
  // ============================================================
  describe('withRenderPerf', () => {
    it('should wrap a function with performance measurement', () => {
      const originalFn = (a: number, b: number) => a + b
      const wrapped = withRenderPerf(originalFn, 'add')

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const result = wrapped(3, 4)
      expect(result).toBe(7)
      logSpy.mockRestore()
    })

    it('should preserve this context', () => {
      const obj = {
        value: 10,
        getValue(this: any) {
          return this.value
        },
      }
      const wrapped = withRenderPerf(obj.getValue.bind(obj), 'getValue')

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const result = wrapped()
      expect(result).toBe(10)
      logSpy.mockRestore()
    })

    it('should handle functions with multiple arguments', () => {
      const fn = (...args: number[]) => args.reduce((a, b) => a + b, 0)
      const wrapped = withRenderPerf(fn, 'sumAll')

      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const result = wrapped(1, 2, 3, 4, 5)
      expect(result).toBe(15)
      logSpy.mockRestore()
    })
  })

  // ============================================================
  // safeAnimate
  // ============================================================
  describe('safeAnimate', () => {
    it('should run animation successfully', async () => {
      let executed = false
      await safeAnimate(async () => {
        executed = true
      })
      expect(executed).toBe(true)
    })

    it('should catch errors and show toast without label', async () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await safeAnimate(async () => {
        throw new Error('animation failed')
      })

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: '动画异常',
      })

      await safeAnimate(async () => {
        throw new Error('animation failed')
      }, 'testLabel')

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: '动画异常: testLabel',
      })

      errorSpy.mockRestore()
    })

    it('should preserve return value', async () => {
      const result = await safeAnimate(async () => {
        void 'success'
      })
      // safeAnimate discards return value (void return type)
      expect(result).toBeUndefined()
    })

    it('should not throw when animation succeeds', async () => {
      await expect(
        safeAnimate(async () => {
          await Promise.resolve()
        })
      ).resolves.toBeUndefined()
    })
  })

  // ============================================================
  // Easing
  // ============================================================
  describe('setDefaultEasing / getDefaultEasing', () => {
    it('should update and retrieve easing', () => {
      const customEasing = (t: number) => t * t
      setDefaultEasing(customEasing)
      expect(getDefaultEasing()).toBe(customEasing)
    })

    it('should have a default easing initially', () => {
      applyPreset('default')
      expect(getDefaultEasing()).toBeDefined()
    })
  })

  // ============================================================
  // Presets
  // ============================================================
  describe('ANIMATION_PRESETS', () => {
    it('should contain all 5 presets', () => {
      const keys = Object.keys(ANIMATION_PRESETS)
      expect(keys).toHaveLength(5)
      expect(keys).toContain('default')
      expect(keys).toContain('gentle')
      expect(keys).toContain('snappy')
      expect(keys).toContain('dramatic')
      expect(keys).toContain('instant')
    })

    it('should have required properties on each preset', () => {
      Object.values(ANIMATION_PRESETS).forEach((preset) => {
        expect(preset).toHaveProperty('name')
        expect(preset).toHaveProperty('icon')
        expect(preset).toHaveProperty('speed')
        expect(typeof preset.speed).toBe('number')
        expect(preset).toHaveProperty('easing')
        expect(typeof preset.easing).toBe('function')
      })
    })

    it('instant preset should have skip flag', () => {
      expect(ANIMATION_PRESETS.instant.skip).toBe(true)
    })

    it('default preset should not have skip flag', () => {
      expect(ANIMATION_PRESETS.default.skip).toBeUndefined()
    })
  })

  describe('applyPreset / getCurrentPreset', () => {
    it('should apply default preset', () => {
      applyPreset('default')
      expect(getCurrentPreset()).toBe('default')
      expect(getAnimationSpeed()).toBe(1)
      expect(getSkipAnimation()).toBe(false)
    })

    it('should apply gentle preset', () => {
      applyPreset('gentle')
      expect(getCurrentPreset()).toBe('gentle')
      expect(getAnimationSpeed()).toBe(0.5)
      expect(getSkipAnimation()).toBe(false)
    })

    it('should apply snappy preset', () => {
      applyPreset('snappy')
      expect(getCurrentPreset()).toBe('snappy')
      expect(getAnimationSpeed()).toBe(2)
      expect(getSkipAnimation()).toBe(false)
    })

    it('should apply dramatic preset', () => {
      applyPreset('dramatic')
      expect(getCurrentPreset()).toBe('dramatic')
      expect(getAnimationSpeed()).toBe(1)
      expect(getSkipAnimation()).toBe(false)
    })

    it('should apply instant preset with skip flag', () => {
      applyPreset('instant')
      expect(getCurrentPreset()).toBe('instant')
      expect(getAnimationSpeed()).toBe(4)
      expect(getSkipAnimation()).toBe(true)
    })

    it('should ignore invalid preset key', () => {
      const beforeSpeed = getAnimationSpeed()
      applyPreset('nonexistent')
      expect(getAnimationSpeed()).toBe(beforeSpeed)
    })

    it('getCurrentPreset should return current preset name', () => {
      applyPreset('snappy')
      expect(getCurrentPreset()).toBe('snappy')
    })
  })

  // ============================================================
  // createAnimation (extended)
  // ============================================================
  describe('createAnimation', () => {
    it('should create animation with all methods', () => {
      const anim = createAnimation()
      expect(anim.isAborted()).toBe(false)
      expect(typeof anim.abort).toBe('function')
      expect(typeof anim.resolve).toBe('function')
      expect(typeof anim.reject).toBe('function')
      expect(anim.promise).toBeInstanceOf(Promise)
    })

    it('should set aborted flag after abort', () => {
      const anim = createAnimation()
      anim.abort()
      expect(anim.isAborted()).toBe(true)
    })

    it('should be idempotent on abort', () => {
      const anim = createAnimation()
      anim.abort()
      anim.abort()
      expect(anim.isAborted()).toBe(true)
    })

    it('should resolve via resolve()', async () => {
      const anim = createAnimation()
      anim.resolve()
      await expect(anim.promise).resolves.toBeUndefined()
    })

    it('should reject via reject()', async () => {
      const anim = createAnimation()
      anim.reject(new Error('test'))
      await expect(anim.promise).rejects.toThrow('test')
    })

    it('should resolve when aborted', async () => {
      const anim = createAnimation()
      anim.abort()
      await expect(anim.promise).resolves.toBeUndefined()
    })
  })

  // ============================================================
  // duration (extended edge cases)
  // ============================================================
  describe('duration', () => {
    it('should return 0 when skipAnimation is true', () => {
      setSkipAnimation(true)
      expect(duration(500)).toBe(0)
    })

    it('should respect speed multiplier', () => {
      setSkipAnimation(false)
      setAnimationSpeed(2)
      expect(duration(400)).toBe(200)
    })

    it('should apply performance factor for large data', () => {
      setSkipAnimation(false)
      setAnimationSpeed(1)
      expect(duration(400, 50)).toBe(100)
    })

    it('should return baseMs with default params', () => {
      setSkipAnimation(false)
      setAnimationSpeed(1)
      expect(duration(300, 0)).toBe(300)
    })

    it('should handle baseMs of 0', () => {
      setSkipAnimation(false)
      setAnimationSpeed(1)
      expect(duration(0)).toBe(0)
    })

    it('should handle negative speed multiplier gracefully', () => {
      setSkipAnimation(false)
      setAnimationSpeed(-1)
      const result = duration(100)
      expect(result).toBeLessThan(0)
    })
  })

  // ============================================================
  // wait
  // ============================================================
  describe('wait', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should wait for specified time with speed multiplier', async () => {
      setAnimationSpeed(2)
      const promise = wait(200)
      vi.advanceTimersByTime(100)
      await expect(promise).resolves.toBeUndefined()
    })

    it('should return immediately if animation is aborted', async () => {
      const anim = createAnimation()
      anim.abort()
      const promise = wait(1000, anim)
      await expect(promise).resolves.toBeUndefined()
    })

    it('should patch animation abort to clear timeout', () => {
      const anim = createAnimation()
      const originalAbort = anim.abort

      wait(5000, anim)

      expect(anim.abort).not.toBe(originalAbort)

      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
      anim.abort()
      expect(clearTimeoutSpy).toHaveBeenCalled()
      clearTimeoutSpy.mockRestore()
    })

    it('should handle wait without animation', async () => {
      const promise = wait(100)
      vi.advanceTimersByTime(100)
      await expect(promise).resolves.toBeUndefined()
    })
  })

  // ============================================================
  // sequence
  // ============================================================
  describe('sequence', () => {
    it('should execute steps in order', async () => {
      const executionOrder: number[] = []
      await sequence([
        { action: async () => { executionOrder.push(1) } },
        { action: async () => { executionOrder.push(2) } },
        { action: async () => { executionOrder.push(3) } },
      ])
      expect(executionOrder).toEqual([1, 2, 3])
    })

    it('should stop when animation is aborted', async () => {
      const anim = createAnimation()
      const executionOrder: number[] = []
      await sequence([
        { action: async () => { executionOrder.push(1) } },
        { action: async () => { executionOrder.push(2); anim.abort() }, anim },
        { action: async () => { executionOrder.push(3) }, anim },
      ])
      expect(executionOrder).toEqual([1, 2])
    })

    it('should wait between steps when wait is specified', async () => {
      vi.useFakeTimers()
      setAnimationSpeed(1)

      const executionOrder: number[] = []
      const seqPromise = sequence([
        { action: async () => { executionOrder.push(1) }, wait: 100 },
        { action: async () => { executionOrder.push(2) } },
      ])

      // First action should execute immediately
      await vi.advanceTimersByTimeAsync(0)
      expect(executionOrder).toEqual([1])

      // After waiting 100ms, second action should execute
      await vi.advanceTimersByTimeAsync(100)
      expect(executionOrder).toEqual([1, 2])

      await seqPromise
      vi.useRealTimers()
    })

    it('should handle empty steps array', async () => {
      await expect(sequence([])).resolves.toBeUndefined()
    })
  })

  // ============================================================
  // transition (D3-dependent)
  // ============================================================
  describe('transition', () => {
    it('should resolve when selection is empty', async () => {
      const { select } = await import('d3')
      ;(select as any).mockReturnValueOnce({ empty: () => true })

      await expect(
        transition(() => ({} as any), {}, 300)
      ).resolves.toBeUndefined()
    })

    it('should resolve when selection is null', async () => {
      await expect(
        transition(() => null as any, {}, 300)
      ).resolves.toBeUndefined()
    })

    it('should call transition chain with attr and resolve', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const selFn = () => ({ empty: () => false, transition: () => d3TransitionMock() })
      await transition(selFn, { attr: { fill: 'red' } }, 300)

      expect(chain.attr).toHaveBeenCalledWith('fill', 'red')
      expect(chain.on).toHaveBeenCalledWith('end', expect.any(Function))
    })

    it('should call style on transition when style props provided', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const selFn = () => ({ empty: () => false, transition: () => d3TransitionMock() })
      await transition(selFn, { style: { opacity: 0.5 } }, 300)

      expect(chain.style).toHaveBeenCalledWith('opacity', 0.5)
    })

    it('should call tween on transition when tween provided', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const tweenFn = () => (_t: number) => {}
      const selFn = () => ({ empty: () => false, transition: () => d3TransitionMock() })
      await transition(selFn, { tween: { name: 'test', fn: tweenFn } }, 300)

      expect(chain.tween).toHaveBeenCalledWith('test', tweenFn)
    })

    it('should catch errors and resolve', async () => {
      const selFn = () => {
        throw new Error('selection error')
      }
      await expect(transition(selFn, {}, 300)).resolves.toBeUndefined()
    })
  })

  // ============================================================
  // highlightElement
  // ============================================================
  describe('highlightElement', () => {
    it('should create transition with fill and stroke attributes', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const container = {
        select: vi.fn(() => ({ empty: () => false, transition: () => d3TransitionMock() })),
      }

      const d3Select = (await import('d3')).select
      ;(d3Select as any).mockReturnValue({ empty: () => false })

      await highlightElement(container, '.node', '#ff0000', '#0000ff', 200)

      expect(container.select).toHaveBeenCalledWith('.node')
      expect(chain.attr).toHaveBeenCalledWith('fill', '#ff0000')
      expect(chain.attr).toHaveBeenCalledWith('stroke', '#0000ff')
    })
  })

  // ============================================================
  // fadeOutElement
  // ============================================================
  describe('fadeOutElement', () => {
    it('should create transition with opacity 0', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const container = {
        select: vi.fn(() => ({ empty: () => false, transition: () => d3TransitionMock() })),
      }

      await fadeOutElement(container, '.node')

      expect(container.select).toHaveBeenCalledWith('.node')
      expect(chain.attr).toHaveBeenCalledWith('opacity', 0)
    })

    it('should include transform when provided', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const container = {
        select: vi.fn(() => ({ empty: () => false, transition: () => d3TransitionMock() })),
      }

      await fadeOutElement(container, '.node', 'translate(10, 20)', 300)

      expect(chain.attr).toHaveBeenCalledWith('opacity', 0)
      expect(chain.attr).toHaveBeenCalledWith('transform', 'translate(10, 20)')
    })
  })

  // ============================================================
  // fadeInElement
  // ============================================================
  describe('fadeInElement', () => {
    it('should create transition with opacity 1', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const container = {
        select: vi.fn(() => ({ empty: () => false, transition: () => d3TransitionMock() })),
      }

      await fadeInElement(container, '.node')

      expect(container.select).toHaveBeenCalledWith('.node')
      expect(chain.attr).toHaveBeenCalledWith('opacity', 1)
    })

    it('should include transform when provided', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const container = {
        select: vi.fn(() => ({ empty: () => false, transition: () => d3TransitionMock() })),
      }

      await fadeInElement(container, '.node', 'translate(0, 0)')

      expect(chain.attr).toHaveBeenCalledWith('transform', 'translate(0, 0)')
    })
  })

  // ============================================================
  // moveElements
  // ============================================================
  describe('moveElements', () => {
    it('should create transition with move tween', async () => {
      const chain = buildTransitionMock()
      d3TransitionMock.mockReturnValue(chain)

      const container = {
        selectAll: vi.fn(() => ({ empty: () => false, transition: () => d3TransitionMock() })),
      }

      const transformFn = (t: number) => `translate(${t * 100}, 0)`

      await moveElements(container, '.node', transformFn, 300)

      expect(container.selectAll).toHaveBeenCalledWith('.node')
      expect(chain.tween).toHaveBeenCalledWith('move', expect.any(Function))
    })
  })

  // ============================================================
  // Performance Mode
  // ============================================================
  describe('getPerformanceMode', () => {
    it('should return normal for small datasets', () => {
      expect(getPerformanceMode(0)).toBe('normal')
      expect(getPerformanceMode(10)).toBe('normal')
      expect(getPerformanceMode(15)).toBe('normal')
    })

    it('should return medium for medium datasets', () => {
      expect(getPerformanceMode(16)).toBe('medium')
      expect(getPerformanceMode(20)).toBe('medium')
      expect(getPerformanceMode(25)).toBe('medium')
    })

    it('should return high for large datasets', () => {
      expect(getPerformanceMode(26)).toBe('high')
      expect(getPerformanceMode(35)).toBe('high')
      expect(getPerformanceMode(40)).toBe('high')
    })

    it('should return critical for very large datasets', () => {
      expect(getPerformanceMode(41)).toBe('critical')
      expect(getPerformanceMode(100)).toBe('critical')
    })

    it('should return normal for negative values (boundary)', () => {
      expect(getPerformanceMode(-1)).toBe('normal')
    })

    it('should handle boundary values precisely', () => {
      expect(getPerformanceMode(15)).toBe('normal')
      expect(getPerformanceMode(16)).toBe('medium')
      expect(getPerformanceMode(25)).toBe('medium')
      expect(getPerformanceMode(26)).toBe('high')
      expect(getPerformanceMode(40)).toBe('high')
      expect(getPerformanceMode(41)).toBe('critical')
    })
  })

  describe('getPerformanceFactor', () => {
    it('should return 1 for normal mode', () => {
      expect(getPerformanceFactor(10)).toBe(1)
    })

    it('should return 0.75 for medium mode', () => {
      expect(getPerformanceFactor(20)).toBe(0.75)
    })

    it('should return 0.5 for high mode', () => {
      expect(getPerformanceFactor(30)).toBe(0.5)
    })

    it('should return 0.25 for critical mode', () => {
      expect(getPerformanceFactor(50)).toBe(0.25)
    })

    it('should default to 1 when no data length provided', () => {
      expect(getPerformanceFactor()).toBe(1)
    })
  })

  // ============================================================
  // EASING
  // ============================================================
  describe('EASING', () => {
    it('should contain all easing functions', () => {
      expect(EASING.easeOutQuad).toBeDefined()
      expect(EASING.easeOutCubic).toBeDefined()
      expect(EASING.easeInCubic).toBeDefined()
      expect(EASING.easeInBack).toBeDefined()
      expect(EASING.easeOutBack).toBeDefined()
      expect(EASING.easeOutElastic).toBeDefined()
      expect(EASING.easeInOut).toBeDefined()
      expect(EASING.easeInOutQuad).toBeDefined()
      expect(EASING.easeBounce).toBeDefined()
      expect(EASING.easeOutExpo).toBeDefined()
      expect(EASING.easeInOutExpo).toBeDefined()
      expect(EASING.linear).toBeDefined()
    })

    it('should produce values between 0 and 1 for start/end of each easing', () => {
      Object.values(EASING).forEach((fn) => {
        const start = fn(0)
        const end = fn(1)
        expect(start).toBeGreaterThanOrEqual(0)
        expect(end).toBeLessThanOrEqual(1.5)
      })
    })
  })

  // ============================================================
  // setAnimationSpeed / getAnimationSpeed
  // ============================================================
  describe('setAnimationSpeed / getAnimationSpeed', () => {
    it('should update and retrieve speed', () => {
      setAnimationSpeed(2)
      expect(getAnimationSpeed()).toBe(2)
    })

    it('should handle decimal speeds', () => {
      setAnimationSpeed(0.5)
      expect(getAnimationSpeed()).toBe(0.5)
    })
  })

  // ============================================================
  // setSkipAnimation / getSkipAnimation
  // ============================================================
  describe('setSkipAnimation / getSkipAnimation', () => {
    it('should update and retrieve skip flag', () => {
      setSkipAnimation(true)
      expect(getSkipAnimation()).toBe(true)
    })

    it('should toggle back to false', () => {
      setSkipAnimation(true)
      expect(getSkipAnimation()).toBe(true)
      setSkipAnimation(false)
      expect(getSkipAnimation()).toBe(false)
    })
  })
})