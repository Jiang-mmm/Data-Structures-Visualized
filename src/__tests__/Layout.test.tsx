import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Layout from '../components/Layout'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}))

vi.mock('../components/KeyboardHelp', () => ({
  default: () => <div data-testid="keyboard-help">KeyboardHelp</div>,
}))

vi.mock('../components/PerformanceMonitor', () => ({
  default: () => <div data-testid="performance-monitor">PerformanceMonitor</div>,
}))

vi.mock('../components/NetworkStatus', () => ({
  default: () => <div data-testid="network-status">NetworkStatus</div>,
}))

describe('Layout', () => {
  it('应该渲染子元素', () => {
    render(
      <MemoryRouter>
        <Layout><div>测试内容</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByText('测试内容')).toBeInTheDocument()
  })

  it('应该渲染侧边栏', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('应该包含跳转到内容的链接', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )
    const link = screen.getByText('common.skipToContent')
    expect(link).toHaveAttribute('href', '#main-content')
  })

  it('应该使用 semantic main 元素', () => {
    render(
      <MemoryRouter>
        <Layout><div>内容</div></Layout>
      </MemoryRouter>
    )
    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
