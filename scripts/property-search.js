#!/usr/bin/env node
/**
 * property-search.js — Ricerca nel catalogo demo di proprietà
 *
 * Utilizzo:
 *   node scripts/property-search.js [opzioni]
 *
 * Opzioni (JSON su stdin o argomenti CLI):
 *   --budget-max <numero>      Prezzo massimo in EUR
 *   --budget-min <numero>      Prezzo minimo in EUR
 *   --comune <stringa>         Filtra per comune (case-insensitive)
 *   --zona <stringa>           Filtra per zona (case-insensitive, parziale)
 *   --tipologia <stringa>      Filtra per tipo (appartamento, villa, ecc.)
 *   --camere-min <numero>      Numero minimo di camere
 *   --superficie-min <numero>  Superficie minima in mq
 *   --superficie-max <numero>  Superficie massima in mq
 *   --caratteristica <str>     Filtra per caratteristica (parziale, ripetibile)
 *   --sort <chiave>            Ordinamento: prezzo-asc, prezzo-desc, superficie-asc, superficie-desc
 *   --catalog <percorso>       Percorso al file JSON del catalogo
 *
 * Output: JSON su stdout { results: [...], count: N, disclaimer: "..." }
 * Exit codes: 0 = successo, 1 = input non valido, 2 = errore I/O
 */

'use strict';

const fs = require('node:fs');
const path = require('node:path');

const DISCLAIMER = 'DATI DIMOSTRATIVI — Nessuna proprietà è reale. Prezzi e disponibilità da verificare con operatore.';

const SORT_KEYS = ['prezzo-asc', 'prezzo-desc', 'superficie-asc', 'superficie-desc'];

function parseArgs(argv) {
  const args = {};
  const caratteristiche = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--budget-max' && argv[i + 1]) args.budgetMax = Number(argv[++i]);
    else if (a === '--budget-min' && argv[i + 1]) args.budgetMin = Number(argv[++i]);
    else if (a === '--comune' && argv[i + 1]) args.comune = argv[++i];
    else if (a === '--zona' && argv[i + 1]) args.zona = argv[++i];
    else if (a === '--tipologia' && argv[i + 1]) args.tipologia = argv[++i];
    else if (a === '--camere-min' && argv[i + 1]) args.camereMin = Number(argv[++i]);
    else if (a === '--superficie-min' && argv[i + 1]) args.superficieMin = Number(argv[++i]);
    else if (a === '--superficie-max' && argv[i + 1]) args.superficieMax = Number(argv[++i]);
    else if (a === '--sort' && argv[i + 1]) args.sort = argv[++i];
    else if (a === '--caratteristica' && argv[i + 1]) caratteristiche.push(argv[++i]);
    else if (a === '--catalog' && argv[i + 1]) args.catalog = argv[++i];
  }
  if (caratteristiche.length > 0) args.caratteristiche = caratteristiche;
  return args;
}

function validateFilters(filters) {
  const errors = [];
  if (filters.budgetMax !== undefined) {
    if (isNaN(filters.budgetMax) || filters.budgetMax < 0) errors.push('--budget-max deve essere un numero positivo');
  }
  if (filters.budgetMin !== undefined) {
    if (isNaN(filters.budgetMin) || filters.budgetMin < 0) errors.push('--budget-min deve essere un numero positivo');
  }
  if (filters.budgetMin !== undefined && filters.budgetMax !== undefined && filters.budgetMin > filters.budgetMax) {
    errors.push('--budget-min non può essere maggiore di --budget-max');
  }
  if (filters.camereMin !== undefined) {
    if (isNaN(filters.camereMin) || filters.camereMin < 0) errors.push('--camere-min deve essere un numero positivo');
  }
  if (filters.superficieMin !== undefined) {
    if (isNaN(filters.superficieMin) || filters.superficieMin < 0) errors.push('--superficie-min deve essere un numero positivo');
  }
  if (filters.superficieMax !== undefined) {
    if (isNaN(filters.superficieMax) || filters.superficieMax < 0) errors.push('--superficie-max deve essere un numero positivo');
  }
  if (filters.superficieMin !== undefined && filters.superficieMax !== undefined && filters.superficieMin > filters.superficieMax) {
    errors.push('--superficie-min non può essere maggiore di --superficie-max');
  }
  if (filters.sort !== undefined && !SORT_KEYS.includes(filters.sort)) {
    errors.push(`--sort non valido. Valori ammessi: ${SORT_KEYS.join(', ')}`);
  }
  return errors;
}

function loadCatalog(catalogPath) {
  const resolved = path.resolve(catalogPath);
  const raw = fs.readFileSync(resolved, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data.properties)) throw new Error('Il catalogo non contiene un array "properties"');
  return data.properties;
}

function search(properties, filters) {
  const results = properties.filter((p) => {
    if (filters.budgetMax !== undefined && p.prezzo > filters.budgetMax) return false;
    if (filters.budgetMin !== undefined && p.prezzo < filters.budgetMin) return false;
    if (filters.comune) {
      if (!p.comune.toLowerCase().includes(filters.comune.toLowerCase())) return false;
    }
    if (filters.zona) {
      if (
        !p.zona.toLowerCase().includes(filters.zona.toLowerCase()) &&
        !p.comune.toLowerCase().includes(filters.zona.toLowerCase())
      )
        return false;
    }
    if (filters.tipologia) {
      if (p.tipologia.toLowerCase() !== filters.tipologia.toLowerCase()) return false;
    }
    if (filters.camereMin !== undefined && p.camere < filters.camereMin) return false;
    if (filters.superficieMin !== undefined && p.superficie_mq < filters.superficieMin) return false;
    if (filters.superficieMax !== undefined && p.superficie_mq > filters.superficieMax) return false;
    if (filters.caratteristiche && filters.caratteristiche.length > 0) {
      for (const req of filters.caratteristiche) {
        const found = p.caratteristiche.some((c) => c.toLowerCase().includes(req.toLowerCase()));
        if (!found) return false;
      }
    }
    return true;
  });

  if (filters.sort) {
    const [field, dir] = filters.sort.split('-');
    const key = field === 'prezzo' ? 'prezzo' : 'superficie_mq';
    const factor = dir === 'asc' ? 1 : -1;
    results.sort((a, b) => factor * (a[key] - b[key]));
  }

  return results;
}

function main() {
  const filters = parseArgs(process.argv);

  const validationErrors = validateFilters(filters);
  if (validationErrors.length > 0) {
    process.stderr.write(JSON.stringify({ error: 'Input non valido', details: validationErrors }) + '\n');
    process.exit(1);
  }

  const defaultCatalog = path.join(__dirname, '..', 'data', 'properties.demo.json');
  const catalogPath = filters.catalog || process.env.CATALOG_PATH || defaultCatalog;

  let properties;
  try {
    properties = loadCatalog(catalogPath);
  } catch (err) {
    process.stderr.write(JSON.stringify({ error: 'Errore caricamento catalogo', details: err.message }) + '\n');
    process.exit(2);
  }

  const results = search(properties, filters);

  process.stdout.write(
    JSON.stringify(
      {
        results,
        count: results.length,
        disclaimer: DISCLAIMER,
      },
      null,
      2
    ) + '\n'
  );
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { search, loadCatalog, parseArgs, validateFilters, SORT_KEYS };
