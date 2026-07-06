import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: { '/api': 'http://localhost:3001' },
    // The API writes server/data/items.json on every save; keep it out of the
    // watcher or Vite full-reloads the page after each admin action.
    watch: { ignored: ['**/server/**'] },
  },
})
