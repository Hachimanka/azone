import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      pwaAssets: { config: true, overrideManifestIcons: true },
      manifest: {
        id: '/',
        name: 'AZONE — Aznar Employee Platform',
        short_name: 'AZONE',
        description: 'Your payslips, attendance, leaves and company news in one place.',
        start_url: '/app',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F5F8FE',
        theme_color: '#1557E0',
        categories: ['business', 'productivity'],
        shortcuts: [
          { name: 'Payslip', url: '/app/payslips' },
          { name: 'DTR', url: '/app/dtr' },
          { name: 'File a leave', url: '/app/leaves' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Employee data: show the last copy when offline
            urlPattern: ({ url }) => url.pathname.startsWith('/azone/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'azone-api',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com' || url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts' },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
})
