import { useState, memo } from 'react'

interface AlgorithmInfoProps {
  algorithmKey: string
  name: string
  timeComplexity: string
  spaceComplexity: string
  isAnimating: boolean
}

const ALGORITHM_INFO: Record<string, { description: string; characteristics: string[] }> = {
  bubble: {
    description: '重复遍历数组，比较相邻元素并交换顺序不对的对。',
    characteristics: ['稳定排序', '原地排序', '适合小规模或近乎有序的数据'],
  },
  quick: {
    description: '选择基准元素分区，递归排序左右子数组。',
    characteristics: ['不稳定排序', '原地排序', '平均性能最优的比较排序'],
  },
  merge: {
    description: '递归拆分数组至单元素，再有序合并。',
    characteristics: ['稳定排序', '需要额外 O(n) 空间', '适合链表和外部排序'],
  },
  heap: {
    description: '利用最大堆性质，逐步取出堆顶放到末尾。',
    characteristics: ['不稳定排序', '原地排序', '最坏情况仍为 O(n log n)'],
  },
  selection: {
    description: '每轮选出最小元素放到已排序区间末尾。',
    characteristics: ['不稳定排序', '原地排序', '交换次数最少（最多 n-1 次）'],
  },
  insertion: {
    description: '将每个元素插入到前面已排序部分的正确位置。',
    characteristics: ['稳定排序', '原地排序', '对近乎有序的数据效率极高'],
  },
  counting: {
    description: '统计每个值出现次数，按序输出。',
    characteristics: ['稳定排序', '非比较排序', '适用于值域较小的整数数据'],
  },
  shell: {
    description: '按递减间隔序列对子序列做插入排序。',
    characteristics: ['不稳定排序', '原地排序', '插入排序的高效泛化'],
  },
  radix: {
    description: '按位（个十百千…）依次排序，使用稳定排序作为子过程。',
    characteristics: ['稳定排序', '非比较排序', '适用于固定位数的整数'],
  },
  bucket: {
    description: '将数据分配到多个桶中，桶内排序后合并。',
    characteristics: ['稳定（取决于桶内排序）', '非比较排序', '适用于均匀分布的数据'],
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
        className="w-full px-4 py-2 flex items-center gap-3 text-sm hover:bg-paper-warm/40 dark:hover:bg-slate-light/40 transition-colors text-left"
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
        <div className="px-4 py-3 text-sm space-y-2 border-t border-ink/5 dark:border-dark-border/20 bg-paper-warm/20 dark:bg-slate-light/20">
          <p className="text-ink dark:text-dark-ink leading-relaxed">{info.description}</p>
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
