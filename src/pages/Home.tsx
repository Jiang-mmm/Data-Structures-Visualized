import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

const ACCENT_COLORS = [
  { bg: 'bg-accent-blue/5', border: 'border-l-accent-blue', badge: 'bg-accent-blue/10 text-accent-blue', iconBg: 'bg-accent-blue/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(37,99,235,0.15)]' },
  { bg: 'bg-accent-violet/5', border: 'border-l-accent-violet', badge: 'bg-accent-violet/10 text-accent-violet', iconBg: 'bg-accent-violet/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(124,58,237,0.15)]' },
  { bg: 'bg-accent-teal/5', border: 'border-l-accent-teal', badge: 'bg-accent-teal/10 text-accent-teal', iconBg: 'bg-accent-teal/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(13,148,136,0.15)]' },
  { bg: 'bg-accent-amber/5', border: 'border-l-accent-amber', badge: 'bg-accent-amber/10 text-accent-amber', iconBg: 'bg-accent-amber/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(217,119,6,0.15)]' },
  { bg: 'bg-accent-rose/5', border: 'border-l-accent-rose', badge: 'bg-accent-rose/10 text-accent-rose', iconBg: 'bg-accent-rose/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(225,29,72,0.15)]' },
  { bg: 'bg-accent-emerald/5', border: 'border-l-accent-emerald', badge: 'bg-accent-emerald/10 text-accent-emerald', iconBg: 'bg-accent-emerald/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(5,150,105,0.15)]' },
  { bg: 'bg-accent-cyan/5', border: 'border-l-accent-cyan', badge: 'bg-accent-cyan/10 text-accent-cyan', iconBg: 'bg-accent-cyan/10', hoverGlow: 'group-hover:shadow-[0_0_20px_rgba(8,145,178,0.15)]' },
]

export default function Home() {
  const { t } = useGlobalSettings()

  const structures = useMemo(() => [
    { path: '/array', name: t('array.title'), en: 'Array', icon: '▦', desc: t('array.subtitle'), ops: [t('array.insert'), t('array.delete'), t('array.search')], colorIdx: 0 },
    { path: '/stack', name: t('stack.title'), en: 'Stack', icon: '☰', desc: t('stack.subtitle'), ops: [t('stack.push'), t('stack.pop'), t('stack.peek')], colorIdx: 1 },
    { path: '/queue', name: t('queue.title'), en: 'Queue', icon: '→', desc: t('queue.subtitle'), ops: [t('queue.enqueue'), t('queue.dequeue'), t('queue.peek')], colorIdx: 2 },
    { path: '/linkedlist', name: t('linkedlist.title'), en: 'LinkedList', icon: '∞', desc: t('linkedlist.subtitle'), ops: [t('linkedlist.pushFront'), t('linkedlist.pushBack'), t('linkedlist.find')], colorIdx: 3 },
    { path: '/tree', name: t('tree.title'), en: 'BinaryTree', icon: '❖', desc: t('tree.subtitle'), ops: [t('tree.preorder'), t('tree.inorder'), t('tree.postorder')], colorIdx: 4 },
    { path: '/graph', name: t('graph.title'), en: 'Graph', icon: '⬡', desc: t('graph.subtitle'), ops: [t('graph.bfs'), t('graph.dfs'), t('graph.dijkstra')], colorIdx: 5 },
    { path: '/hash', name: t('hash.title'), en: 'HashTable', icon: '#', desc: t('hash.subtitle'), ops: [t('hash.insert'), t('hash.remove'), t('hash.search')], colorIdx: 3 },
    { path: '/heap', name: t('heap.title'), en: 'Heap', icon: '▲', desc: t('heap.subtitle'), ops: [t('heap.insert'), t('heap.extractMax'), t('heap.peek')], colorIdx: 1 },
    { path: '/trie', name: t('trie.title'), en: 'Trie', icon: '🌳', desc: t('trie.subtitle'), ops: [t('trie.insert'), t('trie.search'), t('trie.prefixSearch')], colorIdx: 5 },
    { path: '/sort', name: t('sort.title'), en: 'Sorting', icon: '⇅', desc: t('sort.subtitle'), ops: [t('sortLegend.unsorted'), t('sortLegend.comparing'), t('sortLegend.swapping')], colorIdx: 6 },
    { path: '/compare', name: t('compare.title'), en: 'Compare', icon: '⚖', desc: t('compare.subtitle'), ops: [t('compare.runAll'), t('compare.stop'), t('compare.exportCSV')], colorIdx: 4 },
    { path: '/graph-algorithm', name: t('graphAlgorithm.title'), en: 'GraphAlgo', icon: '🔬', desc: t('graphAlgorithm.subtitle'), ops: [t('graph.bfs'), t('graph.dfs'), t('graph.dijkstra')], colorIdx: 0 },
  ], [t])

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-paper grain">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <header className="mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="animate-slide-up max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper text-xs font-bold tracking-widest uppercase mb-8 shadow-[3px_3px_0px_rgba(37,99,235,0.3)]">
                <span className="w-2 h-2 bg-accent-emerald rounded-full animate-pulse" />
                {t('home.badge')}
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6 text-ink dark:text-dark-ink">
                {t('home.title')}
              </h1>
              <p className="text-ink-light dark:text-dark-ink-light text-lg md:text-xl max-w-lg leading-relaxed mt-6">
                {t('home.heroDescription')}
              </p>
            </div>

            <div className="hidden md:block animate-pop">
              <div className="relative">
                <div className="w-28 h-28 neo-border bg-gradient-to-br from-accent-violet to-accent-blue flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-500 ease-out">
                  <span className="text-5xl font-black text-paper drop-shadow-lg">DS</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-accent-emerald border-2 border-ink dark:border-dark-border flex items-center justify-center text-xs font-bold text-paper shadow-[2px_2px_0px_#1a1a2e]">
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
                {ACCENT_COLORS.slice(0, 5).map((c, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${c.badge.split(' ')[0].replace('/10', '')}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {structures.map((item, i) => {
            const color = ACCENT_COLORS[item.colorIdx % ACCENT_COLORS.length]
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  group relative block
                  border-2 border-ink dark:border-dark-border
                  border-l-4 ${color.border}
                  ${color.bg} ${color.hoverGlow}
                  bg-white/90 dark:bg-slate/90 backdrop-blur-sm
                  p-6 transition-all duration-300 ease-out
                  hover:-translate-y-1.5
                  hover:shadow-[6px_6px_0px_#1a1a2e] dark:hover:shadow-[6px_6px_0px_#334155]
                  hover:border-ink dark:hover:border-dark-border
                  animate-slide-up
                  overflow-hidden
                `}
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              >
                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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

                <h2 className="text-xl font-bold mb-2 text-ink dark:text-dark-ink group-hover:text-accent-blue transition-colors duration-200">
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
                        bg-paper/80 dark:bg-slate/80
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
                  <span className="text-lg group-hover:translate-x-2 transition-transform duration-300 text-ink/40 dark:text-dark-ink/40 group-hover:text-accent-blue">→</span>
                </div>
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