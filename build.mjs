// Builds the offline phone app (docs/) from index.html, the same source the Claude page uses.
// Run: node build.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";

const src = readFileSync(new URL("./index.html", import.meta.url), "utf8");
const out = new URL("./docs/", import.meta.url);
mkdirSync(out, { recursive: true });
const version = new Date().toISOString().replace(/\D/g, "").slice(0, 12);

const head = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#1f4fa8">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="icon-192.png">
<link rel="apple-touch-icon" href="icon-192.png">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
`;
const tail = `
<script>
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js");
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
</script>
</body>
</html>
`;
writeFileSync(new URL("index.html", out), head + src + tail);

const sw = readFileSync(new URL("./sw.js", import.meta.url), "utf8").replace("__VERSION__", version);
writeFileSync(new URL("sw.js", out), sw);
copyFileSync(new URL("./manifest.json", import.meta.url), new URL("manifest.json", out));
for (const f of ["icon-192.png", "icon-512.png"]) {
  if (existsSync(new URL("./" + f, import.meta.url))) copyFileSync(new URL("./" + f, import.meta.url), new URL(f, out));
}
writeFileSync(new URL(".nojekyll", out), "");
console.log("built docs/ version", version);
