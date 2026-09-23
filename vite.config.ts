import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The three.js hero scene (src/components/motif/scene.ts) builds to one ~576 kB
    // chunk. It is loaded lazily via dynamic import, after first paint, so its size
    // does not block the page. Limit sits just above it: anything bigger still warns.
    chunkSizeWarningLimit: 600,
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
