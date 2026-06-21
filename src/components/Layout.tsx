import { type ReactNode, useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import KeyboardHelp from './KeyboardHelp'
import PerformanceMonitor from './PerformanceMonitor'
import NetworkStatus from './NetworkStatus'
import ReloadPrompt from './ReloadPrompt'
import { GlobalSearch } from './GlobalSearch'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useGlobalSettings()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Ctrl/Cmd + K 快捷键切换全局搜索
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(open => !open)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex min-h-dvh bg-paper dark:bg-dark-paper">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-blue focus:text-paper focus:font-bold focus:border-2 focus:border-ink">
        {t('common.skipToContent')}
      </a>
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-auto">
        {children}
      </main>
      <KeyboardHelp />
      <PerformanceMonitor />
      <NetworkStatus />
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <ReloadPrompt />
    </div>
  )
}
