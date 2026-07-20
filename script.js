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

function renderProperties(items) {
  grid.innerHTML = items
    .map(
      (property) => `
        <article class="property-card">
          <span class="property-card__tag">${property.label}</span>
          <h3>${property.title}</h3>
          <p>${property.description}</p>
          <div class="property-card__meta">
            ${property.details.map((detail) => `<span>${detail}</span>`).join("")}
          </div>
          <div class="property-card__price">${euro(property.price)}</div>
        </article>
      `
    )
    .join("");
}

function recommend({ tipologia, budget, priorita }) {
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
    result.textContent = `Consiglio iniziale: ${best.title} — ${best.label}, a partire da ${euro(best.price)}.`;
    renderProperties(filtered);
    return;
  }

  result.textContent =
    "Non c'è una corrispondenza perfetta con i filtri scelti. Ti mostriamo comunque la selezione premium completa.";
  renderProperties(properties);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);

  recommend({
    tipologia: data.get("tipologia"),
    budget: data.get("budget"),
    priorita: data.get("priorita"),
  });
});

renderProperties(properties);
