import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      customElement: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'MyChatSDK',
      formats: ['es', 'iife'],
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: 'sdk.esm.js',
          inlineDynamicImports: true,
        },
        {
          format: 'iife',
          name: 'MyChatSDK',
          entryFileNames: 'sdk.global.js',
          inlineDynamicImports: true,
          exports: 'default',
        },
      ],
    },
    cssCodeSplit: false,
    minify: 'esbuild',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})
