# Checklist Deployment — Rizzetti Immobiliare OpenClaw

Checklist da verificare prima di mettere in produzione l'assistente.  
**Non pre-compilare le checkbox:** spuntale solo dopo aver effettivamente eseguito e verificato ogni punto.

---

## 1. Ambiente tecnico

- [ ] Node.js >= 18 installato e verificato (`node --version`)
- [ ] OpenClaw installato (`openclaw --version`)
- [ ] Gateway in esecuzione (`openclaw gateway status`)
- [ ] `openclaw doctor` senza errori bloccanti
- [ ] Almeno un provider IA configurato e funzionante

## 2. Workspace

- [ ] Workspace installato in `~/.openclaw/workspace` (`bash scripts/install-workspace.sh`)
- [ ] `AGENTS.md`, `SOUL.md`, `TOOLS.md` presenti nella destinazione
- [ ] Tutte e tre le skill installate (`property-search`, `lead-intake`, `visit-request`)
- [ ] Messaggio di prova funzionante (`openclaw agent --message "test"`)

## 3. Catalogo

- [ ] Catalogo demo sostituito con dati reali verificati (o decisione consapevole di usare demo)
- [ ] Ogni record con `stato_demo: false` ha dati accurati e `nota_verifica` aggiornata
- [ ] Disclaimer rimosso o aggiornato per i dati reali
- [ ] Almeno un test di ricerca eseguito con i dati reali

## 4. Test e qualità

- [ ] `npm test` — tutti i test passati (0 falliti)
- [ ] `npm run check` — tutti i check superati
- [ ] `npm run smoke` — smoke test superati
- [ ] JSON validi verificati per tutti i file di dati e configurazione
- [ ] Nessun segreto o placeholder reale committato (verifica con `npm run check`)

## 5. Sicurezza e privacy

- [ ] File `.env` non committato nel repository
- [ ] Nessuna API key o token nel codice versionato
- [ ] Informativa privacy predisposta per gli utenti finali
- [ ] Responsabile del trattamento dati nominato
- [ ] Policy di retention dei lead decisa e implementata

## 6. Canali di comunicazione (se applicabile)

- [ ] Canale (Telegram/Discord/Slack/altro) configurato tramite `openclaw onboard`
- [ ] Test end-to-end sul canale reale
- [ ] Messaggio di benvenuto/disclaimer configurato nel canale

## 7. Documentazione

- [ ] `README.md` aggiornato con dati reali dell'agenzia (se diversi dalla demo)
- [ ] Contatti reali dell'agenzia aggiunti (se desiderato)
- [ ] Licenza scelta e file `LICENSE` aggiunto al repository

## 8. Licenza

- [ ] Licenza del repository scelta dal proprietario
- [ ] File `LICENSE` aggiunto (o nota esplicita che la licenza è da definire)

---

## Note

- Questa checklist è da completare manualmente dal responsabile tecnico
- Non risultati precompilati o dichiarazioni automatiche di conformità
- Il solo fatto di spuntare le checkbox non garantisce la conformità: ogni punto richiede verifica reale
