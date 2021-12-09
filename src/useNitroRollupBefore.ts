import { useNuxt } from "@nuxt/kit-edge";

export function useNitroRollupBefore(
  handler: (context: any) => void | Promise<void>
) {
  const nuxt = useNuxt();
  nuxt.hook("nitro:context", (context: any) => {
    context._internal.hooks.hook("nitro:rollup:before", handler);
  });
}
