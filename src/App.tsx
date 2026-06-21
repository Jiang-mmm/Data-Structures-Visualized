import { lazy, Suspense } from 'react'
import { BrowserRouter, HashRouter, Routes, Route } from 'react-router-dom'
import { GlobalSettingsProvider, useGlobalSettings } from './hooks/useGlobalSettings'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'

const Home = lazy(() => import('./pages/Home'))
const ArrayPage = lazy(() => import('./pages/ArrayPage'))
const StackPage = lazy(() => import('./pages/StackPage'))
const QueuePage = lazy(() => import('./pages/QueuePage'))
const LinkedListPage = lazy(() => import('./pages/LinkedListPage'))
const TreePage = lazy(() => import('./pages/TreePage'))
const GraphPage = lazy(() => import('./pages/GraphPage'))
const SortPage = lazy(() => import('./pages/SortPage'))
const HashPage = lazy(() => import('./pages/HashPage'))
const HeapPage = lazy(() => import('./pages/HeapPage'))
const TriePage = lazy(() => import('./pages/TriePage'))
const AvlTreePage = lazy(() => import('./pages/AvlTreePage'))
const RedBlackTreePage = lazy(() => import('./pages/RedBlackTreePage'))
const BTreePage = lazy(() => import('./pages/BTreePage'))
const SkipListPage = lazy(() => import('./pages/SkipListPage'))
const UnionFindPage = lazy(() => import('./pages/UnionFindPage'))
const SortComparePage = lazy(() => import('./pages/SortComparePage'))
const GraphAlgorithmPage = lazy(() => import('./pages/GraphAlgorithmPage'))

function PageLoader() {
  const { t } = useGlobalSettings()
  return (
    <div className="flex-1 flex items-center justify-center bg-paper dark:bg-dark-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-ink dark:border-dark-border border-t-accent-blue rounded-full animate-spin" />
        <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">{t('common.running')}</span>
      </div>
    </div>
  )
}

function App() {
  // file:// 协议下（本地直接打开 dist/index.html）使用 HashRouter，
  // http(s):// 协议下（含 GitHub Pages）使用 BrowserRouter 保持 URL 美观
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:'
  const Router = isFileProtocol ? HashRouter : BrowserRouter
  const routerProps = isFileProtocol ? {} : { basename: '/Data-Structures-Visualized' }

  return (
    <GlobalSettingsProvider>
      <Router {...routerProps}>
        <Layout>
          <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/array" element={<ArrayPage />} />
              <Route path="/stack" element={<StackPage />} />
              <Route path="/queue" element={<QueuePage />} />
              <Route path="/linkedlist" element={<LinkedListPage />} />
              <Route path="/tree" element={<TreePage />} />
              <Route path="/graph" element={<GraphPage />} />
              <Route path="/sort" element={<SortPage />} />
              <Route path="/hash" element={<HashPage />} />
              <Route path="/heap" element={<HeapPage />} />
              <Route path="/trie" element={<TriePage />} />
              <Route path="/avl-tree" element={<AvlTreePage />} />
              <Route path="/red-black-tree" element={<RedBlackTreePage />} />
              <Route path="/b-tree" element={<BTreePage />} />
              <Route path="/skip-list" element={<SkipListPage />} />
              <Route path="/union-find" element={<UnionFindPage />} />
              <Route path="/compare" element={<SortComparePage />} />
              <Route path="/graph-algorithm" element={<GraphAlgorithmPage />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </Layout>
      </Router>
    </GlobalSettingsProvider>
  )
}

export default App
