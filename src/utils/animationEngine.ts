import {
  select,
  easeQuadOut,
  easeQuadInOut,
  easeCubicIn,
  easeCubicOut,
  easeCubicInOut,
  easeBackIn,
  easeBackOut,
  easeElasticOut,
  easeBounceOut,
  easeLinear,
  easeExpOut,
  easeExpInOut,
} from './d3Imports'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'
import { perfLogger } from './performanceLogger'

let speedMultiplier = 1
let skipAnimationFlag = false
let currentFPS = 60
let fpsFrameCount = 0
let fpsLastTime = performance.now()
let fpsMonitoring = false
let fpsLastFrameTime = performance.now()

function measureFPS() {
  fpsFrameCount++
  const now = performance.now()
  const frameTime = now - fpsLastFrameTime
  fpsLastFrameTime = now

  if (now - fpsLastTime >= 1000) {
    currentFPS = fpsFrameCount
    perfLogger.recordFPS(currentFPS, frameTime)
    perfLogger.log('fps', `[FPS] ${currentFPS} FPS | frame: ${frameTime.toFixed(2)}ms`, {
      fps: currentFPS,
      frameTimeMs: frameTime,
    })
    fpsFrameCount = 0
    fpsLastTime = now
  }
  if (fpsMonitoring) {
    requestAnimationFrame(measureFPS)
  }
}

export function startFPSMonitoring() {
  if (fpsMonitoring) return
  fpsMonitoring = true
  fpsLastTime = performance.now()
  fpsFrameCount = 0
  requestAnimationFrame(measureFPS)
}

export function stopFPSMonitoring() {
  fpsMonitoring = false
  fpsFrameCount = 0
  currentFPS = 60
}

export function getCurrentFPS() {
  return currentFPS
}

/**
 * 渲染性能监控日志
 * 记录关键渲染函数的执行时间，超过 16ms (60fps) 时输出警告
 * 支持同步和异步函数，保留返回值
 */
export function measureRender<T>(label: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const log = () => {
    const elapsed = performance.now() - start
    perfLogger.recordFunction(label, elapsed)
    if (import.meta.env.DEV) {
      if (elapsed > 16) {
        console.warn(`[Render Slow] ${label}: ${elapsed.toFixed(2)}ms (>16ms, FPS risk)`)
      } else {
        console.log(`[Render] ${label}: ${elapsed.toFixed(2)}ms`)
      }
    }
  }
  if (result && typeof (result as unknown as Promise<any>).then === 'function') {
    return (result as unknown as Promise<any>).then(
      (value) => { log(); return value },
      (err) => { log(); throw err }
    ) as T
  }
  log()
  return result
}

/**
 * 同步渲染性能监控包装器
 */
export function withRenderPerf<T extends (...args: any[]) => any>(
  fn: T,
  label: string
): T {
  return function (this: any, ...args: any[]) {
    return measureRender(label, () => fn.apply(this, args))
  } as T
}

