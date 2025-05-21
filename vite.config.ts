import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

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
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  },
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@helpers': path.resolve(__dirname, './src/helpers'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@api': path.resolve(__dirname, './src/api'),
      '@interfaces': path.resolve(__dirname, './src/interfaces'),
      '@redux': path.resolve(__dirname, './src/redux'),
    },
  },
});
