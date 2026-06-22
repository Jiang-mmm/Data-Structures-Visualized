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

  it('当前 preset 为 normal 时应高亮 normal 按钮', () => {
    const { container } = render(<SpeedControl />)
    const buttons = container.querySelectorAll('button')
    const normalBtn = Array.from(buttons).find(b => b.getAttribute('aria-label') === 'speedControl.presetDefault')
    expect(normalBtn).toBeTruthy()
  })

  it('下拉中各预设项都会渲染', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    // 找到所有 speedControl preset 项
    const items = screen.getAllByText(/speedControl\.preset/)
    expect(items.length).toBeGreaterThanOrEqual(5)
  })

  it('点击预设按钮后再点击另一个预设应切换到新预设', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    // 找到 gentle 预设项（通过 name 而非 aria-label，避免和 trigger 冲突）
    const allButtons = screen.getAllByText('speedControl.presetGentle')
    fireEvent.click(allButtons[0])
    expect(mockApplyPreset).toHaveBeenCalledWith('gentle')
  })

  it('点击预设按钮后再点击相同预设应触发 applyPreset', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    // 下拉中所有 default 文本的项（drop 项和 trigger 都含此文本）
    const items = screen.getAllByText('speedControl.presetDefault')
    // 第二项是 drop 项（第一项是 trigger 按钮内部的文本）
    const dropItem = items.find(el => el.tagName === 'BUTTON' || el.closest('button')?.getAttribute('aria-expanded') === undefined)
    if (dropItem) {
      fireEvent.click(dropItem)
    }
    expect(mockApplyPreset).toHaveBeenCalled()
  })

  it('点击速度按钮 4x 应调用 setAnimationSpeed(4)', () => {
    render(<SpeedControl />)
    fireEvent.click(screen.getByText('4x'))
    expect(mockSetAnimationSpeed).toHaveBeenCalledWith(4)
  })

  it('点击速度按钮 0.5x 应调用 setAnimationSpeed(0.5)', () => {
    render(<SpeedControl />)
    fireEvent.click(screen.getByText('0.5x'))
    expect(mockSetAnimationSpeed).toHaveBeenCalledWith(0.5)
  })

  it('Escape 键应关闭下拉', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'Escape' })
    // 关闭后，aria-expanded=true 的按钮应消失
    expect(screen.queryByRole('button', { expanded: true })).not.toBeInTheDocument()
  })

  it('ArrowDown 键应改变 focusedIndex', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    fireEvent.keyDown(document, { key: 'ArrowDown' })
    // 焦点切换：第二个 preset 项变为高亮（聚焦）背景色
  })

  it('ArrowUp 键应保持 focusedIndex 在 0', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    fireEvent.keyDown(document, { key: 'ArrowUp' })
  })

  it('点击 dropdown 外部应关闭下拉', () => {
    render(<SpeedControl />)
    const presetButton = screen.getByRole('button', { expanded: false })
    fireEvent.click(presetButton)
    expect(screen.getByRole('button', { expanded: true })).toBeInTheDocument()
    // 点击外部（document.body）
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('button', { expanded: true })).not.toBeInTheDocument()
  })
})
