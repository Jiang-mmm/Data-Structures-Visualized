import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import KeyboardHelp from '../components/KeyboardHelp'

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

function renderKeyboardHelp(route = '/array') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <KeyboardHelp />
    </MemoryRouter>
  )
}

describe('KeyboardHelp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('初始状态', () => {
    it('初始应该隐藏', () => {
      const { container } = renderKeyboardHelp()
      expect(container.querySelector('.fixed')).toBeNull()
    })
  })

  describe('快捷键切换', () => {
    it('按 ? 键应该显示帮助面板', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      expect(container.querySelector('.fixed')).toBeTruthy()
    })

    it('按 ? 键再次应该隐藏帮助面板', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      fireEvent.keyDown(window, { key: '?' })
      expect(container.querySelector('.fixed')).toBeNull()
    })

    it('按 Escape 应该隐藏帮助面板', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      fireEvent.keyDown(window, { key: 'Escape' })
      expect(container.querySelector('.fixed')).toBeNull()
    })
  })

  describe('快捷键内容', () => {
    it('数组页面应该显示撤销/重做/重置快捷键', () => {
      renderKeyboardHelp('/array')
      fireEvent.keyDown(window, { key: '?' })
      expect(screen.getByText('Ctrl + Z')).toBeTruthy()
      expect(screen.getByText('Ctrl + Shift + Z')).toBeTruthy()
      expect(screen.getByText('R')).toBeTruthy()
    })

    it('排序页面应该显示暂停快捷键', () => {
      renderKeyboardHelp('/sort')
      fireEvent.keyDown(window, { key: '?' })
      expect(screen.getByText('Space')).toBeTruthy()
    })

    it('未知页面应该显示默认快捷键', () => {
      renderKeyboardHelp('/unknown')
      fireEvent.keyDown(window, { key: '?' })
      expect(screen.getByText('R')).toBeTruthy()
    })
  })

  describe('关闭按钮', () => {
    it('点击关闭按钮应该隐藏面板', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      fireEvent.click(screen.getByText('✕'))
      expect(container.querySelector('.fixed')).toBeNull()
    })
  })

  describe('点击遮罩关闭', () => {
    it('点击遮罩层应该隐藏面板', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      const overlay = container.querySelector('.fixed')!
      fireEvent.click(overlay)
      expect(container.querySelector('.fixed')).toBeNull()
    })
  })

  describe('输入框过滤', () => {
    it('输入框中按 ? 不应该触发', () => {
      const { container } = renderKeyboardHelp()
      const input = document.createElement('input')
      document.body.appendChild(input)
      fireEvent.keyDown(input, { key: '?' })
      expect(container.querySelector('.fixed')).toBeNull()
      document.body.removeChild(input)
    })

    it('textarea 中按 ? 不应该触发', () => {
      const { container } = renderKeyboardHelp()
      const textarea = document.createElement('textarea')
      document.body.appendChild(textarea)
      fireEvent.keyDown(textarea, { key: '?' })
      expect(container.querySelector('.fixed')).toBeNull()
      document.body.removeChild(textarea)
    })
  })

  describe('ARIA 属性', () => {
    it('帮助面板应有 role="dialog"', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog).toBeTruthy()
    })

    it('帮助面板应有 aria-modal="true"', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      const dialog = container.querySelector('[aria-modal="true"]')
      expect(dialog).toBeTruthy()
    })

    it('帮助面板应有 aria-label', () => {
      const { container } = renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      const dialog = container.querySelector('[role="dialog"]')
      expect(dialog?.getAttribute('aria-label')).toBeTruthy()
    })

    it('关闭按钮应有 aria-label', () => {
      renderKeyboardHelp()
      fireEvent.keyDown(window, { key: '?' })
      const closeBtn = screen.getByRole('button', { name: /common\.close/ })
      expect(closeBtn).toBeTruthy()
    })
  })
})