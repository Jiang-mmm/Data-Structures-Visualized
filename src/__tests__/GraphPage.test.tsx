import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const graphPagePath = resolve(__dirname, '../pages/GraphPage.tsx')
const graphPageContent = readFileSync(graphPagePath, 'utf-8')

describe('GraphPage 单行工具栏布局', () => {
  describe('工具栏结构', () => {
    it('应使用单个 OperationBar 包含所有操作', () => {
      const barCount = (graphPageContent.match(/<OperationBar/g) || []).length
      expect(barCount).toBe(1)
    })

    it('应包含标题内联', () => {
      expect(graphPageContent).toContain('font-black text-sm text-ink')
    })

    it('应包含添加节点按钮', () => {
      expect(graphPageContent).toContain('addNode')
    })

    it('应包含添加边按钮', () => {
      expect(graphPageContent).toContain('addEdge')
    })

    it('应包含删除边按钮', () => {
      expect(graphPageContent).toContain('removeEdge')
    })

    it('应包含删除节点按钮', () => {
      expect(graphPageContent).toContain('removeNode')
    })

    it('应包含 BFS/DFS/Dijkstra 算法按钮', () => {
      expect(graphPageContent).toContain('handleBFS')
      expect(graphPageContent).toContain('handleDFS')
      expect(graphPageContent).toContain('handleDijkstra')
    })

    it('应包含 OperationInfo 右对齐区域', () => {
      expect(graphPageContent).toContain('<OperationInfo')
    })

    it('应包含重置按钮（danger variant）', () => {
      expect(graphPageContent).toContain('variant="danger"')
      expect(graphPageContent).toContain('handleReset')
    })
  })
})
