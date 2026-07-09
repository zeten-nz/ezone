/**
 * VITE PRODUCTION CONFIGURATION
 *
 * Production improvements applied:
 *
 *  1. PATH ALIAS (@)   — import '@/config/constants' instead of
 *                         '../../config/constants'. Prevents brittle relative
 *                         paths that break when files are moved.
 *
 *  2. CHUNK SPLITTING  — manualChunks is an ALLOWLIST, not a blocklist: only
 *       dependencies genuinely used on every route (react/react-dom,
 *       react-router-dom, axios) get pinned to a named vendor chunk, so they
 *       cache well across deploys. Everything else — react-webcam,
 *       Tesseract.js, OpenCV/jscanify, recharts, framer-motion, lucide-react —
 *       is left to automatic chunking, because each is only ever reached from
 *       one route-level React.lazy() chunk. A blocklist approach ("exclude
 *       these heavy libs from the shared bucket") was tried first and broke
 *       twice: framer-motion alone ships as 3 packages (framer-motion,
 *       motion-dom, motion-utils) and missing just one silently pulls ~150KB
 *       gzip into the chunk every page downloads, including the login page.
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
        // Allowlist: only these are used on literally every route.
        // node_modules/react/, node_modules/react-dom/ — the two paths that
        // together make up React itself (react/jsx-runtime also lives under
        // 'react/', so this correctly catches it too).
        manualChunks: (id) => {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('node_modules/react-router')) return 'vendor-router';
          if (id.includes('node_modules/axios')) return 'vendor-axios';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/scheduler/')) {
            return 'vendor-react';
          }
          return undefined; // let automatic per-route chunking handle everything else
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
