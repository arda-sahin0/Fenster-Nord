import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Relative paths, so the build works on GitHub Pages under /Fenster-Nord/ and anywhere else.
  base: './',
});
