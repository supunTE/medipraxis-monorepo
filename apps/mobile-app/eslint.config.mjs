import { config } from "@repo/eslint-config/react-internal";
import jest from "eslint-plugin-jest";
import globals from "globals";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ["jest.setup.js", "jest.config.js", "coverage", "junit.xml"],
  },
  {
    files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
    ...jest.configs["flat/recommended"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
