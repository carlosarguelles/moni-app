import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const base = process.env.VITE_BASE_URL ?? '/';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base,
});
