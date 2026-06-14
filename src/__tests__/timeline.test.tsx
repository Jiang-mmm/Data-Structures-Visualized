import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Timeline from '../components/Timeline'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useI18n } from '../i18n/useI18n'

vi.mock('../i18n/useI18n', () => ({
  useI18n: vi.fn()
}))

vi.mock('../hooks/useGlobalSettings', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    useGlobalSettings: vi.fn()
  }
})

function createMockT(lang = 'zh') {
  const zhMessages: Record<string, string> = {
    'timeline.noHistory': '暂无操作历史',
    'timeline.title': '操作历史',
    'timeline.jumpTo': '跳转到步骤',
  }
  const enMessages: Record<string, string> = {
    'timeline.noHistory': 'No operation history',
    'timeline.title': 'Operation History',
    'timeline.jumpTo': 'Jump to step',
  }
  const messages = lang === 'en' ? enMessages : zhMessages
  return (key: string) => messages[key] || key
}

function renderTimeline(ui: React.ReactElement, { mockT, mockLang = 'zh' }: { mockT?: (key: string) => string; mockLang?: string } = {}) {
  ; (useI18n as ReturnType<typeof vi.fn>).mockReturnValue({
    t: mockT || createMockT(mockLang),
    lang: mockLang,
    setLanguage: vi.fn(),
    supportedLanguages: ['zh', 'en'],
  })
    ; (useGlobalSettings as ReturnType<typeof vi.fn>).mockReturnValue({
      t: mockT || createMockT(mockLang),
      lang: mockLang,
      setLanguage: vi.fn(),
      animationSpeed: 1,
      setAnimationSpeed: vi.fn(),
      cycleSpeed: vi.fn(),
      showIndices: true,
      setShowIndices: vi.fn(),
    })
  return render(ui)
}

const sampleHistory = [
  { type: 'insert', description: 'insert(10) → 新头节点: 10, 长度: 1' },
  { type: 'insert', description: 'insert(20) → 新头节点: 20, 长度: 2' },
  { type: 'delete', description: 'delete(0) → 删除值: 10, 长度: 1' },
  { type: 'search', description: 'search(20) → 找到，位置: 0' },
  { type: 'reset', description: 'reset() → 已重置' },
]

