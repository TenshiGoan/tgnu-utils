import { useNuxt } from "@nuxt/kit-edge";
import { resolve, normalize } from "pathe";
import { createUnplugin } from "unplugin";
import { addNitroPlugin } from "./addNitroPlugin";
import { randomUUID } from "crypto";
import FS from "fs";
import { useNitroRollupBefore } from "./useNitroRollupBefore";

type VirtualMiddleware = {
  src?: string;
  getContents?: (source: string) => string;
};

export function addVirtualMiddleware(opts: VirtualMiddleware) {
  const nuxt = useNuxt();
  const plugin = createPlugin();

  const name = `virtual.middleware.${randomUUID()}.ts`;
  const alias = `#build/${name}`;
  const dst = resolve(nuxt.options.buildDir, name);

  let rollup_context: any = {};

  useNitroRollupBefore((context) => {
    rollup_context = context;
    rollup_context.middleware.push({
      route: "/",
      handle: alias,
    });
    rollup_context.alias[alias] = dst;
  });

  nuxt.options.alias[alias] = dst;
  nuxt.options.build.transpile.push(dst);

  nuxt.hook("build:done", () => {});

  addNitroPlugin(
    () =>
      plugin.rollup({
        name: dst,
        text: () => {
          const source = FS.readFileSync(opts.src).toString();
          return opts.getContents ? opts.getContents(source ?? "") : source;
        },
      }),
    true
  );

  return { name, alias, dst };
}

function createPlugin() {
  return createUnplugin<{
    name: string;
    text: () => Promise<string> | string;
  }>(({ name, text }) => {
    const filter = (id: string) => normalize(id) === normalize(name);
    return {
      name: "@tgnu/utils/addVirtualMiddleware",
      async load(id) {
        if (id.startsWith("file:///")) {
          id = id.slice(8);
        }
        if (filter(id)) {
          return text();
        } else {
          return null;
        }
      },
    };
  });
}
