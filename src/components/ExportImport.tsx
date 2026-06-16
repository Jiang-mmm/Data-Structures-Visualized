import { useRef, memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import { exportState, importState } from '../utils/dataExport'
import { showToast } from './toastStore'
import { OperationButton } from './OperationBar'

interface ExportImportProps {
  dataType: string
  data: unknown
  onImport?: (result: unknown) => void
  disabled?: boolean
}

export default memo(function ExportImport({ dataType, data, onImport, disabled }: ExportImportProps) {
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
      <OperationButton variant="outline" onClick={handleExport} disabled={disabled} title={t('exportImport.exportTooltip')} aria-label={t('exportImport.export')}>
        ↓ {t('exportImport.export')}
      </OperationButton>
      <OperationButton variant="outline" onClick={handleImportClick} disabled={disabled} title={t('exportImport.importTooltip')} aria-label={t('exportImport.import')}>
        ↑ {t('exportImport.import')}
      </OperationButton>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
})
