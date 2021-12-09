import { useNuxt } from "@nuxt/kit-edge";
import { useNitroRollupBefore } from "./useNitroRollupBefore";
import { UnpluginInstance } from "unplugin";

type Plugin<T> = UnpluginInstance<T>["rollup"];
type Handle<T> = (context: any) => Plugin<T> | null;

export function addNitroPlugin<T>(
  handler: Handle<T> | Plugin<T>,
  front = false
) {
  useNitroRollupBefore((context: any) => {
    let plugin = typeof handler === "function" ? handler(context) : handler;
    if (!plugin) {
      return;
    } else if (front) {
      context.rollupConfig.plugins.unshift(plugin);
    } else {
      context.rollupConfig.plugins.push(plugin);
    }
  });
}
