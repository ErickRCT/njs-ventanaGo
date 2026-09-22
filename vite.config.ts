import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Quick Look (iOS) espera el tipo MIME model/vnd.usdz+zip; el servidor de Vite sirve los .usdz sin tipo.
const usdzMimeType = (): Plugin => ({
  name: 'usdz-mime-type',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const url = req.url?.split('?')[0];
      if (!url?.endsWith('.usdz')) return next();
      try {
        const datos = await readFile(join(server.config.publicDir, decodeURIComponent(url)));
        res.setHeader('Content-Type', 'model/vnd.usdz+zip');
        res.setHeader('Content-Length', datos.length);
        res.end(datos);
      } catch {
        next();
      }
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), usdzMimeType()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
