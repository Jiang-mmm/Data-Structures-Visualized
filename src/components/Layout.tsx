import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import KeyboardHelp from './KeyboardHelp'
import PerformanceMonitor from './PerformanceMonitor'
import NetworkStatus from './NetworkStatus'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-paper dark:bg-slate">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
      <KeyboardHelp />
      <PerformanceMonitor />
      <NetworkStatus />
    </div>
  )
}
