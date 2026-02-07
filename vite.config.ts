import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Server configuration
  server: {
    port: 5173,
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '13003aa8c968.ngrok-free.app', // Your ngrok domain
    ],

    // Proxy configuration for external APIs (crop recommendation service, weather APIs, etc.)
    proxy: {
      // Crop recommendation API proxy
      '/api/crop-recommendation': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/crop-recommendation/, ''),
      },

      // Weather API proxy
      '/api/weather': {
        target: 'https://api.openweathermap.org/data/2.5',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/weather/, ''),
      },

      // Market data API proxy
      '/api/market': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/market/, '/api'),
      },

      // General API proxy for your backend services
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: false, // Set to true for debugging in production

    // Optimize for Firebase hosting
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Firebase into its own chunk for better caching
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],

          // Separate React libraries
          react: ['react', 'react-dom'],

          // Separate icon library
          icons: ['lucide-react'],
        },
      },
    },

    // Increase chunk size warning limit for Firebase
    chunkSizeWarningLimit: 1000,
  },

  // Environment variables configuration
  define: {
    // Make sure Firebase config is available at build time
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'lucide-react',
    ],
    exclude: ['firebase'],
  },

  // Preview configuration (for production builds)
  preview: {
    port: 4173,
    host: true,
  },
});