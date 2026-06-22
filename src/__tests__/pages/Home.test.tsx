import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import Home from '../../pages/Home'
import { renderWithRouter, mockUseGlobalSettings } from './testUtils'

vi.mock('../../hooks/useGlobalSettings')

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
  })

  it('renders page title and navigation cards', () => {
    renderWithRouter(<Home />)

    expect(screen.getByText('home.title')).toBeInTheDocument()
    expect(screen.getByText('array.title')).toBeInTheDocument()
    expect(screen.getByText('stack.title')).toBeInTheDocument()
    expect(screen.getByText('queue.title')).toBeInTheDocument()
    expect(screen.getByText('linkedlist.title')).toBeInTheDocument()
    expect(screen.getByText('tree.title')).toBeInTheDocument()
    expect(screen.getByText('graph.title')).toBeInTheDocument()
    expect(screen.getByText('sort.title')).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    renderWithRouter(<Home />)

    const arrayLink = screen.getByText('array.title').closest('a')
    expect(arrayLink).toHaveAttribute('href', '/array')

    const stackLink = screen.getByText('stack.title').closest('a')
    expect(stackLink).toHaveAttribute('href', '/stack')

    const queueLink = screen.getByText('queue.title').closest('a')
    expect(queueLink).toHaveAttribute('href', '/queue')

    const sortLink = screen.getByText('sort.title').closest('a')
    expect(sortLink).toHaveAttribute('href', '/sort')
  })

  it('navigates when link is clicked', () => {
    const { container } = renderWithRouter(<Home />)

    const arrayLink = screen.getByText('array.title').closest('a')
    expect(arrayLink).toBeInTheDocument()
    fireEvent.click(arrayLink!)

    expect(container).toBeInTheDocument()
  })

  it('uses theme-aware card group tokens on data structure cards', () => {
    renderWithRouter(<Home />)

    const grid = screen.getByTestId('ds-cards-grid')
    const html = grid.innerHTML

    expect(html).toContain('card-group-linear')
    expect(html).toContain('card-group-tree')
    expect(html).toContain('card-group-graph')
    expect(html).not.toContain('accent-violet')
    expect(html).not.toContain('accent-emerald')
    expect(html).not.toContain('accent-teal')
    expect(html).not.toContain('accent-purple')
  })

  it('renders the algorithm glossary card', () => {
    renderWithRouter(<Home />)
    expect(screen.getByTestId('algorithm-glossary-card')).toBeInTheDocument()
    expect(screen.getByText('complexity.glossaryTitle')).toBeInTheDocument()
  })
})
