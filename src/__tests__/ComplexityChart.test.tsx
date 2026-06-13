import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import ComplexityChart from '../components/ComplexityChart'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

class MockResizeObserver {
  callback: ResizeObserverCallback
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback
    callback([{ contentRect: { width: 400, height: 300 } } as ResizeObserverEntry], this as unknown as ResizeObserver)
  }
  observe = mockObserve
  disconnect = mockDisconnect
  unobserve = vi.fn()
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(globalThis as Record<string, unknown>).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver
})

const singleAlgorithm = [
  { name: '快速排序', complexity: 'O(n log n)' },
]

const multipleAlgorithms = [
  { name: '冒泡排序', complexity: 'O(n²)' },
  { name: '快速排序', complexity: 'O(n log n)' },
  { name: '二分查找', complexity: 'O(log n)' },
]

describe('ComplexityChart', () => {
  describe('渲染', () => {
    it('应该渲染容器 div', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const wrapper = container.querySelector('.w-full')
      expect(wrapper).toBeInTheDocument()
    })

    it('应该渲染 SVG 元素', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('应该设置 SVG 的 viewBox 属性', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const svg = container.querySelector('svg')
      expect(svg?.getAttribute('viewBox')).toContain('400')
      expect(svg?.getAttribute('viewBox')).toContain('300')
    })
  })

  describe('路径渲染', () => {
    it('应该为单个算法渲染一条路径', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBe(1)
    })

    it('应该为多个算法渲染多条路径', () => {
      const { container } = render(<ComplexityChart algorithms={multipleAlgorithms} />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBe(3)
    })

    it('路径应该有正确的 stroke 属性', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const path = container.querySelector('path')
      expect(path?.getAttribute('fill')).toBe('none')
      expect(path?.getAttribute('stroke-width')).toBe('2')
    })

    it('路径应该有 d 属性', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const path = container.querySelector('path')
      expect(path?.getAttribute('d')).toBeTruthy()
      expect(path?.getAttribute('d')).toContain('M')
    })
  })

  describe('自定义颜色', () => {
    it('应该使用自定义颜色', () => {
      const customAlgorithms = [
        { name: '测试算法', complexity: 'O(n)', color: '#ff0000' },
      ]
      const { container } = render(<ComplexityChart algorithms={customAlgorithms} />)
      const path = container.querySelector('path')
      expect(path?.getAttribute('stroke')).toBe('#ff0000')
    })

    it('应该使用默认颜色当未指定时', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const path = container.querySelector('path')
      expect(path?.getAttribute('stroke')).toContain('var(--color-accent-')
    })
  })

  describe('图例', () => {
    it('应该渲染图例文本', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      expect(container.textContent).toContain('快速排序')
      expect(container.textContent).toContain('O(n log n)')
    })

    it('应该渲染多个图例项', () => {
      const { container } = render(<ComplexityChart algorithms={multipleAlgorithms} />)
      expect(container.textContent).toContain('冒泡排序')
      expect(container.textContent).toContain('快速排序')
      expect(container.textContent).toContain('二分查找')
    })

    it('图例应该包含复杂度信息', () => {
      const { container } = render(<ComplexityChart algorithms={multipleAlgorithms} />)
      expect(container.textContent).toContain('O(n²)')
      expect(container.textContent).toContain('O(n log n)')
      expect(container.textContent).toContain('O(log n)')
    })
  })

  describe('空数据', () => {
    it('应该渲染空算法数组', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('空算法数组不应渲染路径', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBe(0)
    })
  })

  describe('自定义 maxN', () => {
    it('应该接受自定义 maxN 参数', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} maxN={100} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('应该使用默认 maxN 50', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      expect(container.textContent).toContain('50')
    })
  })

  describe('ResizeObserver', () => {
    it('应该创建 ResizeObserver 并调用回调', () => {
      const observerInstances: unknown[] = []
      const OriginalMock = MockResizeObserver
      ;(globalThis as Record<string, unknown>).ResizeObserver = class extends OriginalMock {
        constructor(callback: ResizeObserverCallback) {
          super(callback)
          observerInstances.push(this)
        }
      } as unknown as typeof ResizeObserver
      render(<ComplexityChart algorithms={singleAlgorithm} />)
      expect(observerInstances.length).toBeGreaterThan(0)
    })

    it('应该 observe 容器元素', () => {
      render(<ComplexityChart algorithms={singleAlgorithm} />)
      expect(mockObserve).toHaveBeenCalled()
    })
  })

  describe('坐标轴', () => {
    it('应该渲染坐标轴线', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const lines = container.querySelectorAll('line')
      expect(lines.length).toBeGreaterThanOrEqual(2)
    })

    it('应该渲染刻度文本', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const texts = container.querySelectorAll('text')
      expect(texts.length).toBeGreaterThan(0)
    })
  })
})