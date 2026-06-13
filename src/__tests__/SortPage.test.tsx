import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const sortPagePath = resolve(__dirname, '../pages/SortPage.tsx')
const sortPageContent = readFileSync(sortPagePath, 'utf-8')

describe('SortPage 移动端算法分组 (B-2)', () => {
  describe('OperationGroup 集成', () => {
    it('应导入 OperationGroup 组件', () => {
      expect(sortPageContent).toContain("import OperationGroup from '../components/OperationGroup'")
    })

    it('应使用 OperationGroup 包裹低频算法', () => {
      expect(sortPageContent).toContain('<OperationGroup')
    })

    it('冒泡排序应始终可见（不在 OperationGroup 内）', () => {
      // bubble 按钮应在 OperationGroup 之前
      const firstGroupIndex = sortPageContent.indexOf('<OperationGroup')
      const bubbleIndex = sortPageContent.indexOf("'bubble'")
      expect(bubbleIndex).toBeLessThan(firstGroupIndex)
    })

    it('快速排序应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = sortPageContent.indexOf('<OperationGroup')
      const quickIndex = sortPageContent.indexOf("'quick'")
      expect(quickIndex).toBeLessThan(firstGroupIndex)
    })

    it('归并排序应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = sortPageContent.indexOf('<OperationGroup')
      const mergeIndex = sortPageContent.indexOf("'merge'")
      expect(mergeIndex).toBeLessThan(firstGroupIndex)
    })

    it('堆排序应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = sortPageContent.indexOf('<OperationGroup')
      const heapIndex = sortPageContent.indexOf("'heap'")
      expect(heapIndex).toBeLessThan(firstGroupIndex)
    })

    it('选择排序应在 OperationGroup 内部', () => {
      const groupMatch = sortPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch).toBeTruthy()
      expect(groupMatch![0]).toContain('selection')
    })

    it('插入排序应在 OperationGroup 内部', () => {
      const groupMatch = sortPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('insertion')
    })

    it('计数排序应在 OperationGroup 内部', () => {
      const groupMatch = sortPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('counting')
    })

    it('希尔排序应在 OperationGroup 内部', () => {
      const groupMatch = sortPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('shell')
    })
  })
})