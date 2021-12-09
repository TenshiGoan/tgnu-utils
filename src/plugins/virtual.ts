import { normalize } from "pathe";
import { createUnplugin } from "unplugin";

export function rollupVirtual() {
  return createUnplugin<{
    name: string;
    text: string | (() => Promise<string> | string);
  }>(({ name, text }) => {
    const filter = (id: string) => normalize(id) === normalize(name);
    return {
      name: "@tgnu/utils/virtual",
      async load(id) {
        if (id.startsWith("file:///")) {
          id = id.slice(8);
        }
        if (filter(id)) {
          return typeof text === "function" ? text() : text;
        } else {
          return null;
        }
      },
    };
  }).rollup;
}
