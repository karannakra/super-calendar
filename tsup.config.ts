import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  legacyOutput: true,
  dts: true,
  target: ["es2015"],
  outDir: "dist",
  format: ["cjs", "esm"],
});
