import { vi } from 'vitest'
import type { Dispatch, SetStateAction } from 'react'

// 可控的 PWA mock 状态，供测试用例按需切换
const state = {
  needRefresh: false,
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}

export function useRegisterSW() {
  return {
    needRefresh: [state.needRefresh, state.setNeedRefresh] as [boolean, Dispatch<SetStateAction<boolean>>],
    offlineReady: [false, vi.fn()] as [boolean, Dispatch<SetStateAction<boolean>>],
    updateServiceWorker: state.updateServiceWorker,
  }
}

// 测试辅助函数：设置 needRefresh 状态
export function __setNeedRefresh(value: boolean) {
  state.needRefresh = value
}

// 测试辅助函数：重置 mock 状态
export function __resetPwaMock() {
  state.needRefresh = false
  state.setNeedRefresh.mockClear()
  state.updateServiceWorker.mockClear()
}

// 测试辅助函数：获取 mock 函数引用
export function __getPwaMocks() {
  return {
    setNeedRefresh: state.setNeedRefresh,
    updateServiceWorker: state.updateServiceWorker,
  }
}
