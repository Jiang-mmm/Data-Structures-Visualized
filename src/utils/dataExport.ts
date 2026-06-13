import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

const DATA_VERSION = '1.0'

interface ExportedState {
  version: string
  type: string
  data: any
  timestamp: number
}

export function exportState(dataType: string, data: any): void {
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

    window.URL.revokeObjectURL(url)
    showToast({ type: 'success', message: tStatic('exportImport.export') + ' ✓' })
  } catch {
    showToast({ type: 'error', message: tStatic('errors.importFailed') })
  }
}

export function importState(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        const json = JSON.parse(text)

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

export function exportPerformanceCSV(performanceData: { algorithm: string; comparisons: number; swaps: number; steps: number }[]): string {
  if (!Array.isArray(performanceData)) return ''
  const headers = ['Algorithm', 'Comparisons', 'Swaps', 'Steps']
  const rows = performanceData.map(d => [d.algorithm, d.comparisons, d.swaps, d.steps])
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
}

export function exportPerformanceJSON(performanceData: any): string {
  return JSON.stringify(performanceData, null, 2)
}
