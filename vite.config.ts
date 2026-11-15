import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Content-Security-Policy (règle de sécurité du navigateur) : ajoutée seulement au build,
// car le serveur de dev de Vite a besoin de scripts en ligne.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tile.openstreetmap.org https://server.arcgisonline.com",
  "font-src 'self'",
  "connect-src 'self' https://server.arcgisonline.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ')

function cspMeta(): Plugin {
  return {
    name: 'csp-meta',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<meta charset="UTF-8" />',
        `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      )
    },
  }
}

export default defineConfig({
  plugins: [react(), cspMeta()],
  // Vercel sert le site à la racine, GitHub Pages dans un sous-dossier.
  base: process.env.VERCEL ? '/' : '/zeros-team-earth-trend-detective/',
  // Chrome 80 (beaucoup de téléphones Android) comprend ce niveau. Pas plus récent.
  build: { target: 'chrome80' },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
