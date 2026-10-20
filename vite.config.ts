import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // aplikacija + zasebno admin sučelje za uređivanje sadržaja (/admin.html)
      input: { main: 'index.html', admin: 'admin.html' },
    },
  },
})
