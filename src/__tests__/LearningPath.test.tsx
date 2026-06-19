import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import LearningPath from '../components/LearningPath'

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

describe('LearningPath', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('应该渲染学习路径标题', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText('learningPath.title')).toBeDefined()
  })

  it('应该渲染所有10个学习节点', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    // All 10 data structures should appear (in node + tooltip for unlocked ones)
    expect(screen.getAllByText('sidebar.array').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.stack').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.queue').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.linkedlist').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.tree').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.heap').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.trie').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.hash').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.graph').length).toBeGreaterThan(0)
    expect(screen.getAllByText('sidebar.sort').length).toBeGreaterThan(0)
  })

  it('应该显示初始进度 0/11', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText(/0\/11.*0%/)).toBeDefined()
  })

  it('array应该是可点击的（无前置条件）', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const arrayLink = screen.getAllByText('sidebar.array')[0].closest('a')
    expect(arrayLink).not.toBeNull()
    expect(arrayLink!.getAttribute('href')).toBe('/array')
  })

  it('stack应该是锁定的（需要完成array）', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const stackLink = screen.getAllByText('sidebar.stack')[0].closest('a')
    expect(stackLink).not.toBeNull()
    // Locked nodes use to="#" which MemoryRouter resolves to "/" with hash
    expect(stackLink!.getAttribute('href')).toMatch(/^\/?#?$/)
    // The link should have the locked styling class
    expect(stackLink!.className).toContain('opacity-40')
  })

  it('应该显示完成进度', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText(/1\/11.*9%/)).toBeDefined()
  })

  it('应该显示完成的节点有对勾', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText('✓')).toBeDefined()
  })

  it('完成array后stack应该解锁', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const stackLink = screen.getAllByText('sidebar.stack')[0].closest('a')
    expect(stackLink!.getAttribute('href')).toBe('/stack')
  })

  it('应该显示重置按钮当有进度时', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByTitle('learningPath.reset')).toBeDefined()
  })

  it('不应该在无进度时显示重置按钮', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.queryByTitle('learningPath.reset')).toBeNull()
  })

  it('应该显示难度标签', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getAllByText('learningPath.difficulty.beginner').length).toBeGreaterThan(0)
    expect(screen.getAllByText('learningPath.difficulty.intermediate').length).toBeGreaterThan(0)
    expect(screen.getAllByText('learningPath.difficulty.advanced').length).toBeGreaterThan(0)
  })

  it('全部完成时应该显示完成消息', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree', 'heap', 'trie', 'hash', 'graph', 'sort'],
      completed: ['array', 'stack', 'queue', 'linkedlist', 'tree', 'avlTree', 'heap', 'trie', 'hash', 'graph', 'sort'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText('learningPath.allCompleted')).toBeDefined()
  })

  it('信息框应该显示标题、描述、进度三层信息', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    // array is unlocked by default, tooltip should be rendered
    const tooltip = document.querySelector('.learning-path-tooltip')
    expect(tooltip).not.toBeNull()
    // Title layer
    expect(tooltip!.querySelector('.lp-tooltip-title')).not.toBeNull()
    // Description layer
    expect(tooltip!.querySelector('.lp-tooltip-desc')).not.toBeNull()
    // Progress layer
    expect(tooltip!.querySelector('.lp-tooltip-progress')).not.toBeNull()
  })

  it('信息框标题应显示节点名称', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const tooltip = document.querySelector('.learning-path-tooltip')
    expect(tooltip).not.toBeNull()
    expect(tooltip!.querySelector('.lp-tooltip-title')!.textContent).toBe('sidebar.array')
  })

  it('信息框描述应显示节点描述文案', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText('learningPath.desc.array')).toBeDefined()
  })

  it('信息框进度应显示学习状态', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    // array is unlocked && !done → should show startLearning status
    expect(screen.getByText('learningPath.startLearning')).toBeDefined()
  })

  it('已完成节点的信息框应显示完成状态', () => {
    localStorage.setItem('ds-visualizer-learning-progress', JSON.stringify({
      visited: ['array'],
      completed: ['array'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText('learningPath.completed')).toBeDefined()
  })

  it('信息框应该有Neo-Brutalist样式类名', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const tooltip = document.querySelector('.learning-path-tooltip')
    expect(tooltip).not.toBeNull()
    // Hard border
    expect(tooltip!.className).toContain('border-2')
    expect(tooltip!.className).toContain('border-ink')
    // Hard shadow
    expect(tooltip!.className).toContain('shadow-button-hover')
    // High contrast background
    expect(tooltip!.className).toContain('bg-ink')
    expect(tooltip!.className).toContain('text-paper')
  })

  it('信息框应该悬停显示,离开隐藏', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const tooltipCard = document.querySelector('.learning-path-tooltip')
    expect(tooltipCard).not.toBeNull()
    // Parent container controls visibility via opacity
    const tooltipContainer = tooltipCard!.parentElement
    expect(tooltipContainer).not.toBeNull()
    // Hidden by default
    expect(tooltipContainer!.className).toContain('opacity-0')
    // Shows on hover via group-hover
    expect(tooltipContainer!.className).toContain('group-hover:opacity-100')
    // Does not block interaction
    expect(tooltipContainer!.className).toContain('pointer-events-none')
  })

  it('锁定节点不应显示信息框', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    // stack is locked (requires array), should not have a tooltip
    const stackLink = screen.getAllByText('sidebar.stack')[0].closest('a')
    expect(stackLink).not.toBeNull()
    const stackTooltip = stackLink!.querySelector('.learning-path-tooltip')
    expect(stackTooltip).toBeNull()
  })
})
