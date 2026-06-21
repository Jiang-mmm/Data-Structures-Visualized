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

let fpsDegraded = false
let fpsDegradedSince: number | null = null
const LOW_FPS_THRESHOLD = 20
const LOW_FPS_DURATION = 3000
const FRAME_STALL_THRESHOLD = 100

function updateFPSDegradation(now: number, fps: number, frameTime: number) {
  if (frameTime > FRAME_STALL_THRESHOLD) {
    if (!fpsDegraded) {
      fpsDegraded = true
      perfLogger.log('fps', '[FPS] Auto-degraded after frame stall', { frameTime })
    }
    return
  }
  if (fps < LOW_FPS_THRESHOLD) {
    if (fpsDegradedSince === null) {
      fpsDegradedSince = now
    }
    if (!fpsDegraded && now - fpsDegradedSince >= LOW_FPS_DURATION) {
      fpsDegraded = true
      perfLogger.log('fps', '[FPS] Auto-degraded after 3s low FPS', { fps })
    }
  } else if (!fpsDegraded) {
    fpsDegradedSince = null
  }
}

function measureFPS() {
  fpsFrameCount++
  const now = performance.now()
  const frameTime = now - fpsLastFrameTime
  fpsLastFrameTime = now

  if (now - fpsLastTime >= 1000) {
    currentFPS = fpsFrameCount
    updateFPSDegradation(now, currentFPS, frameTime)
    perfLogger.recordFPS(currentFPS, frameTime)
    perfLogger.log('fps', `[FPS] ${currentFPS} FPS | frame: ${frameTime.toFixed(2)}ms`, {
      fps: currentFPS,
      frameTimeMs: frameTime,
    })
    fpsFrameCount = 0
    fpsLastTime = now
  } else {
    updateFPSDegradation(now, currentFPS, frameTime)
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
  resetFPSDegradation()
}

export function getCurrentFPS() {
  return currentFPS
}

export function isFPSDegraded() {
  return fpsDegraded
}

export function resetFPSDegradation() {
  fpsDegraded = false
  fpsDegradedSince = null
}

/**
 * 渲染性能监控日志
 * 记录关键渲染函数的执行时间，超过 16ms (60fps) 时输出警告
 * 支持同步和异步函数，保留返回值
 * @example
 * ```ts
 * const svg = measureRender('renderTree', () => renderTree(data, width, height))
 * await measureRender('animateSort', () => animateSort(anim))
 * ```
 */
export function measureRender<T>(label: string, fn: () => T): T {
  const start = performance.now()
  const result = fn()
  const log = () => {
    const elapsed = performance.now() - start
    perfLogger.recordFunction(label, elapsed)
    if (elapsed > 50) {
      showToast({ type: 'warning', message: `${tStatic('speedControl.renderSlow')}: ${label} ${elapsed.toFixed(0)}ms` })
    }
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

/**
 * 安全执行动画函数，捕获异常并弹出错误 toast
 * @example
 * ```ts
 * await safeAnimate(() => animateInsert(anim, value), '插入')
 * ```
 */
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
let applyPresetAbortCallback: (() => void) | null = null

export function registerApplyPresetAbortCallback(callback: () => void) {
  applyPresetAbortCallback = callback
}

export function unregisterApplyPresetAbortCallback() {
  applyPresetAbortCallback = null
}

/**
 * 应用动画预设，切换速度、缓动和跳过动画标志；会先中断当前动画
 * @example
 * ```ts
 * applyPreset('gentle') // 速度 0.5x，柔和缓动
 * applyPreset('instant') // 跳过动画
 * ```
 */
export function applyPreset(presetKey: string) {
  const preset = ANIMATION_PRESETS[presetKey]
  if (!preset) return
  applyPresetAbortCallback?.()
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
  easeInOutCubic: easeCubicInOut,
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
  _pendingResolvers?: (() => void)[]
}

/**
 * 创建一个可中止的动画句柄，包含 promise、abort、isAborted 等方法
 * @example
 * ```ts
 * const anim = createAnimation()
 * await wait(300, anim)
 * // 中途需要中断时
 * anim.abort()
 * ```
 */
export function createAnimation(): Animation {
  let aborted = false
  let resolvePromise: (() => void) | null = null
  let rejectPromise: ((err: Error) => void) | null = null

  const promise = new Promise<void>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  const anim: Animation = {
    promise,
    abort: () => {
      if (aborted) return
      aborted = true
      for (const tid of anim._pendingTimers ?? []) clearTimeout(tid)
      anim._pendingTimers = []
      for (const resolve of anim._pendingResolvers ?? []) resolve()
      anim._pendingResolvers = []
      resolvePromise?.()
    },
    isAborted: () => aborted,
    resolve: () => resolvePromise?.(),
    reject: (err) => rejectPromise?.(err),
  }

  return anim
}

/**
 * 根据当前速度倍率、FPS 状态与数据量计算实际动画时长（ms）
 * @example
 * ```ts
 * duration(500)          // 基础 500ms，按当前速度倍率折算
 * duration(500, 30)      // 大数据量触发性能因子，时长进一步缩短
 * ```
 */
export function duration(baseMs: number, dataLength = 0) {
  if (skipAnimationFlag || isFPSDegraded()) return 0
  const perfFactor = getPerformanceFactor(dataLength)
  const fpsFactor = currentFPS < 15 ? 0 : currentFPS < 30 ? 0.5 : 1
  return (baseMs * perfFactor * fpsFactor) / speedMultiplier
}

/**
 * 等待指定基础时长，支持动画中止与全局速度倍率
 * @example
 * ```ts
 * const anim = createAnimation()
 * await wait(300, anim)
 * anim.abort() // 等待会立即结束
 * ```
 */
export async function wait(baseMs: number, anim?: Animation) {
  if (anim?.isAborted?.()) return
  await new Promise<void>((resolve) => {
    const id = setTimeout(resolve, baseMs / speedMultiplier)
    if (anim) {
      if (!anim._pendingTimers) anim._pendingTimers = []
      anim._pendingTimers.push(id)
      if (!anim._pendingResolvers) anim._pendingResolvers = []
      anim._pendingResolvers.push(resolve)
    }
  })
}

export interface DelayedStart {
  promise: Promise<void>
  abort: () => void
  isAborted: () => boolean
}

export function delayStart(ms = 1500, callback?: () => void): DelayedStart {
  let aborted = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let resolvePromise: (() => void) | null = null

  const promise = new Promise<void>((resolve) => {
    resolvePromise = resolve
    timer = setTimeout(() => {
      if (aborted) return
      callback?.()
      resolve()
    }, ms)
  })

  const abort = () => {
    if (aborted) return
    aborted = true
    if (timer) { clearTimeout(timer); timer = null }
    resolvePromise?.()
  }

  const isAborted = () => aborted

  return { promise, abort, isAborted }
}

/**
 * 创建一个安全的 D3 过渡 Promise，同时监听 'end' 和 'interrupt' 事件
 * 防止过渡被中断时 Promise 永远不 resolve 导致 isAnimating 卡住
 * 增加超时保护: 防止链式过渡被中断或事件丢失时 Promise 永久挂起
 * @param transition D3 过渡选择器
 * @param timeoutMs 超时毫秒数，默认 3000ms（覆盖最长链式过渡的 5 倍冗余）
 */
export function transitionEnd(transition: any, timeoutMs = 3000): Promise<void> {
  return new Promise<void>((resolve) => {
    let resolved = false
    const safeResolve = (): void => {
      if (!resolved) {
        resolved = true
        clearTimeout(timer)
        resolve()
      }
    }
    transition.on('end', safeResolve).on('interrupt', safeResolve)
    // 超时兜底: 防止 Promise 永久挂起导致页面交互卡死
    const timer = setTimeout(safeResolve, timeoutMs)
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
