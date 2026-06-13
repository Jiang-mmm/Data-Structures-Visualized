import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ExportImport from '../components/ExportImport'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: vi.fn().mockReturnValue({
    t: (key: string) => key,
    lang: 'zh',
    animationSpeed: 1,
    setAnimationSpeed: vi.fn(),
    showIndices: true,
    setShowIndices: vi.fn(),
    cycleSpeed: 1,
    currentPreset: 'default',
    applyPreset: vi.fn(),
    setLanguage: vi.fn(),
    theme: 'default',
  }),
}))

vi.mock('../utils/dataExport', () => ({
  exportState: vi.fn(),
  importState: vi.fn(),
}))

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn(),
}))

import { exportState, importState } from '../utils/dataExport'
import { showToast } from '../components/toastStore'

const mockExportState = exportState as ReturnType<typeof vi.fn>
const mockImportState = importState as ReturnType<typeof vi.fn>
const mockShowToast = showToast as ReturnType<typeof vi.fn>

describe('ExportImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基础渲染', () => {
    it('应该渲染导出按钮', () => {
      render(<ExportImport dataType="array" data={[1, 2, 3]} />)
      expect(screen.getByText('↓ exportImport.export')).toBeTruthy()
    })

    it('应该渲染导入按钮', () => {
      render(<ExportImport dataType="array" data={[1, 2, 3]} />)
      expect(screen.getByText('↑ exportImport.import')).toBeTruthy()
    })

    it('应该渲染隐藏的文件输入', () => {
      const { container } = render(<ExportImport dataType="array" data={[1, 2, 3]} />)
      const input = container.querySelector('input[type="file"]')
      expect(input).toBeTruthy()
      expect(input?.className).toContain('hidden')
    })
  })

  describe('导出功能', () => {
    it('点击导出按钮应该调用 exportState', () => {
      render(<ExportImport dataType="array" data={[1, 2, 3]} />)
      fireEvent.click(screen.getByText('↓ exportImport.export'))
      expect(mockExportState).toHaveBeenCalledWith('array', [1, 2, 3])
    })
  })

  describe('导入功能', () => {
    it('点击导入按钮应该触发文件选择', () => {
      const { container } = render(<ExportImport dataType="array" data={[1, 2, 3]} />)
      const input = container.querySelector('input[type="file"]')!
      const clickSpy = vi.spyOn(input as HTMLInputElement, 'click')
      fireEvent.click(screen.getByText('↑ exportImport.import'))
      expect(clickSpy).toHaveBeenCalled()
    })

    it('选择文件后应该调用 importState', async () => {
      mockImportState.mockResolvedValue([4, 5, 6])
      const onImport = vi.fn()
      const { container } = render(
        <ExportImport dataType="array" data={[1, 2, 3]} onImport={onImport} />
      )
      const input = container.querySelector('input[type="file"]')!
      const file = new File(['{"data":[4,5,6]}'], 'test.json', { type: 'application/json' })
      fireEvent.change(input, { target: { files: [file] } })
      await vi.waitFor(() => {
        expect(mockImportState).toHaveBeenCalled()
      })
    })

    it('导入失败时显示错误 toast', async () => {
      mockImportState.mockRejectedValue(new Error('解析失败'))
      const { container } = render(
        <ExportImport dataType="array" data={[1, 2, 3]} />
      )
      const input = container.querySelector('input[type="file"]')!
      const file = new File(['invalid'], 'test.json', { type: 'application/json' })
      fireEvent.change(input, { target: { files: [file] } })
      await vi.waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'error' })
        )
      })
    })
  })

  describe('禁用状态', () => {
    it('disabled 时导出按钮应该禁用', () => {
      render(<ExportImport dataType="array" data={[1, 2, 3]} disabled={true} />)
      const buttons = screen.getAllByRole('button')
      buttons.forEach(btn => expect(btn).toBeDisabled())
    })
  })
})