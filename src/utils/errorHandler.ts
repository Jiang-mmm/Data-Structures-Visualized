import { showToast } from '../components/toastStore'
import { tStatic } from '../i18n/useI18n'

/**
 * 统一处理操作/动画错误
 * 在生产环境显示 Toast 提示，在开发环境输出到控制台
 */
function handleError(error: unknown, label?: string, prefix: string = 'Error'): void {
  const tpl = tStatic('errors.animationError')
  const message = label
    ? tpl.replace('{action}', label)
    : tpl.replace('{action}', '')

  if (import.meta.env.DEV) {
    console.error(`[${prefix}]${label ? ` ${label}:` : ''}`, error)
  }

  showToast({ type: 'error', message })
}

/**
 * 统一处理操作错误
 * @internal 仅用于测试验证，生产代码使用 handleAnimationError
 */
export function handleOperationError(error: unknown, operationLabel?: string): void {
  handleError(error, operationLabel, 'Operation Error')
}

/**
 * 统一处理动画错误
 */
export function handleAnimationError(error: unknown, animationLabel?: string): void {
  handleError(error, animationLabel, 'Animation Error')
}
