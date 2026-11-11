import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // No GitHub Pages o site fica em usuario.github.io/NOME-DO-REPOSITORIO/, então o caminho base muda.
  // O deploy (.github/workflows/deploy.yml) define BASE_PATH; no computador local fica "/".
  base: process.env.BASE_PATH || '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
