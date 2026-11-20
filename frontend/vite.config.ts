import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// El build se publica en ../docs, que es la carpeta que sirve GitHub Pages.
// base "./" hace que los assets funcionen bajo /<repo>/ sin configurarlo.
export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173 },
  build: {
    outDir: "../docs",
    emptyOutDir: true,
  },
});
