import path from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), mkcert(), tailwindcss()],
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