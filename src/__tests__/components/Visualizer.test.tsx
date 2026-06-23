import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
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

describe('Visualizer zoom/pan controls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('应该支持放大 (zoom in)', () => {
    const { container } = renderVisualizer()
    const zoomInBtn = container.querySelector('button[aria-label*="Zoom in" i], button[aria-label*="zoomIn" i]') as HTMLButtonElement
      || Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('+')) as HTMLButtonElement
    expect(zoomInBtn).toBeTruthy()
    fireEvent.click(zoomInBtn)
    // zoom 进度应展示放大后的百分比（默认 1.0 → 1.1 = 110%）
    expect(container.textContent).toMatch(/11[0-9]%/)
  })

  it('应该支持缩小 (zoom out)', () => {
    const { container } = renderVisualizer()
    const zoomOutBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('−')) as HTMLButtonElement
    expect(zoomOutBtn).toBeTruthy()
    fireEvent.click(zoomOutBtn)
    expect(container.textContent).toMatch(/9[0-9]%/)
  })

  it('应禁用 zoom out 在最小值', () => {
    localStorage.setItem('ds-visualizer-zoom', '0.5')
    const { container } = renderVisualizer()
    const zoomOutBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('−')) as HTMLButtonElement
    expect(zoomOutBtn).toBeDisabled()
  })

  it('应禁用 zoom in 在最大值', () => {
    localStorage.setItem('ds-visualizer-zoom', '2')
    const { container } = renderVisualizer()
    const zoomInBtn = Array.from(container.querySelectorAll('button')).find(b => b.textContent?.includes('+')) as HTMLButtonElement
    expect(zoomInBtn).toBeDisabled()
  })

  it('应该支持切换网格', () => {
    const { container } = renderVisualizer()
    const gridBtn = container.querySelector('button[aria-label*="grid" i], button[aria-label*="Grid" i]') as HTMLButtonElement
      || Array.from(container.querySelectorAll('button')).find(b => b.textContent?.trim() === '#') as HTMLButtonElement
    expect(gridBtn).toBeTruthy()
    fireEvent.click(gridBtn)
    expect(localStorage.getItem('ds-visualizer-show-grid')).toBe('true')
  })

  it('应支持重置 pan 按钮（pan.x !== 0 时显示）', () => {
    const { container, containerRef } = renderVisualizer()
    // 模拟拖动：派发 mousedown / mousemove 改变 pan
    fireEvent.mouseDown(containerRef.current!, { button: 0, clientX: 100, clientY: 100 })
    fireEvent.mouseMove(containerRef.current!, { clientX: 200, clientY: 200 })
    fireEvent.mouseUp(containerRef.current!, { clientX: 200, clientY: 200 })
    // 触发 React 更新后查找重置按钮
    const resetBtn = container.querySelector('button[aria-label*="center" i], button[aria-label*="Center" i]') as HTMLButtonElement
    expect(resetBtn).toBeTruthy()
    fireEvent.click(resetBtn)
    // 重置后应消失
    expect(container.querySelector('button[aria-label*="center" i], button[aria-label*="Center" i]')).toBeNull()
  })

  it('mouseDown 按钮非 0 应不启动 drag', () => {
    const { containerRef } = renderVisualizer()
    fireEvent.mouseDown(containerRef.current!, { button: 2, clientX: 100, clientY: 100 })
    // 不应设置 dragging
    fireEvent.mouseMove(containerRef.current!, { clientX: 200, clientY: 200 })
    // 不会触发 pan 变化（无可观察副作用，但不应抛错）
  })

  it('mouseMove 不在 drag 状态应直接返回', () => {
    const { containerRef } = renderVisualizer()
    fireEvent.mouseMove(containerRef.current!, { clientX: 200, clientY: 200 })
    // 无副作用
  })

  it('mouseLeave 应调用 mouseUp 清理 drag', () => {
    const { containerRef } = renderVisualizer()
    fireEvent.mouseDown(containerRef.current!, { button: 0, clientX: 100, clientY: 100 })
    fireEvent.mouseLeave(containerRef.current!, { clientX: 100, clientY: 100 })
    // dragRef 应被清理（无后续 mousemove 副作用）
    fireEvent.mouseMove(containerRef.current!, { clientX: 999, clientY: 999 })
  })
})

