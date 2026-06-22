import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { createRef } from 'react'

// Mocks
vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

vi.mock('../../components/toastStore', () => ({
  showToast: vi.fn(),
}))

vi.mock('../../utils/animationExport', () => ({
  exportAnimationWebM: vi.fn(),
  exportAnimationGIF: vi.fn(),
  exportAnimationFrames: vi.fn(),
  isAnimationExportSupported: vi.fn(() => ({ webm: true, gif: true, frames: true })),
}))

import AnimationExportButton from '../../components/AnimationExportButton'
import { showToast } from '../../components/toastStore'
import { exportAnimationWebM, exportAnimationGIF, exportAnimationFrames, isAnimationExportSupported } from '../../utils/animationExport'

const mockExportWebM = exportAnimationWebM as ReturnType<typeof vi.fn>
const mockExportGIF = exportAnimationGIF as ReturnType<typeof vi.fn>
const mockExportFrames = exportAnimationFrames as ReturnType<typeof vi.fn>
const mockIsSupported = isAnimationExportSupported as ReturnType<typeof vi.fn>
const mockShowToast = showToast as ReturnType<typeof vi.fn>

function makeSvg() {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  return svg
}

describe('AnimationExportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSupported.mockReturnValue({ webm: true, gif: true, frames: true })
  })

  it('应该渲染触发按钮', () => {
    const svgRef = createRef<SVGSVGElement>()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    expect(screen.getByRole('button', { name: 'exportAnimation.label' })).toBeTruthy()
  })

  it('disabled 时按钮应该禁用', () => {
    const svgRef = createRef<SVGSVGElement>()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} disabled />)
    expect(screen.getByRole('button', { name: 'exportAnimation.label' })).toBeDisabled()
  })

  it('点击主按钮应该展开菜单', () => {
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    expect(screen.getByRole('menuitem', { name: /exportAnimation\.webm/ })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /exportAnimation\.gif/ })).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: /exportAnimation\.frames/ })).toBeTruthy()
  })

  it('点击 WebM 菜单项应该调用 exportAnimationWebM', async () => {
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /exportAnimation\.webm/ }))
    await waitFor(() => {
      expect(mockExportWebM).toHaveBeenCalled()
    })
    expect(mockExportWebM.mock.calls[0][0]).toBe(svgRef)
    expect(mockExportWebM.mock.calls[0][1]).toBe(800)
    expect(mockExportWebM.mock.calls[0][2]).toBe(400)
  })

  it('点击 GIF 菜单项应该调用 exportAnimationGIF', async () => {
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /exportAnimation\.gif/ }))
    await waitFor(() => {
      expect(mockExportGIF).toHaveBeenCalled()
    })
  })

  it('点击帧序列菜单项应该调用 exportAnimationFrames', async () => {
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /exportAnimation\.frames/ }))
    await waitFor(() => {
      expect(mockExportFrames).toHaveBeenCalled()
    })
  })

  it('所有格式都不支持时点击按钮应该弹出 unsupported 提示', () => {
    mockIsSupported.mockReturnValue({ webm: false, gif: false, frames: false })
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'error', message: 'exportAnimation.unsupported' })
    )
  })

  it('WebM 不支持时点击 WebM 菜单项应该显示错误', async () => {
    mockIsSupported.mockReturnValue({ webm: false, gif: true, frames: true })
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(<AnimationExportButton svgRef={svgRef} width={800} height={400} />)
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    fireEvent.click(screen.getByRole('menuitem', { name: /exportAnimation\.webm/ }))
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })

  it('菜单打开后点击外部应该关闭菜单', () => {
    const svgRef = createRef<SVGSVGElement>()
    svgRef.current = makeSvg()
    render(
      <div>
        <AnimationExportButton svgRef={svgRef} width={800} height={400} />
        <div data-testid="outside">outside</div>
      </div>
    )
    fireEvent.click(screen.getByRole('button', { name: 'exportAnimation.label' }))
    expect(screen.queryByRole('menuitem', { name: /exportAnimation\.webm/ })).toBeTruthy()
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(screen.queryByRole('menuitem', { name: /exportAnimation\.webm/ })).toBeNull()
  })
})