export async function safeAnimate(animationFn: () => Promise<void>, label?: string) {
  try {
    await animationFn()
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[Animation Error]${label ? ` ${label}` : ''}`, error)
    }
    showToast({ type: 'error', message: `${tStatic('speedControl.animationError')}${label ? `: ${label}` : ''}` })
  }
}

export function setAnimationSpeed(speed: number) {
  speedMultiplier = speed
}

export function getAnimationSpeed() {
  return speedMultiplier
}

let currentEasing = easeCubicOut

export function setDefaultEasing(easing: (t: number) => number) {
  currentEasing = easing
}

export function getDefaultEasing() {
  return currentEasing
}

export interface AnimationPreset {
  name: string
  nameKey?: string
  icon: string
  speed: number
  easing: (t: number) => number
  skip?: boolean
}

export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  default: { name: '标准', nameKey: 'speedControl.presetDefault', icon: '▶', speed: 1, easing: easeCubicOut },
  gentle: { name: '柔和', nameKey: 'speedControl.presetGentle', icon: '〰', speed: 0.5, easing: easeQuadInOut },
  snappy: { name: '快速', nameKey: 'speedControl.presetSnappy', icon: '▹', speed: 2, easing: easeCubicOut },
  dramatic: { name: '戏剧', nameKey: 'speedControl.presetDramatic', icon: '✦', speed: 1, easing: easeElasticOut.amplitude(1).period(0.3) },
  instant: { name: '瞬时', nameKey: 'speedControl.presetInstant', icon: '⏭', speed: 4, easing: easeLinear, skip: true },
}

let currentPreset = 'default'

export function applyPreset(presetKey: string) {
  const preset = ANIMATION_PRESETS[presetKey]
  if (!preset) return
  currentPreset = presetKey
  speedMultiplier = preset.speed
  currentEasing = preset.easing
  skipAnimationFlag = !!preset.skip
}

export function getCurrentPreset() {
  return currentPreset
}

export function setSkipAnimation(skip: boolean) {
  skipAnimationFlag = skip
}

export function getSkipAnimation() {
  return skipAnimationFlag
}

export type PerformanceMode = 'normal' | 'medium' | 'high' | 'critical'

export function getPerformanceMode(dataLength = 0): PerformanceMode {
  if (dataLength > 40) return 'critical'
  if (dataLength > 25) return 'high'
  if (dataLength > 15) return 'medium'
  return 'normal'
}

export function getPerformanceFactor(dataLength = 0) {
  const mode = getPerformanceMode(dataLength)
  switch (mode) {
    case 'critical': return 0.25
    case 'high': return 0.5
    case 'medium': return 0.75
    default: return 1
  }
}

export const EASING: Record<string, (t: number) => number> = {
  easeOutQuad: easeQuadOut,
  easeOutCubic: easeCubicOut,
  easeInCubic: easeCubicIn,
  easeInBack: easeBackIn,
  easeOutBack: easeBackOut,
  easeOutElastic: easeElasticOut.amplitude(1).period(0.3),
  easeInOut: easeCubicInOut,
  easeInOutQuad: easeQuadInOut,
  easeBounce: easeBounceOut,
  easeOutExpo: easeExpOut,
  easeInOutExpo: easeExpInOut,
  linear: easeLinear,
}

export interface Animation {
  promise: Promise<void>
  abort: () => void
  isAborted: () => boolean
  resolve: () => void
  reject: (err: Error) => void
  _pendingTimers?: ReturnType<typeof setTimeout>[]
}

export function createAnimation(): Animation {
  let aborted = false
  let resolvePromise: (() => void) | null = null
  let rejectPromise: ((err: Error) => void) | null = null

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const abort = () => {
    if (aborted) return
    aborted = true
    resolvePromise?.()
  }

  const isAborted = () => aborted

  return { promise, abort, isAborted, resolve: () => resolvePromise?.(), reject: (err) => rejectPromise?.(err) }
}

export function duration(baseMs: number, dataLength = 0) {
  if (skipAnimationFlag) return 0
  const perfFactor = getPerformanceFactor(dataLength)
  const fpsFactor = currentFPS < 15 ? 0 : currentFPS < 30 ? 0.5 : 1
  return (baseMs * perfFactor * fpsFactor) / speedMultiplier
}

export async function wait(baseMs: number, anim?: Animation) {
  if (anim?.isAborted?.()) return
  await new Promise<void>((resolve) => {
    const id = setTimeout(resolve, baseMs / speedMultiplier)
    if (anim) {
      if (!anim._pendingTimers) anim._pendingTimers = []
      anim._pendingTimers.push(id)
      const origAbort = anim.abort
      anim.abort = () => {
        for (const tid of anim._pendingTimers!) clearTimeout(tid)
        anim._pendingTimers = []
        resolve()
        origAbort?.()
      }
    }
  })
}

/**
 * 创建一个安全的 D3 过渡 Promise，同时监听 'end' 和 'interrupt' 事件
 * 防止过渡被中断时 Promise 永远不 resolve 导致 isAnimating 卡住
 */
export function transitionEnd(transition: any): Promise<void> {
  return new Promise<void>((resolve) => {
    transition.on('end', resolve).on('interrupt', resolve)
  })
}

export interface TransitionProps {
  attr?: Record<string, any>
  style?: Record<string, any>
  tween?: { name: string; fn: () => (t: number) => void }
}

export function transition(selectionFn: () => any, props: TransitionProps, baseMs = 300, easing = easeCubicOut) {
  return new Promise<void>((resolve) => {
    try {
      const sel = selectionFn()
      if (!sel || sel.empty()) { resolve(); return }

      let t = sel.transition().duration(duration(baseMs)).ease(easing)

      if (props.attr) {
        Object.entries(props.attr).forEach(([key, val]) => {
          t = t.attr(key, val)
        })
      }
      if (props.style) {
        Object.entries(props.style).forEach(([key, val]) => {
          t = t.style(key, val)
        })
      }
      if (props.tween) {
        t = t.tween(props.tween.name, props.tween.fn)
      }

      t.on('end', resolve).on('interrupt', resolve)
    } catch {
      resolve()
    }
  })
}

export interface AnimationStep {
  action: () => Promise<void>
  wait?: number
  anim?: Animation
}

export async function sequence(steps: AnimationStep[]) {
  for (const step of steps) {
    if (step.anim?.isAborted?.()) return
    await step.action()
    if (step.wait) await wait(step.wait, step.anim)
  }
}

export function highlightElement(container: any, selector: string, fillColor: string, strokeColor: string, baseMs = 200) {
  return transition(
    () => container.select(selector),
    { attr: { fill: fillColor, stroke: strokeColor } },
    baseMs
  )
}

export function fadeOutElement(container: any, selector: string, transform?: string, baseMs = 300) {
  return transition(
    () => container.select(selector),
    {
      attr: { opacity: 0, ...(transform ? { transform } : {}) },
    },
    baseMs
  )
}

export function fadeInElement(container: any, selector: string, transform?: string, baseMs = 300) {
  return transition(
    () => container.select(selector),
    {
      attr: { opacity: 1, ...(transform ? { transform } : {}) },
    },
    baseMs
  )
}

export function moveElements(container: any, selector: string, transformFn: (t: number, el: any) => string, baseMs = 300, easing?: (t: number) => number) {
  return transition(
    () => container.selectAll(selector),
    {
      attr: { transform: null },
      tween: {
        name: 'move',
        fn: function() {
          const el = select(this)
          return (t: number) => {
            el.attr('transform', transformFn(t, el))
          }
        }
      }
    },
    baseMs,
    easing || easeCubicInOut
  )
}
