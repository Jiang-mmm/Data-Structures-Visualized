import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import NetworkStatus from '../components/NetworkStatus'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('NetworkStatus', () => {
  let onlineHandler: (() => void) | null = null
  let offlineHandler: (() => void) | null = null

  beforeEach(() => {
    vi.clearAllMocks()
    onlineHandler = null
    offlineHandler = null

    vi.spyOn(window, 'addEventListener').mockImplementation((event: string, handler: any) => {
      if (event === 'online') onlineHandler = handler
      if (event === 'offline') offlineHandler = handler
    })
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {})

    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('在线状态时不应渲染任何内容', () => {
    const { container } = render(<NetworkStatus />)
    expect(container.firstChild).toBeNull()
  })

  it('离线时应显示离线提示', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true })
    render(<NetworkStatus />)
    expect(screen.getByText(/network\.offline/)).toBeInTheDocument()
    expect(screen.getByText(/network\.offlineMode/)).toBeInTheDocument()
  })

  it('触发 offline 事件应显示离线提示', () => {
    render(<NetworkStatus />)
    act(() => {
      offlineHandler?.()
    })
    expect(screen.getByText(/network\.offline/)).toBeInTheDocument()
  })

  it('触发 online 事件应显示恢复提示', () => {
    render(<NetworkStatus />)
    act(() => {
      offlineHandler?.()
    })
    act(() => {
      onlineHandler?.()
    })
    expect(screen.getByText(/network\.reconnected/)).toBeInTheDocument()
  })

  it('恢复提示应有成功样式', () => {
    render(<NetworkStatus />)
    act(() => {
      offlineHandler?.()
    })
    act(() => {
      onlineHandler?.()
    })
    const el = screen.getByText(/network\.reconnected/).closest('div')
    expect(el?.className).toContain('bg-accent-emerald')
  })

  it('离线提示应有错误样式', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true })
    render(<NetworkStatus />)
    const el = screen.getByText(/network\.offline/).closest('div')
    expect(el?.className).toContain('bg-accent-rose')
  })
})
