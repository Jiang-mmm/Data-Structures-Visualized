# Phase 1 优化实施计划

> **目标:** 完成所有 P0 级优化项，减少重复代码、提升性能、统一交互体验
> **预计时间:** 1-2 天
> **技术栈:** React 19 + Vite + D3.js v7 + Tailwind CSS v4

---

## 文件变更总览

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/utils/debounce.js` | 创建 | 通用防抖工具函数 |
| `src/hooks/useDataStructureState.js` | 创建 | 通用数据结构状态Hook工厂 |
| `src/hooks/useGlobalSettings.js` | 创建 | 全局设置Context（动画速度等） |
| `src/components/ErrorBoundary.jsx` | 创建 | React错误边界组件 |
| `src/components/SpeedControl.jsx` | 创建 | 全局动画速度控制组件 |
| `src/hooks/useVisualizer.js` | 修改 | ResizeObserver节流 + RAF优化 |
| `src/visualizers/arrayVisualizer.js` | 修改 | D3按需导入 |
| `src/visualizers/stackVisualizer.js` | 修改 | D3按需导入 |
| `src/visualizers/queueVisualizer.js` | 修改 | D3按需导入 |
| `src/visualizers/linkedListVisualizer.js` | 修改 | D3按需导入 |
| `src/visualizers/treeVisualizer.js` | 修改 | D3按需导入 |
| `src/visualizers/graphVisualizer.js` | 修改 | D3按需导入 |
| `src/visualizers/sortVisualizer.js` | 修改 | D3按需导入 |
| `src/hooks/useArrayState.js` | 修改 | 使用useDataStructureState |
| `src/hooks/useStackState.js` | 修改 | 使用useDataStructureState |
| `src/hooks/useQueueState.js` | 修改 | 使用useDataStructureState |
| `src/hooks/useLinkedListState.js` | 修改 | 使用useDataStructureState |
| `src/hooks/useTreeState.js` | 修改 | 使用useDataStructureState |
| `src/hooks/useGraphState.js` | 修改 | 使用useDataStructureState |
| `src/hooks/useSortState.js` | 修改 | 使用useDataStructureState + 全局速度 |
| `src/pages/SortPage.jsx` | 修改 | 移除本地速度控制，使用全局SpeedControl |
| `src/pages/ArrayPage.jsx` | 修改 | 集成ErrorBoundary + SpeedControl |
| `src/App.jsx` | 修改 | 包裹GlobalSettingsProvider |
| `src/main.jsx` | 修改 | 集成ErrorBoundary |

---

## Task 1: 创建通用工具函数

### Step 1.1: 创建防抖函数

**文件:** `src/utils/debounce.js` (创建)

```javascript
export function debounce(fn, delay) {
  let timer = null

  const debounced = (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }

  debounced.cancel = () => {
    clearTimeout(timer)
    timer = null
  }

  return debounced
}
```

---

## Task 2: 创建通用数据结构状态Hook

### Step 2.1: 创建 useDataStructureState

**文件:** `src/hooks/useDataStructureState.js` (创建)

```javascript
import { useState, useCallback } from 'react'
import { showToast } from '../components/Toast'
import { useHistory } from './useHistory'

export function useDataStructureState(initialData) {
  const { state: data, push, undo, redo, reset: resetHistory, canUndo, canRedo } = useHistory(initialData)
  const [logs, setLogs] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)

  const addLog = useCallback((type, message) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false })
    setLogs(prev => [...prev, { time, type, message }])
  }, [])

  const reset = useCallback(() => {
    resetHistory(initialData)
    setLogs([])
    showToast({ type: 'info', message: '已重置' })
  }, [resetHistory])

  const handleUndo = useCallback(() => {
    if (isAnimating || !canUndo()) return
    undo()
    addLog('info', '撤销上一步操作')
    showToast({ type: 'info', message: '已撤销' })
  }, [undo, canUndo, isAnimating, addLog])

  const handleRedo = useCallback(() => {
    if (isAnimating || !canRedo()) return
    redo()
    addLog('info', '重做操作')
    showToast({ type: 'info', message: '已重做' })
  }, [redo, canRedo, isAnimating, addLog])

  const clearLogs = useCallback(() => {
    setLogs([])
  }, [])

  return {
    data,
    logs,
    isAnimating,
    setIsAnimating,
    push,
    addLog,
    reset,
    clearLogs,
    undo: handleUndo,
    redo: handleRedo,
    canUndo,
    canRedo,
  }
}
```

---

## Task 3: 创建全局设置Context

### Step 3.1: 创建 useGlobalSettings

**文件:** `src/hooks/useGlobalSettings.js` (创建)

```javascript
import { createContext, useContext, useState, useCallback } from 'react'
import { setAnimationSpeed } from '../utils/animationEngine'

