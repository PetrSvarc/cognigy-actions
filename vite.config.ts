import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Plugin to copy SDK files to dist folder
function copySDKPlugin() {
  return {
    name: 'copy-sdk',
    closeBundle() {
      const sdkDistPath = join(process.cwd(), 'sdk-app', 'dist')
      const outputDistPath = join(process.cwd(), 'dist', 'sdk-app', 'dist')
      
      // Check if SDK dist exists
      if (!existsSync(sdkDistPath)) {
        console.warn(`[copy-sdk] Warning: ${sdkDistPath} not found. Make sure SDK is built first (npm run build:sdk).`)
        return
      }
      
      // Create output directory if it doesn't exist
      if (!existsSync(join(process.cwd(), 'dist', 'sdk-app'))) {
        mkdirSync(join(process.cwd(), 'dist', 'sdk-app'), { recursive: true })
      }
      if (!existsSync(outputDistPath)) {
        mkdirSync(outputDistPath, { recursive: true })
      }
      
      // Copy all files from SDK dist to output dist
      try {
        const files = readdirSync(sdkDistPath)
        files.forEach(file => {
          const srcPath = join(sdkDistPath, file)
          const destPath = join(outputDistPath, file)
          const stat = statSync(srcPath)
          
          if (stat.isFile()) {
            copyFileSync(srcPath, destPath)
            console.log(`[copy-sdk] Copied ${file} to dist/sdk-app/dist/`)
          }
        })
        console.log(`[copy-sdk] Successfully copied SDK files to dist/sdk-app/dist/`)
      } catch (error) {
        console.error(`[copy-sdk] Error copying SDK files:`, error)
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' || process.env.VITE_GITHUB_PAGES === 'true' 
    ? '/cognigy-actions/' 
    : '/',
  plugins: [vue(), copySDKPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // Serve SDK files from sdk-app/dist
  publicDir: 'public',
  server: {
    fs: {
      // Allow serving files from sdk-app directory
      allow: ['..'],
    },
  },
})
