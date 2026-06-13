import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { getAvailableThemes, setTheme as setColorTheme, getTheme, initTheme } from '../utils/themeColors'

interface StructureItem {
  path: string
  key: string
}

interface SwipeState {
  startX: number
  startY: number
  isSwiping: boolean
}

const STRUCTURE_KEYS: StructureItem[] = [
  { path: '/', key: 'home' },
  { path: '/array', key: 'array' },
  { path: '/stack', key: 'stack' },
  { path: '/queue', key: 'queue' },
  { path: '/linkedlist', key: 'linkedlist' },
  { path: '/tree', key: 'tree' },
  { path: '/graph', key: 'graph' },
  { path: '/sort', key: 'sort' },
  { path: '/hash', key: 'hash' },
  { path: '/heap', key: 'heap' },
  { path: '/trie', key: 'trie' },
  { path: '/compare', key: 'compare' },
  { path: '/graph-algorithm', key: 'graphAlgorithm' },
]

const ICONS: string[] = ['⌂', '▦', '☰', '→', '∞', '❖', '⬡', '⇅', '#', '▲', '🌳', '⚔', '🔀']

const SIDEBAR_CONTAINER_BASE = 'bg-white dark:bg-slate border-r-2 border-ink dark:border-dark-border flex flex-col h-screen transition-all duration-300 ease-out'
const NAV_ITEM_BASE = 'flex items-center gap-3 px-3 py-2.5 min-h-[44px] text-sm font-medium transition-all duration-200 border-2'
const NAV_ITEM_ACTIVE = 'border-ink dark:border-dark-border bg-accent-blue text-paper shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]'
const NAV_ITEM_INACTIVE = 'border-transparent text-ink-light dark:text-dark-ink-light hover:border-ink/30 dark:hover:border-dark-border hover:bg-paper-warm dark:hover:bg-slate-light hover:translate-x-0.5 hover:shadow-[1px_1px_0px_rgba(26,26,46,0.1)] dark:hover:shadow-[1px_1px_0px_rgba(51,65,85,0.2)]'

