import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'
import { GIFEncoder, quantize, applyPalette } from 'gifenc'
import JSZip from 'jszip'

/** 默认录制时长（毫秒） */
const DEFAULT_DURATION_MS = 3000
/** 默认帧率 */
const DEFAULT_FPS = 30
/** 白色背景，与论文/打印风格一致 */
const BG_COLOR = '#ffffff'
/** 单次录制最大帧数（防止 fps×durationMs 失控） */
const MAX_FRAMES = 600

export interface ExportOptions {
  durationMs: number
  fps: number
  filename: string
}

export interface SvgRefLike {
  current: SVGSVGElement | null
}

export interface SupportMatrix {
  webm: boolean
  gif: boolean
  frames: boolean
}

/** 检测当前环境对三种导出格式的支持情况 */
export function isAnimationExportSupported(): SupportMatrix {
  const hasMediaRecorder = typeof globalThis !== 'undefined'
    && typeof (globalThis as unknown as { MediaRecorder?: unknown }).MediaRecorder !== 'undefined'
  let hasCanvasStream = false
  try {
    const canvas = document.createElement('canvas')
    hasCanvasStream = typeof (canvas as unknown as { captureStream?: unknown }).captureStream === 'function'
  } catch {
    hasCanvasStream = false
  }
  return {
    webm: hasMediaRecorder && hasCanvasStream,
    gif: true,
    frames: typeof HTMLCanvasElement !== 'undefined',
  }
}

/**
 * 序列化 SVG 为可独立加载的 XML 字符串（注入 xmlns + width/height）
 * 不修改原始 DOM，使用 cloneNode 隔离副作用
 */
export function serializeSvg(svg: SVGSVGElement, width: number, height: number): string {
  const cloned = svg.cloneNode(true) as SVGSVGElement
  cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  cloned.setAttribute('width', String(width))
  cloned.setAttribute('height', String(height))
  return new XMLSerializer().serializeToString(cloned)
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/**
 * 把当前 SVG 加载为 HTMLImageElement（白底）
 * @internal 测试时可注入自定义 Image 工厂
 */
export async function loadSvgImage(
  svg: SVGSVGElement,
  width: number,
  height: number,
  imageFactory: () => HTMLImageElement = () => new Image(),
): Promise<HTMLImageElement> {
  const xml = serializeSvg(svg, width, height)
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const img = imageFactory()
  try {
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error('SVG image load failed'))
      img.src = url
    })
    return img
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

/** 把当前 SVG 绘制到一张新的 canvas（白底） */
async function renderSvgToCanvas(
  svg: SVGSVGElement,
  width: number,
  height: number,
  imageFactory: () => HTMLImageElement = () => new Image(),
): Promise<HTMLCanvasElement> {
  const img = await loadSvgImage(svg, width, height, imageFactory)
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context unavailable')
  ctx.fillStyle = BG_COLOR
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)
  return canvas
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function clampFrameCount(durationMs: number, fps: number): number {
  const count = Math.max(1, Math.round((durationMs / 1000) * fps))
  return Math.min(count, MAX_FRAMES)
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 录制 SVG → WebM（首选，无外部依赖）
 * 使用 MediaRecorder + canvas.captureStream 实时编码视频流
 * 注：gifenc / jszip 仅在用户选择对应格式时按需引入
 * @param imageFactory 测试时可注入自定义 Image 工厂，默认 new Image()
 */
export async function exportAnimationWebM(
  svgRef: SvgRefLike,
  width: number,
  height: number,
  durationMs: number = DEFAULT_DURATION_MS,
  fps: number = DEFAULT_FPS,
  filename = 'ds-visualizer-animation.webm',
  imageFactory: () => HTMLImageElement = () => new Image(),
): Promise<void> {
  const support = isAnimationExportSupported()
  if (!svgRef.current || !support.webm) {
    showToast({ type: 'error', message: tStatic('exportAnimation.unsupported') })
    return
  }

  try {
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context unavailable')

    const stream = (canvas as HTMLCanvasElement & {
      captureStream: (fps: number) => MediaStream
    }).captureStream(fps)

    const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9'))
      ? 'video/webm;codecs=vp9'
      : (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp8'))
        ? 'video/webm;codecs=vp8'
        : 'video/webm'

    const chunks: Blob[] = []
    const recorder = new MediaRecorder(stream, { mimeType })
    const stopped = new Promise<void>(resolve => {
      recorder.onstop = () => resolve()
    })
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data)
    }
    recorder.start()

    const frameCount = clampFrameCount(durationMs, fps)
    const frameInterval = 1000 / fps
    for (let i = 0; i < frameCount; i++) {
      const current = svgRef.current
      if (!current) break
      const img = await loadSvgImage(current, width, height, imageFactory)
      ctx.fillStyle = BG_COLOR
      ctx.fillRect(0, 0, width, height)
      ctx.drawImage(img, 0, 0, width, height)
      await sleep(frameInterval)
    }

    recorder.stop()
    await stopped
    const blob = new Blob(chunks, { type: mimeType })
    triggerDownload(blob, filename)
    showToast({ type: 'success', message: tStatic('exportAnimation.success') + ' ✓' })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[AnimationExport] WebM failed', error)
    }
    showToast({ type: 'error', message: tStatic('exportAnimation.failed') })
  }
}

