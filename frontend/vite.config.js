import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'rockslide-user-sureness.ngrok-free.dev'
    ],
    strictPort: false,
    hmr: {
      clientPort: 443
    }
  }
})