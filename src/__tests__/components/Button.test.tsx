import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../../components/Button'

describe('Button', () => {
  describe('变体渲染', () => {
    it('默认应渲染 primary 变体', () => {
      render(<Button>按钮</Button>)
      const btn = screen.getByText('按钮')
      expect(btn.className).toContain('bg-accent')
      expect(btn.className).toContain('border-accent')
      expect(btn.className).toContain('text-accent-foreground')
      expect(btn.className).toContain('shadow-hard-sm')
    })

    it('secondary 变体应使用 surface 背景与 border 边框', () => {
      render(<Button variant="secondary">次要</Button>)
      const btn = screen.getByText('次要')
      expect(btn.className).toContain('bg-surface')
      expect(btn.className).toContain('border-border')
      expect(btn.className).toContain('text-ink')
    })

    it('danger 变体应使用 accent-rose 背景', () => {
      render(<Button variant="danger">危险</Button>)
      const btn = screen.getByText('危险')
      expect(btn.className).toContain('bg-accent-rose')
    })

    it('success 变体应使用 accent-emerald 背景', () => {
      render(<Button variant="success">成功</Button>)
      const btn = screen.getByText('成功')
      expect(btn.className).toContain('bg-accent-emerald')
    })

    it('warning 变体应使用 accent-amber 背景', () => {
      render(<Button variant="warning">警告</Button>)
      const btn = screen.getByText('警告')
      expect(btn.className).toContain('bg-accent-amber')
    })

    it('info 变体应使用 accent-blue 背景', () => {
      render(<Button variant="info">信息</Button>)
      const btn = screen.getByText('信息')
      expect(btn.className).toContain('bg-accent-blue')
    })

    it('ghost 变体应透明背景与无边框', () => {
      render(<Button variant="ghost">幽灵</Button>)
      const btn = screen.getByText('幽灵')
      expect(btn.className).toContain('bg-transparent')
      expect(btn.className).toContain('border-transparent')
    })
  })

  describe('尺寸', () => {
    it('sm 尺寸应使用更小的字号与内边距', () => {
      render(<Button size="sm">小</Button>)
      const btn = screen.getByText('小')
      expect(btn.className).toContain('text-xs')
      expect(btn.className).toContain('px-3')
    })

    it('md 尺寸应使用默认样式', () => {
      render(<Button size="md">中</Button>)
      const btn = screen.getByText('中')
      expect(btn.className).toContain('text-sm')
      expect(btn.className).toContain('px-4')
    })

    it('lg 尺寸应使用更大的字号与内边距', () => {
      render(<Button size="lg">大</Button>)
      const btn = screen.getByText('大')
      expect(btn.className).toContain('text-base')
      expect(btn.className).toContain('px-6')
    })
  })

  describe('加载态', () => {
    it('加载时应显示 spinner 并设置 aria-busy', () => {
      render(<Button isLoading>加载中</Button>)
      const btn = screen.getByText('加载中')
      expect(btn).toHaveAttribute('aria-busy', 'true')
      expect(btn).toBeDisabled()
      expect(screen.getByTestId('button-spinner')).toBeInTheDocument()
    })

    it('加载时文本应保持可见', () => {
      render(<Button isLoading>保存</Button>)
      expect(screen.getByText('保存')).toBeVisible()
    })

    it('加载时应添加脉冲动画并显示 title', () => {
      render(<Button isLoading>加载中</Button>)
      const btn = screen.getByText('加载中')
      expect(btn.className).toContain('animate-pulse')
      expect(btn).toHaveAttribute('title', '加载中，请稍候')
    })
  })

  describe('忙碌态', () => {
    it('isBusy 时应设置 aria-busy 并显示脉冲动画', () => {
      render(<Button isBusy>运行中</Button>)
      const btn = screen.getByText('运行中')
      expect(btn).toHaveAttribute('aria-busy', 'true')
      expect(btn.className).toContain('animate-pulse')
    })

    it('isBusy 时应显示默认忙碌 title', () => {
      render(<Button isBusy>运行中</Button>)
      expect(screen.getByText('运行中')).toHaveAttribute('title', '加载中，请稍候')
    })

    it('不应覆盖自定义 title', () => {
      render(<Button isBusy title="自定义提示">运行中</Button>)
      expect(screen.getByText('运行中')).toHaveAttribute('title', '自定义提示')
    })
  })

  describe('禁用态', () => {
    it('禁用时应设置 disabled 属性并使用低对比可读样式', () => {
      render(<Button disabled>禁用</Button>)
      const btn = screen.getByText('禁用')
      expect(btn).toBeDisabled()
      expect(btn.className).toContain('disabled:cursor-not-allowed')
      expect(btn.className).toContain('disabled:bg-bg-disabled')
      expect(btn.className).toContain('disabled:text-text-disabled')
      expect(btn.className).toContain('disabled:opacity-60')
      expect(btn.className).toContain('disabled:grayscale-[0.5]')
    })

    it('禁用无 title 时应显示默认不可用 title', () => {
      render(<Button disabled>禁用</Button>)
      expect(screen.getByText('禁用')).toHaveAttribute('title', '当前不可用')
    })

    it('禁用时应保留自定义 title', () => {
      render(<Button disabled title="请先输入值">禁用</Button>)
      expect(screen.getByText('禁用')).toHaveAttribute('title', '请先输入值')
    })
  })

  describe('交互', () => {
    it('点击时应调用 onClick', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick}>点击</Button>)
      fireEvent.click(screen.getByText('点击'))
      expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('禁用时不应调用 onClick', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick} disabled>点击</Button>)
      fireEvent.click(screen.getByText('点击'))
      expect(onClick).not.toHaveBeenCalled()
    })

    it('加载时不应调用 onClick', () => {
      const onClick = vi.fn()
      render(<Button onClick={onClick} isLoading>点击</Button>)
      fireEvent.click(screen.getByText('点击'))
      expect(onClick).not.toHaveBeenCalled()
    })
  })
})
