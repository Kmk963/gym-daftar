// Local test server for docs/: node serve.mjs  ->  http://localhost:5173
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
const types = { html: "text/html; charset=utf-8", js: "text/javascript", json: "application/json", png: "image/png" };
createServer(async (req, res) => {
  const p = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html");
  try {
    const body = await readFile(new URL("./docs" + p, import.meta.url));
    res.writeHead(200, { "content-type": types[p.split(".").pop()] || "application/octet-stream" }).end(body);
  } catch { res.writeHead(404).end("not found"); }
}).listen(5173, () => console.log("http://localhost:5173"));
