import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El navegador solo tiene acceso garantizado al puerto del propio
    // dev server (5173). Proxeamos /api hacia el backend para que la
    // petición nunca dependa de que el puerto 4000 también sea
    // alcanzable desde fuera del sandbox.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
})
