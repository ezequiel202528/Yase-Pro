import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: "minhaApp-win32-x64/resources/app",
  base: "./",
  build: {
    outDir: "../../../dist/app",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
