import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Adjust if your app entry differs (e.g., index.html at root is fine)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: false }
});
