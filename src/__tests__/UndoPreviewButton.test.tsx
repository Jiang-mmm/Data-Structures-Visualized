import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UndoPreviewButton from '../components/UndoPreviewButton'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

describe('UndoPreviewButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该渲染按钮', () => {
      render(<UndoPreviewButton onClick={vi.fn()}>撤销</UndoPreviewButton>)
      expect(screen.getByRole('button')).toBeTruthy()
    })

    it('应该渲染子元素内容', () => {
      render(<UndoPreviewButton onClick={vi.fn()}>撤销操作</UndoPreviewButton>)
      expect(screen.getByText('撤销操作')).toBeTruthy()
    })
  })

  describe('点击事件', () => {
    it('点击应该调用 onClick', () => {
      const onClick = vi.fn()
      render(<UndoPreviewButton onClick={onClick}>撤销</UndoPreviewButton>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })

  describe('禁用状态', () => {
    it('disabled 时按钮应该禁用', () => {
      render(<UndoPreviewButton onClick={vi.fn()} disabled={true}>撤销</UndoPreviewButton>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('disabled 时点击不触发 onClick', () => {
      const onClick = vi.fn()
      render(<UndoPreviewButton onClick={onClick} disabled={true}>撤销</UndoPreviewButton>)
      fireEvent.click(screen.getByRole('button'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })

  describe('预览功能', () => {
    it('鼠标悬停时显示预览', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={[1, 2, 3]}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.getByText('undoPreview.defaultLabel')).toBeTruthy()
    })

    it('鼠标离开时隐藏预览', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={[1, 2, 3]}>
          撤销
        </UndoPreviewButton>
      )
      const btn = screen.getByRole('button')
      fireEvent.mouseEnter(btn)
      fireEvent.mouseLeave(btn)
      expect(screen.queryByText('undoPreview.defaultLabel')).toBeNull()
    })

    it('无 previewData 时不显示预览', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.queryByText('undoPreview.defaultLabel')).toBeNull()
    })

    it('disabled 时悬停不显示预览', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} disabled={true} previewData={[1, 2, 3]}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.queryByText('undoPreview.defaultLabel')).toBeNull()
    })

    it('应该显示自定义预览标签', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={[1, 2]} previewLabel="自定义标签">
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.getByText('自定义标签')).toBeTruthy()
    })
  })

  describe('formatPreviewData', () => {
    it('应该格式化数组数据', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={[1, 2, 3]}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.getByText('[1, 2, 3]')).toBeTruthy()
    })

    it('空数组应该显示空数组', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={[]}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.getByText('undoPreview.emptyArray')).toBeTruthy()
    })

    it('长数组应该截断显示', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      const preview = screen.getByText(/\[.*\.\.\..*\]/)
      expect(preview).toBeTruthy()
    })

    it('应该格式化对象数据', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={{ key1: 1, key2: 2 }}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.getByText('{key1, key2}')).toBeTruthy()
    })

    it('空对象应该显示空对象', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={{}}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.getByText('undoPreview.emptyObject')).toBeTruthy()
    })
  })

  describe('预览不触发场景', () => {
    it('null previewData 不显示预览', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={null}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.queryByText('undoPreview.defaultLabel')).toBeNull()
    })

    it('undefined previewData 不显示预览', () => {
      render(
        <UndoPreviewButton onClick={vi.fn()} previewData={undefined}>
          撤销
        </UndoPreviewButton>
      )
      fireEvent.mouseEnter(screen.getByRole('button'))
      expect(screen.queryByText('undoPreview.defaultLabel')).toBeNull()
    })
  })

  describe('按钮变体样式', () => {
    it('默认变体应该渲染', () => {
      render(<UndoPreviewButton onClick={vi.fn()}>撤销</UndoPreviewButton>)
      const btn = screen.getByRole('button')
      expect(btn).toBeTruthy()
    })

    it('primary 变体应该渲染', () => {
      render(<UndoPreviewButton onClick={vi.fn()} variant="primary">撤销</UndoPreviewButton>)
      const btn = screen.getByRole('button')
      expect(btn).toBeTruthy()
    })

    it('danger 变体应该渲染', () => {
      render(<UndoPreviewButton onClick={vi.fn()} variant="danger">撤销</UndoPreviewButton>)
      const btn = screen.getByRole('button')
      expect(btn).toBeTruthy()
    })

    it('success 变体应该渲染', () => {
      render(<UndoPreviewButton onClick={vi.fn()} variant="success">撤销</UndoPreviewButton>)
      const btn = screen.getByRole('button')
      expect(btn).toBeTruthy()
    })
  })
})