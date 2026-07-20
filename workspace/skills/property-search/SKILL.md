---
name: property-search
description: "Cerca proprietà immobiliari nel catalogo di Rizzetti Immobiliare nella provincia di Bergamo."
metadata:
  {
    "openclaw":
      {
        "emoji": "🏠",
        "requires": { "bins": ["node"] },
      },
  }
---

# Property Search — Ricerca Proprietà Rizzetti Immobiliare

Ricerca nel catalogo proprietà Rizzetti Immobiliare per la provincia di Bergamo.

## Quando usare questa skill

Usa questa skill quando l'utente:
- chiede di cercare, trovare o filtrare proprietà
- vuole vedere cosa c'è disponibile in una zona, per un certo budget, con caratteristiche specifiche
- chiede: "Cosa avete a Bergamo?", "Mostrami ville con piscina", "Appartamenti sotto 300.000 euro"

## Avvio ricerca

### Filtri disponibili

| Parametro | Esempio | Descrizione |
|-----------|---------|-------------|
| `--budget-max N` | `--budget-max 400000` | Prezzo massimo (EUR) |
| `--budget-min N` | `--budget-min 200000` | Prezzo minimo (EUR) |
| `--comune STR` | `--comune Bergamo` | Filtra per comune |
| `--zona STR` | `--zona Alta` | Filtra per zona (parziale) |
| `--tipologia STR` | `--tipologia villa` | Tipo immobile |
| `--camere-min N` | `--camere-min 3` | Numero minimo camere |
| `--superficie-min N` | `--superficie-min 100` | Superficie minima (mq) |
| `--superficie-max N` | `--superficie-max 200` | Superficie massima (mq) |
| `--caratteristica STR` | `--caratteristica piscina` | Caratteristica (ripetibile) |
| `--sort CHIAVE` | `--sort prezzo-asc` | Ordinamento (prezzo-asc, prezzo-desc, superficie-asc, superficie-desc) |

## Output

```json
{
  "results": [ { "id": "BG-2026-001", ... } ],
  "count": 3,
  "disclaimer": "DATI DIMOSTRATIVI..."
}
```

## Comportamento dopo la ricerca

1. Mostra i risultati in formato leggibile (titolo, comune/zona, prezzo, camere, tipologia)
2. Includi sempre la `nota_verifica` di ogni record
3. Aggiungi sempre: "**Prezzi e disponibilità vanno verificati con un operatore Rizzetti Immobiliare (Info@Rizzetti.it | 035 21 25 62).**"
4. Se `count === 0`: "Non ho trovato proprietà con questi criteri. Prova ad allargare la ricerca o contatta direttamente l'agenzia."
5. Proponi la skill `visit-request` per le proprietà di interesse

## Limiti

- Catalogo locale (`data/properties.demo.json`) — non interroga MLS, portali o sistemi esterni in tempo reale
- Disponibilità non verificata in tempo reale
