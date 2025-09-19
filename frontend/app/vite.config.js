import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
  server: {
    host: "0.0.0.0", // Permite accesos desde fuera del contenedor
    port: 3000, // Puedes cambiarlo si deseas
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: false, // Desactiva reconexión de WebSocket en desarrollo
    },
  },
});
