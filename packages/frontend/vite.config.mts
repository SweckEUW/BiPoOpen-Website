import path from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    mkcert(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'metaImage.jpg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024 * 1024, // 50 MB
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff2}'
        ],
        runtimeCaching: [
          {
            // GET-Anfragen an das Backend cachen (Turniere, League, OpenGames)
            urlPattern: /^https:\/\/bipoopen-backend\.vercel\.app\/.*/,
            handler: 'NetworkFirst',
            method: 'GET',
            options: {
              cacheName: 'backend-api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 Tage
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Weck BiPo Open',
        short_name: 'Weck BiPo Open',
        description: 'Professionelles Bierpong Turnier seit 2020',
        theme_color: '#EA5160',
        background_color: '#EA5160',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/pwa-icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    host: true,
    open: true
  }
})