---
name: visit-request
description: "Registra e valida una richiesta di visita per una proprietà del catalogo demo."
metadata:
  {
    "openclaw":
      {
        "emoji": "📅",
        "requires": { "bins": ["node"] },
      },
  }
---

# Visit Request — Richiesta di Visita

Raccoglie e valida una richiesta di visita a una proprietà del catalogo demo.

## Quando usare questa skill

Usa questa skill quando l'utente:
- vuole visitare una proprietà
- chiede di fissare un appuntamento
- dice "vorrei vederla", "posso venire a visitarla?", "quando posso vederla?"

## Informazioni da raccogliere

### Obbligatorie
- `property_id` — ID della proprietà (es. `BG-2026-001`)
- `nome` — Nome dell'utente
- `email` — Email per la conferma
- `data_preferita` — Data preferita (formato YYYY-MM-DD, deve essere futura)

### Opzionali
- `fascia_oraria` — mattina, pomeriggio, sera, qualsiasi
- `telefono`
- `note` — Massimo 500 caratteri

## Validazione richiesta

```bash
echo '{"property_id":"BG-2026-001","nome":"Mario","email":"mario@test.it","data_preferita":"2026-09-15","fascia_oraria":"mattina"}' \
  | node scripts/visit-request.js
```

Se `valid: false`, mostra gli errori e chiedi all'utente di correggere.

## Comportamento obbligatorio

⚠️ **Questa skill NON conferma appuntamenti.**

Dopo una validazione positiva, comunica **sempre**:

"Ho registrato la tua richiesta di visita per [titolo proprietà] il [data]. **Questa non è una conferma definitiva.** Un operatore verificherà la disponibilità e ti contatterà all'email [email] per confermare l'appuntamento."

## Limiti

- Nessun accesso a calendario reale
- Nessuna notifica automatica agli operatori (senza integrazione configurata)
- La data preferita è indicativa, non prenotata
- La disponibilità della proprietà non è verificata in tempo reale
