import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import legacy from '@vitejs/plugin-legacy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    // On Vercel, environment variables are in process.env during build.
    // loadEnv might not pick them all up depending on prefixes.
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || env.API_KEY || process.env.API_KEY || "";
    const hfKey = env.HUGGINGFACE_API_KEY || process.env.HUGGINGFACE_API_KEY || env.VITE_HUGGINGFACE_API_KEY || process.env.VITE_HUGGINGFACE_API_KEY || "";
    const muapiKey = env.MUAPI_API_KEY || process.env.MUAPI_API_KEY || env.VITE_MUAPI_API_KEY || process.env.VITE_MUAPI_API_KEY || "";

    // Firebase environment variables
    const firebaseApiKey = env.VITE_FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY || "";
    const firebaseAuthDomain = env.VITE_FIREBASE_AUTH_DOMAIN || process.env.VITE_FIREBASE_AUTH_DOMAIN || "";
    const firebaseProjectId = env.VITE_FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || "";
    const firebaseAppId = env.VITE_FIREBASE_APP_ID || process.env.VITE_FIREBASE_APP_ID || "";
    const firebaseDatabaseId = env.VITE_FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID || "";

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        tailwindcss(),
        legacy({
          targets: ['defaults', 'not IE 11'],
        }),
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(apiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(apiKey),
        'process.env.HUGGINGFACE_API_KEY': JSON.stringify(hfKey),
        'process.env.MUAPI_API_KEY': JSON.stringify(muapiKey),
        'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseApiKey),
        'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseAuthDomain),
        'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseProjectId),
        'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseAppId),
        'process.env.VITE_FIREBASE_DATABASE_ID': JSON.stringify(firebaseDatabaseId)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
