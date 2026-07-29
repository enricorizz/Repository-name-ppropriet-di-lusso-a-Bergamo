# Rizzetti Immobiliare — Luxury Living Bergamo

Sito web e **agente IA (Concierge)** per la vendita di **proprietà di lusso a Bergamo**.
Progetto reale, completo e pronto alla produzione: catalogo immobili, pagine di dettaglio,
ricerca e filtri, form di contatto con gestione lead, assistente virtuale intelligente,
SEO, pagine legali (GDPR) e deploy su più piattaforme.

> **Zero dipendenze runtime.** Il server gira solo con Node.js integrato: nessun `npm install`
> necessario per avviarlo. Il sito funziona anche come sito statico puro.

**Repository:** https://github.com/enricorizz/Repository-name-ppropriet-di-lusso-a-Bergamo

---

## ✦ Caratteristiche

- **Home** editoriale con hero, ricerca rapida, immobili in evidenza, servizi, zone, processo e testimonianze.
- **Catalogo immobili** (`immobili.html`) con filtri live per contratto, zona, tipologia, camere, budget e ordinamento.
- **Scheda immobile** (`immobile.html?slug=…`) con galleria + lightbox, dati chiave, descrizione, mappa OpenStreetMap, form di richiesta visita e immobili correlati.
- **Concierge IA**: assistente in chat presente su ogni pagina.
  - Con `ANTHROPIC_API_KEY` risponde tramite modello **Claude**, con la conoscenza del catalogo.
  - Senza chiave usa un **motore locale** (regole + catalogo reale): funziona sempre, anche offline.
- **Lead management**: i contatti vengono validati e salvati (`data/leads/`) con fallback locale/mailto lato client.
- **12 immobili** reali e coerenti (dati in `public/data/properties.json`).
- **Preferiti** salvati nel browser (localStorage).
- **Design** su misura: palette luxury (ink / avorio / oro), tipografia serif, animazioni al scroll, immagini SVG vettoriali (nessuna dipendenza da foto esterne).
- **SEO & social**: meta tag, Open Graph, JSON-LD `RealEstateAgent`, `sitemap.xml`, `robots.txt`, PWA `manifest`.
- **Accessibilità**: markup semantico, `aria-*`, focus visibile, `prefers-reduced-motion`, navigazione da tastiera.
- **Responsive** completo (desktop / tablet / mobile con menu hamburger).

---

## ✦ Avvio rapido

```bash
# 1. Avvia il server (nessuna dipendenza da installare)
npm start
# → http://localhost:3000

# In alternativa, sviluppo con auto-reload:
npm run dev
```

Verifiche opzionali:

```bash
npm run validate   # valida il dataset immobili (slug/id unici, immagini esistenti)
npm test           # test delle librerie backend
```

### Solo statico

La cartella `public/` è un sito statico completo: puoi aprirla con qualsiasi web server
statico (o servizi come GitHub Pages / Netlify). Senza backend, il Concierge usa il motore
locale e i form salvano il lead in locale offrendo un fallback via email.

---

## ✦ Configurazione (agente IA & lead)

Copia `.env.example` in `.env` e compila i valori desiderati:

```bash
cp .env.example .env
```

| Variabile            | Descrizione                                                        |
|----------------------|--------------------------------------------------------------------|
| `PORT`               | Porta del server (default `3000`).                                 |
| `ANTHROPIC_API_KEY`  | Attiva il Concierge con modello Claude. Se assente → motore locale.|
| `ANTHROPIC_MODEL`    | Modello da usare (default `claude-sonnet-5`).                      |
| `LEADS_EMAIL`        | Email di riferimento per i contatti.                               |

> Le chiavi non vengono mai committate: `.env` è in `.gitignore`.

---

## ✦ Struttura del progetto

```
.
├── server.js                 # Server Node zero-dipendenze (statico + API)
├── vercel.json               # Deploy Vercel (static + serverless functions)
├── netlify.toml              # Deploy Netlify (hosting statico)
├── api/                      # Funzioni serverless (Vercel) + librerie condivise
│   ├── contact.js            #   POST /api/contact  → gestione lead
│   ├── chat.js               #   POST /api/chat     → Concierge IA
│   └── _lib/                 #   agent.js · leads.js · util.js
├── public/                   # Sito statico
│   ├── index.html · immobili.html · immobile.html
│   ├── servizi.html · chi-siamo.html · contatti.html
│   ├── privacy.html · cookie.html · 404.html
│   ├── assets/{css,js,img}/  # design system, script, immagini SVG
│   └── data/                 # properties.json · site.json
├── scripts/validate-data.js  # validazione dataset
└── test/                     # test unitari (node:test)
```

---

## ✦ Deploy

**Vercel** (statico + API IA)
```bash
vercel            # usa vercel.json; imposta ANTHROPIC_API_KEY tra le Environment Variables
```

**Node host** (Render, Railway, Fly, VPS…)
```bash
npm start         # avvia server.js sulla porta $PORT
```

**Netlify / GitHub Pages** (solo statico)
Pubblica la cartella `public/`. Il Concierge userà il motore locale; per l'IA e il
salvataggio server-side dei lead è necessario un host Node o le serverless functions.

---

## ✦ Gestione dei contenuti

- **Immobili:** modifica `public/data/properties.json` (poi `npm run validate`).
- **Immagini:** aggiungi file in `public/assets/img/` e referenzia il nome in `image`/`gallery`.
  Le immagini attuali sono SVG vettoriali; puoi sostituirle con foto reali (`.jpg`/`.webp`).
- **Dati agenzia** (telefono, email, orari): `public/data/site.json`.

---

## ✦ Note su privacy e sicurezza

- Nessun cookie di profilazione; solo `localStorage` per i preferiti (vedi `cookie.html`).
- Input dei form validati e sanificati lato server (`api/_lib/leads.js`).
- Server statico con protezione da path traversal e header `X-Content-Type-Options`.
- I testi legali (`privacy.html`, `cookie.html`) sono modelli GDPR da completare con i dati definitivi del Titolare.

---

## Licenza

MIT © 2026 Rizzetti Immobiliare — Enrico Rizzetti
