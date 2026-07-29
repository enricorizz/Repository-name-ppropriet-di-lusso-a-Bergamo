/* ============================================================
   Rizzetti Immobiliare — AI agent (shared library)
   Builds the system prompt and calls the Anthropic API when a
   key is configured. Returns null when no key / on failure so
   the frontend transparently falls back to its local engine.
   ============================================================ */

function euro(n) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function buildSystemPrompt(properties, agency) {
  const catalog = (properties || [])
    .map((p) => {
      const price = p.priceType === "mese" ? `${euro(p.price)}/mese` : euro(p.price);
      return `- ${p.title} [${p.type}, ${p.zone}] · ${price} · ${p.bedrooms} camere · ${p.sqm} m² · rif. ${p.reference} · link: immobile.html?slug=${p.slug}`;
    })
    .join("\n");

  return `Sei il "Concierge" di ${agency ? agency.name : "Rizzetti Immobiliare"}, l'assistente virtuale di un'agenzia immobiliare di lusso a Bergamo, Italia.

RUOLO E TONO
- Aiuti i clienti a trovare proprietà di prestigio (ville, attici, dimore storiche, tenute) a Bergamo e provincia.
- Sei professionale, cortese, elegante e conciso. Rispondi nella lingua dell'utente (italiano di default, inglese se scrive in inglese).
- Non inventare MAI immobili, prezzi o caratteristiche che non siano nel catalogo qui sotto. Se non c'è una corrispondenza, proponi le alternative più vicine e invita a contattare l'agenzia per le proposte riservate (off-market).
- Quando citi un immobile, includi il link nel formato immobile.html?slug=... così il cliente può aprirlo.
- Incoraggia con garbo a fissare una visita o a lasciare un recapito tramite la pagina contatti.html. Non chiedere dati personali sensibili.
- Mantieni le risposte brevi (2-5 frasi), adatte a una chat.

CONTATTI
- Email: ${agency ? agency.email : "enrico@rizzetti.it"} · Telefono: ${agency ? agency.phone : ""} · Orari: ${agency ? agency.hours : ""}

CATALOGO ATTUALE (${(properties || []).length} immobili):
${catalog}`;
}

export async function generateReply({ message, history, apiKey, model, properties, agency, timeoutMs = 20000 }) {
  if (!apiKey) return null; // no key configured -> frontend uses local engine
  if (!message || typeof message !== "string") return null;

  const system = buildSystemPrompt(properties, agency);
  const msgs = [];
  (history || []).slice(-8).forEach((m) => {
    if (m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string") {
      msgs.push({ role: m.role, content: m.content.slice(0, 2000) });
    }
  });
  msgs.push({ role: "user", content: message.slice(0, 2000) });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: model || "claude-sonnet-5",
        max_tokens: 600,
        system,
        messages: msgs,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = Array.isArray(data.content)
      ? data.content.filter((c) => c.type === "text").map((c) => c.text).join("\n").trim()
      : null;
    return text || null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
