/**
 * VITE PRODUCTION CONFIGURATION
 *
 * Production improvements applied:
 *
 *  1. PATH ALIAS (@)   — import '@/config/constants' instead of
 *                         '../../config/constants'. Prevents brittle relative
 *                         paths that break when files are moved.
 *
 *  2. CHUNK SPLITTING  — vendor libraries split into separate chunks:
 *       • vendor-react    — React core (changes least → cached longest)
 *       • vendor-router   — React Router
 *       • vendor-axios    — HTTP client
 *       • vendor-tesseract — Tesseract OCR (large, only on warranty form)
 *       • vendor-webcam   — react-webcam (only on warranty form)
 *     Maximises cache hits across deployments.
 *
 *  3. SOURCE MAPS      — 'hidden' mode: maps generated for error monitoring
 *                         tools but NOT linked in the HTML (not exposed to users).
 *
 *  4. PREVIEW SERVER   — Configured to match production port.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],

  // ── Path alias ─────────────────────────────────────────────────────────────
  // Allows `import foo from '@/config/constants'` from any file depth.
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // ── Build configuration ────────────────────────────────────────────────────
  build: {
    // Target modern browsers — avoids unnecessary Babel transforms.
    target: 'esnext',

    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Tesseract.js (~5 MB) and react-webcam are only needed on the
        // warranty form page. Isolating them means other pages never download
        // these heavy libraries.
        manualChunks: (id) => {
          if (id.includes('tesseract') || id.includes('Tesseract')) {
            return 'vendor-tesseract';
          }
          if (id.includes('react-webcam')) {
            return 'vendor-webcam';
          }
          if (id.includes('react-router') || id.includes('react-router-dom')) {
            return 'vendor-router';
          }
          if (id.includes('/axios/')) {
            return 'vendor-axios';
          }
          if (id.includes('node_modules')) {
            return 'vendor-react';
          }
        },
      },
    },

    // 'hidden' — source maps are written to disk but NOT referenced in the
    // HTML output, so they are not accidentally served to end users.
    sourcemap: 'hidden',
  },

  // ── Preview server ─────────────────────────────────────────────────────────
  preview: {
    port: 4173,
  },
});
