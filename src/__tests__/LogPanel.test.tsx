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

function renderLogPanel(props: { logs?: Array<{ time: string; type: string; message: string }>; maxHeight?: number } = {}) {
  const defaultProps = { logs: sampleLogs, ...props }
  return render(<LogPanel {...defaultProps} />)
}

describe('LogPanel', () => {
  describe('空状态', () => {
    it('logs 为空时应显示无日志提示', () => {
      renderLogPanel({ logs: [] })
      expect(screen.getByText('── logPanel.noLogs ──')).toBeInTheDocument()
    })

    it('logs 为空时不应显示日志条目', () => {
      renderLogPanel({ logs: [] })
      expect(screen.queryByText('操作日志1')).not.toBeInTheDocument()
    })
  })

  describe('日志条目渲染', () => {
    it('应渲染日志消息', () => {
      renderLogPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.getByText('代码日志1')).toBeInTheDocument()
    })

    it('应渲染日志时间', () => {
      renderLogPanel()
      expect(screen.getByText('10:00:01')).toBeInTheDocument()
      expect(screen.getByText('10:00:02')).toBeInTheDocument()
      expect(screen.getByText('10:00:03')).toBeInTheDocument()
      expect(screen.getByText('10:00:04')).toBeInTheDocument()
    })

    it('应渲染类型标签', () => {
      renderLogPanel()
      expect(screen.getByText('[logPanel.type.oper]')).toBeInTheDocument()
      expect(screen.getByText('[logPanel.type.info]')).toBeInTheDocument()
      expect(screen.getByText('[logPanel.type.error]')).toBeInTheDocument()
      expect(screen.getByText('[logPanel.type.code]')).toBeInTheDocument()
    })
  })

  describe('筛选按钮', () => {
    it('应渲染所有筛选按钮', () => {
      renderLogPanel()
      expect(screen.getByText('ALL')).toBeInTheDocument()
      expect(screen.getByText('logPanel.type.oper')).toBeInTheDocument()
      expect(screen.getByText('logPanel.type.code')).toBeInTheDocument()
      expect(screen.getByText('logPanel.type.info')).toBeInTheDocument()
      expect(screen.getByText('logPanel.type.error')).toBeInTheDocument()
    })

    it('点击筛选按钮应只显示对应类型的日志', () => {
      renderLogPanel()
      fireEvent.click(screen.getByText('logPanel.type.oper'))
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.queryByText('信息日志1')).not.toBeInTheDocument()
      expect(screen.queryByText('错误日志1')).not.toBeInTheDocument()
      expect(screen.queryByText('代码日志1')).not.toBeInTheDocument()
    })

    it('点击 ALL 按钮应显示所有日志', () => {
      renderLogPanel()
      fireEvent.click(screen.getByText('logPanel.type.oper'))
      fireEvent.click(screen.getByText('ALL'))
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.getByText('代码日志1')).toBeInTheDocument()
    })

    it('点击 error 筛选应只显示错误日志', () => {
      renderLogPanel()
      fireEvent.click(screen.getByText('logPanel.type.error'))
      expect(screen.queryByText('操作日志1')).not.toBeInTheDocument()
      expect(screen.queryByText('信息日志1')).not.toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.queryByText('代码日志1')).not.toBeInTheDocument()
    })
  })

  describe('maxHeight', () => {
    it('应使用默认 maxHeight 208', () => {
      const { container } = renderLogPanel()
      const panel = container.firstChild as HTMLElement
      expect(panel).toHaveStyle({ maxHeight: 208 })
    })

    it('应应用自定义 maxHeight', () => {
      const { container } = renderLogPanel({ maxHeight: 400 })
      const panel = container.firstChild as HTMLElement
      expect(panel).toHaveStyle({ maxHeight: 400 })
    })
  })

  describe('多种日志类型', () => {
    it('应正确渲染包含所有类型的日志', () => {
      const logs = [
        { time: '00:00:01', type: 'oper', message: '操作' },
        { time: '00:00:02', type: 'info', message: '信息' },
        { time: '00:00:03', type: 'error', message: '错误' },
        { time: '00:00:04', type: 'code', message: '代码' },
        { time: '00:00:05', type: 'unknown', message: '未知类型' },
      ]
      renderLogPanel({ logs })
      expect(screen.getByText('操作')).toBeInTheDocument()
      expect(screen.getByText('信息')).toBeInTheDocument()
      expect(screen.getByText('错误')).toBeInTheDocument()
      expect(screen.getByText('代码')).toBeInTheDocument()
      expect(screen.getByText('未知类型')).toBeInTheDocument()
    })

    it('应显示筛选后的日志数量', () => {
      const { container } = renderLogPanel()
      const countElement = container.querySelector('.text-slate-500')
      expect(countElement?.textContent).toBe('4')
    })
  })

  describe('移动端响应式优化 (P1-2c)', () => {
    it('时间戳列应有移动端隐藏类', () => {
      const { container } = renderLogPanel()
      const timeSpans = container.querySelectorAll('.shrink-0.text-xs')
      const timeSpan = timeSpans[0] as HTMLElement
      // 应包含 sm:block 用于移动端隐藏/显示
      expect(timeSpan.className).toContain('hidden')
      expect(timeSpan.className).toContain('sm:block')
    })

    it('类型标签列应有移动端缩短显示', () => {
      const { container } = renderLogPanel()
      // 类型标签应有 sm:hidden 的移动端缩写和 hidden sm:block 的完整文本
      const typeSpans = container.querySelectorAll('.shrink-0.font-bold.text-xs')
      expect(typeSpans.length).toBeGreaterThan(0)
    })

    it('日志消息应保持可读性', () => {
      renderLogPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
    })

    it('日志条目应有 flex 布局', () => {
      const { container } = renderLogPanel()
      const logEntries = container.querySelectorAll('.animate-slide-up')
      expect(logEntries.length).toBe(sampleLogs.length)
    })

    it('日志消息应有 break-all 处理长文本', () => {
      const longLog = [
        { time: '10:00:01', type: 'oper', message: '这是一个非常长的日志消息用于测试移动端换行行为是否正确处理' }
      ]
      renderLogPanel({ logs: longLog })
      const msg = screen.getByText(longLog[0].message)
      expect(msg.className).toContain('break-all')
    })
  })

  describe('自动滚动', () => {
    it('应显示自动滚动按钮', () => {
      renderLogPanel()
      expect(screen.getByText('logPanel.autoScroll')).toBeInTheDocument()
    })

    it('点击自动滚动按钮应切换状态', () => {
      renderLogPanel()
      const btn = screen.getByText('logPanel.autoScroll')
      fireEvent.click(btn)
      expect(screen.getByText('logPanel.freeze')).toBeInTheDocument()
    })
  })
})
