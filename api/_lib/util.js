/* Shared helpers for the serverless API functions. */
import { promises as fs } from "node:fs";
import path from "node:path";

let _cache = null;
export async function loadData() {
  if (_cache) return _cache;
  const root = process.cwd();
  const read = async (rel) => {
    const candidates = [path.join(root, "public", rel), path.join(root, rel)];
    for (const f of candidates) {
      try { return JSON.parse(await fs.readFile(f, "utf8")); } catch (e) { /* try next */ }
    }
    return null;
  };
  const props = await read("data/properties.json");
  const site = await read("data/site.json");
  _cache = {
    properties: (props && props.properties) || [],
    agency: (site && site.agency) || { name: "Rizzetti Immobiliare", email: "enrico@rizzetti.it" },
  };
  return _cache;
}

export function readJsonBody(req) {
  return new Promise((resolve) => {
    // Some runtimes pre-parse the body.
    if (req.body && typeof req.body === "object") return resolve(req.body);
    let raw = "";
    req.on("data", (c) => {
      raw += c;
      if (raw.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { resolve({}); }
    });
    req.on("error", () => resolve({}));
  });
}
