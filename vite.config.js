import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path, { resolve } from "path";

const manifestForPlugin = {
  // registerType: 'autoUpdate',
  strategies: 'injectManifest',
  srcDir: 'src/service-worker',
  filename: 'sw.js',
  registerType: 'prompt',
  injectRegister: 'auto',
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
  injectManifest: {
    maximumFileSizeToCacheInBytes: 7000000 // Set limit to 7MB
  },
  workbox: {
    maximumFileSizeToCacheInBytes: 7000000,
    clientsClaim: true,
    skipWaiting: true,
    cleanupOutdatedCaches: true,
    runtimeCaching: [{
      urlPattern: new RegExp('^https://.*'),
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
    globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}']
  },
  devOptions: {
    enabled: true,
    type: 'module'
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA(manifestForPlugin)
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    headers: {
      'Service-Worker-Allowed': '/'
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'firebase-messaging-sw': resolve(__dirname, 'public/firebase-messaging-sw.js')
      }
    }
  },
  define: {
    'process.env': {}
  }
})
