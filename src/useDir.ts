import { useNuxt } from "@nuxt/kit-edge";
import Globby from "globby";
import { relative, resolve } from "pathe";
import Debounce from "lodash.debounce";

type Options = {
  pattern?: string;
  watch?: boolean | (() => Promise<void> | void);
  timeout?: number;
};

type Event = "add" | "addDir" | "change" | "unlink" | "unlinkDir";

export async function useDir(dir: string, opts: Options = {}) {
  const nuxt = useNuxt();
  const files: Array<string> = [];
  const pattern = opts.pattern ?? "**/*.{ts,mjs,js,cjs}";
  const watch = opts.watch ?? false;
  const cb =
    typeof watch === "function"
      ? Debounce(watch, opts.timeout ?? 1000)
      : () => {};

  const scanned_files = await Globby(pattern, {
    cwd: dir,
    onlyFiles: true,
  });

  files.push(...scanned_files);

  if (watch) {
    nuxt.hook("builder:watch", async (event: Event, path: string) => {
      const fullpath = resolve(nuxt.options.srcDir, path);
      if (!fullpath.startsWith(dir)) return;
      const relative_path = relative(dir, fullpath);
      if (event === "unlink") {
        const position = files.indexOf(relative_path);
        if (position >= 0) {
          files.splice(position, 1); // File deleted
          cb();
        }
      } else if (event === "add") {
        if (!files.includes(relative_path)) {
          files.push(relative_path); // New file
          cb();
        }
      }
    });
  }

  return files;
}
