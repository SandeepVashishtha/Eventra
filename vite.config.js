import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'REACT_APP_');
  const target = env.REACT_APP_API_URL 
    ? env.REACT_APP_API_URL.replace(/\/api$/, '') 
    : 'https://eventra-backend-springboot-eybhdvaubxcua7ha.centralindia-01.azurewebsites.net';

  return {
    plugins: [react()],
    envPrefix: 'REACT_APP_',
    server: {
      port: 3000,
      open: true,
      proxy: {
        '/api': {
          target: target,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'build',
    }
  };
});
