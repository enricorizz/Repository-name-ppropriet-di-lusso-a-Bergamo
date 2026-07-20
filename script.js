/* Rizzetti Immobiliare Agent — script.js */

const contacts = {
  website: "https://www.Rizzetti.it",
  officeEmail: "Info@Rizzetti.it",
  ownerEmail: "Enrico@Rizzetti.it",
  officePhone: "+39035212562",
  whatsapp: "+393352935550",
};

const WHATSAPP_DEFAULT = "Buongiorno, desidero maggiori informazioni sulle proprietà di lusso a Bergamo.";

const properties = [
  {
    id: 1,
    title: "Villa panoramica in Città Alta",
    type: "villa",
    price: 2400000,
    label: "Vista dominante",
    description: "Residenza con giardino privato, spa interna e terrazza con affaccio privilegiato su Bergamo.",
    details: ["420 m²", "6 locali", "Garage triplo"],
    priority: "vista",
    visual: "🏰",
  },
  {
    id: 2,
    title: "Attico esclusivo in centro",
    type: "attico",
    price: 1480000,
    label: "Posizione premium",
    description: "Ultimo piano con ascensore privato, finiture contemporanee e ampia zona living panoramica.",
    details: ["260 m²", "4 locali", "Terrazza abitabile"],
    priority: "posizione",
    visual: "🏙️",
  },
  {
    id: 3,
    title: "Dimora storica con parco riservato",
    type: "dimora",
    price: 3900000,
    label: "Massima privacy",
    description: "Proprietà di rappresentanza immersa nel verde, ideale per chi desidera riservatezza assoluta.",
    details: ["680 m²", "10 locali", "Dependance"],
    priority: "privacy",
    visual: "🏛️",
  },
  {
    id: 4,
    title: "Appartamento di lusso con terrazza",
    type: "appartamento",
    price: 980000,
    label: "Comfort esclusivo",
    description: "Quarto piano con terrazza privata, parquet pregiato e cucina firmata in zona residenziale quieta.",
    details: ["180 m²", "3 locali", "Box auto"],
    priority: "posizione",
    visual: "🏢",
  },
  {
    id: 5,
    title: "Villa con piscina collinare",
    type: "villa",
    price: 1850000,
    label: "Oasi privata",
    description: "Villa moderna con piscina a sfioro, ampio giardino e vista sulle Alpi Orobiche.",
    details: ["350 m²", "5 locali", "Piscina riscaldata"],
    priority: "spazio",
    visual: "🌿",
  },
];

function formatPrice(price) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(price);
}

function createPropertyCard(property) {
  const card = document.createElement("article");
  card.className = "property-card";
  card.innerHTML = `
    <div class="property-visual">${property.visual}</div>
    <div class="property-body">
      <p class="property-label">${property.label}</p>
      <h3 class="property-title">${property.title}</h3>
      <p class="property-description">${property.description}</p>
      <div class="property-details">
        ${property.details.map((d) => `<span class="property-detail">${d}</span>`).join("")}
      </div>
      <p class="property-price">${formatPrice(property.price)}</p>
    </div>
  `;
  return card;
}

function renderProperties(list, container) {
  container.innerHTML = "";
  list.forEach((p) => container.appendChild(createPropertyCard(p)));
}

function recommend({ tipologia, budget, priorita }) {
  const filtered = properties
    .filter((p) => {
      const typeMatch = tipologia === "tutte" || p.type === tipologia;
      const budgetMatch =
        budget === "tutti" ||
        (budget === "1500000" && p.price <= 1500000) ||
        (budget === "2500000" && p.price <= 2500000) ||
        (budget === "9999999" && p.price > 2500000);
      return typeMatch && budgetMatch;
    })
    .sort((a, b) => Number(b.priority === priorita) - Number(a.priority === priorita));
  return filtered;
}

function renderContacts() {
  const list = document.getElementById("contact-list");
  if (!list) return;

  const items = [
    {
      icon: "🌐",
      label: "Sito web",
      value: "www.Rizzetti.it",
      href: contacts.website,
    },
    {
      icon: "📞",
      label: "Telefono ufficio",
      value: "035 21 25 62",
      href: `tel:${contacts.officePhone}`,
    },
    {
      icon: "💬",
      label: "WhatsApp",
      value: "335 29 35 50",
      href: `https://wa.me/${contacts.whatsapp.replace("+", "")}?text=${encodeURIComponent(WHATSAPP_DEFAULT)}`,
    },
    {
      icon: "📧",
      label: "Email ufficio",
      value: contacts.officeEmail,
      href: `mailto:${contacts.officeEmail}`,
    },
    {
      icon: "📧",
      label: "Email titolare",
      value: contacts.ownerEmail,
      href: `mailto:${contacts.ownerEmail}`,
    },
  ];

  items.forEach(({ icon, label, value, href }) => {
    const a = document.createElement("a");
    a.className = "contact-item";
    a.href = href;
    a.setAttribute("target", href.startsWith("http") ? "_blank" : "_self");
    a.setAttribute("rel", "noopener noreferrer");
    a.innerHTML = `
      <span class="contact-icon">${icon}</span>
      <span>
        <p class="contact-label">${label}</p>
        <p class="contact-value">${value}</p>
      </span>
    `;
    list.appendChild(a);
  });
}

function init() {
  const grid = document.getElementById("property-grid");
  if (grid) renderProperties(properties, grid);

  renderContacts();

  const form = document.getElementById("recommend-form");
  const results = document.getElementById("recommend-results");
  if (form && results) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const matches = recommend({
        tipologia: data.get("tipologia"),
        budget: data.get("budget"),
        priorita: data.get("priorita"),
      });

      results.hidden = false;
      results.innerHTML = `
        <p class="results-title">${matches.length > 0 ? `${matches.length} proprietà trovate per te` : "Nessuna proprietà corrisponde ai criteri selezionati"}</p>
        <p class="results-subtitle">${matches.length > 0 ? "Contattaci per ulteriori dettagli su queste soluzioni" : "Amplia i criteri di ricerca o contattaci direttamente"}</p>
        <div class="property-grid"></div>
      `;

      const resultGrid = results.querySelector(".property-grid");
      if (matches.length > 0) renderProperties(matches, resultGrid);
      results.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}
