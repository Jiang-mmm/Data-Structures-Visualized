/**
 * Layout Ctrl+K 快捷键 + 卸载清理测试
 * 用于提升 src/components/Layout.tsx 覆盖率（基线 61.53% statements / 50% functions）
 * 覆盖：Ctrl+K 切换搜索、Cmd+K 切换搜索、卸载时移除 keydown listener
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}))

vi.mock('../components/KeyboardHelp', () => ({
  default: () => <div data-testid="keyboard-help">KeyboardHelp</div>,
}))

vi.mock('../components/PerformanceMonitor', () => ({
  default: () => <div data-testid="performance-monitor">PerformanceMonitor</div>,
}))

vi.mock('../components/NetworkStatus', () => ({
  default: () => <div data-testid="network-status">NetworkStatus</div>,
}))

const mockGlobalSearchState = vi.fn()
const mockGlobalSearchProps: { isOpen: boolean; onClose: (() => void) | null } = { isOpen: false, onClose: null }

vi.mock('../components/GlobalSearch', () => ({
  GlobalSearch: (props: { isOpen: boolean; onClose: () => void }) => {
    mockGlobalSearchProps.isOpen = props.isOpen
    mockGlobalSearchProps.onClose = props.onClose
    mockGlobalSearchState(props.isOpen)
    return <div data-testid="global-search" data-open={props.isOpen} />
  },
}))

describe('Layout Ctrl+K 快捷键', () => {
  let addSpy: ReturnType<typeof vi.spyOn>
  let removeSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mockGlobalSearchState.mockClear()
    mockGlobalSearchProps.isOpen = false
    mockGlobalSearchProps.onClose = null
    addSpy = vi.spyOn(window, 'addEventListener')
    removeSpy = vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    addSpy.mockRestore()
    removeSpy.mockRestore()
  })

  it('应注册 keydown 监听器', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )
    expect(addSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('应卸载时移除 keydown 监听器', () => {
    const { unmount } = render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )
    unmount()
    expect(removeSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
  })

  it('Ctrl+K 应切换 GlobalSearch 为打开', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )
    expect(mockGlobalSearchProps.isOpen).toBe(false)

    // 触发 Ctrl+K（用 act 包裹以同步刷新 React 19 状态）
    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true })
      window.dispatchEvent(event)
    })

    expect(mockGlobalSearchProps.isOpen).toBe(true)
  })

  it('Cmd+K 应切换 GlobalSearch 为打开', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
      window.dispatchEvent(event)
    })

    expect(mockGlobalSearchProps.isOpen).toBe(true)
  })

  it('再次 Ctrl+K 应关闭 GlobalSearch', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )

    // 第一次打开
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    })
    expect(mockGlobalSearchProps.isOpen).toBe(true)

    // 第二次关闭
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    })
    expect(mockGlobalSearchProps.isOpen).toBe(false)
  })

  it('其他键应不触发', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j', ctrlKey: true, bubbles: true }))
    })
    expect(mockGlobalSearchProps.isOpen).toBe(false)
  })

  it('无 Ctrl/Cmd 时按 K 不应触发', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true }))
    })
    expect(mockGlobalSearchProps.isOpen).toBe(false)
  })

  it('GlobalSearch onClose 应关闭搜索', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )

    // 打开
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))
    })
    expect(mockGlobalSearchProps.isOpen).toBe(true)

    // 通过 onClose 关闭
    act(() => {
      mockGlobalSearchProps.onClose?.()
    })
    expect(mockGlobalSearchProps.isOpen).toBe(false)
  })
})
