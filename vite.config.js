import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',              // IPv6 회피
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8080', // 반드시 포트 포함
        ws: true,                      // WebSocket 프록시 켜기
        changeOrigin: true,
        secure: false,                 // 로컬이면 false OK
      },
    },
  },
})