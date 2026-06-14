import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

const DATA_VERSION = '1.0'
const MAX_IMPORT_SIZE = 1_000_000 // 1MB max import size

interface ExportedState {
  version: string
  type: string
  data: unknown
  timestamp: number
}

export function exportState(dataType: string, data: unknown): void {
  try {
    const payload: ExportedState = {
      version: DATA_VERSION,
      type: dataType,
      data,
      timestamp: Date.now(),
    }

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)

    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `ds-visualizer-${dataType}-${Date.now()}.json`

    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    setTimeout(() => window.URL.revokeObjectURL(url), 1000)
    showToast({ type: 'success', message: tStatic('exportImport.export') + ' ✓' })
  } catch {
    showToast({ type: 'error', message: tStatic('errors.importFailed') })
  }
}

export function importState(file: File): Promise<ExportedState> {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_IMPORT_SIZE) {
      reject(new Error(tStatic('errors.importFailed')))
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const json = JSON.parse(text) as ExportedState

        if (
          typeof json !== 'object' ||
          json === null ||
          json.version !== DATA_VERSION ||
          !json.type ||
          json.data === undefined
        ) {
          throw new Error(tStatic('exportImport.invalidFile'))
        }

        showToast({ type: 'success', message: tStatic('hooks.dataImported') })
        resolve(json)
      } catch (error) {
        const msg = error instanceof Error && error.message === tStatic('exportImport.invalidFile')
          ? tStatic('exportImport.invalidFile')
          : tStatic('errors.importFailed')
        reject(new Error(msg))
      }
    }

    reader.onerror = () => {
      reject(new Error(tStatic('errors.importFailed')))
    }

    reader.readAsText(file)
  })
}

function escapeCSV(value: unknown): string {
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function triggerDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

export function exportPerformanceCSV(performanceData: { algorithm: string; comparisons: number; swaps: number; steps: number }[]): string {
  if (!Array.isArray(performanceData)) return ''
  const headers = ['Algorithm', 'Comparisons', 'Swaps', 'Steps']
  const rows = performanceData.map(d => [d.algorithm, d.comparisons, d.swaps, d.steps].map(escapeCSV))
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  triggerDownload(csv, `ds-visualizer-performance-${Date.now()}.csv`, 'text/csv')
  return csv
}

export function exportPerformanceJSON(performanceData: unknown): string {
  const json = JSON.stringify(performanceData, null, 2)
  triggerDownload(json, `ds-visualizer-performance-${Date.now()}.json`, 'application/json')
  return json
}
