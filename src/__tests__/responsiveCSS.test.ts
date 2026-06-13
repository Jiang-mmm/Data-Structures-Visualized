import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const cssPath = resolve(__dirname, '../index.css')
const cssContent = readFileSync(cssPath, 'utf-8')

describe('全局移动端 CSS 规则 (P1-2d)', () => {
  describe('Viewport 基础配置', () => {
    it('应包含 touch-action manipulation 全局规则', () => {
      expect(cssContent).toContain('touch-action: manipulation')
    })
  })

  describe('768px 断点规则', () => {
    it('应有 max-width: 768px 媒体查询', () => {
      expect(cssContent).toContain('@media (max-width: 768px)')
    })

    it('应包含侧边栏移动端样式', () => {
      expect(cssContent).toContain('.sidebar')
      expect(cssContent).toContain('transform: translateX(-100%)')
      expect(cssContent).toContain('.sidebar.open')
      expect(cssContent).toContain('transform: translateX(0)')
    })

    it('应包含侧边栏遮罩层样式', () => {
      expect(cssContent).toContain('.sidebar-overlay')
      expect(cssContent).toContain('rgba(0, 0, 0, 0.4)')
    })

    it('应包含操作栏换行规则', () => {
      expect(cssContent).toContain('.operation-bar')
      expect(cssContent).toContain('flex-wrap: wrap')
    })

    it('应包含操作栏按钮最小触摸目标', () => {
      expect(cssContent).toContain('min-height: 44px')
    })

    it('应包含输入框最小高度和字号防止 iOS 缩放', () => {
      expect(cssContent).toContain('.operation-bar input')
      expect(cssContent).toContain('font-size: 14px')
    })

    it('应包含页面头部响应式方向', () => {
      expect(cssContent).toContain('.page-header')
      expect(cssContent).toContain('flex-direction: column')
    })
  })

  describe('640px 断点规则', () => {
    it('应有 max-width: 640px 媒体查询', () => {
      expect(cssContent).toContain('@media (max-width: 640px)')
    })

    it('应包含操作栏横向滚动规则', () => {
      expect(cssContent).toContain('overflow-x: auto')
      expect(cssContent).toContain('-webkit-overflow-scrolling: touch')
    })

    it('应隐藏操作栏滚动条', () => {
      expect(cssContent).toContain('scrollbar-width: none')
    })

    it('应包含页面头部横向滚动规则', () => {
      expect(cssContent).toContain('.page-header-actions')
    })
  })

  describe('触摸设备规则', () => {
    it('应有 hover: none and pointer: coarse 媒体查询', () => {
      expect(cssContent).toContain('(hover: none) and (pointer: coarse)')
    })

    it('应包含触摸设备按钮最小高度', () => {
      expect(cssContent).toContain('touch-action: manipulation')
      expect(cssContent).toContain('-webkit-tap-highlight-color: transparent')
    })
  })

  describe('操作栏滚动指示器', () => {
    it('640px 以下操作栏应有渐变遮罩提示更多内容', () => {
      expect(cssContent).toContain('.operation-bar-scroll-hint')
    })
  })

  describe('日志面板移动端', () => {
    it('应包含日志面板移动端高度限制', () => {
      expect(cssContent).toContain('.log-panel')
    })
  })
})
