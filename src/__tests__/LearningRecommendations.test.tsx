import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LearningRecommendations from '../components/LearningRecommendations'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({
    t: (key: string) => key,
    theme: 'light',
    setTheme: vi.fn(),
    lang: 'zh',
    setLang: vi.fn(),
    speed: 1,
    setSpeed: vi.fn(),
  }),
}))

describe('LearningRecommendations', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该渲染推荐标题', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.title')).toBeDefined()
  })

  it('应该渲染个性化建议区域', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.personalizedAdvice')).toBeDefined()
  })

  it('空进度时应该显示欢迎建议', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.advice.welcome')).toBeDefined()
  })

  it('应该渲染推荐模块区域', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.recommendedModules')).toBeDefined()
  })

  it('空进度时应该推荐 array 模块', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('sidebar.array')).toBeDefined()
  })

  it('推荐模块应该是可点击链接', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    const arrayLink = screen.getByText('sidebar.array').closest('a')
    expect(arrayLink).not.toBeNull()
    expect(arrayLink!.getAttribute('href')).toBe('/array')
  })

  it('应该显示推荐理由', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.reason.startHere')).toBeDefined()
  })

  it('应该显示难度标签', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.difficulty')).toBeDefined()
    expect(screen.getByText('learningPath.difficulty.beginner')).toBeDefined()
  })

  it('应该显示开始学习按钮文案', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText(/recommendations.startLearning/)).toBeDefined()
  })

  it('有进度时应该显示继续学习推荐', () => {
    const allIds = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'heap', 'trie', 'hash', 'graph', 'sort']
    const completed = allIds.filter(id => id !== 'graph')
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: allIds,
      completed,
      startedAt: new Date().toISOString(),
    }))
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.reason.continueLearning')).toBeDefined()
  })

  it('全部完成时应该显示复习推荐', () => {
    const allIds = ['array', 'stack', 'queue', 'linkedlist', 'tree', 'heap', 'trie', 'hash', 'graph', 'sort']
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: allIds,
      completed: allIds,
      startedAt: new Date().toISOString(),
    }))
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('recommendations.advice.allCompleted')).toBeDefined()
    expect(screen.getAllByText('recommendations.reason.review').length).toBeGreaterThan(0)
  })

  it('应该使用 Neo-Brutalist 样式（硬边框）', () => {
    const { container } = render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    const section = container.querySelector('section')
    expect(section).not.toBeNull()
    const borderDiv = section!.firstElementChild
    expect(borderDiv).not.toBeNull()
    expect(borderDiv!.className).toContain('border-2')
  })

  it('应该显示排名编号', () => {
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getByText('#1')).toBeDefined()
  })

  it('推荐卡片应该有 hover 效果类', () => {
    const { container } = render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThan(0)
    const recLinks = Array.from(links).filter(a => a.getAttribute('href')?.startsWith('/'))
    expect(recLinks.some(a => a.className.includes('hover:-translate-y'))).toBe(true)
  })

  it('完成 array 后应该推荐已解锁模块', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))
    render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    expect(screen.getAllByText('recommendations.reason.unlockedNotStarted').length).toBeGreaterThan(0)
  })

  it('推荐卡片应该有阴影类', () => {
    const { container } = render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    const links = container.querySelectorAll('a')
    const recLinks = Array.from(links).filter(a => a.getAttribute('href')?.startsWith('/'))
    expect(recLinks.some(a => a.className.includes('hover:shadow-button'))).toBe(true)
  })

  it('个性化建议区域应该有琥珀色边框', () => {
    const { container } = render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    const adviceBox = container.querySelector('.border-accent-amber\\/40')
    expect(adviceBox).not.toBeNull()
  })

  it('推荐模块应该显示类别颜色点', () => {
    const { container } = render(<MemoryRouter><LearningRecommendations /></MemoryRouter>)
    const colorDots = container.querySelectorAll('a .rounded-full')
    expect(colorDots.length).toBeGreaterThan(0)
  })
})
