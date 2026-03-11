import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        popup: 'popup/popup.html',
        dashboard: 'dashboard/dashboard.html',
        login: 'auth/login.html',
        blocked: 'auth/blocked.html',
        settings: 'settings/settings.html',
        background: 'background/serviceWorker.js',
        content: 'content/floatingTimer.js'
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'background') return 'background/serviceWorker.js';
          if (chunk.name === 'content') return 'content/floatingTimer.js';
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/chunks/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    }
  }
});
