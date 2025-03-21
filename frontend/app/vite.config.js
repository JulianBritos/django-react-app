import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Permite accesos desde fuera del contenedor
    port: 5173, // Puedes cambiarlo si deseas
    watch: {
      usePolling: true,
    },
    hmr: {
      overlay: false, // Desactiva reconexión de WebSocket en desarrollo
    },
  },
});
