import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node22",
  outDir: "dist",
  clean: true,
  sourcemap: true,
  noExternal: ["@repo/api-client", "@repo/models"],
  onSuccess: "cp -r prompts dist/prompts",
});
