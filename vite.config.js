import tailwindcssPlugin from '@tailwindcss/vite';
import viteReactPlugin from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    port: 3000,
    watch: {
      ignored: ['**/src/todo.txt', '**/node_modules/**'],
    },
  },
  build: {
    reportCompressedSize: false,
    commonjsOptions: { transformMixedEsModules: true },
    // Optimize assets
    assetsInlineLimit: 4096,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split vendors into separate chunks for better caching
          if (id.includes('node_modules/react') && !id.includes('react-router')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@mantine/core')) {
            return 'mantine-core';
          }
          if (id.includes('node_modules/@mantine/')) {
            return 'mantine-extra';
          }
          if (id.includes('node_modules/@sentry')) {
            return 'sentry';
          }
          if (id.includes('node_modules/@google')) {
            return 'google-apis';
          }
        },
      },
    },
  },
  plugins: [
    tailwindcssPlugin(),
    viteConfigPaths(),
    viteReactPlugin(),
    // eslint-disable-next-line no-undef
    process.env.INLINE ? viteSingleFile() : null,
  ].filter(Boolean),
});
