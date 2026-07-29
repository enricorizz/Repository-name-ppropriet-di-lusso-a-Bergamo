/* Basic tests for the shared backend libraries.
   Run: npm test */
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLead } from "../api/_lib/leads.js";
import { buildSystemPrompt, generateReply } from "../api/_lib/agent.js";

test("validateLead rifiuta email non valida", () => {
  const r = validateLead({ name: "Mario Rossi", email: "non-una-email" });
  assert.equal(r.ok, false);
});

test("validateLead rifiuta nome mancante", () => {
  const r = validateLead({ email: "mario@example.com" });
  assert.equal(r.ok, false);
});

test("validateLead accetta un lead corretto e ripulisce i campi", () => {
  const r = validateLead({ name: "  Mario Rossi ", email: "mario@example.com", message: "Ciao\n\nmondo" });
  assert.equal(r.ok, true);
  assert.equal(r.lead.name, "Mario Rossi");
  assert.equal(r.lead.message, "Ciao mondo");
  assert.ok(r.lead.ts);
});

test("buildSystemPrompt include il catalogo e l'agenzia", () => {
  const props = [{ title: "Villa Test", type: "Villa", zone: "San Vigilio", price: 1000000, priceType: "vendita", bedrooms: 4, sqm: 300, reference: "RIZ-TEST", slug: "villa-test" }];
  const s = buildSystemPrompt(props, { name: "Rizzetti Immobiliare", email: "enrico@rizzetti.it", phone: "x", hours: "y" });
  assert.match(s, /Villa Test/);
  assert.match(s, /villa-test/);
  assert.match(s, /Rizzetti Immobiliare/);
});

test("generateReply restituisce null senza API key (fallback locale)", async () => {
  const reply = await generateReply({ message: "ciao", apiKey: "", properties: [], agency: {} });
  assert.equal(reply, null);
});
