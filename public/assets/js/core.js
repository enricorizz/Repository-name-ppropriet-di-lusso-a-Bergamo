/* ============================================================
   Rizzetti Immobiliare — core.js
   Namespace, data loading, icons, helpers, shared UI behaviours.
   Loaded on every page.
   ============================================================ */
(function () {
  "use strict";

  const RIZ = (window.RIZ = window.RIZ || {});

  /* ---------- Base path (works on root or GitHub Pages subpath) ---------- */
  const scriptEl = document.currentScript || document.querySelector('script[src*="core.js"]');
  const base = scriptEl ? scriptEl.src.replace(/assets\/js\/core\.js.*$/, "") : "./";
  RIZ.asset = (p) => base + p.replace(/^\//, "");
  RIZ.img = (name) => (name && name.startsWith("http") ? name : RIZ.asset("assets/img/" + name));

  /* ---------- Icons (inline SVG) ---------- */
  const I = {
    bed: '<path d="M2 4v16M2 10h20a0 0 0 0 1 0 0v10M22 20V10M2 14h20M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/>',
    bath: '<path d="M4 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 19l-1 2M18 19l1 2M8 6h.01"/>',
    area: '<path d="M3 3h18v18H3zM3 9h18M9 3v18"/>',
    land: '<path d="M12 3l9 6-9 12L3 9z"/>',
    floor: '<path d="M4 20h16M6 20V9l6-4 6 4v11M10 20v-6h4v6"/>',
    car: '<path d="M5 13l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L20 13M4 13h16v5H4zM7 18v2M17 18v2M7 15h.01M17 15h.01"/>',
    energy: '<path d="M13 2L3 14h7l-1 8 10-12h-7z"/>',
    year: '<path d="M3 5h18v16H3zM3 9h18M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01"/>',
    key: '<path d="M15 7a4 4 0 1 1-4 4l-7 7v3h3l1-1v-2h2v-2h2l1.5-1.5"/>',
    search: '<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3"/>',
    chart: '<path d="M3 3v18h18M7 15l3-4 3 3 5-7"/>',
    camera: '<path d="M4 7h3l2-2h6l2 2h3v13H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4"/>',
    globe: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>',
    phone: '<path d="M4 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L14 14l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 2 6a2 2 0 0 1 2-2z"/>',
    mail: '<path d="M3 5h18v14H3zM3 6l9 7 9-7"/>',
    clock: '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2"/>',
    heart: '<path d="M12 20s-7-4.6-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.4-9.5 9-9.5 9z"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H8l-4 4V5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z"/>',
    send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    zoom: '<path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3M8 11h6M11 8v6"/>',
    whatsapp: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3zM8.5 8c.2 0 .5 0 .7.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.2.2-.2.4-.1.6a6 6 0 0 0 2.8 2.8c.2.1.4.1.6-.1l.6-.5c.2-.1.4-.2.6-.1l1.6.7c.5.2.5.5.5.7 0 .8-1 1.5-1.7 1.5A7.5 7.5 0 0 1 7 9.7C7 9 7.7 8 8.5 8z"/>',
    instagram: '<path d="M4 4h16v16H4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17 7h.01"/>',
    linkedin: '<path d="M5 4h.01M4 9h3v11H4zM10 9h3v2a3 3 0 0 1 3-2c2 0 4 1.5 4 4.5V20h-3v-6c0-1.3-.7-2-1.7-2S13 12.7 13 14v6h-3z"/>',
    facebook: '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H8v4h2v6h4v-6h3l1-4h-4V8a1 1 0 0 1 1-1z"/>',
    sun: '<path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M6 6L4.5 4.5M19.5 19.5L18 18M18 6l1.5-1.5M4.5 19.5L6 18M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/>',
    star: '<path d="M12 3l2.9 6 6.1.9-4.5 4.3 1.1 6.1L12 17.8 6.4 20.3l1.1-6.1L3 9.9 9.1 9z"/>',
    handshake: '<path d="M12 7l2-2a2 2 0 0 1 3 0l3 3-5 5-2-2M12 7l-2-2a2 2 0 0 0-3 0L4 8l5 5 2-2M8 13l2 2M11 16l2 2"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 17l9 5 9-5"/>',
  };
  RIZ.icon = (name, cls) =>
    `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[name] || ""}</svg>`;

  /* ---------- Formatters ---------- */
  RIZ.formatPrice = (p, type) => {
    const n = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(p);
    return type === "mese" ? `${n}<small>/mese</small>` : n;
  };
  RIZ.formatNumber = (n) => new Intl.NumberFormat("it-IT").format(n);

  /* ---------- Data loading (cached) ---------- */
  let _props = null, _site = null;
  RIZ.getProperties = async function () {
    if (_props) return _props;
    const r = await fetch(RIZ.asset("data/properties.json"), { cache: "no-cache" });
    if (!r.ok) throw new Error("properties.json " + r.status);
    _props = (await r.json()).properties || [];
    return _props;
  };
  RIZ.getSite = async function () {
    if (_site) return _site;
    const r = await fetch(RIZ.asset("data/site.json"), { cache: "no-cache" });
    if (!r.ok) throw new Error("site.json " + r.status);
    _site = await r.json();
    return _site;
  };

  /* ---------- Favorites (localStorage) ---------- */
  const FAV_KEY = "riz_favorites";
  RIZ.getFavorites = () => { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch (e) { return []; } };
  RIZ.toggleFavorite = (id) => {
    const f = RIZ.getFavorites();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.push(id);
    localStorage.setItem(FAV_KEY, JSON.stringify(f));
    return f.indexOf(id) >= 0;
  };

  /* ---------- Toast ---------- */
  RIZ.toast = (msg) => {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("is-show");
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("is-show"), 3200);
  };

  /* ---------- Reveal on scroll ---------- */
  RIZ.initReveal = function () {
    const els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || !els.length) { els.forEach((e) => e.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
  };

  /* ---------- Header behaviour + mobile nav ---------- */
  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const hasHero = document.querySelector(".hero");
    const onScroll = () => { header.classList.toggle("is-solid", window.scrollY > 40 || !hasHero); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const toggle = document.querySelector(".nav-toggle");
    const nav = document.querySelector(".nav");
    if (toggle && nav) {
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("is-open")));
    }
  }

  /* ---------- FAQ accordion ---------- */
  RIZ.initFaq = function (root) {
    (root || document).querySelectorAll(".faq__item").forEach((item) => {
      const q = item.querySelector(".faq__q");
      const a = item.querySelector(".faq__a");
      if (!q || !a) return;
      q.addEventListener("click", () => {
        const open = item.classList.toggle("is-open");
        q.setAttribute("aria-expanded", String(open));
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
      });
    });
  };

  /* ---------- Populate footer + contact placeholders from site.json ---------- */
  RIZ.hydrateContacts = async function () {
    let site; try { site = await RIZ.getSite(); } catch (e) { return; }
    const a = site.agency;
    document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    document.querySelectorAll('[data-agency="email"]').forEach((el) => { el.textContent = a.email; if (el.tagName === "A") el.href = "mailto:" + a.email; });
    document.querySelectorAll('[data-agency="phone"]').forEach((el) => { el.textContent = a.phone; if (el.tagName === "A") el.href = "tel:" + a.phone.replace(/\s/g, ""); });
    document.querySelectorAll('[data-agency="hours"]').forEach((el) => (el.textContent = a.hours));
    document.querySelectorAll('[data-agency="address"]').forEach((el) => (el.textContent = a.address));
  };

  /* ---------- Boot (runs on every page) ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initHeader();
    RIZ.initReveal();
    RIZ.initFaq();
    RIZ.hydrateContacts();
    // Inject any placeholder icons: <i data-icon="name"></i>
    document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = RIZ.icon(el.dataset.icon)));
  });
})();
