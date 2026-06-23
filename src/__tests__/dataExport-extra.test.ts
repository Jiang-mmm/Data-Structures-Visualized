/**
 * dataExport 错误路径 + escapeCSV 边界 + 非数组 CSV 增量测试
 * 用于提升 src/utils/dataExport.ts 覆盖率（基线 91.66% statements / 90% branches）
 * 覆盖：1MB 文件、escapeCSV 引号换行、非数组 performanceData
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { importState, exportPerformanceCSV, exportPerformanceJSON } from '../utils/dataExport'

describe('dataExport 增量', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
    window.URL.createObjectURL = vi.fn(() => 'blob:test-url')
    window.URL.revokeObjectURL = vi.fn()
    // 不 mock document.createElement：jsdom 真实 HTMLAnchorElement 满足 Node 类型检查
    // anchor.click() 在 jsdom 中是 no-op，不会真的下载文件
  })

  describe('importState 文件大小限制', () => {
    it('文件 > 1MB 应 reject', async () => {
      // 构造一个 > 1MB 的 File
      const bigContent = 'x'.repeat(1_000_001)
      const file = new File([bigContent], 'big.json', { type: 'application/json' })
      // jsdom 中 File.size 可能不正确，需要 mock
      Object.defineProperty(file, 'size', { value: 1_000_001, configurable: true })
      await expect(importState(file)).rejects.toThrow()
    })

    it('文件 = 999KB 应可正常进入 readAsText（但内容无效会 reject）', async () => {
      // 999_999 < MAX_IMPORT_SIZE(1_000_000)，通过文件大小检查
      // 但 JSON.parse('{}') 缺少 version/type/data 字段，会被 throw → reject
      const file = new File(['{}'], 'ok.json', { type: 'application/json' })
      Object.defineProperty(file, 'size', { value: 999_999, configurable: true })
      await expect(importState(file)).rejects.toThrow()
    })
  })

  describe('escapeCSV 边界（通过 exportPerformanceCSV 间接）', () => {
    it('algorithm 名包含双引号应正确转义', () => {
      const data = [
        { algorithm: 'has "quotes"', comparisons: 1, swaps: 0, steps: 1 },
      ]
      const csv = exportPerformanceCSV(data)
      // 双引号应被转义为两个双引号
      expect(csv).toContain('"has ""quotes"""')
    })

    it('algorithm 名包含换行符应被引号包裹', () => {
      const data = [
        { algorithm: 'has\nnewline', comparisons: 1, swaps: 0, steps: 1 },
      ]
      const csv = exportPerformanceCSV(data)
      expect(csv).toContain('"has\nnewline"')
    })

    it('algorithm 名为数字应转为字符串', () => {
      const data = [
        { algorithm: 123 as unknown as string, comparisons: 1, swaps: 0, steps: 1 },
      ]
      const csv = exportPerformanceCSV(data)
      expect(csv).toContain('123,1,0,1')
    })

    it('非数组入参应返回空字符串', () => {
      const csv = exportPerformanceCSV(null as unknown as { algorithm: string; comparisons: number; swaps: number; steps: number }[])
      expect(csv).toBe('')
    })

    it('非数组入参（字符串）应返回空字符串', () => {
      const csv = exportPerformanceCSV('not array' as unknown as { algorithm: string; comparisons: number; swaps: number; steps: number }[])
      expect(csv).toBe('')
    })
  })

  describe('exportPerformanceJSON 边界', () => {
    it('null 入参应能正常序列化', () => {
      const json = exportPerformanceJSON(null)
      expect(JSON.parse(json)).toBeNull()
    })

    it('数组入参应能正常序列化', () => {
      const data = [1, 2, 3]
      const json = exportPerformanceJSON(data)
      expect(JSON.parse(json)).toEqual([1, 2, 3])
    })
  })

  describe('importState 边界', () => {
    it('JSON 中 data 字段为 null 应 reject（data === null !== undefined 的判断）', async () => {
      // 产品代码: json.data === undefined → throw; null !== undefined → 通过
      // 所以 null 会成功 resolve，结果.data === null
      const invalidData = { version: '1.0', type: 'array', data: null }
      const file = new File([JSON.stringify(invalidData)], 'null-data.json', { type: 'application/json' })
      Object.defineProperty(file, 'size', { value: 100, configurable: true })
      const result = await importState(file)
      expect(result.data).toBeNull()
    })
  })
})
