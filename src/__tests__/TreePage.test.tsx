import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const treePagePath = resolve(__dirname, '../pages/TreePage.tsx')
const treePageContent = readFileSync(treePagePath, 'utf-8')

describe('TreePage 移动端遍历折叠 (B-4)', () => {
  describe('OperationGroup 集成', () => {
    it('应导入 OperationGroup 组件', () => {
      expect(treePageContent).toContain("import OperationGroup from '../components/OperationGroup'")
    })

    it('应使用 OperationGroup 包裹次要遍历操作', () => {
      expect(treePageContent).toContain('<OperationGroup')
    })

    it('插入按钮应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = treePageContent.indexOf('<OperationGroup')
      const insertIndex = treePageContent.indexOf('handleInsert')
      expect(insertIndex).toBeLessThan(firstGroupIndex)
    })

    it('删除按钮应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = treePageContent.indexOf('<OperationGroup')
      const deleteIndex = treePageContent.indexOf('handleDelete')
      expect(deleteIndex).toBeLessThan(firstGroupIndex)
    })

    it('搜索按钮应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = treePageContent.indexOf('<OperationGroup')
      const searchIndex = treePageContent.indexOf('handleSearch')
      expect(searchIndex).toBeLessThan(firstGroupIndex)
    })

    it('前序遍历应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = treePageContent.indexOf('<OperationGroup')
      const preorderIndex = treePageContent.indexOf('preorder')
      expect(preorderIndex).toBeLessThan(firstGroupIndex)
    })

    it('中序遍历应始终可见（不在 OperationGroup 内）', () => {
      const firstGroupIndex = treePageContent.indexOf('<OperationGroup')
      const inorderIndex = treePageContent.indexOf('inorder')
      expect(inorderIndex).toBeLessThan(firstGroupIndex)
    })

    it('后序遍历应在 OperationGroup 内部', () => {
      const groupMatch = treePageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch).toBeTruthy()
      expect(groupMatch![0]).toContain('postorder')
    })

    it('层序遍历应在 OperationGroup 内部', () => {
      const groupMatch = treePageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('handleLevelOrder')
    })

    it('撤销/重做应在 OperationGroup 内部', () => {
      const groupMatch = treePageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('undo')
      expect(groupMatch![0]).toContain('redo')
    })
  })
})
