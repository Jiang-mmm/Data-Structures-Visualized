import { useState, useCallback, useEffect, useRef, memo, type RefObject } from 'react'
import { showToast } from './toastStore'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { OperationButton } from './OperationBar'
import {
  exportAnimationWebM,
  exportAnimationGIF,
  exportAnimationFrames,
  isAnimationExportSupported,
} from '../utils/animationExport'

type ExportFormat = 'webm' | 'gif' | 'frames'

interface AnimationExportButtonProps {
  /** 可视化区域的 SVG 引用，用于截图 */
  svgRef: RefObject<SVGSVGElement | null>
  /** SVG 逻辑宽度（用于 canvas 尺寸） */
  width: number
  /** SVG 逻辑高度 */
  height: number
  /** 是否禁用（例如：没有数据时） */
  disabled?: boolean
  /** 录制时长（毫秒），默认 3000 */
  durationMs?: number
  /** 帧率，默认 30 */
  fps?: number
}

function AnimationExportButton({
  svgRef,
  width,
  height,
  disabled = false,
  durationMs = 3000,
  fps = 30,
}: AnimationExportButtonProps) {
  const { t } = useGlobalSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 点击外部关闭菜单
  useEffect(() => {
    if (!isOpen) return
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (containerRef.current && target && !containerRef.current.contains(target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [isOpen])

  // Escape 键关闭
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = useCallback(async (format: ExportFormat) => {
    setIsOpen(false)
    const support = isAnimationExportSupported()
    if (format === 'webm' && !support.webm) {
      showToast({ type: 'error', message: t('exportAnimation.unsupported') })
      return
    }
    if (format === 'gif' && !support.gif) {
      showToast({ type: 'error', message: t('exportAnimation.unsupported') })
      return
    }
    if (format === 'frames' && !support.frames) {
      showToast({ type: 'error', message: t('exportAnimation.unsupported') })
      return
    }
    setIsRecording(true)
    try {
      const baseName = `ds-visualizer-${format}-${Date.now()}`
      const filename = format === 'webm'
        ? `${baseName}.webm`
        : format === 'gif'
          ? `${baseName}.gif`
          : `${baseName}.zip`
      if (format === 'webm') {
        await exportAnimationWebM(svgRef, width, height, durationMs, fps, filename)
      } else if (format === 'gif') {
        await exportAnimationGIF(svgRef, width, height, durationMs, fps, filename)
      } else {
        await exportAnimationFrames(svgRef, width, height, durationMs, fps, filename)
      }
    } finally {
      setIsRecording(false)
    }
  }, [svgRef, width, height, durationMs, fps, t])

  const handleToggleMenu = useCallback(() => {
    if (disabled || isRecording) return
    const support = isAnimationExportSupported()
    if (!support.webm && !support.gif && !support.frames) {
      showToast({ type: 'error', message: t('exportAnimation.unsupported') })
      return
    }
    setIsOpen(prev => !prev)
  }, [disabled, isRecording, t])

  const label = t('exportAnimation.label')
  const tooltip = t('exportAnimation.tooltip')

  return (
    <div ref={containerRef} className="relative inline-block">
      <OperationButton
        variant="secondary"
        onClick={handleToggleMenu}
        disabled={disabled || isRecording}
        isLoading={isRecording}
        title={tooltip}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-sm" aria-hidden="true">⏺</span>
          <span className="hidden sm:inline">{isRecording ? t('exportAnimation.recording') : label}</span>
        </span>
      </OperationButton>

      {isOpen && (
        <div
          role="menu"
          aria-label={t('exportAnimation.title')}
          className="absolute right-0 top-full mt-2 z-50 min-w-[180px] bg-paper dark:bg-dark-paper border-2 border-ink dark:border-dark-border shadow-button-hover dark:shadow-button-dark-hover"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('webm')}
            className="w-full text-left px-3 py-2 text-sm font-mono font-bold text-ink dark:text-dark-ink hover:bg-accent-yellow dark:hover:bg-dark-accent-yellow transition-colors"
          >
            {t('exportAnimation.webm')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('gif')}
            className="w-full text-left px-3 py-2 text-sm font-mono font-bold text-ink dark:text-dark-ink hover:bg-accent-yellow dark:hover:bg-dark-accent-yellow transition-colors"
          >
            {t('exportAnimation.gif')}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handleSelect('frames')}
            className="w-full text-left px-3 py-2 text-sm font-mono font-bold text-ink dark:text-dark-ink hover:bg-accent-yellow dark:hover:bg-dark-accent-yellow transition-colors"
          >
            {t('exportAnimation.frames')}
          </button>
        </div>
      )}
    </div>
  )
}

export default memo(AnimationExportButton)
