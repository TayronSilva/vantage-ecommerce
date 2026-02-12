import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [react(), basicSsl()],
  optimizeDeps: {
    include: ['jspdf', 'canvg', 'html2canvas', 'dompurify'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
