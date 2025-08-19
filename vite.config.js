import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ws": { target: "http://localhost:10000", ws: true, changeOrigin: true },
    }
  },
});
