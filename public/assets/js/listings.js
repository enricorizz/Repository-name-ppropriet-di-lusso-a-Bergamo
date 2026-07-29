/* ============================================================
   Rizzetti Immobiliare — listings.js
   Property card rendering, home featured grid, listings page
   with live filtering, sorting and favorites.
   ============================================================ */
(function () {
  "use strict";
  const RIZ = window.RIZ;
  if (!RIZ) return;

  /* ---------- Card renderer ---------- */
  RIZ.renderCard = function (p) {
    const favs = RIZ.getFavorites();
    const isFav = favs.includes(p.id);
    const url = `immobile.html?slug=${encodeURIComponent(p.slug)}`;
    const badge = p.badge ? `<span class="pcard__badge">${p.badge}</span>` : "";
    const land = p.plotSqm ? `<span>${RIZ.icon("land")} ${RIZ.formatNumber(p.plotSqm)} m² area</span>` : "";
    return `
    <article class="pcard" data-reveal>
      <div class="pcard__media">
        ${badge}
        <button class="pcard__fav ${isFav ? "is-active" : ""}" data-fav="${p.id}" aria-label="Salva tra i preferiti" aria-pressed="${isFav}">
          ${RIZ.icon("heart")}
        </button>
        <a href="${url}" aria-label="${p.title}">
          <img src="${RIZ.img(p.image)}" alt="${p.title} — ${p.zone}, Bergamo" loading="lazy" width="800" height="600">
        </a>
      </div>
      <div class="pcard__body">
        <span class="pcard__zone">${p.type} · ${p.zone}</span>
        <h3 class="pcard__title"><a href="${url}">${p.title}</a></h3>
        <div class="pcard__price">${RIZ.formatPrice(p.price, p.priceType)}</div>
        <div class="pcard__specs">
          <span>${RIZ.icon("bed")} ${p.bedrooms} camere</span>
          <span>${RIZ.icon("bath")} ${p.bathrooms} bagni</span>
          <span>${RIZ.icon("area")} ${RIZ.formatNumber(p.sqm)} m²</span>
          ${land}
        </div>
        <div class="pcard__foot">
          <a class="link-arrow" href="${url}">Scopri la proprietà <span>${RIZ.icon("arrow")}</span></a>
        </div>
      </div>
    </article>`;
  };

  function bindFavs(root) {
    (root || document).querySelectorAll("[data-fav]").forEach((btn) => {
      if (btn._bound) return; btn._bound = true;
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = Number(btn.dataset.fav);
        const active = RIZ.toggleFavorite(id);
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", String(active));
        RIZ.toast(active ? "Aggiunto ai preferiti" : "Rimosso dai preferiti");
      });
    });
  }

  /* ---------- Home: featured grid ---------- */
  async function initFeatured() {
    const grid = document.querySelector("[data-featured]");
    if (!grid) return;
    try {
      const props = await RIZ.getProperties();
      const n = Number(grid.dataset.featured) || 6;
      const list = props.filter((p) => p.badge).concat(props).slice(0, n);
      const seen = new Set(); const picked = [];
      for (const p of list) { if (!seen.has(p.id)) { seen.add(p.id); picked.push(p); } if (picked.length >= n) break; }
      grid.innerHTML = picked.map(RIZ.renderCard).join("");
      bindFavs(grid); RIZ.initReveal();
    } catch (e) { grid.innerHTML = `<p class="empty-state">Impossibile caricare gli immobili in evidenza.</p>`; }
  }

  /* ---------- Home hero quick-search ---------- */
  function initQuickSearch() {
    const form = document.querySelector("[data-quicksearch]");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      new FormData(form).forEach((v, k) => { if (v) params.set(k, v); });
      window.location.href = "immobili.html" + (params.toString() ? "?" + params.toString() : "");
    });
  }

  /* ---------- Listings page ---------- */
  async function initListings() {
    const results = document.querySelector("[data-results]");
    if (!results) return;
    const countEl = document.querySelector("[data-count]");
    const form = document.querySelector("[data-filters]");
    let props;
    try { props = await RIZ.getProperties(); }
    catch (e) { results.innerHTML = `<p class="empty-state">Impossibile caricare gli immobili.</p>`; return; }

    // Populate zone select
    const zoneSel = form && form.querySelector('[name="zone"]');
    if (zoneSel) {
      const zones = [...new Set(props.map((p) => p.zone))].sort();
      zones.forEach((z) => zoneSel.insertAdjacentHTML("beforeend", `<option value="${z}">${z}</option>`));
    }
    const typeSel = form && form.querySelector('[name="type"]');
    if (typeSel) {
      const types = [...new Set(props.map((p) => p.type))].sort();
      types.forEach((t) => typeSel.insertAdjacentHTML("beforeend", `<option value="${t}">${t}</option>`));
    }

    // Prefill from URL
    const url = new URLSearchParams(location.search);
    if (form) form.querySelectorAll("[name]").forEach((el) => { if (url.has(el.name)) el.value = url.get(el.name); });

    function read() {
      const f = {};
      if (form) new FormData(form).forEach((v, k) => (f[k] = v));
      return f;
    }

    function apply() {
      const f = read();
      let out = props.filter((p) => {
        if (f.status && p.status !== f.status) return false;
        if (f.zone && p.zone !== f.zone) return false;
        if (f.type && p.type !== f.type) return false;
        if (f.beds && p.bedrooms < Number(f.beds)) return false;
        if (f.min && p.price < Number(f.min)) return false;
        if (f.max && p.price > Number(f.max)) return false;
        if (f.q) {
          const hay = `${p.title} ${p.zone} ${p.type} ${p.address} ${(p.features || []).join(" ")}`.toLowerCase();
          if (!hay.includes(f.q.toLowerCase())) return false;
        }
        return true;
      });
      const sort = f.sort || "featured";
      out.sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "size-desc") return b.sqm - a.sqm;
        return (b.badge ? 1 : 0) - (a.badge ? 1 : 0) || b.price - a.price;
      });

      if (countEl) countEl.innerHTML = `<b>${out.length}</b> ${out.length === 1 ? "proprietà" : "proprietà"} disponibili`;
      results.innerHTML = out.length
        ? out.map(RIZ.renderCard).join("")
        : `<div class="empty-state"><h3>Nessun risultato</h3><p>Nessuna proprietà corrisponde ai criteri selezionati. Prova a modificare i filtri o <a class="text-gold" href="contatti.html">contattaci</a> per una ricerca su misura.</p></div>`;
      bindFavs(results); RIZ.initReveal();
    }

    if (form) {
      form.addEventListener("input", apply);
      form.addEventListener("submit", (e) => { e.preventDefault(); apply(); });
      const reset = form.querySelector("[data-reset]");
      if (reset) reset.addEventListener("click", (e) => { e.preventDefault(); form.reset(); apply(); });
    }
    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initFeatured();
    initQuickSearch();
    initListings();
  });
})();
