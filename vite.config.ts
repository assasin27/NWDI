import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.NODE_ENV === 'production' ? '/T-ER/' : '/',
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "groove-norfolk-initiatives-episode.trycloudflare.com",
      "t-er.onrender.com",
      "amazing-unicorn-3f7416.netlify.app",
    ],
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "groove-norfolk-initiatives-episode.trycloudflare.com",
      "t-er.onrender.com",
      "amazing-unicorn-3f7416.netlify.app",
      "nwdi-f872.onrender.com", // Add your Render host here
    ],
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
}));
