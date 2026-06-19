import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn().mockReturnValue({ mode: 'light', cycle: vi.fn() }),
}))

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: vi.fn().mockReturnValue({
    t: (key: string) => key,
    lang: 'zh',
    animationSpeed: 1,
    setAnimationSpeed: vi.fn(),
    showIndices: true,
    setShowIndices: vi.fn(),
    cycleSpeed: 1,
    currentPreset: 'default',
    applyPreset: vi.fn(),
    setLanguage: vi.fn(),
    theme: 'default',
  }),
}))

vi.mock('../utils/themeColors', () => ({
  getAvailableThemes: vi.fn().mockReturnValue([]),
  setTheme: vi.fn(),
  getTheme: vi.fn().mockReturnValue('default'),
  initTheme: vi.fn(),
  initThemeColors: vi.fn(),
  subscribeTheme: vi.fn().mockReturnValue(() => {}),
}))

vi.mock('../hooks/useColorTheme', () => ({
  useColorTheme: vi.fn().mockReturnValue({
    theme: 'default',
    setTheme: vi.fn(),
    themes: [],
  }),
}))

function renderSidebar() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Sidebar />
    </MemoryRouter>
  )
}

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该渲染导航列表', () => {
      renderSidebar()
      const nav = screen.getByRole('navigation')
      expect(nav).toBeTruthy()
    })

    it('应该包含语言切换按钮', () => {
      renderSidebar()
      const langButton = screen.getByLabelText(/langTooltip/)
      expect(langButton).toBeTruthy()
    })
  })

  describe('导航链接', () => {
    it('应该渲染所有数据结构导航链接', () => {
      const { container } = renderSidebar()
      const links = container.querySelectorAll('a')
      expect(links.length).toBeGreaterThanOrEqual(13)
    })

    it('首页链接应该指向 /', () => {
      const { container } = renderSidebar()
      const homeLink = Array.from(container.querySelectorAll('a')).find(
        a => a.getAttribute('href') === '/'
      )
      expect(homeLink).toBeTruthy()
    })

    it('数组页面链接应该指向 /array', () => {
      const { container } = renderSidebar()
      const link = Array.from(container.querySelectorAll('a')).find(
        a => a.getAttribute('href') === '/array'
      )
      expect(link).toBeTruthy()
    })

    it('排序页面链接应该指向 /sort', () => {
      const { container } = renderSidebar()
      const link = Array.from(container.querySelectorAll('a')).find(
        a => a.getAttribute('href') === '/sort'
      )
      expect(link).toBeTruthy()
    })
  })

  describe('主题切换按钮', () => {
    it('应该渲染明暗模式切换按钮', () => {
      const { container } = renderSidebar()
      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('移动端滚动锁定', () => {
    beforeEach(() => {
      document.body.classList.remove('overflow-hidden')
      vi.stubGlobal('matchMedia', () => ({
        matches: true,
        media: '(max-width: 768px)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList))
    })

    afterEach(() => {
      vi.unstubAllGlobals()
      document.body.classList.remove('overflow-hidden')
    })

    it('展开侧边栏时锁定 body 滚动，关闭后恢复', () => {
      renderSidebar()
      const openBtn = screen.getByLabelText('sidebar.openMenu')
      fireEvent.click(openBtn)
      expect(document.body.classList.contains('overflow-hidden')).toBe(true)

      const closeBtn = screen.getAllByLabelText('common.close').find(el => el.tagName === 'BUTTON')
      expect(closeBtn).toBeTruthy()
      fireEvent.click(closeBtn!)
      expect(document.body.classList.contains('overflow-hidden')).toBe(false)
    })

    it('卸载时恢复 body 滚动', () => {
      const { unmount } = renderSidebar()
      const openBtn = screen.getByLabelText('sidebar.openMenu')
      fireEvent.click(openBtn)
      expect(document.body.classList.contains('overflow-hidden')).toBe(true)

      unmount()
      expect(document.body.classList.contains('overflow-hidden')).toBe(false)
    })
  })

  describe('焦点环', () => {
    it('小按钮应包含 focus-ring 类', () => {
      renderSidebar()
      const langButton = screen.getByLabelText(/langTooltip/)
      expect(langButton.className).toContain('focus-ring')
    })
  })
})