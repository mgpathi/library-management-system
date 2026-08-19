import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables for the current mode (.env, .env.uat, .env.prod, ...)
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'prod' || mode === 'production';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      open: true,
    },
    build: {
      outDir: 'dist',
      // Emit sourcemaps for non-prod builds (e.g. uat) to ease debugging.
      sourcemap: !isProd,
      minify: 'terser',
    },
    define: {
      __APP_MODE__: JSON.stringify(mode),
    },
  };
});
