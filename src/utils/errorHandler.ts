import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

/**
 * 统一处理操作错误
 * 在生产环境显示 Toast 提示，在开发环境可选地输出到控制台
 * @internal 仅用于测试验证，生产代码使用 handleAnimationError
 */
export function handleOperationError(error: unknown, operationLabel?: string): void {
  const tpl = tStatic('errors.animationError')
  const message = operationLabel
    ? tpl.replace('{action}', operationLabel)
    : tpl.replace('{action}', '')

  if (import.meta.env.DEV) {
    console.error(`[Operation Error]${operationLabel ? ` ${operationLabel}:` : ''}`, error)
  }

  showToast({ type: 'error', message })
}

/**
 * 统一处理动画错误
 */
export function handleAnimationError(error: unknown, animationLabel?: string): void {
  const tpl = tStatic('errors.animationError')
  const message = animationLabel
    ? tpl.replace('{action}', animationLabel)
    : tpl.replace('{action}', '')

  if (import.meta.env.DEV) {
    console.error(`[Animation Error]${animationLabel ? ` ${animationLabel}:` : ''}`, error)
  }

  showToast({ type: 'error', message })
}
