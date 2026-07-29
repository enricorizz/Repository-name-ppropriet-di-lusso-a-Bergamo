/* ============================================================
   Rizzetti Immobiliare — server.js
   Zero-dependency Node server (built-in http only).
   • Serves the static site from /public
   • POST /api/contact  → validates & stores leads
   • POST /api/chat     → AI concierge (Anthropic) or null
   Run:  npm start   (default http://localhost:3000)
   ============================================================ */
import http from "node:http";
import { promises as fs, createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateLead, saveLead } from "./api/_lib/leads.js";
import { generateReply } from "./api/_lib/agent.js";
import { loadData } from "./api/_lib/util.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, "public");

/* ---------- Minimal .env loader (no dependencies) ---------- */
(function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (!existsSync(envPath)) return;
  try {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
      if (m && !(m[1] in process.env)) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
      }
    }
  } catch (e) { /* ignore */ }
})();

const PORT = process.env.PORT || 3000;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", ...headers });
  res.end(typeof body === "string" ? body : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = "";
    req.on("data", (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
    req.on("end", () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { resolve({}); } });
    req.on("error", () => resolve({}));
  });
}

/* ---------- API ---------- */
async function handleContact(req, res) {
  const body = await readBody(req);
  const check = validateLead(body);
  if (!check.ok) return send(res, 400, { ok: false, error: check.error });
  const result = await saveLead(check.lead, path.join(__dirname, "data", "leads"));
  return send(res, 200, { ok: true, id: result.id });
}

async function handleChat(req, res) {
  const body = await readBody(req);
  const { properties, agency } = await loadData();
  const reply = await generateReply({
    message: body.message,
    history: body.history,
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
    properties,
    agency,
  });
  return send(res, 200, { reply });
}

/* ---------- Static ---------- */
async function serveStatic(req, res, urlPath) {
  let rel = decodeURIComponent(urlPath.split("?")[0]);
  if (rel === "/" || rel === "") rel = "/index.html";
  // Prevent path traversal
  const safe = path.normalize(rel).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(PUBLIC_DIR, safe);
  if (!filePath.startsWith(PUBLIC_DIR)) return send(res, 403, { error: "Forbidden" });

  let stat = await fs.stat(filePath).catch(() => null);
  if (stat && stat.isDirectory()) { filePath = path.join(filePath, "index.html"); stat = await fs.stat(filePath).catch(() => null); }

  if (!stat) {
    // Not found → serve 404 page
    const nf = path.join(PUBLIC_DIR, "404.html");
    if (existsSync(nf)) {
      res.writeHead(404, { "content-type": MIME[".html"] });
      return createReadStream(nf).pipe(res);
    }
    return send(res, 404, { error: "Not found" });
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "content-type": MIME[ext] || "application/octet-stream",
    "cache-control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    "x-content-type-options": "nosniff",
  });
  createReadStream(filePath).pipe(res);
}

/* ---------- Router ---------- */
const server = http.createServer(async (req, res) => {
  try {
    const url = req.url || "/";
    if (url.startsWith("/api/")) {
      if (req.method !== "POST") return send(res, 405, { error: "Method not allowed" }, { Allow: "POST" });
      if (url.startsWith("/api/contact")) return handleContact(req, res);
      if (url.startsWith("/api/chat")) return handleChat(req, res);
      return send(res, 404, { error: "Unknown endpoint" });
    }
    if (req.method !== "GET" && req.method !== "HEAD") return send(res, 405, { error: "Method not allowed" });
    return serveStatic(req, res, url);
  } catch (e) {
    console.error("[server] errore:", e);
    return send(res, 500, { error: "Internal error" });
  }
});

server.listen(PORT, () => {
  const aiOn = process.env.ANTHROPIC_API_KEY ? "attivo (Claude)" : "modalità locale";
  console.log("\n  ✦ Rizzetti Immobiliare — Luxury Living Bergamo");
  console.log(`  ➜ Sito:      http://localhost:${PORT}`);
  console.log(`  ➜ Concierge: ${aiOn}`);
  console.log("  (Ctrl+C per fermare)\n");
});
