import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

export default function Home() {
  const { t } = useGlobalSettings()

  const structures = useMemo(() => [
    { path: '/array', name: t('array.title'), en: 'Array', icon: '▦', desc: t('array.subtitle'), ops: [t('array.insert'), t('array.delete'), t('array.search')], accent: 'border-l-accent-blue bg-accent-blue/5', badge: 'bg-accent-blue/10 text-accent-blue' },
    { path: '/stack', name: t('stack.title'), en: 'Stack', icon: '☰', desc: t('stack.subtitle'), ops: ['Push', 'Pop', 'Peek'], accent: 'border-l-accent-violet bg-accent-violet/5', badge: 'bg-accent-violet/10 text-accent-violet' },
    { path: '/queue', name: t('queue.title'), en: 'Queue', icon: '→', desc: t('queue.subtitle'), ops: ['Enqueue', 'Dequeue', 'Front'], accent: 'border-l-accent-teal bg-accent-teal/5', badge: 'bg-accent-teal/10 text-accent-teal' },
    { path: '/linkedlist', name: t('linkedlist.title'), en: 'LinkedList', icon: '∞', desc: t('linkedlist.subtitle'), ops: [t('linkedlist.pushFront'), t('linkedlist.pushBack'), t('linkedlist.find')], accent: 'border-l-accent-amber bg-accent-amber/5', badge: 'bg-accent-amber/10 text-accent-amber' },
    { path: '/tree', name: t('tree.title'), en: 'BinaryTree', icon: '❖', desc: t('tree.subtitle'), ops: [t('tree.preorder'), t('tree.inorder'), t('tree.postorder')], accent: 'border-l-accent-rose bg-accent-rose/5', badge: 'bg-accent-rose/10 text-accent-rose' },
    { path: '/graph', name: t('graph.title'), en: 'Graph', icon: '⬡', desc: t('graph.subtitle'), ops: ['BFS', 'DFS', 'Dijkstra'], accent: 'border-l-accent-emerald bg-accent-emerald/5', badge: 'bg-accent-emerald/10 text-accent-emerald' },
    { path: '/sort', name: t('sort.title'), en: 'Sorting', icon: '⇅', desc: t('sort.subtitle'), ops: [t('sortLegend.unsorted'), t('sortLegend.comparing'), t('sortLegend.swapping')], accent: 'border-l-accent-cyan bg-accent-cyan/5', badge: 'bg-accent-cyan/10 text-accent-cyan' },
  ], [t])

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-paper grain">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper text-xs font-bold tracking-widest uppercase mb-6 shadow-[2px_2px_0px_rgba(37,99,235,0.3)]">
                {t('home.badge')}
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4 text-ink dark:text-dark-ink">
                {t('home.title')}
              </h1>
              <p className="text-ink-light dark:text-dark-ink-light text-lg max-w-lg leading-relaxed mt-6">
                {t('home.heroDescription')}
              </p>
            </div>

            <div className="hidden md:block animate-pop">
              <div className="w-24 h-24 neo-border bg-accent-violet flex items-center justify-center -rotate-6 hover:rotate-0 transition-transform duration-300">
                <span className="text-5xl font-black text-paper">DS</span>
              </div>
            </div>
          </div>
        </header>

        <div className="dot-grid border-2 border-ink dark:border-dark-border p-1 mb-12 animate-slide-up">
          <div className="bg-paper/90 dark:bg-dark-paper/90 backdrop-blur-sm p-3 flex items-center justify-between">
            <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light tracking-widest uppercase">
              {t('home.selectStructure')}
            </span>
            <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">
              {structures.length} MODULES
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {structures.map((item, i) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                group block neo-border-hover
                border-l-4 ${item.accent}
                bg-white/80 dark:bg-slate/80 backdrop-blur-sm
                p-6 transition-all duration-200
                hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1a1a2e] dark:hover:shadow-[4px_4px_0px_#334155]
                animate-slide-up
              `}
              style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 ${item.badge}`}>
                  {item.en}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-accent-blue transition-colors text-ink dark:text-dark-ink">
                {item.name}
              </h3>
              <p className="text-sm text-ink-light dark:text-dark-ink-light mb-5 leading-relaxed">
                {item.desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {item.ops.map((op) => (
                  <span
                    key={op}
                    className="px-2.5 py-1 text-xs font-medium border-2 border-border dark:border-dark-border bg-paper dark:bg-slate text-ink dark:text-dark-ink
                      group-hover:border-ink/30 dark:group-hover:border-dark-ink/30 transition-colors"
                  >
                    {op}
                  </span>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-border dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-mono text-ink-light dark:text-dark-ink-light">{t('home.enterModule')}</span>
                <span className="text-lg group-hover:translate-x-1.5 transition-transform duration-200 text-ink dark:text-dark-ink">→</span>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t-2 border-ink dark:border-dark-border text-center">
          <p className="font-mono text-xs text-ink-light dark:text-dark-ink-light tracking-wide">
            {t('visualizer.footer')}
          </p>
        </footer>
      </div>
    </div>
  )
}