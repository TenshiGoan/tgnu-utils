import { useNuxt } from "@nuxt/kit-edge";
import { createUnplugin } from "unplugin";
import MagicString from "magic-string";
import { normalize } from "pathe";

type Manipulator = (text: string) => void;
type Handler = (fns: {
  prepend: Manipulator;
  append: Manipulator;
}) => Promise<void> | void;

export function editServerEntry(handler: Handler) {
  const nuxt = useNuxt();
  const plugin = createUnplugin<{ entry: string }>(({ entry }) => {
    const exts = [".ts", ".js", ".mjs", ".cjs", ""];
    const filter = (id: string) =>
      exts.some((suffix) => normalize(id) === normalize(`${entry}${suffix}`));
    return {
      name: "@tgnu/utils/editServerEntry",
      transformInclude(id) {
        return filter(id);
      },
      async transform(source) {
        const code = new MagicString(source);
        await handler({
          prepend(text) {
            code.prepend(text);
          },
          append(text) {
            code.append(text);
          },
        });
        return {
          code: code.toString(),
          map: code.generateMap(),
        };
      },
    };
  });
  nuxt.hook("nitro:context", (context: any) => {
    context._internal.hooks.hook("nitro:rollup:before", (config: any) => {
      config.rollupConfig.plugins.unshift(
        plugin.vite({
          entry: config.rollupConfig.input,
        })
      );
    });
  });
}
