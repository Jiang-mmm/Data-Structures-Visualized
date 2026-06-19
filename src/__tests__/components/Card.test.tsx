import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from '../../components/Card'

describe('Card', () => {
  it('默认渲染应包含硬边框、硬阴影与内边距', () => {
    const { container } = render(<Card>内容</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-2')
    expect(card.className).toContain('shadow-hard-md')
    expect(card.className).toContain('p-5')
  })

  it('应渲染子元素', () => {
    render(<Card>卡片内容</Card>)
    expect(screen.getByText('卡片内容')).toBeInTheDocument()
  })

  it('默认使用 surface 背景与 border 边框', () => {
    const { container } = render(<Card>默认</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-surface')
    expect(card.className).toContain('dark:bg-dark-surface')
    expect(card.className).toContain('border-border')
    expect(card.className).toContain('dark:border-dark-border')
    expect(card.className).toContain('rounded-none')
  })

  it('accent 变体应在顶部显示 4px 强调边框', () => {
    const { container } = render(<Card variant="accent" accent="blue">强调</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-t-4')
    expect(card.className).toContain('!border-t-card-group-linear')
  })

  it('支持不同 accent 颜色映射', () => {
    const { container: c1 } = render(<Card variant="accent" accent="blue">蓝</Card>)
    expect((c1.firstChild as HTMLElement).className).toContain('!border-t-card-group-linear')

    const { container: c2 } = render(<Card variant="accent" accent="red">红</Card>)
    expect((c2.firstChild as HTMLElement).className).toContain('!border-t-card-group-graph')

    const { container: c3 } = render(<Card variant="accent" accent="amber">琥珀</Card>)
    expect((c3.firstChild as HTMLElement).className).toContain('!border-t-card-group-tree')
  })

  it('muted 变体使用 muted 背景与 subtle 边框', () => {
    const { container } = render(<Card variant="muted">柔和</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-muted')
    expect(card.className).toContain('dark:bg-dark-muted')
    expect(card.className).toContain('border-border-subtle')
    expect(card.className).toContain('dark:border-dark-border-subtle')
  })

  it('支持 shadow 属性映射到硬阴影 token', () => {
    const { container: none } = render(<Card shadow="none">无阴影</Card>)
    expect((none.firstChild as HTMLElement).className).toContain('shadow-none')

    const { container: sm } = render(<Card shadow="sm">小阴影</Card>)
    expect((sm.firstChild as HTMLElement).className).toContain('shadow-hard-sm')

    const { container: lg } = render(<Card shadow="lg">大阴影</Card>)
    expect((lg.firstChild as HTMLElement).className).toContain('shadow-hard-lg')

    const { container: hover } = render(<Card shadow="hover">悬停阴影</Card>)
    expect((hover.firstChild as HTMLElement).className).toContain('shadow-none')
    expect((hover.firstChild as HTMLElement).className).toContain('hover:shadow-hard-md')
  })

  it('支持 radius 属性映射到圆角 token', () => {
    const { container: sm } = render(<Card radius="sm">小圆角</Card>)
    expect((sm.firstChild as HTMLElement).className).toContain('rounded-sm')

    const { container: md } = render(<Card radius="md">中圆角</Card>)
    expect((md.firstChild as HTMLElement).className).toContain('rounded-md')

    const { container: full } = render(<Card radius="full">全圆角</Card>)
    expect((full.firstChild as HTMLElement).className).toContain('rounded-full')
  })

  it('hover 时应整体上移或阴影加深', () => {
    const { container } = render(<Card>悬停</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('hover:-translate-y-0.5')
    expect(card.className).toContain('hover:shadow-hard-md-hover')
  })

  it('支持 dark 模式相关类', () => {
    const { container } = render(<Card>暗色</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('dark:bg-dark-surface')
    expect(card.className).toContain('dark:border-dark-border')
    expect(card.className).toContain('dark:shadow-card-dark')
  })

  it('支持自定义 className', () => {
    const { container } = render(<Card className="custom-card">自定义</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('custom-card')
  })

  it('默认不启用渐变背景', () => {
    const { container } = render(<Card>默认</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).not.toContain('bg-gradient-to-br')
  })

  it('gradient=true 时显示对应 accent 的渐变背景', () => {
    const { container } = render(<Card gradient accent="blue">渐变</Card>)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('bg-gradient-to-br')
    expect(card.className).toContain('from-card-group-linear/10')
    expect(card.className).toContain('to-card-group-linear/5')
    expect(card.className).toContain('dark:from-card-group-linear/20')
    expect(card.className).toContain('dark:to-card-group-linear/10')
  })

  it('gradient 颜色映射与 accent 视觉色系一致', () => {
    const { container: blue } = render(<Card gradient accent="blue">蓝</Card>)
    expect((blue.firstChild as HTMLElement).className).toContain('from-card-group-linear/10')

    const { container: red } = render(<Card gradient accent="red">红</Card>)
    expect((red.firstChild as HTMLElement).className).toContain('from-card-group-graph/10')

    const { container: amber } = render(<Card gradient accent="amber">琥珀</Card>)
    expect((amber.firstChild as HTMLElement).className).toContain('from-card-group-tree/10')
  })
})
