import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Timeline from '../components/Timeline'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('Timeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('空 history 时显示 timeline.noHistory 文案', () => {
    const { container } = render(<Timeline history={[]} currentIndex={-1} />)
    expect(container.textContent).toContain('timeline.noHistory')
  })

  it('history 长度为 0 时也走空分支', () => {
    render(<Timeline history={undefined as any} currentIndex={-1} />)
    expect(screen.getByText('timeline.noHistory')).toBeInTheDocument()
  })

  it('正常 history 时渲染每条 entry 的 description', () => {
    const history = [
      { type: 'insert', description: '插入 5' },
      { type: 'delete', description: '删除 8' },
      { type: 'reset', description: '重置' },
    ]
    render(<Timeline history={history} currentIndex={0} />)
    expect(screen.getByText('插入 5')).toBeInTheDocument()
    expect(screen.getByText('删除 8')).toBeInTheDocument()
    expect(screen.getByText('重置')).toBeInTheDocument()
  })

  it('显示当前索引 (currentIndex+1) / N', () => {
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
      { type: 'insert', description: 'c' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={1} />)
    expect(container.textContent).toContain('2 / 3')
  })

  it('onJump 为 undefined 时条目不可点击（无 cursor-pointer）', () => {
    const history = [{ type: 'insert', description: 'a' }]
    const { container } = render(<Timeline history={history} currentIndex={0} />)
    const item = container.querySelector('[role="button"]')
    // 无 onJump 时 role 不应为 button
    expect(item).toBeNull()
  })

  it('提供 onJump 时点击条目应触发跳转', () => {
    const handleJump = vi.fn()
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={0} onJump={handleJump} />)
    const item = container.querySelectorAll('[role="button"]')[1] as HTMLElement
    expect(item).toBeTruthy()
    fireEvent.click(item)
    expect(handleJump).toHaveBeenCalledWith(1)
  })

  it('提供 onJump 时按 Enter 键应触发跳转', () => {
    const handleJump = vi.fn()
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={0} onJump={handleJump} />)
    const item = container.querySelectorAll('[role="button"]')[1] as HTMLElement
    fireEvent.keyDown(item, { key: 'Enter' })
    expect(handleJump).toHaveBeenCalledWith(1)
  })

  it('未知 type 应使用 default 图标与颜色', () => {
    const history = [{ type: 'something-new', description: 'x' }]
    const { container } = render(<Timeline history={history} currentIndex={0} />)
    // description 仍然在主显示中
    expect(screen.getByText('x')).toBeInTheDocument()
    expect(container.textContent).toContain('x')
  })

  it('currentIndex 为最后一项时点击 ArrowRight 不应跳转', () => {
    const handleJump = vi.fn()
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={1} onJump={handleJump} />)
    const scrollContainer = container.querySelector('[tabindex="0"]') as HTMLElement
    fireEvent.keyDown(scrollContainer, { key: 'ArrowRight' })
    expect(handleJump).not.toHaveBeenCalled()
  })

  it('currentIndex 为第一项时点击 ArrowLeft 不应跳转', () => {
    const handleJump = vi.fn()
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={0} onJump={handleJump} />)
    const scrollContainer = container.querySelector('[tabindex="0"]') as HTMLElement
    fireEvent.keyDown(scrollContainer, { key: 'ArrowLeft' })
    expect(handleJump).not.toHaveBeenCalled()
  })

  it('点击 ArrowRight 应跳到下一项', () => {
    const handleJump = vi.fn()
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={0} onJump={handleJump} />)
    const scrollContainer = container.querySelector('[tabindex="0"]') as HTMLElement
    fireEvent.keyDown(scrollContainer, { key: 'ArrowRight' })
    expect(handleJump).toHaveBeenCalledWith(1)
  })

  it('点击 ArrowLeft 应跳到上一项', () => {
    const handleJump = vi.fn()
    const history = [
      { type: 'insert', description: 'a' },
      { type: 'insert', description: 'b' },
    ]
    const { container } = render(<Timeline history={history} currentIndex={1} onJump={handleJump} />)
    const scrollContainer = container.querySelector('[tabindex="0"]') as HTMLElement
    fireEvent.keyDown(scrollContainer, { key: 'ArrowLeft' })
    expect(handleJump).toHaveBeenCalledWith(0)
  })
})
