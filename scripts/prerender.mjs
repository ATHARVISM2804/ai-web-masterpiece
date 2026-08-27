import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url)) + "/..";
const indexPath = path.join(root, "dist/index.html");

const { render } = await import(path.join(root, "dist-ssr/entry-server.js"));

const template = fs.readFileSync(indexPath, "utf-8");
const appHtml = render("/");

const marker = '<div id="root"></div>';
if (!template.includes(marker)) {
  throw new Error("prerender: could not find the root div in dist/index.html");
}
if (!appHtml.trim()) {
  throw new Error("prerender: the app rendered nothing");
}

fs.writeFileSync(indexPath, template.replace(marker, `<div id="root">${appHtml}</div>`));

// The SSR bundle is a build artefact, not something to deploy
fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });

const text = appHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log(`prerender: ${appHtml.length} bytes of HTML, ${text.length} chars of text`);
