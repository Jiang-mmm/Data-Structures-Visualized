import { describe, it, expect } from 'vitest'
import { renderArray } from '../../visualizers/arrayVisualizer'

describe('arrayVisualizer snapshot', () => {
  it('应渲染出结构稳定的 SVG 标记（3 个元素）', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '800')
    svg.setAttribute('height', '400')

    renderArray(svg, [1, 2, 3], { width: 800, height: 400, isDark: false })

    const items = svg.querySelectorAll('.array-item')
    expect(items.length).toBe(3)
    expect(svg.innerHTML).toMatchSnapshot()
  })

  it('空数组应保持 SVG 为空', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '800')
    svg.setAttribute('height', '400')

    renderArray(svg, [], { width: 800, height: 400, isDark: false })

    expect(svg.innerHTML).toBe('')
  })
})