describe('Timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('渲染', () => {
    it('应该渲染 Timeline 组件', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getByText('操作历史')).toBeInTheDocument()
    })

    it('应该渲染历史条目', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getAllByRole('button').length).toBe(5)
    })

    it('应该显示进度信息', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={2} onJump={vi.fn()} />)
      expect(screen.getByText('3 / 5')).toBeInTheDocument()
    })
  })

  describe('空状态', () => {
    it('应该显示空状态消息当 history 为空数组', () => {
      renderTimeline(<Timeline history={[]} currentIndex={-1} onJump={vi.fn()} />)
      expect(screen.getByText('暂无操作历史')).toBeInTheDocument()
    })

    it('应该显示空状态消息当 history 为 null', () => {
      renderTimeline(<Timeline history={null as unknown as typeof sampleHistory} currentIndex={-1} onJump={vi.fn()} />)
      expect(screen.getByText('暂无操作历史')).toBeInTheDocument()
    })

    it('空状态应该有正确的样式类', () => {
      const { container } = renderTimeline(<Timeline history={[]} currentIndex={-1} onJump={vi.fn()} />)
      const wrapper = container.querySelector('.bg-ink')
      expect(wrapper).toBeInTheDocument()
    })
  })

  describe('当前项高亮', () => {
    it('应该高亮当前索引对应的项目', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={2} onJump={vi.fn()} />)
      const buttons = screen.getAllByRole('button')
      const highlighted = buttons.find(btn => btn.className.includes('bg-accent-blue'))
      expect(highlighted).toBeInTheDocument()
    })

    it('第一个项目应该在高亮时显示正确样式', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={vi.fn()} />)
      const buttons = screen.getAllByRole('button')
      const first = buttons[0]
      expect(first.className).toContain('bg-accent-blue')
    })

    it('非当前项目应该显示默认样式', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={vi.fn()} />)
      const buttons = screen.getAllByRole('button')
      const second = buttons[1]
      expect(second.className).not.toContain('bg-accent-blue')
    })
  })

  describe('点击跳转', () => {
    it('应该调用 onJump 点击某个条目', () => {
      const onJump = vi.fn()
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={onJump} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[3])
      expect(onJump).toHaveBeenCalledWith(3)
    })

    it('应该支持跳转到第一个条目', () => {
      const onJump = vi.fn()
      renderTimeline(<Timeline history={sampleHistory} currentIndex={4} onJump={onJump} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])
      expect(onJump).toHaveBeenCalledWith(0)
    })

    it('应该支持跳转到最后一个条目', () => {
      const onJump = vi.fn()
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={onJump} />)
      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[4])
      expect(onJump).toHaveBeenCalledWith(4)
    })
  })

  describe('非可点击模式 (onJump undefined)', () => {
    it('onJump 为 undefined 时组件应正常渲染', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} />)
      expect(screen.getByText('操作历史')).toBeInTheDocument()
    })

    it('onJump 为 undefined 时条目不应是 button 元素', () => {
      const { container } = renderTimeline(<Timeline history={sampleHistory} currentIndex={0} />)
      const items = container.querySelectorAll('[data-state]')
      items.forEach(item => {
        expect(item.tagName).not.toBe('BUTTON')
      })
    })

    it('onJump 为 undefined 时条目不应有 role="button"', () => {
      const { container } = renderTimeline(<Timeline history={sampleHistory} currentIndex={0} />)
      const buttons = container.querySelectorAll('[role="button"]')
      expect(buttons.length).toBe(0)
    })
  })

  describe('国际化', () => {
    it('应该显示中文标题', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={vi.fn()} />, { mockLang: 'zh' })
      expect(screen.getByText('操作历史')).toBeInTheDocument()
    })

    it('应该显示英文标题', () => {
      renderTimeline(<Timeline history={sampleHistory} currentIndex={0} onJump={vi.fn()} />, { mockLang: 'en' })
      expect(screen.getByText('Operation History')).toBeInTheDocument()
    })

    it('应该显示中文空状态消息', () => {
      renderTimeline(<Timeline history={[]} currentIndex={-1} onJump={vi.fn()} />, { mockLang: 'zh' })
      expect(screen.getByText('暂无操作历史')).toBeInTheDocument()
    })

    it('应该显示英文空状态消息', () => {
      renderTimeline(<Timeline history={[]} currentIndex={-1} onJump={vi.fn()} />, { mockLang: 'en' })
      expect(screen.getByText('No operation history')).toBeInTheDocument()
    })
  })

  describe('图标显示', () => {
    it('应该为 insert 类型显示 + 图标', () => {
      renderTimeline(<Timeline history={[{ type: 'insert', description: 'insert test' }]} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getByText('+')).toBeInTheDocument()
    })

    it('应该为 delete 类型显示 − 图标', () => {
      renderTimeline(<Timeline history={[{ type: 'delete', description: 'delete test' }]} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getByText('−')).toBeInTheDocument()
    })

    it('应该为 search 类型显示 ◎ 图标', () => {
      renderTimeline(<Timeline history={[{ type: 'search', description: 'search test' }]} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getByText('◎')).toBeInTheDocument()
    })

    it('应该为 reset 类型显示 ↺ 图标', () => {
      renderTimeline(<Timeline history={[{ type: 'reset', description: 'reset test' }]} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getByText('↺')).toBeInTheDocument()
    })

    it('应该为未知类型显示默认 • 图标', () => {
      renderTimeline(<Timeline history={[{ type: 'unknown', description: 'test' }]} currentIndex={0} onJump={vi.fn()} />)
      expect(screen.getByText('•')).toBeInTheDocument()
    })
  })
})
