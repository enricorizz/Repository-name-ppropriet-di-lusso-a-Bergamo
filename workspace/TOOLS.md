# TOOLS.md — Strumenti disponibili

Questo workspace usa strumenti locali e deterministici. Nessuna chiamata a servizi esterni è inclusa di default.

## Strumenti locali

### property-search

Cerca nel catalogo demo (`data/properties.demo.json`).

```bash
# CLI diretta
node scripts/property-search.js --budget-max 400000 --comune Bergamo

# Con più filtri
node scripts/property-search.js \
  --budget-min 200000 \
  --budget-max 600000 \
  --tipologia appartamento \
  --camere-min 3 \
  --caratteristica piscina
```

Output: `{ results: [...], count: N, disclaimer: "..." }`

### lead-validate

Valida e normalizza i dati di un lead (richiesta di contatto).

```bash
echo '{"nome":"Mario","email":"mario@test.it","interesse":"acquisto"}' \
  | node scripts/lead-validate.js
```

Output: `{ valid: true|false, normalized: {...}, errors: [...] }`

### visit-request

Valida una richiesta di visita (non conferma l'appuntamento).

```bash
echo '{"property_id":"BG-2026-001","nome":"Mario Rossi","email":"mario@test.it","data_preferita":"2026-09-15"}' \
  | node scripts/visit-request.js
```

Output: `{ valid: true|false, normalized: {...}, errors: [...], avviso: "..." }`

## Strumenti NON inclusi (configurazione esterna)

I seguenti strumenti richiedono configurazione tramite `openclaw onboard`:

- **Provider IA** (OpenAI, Anthropic, Gemini): configurati tramite variabili d'ambiente
- **Canali di messaggistica** (Telegram, Discord, Slack): configurati tramite `openclaw.json`
- **CRM o calendario**: non inclusi in questo workspace; richiedono sviluppo custom

Per aggiungere integrazioni, seguire: https://github.com/openclaw/openclaw

## Verifica strumenti disponibili

```bash
openclaw gateway status
openclaw doctor
node --version   # deve essere >=18
```
