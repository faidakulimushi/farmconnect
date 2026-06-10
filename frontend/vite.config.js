import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Dev-only proxy: forwards /api calls to the local backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  // In production (Vercel), VITE_API_URL must be set as an env var.
  // Vite automatically exposes VITE_* variables via import.meta.env –
  // no manual `define` override needed.
});
