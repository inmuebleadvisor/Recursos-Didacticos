import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// ÚLTIMA MODIFICACION: 04/12/2025
// DESCRIPCIÓN: Configuración de Vite corregida por seguridad.
// IMPORTANTE: Ya NO inyectamos claves secretas (API KEYS) al cliente. 
// Las variables sensibles solo deben vivir en el entorno del servidor (Vercel).

export default defineConfig(({ mode }) => {
    // Carga variables solo para uso local de Vite, pero no las exponemos por defecto
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // ELIMINAMOS EL BLOQUE 'define' QUE EXPONÍA LAS CLAVES.
      // El frontend no necesita 'process.env' para las claves, ya que consumirá la API propia.
      define: {
        // Si necesitas variables públicas (no secretas), usa el prefijo VITE_
        // Ejemplo: 'import.meta.env.VITE_APP_VERSION': JSON.stringify(env.npm_package_version)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});