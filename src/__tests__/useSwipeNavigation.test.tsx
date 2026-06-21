import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useSwipeNavigation } from '../hooks/useSwipeNavigation'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function createWrapper(initialPath: string) {
  return ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
  )
}

function dispatchTouch(target: Document, type: 'touchstart' | 'touchend', touches: { clientX: number; clientY: number; identifier?: number }[], changedTouches?: { clientX: number; clientY: number; identifier?: number }[]) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as unknown as TouchEvent
  Object.defineProperty(event, 'touches', { value: touches.map(t => ({ identifier: 0, ...t })) })
  Object.defineProperty(event, 'changedTouches', { value: (changedTouches ?? touches).map(t => ({ identifier: 0, ...t })) })
  target.dispatchEvent(event)
  return event
}

describe('useSwipeNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('向左滑动应导航到下一页', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    // 起点在 /array（index 1），向左滑 → /stack（index 2）
    dispatchTouch(document, 'touchstart', [{ clientX: 200, clientY: 100 }])
    dispatchTouch(document, 'touchend', [], [{ clientX: 50, clientY: 100 }])

    expect(mockNavigate).toHaveBeenCalledWith('/stack')
  })

  it('向右滑动应导航到上一页', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/stack'),
    })

    // 起点在 /stack（index 2），向右滑 → /array（index 1）
    dispatchTouch(document, 'touchstart', [{ clientX: 50, clientY: 100 }])
    dispatchTouch(document, 'touchend', [], [{ clientX: 200, clientY: 100 }])

    expect(mockNavigate).toHaveBeenCalledWith('/array')
  })

  it('滑动距离不足不应触发导航', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    dispatchTouch(document, 'touchstart', [{ clientX: 200, clientY: 100 }])
    dispatchTouch(document, 'touchend', [], [{ clientX: 150, clientY: 100 }])

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('垂直滑动（滚动）不应触发导航', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    // 垂直位移远大于水平位移
    dispatchTouch(document, 'touchstart', [{ clientX: 100, clientY: 50 }])
    dispatchTouch(document, 'touchend', [], [{ clientX: 120, clientY: 300 }])

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('在首页向右滑动不应触发导航（已是第一页）', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/'),
    })

    dispatchTouch(document, 'touchstart', [{ clientX: 50, clientY: 100 }])
    dispatchTouch(document, 'touchend', [], [{ clientX: 200, clientY: 100 }])

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('在最后一页向左滑动不应触发导航（已是最后一页）', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/union-find'),
    })

    dispatchTouch(document, 'touchstart', [{ clientX: 200, clientY: 100 }])
    dispatchTouch(document, 'touchend', [], [{ clientX: 50, clientY: 100 }])

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('在交互元素（button）上滑动不应触发导航', () => {
    const button = document.createElement('button')
    document.body.appendChild(button)

    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    const event = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent
    Object.defineProperty(event, 'touches', { value: [{ clientX: 200, clientY: 100, identifier: 0 }] })
    Object.defineProperty(event, 'changedTouches', { value: [{ clientX: 200, clientY: 100, identifier: 0 }] })
    button.dispatchEvent(event)

    const endEvent = new Event('touchend', { bubbles: true }) as unknown as TouchEvent
    Object.defineProperty(endEvent, 'touches', { value: [] })
    Object.defineProperty(endEvent, 'changedTouches', { value: [{ clientX: 50, clientY: 100, identifier: 0 }] })
    button.dispatchEvent(endEvent)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('在 SVG 可视化区域上滑动不应触发导航', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    document.body.appendChild(svg)

    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    const event = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent
    Object.defineProperty(event, 'touches', { value: [{ clientX: 200, clientY: 100, identifier: 0 }] })
    Object.defineProperty(event, 'changedTouches', { value: [{ clientX: 200, clientY: 100, identifier: 0 }] })
    svg.dispatchEvent(event)

    const endEvent = new Event('touchend', { bubbles: true }) as unknown as TouchEvent
    Object.defineProperty(endEvent, 'touches', { value: [] })
    Object.defineProperty(endEvent, 'changedTouches', { value: [{ clientX: 50, clientY: 100, identifier: 0 }] })
    svg.dispatchEvent(endEvent)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('在 Sidebar 区域上滑动不应触发导航', () => {
    const aside = document.createElement('aside')
    aside.setAttribute('data-sidebar', '')
    document.body.appendChild(aside)

    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    const event = new Event('touchstart', { bubbles: true }) as unknown as TouchEvent
    Object.defineProperty(event, 'touches', { value: [{ clientX: 200, clientY: 100, identifier: 0 }] })
    Object.defineProperty(event, 'changedTouches', { value: [{ clientX: 200, clientY: 100, identifier: 0 }] })
    aside.dispatchEvent(event)

    const endEvent = new Event('touchend', { bubbles: true }) as unknown as TouchEvent
    Object.defineProperty(endEvent, 'touches', { value: [] })
    Object.defineProperty(endEvent, 'changedTouches', { value: [{ clientX: 50, clientY: 100, identifier: 0 }] })
    aside.dispatchEvent(endEvent)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('多指触摸不应触发导航', () => {
    renderHook(() => useSwipeNavigation(), {
      wrapper: createWrapper('/array'),
    })

    dispatchTouch(document, 'touchstart', [
      { clientX: 200, clientY: 100 },
      { clientX: 210, clientY: 110 },
    ])
    dispatchTouch(document, 'touchend', [], [{ clientX: 50, clientY: 100 }])

    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
