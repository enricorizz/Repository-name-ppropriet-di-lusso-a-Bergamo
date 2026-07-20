---
name: lead-intake
description: "Raccoglie e valida le preferenze e i dati di contatto di un potenziale cliente."
metadata:
  {
    "openclaw":
      {
        "emoji": "📋",
        "requires": { "bins": ["node"] },
      },
  }
---

# Lead Intake — Raccolta Preferenze e Dati Contatto

Raccoglie in modo strutturato le preferenze di acquisto/affitto e i dati di contatto dell'utente.

## Quando usare questa skill

Usa questa skill quando l'utente:
- vuole essere ricontattato
- desidera lasciare i propri dati
- chiede informazioni approfondite che richiedono un operatore
- vuole ricevere una selezione personalizzata di proprietà

## Informazioni da raccogliere

### Obbligatorie
- **Nome** (primo contatto, non il nome completo se l'utente non lo fornisce)
- **Email** (per risposta da parte dell'operatore)

### Opzionali (raccogli solo se l'utente le fornisce spontaneamente)
- Cognome
- Telefono
- Tipo di interesse: acquisto, affitto, vendita, valutazione, informazioni
- Budget minimo indicativo (`budget_min`)
- Budget massimo indicativo (`budget_max`)
- Messaggio libero

## Informativa privacy (obbligatoria prima della raccolta)

Prima di raccogliere qualsiasi dato, di' all'utente:

"Per rispondere alla tua richiesta ho bisogno di alcune informazioni. I dati che fornisci saranno usati esclusivamente per contattarti in risposta a questa richiesta. Non verranno condivisi con terzi senza il tuo consenso. Puoi chiedere in qualsiasi momento di modificarli o cancellarli."

## Validazione dati

```bash
echo '{"nome":"...","email":"...","interesse":"acquisto","budget_min":100000,"budget_max":400000}' \
  | node scripts/lead-validate.js
```

Se `valid: false`, mostra gli errori all'utente e chiedi di correggerli.

## Output e comportamento

1. Dopo la raccolta, mostra all'utente i dati normalizzati per conferma
2. Comunica: "Ho registrato la tua richiesta. Un operatore ti contatterà all'email indicata."
3. **Non promettere tempi di risposta specifici**
4. Non trasmettere i dati a sistemi esterni senza integrazione esplicitamente configurata

## Dati NON da raccogliere

- Codice fiscale, carta d'identità, passaporto
- IBAN, carte di credito, dati bancari
- Dati sanitari, politici, religiosi
- Password o credenziali di qualsiasi tipo
