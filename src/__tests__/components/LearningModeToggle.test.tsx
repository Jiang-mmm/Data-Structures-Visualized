import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LearningModeToggle from '../../components/LearningModeToggle'

vi.mock('../../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

const baseLearningMode = {
  currentStep: null,
  currentStepIndex: 0,
  totalSteps: 0,
  progress: 0,
  nextStep: vi.fn(),
  prevStep: vi.fn(),
  goToStep: vi.fn(),
  reset: vi.fn(),
}

function renderToggle(props: Partial<React.ComponentProps<typeof LearningModeToggle>> = {}) {
  const setShowLearning = props.setShowLearning ?? vi.fn()
  return {
    setShowLearning,
    ...render(
      <LearningModeToggle
        showLearning={props.showLearning ?? false}
        setShowLearning={setShowLearning}
        learningMode={props.learningMode ?? baseLearningMode}
        isAnimating={props.isAnimating ?? false}
      >
        {props.children ?? <div>子内容</div>}
      </LearningModeToggle>
    ),
  }
}

describe('LearningModeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('关闭时应显示 learning.open 文本', () => {
    renderToggle({ showLearning: false })
    expect(screen.getByText('learning.open')).toBeInTheDocument()
  })

  it('展开时应显示 learning.close 文本', () => {
    renderToggle({ showLearning: true })
    expect(screen.getByText('learning.close')).toBeInTheDocument()
  })

  it('展开时浮动按钮 aria-expanded 应为 true', () => {
    const { container } = renderToggle({ showLearning: true })
    // 浮动按钮是 absolute 定位（fixed 类），侧边栏里也有一个 close 按钮
    const toggleBtn = container.querySelector('button[aria-expanded="true"]') as HTMLElement
    expect(toggleBtn).toBeTruthy()
  })

  it('关闭时浮动按钮 aria-expanded 应为 false', () => {
    const { container } = renderToggle({ showLearning: false })
    const toggleBtn = container.querySelector('button[aria-expanded="false"]') as HTMLElement
    expect(toggleBtn).toBeTruthy()
  })

  it('点击浮动按钮应切换 setShowLearning', () => {
    const setShowLearning = vi.fn()
    renderToggle({ showLearning: false, setShowLearning })
    fireEvent.click(screen.getByRole('button', { name: 'learning.open' }))
    expect(setShowLearning).toHaveBeenCalledWith(true)
  })

  it('展开时点击侧边栏遮罩应关闭面板', () => {
    const setShowLearning = vi.fn()
    const { container } = renderToggle({ showLearning: true, setShowLearning })
    // 找到 inset-0 遮罩层（第一个含 z-40 的兄弟）
    const overlay = container.querySelector('.bg-black\\/20') as HTMLElement
    expect(overlay).toBeTruthy()
    fireEvent.click(overlay)
    expect(setShowLearning).toHaveBeenCalledWith(false)
  })

  it('展开时应渲染侧边栏标题', () => {
    renderToggle({ showLearning: true })
    expect(screen.getByText('learning.title')).toBeInTheDocument()
  })

  it('展开时应渲染子内容', () => {
    renderToggle({ showLearning: true, children: <div>子内容</div> })
    expect(screen.getByText('子内容')).toBeInTheDocument()
  })

  it('关闭时不应渲染子内容', () => {
    renderToggle({ showLearning: false, children: <div>子内容</div> })
    expect(screen.queryByText('子内容')).not.toBeInTheDocument()
  })

  it('侧边栏中的关闭按钮应触发 setShowLearning(false)', () => {
    const setShowLearning = vi.fn()
    const { container } = renderToggle({ showLearning: true, setShowLearning })
    // 侧边栏的关闭按钮：含 aria-label='learning.close' 且不带 aria-expanded
    const closeBtn = Array.from(container.querySelectorAll('button[aria-label="learning.close"]'))
      .find(btn => !btn.hasAttribute('aria-expanded'))
    expect(closeBtn).toBeTruthy()
    fireEvent.click(closeBtn as HTMLElement)
    expect(setShowLearning).toHaveBeenCalledWith(false)
  })
})
