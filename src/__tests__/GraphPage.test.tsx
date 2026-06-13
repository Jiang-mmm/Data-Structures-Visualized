import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const graphPagePath = resolve(__dirname, '../pages/GraphPage.tsx')
const graphPageContent = readFileSync(graphPagePath, 'utf-8')

describe('GraphPage 移动端折叠 (B-1)', () => {
  describe('OperationGroup 集成', () => {
    it('应导入 OperationGroup 组件', () => {
      expect(graphPageContent).toContain("import OperationGroup from '../components/OperationGroup'")
    })

    it('操作栏 #1 应使用 OperationGroup 包裹次要操作', () => {
      expect(graphPageContent).toContain('<OperationGroup')
    })

    it('应折叠删除边操作', () => {
      const groupMatch = graphPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch).toBeTruthy()
      expect(groupMatch![0]).toContain('removeEdge')
    })

    it('应折叠删除节点操作', () => {
      const groupMatch = graphPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/)
      expect(groupMatch![0]).toContain('removeNode')
    })

    it('添加边按钮应在 OperationGroup 外部', () => {
      const firstGroupIndex = graphPageContent.indexOf('<OperationGroup')
      const beforeGroup = graphPageContent.substring(0, firstGroupIndex)
      expect(beforeGroup).toContain('addEdge')
    })

    it('BFS 按钮应在 OperationGroup 外部', () => {
      const allGroups = graphPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/g)
      expect(allGroups).toBeTruthy()
      for (const group of allGroups!) {
        expect(group).not.toContain('handleBFS')
      }
    })

    it('DFS 按钮应在 OperationGroup 外部', () => {
      const allGroups = graphPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/g)
      for (const group of allGroups!) {
        expect(group).not.toContain('handleDFS')
      }
    })

    it('Dijkstra 按钮应在 OperationGroup 外部', () => {
      const allGroups = graphPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/g)
      for (const group of allGroups!) {
        expect(group).not.toContain('handleDijkstra')
      }
    })

    it('OperationInfo 应在 OperationGroup 外部（ml-auto 右对齐）', () => {
      const allGroups = graphPageContent.match(/<OperationGroup[\s\S]*?<\/OperationGroup>/g)
      expect(allGroups).toBeTruthy()
      for (const group of allGroups!) {
        expect(group).not.toContain('<OperationInfo')
      }
    })

    it('应有 label 属性用于折叠按钮文本', () => {
      expect(graphPageContent).toMatch(/<OperationGroup\s+label=/)
    })
  })
})
