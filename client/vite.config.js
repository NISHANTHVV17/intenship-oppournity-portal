import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail with a clear error instead of silently switching ports,
    // because the backend's CORS setting expects port 5173.
    strictPort: true,
  },
});
