import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Any fetch("/api/...") from the frontend is forwarded to Express.
      "/api": "http://localhost:4000",
    },
  },
});
