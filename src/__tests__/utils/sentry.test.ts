import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock @sentry/react 模块
const sentryInitMock = vi.fn()
const sentryCaptureExceptionMock = vi.fn()
const browserTracingIntegrationMock = vi.fn(() => ({ name: 'browserTracing' }))

vi.mock('@sentry/react', () => ({
  init: (...args: unknown[]) => sentryInitMock(...args),
  captureException: (...args: unknown[]) => sentryCaptureExceptionMock(...args),
  browserTracingIntegration: () => browserTracingIntegrationMock(),
}))

// Mock import.meta.env.PROD
// vitest 中 import.meta.env 是一个 Proxy，需要通过 vi.stubEnv 修改
describe('sentry util', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('initSentry', () => {
    it('在 dev 模式（PROD=false）下不应该调用 Sentry.init', async () => {
      // vi.stubEnv('PROD', 'false') — vitest 默认 NODE_ENV=test, import.meta.env.PROD=false
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      expect(sentryInitMock).not.toHaveBeenCalled()
    })

    it('在 prod 模式（PROD=true）下应该调用 Sentry.init', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      expect(sentryInitMock).toHaveBeenCalledTimes(1)
    })

    it('Sentry.init 应接收 dsn / environment / tracesSampleRate 配置', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      const call = sentryInitMock.mock.calls[0]?.[0] as Record<string, unknown>
      expect(call).toBeDefined()
      expect(call).toHaveProperty('dsn')
      expect(call).toHaveProperty('environment')
      expect(call?.tracesSampleRate).toBe(0.1)
    })

    it('Sentry.init 应包含 browserTracingIntegration', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      const call = sentryInitMock.mock.calls[0]?.[0] as { integrations?: unknown[] }
      expect(call?.integrations).toBeDefined()
      expect(call?.integrations?.length).toBeGreaterThan(0)
    })

    it('Sentry.init 应禁用 session replay（replaysSessionSampleRate=0）', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      const call = sentryInitMock.mock.calls[0]?.[0] as Record<string, unknown>
      expect(call?.replaysSessionSampleRate).toBe(0)
      expect(call?.replaysOnErrorSampleRate).toBe(0)
    })

    it('应该使用 VITE_SENTRY_DSN 环境变量作为 dsn', async () => {
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_SENTRY_DSN', 'https://test@sentry.io/123')
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      const call = sentryInitMock.mock.calls[0]?.[0] as { dsn?: string }
      expect(call?.dsn).toBe('https://test@sentry.io/123')
    })

    it('VITE_SENTRY_DSN 缺失时 dsn 应为空字符串', async () => {
      vi.stubEnv('PROD', true)
      vi.stubEnv('VITE_SENTRY_DSN', '')
      vi.resetModules()
      const { initSentry } = await import('../../utils/sentry')
      initSentry()
      const call = sentryInitMock.mock.calls[0]?.[0] as { dsn?: string }
      expect(call?.dsn).toBe('')
    })
  })

  describe('captureException', () => {
    it('在 dev 模式下不应该调用 Sentry.captureException', async () => {
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      captureException(new Error('test'))
      expect(sentryCaptureExceptionMock).not.toHaveBeenCalled()
    })

    it('在 prod 模式下应该调用 Sentry.captureException', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      captureException(new Error('test'))
      expect(sentryCaptureExceptionMock).toHaveBeenCalledTimes(1)
    })

    it('应该传递 error 给 Sentry.captureException', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      const err = new Error('boom')
      captureException(err)
      expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(err, undefined)
    })

    it('应该将 context 包装为 extra 字段', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      const err = new Error('boom')
      const context = { userId: 42, page: 'home' }
      captureException(err, context)
      expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(err, { extra: context })
    })

    it('无 context 时第二个参数应为 undefined', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      captureException('string-error')
      expect(sentryCaptureExceptionMock).toHaveBeenCalledWith('string-error', undefined)
    })

    it('应该能处理非 Error 类型的异常', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      captureException('string-error')
      expect(sentryCaptureExceptionMock).toHaveBeenCalled()
    })

    it('应该能处理 null 异常', async () => {
      vi.stubEnv('PROD', true)
      vi.resetModules()
      const { captureException } = await import('../../utils/sentry')
      captureException(null)
      expect(sentryCaptureExceptionMock).toHaveBeenCalledWith(null, undefined)
    })
  })
})
