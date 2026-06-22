import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Icon, { type IconName } from '../../components/Icon'

const ALL_ICON_NAMES: IconName[] = [
  'keyboard',
  'close',
  'check',
  'search',
  'play',
  'chevronDown',
  'chevronRight',
  'chevronLeft',
]

describe('Icon', () => {
  it('渲染 svg 元素', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  it('为每个图标名称渲染正确的 path', () => {
    for (const name of ALL_ICON_NAMES) {
      const { container } = render(<Icon name={name} />)
      const path = container.querySelector('path')
      expect(path, `图标 ${name} 应包含 path 元素`).toBeTruthy()
      expect(path?.getAttribute('d'), `图标 ${name} 的 path d 属性不应为空`).not.toBe('')
    }
  })

  it('正确应用 size 属性', () => {
    const { container } = render(<Icon name="check" size={32} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('32')
    expect(svg.getAttribute('height')).toBe('32')
  })

  it('默认应设置 aria-hidden', () => {
    const { container } = render(<Icon name="check" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('aria-hidden')).toBe('true')
  })

  it('转发额外的 SVG 属性', () => {
    const { container } = render(<Icon name="check" data-testid="my-icon" className="custom-class" />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('data-testid')).toBe('my-icon')
    expect(svg.getAttribute('class')).toContain('custom-class')
  })
})