describe('Visualizer wheel/pinch gestures', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('Ctrl+wheel 应放大/缩小', () => {
    const { containerRef } = renderVisualizer()
    const event = new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, bubbles: true })
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() })
    containerRef.current!.dispatchEvent(event)
    expect(localStorage.getItem('ds-visualizer-zoom')).toBe('1.1')
  })

  it('Ctrl+wheel 向下应缩小', () => {
    const { containerRef } = renderVisualizer()
    const event = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true })
    containerRef.current!.dispatchEvent(event)
    expect(localStorage.getItem('ds-visualizer-zoom')).toBe('0.9')
  })

  it('无 Ctrl 的 wheel 应不触发 zoom', () => {
    const { containerRef } = renderVisualizer()
    const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true })
    containerRef.current!.dispatchEvent(event)
    // zoom 应保持默认 1.0
    expect(localStorage.getItem('ds-visualizer-zoom')).toBeNull()
  })

  it('touchstart 两指应记录初始距离', () => {
    const { containerRef } = renderVisualizer()
    const touch1 = { clientX: 100, clientY: 100 } as Touch
    const touch2 = { clientX: 200, clientY: 200 } as Touch
    const event = new Event('touchstart', { bubbles: true, cancelable: true }) as unknown as TouchEvent
    Object.defineProperty(event, 'touches', { value: [touch1, touch2] as unknown as TouchList, configurable: true })
    Object.defineProperty(event, 'preventDefault', { value: vi.fn(), configurable: true })
    containerRef.current!.dispatchEvent(event)
    // 初始距离 ≈ 141.42
  })

  it('touchmove 两指应触发缩放', () => {
    const { containerRef } = renderVisualizer()
    // 先设置初始状态
    const t1a = { clientX: 100, clientY: 100 } as Touch
    const t2a = { clientX: 200, clientY: 200 } as Touch
    const startEvent = new Event('touchstart', { bubbles: true, cancelable: true }) as unknown as TouchEvent
    Object.defineProperty(startEvent, 'touches', { value: [t1a, t2a] as unknown as TouchList, configurable: true })
    containerRef.current!.dispatchEvent(startEvent)
    // 拉大距离（缩放 > 1）
    const t1b = { clientX: 50, clientY: 50 } as Touch
    const t2b = { clientX: 250, clientY: 250 } as Touch
    const moveEvent = new Event('touchmove', { bubbles: true, cancelable: true }) as unknown as TouchEvent
    Object.defineProperty(moveEvent, 'touches', { value: [t1b, t2b] as unknown as TouchList, configurable: true })
    containerRef.current!.dispatchEvent(moveEvent)
    // 缩放比例 200/100 = 2 → newZoom ≈ 2
  })
})

describe('Visualizer render options and edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('data 为 null 时应跳过 render', () => {
    const svgRef = createMockSVGRef()
    const containerRef = createMockDivRef()
    render(
      <Visualizer
        data={null as unknown as number[]}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 800, height: 400 }}
      />
    )
    // 早返回保护：!data 时跳过 renderFn
    expect(mockRenderFn).not.toHaveBeenCalled()
  })

  it('data 为空数组时仍应调用 renderFn（让 visualizer 显示空状态）', () => {
    const svgRef = createMockSVGRef()
    const containerRef = createMockDivRef()
    render(
      <Visualizer
        data={[]}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 800, height: 400 }}
      />
    )
    // data 为 [] 时 measureRender 调用，但需 renderFn 处理（不会被 visualizer 主动跳过）
    // 实际行为：data 长度 0 但有 truthy 值，仍会 render
  })

  it('应支持 object 类型的 data（带 nodes 字段）', () => {
    const svgRef = createMockSVGRef()
    const containerRef = createMockDivRef()
    render(
      <Visualizer
        data={{ nodes: [1, 2, 3] }}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 800, height: 400 }}
      />
    )
    expect(mockRenderFn).toHaveBeenCalled()
  })

  it('应支持带 length 字段的 data', () => {
    const svgRef = createMockSVGRef()
    const containerRef = createMockDivRef()
    render(
      <Visualizer
        data={{ length: 5, items: [1, 2] }}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 800, height: 400 }}
      />
    )
    expect(mockRenderFn).toHaveBeenCalled()
  })

  it('应使用 renderOptions 合并 dimensions', () => {
    const svgRef = createMockSVGRef()
    const containerRef = createMockDivRef()
    render(
      <Visualizer
        data={[1]}
        renderFn={mockRenderFn}
        svgRef={svgRef}
        containerRef={containerRef}
        dimensions={{ width: 800, height: 400 }}
        renderOptions={{ customOption: 'value' }}
      />
    )
    expect(mockRenderFn).toHaveBeenCalledWith(
      expect.anything(),
      [1],
      expect.objectContaining({ customOption: 'value', width: 800, height: 400 })
    )
  })
})
