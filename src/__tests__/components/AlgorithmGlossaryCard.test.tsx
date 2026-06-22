import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AlgorithmGlossaryCard from '../../components/AlgorithmGlossaryCard'

// 默认 mock：t(key) 返回 key
vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('AlgorithmGlossaryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该渲染表头标题', () => {
    render(<AlgorithmGlossaryCard />)
    expect(screen.getByText('complexity.glossaryTitle')).toBeInTheDocument()
    expect(screen.getByText('complexity.glossarySubtitle')).toBeInTheDocument()
  })

  it('默认折叠：不渲染表格行（不渲染 16 行数据）', () => {
    render(<AlgorithmGlossaryCard />)
    // 展开按钮存在，但表格容器不应存在
    const button = screen.getByRole('button', { name: 'complexity.showMore' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('点击展开按钮后渲染 16 行数据', () => {
    render(<AlgorithmGlossaryCard />)
    fireEvent.click(screen.getByRole('button', { name: 'complexity.showMore' }))
    // 表格出现
    const table = screen.getByRole('table')
    expect(table).toBeInTheDocument()
    // 16 个数据行（每个对应一个算法/数据结构）
    const rows = screen.getAllByRole('row')
    // 1 表头 + 16 数据行
    expect(rows.length).toBe(17)
    // 抽样：array 名应被渲染（行内）—— getAllByText 因为 key 也会出现在 hook mock 数据中
    expect(screen.getAllByText('algorithms.array.name').length).toBeGreaterThan(0)
  })

  it('展开后再次点击按钮应该收起表格', () => {
    render(<AlgorithmGlossaryCard />)
    const button = screen.getByRole('button', { name: 'complexity.showMore' })
    fireEvent.click(button)
    // 展开
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveTextContent('complexity.showLess')
    // 收起
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('表头应该展示时间复杂度的最优/平均/最差/空间列', () => {
    render(<AlgorithmGlossaryCard />)
    fireEvent.click(screen.getByRole('button', { name: 'complexity.showMore' }))
    expect(screen.getByText('complexity.best')).toBeInTheDocument()
    expect(screen.getByText('complexity.average')).toBeInTheDocument()
    expect(screen.getByText('complexity.worst')).toBeInTheDocument()
    expect(screen.getByText('complexity.space')).toBeInTheDocument()
  })

  it('应该使用正确的 testid 便于 e2e 检索', () => {
    render(<AlgorithmGlossaryCard />)
    expect(screen.getByTestId('algorithm-glossary-card')).toBeInTheDocument()
  })
})
