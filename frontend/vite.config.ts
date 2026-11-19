import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Opcional: en desarrollo, reenvía /api al backend para no depender de CORS.
  const proxyTarget = loadEnv(mode, process.cwd(), '').API_PROXY_TARGET
  const proxy = proxyTarget ? { '/api': { target: proxyTarget, changeOrigin: true } } : undefined

  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
