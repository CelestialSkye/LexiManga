import viteReactPlugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
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
    minify: false,
    chunkSizeWarningLimit: 10000,
  },
  plugins: [
    tailwindcss(),
    viteConfigPaths(),
    viteReactPlugin(),
    // eslint-disable-next-line no-undef
    process.env.INLINE ? viteSingleFile() : null,
  ].filter(Boolean),
});
