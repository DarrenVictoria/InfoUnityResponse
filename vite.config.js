import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'
import fs from 'fs-extra'

// Clean up function to remove duplicate SW files
const cleanupSWFiles = () => ({
  name: 'cleanup-sw',
  closeBundle: async () => {
    const devDist = resolve(__dirname, 'dev-dist')
    if (fs.existsSync(devDist)) {
      await fs.remove(devDist)
    }
  }
})

const manifestForPlugin = {
  registerType: 'prompt',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
  manifest: {
    name: "InfoUnityResponse",
    short_name: "InfoUnity",
    description: "InfoUnityResponse - Unified Information Response System",
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'favicon'
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'favicon'
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon',
      },
      {
        src: '/maskable_icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      }
    ],
    theme_color: '#171717',
    background_color: '#f0e7db',
    display: "standalone",
    scope: '/',
    start_url: "/",
    orientation: 'portrait'
  },
  workbox: {
    sourcemap: true,
    clientsClaim: true,
    skipWaiting: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [{
      urlPattern: /^https:\/\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60 // 24 hours
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }],
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
    maximumFileSizeToCacheInBytes: 3000000
  },
  devOptions: {
    enabled: true,
    type: 'module',
    navigateFallback: 'index.html'
  },
  strategies: 'generateSW',
  injectRegister: 'auto',
  filename: 'sw.js',
  manifestFilename: 'manifest.webmanifest',
  srcDir: 'src',
  outDir: 'dist',
  base: '/',
  buildBase: '/'
}

export default defineConfig({
  base: '/',
  server: {
    headers: {
      'Service-Worker-Allowed': '/',
      'Cache-Control': 'no-store',
    },
  },
  plugins: [
    react(),
    VitePWA(manifestForPlugin),
    cleanupSWFiles()
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
})