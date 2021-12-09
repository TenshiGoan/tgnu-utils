import { useNuxt, resolveAlias } from "@nuxt/kit-edge";
import { resolve, normalize } from "pathe";
import { rollupVirtual } from "./plugins/virtual";
import { addNitroPlugin } from "./addNitroPlugin";
import { randomUUID } from "crypto";
import FS from "fs";
import { useNitroRollupBefore } from "./useNitroRollupBefore";

type VirtualMiddleware = {
  src?: string;
  route?: string;
  lazy?: boolean;
  getContents?: (source: string) => string;
};

export function addVirtualMiddleware(opts: VirtualMiddleware) {
  const nuxt = useNuxt();
  const plugin = rollupVirtual();

  const name = `tgnu.virtual.middleware.${randomUUID()}.ts`;
  const alias = `#build/${name}`;
  const dst = resolve(nuxt.options.buildDir, name);

  useNitroRollupBefore((rollup_context) => {
    rollup_context.middleware.push({
      route: opts.route ?? "/",
      lazy: opts.lazy,
      handle: alias,
    });
    rollup_context.alias[alias] = dst;
  });

  addNitroPlugin(
    plugin({
      name: dst,
      text: () => {
        const source = opts.src ? FS.readFileSync(opts.src).toString() : "";
        return opts.getContents ? opts.getContents(source ?? "") : source;
      },
    }),
    true
  );

  return { name, alias, dst };
}
