import { useState, memo } from 'react'
import { tStatic } from '../i18n/useI18n'

interface AlgorithmInfoProps {
  algorithmKey: string
  name: string
  timeComplexity: string
  spaceComplexity: string
  isAnimating: boolean
}

const ALGORITHM_INFO: Record<string, { description: string; characteristics: string[] }> = {
  bubble: {
    description: tStatic('algorithmInfo.bubble.description'),
    characteristics: tStatic('algorithmInfo.bubble.characteristics').split('|'),
  },
  quick: {
    description: tStatic('algorithmInfo.quick.description'),
    characteristics: tStatic('algorithmInfo.quick.characteristics').split('|'),
  },
  merge: {
    description: tStatic('algorithmInfo.merge.description'),
    characteristics: tStatic('algorithmInfo.merge.characteristics').split('|'),
  },
  heap: {
    description: tStatic('algorithmInfo.heap.description'),
    characteristics: tStatic('algorithmInfo.heap.characteristics').split('|'),
  },
  selection: {
    description: tStatic('algorithmInfo.selection.description'),
    characteristics: tStatic('algorithmInfo.selection.characteristics').split('|'),
  },
  insertion: {
    description: tStatic('algorithmInfo.insertion.description'),
    characteristics: tStatic('algorithmInfo.insertion.characteristics').split('|'),
  },
  counting: {
    description: tStatic('algorithmInfo.counting.description'),
    characteristics: tStatic('algorithmInfo.counting.characteristics').split('|'),
  },
  shell: {
    description: tStatic('algorithmInfo.shell.description'),
    characteristics: tStatic('algorithmInfo.shell.characteristics').split('|'),
  },
  radix: {
    description: tStatic('algorithmInfo.radix.description'),
    characteristics: tStatic('algorithmInfo.radix.characteristics').split('|'),
  },
  bucket: {
    description: tStatic('algorithmInfo.bucket.description'),
    characteristics: tStatic('algorithmInfo.bucket.characteristics').split('|'),
  },
}

function AlgorithmInfo({ algorithmKey, name, timeComplexity, spaceComplexity, isAnimating }: AlgorithmInfoProps) {
  const [open, setOpen] = useState(false)
  const info = ALGORITHM_INFO[algorithmKey]

  if (!info) return null

  return (
    <div className="border-t-2 border-ink/10 dark:border-dark-border/30">
      <button
        onClick={() => setOpen(!open)}
        disabled={isAnimating}
        className="w-full px-4 py-2 flex items-center gap-3 text-sm hover:bg-muted/40 dark:hover:bg-dark-muted/40 transition-colors text-left"
        aria-expanded={open}
      >
        <span className="font-mono text-[10px] text-ink-light/50">{open ? '▼' : '▶'}</span>
        <span className="font-semibold text-ink dark:text-dark-ink">{name}</span>
        <span className="font-mono text-xs px-1.5 py-0.5 border border-ink/15 dark:border-dark-border/40 text-ink-light dark:text-dark-ink-light">
          Time: {timeComplexity}
        </span>
        <span className="font-mono text-xs px-1.5 py-0.5 border border-ink/15 dark:border-dark-border/40 text-ink-light dark:text-dark-ink-light">
          Space: {spaceComplexity}
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 text-sm space-y-2 border-t border-ink/5 dark:border-dark-border/20 bg-muted/20 dark:bg-dark-muted/20">
          <p className="text-ink-light dark:text-dark-ink-light leading-relaxed">{info.description}</p>
          <ul className="space-y-1">
            {info.characteristics.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-ink-light dark:text-dark-ink-light">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-ink/25 dark:bg-dark-ink/25 flex-shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default memo(AlgorithmInfo)
