import { memo } from 'react'
import { useGlobalSettings } from '../hooks/useGlobalSettings'
import UndoPreviewButton from './UndoPreviewButton'

interface UndoRedoBarProps {
  undo: () => void
  redo: () => void
  canUndo: boolean
  canRedo: boolean
  getUndoPreview: () => any
  getRedoPreview: () => any
  isAnimating: boolean
}

function UndoRedoBar({ undo, redo, canUndo, canRedo, getUndoPreview, getRedoPreview, isAnimating }: UndoRedoBarProps) {
  const { t } = useGlobalSettings()

  return (
    <>
      <UndoPreviewButton
        variant="secondary"
        onClick={undo}
        disabled={isAnimating || !canUndo}
        previewData={getUndoPreview()}
        previewLabel={t('shortcuts.undo')}
      >
        {t('common.undo')}
      </UndoPreviewButton>
      <UndoPreviewButton
        variant="secondary"
        onClick={redo}
        disabled={isAnimating || !canRedo}
        previewData={getRedoPreview()}
        previewLabel={t('shortcuts.redo')}
      >
        {t('common.redo')}
      </UndoPreviewButton>
    </>
  )
}

export default memo(UndoRedoBar)