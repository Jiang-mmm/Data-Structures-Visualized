import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LogPanel from '../components/LogPanel'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const sampleLogs = [
  { time: '10:00:01', type: 'oper', message: '操作日志1' },
  { time: '10:00:02', type: 'info', message: '信息日志1' },
  { time: '10:00:03', type: 'error', message: '错误日志1' },
  { time: '10:00:04', type: 'code', message: '代码日志1' },
]

function expandPanel() {
  const header = screen.getByRole('button', { name: /logPanel\.title/i })
  fireEvent.click(header)
}

function renderLogPanel(props: { logs?: Array<{ time: string; type: string; message: string }>; maxHeight?: number } = {}) {
  const defaultProps = { logs: sampleLogs, ...props }
  return render(<LogPanel {...defaultProps} />)
}

describe('LogPanel', () => {
  describe('空状态', () => {
    it('logs 为空时不应渲染面板', () => {
      const { container } = renderLogPanel({ logs: [] })
      expect(container.firstChild).toBeNull()
    })

    it('logs 为空时不应显示日志条目', () => {
      const { container } = renderLogPanel({ logs: [] })
      expect(screen.queryByText('操作日志1')).not.toBeInTheDocument()
    })
  })

  describe('折叠/展开', () => {
    it('默认应折叠显示', () => {
      renderLogPanel()
      // 面板应存在但内容区域不可见
      const header = screen.getByRole('button', { name: /logPanel\.title/i })
      expect(header).toBeInTheDocument()
      expect(header).toHaveAttribute('aria-expanded', 'false')
    })

    it('点击标题栏应展开面板', () => {
      renderLogPanel()
      expandPanel()
      const header = screen.getByRole('button', { name: /logPanel\.title/i })
      expect(header).toHaveAttribute('aria-expanded', 'true')
    })

    it('展开后应显示日志内容', () => {
      renderLogPanel()
      expandPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
    })

    it('再次点击标题栏应折叠面板', () => {
      renderLogPanel()
      expandPanel()
      expandPanel()
      const header = screen.getByRole('button', { name: /logPanel\.title/i })
      expect(header).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('日志条目渲染', () => {
    it('展开后应渲染日志消息', () => {
      renderLogPanel()
      expandPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.getByText('代码日志1')).toBeInTheDocument()
    })

    it('展开后应渲染日志时间', () => {
      renderLogPanel()
      expandPanel()
      expect(screen.getByText('10:00:01')).toBeInTheDocument()
      expect(screen.getByText('10:00:02')).toBeInTheDocument()
      expect(screen.getByText('10:00:03')).toBeInTheDocument()
      expect(screen.getByText('10:00:04')).toBeInTheDocument()
    })

    it('展开后应渲染类型标签', () => {
      renderLogPanel()
      expandPanel()
      // Type labels appear as colored badges in log entries (without brackets in visible span)
      expect(screen.getAllByText('logPanel.type.oper').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('logPanel.type.info').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('logPanel.type.error').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('logPanel.type.code').length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('筛选按钮', () => {
    it('展开后应渲染所有筛选按钮', () => {
      renderLogPanel()
      expandPanel()
      expect(screen.getByText('ALL')).toBeInTheDocument()
      // Filter buttons use aria-pressed attribute
      const filterButtons = screen.getAllByRole('button', { pressed: false })
      const typeButtons = filterButtons.filter(btn => btn.hasAttribute('aria-pressed') && btn.textContent !== '#')
      expect(typeButtons.length).toBeGreaterThanOrEqual(4)
    })

    it('点击筛选按钮应只显示对应类型的日志', () => {
      renderLogPanel()
      expandPanel()
      // Find the filter button (has aria-pressed) for 'oper'
      const operButtons = screen.getAllByText('logPanel.type.oper')
      const filterBtn = operButtons.find(el => el.closest('button')?.hasAttribute('aria-pressed'))
      fireEvent.click(filterBtn!)
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.queryByText('信息日志1')).not.toBeInTheDocument()
      expect(screen.queryByText('错误日志1')).not.toBeInTheDocument()
      expect(screen.queryByText('代码日志1')).not.toBeInTheDocument()
    })

    it('点击 ALL 按钮应显示所有日志', () => {
      renderLogPanel()
      expandPanel()
      const operButtons = screen.getAllByText('logPanel.type.oper')
      const filterBtn = operButtons.find(el => el.closest('button')?.hasAttribute('aria-pressed'))
      fireEvent.click(filterBtn!)
      fireEvent.click(screen.getByText('ALL'))
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.getByText('代码日志1')).toBeInTheDocument()
    })

    it('点击 error 筛选应只显示错误日志', () => {
      renderLogPanel()
      expandPanel()
      const errorButtons = screen.getAllByText('logPanel.type.error')
      const filterBtn = errorButtons.find(el => el.closest('button')?.hasAttribute('aria-pressed'))
      fireEvent.click(filterBtn!)
      expect(screen.queryByText('操作日志1')).not.toBeInTheDocument()
      expect(screen.queryByText('信息日志1')).not.toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.queryByText('代码日志1')).not.toBeInTheDocument()
    })
  })

  describe('maxHeight', () => {
    it('折叠时应使用 maxHeight 40', () => {
      const { container } = renderLogPanel()
      const panel = container.firstChild as HTMLElement
      expect(panel).toHaveStyle({ maxHeight: 40 })
    })

    it('展开后应使用默认 maxHeight 208', () => {
      const { container } = renderLogPanel()
      expandPanel()
      const panel = container.firstChild as HTMLElement
      expect(panel).toHaveStyle({ maxHeight: 208 })
    })

    it('展开后应应用自定义 maxHeight', () => {
      const { container } = renderLogPanel({ maxHeight: 400 })
      expandPanel()
      const panel = container.firstChild as HTMLElement
      expect(panel).toHaveStyle({ maxHeight: 400 })
    })
  })

  describe('多种日志类型', () => {
    it('展开后应正确渲染包含所有类型的日志', () => {
      const logs = [
        { time: '00:00:01', type: 'oper', message: '操作' },
        { time: '00:00:02', type: 'info', message: '信息' },
        { time: '00:00:03', type: 'error', message: '错误' },
        { time: '00:00:04', type: 'code', message: '代码' },
        { time: '00:00:05', type: 'unknown', message: '未知类型' },
      ]
      renderLogPanel({ logs })
      expandPanel()
      expect(screen.getByText('操作')).toBeInTheDocument()
      expect(screen.getByText('信息')).toBeInTheDocument()
      expect(screen.getByText('错误')).toBeInTheDocument()
      expect(screen.getByText('代码')).toBeInTheDocument()
      expect(screen.getByText('未知类型')).toBeInTheDocument()
    })

    it('折叠时应显示日志数量', () => {
      const { container } = renderLogPanel()
      const countElement = container.querySelector('.text-paper\\/60')
      expect(countElement?.textContent).toBe('4')
    })
  })

  describe('移动端响应式优化 (P1-2c)', () => {
    it('展开后时间戳列应有移动端隐藏类', () => {
      const { container } = renderLogPanel()
      expandPanel()
      const timeSpans = container.querySelectorAll('.shrink-0.text-xs')
      const timeSpan = timeSpans[0] as HTMLElement
      expect(timeSpan.className).toContain('hidden')
      expect(timeSpan.className).toContain('sm:block')
    })

    it('展开后日志消息应保持可读性', () => {
      renderLogPanel()
      expandPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
    })

    it('展开后日志条目应有 flex 布局', () => {
      const { container } = renderLogPanel()
      expandPanel()
      const logEntries = container.querySelectorAll('.animate-slide-up')
      expect(logEntries.length).toBe(sampleLogs.length)
    })

    it('展开后日志消息应有 break-all 处理长文本', () => {
      const longLog = [
        { time: '10:00:01', type: 'oper', message: '这是一个非常长的日志消息用于测试移动端换行行为是否正确处理' }
      ]
      renderLogPanel({ logs: longLog })
      expandPanel()
      const msg = screen.getByText(longLog[0].message)
      expect(msg.className).toContain('break-all')
    })
  })

  describe('自动滚动', () => {
    it('展开后应显示自动滚动按钮', () => {
      renderLogPanel()
      expandPanel()
      expect(screen.getByText('logPanel.autoScroll')).toBeInTheDocument()
    })

    it('点击自动滚动按钮应切换状态', () => {
      renderLogPanel()
      expandPanel()
      const btn = screen.getByText('logPanel.autoScroll')
      fireEvent.click(btn)
      expect(screen.getByText('logPanel.freeze')).toBeInTheDocument()
    })
  })
})
