import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    outDir: path.resolve(__dirname, 'dist'),  // 输出目录供 Electron 使用
    emptyOutDir: true
  },
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
});
