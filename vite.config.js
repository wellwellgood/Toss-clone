import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default { server: { proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } } } };