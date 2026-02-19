import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy /api calls to Vercel dev server so local dev doesn't get
    // "Failed to fetch" on every API call.  Run `vercel dev` on port 3000
    // or change the target below to match your local backend.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
