import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import TriePage from '../../pages/TriePage'
import { renderWithRouter, mockUseGlobalSettings, mockUseVisualizer } from './testUtils'

vi.mock('../../hooks/useTrieState')
vi.mock('../../hooks/useVisualizer')
vi.mock('../../hooks/useGlobalSettings')
vi.mock('../../hooks/useKeyboard', () => ({
  useKeyboard: vi.fn(),
}))
vi.mock('../../components/Visualizer', () => ({
  default: () => null,
}))

import { useTrieState } from '../../hooks/useTrieState'
import { useVisualizer } from '../../hooks/useVisualizer'
import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseTrieState = vi.mocked(useTrieState)
const mockedUseVisualizer = vi.mocked(useVisualizer)
const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

function createMockTrieState(overrides = {}) {
  return {
    data: {} as any,
    loadData: vi.fn(),
    logs: [] as Array<{ type: string; message: string; time?: string }>,
    isAnimating: false,
    setIsAnimating: vi.fn(),
    insert: vi.fn(),
    remove: vi.fn(),
    search: vi.fn().mockReturnValue({ found: true, path: [] }),
    searchPrefix: vi.fn().mockReturnValue({ found: true, words: ['cat', 'car'], path: [] }),
    getFlattened: vi.fn().mockReturnValue({ nodes: [{ id: 'root', prefix: '', isEndOfWord: false, depth: 0, childrenKeys: ['c'] }], edges: [] }),
    wordCount: vi.fn().mockReturnValue(5),
    reset: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    canUndo: vi.fn().mockReturnValue(false),
    canRedo: vi.fn().mockReturnValue(false),
    getUndoPreview: vi.fn().mockReturnValue(null),
    getRedoPreview: vi.fn().mockReturnValue(null),
    ...overrides,
  }
}

describe('TriePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
    mockedUseVisualizer.mockReturnValue(mockUseVisualizer())
  })

  it('renders page title and operation buttons', () => {
    mockedUseTrieState.mockReturnValue(createMockTrieState() as any)
    renderWithRouter(<TriePage />)

    expect(screen.getByText('trie.title Trie')).toBeInTheDocument()
    expect(screen.getByText('trie.insert')).toBeInTheDocument()
    expect(screen.getByText('trie.delete')).toBeInTheDocument()
    expect(screen.getByText('trie.search')).toBeInTheDocument()
    expect(screen.getByText('trie.prefixSearch')).toBeInTheDocument()
    expect(screen.getByText('common.reset')).toBeInTheDocument()
    expect(screen.getByText('common.undo')).toBeInTheDocument()
    expect(screen.getByText('common.redo')).toBeInTheDocument()
  })

  it('calls insert with word when insert button clicked', async () => {
    const mockState = createMockTrieState()
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    const wordInput = screen.getByPlaceholderText('trie.inputPlaceholder')
    fireEvent.change(wordInput, { target: { value: 'hello' } })
    fireEvent.click(screen.getByText('trie.insert'))

    await waitFor(() => {
      expect(mockState.insert).toHaveBeenCalledWith('hello')
    })
  })

  it('calls remove with word when delete button clicked', async () => {
    const mockState = createMockTrieState()
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    const wordInput = screen.getByPlaceholderText('trie.inputPlaceholder')
    fireEvent.change(wordInput, { target: { value: 'cat' } })
    fireEvent.click(screen.getByText('trie.delete'))

    await waitFor(() => {
      expect(mockState.remove).toHaveBeenCalledWith('cat')
    })
  })

  it('calls search with word when search button clicked', async () => {
    const mockState = createMockTrieState()
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    const wordInput = screen.getByPlaceholderText('trie.inputPlaceholder')
    fireEvent.change(wordInput, { target: { value: 'car' } })
    fireEvent.click(screen.getByText('trie.search'))

    await waitFor(() => {
      expect(mockState.search).toHaveBeenCalledWith('car')
    })
  })

  it('calls searchPrefix with prefix when prefix search button clicked', async () => {
    const mockState = createMockTrieState()
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    const wordInput = screen.getByPlaceholderText('trie.inputPlaceholder')
    fireEvent.change(wordInput, { target: { value: 'ca' } })
    fireEvent.click(screen.getByText('trie.prefixSearch'))

    await waitFor(() => {
      expect(mockState.searchPrefix).toHaveBeenCalledWith('ca')
    })
  })

  it('calls reset when reset button clicked', () => {
    const mockState = createMockTrieState()
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    fireEvent.click(screen.getByText('common.reset'))
    expect(mockState.reset).toHaveBeenCalled()
  })

  it('calls undo when undo button clicked and canUndo is true', () => {
    const mockState = createMockTrieState({ canUndo: vi.fn().mockReturnValue(true) })
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    fireEvent.click(screen.getByText('common.undo'))
    expect(mockState.undo).toHaveBeenCalled()
  })

  it('calls redo when redo button clicked and canRedo is true', () => {
    const mockState = createMockTrieState({ canRedo: vi.fn().mockReturnValue(true) })
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    fireEvent.click(screen.getByText('common.redo'))
    expect(mockState.redo).toHaveBeenCalled()
  })

  it('disables operation buttons while animating', () => {
    const mockState = createMockTrieState({ isAnimating: true })
    mockedUseTrieState.mockReturnValue(mockState as any)
    renderWithRouter(<TriePage />)

    expect(screen.getByText('trie.insert')).toBeDisabled()
    expect(screen.getByText('trie.delete')).toBeDisabled()
    expect(screen.getByText('trie.search')).toBeDisabled()
    expect(screen.getByText('trie.prefixSearch')).toBeDisabled()
    expect(screen.getByText('common.undo')).toBeDisabled()
    expect(screen.getByText('common.redo')).toBeDisabled()
  })
})
