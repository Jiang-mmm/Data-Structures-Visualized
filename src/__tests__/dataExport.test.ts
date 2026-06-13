import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportState, importState, exportPerformanceCSV, exportPerformanceJSON } from '../utils/dataExport'
import { showToast } from '../components/toastStore'

vi.mock('../components/toastStore', () => ({
  showToast: vi.fn()
}))

describe('dataExport.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  describe('exportState', () => {
    it('应该创建正确格式的导出数据', () => {
      const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
      const mockRevokeObjectURL = vi.fn()
      window.URL.createObjectURL = mockCreateObjectURL
      window.URL.revokeObjectURL = mockRevokeObjectURL

      const testState = { items: [1, 2, 3], config: 'test' }

      exportState('array', testState)

      expect(mockCreateObjectURL).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'application/json'
        })
      )
    })

    it('应该使用正确的文件名格式', () => {
      const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
      const mockRevokeObjectURL = vi.fn()
      window.URL.createObjectURL = mockCreateObjectURL
      window.URL.revokeObjectURL = mockRevokeObjectURL

      const createElementSpy = vi.spyOn(document, 'createElement')
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn()
      }
      createElementSpy.mockReturnValue(mockAnchor as any)

      exportState('stack', [1, 2, 3])

      expect(mockAnchor.download).toMatch(/^ds-visualizer-stack-\d+\.json$/)
    })

    it('应该在导出后清理 DOM 元素', () => {
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn()
      }
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockAnchor as any)
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockAnchor as any)
      window.URL.createObjectURL = vi.fn(() => 'blob:test-url')
      window.URL.revokeObjectURL = vi.fn()

      exportState('queue', [10, 20])

      expect(appendChildSpy).toHaveBeenCalledTimes(1)
      expect(removeChildSpy).toHaveBeenCalledTimes(1)
    })

    it('应该创建包含必要字段的 JSON', () => {
      let capturedBlob: Blob | null = null
      const mockCreateObjectURL = vi.fn((blob: Blob) => {
        capturedBlob = blob
        return 'blob:test-url'
      })
      window.URL.createObjectURL = mockCreateObjectURL
      window.URL.revokeObjectURL = vi.fn()

      const testState = { data: [42] }
      exportState('test', testState)

      expect(capturedBlob).toBeTruthy()
      expect(capturedBlob!.type).toBe('application/json')
    })

    it('应该显示成功提示', () => {
      const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
      window.URL.createObjectURL = mockCreateObjectURL
      window.URL.revokeObjectURL = vi.fn()

      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn()
      }
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any)

      exportState('array', [1])

      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      )
    })

    it('应该处理导出异常', () => {
      vi.spyOn(document, 'createElement').mockImplementation(() => {
        throw new Error('DOM error')
      })

      exportState('array', [1])

      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'error' })
      )
    })
  })

  describe('importState', () => {
    const createMockFile = (content: string) => {
      return new File([content], 'test.json', { type: 'application/json' })
    }

    it('应该成功解析有效文件', async () => {
      const validData = { version: '1.0', type: 'array', data: [1, 2, 3] }
      const file = createMockFile(JSON.stringify(validData))

      const result = await importState(file)
      expect(result).toEqual(validData)
    })

    it('应该验证 version 字段', async () => {
      const invalidData = { type: 'array', data: [1, 2, 3] }
      const file = createMockFile(JSON.stringify(invalidData))

      await expect(importState(file)).rejects.toThrow('无效文件')
    })

    it('应该验证 type 字段', async () => {
      const invalidData = { version: '1.0', data: [1, 2, 3] }
      const file = createMockFile(JSON.stringify(invalidData))

      await expect(importState(file)).rejects.toThrow('无效文件')
    })

    it('应该验证 data 字段', async () => {
      const invalidData = { version: '1.0', type: 'array' }
      const file = createMockFile(JSON.stringify(invalidData))

      await expect(importState(file)).rejects.toThrow('无效文件')
    })

    it('应该处理无效 JSON', async () => {
      const file = createMockFile('not valid json')

      await expect(importState(file)).rejects.toThrow('导入失败')
    })

    it('应该显示成功提示', async () => {
      const validData = { version: '1.0', type: 'test', data: [42] }
      const file = createMockFile(JSON.stringify(validData))

      await importState(file)

      expect(showToast).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success', message: '数据已导入' })
      )
    })

    it('应该处理文件读取错误', async () => {
      const file = createMockFile('test')
      const originalReadAsText = FileReader.prototype.readAsText
      vi.spyOn(FileReader.prototype, 'readAsText').mockImplementation(function(this: FileReader) {
        setTimeout(() => {
          if (this.onerror) this.onerror(new ProgressEvent('error') as unknown as ProgressEvent<FileReader>)
        }, 0)
      })

      await expect(importState(file)).rejects.toThrow('导入失败')

      FileReader.prototype.readAsText = originalReadAsText
    })

    it('应该拒绝非对象 JSON', async () => {
      const file = createMockFile('"string"')
      await expect(importState(file)).rejects.toThrow('无效文件')
    })

    it('应该拒绝数组 JSON', async () => {
      const file = createMockFile('[1, 2, 3]')
      await expect(importState(file)).rejects.toThrow('无效文件')
    })

    it('应该拒绝 null JSON', async () => {
      const file = createMockFile('null')
      await expect(importState(file)).rejects.toThrow('无效文件')
    })
  })

  describe('exportPerformanceCSV', () => {
    it('应该生成正确的 CSV 格式', () => {
      const data = [
        { algorithm: 'bubble', comparisons: 10, swaps: 5, steps: 15 },
        { algorithm: 'quick', comparisons: 8, swaps: 3, steps: 11 },
      ]
      const csv = exportPerformanceCSV(data)
      expect(csv).toContain('Algorithm,Comparisons,Swaps,Steps')
      expect(csv).toContain('bubble,10,5,15')
      expect(csv).toContain('quick,8,3,11')
    })

    it('空数组应该只返回表头', () => {
      const csv = exportPerformanceCSV([])
      expect(csv).toBe('Algorithm,Comparisons,Swaps,Steps')
    })

    it('应该正确处理包含逗号的算法名', () => {
      const data = [{ algorithm: 'sort, v2', comparisons: 1, swaps: 0, steps: 1 }]
      const csv = exportPerformanceCSV(data)
      expect(csv).toContain('"sort, v2",1,0,1')
    })
  })

  describe('exportPerformanceJSON', () => {
    it('应该生成格式化的 JSON', () => {
      const data = { test: 123 }
      const json = exportPerformanceJSON(data)
      expect(json).toBe(JSON.stringify(data, null, 2))
    })

    it('应该处理嵌套对象', () => {
      const data = { a: { b: 1 } }
      const json = exportPerformanceJSON(data)
      expect(JSON.parse(json)).toEqual(data)
    })
  })
})
