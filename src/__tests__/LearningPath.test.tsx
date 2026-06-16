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
    // All 10 data structures should appear
    expect(screen.getByText('sidebar.array')).toBeDefined()
    expect(screen.getByText('sidebar.stack')).toBeDefined()
    expect(screen.getByText('sidebar.queue')).toBeDefined()
    expect(screen.getByText('sidebar.linkedlist')).toBeDefined()
    expect(screen.getByText('sidebar.tree')).toBeDefined()
    expect(screen.getByText('sidebar.heap')).toBeDefined()
    expect(screen.getByText('sidebar.trie')).toBeDefined()
    expect(screen.getByText('sidebar.hash')).toBeDefined()
    expect(screen.getByText('sidebar.graph')).toBeDefined()
    expect(screen.getByText('sidebar.sort')).toBeDefined()
  })

  it('应该显示初始进度 0/10', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText(/0\/10.*0%/)).toBeDefined()
  })

  it('array应该是可点击的（无前置条件）', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const arrayLink = screen.getByText('sidebar.array').closest('a')
    expect(arrayLink).not.toBeNull()
    expect(arrayLink!.getAttribute('href')).toBe('/array')
  })

  it('stack应该是锁定的（需要完成array）', () => {
    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    const stackLink = screen.getByText('sidebar.stack').closest('a')
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
    expect(screen.getByText(/1\/10.*10%/)).toBeDefined()
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
    const stackLink = screen.getByText('sidebar.stack').closest('a')
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
      visited: ['array', 'stack', 'queue', 'linkedlist', 'tree', 'heap', 'trie', 'hash', 'graph', 'sort'],
      completed: ['array', 'stack', 'queue', 'linkedlist', 'tree', 'heap', 'trie', 'hash', 'graph', 'sort'],
      startedAt: new Date().toISOString(),
    }))

    render(<MemoryRouter><LearningPath /></MemoryRouter>)
    expect(screen.getByText('learningPath.allCompleted')).toBeDefined()
  })
})
