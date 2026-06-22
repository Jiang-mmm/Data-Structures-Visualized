import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useSearchHistory } from '../hooks/useSearchHistory'
import { buildSearchIndex, type SearchItem } from '../data/searchIndex'
import { fuzzyMatchAny } from '../utils/fuzzySearch'
import Icon from './Icon'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

/** 最大显示结果数 */
const MAX_RESULTS = 20
/** 空查询时显示的页面项数 */
const DEFAULT_PAGE_LIMIT = 6
/** 空查询时显示的历史项数 */
const DEFAULT_HISTORY_LIMIT = 4

/** 预定义复杂度筛选标签 */
const COMPLEXITY_FILTERS = ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)', 'O(n²)']

/**
 * 全局搜索弹窗组件
 * 用户按 Ctrl/Cmd+K 弹出，可搜索页面、算法、学习步骤
 * 支持模糊匹配、搜索历史、复杂度过滤、分类展示
 */
export const GlobalSearch = memo(function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { t } = useGlobalSettings()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory()

  // 构建搜索索引（只在组件首次渲染时构建一次）
  const searchIndex = useMemo(() => buildSearchIndex(), [])

  // 过滤搜索结果
  const allResults = useMemo<SearchItem[]>(() => {
    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      // 空查询：显示历史 + 页面
      const historyItems: SearchItem[] = history
        .slice(0, DEFAULT_HISTORY_LIMIT)
        .map((q, index) => ({
          id: `history-${index}-${q}`,
          title: q,
          path: '',
          keywords: [q],
          category: 'history',
        }))

      const pageItems = searchIndex
        .filter(item => item.category === 'page')
        .slice()
        .sort((a, b) => a.title.localeCompare(b.title))
        .slice(0, DEFAULT_PAGE_LIMIT)

      return [...historyItems, ...pageItems]
    }

    const lowerQuery = trimmedQuery.toLowerCase()
    const scored = searchIndex
      .map(item => {
        const texts = [item.title, item.subtitle ?? '', ...item.keywords]
        const match = fuzzyMatchAny(lowerQuery, texts)
        return { item, score: match.score, matched: match.matched }
      })
      .filter(({ matched }) => matched)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map(({ item }) => item)

    return scored
  }, [query, searchIndex, history])

  // 复杂度过滤（仅对 learning 项生效）
  const results = useMemo<SearchItem[]>(() => {
    if (!selectedComplexity) return allResults
    const normalized = selectedComplexity.toLowerCase().replace(/\s+/g, '')
    return allResults.filter(item => {
      if (item.category !== 'learning') return true
      return item.complexity?.some(c => c.toLowerCase().replace(/\s+/g, '') === normalized)
    })
  }, [allResults, selectedComplexity])

  // 按 category 分组，同时保留扁平索引用于键盘导航
  const { groupedResults, flatItems } = useMemo(() => {
    const groups: { category: SearchItem['category']; items: SearchItem[] }[] = []
    const order: SearchItem['category'][] = ['history', 'page', 'learning']

    for (const category of order) {
      const items = results.filter(item => item.category === category)
      if (items.length > 0) {
        groups.push({ category, items })
      }
    }

    const flat = groups.flatMap(group => group.items.map(item => ({ item, category: group.category })))

    return { groupedResults: groups, flatItems: flat }
  }, [results])

  // 打开时自动聚焦输入框并清空查询
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedComplexity(null)
      setSelectedIndex(0)
      // 延迟聚焦以确保 DOM 已渲染
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // 结果变化时重置选中项
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, selectedComplexity])

  // 跳转到选中项
  const handleSelect = useCallback((item: SearchItem) => {
    if (item.category === 'history') {
      setQuery(item.title)
      return
    }

    if (item.path) {
      navigate(item.path)
    }

    if (query.trim()) {
      addHistory(query)
    }
    onClose()
  }, [navigate, onClose, query, addHistory])

  // 关闭时保存当前非空查询到历史
  const handleClose = useCallback(() => {
    if (query.trim()) {
      addHistory(query)
    }
    onClose()
  }, [query, addHistory, onClose])

  // 键盘交互
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleClose()
    }
  }, [results, selectedIndex, handleSelect, handleClose])

  // 滚动到选中项
  useEffect(() => {
    if (!listRef.current) return
    const optionEls = listRef.current.querySelectorAll('[role="option"]')
    const selectedEl = optionEls[selectedIndex] as HTMLElement
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // 点击遮罩关闭
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }, [handleClose])

  // 切换复杂度筛选
  const toggleComplexity = useCallback((value: string) => {
    setSelectedComplexity(prev => (prev === value ? null : value))
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm animate-fade-in pt-[10vh] px-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={t('globalSearch.title')}
    >
      <div className="bg-surface dark:bg-dark-surface border-2 border-ink dark:border-dark-border shadow-hard-lg dark:shadow-card-dark max-w-2xl w-full animate-pop">
        {/* 搜索输入区 */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink dark:border-dark-border">
          <span className="text-ink-light dark:text-dark-ink-light flex-shrink-0"><Icon name="search" size={18} /></span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('globalSearch.placeholder')}
            aria-label={t('globalSearch.inputAriaLabel')}
            className="flex-1 bg-transparent outline-none text-ink dark:text-dark-ink text-sm placeholder:text-ink-light/60 dark:placeholder:text-dark-ink-light/60"
          />
          <kbd className="px-2 py-1 bg-paper dark:bg-dark-paper border-2 border-ink/20 dark:border-dark-border text-xs font-mono font-bold text-ink-light dark:text-dark-ink-light flex-shrink-0">
            {t('globalSearch.shortcut')}
          </kbd>
        </div>

        {/* 复杂度过滤（仅在非空查询或有 learning 结果时显示） */}
        {results.some(item => item.category === 'learning') && (
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b-2 border-ink dark:border-dark-border bg-paper/50 dark:bg-dark-paper/50">
            <span className="text-xs font-medium text-ink-light dark:text-dark-ink-light">
              {t('globalSearch.complexity')}
            </span>
            {COMPLEXITY_FILTERS.map(value => {
              const active = selectedComplexity === value
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleComplexity(value)}
                  aria-pressed={active}
                  className={`
                    text-[10px] font-mono font-bold px-2 py-0.5 border transition-colors
                    ${active
                      ? 'bg-accent-blue text-white border-accent-blue'
                      : 'bg-surface dark:bg-dark-surface border-ink/30 dark:border-dark-border text-ink dark:text-dark-ink hover:bg-muted/60 dark:hover:bg-dark-muted/40'
                    }
                  `}
                >
                  {value}
                </button>
              )
            })}
          </div>
        )}

        {/* 搜索结果列表 */}
        {results.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-ink-light dark:text-dark-ink-light">
            {t('globalSearch.noResults')}
          </div>
        ) : (
          <ul
            ref={listRef}
            role="listbox"
            aria-label={t('globalSearch.title')}
            className="max-h-[50vh] overflow-y-auto scrollbar-thin"
          >
            {groupedResults.map(group => (
              <li key={group.category} className="list-none">
                <div className="sticky top-0 z-10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-light dark:text-dark-ink-light bg-muted/80 dark:bg-dark-muted/80 border-b border-ink/10 dark:border-dark-border/30">
                  {group.category === 'page' && t('globalSearch.categoryPage')}
                  {group.category === 'learning' && t('globalSearch.categoryLearning')}
                  {group.category === 'history' && t('globalSearch.categoryHistory')}
                  <span className="ml-2 opacity-70">({group.items.length})</span>
                </div>

                {group.items.map(item => {
                  const selectedItem = flatItems[selectedIndex]?.item
                  return (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      selected={selectedItem?.id === item.id}
                      onSelect={() => handleSelect(item)}
                      onRemoveHistory={item.category === 'history' ? () => removeHistory(item.title) : undefined}
                      t={t}
                    />
                  )
                })}
              </li>
            ))}
          </ul>
        )}

        {/* 历史清空按钮（空查询且存在历史时） */}
        {!query.trim() && history.length > 0 && (
          <div className="flex justify-end px-4 py-2 border-t-2 border-ink dark:border-dark-border">
            <button
              type="button"
              onClick={clearHistory}
              className="text-xs text-ink-light dark:text-dark-ink-light hover:text-accent-blue dark:hover:text-accent-blue transition-colors"
            >
              {t('globalSearch.clearHistory')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
})

interface SearchResultItemProps {
  item: SearchItem
  selected: boolean
  onSelect: () => void
  onRemoveHistory?: () => void
  t: (key: string) => string
}

const SearchResultItem = memo(function SearchResultItem({
  item,
  selected,
  onSelect,
  onRemoveHistory,
  t,
}: SearchResultItemProps) {
  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onRemoveHistory?.()
  }, [onRemoveHistory])

  return (
    <div
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={`
        flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150
        ${selected
          ? 'bg-accent-blue/10 dark:bg-accent-blue/20'
          : 'hover:bg-muted/60 dark:hover:bg-dark-muted/40'
        }
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink dark:text-dark-ink truncate">
          {item.title}
        </div>
        {item.subtitle && (
          <div className="text-xs text-ink-light dark:text-dark-ink-light truncate">
            {item.subtitle}
          </div>
        )}
      </div>

      {item.category === 'history' && onRemoveHistory && (
        <button
          type="button"
          onClick={handleRemove}
          aria-label={t('globalSearch.removeHistory')}
          className="text-xs text-ink-light dark:text-dark-ink-light hover:text-accent-red px-1.5 py-0.5"
        >
          <Icon name="close" size={14} />
        </button>
      )}

      {item.tags && item.tags.length > 0 && (
        <span className="hidden sm:flex gap-1 flex-shrink-0">
          {item.tags.slice(0, 2).map(tag => (
            <span
              key={tag}
              className="text-[10px] font-mono px-1.5 py-0.5 border border-accent-blue/40 text-accent-blue"
            >
              {tag}
            </span>
          ))}
        </span>
      )}

      <span className={`
        text-[10px] font-mono font-bold px-1.5 py-0.5 border flex-shrink-0
        ${item.category === 'page'
          ? 'border-ink/30 dark:border-dark-border text-ink dark:text-dark-ink'
          : item.category === 'history'
            ? 'border-accent-purple/40 text-accent-purple'
            : 'border-accent-blue/40 text-accent-blue'
        }
      `}>
        {item.category === 'page' && t('globalSearch.categoryPage')}
        {item.category === 'learning' && t('globalSearch.categoryLearning')}
        {item.category === 'history' && t('globalSearch.categoryHistory')}
      </span>
    </div>
  )
})