/**
 * 录制 SVG → GIF（次选）
 * 使用 gifenc 编码 RGBA → 索引色位图
 * 适合简单扁平矢量（与本项目 Neo-Brutalist 风格匹配）
 * @param imageFactory 测试时可注入自定义 Image 工厂，默认 new Image()
 */
export async function exportAnimationGIF(
  svgRef: SvgRefLike,
  width: number,
  height: number,
  durationMs: number = DEFAULT_DURATION_MS,
  fps: number = DEFAULT_FPS,
  filename = 'ds-visualizer-animation.gif',
  imageFactory: () => HTMLImageElement = () => new Image(),
): Promise<void> {
  if (!svgRef.current) {
    showToast({ type: 'error', message: tStatic('exportAnimation.unsupported') })
    return
  }

  try {
    const frameCount = clampFrameCount(durationMs, fps)
    const frameInterval = 1000 / fps
    const gif = GIFEncoder()
    for (let i = 0; i < frameCount; i++) {
      const current = svgRef.current
      if (!current) break
      const canvas = await renderSvgToCanvas(current, width, height, imageFactory)
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas 2D context unavailable')
      const imageData = ctx.getImageData(0, 0, width, height)
      const palette = quantize(imageData.data, 256, { format: 'rgb565' })
      const index = applyPalette(imageData.data, palette, { format: 'rgb565' })
      gif.writeFrame(index, width, height, {
        palette,
        delay: Math.round(frameInterval),
      })
    }
    gif.finish()
    const bytes = gif.bytes()
    const blob = new Blob([bytes as BlobPart], { type: 'image/gif' })
    triggerDownload(blob, filename)
    showToast({ type: 'success', message: tStatic('exportAnimation.success') + ' ✓' })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[AnimationExport] GIF failed', error)
    }
    showToast({ type: 'error', message: tStatic('exportAnimation.failed') })
  }
}

/**
 * 录制 SVG → 帧序列 ZIP（兜底方案）
 * 每帧保存为 PNG，便于后期用 FFmpeg / ffmpeg.wasm 合成任意格式
 * @param imageFactory 测试时可注入自定义 Image 工厂，默认 new Image()
 */
export async function exportAnimationFrames(
  svgRef: SvgRefLike,
  width: number,
  height: number,
  durationMs: number = DEFAULT_DURATION_MS,
  fps: number = DEFAULT_FPS,
  filename = 'ds-visualizer-frames.zip',
  imageFactory: () => HTMLImageElement = () => new Image(),
): Promise<void> {
  if (!svgRef.current) {
    showToast({ type: 'error', message: tStatic('exportAnimation.unsupported') })
    return
  }

  try {
    const frameCount = clampFrameCount(durationMs, fps)
    const frameInterval = 1000 / fps
    const zip = new JSZip()
    for (let i = 0; i < frameCount; i++) {
      const current = svgRef.current
      if (!current) break
      const canvas = await renderSvgToCanvas(current, width, height, imageFactory)
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(b => resolve(b), 'image/png')
      })
      if (!blob) throw new Error('Canvas toBlob returned null')
      const padded = String(i).padStart(4, '0')
      zip.file(`frame-${padded}.png`, blob)
      await sleep(frameInterval)
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' })
    triggerDownload(zipBlob, filename)
    showToast({ type: 'success', message: tStatic('exportAnimation.success') + ' ✓' })
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[AnimationExport] Frames failed', error)
    }
    showToast({ type: 'error', message: tStatic('exportAnimation.failed') })
  }
}
