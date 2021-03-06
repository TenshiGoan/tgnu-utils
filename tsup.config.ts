import { defineConfig } from "tsup";

export default defineConfig({
  sourcemap: true,
  dts: true,
  clean: true,

  format: ["esm", "cjs"],
  entryPoints: ["src/index.ts"],
  external: [
    "@nuxt/kit-edge",
    "pathe",
    "unplugin",
    "crypto",
    "globby",
    "fs",
    "magic-string",
  ],
});
