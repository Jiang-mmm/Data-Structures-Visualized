import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SpeedControl from '../components/SpeedControl'

const mockApplyPreset = vi.fn()
const mockCycleSpeed = vi.fn()
const mockSetAnimationSpeed = vi.fn()

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({
    t: (key: string) => key,
    animationSpeed: 1,
    currentPreset: 'normal',
    applyPreset: mockApplyPreset,
    cycleSpeed: mockCycleSpeed,
    setAnimationSpeed: mockSetAnimationSpeed,
  }),
}))

describe('SpeedControl', () => {
  it('应该渲染速度选项按钮', () => {
    render(<SpeedControl />)
    expect(screen.getByText('1x')).toBeInTheDocument()
    expect(screen.getByText('0.5x')).toBeInTheDocument()
    expect(screen.getByText('2x')).toBeInTheDocument()
  })

  it('应该显示动画速度标签', () => {
    render(<SpeedControl />)
    expect(screen.getByText('settings.animationSpeed:')).toBeInTheDocument()
  })

  it('点击速度按钮应该调用 setAnimationSpeed', () => {
    render(<SpeedControl />)
    fireEvent.click(screen.getByText('2x'))
    expect(mockSetAnimationSpeed).toHaveBeenCalledWith(2)
  })

  it('点击预设按钮应该打开下拉菜单', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
  })

  it('应该有 aria-label 属性', () => {
    render(<SpeedControl />)
    expect(screen.getByLabelText('speedControl.presetDefault')).toBeInTheDocument()
  })
})
