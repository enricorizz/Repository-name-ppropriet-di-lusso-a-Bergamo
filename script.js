const contacts = {
  website: "https://www.rizzetti.it",
  officeEmail: "Info@Rizzetti.it",
  ownerEmail: "Enrico@Rizzetti.it",
  officePhone: "+39035212562",
  whatsapp: "39335293550",
};

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
    visual: "villa",
    area: "Città Alta",
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
    visual: "attico",
    area: "Centro città",
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
    visual: "dimora",
    area: "Collina di Bergamo",
  },
];

const grid = document.querySelector("#property-grid");
const form = document.querySelector("#advisor-form");
const result = document.querySelector("#advisor-result");

function euro(amount) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function buildInquiryMessage(property, preferences, customerName) {
  const namePrefix = customerName ? `Sono ${customerName}. ` : "";

  return (
    `${namePrefix}Mi interessa ${property.title} a ${euro(property.price)}.` +
    ` Preferenze: tipologia ${preferences.tipologia}, budget ${preferences.budgetLabel}, priorità ${preferences.priorityLabel}.`
  );
}

function whatsappHref(message) {
  return `https://wa.me/${contacts.whatsapp}?text=${encodeURIComponent(message)}`;
}

function mailtoHref(subject, body, email = contacts.officeEmail) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function renderProperties(items, preferences) {
  const priorityLabel = preferences?.priorityLabel ?? "Consulenza su misura";

  grid.innerHTML = items
    .map((property) => {
      const baseMessage = buildInquiryMessage(property, preferences ?? defaultPreferences(), "");
      const whatsappLink = whatsappHref(baseMessage);
      const emailLink = mailtoHref(`Richiesta informazioni: ${property.title}`, baseMessage);

      return `
        <article class="property-card">
          <div class="property-card__visual property-card__visual--${property.visual}">
            <div class="property-card__scene">
              <span>${property.area}</span>
              <span>${priorityLabel} · Visual placeholder premium</span>
            </div>
          </div>
          <span class="property-card__tag">${property.label}</span>
          <h3>${property.title}</h3>
          <p>${property.description}</p>
          <div class="property-card__meta">
            ${property.details.map((detail) => `<span>${detail}</span>`).join("")}
          </div>
          <div class="property-card__price">${euro(property.price)}</div>
          <div class="property-card__actions">
            <a class="button button--secondary" href="${emailLink}">Richiedi dettagli</a>
            <a class="button button--primary" href="${whatsappLink}" target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </article>
      `;
    })
    .join("");
}

function defaultPreferences() {
  return {
    tipologia: "tutte",
    budget: "tutti",
    priorityLabel: "Consulenza su misura",
    budgetLabel: "libero",
  };
}

function renderRecommendation(property, preferences, customerName) {
  const inquiry = buildInquiryMessage(property, preferences, customerName);
  const safeName = customerName ? `${escapeHtml(customerName)}, ` : "";

  result.innerHTML = `
    <div>
      <strong>${safeName}consiglio iniziale:</strong>
      ${escapeHtml(property.title)} — ${escapeHtml(property.label)}, a partire da ${escapeHtml(euro(property.price))}.
    </div>
    <div>Apri subito il contatto nel canale che preferisci con un messaggio già precompilato.</div>
    <div class="advisor-result__actions">
      <a class="button button--primary" href="${whatsappHref(inquiry)}" target="_blank" rel="noreferrer">Invia via WhatsApp</a>
      <a class="button button--secondary" href="${mailtoHref(`Richiesta consulenza: ${property.title}`, inquiry)}">Invia via email</a>
      <a class="button button--secondary" href="tel:${contacts.officePhone}">Chiama ufficio</a>
    </div>
  `;
}

function recommend({ tipologia, budget, priorita, nome }) {
  const preferences = {
    tipologia,
    budget,
    priorityLabel:
      {
        vista: "Vista panoramica",
        privacy: "Massima privacy",
        posizione: "Posizione centrale",
      }[priorita] ?? "Consulenza su misura",
    budgetLabel:
      {
        tutti: "qualsiasi budget",
        1500000: "fino a €1,5M",
        2500000: "fino a €2,5M",
        9999999: "oltre €2,5M",
      }[budget] ?? "qualsiasi budget",
  };

  const filtered = properties
    .filter((property) => {
      const typeMatch = tipologia === "tutte" || property.type === tipologia;
      const budgetMatch =
        budget === "tutti" ||
        (budget === "1500000" && property.price <= 1500000) ||
        (budget === "2500000" && property.price <= 2500000) ||
        (budget === "9999999" && property.price > 2500000);

      return typeMatch && budgetMatch;
    })
    .sort((first, second) => {
      const firstScore = Number(first.priority === priorita);
      const secondScore = Number(second.priority === priorita);

      if (firstScore !== secondScore) {
        return secondScore - firstScore;
      }

      return first.price - second.price;
    });

  if (filtered.length > 0) {
    const best = filtered[0];
    renderRecommendation(best, preferences, nome?.trim());
    renderProperties(filtered, preferences);
    return;
  }

  result.textContent =
    "Non c'è una corrispondenza perfetta con i filtri scelti. Ti mostriamo comunque la selezione premium completa.";
  renderProperties(properties, preferences);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    });
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  recommend({
    nome: data.get("nome"),
    tipologia: data.get("tipologia"),
    budget: data.get("budget"),
    priorita: data.get("priorita"),
  });
});

renderProperties(properties, defaultPreferences());
registerServiceWorker();
