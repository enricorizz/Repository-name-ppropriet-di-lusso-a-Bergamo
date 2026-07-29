/* Vercel serverless function — POST /api/contact
   Receives a lead from the site, validates and stores it. */
import { validateLead, saveLead } from "./_lib/leads.js";
import { readJsonBody } from "./_lib/util.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    return res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
  }
  const body = await readJsonBody(req);
  const check = validateLead(body);
  if (!check.ok) {
    res.statusCode = 400;
    res.setHeader("content-type", "application/json");
    return res.end(JSON.stringify({ ok: false, error: check.error }));
  }
  const result = await saveLead(check.lead);
  res.statusCode = 200;
  res.setHeader("content-type", "application/json");
  return res.end(JSON.stringify({ ok: true, id: result.id }));
}
