# Workspace — Rizzetti Immobiliare

Workspace OpenClaw per l'assistente virtuale di **Rizzetti Immobiliare**, Bergamo.

## Contatti agenzia

| Canale | Riferimento |
|--------|-------------|
| Sito web | [www.Rizzetti.it](https://www.rizzetti.it) |
| Email | Info@Rizzetti.it |
| Telefono | 035 21 25 62 |
| WhatsApp | 335 29 35 50 |

## Contenuto

```
AGENTS.md      Regole operative dell'agente (routing, limiti, lingua, contatti)
SOUL.md        Identità, tono e valori dell'assistente
TOOLS.md       Strumenti disponibili e come usarli
skills/
  property-search/SKILL.md   Ricerca nel catalogo Rizzetti Immobiliare
  lead-intake/SKILL.md       Raccolta preferenze e dati contatto
  visit-request/SKILL.md     Richiesta e validazione visita
```

## Installazione

```bash
# Da root del repository:
bash scripts/install-workspace.sh
# Il workspace viene copiato in ~/.openclaw/workspace
```

## Stato

- Il catalogo corrente (`data/properties.demo.json`) è dimostrativo (`stato_demo: true`)
- Prima del go-live sostituire con dati reali verificati
- Nessuna integrazione esterna inclusa di default
- La conferma degli appuntamenti richiede sempre un operatore umano

## Personalizzazione

- Sostituisci `../data/properties.demo.json` con il catalogo reale delle proprietà Rizzetti
- Configura provider IA e canali tramite `openclaw onboard`
- `SOUL.md` e `AGENTS.md` sono già configurati con l'identità e i contatti reali di Rizzetti Immobiliare
