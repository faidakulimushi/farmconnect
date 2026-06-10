import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  define: {
    // Expose the backend URL to the frontend bundle.
    // Set VITE_API_URL in Vercel environment variables.
    "import.meta.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || ""),
  },
});
