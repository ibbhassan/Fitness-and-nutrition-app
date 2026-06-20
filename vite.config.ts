import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon-v2.png'],
      manifest: {
        name: 'Evoke Fitness & Nutrition',
        short_name: 'Evoke',
        description: 'Your ultimate fitness and nutrition engine.',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        display: 'standalone',
        icons: [
          {
            src: 'apple-touch-icon-v2.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'apple-touch-icon-v2.png',
            sizes: '512x512',
            type: 'image/png',
          }
        ]
      }
    })
  ],
})
