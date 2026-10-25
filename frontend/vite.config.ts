import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    hmr: {
      host: '127.0.0.1',
      protocol: 'ws'
    }
  },
  preview: { port: 4173, strictPort: false }
});

