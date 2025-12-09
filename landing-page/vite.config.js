// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })


// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5176,
    proxy: {
      // Proxy /sg/* to the SecuGen server at https://localhost:8000
      // This makes requests appear same-origin to the browser and avoids CORS.
      // secure: false allows self-signed TLS on localhost during dev.
      '/sg': {
        target: 'https://localhost:8000',
        changeOrigin: true,
        secure: false,
        // rewrite path so /sg/SGIFPCapture -> /SGIFPCapture
        rewrite: (path) => path.replace(/^\/sg/, ''),
      },
    },
  },
});
