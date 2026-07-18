import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
    },
    build: {
      sourcemap: false,
      minify: "esbuild",
    },
    esbuild: isProduction
      ? {
          drop: ["console", "debugger"],
        }
      : {},
  };
});