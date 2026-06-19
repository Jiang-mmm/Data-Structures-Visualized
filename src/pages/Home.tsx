import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import LearningPath from '../components/LearningPath'
import ProgressOverview from '../components/ProgressOverview'
import LearningRecommendations from '../components/LearningRecommendations'
import Card, { type CardAccent } from '../components/Card'

const ACCENT_COLORS = [
  { accent: 'blue' as CardAccent, badge: 'bg-card-group-linear/10 text-card-group-linear', iconBg: 'bg-card-group-linear/10', hoverText: 'group-hover:text-card-group-linear' },
  { accent: 'amber' as CardAccent, badge: 'bg-card-group-tree/10 text-card-group-tree', iconBg: 'bg-card-group-tree/10', hoverText: 'group-hover:text-card-group-tree' },
  { accent: 'red' as CardAccent, badge: 'bg-card-group-graph/10 text-card-group-graph', iconBg: 'bg-card-group-graph/10', hoverText: 'group-hover:text-card-group-graph' },
]

export default function Home() {
  const { t } = useGlobalSettings()

  const structures = useMemo(() => [
    // 线性结构类 (blue)
    { path: '/array', name: t('array.title'), en: 'Array', icon: '▦', desc: t('array.subtitle'), ops: [t('array.insert'), t('array.delete'), t('array.search')], colorIdx: 0 },
    { path: '/stack', name: t('stack.title'), en: 'Stack', icon: '▥', desc: t('stack.subtitle'), ops: [t('stack.push'), t('stack.pop'), t('stack.peek')], colorIdx: 0 },
    { path: '/queue', name: t('queue.title'), en: 'Queue', icon: '⇒', desc: t('queue.subtitle'), ops: [t('queue.enqueue'), t('queue.dequeue'), t('queue.peek')], colorIdx: 0 },
    { path: '/linkedlist', name: t('linkedlist.title'), en: 'LinkedList', icon: '●', desc: t('linkedlist.subtitle'), ops: [t('linkedlist.pushFront'), t('linkedlist.pushBack'), t('linkedlist.find')], colorIdx: 0 },
    { path: '/sort', name: t('sort.title'), en: 'Sorting', icon: '⇅', desc: t('sort.subtitle'), ops: [t('sort.bubble'), t('sort.quick'), t('sort.merge')], colorIdx: 0 },
    { path: '/compare', name: t('compare.title'), en: 'Compare', icon: '⚖', desc: t('compare.subtitle'), ops: [t('compare.runAll'), t('compare.stop'), t('compare.exportCSV')], colorIdx: 0 },
    // 树结构类 (amber)
    { path: '/tree', name: t('tree.title'), en: 'BinaryTree', icon: '◆', desc: t('tree.subtitle'), ops: [t('tree.preorder'), t('tree.inorder'), t('tree.postorder')], colorIdx: 1 },
    { path: '/avl-tree', name: t('avlTree.title'), en: 'AVLTree', icon: '◇', desc: t('avlTree.subtitle'), ops: [t('avlTree.insert'), t('avlTree.search'), t('avlTree.inorder')], colorIdx: 1 },
    { path: '/heap', name: t('heap.title'), en: 'Heap', icon: '▲', desc: t('heap.subtitle'), ops: [t('heap.insert'), t('heap.extractMax'), t('heap.peek')], colorIdx: 1 },
    { path: '/trie', name: t('trie.title'), en: 'Trie', icon: '◈', desc: t('trie.subtitle'), ops: [t('trie.insert'), t('trie.search'), t('trie.prefixSearch')], colorIdx: 1 },
    // 图与哈希类 (rose)
    { path: '/graph', name: t('graph.title'), en: 'Graph', icon: '⬡', desc: t('graph.subtitle'), ops: [t('graph.bfs'), t('graph.dfs'), t('graph.dijkstra')], colorIdx: 2 },
    { path: '/hash', name: t('hash.title'), en: 'HashTable', icon: '#', desc: t('hash.subtitle'), ops: [t('hash.insert'), t('hash.remove'), t('hash.search')], colorIdx: 2 },
    { path: '/graph-algorithm', name: t('graphAlgorithm.title'), en: 'GraphAlgo', icon: '⥁', desc: t('graphAlgorithm.subtitle'), ops: [t('graph.bfs'), t('graph.dfs'), t('graph.dijkstra')], colorIdx: 2 },
  ], [t])

  return (
    <div className="min-h-dvh bg-paper dark:bg-dark-paper grain">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <header className="mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="animate-slide-up max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper text-xs font-bold tracking-widest uppercase mb-8 shadow-button dark:shadow-button-dark">
                <span className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
                {t('home.badge')}
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6 text-ink dark:text-dark-ink">
                {t('home.title')}
              </h1>
              <p className="text-ink-light dark:text-dark-ink-light text-lg md:text-xl max-w-lg leading-relaxed mt-6">
                {t('home.heroDescription')}
              </p>
              <p className="text-sm font-mono text-ink-light/40 dark:text-dark-ink-light/40 tracking-widest uppercase mt-3">
                {t('home.tagline')}
              </p>
            </div>

            <div className="hidden md:block animate-pop">
              <div className="relative">
                <div className="w-28 h-28 neo-border bg-gradient-to-br from-[var(--color-gradient-start)] to-[var(--color-gradient-end)] dark:from-[var(--color-dark-gradient-start)] dark:to-[var(--color-dark-gradient-end)] flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-500 ease-out">
                  <span className="text-5xl font-black text-paper drop-shadow-lg">DS</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-blue border-2 border-ink dark:border-dark-border flex items-center justify-center text-xs font-bold text-paper shadow-button dark:shadow-button-dark">
                  ✓
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="dot-grid border-2 border-ink dark:border-dark-border p-1 mb-12 animate-slide-up">
          <div className="glass dark:glass-dark p-4 flex items-center justify-between">
            <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light tracking-widest uppercase">
              {t('home.selectStructure')}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">
                {structures.length} {t('home.modules')}
              </span>
              <div className="hidden sm:flex items-center gap-1">
                {ACCENT_COLORS.map((c, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${c.badge.split(' ')[0].replace('/10', '')}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview + Recommendations + Learning Path */}
        <ProgressOverview />
        <LearningRecommendations />
        <LearningPath />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="ds-cards-grid">
          {structures.map((item, i) => {
            const color = ACCENT_COLORS[item.colorIdx % ACCENT_COLORS.length]
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group relative block animate-slide-up overflow-hidden"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                <Card variant="accent" accent={color.accent} shadow="hover" radius="none" gradient className="h-full">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-40 group-hover:opacity-80 transition-opacity duration-300">
                    <div className={`absolute top-2 right-2 w-3 h-3 ${color.iconBg} rounded-full`} />
                  </div>

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${color.iconBg} border-2 border-ink/10 dark:border-dark-border flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                      <span className="text-2xl">{item.icon}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-1 ${color.badge} border border-current/20`}>
                      {item.en}
                    </span>
                  </div>

                  <h2 className={`text-xl font-bold mb-2 text-ink dark:text-dark-ink ${color.hoverText} transition-colors duration-200`}>
                    {item.name}
                  </h2>
                  <p className="text-sm text-ink-light dark:text-dark-ink-light mb-5 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {item.ops.map((op) => (
                      <span
                        key={op}
                        className="px-2.5 py-1 text-[11px] font-medium
                          border border-border dark:border-dark-border
                          bg-paper/80 dark:bg-dark-paper/80
                          text-ink/80 dark:text-dark-ink/80
                          group-hover:border-ink/20 dark:group-hover:border-dark-ink/20
                          transition-all duration-200"
                      >
                        {op}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5 pt-4 border-t border-border/50 dark:border-dark-border/50 flex items-center justify-between">
                    <span className="text-xs font-mono text-ink-light/60 dark:text-dark-ink-light/60">{t('home.enterModule')}</span>
                    <span className={`text-lg group-hover:translate-x-2 transition-transform duration-300 text-ink/40 dark:text-dark-ink/40 ${color.hoverText}`}>→</span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t-2 border-ink/10 dark:border-dark-border/30 text-center">
          <p className="font-mono text-xs text-ink-light/50 dark:text-dark-ink-light/50 tracking-wide">
            {t('visualizer.footer')}
          </p>
        </footer>
      </div>
    </div>
  )
}