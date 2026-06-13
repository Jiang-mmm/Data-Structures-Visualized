import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UndoRedoBar from '../components/UndoRedoBar'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('UndoRedoBar', () => {
  const defaultProps = {
    canUndo: true,
    canRedo: true,
    undo: vi.fn(),
    redo: vi.fn(),
    getUndoPreview: () => null,
    getRedoPreview: () => null,
    isAnimating: false,
  }

  it('应该渲染撤销和重做按钮', () => {
    render(<UndoRedoBar {...defaultProps} />)
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('撤销按钮在 canUndo=false 时应该被禁用', () => {
    render(<UndoRedoBar {...defaultProps} canUndo={false} />)
    expect(screen.getByText('common.undo')).toBeDisabled()
  })

  it('重做按钮在 canRedo=false 时应该被禁用', () => {
    render(<UndoRedoBar {...defaultProps} canRedo={false} />)
    expect(screen.getByText('common.redo')).toBeDisabled()
  })

  it('撤销按钮在 isAnimating=true 时应该被禁用', () => {
    render(<UndoRedoBar {...defaultProps} isAnimating={true} />)
    expect(screen.getByText('common.undo')).toBeDisabled()
  })

  it('点击撤销按钮应该调用 undo', () => {
    const undo = vi.fn()
    render(<UndoRedoBar {...defaultProps} undo={undo} />)
    fireEvent.click(screen.getByText('common.undo'))
    expect(undo).toHaveBeenCalledTimes(1)
  })

  it('点击重做按钮应该调用 redo', () => {
    const redo = vi.fn()
    render(<UndoRedoBar {...defaultProps} redo={redo} />)
    fireEvent.click(screen.getByText('common.redo'))
    expect(redo).toHaveBeenCalledTimes(1)
  })
})
