import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ContentTier from '../components/ContentTier'

vi.mock('../hooks/useGlobalSettings', () => ({
  useGlobalSettings: () => ({ t: (key: string) => key }),
}))

function getTierButton(text: string): HTMLElement {
  const elements = screen.getAllByText(text)
  return elements.find(el => el.tagName === 'BUTTON') as HTMLElement
}

describe('ContentTier', () => {
  describe('折叠状态', () => {
    it('默认应渲染折叠状态，不显示内容', () => {
      const { container } = render(<ContentTier structureKey="array" />)
      expect(screen.getByText('contentTier.title')).toBeInTheDocument()
      expect(screen.queryByText('contentTier.conceptLabel')).not.toBeInTheDocument()
      expect(container.querySelector('.animate-fade-in')).not.toBeInTheDocument()
    })

    it('折叠时应显示展开箭头 ▶', () => {
      render(<ContentTier structureKey="array" />)
      expect(screen.getByText('▶')).toBeInTheDocument()
    })

    it('aria-expanded 应为 false', () => {
      render(<ContentTier structureKey="array" />)
      expect(screen.getByLabelText('contentTier.expand')).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('展开/收起', () => {
    it('点击标题应展开显示内容', () => {
      render(<ContentTier structureKey="array" />)
      fireEvent.click(screen.getByLabelText('contentTier.expand'))
      expect(screen.getByText('contentTier.conceptLabel')).toBeInTheDocument()
    })

    it('展开后应显示收起箭头 ▼', () => {
      render(<ContentTier structureKey="array" />)
      fireEvent.click(screen.getByLabelText('contentTier.expand'))
      expect(screen.getByText('▼')).toBeInTheDocument()
    })

    it('展开后 aria-expanded 应为 true', () => {
      render(<ContentTier structureKey="array" />)
      const btn = screen.getByLabelText('contentTier.expand')
      fireEvent.click(btn)
      expect(btn).toHaveAttribute('aria-expanded', 'true')
    })

    it('再次点击应收起', () => {
      render(<ContentTier structureKey="array" />)
      const btn = screen.getByLabelText('contentTier.expand')
      fireEvent.click(btn)
      fireEvent.click(btn)
      expect(screen.queryByText('contentTier.conceptLabel')).not.toBeInTheDocument()
    })

    it('defaultExpanded 为 true 时应默认展开', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      expect(screen.getByText('contentTier.conceptLabel')).toBeInTheDocument()
    })
  })

  describe('三层切换', () => {
    it('展开后应显示三个层级标签', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      expect(getTierButton('contentTier.beginner')).toBeInTheDocument()
      expect(getTierButton('contentTier.intermediate')).toBeInTheDocument()
      expect(getTierButton('contentTier.advanced')).toBeInTheDocument()
    })

    it('默认应选中初级', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      const beginnerBtn = getTierButton('contentTier.beginner')
      expect(beginnerBtn).toHaveAttribute('aria-pressed', 'true')
    })

    it('点击中级应切换内容', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.intermediate'))
      expect(screen.getByText('contentTier.complexityLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.applicationsLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.codeLabel')).toBeInTheDocument()
    })

    it('点击高级应切换内容', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.advanced'))
      expect(screen.getByText('contentTier.variantsLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.comparisonLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.engineeringLabel')).toBeInTheDocument()
    })

    it('切换层级后 aria-pressed 应正确更新', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.advanced'))
      expect(getTierButton('contentTier.advanced')).toHaveAttribute('aria-pressed', 'true')
      expect(getTierButton('contentTier.beginner')).toHaveAttribute('aria-pressed', 'false')
    })

    it('defaultTier 应设置初始层级', () => {
      render(<ContentTier structureKey="array" defaultExpanded defaultTier="advanced" />)
      expect(getTierButton('contentTier.advanced')).toHaveAttribute('aria-pressed', 'true')
      expect(screen.getByText('contentTier.variantsLabel')).toBeInTheDocument()
    })
  })

  describe('内容显示', () => {
    it('初级应显示概念和特点两个部分', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      expect(screen.getByText('contentTier.conceptLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.featuresLabel')).toBeInTheDocument()
    })

    it('中级应显示复杂度、应用和代码三个部分', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.intermediate'))
      expect(screen.getByText('contentTier.complexityLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.applicationsLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.codeLabel')).toBeInTheDocument()
    })

    it('高级应显示变体、对比和工程三个部分', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.advanced'))
      expect(screen.getByText('contentTier.variantsLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.comparisonLabel')).toBeInTheDocument()
      expect(screen.getByText('contentTier.engineeringLabel')).toBeInTheDocument()
    })

    it('应显示对应数据结构的内容', () => {
      render(<ContentTier structureKey="stack" defaultExpanded />)
      expect(screen.getByText('contentTier.stack.beginnerConcept')).toBeInTheDocument()
      expect(screen.getByText('contentTier.stack.beginnerFeatures')).toBeInTheDocument()
    })

    it('不同数据结构应显示不同内容', () => {
      const { rerender } = render(<ContentTier structureKey="array" defaultExpanded />)
      expect(screen.getByText('contentTier.array.beginnerConcept')).toBeInTheDocument()
      rerender(<ContentTier structureKey="tree" defaultExpanded />)
      expect(screen.getByText('contentTier.tree.beginnerConcept')).toBeInTheDocument()
      expect(screen.queryByText('contentTier.array.beginnerConcept')).not.toBeInTheDocument()
    })

    it('代码部分应使用 pre 标签渲染', () => {
      const { container } = render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.intermediate'))
      const pre = container.querySelector('pre')
      expect(pre).toBeInTheDocument()
      expect(pre?.className).toContain('font-mono')
    })
  })

  describe('样式类名', () => {
    it('选中的层级按钮应有 shadow-button 样式', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      const beginnerBtn = getTierButton('contentTier.beginner')
      expect(beginnerBtn.className).toContain('shadow-button')
    })

    it('选中的初级按钮应有 emerald 背景色', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      const beginnerBtn = getTierButton('contentTier.beginner')
      expect(beginnerBtn.className).toContain('bg-accent-emerald')
    })

    it('选中的中级按钮应有 blue 背景色', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.intermediate'))
      const intermediateBtn = getTierButton('contentTier.intermediate')
      expect(intermediateBtn.className).toContain('bg-accent-blue')
    })

    it('选中的高级按钮应有 amber 背景色', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      fireEvent.click(getTierButton('contentTier.advanced'))
      const advancedBtn = getTierButton('contentTier.advanced')
      expect(advancedBtn.className).toContain('bg-accent-amber')
    })

    it('未选中的层级按钮不应有 shadow-button 样式', () => {
      render(<ContentTier structureKey="array" defaultExpanded />)
      const intermediateBtn = getTierButton('contentTier.intermediate')
      expect(intermediateBtn.className).not.toContain('shadow-button')
    })

    it('展开内容应有 animate-fade-in 动画类', () => {
      const { container } = render(<ContentTier structureKey="array" defaultExpanded />)
      expect(container.querySelector('.animate-fade-in')).toBeInTheDocument()
    })

    it('层级指示器圆点应存在', () => {
      const { container } = render(<ContentTier structureKey="array" />)
      const dot = container.querySelector('.rounded-full')
      expect(dot).toBeInTheDocument()
    })
  })

  describe('不同数据结构', () => {
    const structures = ['array', 'stack', 'queue', 'linkedlist', 'tree'] as const

    structures.forEach((key) => {
      it(`structureKey="${key}" 应正确渲染对应内容`, () => {
        render(<ContentTier structureKey={key} defaultExpanded />)
        expect(screen.getByText(`contentTier.${key}.beginnerConcept`)).toBeInTheDocument()
      })
    })
  })
})
