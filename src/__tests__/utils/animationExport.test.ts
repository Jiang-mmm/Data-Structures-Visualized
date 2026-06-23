import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock toastStore
vi.mock('../../components/toastStore', () => ({
  showToast: vi.fn(),
}))

import { showToast } from '../../components/toastStore'

// Build minimal in-memory mocks for jsdom
class FakeImage {
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  width = 0
  height = 0
  complete = false
  private _src = ''
  set src(value: string) {
    this._src = value
    setTimeout(() => {
      this.width = 100
      this.height = 50
      this.complete = true
      this.onload?.()
    }, 0)
  }
  get src() { return this._src }
}

let createdImages: FakeImage[] = []
let createdCanvases: any[] = []
let lastBlobFromToBlob: Blob | null = null

class FakeCanvas {
  width = 0
  height = 0
  private ctx: FakeCtx
  constructor() {
    this.ctx = new FakeCtx()
    createdCanvases.push(this)
  }
  getContext(type: string) {
    if (type === '2d') return this.ctx
    return null
  }
  captureStream = vi.fn().mockReturnValue({
    getTracks: () => [{ stop: vi.fn() }],
  })
  toBlob = vi.fn((cb: (blob: Blob | null) => void) => {
    cb(lastBlobFromToBlob)
  })
  toDataURL = vi.fn().mockReturnValue('data:image/png;base64,AAA=')
}

class FakeCtx {
  drawImage = vi.fn()
  fillRect = vi.fn()
  clearRect = vi.fn()
  getImageData = vi.fn((_x: number, _y: number, w: number, h: number) => {
    return { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }
  })
  putImageData = vi.fn()
  imageSmoothingEnabled = true
}

class FakeMediaRecorder {
  static isTypeSupported = vi.fn().mockReturnValue(true)
  ondataavailable: ((e: { data: Blob }) => void) | null = null
  onstop: (() => void) | null = null
  onstart: (() => void) | null = null
  onerror: ((e: unknown) => void) | null = null
  state: 'inactive' | 'recording' | 'stopped' = 'inactive'
  start = vi.fn(() => {
    this.state = 'recording'
    this.onstart?.()
  })
  stop = vi.fn(() => {
    this.state = 'stopped'
    const blob = new Blob(['webm-data'], { type: 'video/webm' })
    this.ondataavailable?.({ data: blob })
    this.onstop?.()
  })
}

let mockAnchors: { click: any; anchor: HTMLAnchorElement }[] = []

beforeEach(() => {
  vi.clearAllMocks()
  createdImages = []
  createdCanvases = []
  mockAnchors = []
  lastBlobFromToBlob = new Blob(['png'], { type: 'image/png' })

  // canvas + anchor mock — capture original BEFORE installing spy to avoid recursion
  const origCreate: (tag: string) => HTMLElement = Document.prototype.createElement as any
  vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
    if (tag === 'canvas') return new FakeCanvas() as any
    if (tag === 'a') {
      // Use a real HTMLAnchorElement so appendChild/removeChild accept it,
      // but wrap click() so the test can assert it was called.
      const anchor = origCreate.call(document, 'a') as HTMLAnchorElement
      const clickSpy = vi.fn()
      anchor.click = clickSpy as any
      mockAnchors.push({ click: clickSpy, anchor })
      return anchor
    }
    return origCreate.call(document, tag)
  })

  // MediaRecorder
  ;(globalThis as any).MediaRecorder = FakeMediaRecorder

  // URL
  let blobCounter = 0
  window.URL.createObjectURL = vi.fn(() => `blob:fake-${++blobCounter}`)
  window.URL.revokeObjectURL = vi.fn()

  // requestAnimationFrame
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    return setTimeout(() => cb(performance.now()), 0) as unknown as number
  }) as typeof globalThis.requestAnimationFrame

  // Blob.arrayBuffer polyfill (for jsdom old version)
  if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function () {
      return new Promise<ArrayBuffer>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as ArrayBuffer)
        reader.readAsArrayBuffer(this)
      })
    }
  }
})

afterEach(() => {
  delete (globalThis as any).MediaRecorder
})

// image factory that creates FakeImage instances
function fakeImageFactory(): HTMLImageElement {
  const img = new FakeImage()
  createdImages.push(img)
  return img as unknown as HTMLImageElement
}

// Lazy import after mocks
async function load() {
  const mod = await import('../../utils/animationExport')
  return mod
}

