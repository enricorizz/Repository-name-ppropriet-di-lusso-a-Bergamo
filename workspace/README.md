# Workspace — Rizzetti Immobiliare Demo

Workspace OpenClaw per un assistente virtuale immobiliare dimostrativo nella provincia di Bergamo.

## Contenuto

```
AGENTS.md      Regole operative dell'agente (routing, limiti, lingua)
SOUL.md        Identità, tono e valori dell'assistente
TOOLS.md       Strumenti disponibili e come usarli
skills/
  property-search/SKILL.md   Ricerca nel catalogo demo
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

- Tutti i dati sono **dimostrativi** (`stato_demo: true`)
- Nessuna integrazione esterna inclusa
- La conferma degli appuntamenti richiede sempre un operatore umano

## Personalizzazione

- Sostituisci `../data/properties.demo.json` con il catalogo reale
- Configura provider IA e canali tramite `openclaw onboard`
- Adatta `SOUL.md` e `AGENTS.md` all'identità reale dell'agenzia
