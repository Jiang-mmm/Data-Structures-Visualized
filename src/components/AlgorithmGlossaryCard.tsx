import { useState, memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { useAlgorithmGlossary } from '../hooks/useAlgorithmGlossary'

/**
 * 算法术语速查表：双栏展示 16 个核心数据结构/排序的
 * 名称、定义、应用场景与时间/空间复杂度。
 * 默认折叠，点开后才渲染表格行（避免首次加载过大 DOM）。
 */
function AlgorithmGlossaryCard() {
  const { t } = useGlobalSettings()
  const items = useAlgorithmGlossary()
  const [expanded, setExpanded] = useState(false)

  return (
    <section
      className="mb-12 animate-slide-up"
      style={{ animationDelay: '280ms', animationFillMode: 'both' }}
      data-testid="algorithm-glossary-card"
    >
      <div className="border-2 border-ink dark:border-dark-border bg-surface dark:bg-dark-surface p-5 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent-amber flex items-center justify-center text-paper text-sm font-bold shadow-button dark:shadow-button-dark">
              ☷
            </div>
            <h2 className="text-lg font-bold text-ink dark:text-dark-ink">
              {t('complexity.glossaryTitle')}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] font-mono font-bold px-3 py-1.5 border-2 border-ink dark:border-dark-border bg-paper dark:bg-dark-paper text-ink dark:text-dark-ink hover:-translate-y-0.5 hover:shadow-button dark:hover:shadow-button-dark transition-all"
            aria-expanded={expanded}
            aria-controls="algorithm-glossary-table"
          >
            {expanded ? t('complexity.showLess') : t('complexity.showMore')}
          </button>
        </div>

        <p className="text-xs text-ink-light dark:text-dark-ink-light mb-4">
          {t('complexity.glossarySubtitle')}
        </p>

        {/* Table (only render rows when expanded) */}
        {expanded && (
          <div id="algorithm-glossary-table" className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-ink/20 dark:border-dark-border/40 text-left">
                  <th className="py-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-dark-ink-light">
                    {t('complexity.name')}
                  </th>
                  <th className="py-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-dark-ink-light">
                    {t('complexity.useCase')}
                  </th>
                  <th className="py-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-dark-ink-light">
                    {t('complexity.best')}
                  </th>
                  <th className="py-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-dark-ink-light">
                    {t('complexity.average')}
                  </th>
                  <th className="py-2 pr-2 font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-dark-ink-light">
                    {t('complexity.worst')}
                  </th>
                  <th className="py-2 font-mono text-[10px] uppercase tracking-widest text-ink-light dark:text-dark-ink-light">
                    {t('complexity.space')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-ink-light/60 dark:text-dark-ink-light/60">
                      {t('complexity.emptyHint')}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-ink/5 dark:border-dark-border/20 hover:bg-ink/[0.02] dark:hover:bg-dark-ink/[0.04]"
                    >
                      <td className="py-2 pr-2 font-bold text-ink dark:text-dark-ink">{item.name}</td>
                      <td className="py-2 pr-2 text-ink-light dark:text-dark-ink-light">{item.useCase}</td>
                      <td className="py-2 pr-2 font-mono text-[11px]">{item.complexity.best}</td>
                      <td className="py-2 pr-2 font-mono text-[11px]">{item.complexity.average}</td>
                      <td className="py-2 pr-2 font-mono text-[11px]">{item.complexity.worst}</td>
                      <td className="py-2 font-mono text-[11px]">{item.complexity.space}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default memo(AlgorithmGlossaryCard)
