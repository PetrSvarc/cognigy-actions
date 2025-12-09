import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      customElement: true,
    }),
  ],
  resolve: {
    // Ensure proper module resolution
    dedupe: [],
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'MyChatSDK',
      formats: ['es', 'iife'],
    },
    rollupOptions: {
      // Bundle all dependencies - don't externalize anything
      // This ensures the SDK is self-contained and works standalone
      external: (id) => {
        // Don't externalize anything - bundle everything
        return false
      },
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
    // Ensure all dependencies are bundled
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
})
