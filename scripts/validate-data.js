/* Validate the property dataset: schema, unique slugs/ids, image files exist.
   Run: npm run validate */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMG_DIR = path.join(ROOT, "public", "assets", "img");

const REQUIRED = ["id", "slug", "reference", "title", "type", "status", "price", "priceType", "zone", "bedrooms", "bathrooms", "sqm", "energyClass", "image", "shortDescription", "description"];

const errors = [];
const warn = [];

function check(cond, msg) { if (!cond) errors.push(msg); }

const data = JSON.parse(await fs.readFile(path.join(ROOT, "public", "data", "properties.json"), "utf8"));
const props = data.properties || [];
check(props.length > 0, "Nessun immobile nel dataset");

const slugs = new Set();
const ids = new Set();
const imgFiles = new Set(await fs.readdir(IMG_DIR));

for (const p of props) {
  const label = p.slug || p.id || "?";
  for (const f of REQUIRED) check(p[f] !== undefined && p[f] !== "", `[${label}] campo mancante: ${f}`);
  check(!slugs.has(p.slug), `[${label}] slug duplicato: ${p.slug}`);
  check(!ids.has(p.id), `[${label}] id duplicato: ${p.id}`);
  slugs.add(p.slug); ids.add(p.id);
  check(["vendita", "affitto"].includes(p.status), `[${label}] status non valido: ${p.status}`);
  check(typeof p.price === "number" && p.price > 0, `[${label}] prezzo non valido`);
  if (p.image && !p.image.startsWith("http")) check(imgFiles.has(p.image), `[${label}] immagine mancante: ${p.image}`);
  (p.gallery || []).forEach((g) => { if (!g.startsWith("http") && !imgFiles.has(g)) warn.push(`[${label}] immagine galleria mancante: ${g}`); });
}

console.log(`Validati ${props.length} immobili · ${slugs.size} slug unici.`);
if (warn.length) { console.log("\nAvvisi:"); warn.forEach((w) => console.log("  ⚠ " + w)); }
if (errors.length) {
  console.error("\nErrori:");
  errors.forEach((e) => console.error("  ✗ " + e));
  process.exit(1);
}
console.log("✓ Dataset valido.");
