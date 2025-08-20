import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/ws": { target: "http://localhost:XXXX", ws: true, changeOrigin: true, secure: false } } }
});