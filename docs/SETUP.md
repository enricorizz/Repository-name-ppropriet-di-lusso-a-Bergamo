# Installazione — Rizzetti Immobiliare OpenClaw

Guida passo-passo per installare e configurare il workspace.

## Prerequisiti

- Node.js >= 18.0.0 (raccomandato: Node.js 24)
- npm (incluso con Node.js)
- Accesso a Internet per installare OpenClaw

Verifica:
```bash
node --version   # deve mostrare v18+ o v24+
npm --version
```

## 1. Installa OpenClaw

```bash
npm install -g openclaw@latest
```

Verifica l'installazione:
```bash
openclaw --version
```

## 2. Esegui l'onboarding OpenClaw

L'onboarding configura il gateway locale e l'ambiente:

```bash
openclaw onboard --install-daemon
```

Questo comando:
- installa il gateway come servizio (launchd su macOS, systemd su Linux)
- guida la configurazione dei provider IA (almeno uno obbligatorio)
- opzionalmente configura canali di messaggistica

## 3. Clona questo repository

```bash
git clone https://github.com/enricorizz/Repository-name-ppropriet-di-lusso-a-Bergamo.git
cd Repository-name-ppropriet-di-lusso-a-Bergamo
```

## 4. (Opzionale) Configura le variabili d'ambiente locali

```bash
cp .env.example .env
# Modifica .env con i tuoi valori (NON committare .env)
```

## 5. Installa il workspace

```bash
bash scripts/install-workspace.sh
```

Il workspace viene copiato in `~/.openclaw/workspace`.  
I file già esistenti non vengono sovrascritti (usa `--force` per sovrascrivere tutti).

Per una destinazione alternativa:
```bash
bash scripts/install-workspace.sh --dest /percorso/personalizzato
```

## 6. Verifica l'installazione

```bash
# Stato del gateway
openclaw gateway status

# Diagnostica generale
openclaw doctor

# Test con un messaggio di prova
openclaw agent --message "Ciao, cerca appartamenti a Bergamo con 3 camere"
```

## 7. Esegui check e test locali

```bash
npm test       # test automatici (node:test)
npm run check  # verifica struttura, JSON, placeholder
npm run smoke  # smoke test funzionale
```

Tutti i test devono passare prima di procedere.

## Struttura finale attesa

```
~/.openclaw/
  workspace/
    AGENTS.md
    SOUL.md
    TOOLS.md
    README.md
    skills/
      property-search/SKILL.md
      lead-intake/SKILL.md
      visit-request/SKILL.md
```

## Passi manuali rimanenti

1. Configura almeno un provider IA tramite `openclaw onboard`
2. (Opzionale) Configura canali di messaggistica (Telegram, WhatsApp, ecc.)
3. Sostituisci `data/properties.demo.json` con il catalogo reale delle proprietà Rizzetti Immobiliare prima del go-live
4. Verifica la checklist in `docs/DEPLOYMENT-CHECKLIST.md`

Per supporto: **Info@Rizzetti.it** | Tel. **035 21 25 62** | WhatsApp **335 29 35 50**

## Note per Windows

OpenClaw supporta Windows tramite WSL2. Assicurati di avere WSL2 installato e usa bash all'interno dell'ambiente Linux.
