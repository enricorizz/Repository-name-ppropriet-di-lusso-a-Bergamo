/* ============================================================
   Rizzetti Immobiliare — property.js
   Single property detail page: gallery, key facts, map,
   enquiry form and related listings.
   ============================================================ */
(function () {
  "use strict";
  const RIZ = window.RIZ;
  if (!RIZ) return;

  const root = document.querySelector("[data-pd]");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("slug");

  function keyfact(icon, value, label) {
    return `<div class="pd-keyfact">${RIZ.icon(icon)}<b>${value}</b><span>${label}</span></div>`;
  }

  function galleryHTML(p) {
    const imgs = (p.gallery && p.gallery.length ? p.gallery : [p.image]);
    const main = imgs[0];
    const sides = imgs.slice(1, 3);
    const sideHTML = sides
      .map((s, i) => `<div class="pd-gallery__thumb" data-lb="${i + 1}"><img src="${RIZ.img(s)}" alt="${p.title} — immagine ${i + 2}" loading="lazy"></div>`)
      .join("");
    return `
      <div class="pd-gallery">
        <div class="pd-gallery__main" data-lb="0"><img src="${RIZ.img(main)}" alt="${p.title} — ${p.zone}"></div>
        <div class="pd-gallery__side">${sideHTML}</div>
      </div>`;
  }

  function render(p, site) {
    document.title = `${p.title} — ${p.zone} · Rizzetti Immobiliare`;
    const md = document.querySelector('meta[name="description"]');
    if (md) md.setAttribute("content", p.shortDescription);

    const priceLabel = p.status === "affitto" ? "Canone mensile" : "Prezzo";
    const amenities = (p.features || [])
      .map((f) => `<li>${RIZ.icon("check")} ${f}</li>`)
      .join("");
    const highlights = (p.highlights || [])
      .map((h) => `<li>${RIZ.icon("star")} <span>${h}</span></li>`)
      .join("");

    const d = 0.012;
    const bbox = [p.lng - d, p.lat - d, p.lng + d, p.lat + d].join(",");
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat},${p.lng}`;
    const mapLink = `https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=15/${p.lat}/${p.lng}`;

    const facts =
      keyfact("bed", p.bedrooms, "Camere") +
      keyfact("bath", p.bathrooms, "Bagni") +
      keyfact("area", RIZ.formatNumber(p.sqm), "m² interni") +
      (p.plotSqm ? keyfact("land", RIZ.formatNumber(p.plotSqm), "m² terreno") : "") +
      keyfact("car", p.parking, "Posti auto") +
      keyfact("energy", p.energyClass, "Classe en.") +
      keyfact("year", p.renovatedYear || p.yearBuilt, p.renovatedYear ? "Ristrutt." : "Anno");

    root.innerHTML = `
      <nav class="breadcrumbs" aria-label="Percorso">
        <a href="index.html">Home</a> <span>/</span>
        <a href="immobili.html">Immobili</a> <span>/</span>
        <span>${p.zone}</span>
      </nav>

      ${galleryHTML(p)}

      <div class="pd-layout">
        <div class="pd-body">
          <span class="pd-zone">${p.type} · ${p.zone}</span>
          <h1>${p.title}</h1>
          <p class="pd-price">${RIZ.formatPrice(p.price, p.priceType)}</p>
          <p style="color:var(--muted-2);display:flex;gap:8px;align-items:center;margin-top:6px">${RIZ.icon("pin")} ${p.address}</p>

          <div class="pd-keyfacts">${facts}</div>

          ${highlights ? `<div class="pd-section"><h2>Punti di forza</h2><ul class="checklist">${highlights}</ul></div>` : ""}

          <div class="pd-section">
            <h2>Descrizione</h2>
            <p>${p.description}</p>
          </div>

          <div class="pd-section">
            <h2>Caratteristiche</h2>
            <ul class="pd-amenities">${amenities}</ul>
          </div>

          <div class="pd-section">
            <h2>Posizione</h2>
            <p>Zona <strong>${p.zone}</strong> — ${p.address}.</p>
            <div class="pd-map">
              <iframe title="Mappa di ${p.zone}, Bergamo" src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
            <p style="margin-top:10px"><a class="link-arrow" href="${mapLink}" target="_blank" rel="noopener">Apri nella mappa <span>${RIZ.icon("arrow")}</span></a></p>
          </div>
        </div>

        <aside class="pd-aside">
          <div class="pd-card">
            <h3>Richiedi informazioni</h3>
            <p>Prenota una visita riservata o richiedi il dossier completo di questa proprietà.</p>
            <form data-lead-form data-email="${site.agency.email}">
              <input type="hidden" name="property" value="${p.title} (${p.reference})">
              <input type="hidden" name="subject" value="Interesse per ${p.reference}">
              <div class="field"><label>Nome e cognome</label><input type="text" name="name" required autocomplete="name"></div>
              <div class="field"><label>Email</label><input type="email" name="email" required autocomplete="email"></div>
              <div class="field"><label>Telefono</label><input type="tel" name="phone" autocomplete="tel"></div>
              <div class="field"><label>Messaggio</label><textarea name="message" rows="3" placeholder="Vorrei fissare una visita…"></textarea></div>
              <label class="form-consent" style="color:rgba(246,241,231,0.75);margin:6px 0 14px">
                <input type="checkbox" name="consent" required> Acconsento al trattamento dei dati secondo la <a class="text-gold" href="privacy.html" target="_blank">privacy policy</a>.
              </label>
              <button type="submit" class="btn btn--block">Invia richiesta</button>
              <div data-note></div>
            </form>
            <div style="margin-top:20px;display:flex;gap:10px">
              <a class="btn btn--light btn--sm" style="flex:1;justify-content:center" href="tel:${site.agency.phone.replace(/\s/g, "")}">${RIZ.icon("phone")} Chiama</a>
              <a class="btn btn--light btn--sm" style="flex:1;justify-content:center" href="mailto:${site.agency.email}?subject=${encodeURIComponent("Info " + p.reference)}">${RIZ.icon("mail")} Email</a>
            </div>
            <p class="pd-ref">Riferimento ${p.reference}</p>
          </div>
        </aside>
      </div>
    `;

    // Bind the injected lead form
    const form = root.querySelector("form[data-lead-form]");
    if (form && RIZ.bindLeadForm) RIZ.bindLeadForm(form);

    // Lightbox
    initLightbox(p);
    RIZ.initReveal();
  }

  function initLightbox(p) {
    const imgs = (p.gallery && p.gallery.length ? p.gallery : [p.image]).map(RIZ.img);
    let box = document.querySelector(".lightbox");
    if (!box) {
      box = document.createElement("div");
      box.className = "lightbox";
      box.innerHTML = `
        <button class="lightbox__close" aria-label="Chiudi">${RIZ.icon("close")}</button>
        <button class="lightbox__nav prev" aria-label="Precedente">‹</button>
        <img alt="">
        <button class="lightbox__nav next" aria-label="Successiva">›</button>`;
      document.body.appendChild(box);
    }
    const imgEl = box.querySelector("img");
    let idx = 0;
    const show = (i) => { idx = (i + imgs.length) % imgs.length; imgEl.src = imgs[idx]; };
    const open = (i) => { show(i); box.classList.add("is-open"); document.body.style.overflow = "hidden"; };
    const close = () => { box.classList.remove("is-open"); document.body.style.overflow = ""; };
    root.querySelectorAll("[data-lb]").forEach((el) =>
      el.addEventListener("click", () => open(Number(el.dataset.lb)))
    );
    box.querySelector(".lightbox__close").onclick = close;
    box.querySelector(".prev").onclick = () => show(idx - 1);
    box.querySelector(".next").onclick = () => show(idx + 1);
    box.addEventListener("click", (e) => { if (e.target === box) close(); });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  async function renderRelated(current, props) {
    const wrap = document.querySelector("[data-related]");
    if (!wrap) return;
    let rel = props.filter((p) => p.id !== current.id && (p.zone === current.zone || p.type === current.type));
    if (rel.length < 3) rel = rel.concat(props.filter((p) => p.id !== current.id && !rel.includes(p)));
    rel = rel.slice(0, 3);
    wrap.innerHTML = rel.map(RIZ.renderCard).join("");
    wrap.querySelectorAll("[data-fav]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const active = RIZ.toggleFavorite(Number(btn.dataset.fav));
        btn.classList.toggle("is-active", active);
        RIZ.toast(active ? "Aggiunto ai preferiti" : "Rimosso dai preferiti");
      });
    });
  }

  async function boot() {
    let props, site;
    try { props = await RIZ.getProperties(); site = await RIZ.getSite(); }
    catch (e) { root.innerHTML = `<p class="empty-state">Impossibile caricare la proprietà.</p>`; return; }
    const p = props.find((x) => x.slug === slug) || props[0];
    if (!p) { root.innerHTML = `<div class="empty-state"><h3>Immobile non trovato</h3><p><a class="text-gold" href="immobili.html">Torna al catalogo</a></p></div>`; return; }
    render(p, site);
    renderRelated(p, props);
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
