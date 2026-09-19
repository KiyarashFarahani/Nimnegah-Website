import nextEnv from '@next/env'
import path from 'path'
import { defineConfig } from 'vitest/config'

nextEnv.loadEnvConfig(process.cwd())

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.integration.ts'],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@payload-config': path.resolve(__dirname, './src/payload.config.ts'),
    },
  },
})
