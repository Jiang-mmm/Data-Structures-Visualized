import { describe, it, expect, beforeEach } from 'vitest'
import { getViewBoxSize, calculateCenterStart, clampNonNegative } from '../utils/visualizerLayout'

describe('visualizerLayout', () => {
  let svg: SVGSVGElement

  beforeEach(() => {
    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  })

  describe('getViewBoxSize', () => {
    it('应该从有效 viewBox 解析宽高', () => {
      svg.setAttribute('viewBox', '0 0 400 200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(400)
      expect(result.height).toBe(200)
    })

    it('应该处理逗号分隔的 viewBox', () => {
      svg.setAttribute('viewBox', '0,0,400,200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(400)
      expect(result.height).toBe(200)
    })

    it('应该处理混合分隔符的 viewBox', () => {
      svg.setAttribute('viewBox', '0, 0 400, 200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(400)
      expect(result.height).toBe(200)
    })

    it('应该处理带前导/后置空格的 viewBox', () => {
      svg.setAttribute('viewBox', '  0 0 400 200  ')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(400)
      expect(result.height).toBe(200)
    })

    it('当 viewBox 不存在时应回退到 fallback 值', () => {
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 为空字符串时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 为无效字符串时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', 'invalid')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 部分无效时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '0 0 abc 200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 宽度为 0 时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '0 0 0 200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 高度为 0 时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '0 0 400 0')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 宽度为负数时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '0 0 -400 200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 参数不足 4 个时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '0 0 400')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('当 viewBox 参数超过 4 个时应回退到 fallback 值', () => {
      svg.setAttribute('viewBox', '0 0 400 200 100')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(800)
      expect(result.height).toBe(600)
    })

    it('应该正确处理非零偏移的 viewBox', () => {
      svg.setAttribute('viewBox', '10 20 400 200')
      const result = getViewBoxSize(svg, 800, 600)
      expect(result.width).toBe(400)
      expect(result.height).toBe(200)
    })
  })

  describe('calculateCenterStart', () => {
    it('应该正确计算居中起始坐标', () => {
      expect(calculateCenterStart(200, 800)).toBe(300)
    })

    it('当内容尺寸等于容器尺寸时应返回 0', () => {
      expect(calculateCenterStart(800, 800)).toBe(0)
    })

    it('当内容尺寸为 0 时应返回容器尺寸的一半', () => {
      expect(calculateCenterStart(0, 800)).toBe(400)
    })

    it('当内容尺寸超过容器尺寸时应钳制为 0', () => {
      expect(calculateCenterStart(1000, 800)).toBe(0)
    })

    it('当内容尺寸远超过容器尺寸时应钳制为 0', () => {
      expect(calculateCenterStart(2000, 100)).toBe(0)
    })

    it('应该正确处理单元素居中', () => {
      expect(calculateCenterStart(60, 800)).toBe(370)
    })

    it('应该正确处理小容器', () => {
      expect(calculateCenterStart(50, 100)).toBe(25)
    })

    it('应该返回非负值', () => {
      expect(calculateCenterStart(500, 100)).toBeGreaterThanOrEqual(0)
    })
  })

  describe('clampNonNegative', () => {
    it('应该返回正数本身', () => {
      expect(clampNonNegative(100)).toBe(100)
    })

    it('应该返回 0 当输入为 0', () => {
      expect(clampNonNegative(0)).toBe(0)
    })

    it('应该返回 0 当输入为负数', () => {
      expect(clampNonNegative(-100)).toBe(0)
    })

    it('应该返回 0 当输入为 -0.5', () => {
      expect(clampNonNegative(-0.5)).toBe(0)
    })

    it('应该正确处理小数', () => {
      expect(clampNonNegative(3.14)).toBe(3.14)
    })

    it('应该正确处理大数', () => {
      expect(clampNonNegative(1000000)).toBe(1000000)
    })
  })

  describe('集成场景:模拟 visualizer 居中计算', () => {
    it('数组居中:3 个元素(宽 60,间隔 10)在 800 宽容器中', () => {
      const totalW = 3 * (60 + 10) - 10
      const startX = calculateCenterStart(totalW, 800)
      expect(startX).toBe(300)
      expect(startX + totalW / 2).toBe(400)
    })

    it('栈居中:单元素(宽 80)在 400 宽容器中', () => {
      const startX = calculateCenterStart(80, 400)
      expect(startX).toBe(160)
      expect(startX + 80 / 2).toBe(200)
    })

    it('队列居中:超大数据集在窄容器中应钳制为 0', () => {
      const totalW = 20 * (70 + 10) - 10
      const startX = calculateCenterStart(totalW, 800)
      expect(totalW).toBeGreaterThan(800)
      expect(startX).toBe(0)
    })
  })
})
