import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Disable source maps in production
    sourcemap: false,

    // Enable minification
    minify: 'esbuild',

    // Drop console.log and debugger in production
    rollupOptions: {
      output: {
        // Disable manual chunks for simpler build
        manualChunks: undefined,
      },
    },
  },

  // Only show warnings for client-side issues
  server: {
    port: 5173,
    host: '0.0.0.0',
  },

  // Suppress build warnings
  esbuild: {
    // Drop console in production
    drop: import.meta.env.PROD ? ['console', 'debugger'] : [],
  },

  // Build target
  target: 'esnext',

  // Base URL for deployment
  base: '/',
})
