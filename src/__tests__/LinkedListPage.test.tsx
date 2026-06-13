import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const linkedListPath = resolve(__dirname, '../pages/LinkedListPage.tsx')
const linkedListContent = readFileSync(linkedListPath, 'utf-8')

describe('LinkedListPage 移动端操作分组 (B-3)', () => {
  describe('OperationGroup 集成', () => {
    it('应导入 OperationGroup 组件', () => {
      expect(linkedListContent).toContain("import OperationGroup from '../components/OperationGroup'")
    })

    it('应使用 OperationGroup 包裹次要操作', () => {
      expect(linkedListContent).toContain('<OperationGroup')
    })

    it('头部插入应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = linkedListContent.indexOf('<OperationGroup')
      const pushFrontIndex = linkedListContent.indexOf('pushFront')
      expect(pushFrontIndex).toBeLessThan(firstGroupIndex)
    })

    it('尾部插入应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = linkedListContent.indexOf('<OperationGroup')
      const pushBackIndex = linkedListContent.indexOf('pushBack')
      expect(pushBackIndex).toBeLessThan(firstGroupIndex)
    })

    it('删除应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = linkedListContent.indexOf('<OperationGroup')
      const deleteIndex = linkedListContent.indexOf('handleDelete')
      expect(deleteIndex).toBeLessThan(firstGroupIndex)
    })

    it('查找应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = linkedListContent.indexOf('<OperationGroup')
      const searchIndex = linkedListContent.indexOf('handleSearch')
      expect(searchIndex).toBeLessThan(firstGroupIndex)
    })

    it('反转应在 OperationGroup 内部', () => {
      const groupMatch = linkedListContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch).toBeTruthy()
      expect(groupMatch![0]).toContain('reverse')
    })

    it('环检测应在 OperationGroup 内部', () => {
      const groupMatch = linkedListContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('detectCycle')
    })

    it('撤销/重做应在 OperationGroup 内部', () => {
      const groupMatch = linkedListContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('undo')
      expect(groupMatch![0]).toContain('redo')
    })
  })
})
