import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        // Configuração para usar a API moderna do Sass
        api: 'modern',
        // Opção para silenciar avisos específicos
        sassOptions: {
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }
  }
})
