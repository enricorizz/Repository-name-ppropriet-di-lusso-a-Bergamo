# Rizzetti Immobiliare — Workspace OpenClaw

Kit di configurazione per l'assistente virtuale di **Rizzetti Immobiliare**, basato su [OpenClaw](https://github.com/openclaw/openclaw), operante nella provincia di Bergamo.

---

## Rizzetti Immobiliare

| | |
|---|---|
| 🌐 Sito | [www.Rizzetti.it](https://www.rizzetti.it) |
| 📧 Email | [Info@Rizzetti.it](mailto:Info@Rizzetti.it) |
| 📞 Telefono | [035 21 25 62](tel:+390352125 62) |
| 💬 WhatsApp | [335 29 35 50](https://wa.me/393352935 50) |

> **Stato:** Demo / Configurazione di riferimento — il catalogo proprietà è fittizio a scopo dimostrativo. Prima del go-live sostituire con dati reali.  
> **Identità e contatti agente:** già configurati con i dati reali di Rizzetti Immobiliare.

---

## Cos'è questo progetto

Un workspace e configuration kit per OpenClaw che permette di avviare l'assistente virtuale di Rizzetti Immobiliare, capace di:

- cercare nel catalogo di proprietà (Bergamo e provincia);
- raccogliere le preferenze di acquisto/affitto di un utente;
- ricevere e validare richieste di visita (senza confermare appuntamenti in autonomia);
- comunicare in italiano professionale, rimandando all'agenzia per qualsiasi conferma o consulenza.

**Cosa NON fa questo kit:**  
Non include backend, CRM reale, integrazioni di calendario, provider IA, canali di messaggistica o credenziali. Tutto ciò va configurato tramite l'onboarding ufficiale di OpenClaw.

---

## Quick Start

### 1. Installa OpenClaw

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### 2. Clona questo repository

```bash
git clone https://github.com/enricorizz/Repository-name-ppropriet-di-lusso-a-Bergamo.git
cd Repository-name-ppropriet-di-lusso-a-Bergamo
```

### 3. Installa il workspace

```bash
bash scripts/install-workspace.sh
```

Il workspace viene copiato in `~/.openclaw/workspace` (o nella destinazione configurata).  
I file esistenti non vengono sovrascritti senza consenso esplicito.

### 4. Verifica

```bash
openclaw gateway status
openclaw doctor
openclaw agent --message "Ciao, cerca appartamenti a Bergamo con 3 camere"
```

### 5. Esegui test e check locali

```bash
npm test
npm run check
```

---

## Struttura del progetto

```
workspace/           # Workspace OpenClaw (copia in ~/.openclaw/workspace)
  AGENTS.md          # Regole operative dell'agente
  SOUL.md            # Identità e comportamento
  TOOLS.md           # Strumenti disponibili
  README.md          # Guida al workspace
  skills/
    property-search/ # Ricerca proprietà nel catalogo demo
    lead-intake/     # Raccolta dati contatto
    visit-request/   # Richiesta e validazione visita

data/
  properties.demo.json  # Catalogo demo (dati fittizi)
  property.schema.json  # Schema JSON documentale

examples/               # Input di esempio per le skill

scripts/
  install-workspace.sh  # Copia workspace in ~/.openclaw/workspace
  check.sh              # Verifiche locali (JSON, struttura, placeholder)
  smoke-test.sh         # Test funzionale minimo

test/                   # Test automatici (node:test)

docs/
  SETUP.md              # Installazione passo passo
  CONFIGURATION.md      # Personalizzazione workspace e catalogo
  TROUBLESHOOTING.md    # Diagnostica
  PRIVACY-AND-SAFETY.md # Note su privacy e minimizzazione dati
  DEPLOYMENT-CHECKLIST.md # Checklist pre-go-live

.env.example            # Variabili d'ambiente (senza segreti)
.gitignore
package.json
```

---

## Limiti e avvertenze

- I dati delle proprietà sono **completamente fittizi** e non rappresentano annunci reali.
- L'assistente **non può** confermare appuntamenti, fornire valutazioni vincolanti o consulenza legale/fiscale/finanziaria.
- Provider IA, canali (Telegram, WhatsApp, ecc.) e credenziali non sono inclusi: vanno configurati tramite l'onboarding OpenClaw.
- Il catalogo demo va sostituito con dati reali e verificati prima di qualsiasi uso in produzione.

---

## Licenza

La licenza va scelta dal proprietario del repository. Non è attribuita automaticamente.  
Vedi [docs/DEPLOYMENT-CHECKLIST.md](docs/DEPLOYMENT-CHECKLIST.md) per i passi manuali prima del go-live.

---

## Documentazione

- [Installazione dettagliata](docs/SETUP.md)
- [Configurazione](docs/CONFIGURATION.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Privacy e sicurezza dei dati](docs/PRIVACY-AND-SAFETY.md)
- [Checklist deployment](docs/DEPLOYMENT-CHECKLIST.md)
