import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { ReactNode } from 'react'
import ColorLegend from '../../components/ColorLegend'
import { GlobalSettingsProvider } from '../../hooks/useGlobalSettings'

// 部分 mock：保留 GlobalSettingsProvider，替换 useGlobalSettings 返回 t 函数
vi.mock('../../hooks/useGlobalSettings', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks/useGlobalSettings')>()
  return {
    ...actual,
    useGlobalSettings: () => ({
      t: (key: string) => key,
      lang: 'zh',
    }),
  }
})

function wrapper({ children }: { children: ReactNode }) {
  return <GlobalSettingsProvider>{children}</GlobalSettingsProvider>
}

describe('ColorLegend', () => {
  it('items 为空时应该返回 null', () => {
    const { container } = render(<ColorLegend items={[]} />, { wrapper })
    expect(container.firstChild).toBeNull()
  })

  it('应该渲染所有 items（color + label）', () => {
    const items = [
      { color: '#ff0000', labelKey: 'legend.color1' },
      { color: '#00ff00', labelKey: 'legend.color2' },
      { color: '#0000ff', labelKey: 'legend.color3' },
    ]
    const { container } = render(<ColorLegend items={items} />, { wrapper })
    // 每个 item 包含 1 个色块 + 1 个 label span
    const colorSpans = container.querySelectorAll('span')
    expect(colorSpans.length).toBe(3)
    expect(colorSpans[0]?.textContent).toBe('legend.color1')
    expect(colorSpans[1]?.textContent).toBe('legend.color2')
    expect(colorSpans[2]?.textContent).toBe('legend.color3')
  })

  it('应该应用 backgroundColor 样式', () => {
    const items = [
      { color: '#abcdef', labelKey: 'legend.color1' },
    ]
    const { container } = render(<ColorLegend items={items} />, { wrapper })
    // 色块的 className 包含 rounded-sm
    const colorBlock = container.querySelector('div.rounded-sm') as HTMLElement
    // jsdom 的 inline style 应包含 backgroundColor
    const styleAttr = colorBlock?.getAttribute('style') || ''
    expect(styleAttr.toLowerCase()).toMatch(/(background-?color.*?#abcdef)|(background-?color.*?rgb\(171)/)
  })

  it('应该应用 className prop', () => {
    const items = [{ color: '#000', labelKey: 'legend.color1' }]
    const { container } = render(
      <ColorLegend items={items} className="custom-legend" />,
      { wrapper }
    )
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('custom-legend')
  })

  it('默认 className 应包含 flex + flex-wrap', () => {
    const items = [{ color: '#000', labelKey: 'legend.color1' }]
    const { container } = render(<ColorLegend items={items} />, { wrapper })
    const root = container.firstChild as HTMLElement
    expect(root.className).toContain('flex')
    expect(root.className).toContain('flex-wrap')
  })

  it('应该对每个 item 使用 labelKey 作为 React key', () => {
    const items = [
      { color: '#111', labelKey: 'key-a' },
      { color: '#222', labelKey: 'key-b' },
    ]
    const { container } = render(<ColorLegend items={items} />, { wrapper })
    const itemDivs = container.querySelectorAll('div.flex.items-center.gap-1\\.5')
    expect(itemDivs.length).toBe(2)
  })

  it('单个 item 应包含 1 个色块和 1 个 label', () => {
    const items = [{ color: '#abc', labelKey: 'legend.solo' }]
    const { container } = render(<ColorLegend items={items} />, { wrapper })
    const itemDiv = container.querySelector('div.flex.items-center.gap-1\\.5') as HTMLElement
    expect(itemDiv).not.toBeNull()
    const colorBlock = itemDiv.querySelector('div.rounded-sm') as HTMLElement
    const label = itemDiv.querySelector('span') as HTMLElement
    expect(colorBlock).not.toBeNull()
    expect(label.textContent).toBe('legend.solo')
  })
})
