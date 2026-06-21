import { memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { isLargeData, type VisualizerKey } from '../utils/performanceConfig'

interface PerformanceIndicatorProps {
  visualizerKey: VisualizerKey
  dataLength: number
}

/**
 * 性能模式指示器
 * 当数据量超过阈值时显示徽章，提示用户已进入性能模式
 */
function PerformanceIndicator({ visualizerKey, dataLength }: PerformanceIndicatorProps) {
  const { t } = useGlobalSettings()

  if (!isLargeData(visualizerKey, dataLength)) return null

  return (
    <span
      role="status"
      aria-live="polite"
      title={t('performance.hint')}
      className="inline-flex items-center border border-ink bg-yellow-100 text-ink px-2 py-0.5 text-xs font-mono font-bold"
    >
      {t('performance.mode')}
    </span>
  )
}

export default memo(PerformanceIndicator)
