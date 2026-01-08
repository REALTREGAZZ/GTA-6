import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  assetsInclude: ['**/*.usdz'],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
