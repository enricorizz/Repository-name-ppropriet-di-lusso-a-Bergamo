# Rizzetti Immobiliare Agent

Esperienza digitale in italiano per la promozione di proprietà di lusso a Bergamo, progettata con approccio mobile-first, contatti reali integrati e ottimizzazione anche per iPhone.

## Contenuto della repository

- `index.html` — landing page principale con hero, proprietà, contatti diretti, sezione PWA e richiesta consulenza
- `styles.css` — stile mobile-first con attenzione a leggibilità, tap target, CTA mobili e layout iPhone-friendly
- `script.js` — logica client-side per raccomandazioni rapide, rendering delle proprietà e generazione dei contatti precompilati
- `manifest.webmanifest` — configurazione PWA installabile
- `service-worker.js` — cache essenziale per riapertura più rapida
- `icons/` — icone per manifest e Home Screen

## Avvio rapido

Apri direttamente `index.html` in un browser moderno.

Se preferisci un server locale:

```bash
python3 -m http.server 4173
```

Poi visita `http://localhost:4173`.

## Obiettivi raggiunti

- interfaccia completamente in italiano
- esperienza mobile-first adatta a Safari su iPhone
- presentazione premium per immobili di lusso
- richiesta guidata per ricevere una selezione iniziale di proprietà
- contatti diretti via telefono, email e WhatsApp
- supporto PWA installabile con configurazione dedicata

## Note

Il progetto è statico e non richiede dipendenze esterne per funzionare.