const GlobalSettingsContext = createContext(null)

export function GlobalSettingsProvider({ children }) {
  const [animationSpeed, setSpeed] = useState(1)
  const [showIndices, setShowIndices] = useState(true)

  const setAnimationSpeedValue = useCallback((value) => {
    setSpeed(value)
    setAnimationSpeed(value)
  }, [])

  const cycleSpeed = useCallback(() => {
    const speeds = [0.5, 1, 1.5, 2, 4]
    setSpeed(prev => {
      const idx = speeds.indexOf(prev)
      const next = speeds[(idx + 1) % speeds.length]
      setAnimationSpeed(next)
      return next
    })
  }, [])

  return (
    <GlobalSettingsContext.Provider value={{
      animationSpeed,
      setAnimationSpeed: setAnimationSpeedValue,
      cycleSpeed,
      showIndices,
      setShowIndices,
    }}>
      {children}
    </GlobalSettingsContext.Provider>
  )
}

export function useGlobalSettings() {
  const ctx = useContext(GlobalSettingsContext)
  if (!ctx) throw new Error('useGlobalSettings must be used within GlobalSettingsProvider')
  return ctx
}
```

### Step 3.2: 创建 SpeedControl 组件

**文件:** `src/components/SpeedControl.jsx` (创建)

```javascript
import { useGlobalSettings } from '../hooks/useGlobalSettings'

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
]

export default function SpeedControl() {
  const { animationSpeed, setAnimationSpeed } = useGlobalSettings()

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-xs text-ink-light dark:text-dark-ink-light">速度:</span>
      {SPEED_OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setAnimationSpeed(opt.value)}
          className={`px-2 py-0.5 rounded font-mono text-xs transition-all border
            ${animationSpeed === opt.value
              ? 'bg-ink dark:bg-dark-ink text-paper dark:text-dark-paper border-ink dark:border-dark-ink'
              : 'bg-white dark:bg-slate text-ink-light dark:text-dark-ink-light border-border dark:border-dark-border hover:bg-ink/5 dark:hover:bg-dark-ink/5'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Task 4: 创建错误边界组件

### Step 4.1: 创建 ErrorBoundary

**文件:** `src/components/ErrorBoundary.jsx` (创建)

```javascript
import { Component } from 'react'
import EmptyState from './EmptyState'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) this.props.onReset()
  }

  render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          icon="⚠️"
          title="渲染错误"
          description={this.state.error?.message || '可视化组件渲染失败'}
          onFill={this.handleReset}
          fillLabel="重试"
        />
      )
    }

    return this.props.children
  }
}
```

---

## Task 5: 优化 useVisualizer（ResizeObserver节流）

### Step 5.1: 修改 useVisualizer.js

**文件:** `src/hooks/useVisualizer.js` (修改)

```javascript
import { useRef, useEffect, useState, useCallback } from 'react'
import { createAnimation } from '../utils/animationEngine'
import { debounce } from '../utils/debounce'

