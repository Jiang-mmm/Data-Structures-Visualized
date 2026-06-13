import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import KeyboardHelp from './KeyboardHelp'
import PerformanceMonitor from './PerformanceMonitor'
import NetworkStatus from './NetworkStatus'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { t } = useGlobalSettings()
  return (
    <div className="flex min-h-screen bg-paper dark:bg-slate">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-blue focus:text-paper focus:font-bold focus:border-2 focus:border-ink">
        {t('common.skipToContent')}
      </a>
      <Sidebar />
      <main id="main-content" className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
      <KeyboardHelp />
      <PerformanceMonitor />
      <NetworkStatus />
    </div>
  )
}
