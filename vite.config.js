import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/aluguel": {
        target: "http://34.9.38.255:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
