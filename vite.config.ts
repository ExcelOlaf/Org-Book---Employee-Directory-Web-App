import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Precache all built assets so the app shell loads offline.
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      },
      manifest: {
        name: 'OrgBook',
        short_name: 'OrgBook',
        description: 'Company employee directory and org chart',
        theme_color: '#007bff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
      },
    }),
  ],
  base: '/', // CloudFront serves from root
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})

