import * as Sentry from '@sentry/react'

export function initSentry() {
  if (!import.meta.env.PROD) return

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  })
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!import.meta.env.PROD) return
  Sentry.captureException(error, context ? { extra: context } : undefined)
}
