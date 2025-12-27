import { config } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["*.config.js", "*.config.mjs", "*.config.ts"],
  },
];
