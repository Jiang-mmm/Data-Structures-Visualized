import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default defineConfig(({ mode }) => ({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    tailwindcss(),
    react(),
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.loli\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/gstatic\.loli\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: '数据结构学习助手',
        short_name: 'DS Visualizer',
        description: '交互式数据结构学习工具',
        theme_color: '#2563eb',
        background_color: '#faf8f5',
        display: 'standalone',
        start_url: '/Data-Structures-Visualized/',
        scope: '/Data-Structures-Visualized/',
        icons: [
          {
            src: '/Data-Structures-Visualized/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ].filter(Boolean),
  base: mode === 'production' ? './' : '/Data-Structures-Visualized/',
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    include: ['d3', 'd3-selection', 'd3-transition', 'd3-drag', 'd3-force', 'd3-ease'],
  },
  build: {
    chunkSizeWarningLimit: 250,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/d3-')) {
            return 'vendor-d3';
          }
          // i18n 文案较大，拆分到独立 chunk 以控制 index 体积
          if (id.includes('src/i18n/locales')) {
            return 'i18n-locales';
          }
          // 学习模式配置较大，拆分到独立 chunk 以控制 index 体积
          if (id.includes('src/configs/learning')) {
            return 'learning-configs';
          }
        },
      },
    },
  },
}))
