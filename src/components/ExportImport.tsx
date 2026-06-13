import { useRef } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { exportState, importState } from '../utils/dataExport'
import { showToast } from './toastStore'

interface ExportImportProps {
  dataType: string
  data: unknown
  onImport?: (result: unknown) => void
  disabled?: boolean
}

export default function ExportImport({ dataType, data, onImport, disabled }: ExportImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useGlobalSettings()

  const handleExport = () => {
    exportState(dataType, data)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const result = await importState(file)
      onImport?.(result)
    } catch (err) {
      showToast({ type: 'error', message: `${t('exportImport.importFailed')}: ${(err as Error).message}` })
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleExport}
        disabled={disabled}
        className="px-2.5 py-1 font-mono text-xs font-bold border-2 border-ink/30 dark:border-dark-border
          bg-white dark:bg-slate text-ink-light dark:text-dark-ink-light
          hover:bg-ink/5 dark:hover:bg-dark-ink/5 hover:border-ink dark:hover:border-dark-ink
          hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#1a1a2e] dark:hover:shadow-[2px_2px_0px_#334155]
          active:translate-y-0 active:shadow-none
          disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        title={t('exportImport.exportTooltip')}
      >
        ↓ {t('exportImport.export')}
      </button>
      <button
        onClick={handleImportClick}
        disabled={disabled}
        className="px-2.5 py-1 font-mono text-xs font-bold border-2 border-ink/30 dark:border-dark-border
          bg-white dark:bg-slate text-ink-light dark:text-dark-ink-light
          hover:bg-ink/5 dark:hover:bg-dark-ink/5 hover:border-ink dark:hover:border-dark-ink
          hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_#1a1a2e] dark:hover:shadow-[2px_2px_0px_#334155]
          active:translate-y-0 active:shadow-none
          disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
        title={t('exportImport.importTooltip')}
      >
        ↑ {t('exportImport.import')}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
