import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:4010'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/owner': { target: proxyTarget, changeOrigin: true },
        '/event-types': { target: proxyTarget, changeOrigin: true },
        '/bookings': { target: proxyTarget, changeOrigin: true },
        '/admin': { target: proxyTarget, changeOrigin: true },
      },
    },
  }
})
