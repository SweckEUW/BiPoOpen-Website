import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { generatePlayerPreviewBuildArtifacts } from './build/playerPreviewGenerator.mjs';

const frontendRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig(async ({ command }) => {
  let playerPreviewInputs: Record<string, string> = {};
  let generatedOgImagesDir = '';
  let generatedPlayersDir = '';

  if (command === 'build') {
    const result = await generatePlayerPreviewBuildArtifacts(frontendRoot);
    playerPreviewInputs = result.inputEntries;
    generatedOgImagesDir = result.generatedOgImagesDir;
    generatedPlayersDir = result.generatedPlayersDir;
  }

  return {
    plugins: [
      vue(),
      mkcert(),
      tailwindcss(),

      // Custom plugin to include generated OG images in the build and clean up after the build
      {
        name: 'emit-player-preview-og-images',
        apply: 'build',
        generateBundle() {
          if (!fs.existsSync(generatedOgImagesDir)) return;

          const files = fs.readdirSync(generatedOgImagesDir, { withFileTypes: true });
          for (const file of files) {
            if (!file.isFile() || !file.name.endsWith('.png')) continue;

            const source = fs.readFileSync(path.join(generatedOgImagesDir, file.name));
            this.emitFile({
              type: 'asset',
              fileName: `playerProfiles/generated/${file.name}`,
              source,
            });
          }
        },
        closeBundle() {
          fs.rmSync(generatedOgImagesDir, { recursive: true, force: true });
          fs.rmSync(path.resolve(frontendRoot, '.generated'), { recursive: true, force: true });
          fs.rmSync(generatedPlayersDir, { recursive: true, force: true });
        },
      },

      // PWA plugin configuration
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'metaImage.jpg'],
        workbox: {
          // Delete old caches on update
          cleanupOutdatedCaches: true,
          // Take control immediately
          clientsClaim: true,
          // Force immediate activation
          skipWaiting: true,

          // Only precache the app shell (HTML, JS, CSS) - NOT images
          globPatterns: [
            '**/*.{html,js,css,woff2}'
          ],
          globIgnores: [
            'playerProfiles/generated/**'
          ],
          runtimeCaching: [
            {
              // Network-First for HTML navigations
              urlPattern: ({ request }) => request.mode === 'navigate',
              handler: 'NetworkFirst',
              options: {
                cacheName: 'pages-cache',
                networkTimeoutSeconds: 5
              }
            },
            {
              // Cache images on demand (not precached)
              urlPattern: ({ request }) => request.destination === 'image',
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              // GET requests to backend
              urlPattern: /^https:\/\/bipoopen-backend\.vercel\.app\/.*/,
              handler: 'NetworkFirst',
              method: 'GET',
              options: {
                cacheName: 'backend-api-cache',
                networkTimeoutSeconds: 5,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
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
    },
    build: {
      rollupOptions: {
        input: {
          main: fileURLToPath(new URL('./index.html', import.meta.url)),
          ...playerPreviewInputs,
        },
      },
    }
  } satisfies UserConfig;
})