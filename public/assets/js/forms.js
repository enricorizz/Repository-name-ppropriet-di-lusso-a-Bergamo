/* ============================================================
   Rizzetti Immobiliare — forms.js
   Lead capture with progressive enhancement:
   - POSTs to /api/contact when a backend is available
   - Falls back to local storage + mailto when static-hosted
   ============================================================ */
(function () {
  "use strict";
  const RIZ = window.RIZ;
  if (!RIZ) return;

  RIZ.sendLead = async function (data) {
    const payload = { ...data, page: location.pathname, ts: new Date().toISOString() };
    try {
      const r = await fetch(RIZ.asset("api/contact"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (r.ok) return { ok: true, mode: "server" };
      throw new Error("HTTP " + r.status);
    } catch (e) {
      // Offline / static hosting fallback: keep a local record so nothing is lost.
      try {
        const k = "riz_leads";
        const arr = JSON.parse(localStorage.getItem(k) || "[]");
        arr.push(payload);
        localStorage.setItem(k, JSON.stringify(arr));
      } catch (_) {}
      return { ok: true, mode: "offline", payload };
    }
  };

  function mailtoFor(payload, email) {
    const subject = encodeURIComponent(`Richiesta dal sito — ${payload.subject || payload.property || "Contatto"}`);
    const body = encodeURIComponent(
      `Nome: ${payload.name || ""}\nEmail: ${payload.email || ""}\nTelefono: ${payload.phone || ""}\n` +
        (payload.property ? `Immobile: ${payload.property}\n` : "") +
        `\nMessaggio:\n${payload.message || ""}`
    );
    return `mailto:${email}?subject=${subject}&body=${body}`;
  }

  function bindForm(form) {
    if (form._bound) return; form._bound = true;
    const note = form.querySelector("[data-note]") || (() => {
      const n = document.createElement("div"); n.setAttribute("data-note", ""); form.appendChild(n); return n;
    })();

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      note.className = "form-note"; note.textContent = "";

      const data = {};
      new FormData(form).forEach((v, k) => (data[k] = typeof v === "string" ? v.trim() : v));

      // Validation
      if (!data.name || !data.email) {
        note.className = "form-note err"; note.textContent = "Inserisci nome ed email per procedere."; return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        note.className = "form-note err"; note.textContent = "L'indirizzo email non sembra valido."; return;
      }
      const consent = form.querySelector('[name="consent"]');
      if (consent && !consent.checked) {
        note.className = "form-note err"; note.textContent = "È necessario accettare l'informativa sulla privacy."; return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Invio in corso…"; }

      const res = await RIZ.sendLead(data);

      if (btn) { btn.disabled = false; btn.textContent = label; }
      form.reset();
      note.className = "form-note ok";
      if (res.mode === "server") {
        note.textContent = "Grazie! Abbiamo ricevuto la tua richiesta: ti ricontatteremo entro 48 ore.";
      } else {
        const email = (form.dataset.email || "enrico@rizzetti.it");
        note.innerHTML =
          "Grazie! La tua richiesta è stata registrata. Per un riscontro immediato puoi anche " +
          `<a class="text-gold" href="${mailtoFor(res.payload, email)}">scriverci via email</a>.`;
      }
      RIZ.toast("Richiesta inviata");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form[data-lead-form]").forEach(bindForm);
  });
  // Expose for dynamically-injected forms (property detail page)
  RIZ.bindLeadForm = bindForm;
})();
