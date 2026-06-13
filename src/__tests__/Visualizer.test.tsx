import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Visualizer from '../components/Visualizer'
import { useTheme } from '../hooks/useTheme'
import { startFPSMonitoring, stopFPSMonitoring } from '../utils/animationEngine'

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({ resolved: 'light' })),
}))

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

vi.mock('../utils/animationEngine', () => ({
  startFPSMonitoring: vi.fn(),
  stopFPSMonitoring: vi.fn(),
  measureRender: vi.fn((_label: string, fn: () => void) => fn()),
  setAnimationSpeed: vi.fn(),
  getAnimationSpeed: vi.fn(() => 1),
  setSkipAnimation: vi.fn(),
  getSkipAnimation: vi.fn(() => false),
  createAnimation: vi.fn(() => ({
    promise: Promise.resolve(),
    abort: vi.fn(),
    isAborted: vi.fn(() => false),
    resolve: vi.fn(),
    reject: vi.fn(),
  })),
  duration: vi.fn((ms: number) => ms),
  getPerformanceMode: vi.fn(() => 'normal'),
  getPerformanceFactor: vi.fn(() => 1),
  EASING: {},
  ANIMATION_PRESETS: {},
  applyPreset: vi.fn(),
  getCurrentPreset: vi.fn(() => 'default'),
}))

function createMockSVGRef(): React.RefObject<SVGSVGElement> {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  return { current: svg } as React.RefObject<SVGSVGElement>
}

function createMockDivRef(): React.RefObject<HTMLDivElement> {
  const div = document.createElement('div')
  return { current: div } as React.RefObject<HTMLDivElement>
}

const mockData = [10, 20, 30, 40, 50]
const mockRenderFn = vi.fn((_svg: SVGSVGElement, _data: any, _dims: any) => {
  // no-op render for snapshot testing
})
const mockDimensions = { width: 800, height: 400 }

