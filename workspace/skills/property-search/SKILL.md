---
name: property-search
description: "Cerca proprietà immobiliari nel catalogo demo della provincia di Bergamo."
metadata:
  {
    "openclaw":
      {
        "emoji": "🏠",
        "requires": { "bins": ["node"] },
      },
  }
---

# Property Search — Ricerca Proprietà Demo

Ricerca nel catalogo dimostrativo di proprietà nella provincia di Bergamo.

## Quando usare questa skill

Usa questa skill quando l'utente:
- chiede di cercare, trovare o filtrare proprietà
- vuole vedere cosa c'è disponibile in una zona, per un certo budget, con caratteristiche specifiche
- chiede: "Cosa avete a Bergamo?", "Mostrami ville con piscina", "Appartamenti sotto 300.000 euro"

## Avvio ricerca

```bash
node scripts/property-search.js [filtri]
```

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
3. Aggiungi sempre: "**Ricorda: tutti i dati sono dimostrativi. Prezzi e disponibilità vanno verificati con un operatore.**"
4. Se `count === 0`: "Non ho trovato proprietà con questi criteri nel catalogo demo. Prova ad allargare la ricerca."
5. Proponi la skill `visit-request` per le proprietà di interesse

## Limiti

- Catalogo fisso (`data/properties.demo.json`) — non interroga MLS, portali o sistemi esterni
- Prezzi non riflettono il mercato reale
- Disponibilità non verificata
