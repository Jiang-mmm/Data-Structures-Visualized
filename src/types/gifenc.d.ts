// gifenc 1.0.3 — minimal type declarations for our usage
// 项目根目录 / 浏览器端 ESM 已编译产物（src/index.js → dist/gifenc.esm.js）
declare module 'gifenc' {
  export type RGBPixel = [number, number, number]
  export type RGBAPixel = [number, number, number, number]

  export interface QuantizeOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444'
    oneBitAlpha?: boolean | number
    clearAlpha?: boolean
    clearAlphaThreshold?: number
    clearAlphaColor?: number
  }

  export interface ApplyPaletteOptions {
    format?: 'rgb565' | 'rgb444' | 'rgba4444'
    oneBitAlpha?: boolean | number
  }

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions
  ): RGBPixel[] | RGBAPixel[]

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: RGBPixel[] | RGBAPixel[],
    options?: ApplyPaletteOptions
  ): Uint8Array

  export interface WriteFrameOptions {
    palette?: RGBPixel[] | RGBAPixel[]
    first?: boolean
    transparent?: boolean
    transparentIndex?: number
    /** delay in milliseconds (between frames) */
    delay?: number
    /** repeat count: 0 = forever, -1 = once, positive = number of repetitions */
    repeat?: number
    colorDepth?: number
    dispose?: number
  }

  export interface GIFEncoderInstance {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: WriteFrameOptions
    ): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
    reset(): void
  }

  export interface GIFEncoderOptions {
    auto?: boolean
    initialCapacity?: number
  }

  export function GIFEncoder(options?: GIFEncoderOptions): GIFEncoderInstance
}
