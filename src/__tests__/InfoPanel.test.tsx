import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import InfoPanel from '../components/InfoPanel'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const sampleLogs = [
  { time: '10:00:01', type: 'oper', message: '操作日志1' },
  { time: '10:00:02', type: 'info', message: '信息日志1' },
  { time: '10:00:03', type: 'error', message: '错误日志1' },
  { time: '10:00:04', type: 'code', message: '代码日志1', codeStepId: 'insert' },
]

const mockLearningMode = {
  currentStep: { id: 'init', title: 'Init', description: 'Init desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
  currentStepIndex: 0,
  totalSteps: 3,
  progress: 33,
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  goToStep: vi.fn(),
  reset: vi.fn(),
  steps: [
    { id: 'init', title: 'Init', description: 'Init desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
    { id: 'insert', title: 'Insert', description: 'Insert desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
    { id: 'delete', title: 'Delete', description: 'Delete desc', codeSnippet: '', highlightedLine: 0, highlightTerms: [] },
  ],
  hasSteps: true,
}

function renderInfoPanel(props: Partial<Parameters<typeof InfoPanel>[0]> = {}) {
  return render(
    <InfoPanel
      logs={sampleLogs}
      learningMode={mockLearningMode as any}
      isAnimating={false}
      onJumpToStep={vi.fn()}
      {...props}
    />
  )
}

describe('InfoPanel', () => {
  describe('Tab 切换', () => {
    it('桌面端应渲染两个 tab 按钮', () => {
      renderInfoPanel()
      // 桌面端 aside 内的 tab 按钮
      const logTabs = screen.getAllByText('infoPanel.tabLog')
      expect(logTabs.length).toBeGreaterThanOrEqual(1)
      const learningTabs = screen.getAllByText('infoPanel.tabLearning')
      expect(learningTabs.length).toBeGreaterThanOrEqual(1)
    })

    it('默认应激活日志 tab', () => {
      renderInfoPanel()
      // 找到 aria-selected=true 的日志 tab 按钮
      const logTabs = screen.getAllByText('infoPanel.tabLog')
      const selectedLogTab = logTabs.find(el => el.closest('button')?.getAttribute('aria-selected') === 'true')
      expect(selectedLogTab).toBeDefined()
    })

    it('点击学习模式 tab 应切换', () => {
      renderInfoPanel()
      // 点击第一个学习模式 tab（桌面端）
      const learningTabs = screen.getAllByText('infoPanel.tabLearning')
      fireEvent.click(learningTabs[0])
      const selectedLearningTabs = screen.getAllByText('infoPanel.tabLearning')
        .filter(el => el.closest('button')?.getAttribute('aria-selected') === 'true')
      expect(selectedLearningTabs.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('日志 tab 内容', () => {
    it('应渲染所有日志消息', () => {
      renderInfoPanel()
      expect(screen.getByText('操作日志1')).toBeInTheDocument()
      expect(screen.getByText('信息日志1')).toBeInTheDocument()
      expect(screen.getByText('错误日志1')).toBeInTheDocument()
      expect(screen.getByText('代码日志1')).toBeInTheDocument()
    })

    it('应渲染日志数量徽章', () => {
      renderInfoPanel()
      // 日志 tab 按钮内包含数量
      const logTabs = screen.getAllByText('infoPanel.tabLog')
      const tabWithCount = logTabs.find(el => el.closest('button')?.textContent?.includes('4'))
      expect(tabWithCount).toBeDefined()
    })

    it('codeStepId 存在时应显示查看代码按钮', () => {
      renderInfoPanel()
      expect(screen.getByText('logPanel.viewCode')).toBeInTheDocument()
    })
  })

  describe('学习模式 tab', () => {
    it('切换到学习模式应渲染 StepExplainer', () => {
      renderInfoPanel()
      const learningTabs = screen.getAllByText('infoPanel.tabLearning')
      fireEvent.click(learningTabs[0])
      // StepExplainer 渲染 step title（桌面端 + 移动端展开态都会渲染）
      const initTitles = screen.getAllByText('Init')
      expect(initTitles.length).toBeGreaterThanOrEqual(1)
    })

    it('hasSteps 为 false 时不应显示学习模式 tab', () => {
      renderInfoPanel({ learningMode: { ...mockLearningMode, hasSteps: false, steps: [] } as any })
      expect(screen.queryByText('infoPanel.tabLearning')).not.toBeInTheDocument()
    })
  })

  describe('空状态', () => {
    it('日志为空时应显示空状态提示', () => {
      renderInfoPanel({ logs: [] })
      expect(screen.getByText(/infoPanel\.logEmpty/)).toBeInTheDocument()
    })
  })
})