function makeSvg(): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('viewBox', '0 0 100 50')
  return svg
}

describe('animationExport', () => {
  describe('serializeSvg', () => {
    it('应该给 SVG 添加 xmlns 和 width/height 属性', async () => {
      const { serializeSvg } = await load()
      const svg = makeSvg()
      const result = serializeSvg(svg, 100, 50)
      expect(result).toContain('xmlns="http://www.w3.org/2000/svg"')
      expect(result).toContain('width="100"')
      expect(result).toContain('height="50"')
    })

    it('不应该修改原始 SVG 节点', async () => {
      const { serializeSvg } = await load()
      const svg = makeSvg()
      const before = svg.outerHTML
      serializeSvg(svg, 200, 100)
      expect(svg.outerHTML).toBe(before)
    })
  })

  describe('isAnimationExportSupported', () => {
    it('应该返回三种格式的支持情况', async () => {
      const { isAnimationExportSupported } = await load()
      const support = isAnimationExportSupported()
      expect(support).toHaveProperty('webm')
      expect(support).toHaveProperty('gif')
      expect(support).toHaveProperty('frames')
    })

    it('在没有 MediaRecorder 的环境下 webm 应为 false', async () => {
      delete (globalThis as any).MediaRecorder
      // re-import to pick up the change
      vi.resetModules()
      const mod = await import('../../utils/animationExport')
      const support = mod.isAnimationExportSupported()
      expect(support.webm).toBe(false)
      ;(globalThis as any).MediaRecorder = FakeMediaRecorder
      vi.resetModules()
    })
  })

  describe('loadSvgImage', () => {
    it('应该使用注入的 imageFactory 创建 Image', async () => {
      const { loadSvgImage } = await load()
      const svg = makeSvg()
      const img = await loadSvgImage(svg, 100, 50, fakeImageFactory)
      expect(img).toBeTruthy()
      expect(createdImages.length).toBe(1)
    })
  })

  describe('exportAnimationWebM', () => {
    it('应该将 SVG 录制为 webm 并触发下载', async () => {
      const { exportAnimationWebM } = await load()
      const svg = makeSvg()
      await exportAnimationWebM({ current: svg }, 100, 50, 200, 30, 'test.webm', fakeImageFactory)
      expect(mockAnchors.length).toBeGreaterThan(0)
      expect(mockAnchors[0].click).toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    })

    it('MediaRecorder 不可用时应该显示错误', async () => {
      delete (globalThis as any).MediaRecorder
      const svg = makeSvg()
      const mod = await load()
      await mod.exportAnimationWebM({ current: svg }, 100, 50, 200, 30, 'test.webm', fakeImageFactory)
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
      ;(globalThis as any).MediaRecorder = FakeMediaRecorder
    })

    it('svgRef 为 null 时应该显示错误', async () => {
      const { exportAnimationWebM } = await load()
      await exportAnimationWebM({ current: null }, 100, 50, 200, 30, 'test.webm', fakeImageFactory)
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    })
  })

  describe('exportAnimationGIF', () => {
    it('应该将 SVG 编码为 gif 并触发下载', async () => {
      const { exportAnimationGIF } = await load()
      const svg = makeSvg()
      await exportAnimationGIF({ current: svg }, 100, 50, 200, 30, 'test.gif', fakeImageFactory)
      expect(mockAnchors.length).toBeGreaterThan(0)
      expect(mockAnchors[0].click).toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    })

    it('svgRef 为 null 时应该显示错误', async () => {
      const { exportAnimationGIF } = await load()
      await exportAnimationGIF({ current: null }, 100, 50, 200, 30, 'test.gif', fakeImageFactory)
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    })
  })

  describe('exportAnimationFrames', () => {
    it('应该将帧序列打包为 zip 并触发下载', async () => {
      const { exportAnimationFrames } = await load()
      const svg = makeSvg()
      await exportAnimationFrames({ current: svg }, 100, 50, 200, 30, 'test.zip', fakeImageFactory)
      expect(mockAnchors.length).toBeGreaterThan(0)
      expect(mockAnchors[0].click).toHaveBeenCalled()
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }))
    })

    it('svgRef 为 null 时应该显示错误', async () => {
      const { exportAnimationFrames } = await load()
      await exportAnimationFrames({ current: null }, 100, 50, 200, 30, 'test.zip', fakeImageFactory)
      expect(showToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }))
    })
  })
})
