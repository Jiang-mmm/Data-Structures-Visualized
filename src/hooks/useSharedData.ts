import { useEffect, useRef } from 'react'
import { decodeData } from '../utils/shareUtils'
import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

interface UseSharedDataOptions {
  dataType: string
  loadData: (data: unknown) => void
  validator?: (data: unknown) => boolean
}

export function useSharedData({ dataType, loadData, validator }: UseSharedDataOptions) {
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true

    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('data')
    const type = params.get('type')

    if (!encoded || type !== dataType) return

    const decoded = decodeData(encoded)
    if (decoded === null) {
      showToast({ type: 'error', message: tStatic('share.decodeFailed') })
      cleanUrl()
      return
    }

    if (validator && !validator(decoded)) {
      showToast({ type: 'error', message: tStatic('share.invalidData') })
      cleanUrl()
      return
    }

    loadData(decoded)
    showToast({ type: 'success', message: tStatic('share.loaded') })
    cleanUrl()
  }, [dataType, loadData, validator])
}

function cleanUrl() {
  const url = new URL(window.location.href)
  url.searchParams.delete('data')
  url.searchParams.delete('type')
  window.history.replaceState({}, '', url.toString())
}
