/* ============================================================
   Rizzetti Immobiliare — lead handling (shared library)
   Validates and persists contact requests. Storage is
   best-effort: if the filesystem is read-only (e.g. some
   serverless runtimes) the lead is still returned/logged.
   ============================================================ */
import { promises as fs } from "node:fs";
import path from "node:path";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(v, max) {
  if (typeof v !== "string") return "";
  const cap = max || 2000;
  // Remove ASCII control chars (code < 32 or 127) without embedding them in
  // source, then collapse whitespace, trim and cap length.
  let out = "";
  for (const ch of v) {
    const c = ch.codePointAt(0);
    out += (c < 32 || c === 127) ? " " : ch;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, cap);
}

export function validateLead(body) {
  body = body || {};
  const lead = {
    name: clean(body.name, 120),
    email: clean(body.email, 160),
    phone: clean(body.phone, 60),
    subject: clean(body.subject, 160),
    property: clean(body.property, 200),
    message: clean(body.message, 4000),
    page: clean(body.page, 200),
    ts: new Date().toISOString(),
  };
  if (!lead.name) return { ok: false, error: "Il nome è obbligatorio." };
  if (!EMAIL_RE.test(lead.email)) return { ok: false, error: "Email non valida." };
  return { ok: true, lead };
}

export async function saveLead(lead, dir) {
  const target = dir || path.join(process.cwd(), "data", "leads");
  const id = "lead-" + lead.ts.replace(/[:.]/g, "-") + "-" + Math.random().toString(36).slice(2, 8);
  try {
    await fs.mkdir(target, { recursive: true });
    await fs.writeFile(path.join(target, id + ".json"), JSON.stringify(lead, null, 2), "utf8");
    return { stored: true, id };
  } catch (e) {
    // Read-only FS or other issue: don't fail the request, just log.
    console.warn("[leads] persistenza non riuscita:", e.message);
    console.info("[leads] nuovo contatto:", JSON.stringify(lead));
    return { stored: false, id };
  }
}
