import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { buildSearchIndex, type SearchItem } from '../data/searchIndex'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

/** 最大显示结果数 */
const MAX_RESULTS = 20
/** 空查询时显示的项数 */
const DEFAULT_LIMIT = 10

/**
 * 全局搜索弹窗组件
 * 用户按 Ctrl/Cmd+K 弹出，可搜索页面、算法、学习步骤
 */
export const GlobalSearch = memo(function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const { t } = useGlobalSettings()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // 构建搜索索引（只在组件首次渲染时构建一次）
  const searchIndex = useMemo(() => buildSearchIndex(), [])

  // 过滤搜索结果
  const results = useMemo<SearchItem[]>(() => {
    if (!query.trim()) {
      // 空查询：按 category 排序（page 优先），取前 10 项
      return searchIndex
        .slice()
        .sort((a, b) => {
          if (a.category === b.category) return 0
          return a.category === 'page' ? -1 : 1
        })
        .slice(0, DEFAULT_LIMIT)
    }

    const lowerQuery = query.toLowerCase().trim()
    const filtered = searchIndex.filter(item => {
      // 匹配 title
      if (item.title.toLowerCase().includes(lowerQuery)) return true
      // 匹配 keywords
      if (item.keywords.some(kw => kw.toLowerCase().includes(lowerQuery))) return true
      return false
    })

    // 按 category 排序（page 优先），最多 20 项
    return filtered
      .sort((a, b) => {
        if (a.category === b.category) return 0
        return a.category === 'page' ? -1 : 1
      })
      .slice(0, MAX_RESULTS)
  }, [query, searchIndex])

  // 打开时自动聚焦输入框并清空查询
  useEffect(() => {
    if (isOpen) {
      setQuery('')
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
  }, [query])

  // 跳转到选中项
  const handleSelect = useCallback((item: SearchItem) => {
    navigate(item.path)
    onClose()
  }, [navigate, onClose])

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
      onClose()
    }
  }, [results, selectedIndex, handleSelect, onClose])

  // 滚动到选中项
  useEffect(() => {
    if (!listRef.current) return
    const selectedEl = listRef.current.children[selectedIndex] as HTMLElement
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // 点击遮罩关闭
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

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
          <span className="text-ink-light dark:text-dark-ink-light text-lg flex-shrink-0">🔍</span>
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
            {results.map((item, index) => (
              <li
                key={item.id}
                role="option"
                aria-selected={index === selectedIndex}
                onClick={() => handleSelect(item)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-150
                  ${index === selectedIndex
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
                <span className={`
                  text-[10px] font-mono font-bold px-1.5 py-0.5 border flex-shrink-0
                  ${item.category === 'page'
                    ? 'border-ink/30 dark:border-dark-border text-ink dark:text-dark-ink'
                    : 'border-accent-blue/40 text-accent-blue'
                  }
                `}>
                  {item.category === 'page'
                    ? t('globalSearch.categoryPage')
                    : t('globalSearch.categoryLearning')
                  }
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
})
