import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StepExplainer from '../components/StepExplainer'
import type { LearningStep } from '../configs/learning'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const mockStep: LearningStep = {
  id: 'step-1',
  title: '初始化数组',
  description: '创建一个包含待排序元素的数组',
  codeSnippet: 'const arr = [5, 3, 8, 1, 2]\nconst n = arr.length\nfor (let i = 0; i < n; i++) {\n  console.log(arr[i])\n}',
  highlightedLine: 1,
  highlightTerms: ['arr', 'const'],
}

const defaultProps = {
  step: mockStep,
  currentStepIndex: 0,
  totalSteps: 5,
  progress: 20,
  onNext: vi.fn(),
  onPrev: vi.fn(),
  onReset: vi.fn(),
  onGoToStep: vi.fn(),
  isAnimating: false,
}

function renderStepExplainer(overrides: Partial<typeof defaultProps> = {}) {
  const props = { ...defaultProps, ...overrides, onNext: vi.fn(), onPrev: vi.fn(), onReset: vi.fn() }
  return { ...render(<StepExplainer {...props} />), props }
}

describe('StepExplainer', () => {
  describe('空状态', () => {
    it('step 为 null 时应显示提示文本', () => {
      renderStepExplainer({ step: undefined })
      expect(screen.getByText('stepExplainer.selectAlgorithm')).toBeInTheDocument()
    })

    it('step 为 null 时不应显示按钮', () => {
      renderStepExplainer({ step: undefined })
      expect(screen.queryByText('stepExplainer.prev')).not.toBeInTheDocument()
      expect(screen.queryByText('stepExplainer.next')).not.toBeInTheDocument()
      expect(screen.queryByText('stepExplainer.reset')).not.toBeInTheDocument()
    })
  })

  describe('步骤内容渲染', () => {
    it('应渲染步骤标题', () => {
      renderStepExplainer()
      expect(screen.getByText('初始化数组')).toBeInTheDocument()
    })

    it('应渲染步骤描述', () => {
      renderStepExplainer()
      expect(screen.getByText('创建一个包含待排序元素的数组')).toBeInTheDocument()
    })

    it('应渲染代码片段', () => {
      const { container } = renderStepExplainer()
      const codeContainer = container.querySelector('.font-mono.text-xs')
      expect(codeContainer).toBeInTheDocument()
      expect(codeContainer?.textContent).toContain('const arr = [5, 3, 8, 1, 2]')
      expect(codeContainer?.textContent).toContain('const n = arr.length')
    })

    it('应渲染代码行号', () => {
      const { container } = renderStepExplainer()
      const codeContainer = container.querySelector('.font-mono.text-xs')
      expect(codeContainer?.textContent).toContain('1')
      expect(codeContainer?.textContent).toContain('2')
      expect(codeContainer?.textContent).toContain('3')
    })
  })

  describe('步骤计数器', () => {
    it('应显示步骤计数 "步骤 1 / 5"', () => {
      renderStepExplainer({ currentStepIndex: 0, totalSteps: 5 })
      expect(screen.getByText('stepExplainer.step 1 / 5')).toBeInTheDocument()
    })

    it('应根据 currentStepIndex 显示正确的步骤编号', () => {
      renderStepExplainer({ currentStepIndex: 3, totalSteps: 10 })
      expect(screen.getByText('stepExplainer.step 4 / 10')).toBeInTheDocument()
    })
  })

  describe('进度条', () => {
    it('应渲染进度条容器', () => {
      const { container } = renderStepExplainer({ progress: 40 })
      const progressOuter = container.querySelector('.w-32.h-2')
      expect(progressOuter).toBeInTheDocument()
    })

    it('进度条宽度应匹配 progress 属性', () => {
      const { container } = renderStepExplainer({ progress: 60 })
      const progressOuter = container.querySelector('.w-32.h-2')
      const progressInner = progressOuter?.querySelector('.bg-accent-blue')
      expect(progressInner).toBeInTheDocument()
      expect(progressInner).toHaveStyle({ width: '60%' })
    })

    it('progress 为 0 时进度条宽度应为 0%', () => {
      const { container } = renderStepExplainer({ progress: 0 })
      const progressOuter = container.querySelector('.w-32.h-2')
      const progressInner = progressOuter?.querySelector('.bg-accent-blue')
      expect(progressInner).toHaveStyle({ width: '0%' })
    })

    it('progress 为 100 时进度条宽度应为 100%', () => {
      const { container } = renderStepExplainer({ progress: 100 })
      const progressOuter = container.querySelector('.w-32.h-2')
      const progressInner = progressOuter?.querySelector('.bg-accent-blue')
      expect(progressInner).toHaveStyle({ width: '100%' })
    })
  })

  describe('按钮禁用状态', () => {
    it('第一步时上一步按钮应禁用', () => {
      renderStepExplainer({ currentStepIndex: 0, totalSteps: 5 })
      expect(screen.getByText('stepExplainer.prev')).toBeDisabled()
    })

    it('最后一步时下一步按钮应禁用', () => {
      renderStepExplainer({ currentStepIndex: 4, totalSteps: 5 })
      expect(screen.getByText('stepExplainer.next')).toBeDisabled()
    })

    it('isAnimating 为 true 时所有按钮应禁用', () => {
      renderStepExplainer({ currentStepIndex: 2, totalSteps: 5, isAnimating: true })
      expect(screen.getByText('stepExplainer.prev')).toBeDisabled()
      expect(screen.getByText('stepExplainer.next')).toBeDisabled()
      expect(screen.getByText('stepExplainer.reset')).toBeDisabled()
    })

    it('非边界且未动画时所有按钮应启用', () => {
      renderStepExplainer({ currentStepIndex: 2, totalSteps: 5, isAnimating: false })
      expect(screen.getByText('stepExplainer.prev')).not.toBeDisabled()
      expect(screen.getByText('stepExplainer.next')).not.toBeDisabled()
      expect(screen.getByText('stepExplainer.reset')).not.toBeDisabled()
    })

    it('第一步时重置按钮应仍可点击', () => {
      renderStepExplainer({ currentStepIndex: 0, totalSteps: 5 })
      expect(screen.getByText('stepExplainer.reset')).not.toBeDisabled()
    })
  })

  describe('按钮点击事件', () => {
    it('点击下一步应调用 onNext', () => {
      const { props } = renderStepExplainer({ currentStepIndex: 0, totalSteps: 5 })
      fireEvent.click(screen.getByText('stepExplainer.next'))
      expect(props.onNext).toHaveBeenCalledTimes(1)
    })

    it('点击上一步应调用 onPrev', () => {
      const { props } = renderStepExplainer({ currentStepIndex: 2, totalSteps: 5 })
      fireEvent.click(screen.getByText('stepExplainer.prev'))
      expect(props.onPrev).toHaveBeenCalledTimes(1)
    })

    it('点击重置应调用 onReset', () => {
      const { props } = renderStepExplainer({ currentStepIndex: 2, totalSteps: 5 })
      fireEvent.click(screen.getByText('stepExplainer.reset'))
      expect(props.onReset).toHaveBeenCalledTimes(1)
    })
  })

  describe('代码行高亮', () => {
    it('高亮行应包含高亮样式类', () => {
      const { container } = renderStepExplainer({ step: { ...mockStep, highlightedLine: 1 } })
      const codeContainer = container.querySelector('.font-mono.text-xs')
      const lines = codeContainer?.querySelectorAll(':scope > div')
      expect(lines?.[0].className).toContain('bg-accent-blue')
      expect(lines?.[0].className).toContain('text-accent-blue')
    })

    it('非高亮行不应包含高亮样式类', () => {
      const { container } = renderStepExplainer({ step: { ...mockStep, highlightedLine: 1 } })
      const codeContainer = container.querySelector('.font-mono.text-xs')
      const lines = codeContainer?.querySelectorAll(':scope > div')
      expect(lines?.[1].className).not.toContain('bg-accent-blue')
      expect(lines?.[1].className).toContain('text-ink')
    })

    it('高亮第三行时该行应有高亮样式', () => {
      const { container } = renderStepExplainer({ step: { ...mockStep, highlightedLine: 3 } })
      const codeContainer = container.querySelector('.font-mono.text-xs')
      const lines = codeContainer?.querySelectorAll(':scope > div')
      expect(lines?.[2].className).toContain('bg-accent-blue')
    })
  })

  describe('关键词高亮', () => {
    it('代码中的关键词应被高亮显示', () => {
      const { container } = renderStepExplainer({
        step: { ...mockStep, highlightTerms: ['arr'], highlightedLine: 1 }
      })
      const codeContainer = container.querySelector('.font-mono.text-xs')
      const firstLine = codeContainer?.querySelectorAll(':scope > div')?.[0]
      const highlighted = firstLine?.querySelector('.bg-accent-amber\\/20')
      expect(highlighted).toBeInTheDocument()
      expect(highlighted?.textContent).toBe('arr')
    })

    it('多个关键词应都被高亮', () => {
      const { container } = renderStepExplainer({
        step: { ...mockStep, highlightTerms: ['const', 'arr'], highlightedLine: 1 }
      })
      const codeContainer = container.querySelector('.font-mono.text-xs')
      const firstLine = codeContainer?.querySelectorAll(':scope > div')?.[0]
      const terms = firstLine?.querySelectorAll('.bg-accent-amber\\/20')
      expect(terms?.length).toBeGreaterThanOrEqual(2)
    })

    it('空关键词数组不应添加高亮', () => {
      const { container } = renderStepExplainer({
        step: { ...mockStep, highlightTerms: [], highlightedLine: 1 }
      })
      const codeContainer = container.querySelector('.font-mono.text-xs')
      const firstLine = codeContainer?.querySelectorAll(':scope > div')?.[0]
      const terms = firstLine?.querySelectorAll('.bg-accent-amber\\/20')
      expect(terms?.length).toBe(0)
    })
  })

  describe('步骤导航点', () => {
    it('应渲染正确数量的步骤点', () => {
      const { container } = renderStepExplainer({ totalSteps: 5, currentStepIndex: 0 })
      const dots = container.querySelectorAll('button[aria-label^="stepExplainer.step"]')
      expect(dots.length).toBe(5)
    })

    it('当前步骤点应有放大样式', () => {
      const { container } = renderStepExplainer({ totalSteps: 3, currentStepIndex: 1 })
      const dots = container.querySelectorAll('button[aria-label^="stepExplainer.step"]')
      expect(dots[1].className).toContain('scale-125')
      expect(dots[1].className).toContain('bg-accent-blue')
    })

    it('已完成步骤点应有绿色样式', () => {
      const { container } = renderStepExplainer({ totalSteps: 4, currentStepIndex: 2 })
      const dots = container.querySelectorAll('button[aria-label^="stepExplainer.step"]')
      expect(dots[0].className).toContain('bg-accent-emerald')
      expect(dots[1].className).toContain('bg-accent-emerald')
    })

    it('点击步骤点应调用 onGoToStep', () => {
      const onGoToStep = vi.fn()
      const { container } = renderStepExplainer({ totalSteps: 4, currentStepIndex: 0, onGoToStep })
      const dots = container.querySelectorAll('button[aria-label^="stepExplainer.step"]')
      fireEvent.click(dots[2])
      expect(onGoToStep).toHaveBeenCalledWith(2)
    })
  })

  describe('自动播放', () => {
    it('应渲染自动播放按钮', () => {
      renderStepExplainer()
      expect(screen.getByText('stepExplainer.autoPlay')).toBeInTheDocument()
    })

    it('点击自动播放按钮应切换为暂停', () => {
      renderStepExplainer({ currentStepIndex: 0, totalSteps: 5 })
      fireEvent.click(screen.getByText('stepExplainer.autoPlay'))
      expect(screen.getByText('stepExplainer.pause')).toBeInTheDocument()
    })

    it('最后一步时自动播放按钮应禁用', () => {
      renderStepExplainer({ currentStepIndex: 4, totalSteps: 5 })
      expect(screen.getByText('stepExplainer.autoPlay')).toBeDisabled()
    })

    it('应显示速度选择按钮', () => {
      renderStepExplainer()
      expect(screen.getByText('1s')).toBeInTheDocument()
      expect(screen.getByText('2s')).toBeInTheDocument()
      expect(screen.getByText('3s')).toBeInTheDocument()
      expect(screen.getByText('5s')).toBeInTheDocument()
    })
  })
})
