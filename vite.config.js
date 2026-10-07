import { defineConfig } from "vite";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1];
const root = fileURLToPath(new URL(".", import.meta.url));
const pages = fileURLToPath(new URL("./public/pages/", import.meta.url));
const updateIndex = () =>
  execFileSync(process.execPath, ["scripts/build-content.mjs"], { cwd: root });
export default defineConfig({
  base: repo ? `/${repo}/` : "/",
  plugins: [
    {
      name: "html-content-index",
      apply: "serve",
      buildStart() {
        updateIndex();
      },
      handleHotUpdate(context) {
        if (context.file.startsWith(pages) && context.file.endsWith(".html")) {
          updateIndex();
          context.server.ws.send({ type: "full-reload" });
          return [];
        }
      },
    },
  ],
});
