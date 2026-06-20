import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/',
  publicDir: 'public',
  server: { port: 5173 },
  preview: { port: 4173 },
})
