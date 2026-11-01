import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    projects: [
      {
        resolve: {
          alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
          },
        },
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        resolve: {
          alias: {
            "@": path.resolve(import.meta.dirname, "./src"),
          },
        },
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          testTimeout: 20000,
        },
      },
    ],
  },
});
