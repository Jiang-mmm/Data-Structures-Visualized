import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render } from '@testing-library/react'
import Visualizer from '../../components/Visualizer'

vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({ resolved: 'light' })),
}))

vi.mock('../../hooks/useColorTheme', () => ({
  useColorTheme: vi.fn(() => ({ theme: 'default' })),
}))

vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

vi.mock('../../utils/animationEngine', () => ({
  measureRender: vi.fn((_label: string, fn: () => void) => fn()),
}))

const mockData = [10, 20, 30]
const mockRenderFn = vi.fn((_svg: SVGSVGElement, _data: unknown, _dims: { width: number; height: number; isDark?: boolean }) => {})

function createMockSVGRef(): React.RefObject<SVGSVGElement | null> {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  return { current: svg } as React.RefObject<SVGSVGElement | null>
}

function createMockDivRef(): React.RefObject<HTMLDivElement | null> {
  const div = document.createElement('div')
  return { current: div } as React.RefObject<HTMLDivElement | null>
}

function renderVisualizer(props: Partial<React.ComponentProps<typeof Visualizer>> = {}) {
  const svgRef = createMockSVGRef()
  const containerRef = createMockDivRef()
  const result = render(
    <Visualizer
      data={mockData}
      renderFn={mockRenderFn}
      svgRef={svgRef}
      containerRef={containerRef}
      dimensions={{ width: 800, height: 400 }}
      {...props}
    />
  )
  return { ...result, svgRef, containerRef }
}

describe('Visualizer responsive re-render', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls renderFn on mount with dimensions', () => {
    renderVisualizer()

    expect(mockRenderFn).toHaveBeenCalledTimes(1)
    expect(mockRenderFn).toHaveBeenCalledWith(
      expect.any(SVGElement),
      mockData,
      expect.objectContaining({ width: 800, height: 400, isDark: false })
    )
  })

  it('re-calls renderFn when dimensions change while not animating', () => {
    const { rerender, svgRef, containerRef } = renderVisualizer()

    expect(mockRenderFn).toHaveBeenCalledTimes(1)

    rerender(
      <Visualizer
        data={mockData}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 600, height: 300 }}
      />
    )

    expect(mockRenderFn).toHaveBeenCalledTimes(2)
    expect(mockRenderFn).toHaveBeenLastCalledWith(
      expect.any(SVGElement),
      mockData,
      expect.objectContaining({ width: 600, height: 300, isDark: false })
    )
  })

  it('does not re-call renderFn when dimensions change during animation, then renders once when animation ends', () => {
    const { rerender, svgRef, containerRef } = renderVisualizer()

    expect(mockRenderFn).toHaveBeenCalledTimes(1)

    rerender(
      <Visualizer
        data={mockData}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 600, height: 300 }}
        isAnimating={true}
      />
    )

    expect(mockRenderFn).toHaveBeenCalledTimes(1)

    rerender(
      <Visualizer
        data={mockData}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 600, height: 300 }}
        isAnimating={false}
      />
    )

    expect(mockRenderFn).toHaveBeenCalledTimes(2)
  })

  it('still renders immediately when data changes during animation', () => {
    const { rerender, svgRef, containerRef } = renderVisualizer()
    const newData = [40, 50, 60]

    rerender(
      <Visualizer
        data={newData}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 800, height: 400 }}
        isAnimating={true}
      />
    )

    expect(mockRenderFn).toHaveBeenCalledTimes(2)
    expect(mockRenderFn).toHaveBeenLastCalledWith(
      expect.any(SVGElement),
      newData,
      expect.objectContaining({ width: 800, height: 400, isDark: false })
    )
  })
})
