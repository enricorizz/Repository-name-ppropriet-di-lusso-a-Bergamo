# Troubleshooting — Rizzetti Immobiliare OpenClaw

## Diagnostica rapida

```bash
openclaw doctor        # verifica globale dell'installazione
openclaw gateway status  # stato del gateway locale
node --version         # deve essere >=18
```

---

## Problemi comuni

### `openclaw: command not found`

**Causa:** OpenClaw non installato o non nel PATH.

**Soluzione:**
```bash
npm install -g openclaw@latest
# Poi riavvia il terminale o esegui:
export PATH="$(npm bin -g):$PATH"
```

---

### `openclaw gateway status` — gateway non in esecuzione

**Causa:** Il daemon non è avviato.

**Soluzione:**
```bash
openclaw gateway start
# oppure, se configurato come servizio:
# macOS:
launchctl start com.openclaw.gateway
# Linux:
systemctl --user start openclaw
```

---

### Errore `OPENCLAW_GATEWAY_TOKEN` non impostato

**Causa:** Token gateway mancante o non configurato.

**Soluzione:** Esegui l'onboarding completo:
```bash
openclaw onboard --install-daemon
```
Non impostare manualmente un token di esempio: il gateway rifiuterà i placeholder.

---

### `npm test` — test falliti

**Causa possibile 1:** Node.js < 18 (node:test non disponibile).
```bash
node --version  # deve essere v18+
```

**Causa possibile 2:** File del catalogo non trovato.
```bash
ls data/properties.demo.json  # deve esistere
```

**Causa possibile 3:** JSON malformato nel catalogo.
```bash
node -e "JSON.parse(require('fs').readFileSync('data/properties.demo.json','utf8'))"
```

---

### `npm run check` — errori di struttura

**Causa:** File obbligatori mancanti o JSON non valido.

**Soluzione:** Controlla l'output del check per il file specifico, poi ricrea o correggi il file.

---

### Script bash non eseguibili (`Permission denied`)

**Causa:** Permessi di esecuzione mancanti.

**Soluzione:**
```bash
chmod +x scripts/*.sh
```

---

### `property-search.js` non trova il catalogo

**Causa:** Il percorso predefinito (`data/properties.demo.json`) non è relativo alla directory corrente.

**Soluzione:** Esegui sempre gli script dalla root del repository:
```bash
cd /percorso/al/repository
node scripts/property-search.js --budget-max 400000
```

Oppure imposta `CATALOG_PATH`:
```bash
CATALOG_PATH=/percorso/assoluto/al/catalogo.json node scripts/property-search.js
```

---

### Messaggio di prova OpenClaw non funziona

```bash
openclaw agent --message "test"
```

Verifica:
1. `openclaw gateway status` — il gateway è in esecuzione?
2. `openclaw doctor` — c'è almeno un provider IA configurato?
3. Il workspace è installato in `~/.openclaw/workspace`?

---

## Log utili

```bash
# Log del gateway (macOS)
tail -f ~/Library/Logs/openclaw/gateway.log

# Log del gateway (Linux)
journalctl --user -u openclaw -f
```

---

## Contatti e supporto

Per problemi specifici di OpenClaw: https://github.com/openclaw/openclaw/issues  
Per problemi di questo workspace: apri una issue nel repository corrente.
