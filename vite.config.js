import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
    root: '.',
    plugins: [
        react(),
        legacy({
            targets: ['defaults', 'not IE 11'],
        }),
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true
            },
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            manifest: {
                name: 'OnlyGym - Workout Tracker',
                short_name: 'OnlyGym',
                description: 'Il tuo tracker di allenamento definitivo per tutti i tuoi workout',
                version: '2.0.1',
                theme_color: '#000000',
                background_color: '#000000',
                display: 'standalone',
                icons: [
                    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
                    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
                ]
            }
        })
    ],
    // Evita che Vite scansioni le cartelle android/ios/dist per entry HTML
    optimizeDeps: {
        entries: ['index.html'],
    },
    build: {
        outDir: 'dist',
    },
    server: {
        port: 5180,
        host: true,
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})
