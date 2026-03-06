import { config } from "@repo/eslint-config/react-internal";
import jest from "eslint-plugin-jest";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  reactRefresh.configs.vite,
  {
    ignores: ["jest.setup.cjs", "jest.config.cjs", "coverage", "junit.xml"],
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
