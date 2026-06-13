import { useKeyboard } from './useKeyboard'

interface UseCommonKeyboardOptions {
  undo: () => void
  redo: () => void
  reset: () => void
  isAnimating: boolean
}

export function useCommonKeyboard({ undo, redo, reset, isAnimating }: UseCommonKeyboardOptions) {
  useKeyboard({
    'ctrl+z': undo,
    'ctrl+shift+z': redo,
    'r': reset,
  }, !isAnimating)
}