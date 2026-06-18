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

const tableAlgorithms = [
  { name: 'BFS', complexity: 'O(V+E)', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '广度优先搜索' },
  { name: 'DFS', complexity: 'O(V+E)', timeComplexity: 'O(V+E)', spaceComplexity: 'O(V)', description: '深度优先搜索' },
  { name: 'Dijkstra', complexity: 'O((V+E)logV)', timeComplexity: 'O((V+E)logV)', spaceComplexity: 'O(V)', description: '最短路径算法' },
]

const expectedDefaultColors = [
  'var(--color-accent-blue)',
  'var(--color-accent-emerald)',
  'var(--color-accent-amber)',
  'var(--color-accent-violet)',
  'var(--color-accent-rose)',
  'var(--color-accent-teal)',
  'var(--color-accent-cyan)',
  'var(--color-accent-pink)',
]

describe('ComplexityChart', () => {
  describe('渲染', () => {
    it('应该渲染容器 div', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const wrapper = container.querySelector('.w-full')
      expect(wrapper).toBeInTheDocument()
    })

    it('应该渲染 SVG 元素（默认显示图表）', () => {
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

    it('路径颜色与图例颜色一致', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const path = container.querySelector('path')
      const legendSwatch = container.querySelector('[role="list"] span[style]') as HTMLElement
      const pathColor = path?.getAttribute('stroke')
      const swatchColor = legendSwatch?.style.backgroundColor
      expect(pathColor).toBeTruthy()
      expect(swatchColor).toBeTruthy()
    })
  })

  describe('默认颜色调色板', () => {
    it('应该为前 8 个算法分配唯一颜色', () => {
      const eightAlgorithms = Array.from({ length: 8 }, (_, i) => ({
        name: `算法${i}`,
        complexity: 'O(n)',
      }))
      const { container } = render(<ComplexityChart algorithms={eightAlgorithms} showChart={false} />)
      const swatches = container.querySelectorAll('[role="listitem"] span[style]')
      expect(swatches.length).toBe(8)
      const colors = Array.from(swatches).map((s) => (s as HTMLElement).style.backgroundColor)
      const uniqueColors = new Set(colors)
      expect(uniqueColors.size).toBe(8)
    })

    it('第一个算法应该使用蓝色', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} showChart={false} />)
      const swatch = container.querySelector('[role="listitem"] span[style]') as HTMLElement
      expect(swatch.style.backgroundColor).toBe(expectedDefaultColors[0])
    })

    it('超过 8 个算法应该循环使用颜色', () => {
      const tenAlgorithms = Array.from({ length: 10 }, (_, i) => ({
        name: `算法${i}`,
        complexity: 'O(n)',
      }))
      const { container } = render(<ComplexityChart algorithms={tenAlgorithms} showChart={false} />)
      const swatches = container.querySelectorAll('[role="listitem"] span[style]')
      const firstColor = (swatches[0] as HTMLElement).style.backgroundColor
      const ninthColor = (swatches[8] as HTMLElement).style.backgroundColor
      expect(firstColor).toBe(ninthColor)
    })
  })

  describe('图例', () => {
    it('应该渲染图例文本', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      expect(container.textContent).toContain('快速排序')
    })

    it('应该渲染多个图例项', () => {
      const { container } = render(<ComplexityChart algorithms={multipleAlgorithms} />)
      expect(container.textContent).toContain('冒泡排序')
      expect(container.textContent).toContain('快速排序')
      expect(container.textContent).toContain('二分查找')
    })

    it('图例应该包含复杂度信息（图表内联图例）', () => {
      const { container } = render(<ComplexityChart algorithms={multipleAlgorithms} />)
      expect(container.textContent).toContain('O(n²)')
      expect(container.textContent).toContain('O(n log n)')
      expect(container.textContent).toContain('O(log n)')
    })

    it('图例应该有 role=list', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const list = container.querySelector('[role="list"]')
      expect(list).toBeInTheDocument()
    })

    it('每个图例项应该有颜色色块', () => {
      const { container } = render(<ComplexityChart algorithms={multipleAlgorithms} showChart={false} />)
      const items = container.querySelectorAll('[role="listitem"]')
      expect(items.length).toBe(3)
      items.forEach((item) => {
        const swatch = item.querySelector('span[style]')
        expect(swatch).toBeInTheDocument()
      })
    })

    it('showLegend=false 应该隐藏图例', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} showLegend={false} />)
      const list = container.querySelector('[role="list"]')
      expect(list).not.toBeInTheDocument()
    })
  })

  describe('表格视图', () => {
    it('有 timeComplexity 时应该渲染表格', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })

    it('无 timeComplexity 时不应渲染表格', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} showChart={false} />)
      const table = container.querySelector('table')
      expect(table).not.toBeInTheDocument()
    })

    it('showTable=true 应该强制显示表格', () => {
      const { container } = render(
        <ComplexityChart algorithms={singleAlgorithm} showChart={false} showTable={true} />
      )
      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })

    it('showTable=false 应该隐藏表格', () => {
      const { container } = render(
        <ComplexityChart algorithms={tableAlgorithms} showChart={false} showTable={false} />
      )
      const table = container.querySelector('table')
      expect(table).not.toBeInTheDocument()
    })

    it('表格应该显示算法名称', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      expect(container.textContent).toContain('BFS')
      expect(container.textContent).toContain('DFS')
      expect(container.textContent).toContain('Dijkstra')
    })

    it('表格应该显示时间复杂度', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      expect(container.textContent).toContain('O(V+E)')
      expect(container.textContent).toContain('O((V+E)logV)')
    })

    it('表格应该显示空间复杂度', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      expect(container.textContent).toContain('O(V)')
    })

    it('表格应该显示描述', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      expect(container.textContent).toContain('广度优先搜索')
      expect(container.textContent).toContain('深度优先搜索')
      expect(container.textContent).toContain('最短路径算法')
    })

    it('表格行数应该等于算法数', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      const rows = container.querySelectorAll('tbody tr')
      expect(rows.length).toBe(3)
    })

    it('表格应该有表头行', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      const headerRow = container.querySelector('thead tr')
      expect(headerRow).toBeInTheDocument()
      const headers = container.querySelectorAll('th')
      expect(headers.length).toBeGreaterThanOrEqual(3)
    })

    it('表格每行应该有颜色色块', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      const rows = container.querySelectorAll('tbody tr')
      rows.forEach((row) => {
        const swatch = row.querySelector('span[style]')
        expect(swatch).toBeInTheDocument()
      })
    })

    it('表格色块颜色应该与图例颜色一致', () => {
      const { container } = render(<ComplexityChart algorithms={tableAlgorithms} showChart={false} />)
      const legendSwatches = container.querySelectorAll('[role="listitem"] span[style]')
      const tableSwatches = container.querySelectorAll('tbody tr span[style]')
      expect(legendSwatches.length).toBe(3)
      expect(tableSwatches.length).toBe(3)
      for (let i = 0; i < 3; i++) {
        const legendColor = (legendSwatches[i] as HTMLElement).style.backgroundColor
        const tableColor = (tableSwatches[i] as HTMLElement).style.backgroundColor
        expect(tableColor).toBe(legendColor)
      }
    })

    it('无 spaceComplexity 时应该显示 —', () => {
      const noSpace = [
        { name: '算法A', complexity: 'O(n)', timeComplexity: 'O(n)' },
      ]
      const { container } = render(<ComplexityChart algorithms={noSpace} showChart={false} />)
      expect(container.textContent).toContain('—')
    })

    it('无 description 时不应该显示描述列', () => {
      const noDesc = [
        { name: '算法A', complexity: 'O(n)', timeComplexity: 'O(n)', spaceComplexity: 'O(1)' },
      ]
      const { container } = render(<ComplexityChart algorithms={noDesc} showChart={false} />)
      const headers = container.querySelectorAll('th')
      const headerTexts = Array.from(headers).map((h) => h.textContent)
      expect(headerTexts).not.toContain('complexityChart.description')
    })
  })

  describe('空数据', () => {
    it('应该渲染空算法数组', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      const wrapper = container.querySelector('.w-full')
      expect(wrapper).toBeInTheDocument()
    })

    it('空算法数组不应渲染路径', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBe(0)
    })

    it('空算法数组应该显示空状态消息', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      expect(container.textContent).toContain('complexityChart.empty')
    })

    it('空算法数组不应渲染表格', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      const table = container.querySelector('table')
      expect(table).not.toBeInTheDocument()
    })

    it('空算法数组不应渲染 SVG', () => {
      const { container } = render(<ComplexityChart algorithms={[]} />)
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
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

  describe('showChart 控制', () => {
    it('showChart=false 应该隐藏 SVG', () => {
      const { container } = render(
        <ComplexityChart algorithms={singleAlgorithm} showChart={false} showTable={true} />
      )
      const svg = container.querySelector('svg')
      expect(svg).not.toBeInTheDocument()
    })

    it('showChart=false 不应渲染路径', () => {
      const { container } = render(
        <ComplexityChart algorithms={singleAlgorithm} showChart={false} showTable={true} />
      )
      const paths = container.querySelectorAll('path')
      expect(paths.length).toBe(0)
    })

    it('showChart=true 默认应该渲染 SVG', () => {
      const { container } = render(<ComplexityChart algorithms={singleAlgorithm} />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })
})
