import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// ÚLTIMA MODIFICACION: 04/12/2025
// DESCRIPCIÓN: Configuración de Vite. Se agregan las variables de entorno para que sean accesibles en el frontend.

export default defineConfig(({ mode }) => {
    // Carga las variables de entorno desde el archivo .env según el modo (development/production)
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // Aquí definimos constantes globales que reemplazan "process.env.VARIABLE" por su valor real al compilar
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        // NUEVA LÍNEA: Inyectamos la URL del Script
        'process.env.GOOGLE_SCRIPT_URL': JSON.stringify(env.GOOGLE_SCRIPT_URL)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});