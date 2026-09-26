import { defineConfig } from 'vite'

export default defineConfig({
  base: '/aws-pharma-architecture/',
  server: {
    fs: {
      allow: ['..'],
    },
  },
})
