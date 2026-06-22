import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import ArrayPage from '../../pages/ArrayPage'
import PageHeader from '../../components/PageHeader'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer, createMockHistory } from './testUtils'

vi.mock('../../hooks/useArrayState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: (): null => null,
}))

import { useArrayState } from '../../hooks/useArrayState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseArrayState = vi.mocked(useArrayState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockArrayState(overrides = {}) {
  const base = createMockHistory([8, 3, 12])
  return {
    ...base,
    data: base.data as number[],
    insert: vi.fn(),
    remove: vi.fn(),
    search: vi.fn().mockReturnValue(1),
    searchAll: vi.fn().mockReturnValue([1]),
    binarySearch: vi.fn().mockReturnValue(1),
    randomize: vi.fn(),
    loadData: vi.fn(),
    ...overrides,
  }
}

describe('跨页面布局一致性', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  describe('PageHeader 组件', () => {
    it('渲染标题和副标题', () => {
      renderWithRouter(
        <PageHeader title="测试标题" subtitle="测试副标题">
          <span>操作</span>
        </PageHeader>
      )

      expect(screen.getByText('测试标题')).toBeInTheDocument()
      expect(screen.getByText('测试副标题')).toBeInTheDocument()
      expect(screen.getByText('操作')).toBeInTheDocument()
    })

    it('不传 subtitle 时不渲染副标题', () => {
      renderWithRouter(
        <PageHeader title="只有标题">
          <span>操作</span>
        </PageHeader>
      )

      expect(screen.getByText('只有标题')).toBeInTheDocument()
      expect(screen.queryByText('测试副标题')).not.toBeInTheDocument()
    })

    it('header 元素包含 page-header 类名', () => {
      const { container } = renderWithRouter(
        <PageHeader title="标题" subtitle="副标题" />
      )

      const header = container.querySelector('header.page-header')
      expect(header).not.toBeNull()
    })
  })

  describe('ArrayPage 根布局结构', () => {
    it('根 div 包含 min-h-dvh 类名', () => {
      mockedUseArrayState.mockReturnValue(createMockArrayState())
      const { container } = renderWithRouter(<ArrayPage />)

      const rootDiv = container.firstElementChild as HTMLElement
      expect(rootDiv).not.toBeNull()
      expect(rootDiv.className).toContain('min-h-dvh')
      expect(rootDiv.className).toContain('flex')
      expect(rootDiv.className).toContain('flex-col')
      expect(rootDiv.className).toContain('grain')
    })

    it('根 div 不使用 h-screen（项目约定使用 min-h-dvh）', () => {
      mockedUseArrayState.mockReturnValue(createMockArrayState())
      const { container } = renderWithRouter(<ArrayPage />)

      const rootDiv = container.firstElementChild as HTMLElement
      expect(rootDiv.className).not.toContain('h-screen')
      expect(rootDiv.className).not.toContain('h-full')
    })

    it('渲染 PageHeader 组件', () => {
      mockedUseArrayState.mockReturnValue(createMockArrayState())
      const { container } = renderWithRouter(<ArrayPage />)

      const header = container.querySelector('header.page-header')
      expect(header).not.toBeNull()
    })

    it('内容区 wrapper 包含 flex-1 和 min-h-0 类名', () => {
      mockedUseArrayState.mockReturnValue(createMockArrayState())
      const { container } = renderWithRouter(<ArrayPage />)

      // 查找包含 flex-1 和 min-h-0 的内容区 div
      const contentWrapper = container.querySelector('.flex-1.flex-col.lg\\:flex-row.min-h-0')
      expect(contentWrapper).not.toBeNull()
    })

    it('可视化区 wrapper 包含 relative 和 min-h-0 类名', () => {
      mockedUseArrayState.mockReturnValue(createMockArrayState())
      const { container } = renderWithRouter(<ArrayPage />)

      const visualizerWrapper = container.querySelector('.relative.flex.flex-col.flex-1.min-h-0')
      expect(visualizerWrapper).not.toBeNull()
    })
  })
})
