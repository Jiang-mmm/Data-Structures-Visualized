import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import 'd3-transition'

if (import.meta.env.PROD) {
  import('./utils/sentry').then(({ initSentry }) => initSentry())
}

import './index.css'
import { initThemeColors } from './utils/themeColors'
import App from './App'
import ToastContainer from './components/Toast.tsx'

initThemeColors()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <ToastContainer />
  </StrictMode>,
)
