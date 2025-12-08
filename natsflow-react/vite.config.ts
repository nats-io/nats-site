import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: mode === 'production' ? {
    'process.env.NODE_ENV': JSON.stringify('production'),
  } : {},
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/lib.tsx', import.meta.url)),
      name: 'NatsFlowBundle',
      formats: ['iife'],
      fileName: () => 'natsflow.js',
    },
    rollupOptions: {
      output: {
        // Inline all dependencies (including React) into a single file
        inlineDynamicImports: true,
        // Add styles inline
        assetFileNames: 'natsflow.[ext]',
      },
    },
  },
}))
