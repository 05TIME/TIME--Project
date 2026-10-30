import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    // CommonJS config files (Gruntfile) legitimately use require().
    files: ["**/*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    // Tests poke at loosely-typed JSON-RPC payloads; allow `any` there as a warning.
    files: ["**/*.test.ts", "test/**/*.ts"],
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
  {
    ignores: [".next/**", "node_modules/**", "**/dist/**", "next-env.d.ts", "coverage/**", "*.zip"],
  },
];

export default config;
