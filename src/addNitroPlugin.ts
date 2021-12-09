import { useNitroRollupBefore } from "./useNitroRollupBefore";
import { RollupPlugin } from "unplugin";

type Handle = (context: any) => RollupPlugin | null;

export function addNitroPlugin(handler: Handle | RollupPlugin, front = false) {
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
