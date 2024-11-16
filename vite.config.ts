import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/ce/', // Adjust this to the folder where the app is hosted
  build: {
    outDir: 'dist', // Ensure this matches your build output directory
  },
});