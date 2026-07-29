/* Vercel serverless function — POST /api/chat
   Proxies the "Concierge" assistant to the Anthropic API when
   ANTHROPIC_API_KEY is configured. Returns { reply: null } when
   no key is set, so the frontend falls back to its local engine. */
import { generateReply } from "./_lib/agent.js";
import { loadData, readJsonBody } from "./_lib/util.js";

export default async function handler(req, res) {
  res.setHeader("content-type", "application/json");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    return res.end(JSON.stringify({ reply: null, error: "Method not allowed" }));
  }
  const body = await readJsonBody(req);
  const { properties, agency } = await loadData();
  const reply = await generateReply({
    message: body.message,
    history: body.history,
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL,
    properties,
    agency,
  });
  res.statusCode = 200;
  return res.end(JSON.stringify({ reply }));
}
