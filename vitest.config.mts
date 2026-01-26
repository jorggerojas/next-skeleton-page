import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env.test",
});

export default defineConfig({
  plugins: [react()],
  test: {
    env: {
      NEXT_PUBLIC_NEXT_API_BASE_URL:
        process.env.NEXT_PUBLIC_NEXT_API_BASE_URL ?? "",
    },
    exclude: [
      "**/node_modules/**",
      "**/*.d.ts",
      "src/**/index.ts",
      "src/types/**",
      "src/pages/**",
      "src/components/ui/**",
      "src/lib/api/client.ts",
      "e2e/**",
    ],
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/tests/setup.tsx"],
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "**/node_modules/**",
        "**/*.d.ts",
        "src/**/index.ts",
        "src/types/**",
        "src/pages/**",
        "src/components/ui/**",
        "src/lib/api/client.ts",
      ],
      provider: "v8",
      reportsDirectory: "coverage",
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
