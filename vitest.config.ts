import { defineConfig } from 'vitest/config'
import { preact } from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  test: {
    name: 'preact',
    browser: {
      enabled: true,
      headless: true,
      name: 'chromium',
      provider: 'playwright',
    },
  },
})