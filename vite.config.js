import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'icons/*.png', // source folder
          dest: 'icons'       // destination folder in dist/build
        },
        {
          src: 'manifest.json',
          dest: '.'           // copies manifest.json to the root of dist/build
        }
      ]
    })
  ],
  build: {
    outDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html',
      }
    }
  },
  server: {
    port: 3000
  }
}); 