import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: true, // Listen on all addresses
    port: 8084,
    proxy: {
      "/api": {
        target: "http://localhost:3004",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "http://localhost:3004",
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  preview: {
    port: 8084,
    proxy: {
      "/api": {
        target: "http://localhost:3004",
        changeOrigin: true,
        secure: false,
      },
      "/media": {
        target: "http://localhost:3004",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        globPatterns: [
          '**/*.{js,css,html,svg,png,ico,txt,woff2}'
        ],
        globIgnores: ['uploads/**'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        navigateFallbackDenylist: [
          /^\/admin\/.*/,
          /^\/api\/.*/,
          /\.xml$/,
          /\.txt$/,
          /\.json$/,
          /^\/sitemap\.xml$/,
          /^\/robots\.txt$/,
          /^\/llms\.txt$/,
          /^\/llms-full\.txt$/
        ],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === self.location.origin && url.pathname.includes('/assets/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'assets-runtime-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              },
              cacheableResponse: { statuses: [200] }
            }
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 12
              },
              cacheableResponse: { statuses: [200] }
            }
          },
          {
            urlPattern: ({ url, request }) => request.destination === 'image' && url.origin === self.location.origin,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          },
          {
            // Cache Google Fonts stylesheets
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache Google Fonts files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache GitHub CDN & jsDelivr images
            urlPattern: /^https:\/\/(cdn\.jsdelivr\.net|raw\.githubusercontent\.com)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'github-cdn-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache Cloudinary images (fallback compatibility)
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cloudinary-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      manifest: {
        name: 'Eka Syarif Maulana - Portfolio',
        short_name: 'Eka Portfolio',
        description: 'Portfolio Eka Syarif Maulana - Senior Fullstack Developer',
        theme_color: '#00d4a8',
        background_color: '#0a0a0a',
        display: 'standalone',
        icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml'
            },
          ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    target: 'es2015',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libraries into separate chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-query': ['@tanstack/react-query', '@tanstack/react-query-persist-client', '@tanstack/query-sync-storage-persister'],
          'vendor-router': ['react-router-dom'],
          'vendor-i18n': ['react-i18next', 'i18next'],
          'vendor-ui': ['lucide-react', 'next-themes'],
        },
        // Use content hash for long-term caching
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Minify with terser for better tree-shaking
    minify: 'esbuild',
    cssMinify: true,
  },
}));
