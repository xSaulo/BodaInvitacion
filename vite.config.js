import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const localApiPort = Number(process.env.LOCAL_API_PORT || 3001)

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: `http://localhost:${localApiPort}`,
        changeOrigin: true,
      },
    },
  },
})
