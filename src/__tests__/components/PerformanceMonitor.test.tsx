import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import PerformanceMonitor from '../../components/PerformanceMonitor'

vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const mockGetCurrentFPS = vi.fn()
const mockStartFPSMonitoring = vi.fn()
const mockStopFPSMonitoring = vi.fn()
const mockGetMemoryInfo = vi.fn()

vi.mock('../../utils/animationEngine', () => ({
  getCurrentFPS: () => mockGetCurrentFPS(),
  startFPSMonitoring: () => mockStartFPSMonitoring(),
  stopFPSMonitoring: () => mockStopFPSMonitoring(),
}))

vi.mock('../../utils/performanceLogger', () => ({
  perfLogger: {
    getMemoryInfo: () => mockGetMemoryInfo(),
  },
}))

function pressCtrlShiftF() {
  // 触发全局快捷键：Ctrl+Shift+F
  fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: true })
}

describe('PerformanceMonitor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentFPS.mockReturnValue(60)
    mockGetMemoryInfo.mockReturnValue(null)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('默认不可见（无任何 DOM 节点）', () => {
    const { container } = render(<PerformanceMonitor />)
    expect(container.firstChild).toBeNull()
  })

  it('按下 Ctrl+Shift+F 后变为可见', () => {
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    expect(screen.getByText(/FPS/)).toBeInTheDocument()
  })

  it('可见时应调用 startFPSMonitoring', () => {
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    expect(mockStartFPSMonitoring).toHaveBeenCalled()
  })

  it('再次按下 Ctrl+Shift+F 应隐藏并停止 FPS 监控', () => {
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    act(() => { pressCtrlShiftF() })
    expect(mockStopFPSMonitoring).toHaveBeenCalled()
    expect(screen.queryByText(/FPS/)).not.toBeInTheDocument()
  })

  it('非 Ctrl+Shift+F 组合键不应触发切换', () => {
    render(<PerformanceMonitor />)
    act(() => { fireEvent.keyDown(window, { key: 'F', ctrlKey: false, shiftKey: true }) })
    act(() => { fireEvent.keyDown(window, { key: 'F', ctrlKey: true, shiftKey: false }) })
    expect(screen.queryByText(/FPS/)).not.toBeInTheDocument()
  })

  it('可见时点击按钮应展开详细面板', () => {
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    const btn = screen.getByRole('button', { expanded: false })
    act(() => { fireEvent.click(btn) })
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
  })

  it('展开面板应显示 FPS、JS Heap 等详情', async () => {
    mockGetMemoryInfo.mockReturnValue({ used: 50, total: 100, limit: 1024 })
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    // 等待 RAF tick 触发状态更新（RAF 在 setup.ts 中被 mock 为 setTimeout(cb, 16)）
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })
    const btn = screen.getByRole('button', { expanded: false })
    act(() => { fireEvent.click(btn) })
    expect(screen.getByText('performanceMonitor.jsHeap')).toBeInTheDocument()
    expect(screen.getByText('performanceMonitor.total')).toBeInTheDocument()
    expect(screen.getByText('performanceMonitor.limit')).toBeInTheDocument()
  })

  it('右键按钮应隐藏面板', () => {
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    const btn = screen.getByRole('button', { expanded: false })
    act(() => { fireEvent.contextMenu(btn) })
    expect(mockStopFPSMonitoring).toHaveBeenCalled()
    expect(screen.queryByText(/FPS/)).not.toBeInTheDocument()
  })

  it('卸载时应停止 FPS 监控', () => {
    const { unmount } = render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    unmount()
    expect(mockStopFPSMonitoring).toHaveBeenCalled()
  })

  it('FPS >= 50 时应显示 smooth 状态', async () => {
    mockGetCurrentFPS.mockReturnValue(60)
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })
    const btn = screen.getByRole('button', { expanded: false })
    act(() => { fireEvent.click(btn) })
    expect(screen.getByText('performanceMonitor.smooth')).toBeInTheDocument()
  })

  it('FPS 30-49 时应显示 fair 状态', async () => {
    mockGetCurrentFPS.mockReturnValue(40)
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })
    const btn = screen.getByRole('button', { expanded: false })
    act(() => { fireEvent.click(btn) })
    expect(screen.getByText('performanceMonitor.fair')).toBeInTheDocument()
  })

  it('FPS < 30 时应显示 low 状态', async () => {
    mockGetCurrentFPS.mockReturnValue(15)
    render(<PerformanceMonitor />)
    act(() => { pressCtrlShiftF() })
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 50))
    })
    const btn = screen.getByRole('button', { expanded: false })
    act(() => { fireEvent.click(btn) })
    expect(screen.getByText('performanceMonitor.low')).toBeInTheDocument()
  })
})
