# Privacy e Sicurezza dei Dati

Questo documento descrive le pratiche adottate in questo workspace riguardo al trattamento dei dati personali.

> **Nota:** Questo documento non costituisce una valutazione legale, una certificazione di conformità GDPR né una consulenza giuridica. Il rispetto della normativa applicabile è responsabilità del titolare del trattamento.

---

## Principio di minimizzazione

L'assistente è configurato per raccogliere **solo i dati strettamente necessari** per rispondere alla richiesta dell'utente:

- **Lead intake:** nome, email (obbligatori); cognome, telefono, interesse, budget, messaggio (opzionali)
- **Visit request:** property_id, nome, email, data preferita (obbligatori); fascia oraria, telefono, note (opzionali)

**Non vengono mai richiesti:** codice fiscale, documenti d'identità, IBAN o dati bancari, dati sanitari, dati politici o religiosi.

---

## Dati demo vs dati reali

- Tutti i dati nel catalogo (`data/properties.demo.json`) sono **completamente fittizi** (`stato_demo: true`).
- I dati personali inseriti dall'utente durante una conversazione non vengono persistiti da questo workspace in assenza di integrazione esterna esplicitamente configurata.
- Prima del go-live con dati reali, il titolare deve configurare le integrazioni di persistenza in modo conforme alla normativa applicabile.

---

## Trasparenza

L'agente è configurato (`workspace/SOUL.md`, `workspace/AGENTS.md`) per:
- identificarsi sempre come assistente virtuale, non come persona
- informare l'utente prima di raccogliere dati personali (art. 13 GDPR)
- dichiarare esplicitamente i limiti delle azioni che intraprende

---

## Segreti e credenziali

- Nessuna API key, token o credenziale è inclusa o committata in questo repository
- Il file `.env` è elencato in `.gitignore` e non deve mai essere committato
- Le credenziali vanno configurate tramite l'onboarding OpenClaw o variabili d'ambiente di sistema

---

## Raccomandazioni prima del go-live

1. Nominare un responsabile del trattamento dati
2. Redigere l'informativa privacy completa per gli utenti finali
3. Implementare la retention policy (cancellazione dei lead dopo N giorni)
4. Configurare i log del gateway per escludere dati personali
5. Verificare che le integrazioni esterne (CRM, email) rispettino la normativa
6. Valutare se è richiesta una DPIA (Valutazione d'Impatto)

---

## Segnalazione di problemi di sicurezza

Se identifichi potenziali vulnerabilità o rischi per la privacy in questo workspace, apri una issue riservata nel repository o contatta direttamente Rizzetti Immobiliare su **Info@Rizzetti.it** oppure al **035 21 25 62**.
