import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import PageHeader from '../components/PageHeader'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('PageHeader', () => {
  it('应该渲染标题', () => {
    render(<PageHeader title="数组" subtitle="线性结构" icon="▦" />)
    expect(screen.getByText('数组')).toBeInTheDocument()
  })

  it('应该渲染副标题', () => {
    render(<PageHeader title="数组" subtitle="线性结构" icon="▦" />)
    expect(screen.getByText('线性结构')).toBeInTheDocument()
  })

  it('应该渲染图标', () => {
    render(<PageHeader title="数组" subtitle="线性结构" icon="▦" />)
    expect(screen.getByText('▦')).toBeInTheDocument()
  })

  it('应该渲染子元素', () => {
    render(
      <PageHeader title="测试" subtitle="描述" icon="★">
        <button>操作按钮</button>
      </PageHeader>
    )
    expect(screen.getByText('操作按钮')).toBeInTheDocument()
  })

  it('应该使用 h1 标签', () => {
    render(<PageHeader title="测试标题" subtitle="描述" icon="★" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('测试标题')
  })
})
