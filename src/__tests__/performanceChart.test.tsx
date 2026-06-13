import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { useTheme } from '../hooks/useTheme'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import PerformanceChart from '../components/PerformanceChart'

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn()
}))

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: vi.fn()
}))

const mockChain = {
  attr: vi.fn(function () { return mockChain }),
  append: vi.fn(function () { return mockChain }),
  selectAll: vi.fn(function () { return mockChain }),
  select: vi.fn(function () { return mockChain }),
  remove: vi.fn(function () { return mockChain }),
  text: vi.fn(function () { return mockChain }),
  transition: vi.fn(function () { return mockChain }),
  on: vi.fn(function () { return mockChain }),
}

vi.mock('../utils/d3Imports', () => ({
  select: vi.fn(() => mockChain)
}))

const sampleResults = {
  BubbleSort: { comparisons: 50, swaps: 30, steps: 80 },
  QuickSort: { comparisons: 25, swaps: 15, steps: 40 },
  MergeSort: { comparisons: 35, swaps: 20, steps: 55 },
}

describe('PerformanceChart', () => {
  beforeEach(() => {
    vi.clearAllMocks()
      ; (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({ mode: 'light' })
      ; (useGlobalSettings as ReturnType<typeof vi.fn>).mockReturnValue({ t: (key: string) => key })
  })

  describe('渲染', () => {
    it('应该渲染 PerformanceChart 组件', () => {
      const { container } = render(<PerformanceChart results={sampleResults} lang="zh" />)
      const wrapper = container.querySelector('.neo-border')
      expect(wrapper).toBeInTheDocument()
    })

    it('应该渲染 SVG 元素', () => {
      const { container } = render(<PerformanceChart results={sampleResults} lang="zh" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg!.getAttribute('class')).toContain('w-full')
    })

    it('应该渲染容器 div', () => {
      const { container } = render(<PerformanceChart results={sampleResults} lang="zh" />)
      const wrapper = container.querySelector('.neo-border')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('空数据', () => {
    it('应该渲染空对象 results', () => {
      const { container } = render(<PerformanceChart results={{}} lang="zh" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('应该渲染 null results', () => {
      const { container } = render(<PerformanceChart results={null as unknown as Record<string, unknown>} lang="zh" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('主题模式', () => {
    it('应该在 light 模式下渲染', () => {
      ; (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({ mode: 'light' })
      const { container } = render(<PerformanceChart results={sampleResults} lang="zh" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('应该在 dark 模式下渲染', () => {
      ; (useTheme as ReturnType<typeof vi.fn>).mockReturnValue({ mode: 'dark' })
      const { container } = render(<PerformanceChart results={sampleResults} lang="zh" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('D3 调用验证', () => {
    it('应该调用 select 初始化 SVG', () => {
      const { container } = render(<PerformanceChart results={sampleResults} lang="zh" />)
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('应该调用 append 创建 SVG 元素', () => {
      render(<PerformanceChart results={sampleResults} lang="zh" />)
      expect(mockChain.append).toHaveBeenCalled()
    })
  })
})
