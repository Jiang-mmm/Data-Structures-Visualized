import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import ReloadPrompt from '../../components/ReloadPrompt'
import { renderWithRouter, mockUseGlobalSettings } from '../pages/testUtils'
import { __setNeedRefresh, __resetPwaMock, __getPwaMocks } from '../../__mocks__/virtualPwaRegister'

vi.mock('../../hooks/useGlobalSettings')

import { useGlobalSettings } from '../../hooks/useGlobalSettings'

const mockedUseGlobalSettings = vi.mocked(useGlobalSettings)

describe('ReloadPrompt', () => {
  beforeEach(() => {
    __resetPwaMock()
    mockedUseGlobalSettings.mockReturnValue(mockUseGlobalSettings())
  })

  it('needRefresh 为 false 时不渲染', () => {
    __setNeedRefresh(false)
    renderWithRouter(<ReloadPrompt />)
    expect(screen.queryByText('pwa.updateAvailable')).not.toBeInTheDocument()
  })

  it('needRefresh 为 true 时渲染更新提示', () => {
    __setNeedRefresh(true)
    renderWithRouter(<ReloadPrompt />)
    expect(screen.getByText('pwa.updateAvailable')).toBeInTheDocument()
    expect(screen.getByText('pwa.reload')).toBeInTheDocument()
    expect(screen.getByText('pwa.close')).toBeInTheDocument()
  })

  it('点击刷新按钮调用 updateServiceWorker', () => {
    __setNeedRefresh(true)
    renderWithRouter(<ReloadPrompt />)
    fireEvent.click(screen.getByText('pwa.reload'))
    expect(__getPwaMocks().updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('点击关闭按钮调用 setNeedRefresh(false)', () => {
    __setNeedRefresh(true)
    renderWithRouter(<ReloadPrompt />)
    fireEvent.click(screen.getByText('pwa.close'))
    expect(__getPwaMocks().setNeedRefresh).toHaveBeenCalledWith(false)
  })
})
