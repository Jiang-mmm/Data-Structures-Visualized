import { Component, type ReactNode, type ErrorInfo } from 'react'
import { showToast } from './toastStore'
import { tStatic } from '../i18n/useI18n'

interface ErrorBoundaryProps {
  children?: ReactNode
  onReset?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error instanceof Error ? error : new Error(String(error)) }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo)
    }
    showToast({ type: 'error', message: `${tStatic('errorBoundary.title')}: ${error.message || tStatic('errorBoundary.renderFailed')}` })
    this.setState({ errorInfo })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) this.props.onReset()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8 bg-surface/50 dark:bg-dark-surface/50 border-2 border-accent-rose">
          <div className="text-4xl">⊘</div>
          <h3 className="font-mono text-sm font-bold text-accent-rose uppercase tracking-widest">
            {tStatic('errorBoundary.title')}
          </h3>
          <p className="text-xs text-ink-light/70 max-w-sm text-center font-mono break-all">
            {this.state.error?.message || tStatic('errorBoundary.renderFailed')}
          </p>
          {import.meta.env.DEV && this.state.errorInfo?.componentStack && (
            <details className="w-full max-w-lg text-[10px] font-mono text-ink-light/50 overflow-auto max-h-32 border-2 border-border p-2">
              <summary className="cursor-pointer font-bold">{tStatic('errorBoundary.stackDetails')}</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-1.5 font-mono text-xs font-bold bg-accent-rose text-paper border-2 border-accent-rose
              shadow-button dark:shadow-button-dark
              hover:brightness-90 hover:-translate-y-0.5 hover:shadow-button-hover dark:hover:shadow-button-dark-hover
              active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
              transition-all duration-200"
          >
            {tStatic('errorBoundary.retry')}
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
