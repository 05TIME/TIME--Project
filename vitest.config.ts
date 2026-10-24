import { defineConfig } from "vitest/config";

export default defineConfig({
  test: { include: ["time-app/timeoe-engine/test/**/*.test.ts"] },
});
