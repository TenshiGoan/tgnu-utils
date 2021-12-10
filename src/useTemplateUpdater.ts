import { useNuxt } from "@nuxt/kit-edge";

export function useTemplateUpdater() {
  return {
    updateTemplates() {
      return useNuxt().callHook("builder:generateApp");
    },
  };
}
