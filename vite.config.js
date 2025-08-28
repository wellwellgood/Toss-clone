import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    proxy: {
      '/ws': {
        target: 'ws://127.0.0.1:8080',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
    resolve: {
      alias: {
        '@rr': 'react-router-dom',                                  // 진짜 패키지
        'react-router-dom': path.resolve(__dirname, 'src/rrdom.tsx')// 전역 래퍼
      },
    },
  }
})