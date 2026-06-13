import { memo, useState, useEffect, useRef } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { ANIMATION_PRESETS } from '../utils/animationEngine'

interface SpeedOption {
  label: string
  value: number
}

const SPEED_OPTIONS: SpeedOption[] = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
]

const PRESET_KEYS = Object.keys(ANIMATION_PRESETS)

export default memo(function SpeedControl() {
  const { animationSpeed, setAnimationSpeed, currentPreset, applyPreset, t } = useGlobalSettings()
  const [showPresets, setShowPresets] = useState<boolean>(false)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showPresets) { setFocusedIndex(-1); return }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPresets(false)
      if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, PRESET_KEYS.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && focusedIndex >= 0) { applyPreset(PRESET_KEYS[focusedIndex]); setShowPresets(false) }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowPresets(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showPresets, focusedIndex, applyPreset])

  return (
    <div className="flex items-center gap-2">
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowPresets(!showPresets)}
          aria-label={t('speedControl.presetDefault')}
          aria-expanded={showPresets}
          className="flex items-center gap-1 px-2 py-0.5 font-mono text-xs border-2 border-ink/30 dark:border-dark-border bg-white dark:bg-slate text-ink-light dark:text-dark-ink-light hover:bg-ink/5 dark:hover:bg-dark-ink/5 hover:border-ink dark:hover:border-dark-ink transition-colors"
        >
          <span>{ANIMATION_PRESETS[currentPreset]?.icon}</span>
          <span className="hidden sm:inline">{ANIMATION_PRESETS[currentPreset]?.nameKey ? t(ANIMATION_PRESETS[currentPreset].nameKey!) : ANIMATION_PRESETS[currentPreset]?.name}</span>
        </button>
        {showPresets && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-slate border-2 border-ink dark:border-dark-border shadow-[3px_3px_0px_#1a1a2e] dark:shadow-[3px_3px_0px_#334155] min-w-[140px] animate-slide-down">
            {PRESET_KEYS.map((key, index) => {
              const preset = ANIMATION_PRESETS[key]
              return (
                <button
                  key={key}
                  onClick={() => { applyPreset(key); setShowPresets(false) }}
                  aria-current={currentPreset === key ? 'true' : undefined}
                  className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-mono text-left transition-colors
                    ${currentPreset === key
                      ? 'bg-accent-blue text-paper'
                      : focusedIndex === index
                        ? 'bg-ink/10 dark:bg-dark-ink/10 text-ink dark:text-dark-ink'
                        : 'hover:bg-ink/5 dark:hover:bg-dark-ink/5 text-ink-light dark:text-dark-ink-light'
                    }`}
                >
                  <span className="w-4 text-center">{preset.icon}</span>
                  <span>{preset.nameKey ? t(preset.nameKey) : preset.name}</span>
                  <span className="ml-auto opacity-50 text-[10px]">{preset.speed}x</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="hidden sm:block w-px h-4 bg-ink/20 dark:bg-dark-ink/20" />

      <div className="flex items-center gap-1.5">
        <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">{t('settings.animationSpeed')}:</span>
        {SPEED_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setAnimationSpeed(opt.value)}
            aria-pressed={animationSpeed === opt.value}
            className={`px-2 py-0.5 font-mono text-xs transition-all border-2
              ${animationSpeed === opt.value
                ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper border-ink dark:border-dark-ink shadow-[1px_1px_0px_#1a1a2e] dark:shadow-[1px_1px_0px_#334155]'
                : 'bg-white dark:bg-slate text-ink-light dark:text-dark-ink-light border-ink/20 dark:border-dark-border hover:bg-ink/5 dark:hover:bg-dark-ink/5 hover:border-ink/40 dark:hover:border-dark-ink/40'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
})