export function useVisualizer() {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const animRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({
        width: Math.floor(width),
        height: Math.floor(height)
      })
    }
  }, [])

  useEffect(() => {
    updateDimensions()

    const el = containerRef.current
    if (!el) return

    let rafId
    const debouncedUpdate = debounce(() => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(updateDimensions)
    }, 100)

    const observer = new ResizeObserver(() => {
      debouncedUpdate()
    })

    observer.observe(el)

    return () => {
      cancelAnimationFrame(rafId)
      debouncedUpdate.cancel()
      observer.disconnect()
      if (animRef.current) {
        try { animRef.current.abort() } catch {}
        animRef.current = null
      }
    }
  }, [updateDimensions])

  const getAnimationContext = useCallback(() => {
    if (animRef.current) {
      try { animRef.current.abort() } catch {}
    }
    const anim = createAnimation()
    animRef.current = anim
    return anim
  }, [])

  const abortAnimation = useCallback(() => {
    if (animRef.current) {
      animRef.current.abort()
      animRef.current = null
    }
  }, [])

  return { containerRef, svgRef, dimensions, getAnimationContext, abortAnimation }
}
```

---

## Task 6: D3按需导入优化

### Step 6.1: 修改 arrayVisualizer.js

**文件:** `src/visualizers/arrayVisualizer.js` (修改)

将 `import * as d3 from 'd3'` 替换为：
```javascript
import { select } from 'd3-selection'
import { easeCubicOut, easeBackOut, easeBounceOut } from 'd3-ease'
import { duration } from '../utils/animationEngine'
```

所有 `d3.select` 改为 `select`，`d3.easeCubicOut` 改为 `easeCubicOut`，以此类推。

### Step 6.2-6.7: 修改其他 visualizer

对以下文件执行相同操作：
- `src/visualizers/stackVisualizer.js`
- `src/visualizers/queueVisualizer.js`
- `src/visualizers/linkedListVisualizer.js`
- `src/visualizers/treeVisualizer.js`
- `src/visualizers/graphVisualizer.js`
- `src/visualizers/sortVisualizer.js`

**graphVisualizer.js 特殊处理：** 额外需要 `d3-force` 和 `d3-drag` 模块：
```javascript
import { select } from 'd3-selection'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { drag } from 'd3-drag'
import { easeCubicOut, easeBackOut } from 'd3-ease'
```

---

## Task 7: 重构 State Hooks 使用通用Hook

### Step 7.1: 修改 useArrayState.js

**文件:** `src/hooks/useArrayState.js` (修改)

```javascript
import { useCallback } from 'react'
import { showToast } from '../components/Toast'
import { useDataStructureState } from './useDataStructureState'

const INITIAL_DATA = [8, 3, 12, 5, 9]

export function useArrayState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset,
    undo, redo, canUndo, canRedo,
  } = useDataStructureState(INITIAL_DATA)

  const insert = useCallback((value, index) => {
    if (index < 0 || index > data.length) {
      showToast({ type: 'error', message: `索引越界: ${index}` })
      addLog('error', `insert(${value}, ${index}) - 索引越界`)
      return false
    }
    const newData = [...data]
    newData.splice(index, 0, value)
    push(newData)
    addLog('oper', `insert(${value}, ${index}) - 成功，长度: ${newData.length}`)
    showToast({ type: 'success', message: `插入 ${value} 到位置 ${index}` })
    return true
  }, [data, push, addLog])

  const remove = useCallback((index) => {
    if (index < 0 || index >= data.length) {
      showToast({ type: 'error', message: `索引越界: ${index}` })
      addLog('error', `delete(${index}) - 索引越界`)
      return null
    }
    const value = data[index]
    const newData = [...data]
    newData.splice(index, 1)
    push(newData)
    addLog('oper', `delete(${index}) - 删除值: ${value}，长度: ${newData.length}`)
    showToast({ type: 'success', message: `删除位置 ${index} 的元素 ${value}` })
    return value
  }, [data, push, addLog])

  const search = useCallback((value) => {
    const index = data.indexOf(value)
    if (index !== -1) {
      addLog('oper', `search(${value}) - 找到，索引: ${index}`)
      showToast({ type: 'success', message: `找到 ${value} 在位置 ${index}` })
    } else {
      addLog('oper', `search(${value}) - 未找到`)
      showToast({ type: 'warning', message: `未找到 ${value}` })
    }
    return index
  }, [data, addLog])

  const randomize = useCallback(() => {
    const newData = Array.from({ length: 8 }, () => Math.floor(Math.random() * 99) + 1)
    push(newData)
    addLog('info', `随机生成数组: [${newData.join(', ')}]`)
    showToast({ type: 'info', message: '已生成随机数组' })
  }, [push, addLog])

  return {
    data, logs, isAnimating, setIsAnimating,
    insert, remove, search, randomize, reset,
    undo, redo, canUndo, canRedo,
  }
}
```

### Step 7.2-7.6: 修改其他 State Hooks

对以下文件执行类似重构：
- `src/hooks/useStackState.js`
- `src/hooks/useQueueState.js`
- `src/hooks/useLinkedListState.js`
- `src/hooks/useTreeState.js`
- `src/hooks/useGraphState.js`

### Step 7.7: 修改 useSortState.js

**文件:** `src/hooks/useSortState.js` (修改)

```javascript
import { useState, useCallback } from 'react'
import { showToast } from '../components/Toast'
import { useDataStructureState } from './useDataStructureState'

