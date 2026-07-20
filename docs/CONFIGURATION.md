# Configurazione — Rizzetti Immobiliare OpenClaw

## Catalogo proprietà

### Sostituire il catalogo demo

Il file `data/properties.demo.json` contiene dati fittizi.  
Per usare dati reali:

1. Crea un nuovo file seguendo lo schema in `data/property.schema.json`
2. Imposta `stato_demo: false` per le proprietà reali
3. Aggiorna `nota_verifica` con informazioni accurate
4. Aggiorna la variabile d'ambiente (opzionale):

```bash
# Nel file .env
CATALOG_PATH=/percorso/al/catalogo-reale.json
```

### Schema obbligatorio

Ogni proprietà deve avere i campi definiti in `data/property.schema.json`.  
Campi obbligatori: `id`, `titolo`, `comune`, `zona`, `tipologia`, `prezzo`, `valuta`, `superficie_mq`, `camere`, `bagni`, `caratteristiche`, `stato`, `stato_demo`, `nota_verifica`.

### Formato ID

Gli ID seguono il pattern `BG-YYYY-NNN` (es. `BG-2026-001`).  
Adatta il pattern se necessario modificando `PROPERTY_ID_RE` in `scripts/visit-request.js`.

## Personalizzare il workspace

### Identità dell'agente (`workspace/SOUL.md`)

Modifica per adattare:
- Nome/brand dell'agenzia
- Tono di comunicazione
- Messaggi di apertura

### Regole operative (`workspace/AGENTS.md`)

Modifica per:
- Aggiungere nuove skill
- Aggiornare il routing
- Personalizzare le risposte di fallback

### Strumenti aggiuntivi (`workspace/TOOLS.md`)

Documenta qui ogni nuovo tool o integrazione aggiunta.

## Configurazione provider IA e canali

**Questa configurazione è gestita interamente da OpenClaw** tramite:

```bash
openclaw onboard --install-daemon
```

Non inserire mai API key o token in file committati nel repository.  
Usa `.env` (non committato) o le variabili d'ambiente del sistema.

Documentazione ufficiale: https://github.com/openclaw/openclaw

## Configurazione gateway

Il file di configurazione principale di OpenClaw è `~/.openclaw/openclaw.json`.  
Non è incluso in questo repository perché contiene configurazione specifica dell'installazione.

Per documentazione su `openclaw.json`: https://github.com/openclaw/openclaw

## Aggiungere una nuova skill

1. Crea `workspace/skills/<nome-skill>/SKILL.md` seguendo il formato degli esempi esistenti
2. (Opzionale) Crea `scripts/<nome-skill>.js` con logica locale
3. Aggiorna `workspace/AGENTS.md` con il routing per la nuova skill
4. Aggiorna `workspace/TOOLS.md` con la documentazione del tool
5. Aggiungi test in `test/<nome-skill>.test.js`
6. Esegui `npm test` e `npm run check`
