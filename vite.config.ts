import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Remove or change base to '/' for Vercel
  base: '/',
  plugins: [react()],
  define: {
    'process.env': process.env,
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})