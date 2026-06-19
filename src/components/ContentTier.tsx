import { useState, memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'

type Tier = 'beginner' | 'intermediate' | 'advanced'
type StructureKey = 'array' | 'stack' | 'queue' | 'linkedlist' | 'tree' | 'avlTree'

interface ContentTierProps {
  structureKey: StructureKey
  defaultTier?: Tier
  defaultExpanded?: boolean
}

const TIERS: Tier[] = ['beginner', 'intermediate', 'advanced']

const TIER_ACTIVE_STYLES: Record<Tier, string> = {
  beginner: 'bg-accent-emerald text-paper border-ink dark:border-dark-border shadow-button',
  intermediate: 'bg-accent-blue text-paper border-ink dark:border-dark-border shadow-button',
  advanced: 'bg-accent-amber text-paper border-ink dark:border-dark-border shadow-button',
}

const TIER_INDICATOR: Record<Tier, string> = {
  beginner: 'bg-accent-emerald',
  intermediate: 'bg-accent-blue',
  advanced: 'bg-accent-amber',
}

interface Section {
  label: string
  content: string
  isCode?: boolean
}

function ContentTier({ structureKey, defaultTier = 'beginner', defaultExpanded = false }: ContentTierProps) {
  const { t } = useGlobalSettings()
  const [tier, setTier] = useState<Tier>(defaultTier)
  const [expanded, setExpanded] = useState(defaultExpanded)

  const sections: Record<Tier, Section[]> = {
    beginner: [
      { label: t('contentTier.conceptLabel'), content: t(`contentTier.${structureKey}.beginnerConcept`) },
      { label: t('contentTier.featuresLabel'), content: t(`contentTier.${structureKey}.beginnerFeatures`) },
    ],
    intermediate: [
      { label: t('contentTier.complexityLabel'), content: t(`contentTier.${structureKey}.intermediateComplexity`) },
      { label: t('contentTier.applicationsLabel'), content: t(`contentTier.${structureKey}.intermediateApplications`) },
      { label: t('contentTier.codeLabel'), content: t(`contentTier.${structureKey}.intermediateCode`), isCode: true },
    ],
    advanced: [
      { label: t('contentTier.variantsLabel'), content: t(`contentTier.${structureKey}.advancedVariants`) },
      { label: t('contentTier.comparisonLabel'), content: t(`contentTier.${structureKey}.advancedComparison`) },
      { label: t('contentTier.engineeringLabel'), content: t(`contentTier.${structureKey}.advancedEngineering`) },
    ],
  }

  return (
    <div className="border-b-2 border-ink/10 dark:border-dark-border/30 bg-muted/30 dark:bg-dark-muted/20">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-2 flex items-center gap-3 text-sm hover:bg-muted/60 dark:hover:bg-dark-muted/40 transition-colors text-left"
        aria-expanded={expanded}
        aria-label={expanded ? t('contentTier.collapse') : t('contentTier.expand')}
      >
        <span className="font-mono text-[10px] text-ink-light/50">{expanded ? '▼' : '▶'}</span>
        <span className="font-bold text-ink dark:text-dark-ink">{t('contentTier.title')}</span>
        <span className={`w-2 h-2 rounded-full ${TIER_INDICATOR[tier]} flex-shrink-0`} />
        <span className="text-xs text-ink-light/60 dark:text-dark-ink-light/60 font-mono">
          {t(`contentTier.${tier}`)}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-3 animate-fade-in">
          <div className="flex gap-2 mb-3">
            {TIERS.map((tierName) => (
              <button
                key={tierName}
                onClick={() => setTier(tierName)}
                className={`px-3 py-1.5 text-xs font-bold border-2 transition-all duration-200 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                  tier === tierName
                    ? TIER_ACTIVE_STYLES[tierName]
                    : 'bg-surface dark:bg-dark-surface border-ink/20 dark:border-dark-border/40 text-ink-light dark:text-dark-ink-light hover:bg-ink/5 dark:hover:bg-dark-ink/5'
                }`}
                aria-pressed={tier === tierName}
              >
                {t(`contentTier.${tierName}`)}
              </button>
            ))}
          </div>

          <div className="space-y-3" key={tier}>
            {sections[tier].map((section, i) => (
              <div key={i} className="border-l-2 border-ink/20 dark:border-dark-border/40 pl-3">
                <div className="text-xs font-bold text-ink dark:text-dark-ink mb-1 uppercase tracking-wide">
                  {section.label}
                </div>
                {section.isCode ? (
                  <pre className="text-xs font-mono text-ink-light dark:text-dark-ink-light bg-ink/5 dark:bg-dark-ink/5 p-2 border border-ink/10 dark:border-dark-border/30 overflow-x-auto whitespace-pre-wrap">
                    {section.content}
                  </pre>
                ) : (
                  <p className="text-sm text-ink-light dark:text-dark-ink-light leading-relaxed">
                    {section.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(ContentTier)