describe('Visualizer', () => {
  let svgRef: React.RefObject<SVGSVGElement>
  let containerRef: React.RefObject<HTMLDivElement>

  beforeEach(() => {
    svgRef = createMockSVGRef()
    containerRef = createMockDivRef()
    vi.clearAllMocks()
  })

  // ============================================================
  // Snapshot Tests
  // ============================================================
  describe('Snapshots', () => {
    it('should render default visualizer with grid visible', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet')
      expect(container.textContent).toContain('100%')
      expect(container.textContent).toContain('#')

      // Snapshot the full DOM structure
      expect(container.innerHTML).toMatchSnapshot()
      unmount()
    })

    it('should render with custom className', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
          className="custom-visualizer"
        />
      )

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-visualizer')
      unmount()
    })

    it('should render zoom at 100% by default', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(container.textContent).toContain('100%')
      unmount()
    })

    it('should render with empty data', () => {
      const { container, unmount } = render(
        <Visualizer
          data={[]}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(container.querySelector('svg')).toBeInTheDocument()
      unmount()
    })

    it('should render with large dimensions', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={{ width: 1920, height: 1080 }}
          containerRef={containerRef}
        />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      unmount()
    })
  })

  // ============================================================
  // Zoom Controls
  // ============================================================
  describe('Zoom Controls', () => {
    it('should display zoom percentage', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(container.textContent).toContain('100%')
      unmount()
    })

    it('should zoom in when + button clicked', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const zoomInBtn = screen.getByText('+')
      fireEvent.click(zoomInBtn)

      expect(container.textContent).toContain('110%')
      unmount()
    })

    it('should zoom out when − button clicked', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const zoomOutBtn = screen.getByText('−')
      fireEvent.click(zoomOutBtn)

      expect(container.textContent).toContain('90%')
      unmount()
    })

    it('should not zoom below minimum (50%)', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const zoomOutBtn = screen.getByText('−')
      // Click many times to try going below 50%
      for (let i = 0; i < 10; i++) {
        fireEvent.click(zoomOutBtn)
      }

      expect(container.textContent).toContain('50%')

      // Button should be disabled at minimum
      expect(zoomOutBtn).toBeDisabled()
      unmount()
    })

    it('should not zoom above maximum (200%)', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const zoomInBtn = screen.getByText('+')
      // Click many times to try going above 200%
      for (let i = 0; i < 15; i++) {
        fireEvent.click(zoomInBtn)
      }

      expect(container.textContent).toContain('200%')

      // Button should be disabled at maximum
      expect(zoomInBtn).toBeDisabled()
      unmount()
    })
  })

  // ============================================================
  // Grid Toggle
  // ============================================================
  describe('Grid Toggle', () => {
    it('should show grid by default', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const gridBtn = screen.getByText('#')
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('dot-grid')
      expect(gridBtn.getAttribute('title')).toBe('visualizer.hideGrid')
      unmount()
    })

    it('should toggle grid when # button clicked', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const gridBtn = screen.getByText('#')
      fireEvent.click(gridBtn)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).not.toContain('dot-grid')
      expect(gridBtn.getAttribute('title')).toBe('visualizer.showGrid')
      unmount()
    })

    it('should toggle grid back on after two clicks', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const gridBtn = screen.getByText('#')
      fireEvent.click(gridBtn)
      fireEvent.click(gridBtn)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('dot-grid')
      unmount()
    })
  })

  // ============================================================
  // SVG Rendering
  // ============================================================
  describe('SVG Rendering', () => {
    it('should render SVG element with viewBox', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
      expect(svg?.getAttribute('viewBox')).toBeTruthy()
      expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet')
      unmount()
    })

    it('should update viewBox on zoom change', () => {
      const { container, unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const initialViewBox = container.querySelector('svg')?.getAttribute('viewBox')

      const zoomInBtn = screen.getByText('+')
      fireEvent.click(zoomInBtn)

      const newViewBox = container.querySelector('svg')?.getAttribute('viewBox')
      expect(newViewBox).not.toBe(initialViewBox)
      unmount()
    })

    it('should call renderFn with data and dimensions', () => {
      render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.any(SVGElement),
        mockData,
        expect.objectContaining({
          width: 800,
          height: 400,
          isDark: false,
        })
      )
    })

    it('should pass isDark when dark theme is active', () => {
      ;(useTheme as any).mockReturnValue({ resolved: 'dark' })

      render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(mockRenderFn).toHaveBeenCalledWith(
        expect.any(SVGElement),
        mockData,
        expect.objectContaining({ isDark: true })
      )

      ;(useTheme as any).mockReturnValue({ resolved: 'light' })
    })
  })

  // ============================================================
  // Control Buttons Rendering
  // ============================================================
  describe('Control Buttons', () => {
    it('should render all 3 control buttons', () => {
      render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(screen.getByText('#')).toBeInTheDocument()
      expect(screen.getByText('−')).toBeInTheDocument()
      expect(screen.getByText('+')).toBeInTheDocument()
    })

    it('should render zoom percentage display', () => {
      render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      const zoomDisplay = screen.getByText('100%')
      expect(zoomDisplay).toBeInTheDocument()
    })
  })

  // ============================================================
  // Lifecycle
  // ============================================================
  describe('Lifecycle', () => {
    it('should start FPS monitoring on mount', () => {
      const { unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      expect(startFPSMonitoring).toHaveBeenCalledTimes(1)
      unmount()
    })

    it('should stop FPS monitoring on unmount', () => {
      const { unmount } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )

      unmount()

      expect(stopFPSMonitoring).toHaveBeenCalledTimes(1)
    })
  })

  // ============================================================
  // Responsive Min-Height (P1-2a)
  // ============================================================
  describe('Responsive Min-Height', () => {
    it('应使用响应式最小高度而非固定 400px', () => {
      const { container } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )
      const wrapper = container.firstChild as HTMLElement
      // 应包含 sm: 和 lg: 响应式断点
      expect(wrapper.className).toContain('sm:min-h-')
      expect(wrapper.className).toContain('lg:min-h-')
      // 移动端基准应是 200px 而非 400px
      expect(wrapper.className).toContain('min-h-[200px]')
    })

    it('应保留 flex-1 和 overflow-hidden 基础类', () => {
      const { container } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('flex-1')
      expect(wrapper.className).toContain('overflow-hidden')
      expect(wrapper.className).toContain('relative')
    })

    it('应保留边框样式', () => {
      const { container } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('border-b-2')
    })

    it('应正确合并自定义 className', () => {
      const { container } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
          className="extra-class"
        />
      )
      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('extra-class')
      expect(wrapper.className).toContain('sm:min-h-')
    })
  })

  // ============================================================
  // Zoom Controls Touch Targets (P1-2c)
  // ============================================================
  describe('Zoom Controls Touch Targets', () => {
    it('缩放按钮应有移动端触摸友好尺寸', () => {
      const { container } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )
      const zoomInBtn = screen.getByText('+')
      const zoomOutBtn = screen.getByText('−')
      // 移动端 w-9 h-9 = 36px，加上 sm: 断点缩小到桌面端
      expect(zoomInBtn.className).toContain('w-9')
      expect(zoomInBtn.className).toContain('h-9')
      expect(zoomOutBtn.className).toContain('w-9')
      expect(zoomOutBtn.className).toContain('h-9')
    })

    it('网格切换按钮应有移动端触摸友好尺寸', () => {
      const { container } = render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )
      const gridBtn = screen.getByText('#')
      expect(gridBtn.className).toContain('w-9')
      expect(gridBtn.className).toContain('h-9')
      expect(gridBtn.className).toContain('sm:w-7')
      expect(gridBtn.className).toContain('sm:h-7')
    })

    it('缩放按钮应有 touch-manipulation', () => {
      render(
        <Visualizer
          data={mockData}
          renderFn={mockRenderFn}
          svgRef={svgRef}
          dimensions={mockDimensions}
          containerRef={containerRef}
        />
      )
      const zoomInBtn = screen.getByText('+')
      const zoomOutBtn = screen.getByText('−')
      expect(zoomInBtn.className).toContain('touch-manipulation')
      expect(zoomOutBtn.className).toContain('touch-manipulation')
    })
  })
})