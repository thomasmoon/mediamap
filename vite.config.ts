import { defineConfig } from 'vite';

export default defineConfig({
  optimizeDeps: {
    exclude: ['mapbox-gl'],
    esbuildOptions: {
      supported: {
        bigint: false,
      },
    },
  },
  ssr: {
    noExternal: ['mapbox-gl'],
  },
});