export default function Sidebar() {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState<boolean>(false)
  const [mobileOpen, setMobileOpen] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)
  const [colorTheme, setColorThemeState] = useState<string>(() => {
    initTheme()
    return getTheme()
  })
  const { mode, cycle } = useTheme()
  const { t } = useGlobalSettings()
  const sidebarElRef = useRef<HTMLElement | null>(null)
  const swipeRef = useRef<SwipeState>({ startX: 0, startY: 0, isSwiping: false })
  const themes = useMemo(() => getAvailableThemes(), [])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
      if (e.matches) setMobileOpen(false)
    }
    handler(mq as unknown as MediaQueryListEvent)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    swipeRef.current.startX = e.touches[0].clientX
    swipeRef.current.startY = e.touches[0].clientY
    swipeRef.current.isSwiping = true
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!swipeRef.current.isSwiping) return
    const deltaX = e.changedTouches[0].clientX - swipeRef.current.startX
    if (deltaX < -60) {
      setMobileOpen(false)
    }
    swipeRef.current.isSwiping = false
  }, [])

  useEffect(() => {
    const el = sidebarElRef.current
    if (!el || !isMobile) return
    el.addEventListener('touchstart', handleTouchStart, { passive: true })
    el.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', handleTouchStart)
      el.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isMobile, handleTouchStart, handleTouchEnd])

  const prevPathname = useRef<string>(location.pathname)
  useEffect(() => {
    if (prevPathname.current !== location.pathname) {
      prevPathname.current = location.pathname
      if (isMobile) setMobileOpen(false)
    }
  }, [location.pathname, isMobile])

  const themeIcon = mode === 'light' ? '☀' : mode === 'dark' ? '☾' : '◐'

  const handleColorThemeChange = (themeKey: string) => {
    setColorTheme(themeKey)
    setColorThemeState(themeKey)
  }

  const structures = useMemo(() => 
    STRUCTURE_KEYS.map((item, idx) => ({
      path: item.path,
      name: t(`sidebar.${item.key}`),
      icon: ICONS[idx],
    })), [t]
  )

  const sidebarContent = (
    <aside
      ref={sidebarElRef}
      className={`
        ${isMobile ? 'sidebar' : ''}
        ${isMobile && mobileOpen ? 'open' : ''}
        ${isMobile ? 'w-64' : collapsed ? 'w-16' : 'w-60'}
        ${SIDEBAR_CONTAINER_BASE}
        ${isMobile ? 'fixed top-0 left-0 z-40' : 'sticky top-0'}
      `}
    >
      <div className="p-4 border-b-2 border-ink dark:border-dark-border flex items-center justify-between">
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ink dark:bg-dark-ink flex items-center justify-center">
              <span className="text-paper dark:text-dark-paper font-black text-xs">DS</span>
            </div>
            <span className="font-bold text-sm text-ink dark:text-dark-ink tracking-tight">
              {t('sidebar.title')}
            </span>
          </div>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            aria-label={t('common.close')}
            className="w-9 h-9 flex items-center justify-center border-2 border-ink dark:border-dark-border bg-paper dark:bg-slate hover:bg-accent-rose hover:text-paper transition-colors text-sm font-bold touch-manipulation"
          >
            ✕
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? t('sidebar.openMenu') : t('sidebar.collapseMenu')}
            aria-expanded={!collapsed}
            className={`
              w-7 h-7 flex items-center justify-center
              border-2 border-ink dark:border-dark-border bg-paper dark:bg-slate
              hover:bg-accent-blue hover:text-paper dark:hover:bg-accent-blue dark:hover:text-paper
              transition-colors text-xs font-bold
              ${collapsed ? 'mx-auto' : ''}
            `}
          >
            {collapsed ? '☰' : '◀'}
          </button>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin">
        {(!collapsed || isMobile) && (
          <div className="px-3 pt-3 pb-2 font-mono text-[10px] text-ink-light dark:text-dark-ink-light tracking-[0.2em] uppercase">
            MODULES
          </div>
        )}
        {structures.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed && !isMobile ? item.name : undefined}
              className={`
                ${NAV_ITEM_BASE}
                ${isActive ? NAV_ITEM_ACTIVE : NAV_ITEM_INACTIVE}
                ${collapsed && !isMobile ? 'justify-center px-0' : ''}
              `}
            >
              <span className="w-5 h-5 flex items-center justify-center flex-shrink-0 text-base">
                {item.icon}
              </span>
              {(!collapsed || isMobile) && <span>{item.name}</span>}
              {(!collapsed || isMobile) && isActive && (
                <span className="ml-auto font-mono text-[10px] opacity-70">●</span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t-2 border-ink dark:border-dark-border">
        {(!collapsed || isMobile) && (
          <div className="flex gap-1 mb-3">
            {themes.map((theme) => (
              <button
                key={theme.key}
                onClick={() => handleColorThemeChange(theme.key)}
                title={theme.nameKey ? t(theme.nameKey) : theme.name}
                className={`
                  flex-1 h-7 flex items-center justify-center text-xs
                  border-2 transition-all duration-200
                  ${colorTheme === theme.key
                    ? 'border-ink dark:border-dark-border bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155]'
                    : 'border-border dark:border-dark-border bg-paper dark:bg-slate hover:border-ink dark:hover:border-dark-border hover:translate-y-[-1px]'
                  }
                `}
              >
                {theme.icon}
              </button>
            ))}
          </div>
        )}
        <div className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
          {(!collapsed || isMobile) && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-emerald inline-block" />
              <span className="font-mono text-[10px] text-ink-light dark:text-dark-ink-light tracking-wide">V6.4</span>
            </div>
          )}
          <button
            onClick={cycle}
            title={`${t('sidebar.themeTooltip')}: ${mode}`}
            aria-label={`${t('sidebar.themeTooltip')}: ${mode}`}
            className="w-7 h-7 flex items-center justify-center border-2 border-ink dark:border-dark-border bg-paper dark:bg-slate hover:bg-accent-amber hover:text-paper dark:hover:bg-accent-amber dark:hover:text-paper transition-colors text-xs"
          >
            {themeIcon}
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-3 left-3 z-50 w-10 h-10 flex items-center justify-center border-2 border-ink dark:border-dark-border bg-white dark:bg-slate shadow-[2px_2px_0px_#1a1a2e] dark:shadow-[2px_2px_0px_#334155] hover:bg-accent-blue hover:text-paper transition-colors text-lg font-bold md:hidden"
          aria-label={t('sidebar.openMenu')}
        >
          ☰
        </button>
      )}
      {isMobile && mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMobileOpen(false) } }}
          role="button"
          tabIndex={0}
          aria-label={t('common.close')}
        />
      )}
      {sidebarContent}
    </>
  )
}
