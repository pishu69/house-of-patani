import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: "supabase",
              test: /node_modules[\\/]@supabase/,
            },
            {
              name: "motion",
              test: /node_modules[\\/]framer-motion/,
            },
            {
              name: "react-query",
              test: /node_modules[\\/]@tanstack[\\/]react-query/,
            },
            {
              name: "icons",
              test: /node_modules[\\/]lucide-react/,
            },
            {
              name: "react",
              test: /node_modules[\\/](react|react-dom|react-router)/,
            },
          ],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