const INITIAL_DATA = [38, 27, 43, 3, 9, 82, 10, 55, 21, 67, 15, 94, 50, 71, 33]

export function useSortState() {
  const {
    data, logs, isAnimating, setIsAnimating,
    push, addLog, reset,
    undo, redo, canUndo, canRedo,
  } = useDataStructureState(INITIAL_DATA)

  const [stats, setStats] = useState({ algorithm: '', comparisons: 0, swaps: 0, steps: 0 })

  // ... randomize, reset, stop 保持类似修改
  // bubbleSort, selectionSort, insertionSort 保持业务逻辑
  // 但使用来自 useDataStructureState 的 addLog, push 等
}
```

---

## Task 8: 修改页面组件

### Step 8.1: 修改 SortPage.jsx

**文件:** `src/pages/SortPage.jsx` (修改)

移除本地速度控制相关代码，从 `useGlobalSettings` 获取速度控制组件：

```javascript
import SpeedControl from '../components/SpeedControl'
// 移除: import { setAnimationSpeed } from '../utils/animationEngine'
// 移除: const SPEED_OPTIONS = [...]
// 移除: const [speed, setSpeed] = useState(1)
// 移除: handleSpeedChange 函数
```

在 OperationBar 中添加 `<SpeedControl />`。

### Step 8.2: 修改 ArrayPage.jsx

**文件:** `src/pages/ArrayPage.jsx` (修改)

```javascript
import ErrorBoundary from '../components/ErrorBoundary'
import SpeedControl from '../components/SpeedControl'

// 在 return 中:
return (
  <ErrorBoundary onReset={reset}>
    <div className="flex flex-col h-screen">
      {/* ... */}
      <OperationBar>
        <SpeedControl />
        {/* ... */}
      </OperationBar>
      {/* ... */}
    </div>
  </ErrorBoundary>
)
```

### Step 8.3: 修改 App.jsx

**文件:** `src/App.jsx` (修改)

```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GlobalSettingsProvider } from './hooks/useGlobalSettings'
import Layout from './components/Layout'
// ... 其他导入

function App() {
  return (
    <GlobalSettingsProvider>
      <BrowserRouter basename="/ds-visualizer">
        <Layout>
          <Routes>
            {/* ... 路由 */}
          </Routes>
        </Layout>
      </BrowserRouter>
    </GlobalSettingsProvider>
  )
}
```

---

## Task 9: 验证与测试

### Step 9.1: 运行构建

```bash
npm run build
```

**预期:** 构建成功，无错误。

### Step 9.2: 运行 ESLint

```bash
npm run lint
```

**预期:** 无错误，或仅现有警告。

### Step 9.3: 启动开发服务器验证

```bash
npm run dev
```

**验证清单:**
- [ ] 数组页面正常渲染和操作
- [ ] 栈/队列/链表/树/图页面正常
- [ ] 排序页面速度控制正常工作
- [ ] 全局速度控制影响所有页面动画
- [ ] 窗口缩放时无性能问题
- [ ] 错误边界能捕获渲染错误
- [ ] Undo/Redo 功能正常

---

## 提交计划

```bash
# Task 1-2 完成后
git add src/utils/debounce.js src/hooks/useDataStructureState.js
git commit -m "feat(utils): 添加防抖函数和通用数据结构状态Hook"

# Task 3-4 完成后
git add src/hooks/useGlobalSettings.js src/components/SpeedControl.jsx src/components/ErrorBoundary.jsx
git commit -m "feat(settings): 添加全局设置Context、速度控制组件和错误边界"

# Task 5 完成后
git add src/hooks/useVisualizer.js
git commit -m "perf(visualizer): ResizeObserver添加节流优化"

# Task 6 完成后
git add src/visualizers/
git commit -m "perf(visualizers): D3改为按需导入，减少包体积"

# Task 7-8 完成后
git add src/hooks/use*State.js src/pages/ src/App.jsx
git commit -m "refactor(hooks): 所有State Hook使用通用基础Hook，页面集成全局设置"
```
