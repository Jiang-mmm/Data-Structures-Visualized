import { useMemo } from 'react'
import { useKeyboard } from './useKeyboard'

interface UseCommonKeyboardOptions {
  undo: () => void
  redo: () => void
  reset: () => void
  isAnimating: boolean
}

export function useCommonKeyboard({ undo, redo, reset, isAnimating }: UseCommonKeyboardOptions) {
  const shortcuts = useMemo(() => ({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }), [undo, redo, reset])

  useKeyboard(shortcuts, !isAnimating)
}