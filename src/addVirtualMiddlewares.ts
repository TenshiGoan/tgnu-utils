import { useNuxt } from "@nuxt/kit-edge";
import { randomUUID } from "crypto";
import { type } from "os";
import { resolve } from "pathe";
import { rollupVirtual } from "./plugins/virtual";
import { useNitroRollupBefore } from "./useNitroRollupBefore";

type HandlerItem =
  | string
  | {
      route?: string;
      lazy?: boolean;
      text: string;
    };
type HandlerReturnValue = Array<HandlerItem>;
type Handler = () => Promise<HandlerReturnValue> | HandlerReturnValue;

export function addVirtualMiddlewares(handler: Handler) {
  const nuxt = useNuxt();
  const plugin = rollupVirtual();

  useNitroRollupBefore(async (context) => {
    for (const middleware of await handler()) {
      const name = `tgnu.virtual.middleware.${randomUUID()}.ts`;
      const alias = `#build/${name}`;
      const dst = resolve(nuxt.options.buildDir, name);
      const item: HandlerItem =
        typeof middleware !== "string" ? middleware : { text: middleware };

      nuxt.options.alias[alias] = dst;
      nuxt.options.build.transpile.push(dst);

      context.middleware.push({
        route: item.route ?? "/",
        lazy: item.lazy,
        handle: alias,
      });
      context.alias[alias] = dst;
      context.rollupConfig.plugins.unshift(
        plugin({
          name: dst,
          text: item.text,
        })
      );
    }
  });
}
