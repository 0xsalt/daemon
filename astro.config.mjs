// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  integrations: [react()],
  server: {
    host: '0.0.0.0',
    port: 5177
  },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['openwebui', 'localhost', '.local']
    }
  }
});
