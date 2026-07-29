/* ============================================================
   Rizzetti Immobiliare — chat.js
   "Concierge" — assistente immobiliare virtuale.
   • Prova prima il backend /api/chat (modello Claude, se configurato)
   • In assenza di backend usa un motore locale basato sul catalogo
     e sulla knowledge base del sito (funziona sempre, anche offline).
   ============================================================ */
(function () {
  "use strict";
  const RIZ = window.RIZ;
  if (!RIZ) return;

  let props = [], site = null, history = [], ready = false;

  /* ---------- Number / budget parser ---------- */
  function parseBudget(text) {
    const t = text.toLowerCase().replace(/\./g, "").replace(/,/g, ".");
    let m = t.match(/(\d+(?:\.\d+)?)\s*(milion|mln|mio)/);
    if (m) return Math.round(parseFloat(m[1]) * 1e6);
    m = t.match(/(\d+)\s*(mila|k)\b/);
    if (m) return parseInt(m[1], 10) * 1000;
    m = t.match(/(\d{5,7})/);
    if (m) return parseInt(m[1], 10);
    return null;
  }

  function cardLink(p) {
    return `<a href="immobile.html?slug=${p.slug}">${p.title}</a> — <strong>${RIZ.formatPrice(p.price, p.priceType).replace(/<[^>]+>/g, "")}</strong> · ${p.zone}`;
  }
  function listProps(list, intro) {
    if (!list.length) return "Al momento non ho una corrispondenza esatta in catalogo, ma disponiamo anche di proposte riservate <em>off-market</em>. Vuoi che ti faccia ricontattare da Enrico Rizzetti?";
    const items = list.slice(0, 3).map((p) => `<br>• ${cardLink(p)}`).join("");
    return `${intro}${items}<br><br>Posso fissarti una <a href="contatti.html">visita riservata</a> quando preferisci.`;
  }

  /* ---------- Local knowledge engine ---------- */
  function localAnswer(text) {
    const t = text.toLowerCase();
    const has = (...w) => w.some((x) => t.includes(x));

    if (has("ciao", "salve", "buongiorno", "buonasera", "hey", "hello"))
      return "Benvenuto in Rizzetti Immobiliare 🕊️ Sono il concierge virtuale per le proprietà di lusso a Bergamo. Posso aiutarti a trovare la casa giusta per budget, zona o tipologia. Cosa stai cercando?";

    if (has("affitto", "affittare", "locazione", "in affitto")) {
      const rent = props.filter((p) => p.status === "affitto");
      return listProps(rent, "Ecco le nostre proposte in <strong>locazione di prestigio</strong>:");
    }

    // Zone match
    const zoneHit = [...new Set(props.map((p) => p.zone))].find((z) => t.includes(z.toLowerCase()));
    if (zoneHit) {
      const inZone = props.filter((p) => p.zone === zoneHit);
      return listProps(inZone, `A <strong>${zoneHit}</strong> proponiamo attualmente:`);
    }

    // Type match
    const typeMap = { villa: "Villa", attico: "Attico", appartament: "Appartamento", loft: "Loft", casale: "Casale", tenuta: "Tenuta", penthouse: "Attico" };
    const typeKey = Object.keys(typeMap).find((k) => t.includes(k));
    if (typeKey) {
      const type = typeMap[typeKey];
      const list = props.filter((p) => p.type === type);
      return listProps(list, `Per la tipologia <strong>${type}</strong> ho selezionato:`);
    }

    // Budget
    const budget = parseBudget(t);
    if (budget) {
      const within = props.filter((p) => p.priceType !== "mese" && p.price <= budget * 1.08).sort((a, b) => b.price - a.price);
      return listProps(within, `Con un budget intorno a <strong>${RIZ.formatNumber(budget)} €</strong> puoi valutare:`);
    }

    if (has("prezzo", "costa", "quanto", "budget", "valore"))
      return "Le nostre proprietà spaziano indicativamente da 780.000 € fino a oltre 5,6 milioni. Dimmi il tuo budget di massima (es. «2 milioni») e ti mostro le soluzioni migliori.";

    if (has("valuta", "vendere", "vendo", "quanto vale", "stima"))
      return "Offriamo <strong>valutazioni professionali gratuite e riservate</strong>. Analizziamo la micro-zona e le caratteristiche dell'immobile e ti consegniamo una stima motivata. Vuoi lasciarmi un recapito nella pagina <a href='contatti.html'>Contatti</a>?";

    if (has("servizi", "cosa fate", "cosa offrite"))
      return "Ci occupiamo di vendita di immobili di prestigio, ricerca personalizzata (property finding), valutazioni, home staging e servizi fotografici, assistenza legale/notarile e clientela internazionale. Vuoi approfondire un servizio in particolare?";

    if (has("mutuo", "finanz", "banca", "rata"))
      return "Collaboriamo con partner bancari per soluzioni di finanziamento dedicate alla clientela premium. Ti mettiamo in contatto con un consulente: scrivimi nome ed esigenza oppure usa la pagina <a href='contatti.html'>Contatti</a>.";

    if (has("estero", "foreign", "international", "stranier", "english"))
      return "We assist international buyers end-to-end — in English and other languages — including tax code, notary and legal matters. How can we help you find your home in Bergamo?";

    if (has("visita", "vedere", "appuntamento", "sopralluogo", "prenot"))
      return "Con piacere. Le visite sono su appuntamento e riservate. Lasciami il tuo nome e un recapito (o vai su <a href='contatti.html'>Contatti</a>) e organizziamo tutto — anche off-market.";

    if (has("contatt", "telefono", "email", "chiama", "dove siete", "orari") && site)
      return `Puoi contattarci qui:<br>📞 <a href="tel:${site.agency.phone.replace(/\s/g, "")}">${site.agency.phone}</a><br>✉️ <a href="mailto:${site.agency.email}">${site.agency.email}</a><br>🕒 ${site.agency.hours}`;

    if (has("chi siete", "chi sei", "rizzetti", "agenzia", "esperienza"))
      return "Rizzetti Immobiliare è il punto di riferimento per il <strong>luxury living a Bergamo</strong>: oltre 20 anni di esperienza sul territorio, un servizio sartoriale e la massima riservatezza. Come possiamo aiutarti?";

    if (has("grazie", "perfetto", "ottimo"))
      return "È un piacere. Resto a disposizione: posso mostrarti altre proprietà o fissare una visita quando vuoi. 🕊️";

    // Fallback: show a couple of highlights
    const feat = props.filter((p) => p.badge).slice(0, 2);
    return listProps(feat, "Posso aiutarti a cercare per <strong>zona</strong>, <strong>tipologia</strong> o <strong>budget</strong>. Ecco intanto due proposte esclusive:");
  }

  /* ---------- Backend attempt ---------- */
  async function serverAnswer(text) {
    try {
      const r = await fetch(RIZ.asset("api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.slice(-8) }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      if (data && data.reply) return data.reply;
      throw new Error("empty");
    } catch (e) {
      return null; // caller falls back to local
    }
  }

  async function answer(text) {
    const server = await serverAnswer(text);
    return server || localAnswer(text);
  }

  /* ---------- UI ---------- */
  const SUGGESTIONS = ["Ville a San Vigilio", "Attici in Città Alta", "Budget 2 milioni", "Immobili in affitto", "Prenota una visita"];

  function buildUI() {
    const launcher = document.createElement("button");
    launcher.className = "chat-launcher";
    launcher.setAttribute("aria-label", "Apri l'assistente virtuale");
    launcher.innerHTML = `<span class="chat-launcher__dot">${RIZ.icon("message")}</span>
      <span class="chat-launcher__text"><b>Concierge</b><span>Assistente immobiliare</span></span>`;

    const panel = document.createElement("section");
    panel.className = "chat-panel";
    panel.setAttribute("aria-label", "Assistente virtuale Rizzetti");
    panel.innerHTML = `
      <header class="chat-head">
        <span class="chat-head__mark">R</span>
        <div><b>Concierge Rizzetti</b><br><span>Online · risponde subito</span></div>
        <button class="chat-close" aria-label="Chiudi">${RIZ.icon("close")}</button>
      </header>
      <div class="chat-log" data-log></div>
      <div class="chat-suggest" data-suggest>${SUGGESTIONS.map((s) => `<button type="button">${s}</button>`).join("")}</div>
      <form class="chat-form" data-chatform>
        <input type="text" name="q" placeholder="Scrivi un messaggio…" autocomplete="off" aria-label="Messaggio">
        <button type="submit" aria-label="Invia">${RIZ.icon("send")}</button>
      </form>`;

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    const log = panel.querySelector("[data-log]");
    const form = panel.querySelector("[data-chatform]");
    const input = form.querySelector("input");
    let greeted = false;

    const scroll = () => (log.scrollTop = log.scrollHeight);
    function push(role, html) {
      const div = document.createElement("div");
      div.className = "msg msg--" + (role === "user" ? "user" : "bot");
      div.innerHTML = html;
      log.appendChild(div); scroll();
      history.push({ role: role === "user" ? "user" : "assistant", content: div.textContent });
      return div;
    }
    function typing() {
      const div = document.createElement("div");
      div.className = "msg msg--bot";
      div.innerHTML = `<span class="chat-typing"><i></i><i></i><i></i></span>`;
      log.appendChild(div); scroll();
      return div;
    }

    async function handle(text) {
      if (!text.trim()) return;
      push("user", text.replace(/</g, "&lt;"));
      const t = typing();
      const reply = await answer(text);
      // brief natural delay
      setTimeout(() => { t.remove(); push("bot", reply); }, 350);
    }

    function open() {
      panel.classList.add("is-open");
      launcher.style.display = "none";
      if (!greeted) { greeted = true; push("bot", localAnswer("ciao")); }
      setTimeout(() => input.focus(), 200);
    }
    function close() { panel.classList.remove("is-open"); launcher.style.display = "flex"; }

    launcher.addEventListener("click", open);
    panel.querySelector(".chat-close").addEventListener("click", close);
    form.addEventListener("submit", (e) => { e.preventDefault(); const v = input.value; input.value = ""; handle(v); });
    panel.querySelectorAll("[data-suggest] button").forEach((b) =>
      b.addEventListener("click", () => handle(b.textContent))
    );
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && panel.classList.contains("is-open")) close(); });
  }

  async function boot() {
    try { props = await RIZ.getProperties(); site = await RIZ.getSite(); }
    catch (e) { props = []; }
    ready = true;
    buildUI();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
